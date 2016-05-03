;
(function() {
  angular.module('soft').service('Service.Countries', Countries);

  function Countries($q, indexedDBService) {
    var fn = function() {
      var self = this;

      self.syncFromServer = syncFromServer;
      self.getById = getById;
      self.loadStatesByCountryId = loadStatesByCountryId;

      function syncFromServer(entities) {
        var deferred = $q.defer();

        indexedDBService.cleartable('countries').then(function() {
          indexedDBService.createbatch('countries', entities).then(function() {

            deferred.resolve();

          }, function() {
            deferred.resolve();
          });

        }, function() {
          deferred.reject('Can\'t clear table countries');
        });

        return deferred.promise;
      }

      function getById(id) {
        var deferred = $q.defer();

        indexedDBService.getById('countries', id + "").then(function(country) {

          deferred.resolve(country);
        }, function(err) {
          console.log(err);
        });

        return deferred.promise;
      }

      function loadStatesByCountryId(id) {
        var deferred = $q.defer();

        var states = [];

        getById(id).then(function(country) {
          if (country && country.states) {
            angular.forEach(country.states, function(value, key) {
              states.push({
                id : value.state_id,
                name : value.state_name
              });
            });

            deferred.resolve(states);
          } else {
            deferred.reject();
          }
        });

        return deferred.promise;
      }

    };

    return new fn();
  }

  Countries.$inject = [ '$q', 'indexedDBService' ];
})();