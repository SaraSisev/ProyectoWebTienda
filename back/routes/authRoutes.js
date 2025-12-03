import express from 'express';
import { 
  registrarUsuario, 
  login,
  solicitarRecuperacion,
  restablecerConCodigo
} from '../controller/authController.js';
import { generateCaptcha, getActiveCaptchas } from '../controller/captchaController.js';

const router = express.Router();

// Rutas de autenticación
router.post('/registro', registrarUsuario);
router.post('/login', login);

// Rutas de CAPTCHA
router.get('/captcha/generate', generateCaptcha);
router.get('/captcha/active', getActiveCaptchas);

// Rutas de recuperación de contraseña
router.post('/recuperacion/solicitar', solicitarRecuperacion);
router.post('/recuperacion/restablecer', restablecerConCodigo);

export default router;