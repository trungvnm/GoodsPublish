angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope,$q, $rootScope, $ionicModal, $timeout, $dbHelper, $window, tokenService, goodsService,utilService, $cordovaToast, $ionicHistory, $state, $ionicTabsDelegate, xhttpService,$ionicLoading, $ionicSideMenuDelegate,$stateParams,$ionicNavBarDelegate) {
	
	function openSearch(){
		var params = {};
		params.issearch = true;
		$scope.issearch = true;
        $rootScope.$broadcast('updateIsSearch', params);
	};
	
	//set up quick actions bar
	var actions = [{
        name: 'search',
        action: function () {
            openSearch();
        }
    },
	{
        name: 'home'
    }];
	
	
	if ($ionicSideMenuDelegate.isOpen()) {
		$ionicSideMenuDelegate.toggleLeft();
	}
	
	$scope.contextRepresenters = [
		// representer of published Tab
		{
			title: 'Published', // text will be display in header bar
			type: 'synced', // a flag to determine filter condition of database fetching data
			order: 1,
			offset: 0,
			hasRemainGoods: false,
			allowLoadMore: true,
			goods: []
		},
		// representer of unpublished Tab
		{
			title: 'New',// text will be display in header bar
			type: 'unsync', // a flag to determine filter condition of database fetching data
			order:0,
			offset: 0,
			hasRemainGoods: false,
			allowLoadMore: true,
			goods: []
		},
		// representer of recent modification Tab
		{
			title: 'Modified',// text will be display in header bar
			type: 'modified', // a flag to determine filter condition of database fetching data
			order:2,
			offset: 0,
			hasRemainGoods: false,
			allowLoadMore: true,
			goods: []
		}
	];
	
	$scope.viewmode = 'grid';
	$scope.limit = 12;
	$scope.counter = 0;
	//$scope.pubCounter = 0;
	$scope.CurrencyUnit = '';
	$scope.popButton = 'addnew';
	$rootScope.$broadcast('showSearch');
	$scope.activates = {}
	
	// Get goods from local database and push them into a tab specified by its index
	$scope.getGoodsInTabs = function(curRepresenter, condition, overwrite){
		var tabIndex = curRepresenter.order;
		if (!tabIndex){
			tabIndex =0;
		}
		var deffered=$q.defer();
		
		if (curRepresenter != null){
			if (!curRepresenter.allowLoadMore){
				deffered.resolve(false);
			}
			curRepresenter.allowLoadMore = false; // disallow other getGoodsInTabs() actions running for conflict resist
			
			goodsService.getAll(curRepresenter.type, curRepresenter.offset, $scope.limit, condition).then(function(res) {
				if (overwrite){
					curRepresenter.goods = res;
				}
				else {
					if (!curRepresenter.goods){
						curRepresenter.goods = [];
					}
					curRepresenter.goods.push.apply(curRepresenter.goods, res);
				}
				curRepresenter.offset += res.length;
				$scope.$broadcast('scroll.infiniteScrollComplete');
				curRepresenter.allowLoadMore = true;
				curRepresenter.hasRemainGoods = (res && res.length == $scope.limit);
				deffered.resolve(true);
			});
		}
		return deffered.promise;
	}

	$scope.countGoodsInTabs = function(cuRepresenter){
		goodsService.countInTab(cuRepresenter.type).then(function(quantity){
			if ($scope.representer.type != 'synced' && quantity == 0){
				// if has no items here, go to homepage
				$ionicHistory.clearCache().then(function(){ $state.go('app.completes'); });
			}
			$scope.counter = quantity;
		});
		// goodsService.countInTab(cuRepresenter.type).then(function(qty){
			// $scope.pubCounter = qty;
		// });
	}

	$scope.strategy = '';
	$scope.CurrencyUnit = '';
	// Initialize first data of page
	$scope.init = function(){
		// determine type of goods
		$scope.type = $stateParams.type;
		var activeName = '';
		if (!$scope.type || $scope.type == null){
			$scope.type = $scope.contextRepresenters[0].order; // set value as default type
		}
		actions.push({name: 'news'});
		actions.push({name: 'modifications'});
		if ($scope.type == 0){
			activeName = "news";
		}
		if ($scope.type == 2){
			activeName = "modifications";
		}
		$rootScope.$broadcast("setMainActions", actions);
		if (activeName != ''){
			$scope.activates[activeName] = 'actived';
			//$rootScope.$broadcast("setActive", activeName);
		}
		
		//get representer object of current context
		$scope.representer = null;
		for (var i = 0; i < $scope.contextRepresenters.length; i++){
			var curPresenter = $scope.contextRepresenters[i];
			if (curPresenter.order == $scope.type){
				$scope.representer = curPresenter;
				break;
			}
		}
		
		resetData();
		$scope.filterMessage = '';
		$scope.hasRemainGoods = false;

		$scope.CurrencyUnit = utilService.getCurrencyUnit();
		$scope.strategy = utilService.getFormatCurrency();
		
		if ($scope.representer == null){
			return;
		}
		$scope.getGoodsInTabs($scope.representer);
		$scope.countGoodsInTabs($scope.representer);
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
		$ionicHistory.clearCache().then(function () {
			$state.go('navbar.addnew', { goodsId: goodId });
		});
	};
	$scope.addnewButtonClick = function(){
		$scope.fabMenuToggle();
		$ionicHistory.clearCache().then(function(){ $state.go('navbar.addnew'); });
	};
	$scope.syncAll = function(){
		$scope.fabMenuToggle();
		/*$scope.goods = [];
		$scope.unsyncTabRepresenter.goods = [];
		$scope.syncedTabRepresenter.goods = []; */

	    if (navigator.notification) {
	        navigator.notification.confirm('Are you sure to get all goods from server (this action will overwrite all local goods and maybe take some time for the big data) ?', function (result) {
	            if (result == 1) {
	                $ionicLoading.show({
	                    template: '<p>Loading ...</p><ion-spinner icon="spiral"></ion-spinner>'
	                });
	                goodsService.syncAll().then(function (result) {
	                    if (result) {
	                        $cordovaToast.showLongTop('Sync all successful!').then(function () {
	                            setTimeout(function () {
									$scope.representer.offset = 0;
	                                $scope.getGoodsInTabs($scope.representer, $scope.filterMessage, true);
									
									$ionicLoading.hide();
									resetCounter();
	                                
										// goto default page
									$ionicHistory.clearCache().then(function(){ $state.go('app.completes'); });
	                                
	                            }, 1000);
	                        });
	                    }
	                    else {
	                        $cordovaToast.showLongTop('Sync all failed!');
	                        $ionicLoading.hide();
	                    }
	                }, function (err) {
	                    $cordovaToast.showLongTop('Sync all failed!');
	                    $ionicLoading.hide();
	                });
	            }
	        })
	    }
	
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
		$scope.getGoodsInTabs($scope.representer, condition);
		
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
								resetCounter();
	                            $scope.quickactions = false;
	                            $scope.$evalAsync();
	                            $scope.init();
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

	// sync any selected goods from Lelong server
	$scope.$on('multiSync', function (event, args) {
	    var messageReuslt = '';
	    var selecteds = getListGoodsToProcess($scope.representer.goods);
	    var messageNotification = ''
	    if (goodsService.checkOveriderGoodsInfo(selecteds))
	    {
	        messageNotification = 'Are you sure to download selected items from server and override your local data?';
	    } else messageNotification = 'Are you sure to download selected items?';

	    if (selecteds.length > 0) {
	        if (navigator.notification) {
	            navigator.notification.confirm(messageNotification, function (result) {
	                if (result == 1) {
	                    $ionicLoading.show({
	                        template: '<p>Loading ...</p><ion-spinner icon="spiral"></ion-spinner>'
	                    });
	                    goodsService.sync(selecteds).then(function (result) {
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
								resetCounter();
                                $cordovaToast.showLongTop(messageReuslt);
                            });
	                    },function(err){
	                    	 $cordovaToast.showLongTop("Sync failed");
	                    	 $ionicLoading.hide();
	                    });
	                }
	            })
	        }
	    }

	});

	$scope.$on('multiPublish', function (event, args) {
	    var selecteds = getListGoodsToProcess($scope.representer.goods);
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
									
	                                messageReuslt = 'Post successful!';
									resetCounter();
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
	    var currentListGoods = $scope.representer.goods;
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
		$scope.representer.goods = [];
		$scope.representer.offset = 0;
		$scope.representer.allowLoadMore = false;
	}
	
	// reset all counter numbers
	function resetCounter(){
		$ionicLoading.hide();
		$rootScope.$broadcast('reset');
		$scope.countGoodsInTabs($scope.representer);
	}
	
	
	
	$(document).ready(function(){
		$("#list-readmode > a.item").on("click", function(e){
			if (e.target.className.indexOf("edit-button") != -1)
				return false;
		});
	});
	
	
});
