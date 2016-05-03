;
(function() {
  'use strict';

  angular.module('soft').service('Preferences', Preferences);

  Preferences.$inject = [ '$q', '$http', 'apiURL', '$cookieStore', '$rootScope', '$sessionStorage', 'Minify', 'indexedDBService', 'Service.Countries', 'Employees',
    'OrderItemMenu', 'Service.Tables', 'Service.Sections', 'PaymentTypes' ];
  function Preferences($q, $http, apiURL, $cookieStore, $rootScope, $sessionStorage, Minify, indexedDBService, Countries, Employees, OrderItemMenu, Tables, Sections, PaymentTypes) {
    var self = this;

    self.loadpos = loadpos;
    self.getPreferences = getPreferences;
    self.getActualLocalTime = getActualLocalTime;
    self.isTogoTimeAvailable = isTogoTimeAvailable;
    self.isDeliveryTimeAvailable = isDeliveryTimeAvailable;
    self.location = location;
    self.updateLoadpos = updateLoadpos;
    self.getTimeoutLogin = getTimeoutLogin;
    self.getClientInfo = getClientInfo;

    init();
    function init() {

    }

    function loadpos(force) {
      var deferred = $q.defer();

      if (!force && $sessionStorage.isPosLoaded) {
        Minify.filterFields($sessionStorage.pos.employees, [ 'first_name', 'last_name', 'emp_id', 'id' ]);

        $rootScope.$broadcast('POSLoaded', {
          pos : $sessionStorage.pos
        });

        deferred.resolve($sessionStorage.pos);

      } else {
        var url = apiURL + "api/pospoint2/loadpos.php?";
        var data = {
          created_on : created_on,
          location_id : $cookieStore.get("location"),
          token : generatetoken()
        };

        url = url + $.param(data);

        $rootScope.myPromise = $http.get(url).success(function(pos) {

          Minify.filterFields(pos.employees, [ 'first_name', 'last_name', 'emp_id', 'id' ]);

          indexedDBService.open().then(function() {
            var countries = [];
            angular.forEach(pos.countries, function(country) {
              // country.country_id = parseInt(country.country_id);
              country.id = country.country_id;
              countries.push(country);
            });
            pos.countries = null;

            Countries.syncFromServer(countries).then(function() {
              Employees.syncFromServer(pos.employees).then(function() {
                pos.employees = null;

                OrderItemMenu.syncFromServer(pos.menus).then(function() {
                  pos.menus = null;

                  Tables.syncFromServer(pos.tables).then(function() {
                    pos.tables = null;

                    Sections.syncFromServer(pos.section).then(function() {
                      pos.section = null;

                      PaymentTypes.syncFromServer(pos.payments).then(function() {
                        pos.payments = null;

                        console.log(pos);
                        $sessionStorage.pos = pos;
                        $sessionStorage.isPosLoaded = true;

                        $rootScope.$broadcast('POSLoaded', {
                          pos : pos
                        });

                        deferred.resolve(pos);
                      }, function(err) {
                        console.log(err);
                      });

                    }, function(err) {
                      console.log(err);
                    });

                  }, function(err) {
                    console.log(err);
                  });

                }, function(err) {
                  console.log(err);
                });

              }, function(err) {
                console.log(err);
              });
            }, function(err) {
              console.log(err);
            });

          });

        }, function(response) {
          deferred.reject(response);
        });
      }

      return deferred.promise;
    }

    function location() {
      return $rootScope.location;
    }
    function getPreferences() {
      var deferred = $q.defer();

      var url = apiURL + "api/pospoint2/get_preferences.php?";
      var data = {
        created_on : created_on,
        token : generatetoken()
      };

      url = url + $.param(data);

      $http.get(url).success(function(result) {
        if (result["connection"] != "Invalid Access Call Support") {
          // $("#copyright").html(result["COPYRIGHT"].replace("SoftPoint LLC",
          // '<a href="//www.softpointcloud.com" target="_blank"
          // style="color: white;">SoftPoint LLC</a>'));
          deferred.resolve(result);
        } else {
          deferred.reject(result);
        }
        // loadpos_success(result, $http, $scope, $cookieStore, page);
      }, function(response) {
        deferred.reject(response);
      });

      return deferred.promise;
    }

    function getActualLocalTime() {
      var deferred = $q.defer();
      var url = apiURL + "api/POSPoint2/get_actual_location_time.php?";
      var data = {
        created_on : created_on,
        location_id : $cookieStore.get("location"),
        tmok : d.getTime(),
        token : generatetoken()
      };

      url = url + $.param(data);

      $http.get(url).success(function(result) {
        // var tm = result["currtime"].split(" ")[0].split("-");
        // var dte = tm[1] + "/" + tm[2] + "/" + tm[0];
        // $scope.last_datetime = dte;

        deferred.resolve(result);
      }).error(function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function isTogoTimeAvailable() {
      if (!$rootScope.actualLocalTime)
        return false;

      var currentTime = $rootScope.actualLocalTime.split(" ")[1];
      var currentDateByTime = new Date();
      setTime(currentDateByTime, currentTime);
      // add elapsed time
      var d = new Date();
      var diff = d.getTime() - $rootScope.clientTime.getTime();
      var elapsed_time = diff / 1000;
      currentDateByTime.setSeconds(currentDateByTime.getSeconds() + elapsed_time);

      var locationStartTime = new Date();
      setTime(locationStartTime, self.location().togo_starttime + ':00');

      var locationEndTime = new Date();
      setTime(locationEndTime, self.location().togo_endtime + ':00');

      return (locationStartTime <= currentDateByTime && currentDateByTime <= locationEndTime);
    }

    function isDeliveryTimeAvailable() {
      if (!$rootScope.actualLocalTime)
        return false;

      var currentTime = $rootScope.actualLocalTime.split(" ")[1];

      var currentDateByTime = new Date();
      setTime(currentDateByTime, currentTime);
      // add elapsed time
      var d = new Date();
      var diff = d.getTime() - $rootScope.clientTime.getTime();
      var elapsed_time = diff / 1000;
      currentDateByTime.setSeconds(currentDateByTime.getSeconds() + elapsed_time);

      var locationStartTime = new Date();
      setTime(locationStartTime, self.location().delivery_starttime + ':00');

      var locationEndTime = new Date();
      setTime(locationEndTime, self.location().delivery_endtime + ':00');

      return (locationStartTime <= currentDateByTime && currentDateByTime <= locationEndTime);
    }

    function setTime(date, strTime) {
      var parts = strTime.split(':');
      date.setHours(parseInt(parts[0]));
      date.setMinutes(parseInt(parts[1]));
      date.setSeconds(parseInt(parts[2]));
    }

    function updateLoadpos() {
      var deferred = $q.defer();

      var url = apiURL + "api/pospoint2/update_loadpos.php?";
      var data = {
        location_id : $cookieStore.get("location"),
        last_update : $rootScope.lastUpdated,
        token : generatetoken()
      };

      url = url + $.param(data);

      $http.get(url).success(function(result) {
        deferred.resolve(result);
      }, function(response) {
        deferred.reject(response);
      });

      return deferred.promise;
    }

    function getTimeoutLogin(password) {
      var deferred = $q.defer();

      var url = apiURL + "api/pospoint2/get_timeout_login.php?";
      var data = {
        location_id : $cookieStore.get("location"),
        emp_id : $cookieStore.get("empid"),
        password : password,
        token : generatetoken()
      };

      url = url + $.param(data);

      $http.get(url).success(function(result) {
        deferred.resolve(result);
      }, function(response) {
        deferred.reject(response);
      });

      return deferred.promise;
    }

    function getClientInfo() {
      var deferred = $q.defer();

      var url = apiURL + "api/pospoint2/get_terminal_ip.php?";

      $http.get(url).success(function(result) {
        deferred.resolve(result);
      }, function(response) {
        deferred.reject(response);
      });

      return deferred.promise;
    }

  }
})();