(function () {
    'use strict';

    angular.module('LelongApp.services').service('tokenService', ['$q', '$window', '$http', '$location', TokenService]);

    /**
	 * @constructor
	 */
    function TokenService($q, $window, $http, $location) {
        this.$q = $q;
        this.$window = $window;
        this.$location = $location;
        this.$http = $http;
        this.Token_Stogare_Key = 'LelongToken_User_' + this.$window.localStorage.getItem('Lelong_UserLogined');
    }

    TokenService.prototype.Token = {
        username: "",
        access_token: "",
        refresh_token: ""
    }



    /**
	 * Load Token data from the local storage.
	 */
    TokenService.prototype.getToken = function () {
        return JSON.parse(this.$window.localStorage.getItem(this.Token_Stogare_Key)) || [];
    };

    /**
	 * Save Token data in the local storage.
	 */
    TokenService.prototype.saveToken = function (token) {
        this.$window.localStorage.setItem(this.Token_Stogare_Key, JSON.stringify(token));
    }

    TokenService.prototype.checkUserLogin = function () {
        var token = this.getToken();
        if (!token.access_token) {
            this.$window.localStorage.removeItem(this.Token_Stogare_Key);
            this.$location.path('/login');
        }
    }
    TokenService.prototype.removeToken = function () {
        this.$window.localStorage.removeItem(this.Token_Stogare_Key);
    }


    TokenService.prototype.refresh = function (refresh_token) {
        var defer = this.$q.defer();
        var request = {
            method: 'POST',
            url: "https://www.lelong.com.my/oauth2/token",
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            data: 'cliend_id=' + encodeURIComponent("47263efa407b4bdb95e04734d3fad16c") + '&grant_type=refresh_token&refresh_token=' + encodeURIComponent(refresh_token)
        };

        this.$http(request).success(function (result) {
            // update token
            var token = this.getToken();
            token.refresh_token = result.refresh_token;
            token.access_token = result.access_token;
            this.saveToken(token);
            defer.resolve(token);
        }).error(function (err, status) {
            // goto login page
            defer.reject(err);
        });
        return defer.promise;
    }

    TokenService.prototype.verify = function () {
        var token = this.getToken();
        var defer = this.$q.defer();
        var request = {
            method: 'POST',
            url: "https://www.lelong.com.my/api/v2/verify",
            headers: {
                "Authorization": "Bearer " + token.access_token,
                "Accept": "application/json"
            }
        };

        this.$http(request).success(function (result) {
            defer.resolve(token);
        }).error(function (err, status) {
            if (status === 400 && (err == "access token is valid but expired" || err == "access token is invalid")) {
                // refresh token
                this.refresh().then(function (token) {
                    defer.resolve(token);
                })
            } else 
                defer.resolve(token);
                //defer.reject(err);
        });
        return defer.promise;
    };

})();