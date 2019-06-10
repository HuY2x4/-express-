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
 *查找推荐的影视们
 *type
 */
 router.post("/getRecommends",(req, res) => {
    //初始化
    const type = req.body.type || '';
    var list = [];
    var i = 0;
    var data = [];
    //数据库执行
    step1();
    function step1(){//查找推荐的影视们
        var sqlStr = "select film.name,film.img,film.imgNet,film.dou,film.uploadDate,recommend.filmId,recommend.type,recommend.index from recommend,film where recommend.filmId = film.id";
        if(type) sqlStr += " and recommend.type = '"+type+"'";
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'查找推荐的影视们出错'});
            res.json({code:200,data:result});
        })
    }
})

