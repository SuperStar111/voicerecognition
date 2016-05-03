;
(function() {
  'use strict';

  angular.module('soft').service('Service.CustomModifier', CustomModifier);

  CustomModifier.$inject = [];
  function CustomModifier() {
    var CustomModifier = function() {
      var self = angular.extend(this, new BaseObject(object));

      self.modifier = null;
    };

    return new CustomModifier();
  }
})();