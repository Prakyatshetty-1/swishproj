import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    
    // Set language to English
    auth.languageCode = 'en';
    
    // Sign in with popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Get the ID token from Firebase
    const idToken = await user.getIdToken();
    
    // Send the token to your backend to verify and create/update user
    const response = await axios.post(`${API_BASE_URL}/auth/google-signin`, {
      idToken,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
    });

    if (response.data && response.data.accessToken && response.data.user) {
      // Store tokens and user info in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("onboardingComplete", response.data.user.onboardingComplete ? 'true' : 'false');
      
      // Dispatch custom event to notify App of auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      
      return response.data;
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};
