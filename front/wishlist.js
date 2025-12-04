// wishlist.js - Funcionalidad del frontend para lista de deseos

const API_BASE_URL = 'http://localhost:5000/api';

// Función para agregar producto a wishlist
async function agregarAWishlist(productoId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Inicia Sesión',
      text: 'Debes iniciar sesión para agregar productos a tu lista de deseos',
      confirmButtonText: 'OK'
    });
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/agregar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productoId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.alreadyExists) {
        Swal.fire({
          icon: 'info',
          title: 'Ya en la lista',
          text: data.message,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: data.message,
          timer: 2000,
          showConfirmButton: false
        });
        
        // Actualizar contador
        actualizarContadorWishlist();
      }
    } else {
      throw new Error(data.message);
    }
    
  } catch (error) {
    console.error('Error al agregar a wishlist:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo agregar el producto a tu lista de deseos',
      confirmButtonText: 'OK'
    });
  }
}

// Función para obtener y mostrar wishlist
async function cargarWishlist() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    document.getElementById('wishlist-container').innerHTML = `
      <p style="text-align:center; color:#777; padding:20px;">
        Inicia sesión para ver tu lista de deseos
      </p>
    `;
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/mi-lista`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      mostrarWishlist(data.data);
    } else {
      throw new Error(data.message);
    }
    
  } catch (error) {
    console.error('Error al cargar wishlist:', error);
    document.getElementById('wishlist-container').innerHTML = `
      <p style="text-align:center; color:#f44336; padding:20px;">
        Error al cargar tu lista de deseos
      </p>
    `;
  }
}

// Función para mostrar productos de wishlist en HTML
function mostrarWishlist(productos) {
  const container = document.getElementById('wishlist-container');
  
  if (!container) return;
  
  if (productos.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px;">
        <p style="font-size:48px;">💔</p>
        <p style="color:#777;">Tu lista de deseos está vacía</p>
        <p style="color:#999; font-size:14px;">Explora nuestros productos y agrega tus favoritos</p>
      </div>
    `;
    return;
  }
  
  let html = '<div class="wishlist-grid">';
  
  productos.forEach(producto => {
    const disponible = producto.disponibilidad > 0;
    
    html += `
      <div class="wishlist-item">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="wishlist-info">
          <h4>${producto.nombre}</h4>
          <p class="wishlist-categoria">${producto.categoria}</p>
          <p class="wishlist-precio">$${producto.precio.toFixed(2)}</p>
          ${disponible 
            ? `<span class="badge-disponible">✓ Disponible</span>` 
            : `<span class="badge-agotado">✗ No disponible</span>`
          }
          <small style="color:#999; display:block; margin-top:5px;">
            Agregado: ${new Date(producto.fecha_agregado).toLocaleDateString('es-MX')}
          </small>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Función para actualizar contador de wishlist
async function actualizarContadorWishlist() {
  const token = localStorage.getItem('token');
  const badge = document.getElementById('wishlist-count');
  
  if (!token || !badge) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/contar`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.count > 0) {
      badge.textContent = data.count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error al actualizar contador:', error);
  }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Si estamos en la página de wishlist, cargar productos
  if (document.getElementById('wishlist-container')) {
    cargarWishlist();
  }
  
  // Actualizar contador si hay sesión
  if (localStorage.getItem('token')) {
    actualizarContadorWishlist();
  }
});