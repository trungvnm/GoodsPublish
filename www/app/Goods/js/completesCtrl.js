angular.module("LelongApp.controllers").controller('CompletesCtrl', function ($scope, $rootScope, $ionicModal, $timeout) {
    $scope.message = 'This is completes Page';
	
    $scope.goodOnHold = function(){
        //globalService.setQuickAction(true);
        var params = {};
        params.isQuickActions = true;
        $scope.quickactions = true;
        $rootScope.$broadcast('updateIsQuickActions', params);
		
		
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