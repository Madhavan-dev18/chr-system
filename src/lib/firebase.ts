import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-878457399-906e3",
  "appId": "1:413941462511:web:adb43c4b6d3073a579b21a",
  "apiKey": "AIzaSyCAtcEJmeIxST_lC5Z6frUIOqTQ2rKlkXs",
  "authDomain": "studio-878457399-906e3.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "413941462511"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };