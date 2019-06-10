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
var uploadFilm = multer({dest:'./static/filmD/'});

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

/**
 *增加单张影片的图片
 *filmId img name
 */
router.post("/addPhoto",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
	const filmId = req.body.filmId || '';
    var name = req.body.name || '';
    var img = req.body.img || '';
	
    //校验
    if(!filmId) return res.json({code:400,data:'filmId不能为空'});

    //数据库校验
    step1();
    function step1(){//校验影片是否存在
    	var sqlStr = "select * from film where id = "+filmId;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'校验影片出错'});
    		if(!result[0]) return res.json({code:400,data:'该影片不存在'});
    		else step2();
    	})
    }

    //数据库执行
    function step2(){//添加图片
    	var sqlStr = "insert into film_photos(filmId,img,name) value("+filmId+","+"'"+img+"','"+name+"')";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'添加图片出错'});
            return res.json({code:200,data:'上传成功'});
    	})
    }
})



/**
 *删除单张图片
 *id
 */
 router.post('/delPhoto',(req,res)=>{
 	//Session
    // if (!req.session.adminInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    var id = req.body.id || '';

    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});

    //数据库校验
    step1();
    function step1(){//校验是否存在该图片
    	var sqlStr = "select * from film_photos where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找图片出错'})
    		if(!result[0]) return res.json({code:404,data:'图片不存在'})
    		step2();
    	})
    }

    //数据库执行
    function step2(){//删除图片路径
    	var sqlStr = "delete from film_photos where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'删除图片出错'})
    		res.json({code:200,data:'删除图片成功'})
    	})
    	
    }
 })



/**
 *修改多张图片
 *imgsList 
 */
router.post("/updPhotos",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    var imgsList= req.body.imgsList || '';
    var i = 0;
    
    //校验
    if(!imgsList) return res.json({code:400,data:'图片不能为空'});

    //数据库校验
    step1();
    function step1(){//校验图片是否存在
        if(i>imgsList.length-1) return res.json({code:200,data:'保存成功'});
        var sqlStr = "select * from film_photos where id = "+imgsList[i].id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验图片出错'});
            if(!result[0]) return res.json({code:400,data:'该图片不存在'});
            step2();
        })
    }

    //数据库执行
    function step2(){//修改名字
        var sqlStr = "update film_photos set name = '"+imgsList[i].name+"',img ='"+imgsList[i].img+"' where id = "+imgsList[i].id;
        console.log(sqlStr);
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'修改截图出错'});
            i++;
            step1();
        })
    }
})


/**
 *增加多张影片的图片(因考虑本地内存吃不消而改用网络图片)
 *filmId imgs name
 */
// router.post("/addImgsByfilmId",uploadFilm.array('imgs',5),(req, res) => {
//     //Session
//     // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

//     //初始化
//     const filmId = req.body.filmId || '';
//     var name = req.body.name || '';
//     var nameArr = [];
//     if(name) nameArr = JSON.parse(name)
//     const imgs = req.files || '';
//     var imgUrl = [];
//     var i = 0;
    
//     //校验
//     if(!filmId) return res.json({code:400,data:'filmId不能为空'});
//     if(imgs.length === 0) return res.json({code:400,data:'图片不能为空'});

//     //数据库校验
//     step1();
//     function step1(){//校验影片是否存在
//         var sqlStr = "select * from film where id = "+filmId;
//         conn.query(sqlStr,(err,result)=>{
//             if(err) return res.json({code:500,data:'校验影片出错'});
//             if(!result[0]) return res.json({code:400,data:'该影片不存在'});
//             else step2();
//         })
//     }

//     //数据库执行
//     function step2(){//上传文件
//         if(i >= imgs.length) return res.json({code:200,data:'上传成功'});

//         var newName = imgs[i].path+pathLib.parse(imgs[i].originalname).ext;
//         fs.rename(imgs[i].path,newName,function(err){
//             if(err) return res.json({code:500,data:'文件上传失败'})
//             imgUrl[i] = newName.replace(/[\\]/gm,"/");
//             step3();
//         })
//     }
//     function step3(){//添加图片
//         var sqlStr = "insert into film_photos(filmId,img,name) value("+filmId+","+"'"+imgUrl[i]+"','"+nameArr+"')";
//         conn.query(sqlStr,(err,result)=>{
//             if(err) return res.json({code:500,data:'添加图片出错'});
//             i++;
//             step2();
//         })
//     }
// })



/**
 *删除多张图片
 *idArr
 */
//  router.post('/delImgsByfilmId',(req,res)=>{
//     //Session
//     // if (!req.session.adminInfo) return res.json({ code: 403, data: '身份过期' });

//     //初始化
//     var idArrStr = req.body.idArr || '';
//     var idArr = JSON.parse(idArrStr);
//     var i = 0;
//     var oldImgSArr = [];

//     //校验
//     if(idArr.length===0) return res.json({code:400,data:'id不能为空'});

//     //数据库校验
//     step1();
//     function step1(){//校验是否存在该图片
//         if(i>=idArr.length) {
//             i=0;
//             return step2();
//         }
//         var sqlStr = "select * from film_photos where id = "+idArr[i];
//         conn.query(sqlStr,(err,result)=>{
//             if(err) return res.json({code:500,data:'查找图片出错'})
//             if(!result[0]) return res.json({code:404,data:'图片不存在'})
//             oldImgSArr[i] = result[0].img;
//             i++;
//             step1();
//         })
//     }

//     //数据库执行
//     function step2(){//删除图片文件
//         if(i>=oldImgSArr.length) return res.json({code:200,data:'删除成功'})
//         fs.unlink(oldImgSArr[i],function(err){
//             if(err) return res.json({code:500,data:'删除图片文件失败'})
//             step3();
//         })
//     }
//     function step3(){//删除图片路径
//         var sqlStr = "delete from film_photos where id = "+idArr[i];
//         conn.query(sqlStr,(err,result)=>{
//             if(err) return res.json({code:500,data:'删除图片路径出错'})
//             i++;
//             step2();
//         })
        
//     }
//  })


// /**
//  *修改单张影片的图片
//  *id img 
//  */
// router.post("/updFilmImgs",uploadFilm.single('img'),(req, res) => {
//     //Session
//     // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

//     //初始化
//     const id = req.body.id || '';
//     const img = req.file || '';
//     var oldImgUrl = '';
//     var newImgUrl = '';
    
//     //校验
//     if(!id) return res.json({code:400,data:'id'});
//     if(!img) return res.json({code:400,data:'图片不能为空'});

//     //数据库校验
//     step1();
//     function step1(){//校验图片是否存在
//         var sqlStr = "select * from film_photos where id = "+id;
//         conn.query(sqlStr,(err,result)=>{
//             if(err) return res.json({code:500,data:'校验图片出错'});
//             if(!result[0]) return res.json({code:400,data:'该图片不存在'});
//             oldImgUrl = result[0].img;
//             step2();
//         })
//     }

//     //数据库执行
//     function step2(){//删除原图片文件
//         fs.unlink(oldImgUrl,function(err){
//             if(err) return res.json({code:500,data:'删除图片文件失败'})
//             step3();
//         })
//     }
//     function step3(){//上传文件
//         var newName = img.path+pathLib.parse(img.originalname).ext;
//         fs.rename(img.path,newName,function(err){
//             if(err) return res.json({code:500,data:'文件上传失败'})
//             newImgUrl = newName.replace(/[\\]/gm,"/");
//             step4();
//         })
//     }
//     function step4(){//添加图片
//         var sqlStr = "update film_photos set img = '"+newImgUrl+"'";
//         conn.query(sqlStr,(err,result)=>{
//             if(err) return res.json({code:500,data:'添加图片出错'});
//             res.json({code:200,data:{"img":newImgUrl}});
//         })
//     }
// })