;
(function() {
  'use strict';

  angular.module('soft').directive('elapsedTime', ElapsedTime);

  ElapsedTime.$inject = [];
  function ElapsedTime() {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        var _interval;

        if (attrs.start) {
          var parts = attrs.start.split(":");
          var date = new Date();
          date.setHours(parseInt(parts[0]));
          date.setMinutes(parseInt(parts[1]));

          var second = parseInt(parts[2]);

          if (_interval) {
            clearInterval(_interval);
          }

          _interval = setInterval(function() {
            second += 1;
            date.setSeconds(second);
            second = date.getSeconds();

            var timeString = date.toTimeString().split(" ")[0];
            element.html(timeString);
          }, 1000);
        }
      },
      controller : Controller
    };
  }

  Controller.$inject = [ '$scope' ];
  function Controller($scope) {

  }
})();