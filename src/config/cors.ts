import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    const whiteList = [process.env.FRONTEND_URL, '127.0.0.1:4000'];

    // validar si se encuentra el argumento `--api` dentro del comando
    if (process.argv[2] === '--api') {
      // validar todas las entradas que no tienen origen
      whiteList.push(undefined)
    }

    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Error de CORS'));
    }
  }
};
