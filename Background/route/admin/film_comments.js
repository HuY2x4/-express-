//全局Express框架
const express = require('express');
const router = express.Router();
module.exports = router;
const server = express();

//加载其他配置文件
const Common = require('../../libs/Common');

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);

/**
 *删除任意评论 
 *id
 */
router.post("/delComment", (req, res) => {
    // Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    // 初始化
    const id = req.body.id || '';

    //校验
    if (!id) return res.json({ code: 400, data: 'id不能为空' });

    //数据库校验
    step1();

    function step1() {
        var sqlStr = "select * from film_comments where id = " + id;
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ code: 500, data: '查找评论出错' })
            if (!result[0]) return res.json({ code: 404, data: '未找到该评论' })
            step2();
        })
    }

    function step2() {
        var sqlStr = "delete from film_comments where id = " + id;
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ code: 500, data: '删除评论出错' });
            res.json({ code: 200, data: '删除成功' });
        })
    }
})


/**
 *修改评论
 *id comment date
 */
router.post("/updComment",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
	const id = req.body.id || '';
	const comment = req.body.comment || '';
    const date = req.body.date || '';

    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});
    if(!comment) return res.json({code:400,data:'comment不能为空'});

    //数据库校验
    step1();
    function step1(){//校验评论是否存在
    	var sqlStr = "select * from film_comments where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'校验评论出错'});
    		if(!result[0]) return res.json({code:400,data:'该评论不存在'});
    		else step2();
    	})
    }

    //数据库执行
    function step2(){//修改评论
    	var sqlStr = "update film_comments set comment = '"+comment+"','"+date+"' where id = "+id;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'修改评论出错'});
    		res.json({code:200,data:{'comment':comment,"id":id,'date':date}});
    	})
    }
})

/**
 *修改相关影片的评论 批量修改
 * filmId list(userId comment date)
 */
router.post("/updComments",(req, res) => {//链接可以有转义问题
    
    //初始化
    var list = req.body.list || '';
    var objArr = JSON.parse(list);
    const filmId = req.body.filmId || '';
    var j=0;

    //校验
    if(!filmId) return  res.json({code:400,data:'filmId不能为空'});
    for(let i = 0;i<objArr.length;i++){
        if(!objArr[i].userId||!objArr[i].comment) return res.json({code:400,data:'不能存在空数据'});
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
    function step2(){//删除影片的评论
        var sqlStr = "delete from film_comments where filmId = "+filmId;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'删除评论出错'});
            step3();
        })
    }

    function step3(){//增加相关影片的评论
        if(j>objArr.length-1) return res.json({code:200,data:'修改成功'});
        var sqlStr = "insert into film_comments(filmId,userId,comment,date) values("+filmId+","+objArr[j].userId+",'"+objArr[j].comment+"','"+objArr[j].date+"')";
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'增加评论出错'});
            j++;
            step3();
        })
    }

    // function step3(){//修改相关影片的下载链接
    //     var sqlStr = "update film_link set ";
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

