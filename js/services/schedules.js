;
(function() {
  'use strict';

  angular.module('soft').service('Schedules', Schedules);

  Schedules.$inject = [ '$q', '$http', 'apiURL', '$cookieStore', '$rootScope' ];
  function Schedules($q, $http, apiURL, $cookieStore, $rootScope) {
    var Schedules = function() {
      var self = this;

      self.getSchedules = getSchedules;

      function getSchedules() {
        var deferred = $q.defer();

        var url = apiURL + 'api/pospoint2/return_schedule.php?';
        var data = {
          location_id : $cookieStore.get("location"),
          emp_id : $cookieStore.get("username"),
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
    return new Schedules();
  }
})();