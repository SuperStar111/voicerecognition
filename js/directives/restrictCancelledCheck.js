;
(function() {
  'use strict';

  angular.module('soft').directive('restrictCancelledCheck', RestrictCancelledCheck);

  RestrictCancelledCheck.$inject = [ 'Modals' ];
  function RestrictCancelledCheck(Modals) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        var status = attrs.checkStatus;
        if (status == 'CANCELLED') {
          element.click(function(event) {
            event.preventDefault();
            event.stopPropagation();

            Modals.alert("A cancelled check can not be modified.");
          });
        }
      }
    };

  }
})();