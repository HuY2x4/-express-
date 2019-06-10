//全局Express框架
const express = require('express');
const router = express.Router();
module.exports = router;
const server = express();

//加载其他配置文件
const Common = require('../../libs/Common');

//文件接收配置
const fs = require("fs");
const pathLib = require("path");
const multer = require("multer");

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

/**
 *批量增加推荐
 *type list(filmId)
 */
 router.post("/addRecommends",(req, res) => {
    //初始化
    const type = req.body.type || '';
    var list = req.body.list || '';
    var i = 0;

    //校验
    if(!type) return res.json({code:400,data:'type不能为空'})
    if(!list) return res.json({code:400,data:'list不能为空'})

    //数据库执行
    step1();
    function step1(){//查询现有的类型
        var sqlStr = "select * from recommend where type = '"+type+"'";
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'查询现有的类型出错'});
			if(result[0]) step2();//删除            
            else step3();//添加
        })
    }
    function step2(){//删除现有的类型
        var sqlStr = "delete from recommend where type = '"+type+"'";
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'删除现有的类型出错'});
            step3();
        })
    }
    function step3(){//批量添加
    	if(i>list.length-1) return res.json({code:200,data:list});
        var sqlStr = "insert into recommend(type,filmId) values('"+
        type+"',"+list[i].filmId+")";
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'批量添加出错'});
            i++;
            step3();
        })
    }
})