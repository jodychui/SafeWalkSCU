/* objects as 'classes' 
Admin should be able to store  */
/* class Admin {
    constructor (email, addWalker, removeWalker, 
        createPair, removePair, editPairs, 
        deleteRequest, assignWalker);
    }
    */

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
 * @returns elapsedTime object
 * @brief
 */
const userGetElapsedTime = function (userObj) {
  let difference = new Date(new Date() - userObj.checkInTime.dateObj);
  /* Okay, I have no idea why but by default hours is getting
     set to 16, even though it should be 0. */
  userObj.elapsedTime.hour = difference.getHours() - 16;
  userObj.elapsedTime.minute = difference.getMinutes();
};

const userSetCheckOutTime = function (userObj) {
  const d = new Date();
  const obj = {
    dateObj: d /* In case we need to perform date 
                                   arithmetics, such as getElapsedTime() */,
    hour: d.getHours() % 12,
    minute: d.getMinutes(),
    meridiem: d.getHours() / 12 > 1 ? "PM" : "AM",
  };
  userObj.checkOutTime = obj;
};

const userSetCheckInTime = function (userObj) {
  const d = new Date();
  const obj = {
    dateObj: d /* In case we need to perform date 
                                   arithmetics, such as getElapsedTime() */,
    hour: d.getHours() % 12,
    minute: d.getMinutes(),
    meridiem: d.getHours() / 12 > 1 ? "PM" : "AM",
  };
  console.log("the AM/PM", obj.meridiem);

  userObj.checkInTime = obj;
};

export { user, userGetElapsedTime, userSetCheckInTime, userSetCheckOutTime };
