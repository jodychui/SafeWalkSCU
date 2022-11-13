function walker( //function that returns an object
    onDuty, 
    onWalk, 
    name, 
    //photo, 
    email,
    currentLocation,
    completedWalk
    ) {
      this.onDuty = onDuty;
      this.onWalk = onWalk;
      this.name = name;
      //this.photo = photo,
      this.email = email;
      this.currentLocation = currentLocation;
      this.completedWalk = completedWalk;
    }