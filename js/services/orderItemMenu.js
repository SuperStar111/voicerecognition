;
(function() {
  'use strict';

  angular.module('soft').service('OrderItemMenu', OrderItemMenu);

  OrderItemMenu.$inject = [ '$rootScope', '$q', 'indexedDBService' ];
  function OrderItemMenu($rootScope, $q, indexedDBService) {
    var OrderItemMenu = function() {
      var self = this;

      // definitions
      self.parse = parse;
      self.getMenu = getMenu;
      self.getSubmenu = getSubmenu;
      self.syncFromServer = syncFromServer;

      self.init = init;

      init();
      function init() {
        self.data = null;
        self.orderitem_list = [];
        self.orderitem_types = [];
        self.orderitem_typedetail_content = [];

        self.cacheSubMenu = {};
        self.cacheSubMenuItems = {};
      }

      // implements
      function parse(data, datetime) {
        if (!data) {
          indexedDBService.open().then(function() {
            indexedDBService.getAll('menus').then(function(menus) {
              parse(menus, datetime);
            }, function(err) {
              console.log(err);
            });
          }, function(err) {
            console.log(err);
          });

          return;
        }
        if (self.orderitem_list && self.orderitem_list.length > 0) {
          return;
        }
        self.orderitem_list = [];
        self.orderitem_types = [];
        self.orderitem_typedetail_content = [];

        self.menus = data;
        var large_result;
        var secondkey;
        var thirdkey;
        var detail_result;

        var stime = datetime.split(" ");
        var serverDate = stime[0];
        var serverTime = stime[1];

        serverDate = serverDate.split('-');

        var now = new Date(serverDate[0], serverDate[1] - 1, serverDate[2]);

        var days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
        var day = days[now.getDay()];

        serverTime = formatTime(serverTime);
        for ( var key in data) {

          if (typeof data[key] != "string" && data[key]["available_dow"].indexOf(day) >= 0 && formatTime(data[key]["starttime"]) < serverTime
            && formatTime(data[key]["endtime"]) > serverTime) {
            self.orderitem_list.push({
              "orderitem_id" : data[key]["id"],
              "name" : data[key]["menu"],
              "dow" : data[key]["available_dow"]
            });

            large_result = data[key]["menugroups"];
            for (secondkey in large_result) {
              if (typeof large_result[secondkey] != "string") {
                var submenu = {
                  itemid : large_result[secondkey]["menu_group_id"],
                  name : secondkey,
                  orderitem_id : large_result[secondkey]["menu_id"],
                  itemimage : large_result[secondkey]["menu_group_image"],
                  items : []
                };

                detail_result = large_result[secondkey];

                for ( var thirdkey in detail_result) {

                  var discount = null;
                  if (typeof detail_result[thirdkey] != "string") {
                    if (data[key]["promotion"] == "Yes" && data[key]["promotion_dow"].indexOf(day) >= 0 && formatTime(data[key]["promotion_starttime"]) < serverTime
                      && formatTime(data[key]["promotion_endtime"]) > serverTime) {
                      if (data[key]["promotion_type"] == "Percentage") {
                        discount = detail_result[thirdkey]["menu_item_price"] - ((detail_result[thirdkey]["menu_item_price"] * data[key]["promotion_percentage"]) / 100);
                        discount = discount < 0 ? 0 : discount;

                      } else if (data[key]["promotion_type"] == "Fixed Amount") {
                        discount = detail_result[thirdkey]["menu_item_price"] - data[key]["promotion_amount"];
                        discount = discount < 0 ? 0 : discount;
                      }
                    } else {
                      discount = undefined;
                    }

                    if (discount == undefined && detail_result[thirdkey]["promotion_dow"].indexOf(day) >= 0
                      && formatTime(detail_result[thirdkey]["promotion_starttime"]) < serverTime && formatTime(detail_result[thirdkey]["promotion_endtime"]) > serverTime)
                      if (detail_result[thirdkey]["promotion_type"] == "Percentage") {
                        discount = detail_result[thirdkey]["menu_item_price"]
                          - ((detail_result[thirdkey]["menu_item_price"] * detail_result[thirdkey]["promotion_percentage"]) / 100);
                        discount = discount < 0 ? 0 : discount;
                      } else if (detail_result[thirdkey]["promotion_type"] == "Fixed Amount") {
                        discount = detail_result[thirdkey]["menu_item_price"] - detail_result[thirdkey]["promotion_amount"];
                        discount = discount < 0 ? 0 : discount;
                      }

                    var item = {
                      item_id : detail_result[thirdkey]['item_id'],
                      menugroupid : detail_result["menu_group_id"],
                      menugroupid_nextid : detail_result[thirdkey]["item_id"],
                      description : detail_result[thirdkey]["item_description"],
                      pluinfo : detail_result[thirdkey]["plu"],
                      price : detail_result[thirdkey]["menu_item_price"],
                      discount : discount,
                      custom : detail_result[thirdkey].custom,
                      delivery : detail_result[thirdkey].delivery,
                      togo : detail_result[thirdkey].togo,
                      modify : detail_result[thirdkey]["has_modifiers"]
                    };

                    if (detail_result[thirdkey]["item_image"] == "") {
                      item.imginfo = "images/NoMenuImage.png";
                      // item.modify =
                      // detail_result[thirdkey]["require_modifier_display"];
                    } else {
                      item.imginfo = schema + '://www.softpointdev.com/images/' + detail_result[thirdkey]["item_image"];
                    }

                    if (detail_result[thirdkey]["prep_shortname"] != "") {
                      item.name = detail_result[thirdkey]["prep_shortname"];
                    } else {
                      item.name = detail_result[thirdkey]["item_name"];
                    }

                    item.longName = detail_result[thirdkey]["item_name"];

                    item.originalData = detail_result[thirdkey];

                    submenu.items.push(item);

                    self.orderitem_typedetail_content.push(item);
                  }
                }

                self.orderitem_types.push(submenu);
              }
            }
          }
        }

        self.data = data;
      }

      function syncFromServer(entities) {
        var deferred = $q.defer();

        indexedDBService.cleartable('menus').then(function() {
          indexedDBService.createbatch('menus', entities).then(function() {

            deferred.resolve();

          }, function() {
            deferred.resolve();
          });

        }, function() {
          deferred.reject('Can\'t clear table menus');
        });

        return deferred.promise;
      }

      function getMenu() {
        return self.orderitem_list;
      }

      function getSubmenu(menuID) {
        if (self.cacheSubMenu[menuID]) {
          console.log("Load submenu for " + menuID + " from cache");
          return self.cacheSubMenu[menuID];
        } else {
          var orderdetailtmp = new Array();
          for ( var i in self.orderitem_types) {
            if (self.orderitem_types[i].orderitem_id == menuID) {
              orderdetailtmp.push(self.orderitem_types[i]);
            }
          }

          self.cacheSubMenu[menuID] = orderdetailtmp;
          return orderdetailtmp;

        }

      }

      // Utilities
      function formatTime(time) {
        time = time.split(':');
        var newTime = new Date();
        newTime.setHours(time[0]);
        newTime.setMinutes(time[1]);
        newTime.setSeconds(time[2]);
        return newTime;
      }

    };

    return new OrderItemMenu();
  }
})();