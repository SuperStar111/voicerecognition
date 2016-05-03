;
(function() {
  'use strict';

  angular.module('soft').service('Checks', Checks);

  Checks.$inject = [ '$q', '$http', 'apiURL', '$cookieStore', '$rootScope', '$filter', 'soft.Utils' ];
  function Checks($q, $http, apiURL, $cookieStore, $rootScope, $filter, Utils) {
    var Checks = function() {
      var self = this;

      self._check = null;

      self.getChecks = getChecks;
      self.printCheck = printCheck;
      self.getCheckDetails = getCheckDetails;
      self.searchClients = searchClients;
      self.updateCheckDetail = updateCheckDetail;
      self.mergeCheck = mergeCheck;

      self.updateCheckItems = updateCheckItems;
      self.updatePayments = updatePayments;

      self.currentCheck = currentCheck;
      self.cancelCheck = cancelCheck;
      self.updateTypePrint = updateTypePrint;
      self.refund = refund;
      self.voidItems = voidItems;

      function mergeCheck(originID, destinationID) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/update_check_merge.php?";
        var data = {
          location_id : $cookieStore.get("location"),
          order_id_origin : originID,
          order_id_destination : destinationID,
          last_on : created_on,
          last_by : $cookieStore.get("empid"),
          token : generatetoken()
        };

        url = url + $.param(data);

        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function getChecks(params) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/return_checklist.php?";
        var data = {
          orderfield : 'ord1.id',
          order : 'desc',
          closed_cb : 'no',
          table_cb : '',
          togo_cb : 'yes',
          delivery_cb : 'yes',
          phone_cb : '',
          terminal_id : 'null',
          section_id : '',

          created_on : created_on,
          password : $cookieStore.get("password"),
          location_id : $cookieStore.get("location"),
          emp_id : $cookieStore.get("empid"),
          filter_date : $rootScope.last_datetime,
          token : generatetoken()
        };

        if (angular.isDefined(params)) {
          data = angular.extend(data, params);
        }

        url = url + $.param(data);

        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function printCheck(order) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/process_print_check.php?";
        var data = {
          terminal_id : 0,
          sale_id : 0,
          type : 'print',
          hotel_account_id : 0,

          created_on : created_on,
          token : generatetoken(),
          location_id : $cookieStore.get("location"),
          employee_id : $cookieStore.get("empid"),

          password : $cookieStore.get("password"),
          type_access : "access_pos_admin",
          lastchange : $rootScope.serverTime,
          order_id : order.getId()
        };

        if (order.isTable()) {
          data['seat'] = 99;
          data['split'] = '';
        } else if (order.isChair()) {
          if (order.selectedSeatsIds.length == 0) {
            data['seat'] = 99;
          } else {
            data['seat'] = order.selectedSeatsIds.join(',');
          }
          
          data['split'] = '';
        } else if (order.isEqually()) {
          if (order.selectedSplitIds.length == 0) {
            data['seat'] = 99;
          } else {
            data['seat'] = order.getHeaders()['equally_covers'];
          }
          
          data['split'] = order.selectedSplitIds.join(',');
        }

        url = url + $.param(data);
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function getCheckDetails(id) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/get_check_details.php?";
        var data = {
          created_on : created_on,
          token : generatetoken(),
          location_id : $cookieStore.get("location"),
          order_id : id,
          created_by : $cookieStore.get("empid")
        };

        url = url + $.param(data);
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function searchClients(term) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/get_clients.php?";
        var data = {
          search : term,
          token : generatetoken(),
          location_id : $cookieStore.get("location")
        };

        url = url + $.param(data);
        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function updateCheckDetail(check) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/update_check_details.php?";
        var data = {
          order_id : check.getId(),
          location_id : $cookieStore.get("location"),
          emp_id : $cookieStore.get("empid"),
          source_of_business : check.sourceOfBusiness(),

          fast : check.isFast() ? 'yes' : 'no',
          location_table : check.table(),
          covers : check.covers(),
          last_on : created_on,
          last_by : $cookieStore.get("empid"),
          token : generatetoken()
        };

        if (check.isTogo()) {
          data.togo = 'yes';
          // data.togo_time = check.togoTime();
        } else {
          data.togo = 'no';
        }

        if (check.isDelivery()) {
          data.delivery = 'yes';
          // data.delivery_time = check.delivery().time();

        } else {
          data.delivery = 'no';
        }

        if (check.isDelivery() || check.isTogo()) {
          data.delivery_address = check.delivery().address();
          data.delivery_address2 = check.delivery().address2();
          data.delivery_city = check.delivery().city();
          data.delivery_state = check.delivery().state();
          data.delivery_zipcode = check.delivery().zipcode();
          data.delivery_phone = check.delivery().phone();
        }

        if (check.isTable()) {
          data.hostess_status = check.hostessStatus();
          data.assigned_server = check.assignedServer();

          data.location_table = check.table();
        }

        var selectedClients = check.selectedClients();
        var arrClientIDs = new Array();

        if (selectedClients.length == 1) {
          arrClientIDs.push(selectedClients[0].getId());
          // data.client_id = selectedClients[0].getId();
          data.multiple_client = 'no';
        } else if (selectedClients.length > 1) {

          for ( var idx in selectedClients) {
            data.multiple_client = 'yes';
            arrClientIDs.push(selectedClients[idx].getId());
          }
          // data.array_clients = arrClientIDs.join(',');
        } else {
          data.multiple_client = 'no';
        }

        if (check.clientName && (check.isTable() || check.isFast())) {
          data.name = check.clientName;
        }

        url = url + $.param(data);
        if (check.isTogo()) {
          url += '&togo_time=' + check.togoTime();
        } else if (check.isDelivery()) {
          url += '&delivery_time=' + check.delivery().time();
        }

        if (arrClientIDs.length >= 1) {
          url += '&client_id=' + arrClientIDs[0];
          url += '&array_clients=' + arrClientIDs.join(',');
        } else {
          url += '&array_clients=0';
        }

        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function updateCheckItems(data) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/update_check_items.php";

        var data = {
          nojson : 1,
          location_id : $cookieStore.get("location"),
          emp_id : $cookieStore.get("empid"),
          order_id : data.order_id,
          created_on : "POSPoint Browser",
          token : generatetoken(),
          arrayitems : data.arrayItems,
          debug : ""
        };

        var options = {
          url : url,
          method : 'POST',
          headers : {
            'Content-Type' : 'application/x-www-form-urlencoded'
          },
          data : data,
          transformRequest : function(obj) {
            return $.param(obj);
          }
        };

        $rootScope.myPromise = $http(options).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function updatePayments(paymentData) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/update_check_payments.php?";
        var data = {
          token : generatetoken(),
          location_id : $cookieStore.get("location"),
          emp_id : $cookieStore.get("empid"),
          created_on : Utils.ckpar(created_on),
          tmok : d.getTime()
        };

        data = angular.extend(data, paymentData);

        url = url + $.param(data);
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function currentCheck(check) {
        if (angular.isDefined(check)) {
          self._currentCheck = check;
        } else {
          return self._currentCheck;
        }
      }

      function cancelCheck(check) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/update_check_details.php?";
        var data = {
          order_id : check.getId(),
          location_id : $cookieStore.get("location"),
          emp_id : $cookieStore.get("empid"),
          last_on : created_on,
          last_by : $cookieStore.get("empid"),
          token : generatetoken(),
          order_status : 'cancelled'
        };

        url = url + $.param(data);
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function updateTypePrint(check, type) {
        var deferred = $q.defer();

        check.currentOrder().getHeaders().type_print = type;

        var url = apiURL + "api/pospoint2/update_check_details.php?";
        var data = {
          order_id : check.getId(),
          location_id : $cookieStore.get("location"),
          emp_id : $cookieStore.get("empid"),
          type_print : type,
          last_on : created_on,
          last_by : $cookieStore.get("empid"),
          token : generatetoken()
        };

        if (type.toUpperCase() == 'EQUALLY') {
          data['equally_covers'] = angular.isDefined(check.selectedCovers) ? check.selectedCovers : check.covers();
        }

        url = url + $.param(data);
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;

      }

      function refund(check, arrPayments) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/insert_refund_payment.php?";
        var data = {
          order_id : check.getId(),
          location_id : $cookieStore.get("location"),
          payment_id : arrPayments.join(','),
          emp_id : $cookieStore.get("empid"),
          last_on : created_on,
          last_by : $cookieStore.get("empid"),
          token : generatetoken()
        };

        url = url + $.param(data);
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function voidItems(check, arrItemIds, arrModifierIds) {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/update_check_items_void.php?";
        var data = {
          order_id : check.getId(),
          location_id : $cookieStore.get("location"),
          items : arrItemIds.join(','),
          items_modifier : arrModifierIds.join(','),
          emp_id : $cookieStore.get("empid"),
          last_on : created_on,
          last_by : $cookieStore.get("empid"),
          token : generatetoken()
        };

        url = url + $.param(data);
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    return new Checks();
  }
})();