angular.module("LelongApp.Goods").controller('AccountCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $dbHelper, $window,$ionicSideMenuDelegate, tokenService) {
    $rootScope.$broadcast('hideSearch');
    $scope.initAccount = function()
    {  
        $ionicSideMenuDelegate.toggleLeft();           
    }
});