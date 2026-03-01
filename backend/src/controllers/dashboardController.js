import { pool } from '../config/db.js';

export const getDashboard = async (req, res) => {
  const [userResult, historyResult, rankingResult] = await Promise.all([
    pool.query('SELECT id, name, email, points_balance FROM users WHERE id = $1', [req.user.id]),
    pool.query(
      `SELECT id, material, weight_kg, points_calculated, status, created_at
       FROM deliveries WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id],
    ),
    pool.query(
      `SELECT name, points_balance FROM users
       WHERE role = 'user'
       ORDER BY points_balance DESC, created_at ASC
       LIMIT 10`,
    ),
  ]);

  return res.json({
    user: userResult.rows[0],
    history: historyResult.rows,
    ranking: rankingResult.rows,
  });
};
