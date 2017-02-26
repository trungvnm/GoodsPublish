angular.module("LelongApp.Goods").controller('GoodsCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $dbHelper, $window) {
	$scope.init = function(){
		$scope.goods = [];
		// load goods data from local database
		var userId = $window.localStorage.getItem("userid");
		//$dbHelper.selectRecords('GoodsPublish', 'GoodPublishId, Title, SalePrice, Description, Quantity', 'UserId=\''+userId+'\'', function(result){
		$dbHelper.selectRecords('GoodsPublish', 'GoodPublishId, Title, SalePrice, Description, Quantity', '', function(result){
			for (var i = 0; i<result.length;i++){
				var good = result[i];
				var photoWhere = 'GoodPublishId = \''+result+'\'';
				$dbHelper.selectRecords('GoodsPublishPhoto', 'PhotoUrl', photoWhere, function(photoResult){
					if (photoResult.length > 0){
						good.photoUrl = photoResult[0].PhotoUrl;
					}
				});
				$scope.goods.push(good);
			}
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
	
	$(document).ready(function(){
		$("#list-readmode > a.item").click(function(e){
			if (e.target.className.indexOf("edit-button") != -1)
				return false;
		});

	});
});