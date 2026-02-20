-- Create amenity_bookings table for tracking amenity reservations
CREATE TABLE IF NOT EXISTS public.amenity_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amenity_id UUID NOT NULL,
    user_id UUID NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    special_requests TEXT,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    payment_reference TEXT,
    refund_reference TEXT,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.amenity_bookings
ADD CONSTRAINT fk_amenity_bookings_amenity_id 
FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) ON DELETE CASCADE;

ALTER TABLE public.amenity_bookings
ADD CONSTRAINT fk_amenity_bookings_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.amenity_bookings
ADD CONSTRAINT fk_amenity_bookings_approved_by 
FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_amenity_bookings_amenity_id ON public.amenity_bookings(amenity_id);
CREATE INDEX idx_amenity_bookings_user_id ON public.amenity_bookings(user_id);
CREATE INDEX idx_amenity_bookings_booking_date ON public.amenity_bookings(booking_date);
CREATE INDEX idx_amenity_bookings_status ON public.amenity_bookings(status);
CREATE INDEX idx_amenity_bookings_payment_status ON public.amenity_bookings(payment_status);

-- Create composite index for checking booking conflicts
CREATE INDEX idx_amenity_bookings_conflict_check 
ON public.amenity_bookings(amenity_id, booking_date, start_time, end_time)
WHERE status IN ('pending', 'confirmed');

-- Enable RLS
ALTER TABLE public.amenity_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own bookings" ON public.amenity_bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON public.amenity_bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings" ON public.amenity_bookings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own bookings" ON public.amenity_bookings
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Super admin access" ON public.amenity_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_amenity_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_amenity_bookings_updated_at
    BEFORE UPDATE ON public.amenity_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_amenity_bookings_updated_at(); 