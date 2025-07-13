// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "supply-chain-tracecraft.firebaseapp.com",
  projectId: "supply-chain-tracecraft",
  storageBucket: "supply-chain-tracecraft.firebasestorage.app",
  messagingSenderId: "875467375734",
  appId: "1:875467375734:web:ace10dab9b78cff258cb57",
  measurementId: "G-4BYRP2WD0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore Database

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword };
