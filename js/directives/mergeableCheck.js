;
(function() {
  'use strict';

  angular.module('soft').directive('mergeableCheck', MergeableCheck);

  MergeableCheck.$inject = [];
  function MergeableCheck() {
    return {
      restrict : 'A',
      scope : {
        check : '=check'
      },
      controller : Controller
    };
  }

  Controller.$inject = [ '$scope', '$element', '$attrs', '$rootScope', 'Modals', 'Checks', 'Auth', '$cookieStore' ];
  function Controller($scope, $element, $attrs, $rootScope, Modals, Checks, Auth, $cookieStore) {
    // var self = this;
    $element.draggable({
      cursor : "move",
      containment : '#check-container',
      helper : "clone",
      axis : "y",
      start : function(event, ui) {
        $element.check = $scope.check;
        $rootScope.dragging = $element;
        $rootScope.dragging.helper = $(ui.helper);

        $(ui.helper.context).css('opacity', 0.2);
        $(ui.helper).width($(ui.helper.context).width());
      },
      revert : function(isValidDrop, a, b) {
        if (isValidDrop === false) {
          $rootScope.dragging.helper.hide();
          $rootScope.dragging.css('opacity', 1);
          return true;
        } else {
          return false;
        }
      },
      stop : function(event, ui) {

        event.stopPropagation();
        $rootScope.dragging = null;
      }
    });

    $element.droppable({
      drop : function(event, ui) {

        $rootScope.dropping = $rootScope.dragging;
        $element.check = $scope.check;

        if ([ 'closed', 'cancelled' ].indexOf($rootScope.dragging.check.order_Status.toLowerCase()) != -1
          || [ 'closed', 'cancelled' ].indexOf($scope.check.order_Status.toLowerCase()) != -1) {
          revert();
          Modals.alert("Unable to merge closed checks.", null, {
            styles : {
              windowClass : 'modal zIndex12000'
            }
          });
        } else {
          Modals.confirm("Would you like to merge Check #" + $rootScope.dropping.check.check_number + " into Check #" + $element.check.check_number + "?", function() {
            if ($rootScope.dropping.check.server_id != $scope.check.server_id) {
              Modals.verifyEmpId(function(password, closePopup, di) {
                Auth.verifyManager($cookieStore.get("location"), password, 'no', 'no', 'yes').then(
                // success)
                function(result) {
                  if (result["ResponseCode"] == 0) {
                    Modals.alert(result["ResponseMessage"], function() {
                      self.isProcessingLogin = false;
                    }, {
                      styles : {
                        windowClass : 'modal zIndex12000'
                      }
                    });

                    di.scope.pinValue = '';
                  } else if (result["ResponseCode"] == 1) {
                    closePopup();
                    doMergeChecks();
                  }
                },
                // fails
                function(response) {
                  revert();
                  console.log(response);
                });
              }, function() {
                revert();
              }, {
                keepPopupWhenYes : true
              });
            } else {
              // closePopup();
              doMergeChecks();
            }

          }, function() {
            revert();
          }, {
            skip : ([ 'closed', 'cancelled' ].indexOf($rootScope.dragging.check.order_Status.toLowerCase()) != -1 || [ 'closed', 'cancelled' ].indexOf($scope.check.order_Status
              .toLowerCase()) != -1),
            text : {
              yes : 'Submit',
              no : 'Cancel'
            }
          });
        }
      }
    });

    function doMergeChecks(callback) {
      Checks.mergeCheck($rootScope.dropping.check.id, $scope.check.id).then(function(result) {
        if (result.ResponseCode && result.ResponseCode == 1) {
          $rootScope.dropping.css('opacity', 1);
          $rootScope.dropping.hide();
          $rootScope.dropping = null;

          $scope.check = result.check_details;

          if (typeof callback == 'function') {
            callback();
          }

          Modals.alert(result.ResponseMessage, null, {
            styles : {
              windowClass : 'modal zIndex12000'
            }
          });
        } else {
          revert();
          Modals.alert(result.ResponseMessage, null, {
            styles : {
              windowClass : 'modal zIndex12000'
            }
          });
        }
      }, function(err) {
        console.log(err);
      });
    }

    function revert() {
      $rootScope.dropping.css('opacity', 1);
      $rootScope.dropping = null;
    }
  }
})();