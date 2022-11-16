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
  // console.log(userObj);
  // console.log(userObj.checkInTime.dateObj.getMilliseconds());
  let difference = new Date(Math.abs(new Date() - userObj.checkInTime.dateObj));
  userObj.elapsedTime.hour = difference.getHours();
  userObj.elapsedTime.minute = difference.getMinutes();
  return userObj;
};

const userSetCheckOutTime = function (userObj) {
  const d = new Date();
  const obj = {
    dateObj: d,
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
  userObj.checkOutTime = obj;
  return userObj;
};

const userSetCheckInTime = function (userObj) {
  const d = new Date();
  const obj = {
    dateObj: d /* In case we need to perform date 
                                   arithmetics, such as getElapsedTime() */,
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
  userObj.checkInTime = obj;
  return userObj;
};

export { user, userGetElapsedTime, userSetCheckInTime, userSetCheckOutTime };
