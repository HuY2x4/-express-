//全局Express框架
const express = require('express');
const router = express.Router();
module.exports = router;
const server = express();

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

/**
 *查询推送
 *id
 */
router.post("/getInforms",(req, res) => {
    //初始化
	const id = req.body.id || '';
	
    //数据库执行
    step1();
    function step1(){//查询推送
    	var sqlStr = "select * from inform ";
        if(id) sqlStr += "where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找推送出错'});
    		if(!result[0]) return res.json({code:404,data:'暂无推送'});
    		res.json({code:200,data:result});
    	})
    }
})