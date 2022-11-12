function walker( //function that returns an object
    onDuty, 
    onWalk, 
    name, 
    photo, 
    email,
    completedWalk
    ) {
      const obj = {
        onDuty: onDuty,
        onWalk: onWalk,
        name: name,
        photo,
        email,
        completedWalk
      }
    return obj;
    }