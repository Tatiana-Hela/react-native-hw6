import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAs-UHXO09981Q_O5q8FWIx3rnVl0_4oBQ",
  authDomain: "social-app-b9e7c.firebaseapp.com",
  projectId: "social-app-b9e7c",
  storageBucket: "social-app-b9e7c.appspot.com",
  messagingSenderId: "680191295629",
  appId: "1:680191295629:web:e4e48ffc322ef5a1cde2c4",
  measurementId: "G-HGXJLCM986",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
