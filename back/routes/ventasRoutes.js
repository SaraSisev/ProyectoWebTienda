// routes/ventasRoutes.js
import express from 'express';
import {
  obtenerVentasPorCategoria,
  obtenerTotalVentas,
  obtenerVentasRecientes
} from '../controller/ventasController.js';

const router = express.Router();

// Rutas de ventas (públicas para el admin, agregar middleware si quieres protegerlas)
router.get('/por-categoria', obtenerVentasPorCategoria);
router.get('/total', obtenerTotalVentas);
router.get('/recientes', obtenerVentasRecientes);

export default router;