// controller/wishlistController.js
import {
  addToWishlist,
  getWishlistByUser,
  countWishlistItems
} from '../model/wishlistModel.js';

// Agregar producto a wishlist
export const agregarAWishlist = async (req, res) => {
  try {
    const { productoId } = req.body;
    const userId = req.user.id; // Viene del middleware de autenticación
    
    console.log('[WISHLIST] Agregando producto:', { userId, productoId });
    
    if (!productoId) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto es requerido'
      });
    }
    
    const result = await addToWishlist(userId, productoId);
    
    if (result.alreadyExists) {
      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: result.message
      });
    }
    
    console.log('[WISHLIST] Producto agregado exitosamente');
    
    res.status(201).json({
      success: true,
      message: 'Producto agregado a tu lista de deseos',
      wishlistId: result.insertId
    });
    
  } catch (error) {
    console.error('[WISHLIST ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar a lista de deseos',
      error: error.message
    });
  }
};

// Obtener wishlist del usuario
export const obtenerWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('[WISHLIST] Obteniendo wishlist de usuario:', userId);
    
    const wishlist = await getWishlistByUser(userId);
    
    res.status(200).json({
      success: true,
      data: wishlist,
      total: wishlist.length
    });
    
  } catch (error) {
    console.error('[GET WISHLIST ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lista de deseos',
      error: error.message
    });
  }
};

// Obtener contador de wishlist
export const contarWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await countWishlistItems(userId);
    
    res.status(200).json({
      success: true,
      count: count
    });
    
  } catch (error) {
    console.error('[COUNT WISHLIST ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al contar elementos',
      error: error.message
    });
  }
};