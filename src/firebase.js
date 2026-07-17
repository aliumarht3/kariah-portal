import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAC_nVjC4mR1KiJh5it46zLdbVIS_FyhWs",
  authDomain: "masjidalehsanss4.firebaseapp.com",
  databaseURL: "https://masjidalehsanss4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "masjidalehsanss4",
  storageBucket: "masjidalehsanss4.firebasestorage.app",
  messagingSenderId: "227744099682",
  appId: "1:227744099682:web:6e83285166ca3bb754103b",
  measurementId: "G-NYP526CJ2W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();