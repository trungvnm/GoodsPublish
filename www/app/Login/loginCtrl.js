﻿angular.module('LelongApp.Login', []).controller('loginCtrl', function ($scope, $q, $window, $http,$location, xhttpService, tokenService, $dbHelper, $state, $ionicHistory) {
	
    $scope.username = "";
    $scope.password = "";
    $scope.errorMessage = "";

    $scope.goNext = function(){
        $dbHelper.select('Setting', 'SettingFieldId, IsInstalled', " SettingFieldId=='Wizard'").then(function(result){
            if  (result.length > 0)
            {
                $ionicHistory.clearCache().then(function(){ $state.go('app.completes'); });
            }
            else{
                $dbHelper.insert("Setting",{SettingFieldId: 'Wizard', IsInstalled: 'true'}).then(function(res){
                    $ionicHistory.clearCache().then(function(){ $state.go('app.wizard'); });
                }, function (err) {
                    $scope.errorMessage = "ERROR Insert Setting Table: " + err;
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
					$scope.updateLoginAttempt(token.userid,0);                      
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
					});
                    // xhttpService.post("/app/User/Add",{
                    //     UserName: $scope.username, 
                    //     Password: encodeURIComponent($scope.password)
                    // }).then(function(res){
                    //     debugger;
                    //     token.userid = result.insertId;
                    //     tokenService.saveToken(token);
                    //     $scope.updateLoginAttempt(token.userid,0);
                    // })
				}                
			});

            defer.resolve("success");
        }, function (err) {
            var loginAttempt = 0;
            $dbHelper.select('User', 'UserId, LoginAttempt', 'UserName==\''+$scope.username+'\'').then(function(result){
               if  (result[0].LoginAttempt < 5)
                {
                    loginAttempt = result[0].LoginAttempt;
                    loginAttempt++;
                    $scope.updateLoginAttempt(result[0].UserId, loginAttempt);
                    $scope.errorMessage ="invalid username or password. Please try again!";
                    defer.reject(err);
                }  
                else
                {
                    $scope.errorMessage ="Account: " + $scope.username + " has been blocked!";
                }              
            })            
        });
        return defer.promise;
    };

    $scope.updateLoginAttempt = function(userId, loginAttempt)
    {
        $dbHelper.update('User',{
            UserId: userId,
            LoginAttempt: loginAttempt
        }, 'UserId=' +userId).then(function(res){
            if  (loginAttempt == 0)
            {
                $scope.goNext();
            }            
        });          
    }

    $scope.logout = function () {
        this.$window.localStorage.clear();
        $location.url('/login');
    }
});