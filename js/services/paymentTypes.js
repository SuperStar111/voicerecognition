;
(function() {
  'use strict';

  angular.module('soft').service('PaymentTypes', PaymentTypes);

  PaymentTypes.$inject = [ 'PaymentType.Adjustment', 'PaymentType.Cash', 'PaymentType.CreditCard', 'PaymentType.DebitCard', 'PaymentType.ExpenseTAB',
    'PaymentType.GiftCertificate', 'PaymentType.Gratuity', 'PaymentType.Interface', 'PaymentType.Surcharge', 'PaymentType.Receivable', '$q', 'indexedDBService' ];
  function PaymentTypes(Adjustment, Cash, CreditCard, DebitCard, ExpenseTAB, GiftCertificate, Gratuity, PaymentInterface, Surcharge, Receivable, $q, indexedDBService) {
    var PaymentTypes = function() {
      var self = this;

      self.parse = parse;
      self.processData = processData;
      self.getCCType = getCCType;
      self.syncFromServer = syncFromServer;
      self.getAll = getAll;
      self.getPaymentsByType = getPaymentsByType;

      function parse(data) {
        if (data) {
          self.data = data;
        } else {
          getAll().then(function(payments) {
            data = {};

            angular.forEach(payments, function(payment) {
              data[payment.type] = payment.items;
            });

            self.data = data;
          });
        }

        // self.processData();
        // console.log(self.paymentTypes);
      }

      function getAll() {
        var deferred = $q.defer();

        indexedDBService.getAll('payments').then(function(payments) {
          deferred.resolve(payments);
        }, function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function processData() {
        if (self.paymentTypes && self.paymentTypes.length > 0) {
          return;
        }

        // else
        self.paymentTypes = [];
        self.hasGratuity = false;

        angular.forEach(self.data, function(value, key) {
          if (value.length > 0) {

            var paymentType = {
              key : key,
              subTypes : []
            };

            angular.forEach(value, function(subType, subkey) {
              subType.displayName = subType.local_code || subType.payment_code;
              var instance = null;

              if (key == 'Adjustments') {
                instance = new Adjustment(subType);
              } else if (key == 'Cash') {
                instance = new Cash(subType);
              } else if (key == 'Credit Card') {
                instance = new CreditCard(subType);
              } else if (key == 'Debit Card') {
                instance = new DebitCard(subType);
              } else if (key == 'ExpenseTAB') {
                instance = new ExpenseTAB(subType);
              } else if (key == 'Gift Certificate') {
                instance = new GiftCertificate(subType);
              } else if (key == 'Gratuity') {
                instance = new Gratuity(subType);
                self.hasGratuity = true;
              } else if (key == 'Interface') {
                instance = new PaymentInterface(subType);
              } else if (key == 'Surcharge') {
                instance = new Surcharge(subType);
              } else if (key == 'Receivables') {
                instance = new Receivable(subType);
              }

              paymentType.subTypes.push(instance);

            });

            self.paymentTypes.push(paymentType);
          }
        });
      }

      function getCCType(cardNo) {
        /**
         * Card Types:
         * 1. Visa
         * 2. American Express
         * 3. MasterCard
         * 4. Discover Card
         * 5. Diners Club
         * 6. Carte Blanche
         * 7. EnRoute
         * 8. JCB
         */
        var cardType = 'Unknown';

        // replace space and dash
        cardNo = cardNo.replace(/ \-/g, "");

        if (isNaN(cardNo) || cardNo.length < 14) {
          return cardType;
        }

        var AMTest = /^(34|37)/;
        var VisaTest = /^4/;
        var MCTest = /^5[1-5]{1}/;
        var DCTest = /^6011/;
        var DinerCTest = /^(30[0-5]{1}|36)/;
        var CarteBTest = /^38/;
        var enrouteTest = /^(2014|2149)/;
        var CJBTest1 = /^(2131|1800)/;
        var CJBTest2 = /^3/;

        if (AMTest.test(cardNo) && cardNo.length == 15) {
          return 'American Express';
        } else if (VisaTest.test(cardNo) && (cardNo.length == 13 || cardNo.length == 16)) {
          return 'Visa';
        } else if (MCTest.test(cardNo) && cardNo.length == 16) {
          return 'MasterCard';
        } else if (DCTest.test(cardNo) && cardNo.length == 16) {
          return 'Discover Card';
        } else if (DinerCTest.test(cardNo) && cardNo.length == 14) {
          return 'Diners Club';
        } else if (CarteBTest.test(cardNo) && cardNo.length == 14) {
          return 'Carte Blanche';
        } else if (enrouteTest.test(cardNo) && cardNo.length == 15) {
          return 'EnRoute';
        } else if ((CJBTest1.test(cardNo) && cardNo.length == 15) || (CJBTest2.test(cardNo) && cardNo.length == 16)) {
          return 'JCB';
        }
      }

      function syncFromServer(entities) {
        var deferred = $q.defer();

        indexedDBService.cleartable('payments').then(function() {
          var parsedData = [];

          var $i = 0;
          angular.forEach(entities, function(arr, type) {
            parsedData.push({
              id : ++$i,
              type : type,
              items : arr
            });
          });

          indexedDBService.createbatch('payments', parsedData).then(function() {

            deferred.resolve(parsedData);

          }, function() {
            deferred.resolve();
          });

        }, function() {
          deferred.reject('Can\'t clear table payments');
        });

        return deferred.promise;
      }

      function getPaymentsByType(type) {
        var deferred = $q.defer();

        indexedDBService.getByIndex('payments', 'type', type).then(function(payments) {

          deferred.resolve(payments);

        }, function() {
          deferred.resolve();
        });

        return deferred.promise;
      }
    };

    return new PaymentTypes();
  }
})();