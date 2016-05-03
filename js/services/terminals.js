;
(function() {
  'use strict';

  angular.module('soft').service('Service.Terminals', Terminals);

  Terminals.$inject = [ '$q', '$rootScope', '$http', 'apiURL', '$cookieStore' ];
  function Terminals($q, $rootScope, $http, apiURL, $cookieStore) {
    var fn = function() {
      var self = this;

      self.getTerminals = getTerminals;
      self.updateTerminal = updateTerminal;
      self.currentID = currentID;

      function getTerminals(location) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/get_terminals.php?";
        var data = {
          location_id : location,
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

      function updateTerminal(location, terminal, empid) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/update_terminal.php?";
        var data = {
          location_id : location,
          token : generatetoken(),
          terminal_id : terminal.id,
          terminal_configured : 'yes',
          //serial : '123',
          ip_address : $rootScope.clientIP,
          geo_location : '',
          default_printer_id : '',
          language : '',
          last_on : created_on,
          last_by : empid

        };

        url = url + $.param(data);

        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function currentID($id) {
        if (angular.isDefined($id)) {
          self._id = $id;
        } else {
          return self._id;
        }
      }
    };

    return new fn();
  }
})();