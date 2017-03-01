angular.module("LelongApp.Goods").controller('MenuCtrl', function ($scope, $rootScope, $ionicModal, $timeout,$location, $ionicSideMenuDelegate, tokenService, $window,goodsService) {
	$scope.goodCounter = 0;
    $scope.account = {};
    $scope.account.name = $window.localStorage.getItem("Lelong_UserLogined");
    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
	
	// when click search button, open search box on header
	$scope.openSearch = function(){
		var params = {};
		params.issearch = true;
		$scope.issearch = true;
        $rootScope.$broadcast('updateIsSearch', params);
	};
	
	$scope.$on('updateIsSearchFlag', function (event, args) {
        // do what you want to do
		$scope.issearch = args.issearch;
	});
	$scope.logout = function () {
	    tokenService.removeToken();
	    $location.url('/login');
	};
	
	$scope.init = function(){
		// count quantity of goods 
		goodsService.countAll().then(function(quantity){
			$scope.goodCounter = quantity;
		});
	}
})
