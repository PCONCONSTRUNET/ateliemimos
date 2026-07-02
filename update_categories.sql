ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS visivel BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- Optional: se quiser atualizar a posição das categorias existentes para manter a ordem
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as rn
  FROM public.categories
)
UPDATE public.categories SET position = numbered.rn FROM numbered WHERE categories.id = numbered.id;
