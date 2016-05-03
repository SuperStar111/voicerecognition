;
(function() {
  angular.module('soft').service('Service.Tables', Tables);

  function Tables($q, indexedDBService) {
    var fn = function() {
      var self = this;

      self.syncFromServer = syncFromServer;
      self.getAll = getAll;
      self.getById = getById;

      function syncFromServer(entities) {
        var deferred = $q.defer();

        indexedDBService.cleartable('tables').then(function() {
          indexedDBService.createbatch('tables', entities).then(function() {

            deferred.resolve();

          }, function() {
            deferred.resolve();
          });

        }, function() {
          deferred.reject('Can\'t clear table tables');
        });

        return deferred.promise;
      }

      function getAll() {
        var deferred = $q.defer();

        indexedDBService.getAll('tables').then(function(tables) {
          deferred.resolve(tables);
        }, function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }

      function getById(id) {
        var deferred = $q.defer();

        indexedDBService.getById('tables', id + "").then(function(table) {

          deferred.resolve(table);
        }, function(err) {
          console.log(err);
        });

        return deferred.promise;
      }

    };

    return new fn();
  }

  Tables.$inject = [ '$q', 'indexedDBService' ];
})();