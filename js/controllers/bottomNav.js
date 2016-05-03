;
(function() {
  'use strict';

  angular.module('soft').controller('BottomNavController', BottomNavController);

  BottomNavController.$inject = [ '$scope', 'EmployeeMessages', 'Checks', '$rootScope', '$state', 'Modals', 'Idle', 'Keepalive', 'Preferences', '$timeout', 'Title', '$modalStack',
    'ENV', '$cookies', '$window', '$cookieStore' ];
  function BottomNavController($scope, EmployeeMessages, Checks, $rootScope, $state, Modals, Idle, Keepalive, Preferences, $timeout, Title, $modalStack, ENV, $cookies, $window,
    $cookieStore) {
    var self = this;

    self.createNewCheck = createNewCheck;
    self.checkAccessTimeAttendance = checkAccessTimeAttendance;
    self.checkReportAccessibility = checkReportAccessibility;
    self.checkHomeAccessibility = checkHomeAccessibility;
    self.checkNewTabAccessibility = checkNewTabAccessibility;

    self.notification = {
      messageCount : null
    };
    $scope.$on('Messages Loaded', function(evt, data) {
      self.notification.messageCount = data.messageCount;
    });

    var cleanUpNewCheck = $rootScope.$on('NEW CHECK', function(event, data) {
      $rootScope.tmpTableId = data.tableId;
      console.log($rootScope.tmpTableId);
      createNewCheck();
    });

    var $idleKickTimeout = $cookies['timeoutPeriod'];

    // set timeout = 3 for testing
    // $idleKickTimeout = 3;

    if ($idleKickTimeout == 0) {
      Idle.unwatch();
    } else {
      if (!isNaN($idleKickTimeout)) {
        Idle.setTimeout($idleKickTimeout * 1);
      } else {
        Idle.setTimeout(60);
      }
    }

    $scope.$on('$destroy', function() {
      cleanUpNewCheck();

      Idle.unwatch();

      if ($scope.timedout) {
        $scope.timedout.close();
      }
    });

    function clearTimeIdle() {
      if ($scope.timedout) {
        $scope.timedout.close();
        $scope.timedout = null;
      }
    }

    $scope.$on('IdleStart', function() {
      // clearTimeIdle();
      console.log('Idle Started');
    });

    /* IDLE: Start */
    $scope.$on('IdleEnd', function() {
      // clearTimeIdle();
      // closeModals();
      console.log('Idle END');
    });
    $scope.$on('IdleTimeout', function() {
      Title.restore();

      var kickout = $timeout(function() {
        $state.go('EmployeeLogin');
      }, ($rootScope.idleKickTimeout * 1000));

      $modalStack.dismissAll('Timeout');

      $scope.timedout = Modals.accessTimeout(function(password, callback, data) {
        Preferences.getTimeoutLogin(password).then(function(result) {
          if (result['Response Code'] == 0) {
            Modals.alert(result['Response Message']);
          } else {
            clearTimeIdle();
            $timeout.cancel(kickout);

            callback();

            Idle.watch();
          }
        }, function(err) {
          console.log(err);
        });
      }, function() {
      }, {
        keepPopupWhenYes : true
      });
    });

    if (ENV != 'DEVELOPMENT') {
      Idle.watch();
      Idle.bindEvent();
    }

    /* IDLE: END */

    loadEmployeeMessages();

    function loadEmployeeMessages() {

      EmployeeMessages.getMessages().then(function(result) {
        self.notification.messageCount = result.messages.length;
      },
      // fails
      function(err) {
        console.log(err);
      });
    }

    function createNewCheck($event) {
      if ($rootScope.isEmployeeOut) {
        $event.preventDefault();
        Modals.alert("User must punch in before using POSPoint.");

        return;
      }

      if ($state.current.name == 'Checks') {
        $state.go('CreateCheck');
      } else {
        Checks.getCheckDetails('').then(function(result) {
          var orderID = result.order_id;

          $rootScope.newCheckID = orderID;
          $state.go('CheckDetail', {
            id : orderID
          }, {
            reload : false
          });

        }, function(err) {
          console.log(er);
        });
      }

    }

    function checkAccessTimeAttendance($event) {
      if ($rootScope.location.access_timeattendance.toLowerCase() == 'no') {
        $event.preventDefault();

        Modals.alert("This location is not configured to use TimePoint. Please contact a SoftPoint Representative to activate TimePoint today!");
      }
    }

    function checkReportAccessibility($event) {
      if ($rootScope.isEmployeeOut) {
        $event.preventDefault();

        Modals.alert("User must punch in before using POSPoint.");

      }
    }

    function checkHomeAccessibility($event) {
      if ($rootScope.isEmployeeOut) {
        $event.preventDefault();

        Modals.alert("User must punch in before using POSPoint.");

      }
    }

    function checkNewTabAccessibility($event) {
      if ($rootScope.isEmployeeOut) {
        $event.preventDefault();

        Modals.alert("User must punch in before using POSPoint.");

      }
    }

  }
})();