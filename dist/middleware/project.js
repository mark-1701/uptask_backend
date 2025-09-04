"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectExists = projectExists;
const Project_1 = __importDefault(require("../models/Project"));
/*
  Este middlware se encarga de verificar que el proyecto envíado a través del
  parámetro de la ruta existe.
*/
async function projectExists(req, res, next) {
    try {
        const { projectId } = req.params;
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            const error = new Error('Proyecto no encontrado');
            return res.status(404).json({ error: error.message });
        }
        // * Le suma el project al Request
        req.project = project;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Hubo un error' });
    }
}
//# sourceMappingURL=project.js.map