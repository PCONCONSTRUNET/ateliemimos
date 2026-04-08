
-- Insert sample categories
INSERT INTO categories (id, nome) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Bolsas'),
  ('a1000000-0000-0000-0000-000000000002', 'Enxoval'),
  ('a1000000-0000-0000-0000-000000000003', 'Fraldas'),
  ('a1000000-0000-0000-0000-000000000004', 'Toalhas'),
  ('a1000000-0000-0000-0000-000000000005', 'Necessaires'),
  ('a1000000-0000-0000-0000-000000000006', 'Bordados');

-- Insert sample products
INSERT INTO products (nome, preco, descricao, categoria_id, destaque, disponivel) VALUES
  ('Bolsa Térmica Personalizada', 89.90, 'Bolsa térmica com bordado do nome, ideal para levar mamadeiras e lanches.', 'a1000000-0000-0000-0000-000000000001', true, true),
  ('Bolsa Maternidade Floral', 159.90, 'Bolsa maternidade espaçosa com estampa floral delicada e alça ajustável.', 'a1000000-0000-0000-0000-000000000001', true, true),
  ('Kit Enxoval Bebê Completo', 299.90, 'Kit completo com manta, lençol, fronha e toalha bordados com o nome do bebê.', 'a1000000-0000-0000-0000-000000000002', true, true),
  ('Manta de Bebê Personalizada', 120.00, 'Manta macia em tecido antialérgico com bordado delicado.', 'a1000000-0000-0000-0000-000000000002', false, true),
  ('Fralda de Boca Bordada (kit 3)', 45.00, 'Kit com 3 fraldas de boca em tecido 100% algodão com bordado à mão.', 'a1000000-0000-0000-0000-000000000003', true, true),
  ('Fralda de Ombro Luxo', 35.00, 'Fralda de ombro com acabamento em renda e bordado personalizado.', 'a1000000-0000-0000-0000-000000000003', false, true),
  ('Toalha de Banho com Capuz', 75.00, 'Toalha felpuda com capuz bordado, perfeita para o banho do bebê.', 'a1000000-0000-0000-0000-000000000004', true, true),
  ('Toalha de Rosto Personalizada', 30.00, 'Toalha de rosto com inicial bordada, ótimo presente.', 'a1000000-0000-0000-0000-000000000004', false, true),
  ('Necessaire com Nome', 55.00, 'Necessaire em tecido impermeável com bordado do nome.', 'a1000000-0000-0000-0000-000000000005', true, true),
  ('Necessaire Grande Viagem', 79.90, 'Necessaire espaçosa ideal para viagens, com divisórias internas.', 'a1000000-0000-0000-0000-000000000005', false, false),
  ('Quadro Bordado Decorativo', 95.00, 'Quadro com bordado artesanal em bastidor, perfeito para decoração.', 'a1000000-0000-0000-0000-000000000006', false, true),
  ('Nome Bordado em Bastidor', 65.00, 'Bordado personalizado do nome em bastidor decorativo.', 'a1000000-0000-0000-0000-000000000006', true, false);
