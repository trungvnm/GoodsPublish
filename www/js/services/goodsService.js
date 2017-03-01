angular.module('LelongApp.services')
	.factory('goodsService', function ($dbHelper, $rootScope, $q, tokenService,$cordovaToast,$ionicHistory,$state) {
		var goodService = {
			getAll: function () {
				var token = tokenService.getToken();
				var userId = token.userid;

				// Condition for filter
				var whereClause = ' WHERE UserId=\'' + userId + '\' AND Active = 1 ';

				// Query to extract data
				var query = 'SELECT	GoodPublishId, Title, SalePrice, Description, Quantity, (	SELECT PhotoUrl FROM	GoodsPublishPhoto WHERE	GoodPublishId = GoodsPublish.GoodPublishId LIMIT 1) AS PhotoUrl ';
				query += 'FROM	GoodsPublish';
				query += whereClause;

				return $dbHelper.selectCustom(query).then(function (result) {
					return result;
				});
			},
			countAll: function () {
				var token = tokenService.getToken();
				var userId = token.userid;

				// Condition for filter
				var whereClause = ' WHERE UserId=\'' + userId + '\' AND Active = 1 ';

				// Query to extract data
				var query = 'SELECT	COUNT(GoodPublishId) AS Counter FROM	GoodsPublish ' + whereClause;

				return $dbHelper.selectCustom(query).then(function (result) {
					if (result && result.length > 0) {
						return result[0].Counter;
					}
					return 0;
				});
			},
			getGoodsById: function (goodId) {
				// Condition for filter
				var whereClause = ' WHERE GoodPublishId=\'' + goodId + '\'';

				// Query to extract data
				var query = 'SELECT	* ';
				query += 'FROM	GoodsPublish ';
				query += whereClause;

				return $dbHelper.selectCustom(query).then(function (result) {
					if (result && result.length > 0) {
						return result[0];
					}
					return null;
				});
			},
			deleteGoods: function (goodIds) {
				var whereClause = '';
				if (goodIds && goodIds.length > 0) {
					whereClause = ' GoodPublishId IN (' + goodIds.join(',') + ') ';

					// get path of all photo files
					return $dbHelper.select('GoodsPublishPhoto', 'PhotoUrl,PhotoDescription', whereClause).then(function (result) {
						if (result && result.length > 0) {
							var photoPaths = [];
							result.forEach(function (photo) {
								photoPaths.push(photo.PhotoUrl);
							});

							// delete records from GoodsPublish table before
							var query = 'UPDATE GoodsPublish SET Active = 0 WHERE ' + whereClause;
							return $dbHelper.query(query).then(function (result) {
								if (result.rowsAffected && result.rowsAffected > 0) {

									// delete records from GoodsPublishPhoto table
									//query = 'DELETE FROM GoodsPublishPhoto WHERE ' + whereClause;
									//return $dbHelper.query(query).then(function(res){
									//if (res.rowsAffected && res.rowsAffected > 0){
									// for each photo file on disk 
									photoPaths.forEach(function (p) {
										var nameSegments = p.split('/');
										var path = nameSegments.slice(0, nameSegments.length - 1).join('/');
										var filename = nameSegments[nameSegments.length - 1];

										// delete file
										window.resolveLocalFileSystemURL(path, function (dir) {
											dir.getFile(filename, { create: false }, function (fileEntry) {
												fileEntry.remove(function () {
													console.log("The file has been removed succesfully");
													// The file has been removed succesfully
												}, function (error) {
													// Error deleting the file
													console.dir(error);
												}, function () {
													// The file doesn't exist
													console.console("The file doesn't exist");
												});
											});
										});
									});
									//}
									//});
								}
								return (result.rowsAffected && result.rowsAffected > 0);
							});
						}
					});


				}
			},
			saveGoods: function (goodItemObj, arrFullPathImgs) {
				$dbHelper.insert("GoodsPublish", goodItemObj).then(function (res) {
					console.log("SUCCESS: " + JSON.stringify(res))
					if (res.insertId > 0 && arrFullPathImgs.length > 0) {
						//insert photo for GoodsPublishPhoto
						for (var i = 0; i < arrFullPathImgs.length; i++) {
							$dbHelper.insert("GoodsPublishPhoto", { GoodPublishId: res.insertId, PhotoUrl: arrFullPathImgs[i] }).then(function (response) {
								console.log("INSERT IMG DONE:");
							}, function (error) {
								console.log("INSERT IMG FAILED: " + JsonParse(err));
							});
						};
					}
					setTimeout(function () {
						$cordovaToast.showLongTop('Save successfully!').then(function () {
							$ionicHistory.clearCache().then(function () {
								$state.go('app.completes');
							});
						});
					}, 3000);
				}, function (err) {
					console.log("ERROR: " + JSON.stringify(err));
				});
			}
		};

		return goodService;
	});