import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Chrome, LogIn } from "lucide-react";

interface GoogleLoginProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  text?: string;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({
  onSuccess,
  onError,
  className = "",
  variant = "outline",
  size = "default",
  showIcon = true,
  text = "Continue with Google",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogleFirebase } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogleFirebase();
      console.log("Google login successful:", user);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Google login failed:", error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`transition-all duration-200 ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : showIcon ? (
        <Chrome className="w-4 h-4 mr-2" />
      ) : null}
      {isLoading ? "Signing in..." : text}
    </Button>
  );
};

export default GoogleLogin;
