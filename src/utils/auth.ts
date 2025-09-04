import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  // valor aleatorio y unico, con 10 rondas
  //  entre más rondas, más recurso de computo
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const checkPassword = async (
  enteredPassword: string,
  storedHash: string
) => {
  return await bcrypt.compare(enteredPassword, storedHash);
};
