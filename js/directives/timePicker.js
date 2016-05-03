;
(function() {
  'use strict';

  angular.module('soft').directive('timePicker', function($filter) {
    return {
      restrict : 'A',
      scope : {
        time : '=time'
      },
      templateUrl : 'templates/partials/time-picker.html',
      link : function(scope, element, attrs) {
        $(element).datetimepicker({
          format : 'hh:mm A'
        });

        scope.$watch('time', function() {
          // console.log(scope.time);
          element.val(scope.time);
        });

        // on date change update ng-model (date)
        element.on('dp.change', function(time) {
          var current = new Date();
          current.setDate(time.date._d.getDate());
          current.setMonth(time.date._d.getMonth());

          var val;
          if (time.date._d < current) {
            val = $filter('date')(current, 'hh:mm a');
          } else {
            val = $filter('date')(new Date(time.date._d), 'hh:mm a');
          }

          element.val(val);
          scope.$apply(function() {
            scope.time = val;
          });
        });

        element.on('dp.hide', function(time) {
          var current = new Date();
          current.setDate(time.date._d.getDate());
          current.setMonth(time.date._d.getMonth());

          var val;
          if (time.date._d < current) {
            val = $filter('date')(current, 'hh:mm a');
          } else {
            val = $filter('date')(new Date(time.date._d), 'hh:mm a');
          }

          element.val(val);
          scope.$apply(function() {
            scope.time = val;
          });

        });
      }
    };
  });
})();
