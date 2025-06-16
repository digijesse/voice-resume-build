
-- Add columns to profiles table for better account management
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS openai_api_key text,
ADD COLUMN IF NOT EXISTS resume_text text;

-- Create RLS policies for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update public_personas policies
ALTER TABLE public_personas ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view public personas
CREATE POLICY "Anyone can view public personas" ON public_personas
  FOR SELECT TO anon, authenticated USING (true);

-- Policy to allow users to manage their own public persona
CREATE POLICY "Users can manage own public persona" ON public_personas
  FOR ALL USING (auth.uid() = id);
