import type { Request, Response } from 'express';
import { generateJWT } from '../utils/jwt';
import { AuthEmail } from '../emails/AuthEmail';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import User from '../models/User';
import Token from '../models/Token';

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      // Prevenir duplicados
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error('El usuario ya esta registrado');
        return res.status(409).json({ error: error.message });
      }

      // Crea un usuario
      const user = new User(req.body);

      // Has Password
      user.password = await hashPassword(password);

      // Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Envíar el email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send('Cuenta creada, revisa tu email para confirmarla');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error('Token no válido');
        return res.status(401).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send('Cuenta confirmada correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        const error = new Error('Usuario no encontrado');
        return res.status(401).json({ error: error.message });
      }

      // no iniciar sesión si el usuario no esta confirmado
      if (!user.confirmed) {
        // Crear un nuevo token para la persona active su correo
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        // Envíar el email
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token
        });

        const error = new Error(
          'La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación'
        );
        return res.status(401).json({ error: error.message });
      }

      // Revisar password
      const isPasswordCorrect = await checkPassword(password, user.password);

      console.log(user.password);

      if (!isPasswordCorrect) {
        const error = new Error('Password Incorrecto');
        return res.status(401).json({ error: error.message });
      }

      const token = generateJWT({ id: user.id });

      res.send(token);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error('El Usuario no esta registrado');
        return res.status(404).json({ error: error.message });
      }

      // Verificar que el usuario ya esta registrado
      if (user.confirmed) {
        const error = new Error('El Usuario ya esta confirmado');
        return res.status(403).json({ error: error.message });
      }

      // Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // Envíar el email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send('Se envío un nuevo token a tu e-mail');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error('El Usuario no esta registrado');
        return res.status(404).json({ error: error.message });
      }

      // Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      // Envíar el email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token
      });

      res.send('Revisa tu email para instrucciones');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error('Token no válido');
        return res.status(401).json({ error: error.message });
      }

      res.send('Token válido, Define tu nuevo password');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error('Token no válido');
        return res.status(401).json({ error: error.message });
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send('El password se modificó correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  // Devolver la información del usuario
  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  // Profile

  // actualizar el perfil
  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    // verificar que el nuevo correo no esta registrado
    const userExists = await User.findOne({ email });
    /*
      también se asegura que el email anterior se guarde aunque sea econtrado
      por userExists
    */
    if (userExists && userExists.id.toString() !== req.user.id) {
      const error = new Error('Este email ya esta registrado');
      return res.status(409).json({ error: error.message });
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.send('Perfil actualizado correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user.id);

    // verificar el current_password con el password de la base de datos
    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error('El password actual es incorrecto');
      return res.status(401).json({ error: error.message });
    }

    try {
      // Actualizar el nuevo password
      user.password = await hashPassword(password);
      await user.save();
      res.send('El Password se modificó correctamente');
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error('El Password es incorrecto');
      return res.status(401).json({ error: error.message });
    }

    res.send('Password Correcto');
  };
}
