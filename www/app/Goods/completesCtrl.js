angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope,$q, $rootScope, $ionicModal, $timeout, $dbHelper, $window, tokenService, goodsService, $cordovaToast, $ionicHistory, $state, $ionicTabsDelegate, xhttpService,$ionicLoading) {
	$scope.viewmode = 'grid';
	$scope.limit = 12;
	var offset = 0;
	var allowLoadMore = true; // A flag to allow getGoodsInTabs() action running
	$scope.hasRemainGoods = false;
	
	$scope.popButton = 'addnew';
	$rootScope.$broadcast('showSearch');
	
	$scope.getGoodsInTabs = function(){
		if (!allowLoadMore){
			return;
		}
		allowLoadMore = false; // disallow other getGoodsInTabs() actions running for conflict resist
		// get data for All Tab
		return goodsService.getAll('all', offset, $scope.limit).then(function(result) {
			$scope.goods.push.apply($scope.goods, result);
			if (result && result.length > 0){
				$scope.hasRemainGoods = true;
				// get data for Unsync Tab
				return goodsService.getAll('unsync', offset, $scope.limit).then(function(res) {
					$scope.unSyncedGoods.push.apply($scope.unSyncedGoods, res);
					return goodsService.getAll('synced', offset, $scope.limit).then(function(r) {
						$scope.syncedGoods.push.apply($scope.syncedGoods, r);
						
						// increase offset for loading more
						offset += $scope.limit;
						
						$scope.$broadcast('scroll.infiniteScrollComplete');
						allowLoadMore = true;
						return true;
					});
				});
			}
			else $scope.hasRemainGoods = false;
		});
	}
	
	
	$scope.init = function(){
		offset = 0;
		allowLoadMore = true; // A flag to allow getGoodsInTabs() action running
		$scope.hasRemainGoods = false;
		
		$scope.filterMessage = '';
		$scope.goods = [];
		$scope.unSyncedGoods = [];
		$scope.syncedGoods = [];
		
		return $scope.getGoodsInTabs();
		//selectGoods();
	};
	
	// Load more goods from database
	/*$scope.loadMore=function(type){
		if (allowLoadMore){
			getGoodsInTabs().then(function(result){
				if (result){
					
				}
			});
		}
	};*/
	
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
		
		var params = {};
		params.issearch = false;
		$rootScope.$broadcast('updateIsSearch', params);
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
		//$ionicHistory.clearCache().then(function(){ $state.go('navbar.addnew',{goodsId:gId}); });
		$ionicHistory.clearCache().then(function () {
			$state.go('navbar.addnew', { goodsId: gId });
		});
	};
	$scope.goodClick = function($event,goodId){
		if ($event.target.className.indexOf("edit-button") != -1)
			return false;
		$ionicHistory.clearCache().then(function () {
			$state.go('navbar.addnew', { goodsId: goodId });
		});
	};
	$scope.addnewButtonClick = function(){
		$ionicHistory.clearCache().then(function(){ $state.go('navbar.addnew'); });
	};
	$scope.syncAll = function(){
		/*$scope.goods = [];
		$scope.unSyncedGoods = [];
		$scope.syncedGoods = []; */
		$ionicLoading.show({
			template: '<p>Loading...</p><ion-spinner></ion-spinner>'
		});
		goodsService.syncAll($scope.goods, function(result){
			$cordovaToast.showLongTop('Sync all successful!');
			$scope.init().then(function(){
				// update new total of goods to menu
				return goodsService.countAll().then(function(quantity){
					var menuParams = {};
					menuParams.goodCounter = quantity;
					$rootScope.$broadcast('update',menuParams);
					//$rootScope.$broadcast('hideSpinner');
					$ionicLoading.hide();
				});
			});
		});
	}
	$scope.$on('updateIsQuickActionFlag', function(event, args){
		$scope.quickactions = args.quickactions;
		if (!$scope.quickactions){
			$scope.tabclass = '';
		}
	});
	$scope.$on('search', function(event, args){
		if ($scope.goods){
			var key = args.searchkey;
			$scope.filterMessage = 'Filtered by \''+key+'\':';
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
	
	// delete any selected goods
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
								$scope.quickactions = false;
								$scope.init().then(function(){
									// update new total of goods to menu
									goodsService.countAll().then(function(quantity){
										var menuParams = {};
										menuParams.goodCounter = quantity;
										$rootScope.$broadcast('update',menuParams);
									});
								});
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
					$scope.syncedGoods.forEach(function(g){
						if (g.Checked){
							selecteds.push(g);
						}
					});
					
					if (selecteds.length > 0){
						$ionicLoading.show({
							template: '<p>Loading...</p><ion-spinner></ion-spinner>'
						});
						goodsService.sync(selecteds, function(){
							$cordovaToast.showLongTop('Sync successful!');
							$scope.init();
							$scope.quickactions = false;
							
							$ionicLoading.hide();
						});
						/*var total = 0;
						selecteds.forEach(function(g){
							goodsService.sync(selecteds, function() {
								total++;
							});
						});
						if (selecteds.length = total) {
							$cordovaToast.showLongTop('Sync successful!');
							$scope.init();
							$scope.quickactions = false;
						} else {
							$cordovaToast.showLongTop('Sync failed!');
						}*/
					}
				}
			})
		}
	});

	$scope.$on('multiPublish', function (event, args) {
	    if (navigator.notification) {
	        navigator.notification.confirm('Are you sure to publish selected items?', function (result) {
	            if (result == 1) {
	                $ionicLoading.show({
	                    template: '<p>Publishing...</p><ion-spinner></ion-spinner>'
	                })
	                var selecteds = [];
	                $scope.unSyncedGoods.forEach(function (g) {
	                    if (g.Checked) {
	                        selecteds.push(g);
	                    }
	                });
	                if (selecteds.length > 0) {
	                    getListGoodsPublish(selecteds).then(function (listGoodsPublish) {
	                        goodsService.publish(listGoodsPublish).then(function (result) {
	                            if (result.message === 'Success') {
	                                $ionicLoading.hide();
	                                $cordovaToast.showLongTop('Post successful!');
	                                $scope.init();
	                                $scope.quickactions = false;
	                            } else {
	                                $ionicLoading.hide();
	                                $cordovaToast.showLongTop('Post failed!');
	                            }
	                        });
	                    })

	                }
	            }
	        })
	    }
	});

	function getListGoodsPublish(selecteds) {
	    var promises = [];
	    selecteds.forEach(function (g) {
	        var deffered = $q.defer();
	        goodsService.getGoodsById(g.GoodPublishId).then(function (goodsObj) {
	            $dbHelper.select('GoodsPublishPhoto', 'PhotoName,PhotoUrl,PhotoDescription', 'GoodPublishId = \'' + g.GoodPublishId + '\'').then(function (result) {
	                if (result && result.length > 0) {
	                    result.forEach(function (photo) {
	                        if (!goodsObj.listPhoto)
	                            goodsObj.listPhoto = [];
	                        goodsObj.listPhoto.push({
	                            PhotoName: photo.PhotoName,
	                            PhotoUrl: photo.PhotoUrl,
	                            PhotoDescription: photo.PhotoDescription
	                        });
	                    });
	                }
	                deffered.resolve(goodsObj);
	            });
	        });
	        promises.push(deffered.promise);
	    });
	    return $q.all(promises);
	}
	
	$(document).ready(function(){
		$("#list-readmode > a.item").on("click", function(e){
			if (e.target.className.indexOf("edit-button") != -1)
				return false;
		});
	});
	
	
});