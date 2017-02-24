angular.module("LelongApp.Wizard",[])
.controller('WizardCtrl', function ($scope, $q, $window, $http,$location,$dbHelper, xhttpService, tokenService)  {
    $scope.values=  [
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
    $scope.selectedValues= []; //initial selections
    $scope.checkItems = { };
    $scope.isnew = false;
    $scope.ischange = false;
    $scope.objWizard = {};
    $scope.save = function () {
        
        debugger;
        var defer = $q.defer();
        for(i in $scope.checkItems) {
            if($scope.checkItems[i] == true) {
                objWizard.ItemsCategory += i;
            }
            if  ($scope.checkItems > 0)
            {
                objWizard.ItemsCategory += ",";
            }
        }

        objWizard.ShippingFee = $scope.Pe + "," + $scope.EM;
       
        if  ($scope.isnew && $scope.ischange)
        {
             $dbHelper.insert('Wizard',objWizard);
        }
        else if  (!$scope.isnew && $scope.ischange)
        {
            $dbHelper.update('Wizard',objWizard);
        }
    }
    $scope.initwizard = function()
    {
        debugger;
        if ($window.localStorage.getItem("Lelong_UserLogined") != null)
        {
            //load by user 
            var username = $window.localStorage.getItem("Lelong_UserLogined") ;
            $dbHelper.select("User", "UserName", " UserName = '"+username +"' ").then(function(response){
                if  (response.length > 0)
                {
                    $scope.UserId = response[0].UserId;
                }
                else
                {
                    console.log("Can't get current user by "+ username);
                }
            });
            $dbHelper.select("Wizard", "WizardId,UserId,DaysOfShip,ItemsCategory,ShippingFee", " UserId = '"+$scope.userid +"' ").then(function(response){
            if  (response.length > 0)
            {//edit
                objWizard.WizardId = response[0].WizardId;
                objWizard.DaysOfShip = response[0].DaysOfShip;
                objWizard.checkItems = $scope.values;                
                var items = response[0].ItemsCategory.split(",");
                for (var i = 0;i<= items.length-1;i++)
                {
                    element = $scope.checkItems;
                    array.forEach(function(element) {
                        if  (this === items[i])
                        {
                            this = true;
                        }
                    }, this);
                }

                objWizard.ShippingFee = response[0].ShippingFee;
                $scope.isnew = false;
                $scope.ischange = true;
            }
            else
            {//adnew
                $dbHelper.select("Wizard", "WizardId").then(function(response){
                    if  (response.length > 0)
                    {
                        objWizard.WizardId = response[0].WizardId + 1;                    
                    }
                    else
                    {
                        objWizard.WizardId = 1;
                    } 
                    $scope.isnew = true;   
                    $scope.ischange = true;                
                })
            }
        });
    }
        
    }
})