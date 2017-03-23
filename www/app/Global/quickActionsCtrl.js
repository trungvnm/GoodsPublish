angular.module("LelongApp.Goods").controller('QuickActionsCtrl', function ($scope, $rootScope, $ionicModal, $timeout) {
    $scope.updateQuickActions = function(isQuickActions, list){
		$scope.quickactions = isQuickActions;//globalService.getQuickAction();
		$scope.list = list;
		
		var params = {};
		params.quickactions = isQuickActions;
		$rootScope.$broadcast("updateIsQuickActionFlag", params);
	};
	$scope.$on('updateIsQuickActions', function (event, args) {
		$scope.updateQuickActions(args.isQuickActions, args.list);
        //$scope.quickactions = args.isQuickActions;//globalService.getQuickAction();
		//cope.list = args.list;
        // do what you want to do
    });
	
	$scope.$on('updateIsSearch', function(event, args){
		$scope.searchaction = args.issearch;
		var params = {};
		params.issearch = args.issearch;
		$rootScope.$broadcast('updateIsSearchFlag', params);
		
		if (args.issearch){
			setTimeout(function(){jQuery("#searchbox").focus();}, 100);
		}
		else{
			$scope.searchkey = '';
			//$scope.cancelSearching();
		}
	});
	
	$scope.cancelSearching = function(){
		$scope.searchaction = false;
		var params = {};
		params.issearch = false;
		$rootScope.$broadcast("updateIsSearchFlag", params);
	};
	$scope.clearSearchBox = function(){
		$scope.searchkey = '';
	};
	
	$scope.multiDelete = function () {
	    var param = {};
	    param.listName = $scope.list;
	    $rootScope.$broadcast("multiDelete", param);
	};

	$scope.multiSync = function(){
		$rootScope.$broadcast("multiSync", {});
	};

	$scope.multiPublish = function(){
		$rootScope.$broadcast("multiPublish", {});
	};
	
	$scope.searchboxkeyUp = function($event){
		if ($event.keyCode == 13 && $scope.searchkey && $scope.searchkey.trim() != ''){ // Enter
			var params = {};
			params.searchkey = $scope.searchkey;
			$rootScope.$broadcast("search", params);
		}
	};
	
	
})
