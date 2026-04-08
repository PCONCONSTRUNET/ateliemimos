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