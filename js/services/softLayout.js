;
(function() {
  'use strict';

  angular.module('soft').service('SoftLayout', SoftLayout);

  SoftLayout.$inject = [ '$q', '$http', 'apiURL', '$cookieStore', '$rootScope' ];
  function SoftLayout($q, $http, apiURL, $cookieStore, $rootScope) {
    var SoftLayout = function() {
      var self = this;

      self.tableLayout = tableLayout;
      self.updateTable = updateTable;
      self.sectionLayout = sectionLayout;
      self.updateSection = updateSection;
      self.getSectionDetails = getSectionDetails;

      function tableLayout() {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/get_table_layout.php?";
        var data = {
          location_id : $cookieStore.get("location"),
          token : generatetoken()
        };

        url = url + $.param(data);

        // $rootScope.myPromise =
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function sectionLayout(sectionID) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/get_table_section_layout.php?";
        var data = {
          location_id : $cookieStore.get("location"),
          token : generatetoken(),
          section_id : sectionID
        };

        url = url + $.param(data);

        // $rootScope.myPromise =
        $rootScope.myPromise = $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function updateTable(tableID, data) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/set_table_layout.php?";
        data['id'] = tableID;
        data['location_id'] = $cookieStore.get("location");
        data['token'] = generatetoken();

        url = url + $.param(data);

        // $rootScope.myPromise =
        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function updateSection(sectionID, data) {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/set_table_section_layout.php?";
        data['section_table_id'] = sectionID;
        // data['location_id'] = $cookieStore.get("location");
        data['token'] = generatetoken();

        url = url + $.param(data);

        // $rootScope.myPromise =
        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function getSectionDetails() {
        var deferred = $q.defer();

        var url = apiURL + "api/POSPoint2/get_sectiondetails.php?";
        var data = {
          location_id : $cookieStore.get("location"),
          token : generatetoken()
        };

        url = url + $.param(data);

        // $rootScope.myPromise =
        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    return new SoftLayout();
  }
})();