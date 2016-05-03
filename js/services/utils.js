;
(function() {
  'use strict';

  angular.module('soft').service('soft.Utils', Utils);

  Utils.$inject = [];
  function Utils() {
    var Utils = function() {
      var self = this;

      self.formatMoney = formatMoney;
      self.calcround = calcround;
      self.ckpar = ckpar;
      self.months = months;
      self.retfixx = retfixx;
      self.retfix = retfix;
      self.ckpar = ckpar;
      self.mergeUnique = mergeUnique;

      function mergeUnique(src, dsc) {
        var newSet = new Array();
        var tracking = {};

        angular.forEach(src, function(item) {
          if (!tracking[item]) {
            newSet.push(item);
            tracking[item] = true;
          }
        });

        angular.forEach(dsc, function(item) {
          if (!tracking[item]) {
            newSet.push(item);
            tracking[item] = true;
          }
        });

        return newSet;
      }

      function formatMoney(vl, tp) {
        var global_signal_currency = '';
        var kl = '';
        if (tp == 1) {
          kl = global_signal_currency + ' ';
        } else {
          kl = '';
        }
        return kl + parseFloat(vl).toFixed(2);
      }

      function calcround(v1, rou, arrValue) {
        var v = parseFloat(v1);
        var k = 0;
        var x = 1;
        var k = Math.floor(v1 / rou);
        var y = v1 % rou;
        if (y > 0) {
          k++;
        }

        k = k * rou;
        for (var o = 0; o < arrValue.length; o++) {
          if (self.formatMoney(k, 1) == arrValue[o]) {
            k = k + 10;
          }
        }

        return k;

      }

      function ckpar(s) {
        if (s == null || s === undefined) {
          s = "";
        }
        return s;
      }

      function months() {
        return [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12' ];
      }

      function retfixx(s) {
        if (isNaN(s)) {
          s = '';
        }
        if (s == 0) {
          s = '';
        }
        if (isFinite(s) == false) {
          s = '';
        }
        return s;
      }

      function retfix(s) {

        if (isNaN(s)) {
          s = '';
        }
        if (s == '0') {
          s = '';
        }
        return s;
      }

      function ckpar(s) {
        if (s == null) {
          s = '';
        }
        if (s === undefined) {
          s = "";
        }
        return s;
      }
    };

    return new Utils();
  }
})();