(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./site/site.js')
require('./datamodel/app.js');
require('./datamodel/providers.js');
require('./datamodel/calendar.js');
},{"./datamodel/app.js":2,"./datamodel/calendar.js":3,"./datamodel/providers.js":4,"./site/site.js":5}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
(function () {
    angular.module('calendarModule', [])

    .controller('CalendarController', ['$http', '$log', '$scope', '$rootScope', '$window', '$timeout', '$interval', function ($http, $log, $scope, $rootScope, $window, $timeout, $interval) {

    }])
    
})();
},{}],4:[function(require,module,exports){
(function () {
    angular.module('providersModule', [])

    .controller('ProvidersController', ['$http', '$log', '$scope', '$rootScope', '$window', '$timeout', '$interval', function ($http, $log, $scope, $rootScope, $window, $timeout, $interval) {

    }])
    
})();
},{}],5:[function(require,module,exports){
var postForm = function ($form, successCallback, errorCallback, fileValidationCallback, allowBiggerFile) {
    $form = $($form);

    var formData = new FormData();
    var params = $form.serializeArray();

    // Confirmation Dialog
    formData.append("ConfirmationDialog", JSON.stringify(ng.getConfirmationDialog()));

    // Add Files
    var validationError;
    var $file = $form.find('[name="file"]');
    if ($file && $file[0] && $file[0].files) {
        $.each($file[0].files, function (i, file) {
            // Prefix the name of uploaded files with "uploadedFiles-"
            // Of course, you can change it to any string
            formData.append('file-' + i, file);
            if (!allowBiggerFile && file.size > Constants.ATTACHMENT_MAX_SIZE) {
                resetFormElement($file);
                fileValidationCallback($file.attr('id'), file);
                validationError = true;
            }
        });
    }
    if (validationError) return;

    // Add standard parameters
    $.each(params, function (i, val) {
        formData.append(val.name, val.value);
    });

    if (ng.root().processing.POST && !params.allowParallelPosts) {
        toastr.warning("Processing... Please wait...");
        return { abort: function () { } };
    }

    return $.ajax({
        url: $form.attr('action'),
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (data, status, xhr) {
            if (successCallback) successCallback(data, status, xhr);
        },
        error: function (xhr, status, error) {
            if (errorCallback) errorCallback(xhr, status, error);
        }
    });
};

var postFormUrl = function (relativeUrl, params, successCallback, errorCallback, abortCallback) {
    var formData = new FormData();

    // Add RequestVerificationToken
    formData.append("__RequestVerificationToken", encodeURIComponent($('body > [name=__RequestVerificationToken]').val()));

    // Add DATA
    try {
        $.each(params || [], function (key) {
            //console.log(key, params[key], JSON.stringify(params[key]))
            if (key === 'files') {
                // Add Files
                $.each(params[key], function (i, file) {
                    // Prefix the name of uploaded files with "uploadedFiles-"
                    // Of course, you can change it to any string
                    formData.append('file-' + i, file);
                });
            } else {
                formData.append(key, isArray(params[key]) || isObject(params[key]) ? JSON.stringify(params[key]) : params[key]);
            }
        });
    } catch (e) {
        console.log(e.message, params);
        throw e;
    }

    // Add Confirmation Dialog
    formData.append("ConfirmationDialog", JSON.stringify(ng.getConfirmationDialog()));

    if (ng.root().processing.POST && !params.allowParallelPosts) {
        toastr.warning("Processing... Please wait...");
        abortCallback && abortCallback();
        return { abort: function () { } };
    }

    return $.ajax({
        type: 'POST',
        url: rootUrl + relativeUrl,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data, status, xhr) {
            if (successCallback) successCallback(data, status, xhr);
        },
        error: function (xhr, status, error) {
            if (errorCallback) errorCallback(xhr, status, error);
        }
    });
};
},{}]},{},[1]);
