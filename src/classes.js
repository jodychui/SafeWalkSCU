/* objects as "classes" 
Admin should be able to store  */
/* class Admin {
    constructor (email, addWalker, removeWalker, 
        createPair, removePair, editPairs, 
        deleteRequest, assignWalker);
    
    
} */

/* student class */
class Student{
    constructor (token, name, email, phoneNumber, addressL1, addressL2 = '') {
        this.#token = token;
        this.#name = name;
        this.#email = email;
        this.#phoneNumber = phoneNumber;
        this.#addressL1 = addressL1;
        this.#addressL2 = addressL2;

        this.#checkInTime = {
            hour: 0,
            minute: 0,
        }
        this.#checkOutTime = {
            hour: 0,
            minute: 0,
        }

    }
    /* Getter functions for retrieving personal student data */
    getToken() { 
        return this.#token;
    }
    getName() {
        return this.#name;
    }
    getEmail() {
        return this.#email;
    }
    getPhoneNum() {
        return this.#phoneNumber;
    }
    getAddress() {
        return this.#addressL1 + ' ' + this.#addressL2;
    }
    getCheckInTime() {
        if (this.#checkInTime === undefined) {
            console.log('Please run setCheckInTime() first... ');
            return;
        }
        else{
            return this.#checkInTime;
                
        }
    }
    getCheckOutTime() {
        if (this.#checkOutTime === undefined) {
            console.log('Please run setCheckOutTime() first... ');
            return;
        }
        else{
            return this.#checkOutTime;
                
        }
    }
    

    /* Setter function for updating student data. Currently only takes in 
       hour and minutes, but we can add more stuff later.*/
    setCheckInTime() {
        const d = new Date;
        const obj = {
            hour: d.getHours(),
            minute: d.getMinutes(),
        }
        this.#checkInTime = obj;
    }
    setCheckOutTime() {
        const d = new Date;
        const obj = {
            hour: d.getHours(),
            minute: d.getMinutes(),
        }
        this.#checkOutTime = obj;
    }
    /* Private fields */
    #token;
    #name;
    #email;
    #phoneNumber;
    #addressL1;
    #addressL2;

    /* Object fields */
    #checkInTime;  /* has hour and minute, set to 0 by default*/
    #checkOutTime;  /* has hour and minute, set to 0 by default*/
};

export { Student }