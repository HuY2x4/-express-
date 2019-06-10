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
var upload = multer({dest:'./static/carousel/'});

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

/**
 *增加轮播图
 *img intro filmId
 */
router.post("/addCarousel",upload.single('img'),(req, res) => {
    //初始化
    const img = req.file || '';
    var imgUrl = '';
    var carousel = [];

    //校验
    if(!img) return res.json({code:400,data:'img不能为空'})

    //数据库执行
    step1();
    function step1(){//查询现有的轮播图的序号
        var sqlStr = "select * from carousel ";
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'查找图片出错'});
            carousel = result;
            step2();
        })
    }
    function step2(){//上传图片
        var newName = img.path+pathLib.parse(img.originalname).ext;
        fs.rename(img.path,newName,function(err){
            if(err) return res.json({code:500,data:'文件上传失败'})
            imgUrl = newName.replace(/[\\]/gm,"/");
            step3();
        })
    }
    function step3(){//增加轮播图
        var sqlStr = "insert into carousel(img,indexNum) values('"+
        imgUrl+"',"+carousel.length+")";
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'增加轮播图出错'});
            res.json({code:200,data:{'img':imgUrl,'indexNum':carousel.length}});
        })
    }
})

/**
 *删除轮播图
 *id
 */
router.post("/delCarousel",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const id = req.body.id || '';
    var imgUrl = '';
    
    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});

    //数据库校验
    step1();
    function step1(){//校验轮播图是否存在
        var sqlStr = "select * from carousel where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验轮播图出错'});
            if(!result[0]) return res.json({code:400,data:'轮播图不存在'});
            imgUrl = result[0].img;
            step2();
        })
    }

    //数据库执行
    function step2(){//删除原来的文件
        if(imgUrl) return step3();
        fs.unlink(imgUrl,function(err){
            if(err) return res.json({code:500,data:'删除原文件失败'})
            step3();
        })
    }
    function step3(){//删除轮播图
        var sqlStr = "delete from carousel where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'删除轮播图出错'});
            res.json({code:200,data:"删除成功"});
        })
    }
})

/**
 *修改轮播图
 *id intro img indexNum filmId
 */
router.post("/updCarousel",upload.single('img'),(req, res) => {
    //初始化
    const id = req.body.id || '';
    const indexNum = req.body.indexNum || '';
    const intro = req.body.intro || '';
    const filmId = req.body.filmId || '';
    const img = req.file || '';
    var oldImgUrl = '';
    var newImgUrl = '';

    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});
    if(!(intro||img||filmId||indexNum)) return res.json({code:400,data:'请做出修改'});

    //数据库校验
    step1();
    function step1(){//查询轮播图是否存在
        var sqlStr = "select * from carousel where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验轮播图出错'});
            if(!result[0]) return res.json({code:400,data:'轮播图不存在'});
            oldImgUrl = result[0].img;
            if(img) step2();
            else step4();
        })
    }

    //数据库执行
   function step2(){//上传图片
        var newName = img.path+pathLib.parse(img.originalname).ext;
        fs.rename(img.path,newName,function(err){
            if(err) return res.json({code:500,data:'文件上传失败'})
            newImgUrl = newName.replace(/[\\]/gm,"/");
            step3();
        })
    }
    function step3(){//删除原来的文件
        fs.unlink(oldImgUrl,function(err){
            if(err) return res.json({code:500,data:'删除原文件失败'})
            step4();
        })
    }
    function step4(){//修改轮播图
        var sqlStr = "update carousel set ";
        if(filmId) sqlStr += "filmId = "+filmId+",";
        if(indexNum) sqlStr += "indexNum = "+indexNum+",";
        if(intro) sqlStr += "intro = '"+intro+"',";
        if(newImgUrl) sqlStr += "img = '"+newImgUrl+"',";
        sqlStr += " where id = "+id;
        sqlStr = sqlStr.replace(/(.*),/, '$1');
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'修改轮播图出错'});
            res.json({code:200,data:{'id':id,'intro':intro,'img':newImgUrl,'filmId':filmId,'indexNum':indexNum}});
        })
    }
})

/**
 *修改多张轮播图
 *list 
 */
router.post("/updCarousels",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    var list= req.body.list || '';
    var i = 0;
    
    //校验
    if(!list) return res.json({code:400,data:'不能为空的时候保存'});

    //数据库校验
    step1();
    function step1(){//校验图片是否存在
        if(i>list.length-1) return res.json({code:200,data:'保存成功'});
        var sqlStr = "select * from carousel where id = "+list[i].id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验图片出错'});
            if(!result[0]) return res.json({code:400,data:'该图片不存在'});
            step2();
        })
    }

    //数据库执行
    function step2(){//修改信息
        var sqlStr = "update carousel set filmId = "+list[i].filmId+",intro = '"+list[i].intro+"',indexNum = "+list[i].indexNum +" where id = "+list[i].id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'修改信息'});
            i++;
            step1();
        })
    }
})