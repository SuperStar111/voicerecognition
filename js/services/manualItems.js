;
(function() {
  'use strict';

  angular.module('soft').service('Service.ManualItems', ManualItems);

  ManualItems.$inject = [ '$q', '$http', 'apiURL', '$cookieStore', '$rootScope' ];
  function ManualItems($q, $http, apiURL, $cookieStore, $rootScope) {
    var ManualItems = function() {
      var self = this;

      self.getManualItemDetails = getManualItemDetails;
      self.insert = insert;

      function getManualItemDetails() {
        var deferred = $q.defer();

        var url = apiURL + 'api/pospoint2/get_manual_items_details.php?';

        var data = {
          location_id : $cookieStore.get("location"),
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

      function insert($data) {
        var deferred = $q.defer();

        var url = apiURL + 'api/pospoint2/insert_manual_item.php?';

        var data = {
          location_id : $cookieStore.get("location"),
          token : generatetoken(),
          created_by : $cookieStore.get("empid"),
          name : $data.name,
          price : $data.price,
          printer : $data.printerID,
          menu : $data.menuID,
          menu_group : $data.menuGroupID,
          plu : $data.plu,
          description : $data.description,
          type : $data.articleType,
          taxable : $data.taxable,
          tax : $data.taxID,
          created_on : created_on
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

    return new ManualItems;
  }
})();