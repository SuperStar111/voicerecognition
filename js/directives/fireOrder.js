;
(function() {
  'use strict';

  angular.module('soft').directive('fireOrder', FireOrder);

  FireOrder.$inject = [ '$modal', '$log', 'Modals' ];
  function FireOrder($modal, $log, Modals) {
    return {
      restrict : 'A',
      scope : {
        items : '=items',
        apply : '&apply'
      },
      link : {
        post : function(scope, element, attrs, controller) {
          var modal_class = 'sp-modal ';

          if (attrs.modalClass) {
            modal_class = modal_class + attrs.modalClass;
          }

          element.on('click', function(e) {

            scope.sortedItems = [ [], [], [] ];
            angular.forEach(scope.items, function(item, index) {
              if (item.originalData.fire_item_priority.toLowerCase() == 'first') {
                scope.sortedItems[0].push(item);
              } else if (item.originalData.fire_item_priority.toLowerCase() == 'second') {
                scope.sortedItems[1].push(item);
              } else {
                scope.sortedItems[2].push(item);
              }
            });

            if (scope.sortedItems[0].length == 0 && scope.sortedItems[1].length == 0 && scope.sortedItems[2].length == 0) {
              Modals.alert("Please select at least one item.");
              return;
            }

            if (!scope.items || scope.items.length == 0) {
              Modals.alert("Please select at least one item.");
              return;
            }
            var modalInstance = $modal.open({
              templateUrl : 'templates/partials/popup/fire-order-popup.html',
              controller : Controller,
              animation : false,
              windowClass : modal_class,
              resolve : {
                sortedItems : function() {
                  return scope.sortedItems;
                },
                selectedItems : function() {
                  return scope.items;
                },
                applyFn : function() {
                  return scope.apply;
                }
              }
            });

            modalInstance.result.then(function() {

            }, function() {
              $log.info('Modal dismissed at: ' + new Date());
            });
          });
        }
      }
    };
  }

  Controller.$inject = [ '$scope', '$timeout', '$modalInstance', '$rootScope', '$filter', 'Checks', 'Modals', 'sortedItems', 'selectedItems', 'applyFn' ];
  function Controller($scope, $timeout, $modalInstance, $rootScope, $filter, Checks, Modals, sortedItems, selectedItems, applyFn) {
    var self = this;

    self.cancel = cancel;
    self.receive = receive;

    self.apply = apply;

    init();
    function init() {

      self.sortedItems = sortedItems;

    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function receive(event, ui) {
      var position = $(event.target).attr('data-container');

      var itemID = $(ui.item).attr('ref');
      var item = findItemByID(itemID);

      item.tmpPosition = position;

    }

    function findItemByID(id) {
      for ( var idx in selectedItems) {
        if (selectedItems[idx].item_id == id) {
          return selectedItems[idx];
        }
      }
    }

    function apply() {
      angular.forEach(selectedItems, function(item, index) {
        if (item.tmpPosition) {
          item.originalData.fire_item_priority = item.tmpPosition;
        }
      });

      applyFn();

      $modalInstance.dismiss('cancel');
    }

    $scope.fireOrderCtrl = self;
  }
})();