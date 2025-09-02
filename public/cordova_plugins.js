// Cordova plugins configuration stub
cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-camera.Camera",
      "file": "plugins/cordova-plugin-camera/www/CameraConstants.js",
      "pluginId": "cordova-plugin-camera"
    },
    {
      "id": "cordova-plugin-camera.camera",
      "file": "plugins/cordova-plugin-camera/www/Camera.js",
      "pluginId": "cordova-plugin-camera",
      "clobbers": [
        "navigator.camera"
      ]
    },
    {
      "id": "cordova-plugin-device.device",
      "file": "plugins/cordova-plugin-device/www/device.js",
      "pluginId": "cordova-plugin-device",
      "clobbers": [
        "device"
      ]
    },
    {
      "id": "cordova-plugin-file.File",
      "file": "plugins/cordova-plugin-file/www/File.js",
      "pluginId": "cordova-plugin-file"
    },
    {
      "id": "cordova-plugin-media-album.album",
      "file": "plugins/cordova-plugin-media-album/www/album.js",
      "pluginId": "cordova-plugin-media-album",
      "clobbers": [
        "navigator.album"
      ]
    }
  ];
});

cordova.define('cordova/plugin_metadata', function(require, exports, module) {
  module.exports = {
    "cordova-plugin-camera": "7.0.0",
    "cordova-plugin-device": "2.1.0",
    "cordova-plugin-file": "8.0.0", 
    "cordova-plugin-media-album": "1.0.0"
  };
});