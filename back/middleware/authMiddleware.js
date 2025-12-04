// middleware/authMiddleware.js
import crypto from 'crypto';

export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Decodificar el token JWT simple
    const [header, payload, signature] = token.split('.');
    
    if (!header || !payload || !signature) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    // Verificar firma
    const SECRET = process.env.JWT_SECRET || 'mi_secreto_temporal_123';
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    // Decodificar payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString()
    );
    
    // Verificar expiración
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    // Agregar info del usuario al request
    req.user = {
      id: decodedPayload.id,
      cuenta: decodedPayload.cuenta,
      email: decodedPayload.email,
      rol: decodedPayload.rol
    };
    
    next();
    
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]', error);
    return res.status(401).json({
      success: false,
      message: 'Error al verificar token'
    });
  }
};