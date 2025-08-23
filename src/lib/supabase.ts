import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase config check:", {
  url: supabaseUrl ? "✓ URL loaded" : "✗ URL missing",
  key: supabaseAnonKey ? "✓ Key loaded" : "✗ Key missing",
  urlPrefix: supabaseUrl?.substring(0, 20) + "...",
  keyPrefix: supabaseAnonKey?.substring(0, 20) + "...",
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  location: string | null;
  farm_size: number | null;
  crop_types: string[] | null;
  farming_experience: number | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

// Auth functions
export const signUp = async (
  email: string,
  password: string,
  userData?: any
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    console.log("Supabase signUp response:", { data, error });
    return { data, error };
  } catch (err) {
    console.error("SignUp error:", err);
    return { data: null, error: err };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Supabase signIn response:", { data, error });

    if (error) {
      console.error("Sign in error details:", error.message);
    }

    return { data, error };
  } catch (err) {
    console.error("SignIn error:", err);
    return { data: null, error: err };
  }
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
};

export const createProfile = async (
  userId: string,
  profileData: Partial<Profile>
) => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  return { data, error };
};
