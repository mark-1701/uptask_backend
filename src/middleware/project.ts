import type { Request, Response, NextFunction } from 'express';
import Project, { IProject } from '../models/Project';

// * Reescribir scope global del Request
declare global {
  namespace Express {
    // interface le suma el Project al objeto Request
    interface Request {
      project: IProject;
    }
  }
}

/*
  Este middlware se encarga de verificar que el proyecto envíado a través del 
  parámetro de la ruta existe.
*/

export async function projectExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Proyecto no encontrado');
      return res.status(404).json({ error: error.message });
    }
    // * Le suma el project al Request
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error' });
  }
}
