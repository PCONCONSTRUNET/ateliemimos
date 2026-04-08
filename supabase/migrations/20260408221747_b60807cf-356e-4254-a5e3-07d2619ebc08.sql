
-- Remove all products first (foreign key)
DELETE FROM products;

-- Remove all categories
DELETE FROM categories;

-- Re-insert 3 categories
INSERT INTO categories (id, nome) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Bolsas'),
  ('a1000000-0000-0000-0000-000000000002', 'Enxoval'),
  ('a1000000-0000-0000-0000-000000000005', 'Necessaires');

-- Re-insert 4 products
INSERT INTO products (nome, preco, descricao, categoria_id, destaque, disponivel) VALUES
  ('Bolsa Maternidade Floral', 159.90, 'Bolsa maternidade espaçosa com estampa floral delicada.', 'a1000000-0000-0000-0000-000000000001', true, true),
  ('Kit Enxoval Bebê Completo', 299.90, 'Kit com manta, lençol, fronha e toalha bordados.', 'a1000000-0000-0000-0000-000000000002', true, true),
  ('Manta de Bebê Personalizada', 120.00, 'Manta macia em tecido antialérgico com bordado.', 'a1000000-0000-0000-0000-000000000002', false, true),
  ('Necessaire com Nome', 55.00, 'Necessaire em tecido impermeável com bordado do nome.', 'a1000000-0000-0000-0000-000000000005', true, true);
