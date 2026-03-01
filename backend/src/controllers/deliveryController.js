import { pool } from '../config/db.js';
import { MATERIAL_POINTS } from '../utils/constants.js';
import { validateCreateDelivery } from '../validators/deliveryValidator.js';

export const createDelivery = async (req, res) => {
  const { material, weightKg } = req.body;
  const errorMessage = validateCreateDelivery(req.body);
  if (errorMessage) return res.status(400).json({ message: errorMessage });
  const points = Math.round(weightKg * MATERIAL_POINTS[material]);

  const result = await pool.query(
    `INSERT INTO deliveries (user_id, material, weight_kg, points_calculated)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [req.user.id, material, weightKg, points],
  );

  res.status(201).json(result.rows[0]);
};

export const getMyDeliveries = async (req, res) => {
  const result = await pool.query(
    `SELECT id, material, weight_kg, points_calculated, status, created_at
     FROM deliveries
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [req.user.id],
  );
  res.json(result.rows);
};
