angular.module('LelongApp.services')
.factory('$dbHelper',function($cordovaSQLite,$rootScope){
    var dbHelper={
            openDB:function(){
                var dbConnect=$cordovaSQLite.openDB({name:'LeLongDB.db',location: 'default'});                
			    return dbConnect;
            },
            query:function(tableName,fields,whereClause){
                var whereCondition="";
                // if(whereClause.length>0){
                //     whereCondition= whereClause;
                // }
                var command="SELECT " + fields + " FROM " + tableName + whereCondition;
                return "";
            },
            createTable:function(tableName,fields){
                var command="CREATE TABLE IF NOT EXISTS " + tableName +"("+ fields +")"
                $cordovaSQLite.execute($rootScope.db,command);
                console.log('==============Table '+ tableName +' Created============');            
            }
    };
    return dbHelper;
});