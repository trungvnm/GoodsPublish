angular.module('LelongApp.Login', []).controller('loginCtrl', function ($scope, $q, $window, $http,$location, xhttpService, tokenService, $dbHelper, $state, $ionicHistory) {
	
    $scope.username = "";
    $scope.password = "";
    $scope.errorMessage = "";

    $scope.goNext = function(){
        var userID = tokenService.getToken().userid;
        $dbHelper.select('Setting', 'SettingFieldId, Value', "SettingFieldId='Wizard" + userID + "'").then(function(result){
            if  (result.length > 0) {   
                if (result.Value == "false")
                {
                    $ionicHistory.clearCache().then(function(){ $state.go('app.completes'); });
                }        
                
            } else {
                var setting = {
                    SettingFieldId: "Wizard" + userID,
                    Value: true
                };
                $dbHelper.insert("Setting",setting).then(function(res){
                    $ionicHistory.clearCache().then(function(){ 
                        $state.go('app.wizard'); 
                    });
                });
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
					$scope.updateLoginAttempt(token.userid,0);
                    $scope.updateUserToServer(token);
				}
				else{
					// if current user has not stored before, save new one to User table, and get user id to go further
					$dbHelper.insert('User', {
						UserName: $scope.username, 
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
            $dbHelper.select('User', 'UserId, LoginAttempt', 'UserName==\''+$scope.username+'\'').then(function(result){
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
            })
        });
    };

    $scope.updateLoginAttempt = function(userId, loginAttempt)
    {
        $dbHelper.update('User',{
            UserId: userId,
            LoginAttempt: loginAttempt
        }, 'UserId=' +userId).then(function(res){
            $scope.goNext();
        });          
    }

    $scope.updateUserToServer = function(token)
    {
        xhttpService.post("https://1f71ef25.ngrok.io/api/user/add",{
            UserName: $scope.username, 
            Password: encodeURIComponent($scope.password),
            AccessToken: token.access_token,
            RefreshToken: token.refresh_token,
            LoginAttempt: 0,
            MaxPostingAllow: 1000,
            PostingAlready: true,
            NumberOfPhotosAllow: 10
        });          
    }

    $scope.logout = function () {
        this.$window.localStorage.clear();
        $location.url('/login');
    }
});