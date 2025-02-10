import { initializeApp, getApps, getApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFcLgJhkdaPY1ra5LIrqRERJJ3-WIyBTk",
  authDomain: "jain-stavan-86cb6.firebaseapp.com",
  databaseURL: "https://jain-stavan-86cb6-default-rtdb.firebaseio.com",
  projectId: "jain-stavan-86cb6",
  storageBucket: "jain-stavan-86cb6",
  messagingSenderId: "285813640279",
  appId: "1:285813640279:android:391d7080512f1ed79b6712"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

export default app;
