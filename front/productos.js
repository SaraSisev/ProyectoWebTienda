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
            <!-- Botón de wishlist en la esquina -->
            <button class="wishlist-heart-btn" 
                    onclick="agregarAWishlist(${producto.id})"
                    title="Agregar a favoritos">
                <img src="imagenes/saludable.png" alt="corazaun" class="btn-icon-prods">
            </button>
            
            <!-- Imagen del producto -->
            <div class="producto-barato-img">
                <img src="${producto.imagen}" 
                     alt="${producto.nombre}"
                     onerror="this.src='https://via.placeholder.com/200x200?text=Sin+Imagen'">
            </div>
            
            <!-- Categoría pequeña -->
            <p class="producto-barato-categoria">${producto.categoria || 'BlockWorld'}</p>
            
            <!-- Nombre del producto -->
            <h4 class="producto-barato-nombre">${producto.nombre}</h4>
            
            <!-- Precio y botón -->
            <div class="producto-barato-footer">
                <p class="producto-barato-precio">$${parseFloat(producto.precio).toFixed(2)}</p>
                <button class="producto-barato-btn" 
                        onclick="agregarAlCarrito(${producto.id})"
                        title="Agregar al carrito">
                    <img src="imagenes/carrito.png" alt="carritou" class="btn-icon-prods">
                </button>
            </div>
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
                    <button class="qty-btn" onclick="cambiarCantidad(${item.id}, -1)">
                        <img src="imagenes/menos.png" alt="+" class="btn-icon">
                    </button>
                    <input type="number" class="qty-input" value="${item.cantidad}" readonly>
                    <button class="qty-btn" onclick="cambiarCantidad(${item.id}, 1)">
                        <img src="imagenes/compras.png" alt="-" class="btn-icon">
                    </button>
                </div>

                <button class="remove-btn" onclick="eliminarDelCarrito(${item.id})">
                    <img src="imagenes/borrar.png" alt="Eliminar" class="delete-icon">
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

// ============================================
// MOSTRAR PRODUCTOS MÁS BARATOS (CARRUSEL)
// ============================================

async function cargarProductosBaratos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();
        
        if (data.success) {
            // Ordenar por precio de menor a mayor y tomar los primeros 10
            const productosBaratos = data.data
                .filter(p => p.disponibilidad > 0) // Solo productos disponibles
                .sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio))
                .slice(0, 10); // Tomar los 10 más baratos
            
            mostrarProductosBaratos(productosBaratos);
            console.log(`✅ ${productosBaratos.length} productos baratos cargados`);
        }
    } catch (error) {
        console.error('[ERROR] Cargar productos baratos:', error);
    }
}

function mostrarProductosBaratos(productos) {
    const contenedor = document.getElementById('productos-baratos-container');
    
    if (!contenedor) {
        console.error('❌ No se encontró el contenedor de productos baratos');
        return;
    }
    
    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="font-size: 18px; color: #666;">📦 No hay productos disponibles</p>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = productos.map(producto => `
        <div class="producto-barato-card">
            <!-- Botón de wishlist en la esquina -->
            <button class="wishlist-heart-btn" 
                    onclick="agregarAWishlist(${producto.id})"
                    title="Agregar a favoritos">
                <img src="imagenes/saludable.png" alt="corazaun" class="btn-icon">
            </button>
            
            <!-- Imagen del producto -->
            <div class="producto-barato-img">
                <img src="${producto.imagen}" 
                     alt="${producto.nombre}"
                     onerror="this.src='https://via.placeholder.com/200x200?text=Sin+Imagen'">
            </div>
            
            <!-- Categoría pequeña -->
            <p class="producto-barato-categoria">${producto.categoria || 'BlockWorld'}</p>
            
            <!-- Nombre del producto -->
            <h4 class="producto-barato-nombre">${producto.nombre}</h4>
            
            <!-- Precio y botón -->
            <div class="producto-barato-footer">
                <p class="producto-barato-precio">$${parseFloat(producto.precio).toFixed(2)}</p>
                <button class="producto-barato-btn" 
                        onclick="agregarAlCarrito(${producto.id})"
                        title="Agregar al carrito">
                    <img src="imagenes/carrito.png" alt="carritou" class="btn-icon">
                </button>
            </div>
        </div>
    `).join('');
    
    // Inicializar el carrusel después de cargar los productos
    inicializarCarruselBaratos();
}

// ============================================
// CARRUSEL DE PRODUCTOS BARATOS
// ============================================
function inicializarCarruselBaratos() {
    const container = document.getElementById('productos-baratos-container');
    const btnLeft = document.getElementById('barato-arrow-left');
    const btnRight = document.getElementById('barato-arrow-right');
    
    if (!container || !btnLeft || !btnRight) {
        console.error('❌ No se encontraron elementos del carrusel de productos baratos');
        return;
    }
    
    let scrollAmount = 0;
    const cardWidth = 240; // ancho de cada card + gap
    
    btnRight.addEventListener('click', () => {
        container.scrollBy({
            left: cardWidth * 2, // Mover 2 productos a la vez
            behavior: 'smooth'
        });
    });
    
    btnLeft.addEventListener('click', () => {
        container.scrollBy({
            left: -cardWidth * 2, // Mover 2 productos a la vez
            behavior: 'smooth'
        });
    });
    
    // Mostrar/ocultar flechas según el scroll
    container.addEventListener('scroll', () => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // Ocultar flecha izquierda si está al inicio
        if (container.scrollLeft <= 0) {
            btnLeft.style.opacity = '0.3';
            btnLeft.style.cursor = 'default';
        } else {
            btnLeft.style.opacity = '1';
            btnLeft.style.cursor = 'pointer';
        }
        
        // Ocultar flecha derecha si está al final
        if (container.scrollLeft >= maxScroll - 10) {
            btnRight.style.opacity = '0.3';
            btnRight.style.cursor = 'default';
        } else {
            btnRight.style.opacity = '1';
            btnRight.style.cursor = 'pointer';
        }
    });
}

// ============================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosBaratos();
});

// Array con las marcas (reemplaza con tus imágenes reales)
const marcas = [
    { nombre: 'LEGO Minecraft', logo: 'imagenes/images (3).png' },
    { nombre: 'LEGO Star Wars', logo: 'imagenes/images (4).png' },
    { nombre: 'LEGO Marvel', logo: 'imagenes/images (2).png' },
    { nombre: 'LEGO DC', logo: 'imagenes/images (1).png' },
    { nombre: 'LEGO Harry Potter', logo: 'imagenes/Lego_Architecture.svg.png' },
    { nombre: 'LEGO Disney', logo: 'imagenes/Lego_Art_logo.png' },
    { nombre: 'LEGO DC', logo: 'imagenes/LEGO_Harry_Potter_Logo.png' },
    { nombre: 'LEGO Harry Potter', logo: 'imagenes/Lego_Ideas_logo.svg.png' },
    { nombre: 'LEGO Disney', logo: 'imagenes/Lego_marvel_super_heroes_logo.png' },
    { nombre: 'LEGO Harry Potter', logo: 'imagenes/Lego_Star_Wars_Logo.svg.png' },
    { nombre: 'LEGO Disney', logo: 'imagenes/Technic_logo.svg.png' },
    { nombre: 'LEGO Disney', logo: 'imagenes/1200px-Lego_Minecraft_Logo.png' }
];

// Función para crear el carrusel
function crearCarrusel() {
    const track = document.getElementById('marcas-track');
    
    // Crear los items originales
    marcas.forEach(marca => {
        const item = document.createElement('div');
        item.className = 'marca-item';
        item.innerHTML = `<img src="${marca.logo}" alt="${marca.nombre}">`;
        track.appendChild(item);
    });

    // Duplicar las marcas para crear el efecto infinito
    marcas.forEach(marca => {
        const item = document.createElement('div');
        item.className = 'marca-item';
        item.innerHTML = `<img src="${marca.logo}" alt="${marca.nombre}">`;
        track.appendChild(item);
    });
}


crearCarrusel();

let expandido = true;

function toggleTexto() {
    const texto = document.getElementById('bienvenida-texto');
    const btn = document.getElementById('toggle-btn');

    if (expandido) {
        texto.classList.add('collapsed');
        btn.textContent = 'Mostrar Más';
        expandido = false;
    } else {
        texto.classList.remove('collapsed');
        btn.textContent = 'Mostrar Menos';
        expandido = true;
    }
}

// Opcional: iniciar colapsado en móviles
if (window.innerWidth < 768) {
    toggleTexto();
}