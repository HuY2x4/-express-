const express = require('express');
const app = express();
app.listen(8090, () => {
    console.log('listen 8090');
})

//初始化
const init = require('./libs/Init');
init.initFunction();

//配置静态文件
const path = require('path')

//配置post
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//配置session
const session = require('express-session');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// var session_arr=[];
// for(var i=0;i<100000;i++){
// 	session_arr.push('sig_'+Math.random());
// }
app.use(session({
    // name:'sess',
    secret: '12345',
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    resave: false,
    saveUninitialized: true
}))

//设置跨域访问
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true); // 可以带cookies
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
// app.all('*',function(req,res,next){
// 	res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By", ' 3.2.1')
//     // res.header("Content-Type", "application/json;charset=utf-8");//会导致访问不到静态文件
//     next();
// });

//配置前端访问的api

app.use('/api/common/ad', require("./route/web/ad"));
app.use('/api/common/admin', require("./route/web/admin"));
app.use('/api/common/film', require("./route/web/film"));
app.use('/api/common/film_comments', require("./route/web/film_comments"));
app.use('/api/common/film_photos', require("./route/web/film_photos"));
app.use('/api/common/film_links', require("./route/web/film_links"));
app.use('/api/common/inform', require("./route/web/inform"));
app.use('/api/common/site', require("./route/web/site"));
app.use('/api/common/carousel', require("./route/web/carousel"));
app.use('/api/common/user', require("./route/web/user"));
app.use('/api/common/recommend', require("./route/web/recommend"));

app.use('/api/admin/ad', require("./route/admin/ad"));
app.use('/api/admin/film', require("./route/admin/film"));
app.use('/api/admin/film_comments', require("./route/admin/film_comments"));
app.use('/api/admin/film_photos', require("./route/admin/film_photos"));
app.use('/api/admin/film_links', require("./route/admin/film_links"));
app.use('/api/admin/inform', require("./route/admin/inform"));
app.use('/api/admin/site', require("./route/admin/site"));
app.use('/api/admin/carousel', require("./route/admin/carousel"));
app.use('/api/admin/user', require("./route/admin/user"));
app.use('/api/admin/recommend', require("./route/admin/recommend"));

app.use('/', require("./route/web/index"));

app.use(express.static(__dirname));