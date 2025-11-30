// routes/authRoutes.js
import express from 'express';
import { registrarUsuario } from '../controller/authController.js';

const router = express.Router();

// POST /api/auth/registro
router.post('/registro', registrarUsuario);

export default router;