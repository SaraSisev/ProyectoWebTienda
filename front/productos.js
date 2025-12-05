// front/productos.js

// Variables globales
let todosLosProductos = [];
let productosFiltrados = [];

// ============================================
// CARGAR PRODUCTOS AL INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    setupFiltros();
});

// ============================================
// CARGAR PRODUCTOS DESDE LA API
// ============================================
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();
        
        if (data.success) {
            todosLosProductos = data.data;
            productosFiltrados = todosLosProductos;
            mostrarProductos(productosFiltrados);
            console.log(`✅ ${todosLosProductos.length} productos cargados`);
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

// ============================================
// MOSTRAR PRODUCTOS EN LA PÁGINA
// ============================================
function mostrarProductos(productos) {
    const contenedor = document.getElementById('productos-container');
    
    if (!contenedor) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }
    
    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="font-size: 18px; color: #666;">📦 No se encontraron productos</p>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = productos.map(producto => `
        <div class="product-card" data-categoria="${producto.categoria}" data-precio="${producto.precio}">
            <div class="product-badge">
                <span class="lego-badge">BlockWorld</span>
                ${producto.disponibilidad === 0 ? 
                    '<span class="exclusive-badge" style="background: #e74c3c;">Agotado</span>' : 
                    '<span class="exclusive-badge">Disponible</span>'}
            </div>
            
            <img src="${producto.imagen}" 
                 alt="${producto.nombre}"
                 onerror="this.src='https://via.placeholder.com/200x200?text=Sin+Imagen'">                      
              
            <h3>${producto.nombre}</h3>
            <p class="product-desc">${producto.descripcion.substring(0, 60)}...</p>
            <p class="product-id">Stock: ${producto.disponibilidad} unidades</p>
            <p class="price">$${parseFloat(producto.precio).toFixed(2)}</p>
            
            <button 
                class="btn-add-to-cart" 
                onclick="agregarAlCarrito(${producto.id})"
                ${producto.disponibilidad === 0 ? 'disabled' : ''}>
                ${producto.disponibilidad === 0 ? '❌ Agotado' : '🛒 Agregar al Carrito'}
            </button>
            <!-- Botón de Wishlist -->
            <button class="btn-wishlist" 
                    onclick="agregarAWishlist(${producto.id})"
                    title="Agregar a lista de deseos">
                ❤️
            </button>
        </div>
    `).join('');
}

// ============================================
// FILTROS
// ============================================
function setupFiltros() {
    // Filtro por categoría
    const categoriaSelect = document.getElementById('filtro-categoria');
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', aplicarFiltros);
    }
    
    // Filtro por precio
    const precioMin = document.getElementById('precio-min');
    const precioMax = document.getElementById('precio-max');
    if (precioMin && precioMax) {
        precioMin.addEventListener('input', aplicarFiltros);
        precioMax.addEventListener('input', aplicarFiltros);
    }
    
    // Filtro de ofertas
    const checkOfertas = document.getElementById('filtro-ofertas');
    if (checkOfertas) {
        checkOfertas.addEventListener('change', aplicarFiltros);
    }
}

function aplicarFiltros() {
    let resultados = [...todosLosProductos];
    
    // Filtro por categoría
    const categoria = document.getElementById('filtro-categoria')?.value;
    if (categoria && categoria !== 'todas') {
        resultados = resultados.filter(p => p.categoria === categoria);
    }
    
    // Filtro por precio
    const precioMin = parseFloat(document.getElementById('precio-min')?.value) || 0;
    const precioMax = parseFloat(document.getElementById('precio-max')?.value) || Infinity;
    resultados = resultados.filter(p => p.precio >= precioMin && p.precio <= precioMax);
    
    // Filtro de ofertas (ejemplo: productos con disponibilidad > 0)
    const soloOfertas = document.getElementById('filtro-ofertas')?.checked;
    if (soloOfertas) {
        resultados = resultados.filter(p => p.disponibilidad > 0);
    }
    
    productosFiltrados = resultados;
    mostrarProductos(productosFiltrados);
    
    console.log(`🔍 Filtros aplicados: ${productosFiltrados.length} productos`);
}

// ============================================
// AGREGAR AL CARRITO (temporal)
// ============================================
function agregarAlCarrito(productoId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Inicia sesión',
            text: 'Debes iniciar sesión para agregar productos al carrito',
            confirmButtonColor: '#667eea'
        });
        return;
    }
    
    const producto = todosLosProductos.find(p => p.id === productoId);
    
    if (!producto) {
        console.error('Producto no encontrado');
        return;
    }
    
    // Obtener carrito del localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Verificar si ya existe
    const existe = carrito.find(item => item.id === productoId);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1,
            disponibilidad: producto.disponibilidad
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar contador del carrito (si existe)
    actualizarContadorCarrito();
    renderCarrito();
    
    Swal.fire({
        icon: 'success',
        title: '¡Agregado!',
        text: `${producto.nombre} se agregó al carrito`,
        timer: 1500,
        showConfirmButton: false
    });
}

// ============================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ============================================
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.textContent = total;
        contador.style.display = total > 0 ? 'inline' : 'none';
    }
}

// ============================================
// CARGAR CARRITO EN SIDEBAR
// ============================================
function renderCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cont = document.getElementById('carrito-contenedor');
    const totalTag = document.getElementById('carrito-total');
    const btnCheckout = document.getElementById('btnCheckout');

    console.log('[CARRITO] Renderizando carrito:', carrito.length, 'items');
    console.log('[CARRITO] Botón checkout encontrado:', !!btnCheckout);

    if (!cont || !totalTag || !btnCheckout) {
        console.error('[CARRITO] Error: No se encontraron elementos del DOM');
        return;
    }

    if (carrito.length === 0) {
        cont.innerHTML = `<p style="text-align:center; color:#777;">Tu carrito está vacío</p>`;
        totalTag.textContent = "€0.00";
        btnCheckout.disabled = true;
        console.log('[CARRITO] Carrito vacío, botón deshabilitado');
        return;
    }

    let html = "";
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        html += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                
                <div class="cart-item-details">
                    <h4>${item.nombre}</h4>
                    <p class="price">€${item.precio.toFixed(2)}</p>
                </div>

                <div class="quantity-controls">
                    <button class="qty-btn" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                    <input type="number" class="qty-input" value="${item.cantidad}" readonly>
                    <button class="qty-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                </div>

                <button class="remove-btn" onclick="eliminarDelCarrito(${item.id})">
                    🗑️
                </button>
            </div>
        `;
    });

    cont.innerHTML = html;
    totalTag.textContent = `€${total.toFixed(2)}`;
    btnCheckout.disabled = false; // ✅ HABILITAR EL BOTÓN
    
    console.log('[CARRITO] Total:', total, '- Botón habilitado');
}

// ============================================
// CAMBIAR CANTIDAD
// ============================================
function cambiarCantidad(id, delta) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    carrito = carrito.map(item => {
        if (item.id === id) {
            item.cantidad = Math.max(1, item.cantidad + delta);
        }
        return item;
    });

    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
    actualizarContadorCarrito();
}

// ============================================
// ELIMINAR PRODUCTO DEL CARRITO
// ============================================
function eliminarDelCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
    actualizarContadorCarrito();
}

// ============================================
// MOSTRAR CARRITO AL CARGAR
// ============================================
document.addEventListener('DOMContentLoaded', renderCarrito);

// ============================================
// INICIALIZAR AL CARGAR PÁGINA
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[INIT] Página cargada, inicializando carrito');
        renderCarrito();
        actualizarContadorCarrito();
    });
} else {
    console.log('[INIT] Página ya cargada, inicializando carrito inmediatamente');
    renderCarrito();
    actualizarContadorCarrito();
}
