angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $dbHelper, $window, tokenService, $cordovaToast) {
	// select many goods by user and extra conditions
	function selectGoods(whereClause){
		$scope.goods = [];
		// load goods data from local database
		var token = tokenService.getToken();
		var userId = token.userid;// $window.localStorage.getItem("userid");
		var fullCondition = 'UserId=\''+userId+'\'';
		if (whereClause && whereClause != ''){
			fullCondition += ' AND ' + whereClause;
		}
		$dbHelper.select('GoodsPublish', 'GoodPublishId, Title, SalePrice, Description, Quantity', fullCondition).then(function(result){
			for (var i = 0; i<result.length;i++){
				var good = result[i];
				var photoWhere = 'GoodPublishId = \''+good.GoodPublishId+'\'';
				$dbHelper.select('GoodsPublishPhoto', 'PhotoUrl', photoWhere).then(function(photoResult){
					if (photoResult.length > 0){
						good.photoUrl = photoResult[0].PhotoUrl;
					}
					else {
						good.photoUrl = 'img/nophoto.jpg';
					}
				});
				$scope.goods.push(good);
			}
		});
	}
	
	$scope.init = function(){
		selectGoods();
	};
	
    $scope.goodOnHold = function(listType){
        var params = {};
        params.isQuickActions = true;
		params.list = listType;
        $scope.quickactions = true;
		$scope.tabclass = 'tabhide';
        $rootScope.$broadcast('updateIsQuickActions', params);
    };
	$scope.goodSwipeLeft = function(){
		$scope.goodSlided = 'slided';
		setTimeout(function(){
			window.location = '#/edit';
		}, 250);
		
	};
	$scope.editButtonClick = function($event){
		window.location = '#/edit';
	};
	$scope.addnewButtonClick = function(){
		window.location = '#/navbar/addnew';
	};
	$scope.$on('updateIsQuickActionFlag', function(event, args){
		$scope.quickactions = args.quickactions;
		if (!$scope.quickactions){
			$scope.tabclass = '';
		}
	});
	$scope.$on('search', function(event, args){
		$scope.goods = [];
		var key = args.searchkey;
		var whereClause = 'Title LIKE \'%'+key+'%\'';
		$scope.filterMessage = 'Search for \''+key+'\':';
		selectGoods(whereClause);
		
		var params = {};
		params.issearch = false;
        $rootScope.$broadcast('updateIsSearch', params);
		//$rootScope.$broadcast('updateIsSearchFlag', params);
	});
	$scope.$on('multiDelete', function(event, args){
		if (navigator.notification){
			navigator.notification.confirm('Are you sure to delete selected items?', function(result){
				if (result == 1){
					var ids = [];
					$scope.goods.forEach(function(g){
						ids.push(g.GoodPublishId);
					});
					if (ids.length > 0){
						var whereClause = 'GoodPublishId IN (' + ids.join(',') + ')';
						$dbHelper.delete('GoodsPublish', whereClause).then(function(res){
							if (res.result){
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
		$("#list-readmode > a.item").click(function(e){
			if (e.target.className.indexOf("edit-button") != -1)
				return false;
		});

	});
});