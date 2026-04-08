
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
