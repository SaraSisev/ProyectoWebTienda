// routes/checkoutRoutes.js
import express from "express";
import { finalizarCompra } from "../controller/checkoutController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Solo usuarios logueados pueden comprar
router.post("/finalizar", authMiddleware, finalizarCompra);

export default router;
