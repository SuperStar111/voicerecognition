;
(function() {
  'use strict';

  angular.module('soft').directive('orderItemsView', OrderItemsView);

  OrderItemsView.$inject = [];
  function OrderItemsView() {
    return {
      restrict : 'A',
      templateUrl : function(elem, attrs) {
        return attrs.templateUrl;
      },
      scope : {
        parentScope : '=parentScope'
      },
      controller : Controller
    };
  }

  Controller.$inject = [ '$rootScope', '$scope', 'OrderItemMenu', '$timeout', '$attrs', 'Checks', 'Modals', '$modal', '$linq' ];
  function Controller($rootScope, $scope, OrderItemMenu, $timeout, $attrs, Checks, Modals, $modal, $linq) {
    var self = this;

    self.orderitem_active_types = [];
    self.menuItems = {};
    self.currentSubmenu = null;
    self.currentMenu = null;
    self.cacheMenu = {};

    // definitions
    self.selectSubMenu = selectSubMenu;
    self.isSubmenu = isSubmenu;

    self.isMenuSelected = isMenuSelected;
    self.selectMenu = selectMenu;

    self.toggleItemInfo = toggleItemInfo;
    self.addNewOrderItem = addNewOrderItem;

    self.searchMenuItems = searchMenuItems;
    self.checkType = checkType;

    self.showAppropriateModifierModal = showAppropriateModifierModal;

    init();

    function init() {
      $scope.check = Checks.currentCheck();
      self.orderItemMenu = OrderItemMenu.getMenu();

      // Select first menu by default
      self.selectMenu(self.orderItemMenu[0]);
    }

    $attrs.$observe('searchText', function() {
      if ($attrs.searchText) {
        if (self.searchPromise) {
          $timeout.cancel(self.searchPromise);
        }
        self.searchPromise = $timeout(function() {
          // do search
          searchMenuItems($attrs.searchText);
        }, 300);
      }
    });

    var unbindAddModifierEvent = $rootScope.$on('add-modifiers', function(event, data) {

      if (self.activeModifierItem.isModifying) {
        self.activeModifierItem.modifiers = angular.copy(data.choices);
        self.activeModifierItem.isModifying = false;

        if (data.message_to_chef)
          self.activeModifierItem.message_to_chef = data.message_to_chef;
      } else {
        var newModifierItem = angular.copy(self.activeModifierItem);
        newModifierItem.modifiers = data.choices;

        if (data.message_to_chef)
          newModifierItem.message_to_chef = data.message_to_chef;

        self.addNewOrderItem(newModifierItem);
      }
    });

    var unbindAddCustomModifierEvent = $rootScope.$on('add-custom-modifiers', function(event, data) {
      var listchoices = data.choices;
      var tmp = new Array();
      angular.forEach(listchoices, function(choice, key) {
        var modifier = choice.item;

        var quarters = [ choice.quarter ];
        for (var i = 0; i < quarters.length; i++) {
          var newModifier = angular.copy(modifier);
          newModifier.quarters = quarters[i];
          tmp.push(newModifier);
        }
      });

      if (self.activeModifierItem.isModifying) {
        self.activeModifierItem.customModifiers = tmp;
        self.activeModifierItem.isModifying = false;

        if (data.message_to_chef)
          self.activeModifierItem.message_to_chef = data.message_to_chef;
        
        self.activeModifierItem.custommodifier = data.custommodifier;
      } else {
        var newModifierItem = angular.copy(self.activeModifierItem);
        newModifierItem.customModifiers = tmp;

        if (data.message_to_chef)
          newModifierItem.message_to_chef = data.message_to_chef;
        
        newModifierItem.custommodifier = data.custommodifier;

        self.addNewOrderItem(newModifierItem);
      }
    });

    var unbindModifyAddedItem = $rootScope.$on('DO ADD MODIFIERS', function(event, data) {
      data.item.isModifying = true;
      self.showAppropriateModifierModal(data.item, data.event);
    });

    $scope.$on('$destroy', function() {
      unbindAddModifierEvent();
      unbindModifyAddedItem();
      unbindAddCustomModifierEvent();
    });

    function checkType() {
      if ($scope.check.isDelivery()) {
        return 'delivery';
      } else if ($scope.check.isTogo()) {
        return 'togo';
      }
    }
    function selectSubMenu(submenu, scrollTo) {
      var onAfterDigest = $scope.$$postDigest(function() {
        if (angular.isDefined(scrollTo)) {
          $('#section_order_items').mCustomScrollbar('scrollTo', scrollTo, {

          });
        } else {
          $('#section_order_items').mCustomScrollbar('scrollTo', '#listvieworderitem' + submenu.itemid);
        }

        if (typeof onAfterDigest == 'function')
          onAfterDigest();
      });

      if (self.currentSubmenu == submenu) {
        self.currentSubmenu = submenu;
        self.currentSubmenu.isShowing = !self.currentSubmenu.isShowing;
      } else {
        self.currentSubmenu = submenu;

        self.currentSubmenu.isShowing = true;
        // TODO: Need to write a directive instead

      }
      //
      // $('#section_order_items').mCustomScrollbar('update');

    }

    function isSubmenu(submenu) {
      return self.currentSubmenu && self.currentSubmenu.itemid == submenu.itemid;
    }

    function isMenuSelected(menu) {
      return self.currentMenu.orderitem_id == menu.orderitem_id;
    }

    function selectMenu(menu) {
      self.currentMenu = menu;

      if (menu && menu.orderitem_id) {
        if (self.cacheMenu[menu.orderitem_id]) {
          self.orderitem_active_types = self.cacheMenu[menu.orderitem_id].orderitem_active_types;
          self.hasGroupMenu = self.cacheMenu[menu.orderitem_id].hasGroupMenu;
          self.menuItems = self.cacheMenu[menu.orderitem_id].menuItems;
        } else {
          self.orderitem_active_types = OrderItemMenu.getSubmenu(menu.orderitem_id);

          self.hasGroupMenu = false;
          angular.forEach(self.orderitem_active_types, function(value, key) {
            var items = new Array();
            angular.forEach(value.items, function(item, index) {
              if ((!$scope.check.isTogo() && !$scope.check.isDelivery()) || ($scope.check.isTogo() && item.togo.toLowerCase() == 'yes')
                || ($scope.check.isDelivery() && item.delivery.toLowerCase() == 'yes'))
                items.push(item);
            });

            self.menuItems[value.itemid] = items;
            if (!self.hasGroupMenu && items.length > 0) {
              self.hasGroupMenu = true;
            }

            // 
            angular.forEach(self.menuItems[value.itemid], function(item, key) {
              item.menu = value;
            });
          });

          // cache
          self.cacheMenu[menu.orderitem_id] = {};
          self.cacheMenu[menu.orderitem_id].orderitem_active_types = self.orderitem_active_types;
          self.cacheMenu[menu.orderitem_id].hasGroupMenu = self.hasGroupMenu;
          self.cacheMenu[menu.orderitem_id].menuItems = self.menuItems;
        }

        // clear previous selection
        self.currentSubmenu = null;

        // Scroll to top
        $('#section_order_items').mCustomScrollbar('update');

        $timeout(function() {
          $('#section_order_items').mCustomScrollbar('scrollTo', 0);
        }, 600);
      }
    }

    function toggleItemInfo(item) {
      if (self.currentShowing && self.currentShowing != item && self.currentShowing.isSelected) {
        self.currentShowing.isSelected = false;
      }
      
      if (item.isSelected) {
        item.isSelected = false;
      } else {
        item.isSelected = true;
        self.currentShowing = item;
      }
      
    }

    function addNewOrderItem(item, $event) {
      var check = Checks.currentCheck();
      if (check.isClosed()) {
        Modals.alert("Details for a Closed check can not be modified.");
        return;
      }

      if ($event && item.originalData.require_modifier_display.toLowerCase() == 'yes') {
        self.showAppropriateModifierModal(item);
        return;
      }

      var newItem = angular.copy(item);

      if (!$rootScope.location.pos_fire_order || $rootScope.location.pos_fire_order.toLowerCase() != 'yes') {
        newItem.originalData.fire_item_priority = 'First';
      }

      var items = Checks.currentCheck().currentOrder().addedItems();

      if (newItem.originalData.glass_price.enable.toLowerCase() == 'yes') {
        var selectPriceModal = $modal.open({
          templateUrl : 'templates/partials/select-price.html',
          controller : function($scope, $modalInstance, item) {
            $scope.defaultPrice = {
              value : item.price
            };

            $scope.glassPrices = item.originalData.glass_price.prices;

            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };

            $scope.selectPrice = function(price, index) {
              price.index = index;
              $modalInstance.close(price);
            };
          },
          resolve : {
            item : function() {
              return newItem;
            }
          }
        });

        selectPriceModal.result.then(function(selectedGlassPrice) {
          newItem.price = selectedGlassPrice.value;
          newItem.index = selectedGlassPrice.index;

          angular.forEach(items, function(item, index) {
            item.isChecked = false;
          });

          newItem.isChecked = true;
          items.push(newItem);
        });
      } else {
        angular.forEach(items, function(item, index) {
          item.isChecked = false;
        });

        newItem.isChecked = true;
        items.push(newItem);
      }

    }

    function searchMenuItems(txtSearch) {
      var listviewSearchResult = {
        menu : []
      };

      listviewSearchResult = {
        menu : []
      };

      $linq.Enumerable().From(OrderItemMenu.orderitem_list).ForEach(function(menu) {
        $linq.Enumerable().From(OrderItemMenu.orderitem_types).Where(function(item) {
          return item.orderitem_id == menu.orderitem_id;
        }).ForEach(function(menugroup) {
          $linq.Enumerable().From(OrderItemMenu.orderitem_typedetail_content).Where(function(item) {
            return item.menugroupid == menugroup.itemid;
          }).ForEach(function(menuitem) {
            if (menuitem.pluinfo == txtSearch || menuitem.name.toLowerCase().indexOf(txtSearch.toLowerCase()) > -1) {
              if (!$linq.Enumerable().From(listviewSearchResult.menu).Any(function(item) {
                return item.orderitem_id == menu.orderitem_id;
              })) {
                listviewSearchResult.menu.push(angular.extend({}, menu));
              }
              var selectedMenu = $linq.Enumerable().From(listviewSearchResult.menu).First(function(item) {
                return item.orderitem_id == menu.orderitem_id;
              });

              selectedMenu.menugroups = selectedMenu.menugroups || [];
              var selectedMenuGroup = $linq.Enumerable().From(selectedMenu.menugroups).FirstOrDefault(null, function(item) {
                return item.itemid == menugroup.itemid;
              });

              if (!selectedMenuGroup) {
                selectedMenuGroup = angular.extend({}, menugroup);
                selectedMenu.menugroups.push(selectedMenuGroup);
              }
              selectedMenuGroup.menuitems = selectedMenuGroup.menuitems || [];

              var selectedMenuItem = $linq.Enumerable().From(selectedMenuGroup.menuitems).FirstOrDefault(null, function(item) {
                return item.menugroupid_nextid == menuitem.menugroupid_nextid;
              });

              if (!selectedMenuItem) {
                selectedMenuGroup.menuitems.push(angular.extend({}, menuitem));
              }
            }
          });
        });
      });

      if (listviewSearchResult.menu.length == 1 && listviewSearchResult.menu[0].menugroups.length == 1 && listviewSearchResult.menu[0].menugroups[0].menuitems.length == 1) {
        listviewSearchResult.menu[0].menugroups[0].menuitems[0].menu = listviewSearchResult.menu[0].menugroups[0];
        self.addNewOrderItem(listviewSearchResult.menu[0].menugroups[0].menuitems[0]);
      }
      self.searchResult = listviewSearchResult;

      // refilter
      for (var i = 0; i < self.searchResult.menu.length; i++) {
        var menu = self.searchResult.menu[i];

        for (var j = 0; j < menu.menugroups.length; j++) {
          var menuGroup = menu.menugroups[j];

          for (var n = 0; n < menuGroup.menuitems.length; n++) {
            var item = menuGroup.menuitems[n];
            item.menu = menuGroup;

            if (!((!$scope.check.isTogo() && !$scope.check.isDelivery()) || ($scope.check.isTogo() && item.togo.toLowerCase() == 'yes') || ($scope.check.isDelivery() && item.delivery
              .toLowerCase() == 'yes'))) {
              menuGroup.menuitems.splice(n, 1);
              n--;
            }
          }

          if (menuGroup.menuitems.length == 0) {
            menu.menugroups.splice(j, 1);
            j--;
          }
        }

        if (menu.menugroups.length == 0) {
          self.searchResult.menu.splice(i, 1);
          i--;
        }
      }

      console.log(self.searchResult);

    }

    function showAppropriateModifierModal(item, $event) {
      if ($event) {
        $event.stopPropagation();
      }

      self.activeModifierItem = item;

      var originalItem = item.originalData;

      if (typeof item.custom === 'string' && item.custom.match(/yes/i)) {
        $rootScope.showCustomModifierModal(originalItem, item, $event);
      } else {
        $rootScope.showModifierModal(originalItem, item, $event);
      }
    }

    $scope.ctrl = self;
  }
})();