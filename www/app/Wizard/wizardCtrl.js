angular.module("LelongApp.Wizard",[])
.controller('WizardCtrl', function ($scope, $window, $ionicScrollDelegate,$rootScope, $dbHelper, xhttpService, tokenService,$ionicSideMenuDelegate,$q, $cordovaToast, $state, $ionicHistory)  {
    $rootScope.$broadcast('hideSearch');
    $scope.defaultcurrency=  [
    {code:1, name:"MYR", unit:"RM" }, 
    {code:2, name:"USD", unit:"$" }, 
    {code:3, name:"VND", unit:"₫" }
    ];
    $scope.defaultvalue=  [
    {code:1, name:"Phone & Tablet" }, 
    {code:2, name:"Electronics & Appliances" }, 
    {code:3, name:"Fashion" },
    {code:4, name:"Beauty & Personal Care" },
    {code:5, name:"Toys & Games" },
    {code:6, name:"Watches, Pens & Clocks" },
    {code:7, name:"Gifts & Premiums" },
    {code:8, name:"Home & Gardening" },
    {code:9, name:"Sports & Recreation" },
    {code:10, name:"Books & Comics" }
    ];
    $scope.checkItems = {};
    $scope.isnew = false;
    $scope.objWizard = {};
    $scope.errorMessage = "";
    $scope.save = function()
    {
        if ($scope.isValid())
        {
            $scope.readObject();
            $scope.saveObject();
        }
    }
    $scope.readObject = function(){
        $scope.objWizard.ItemsCategory= "";
        for(i in $scope.checkItems) {
            if($scope.checkItems[i])
            {
                $scope.objWizard.ItemsCategory += i;  
                $scope.objWizard.ItemsCategory += ",";              
            }
        }
        $scope.objWizard.ItemsCategory = $scope.objWizard.ItemsCategory.substr(0,$scope.objWizard.ItemsCategory.length - 1);

        $scope.objWizard.ShippingFee = $scope.peninsular + "," + $scope.eastmalaysia;
        $scope.objWizard.CurrencyUnit = $scope.currency;        
    }
    $scope.saveObject = function () {  
                     
        for (var i = 0; i<= $scope.defaultcurrency.length-1;i++){
            if  ($scope.defaultcurrency[i].code == $scope.currency){
                $window.localStorage.setItem("Lelong_CurrencyUnit", $scope.defaultcurrency[i].unit);
                break;
            }
        }
        if  ($scope.isnew)
        {
            $dbHelper.insert('Wizard',$scope.objWizard).then(function (res) {
                $ionicHistory.clearCache().then(function () {  
                    $state.go('app.completes');
                    $cordovaToast.showLongTop('Save successful!');
                });
            }, function (err) {
                $scope.errorMessage = "ERROR Insert Wizard Table: " + err;
            });
        }
        else
        {
             $dbHelper.update('Wizard',$scope.objWizard, "WizardId="+ $scope.objWizard.WizardId).then(function (res) {       
                $ionicHistory.clearCache().then(function () {  
                    $state.go('app.completes');
                    $cordovaToast.showLongTop('Save successful!');
                });
            }, function (err) {
                    $scope.errorMessage = "ERROR Update Wizard Table: " + err;
            });
        } 
    }

    $scope.isValid = function()
    {
        var _isValid = true;
        var count = 0;
        if ($scope.checkItems != null)
        {
            for (i in $scope.checkItems){
                if (i != "" && $scope.checkItems[i]){
                    count+=1;
                }
            }
        }        
        if (count >  0 && count < 3){
            $scope.errorMessage = "You select least 3 of your items category";
            _isValid = false;
        }
        if (!_isValid){
            $ionicScrollDelegate.scrollTop();
        }
        return _isValid;
    }
    
    $scope.initWizard = function()
    {     
        $ionicSideMenuDelegate.toggleLeft();
        var token = tokenService.getToken();
        var userId = token.userid;     
         if (userId != null) {           
            $scope.objWizard.UserId = userId;
            $scope.initWizardByUser(userId);
        }
        else {
            $scope.errorMessage = "Can't get User ID from token";
        }
    }
                   
    $scope.initWizardByUser = function(userId)
    {
        $scope.currency = $scope.defaultcurrency[0].code;
        $scope.isnew = true;       
        $dbHelper.select("Wizard", "WizardId,UserId,DaysOfShip,ItemsCategory,ShippingFee,CurrencyUnit", "UserId="+ userId)
        .then(function(response){
            if  (response.length > 0)
            {
                $scope.objWizard.WizardId = response[0].WizardId;
                $scope.objWizard.DaysOfShip = response[0].DaysOfShip;
                var items = response[0].ItemsCategory.split(",");
                for (var i = 0;i<= items.length-1;i++)
                {
                   $scope.checkItems[items[i]] = true;
                }
                if (response[0].ShippingFee != null && response[0].ShippingFee != "")
                {
                    items = response[0].ShippingFee.split(",");
                    $scope.peninsular =  items[0] != "" ? items[0] * 1 : 0 * 1;
                    $scope.eastmalaysia =  items[1] != "" ? items[1] * 1 : 0 * 1;
                }
                $scope.objWizard.ShippingFee = response[0].ShippingFee;
                if (response[0].CurrencyUnit != undefined && response[0].CurrencyUnit != 0){
                    $scope.currency = response[0].CurrencyUnit;
                }
               
                $scope.isnew = false;
            }          
        });
    };
})