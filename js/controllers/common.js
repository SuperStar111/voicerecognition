angular.module('soft').controller('generic_prompt_instance', function($scope, $modalInstance, message, $modal, $cookieStore, $location) {

  $scope.message = message;
  $scope.validPattern = /^\d*\.?\d*$/;

  $scope.ok = function() {
    if ($scope.validPattern.test($scope.prompt_input))
      $modalInstance.close($scope.prompt_input);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.hit_enter = function(event) {
    if (event.keyCode == 13) {
      $scope.ok();
    }
  };

  $scope.invalid = function() {
    console.log($scope.prompt_input);
    return (!$scope.validPattern.test($scope.prompt_input));
  };

});