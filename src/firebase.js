// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBfTAJcPbQ62inR2iJhJR76l919-1g8tfo",
  authDomain: "cost-tracker-react.firebaseapp.com",
  projectId: "cost-tracker-react",
  storageBucket: "cost-tracker-react.firebasestorage.app",
  messagingSenderId: "772036802584",
  appId: "1:772036802584:web:4e514442417827bd4c6b6d",
  measurementId: "G-5TC2LGR8JE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };