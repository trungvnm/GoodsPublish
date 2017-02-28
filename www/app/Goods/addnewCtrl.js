angular.module("LelongApp.Goods")
    .controller("addnewCtrl", function ($scope, $window, $dbHelper, $rootScope, $ionicActionSheet, $ionicHistory, $cordovaCamera, $cordovaImagePicker, $cordovaToast, $cordovaFile, tokenService, $state, $q) {
        
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
                        $ionicHistory.clearCache().then(function () {
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
                copyImgToPerFolder(imagePath);
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
                    copyImgToPerFolder(results[i]);
                }
            }, function (error) {
                console.log('From Library Photo: ' + JsonParse(error));
            });
        };
        /**End camera */
        /**Cordova file */
        /** create folder with name 'ImagesUpload + userid' */
        $scope.dirName = "ImagesUpload";
        var subDir = "" + $scope.tokenServ.userid + ""
        function requestAccessFs() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
                dirEntry.root.getDirectory($scope.dirName, { create: true }, function (subDirEntry) {
                    subDirEntry.getDirectory(subDir, { create: true }, function (success) {
                        console.log("CREATE SUBDIR SUCCESS!!!");
                        $scope.uploadDir = $scope.dirName + "/" + subDir + "/";
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

        /** copy img from temp folder to PERSISTENT folder */
        function copyImgToPerFolder(originPath) {
            var newFileName = generateUUID() + ".jpg";
            if ($scope.uploadDir.length <= 0) {
                $scope.uploadDir = $scope.dirName;
            }
            var deffered = $q.defer();
            window.resolveLocalFileSystemURL(originPath, function (fileEntry) {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                    fileSystem.root.getDirectory($scope.uploadDir, { create: true }, function (desFolder) {
                        fileEntry.copyTo(desFolder, newFileName, function (success) {
                            console.log("COPY FILE SUCCESS:" + JsonParse(success));
                            $scope.imgURI.push({ src: success.nativeURL });
                            $scope.$apply();
                            deffered.resolve();
                        }, function (error) {
                            console.log("COPY FILE FAILED:" + JsonParse(error));
                        });
                    }, errorHandler);
                });
            }, function (failed) {
                console.log("resolveLocalFileSystemURL FAILED: " + JsonParse(failed));
            })
            return deffered.promise;
        };
        /**End Cordova file */
        function JsonParse(obj) {
            return JSON.stringify(obj);
        }

        function errorHandler(err) {
            console.log("ERROR: " + JsonParse(err));
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

        $(document).ready(function () {
            //Here your view content is fully loaded !!
            var imagesInScreen = 3;
            var imgWidth = $(window).width() / imagesInScreen;
            var imgQuantity = $(".gallery-view .row .image-container img").length;
            $(".gallery-view .row").width(imgWidth * imgQuantity);
            $(".gallery-view .row .image-container img").width(imgWidth - 2);
        });
    });