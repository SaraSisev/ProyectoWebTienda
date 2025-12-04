import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token requerido"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Dividir en partes: header.body.signature
        const [headerB64, bodyB64, signature] = token.split(".");
        if (!headerB64 || !bodyB64 || !signature) {
            return res.status(403).json({
                success: false,
                message: "Token mal formado"
            });
        }

        const SECRET = process.env.JWT_SECRET || "mi_secreto_temporal_123";

        // Recalcular firma
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

        // Decodificar payload
        const payloadJson = Buffer.from(bodyB64, "base64url").toString();
        const payload = JSON.parse(payloadJson);

        // Validar expiración
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return res.status(401).json({
                success: false,
                message: "Token expirado"
            });
        }

        // Adjuntar usuario a la request
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

