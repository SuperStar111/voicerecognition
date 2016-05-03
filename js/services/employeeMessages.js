;
(function() {
  'use strict';

  angular.module('soft').service('EmployeeMessages', EmployeeMessages);

  EmployeeMessages.$inject = [ '$q', '$http', '$rootScope', 'apiURL', '$cookieStore' ];
  function EmployeeMessages($q, $http, $rootScope, apiURL, $cookieStore) {
    var EmployeeMessages = function() {
      var self = this;

      self.getMessages = getMessages;
      self.compose = compose;
      self.markAsRead = markAsRead;

      function getMessages() {
        var deferred = $q.defer();

        var url = apiURL + 'api/POSPoint2/employee_return_messages.php?';

        var data = {
          emp_id : $cookieStore.get("empid"),
          read_id : '',
          location_id : $cookieStore.get("location"),
          token : generatetoken()
        };

        url = url + $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function markAsRead(messageID) {
        var deferred = $q.defer();

        var url = apiURL + 'api/POSPoint2/employee_return_messages.php?';

        var data = {
          emp_id : $cookieStore.get("empid"),
          read_id : messageID,
          location_id : $cookieStore.get("location"),
          token : generatetoken()
        };

        url = url + $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function compose(message) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/employee_send_message.php?";
        var data = {
          employee_id : $cookieStore.get("empid"),
          location_id : $cookieStore.get("location"),
          message : message.text,
          to : encodeURIComponent(message.employee.emp_id),
          from : $cookieStore.get("empid"),
          token : generatetoken()
        };

        url = url + $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }
    };

    return new EmployeeMessages();
  }
})();