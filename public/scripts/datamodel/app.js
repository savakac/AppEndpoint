(function () {
	var app = angular.module('app', [
		'providersModule',
        'calendarModule'
	]);

	app.controller('AppController', ['$http', '$log', '$rootScope', '$window', '$interval', '$timeout', '$injector', function ($http, $log, $rootScope, $window, $interval, $timeout, $injector) { 
		$window.$rootScope = $rootScope;
        $rootScope.$timeout = $timeout;

        // window functions
        $rootScope.rootUrl = $window.rootUrl;
        $rootScope.URI = $window.URI;
        $rootScope.closeWindow = $window.closeWindow;
        $rootScope.user = $window.user;

        $rootScope.culture = $window.culture;
        $rootScope.agentType = $window.agentType;
        $rootScope.size = $window.size;
        $rootScope.location = {
            reload: function (forceReload) {
                if (forceReload) $(window).off('beforeunload');
                location.reload();
            }
        };
        $rootScope.getTemplateUrl = $window.getTemplateUrl;
	}]);

	//
	// Services
	//
	app.factory('processingService', ['$rootScope', '$http', function ($rootScope, $http) {
        var service = {}

        service.processingFinished = function (delay) {
            $rootScope.$broadcast('application.processingFinished', { delay: delay });
        };

        service.processingFinishedListener = function (scope, callback) {
            return scope.$on('application.processingFinished', function (e, args) {
                callback(args.delay);
            });
        };

        return service;
    }]);

    //
    // Directives
    //
    app.directive('convertToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attr, ngModel) {
                ngModel.$parsers.push(function (val) {
                    return parseInt(val, 10);
                });
                ngModel.$formatters.push(function (val) {
                    return '' + val;
                });
            }
        };
    });

    //
    // Filters
    //
    app.filter('arrayToString', function () {
        return function (items, separator) {
            var result = '';
            separator = separator || "\n";
            if (items) items.forEach(function (i) { i && (result += (result ? separator : '') + i); });
            return result;
        };
    });
})();