import mongoose, { Schema, Document, PopulatedDoc, Types } from 'mongoose';
import Task, { ITask } from './Task';
import { IUser } from './User';
import Note from './Note';

export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<ITask & Document>[];
  manager: PopulatedDoc<IUser & Document>;
  team: PopulatedDoc<IUser & Document>[];
}

const ProjectSchema: Schema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true
    },
    clientName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    // ? Un proyecto puede tener varias tareas
    // ? Subdocmentos
    tasks: [
      {
        type: Types.ObjectId,
        ref: 'Task'
      }
    ],
    manager: {
      type: Types.ObjectId,
      ref: 'User'
    },
    team: [
      {
        type: Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Middleware

// eliminar también todas las tareas y notas que pertenecen a un proyecto
ProjectSchema.pre(
  'deleteOne',
  {
    document: true
  },
  async function () {
    const projectId = this._id;
    if (!projectId) return;

    // recuperar las tareas del proyecto
    const tasks = await Task.find({ project: projectId });

    /*
      recorrer todas las notas, y eliminar todas las notas que pertenecen a la 
      tarea
    */
    for (const task of tasks) {
      await Note.deleteMany({ task: task._id });
    }

    await Task.deleteMany({ project: projectId });
  }
);

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;

// ? Model del Proyecto con tipos

// import mongoose, { Schema, Document } from 'mongoose';

// export type ProjectType = Document & {
//   projectName: string;
//   clientName: string;
//   description: string;
// };

// const ProjectSchema: Schema = new Schema({
//   projectName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   clientName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true
//   }
// });

// const Project = mongoose.model<ProjectType>('Project', ProjectSchema);
// export default Project;
