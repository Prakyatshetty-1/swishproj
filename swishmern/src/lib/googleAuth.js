import { signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "./firebase";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const signInWithGoogle = async () => {
  try {
    console.log('🔵 Starting Google Sign-In...');
    
    // Set persistence to local
    await setPersistence(auth, browserLocalPersistence);
    console.log('✅ Firebase persistence set to local');
    
    const provider = new GoogleAuthProvider();
    
    // Set language to English
    auth.languageCode = 'en';
    
    // Sign in with popup
    console.log('🔵 Opening Google Sign-In popup...');
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('✅ Google Sign-In successful:', {
      email: user.email,
      displayName: user.displayName,
      uid: user.uid
    });
    
    // Get the ID token from Firebase
    console.log('🔵 Getting Firebase ID token...');
    const idToken = await user.getIdToken();
    console.log('✅ Firebase ID token obtained, length:', idToken.length);
    
    // Send the token to your backend to verify and create/update user
    console.log('🔵 Sending authentication request to backend...');
    const response = await axios.post(`${API_BASE_URL}/auth/google-signin`, {
      idToken,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
    });
    console.log('✅ Backend response received:', {
      hasAccessToken: !!response.data?.accessToken,
      hasRefreshToken: !!response.data?.refreshToken,
      hasUser: !!response.data?.user,
      userId: response.data?.user?._id || response.data?.user?.id
    });

    if (response.data && response.data.accessToken && response.data.user) {
      console.log('🔵 Storing tokens in localStorage...');
      console.log('📝 Access Token length:', response.data.accessToken.length);
      console.log('📝 Refresh Token length:', response.data.refreshToken.length);
      
      // Store tokens and user info in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("onboardingComplete", response.data.user.onboardingComplete ? 'true' : 'false');
      
      console.log('✅ Tokens stored successfully');
      console.log('✅ User stored:', response.data.user.username || response.data.user.email);
      
      // Dispatch custom event to notify App of auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      console.log('✅ Auth state change event dispatched');
      
      return response.data;
    } else {
      console.error('❌ Invalid response from server:', response.data);
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("❌ Google sign in error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    throw error;
  }
};
