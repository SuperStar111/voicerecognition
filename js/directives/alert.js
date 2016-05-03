;
(function() {
  'use strict';

  angular.module('soft').directive('alertMessage', AlertMessage);

  AlertMessage.$inject = [ 'Modals' ];
  function AlertMessage(Modals) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        var message = attrs.alertMessage;

        var condition = attrs.alertCondition;

        element.click(function() {
          if (!angular.isDefined(condition) || condition == 'true') {
            Modals.alert(message);
          }
        });

      }
    };
  }
})();