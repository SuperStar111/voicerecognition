;
(function() {
  'use strict';

  angular.module('soft').service('Service.AppState', AppState);

  AppState.$inject = [];
  function AppState() {
    var AppState = function() {
      var self = this;

      // definitions
      self.setState = setState;
      self.isState = isState;
      self.state = {};

      // implements
      function setState(state) {
        var parts = state.split('.');

        var current = self.state;
        for (var i = 0; i < parts.length; i++) {
          current.name = parts[i];
          current.state = {};

          current = current.state;
        }
      }

      function isState(state) {
        var parts = state.split('.');

        var current = self.state;
        for (var i = 0; i < parts.length; i++) {
          if (current.name == parts[i]) {
            current = current.state;
            continue;
          } else {
            return false;
          }
        }
        return true;
      }

    };

    return new AppState();
  }
})();