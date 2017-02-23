(function () {
    'use strict';

    angular.module('LelongApp.services').service('xhttpService', ['$q', '$http', 'tokenService', xhttpService]);

    /**
	 * @constructor
	 */
    function xhttpService($q, $http) {
        this.$q = $q;
        this.$http = $http;
        this.tokenService = tokenService;
    }

    xhttpService.prototype.get = function (url) {
        var defer = $q.defer();
        this.tokenService.verify().then(function (token) {
            if (token) {
                var header =  {
                    "Authorization": "Bearer " + token.access_token,
                    "Accept": "application/json"
                }
                $http.get(url, header).then(function (response) {
                    defer.resolve(response);
                }, function (err) {
                    defer.reject(err);
                });
            }
        })
        return defer.promise;
    }
   
    xhttpService.prototype.post = function (url, data) {
        var defer = $q.defer();
        this.tokenService.verify().then(function (token) {
            if (token) {
                var header = {
                    'Content-type': 'application/x-www-form-urlencoded',
                    "Authorization": "Bearer " + token.access_token,
                    "Accept": "application/json"
                }
                $http.post(url, data, header).then(function (response) {
                    defer.resolve(response);
                }, function (err) {

                    defer.reject(err);
                });
            }
        })
        return defer.promise;
    }

    xhttpService.prototype.put = function (url, data) {
        var defer = $q.defer();
        this.tokenService.verify().then(function (token) {
            if (token) {
                var header = {
                    'Content-type': 'application/x-www-form-urlencoded',
                    "Authorization": "Bearer " + token.access_token,
                    "Accept": "application/json"
                }
                $http.put(url, data, header).then(function (response) {
                    defer.resolve(response);
                }, function (err) {

                    defer.reject(err);
                });
            }
        })
        return defer.promise;
    }

    xhttpService.prototype.delete = function (url) {
        var defer = $q.defer();
        this.tokenService.verify().then(function (token) {
            if (token) {
                var header = {
                    "Authorization": "Bearer " + token.access_token,
                    "Accept": "application/json"
                }
                $http.delete(url,header).then(function (response) {
                    defer.resolve(response);
                }, function (err) {

                    defer.reject(err);
                });
            }
        })
        return defer.promise;
    }

})();