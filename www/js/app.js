// Copyright (c) Microsoft. All rights reserved.  Licensed under the MIT license. See LICENSE file in the project root for full license information.

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

(function () {
    var db=null;
    angular.module('LelongApp', ['LelongApp.services', 'LelongApp.controllers', 'LelongApp.directives', 'ionic','ngCordova'])

   .run(function ($ionicPlatform,$dbHelper) {
      $ionicPlatform.ready(function() {
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
        //initial db, table
         db=$dbHelper.openDB(); 
      });
    })

    .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
	    .state('app', {
		    url: '/app',
		    abstract: true,
		    templateUrl: 'app/Goods/view/menu.html',
		    controller: 'MenuCtrl'
	      })
        .state('app.completes', {
		    url: '/completes',
		    views: {
			    'menuContent': {
			        templateUrl: 'app/Goods/view/completes.html',
				    controller: 'CompletesCtrl'
			      },
			      'quickActionsContent':{
			          templateUrl: 'app/Goods/view/quickactionsbar.html',
				    controller: 'QuickActionsCtrl'
			    }
		    }
	      });
      $urlRouterProvider.otherwise('/app/completes');
    })
    
    angular.module('LelongApp.directives', []);
    angular.module('LelongApp.controllers', []);
    angular.module('LelongApp.services', ['ngResource']);

})();