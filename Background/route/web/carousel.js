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
 *查询轮播图的所有图片
 *
 */
router.post("/getCarousels",(req, res) => {
    //数据库执行
    step1();
    function step1(){//查询轮播图的所有图片
    	var sqlStr = "select * from carousel ";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找图片出错'});
    		if(!result[0]) return res.json({code:404,data:'暂无图片'});
    		res.json({code:200,data:result});
    	})
    }
})