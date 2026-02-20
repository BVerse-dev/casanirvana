-- Create in_app_notifications table for campaign management
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    recipients_count INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    opened_count INTEGER NOT NULL DEFAULT 0,
    action_taken_count INTEGER NOT NULL DEFAULT 0,
    action_required BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create in_app_notification_metrics table for analytics
CREATE TABLE IF NOT EXISTS public.in_app_notification_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    notifications_sent INTEGER NOT NULL DEFAULT 0,
    notifications_delivered INTEGER NOT NULL DEFAULT 0,
    notifications_opened INTEGER NOT NULL DEFAULT 0,
    actions_taken INTEGER NOT NULL DEFAULT 0,
    type_info_count INTEGER NOT NULL DEFAULT 0,
    type_success_count INTEGER NOT NULL DEFAULT 0,
    type_warning_count INTEGER NOT NULL DEFAULT 0,
    type_error_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(date)
);

-- Create in_app_notification_recipients table for tracking individual recipients
CREATE TABLE IF NOT EXISTS public.in_app_notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.in_app_notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    action_taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_status ON public.in_app_notifications(status);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_type ON public.in_app_notifications(type);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON public.in_app_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_in_app_notification_metrics_date ON public.in_app_notification_metrics(date);
CREATE INDEX IF NOT EXISTS idx_in_app_notification_recipients_notification_id ON public.in_app_notification_recipients(notification_id);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notification_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notification_recipients ENABLE ROW LEVEL SECURITY;

-- Create basic policies (adjust based on your auth requirements)
CREATE POLICY "in_app_notifications_select" ON public.in_app_notifications FOR SELECT USING (true);
CREATE POLICY "in_app_notifications_insert" ON public.in_app_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "in_app_notifications_update" ON public.in_app_notifications FOR UPDATE USING (true);
CREATE POLICY "in_app_notifications_delete" ON public.in_app_notifications FOR DELETE USING (true);

CREATE POLICY "in_app_notification_metrics_select" ON public.in_app_notification_metrics FOR SELECT USING (true);
CREATE POLICY "in_app_notification_metrics_insert" ON public.in_app_notification_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "in_app_notification_recipients_select" ON public.in_app_notification_recipients FOR SELECT USING (true);
CREATE POLICY "in_app_notification_recipients_insert" ON public.in_app_notification_recipients FOR INSERT WITH CHECK (true);
