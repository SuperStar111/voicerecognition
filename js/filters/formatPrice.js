;
(function() {
  'use strict';

  angular.module('soft').filter('formatPrice', [ '$filter', function($filter) {
    return function(number, size) {
      var hasBracket = false;

      // if there is open/close brace
      var pattern = /^\(([\d\.]+)\)$/;
      var match = number.match(pattern);

      if (match && match[1]) {
        hasBracket = true;
        number = match[1];
      }

      number = $filter('number')(number, size);

      if (hasBracket) {
        return "(" + number + ")";
      } else {
        return number;
      }
    };
  } ]);
})();