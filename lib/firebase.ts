// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBlnS3nuagJNtXsi2nISX7GDa6LnEU4Zw",
  authDomain: "zento-e1f82.firebaseapp.com",
  projectId: "zento-e1f82",
  storageBucket: "zento-e1f82.firebasestorage.app",
  messagingSenderId: "72248432840",
  appId: "1:72248432840:web:64587090abdb4bd66aedfd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app) 