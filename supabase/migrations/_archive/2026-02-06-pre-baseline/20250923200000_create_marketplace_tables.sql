-- Create marketplace categories table
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    parent_id UUID REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create marketplace vendors table
CREATE TABLE IF NOT EXISTS public.marketplace_vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo VARCHAR(500),
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create marketplace products table
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    subscribe_price DECIMAL(10,2),
    images JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    stock_quantity INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create marketplace orders table
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.marketplace_vendors(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address JSONB,
    delivery_method VARCHAR(50),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    estimated_delivery DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create marketplace cart items table
CREATE TABLE IF NOT EXISTS public.marketplace_cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    variant_options JSONB,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, variant_options)
);

-- Create marketplace reviews table
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_verified_purchase BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create marketplace favorites table
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create marketplace vendor followers table
CREATE TABLE IF NOT EXISTS public.marketplace_vendor_followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.marketplace_vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, user_id)
);

-- Create marketplace search history table
CREATE TABLE IF NOT EXISTS public.marketplace_search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    search_query VARCHAR(255) NOT NULL,
    search_count INTEGER DEFAULT 1,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, search_query)
);

-- Create indexes for better performance
CREATE INDEX idx_marketplace_products_vendor_id ON public.marketplace_products(vendor_id);
CREATE INDEX idx_marketplace_products_category_id ON public.marketplace_products(category_id);
CREATE INDEX idx_marketplace_products_price ON public.marketplace_products(price);
CREATE INDEX idx_marketplace_products_rating ON public.marketplace_products(rating);
CREATE INDEX idx_marketplace_orders_user_id ON public.marketplace_orders(user_id);
CREATE INDEX idx_marketplace_orders_vendor_id ON public.marketplace_orders(vendor_id);
CREATE INDEX idx_marketplace_orders_status ON public.marketplace_orders(status);
CREATE INDEX idx_marketplace_cart_items_user_id ON public.marketplace_cart_items(user_id);
CREATE INDEX idx_marketplace_reviews_product_id ON public.marketplace_reviews(product_id);
CREATE INDEX idx_marketplace_favorites_user_id ON public.marketplace_favorites(user_id);
CREATE INDEX idx_marketplace_search_history_user_id ON public.marketplace_search_history(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_marketplace_categories_updated_at BEFORE UPDATE ON public.marketplace_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_vendors_updated_at BEFORE UPDATE ON public.marketplace_vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON public.marketplace_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON public.marketplace_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_cart_items_updated_at BEFORE UPDATE ON public.marketplace_cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_reviews_updated_at BEFORE UPDATE ON public.marketplace_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update product rating when review is added
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.marketplace_products
    SET rating = (
        SELECT AVG(rating)::DECIMAL(2,1)
        FROM public.marketplace_reviews
        WHERE product_id = NEW.product_id
    ),
    review_count = (
        SELECT COUNT(*)
        FROM public.marketplace_reviews
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.marketplace_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Create function to update vendor rating when product rating changes
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.marketplace_vendors
    SET rating = (
        SELECT AVG(rating)::DECIMAL(2,1)
        FROM public.marketplace_products
        WHERE vendor_id = NEW.vendor_id AND rating > 0
    ),
    review_count = (
        SELECT SUM(review_count)
        FROM public.marketplace_products
        WHERE vendor_id = NEW.vendor_id
    )
    WHERE id = NEW.vendor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_rating_on_product_change
    AFTER UPDATE OF rating, review_count ON public.marketplace_products
    FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || 
                       LPAD(FLOOR(random() * 10000)::text, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.marketplace_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Create RLS policies
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendor_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_search_history ENABLE ROW LEVEL SECURITY;

-- Categories are public read
CREATE POLICY "Categories are viewable by everyone" ON public.marketplace_categories
    FOR SELECT USING (true);

-- Products are public read
CREATE POLICY "Products are viewable by everyone" ON public.marketplace_products
    FOR SELECT USING (is_active = true);

-- Vendors are public read
CREATE POLICY "Vendors are viewable by everyone" ON public.marketplace_vendors
    FOR SELECT USING (is_active = true);

-- Users can manage their own cart
CREATE POLICY "Users can view their own cart items" ON public.marketplace_cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart" ON public.marketplace_cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON public.marketplace_cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON public.marketplace_cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.marketplace_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.marketplace_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage their own favorites
CREATE POLICY "Users can view their own favorites" ON public.marketplace_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" ON public.marketplace_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.marketplace_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Reviews are public read, users can write their own
CREATE POLICY "Reviews are viewable by everyone" ON public.marketplace_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.marketplace_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.marketplace_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their vendor follows
CREATE POLICY "Users can view their vendor follows" ON public.marketplace_vendor_followers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can follow vendors" ON public.marketplace_vendor_followers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow vendors" ON public.marketplace_vendor_followers
    FOR DELETE USING (auth.uid() = user_id);

-- Users can manage their search history
CREATE POLICY "Users can view their search history" ON public.marketplace_search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to search history" ON public.marketplace_search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can clear search history" ON public.marketplace_search_history
    FOR DELETE USING (auth.uid() = user_id);
