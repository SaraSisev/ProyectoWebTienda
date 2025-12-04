// front/app.js

const API_URL = 'http://localhost:5000/api';

let currentCaptchaId = null;
let selectedImages = [];

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const loginModal = document.getElementById('loginModal');
const registroModal = document.getElementById('registroModal');
const loginBtn = document.getElementById('loginBtn');
const registrarBtn = document.getElementById('registrarBtn');
const closeModalLogin = document.getElementById('closeModalLogin');
const closeModalRegistro = document.getElementById('closeModalRegistro');
const linkRegistro = document.getElementById('linkRegistro');
const linkLogin = document.getElementById('linkLogin');
const formRegistro = document.getElementById('formRegistro');
const formLogin = document.getElementById('formLogin');
const refreshCaptcha = document.getElementById('refreshCaptcha');
const formContacto = document.getElementById('contactForm');

// ============================================
// CARGAR PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  checkSession();

  const formContacto = document.getElementById('contactForm');
  contacto(formContacto);
});

// ============================================
// VERIFICAR SESIÓN
// ============================================
function checkSession() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  
  if (token && userName) {
    updateUILoggedIn(userName);
  } else {
    updateUILoggedOut();
  }
}

// ============================================
// ABRIR Y CERRAR MODALES
// ============================================

loginBtn.addEventListener('click', () => {
  loginModal.style.display = 'block';
  registroModal.style.display = 'none';
  loadCaptcha();
});

registrarBtn.addEventListener('click', () => {
  registroModal.style.display = 'block';
  loginModal.style.display = 'none';
});

closeModalLogin.addEventListener('click', () => {
  loginModal.style.display = 'none';
  resetLoginForm();
});

closeModalRegistro.addEventListener('click', () => {
  registroModal.style.display = 'none';
});

if (linkRegistro) {
  linkRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registroModal.style.display = 'block';
  });
}

if (linkLogin) {
  linkLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registroModal.style.display = 'none';
    loginModal.style.display = 'block';
    loadCaptcha();
  });
}

window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
    resetLoginForm();
  }
  if (e.target === registroModal) {
    registroModal.style.display = 'none';
  }
});

// ============================================
// CAPTCHA
// ============================================

if (refreshCaptcha) {
  refreshCaptcha.addEventListener('click', () => {
    loadCaptcha();
  });
}

async function loadCaptcha() {
  const questionLabel = document.getElementById('captchaQuestion');
  const gridContainer = document.getElementById('captchaGrid');
  
  try {
    questionLabel.textContent = "Cargando CAPTCHA...";
    gridContainer.innerHTML = '<div class="captcha-loading">⏳ Cargando imágenes...</div>';
    selectedImages = [];

    const response = await fetch(`${API_URL}/auth/captcha/generate`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    
    currentCaptchaId = data.captchaId;
    questionLabel.textContent = data.question;
    
    // Crear la cuadrícula de imágenes
    gridContainer.innerHTML = '';
    data.images.forEach((imageUrl, index) => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'captcha-image-container';
      imgContainer.dataset.index = index;
      
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = `Imagen ${index + 1}`;
      img.className = 'captcha-image';
      
      const overlay = document.createElement('div');
      overlay.className = 'captcha-overlay';
      
      imgContainer.appendChild(img);
      imgContainer.appendChild(overlay);
      
      imgContainer.onclick = function() {
        toggleImageSelection(index, imgContainer);
      };
      
      gridContainer.appendChild(imgContainer);
    });

    console.log('[CAPTCHA] Cargado exitosamente:', data.captchaId);

  } catch (error) {
    console.error('[CAPTCHA ERROR]', error);
    questionLabel.textContent = "❌ Error al cargar CAPTCHA";
    gridContainer.innerHTML = '<div class="captcha-error">No se pudo cargar el CAPTCHA</div>';
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar el CAPTCHA. Verifica tu conexión.',
      confirmButtonColor: '#667eea'
    });
  }
}

function toggleImageSelection(index, container) {
  const indexPos = selectedImages.indexOf(index);
  
  if (indexPos > -1) {
    selectedImages.splice(indexPos, 1);
    container.classList.remove('selected');
  } else {
    selectedImages.push(index);
    container.classList.add('selected');
  }
  
  console.log('[CAPTCHA] Imágenes seleccionadas:', selectedImages);
}

function resetLoginForm() {
  const loginInput = document.getElementById("login");
  const passInput = document.getElementById("password");
  const gridContainer = document.getElementById('captchaGrid');
  
  if (loginInput) loginInput.value = "";
  if (passInput) passInput.value = "";
  if (gridContainer) gridContainer.innerHTML = '';
  
  selectedImages = [];
  currentCaptchaId = null;
  
  const questionLabel = document.getElementById('captchaQuestion');
  if (questionLabel) questionLabel.textContent = "Cargando CAPTCHA...";
}

// ============================================
// LOGIN
// ============================================

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const cuenta = document.getElementById("login").value.trim();
  const contrasena = document.getElementById("password").value;

  if (!currentCaptchaId) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, carga el CAPTCHA primero',
      confirmButtonColor: '#667eea'
    });
    return;
  }

  if (selectedImages.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Selección requerida',
      text: 'Por favor, selecciona las imágenes correctas del CAPTCHA',
      confirmButtonColor: '#667eea'
    });
    return;
  }

  console.log('[LOGIN] Enviando solicitud...');

  // Mostrar loading
  Swal.fire({
    title: 'Iniciando sesión...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cuenta: cuenta,
        contrasena: contrasena,
        captchaId: currentCaptchaId,
        captchaAnswer: selectedImages
      })
    });

    const data = await response.json();

    if (data.success) {
  // Login exitoso
  localStorage.setItem('token', data.token);
  localStorage.setItem('userName', data.usuario.nombre);
  localStorage.setItem('userRole', data.usuario.rol);
  localStorage.setItem('userId', data.usuario.id);

  // ✨ NUEVO: Verificar si es admin
  if (data.usuario.rol === 'admin') {
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido Administrador!',
      text: `Hola ${data.usuario.nombre}, serás redirigido al panel de administrador`,
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      // Redirigir a panel de admin
      window.location.href = 'admin.html';
    });
  } else {
    // Usuario normal
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `Hola ${data.usuario.nombre}`,
      timer: 2000,
      showConfirmButton: false
    });

    updateUILoggedIn(data.usuario.nombre);
    loginModal.style.display = 'none';
    resetLoginForm();
  }
    } else {
      // Error en login
      console.log('[LOGIN] Error:', data);

      let errorMessage = data.message || data.error || 'Error desconocido';
      
      if (errorMessage.includes('CAPTCHA')) {
        Swal.fire({
          icon: 'error',
          title: '❌ CAPTCHA Inválido',
          text: 'Selección incorrecta. Intenta nuevamente.',
          confirmButtonColor: '#667eea'
        });
      } else if (errorMessage.includes('bloqueada')) {
        Swal.fire({
          icon: 'error',
          title: '🔒 Cuenta Bloqueada',
          text: errorMessage,
          confirmButtonColor: '#667eea'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#667eea'
        });
      }

      // Recargar CAPTCHA
      loadCaptcha();
      
      // Limpiar contraseña
      document.getElementById("password").value = "";
    }

  } catch (error) {
    console.error('[LOGIN] Error de conexión:', error);
    
    Swal.fire({
      icon: 'error',
      title: 'Error de Conexión',
      text: 'No se pudo conectar con el servidor.',
      confirmButtonColor: '#667eea'
    });

    loadCaptcha();
  }
});

// ============================================
// REGISTRO (código anterior)
// ============================================

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
const nombre = document.getElementById('regNombre').value.trim();
const nombrecuenta = document.getElementById('regNombreCuenta').value.trim();
const correo = document.getElementById('regCorreo').value.trim();
const contrasena = document.getElementById('regContrasena').value;
const contrasena2 = document.getElementById('regContrasena2').value;
const pais = document.getElementById('regPais').value;
if (!nombre || !nombrecuenta || !correo || !contrasena || !contrasena2 || !pais) {
Swal.fire({
icon: 'error',
title: 'Campos incompletos',
text: 'Por favor completa todos los campos',
confirmButtonColor: '#667eea'
});
return;
}
if (contrasena !== contrasena2) {
Swal.fire({
icon: 'error',
title: 'Error',
text: 'Las contraseñas no coinciden',
confirmButtonColor: '#667eea'
});
return;
}
if (contrasena.length < 6) {
Swal.fire({
icon: 'error',
title: 'Contraseña débil',
text: 'La contraseña debe tener al menos 6 caracteres',
confirmButtonColor: '#667eea'
});
return;
}
Swal.fire({
title: 'Registrando usuario...',
text: 'Por favor espera',
allowOutsideClick: false,
didOpen: () => {
Swal.showLoading();
}
});
try {
const response = await fetch(`${API_URL}/auth/registro`, {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({
nombre,
nombrecuenta,
correo,
contrasena,
contrasena2,
pais
})
});
const data = await response.json();

if (data.success) {
  Swal.fire({
    icon: 'success',
    title: '¡Registro exitoso!',
    text: data.message,
    confirmButtonColor: '#667eea'
  }).then(() => {
    registroModal.style.display = 'none';
    formRegistro.reset();
    loginModal.style.display = 'block';
    document.getElementById('login').value = nombrecuenta;
    loadCaptcha();
  });
} else {
  Swal.fire({
    icon: 'error',
    title: 'Error en el registro',
    text: data.message,
    confirmButtonColor: '#667eea'
  });
}
} catch (error) {
console.error('Error:', error);
Swal.fire({
icon: 'error',
title: 'Error de conexión',
text: 'No se pudo conectar con el servidor.',
confirmButtonColor: '#667eea'
});
}
});

// ============================================
// LOGOUT
// ============================================

const logoutBtn = document.getElementById('logoutBtn');
const authButtons = document.getElementById('auth-buttons');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  });
}

function logout() {
  // Limpiar localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  
  // Mostrar mensaje
  Swal.fire({
    icon: 'success',
    title: 'Sesión cerrada',
    text: 'Has cerrado sesión exitosamente',
    timer: 1500,
    showConfirmButton: false
  });
  
  // Actualizar UI
  updateUILoggedOut();
}

// RECUPERACIÓN DE CONTRASEÑA
const linkOlvideContrasena = document.getElementById('linkOlvideContrasena');

if (linkOlvideContrasena) {
    linkOlvideContrasena.addEventListener('click', async (e) => {
        e.preventDefault();

        // Paso 1: Solicitar correo
        const { value: correo } = await Swal.fire({
            title: '🔑 Recuperar Contraseña',
            text: 'Ingresa tu correo electrónico',
            input: 'email',
            inputPlaceholder: 'tu@correo.com',
            showCancelButton: true,
            confirmButtonText: 'Enviar Código',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#667eea',
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes ingresar un correo';
                }
            }
        });

        if (!correo) return;

        // Enviar solicitud
        Swal.fire({
            title: 'Enviando código...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const response = await fetch(`${API_URL}/auth/recuperacion/solicitar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });

            const data = await response.json();

            if (!data.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message,
                    confirmButtonColor: '#667eea'
                });
                return;
            }

            // Paso 2: Solicitar código y nueva contraseña
            const { value: formValues } = await Swal.fire({
                title: '📧 Código Enviado',
                html: `
                    <p style="margin-bottom: 20px;">Revisa tu correo e ingresa el código de 6 dígitos</p>
                    <input id="swal-codigo" class="swal2-input" placeholder="Código (ej: 123456)" 
                           maxlength="6" pattern="[0-9]{6}" style="font-size: 24px; text-align: center; letter-spacing: 5px;">
                    <input id="swal-nueva" class="swal2-input" type="password" placeholder="Nueva contraseña (mín. 6 caracteres)">
                    <input id="swal-confirmar" class="swal2-input" type="password" placeholder="Confirmar contraseña">
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Restablecer',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#667eea',
                preConfirm: () => {
                    const codigo = document.getElementById('swal-codigo').value;
                    const nueva = document.getElementById('swal-nueva').value;
                    const confirmar = document.getElementById('swal-confirmar').value;

                    if (!codigo || codigo.length !== 6) {
                        Swal.showValidationMessage('El código debe tener 6 dígitos');
                        return false;
                    }
                    if (!nueva || nueva.length < 6) {
                        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
                        return false;
                    }
                    if (nueva !== confirmar) {
                        Swal.showValidationMessage('Las contraseñas no coinciden');
                        return false;
                    }

                    return { codigo, nuevaContrasena: nueva, confirmarContrasena: confirmar };
                }
            });

            if (!formValues) return;

            // Paso 3: Enviar código y nueva contraseña
            Swal.fire({
                title: 'Restableciendo...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const responseReset = await fetch(`${API_URL}/auth/recuperacion/restablecer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formValues)
            });

            const dataReset = await responseReset.json();

            if (dataReset.success) {
                Swal.fire({
                    icon: 'success',
                    title: '✅ ¡Contraseña Restablecida!',
                    text: 'Ya puedes iniciar sesión con tu nueva contraseña',
                    confirmButtonColor: '#667eea'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: dataReset.message,
                    confirmButtonColor: '#667eea'
                });
            }

        } catch (error) {
            console.error('[ERROR]', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo procesar la solicitud',
                confirmButtonColor: '#667eea'
            });
        }
    });
}

function updateUILoggedOut() {
  // Ocultar nombre de usuario
  document.getElementById('userName').textContent = '';
  document.getElementById('userName').style.display = 'none';
  
  // Mostrar botones de login/registro
  authButtons.style.display = 'flex';
  
  // Ocultar botón de logout
  logoutBtn.style.display = 'none';
  //ocultar contador de wishlist
  const badge = document.getElementById('wishlist-count');
  if(badge){
    badge.style.display = 'none';
  }
}

function updateUILoggedIn(userName) {
  // Mostrar nombre de usuario
  document.getElementById('userName').textContent = `Hola, ${userName}`;
  document.getElementById('userName').style.display = 'inline';
  
  // Ocultar botones de login/registro
  authButtons.style.display = 'none';
  
  // Mostrar botón de logout
  logoutBtn.style.display = 'inline-block';
  //actualizar contador de wishlist
  if(typeof actualizarContadorCarrito == 'function'){
    actualizarContadorWishlist();
  }
}


// ============================================
// Contactanos
// ============================================
function contacto(formContacto){
  if (formContacto) {
    formContacto.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = e.target.nombre.value.trim();
      const correo = e.target.correo.value.trim();
      const mensaje = e.target.mensaje.value.trim();

      if (!nombre || !correo || !mensaje) {
        Swal.fire({
          icon: 'error',
          title: 'Campos incompletos',
          text: 'Por favor completa todos los campos',
          confirmButtonColor: '#667eea'
        });
        return;
      }

      Swal.fire({
        title: 'Enviando mensaje...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const res = await fetch("http://localhost:5000/api/contact", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, correo, mensaje })
        });

        const data = await res.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Mensaje enviado',
            text: data.message,
            confirmButtonColor: '#667eea'
          });
          formContacto.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message,
            confirmButtonColor: '#667eea'
          });
        }
      } catch (error) {
        console.error('[CONTACTO] Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor.',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }
}