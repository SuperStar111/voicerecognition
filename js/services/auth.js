;
(function() {
  'use strict';

  angular.module('soft').service('Auth', Auth);

  Auth.$inject = [ '$q', '$http', 'apiURL', '$cookieStore' ];
  function Auth($q, $http, apiURL, $cookieStore) {
    var Auth = function() {
      var self = this;

      // definitions
      self.verifyemp = verifyemp;
      self.emplogout = emplogout;
      self.emplogin = emplogin;
      self.verifyManager = verifyManager;

      // implements
      function verifyemp(location, employee, password) {
        var deferred = $q.defer();

        var data = {
          created_on : created_on,
          type_access_lo : "access_pos",
          tmok : (new Date()).getTime(),
          location_id : location,
          employee_id : employee,
          password : password,
          type_access : "access_pos_admin",
          token : generatetoken()
        };

        var url = apiURL + 'api/pospoint2/verifyemp.php';

        var req = {
          url : url + '?' + $.param(data),
          method : 'GET'
        };

        $http(req).success(function(res, status) {

          deferred.resolve(res);

        }).error(function(data, status) {
          deferred.reject(data);
        });

        return deferred.promise;
      }

      function emplogout(password) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/verifyemplogout.php?";
        var data = {
          created_on : created_on,
          emp_access : "access_pos_admin",
          tmok : d.getTime(),
          location_id : $cookieStore.get("location"),
          password : password,
          token : generatetoken()
        };

        url = url + $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(response) {
          deferred.reject(response);
        });

        return deferred.promise;
      }

      function emplogin(password) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/verifyempbyid.php?";
        var data = {
          created_on : created_on,
          tmok : d.getTime(),
          location_id : $cookieStore.get("location"),
          password : password,
          token : generatetoken(),
        };
        url = url + $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(response) {
          deferred.reject(response);
        });

        return deferred.promise;
      }

      function verifyManager(location, password, allow_discount, allow_adjustment, pos_admin) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/verifyempmanager.php?";
        var data = {
          created_on : created_on,
          tmok : d.getTime(),
          location_id : location,
          password : password,
          token : generatetoken(),
        };

        if (angular.isDefined(allow_discount)) {
          if (!pos_admin)
            data['pos_admin'] = 'no';
          if (allow_discount === 'yes') {
            data['allow_discount'] = 'yes';
          } else {
            data['allow_discount'] = 'no';
          }
        }

        if (angular.isDefined(allow_adjustment)) {
          if (!pos_admin)
            data['pos_admin'] = 'no';
          if (allow_adjustment === 'yes') {
            data['allow_adjustment'] = 'yes';
          } else {
            data['allow_adjustment'] = 'no';
          }
        }

        if (pos_admin) {
          data.pos_admin = pos_admin;
        }
        if (!data.pos_admin) {
          data.pos_admin = 'yes';
        }

        url = url + $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(response) {
          deferred.reject(response);
        });

        return deferred.promise;
      }
    };

    return new Auth();
  }
})();