(function () {
    'use strict';

    angular.module('LelongApp.Goods', ["dynamicNumber"]).config(['dynamicNumberStrategyProvider', function(dynamicNumberStrategyProvider){
          dynamicNumberStrategyProvider.addStrategy('priceVND', {
            numInt: 10,
            numFract: 0,
            numSep: ',',
            numPos: true,
            numNeg: false,
            numRound: 'round',
            numThousand: true,
            numThousandSep: '.',
						numAppend: '₫'
          });
					dynamicNumberStrategyProvider.addStrategy('priceVND_NoSymbol', {
            numInt: 10,
            numFract: 0,
            numSep: ',',
            numPos: true,
            numNeg: false,
            numRound: 'round',
            numThousand: true,
            numThousandSep: '.'
          });					
					dynamicNumberStrategyProvider.addStrategy('priceUSD', {
            numInt: 10,
            numFract: 2,
            numSep: '.',
            numPos: true,
            numNeg: false,
            numRound: 'round',
            numThousand: true,
            numThousandSep: ',',
						numPrepend: '$'
          });
					dynamicNumberStrategyProvider.addStrategy('priceUSD_NoSymbol', {
            numInt: 10,
            numFract: 2,
            numSep: '.',
            numPos: true,
            numNeg: false,
            numRound: 'round',
            numThousand: true,
            numThousandSep: ','
          });
					dynamicNumberStrategyProvider.addStrategy('priceMYR', {
            numInt: 10,
            numFract: 2,
            numSep: '.',
            numPos: true,
            numNeg: false,
            numRound: 'round',
            numThousand: true,
            numThousandSep: ',',
						numPrepend: 'RM'
          });					
					dynamicNumberStrategyProvider.addStrategy('priceMYR_NoSymbol', {
            numInt: 10,
            numFract: 2,
            numSep: '.',
            numPos: true,
            numNeg: false,
            numRound: 'round',
            numThousand: true,
            numThousandSep: ','
          });
        }])
// 		.filter('customCurrency',function () {
//   return function (input, scope) {	  
// 	if (scope.CurrencyUnit == undefined) return input;
	
// 		var _symbol = isSymbol ? scope.CurrencyUnit || "$" : '';
// 		var _format = "%s%v";
// 		var _decimal = ".";
// 		var _thousand = ",";
// 		var _precision = 2;
// 		if (scope.CurrencyUnit == "₫"){
// 			_format = "%v %s";
// 			_precision = 0;
// 		}
// 		else if (scope.CurrencyUnit == "CAD$" || scope.CurrencyUnit == "kr" || scope.CurrencyUnit == "€"){
// 			_thousand = " ";
// 			_decimal = ",";
// 		}
		
// 		return accounting.formatMoney(input, { symbol: _symbol,  format: _format, decimal: _decimal, thousand: _thousand, precision: _precision});	
		
	
//   };
// })	

})();