angular.module("LelongApp.Goods")
.controller("addnewCtrl",function($scope,$ionicActionSheet,$cordovaCamera){
    $scope.step=1;

    $scope.nextClick=function(){
        $scope.step +=1;
    }

    $scope.prevClick=function(){
         $scope.step -=1;
    }
/* ActionSheet */
    $scope.choosePhotoAction = function() {
    
    $ionicActionSheet.show({
      titleText: 'Choose an action',
      buttons: [
        { text: '<i class="icon ion-ios-camera-outline"></i> Camera' },
        { text: '<i class="icon ion-ios-photos"></i> Photo library' },
      ],    
      cancelText: 'Cancel',
      cancel: function() {
        console.log('CANCELLED');
      },
      buttonClicked: function(index) {
        if(index===0){
            //camera
            $scope.takePicture();
        }else{
            //Photo library
            showPhotoLibrary();
        }
        return true;
      },
      destructiveButtonClicked: function() {
        console.log('DESTRUCT');
        return true;
      }
    });
  };

function showPhotoLibrary(){

}

/*End ActionSheet */
/*Camera */
 $scope.takePicture = function() {
        var options = { 
            quality : 75, 
            destinationType : Camera.DestinationType.DATA_URL, 
            sourceType : Camera.PictureSourceType.CAMERA, 
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
 
        $cordovaCamera.getPicture(options).then(function(imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            // An error occured. Show a message to the user
        });
    }

});