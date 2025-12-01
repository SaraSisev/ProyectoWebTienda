// routes/authRoutes.js
import express from 'express';
import { registrarUsuario, login } from '../controller/authController.js';
import { generateCaptcha, getActiveCaptchas } from '../controller/captchaController.js';

const router = express.Router();

// Rutas de autenticación
router.post('/registro', registrarUsuario);
router.post('/login', login);

// Rutas de CAPTCHA
router.get('/captcha/generate', generateCaptcha);
router.get('/captcha/active', getActiveCaptchas);

export default router;