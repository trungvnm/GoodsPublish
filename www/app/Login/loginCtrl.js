angular.module('LelongApp.Login', []).controller('loginCtrl', function ($rootScope, $scope, $q, $window, $http,$location, xhttpService, tokenService, $dbHelper, $state, $ionicHistory, $ionicLoading) {
	
    $scope.username = "";
    $scope.password = "";
    $scope.errorMessage = "";

    $scope.goNext = function(){
        var userID = tokenService.getToken().userid;
        $dbHelper.select('Setting', 'SettingFieldId, Value', "SettingFieldId='Wizard" + userID + "'").then(function(result){
            if  (result.length > 0
            && result[0].Value.toLowerCase() == 'true') {
                $ionicHistory.clearCache().then(function(){ 
                    $state.go('app.completes'); 
                    $ionicLoading.hide();
                });
            } else {
                $scope.updateSetting(userID);
                $ionicLoading.hide();
                if (navigator.notification) {
					navigator.notification.confirm('This is the first time you login. Do you want to setup wizard?', function (result) {
                        if (result == 1) {
                            $state.go('app.wizard');
                        } else {
                            $ionicHistory.clearCache().then(function(){ $state.go('app.completes'); });
                        }
                    });
                } else {
                    $ionicHistory.clearCache().then(function(){ $state.go('app.completes'); });
                }
            }
        });
	};

    $scope.IsValid = function()
    {
        if  ($scope.username.trim() == "")
        {
            $scope.errorMessage = "User Name can't blank!";
            return false;
        }
        if  ($scope.password.trim() == "")
        {
            $scope.errorMessage = "Password can't blank!";
            return false;
        }
        return true;
    };
   
    $scope.login = function () {
        if (!$scope.IsValid()) return 0;
        $scope.errorMessage = "";
        var urlLogin = "https://www.lelong.com.my/oauth2/token";
        var data = 'username=' + encodeURIComponent($scope.username.toLowerCase()) + '&password=' + encodeURIComponent($scope.password) + '&client_id=' + encodeURIComponent("47263efa407b4bdb95e04734d3fad16c") + '&grant_type=password';
        $ionicLoading.show({
            template: '<p>Logging in...</p>'
        })
        xhttpService.login(urlLogin, data).then(function (result) {            
            // save user and token to localStogate
            $window.localStorage.setItem("Lelong_UserLogined", $scope.username.toLowerCase());
            var token = { username: $scope.username.toLowerCase(), access_token: result.data.access_token, refresh_token: result.data.refresh_token };
            
			// get user from User table
			$dbHelper.select('User', 'UserId', 'UserName==\''+$scope.username.toLowerCase()+'\'').then(function(result){
				if (result.length > 0){
					//$window.localStorage.setItem("userid", result[0].UserId);
					token.userid = result[0].UserId;
					tokenService.saveToken(token);
					$scope.updateLoginAttempt(token.userid,0);
                    $scope.updateUserToServer(token);
				}
				else{
					// if current user has not stored before, save new one to User table, and get user id to go further
					$dbHelper.insert('User', {
						UserName: $scope.username.toLowerCase(), 
						Password: encodeURIComponent($scope.password)
					}).then(function(result){
						token.userid = result.insertId;
						tokenService.saveToken(token);
                        $scope.updateLoginAttempt(token.userid,0);
                        $scope.updateUserToServer(token);
					});
				}
			});
        }, function (err) {
            var loginAttempt = 0;
            $dbHelper.select('User', 'UserId, LoginAttempt', 'UserName==\''+$scope.username.toLowerCase()+'\'').then(function(result){
                if (result.length == 0) {
                    $scope.errorMessage ="invalid username or password. Please try again!";
                } else if  (result[0].LoginAttempt < 5) {
                    loginAttempt = result[0].LoginAttempt;
                    loginAttempt++;
                    $scope.updateLoginAttempt(result[0].UserId, loginAttempt);
                    $scope.errorMessage ="invalid username or password. Please try again!";
                } else {
                    $scope.errorMessage ="Account: " + $scope.username + " has been blocked!";
                }
                $ionicLoading.hide();
            });
        });
    };

    $scope.updateLoginAttempt = function(userId, loginAttempt)
    {
        $dbHelper.update('User',{
            UserId: userId,
            LoginAttempt: loginAttempt
        }, 'UserId=' +userId).then(function(res){
            if (loginAttempt === 0) {
                $scope.goNext();
            }
        });
    };

    $scope.updateUserToServer = function(token)
    {
        xhttpService.post("http://d00dd351.ngrok.io/api/user/add",{
            UserName: $scope.username.toLowerCase(), 
            Password: window.btoa($scope.password),
            AccessToken: token.access_token,
            RefreshToken: token.refresh_token,
            LoginAttempt: 0,
            MaxPostingAllow: 1000,
            PostingAlready: true,
            NumberOfPhotosAllow: 10
        });          
    };

    $scope.updateSetting = function(userId) {
        $dbHelper.select('Setting', 'SettingFieldId, Value', "SettingFieldId='Wizard" + userId + "'").then(function(result){
            var setting = {
                SettingFieldId: "Wizard" + userId,
                Value: true
            };
            if  (result.length > 0) {   
                $dbHelper.update("Setting",setting, "SettingFieldId='Wizard" + userId + "'");
            } else {
                $dbHelper.insert("Setting",setting);
            }
        });
        
    };

    $scope.logout = function () {
        this.$window.localStorage.clear();
        $location.url('/login');
    };
});