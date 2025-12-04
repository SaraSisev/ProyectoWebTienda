// model/productModel.js
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

// ✅ FUNCIÓN SIMPLE: Solo asegurar que haya una imagen
function asegurarImagen(productos) {
  return productos.map(producto => {
    if (!producto.imagen || producto.imagen === '') {
      producto.imagen = 'https://via.placeholder.com/400x400?text=Sin+Imagen';
    }
    return producto;
  });
}

// Obtener todos los productos
export const getAllProducts = async () => {
  const sql = 'SELECT * FROM productos ORDER BY id DESC';
  const results = await query(sql, []);
  return asegurarImagen(results);
};

// Obtener productos por categoría
export const getProductsByCategory = async (categoria) => {
  const sql = 'SELECT * FROM productos WHERE categoria = ? ORDER BY id DESC';
  const results = await query(sql, [categoria]);
  return asegurarImagen(results);
};

// Obtener un producto por ID
export const getProductById = async (id) => {
  const sql = 'SELECT * FROM productos WHERE id = ?';
  const results = await query(sql, [id]);
  if (results.length === 0) return null;
  
  const productos = asegurarImagen(results);
  return productos[0];
};

// Crear nuevo producto
export const createProduct = async (productData) => {
  const sql = `
    INSERT INTO productos (imagen, nombre, descripcion, precio, disponibilidad, categoria) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    productData.imagen,
    productData.nombre,
    productData.descripcion,
    productData.precio,
    productData.disponibilidad,
    productData.categoria
  ];
  
  const result = await query(sql, params);
  return result.insertId;
};

// Actualizar producto
export const updateProduct = async (id, productData) => {
  const sql = `
    UPDATE productos 
    SET imagen = ?, nombre = ?, descripcion = ?, precio = ?, disponibilidad = ?, categoria = ? 
    WHERE id = ?
  `;
  const params = [
    productData.imagen,
    productData.nombre,
    productData.descripcion,
    productData.precio,
    productData.disponibilidad,
    productData.categoria,
    id
  ];
  
  const result = await query(sql, params);
  return result.affectedRows > 0;
};

// Eliminar producto
export const deleteProduct = async (id) => {
  const sql = 'DELETE FROM productos WHERE id = ?';
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

// Obtener inventario por categoría
export const getInventoryByCategory = async () => {
  const sql = `
    SELECT 
      categoria,
      COUNT(*) as total_productos,
      SUM(disponibilidad) as total_unidades
    FROM productos
    GROUP BY categoria
  `;
  return await query(sql, []);
};

// Obtener estadísticas generales
export const getProductStats = async () => {
  const sql = `
    SELECT 
      COUNT(*) as total_productos,
      SUM(disponibilidad) as total_unidades,
      SUM(precio * disponibilidad) as valor_inventario
    FROM productos
  `;
  const results = await query(sql, []);
  return results[0];
};

export default pool;