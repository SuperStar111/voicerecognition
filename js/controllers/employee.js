var listmesssage_timerId = 0;
var isDebug = true;
var created_on = "POSPoint Browser";
var loadpos;
var pos = 0;
var pass_val = "";
var d = new Date();
var loadedemp = false;
var jm4r = true;
var wHeight;
var wwidth;
var bx;
var globalTabsMenu;
var criouwebcam = false;

// cam
var webcam = '';
var params;
var allowed = false;// set to true upon user selecting allow on camera dialog
var webcamload = false;// set to true upon user selecting allow on camera
// dialog
var webcamactivity = false;// set to true upon user selecting allow on camera
// dialog
var ctx;
var canvas;
var video;
var localMediaStream;
var meslist;
var my_employee;
var my_location;
var my_emp_id;
// var punch_diag_modalInstance;

var sac = '';
// var sac2 = '';
var sacoo2 = '';
var noread_msg = 0;
var tamanho1 = '';
var tamanho2 = '';
var tamanho3 = '';
var continu = '';
var readdd = '';
var claname = '';
var nametep = '';
var message_cnt = 0;
var con = 0;
var cnt = 1;
var lastpagao = '';

// Not used
function on_allowed() {
  allowed = true;// user clicked allow
  webcamactivity = true;
} // on_allowed

// Not used
function on_load() {
  webcamactivity = true;
  webcamload = true;// user clicked allow
} // on_load

/**
 * on_activity
 */
function on_activity() {
  webcamactivity = true;// user clicked allow
} // on_activity

;
(function() {
  'use strict';

  angular.module('soft').controller('EmployeeController', EmployeeController);

  EmployeeController.$inject = [ '$scope', '$rootScope', 'Employees', 'LoginSession', '$timeout', '$modal', 'PunchImage', 'Modals', 'EmployeeMessages',
    'EmployeeMessage', '$cookieStore' ];
  function EmployeeController($scope, $rootScope, Employees, LoginSession, $timeout, $modal, PunchImage, Modals, EmployeeMessages, EmployeeMessage, $cookieStore) {
    var self = this;

    self.loginSessions = [];
    self.processingLoginSession = false;
    self.employees = [];
    self.messages = [];
    self.showingMessage = null;
    self.compose = {};
    self.reply = {};

    self.messageBox = {
      isState : function(state) {
        return state == self.messageBox.state;
      },
      state : 'initialize',
      setState : function(state) {
        self.messageBox.state = state;
      }
    };

    self.punchDialog = punchDialog;
    self.showPunchDialog = showPunchDialog;
    self.sendMessage = sendMessage;
    self.sendReply = sendReply;
    self.composeBox = composeBox;
    self.showMessage = showMessage;

    init();

    $scope.$on('Image Punched', function() {
      self.loginSessions = [];

      loadLoginSessions();
    });

    function init() {
      loadLoginSessions();

      loadEmployeeMessages();
    }

    function loadLoginSessions() {
      loadedemp = false;
      webcam = '';
      params;
      allowed = false; // set to true upon user selecting allow on camera
      // dialog
      webcamload = false; // set to true upon user selecting allow on camera
      // dialog
      webcamactivity = false; // set to true upon user selecting allow on camera
      // dialog

      self.processingLoginSession = true;
      Employees.getProfile().then(function(result) {

        self.processingLoginSession = false;
        self.employee = result[0];

        angular.forEach(result[1], function(value, key) {
          var session = new LoginSession(value);
          
          self.loginSessions.push(session);

          $timeout(function() {
            resize();
          });
        });

      }, function(err) {
        console.log(err);
      });
    }

    function loadEmployeeMessages() {

      EmployeeMessages.getMessages().then(function(result) {
        // reset
        self.messages = [];
        $rootScope.$broadcast('Messages Loaded', {
          messageCount : result.messages.length
        });

        for ( var idx in result.messages) {
          var message = new EmployeeMessage(result.messages[idx]);
          self.messages.push(message);
        }

        self.employees = [];
        for ( var idx in result.employees) {
          if (result.employees[idx].emp_id == $cookieStore.get('empid')) {
            continue;
          }

          var employee = result.employees[idx];
          self.employees.push(employee);
        }

      },
      // fails
      function(err) {
        console.log(err);
      });
    }

    function punchDialog() {
      PunchImage.checkPunchStatus().then(function(data) {
        if (data.has_open_orders === true) {
          Modals.alert('You currently have ' + data.no_of_orders + ' opened check(s). Please close all of your checks before Punching Out.');
        } else {
          if (data.ResponseCode === "9") {
            Modals.alert(data.ResponseMessage);
          } else {
            self.showPunchDialog();
          }
        }
      },
      // fails
      function() {

      });
    }

    function showPunchDialog() {
      PunchImage.showForm();
    }

    function sendMessage($event) {
      $event.preventDefault();

      if (!self.compose.employee) {
        Modals.alert("Please select an employee.");
      } else if (!self.compose.text) {
        Modals.alert("Please enter message.");
      } else {
        EmployeeMessages.compose(self.compose).then(function(result) {
          // clean up
          self.compose = {};

          // alert
          Modals.alert('Message sent successfully.');

          // reload messages???
          loadEmployeeMessages();

          // show initialize
          self.messageBox.setState('initialize');
        }, function(err) {
          console.log(err);
        });
      }
    }
    ;

    function sendReply($event) {
      $event.preventDefault();

      self.reply.employee = {
        emp_id : self.showingMessage.get('emp_id'),
        employee_id : self.showingMessage.get('employee_id')
      };

      if (!self.reply.text) {
        Modals.alert("Please enter message.");
      } else {
        EmployeeMessages.compose(self.reply).then(function(result) {
          // clean up
          self.reply = {};
          self.showingMessage = null;

          // alert
          Modals.alert('Message sent successfully.');

          // reload messages???
          loadEmployeeMessages();

          // show initialize
          self.messageBox.setState('initialize');
        }, function(err) {
          console.log(err);
        });
      }
    }

    function composeBox() {
      self.messageBox.state = 'compose';
      self.compose = {};
      self.messageText = '';

    }

    function showMessage(message) {
      self.messageBox.state = 'reply';
      self.showingMessage = message;

      // message.set('isRead', true);
      // mark message as read
      EmployeeMessages.markAsRead(message.get('id')).then(function(result) {
        loadEmployeeMessages();
      },
      // fails
      function(err) {
        console.log(err);
      });
    }

    $scope.$watch('$viewContentLoaded', function() {
      $(window).resize(function() {
        resize();
      });

      resize();
    });

    function resize() {
      // In the future determin exactly what needs to be resized.
      var wHeight = $(window).height();
      $(".spanEntry").css({
        "height" : wHeight - 438 + "px"
      });

    }
  }
})();