import { makeObservable, observable, action } from 'mobx';

class Pin {
  constructor(type, display_name, latitude, longitude) {
    this.type = type;
    this.display_name = display_name;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

class PinsData {
  pins = [];

  constructor() {
    makeObservable(this, {
      pins: observable,
      setPins: action,
      addPin: action,
      removePin: action,
      clearPins: action,
    });
  }

  setPins(markers) {
    this.pins.replace(markers);
  }
  
  addPin(type, display_name, latitude, longitude) {
    const pin = new Pin(type, display_name, latitude, longitude);
    this.pins.push(pin);
  }

  removePin(pin) {
    const index = this.pins.indexOf(pin);
    if (index !== -1) {
      this.pins.splice(index, 1);
    }
  }

  clearPins() {
    this.pins = [];
  }

  getAllPins() {
    return this.pins;
  }
}

const pins = new PinsData();

export { PinsData, pins };
