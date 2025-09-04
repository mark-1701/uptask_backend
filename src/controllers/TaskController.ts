import type { Request, Response } from 'express';
import Task from '../models/Task';

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      // ? project fue sumado en el middlware
      task.project = req.project.id;
      req.project.tasks.push(task.id);

      // ? Uso de Promise.allSettled
      /*
        Promise.allSettled se asegura que se ejecuten con exito las dos 
        consultas, de haber un error, se va el flujo de ejecución al catch
      */
      await Promise.allSettled([task.save(), req.project.save()]);

      res.send('Tarea creada correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({
        project: req.project.id
      }).populate('project');
      // ? Populate
      /*
        populate completa la respuesta con toda la información del project id;
        completa el json de la respuesta con el resto de la información 
        del project al que pertenece. Por eso se dice que se popula la 
        información
      */

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      // se retorna un task más completo
      // se popula el user del completedBy para traer el resto de la información
      const task = await Task.findById(req.task.id)
        .populate({
          path: 'completedBy.user',
          select: 'id name email'
        })
        // popular notes, que al mismo tiempo populas createdBy
        .populate({
          path: 'notes',
          populate: { path: 'createdBy', select: 'id name email' }
        });

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      /*
        ! Advertencia sobre findByIdAndDelete y findByIdAndDelete
        findByIdAndDelete y findByIdAndUpdate, son buenas alternativas, pero no
        nos permite hacer validaciones previas. Por eso es aconsejable primero
        obtener nuestra tarea y después guardarla.
       */

      // * Actualizar la tarea
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      await req.task.save();
      res.send('Tarea Actualizada Correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      if (req.task.project.toString() !== req.project.id) {
        const error = new Error('Acción no valida');
        return res.status(404).json({ error: error.message });
      }

      /*
        Creamos un nuevo array de tareas, pero filtramos las tareas para no
        incluir la tarea que hemos eliminado. Después vamos a poder eliminar la 
        tarea de los dos lugares para no dejar rastro.
      */
      req.project.tasks = req.project.tasks.filter(
        task => task.toString() !== req.task.id.toString()
      );

      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);

      res.send('Tarea Eliminada Correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      req.task.status = status;

      const data = {
        user: req.user.id,
        status
      };

      req.task.completedBy.push(data);
      await req.task.save();
      res.send('Tarea Actualizada');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };
}

// ! Código que se puede eliminar

// static createTask = async (req: Request, res: Response) => {
//   const { projectId } = req.params;
//   try {
//     const project = await Project.findById(projectId);

//     if (!project) {
//       const error = new Error('Proyecto no encontrado');
//       return res.status(404).json({ error: error.message });
//     }

//     const task = new Task(req.body);
//     task.project = project.id;
//     project.tasks.push(task.id);
//     await task.save();
//     await project.save();
//     res.send('Tarea creada correctamente');
//   } catch (error) {
//     console.log(error);
//   }
// };
