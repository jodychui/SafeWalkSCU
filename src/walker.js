/**
 * @function walker
 * @param {String} token 
 * @param {String} name 
 * @param {Boolean} onDuty 
 * @param {Boolean} onWalk 
 * @param {String} email 
 * @param {String} currentLocation 
 * @param {Boolean} completedWalk 
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
      this.pairedWith = ''//not in parameter
      //this.photo = photo,
      this.currentLocation = currentLocation;
      this.completedWalk = completedWalk;
    }

export { walker };