;
(function() {
  'use strict';

  angular.module('soft').directive('loginImage', LoginImage);

  function LoginImage() {
    return {
      restrict : 'A',
      scope : {
        info : '=info'
      },
      controller : Controller,
      link : function(scope, element, attrs, controller) {
        scope.$watch('info', function() {
          if (scope.info) {
            var title, image;

            element.addClass('camimgsmall');

            if (attrs.type.toUpperCase() == 'IN') {
              title = [ scope.info.datein, scope.info.timein, 'In Punch' ].join(' - ');

              image = scope.info.image_in;

              if (image !== "") {
                element.attr('src', 'images/cam_icon.png');
                if (scope.info.manual_in === 'edit') {
                  element.attr('src', 'images/manual_icon.png');
                }
              } else {
                image = "images/photo.png";
              }

              if (scope.info.modified_in_on === "TA Manager") {
                element.addClass('left');
                element.attr('src', 'images/manual_icon.png');
              }

              element.bind('click', function() {
                controller.openPunchImageDialog(title, image);
              });

            } else if (attrs.type.toUpperCase() == 'OUT') {
              title = [ scope.info.dateout, scope.info.timeout, 'Out Punch' ].join(' - ');

              image = scope.info.image_out;

              if (image !== "") {
                element.attr('src', 'images/cam_icon.png');
                if (scope.info.manual_in === 'edit') {
                  element.attr('src', 'images/manual_icon.png');
                }

                element.bind('click', function() {
                  controller.openPunchImageDialog(title, image);
                });
              } else {
                image = "images/photo.png";
              }

              if (scope.info.modified_in_on === "TA Manager") {
                element.addClass('left');
                element.attr('src', 'images/manual_icon.png');
                element.unbind('click');
              }
            } else if (attrs.type.toUpperCase() == 'MANUAL_IN') {
              var imin = scope.info.manual_in;
              if ((imin === null) || (imin === '') || (imin === 'add')) {

              } else if (imin === 'edit') {
                if (scope.info.image_in === '') {
                  element.attr('src', 'images/manual_icon.png');
                }
              } else {
                element.attr('src', 'images/attendance/' + imin + '.png');
                element.addClass('left');
              }
            } else if (attrs.type.toUpperCase() == 'MANUAL_OUT') {
              var imin = scope.info.manual_out;
              if ((imin === null) || (imin === '') || (imin === 'add')) {

              } else if (imin === 'edit') {
                if (scope.info.image_out === '') {
                  element.attr('src', 'images/manual_icon.png');
                  element.addClass('left');
                  // var st = "-3px";
                }
              } else {
                element.attr('src', 'images/attendance/' + imin + '.png');
                element.addClass('left');
              }
            }
          }
        });
      }
    };
  }

  Controller.$inject = [ '$modal' ];
  function Controller($modal) {
    var self = this;

    self.openPunchImageDialog = openPunchImageDialog;

    function openPunchImageDialog(title, img) {
      var modalInstance = $modal.open({
        templateUrl : 'templates/partials/punch-image-dialog.html',
        controller : PunchImageController,
        resolve : {
          title : function() {
            return title;
          },
          image : function() {
            return img;
          }
        }
      });

      modalInstance.opened.then(function() {

      });

    }

    PunchImageController.$inject = [ '$scope', 'title', 'image', '$modalInstance' ];
    function PunchImageController($scope, title, image, $modalInstance) {
      var self = this;

      $scope.title = title;
      $scope.image = image;

      self.close = function(callback) {
        $modalInstance.dismiss('cancel');

        if (typeof callback == "function") {
          callback();
        }
      };

      $scope.$watch('$viewContentLoaded', function() {
        $(window).resize(function() {
          // resize();
        });
      });

      $scope.popup = self;
    }
  }
})();