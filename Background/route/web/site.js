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
 *查询所有站点
 *id
 */
router.post("/getSites",(req, res) => {
    //初始化
	const id = req.body.id || '';
	
    //数据库执行
    step1();
    function step1(){//查询站点
    	var sqlStr = "select * from site";
        if(id) sqlStr += " where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找站点出错'});
    		if(!result[0]) return res.json({code:404,data:'暂无站点'});
    		res.json({code:200,data:result});
    	})
    }
})