;
(function() {
  'use strict';

  angular.module('soft').directive('cashDrawer', CashDrawer);

  CashDrawer.$inject = [ 'Service.CashDrawers', '$timeout', '$rootScope', 'Modals' ];
  function CashDrawer(CashDrawers, $timeout, $rootScope, Modals) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        element.click(function() {
          if (attrs.ngDisabled != 'disabled') {
            CashDrawers.print();
          }

        });
      }
    };
  }
})();