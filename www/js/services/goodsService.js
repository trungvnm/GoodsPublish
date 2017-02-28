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

                var promises = [];
                
                return $dbHelper.select('GoodsPublish', 'GoodPublishId, Title, SalePrice, Description, Quantity', whereClause).then(function(result){
                    for (var i = 0; i<result.length;i++){
                        var good = result[i];
                        var photoFilter = 'GoodPublishId = \''+result[i].GoodPublishId+'\'';
                        var promise = $dbHelper.select('GoodsPublishPhoto', 'PhotoUrl', photoFilter).then(function(photoResult){
                            if (photoResult.length > 0){
                                good.photoUrl = photoResult[0].PhotoUrl;
                            }
                            return good;
                        });
                        promises.push(promise);

                        return promises;
                    }
                });

                //return $q.when.apply(undefined, promises).promise();
            },
            getGoodsById: function (goodId) {
                
            },
        };

        function extractTableFieldsAndValues(tableName, objwithFieldsAndValues, isUpdate) {
            
        }

        function runQuery(query, params, fnSuccess, fnError) {
            
        }
        function createTable(tableName, fields) {
            
        };

        function EscapeValues(fields) {
            
        };

        return goodService;
    });