// app.js - wallet connect basic demo

const connectBtn = document.getElementById('connect-btn') || document.getElementById('connect-btn-app');
const modal = document.getElementById('wallet-modal');
const modalClose = document.getElementById('modal-close') || document.getElementById('modal-close-app');
const walletItems = document.querySelectorAll('.wallet-item');
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

function openModal() { if (modal) modal.setAttribute('aria-hidden', 'false'); }
function closeModal() { if (modal) modal.setAttribute('aria-hidden', 'true'); }

connectBtn && connectBtn.addEventListener('click', openModal);
modalClose && modalClose.addEventListener('click', closeModal);

walletItems.forEach(btn => btn.addEventListener('click', async () => {
  const id = btn.getAttribute('data-wallet');
  try {
    if (id === 'metamask') await connectMetaMask();
    else if (id === 'phantom') await connectPhantom();
    else alert(`${id} integration coming soon`);
  } catch (err) {
    alert('Error: ' + err.message);
  }
  closeModal();
}));

async function connectMetaMask() {
  if (!window.ethereum) return alert('MetaMask not detected');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const addr = accounts[0];
  setConnected(shorten(addr));
}

async function connectPhantom() {
  const provider = window.solana && window.solana.isPhantom ? window.solana : null;
  if (!provider) return alert('Phantom not found');
  const resp = await provider.connect();
  const pubkey = resp.publicKey.toString();
  setConnected(shorten(pubkey));
}

function shorten(addr) { return addr.slice(0, 6) + '...' + addr.slice(-4); }

function setConnected(text) {
  const btns = document.querySelectorAll('.connect-btn');
  btns.forEach(b => {
    b.textContent = text;
    b.disabled = true;
    b.classList.add('connected');
  });
}

window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
