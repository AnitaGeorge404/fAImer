import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleLogin from "./GoogleLogin";
import UserProfile from "./UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const AuthDemo: React.FC = () => {
  const { firebaseUser } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Firebase Google Authentication Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!firebaseUser ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Sign in with your Google account to access the fAImer
                  marketplace
                </p>
                <GoogleLogin
                  onSuccess={() => console.log("Login successful!")}
                  onError={(error) => console.error("Login failed:", error)}
                  className="mx-auto"
                  size="lg"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-green-600">
                  🎉 Successfully signed in with Google!
                </h3>
                <Separator />
                <UserProfile user={firebaseUser} />
              </div>
            )}

            <Separator />

            <div className="text-center space-y-2">
              <h4 className="font-semibold">Features Available:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Google Authentication with Firebase</li>
                <li>✅ User Profile Display</li>
                <li>✅ Secure Sign Out</li>
                <li>✅ Integration with fAImer App</li>
                <li>✅ Dark/Light Theme Support</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthDemo;
