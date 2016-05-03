;
(function() {
  'use strict';

  angular.module('soft').directive('bootstrapNumber', BootstrapNumber);

  BootstrapNumber.$inject = [];
  function BootstrapNumber() {
    return {
      restrict : 'A',
      scope : {
        item : '=item'
      },
      link : function(scope, elem, attrs) {
        elem.val(attrs.value);
        elem.attr('max', attrs.max);
        elem.attr('min', attrs.min);

        elem.on('change', function(event) {
          scope.item.data.quantity = elem.val();
          scope.$apply();
        });

        elem.bootstrapNumber();

      }
    };
  }
})();