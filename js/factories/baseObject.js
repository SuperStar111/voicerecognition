(function() {
  'use strict';

  angular.module('soft').factory('BaseObject', BaseObject);

  BaseObject.$inject = [];
  function BaseObject() {
    var BaseObject = function(object) {
      var self = this;

      if (!object) {
        object = {

        };
      }
      self.data = !!object ? object : {};
      self.checked = false;

      /**
       * Get ID of object
       */
      self.getId = function() {
        return self.get('id');
      };

      self.setId = function(id) {
        self.set('id', id);
      };

      /**
       * Get object property
       */
      self.get = function(key) {
        if (!!self.data[key]) {
          return self.data[key];
        } else if (self.data[key] === false) {
          return false;
        } else if (self.data[key] === "") {
          return "";
        } else {
          return null;
        }
      };

      /**
       * Set data for a field
       */
      self.set = function(key, value) {
        self.data[key] = value;
      };

      /**
       * Method for getting object data
       */
      self.getData = function() {
        return self.data;
      };

      /**
       * Method for setting object data
       */
      self.setData = function(data) {
        self.data = data;
        self.init();
      };

      /**
       * Validation for
       */
      self.validate = function(validation) {

      };

      /**
       * Prepare data for POST
       */
      self.preparePOSTData = function() {
        var data = {

        };
        return data;
      };

      /**
       * Simulate constructor
       */
      self.init = function() {

      };

      // init
      self.init();

    };

    return (BaseObject);
  }
})();