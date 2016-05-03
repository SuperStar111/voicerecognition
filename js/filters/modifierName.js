;
(function() {
  'use strict';

  angular.module('soft')

  .filter('modifierName', function() {
    return function(value, modifier) {
      if (modifier.type.toUpperCase() == 'SIZE') {
        value = value.replace("SIZE - ", "");
      }

      return value;
    };
  });
})();
