;
(function() {
  'use strict';

  angular.module('soft').service('TerminalInterceptor', TerminalInterceptor);

  TerminalInterceptor.$inject = [ '$q', '$injector' ];
  function TerminalInterceptor($q, $injector) {
    var fn = function() {
      var self = this;

      self.request = request;

      self.excludes = [ 'get_terminals.php', 'update_terminal.php', 'loadpos.php', 'report2pdf.php' ];

      function request(config) {
        var pattern = /[a-zA-Z0-9_\-]+?\.php/;
        var matches = config.url.match(pattern);

        if (config.method == 'GET' && matches && matches.length > 0) {
          if (self.excludes.indexOf(matches[0]) == -1) {
            var Terminals = $injector.get('Service.Terminals');
            config.url += '&terminal_id=' + Terminals.currentID();
          }
        } else {

        }

        return config || $q.when(config);
      }
    };

    return new fn();
  }
})();