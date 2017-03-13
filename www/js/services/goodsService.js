angular.module('LelongApp.services')
	.factory('goodsService', function ($dbHelper, $rootScope, $q, tokenService, $cordovaToast, $ionicHistory, $state, xhttpService, imageService,$timeout) {
		// Get API Url for downloading photo
		function getPhotoApiUrl(guid) {
			return "http://d00dd351.ngrok.io/api/image/download?photoName=" + guid;
		}

		var syncAllApi = "http://d00dd351.ngrok.io/api/goods/getall";

		// Delete all photos of a good
		function deletePhotosByGood(goodId, callBack) {
			$dbHelper.select('GoodsPublishPhoto', '*', "GoodPublishId='" + goodId + "'").then(function (result) {
				try {
					var photoPaths = [];
					//if (result && result.length > 0) {
					result.forEach(function (photo) {
						photoPaths.push(photo.PhotoUrl);
					});

					$dbHelper.delete("GoodsPublishPhoto", "GoodPublishId = '" + goodId + "'").then(function (res) {
						try{
							photoPaths.forEach(function (p) {
								var nameSegments = p.split('/');
								var path = nameSegments.slice(0, nameSegments.length - 1).join('/');
								var filename = nameSegments[nameSegments.length - 1];
								// delete file
								/*window.resolveLocalFileSystemURL(path, function (dir) {
									dir.getFile(filename, { create: false }, function (fileEntry) {
										fileEntry.remove(function (result) {
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
								});*/
							})
							if (callBack) {
								callBack();
							}
						}
						catch(err){
							if (callBack) {
								callBack(err);
							}
						}
					});
					//}
				}
				catch (err){
					if (callBack){
						callBack(err);
					}
				}
			})
		}

		// download photos of a good from server 
		function downloadPhotosOfGood(goodId, good, listPhoto, callBack) {
			var cId = goodId;
			var userId = good.UserId;

			listPhoto.forEach(function(p, index){
				// download photo from server
				var dirName = "ImagesUpload";
				var subDir = userId;
				var goodsDir=good.Guid;
				var currentCouter = index+1;
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
					dirEntry.root.getDirectory(dirName, { create: true }, function (subDirEntry) {
						subDirEntry.getDirectory(subDir.toString(), { create: true }, function (dir) {
							dir.getDirectory(goodsDir,{create:true},function(success){
							var uploadDir = success.nativeURL + p.PhotoName;
							var remoteImgUrl = p.PhotoUrl;// getPhotoApiUrl(p.PhotoName);
							if (remoteImgUrl.trim() != '') {
								imageService.downloadImage(remoteImgUrl, uploadDir, 
									function () {
										// save to database
										var newPhoto = {
											GoodPublishId: cId,
											PhotoUrl: uploadDir,
											PhotoName: p.PhotoName,
											PhotoDescription: p.Description
										}

										// insert record to database for new photo
										$dbHelper.insert("GoodsPublishPhoto", newPhoto).then(function (r) {
											if (currentCouter == listPhoto.length && callBack) {
												callBack();
											}
										});
									},
									function () {
										if (currentCouter == listPhoto.length && callBack) {
											callBack();
										}
									}
								);
							}
							})
		
						})
					});
				});
			})
		}

		var goodService = {
			getAll: function (type, offset, limit) {
				var token = tokenService.getToken();
				var userId = token.userid;

				// Condition for filter
				var whereClause = ' WHERE UserId=\'' + userId + '\' AND Active = 1 ';
				if (type == 'unsync'){
					whereClause += " AND (LastSync == '' OR LastSync IS NULL) ";
				}
				else if (type == 'synced'){
					whereClause += " AND LastSync IS NOT NULL AND LastSync != '' ";
				}
				var limitClause = '';
				if (limit){
					if (offset){
						limitClause = ' LIMIT ' + offset + "," + limit;
					}
					else{
						limitClause = ' LIMIT ' + limit;
					}
				}

				// Query to extract data
				var query = 'SELECT	GoodPublishId, Title, Guid, SalePrice, Description, Quantity, LastSync, (	SELECT PhotoUrl FROM	GoodsPublishPhoto WHERE	GoodPublishId = GoodsPublish.GoodPublishId LIMIT 1) AS PhotoUrl ';
				query += ' FROM	GoodsPublish';
				query += whereClause;
				query += ' ORDER BY datetime(LastEdited) DESC ';
				query += limitClause;

				return $dbHelper.selectCustom(query).then(function (result) {
					result.forEach(function (r) {
						if (r.PhotoUrl && r.PhotoUrl.trim() != '') {
							r.PhotoUrl += "?" + (new Date()).getTime();
						}
						else{
							r.PhotoUrl = "./img/nophoto.jpg";
						}
					});
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
				var deffered=$q.defer();
				return $dbHelper.selectCustom(query).then(function (result) {
					if (result && result.length > 0) {
						$timeout(function() {
							deffered.resolve(result[0]);
						}, 200);
						return deffered.promise;
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
				xhttpService.put('http://d00dd351.ngrok.io/api/goods/delete', guids, false).then(function (apiResponse) { });

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
			saveGoods: function (goodItemObj, arrFullPathImgs, isShowToast) {
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
					if (isShowToast) {
						$cordovaToast.showLongTop('Save successfully!').then(function () {
							$ionicHistory.clearCache().then(function () {
								$state.go('app.completes');
							});
						});
					}
					$rootScope.$broadcast('hideSpinner');
				}, function (err) {
					console.log("ERROR: " + JSON.stringify(err));
					$rootScope.$broadcast('hideSpinner');
				});
			},
			/** goodsPhotoObj: object GoodsPublishPhoto	with {photoId,PhotoUrl} */
			updateGoods: function (goodsItemObj, goodsPhotoObj, goodItemWhereClause, isShowToast) {
				var where = " GoodPublishId = " + goodsItemObj.GoodPublishId;
				if (goodItemWhereClause !== undefined && goodItemWhereClause.trim().length > 0) {
					where += " " + goodItemWhereClause;
				}
				//reupdate LastEdited:
				var newSource = {};
				angular.extend(newSource, goodsItemObj, { LastEdited: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') });

				$dbHelper.update("GoodsPublish", newSource, where).then(function (res) {
					console.log("GoodsPublish UPDATED: " + JSON.stringify(res));
					if (isShowToast) {
						$cordovaToast.showLongTop('Update successfully!').then(function () {
							$ionicHistory.clearCache().then(function () {
								$state.go('app.completes');
							});
						});
					}
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
			publish: function (listGoods) {
			    var deffered = $q.defer();
			    var objectResult = { message: "", listGoodsPublishFailed: [], listImagePublishFailed: [] };
			    var listImageObj = [];
			    xhttpService.post('http://d00dd351.ngrok.io/api/goods/publish', listGoods, true).then(function (response) {

			        var listGoodsPublishFailed = [];
			        var listGoodsPublishOK = listGoods;

			        if (response.status == 200 && response.data) {
			            if (response.data.message == "Failed") {
			                response.data.listGuidPublishFailed.forEach(function (r) {
			                    var failedItems = listGoods(function (g) { return g.Guid == r; });
			                    listGoodsPublishFailed.push(failedItems);
			                    for (i = listGoodsPublishOK.length - 1; i >= 0; i--) {
			                        if (listGoodsPublishOK[i].Guid == failedItems.Guid) listGoodsPublishOK.splice(i, 1);
			                    }
			                });
			            }
			        }
			        objectResult.listGoodsPublishFailed = listGoodsPublishFailed;

			        for (var i = 0; i < listGoodsPublishOK.length; i++) {
			            if (listGoodsPublishOK[i].listPhoto) {
			                for (var j = 0; j < listGoodsPublishOK[i].listPhoto.length; j++) {
			                    var obj = {}
			                    obj.goodsTitle = listGoodsPublishOK[i].Title;
			                    obj.goodsGuid = listGoodsPublishOK[i].Guid;
			                    obj.photoObject = listGoodsPublishOK[i].listPhoto[j];
			                    listImageObj.push(obj);
							}
						}

						// update lastsync value to current good in Sqlite
						var params = {
							LastSync: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
						};
						listGoods[i].LastSync = params.LastSync; // Update new status to client object
						$dbHelper.update("GoodsPublish", params, "Guid = '" + listGoodsPublishOK[i].Guid + "'").then(function (result) {
						});
			        }
                    
			        // upload images
			        if (listImageObj && listImageObj.length > 0) {
			            uploadMultipleImages(listImageObj).then(function (result) {
			                result.forEach(function (r) {
			                    if (r.result != 1) {
			                        console.log("upload failed goods: " + r.goodsTitle);
			                        objectResult.listImagePublishFailed.push(r);
			                    };
			                });
			                if (objectResult.listImagePublishFailed.length > 0)
			                {
			                    objectResult.message = "Failed";
			                } else {
			                    console.log("upload all images success");
			                    objectResult.message = "Success";
			                }
			                deffered.resolve(objectResult);
			            });
			        } else {
			            // in case goods with no images
			            objectResult.message = "Success";
			            deffered.resolve(objectResult);
			        }
			    }, function (err) {
			        console.log("Publish Failed: " + JSON.stringify(err));
			        objectResult.message = "Failed when call api publish goods: " + err;
			        deffered.resolve(objectResult);
			    });
			    return deffered.promise;
			},
			sync: function (goods, callBack) {
				var token = tokenService.getToken();
				var userId = token.userid;
				var params = "";//guidsArray.join(',');
				if (goods) {
					goods.forEach(function (g) {
						if (params != "")
							params += ",";
						params += g.Guid;
					});

					// request to API
					xhttpService.get('http://d00dd351.ngrok.io/api/goods/getlist?guids=' + params, true).then(function (response) {
						if (response.data) {
							var couter = 0;
							response.data.forEach(function (newGood) {
								couter++;
								// update new goods to app database
								var listPhoto = newGood.listPhoto;
								newGood.Active = 1;
								newGood.UserId = userId;

								var lastMoment = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
								newGood.LastSync = lastMoment;
								newGood.LastEdited = lastMoment;
								delete newGood.listPhoto;
								delete newGood.GoodPublishId;

								// update to old one
								var finish = couter == goods.length;
								$dbHelper.update("GoodsPublish", newGood, "Guid = '" + newGood.Guid + "'").then(function (result) {
									if (result.rowsAffected > 0) {
										for (var i = 0; i < goods.length; i++) {
											if (goods[i].Guid == newGood.Guid) {
												// get id of current good in client app
												var cId = goods[i].GoodPublishId;

												// clear old photos
												deletePhotosByGood(cId, function () {
													if (!listPhoto || listPhoto.length == 0 && callBack){
														callBack();
													}
													else{
														if (finish && callBack){
															downloadPhotosOfGood(cId, goods[i], listPhoto, callBack);
														}
														else{
															downloadPhotosOfGood(cId, goods[i], listPhoto);
														}
													}
												});
												goods[i] = newGood;
												break;
											};

											
										}
									}


								})
							});
						}
					})
				}
			},
			syncAll: function (localGoods, callBack) {
				var token = tokenService.getToken();
				var userId = token.userid;
				xhttpService.get(syncAllApi, false).then(function (response) {
					if (response.data) {
						response.data.forEach(function(newGood, index){
							var currentCouter = index + 1;
							
							// update new goods to app database
							var listPhoto = newGood.listPhoto;
							newGood.Active = 1;
							newGood.UserId = userId;

							var lastMoment = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
							newGood.LastSync = lastMoment;
							newGood.LastEdited = lastMoment;
							delete newGood.listPhoto;
							delete newGood.GoodPublishId;

							// check local goods for exist good
							$dbHelper.select("GoodsPublish", "*", "Guid = '"+newGood.Guid+"'").then(function(result){
								if (result.length > 0){
									// if good is exist, update it
									var oldGood = result[0];
									$dbHelper.update("GoodsPublish", newGood, "Guid = '" + newGood.Guid + "'").then(function (res) {
										var gId = oldGood.GoodPublishId;
										deletePhotosByGood(gId, function () {
											if (currentCouter == response.data.length && callBack) {
												if (listPhoto && listPhoto.length > 0){
													downloadPhotosOfGood(gId, newGood, listPhoto,callBack);
												}
												else{
													callBack();
												}
											}
											else
												downloadPhotosOfGood(gId, newGood, listPhoto);
										});
									});
								}
								else{
									// if new good is not exist on local, insert new one
									$dbHelper.insert("GoodsPublish", newGood).then(function (res) {
										if (res && res.insertId) {
											var gId = res.insertId;
											if (currentCouter == response.data.length && callBack) {
												if (listPhoto && listPhoto.length > 0){
													downloadPhotosOfGood(gId, newGood, listPhoto, callBack);
												}
												else{
													callBack();
												}
											}
											else
												downloadPhotosOfGood(gId, newGood, listPhoto);
										}
									});
								}
							})
						})
					}
				});
			}
		};

		function uploadMultipleImages(listPhoto) {
		    var promises = [];
		    listPhoto.forEach(function (p) {
		        var deffered = $q.defer();
		        var resultObj = {};
		        resultObj.goodsTitle = p.goodsTitle;
		        var imageAPI = "http://d00dd351.ngrok.io/api/image/upload?guiIdGoods=" + p.goodsGuid;
		        imageService.uploadImage(imageAPI, p.photoObject.PhotoUrl).then(function (resultUpload) {
		            resultObj.result = resultUpload;
		            deffered.resolve(resultObj);
		        }, function (err) {
		            resultObj.result = resultUpload;
		            deffered.resolve(resultObj);
		        });
		        promises.push(deffered.promise);
		    });
		    return $q.all(promises);
		}

		function getImageFileName(fullNamePath) {
			return fullNamePath.replace(/^.*[\\\/]/, '');
		}

		return goodService;
	});

