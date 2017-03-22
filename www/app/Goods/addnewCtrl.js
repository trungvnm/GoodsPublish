angular.module("LelongApp.Goods").controller("addnewCtrl", function ($scope, $window, $dbHelper, $rootScope, $ionicActionSheet, $ionicHistory,
    $cordovaCamera, $cordovaImagePicker, $cordovaToast, $cordovaFile, tokenService, $state, $q, $timeout,
    $ionicSlideBoxDelegate, $ionicPopup, imageService, goodsService,utilService, $stateParams, $location, $ionicScrollDelegate, $ionicLoading, $ionicPlatform) {

    var goodsFolderName = generateUUID();
    $scope.goodsId = $stateParams.goodsId;
    $scope.editMode = false;
    $scope.hasChange = false;
    $rootScope.hasChanged = false;
    $scope.initialGoods={};
    if ($scope.goodsId.length > 0 && parseInt($scope.goodsId) > 0) {
        $scope.editMode = true;    
    }
    $scope.tokenServ = tokenService.getToken();
    // $rootScope.$broadcast('hideSearch');
    $scope.errors = [];
    $scope.CatesName = '';
    $scope.CurrencyUnit = '';
    $scope.inputMore = { hide: false, class: 'ion-ios-arrow-down' };
    $scope.strategy = '';
    $scope.init = function () {

        if ($window.localStorage.getItem("Lelong_CurrencyUnit") != undefined)
        {
            $scope.CurrencyUnit = utilService.getCurrencyUnit();
            $scope.strategy = utilService.getFormatCurrency(false);
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
                $scope.initialGoods= angular.copy($scope.goodItem);          
                getFolderUploadImg(res.Guid);               
                $scope.CatesName = convertCateIdToName(res.Category);
                $scope.imgURI= res.listPhoto;                
                updateSlide();               
                if(res.LastSync == undefined || res.LastSync.trim().length <=0){
                    $rootScope.$broadcast('disableSubAction','Sync')
                }
                watchGoodsObject(2000);         
            });
        } else {
            requestAccessFs();
            /**ADD NEW GoodsPublish */            
            $scope.goodItem = { Category: '', Title: '', Condition: '', UserId: $scope.tokenServ.userid, Active: 1, CreatedDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), LastEdited: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), Guid: goodsFolderName };;
            $scope.initialGoods= angular.copy($scope.goodItem);
            watchGoodsObject(3000);
        }             
    }

    /** Orverride BACK button action only this view */
    var deregister = $ionicPlatform.registerBackButtonAction(
      function () {
          console.log("Back to list goods by press BACK button home.");
          if ($scope.hasChange) {
                utilService.unsavedConfirm();
           } 
          else {
              //$ionicHistory.goBack(-1);
              utilService.goDirectView($ionicHistory.backView().viewId)
          }
        
      }, 100
    );
    //Then when this scope is destroyed, remove the function
    $scope.$on('$destroy', deregister)

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
                        },function(err){
                             $cordovaToast.showLongTop('Delete failed!');
                             $ionicLoading.hide();
                        });
                    }
                }
            });
        }
    }
},
{ name: 'Sync', action: function () {
    if ($scope.goodItem) {
        var inputGoods = []; inputGoods.push($scope.goodItem);
        if (goodsService.checkOveriderGoodsInfo(inputGoods)) {
            if (navigator.notification) {
                navigator.notification.confirm('Are you sure to sync and override this item?', function (result) {
                    if (result == 1) {
                     showSpinner();
                     goodsService.sync([$scope.goodItem]).then(function(){
                        $cordovaToast.showLongTop('Sync successfully!').then(function(){
                            $ionicHistory.clearCache().then(function(){
                                $state.go('app.completes');
                            });
                        });
                        $ionicLoading.hide();
                    },function(err){
                        console.log("SYNC FAILED: " + JsonParse(err));
                        $cordovaToast.showLongTop('Sync failed!').then(function(){
                             $ionicLoading.hide();
                        })
                    });
                 }
             });
            }
        } else {
           showSpinner();
            goodsService.sync([$scope.goodItem]).then(function(){
                $cordovaToast.showLongTop('Sync successfully!').then(function () {
                        $ionicHistory.clearCache().then(function(){
                                $state.go('app.completes');
                        });
                    });
                $ionicLoading.hide();
            },function(err){
                 console.log("SYNC FAILED: " + JsonParse(err));
                  $cordovaToast.showLongTop('Sync failed!').then(function(){
                             $ionicLoading.hide();
                  })
            });
        }
    }
} 
}]
if ($scope.editMode) {
    $rootScope.$broadcast("setMainActions", actions);
    $rootScope.$broadcast("setSubActions", subActions);
    $rootScope.$broadcast('disableMainAction','upload')
} else {
    $rootScope.$broadcast("setMainActions", actions);
    $rootScope.$broadcast('disableMainAction','upload')
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
            if(!$scope.hasChange){
                 $rootScope.$broadcast('enableMainAction','upload');
                 $scope.hasChange=true;
            }
            $scope.imgURI.splice(i, 1);
            if (Photoid > 0) {
                $scope.hasChange=true;
                $scope.imageDeleted.push({ Photoid: Photoid, PhotoUrl: fullNamePath });
            } else {
                $scope.hasChange=false;
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
 $scope.subDir = "" + $scope.tokenServ.userid + "";
 $scope.goodsFolder= "" + goodsFolderName + "";
function getFolderUploadImg(goodGuid){
    var gDir="";
    if(goodGuid !==undefined && goodGuid.trim().length>0){
        gDir=goodGuid;
    }else{
        gDir="" + goodsFolderName + "";
    }
    $scope.goodsFolder = gDir;
    $scope.uploadDir= $scope.dirName + "/" + $scope.subDir + "/" + $scope.goodsFolder + "/";
}

function requestAccessFs() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (dirEntry) {
        dirEntry.root.getDirectory($scope.dirName, { create: true }, function (subDirEntry) {
            subDirEntry.getDirectory($scope.subDir, { create: true }, function (dir) {
                dir.getDirectory($scope.goodsFolder, { create: true }, function (success) {
                    getFolderUploadImg($scope.goodsFolder);
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
                    if(!$scope.hasChange){
                         $rootScope.$broadcast('enableMainAction','upload');
                         $scope.hasChange=true;
                    }
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
                            $state.go('navbar.goods', {type: '2'});
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
							$state.go('navbar.goods', {type: '0'});
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
                            $ionicLoading.hide();
                        });
                    } else {
                        $cordovaToast.showLongTop('Publish failed!');
                        $ionicLoading.hide();
                    }
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
    else if (item.SalePrice === undefined || item.SalePrice == 0 || item.SalePrice == "") {
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

var counter=0;
function watchGoodsObject(times){
 setTimeout(function(){
          $scope.$watch('goodItem',function(newval,oldval){               
          //console.log('G: ' + JsonParse($scope.initialGoods));
             if(counter==0){
                oldval=$scope.initialGoods;
              }
             if(!$scope.hasChange && (!angular.equals(newval,oldval))){
                $rootScope.$broadcast('enableMainAction','upload');
                $scope.hasChange = true;
                counter++;
             }
             if($scope.hasChange && (angular.equals(newval,$scope.initialGoods))){
                 $rootScope.$broadcast('disableMainAction','upload');
                 $scope.hasChange = false;
                 counter++;
             }
              $rootScope.hasChanged = $scope.hasChange;
          },true);
    },times);
}

function popupShow() {
  var confirmPopup = $ionicPopup.show({
   title : 'Leave detail',
   template : 'You have unsaved changes, are you sure that you want to leave?',
   buttons : [{
    text : 'Cancel',
    type : 'button button-stable button-outline',
   }, {
        text : 'Ok',
        type : 'button button-balanced button-outline',
        onTap : function() {
            $state.go('app.completes');
        }
   }]
  });
}
/**end helper method */

});
