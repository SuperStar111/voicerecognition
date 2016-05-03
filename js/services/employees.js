;
(function() {
  'use strict';

  angular.module('soft').service('Employees', Employees);

  Employees.$inject = [ '$q', '$http', 'apiURL', '$cookieStore', '$rootScope', 'indexedDBService' ];
  function Employees($q, $http, apiURL, $cookieStore, $rootScope, indexedDBService) {
    var self = this;

    self.getProfile = getProfile;
    self.syncFromServer = syncFromServer;

    init();
    function init() {

    }

    function syncFromServer(entities) {
      var deferred = $q.defer();

      indexedDBService.cleartable('employees').then(function() {
        indexedDBService.createbatch('employees', entities).then(function() {

          deferred.resolve();

        }, function() {
          deferred.resolve();
        });

      }, function() {
        deferred.reject('Can\'t clear table employees');
      });

      return deferred.promise;
    }

    function getProfile() {
      var deferred = $q.defer();

      var url = apiURL + "api/POSPoint2/employee_return_attendance.php?";
      var data = {
        created_on : created_on,
        emp_id : $cookieStore.get("empid"),
        location_id : $cookieStore.get("location"),
        password : $cookieStore.get("password"),
        token : generatetoken()
      };

      url = url + $.param(data);

      $rootScope.myPromise = $http.get(url).success(function(result) {
        if (result === '0' || result === 0) {
          deferred.reject(result);
        } else {
          deferred.resolve(result);
        }
      }).error(function() {
        deferred.reject(result);
      });

      return deferred.promise;
    }
  }
})();