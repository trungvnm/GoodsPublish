angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope,$q, $rootScope, $ionicModal, $timeout, $dbHelper, $window, tokenService, goodsService, $cordovaToast, $ionicHistory, $state, $ionicTabsDelegate, xhttpService,$ionicLoading) {
	
	// representer of unpublished Tab
	$scope.unsyncTabRepresenter = {
		order:0,
		offset: 0,
		hasRemainGoods: false,
		allowLoadMore: true,
		goods: [],
		reset: function(){
			$scope.unsyncTabRepresenter.offset = 0;
			$scope.unsyncTabRepresenter.hasRemainGoods = false;
			$scope.unsyncTabRepresenter.goods = [];
		}
	}
	
	// representer of published Tab
	$scope.syncedTabRepresenter = {
		order: 1,
		offset: 0,
		hasRemainGoods: false,
		allowLoadMore: true,
		goods: [],
		reset: function(){
			$scope.syncedTabRepresenter.offset = 0;
			$scope.syncedTabRepresenter.hasRemainGoods = false;
			$scope.syncedTabRepresenter.goods = [];
		}
	}
	
	$scope.viewmode = 'grid';
	$scope.limit = 12;
	$scope.unpubCounter = 0;
	$scope.pubCounter = 0;
	$scope.CurrencyUnit = '';
	$scope.popButton = 'addnew';
	$rootScope.$broadcast('showSearch');
	
	// Get goods from local database and push them into a tab specified by its index
	$scope.getGoodsInTabs = function(tabIndex, condition, overwrite){
		if (!tabIndex){
			tabIndex =0;
		}
		var deffered=$q.defer();
		var tabRepresenter = null;
		var type = '';
		if (tabIndex == $scope.unsyncTabRepresenter.order){
			// work with Unpublished Tab
			tabRepresenter = $scope.unsyncTabRepresenter;
			type = 'unsync';
		}
		else if (tabIndex == $scope.syncedTabRepresenter.order){
			// work with Published Tab
			tabRepresenter = $scope.syncedTabRepresenter;
			type = 'synced';
		}
		
		if (tabRepresenter != null){
			if (!tabRepresenter.allowLoadMore){
				deffered.resolve(false);
			}
			tabRepresenter.allowLoadMore = false; // disallow other getGoodsInTabs() actions running for conflict resist
			
			goodsService.getAll(type, tabRepresenter.offset, $scope.limit, condition).then(function(res) {
				if (overwrite){
					tabRepresenter.goods = res;
				}
				else {
					tabRepresenter.goods.push.apply(tabRepresenter.goods, res);
				}
				tabRepresenter.offset += res.length;
				$scope.$broadcast('scroll.infiniteScrollComplete');
				tabRepresenter.allowLoadMore = true;
				tabRepresenter.hasRemainGoods = (res && res.length == $scope.limit);
				deffered.resolve(true);
			});
		}
		return deffered.promise;
	}

	$scope.countGoodsInTabs = function(){
		return goodsService.countInTab('unpublish').then(function(quantity){
			$scope.unpubCounter = quantity;
			goodsService.countInTab('published').then(function(qty){
				$scope.pubCounter = qty;
			});
		});
	}

	
	// Initialize first data of page
	$scope.init = function(){
		resetData();
		$scope.filterMessage = '';
		$scope.hasRemainGoods = false;
		
		$scope.CurrencyUnit = $window.localStorage.getItem("Lelong_CurrencyUnit");

		$scope.getGoodsInTabs(0);
		$scope.getGoodsInTabs(1);
		//selectGoods();
		$scope.countGoodsInTabs();
		
	};
	
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
		var params = {};
		params.issearch = false;
		$rootScope.$broadcast('updateIsSearch', params);
		
		$scope.init();
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
		$scope.unsyncTabRepresenter.goods = [];
		$scope.syncedTabRepresenter.goods = []; */
		$ionicLoading.show({
			template: '<p>Logging in...</p><ion-spinner icon="spiral"></ion-spinner>'
		});
		goodsService.syncAll().then(function(result){
			if (result){
				$cordovaToast.showLongTop('Sync all successful!').then(function(){
					setTimeout(function(){
						$scope.unsyncTabRepresenter.offset = 0;
						$scope.syncedTabRepresenter.offset = 0;
						$scope.getGoodsInTabs(0, $scope.filterMessage, true);
						$scope.getGoodsInTabs(1, $scope.filterMessage, true);
						
						// update new total of goods to menu
						goodsService.countAll().then(function(quantity){
							var menuParams = {};
							menuParams.goodCounter = quantity;
							$rootScope.$broadcast('update',menuParams);
							//$rootScope.$broadcast('hideSpinner');
							$ionicLoading.hide();
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
		resetData();
		
		var key = args.searchkey;
		var condition = 'Title LIKE \'%'+ key +'%\'';
		$scope.filterMessage = 'Filtered by \''+key+'\':';
		//var tabIndex = $ionicTabsDelegate.selectedIndex();
		$scope.getGoodsInTabs(0, condition);
		$scope.getGoodsInTabs(1, condition);
		
		// hide search panel
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
	    var selecteds = getListGoodsToProcess($scope.syncedTabRepresenter.goods);
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
	    var selecteds = getListGoodsToProcess($scope.unsyncTabRepresenter.goods);
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
	        case 'synced':
	            currentListGoods = $scope.syncedTabRepresenter.goods;
	            break;
	        case 'unsynced':
	            currentListGoods = $scope.unsyncTabRepresenter.goods;
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
	            deffered.resolve(goodsObj);
	        });
	        promises.push(deffered.promise);
	    });
	    return $q.all(promises);
	}
	
	// reset and clear all data and status params to initialized state
	function resetData(){
		$scope.syncedTabRepresenter.reset();
		$scope.unsyncTabRepresenter.reset();
		allowLoadMore = true;
	}
	
	$(document).ready(function(){
		$("#list-readmode > a.item").on("click", function(e){
			if (e.target.className.indexOf("edit-button") != -1)
				return false;
		});
	});
	
	
});
