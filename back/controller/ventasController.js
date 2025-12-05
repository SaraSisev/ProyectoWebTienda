// controller/ventasController.js
import {
  getVentasPorCategoria,
  getTotalVentas,
  getVentasRecientes
} from '../model/ventasModel.js';

// Obtener ventas por categoría (para la gráfica)
export const obtenerVentasPorCategoria = async (req, res) => {
  try {
    console.log('[VENTAS] Obteniendo ventas por categoría...');
    
    const ventas = await getVentasPorCategoria();
    
    res.status(200).json({
      success: true,
      data: ventas
    });
    
  } catch (error) {
    console.error('[VENTAS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas por categoría',
      error: error.message
    });
  }
};

// Obtener total de ventas
export const obtenerTotalVentas = async (req, res) => {
  try {
    console.log('[VENTAS] Obteniendo total de ventas...');
    
    const totales = await getTotalVentas();
    
    res.status(200).json({
      success: true,
      data: totales
    });
    
  } catch (error) {
    console.error('[TOTAL VENTAS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener total de ventas',
      error: error.message
    });
  }
};

// Obtener ventas recientes
export const obtenerVentasRecientes = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    
    console.log('[VENTAS] Obteniendo ventas recientes...');
    
    const ventas = await getVentasRecientes(limite);
    
    res.status(200).json({
      success: true,
      data: ventas,
      total: ventas.length
    });
    
  } catch (error) {
    console.error('[VENTAS RECIENTES ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas recientes',
      error: error.message
    });
  }
};