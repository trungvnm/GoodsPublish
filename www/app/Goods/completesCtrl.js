var myapp = angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope,$q, $rootScope, $ionicModal, $timeout, $dbHelper, $window, tokenService, goodsService, $cordovaToast, $ionicHistory, $state, $ionicTabsDelegate, xhttpService,$ionicLoading) {
	
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

	$scope.initCurrency = function(){
		return goodsService.getCurrencyUnit().then(function(res){
			$scope.CurrencyUnit = res;
			$window.localStorage.setItem("Lelong_CurrencyUnit", $scope.CurrencyUnit);
		});
	}
	
	// Initialize first data of page
	$scope.init = function(){
		resetData();
		$scope.filterMessage = '';
		$scope.hasRemainGoods = false;
		$scope.getGoodsInTabs(0);
		$scope.getGoodsInTabs(1);
		//selectGoods();
		$scope.countGoodsInTabs();
		$scope.initCurrency();
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

myapp.filter('customCurrency', function () {
var mapping = {"ALL":{"text":"Lek","uniDec":"76, 101, 107","uniHex":"4c, 65, 6b"},"AFN":{"text":"؋","uniDec":"1547","uniHex":"60b"},"ARS":{"text":"$","uniDec":"36","uniHex":"24"},"AWG":{"text":"ƒ","uniDec":"402","uniHex":"192"},"AUD":{"text":"$","uniDec":"36","uniHex":"24"},"AZN":{"text":"ман","uniDec":"1084, 1072, 1085","uniHex":"43c, 430, 43d"},"BSD":{"text":"$","uniDec":"36","uniHex":"24"},"BBD":{"text":"$","uniDec":"36","uniHex":"24"},"BYR":{"text":"p.","uniDec":"112, 46","uniHex":"70, 2e"},"BZD":{"text":"BZ$","uniDec":"66, 90, 36","uniHex":"42, 5a, 24"},"BMD":{"text":"$","uniDec":"36","uniHex":"24"},"BOB":{"text":"$b","uniDec":"36, 98","uniHex":"24, 62"},"BAM":{"text":"KM","uniDec":"75, 77","uniHex":"4b, 4d"},"BWP":{"text":"P","uniDec":"80","uniHex":"50"},"BGN":{"text":"лв","uniDec":"1083, 1074","uniHex":"43b, 432"},"BRL":{"text":"R$","uniDec":"82, 36","uniHex":"52, 24"},"BND":{"text":"$","uniDec":"36","uniHex":"24"},"KHR":{"text":"៛","uniDec":"6107","uniHex":"17db"},"CAD":{"text":"$","uniDec":"36","uniHex":"24"},"KYD":{"text":"$","uniDec":"36","uniHex":"24"},"CLP":{"text":"$","uniDec":"36","uniHex":"24"},"CNY":{"text":"¥","uniDec":"165","uniHex":"a5"},"COP":{"text":"$","uniDec":"36","uniHex":"24"},"CRC":{"text":"₡","uniDec":"8353","uniHex":"20a1"},"HRK":{"text":"kn","uniDec":"107, 110","uniHex":"6b, 6e"},"CUP":{"text":"₱","uniDec":"8369","uniHex":"20b1"},"CZK":{"text":"Kč","uniDec":"75, 269","uniHex":"4b, 10d"},"DKK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"DOP":{"text":"RD$","uniDec":"82, 68, 36","uniHex":"52, 44, 24"},"XCD":{"text":"$","uniDec":"36","uniHex":"24"},"EGP":{"text":"£","uniDec":"163","uniHex":"a3"},"SVC":{"text":"$","uniDec":"36","uniHex":"24"},"EEK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"EUR":{"text":"€","uniDec":"8364","uniHex":"20ac"},"FKP":{"text":"£","uniDec":"163","uniHex":"a3"},"FJD":{"text":"$","uniDec":"36","uniHex":"24"},"GHC":{"text":"¢","uniDec":"162","uniHex":"a2"},"GIP":{"text":"£","uniDec":"163","uniHex":"a3"},"GTQ":{"text":"Q","uniDec":"81","uniHex":"51"},"GGP":{"text":"£","uniDec":"163","uniHex":"a3"},"GYD":{"text":"$","uniDec":"36","uniHex":"24"},"HNL":{"text":"L","uniDec":"76","uniHex":"4c"},"HKD":{"text":"$","uniDec":"36","uniHex":"24"},"HUF":{"text":"Ft","uniDec":"70, 116","uniHex":"46, 74"},"ISK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"INR":{"text":"","uniDec":"","uniHex":""},"IDR":{"text":"Rp","uniDec":"82, 112","uniHex":"52, 70"},"IRR":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"IMP":{"text":"£","uniDec":"163","uniHex":"a3"},"ILS":{"text":"₪","uniDec":"8362","uniHex":"20aa"},"JMD":{"text":"J$","uniDec":"74, 36","uniHex":"4a, 24"},"JPY":{"text":"¥","uniDec":"165","uniHex":"a5"},"JEP":{"text":"£","uniDec":"163","uniHex":"a3"},"KZT":{"text":"лв","uniDec":"1083, 1074","uniHex":"43b, 432"},"KPW":{"text":"₩","uniDec":"8361","uniHex":"20a9"},"KRW":{"text":"₩","uniDec":"8361","uniHex":"20a9"},"KGS":{"text":"лв","uniDec":"1083, 1074","uniHex":"43b, 432"},"LAK":{"text":"₭","uniDec":"8365","uniHex":"20ad"},"LVL":{"text":"Ls","uniDec":"76, 115","uniHex":"4c, 73"},"LBP":{"text":"£","uniDec":"163","uniHex":"a3"},"LRD":{"text":"$","uniDec":"36","uniHex":"24"},"LTL":{"text":"Lt","uniDec":"76, 116","uniHex":"4c, 74"},"MKD":{"text":"ден","uniDec":"1076, 1077, 1085","uniHex":"434, 435, 43d"},"MYR":{"text":"RM","uniDec":"82, 77","uniHex":"52, 4d"},"MUR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"MXN":{"text":"$","uniDec":"36","uniHex":"24"},"MNT":{"text":"₮","uniDec":"8366","uniHex":"20ae"},"MZN":{"text":"MT","uniDec":"77, 84","uniHex":"4d, 54"},"NAD":{"text":"$","uniDec":"36","uniHex":"24"},"NPR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"ANG":{"text":"ƒ","uniDec":"402","uniHex":"192"},"NZD":{"text":"$","uniDec":"36","uniHex":"24"},"NIO":{"text":"C$","uniDec":"67, 36","uniHex":"43, 24"},"NGN":{"text":"₦","uniDec":"8358","uniHex":"20a6"},"NOK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"OMR":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"PKR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"PAB":{"text":"B/.","uniDec":"66, 47, 46","uniHex":"42, 2f, 2e"},"PYG":{"text":"Gs","uniDec":"71, 115","uniHex":"47, 73"},"PEN":{"text":"S/.","uniDec":"83, 47, 46","uniHex":"53, 2f, 2e"},"PHP":{"text":"₱","uniDec":"8369","uniHex":"20b1"},"PLN":{"text":"zł","uniDec":"122, 322","uniHex":"7a, 142"},"QAR":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"RON":{"text":"lei","uniDec":"108, 101, 105","uniHex":"6c, 65, 69"},"RUB":{"text":"руб","uniDec":"1088, 1091, 1073","uniHex":"440, 443, 431"},"SHP":{"text":"£","uniDec":"163","uniHex":"a3"},"SAR":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"RSD":{"text":"Дин.","uniDec":"1044, 1080, 1085, 46","uniHex":"414, 438, 43d, 2e"},"SCR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"SGD":{"text":"$","uniDec":"36","uniHex":"24"},"SBD":{"text":"$","uniDec":"36","uniHex":"24"},"SOS":{"text":"S","uniDec":"83","uniHex":"53"},"ZAR":{"text":"R","uniDec":"82","uniHex":"52"},"LKR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"SEK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"CHF":{"text":"CHF","uniDec":"67, 72, 70","uniHex":"43, 48, 46"},"SRD":{"text":"$","uniDec":"36","uniHex":"24"},"SYP":{"text":"£","uniDec":"163","uniHex":"a3"},"TWD":{"text":"NT$","uniDec":"78, 84, 36","uniHex":"4e, 54, 24"},"THB":{"text":"฿","uniDec":"3647","uniHex":"e3f"},"TTD":{"text":"TT$","uniDec":"84, 84, 36","uniHex":"54, 54, 24"},"TRY":{"text":"","uniDec":"","uniHex":""},"TRL":{"text":"₤","uniDec":"8356","uniHex":"20a4"},"TVD":{"text":"$","uniDec":"36","uniHex":"24"},"UAH":{"text":"₴","uniDec":"8372","uniHex":"20b4"},"GBP":{"text":"£","uniDec":"163","uniHex":"a3"},"USD":{"text":"$","uniDec":"36","uniHex":"24"},"UYU":{"text":"$U","uniDec":"36, 85","uniHex":"24, 55"},"UZS":{"text":"лв","uniDec":"1083, 1074","uniHex":"43b, 432"},"VEF":{"text":"Bs","uniDec":"66, 115","uniHex":"42, 73"},"VND":{"text":"₫","uniDec":"8363","uniHex":"20ab"},"YER":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"ZWD":{"text":"Z$","uniDec":"90, 36","uniHex":"5a, 24"}};

  return function (input, scope) {	  
	if (scope.CurrencyUnit == undefined) return input;
	if (scope.CurrencyUnit == "VND"){
		return accounting.formatMoney(input,  { symbol: mapping[scope.CurrencyUnit].text,  format: "%v %s" });
	}
	else if (scope.CurrencyUnit == "CAD" || scope.CurrencyUnit == "DKK" || scope.CurrencyUnit == "EUR"){
		return accounting.formatMoney(input, mapping[scope.CurrencyUnit].text||$, 2, " ", ",");
	}   
	else{
		return accounting.formatMoney(input, mapping[scope.CurrencyUnit].text||$, 2, ",", ".");
	}
  };
});