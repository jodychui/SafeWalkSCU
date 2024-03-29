
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
  userGetCheckInTime,
  userSetCheckInTime,
  userSetCheckOutTime,
} from "./classes.js";
import { walker } from "./classes.js";
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
     *     give us the subpath of /<this>.
     */
    return get(dbRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          let obj = {};
          if (snapshot.hasChild("assignedUsers")) {
            obj["assignedUsers"] = snapshot.child("assignedUsers").val();
          }
          if (snapshot.hasChild("unassignedUsers")) {
            obj["unassignedUsers"] = snapshot.child("unassignedUsers").val();
          }
          if (snapshot.hasChild("unavailableWalkers")) {
            obj["unavailableWalkers"] = snapshot
              .child("unavailableWalkers")
              .val();
          }
          if (snapshot.hasChild("availableWalkers")) {
            obj["availableWalkers"] = snapshot.child("availableWalkers").val();
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
    organizePair(globalUserData);
    console.log(globalUserData);
    fillUnassignedTable(globalUserData["unassignedUsers"]);
    fillAssignedTable(globalUserData["assignedUsers"]);
    fillAssignPopup(globalUserData['availableWalkers']);

    showLastRefreshed();

    return data;
  });
}

/**
 * @function writeUserData
 * @param {user} user
 * @brief Takes user (walkee) object and writes to the database in
 * database path `/<authorizationToken>`.
 * */
function writeUserData(user) {
  /* Whenever we're writing we need to get the reference to the 
     database, and we can do so initializing it with a getDatabase() method.
  */
  set(
    ref(
      db,
      `${user.assigned ? "assignedUsers" : "unassignedUsers"}/` + user.token
    ),
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
 * @param {walker} walker
 * @var assigned shows if user is assigned to a walker
 * @brief Takes user (walker) object and writes to the database in
 * database path `/walkers/<authorizationToken>`.
 * */
function writeWalkerData(walker) {
  const path =
    walker.onDuty && !walker.onWalk ? "availableWalkers" : "unavailableWalkers";
  set(ref(db, `${path}/` + walker.token), {
    token: walker.token,
    name: walker.name,
    email: walker.email,
    phoneNumber: walker.phoneNumber,
    available: walker.onDuty && !walker.onWalk, //!!check this
    // unavailable: !walker.onDuty || walker.onWalk,
    checkInTime: walker.checkInTime.dateObj.toString(),
    checkOutTime: walker.checkOutTime.dateObj.toString(),

    pairedWith: walker.pairedWith,
    currentLocation: walker.currentLocation,
    completedWalk: walker.completedWalk,
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
    userToken: ["ac", "bc", "cc", "dc"],
    names: ["Jodi", "Marty", "Kristina", "Shamwowow"],
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
  let arr = [];
  for (let i = 0; i < 4; i++) {
    let user1 = new user(
      fields.userToken[i],
      fields.names[i],
      fields.emails[i],
      fields.phoneNumbers[i],
      fields.srcAddressL1[i],
      "",
      fields.dstAddressL1[i]
    );
    if (i === 3){
      user1.pairedWalkers.walker1Token = 'dca'
      user1.pairedWalkers.walker2Token = 'dcb'
    }
    user1.assigned = fields.assigned[i];
    userSetCheckInTime(user1);

    arr.push(user1);
    writeUserData(user1);
  }
  let fieldsWalker = {
    userToken: ["dca", "dcb", "dcc", "dcd"],
    names: ["Ross", "Rachel", "Monica", "Chandler"],
    emails: [
      "Ross@scu.edu",
      "Rachel@scu.edu",
      "Monica@scu.edu",
      "Chandler@scu.edu",
    ],
    phoneNumbers: [
      "626-321-4212",
      "503-421-2451",
      "322-323-3543",
      "434-434-4652",
    ],
    locations: [
      "324 Villa Rd",
      "322 Country Rd",
      "523 New York Ave",
      "242 Camino Rd",
    ],
    onDuty: [true, true, true, true],
    onWalk: [true, true, false, false],
    
  };
  let arr2 = [];
  for (let i = 0; i < 4; i++) {
    let walker1 = new walker(
      fieldsWalker.userToken[i],
      fieldsWalker.names[i],
      fieldsWalker.emails[i],
      fieldsWalker.phoneNumbers[i],
      fieldsWalker.onDuty[i],
      fieldsWalker.onWalk[i],
      fieldsWalker.locations[i],
      ""
    );
    if (i === 0 || i === 1 ){
      walker1.pairedWith.userToken = 'dc';
    }

    arr2.push(walker1);
    writeWalkerData(walker1);
  }
  
  
  // const walker1 = new walker(
  //   "z",
  //   "Xavier",
  //   "Xav@scu.edu",
  //   "714-324-3212",
  //   true,
  //   false,
  //   "El Macho Blvd",
  //   false
  // );
  // walker1.assigned = false;
  // userSetCheckInTime(walker1);
  // writeWalkerData(walker1);

//   setTimeout( ()=> {    moveWalkerToAvail('d');
// }, 5000);
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
  const tbody = document.querySelector("#unassignedTable");
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
    tr.setAttribute("assignedUsers", "false");
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
    // tr.children[tr.children.length - 1].firstElementChild.addEventListener(
    //   "click",
    //   deleteUserOnClick
    // );
    $(tr.children[tr.children.length - 1].firstElementChild).click(
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
  const tbody = document.querySelector("#assignedTable");
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
    userGetCheckInTime(user);
    tr.setAttribute("userToken", user.token);
    tr.setAttribute("assignedUsers", true);
    tr.children[0].textContent = `
    ${trailingZeroes(user.checkInTime.hour, 2)}:${trailingZeroes(
      user.checkInTime.minute,
      2
    )} ${user.checkInTime.meridiem}`;
    tr.children[1].textContent = user.name;
    tr.children[2].textContent = user.addresses.dstAddressL1 + " ";
    // tr.children[3].textContent = "TODO";
    if (user.elapsedTime.day >= 1) {
      tr.children[4].textContent = `> ${user.elapsedTime.day} days`;
    } else {
      tr.children[4].textContent = `${user.elapsedTime.hour} ${user.elapsedTime.hour > 1 ? "hours" : "hour"
        } ${user.elapsedTime.minute} ${user.elapsedTime.minute > 1 ? "mins" : "min"
        }`;
    }
    $(tr.children[tr.children.length - 1].firstElementChild).click(
      deleteUserOnClick
    );
  }
}
/**
 * 
 * @param { walker } data 
 * @returns 
 */
function fillAssignPopup(data) {
  const tbody = document.querySelector("#assignPopup");
  if (typeof data === "undefined") {
    clearAssignPopup();
    return;
  }
  if (tbody.children.length === 0) {
    resetAssignPopupStyle(tbody);
  }
  const dataSize = Object.keys(data).length;
  [...tbody.children].forEach((node) => {
    node.remove();
  });
  /* We need to have at least twice the number of rows vs. avail walkers. */
  for (let i = 0; i < Math.floor((dataSize + 1) / 2); i++) {
    const newRow = emptyElements["assignPopup"].cloneNode(true);
    tbody.appendChild(newRow);
  }
  let i = 0, j = 0;
  let walker = Object.values(data); // array
  for (const tr of tbody.children) {
    if (j > 0) {
      for (const td of tr.children) {
        td.style['border-top'] = '1px solid #dee2e6';
      }

    }
    if (typeof walker[i] !== 'undefined') {
      tr.lastElementChild.firstElementChild.textContent = walker[i++].name;
    }
    if (typeof walker[i] !== 'undefined') {
      tr.lastElementChild.lastElementChild.textContent = walker[i++].name;
    }
    else {
      tr.children[1].lastElementChild.remove();
    }
    j++;
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
  const userToken =
    e.currentTarget.parentNode.parentNode.getAttribute("userToken");
  const assigned =
    e.currentTarget.parentNode.parentNode.getAttribute("assignedUsers");
  const path = `${assigned === "true" ? "assignedUsers" : "unassignedUsers"
    }/${userToken}`;

  console.log("path ", path);
  /* We only want to add a single instance of event listener, and not each
     time it's clicked. That's how we open a delicious can of worms 😀 */
  $('#confirmDelete').one('click', function () {
    console.log(`you clicked ${userToken}!!`);
    /* 1. Create a reference to the db with the given userToken. and get its 
  
              directory. */
    console.log(path);
    const target = ref(db, path);
    /* 2. Call the firebase remove() */
    if (assigned === 'true') {
      moveWalkerToAvail(userToken);
    }
    remove(target);

    document.querySelector("#cancelDelete").click();

  })
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
  const path = `${assigned === "true" ? "assignedUsers" : "unassignedUsers"
    }/${userToken}`;
  console.log(path);
  remove(ref(db, path));
  deleted ? alert("user has been deleted!") : alert("user has been moved!");

  // initializeData();
}

/**
 * @function clearUnassignedTable
 * @brief Clears the Unassigned User Table only and sets the row to write
 *        'No new requests'
 */
function clearUnassignedTable() {
  const tbody = document.querySelector("#unassignedTable");
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
  const tbody = document.querySelector("#assignedTable");
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
 * @function clearAssignPopup
 * @brief Clears the popup to write only and sets the row to write
 *        'No new requests'
 */
function clearAssignPopup() {
  const tbody = document.querySelector("#assignPopup");
  const tr = tbody.children;
  if (typeof tr === "undefined") return;
  if (tr.length > 1) {
    for (let i = 1; i < tr.length; i++) {
      tr[i].remove();
    }
  }
  if (tr[0].children.length > 0) {
    [...tr[0].children].forEach(function (elem) {
      elem.remove();
    });
  }
  tr[0].setAttribute('style', 'display: flex; justify-content: center;');
  tr[0].textContent = "No available walkers at this time.";
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

/**
 * @function resetAssignPopupStyle
 * @param {Node} node
 * @brief Resets the table body element back to how it was. Can be called
 *        when resetting properties set by clearUnassignedTable()
 *        or clearAssignedTable()
 */
function resetAssignPopupStyle(node) {
  node.style.removeProperty("justify-content");
  node.textContent = "";
}
/* //! ======================== STYLES =================================*/
function showLastRefreshed() {
  const p = document.querySelector("#last-refreshed");
  if (p !== null) {
    p.textContent = `Data last updated: ${new Date().toString()}`;
    return;
  }
  let tableSection = document.querySelector(".col.pt-4");
  const lastUpdatedMsg = document.createElement("p");
  lastUpdatedMsg.textContent = `Data last updated: ${new Date().toString()}`;
  lastUpdatedMsg.setAttribute("id", "last-refreshed");
  lastUpdatedMsg.setAttribute(
    "style",
    "text-align: center; font-size: smaller"
  );
  tableSection.appendChild(lastUpdatedMsg);
}

/* //! ======================== MOVE ACTION ============================ */
/**
 * @function moveToAssigned
 * @param {String} userToken
 * Takes a userToken to move the corresponding row into the assigned table.
 */
function moveUserToAssigned(userToken) {
  let newAssignedUser = globalUserData["unassignedUsers"][userToken];
  if (typeof newAssignedUser === "undefined") {
    return;
  }
  /* Delete the existing unassigned data. */
  deleteUserByToken(userToken, false, false);
  /* Copy the data to the new assigned row. Change its assigned property
     to 'assigned.'*/
  newAssignedUser.assigned = true;
  writeUserData(newAssignedUser);
}

/**
 * @function moveWalkerToAvail
 * @param {String} userToken 
 * @brief This function is used when an admin deletes an ongoing user. 
 * 
 *        This means that we will not only remove the user from the pending 
 *        request in assignedUser but also move walkers from unavailableWalkers 
 *        to availableWalkers.
 */
function moveWalkerToAvail(userToken) {
  let walker1, walker2;
  if (typeof globalUserData["pairs"][userToken][1] !== "undefined") {
    console.log('hereee');
    walker1 = globalUserData["pairs"][userToken][1];
    deleteWalkerByToken(walker1.token, false, false);
    walker1.onWalk = false;
    walker1.onDuty = true;
    walker1.pairedWith.walkerPairToken = '';
    walker1.pairedWith.userToken = '';
    writeWalkerData(walker1);
  }
  else {
    console.log('UNDEFINED WALKER1');
  }
  if (typeof globalUserData["pairs"][userToken][2] !== "undefined") {
    walker2 = globalUserData["pairs"][userToken][2];
    deleteWalkerByToken(walker2.token, false, false);
    //// We probably should call a function that determines the walkers availability
    //// schedule here. But this will just be a placeholder for now. 
    walker2.onDuty = true;
    walker2.onWalk = false;
    walker2.pairedWith.walkerPairToken = '';
    walker2.pairedWith.userToken = '';
    writeWalkerData(walker2);
  }
  else {
    console.log('UNDEFINED WALKER2');
  }
}

/**
 * 
 * @param {String} walkerToken 
 * @param {Boolean} available 
 * @param {Boolean} deleted 
 */
async function deleteWalkerByToken(walkerToken, available, deleted = true) {
  const path = `${available === "true" ? "availableWalkers" : "unavailableWalkers"
    }/${walkerToken}`;
  console.log(path);
  remove(ref(db, path));
  // deleted ? alert("walker has been deleted!") : alert("walker has been moved!");

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
  let row1 = document.querySelector("#unassignedTable").children[0];
  let newRow1 = row1.cloneNode(true);
  for (let i = 0; i < 4; i++) {
    newRow1.children[i].textContent = "";
  }
  arr["unassignedRow"] = newRow1;

  /* For assigned Table Row */
  let row2 = document.querySelector("#assignedTable").children[0];
  let newRow2 = row2.cloneNode(true);
  for (let i = 0; i < 5; i++) {
    if (i !== 3) {
      // At index 3 is where the profile pictures are. Do not overwrite.
      newRow2.children[i].textContent = "";
    }
  }
  arr["assignedRow"] = newRow2;

  let row3 = document.querySelector("#assignPopup").children[0];
  let newRow3 = row3.cloneNode(true);
  [...newRow3.children[2].children].forEach((node) => {
    node.textContent = "";
  });
  arr["assignPopup"] = newRow3;
  console.log(arr);
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
  if (typeof data["unassignedUsers"] !== "undefined") {
    Object.values(data["unassignedUsers"]).forEach(
      /**
       * @param {user} user
       */
      function (user) {
        /* Extract values for the checkInTime to an object... */
        let dateObj = new Date(user.checkInTime);
        const checkInTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12 === 0 ? 12 : dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() >= 12 ? "PM" : "AM",
        };
        user.checkInTime = checkInTime;

        dateObj = new Date(user.checkOutTime);
        const checkOutTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12 === 0 ? 12 : dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() >= 12 ? "PM" : "AM",
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
  if (typeof data["assignedUsers"] !== "undefined") {
    Object.values(data["assignedUsers"]).forEach(
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
          meridiem: dateObj.getHours() >= 12 ? "PM" : "AM",
        };
        user.checkInTime = checkInTime;

        dateObj = new Date(user.checkOutTime);
        const checkOutTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() >= 12 ? "PM" : "AM",
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
  if (typeof data["availableWalkers"] !== "undefined") {
    Object.values(data["availableWalkers"]).forEach(
      /**
       * @param {walker} walker
       */
      function (walker) {
        /* Extract values for the checkInTime to an object... */
        let dateObj = new Date(walker.checkInTime);
        const checkInTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12 === 0 ? 12 : dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() >= 12 ? "PM" : "AM",
        };
        walker.checkInTime = checkInTime;

        dateObj = new Date(walker.checkOutTime);
        const checkOutTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12 === 0 ? 12 : dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() >= 12 ? "PM" : "AM",
        };
        walker.checkOutTime = checkOutTime;
      }
    );
  }
  if (typeof data["unavailableWalkers"] !== "undefined") {
    Object.values(data["unavailableWalkers"]).forEach(
      /**
       * @param {walker} walker
       */
      function (walker) {
        /* Extract values for the checkInTime to an object... */
        let dateObj = new Date(walker.checkInTime);
        const checkInTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12 === 0 ? 12 : dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() >= 12 ? "PM" : "AM",
        };
        walker.checkInTime = checkInTime;

        dateObj = new Date(walker.checkOutTime);
        const checkOutTime = {
          dateObj: dateObj,
          hour: dateObj.getHours() % 12 === 0 ? 12 : dateObj.getHours() % 12,
          minute: dateObj.getMinutes(),
          meridiem: dateObj.getHours() >= 12 ? "PM" : "AM",
        };
        walker.checkOutTime = checkOutTime;
      }
    );
  }
  return data;
}

/**
 * @function organizePair
 * @param {Object} globalUserObj
 * @brief  Parses the information in FirebaseDB to create a pair, under
 *         `globalUserData['pairs']`, using the user token as the key, and
 *         the three user/walkers object as values.
 * @precondition There must be even number of available or unavailable walkers
 *         and its properties have been fully converted to JS objects.
 */
function organizePair(globalUserObj) {
  if (typeof globalUserObj["unavailableWalkers"] !== "undefined"
    && typeof globalUserObj['assignedUsers'] !== 'undefined') {
    /* You must first create an object in pairs before you create an array
         per pair */
    let newPairLocation = (globalUserObj["pairs"] = {});

    /* Then we can create an array for every assigned users. */
    Object.keys(globalUserObj["assignedUsers"]).forEach(function (userToken) {
      newPairLocation[userToken] = [];
    });
    Object.values(globalUserObj.unavailableWalkers).forEach(
      /**
       * @param {walker} walker
       */
      function (walker) {
        /* 1. Get the user token */
        const sharedToken = walker.pairedWith.userToken;
        /* 2. Get the user object */
        const pairedUser = globalUserObj["assignedUsers"][sharedToken];

        /*  This *should* store the user information and the walkers together
              Recall that two walkers share the same userID, so we gotta filter 
              that out. */
        if (!newPairLocation[sharedToken].includes(pairedUser)) {
          newPairLocation[sharedToken].push(pairedUser);
        }
        newPairLocation[sharedToken].push(walker);
      }
    );
  }

  // console.log(globalUserObj);
  // If there are available walkers, do nothing.
}

/* //! ======================== PAGE ERROR HANDLING =========================  */
/**
 * @function setTableRefresh
 * @param {Number} rate refresh rate in seconds
 * @brief Sets the table refresh interval of given rate, if a network is available.
 */
function setTableRefresh(rate) {
  const intervalID = setInterval(function () {
    fillAssignedTable(globalUserData["assignedUsers"]);
    fillUnassignedTable(globalUserData["unassignedUsers"]);
  }, rate * 1000);
}

/* //! ======================== POPUPS =========================  */


$('#walkersPopUp').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})

/* //! ======================== HTML GEOLOCATION =========================  */
// https://www.sanwebe.com/2016/04/get-current-location-of-user-using-jquery


