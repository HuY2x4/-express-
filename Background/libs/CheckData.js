module.exports = {
	checkLoginName: function(str) {
        var reg = /^[a-zA-Z][a-zA-Z0-9]{4,12}$/;//5-13位
        if (reg.test(str)) {
            return true;
        } else {
            return false;
        }
    },
    checkPwd: function(str) {
        var reg = /^[a-zA-Z0-9]{5,12}$/;//6-13位
        if (reg.test(str)) {
            return true;
        } else {
            return false;
        }
    },
    checkEmail: function(str) {
        var reg = /^\w+@\w+(\.[a-zA-Z]{2,3}){1,2}$/;
        if (reg.test(str)) {
            return true;
        } else {
            return false;
        }
    },
    checkPhone: function(str) {
        var reg = /^1\d{10}$/;//11位
        if (reg.test(str)) {
            return true;
        } else {
            return false;
        }
    },
    checkNickName: function(str) {
        var reg = /^.{1,8}$/;//1-8位
        if (reg.test(str)) {
            return true;
        } else {
            return false;
        }
    },
}