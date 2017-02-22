angular.module('LelongApp.controllers', []).controller('loginCtrl', function ($scope, $q, $window, $http,$location, xhttpService, tokenService) {

    $scope.username = "";
    $scope.password = "";
    $scope.errorMessage = "";
    $scope.login = function () {
        $scope.errorMessage = "";
        var defer = $q.defer();
        var urlLogin = "https://www.lelong.com.my/oauth2/token";
        var data = 'username=' + encodeURIComponent($scope.username) + '&password=' + encodeURIComponent($scope.password) + '&client_id=' + encodeURIComponent("47263efa407b4bdb95e04734d3fad16c") + '&grant_type=password';
        xhttpService.login(urlLogin, data).then(function (result) {
            // save user and token to localStogate
            $window.localStorage.setItem("Lelong_UserLogined", $scope.username);
            var token = { username: $scope.username, access_token: result.data.access_token, refresh_token: result.data.refresh_token };
            tokenService.saveToken(token);
            $location.path('/app/completes');
            defer.resolve("success");
        }, function (err) {
            $scope.errorMessage ="invalid username or password. Please try again!"
            defer.reject(err);
        });
        return defer.promise;
    };

    $scope.logout = function () {
        this.$window.localStorage.clear();
        $location.url('/login');
    }
});