// Copyright (c) Microsoft. All rights reserved.  Licensed under the MIT license. See LICENSE file in the project root for full license information.

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

(function () {
    angular.module('LelongApp', ['LelongApp.services', 'LelongApp.controllers', 'LelongApp.directives', 'IonicGallery', 'ionic', 'ngCordova'])

   .run(function ($ionicPlatform,$dbHelper,$rootScope) {
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
        //initial db, tables
        var userFields="UserId integer primary key,UserName text,Password text,access_token text,refresh_token text,LoginAttempt integer,MaxPostingAllow integer,PostingAlready integer,NumberOfPhotosAllow integer";
        var wizardFields="WizardId integer,DaysOfShip integer,ItemsCategory text,ShippingFee text";
        var goodsPublishPhoto="Photoid integer,GoodPublishId integer,PhotoName text,PhotoUrl text,PhotoDescription text";
        var goodsPublish="GoodPublishId integer,UserId integer,Title text,Subtitle text,Guid text,SalePrice real,msrp real,costprice real,SaleType text,Category integer,StoreCategory integer,Brand text,ShipWithin integer,ModelSkuCode text,State text,";
        goodsPublish += "Link text,Description text,Video text,VideoAlign text,Active integer,Weight integer,Quantity integer,ShippingPrice text,WhoPay text,ShippingMethod text,ShipToLocation text,";
        goodsPublish += "PaymentMethod text,GstType integer,OptionsStatus integer";
        $rootScope.db= $dbHelper.openDB();  
        $dbHelper.createTable("User",userFields);
        $dbHelper.createTable("Wizard",wizardFields);
        $dbHelper.createTable("GoodsPublish",goodsPublish);
        $dbHelper.createTable("GoodsPublishPhoto",goodsPublishPhoto);
      });
    })

    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
		$ionicConfigProvider.tabs.position('bottom'); // other values: top
      $stateProvider
	    .state('app', {
		    url: '/app',
		    abstract: true,
		    templateUrl: 'app/Goods/menu.html',
		    controller: 'MenuCtrl'
	      })
        .state('app.completes', {
		    url: '/completes',
		    views: {
			    'menuContent': {
			        templateUrl: 'app/Goods/completes.html',
				    controller: 'CompletesCtrl'
			      },
			      'quickActionsContent':{
			          templateUrl: 'app/Goods/quickactionsbar.html',
				    controller: 'QuickActionsCtrl'
			    }
		    }
	      })
		.state('detail', {
		    url: '/detail',
			templateUrl: 'app/Goods/detail.html',
			controller: 'DetailCtrl'
		})
		.state('edit', {
		    url: '/edit',
			templateUrl: 'app/Goods/edit.html',
			controller: 'EditCtrl'
		});
      $urlRouterProvider.otherwise('/app/completes');
    })
    
    angular.module('LelongApp.directives', []);
    angular.module('LelongApp.controllers', []);
    angular.module('LelongApp.services', ['ngResource']);
	angular.module('IonicGallery', ['ionic','ion-gallery']);

})();