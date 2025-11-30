// controller/authController.js
import crypto from 'crypto';
import { findUserByEmail, createUser } from '../model/userModel.js';

// Función para hashear contraseña
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// Función para verificar contraseña
export const verifyPassword = (password, storedHash) => {
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

// CONTROLADOR: Registrar usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, nombrecuenta, correo, contrasena, contrasena2, pais } = req.body;

    // 1. Validar que todos los campos estén presentes
    if (!nombre || !nombrecuenta || !correo || !contrasena || !contrasena2 || !pais) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // 2. Validar que las contraseñas coincidan
    if (contrasena !== contrasena2) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    // 3. Validar longitud mínima de contraseña
    if (contrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // 4. Verificar si el email ya existe
    const existingUser = await findUserByEmail(correo);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este correo electrónico ya está registrado'
      });
    }

    // 5. Hashear la contraseña
    const hashedPassword = hashPassword(contrasena);

    // 6. Crear el usuario en la base de datos
    const userData = {
      nombre,
      nombrecuenta,
      correo,
      contrasena: hashedPassword,
      pais
    };

    const userId = await createUser(userData);

    // 7. Responder con éxito
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: userId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};