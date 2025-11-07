import Conexion from "./Conexion.js";
import { state } from "./variablesGlobales.js";

/* --- elementos principales --- */
const movimientosForm = $('#movimientosForm'),
      balanceMensual = $('#monthlyBalance');

let con = new Conexion();

 // Obtener gastos
export const movimientosUsuario = async () => {
  const resultado = await con.getData(`movimientosusuario?idUsuarioLogeado=${state.idUsuarioLogeado}`);
  const list = $('#transactionsList'); list.innerHTML = '';

  resultado.forEach(mov => {
    const div = document.createElement('div');
    const txItemClass = 'txItem ' + (mov.tipoMovimiento === 'Ingreso' ? 'income' : 'expense');
    div.className = 'txItem';
    div.className = txItemClass;
    div.innerHTML = `
      <div>
        <strong>${mov.nombreMovimiento}</strong>
        <div class="small">${new Date(mov.fechaMovimiento).toLocaleString()}</div>
      </div>
      <div style="text-align:right"
        <div>${currency(mov.valorMovimiento)}</div>
        <div style="margin-top:6px">
          <button data-id="${mov.idMovimiento}" class="btn secondary small delTx">Eliminar</button>
        </div>
      </div>`;
    list.appendChild(div);    
  });

    // eliminar movimiento
  $all('.delTx').forEach(b => b.addEventListener('click', async() => {
    const idMovimiento = b.getAttribute('data-id');
    if (!idMovimiento) return;

    try {
      // build path without leading slash to avoid double-slash issues
      let path = `deleteMovimientos/${encodeURIComponent(idMovimiento)}`;
      // include owner check if available
      if (window.currentUserId || state.idUsuarioLogeado) {
        const owner = window.currentUserId || state.idUsuarioLogeado;
        path += `?idUsuarioLogeado=${encodeURIComponent(owner)}`;
      }

      await con.deleteData(path);
      alert('Movimiento eliminado con éxito');
      movimientosUsuario();
    } catch (err) {
      alert('Error al eliminar el movimiento: ' + err.message);
    }
  }));

  renderDashboard(resultado);
}

function renderDashboard(movimientosUsuario) {
  const totalIncome = movimientosUsuario.filter(t => t.tipoMovimiento === 'Ingreso').reduce((s, t) => s + t.valorMovimiento, 0);
  const totalOut = movimientosUsuario.filter(t => t.tipoMovimiento === 'Gasto').reduce((s, t) => s + t.valorMovimiento, 0);
  const balance = totalIncome - totalOut;
  balanceMensual.textContent = currency(balance);

  drawPie('pieChart', movimientosUsuario);
  drawBar('barChart', totalIncome, totalOut);
}
  
// Enviar nuevo gasto
movimientosForm.addEventListener('submit', async e => {
  e.preventDefault();

  const tipo = $('#txType').value,
        descripcion = $('#txDesc').value,
        monto = $('#txAmount').value,
        idUsuarioLogeado =state.idUsuarioLogeado;
  
  try {
    const bodyData = { tipo, descripcion, monto, idUsuarioLogeado };
    con.postData('movimientosusuario', bodyData);
    alert('Movimiento guardado con éxito');
    movimientosForm.reset();
    movimientosUsuario();
  } catch (err) {
    console.error('Error al guardar el movimiento:', err);
  }
});

export const buscarTipoMovimiento = async (nombreMovimiento) => {
  const resultado = await con.getData(`busquedamovimientos?idUsuarioLogeado=${state.idUsuarioLogeado}&nombreMovimiento=${nombreMovimiento}`);
  const list = $('#transactionsFull'); list.innerHTML = '';
  resultado.forEach(mov => {
  const div = document.createElement('div');
      div.className = 'tx' + (mov.tipoMovimiento === 'Ingreso' ? 'in' : 'out');
      div.innerHTML = `
        <div>
          <strong>${mov.nombreMovimiento}</strong>
          <div class="muted small">${new Date(mov.fechaMovimiento).toLocaleString()}</div>
        </div>
        <div style="text-align:right">
          <div>${currency(mov.valorMovimiento)}</div>
          <div style="margin-top:6px">
            <button data-id="${mov.id}" class="btn secondary small delTx">Eliminar</button>
          </div>
        </div>`;
      list.appendChild(div);
  });
}

document.getElementById("searchTx").addEventListener("keyup", function(event) {
  buscarTipoMovimiento(event.target.value);
});

function drawPie(canvasId, movimientos) {
  const pieCanvasId = document.getElementById(canvasId);

  if (!pieCanvasId) return;
  const ctx = pieCanvasId.getContext('2d');
  ctx.clearRect(0, 0, pieCanvasId.width, pieCanvasId.height);

  const income = movimientos.filter(t => t.tipoMovimiento === 'Ingreso').reduce((s, t) => s + t.valorMovimiento, 0);
  const out = movimientos.filter(t => t.tipoMovimiento === 'Gasto').reduce((s, t) => s + t.valorMovimiento, 0);
  const total = income + out;
  const cx = pieCanvasId.width / 2, cy = pieCanvasId.height / 2, r = Math.min(cx, cy) - 8;
  let start = -Math.PI / 2;

  const slices = [
    { v: income, color: '#008000', label: 'Ingresos' },
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
  const barCanvasId = document.getElementById(canvasId);
  if (!barCanvasId) return;
  const ctx = barCanvasId.getContext('2d');
  ctx.clearRect(0, 0, barCanvasId.width, barCanvasId.height);
  const max = Math.max(inc, out, 1);
  const w = barCanvasId.width, h = barCanvasId.height;
  const pad = 12, bw = 50;
  const incH = (inc / max) * (h - pad * 2);
  const outH = (out / max) * (h - pad * 2);
  ctx.fillStyle = '#008000';
  ctx.fillRect(pad, h - pad - incH, bw, incH);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(pad + bw + 20, h - pad - outH, bw, outH);
  ctx.fillStyle = '#0b1220';
  ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Ingresos', pad + bw / 2, h - 2);
  ctx.fillText('Gastos', pad + bw + 20 + bw / 2, h - 2);
}
