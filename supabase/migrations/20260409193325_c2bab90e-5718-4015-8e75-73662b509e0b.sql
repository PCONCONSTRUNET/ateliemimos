ALTER TABLE public.products ADD COLUMN position integer NOT NULL DEFAULT 0;

-- Set initial positions based on created_at order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.products
)
UPDATE public.products SET position = numbered.rn FROM numbered WHERE products.id = numbered.id;
