import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB_SidCedkEzMOWedKSoprNrnXMO_jumvA",
    authDomain: "cisckids-25.firebaseapp.com",
    projectId: "cisckids-25",
    storageBucket: "cisckids-25.firebasestorage.app",
    messagingSenderId: "274037817546",
    appId: "1:274037817546:web:1c8b2028667cf6b804f433",
    measurementId: "G-8715M25MXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);