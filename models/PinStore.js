import { makeObservable, observable, action} from 'mobx';

class PinStore {
    type = null;
    display_name = null;
    latitude = null;
    longitude = null;
  //Constructor of our class
    constructor() {
    //function that is used to turn an object into an observable
    //an observable is a value or object that is wrapped in a way that allows it to be tracked for changes
      makeObservable(this, {
        type: observable,
        display_name: observable,
        latitude: observable,
        longitude: observable,
        setSelectedPin: action,
      });
    }
  // Change the data function
    setSelectedPin(type, display_name, latitude, longitude) {
      this.type = type;
      this.display_name = display_name;
      this.latitude = latitude;
      this.longitude = longitude;
    }
  }
// create an instance of the PinStore class
const pinStore = new PinStore();

export { PinStore, pinStore };