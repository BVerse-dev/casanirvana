-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(group_id, user_id)
);

-- Create group_messages table
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    from_user UUID REFERENCES public.users(id) ON DELETE CASCADE,
    body TEXT,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'video_call')),
    attachments JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_by JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true
);

-- Add RLS policies for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view groups they are members of" ON public.groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create groups" ON public.groups
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can update groups" ON public.groups
    FOR UPDATE USING (
        id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Add RLS policies for group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group members of their groups" ON public.group_members
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Group admins can manage members" ON public.group_members
    FOR ALL USING (
        group_id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Add RLS policies for group_messages
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their groups" ON public.group_messages
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Group members can send messages" ON public.group_messages
    FOR INSERT WITH CHECK (
        from_user = auth.uid() AND
        group_id IN (
            SELECT group_id FROM public.group_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON public.groups(is_active);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_active ON public.group_members(is_active);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sent_at ON public.group_messages(sent_at);

-- Add some sample groups
INSERT INTO public.groups (id, name, description, created_by) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Casa Nirvana General', 'General discussion for all residents', (SELECT id FROM public.users LIMIT 1)),
    ('550e8400-e29b-41d4-a716-446655440002', 'Building Committee', 'Committee discussions and updates', (SELECT id FROM public.users LIMIT 1)),
    ('550e8400-e29b-41d4-a716-446655440003', 'Events & Activities', 'Community events and social activities', (SELECT id FROM public.users LIMIT 1)),
    ('550e8400-e29b-41d4-a716-446655440004', 'Maintenance Updates', 'Building maintenance notifications', (SELECT id FROM public.users LIMIT 1)),
    ('550e8400-e29b-41d4-a716-446655440005', 'Security Alerts', 'Security notifications and alerts', (SELECT id FROM public.users LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Add current users as members to sample groups
INSERT INTO public.group_members (group_id, user_id, role)
SELECT 
    g.id as group_id,
    u.id as user_id,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY u.id) = 1 THEN 'admin' ELSE 'member' END as role
FROM public.groups g
CROSS JOIN public.users u
WHERE g.id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440005'
)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Add some sample messages
INSERT INTO public.group_messages (group_id, from_user, body, message_type, sent_at)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    u.id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY u.id) = 1 THEN 'Welcome to Casa Nirvana General chat!'
        WHEN ROW_NUMBER() OVER (ORDER BY u.id) = 2 THEN 'Thank you! Happy to be here.'
        ELSE 'Looking forward to connecting with everyone.'
    END,
    'text',
    NOW() - INTERVAL '1 hour' + (ROW_NUMBER() OVER (ORDER BY u.id) * INTERVAL '10 minutes')
FROM public.users u
LIMIT 3
ON CONFLICT DO NOTHING; 