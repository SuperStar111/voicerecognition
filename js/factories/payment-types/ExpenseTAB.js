;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.ExpenseTAB', ExpenseTAB);

  ExpenseTAB.$inject = [ 'PaymentType.BasePaymentType', '$q', 'Checks', '$timeout', 'Clients', 'soft.Utils', 'Modals', 'Service.Payments' ];
  function ExpenseTAB(BasePaymentType, $q, Checks, $timeout, Clients, Utils, Modals, Payments) {
    var ExpenseTAB = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.init = init;
      self.paymentCtrl = null;
      self.sendPayment = sendPayment;

      self.searchClientsByName = searchClientsByName;
      self.searchClientsByID = searchClientsByID;
      self.findClientsByName = findClientsByName;
      self.findClientsByID = findClientsByID;

      self.selectExpenseTABClient = selectExpenseTABClient;

      self.searchPromiseExpenseTab = {};
      self.inactive = inactive;

      self.seatData = {};
      self.onSeatChange = onSeatChange;
      self.splitData = {};
      self.onSplitChange = onSplitChange;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };
      }

      function init(order) {
        self.order = order;
        self.paymentCtrl = order.paymentCtrl;
        reset();
      }

      function searchClientsByName() {
        console.log(self.clientName);
      }

      function searchClientsByID() {
        console.log(self.clientID);
      }

      function findClientsByName() {
        var criteria = {
          name : self.searchClientName
        };
        doSearchExpenseTABClients(criteria);
      }

      function findClientsByID() {
        var criteria = {
          id : self.searchClientID
        };
        doSearchExpenseTABClients(criteria);
      }

      function doSearchExpenseTABClients(criteria) {
        if (self.searchPromiseExpenseTab.name) {
          $timeout.cancel(self.searchPromiseExpenseTab.name);
        }

        self.searchPromiseExpenseTab.name = $timeout(function() {
          self.searchingClients = true;
          Clients.searchExpenseTABclients(criteria).then(function(result) {
            if (result.ResponseCode == 0) {
              self.searchResult = [];
              Modals.alert(result.ResponseMessage);
            } else {
              self.searchResult = result;
            }

            self.searchingClients = false;

          }, function(err) {
            self.searchingClients = false;
          });
        }, 500);
      }

      function selectExpenseTABClient(client) {
        if (client.ExpenseTAB_status_message) {
          Modals.alert(client.ExpenseTAB_status_message);
        } else {
          self.selectedClient = client;

          self.isAssignClientName = true;
          self.searchClientName = client.client_name;

          self.isAssignClientID = true;
          self.searchClientID = client.ExpenseTAB_id;

          self.searchResult = [];
        }

      }

      function inactive() {
        self.searchClientName = null;
        self.searchClientID = null;
        self.searchResult = [];
      }

      function onSeatChange() {
        var amount = self.seatData.amount;
        if (amount == 0) {
          amount = self.order.total();
        }

        self.paymentCtrl.amountDue(amount);
      }

      function onSplitChange() {
        var amount = self.splitData.amount;
        if (amount == 0) {
          amount = self.order.total();
        }
        self.paymentCtrl.amountDue(amount);
      }

      function sendPayment(itemsSent) {
        var deferred = $q.defer();

        var data = {
          order_id : self.order.getId(),
          terminal_id : Utils.ckpar(''),
          payment_id : Utils.ckpar(self.getId()),
          seat : Utils.ckpar('99'),
          client_id : Utils.ckpar(''),

          expensetab_client_id : Utils.ckpar(self.selectedClient.ExpenseTAB_id),

          items_taxexempt : Utils.ckpar(itemsSent),

          // amount info
          payment_amount : Utils.ckpar(self.paymentCtrl.amountDue()),

          requires_manager_approval : 'no' // TODO: Implement Pinpad
        };

        if (self.order.isChair()) {
          data['seat'] = self.seatData.selectedSeatIds.join(',');
          if (data['seat'] == 99) {
            self.seatData.amounts = self.order.getSeatAmounts();

          }
          data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.seatData.amounts, self.paymentCtrl.amountDue(), 0).join(',');
        } else if (self.order.isEqually()) {
          data['split'] = self.splitData.selectedSplitIds.join(',');
          data['seat'] = self.splitData.selectedSplitIds.join(',');

          if (data['split'] == 99) {
            self.splitData.amounts = self.order.getSplitAmounts();

          }

          data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.splitData.amounts, self.paymentCtrl.amountDue(), 0).join(',');
        }

        Checks.updatePayments(data).then(function(result) {
          if (result.ResponseCode == 1) {
            reset();

            deferred.resolve(result);

          } else {
            deferred.reject(result);
          }
        }, function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    return ExpenseTAB;
  }
})();