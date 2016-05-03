;
(function() {
  'use strict';

  angular.module('soft').service('Orders', Orders);

  Orders.$inject = [ '$q', '$http', '$rootScope', 'apiURL', '$cookieStore', 'Order' ];
  function Orders($q, $http, $rootScope, apiURL, $cookieStore, Order) {
    var Orders = function() {
      var self = this;

      self.getCheckDetailsByPercentage = getCheckDetailsByPercentage;
      self.getCheckDetailsByChair = getCheckDetailsByChair;
      self.getCheckDetails = getCheckDetails;

      self.getOrderDetail = getOrderDetail;

      self.updateItemsSeat = updateItemsSeat;
      self.updateItemsDiscount = updateItemsDiscount;
      self.reopen = reopen;

      function getCheckDetailsByPercentage(orderID, covers, isShowDetail) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/return_check_details_by_percentage.php";
        if (isShowDetail) {
          url = apiURL + "api/POSPoint2/return_check_details_by_percentage_expanded.php";
        }

        var data = {
          location_id : $cookieStore.get("location"),
          order_id : orderID,
          created_on : created_on,
          percentage : (1 / covers).toFixed(2),
          tmok : d.getTime(),
          token : generatetoken()
        };

        var options = {
          url : url + '?' + $.param(data),
          method : 'GET'
        };

        $rootScope.myPromise = $http(options).success(function(result) {
          deferred.resolve(result);
        }).error(function(data, status) {
          deferred.reject(data);
        });

        return deferred.promise;
      }

      function getCheckDetailsByChair(orderID, isShowDetail) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/return_check_details_by_seat.php";
        if (isShowDetail) {
          url = apiURL + "api/POSPoint2/return_check_details_by_seat_expanded.php";
        }
        var data = {

          location_id : $cookieStore.get("location"),
          order_id : orderID,
          created_on : created_on,
          seat : '',
          tmok : d.getTime(),
          token : generatetoken()
        };

        var options = {
          url : url + '?' + $.param(data),
          method : 'GET'
        };

        $rootScope.myPromise = $http(options).success(function(result) {
          deferred.resolve(result);
        }).error(function(data, status) {
          deferred.reject(data);
        });
        ;

        return deferred.promise;
      }

      function getCheckDetails(orderID, isShowDetail) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/return_check_details.php";
        if (isShowDetail) {
          url = apiURL + "api/POSPoint2/return_check_details_expanded.php";
        }

        var data = {
          location_id : $cookieStore.get("location"),
          order_id : orderID,
          created_on : created_on,
          tmok : d.getTime(),
          token : generatetoken()
        };

        var options = {
          url : url + '?' + $.param(data),
          method : 'GET'
        };

        $rootScope.myPromise = $http(options).success(function(result) {
          deferred.resolve(result);
        }).error(function(data, status) {
          deferred.reject(data);
        });
        ;

        return deferred.promise;
      }

      function updateItemsSeat(orderID, items, seats) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/update_check_items_seat.php";
        var data = {
          location_id : $cookieStore.get("location"),
          seat_payment : seats,
          order_id : orderID,
          items : items,
          created_on : created_on,
          token : generatetoken()
        };

        var options = {
          url : url + '?' + $.param(data),
          method : 'GET'
        };

        $rootScope.myPromise = $http(options).success(function(result) {
          deferred.resolve(result);
        }).error(function(data, status) {
          deferred.reject(data);
        });

        return deferred.promise;
      }

      function updateItemsDiscount(orderID, payment, discounts) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/update_check_items_discount.php";
        var data = {
          location_id : $cookieStore.get("location"),
          emp_id : $cookieStore.get("empid"),
          order_id : orderID,
          created_on : created_on,
          token : generatetoken(),
          payment_id : payment,
          discounts : discounts
        };

        var options = {
          url : url + '?' + $.param(data),
          method : 'GET'
        };

        $rootScope.myPromise = $http(options).success(function(result) {
          deferred.resolve(result);
        }).error(function(data, status) {
          deferred.reject(data);
        });

        return deferred.promise;
      }

      function getOrderDetail(check, isShowDetail) {
        var deferred = $q.defer();

        var ret = {};
        ret.checkStatus = check.orderStatus;
        ret.loadCheckDetail = true;

        switch (check.type_print.toLowerCase()) {
          case 'equally':
            self.getCheckDetailsByPercentage(check.id, parseInt(check.equally_covers), isShowDetail).then(
            // success
            function(result) {

              try {
                ret.order = new Order(result[0]["regular_receipt"]);
                ret.order.setView('percentage');
                deferred.resolve(ret);
              } catch (e) {
                deferred.reject(e);
              }
            },
            // failes
            function(response) {
              console.log(response);
            });
            break;
          case 'chair':
            self.getCheckDetailsByChair(check.id, isShowDetail).then(
            // success
            function(result) {
              try {
                ret.order = new Order(result[0]["regular_receipt"]);
                ret.order.setView('chair');
                deferred.resolve(ret);
              } catch (e) {
                deferred.reject(e);
              }
            },
            // failes
            function(err) {
              deferred.reject(err);
            });
            break;
          default:
            self.getCheckDetails(check.id, isShowDetail).then(
            // success
            function(result) {

              try {
                ret.order = new Order(result[0]["regular_receipt"]);
                ret.order.setView('table');
                deferred.resolve(ret);
              } catch (e) {
                deferred.reject(e);
              }
            },
            // failes
            function(err) {
              deferred.reject(err);
            });
            break;
        }

        return deferred.promise;
      }

      function reopen(orderID) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/get_reopen_check.php";
        var data = {
          location_id : $cookieStore.get("location"),
          order_id : orderID,
          last_by : $cookieStore.get("empid"),
          last_on : created_on,
          token : generatetoken()
        };

        var options = {
          url : url + '?' + $.param(data),
          method : 'GET'
        };

        $rootScope.myPromise = $http(options).success(function(result) {
          deferred.resolve(result);
        }).error(function(data, status) {
          deferred.reject(data);
        });

        return deferred.promise;
      }
    };

    return new Orders();
  }
})();