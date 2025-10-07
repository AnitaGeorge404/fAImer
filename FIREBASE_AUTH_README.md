# Firebase Google Authentication Integration

This document describes how to use the Firebase Google Authentication feature in the fAImer app.

## Setup

1. **Firebase Configuration**: The Firebase configuration is already set up in `src/lib/firebase.ts`
2. **Dependencies**: Firebase SDK is installed and ready to use
3. **Authentication Context**: Updated `AuthContext` supports both Supabase and Firebase authentication

## Components

### 1. GoogleLogin Component (`src/components/GoogleLogin.tsx`)

A reusable component for Google authentication:

```tsx
import GoogleLogin from "@/components/GoogleLogin";

// Basic usage
<GoogleLogin
  onSuccess={() => console.log("Login successful!")}
  onError={(error) => console.error("Login failed:", error)}
/>

// With custom styling
<GoogleLogin
  variant="outline"
  size="lg"
  className="w-full"
  text="Sign in with Google"
  showIcon={true}
/>
```

### 2. UserProfile Component (`src/components/UserProfile.tsx`)

Displays Firebase user information:

```tsx
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { firebaseUser } = useAuth();

  return (
    <UserProfile
      user={firebaseUser}
      onSignOut={() => console.log("User signed out")}
    />
  );
};
```

### 3. Updated AuthContext

The AuthContext now supports both Supabase and Firebase:

```tsx
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const {
    firebaseUser, // Firebase user object
    signInWithGoogleFirebase, // Firebase Google sign-in
    signOut, // Signs out from both services
  } = useAuth();

  // Check if user is signed in with Firebase
  if (firebaseUser) {
    return <div>Welcome, {firebaseUser.displayName}!</div>;
  }

  return <GoogleLogin onSuccess={() => {}} />;
};
```

## Usage in Existing Components

### LoginPage

- Updated to include Firebase Google authentication
- Falls back to Supabase if Firebase fails
- Uses the new GoogleLogin component

### ProfileScreen

- Shows Firebase user information when available
- Displays Google profile picture, name, and verification status

### FairFarm (Marketplace)

- Can be enhanced to show personalized content based on Firebase user
- User purchases can be associated with Firebase user ID

## Firebase Features Available

- ✅ **Google Sign-In**: One-click authentication with Google accounts
- ✅ **User Profile**: Access to Google profile information (name, email, photo)
- ✅ **Email Verification**: Shows verification status
- ✅ **Secure Sign-Out**: Properly clears Firebase session
- ✅ **Auto Sign-In**: Remembers user session across app restarts
- ✅ **Error Handling**: Graceful fallback to Supabase if Firebase fails

## Configuration

The Firebase configuration is now stored securely in environment variables. Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

The Firebase configuration in `src/lib/firebase.ts` now reads from these environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
```

### Environment Variable Validation

The Firebase configuration includes validation to ensure all required environment variables are present. If any are missing, the app will throw an error with details about which variables need to be set.

## Security Notes

- ✅ **Environment Variables**: Firebase configuration is now stored in environment variables for better security
- ✅ **Validation**: The app validates that all required Firebase environment variables are present
- ✅ **Domain Restriction**: API keys should be restricted by domain in Firebase Console
- ✅ **Safe Client-Side**: Firebase client configuration is safe to expose (when properly configured)
- ✅ **Secure Authentication**: User authentication is handled securely by Firebase
- ⚠️ **Environment Files**: Never commit `.env` files to version control - use `.env.example` as a template

### Setting up Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration values from the Firebase Console
3. Ensure `.env` is listed in your `.gitignore` file
4. For production deployments, set these environment variables in your hosting platform

## Testing

Use the `AuthDemo` component to test the authentication flow:

```tsx
import AuthDemo from "@/components/AuthDemo";

// In your app or test page
<AuthDemo />;
```

This provides a complete testing interface for the Google authentication features.
