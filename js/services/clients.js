;
(function() {
  'use strict';

  angular.module('soft').service('Clients', Clients);

  Clients.$inject = [ '$q', '$http', 'apiURL', '$cookieStore', '$filter', '$rootScope' ];
  function Clients($q, $http, apiURL, $cookieStore, $filter, $rootScope) {
    var Clients = function() {
      var self = this;

      self.getClientDetail = getClientDetail;
      self.getDeliveryDetail = getDeliveryDetail;
      self.addPhone = addPhone;
      self.addAddress = addAddress;
      self.addClient = addClient;
      self.searchExpenseTABclients = searchExpenseTABclients;

      function getClientDetail(clientID) {
        var deferred = $q.defer();

        var url = apiURL + 'api/pospoint2/get_client_info.php?';
        var data = {
          client_id : clientID,
          token : generatetoken()
        };

        url += $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function getDeliveryDetail(destination) {
        var deferred = $q.defer();

        var url = apiURL + 'api/pospoint2/get_delivery_details.php?';
        var data = {
          origin_location_id : $cookieStore.get('location'),
          destination_address : destination.address,
          destination_city : destination.city,
          destination_state : destination.state,
          destinaiton_zipcode : destination.zipcode,
          destination_country : destination.country,
          token : generatetoken()
        };

        url += $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function addPhone(clientID, number, isPrimaryPhone) {
        var deferred = $q.defer();

        if (!angular.isDefined(isPrimaryPhone)) {
          isPrimaryPhone = 'No';
        }

        var url = apiURL + 'api/pospoint2/update_insert_client_info_phone.php?';
        var data = {
          primary_phone : isPrimaryPhone,
          client_id : clientID,
          number : number,
          token : generatetoken(),
          type: 'Other'
        };

        url += $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function addAddress(clientID, address, address2, city, state, country, zip, isPrimaryAddress) {
        var deferred = $q.defer();

        if (!angular.isDefined(isPrimaryAddress)) {
          isPrimaryAddress = 'No';
        }

        var url = apiURL + 'api/pospoint2/update_insert_client_info_address.php?';
        var data = {
          primary_address : isPrimaryAddress,
          client_id : clientID,
          address : address,
          address2 : address2,
          city : city,
          state : state,
          country : country,
          zip : zip,
          type: 'Other',
          token : generatetoken()
        };

        url += $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    function addClient(info) {
      var deferred = $q.defer();

      var url = apiURL + 'api/pospoint2/update_client_info.php?id=&';

      var current = new Date();
      var created_datetime = $filter('date')(current, 'yyyy-MM-dd HH:mm:ss');
      var data = {
        status : 'A',
        created_on : created_on,
        created_by : $cookieStore.get("empid"),
        created_datetime : created_datetime,
        last_on : created_on,
        last_by : $cookieStore.get("empid"),
        last_datetime : $rootScope.last_datetime,
        token : generatetoken()
      };

      if (!info.name_first) {
        info.name_first = info.name;
      }

      data = angular.extend(data, info);

      url += $.param(data);

      $http.get(url).success(function(result) {
        deferred.resolve(result);
      }).error(function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function searchExpenseTABclients(criteria) {
      var deferred = $q.defer();

      var url = apiURL + 'api/pospoint2/get_expensetab_clients.php?id=&';
      var data = {
        token : generatetoken(),
        location_id : $cookieStore.get('location')
      };

      if (criteria.name) {
        data.search = criteria.name;
      } else if (criteria.id) {
        data.id = criteria.id;
      }

      url += $.param(data);

      $http.get(url).success(function(result) {
        deferred.resolve(result);
      }).error(function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    return new Clients();
  }
})();