import jwt from 'jsonwebtoken';
import Types from 'mongoose';

type UserPayload = {
  id: Types.ObjectId;
};

export const generateJWT = (payload: UserPayload) => {
  /*
    para generar un token requerimos inyectar el dato, la llave secreta, y un
    objeto con diferentes opciones que podemos configurar. En este caso
    configuramos un tiempo de expiración de 6 meses.
  */
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '188d'
  });
  return token;
};
