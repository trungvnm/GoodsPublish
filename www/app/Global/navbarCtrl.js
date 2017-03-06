angular.module("LelongApp.Goods").controller('NavbarCtrl', function ($scope, $ionicHistory, $rootScope, $ionicModal, $timeout,$location, $ionicSideMenuDelegate, tokenService){
	$scope.disabled = {};
	$scope.mainActions = [];
	$scope.subActions = [];
	$scope.$on("setMainActions", function(event, actionsList){
		$scope.mainActions = actionsList;
	});
	$scope.$on("setSubActions", function(event, actionsList){
		$scope.subActions = actionsList;
	});
	$scope.$on("disableMainAction", function(event, name){
		for (var i = 0; i < $scope.mainActions.length; i++){
			var action = $scope.mainActions[i];
			if (action.name == name){
				$scope.disabled[name] = true;
				return;
			}
		}
	});
	$scope.$on("enableMainAction", function(event, name){
		for (var i = 0; i < $scope.mainActions.length; i++){
			var action = $scope.mainActions[i];
			if (action.name == name){
				$scope.disabled[name] = false;
				return;
			}
		}
	});
	
	$scope.$on("disableSubAction", function(event, name){
		for (var i = 0; i < $scope.subActions.length; i++){
			var action = $scope.subActions[i];
			if (action.name == name){
				$scope.disabled[name] = true;
				return;
			}
		}
	});
	$scope.$on("enableSubAction", function(event, name){
		for (var i = 0; i < $scope.subActions.length; i++){
			var action = $scope.subActions[i];
			if (action.name == name){
				$scope.disabled[name] = false;
				return;
			}
		}
	});
	
	//======= snippet control =====
	$scope.$on("showSpinner", function(event){
		$("ion-spinner").addClass("show");
	});
	$scope.$on("hideSpinner", function(event){
		$("ion-spinner").removeClass("show");
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
		//$ionicHistory.goBack();
		$ionicHistory.backView().go();
	};
	
	// when click search button, open search box on header
	$scope.openSearch = function(){
		$scope.isSearchEnabled = true;
	};
	
	// action for cancel searching button
	$scope.cancelSearchingg = function(){
		$scope.isSearchEnabled = false;
	};
})
