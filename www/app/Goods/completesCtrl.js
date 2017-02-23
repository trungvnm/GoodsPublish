angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope, $rootScope, $ionicModal, $timeout) {
    $scope.message = 'This is completes Page';
    $scope.goodOnHold = function(listType){
        var params = {};
        params.isQuickActions = true;
		params.list = listType;
        $scope.quickactions = true;
		$scope.tabclass = 'tabhide';
        $rootScope.$broadcast('updateIsQuickActions', params);
    };
	$scope.goodSwipeLeft = function(){
		$scope.goodSlided = 'slided';
		setTimeout(function(){
			window.location = '#/edit';
		}, 250);
		
	};
	$scope.editButtonClick = function($event){
		window.location = '#/edit';
		$event.preventDefault();
		return false;
	};
	$scope.$on('updateIsQuickActionFlag', function(event, args){
		$scope.quickactions = args.quickactions;
		if (!$scope.quickactions){
			$scope.tabclass = '';
		}
	});
});