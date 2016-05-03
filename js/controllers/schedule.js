;
(function() {
  'use strict';
  angular.module('soft').controller('ScheduleController', ScheduleController);

  ScheduleController.$inject = [ '$rootScope', 'Schedules', 'Schedule', '$timeout', '$state' ];
  function ScheduleController($rootScope, Schedules, Schedule, $timeout, $state) {
    var self = this;

    self.schedules = [];

    self.updateTableHeight = updateTableHeight;

    $rootScope.$on("loadpos_success", function(data) {
      console.log(data);
    });

    init();

    function init() {
      Schedules.getSchedules().then(function(result) {
        self.currentMonth = result[0];

        angular.forEach(result[1], function(value, key) {
          var schedule = new Schedule(value[0]);

          self.schedules.push(schedule);
        });
        
        updateTableHeight();
      },
      // fails
      function(err) {
        console.log(err);
      });
    }

    function updateTableHeight() {
      $timeout(function() {
        var height = $(window).height() - 235;
        $('.schedule-list').height(height);
        $('.schedule-list').find('tbody').height(height);
      }, 1000);
    }
  }
})();