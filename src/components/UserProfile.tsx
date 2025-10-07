import React from "react";
import { User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileProps {
  user?: User | null;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, className = "" }) => {
  const { firebaseUser } = useAuth();

  // Use the provided user or fallback to the one from context
  const displayUser = user || firebaseUser;

  if (!displayUser) {
    return null;
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center pb-2">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={displayUser.photoURL || undefined}
              alt={displayUser.displayName || "User"}
            />
            <AvatarFallback className="text-lg">
              {getInitials(displayUser.displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <CardTitle className="text-xl">
              {displayUser.displayName || "User"}
            </CardTitle>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {displayUser.email}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {displayUser.emailVerified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Verified Email
            </Badge>
          )}

          <Badge variant="outline">Firebase User</Badge>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            <strong>User ID:</strong> {displayUser.uid.slice(0, 8)}...
          </div>

          {displayUser.metadata.creationTime && (
            <div>
              <strong>Member since:</strong>{" "}
              {new Date(displayUser.metadata.creationTime).toLocaleDateString()}
            </div>
          )}

          {displayUser.metadata.lastSignInTime && (
            <div>
              <strong>Last login:</strong>{" "}
              {new Date(
                displayUser.metadata.lastSignInTime
              ).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
