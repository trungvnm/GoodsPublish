angular.module('LelongApp.Login', []).controller('loginCtrl', function ($scope, $q, $window, $http,$location, xhttpService, tokenService, $dbHelper, $state, $ionicHistory) {
	
    $scope.username = "";
    $scope.password = "";
    $scope.errorMessage = "";
	$scope.goNext = function(){
		$ionicHistory.clearCache().then(function(){ $state.go('app.completes'); });
	};
    $scope.login = function () {
        $scope.errorMessage = "";
        var defer = $q.defer();
        var urlLogin = "https://www.lelong.com.my/oauth2/token";
        var data = 'username=' + encodeURIComponent($scope.username) + '&password=' + encodeURIComponent($scope.password) + '&client_id=' + encodeURIComponent("47263efa407b4bdb95e04734d3fad16c") + '&grant_type=password';
        xhttpService.login(urlLogin, data).then(function (result) {
            // save user and token to localStogate
            $window.localStorage.setItem("Lelong_UserLogined", $scope.username);
            var token = { username: $scope.username, access_token: result.data.access_token, refresh_token: result.data.refresh_token };
            
			
			// get user from User table
			$dbHelper.select('User', 'UserId', 'UserName==\''+$scope.username+'\'').then(function(result){
				if (result.length > 0){
					//$window.localStorage.setItem("userid", result[0].UserId);
					token.userid = result[0].UserId;
					tokenService.saveToken(token);
					$scope.goNext();
				}
				else{
					// if current user has not stored before, save new one to User table, and get user id to go further
					$dbHelper.insert('User', {
						UserName: $scope.username, 
						Password: encodeURIComponent($scope.password)
					}).then(function(result){
						token.userid = result.insertId;
						tokenService.saveToken(token);
						//$window.localStorage.setItem("userid", result.insertId);
						$scope.goNext();
					});
				}
			});

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