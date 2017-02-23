angular.module("LelongApp.Goods").controller('CompletesCtrl', function ($scope, $rootScope, $ionicModal, $timeout) {
    $scope.message = 'This is completes Page';
    $scope.goodOnHold = function(){
        var params = {};
        params.isQuickActions = true;
        $scope.quickactions = true;
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
	}
});