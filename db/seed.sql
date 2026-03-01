INSERT INTO users (name, email, password_hash, role, points_balance)
VALUES
  ('Eco Parceiro', 'parceiro@gamegreen.com', crypt('123456', gen_salt('bf')), 'partner', 0),
  ('Usuário Demo', 'usuario@gamegreen.com', crypt('123456', gen_salt('bf')), 'user', 50)
ON CONFLICT (email) DO NOTHING;

INSERT INTO rewards (name, points_required)
VALUES
  ('Gift Card R$20', 120),
  ('Cupom Streaming', 80),
  ('Desconto Loja Gamer', 60)
ON CONFLICT DO NOTHING;
