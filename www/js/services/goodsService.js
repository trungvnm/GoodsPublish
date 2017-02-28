angular.module('LelongApp.services')
    .factory('goodsService', function ($dbHelper, $rootScope, $q, tokenService) {
        var goodService = {
            search: function (searchKey) {
                var token = tokenService.getToken();
                var userId = token.userid;
                var whereClause = 'UserId=\''+userId+'\'';
                if (searchKey && searchKey != '' && searchKey.length > 0){
                    whereClause += ' AND Title LIKE \'%'+searchKey+'%\'';
                }

                return $dbHelper.select('GoodsPublish', 'GoodPublishId, Title, SalePrice, Description, Quantity', whereClause).then(function(result){
                    var goods = [];
                    for (var i = 0; i<result.length;i++){
                        var good = result[i];
                        var photoFilter = 'GoodPublishId = \''+result[i].GoodPublishId+'\'';
                        $dbHelper.select('GoodsPublishPhoto', 'PhotoUrl', photoFilter).then(function(photoResult){
                            if (photoResult.length > 0){
                                good.photoUrl = photoResult[0].PhotoUrl;
                            }
                            return good;
                        });
                        goods.push(good);
                    }
                    return goods;
                });
            },
            getGoodsById: function (goodId) {
                var whereClause = 'GoodPublishId=\''+goodId+'\'';
                
                return $dbHelper.select('GoodsPublish', 'GoodPublishId, UserId, Title, Subtitle, Condition, Guid, Price, SalePrice,' + 
                'msrp, costprice, SaleType, Category, StoreCategory, Brand, ShipWithin, ModelSkuCode, State,' +
                'Link, Description, Video, VideoAlign, Active, Weight, Quantity, ShippingPrice, WhoPay, ShippingMethod, ShipToLocation,' + 
                'PaymentMethod, GstType, OptionsStatus', whereClause).then(function(result){
                    var good = result;
                    var photoFilter = 'GoodPublishId = \''+result.GoodPublishId+'\'';
                    $dbHelper.select('GoodsPublishPhoto', 'PhotoUrl', photoFilter).then(function(photoResult){
                        good.photos = photoResult;
                        return good;
                    });
                    return good;
                });
            },
        };

        return goodService;
    });