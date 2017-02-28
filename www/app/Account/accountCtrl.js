angular.module("LelongApp.Goods").controller('AccountCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $dbHelper, $window,$ionicSideMenuDelegate, tokenService) {
    $scope.initAccount = function()
    {  
        $ionicSideMenuDelegate.toggleLeft();           
    }
});