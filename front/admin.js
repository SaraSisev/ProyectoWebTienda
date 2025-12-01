// front/admin.js

const API_URL = 'http://localhost:5000/api';

// ============================================
// VARIABLES GLOBALES
// ============================================
let productos = [];
let editandoProductoId = null;

// ============================================
// VERIFICAR AUTENTICACIÓN Y ROL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setupMenuNavigation();
    setupLogout();
    setupModalProducto();
    cargarProductos();
});

function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
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
            menuButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active'));
            
            const sectionName = button.dataset.section;
            const targetSection = document.getElementById(`section-${sectionName}`);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Cargar datos según la sección
                if (sectionName === 'inventario') {
                    cargarInventario();
                }
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
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    
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

// ============================================
// GESTIÓN DE PRODUCTOS
// ============================================

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();
        
        if (data.success) {
            productos = data.data;
            mostrarTablaProductos();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('[ERROR] Cargar productos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los productos',
            confirmButtonColor: '#667eea'
        });
    }
}

function mostrarTablaProductos() {
    const container = document.getElementById('tablaProductosContainer');
    
    if (productos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📦 No hay productos registrados</p>
                <p>Haz clic en "Agregar Nuevo Producto" para empezar</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="products-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    productos.forEach(producto => {
        const stockClass = producto.disponibilidad === 0 ? 'badge-danger' : 
                          producto.disponibilidad < 10 ? 'badge-warning' : 'badge-success';
        
        html += `
            <tr>
                <td>${producto.id}</td>
                <td>
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image-thumbnail">
                </td>
                <td><strong>${producto.nombre}</strong></td>
                <td>${producto.descripcion.substring(0, 60)}...</td>
                <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                <td>
                    <span class="badge ${stockClass}">${producto.disponibilidad} unidades</span>
                </td>
                <td>${producto.categoria}</td>
                <td>
                    <div class="product-actions">
                        <button onclick="editarProducto(${producto.id})" class="icon-btn-small btn-primary" title="Editar">
                            ✏️
                        </button>
                        <button onclick="eliminarProducto(${producto.id})" class="icon-btn-small btn-danger" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// ============================================
// MODAL DE PRODUCTO
// ============================================
function setupModalProducto() {
    const modal = document.getElementById('modalProducto');
    const btnNuevo = document.getElementById('btnNuevoProducto');
    const closeModal = document.getElementById('closeModalProducto');
    const form = document.getElementById('formProducto');
    
    btnNuevo.addEventListener('click', () => {
        abrirModalNuevoProducto();
    });
    
    closeModal.addEventListener('click', () => {
        cerrarModalProducto();
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarModalProducto();
        }
    });
    
    form.addEventListener('submit', guardarProducto);
}

function abrirModalNuevoProducto() {
    editandoProductoId = null;
    document.getElementById('tituloModal').textContent = '📦 Agregar Nuevo Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('productoId').value = '';
    document.getElementById('modalProducto').style.display = 'block';
}

function cerrarModalProducto() {
    document.getElementById('modalProducto').style.display = 'none';
    document.getElementById('formProducto').reset();
    editandoProductoId = null;
}

async function guardarProducto(e) {
    e.preventDefault();
    
    const productoData = {
        nombre: document.getElementById('productoNombre').value.trim(),
        descripcion: document.getElementById('productoDescripcion').value.trim(),
        precio: parseFloat(document.getElementById('productoPrecio').value),
        disponibilidad: parseInt(document.getElementById('productoDisponibilidad').value),
        categoria: document.getElementById('productoCategoria').value,
        imagen: document.getElementById('productoImagen').value.trim() || undefined
    };
    
    console.log('[GUARDAR PRODUCTO] Datos:', productoData);
    
    Swal.fire({
        title: 'Guardando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        let response;
        
        if (editandoProductoId) {
            // ACTUALIZAR
            response = await fetch(`${API_URL}/productos/${editandoProductoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productoData)
                });
    } else {
        // CREAR
        response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoData)
        });
    }
    
    const data = await response.json();
    
    if (data.success) {
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: data.message,
            confirmButtonColor: '#667eea'
        });
        
        cerrarModalProducto();
        await cargarProductos();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message,
            confirmButtonColor: '#667eea'
        });
    }
} catch (error) {
    console.error('[ERROR] Guardar producto:', error);
    Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo guardar el producto',
        confirmButtonColor: '#667eea'
    });
}
}
async function editarProducto(id) {
const producto = productos.find(p => p.id === id);
if (!producto) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Producto no encontrado',
        confirmButtonColor: '#667eea'
    });
    return;
}

editandoProductoId = id;
document.getElementById('tituloModal').textContent = '✏️ Editar Producto';
document.getElementById('productoId').value = id;
document.getElementById('productoNombre').value = producto.nombre;
document.getElementById('productoDescripcion').value = producto.descripcion;
document.getElementById('productoPrecio').value = producto.precio;
document.getElementById('productoDisponibilidad').value = producto.disponibilidad;
document.getElementById('productoCategoria').value = producto.categoria;
document.getElementById('productoImagen').value = producto.imagen;

document.getElementById('modalProducto').style.display = 'block';
}
async function eliminarProducto(id) {
const producto = productos.find(p => p.id === id);
if (!producto) return;

const result = await Swal.fire({
    title: '¿Eliminar producto?',
    text: `¿Estás seguro de eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
});

if (!result.isConfirmed) return;

Swal.fire({
    title: 'Eliminando...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
        Swal.showLoading();
    }
});

try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
        Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'El producto ha sido eliminado',
            confirmButtonColor: '#667eea'
        });
        
        await cargarProductos();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message,
            confirmButtonColor: '#667eea'
        });
    }
} catch (error) {
    console.error('[ERROR] Eliminar producto:', error);
    Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo eliminar el producto',
        confirmButtonColor: '#667eea'
    });
}
}
// ============================================
// INVENTARIO
// ============================================
async function cargarInventario() {
const container = document.getElementById('inventarioContainer');
container.innerHTML = '<div class="loading">⏳ Cargando inventario...</div>';

try {
    const [inventarioRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/inventario`),
        fetch(`${API_URL}/estadisticas`)
    ]);
    
    const inventarioData = await inventarioRes.json();
    const statsData = await statsRes.json();
    
    if (inventarioData.success && statsData.success) {
        mostrarInventario(inventarioData.data, statsData.data);
    } else {
        throw new Error('Error al cargar datos');
    }
} catch (error) {
    console.error('[ERROR] Cargar inventario:', error);
    container.innerHTML = '<div class="error">❌ Error al cargar el inventario</div>';
}
}
function mostrarInventario(inventarioPorCategoria, estadisticas) {
const container = document.getElementById('inventarioContainer');
let html = `
    <div class="stats-grid">
        <div class="stat-card">
            <h3>Total de Productos</h3>
            <div class="stat-value">${estadisticas.total_productos || 0}</div>
            <div class="stat-label">productos registrados</div>
        </div>
        
        <div class="stat-card">
            <h3>Total de Unidades</h3>
            <div class="stat-value">${estadisticas.total_unidades || 0}</div>
            <div class="stat-label">unidades en stock</div>
        </div>
        
        <div class="stat-card">
            <h3>Valor del Inventario</h3>
            <div class="stat-value">$${parseFloat(estadisticas.valor_inventario || 0).toFixed(2)}</div>
            <div class="stat-label">valor total</div>
        </div>
    </div>
    
    <h3 style="margin-top: 30px; margin-bottom: 15px;">📊 Inventario por Categoría</h3>
    
    <table class="products-table">
        <thead>
            <tr>
                <th>Categoría</th>
                <th>Total Productos</th>
                <th>Total Unidades</th>
            </tr>
        </thead>
        <tbody>
`;

inventarioPorCategoria.forEach(cat => {
    html += `
        <tr>
            <td><strong>${cat.categoria}</strong></td>
            <td>${cat.total_productos}</td>
            <td>${cat.total_unidades}</td>
        </tr>
    `;
});

html += `
        </tbody>
    </table>
`;

container.innerHTML = html;
}
