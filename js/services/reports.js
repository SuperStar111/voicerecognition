;
(function() {
  'use strict';

  angular.module('soft').service('Reports', Reports);

  Reports.$inject = [ '$q', '$http', '$cookieStore', 'apiURL', '$rootScope' ];
  function Reports($q, $http, $cookieStore, apiURL, $rootScope) {
    var Reports = function() {
      var self = this;

      // definitions
      self.applyFilter = applyFilter;
      self.getReportTypeList = getReportTypeList;
      self.parse = parse;

      // implements
      function applyFilter(filterType, filters) {
        var deferred = $q.defer();

        try {
          var api = parse(filterType.api);

          var date = new Date();
          date = getApiDateFormat(date);
          var filterCriteria = {};
          filters = filters || {};

          if (api.params.indexOf('filter_from_date=') != -1) {
            filterCriteria.filter_from_date = filters.fromdate ? getApiDateFormat(filters.fromdate) : date;
          }

          if (api.params.indexOf('filter_to_date=') != -1) {
            filterCriteria.filter_to_date = filters.todate ? getApiDateFormat(filters.todate) : date;
          }

          if (api.params.indexOf('filter_date=') != -1) {
            filterCriteria.filter_date = filters.date ? getApiDateFormat(filters.date) : date;
          }
          
          if (api.params.indexOf('filter_display=') != -1 && filters.type) {
            filterCriteria.filter_display = filters.type;
          }

          if (filters.empid && api.params.indexOf('filter_emp_id=') != -1) {
            filterCriteria.filter_emp_id = filters.empid;
          }

          if (filters.search && filters.search.length > 0)
            filterCriteria.filter_search = filters.search;

          filterCriteria.location_id = $cookieStore.get("location");
          filterCriteria.token = generatetoken();

          var url = apiURL + 'api/pospoint2/reports/' + api.endpoint + '?';
          url = url + $.param(filterCriteria);

          $rootScope.myPromise = $http.get(url).success(function(result) {
            deferred.resolve(result);
          }).error(function(err) {
            deferred.reject(err);
          });
        } catch (e) {
          deferred.reject(e);
        }

        return deferred.promise;
      }

      function getApiDateFormat(date) {
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
      }

      function getReportTypeList() {
        var deferred = $q.defer();

        var url = apiURL + "api/pospoint2/reports/get_POS_report_list.php?";
        var data = {
          origin_location_id : $cookieStore.get('location'),
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

      function parse(apiUrl) {
        var api = {};

        var matches = apiUrl.match(/reports\/(.*?.php)/);

        if (matches.length > 0) {
          api.endpoint = matches[1];
        } else {
          throw 'Invalid URL';
        }

        matches = apiUrl.match(/([\w_]+)=/g);
        if (matches.length > 0) {
          api.params = matches;
        }

        return api;
      }
    };

    return new Reports();
  }
})();