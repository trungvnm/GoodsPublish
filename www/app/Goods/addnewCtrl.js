angular.module("LelongApp.Goods")
    .controller("addnewCtrl", function ($scope, $window, $dbHelper, $rootScope, $ionicActionSheet, $ionicHistory,
        $cordovaCamera, $cordovaImagePicker, $cordovaToast, $cordovaFile, tokenService, $state, $q, $timeout,
        $ionicSlideBoxDelegate, $ionicPopup, imageService, goodsService, $stateParams) {

        $scope.goodsId = $stateParams.goodsId;
        $scope.editMode = false
        if ($scope.goodsId.length > 0 && parseInt($scope.goodsId) > 0) {
            $scope.editMode = true;
        }
        $scope.viewTitle = "Add new";
        $scope.tokenServ = tokenService.getToken();
        $rootScope.$broadcast('hideSearch');
        $scope.errors = [];


        $scope.init = function () {
            $scope.step = 1;
            $scope.imgURI = [];
            $scope.imageDeleted = [];
            $scope.uploadDir = "";
            $scope.defaultCategory = [
                { value: 1, name: "Phone & Tablet", isChecked: false },
                { value: 2, name: "Electronics & Appliances", isChecked: false },
                { value: 3, name: "Fasion", isChecked: false },
                { value: 4, name: "Beauty & Personal Care", isChecked: false },
                { value: 5, name: "Toys & Games", isChecked: false },
                { value: 6, name: "Watches, Pens & Clocks", isChecked: false },
                { value: 7, name: "Gifts & Premiums", isChecked: false },
                { value: 8, name: "Home & Gardening", isChecked: false },
                { value: 9, name: "Sports & Recreation", isChecked: false },
                { value: 10, name: "Books & Comics", isChecked: false }
            ];

            if ($scope.editMode) {
                /** UPDATE GoodsPublish: get publishGood by id */
                $scope.viewTitle = "Edit"
                goodsService.getGoodsById($scope.goodsId).then(function (res) {
                    $scope.goodItem = res;
                    /** get photos by goodsId */
                    var where = "GoodPublishId=" + $scope.goodsId;
                    $dbHelper.select("GoodsPublishPhoto", "*", where).then(function (result) {
                        if (result.length > 0) {
                            for (var i = 0; i < result.length; i++) {
                                $scope.imgURI.push({ photoId: result[i].Photoid, photoUrl: result[i].PhotoUrl });
                            }
                            updateSlide();
                        }
                    });
                });
            } else {
                /**ADD NEW GoodsPublish */
                $scope.goodItem = { Category: '', Title: '', Condition: '', Quantity: 0, SalePrice: 0, UserId: $scope.tokenServ.userid, Active: 1, CreatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), LastEdited: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), Guid: generateUUID() };
            }
            requestAccessFs();
        }

        $scope.$on("$ionicView.leave", function (event, data) {
            // handle event
            $ionicHistory.clearCache();
        });
        /**Top bar actions */
        var actions = [
            {
                name: 'upload',
                action: function () {
                    postToServer();
                }
            },
            {
                name: 'save',
                action: function () {
                    $scope.saveClick(true);
                }
            }
        ];
        $rootScope.$broadcast("setMainActions", actions);
        /**End Top bar actions */
        /** Choose Category */
        $scope.showPopup = function () {
            if ($scope.editMode) {
                if ($scope.goodItem.Category.length > 0) {
                    var arrOldCate = $scope.goodItem.Category.split(';');
                    for (var i = 0; i < arrOldCate.length; i++) {
                        for (var j = 0; j < $scope.defaultCategory.length; j++) {
                            if (arrOldCate[i] == $scope.defaultCategory[j].name) {
                                $scope.defaultCategory[j].isChecked = true;
                                break;
                            }
                        }
                    }

                }
            }
            var listTemplate = '<ion-list> <ion-checkbox  ng-repeat="cate in defaultCategory" title="{{cate.name}}" ng-model="cate.isChecked">{{cate.name}}</ion-checkbox> </ion-list>';
            var myPopup = $ionicPopup.show({
                template: listTemplate,
                title: '<b>Choose Category</b>',
                scope: $scope,
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive'
                    }
                ]
            });
            myPopup.then(function () {
                var lstCate = [];
                for (var i = 0; i < $scope.defaultCategory.length; i++) {
                    if ($scope.defaultCategory[i].isChecked) {
                        lstCate.push($scope.defaultCategory[i].name);
                    }
                }
                $scope.goodItem.Category = lstCate.join(';');
                $ionicPopup.close;
            });
        }
        /** End Choose Category */


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
                saveToPhotoAlbum: false,
                correctOrientation: true
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

        $scope.deleteImg = function (fullNamePath, photoId) {
            for (var i = 0; i < $scope.imgURI.length; i++) {
                var file = getImageFileName($scope.imgURI[i].photoUrl);
                var fileDel=getImageFileName(fullNamePath);
                if (file === fileDel) {
                    $scope.imgURI.splice(i, 1);
                    if (photoId > 0) {
                        $scope.imageDeleted.push({ photoId: photoId, photoUrl: fullNamePath });
                    }else{
                        // delete the img that isn't save into db
                        imageService.removeFileFromPersitentFolder(fullNamePath).then(function (res) {                            
                        });
                    }
                    break;
                }
            }
            updateSlide();
            $cordovaToast.showLongTop('Delete successfully!')
        }
        /**End camera */
        /**Cordova file */
        /** create folder with name 'ImagesUpload / userid */
        $scope.dirName = "ImagesUpload";
        $scope.subDir = "" + $scope.tokenServ.userid + ""
        function requestAccessFs() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
                dirEntry.root.getDirectory($scope.dirName, { create: true }, function (subDirEntry) {
                    subDirEntry.getDirectory($scope.subDir, { create: true }, function (success) {
                        console.log("CREATE SUBDIR SUCCESS!!!");
                        $scope.uploadDir = $scope.dirName + "/" + $scope.subDir + "/";
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
                            $scope.imgURI.push({ photoId: 0, GoodPublishId: $scope.goodsId, photoUrl: success.nativeURL });
                            updateSlide();
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
        /** Actions */
        $scope.saveClick = function (isShowToast) {            
            if (formIsValid()) {
                var arrImage = [];
                if ($scope.imgURI.length > 0) {
                    for (var i = 0; i < $scope.imgURI.length; i++) {
                        arrImage.push($scope.imgURI[i].photoUrl);
                    }
                }
                if ($scope.editMode) {
                    /**update */
                    var imgSave = [];
                    if ($scope.imgURI.length > 0) {
                        for (var i = 0; i < $scope.imgURI.length; i++) {
                            if ($scope.imgURI[i].photoId == 0) {
                                imgSave.push($scope.imgURI[i]);
                            }
                        }
                    }
                    if ($scope.imageDeleted.length > 0) {
                        for (var i = 0; i < $scope.imageDeleted.length; i++) {
                            imgSave.push($scope.imageDeleted[i]);
                            //delete the image saved into db
                            imageService.removeFileFromPersitentFolder($scope.imageDeleted[i].photoUrl).then(function (res) {                               
                            });
                        }
                    }
                    goodsService.updateGoods($scope.goodItem, imgSave, "", isShowToast);
                } else {
                    /**insert */
                    goodsService.saveGoods($scope.goodItem, arrImage, isShowToast);
                }
            }
        }

        $scope.nextClick = function () {
            if (formIsValid()) {
                $scope.step += 1;
                if ($scope.step == 2) {
                    updateSlide();
                }
            }
        }

        $scope.prevClick = function () {
            $scope.step -= 1;
        }
        /** End Actions */

        /** Post to server */
        function postToServer() {
            var listPhoto = [];
            var newSource = {};
            if (formIsValid()) {                
                /** Save goods to local device */
                navigator.notification.confirm('Are you sure want to upload this item?', function (result) {
                    if (result == 1) {
                        $scope.saveClick(false);
                        /** post goods to server */
                        if ($scope.imgURI.length > 0) {
                            for (var i = 0; i < $scope.imgURI.length; i++) {
                                var pName = getImageFileName($scope.imgURI[i].photoUrl);
                                listPhoto.push({
                                    PhotoName: pName,
                                    PhotoUrl: $scope.imgURI[i].photoUrl,
                                    PhotoDescription: ""
                                })
                            }
                        };
                        angular.extend(newSource, $scope.goodItem, { listPhoto: listPhoto });

                        goodsService.publish(newSource).then(function (result) {
                            if (result) {
                                $cordovaToast.showLongTop('Publish successful!');
                                $ionicHistory.clearCache().then(function () {
                                    $state.go('app.completes');
                                });
                            }                            
                        });
                    }
                });
            }
        }

        /** end Post to server */
        /** Gallery Options */
        $scope.galleryOptions = {
            pagination: '.swiper-pagination',
            slidesPerView: 2,
            centeredSlides: false,
            paginationClickable: true,
            spaceBetween: 5,
            speed: 600
        };
        $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
            // data.slider is the instance of Swiper
            $scope.slider = data.slider;
        });
        $scope.$on("$ionicSlides.slideChangeEnd", function (event, data) {
            // note: the indexes are 0-based
            $scope.activeIndex = data.slider.activeIndex;
            $scope.previousIndex = data.slider.previousIndex;
        });
        /** Gallery Options */
        /**helper method */
        function JsonParse(obj) {
            var jsonObj;
            if (obj !== undefined) {
                jsonObj = JSON.stringify(obj)
            }
            return jsonObj;
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
        function updateSlide() {
            $timeout(function () {
                if ($scope.slider) {
                    $scope.slider.update();
                }
            });
        }
        function getImageFileName(fullNamePath) {
            return fullNamePath.replace(/^.*[\\\/]/, '');
        }
        /**end helper method */
        function formIsValid() {
            var item = $scope.goodItem;
            $scope.errors = [];
            if (item.Title === undefined || item.Title.trim().length == 0) {
                $scope.errors.push({ type: 'title', message: 'Title is required.' })
            }
            else if (item.Condition === undefined || item.Condition.trim().length == 0) {
                $scope.errors.push({ type: 'condition', message: 'Condition is required.' })
            }
            else if (item.Quantity === undefined) {
                $scope.errors.push({ type: 'quantity', message: 'Quantity is required.' })
            }
            else if (item.SalePrice === undefined) {
                $scope.errors.push({ type: 'saleprice', message: 'SalePrice is required.' })
            }
            return $scope.errors.length == 0;
        }

    });
