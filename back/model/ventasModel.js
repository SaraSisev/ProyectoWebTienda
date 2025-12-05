// model/ventasModel.js
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

// Obtener ventas por categoría
export const getVentasPorCategoria = async () => {
  const sql = `
    SELECT 
      p.categoria,
      COUNT(v.id) as total_ventas,
      SUM(v.cantidad) as unidades_vendidas,
      SUM(v.subtotal) as total_ingresos
    FROM ventas v
    INNER JOIN productos p ON v.producto_id = p.id
    GROUP BY p.categoria
    ORDER BY total_ingresos DESC
  `;
  
  return await query(sql, []);
};

// Obtener total de ventas de la empresa
export const getTotalVentas = async () => {
  const sql = `
    SELECT 
      COUNT(DISTINCT id) as total_ordenes,
      SUM(cantidad) as total_productos_vendidos,
      SUM(subtotal) as ingresos_totales
    FROM ventas
  `;
  
  const results = await query(sql, []);
  return results[0];
};

// Obtener ventas recientes
export const getVentasRecientes = async (limite = 10) => {
  const sql = `
    SELECT 
      v.id,
      v.cantidad,
      v.precio_unitario,
      v.subtotal,
      v.fecha_venta,
      u.nombre as usuario,
      p.nombre as producto,
      p.categoria
    FROM ventas v
    INNER JOIN usuarios u ON v.usuario_id = u.id
    INNER JOIN productos p ON v.producto_id = p.id
    ORDER BY v.fecha_venta DESC
    LIMIT ?
  `;
  
  return await query(sql, [limite]);
};

// Registrar una nueva venta
export const registrarVenta = async (ventaData) => {
  const sql = `
    INSERT INTO ventas (usuario_id, producto_id, cantidad, precio_unitario, subtotal)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const params = [
    ventaData.usuario_id,
    ventaData.producto_id,
    ventaData.cantidad,
    ventaData.precio_unitario,
    ventaData.subtotal
  ];
  
  const result = await query(sql, params);
  return result.insertId;
};

export default pool;