// routes/userRoutes.js
import express from 'express';
import { findUserById } from '../model/userModel.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/usuarios/:id - Obtener datos del usuario
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Verificar que el usuario solo pueda ver su propia información
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver esta información'
      });
    }

    const usuario = await findUserById(userId);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No enviar datos sensibles
    const { contrasena, codigo_recuperacion, codigo_expiracion, ...usuarioSeguro } = usuario;

    console.log('[GET USER] Usuario encontrado:', usuarioSeguro.nombrecuenta, 'País:', usuarioSeguro.pais);

    res.json({
      success: true,
      usuario: usuarioSeguro
    });

  } catch (error) {
    console.error('[GET USER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del usuario'
    });
  }
});

export default router;