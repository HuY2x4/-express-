const crypto = require('crypto');

module.exports = {
    MD5_SUFFIX: 'zxhyxtf20181229',
    md5: function(str) {
        var obj = crypto.createHash('md5');
        obj.update(str);
        return obj.digest('hex'); //十六进制
    },
    randomStr: function(size) {
        var seed = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'Q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '2', '3', '4', '5', '6', '7', '8', '9'
        ); //数组
        seedlength = seed.length; //数组长度
        var createPassword = '';
        for (i = 0; i < size; i++) {
            j = Math.floor(Math.random() * seedlength);
            createPassword += seed[j];
        }
        return createPassword;
    },
    bianliObj:function(obj){
     Object.keys(obj).forEach(function(key){
     	console.log(key,obj[key]);
		});
 	}
}