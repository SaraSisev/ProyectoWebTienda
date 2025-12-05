// routes/checkoutRoutes.js
import express from "express";
import { finalizarCompra } from "../controller/checkoutController.js";
import { verificarToken } from "../middleware/authMiddleware.js";  

const router = express.Router();

router.post("/finalizar", verificarToken, finalizarCompra); 

export default router;