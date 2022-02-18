const axios = require("axios");
const crypto = require("crypto");

module.exports = class VesyncClient {
  constructor() {
    this.client = null;
    this.token = 0;
    this.accountId = 0;
    this.traceId = this.getRandom();
    this.setClient();
  }

  getRandom(max = 1000000000) {
    return Math.floor(Math.random() * max);
  }

  setClient() {
    const config = {
      baseURL: "https://smartapi.vesync.com",
      responseType: "json",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "VeSync/VeSync 3.0.51(F5321;Android 8.0.0)",
        tz: "America/New_York",
      },
    };
    const data = {
      timeZone: "America/New_York",
      acceptLanguage: "en",
      appVersion: "2.5.1",
      phoneBrand: "SM N9005",
      phoneOS: "Android",
      userType: "1",
      traceId: this.traceId,
    };
    this.client = axios.create(config);
    this.client.interceptors.request.use((config) => {
      if (config.data) {
        config.data = { ...config.data, ...data };
      }

      if (this.token !== 0) {
        config.headers.tk = this.token;
        config.data.token = this.token;
      }

      if (this.accountId !== 0) {
        config.headers.accountId = this.accountId;
        config.data.accountID = this.accountId;
      }
      return config;
    });
  }

  login(email, password) {
    const passwordHash = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");

    return this.client
      .post("/cloud/v1/user/login", {
        email: email,
        password: passwordHash,
        method: "login",
      })
      .then((response) => {
        if (response && response.data && response.data.result) {
          this.token = response.data.result.token;
          this.accountId = response.data.result.accountID;
        }
      })
      .catch(() => {
        console.error(
          "Login failed, please check your email and password and try again"
        );
      });
  }

  getDevices() {
    return this.client
      .post("/cloud/v1/deviceManaged/devices", {
        pageNo: 1,
        pageSize: 1000,
        method: "devices",
      })
      .then((response) => {
        if (response && response.data && response.data.result) {
          return response.data.result.list;
        }

        return;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  toggle(device, power) {
    power = power === true ? "on" : "off";
    let uri = "/10a/v1/device/devicestatus";
    if (device.deviceType === "wifi-switch-1.3") {
      uri = `/v1/wifi-switch-1.3/${device.cid}${device.subDeviceNo}/status/${power}`;
    } else if (device.deviceType === "ESO15-TB") {
      uri = "/outdoorsocket15a/v1/device/devicestatus";
    } else if (device.deviceType === "ESW15-USA") {
      uri = "/15a/v1/device/devicestatus";
    } else if (device.deviceType === "LV-PUR131S") {
      uri = "/131airPurifier/v1/device/deviceStatus";
    } else if (device.deviceType === "ESWD16") {
      uri = "/dimmer/v1/device/devicestatus";
    } else if (
      device.deviceType === "ESWL01" ||
      device.deviceType === "ESWL03"
    ) {
      uri = "/inwallswitch/v1/device/devicestatus";
    } else if (
      device.deviceType === "ESL100" ||
      device.deviceType === "ESL100CW"
    ) {
      uri = "/SmartBulb/v1/device/devicestatus";
    }

    return this.client
      .put(uri, {
        status: power,
        uuid: device.uuid,
        switchNo: device.subDeviceNo,
      })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  setBrightness(device, brightness) {
    if (device.deviceType === "ESL100" || device.deviceType === "ESL100CW") {
      return this.client
        .put("/SmartBulb/v1/device/updateBrightness", {
          status: "on",
          uuid: device.uuid,
          brightNess: brightness.toString(),
        })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.error(error);
        });
    }
    return new Error("Setting brightness levels not supported by this device");
  }

  turnOn(device) {
    return this.toggle(device, true);
  }

  turnOff(device) {
    return this.toggle(device, false);
  }
};
