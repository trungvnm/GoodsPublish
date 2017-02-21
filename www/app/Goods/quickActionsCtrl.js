angular.module("LelongApp.controllers").controller('QuickActionsCtrl', function ($scope, $ionicModal, $timeout) {
    $scope.$on('scanner-started', function (event, args) {
        $scope.quickactions = args.isQuickActions;//globalService.getQuickAction();
        // do what you want to do
    });
})
