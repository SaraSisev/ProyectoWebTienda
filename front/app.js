// front/app.js

// ============================================
// CONFIGURACIÓN
// ============================================
const API_URL = 'http://localhost:5000/api';

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

// ============================================
// ABRIR Y CERRAR MODALES
// ============================================

// Abrir modal de login
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
    registroModal.style.display = 'none';
});

// Abrir modal de registro
registrarBtn.addEventListener('click', () => {
    registroModal.style.display = 'block';
    loginModal.style.display = 'none';
});

// Cerrar modal de login
closeModalLogin.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

// Cerrar modal de registro
closeModalRegistro.addEventListener('click', () => {
    registroModal.style.display = 'none';
});

// Cambiar de login a registro
if (linkRegistro) {
    linkRegistro.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registroModal.style.display = 'block';
    });
}

// Cambiar de registro a login
if (linkLogin) {
    linkLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registroModal.style.display = 'none';
        loginModal.style.display = 'block';
    });
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === registroModal) {
        registroModal.style.display = 'none';
    }
});

// ============================================
// REGISTRO DE USUARIO
// ============================================

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const nombre = document.getElementById('regNombre').value.trim();
    const nombrecuenta = document.getElementById('regNombreCuenta').value.trim();
    const correo = document.getElementById('regCorreo').value.trim();
    const contrasena = document.getElementById('regContrasena').value;
    const contrasena2 = document.getElementById('regContrasena2').value;
    const pais = document.getElementById('regPais').value;

    // Validaciones en el frontend
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

    // Mostrar loading
    Swal.fire({
        title: 'Registrando usuario...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Enviar petición al backend
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
            // Registro exitoso
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: data.message,
                confirmButtonColor: '#667eea'
            }).then(() => {
                // Cerrar modal y limpiar formulario
                registroModal.style.display = 'none';
                formRegistro.reset();
                
                // Abrir modal de login
                loginModal.style.display = 'block';
                
                // Pre-llenar el usuario
                document.getElementById('login').value = nombrecuenta;
            });
        } else {
            // Error del servidor
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
            text: 'No se pudo conectar con el servidor. Verifica que esté corriendo en el puerto 5000.',
            confirmButtonColor: '#667eea'
        });
    }
});

// ============================================
// LOGIN (por implementar)
// ============================================

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    Swal.fire({
        icon: 'info',
        title: 'Próximamente',
        text: 'La funcionalidad de login aún no está implementada',
        confirmButtonColor: '#667eea'
    });
});

// ============================================
// VERIFICAR SESIÓN AL CARGAR LA PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (token && userName) {
        // Usuario ya tiene sesión
        document.getElementById('userName').textContent = `Hola, ${userName}`;
        document.getElementById('userName').style.display = 'inline';
    }
});