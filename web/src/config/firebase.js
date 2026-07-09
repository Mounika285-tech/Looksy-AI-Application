import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAYyvAKGQjMljg9AI_dCyCR4Ov1is8yXqY",
  authDomain: "looksy-5dae8.firebaseapp.com",
  projectId: "looksy-5dae8",
  storageBucket: "looksy-5dae8.firebasestorage.app",
  messagingSenderId: "395666236301",
  appId: "1:395666236301:web:b77ed13969902ab63a93c4",
  measurementId: "G-0MZD8VW109",
  databaseURL: "https://looksy-5dae8-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase App for web
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };
