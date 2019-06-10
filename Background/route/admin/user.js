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
 *注销用户 loginName
 */
router.post('/delUser', (req, res) => {
    //Session
	// if(!req.session.adminInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const loginName = req.body.loginName || '';

    //校验
    if (!loginName) return res.json({ code: 404, data: '账号不能为空' })

    //数据库校验
	step1();
	function step1(){//校验用户是否存在
		Sql.selectData('user', '*', [{ 'loginName': loginName }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]) 
	        	res.json({ code: 404, data: '用户不存在' });
	        else 
	        	step2();
        })
	}

	//**********************
	//**删除相关联的所有数据**
	//**********************

    //数据库操作
    function step2(){//删除用户
	    Sql.deleteData(
	    	'user', 
	    	[{ 'loginName': loginName }],
	        function(err, result) {
	        	if (err) 
	        		res.json({ code: 500, data: '注销失败' })
		        else
			    	res.json({ code: 200, data: '注销成功' }); 
	        })
    }
});

/**
 *重置密码 loginName
 */
router.post('/resetPwd', (req, res) => {
    //Session
	if(!req.session.adminInfo) return res.json({ code: 403, data: '身份过期' });

    //初始化
    const loginName = req.body.loginName || '';
    var randomPwd = Common.randomStr(6);

    //密码加密
    // randomPwd = Common.md5(randomPwd);//md5加密

    //校验
    if (!loginName) return res.json({ code: 404, data: '账号不能为空' })

    //数据库校验
	step1();
	function step1(){//校验用户是否存在
		Sql.selectData('user', '*', [{ 'loginName': loginName }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]) 
	        	res.json({ code: 404, data: '用户不存在' });
	        else 
	        	step2();
        })
	}

    //数据库操作
    function step2(){
	    Sql.updateData(
	    	'user', 
	    	[{ 'password': randomPwd }],
	    	[{ 'loginName': loginName }],
	        function(err, result) {
	        	if (err) 
	        		res.json({ code: 500, data: '重置失败' })
		        else{
		        	//************************
		        	//**发送新密码至手机或邮箱**
		        	//************************
			    	res.json({ code: 200, data: randomPwd }); 
		        }
	        })
    }
});


/**
 *修改用户信息 loginName nickname phone email
 */
router.post('/updUser',(req,res)=>{
	//Session
	if(!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });

	//初始化
	const loginName = req.body.loginName || '';
	const nickname = req.body.nickname || '';
	const phone = req.body.phone || '';
	const email = req.body.email || '';

	//校验
	if (!CheckData.checkNickName(nickname)) return res.json({ code: 400, data: '昵称不合法' });
    if (!CheckData.checkPhone(phone)) return res.json({ code: 400, data: '手机号不合法' });
	if (email!=''&&!CheckData.checkEmail(email)) return res.json({ code: 400, data: '邮箱不合法' });

	//数据库校验
	step1();
	function step1(){//校验登录名是否存在
		Sql.selectData('user', '*', [{ 'loginName': loginName }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(result[0]) 
	        	step2();
	        else 
	        	res.json({ code: 417, data: '用户存在' });
        })
	}
	function step2(){//校验昵称是否存在
		Sql.selectData('user', '*', [{ 'nickname': nickname }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]||result[0].loginName===loginName) 
	        	step3();
	        else 
	        	res.json({ code: 417, data: '昵称已存在' });
        })
	}
	function step3(){//校验手机号是否存在
		Sql.selectData('user', '*', [{ 'phone': phone }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]||result[0].loginName===loginName) 
	        	step4();
	        else 
	        	res.json({ code: 417, data: '手机号已存在' });
        })
	}

    //数据库执行
    function step4(){
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
 *修改用户的头像 loginName avatar
 */
router.post('/updUserAvatar',uploadAvatar.single('avatar'),(req,res)=>{
	//Session
	if(!req.session.userInfo) return res.json({ code: 403, data: '身份过期' });
	
	//初始化
	const loginName = req.body.loginName || '';
	var avatar = req.file || '';
	var avatarUrl = 'static/indexAvatar.jpg';
	var oldImg = '';

	//数据库校验
	step1();
	function step1(){//校验用户是否存在
		Sql.selectData('user', '*', [{ 'loginName': loginName }],function(err, result) {
        	if (err) 
        		res.json({ code: 500, data: '获取失败' });
	        else if(!result[0]) 
	        	res.json({ code: 404, data: '用户不存在' });
	        else {
	        	oldImg = result[0].avatar;
	        	step2();
	        }
        })
	}

    //数据库执行
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

//查询所有用户信息(分页)
//index pageSize 
router.post('/getUsers', (req, res) => {
	//Session
	// if(!req.session.adminInfo) return res.json({ code: 403, data: '身份过期' });

	//初始化数据
	const index = req.body.index || 0;
	const pageSize = req.body.pageSize || 0;

    //数据库操作
    step1();
    function step1(){//查询所有用户信息
	    Sql.selectData('user', '*', null,function(err, result) {
	    		var usersInfo = [];
	        	if (err)
	        		res.json({ code: 500, data: '获取失败' })
		        else
		        {
		        	if(index&&pageSize){
		        		var j = 0;
		        		for(var i = (index-1)*pageSize;i<index*pageSize;i++){
		        			if(i>result.length-1) break ;
		        			usersInfo[j] = result[i];
		        			j++;
		        		}
		        		var maxPage = Math.ceil(result.length/pageSize);
			    		return res.json({ code: 200, data: {'usersInfo':usersInfo,'maxPage':maxPage,'count':result.length}}); 
		        	}
			    	res.json({ code: 200, data: result }); 
		        }
	        })
    }
});

/**
 *查询单个用户信息 id  
 */
router.post('/getUser', (req, res, next) => {
    //初始化
    const id = req.body.id || '';

    //校验
    if (!id) return res.json({ code: 404, data: 'ID不能为空' })

    //数据库执行
	step1();
	function step1(){//查询单个用户信息
		Sql.selectData('user', '*', [{ 'id': id }],function(err, result) {
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