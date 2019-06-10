//全局Express框架
const express = require('express');
const router = express.Router();
module.exports = router;
const server = express();

//加载其他配置文件
const Common = require('../../libs/Common');
const Sql = require('../../libs/Sql');

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);


/**
 *是否为管理员 loginName
 */
router.get('/hasAdmin',(req,res)=>{
	//初始化
	const loginName = req.query.loginName;
	var userId = '';

	//校验
	if(!loginName) return res.json({coed:400,data:'不能为空'});

	//数据库执行
	step1();
	function step1(){//查找userId
		Sql.selectData('user', '*', [{ 'loginName': loginName }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]) 
	        	res.json({ code: 404, data: '用户不存在' });
	        else{
	        	userId = result[0].id;
	        	step2();
	        } 
	        	
        })
	}
	function step2(){//判断该用户是否为管理员
		Sql.selectData('admin', '*', [{ 'userId': userId }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]) 
	        	res.json({ code: 404, data: '该用户不是管理员' });
	        else 
	        	res.json({ code: 200, data: {"adminId":result[0].adminId,"userId":userId} });
        })
	}
})