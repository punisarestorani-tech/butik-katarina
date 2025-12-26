import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  name: string
  email: string
  instagram_handle?: string
  is_admin: boolean
  created_at: string
}

export interface CatalogItem {
  id: string
  image_url: string
  title: string
  description?: string
  category?: string
  created_at: string
}

export interface TryOnResult {
  id: string
  user_id: string
  user_image_url: string
  clothing_item_id: string
  result_image_url: string
  created_at: string
}
