import React, { useState, useEffect } from "react";
import { Phone, Mic, Fingerprint, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LanguageSelector from "./LanguageSelector";
import GoogleLogin from "./GoogleLogin";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPageProps {
  onLanguageChange?: (languageCode: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLanguageChange }) => {
  const [loginType, setLoginType] = useState<"email" | "phone">("email");

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signInWithGoogleFirebase } = useAuth();

  // Clear any URL parameters on component mount
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError("");

      await signInWithGoogleFirebase();
      // Firebase auth state change will automatically handle navigation
    } catch (err) {
      setError("Failed to sign in with Google");
      console.error("Google authentication error:", err);
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
      // This is a dummy phone authentication - no actual login
      console.log("Dummy phone OTP submitted");
    }
  };

  const handleVoiceLogin = () => {
    // Simulate voice recognition - dummy function
    console.log("Dummy voice login triggered");
  };

  const handleBiometricLogin = () => {
    // Simulate biometric authentication - dummy function
    console.log("Dummy biometric login triggered");
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
        <Card
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl border-0 dark:shadow-2xl transition-colors duration-300"
          style={{ marginTop: "70px" }}
        >
          <CardHeader className="text-center pb-6 relative">
            {/* Language Selector */}
            <div className="absolute top-4 left-4">
              <LanguageSelector onLanguageChange={onLanguageChange} />
            </div>
            {/* Logo */}
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <img
                src="/lovable-uploads/b68830df-4731-4efe-b233-08588e1334b3.png"
                alt="fAImer Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-2 transition-colors duration-300">
              fAImer
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
                {/* Email/Google Authentication */}
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sign in with Google
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use your Google account to access fAImer
                    </p>
                  </div>

                  {/* Google Authentication */}
                  <GoogleLogin
                    onSuccess={() => {
                      // Firebase auth state change will automatically handle navigation
                    }}
                    onError={(error) =>
                      setError("Failed to sign in with Google")
                    }
                    className="w-full border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    text="Continue with Google"
                    variant="outline"
                    size="lg"
                  />
                </div>
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
