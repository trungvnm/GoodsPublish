(function () {
    'use strict';

    angular.module('LelongApp.services').service('xhttpService', ['$q', '$http', 'tokenService', XhttpService]);

    /**
	 * @constructor
	 */
    function XhttpService($q, $http, tokenService) {
        this.$q = $q;
        this.$http = $http;
        this.tokenService = tokenService;
    }
   
    XhttpService.prototype.login = function (loginUrl, data, showSpinner) {
        var defer = this.$q.defer();
        var self = this;
        var header = {
            'Access-Control-Allow-Origin': 'www.lelong.com.my',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
            'Content-type': 'application/x-www-form-urlencoded',
            "Accept": "application/json"
        }

        self.$http.post(loginUrl, data, header).then(function (response) {
            console.log('logined');
            defer.resolve(response);
        }, function (err) {
            defer.reject(err);
        });
        return defer.promise;
    }

    XhttpService.prototype.get = function (url, showSpinner) {
        var defer = this.$q.defer();
        var self = this;
        this.tokenService.verify().then(function (token) {
            if (token) {
                var header = {
                    "Authorization": "Bearer " + token.access_token,
                    "X-User-Context" : token.username,
                    "Accept": "application/json"
                }
                self.$http.get(url, {headers: header}).then(function (response) {
                    defer.resolve(response);
                }, function (err) {
                    defer.reject(err);
                })
            }
        })
        return defer.promise;
    }

    XhttpService.prototype.post = function (url, data, showSpinner) {
        
        var defer = this.$q.defer();
        var self = this;
        this.tokenService.verify().then(function (token) {
            if (token) {
                var header = {
                    'Content-type': 'application/json',
                    "Authorization": "Bearer " + token.access_token,
                    "X-User-Context" : token.username,
                    "Accept": "application/json"
                }
                self.$http.post(url, data, { headers: header }).then(function (response) {
                    defer.resolve(response);
                }, function (err) {
                    defer.reject(err);
                });
            }
        })
        return defer.promise;
    }

    XhttpService.prototype.put = function (url, data, showSpinner) {
        var defer = this.$q.defer();
        var self = this;
        this.tokenService.verify().then(function (token) {
            if (token) {
                var header = {
                    'Content-type': 'application/json',
                    "Authorization": "Bearer " + token.access_token,
                    "X-User-Context" : token.username,
                    "Accept": "application/json"
                }
                self.$http.put(url, data, { headers: header }).then(function (response) {
                    defer.resolve(response);
                }, function (err) {
                    defer.reject(err);
                });
            }
        })
        return defer.promise;
    }

    XhttpService.prototype.delete = function (url, showSpinner) {
        var defer = this.$q.defer();
        var self = this;
        this.tokenService.verify().then(function (token) {
            if (token) {
                var header = {
                    "Authorization": "Bearer " + token.access_token,
                    "X-User-Context" : token.username,
                    "Accept": "application/json"
                }
                self.$http.delete(url, { headers: header }).then(function (response) {
                    defer.resolve(response);
                }, function (err) {

                    defer.reject(err);
                });
            }
        })
        return defer.promise;
    }

})();