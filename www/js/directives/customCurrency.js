(function () {
    'use strict';

    angular.module('LelongApp.Goods').filter('customCurrency', function () {

  return function (input, scope) {	  
	if (scope.CurrencyUnit == undefined) return input;
	
	var _symbol = scope.CurrencyUnit || "$";
	var _format = "%s%v";
	var _decimal = ".";
	var _thousand = ",";
	var _precision = 2;
	if (scope.CurrencyUnit == "₫"){
		_format = "%v %s";
		_precision = 0;
	}
	else if (scope.CurrencyUnit == "CAD$" || scope.CurrencyUnit == "kr" || scope.CurrencyUnit == "€"){
		_thousand = " ";
		_decimal = ",";
	}
	return accounting.formatMoney(input, { symbol: _symbol,  format: _format, decimal: _decimal, thousand: _thousand, precision: _precision});	
  };
})})();