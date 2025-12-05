// middleware/authMiddleware.js


import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Cambia esto: export default function authMiddleware(req, res, next)
export function verificarToken(req, res, next) {  // ⬅️ CAMBIAR
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token requerido"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const [headerB64, bodyB64, signature] = token.split(".");
        if (!headerB64 || !bodyB64 || !signature) {
            return res.status(403).json({
                success: false,
                message: "Token mal formado"
            });
        }

        const SECRET = process.env.JWT_SECRET || "mi_secreto_temporal_123";

        const expectedSignature = crypto
            .createHmac("sha256", SECRET)
            .update(`${headerB64}.${bodyB64}`)
            .digest("base64url");

        if (expectedSignature !== signature) {
            return res.status(403).json({
                success: false,
                message: "Token inválido"
            });
        }

        const payloadJson = Buffer.from(bodyB64, "base64url").toString();
        const payload = JSON.parse(payloadJson);

        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return res.status(401).json({
                success: false,
                message: "Token expirado"
            });
        }

        req.user = payload;
        next();
    } catch (error) {
        console.error("[AUTH MIDDLEWARE ERROR]", error);
        return res.status(403).json({
            success: false,
            message: "Token inválido"
        });
    }
}

// También exporta como default para compatibilidad
export default verificarToken;
