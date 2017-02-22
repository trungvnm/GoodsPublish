angular.module('LelongApp.controllers', []).controller('loginCtrl', function ($scope, $q, $window, $http, xhttpService, tokenService) {

    $scope.username = "";
    $scope.password = "";

    $scope.login = function () {
        var defer = $q.defer();
        var urlLogin = "https://www.lelong.com.my/oauth2/token";
        var data = 'username=' + encodeURIComponent($scope.username) + '&password=' + encodeURIComponent($scope.password) + '&client_id=' + encodeURIComponent("47263efa407b4bdb95e04734d3fad16c") + '&grant_type=password';
        xhttpService.login(urlLogin, data).then(function (result) {
            // save user and token to localStogate
            $window.localStorage.setItem("Lelong_UserLogined", username);
            var token = { username: $scope.password, access_token: result.access_token, refresh_token: result.refresh_token };
            tokenService.saveToken(token);
            defer.resolve("success");
        }, function (err) {
            defer.reject(err);
        });
        return defer.promise;
    };

    $scope.logout = function () {
        this.$window.localStorage.clear();
        $location.url('/login');
    }
});