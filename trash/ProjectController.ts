import type { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    // const project = new Project(req.body);
    // await project.save();
    try {
      // crear un proyecto (forma corta)
      await Project.create(req.body);
      res.send('Proyecto Creado Correctamente');
    } catch (error) {
      console.log(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      // obtener todos los proyectos
      const projects = await Project.find({});
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

      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      // actualizar un proyecto
      const project = await Project.findByIdAndUpdate(id, req.body);

      if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ error: error.message });
      }

      await project.save();
      res.send('Proyecto Actualizado');
    } catch (error) {
      console.log(error);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      // eliminar un proyecto (forma corta)
      // const project = await Project.findByIdAndDelete(id);

      // eliminar un proyecto (forma larga)
      const project = await Project.findById(id);

      if (!project) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ error: error.message });
      }

      await project.deleteOne();
      res.send('Proyecto Eliminado');
    } catch (error) {
      console.log(error);
    }
  };
}
