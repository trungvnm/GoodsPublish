angular.module('LelongApp.services')
    .factory('goodsService', function ($dbHelper, $rootScope, $q, tokenService) {
        var goodService = {
            getAll: function () {
                var token = tokenService.getToken();
                var userId = token.userid;
				
				// Condition for filter
				var whereClause = ' WHERE UserId=\''+userId+'\'';
				
				// Query to extract data
				var query = 'SELECT	GoodPublishId, Title, SalePrice, Description, Quantity, (	SELECT PhotoUrl FROM	GoodsPublishPhoto WHERE	GoodPublishId = GoodsPublish.GoodPublishId LIMIT 1) AS PhotoUrl ';
				query += 'FROM	GoodsPublish';
				query += whereClause;
				
				return $dbHelper.selectCustom(query).then(function(result){
					return result;
				});
            },
            getGoodsById: function (goodId) {
				// Condition for filter
				var whereClause = ' WHERE GoodPublishId=\''+goodId+'\'';
				
				// Query to extract data
				var query = 'SELECT	* ';
				query += 'FROM	GoodsPublish ';
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