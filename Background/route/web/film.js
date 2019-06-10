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
 *查询所有影片 按分类：类型,地区,标签,星级,豆瓣分  (分页)
 *type country label star dou index pageSize
 */
router.post('/getFilms', (req, res) => {
    //初始化
    const type = req.body.type || '';
    const country = req.body.country || '';
    var label = req.body.label || '';
    const star = req.body.star || '';
    const dou = req.body.dou || '';
    const pageSize = req.body.pageSize || '';
    const index = req.body.index || '';

    //数据处理
    label = label.replace(/\s*/g, ""); //删除多余的空格

    //数据库执行
    var sqlStr = "select * from film ";
    if (type || country || label || star || dou) sqlStr += " where ";
    if (type) sqlStr += " type = '" + type + "' and ";
    if (country) sqlStr += " country = '" + country + "' and ";

    if (label) {
        var labelArr = label.split(',');
        for (var i in labelArr) {
            sqlStr += " label like '%" + labelArr[i] + "%' and ";
        }
    }
    if (star) sqlStr += " star = '" + star + "' and ";
    if (dou) sqlStr += " dou > " + dou + " and ";
    sqlStr = sqlStr.replace(/(.*)and/, '$1 ');
    console.log('sqlStr:', sqlStr);

    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ code: 500, data: '查询出错' })
        if (!result[0]) return res.json({ code: 404, data: '啥都没有' })
        result.sort(function(a, b) {
            return b.id - a.id;
        })
        //分页处理
        if (index && pageSize) {
        	var s_result = [];
            var j = 0;
            for (var i = (index - 1) * pageSize; i < index * pageSize; i++) {
                if (i > result.length - 1) break;
                s_result[j] = result[i];
                j++;
            }
            var maxPage = Math.ceil(result.length / pageSize);
            return res.json({ code: 200, data:{'filmsInfo':s_result,'maxPage':maxPage,'count':result.length}});
        }
        return res.json({ code: 200, data: result });
    })
})


/**
 *查询影片 按名字//要改
 *name
 */
router.get('/getFilmByName', (req, res) => {
    //初始化
    const name = req.query.name || ''
    console.log('name:',name);
    //数据库执行
    var sqlStr = "select * from film ";
    if (name) {
        sqlStr += "where name like " + " '%" + name + "%' ";
    }
    console.log(sqlStr);
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ code: 500, data: "查询出错" });
        if (!result[0]) return res.json({ code: 404, data: "未找到影片" });
        result.sort(function(a, b) {
            return b.id - a.id;
        })
        res.json({ code: 200, data: result });
    })
})

/**
 *查询影片 按ID
 *id
 */
router.post('/getFilm', (req, res) => {
    //初始化
    const id = req.body.id || 0

    //校验
    if(!id) return res.json({code: 400, data: 'id不能为空'})
    	
    //数据库执行
    var sqlStr = "select * from film where id = "+id;
    conn.query(sqlStr, (err, result) => {
        if (err) return res.json({ code: 500, data: "查询出错" });
        if (!result[0]) return res.json({ code: 404, data: "未找到影片" });
        
        res.json({ code: 200, data: result[0] });
    })
})