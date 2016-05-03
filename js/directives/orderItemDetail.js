;
(function() {
  'use strict';

  angular.module('soft').directive('orderItemDetail', OrderItemDetail);

  OrderItemDetail.$inject = [];
  function OrderItemDetail() {
    return {
      restrict : 'A',
      scope : {
        check : '=check',
        parentScope : '=parentScope',
      },
      templateUrl : function(elem, attrs) {
        return attrs.templateUrl;
      },
      controller : Controller
    };
  }

  Controller.$inject = [ '$rootScope', '$scope', 'Orders', 'Checks', 'Order', '$state', 'Modals', 'OrderItemMenu', '$timeout', '$modal', 'soft.Utils', 'Service.CashDrawers',
    'Check', 'Service.Tables' ];
  function Controller($rootScope, $scope, Orders, Checks, Order, $state, Modals, OrderItemMenu, $timeout, $modal, Utils, CashDrawers, Check, Tables) {
    var self = this;

    self.showTab = showTab;
    self.isTab = isTab;
    self.currentTab = 'ordered'; // ordered, added

    self.orderedItems = $scope.parentScope.orderedItems;

    $scope.parentScope.selectedOrderedItems = [];
    self.selectedOrderedItems = $scope.parentScope.selectedOrderedItems;

    self.selectedAddedItems = [];
    self.addedItems = [];

    // definitions
    self.deleteAddedItems = deleteAddedItems;

    self.repeatItems = repeatItems;
    self.selectAddedItem = selectAddedItem;
    self.selectOrderedItem = selectOrderedItem;
    self.sendMessageToChef = sendMessageToChef;
    self.showModifier = showModifier;

    self.sendNewAddedItems = sendNewAddedItems;
    self.sendAndClose = sendAndClose;

    self.toggleAllAdded = toggleAllAdded;
    self.toggleAllOrdered = toggleAllOrdered;
    self.customModifierName = customModifierName;
    self.fireOrderItems = fireOrderItems;

    self.applyFireOrder = applyFireOrder;

    self.updateTypePrint = updateTypePrint;
    self.voidItems = voidItems;
    self.refund = refund;
    self.getSelectedOrderedItems = getSelectedOrderedItems;
    self.showCheckDetail = showCheckDetail;
    self.viewPayment = viewPayment;
    self.actualPrice = actualPrice;

    self.getOrder = getOrder;

    var onSendAddedItemListener = $rootScope.$on('Send Added Items', function(event, eventData) {
      var data = createUpdateCheckRequest();

      Checks.updateCheckItems(data).then(function(result) {

        if (result['ResponseCode'] == 1) {

          // Modals.alert(result['ResponseMessage'], function() {

          Checks.currentCheck().getOrder().then(function(order) {
            showTab('ordered');

            self.addedItems = Checks.currentCheck().currentOrder().addedItems();
            // clean up added items
            self.addedItems.splice(0, self.addedItems.length);

            $timeout(function() {
              eventData.element.trigger('click', {
                'continue' : true
              });
            });

            self.orderSuccessMessage = result['ResponseMessage'];
            self.flashSuccessMessage = true;

            $timeout(function() {
              self.flashSuccessMessage = false;
            }, 5000);

          }, function(err) {
            console.log(err);
          });

          // });

        } else if (result['ResponseCode'] == 0) {
          console.log('Error:', result);
          Modals.alert(result['ResponseMessage']);
        }
      }, function(err) {
        console.log(err);
      });
    });

    var onRemoveAddedItemListener = $rootScope.$on('Remove Added Items', function(event, eventData) {
      self.addedItems.splice(0, self.addedItems.length);
      showTab('ordered');
    });

    Tables.getById(Checks.currentCheck().get('order_details').location_table).then(function(table) {
      // preload data
      self.table = table;

      init();
    });

    function init() {
      showTab('ordered');

      self.checkStatus = Checks.currentCheck().orderStatus();

      self.order = Checks.currentCheck().currentOrder();
      if (self.order) {
        // $scope.parentScope.selectedOrderedItems = self.order.getItems();

        self.addedItems = self.order.addedItems();
      } else {
        var order = Checks.currentCheck().currentOrder();

        if (order) {
          self.order = order;
          self.addedItems = self.order.addedItems();
        } else {
          Checks.currentCheck().getOrder().then(function(order) {
            self.order = order;

            self.addedItems = self.order.addedItems();

            // $scope.parentScope.selectedOrderedItems = self.order.getItems();
          }, function(err) {
            console.log(err);
          });
        }

      }

      self.check = Checks.currentCheck();

    }

    var handlePrintFunction = $rootScope.$on('PRINT SUCCESSFUL', function(event, data) {
      self.orderSuccessMessage = data.message;

      self.flashSuccessMessage = true;

      $timeout(function() {
        self.flashSuccessMessage = false;
      }, 5000);
    });

    var handleSeatSelection = $rootScope.$on('SEAT SELECTED', function(event, data) {
      // Check number of seats according with covers
      var covers = self.order.getHeaders()['covers'];
      var currentSeats = self.order.currentSeats ? self.order.currentSeats : [];

      if (!data.isOrderedTab) {
        // create selected item ids
        var arr = new Array();
        angular.forEach(self.selectedAddedItems, function(item, index) {
          arr.push(item.item_id);
        });

        var newSeats = new Array();
        angular.forEach(self.order.addedItems(), function(item) {
          var itemSeats = item.seats;
          if (!angular.isDefined(itemSeats) || itemSeats == null) {
            itemSeats = 99;
          }

          // except selected items and item with seat = all
          if (arr.indexOf(item.item_id) == -1 && itemSeats != '' && itemSeats != 99 && itemSeats.toLowerCase() != 'all') {
            newSeats = Utils.mergeUnique(newSeats, itemSeats.split(','));
          }
        });

        // merge with selected seats
        newSeats = Utils.mergeUnique(newSeats, data.seats);
        // merge with existing seats
        newSeats = Utils.mergeUnique(newSeats, currentSeats);

        var validNumberOfCovers = covers;
        if (data.covers > covers) {
          validNumberOfCovers = data.covers;
        }
        if (newSeats.length > validNumberOfCovers) {
          Modals.alert("Seats for table have already been indicated based on number of cover. Please select a valid seat.");
          return;
        }

        $rootScope.$broadcast('SEATS ACCEPTED');

        angular.forEach(self.selectedAddedItems, function(item, index) {
          item.seats = data.seats.join(',');
          item.isChecked = false;
        });

        // uncheck selected items
        self.selectedAddedItems = [];
      } else {
        var itemsByType = self.order.getItemsByType();

        var arr = new Array();
        angular.forEach(self.selectedOrderedItems, function(item, index) {
          arr.push(item.getId());
        });

        var newSeats = new Array();
        angular.forEach(itemsByType['items'], function(item) {
          var itemSeats = item.getSeats() + "";

          if (arr.indexOf(item.getId()) == -1 && itemSeats != '' && itemSeats != 99 && itemSeats.toLowerCase() != 'all') {
            newSeats = Utils.mergeUnique(newSeats, itemSeats.split(','));
          }
        });
        newSeats = Utils.mergeUnique(newSeats, data.seats);
        if (newSeats.length > covers) {
          Modals.alert("Seats for table have already been indicated based on number of cover. Please select a valid seat.");
          return;
        }

        $rootScope.$broadcast('SEATS ACCEPTED');

        Orders.updateItemsSeat(self.order.getId(), arr.join(','), data.seats.join(',')).then(function(result) {
          // reload order
          Checks.currentCheck().getOrder().then(function(order) {
            self.order = order;

            self.addedItems = self.order.addedItems();

            angular.forEach(self.selectedOrderedItems, function(item, index) {
              item.isChecked = false;
            });

            // uncheck selected items
            self.selectedOrderedItems = [];

            // $scope.parentScope.selectedOrderedItems = self.order.getItems();
          }, function(err) {
            console.log(err);
          });

        }, function(err) {
          console.log(err);
        });
      }

    });

    function reinit() {
      Checks.currentCheck().getOrder().then(function(order) {
        self.order = order;

        self.addedItems = self.order.addedItems();

        // $scope.parentScope.selectedOrderedItems = self.order.getItems();

        init();
      }, function(err) {
        console.log(err);
      });

    }

    $scope.$watch(function() {
      return self.addedItems.length;
    }, function(newVal, oldVal) {
      if (newVal > oldVal) {
        showTab('added');
      }

      applyFireOrder();

      refreshSelectedItemList();
    });

    var cleanUpFunc = $rootScope.$on('Order Reloaded', function(event, data) {
      self.order = data.order;

      self.addedItems = Checks.currentCheck().currentOrder().addedItems();

      $scope.parentScope.selectedOrderedItems = [];
      self.selectedOrderedItems = $scope.parentScope.selectedOrderedItems;
    });

    $scope.$on('$destroy', function() {
      cleanUpFunc();
      handleSeatSelection();
      onSendAddedItemListener();
      onRemoveAddedItemListener();
      handlePrintFunction();

    });

    function showTab(tab) {
      self.currentTab = tab;
    }

    function isTab(tab) {
      return self.currentTab == tab;
    }

    function toggleAllAdded(isCheck) {
      self.checkAllAdded = isCheck;

      angular.forEach(self.addedItems, function(value, key) {
        value.isChecked = isCheck;

        angular.forEach(value.modifiers, function(modifier, mkey) {
          modifier.isChecked = isCheck;
        });

        angular.forEach(value.customModifiers, function(modifier, mkey) {
          modifier.isChecked = isCheck;
        });
      });

      if (isCheck) {
        self.selectedAddedItems = self.addedItems;
      } else {
        self.selectedAddedItems = [];
      }

    }

    function toggleAllOrdered(isCheck) {
      self.checkAllOrdered = isCheck;

      self.selectedOrderedItems = [];

      if (self.order.isViewByTable()) {
        var items = self.order.getItems();
        angular.forEach(items, function(item, itemKey) {
          item.isChecked = isCheck;

          if (isCheck)
            self.selectedOrderedItems.push(item);

          // check/uncheck for payments
          var payments = item.getPayments();
          angular.forEach(payments, function(payment, paymentKey) {
            payment.isChecked = isCheck;
          });

          // check/uncheck for modifiers
          var modifiers = item.getModifiers();
          angular.forEach(modifiers, function(modifier, modifierKey) {
            modifier.isChecked = isCheck;
          });
        });

        // check/uncheck for payments
        angular.forEach(self.order.payments, function(payment, paymentKey) {
          payment.isChecked = isCheck;
        });

      } else if (self.order.isViewByPercentage() || self.order.isViewByChair()) {
        var splitters = self.order.isViewByPercentage() ? self.order.getSplits() : self.order.getChairs();

        angular.forEach(splitters, function(splitter, key) {
          angular.forEach(splitter, function(item, itemKey) {
            item.isChecked = isCheck;

            if (isCheck)
              self.selectedOrderedItems.push(item);

            // check/uncheck for payments
            var payments = item.getPayments();
            angular.forEach(payments, function(payment, paymentKey) {
              payment.isChecked = isCheck;
            });

            // check/uncheck for modifiers
            var modifiers = item.getModifiers();
            angular.forEach(modifiers, function(modifier, modifierKey) {
              modifier.isChecked = isCheck;
            });
          });
        });

        angular.forEach(splitters.payments, function(payment, paymentKey) {
          payment.isChecked = isCheck;
        });

      }

      Checks.currentCheck().currentOrder().selectedOrderedItems = self.selectedOrderedItems;
      $rootScope.$broadcast('Selected Ordered Items Changed', {
        items : $scope.parentScope.selectedOrderedItems
      });

    }

    function sendAndClose() {
      self.sendNewAddedItems(true);
    }
    function sendNewAddedItems(doClose) {
      var data = createUpdateCheckRequest();

      Checks.updateCheckItems(data).then(function(result) {
        // TODO update check details .i.e. total

        // $scope.orderSent = true;
        // $scope.orderSuccessMessage = result.data['ResponseMessage'];
        if (result['ResponseCode'] == 1) {
          // clean up added items
          self.addedItems.splice(0, self.addedItems.length);

          var callback = function() {
            reinit();
            self.orderSuccessMessage = result['ResponseMessage'];
            self.flashSuccessMessage = true;

            $timeout(function() {
              self.flashSuccessMessage = false;
            }, 5000);
          };

          if (doClose === true) {
            $rootScope.isSendAndClose = true;
            callback = function() {
              $state.go('EmployeeLogin');
            };
          }

          callback();

        } else if (result['ResponseCode'] == 0) {
          console.log('Error:', result);
          Modals.alert(result['ResponseMessage']);
        }
      }, function(err) {
        console.log(err);
      });
    }

    // create update check request
    function createUpdateCheckRequest() {
      // prepare send request to update check detials
      var arrayItems = [];

      angular.forEach(self.addedItems, function(item, key) {
        var arrayItem = {
          menu_id : item.menu.orderitem_id,
          menu_group_id : item.menu.itemid,
          item_id : item.menugroupid_nextid,
          item_price : actualPrice(item),
          quantity_ordered : 1,
          seat : angular.isDefined(item.seats) ? item.seats : 99,
          message_to_chef : item.message_to_chef ? item.message_to_chef : "",
          // fire_order : $rootScope.location.pos_fire_order &&
          // $rootScope.location.pos_fire_order.toLowerCase() == 'yes' ?
          // item.originalData.fire_item_priority : 'First',
          fire_order : item.originalData.fire_item_priority,
          weight : "",
          modifiers : [],
          debug : ""
        };

        if (item.index) {
          arrayItem.drink_sold = item.index;
        }

        var prefs = {
          add : '',
          extra : 'XTRA',
          allergic : 'ALLERGIC',
          side : 'ONSD',
          less : 'LESS',
          only : 'ONLY',
          remove : 'NO',
          sub : 'SUB'
        };

        if (item.modifiers) {

          angular.forEach(item.modifiers, function(modifier, key) {
            // "add", "allergic", "side", "less", "only", "remove"

            var modifier_special = '';
            if (modifier.mod.isGlobal) {
              modifier_special = [ prefs[modifier.prep], modifier.mod.modifier ].join(' ');
            } else {
              if (modifier.prep != 'temp' && modifier.prep.toUpperCase() != 'ADD') {
                if (prefs[modifier.prep]) {
                  modifier_special = [ prefs[modifier.prep], modifier.mod.modifier ].join(' ');
                } else {
                  modifier_special = [ modifier.prep.toUpperCase(), modifier.mod.modifier ].join(' ');
                }

              }
            }

            arrayItem.modifiers.push({
              "modifier_id" : modifier.mod.id,
              "modifier_quantity" : modifier.qty,
              "modifier_price" : modifier.mod.price * 1.0 + modifier.extra_charge * 1.0,
              "modifier_seat" : 99,
              "modifier_special" : modifier_special,
              "modifier_quarter" : "",
              "modifier_default" : modifier.mod.isGlobal ? true : '',
              isCustomModifier : false
            });
          });
        }

        if (item.customModifiers) {
          angular.forEach(item.customModifiers, function(modifier, key) {
            var modifier_special = '';
            if (modifier.mod.isGlobal) {
              modifier_special = [ prefs[modifier.prep], modifier.mod.modifier ].join(' ');
            } else {
              if (modifier.prep != 'temp' && modifier.prep.toUpperCase() != 'ADD') {
                if (prefs[modifier.prep]) {
                  modifier_special = [ prefs[modifier.prep], modifier.mod.modifier ].join(' ');
                } else {
                  modifier_special = [ modifier.prep.toUpperCase(), modifier.mod.modifier ].join(' ');
                }

              }
            }

            arrayItem.modifiers.push({
              "modifier_id" : modifier.mod.id,
              "modifier_quantity" : modifier.qty,
              "modifier_price" : modifier.mod.price * 1.0 + modifier.extra_charge * 1.0,
              "modifier_seat" : 99,
              "modifier_special" : (modifier.mod.type.toUpperCase() == 'SIZE' || modifier.prep.toUpperCase() == 'ADD') ? '' : modifier_special,
              "modifier_quarter" : modifier.quarters,
              "modifier_default" : "",
              isCustomModifier : true
            });
          });
        }

        arrayItems.push(arrayItem);
      });

      return {
        order_id : Checks.currentCheck().getId(),
        arrayItems : arrayItems
      };
    }

    function sendMessageToChef(message) {
      angular.forEach(self.addedItems, function(item, key) {
        if (item.isChecked) {
          item.message_to_chef = message;
        }
      });
    }

    function repeatItems() {
      var newItems = [];

      if (isTab('added')) {
        angular.forEach(self.addedItems, function(item, key) {
          if (item.isChecked) {
            var newItem = angular.copy(item);

            newItem.isChecked = false;

            newItems.push(newItem);
          }
        });

        self.addedItems.push.apply(self.addedItems, newItems);
      } else {
        var newItemCount = 0;
        if (self.order.isViewByTable()) {
          var items = self.order.getItems();
          angular.forEach(items, function(item, itemKey) {
            if (item.isChecked) {
              var newItem = findItem(item.getName());

              if (newItem) {
                newItems.push(angular.copy(newItem));

                newItemCount++;
              }
            }
          });

        } else if (self.order.isViewByPercentage() || self.order.isViewByChair()) {
          var splitters = self.order.isViewByPercentage() ? self.order.getSplits() : self.order.getChairs();

          angular.forEach(splitters, function(splitter, key) {
            angular.forEach(splitter, function(item, itemKey) {
              if (item.isChecked) {
                var newItem = findItem(item.getName());

                if (newItem) {
                  newItems.push(angular.copy(newItem));

                  newItemCount++;
                }

              }
            });
          });
        }

        if (newItemCount == 0) {
          Modals.alert("No item has been repeated");
        } else {
          self.addedItems.push.apply(self.addedItems, newItems);
          showTab('added');
        }
      }

    }

    function findItem(name) {
      for (var i = 0; i < OrderItemMenu.orderitem_typedetail_content.length; i++) {
        if (OrderItemMenu.orderitem_typedetail_content[i].longName == name) {
          return OrderItemMenu.orderitem_typedetail_content[i];
        }
      }
    }

    function deleteAddedItems() {
      for (var i = 0; i < self.addedItems.length; i++) {
        if (self.addedItems[i].isChecked) {
          self.addedItems.splice(i, 1);
          i--;
        } else {
          if (self.addedItems[i].modifiers) {
            for (var j = 0; j < self.addedItems[i].modifiers.length; j++) {
              if (self.addedItems[i].modifiers[j].isChecked) {
                self.addedItems[i].modifiers.splice(j, 1);
                j--;
              }
            }
          }

          if (self.addedItems[i].customModifiers) {
            for (var j = 0; j < self.addedItems[i].customModifiers.length; j++) {
              if (self.addedItems[i].customModifiers[j].isChecked) {
                self.addedItems[i].customModifiers.splice(j, 1);
                j--;
              }
            }
          }

        }

      }

      if (self.addedItems.length == 0) {
        showTab('ordered');
      }
    }

    function selectAddedItem(item) {
      item.isChecked = !item.isChecked;

      refreshSelectedItemList();

    }

    function refreshSelectedItemList() {
      self.selectedAddedItems = [];

      for (var i = 0; i < self.addedItems.length; i++) {
        if (self.addedItems[i].isChecked) {
          self.selectedAddedItems.push(self.addedItems[i]);

        }
      }
    }

    function selectOrderedItem(item) {
      item.isChecked = !item.isChecked;

      self.selectedOrderedItems = [];

      var items = getSelectedOrderedItems();

      self.selectedOrderedItems = items['items'];

      Checks.currentCheck().currentOrder().selectedOrderedItems = self.selectedOrderedItems;
      $rootScope.$broadcast('Selected Ordered Items Changed', {
        items : self.selectedOrderedItems
      });
    }

    function showModifier($event) {
      var selectedItem;
      for (var i = 0; i < self.addedItems.length; i++) {
        if (self.addedItems[i].isChecked) {
          selectedItem = self.addedItems[i];
        }
      }

      if (selectedItem) {
        $rootScope.$broadcast('DO ADD MODIFIERS', {
          item : selectedItem,
          event : $event
        });
      }
    }

    function customModifierName(modifier) {
      if (modifier.quarters == 'H1') {
        return [ 'Half 1', modifier.mod.modifier ].join(' - ');
      } else if (modifier.quarters == 'H2') {
        return [ 'Half 2', modifier.mod.modifier ].join(' - ');
      } else if (modifier.quarters == 'Q1') {
        return [ 'Quarter 1', modifier.mod.modifier ].join(' - ');
      } else if (modifier.quarters == 'Q2') {
        return [ 'Quarter 2', modifier.mod.modifier ].join(' - ');
      } else if (modifier.quarters == 'Q3') {
        return [ 'Quarter 3', modifier.mod.modifier ].join(' - ');
      } else if (modifier.quarters == 'Q4') {
        return [ 'Quarter 4', modifier.mod.modifier ].join(' - ');
      } else if (modifier.quarters == '') {
        // return [ 'Full', modifier.mod.modifier ].join(' - ');
        return [ modifier.mod.modifier ].join(' - ');
      } else {
        return modifier.mod.modifier;
      }
    }

    function fireOrderItems() {
      return self.selectedAddedItems;
    }

    function applyFireOrder() {
      self.sortedItems = [ [], [], [] ];

      angular.forEach(self.addedItems, function(item, index) {
        if (item.originalData.fire_item_priority.toLowerCase() == 'first') {
          self.sortedItems[0].push(item);
        } else if (item.originalData.fire_item_priority.toLowerCase() == 'second') {
          self.sortedItems[1].push(item);
        } else {
          self.sortedItems[2].push(item);
        }

      });

    }

    function updateTypePrint(type) {
      var check = Checks.currentCheck();
      if (check.isClosed()) {
        Modals.alert("Details for a Closed check can not be modified.");
        return;
      }

      var checkedItems = getSelectedOrderedItems();
      if (checkedItems.payments.length > 0) {
        Modals.alert("This check is not allowed to update type print.");
      } else {
        if (type.toUpperCase() == 'EQUALLY') {
          $modal.open({
            templateUrl : 'templates/partials/select_cover.html',
            controller : function($scope, $modalInstance, maxCovers, splitFn) {
              $scope.options = [];
              $scope.selectedCovers = maxCovers;
              for (var i = 1; i <= maxCovers; i++) {
                $scope.options.push({
                  value : i,
                  text : "Split by " + i
                });
              }

              $scope.close = function() {
                $modalInstance.dismiss('cancel');

                if (typeof callback == "function") {
                  callback();
                }
              };

              $scope.split = function(selectedCovers) {
                if (typeof splitFn == 'function') {
                  splitFn(selectedCovers);
                  $scope.close();
                }
              };

            },
            resolve : {
              maxCovers : function() {
                return Checks.currentCheck().covers();
              },
              splitFn : function() {
                return function(covers) {
                  Checks.currentCheck().selectedCovers = covers;

                  Checks.updateTypePrint(Checks.currentCheck(), type).then(function(result) {
                    if (result.ResponseCode == 0) {
                      Modals.alert(result.ResponseMessage);
                    } else {
                      Checks.currentCheck().equallyCovers(covers);
                      Checks.currentCheck().data.order_details.type_print = type;

                      Checks.currentCheck().getOrder().then(function(order) {
                        self.order = Checks.currentCheck().currentOrder();

                        self.addedItems = self.order.addedItems();
                        // clean up added items
                        self.addedItems.splice(0, self.addedItems.length);

                      }, function(err) {
                        console.log(err);
                      });

                    }

                  }, function(err) {
                    console.log(err);
                  });
                };
              }
            }
          });
        } else {
          Checks.updateTypePrint(Checks.currentCheck(), type).then(function(result) {
            if (result.ResponseCode == 0) {
              Modals.alert(result.ResponseMessage);
            } else {
              Checks.currentCheck().data.order_details.type_print = type;

              Checks.currentCheck().getOrder().then(function(order) {
                self.order = Checks.currentCheck().currentOrder();

                self.addedItems = self.order.addedItems();
                // clean up added items
                self.addedItems.splice(0, self.addedItems.length);

              }, function(err) {
                console.log(err);
              });

            }

          }, function(err) {
            console.log(err);
          });
        }

      }

    }

    function voidItems() {
      var checkedItems = getSelectedOrderedItems();

      var arrItems = new Array();
      var arrModifiers = new Array();

      angular.forEach(checkedItems.items, function(item, idx) {
        arrItems.push(item.getId());
      });

      angular.forEach(checkedItems.modifiers, function(modifier, idx) {
        arrModifiers.push(modifier.getId());
      });

      if (arrItems.length == 0 && arrModifiers.length == 0) {
        Modals.alert("Please select a item(s) or modifier(s) to initiate void.");
        return;
      }

      var check = Checks.currentCheck();
      var confirmMessage = "Are you sure you wish to void this item(s)?";
      if (check.get('order_details').order_status.toUpperCase() == 'CLOSED') {
        confirmMessage = "Are you sure you wish to void this item(s)? Voiding item's on a closed check will reopen the check.";
      }

      var yesFn = function() {
        Checks.voidItems(check, arrItems, arrModifiers).then(function(result) {
          Modals.alert(result.ResponseMessage);

          if (result.ResponseCode == 1) {
            // reload order
            Checks.currentCheck().getOrder().then(function(order) {
              self.order = Checks.currentCheck().currentOrder();

              self.addedItems = self.order.addedItems();
              // clean up added items
              self.addedItems.splice(0, self.addedItems.length);

            }, function(err) {
              console.log(err);
            });
          }

        }, function(err) {
          console.log(err);
        });
      };

      var noFn = function() {

      };

      Modals.confirm(confirmMessage, yesFn, noFn);
    }

    function getSelectedOrderedItems() {
      var ret = {
        items : [],
        payments : [],
        modifiers : []
      };

      if (self.order.isViewByTable()) {
        var items = self.order.getItems();
        angular.forEach(items, function(item, itemKey) {
          if (item.isChecked) {
            ret.items.push(item);
          }

          angular.forEach(item.getPayments(), function(payment, idx) {
            if (payment.isChecked) {
              ret.payments.push(payment);
            }
          });

          angular.forEach(item.getModifiers(), function(modifier, idx) {
            if (modifier.isChecked) {
              ret.modifiers.push(modifier);
            }
          });
        });

        angular.forEach(self.order.payments, function(payment, itemKey) {
          if (payment.isChecked) {
            ret.payments.push(payment);
          }
        });

      } else if (self.order.isViewByPercentage() || self.order.isViewByChair()) {
        var splitters = self.order.isViewByPercentage() ? self.order.getSplits() : self.order.getChairs();

        angular.forEach(splitters, function(splitter, key) {
          angular.forEach(splitter, function(item, itemKey) {
            if (item.isChecked) {
              ret.items.push(item);
            }

            angular.forEach(item.getPayments(), function(payment, idx) {
              if (payment.isChecked) {
                ret.payments.push(payment);
              }
            });

            angular.forEach(item.getModifiers(), function(modifier, idx) {
              if (modifier.isChecked) {
                ret.modifiers.push(modifier);
              }
            });
          });

          angular.forEach(splitter.payments, function(payment, itemKey) {
            if (payment.isChecked) {
              ret.payments.push(payment);
            }
          });
        });
      }

      return ret;
    }

    function refund() {
      var checkedItems = getSelectedOrderedItems();

      var hasCashPayment = false;
      var arrPaymentIds = new Array();
      angular.forEach(checkedItems.payments, function(payment, idx) {
        if (payment.get('payment_type_name').toUpperCase() == 'CASH') {
          hasCashPayment = true;
        }

        arrPaymentIds.push(payment.getId());
      });

      if (arrPaymentIds.length == 0) {
        Modals.alert('Please select a payment(s) to initiate refund.');
        return;
      }

      if (arrPaymentIds.length > 1) {
        Modals.alert('You can only refund one payment at a time.');
        return;
      }

      var check = Checks.currentCheck();
      var confirmMessage = "Are you sure you wish to refund this payment(s)?";
      if (check.get('order_details').order_status.toUpperCase() == 'CLOSED') {
        confirmMessage = "Are you sure you wish to refund this payment(s)? Refunding payment's on a closed check will reopen the check.";
      }

      var yesFn = function() {
        Checks.refund(Checks.currentCheck(), arrPaymentIds).then(function(result) {
          if (result.ResponseCode == 0) {
            Modals.alert(result.ResponseMessage);
          } else {
            if (hasCashPayment) {
              CashDrawers.print();
            }
            // 
            Modals.alert(result.ResponseMessage);

            // reload current check
            Checks.getCheckDetails(Checks.currentCheck().getId()).then(function(result) {
              var currentCheck = new Check(result['check details']);
              Checks.currentCheck(currentCheck);

              // reload order
              currentCheck.getOrder().then(function(order) {
                self.order = currentCheck.currentOrder();

                self.addedItems = self.order.addedItems();
                // clean up added items
                self.addedItems.splice(0, self.addedItems.length);

              }, function(err) {
                console.log(err);
              });
            });

          }

        }, function(err) {
          console.log(err);
        });
      };

      var noFn = function() {

      };

      Modals.confirm(confirmMessage, yesFn, noFn);

    }

    function showCheckDetail($event) {
      $event.preventDefault();

      var element = $event.target;
      var showingDetail = !self.order.showingDetail;

      var backupAddedItems = new Array();
      angular.forEach(self.order.addedItems(), function(item) {
        backupAddedItems.push(angular.copy(item));
      });

      Checks.currentCheck().getOrder(showingDetail).then(function(order) {
        // backup added items

        self.order = Checks.currentCheck().currentOrder();
        self.order.addedItems(backupAddedItems);

        self.addedItems = self.order.addedItems();

        self.order.showingDetail = showingDetail;

        self.showTab('ordered');

        if (!showingDetail) {
          element.blur();
        }
      }, function(err) {
        console.log(err);
      });
    }

    function getOrder() {
      return Checks.currentCheck().currentOrder();
    }

    function viewPayment($event) {
      $event.stopPropagation();

      $state.go('CheckDetailWithTab', {
        'id' : self.check.getId(),
        'tab' : 'payment'
      });
    }

    function actualPrice(item) {
      return (angular.isDefined(item.discount) && item.discount !== '' && item.discount != null) ? item.discount : item.price;
    }

    $scope.ctrl = self;
  }
})();