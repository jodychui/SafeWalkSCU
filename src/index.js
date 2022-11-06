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
  child,
  get
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

/* Not needed for admin page. Takes student object and writes to the 
   database. The date is stored as a string. */
function writeUserData(student) {
  const db = getDatabase();
  set(ref(db, "users/" + student.token), {
    name: student.name,
    email: student.email,
    phoneNumber: student.phoneNumber,
    addressL1: student.addressL1,
    addressL2: student.addressL2,
    checkInTime: {
      dateObj: student.checkInTime.dateObj.toString(),
      hour: student.checkInTime.hour,
      minute: student.checkInTime.minute,
    },
    checkOutTime: {
      dateObj: student.checkOutTime.dateObj.toString(),
      hour: student.checkInTime.hour,
      minute: student.checkInTime.minute,
    }
  });
}


const userToken = ["a", "b", "c"];


// get(db, `users/${userToken[0]}`).then((snapshot)=> {
//   if (snapshot.exists()) {
//     console.log(snapshot.val());
    
    
//   } else {
//     console.log('no data');
//   }
// }).catch((error) => {
//   console.error(error);
// })

async function main() {
  const studentObj = student(userToken[0], 'sam','xxx@scu.edu', '123123122','123 NY NY');
  
  console.log(studentObj);
  studentObj.setCheckInTime();

  console.log(studentObj.checkInTime.dateObj.toString());

  setTimeout ( () => {
    studentObj.setCheckOutTime();
    console.log(studentObj.checkOutTime.dateObj.toString());
  
    console.log(studentObj.getElapsedTime().toString());

    
  },5000)  
  // writeUserData(studentObj);
  
}
main();
