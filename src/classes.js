/* objects as 'classes' 
Admin should be able to store  */
/* class Admin {
    constructor (email, addWalker, removeWalker, 
        createPair, removePair, editPairs, 
        deleteRequest, assignWalker);
    }
    */

function user(token, name, email, phoneNumber, srcAddressL1, srcAddressL2 = '', dstAddressL1, dstAddressL2 ='' ) {
  const obj = {
    setCheckInTime() {
      const d = new Date();
      const obj = {
        dateObj: d /* In case we need to perform date 
                                 arithmetics, such as getElapsedTime() */,
        hour: d.getHours(),
        minute: d.getMinutes(),
      };

      this.checkInTime = obj;
    },
    setCheckOutTime() {
      const d = new Date();
      const obj = {
        dateObj: d,
        hour: d.getHours(),
        minute: d.getMinutes(),
      };
      this.checkOutTime = obj;
    },
    /* Calculate the difference in time, returns the difference in minutes */
    getElapsedTime() {
      if (this.checkInTime === undefined || this.checkOutTime === undefined) {
        console.log('Please set the checkin/checkout time first');
        return;
      }
      const difference = Math.abs(
        this.checkInTime.dateObj - this.checkOutTime.dateObj
      );

      return difference / 60000;
    },
    /* fields */
    token,
    name,
    email,
    phoneNumber,
    addresses: {
      srcAddressL1: '',
      srcAddressL2: '',
      dstAddressL1: '',
      dstAddressL2: '',
    },
    checkInTime: {
      dateObj: new Date(),
      hour: 0,
      minute: 0,
    },
    checkOutTime: {
      dateObj: new Date(),
      hour: 0,
      minute: 0,
    },
  };
  return obj;
}

export { user };
