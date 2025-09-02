// Cordova core stubs for PWA environment
(function() {
  'use strict';

  if (typeof window === 'undefined') return;

  // Only initialize if Cordova doesn't exist
  if (window.cordova) return;

  // Basic Cordova object structure
  window.cordova = {
    version: '12.0.0-pwa-stub',
    platformId: 'browser',
    define: function(name, factory) {
      console.log('Cordova stub: define', name);
    },
    require: function(name) {
      console.log('Cordova stub: require', name);
      return {};
    },
    plugins: {}
  };

  // Device ready event simulation
  setTimeout(function() {
    const event = new CustomEvent('deviceready', { bubbles: true });
    document.dispatchEvent(event);
    console.log('Cordova stub: deviceready event fired');
  }, 100);

  // Common Cordova callbacks
  window.cordova.exec = function(success, error, service, action, args) {
    console.log('Cordova stub: exec', service, action, args);
    if (error) {
      setTimeout(() => error('PWA environment - plugin not available'), 0);
    }
  };

})();