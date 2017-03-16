angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope,$q, $rootScope, $ionicModal, $timeout, $dbHelper, $window, tokenService, goodsService, $cordovaToast, $ionicHistory, $state, $ionicTabsDelegate, xhttpService,$ionicLoading) {
	$scope.viewmode = 'grid';
	$scope.limit = 12;
	var offset = 0;
	var allowLoadMore = true; // A flag to allow getGoodsInTabs() action running
	$scope.hasRemainGoods = false;
	$scope.unpubCounter = 0;
	$scope.pubCounter = 0;
	
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

	$scope.countGoodsInTabs = function(){
		return goodsService.countInTab('unpublish').then(function(quantity){
			$scope.unpubCounter = quantity;
			goodsService.countInTab('published').then(function(qty){
				$scope.pubCounter = qty;
			});
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
		
		$scope.countGoodsInTabs();
		
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
		if (tabIndex == 1){
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
		goodsService.syncAll().then(function(result){
			if (result){
				$cordovaToast.showLongTop('Sync all successful!').then(function(){
					setTimeout(function(){
						$scope.init().then(function(){
							// update new total of goods to menu
							goodsService.countAll().then(function(quantity){
								var menuParams = {};
								menuParams.goodCounter = quantity;
								$rootScope.$broadcast('update',menuParams);
								//$rootScope.$broadcast('hideSpinner');
								$ionicLoading.hide();
							});
							$scope.countGoodsInTabs();
						});
					}, 1000);
				});
			}
			else{
				$cordovaToast.showLongTop('Sync failed!');
			}
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
	$scope.$on('multiDelete', function (event, args) {
	    var messageReuslt = '';
	    var selecteds = getlistGoodsSeletedToDelete(args.listName);
	    if (selecteds.length > 0) {
	        if (navigator.notification) {
	            navigator.notification.confirm('Are you sure to delete selected items?', function (result) {
	                if (result == 1) {
	                    $ionicLoading.show({
	                        template: '<p>Processing...</p><ion-spinner></ion-spinner>'
	                    });
	                    goodsService.deleteGoods(selecteds).then(function (result) {
	                        if (result) {
								// exit quick actions mode
								var params = {};
								params.isQuickActions = false;
								params.list = args.listName;
								$rootScope.$broadcast('updateIsQuickActions', params);
								
	                            messageReuslt = 'Delete successful!';
	                            $scope.quickactions = false;
	                            $scope.$evalAsync();
	                            $scope.init().then(function () {
	                                // update new total of goods to menu
	                                goodsService.countAll().then(function (quantity) {
	                                    var menuParams = {};
	                                    menuParams.goodCounter = quantity;
	                                    $ionicLoading.hide();
	                                    $rootScope.$broadcast('update', menuParams);
	                                });
									$scope.countGoodsInTabs();
	                            });
	                        }
	                        else {
	                            messageReuslt = 'Delete failed!';
	                        }
	                    }).finally(function () {
	                        $ionicLoading.hide();
	                        $cordovaToast.showLongTop(messageReuslt);
	                    });
	                }

	            })
	        }
	    }

	});

	$scope.$on('multiSync', function (event, args) {
	    var messageReuslt = '';
	    var selecteds = getListGoodsToProcess($scope.syncedGoods);
	    if (selecteds.length > 0) {
	        if (navigator.notification) {
	            navigator.notification.confirm('Are you sure to download selected items?', function (result) {
	                if (result == 1) {
	                    $ionicLoading.show({
	                        template: '<p>Loading...</p><ion-spinner></ion-spinner>'
	                    });
	                    goodsService.sync(selecteds, function () {
							// exit quick actions mode
							var params = {};
							params.isQuickActions = false;
							params.list = args.listName;
							$rootScope.$broadcast('updateIsQuickActions', params);
							
	                        messageReuslt = 'Sync successful!';
	                        $scope.quickactions = false;
	                        $scope.$evalAsync(
                            function () {
                                $scope.init();
                                $ionicLoading.hide();
                                $cordovaToast.showLongTop(messageReuslt);
                            });
	                    });
	                }
	            })
	        }
	    }

	});

	$scope.$on('multiPublish', function (event, args) {
	    var selecteds = getListGoodsToProcess($scope.unSyncedGoods);
	    var messageReuslt = '';
	    if (selecteds.length > 0) {
	        if (navigator.notification) {
	            navigator.notification.confirm('Are you sure to publish selected items?', function (result) {
	                if (result == 1) {
	                    $ionicLoading.show({
	                        template: '<p>Publishing...</p><ion-spinner></ion-spinner>'
	                    });
	                    getListGoodsPublish(selecteds).then(function (listGoodsPublish) {
	                        goodsService.publish(listGoodsPublish).then(function (result) {
	                            if (result.message === 'Success') {
									// exit quick actions mode
									var params = {};
									params.isQuickActions = false;
									params.list = args.listName;
									$rootScope.$broadcast('updateIsQuickActions', params);
									
	                                messageReuslt = 'Post successful!'
	                                $scope.init();
	                                $scope.quickactions = false;
	                                $scope.$evalAsync();
	                            } else {
	                                messageReuslt = 'Post fail!'
	                            }
	                        }).finally(function () {
	                            $ionicLoading.hide();
	                            $cordovaToast.showLongTop(messageReuslt);
	                        });
	                    }, function () {
	                        $ionicLoading.hide();
	                        $cordovaToast.showLongTop('Post fail!');
	                    })
	                }
	            });
	        }

	    }
	});

	function getListGoodsToProcess(listGoods) {
	    var selecteds = [];
	    listGoods.forEach(function (g) {
	        if (g.Checked) {
	            selecteds.push(g);
	        }
	    });
	    return selecteds;
	}

	function getlistGoodsSeletedToDelete(listName) {
	    var selecteds = [];
	    var currentListGoods = [];
	    switch (listName) {
	        case 'all':
	            currentListGoods = $scope.goods;
	            break;
	        case 'synced':
	            currentListGoods = $scope.syncedGoods;
	            break;
	        case 'unsynced':
	            currentListGoods = $scope.unSyncedGoods;
	            break;
	        default:
	    }
	    currentListGoods.forEach(function (g) {
	        if (g.Checked) {
	            selecteds.push(g);
	        }
	    });
	    return selecteds;
	}

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