;
(function() {
  'use strict';

  angular.module('soft').controller('SoftLayoutController', SoftLayoutController);

  SoftLayoutController.$inject = [ '$stateParams', '$scope', '$rootScope' ];
  function SoftLayoutController($stateParams, $scope, $rootScope) {
    var self = this;

    self.sectionID = $stateParams.sectionID;

    $rootScope.open_modal = function(identifier) {
      console.log(identifier);
      var modal_content = $('#layout-wrapper').find("div[data-identifier='" + identifier + "']").find('.check-icon-inner').clone(false);
      $('#fl-popup-modal .modal-dialog .modal-content .modal-body').html(modal_content);
      $('#fl-popup-modal').modal('show');
    };
  }
})();