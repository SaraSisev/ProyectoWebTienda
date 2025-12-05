// model/userModel.js
import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  port: process.env.DB_PORT || 3306
});

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

// Buscar usuario por email
export const findUserByEmail = async (email) => {
  const sql = 'SELECT * FROM usuarios WHERE correo = ?';
  const results = await query(sql, [email]);
  return results[0];
};

// Buscar usuario por nombre de cuenta
export const findUserByUsername = async (username) => {
  const sql = 'SELECT * FROM usuarios WHERE nombrecuenta = ?';
  const results = await query(sql, [username]);
  return results[0];
};

// Crear nuevo usuario
export const createUser = async (userData) => {
  const sql = `
    INSERT INTO usuarios (nombre, nombrecuenta, correo, contrasena, pais, cupon) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    userData.nombre,
    userData.nombrecuenta,
    userData.correo,
    userData.contrasena,
    userData.pais,
    userData.cupon 
  ];
  
  const result = await query(sql, params);
  return result.insertId;
};

// Actualizar intentos fallidos
export const updateLoginAttempts = async (userId, attempts) => {
  const sql = 'UPDATE usuarios SET intentos_fallidos = ? WHERE id = ?';
  await query(sql, [attempts, userId]);
};

// Resetear intentos fallidos
export const resetLoginAttempts = async (userId) => {
  const sql = 'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?';
  await query(sql, [userId]);
};

// Bloquear usuario
export const blockUser = async (userId, blockedUntil) => {
  const sql = 'UPDATE usuarios SET bloqueado_hasta = ?, intentos_fallidos = 0 WHERE id = ?';
  await query(sql, [blockedUntil, userId]);
};

// Guardar código de recuperación
export const saveRecoveryCode = async (email, code, expirationDate) => {
  const sql = 'UPDATE usuarios SET codigo_recuperacion = ?, codigo_expiracion = ? WHERE correo = ?';
  await query(sql, [code, expirationDate, email]);
};

// Buscar usuario por código de recuperación
export const findUserByRecoveryCode = async (code) => {
  const sql = 'SELECT * FROM usuarios WHERE codigo_recuperacion = ? AND codigo_expiracion > NOW()';
  const results = await query(sql, [code]);
  return results[0];
};

// Actualizar contraseña y limpiar código
export const updatePasswordAndClearCode = async (userId, newPassword) => {
  const sql = 'UPDATE usuarios SET contrasena = ?, codigo_recuperacion = NULL, codigo_expiracion = NULL WHERE id = ?';
  await query(sql, [newPassword, userId]);
};

// Buscar usuario por ID
export const findUserById = async (userId) => {
  const sql = 'SELECT * FROM usuarios WHERE id = ?';
  const results = await query(sql, [userId]);
  return results[0];
};

// Buscar usuario por cupón
export const findUserByCupon = async (cupon) => {
  const sql = 'SELECT * FROM usuarios WHERE cupon = ?';
  const results = await query(sql, [cupon]);
  return results[0];
};

// Eliminar cupón del usuario
export const removeUserCoupon = async (userId) => {
  const sql = 'UPDATE usuarios SET cupon = NULL WHERE id = ?';
  await query(sql, [userId]);
};

export default pool;