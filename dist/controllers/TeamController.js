"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberController = void 0;
const User_1 = __importDefault(require("../models/User"));
const Project_1 = __importDefault(require("../models/Project"));
// TODO: No permitir que el manager se incluya en el proyecto
class TeamMemberController {
    static findMemberByEmail = async (req, res) => {
        const { email } = req.body;
        // Find user
        const user = await User_1.default.findOne({ email }).select('id email name');
        // usuario no encontrado del email pasado
        if (!user) {
            const error = new Error('Usuario no Encontrado');
            return res.status(404).json({ error: error.message });
        }
        res.json(user);
    };
    static getProjectTeam = async (req, res) => {
        // populamos para traernos toda la información de ese id
        const project = await Project_1.default.findById(req.project.id).populate({
            path: 'team',
            // para excluir el password
            select: 'id email name'
        });
        res.json(project.team);
    };
    static addMemberById = async (req, res) => {
        const { id } = req.body;
        // Find user
        const user = await User_1.default.findById(id).select('id');
        if (!user) {
            const error = new Error('Usuario no Encontrado');
            return res.status(404).json({ error: error.message });
        }
        // ? Retornar error si el usuario ya esta incluido en el proyecto
        // some retorna un true si encuentra una coincidencía
        if (req.project.team.some(team => team.toString() === id)) {
            const error = new Error('El usuario ya existe en el proyecto');
            return res.status(409).json({ error: error.message });
        }
        req.project.team.push(user.id);
        await req.project.save();
        res.send('Usuario agregado correctamente');
    };
    static removeMemberById = async (req, res) => {
        const { userId } = req.params;
        // ? Verificar que el usuario exista en el proyecto
        if (!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('El usuario no existen en el proyecto');
            return res.status(409).json({ error: error.message });
        }
        // ? Filtrar los usuarios
        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId);
        await req.project.save();
        res.send('Usuario eliminado correctamente');
    };
}
exports.TeamMemberController = TeamMemberController;
//# sourceMappingURL=TeamController.js.map