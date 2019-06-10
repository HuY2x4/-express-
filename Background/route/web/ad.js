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
 *查询广告
 *id
 */
router.post("/getAd",(req, res) => {
    //初始化
	const id = req.body.id || '';
	
    //数据库执行
    step1();
    function step1(){//查询广告
    	var sqlStr = "select * from ad ";
        if(id) sqlStr += "where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找广告出错'});
    		if(!result[0]) return res.json({code:404,data:'暂无广告'});
    		res.json({code:200,data:result});
    	})
    }
})