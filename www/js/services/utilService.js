angular.module('LelongApp.services')
	.service('utilService',function ($window, $ionicHistory) {
		var self = this;		
		self.getCurrencyUnit = function(){
			var currency = $window.localStorage.getItem("Lelong_CurrencyUnit");
			var currencyunit = "";				
			switch (currency){
				case "VND":
					currencyunit = '₫';
					break;
				case "USD":
					currencyunit = '$';
					break;
				case "MYR":
					currencyunit= 'RM';
					break;
			}				 
			return currencyunit;
		};
		self.getFormatCurrency = function(){
			var currency = $window.localStorage.getItem("Lelong_CurrencyUnit");
			var strategy = "";
			switch (currency){
				case "VND":
					strategy = 'priceVND';
					break;
				case "USD":
					strategy = 'priceUSD';
					break;
				case "MYR":
					strategy= 'priceMYR';
					break;
			}				 
			return strategy;      
		};
		
		self.directGoBack = function(){
			var currView = $ionicHistory.currentView();
			var data = $ionicHistory.viewHistory().views;
			var arr = $.map(data, function(el) { return el; });

			if(arr == null || arr.length < 2) $state.go('app.completes');

			if(arr[arr.length - 2].url != currView.url) $ionicHistory.goBack();
			else{
				var flagDiff = false;
				for(var i = arr.length - 2; i--; i >= 0){
					if(currView.stateName != arr[i].stateName){
						flagDiff = true;
						var backView = $ionicHistory.viewHistory().views[arr[i].viewId];
						$ionicHistory.forcedNav = {
							viewId:     backView.viewId,
							navAction: 'moveBack',
							navDirection: 'back'
						};
						backView && backView.go();
						break;
					}
				}
				if(!flagDiff) $state.go('app.completes');
			}
		};
	})