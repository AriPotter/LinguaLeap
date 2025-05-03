// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Validate that the essential config variables are present
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.error("Firebase API Key is missing or invalid. Please set NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file.");
}
if (!firebaseConfig.authDomain || firebaseConfig.authDomain === "YOUR_AUTH_DOMAIN") {
    console.error("Firebase Auth Domain is missing or invalid. Please set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN in your .env.local file.");
}
if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.error("Firebase Project ID is missing or invalid. Please set NEXT_PUBLIC_FIREBASE_PROJECT_ID in your .env.local file.");
}


// Initialize Firebase only if API key is likely valid
let app;
let auth: ReturnType<typeof getAuth>;
let googleProvider: GoogleAuthProvider;

// Prevent initialization if critical config is missing or clearly placeholder
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" &&
                     firebaseConfig.authDomain && firebaseConfig.authDomain !== "YOUR_AUTH_DOMAIN" &&
                     firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID";


if (isConfigValid) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        // Fallback or handle the error appropriately, maybe prevent app features relying on Firebase
         // @ts-ignore - Initialize with null/undefined to satisfy TS, but functions using them should check
         auth = undefined;
         // @ts-ignore
         googleProvider = undefined;
    }
} else {
  console.warn("Firebase initialization skipped due to missing or placeholder configuration.");
   // @ts-ignore - Initialize with null/undefined to satisfy TS, but functions using them should check
   auth = undefined;
   // @ts-ignore
   googleProvider = undefined;
}



export { app, auth, googleProvider };
