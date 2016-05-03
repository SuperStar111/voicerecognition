;
(function() {
  'use strict';

  angular.module('soft').directive('seat', Seat);

  Seat.$inject = [ '$modal', '$log', 'Modals' ];
  function Seat($modal, $log, Modals) {
    var covers = {
      table1 : 4,
      table2 : 4,
      table3 : 4,
      table4 : 2,
      table5 : 2,
      table6 : 6,
      table7 : 8,
      table8 : 3,
      table9 : 2,
      table10 : 4,
      table11 : 4,
      table12 : 5,
      table13 : 6,
      table14 : 1
    };

    return {
      restrict : 'A',
      scope : {
        items : '=items',
        orderedItems : '=orderedItems'
      },
      link : function(scope, elem, attrs, controller) {
        var modal_class = 'sp-modal ';
        if (attrs.modalClass) {
          modal_class = modal_class + attrs.modalClass;
        }

        function getAddedItemSeat(item) {
          return item.seats;
        }
        function getOrderedItemSeat(item) {
          return item.get('seat');
        }

        elem.on('click', function(e) {
          var isOrderedTab = false;
          var seats;
          var items = new Array();
          var fn;
          var maxDivide = 99;
          if (attrs.isOrderedTab && attrs.isOrderedTab == 'true') {
            isOrderedTab = true;

            items = scope.orderedItems;
            fn = getOrderedItemSeat;
          } else {
            isOrderedTab = false;
            
            var dividableItems = new Array();
            for (var i = 0; i < scope.items.length; i++) {
              if (scope.items[i].originalData.divide.toLowerCase() != 'no') {
                dividableItems.push(scope.items[i]);
                
                if (scope.items[i].originalData.max_divide < maxDivide) {
                  maxDivide = scope.items[i].originalData.max_divide;
                }
              }
            }
            
            if (scope.items.length > 0 && dividableItems.length == 0) {
              maxDivide = 1;
//              Modals.alert('This item(s) is not configured to allow divides.');
//              return;
            }
            
            items = scope.items;
            fn = getAddedItemSeat;
          }

          if (items.length == 0) {
            Modals.alert("Please select item(s) in order to indicate seat.");
          } else {
            if (angular.isDefined(items)) {
              var arrSeats = new Array();

              for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var seats = fn(item);

                if (angular.isDefined(seats)) {
                  if (seats == 99) {
                    seats = [];
                    for (var n = 1; n <= attrs.maxCovers; n++) {
                      seats.push(n);
                    }
                    // seats = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
                    // ].join(',');
                  }
                  arrSeats.push(seats);
                }
              }
              seats = arrSeats.join(',');
            } else {
              seats = '';
            }

            var modalInstance = $modal.open({
              templateUrl : attrs.templateUrl,
              controller : Controller,
              animation : false,
              windowClass : modal_class,
              resolve : {
                table : function() {
                  return attrs.table;
                },
                covers : function() {
                  return covers[attrs.table];
                },
                maxCovers : function() {
                  return attrs.maxCovers;
                },
                seats : function() {
                  return seats;
                },
                isOrderedTab : function() {
                  return isOrderedTab;
                },
                maxDivide : function() {
                  return maxDivide;
                }
              }
            });

            modalInstance.result.then(function(selectedItem) {
              scope.selected = selectedItem;
            }, function() {
              $log.info('Modal dismissed at: ' + new Date());
            });
          }

        });
      }
    };
  }

  Controller.$inject = [ '$scope', '$rootScope', '$modalInstance', 'Modals', 'table', 'covers', 'maxCovers', 'seats', 'isOrderedTab', 'maxDivide' ];
  function Controller($scope, $rootScope, $modalInstance, Modals, table, covers, maxCovers, seats, isOrderedTab, maxDivide) {
    var self = this;
    self.input = {};
    self.form = {};
    self.seats = [];
    self.extraSeats = [];

    self.table = table;
    self.covers = parseInt(covers);
    self.maxCovers = parseInt(maxCovers);

    self.selectedSeats = {};
    self.toggle = toggle;
    self.toggleAll = toggleAll;
    self.apply = apply;

    for (var i = 0; i < self.covers; i++) {
      self.seats.push(i + 1);
    }

    for (var i = 0; i < self.maxCovers - self.covers; i++) {
      self.extraSeats.push(i + self.covers + 1);
    }

    self.cancel = cancel;
    self.close = close;

    var onSeatsAccept = $rootScope.$on('SEATS ACCEPTED', function() {
      close();
    });

    $scope.$on('$destroy', function() {
      onSeatsAccept();
    });

    init();
    function init() {
      if (seats == '99') {
        self.all = false;
        toggleAll();
      } else {
        var selectedSeats = seats.split(',');

        var allTest = [];
        for (var i = 1; i <= maxCovers; i++) {
          allTest.push(i);
        }

        angular.forEach(selectedSeats, function(seat, index) {
          seat = parseInt(seat);

          if (!isNaN(seat))
            self.selectedSeats[seat] = true;

          var index = allTest.indexOf(seat);

          if (index != -1)
            allTest.splice(allTest.indexOf(seat), 1);
        });

        if (allTest.length == 0) {
          self.all = false;
          toggleAll();
        }
      }
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function close() {
      $modalInstance.close();
    }

    function totalSelectedSeats() {
      var n = 0;
      angular.forEach(self.selectedSeats, function(seat) {
        if (seat) {
          n++;
        }
      });
      
      return n;
    }
    
    function toggle(seat) {
      self.all = false;
      
      if (!self.selectedSeats[seat]) {
        if (totalSelectedSeats() < maxDivide) {
          self.selectedSeats[seat] = true;
        } else {
          Modals.alert('This item(s) allowed only ' + maxDivide + ' seat(s) to be added.');
        }
        
      } else {
        self.selectedSeats[seat] = false;

      }
    }

    function toggleAll() {
      self.all = !self.all;

      if (self.all) {
        for (var i = 1; i <= self.maxCovers; i++) {
          self.selectedSeats[i] = false;
        }
      }

    }

    function apply() {
      if (self.all) {
        $rootScope.$broadcast('SEAT SELECTED', {
          seats : [ 99 ],
          isOrderedTab : isOrderedTab
        });

        // self.cancel();

      } else {
        var arr = new Array();
        angular.forEach(self.selectedSeats, function(isEnable, seat) {
          if (isEnable) {
            arr.push(seat);
          }
        });

//        for (var i = 1; i <= self.maxCovers; i++) {
//          if (self.selectedSeats[i]) {
//            arr.push(i);
//          }
//        }

        if (arr.length == 0) {
          Modals.alert('Please select at least a seat.');
        } else {
          $rootScope.$broadcast('SEAT SELECTED', {
            seats : arr,
            isOrderedTab : isOrderedTab,
            covers: covers
          });

          // self.cancel();
        }

      }
    }

    $scope.ctrl = self;

  }
})();