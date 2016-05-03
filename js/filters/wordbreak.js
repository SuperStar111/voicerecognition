;
(function() {
  'use strict';

  angular.module('soft').filter('wordbreak', function() {
    return function(frase, lim, linhas) {
      var conta1 = 0;
      var pal = '';
      var linhasc = 0;
      var conta2 = 0;
      for (var se = 0; se < frase.length; se++) {
        conta2++;
        if (frase[se] === ' ') {
          conta1 = 0;
          pal += frase[se];
        } else {
          pal += frase[se];
          conta1++;
        }
        if (conta1 === lim) {
          if (frase.length - 1 !== se) {
            pal += '-<br>';
          }
          conta1 = 0;
          conta2 = 0;
        }
        if (linhas > 0) {
          if (conta2 === lim) {
            if (frase.length - 1 !== se) {
              // pal+='-<br>';
            }
            conta1 = 0;
            conta2 = 0;
            linhasc++;
          }
          if (linhasc === linhas) {
            break;
          }
        }
      }
      return pal;
    };
  });
})();