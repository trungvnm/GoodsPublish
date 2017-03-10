angular.module("LelongApp.Goods").controller('MenuCtrl', function ($scope, $rootScope, $ionicModal, $timeout,$location, $ionicSideMenuDelegate, tokenService, $window,goodsService, $state, $ionicHistory) {
	$scope.goodCounter = 0;
    $scope.account = {};
    $scope.account.name = $window.localStorage.getItem("Lelong_UserLogined");
	$scope.showSearch = false;
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
	
	$scope.$on('getTotalGoods', function (event, args) {
        // do what you want to do
		args.totalGoods = $scope.goodCounter;
	});
	
	//======= snippet control =====
	$scope.$on("showSpinner", function(event){
		$("ion-spinner").addClass("show");
	});
	$scope.$on("hideSpinner", function(event){
		$("ion-spinner").removeClass("show");
	});

	//show search icon on each page
	$scope.$on("showSearch", function(event){
		$scope.showSearch = true;
	});
	$scope.$on("hideSearch", function(event){
		$scope.showSearch = false;
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
	};
	
	// update total number of goods
	$scope.$on("update", function(event, args){
		for(var propertyName in args) {
			var value = args[propertyName];
			$scope[propertyName] = value;
		   // propertyName is what you want
		   // you can get the value like this: myObject[propertyName]
		}
	});
	
	$scope.goodMenuClick = function(){
		$ionicHistory.clearCache().then(function(){
			$state.go('app.completes');
		});
	}
})
