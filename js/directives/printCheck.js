;
(function() {
  'use strict';

  angular.module('soft').directive('printCheck', PrintCheck);

  PrintCheck.$inject = [ '$modal', 'Checks', 'Modals', 'Check', '$q', '$state', '$rootScope' ];
  function PrintCheck($modal, Checks, Modals, Check, $q, $state, $rootScope) {
    return {
      restrict : 'A',
      scope : {
        order : '=order'
      },
      link : function(scope, element, attrs, controller) {
        element.click(function() {
          printCheck(scope.order);
        });

        function printCheck(order) {
          if (order.isTable()) {
            Checks.printCheck(order).then(function(result) {
              if ($state.current.name == 'Checks') {
                $rootScope.$broadcast('PRINT SUCCESSFUL', {
                  message : result['response_message']
                });
              } else {
                Modals.alert(result['response_message']);
              }

            }, function(err) {
              console.log(err);
            });
          } else if (order.isChair()) {
            var printSeatModel = $modal.open({
              templateUrl : 'templates/partials/select-seats.html',
              controller : function($scope, $modalInstance) {
                $scope.data = {
                  selectedSeatIds : []
                };

                $scope.close = function() {
                  $modalInstance.dismiss('cancel');
                };

                $scope.onSeatChange = function() {

                };

                $scope.print = function() {
                  $modalInstance.close($scope.data);
                };

                $scope.toggleAllSeats = function() {
                  $scope.allSeats = !$scope.allSeats;

                  if ($scope.allSeats) {
                    var seats = order.getChairs();

                    $scope.data = {
                      selectedSeatIds : []
                    };
                    angular.forEach(seats, function(seat, index) {
                      $scope.data.selectedSeatIds.push(index + 1);
                    });
                  } else {
                    $scope.data = {
                      selectedSeatIds : []
                    };
                  }
                };

              },
              resolve : {
                order : function() {
                  if (!Checks.currentCheck()) {
                    return loadCheck(order.getId());
                  } else {
                    return Checks.currentCheck().currentOrder();
                  }
                }
              }
            });

            printSeatModel.result.then(function(seatData) {
              if (!seatData.selectedSeatIds || seatData.selectedSeatIds.length == 0) {
                order.selectedSeatsIds = [];
                Checks.printCheck(order).then(function(result) {
                  if ($state.current.name == 'Checks') {
                    $rootScope.$broadcast('PRINT SUCCESSFUL', {
                      message : result['response_message']
                    });
                  } else {
                    Modals.alert(result['response_message']);
                  }
                }, function(err) {
                  console.log(err);
                });
              } else {
                serializePrintSeatJob(order, seatData.selectedSeatIds);
              }

            });
          } else {
            if (Checks.currentCheck()) {
              loadCheck(order.getId());
            }
            var printSplitModal = $modal.open({
              templateUrl : 'templates/partials/select-splits.html',
              controller : function($scope, $modalInstance) {
                $scope.data = {
                  selectedSplitIds : []
                };

                $scope.close = function() {
                  $modalInstance.dismiss('cancel');
                };

                $scope.onSplitChange = function() {

                };

                $scope.print = function() {
                  $modalInstance.close($scope.data);
                };

                $scope.toggleAllSplits = function() {
                  $scope.allSplits = !$scope.allSplits;

                  if ($scope.allSplits) {
                    var splits = order.getSplits();

                    $scope.data = {
                      selectedSplitIds : []
                    };
                    angular.forEach(splits, function(split, index) {
                      $scope.data.selectedSplitIds.push(index + 1);
                    });
                  } else {
                    $scope.data = {
                      selectedSplitIds : []
                    };
                  }
                };
              },
              resolve : {
                order : function() {
                  if (!Checks.currentCheck()) {
                    return loadCheck(order.getId());
                  }
                }
              }
            });

            printSplitModal.result.then(function(splitData) {
              if (!splitData.selectedSplitIds || splitData.selectedSplitIds.length == 0) {
                order.selectedSplitIds = [];
                Checks.printCheck(order).then(function(result) {
                  if ($state.current.name == 'Checks') {
                    $rootScope.$broadcast('PRINT SUCCESSFUL', {
                      message : result['response_message']
                    });
                  } else {
                    Modals.alert(result['response_message']);
                  }
                }, function(err) {
                  console.log(err);
                });
              } else {
                serializePrintSplitJob(order, splitData.selectedSplitIds);
              }
            });
          }

        }

        function loadCheck(checkID, callback) {
          var deferred = $q.defer();

          Checks.getCheckDetails(checkID).then(function(result) {
            var check = new Check(result['check details']);
            Checks.currentCheck(check);

            check.getOrder().then(function(order) {
              deferred.resolve(order);
            }, function(err) {

              console.log(err);
              deferred.reject(err);
            });
          });

          return deferred.promise;
        }

        function serializePrintSeatJob(order, arrSeatIds) {
          if (arrSeatIds.length > 0) {
            var id = arrSeatIds.splice(0, 1);

            order.selectedSeatsIds = [ id ];
            Checks.printCheck(order).then(function(result) {
              if (arrSeatIds.length == 0) {
                if ($state.current.name == 'Checks') {
                  $rootScope.$broadcast('PRINT SUCCESSFUL', {
                    message : result['response_message']
                  });
                } else {
                  Modals.alert(result['response_message']);
                }
              }

              serializePrintSeatJob(order, arrSeatIds);
            }, function(err) {
              console.log(err);
            });
          }

        }

        function serializePrintSplitJob(order, arrSplitIds) {
          if (arrSplitIds.length > 0) {
            var id = arrSplitIds.splice(0, 1);

            order.selectedSplitIds = [ id ];
            Checks.printCheck(order).then(function(result) {
              if (arrSplitIds.length == 0) {
                if ($state.current.name == 'Checks') {
                  $rootScope.$broadcast('PRINT SUCCESSFUL', {
                    message : result['response_message']
                  });
                } else {
                  Modals.alert(result['response_message']);
                }
              }

              serializePrintSplitJob(order, arrSplitIds);
            }, function(err) {
              console.log(err);
            });
          }

        }
      }
    };
  }
})();