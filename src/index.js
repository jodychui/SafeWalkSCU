/**
 * @file index.js
 * @brief Mainly the database operations will be performed here, such as
 *        retrieving user (walkee) data and updating them.
 *
 */

// Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getDatabase } from 'firebase/database';
// import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
/* Using browser modules for now... please do not delete above */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
/* For login */
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

import { student } from "./classes.js";
const firebaseConfig = {
  apiKey: "AIzaSyD4ER15Ypc7TCAXGlt_1tvmXEuLpXal14k",
  authDomain: "safewalkscu.firebaseapp.com",
  databaseURL: "https://safewalkscu-default-rtdb.firebaseio.com",
  projectId: "safewalkscu",
  storageBucket: "safewalkscu.appspot.com",
  messagingSenderId: "558548226148",
  appId: "1:558548226148:web:01051d9600a5174e9ecf71",
};

/**
 *  @brief Initializes the firebase application.
 *
 *  @const auto
 *
 * */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const db = getDatabase();
// const userId = auth.currentUser.uid;

/**
 * @const 
 *
 */

const MAX_WALKER_COUNT = 5;
const userToken = ["a", "b", "c"];
const adminToken = ["d"];
const walkerToken = ["e"];
const dbRef = ref(getDatabase());

/**
 * @var studentData
 *
 * @brief Asynchronously retrieves user info from the database from /users
 *        directory. Currently stores up to 5 students in an array for 
 *        testing. And also to potentially save bandwidth.
 *
 * */
let studentData = new Promise(function (resolve, reject) {
  return get(child(dbRef, `users`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let arr = [];
        /* To limit the reading to max 5 student entries...
         This may be useful for reading the number of walkers */
        let i = 0;
        snapshot.forEach(function (obj) {
          if (i < MAX_WALKER_COUNT) {
            arr.push(obj.val());
          }
          i++;
        });
        resolve(arr);
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

/**
 * Upon a resolved promise, the array of students
 * */
studentData.then(function (data) {
  console.log(data);
});

/**
 * @function writeUserData
 * @param {student}
 * @brief Takes student (walkee) object and writes to the database in
 * database path `/users/<authorizationToken>`.
 * */

function writeUserData(student) {
  const db = getDatabase();
  set(ref(db, "users/" + userToken[1]), {
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
    },
  });
}

/**
 * @function writeWalkerData
 * @param {student}
 * @brief Takes student (walker) object and writes to the database in
 * database path `/walkers/<authorizationToken>`.
 * */

function writeWalkerData(student) {
  const db = getDatabase();
  set(ref(db, "walkers/" + walkerToken[1]), {
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
    },
  });
}

/**
 *  @function signIn
 *  @param {FirebaseAuth} auth Firebase authentication object
 *  @param {GoogleAuthProvider} provider Utility class for constructing
 *                              Google Sign In credentials.
 *  @brief Grants authorization to log in using Google credentials.
 *  */
function signIn() {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // ...
      console.log(user);
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
}
signIn();