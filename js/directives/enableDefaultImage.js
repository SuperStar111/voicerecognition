;
(function() {
  'use strict';

  angular.module('soft').directive('enableDefaultImage', function($http, siteURL) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        // element.src = siteURL + 'images/avatar2.png';
        attrs.$observe('ngSrc', function(ngSrc) {
          $http.get(ngSrc).success(function() {

          }).error(function() {
            element.attr('src', 'images/avatar2.png');
          });
        });
      }
    };

  });
})();
