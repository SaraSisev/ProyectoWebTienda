// front/productos.js

// Variables globales
let todosLosProductos = [];
let productosFiltrados = [];

// CARGAR PRODUCTOS AL INICIAR
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    setupFiltros();
});

// CARGAR PRODUCTOS DESDE LA API
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

// MOSTRAR PRODUCTOS EN LA PÁGINA
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

// FILTROS
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
    
    // Filtro de ofertas
    const soloOfertas = document.getElementById('filtro-ofertas')?.checked;
    if (soloOfertas) {
        resultados = resultados.filter(p => p.disponibilidad > 0);
    }
    
    productosFiltrados = resultados;
    mostrarProductos(productosFiltrados);
    
    console.log(`🔍 Filtros aplicados: ${productosFiltrados.length} productos`);
}

// AGREGAR AL CARRITO 
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
    
    // Actualizar contador del carrito
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

// ACTUALIZAR CONTADOR DEL CARRITO
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.textContent = total;
        contador.style.display = total > 0 ? 'inline' : 'none';
    }
}

// CARGAR CARRITO EN SIDEBAR
function renderCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cont = document.getElementById('carrito-contenedor');
    const btnCheckout = document.getElementById('btnCheckout');

    console.log('[CARRITO] Renderizando carrito:', carrito.length, 'items');

    if (!cont || !btnCheckout) {
        console.error('[CARRITO] Error: No se encontraron elementos del DOM');
        return;
    }

    if (carrito.length === 0) {
        cont.innerHTML = `<p style="text-align:center; color:#777; padding: 20px;">Tu carrito está vacío</p>`;
        
        // Actualizar resumen vacío
        actualizarResumenPedido(0, 0, 0, 0);
        btnCheckout.disabled = true;
        
        return;
    }

    // ============================================
    // RENDERIZAR ITEMS DEL CARRITO
    // ============================================
    let html = "";
    let subtotal = 0;

    carrito.forEach(item => {
        const subtotalItem = item.precio * item.cantidad;
        subtotal += subtotalItem;

        html += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                
                <div class="cart-item-details">
                    <h4>${item.nombre}</h4>
                    <p class="price">$${parseFloat(item.precio).toFixed(2)}</p>
                </div>

                <div class="quantity-controls">
                    <button class="qty-btn" onclick="cambiarCantidad(${item.id}, -1)">
                        <img src="imagenes/menos.png" alt="-" class="btn-icon">
                    </button>
                    <input type="number" class="qty-input" value="${item.cantidad}" readonly>
                    <button class="qty-btn" onclick="cambiarCantidad(${item.id}, 1)">
                        <img src="imagenes/compras.png" alt="+" class="btn-icon">
                    </button>
                </div>

                <button class="remove-btn" onclick="eliminarDelCarrito(${item.id})">
                    <img src="imagenes/borrar.png" alt="Eliminar" class="delete-icon">
                </button>
            </div>
        `;
    });

    cont.innerHTML = html;

    // ============================================
    // OBTENER PAÍS DEL USUARIO
    // ============================================
    let paisUsuario = 'México'; // Por defecto
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (token && userId) {
        try {
            const res = await fetch(`${API_URL}/usuarios/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.usuario && data.usuario.pais) {
                paisUsuario = data.usuario.pais;
                console.log('[CARRITO] País del usuario:', paisUsuario);
            }
        } catch (error) {
            console.log('[CARRITO] No se pudo obtener país, usando México por defecto');
        }
    }

    // ============================================
    // CALCULAR IMPUESTOS Y ENVÍO SEGÚN PAÍS
    // ============================================
    const esMexico = paisUsuario.toLowerCase() === 'méxico' || paisUsuario.toLowerCase() === 'mexico';
    
    const tasaImpuesto = esMexico ? 0.16 : 0.20;
    const costoEnvio = esMexico ? 150 : 400;
    
    const impuestos = subtotal * tasaImpuesto;
    const envio = costoEnvio;
    const total = subtotal + impuestos + envio;

    // ============================================
    // ACTUALIZAR RESUMEN DEL PEDIDO
    // ============================================
    actualizarResumenPedido(subtotal, impuestos, envio, total, tasaImpuesto * 100, paisUsuario);
    totalTag.textContent = `€${total.toFixed(2)}`;
    btnCheckout.disabled = false; 
    
    btnCheckout.disabled = false;
    
    console.log('[CARRITO] Desglose:', {
        subtotal: subtotal.toFixed(2),
        impuestos: impuestos.toFixed(2),
        envio: envio.toFixed(2),
        total: total.toFixed(2),
        pais: paisUsuario
    });
}

// CAMBIAR CANTIDAD
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

// ELIMINAR PRODUCTO DEL CARRITO
function eliminarDelCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
    actualizarContadorCarrito();
}

// ============================================
// ACTUALIZAR RESUMEN DEL PEDIDO
// ============================================
function actualizarResumenPedido(subtotal, impuestos, envio, total, porcentajeImpuesto = 16, pais = 'México') {
    const orderSummary = document.querySelector('.order-summary');
    
    if (!orderSummary) {
        console.error('[CARRITO] No se encontró .order-summary');
        return;
    }

    const resumenHTML = `
        <h3>Resumen del pedido</h3>
        
        ${subtotal > 0 ? `
        <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
            <div class="summary-line">
                <span>Subtotal:</span>
                <span style="font-weight: 600;">$${subtotal.toFixed(2)}</span>
            </div>
            
            <div class="summary-line" style="margin-top: 10px;">
                <span>Impuestos (${porcentajeImpuesto}%):</span>
                <span style="font-weight: 600;">$${impuestos.toFixed(2)}</span>
            </div>
            
            <div class="summary-line" style="margin-top: 10px;">
                <span>Envío a ${pais}:</span>
                <span style="font-weight: 600;">$${envio.toFixed(2)}</span>
            </div>
            
            <hr style="margin: 15px 0; border: none; border-top: 2px solid #ddd;">
        </div>
        ` : `
        <div class="summary-line">
            <span>Calcular envío</span>
            <span></span>
        </div>
        `}

        <div class="summary-total">
            <span style="font-size: 18px; font-weight: bold;">Total</span>
            <span id="carrito-total" style="font-size: 22px; font-weight: bold; color: #e74c3c;">$${total.toFixed(2)}</span>
        </div>

        <button class="btn-checkout" id="btnCheckout" ${subtotal === 0 ? 'disabled' : ''}>
            Finalizar compra
        </button>
    `;

    orderSummary.innerHTML = resumenHTML;
    
    // Re-asignar evento al botón
    const nuevoBotonCheckout = document.getElementById('btnCheckout');
    if (nuevoBotonCheckout && subtotal > 0) {
        nuevoBotonCheckout.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = document.getElementById("checkoutModal");
            if (modal) modal.style.display = "block";
        });
    }
}

// ============================================
// MOSTRAR CARRITO AL CARGAR
document.addEventListener('DOMContentLoaded', renderCarrito);

// INICIALIZAR AL CARGAR PÁGINA
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

// MOSTRAR PRODUCTOS MÁS BARATOS
async function cargarProductosBaratos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();
        
        if (data.success) {
            const productosBaratos = data.data
                .filter(p => p.disponibilidad > 0) 
                .sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio))
                .slice(0, 10); 
            
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
    
    inicializarCarruselBaratos();
}

// CARRUSEL DE PRODUCTOS BARATOS
function inicializarCarruselBaratos() {
    const container = document.getElementById('productos-baratos-container');
    const btnLeft = document.getElementById('barato-arrow-left');
    const btnRight = document.getElementById('barato-arrow-right');
    
    if (!container || !btnLeft || !btnRight) {
        console.error('❌ No se encontraron elementos del carrusel de productos baratos');
        return;
    }
    
    let scrollAmount = 0;
    const cardWidth = 240; 
    btnRight.addEventListener('click', () => {
        container.scrollBy({
            left: cardWidth * 2, 
            behavior: 'smooth'
        });
    });
    
    btnLeft.addEventListener('click', () => {
        container.scrollBy({
            left: -cardWidth * 2, 
            behavior: 'smooth'
        });
    });
    
    container.addEventListener('scroll', () => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft <= 0) {
            btnLeft.style.opacity = '0.3';
            btnLeft.style.cursor = 'default';
        } else {
            btnLeft.style.opacity = '1';
            btnLeft.style.cursor = 'pointer';
        }
        
        if (container.scrollLeft >= maxScroll - 10) {
            btnRight.style.opacity = '0.3';
            btnRight.style.cursor = 'default';
        } else {
            btnRight.style.opacity = '1';
            btnRight.style.cursor = 'pointer';
        }
    });
}

// INICIALIZAR AL CARGAR LA PÁGINA
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