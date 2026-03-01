import { pool } from '../config/db.js';

export const listRewards = async (_req, res) => {
  const result = await pool.query('SELECT * FROM rewards WHERE active = true ORDER BY points_required ASC');
  res.json(result.rows);
};

export const redeemReward = async (req, res) => {
  const { rewardId } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
    const rewardResult = await client.query('SELECT * FROM rewards WHERE id = $1 AND active = true', [rewardId]);

    if (!rewardResult.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Recompensa não encontrada.' });
    }

    const user = userResult.rows[0];
    const reward = rewardResult.rows[0];

    if (user.points_balance < reward.points_required) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Pontos insuficientes.' });
    }

    await client.query('UPDATE users SET points_balance = points_balance - $1 WHERE id = $2', [
      reward.points_required,
      req.user.id,
    ]);

    await client.query(
      `INSERT INTO redemptions (user_id, reward_id, points_spent)
       VALUES ($1, $2, $3)`,
      [req.user.id, reward.id, reward.points_required],
    );

    await client.query('COMMIT');
    return res.json({ message: 'Recompensa resgatada com sucesso!' });
  } catch {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Erro ao resgatar recompensa.' });
  } finally {
    client.release();
  }
};
