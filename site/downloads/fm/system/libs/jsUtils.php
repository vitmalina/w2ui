<? 
require("phpCache.php"); 
$sys_folder = str_replace("/libs/jsUtils.php", "", str_replace("\\","/",__FILE__));
$sys_path   = str_replace($_SERVER['DOCUMENT_ROOT'], '', $sys_folder);
?>
/***********************************
*
* -- This the jsUtils class
*
***********************************/

function jsUtils() {
	this.sys_path	  = '<?=$sys_path?>';
	this.isInt		  = jsUtils_isInt;
	this.isFloat	  = jsUtils_isFloat;
	this.isHex		  = jsUtils_isHex;
	this.isTime       = jsUtils_isTime;
	this.isDate       = jsUtils_isDate;
	this.serialize    = jsUtils_serialize;
	this.phpSerialize = jsUtils_phpSerialize;
	this.base64encode = jsUtils_base64encode;
	this.base64decode = jsUtils_base64decode;
	this.utf8_encode  = jsUtils_utf8_encode;
	this.utf8_decode  = jsUtils_utf8_decode;
	this.trim		  = jsUtils_trim;
	this.stripTags	  = jsUtils_stripTags;
	this.center       = jsUtils_center;
	this.centerX      = jsUtils_centerX;
	this.centerY      = jsUtils_centerY;
	this.lock		  = jsUtils_lock;
	this.unlock		  = jsUtils_unlock;
	this.dropShadow   = jsUtils_dropShadow;
	this.clearShadow  = jsUtils_clearShadow;
	this.slideDown	  = jsUtils_slideDown;
	this.slideUp	  = jsUtils_slideUp;
	
	/***************************************
	* ---- IMPLEMENTATION
	*/

	function jsUtils_isInt(val) {
		var tmpStr = '-0123456789';
		val = String(val);
		for (var ii=0; ii<val.length; ii++){
			if (tmpStr.indexOf(val.substr(ii, 1)) < 0) { return false; }
			if (val.substr(ii, 1) == '-' && ii != 0) { return false; }
		}
		return true;
	}

	function jsUtils_isFloat(val) {
		var tmpStr = '-.0123456789';
		val = String(val);
		for (var ii=0; ii<val.length; ii++){
			if (tmpStr.indexOf(val.substr(ii, 1)) < 0) { return false; }
			if (val.substr(ii, 1) == '-' && ii != 0) { return false; }
		}
		return true;
	}

	function jsUtils_isHex(val) {
		var tmpStr = '0123456789ABCDEFabcdef';
		val = String(val);
		for (var ii=0; ii<val.length; ii++){
			if (tmpStr.indexOf(val.substr(ii, 1)) < 0) { return false; }
		}
		return true;
	}

	function jsUtils_isDate(val) {
		if (val.split("/").length != 3) return false; 
		var month	= val.split("/")[0];
		var day		= val.split("/")[1];
		var year	= val.split("/")[2];
		var obj = new Date(year, month-1, day);
		if ((obj.getMonth()+1 != month) || (obj.getDate() != day) || (obj.getFullYear() != year)) return false;
		return true;
	}

	function jsUtils_isTime(val) {
		var max;
		// -- process american foramt
		val = val.toUpperCase();
		if (val.indexOf('PM') >= 0 || val.indexOf('AM') >= 0) max = 12; else max = 23;
		val = top.jsUtils.trim(val.replace('AM', ''));
		val = top.jsUtils.trim(val.replace('PM', ''));
		// ---
		var tmp = val.split(':');
		if (tmp.length != 2) { return false; }
		if (tmp[0] == '' || parseInt(tmp[0]) < 0 || parseInt(tmp[0]) > max || !top.jsUtils.isInt(tmp[0])) { return false; }
		if (tmp[1] == '' || parseInt(tmp[1]) < 0 || parseInt(tmp[1]) > 59 || !top.jsUtils.isInt(tmp[1])) { return false; }
		return true;
	}

	function jsUtils_serialize(obj){
		var res = '';
		for (var key in obj) {
			if (typeof(obj[key]) == 'object') {
				res += escape(key) + '~[' + this.serialize(obj[key]) + ']!!';
			} else {
				res += escape(key) + '~' + escape(obj[key]) + '!!';
			}
		}
		return res; 
	}

	function jsUtils_phpSerialize(obj){
		var res = '';
		switch(typeof(obj)) {
			case 'number':
				if ((obj - Math.round(obj)) == 0) {
					res += 'i:' + obj + ';';
				} else {
					res += 'd:' + obj + ';';
				}
				break;
			case 'string':
				var tmp = unescape(obj); 
				res += 's:' + tmp.length + ':"' + obj + '";';
				break;
			case 'boolean':
				if (obj) {
					res += 'b:1;';
				} else {
					res += 'b:0;';
				}
				break;
			 case 'object' :
				if (obj instanceof Array) {
					res = 'a:';
					var tmpStr = '';
					var cntr = 0;
					for (var key in obj) {
						tmpStr += top.jsUtils.serialize(key);
						tmpStr += top.jsUtils.serialize(obj[key]);
						cntr++;
					}
					res += cntr + ':{' + tmpStr + '}';
				}
			 break;

		}
		return res;
	}


	function jsUtils_base64encode(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		input = this.utf8_encode(input);
		
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
		}
		return output;
	}
	 
	function jsUtils_base64decode(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {
			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = this.utf8_decode(output);
		return output;
	}

	function jsUtils_utf8_encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	}
	 
	function jsUtils_utf8_decode(string) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		
		return string;
	}

	function jsUtils_trim(sstr) {
		while (true) {
			if (sstr.substr(0, 1) == " " || sstr.substr(0, 1) == "\n" || sstr.substr(0, 1) == "\r") {
				sstr = sstr.substr(1, sstr.length - 1);
			} else {
				if (sstr.substr(sstr.length - 1, 1) == " " || sstr.substr(sstr.length - 1, 1) == "\n" || sstr.substr(sstr.length - 1, 1) == "\r") {
					sstr = sstr.substr(0, sstr.length - 1);
				} else {
					break;
				}
			}
		}
		return sstr;
	}

	function jsUtils_stripTags(html) {
		html = this.trim(html.replace(/(<([^>]+)>)/ig, ""));
		return html;
	}

	function jsUtils_center(div) {
		if (top.innerHeight == undefined) {
			var width  = top.document.body.clientWidth;
			var height = top.document.body.clientHeight;
		} else {
			var width  = top.innerWidth;
			var height = top.innerHeight;
		}		
		div.style.left = (width  - parseInt(div.style.width)) / 2;
		div.style.top  = (height - parseInt(div.style.height)) / 2;
	}

	function jsUtils_centerX(div) {
		if (top.innerHeight == undefined) {
			var width  = top.document.body.clientWidth;
		} else {
			var width  = top.innerWidth;
		}		
		div.style.left = (width  - parseInt(div.style.width)) / 2;
	}

	function jsUtils_centerY(div) {
		if (top.innerHeight == undefined) {
			var height = top.document.body.clientHeight;
		} else {
			var height = top.innerHeight;
		}		
		div.style.top  = (height - parseInt(div.style.height)) / 2;
	}

	function jsUtils_lock(opacity, lockOnClick) {
		if (top.document.getElementById('screenLock')) return;
		if (opacity == undefined || opacity == null) opacity = 0;
		var width;
		var height;
		// get width and height
		if (top.innerHeight == undefined) {
			width  = top.document.body.clientWidth;
			height = top.document.body.clientHeight;
		} else {
			width  = top.innerWidth;
			height = top.innerHeight;
		}		
		//lock window
		top.screenLock 	= top.document.createElement('DIV');
		top.screenLock.style.cssText = 'position: fixed; zIndex: 1000; left: 0px; top: 0px; background-color: gray;'+
									   'width: '+ width +'px; height: '+ height +'px; opacity: 0;';
		top.screenLock.id = 'screenLock';
		top.screenLock.style.filter = 'alpha(opacity=0)';
		if (!lockOnClick) top.screenLock.onclick = lockOnClick;
		top.document.body.appendChild(top.screenLock);
		// - nice opacity
		top.tmp_opacity  = opacity;
		top.tmp_sopacity = 0;
		top.tmp_opacity_timeout = setInterval(new Function(
				"if(top.tmp_sopacity >= top.tmp_opacity) { "+
				"	top.tmp_sopacity = top.tmp_opacity; "+
				"	clearInterval(top.tmp_opacity_timeout); "+
				"} "+
				"top.tmp_sopacity += 0.05; top.screenLock.style.opacity = top.tmp_sopacity; "+
				"top.screenLock.style.filter = 'alpha(opacity='+ (top.tmp_sopacity * 100) +')'"+
				""), 1);
	}

	function jsUtils_unlock() {
		top.tmp_sopacity = top.tmp_opacity;
		top.tmp_opacity  = 0;
		top.tmp_opacity_timeout = setInterval(new Function(
				"top.tmp_sopacity -= 0.05; "+
				"if(top.tmp_sopacity <= 0) { "+
				"	top.document.body.removeChild(top.screenLock);"+
				"	top.screenLock = null;"+
				"	top.tmp_sopacity = top.tmp_opacity; "+
				"	clearInterval(top.tmp_opacity_timeout); "+
				"	return; "+
				"} "+
				"top.screenLock.style.opacity = top.tmp_sopacity; "+
				"top.screenLock.style.filter = 'alpha(opacity='+ (top.tmp_sopacity * 100) +')'"+
				""), 1);
	}

	function jsUtils_dropShadow(shadowel, center) {
		var shleft      = parseInt(shadowel.offsetLeft);
		var shtop       = parseInt(shadowel.offsetTop);
		var shwidth     = parseInt(shadowel.offsetWidth);
		var shheight    = parseInt(shadowel.offsetHeight);
		var addshLeft   = 0;
		var addshTop    = 0;
		var addshWidth  = 0;
		var addshHeight = 0;

		if (shtop <= 0 && shadowel.ownerDocument.defaultView) {
			st = shadowel.ownerDocument.defaultView.getComputedStyle(shadowel, '');
			shleft      = parseInt(st.left);
			shtop       = parseInt(st.top);
			shwidth     = parseInt(st.width);
			shheight    = parseInt(st.height);
			addshLeft   = parseInt(st.marginLeft);
			addshTop    = parseInt(st.marginTop);
			addshWidth  = parseInt(st.paddingLeft) + parseInt(st.paddingRight) + parseInt(st.borderLeftWidth) + parseInt(st.borderRightWidth);
			addshHeight = parseInt(st.paddingTop) + parseInt(st.paddingBottom) + parseInt(st.borderTopWidth) + parseInt(st.borderBottomWidth);
		}
		if (String(Number(shleft)) == 'NaN') { shleft = 0; }
		if (String(Number(shtop))  == 'NaN') { shtop = 0; }
		
		var tmp = shadowel.ownerDocument.createElement('DIV');
		tmp.style.position  = 'absolute';
		tmp.style.left      = (shleft - (center ? 10 : 10) + addshLeft) + 'px';
		tmp.style.top       = (shtop - (center ? 10 : 0) + addshTop) + 'px';
		tmp.style.width     = (shwidth  + (center ? 20 : 20) + addshWidth) + 'px';
		tmp.style.height    = (shheight + (center ? 20 : 10) + addshHeight) + 'px';

		var html = '\n';
		html += '<table cellpadding="0" cellspacing="0" style="width:100%; height:100%; font-size: 2px;">\n'+
				'<tr height="10px">\n'+
				'  <td width="10px" style="-moz-border-radius: 12 0 0 0; border-radius: 12 0 0 0; background-image: url('+ top.jsUtils.sys_path +'/images/shadow1.png)">&nbsp;</td>\n'+
				'  <td style="background-image: url('+ top.jsUtils.sys_path +'/images/shadow2.png)">&nbsp;</td>\n'+
				'  <td width="10px" style="-moz-border-radius: 0 12 0 0; border-radius: 0 12 0 0; background-image: url('+ top.jsUtils.sys_path +'/images/shadow3.png); background-position: right top">&nbsp;</td>\n'+
				'</tr>\n'+
				'<tr>\n'+
				'  <td width="10px" style="background-image: url('+ top.jsUtils.sys_path +'/images/shadow8.png)">&nbsp;</td>\n'+
				'  <td style="background-image: url('+ top.jsUtils.sys_path +'/images/shadow0.png); opacity: 0.55; filter: alpha(opacity=12);">&nbsp;</td>\n'+
				'  <td width="10px" style="background-image: url('+ top.jsUtils.sys_path +'/images/shadow4.png); background-position: right top">&nbsp;</td>\n'+
				'</tr>\n'+
				'<tr height="10px">\n'+
				'  <td width="10px" style="-moz-border-radius: 0 0 0 12; border-radius: 0 0 0 12; background-image: url('+ top.jsUtils.sys_path +'/images/shadow7.png); background-position: left bottom;">&nbsp;</td>\n'+
				'  <td style="background-image: url('+ top.jsUtils.sys_path +'/images/shadow6.png); background-position: right bottom">&nbsp;</td>\n'+
				'  <td width="10px" style="-moz-border-radius: 0 0 12 0; border-radius: 0 0 12 0; background-image: url('+ top.jsUtils.sys_path +'/images/shadow5.png); background-position: right bottom">&nbsp;</td>\n'+
				'</tr>\n'+
				'</table>\n';
		tmp.innerHTML = html;
		shadowel.parentNode.appendChild(tmp, shadowel);
		if (shadowel.style.zIndex != undefined && shadowel.style.zIndex != null) tmp.style.zIndex = parseInt(shadowel.style.zIndex)-1;
		shadowel.shadow = tmp;
		return tmp;
	}

	function jsUtils_clearShadow(shadowel) {
		if (shadowel.shadow) shadowel.parentNode.removeChild(shadowel.shadow);
		shadowel.shadow = null;
	}

	function jsUtils_slideDown(el, onfinish) {
		try {
			if (el != undefined && el != null) {
				// initiate
				top.tmp_sd_el 		= el;
				el.style.top  		= -1000;
				el.style.display  	= '';
				top.tmp_sd_height 	= parseInt(el.clientHeight);
				top.tmp_sd_top	  	= -parseInt(el.clientHeight);
				top.tmp_sd_timer  	= setInterval("top.jsUtils.slideDown()", 2);
				top.tmp_sd_step   	= top.tmp_sd_height / 15;
				top.tmp_sd_onfinish	= onfinish;
				// show parent element
				el.parentNode.style.width  = parseInt(el.clientWidth) + 5;
				el.parentNode.style.height = parseInt(el.clientHeight) + 5;
				el.parentNode.style.overflow = 'hidden';
				return;
			}	
			top.tmp_sd_top += top.tmp_sd_step;
			if (top.tmp_sd_top > 0) top.tmp_sd_top = 0;
			if (top.tmp_sd_el) {
				top.tmp_sd_el.style.top = top.tmp_sd_top;
				if (top.tmp_sd_top == 0) { 
					if (top.tmp_sd_onfinish) top.tmp_sd_onfinish(top.tmp_sd_el);
					top.tmp_sd_el.parentNode.style.overflow = '';
					// stop role out
					clearInterval(top.tmp_sd_timer); 
					top.tmp_sd_el 	  	= undefined;
					top.tmp_sd_height 	= undefined;
					top.tmp_sd_top	  	= undefined;
					top.tmp_sd_timer  	= undefined;
					top.tmp_sd_step   	= undefined;
					top.tmp_sd_onfinish = undefined;
				}
			}
		} catch (e) {}
	}

	function jsUtils_slideUp(el, onfinish) {
		try {
			if (el != undefined && el != null) {
				// initiate
				top.tmp_sd_el 		= el;
				el.style.display  	= '';
				top.tmp_sd_height 	= parseInt(el.clientHeight);
				top.tmp_sd_top	  	= 0;
				top.tmp_sd_timer  	= setInterval("top.jsUtils.slideUp()", 2);
				top.tmp_sd_step   	= top.tmp_sd_height / 15;
				top.tmp_sd_onfinish	= onfinish;
				// control the parent element
				el.parentNode.style.overflow 	= 'hidden';
				return;
			}
			top.tmp_sd_top -= top.tmp_sd_step;
			if (-top.tmp_sd_top > top.tmp_sd_height) top.tmp_sd_top = -top.tmp_sd_height - 10;
			top.tmp_sd_el.style.top = top.tmp_sd_top;
			if (top.tmp_sd_top == -top.tmp_sd_height - 10) { 
				if (top.tmp_sd_onfinish) top.tmp_sd_onfinish(top.tmp_sd_el);
				// hide parent element
				top.tmp_sd_el.parentNode.style.width  = 0;
				top.tmp_sd_el.parentNode.style.height = 0;
				// stop role out
				clearInterval(top.tmp_sd_timer); 
				top.tmp_sd_el 	  	= undefined;
				top.tmp_sd_height 	= undefined;
				top.tmp_sd_top	  	= undefined;
				top.tmp_sd_timer  	= undefined;
				top.tmp_sd_step   	= undefined;
				top.tmp_sd_onfinish	= undefined;
			}
		} catch (e) {}
	}
	
	// -- initialize
	top.elements = [];
}
top.jsUtils  = new jsUtils();