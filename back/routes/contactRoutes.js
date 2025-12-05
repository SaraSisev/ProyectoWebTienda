import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  if (!nombre || !correo || !mensaje) {
    return res.json({
      success: false,
      message: "Todos los campos son obligatorios"
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Correo a tu empresa
    const mailToCompany = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Nuevo mensaje de contacto - ${nombre}`,
      html: `
        <h2>Nuevo mensaje recibido</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `
    };

    await transporter.sendMail(mailToCompany);

    //Correo de confirmación al usuario
    const mailToUser = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: `Recibimos tu mensaje`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align:center;">
          <img src="${process.env.COMPANY_LOGO}" alt="Logo" width="150" />
          <h2>¡Hola ${nombre}!</h2>
          <p>Gracias por contactarnos. En breve será atendido tu mensaje.</p>
          <p><strong>${process.env.COMPANY_NAME}</strong></p>
          <p><em>${process.env.COMPANY_SLOGAN}</em></p>
        </div>
      `
    };

    await transporter.sendMail(mailToUser);

    return res.json({
      success: true,
      message: "Tu mensaje ha sido enviado correctamente, espera una respuesta al correo"
    });

  } catch (error) {
    console.error("[EMAIL ERROR]", error);
    return res.json({
      success: false,
      message: "Error al enviar el correo"
    });
  }
});

export default router;