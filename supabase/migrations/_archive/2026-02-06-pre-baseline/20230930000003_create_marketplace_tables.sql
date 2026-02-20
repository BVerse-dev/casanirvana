-- Create marketplace_categories table
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.marketplace_categories(id),
  image_url TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes for marketplace_categories
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_parent_id ON public.marketplace_categories (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_featured ON public.marketplace_categories (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_active ON public.marketplace_categories (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_categories_order ON public.marketplace_categories (display_order);

-- Create marketplace_products table
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD' NOT NULL,
  category_id UUID NOT NULL REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
  sku TEXT,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  stock_status TEXT DEFAULT 'in_stock' NOT NULL CHECK (stock_status IN ('in_stock', 'out_of_stock', 'backorder', 'pre_order')),
  featured_image_url TEXT,
  gallery_images JSONB,
  ratings_average DECIMAL(3,2) DEFAULT 0.00 NOT NULL,
  ratings_count INTEGER DEFAULT 0 NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes for marketplace_products
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category_id ON public.marketplace_products (category_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor_id ON public.marketplace_products (vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_featured ON public.marketplace_products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_active ON public.marketplace_products (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_products_stock ON public.marketplace_products (stock_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_ratings ON public.marketplace_products (ratings_average DESC);

-- Create marketplace_orders table
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  shipping_amount DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  grand_total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned')),
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  shipping_address JSONB,
  billing_address JSONB,
  contact_info JSONB,
  tracking_info JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes for marketplace_orders
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_user_id ON public.marketplace_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON public.marketplace_orders (status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_payment_status ON public.marketplace_orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_date ON public.marketplace_orders (order_date);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_number ON public.marketplace_orders (order_number);

-- Create marketplace_order_items table
CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes for marketplace_order_items
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_order_id ON public.marketplace_order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_product_id ON public.marketplace_order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_order_items_status ON public.marketplace_order_items (status);

-- Create marketplace_reviews table
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes for marketplace_reviews
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_product_id ON public.marketplace_reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_user_id ON public.marketplace_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_order_id ON public.marketplace_reviews (order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_rating ON public.marketplace_reviews (rating);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_status ON public.marketplace_reviews (status);

-- Create marketplace_promotions table
CREATE TABLE IF NOT EXISTS public.marketplace_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('discount', 'bundle', 'free_shipping', 'bogo', 'flash')),
  value DECIMAL(10,2) NOT NULL,
  minimum_purchase DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'active', 'scheduled', 'expired')),
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'category', 'product', 'vendor', 'user')),
  target_ids JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes for marketplace_promotions
CREATE INDEX IF NOT EXISTS idx_marketplace_promotions_code ON public.marketplace_promotions (code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_marketplace_promotions_status ON public.marketplace_promotions (status);
CREATE INDEX IF NOT EXISTS idx_marketplace_promotions_type ON public.marketplace_promotions (type);
CREATE INDEX IF NOT EXISTS idx_marketplace_promotions_dates ON public.marketplace_promotions (start_date, end_date);

-- Add RLS policies for all tables
-- marketplace_categories
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace categories are viewable by everyone" 
  ON public.marketplace_categories FOR SELECT 
  TO PUBLIC;

CREATE POLICY "Marketplace categories are editable by admins" 
  ON public.marketplace_categories FOR ALL 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- marketplace_products
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace products are viewable by everyone" 
  ON public.marketplace_products FOR SELECT 
  TO PUBLIC;

CREATE POLICY "Marketplace products are editable by admins" 
  ON public.marketplace_products FOR ALL 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- marketplace_orders
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
  ON public.marketplace_orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" 
  ON public.marketplace_orders FOR SELECT 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

CREATE POLICY "Users can create their own orders" 
  ON public.marketplace_orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update orders" 
  ON public.marketplace_orders FOR UPDATE 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- marketplace_order_items
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items" 
  ON public.marketplace_order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.marketplace_orders WHERE public.marketplace_orders.id = public.marketplace_order_items.order_id AND public.marketplace_orders.user_id = auth.uid()));

CREATE POLICY "Admins can view all order items" 
  ON public.marketplace_order_items FOR SELECT 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

CREATE POLICY "Users can insert order items for their orders" 
  ON public.marketplace_order_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.marketplace_orders WHERE public.marketplace_orders.id = public.marketplace_order_items.order_id AND public.marketplace_orders.user_id = auth.uid()));

CREATE POLICY "Only admins can update order items" 
  ON public.marketplace_order_items FOR UPDATE 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- marketplace_reviews
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace reviews are viewable by everyone if approved" 
  ON public.marketplace_reviews FOR SELECT 
  USING (status = 'approved' OR auth.uid() = user_id OR (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin'));

CREATE POLICY "Users can create their own reviews" 
  ON public.marketplace_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.marketplace_reviews FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all reviews" 
  ON public.marketplace_reviews FOR UPDATE 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- marketplace_promotions
ALTER TABLE public.marketplace_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketplace promotions are viewable by everyone if active" 
  ON public.marketplace_promotions FOR SELECT 
  USING (status = 'active' OR (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin'));

CREATE POLICY "Only admins can modify promotions" 
  ON public.marketplace_promotions FOR ALL 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- Create triggers for all tables to update the updated_at field
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.marketplace_categories
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.marketplace_products
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.marketplace_orders
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.marketplace_order_items
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.marketplace_reviews
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.marketplace_promotions
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
