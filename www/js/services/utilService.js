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
		self.goDirectView = function(viewID){
			var backView = $ionicHistory.viewHistory().views[viewID];
			$ionicHistory.forcedNav = {
				viewId:     backView.viewId,
				navAction: 'moveBack',
				navDirection: 'back'
			};
			backView && backView.go();
		};
		self.unsavedConfirm = function() {
			if (navigator.notification) {
				navigator.notification.confirm('You have unsaved changes, are you sure that you want to leave?', function (result) {
					if (result == 1) {
						$scope.hasChange = false;
						//$ionicHistory.goBack(-1);
						self.goDirectView($ionicHistory.backView().viewId);
					}
				})
			}
		}
	})