// import { CorsOptions } from 'cors';

// export const corsConfig: CorsOptions = {
//   origin: function (origin, callback) {
//     const whiteList = [process.env.FRONTEND_URL, '127.0.0.1:4000'];

//     // validar si se encuentra el argumento `--api` dentro del comando
//     if (process.argv[2] === '--api') {
//       // validar todas las entradas que no tienen origen
//       whiteList.push(undefined)
//     }

//     if (whiteList.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Error de CORS'));
//     }
//   }
// };

import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const whiteList = [
      process.env.FRONTEND_URL, // Producción (Render, Vercel, etc.)
      'http://127.0.0.1:4000',  // Desarrollo local
      'http://localhost:4000'   // Alternativa en dev
    ];

    // Permitir peticiones sin Origin.
    // Necesario para health checks, herramientas del servidor,
    // peticiones entre servidores, etc.
    if (!origin) {
      return callback(null, true);
    }

    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Error de CORS'));
    }
  },
  credentials: true
};
