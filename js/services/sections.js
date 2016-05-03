;
(function() {
  angular.module('soft').service('Service.Sections', Sections);

  function Sections($q, indexedDBService) {
    var fn = function() {
      var self = this;

      self.syncFromServer = syncFromServer;
      self.getAll = getAll;

      function syncFromServer(entities) {
        var deferred = $q.defer();

        indexedDBService.cleartable('sections').then(function() {
          var parsedData = [];
          angular.forEach(entities, function(entity) {
            entity.id = entity.section_info.section_id;
          });

          indexedDBService.createbatch('sections', entities).then(function() {

            deferred.resolve();

          }, function() {
            deferred.resolve();
          });

        }, function() {
          deferred.reject('Can\'t clear table sections');
        });

        return deferred.promise;
      }

      function getAll() {
        var deferred = $q.defer();

        indexedDBService.getAll('sections').then(function(tables) {
          deferred.resolve(tables);
        }, function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    return new fn();
  }

  Sections.$inject = [ '$q', 'indexedDBService' ];
})();