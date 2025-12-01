// front/admin.js

const API_URL = 'http://localhost:5000/api';

// ============================================
// VERIFICAR AUTENTICACIÓN Y ROL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setupMenuNavigation();
    setupLogout();
});

function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    // Verificar si hay sesión
    if (!token || !userName) {
        Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'Debes iniciar sesión para acceder al panel de administrador',
            confirmButtonColor: '#667eea'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }
    
    // Verificar si es administrador
    if (userRole !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tienes permisos de administrador',
            confirmButtonColor: '#667eea'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }
    
    // Mostrar nombre del admin
    document.getElementById('userName').textContent = `Admin: ${userName}`;
    document.getElementById('userName').style.display = 'inline';
}

// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================
function setupMenuNavigation() {
    const menuButtons = document.querySelectorAll('.admin-menu-btn');
    const sections = document.querySelectorAll('.admin-section');
    
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Quitar clase active de todos los botones
            menuButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            button.classList.add('active');
            
            // Ocultar todas las secciones
            sections.forEach(section => section.classList.remove('active'));
            
            // Mostrar la sección correspondiente
            const sectionName = button.dataset.section;
            const targetSection = document.getElementById(`section-${sectionName}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ============================================
// LOGOUT
// ============================================
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: '¿Estás seguro de que deseas salir del panel de administrador?',
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
    }).then(() => {
        window.location.href = 'index.html';
    });
}