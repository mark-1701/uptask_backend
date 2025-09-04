"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        const error = new Error('No Autorizado');
        return res.status(401).json({ error: error.message });
    }
    // extraer mensaje sin bearer
    const token = bearer.split(' ')[1];
    try {
        // * Verificar la veracida del token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // * Verificar si el id del usuario del token existe
        if (typeof decoded === 'object' && decoded.id) {
            // solo seleccionar esas 3 propiedades
            const user = await User_1.default.findById(decoded.id).select('_id name email');
            if (user) {
                // pasarle user al req.user
                req.user = user;
            }
            else {
                // Usuario no existe
                res.status(500).json({ error: 'Token no Válido' });
            }
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Token no Válido' });
    }
    next();
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map