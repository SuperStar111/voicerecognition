;
(function() {
  'use strict';

  angular.module('soft').directive('pocdatepicker', [ '$filter', function($filter) {
    return {
      restrict : 'AE',
      scope : {
        date : '='
      },
      templateUrl : 'templates/partials/datepicker.html',
      link : function(scope, element, attrs) {
        element.datetimepicker({
          format : 'MM/DD/YYYY',
          defaultDate : scope.date
        });

        // on date change update ng-model (date)
        element.on('dp.change', function(date) {
          scope.$apply(scope.date = new Date(date.date));
        });

        scope.$watch('date', function(newVal, oldVal) {
          if (newVal != oldVal) {
            var val = $filter('date')(scope.date, 'MM/dd/yyyy');
            element.find('input').val(val);
          }

        });
      }
    };

  } ]);
})();
