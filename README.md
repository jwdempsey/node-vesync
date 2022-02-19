
# node-vesync

An unofficial node library used to communicate with Vesync devices.

## Installation

    npm i node-vesync

## Usage
```javascript
// Create an VesyncClient object
const client = new VesyncClient();

// Login with the same email and password you would use in the Vesync mobile app:
await client.login("email", "password");

// Get a list of all registered devices:
const devices = await client.getDevices();

// Get device information about a device named Living Room:
const device = await client.getDeviceDetails(
  devices.find((d) => d.deviceName === "Living Room")
);

// Power on Living Room:
await client.turnOn(device);

// Power off Living Room:
await client.turnOff(device);

// Set brightness level of Living Room:
await client.setBrightness(device, 50);
```

## Credit

 - The fantastic python library [pyvesync](https://github.com/webdjoe/pyvesync) for how to structure API calls
 - The [etekcity-smartplug](https://github.com/arupex/etekcity-smartplug) library and [homebridge-vesync](https://github.com/AlakhaiVaynard/homebridge-vesync) plugin for ideas on how to handle additional devices
