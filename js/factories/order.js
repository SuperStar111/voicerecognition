(function() {
  'use strict';

  angular.module('soft').factory('Order', Order);

  Order.$inject = [ 'BaseObject', 'OrderItem', 'Payment', 'soft.Utils', 'Service.Payments' ];
  function Order(BaseObject, OrderItem, Payment, Utils, Payments) {
    var Order = function(object) {
      var self = angular.extend(this, new BaseObject(object));
      self._items = [];
      self._split = [];
      self._seats = [];
      self._payments = [];
      self._addedItems = [];
      self.currentSeats = [];
      self._authorizedCCs = [];

      // definitions
      self.getHeaders = getHeaders;
      self.isChair = isChair;
      self.isTable = isTable;
      self.isEqually = isEqually;
      self.subTotal = subTotal;
      self.serviceTotal = serviceTotal;
      self.tax = tax;
      self.totalPayments = totalPayments;
      self.total = total;
      self.getTotalCovers = getTotalCovers;
      self.getId = getId;
      self.getTotalItems = getTotalItems;

      self.setView = setView;
      self.isViewByPercentage = isViewByPercentage;
      self.isViewByTable = isViewByTable;
      self.isViewByChair = isViewByChair;

      self.getSplits = getSplits;
      self.getItems = getItems;
      self.getChairs = getChairs;

      self.typePrint = typePrint;
      self.addedItems = addedItems;
      self.getItemsByType = getItemsByType;

      self.getAuhorizedCCs = getAuhorizedCCs;

      self.getSeatAmounts = getSeatAmounts;
      self.getSplitAmounts = getSplitAmounts;

      init();

      // implements
      function init() {
        var split, seats;
        self.setView('table');

        if (!!self.data['items']) {
          for ( var idx in self.data['items']) {
            var item = new OrderItem(self.data['items'][idx]);

            var itemSeats = item.getSeats();
            if (itemSeats != 99 && itemSeats.toLowerCase() != 'all') {
              self.currentSeats = Utils.mergeUnique(self.currentSeats, itemSeats.split(','));
            }

            self._items.push(item);
          }
          self.set('totalItems', self._items.length);
        }

        self.payments = [];
        for ( var prop in self.data['payment']) {
          self.payments.push(new Payment(self.data['payment'][prop]));
        }

        if (!!self.data['percentage']) {
          for ( var idx in self.data['percentage']) {
            split = [];
            for ( var i in self.data['percentage'][idx]['items']) {
              var item = new OrderItem(self.data['percentage'][idx]['items'][i]);

              var itemSeats = item.getSeats();
              if (itemSeats != 99 && itemSeats.toLowerCase() != 'all') {
                self.currentSeats = Utils.mergeUnique(self.currentSeats, itemSeats.split(','));
              }

              self.set('totalItems', self.data['percentage'][idx]['items'].length);

              item.fraction = item.get('quantity_fraction');
              split.push(item);
            }

            split.payments = [];
            split.amountDue = self.data['percentage'][idx]['amount_due'];
            for ( var prop in self.data['percentage'][idx]['payment']) {
              split.payments.push(new Payment(self.data['percentage'][idx]['payment'][prop]));
            }

            self._split.push(split);
          }
        }

        if (!!self.data['seat']) {
          for ( var idx in self.data['seat']) {
            seats = [];
            for ( var i in self.data['seat'][idx]['items']) {
              var item = new OrderItem(self.data['seat'][idx]['items'][i]);

              var itemSeats = item.getSeats();
              if (itemSeats != 99 && itemSeats.toLowerCase() != 'all') {
                self.currentSeats = Utils.mergeUnique(self.currentSeats, itemSeats.split(','));
              }

              self.set('totalItems', self.data['seat'][idx]['items'].length);

              item.fraction = item.get('quantity_fraction');
              seats.push(item);
            }

            seats.payments = [];
            seats.amountDue = self.data['seat'][idx]['amount_due'];
            for ( var prop in self.data['seat'][idx]['payment']) {
              seats.payments.push(new Payment(self.data['seat'][idx]['payment'][prop]));
            }

            self._seats.push(seats);
          }
        }
      }

      function getId() {
        return self.getHeaders()['client_order_id'];
      }

      function getHeaders() {
        return self.data["header"];
      }

      function isEqually() {
        return self.getHeaders().type_print.toLowerCase() == "equally";
      }

      function isChair() {
        return self.getHeaders().type_print.toLowerCase() == "chair";
      }

      function isTable() {
        return self.getHeaders().type_print.toLowerCase() == "table";
      }

      function subTotal() {
        return self.data["total"]['order_subtotal'];
      }

      function serviceTotal() {
        var ret = parseFloat(self.data["total"]['tip']);

        if (isNaN(ret)) {
          return "0.00";
        } else {
          return ret.toFixed(2);
        }
      }

      function tax() {
        return self.data["total"]['order_tax'];
      }

      function totalPayments() {
        var ret = parseFloat(self.data["total"]['order_payments']);

        if (isNaN(ret)) {
          return "0.00";
        } else {
          return ret.toFixed(2);
        }
      }

      function total() {
        return self.data["total"]['order_total'];
      }

      function setView(value) {
        switch (value.toLowerCase()) {
          case 'percentage':
            self.set('viewBy', 'percentage');
            break;
          case 'table':
            self.set('viewBy', 'table');
            break;
          case 'chair':
            self.set('viewBy', 'chair');
            break;
          default:
            self.set('viewBy', 'table');
            break;
        }

      }

      function isViewByPercentage() {
        return self.get('viewBy') == "percentage";
      }

      function isViewByTable() {
        return self.get('viewBy') == "table";
      }

      function isViewByChair() {
        return self.get('viewBy') == "chair";
      }

      function getTotalCovers() {
        return parseInt(self.getHeaders()['covers']);
      }

      function getSplits() {
        return self._split;
      }

      function getItems() {
        return self._items;
      }

      function getChairs() {
        return self._seats;
      }

      function getTotalItems() {
        return self.get('totalItems');
      }

      function typePrint() {
        return self.data['header']['type_print'].toLowerCase();
      }

      function addedItems(value) {
        if (angular.isDefined(value)) {
          self._addedItems = value;
        } else {
          return self._addedItems;
        }
      }

      function getItemsByType() {
        var ret = {
          items : [],
          payments : [],
          modifiers : []
        };

        if (self.isViewByTable()) {
          var items = self.getItems();
          angular.forEach(items, function(item, itemKey) {
            ret.items.push(item);

            angular.forEach(item.getPayments(), function(payment, idx) {
              ret.payments.push(payment);
            });

            angular.forEach(item.getModifiers(), function(modifier, idx) {
              ret.modifiers.push(modifier);
            });
          });

          angular.forEach(self.payments, function(payment, itemKey) {
            ret.payments.push(payment);
          });

        } else if (self.isViewByPercentage() || self.isViewByChair()) {
          var splitters = self.isViewByPercentage() ? self.getSplits() : self.getChairs();

          angular.forEach(splitters, function(splitter, key) {
            angular.forEach(splitter, function(item, itemKey) {

              ret.items.push(item);

              angular.forEach(item.getPayments(), function(payment, idx) {
                ret.payments.push(payment);
              });

              angular.forEach(item.getModifiers(), function(modifier, idx) {
                ret.modifiers.push(modifier);
              });
            });

            angular.forEach(splitter.payments, function(payment, itemKey) {
              ret.payments.push(payment);
            });
          });
        }

        return ret;
      }

      function getAuhorizedCCs() {
        if (self._authorizedCCs.length > 0) {
          return self._authorizedCCs;
        }

        var orderItems = getItemsByType();
        var availablePayments = orderItems.payments;

        availablePayments = Payments.filterByType(availablePayments, 'Credit Card');

        // remove duplicate payment
        var tmp = new Array();

        if (availablePayments.length == 1) {
          tmp = availablePayments;
        } else if (availablePayments.length > 1) {
          var i = 0;
          do {
            var item = availablePayments[i];
            for (var j = i + 1; j < availablePayments.length; j++) {
              if (!angular.isDefined(availablePayments[j])) {
                break;
              }
              if (availablePayments[j].getId() == item.getId()) {
                availablePayments.splice(j, 1);
                j--;
              }
            }
            tmp.push(item);
            i++;
          } while (i < availablePayments.length);
        }

        self._authorizedCCs = tmp;
        return self._authorizedCCs;
      }

      function getSeatAmounts() {
        var seats = self.getChairs();

        var amounts = new Array();
        angular.forEach(seats, function(seat) {
          amounts.push(seat.amountDue);
        });

        return amounts;
      }

      function getSplitAmounts() {
        var splits = self.getSplits();

        var amounts = new Array();
        angular.forEach(splits, function(split) {
          amounts.push(split.amountDue);
        });

        return amounts;
      }
    };

    return (Order);
  }
})();