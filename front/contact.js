const API_URL = 'http://localhost:5000/api';

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
        didOpen: () => { Swal.showLoading(); }
      });

      try {
        const res = await fetch(`${API_URL}/contact`, {
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

document.addEventListener('DOMContentLoaded', () => {
  const formContacto = document.getElementById('contactForm');
  contacto(formContacto);
});
