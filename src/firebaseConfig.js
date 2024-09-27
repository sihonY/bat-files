import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDj5ET24dwiTPXiGFLCL_ENaOK6o0G5kg8",
    authDomain: "feedbackcollect-5e13c.firebaseapp.com",
    projectId: "feedbackcollect-5e13c",
    storageBucket: "feedbackcollect-5e13c.appspot.com",
    messagingSenderId: "127604703053",
    appId: "1:127604703053:web:77749b4df7cef6e8984104",
    measurementId: "G-1G2XN640CX"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// // 连接到 Firestore Emulator
// if (window.location.hostname === 'localhost') {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   }
export { db };