import { createClient } from "@supabase/supabase-js";

// Supabase configuration
// Replace these with your actual Supabase project details
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project-url.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for better TypeScript support
export interface Post {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  dislikes: number;
  reply_count: number;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  description: string;
  alert_type: "danger" | "warning" | "info";
  location: string;
  urgency: "high" | "medium" | "low";
  likes: number;
  dislikes: number;
  response_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  post_id?: string;
  alert_id?: string;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  post_id?: string;
  alert_id?: string;
  comment_id?: string;
  vote_type: "upvote" | "downvote";
  created_at: string;
}
