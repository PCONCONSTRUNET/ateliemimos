-- Adiciona a coluna subtitulo na tabela products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subtitulo TEXT;
