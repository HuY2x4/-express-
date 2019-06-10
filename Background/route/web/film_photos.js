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
var uploadFilm = multer({dest:'./static/film/'});

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

/**
 *查询相关影片的图片
 *filmId
 */
router.post("/getPhotos",(req, res) => {
    //初始化
	const filmId = req.body.filmId || '';
	
    //校验
    if(!filmId) return res.json({code:400,data:'filmId不能为空'});

    //数据库校验
    step1();
    function step1(){//查询影片是否存在
    	var sqlStr = "select * from film where id = "+filmId;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'校验影片出错'});
    		if(!result[0]) return res.json({code:400,data:'影片不存在'});
    		step2();
    	})
    }

    //数据库执行
    function step2(){//查询所有图片
    	var sqlStr = "select * from film_photos where filmId = "+filmId;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找图片出错'});
    		if(!result[0]) return res.json({code:404,data:'暂无图片'});
    		res.json({code:200,data:result});
    	})
    }
})