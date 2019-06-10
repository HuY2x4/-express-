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
var upload = multer({dest:'./static/ad/'});

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

/**
 *增加广告
 *intro img position
 */
router.post("/addAd",upload.single('img'),(req, res) => {
    //初始化
	const intro = req.body.intro || '';
    const position = req.body.position || '';
    const img = req.file || '';
    var imgUrl = '';

    //校验
    if(!position) return res.json({code:400,data:'位置不能为空'})

    //数据库执行
    step1();
    function step1(){//上传图片
        if(!img) return step2();
        var newName = img.path+pathLib.parse(img.originalname).ext;
        fs.rename(img.path,newName,function(err){
            if(err) return res.json({code:500,data:'文件上传失败'})
            imgUrl = newName.replace(/[\\]/gm,"/");
            step2();
        })
    }
    function step2(){//增加广告
    	var sqlStr = "insert into ad(position";
        if(img) sqlStr += ",img";
        if(intro) sqlStr += ",intro";
        sqlStr += " ) values( '"+position+"'";
        if(img) sqlStr += ",'"+imgUrl+"'";
        if(intro) sqlStr += ",'"+intro+"'";
        sqlStr += ")";

    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'增加广告出错'});
    		res.json({code:200,data:{'intro':intro,'img':imgUrl,'position':position}});
    	})
    }
})

/**
 *删除广告
 *id
 */
router.post("/delAd",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const id = req.body.id || '';
    var imgUrl = '';
    
    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});

    //数据库校验
    step1();
    function step1(){//校验广告是否存在
        var sqlStr = "select * from ad where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验广告出错'});
            if(!result[0]) return res.json({code:400,data:'广告不存在'});
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
    function step3(){//删除广告
        var sqlStr = "delete from ad where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'删除广告出错'});
            res.json({code:200,data:"删除成功"});
        })
    }
})

/**
 *修改广告
 *id intro img position
 */
router.post("/updAd",upload.single('img'),(req, res) => {
    //初始化
    const id = req.body.id || '';
    const position = req.body.position || '';
    const intro = req.body.intro || '';
    const img = req.file || '';
    var oldImgUrl = '';
    var newImgUrl = '';

    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});
    if(!(intro||img||position)) return res.json({code:400,data:'请做出修改'});

    //数据库校验
    step1();
    function step1(){//查询广告是否存在
        var sqlStr = "select * from ad where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验广告出错'});
            if(!result[0]) return res.json({code:400,data:'广告不存在'});
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
    function step4(){//修改广告
        var sqlStr = "update ad set ";
        if(position) sqlStr += "position = '"+position+"',";
        if(intro) sqlStr += "intro = '"+intro+"',";
        if(newImgUrl) sqlStr += "img = '"+newImgUrl+"',";
        sqlStr += " where id = "+id;
        sqlStr = sqlStr.replace(/(.*),/, '$1');
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'修改广告出错'});
            res.json({code:200,data:{'id':id,'intro':intro,'img':newImgUrl,'position':position}});
        })
    }
})