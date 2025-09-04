import { transporter } from '../config/nodemailer';

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: user.email,
      subject: 'UpTask - Confirma tu cuenta',
      text: 'UpTask - Confirma tu cuenta',
      html: `
      <p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta.</p>
      
      <p>Vista el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
      <p>E Ingresa el código: <b>${user.token}</b></p>
      <p>Este token expira en 10 minutos</p>
      `
    });

    // console.log('Mensaje enviado', info.messageId);
    // Mensaje enviado <3d661f6f-d1e9-37f0-a34c-6b71840eae3d@uptask.com>
  };

  static sendPasswordResetToken = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: user.email,
      subject: 'UpTask - Reestablece tu password',
      text: 'UpTask - Reestablece tu password',
      html: `
      <p>Hola: ${user.name}, has solicitado reestablecer tu password.</p>
      
      <p>Vista el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer password</a>
      <p>E Ingresa el código: <b>${user.token}</b></p>
      <p>Este token expira en 10 minutos</p>
      `
    });

    // console.log('Mensaje enviado', info.messageId);
    // Mensaje enviado <3d661f6f-d1e9-37f0-a34c-6b71840eae3d@uptask.com>
  };
}
