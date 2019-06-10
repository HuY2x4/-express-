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
 *增加相关影片的下载链接
 *filmId type link pwd name
 */
router.post("/addLink",(req, res) => {//链接可以有转义问题
    //初始化
	const filmId = req.body.filmId || '';
    const name = req.body.name || '';
    const type = req.body.type || '';
    const link = req.body.link || '';
    const pwd = req.body.pwd || '';

    //校验
    if(!name) return res.json({code:400,data:'不能为空'});
    if(!filmId) return res.json({code:400,data:'不能为空'});
    if(!link) return res.json({code:400,data:'不能为空'});

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
    function step2(){//增加相关影片的下载链接
    	var sqlStr = "insert into film_links(filmId,type,link,pwd,name) values("+filmId+",'"+type+"','"+link+"','"+pwd+"','"+name+"')";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'增加下载链接出错'});
    		res.json({code:200,data:{'filmId':filmId,'type':type,"link":link,"pwd":pwd,"name":name}});
    	})
    }
})

/**
 *删除相关影片的下载链接
 *id
 */
router.post("/delLink",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const id = req.body.id || '';
    
    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});

    //数据库校验
    step1();
    function step1(){//校验下载链接是否存在
        var sqlStr = "select * from film_links where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验下载链接出错'});
            if(!result[0]) return res.json({code:400,data:'下载链接不存在'});
            else step2();
        })
    }

    //数据库执行
    function step2(){//删除相关影片的下载链接
        var sqlStr = "delete from film_links where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'删除下载链接出错'});
            res.json({code:200,data:"删除成功"});
        })
    }
})

/**
 *修改相关影片的下载链接 批量修改
 * filmId list(type link pwd name)
 */
router.post("/updLinks",(req, res) => {//链接可以有转义问题
    
    //初始化
    var list = req.body.list || '';
    var objArr = JSON.parse(list);
    const filmId = req.body.filmId || '';
    var j=0;

    //校验
    if(!filmId) return  res.json({code:400,data:'filmId不能为空'});
    for(let i = 0;i<objArr.length;i++){
        console.log(objArr[i].type);
        if(!objArr[i].type||!objArr[i].link||!objArr[i].name) return res.json({code:400,data:'不能存在空数据'});
    }

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
    function step2(){//删除影片的链接
        var sqlStr = "delete from film_links where filmId = "+filmId;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'删除影片出错'});
            step3();
        })
    }

    function step3(){//增加相关影片的下载链接
        if(j>objArr.length-1) return res.json({code:200,data:'修改成功'});
        var sqlStr = "insert into film_links(filmId,type,link,pwd,name) values("+filmId+",'"+objArr[j].type+"','"+objArr[j].link+"','"+objArr[j].pwd+"','"+objArr[j].name+"')";
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'增加下载链接出错'});
            j++;
            step3();
        })
    }

    // function step3(){//修改相关影片的下载链接
    //     var sqlStr = "update film_links set ";
    //     if(filmId) sqlStr += "filmId = "+filmId+",";
    //     if(type) sqlStr += "type = '"+type+"',";
    //     if(link) sqlStr += "link = '"+link+"',";
    //     if(pwd) sqlStr += "pwd = '"+pwd+"',";
    //     if(name) sqlStr += "name = '"+name+"',";
    //     sqlStr += "where id = "+id;
    //     sqlStr = sqlStr.replace(/(.*),/, '$1');
    //     conn.query(sqlStr,(err,result)=>{
    //         if(err) return res.json({code:500,data:'修改下载链接出错'});
    //         res.json({code:200,data:{'id':id,'filmId':filmId,'type':type,"link":link,"pwd":pwd,"name":name}});//返回的是修改过的
    //     })
    // }
})




