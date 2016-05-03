;
(function() {
  'use strict';

  angular.module('soft').directive('restrictClosedCheck', RestrictClosedCheck);

  RestrictClosedCheck.$inject = [ 'Modals' ];
  function RestrictClosedCheck(Modals) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {

        attrs.$observe('checkStatus', function() {
          var status = attrs.checkStatus;
          if (status == 'CLOSED') {
            element.click(function(event) {
              event.preventDefault();
              event.stopPropagation();

              Modals.alert("Details for a Closed check can not be modified.");
            });

            // disable all input
            element.find('input, select, textarea, button').attr('disabled', 'disabled');
          }
        });

      }
    };

  }
})();