// Copyright (c) Microsoft. All rights reserved.  Licensed under the MIT license. See LICENSE file in the project root for full license information.

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

(function () {
    angular.module('LelongApp', ['LelongApp.services', 'LelongApp.Goods', 'LelongApp.Home','LelongApp.Login', 'IonicGallery', 'ionic', 'ngCordova', 'ngIdle'])
    .controller('idleCtrl', function ($scope, Idle, $location, $window) {
        $scope.$on('IdleTimeout', function () {
            console.log('time out after 30 minutes no action');
            $window.localStorage.clear();
            $location.path('/login');
        });

    })
   .run(function ($ionicPlatform, $dbHelper, $rootScope, Idle) {
       $ionicPlatform.ready(function () {
        Idle.watch();
        console.log('start watch app');
        if(window.cordova && window.cordova.plugins.Keyboard) {
          // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
          // for form inputs)
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

          // Don't remove this line unless you know what you are doing. It stops the viewport
          // from snapping when text inputs are focused. Ionic handles this internally for
          // a much nicer keyboard experience.
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
        //initial db, tables
        $rootScope.db= $dbHelper.openDB();         
        $dbHelper.initialDB();                
      });
    })

    .config(function ($stateProvider, $urlRouterProvider, IdleProvider, KeepaliveProvider) {
        IdleProvider.idle(5); // in seconds
        IdleProvider.timeout(5); // in seconds
        KeepaliveProvider.interval(2); // in seconds

        $stateProvider
          .state('app', {
              url: '/app',
              abstract: true,
              templateUrl: 'app/Goods/view/menu.html'
              
          })
          .state('app.completes', {
              url: '/completes',
              views: {
                  'menuContent': {
                      templateUrl: 'app/Goods/view/completes.html'
                     
                  },
                  'quickActionsContent': {
                      templateUrl: 'app/Goods/view/quickactionsbar.html'
                     
                  }
              }
          })
          .state('detail', {
              url: '/detail',
              templateUrl: 'app/Goods/view/detail.html'
              
          })
          .state('login', {
              url: '/login',
              templateUrl: 'app/Login/login.html'
          });
      $urlRouterProvider.otherwise('/app/completes');
    })

   
    angular.module('LelongApp.Goods', []);
    angular.module('LelongApp.Home', []);
    angular.module('LelongApp.Login', []);

    angular.module('LelongApp.services', ['ngResource']);
	angular.module('IonicGallery', ['ionic','ion-gallery']);

})();