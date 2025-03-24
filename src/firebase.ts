import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDnbhpdk6NIdQNuOf4wit7KSF6r4qqGoKU",
  authDomain: "sourpow-1b562.firebaseapp.com",
  databaseURL: "https://sourpow-1b562-default-rtdb.firebaseio.com",
  projectId: "sourpow-1b562",
  storageBucket: "sourpow-1b562.firebasestorage.app",
  messagingSenderId: "302247263467",
  appId: "1:302247263467:web:50c4bd8147c132c30812ae",
  measurementId: "G-KRJ9234KWV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);