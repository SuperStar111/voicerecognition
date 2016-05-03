;
(function() {
  'use strict';

  angular.module('soft').directive('addedItemCheck', AddedItemCheck);

  AddedItemCheck.$inject = [ 'Checks', 'Modals', '$rootScope', '$timeout' ];
  function AddedItemCheck(Checks, Modals, $rootScope, $timeout) {
    return {
      restrict : 'A',
      priority : 100,
      link : {
        pre : function(scope, element, attrs) {

          element.on('click', function(event, data) {

            if (attrs.addedItemCheck && attrs.addedItemCheck === 'true') {
              if (!angular.isDefined(data)) {
                var addedItems = Checks.currentCheck().currentOrder().addedItems();

                if (addedItems.length > 0) {
                  event.preventDefault();
                  event.stopPropagation();

                  Modals.confirm("Do you want to send added items(s)?", function() {
                    $rootScope.$broadcast('Send Added Items', {
                      element : element
                    });
                  }, function() {
                    $rootScope.$broadcast('Remove Added Items', {
                      element : element
                    });

                    $timeout(function() {
                      element.trigger('click', {
                        'continue' : true
                      });
                    });

                  });
                }
              }
            }
          });

        }
      }
    };
  }

})();