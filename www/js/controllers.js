angular.module('starter.controllers', [])

/*.service('globalService', function(){
	var isQuickAction = false;
	var setQuickAction = function(value){
		isQuickAction = value;
	}
	var getQuickAction = function(){
		return isQuickAction;
	}
	return {
		setQuickAction: setQuickAction,
		getQuickAction: getQuickAction
	}
})*/
.controller('MenuCtrl', function($scope, $ionicModal, $timeout, $ionicSideMenuDelegate) {
	$scope.account = {};
	$scope.account.name = 'NGUYEN TIEN MANH';
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
})
.controller('QuickActionsCtrl', function($scope, $ionicModal, $timeout) {
	$scope.$on('scanner-started', function(event, args) {
		$scope.quickactions = args.isQuickActions;//globalService.getQuickAction();
		// do what you want to do
	});
})
.controller('CompletesCtrl', function($scope,$rootScope, $ionicModal, $timeout) {
	$scope.message = 'This is completes Page';
	
	$scope.goodOnHold = function(){
		//globalService.setQuickAction(true);
		var params = {};
		params.isQuickActions = true;
		$scope.quickactions = true;
		$rootScope.$broadcast('scanner-started', params);
		
		
		document.addEventListener("backbutton", backButtonFunction, false);
		function backButtonFunction(){
			$("form").submit(function(e){
				e.preventDefault();
				alert("back pressed");
				return false;
				
			});
			return false;
		}
	} 
});