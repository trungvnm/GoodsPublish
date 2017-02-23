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
	};
	$scope.$on('updateIsQuickActionFlag', function(event, args){
		$scope.quickactions = args.quickactions;
		if (!$scope.quickactions){
			$scope.tabclass = '';
		}
	});
	
	$(document).ready(function(){
		$("#list-readmode > a.item").click(function(e){
			if (e.target.className.indexOf("edit-button") != -1)
				return false;
			/*$(this).closest("a.item").click(function(){
				return false;
			});
			$(this).closest("a.item").css({"pointer-events": "none"});*/
		});

	});
	
});