import Conexion from "./Conexion.js";
import { state } from "./variablesGlobales.js";
import { movimientosUsuario } from "./movimientos.js";
const validarUsuario = async (usuario, contrasenia) => {
  let resultado = await con.getData(`auth?usuario=${usuario}&contrasenia=${contrasenia}`);
  return resultado;
}

let con = new Conexion();

/* --- elementos principales --- */
let registerForm = $('#registerForm'),
    loginForm = $('#loginForm'),
    introSection = $('#introSection'),
    mainSection = $('#mainContent'),
    showRegister = $('#showRegister'),
    showLogin = $('#showLogin'),
    navPanel = $('#navPanel'),
    userWelcome = $('#userWelcome'),
    logoutBtn = $('#logoutBtn');

function bootForUser(user) {
    $('#authSection').style.display = 'none';
    introSection.style.display = 'none';
    mainSection.style.display = 'block';
    navPanel.style.display = 'flex';
    userWelcome.textContent = `Hola, ${user}`;
    logoutBtn.style.display = 'inline-block';
    initApp(user);
    setActivePage('dashboard');
  }

  /* --- inicio de sesión --- */
loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const u = $('#loginUser'). value.trim(),
          p = $('#loginPass').value;

    try {
        await validarUsuario(u, p).then( usuario => {
            if (usuario.length > 0) {
                bootForUser(usuario[0].NombreCompleto);
                state.idUsuarioLogeado = usuario[0].UsuarioId;
                movimientosUsuario();
            } else {
                alert('Usuario o contraseña incorrectos');
                loginForm.reset();
            }           
        })
    } catch (err) {
        console.err(err);
        alert('Ocurrió un error en la autenticación');
    }
}); 


/* --- registro de usuario --- */
registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    let arregloUsuarios = [];
    
    const email = $('#regEmail').value.trim(),
        password = $('#regPass').value,
        userName = $('#regName').value,
        userPhone = $('#regPhone').value;

    if (!email || !password || !userName || !userPhone) return alert('Completa datos del formulario');

    try {
        arregloUsuarios = await validarUsuario(email, password);

        if (arregloUsuarios.length === 0) {
            const bodyData = { userName: userName, email: email, password: password, userPhone: userPhone };
            con.postData('users', bodyData);
            alert('Registrado con éxito. Ahora inicia sesión.');
            registerForm.reset();
            showLogin.click();
        } else {
            alert('Usuario ya existe');
            registerForm.reset();
            showLogin.click();
        }
        
    } catch (err) {
        console.error(err);
        alert('Ocurrió un error verificando el usuario');
    }

});

