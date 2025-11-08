// ---------- background: Three.js particles + smoky red bottom ----------
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0025);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 40;

// create 5000+ small fast particles
const count = 5500;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 200;      // x
  positions[i3+1] = Math.random() * 60 - 30;        // y
  positions[i3+2] = (Math.random() - 0.5) * 200;    // z

  // initial color: mix of metallic dark -> light red
  const t = Math.random();
  colors[i3]   = 1.0;            // r
  colors[i3+1] = Math.max(0, 0.05 * (1 - t)); // g tiny
  colors[i3+2] = Math.max(0, 0.02 * (1 - t)); // b tiny
}

const geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({
  size: 0.5,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  blending: THREE.AdditiveBlending,
});

const points = new THREE.Points(geom, mat);
scene.add(points);

// smoky red planes at bottom sides
function makeSmokePlane(x, rot){
  const g = new THREE.PlaneGeometry(160, 60, 1, 1);
  const tex = new THREE.TextureLoader().load(
    // tiny inline SVG smoke grain (red tone) to avoid external files
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='2' height='2'><rect width='2' height='2' fill='%23ff0000'/></svg>`)
  );
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent:true, opacity:0.06, depthWrite:false, blending:THREE.AdditiveBlending });
  const mesh = new THREE.Mesh(g, m);
  mesh.position.x = x;
  mesh.position.y = -18;
  mesh.rotation.z = rot;
  scene.add(mesh);
}
makeSmokePlane(-90, 0.25);
makeSmokePlane(90, -0.25);

// animation loop: fast upward movement for particles
const speeds = new Float32Array(count);
for (let i=0;i<count;i++) speeds[i] = 0.5 + Math.random() * 2.0; // fast

function animate(){
  requestAnimationFrame(animate);
  const positions = geom.attributes.position.array;
  const time = performance.now() * 0.002;
  for (let i=0;i<count;i++){
    const j = i*3;
    positions[j+1] += 0.01 * speeds[i]; // move up
    positions[j] += Math.sin(time + i) * 0.002; // slight x wobble
    positions[j+2] += Math.cos(time*0.5 + i) * 0.001; // z wobble

    // fade out & respawn at bottom if too high
    if (positions[j+1] > 80) {
      positions[j+1] = -40 - Math.random()*10;
      positions[j] = (Math.random()-0.5)*200;
      positions[j+2] = (Math.random()-0.5)*200;
    }
  }
  geom.attributes.position.needsUpdate = true;

  // color pulse (light -> dark)
  const colorArr = geom.attributes.color.array;
  for (let i=0;i<count;i++){
    const j = i*3;
    const t = (Math.sin(time*0.5 + i) + 1) * 0.5;
    colorArr[j] = 1.0;
    colorArr[j+1] = 0.02 * (1 - t);
    colorArr[j+2] = 0.01 * (1 - t);
  }
  geom.attributes.color.needsUpdate = true;

  points.rotation.y += 0.0008;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', ()=>{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ---------- UI: tokens, percent buttons, wallet menu (frontend only) ----------
const pctBtns = document.querySelectorAll('.pct');
let mockBalance = 12.34567;
pctBtns.forEach(b=>{
  b.addEventListener('click', ()=> {
    const p = Number(b.dataset.pct || 0);
    document.getElementById('fromInput').value = (mockBalance * (p/100)).toFixed(6);
  });
});
document.getElementById('maxBtn').addEventListener('click', ()=> {
  document.getElementById('fromInput').value = mockBalance.toFixed(6);
});

// tokens dropdown mock
const tokens = ['ETH','USDT','USDC','DEGI','BTC'];
function buildTokenMenu(elId, targetLabel) {
  const menu = document.getElementById('tokenMenu');
  menu.innerHTML = '';
  tokens.forEach(t=>{
    const div = document.createElement('div');
    div.className = 'token-item';
    div.textContent = t;
    div.style.padding = '8px';
    div.style.cursor = 'pointer';
    div.style.borderRadius = '6px';
    div.addEventListener('click', ()=>{
      document.getElementById(targetLabel).textContent = t;
      menu.style.display = 'none';
    });
    menu.appendChild(div);
  });
}
document.getElementById('fromTokenBtn').addEventListener('click', (e)=>{
  buildTokenMenu('tokenMenu','fromToken');
  const rect = e.target.getBoundingClientRect();
  const menu = document.getElementById('tokenMenu');
  menu.style.left = (rect.left)+'px';
  menu.style.top = (rect.bottom + 8)+'px';
  menu.style.display = 'block';
});
document.getElementById('toTokenBtn').addEventListener('click', (e)=>{
  buildTokenMenu('tokenMenu','toToken');
  const rect = e.target.getBoundingClientRect();
  const menu = document.getElementById('tokenMenu');
  menu.style.left = (rect.left)+'px';
  menu.style.top = (rect.bottom + 8)+'px';
  menu.style.display = 'block';
});
window.addEventListener('click', (ev)=>{ if(!ev.target.closest('.token-btn')) document.getElementById('tokenMenu').style.display='none'; });

// reverse
document.getElementById('reverseBtn').addEventListener('click', ()=>{
  const a = document.getElementById('fromToken').textContent;
  const b = document.getElementById('toToken').textContent;
  document.getElementById('fromToken').textContent = b;
  document.getElementById('toToken').textContent = a;
  const v = document.getElementById('fromInput').value;
  document.getElementById('fromInput').value = document.getElementById('toInput').value;
  document.getElementById('toInput').value = v;
});

// Wallet button + menu (frontend mock)
const connectBtn = document.getElementById('connectBtn');
const walletMenu = document.getElementById('walletMenu');
let connected = false;
connectBtn.addEventListener('click', ()=>{
  if(!connected){
    // mock connect: ask simple prompt for address
    const addr = prompt('Enter a mock address (or leave) to simulate connection', '0x12...F8A3');
    if(addr){
      connected = true;
      connectBtn.textContent = addr.slice(0,6)+'...'+addr.slice(-4);
      document.getElementById('doSwap').textContent = 'Swap';
    }
  } else {
    walletMenu.style.display = walletMenu.style.display === 'flex' ? 'none' : 'flex';
  }
});
document.getElementById('switchWallet').addEventListener('click', ()=>{
  walletMenu.style.display='none';
  connected = false;
  connectBtn.textContent = 'Connect Wallet';
  document.getElementById('doSwap').textContent = 'Connect Wallet';
});
document.getElementById('logoutBtn').addEventListener('click', ()=>{
  walletMenu.style.display='none';
  connected = false;
  connectBtn.textContent = 'Connect Wallet';
  document.getElementById('doSwap').textContent = 'Connect Wallet';
});

// when pressing swap (mock)
document.getElementById('doSwap').addEventListener('click', ()=>{
  if(!connected){ alert('Connect wallet first (mock).'); return; }
  const fromAmt = document.getElementById('fromInput').value || '0';
  const fromTok = document.getElementById('fromToken').textContent;
  const toTok = document.getElementById('toToken').textContent;
  alert(`(Mock) Swap ${fromAmt} ${fromTok} → ${toTok}`);
});
