// Import the functions you need from the SDKs you need

// import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";
// import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

/* Using browser modules for now... please do not delete above */
import { initializeApp} from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js';


/* For login */
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const studentEmail = ['student1', 'student2'];


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4ER15Ypc7TCAXGlt_1tvmXEuLpXal14k",
  authDomain: "safewalkscu.firebaseapp.com",
  databaseURL: "https://safewalkscu-default-rtdb.firebaseio.com",
  projectId: "safewalkscu",
  storageBucket: "safewalkscu.appspot.com",
  messagingSenderId: "558548226148",
  appId: "1:558548226148:web:01051d9600a5174e9ecf71"
};



/* 1. Initialize firebase */
const app = initializeApp(firebaseConfig);
/* 2. Get authorization  */
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // ...

    console.log(user);
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });





