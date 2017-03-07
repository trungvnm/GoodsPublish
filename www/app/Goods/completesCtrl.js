angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $dbHelper, $window, tokenService, goodsService, $cordovaToast, $ionicHistory, $state, $ionicTabsDelegate, xhttpService) {	
	$scope.popButton = 'addnew';
	$rootScope.$broadcast('showSearch');
	$scope.init = function(){
		$scope.filterMessage = '';
		$scope.goods = [];
		$scope.unSyncedGoods = [];
		$scope.syncedGoods = [];
		goodsService.getAll().then(function(result) {
			if (result){
				result.forEach(function(g){
					if (!g.PhotoUrl || g.PhotoUrl.trim() == ''){
						g.PhotoUrl = './img/nophoto.jpg';
					}
					if (g.LastSync && g.LastSync.trim() != ''){
						$scope.syncedGoods.push(g);
					}
					else{
						$scope.unSyncedGoods.push(g);
					}
				});
			}
			$scope.goods = result;
			
		});

		//selectGoods();
	};
	
	// when a tab has been selected
	$scope.onTabSelected = function(){
		var tabIndex = $ionicTabsDelegate.selectedIndex();
		if (tabIndex == 2){
			$scope.popButton = 'syncall';
		}
		else{
			$scope.popButton = 'addnew';
		}
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
	});
	
	$scope.$on('multiDelete', function(event, args){
		if (navigator.notification){
			navigator.notification.confirm('Are you sure to delete selected items?', function(result){
				if (result == 1){
					var selecteds = [];
					$scope.goods.forEach(function(g){
						if (g.Checked){
							selecteds.push(g);
						}
					});
					if (selecteds.length > 0){
						goodsService.deleteGoods(selecteds).then(function(result){
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

	$scope.$on('multiSync', function(event, args){
		if (navigator.notification){
			navigator.notification.confirm('Are you sure to download selected items?', function(result){
				if (result == 1){
					var selecteds = [];
					$scope.goods.forEach(function(g){
						if (g.Checked){
							selecteds.push(g);
						}
					});
					if (selecteds.length > 0){
						goodsService.sync(selecteds).then(function(result){
							if (result){
								$cordovaToast.showLongTop('Sync successful!');
								$scope.init();
								$scope.quickactions = false;
							}
							else{
								$cordovaToast.showLongTop('Sync failed!');
							}
						});
					}
				}
			})
		}
	});

	$scope.$on('multiPublish', function(event, args){
		if (navigator.notification){
			navigator.notification.confirm('Are you sure to publish selected items?', function(result){
				if (result == 1){
					var selecteds = [];
					$scope.goods.forEach(function(g){
						if (g.Checked){
							selecteds.push(g);
						}
					});
					if (selecteds.length > 0){
						/*goodsService.publish(selecteds).then(function(result){
							if (result){
								$cordovaToast.showLongTop('Delete successful!');
								$scope.init();
								$scope.quickactions = false;
							}
							else{
								$cordovaToast.showLongTop('Delete failed!');
							}
						});*/
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