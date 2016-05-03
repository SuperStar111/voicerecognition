;
(function() {
  'use strict';

  angular.module('soft').controller('CheckDetailController', CheckDetailController);

  CheckDetailController.$inject = [ 'Checks', '$stateParams', '$scope', 'Modals', '$cookieStore', '$http', '$filter', 'Check', 'Table', '$interval', 'Client', 'siteURL', '$state',
    '$rootScope', 'Clients', 'Preferences', '$timeout', 'OrderItemMenu', 'Users', 'Service.Countries' ];
  function CheckDetailController(Checks, $stateParams, $scope, Modals, $cookieStore, $http, $filter, Check, Table, $interval, Client, siteURL, $state, $rootScope, Clients,
    Preferences, $timeout, OrderItemMenu, Users, Countries) {
    var self = this;

    $rootScope.currentState = {
      name : $state.current.name,
      params : $state.params
    };

    $state.go('Checks', {}, {
      notify : false
    });

    self.location = $rootScope.location;

    self.otherPhone = false;

    if (self.location.table_dinning == "yes")
      self.currentSubTab = 'table'; // table, clock, car, pack
    else {
      self.currentSubTab = 'clock';
    }

    self.checkID = $stateParams.id;
    self.sourceOfBusiness = {
      table : 'Dine In',
      clock : 'Walk In',
      car : 'Phone',
      pack : 'Phone'
    };

    self.covers = {
      table : 2,
      clock : 0,
      car : 1,
      pack : 1
    };

    self.siteURL = siteURL;
    self.tables = [];
    self.clientPhones = [];
    self.clientAddresses = [];
    self.assignedServers = [];
    self.editing = {};
    self.validAddress = false;
    self.sourceOfBusinesses = [ 'Dine In', 'External', 'Fax', 'Mobile', 'Phone', 'Walk In', 'Website' ];
    self.orderStatuses = [ [ 'Dirty', 'Dirty' ], [ 'Ready', 'Ready' ], [ 'New', 'New' ], [ 'Menus', 'Menus' ], [ 'Ordered', 'Ordered' ], [ 'Appetizer', 'Appetizer' ],
      [ 'Entree', 'Entree' ], [ 'Dessert', 'Dessert' ], [ 'Check', 'Check' ], [ 'Receipt', 'Receipt' ], [ 'Finished', 'Finished' ], [ 'Taxi', 'Transportation - Taxi' ],
      [ 'Valet', 'Transportation - Valet' ] ];

    self.clients = new Array();

    self.showTab = showTab;
    self.selectSubTab = selectSubTab;
    self.isNewCheck = isNewCheck;
    self.isSubTab = isSubTab;
    self.isTab = isTab;
    self.showIfSubTab = showIfSubTab;
    self.searchClients = '';
    self.selectClient = selectClient;
    self.selectAddress = selectAddress;
    self.removeClient = removeClient;
    self.checkDistance = checkDistance;
    self.addPhone = addPhone;
    self.inputPhones = inputPhones;
    self.promptAddPhone = promptAddPhone;
    self.addAddress = addAddress;
    self.promptAddAddress = promptAddAddress;
    self.isTogoTimeAvailable = isTogoTimeAvailable;
    self.isDeliveryTimeAvailable = isDeliveryTimeAvailable;
    self.addClientInfo = addClientInfo;
    self.newAddresses = [];
    self.isNewAddress = isNewAddress;

    self.deliveryTime = "00:00:00";
    self.togoTime = "00:00:00";

    self.checkElapsedTime = checkElapsedTime;

    $scope.counted = 0;

    self.filterCriteria = {};
    // loadpos($http, $scope, $cookieStore, "check");
    $scope.indexCheck = 0;
    $scope.right_bloc_hide = false;

    $scope.test = 1;

    $scope.orderedItems = [];
    $scope.addedItems = [];

    $scope.scope = $scope;

    $scope.$on('$stateChangeSuccess', function() {
      self.skipCheck = false;
    });

    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if ($rootScope.appState.isState('checkDetail.cart') && !self.skipCheck) {

        var isNotEmpty = true;

        if (self.check.currentOrder()) {
          var items = self.check.currentOrder().getItemsByType();

          if (items.items.length == 0 && items.payments.length == 0 && items.modifiers.length == 0) {
            isNotEmpty = false;
          }
        }

        if (!isNotEmpty && (toState.url != "/check_detail/:id") && !$rootScope.isSendAndClose) {
          event.preventDefault();

          if ($rootScope.isSendAndClose) {
            $rootScope.isSendAndClose = false;
          }

          Modals.confirm('Would you like to cancel this check?', function() {
            Checks.cancelCheck(self.check).then(function(result) {
              self.skipCheck = true;
              $state.go(toState, toParams);
            }, function(err) {
              console.log(err);
            });

          }, function() {
            self.skipCheck = true;
            $state.go(toState, toParams);
          });
        }
      }

    });

    $scope.$on('$destroy', function() {
      // fnForceLogout();
    });

    Countries.getById(parseInt($rootScope.location.country)).then(function(country) {
      loadStates(country);

      init();
    });

    function init() {
      // load check details
      if (self.checkID) {
        Checks.getCheckDetails(self.checkID).then(function(result) {

          if (!Users.allowUpdateOtherServer) {
            if (result['check details'].order_details.assigned_server != Users.currentUser().empid) {
              Modals.alert("You are not authorized to update other server's checks.", function() {
                $state.go('Home', {}, {
                  reload : true
                });
              });
              return;
            }
          }

          self.check = new Check(result['check details']);

          Checks.currentCheck(self.check);

          if ($stateParams.tab) {

            if ($stateParams.tab == 'payment' && !self.check.currentOrder()) {
              self.check.getOrder().then(function(order) {

                self.showTab($stateParams.tab);
              }, function(err) {
                console.log(err);
              });

              return;
            }
            self.currentTab = $stateParams.tab;
            self.showTab($stateParams.tab);
            return;
          } else {
            self.currentTab = 'details';
            $rootScope.appState.setState('checkDetail.details');

            // show or not show the preview

          }

          // tables
          for ( var idx in result.tables) {
            var table = new Table(result.tables[idx]);
            self.tables.push(table);

            if (table.getId() == self.check.table()) {
              self.hostess_status = table.get('hostess_status');
            }

            if ($rootScope.tmpTableId && table.getId() == $rootScope.tmpTableId) {
              self.check.table($rootScope.tmpTableId);
              $rootScope.tmpTableId = null;
            }
          }

          self.assignedServers = result.employees;
          var empid = $cookieStore.get('empid');

          var assignedServer = self.check.assignedServer();
          if (assignedServer == "null" || !assignedServer) {
            for ( var idx in self.assignedServers) {
              if (empid == self.assignedServers[idx].emp_id) {
                self.check.assignedServer(self.assignedServers[idx].emp_id);
                break;
              }
            }
          } else {
            var empPunched = false;
            for ( var idx in self.assignedServers) {
              if (assignedServer == self.assignedServers[idx].emp_id) {
                empPunched = true;
                break;
              }
            }

            if (!empPunched) {
              self.check.assignedServer('');
            }
          }

          if ($rootScope.createTogoCheck) {
            $rootScope.createTogoCheck = false;
            self.selectSubTab('pack');
          } else {
            self.selectSubTab(self.check.deliveryType, true);
          }

          if (self.check.sourceOfBusiness()) {
            self.sourceOfBusiness[self.currentSubTab] = self.check.sourceOfBusiness();
          }
          if (self.check.covers()) {
            self.covers[self.currentSubTab] = self.check.covers();
          }

          if (self.check.delivery().zipcode() == 0) {
            self.check.delivery().zipcode('');
          }

          var ready = '';
          if (self.check.delivery().time() == "00:00:00") {
            var _startTime = self.check.startTime().replace(/\-/g, '/');

            var date = new Date(_startTime);

            ready = new Date(date.getTime() + 30 * 60000);

            self.deliveryTime = $filter('date')(ready, 'hh:mm a');
          } else {
            self.deliveryTime = formatTime(self.check.delivery().time());
          }

          if (self.check.togoTime() == "00:00:00") {
            if (!ready) {
              var _startTime = self.check.startTime().replace(/\-/g, '/');

              var date = new Date(_startTime);

              ready = new Date(date.getTime() + 30 * 60000);
            }

            self.togoTime = $filter('date')(ready, 'hh:mm a');

          } else {
            self.togoTime = formatTime(self.check.togoTime());
          }

          if (self.check.selectedClients().length == 0) {
            if (self.check.get('order_details').name) {
              self.searchClients = self.check.get('order_details').name;
            }
            
            loadClientState();
          } else {
            var client = self.check.selectedClients()[0];
            self.check.removeClient(client);

            // FIXME: small trick for getting full client info
            var defaultAddress = {
              address : self.check.delivery().address(),
              zip : self.check.delivery().zipcode(),
              city : self.check.delivery().city(),
              state_id : self.check.delivery().state_id(),
              country_id : client.get('country_id'),
            };
            var defaultPhone = self.check.delivery().phone();

            var address = self.check.delivery().address('');
            var phone = self.check.delivery().phone('');
            var city = self.check.delivery().city('');
            var zipcode = self.check.delivery().zipcode('');

            selectClient(client, defaultAddress, defaultPhone);

            Countries.getById(parseInt(self.check.selectedClients()[0].country().id)).then(function(country) {
              loadStates(country);
              
              loadClientState();
            });
          }
          

          if (self.check.delivery().phone()) {
            self.clientPhones.push({
              number : self.check.delivery().phone()
            });
          }

          if (self.check.delivery().address()) {
            self.clientAddresses.push({
              address : self.check.delivery().address()
            });
          }

          $scope.$watch(function() {
            return self.check.table();
          }, function() {
            for ( var idx in self.tables) {
              var table = self.tables[idx];

              if (table.getId() == self.check.table()) {
                self.hostess_status = table.get('hostess_status');
              }
            }
          });

        }, function(err) {
          console.log(err);
        });

        // Load countries

      } else {
        console.log('what to do');
      }

    }

    function loadClientState() {
      if (!self.check.delivery().state()) {
        if (self.states && self.states.length > 0) {
          self.check.delivery().state(self.location.state);
        }

      } else {
        for ( var idx in self.states) {
          if (self.states[idx].name == self.check.delivery().state()) {
            self.check.delivery().state(self.states[idx].id);
            break;
          }
        }
      }
    }

    function isNewCheck() {
      return $rootScope.newCheckID == self.check.getId();
    }

    function loadStates(country) {

      self.country = country;
      self.states = [];
      if (country && country.states) {
        angular.forEach(country.states, function(value, key) {
          self.states.push({
            id : value.state_id,
            name : value.state_name
          });
        });
      }
    }

    function to24HourString(val) {
      var parts = val.match(/([\d]{2})\:([\d]{2}) (AM|PM)/);

      var hour = parseInt(parts[1]);
      if (parts[3].toUpperCase() == "PM") {
        hour += 12;
      }

      if (hour <= 9) {
        parts[1] = "0" + hour;
      } else {
        parts[1] = "" + hour;
      }

      var out = [ parts[1], parts[2], '00' ].join(':');
      return out;
    }
    function formatTime(timeString) {
      var a = 'AM';
      var parts = timeString.split(':');
      var hour = parseInt(parts[0]);
      if (hour >= 12) {
        hour -= 12;
        a = 'PM';
      }

      if (hour <= 9) {
        parts[0] = "0" + hour;
      } else {
        parts[0] = "" + hour;
      }
      return [ parts[0], parts[1] ].join(':') + ' ' + a;
    }
    /**
     * Set current tab
     */
    function showTab(tab) {
      if (tab == 'payment') {
        var items = new Array();

        if (self.check.currentOrder()) {
          items = self.check.currentOrder().getItemsByType()['items'];
        }

        if (items.length == 0) {
          Modals.alert('Please add item(s) to the check before proceeding to payment tab.');

          self.showTab('cart');
          return;
        }

        if (!self.check.currentOrder()) {
          self.check.getOrder().then(function(order) {
            self.showTab(tab);
          }, function(err) {
            console.log(err);
          });

          return;
        }
      }

      if (self.currentTab == 'details') {
        if ([ 'cart', 'payment' ].indexOf(tab) != -1) {

          to24HourString(self.deliveryTime);
          self.check.delivery().time(to24HourString(self.deliveryTime));
          self.check.togoTime(to24HourString(self.togoTime));
          self.check.sourceOfBusiness(self.sourceOfBusiness[self.currentSubTab]);
          self.check.covers(self.covers[self.currentSubTab]);
          self.check.hostessStatus(self.hostess_status);

          if (self.check.selectedClients().length == 0 && self.searchClients && (self.isSubTab('car') || self.isSubTab('pack'))) {
            var clientInfo = {
              name : self.searchClients,
              country : self.country.country_id
            };

            if (self.check.delivery().phone())
              clientInfo.phone = self.check.delivery().phone();

            if (self.check.delivery().address())
              clientInfo.address = self.check.delivery().address();

            if (self.check.delivery().address2())
              clientInfo.address2 = self.check.delivery().address2();

            if (self.check.delivery().city())
              clientInfo.city = self.check.delivery().city();

            if (self.check.delivery().state())
              clientInfo.state = self.check.delivery().state();

            if (self.check.delivery().zipcode())
              clientInfo.zip = self.check.delivery().zipcode();

            if ((self.isSubTab('car') && clientInfo.phone && clientInfo.address && clientInfo.city && clientInfo.state && clientInfo.zip)
              || (self.isSubTab('pack') && clientInfo.phone)) {
              // create client
              checkDistance(function(response) {
                Clients.addClient(clientInfo).then(function(result) {
                  if (result.ResponseCode == 1) {
                    var data = {
                      client_id : result.client_id,
                      client_name : self.searchClients,
                      client_first_name : self.searchClients
                    };

                    var client = new Client(data);
                    self.selectClient(client);
                    try {
                      self.check.validate();

                      saveOrder(function() {
                        self.currentTab = tab;
                      });
                    } catch (e) {
                      Modals.alert(e);
                      console.log(e);
                      // self.showTab('details');
                      return;
                    }
                  } else {
                    // fails
                    Modals.alert(result.ResponseMessage);
                    console.log(result);
                  }

                  console.log(result);
                }, function(err) {
                  // error
                  if (self.error)
                    Modals.alert(self.error.message);
                  else
                    Modals.alert('Please check your delivery address.');
                });
              }, function(err) {
                if (self.error)
                  Modals.alert(self.error.message);
                else
                  Modals.alert('Please check your delivery information.');
              });

            } else {
              Modals.alert("Please fill in all client delivery information in order to proceed.");
              return;
            }
          } else {
            try {
              self.check.validate();

              checkDistanceAndSave(tab);
            } catch (e) {
              Modals.alert(e);
              console.log(e);
              // self.showTab('details');
              return;
            }
          }

        }
      } else {
        if ([ 'details' ].indexOf(tab) != -1) {
          $state.go('CheckDetail', {
            id : self.checkID
          });
        } else {
          self.currentTab = tab;
        }

      }

      $rootScope.appState.setState('checkDetail.' + tab);

    }

    function checkDistanceAndSave(tab) {
      if (self.isSubTab('car')) {
        checkDistance(function() {
          saveOrder(function() {
            self.currentTab = tab;
          });

        }, function() {
          // error
          if (self.error)
            Modals.alert(self.error.message);
          else
            Modals.alert('Please check your delivery address');
        });

        return;
      } else {
        saveOrder(function() {
          self.currentTab = tab;
        });
      }
    }

    function saveOrder(success, error) {
      if (self.isSubTab('clock')) {
        self.check.covers(1);
      }

      self.check.clientName = self.searchClients;

      if (self.check.selectedClients().length > 0 && self.isSubTab('car')) {
        Clients.addAddress(self.check.selectedClients()[0].getId(), self.check.delivery().address(), self.check.delivery().address2(), self.check.delivery().city(),
          self.check.delivery().state(), self.country.country_id, self.check.delivery().zipcode()).then(function(result) {
          if (result.ResponseCode == 1) {
            if (typeof success == 'function') {
              Checks.updateCheckDetail(self.check).then(function(result) {
                $rootScope.newCheckID = null;

                Checks.currentCheck().getOrder();

                success(result);
              }, function(err) {
                console.log(err);
              });

            }
          } else {
            // skip these message
            if (result.ResponseMessage == 'Address already in use.') {
              Checks.updateCheckDetail(self.check).then(function(result) {
                $rootScope.newCheckID = null;

                // Checks.currentCheck().getOrder().then(function(order) {
                success(result);
                // });

              }, function(err) {
                console.log(err);
              });

            } else {
              Modals.alert(result.ResponseMessage);
              if (typeof error == 'function') {
                error(result);
              }
            }

            // Modals.alert(result.ResponseMessage);
          }
        });
      } else {
        Checks.updateCheckDetail(self.check).then(function(result) {
          // Modals.alert(result.ResponseMessage);
          $rootScope.newCheckID = null;

          // Checks.currentCheck().getOrder().then(function(order) {
          success(result);
          // });
        }, function(err) {
          console.log(err);
        });
      }

    }
    function isTab(tab) {
      return self.currentTab == tab;
    }

    function selectSubTab(subTab, noConfirm) {
      var check = Checks.currentCheck();
      if (check.isClosed() && !noConfirm) {
        Modals.alert("Details for a Closed check can not be modified.");
        return;
      }

      if (!self.check) {
        return;
      }

      if (!noConfirm && $rootScope.newCheckID != self.check.getId()) {
        Modals.confirm('Are you sure you change the type of order?', function() {
          self.currentSubTab = subTab;

          self.check.deliveryType = subTab;
        });

      } else {
        self.currentSubTab = subTab;

        self.check.deliveryType = subTab;
      }

    }

    function isSubTab(subtab) {
      return self.currentSubTab == subtab;
    }

    function showIfSubTab(tabs) {
      return (tabs.indexOf(self.currentSubTab) != -1);
    }

    function promptAddPhone() {
      Modals.prompt({
        title : "Enter Phone",
        placeholder : "Enter Phone"
      }, function(number) {

        addPhone(number);
      });
    }

    function addPhone(number) {
      if (!number)
        return;

      if (self.check.selectedClients().length > 0) {
        Clients.addPhone(self.check.selectedClients()[0].getId(), number).then(function(result) {
          if (result.ResponseCode == 1) {
            // add phone
            self.clientPhones.push({
              number : number
            });

            self.check.delivery().phone(number);
          } else {
            Modals.alert(result.ResponseMessage);
          }
        });
      }
    }

    function promptAddAddress() {
      Modals.prompt({
        title : "Enter Address",
        placeholder : "Enter Address"
      }, function(address) {
        self.addAddress(address);

      });
    }

    function addAddress(address) {
      if (!address)
        return;

      /*
       * Clients.addAddress(self.check.selectedClients()[0].getId(), address,
       * city, state, country).then(function(result) { if (result.ResponseCode ==
       * 1) { // add address self.clientAddresses.push({ address : address });
       * 
       * self.check.delivery().address(address); } else {
       * Modals.alert(result.ResponseMessage); } });
       */
      self.newAddresses.push(address);

      self.clientAddresses.push({
        address : address
      });

      self.check.delivery().address(address);

      self.check.delivery().address2('');
      self.check.delivery().zipcode('');
      self.check.delivery().city('');

      Countries.getById(parseInt($rootScope.location.country)).then(function(country) {
        loadStates(country);

        self.newAddress = true;

        if (self.states && self.states.length > 0) {
          self.check.delivery().state(self.location.state);
        }
      });
    }

    function checkDistance(successCallback, errCallback) {
      if (!self.country) {
        console.log('Empty country info');

        if (typeof errCallback == 'function')
          errCallback();

        return false;
      }

      var destination = {
        address : self.check.delivery().address(),
        city : self.check.delivery().city(),
        state : self.check.delivery().state(),
        zipcode : self.check.delivery().zipcode(),
        country : self.country.country_name
      };

      if (!destination.address || !destination.city || !destination.state || !destination.zipcode) {
        self.delivery_distance = '';
        self.estimated_time = '';

        if (self.isSubTab('pack') && clientInfo.phone) {
          if (typeof successCallback == 'function')
            successCallback();
        } else if (self.isSubTab('car')) {
          // Modals.alert("Please fill in all client delivery information in
          // order to proceed 1.");
          if (typeof errCallback == 'function')
            errCallback();
        }
      } else {
        Clients.getDeliveryDetail(destination).then(function(result) {
          if (result.ResponseCode == "0" && result.ResponseMessage) {
            self.error = {
              message : result.ResponseMessage
            };

            // Modals.alert(result.ResponseMessage);
            self.validAddress = false;
            console.log(result.ResponseMessage);
            if (result.ResponseMessage == 'This destination is not within reasonable driving distance of location.') {
              self.delivery_distance = "Out of Distance";
            } else {
              self.delivery_distance = "Invalid address";
            }

            if (typeof errCallback == "function") {
              errCallback();
            }
          } else {
            if (result.distance) {
              self.delivery_distance = result.distance;
            }

            if (result.time) {
              self.estimated_time = result.time;
            }

            self.validAddress = true;
            if (typeof successCallback == "function") {
              successCallback();
            }
          }

        }, function(err) {
          console.log(err);
        });
      }

    }
    function selectClient(client, defaultAddress, defaultPhone) {
      self.check.selectClient(client);
      self.searchClients = '';

      // fill delivery info if empty
      if (self.check.selectedClients().length == 1) {
        if (!self.check.delivery().phone() && !self.check.delivery().address() && !self.check.delivery().city() && !self.check.delivery().zipcode()) {

          Clients.getClientDetail(client.getId()).then(function(result) {

            self.clientAddresses = result.adresses;

            if (defaultAddress) {
              fillAddress(defaultAddress);
            } else {
              if (result.adresses) {

                if (result.adresses.length == 0) {

                  if (result.client_details.address) {
                    var address = {
                      address : result.client_details.address,
                      zip : result.client_details.zip,
                      city : result.client_details.city,
                      state_id : result.client_details.state_id,
                      state : result.client_details.state
                    };

                    self.clientAddresses.push(address);
                    self.check.delivery().address(result.client_details.address);

                  }

                  self.check.delivery().zipcode(result.client_details.zip);
                  self.check.delivery().city(result.client_details.city);
                  self.check.delivery().state(result.client_details.state_id);

                  if (result.client_details.country_id) {
                    Countries.getById(result.client_details.country_id).then(function(country) {
                      loadStates(country);

                      if (result.client_details.state_id) {
                        self.check.delivery().state(result.client_details.state_id);
                      }
                    });

                  } else {
                    // Load state of location
                    Countries.getById(parseInt($rootScope.location.country)).then(function(country) {
                      loadStates(country);
                      self.check.delivery().state(self.location.state);
                    });

                  }

                } else {

                  fillAddress(result.adresses[0]);
                }
              }
            }

            if (result.phones) {
              self.clientPhones = result.phones;

              if (defaultPhone) {
                self.check.delivery().phone(defaultPhone);
              } else {
                if (result.phones.length == 0) {
                  self.check.delivery().phone(result.client_details.phone);

                  if (result.client_details.phone) {
                    self.clientPhones = [ {
                      number : result.client_details.phone
                    } ];
                  }

                } else {
                  self.check.delivery().phone(result.phones[0].number);
                }
              }

            }

            if (self.isSubTab('car'))
              checkDistance();

          }, function(err) {
            console.log(err);
          });
        }

      }
    }

    function isNewAddress(address) {
      return self.newAddresses.indexOf(address) != -1;
    }

    function selectAddress(address) {

      if (self.clientAddresses && self.clientAddresses.length > 0) {
        for ( var i in self.clientAddresses) {
          if (address == self.clientAddresses[i].address) {
            fillAddress(self.clientAddresses[i]);
            return true;
          }
        }
      }

      return true;
    }
    function fillAddress(address) {
      self.check.delivery().address(address.address);
      self.check.delivery().address2(address.address2);
      self.check.delivery().zipcode(address.zip);
      self.check.delivery().city(address.city);

      Countries.getById(address.country_id).then(function(country) {
        loadStates(country);

        self.check.delivery().state(address.state_id);
      });

    }

    function inputPhones() {
      var tmp = angular.copy(self.clientPhones);
      tmp.push({
        number : 'Other'
      });

      return tmp;
    }

    function resetDeliveryInformation() {
      self.check.delivery().phone('');
      self.clientPhones = [];
      self.clientAddresses = [];
      self.check.delivery().address('');
      self.check.delivery().address2('');
      self.check.delivery().zipcode('');
      self.check.delivery().city('');

      if (self.states && self.states.length > 0) {
        self.check.delivery().state(self.location.state);
      }
    }
    function removeClient(client) {
      if (self.check.isClosed()) {
        return;
      }

      if (client.isSubmitted) {

        Modals.confirm('Are you sure you wish to remove this client?', function() {
          client.isSubmitted = false;
          self.check.removeClient(client);
          if (self.check.selectedClients().length == 0) {
            resetDeliveryInformation();
          }
        });
      } else {
        self.check.removeClient(client);
        if (self.check.selectedClients().length == 0) {
          resetDeliveryInformation();
        }
      }

    }

    $scope.$watch(function() {
      return self.searchClients;
    }, function() {
      if (self.searchClients.length >= 3) {
        if (self.searchTimer)
          $timeout.cancel(self.searchTimer);

        self.searchTimer = $timeout(function() {
          if (self.searchClients.length >= 3) {
            self.searchClientStarted = true;
          }
        }, 500);

      } else if (self.searchClients.length == 0) {
        self.searchClientStarted = false;
      }
    });

    $scope.$watch('$viewContentLoaded',
      function() {

        $('.check_section').mCustomScrollbar({
          scrollInertia : 100,
          scrollEasing : "easeOutCirc",
          setHeight : true,
          scrollButtons : {
            enable : true,
            scrollAmount : 100
          }
        });

        var Check = function() {
          return {
            reHeight : function() {
              // auto-size check views
              var parentDiv = $('.check_section').parent('div'), fluid = $('.check_section').prev('div.row-fluid').outerHeight(), stab = $('.row-check-detail-subtabs')
                .outerHeight();

              $('.check_section').css('height', (($(parentDiv).outerHeight() - fluid - stab) + 30) + 'px');
            },

            reSearchForm : function() {
              // auto-size search_form
              var ooptions = $('.order_items_vw_options').width(), obuttons = $('.order_items_vw_options #orderVwType').width();

              $('.order_items_vw_options .search_form').css('width', (ooptions - (obuttons + 10)) + 'px');
            }
          };
        }();

        $(window).resize(function() {
          Check.reHeight();
          Check.reSearchForm();
        });

        Check.reHeight();
        Check.reSearchForm();
      });

    function checkElapsedTime() {
      if (self.check)
        return self.check.elapsedTime();
      else
        return null;
    }

    function isTogoTimeAvailable() {
      return Preferences.isTogoTimeAvailable();
    }

    function isDeliveryTimeAvailable() {
      return Preferences.isDeliveryTimeAvailable();
    }

    function addClientInfo() {
      self.newDeliveryInfo = true;

      resetDeliveryInformation();

      self.delivery_distance = '';
      self.estimated_time = '';
    }
  }
})();