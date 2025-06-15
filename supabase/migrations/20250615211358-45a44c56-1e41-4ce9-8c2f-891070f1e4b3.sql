
-- Create profiles table to store user data and agent IDs
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  elevenlabs_api_key TEXT NOT NULL,
  bio TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  random_persona_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create public_personas table for displaying public personas
CREATE TABLE public.public_personas (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  random_persona_name TEXT NOT NULL,
  avatar_url TEXT,
  agent_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_personas ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles (users can only see/edit their own)
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS policies for public_personas (everyone can view, only owner can modify)
CREATE POLICY "Anyone can view public personas" 
  ON public.public_personas 
  FOR SELECT 
  TO public;

CREATE POLICY "Users can insert their own public persona" 
  ON public.public_personas 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own public persona" 
  ON public.public_personas 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own public persona" 
  ON public.public_personas 
  FOR DELETE 
  USING (auth.uid() = id);
