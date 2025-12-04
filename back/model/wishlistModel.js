// model/wishlistModel.js
import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tiendalego',
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

// Agregar producto a la wishlist
export const addToWishlist = async (userId, productId) => {
  // Primero verificar si ya existe
  const checkSql = 'SELECT * FROM wishlist WHERE usuario_id = ? AND producto_id = ?';
  const existing = await query(checkSql, [userId, productId]);
  
  if (existing.length > 0) {
    return { alreadyExists: true, message: 'El producto ya está en tu lista de deseos' };
  }
  
  const sql = 'INSERT INTO wishlist (usuario_id, producto_id) VALUES (?, ?)';
  const result = await query(sql, [userId, productId]);
  return { success: true, insertId: result.insertId };
};

// Obtener wishlist de un usuario con detalles del producto
export const getWishlistByUser = async (userId) => {
  const sql = `
    SELECT 
      w.id as wishlist_id,
      w.fecha_agregado,
      p.id as producto_id,
      p.imagen,
      p.nombre,
      p.descripcion,
      p.precio,
      p.disponibilidad,
      p.categoria
    FROM wishlist w
    INNER JOIN productos p ON w.producto_id = p.id
    WHERE w.usuario_id = ?
    ORDER BY w.fecha_agregado DESC
  `;
  
  const results = await query(sql, [userId]);
  
  // Asegurar que las imágenes tengan un placeholder si están vacías
  return results.map(item => {
    if (!item.imagen || item.imagen === '') {
      item.imagen = 'https://via.placeholder.com/400x400?text=Sin+Imagen';
    }
    return item;
  });
};

// Contar productos en wishlist de un usuario
export const countWishlistItems = async (userId) => {
  const sql = 'SELECT COUNT(*) as total FROM wishlist WHERE usuario_id = ?';
  const results = await query(sql, [userId]);
  return results[0].total;
};

export default pool;