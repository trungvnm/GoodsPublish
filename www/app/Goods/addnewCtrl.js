angular.module("LelongApp.Goods")
    .controller("addnewCtrl", function ($scope,$window,$dbHelper, $rootScope, $ionicActionSheet, $ionicHistory, $cordovaCamera, $cordovaImagePicker, $cordovaToast, $cordovaFile,tokenService,$state) {

        $scope.tokenServ = tokenService.getToken();

        $scope.init = function () {
            $scope.step = 1;
            $scope.imgURI = [];
            $scope.goodItem = { UserId: $scope.tokenServ.userid };
            $scope.uploadDir = "";
            requestAccessFs();
        }

        $scope.$on("$ionicView.leave", function (event, data) {
            // handle event
            $scope.init();
        });
        /**Top bar actions */
        var actions = [
            {
                name: 'upload',
                action: function () {

                }
            },
            {
                name: 'save',
                action: function () {
                    $scope.saveClick();
                }
            }
        ];
        $rootScope.$broadcast("setMainActions", actions);

        /**End Top bar actions */
        $scope.saveClick = function () {
            //console.log(JSON.stringify($scope.goodItem));
            $dbHelper.insert("GoodsPublish", $scope.goodItem).then(function (res) {
                console.log("Success: " + JSON.stringify(res))
                if (res.insertId > 0 && $scope.imgURI.length > 0) {
                    //insert photo for GoodsPublishPhoto
                    for (var i = 0; i < $scope.imgURI.length; i++) {
                        $dbHelper.insert("GoodsPublishPhoto", { GoodPublishId: res.insertId, PhotoUrl: $scope.imgURI[i].src }).then(function (response) {
                            console.log("INSERT IMG DONE:");
                        }, function (error) {
                            console.log("INSERT IMG FAILED: " + JsonParse(err));
                        });
                    };
                }
                setTimeout(function () {
                    $cordovaToast.showLongTop('Save successfully!').then(function () {
                        //window.location = '#/app/completes';
						$ionicHistory.clearCache().then(function(){ 
						   $state.go('app.completes'); 
						});
                    });
                }, 3000);
            }, function (err) {
                console.log("ERROR: " + JsonParse(err));
            });
        }

        $scope.nextClick = function () {
            $scope.step += 1;
        }

        $scope.prevClick = function () {
            $scope.step -= 1;
        }

        $scope.cancelClick = function () {
            $ionicHistory.goBack();
        }

        /* ActionSheet */
        $scope.choosePhotoAction = function () {

            $ionicActionSheet.show({
                titleText: 'Choose an action',
                buttons: [
                    { text: '<i class="icon ion-ios-camera-outline"></i> Camera' },
                    { text: '<i class="icon ion-ios-photos"></i> Photo library' },
                ],
                cancelText: 'Cancel',
                cancel: function () {
                    console.log('CANCELLED');
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        //camera
                        $scope.takeCameraPicture();
                    } else {
                        //Photo library
                        $scope.getImageFromLibrary();
                    }
                    return true;
                },
                destructiveButtonClicked: function () {
                    console.log('DESTRUCT');
                    return true;
                }
            });
        };
        /*End ActionSheet */
        /*Camera and PhotoLibrary*/

        $scope.takeCameraPicture = function () {
            var options = {
                quality: 75,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function (imagePath) {
                var currentName = imagePath.replace(/^.*[\\\/]/, '');
                // var newFileName = generateUUID() + ".jpg";
                var d = new Date(),
                    n = d.getTime(),
                    newFileName = n + ".jpg";
                window.FilePath.resolveNativePath(imagePath, function (entry) {
                    window.resolveLocalFileSystemURL(entry, function (fileEntry) {
                        var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
                        $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory + $scope.uploadDir, newFileName).then(function (success) {
                            console.log("COPY FILE SUCCESS:" + JsonParse(success));
                            $scope.imgURI.push({ src: success.nativeURL });
                        }, function (error) {
                            console.log("COPY FILE FAILED:" + JsonParse(error));
                        });
                    }, function (failed) {
                        console.log("resolveLocalFileSystemURL FAILED: " + JsonParse(failed));
                    })
                });

                // $cordovaFile.moveFile(cordova.file.tempDirectory, currentName, cordova.file.dataDirectory + $scope.uploadDir, newFileName).then(function (success) {                    
                //     console.log("MOVE FILE SUCCESS:" + JsonParse(success));
                //      $scope.imgURI.push({ src: success.nativeURL });
                // });   
            }, function (err) {
                // An error occured. Show a message to the user
                console.log('From Camera: ' + JsonParse(error));
            });
        }

        $scope.getImageFromLibrary = function () {
            var options = {
                maximumImagesCount: 5,
                width: 300,
                height: 300,
                quality: 75
            };

            $cordovaImagePicker.getPictures(options).then(function (results) {
                for (var i = 0; i < results.length; i++) {
                    $scope.imgURI.push({ src: results[i] });
                }
            }, function (error) {
                console.log('From Library Photo: ' + JsonParse(error));
            });
        };
        /**End camera */
        /**Cordova file */
        var dirName = "ImagesUpload";
        var subDir = "" + $scope.tokenServ.userid + ""
        function requestAccessFs() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
                dirEntry.root.getDirectory(dirName, { create: true }, function (subDirEntry) {
                    subDirEntry.getDirectory(subDir, { create: true }, function (success) {
                        console.log("CREATE SUBDIR SUCCESS!!!");
                        $scope.uploadDir = dirName + "/" + subDir + "/";
                    }, fnFailed)
                }, fnFailed);
            }, failAccessFS);
        }


        function failAccessFS(err) {
            console.log("ACCESS FILE SYSTEM FAILED: " + JsonParse(err));
        }
        function fnFailed(err) {
            console.log("CREATE DIRECTORY FAILED: " + JsonParse(err));
        }

        /**End Cordova file */
        function JsonParse(obj) {
            return JSON.stringify(obj);
        }

        function generateUUID() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        };
    });