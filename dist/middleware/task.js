"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskExists = taskExists;
exports.taskBelongsToProject = taskBelongsToProject;
exports.hasAuthorization = hasAuthorization;
const Task_1 = __importDefault(require("../models/Task"));
/*
  Este middleware se encarga de verificar que la tarea envíada a través del
  taskId existe.
*/
async function taskExists(req, res, next) {
    try {
        const { taskId } = req.params;
        const task = await Task_1.default.findById(taskId);
        if (!task) {
            const error = new Error('Tarea no encontrado');
            return res.status(404).json({ error: error.message });
        }
        // * Le suma el project al Request
        req.task = task;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Hubo un error' });
    }
}
/*
  Este middleware se encarga de verificar que la tarea del request pertenece al
  proyecto del request. En resumen, se encarga de verificar que la tarea
  pertenece al proyecto.
*/
function taskBelongsToProject(req, res, next) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Acción no valida');
        return res.status(404).json({ error: error.message });
    }
    next();
}
/*
  Este middlware verifica que el usuario autenticado sea el manager del proyecto
*/
function hasAuthorization(req, res, next) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Acción no valida');
        return res.status(404).json({ error: error.message });
    }
    next();
}
//# sourceMappingURL=task.js.map