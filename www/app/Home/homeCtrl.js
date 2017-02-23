(function () {
    'use strict';

    angular.module("LelongApp.controllers").controller('homeCtrl', ['$scope', homeCtrl]);
    /**
        home controller constructor
	 */
    function homeCtrl($scope) {
        //init data
        init();
    }
    function init() {
        console.log('start app');
    }

})();