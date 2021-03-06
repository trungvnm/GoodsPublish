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
            numThousandSep: ','
          });
        }])
})();