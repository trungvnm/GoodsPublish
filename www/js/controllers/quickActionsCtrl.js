angular.module("LelongApp.controllers").controller('QuickActionsCtrl', function ($scope, $ionicModal, $timeout) {
    $scope.$on('updateIsQuickActions', function (event, args) {
        $scope.quickactions = args.isQuickActions;//globalService.getQuickAction();
        // do what you want to do
    });
	
	$scope.$on('updateIsSearch', function(event, args){
		$scope.searchaction = args.issearch;
	})
})
