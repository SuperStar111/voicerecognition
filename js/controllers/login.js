;
(function() {
  'use strict';

  angular.module('soft').controller('LoginController', LoginController);

  LoginController.$inject = [ '$scope', '$location', '$cookieStore', '$cookies', '$modal', '$http', 'Modals', 'Auth', '$state', 'Preferences', '$localStorage', '$rootScope',
    'OrderItemMenu', 'Service.Terminals', '$q', '$sce', 'Idle', '$sessionStorage' ];

  function LoginController($scope, $location, $cookieStore, $cookies, $modal, $http, Modals, Auth, $state, Preferences, $localStorage, $rootScope, OrderItemMenu, Terminals, $q,
    $sce, Idle, $sessionStorage) {
    var self = this;

    self.isProcessing = false;

    // definitions
    self.login = login;
    self.showTerminal = showTerminal;

    $scope.$on('PREFERENCES LOADED', function(event, data) {
      $rootScope.copyright = $sce.trustAsHtml(data.preferences.COPYRIGHT);
    });

    init();

    // implements
    /**
     * Load previous login information
     */
    function init() {
      try {
        self.location = $cookieStore.get("location");
        self.loginid = $cookieStore.get("loginid");
      } catch (e) {
        console.log(e);
      }
    }

    function login($event) {
      if ($event)
        $event.preventDefault();

      // Cache previous inputs
      $cookieStore.put("location", self.location);
      $cookieStore.put("loginid", self.loginid);

      if (!self.location || !self.loginid || !self.password) {
        var msg = "";

        if (!self.password) {
          msg = "Please Enter Password!";
        } else if (!self.loginid) {
          msg = "Please Enter Employee ID!";
        } else if (!self.location) {
          msg = "Please Enter Location ID!";
        }

        Modals.alert(msg);

      } else {
        self.isProcessing = true;

        Auth.verifyemp(self.location, self.loginid, self.password).then(
        // success
        function(result) {
          try {
            if (result[0] == "0") {
              OrderItemMenu.init();

              $cookieStore.put("isloged", "yes");
              // $cookieStore.put("password", $scope.password);

              Terminals.emp_id = result[1].emp_id;
              showTerminal($event).then(function() {
                $state.go('EmployeeLogin');
              });

              // Load pos information
              $sessionStorage.pos = null;
              $sessionStorage.isPosLoaded = false;

              Preferences.loadpos().then(function(result) {

              }, function(response) {
                console.log(response);
              });

            } else {
              Modals.alert(rs["Response Message"]);
            }

          } catch (e) {
            var er = result['Response Message'];
            Modals.alert(er);
          }

          self.isProcessing = false;
        },
        // fails
        function(response) {
          console.log(response);
        });
      }
    }

    function showTerminal($event) {
      var deferred = $q.defer();

      $event.preventDefault();

      if (!self.location || !self.loginid) {
        Modals.alert("Please enter Location and Employee ID");
        return;
      }

      var terminalID = $cookies['Terminal_id'];
      var terminalLocationID = $cookies['CRLocatoinID'];
      if (terminalID) {
        if (terminalLocationID && terminalLocationID == self.location) {
          Terminals.currentID(terminalID);

          // self.login();
          deferred.resolve();
          return deferred.promise;
        }
      }

      $modal.open({
        templateUrl : 'templates/partials/terminal.html',
        controller : [ '$scope', '$modalInstance', 'Service.Terminals', 'Modals', 'location', 'parentCtrl',
          function($scope, $modalInstance, Terminals, Modals, location, parentCtrl) {
            $scope.selectedTerminal = null;

            Terminals.getTerminals(location).then(function(result) {
              if (result.ResponseCode == 0) {
                $scope.terminals = [];
                Modals.alert(result.ResponseMessage);
                $scope.cancel();

                deferred.reject();
                return deferred.promise;

              } else {
                $scope.terminals = result;
              }
            });

            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };

            $scope.close = function(data) {
              $modalInstance.close(data);
            };

            $scope.submit = function() {
              if ($scope.selectedTerminal) {
                Terminals.updateTerminal(location, $scope.selectedTerminal, Terminals.emp_id).then(function(result) {
                  if (result.ResponseCode == 0) {
                    Modals.alert(result.ResponseMessage);
                  } else {
                    Cookies.set('Terminal_id', $scope.selectedTerminal.id, {
                      path : '/'
                    });
                    Cookies.set('CRLocatoinID', location, {
                      path : '/'
                    });
                    Cookies.set('menuview', $scope.selectedTerminal.menu_view, {
                      path : '/'
                    });

                    var timeout = 60;

                    if ($scope.selectedTerminal.timeout_period.toLowerCase() == 'never') {
                      timeout = 0;
                    } else {
                      var matchesTimeout = /([\d]+) (min)/;
                      var matches = $scope.selectedTerminal.timeout_period.match(matchesTimeout);

                      if (matches && matches.length > 0) {
                        if (matches[2] == 'min') {
                          timeout = matches[1] * 60;
                        }
                      }
                    }

                    Idle.setTimeout(timeout);
                    Cookies.set('timeoutPeriod', timeout, {
                      path : '/'
                    });

                    Terminals.currentID($scope.selectedTerminal.id);

                    $scope.close();
                    // parentCtrl.login();

                    deferred.resolve();
                    return deferred.promise;

                  }
                }, function(err) {
                  console.log(err);

                  deferred.reject();
                  return deferred.promise;
                });
              }
            };
          } ],
        resolve : {
          location : function() {
            return self.location;
          },
          parentCtrl : function() {
            return self;
          }
        }
      });

      return deferred.promise;
    }
  }
})();