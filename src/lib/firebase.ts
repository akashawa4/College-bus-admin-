import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "AIzaSyA_dNJKD8AnIzzp4HEUve6fOND1HZyYWo8",
  authDomain: "college-bus-tracking-d0cd5.firebaseapp.com",
  projectId: "college-bus-tracking-d0cd5",
  storageBucket: "college-bus-tracking-d0cd5.firebasestorage.app",
  messagingSenderId: "695470119139",
  appId: "1:695470119139:web:1e909810deba676d6f4dd6",
  measurementId: "G-GLGJK8B98G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);