angular.module("LelongApp.controllers").controller('MenuCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $ionicSideMenuDelegate) {
    $scope.account = {};
    $scope.account.name = 'NGUYEN TIEN MANH';
    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
	
	// when click search button, open search box on header
	$scope.openSearch = function(){
		var params = {};
		params.issearch = true;
        $rootScope.$broadcast('updateIsSearch', params);
	};
})
