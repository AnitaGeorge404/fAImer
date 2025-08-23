import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, Profile, getCurrentUser, getProfile } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<Profile>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await getProfile(currentUser.id);
        setProfile(profileData);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData } = await getProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp: async (email: string, password: string, userData?: any) => {
      const { signUp } = await import("@/lib/supabase");
      return signUp(email, password, userData);
    },
    signIn: async (email: string, password: string) => {
      const { signIn } = await import("@/lib/supabase");
      return signIn(email, password);
    },
    signInWithGoogle: async () => {
      const { signInWithGoogle } = await import("@/lib/supabase");
      return signInWithGoogle();
    },
    signOut: async () => {
      const { signOut } = await import("@/lib/supabase");
      const result = await signOut();
      setUser(null);
      setProfile(null);
      return result;
    },
    updateProfile: async (updates: Partial<Profile>) => {
      if (!user) return { error: "No user logged in" };

      const { updateProfile } = await import("@/lib/supabase");
      const result = await updateProfile(user.id, updates);

      if (result.data) {
        setProfile(result.data);
      }

      return result;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
