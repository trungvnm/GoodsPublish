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
	});
	
	$scope.cancelSearchingg = function(){
		$scope.searchaction = false;
		var params = {};
		params.issearch = false;
		$rootScope.$broadcast("updateIsSearchFlag", params);
	};
	
	$scope.multiDelete = function(){
		$rootScope.$broadcast("multiDelete", {});
	};
	
	$scope.searchboxkeyUp = function($event){
		if ($event.keyCode == 13){ // Enter
			var params = {};
			params.searchkey = $scope.searchkey;
			$rootScope.$broadcast("search", params);
		}
	}
})
