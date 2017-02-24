angular.module('LelongApp.services')
.factory('$dbHelper',function($cordovaSQLite,$rootScope,$q){
    var dbHelper={
            openDB:function(){
                var dbConnect=$cordovaSQLite.openDB({name:'LeLongDB.db',location: 'default'});                
			    return dbConnect;
            },
            initialDB:function(){
                var settingFields="SettingFieldId text,IsInstalled text";
                var userFields="UserId integer primary key,UserName text,Password text,access_token text,refresh_token text,LoginAttempt integer,MaxPostingAllow integer,PostingAlready integer,NumberOfPhotosAllow integer";
                var wizardFields="WizardId  integer primary key,UserId integer, DaysOfShip integer,ItemsCategory text,ShippingFee text";
                var goodsPublishPhoto="Photoid integer primary key,GoodPublishId integer,PhotoName text,PhotoUrl text,PhotoDescription text";
                var goodsPublish="GoodPublishId integer primary key,UserId integer,Title text,Subtitle text,Guid text,SalePrice real,msrp real,costprice real,SaleType text,Category integer,StoreCategory integer,Brand text,ShipWithin integer,ModelSkuCode text,State text,";
                goodsPublish += "Link text,Description text,Video text,VideoAlign text,Active integer,Weight integer,Quantity integer,ShippingPrice text,WhoPay text,ShippingMethod text,ShipToLocation text,";
                goodsPublish += "PaymentMethod text,GstType integer,OptionsStatus integer";
                createTable("Setting",settingFields);
                createTable("User",userFields);
                createTable("Wizard",wizardFields);
                createTable("GoodsPublish",goodsPublish);
                createTable("GoodsPublishPhoto",goodsPublishPhoto);  
            },
            select:function(tableName,fields,whereClause){
                var whereCondition="";                
                if(whereClause!==undefined && whereClause.trim().length>0){
                    whereCondition= "WHERE " + whereClause;
                }
                var command="SELECT " + fields + " FROM " + tableName + " " + whereCondition;

                console.log("SELECT COMMAND: " + command);

                var deferred =$q.defer();
                var qr=runQuery(command,[],function(res){
                   var result=[];
                   if(res.rows.length>0){
                       for(var i=0;i<res.rows.length;i++){
                           result.push(res.rows.item(i));
                       }
                   }
                   deferred.resolve(result);
                },function(err){
                    console.log("ERROR: " + JSON.stringify(err));
                    deferred.reject(err);
                });
                return deferred.promise;
            },        
            insert:function(table,obj){
                var tbl=extractTableFieldsAndValues(obj,false);
                var esValue=EscapeValues(tbl.fields);
                var command="INSERT INTO " + table + " (" + tbl.fields + ") " + "VALUES(" + esValue + ")";

                console.log("INSERT COMMAND: " + command);

                var deferred =$q.defer();
                var qr=runQuery(command,[tbl.values],function(res){
                     console.log("INSERT SUCCESS: " + res.insertId);
                     deferred.resolve(res);
                },function(err){
                    console.log("INSERT FAILED: " + JSON.stringify(err))
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            delete:function(table,whereClause){
                var whereCondition="";
                 if(whereClause!==undefined && whereClause.trim().length>0){
                    whereCondition = " WHERE " + whereClause
                }
                var command="DELETE FROM " + table +  whereCondition;

                console.log("DELETE COMMAND: " + command);

                var deferred =$q.defer();
                var qr=runQuery(command,[],function(res){
                    console.log("DELETE SUCCESS: " + JSON.stringify(res));
                    deferred.resolve(res);
                },function(err){
                    console.log("DELETE FAILED: " + JSON.stringify(err));
                    deferred.reject(err);
                }) ;
                return deferred.promise;
            },
            update:function(table,obj,whereClause){
                var whereCondition="";
                 if(whereClause!==undefined && whereClause.trim().length>0){
                    whereCondition = " WHERE " + whereClause;
                }
                var tbl= extractTableFieldsAndValues(obj,true);
                var command="UPDATE " + table + " SET " + tbl.fields + " " + whereCondition;

                console.log("UPDATE COMMAND: " + command);

                var deferred =$q.defer();
                var qr=runQuery(command,[tbl.values],function(res){
                     console.log("UPDATE SUCCESS: " + res.insertId)
                     deferred.resolve(res);
                },function(err){
                    console.log("UPDATE FAILED: " + JSON.stringify(err));
                    deferred.reject(err);
                });
                return deferred.promise;
            }
    };

    function extractTableFieldsAndValues(objwithFieldsAndValues,isUpdate){
        var arrFields=[];
        var arrValues=[];
        var arrKeys=['UserId','WizardId','Photoid','GoodPublishId'];
        var result;
        if(isUpdate){
            Object.keys(objwithFieldsAndValues).forEach(function(key){
                var found=false;
                for(var i=0;i<arrKeys.length;i++){
                    if(key===arrKeys[i]){         
                        found=true;              
                        break;
                    }
                }
               if(!found){
                 arrFields.push(key + "=?");  
                 arrValues.push(objwithFieldsAndValues[key]);  
              }            
            });
        }else{
            Object.keys(objwithFieldsAndValues).forEach(function(key){
               var found=false;
               for(var i=0;i<arrKeys.length;i++){
                    if(key===arrKeys[i]){
                        found=true;              
                        break;
                    }
                }
                if(!found){
                    arrFields.push(key);
                    arrValues.push(objwithFieldsAndValues[key]);
                }
            });
                
        }
       result={fields:''+ arrFields.join(',') +'',values:'' + arrValues.join(',') + ''};
        return result;
    }

    function runQuery(query,params,fnSuccess,fnError){
        $cordovaSQLite.execute($rootScope.db,query,params).then(function(res){
            fnSuccess(res);
        },function(err){
            fnError(err)
        });
    }
    function createTable(tableName,fields){
        var command="CREATE TABLE IF NOT EXISTS " + tableName +"("+ fields +")"
        runQuery(command,[],function(res){
            console.log('==============Table '+ tableName +' Created============'); 
        },function(err) {
            console.log('CREATE TABLE FAILED: ' + err);
        });
    };

    function EscapeValues (fields){
        var rpValue="";
        var countValue=0;
        if(fields.indexOf(',') < 0) 
        {
            rpValue="?"
        }
        else
        {
            countValue=fields.match(/,/g).length + 1;
        }
        if(countValue > 1){
            for(var i=0;i<countValue;i++){
                if(i==countValue-1){
                    rpValue +="?";
                }else{
                    rpValue +="?,";
                }
            }
        }
        return rpValue;
    };

    return dbHelper;
});