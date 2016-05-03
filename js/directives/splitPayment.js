;
(function() {
  'use strict';

  angular.module('soft').directive('splitPayment', SplitPayment);

  SplitPayment.$inject = [ 'Checks' ];
  function SplitPayment(Checks) {
    return {
      restrict : 'E',
      require : '^ngModel',
      templateUrl : 'templates/partials/split-payment.html',
      scope : {
        enableAll : '='
      },
      link : function(scope, element, attrs, ngModelController) {
        scope.type = attrs.type;
        scope.order = Checks.currentCheck().currentOrder();

        scope.toggleSplit = toggleSplit;
        scope.selectedSplits = {};
        scope.selectedSplitObjects = {};
        scope.selectedSplitIds = selectedSplitIds;

        scope.amount = 0;

        scope.$on('Order Reloaded', function(event, data) {
          scope.order = Checks.currentCheck().currentOrder();
        });

        ngModelController.$formatters.push(function(value) {
          scope.splitData = angular.copy(value);

          scope.selectedSplits = {};
          if (!scope.splitData.amount) {

            scope.amount = 0;
          }

          if (value.selectedSplitIds && value.selectedSplitIds.length > 0) {
            if (value.selectedSplitIds[0] == 99) {
              var allSplits = Checks.currentCheck().currentOrder().getSplits();

              // select all splits
              if (value.authorizeCCClicked) {
                angular.forEach(allSplits, function(split, index) {
                  scope.selectedSplits[index + 1] = true;

                  scope.amount += parseFloat(split.amountDue);
                });
              }
            } else {
              var splits = Checks.currentCheck().currentOrder().getSplits();
              angular.forEach(splits, function(split, key) {
                if (value.selectedSplitIds.indexOf(key + 1 + "") != -1) {
                  var amount = (split.amountDue + "").replace(/[\(\)]+/gi, "");
                  toggleSplit(key + 1, amount, split);
                }
              });
              //              
              // angular.forEach(value.selectedSplitIds, function(split, index)
              // {
              // scope.selectedSplits[split] = true;
              // });

              var allSplits = splits;

              angular.forEach(allSplits, function(split, index) {
                if (value.selectedSplitIds.indexOf(index + 1 + "") != -1) {
                  scope.amount += parseFloat(split.amountDue);
                }
              });

            }

            scope.splitData.amount = parseFloat(scope.amount).toFixed(2);

            if (value.authorizeCCClicked) {
              scope.splitData.authorizeCCClicked = false;
              ngModelController.$setViewValue(scope.splitData);
            }

          }

        });

        function toggleSplit($n, $amount, split) {
          if (scope.selectedSplits[$n]) {
            delete scope.selectedSplits[$n];
            scope.amount = (parseFloat(scope.amount) - parseFloat($amount)).toFixed(2);
          } else {
            if (scope.selectedSplits[99]) {
              delete scope.selectedSplits[99];
            }

            scope.selectedSplits[$n] = true;
            scope.selectedSplitObjects[$n] = split;
            scope.amount = (parseFloat(scope.amount) + parseFloat($amount)).toFixed(2);
          }

          var splits = selectedSplitIds();

          scope.splitData = {
            selectedSplitIds : splits.ids,
            amounts : splits.amounts,
            amount : scope.amount,
            isSplitClick : true
          };

          if (splits.length == scope.order.getChairs().length || splits.length == 0) {
            scope.splitData.splits = [ 99 ];
            scope.splitData.isEmpty = true;
          }

          ngModelController.$setViewValue(scope.splitData);
        }

        function selectedSplitIds() {
          var arr = new Array();
          var amounts = new Array();

          angular.forEach(scope.selectedSplits, function(item, index) {
            arr.push(index);
            amounts.push(parseFloat(scope.selectedSplitObjects[index].amountDue));
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