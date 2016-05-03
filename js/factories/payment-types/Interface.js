;
(function() {
  'use strict';

  angular.module('soft').factory('PaymentType.Interface', PaymentInterface);

  PaymentInterface.$inject = [ 'PaymentType.BasePaymentType', '$timeout', 'Service.Payments', 'Modals', '$q', 'Checks', 'soft.Utils' ];
  function PaymentInterface(BasePaymentType, $timeout, Payments, Modals, $q, Checks, Utils) {
    var PaymentInterface = function(object) {
      var self = angular.extend(this, new BasePaymentType(object));

      self.init = init;
      self.paymentCtrl = null;
      self.sendPayment = sendPayment;
      self.updateAmountDue = updateAmountDue;
      self.selectHotelPointGuest = selectHotelPointGuest;

      self.getHotelPointGuest = getHotelPointGuest;
      self.inactive = inactive;

      self.onSeatChange = onSeatChange;
      self.onSplitChange = onSplitChange;

      function reset() {
        self.seatData = {
          selectedSeatIds : [ 99 ]
        };
        self.splitData = {
          selectedSplitIds : [ 99 ]
        };

        self.gratuity = '';
        self.room = '';
        self.name = '';
        self.account_id = '';

        self.selectedHotelPointGuest = null;
      }

      function init(order) {
        self.order = order;

        self.orderTotal = self.order.total();

        self.paymentCtrl = order.paymentCtrl;

        reset();

        self.originalAmount = self.paymentCtrl.amountDue();
      }

      function getHotelPointGuest(paymentInterface) {

        if (!(self.room || self.name || self.account_id) || self.get('hotel_automated') != 'Yes') {
          self.searchResult = [];
          return;
        }

        if (self.promise) {
          $timeout.cancel(self.promise);
        }

        self.promise = $timeout(function() {
          self.searchingHotelPointGuest = true;
          self.info = {
            name : self.name,
            room : self.room,
            account_id : self.account_id
          };
          Payments.getHotelPointGuest(self.info, self.get('hotel_location_id')).then(function(result) {
            self.searchingHotelPointGuest = false;

            if (result.result && result.result.length > 0) {
              self.searchResult = result.result;
            } else {
              var err = null;
              if (result.length > 0) {
                err = result[0];
              } else {
                err = result;
              }

              self.searchResult = [];
              Modals.alert(err.ResponseMessage);
            }
          }, function(err) {
            self.searchingHotelPointGuest = false;
            console.log(err);
          });
        }, 500);
      }

      function updateAmountDue() {
        if (!self.gratuityChange)
          return;

        var n = parseFloat(self.gratuity);
        if (isNaN(n) || n == 0) {
          self.paymentCtrl.amountDue(self.originalAmount);
        } else {
          // var amountDue = parseFloat(self.paymentCtrl.amountDue());
          var amountDue = parseFloat(self.originalAmount);
          if (isNaN(amountDue)) {
            amountDue = 0;
          }
          self.paymentCtrl.amountDue((amountDue + n).toFixed(2));
        }

        self.gratuityChange = false;
      }

      function selectHotelPointGuest(hotelPointGuest) {
        self.room = hotelPointGuest.room;
        self.name = hotelPointGuest.name;
        self.account_id = hotelPointGuest.account_id;

        self.selectedHotelPointGuest = hotelPointGuest;
        self.searchResult = [];
      }

      function inactive() {
        self.room = null;
        self.name = null;
        self.account_id = null;
        self.searchResult = [];
      }

      function onSeatChange() {
        var amount = self.seatData.amount;
        if (amount == 0) {
          amount = self.order.total();
        }

        self.originalAmount = amount;

        self.amt_due = amount;
        // self.gratuity = (parseFloat(self.amt_due) * 0.5).toFixed(2);
        var gratuity = self.gratuity ? self.gratuity : 0;

        self.paymentCtrl.amountDue(parseFloat(amount * 1.0 + gratuity * 1.0).toFixed(2));
      }

      function onSplitChange() {
        var amount = self.splitData.amount;
        if (amount == 0) {
          amount = self.order.total();
        }

        self.originalAmount = amount;

        self.amt_due = amount;
        // self.gratuity = (parseFloat(self.amt_due) * 0.5).toFixed(2);
        var gratuity = self.gratuity ? self.gratuity : 0;

        self.paymentCtrl.amountDue(parseFloat(amount * 1.0 + gratuity * 1.0).toFixed(2));
      }

      function sendPayment(itemsSent) {
        var deferred = $q.defer();

        var data = {
          order_id : self.order.getId(),
          terminal_id : Utils.ckpar(''),
          payment_id : Utils.ckpar(self.getId()),
          seat : Utils.ckpar('99'),
          client_id : Utils.ckpar(''),

          hotel_room_number : Utils.ckpar(self.room),
          hotel_guest_name : Utils.ckpar(self.name),
          hotel_account_id : Utils.ckpar(self.account_id),

          items_taxexempt : Utils.ckpar(itemsSent),

          // amount info
          payment_amount : Utils.ckpar(self.paymentCtrl.amountDue()),
          gratuity : Utils.ckpar(self.gratuity),

          requires_manager_approval : 'no' // TODO: Implement Pinpad
        };

        if (self.order.isChair()) {
          data['seat'] = self.seatData.selectedSeatIds.join(',');
          if (data['seat'] == 99) {
            self.seatData.amounts = self.order.getSeatAmounts();

          }
          data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.seatData.amounts, self.paymentCtrl.amountDue(), self.gratuity).join(',');
        } else if (self.order.isEqually()) {
          data['split'] = self.splitData.selectedSplitIds.join(',');
          data['seat'] = self.splitData.selectedSplitIds.join(',');

          if (data['split'] == 99) {
            self.splitData.amounts = self.order.getSplitAmounts();

          }

          data['seat_payment_details'] = Payments.getSeatPaymentDetails(self.splitData.amounts, self.paymentCtrl.amountDue(), self.gratuity).join(',');
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

    return PaymentInterface;
  }
})();