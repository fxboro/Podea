import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Replace these with actual config later via env vars
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-podea.firebaseapp.com",
  projectId: "demo-podea",
  storageBucket: "demo-podea.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:12345:web:xyz123"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Enable local emulators for safe development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
  } catch (err) {
    // Ignore emulator connection errors during HMR
  }
}
