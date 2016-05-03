;
(function() {

  angular.module('soft').service('indexedDBService', function($window, $q) {
    var DBNAME = "softpoint";
    var tables = [ 'countries', 'employees', 'globalModifiers', 'menus', 'payments', 'sections', 'tables' ];

    $window.countriesFields = [ {
      name : "country_id",
      unique : true
    } ];
    
    $window.paymentsFields = [{
      name : "id",
      unique : true
    }, {
      name : "type",
      unique : true
    }];

    // prefixes of implementation that we want to test
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    // prefixes of window.IDB objects
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    if (!window.indexedDB) {
      window.console.log("Your browser doesn't support a stable version of IndexedDB.");
    }

    var indexedDB = $window.indexedDB;

    var self = this;
    self.db = null;
    var lastIndex = 0;

    self.open = open;
    self.createtable = createtable;
    self.add = add;
    self.getAll = getAll;
    self.create = create;
    self.getById = getById;
    self.createbatch = createbatch;
    self.updatebyid = updatebyid;
    self.getlistbyvariablename = getlistbyvariablename;
    self.cleartable = cleartable;
    self.deleteById = deleteById;
    self.getByIndex = getByIndex;
    self.getObjectStore = getObjectStore;

    function open() {
      var deferred = $q.defer();

      if (self.db) {
        deferred.resolve();
      } else {
        var version = 9;
        
        var request;
        try {
            request = indexedDB.open(DBNAME, version);
            
            request.onupgradeneeded = function(event) {
              event.target.transaction.onerror = indexedDB.onerror;
              self.db = event.target.result;

              initialize(event);
            };

            request.onsuccess = function(event) {
              self.db = event.target.result;
              console.log('IndexedDB opened');
              deferred.resolve();
            };

            request.onerror = function() {
              deferred.reject();
            };
        } catch (e) {
            console.log(e);
        }
      }

      return deferred.promise;
    }
    ;

    function initialize(event) {
      for (i in tables) {
        if (self.db.objectStoreNames.contains(tables[i])) {
          self.db.deleteObjectStore(tables[i]);
        }

        // if no fields are provide, then using id as default keyPath
        var indexFields = null;
        if (!!$window[tables[i] + 'Fields']) {
          indexFields = eval(tables[i] + 'Fields');
        } else {
          indexFields = [ {
            name : "id",
            unique : true,
            autoIncrement:true
          } ];
        }

        createtable(event, tables[i], indexFields);
      }

    }

    function createtable(event, tablename, fields, overrideKeyPath) {
      console.log("Start createtable " + Date.now());
      self.db = event.target.result;

      if (!!overrideKeyPath) {
        objectStore = self.db.createObjectStore(tablename, overrideKeyPath);
      } else {
        objectStore = self.db.createObjectStore(tablename, {
          keyPath : "id"
        });
      }

      for (i in fields) {
        if (!!fields[i].fields) {
          objectStore.createIndex(fields[i]['name'], fields[i].fields, {
            unique : fields[i]['unique']
          });
        } else {
          objectStore.createIndex(fields[i]['name'], fields[i]['name'], {
            unique : fields[i]['unique']
          });
        }
      }

      console.log("Stop createtable " + Date.now());
    }

    function getObjectStore(tablename, mode) {
      mode = mode || 'readonly';
      transaction = self.db.transaction(tablename, mode);
      return transaction.objectStore(tablename);
    }

    function getAll(tablename) {
      var deferred = $q.defer();

      if (self.db === null) {
        deferred.reject("IndexDB is not opened yet!");
      } else {
        objectStore = getObjectStore(tablename, "readonly");
        var todos = [];

        // Get everything in the objectStore;
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = objectStore.openCursor(keyRange);

        cursorRequest.onsuccess = function(event) {
          var result = event.target.result;
          if (result === null || result === undefined) {
            deferred.resolve(todos);
          } else {
            todos.push(result.value);
            if (result.value.id > lastIndex) {
              lastIndex = result.value.id;
            }

            result.continue();
          }
        };

        cursorRequest.onerror = function(event) {
          console.log(event.value);
          deferred.reject("Something went wrong!!!");
        };
      }

      return deferred.promise;
    }
    ;

    function deleteById(tablename, id) {
      var deferred = $q.defer();

      if (self.db === null) {
        deferred.reject("IndexDB is not opened yet!");
      } else {
        objectStore = getObjectStore(tablename, "readwrite");

        var request = objectStore.delete(id);

        request.onsuccess = function(event) {
          deferred.resolve();
        };

        request.onerror = function(event) {
          console.log(event.value);
          deferred.reject("Item couldn't be deleted");
        };
      }

      return deferred.promise;
    }
    ;

    function getById(tablename, id) {
      var deferred = $q.defer();

      if (self.db === null) {
        deferred.reject("IndexDB is not opened yet!");
      } else {
        objectStore = getObjectStore(tablename, "readonly");

        var request = objectStore.get(id);

        request.onsuccess = function(event) {
          deferred.resolve(request.result);
        };

        request.onerror = function(event) {
          console.log(event.value);
          deferred.reject("Error while getting data with ID = " + id + " in table " + tablename);
        };
      }

      return deferred.promise;
    }
    ;

    function getByIndex(tablename, index, value) {
      var deferred = $q.defer();

      if (self.db === null) {
        deferred.reject("IndexDB is not opened yet!");
      } else {
        objectStore = getObjectStore(tablename, "readonly");

        var request = objectStore.index(index).get(value);

        request.onsuccess = function(event) {
          deferred.resolve(request.result);
        };

        request.onerror = function(event) {
          console.log(event.value);
          deferred.reject("Error while getting data with " + index + " = " + value + " in table " + tablename);
        };
      }

      return deferred.promise;
    }

    function create(tablename, todoText) {
      var deferred = $q.defer();

      if (self.db === null) {
        deferred.reject("IndexDB is not opened yet!");
      } else {
        objectStore = getObjectStore(tablename, "readwrite");
        lastIndex++;
        var request = objectStore.put({
          "id" : lastIndex,
          "text" : todoText
        });

        request.onsuccess = function(event) {
          deferred.resolve();
        };

        request.onerror = function(event) {
          console.log(event.value);
          deferred.reject("Todo item couldn't be added!");
        };
      }
      return deferred.promise;
    }
    ;

    function add(tablename, object) {
      var deferred = $q.defer();

      objectStore = getObjectStore(tablename, "readwrite");
      counter = 0;

      request = objectStore.add(object);
      request.onerror = function(event) {
        deferred.reject("Can't add object");
      };

      request.onsuccess = function(event) {
        // console.log("Added " + JSON.stringify(object, null, 4));
        deferred.resolve(event.target.result);
      };

      return deferred.promise;
    }
    function createbatch(tablename, objectdatalist) {
      var deferred = $q.defer();

      for ( var index in objectdatalist) {
        objectdatalist[index].syncstatus = "0";
      }

      console.log("Start createbatch to insert datalist for " + tablename + " at " + Date.now());
      objectStore = getObjectStore(tablename, "readwrite");
      counter = 0;
      insertNext();

      function insertNext() {
        if (counter < objectdatalist.length) {
          request = objectStore.add(objectdatalist[counter]);
          request.onerror = function(event) {
            var message = "Unable to add " + JSON.stringify(objectdatalist[counter], null, 4);
            console.error(message);
            deferred.reject(message);
          };
          request.onsuccess = function(event) {
            // console.log("Added " +
            // JSON.stringify(objectdatalist[counter], null, 4));
            counter++;
            insertNext();
          };
        } else {
          console.log('Done: ' + objectdatalist.length);
          deferred.resolve();
        };
      }
      console.log("Stop createbatch " + Date.now());
      return deferred.promise;
    }

    function updatebyid(tablename, id, objectdata) {
      var deferred = $q.defer();

      console.log("Start updatebyid " + Date.now());
      objectStore = getObjectStore(tablename, "readwrite");
      request = objectStore.get(id);
      request.onerror = function(event) {
        var message = "Unable to retrieve record " + id + " from database!";

        deferred.reject(message);
      };
      request.onsuccess = function(event) {
        object = request.result;
        if (!object) {
          console.error("Data " + id + " is not found");
        } else {
          for (varkey in objectdata) {
            object[varkey] = objectdata[varkey];
          }
          requestUpdate = objectStore.put(object);
          requestUpdate.onerror = function(event) {
            var message = "Record " + id + " couldn't be updated!";
            console.error(message);
            deferred.reject(message);
          };
          requestUpdate.onsuccess = function(event) {
            console.log("Record " + id + " is updated!");
            deferred.resolve();
          };
        };
      };
      console.log("Stop updatebyid " + Date.now());
      return deferred.promise;
    }

    function getlistbyvariablename(tablename, variablename, variablevalue) {
      var deferred = $q.defer();

      console.log("Start getlistbyvariablename " + Date.now());
      objectStore = getObjectStore(tablename);
      singleKeyRange = IDBKeyRange.only(variablevalue);
      request = objectStore.index(variablename).openCursor(singleKeyRange);
      objectlist = [];

      request.onsuccess = function(event) {
        cursor = event.target.result;
        objectlist = [];
        if (cursor) {
          objectlist.push(cursor.value);
          console.log(JSON.stringify(cursor.value, null, 4));
          cursor.continue();
        } else {
          console.log("No more entries!");
          deferred.resolve(objectlist);
        }

      };
      console.log("Stop getlistbyvariablename " + Date.now());

      return deferred.promise;
    }

    function cleartable(tablename) {
      var deferred = $q.defer();

      console.log("Start cleartable " + Date.now());
      var objectStore = getObjectStore(tablename, 'readwrite');
      var request = objectStore.clear();
      request.onsuccess = function(event) {
        console.log("Store cleared");
        deferred.resolve();
      };
      request.onerror = function(event) {
        console.error("Store clear error", JSON.stringify(event.target.errorCode, null, 4));
        deferred.reject("Store clear error");
      };
      console.log("Stop cleartable " + Date.now());

      return deferred.promise;
    };
  });
})();