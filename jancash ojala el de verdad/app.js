/* ======================================================
   JANCASH - Aplicación de finanzas personales (localStorage)
   ====================================================== */

const storage = {
  usersKey: 'jancash_users_v1',
  currentKey: 'jancash_current_v1',
  txKey: (user) => `jancash_tx_${user}_v1`,
  goalsKey: (user) => `jancash_goals_${user}_v1`
};

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

/* --- elementos principales --- */
const loginForm = $('#loginForm'),
      registerForm = $('#registerForm'),
      showRegister = $('#showRegister'),
      showLogin = $('#showLogin'),
      navPanel = $('#navPanel'),
      userWelcome = $('#userWelcome'),
      logoutBtn = $('#logoutBtn');

/* --- alternar entre login y registro --- */
showRegister.onclick = () => { 
  loginForm.style.display = 'none'; 
  registerForm.style.display = 'block'; 
};
showLogin.onclick = () => { 
  registerForm.style.display = 'none'; 
  loginForm.style.display = 'block'; 
};

/* --- manejo de usuarios --- */
function loadUsers() {
  try { return JSON.parse(localStorage.getItem(storage.usersKey) || '[]'); }
  catch (e) { return []; }
}
function saveUsers(users) {
  localStorage.setItem(storage.usersKey, JSON.stringify(users));
}

/* --- registro de usuario --- */
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  const u = $('#regUser').value.trim(),
        p = $('#regPass').value;
  if (!u || !p) return alert('Completa usuario y contraseña');
  const users = loadUsers();
  if (users.find(x => x.user === u)) return alert('Usuario ya existe');
  users.push({ user: u, pass: p });
  saveUsers(users);
  alert('Registrado con éxito. Ahora inicia sesión.');
  registerForm.reset();
  showLogin.click();
});

/* --- inicio de sesión --- */
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const u = $('#loginUser').value.trim(),
        p = $('#loginPass').value;
  const users = loadUsers();
  const found = users.find(x => x.user === u && x.pass === p);
  if (!found) return alert('Usuario o contraseña incorrectos');
  localStorage.setItem(storage.currentKey, u);
  bootForUser(u);
});

/* --- cerrar sesión --- */
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(storage.currentKey);
  location.reload();
});

/* --- iniciar la app si hay usuario activo --- */
const current = localStorage.getItem(storage.currentKey);
if (current) bootForUser(current);

function bootForUser(user) {
  $('#authSection').style.display = 'none';
  navPanel.style.display = 'flex';
  userWelcome.textContent = `Hola, ${user}`;
  logoutBtn.style.display = 'inline-block';
  initApp(user);
  setActivePage('dashboard');
}

/* --- navegación entre secciones --- */
$all('nav.side button').forEach(btn => {
  btn.addEventListener('click', () => setActivePage(btn.dataset.page));
});

function setActivePage(page) {
  $all('nav.side button').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  $all('#mainContent > section').forEach(s => s.style.display = s.id === 'page-' + page ? 'block' : 'none');
  if (page === 'dashboard') renderDashboard();
  if (page === 'movimientos') renderFullTransactions();
  if (page === 'metas') renderGoals();
}

/* --- helpers de datos --- */
function loadTxs(user) { return JSON.parse(localStorage.getItem(storage.txKey(user)) || '[]'); }
function saveTxs(user, arr) { localStorage.setItem(storage.txKey(user), JSON.stringify(arr)); }
function loadGoals(user) { return JSON.parse(localStorage.getItem(storage.goalsKey(user)) || '[]'); }
function saveGoals(user, arr) { localStorage.setItem(storage.goalsKey(user), JSON.stringify(arr)); }
function currency(n) { return '$' + Number(n || 0).toLocaleString('es-CO'); }

/* --- inicializar estructuras vacías --- */
function initApp(user) {
  if (!localStorage.getItem(storage.txKey(user))) saveTxs(user, []);
  if (!localStorage.getItem(storage.goalsKey(user))) saveGoals(user, []);
  renderDashboard();
}

/* ======================================================
   MOVIMIENTOS (ingresos/egresos)
   ====================================================== */

$('#addTxBtn').addEventListener('click', () => {
  const type = $('#txType').value,
        desc = $('#txDesc').value.trim(),
        amt = parseFloat($('#txAmount').value),
        u = localStorage.getItem(storage.currentKey);
  if (!u) return alert('Inicia sesión');
  if (!desc || !amt || amt <= 0) return alert('Descripción y monto válidos');
  const tx = { id: Date.now(), type, desc, amt, date: new Date().toISOString() };
  const txs = loadTxs(u); txs.unshift(tx); saveTxs(u, txs);
  $('#txDesc').value = ''; $('#txAmount').value = '';
  renderDashboard();
});

/* --- render principal --- */
function renderDashboard() {
  const u = localStorage.getItem(storage.currentKey);
  if (!u) return;
  const txs = loadTxs(u);
  const totalIncome = txs.filter(t => t.type === 'in').reduce((s, t) => s + t.amt, 0);
  const totalOut = txs.filter(t => t.type === 'out').reduce((s, t) => s + t.amt, 0);
  const balance = totalIncome - totalOut;

  $('#balanceDisplay').textContent = currency(balance);
  $('#monthlyBalance').textContent = currency(balance);
  $('#totalIncome').textContent = 'Ingresos: ' + currency(totalIncome);
  $('#totalExpenses').textContent = 'Gastos: ' + currency(totalOut);

  // movimientos recientes
  const list = $('#transactionsList'); list.innerHTML = '';
  txs.slice(0, 8).forEach(tx => {
    const div = document.createElement('div');
    div.className = 'tx ' + (tx.type === 'in' ? 'in' : 'out');
    div.innerHTML = `
      <div>
        <strong>${tx.desc}</strong>
        <div class="muted small">${new Date(tx.date).toLocaleString()}</div>
      </div>
      <div style="text-align:right">
        <div>${currency(tx.amt)}</div>
        <div style="margin-top:6px">
          <button data-id="${tx.id}" class="btn secondary small delTx">Eliminar</button>
        </div>
      </div>`;
    list.appendChild(div);
  });

  // eliminar movimiento
  $all('.delTx').forEach(b => b.addEventListener('click', () => {
    const id = Number(b.dataset.id);
    const filtered = txs.filter(t => t.id !== id);
    saveTxs(u, filtered); renderDashboard();
  }));

  renderGoalsQuick(u);
  renderAlerts(u, totalIncome, totalOut, txs);
  drawPie('pieChart', txs);
  drawBar('barChart', totalIncome, totalOut);
}

/* --- búsqueda de movimientos --- */
$('#searchTx').addEventListener('input', renderFullTransactions);
function renderFullTransactions() {
  const u = localStorage.getItem(storage.currentKey);
  if (!u) return;
  const txs = loadTxs(u);
  const q = $('#searchTx').value.trim().toLowerCase();
  const area = $('#transactionsFull'); area.innerHTML = '';
  txs.filter(t => t.desc.toLowerCase().includes(q)).forEach(tx => {
    const div = document.createElement('div');
    div.className = 'tx ' + (tx.type === 'in' ? 'in' : 'out');
    div.innerHTML = `
      <div><strong>${tx.desc}</strong><div class="muted small">${new Date(tx.date).toLocaleString()}</div></div>
      <div style="text-align:right">${currency(tx.amt)}
      <div style="margin-top:6px"><button data-id="${tx.id}" class="btn secondary small delTxFull">Eliminar</button></div></div>`;
    area.appendChild(div);
  });

  $all('.delTxFull').forEach(b => b.addEventListener('click', () => {
    const id = Number(b.dataset.id);
    const filtered = txs.filter(t => t.id !== id);
    saveTxs(u, filtered);
    renderFullTransactions(); renderDashboard();
  }));
}

/* ======================================================
   METAS FINANCIERAS
   ====================================================== */

$('#createGoalBtn').addEventListener('click', () => {
  const u = localStorage.getItem(storage.currentKey);
  if (!u) return alert('Inicia sesión');
  const name = $('#goalName').value.trim(),
        target = parseFloat($('#goalTarget').value),
        current = parseFloat($('#goalCurrent').value || 0);
  if (!name || !target || target <= 0) return alert('Nombre y monto válidos');
  const goals = loadGoals(u);
  goals.push({ id: Date.now(), name, target, current });
  saveGoals(u, goals);
  $('#goalName').value = ''; $('#goalTarget').value = ''; $('#goalCurrent').value = 0;
  renderGoals(); renderDashboard();
});

function renderGoalsQuick(u) {
  const goals = loadGoals(u);
  const goalsList = $('#goalsList'); goalsList.innerHTML = '';
  goals.slice(0, 3).forEach(g => {
    const percent = Math.min(100, Math.round((g.current / g.target) * 100 || 0));
    const d = document.createElement('div');
    d.className = 'goal';
    d.innerHTML = `
      <div>
        <strong>${g.name}</strong>
        <div class="muted small">${currency(g.current)} / ${currency(g.target)} — ${percent}%</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button data-id="${g.id}" class="btn small addToGoal">+ Ahorro</button>
        <button data-id="${g.id}" class="btn small secondary delGoal">Eliminar</button>
      </div>`;
    goalsList.appendChild(d);
  });

  $all('.addToGoal').forEach(b => b.addEventListener('click', () => {
    const id = Number(b.dataset.id);
    const amount = parseFloat(prompt('¿Cuánto añadir a la meta?'));
    if (isNaN(amount) || amount <= 0) return alert('Monto inválido');
    const goals = loadGoals(u);
    const g = goals.find(x => x.id === id);
    g.current += amount;
    saveGoals(u, goals);
    renderDashboard(); renderGoals();
  }));

  $all('.delGoal').forEach(b => b.addEventListener('click', () => {
    const id = Number(b.dataset.id);
    if (!confirm('¿Eliminar meta?')) return;
    const goals = loadGoals(u).filter(x => x.id !== id);
    saveGoals(u, goals);
    renderDashboard(); renderGoals();
  }));
}

function renderGoals() {
  const u = localStorage.getItem(storage.currentKey);
  if (!u) return;
  const goals = loadGoals(u);
  const area = $('#allGoalsArea'); area.innerHTML = '';
  if (goals.length === 0) area.innerHTML = '<div class="muted small">No tienes metas aún.</div>';
  goals.forEach(g => {
    const pct = Math.min(100, Math.round((g.current / g.target) * 100 || 0));
    const el = document.createElement('div');
    el.className = 'goal';
    el.innerHTML = `
      <div><strong>${g.name}</strong>
      <div class="muted small">${currency(g.current)} de ${currency(g.target)} — ${pct}%</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button data-id="${g.id}" class="btn small addToGoalPage">+ Ahorro</button>
        <button data-id="${g.id}" class="btn small secondary delGoalPage">Eliminar</button>
      </div>`;
    area.appendChild(el);
  });

  $all('.addToGoalPage').forEach(b => b.addEventListener('click', () => {
    const id = Number(b.dataset.id);
    const v = parseFloat(prompt('Monto a añadir:'));
    if (isNaN(v) || v <= 0) return alert('Monto inválido');
    const goals = loadGoals(u);
    const g = goals.find(x => x.id === id);
    g.current += v;
    saveGoals(u, goals);
    renderGoals(); renderDashboard();
  }));

  $all('.delGoalPage').forEach(b => b.addEventListener('click', () => {
    const id = Number(b.dataset.id);
    if (!confirm('¿Eliminar meta?')) return;
    const filtered = loadGoals(u).filter(x => x.id !== id);
    saveGoals(u, filtered);
    renderGoals(); renderDashboard();
  }));
}

/* ======================================================
   REPORTES / ALERTAS
   ====================================================== */

function renderAlerts(u, totalIncome, totalOut, txs) {
  const alertsArea = $('#alertsArea');
  alertsArea.innerHTML = '';
  if (totalOut > totalIncome && totalOut > 0) {
    alertsArea.innerHTML = `<div class="card" style="margin-top:8px;border-left:4px solid var(--danger);padding:8px">
      <strong>Alerta:</strong> Tus gastos superan tus ingresos.</div>`;
  } else if (txs.length > 0) {
    alertsArea.innerHTML = `<div class="card" style="margin-top:8px;border-left:4px solid var(--accent);padding:8px">
      <strong>Estado:</strong> Tus finanzas están balanceadas.</div>`;
  }
}

/* ======================================================
   EXPORTAR / BORRAR DATOS
   ====================================================== */

$('#exportBtn').addEventListener('click', () => {
  const u = localStorage.getItem(storage.currentKey);
  if (!u) return alert('Inicia sesión');
  const data = { txs: loadTxs(u), goals: loadGoals(u) };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `jancash_export_${u}.json`; a.click();
  URL.revokeObjectURL(url);
});

$('#clearDataBtn').addEventListener('click', () => {
  const u = localStorage.getItem(storage.currentKey);
  if (!u) return;
  if (!confirm('¿Borrar todos tus datos locales?')) return;
  saveTxs(u, []); saveGoals(u, []);
  renderDashboard(); renderGoals();
  alert('Datos borrados correctamente.');
});

/* ======================================================
   GRÁFICOS SIMPLES (Canvas)
   ====================================================== */

function drawPie(canvasId, txs) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const income = txs.filter(t => t.type === 'in').reduce((s, t) => s + t.amt, 0);
  const out = txs.filter(t => t.type === 'out').reduce((s, t) => s + t.amt, 0);
  const total = income + out;
  const cx = canvas.width / 2, cy = canvas.height / 2, r = Math.min(cx, cy) - 8;
  let start = -Math.PI / 2;
  const slices = [
    { v: income, color: '#00a86b', label: 'Ingresos' },
    { v: out, color: '#ef4444', label: 'Gastos' }
  ].filter(s => s.v > 0);

  if (slices.length === 0) {
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Sin datos', cx, cy);
    return;
  }

  slices.forEach(s => {
    const angle = (s.v / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.fillStyle = s.color;
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath(); ctx.fill();
    start += angle;
  });
}

function drawBar(canvasId, inc, out) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const max = Math.max(inc, out, 1);
  const w = c.width, h = c.height;
  const pad = 12, bw = 50;
  const incH = (inc / max) * (h - pad * 2);
  const outH = (out / max) * (h - pad * 2);
  ctx.fillStyle = '#00a86b';
  ctx.fillRect(pad, h - pad - incH, bw, incH);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(pad + bw + 20, h - pad - outH, bw, outH);
  ctx.fillStyle = '#0b1220';
  ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Ingresos', pad + bw / 2, h - 2);
  ctx.fillText('Gastos', pad + bw + 20 + bw / 2, h - 2);
}

/* ======================================================
   SINCRONIZACIÓN ENTRE PESTAÑAS
   ====================================================== */
window.addEventListener('storage', e => {
  const currentUser = localStorage.getItem(storage.currentKey);
  if (currentUser) renderDashboard();
});
