import type { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    // Asigna un manager
    project.manager = req.user.id;

    try {
      // crear un proyecto (forma corta)
      // await Project.create(req.body);

      await project.save();
      res.send('Proyecto Creado Correctamente');
    } catch (error) {
      console.log(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      // obtener todos los proyectos con condiciones
      const projects = await Project.find({
        $or: [
          {
            // solo traer los proyectos que tienen el usuario manager
            manager: { $in: req.user.id }
          },
          {
            // busca si el usuario esta en ese equipo
            team: { $in: req.user.id }
          }
        ]
      });
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    // console.log(req.params); // { id: '1' }
    const { id } = req.params;
    try {
      // obtener proyecto por su ID
      const project = await Project.findById(id).populate('tasks');

      if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ error: error.message });
      }

      // ? Verificar que el proyecto sea del usuario que consulta
      // también se incluye a los colaboradores del proyecto
      if (
        project.manager.toString() !== req.user.id.toString() &&
        !project.team.includes(req.user.id)
      ) {
        const error = new Error('Solo el Manager puede mostrar el proyecto');
        return res.status(404).json({ error: error.message });
      }

      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.projectName = req.body.projectName;
      req.project.clientName = req.body.clientName;
      req.project.description = req.body.description;

      await req.project.save();
      res.send('Proyecto Actualizado');
    } catch (error) {
      console.log(error);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.send('Proyecto Eliminado');
    } catch (error) {
      console.log(error);
    }
  };
}
