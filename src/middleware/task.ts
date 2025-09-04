import type { Request, Response, NextFunction } from 'express';
import Task, { ITask } from '../models/Task';
import { toString } from 'express-validator/lib/utils';

// * Reescribir scope global del Request
declare global {
  namespace Express {
    // interface le suma el Task al objeto Request
    interface Request {
      task: ITask;
    }
  }
}

/*
  Este middleware se encarga de verificar que la tarea envíada a través del 
  taskId existe.
*/

export async function taskExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      const error = new Error('Tarea no encontrado');
      return res.status(404).json({ error: error.message });
    }

    // * Le suma el project al Request
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error' });
  }
}

/*
  Este middleware se encarga de verificar que la tarea del request pertenece al 
  proyecto del request. En resumen, se encarga de verificar que la tarea 
  pertenece al proyecto.
*/


export function taskBelongsToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error('Acción no valida');
    return res.status(404).json({ error: error.message });
  }
  next();
}

/*
  Este middlware verifica que el usuario autenticado sea el manager del proyecto
*/

export function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error('Acción no valida');
    return res.status(404).json({ error: error.message });
  }
  next();
}
