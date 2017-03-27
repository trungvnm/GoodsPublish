angular.module('LelongApp.services')
	.factory('goodsService', function ($dbHelper, $rootScope, $q, tokenService, $cordovaToast, $ionicHistory, $state, xhttpService, imageService,$timeout) {
		// Get API Url for downloading photo
		function getPhotoApiUrl(guid) {
			return "http://d00dd351.ngrok.io/api/image/download?photoName=" + guid;
		}

		var syncAllApi = "http://d00dd351.ngrok.io/api/goods/getall";

		// Delete all photos of a good
		function deletePhotosByGood(goodId) {
			var deffered=$q.defer();
			$dbHelper.delete("GoodsPublishPhoto", "GoodPublishId = '" + goodId + "'").then(function (res) {
				deffered.resolve(true);
			});
			return deffered.promise;
		}

		// download photos of a good from server 
		function downloadPhotosOfGood(goodId, good, listPhoto) {
			var deffered=$q.defer();
			var cId = goodId;
			var userId = good.UserId;
			
			if (!listPhoto || listPhoto.length == 0){
				deffered.resolve(true);
			}
			else {
				listPhoto.forEach(function(p, index){
					var currentCouter = index+1;
					// check local db whether has storing this photo
					var filterCondition = 'GoodPublishId = \''+goodId+'\' AND PhotoName = \''+p.PhotoName+'\'';
					$dbHelper.select('goodsPublishPhoto', 'Photoid', filterCondition).then(function(result){
						if (!result || result.length == 0){
							// if this photo has not stored before
							// download photo from server
							var dirName = "ImagesUpload";
							var subDir = userId;
							var goodsDir=good.Guid;
							
							window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
								dirEntry.root.getDirectory(dirName, { create: true }, function (subDirEntry) {
									subDirEntry.getDirectory(subDir.toString(), { create: true }, function (dir) {
										dir.getDirectory(goodsDir,{create:true},function(success){

											var uploadDir = success.nativeURL + p.PhotoName;
											var remoteImgUrl = p.PhotoUrl;// getPhotoApiUrl(p.PhotoName);
											if (remoteImgUrl.trim() != '') {
												// save to database
												var newPhoto = {
													GoodPublishId: cId,
													PhotoUrl: uploadDir,
													PhotoName: p.PhotoName,
													PhotoDescription: p.Description
												}
												// insert record to database for new photo
												$dbHelper.insert("GoodsPublishPhoto", newPhoto).then(function (r) {
													imageService.downloadImage(remoteImgUrl, uploadDir, 
														function (fileEntry) {
															// ---------- DEMO --------
															fileEntry.file(function (file) {
																var reader = new FileReader();
																reader.onloadend = function() {
																	console.log("Successful file read: " + this.result);
																	// displayFileData(fileEntry.fullPath + ": " + this.result);
																	var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
																	// Note: Use window.URL.revokeObjectURL when finished with image.
																	var objURL = window.URL.createObjectURL(blob);
																	
																	
																	//find img element and set src value
																	var imgEl = $("[id=\'g"+cId+"\'] img");
																	if (imgEl.length > 0){
																		var curSrc = imgEl.attr("src");
																		if (/*curSrc.indexOf("nophoto") == -1 || curSrc.trim() == "" || curSrc == uploadDir*/ index == 0){
																			imgEl.attr("ng-src", uploadDir);
																			imgEl.attr("src", uploadDir);
																		}
																	}
																};

																reader.readAsArrayBuffer(file);
															}, function(error){
																console.dir(error);
															});
															// ---------- END DEMO --------

															// // save to database
															// var newPhoto = {
																// GoodPublishId: cId,
																// PhotoUrl: uploadDir,
																// PhotoName: p.PhotoName,
																// PhotoDescription: p.Description
															// }

															// // insert record to database for new photo
															// $dbHelper.insert("GoodsPublishPhoto", newPhoto).then(function (r) {
																// if (currentCouter >= listPhoto.length) {
																	// //callBack();
																	// deffered.resolve(true);
																// }
															// });
														},
														function (error) {
															if (currentCouter >= listPhoto.length) {
																//callBack();
																deffered.resolve(true);
															}
														}
												);
													if (currentCouter >= listPhoto.length) {
														//callBack();
														deffered.resolve(true);
													}
												});
											}
											else{
												deffered.resolve(true);
											}
										})
					
									})
								});
							});
						}
						else if (currentCouter >= listPhoto.length){// && callBack) {
							//callBack();
							deffered.resolve(true);
						}
					});
				})
			}
			return deffered.promise;
		}

		function upsertPhotoOfGoods (goodId, good, listPhoto) {
			var deffered=$q.defer();
			var cId = goodId;
			var userId = good.UserId;
			
			if (!listPhoto || listPhoto.length == 0){
				deffered.resolve([]);
			}
			else {
				var listPhotoString = '';
				listPhoto.forEach(function(p, index){
					listPhotoString += '\'' + p.PhotoName + '\',';
				});
				var deleteCondition = 'GoodPublishId = \''+goodId+'\' AND PhotoName NOT IN (' + listPhotoString.substring(0, listPhotoString.length - 1) + ')';
				$dbHelper.delete('goodsPublishPhoto', deleteCondition).then(function (res) {
					var filterCondition = 'GoodPublishId = \''+goodId+'\'';
					$dbHelper.select('goodsPublishPhoto', 'Photoid,PhotoName', filterCondition).then(function(result){
						var listUpsertPhoto = [];
						if (!result || result.length == 0){
							listUpsertPhoto = listPhoto;
						} else {
							listPhoto.forEach(function(p, index){
								var exist = false;
								result.forEach(function(r, index){
									if (p.PhotoName == r.PhotoName) {
										exist = true;
									}
								});
								if (!exist) {
									listUpsertPhoto.push(p);
								}
							});
						}
						var dirName = "ImagesUpload";
						var subDir = userId;
						var goodsDir = good.Guid;
						
						window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
							var uploadDir = dirEntry.root.nativeURL + dirName + '/' + subDir + '/' + goodsDir + '/';
							var insertPros = []
							listUpsertPhoto.forEach(function(p, index){
								var newPhoto = {
									GoodPublishId: cId,
									PhotoUrl: uploadDir + p.PhotoName,
									PhotoName: p.PhotoName,
									PhotoDescription: p.Description
								};
								insertPros.push($dbHelper.insert("GoodsPublishPhoto", newPhoto));
							});
							$q.all(insertPros).then(function(){
								deffered.resolve(listUpsertPhoto);
							},function(err){
								deffered.reject(err);
							});
						},function(err){
							deffered.reject(err);
						});
					});
				});
			}

			return deffered.promise;
		}

		function upsertGoods(newGood) {
			var listPhoto = newGood.listPhoto;
			newGood.Active = 1;
			
			var lastMoment = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
			newGood.LastSync = lastMoment;
			newGood.LastEdited = lastMoment;
			delete newGood.listPhoto;
			delete newGood.GoodPublishId;
			var deffered=$q.defer();

			// check local goods for exist good
			$dbHelper.select("GoodsPublish", "*", "Guid = '"+newGood.Guid+"'").then(function(result){
				if (result.length > 0){
					// if good is exist, update it
					var oldGood = result[0];
					$dbHelper.update("GoodsPublish", newGood, "Guid = '" + newGood.Guid + "'").then(function (res) {
						// continue to photos
						var gId = oldGood.GoodPublishId;
						upsertPhotoOfGoods(gId, newGood, listPhoto).then(function (photoResult) {
							newGood.listPhoto = photoResult;
							newGood.GoodPublishId = gId;
							deffered.resolve(newGood);
						});
					},function(err){
						deffered.reject(err);
					});
				}
				else{
					// if new good is not exist on local, insert new one
					$dbHelper.insert("GoodsPublish", newGood).then(function (res) {
						if (res && res.insertId) {
							var gId = res.insertId;
							upsertPhotoOfGoods(gId, newGood, listPhoto).then(function (photoResult) {
								newGood.listPhoto = photoResult;
								newGood.GoodPublishId = gId;
								deffered.resolve(newGood);
							});
						}
					},function(err){
						deffered.reject(err);
					});
				}
			},function(err){
				deffered.reject(err);
			});
			
			return deffered.promise;
		}

		function downloadPhotos(listGoods) {
			var dirName = "ImagesUpload";
			listGoods.forEach(function(g, index){
				var subDir = g.UserId;
				var goodsDir = g.Guid;
				var cId = g.GoodPublishId;
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
					dirEntry.root.getDirectory(dirName, { create: true }, function (subDirEntry) {
						subDirEntry.getDirectory(subDir.toString(), { create: true }, function (dir) {
							dir.getDirectory(goodsDir,{create:true},function(success){
								g.listPhoto.forEach(function(p, index){
									var uploadDir = success.nativeURL + p.PhotoName;
									imageService.downloadImage(p.PhotoUrl, uploadDir, 
										function (fileEntry) {
											fileEntry.file(function (file) {
												var reader = new FileReader();
												reader.onloadend = function() {
													console.log("Successful file read: " + this.result);
													// displayFileData(fileEntry.fullPath + ": " + this.result);
													var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
													// Note: Use window.URL.revokeObjectURL when finished with image.
													var objURL = window.URL.createObjectURL(blob);
													//find img element and set src value
													var imgEl = $("[id=\'g"+cId+"\'] img");
													if (imgEl.length > 0){
														if (index == 0){
															imgEl.attr("ng-src", uploadDir);
															imgEl.attr("src", uploadDir);
														}
													}
												};

												reader.readAsArrayBuffer(file);
											}, function(error){
												console.dir(error);
											});
										},
										function (error) {
											console.dir(error);
										}
									);
								});
							});
						});
					});
				});
			});
		}

		var goodService = {
			getAll: function (type, offset, limit, condition) {
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
				else if (type == 'modified'){
					whereClause += " AND LastSync IS NOT NULL AND LastSync <> '' AND LastEdited <> LastSync";
				}
				
				if (condition && condition.trim() != ''){
					whereClause += " AND " + condition;
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
				var query = 'SELECT	*, (	SELECT PhotoUrl FROM	GoodsPublishPhoto WHERE	GoodPublishId = GoodsPublish.GoodPublishId LIMIT 1) AS PhotoUrl ';
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
			countInTab: function (type) {
				var token = tokenService.getToken();
				var userId = token.userid;

				// Condition for filter
				var whereClause = ' WHERE UserId=\'' + userId + '\' AND Active = 1 ';
				if (type == 'unsync'){
					whereClause += " AND (LastSync = '' OR LastSync IS NULL) ";
				}
				else if (type == 'synced'){
					whereClause += " AND LastSync IS NOT NULL AND LastSync <> '' ";
				}
				else if (type == 'modified'){
					whereClause += " AND LastSync IS NOT NULL AND LastSync <> '' AND LastEdited <> LastSync";
				}

				// Query to extract data
				var query = 'SELECT	COUNT(GoodPublishId) AS Counter FROM GoodsPublish ' + whereClause;

				return $dbHelper.selectCustom(query).then(function(result) {
					if (result && result.length > 0) {
						return result[0].Counter;
					}
					return 0;
				});
			},
			getGoodsById: function (goodId) {
				var whereClause = ' WHERE a.GoodPublishId=' + goodId;
				var query = 'SELECT	a.*,b.PhotoUrl,b.Photoid,b.PhotoName,b.PhotoUrl,b.PhotoDescription FROM GoodsPublish a LEFT JOIN GoodsPublishPhoto b on a.GoodPublishId=b.GoodPublishId ' + whereClause;
				var deffered=$q.defer();
				$dbHelper.selectCustom(query).then(function (res) {
					var lstPhoto=[]
					var obj={};
					var newSource={};
					if(res.length>0){
						for (var i = res.length - 1; i >= 0; i--) {
							var item=res[i];
							obj = angular.copy(res[0]);
						    if(item.PhotoUrl && item.PhotoUrl.trim().length>0){
						    	lstPhoto.push(
								{
									Photoid:item.Photoid,
									PhotoUrl:item.PhotoUrl,
									PhotoName:item.PhotoName,
									PhotoDescription:item.PhotoDescription
								});
						    }
						}
						angular.extend(newSource,obj,{listPhoto:lstPhoto});
					}
					deffered.resolve(newSource);
				},function(err){
					console.log("GETGOODSBYID FAILED " + JSON.stringify(err));
					deffered.reject(err);
				});
				return deffered.promise;
			},
			deleteGoods: function (goods) {			
				var defer=$q.defer();	
				var goodIds = [];
				var guids = [];
				goods.forEach(function (g) {
					goodIds.push(g.GoodPublishId);
					guids.push(g.Guid);
				});

				// call API to delete from server 
				xhttpService.put('http://d00dd351.ngrok.io/api/goods/delete', guids, false).then(function (apiResponse) {
                        
				},function(err){
					console.log("Delete from server failed " + JSON.stringify(err));
					defer.reject(err);
				});

				var whereClause = '';
				if (goodIds && goodIds.length > 0) {
					whereClause = ' GoodPublishId IN (' + goodIds.join(',') + ') ';

					// get path of all photo files
					 $dbHelper.select('GoodsPublishPhoto', 'PhotoUrl,PhotoDescription', whereClause).then(function (result) {
						var photoPaths = [];
						if (result && result.length > 0) {
							result.forEach(function (photo) {
								photoPaths.push(photo.PhotoUrl);
							});
						}

						// CLient SQLite Db: delete records from GoodsPublish table before
						var query = 'UPDATE GoodsPublish SET Active = 0 WHERE ' + whereClause;
						$dbHelper.query(query).then(function (res) {
							if (res.rowsAffected && res.rowsAffected > 0) {
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
							if (res.rowsAffected && res.rowsAffected > 0) {
							    defer.resolve(true);
							} else defer.resolve(false);
						},function(err){
							defer.reject(err);
						});
					},function(putErr){
						defer.reject(putErr);
					});
				}
				return defer.promise;
			},
			saveGoods: function (goodItemObj, arrFullPathImgs) {	
				var deffered=$q.defer();	
				$dbHelper.insert("GoodsPublish", goodItemObj).then(function (res) {
					var promises=[];
					console.log("SUCCESS: " + JSON.stringify(res))
					if (res.insertId > 0 && arrFullPathImgs.length > 0) {
						//insert photo for GoodsPublishPhoto
						for (var i = 0; i < arrFullPathImgs.length; i++) {							
							promises.push($dbHelper.insert("GoodsPublishPhoto", { GoodPublishId: res.insertId, PhotoUrl: arrFullPathImgs[i], PhotoName: getImageFileName(arrFullPathImgs[i])}));
						};
					}
					$q.all(promises).then(function(obj){						
						deffered.resolve(res);
					});
				}, function (err) {
					console.log("ERROR: " + JSON.stringify(err));		
					deffered.reject(err);			
				});
				return deffered.promise;
			},
			/** goodsPhotoObj: object GoodsPublishPhoto	with {photoId,PhotoUrl} */
			updateGoods: function (goodsItemObj, goodsPhotoObj, goodItemWhereClause) {
				var deffered=$q.defer();
				var where = " GoodPublishId = " + goodsItemObj.GoodPublishId;
				if (goodItemWhereClause !== undefined && goodItemWhereClause.trim().length > 0) {
					where += " " + goodItemWhereClause;
				}
				//reupdate LastEdited:
				var newSource = {};
				angular.extend(newSource, goodsItemObj, { LastEdited: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') });

				$dbHelper.update("GoodsPublish", newSource, where).then(function (res) {
					console.log("GoodsPublish UPDATED: " + JSON.stringify(res));		
					// deffered.resolve(res);		
				},function(err){
					console.log("GoodsPublish Update Failed: " + JSON.stringify(err));		
					deffered.reject(err);	
				});
				/** update GoodsPublishPhoto: if photoId>0: delete?insert */
				if (goodsPhotoObj.length > 0) {
					var promises=[];
					for (var i = 0; i < goodsPhotoObj.length; i++) {
						if (goodsPhotoObj[i].Photoid > 0) {
							var wherePhoto = " Photoid=" + goodsPhotoObj[i].Photoid;
							promises.push($dbHelper.delete("GoodsPublishPhoto", wherePhoto));
						} else {
							promises.push($dbHelper.insert("GoodsPublishPhoto", { PhotoUrl: goodsPhotoObj[i].PhotoUrl, GoodPublishId: goodsPhotoObj[i].GoodPublishId,PhotoName:getImageFileName(goodsPhotoObj[i].PhotoUrl) }));
						}
					}
					$q.all(promises).then(function(){
						deffered.resolve()
					})
				}else{
					deffered.resolve();
				}
				return deffered.promise;
			},
			publish: function (listGoods) {
			    var deffered = $q.defer();
			    var objectResult = { message: "", listGoodsPublishFailed: [], listImagePublishFailed: [] };
			    var listImageObj = [];
			    xhttpService.post('http://d00dd351.ngrok.io/api/goods/publish', listGoods, true).then(function (response) {

			        var listGoodsPublishFailed = [];
			        var listGoodsPublishOK = listGoods;
			        var listImageNameOnServer = response.data.listCurrentPhotoName;

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
						    LastSync: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
						    LastEdited: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
						};
						listGoods[i].LastSync = params.LastSync; // Update new status to client object
						$dbHelper.update("GoodsPublish", params, "Guid = '" + listGoodsPublishOK[i].Guid + "'").then(function (result) {
						});
			        }
			        listImageObj = getNewImagesOfGoods(listImageObj, listImageNameOnServer);
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
			        objectResult.message = "Failed when call api publish goods: " + JSON.stringify(err);
			        deffered.resolve(objectResult);
			    });
			    return deffered.promise;
			},
			sync: function (goods) {
				var deffered = $q.defer();
				
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
					xhttpService.get('http://d00dd351.ngrok.io/api/goods/getlist?guids=' + params, true).
					then(function (response) {
						if (response.data) {
							response.data.forEach(function (newGood, index) {								
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
								var finish = index >= goods.length - 1;
								$dbHelper.update("GoodsPublish", newGood, "Guid = '" + newGood.Guid + "'")
								.then(function (result) {
									if (result.rowsAffected > 0) {
										for (var i = 0; i < goods.length; i++) {
											if (goods[i].Guid == newGood.Guid) {
												// get id of current good in client app
												var cId = goods[i].GoodPublishId;

												// clear old photos
												deletePhotosByGood(cId).then(function (result) {
												// download photos
													if ((!listPhoto || listPhoto.length == 0) && finish){
														deffered.resolve(true);
													}
													else{
														if (finish){
															downloadPhotosOfGood(cId, goods[i], listPhoto).then(function(){
																deffered.resolve(true);
															});
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
									else{
										if (finish){
											deffered.resolve(true);
										}
									}
										
								})
							});
							/*end get*/
						} 
						
					},function(err){
						console.log('GET: failed ' + JSON.stringify(err));
						deffered.reject(err);						
					});					
				}
				return deffered.promise;
			},
			syncAll: function (callBack) {
				var deffered=$q.defer();
				var token = tokenService.getToken();
				var userId = token.userid;
				xhttpService.get(syncAllApi, false).then(function (response) {
					if (response.data) {
						//update data of all goods and photo
						var goodPros = [];
						response.data.forEach(function(newGood, index){
							newGood.UserId = userId;
							goodPros.push(upsertGoods(newGood));
						});
						$q.all(goodPros).then(function (result) {
							deffered.resolve(result);

							deletePhotosByGood(cId).then(function (res) {
								//download all image that not exist in local
								downloadPhotos(result);
							});
						},function(err){
							deffered.reject(err);
						});
					}
				},function(err){
					console.log("SYNCALL FAILED: " + JSON.stringify(err));
					deffered.reject(err);
				});
				return deffered.promise;
			},
			checkOveriderGoodsInfo: function (listGoodsInput)
			{
			    var isOverider = false;
			    var listItemEdited = listGoodsInput.filter(function (goodsItem) { return goodsItem.LastSync && goodsItem.LastEdited && new Date(goodsItem.LastSync).getTime() < new Date(goodsItem.LastEdited).getTime(); });
			    if (listItemEdited.length > 0) isOverider = true;
			    return isOverider;
	        }			
		};

		function getNewImagesOfGoods(listImagesLocal,listImageNameOnServer){
		    var result = []
            
		    for (var i = 0; i < listImagesLocal.length; i++) {
		        var isExit = listImageNameOnServer.filter(function (x) { return x === listImagesLocal[i].photoObject.PhotoName; });
		        if (!isExit || isExit.length===0) result.push(listImagesLocal[i]);
		    }
		    return result;
		}

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
		
		function downloadPhotoCallback(dones, all, deffered){
			dones.number++;
			if (dones.number >= all){
				deffered.resolve(true);
			}
		}

		return goodService;
	});

