// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import ventasRoutes from './routes/ventasRoutes.js';
import userRoutes from './routes/userRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';  
import cuponRoutes from './routes/cuponRoutes.js';        
import wishlistRoutes from './routes/wishlistRoutes.js';  

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api', productRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/checkout', checkoutRoutes);   
app.use('/api/cupon', cuponRoutes);         
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/ventas', ventasRoutes);   

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API Tienda en línea - Servidor funcionando',
    port: PORT 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});