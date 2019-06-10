//全局Express框架
const express = require('express');
const router = express.Router();
module.exports = router;
const server = express();

//加载其他配置文件
const Common = require('../../libs/Common');
const CheckData = require('../../libs/CheckData');
const Sql = require('../../libs/Sql');

//文件接收配置
const fs = require("fs");
const pathLib = require("path");
const multer = require("multer");
var uploadAvatar = multer({dest:'./static/avatar/'});

//加载配置文件
const config = require('../../config/mysql');
const mysql = require('mysql');
const conn = mysql.createConnection(config);


/**
 *注册 loginName password nickname phone  
 */
router.post('/register', (req, res) => {
    //初始化
    const loginName = req.body.loginName || '';
    var password = req.body.password || '';
    // password = Common.md5(password);
    const nickname = req.body.nickname || loginName;
    const phone = req.body.phone || '';
    const avatar = 'static/avatar/indexAvatar.jpg';
    const regDate = new Date().Format('yyyy-MM-dd HH:mm:ss');
    //校验
    if (!loginName || !password || !phone) return res.json({ code: 400, data: '不能为空' });
    if (!CheckData.checkLoginName(loginName)) return res.json({ code: 400, data: '登录名不合法' });
    if (!CheckData.checkPwd(password)) return res.json({ code: 400, data: '密码不合法' });
    if (!CheckData.checkNickName(nickname)) return res.json({ code: 400, data: '昵称不合法' });
    if (!CheckData.checkPhone(phone)) return res.json({ code: 400, data: '手机号不合法' });

    //数据库校验
   step1();
	function step1(){//校验登录名是否存在
		Sql.selectData('user', '*', [{ 'loginName': loginName }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]) 
	        	step2();
	        else 
	        	res.json({ code: 417, data: '登录名已存在' });
        })
	}
	function step2(){//校验昵称是否存在
		Sql.selectData('user', '*', [{ 'nickname': nickname }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]) 
	        	step3();
	        else 
	        	res.json({ code: 417, data: '昵称已存在' });
        })
	}
	function step3(){//校验手机号是否存在
		Sql.selectData('user', '*', [{ 'phone': phone }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]) 
	        	step4();
	        else 
	        	res.json({ code: 417, data: '手机号已存在' });
        })
	}

    //数据库执行
    function step4(){
	    Sql.insertData(
	        'user',
	        ['loginName', 'password', 'nickname', 'regDate', 'avatar', 'phone'],
	        [loginName, password, nickname, regDate, avatar, phone],
	        function(err, result) {
	            if (err)  
	            	res.json({ code: 500, data: '添加失败' }) 
	            else 
	                res.json({ code: 200, data: { "loginName": loginName, "password": password } })
	        })
    }
});




/**
 *修改用户信息 nickname phone email
 */
router.get('/updUser',(req,res)=>{
	//Session
	if(!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

	//初始化
	const loginName = req.session.userInfo.loginName || '';
	const nickname = req.query.nickname || '';
	const phone = req.query.phone || '';
	const email = req.query.email || '';

	//校验
	if (!CheckData.checkNickName(nickname)) return res.json({ code: 400, data: '昵称不合法' });
    if (!CheckData.checkPhone(phone)) return res.json({ code: 400, data: '手机号不合法' });
	if (email!=''&&!CheckData.checkEmail(email)) return res.json({ code: 400, data: '邮箱不合法' });

	//数据库校验
	step1();
	function step1(){//校验昵称是否存在
		Sql.selectData('user', '*', [{ 'nickname': nickname }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]||result[0].loginName===loginName) 
	        	step2();
	        else 
	        	res.json({ code: 417, data: '昵称已存在' });
        })
	}
	function step2(){//校验手机号是否存在
		Sql.selectData('user', '*', [{ 'phone': phone }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]||result[0].loginName===loginName) 
	        	step3();
	        else 
	        	res.json({ code: 417, data: '手机号已存在' });
        })
	}

    //数据库执行
    function step3(){
	    Sql.updateData(
	    	'user',
	    	[{'nickname':nickname},{'phone':phone},{'email':email}],
	    	[{'loginName':loginName}],
	    	function(err,result){
	    		if(err) 
	            	res.json({ code: 500, data: '添加失败' }) 
	            else
	                res.json({ code: 200, data: { "loginName": loginName, 'nickname':nickname,'phone':phone,'email':email } })
	    	})
    }
})



/**
 *修改密码 loginName oldPwd newPwd
 */
router.post('/updUserPsd',(req,res)=>{
	//Session
	if(!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

	//初始化
	const loginName = req.session.userInfo.loginName || '';
	var oldPwd = req.body.oldPwd || '';
	var newPwd = req.body.newPwd || '';

	//校验
	if (!CheckData.checkPwd(newPwd)) return res.json({ code: 400, data: '新密码不合法' });

	//数据加密
    // oldPwd = Common.md5(oldPwd);
    // newPwd = Common.md5(newPwd);

	//数据库校验
	step1();
	function step1(){//校验输入的旧密码是否正确
		Sql.selectData('user','*',[{"loginName":loginName}],function(err,result){
			if(err) 
				res.json({ code: 500, data: '查询旧密码失败' });
			if (result[0].password!==oldPwd) 
				return res.json({ code: 400, data: '旧密码错误' });
			else 
				step2();
		})
	}
	
    //数据库执行
    function step2(){//修改密码
		Sql.updateData(
	    	'user',
	    	[{'password':newPwd}],
	    	[{'loginName':loginName}],
	    	function(err,result){
	    		if(err) 
	            	res.json({ code: 500, data: '修改失败' }) 
	            else
	                res.json({ code: 200, data: { "loginName": loginName, 'password':newPwd} })
	    	})
    }
    
})

/**
 *修改头像 avatar
 */
router.post('/updUserAvatar',uploadAvatar.single('avatar'),(req,res)=>{
	//Session
	if(!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

	//初始化
	const loginName = req.session.userInfo.loginName || '';
	var avatar = req.file || '';
	var avatarUrl = 'static/indexAvatar.jpg';
	var oldImg = '';

    //数据库执行
    step1();
    function step1(){//获取原头像
    	var sqlStr = "select * from user where loginName = '"+loginName+"'";
    	conn.query(sqlStr,(err,result)=>{
    		if(err) return res.json({code:500,data:'获取原头像失败'})
    		oldImg = result[0].avatar;
    		step2();
    	})
    }
    function step2(){//上传头像
    	var newName = avatar.path+pathLib.parse(avatar.originalname).ext;
    	fs.rename(avatar.path,newName,function(err){
    		if(err) return res.json({code:500,data:'文件上传失败'})
    		avatarUrl = newName.replace(/[\\]/gm,"/");
    		if(oldImg) step3();
    		else step4();
    	})
    }
    function step3(){//删除原来的文件
    	if(oldImg===''||oldImg==='static/avatar/indexAvatar.jpg') return step4();
    	fs.unlink(oldImg,function(err){
    		if(err) return res.json({code:500,data:'删除原文件失败'})
    		step4();
    	})
    }
    function step4(){//修改头像
	    Sql.updateData('user',[{'avatar':avatarUrl}],[{'loginName':loginName}],function(err,result){
    		if(err) 
    			res.json({ code: 500, data: '修改失败' }) 
            else 
            	res.json({ code: 200, data: { "loginName": loginName, 'avatar':avatarUrl} })
    	})
    }

})


/**
 *登录 loginName password
 */
router.post('/login', (req, res) => {
	console.log('login');
    //初始化
    const loginName = req.body.loginName || '';
    var password = req.body.password || '';
    var userInfo = {};
    var adminInfo = {};

    //校验
    if (!loginName || !password) return res.json({ code: 404, data: '账号或密码不能为空' })

    //数据库操作
	step1();
	function step1(){//查询用户密码
	    Sql.selectData('user', '*', [{ 'loginName': loginName }],function(err, result) {
	        	if (err)  
	        		res.json({ code: 500, data: '获取失败' })
		        else if (!result[0]) 
		       		res.json({ code: 404, data: '账号不存在' }) //!result这玩意居然是false
		        else{
			        const realPsw = result[0].password;
			        // password = Common.md5(password);//md5加密
			        if (realPsw === password){
			        	userInfo = result[0];
			            step2();
			        }
			        else 
			            res.json({ code: 401, data: '密码错误' })
		        }
	        })
	}

	function step2(){//判断该用户是否为管理员
		Sql.selectData('admin', '*', [{ 'userId': userInfo.id }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else {
	        	req.session.userState = 1;
	        	req.session.userInfo = userInfo;
	        	if(!result[0]){
	        		userInfo.admin = false;
	        	}
	       		else {
	        		req.session.userState = 2;
	        		req.session.adminInfo = result[0];
	        		userInfo.admin = true;
	        	}
	        	res.json({ code: 200, data: userInfo}); 
	        }
        })
	}
});


/**
 *注销 logout
 */
router.post('/logout', (req, res) => {
	console.log('logout');
	req.session.userState = 0;
	req.session.adminInfo = {};
	req.session.userInfo = {};
	res.json({ code: 200, data: 'ok'}); 
})




/**
 *查询单个用户信息 loginName  //密码泄露
 */
router.post('/getUser', (req, res, next) => {
    //初始化
    const loginName = req.body.loginName || '';

    //校验
    if (!loginName) return res.json({ code: 404, data: '账号不能为空' })

    //数据库执行
	step1();
	function step1(){//查询单个用户信息
		Sql.selectData('user', '*', [{ 'loginName': loginName }],function(err, result) {
	        	if (err) 
	        		res.json({ code: 500, data: '获取失败' });
		        else {
		        	if(result[0]) 
		        		res.json({ code: 200, data: result[0] });
		        	else  
		        		res.json({ code: 404, data: '用户不存在' });
		        }
	        })
	}
});

/**
 *查询session信息
 */
 router.post('/filter', (req, res) => {
 	console.log('-filter:',req.session.userState);
	if(req.session.userState===1||req.session.userState===2) {
		console.log('身份继承');
		return res.json({ code: 200, data: req.session.userInfo });
	}
	else{
		console.log('身份过期');
		return res.json({ code: 200, data: '身份过期' });
		// return res.json({ code: 403, data: '身份过期' });
	}
})


