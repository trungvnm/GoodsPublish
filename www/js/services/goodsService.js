angular.module('LelongApp.services')
    .factory('goodsService', function ($dbHelper, $rootScope, $q, tokenService) {
        var goodService = {
            getAll: function (searchKey) {
                var token = tokenService.getToken();
                var userId = token.userid;
				
				// Condition for filter
				var whereClause = ' WHERE UserId=\''+userId+'\'';
                if (searchKey && searchKey.trim() != ''){
                    whereClause += ' AND Title LIKE \'%'+searchKey+'%\'';
                }
				
				// Query to extract data
				var query = 'SELECT	GoodPublishId, Title, SalePrice, Description, Quantity, (	SELECT PhotoUrl FROM	GoodsPublishPhoto WHERE	GoodPublishId = GoodsPublish.GoodPublishId LIMIT 1) AS PhotoUrl ';
				query += 'FROM	GoodsPublish';
				query += whereClause;
				
				return $dbHelper.selectCustom(query).then(function(result){
					return result;
				});
            },
            getGoodsById: function (goodId) {
				var token = tokenService.getToken();
                var userId = token.userid;
				
				// Condition for filter
				var whereClause = 'GoodPublishId=\''+goodId+'\'';
				
				// Query to extract data
				var query = 'SELECT	*, (	SELECT PhotoUrl FROM	GoodsPublishPhoto WHERE	GoodPublishId = GoodsPublish.GoodPublishId LIMIT 1) AS PhotoUrl ';
				query += 'FROM	GoodsPublish';
				query += whereClause;
				
				return $dbHelper.selectCustom(query).then(function(result){
					if (result && result.length > 0){
						return result[0];
					}
					return null;
				});
            },
        };

        return goodService;
    });