// model/userModel.js
import mysql from 'mysql';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear pool de conexiones usando variables de entorno
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tiendalego',
  port: process.env.DB_PORT || 3306
});

// Función helper para ejecutar queries
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

// Crear nuevo usuario
export const createUser = async (userData) => {
  const sql = `
    INSERT INTO usuarios (nombre, nombrecuenta, correo, contrasena, pais) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    userData.nombre,
    userData.nombrecuenta,
    userData.correo,
    userData.contrasena,
    userData.pais
  ];
  
  const result = await query(sql, params);
  return result.insertId;
};

export default pool;