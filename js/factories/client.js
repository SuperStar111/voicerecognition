;
(function() {
  'use strict';

  angular.module('soft').factory('Client', Client);

  Client.$inject = [ 'BaseObject' ];
  function Client(BaseObject) {
    var Client = function(object) {
      var self = angular.extend(this, new BaseObject(object));

      self.name = name;
      self.longName = longName;
      self.getId = getId;
      self.image = image;
      self.phone = phone;
      self.email = email;
      self.lastVisited = lastVisited;
      self.location = location;
      self.city = city;
      self.state = state;
      self.country = country;

      function name() {
        return [ self.data.client_last_name, self.data.client_first_name ].join(', ') + ' (ID: ' + self.data.client_id + ')';
      }

      function longName() {
        var _name = name();

        if (phone()) {
          _name += ' - ' + phone();
        }

        return _name;
      }

      function getId() {
        return self.data.client_id;
      }

      function image() {
        return self.data.client_image;
      }

      function phone() {
        return self.data.client_phone;
      }

      function city() {
        return self.data.client_city;
      }

      function state() {
        return self.data.client_state;
      }

      function email() {
        if (self.data.client_email == "null")
          return '';
        return self.data.client_email;
      }

      function lastVisited() {
        return self.data.client_last_visit;
      }

      function location() {
        var parts = new Array();
        if (self.data.client_city)
          parts.push(self.data.client_city);

        if (self.data.client_state)
          parts.push(self.data.client_state);
        return parts.join(', ');
      }

      function country() {
        return {
          id : self.data.country_id,
          name : self.data.country
        };
      }
    };

    return Client;

  }
})();