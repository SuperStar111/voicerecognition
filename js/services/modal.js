function logout($scope, $modalInstance, message, $modal, $cookieStore, $location) {

  if (!$scope.pass_out) {
    var msg = "Please Enter Password!";
    $modalInstance.dismiss('cancel');

    openModal($modal, msg, 'modal_error_msg.html', 'login_error_instance');

    modalInstance.result.then(function() {

    }, function() {

      openModal($modal, "msg", 'logout_msg.html', 'login_error_instance');

    });
    return;
  }

  $(".log_out").text('Loading...');

  verifyemplogout($scope, $modalInstance, message, $modal, $cookieStore, $location);
}

;
(function() {
  'use strict';

  angular.module('soft').service('Modals', Modals);

  Modals.$inject = [ '$modal', '$timeout' ];
  function Modals($modal, $timeout) {
    var Modals = function() {
      var self = this;

      self.openModal = openModal;
      self.alert = alert;
      self.confirm = confirm;
      self.prompt = prompt;
      self.verifyEmpId = verifyEmpId;
      self.accessTimeout = accessTimeout;

      /**
       * Alert popup
       */
      function alert(msg, callback, options) {
        var boxOptions = {
          templateUrl : 'templates/partials/alert.html',
          controller : [ '$scope', '$modalInstance', 'message', 'callback', 'options', '$sce', function($scope, $modalInstance, message, callback, options, $sce) {
            $scope.message = message;
            $scope.title = "Alert";

            if (options && options.html) {
              $scope.html = true;
              $scope.message = $sce.trustAsHtml($scope.message);
            }

            if (options && options.title) {
              $scope.title = options.title;
            }

            $scope.close = function() {
              $modalInstance.dismiss('cancel');

              if (typeof callback == "function") {
                callback();
              }
            };
          } ],
          resolve : {
            message : function() {
              return msg;
            },
            callback : function() {
              return callback;
            },
            options : function() {
              return options;
            }
          }
        };

        if (options && options.styles && options.styles.windowClass) {
          if (options.styles.windowClass != 'zIndex12000') {
            options.styles.windowClass += ' zIndex12000';
          }
        } else if (options && options.styles) {
          options.styles.windowClass = 'zIndex12000';
        } else if (options) {
          options.styles = {
            windowClass : 'zIndex12000'
          };
        } else {
          options = {
            styles : {
              windowClass : 'zIndex12000'
            }
          };
        }

        boxOptions.windowClass = options.styles.windowClass;

        $modal.open(boxOptions);
      }

      function confirm(msg, yesCallback, noCallback, options) {
        var defaultOptions = {
          skip : false,
          text : {
            yes : 'Yes',
            no : 'No'
          },
          keepPopupWhenYes : false
        };

        options = angular.extend(defaultOptions, options);

        if (options.skip) {
          if (typeof yesCallback == 'function') {
            yesCallback();
          }
        } else {
          $modal.open({
            templateUrl : 'templates/partials/confirm.html',
            controller : [ '$scope', '$modalInstance', 'message', 'yesCallback', 'noCallback', 'options',
              function($scope, $modalInstance, message, yesCallback, noCallback, options) {
                $scope.message = message;

                $scope.close = function() {
                  $modalInstance.dismiss('cancel');

                  if (typeof callback == "function") {
                    callback();
                  }
                };

                $scope.options = options;

                $scope.selectYes = function() {
                  if (typeof yesCallback == "function") {
                    if (options.keepPopupWhenYes) {
                      yesCallback(function() {
                        $scope.close();
                      });
                    } else {
                      $scope.close();
                      yesCallback();
                    }

                  } else {
                    $scope.close();
                  }
                };

                $scope.selectNo = function() {
                  if (typeof noCallback == "function") {
                    $scope.close();
                    noCallback();
                  } else {
                    $scope.close();
                  }
                };
              } ],
            resolve : {
              message : function() {
                return msg;
              },
              yesCallback : function() {
                return yesCallback;
              },
              noCallback : function() {
                return noCallback;
              },
              options : function() {
                return options;
              }
            }
          });
        }

      }

      function prompt(options, yesCallback, noCallback) {
        return $modal.open({
          templateUrl : 'templates/partials/prompt.html',
          controller : [ '$scope', '$modalInstance', 'options', 'yesCallback', 'noCallback', function($scope, $modalInstance, options, yesCallback, noCallback) {
            $scope.placeholder = options.placeholder;
            $scope.title = options.title;

            $scope.close = function() {
              $modalInstance.dismiss('cancel');
            };

            $scope.selectYes = function() {
              if (typeof yesCallback == "function") {
                yesCallback($scope.value);
                $modalInstance.close($scope.value);
              } else {
                $modalInstance.close($scope.value);
              }
            };

            $scope.selectNo = function() {
              if (typeof noCallback == "function") {
                $scope.close();
                noCallback();
              } else {
                $scope.close();
              }
            };
          } ],
          resolve : {
            options : function() {
              return options;
            },
            yesCallback : function() {
              return yesCallback;
            },
            noCallback : function() {
              return noCallback;
            }
          }
        });
      }

      function verifyEmpId(fnVerify, fnCancel, options) {
        var defaultOptions = {
          keepPopupWhenYes : false
        };

        options = angular.extend(defaultOptions, options);

        var modal_class = 'sp-modal manager-password';

        $modal.open({
          templateUrl : 'templates/partials/popup/manager-password-popup.html',
          controller : [ '$scope', '$modalInstance', 'fnVerify', 'fnCancel', function($scope, $modalInstance, fnVerify, fnCancel) {
            $scope.close = function() {
              $modalInstance.dismiss('cancel');
            };

            $scope.$watch('password', function() {
              $scope.pinValue = $scope.password;
            });

            $scope.verify = function($event) {
              $event.preventDefault();

              if (typeof fnVerify == "function") {
                if (options.keepPopupWhenYes) {
                  fnVerify($scope.password, function() {
                    $scope.close();
                  }, {
                    scope : $scope
                  });
                } else {
                  $scope.close();
                  fnVerify($scope.password);
                }
              } else {
                $scope.close();
              }
            };

            $modalInstance.result.then(function(result) {
              console.log(result);
            }, function(cancel) {
              if (cancel === 'backdrop click') {
                if (typeof fnCancel == 'function') {
                  fnCancel();
                }
              }
            });
          } ],
          resolve : {
            fnVerify : function() {
              return fnVerify;
            },
            fnCancel : function() {
              return fnCancel;
            }
          },
          windowClass : modal_class
        });
      }

      function accessTimeout(fnVerify, fnCancel, options) {
        var defaultOptions = {
          keepPopupWhenYes : false
        };

        options = angular.extend(defaultOptions, options);

        var modal_class = 'sp-modal manager-password';

        var timeoutIdle = $modal.open({
          templateUrl : 'templates/partials/popup/access-timeout.html',
          backdrop : 'static',
          controller : [ '$scope', '$modalInstance', 'fnVerify', 'fnCancel', '$rootScope', function($scope, $modalInstance, fnVerify, fnCancel, $rootScope) {
            $scope.close = function() {
              $modalInstance.dismiss('cancel');
            };

            $scope.$watch('password', function() {
              $scope.pinValue = $scope.password;
            });

            $scope.verify = function($event) {
              $event.preventDefault();

              if (typeof fnVerify == "function") {
                if (options.keepPopupWhenYes) {
                  fnVerify($scope.password, function() {
                    $scope.close();
                  }, {
                    scope : $scope
                  });
                } else {
                  $scope.close();
                  fnVerify($scope.password);
                }
              } else {
                $scope.close();
              }
            };

            $scope.logout = function() {
              $rootScope.$broadcast('Force Logout');
            };

            $modalInstance.result.then(function(result) {
              console.log(result);
            }, function(cancel) {
              if (cancel === 'backdrop click') {
                if (typeof fnCancel == 'function') {
                  fnCancel();
                }
              }
            });
          } ],
          resolve : {
            fnVerify : function() {
              return fnVerify;
            },
            fnCancel : function() {
              return fnCancel;
            }
          },
          windowClass : modal_class
        });

        return timeoutIdle;
      }

      function openModal(msg, template, ctrl) {
        var modalInstance;
        modalInstance = $modal.open({
          templateUrl : template,
          controller : ctrl,
          resolve : {
            message : function() {
              return msg;
            }
          }
        });

        modalInstance.opened.then(function() {
          $timeout(function() {
            try {
              document.getElementById("pass_out").focus();
            } catch (e) {

            }

          }, 100);

        });
      }

    };

    return new Modals();
  }
})();