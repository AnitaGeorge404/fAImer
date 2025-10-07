// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error("Missing Firebase environment variables:", missingEnvVars);
  throw new Error(
    `Missing Firebase configuration: ${missingEnvVars.join(", ")}`
  );
}

// Debug function to check environment variables (only in development)
if (import.meta.env.DEV) {
  console.log("🔧 Firebase environment variables loaded:");
  console.log(
    "- API Key:",
    import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "- Auth Domain:",
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "- Project ID:",
    import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "- Storage Bucket:",
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "- Messaging Sender ID:",
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "- App ID:",
    import.meta.env.VITE_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "- Measurement ID:",
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? "✅ Set" : "❌ Missing"
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only if in browser environment)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence to local storage to maintain auth state across browser sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider for better user experience
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Google Sign In function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign Out function
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { analytics };
export default app;
