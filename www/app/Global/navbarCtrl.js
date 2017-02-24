angular.module("LelongApp.Goods").controller('NavbarCtrl', function ($scope, $ionicHistory, $rootScope, $ionicModal, $timeout,$location, $ionicSideMenuDelegate, tokenService){
	$scope.mainActions = {};
	$scope.subActions = {};
	$scope.$on("setMainActions", function(event, actionsList){
		$scope.mainActions = actionsList;
	});
	
	$scope.isHasAction = function(name){
		for (var i = 0; i < $scope.mainActions.length; i++){
			var action = $scope.mainActions[i];
			if (action.name == name){
				return true;
			}
		}
		return false;
	}
	
	$scope.exeMainAction = function(name){
		for (var i = 0; i < $scope.mainActions.length; i++){
			var action = $scope.mainActions[i];
			if (action.name == name && action.action != undefined){
				action.action();
				return;
			}
		}
	}
	
	$scope.exeSubAction = function(name){
		for (var i = 0; i < $scope.subActions.length; i++){
			var action = $scope.subActions[i];
			if (action.name == name && action.action != undefined){
				action.action();
				return;
			}
		}
	}
	
	// back to referrer
	$scope.goBack = function(){
		$ionicHistory.goBack();
	};
	
	// when click search button, open search box on header
	$scope.openSearch = function(){
		//var params = {};
		//params.issearch = true;
		$scope.isSearchEnabled = true;
        //$rootScope.$broadcast('updateIsSearch', params);
	};
	
	$scope.cancelSearchingg = function(){
		$scope.isSearchEnabled = false;
	}
})
