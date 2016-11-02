'use strict';

angular.module('deft.date_time_picker', ['ui.bootstrap', 'angularMoment'])
  .provider('DateTimePickerDefaultConfig', function DateTimePickerConfigProvider() {
    var config = {
      decline: 'Decline',
      accept: 'Accept',
      dateLabel: 'Date',
      dateFormat: 'dd D MMM YYYY',
      timeLabel: 'Time',
      timeFormat: 'HH:mm',
      step: 1,
      useTimePicker: true
    };

    this.decline = function(value) { config.decline = value; };
    this.accept = function(value) { config.accept = value; };
    this.dateLabel = function(value) { config.dateLabel = value; };
    this.dateFormat = function(value) { config.dateFormat = value; };
    this.timeLabel = function(value) { config.timeLabel = value; };
    this.timeFormat = function(value) { config.timeFormat = value; };
    this.step = function(value) { config.step = value; };
    this.useTimePicker = function(value) { config.useTimePicker = value; };

    this.$get = function() { return config; }
  })
  .directive('dateTimePicker', function (DateTimePickerDefaultConfig) {
    return {
      restrict: 'E',
      templateUrl: 'templates/dateTimePicker.html',
      replace: true,
      require: 'ngModel',
      scope: { dateTime: '=ngModel', customConfig: '=config', minDate: '=', maxDate: '='},
      link: {
        pre: function (scope) {
          function validate() {
            if (scope.minDate && !scope.minDate._isAMomentObject) return;
            if (scope.maxDate && !scope.maxDate._isAMomentObject) return;
            if (!(scope.dateTime && scope.dateTime._isAMomentObject)) return;

            if (scope.minDate && scope.dateTime.format() != scope.minDate.format() && scope.dateTime < scope.minDate)
              scope.dateTime = angular.copy(scope.minDate);
            if (scope.maxDate && scope.dateTime.format() != scope.maxDate.format() && scope.dateTime > scope.maxDate)
              scope.dateTime = angular.copy(scope.maxDate);
          }

          function updateConfig() {
            scope.config = _.defaults(scope.customConfig ? scope.customConfig : {}, DateTimePickerDefaultConfig);
          }

          updateConfig();

          scope.$watch('dateTime', validate);
          scope.$watch('minDate', validate);
          scope.$watch('maxDate', validate);
          scope.$watch('customConfig', function(newVal, oldVal) { if (newVal != oldVal) updateConfig(); })
        }
      }
    };
  })
  .directive('datePicker', function($modal) {
    return {
      restrict: 'E',
      templateUrl: 'templates/datePicker.html',
      replace: true,
      scope: { date: '=', config: '=' },
      link: function (scope) {
        scope.pickDate = function() {console.log($modal);
          $modal.open({
            windowClass: 'deft-date-time-picker-modal',
            templateUrl: 'templates/datePickerModal.html',
            controller: 'DateTimePickerCtrl',
            resolve: { dateTime: function() { return angular.copy(scope.date); }, Config: function() { return scope.config; } }
          }).result.then(function(date) { scope.date = date; });
        }
      }
    };
  })
  .directive('timePicker', function($modal) {
    return {
      restrict: 'E',
      templateUrl: 'templates/timePicker.html',
      replace: true,
      scope: { time: '=', config: '=' },
      link: function (scope) {
        function isInt(value) {
          if (isNaN(value)) { return false; }
          var x = parseFloat(value);
          return (x | 0) === x;
        }

        function alignTime() {
          var minutes = Math.floor(scope.time.minutes()/scope.config.step)*scope.config.step;
          if (isInt(minutes)) scope.time.minutes(minutes);
        }

        alignTime();
        scope.pickTime = function() {
          $modal.open({
            windowClass: 'deft-date-time-picker-modal',
            templateUrl: 'templates/timePickerModal.html',
            controller: 'DateTimePickerCtrl',
            resolve: { dateTime: function() { return angular.copy(scope.time); }, Config: function() { return scope.config; } }
          }).result.then(function(time) {
            scope.time = time;
            alignTime();
          });
        };

        scope.$watch('config.step', alignTime);
      }
    };
  })
  .controller('DateTimePickerCtrl', function ($scope, $modalInstance, dateTime, Config) {
    $scope.dateTime = dateTime;
    $scope.config = Config;

    $scope.adjustDate = function(amount, unit) { $scope.dateTime.add(unit, amount); };
    $scope.ok = function(dateTime) { $modalInstance.close(dateTime); };
    $scope.cancel = function() { $modalInstance.dismiss(); }
  })
;

angular.module('deft.date_time_picker').run(['$templateCache', function($templateCache) {$templateCache.put('templates/datePicker.html','<div class="deft-date-time-picker-date-picker" ng-click="pickDate()">{{ date | amDateFormat: config.dateFormat }}</div>\n');
$templateCache.put('templates/datePickerModal.html','<div>\n    <div class="tableWrapper">\n        <table>\n            <tr class="adjust-row">\n                <td class="large"></td>\n                <td ng-click="adjustDate(10, \'day\')"><i class="fa fa-angle-double-up"></i></td>\n                <td ng-click="adjustDate(10, \'month\')"><i class="fa fa-angle-double-up"></i></td>\n                <td ng-click="adjustDate(10, \'year\')"><i class="fa fa-angle-double-up"></i></td>\n            </tr>\n            <tr class="adjust-row">\n                <td class="large"></td>\n                <td ng-click="adjustDate(1, \'day\')"><i class="fa fa-angle-up"></i></td>\n                <td ng-click="adjustDate(1, \'month\')"><i class="fa fa-angle-up"></i></td>\n                <td ng-click="adjustDate(1, \'year\')"><i class="fa fa-angle-up"></i></td>\n            </tr>\n            <tr class="date-time-row">\n                <td class="large align-left">{{ dateTime | amDateFormat: "dddd" }}</td>\n                <td class="date-time-text">{{ dateTime | amDateFormat:"DD" }}</td>\n                <td class="date-time-text">{{ dateTime | amDateFormat:"MMM" }}</td>\n                <td class="date-time-text">{{ dateTime | amDateFormat:"YYYY" }}</td>\n            </tr>\n            <tr class="adjust-row">\n                <td class="large"></td>\n                <td ng-click="adjustDate(-1, \'day\')"><i class="fa fa-angle-down"></i></td>\n                <td ng-click="adjustDate(-1, \'month\')"><i class="fa fa-angle-down"></i></td>\n                <td ng-click="adjustDate(-1, \'year\')"><i class="fa fa-angle-down"></i></td>\n            </tr>\n            <tr class="adjust-row">\n                <td class="large"></td>\n                <td ng-click="adjustDate(-10, \'day\')"><i class="fa fa-angle-double-down"></i></td>\n                <td ng-click="adjustDate(-10, \'month\')"><i class="fa fa-angle-double-down"></i></td>\n                <td ng-click="adjustDate(-10, \'year\')"><i class="fa fa-angle-double-down"></i></td>\n            </tr>\n        </table>\n    </div>\n    <div>\n        <div class="btn btn-default" ng-click="cancel()">{{ config.decline }}</div>\n        <div class="btn btn-primary" ng-click="ok(dateTime)">{{ config.accept }}</div>\n    </div>\n</div>\n');
$templateCache.put('templates/dateTimePicker.html','<div class="deft-date-time-picker">\n    <div class="deft-date-time-picker-date">\n        <label ng-show="config.dateLabel">{{ config.dateLabel }}</label>\n        <date-picker date="dateTime" config="config"></date-picker>\n    </div>\n    <div class="deft-date-time-picker-time" ng-show="config.useTimePicker !== false">\n        <label ng-show="config.timeLabel">{{ config.timeLabel }}</label>\n        <time-picker time="dateTime" config="config"></time-picker>\n    </div>\n</div>\n');
$templateCache.put('templates/timePicker.html','<div class="deft-date-time-picker-time-picker" ng-click="pickTime()">{{ time | amDateFormat: config.timeFormat }}</div>\n');
$templateCache.put('templates/timePickerModal.html','<div>\n    <div class="tableWrapper">\n        <table>\n            <tr class="adjust-row">\n                <td></td>\n                <td ng-click="adjustDate(12, \'hour\')"><i class="fa fa-angle-double-up"></i></td>\n                <td class="small"></td>\n                <td ng-click="adjustDate(config.step*10, \'minute\')"><i class="fa fa-angle-double-up"></i></td>\n                <td></td>\n            </tr>\n            <tr class="adjust-row">\n                <td></td>\n                <td ng-click="adjustDate(1, \'hour\')"><i class="fa fa-angle-up"></i></td>\n                <td class="small"></td>\n                <td ng-click="adjustDate(config.step, \'minute\')"><i class="fa fa-angle-up"></i></td>\n                <td></td>\n            </tr>\n            <tr class="date-time-row">\n                <td></td>\n                <td class="date-time-text">{{ dateTime | amDateFormat:"HH" }}</td>\n                <td class="small">:</td>\n                <td class="date-time-text">{{ dateTime | amDateFormat:"mm" }}</td>\n                <td></td>\n            </tr>\n            <tr class="adjust-row">\n                <td></td>\n                <td ng-click="adjustDate(-1, \'hour\')"><i class="fa fa-angle-down"></i></td>\n                <td class="small"></td>\n                <td ng-click="adjustDate(-config.step, \'minute\')"><i class="fa fa-angle-down"></i></td>\n                <td></td>\n            </tr>\n            <tr class="adjust-row">\n                <td></td>\n                <td ng-click="adjustDate(-12, \'hour\')"><i class="fa fa-angle-double-down"></i></td>\n                <td class="small"></td>\n                <td ng-click="adjustDate(-config.step*10, \'minute\')"><i class="fa fa-angle-double-down"></i></td>\n                <td></td>\n            </tr>\n        </table>\n    </div>\n    <div>\n        <div class="btn btn-default" ng-click="cancel()">{{ config.decline }}</div>\n        <div class="btn btn-primary" ng-click="ok(dateTime)">{{ config.accept }}</div>\n    </div>\n</div>\n');}]);