;
(function() {
  'use strict';

  angular.module('soft').factory('Check', Check);

  Check.$inject = [ 'BaseObject', 'Client', 'Orders', '$q', '$rootScope' ];
  function Check(BaseObject, Client, Orders, $q, $rootScope) {
    var Delivery = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      self.time = time;
      self.address = address;
      self.address2 = address2;
      self.phone = phone;
      self.city = city;
      self.state = state;
      self.state_id = state_id;
      self.zipcode = zipcode;
      self.country = country;
      self.country_id = country_id;

      function time(value) {
        if (angular.isDefined(value)) {
          self.data.delivery_time = value;
        } else {
          if (!self.data.delivery_time) {
            self.data.delivery_time = '00:00:00';
          }
          return self.data.delivery_time;
        }
      }

      function address(value) {
        if (angular.isDefined(value)) {
          self.data.delivery_address = value;
        } else {
          return self.data.delivery_address;
        }
      }

      function address2(value) {
        if (angular.isDefined(value)) {
          self.data.delivery_address2 = value;
        } else {
          return self.data.delivery_address2;
        }
      }

      function phone(value) {
        if (angular.isDefined(value)) {
          self.data.delivery_phone = value;
        } else {
          return self.data.delivery_phone;
        }
      }

      function city(value) {
        if (angular.isDefined(value)) {
          self.data.delivery_city = value;
        } else {
          return self.data.delivery_city;
        }
      }

      function state(value) {
        if (angular.isDefined(value)) {
          self.data.delivery_state = value;
        } else {
          return self.data.delivery_state;
        }
      }

      function state_id(value) {
        if (angular.isDefined(value)) {
          self.data.delivery_state_id = value;
        } else {
          return self.data.delivery_state_id;
        }
      }

      function zipcode(value) {
        if (angular.isDefined(value)) {
          self.data.delivery_zipcode = value;
        } else {
          return self.data.delivery_zipcode;
        }
      }

      function country(value) {
        if (angular.isDefined(value)) {
          self.data.country = value;
        } else {
          return self.data.country;
        }
      }

      function country_id(value) {
        if (angular.isDefined(value)) {
          self.data.country_id = value;
        } else {
          return self.data.country_id;
        }
      }

    };

    var Check = function(object) {
      var self = angular.extend(this, new BaseObject(object));
      self._selectedClients = [];
      self.deliveryType = 'table';

      if (!angular.isDefined(self.data.order_details)) {
        self.data.order_details = {};
      }

      self.covers = covers;
      self.table = table;
      self.assignedServer = assignedServer;
      self.sourceOfBusiness = sourceOfBusiness;
      self.startTime = startTime;
      self.endTime = endTime;
      self.orderStatus = orderStatus;
      self.isStatus = isStatus;
      self.elapsedTime = elapsedTime;
      self.delivery = delivery;
      self.togoTime = togoTime;
      self.getId = getId;
      self.isTogo = isTogo;
      self.isDelivery = isDelivery;
      self.isFast = isFast;
      self.isTable = isTable;
      self.selectClient = selectClient;
      self.removeClient = removeClient;
      self.selectedClients = selectedClients;
      self.hostessStatus = hostessStatus;
      self.validate = validate;
      self.typePrint = typePrint;
      self.getOrder = getOrder;
      self.equallyCovers = equallyCovers;

      self.isClosed = isClosed;
      self.isCancelled = isCancelled;

      self.currentOrder = currentOrder;

      init();
      function init() {
        self._delivery = new Delivery(self.data['order_details']['delivery_details']);

        for ( var idx in self.data['order_details']['order_clients']) {
          var clientInfo = self.data['order_details']['order_clients'][idx];
          var convertedData = {
            client_id : clientInfo['id'],
            client_name : clientInfo['name'],
            client_first_name : clientInfo['name_first'],
            client_last_name : clientInfo['name_last'],
            client_phone : clientInfo['phone'],
            client_email : clientInfo['email'],
            client_city : clientInfo['city'],
            client_state : clientInfo['state'],
            client_last_visit : "",
            client_image : clientInfo['image'],
            country : clientInfo['country'],
            country_id : clientInfo['country_id'],
          };

          var client = new Client(convertedData);
          client.set('country_id', clientInfo['country_id']);
          client.set('country', clientInfo['country']);
          client.fullInfo = clientInfo;
          client.isSubmitted = true;
          selectClient(client);
        }

        if (self.data['order_details'].check_type.toUpperCase() == 'TOGO') {
          self.deliveryType = 'pack';
        } else if (self.data['order_details'].check_type.toUpperCase() == 'DELIVERY') {
          self.deliveryType = 'car';
        } else if (self.data['order_details'].check_type.toUpperCase() == 'FAST') {
          self.deliveryType = 'clock';
        } else {
          self.deliveryType = 'table';
        }
      }

      function isClosed() {
        return [ 'CLOSED' ].indexOf(self.get('order_details')['order_status'].toUpperCase()) != -1;
      }

      function isCancelled() {
        return self.get('order_details')['order_status'].toUpperCase() == 'CANCELLED';
      }

      function getId() {
        return self.data['order_details'].id;
      }

      function covers(value) {
        if (angular.isDefined(value)) {
          self.data.order_details.covers = parseInt(value);
        } else {
          return parseInt(self.data.order_details.covers);
        }
      }

      function equallyCovers(value) {
        if (angular.isDefined(value)) {
          self.data.order_details.equally_covers = parseInt(value);
        } else {
          return parseInt(self.data.order_details.equally_covers);
        }
      }

      function table(value) {
        if (angular.isDefined(value)) {
          self.data.order_details.location_table = value;
        } else {
          return self.data.order_details.location_table;
        }
      }

      function assignedServer(value) {
        if (angular.isDefined(value)) {
          self.data.order_details.assigned_server = value;
        } else {
          return self.data.order_details.assigned_server;
        }
      }

      function sourceOfBusiness(value) {
        if (angular.isDefined(value)) {
          self.data.order_details.source_of_business = value;
        } else {
          return self.data.order_details.source_of_business;
        }
      }

      function orderStatus(value) {
        if (angular.isDefined(value)) {
          self.data.order_details.order_status = value;
        } else {

          if (self.data.order_details.order_status) {
            var tmp = '';
            for (var i = 0; i < self.data.order_details.order_status.length; i++) {
              if (i == 0) {
                tmp += self.data.order_details.order_status[i].toUpperCase();
              } else {
                tmp += self.data.order_details.order_status[i];
              }
            }

            self.data.order_details.order_status = tmp;

          }
          return self.data.order_details.order_status;
        }
      }

      function isStatus(arrStatuses) {
        // return true;
        // FIXME: This is temporary, need to be updated
        return arrStatuses.indexOf(self.data.order_details.order_status.toUpperCase()) != -1;
      }

      function startTime() {
        return self.data.order_datetime.check_start_time;
      }

      function endTime() {
        return self.data.order_datetime.check_end_time;
      }

      function elapsedTime() {

        var _startTime = startTime().replace(/\-/g, '/');
        var _currentTime = self.data.order_datetime.current_time.replace(/\-/g, '/');
        var currentLocalTime = (new Date()).getTime();

        if (!self.timeDiff) {
          self.timeDiff = currentLocalTime - (new Date(_currentTime)).getTime();
        }

        var elapsed = (currentLocalTime - (new Date(_startTime)).getTime() - self.timeDiff) / 1000; // in
        // second

        var days = Math.floor(elapsed / 86400);
        // After deducting the days calculate the number of hours left
        var hours = Math.floor((elapsed - (days * 86400)) / 3600);
        // After days and hours , how many minutes are left
        var minutes = Math.floor((elapsed - (days * 86400) - (hours * 3600)) / 60);
        // Finally how many seconds left after removing days, hours and minutes.
        var secs = Math.floor((elapsed - (days * 86400) - (hours * 3600) - (minutes * 60)));

        var date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(secs);
        return date.toTimeString().split(" ")[0];
      }

      function delivery() {
        return self._delivery;
      }

      function togoTime(value) {
        if (angular.isDefined(value)) {
          self.data.order_details.togo_time = value;
        } else {

          if (!self.data.order_details.togo_time) {
            self.data.order_details.togo_time = '00:00:00';
          }

          return self.data.order_details.togo_time;
        }
      }

      function hostessStatus(value) {
        if (angular.isDefined(value)) {
          self.data.hostess_status = value;
        } else {
          return self.data.hostess_status;
        }
      }

      function deliveryTime(value) {
        if (angular.isDefined(value)) {
          self.data.order_details.delivery_details.delivery_time = value;
        } else {
          return elf.data.order_details.delivery_details.delivery_time;
        }
      }

      function isTogo() {
        return self.deliveryType == 'pack';
      }

      function isDelivery() {
        return self.deliveryType == 'car';
      }

      function isFast() {
        return self.deliveryType == 'clock';
      }

      function isTable() {
        return self.deliveryType == 'table';
      }

      function selectClient(client) {
        client.isAdded = true;
        self._selectedClients.push(client);
      }

      function removeClient(client) {
        client.isAdded = false;
        for ( var idx in self._selectedClients) {
          if (self._selectedClients[idx].getId() == client.getId()) {
            self._selectedClients.splice(idx, 1);
          }
        }
      }

      function selectedClients() {
        return self._selectedClients;
      }

      function validate() {
        if (!self.covers() && (self.isTable() || self.isTogo())) {
          throw 'Covers is required.';
        } else if ((!self.table() || self.table() == "0") && (self.isTable())) {
          throw 'Table is required.';
        } else if (!self.assignedServer() && (self.isTable())) {
          throw 'Assigned server is required.';
        } else if (!self.sourceOfBusiness() && (self.isTable() || self.isTogo())) {
          throw 'Source of Business is required.';
        } else if ((self.isDelivery() || self.isTogo()) && self._selectedClients.length == 0) {
          if (self.isTogo()) {
            throw 'You need to select at least 1 client or fill in all Togo information.';
          } else {
            throw 'You need to select at least 1 client or fill in all Delivery information.';
          }
        } else if ((self.isDelivery() || self.isTogo()) && !self.delivery().phone()) {
          throw 'You need to enter a phone.';
        } else if (self.isDelivery() && !self.delivery().address() && !self.delivery().address2()) {
          throw 'You need to enter an address for delivery.';
        } else if (self.isDelivery() && !self.delivery().city()) {
          throw 'You need to enter a city for delivery.';
        } else if (self.isDelivery() && !self.delivery().zipcode()) {
          throw 'You need to enter a zip code for delivery.';
        }
      }

      function typePrint() {
        return self.data.order_details.type_print;
      }

      function currentOrder(order) {
        if (angular.isDefined(order)) {
          self._currentOrder = order;
        } else {
          return self._currentOrder;
        }
      }

      function getOrder(isShowDetail) {
        var deferred = $q.defer();

        var check = {
          id : self.getId(),
          type_print : self.typePrint(),
          equally_covers : self.equallyCovers(),
          orderStatus : self.orderStatus()
        };

        Orders.getOrderDetail(check, isShowDetail).then(function(orderData) {
          self.currentOrder(orderData.order);

          $rootScope.$broadcast('Order Reloaded', {
            order : orderData.order
          });

          deferred.resolve(orderData.order);

        }, function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };

    return Check;
  }
})();