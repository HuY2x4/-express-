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
 *添加评论 
 *comment filmId
 */
router.post("/addComment", (req, res) => {
    // Session
    if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const userId = req.session.userInfo.id;
    const comment = req.body.comment || '';
    const filmId = req.body.filmId || '';
    const date = new Date().Format('yyyy-MM-dd HH:mm:ss');

    //校验
    if (!comment) return res.json({ code: 400, data: '评论不能为空' });
    if (!filmId) return res.json({ code: 400, data: '影片ID不能为空' });

    //数据库校验
    step1();

    function step1() { //校验是否存在该影片
        var sqlStr = "select * from film where id = '" + filmId + "'";
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ code: 500, data: '查找影片出错' })
            if (!result[0]) return res.json({ code: 404, data: '未找到该影片' })
            step2();
        })
    }

    //数据库执行
    function step2() { //添加评论
        var sqlStr = "insert into film_comments(filmId,userId,comment,date) values('" +
            filmId + "','" + userId + "','" + comment + "','"+date+"')";
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ code: 500, data: '添加评论出错' })
            res.json({ code: 200, data: { "userId": userId, "filmId": filmId, "comment": comment ,"date":date} });
        })
    }
})


/**
 *删除自己的评论 
 *id
 */
router.post("/delCommentByself", (req, res) => {
    // Session
    if (!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

    // 初始化
    const userId = req.session.userInfo.id;
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
            if (result[0].userId !== userId) return res.json({ code: 400, data: '你不是评论的主人' })
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
 *查询相关影片的评论
 *filmId
 */
router.post("/getCommont", (req, res) => {
    //初始化
    const filmId = req.body.filmId || '';

    //校验
    if (!filmId) return res.json({ code: 400, data: 'filmId不能为空' });

    //数据库校验
    step1();
    function step1() { //校验影片是否存在
        var sqlStr = "select * from film where id = '" + filmId + "'";
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ code: 500, data: '校验影片出错' });
            if (!result[0]) return res.json({ code: 400, data: '影片不存在' });
            else step2();
        })
    }

    //数据库执行
    function step2() { //查询评论
        var sqlStr = "select film_commentss.id,filmId,userId,comment,date,nickname from film_comments,'user' where user.id = film_comments.userId and film_comments.filmId = '" + filmId + "'";
        conn.query(sqlStr, (err, result) => {
            if (err) return res.json({ code: 500, data: '查找评论出错' });
            res.json({ code: 200, data: result });
        })
    }
})