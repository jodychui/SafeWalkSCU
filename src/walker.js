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
      this.checkInTime = new Date();
      this.currentLocation = currentLocation;
      this.completedWalk = completedWalk;
    }

export { walker };