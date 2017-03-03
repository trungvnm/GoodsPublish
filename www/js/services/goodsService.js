angular.module('LelongApp.services')
	.factory('goodsService', function ($dbHelper, $rootScope, $q, tokenService, $cordovaToast, $ionicHistory, $state, xhttpService, imageService) {
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
				var query = 'SELECT	* FROM	GoodsPublish ' + whereClause;

				return $dbHelper.selectCustom(query).then(function (result) {
					if (result && result.length > 0) {
						return result[0];
					}
					return null;
				});
			},
			deleteGoods: function (goods) {
				$rootScope.$broadcast('showSpinner');
				var goodIds = [];
				var guids = [];
				goods.forEach(function (g) {
					goodIds.push(g.GoodPublishId);
					guids.push(g.Guid);
				});

				// call API to delete from server 
				xhttpService.put('https://1f71ef25.ngrok.io/api/goods/delete', guids, false).then(function (apiResponse) { });

				var whereClause = '';
				if (goodIds && goodIds.length > 0) {
					whereClause = ' GoodPublishId IN (' + goodIds.join(',') + ') ';

					// get path of all photo files
					return $dbHelper.select('GoodsPublishPhoto', 'PhotoUrl,PhotoDescription', whereClause).then(function (result) {
						var photoPaths = [];
						if (result && result.length > 0) {
							result.forEach(function (photo) {
								photoPaths.push(photo.PhotoUrl);
							});
						}

						// CLient SQLite Db: delete records from GoodsPublish table before
						var query = 'UPDATE GoodsPublish SET Active = 0 WHERE ' + whereClause;
						return $dbHelper.query(query).then(function (result) {
							if (result.rowsAffected && result.rowsAffected > 0) {
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
							$rootScope.$broadcast('hideSpinner');
							return (result.rowsAffected && result.rowsAffected > 0);
						});
					});
				}
				return false;
			},
			saveGoods: function (goodItemObj, arrFullPathImgs) {
				$rootScope.$broadcast('showSpinner');
				$dbHelper.insert("GoodsPublish", goodItemObj).then(function (res) {
					console.log("SUCCESS: " + JSON.stringify(res))
					if (res.insertId > 0 && arrFullPathImgs.length > 0) {
						//insert photo for GoodsPublishPhoto
						for (var i = 0; i < arrFullPathImgs.length; i++) {
							$dbHelper.insert("GoodsPublishPhoto", { GoodPublishId: res.insertId, PhotoUrl: arrFullPathImgs[i], PhotoName: getImageFileName(arrFullPathImgs[i]) }).then(function (response) {
								console.log("INSERT IMG DONE:");
							}, function (error) {
								console.log("INSERT IMG FAILED: " + JsonParse(err));
							});
						};
					}
					$cordovaToast.showLongTop('Save successfully!').then(function () {
						$ionicHistory.clearCache().then(function () {
							$state.go('app.completes');
						});
					});
					$rootScope.$broadcast('hideSpinner');
				}, function (err) {
					console.log("ERROR: " + JSON.stringify(err));
					$rootScope.$broadcast('hideSpinner');
				});
			},
			/** goodsPhotoObj: object GoodsPublishPhoto	with {photoId,PhotoUrl} */
			updateGoods: function (goodsItemObj, goodsPhotoObj, goodItemWhereClause) {
				var where = " GoodPublishId = " + goodsItemObj.GoodPublishId;
				if (goodItemWhereClause !== undefined && goodItemWhereClause.trim().length > 0) {
					where += " " + goodItemWhereClause;
				}
				$dbHelper.update("GoodsPublish", goodsItemObj, where).then(function (res) {
					console.log("GoodsPublish UPDATED: " + JSON.stringify(res));
					$cordovaToast.showLongTop('Update successfully!').then(function () {
						$ionicHistory.clearCache().then(function () {
							$state.go('app.completes');
						});
					});
				});
				/** update GoodsPublishPhoto: if photoId>0: delete?insert */
				if (goodsPhotoObj.length > 0) {
					for (var i = 0; i < goodsPhotoObj.length; i++) {
						if (goodsPhotoObj[i].photoId > 0) {
							var wherePhoto = " Photoid=" + goodsPhotoObj[i].photoId;
							$dbHelper.delete("GoodsPublishPhoto", wherePhoto).then(function (res) {
								console.log("GoodsPublishPhoto DELETED:" + JSON.stringify(res));
							});
						} else {
							$dbHelper.insert("GoodsPublishPhoto", { PhotoUrl: goodsPhotoObj[i].photoUrl, GoodPublishId: goodsPhotoObj[i].GoodPublishId }).then(function (res) {
								console.log("GoodsPublishPhoto INSERTED:" + JSON.stringify(res));
							});
						}
					}
				}
			},
			publish: function (good) {
				return xhttpService.post('https://1f71ef25.ngrok.io/api/goods/publish', good, true).then(function (response) {
					// upload images
					if (good.listPhoto) {
						var imageAPI = "https://1f71ef25.ngrok.io/api/image/upload?guiIdGoods=" + good.Guid;
						good.listPhoto.forEach(function (p) {
							imageService.uploadImage(imageAPI, p.PhotoUrl);
						});

					}

					if (response.status == 200 && response.data) {
						// update lastsync value to current good
						var params = {
							LastSync: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
						};
						return $dbHelper.update("GoodsPublish", params, "GoodPublishId = '" + good.GoodPublishId + "'").then(function (result) {
							return result.rowsAffected > 0;
						});
					}
				});
			},
			sync: function (goods) {
				var params = "";//guidsArray.join(',');
				if (goods) {
					goods.forEach(function (g) {
						if (params != "")
							params += ",";
						params += g.Guid;
					});

					// request to API
					return xhttpService.get('https://1f71ef25.ngrok.io/api/goods/getlist?guids=' + params, true).then(function (response) {
						if (response.data) {
							response.data.forEach(function (newGood) {
								// update new goods to app database
								var listPhoto = newGood.listPhoto;
								delete newGood.listPhoto;
								$dbHelper.update("GoodsPublish", newGood, "Guid = '" + newGood.Guid + "'").then(function (result) {
									if (result.rowsAffected > 0) {
										for (var i = 0; i < goods.length; i++) {
											if (goods[i].Guid == newGood.Guid) {
												goods[i] = newGood;
												break;
											}
										}
									}
								});
							});
						}
					});
				}
			}
		};
		function getImageFileName(fullNamePath) {
			return fullNamePath.replace(/^.*[\\\/]/, '');
		}
		return goodService;
	});