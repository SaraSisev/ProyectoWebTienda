// routes/wishlistRoutes.js
import express from 'express';
import {
  agregarAWishlist,
  obtenerWishlist,
  contarWishlist
} from '../controller/wishlistController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.post('/agregar', verificarToken, agregarAWishlist);
router.get('/mi-lista', verificarToken, obtenerWishlist);
router.get('/contar', verificarToken, contarWishlist);

export default router;