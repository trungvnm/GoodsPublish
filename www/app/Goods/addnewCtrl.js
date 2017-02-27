angular.module("LelongApp.Goods")
    .controller("addnewCtrl", function ($scope,$window,$dbHelper, $rootScope, $ionicActionSheet, $ionicHistory, $cordovaCamera, $cordovaImagePicker, $cordovaToast,tokenService) {

        $scope.init = function () {
            $scope.tokenServ=tokenService.getToken();
            $scope.step = 1;
            $scope.imgURI = [];
            $scope.goodItem = {UserId:$scope.tokenServ.userid};           
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
                            console.log("INSERT IMG FAILED: " + JSON.stringify(err));
                        });
                    };
                }
                setTimeout(function () {
                    $cordovaToast.showLongTop('Save successfully!').then(function(){
                        window.location = '#/app/completes';
                    });                                         
                }, 3000);
            }, function (err) {
                console.log("ERROR: " + JSON.stringify(err));
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
        /*Camera */

        $scope.takeCameraPicture = function () {
            var options = {
                quality: 75,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true
            };

            $cordovaCamera.getPicture(options).then(function (imageData) {
                $scope.imgURI.push({ src: imageData });
            }, function (err) {
                // An error occured. Show a message to the user
                console.log('From Camera: ' + JSON.stringify(error));
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
                console.log('From Library Photo: ' + JSON.stringify(error));
            });
        };
        /**End camera */

    });