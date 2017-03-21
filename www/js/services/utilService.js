angular.module('LelongApp.services')
	.service('utilService',function ($window) {
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
		self.getFormatCurrency = function(isSymbol){
			var currency = $window.localStorage.getItem("Lelong_CurrencyUnit");
			var strategy = "";
			var tail = isSymbol ? "" : "_NoSymbol";			
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
			return strategy + tail;      
		}		
	})