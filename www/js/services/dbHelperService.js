angular.module('LelongApp.services')
.factory('$dbHelper',function($cordovaSQLite){
    var dbHelper={
            openDB:function(){
                var db=$cordovaSQLite.openDB({name:'LeLongDB',location: 'default'});
			    return db;
            },
            query:function(tableName,fields,whereClause){
                
            }
    };
    return dbHelper;
});