angular.module("LelongApp.Goods").controller('NavbarCtrl', function ($scope, $ionicHistory, $rootScope, $ionicModal, $timeout,$location, $ionicSideMenuDelegate, tokenService,utilService, $state,$ionicPopover, goodsService, $stateParams){
	// reset data when view start change
	$rootScope.$on('$stateChangeStart', function(ev, toState, toParams, fromState, fromParams){
		$scope.activates = {};
		$scope.mainActions = [];
		$scope.subActions = [];
	});
	$scope.disabled = {};
	$scope.mainActions = [];
	$scope.subActions = [];
	$scope.$on("setMainActions", function(event, actionsList){
		$scope.mainActions = actionsList;
	});
	$scope.$on("setSubActions", function(event, actionsList){
		$scope.subActions = actionsList;
	});
	
	$scope.init = function(){
		$scope.type = $stateParams.type;
		$scope.countNews();
		$scope.countModified();
	}
	
	// when button back clicked
	$scope.onbacked = function(){
		$ionicHistory.goBack();
		$rootScope.$broadcast("setMainActions", $scope.actions);
	}
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
	
	//set active status to an icon
	$scope.$on("setActive", function(event, name){
		$scope.activates = {};
		for (var i = 0; i < $scope.mainActions.length; i++){
			var action = $scope.mainActions[i];
			if (action.name == name){
				$scope.activates[name] = 'actived';
				return;
			}
		}
	})
	$scope.$on("unsetActive", function(event, name){
		$scope.activates = {};
		for (var i = 0; i < $scope.mainActions.length; i++){
			var action = $scope.mainActions[i];
			if (action.name == name){
				$scope.activates[name] = '';
				return;
			}
		}
	})
	
	$scope.$on("reset", function(event){
		$scope.init();
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
	
	// check an icon whether is actived now
	$scope.isActivate = function(name){
		return $scope.activates && $scope.activates[name];
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
				$scope.popover.hide();
				return;
			}
		}
	}
	
	// back to referrer
	$scope.goBack = function(){
		if ($rootScope.hasChanged) {
			if (navigator.notification) {
				navigator.notification.confirm('You have unsaved changes, are you sure that you want to leave?', function (result) {
					if (result == 1) {
						$rootScope.hasChanged = false;
						//$ionicHistory.goBack(-1);
						utilService.directGoBack();
					}
				})
			}
		} else {
			//$ionicHistory.goBack(-1);
			utilService.directGoBack();
		}
	};
	
	// when click search button, open search box on header
	$scope.openSearch = function(){
		$scope.isSearchEnabled = true;
	};
	
	// action for cancel searching button
	$scope.cancelSearching = function(){
		$scope.isSearchEnabled = false;
	};

	 $ionicPopover.fromTemplateUrl('templates/popover.html', {
	    scope: $scope,
	  }).then(function(popover) {
	    $scope.popover = popover;
	  });
	  
	  $scope.countNews = function(){
		goodsService.countInTab('unsync').then(function(result){
			$scope.news = result;
		});
	}
	
	$scope.countModified = function(){
		goodsService.countInTab('modified').then(function(result){
			$scope.modified = result;
		});
	}
	
	$scope.goNewsPage = function(){
		$ionicHistory.clearCache().then(function () {
			$state.go('navbar.goods', { type: 0 });
		});
	}
	
	$scope.goModificationPage = function(){
		$ionicHistory.clearCache().then(function () {
			$state.go('navbar.goods', { type: 2 });
		});
	}
	
	$scope.goHome = function(){
		$ionicHistory.clearCache().then(function () {
			$state.go('app.completes');
		});
	}
})
