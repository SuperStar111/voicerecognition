;
(function() {
  'use strict';

  angular.module('soft').directive('seatPayment', SeatPayment);

  SeatPayment.$inject = [ 'Checks' ];
  function SeatPayment(Checks) {
    return {
      restrict : 'E',
      require : '^ngModel',
      templateUrl : 'templates/partials/seat-payment.html',
      scope : {
        enableAll : '='
      },
      link : function(scope, element, attrs, ngModelController) {
        scope.type = attrs.type;
        scope.order = Checks.currentCheck().currentOrder();

        scope.toggleSeat = toggleSeat;
        scope.selectedSeats = {};
        scope.selectedSeatObjects = {};
        scope.selectedSeatIds = selectedSeatIds;

        scope.amount = 0;

        scope.$on('Order Reloaded', function(event, data) {
          scope.order = Checks.currentCheck().currentOrder();
        });

        ngModelController.$formatters.push(function(value) {
          scope.seatData = angular.copy(value);

          scope.selectedSeats = {};
          if (!scope.seatData.amount) {

            scope.amount = 0;
          }

          if (value.selectedSeatIds && value.selectedSeatIds.length > 0) {
            if (value.selectedSeatIds[0] == 99) {
              var allSeats = Checks.currentCheck().currentOrder().getChairs();

              // select all seats
              if (value.authorizeCCClicked) {
                angular.forEach(allSeats, function(seat, index) {
                  scope.selectedSeats[(index + 1) + ""] = true;

                  scope.amount += parseFloat(seat.amountDue);
                });
              }

            } else {
              var seats = Checks.currentCheck().currentOrder().getChairs();
              angular.forEach(seats, function(seat, key) {
                if (value.selectedSeatIds.indexOf(key + 1 + "") != -1) {
                  var amount = (seat.amountDue + "").replace(/[\(\)]+/gi, "");
                  toggleSeat(key + 1, amount, seat);
                }
              });

//              angular.forEach(value.selectedSeatIds, function(seat, index) {
//                scope.selectedSeats[seat] = true;
//              });

              var allSeats = seats;

              angular.forEach(allSeats, function(seat, index) {
                if (value.selectedSeatIds.indexOf(index + 1 + "") != -1) {
                  scope.amount += parseFloat(seat.amountDue);
                }
              });
            }

            scope.seatData.amount = parseFloat(scope.amount).toFixed(2);

            if (value.authorizeCCClicked) {
              scope.seatData.authorizeCCClicked = false;
              ngModelController.$setViewValue(scope.seatData);
            }

          }
        });

        function toggleSeat($n, $amount, seat) {
          if (scope.selectedSeats[$n]) {
            delete scope.selectedSeats[$n];
            scope.amount = (parseFloat(scope.amount) - parseFloat($amount)).toFixed(2);
          } else {
            if (scope.selectedSeats[99]) {
              delete scope.selectedSeats[99];
            }

            scope.selectedSeats[$n] = true;
            scope.selectedSeatObjects[$n] = seat;
            scope.amount = (parseFloat(scope.amount) + parseFloat($amount)).toFixed(2);
          }

          var seats = selectedSeatIds();

          scope.seatData = {
            selectedSeatIds : seats.ids,
            amounts : seats.amounts,
            amount : scope.amount,
            isSeatClick : true
          };

          if (seats.length == scope.order.getChairs().length || seats.length == 0) {
            scope.seatData.seats = [ 99 ];
            scope.seatData.isEmpty = true;
          }

          ngModelController.$setViewValue(scope.seatData);
        }

        function selectedSeatIds() {
          var arr = new Array();
          var amounts = new Array();
          angular.forEach(scope.selectedSeats, function(item, index) {
            arr.push(index);
            amounts.push(parseFloat(scope.selectedSeatObjects[index].amountDue));
          });

          return {
            ids : arr,
            amounts : amounts
          };
        }
      }
    };
  }
})();