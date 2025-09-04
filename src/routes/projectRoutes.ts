import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';
import { projectExists } from '../middleware/project';
import {
  hasAuthorization,
  taskBelongsToProject,
  taskExists
} from '../middleware/task';
import { authenticate } from '../middleware/auth';
import { TeamMemberController } from '../controllers/TeamController';
import { NoteController } from '../controllers/NoteController';

const router = Router();

// proteger todos los endpoints del router
router.use(authenticate);

router.post(
  '/',
  body('projectName')
    .notEmpty()
    .withMessage('El nombre del proyecto es obligatorio'),
  body('clientName')
    .notEmpty()
    .withMessage('El nombre del cliente es obligatorio'),
  body('description')
    .notEmpty()
    .withMessage('La descripción del proyecto es obligatorio'),
  handleInputErrors,
  ProjectController.createProject
);

router.get('/', ProjectController.getAllProjects);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('ID no valido'),
  handleInputErrors,
  ProjectController.getProjectById
);

router.param('projectId', projectExists);

router.put(
  '/:projectId',
  param('projectId').isMongoId().withMessage('ID no valido'),
  body('projectName')
    .notEmpty()
    .withMessage('El nombre del proyecto es obligatorio'),
  body('clientName')
    .notEmpty()
    .withMessage('El nombre del cliente es obligatorio'),
  body('description')
    .notEmpty()
    .withMessage('La descripción del proyecto es obligatorio'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
);

router.delete(
  '/:projectId',
  param('projectId').isMongoId().withMessage('ID no valido'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
);

// * Routes for Tasks

// ? Middleware's

/*
  En cada lugar en donde se encuentre la variable específicada como: projectId 
  o taskId, se va a ejecutar el middleware pertinente. 

  - projectExists: verifica si el proyecto envíado desde el parámetro
    projectId existe
  - taskExists: verifica si la tarea envíada desde el parámetro taskId existe
  - taskBelongsToProject: verifica si la tarea envíada desde el parámetro
    taskId pertenece al proyecto específicado desde el parámetro.
*/

router.param('taskId', taskExists);

router.param('taskId', taskBelongsToProject);

// ? Rutas de task

router.post(
  '/:projectId/tasks',
  body('name').notEmpty().withMessage('El nombre de la tarea es obligatorio'),
  body('description')
    .notEmpty()
    .withMessage('La descripción de la tarea es obligatoria'),
  handleInputErrors,
  TaskController.createTask
);

router.get('/:projectId/tasks', TaskController.getProjectTasks);

router.get(
  '/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('ID no valido'),
  TaskController.getTaskById
);

router.put(
  '/:projectId/tasks/:taskId',
  hasAuthorization, // hasAuthorization middleware
  param('taskId').isMongoId().withMessage('ID no valido'),
  body('name').notEmpty().withMessage('El nombre de la tarea es obligatorio'),
  body('description')
    .notEmpty()
    .withMessage('La descripción de la tarea es obligatoria'),
  handleInputErrors,
  TaskController.updateTask
);

router.delete(
  '/:projectId/tasks/:taskId',
  hasAuthorization, // hasAuthorization middleware
  param('taskId').isMongoId().withMessage('ID no valido'),
  handleInputErrors,
  TaskController.deleteTask
);

router.post(
  '/:projectId/tasks/:taskId/status',
  // hasAuthorization, // hasAuthorization middleware
  param('taskId').isMongoId().withMessage('ID no valido'),
  body('status').notEmpty().withMessage('El estado es obligatorio'),
  handleInputErrors,
  TaskController.updateStatus
);

// * Routes for teams

// solo trae los datos de un usuario por su email
router.post(
  '/:projectId/team/find',
  body('email').isEmail().toLowerCase().withMessage('E-mail no válido'),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
);

router.get('/:projectId/team', TeamMemberController.getProjectTeam);

router.post(
  '/:projectId/team',
  body('id').isMongoId().withMessage('ID No válido'),
  handleInputErrors,
  TeamMemberController.addMemberById
);

router.delete(
  '/:projectId/team/:userId',
  param('userId').isMongoId().withMessage('ID No válido'),
  handleInputErrors,
  TeamMemberController.removeMemberById
);

// Routes for Notes

router.post(
  '/:projectId/tasks/:taskId/notes',
  body('content')
    .notEmpty()
    .withMessage('El Contenido de la nota es obligatorio'),
  handleInputErrors,
  NoteController.createNote
);

router.get('/:projectId/tasks/:taskId/notes', NoteController.getTaskNotes);

router.delete(
  '/:projectId/tasks/:taskId/notes/:noteId',
  param('noteId').isMongoId().withMessage('ID No Válido'),
  handleInputErrors,
  NoteController.deleteNote
);

export default router;
