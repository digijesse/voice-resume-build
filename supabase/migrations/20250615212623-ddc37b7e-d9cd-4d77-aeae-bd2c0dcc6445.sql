
-- Temporarily disable RLS on profiles table to allow signups
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on public_personas table  
ALTER TABLE public.public_personas DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might be blocking access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public personas" ON public.public_personas;
DROP POLICY IF EXISTS "Users can insert their own public persona" ON public.public_personas;
DROP POLICY IF EXISTS "Users can update their own public persona" ON public.public_personas;
DROP POLICY IF EXISTS "Users can delete their own public persona" ON public.public_personas;
