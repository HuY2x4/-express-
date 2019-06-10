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
var upload = multer({dest:'./static/inform/'});

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

/**
 *增加推送
 *intro img
 */
router.post("/addInform",upload.single('img'),(req, res) => {
    //初始化
	const intro = req.body.intro || ' ';
    console.log('intro:',intro);
    const title = req.body.title || ' ';
    console.log('title:',title);
    const img = req.file || '';
    console.log('img:',img);
    var imgUrl = '';
    var date = new Date().Format('yyyy-MM-dd HH:mm:ss');

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
    function step2(){//增加推送
    	var sqlStr = "insert into inform(date";
        if(img) sqlStr += ",img";
        if(intro) sqlStr += ",intro";
        if(title) sqlStr += ",title";
        sqlStr += " ) values( '"+date+"'";
        if(img) sqlStr += ",'"+imgUrl+"'";
        if(intro) sqlStr += ",'"+intro+"'";
        if(title) sqlStr += ",'"+title+"'";
        sqlStr += ")";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'增加推送出错'});
    		res.json({code:200,data:{'title':title,'intro':intro,'img':imgUrl}});
    	})
    }
})

/**
 *删除推送
 *id
 */
router.post("/delInform",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const id = req.body.id || '';
    var imgUrl = '';
    
    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});

    //数据库校验
    step1();
    function step1(){//校验推送是否存在
        var sqlStr = "select * from inform where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验推送出错'});
            if(!result[0]) return res.json({code:400,data:'推送不存在'});
            imgUrl = result[0].img;
            step2();
        })
    }

    //数据库执行
    function step2(){//删除原来的文件
        if(!imgUrl) return step3();
        fs.unlink(imgUrl,function(err){
            if(err) return res.json({code:500,data:'删除原文件失败'})
            step3();
        })
    }
    function step3(){//删除推送
        var sqlStr = "delete from inform where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'删除推送出错'});
            res.json({code:200,data:"删除成功"});
        })
    }
})

/**
 *修改推送
 *id intro img
 */
router.post("/updInform",upload.single('img'),(req, res) => {
    //初始化
    const id = req.body.id || '';
    const intro = req.body.intro || '';
    const title = req.body.title || '';
    const img = req.file || '';
    var oldImgUrl = '';
    var newImgUrl = '';

    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});
    if(!(title||intro||img)) return res.json({code:400,data:'请做出修改'});

    //数据库校验
    step1();
    function step1(){//查询推送是否存在
        var sqlStr = "select * from inform where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验推送出错'});
            if(!result[0]) return res.json({code:400,data:'推送不存在'});
            oldImgUrl = result[0].img;
            step2();
        })
    }

    //数据库执行
   function step2(){//上传图片
        if(!img) return step4();
        var newName = img.path+pathLib.parse(img.originalname).ext;
        fs.rename(img.path,newName,function(err){
            if(err) return res.json({code:500,data:'文件上传失败'})
            newImgUrl = newName.replace(/[\\]/gm,"/");
            if(oldImgUrl) step3();
            else step4();
        })
    }
    function step3(){//删除原来的文件
        fs.unlink(oldImgUrl,function(err){
            if(err) return res.json({code:500,data:'删除原文件失败'})
            step4();
        })
    }
    function step4(){//修改推送
        var sqlStr = "update inform set ";
        if(title) sqlStr += "title = '"+title+"',";
        if(intro) sqlStr += "intro = '"+intro+"',";
        if(newImgUrl) sqlStr += "img = '"+newImgUrl+"',";
        sqlStr += " where id = "+id;
        sqlStr = sqlStr.replace(/(.*),/, '$1');
        console.log(sqlStr);
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'修改推送出错'});
            res.json({code:200,data:{'id':id,'intro':intro,'newImgUrl':newImgUrl}});
        })
    }
})