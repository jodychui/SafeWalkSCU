/* objects as "classes" 
Admin should be able to store  */
/* class Admin {
    constructor (email, addWalker, removeWalker, 
        createPair, removePair, editPairs, 
        deleteRequest, assignWalker);
    }
    */

function student(
  token,
  name,
  email,
  phoneNumber,
  addressL1,
  addressL2 = " "
) {
  const obj = {
    token: token,
    name: name,
    email: email,
    phoneNumber: phoneNumber,
    addressL1: addressL1,
    addressL2: addressL2,
    checkInTime: {
      hour: 0,
      minute: 0,
    },
    setCheckInTime() {
      const d = new Date();
      const obj = {
        hour: d.getHours(),
        minute: d.getMinutes(),
      };
    },
    setCheckOutTime() {
      const d = new Date();
      const obj = {
        hour: d.getHours(),
        minute: d.getMinutes(),
      };
      this.checkOutTime = obj;
    },
    /* fields */
    token,
    name,
    email,
    phoneNumber,
    addressL1,
    addressL2,
    checkOutTime: {},
  };
  return obj;
}

export { student };
