const express = require('express');
const router = express.Router();
module.exports = router;

/**
 *首页
 */
 router.get('/',(req,res)=>{
 	console.log('后端首页');
 	return res.json({code:200,data:'ojbk'})
 })