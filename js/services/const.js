;
(function() {
  'use strict';

  angular.module('soft')
    .constant("apiURL", API)
    .constant("siteURL", DOMAIN + '/')
    .constant('ENV', 'PRODUCTION') // PRODUCTION, DEVELOPMENT
    ;

})();