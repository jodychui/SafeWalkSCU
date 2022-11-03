// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";
// import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
/* Using browser modules for now... please do not delete above */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
/* For login */
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

import {student} from "./classes.js";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4ER15Ypc7TCAXGlt_1tvmXEuLpXal14k",
  authDomain: "safewalkscu.firebaseapp.com",
  databaseURL: "https://safewalkscu-default-rtdb.firebaseio.com",
  projectId: "safewalkscu",
  storageBucket: "safewalkscu.appspot.com",
  messagingSenderId: "558548226148",
  appId: "1:558548226148:web:01051d9600a5174e9ecf71",
};
/* 1. Initialize firebase */
const app = initializeApp(firebaseConfig);
/* 2. Get authorization  */
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
/* 
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
 */

const db = getDatabase();
// const userId = auth.currentUser.uid;

/* Database ref path to /user/ */

/* Database ref path to /admins/ */
/* Not needed for admin page */
function writeUserData(userData) {
  const db = getDatabase();
  set(ref(db, "users/" + userId), {
    name: userData.name,
    email: userData.email,
    checkIn: {
      hour: userData.hour,
      minute: userData.minute,
    },
  });
}

/* For walkers.
   Records the check in time
Uses Google login token for ID.*/
function checkInTime (id) {
  const now = new Date();
  const obj = {
    hour: now.getHours(),
    minute: now.getMinutes(),
  }
  return obj;
};

/* Generates initial user data */
function createUserData(id, name, email , phoneNumber, addressL1, addressL2){
  const obj = {
    id: id, /* temporary */
    email: email,
    name: name,
    phoneNumber: phoneNumber,
    addressL1: addressL1,
    addressL2: addressL2,
  }
  return obj;
}



const userToken = ["a", "b", "c"];

async function main() {
  const studentObj = student(userToken[0], 'sam','xxx@scu.edu', '123123122','123 NY NY');
  
  console.log(studentObj);



  // writeUserData("a", "sam", "asdf@gmail.com", "str", checkInTime());
}
main();
