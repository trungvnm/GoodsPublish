angular.module("LelongApp.Goods").controller('MenuCtrl', function ($scope, $rootScope, $ionicModal, $timeout,$location, $ionicSideMenuDelegate, tokenService) {
    $scope.account = {};
    $scope.account.name = 'NGUYEN TIEN MANH';
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
	}
})
