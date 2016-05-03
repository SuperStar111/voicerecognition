;
(function() {
  'use strict';

  angular.module('soft').controller('EmployeeLoginController', EmployeeLoginController);

  EmployeeLoginController.$inject = [ '$scope', '$rootScope', '$cookieStore', 'Modals', 'Auth', '$state', 'Preferences', 'Users', '$window' ];

  function EmployeeLoginController($scope, $rootScope, $cookieStore, Modals, Auth, $state, Preferences, Users, $window) {
    var self = this;

    self.password = "";
    self.quickTogo = quickTogo;
    self._quickTogo = false;
    self.isProcessingLogin = false;

    self.emplogin = emplogin;
    self.isTogoTimeAvailable = isTogoTimeAvailable;

    $scope.$watch('$viewContentLoaded', function() {
      $scope.togo = false;

    });

    var onRootScopeReady = $rootScope.$on('ROOTSCOPE READY', function(event, data) {
      var location = $rootScope.location;

      if (location["togo"] == "yes") {
        self.togo = true;
      }

    });

    $scope.$on('$locationChangeSuccess', function(a, b, c, d, e) {
      if (self.queueReresh) {
        // $cookieStore.put('reloadhome', 'yes');
        $window.location.reload(true);
      }
    });

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if ([ '', 'Login' ].indexOf(fromState.name) == -1) {

        var $numPinpadTimeout = $cookieStore.get('numPinpadTimeout');

        if (!$numPinpadTimeout) {
          $numPinpadTimeout = 1;
        } else if ($numPinpadTimeout == 2) {
          $cookieStore.put('numPinpadTimeout', 0);

          self.queueReresh = true;
        } else {
          $numPinpadTimeout = parseInt($numPinpadTimeout) + 1;
        }

        console.log('Logout counter: ', $numPinpadTimeout);

        $cookieStore.put('numPinpadTimeout', $numPinpadTimeout);
      } else {
        console.log('Clear counter');
        $cookieStore.put('numPinpadTimeout', 0);
      }

    });

    $scope.$on('$destroy', function() {
      onRootScopeReady();
    });

    init();

    function init() {
      var location = $rootScope.location;

      $rootScope.clientTime = new Date();
      $cookieStore.put('clientTime', $rootScope.clientTime);

      if ($rootScope.lastUpdated) {
        Preferences.updateLoadpos().then(function(result) {
          if (result.ResponseCode == 1) {
            $rootScope.$broadcast("POS NOT UP TO DATE");
          }
        }, function() {

        });
      }
    }

    function emplogin($event) {
      $event.preventDefault();

      if (!self.password) {
        var msg = "Please Enter Password!";

        Modals.alert(msg);

        return;

      } else {
        self.isProcessingLogin = true;

        Auth.emplogin(self.password).then(
        // success
        function(result) {
          if (result["Response Code"] == 0 || result["Response Code"] == "a" || result["Response Code"] == "1") {
            Modals.alert(result["Response Message"], function() {
              self.isProcessingLogin = false;
            });
          } else {
            self.global_allow_receivable_login = false;
            if ((result[3].toLowerCase() == "yes")) {
              self.global_allow_receivable_login = true;
            }

            Users.loginData = result;

            self.global_allow_server_adjustment = result[8].allow_server_adjustment;

            $cookieStore.put("global_allow_server_adjustment", self.global_allow_server_adjustment);
            $cookieStore.put("global_allow_receivable_login", self.global_allow_receivable_login);
            $cookieStore.put("allow_server_discount", result[8].allow_server_discount);
            $cookieStore.put('access_pos_reports', result[8].access_pos_reports);
            $cookieStore.put('update_other_server', result[8].update_other_server);

            Users.allowAccessPosReports = result[8].access_pos_reports.toUpperCase() == 'YES';
            Users.allowUpdateOtherServer = result[8].update_other_server.toUpperCase() == 'YES';

            if (result[4] == "yes") {
              Users.store({
                islogedId : 'yes',
                password : self.password,
                fullname : result[11],
                username : result[1],
                empid : result[8]['id']
              });

              if ($rootScope.location.access_timeattendance.toLowerCase() != 'no') {
                $rootScope.isEmployeeOut = (result[10].toLowerCase() == 'out');
                $cookieStore.put("is_employee_out", result[10].toLowerCase());
              } else {
                $rootScope.isEmployeeOut = false;
                $cookieStore.put("is_employee_out", 'in');
              }

              Preferences.getActualLocalTime().then(function(result) {
                $cookieStore.put('actualLocalTime', result['current_datetime']);

                // TODO: Why?
                var tm = result["current_datetime"].split(" ")[0].split("-");
                var hs = result["current_datetime"].split(" ")[1].split(":");

                // if (parseInt(hs[0]) <= 4) {
                // tm[2] = parseInt(tm[2]) - 1;
                // }
                var dte = tm[1] + "/" + tm[2] + "/" + tm[0];

                $cookieStore.put('serverTime', result["current_datetime"]);
                $cookieStore.put('last_datetime', dte);

                $rootScope.$broadcast('Actual Local Time Loaded');

                if (!self._quickTogo) {
                  if ($rootScope.isEmployeeOut) {
                    $state.go('Employee');
                  } else {
                    $state.go('Home');
                  }

                } else {
                  // create new check
                  $rootScope.createTogoCheck = true;
                  $state.go('CreateCheck');
                }

              }, function(err) {
                console.log(err);
              });

            } else {

              Modals.alert("Access Denied", function() {
                self.isProcessingLogin = false;
              });
            }
          }
        },
        // fails
        function(response) {
          console.log(response);
        });
      }

    }

    function quickTogo($event) {
      self._quickTogo = true;
      self.emplogin($event);
    }

    function isTogoTimeAvailable() {
      return Preferences.isTogoTimeAvailable();
    }
  }
})();