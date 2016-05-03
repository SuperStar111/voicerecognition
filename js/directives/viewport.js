;
(function() {
  'use strict';

  angular.module('soft').directive('viewport', Viewport);

  Viewport.$inject = [];
  function Viewport() {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        var maxWidth = attrs.maxWidth; // Max width for the image
        var maxHeight = attrs.maxHeight; // Max height for the image

        element.bind('load', function() {
          element.css('opacity', 1);

          var ratio = 1; // Used for aspect ratio

          var width = element.width(); // Current image width
          var height = element.height(); // Current image height
          // Check if the current width is larger than the max
          if (width > maxWidth) {
            ratio = maxWidth / width; // get ratio for scaling image
            element.css("width", maxWidth); // Set new width
            element.css("height", height * ratio); // Scale
            // height
            // based on ratio
            height = height * ratio; // Reset height to match scaled
            // image
            width = width * ratio; // Reset width to match scaled image
          }

          // Check if current height is larger than max
          if (height > maxHeight) {
            ratio = maxHeight / height; // get ratio for scaling image
            element.css("height", maxHeight); // Set new height
            element.css("width", width * ratio); // Scale width
            // based
            // on ratio
            width = width * ratio; // Reset width to match scaled image
          }
        });

      }
    };
  }
})();