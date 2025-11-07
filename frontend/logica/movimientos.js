import Conexion from "./Conexion.js";
import { state } from "./variablesGlobales.js";

/* --- elementos principales --- */
const selectType = $('#txType'),
      movimientosForm = $('#movimientosForm');

let con = new Conexion();

 // Obtener gastos
export const movimientosUsuario = async () => {
  const resultado = await con.getData(`movimientosusuario?idUsuarioLogeado=${state.idUsuarioLogeado}`);
  const list = $('#transactionsList'); list.innerHTML = '';

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
