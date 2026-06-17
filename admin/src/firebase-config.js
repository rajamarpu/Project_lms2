import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Replace the placeholder values with your actual Firebase project config.
const firebaseConfig = {
  apiKey: "AIzaSyBeup6DcxfQ0CX9ZGpzvp2nXdCeKpPyrtE",
  authDomain: "fir-646bd.firebaseapp.com",
  projectId: "fir-646bd",
  storageBucket: "fir-646bd.firebasestorage.app",
  messagingSenderId: "760780238203",
  appId: "1:760780238203:web:a4da99f2463196217a61de",
  measurementId: "G-X063ZLZD4F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Google provider for use in the app
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
