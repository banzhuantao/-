export default{
	Format(fmt) {
		let o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (let k in o){
			if (new RegExp("(" + k + ")").test(fmt)){
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	},
	getPageTitle(name) {
		let result = '';
		let menuList = JSON.parse(sessionStorage.getItem("MENULIST"));
		let flag = true;
		for (let menu of menuList) {
			let twos = [];
			if (!menu.menuUrl && flag) {
				if (menu.children.length > 0) {
					twos = menu.children;
					let threes = [];
					for (let two of twos) {
						if (two.menuUrl && flag) {
							if (two.menuUrl === name) {
								result = two.menuName;
								flag = false;
								break;
							}
						} else {
							threes = two.children;
							for (let three of threes) {
								if (three.menuUrl === name) {
									result = three.menuName;
									flag = false;
									break;
								}
							}
						}
					}
				}
			}
		}
		return result;
	},
	checkSpecificKey(str) {
		let reg = "/\~|\！|\!|\#|\$|\^|\￥|\%|\…|\&|\*|\(|\)|\—|\+|\{|\}|\“|\”|\《|\》|\?|\？|\<|\>|\'|\"/";
		for (let j = 0; j < str.length; j++) {
			if (reg.indexOf(str.substr(j, 1)) != -1) {
				return false;
			}
		}
		return true;
	},
	div(num1, num2) {
		 let baseNum1 = 0, baseNum2 = 0,ret;
		 let len1, len2;
		 try {
		  len1 = num1.toString().split(".")[1].length;
		 } catch (e) {
		  len1 = 0;
		 }
		 try {
		  len2 = num2.toString().split(".")[1].length;
		 } catch (e) {
		  len2 = 0;
		 }
		baseNum1 = Number(num1.toString().replace(".", ""));
		baseNum2 = Number(num2.toString().replace(".", ""));
		baseNum1 = baseNum1*Math.pow(10, len2);
		baseNum2 = baseNum2*Math.pow(10, len1);
		ret=baseNum1 / baseNum2;
		return ret;
	},
	mul(num1, num2) {
		let baseNum = 0,ret;
		try {
			baseNum += num1.toString().split(".")[1].length;
		} catch (e) {}
		try {
		  baseNum += num2.toString().split(".")[1].length;
		} catch (e) {}
		ret=(Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", ""))) / Math.pow(10, baseNum);
		return ret;
	},
	add(num1, num2) {
		let baseNum1 = 0, baseNum2 = 0,ret;
		let len1, len2;
		try {
		len1 = num1.toString().split(".")[1].length;
		}catch (e) {
			len1 = 0;
		}
		try {
			len2 = num2.toString().split(".")[1].length;
		} catch (e) {
			len2 = 0;
		}
		baseNum1 = Number(num1.toString().replace(".", ""));
		baseNum2 = Number(num2.toString().replace(".", ""));
		baseNum1 = baseNum1*Math.pow(10, len2);
		baseNum2 = baseNum2*Math.pow(10, len1);
		ret=(baseNum1 + baseNum2) / Math.pow(10, len1+len2);
		return ret;
	},
	reduce(num1, num2) {
		let baseNum1 = 0, baseNum2 = 0,ret;
		let len1, len2;
		try {
			len1 = num1.toString().split(".")[1].length;
		} catch (e) {
			len1 = 0;
		}
		try {
		   len2 = num2.toString().split(".")[1].length;
		} catch (e) {
			len2 = 0;
		}
		baseNum1 = Number(num1.toString().replace(".", ""));
		baseNum2 = Number(num2.toString().replace(".", ""));
		baseNum1 = baseNum1*Math.pow(10, len2);
		baseNum2 = baseNum2*Math.pow(10, len1);
		ret=(baseNum1 - baseNum2) / Math.pow(10, len1+len2);
		return ret;
	}
}
