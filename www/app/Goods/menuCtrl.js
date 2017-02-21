angular.module("LelongApp.controllers").controller('MenuCtrl', function ($scope, $ionicModal, $timeout, $ionicSideMenuDelegate) {
    $scope.account = {};
    $scope.account.name = 'NGUYEN TIEN MANH';
    $scope.toggleLeft = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
})
