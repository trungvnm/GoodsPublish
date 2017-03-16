angular.module("LelongApp.Goods").controller("addnewCtrl", function ($scope, $window, $dbHelper, $rootScope, $ionicActionSheet, $ionicHistory,
    $cordovaCamera, $cordovaImagePicker, $cordovaToast, $cordovaFile, tokenService, $state, $q, $timeout,
    $ionicSlideBoxDelegate, $ionicPopup, imageService, goodsService, $stateParams, $location, $ionicScrollDelegate,$ionicLoading) {

    var goodsFolderName = generateUUID();
    $scope.goodsId = $stateParams.goodsId;
    $scope.editMode = false
    if ($scope.goodsId.length > 0 && parseInt($scope.goodsId) > 0) {
        $scope.editMode = true;    
    }
    $scope.tokenServ = tokenService.getToken();
    $rootScope.$broadcast('hideSearch');
    $scope.errors = [];
    $scope.CatesName = '';
    $scope.CurrencyUnit = '';
    $scope.inputMore = { hide: false, class: 'ion-ios-arrow-down' };

    $scope.init = function () {

        if ($window.localStorage.getItem("Lelong_CurrencyUnit") != undefined)
        {
            var mapping = {"ALL":{"text":"Lek","uniDec":"76, 101, 107","uniHex":"4c, 65, 6b"},"AFN":{"text":"؋","uniDec":"1547","uniHex":"60b"},"ARS":{"text":"$","uniDec":"36","uniHex":"24"},"AWG":{"text":"ƒ","uniDec":"402","uniHex":"192"},"AUD":{"text":"$","uniDec":"36","uniHex":"24"},"AZN":{"text":"ман","uniDec":"1084, 1072, 1085","uniHex":"43c, 430, 43d"},"BSD":{"text":"$","uniDec":"36","uniHex":"24"},"BBD":{"text":"$","uniDec":"36","uniHex":"24"},"BYR":{"text":"p.","uniDec":"112, 46","uniHex":"70, 2e"},"BZD":{"text":"BZ$","uniDec":"66, 90, 36","uniHex":"42, 5a, 24"},"BMD":{"text":"$","uniDec":"36","uniHex":"24"},"BOB":{"text":"$b","uniDec":"36, 98","uniHex":"24, 62"},"BAM":{"text":"KM","uniDec":"75, 77","uniHex":"4b, 4d"},"BWP":{"text":"P","uniDec":"80","uniHex":"50"},"BGN":{"text":"лв","uniDec":"1083, 1074","uniHex":"43b, 432"},"BRL":{"text":"R$","uniDec":"82, 36","uniHex":"52, 24"},"BND":{"text":"$","uniDec":"36","uniHex":"24"},"KHR":{"text":"៛","uniDec":"6107","uniHex":"17db"},"CAD":{"text":"$","uniDec":"36","uniHex":"24"},"KYD":{"text":"$","uniDec":"36","uniHex":"24"},"CLP":{"text":"$","uniDec":"36","uniHex":"24"},"CNY":{"text":"¥","uniDec":"165","uniHex":"a5"},"COP":{"text":"$","uniDec":"36","uniHex":"24"},"CRC":{"text":"₡","uniDec":"8353","uniHex":"20a1"},"HRK":{"text":"kn","uniDec":"107, 110","uniHex":"6b, 6e"},"CUP":{"text":"₱","uniDec":"8369","uniHex":"20b1"},"CZK":{"text":"Kč","uniDec":"75, 269","uniHex":"4b, 10d"},"DKK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"DOP":{"text":"RD$","uniDec":"82, 68, 36","uniHex":"52, 44, 24"},"XCD":{"text":"$","uniDec":"36","uniHex":"24"},"EGP":{"text":"£","uniDec":"163","uniHex":"a3"},"SVC":{"text":"$","uniDec":"36","uniHex":"24"},"EEK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"EUR":{"text":"€","uniDec":"8364","uniHex":"20ac"},"FKP":{"text":"£","uniDec":"163","uniHex":"a3"},"FJD":{"text":"$","uniDec":"36","uniHex":"24"},"GHC":{"text":"¢","uniDec":"162","uniHex":"a2"},"GIP":{"text":"£","uniDec":"163","uniHex":"a3"},"GTQ":{"text":"Q","uniDec":"81","uniHex":"51"},"GGP":{"text":"£","uniDec":"163","uniHex":"a3"},"GYD":{"text":"$","uniDec":"36","uniHex":"24"},"HNL":{"text":"L","uniDec":"76","uniHex":"4c"},"HKD":{"text":"$","uniDec":"36","uniHex":"24"},"HUF":{"text":"Ft","uniDec":"70, 116","uniHex":"46, 74"},"ISK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"INR":{"text":"","uniDec":"","uniHex":""},"IDR":{"text":"Rp","uniDec":"82, 112","uniHex":"52, 70"},"IRR":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"IMP":{"text":"£","uniDec":"163","uniHex":"a3"},"ILS":{"text":"₪","uniDec":"8362","uniHex":"20aa"},"JMD":{"text":"J$","uniDec":"74, 36","uniHex":"4a, 24"},"JPY":{"text":"¥","uniDec":"165","uniHex":"a5"},"JEP":{"text":"£","uniDec":"163","uniHex":"a3"},"KZT":{"text":"лв","uniDec":"1083, 1074","uniHex":"43b, 432"},"KPW":{"text":"₩","uniDec":"8361","uniHex":"20a9"},"KRW":{"text":"₩","uniDec":"8361","uniHex":"20a9"},"KGS":{"text":"лв","uniDec":"1083, 1074","uniHex":"43b, 432"},"LAK":{"text":"₭","uniDec":"8365","uniHex":"20ad"},"LVL":{"text":"Ls","uniDec":"76, 115","uniHex":"4c, 73"},"LBP":{"text":"£","uniDec":"163","uniHex":"a3"},"LRD":{"text":"$","uniDec":"36","uniHex":"24"},"LTL":{"text":"Lt","uniDec":"76, 116","uniHex":"4c, 74"},"MKD":{"text":"ден","uniDec":"1076, 1077, 1085","uniHex":"434, 435, 43d"},"MYR":{"text":"RM","uniDec":"82, 77","uniHex":"52, 4d"},"MUR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"MXN":{"text":"$","uniDec":"36","uniHex":"24"},"MNT":{"text":"₮","uniDec":"8366","uniHex":"20ae"},"MZN":{"text":"MT","uniDec":"77, 84","uniHex":"4d, 54"},"NAD":{"text":"$","uniDec":"36","uniHex":"24"},"NPR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"ANG":{"text":"ƒ","uniDec":"402","uniHex":"192"},"NZD":{"text":"$","uniDec":"36","uniHex":"24"},"NIO":{"text":"C$","uniDec":"67, 36","uniHex":"43, 24"},"NGN":{"text":"₦","uniDec":"8358","uniHex":"20a6"},"NOK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"OMR":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"PKR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"PAB":{"text":"B/.","uniDec":"66, 47, 46","uniHex":"42, 2f, 2e"},"PYG":{"text":"Gs","uniDec":"71, 115","uniHex":"47, 73"},"PEN":{"text":"S/.","uniDec":"83, 47, 46","uniHex":"53, 2f, 2e"},"PHP":{"text":"₱","uniDec":"8369","uniHex":"20b1"},"PLN":{"text":"zł","uniDec":"122, 322","uniHex":"7a, 142"},"QAR":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"RON":{"text":"lei","uniDec":"108, 101, 105","uniHex":"6c, 65, 69"},"RUB":{"text":"руб","uniDec":"1088, 1091, 1073","uniHex":"440, 443, 431"},"SHP":{"text":"£","uniDec":"163","uniHex":"a3"},"SAR":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"RSD":{"text":"Дин.","uniDec":"1044, 1080, 1085, 46","uniHex":"414, 438, 43d, 2e"},"SCR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"SGD":{"text":"$","uniDec":"36","uniHex":"24"},"SBD":{"text":"$","uniDec":"36","uniHex":"24"},"SOS":{"text":"S","uniDec":"83","uniHex":"53"},"ZAR":{"text":"R","uniDec":"82","uniHex":"52"},"LKR":{"text":"₨","uniDec":"8360","uniHex":"20a8"},"SEK":{"text":"kr","uniDec":"107, 114","uniHex":"6b, 72"},"CHF":{"text":"CHF","uniDec":"67, 72, 70","uniHex":"43, 48, 46"},"SRD":{"text":"$","uniDec":"36","uniHex":"24"},"SYP":{"text":"£","uniDec":"163","uniHex":"a3"},"TWD":{"text":"NT$","uniDec":"78, 84, 36","uniHex":"4e, 54, 24"},"THB":{"text":"฿","uniDec":"3647","uniHex":"e3f"},"TTD":{"text":"TT$","uniDec":"84, 84, 36","uniHex":"54, 54, 24"},"TRY":{"text":"","uniDec":"","uniHex":""},"TRL":{"text":"₤","uniDec":"8356","uniHex":"20a4"},"TVD":{"text":"$","uniDec":"36","uniHex":"24"},"UAH":{"text":"₴","uniDec":"8372","uniHex":"20b4"},"GBP":{"text":"£","uniDec":"163","uniHex":"a3"},"USD":{"text":"$","uniDec":"36","uniHex":"24"},"UYU":{"text":"$U","uniDec":"36, 85","uniHex":"24, 55"},"UZS":{"text":"лв","uniDec":"1083, 1074","uniHex":"43b, 432"},"VEF":{"text":"Bs","uniDec":"66, 115","uniHex":"42, 73"},"VND":{"text":"₫","uniDec":"8363","uniHex":"20ab"},"YER":{"text":"﷼","uniDec":"65020","uniHex":"fdfc"},"ZWD":{"text":"Z$","uniDec":"90, 36","uniHex":"5a, 24"}};
            $scope.CurrencyUnit = mapping[$window.localStorage.getItem("Lelong_CurrencyUnit")].text||$;
        }        

        $scope.step = 1;
        $scope.imgURI = [];
        $scope.imageDeleted = [];
        $scope.uploadDir = "";
        $scope.viewTitle = "Add new";
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
            $scope.viewTitle='';    
            /** UPDATE GoodsPublish: get publishGood by id */
            goodsService.getGoodsById($scope.goodsId).then(function (res) {
                $scope.goodItem = res;   
                $scope.viewTitle = res.Title;               
                $scope.CatesName = convertCateIdToName($scope.goodItem.Category);
                $scope.imgURI= res.listPhoto;
                updateSlide();               
                if(res.LastSync == undefined || res.LastSync.trim().length <=0){
                    $rootScope.$broadcast('disableSubAction','Sync')
                }

            });
        } else {
            requestAccessFs();
            /**ADD NEW GoodsPublish */
            $scope.goodItem = { Category: '', Title: '', Condition: '', UserId: $scope.tokenServ.userid, Active: 1, CreatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), LastEdited: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), Guid: goodsFolderName };
        }
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
           saveClick(true);
       }
   }
   ];
   var subActions = [
   {
    name: 'Delete', action: function () {
        if (navigator.notification) {
            navigator.notification.confirm('Are you sure to delete this item?', function (result) {
                if (result == 1) {                                                     
                    if ($scope.goodsId  != undefined && parseInt($scope.goodsId) >0) {
                        showSpinner();
                        goodsService.deleteGoods([$scope.goodItem]).then(function (result) {
                            // call api to delete from server
                            $cordovaToast.showLongTop('Delete successful!').then(function () {
                                $ionicHistory.clearCache().then(function () {
                                    $state.go('app.completes');
                                });
                            });	
                            $ionicLoading.hide();							
                        });
                    }
                }
            });
        }
    }
},
{ name: 'Sync', action: function () {
    if ($scope.goodItem){
        if ($scope.goodItem.LastSync && $scope.goodItem.LastEdited && 
            new Date($scope.goodItem.LastSync).getTime() < new Date($scope.goodItem.LastEdited).getTime()){
            if (navigator.notification) {
                navigator.notification.confirm('Are you sure to sync and override this item?', function (result) {
                    if (result == 1) {
                     showSpinner();
                     goodsService.sync([$scope.goodItem],function(){                      
                        $cordovaToast.showLongTop('Sync successfully!').then(function(){
                            $ionicHistory.clearCache().then(function(){
                                $state.go('app.completes');
                            });
                        });
                        $ionicLoading.hide();
                    },function(err){
                        $ionicLoading.hide();
                    });
                 }
             });
            }
        } else {
           showSpinner();
            goodsService.sync([$scope.goodItem],function(){
                $cordovaToast.showLongTop('Sync successfully!').then(function () {
                        $ionicHistory.clearCache().then(function(){
                                $state.go('app.completes');
                        });
                    });
                $ionicLoading.hide();
            },function(err){
                 $ionicLoading.hide();
            });
        }
    }
} 
}]
if ($scope.editMode) {
    $rootScope.$broadcast("setMainActions", actions);
    $rootScope.$broadcast("setSubActions", subActions);
} else {
    $rootScope.$broadcast("setMainActions", actions);
}
/**End Top bar actions */
/** Choose Category */
$scope.showPopup = function () {
    if ($scope.editMode) {
        if ($scope.goodItem.Category.length > 0) {
            var arrOldCate = $scope.goodItem.Category.split(';');
            for (var i = 0; i < arrOldCate.length; i++) {
                for (var j = 0; j < $scope.defaultCategory.length; j++) {
                    if (arrOldCate[i] == $scope.defaultCategory[j].value) {
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
        var lstCateValue = [];
        var lstCateName = [];
        for (var i = 0; i < $scope.defaultCategory.length; i++) {
            if ($scope.defaultCategory[i].isChecked) {
                lstCateValue.push($scope.defaultCategory[i].value);
                lstCateName.push($scope.defaultCategory[i].name);
            }
        }
        $scope.CatesName = lstCateName.join(';');
        $scope.goodItem.Category = lstCateValue.join(';');
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
        quality: 70,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation: true,
        targetWidth:600,
        targetHeight:600
    };

    $cordovaCamera.getPicture(options).then(function (imagePath) {
        copyImgToPerFolder(imagePath).then(function(res){
            imageService.removeFileFromPersitentFolder(imagePath);
        });
    }, function (error) {
        // An error occured. Show a message to the user
        console.log('From Camera: ' + JsonParse(error));
    });
}

$scope.getImageFromLibrary = function () {
    var options = {
        maximumImagesCount: 5,
        quality: 70,
        width:600,
        height:600
    };

    $cordovaImagePicker.getPictures(options).then(function (results) {
        for (var i = 0; i < results.length; i++) {
            var img=results[i];
            copyImgToPerFolder(img).then(function(res){
                imageService.removeFileFromPersitentFolder(img);
            });            
        }
    }, function (error) {
        console.log('From Library Photo: ' + JsonParse(error));
    });
};

$scope.deleteImg = function (fullNamePath, Photoid) {
    for (var i = 0; i < $scope.imgURI.length; i++) {
        var file = getImageFileName($scope.imgURI[i].PhotoUrl);
        var fileDel = getImageFileName(fullNamePath);
        if (file === fileDel) {
            $scope.imgURI.splice(i, 1);
            if (Photoid > 0) {
                $scope.imageDeleted.push({ Photoid: Photoid, PhotoUrl: fullNamePath });
            } else {
                // delete the img that isn't save into db
                imageService.removeFileFromPersitentFolder(fullNamePath).then(function (res) {
                });
            }
            break;
        }
    }
    updateSlide();
}
/**End camera */
/**Cordova file */
/** create folder with name 'ImagesUpload / userid */
$scope.dirName = "ImagesUpload";
$scope.subDir = "" + $scope.tokenServ.userid + ""
$scope.goodsFolder = "" + goodsFolderName + ""
function requestAccessFs() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
        dirEntry.root.getDirectory($scope.dirName, { create: true }, function (subDirEntry) {
            subDirEntry.getDirectory($scope.subDir, { create: true }, function (dir) {
                dir.getDirectory($scope.goodsFolder, { create: true }, function (success) {
                    $scope.uploadDir = $scope.dirName + "/" + $scope.subDir + "/" + $scope.goodsFolder + "/";
                    console.log("CREATE SUBDIR SUCCESS!!!" + $scope.uploadDir);
                }, fnFailed)
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
                    $scope.imgURI.push({ 
                                    Photoid: 0, GoodPublishId: $scope.goodsId, 
                                    PhotoUrl: success.nativeURL 
                                });                             
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
function saveClick (isShowToast) {
    if (formIsValid()) {
        var arrImage = [];
        if ($scope.imgURI.length > 0) {
            for (var i = 0; i < $scope.imgURI.length; i++) {
                arrImage.push($scope.imgURI[i].PhotoUrl);
            }
        }
        if ($scope.editMode) {
            if(isShowToast) {showSpinner()}
            /**update */
            var imgSave = [];
            if ($scope.imgURI.length > 0) {
                for (var i = 0; i < $scope.imgURI.length; i++) {
                    if ($scope.imgURI[i].Photoid == 0) {
                        imgSave.push($scope.imgURI[i]);
                    }
                }
            }
            if ($scope.imageDeleted.length > 0) {
                for (var i = 0; i < $scope.imageDeleted.length; i++) {
                    imgSave.push($scope.imageDeleted[i]);
                    //delete the image saved into db
                    imageService.removeFileFromPersitentFolder($scope.imageDeleted[i].PhotoUrl).then(function (res) {
                    });
                }
            }
            goodsService.updateGoods($scope.goodItem, imgSave, "", isShowToast).then(function(){
                if (isShowToast) {
                    $cordovaToast.showLongTop('Update successfully!').then(function () {
                        $ionicHistory.clearCache().then(function () {
                            $state.go('app.completes');
                        });
                    });
                }
             if(isShowToast){$ionicLoading.hide();}
            },function(err){
                $cordovaToast.showLongTop('Update failed!');    
            if(isShowToast){$ionicLoading.hide();}
            });
        } else {
            /**insert */
            if(isShowToast) {showSpinner()}
            goodsService.saveGoods($scope.goodItem, arrImage, isShowToast).then(function(res){
                if (isShowToast) {
                    $cordovaToast.showLongTop('Save successfully!').then(function () {
                        $ionicHistory.clearCache().then(function () {
                            $state.go('app.completes');
                        });
                    });
                }
                if(isShowToast){$ionicLoading.hide();}
            },function(err){
                $cordovaToast.showLongTop('Save failed!');              
                if(isShowToast){$ionicLoading.hide(); }
            });
        }
    }
}
$scope.showMoreInput = function (isHidden) {
    if (!isHidden) {
        $scope.inputMore = { hide: true, class: 'ion-ios-arrow-up' };
        $location.hash('anchorPrice');
        $ionicScrollDelegate.anchorScroll();
    } else {
        $scope.inputMore = { hide: false, class: 'ion-ios-arrow-down' };
    }
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
                showSpinner();
                saveClick(false);
                /** post goods to server */
                if ($scope.imgURI.length > 0) {
                    for (var i = 0; i < $scope.imgURI.length; i++) {
                        var pName = getImageFileName($scope.imgURI[i].PhotoUrl);
                        listPhoto.push({
                            PhotoName: pName,
                            PhotoUrl: $scope.imgURI[i].PhotoUrl,
                            PhotoDescription: ""
                        })
                    }
                };
                angular.extend(newSource, $scope.goodItem, { listPhoto: listPhoto });
                var listGoods = []; listGoods.push(newSource);
                goodsService.publish(listGoods).then(function (result) {
                    if (result.message === 'Success') {
                        $cordovaToast.showLongTop('Publish successful!');
                        $ionicHistory.clearCache().then(function () {
                            $state.go('app.completes');
                        });
                    } else $cordovaToast.showLongTop('Publish failed!');
                    $ionicLoading.hide();
                },function(err){
                     $cordovaToast.showLongTop('Publish failed!');
                     $ionicLoading.hide();
                });
            }
        });
    }
}

/** end Post to server */
/** Gallery Options */
$scope.galleryOptions = {
    pagination: '.swiper-pagination',
    slidesPerView: 3,
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
        if ($scope.slider) 
        {
            try{
              $scope.slider.update();
          }catch(err){};
      }
  });
}
function getImageFileName(fullNamePath) {
    return fullNamePath.replace(/^.*[\\\/]/, '');
}

function convertCateIdToName(catesId) {
    var lstName = [];
    if (catesId != undefined && catesId.length > 0) {
        var lstId = catesId.split(';');
        for (var i = 0; i < lstId.length; i++) {
            for (var j = 0; j < $scope.defaultCategory.length; j++) {
                if (lstId[i] == $scope.defaultCategory[j].value) {
                    lstName.push($scope.defaultCategory[j].name);
                    break;
                }
            }
        }
    }
    return lstName.join(';');
}

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
    var result = $scope.errors.length == 0;
    if (!result) {
        $ionicScrollDelegate.scrollTop();
    }
    return result
}
function showSpinner(){
   $ionicLoading.show({
    template: '<p>Processing...</p><ion-spinner icon="spiral"></ion-spinner>'
});
}
/**end helper method */

});
