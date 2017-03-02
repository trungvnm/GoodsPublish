﻿angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $dbHelper, $window, tokenService, goodsService, $cordovaToast, $ionicHistory, $state) {	
	$scope.init = function(){
		$scope.filterMessage = '';
		$scope.goods = [];
		goodsService.getAll().then(function(result) {
			if (result){
				result.forEach(function(g){
					if (!g.PhotoUrl || g.PhotoUrl.trim() == ''){
						g.PhotoUrl = 'img/nophoto.jpg';
					}
				});
			}
			$scope.goods = result;
			
		});

		//selectGoods();
	};
	
	$scope.exitSearching = function(){
		$scope.filterMessage = '';
		$scope.goods.forEach(function(g){
			g.hidden = false;
		});
	};
	
    $scope.goodOnHold = function(listType){
        var params = {};
        params.isQuickActions = true;
		params.list = listType;
        $scope.quickactions = true;
		$scope.tabclass = 'tabhide';
        $rootScope.$broadcast('updateIsQuickActions', params);
    };
	$scope.goodSwipeLeft = function(good){
		good.goodSlided = 'slided';
		setTimeout(function(){
			$ionicHistory.clearCache().then(function(){ $state.go('edit'); });
		}, 250);
		
	};
	$scope.editButtonClick = function(gId){
		$ionicHistory.clearCache().then(function(){ $state.go('navbar.addnew',{goodsId:gId}); });
	};
	$scope.goodClick = function($event,goodId){
		if ($event.target.className.indexOf("edit-button") != -1)
			return false;
		$ionicHistory.clearCache().then(function(){ $state.go('navbar.detail', {id: goodId, context: 'navbar.detail'}); });
	};
	$scope.addnewButtonClick = function(){
		$ionicHistory.clearCache().then(function(){ $state.go('navbar.addnew'); });
	};
	$scope.$on('updateIsQuickActionFlag', function(event, args){
		$scope.quickactions = args.quickactions;
		if (!$scope.quickactions){
			$scope.tabclass = '';
		}
	});
	$scope.$on('search', function(event, args){
		if ($scope.goods){
			var key = args.searchkey;
			$scope.filterMessage = 'Search for \''+key+'\':';
			$scope.goods.forEach(function(g){
				if (g.Title.toLowerCase().indexOf(key.toLowerCase()) == -1){
					g.hidden = true;
				}
			})
		}
		var params = {};
		params.issearch = false;
        $rootScope.$broadcast('updateIsSearch', params);
		/*$scope.goods = [];
		var key = args.searchkey;
		var whereClause = 'Title LIKE \'%'+key+'%\'';
		$scope.filterMessage = 'Search for \''+key+'\':';
		goodsService.search(key).then(function(result) {
			$scope.goods = result;
		});
		
		var params = {};
		params.issearch = false;
        $rootScope.$broadcast('updateIsSearch', params);*/
	});
	$scope.$on('multiDelete', function(event, args){
		if (navigator.notification){
			navigator.notification.confirm('Are you sure to delete selected items?', function(result){
				if (result == 1){
					var ids = [];
					$scope.goods.forEach(function(g){
						if (g.Checked){
							ids.push(g.GoodPublishId);
						}
					});
					if (ids.length > 0){
						goodsService.deleteGoods(ids).then(function(result){
							if (result){
								$cordovaToast.showLongTop('Delete successful!');
								$scope.init();
								$scope.quickactions = false;
							}
							else{
								$cordovaToast.showLongTop('Delete failed!');
							}
						});
					}
				}
			})
		}
	});
	
	$(document).ready(function(){
		$("#list-readmode > a.item").on("click", function(e){
			if (e.target.className.indexOf("edit-button") != -1)
				return false;
		});

	});
});