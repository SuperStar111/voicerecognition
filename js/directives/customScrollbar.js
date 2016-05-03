;
(function() {
  'use strict';

  angular.module('soft').directive('customScrollbar', CustomScrollbar);

  function CustomScrollbar() {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        var options = {
          scrollInertia : 100,
          scrollEasing : "easeOutCirc",
          setHeight : true,
          scrollButtons : {
            enable : true,
            scrollAmount : 100
          },
          contentTouchScroll: true,
          live : true,
          mouseWheelPixels: 20,
          advanced : {
            updateOnBrowserResize : true,
            updateOnContentResize : true
          },
          theme: '3d-thick'
        };

        if (attrs.alwaysShowScrollbar === "true") {
          options.alwaysShowScrollbar = 2;
        }

        $(element).mCustomScrollbar(options);
      }
    };
  }
})();