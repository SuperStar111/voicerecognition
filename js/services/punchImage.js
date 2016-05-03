;
(function() {
  'use strict';

  angular.module('soft').service('PunchImage', PunchImage);

  PunchImage.$inject = [ '$q', '$http', 'apiURL', '$cookieStore', '$modal', '$timeout', 'Modals', '$rootScope' ];
  function PunchImage($q, $http, apiURL, $cookieStore, $modal, $timeout, Modals, $rootScope) {
    var PunchImage = function() {
      var self = this;

      self.punch = punch;
      self.checkPunchStatus = checkPunchStatus;
      self.showForm = showForm;

      function punch() {
        var deferred = $q.defer();

        var s = '';
        if (hasGetUserMedia() === false) {
          s = $("#webcam").get(0).SC_getFrameAsBase64();
        } else {
          if (localMediaStream) {
            ctx.drawImage(video, 0, 0);
            s = canvas.toDataURL("image/jpeg");

            s = s.split(",");
            s = s[1];
          }
        }

        if (webcam.loaded && allowed) {
          webcam.snap();
          deferred.resolve('Snaped');

        } else {

          if (webcamload) {
            console.log('Will try to use webcamload');
            deferred.reject('Will try to use webcamload');
          } else {

            var url = apiURL + 'api/POSPoint2/employee_punch.php?&';
            var data = {
              token : generatetoken(),
              location_id : $cookieStore.get("location"),
              created_on : created_on,
              emp_id : $cookieStore.get("empid")
            };
            url = url + $.param(data);

            var options = {
              method : 'POST',
              url : url,
              headers : {
                'Content-type' : 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/javascript, */*; q=0.01'
              },
              data : 'image=' + encodeURIComponent(s)
            };
            
            $rootScope.myPromise = $http(options).success(function(result) {
              deferred.resolve(result);
            }).error(function(err) {
              deferred.reject(err);
            });
          }
        }

        return deferred.promise;
      }

      function checkPunchStatus() {
        var deferred = $q.defer();
        var url = apiURL + 'api/pospoint2/employee_check_punch.php?';

        var data = {
          token : generatetoken(),
          location_id : $cookieStore.get("location"),
          created_on : created_on,
          emp_id : $cookieStore.get("empid")
        };

        url = url + $.param(data);

        $http.get(url).success(function(result) {
          deferred.resolve(result);
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    function showForm() {
      var punch_diag_modalInstance = $modal.open({
        templateUrl : 'templates/partials/punch-image-form.html',
        controller : ShowPunchFormController,
        resolve : {
          punch : function() {
            return self.punch;
          }
        }
      });

      punch_diag_modalInstance.opened.then(function() {

        if (hasGetUserMedia()) {

          if (criouwebcam === false) {
            criouwebcam = true;

            $timeout(function() {
              video = document.querySelector("#vid");
              canvas = document.querySelector('#canvas2');
              ctx = canvas.getContext('2d');
              localMediaStream = null;

              var onCameraFail = function(e) {
                criouwebcam = false;
                console.log('Camera did not work.', e);
                Modals.alert('Please check that the camera is not being used.');
              };

              navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
              window.URL = window.URL || window.webkitURL;
              navigator.getUserMedia({
                video : true
              }, function(stream) {
                video.src = window.URL.createObjectURL(stream);
                localMediaStream = stream;
              }, onCameraFail);
            }, 1000);
          } else {
            $timeout(function() {
              video = document.querySelector("#vid");
              canvas = document.querySelector('#canvas2');
              ctx = canvas.getContext('2d');
              video.src = window.URL.createObjectURL(localMediaStream);
            }, 1000);
          }
        }
      });
    }

    ShowPunchFormController.$inject = [ '$scope', '$rootScope', '$modalInstance', 'PunchImage' ];
    function ShowPunchFormController($scope, $rootScope, $modalInstance, PunchImage) {
      var self = this;
      self.close = close;

      function close(callback) {
        $modalInstance.dismiss('cancel');

        if (typeof callback == "function") {
          callback();
        }
      }
      ;

      self.punch = function() {

        PunchImage.punch().then(function(data) {
          if (data.ResponseCode === 9) {
            Modals.alert('You have already punched within 5 min.');
          } else if (data.ResponseCode === 1) {
            // openModalDialog($modal, 'Punched Out', 'You have
            // successfully
            // punched out');
            $rootScope.$broadcast('PUNCHED OUT');
          } else if (data.ResponseCode === 0) {
            $rootScope.$broadcast('PUNCHED IN');
            // openModalDialog($modal, 'Punched In', 'You have
            // successfully
            // punched in');
          } else {
            // openModalDialog($modal, 'No Punch', 'Punch was
            // unsuccessful');
          }

          // Clear and update profile display
          // document.getElementById('timetable_info').innerHTML = "";
          $rootScope.$broadcast('Image Punched');

          self.close();

          return data.ResponseCode;
        }, function(err) {
          console.log(err);
        });
      };

      $scope.popup = self;
    }

    return new PunchImage();
  }
})();