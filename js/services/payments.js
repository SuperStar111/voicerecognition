;
(function() {
  'use strict';

  angular.module('soft').service('Service.Payments', Payments);

  Payments.$inject = [ '$q', '$http', 'apiURL', '$cookieStore' ];
  function Payments($q, $http, apiURL, $cookieStore) {
    var Payments = function() {
      var self = this;

      self.getGiftCertificate = getGiftCertificate;
      self.getPaymentReceivableDetails = getPaymentReceivableDetails;
      self.getHotelPointGuest = getHotelPointGuest;
      self.filterByType = filterByType;
      self.getSeatPaymentDetails = getSeatPaymentDetails;

      function fill(newAmounts, amounts, received, n) {
        var m = 0;

        var eachAmount = received / n;
        for (var i = 0; i < amounts.length; i++) {
          if (newAmounts[i] && newAmounts[i] == amounts[i]) {
            continue;
          } else if (!newAmounts[i] && amounts[i] < eachAmount) {
            newAmounts[i] = amounts[i];

          } else {
            m++;
            if (!newAmounts[i]) {
              newAmounts[i] = eachAmount;
            } else {
              newAmounts[i] += eachAmount;
            }
          }

          received -= newAmounts[i];
        }

        if (received > 0) {
          fill(newAmounts, amounts, received, m);
        }
      }

      function getSeatPaymentDetails(amounts, received, gratuity) {
        received = received * 1.0 - gratuity * 1.0;

        if (received < 0) {
          throw 'Invalid values for gratuity and amount';
        }

        var arr = new Array();

        if (amounts.length > 0) {
          var _gratuity = parseFloat(gratuity);
          if (isNaN(_gratuity)) {
            _gratuity = 0;
          }

          var divide = _gratuity / amounts.length;

          var totalSeatAmounts = 0;
          angular.forEach(amounts, function(value) {
            totalSeatAmounts += value;
          });

          var newAmounts = new Array();

          if (totalSeatAmounts > received) {
            fill(newAmounts, amounts, received, amounts.length);

          } else {
            newAmounts = amounts;
          }

          angular.forEach(newAmounts, function(value) {
            var amount = parseFloat(value) + divide;
            arr.push(amount.toFixed(2));
          });
        }

        return arr;
      }
      function getGiftCertificate(cardNumber, type) {
        var deferred = $q.defer();

        var url = apiURL + 'api/pospoint2/get_giftcertificate_details.php?';
        var data = {
          token : generatetoken(),
          location_id : $cookieStore.get('location'),
          gift_certificate : cardNumber,
          type : type
        };

        url += $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function getPaymentReceivableDetails(companyName) {
        var deferred = $q.defer();

        var url = apiURL + 'api/pospoint2/get_companies_receivables.php?';
        var data = {
          token : generatetoken(),
          location_id : $cookieStore.get('location'),
          company : companyName
        };

        url += $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function getHotelPointGuest(clientInfo, location) {
        var deferred = $q.defer();

        var url = apiURL + 'api/pospoint2/get_hotelpoint_guest.php?';
        var data = {
          token : generatetoken(),
          location_id : location
        };

        data = angular.extend(clientInfo, data);

        url += $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function filterByType(arr, name) {
        var ret = new Array();
        angular.forEach(arr, function(payment, key) {
          if (payment.paymentType() == name.toUpperCase() && payment.get('autho_amount') > 0) {
            ret.push(payment);
          }
        });

        return ret;
      }
    };

    return new Payments;
  }

})();