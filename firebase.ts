import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOwiNuSPxrGRN1TX2s679OAm4sBxP9fSA",
  authDomain: "brainbox-e287c.firebaseapp.com",
  projectId: "brainbox-e287c",
  storageBucket: "brainbox-e287c.firebasestorage.app",
  messagingSenderId: "680658846776",
  appId: "1:680658846776:web:d5633af133c7e5ca5792cd"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };