;
(function() {
  'use strict';

  angular.module('soft')

  .filter('checkimg', function() {
    return function(value, defaultValue, pattern) {
      if (!angular.isDefined(pattern))
        pattern = /(.jpg|.png)$/i;

      if (pattern.test(value)) {
        return value;
      } else {
        return defaultValue;
      }
    };
  });
})();
