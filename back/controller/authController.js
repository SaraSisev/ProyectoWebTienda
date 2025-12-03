// controller/authController.js
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { 
  findUserByEmail, 
  findUserByUsername, 
  createUser, 
  updateLoginAttempts, 
  resetLoginAttempts, 
  blockUser,
  saveRecoveryCode,
  findUserByRecoveryCode,
  updatePasswordAndClearCode
} from '../model/userModel.js';
import { validateCaptcha } from './captchaController.js';

// Generar cupon 
const generateCoupon = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let coupon = "";
  for (let i = 0; i < 10; i++) {
    coupon += chars[Math.floor(Math.random() * chars.length)];
  }
  return coupon;
};

const sendWelcomeEmail = async (email, nombre, cupon) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Bienvenido a ${process.env.COMPANY_NAME}!`,
    html: `
      <div style="font-family: Arial; padding:20px; border-radius:10px; background:#f5f5f5">
        <h2 style="color:#333">¡Hola ${nombre}!</h2>
        <p>Gracias por registrarte en <strong>${process.env.COMPANY_NAME}</strong>.</p>
        
        <img src="${process.env.COMPANY_LOGO}" alt="Logo" width="150" />

        <p><i>${process.env.COMPANY_SLOGAN}</i></p>

        <h3 style="margin-top:20px">🎟️Tu cupón de bienvenida:</h3>
        <div style="background:#222; color:#fff; padding:10px 20px; width:fit-content; border-radius:5px; font-size:20px;">
          <strong>${cupon}</strong>
        </div>

        <p style="margin-top:20px">Úsalo en tu próxima compra</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Función para verificar contraseña con múltiples formatos
const verifyPassword = (password, storedHash) => {
  console.log('[VERIFY PASSWORD] Iniciando verificación...');
  console.log('[VERIFY PASSWORD] Contraseña ingresada:', password);
  console.log('[VERIFY PASSWORD] Hash almacenado:', storedHash);
  console.log('[VERIFY PASSWORD] Longitud del hash:', storedHash.length);
  console.log('[VERIFY PASSWORD] Contiene ":"?', storedHash.includes(':'));
  
  // Si la contraseña almacenada contiene ':', es el formato nuevo (salt:hash)
  if (storedHash.includes(':')) {
    console.log('[VERIFY PASSWORD] Usando formato salt:hash');
    try {
      const [salt, originalHash] = storedHash.split(':');
      console.log('[VERIFY PASSWORD] Salt extraído:', salt);
      console.log('[VERIFY PASSWORD] Hash original (primeros 20):', originalHash.substring(0, 20));
      
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      console.log('[VERIFY PASSWORD] Hash calculado (primeros 20):', hash.substring(0, 20));
      
      const isValid = hash === originalHash;
      console.log('[VERIFY PASSWORD] ¿Son iguales?', isValid);
      return isValid;
    } catch (error) {
      console.error('[VERIFY PASSWORD] Error al procesar hash:', error);
      return false;
    }
  } else {
    // Texto plano
    console.log('[VERIFY PASSWORD] Usando comparación de texto plano');
    const isValid = password === storedHash;
    console.log('[VERIFY PASSWORD] ¿Son iguales?', isValid);
    return isValid;
  }
};

// Función para hashear contraseña
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// CONTROLADOR: Registrar usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, nombrecuenta, correo, contrasena, contrasena2, pais } = req.body;

    console.log('[REGISTRO] Datos recibidos:', { nombre, nombrecuenta, correo, pais });

    // Validaciones
    if (!nombre || !nombrecuenta || !correo || !contrasena || !contrasena2 || !pais) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    if (contrasena !== contrasena2) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    if (contrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await findUserByEmail(correo);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este correo electrónico ya está registrado'
      });
    }

    // Verificar si el nombre de cuenta ya existe
    const existingUsername = await findUserByUsername(nombrecuenta);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Este nombre de usuario ya está registrado'
      });
    }

    // Hashear la contraseña
    const hashedPassword = hashPassword(contrasena);
    console.log('[REGISTRO] Contraseña hasheada:', hashedPassword.substring(0, 30) + '...');

    // Generar cupon unico para cada usuario
    const cupon = generateCoupon();
    console.log('[REGISTRO] Cupón generado:', cupon);

    // Crear el usuario
    const userData = {
      nombre,
      nombrecuenta,
      correo,
      contrasena: hashedPassword,
      pais,
      cupon
    };

    const userId = await createUser(userData);
    console.log('[REGISTRO] Usuario creado con ID:', userId);

    // Enviar correo de bienvenida
    await sendWelcomeEmail(correo, nombre, cupon);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: userId
    });

  } catch (error) {
    console.error('[REGISTRO] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// CONTROLADOR: Login con CAPTCHA
export const login = async (req, res) => {
  try {
    const { cuenta, contrasena, captchaId, captchaAnswer } = req.body;

    console.log('='.repeat(60));
    console.log('[LOGIN] INICIANDO PROCESO DE LOGIN');
    console.log('[LOGIN] Cuenta:', cuenta);
    console.log('[LOGIN] Contraseña ingresada:', contrasena);
    console.log('[LOGIN] CAPTCHA ID:', captchaId);
    console.log('='.repeat(60));

    // Validar campos obligatorios
    if (!cuenta || !contrasena || !captchaId || !Array.isArray(captchaAnswer)) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios',
        message: 'Todos los campos son requeridos'
      });
    }

    // Buscar usuario por nombre de cuenta o email
    let user = await findUserByUsername(cuenta);
    if (!user) {
      user = await findUserByEmail(cuenta);
    }

    if (!user) {
      console.log('[LOGIN] ❌ Usuario NO encontrado');
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }

    console.log('[LOGIN] ✓ Usuario encontrado:', user.nombrecuenta);
    console.log('[LOGIN] Datos del usuario:', {
      id: user.id,
      nombre: user.nombre,
      nombrecuenta: user.nombrecuenta,
      correo: user.correo,
      intentos_fallidos: user.intentos_fallidos,
      bloqueado_hasta: user.bloqueado_hasta
    });
    console.log('[LOGIN] Contraseña almacenada en BD:', user.contrasena);

    // Verificar si la cuenta está bloqueada
    if (user.bloqueado_hasta) {
      const now = new Date();
      const blockedUntil = new Date(user.bloqueado_hasta);
      
      if (now < blockedUntil) {
        const minutesLeft = Math.ceil((blockedUntil - now) / 60000);
        console.log('[LOGIN] Cuenta bloqueada hasta:', blockedUntil);
        return res.status(429).json({
          success: false,
          error: 'Cuenta bloqueada',
          message: `Tu cuenta está bloqueada. Intenta nuevamente en ${minutesLeft} minuto(s)`
        });
      } else {
        console.log('[LOGIN] Bloqueo expirado, reseteando intentos');
        await resetLoginAttempts(user.id);
      }
    }

    // Validar CAPTCHA
    const isCaptchaValid = validateCaptcha(captchaId, captchaAnswer);
    
    if (!isCaptchaValid) {
      console.log('[LOGIN] ❌ CAPTCHA inválido');
      return res.status(401).json({
        success: false,
        error: 'CAPTCHA inválido o expirado',
        message: 'Por favor, recarga el CAPTCHA e intenta nuevamente'
      });
    }

    console.log('[LOGIN] ✓ CAPTCHA válido');

    // Verificar contraseña
    console.log('[LOGIN] Verificando contraseña...');
    const isPasswordValid = verifyPassword(contrasena, user.contrasena);
    console.log('[LOGIN] Resultado de verificación:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('[LOGIN] ❌ Contraseña incorrecta');
      
      // Incrementar intentos fallidos
      const newAttempts = (user.intentos_fallidos || 0) + 1;
      console.log('[LOGIN] Intentos fallidos:', newAttempts);
      
      if (newAttempts >= 3) {
        const blockedUntil = new Date(Date.now() + 5 * 60 * 1000);
        await blockUser(user.id, blockedUntil);
        console.log('[LOGIN] Cuenta bloqueada hasta:', blockedUntil);
        
        return res.status(429).json({
          success: false,
          error: 'Cuenta bloqueada',
          message: 'Has superado el número máximo de intentos. Tu cuenta está bloqueada por 5 minutos.'
        });
      } else {
        await updateLoginAttempts(user.id, newAttempts);
        
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas',
          message: `Usuario o contraseña incorrectos. Intentos restantes: ${3 - newAttempts}`
        });
      }
    }

    // Login exitoso
    await resetLoginAttempts(user.id);
    console.log('[LOGIN] ✓✓✓ LOGIN EXITOSO ✓✓✓');

    const token = generateSimpleToken({
      id: user.id,
      cuenta: user.nombrecuenta,
      email: user.correo,
      rol: user.rol
    });

    return res.status(200).json({
      success: true,
      message: 'Acceso permitido',
      token: token,
      usuario: {
        id: user.id,
        cuenta: user.nombrecuenta,
        nombre: user.nombre,
        email: user.correo,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Error en el servidor',
      details: error.message
    });
  }
};

function generateSimpleToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  })).toString('base64url');
  
  const SECRET = process.env.JWT_SECRET || 'mi_secreto_temporal_123';
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  
  return `${header}.${body}.${signature}`;
}

// Formulario contacto 
export const enviarMensajeContacto = async (req, res) => {
  const { nombre, correo, mensaje } = req.body;
  console.log('[CONTACTO RECIBIDO]', { nombre, correo, mensaje });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Confirmación de contacto - TiendaLego',
      html: `
        <h2>${process.env.COMPANY_NAME}</h2>
        <p><strong>${process.env.COMPANY_SLOGAN}</strong></p>
        <hr>
        <p>Hola ${nombre},</p>
        <p>Gracias por contactarnos. Recibimos tu mensaje:</p>
        <blockquote>${mensaje}</blockquote>
      `
    });

    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('[CONTACTO ERROR]', error);
    res.json({ success: false, message: 'Error al enviar el mensaje' });
  }
};

// SOLICITAR RECUPERACIÓN CON CÓDIGO
export const solicitarRecuperacion = async (req, res) => {
  try {
    const { correo } = req.body;
    console.log('[RECUPERACIÓN] Solicitud para:', correo);

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico es obligatorio'
      });
    }

    const user = await findUserByEmail(correo);
    
    if (!user) {
      // Por seguridad, no revelar si existe el correo
      return res.status(200).json({
        success: true,
        message: 'Si el correo existe, recibirás un código de recuperación'
      });
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Código válido por 15 minutos
    const expirationDate = new Date(Date.now() + 15 * 60 * 1000);
    
    await saveRecoveryCode(correo, code, expirationDate);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Código de Recuperación - TiendaLego',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Recuperación de Contraseña</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hola ${user.nombre},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Recibimos una solicitud para restablecer tu contraseña. 
              Usa el siguiente código de verificación:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: white; 
                          border: 3px dashed #667eea; 
                          display: inline-block; 
                          padding: 20px 40px; 
                          border-radius: 10px;">
                <p style="margin: 0; color: #999; font-size: 14px;">Tu código es:</p>
                <h1 style="margin: 10px 0; 
                           color: #667eea; 
                           font-size: 48px; 
                           letter-spacing: 8px;">
                  ${code}
                </h1>
              </div>
            </div>
            
            <div style="background-color: #fff3cd; 
                        border-left: 4px solid #ffc107; 
                        padding: 15px; 
                        margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                ⚠️ <strong>Este código expirará en 15 minutos.</strong>
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Si no solicitaste este código, ignora este correo.
            </p>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} ${process.env.COMPANY_NAME}<br>
              ${process.env.COMPANY_SLOGAN}
            </p>
          </div>
        </div>
      `
    });

    console.log('[RECUPERACIÓN] Código enviado:', code);

    res.status(200).json({
      success: true,
      message: 'Si el correo existe, recibirás un código de recuperación'
    });

  } catch (error) {
    console.error('[RECUPERACIÓN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud'
    });
  }
};

// VERIFICAR CÓDIGO Y RESTABLECER CONTRASEÑA
export const restablecerConCodigo = async (req, res) => {
  try {
    const { codigo, nuevaContrasena, confirmarContrasena } = req.body;

    console.log('[RESTABLECER] Código recibido');

    if (!codigo || !nuevaContrasena || !confirmarContrasena) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    if (nuevaContrasena !== confirmarContrasena) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    if (nuevaContrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar usuario por código
    const user = await findUserByRecoveryCode(codigo);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = hashPassword(nuevaContrasena);

    // Actualizar contraseña
    await updatePasswordAndClearCode(user.id, hashedPassword);

    console.log('[RESTABLECER] Contraseña actualizada para:', user.nombrecuenta);

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('[RESTABLECER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer contraseña'
    });
  }
};