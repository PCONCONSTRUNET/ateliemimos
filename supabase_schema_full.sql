
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  imagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0,
  descricao TEXT,
  imagem TEXT,
  categoria_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  destaque BOOLEAN NOT NULL DEFAULT false,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Authenticated users can manage categories
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

-- Authenticated users can manage products
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images');

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
INSERT INTO public.categories (nome) VALUES ('Fraldas');

INSERT INTO public.products (nome, preco, descricao, categoria_id, destaque, disponivel)
VALUES (
  'Porta-Fraldas Bordado',
  75,
  'Porta-fraldas artesanal com bordado personalizado, perfeito para organizar o quartinho do bebê.',
  (SELECT id FROM public.categories WHERE nome = 'Fraldas' LIMIT 1),
  false,
  true
);
ALTER TABLE public.products ADD COLUMN tags text[] DEFAULT '{}';
UPDATE public.products SET tags = ARRAY['Feito à mão', 'Personalizado'] WHERE nome = 'Bolsa Maternidade Floral';
UPDATE public.products SET tags = ARRAY['Sob encomenda', 'Personalizado'] WHERE nome = 'Kit Enxoval Bebê Completo';
UPDATE public.products SET tags = ARRAY['Feito à mão', 'Pronta entrega'] WHERE nome = 'Manta de Bebê Personalizada';
UPDATE public.products SET tags = ARRAY['Personalizado', 'Pronta entrega'] WHERE nome = 'Necessaire com Nome';
UPDATE public.products SET tags = ARRAY['Feito à mão', 'Sob encomenda'] WHERE nome = 'Porta-Fraldas Bordado';

CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images are viewable by everyone"
ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage product images"
ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_product_images_product_id ON public.product_images(product_id, position);
ALTER TABLE public.products ADD COLUMN position integer NOT NULL DEFAULT 0;

-- Set initial positions based on created_at order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.products
)
UPDATE public.products SET position = numbered.rn FROM numbered WHERE products.id = numbered.id;
