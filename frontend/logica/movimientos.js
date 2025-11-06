import Conexion from "./Conexion.js";
import { state } from "./variablesGlobales.js";

/* --- elementos principales --- */
let selectType = $('#txType');
let con = new Conexion();

 // Obtener gastos
export const movimientosUsuario = async () => {
  let resultado = await con.getData(`movimientosusuario?idUsuarioLogeado=${state.idUsuarioLogeado}`);
  console.log('Movimientos Usuario:', resultado);
  return resultado;
}
  
  // Enviar nuevo gasto
//document.querySelector('#addTxBtn').addEventListener('click', async () => {
  // const tipo = document.querySelector('#txType').value;
  // const descripcion = document.querySelector('#txDesc').value;
  // const monto = parseFloat(document.querySelector('#txAmount').value);
  // const idUsuarioLogeado = state.idUsuarioLogeado;

  // try {
  //   await fetch('/api/movimientosusuario', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ tipo, descripcion, monto, idUsuarioLogeado })
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log('Gasto guardado:', data);
  //     // Aquí puedes actualizar la interfaz
  //   });
  // } catch (err) {
  //   console.error('Error al guardar el gasto:', err);
  // }
//});

    const list = $('#transactionsList'); list.innerHTML = '';
    // txs.slice(0, 8).forEach(tx => {
    //   const div = document.createElement('div');
    //   div.className = 'tx ' + (tx.type === 'in' ? 'in' : 'out');
    //   div.innerHTML = `
    //     <div>
    //       <strong>${tx.desc}</strong>
    //       <div class="muted small">${new Date(tx.date).toLocaleString()}</div>
    //     </div>
    //     <div style="text-align:right">
    //       <div>${currency(tx.amt)}</div>
    //       <div style="margin-top:6px">
    //         <button data-id="${tx.id}" class="btn secondary small delTx">Eliminar</button>
    //       </div>
    //     </div>`;
    //   list.appendChild(div);
    // });
