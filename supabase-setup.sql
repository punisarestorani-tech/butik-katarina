-- Butik Katarina - Supabase Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram_handle TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catalog items table
CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Try-on results table
CREATE TABLE IF NOT EXISTS try_on_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_image_url TEXT NOT NULL,
  clothing_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
  result_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE try_on_results ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Catalog items policies (public read, admin write)
CREATE POLICY "Anyone can view catalog items"
  ON catalog_items FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert catalog items"
  ON catalog_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update catalog items"
  ON catalog_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete catalog items"
  ON catalog_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Try-on results policies
CREATE POLICY "Users can view their own try-on results"
  ON try_on_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own try-on results"
  ON try_on_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for clothing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('clothing', 'clothing', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view clothing images"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'clothing');

CREATE POLICY "Admins can upload clothing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'clothing' AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete clothing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'clothing' AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Create first admin user (replace with your email after registration)
-- UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
