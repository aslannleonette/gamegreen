import { pool } from '../config/db.js';
import { validateReviewDelivery } from '../validators/deliveryValidator.js';

export const getPendingDeliveries = async (_req, res) => {
  const result = await pool.query(
    `SELECT d.id, d.material, d.weight_kg, d.points_calculated, d.created_at,
            u.name AS user_name, u.email AS user_email
     FROM deliveries d
     JOIN users u ON u.id = d.user_id
     WHERE d.status = 'pendente'
     ORDER BY d.created_at ASC`,
  );

  res.json(result.rows);
};

export const reviewDelivery = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const errorMessage = validateReviewDelivery(req.body);
  if (errorMessage) return res.status(400).json({ message: errorMessage });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT * FROM deliveries WHERE id = $1 FOR UPDATE', [id]);
    if (!existing.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Entrega não encontrada.' });
    }

    const delivery = existing.rows[0];
    if (delivery.status !== 'pendente') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Entrega já processada.' });
    }

    await client.query(
      `UPDATE deliveries SET status = $1, partner_id = $2, reviewed_at = NOW() WHERE id = $3`,
      [status, req.user.id, id],
    );

    if (status === 'aprovado') {
      await client.query('UPDATE users SET points_balance = points_balance + $1 WHERE id = $2', [
        delivery.points_calculated,
        delivery.user_id,
      ]);
    }

    await client.query('COMMIT');
    return res.json({ message: `Entrega ${status}.` });
  } catch {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Erro ao revisar entrega.' });
  } finally {
    client.release();
  }
};
