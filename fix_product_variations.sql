-- Fix the product_variations table schema to match the frontend expectations
ALTER TABLE public.product_variations 
  RENAME COLUMN name TO nome;

ALTER TABLE public.product_variations 
  DROP COLUMN IF EXISTS stock;

ALTER TABLE public.product_variations 
  ADD COLUMN IF NOT EXISTS preco NUMERIC NOT NULL DEFAULT 0;

-- Optional: If the table was dropped or you want to recreate it completely instead, use:
-- DROP TABLE IF EXISTS public.product_variations;
-- CREATE TABLE public.product_variations (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
--     nome TEXT NOT NULL,
--     preco NUMERIC NOT NULL DEFAULT 0,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
-- );
-- ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Product variations are viewable by everyone" ON public.product_variations FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can manage product variations" ON public.product_variations FOR ALL TO authenticated USING (true) WITH CHECK (true);
