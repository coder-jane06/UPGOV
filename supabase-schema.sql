-- ==============================================================================
-- UPGOV SUPABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor to configure your database.

-- 1. Create the Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
    ticket_id TEXT PRIMARY KEY,
    citizen_name TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    department TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    status TEXT NOT NULL,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_count INTEGER DEFAULT 1,
    assigned_officer_name TEXT,
    assigned_officer_id TEXT,
    agent_summary TEXT,
    classification_confidence INTEGER,
    classification_reasoning TEXT,
    severity_justification TEXT,
    estimated_resolution_days INTEGER,
    agent_trace JSONB,
    media_evidence JSONB,
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,
    filed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Links to Supabase Auth (if the user is logged in)
    citizen_auth_id UUID REFERENCES auth.users(id)
);

-- 2. Create the User Roles Table (for Admin/Officer/Citizen management)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'admin')),
    assigned_sector TEXT -- Only for officers
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Tickets

-- Policy: Anyone can insert a ticket (even anonymously for the demo flow)
CREATE POLICY "Allow public inserts for demo"
ON public.tickets FOR INSERT
WITH CHECK (true);

-- Policy: Citizens can read all tickets (needed for Public Dashboard aggregates)
-- In a strict production environment, we would restrict this to only their own, 
-- and create a secure View for aggregates, but this works for the hackathon demo.
CREATE POLICY "Allow public reads for dashboards"
ON public.tickets FOR SELECT
USING (true);

-- Policy: Only Officers and Admins can update tickets
-- We use a subquery to check if the user is an officer/admin in user_roles
CREATE POLICY "Allow officers and admins to update tickets"
ON public.tickets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.id = auth.uid() 
        AND user_roles.role IN ('officer', 'admin')
    )
);

-- 5. RLS Policies for User Roles
-- Users can read their own role
CREATE POLICY "Users can read own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = id);

-- Admins can read all roles
CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.id = auth.uid() AND ur.role = 'admin'
    )
);

-- Note: To seed admin/officer users, you will need to create them in Supabase Auth,
-- then manually insert their UUIDs into the user_roles table with the appropriate role.
