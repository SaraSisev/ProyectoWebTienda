// routes/productRoutes.js
import express from 'express';
import {
  obtenerProductos,
  obtenerProductosPorCategoria,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerInventario,
  obtenerEstadisticas
} from '../controller/productController.js';

const router = express.Router();

// Rutas públicas (pueden acceder todos)
router.get('/productos', obtenerProductos);
router.get('/productos/categoria/:categoria', obtenerProductosPorCategoria);
router.get('/productos/:id', obtenerProductoPorId);

// Rutas de administrador (TODO: agregar middleware de autenticación)
router.post('/productos', crearProducto);
router.put('/productos/:id', actualizarProducto);
router.delete('/productos/:id', eliminarProducto);

// Rutas de reportes
router.get('/inventario', obtenerInventario);
router.get('/estadisticas', obtenerEstadisticas);

export default router;