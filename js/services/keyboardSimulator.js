;
(function() {
  'use strict';

  angular.module('soft').service('KeyboardSimulator', KeyboardSimulator);

  KeyboardSimulator.$inject = [];
  function KeyboardSimulator() {
    var KeyboardSimulator = function() {
      var self = this;

      self.simulateKeyPress = simulateKeyPress;

      function simulateKeyPress(character) {
        $.event.trigger({
          type : 'keypress.cardswipe-listener',
          which : character.charCodeAt(0),
          char : character
        });
      }
    };

    return new KeyboardSimulator();
  }
})();