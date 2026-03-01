import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { validateLogin, validateRegister } from '../validators/authValidator.js';

const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const errorMessage = validateRegister(req.body);
  if (errorMessage) return res.status(400).json({ message: errorMessage });

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, crypt($3, gen_salt('bf')), $4)
       RETURNING id, name, email, role, points_balance`,
      [name, email, password, role],
    );

    const user = result.rows[0];
    return res.status(201).json({ token: sign(user), user });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'E-mail já cadastrado.' });
    return res.status(500).json({ message: 'Erro no cadastro.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const errorMessage = validateLogin(req.body);
  if (errorMessage) return res.status(400).json({ message: errorMessage });

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND password_hash = crypt($2, password_hash)',
    [email, password],
  );
  if (!result.rowCount) return res.status(401).json({ message: 'Credenciais inválidas.' });

  const user = result.rows[0];

  return res.json({
    token: sign(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points_balance: user.points_balance,
    },
  });
};
