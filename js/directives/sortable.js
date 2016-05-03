;
(function() {
  'use strict';
  angular.module('soft').directive('sortable', Sortable);

  Sortable.$inject = [];
  function Sortable() {
    return {
      restrict : 'A',
      scope : {
        receive : '&onReceive'
      },
      link : {
        post : function(scope, element, attrs, controller) {
          var options = {};
          options.axis = attrs.axis;

          if (typeof scope.receive == 'function') {
            options.receive = function(event, ui) {
              scope.receive({
                event : event,
                ui : ui
              });
            };
          }

          var sortableOptions = {
            connectWith : attrs.connectWith
          };

          for ( var prop in options) {
            if (options[prop]) {
              sortableOptions[prop] = options[prop];
            }
          }

          element.sortable(sortableOptions).disableSelection();
        }
      }
    };
  }
})();