// controller/productController.js
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventoryByCategory,
  getProductStats
} from '../model/productModel.js';

// OBTENER TODOS LOS PRODUCTOS
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await getAllProducts();
    
    res.status(200).json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('[GET PRODUCTOS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// OBTENER PRODUCTOS POR CATEGORÍA
export const obtenerProductosPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const categoriasValidas = ['Technic', 'Ideas', 'Marcas'];
    if (!categoriasValidas.includes(categoria)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no válida'
      });
    }
    
    const productos = await getProductsByCategory(categoria);
    
    res.status(200).json({
      success: true,
      data: productos,
      categoria: categoria,
      total: productos.length
    });
  } catch (error) {
    console.error('[GET PRODUCTOS BY CATEGORY ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// OBTENER UN PRODUCTO POR ID
export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await getProductById(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('[GET PRODUCTO BY ID ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

// CREAR NUEVO PRODUCTO
export const crearProducto = async (req, res) => {
  try {
    const { imagen, nombre, descripcion, precio, disponibilidad, categoria } = req.body;
    
    console.log('[CREAR PRODUCTO] Datos recibidos:', req.body);
    
    // Validaciones
    if (!nombre || !descripcion || !precio || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }
    
    const categoriasValidas = ['Technic', 'Ideas', 'Marcas'];
    if (!categoriasValidas.includes(categoria)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no válida'
      });
    }
    
    if (isNaN(precio) || precio < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número válido'
      });
    }
    
    const stock = disponibilidad !== undefined ? parseInt(disponibilidad) : 0;
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'La disponibilidad debe ser un número válido'
      });
    }
    
    //parte que decodifica la base 64 que manda el front 
    // Convertir Base64 a buffer si existe imagen
    let imagenBuffer = null;

    if (imagen && imagen.startsWith('data:image')) {
      try {
        const base64Data = imagen.split(',')[1];
        imagenBuffer = Buffer.from(base64Data, 'base64');
      } catch (err) {
        console.error('Error al decodificar imagen Base64:', err);
        return res.status(400).json({
          success: false,
          message: 'Formato de imagen inválido'
        });
      }
}

    const productData = {
      imagen: imagenBuffer || null,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: parseFloat(precio),
      disponibilidad: stock,
      categoria: categoria
    };
    
    const productId = await createProduct(productData);
    
    console.log('[CREAR PRODUCTO] Producto creado con ID:', productId);
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      productId: productId
    });
    
  } catch (error) {
    console.error('[CREAR PRODUCTO ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// ACTUALIZAR PRODUCTO
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagen, nombre, descripcion, precio, disponibilidad, categoria } = req.body;

    // Convertir Base64 a buffer si la imagen fue enviada
    let imagenBuffer = null;

    if (imagen && imagen.startsWith('data:image')) {
      try {
        const base64Data = imagen.split(',')[1];
        imagenBuffer = Buffer.from(base64Data, 'base64');
      } catch (err) {
        console.error('Error al decodificar imagen Base64:', err);
        return res.status(400).json({
          success: false,
          message: 'Formato de imagen inválido'
        });
      }
    }

    console.log('[ACTUALIZAR PRODUCTO] ID:', id);
    console.log('[ACTUALIZAR PRODUCTO] Datos recibidos:', req.body);
    
    // Verificar que el producto existe
    const productoExistente = await getProductById(id);
    if (!productoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Validaciones
    if (!nombre || !descripcion || !precio || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }
    
    const categoriasValidas = ['Technic', 'Ideas', 'Marcas'];
    if (!categoriasValidas.includes(categoria)) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no válida'
      });
    }
    
    if (isNaN(precio) || precio < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número válido'
      });
    }
    
    const stock = disponibilidad !== undefined ? parseInt(disponibilidad) : 0;
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'La disponibilidad debe ser un número válido'
      });
    }
    
    const productData = {
      imagen: imagenBuffer || productoExistente.imagen,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: parseFloat(precio),
      disponibilidad: stock,
      categoria: categoria
    };
    
    const actualizado = await updateProduct(id, productData);
    
    if (actualizado) {
      console.log('[ACTUALIZAR PRODUCTO] Producto actualizado exitosamente');
      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'No se pudo actualizar el producto'
      });
    }
    
  } catch (error) {
    console.error('[ACTUALIZAR PRODUCTO ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// ELIMINAR PRODUCTO
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[ELIMINAR PRODUCTO] ID:', id);
    
    // Verificar que el producto existe
    const productoExistente = await getProductById(id);
    if (!productoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    const eliminado = await deleteProduct(id);
    
    if (eliminado) {
      console.log('[ELIMINAR PRODUCTO] Producto eliminado exitosamente');
      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'No se pudo eliminar el producto'
      });
    }
    
  } catch (error) {
    console.error('[ELIMINAR PRODUCTO ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// OBTENER INVENTARIO POR CATEGORÍA
export const obtenerInventario = async (req, res) => {
  try {
    const inventario = await getInventoryByCategory();
    
    res.status(200).json({
      success: true,
      data: inventario
    });
  } catch (error) {
    console.error('[GET INVENTARIO ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario',
      error: error.message
    });
  }
};

// OBTENER ESTADÍSTICAS
export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await getProductStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[GET STATS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};