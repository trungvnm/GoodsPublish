angular.module("LelongApp.Goods").controller("DetailCtrl", function ($scope, $rootScope, $dbHelper, $stateParams, $state, $cordovaToast, $ionicHistory, goodsService) {
	var id = $stateParams.id;
	$scope.photos = [];

	$scope.goBack = function () {
		$rootScope.$ionicGoBack();
	};

	//-- setup action buttons
	var actions = [
		{
			name: 'edit',
			action: function () {
				$ionicHistory.clearCache().then(function () {
					$state.go('navbar.addnew', { goodsId: $stateParams.id });
				});
			}
		},
		{
			name: 'upload',
			action: function () {
				if (navigator.notification) {
					navigator.notification.confirm('Are you sure to upload this item?', function (result) {
						if (result == 1) {
							if ($scope.good) {
								goodsService.publish($scope.good).then(function (result) {
									if (result){
										$cordovaToast.showLongTop('Publish successful!');
									}
									else{
										$cordovaToast.showLongTop('Error: Publish failed!');
									}
								});
							}
							else {
								alert("Item not found");
							}
						}
					});
				}
			}
		},
		{
			name: 'delete',
			action: function () {
				if (navigator.notification) {
					navigator.notification.confirm('Are you sure to delete this item?', function (result) {
						if (result == 1) {
							var id = $stateParams.id;
							var guid = $scope.good.Guid;
							if (id != undefined) {
								goodsService.deleteGoods([$scope.good]).then(function (result) {
									//if (result){
									// call api to delete from server


									$cordovaToast.showLongTop('Delete successful!').then(function () {
										$ionicHistory.clearCache().then(function () {
											$state.go('app.completes');
										});
									});
									/*}
									else{
										//  Delete failed
										$cordovaToast.showLongTop('Save failed!');
									}*/
								});
							}
						}
					});
				}
			}
		}
	];

	$scope.getDetail = function () {
		// load all metadata of current good
		goodsService.getGoodsById(id).then(function (result) {
			if (result != null) {
				$scope.good = result;
				if ($scope.good.LastSync && $scope.good.LastSync != '') { // has not synced before
					actions.push({
						name: 'sync',
						action: function () {
							goodsService.sync([$scope.good]);
						}
					});
				}
				$rootScope.$broadcast("setMainActions", actions);
			}
		});

		// load all photos of current good
		$dbHelper.select('GoodsPublishPhoto', 'PhotoName,PhotoUrl,PhotoDescription', 'GoodPublishId = \'' + id + '\'').then(function (result) {
			if (result && result.length > 0) {
				result.forEach(function (photo) {
					$scope.photos.push({
						src: photo.PhotoUrl,
						sub: photo.PhotoDescription
					});

					if (!$scope.good.listPhoto)
						$scope.good.listPhoto = [];
					$scope.good.listPhoto.push({
						PhotoName: photo.PhotoName,
						PhotoUrl: photo.PhotoUrl,
						PhotoDescription: photo.PhotoDescription
					});
				});
			}
			else {
				$scope.photos.push({
					src: 'img/nophoto.jpg',
					sub: ''
				});
			}
		});
	};


	$(document).ready(function () {
		var imageScaleInterval = setInterval(function () {
			if ($(".gallery-view .row .image-container img").length > 0) {
				//Here your view content is fully loaded !!
				var imagesInScreen = 3;
				var imgWidth = $(window).width() / imagesInScreen;
				var imgQuantity = $(".gallery-view .row .image-container img").length;
				$(".gallery-view .row").width(imgWidth * imgQuantity);
				$(".gallery-view .row .image-container img").width(imgWidth - 2);

				var height = $(".gallery-view .row").height();
				$(".gallery-view .row .image-container img").height(height);
				clearInterval(imageScaleInterval);
			}

		}, 200);
	});
});