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
 *添加影片 
 *name type intro detailIntro actors label country date duration count img star dou douComment 
 */
router.post("/addFilm", uploadFilm.single('img'),(req, res) => {
    //Session
    // if (!req.session.adminInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    // console.log('表单数据:',req.body);
    // console.log('图片数据:',req.file);

	const name = req.body.name || '';
	const type = req.body.type || '';
	const intro = req.body.intro || '';
	const detailIntro = req.body.detailIntro || '';
	const actors = req.body.actors || '';
	const label = req.body.label || '';
	const country = req.body.country || '';
	const date = req.body.date.trim() || '';
    const duration = req.body.duration || 0;
    const count = req.body.count || '';//集数
	const img = req.file || '';
	var imgUrl = '';
    const imgNet = req.body.imgNet || '';
	const star = req.body.star || '';
	const dou = req.body.dou || '';
	const douComment = req.body.douComment || '';
    const uploadDate = new Date().Format('yyyy-MM-dd');
    const douLink = req.body.douLink || '';
    const douLabel = req.body.douLabel || '';
    const director = req.body.director || '';
    const year = req.body.year || '';
    const adminIntro = req.body.adminIntro || '';



    //校验
    if(!name) return res.json({code:400,data:'名称不能为空'});
    if(!type) return res.json({code:400,data:'type不能为空'});
    if(!detailIntro) return res.json({code:400,data:'detailIntro不能为空'});
    if(!actors) return res.json({code:400,data:'actors不能为空'});
    if(!label) return res.json({code:400,data:'label不能为空'});
    if(!country) return res.json({code:400,data:'country不能为空'});
    if(!date) return res.json({code:400,data:'date不能为空'});
    if(!duration) return res.json({code:400,data:'duration不能为空'});
    if(!count) return res.json({code:400,data:'count不能为空'});
    if(!img&&!imgNet) return res.json({code:400,data:'img不能为空'});
    if(!star) return res.json({code:400,data:'star不能为空'});
    if(!dou) return res.json({code:400,data:'dou不能为空'});
    if(!douComment) return res.json({code:400,data:'douComment不能为空'});

    //数据库校验
    step1();
    function step1(){//校验名字是否有重复
    	var sqlStr = "select * from film where name = '"+name+"'";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'校验名字出错'});
    		if(result[0]) return res.json({code:400,data:'该影片名已存在'});
    		else step2();
    	})
    }

    //数据库执行
    function step2(){//上传文件
        if(imgNet) return step3();
    	var newName = img.path+pathLib.parse(img.originalname).ext;
    	fs.rename(img.path,newName,function(err){
    		if(err) return res.json({code:500,data:'文件上传失败'})
    		imgUrl = newName.replace(/[\\]/gm,"/");
    		step3();
    	})
    }
    function step3(){//添加影片
    	var sqlStr = "insert into film(name,type,intro,detailIntro,actors,label,country,date,img,imgNet,star,dou,douComment,duration,count,uploadDate,douLink,douLabel,director,year,adminIntro) value("+
    	"'"+name+"','"+type+"','"+intro+"','"+detailIntro+"','"+actors+"','"+label+"','"+country+"','"+date+"','"+imgUrl+"','"+imgNet+"','"+star+"','"+dou+"','"+douComment+"','"+duration+"','"+count+"','"+uploadDate+"','"+douLink+"','"+douLabel+"','"+director+"','"+year+"','"+adminIntro+"')";
        console.log(sqlStr);
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'添加影片出错'});
    		step4();
    	})
    }
    function step4(){//返回影片
    	var sqlStr = "select * from film where name = '"+name+"'";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找影片出错'});
    		res.json({code:200,data:result[0]});
    	})
    }
})


/**
 *删除影片 
 *id
 */
 router.post('/delFilm',(req,res)=>{
 	//Session
    // if (!req.session.adminInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const id = req.body.id || '';
	var imgs = [];
	var imgUrl ='';
	var i = 0;


    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});

    //数据库校验
    step1();
    function step1(){//校验是否存在该影片
    	var sqlStr = "select * from film where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找影片出错'})
    		if(!result[0]) return res.json({code:404,data:'未找到该影片'})
    		imgUrl = result[0].img;
    		step2();
    	})
    }

    //数据库执行
    function step2(){//删除所有相关的评论
    	var sqlStr = "delete from film_comments where filmId = "+id;
        console.log(sqlStr);
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'删除评论出错'})
    		step3();
    	})
    }
    function step3(){//查询所有相关的图片
    	var sqlStr = "select * from film_photos where filmId = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查询所有相关的图片出错'})
    		imgs = result;
            console.log('要删除的相关图片的数量:',imgs.length);
            if(imgs.length===0) step6();
    		else step4();
    	})
    }
    function step4(){//删除所有相关的图片路径
    	var sqlStr = "delete from film_photos where filmId = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'删除图片出错'})
    		step5();
    	})
    }
    function step5(){//删除所有相关的图片文件
    	if(i>=imgs.length) return step6();
    	fs.unlink(imgs[i].img,function(err){
    		if(err) return res.json({code:500,data:'删除图片文件失败'})
    		i++;
    		step5();
    	})
    }
    function step6(){//删除所有相关的下载链接
    	var sqlStr = "delete from film_links where filmId = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'删除图片出错'})
    		step7();
    	})
    }
    function step7(){//删除原来的电影封面
    	if(!imgUrl) return step8();//如果封面不存在
    	fs.unlink(imgUrl,function(err){
    		if(err) return res.json({code:500,data:'删除原来的电影封面失败'})
    		step8();
    	})
    }
    function step8(){//删除该影片
    	var sqlStr = "delete from film where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'删除影片出错'})
    		res.json({code:200,data:'删除成功'})
    	})
    }
 })


 /**
 *修改影片 
 *id name type intro detailIntro actors label country date img star dou douComment duration count
 */
router.post("/updFilm", uploadFilm.single('img'),(req, res) => {
    
    //Session
    // if (!req.session.adminInfo) return res.json({ code: 403, data: '身份过期' });
	const id = req.body.id || '';
	const name = req.body.name || '';
	const type = req.body.type || '';
	const intro = req.body.intro || '';
	const detailIntro = req.body.detailIntro || '';
	const actors = req.body.actors || '';
	const label = req.body.label || '';
	const country = req.body.country || '';
	const date = req.body.date || '';
    const duration = req.body.duration || 0;
    const count = req.body.count || '';
	const img = req.file || '';
	var imgUrl = '';
	var oldImgUrl = '';
    const imgNet = req.body.imgNet || '';
	const star = req.body.star || '';
	const dou = req.body.dou || '';
	const douComment = req.body.douComment || '';
    const douLink = req.body.douLink || '';
    const douLabel = req.body.douLabel || '';
    const director = req.body.director || '';
    const year = req.body.year || '';
    const adminIntro = req.body.adminIntro || '';


    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});


    //数据库校验
    step1();
    function step1(){//校验是否存在该影片
    	var sqlStr = "select * from film where id = '"+id+"'";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找影片出错'})
    		if(!result[0]) return res.json({code:404,data:'未找到该影片'})
    		oldImgUrl = result[0].img;
    		if(img) step2();
    		else step4();
    	})
    }

    //数据库执行
    function step2(){//上传文件
    	var newName = img.path+pathLib.parse(img.originalname).ext;
    	fs.rename(img.path,newName,function(err){
    		if(err) return res.json({code:500,data:'文件上传失败'})
    		imgUrl = newName.replace(/[\\]/gm,"/");
    		step3();
    	})
    }
    function step3(){//删除原来的文件
    	fs.unlink(oldImgUrl,function(err){
    		if(err) return res.json({code:500,data:'删除原文件失败'})
    		step4();
    	})
    }
    function step4(){//修改影片  注意逗号，改过
    	var sqlStr = "update film set ";
    	if(name) sqlStr += "name = '"+name+"' ,";
    	if(type) sqlStr += "type = '"+type+"' ,";
    	if(intro) sqlStr += "intro = '"+intro+"' ,";
    	if(detailIntro) sqlStr += "detailIntro = '"+detailIntro+"' ,";
    	if(actors) sqlStr += "actors = '"+actors+"' ,";
    	if(label) sqlStr += "label = '"+label+"' ,";
    	if(country) sqlStr += "country = '"+country+"' ,";
    	if(date) sqlStr += "date = '"+date+"' ,";
    	if(imgUrl) sqlStr += "img = '"+imgUrl+"' ,";
        if(imgNet) sqlStr += "imgNet = '"+imgNet+"' ,";
    	if(star) sqlStr += "star = "+star+",";
    	if(dou) sqlStr += "dou = "+dou+" ,";
        if(duration) sqlStr += "duration = '"+duration+"' ,";
        if(count) sqlStr += "count = '"+count+"' ,";
    	if(douComment) sqlStr += "douComment = '"+douComment+"' ,";
        if(douLink) sqlStr += "douLink = '"+douLink+"' ,";
        if(douLabel) sqlStr += "douLabel = '"+douLabel+"' ,";
        if(director) sqlStr += "director = '"+director+"' ,";
        if(year) sqlStr += "year = '"+year+"' ";
        if(adminIntro) sqlStr += ", adminIntro = '"+adminIntro+"'";
 		sqlStr += " where id = "+id;
        console.log(sqlStr);
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'修改影片出错'});
    		step5();
    	})
    }
    function step5(){//返回影片
    	var sqlStr = "select * from film where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找影片出错'});
    		res.json({code:200,data:result[0]});
    	})
    }
})