angular.module("LelongApp.Goods").controller("DetailCtrl", function ($scope, $rootScope, $dbHelper, $stateParams, $state, $cordovaToast, $ionicHistory, goodsService) {
	var id = $stateParams.id;
	$scope.photos = [];
	
	$scope.goBack = function(){
		$rootScope.$ionicGoBack();
	};
	
	//-- setup action buttons
	var actions = [
		{
			name: 'edit',
			action: function(){
				window.location = '#/edit';
			}
		},
		{
			name: 'delete',
			action: function(){
				if (navigator.notification){
					navigator.notification.confirm('Are you sure to delete this item?', function(result){
						if (result == 1){
							var id = $stateParams.id;
							if (id != undefined){
								goodsService.deleteGoods([id]).then(function(result){
									//if (result){
										$cordovaToast.showLongTop('Delete successful!').then(function () {
											$ionicHistory.clearCache().then(function(){ 
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
	
	$scope.getDetail = function(){
		// load all metadata of current good
		goodsService.getGoodsById(id).then(function(result){
			if (result != null){
				$scope.good = result;
				if (!$scope.good.LastSync || $scope.good.LastSync == ''){ // has not synced before
					actions.push({
						name: 'upload',
						action: function(){
							alert('upload action');
						}
					});
				}
				else {
					actions.push({
						name: 'sync',
						action: function(){
							alert('sync action');
						}
					});
				}
				$rootScope.$broadcast("setMainActions", actions);
			}
		});
		
		// load all photos of current good
		$dbHelper.select('GoodsPublishPhoto', 'PhotoUrl,PhotoDescription', 'GoodPublishId = \''+id+'\'').then(function(result){
			if (result && result.length > 0){
				result.forEach(function(photo){
					$scope.photos.push({
						src: photo.PhotoUrl,
						sub: photo.PhotoDescription
					});
				});
			}
			else{
				$scope.photos.push({
					src: 'img/nophoto.jpg',
					sub: ''
				});
			}
		});
	};
	
	
	$(document).ready(function(){
		//Here your view content is fully loaded !!
		var imagesInScreen = 3;
		var imgWidth = $(window).width() / imagesInScreen;
		var imgQuantity = $(".gallery-view .row .image-container img").length;
		$(".gallery-view .row").width(imgWidth*imgQuantity);
		$(".gallery-view .row .image-container img").width(imgWidth - 2);
	});
});