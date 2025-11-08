import React, {useEffect, useState} from 'react'
import { motion } from 'framer-motion'
import WalletModal from './WalletModal'

export default function SwapCard(){
  const [from, setFrom] = useState('ETH')
  const [to, setTo] = useState('DEGI')
  const [fromAmt, setFromAmt] = useState('')
  const [toAmt, setToAmt] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(()=>{
    const handler = ()=> setModalOpen(true)
    window.addEventListener('openWalletModal', handler)
    return ()=> window.removeEventListener('openWalletModal', handler)
  },[])

  const pctSet = (pct) =>{
    // mock balance
    const balance = 12.345678
    const v = (balance * (pct/100)).toFixed(6)
    setFromAmt(v)
  }

  return (
    <>
      <WalletModal open={modalOpen} onClose={()=> setModalOpen(false)} />
      <motion.div className="card" initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
        <h3 className="swap-title">Swap</h3>
        <div className="subtitle">Trade tokens instantly</div>

        <div className="row-box">
          <input value={fromAmt} onChange={e=> setFromAmt(e.target.value)} placeholder="0.0" />
          <div className="token-select" onClick={()=> window.dispatchEvent(new CustomEvent('openFromTokens'))}>{from} ▾</div>
        </div>

        <div className="pct-row">
          {[10,25,50,70,100].map(p=>(
            <button key={p} className="pct" onClick={()=> pctSet(p)}>{p}%</button>
          ))}
          <button className="pct" onClick={()=> pctSet(100)}>MAX</button>
        </div>

        <div className="row-box">
          <input value={toAmt} onChange={e=> setToAmt(e.target.value)} placeholder="0.0" />
          <div className="token-select" onClick={()=> window.dispatchEvent(new CustomEvent('openToTokens'))}>{to} ▾</div>
        </div>

        <div className="swap-action">
          <div className="reverse" onClick={()=>{
            setFrom(prev=> { const t = to; setTo(prev); return t})
            setFromAmt(prev=> { const v = toAmt; setToAmt(prev); return v})
          }}>⇅</div>
          <button className="swap-btn">Swap</button>
        </div>
      </motion.div>
    </>
  )
}
