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
 *增加站点
 *name link intro
 */
router.post("/addSite",(req, res) => {//链接可以有转义问题
    //初始化
	const name = req.body.name || '';
    const link = req.body.link || '';
    const intro = req.body.intro || '';

    //校验
    if(!name) return res.json({code:400,data:'name不能为空'});
    if(!link) return res.json({code:400,data:'link不能为空'});

    //数据库校验
    step1();
    function step1(){//查询站点是否存在
    	var sqlStr = "select * from site where name = '"+name+"'";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'校验站点出错'});
    		if(result[0]) return res.json({code:400,data:'站点已存在'});
    		step2();
    	})
    }

    //数据库执行
    function step2(){//增加站点
    	var sqlStr = "insert into site(name,link,intro) values('"+name+"','"+link+"','"+intro+"')";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'增加站点出错'});
    		res.json({code:200,data:{'name':name,'link':link,"intro":intro}});
    	})
    }
})

/**
 *删除站点
 *id
 */
router.post("/delSite",(req, res) => {
    //Session
    // if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const id = req.body.id || '';
    
    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});

    //数据库校验
    step1();
    function step1(){//校验站点是否存在
        var sqlStr = "select * from site where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验站点出错'});
            if(!result[0]) return res.json({code:400,data:'站点不存在'});
            else step2();
        })
    }

    //数据库执行
    function step2(){//删除站点
        var sqlStr = "delete from site where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'删除站点出错'});
            res.json({code:200,data:"删除成功"});
        })
    }
})

/**
 *修改站点
 *id name link intro
 */
router.post("/updSite",(req, res) => {//链接可以有转义问题
    //初始化
    const id = req.body.id || '';
    const name = req.body.name || '';
    const link = req.body.link || '';
    const intro = req.body.intro || '';

    //校验
    if(!id) return res.json({code:400,data:'id不能为空'});
    if(!(name||link||intro)) return res.json({code:400,data:'请做出修改'});

    //数据库校验
    step1();
    function step1(){//查询站点是否存在
        var sqlStr = "select * from site where id = "+id;
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'校验站点出错'});
            if(!result[0]) return res.json({code:400,data:'站点不存在'});
            step2();
        })
    }

    //数据库执行
    function step2(){//修改站点
        var sqlStr = "update site set ";
        if(name) sqlStr += "name = '"+name+"',";
        if(link) sqlStr += "link = '"+link+"',";
        if(intro) sqlStr += "intro = '"+intro+"',";
        sqlStr += " where id = "+id;
        sqlStr = sqlStr.replace(/(.*),/, '$1');
        conn.query(sqlStr,(err,result)=>{
            if(err) return res.json({code:500,data:'修改站点出错'});
            res.json({code:200,data:{'id':id,'name':name,"link":link,"intro":intro}});
        })
    }
})