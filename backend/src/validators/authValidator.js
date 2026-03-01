export const validateRegister = ({ name, email, password, role }) => {
  if (!name || name.length < 2) return 'Nome inválido.';
  if (!email || !email.includes('@')) return 'Email inválido.';
  if (!password || password.length < 6) return 'Senha deve ter ao menos 6 caracteres.';
  if (!['user', 'partner'].includes(role)) return 'Role inválida.';
  return null;
};

export const validateLogin = ({ email, password }) => {
  if (!email || !email.includes('@')) return 'Email inválido.';
  if (!password || password.length < 6) return 'Senha inválida.';
  return null;
};
