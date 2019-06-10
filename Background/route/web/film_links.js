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
 *查询相关影片的下载链接
 *filmId
 */
router.post("/getLinks",(req, res) => {
    //初始化
	const filmId = req.body.filmId || '';
	
    //校验
    if(!filmId) return res.json({code:400,data:'不能为空'});

    //数据库校验
    step1();
    function step1(){//查询影片是否存在
    	var sqlStr = "select * from film where id = "+filmId;
        console.log('link:',sqlStr);
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'校验影片出错'});
    		if(!result[0]) return res.json({code:400,data:'影片不存在'});
    		step2();
    	})
    }

    //数据库执行
    function step2(){//查询相关影片的下载链接
    	var sqlStr = "select * from film_links where filmId = "+filmId;
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'查找下载链接出错'});
    		if(!result[0]) return res.json({code:404,data:'暂无下载链接'});
            let data = [];
            let types = [];
            for(let i = 0;i<result.length;i++){
                if(types.indexOf(result[i].type)===-1){
                    types.push(result[i].type);
                    for(let j = 0;j<result.length;j++){
                        if(result[i].type===result[j].type){
                            data.push(result[j]);
                        }
                    }
                }
            }
    		res.json({code:200,data:data});
    	})
    }
})