// routes/cuponRoutes.js
import express from "express";
import { findUserByCupon } from "../model/userModel.js";

const router = express.Router();

router.post("/verificar", async (req, res) => {
  const { cupon, userId } = req.body;

  try {
    const usuario = await findUserByCupon(cupon.trim());
    if (!usuario) {
      return res.json({ success: false, message: "Cupón inválido" });
    }
    if (usuario.id !== parseInt(userId)) {
      return res.json({ success: false, message: "Ese cupón no te pertenece" });
    }
    return res.json({ success: true, descuento: 10 });
  } catch (err) {
    console.error("[CUPON ERROR]", err);
    return res.json({ success: false, message: "No se pudo verificar el cupón" });
  }
});

export default router;
