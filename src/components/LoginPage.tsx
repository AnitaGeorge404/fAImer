import React, { useState, useEffect } from "react";
import {
  Phone,
  Mic,
  Fingerprint,
  Mail,
  Chrome,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LanguageSelector from "./LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPageProps {
  onLogin: () => void;
  onLanguageChange?: (languageCode: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onLanguageChange }) => {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginType, setLoginType] = useState<"email" | "phone">("email");

  // Email/Password states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Check for email verification parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const type = urlParams.get("type");

    console.log("URL parameters:", {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      type,
    });

    if (type === "signup" && accessToken) {
      setError(
        "Email verified successfully! You can now sign in with your credentials."
      );
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (authMode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (!fullName.trim()) {
        setError("Please enter your full name");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);
    setError("");

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("Request timed out. Please try again.");
    }, 10000); // 10 second timeout

    try {
      if (authMode === "login") {
        console.log("Attempting to sign in with:", { email });
        const { data, error } = await signIn(email, password);

        console.log("Sign in response:", {
          user: data?.user ? "User found" : "No user",
          session: data?.session ? "Session found" : "No session",
          error: error?.message,
        });

        if (error) {
          console.error("Sign in error details:", error);
          // More specific error messages
          if (error.message.includes("Email not confirmed")) {
            setError(
              "Please check your email and click the confirmation link before signing in."
            );
          } else if (error.message.includes("Invalid login credentials")) {
            setError(
              "Invalid email or password. Make sure your account is confirmed."
            );
          } else {
            setError(error.message);
          }
        } else if (data.user) {
          console.log("Sign in successful, calling onLogin()");
          onLogin();
        } else {
          console.warn("Sign in returned no error but no user either");
          setError("Sign in failed - no user returned");
        }
      } else {
        const { data, error } = await signUp(email, password, {
          full_name: fullName,
        });
        if (error) {
          setError(error.message);
          console.error("Sign up error:", error);
        } else {
          console.log("Sign up successful:", data);
          // Show success message instead of error
          alert(
            "Account created successfully! Please check your email and click the confirmation link to activate your account."
          );
          setAuthMode("login"); // Switch to login mode
          setPassword(""); // Clear password fields
          setConfirmPassword("");
          setFullName("");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      } else {
        onLogin();
      }
    } catch (err) {
      setError("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    if (phoneNumber.length === 10) {
      setLoading(true);
      // Simulate OTP sending delay
      setTimeout(() => {
        setShowOtp(true);
        setLoading(false);
      }, 1000);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      onLogin();
    }
  };

  const handleVoiceLogin = () => {
    // Simulate voice recognition
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  const handleBiometricLogin = () => {
    // Simulate biometric authentication
    setTimeout(() => {
      onLogin();
    }, 500);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-center mb-6">
          <LanguageSelector onLanguageChange={onLanguageChange} />
        </div>

        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl border-0 dark:shadow-2xl transition-colors duration-300">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <img
                src="/lovable-uploads/b68830df-4731-4efe-b233-08588e1334b3.png"
                alt="VayalCare Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2 transition-colors duration-300">
              VayalCare
            </h1>
            <p className="text-green-600 dark:text-green-300 text-sm transition-colors duration-300">
              Your Personal Farming Assistant
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                {error}
              </div>
            )}

            {/* Login Type Toggle */}
            <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant={loginType === "email" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setLoginType("email")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant={loginType === "phone" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setLoginType("phone")}
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </Button>
            </div>

            {loginType === "email" ? (
              <>
                {/* Auth Mode Toggle */}
                <div className="text-center space-x-4">
                  <Button
                    variant={authMode === "login" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setAuthMode("login")}
                  >
                    Login
                  </Button>
                  <Button
                    variant={authMode === "signup" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign Up
                  </Button>
                </div>

                {/* Email Authentication Form */}
                <div className="space-y-4">
                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleEmailAuth}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    {loading
                      ? "Processing..."
                      : authMode === "login"
                        ? "Sign In"
                        : "Create Account"}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Authentication */}
                <Button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Chrome className="h-4 w-4 mr-2" />
                  Sign in with Google
                </Button>
              </>
            ) : (
              // Phone Authentication (existing code)
              <>
                {!showOtp ? (
                  <>
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                          +91
                        </span>
                        <Input
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="rounded-l-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          maxLength={10}
                        />
                      </div>
                      <Button
                        onClick={handlePhoneLogin}
                        disabled={phoneNumber.length !== 10 || loading}
                        className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Send OTP
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                          Or login with
                        </span>
                      </div>
                    </div>

                    {/* Voice Recognition */}
                    <Button
                      onClick={handleVoiceLogin}
                      variant="outline"
                      className="w-full border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Recognition
                    </Button>

                    {/* Biometric Login */}
                    <Button
                      onClick={handleBiometricLogin}
                      variant="outline"
                      className="w-full border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Fingerprint Login
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Enter the 6-digit OTP sent to +91 {phoneNumber}
                      </p>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <Button
                      onClick={handleOtpSubmit}
                      disabled={otp.length !== 6}
                      className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    >
                      Verify & Login
                    </Button>
                    <Button
                      onClick={() => setShowOtp(false)}
                      variant="ghost"
                      className="w-full dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      Back to Phone Number
                    </Button>
                  </div>
                )}
              </>
            )}

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
