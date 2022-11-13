/**
 * @file index.js
 * @author 
 * @brief Mainly the database operations will be performed here, such
 *        as retrieving user (walkee) data and updating them. 
 *        Will be primarily responsible for performing the following actions
 *        within the Requests page:
 *        1. Retrieving data and writing data onto New Requests 
 *           and Current Requests tables.
 *        2. Update and delete users.
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

import { user } from "./classes.js";
// import the walker object here!

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
 *  @const auto
 *
 * */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase();
// const userId = auth.currentUser.uid;

/**
 * @brief All global constants that are required for the functions.
 *
 */
const MAX_WALKER_COUNT = 5;
const userToken = ["a", "b", "c"];
const adminToken = ["d"];
const walkerToken = ["e"];
const dbRef = ref(getDatabase());
let userData;

/**
 * @function getUserData
 * @brief Asynchronously retrieves user info from the database from /users
 *        directory. Currently stores up to 5 students in an array for
 *        testing. And also to potentially save bandwidth.
 *
 * */
function getUserData() {
  /* This creates a new promise object which can be either be resolved
     or rejected. In this case promise is resolved if the data from the 
     server is found. If the data is found, the anonymous callback 
     function will resolve the promise with the data and pass it as a
     parameter in Promise.prototype.then().
     If a promise fails, then it will skip the .then and go to .catch. */
  let userData = new Promise(function (resolve, reject) {
    /* The get() is a firebase function which takes in two params.
       1. the databaseReference 
       2. the path where the database is located. The child() will 
          give us the subpath of /users/<this>. 
     */
    return get(child(dbRef, `users`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          
          let arr = [];
          /* To limit the reading to max 5 user entries...
           This may be useful for reading the number of walkers */
          let i = 0;
          snapshot.forEach(function (obj) {
            if (i < MAX_WALKER_COUNT) {
              arr.push(obj.val());
            }
            i++;
          });
          /* Promise is resolved here.  */
          resolve(arr);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        /* Promise has failed at this point, so it will throw an error.  */
        console.error(error);
      });
  });
  /**
   * Upon a resolved promise, the array of students
   * */
  userData.then(function (data) {
    /* //// Do stuff here with the data.
       //// Call fillTable() here. 
    */

    console.log(typeof(data));
    console.log(data);
    return data;
  });
}



/**
 * @function writeUserData
 * @param {user} user
 * @brief Takes user (walkee) object and writes to the database in
 * database path `/users/<authorizationToken>`.
 * */
function writeUserData(user) {
  /* Whenever we're writing we need to get the reference to the 
     database, and we can do so initializing it with a getDatabase() method.
  */
  const db = getDatabase();
  set(ref(db, `users/${user.assigned ? 'assigned': 'unassigned'}/`
                     + userToken[1]), {
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    addresses:{
      srcAddressL1: user.addresses.srcAddressL1,
      srcAddressL2: user.addresses.srcAddressL2,
      dstAddressL1: user.addresses.dstAddressL1,
      dstAddressL2: user.addresses.dstAddressL2,
    },
    checkInTime: {
      dateObj: user.checkInTime.dateObj.toString(),
      hour: user.checkInTime.hour,
      minute: user.checkInTime.minute,
    },
    checkOutTime: {
      dateObj: user.checkOutTime.dateObj.toString(),
      hour: user.checkInTime.hour,
      minute: user.checkInTime.minute,
    },
  });
}

/**
 * @function writeWalkerData
 * @param {user} user
 * @brief Takes user (walker) object and writes to the database in
 * database path `/walkers/<authorizationToken>`.
 * */
function writeWalkerData(user) {
  const db = getDatabase();
  set(ref(db, "walkers/" + walkerToken[1]), {
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    assigned: user.assigned,
    pairedWith: user.pairedWith,
    addresses: {
      srcAddressL1: user.addresses.srcAddressL1,
      srcAddressL2: user.addresses.srcAddressL2,
      dstAddressL1: user.addresses.dstAddressL1,
      dstAddressL2: user.addresses.dstAddressL2,
    },
    checkInTime: {
      dateObj: user.checkInTime.dateObj.toString(),
      hour: user.checkInTime.hour,
      minute: user.checkInTime.minute,
    },
    checkOutTime: {
      dateObj: user.checkOutTime.dateObj.toString(),
      hour: user.checkInTime.hour,
      minute: user.checkInTime.minute,
    },
  });
}

/**
 *  @function signIn
 *  @brief calls firebase's signInWithPopup method. 
 * */
function signIn() {
    /**
   *  @function signInWithPopup
   *  @param {FirebaseAuth} auth 
   *    Firebase authentication object
   *  @param {GoogleAuthProvider} provider 
   *    Utility class for constructing
   *    Google Sign In credentials.
   *  @brief Calls  authorization to log in using Google credentials. 
   *  */
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
/**
 * @function main
 * @brief The main driver of the page...
 *  */
async function main() {
  // signIn();
  /* getUserData is async. That means userData will be undefined
     until the data is completely retrieved. */
  // userData = getUserData();
  const user1 = new user(userToken[0],'james','xxx@scu.edu','33333332', 't', 't', 't', 't');
  console.log('the user: ', user1);
  
  // fillTable(user1);
  // user1.assigned = true;
  // console.log(user1);
  // writeUserData(user1);
  // user1.assigned = false;
  // writeUserData(user1);

  // userData = getUserData();
  // console.log(userData);
}

main();

/**
 * @function fillTable
 * @param { user } data
 * @brief fills the tables in the requests page (index.html).
 *        This function should be called by 
 * */
function fillTable(data){
  /* 1. First, create a table row and create a reference to the tbody.*/
  const tbody = document.querySelector('.new-requests>tbody');
  const firstRow = document.querySelector('tbody>tr');

  /* 2. Make dynamic copies of the row that is empty and append them to
        the tbody as a child. */
  for( child of firstRow){
    child.textContent = '';
  }

  /* 3. Create data's number of rows. */
  for (d of data) {
    const newRow = firstRow.cloneNode(true);
    tbody.appendChild(newRow);
  }
  /* 3. Iterate through the userDataObjs, append new texts to the new 
        empty rows, then append them as children. */
  for (child of ){
    newRow.childNodes[0].textContent = data.checkInTime.hour 
                               + ':' + data.checkInTime.minute;
    newRow.childNodes[1].textContent = data.name;
    newRow.childNodes[2].textContent = data.addresses.srcAddressL1 +
                                       data.addresses.dstAddressL2;
    newRow.childNodes[3].textContent = data.pairedWith;
    /* create a new row */
    
  }
    
}
  /* Copy the first node */
  

