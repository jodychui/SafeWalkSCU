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
// import { getDatabase, ref, set, child, get, Database, remove, onChildChanged, DataSnapshot } from 'firebase/database';
// import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
/* Using browser modules for now... please do not delete above */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  limitToFirst,
  onChildChanged,
  onChildRemoved,
  onChildAdded,
  remove,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
/* For login */
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

import {
  user,
  userGetElapsedTime,
  userSetCheckInTime,
  userSetCheckOutTime,
} from "./classes.js";
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
const userToken = ["a", "b", "c"];
const adminToken = ["d"];
const walkerToken = ["e"];
const dbRef = ref(getDatabase());
const emptyElements = cloneEmptyElements();
onChildAdded(dbRef, initializeData);
onChildChanged(dbRef, initializeData);
onChildRemoved(dbRef, initializeData);
let globalUserData = {};

/**
 * @function initializeData
 * @brief Asynchronously retrieves user info from the database from /users
 *        directory, stores into globalUserData and update the tables, and 
 *        add event listeners to the firebase database to listen for changes.
 * */
function initializeData() {
  /* This creates a new promise object which can be either be resolved
     or rejected. In this case promise is resolved if the data from the 
     server is found. If the data is found, the anonymous callback 
     function will resolve the promise with the data and pass it as a
     parameter in Promise.prototype.then().
     If a promise fails, then it will skip the .then and go to .catch. */
  let userData = new Promise(function (resolve, reject) {
    /**
     * @function get
     * @param {DataSnapshot} snapshot
     *  The get() is a firebase function which takes in two params.
     *  1. the databaseReference
     *  2. the path where the database is located. The child() will
     *     give us the subpath of /users/<this>.
     */
    return get(child(dbRef, "users/"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let obj = {};
          if (snapshot.hasChild("assigned")) {
            obj["assigned"] = snapshot.child("assigned").val();
          }
          if (snapshot.hasChild("unassigned")) {
            obj["unassigned"] = snapshot.child("unassigned").val();
          }
          /* Promise is resolved here.  */
          resolve(obj);
        } else {
          console.log("No data available");
          /* If the user list is empty, then set it to empty object to let 
             the clearAllTables handle the empty objects. */
          globalUserData = {};
          clearAllTables();
        }
      })
      .catch((error) => {
        /* Promise has failed at this point, so it will throw an error.  */
        console.error(error);
      });
  });
  userData.then(function (data) {
    /* Make a global user data... */
    /* First and foremost we convert necessary properties to objects. */
    globalUserData = data;
    stringToJSON(globalUserData);
    
    fillUnassignedTable(globalUserData["unassigned"]);
    fillAssignedTable(globalUserData["assigned"]);
  
    showLastRefreshed();
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
  set(
    ref(db, `users/${user.assigned ? "assigned" : "unassigned"}/` + user.token),
    {
      token: user.token,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      addresses: {
        srcAddressL1: user.addresses.srcAddressL1,
        srcAddressL2: user.addresses.srcAddressL2,
        dstAddressL1: user.addresses.dstAddressL1,
        dstAddressL2: user.addresses.dstAddressL2,
      },
      checkInTime: user.checkInTime.dateObj.toString(),
      checkOutTime: user.checkOutTime.dateObj.toString(),
      elapsedTime: user.elapsedTime.dateObj.toString(),
      pairedWalkers: {
        walker1Token: user.pairedWalkers.walker1Token,
        walker2Token: user.pairedWalkers.walker2Token,
      },
      assigned: user.assigned,
    }
  );
}

/**
 * @function writeWalkerData
 * @param {user} user
 * @brief Takes user (walker) object and writes to the database in
 * database path `/walkers/<authorizationToken>`.
 * */
function writeWalkerData(user) {
  set(ref(db, "walkers/" + walkerToken[2]), {
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
  /* initializeData is async. That means user data will be undefined
     until the data is completely retrieved. */
  let fields = {
    userToken: ["a", "b", "c", "d"],
    names: ["Jodi", "Marty", "Kristina", "Shamwow"],
    emails: [
      "Jodi@scu.edu",
      "Marty@scu.edu",
      "Kristina@scu.edu",
      "shamwow@scu.edu",
    ],
    phoneNumbers: [
      "626-321-4212",
      "503-421-2451",
      "322-323-3543",
      "434-434-4652",
    ],
    srcAddressL1: [
      "324 Villa Rd",
      "322 Country Rd",
      "523 New York Ave",
      "242 Camino Rd",
    ],
    dstAddressL1: [
      "423 El Camino Rd",
      "322 DownTown Ave",
      "234 Vickie Ave",
      "234 Marengo Ave",
    ],
    assigned: [false, false, false, true],
  };
  // let arr = [];
  // for (let i = 0; i < 3; i++) {
  //   let user1 = new user(
  //     fields.userToken[i],
  //     fields.names[i],
  //     fields.emails[i],
  //     fields.phoneNumbers[i],
  //     fields.srcAddressL1[i],
  //     "",
  //     fields.dstAddressL1[i]
  //   );
  //   user1.assigned = fields.assigned[i];
  //   userSetCheckInTime(user1);
  //   arr.push(user1);
  //   writeUserData(user1);
  // }
  // const user1 = new user('f','shamwow','shamwow@ucsd.edu','341-321-1231',
  // 'Shammy ave','','el camino rd');
  // user1.assigned = true;
  // writeUserData(user1);

  initializeData();
  setTableRefresh(1);
 
}

main();
/**
 * @function fillUnassignedTable
 * @param { user } data
 * @brief Fills the information in the tables in the requests page (index.html).
 *        This function should be called by the fill table.
 * @precondition The data must have been converted to a JS Object, including 
 *               the time and geolocation.
 * */
function fillUnassignedTable(data) {
  /* 1. First, create a table row and create a reference to the tbody.*/
  const tbody = document.querySelectorAll(".new-requests>tbody")[0];
  const tr = tbody.children[0];
  if (typeof data === "undefined") {
    clearUnassignedTable();
    return;
  }
  if (tbody.children.length === 0) {
    resetTbodyStyle(tbody);
  }
  /* 2. Clear all the children of tbody and make dynamic copies of
        the row that is empty and append them to the tbody as a child. */
  const dataSize = Object.keys(data).length;
  [...tbody.children].forEach((node) => {
    node.remove();
  });
  /* 3. Create data's number of rows. */
  for (let i = 0; i < dataSize; i++) {
    const newRow = emptyElements["unassignedRow"].cloneNode(true);
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
  for (const tr of tbody.children) {
    const user = Object.values(data)[i++];
    tr.setAttribute("userToken", user.token);
    tr.setAttribute("assigned", "false");
    tr.children[0].textContent = `
      ${trailingZeroes(user.checkInTime.hour, 2)}:${trailingZeroes(
      user.checkInTime.minute,
      2
    )} ${user.checkInTime.meridiem}`;
    tr.children[1].textContent = user.name;
    tr.children[2].textContent = user.addresses.srcAddressL1 + " ";
    user.addresses.srcAddressL2;
    tr.children[3].textContent = user.addresses.dstAddressL1 + " ";
    user.addresses.dstAddressL2;
    tr.children[tr.children.length - 1].addEventListener(
      "click",
      deleteUserOnClick
    );
  }
}

/**
 * @function fillAssignedTable
 * @param { user } data
 * @brief Fills the tables in the requests page (index.html).
 * @precondition The data must have been converted to a JS Object, including 
 *               the time and geolocation.
 * */
function fillAssignedTable(data) {
  const tbody = document.querySelectorAll(".new-requests>tbody")[1];
  const tr = tbody.children[0];
  if (typeof data === "undefined") {
    clearAssignedTable();
    return;
  }
  if (tbody.children.length === 0) {
    resetTbodyStyle(tbody);
  }
  const dataSize = Object.keys(data).length;
  [...tbody.children].forEach((node) => {
    node.remove();
  });
  for (let i = 0; i < dataSize; i++) {
    const newRow = emptyElements["assignedRow"].cloneNode(true);
    tbody.appendChild(newRow);
  }

  let i = 0;
  for (const tr of tbody.children) {
    let user = Object.values(data)[i++];
    // console.log(user);
    userGetElapsedTime(user);
    tr.setAttribute("userToken", user.token);
    tr.setAttribute("assigned", true);
    tr.children[0].textContent = `
    ${trailingZeroes(user.checkInTime.hour, 2)}:${trailingZeroes(
      user.checkInTime.minute,
      2
    )} ${user.checkInTime.meridiem}`;
    tr.children[1].textContent = user.name;
    tr.children[2].textContent = user.addresses.dstAddressL1 + " ";
    tr.children[3].textContent = 'TODO';
    tr.children[4].textContent = `${user.elapsedTime.hour} ${
      user.elapsedTime.hour > 1 ? "hours" : "hour"
    } ${user.elapsedTime.minute} ${
      user.elapsedTime.minute > 1 ? "mins" : "min"
    }`;
    tr.children[tr.children.length - 1].addEventListener(
      "click",
      deleteUserOnClick
    );
  }
}

/* //! ==================== DELETION & ADD ACTION ======================== */

/**
 * @function deleteUserOnClick
 * @param {Event} e
 * @brief A call back function which deletes a directory in firebase db
 *        containing user data. Grabs userToken from the id and assigned
 *        attributes on the <td> elements from the parent element
 *        of td (the <tr>).
 */
async function deleteUserOnClick(e) {
  console.log(`you clicked ${e.currentTarget}!!`);
  const userToken = e.currentTarget.parentNode.getAttribute("userToken");
  const assigned = e.currentTarget.parentNode.getAttribute("assigned");

  /* 1. Create a reference to the db with the given userToken. and get its 
        directory. */
  const path = `users/${
    assigned === "true" ? "assigned" : "unassigned"
  }/${userToken}`;
  console.log(path);
  const target = ref(db, path);
  /* 2. Call the firebase remove() */
  remove(target);
  alert("user has been deleted!");

  initializeData();
}

/**
 * @function deleteUserByToken
 * @param {String} userToken
 * @param {Boolean} assigned
 * @param {Boolean} action by default 'deleted. 'Moved' otherwise.
 * @brief Deletes a user by given userToken and assigned/unassigned status.
 *        Alternative to using AddEventListener 'click' event.
 */
async function deleteUserByToken(userToken, assigned, deleted = true) {
  const path = `users/${
    assigned === "true" ? "assigned" : "unassigned"
  }/${userToken}`;
  console.log(path);
  remove(ref(db, path));
  deleted ? alert("user has been deleted!") : alert("user has been moved!");

  initializeData();
}

/**
 * @function clearUnassignedTable
 * @brief Clears the Unassigned User Table only and sets the row to write
 *        'No new requests'
 */
function clearUnassignedTable() {
  const tbody = document.querySelectorAll(".new-requests>tbody")[0];
  const tr = tbody.children[0];
  if (typeof tr === "undefined") return;
  if (tr.children.length > 0) {
    [...tr.children].forEach(function (elem) {
      elem.textContent = "";
      elem.remove();
    });
  }
  tbody.setAttribute(
    "style",
    "display: flex; justify-content: center;" + "padding: 0.75rem"
  );
  tbody.textContent = "No new requests.";
  return;
}

/**
 * @function clearAssignedTable
 * @brief Clears the Assigned User Table only and sets the row to write
 *        'No new requests'
 */
function clearAssignedTable() {
  const tbody = document.querySelectorAll(".new-requests>tbody")[1];
  const tr = tbody.children[0];
  if (typeof tr === "undefined") return;
  if (tr.children.length > 0) {
    [...tr.children].forEach(function (elem) {
      elem.textContent = "";
      elem.remove();
    });
  }
  tbody.setAttribute(
    "style",
    "display: flex; justify-content: center;" + "padding: 0.75rem"
  );
  tbody.textContent = "No new requests.";
  return;
}

/**
 * @function clearAllTables
 * @brief Clears all tables on this page.
 */
function clearAllTables() {
  clearAssignedTable();
  clearUnassignedTable();
}

/**
 * @function resetTbodyStyle
 * @param {Node} node
 * @brief Resets the table body element back to how it was. Can be called
 *        when resetting properties set by clearUnassignedTable()
 *        or clearAssignedTable()
 */
function resetTbodyStyle(node) {
  node.style.removeProperty("display");
  node.style.removeProperty("justify-content");
  node.style.removeProperty("padding");
  node.textContent = "";
}
/* //! ======================== STYLES =================================*/
function showLastRefreshed(){
  const p = document.querySelector('#last-refreshed');
  if ( p !== null){
    p.textContent = `Data last updated: ${new Date().toString()}`;
    return;
  }
  let tableSection = document.querySelector('.col.pt-4');  
  const lastUpdatedMsg = document.createElement('p');
  lastUpdatedMsg.textContent = `Data last updated: ${new Date().toString()}`;
  lastUpdatedMsg.setAttribute('id', 'last-refreshed');
  lastUpdatedMsg.setAttribute('style','text-align: center; font-size: smaller');
  tableSection.appendChild(lastUpdatedMsg);
}


/* //! ======================== MOVE ACTION ============================ */
/**
 * @function moveToAssigned
 * @param {String} userToken
 * Takes a userToken to move the corresponding row into the assigned table.
 */
function moveToAssigned(userToken) {
  let newAssignedUser = globalUserData["unassigned"][userToken];
  if (typeof newAssignedUser === "undefined") {
    return;
  }
  /* Delete the existing unassigned data. */
  deleteUserByToken(userToken, false, false);
  /* Copy the data to the new assigned row. Change its assigned property
     to 'assigned.'*/
  newAssignedUser.assigned = true;
  writeUserData(newAssignedUser);
  initializeData();
}

/**
 * @param {Number} number
 * @param {Number} howMany
 * @returns The newly created string of the given {number} to
 *          {howMany} decimal places.
 */
function trailingZeroes(number, howMany) {
  const str = number.toLocaleString("en-US", {
    minimumIntegerDigits: howMany,
    useGrouping: false,
  });
  return str;
}

/**
 * @function cloneEmptyElements
 * @returns an array of row tbody elements/Nodes
 * @brief Used to generate a empty row elements to be cloned dynamically
 *        using Node.cloneNode(true). The array has the following elems:
 *        arr[0] = unassignedRow
 *        arr[1] = assignedRow
 *        arr[2] = ...
 *        arr[3] = ...
 */
function cloneEmptyElements() {
  /* For Unassigned Table Row */
  let arr = [];
  let row1 = document.querySelector("tbody").children[0];
  let newRow1 = row1.cloneNode(true);
  for (let i = 0; i < 4; i++) {
    newRow1.children[i].textContent = "";
  }
  arr["unassignedRow"] = newRow1;

  /* For assigned Table Row */
  let row2 = document.querySelectorAll("tbody")[1].children[0];
  let newRow2 = row2.cloneNode(true);
  for (let i = 0; i < 5; i++) {
    newRow2.children[i].textContent = "";
  }
  arr["assignedRow"] = newRow2;

  return arr;
}
/**
 * @function stringToJSON
 * @param {Object} data
 * @returns new data object with JSON components
 * @brief Converts string to JSON for necessary properties, such as Dates
 *        Geolocation. This will create checkInTime, checkOutTime,
 *        and elapsedTime JS objects.
 * @precondition The data must be an object of two keys: 'assigned' and
 *              'unassigned.'
 */
function stringToJSON(data) {
  if (typeof data["unassigned"] !== "undefined") {
    Object.values(data["unassigned"]).forEach(
      /**
       * @param {user} user
       */
      function (user) {
        /* Extract values for the checkInTime to an object... */
        let dateObj = new Date(user.checkInTime);
        const checkInTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() / 12 > 1 ? "PM" : "AM",
        };
        user.checkInTime = checkInTime;

        dateObj = new Date(user.checkOutTime);
        const checkOutTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() / 12 > 1 ? "PM" : "AM",
        };
        user.checkOutTime = checkOutTime;

        dateObj = new Date(user.elapsedTime);
        const elapsedTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
        };
        user.elapsedTime = elapsedTime;
      }
    );
  }
  if (typeof data["assigned"] !== "undefined") {
    Object.values(data["assigned"]).forEach(
      /**
       * @param {user} user
       */
       function (user) {
        /* Extract values for the checkInTime to an object... */
        let dateObj = new Date(user.checkInTime);
        const checkInTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() / 12 > 1 ? "PM" : "AM",
        };
        user.checkInTime = checkInTime;

        dateObj = new Date(user.checkOutTime);
        const checkOutTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() / 12 > 1 ? "PM" : "AM",
        };
        user.checkOutTime = checkOutTime;

        dateObj = new Date(user.elapsedTime);
        const elapsedTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
        };
        user.elapsedTime = elapsedTime;
      }
    );
  }
  return data;
}

/* //! ======================== PAGE ERROR HANDLING =========================  */  
/**
 * @function setTableRefresh
 * @param {Number} rate refresh rate in seconds
 * @brief Sets the table refresh interval of given rate, if a network is available.
 */
function setTableRefresh(rate) {
  const intervalID = setInterval(function () {
    
    fillAssignedTable(globalUserData["assigned"]);
    fillUnassignedTable(globalUserData["unassigned"]);
  }, rate * 1000);
}