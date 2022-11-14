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
// import { getDatabase, ref, set, child, get, Database, remove } from 'firebase/database';
// import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
/* Using browser modules for now... please do not delete above */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js';
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  remove
} from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js';
/* For login */
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js';

import { user } from './classes.js';
// import the walker object here!

const firebaseConfig = {
  apiKey: 'AIzaSyD4ER15Ypc7TCAXGlt_1tvmXEuLpXal14k',
  authDomain: 'safewalkscu.firebaseapp.com',
  databaseURL: 'https://safewalkscu-default-rtdb.firebaseio.com',
  projectId: 'safewalkscu',
  storageBucket: 'safewalkscu.appspot.com',
  messagingSenderId: '558548226148',
  appId: '1:558548226148:web:01051d9600a5174e9ecf71',
};

/**
 *  @brief Initializes the firebase application.
 *  @const {Database} db
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
const userToken = ['a', 'b', 'c'];
const adminToken = ['d'];
const walkerToken = ['e'];
const dbRef = ref(getDatabase());
const emptyElements = cloneEmptyElements();


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
    return get(dbRef)
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
          console.log('No data available');
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
    console.log(data);
    console.log(data[0]['unassigned']);
    fillNewReqTable(data[0]['unassigned']);
    fillPendingReqTable(data[0]['assigned']);
    // setTimeout(deleteUser(data[0]['a']), 3000);

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
  set(ref(db, `users/${user.assigned ? 'assigned': 'unassigned'}/`
                     + user.token), {
    token: user.token,
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
    pairedWalkers: {
      walker1: user.pairedWalkers.walker1,
      walker2: user.pairedWalkers.walker2,
    },
    assigned: user.assigned,
  });
}

/**
 * @function writeWalkerData
 * @param {user} user
 * @brief Takes user (walker) object and writes to the database in
 * database path `/walkers/<authorizationToken>`.
 * */
function writeWalkerData(user) {
  set(ref(db, 'walkers/' + walkerToken[2]), {
    token: user.token,
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
  // const user1 = new user(userToken[0], 'Jodi','Jodi@scu.edu',
  //                 '3234233423', '254 Villas Ave', '','324 Villa Rd', '' );
  // console.log(user1);
  // writeUserData(user1);
  let fields = {
    userToken: ['a','b','c','d'],
    names : ['Jodi', 'Marty', 'Kristina', 'Shamwow'],
    emails : ['Jodi@scu.edu', 'Marty@scu.edu', 'Kristina@scu.edu', 'shamwow@scu.edu'],
    phoneNumbers : ['626-321-4212','503-421-2451','322-323-3543','434-434-4652'],
    srcAddressL1 : ['324 Villa Rd', '322 Country Rd', '523 New York Ave', '242 Camino Rd'],
    dstAddressL1 : ['423 El Camino Rd' ,'322 DownTown Ave','234 Vickie Ave', '234 Marengo Ave'],
    assigned: [false,false,false,true],
  }
  let arr= [];
  for (let i = 0; i < 4; i++){
    let user1 = new user(fields.userToken[i],fields.names[i],fields.emails[i]
                    , fields.phoneNumbers[i], fields.srcAddressL1[i]
                    , '', fields.dstAddressL1[i] );
    user1.assigned = fields.assigned[i];
    arr.push(user1);
    writeUserData(user1);
  }

  
  getUserData();
}

main();
/**
 * @function fillTable
 * @param { user } data 
 * @brief fills the tables in the requests page (index.html).
 *        This function should be called by the fill table.
 *        Note that the data is an array of two objects.
 *        1. Assigned user objs and 2. Unassigned user objs.
 * */
function fillNewReqTable(data){
  /* 1. First, create a table row and create a reference to the tbody.*/
  const tbody = document.querySelectorAll('.new-requests>tbody')[0];
  const tr = tbody.children[0];
  if (typeof data === "undefined") {
    if (typeof (tr) ==='undefined') return;
    if (tr.children.length > 0 ){
      [...tr.children].forEach(function(elem) {
        elem.textContent = '';
        elem.remove();
      });
    }
    tbody.setAttribute(
      "style",
      "display: flex; justify-content: center;" + "padding: 0.75rem"
    );
    tbody.textContent = "No ongoing requests.";
    return;
  }
  /* 2. Clear all the children of tbody and make dynamic copies of
        the row that is empty and append them to the tbody as a child. */
  const dataSize = Object.keys(data).length;
  [...tbody.children].forEach((node) => {node.remove()});
  /* 3. Create data's number of rows. */
  for (let i = 0; i < dataSize; i++) {
    const newRow = emptyElements['unassignedRow'].cloneNode(true);
    tbody.appendChild(newRow);
  }
  /* 3. Iterate through the userDataObjs, append new texts to the new 
        empty rows, then append them as children.
        We can access the unassigned users by iterating through 
        each keys of the first element of our student object array.
        We also set the unique token in the id attribute per row to 
        allow us to select them with its unique property.
        */
  let i = 0;
  for (const tr of tbody.children){
    console.log(data);
    const user = Object.values(data)[i++];
    tr.setAttribute('userToken', user.token);
    tr.setAttribute('assigned', 'false');
    tr.children[0].textContent = trailingZeroes(user.checkInTime.hour, 2)
                                + ':' + trailingZeroes(user.checkInTime.
                                  minute, 2) + 'PM';
    tr.children[1].textContent = user.name;
    tr.children[2].textContent = user.addresses.srcAddressL1 + ' '
                                  user.addresses.srcAddressL2;
    tr.children[3].textContent = user.addresses.dstAddressL1 + ' '
                                  user.addresses.dstAddressL2;
    tr.children[tr.children.length - 1].addEventListener('click', deleteUser);
  }
}


/**
 * @function fillPendingReqTable
 * @param { user } data 
 * @brief fills the tables in the requests page (index.html).
 *        This function should be called once the data is successfully
 *        retrieved. Assigned.
 * */
 function fillPendingReqTable(data){
   const tbody = document.querySelectorAll('.new-requests>tbody')[1];
   const tr = tbody.children[0];
   if (typeof(data) === 'undefined'){
    if (typeof (tr) ==='undefined') return;
    if (tr.children.length > 0){
      [...tr.children].forEach(function(elem) {
        elem.textContent = '';
        elem.remove();
      });
    }
     tbody.setAttribute('style','display: flex; justify-content: center;'
                      + 'padding: 0.75rem');
     tbody.textContent = 'No ongoing requests.';
     return;
   }
  const dataSize = Object.keys(data).length;
  [...tbody.children].forEach((node) => {node.remove()});
  for (let i = 0; i < dataSize; i++) {
    const newRow = emptyElements['assignedRow'].cloneNode(true);
    tbody.appendChild(newRow);
  }
  let i = 0;
  for (const tr of tbody.children){
    const user = Object.values(data)[i++];
    tr.setAttribute('userToken', user.token);
    tr.setAttribute('assigned', true);
    tr.children[0].textContent = trailingZeroes(user.checkInTime.hour, 2)
                                + ':' + trailingZeroes(user.checkInTime.
                                  minute, 2) + 'PM';
    tr.children[1].textContent = user.name;
    tr.children[2].textContent = user.addresses.dstAddressL1 + ' '
                                  user.addresses.dstAddressL2;
    tr.children[3].textContent = user.pairedWalkers.walker1 + ' & ' 
                               + user.pairedWalkers.walker2;
    tr.children[4].textContent = 'TODO';
    tr.children[tr.children.length - 1].addEventListener('click', deleteUser);
  }
}

/* //! ==================== DELETION ACTION ============================= */

/**
 * @function deleteUser
 * @param {String} userToken 
 * @param {Boolean} assigned 
 * @brief Deletes a directory in firebase db which contains the user data.
 *        Grabs userToken from the id and assigned attributes on the <td> elements
 *        
 */
async function deleteUser(e) {
  console.log(`you clicked ${e.currentTarget}!!`);
  const userToken = e.currentTarget.parentNode.getAttribute('userToken');
  const assigned = e.currentTarget.parentNode.getAttribute('assigned');
  
  /* 1. Create a reference to the db with the given userToken. and get its 
        directory. */
    console.log(assigned);
    const path = `users/${assigned === 'true' ? 'assigned': 'unassigned'}/${userToken}`;
    console.log(path);
    const target = ref(db, path);
  /* 2. Call the firebase remove() */
    remove(target);
    alert('user has been deleted!');
    
    getUserData();
}

/**
 * @function clearTable
 * @param {Node} tableNode 
 */
function clearChildren(tableNode){
   const row = tableNode.children[0].cloneNode(true);
   [...tableNode.children].forEach(function (elem) {
      elem.remove();
   })
   tableNode.appendChild(row);
}



/**
 * @param {Number} number 
 * @param {Number} howMany 
 * @returns The newly created string of the given {number} to 
 *          {howMany} decimal places.
 */
function trailingZeroes(number, howMany){
  const str = number.toLocaleString('en-US', {
    minimumIntegerDigits: howMany,
    useGrouping: false
  })
  return str;
}

function cloneEmptyElements(){
  /* For Unassigned Table Row */
  let arr = [];
  let row1 = document.querySelector('tbody').children[0];
  let newRow1 = row1.cloneNode(true);
  for (let i = 0; i < 4; i++){
    newRow1.children[i].textContent ='';
  }
  arr['unassignedRow'] = newRow1;

  /* For assigned Table Row */
  let row2 = document.querySelectorAll('tbody')[1].children[0];
  let newRow2 = row2.cloneNode(true);
  for (let i = 0; i < 5; i++){
    newRow2.children[i].textContent ='';
  }
  arr['assignedRow'] = newRow2;

  return arr;

}