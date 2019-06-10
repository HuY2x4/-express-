const config = require('../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

const EXIST = 1;
const NOTEXIST = 0;
const ERROR = -1;
const ARGERROR = -2;



module.exports = {
	EXIST,//存在
	NOTEXIST,//不存在
	ERROR,//数据库操作出错
	ARGERROR,//传入的参数出错
	
	//插入数据
	insertData:function(table,nameArr,valueArr,callback){
		if(!table||!nameArr||!valueArr) return ARGERROR;
		var sqlStr = "insert into "+table+"(";
		nameArr.forEach(function(value,i){
			sqlStr += value;
			if(i!=nameArr.length-1){
				sqlStr +=",";
			}
			else{
				sqlStr +=") values(";
			}
		})
		valueArr.forEach(function(value,i){
			sqlStr += "'"+value+"'";
			if(i!=nameArr.length-1){
				sqlStr +=",";
			}
			else{
				sqlStr +=")";
			}
		})
		console.log('---InsertData:'+sqlStr);
		conn.query(sqlStr,(err,result)=>{
			callback(err,result);
		})
	},
	//删除数据
	deleteData:function(table,objArr,callback){
		if(!table) return ARGERROE;
		var sqlStr = "delete from "+table+" where ";
		objArr.forEach(function(obj,i){
			sqlStr += Object.keys(obj)[0]+" = '"+obj[Object.keys(obj)[0]]+"'";
			if(i!=objArr.length-1){
				sqlStr +=' and ';
			}
		})
		console.log('---DeleteData:'+sqlStr);
		conn.query(sqlStr,(err,result)=>{
			callback(err,result);
		})
	},
	//修改数据
	updateData:function(table,objArr1,objArr2,callback){
		if(!table||!objArr1) return ARGERROR;
		var sqlStr = "update "+table+" set ";
		objArr1.forEach(function(obj,i){
			sqlStr += Object.keys(obj)[0]+" = '"+obj[Object.keys(obj)[0]]+"'";
			if(i!=objArr1.length-1){
				sqlStr +=' , ';
			}
		})
		if(objArr2){
			sqlStr +=' where ';
			objArr2.forEach(function(obj,i){
				sqlStr += Object.keys(obj)[0]+" = '"+obj[Object.keys(obj)[0]]+"'";
				if(i!=objArr2.length-1){
					sqlStr +=' and ';
				}
			})
		}
		console.log('---updData:'+sqlStr);
		conn.query(sqlStr,(err,result)=>{
			callback(err,result);
		})
	},
	//查找数据
	selectData:function(table,Arr,objArr,callback){
		if(!table) return ARGERROR;
		var sqlStr = "select ";
		if(Arr==='*'){
			sqlStr += " * "
		}
		else{
			Arr.forEach(function(value,i){
				sqlStr += "'"+value+"'";
				if(i!=Arr.length-1){
					sqlStr += ",";
				}
			})
		}
		sqlStr +=" from "+table;
		if(objArr){
			sqlStr += " where ";
			objArr.forEach(function(obj,i){
				sqlStr += Object.keys(obj)[0]+" = '"+obj[Object.keys(obj)[0]]+"'";
				if(i!=objArr.length-1){
					sqlStr +=' and ';
				}
			})
		}
		console.log('---selectData:'+sqlStr);
		conn.query(sqlStr,(err,result)=>{
			callback(err,result);
		})
	},
	//是否存在某个值 return  
	HasExist:function(table,name,value,callback){
		if(!table||!name||!value) return ARGERROR;
		const sqlStr = "select * from "+table+" where "+name+" = '"+value+"'";
		conn.query(sqlStr,(err,result)=>{
			if(err) return ERROR;
			if(result[0]) return EXIST;
			else return NOTEXIST;
		})
	},
	// //快速查找数据 retrun
	// returnData:function(table,objArr){
	// 	if(!table) return ARGERROR;
	// 	var sqlStr = "select * from "+table+" where ";
	// 	objArr.forEach(function(obj,i){
	// 		sqlStr += Object.keys(obj)[0]+" = '"+obj[Object.keys(obj)[0]]+"'";
	// 		if(i!=objArr.length-1){
	// 			sqlStr +=' and ';
	// 		}
	// 	})
	// 	conn.query(sqlStr,(err,result)=>{
	// 		if(err) return ERROR;

	// 		else {
	// 			var data = result;
	// 			console.log('conn:'+result);
	// 			return data;
	// 		}
	// 	})

	// }
}