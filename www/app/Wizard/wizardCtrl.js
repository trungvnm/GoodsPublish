angular.module("LelongApp.Wizard",[])
.controller('WizardCtrl', function ($scope, $dbHelper, xhttpService, tokenService, $cordovaToast)  {
    $scope.defaultvalue=  [
    {code:1, name:"Phone & Tablet" }, 
    {code:2, name:"Electronics & Appliances" }, 
    {code:3, name:"Fasion" },
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
    $scope.isload = false;
    $scope.objWizard = {};
    $scope.errorMessage = "";
    $scope.peninsular ="";
    $scope.eastmalaysia="";

    $scope.save = function () {        
        if ($scope.isValid())
        {
            $scope.objWizard.ItemsCategory= "";
            for(i in $scope.checkItems) {
                if($scope.checkItems[i])
                {
                    $scope.objWizard.ItemsCategory += i;                
                }
                if($scope.checkItems != null)
                {
                    $scope.objWizard.ItemsCategory += ",";
                }    
            }
            $scope.objWizard.ItemsCategory = $scope.objWizard.ItemsCategory.substr(0,$scope.objWizard.ItemsCategory.length - 1);

            $scope.objWizard.ShippingFee = $scope.peninsular + "," + $scope.eastmalaysia;

            if  ($scope.isnew)
            {
                $dbHelper.insert('Wizard',$scope.objWizard).then(function (res) {
                    setTimeout(function () {                        
                        $cordovaToast.showLongTop('Save successful!', function (sucess) {});
                    }, 3000);
                });
            }
            else
            {
                $dbHelper.update('Wizard',$scope.objWizard).then(function (res) {
                    setTimeout(function () {                        
                        $cordovaToast.showLongTop('Save successful!', function (sucess) {});
                    }, 3000);
                });
            }            
        }        
    }

    $scope.isValid = function()
    {
        var count = 0;
        if ($scope.checkItems != null)
        {
            for (i in $scope.checkItems){
                if ($scope.checkItems[i])
                {
                    count+=1;
                }
            }
        }        
        if (count >  0 && count < 3)
        {
            $scope.errorMessage = "You select least 3 of your items category";
            return false;
        }
        return true;
    }
    
    $scope.initWizard = function()
    {     
        var token = tokenService.getToken();
        var userId = token.userid;       
        if (userId != null)
        {
            $scope.objWizard.UserId = userId;
            $scope.initWizardByUser(userId);
        }
        else
        {
            $scope.errorMessage = "Can't get User ID from token";
        }
        $scope.isload = true;
    }

    $scope.initWizardByUser = function(userId)
    {
        $scope.isnew = true; 
        $dbHelper.select("Wizard", "WizardId,UserId,DaysOfShip,ItemsCategory,ShippingFee", " UserId = '"+ userId +"' ")
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
                    $scope.peninsular =  items[0] != "" ? items[0] : 0;
                    $scope.eastmalaysia =  items[1] != "" ? items[1] : 0;
                }
                $scope.objWizard.ShippingFee = response[0].ShippingFee;
                $scope.isnew = false;
            }          
        });
    }
})