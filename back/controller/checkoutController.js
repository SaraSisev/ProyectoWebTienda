// controller/checkoutController.js
import express from "express";
import nodemailer from "nodemailer";

import { findUserById, findUserByCupon, removeUserCoupon } from "../model/userModel.js";
import { getProductById, updateProduct } from "../model/productModel.js";

import generatePdfBuffer from "../utils/pdfGenerator.js";

const router = express.Router();

export const finalizarCompra = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cargar usuario REAL desde BD
    const usuarioReal = await findUserById(userId);

    if (!usuarioReal) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Nombre y correo correctos
    const userEmail = usuarioReal.correo;
    const userName = usuarioReal.nombre;

    const { carrito, metodoPago, envio: datosEnvio, cupon } = req.body;

    // Validaciones básicas
    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ success: false, message: "Carrito vacío" });
    }

    if (!metodoPago) {
      return res.status(400).json({ success: false, message: "Método de pago requerido" });
    }

    if (!datosEnvio || !datosEnvio.nombre || !datosEnvio.direccion) {
      return res.status(400).json({ success: false, message: "Datos de envío incompletos" });
    }

    // ==========================
    // CUPÓN
    // ==========================
    let descuento = 0;
    let cuponValido = false;

    if (cupon && cupon.trim() !== "") {
      const usuarioConCupon = await findUserByCupon(cupon);

      if (!usuarioConCupon) {
        return res.status(400).json({ success: false, message: "Cupón inválido" });
      }

      if (usuarioConCupon.id !== userId) {
        return res.status(403).json({ success: false, message: "Ese cupón no te pertenece" });
      }

      cuponValido = true;
    }

    // ==========================
    // CALCULAR TOTAL Y ACTUALIZAR INVENTARIO
    // ==========================
    let subtotal = 0;

    for (const item of carrito) {
      subtotal += parseFloat(item.precio) * item.cantidad;

      const productoBD = await getProductById(item.id);
      
      if (!productoBD) {
        return res.status(400).json({
          success: false,
          message: `Producto no encontrado: ${item.nombre}`
        });
      }

      const nuevaCantidad = productoBD.disponibilidad - item.cantidad;

      if (nuevaCantidad < 0) {
        return res.status(400).json({
          success: false,
          message: `No hay inventario suficiente para ${productoBD.nombre}`
        });
      }

      await updateProduct(item.id, {
        ...productoBD,
        disponibilidad: nuevaCantidad
      });
    }

    const impuestos = subtotal * 0.16;
    const envio = 150;

    if (cuponValido) {
      descuento = subtotal * 0.10; // 10%
    }

    const total = subtotal - descuento + impuestos + envio;

    // ==========================
    // GENERAR PDF
    // ==========================
    const pdfBuffer = await generatePdfBuffer({
      userName,
      userEmail,
      carrito,
      subtotal,
      descuento,
      impuestos,
      envio,
      total,
      cuponUsado: cuponValido ? cupon : null,
      datosEnvio,
      metodoPago
    });

    // ==========================
    // ENVIAR EMAIL
    // ==========================
    try {
      // Configurar transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Correo al usuario con PDF adjunto
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'BlockWorld'}" <${process.env.EMAIL_USER}>`,
        to: userEmail, // ✅ CORREGIDO: usar userEmail directamente
        subject: "Gracias por tu compra - BlockWorld",
        html: `
          <div style="font-family: Arial, sans-serif; text-align:center; padding: 20px;">
            <h2>¡Hola ${userName}!</h2>
            <p>Gracias por tu compra en <strong>${process.env.COMPANY_NAME || 'BlockWorld'}</strong>.</p>
            <p>Adjunto encontrarás tu nota de compra en PDF.</p>
            <p><em>${process.env.COMPANY_SLOGAN || 'Construye aventuras, colecciona momentos'}</em></p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">Total: $${total.toFixed(2)}</p>
          </div>
        `,
        attachments: [
          {
            filename: "nota_compra.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado a ${userEmail}`);

    } catch (emailError) {
      console.error("[EMAIL ERROR]", emailError);
      // NO hacemos return aquí, solo registramos el error
      // La compra se procesó correctamente aunque falle el email
    }

    // ==========================
    // BORRAR CUPÓN USADO
    // ==========================
    if (cuponValido) {
      await removeUserCoupon(userId);
      console.log(`✅ Cupón eliminado del usuario ${userId}`);
    }

    // ==========================
    // RESPUESTA EXITOSA
    // ==========================
    return res.json({
      success: true,
      message: "Compra finalizada. La nota se envió a tu correo.",
      total,
      cuponAplicado: cuponValido
    });

  } catch (error) {
    console.error("[CHECKOUT ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Error en el procesamiento de compra"
    });
  }
};

export default router;