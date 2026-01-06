// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALf0nsWSwd6ZLmWVGSloHYKkNiS5ypcNg",
  authDomain: "swish-mern.firebaseapp.com",
  projectId: "swish-mern",
  storageBucket: "swish-mern.firebasestorage.app",
  messagingSenderId: "697739470856",
  appId: "1:697739470856:web:03dd8502f9bb0640bc89bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);