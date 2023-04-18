function user(
  token,
  name,
  email,
  phoneNumber,
  srcAddressL1,
  srcAddressL2 = " ",
  dstAddressL1,
  dstAddressL2 = " "
) {
  this.token = token;
  this.name = name;
  this.email = email;
  this.phoneNumber = phoneNumber;
  this.addresses = {
    srcAddressL1: srcAddressL1,
    srcAddressL2: srcAddressL2,
    dstAddressL1: dstAddressL1,
    dstAddressL2: dstAddressL2,
  };

  /* fields */
  this.assigned = true;
  this.pairedWalkers = {
    walker1Token: "",
    walker2Token: "",
  };
  this.checkInTime = {
    dateObj: new Date(),
    hour: 0,
    minute: 0,
    meridiem: "",
  };
  this.checkOutTime = {
    dateObj: new Date(),
    hour: 0,
    minute: 0,
  };
  this.elapsedTime = {
    dateObj: new Date(),
    hour: 0,
    minute: 0,
  };
}

/* Calculate the difference in time, returns the difference in minutes */
/**
 * @function userGetElapsedTime
 * @param {user} userObj
 * @return elapsedTime object
 * @brief Retrieves the user elapsed time as an object and stores into its
 * checkInTime property.
 * @precondition The user check in time has already been recorded by calling
 *               userCheckInTime().
 */
const userGetElapsedTime = function (userObj) {
  let difference = new Date(Math.abs(new Date() - userObj.checkInTime.dateObj));
  const obj = {
    dateObj: difference,
    hour: Math.floor(difference.getTime() / 3600000),  // in milliseconds to hrs
    minute: difference.getMinutes(),
    day: Math.floor(difference.getTime() / 86400000), // in milliseconds to days
  };
  userObj.elapsedTime = obj;
  return obj;
};

/** 
 * @function userGetCheckInTime
 * @param {user} userObj 
 * @brief Retrieves the user's check in time by performing the date arithmetic.
 *        Returns a new date object that holds the Date object itself, hour,
 *        minute, and meridiem.
*/
const userGetCheckInTime = function (userObj) {
  const d = new Date(userObj.checkInTime.dateObj);
  const obj = {
    dateObj: d /* In case we need to perform date 
                                   arithmetics, such as getElapsedTime() */,
    hour: (d.getHours() % 12  === 0) ? 12 : d.getHours() % 12,
    minute: d.getMinutes(),
    meridiem: d.getHours() / 12 > 1 ? "PM" : "AM",
  };
  
  userObj.checkInTime = obj;
};


/**
 * @function
 * @param {user} userObj
 * @brief Initializes the user check in time as an object and stores into its
 * checkOutTime property.
 */
const userSetCheckOutTime = function (userObj) {
  const d = new Date();
  const obj = {
    dateObj: d /* In case we need to perform date 
                                   arithmetics, such as getElapsedTime() */,
  };
  userObj.checkOutTime = obj;
};

/**
 * @function userSetCheckInTime
 * @param {user} userObj
 * @brief Initializes the user check in time as an object and stores into its
 * checkInTime property.
 */
const userSetCheckInTime = function (userObj) {
  const d = new Date();
  const obj = {
    dateObj: d /* In case we need to perform date 
                                   arithmetics, such as getElapsedTime() */,
  
  };
  userObj.checkInTime = obj;
};

/**
 * @function walker
 * @param {*} token 
 * @param {*} name 
 * @param {*} onDuty 
 * @param {*} onWalk 
 * @param {*} email 
 * @param {*} currentLocation 
 * @param {*} completedWalk 
 * @brief this walker object allows developers to create 
 *        multiple instances of a walker with these traits
 */

function walker( //function that returns an object
    token,
    name, 
    email,
    phoneNumber,
    onDuty, 
    onWalk, 
    //photo, 
    currentLocation,
    completedWalk
    ) {
      this.token = token;
      this.name = name;
      this.email = email;
      this.phoneNumber = phoneNumber;
      this.onDuty = onDuty;
      this.onWalk = onWalk;
      this.pairedWith = {
        walkerPairToken: '',
        userToken: '',
      }
      //this.photo = photo,
      this.checkInTime = {
        dateObj: new Date(),
        hour: 0,
        minute: 0,
        meridiem: "",
      };
      this.checkOutTime = {
        dateObj: new Date(),
        hour: 0,
        minute: 0,
      };
      this.elapsedTime = {
        dateObj: new Date(),
        hour: 0,
        minute: 0,
      };
      this.currentLocation = currentLocation;
      this.completedWalk = completedWalk;
    }

export { user, walker, userGetElapsedTime, userSetCheckInTime, userSetCheckOutTime, userGetCheckInTime };
