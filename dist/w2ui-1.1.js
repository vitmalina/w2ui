/************************************************
*   Library: Web 2.0 UI for jQuery
*   - Following objects are defines
*   	- w2ui 			- object that contains all created objects
*		- w2utils 		- basic utilities
*		- w2ui.w2evet	- generic event object
*   - Dependencies: jQuery
* 
************************************************/

var w2ui = w2ui || {}; // w2utils might not be loaded yet

var w2utils = (function () {
	var obj = {
		settings : {
			date_format	: 'Mon dd, yyyy',
			time_format	: 'hh:mi pm'
		},
		isInt			: isInt,
		isFloat			: isFloat,
		isMoney			: isMoney,
		isHex			: isHex,
		isAlphaNumeric	: isAlphaNumeric,
		isEmail			: isEmail,
		isDate			: isDate,
		isTime			: isTime,
		age 			: age,
		formatDate		: formatDate,
		date 			: date,
		stripTags		: stripTags,
		encodeTags		: encodeTags,
		base64encode	: base64encode,
		base64decode	: base64decode,
		transition		: transition,
		getSize			: getSize
	}
	return obj;
	
	function isInt (val) {
		var re =  /^[-]?[0-9]+$/;
		return re.test(val);		
	}
		
	function isFloat (val) {
		var re =  /^[-]?[0-9]*[\.]?[0-9]+$/;
		return re.test(val);		
	}

	function isMoney (val) {
		var re =  /^[\$\€\£\¥]?[-]?[0-9]*[\.]?[0-9]+$/;
		return re.test(val);		
	}
		
	function isHex (val) {
		var re =  /^[a-fA-F0-9]+$/;
		return re.test(val);		
	}
	
	function isAlphaNumeric (val) {
		var re =  /^[a-zA-Z0-9_-]+$/;
		return re.test(val);		
	}
	
	function isEmail (val) {
		var email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
		return email.test(val); 
	}

	function isDate (val) {
		// USA format only mm/dd/yy[yy]
		if (typeof val == 'undefined' || val == null) return false;
		if (val.split("/").length != 3) return false; 
		var month	= val.split("/")[0];
		var day		= val.split("/")[1];
		var year	= val.split("/")[2];
		var obj = new Date(year, month-1, day);
		if ((obj.getMonth()+1 != month) || (obj.getDate() != day) || (obj.getFullYear() != year)) return false;
		return true;
	}

	function isTime (val) {
		// Both formats 10:20pm and 22:20
		if (String(val) == 'undefined') return false;
		var max;
		// -- process american foramt
		val = val.toUpperCase();
		if (val.indexOf('PM') >= 0 || val.indexOf('AM') >= 0) max = 12; else max = 23;
		val = $.trim(val.replace('AM', ''));
		val = $.trim(val.replace('PM', ''));
		// ---
		var tmp = val.split(':');
		if (tmp.length != 2) { return false; }
		if (tmp[0] == '' || parseInt(tmp[0]) < 0 || parseInt(tmp[0]) > max || !this.isInt(tmp[0])) { return false; }
		if (tmp[1] == '' || parseInt(tmp[1]) < 0 || parseInt(tmp[1]) > 59 || !this.isInt(tmp[1])) { return false; }
		return true;
	}

	function formatDate (dateStr, format) {
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 
						  'October', 'November', 'December'];
		if (typeof format == 'undefined') format = this.settings.date_format;
		if (typeof dateStr == 'undefined' || dateStr == '' || dateStr == null) return '';

		var dt = new Date(dateStr);
		if (w2utils.isInt(dateStr)) dt = new Date(Number(dateStr)); // for unix timestamps
		var tmp = String(dateStr).split('-');
		if (tmp.length == 3) dt = new Date(tmp[0], Number(tmp[1])-1, tmp[2]); // yyyy-mm-dd
		var tmp = String(dateStr).split('/');
		if (tmp.length == 3) dt = new Date(tmp[2], Number(tmp[0])-1, tmp[1]); // mm/dd/yyyy
		if (dt == 'Invalid Date') return '';

		var year 	= dt.getFullYear();
		var month 	= dt.getMonth();
		var date 	= dt.getDate();
		var res 	= format.toLowerCase()
						.replace('yyyy', year)
						.replace('mm', month+1)
						.replace('dd', date)
						.replace('mon', months[month])
						.replace('month', fullMonths[month]);
		return res;
	}
	
	function date (dateStr) {
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		if (dateStr == '' || typeof dateStr == 'undefined' || dateStr == null) return '';
		if (w2utils.isInt(dateStr)) dateStr = Number(dateStr); // for unix timestamps
		
		var d1 = new Date(dateStr);
		if (w2utils.isInt(dateStr)) d1 = new Date(Number(dateStr)); // for unix timestamps
		var tmp = String(dateStr).split('-');
		if (tmp.length == 3) d1 = new Date(tmp[0], Number(tmp[1])-1, tmp[2]); // yyyy-mm-dd
		var tmp = String(dateStr).split('/');
		if (tmp.length == 3) d1 = new Date(tmp[2], Number(tmp[0])-1, tmp[1]); // mm/dd/yyyy
		if (d1 == 'Invalid Date') return '';

		var d2   = new Date(); // today
		var d3   = new Date(); 
		d3.setTime(d3.getTime() - 86400000); // yesterday
		
		var dd1  = months[d1.getMonth()] + ' ' + d1.getDate() + ', ' + d1.getFullYear();
		var dd2  = months[d2.getMonth()] + ' ' + d2.getDate() + ', ' + d2.getFullYear();
		var dd3  = months[d3.getMonth()] + ' ' + d3.getDate() + ', ' + d3.getFullYear();
		
		var time = (d1.getHours() - (d1.getHours() > 12 ? 12 :0)) + ':' + (d1.getMinutes() < 10 ? '0' : '') + d1.getMinutes() + ' ' + (d1.getHours() >= 12 ? 'pm' : 'am');
		var time2= (d1.getHours() - (d1.getHours() > 12 ? 12 :0)) + ':' + (d1.getMinutes() < 10 ? '0' : '') + d1.getMinutes() + ':' + (d1.getSeconds() < 10 ? '0' : '') + d1.getSeconds() + ' ' + (d1.getHours() >= 12 ? 'pm' : 'am');
		var dsp = dd1;
		if (dd1 == dd2) dsp = time;
		if (dd1 == dd3) dsp = 'Yesterday';

		return '<span title="'+ dd1 + ' ' + time2 +'">'+ dsp + '</span>';
	}

	function age (timeStr) {
		if (timeStr == '' || typeof timeStr == 'undefined' || timeStr == null) return '';
		if (w2utils.isInt(timeStr)) timeStr = Number(timeStr); // for unix timestamps
		
		var d1 = new Date(timeStr);
		if (w2utils.isInt(timeStr)) d1 = new Date(Number(timeStr)); // for unix timestamps
		var tmp = String(timeStr).split('-');
		if (tmp.length == 3) d1 = new Date(tmp[0], Number(tmp[1])-1, tmp[2]); // yyyy-mm-dd
		var tmp = String(timeStr).split('/');
		if (tmp.length == 3) d1 = new Date(tmp[2], Number(tmp[0])-1, tmp[1]); // mm/dd/yyyy
		if (d1 == 'Invalid Time') return '';

		var d2  = new Date();
		var sec = (d2.getTime() - d1.getTime()) / 1000;
		var amount = '';
		var type   = '';
		
		if (sec < 60) {
			amount = Math.floor(sec);
			type   = 'sec';
		} else if (sec < 60*60) {
			amount = Math.floor(sec/60);
			type   = 'min';
		} else if (sec < 24*60*60) {
			amount = Math.floor(sec/60/60);
			type   = 'hour';
		} else if (sec < 30*24*60*60) {
			amount = Math.floor(sec/24/60/60);
			type   = 'day';
		} else if (sec < 12*30*24*60*60) {
			amount = Math.floor(sec/30/24/60/60);
			type   = 'month';
		} else if (sec >= 12*30*24*60*60) {
			amount = Math.floor(sec/12/30/24/60/60);
			type   = 'year';
		}		
		return amount + ' ' + type + (amount > 1 ? 's' : '');
	}	
		
	function stripTags (html) {
		if (html == null) return html;
		switch (typeof html) {
			case 'number':
				break;
			case 'string':
				html = $.trim(String(html).replace(/(<([^>]+)>)/ig, ""));
				break;
			case 'object':
				for (var a in html) html[a] = this.stripTags(html[a]);
				break;
		}
		return html;
	}

	function encodeTags (html) {
		if (html == null) return html;
		switch (typeof html) {
			case 'number':
				break;
			case 'string':
				html = String(html).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
				break;
			case 'object':
				for (var a in html) html[a] = this.encodeTags(html[a]);
				break;
		}
		return html;
	}

	function base64encode (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		input = utf8_encode(input);

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

		function utf8_encode (string) {
			var string = string.replace(/\r\n/g,"\n");
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

		return output;
	}

	function base64decode (input) {
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
		output = utf8_decode(output);

		function utf8_decode (utftext) {
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

		return output;
	}
	
	function transition (div_old, div_new, type, callBack) {
		var width  = $(div_old).width();
		var height = $(div_old).height();
		var time   = 0.5;
				
		if (!div_old || !div_new) {
			$.error('Cannot do transition when one of the divs is null');
			return;
		}
		 
		div_old.parentNode.style.cssText += cross('perspective', '700px') +'; overflow: hidden;';
		div_old.style.cssText += '; position: absolute; z-index: 1019; '+ cross('backface-visibility', 'hidden');
		div_new.style.cssText += '; position: absolute; z-index: 1020; '+ cross('backface-visibility', 'hidden');
		
		switch (type) {
			case 'slide-left':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d('+ width + 'px, 0, 0)', 'translate('+ width +'px, 0)');
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +';'+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
					div_old.style.cssText += cross('transition', time+'s') +';'+ cross('transform', 'translate3d(-'+ width +'px, 0, 0)', 'translate(-'+ width +'px, 0)');
				}, 1);
				break;

			case 'slide-right':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(-'+ width +'px, 0, 0)', 'translate(-'+ width +'px, 0)');
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0px, 0, 0)', 'translate(0px, 0)');
					div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d('+ width +'px, 0, 0)', 'translate('+ width +'px, 0)');
				}, 1);
				break;

			case 'slide-down':
				// init divs
				div_old.style.cssText += 'overflow: hidden; z-index: 1; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
				div_new.style.cssText += 'overflow: hidden; z-index: 0; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
					div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0, '+ height +'px, 0)', 'translate(0, '+ height +'px)');
				}, 1);
				break;

			case 'slide-up':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, '+ height +'px, 0)', 'translate(0, '+ height +'px)');
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
					div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
				}, 1);
				break;

			case 'flip-left':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('-transform', 'rotateY(0deg)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateY(-180deg)');
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateY(0deg)');
					div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateY(180deg)');
				}, 1);
				break;

			case 'flip-right':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateY(0deg)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateY(180deg)');
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateY(0deg)');
					div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateY(-180deg)');
				}, 1);
				break;

			case 'flip-down':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateX(0deg)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateX(180deg)');
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateX(0deg)');
					div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateX(-180deg)');
				}, 1);
				break;

			case 'flip-up':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateX(0deg)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'rotateX(-180deg)');
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateX(0deg)');
					div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'rotateX(180deg)');
				}, 1);
				break;

			case 'pop-in':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)') + '; '+ cross('transform', 'scale(.8)') + '; opacity: 0;';
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'scale(1)') +'; opacity: 1;';
					div_old.style.cssText += cross('transition', time+'s') +';';
				}, 1);
				break;

			case 'pop-out':
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)') +'; '+ cross('transform', 'scale(1)') +'; opacity: 1;';
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)') +'; opacity: 0;';
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time+'s') +'; opacity: 1;';
					div_old.style.cssText += cross('transition', time+'s') +'; '+ cross('transform', 'scale(1.7)') +'; opacity: 0;';
				}, 1);
				break;

			default:
				// init divs
				div_old.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)');
				div_new.style.cssText += 'overflow: hidden; '+ cross('transform', 'translate3d(0, 0, 0)', 'translate(0, 0)') +'; opacity: 0;';
				$(div_new).show();
				// -- need a timing function because otherwise not working
				window.setTimeout(function() {
					div_new.style.cssText += cross('transition', time +'s') +'; opacity: 1;';
					div_old.style.cssText += cross('transition', time +'s');
				}, 1);
				break;
		}
		
		setTimeout(function () {
			if (type == 'slide-down') {
				$(div_old).css('z-index', '1019');
				$(div_new).css('z-index', '1020');
			}
			if (div_new) {
				$(div_new).css({ 
					'opacity': '1', 
					'-webkit-transition': '', 
					'-moz-transition': '', 
					'-ms-transition': '', 
					'-o-transition': '', 
					'-webkit-transform': '', 
					'-moz-transform': '', 
					'-ms-transform': '', 
					'-o-transform': '', 
					'-webkit-backface-visibility': '', 
					'-moz-backface-visibility': '', 
					'-ms-backface-visibility': '', 
					'-o-backface-visibility': '' 
				});
			}
			if (div_old) {
				$(div_old).css({ 
					'opacity': '1', 
					'-webkit-transition': '', 
					'-moz-transition': '', 
					'-ms-transition': '', 
					'-o-transition': '', 
					'-webkit-transform': '', 
					'-moz-transform': '', 
					'-ms-transform': '', 
					'-o-transform': '', 
					'-webkit-backface-visibility': '', 
					'-moz-backface-visibility': '', 
					'-ms-backface-visibility': '', 
					'-o-backface-visibility': '' 
				});
				if (div_old.parentNode) $(div_old.parentNode).css({
					'-webkit-perspective': '',
					'-moz-perspective': '',
					'-ms-perspective': '',
					'-o-perspective': ''
				});
			}
			if (typeof callBack == 'function') callBack();
		}, time * 1000);
		
		function cross(property, value, none_webkit_value) {
			if (!$.browser.webkit && typeof none_webkit_value != 'undefined') value = none_webkit_value;
			return ';'+ property +': '+ value +'; -webkit-'+ property +': '+ value +'; -moz-'+ property +': '+ value +'; '+
				   '-ms-'+ property +': '+ value +'; -o-'+ property +': '+ value +';';
		}
	}
	
	function getSize (el, type) {
		var bwidth = {
			left: 	parseInt($(el).css('border-left-width')) || 0,
			right:  parseInt($(el).css('border-right-width')) || 0,
			top:  	parseInt($(el).css('border-top-width')) || 0,
			bottom: parseInt($(el).css('border-bottom-width')) || 0
		}
		var mwidth = {
			left: 	parseInt($(el).css('margin-left')) || 0,
			right:  parseInt($(el).css('margin-right')) || 0,
			top:  	parseInt($(el).css('margin-top')) || 0,
			bottom: parseInt($(el).css('margin-bottom')) || 0
		}
		var pwidth = {
			left: 	parseInt($(el).css('padding-left')) || 0,
			right:  parseInt($(el).css('padding-right')) || 0,
			top:  	parseInt($(el).css('padding-top')) || 0,
			bottom: parseInt($(el).css('padding-bottom')) || 0
		}
		switch (type) {
			case 'top': 	return bwidth.top + mwidth.top + pwidth.top; 
			case 'bottom': 	return bwidth.bottom + mwidth.bottom + pwidth.bottom; 
			case 'left': 	return bwidth.left + mwidth.left + pwidth.left; 
			case 'right': 	return bwidth.right + mwidth.right + pwidth.right; 
			case 'width': 	return bwidth.left + mwidth.left + bwidth.right + mwidth.right + pwidth.right + pwidth.right + parseInt($(el).width()); 
			case 'height': 	return bwidth.top + mwidth.top + bwidth.bottom + mwidth.bottom + pwidth.bottom + pwidth.bottom + parseInt($(el).height());
			case '+width': 	return bwidth.left + mwidth.left + bwidth.right + mwidth.right + pwidth.right + pwidth.right; 
			case '+height': return bwidth.top + mwidth.top + bwidth.bottom + mwidth.bottom + pwidth.bottom + pwidth.bottom;
		}
	}		
	
})();

/***********************************************************
*  Generic Event Object
*  --- This object is reused across all other 
*  --- widgets in w2ui.
*
*********************************************************/

$.w2event = {

	on: function (eventData, handler) {
		if (!$.isPlainObject(eventData)) eventData = { type: eventData };
		eventData = $.extend({ type: null, execute: 'before', target: null, onComplete: null }, eventData);
		
		if (typeof eventData.type == 'undefined') { $.error('You must specify event type when calling .on() method of '+ this.name); return; }
		if (typeof handler == 'undefined') { $.error('You must specify event handler function when calling .on() method of '+ this.name); return; }
		this.handlers.push({ event: eventData, handler: handler });
	},
	
	off: function (eventData, handler) {
		if (!$.isPlainObject(eventData)) eventData = { type: eventData };
		eventData = $.extend({}, { type: null, execute: 'before', target: null, onComleted: null }, eventData);
	
		if (typeof eventData.type == 'undefined') { $.error('You must specify event type when calling .off() method of '+ this.name); return; }
		if (typeof handler == 'undefined') { handler = null;  }
		// remove handlers
		var newHandlers = [];
		for (var h in this.handlers) {
			var t = this.handlers[h];
			if ( (t.event.type == eventData.type || eventData.type == '*')
				&& (t.event.target == eventData.target || eventData.target == null) 
				&& (t.handler == handler || handler == null)) {
				// match
			} else {
				newHandlers.push(t);
			}
		}		
		this.handlers = newHandlers;
	},
		
	trigger: function (eventData) {
		var eventData = $.extend({ type: null, phase: 'before', target: null, stop: false }, eventData);
		if (typeof eventData.target == 'undefined') eventData.target = null;		
		// process events in REVERSE order 
		for (var h = this.handlers.length-1; h >= 0; h--) {
			var t = this.handlers[h];
			if ( (t.event.type == eventData.type || t.event.type == '*') 
					&& (t.event.target == eventData.target || t.event.target == null)
					&& (t.event.execute == eventData.phase || t.event.execute == '*' || t.event.phase == '*') ) {
				var ret = t.handler.call(this, eventData.target, eventData);
				if ($.isPlainObject(ret)) { 
					$.extend(eventData, ret);
					if (eventData.stop === true) return eventData; 
				}
			}
		}		
		// main object events
		if (eventData.phase == 'before' 
				&& typeof this['on' + eventData.type.substr(0,1).toUpperCase() + eventData.type.substr(1)] == 'function') {
			var ret = this['on' + eventData.type.substr(0,1).toUpperCase() + eventData.type.substr(1)].call(this, eventData.target, eventData);
			if ($.isPlainObject(ret)) { 
				$.extend(eventData, ret);
				if (eventData.stop === true) return eventData; 
			}
		}
		// item object events
		if (typeof eventData.object != 'undefined' && eventData.object != null && eventData.phase == 'before'
				&& typeof eventData.object['on' + eventData.type.substr(0,1).toUpperCase() + eventData.type.substr(1)] == 'function') {
			var ret = eventData.object['on' + eventData.type.substr(0,1).toUpperCase() + eventData.type.substr(1)].call(this, eventData.target, eventData);
			if ($.isPlainObject(ret)) { 
				$.extend(eventData, ret);
				if (eventData.stop === true) return eventData; 
			}
		}
		// execute onComplete
		if (eventData.phase == 'after' && eventData.onComplete != null)	eventData.onComplete.call(this, eventData);
	
		return eventData;
	}	
};

/***********************************************************
*  Commonly used plugins
*  --- used primarily in grid and form
*
*********************************************************/

(function () {

	$.fn.w2render = function (name) {
		if ($(this).length > 0) {
			if (typeof name == 'string' && w2ui[name]) w2ui[name].render($(this)[0]);
			if (typeof name == 'object') name.render($(this)[0]);
		}
	}

	$.fn.w2destroy = function (name) {
		if (typeof name == 'string' && w2ui[name]) w2ui[name].destroy();
		if (typeof name == 'object') name.destroy();
	}

	$.fn.w2lite = function () {
	}
	
	$.fn.w2tag = function (text, options) {
		if (!$.isPlainObject(options)) options = {};
		if (!$.isPlainObject(options.css)) options.css = {};
		if (typeof options['class'] == 'undefined') options['class'] = '';
		// remove all tags
		if ($(this).length == 0) {
			$('.global-tag').each(function (index, elem) {
				$('#' + $(elem).data('tagID')).removeClass( $(elem).data('options')['class'] );
				clearInterval($(elem).data('timer'));
				$(elem).remove();
			});
			return;
		}
		return $(this).each(function (index, el) {
			// show or hide tag
			var tagID = el.id;
			if (text == '' || text == null || typeof text == 'undefined') {
				$('#global-tag-'+tagID).css('opacity', 0);
				setTimeout(function () {
					// remmove element
					clearInterval($('#global-tag-'+tagID).data('timer'));
					$('#global-tag-'+tagID).remove();
				}, 300);
			} else {
				// remove elements
				clearInterval($('#global-tag-'+tagID).data('timer'));
				$('#global-tag-'+tagID).remove();
				// insert
				$('body').append('<div id="global-tag-'+ tagID +'" class="global-tag" '+
								 '	style="position: absolute; z-index: 1100; opacity: 0; -webkit-transition: opacity .3s; -moz-transition: opacity .3s; -ms-transition: opacity .3s; -o-transition: opacity .3s"></div>');		

				var timer = setInterval(function () { 
					// monitor if destroyed
					if ($(el).length == 0 || ($(el).offset().left == 0 && $(el).offset().top == 0)) {
						clearInterval($('#global-tag-'+tagID).data('timer'));
						tmp_hide(); 
						return;
					}
					// monitor if moved
					if ($('#global-tag-'+tagID).data('position') != ($(el).offset().left + el.offsetWidth) + 'x' + $(el).offset().top) {
						$('#global-tag-'+tagID).css({
							'-webkit-transition': '.2s',
							'-moz-transition': '.2s',
							'-ms-transition': '.2s',
							'-o-transition': '.2s',
							left: ($(el).offset().left + el.offsetWidth) + 'px',
							top: $(el).offset().top + 'px'
						}).data('position', ($(el).offset().left + el.offsetWidth) + 'x' + $(el).offset().top);
					}
				}, 100);
				setTimeout(function () {
					if (!$(el).offset()) return;
					$('#global-tag-'+tagID).css({
						opacity: '1',
						left: ($(el).offset().left + el.offsetWidth) + 'px',
						top: $(el).offset().top + 'px'
					}).html('<div style="margin-top: -2px 0px 0px -2px; white-space: nowrap;"> <div class="bubble-tag">'+ text +'</div> </div>')
					.data('text', text)
					.data('tagID', tagID)
					.data('options', options)
					.data('position', ($(el).offset().left + el.offsetWidth) + 'x' + $(el).offset().top)
					.data('timer', timer);
					$(el).off('keypress', tmp_hide).on('keypress', tmp_hide).off('change', tmp_hide).on('change', tmp_hide)
						.css(options.css).addClass(options['class']);
					if (typeof options.onShow == 'function') options.onShow();
				}, 1);
				var originalCSS = '';
				if ($(el).length > 0) originalCSS = $(el)[0].style.cssText;
				// bind event to hide it
				function tmp_hide() { 
					if ($('#global-tag-'+tagID).length <= 0) return;
					clearInterval($('#global-tag-'+tagID).data('timer'));
					$('#global-tag-'+tagID).remove(); 
					$(el).off('keypress', tmp_hide).removeClass(options['class']); 
					if ($(el).length > 0) $(el)[0].style.cssText = originalCSS;
					if (typeof options.onHide == 'function') options.onHide();
				}
			}
		});
	}
	
	$.fn.w2overlay = function (html, options) {
		var newOverlay = false;
		if (this.length == 0 || html == '') {
			$('#w2ui-overlay').remove();
			return;
		}
		// insert overlay if it does not exist
		if ($('#w2ui-overlay').length == 0) {
			$('body').append('<div id="w2ui-overlay" class="w2ui-overlay" style="display: none;"><div></div></div>');
			newOverlay = true;
		}
		if (!$.isPlainObject(options)) options = {};
		if (!$.isPlainObject(options.css)) options.css = {};

		// init
		var obj = this;
		var div = $('#w2ui-overlay div');
		div.css(options.css).html(html);
		if (typeof options['class'] != 'undefined') div.addClass(options['class']);
		if (typeof options.top == 'undefined') options.top = 0;
		if (typeof options.left == 'undefined') options.left = 0;

		var div = $('#w2ui-overlay');
		div.css({
				display : 'block',
				left 	: ($(obj).offset().left + options.left) + 'px',
				top 	: ($(obj).offset().top + w2utils.getSize($(obj), 'height') + 3 + options.top) + 'px'
			})
			.fadeIn('fast')
			.data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight))
			.on('click', function () { div.data('ignoreClick', true); });
		if (!newOverlay) div.data('ignoreClick', true);

		// click anywhere else hides the drop down
		var hide = function () {
			if (typeof options.onHide == 'function') options.onHide();
			var div = $('#w2ui-overlay');
			if (div.data('ignoreClick') === true) {
				div.data('ignoreClick', false);
				return;
			}
			div.remove();
			$(document).off('click', hide);
		}
		// need time to display
		setTimeout(function () {
			if (newOverlay) $(document).on('click', hide);
			if (typeof options.onShow == 'function') options.onShow();
		}, 1);
	}
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2grid 	- grid widget
*		- $.w2grid		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2toolbar, w2fields
*
*   == NICE TO HAVE
* 		- global search apply types and drop downs
* 		- editable fields (list)
*
************************************************************************/

(function () {
	var w2grid = function(options) {

		// public properties
		this.name  	  			= null;
		this.box				= null; 	// HTML element that hold this element
		this.header				= '';
		this.url				= '';
		this.columns			= []; 		// { field, caption, size, attr, render, hidden, gridMinWidth, [editable: {type, inTag, outTag, style, items}] }
		this.columnGroups		= [];		// { span: int, caption: 'string', master: true/false }
		this.records			= [];		// { recid: int(requied), field1: 'value1', ... fieldN: 'valueN', style: 'string', editable: true/false, summary: true/false }
		this.searches			= [];		// { type, caption, field, inTag, outTag, default, items }
		this.searchData			= [];
		this.sortData			= [];
		this.postData			= {};
		this.toolbar			= {}; 		// if not empty object; then it is toolbar object

		this.show = {
			header			: false,
			toolbar			: false,
			footer			: false,
			columnHeaders	: true,
			lineNumbers		: false,
			expandColumn	: false,
			selectColumn	: false,
			emptyRecords	: true,
			toolbarReload	: true,
			toolbarColumns	: true,
			toolbarSearch	: true,
			toolbarAdd		: false,
			toolbarDelete 	: false,
			toolbarSave     : false
		},

		this.fixedBody			= true;		// if false; then grid grows with data
		this.fixedRecord		= true;		// if false; then record height grows with data
		this.multiSearch		= true;
		this.multiSelect		= true;
		this.multiSort			= true;
		this.keyboard			= true;		// if user clicks on the list; it will bind all events from the keyboard for that list

		this.total				= 0;		// total number of records
		this.page				= 0; 		// current page
		this.recordsPerPage		= 50;
		this.style				= '';
		this.isLoaded			= false;
		this.width				= null;		// read only
		this.height				= null;		// read only

		this.msgDelete			= 'Are you sure you want to delete selected record(s)?';
		this.msgNoData			= 'There is no data.';

		// ----- in progress
		this.layout				= 'table'; 	// can be 'table' or 'div'
		this.tmpl				= '';
		this.tmpl_start			= '';
		this.tmpl_end			= '';
		this.tmpl_group			= '';
		this.tmpl_empty			= '<div style="padding: 8px;">~msg~</div>';
		// ------

		// events
		this.onRequest			= null;		// called on any server event
		this.onLoad				= null;
		this.onAdd				= null;
		this.onDelete			= null;
		this.onSave 			= null;
		this.onSelect			= null;
		this.onUnselect 		= null;
		this.onClick 			= null;
		this.onDblClick 		= null;
		this.onSort 			= null;
		this.onSearch 			= null;
		this.onChange 			= null;		// called when editable record is changed
		this.onExpand 			= null;
		this.onRender 			= null;
		this.onRefresh 			= null;
		this.onResize 			= null;
		this.onDestroy 			= null;

		// internal
		this.recid				= null; 	// might be used by edit class to set sublists ids
		this.searchOpened		= false;
		this.last_field			= 'all';
		this.last_caption 		= 'All Fields';
		this.last_logic			= 'OR';
		this.last_search		= '';
		this.last_multi  		= false;
		this.last_scrollTop		= 0;
		this.last_scrollLeft	= 0;
		this.last_selected		= [];
		this.last_sortData		= null;
		this.last_sortCount		= 0;
		this.transition			= false;
		this.request_xhr		= null;		// jquery xhr requests

		this.isIOS = (navigator.userAgent.toLowerCase().indexOf('iphone') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipod') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipad') != -1) ? true : false;

		$.extend(true, this, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2grid = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2grid().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;
			}
			// remember items
			var columns		= method.columns;
			var columnGroups= method.columnGroups;
			var records		= method.records;
			var searches	= method.searches;
			var searchData	= method.searchData;
			var sortData	= method.sortData;
			var postData 	= method.postData;
			var toolbar		= method.toolbar;
			// extend items
			var object = new w2grid(method);
			$.extend(object, { postData: {}, records: [], columns: [], searches: [], toolbar: {}, sortData: [], searchData: [], handlers: [] });
			if (object.onExpand != null) object.show.expandColumn = true;
			$.extend(true, object.toolbar, toolbar);
			// reassign variables
			for (var p in columns)    	object.columns[p]    	= $.extend({}, columns[p]);
			for (var p in columnGroups) object.columnGroups[p] 	= $.extend({}, columnGroups[p]);
			for (var p in searches)   	object.searches[p]   	= $.extend({}, searches[p]);
			for (var p in searchData) 	object.searchData[p] 	= $.extend({}, searchData[p]);
			for (var p in sortData)    	object.sortData[p]  	= $.extend({}, sortData[p]);
			for (var p in postData)   	object.postData[p]   	= $.extend({}, postData[p]);
			// check if there are records without recid
			for (var r in records) {
				if (records[r].recid == null || typeof records[r].recid == 'undefined') {
					console.log('ERROR: Cannot add records without recid. (obj: '+ object.name +')');
					return;
				}
				object.records[r] = $.extend({}, records[r]);
			}
			if (object.records.length > 0) object.total = object.records.length;
			// init toolbar
			object.initToolbar();
			// render if necessary
			if ($(this).length != 0) {
				object.render($(this)[0]);
			}
			// register new object
			w2ui[object.name] = object;
			return object;

		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2grid');
		}
	}

	// ====================================================
	// -- Implementation of core functionality

	w2grid.prototype = {

		add: function (record) {
			if (!$.isArray(record)) record = [record];
			for (var o in record) {
				if (record[o].recid == null || typeof record[o].recid == 'undefined') {
					console.log('ERROR: Cannot add record without recid. (obj: '+ this.name +')');
					continue;
				}
				this.records.push(record[o]);
			}
			this.total = this.records.length;
			if (this.url == '') {
				this.localSearch();
				this.localSort();
			}
			this.refresh();
		},

		find: function (obj) {
			if (typeof obj == 'undefined' || obj == null) obj = {};
			var recs = [];
			for (var i=0; i<this.records.length; i++) {
				var flag = true;
				for (var o in obj) if (obj[o] != this.records[i][o]) flag = false;
				if (flag) recs.push(this.records[i].recid);
			}
			return recs;
		},

		set: function (recid, record) { // does not delete existing, but overrides on top of it
			var ind = this.getIndex(recid);
			var record;
			$.extend(this.records[ind], record);
			// refresh only that record
			var tr = $('#grid_'+ this.name +'_rec_'+recid);
			if (tr.length != 0) {
				var line = tr.attr('line');
				var j = 0;
				while (true) {
					var col = this.columns[j];
					if (col.hidden) { j++; if (typeof this.columns[j] == 'undefined') break; else continue; }
					var field = '';
					if (String(col.field).indexOf('.') > -1) {
						var tmp = String(col.field).split('.');
						field = this.records[ind][tmp[0]];
						if (typeof field == 'object' && field != null) {
							field = field[tmp[1]];
						}
					} else {
						field = this.records[ind][col.field];
					}
					if (typeof col.render != 'undefined') {
						if (typeof col.render == 'function') field = col.render.call(this, this.records[ind], ind);
						if (typeof col.render == 'object')   field = col.render[this.records[ind][col.field]];
					}
					if (field == null || typeof field == 'undefined') field = '';
					// common render functions
					if (typeof col.render == 'string') {
						switch (col.render.toLowerCase()) {
						case 'url':
							var pos = field.indexOf('/', 8);
							field = '<a href="'+ field +'" target="_blank">'+ field.substr(0, pos) +'</a>';
							break;

						case 'repeat':
							if (ind > 0 && this.records[ind][col.field] == this.records[ind-1][col.field] && this.records[ind][col.field] != '') {
								field = '-- // --';
							}
							break;
						}
					}
					$(tr).find('#grid_'+ this.name +'_cell_'+ line + '_'+ j +' > div').html(field);
					// field
					j++;
					if (typeof this.columns[j] == 'undefined') break;
				}
			}
		},

		get: function (recid) {
			for (var i=0; i<this.records.length; i++) {
				if (this.records[i].recid == recid) return this.records[i];
			}
			return null;
		},

		getIndex: function (recid) {
			for (var i=0; i<this.records.length; i++) {
				if (this.records[i].recid == recid) return i;
			}
			return null;
		},

		remove: function () {
			var removed = 0;
			for (var a in arguments) {
				for (var r = this.records.length-1; r >= 0; r--) {
					if (this.records[r].recid == arguments[a]) { this.records.splice(r, 1); removed++; }
				}
			}
			if (this.url == '') {
				this.total = this.records.length;
				this.localSearch();
				this.localSort();
			}
			this.refresh();
			return removed;
		},

		clear: function () {
			this.records = [];
			this.total   = 0;
			this.refresh();
		},

		localSort: function () {
			var obj = this;
			this.records.sort(function (a, b) {
				// summary records
				if (a.summary && b.summary) {
					if (a.recid > b.recid)  return 1;
					if (a.recid <= b.recid) return -1;
				}
				var ret = 0;
				for (var s in obj.sortData) {
					var aa = a[obj.sortData[s].field];
					var bb = b[obj.sortData[s].field];
					if (typeof aa == 'string') aa = $.trim(aa.toLowerCase());
					if (typeof bb == 'string') bb = $.trim(bb.toLowerCase());
					if (aa > bb) ret = (obj.sortData[s].direction == 'asc' ? 1 : -1);
					if (aa < bb) ret = (obj.sortData[s].direction == 'asc' ? -1 : 1);
					if (typeof aa != 'object' && typeof bb == 'object') ret = -1;
					if (typeof bb != 'object' && typeof aa == 'object') ret = 1;
					if (ret != 0) break;
				}
				return ret;
			});
			this.last_sortCount = this.records.length;
		},

		localSearch: function () {
			// local search
			var obj = this;
			this.total = this.records.length;
			// mark all records as shown
			for (var r in this.records) { this.records[r].hidden = false; }
			// hide records that did not match
			if (this.searchData.length > 0) {
				this.total = 0;
				for (var r in this.records) {
					var rec = this.records[r];
					var fl  = 0;
					for (var s in this.searches) {
						var search 	= this.searches[s];
						var sdata  	= findSearch(search.field);
						if (sdata == null) continue;
						var val1 	= String(rec[search.field]).toLowerCase();
						if (typeof sdata.value != 'undefined') {
							if (!$.isArray(sdata.value)) {
								var val2 = String(sdata.value).toLowerCase();
							} else {
								var val2 = sdata.value[0];
								var val3 = sdata.value[1];
							}
						}
						switch (sdata.operator) {
							case 'is':
								if (rec[search.field] == sdata.value) fl++; // do not hide record
								if (search.type == 'text' && val1 == val2) fl++;
								if (search.type == 'date') {
									var da = new Date(val1);
									var db = new Date(val2);
									d0 = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
									d1 = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
									if (d0 == d1) fl++;
								}
								break;
							case 'between':
								if (search.type == 'int' && parseInt(rec[search.field]) >= parseInt(val2) && parseInt(rec[search.field]) <= parseInt(val3)) fl++;
								if (search.type == 'float' && parseFloat(rec[search.field]) >= parseFloat(val2) && parseFloat(rec[search.field]) <= parseFloat(val3)) fl++;
								if (search.type == 'date') {
									var da = new Date(val1);
									var db = new Date(val2);
									var dc = new Date(val3);
									d0 = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
									d1 = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
									d2 = Date.UTC(dc.getFullYear(), dc.getMonth(), dc.getDate());
									if (d0 >= d1 && d0 <= d2) fl++;
								}
								break;
							case 'begins with':
								if (val1.indexOf(val2) == 0) fl++; // do not hide record
								break;
							case 'contains':
								if (val1.indexOf(val2) >= 0) fl++; // do not hide record
								break;
							case 'ends with':
								if (val1.indexOf(val2) == val1.length - val2.length) fl++; // do not hide record
								break;
						}
					}
					if (this.last_logic == 'OR')  rec.hidden = (fl == 0 ? true : false);
					if (this.last_logic == 'AND') rec.hidden = (fl != this.searchData.length ? true : false);
					if (rec.hidden !== true && rec.summary !== true) this.total++;
				}
			}

			function findSearch(field) {
				for (var s in obj.searchData) {
					if (obj.searchData[s].field == field) return obj.searchData[s];
				}
				return null;
			}
		},

		select: function (recid) {
			var selected = 0;
			for (var a in arguments) {
				var record = this.get(arguments[a]);
				if (record == null || record.selected === true) continue;
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: record.recid });
				if (eventData.stop === true) continue;
				// default action
				var i = this.getIndex(record.recid);
				record.selected = true;
				$('#grid_'+this.name +'_rec_'+ record.recid).addClass('w2ui-selected').data('selected', 'yes');
				$('#grid_'+ this.name +'_cell_'+ i +'_select_check').attr('checked', true);
				selected++;
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			} 
			// all selected?
			$('#grid_'+ this.name +'_check_all').attr('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').attr('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').removeAttr('checked');
			}
			return selected;
		},

		unselect: function (recid) {
			var unselected = 0;
			for (var a in arguments) {
				var record = this.get(arguments[a]);
				if (record == null || record.selected !== true) continue;
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: record.recid });
				if (eventData.stop === true) continue;
				// default action
				var i = this.getIndex(record.recid);
				record.selected = false
				$('#grid_'+this.name +'_rec_'+ record.recid).removeClass('w2ui-selected').data('selected', '');
				if ($('#grid_'+this.name +'_rec_'+ record.recid).length != 0) {
					$('#grid_'+this.name +'_rec_'+ record.recid)[0].style.cssText = $('#grid_'+this.name +'_rec_'+ record.recid).attr('custom_style');
				}
				$('#grid_'+ this.name +'_cell_'+ i +'_select_check').removeAttr('checked');
				unselected++;
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			} 
			// all selected?
			$('#grid_'+ this.name +'_check_all').attr('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').attr('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').removeAttr('checked');
			}
			return unselected;
		},

		selectAll: function () {
			if (this.multiSelect === false) return;
			for (var i=0; i<this.records.length; i++) {
				if (this.records[i].hidden === true || this.records[i].summary === true) continue; 
				this.select(this.records[i].recid);
			}
			if (this.getSelection().length > 0) this.toolbar.enable('delete-selected'); else this.toolbar.disable('delete-selected');
		},

		selectPage: function () {
			if (this.multiSelect === false) return;
			this.selectNone();
			var startWith = 0;
			if (this.url == '') { // local data
				var cnt = this.page * this.recordsPerPage;
				for (var tt=0; tt<this.records.length; tt++) {
					if (this.records[tt].hidden === true || this.records[tt].summary === true) continue; 
					cnt--;
					if (cnt < 0) { startWith = tt; break; }
				}
			}
			for (var i = startWith, ri = 0; ri < this.recordsPerPage && i < this.records.length; i++) {
				var record 	= this.records[i];
				if (!record || record.hidden === true) continue;
				ri++;
				this.select(this.records[i].recid);
			}
			if (this.getSelection().length > 0) this.toolbar.enable('delete-selected'); else this.toolbar.disable('delete-selected');
		},

		selectNone: function () {
			for (var i=0; i<this.records.length; i++) {
				if (this.records[i].selected !== true) continue;
				this.unselect(this.records[i].recid);
			}
			this.last_selected = [];
		},

		getSelection: function () {
			var recs = [];
			for (var i in this.records) {
				if (this.records[i].selected === true) {
					recs.push(this.records[i].recid);
				}
			}
			return recs;
		},

		search: function (field, value) {
			var obj 		= this;
			var searchData 	= [];
			var last_multi 	= this.last_multi;
			var last_logic 	= this.last_logic;
			var last_field 	= this.last_field;
			var last_search = this.last_search;
			// .search() - advanced search
			if (arguments.length == 0) {
				// advanced search
				for (var s in this.searches) {
					var search 	 = this.searches[s];
					var operator = $('#grid_'+ this.name + '_operator_'+s).val();
					var value1   = $('#grid_'+ this.name + '_field_'+s).val();
					var value2   = $('#grid_'+ this.name + '_field2_'+s).val();
					if ((value1 != '' && value1 != null) || (typeof value2 != 'undefined' && value2 != '')) {
						var tmp = {
							field	 : search.field,
							type	 : search.type,
							operator : operator
						}
						if (operator == 'between') {
							$.extend(tmp, { value: [value1, value2] });
						} else {
							$.extend(tmp, { value: value1 });
						}
						searchData.push(tmp);
					}
				}
				if (searchData.length > 0) {
					last_multi	= true;
					last_logic  = 'AND';
				}
			}
			// .search([ { filed, value }, { field, valu e} ]) - submit whole structure
			if (arguments.length == 1 && $.isArray(field)) {
				last_multi	= true;
				last_logic	= 'AND';
				for (var f in field) {
					var data   = field[f];
					var search = findSearch(data.field);
					if (search == null) {
						console.log('ERROR: Cannot find field "'+ data.field + '" when submitting a search.');
						continue;
					}
					var tmp = $.extend({}, data);					
					if (typeof tmp.type == 'undefined') tmp.type = search.type;
					if (typeof tmp.operator == 'undefined') {
						tmp.operator = 'is';
						if (tmp.type == 'text') tmp.operator = 'begins with';
					}
					searchData.push(tmp);
				}
			}
			// .search(field, value) - regular search
			if (arguments.length == 2) {
				last_field 	= field;
				last_search = value;
				last_multi	= false;
				last_logic	= 'OR';
				// loop through all searches and see if it applies
				if (value != '') for (var s in this.searches) {
					var search 	 = this.searches[s];
					if (search.field == field) this.last_caption = search.caption;
					if (field != 'all' && search.field == field) {
						var tmp = {
							field	 : search.field,
							type	 : search.type,
							operator : (search.type == 'text' ? 'begins with' : 'is'),
							value	 : value
						};
						searchData.push(tmp);
					}
					if (field == 'all') {
						if (search.type == 'text' || (search.type == 'int' && w2utils.isInt(value)) || (search.type == 'float' && w2utils.isFloat(value))
								|| (search.type == 'money' && w2utils.isMoney(value)) || (search.type == 'hex' && w2utils.isHex(value))
								|| (search.type == 'date' && w2utils.isDate(value)) || (search.type == 'alphaNumeric' && w2utils.isAlphaNumeric(value)) ) {
							var tmp = {
								field	 : search.field,
								type	 : search.type,
								operator : (search.type == 'text' ? 'begins with' : 'is'),
								value	 : value
							};
							searchData.push(tmp);
						}
					}
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: searchData });
			if (eventData.stop === true) return;
			// default action			
			this.searchData = eventData.searchData;
			// reset scrolling position
			this.last_field  = last_field;
			this.last_search = last_search;
			this.last_multi  = last_multi;
			this.last_logic  = last_logic;
			this.last_scrollTop		= 0;
			this.last_scrollLeft	= 0;
			this.last_selected		= [];
			// -- clear all search field
			this.searchClose();
			// apply search
			if (this.url != '') {
				this.isLoaded = false;
				this.page = 0;
				this.reload();
			} else {
				// local search
				this.localSearch();
				this.goto(0);
			}

			function findSearch(field) {
				for (var s in obj.searches) {
					if (obj.searches[s].field == field) return obj.searches[s];
				}
				return null;
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		searchOpen: function () {
			if (!this.box) return;
			if (this.searches.length == 0) return;
			var obj = this;
			// slide down
			this.searchOpened = true;
			if ($('#w2ui-global-searches').length == 0) {
				$('body').append('<div id="w2ui-global-searches" class="w2ui-reset"> <div style=""></div> </div>');
			}
			$('#w2ui-global-searches').css({
				left 	: $('#grid_'+ this.name +'_search_all').offset().left + 'px',
				top 	: ($('#grid_'+ this.name +'_search_all').offset().top
						   + w2utils.getSize($('#grid_'+ this.name +'_search_all'),  'height')
						  ) + 'px'
			}).show().data('grid-name', this.name);
			$('#w2ui-global-searches > div').html(this.getSearchesHTML())
			$('#w2ui-global-searches > div').css({
				'-webkit-transform': 'translate3d(0px, -'+ $('#w2ui-global-searches').height() +'px, 0px)',
				'-moz-transform': 'translate3d(0px, -'+ $('#w2ui-global-searches').height() +'px, 0px)',
				'-ms-transform': 'translate3d(0px, -'+ $('#w2ui-global-searches').height() +'px, 0px)',
				'-o-transform': 'translate3d(0px, -'+ $('#w2ui-global-searches').height() +'px, 0px)'
			});
			setTimeout(function () {
				$('#w2ui-global-searches > div').css({
					'-webkit-transition': '.3s',
					'-webkit-transform': 'translate3d(0px, 0px, 0px)',
					'-moz-transition': '.3s',
					'-moz-transform': 'translate3d(0px, 0px, 0px)',
					'-ms-transition': '.3s',
					'-ms-transform': 'translate3d(0px, 0px, 0px)',
					'-o-transition': '.3s',
					'-o-transform': 'translate3d(0px, 0px, 0px)'
				});
				if (obj.last_logic == 'OR') obj.searchData = [];
				obj.initSearches();
			}, 10);
			setTimeout(function () {
				$('#w2ui-global-searches').css({ 'box-shadow': '0px 2px 10px #777' });
			}, 350);
		},

		searchClose: function () {
			if (!this.box) return;
			if (this.searches.length == 0) return;
			var obj = this;
			// slide down
			this.searchOpened = false;
			$('#w2ui-global-searches').css('box-shadow', '0px 0px 0px white');
			$('#w2ui-global-searches > div').css({
				'-webkit-transform': 'translate3d(0px, -'+ $('#w2ui-global-searches').height() +'px, 0px)',
				'-moz-transform': 'translate3d(0px, -'+ $('#w2ui-global-searches').height() +'px, 0px)',
				'-ms-transform': 'translate3d(0px, -'+ $('#w2ui-global-searches').height() +'px, 0px)',
				'-o-transform': 'translate3d(0px, -'+ $('#w2ui-global-searches').height() +'px, 0px)'
			});
			setTimeout(function () {
				$('#w2ui-global-searches').hide();
				$('#w2ui-global-searches > div').html('');
			}, 300);
		},

		searchShowFields: function (el) {
			var html = '<table cellspacing="0" style="padding: 5px; font-size: 11px; font-family: verdana;">';
			for (var s = -1; s < this.searches.length; s++) {
				var search = this.searches[s];
				if (s == -1) {
					if (!this.multiSearch) continue;
					search = {
						type 	: 'text',
						field 	: 'all',
						caption : 'All Fields'
					}
				} else {
					if (this.searches[s].hidden === true) continue;
				}
				html += '<tr style="cursor: default;" class="w2ui-tb-caption"'+
					'		onmouseover="$(this).css(\'background-color\', \'#B4D5FE\'); " '+
					'		onmouseout="$(this).css(\'background-color\', \'\');" '+
					'	'+ (this.isIOS ? 'onTouchStart' : 'onClick') +'="var obj = w2ui[\''+ this.name +'\']; '+
					'		if (\''+ search.type +'\' == \'list\' || \''+ search.type +'\' == \'enum\') {'+
					'			obj.last_search = \'\';'+
					'			obj.last_item = \'\';'+
					'			$(\'#grid_'+ this.name +'_search_all\').val(\'\')'+
					'		}'+
					'		if (obj.last_search != \'\') { '+
					'			obj.search(\''+ search.field +'\', obj.last_search); '+
					'		} else { '+
					'			obj.last_field = \''+ search.field +'\'; '+
					'			obj.last_caption = \''+ search.caption +'\'; '+
					'		}'+
					'		$(\'#grid_'+ this.name +'_search_all\').attr(\'placeholder\', \''+ search.caption +'\');'+
					'		$().w2overlay();">'+
					'<td style="padding: 3px 3px 3px 6px"><input type="checkbox" tabIndex="-1" '+ (search.field == this.last_field ? 'checked' : 'disabled') +' style="margin: 3px 2px 2px 2px"></td>'+
					'<td style="padding: 3px 15px 3px 3px">'+ search.caption +'</td>'+
					'</tr>';
			}
			html += "</table>";
			$(el).w2overlay(html, { left: -15, top: 7 });
		},

		searchReset: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: [] });
			if (eventData.stop === true) return;
			// default action
			this.searchData  	= [];
			this.last_search 	= '';
			this.last_logic		= 'OR';
			if (this.last_multi) {
				if (!this.multiSearch) {
					this.last_field 	= this.searches[0].field;
					this.last_caption 	= this.searches[0].caption;
				} else {
					this.last_field  	= 'all';
					this.last_caption 	= 'All Fields';
				}
			}
			this.last_multi	= false;
			// reset scrolling position
			this.last_scrollTop		= 0;
			this.last_scrollLeft	= 0;
			this.last_selected		= [];
			// reset on screen
			$('#grid_'+ this.name +'_search_all').attr('placeholder', this.last_caption);
			$('#w2ui-global-searches *[rel=search]').val(null);
			// -- clear all search field
			this.searchClose();
			$('#grid_'+ this.name +'_search_all').attr('placeholder', this.last_caption);
			$('#w2ui-global-searches *[rel=search]').val(null);
			// apply search
			if (this.url != '') {
				this.isLoaded = false;
				this.page = 0;
				this.reload();
			} else {
				// local search
				this.localSearch();
				this.goto(0);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		goto: function (newPage) {
			var totalPages = Math.floor(this.total / this.recordsPerPage);
			if (this.total % this.recordsPerPage != 0 || totalPages == 0) totalPages++;
			if (totalPages < 1) totalPages = 1;
			if (newPage < 0) newPage = 0;
			if (newPage >= totalPages) newPage = totalPages - 1;
			// reset scrolling position
			this.last_scrollTop		= 0;
			this.last_scrollLeft	= 0;
			this.last_selected		= [];
			// refresh items
			this.isLoaded = false;
			this.page = newPage;
			this.reload();
		},

		load: function (url, callBack) {
			if (typeof url == 'undefined') {
				console.log('ERROR: You need to provide url argument when calling .load() method of "'+ this.name +'" object.');
				return;
			}
			// default action
			this.isLoaded = false;
			this.request('get-records', {}, url, callBack);
		},

		reload: function (callBack) {
			if (this.url != '') {
				//this.clear();
				this.isLoaded = false;
				this.request('get-records', {}, null, callBack);
			} else {
				this.isLoaded = true;
				this.refresh();
			}
		},

		reset: function() {
			// move to first page
			this.page 	= 0;
			this.width	= null;
			this.height = null;
			this.isLoaded = false;
			// reset last remembered state
			this.searchOpened		= false;
			this.searchData			= [];
			this.last_search		= '';
			this.last_field			= 'all';
			this.last_caption 		= 'All Fields';
			this.last_logic			= 'OR';
			this.last_scrollTop		= 0;
			this.last_scrollLeft	= 0;
			this.last_selected		= [];
			this.last_sortCount		= 0;
			// initial search panel
			if (this.last_sortData != null ) this.sortData	 = this.last_sortData;
			// select none without refresh
			for (var i=0; i<this.records.length; i++) {
				this.records[i].selected = false;
				this.records[i].hidden	 = false;
			}
			// refresh
			this.refresh();
		},

		request: function (cmd, add_params, url, callBack) {
			if (typeof add_params == 'undefined') add_params = {};
			if (typeof url == 'undefined' || url == '' || url == null) url = this.url;
			if (url == '' || url == null) return;
			// build parameters list
			var params = {};
			// add list params
			params['cmd']  	 		= cmd;
			params['name'] 	 		= this.name;
			params['limit']  		= this.recordsPerPage;
			params['offset'] 		= this.page * this.recordsPerPage;
			params['selected'] 		= this.getSelection();
			params['search']  		= this.searchData;
			params['search-logic'] 	= this.last_logic;
			params['sort'] 	  		= (this.sortData.length != 0 ? this.sortData : '');
			// if there is a recid (some some edit connections)
			if (this.recid != null) params['recid'] = this.recid;
			// append other params
			$.extend(params, this.postData);
			$.extend(params, add_params);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, url: url, postData: params, cmd: cmd });
			if (eventData.stop === true) { if (typeof callBack == 'function') callBack(); return false; }
			// default action
			if (cmd == 'get-records') this.records = [];
			// call server to get data
			var obj = this;
			this.showStatus('Refreshing ');
			if (this.request_xhr) try { this.request_xhr.abort(); } catch (e) {};
			this.request_xhr = $.ajax({
				type		: 'POST',
				url			: url + (url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.hideStatus();
					obj.isLoaded = true;
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'load', data: xhr.responseText , xhr: xhr, status: status });
					if (eventData.stop === true) {
						if (typeof callBack == 'function') callBack();
						return false;
					}
					// default action
					if (typeof eventData.data != 'undefined' && eventData.data != '') {
						var data = 'data = '+ eventData.data; 	// $.parseJSON or $.getJSON did not work because it expect perfect JSON data
						var data = eval(data);					//  where everything is in double quotes
						if (typeof data['status'] != 'undefined' && data['status'] != 'success') {
							if (xhr['status'] == 403) {
								document.location = 'login.html'
								return;
							}
							// need a time out because message might be already up
							setTimeout(function () {
								$().w2popup('open', {
									width 	: 400,
									height 	: 180,
									showMax : false,
									title 	: 'Error',
									body 	: '<div style="padding: 15px 5px; text-align: center;">'+ data['message'] +'</div>',
									buttons : '<input type="button" value="Ok" onclick="$().w2popup(\'close\');" style="width: 60px; margin-right: 5px;">'
								});
							}, 300);
						} else {
							if (cmd == 'get-records') $.extend(obj, data);
							if (cmd == 'delete-records') { obj.reload(); return; }
						}
					}
					// event after
					if (obj.url == '') {
						obj.localSearch();
						obj.localSort();
					}
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.refresh();
					// call back
					if (typeof callBack == 'function') callBack();
				}
			});
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getChanged: function () {
			// build new edits
			var saveData = [];
			var flag = false;
			for (var i=0; i<this.records.length; i++) {
				var record 	= this.records[i];
				var tmp 	= {};
				for (var j=0; j<this.columns.length; j++) {
					var col = this.columns[j];
					if (col.hidden || col.field == 'recid' || $('#grid_'+ this.name +'_edit_'+ i +'_'+ j).length == 0) continue;
					var newValue = $('#grid_'+ this.name +'_edit_'+ i +'_'+ j).val();
					var oldValue = record[col.field];
					if (typeof oldValue == 'undefined') oldValue = '';
					if (newValue != oldValue) {
						flag = true;
						tmp[col.field] = newValue;
					}
				}
				if (!$.isEmptyObject(tmp)) {
					saveData.push($.extend({}, { recid: this.records[i].recid }, tmp));
				}
			}
			return saveData;
		},

		// ===================================================
		// --  Action Handlers

		doAdd: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'add', recid: null });
			if (eventData.stop === true) return false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		doSave: function () {
			var changed = this.getChanged();
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'save', changed: changed });
			if (eventData.stop === true) return false;
			if (this.url != '') {
				this.request('save-records', { 'changed' : changed }, null, function () {
					// event after
					this.trigger($.extend(eventData, { phase: 'after' }));
				});
			} else {
				for (var c in changed) {
					var record = this.get(changed[c].recid);
					for (var s in changed[c]) {
						if (s == 'recid') continue;
						record[s] = changed[c][s];
					}
				}
				$('#grid_'+ this.name + ' .w2ui-editable').removeClass('changed');
				this.selectNone();
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		doEdit: function (type, el, event) {
			var recid  = $(el).attr('recid');
			var record = this.get(recid);
			if (!record.selected) {
				this.selectNone();
				this.select(recid);
			}

			switch (type) {
				case 'click':
					event.stopPropagation();
					event.preventDefault();
					break;
				case 'focus':
					$(el).addClass('active');
					break;
				case 'blur':
					$(el).removeClass('active');
					var oldValue = record[$(el).attr('field')];
					if (typeof oldValue == 'undefined') oldValue = '';
					if ($(el).val() != oldValue) {
						var eventData = this.trigger({ phase: 'before', type: 'change', target: el.id, recid: recid });
						if (eventData.stop === true) return false;
						$(el).addClass('changed');
						this.trigger($.extend(eventData, { phase: 'after' }));
					} else {
						$(el).removeClass('changed');
					}
					break;
				case 'keyup':
					if ($(el).data('stop') === true) {
						$(el).data('stop', false);
						break;
					}
					if (event.keyCode == 40 || event.keyCode == 13) {
						var newEl = $('#grid_'+ this.name + '_edit_'+ (parseInt($(el).attr('line')) + 1) +'_'+ $(el).attr('column'));
						if (newEl.length > 0) {
							newEl[0].select();
							newEl[0].focus();
						}
					}
					if (event.keyCode == 38) {
						var newEl = $('#grid_'+ this.name + '_edit_'+ (parseInt($(el).attr('line')) - 1) +'_'+ $(el).attr('column'));
						if (newEl.length > 0) {
							newEl[0].select();
							newEl[0].focus();
						}
					}
					break;
			}
		},

		doDelete: function (force) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'delete' });
			if (eventData.stop === true) return false;
			// default action
			var recs = this.getSelection();
			if (recs.length == 0) return;
			if (this.msgDelete != '' && !force) {
				$().w2popup({
					width 	: 400,
					height 	: 160,
					showMax : false,
					title 	: 'Delete Confirmation',
					body 	: '<div style="padding: 20px 5px; text-align: center;">'+ this.msgDelete +'</div>',
					buttons : '<input type="button" value="No" onclick="$().w2popup(\'close\');" style="width: 60px; margin-right: 5px;">'+
							  '<input type="button" value="Yes" onclick="w2ui[\''+ this.name +'\'].doDelete(true); $().w2popup(\'close\');" style="width: 60px;">'
				});
				return;
			}
			// call delete script
			if (this.url != '') {
				this.request('delete-records');
			} else {
				this.remove.apply(this, recs);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		doClick: function (recid, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'click', recid: recid, event: event });
			if (eventData.stop === true) return false;
			// default action
			$('#grid_'+ this.name +'_check_all').removeAttr('checked');
			if (this.searchOpened) this.searchClose(); // hide search if it is open
			var record = this.get(recid);
			if (record) var tmp_previous = record.selected;
			// clear other if necessary
			if (((!event.ctrlKey && !event.shiftKey && !event.metaKey) || !this.multiSelect) && !this.showSelectColumn) {
				this.selectNone();
			} else {
				window.setTimeout("var doc = w2ui['"+ this.name +"'].box.ownerDocument; if (doc.selection) doc.selection.empty(); "+
					"else doc.defaultView.getSelection().removeAllRanges();", 10);
			}
			if (event.shiftKey) {
				var cnt = 0;
				var firsti = null;
				for (var i=0; i<this.records.length; i++) { if (this.records[i].selected) { cnt++; if (!firsti) firsti = i; } }
				if (cnt >  1) {
					this.selectNone();
				}
				if (cnt == 1) {
					var ind = this.getIndex(recid);
					if (ind > firsti) {
						for (var i=firsti; i<=ind; i++) { this.select(this.records[i].recid); }
					} else {
						for (var i=ind; i<=firsti; i++) { this.select(this.records[i].recid); }
					}
					this.trigger($.extend(eventData, { phase: 'after' }));
					// remember last selected
					this.last_selected	 = this.getSelection();
					return;
				}
			}
			// select or unselect
			if (this.showSelectColumn && record.selected) {
				this.unselect(record.recid);
			} else if ((record && !tmp_previous) || event.ctrlKey || event.metaKey) {
				if (record.selected === true) this.unselect(record.recid); else this.select(record.recid);
			}
			// bind up/down arrows
			if (this.keyboard) {
				// enclose some vars
				var that = this;
				var grid_keydown = function (event) {
					var obj = that;
					if (event.target.tagName.toLowerCase() == 'body') {
						if (event.keyCode == 65 && (event.metaKey || event.ctrlKey)) {
							obj.selectPage();
							event.preventDefault();
						}
						if (event.keyCode == 8) {
							obj.doDelete();
							event.preventDefault();
						}
						var sel = obj.getSelection();
						if (sel.length == 1) {
							var recid = sel[0];
							var ind   = obj.getIndex(recid);
							var sTop    = parseInt($('#grid_'+ obj.name +'_records').prop('scrollTop'));
							var sHeight = parseInt($('#grid_'+ obj.name +'_records').height());
							if (event.keyCode == 38) { // up
								if (ind > 0) {
									ind--;
									while (ind > 0 && obj.records[ind].hidden === true) ind--;
									obj.selectNone();
									obj.doClick(obj.records[ind].recid, event);
									// scroll into view
									var rTop 	= parseInt($('#grid_'+ obj.name +'_rec_'+ obj.records[ind].recid)[0].offsetTop);
									var rHeight = parseInt($('#grid_'+ obj.name +'_rec_'+ obj.records[ind].recid).height());
									if (rTop < sTop) {
										$('#grid_'+ obj.name +'_records').prop('scrollTop', rTop - rHeight * 0.7);
										obj.last_scrollTop = $('#grid_'+ obj.name +'_records').prop('scrollTop');
									}
								}
								event.preventDefault();
							}
							if (event.keyCode == 40) { // down
								if (ind + 1 < obj.records.length) {
									ind++;
									while (ind + 1 < obj.records.length && obj.records[ind].hidden === true) ind++;
									obj.selectNone();
									obj.doClick(obj.records[ind].recid, event);
									// scroll into view
									var rTop 	= parseInt($('#grid_'+ obj.name +'_rec_'+ obj.records[ind].recid)[0].offsetTop);
									var rHeight = parseInt($('#grid_'+ obj.name +'_rec_'+ obj.records[ind].recid).height());
									if (rTop + rHeight > sHeight + sTop) {
										$('#grid_'+ obj.name +'_records').prop('scrollTop', -(sHeight - rTop - rHeight) + rHeight * 0.7);
										obj.last_scrollTop = $('#grid_'+ obj.name +'_records').prop('scrollTop');
									}
								}
								event.preventDefault();
							}
						}
					}
				}
				$(window).off('keydown').on('keydown', grid_keydown);
			}
			if (this.getSelection().length > 0) this.toolbar.enable('delete-selected'); else this.toolbar.disable('delete-selected');
			// remember last selected
			this.last_selected	 = this.getSelection();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		doDblClick: function (recid, event) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'dblClick', recid: recid, event: event });
			if (eventData.stop === true) return false;
			// default action
			var record = this.get(recid);
			clearTimeout(this._click_timer);
			// make sure it is selected
			this.selectNone();
			this.select(recid);
			// remember last scroll if any
			this.last_selected	 = this.getSelection();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		doExpand: function (recid) {
			var expanded = $('#grid_'+this.name +'_rec_'+ recid).attr('expanded');
			if (expanded != 'yes') {
				var tmp = 1 + (this.show.lineNumbers ? 1 : 0) + (this.show.selectColumn ? 1 : 0);
				var addClass = ($('#grid_'+this.name +'_rec_'+ recid).hasClass('w2ui-odd') ? 'w2ui-odd' : 'w2ui-even');
				$('#grid_'+this.name +'_rec_'+ recid).after(
						'<tr id="grid_'+this.name +'_rec_'+ recid +'_expaned_row" style="display: none" class="'+ addClass +'">'+
						'<td class="w2ui-grid-data" colspan="'+ tmp +'"></td>'+
						'<td colspan="100" class="w2ui-subgrid"><div id="grid_'+ this.name +'_rec_'+ recid +'_expaned" style="height: auto;">&nbsp;</div></td>'+
						'</tr>');
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: recid,
										   expanded: (expanded == 'yes' ? true : false), box_id: 'grid_'+ this.name +'_rec_'+ recid +'_expaned' });
			if (eventData.stop === true) { 	$('#grid_'+this.name +'_rec_'+ recid +'_expaned_row').remove(); return false; }
			// default action
			if (expanded == 'yes') {
				$('#grid_'+this.name +'_rec_'+ recid).attr('expanded', '');
				$('#grid_'+this.name +'_rec_'+ recid +'_expaned_row').remove();
				$('#grid_'+this.name +'_cell_'+ this.getIndex(recid) +'_expand div').html('+');
			} else {
				$('#grid_'+this.name +'_rec_'+ recid).attr('expanded', 'yes')
				$('#grid_'+this.name +'_cell_'+ this.getIndex(recid) +'_expand div').html('-');
				$('#grid_'+this.name +'_rec_'+ recid +'_expaned_row').show();
			}
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize();
		},

		doSort: function (field, direction, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'sort', target: this.name, field: field, direction: direction, event: event });
			if (eventData.stop === true) return false;
			// check if needed to quit
			if (typeof field == 'undefined') {
				this.trigger($.extend(eventData, { phase: 'after' }));
				return;
			}
			// default action
			var sortIndex = this.sortData.length;
			for (var s in this.sortData) {
				if (this.sortData[s].field == field) { sortIndex = s; break; }
			}
			if (typeof direction == 'undefined' || direction == null) {
				if (typeof this.sortData[sortIndex] == 'undefined') {
					direction = 'asc';
				} else {
					switch (String(this.sortData[sortIndex].direction)) {
						case 'asc'	: direction = 'desc'; break;
						case 'desc'	: direction = '';  break;
						default		: direction = 'asc';  break;
					}
				}
			}
			if (this.multiSort === false) { this.sortData = []; sortIndex = 0; }
			if (!event.ctrlKey && !event.metaKey) { this.sortData = []; sortIndex = 0; }
			// set new sort
			if (typeof this.sortData[sortIndex] == 'undefined') this.sortData[sortIndex] = {};
			this.sortData[sortIndex].field 	   = field;
			this.sortData[sortIndex].direction = direction;
			// if local
			if (this.url == '') this.localSort();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.reload();
		},

		// ==================================================
		// --- Common functions

		resize: function (width, height) {
			var tmp_time = (new Date()).getTime();
			var obj = this;
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// make sure render records w2name
			if (!this.box || $(this.box).data('w2name') != this.name) return;
			// determine new width and height
			this.width  = typeof width != 'undefined' && width != null ? parseInt(width) : $(this.box).width();
			this.height = typeof height != 'undefined' && height != null ? parseInt(height) : $(this.box).height();
			$(this.box).width(width).height(height);
			// if blank
			if (this.width == 0 || this.height == 0) return;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, width: this.width, height: this.height });
			if (eventData.stop === true) return false;
			obj.resizeBoxes(); obj.resizeRecords();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		refresh: function () {
			var obj = this;
			var tmp_time = (new Date()).getTime();

			// if over the max page, then go to page 1
			var totalPages = Math.floor(this.total / this.recordsPerPage);
			if (this.total % this.recordsPerPage != 0 || totalPages == 0) totalPages++;
			if (this.page > 0 && this.page > totalPages-1) this.goto(0);

			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh' });
			if (eventData.stop === true) return false;
			// -- advanced search - hide it
			if (this.searchOpened) this.searchClose();
			// -- header
			if (this.show.header) {
				$('#grid_'+ this.name +'_header').html(this.header +'&nbsp;').show();
			} else {
				$('#grid_'+ this.name +'_header').hide();
			}
			// -- toolbar
			if (this.show.toolbar) {
				$('#grid_'+ this.name +'_toolbar').show();
				// refresh toolbar only once
				if (typeof this.toolbar == 'object') {
					this.toolbar.refresh();
					$('#grid_'+ this.name +'_search_all').val(this.last_search);
				}
			} else {
				$('#grid_'+ this.name +'_toolbar').hide();
			}

			// search placeholder
			if (this.searches.length == 0) this.last_field = 'No Search Fields';
			if (!this.multiSearch && this.last_field == 'all') {
				this.last_field 	= this.searches[0].field;
				this.last_caption 	= this.searches[0].caption;
			}
			for (var s in this.searches) {
				if (this.searches[s].field == this.last_field) this.last_caption = this.searches[s].caption;
			}
			if (this.last_multi) {
				$('#grid_'+ this.name +'_search_all').attr('placeholder', 'Multi Fields');
			} else {
				$('#grid_'+ this.name +'_search_all').attr('placeholder', this.last_caption);
			}

			// focus search if last searched
			if (this._focus_when_refreshed === true) {
				setTimeout(function () {
					var s = $('#grid_'+ obj.name +'_search_all');
					if (s.length > 0) s[0].focus();
					setTimeout(function () { delete obj._focus_when_refreshed; }, 500);
				}, 10);
			}

			// -- body
			var bodyHTML = '';
			if (this.layout == 'table') {
			   bodyHTML +=  '<div id="grid_'+ this.name +'_records" class="w2ui-grid-records" style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px;" '+
							'	onscroll="var obj = w2ui[\''+ this.name + '\']; obj.last_scrollTop = this.scrollTop; obj.last_scrollLeft = this.scrollLeft; '+
							'		$(\'#grid_'+ this.name +'_columns\')[0].scrollLeft = this.scrollLeft">'+
							'<table cellpadding="0" cellspacing="0" style="table-layout: fixed;">'+
								this.getRecordsHTML() +
							'</table>'+
							'</div>'+
							'<div id="grid_'+ this.name +'_columns" class="w2ui-grid-columns" style="overflow: hidden; position: absolute; left: 0px; top: 0px; right: 0px;">'+
							'<table cellpadding="0" cellspacing="0" style="table-layout: fixed; height: auto;">'+
								this.getColumnsHTML() +
							'</table>'+
							'</div>'; // Columns need to be after to be able to overlap
			}
			if (this.layout == 'div') {
			   bodyHTML += '<div id="grid_'+ this.name +'_body">'+
								this.tmpl_start +
								this.getColumnsHTML() +
								this.getRecordsHTML() +
								this.tmpl_end +
						   '</div>';
			}
			$('#grid_'+ this.name +'_body').html(bodyHTML);
			// init editable
			$('#grid_'+ this.name + '_records .w2ui-editable').each(function (index, el) {
				var column = obj.columns[$(el).attr('column')];
				$(el).w2field(column.editable);
			});

			// -- summary
			if (this.summary != '') {
				$('#grid_'+ this.name +'_summary').html(this.summary).show();
			} else {
				$('#grid_'+ this.name +'_summary').hide();
			}

			// -- footer
			if (this.show.footer) {
				var pages = this.getFooterHTML();
				var last = (this.page * this.recordsPerPage + this.recordsPerPage);
				if (last > this.total) last = this.total;
				var pageCountDsp = (this.page * this.recordsPerPage + 1) +'-'+ last +' of '+ this.total;
				if (this.page == 0 && this.total == 0) pageCountDsp = '0-0 of 0';
				$('#grid_'+ this.name +'_footerR').html(pageCountDsp);
				$('#grid_'+ this.name +'_footerC').html(pages);
				$('#grid_'+ this.name +'_footer').show();
			} else {
				$('#grid_'+ this.name +'_footer').hide();
			}
			// select last selected record
			if (this.last_selected.length > 0) for (var s in this.last_selected) {
				if (this.get(this.last_selected[s]) != null) {
					this.select(this.get(this.last_selected[s]).recid);
				}
			}
			// show/hide clear search link
 			if (this.searchData.length > 0) {
				$('#grid_'+ this.name +'_searchClear').show();
			} else {
				$('#grid_'+ this.name +'_searchClear').hide();
			}
			// all selected?
			$('#grid_'+ this.name +'_check_all').attr('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').attr('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').removeAttr('checked');
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize(null, null, true);
		},

		render: function (box) {
			var tmp_time = (new Date()).getTime();

			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (typeof box != 'undefined' && box != null) {
				$(this.box).html('');
				this.box = box;
			}
			if (!this.box) return;
			$('#w2ui-global-searches').remove(); // show searches from previous grid
			if (this.last_sortData == null) this.last_sortData = this.sortData;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: box });
			if (eventData.stop === true) return false;
			// insert Elements
			$(this.box).data('w2name', this.name).html(
				'<div id="grid_'+ this.name +'" class="w2ui-reset w2ui-grid" style="position: absolute; overflow: hidden; '+ this.style +'">'+
				'	<div id="grid_'+ this.name +'_header" class="w2ui-grid-header" style="position: absolute; '+ (!this.show.header ? 'display: none;' : '') +'"></div>'+
				'	<div id="grid_'+ this.name +'_toolbar" class="w2ui-grid-toolbar" style="position: absolute; '+ (!this.show.toolbar ? 'display: none;' : '') +'"></div>'+
				'	<div id="grid_'+ this.name +'_body" class="w2ui-grid-body" style="position: absolute; overflow: hidden;"></div>'+
				'	<div id="grid_'+ this.name +'_summary" class="w2ui-grid-body w2ui-grid-summary" style="position: absolute; '+ (this._summary == ''  ? 'display: none;' : '') +'">sum</div>'+
				'	<div id="grid_'+ this.name +'_footer" class="w2ui-grid-footer" style="position: absolute; '+ (!this.show.footer ? 'display: none;' : '') +'"></div>'+
				'</div>');
			// init toolbar
			this.initToolbar();
			if (this.toolbar != null) this.toolbar.render($('#grid_'+ this.name +'_toolbar')[0]);
			// init footer
			$('#grid_'+ this.name +'_footer').html(
				'<div style="width: 100%; height: 24px;">'+
				'	<div id="grid_'+ this.name +'_footerL" style="float: left;"></div>'+
				'	<div id="grid_'+ this.name +'_footerR" style="float: right;"></div>'+
				'	<div id="grid_'+ this.name +'_footerC" style="text-align: center;"></div>'+
				'</div>');
			// refresh

			this.refresh();
			this.reload();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// attach to resize event
			var obj = this;
			$(window).bind('resize', function (event) {
				w2ui[obj.name].resize();
			});
			setTimeout(function () { obj.resize(); }, 150); // need timer because resize is on timer
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });
			if (eventData.stop === true) return false;
			// clean up
			if (typeof this.toolbar == 'object' && this.toolbar.destroy) this.toolbar.destroy();
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		// ===========================================
		// --- Internal Functions

		initToolbar: function () {
			// -- if toolbar is true
			if (typeof this.toolbar['render'] == 'undefined') {
				var tmp_items = this.toolbar.items;
				this.toolbar.items = [];
				this.toolbar = $().w2toolbar($.extend(true, {}, this.toolbar, { name: this.name +'_toolbar', owner: this }));

				// =============================================
				// ------ Toolbar Generic buttons

				if (this.show.toolbarReload) {
					this.toolbar.items.push({ type: 'button', id: 'refresh', img: 'icon-reload', hint: 'Reload data in the list' });
				}
				if (this.show.toolbarColumns) {
					var col_html = "<table cellspacing=\"0\" style=\"padding: 5px 0px;\">";
					for (var c in this.columns) {
						col_html += "<tr style=\"cursor: default;\" "+
							"	onmouseover=\"$(this).addClass('w2ui-selected');\" onmouseout=\"$(this).removeClass('w2ui-selected');\">"+
							"<td style='padding: 3px 3px 3px 6px'>"+
							"	<input id=\"grid_"+ this.name +"_column_"+ c +"_check\" type=\"checkbox\" style=\"margin: 3px 2px 2px 2px\" tabIndex=\"-1\""+
							"	onclick=\"var obj = w2ui['"+ this.name +"']; "+
							"			  var col = obj.columns['"+ c +"']; "+
							"			  if (this.checked) {  "+
							"				delete col.gridMinWidth; "+
							"				delete col.hidden; "+
							"			  } else { "+
							"				delete col.gridMinWidth; "+
							"				col.hidden = true; "+
							"			  } "+
							"			  obj.refresh(); event.stopPropagation(); \">"+
							"</td>"+
							"<td style='padding: 3px 10px 3px 3px'><label style=\"display: block;\" for=\"grid_"+ this.name +"_column_"+ c +"_check\">"+
								(this.columns[c].caption == '' ? '- column '+ (c+1) +' -' : this.columns[c].caption) +"</label></td>"+
							"</tr>";
					}
					col_html += "</table>";
					this.toolbar.items.push({ type: 'drop', id: 'select-columns', img: 'icon-columns', hint: 'Show/hide columns', arrow: false, html: col_html });
				}
				if (this.show.toolbarReload || this.show.toolbarColumn) {
					this.toolbar.items.push({ type: 'break', id: 'break0' });
				}
				if (this.show.toolbarSearch) {
					var html =
						'<table cellpadding="0" cellspacing="0" style="margin-top: -2px"><tr>'+
						'	<td>'+
						'		<div class="w2ui-icon icon-search-down w2ui-search-down" title="Select Search Field" '+ 
									(this.isIOS ? 'onTouchStart' : 'onClick') +'="var obj = w2ui[\''+ this.name +'\']; obj.searchShowFields(this);"></div>'+
						'	</td>'+
						'	<td>'+
						'		<input id="grid_'+ this.name +'_search_all" class="w2ui-search-all" '+
						'			placeholder="'+ this.last_caption +'" value="'+ this.last_search +'"'+
						'			onkeyup="if (event.keyCode == 13) w2ui[\''+ this.name +'\'].search(w2ui[\''+ this.name +'\'].last_field, this.value); '+
						'					  w2ui[\''+ this.name +'\']._focus_when_refreshed = true;">'+
						'	</td>'+
						'	<td>'+
						'		<div title="Clear Search" class="w2ui-search-clear" id="grid_'+ this.name +'_searchClear"  '+
						'			 onclick="var obj = w2ui[\''+ this.name +'\']; obj.searchReset();" '+
						'		>&nbsp;&nbsp;</div>'+
						'	</td>'+
						'</tr></table>';
					this.toolbar.items.push({ type: 'html',   id: 'search', html: html });
					if (this.multiSearch && this.searches.length > 0) {
						this.toolbar.items.push({ type: 'button', id: 'search-advanced', caption: 'Search...', hint: 'Open Search Fields' });
					}
				}
				if (this.show.toolbarAdd || this.show.toolbarDelete || this.show.toolbarSave) {
					this.toolbar.items.push({ type: 'break', id: 'break1' });
				}
				if (this.show.toolbarAdd) {
					this.toolbar.items.push({ type: 'button', id: 'add', caption: 'Add New', hint: 'Add new record', img: 'icon-add' });
				}
				if (this.show.toolbarDelete) {
					this.toolbar.items.push({ type: 'button', id: 'delete-selected', caption: 'Delete', hint: 'Delete selected records', img: 'icon-delete', disabled: true });
				}
				if (this.show.toolbarSave) {
					if (this.show.toolbarAdd || this.show.toolbarDelete ) {
						this.toolbar.items.push({ type: 'break', id: 'break2' });
					}
					this.toolbar.items.push({ type: 'button', id: 'save-changed', caption: 'Save', hint: 'Save changed records', img: 'icon-save' });
				}
				// add original buttons
				for (var i in tmp_items) this.toolbar.items.push(tmp_items[i]);

				// =============================================
				// ------ Toolbar onClick processing

				var obj = this;
				this.toolbar.on('click', function (id, choice) {
					switch (id) {
						case 'refresh':
							obj.reload();
							break;
						case 'select-columns':
							for (var c in obj.columns) {
								if (obj.columns[c].hidden) {
									$("#grid_"+ obj.name +"_column_"+ c + "_check").removeAttr('checked');
								} else {
									$("#grid_"+ obj.name +"_column_"+ c + "_check").attr('checked', true);
								}
							}
							// restore sizes
							for (var c in obj.columns) {
								if (typeof obj.columns[c].sizeOriginal != 'undefined') {
									obj.columns[c].size = obj.columns[c].sizeOriginal;
								}
							}
							obj.initResize();
							obj.resize();
							break;
						case 'add':
							obj.doAdd();
							break;
						case 'search-advanced':
							if (!obj.searchOpened) obj.searchOpen();
							break;
						case 'add-new':
							obj.doAdd();
							break;
						case 'delete-selected':
							obj.doDelete();
							break;
						case 'save-changed':
							obj.doSave();
							break;
						default:
							if (id.substr(0, 7) == 'choice-' && typeof choice != 'object') { // this is done for choices
								obj.toolbar.set(id, { caption: obj.toolbar.get(id).prepend + choice })
								if (typeof obj.toolbar.get(id).param == 'function') {
									obj.toolbar.get(id).param(id, choice);
								}
								if (typeof obj.toolbar.get(id).onClick == 'function') {
									obj.toolbar.get(id).onClick(id, choice);
								}
							}
							break;
					}
				});
			}
			return;
		},

		initSearches: function () {
			var obj = this;
			// init searches
			for (var s in this.searches) {
				var search = this.searches[s];
				var sdata  = findSearch(search.field);
				// init types
				switch (search.type) {
					case 'alphaNumeric':
					case 'text':
						$('#grid_'+ this.name +'_operator_'+s).val('begins with');
						break;

					case 'int':
					case 'float':
					case 'hex':
					case 'money':
					case 'date':
						$('#grid_'+ this.name +'_field_'+s).w2field(search.type);
						$('#grid_'+ this.name +'_field2_'+s).w2field(search.type);
						break;

					case 'list':
						// build options
						var options = '<option value="">--</option>';
						for (var i in search.items) {
							if ($.isPlainObject(search.items[i])) {
								var val = search.items[i].id;
								var txt = search.items[i].text;
								if (typeof val == 'undefined' && typeof search.items[i].value != 'undefined')   val = search.items[i].value;
								if (typeof txt == 'undefined' && typeof search.items[i].caption != 'undefined') txt = search.items[i].caption;
								if (val == null) val = '';
								options += '<option value="'+ val +'">'+ txt +'</option>';
							} else {
								options += '<option value="'+ search.items[i] +'">'+ search.items[i] +'</option>';
							}
						}
						$('#grid_'+ this.name +'_field_'+s).html(options);
						break;
				}
				if (sdata != null) {
					$('#grid_'+ this.name +'_operator_'+ s).val(sdata.operator).trigger('change');
					if (!$.isArray(sdata.value)) {
						if (typeof sdata.value != 'udefined') $('#grid_'+ this.name +'_field_'+ s).val(sdata.value).trigger('change');						
					} else {
						$('#grid_'+ this.name +'_field_'+ s).val(sdata.value[0]).trigger('change');
						$('#grid_'+ this.name +'_field2_'+ s).val(sdata.value[1]).trigger('change');
					}
				}
			}
			// add on change event
			$('#w2ui-global-searches *[rel=search]').on('keypress', function (evnt) {
				if (evnt.keyCode == 13) obj.search();
			});

			function findSearch(field) {
				for (var s in obj.searchData) {
					if (obj.searchData[s].field == field) return obj.searchData[s];
				}
				return null;
			}
		},

		initResize: function () {
			var obj = this;
			//if (obj.resizing === true) return;
			$('#grid_'+ this.name + ' .w2ui-resizer')
				.off('mousedown')
				.off('click')
				.each(function (index, el) {
					var td  = $(el).parent();
					$(el).css({
						"height" 		: td.height(),
						"margin-top" 	: '-' + td.height() + 'px',
						"margin-left" 	: (td.width() - 6) + 'px'
					})
				})
				.on('mousedown', function (event) {
					if (!event) event = window.event;
					if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
					obj.resizing = true;
					obj.tmp_x = event.screenX;
					obj.tmp_y = event.screenY;
					obj.tmp_col = $(this).attr('name');
					event.stopPropagation();
					event.preventDefault();
					// fix sizes
					for (var c in obj.columns) {
						if (typeof obj.columns[c].sizeOriginal == 'undefined') obj.columns[c].sizeOriginal = obj.columns[c].size;
						obj.columns[c].size = obj.columns[c].sizeCalculated;
					}
					// set move event
					var mouseMove = function (event) {
						if (obj.resizing != true) return;
						if (!event) event = window.event;
						obj.tmp_div_x = (event.screenX - obj.tmp_x);
						obj.tmp_div_y = (event.screenY - obj.tmp_y);
						obj.columns[obj.tmp_col].size = (parseInt(obj.columns[obj.tmp_col].size) + obj.tmp_div_x) + 'px';
						//console.log(obj.columns[obj.tmp_col]);
						obj.resizeRecords();
						// reset
						obj.tmp_x = event.screenX;
						obj.tmp_y = event.screenY;
					}
					var mouseUp = function (event) {
						delete obj.resizing;
						$(window).off('mousemove', mouseMove);
						$(window).off('mouseup', mouseUp);
						obj.resizeRecords();
					}
					$(window).on('mousemove', mouseMove);
					$(window).on('mouseup', mouseUp);
				})
				.on('click', function (event) { event.stopPropagation(); event.preventDefault; });
		},

		resizeBoxes: function () {
			// elements
			var main 		= $('#grid_'+ this.name);
			var header 		= $('#grid_'+ this.name +'_header');
			var toolbar 	= $('#grid_'+ this.name +'_toolbar');
			var summary		= $('#grid_'+ this.name +'_summary');
			var footer		= $('#grid_'+ this.name +'_footer');
			var body		= $('#grid_'+ this.name +'_body');
			var columns 	= $('#grid_'+ this.name +'_columns');
			var records 	= $('#grid_'+ this.name +'_records');

			// resizing
			main.width(this.width).height(this.height);

			if (this.show.header) {
				header.css({
					top:   '0px',
					left:  '0px',
					right: '0px'
				});
			}

			if (this.show.toolbar) {
				toolbar.css({
					top:   ( 0 + (this.show.header ? w2utils.getSize(header, 'height') : 0) ) + 'px',
					left:  '0px',
					right: '0px'
				});
			}
			if (this.show.footer) {
				footer.css({
					bottom: '0px',
					left:  '0px',
					right: '0px'
				});
			}
			if (this.summary != '') {
				summary.css({
					bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) ) + 'px',
					left:  '0px',
					right: '0px'
				});
			}
			body.css({
				top: ( 0 + (this.show.header ? w2utils.getSize(header, 'height') : 0) + (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0) ) + 'px',
				bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) + (this.summary != '' ? w2utils.getSize(summary, 'height') : 0) ) + 'px',
				left:   '0px',
				right:  '0px'
			});
		},

		resizeRecords: function () {
			var obj = this;
			// remove empty records
			$('.grid_'+ this.name + '_empty_record').remove();
			// -- Calculate Column size in PX
			var box			= $(this.box);
			var grid		= $('#grid_'+ this.name);
			var header 		= $('#grid_'+ this.name +'_header');
			var toolbar		= $('#grid_'+ this.name +'_toolbar');
			var summary 	= $('#grid_'+ this.name +'_summary');
			var footer 		= $('#grid_'+ this.name +'_footer');
			var body 		= $('#grid_'+ this.name +'_body');
			var columns 	= $('#grid_'+ this.name +'_columns');
			var records 	= $('#grid_'+ this.name +'_records');

			// body might be expanded by data
			if (!this.fixedBody) {
				// calculate body height by content
				var calculatedHeight = $('#grid_'+ this.name +'_records > table:first-child').height() + columns.height();
				this.height = calculatedHeight + w2utils.getSize(grid, '+height')
					+ (this.show.header ? w2utils.getSize(header, 'height') : 0)
					+ (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
					+ (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
					+ (this.show.footer ? w2utils.getSize(footer, 'height') : 0);
				grid.height(this.height);
				body.height(calculatedHeight);
				box.height(w2utils.getSize(grid, 'height'));
			} else {
				// fixed body height
				var calculatedHeight =  grid.height()
					- (this.show.header ? w2utils.getSize(header, 'height') : 0)
					- (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
					- (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
					- (this.show.footer ? w2utils.getSize(footer, 'height') : 0);
				body.height(calculatedHeight);
			}

			// check overflow
			if (body.height() - columns.height() < $(records).find(':first-child').height()) var bodyOverflowY = true; else bodyOverflowY = false;
			if (body.width() < $(records).find(':first-child').width())   var bodyOverflowX = true; else bodyOverflowX = false;
			if (bodyOverflowX || bodyOverflowY) {
				records.css({ 
					top: ((this.columnGroups.length > 0 ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
					"-webkit-overflow-scrolling": "touch",
					"overflow-x": (bodyOverflowX ? 'auto' : 'hidden'), 
					"overflow-y": (bodyOverflowY ? 'auto' : 'hidden') });
				$('#grid_'+ this.name +'_cell_header_last').show();
			} else {
				records.css({ top: ((this.columnGroups.length > 0 ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px', overflow: 'hidden' });
				if (records.length > 0) { this.last_scrollTop  = 0; this.last_scrollLeft = 0; } // if no scrollbars, always show top
				$('#grid_'+ this.name +'_cell_header_last').hide();
			}
			if (this.show.emptyRecords && !bodyOverflowY) {
				var startWith = 0;
				if (this.url == '') { // local data
					var cnt = this.page * this.recordsPerPage;
					for (var tt=0; tt<this.records.length; tt++) {
						if (this.records[tt].hidden === true || this.records[tt].summary === true) continue; 
						cnt--;
						if (cnt < 0) { startWith = tt; break; }
					}
				}
				// find only records that are shown
				var total = 0;
				for (var r=startWith; r < this.records.length; r++) {
					if (this.records[r].hidden === true || this.records[r].summary === true) continue; 
					total++;
				}
				// apply empty records
				var html  = '';
				for (var di = total; di < 100; di++) {
					html += '<tr class="grid_'+ this.name + '_empty_record '+ (di % 2 ? 'w2ui-even' : 'w2ui-odd') + '">';
					if (this.show.lineNumbers)  html += '<td class="w2ui-number"><div style="width: 24px;"></div></td>';
					if (this.show.selectColumn) html += '<td class="w2ui-grid-data"><div style="width: 23px;"></div></td>';
					if (this.show.expandColumn) html += '<td class="w2ui-grid-data"><div style="width: 23px;"></div></td>';
					var j = 0;
					while (true) {
						var col   = this.columns[j];
						if (col.hidden) { j++; if (typeof this.columns[j] == 'undefined') break; else continue; }
						html += '<td class="w2ui-grid-data" '+( di == this.records.length ? 'id="grid_'+ this.name +'_cell_'+ di +'_'+ j +'"' : '') +
									(typeof col.attr != 'undefined' ? col.attr : '') +'><div></div></td>';
						j++;
						if (typeof this.columns[j] == 'undefined') break;
					}
					html += '</tr>';
				}
				$('#grid_'+ this.name +'_records > table').append(html);
			}
			if (body.length > 0) {
				var width_max = parseInt(body.width())
					- (bodyOverflowY ? (String(navigator.userAgent).indexOf('AppleWebKit') > 0 ? 16 : 17) : 0)
					- (this.show.lineNumbers ? 25 : 0)
					- (this.show.selectColumn ? 25 : 0)
					- (this.show.expandColumn ? 25 : 0);
				var width_box = width_max;
				var percent = 0;
				// gridMinWidth processiong
				var restart = false;
				for (var i=0; i<this.columns.length; i++) {
					var col = this.columns[i];
					if (typeof col.gridMinWidth != 'undefined') {
						if (col.gridMinWidth > width_box && col.hidden !== true) {
							col.hidden = true;
							restart = true;
						}
						if (col.gridMinWidth < width_box && col.hidden === true) {
							col.hidden = false;
							restart = true;
						}
					}
				}
				if (restart === true) {
					this.refresh();
					return;
				}
				// assign PX column s
				for (var i=0; i<this.columns.length; i++) {
					var col = this.columns[i];
					if (col.hidden) continue;
					if (String(col.size).substr(String(col.size).length-2).toLowerCase() == 'px') {
						width_max -= parseFloat(col.size) + 1; // count in cell border
						this.columns[i].sizeCalculated = col.size;
					} else {
						percent += parseFloat(col.size);
						delete col.sizeCorrected;
					}
				}
				// if sum != 100% -- reassign proportionally
				if (percent != 100) {
					for (var i=0; i<this.columns.length; i++) {
						var col = this.columns[i];
						if (col.hidden) continue;
						if (String(col.size).substr(String(col.size).length-2).toLowerCase() != 'px') {
							col.sizeCorrected = Math.round(parseFloat(col.size) * 100 * 100 / percent) / 100 + '%';
						}
					}
				}
				// calculate % columns
				for (var i=0; i<this.columns.length; i++) {
					var col = this.columns[i];
					if (col.hidden) continue;
					if (String(col.size).substr(String(col.size).length-2).toLowerCase() != 'px') {
						if (typeof this.columns[i].sizeCorrected != 'undefined') {
							this.columns[i].sizeCalculated = Math.round(width_max * parseFloat(col.sizeCorrected) / 100 - 1) + 'px'; // count in cell border
						} else {
							this.columns[i].sizeCalculated = Math.round(width_max * parseFloat(col.size) / 100 - 1) + 'px'; // count in cell border
						}
					}
				}
			}
			// fix error margin which is +/-2px due to percentage calculations
			var width_cols = 1;
			var last_col   = null;
			for (var i=0; i<this.columns.length; i++) {
				var col = this.columns[i];
				if (typeof col.min == 'undefined') col.min = 15;
				if (parseInt(col.sizeCalculated) < parseInt(col.min)) col.sizeCalculated = col.min + 'px';
				if (parseInt(col.sizeCalculated) > parseInt(col.max)) col.sizeCalculated = col.max + 'px';
				if (col.hidden) continue;
				width_cols += parseFloat(col.sizeCalculated) + 1; // border
				last_col = col;
			}
			var width_diff = parseInt(width_box) - parseInt(width_cols) + 1; // 1 is last border width
			if (width_diff > 0) {
				last_col.sizeCalculated = (parseInt(last_col.sizeCalculated) + width_diff) + 'px' ;
				if (parseInt(last_col.sizeCalculated) < parseInt(last_col.min)) last_col.sizeCalculated = last_col.min + 'px';
				if (parseInt(last_col.sizeCalculated) > parseInt(last_col.max)) last_col.sizeCalculated = last_col.max + 'px';
			}
			// resize HTML table
			for (var i=0; i<this.columns.length; i++) {
				var col = this.columns[i];
				if (col.hidden) continue;
				var tmp = $('#grid_'+ this.name +'_cell_header_'+ i + ' > div:first-child');
				tmp.width(col.sizeCalculated);
				if (tmp.attr('name') == 'columnGroup') { tmp.find('div').css('padding', '13px 3px'); }

				var startWith = 0;
				if (this.url == '') { // local data
					var cnt = this.page * this.recordsPerPage;
					for (var tt=0; tt<this.records.length; tt++) {
						if (this.records[tt] && this.records[tt].hidden) continue;
						cnt--;
						if (cnt < 0) { startWith = tt; break; }
					}
				}
				for (var j=startWith; j<1000; j++) {
					if (this.records[j] && this.records[j].hidden) { continue; }
					var cell = $('#grid_'+ this.name+'_cell_'+ j +'_'+ i + ' > div:first-child');
					if (cell.length == 0) break;
					cell.width(col.sizeCalculated);
				}
			}
			this.initResize();
			// apply last scroll if any
			var columns = $('#grid_'+ this.name +'_columns');
			var records = $('#grid_'+ this.name +'_records');
			if (this.last_scrollTop != '' && records.length > 0) {
				columns.prop('scrollLeft', this.last_scrollLeft);
				records.prop('scrollTop',  this.last_scrollTop);
				records.prop('scrollLeft', this.last_scrollLeft);
			}
		},

		getSearchesHTML: function () {
			var html = '<table cellspacing="0">';
			var showBtn = false;
			for (var i = 0; i < this.searches.length; i++) {
				var s = this.searches[i];
				if (s.hidden) continue;
				var btn = '';
				if (showBtn == false) {
					btn = '<input type="button" value="X" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchClose(); }">';
					showBtn = true;
				}
				if (typeof s.inTag   == 'undefined') s.inTag 	= '';
				if (typeof s.outTag  == 'undefined') s.outTag 	= '';
				if (typeof s.type    == 'undefined') s.type 	= 'text';
				if (s.type == 'text') {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+i+'">'+
						'	<option value="is">is</option>'+
						'	<option value="begins with">begins with</option>'+
						'	<option value="contains">contains</option>'+
						'	<option value="ends with">ends with</option>'+
						'</select>';
				}
				if (s.type == 'int' || s.type == 'float' || s.type == 'date') {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+i+'" onchange="var el = $(\'#grid_'+ this.name + '_range_'+ i +'\'); '+
						'					if ($(this).val() == \'is\') el.hide(); else el.show();">'+
						'	<option value="is">is</option>'+
						'	<option value="between">between</option>'+
						'</select>';
				}
				if (s.type == 'list') {
					var operator =  'is <input type="hidden" value="is" id="grid_'+ this.name +'_operator_'+i+'">';
				}
				html += '<tr>'+
						'	<td width="20px" style="padding-right: 20px">'+ btn +'</td>' +
						'	<td class="caption" style="border-right1: 0px">'+ s.caption +'</td>' +
						'	<td class="caption" style="text-align: left; padding: 0px 10px;">'+ operator +'</td>'+
						'	<td class="value">';

				switch (s.type) {
					case 'alphaNumeric':
					case 'text':
						html += '<input rel="search" type="text" size="40" id="grid_'+ this.name +'_field_'+i+'" name="'+ s.field +'" '+ s.inTag +'>';
						break;

					case 'int':
					case 'float':
					case 'hex':
					case 'money':
					case 'date':
						html += '<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field_'+i+'" name="'+ s.field +'" '+ s.inTag +'>'+
								'<span id="grid_'+ this.name +'_range_'+i+'" style="display: none">'+
								'&nbsp;-&nbsp;&nbsp;<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field2_'+i+'" name="'+ s.field +'" '+ s.inTag +'>'+
								'</span>';
						break;

					case 'list':
						html += '<select rel="search" id="grid_'+ this.name +'_field_'+i+'" name="'+ s.field +'" '+ s.inTag +'></select>';
						break;

				}
				html +=			s.outTag +
						'	</td>' +
						'</tr>';
			}
			html += '<tr>'+
					'	<td colspan="4" class="caption" style="border-right: 0px; padding: 20px 0px 5px 0px !important; text-align: center;">'+
					'		<input type="button" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchReset(); }" style="width: 60px; margin: 0px 2px;" value="Reset">'+
					'		<input type="button" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.search(); }" style="width: 60px; margin: 0px 2px;" value="Search">'+
					'	</td>'+
					'</tr></table>';
			return html;
		},

		getColumnsHTML: function () {
			var html = '';
			switch (this.layout) {
				case 'table':
					if (this.show.columnHeaders) {
						// -- COLUMN Groups
						if (this.columnGroups.length > 0) {
							// add empty group at the end
							if (this.columnGroups[this.columnGroups.length-1].caption != '') this.columnGroups.push({ caption: '' });
							
							html += '<tr>';
							if (this.show.lineNumbers) {
								html += '<td id="grid_'+ this.name +'_cell_header_number" class="w2ui-head">'+
										'	<div style="cursor: default; overflow: hidden; width: 24px; text-align: center;">&nbsp;</div>'+
										'</td>';
							}
							if (this.show.selectColumn) {
								html += '<td id="grid_'+ this.name +'_cell_header_select" class="w2ui-head">'+
										'	<div style="cursor: default; overflow: hidden; width: 23px; text-align: center;">&nbsp;</div>'+
										'</td>';
							}
							if (this.show.expandColumn) {
								html += '<td id="grid_'+ this.name +'_cell_header_expand" class="w2ui-head">'+
										'<div style="cursor: default; overflow: hidden; width: 23px;">&nbsp;</div></td>';
							}
							var ii = 0;
							for (var i=0; i<this.columnGroups.length; i++) {
								var colg = this.columnGroups[i];
								var col  = this.columns[ii];
								if (typeof colg.span == 'undefined' || colg.span != parseInt(colg.span)) colg.span = 1;
								if (typeof colg.colspan != 'undefined') colg.span = colg.colspan;
								if (colg.master === true) {
									var sortStyle = '';
									for (var si in this.sortData) {
										if (this.sortData[si].field == col.field) {
											if (this.sortData[si].direction == 'asc')  sortStyle = 'w2ui-sort-down';
											if (this.sortData[si].direction == 'desc') sortStyle = 'w2ui-sort-up';
										}
									}
									var resizer = "";
									if (col.resizable == true) {
										resizer = '<div class="w2ui-resizer" name="'+ ii +'" style="position: absolute; width: 6px; height: 12px; '+
												  '		background-color: #e4e4e4; cursor: col-resize; padding: 0px; margin: 0px;"></div>';
									}
									html += '<td id="grid_'+ this.name +'_cell_header_'+ ii +'" class="w2ui-head" rowspan="2"'+
													(col.sortable ? 'onclick="w2ui[\''+ this.name +'\'].doSort(\''+ col.field +'\', null, event);"' : '') +
											'		style="height: auto !important; '+ (ii == this.columns.length -1 ? 'border-right: 1px solid transparent;' : '') +'">'+
											'<div name="columnGroup"><div class="'+ sortStyle +'" style="height: auto !important; text-align: center; cursor: default; width: 100%; overflow: hidden;">'+
												(col.caption == '' ? '&nbsp;' : col.caption) +'</div></div>'+ resizer +'</td>';
								} else {
									html += '<td id="grid_'+ this.name +'_cell_group_header_'+ ii +'" class="w2ui-head" '+
											'		colspan="'+ (colg.span + (i == this.columnGroups.length-1 ? 1 : 0) ) +'" '+
											'		style="height: auto !important; text-align: center; '+ (i == this.columns.length -1 ? 'border-right: 1px solid transparent;' : '') +'">'+
											'<div><div style="height: auto !important; cursor: default; width: 100% !important; overflow: hidden;">'+
												(colg.caption == '' ? '&nbsp;' : colg.caption) +'</div></div>'+
											'</td>';
								}
								ii += colg.span;
							}
							html += '</tr>';
						}

						// COLUMNS
						html += '<tr>';
						if (this.show.lineNumbers) {
							html += '<td id="grid_'+ this.name +'_cell_header_number" class="w2ui-head">'+
									'	<div style="cursor: default; overflow: hidden; width: 24px; text-align: center;">#</div>'+
									'</td>';
						}
						if (this.show.selectColumn) {
							html += '<td id="grid_'+ this.name +'_cell_header_select" class="w2ui-head" onclick="event.stopPropagation();">'+
									'<div style="cursor: default; text-align: center; overflow: hidden; width: 23px; padding: 0px; margin: 0px;">'+
									'	<input type="checkbox" id="grid_'+ this.name +'_check_all" tabIndex="-1"'+
									'		onclick="if (this.checked) w2ui[\''+ this.name +'\'].selectPage(); '+
									'				 else w2ui[\''+ this.name +'\'].selectNone(); event.stopPropagation();" '+
									'		style="display: inline-block; margin: 6px 5px; padding: 0px;">'+
									'</div>'+
									'</td>';
						}
						if (this.show.expandColumn) {
							html += '<td id="grid_'+ this.name +'_cell_header_expand" class="w2ui-head">'+
									'<div style="cursor: default; overflow: hidden; width: 23px;">&nbsp;</div></td>';
						}
						var ii = 0;
						var id = 0;
						for (var i=0; i<this.columns.length; i++) {
							var col  = this.columns[i];
							var colg = {};
							if (i == id) {
								id = id + (typeof this.columnGroups[ii] != 'undefined' ? parseInt(this.columnGroups[ii].span) : 0);
								ii++;
							}
							if (typeof this.columnGroups[ii-1] != 'undefined') var colg = this.columnGroups[ii-1];
							if (col.hidden) continue;
							var sortStyle = '';
							for (var si in this.sortData) {
								if (this.sortData[si].field == col.field) {
									if (this.sortData[si].direction == 'asc')  sortStyle = 'w2ui-sort-down';
									if (this.sortData[si].direction == 'desc') sortStyle = 'w2ui-sort-up';
								}
							}
							if (colg['master'] !== true) { // grouping of columns
								var resizer = "";
								if (col.resizable == true) {
									resizer = '<div class="w2ui-resizer" name="'+ i +'" style="position: absolute; width: 6px; height: 12px; '+
											  '		background-color: #e4e4e4; cursor: col-resize; padding: 0px; margin: 0px;"></div>';
								}
								html += '<td id="grid_'+ this.name +'_cell_header_'+ i +'" class="w2ui-head" '+
												(col.sortable ? 'onclick="w2ui[\''+ this.name +'\'].doSort(\''+ col.field +'\', null, event);"' : '') +
										'		style="height: auto !important; '+ (i == this.columns.length -1 ? 'border-right: 1px solid transparent;' : '') +'">'+
										'<div><div class="'+ sortStyle +'" style="height: auto !important; cursor: default; width: 100%; overflow: hidden;">'+  
											col.caption +
										'</div></div>'+ resizer +'</td>';
							}
						}
						html += '<td id="grid_'+ this.name +'_cell_header_last" class="w2ui-head" style="border-right: 0px; display: none;">'+
								'	<div style="width: 2000px; overflow: hidden;">&nbsp;</div></td>';
						html += '</tr>';
					}
					break;
				case 'div':
					break;
			}
			return html;
		},

		getRecordsHTML: function () {
			var html    = '';
			var summary = '';
			var sum_cnt = 0;
			switch (this.layout) {
				case 'table':
					if (this.records.length == 0 && this.isLoaded && !this.show.emptyRecords) {
						html += '<tr><td colspan=100 style="padding: 10px; border: 0px;">'+ this.msgNoData + '</div>';
					} else {
						var startWith = 0;
						if (this.url == '') { // local data
							var cnt = this.page * this.recordsPerPage;
							for (var tt=0; tt<this.records.length; tt++) {
								if (this.records[tt] && this.records[tt].hidden) continue;
								cnt--;
								if (cnt < 0) { startWith = tt; break; }
							}
						}
						for (var i = startWith, di = 0, ri = 0; ri < this.recordsPerPage && i < this.records.length; i++) {
							var record 	= this.records[i];
							if (!record || record.hidden === true) continue;
							var rec_html = '';
							ri++; // actual records counter
							// set text and bg color if any
							var	tmp_color = '';
							if (typeof record['style'] != 'undefined') {
								tmp_color += record['style'];
							}
							if (record.selected) {
								rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ i +'" class="w2ui-selected" ' +
										(this.isIOS ?
											'    onclick 	 = "w2ui[\''+ this.name +'\'].doDblClick(\''+ record.recid +'\', event);" '
											:
											'    onclick     = "var obj = w2ui[\''+ this.name +'\']; var evnt = event; '+
											'					clearTimeout(obj._click_timer); '+
											'					obj._click_timer = setTimeout(function () { obj.doClick(\''+ record.recid +'\', evnt); }, 1);"'+
											'    ondblclick  = "w2ui[\''+ this.name +'\'].doDblClick(\''+ record.recid +'\', event);" '
										 )+
										(tmp_color != '' ? 'custom_style="'+ tmp_color +'"' : '')+
										'>';
							} else {
								rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ i +'" class="'+ (di%2 == 0 ? 'w2ui-odd' : 'w2ui-even') + '" ' +
										(this.isIOS ?
											'    onclick  	 = "w2ui[\''+ this.name +'\'].doDblClick(\''+ record.recid +'\', event);" '
											:
											'    onclick     = "var obj = w2ui[\''+ this.name +'\']; var evnt = event; '+
											'					clearTimeout(obj._click_timer); '+
											'					obj._click_timer = setTimeout(function () { obj.doClick(\''+ record.recid +'\', evnt); }, 1);"'+
											'    ondblclick  = "w2ui[\''+ this.name +'\'].doDblClick(\''+ record.recid +'\', event);" '
										 )+
										(tmp_color != '' ? 'custom_style="'+ tmp_color +'" style="'+ tmp_color +'"' : '')+
										'>';
							}
							var num = (parseInt(this.page) * parseInt(this.recordsPerPage)) + parseInt(i+1);
							if (this.show.lineNumbers) {
								rec_html += '<td id="grid_'+ this.name +'_cell_'+ i +'_number" class="w2ui-number">'+
										'	<div style="width: 24px; cursor: default; overflow: hidden;">'+ (startWith + ri) +'</div>'+
										'</td>';
							}
							if (this.show.selectColumn) {
								rec_html += '<td id="grid_'+ this.name +'_cell_'+ i +'_select" class="w2ui-grid-data" onclick="event.stopPropagation();">'+
										'<div style="cursor: default; text-align: center; overflow: hidden; width: 23px; padding: 0px; margin: 0px;">'+
										'	<input id="grid_'+ this.name +'_cell_'+ i +'_select_check" class="grid_select_check" type="checkbox" tabIndex="-1"'+
										'		style="display: inline-block; margin: 6px 5px; padding: 0px;" '+ (record.selected ? 'checked="checked"' : '') +
										'		onclick="var obj = w2ui[\''+ this.name +'\']; if (!obj.multiSelect) { obj.selectNone(); }'+
										'			if (this.checked) obj.select(\''+ record.recid + '\'); else obj.unselect(\''+ record.recid + '\'); '+
										'			event.stopPropagation();">'+
										'</div>'+
										'</td>';
							}
							if (this.show.expandColumn) {
								rec_html += '<td id="grid_'+ this.name +'_cell_'+ i +'_expand" class="w2ui-grid-data">'+
										'	<div ondblclick="event.stopPropagation()" '+
										'		 onclick="w2ui[\''+ this.name +'\'].doExpand('+ record.recid +', event); event.stopPropagation();" '+
										'		 style="width: 23px; cursor: pointer; text-align: center; overflow: hidden; font-weight: bold;"> + </div>'+
										'</td>';
							}
							var j = 0;
							while (true) {
								var col   = this.columns[j];
								if (col.hidden) { j++; if (typeof this.columns[j] == 'undefined') break; else continue; }
								var field = '';
								if (String(col.field).indexOf('.') > -1) {
									var tmp = String(col.field).split('.');
									field = record[tmp[0]];
									if (typeof field == 'object' && field != null) {
										field = field[tmp[1]];
									}
								} else {
									field = record[col.field];
								}
								if (typeof col.render != 'undefined') {
									if (typeof col.render == 'function') field = col.render.call(this, this.records[i], i);
									if (typeof col.render == 'object')   field = col.render[this.records[i][col.field]];
								}
								if (field == null || typeof field == 'undefined') field = '';
								// common render functions
								if (typeof col.render == 'string') {
									switch (col.render.toLowerCase()) {
									case 'url':
										var pos = field.indexOf('/', 8);
										field = '<a href="'+ field +'" target="_blank">'+ field.substr(0, pos) +'</a>';
										break;

									case 'repeat':
										if (i > 0 && this.records[i][col.field] == this.records[i-1][col.field] && this.records[i][col.field] != '') {
											field = '-- // --';
										}
										break;
									}
								}

								// prepare cell
								rec_html += '<td class="w2ui-grid-data" valign="top" id="grid_'+ this.name +'_cell_'+ i +'_'+ j +'" '+
											'	style="cursor: default; padding: 0px; margin: 0px; '+ (typeof col.style != 'undefined' ? col.style : '') +'" '+
											(typeof col.attr != 'undefined' ? col.attr : '') +'>';
								if (this.fixedRecord) {
									// this is for editable controls
									if ($.isPlainObject(col.editable)) {
										var edit = col.editable;
										if (edit.type == 'enum') console.log('ERROR: Grid\'s inline editing does not support enum field type.');
										if (typeof edit.inTag   == 'undefined') edit.inTag   = '';
										if (typeof edit.outTag  == 'undefined') edit.outTag  = '';
										if (typeof edit.style   == 'undefined') edit.style   = '';
										if (typeof edit.items   == 'undefined') edit.items   = [];
										// output the field
										if ((typeof record['editable'] == 'undefined' || record['editable'] === true) && edit.type != 'enum') {
											rec_html +=	'<div style="width: 100%; overflow: hidden; margin: 0px; padding: 0px;">'+
													'<input id="grid_'+ this.name +'_edit_'+ i +'_'+ j +'" value="'+ field +'" type="text" class="w2ui-editable" style="'+ edit.style +'" '+
													'	field="'+ col.field +'" recid="'+ record.recid +'" line="'+ i +'" column="'+ j +'" '+
													'	onclick = "w2ui[\''+ this.name + '\'].doEdit(\'click\', this, event);" '+
													'	onkeyup = "w2ui[\''+ this.name + '\'].doEdit(\'keyup\', this, event);" '+
													'	onfocus = "w2ui[\''+ this.name + '\'].doEdit(\'focus\', this, event);" '+
													'	onblur  = "w2ui[\''+ this.name + '\'].doEdit(\'blur\', this, event);" '+
													'	ondblclick = "event.stopPropagation(); this.select();" '+
													edit.inTag + ' >' + edit.outTag +
													'</div>';
										} else {
											rec_html +=	'<div style="width: 100%; overflow: hidden;">'+ field +'</div>';
										}
									} else {
										rec_html +=	'<div style="width: 100%; overflow: hidden;" title="'+ String(field).replace(/"/g, "''") +'">'+ field +'</div>';
									}
								} else {
									rec_html +=	'<div style="width: 100%; height: auto; overflow: visible;">'+ field +'</div>';
								}
								rec_html += '</td>';
								j++;
								if (typeof this.columns[j] == 'undefined') break;
							}
							rec_html += '</tr>';
							// save into either summary or regular
							if (record.summary === true) {
								if (sum_cnt % 2) {
									summary += String(rec_html).replace('w2ui-odd', 'w2ui-even') ;
								} else {
									summary += String(rec_html).replace('w2ui-even', 'w2ui-odd') ;
								}
								sum_cnt++;
							} else {
								html += rec_html;
							}
							di++;
						}
					}
					break;
				/*
				case 'div':
					if (this.records.length == 0 && this.isLoaded) {
						if (this.records.length == 0) html += this.tmpl_empty.replace('~msg~', this.msgNoData);
					}
					var tmp_last_grp = '';
					for (i=0; i<this.records.length; i++) {
						var item = this.records[i];
						// prepare group section
						var tmp  = this.tmpl_group;
						while (tmp.indexOf('~field0~') > 0) { tmp = tmp.replace('~field0~', this.records[i].recid); }
						while (tmp.indexOf('~FIELD0~') > 0) { tmp = tmp.replace('~FIELD0~', this.records[i].recid); }
						while (tmp.indexOf('~class~') > 0)  { tmp = tmp.replace('~class~', (i % 2 == 0 ? 'w2ui-odd' : 'w2ui-even')); }
						while (tmp.indexOf('~CLASS~') > 0)  { tmp = tmp.replace('~CLASS~', (i % 2 == 0 ? 'w2ui-odd' : 'w2ui-even')); }
						for (var k=0; k<item.length; k++) {
							while (tmp.indexOf('~field'+(k+1)+'~') > 0) { tmp = tmp.replace('~field'+(k+1)+'~', item[k]); }
							while (tmp.indexOf('~FIELD'+(k+1)+'~') > 0) { tmp = tmp.replace('~FIELD'+(k+1)+'~', item[k]); }
						}
						if (tmp != tmp_last_grp) { html += tmp; tmp_last_grp = tmp; }
						// prepare repeatable section
						var tmp  = this.tmpl;
						while (tmp.indexOf('~field0~') > 0) { tmp = tmp.replace('~field0~', this.records[i].recid); }
						while (tmp.indexOf('~FIELD0~') > 0) { tmp = tmp.replace('~FIELD0~', this.records[i].recid); }
						while (tmp.indexOf('~class~') > 0)  { tmp = tmp.replace('~class~', (i % 2 == 0 ? 'w2ui-odd' : 'w2ui-even')); }
						while (tmp.indexOf('~CLASS~') > 0)  { tmp = tmp.replace('~CLASS~', (i % 2 == 0 ? 'w2ui-odd' : 'w2ui-even')); }
						for (var k=0; k<item.length; k++) {
							while (tmp.indexOf('~field'+(k+1)+'~') > 0) { tmp = tmp.replace('~field'+(k+1)+'~', item[k]); }
							while (tmp.indexOf('~FIELD'+(k+1)+'~') > 0) { tmp = tmp.replace('~FIELD'+(k+1)+'~', item[k]); }
						}
						html += tmp;
					}
					break;
				*/
			}
			if (summary != '') {
				this.summary = '<table cellpadding="0" cellspacing="0" style="table-layout: fixed;">'+ summary +'</table>';
			} else {
				this.summary = '';
			}
			return html;
		},

		getFooterHTML: function () {
			var totalPages = Math.floor(this.total / this.recordsPerPage);
			if (this.total % this.recordsPerPage != 0 || totalPages == 0) totalPages++;
			if (totalPages < 1) totalPages = 1;
			var pages = "<style> "+
				"	a.w2btn { display: inline-block; border-radius: 3px; cursor: pointer; font-size: 11px; line-height: 16px; padding: 0px 5px; width: 30px; height: 18px;} "+
				"	a.w2btn:hover { background-color: #AEC8FF; } "+
				"</style>";
			pages += "<div style=\"width: 110px; margin: 0 auto; padding: 0px; text-align: center\" class=\"w2ui-footer-nav\">"+
				 "		<a class=\"w2btn\" style=\"float: left;\" "+
				 "  		onclick=\"w2ui[\'"+ this.name +"\'].goto(w2ui[\'"+ this.name +"\'].page - 1)\" "+ (this.page == 0 ? 'disabled' : '') +
				 "		> << </a>"+
				 "		<input type=\"text\" value=\""+ (this.page+1) +"\" "+
				 "			onclick=\"this.select();\" style=\"width: 40px; padding: 1px 2px 2px 2px; text-align: center;\" "+
				 "			onkeyup=\"if (event.keyCode != 13) return;  "+
				 "					  if (this.value < 1) this.value = 1; "+
				 "					  w2ui[\'"+ this.name +"\'].goto(parseInt(this.value-1)); \"> "+
				 "		<a class=\"w2btn\" style=\"float: right;\" "+
				 "  		onclick=\"w2ui[\'"+ this.name +"\'].goto(w2ui[\'"+ this.name +"\'].page + 1)\" "+ (this.page == totalPages-1 || totalPages == 0 ? 'disabled' : '') +
				 "		> >> </a>"+
				 "</div>";
			return pages;
		},

		showStatus: function (status) {
			var obj = this;
			$('#grid_'+ this.name).append(
				'<div id="grid_'+ this.name +'_lock" class="w2ui-grid-lock" style="position: absolute; display: none;"></div>'+
				'<div id="grid_'+ this.name +'_status" class="w2ui-grid-status" style="position: absolute; display: none;"></div>'
			);
			setTimeout(function () {
				var lock 	= $('#grid_'+ obj.name +'_lock');
				var status 	= $('#grid_'+ obj.name +'_status');
				status.data('old_opacity', status.css('opacity')).css('opacity', '0').show();
				lock.data('old_opacity', lock.css('opacity')).css('opacity', '0').show();
				setTimeout(function () {
					var left 	= ($(obj.box).width()  - w2utils.getSize(status, 'width')) / 2;
					var top 	= ($(obj.box).height() * 0.9 - w2utils.getSize(status, 'height')) / 2;
					lock.css({
						opacity : lock.data('old_opacity'),
						left 	: '0px',
						top 	: '0px',
						width 	: '100%',
						height 	: '100%'
					});
					status.html('Refreshing...').css({
						opacity : status.data('old_opacity'),
						left	: left + 'px',
						top		: top + 'px'
					});
				}, 10);
			}, 10);
		},

		hideStatus: function () {
			var obj = this;
			setTimeout(function () {
				$('#grid_'+ obj.name +'_lock').remove();
				$('#grid_'+ obj.name +'_status').remove();
			}, 25);
		}
	}

	$.extend(w2grid.prototype, $.w2event);
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2layout - layout widget
*		- $.w2layout	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
************************************************************************/

(function () {
	var w2layout = function (options) {
		this.box		= null		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.panels		= [];
		this.padding	= 1;		// panel padding
		this.spacer		= 4;		// resizer width or height
		this.style		= '';
		this.css		= '';		// will display all inside <style> tag
		this.width		= null		// reads from container
		this.height		= null;		// reads from container
		this.onShow		= null;
		this.onHide		= null;
		this.onResizing = null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null
		
		$.extend(true, this, options);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2layout = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2layout().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			var panels = method.panels;
			var object = new w2layout(method);
			$.extend(object, { handlers: [], panels: [] });
			for (var p in panels) { object.panels[p] = $.extend({}, w2layout.prototype.panel, panels[p]); }
			if ($(this).length > 0) {
				$(this).data('w2name', object.name);
				object.render($(this)[0]);
			}
			w2ui[object.name] = object;		
			return object;		
			
		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2layout' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2layout.prototype = {
		// default setting for a panel
		panel: {
			type: 		null,		// left, right, top, bottom
			size: 		100, 		// width or height depending on panel name
			minSize: 	20,
			hidden: 	false,
			resizable:  false,
			overflow: 	'auto',
			style: 		'',
			content: 	'',			// can be String or Object with .render(box) method
			width: 		null, 		// read only
			height: 	null, 		// read only
			onRefresh: 	null,
			onShow: 	null,
			onHide: 	null
		},
		
		add: function (options) {
			if (!$.isArray(options)) options = [options];
			for (var o in options) {
				var panel = $.extend({}, panel, options[o]);
				this.panels.push(panel)
				this.refresh(panel.type);
			}
		},
		
		remove: function (panel) {
			var removed = 0;
			for (var a in arguments) {
				var obj = this.getIndex(arguments[a]);
				if (obj == null || this.panels[obj].type == 'main') continue;
				removed++;
				this.panels.splice(obj, 1);
				this.resize();
			}
			return removed;			
		},
		
		content: function (panel, data, transition) {
			var obj = this;
			var p = this.get(panel);
			if (p == null) return false;
			if ($('#layout_'+ this.name + '_panel2_'+ p.type).length > 0) return false;
			$('#layout_'+ this.name + '_panel_'+ p.type).scrollTop(0);
			if (data == null || typeof data == 'undefined') {
				return p.content;
			} else {
				if (p.content == '') {
					p.content = data;
					if (!p.hidden) this.refresh(panel);
				} else {
					p.content = data;
					if (!p.hidden) {
						if (transition != null && transition != '' && typeof transition != 'undefined') {
							// apply transition
							if (String(transition).substr(0, 5) == 'slide') {
								var nm   = 'layout_'+ this.name + '_panel_'+ p.type;
								var pan  = $('#'+nm);
								var html = pan.html();
								var st   = pan[0].style.cssText;
								pan.attr('id', 'layout_'+ this.name + '_panel_'+ p.type +'_trans');					
								pan.html('<div id="'+ nm +'_old"></div><div id="'+ nm +'"></div>');
								pan.find('#'+ nm +'')[0].style.cssText = pan[0].style.cssText + '; left: 0px !important; top: 0px !important; '+
									'-webkit-transition: 0s; -moz-transition: 0s; -ms-transition: 0s; -o-transition: 0s;';
								pan.find('#'+ nm +'_old')[0].style.cssText = pan[0].style.cssText + '; left: 0px !important; top: 0px !important; '+
									'-webkit-transition: 0s; -moz-transition: 0s; -ms-transition: 0s; -o-transition: 0s;';
								pan[0].style.cssText += 'border: 0px; margin: 0px; padding: 0px; outline: 0px; overflow: hidden;';
								if (typeof(data) == 'object') {
									data.box = pan.find('#'+ nm)[0]; // do not do .render(box);
									data.render();
								} else {
									pan.find('#'+ nm).html(data);
								}
								pan.find('#'+ nm +'_old').html(html);
						
								var obj  = this;
								w2utils.transition(pan.find('#'+ nm +'_old')[0], pan.find('#'+ nm)[0], transition, function () {
									// clean up
									var pan = $('#layout_'+ obj.name + '_panel_'+ p.type +'_trans');
									if (pan.length > 0) {
										pan[0].style.cssText = st;
										pan.attr('id', 'layout_'+ obj.name + '_panel_'+ p.type).html(pan.find('#'+ nm).html());
									}
									// IE Hack
									if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
								});
							} else {
								$('#layout_'+ this.name + '_panel_'+ p.type).before('<div id="layout_'+ this.name + '_panel2_'+ p.type + '">'+ data +'</div>');					
								$('#layout_'+ this.name + '_panel2_'+ p.type)[0].style.cssText = $('#layout_'+ this.name + '_panel_'+ p.type)[0].style.cssText;
								if (typeof data == 'object') { 
									data.render($('#layout_'+ this.name + '_panel2_'+ p.type)[0]); 
								}
								var div1 = $('#layout_'+ this.name + '_panel2_'+ p.type)[0];
								var div2 = $('#layout_'+ this.name + '_panel_'+ p.type)[0];
								var obj  = this;
								w2utils.transition(div2, div1, transition, function () {
									// clean up
									$('#layout_'+ obj.name + '_panel_'+ p.type).remove();
									$('#layout_'+ obj.name + '_panel2_'+ p.type).attr('id', 'layout_'+ obj.name + '_panel_'+ p.type);
									p.content = data;
									// IE Hack
									if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
								});
							}
						} else {
							if (!p.hidden) this.refresh(panel);
						}
					}
				}
			}
			// IE Hack
			if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
		},
		
		load: function (panel, url, transition, onLoad) {
			var obj = this;
			$.get(url, function (data, status, object) {
				obj.content(panel, object.responseText, transition);
				if (onLoad) onLoad();
				// IE Hack
				if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
			});
		},
		
		show: function (panel, immediate) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'show', target: panel, panel: this.get(panel), immediate: immediate });	
			if (eventData.stop === true) return false;
	
			var p = this.get(panel);
			if (p == null) return false;
			p.hidden = false;
			if (immediate === true) {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_'+panel).css({ 'opacity': '1' });	
				if (p.resizabled) $('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_'+panel).show();
				this.trigger($.extend(eventData, { phase: 'after' }));	
				this.resize();
			} else {			
				var obj = this;
				if (p.resizabled) $('#layout_'+ obj.name +' #layout_'+ obj.name +'_splitter_'+panel).show();
				// resize
				$('#layout_'+ obj.name +' #layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0' });	
				$('#layout_'+ this.name +' .w2ui-panel').css({
					'-webkit-transition': '.2s',
					'-moz-transition'	: '.2s',
					'-ms-transition'	: '.2s',
					'-o-transition'		: '.2s'
				});
				setTimeout(function () { obj.resize(); }, 1);
				// show
				setTimeout(function() {
					$('#layout_'+ obj.name +' #layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '1' });	
				}, 250);
				// clean
				setTimeout(function () { 
					$('#layout_'+ obj.name +' .w2ui-panel').css({
						'-webkit-transition': '0s',
						'-moz-transition'	: '0s',
						'-ms-transition'	: '0s',
						'-o-transition'		: '0s'
					}); 
					obj.trigger($.extend(eventData, { phase: 'after' }));	
					obj.resize();
				}, 500);
			}
		},
		
		hide: function (panel, immediate) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'hide', target: panel, panel: this.get(panel), immediate: immediate });	
			if (eventData.stop === true) return false;
	
			var p = this.get(panel);
			if (p == null) return false;
			p.hidden = true;		
			if (immediate === true) {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_'+panel).css({ 'opacity': '0'	});
				$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_'+panel).hide();
				this.trigger($.extend(eventData, { phase: 'after' }));	
				this.resize();
			} else {
				var obj = this;
				$('#layout_'+ obj.name +' #layout_'+ obj.name +'_splitter_'+panel).hide();
				// hide
				$('#layout_'+ this.name +' .w2ui-panel').css({
					'-webkit-transition': '.2s',
					'-moz-transition'	: '.2s',
					'-ms-transition'	: '.2s',
					'-o-transition'		: '.2s'
				});
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_'+panel).css({ 'opacity': '0'	});
				setTimeout(function () { obj.resize(); }, 1);
				// clean
				setTimeout(function () { 
					$('#layout_'+ obj.name +' .w2ui-panel').css({
						'-webkit-transition': '0s',
						'-moz-transition'	: '0s',
						'-ms-transition'	: '0s',
						'-o-transition'		: '0s'
					}); 
					obj.trigger($.extend(eventData, { phase: 'after' }));	
					obj.resize();
				}, 500);
			}
		},
		
		toggle: function (panel, immediate) {
			var p = this.get(panel);
			if (p == null) return false;
			if (p.hidden) this.show(panel, immediate); else this.hide(panel, immediate);
		},
		
		set: function (panel, options) {
			var obj = this.getIndex(panel);
			if (obj == null) return false;
			$.extend(this.panels[obj], options);
			this.refresh(panel);
			return true;		
		},
	
		get: function (panel) {
			var obj = null;
			for (var p in this.panels) {
				if (this.panels[p].type == panel) { obj = this.panels[p]; break; }
			}
			return obj;
		},
		
		getIndex: function (panel) {
			var index = null;
			for (var p in this.panels) {
				if (this.panels[p].type == panel) { index = p; break; }
			}
			return index;
		},	
		
		render: function (box) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
	
			if (typeof box != 'undefined' && box != null) { 
				$(this.box).html(''); 
				this.box = box;
			}
			if (!this.box) return;
			// add main panel if it was not already added
			if (this.get('main') == null) this.panels.push( $.extend({}, w2layout.prototype.panel, { type: 'main'}) );
			if (this.get('css') == null)  this.panels.push( $.extend({}, w2layout.prototype.panel, { type: 'css'}) );
			var html = '<div id="layout_'+ this.name +'" class="w2ui-layout" style="position: absolute; overflow: hidden; '+ this.style +'"></div>';
			$(this.box).html(html);
			// create all panels
			var tmp = ['top', 'left', 'main', 'preview', 'right', 'bottom'];
			for (var t in tmp) {
				var html =  '<div id="layout_'+ this.name + '_panel_'+ tmp[t] +'" class="w2ui-panel"'+
							'	style="position: absolute; z-index: 120; display: none;">'+
							'</div>'+
							'<div id="layout_'+ this.name + '_splitter_'+ tmp[t] +'" class="w2ui-splitter"'+
							'	style="position: absolute; z-index: 121; display: none;">'+
							'</div>';
				$('#layout_'+ this.name +'').append(html);
			}
			$('#layout_'+ this.name +'').append('<style id="layout_'+ this.name + '_panel_css" style="position: absolute; top: 10000px;">'+ this.css +'</style>');		
			// process event
			this.trigger($.extend(eventData, { phase: 'after' }));	
			// reinit events
			this.refresh();
			this.initEvents();
		},
		
		refresh: function (panel) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (typeof panel == 'undefined') panel = null;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof panel != 'undefined' ? panel : this.name), panel: this.get(panel) });	
			if (eventData.stop === true) return false;
	
			if (panel != null && typeof panel != 'undefined') {
				var p = this.get(panel);
				if (p == null) return false;
				// apply properties to the panel
				var el = $('#layout_'+ this.name +' #layout_' +this.name +'_panel_'+panel).css({
					display: p.hidden ? 'none' : 'block',
					overflow: p.overflow
				});
				if (el.length > 0) el[0].style.cssText += p.style;
				// insert content
				if (typeof p.content == 'object' && p.content.render) {
					p.content.render($('#layout_'+ this.name +' #layout_'+ this.name + '_panel_'+ p.type)[0]);
				} else {
					$('#layout_'+ this.name +' #layout_'+ this.name + '_panel_'+ p.type).html(p.content);
				}
			} else {
				if ($('#layout_'+ this.name +' #layout_' +this.name +'_panel_main').length <= 0) {
					this.render();
					return;
				}
				this.resize();
				// refresh all of them
				for (var p in this.panels) { this.refresh(this.panels[p].type); }
			}
			this.trigger($.extend(eventData, { phase: 'after' }));	
			return true;
		},
		
		resize: function (width, height) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, width: width, height: height });	
			if (eventData.stop === true) return false;
	
			// layout itself
			this.width  = parseInt($(this.box).width());
			this.height = parseInt($(this.box).height());
			
			if (typeof width != 'undefined' && width != null)  this.width  = parseInt(width);
			if (typeof height != 'undefined' && height != null) this.height = parseInt(height);
			$('#layout_'+ this.name +'').css({
				width: this.width + 'px',
				height: this.height + 'px'
			});
			var obj = this;
			// panels
			var pmain   = this.get('main');
			var pprev   = this.get('preview');
			var pleft   = this.get('left');
			var pright  = this.get('right');
			var ptop    = this.get('top');
			var pbottom = this.get('bottom');
			var smain	= true; // main always on
			var sprev   = (pprev != null && pprev.hidden != true ? true : false);
			var sleft   = (pleft != null && pleft.hidden != true ? true : false);
			var sright  = (pright != null && pright.hidden != true ? true : false);
			var stop    = (ptop != null && ptop.hidden != true ? true : false);
			var sbottom = (pbottom != null && pbottom.hidden != true ? true : false);
			// calculate %
			if (ptop && String(ptop.size).substr((String(ptop.size).length-1)) == '%') {
				ptop.size = this.height * parseInt(ptop.size) / 100;
			}
			if (pleft && String(pleft.size).substr((String(pleft.size).length-1)) == '%') {
				pleft.size = this.height * parseInt(pleft.size) / 100;
			}
			if (pright && String(pright.size).substr((String(pright.size).length-1)) == '%') {
				pright.size = this.height * parseInt(pright.size) / 100;
			}
			if (pbottom && String(pbottom.size).substr((String(pbottom.size).length-1)) == '%') {
				pbottom.size = this.height * parseInt(pbottom.size) / 100;
			}
			if (pprev && String(pprev.size).substr((String(pprev.size).length-1)) == '%') {
				pprev.size = (this.height 
								- (ptop && !ptop.hidden ? ptop.size : 0) 
								- (pbottom && !pbottom.hidden ? pbottom.size : 0))
							* parseInt(pprev.size) / 100;
			}
			if (ptop) ptop.size = parseInt(ptop.size);
			if (pleft) pleft.size = parseInt(pleft.size);
			if (pprev) pprev.size = parseInt(pprev.size);
			if (pright) pright.size	= parseInt(pright.size);
			if (pbottom) pbottom.size = parseInt(pbottom.size);
			// top if any		
			if (ptop != null && ptop.hidden != true) {
				var l = 0;
				var t = 0;
				var w = this.width;
				var h = ptop.size;
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_top').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				ptop.width  = w;
				ptop.height = h;
				// resizer
				if (ptop.resizable) {
					t = ptop.size;
					h = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_top').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].startResize('top', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_top').hide();
			}
			// left if any
			if (pleft != null && pleft.hidden != true) {
				var l = 0;
				var t = 0 + (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0);
				var w = pleft.size;
				var h = this.height - (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0) - 
									  (sbottom ? pbottom.size + (pbottom.resizable ? this.spacer : this.padding) : 0);
				var e = $('#layout_'+ this.name +' #layout_'+ this.name +'_panel_left');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_left').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				pleft.width  = w;
				pleft.height = h;
				// resizer
				if (pleft.resizable) {
					l = pleft.size;
					w = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_left').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ew-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].startResize('left', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_left').hide();
				$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_left').hide();
			}
			// right if any
			if (pright != null && pright.hidden != true) {
				var l = this.width - pright.size;
				var t = 0 + (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0);
				var w = pright.size;
				var h = this.height - (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0) - 
									  (sbottom ? pbottom.size + (pbottom.resizable ? this.spacer : this.padding) : 0);
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_right').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				pright.width  = w;
				pright.height = h;
				// resizer
				if (pright.resizable) {
					l = l - this.spacer;
					w = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_right').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ew-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].startResize('right', event);
						return false;
					});
				}			
			} else {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_right').hide();
			}
			// bottom if any
			if (pbottom != null && pbottom.hidden != true) {
				var l = 0;
				var t = this.height - pbottom.size;
				var w = this.width;
				var h = pbottom.size;
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_bottom').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				pbottom.width  = w;
				pbottom.height = h;
				// resizer
				if (pbottom.resizable) {
					t = t - this.spacer;
					h = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_bottom').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].startResize('bottom', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_bottom').hide();
			}
			// main - always there
			var l = 0 + (sleft ? pleft.size + (pleft.resizable ? this.spacer : this.padding) : 0);
			var t = 0 + (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0);
			var w = this.width  - (sleft ? pleft.size + (pleft.resizable ? this.spacer : this.padding) : 0) - 
								  (sright ? pright.size + (pright.resizable ? this.spacer : this.padding): 0);
			var h = this.height - (stop ? ptop.size + (ptop.resizable ? this.spacer : this.padding) : 0) - 
								  (sbottom ? pbottom.size + (pbottom.resizable ? this.spacer : this.padding) : 0) -
								  (sprev ? pprev.size + (pprev.resizable ? this.spacer : this.padding) : 0);
			var e = $('#layout_'+ this.name +' #layout_'+ this.name +'_panel_main');
			if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
			$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_main').css({
				'display': 'block',
				'left': l + 'px',
				'top': t + 'px',
				'width': w + 'px',
				'height': h + 'px'
			});
			pmain.width  = w;
			pmain.height = h;
			
			// preview if any
			if (pprev != null && pprev.hidden != true) {
				var l = 0 + (sleft ? pleft.size + (pleft.resizable ? this.spacer : this.padding) : 0);
				var t = this.height - (sbottom ? pbottom.size + (pbottom.resizable ? this.spacer : this.padding) : 0) - pprev.size;
				var w = this.width  - (sleft ? pleft.size + (pleft.resizable ? this.spacer : this.padding) : 0) - 
									  (sright ? pright.size + (pright.resizable ? this.spacer : this.padding): 0);
				var h = pprev.size;
				var e = $('#layout_'+ this.name +' #layout_'+ this.name +'_panel_preview');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_preview').css({
					'display': 'block',
					'left': l + 'px',
					'top': t + 'px',
					'width': w + 'px',
					'height': h + 'px'
				}).show();
				pprev.width  = w;
				pprev.height = h;
				// resizer
				if (pprev.resizable) {
					t = t - this.spacer;
					h = this.spacer;
					$('#layout_'+ this.name +' #layout_'+ this.name +'_splitter_preview').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].startResize('preview', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +' #layout_'+ this.name +'_panel_preview').hide();
			}
	
			// send resize event to children
			for (var i in this.panels) { 
				var p = this.panels[i];
				if (typeof p.content == 'object' && p.content.resize) {
					p.content.resize(); 
				}
			}
			// send resize to all objects
			var obj = this;
			clearTimeout(this._resize_timer);
			this._resize_timer = setTimeout(function () {
				for (var e in w2ui) {
					// do not sent resize to panels, or it will get caught in a loop
					if (typeof w2ui[e].resize == 'function' && typeof w2ui[e].panels == 'undefined') w2ui[e].resize();
				}
			}, 200);
			
			this.trigger($.extend(eventData, { phase: 'after' }));	
		},
		
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));	
		},
		
		// --- INTERNAL FUNCTIONS
		
		initEvents: function () {
			var obj = this;
			$(window).on('resize', function (event) {
				w2ui[obj.name].resize()
			});
			$(window).on('mousemove', function (event) {
				w2ui[obj.name].doResize(event);
			});
			$(window).on('mouseup', function (event) {
				w2ui[obj.name].stopResize(event);
			});
		},
	
		startResize: function (type, evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			this.tmp_resizing = type;
			this.tmp_x = evnt.screenX;
			this.tmp_y = evnt.screenY;
			if (type == 'left' || type == 'right') {
				this.tmp_value = parseInt($('#layout_'+ this.name + '_splitter_'+ type)[0].style.left);
			}
			if (type == 'top' || type == 'preview' || type == 'bottom') {
				this.tmp_value = parseInt($('#layout_'+ this.name + '_splitter_'+ type)[0].style.top);
			}
		},
	
		doResize: function (evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (typeof this.tmp_resizing == 'undefined') return;
			var panel = this.get(this.tmp_resizing);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resizing', target: this.tmp_resizing, object: panel, event: evnt });	
			if (eventData.stop === true) return false;

			var p = $('#layout_'+ this.name + '_splitter_'+ this.tmp_resizing);
			if (!p.hasClass('active')) p.addClass('active');
			this.tmp_div_x = (evnt.screenX - this.tmp_x); 
			this.tmp_div_y = (evnt.screenY - this.tmp_y); 
			// left panel -> drag
			if (this.tmp_resizing == 'left' &&  (this.get('left').minSize - this.tmp_div_x > this.get('left').width)) {
				this.tmp_div_x = this.get('left').minSize - this.get('left').width;
			}
			if (this.tmp_resizing == 'left' && (this.get('main').minSize + this.tmp_div_x > this.get('main').width)) {
				this.tmp_div_x = this.get('main').width - this.get('main').minSize;
			}
			// right panel -> drag 
			if (this.tmp_resizing == 'right' &&  (this.get('right').minSize + this.tmp_div_x > this.get('right').width)) {
				this.tmp_div_x = this.get('right').width - this.get('right').minSize;
			}
			if (this.tmp_resizing == 'right' && (this.get('main').minSize - this.tmp_div_x > this.get('main').width)) {
				this.tmp_div_x =  this.get('main').minSize - this.get('main').width;
			}
			// top panel -> drag
			if (this.tmp_resizing == 'top' &&  (this.get('top').minSize - this.tmp_div_y > this.get('top').height)) {
				this.tmp_div_y = this.get('top').minSize - this.get('top').height;
			}
			if (this.tmp_resizing == 'top' && (this.get('main').minSize + this.tmp_div_y > this.get('main').height)) {
				this.tmp_div_y = this.get('main').height - this.get('main').minSize;
			}
			// bottom panel -> drag 
			if (this.tmp_resizing == 'bottom' &&  (this.get('bottom').minSize + this.tmp_div_y > this.get('bottom').height)) {
				this.tmp_div_y = this.get('bottom').height - this.get('bottom').minSize;
			}
			if (this.tmp_resizing == 'bottom' && (this.get('main').minSize - this.tmp_div_y > this.get('main').height)) {
				this.tmp_div_y =  this.get('main').minSize - this.get('main').height;
			}
			// preview panel -> drag 
			if (this.tmp_resizing == 'preview' &&  (this.get('preview').minSize + this.tmp_div_y > this.get('preview').height)) {
				this.tmp_div_y = this.get('preview').height - this.get('preview').minSize;
			}
			if (this.tmp_resizing == 'preview' && (this.get('main').minSize - this.tmp_div_y > this.get('main').height)) {
				this.tmp_div_y =  this.get('main').minSize - this.get('main').height;
			}
			switch(this.tmp_resizing) {
				case 'top':
				case 'preview':
				case 'bottom':
					this.tmp_div_x = 0;
					if (p.length > 0) p[0].style.top = (this.tmp_value + this.tmp_div_y) + 'px';
					break;
				case 'left':
				case 'right':
					this.tmp_div_y = 0;
					if (p.length > 0) p[0].style.left = (this.tmp_value + this.tmp_div_x) + 'px';
					break;
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));	
		},
	
		stopResize: function (evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			if (typeof this.tmp_resizing == 'undefined') return;
			// set new size
			var panel = this.get(this.tmp_resizing);
			switch (this.tmp_resizing) {
				case 'top':
					panel.size = parseInt(panel.size) + this.tmp_div_y;
					break;
				case 'preview':
				case 'bottom':
					panel.size = parseInt(panel.size) - this.tmp_div_y;
					break;
				case 'left':
					panel.size = parseInt(panel.size) + this.tmp_div_x;
					break;
				case 'right': 
					panel.size = parseInt(panel.size) - this.tmp_div_x;
					break;
			}	
			this.resize();
			$('#layout_'+ this.name + '_splitter_'+ this.tmp_resizing).removeClass('active');
			delete this.tmp_resizing;
		}		
	}
	
	$.extend(w2layout.prototype, $.w2event);
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2popup 	- popup widget
*		- $.w2popup	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
************************************************************************/

(function () {

	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2popup = function(method, options) {	
		if (typeof method  == 'undefined') {
			options = {};
			method  = 'open';
		}
		if ($.isPlainObject(method)) {
			options = method;		
			method  = 'open';
		}
		if (typeof options == 'undefined') options = {};
		// load options from markup
		var dlgOptions = {};
		if ($(this).length > 0 ) {
			if ($(this).find('div[rel=title]').length > 0) 		dlgOptions['title'] 	= $(this).find('div[rel=title]').html();
			if ($(this).find('div[rel=body]').length > 0) 		dlgOptions['body'] 		= $(this).find('div[rel=body]').html();
			if ($(this).find('div[rel=buttons]').length > 0) 	dlgOptions['buttons'] 	= $(this).find('div[rel=buttons]').html();
			if (parseInt($(this).css('width')) != 0)  dlgOptions['width']  = parseInt($(this).css('width'));
			if (parseInt($(this).css('height')) != 0) dlgOptions['height'] = parseInt($(this).css('height'));
			if (String($(this).css('overflow')) != 'undefined') dlgOptions['overflow'] = $(this).css('overflow');
			}
		// show popup
		return window.w2popup[method]($.extend({}, dlgOptions, options));
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	window.w2popup = {	
		defaults: {
			title			: '',
			body			: '',
			buttons			: '',
			overflow		: 'auto',
			color			: '#000',
			opacity			: 0.4,
			speed			: 0.3,
			modal			: false,
			width			: 500,
			height			: 300,
			showClose		: true,
			showMax			: false,
			transition		: null,
			onUnlock		: null,
			onOpen			: null,
			onChange		: null, 
			onBeforeClose	: null,
			onClose			: null,
			onMax			: null
		},
		
		open: function (options) {
			// get old options and merge them
			var old_options = $('#w2ui-popup').data('options');
			var options = $.extend({}, this.defaults, {
				body: '',
				renderTime: 0,
				onOpen: null,
				onChange: null,
				onBeforeClose: null,
				onClose: null
			}, old_options, options);
	
			if (window.innerHeight == undefined) {
				var width  = document.documentElement.offsetWidth;
				var height = document.documentElement.offsetHeight;
				if (w2utils.engine == 'IE7') { width += 21; height += 4; }
			} else {
				var width  = window.innerWidth;
				var height = window.innerHeight;
			}
			if (parseInt(width)  - 10 < parseInt(options.width))  options.width  = parseInt(width)  - 10;
			if (parseInt(height) - 10 < parseInt(options.height)) options.height = parseInt(height) - 10;
			var top  = ((parseInt(height) - parseInt(options.height)) / 2) * 0.8;
			var left = (parseInt(width) - parseInt(options.width)) / 2;
			
			// check if message is already displayed
			if ($('#w2ui-popup').length == 0) {
				// output message
				window.w2popup.lock($.extend({}, options, {
					onMouseDown: options.modal ? function () {
						$('#w2ui-lock').css({ 
							'-webkit-transition': '.1s', 
							'-moz-transition': '.1s', 
							'-ms-transition': '.1s', 
							'-o-transition': '.1s', 
							'opacity': '0.6',
						});			
						if (window.getSelection) window.getSelection().removeAllRanges();
					} : null,
					onMouseUp: options.modal ? function () {
						setTimeout(function () {
							$('#w2ui-lock').css({ 
								'-webkit-transition': '.1s', 
								'-moz-transition': '.1s', 
								'-ms-transition': '.1s', 
								'-o-transition': '.1s', 
								'opacity': options.opacity,
							});
						}, 100);
						if (window.getSelection) window.getSelection().removeAllRanges();
					} : function () { 
						$().w2popup('close'); 
					},
					onClick: function (event) {
						event.stopPropagation();
					}
				}));
			
				var msg = '<div id="w2ui-popup" class="w2ui-popup" style="position: '+(w2utils.engine == 'IE5' ? 'absolute' : 'fixed')+';'+
								'z-Index: 1200; width: '+ parseInt(options.width) +'px; height: '+ parseInt(options.height) +'px; opacity: 0; '+
								'-webkit-transform: scale(0.8); -moz-transform: scale(0.8); -ms-transform: scale(0.8); -o-transform: scale(0.8); '+
								'left: '+ left +'px; top: '+ top +'px;">';
				if (options.title != '') { 
					msg +='<div class="w2ui-msg-title">'+
						  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="$().w2popup(\'close\'); event.stopPropagation();">Close</div>' : '')+ 
						  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="$().w2popup(\'max\')">Max</div>' : '') + 
							  options.title +
						  '</div>'; 
				}
				msg += '<div class="w2ui-box1" style="'+(options.title == '' ? 'top: 0px !important;' : '')+(options.buttons == '' ? 'bottom: 0px !important;' : '')+'">';
				msg += '<div class="w2ui-msg-body'+ (!options.title != '' ? ' w2ui-msg-no-title' : '') + (!options.buttons != '' ? ' w2ui-msg-no-buttons' : '') +'" style="overflow: '+ options.overflow +'">'+ options.body +'</div>';
				msg += '</div>';
				msg += '<div class="w2ui-box2" style="'+(options.title == '' ? 'top: 0px !important;' : '')+(options.buttons == '' ? 'bottom: 0px !important;' : '')+'">';
				msg += '<div class="w2ui-msg-body'+ (!options.title != '' ? ' w2ui-msg-no-title' : '') + (!options.buttons != '' ? ' w2ui-msg-no-buttons' : '') +'" style="overflow: '+ options.overflow +'"></div>';
				msg += '</div>';
				if (options.buttons != '') { 
					msg += '<div class="w2ui-msg-buttons">'+ options.buttons +'</div>'; 
				}
				msg += '</div>';
				$('body').append(msg);
				// allow element to render
				setTimeout(function () {
					$('#w2ui-popup .w2ui-box2').hide();
					$('#w2ui-popup').css({ 
						'-webkit-transition': options.speed +'s opacity, '+ options.speed +'s -webkit-transform', 
						'-webkit-transform': 'scale(1)',
						'-moz-transition': options.speed +'s opacity, '+ options.speed +'s -moz-transform', 
						'-moz-transform': 'scale(1)',
						'-ms-transition': options.speed +'s opacity, '+ options.speed +'s -ms-transform', 
						'-ms-transform': 'scale(1)',
						'-o-transition': options.speed +'s opacity, '+ options.speed +'s -o-transform', 
						'-o-transform': 'scale(1)',
						'opacity': '1'
					});
				}, 1);
				// clean transform
				setTimeout(function () {
					$('#w2ui-popup').css({
						'-webkit-transform': '',
						'-moz-transform': '',
						'-ms-transform': '',
						'-o-transform': ''
					});
					if (typeof options.onOpen == 'function') { setTimeout(function () { options.onOpen(); }, 1); }
				}, options.speed * 1000);
			} else {
				// check if size changed
				if (typeof old_options == 'undefined' || old_options['width'] != options['width'] || old_options['height'] != options['height']) {
					$('#w2ui-panel').remove();
					window.w2popup.resize(options.width, options.height);
				}
				// show new items
				$('#w2ui-popup .w2ui-box2 > .w2ui-msg-body').html(options.body).css('overflow', options.overflow);
				$('#w2ui-popup .w2ui-msg-buttons').html(options.buttons);
				$('#w2ui-popup .w2ui-msg-title').html(
					  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="$().w2popup(\'close\')">Close</div>' : '')+ 
					  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="$().w2popup(\'max\')">Max</div>' : '') + 
					  options.title);
				// transition
				var div_old = $('#w2ui-popup .w2ui-box1')[0];
				var div_new = $('#w2ui-popup .w2ui-box2')[0];
				w2utils.transition(div_old, div_new, options.transition);
				div_new.className = 'w2ui-box1';
				div_old.className = 'w2ui-box2';	
				$(div_new).addClass('w2ui-current-box');		
				// remove max state
				$('#w2ui-popup').data('prev-size', null);
				// call event onChange
				setTimeout(function () {
					if (typeof options.onChange == 'function') options.onChange();
				}, 1);
			}		
			// save new options
			$('#w2ui-popup').data('options', options);	
			
			this.initMove();			
			return this;		
		},
		
		close: function (options) {
			var options = $.extend({}, $('#w2ui-popup').data('options'), options);
			if (typeof options.onBeforeClose == 'function') {
				if (options.onBeforeClose() === false) return;
			}
			$('#w2ui-popup, #w2ui-panel').css({ 
				'-webkit-transition': options.speed +'s opacity, '+ options.speed +'s -webkit-transform', 
				'-webkit-transform': 'scale(0.9)',
				'-moz-transition': options.speed +'s opacity, '+ options.speed +'s -moz-transform', 
				'-moz-transform': 'scale(0.9)',
				'-ms-transition': options.speed +'s opacity, '+ options.speed +'s -ms-transform', 
				'-ms-transform': 'scale(0.9)',
				'-o-transition': options.speed +'s opacity, '+ options.speed +'s -o-transform', 
				'-o-transform': 'scale(0.9)',
				'opacity': '0'
			});		
			window.w2popup.unlock({
				opacity: 0,
				onFinish: options.onFinish ? options.onFinish : null			
			});
			setTimeout(function () {
				$('#w2ui-popup').remove();
				$('#w2ui-panel').remove();
			}, options.speed * 1000);				
			if (typeof options.onClose == 'function') {
				options.onClose();
			}
		},
		
		max: function () {
			var options = $('#w2ui-popup').data('options');
			// if panel is out - remove it
			$('#w2ui-panel').remove();
			// resize
			if ($('#w2ui-popup').data('prev-size')) {
				var size = String($('#w2ui-popup').data('prev-size')).split(':');
				$('#w2ui-popup').data('prev-size', null);
				window.w2popup.resize(size[0], size[1], function () {
					if (typeof options.onMax == 'function') options.onMax();
				});
			} else {
				$('#w2ui-popup').data('prev-size', $('#w2ui-popup').css('width')+':'+$('#w2ui-popup').css('height'));
				window.w2popup.resize(10000, 10000, function () {
					if (typeof options.onMax == 'function') options.onMax();
				});
			}
		},
		
		get: function () {
			return $('#w2ui-popup').data('options');
		},
		
		clear: function() {
			$('#w2ui-popup .w2ui-msg-title').html('');
			$('#w2ui-popup .w2ui-msg-body').html('');
			$('#w2ui-popup .w2ui-msg-buttons').html('');
		},

		reset: function () {
			window.w2popup.open(window.w2popup.defaults);
		},
		
		load: function (options) {
			if (String(options.url) == 'undefined') {
				$.error('The url parameter is empty.');
				return;
			}
			var tmp = String(options.url).split('#');
			var url = tmp[0];
			var selector = tmp[1];
			if (String(options) == 'undefined') options = {};
			// load url
			var html = $('#w2ui-popup').data(url);
			if (typeof html != 'undefined') {
				popup(html, selector);
			} else {
				$.post(url, function (data, status, obj) {
					popup(obj.responseText, selector);
					$('#w2ui-popup').data(url, obj.responseText); // remember for possible future purposes
				});
			}
			function popup(html, selector) {
				$('body').append('<div id="w2ui-tmp" style="display: none">'+ html +'</div>');
				if (typeof selector != 'undefined' && $('#w2ui-tmp #'+selector).length > 0) {
					$('#w2ui-tmp #'+ selector).w2popup(options);
				} else {
					$('#w2ui-tmp > div').w2popup(options);
				}
				// link styles
				if ($('#w2ui-tmp > style').length > 0) {
					var style = $('<div>').append($('#w2ui-tmp > style').clone()).html();
					if ($('#w2ui-screenPopup #div-style').length == 0) {
						$('#w2ui-screenPopup').append('<div id="div-style" style="position: absolute; left: -100; width: 1px"></div>');
					}
					$('#w2ui-screenPopup #div-style').html(style);
				}
				$('#w2ui-tmp').remove();
			}
		},
		
		message: function (options) {
			$().w2tag(); // hide all tags
			if (parseInt(options.width) < 10)  options.width  = 10;
			if (parseInt(options.height) < 10) options.height = 10;
			if (typeof options.hideOnClick == 'undefined') options.hideOnClick = true;

			if ($('#w2ui-popup .w2ui-popup-message').length == 0) {
				var pwidth = parseInt($('#w2ui-popup').width());
				$('#w2ui-popup .w2ui-box1 .w2ui-msg-body')
					.append('<div class="w2ui-popup-message" style="position: absolute; top: 0px; display: none; '+
					        	(typeof options.width  != 'undefined' ? 'width: '+ options.width + 'px; left: '+ ((pwidth - options.width) / 2) +'px;' : 'left: 10px; right: 10px;') +
					        	(typeof options.height != 'undefined' ? 'height: '+ options.height + 'px;' : 'bottom: 6px;') +
					        	'-webkit-transition: .3s; -moz-transition: .3s; -ms-transition: .3s; -o-transition: .3s;"' +
								(options.hideOnClick === true ? 'onclick="$().w2popup(\'message\');"' : '') + '>'+
							'</div>');
				$('#w2ui-popup .w2ui-box1 .w2ui-msg-body').prop('scrollTop', 0);	
			} else {
				if (typeof options.width  == 'undefined') options.width  = w2utils.getSize($('#w2ui-popup .w2ui-popup-message'), 'width');
				if (typeof options.height == 'undefined') options.height = w2utils.getSize($('#w2ui-popup .w2ui-popup-message'), 'height');
			}
			var display = $('#w2ui-popup .w2ui-popup-message').css('display');
			$('#w2ui-popup .w2ui-popup-message').css({ 
				'-webkit-transform': (display == 'none' ? 'translateY(-'+ options.height + 'px)': 'translateY(0px)'),
				'-moz-transform': (display == 'none' ? 'translateY(-'+ options.height + 'px)': 'translateY(0px)'),
				'-ms-transform': (display == 'none' ? 'translateY(-'+ options.height + 'px)': 'translateY(0px)'),
				'-o-transform': (display == 'none' ? 'translateY(-'+ options.height + 'px)': 'translateY(0px)')
			});
			if (display == 'none') {
				$('#w2ui-popup .w2ui-popup-message').show().html(options.html);
				$('#w2ui-popup .w2ui-msg-buttons').fadeOut('slow');
				if (typeof options.onOpen == 'function') options.onOpen();
			} else {
				$('#w2ui-popup .w2ui-msg-buttons').fadeIn('slow');		
			}
			// timer needs to animation
			setTimeout(function () {
				$('#w2ui-popup .w2ui-popup-message').css({
					'-webkit-transform': (display == 'none' ? 'translateY(0px)': 'translateY(-'+ options.height +'px)'),
					'-moz-transform': (display == 'none' ? 'translateY(0px)': 'translateY(-'+ options.height +'px)'),
					'-ms-transform': (display == 'none' ? 'translateY(0px)': 'translateY(-'+ options.height +'px)'),
					'-o-transform': (display == 'none' ? 'translateY(0px)': 'translateY(-'+ options.height +'px)')
				});
			}, 1);
			setTimeout(function () {
				if (display != 'none') {
					$('#w2ui-popup .w2ui-popup-message').remove();		
					if (typeof options.onClose == 'function') options.onClose();
				}
			}, 300);
		},
		
		// --- INTERNAL FUNCTIONS
		
		lock: function (options) {
			if ($('#w2ui-lock').length > 0) return false;
			var options = $.extend({}, { 'onUnlock': null, 'onMouseDown': null, 'onMouseUp': null }, options);
			// show element
			$('body').append('<div id="w2ui-lock" onmousewheel="event.stopPropagation(); event.preventDefault()"'+
				'	style="position: '+(w2utils.engine == 'IE5' ? 'absolute' : 'fixed')+'; z-Index: 1199; left: 0px; top: 0px; '+
				'		   padding: 0px; margin: 0px; background-color: '+ options.color +'; width: 100%; height: 100%; opacity: 0;"></div>');	
			// lock screen
			setTimeout(function () {
				$('#w2ui-lock').css({ 
					'-webkit-transition': options.speed +'s opacity', 
					'-moz-transition': options.speed +'s opacity', 
					'-ms-transition': options.speed +'s opacity', 
					'-o-transition': options.speed +'s opacity', 
					'opacity': options.opacity 
				});
				$('body, body *').css({
					//'text-shadow': '0px 0px 5px rgb(0,0,0)',
					//'color': 'transparent'
				});	
			}, 1);
			//$('body').data('_old_overflow', $('body').css('overflow')).css({ 'overflow': 'hidden' });		
			// lock events
			if (typeof options.onMouseDown == 'function') { 
				$('#w2ui-lock').bind('mousedown', options.onMouseDown); 
			}
			if (typeof options.onMouseUp == 'function') { 
				$('#w2ui-lock').bind('mouseup', options.onMouseUp); 
			}
			return true;
		},
		
		unlock: function (options) {
			if ($('#w2ui-lock').length == 0) return false;	
			var options = $.extend({}, $('#w2ui-popup').data('options'), options);		
			$('#w2ui-lock').css({ 
				'-webkit-transition': options.speed +'s opacity', 
				'-moz-transition': options.speed +'s opacity', 
				'-ms-transition': options.speed +'s opacity', 
				'-o-transition': options.speed +'s opacity', 
				'opacity': options.opacity 
			});
			$('body, body *').css({
				//'text-shadow': '',
				//'color': ''
			});
			//$('body').css({ 'overflow': $('body').data('_old_overflow') });		
			setTimeout(function () { 
				$('#w2ui-lock').remove(); 
				if (typeof options.onUnlock == 'function') {  options.onUnlock(); }
			}, options.speed * 1000); 
			return true;
		},
	
		initMove: function () {
			var obj = this;
			$('#w2ui-popup .w2ui-msg-title')
				.on('mousedown', function () { obj.startMove.apply(obj, arguments); })
				.on('mousemove', function () { obj.doMove.apply(obj, arguments); })
				.on('mouseup',   function () { obj.stopMove.apply(obj, arguments); });
			$('#w2ui-popup .w2ui-msg-body')
				.on('mousemove', function () { obj.doMove.apply(obj, arguments); })
				.on('mouseup',   function () { obj.stopMove.apply(obj, arguments); });
			$('#w2ui-lock')
				.on('mousemove', function () { obj.doMove.apply(obj, arguments); })
				.on('mouseup',   function () { obj.stopMove.apply(obj, arguments); });
		},
	
		resize: function (width, height, callBack) {
			var options = $('#w2ui-popup').data('options');
			// calculate new position
			if (parseInt($(window).width())  - 10 < parseInt(width))  width  = parseInt($(window).width())  - 10;
			if (parseInt($(window).height()) - 10 < parseInt(height)) height = parseInt($(window).height()) - 10;
			var top  = ((parseInt($(window).height()) - parseInt(height)) / 2) * 0.8;
			var left = (parseInt($(window).width()) - parseInt(width)) / 2;		
			// resize there
			$('#w2ui-popup').css({
				'-webkit-transition': options.speed + 's width, '+ options.speed + 's height, '+ options.speed + 's left, '+ options.speed + 's top',
				'-moz-transition': options.speed + 's width, '+ options.speed + 's height, '+ options.speed + 's left, '+ options.speed + 's top',
				'-ms-transition': options.speed + 's width, '+ options.speed + 's height, '+ options.speed + 's left, '+ options.speed + 's top',
				'-o-transition': options.speed + 's width, '+ options.speed + 's height, '+ options.speed + 's left, '+ options.speed + 's top',
				'top': top,
				'left': left,
				'width': width,
				'height': height
			});
			if (typeof callBack == 'function') {
				setTimeout(function () {
					callBack();
				}, options.speed * 1000);
			}
		},
		
		startMove: function (evnt) {
			if (!evnt) evnt = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			this.resizing = true;
			this.tmp_x = evnt.screenX;
			this.tmp_y = evnt.screenY;
			evnt.stopPropagation();
			evnt.preventDefault();
		},
		
		doMove: function (evnt) {
			if (this.resizing != true) return;
			if (!evnt) evnt = window.event;
			this.tmp_div_x = (evnt.screenX - this.tmp_x); 
			this.tmp_div_y = (evnt.screenY - this.tmp_y); 
			$('#w2ui-popup').css({
				'-webkit-transition': 'none',
				'-webkit-transform': 'translate3d('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px, 0px)',
				'-moz-transition': 'none',
				'-moz-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)',
				'-ms-transition': 'none',
				'-ms-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)',
				'-o-transition': 'none',
				'-o-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)'
			});
			$('#w2ui-panel').css({
				'-webkit-transition': 'none',
				'-webkit-transform': 'translate3d('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px, 0px)',
				'-moz-transition': 'none',
				'-moz-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)',
				'-ms-transition': 'none',
				'-ms-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px',
				'-o-transition': 'none',
				'-o-transform': 'translate('+ this.tmp_div_x +'px, '+ this.tmp_div_y +'px)'
			});
		},
	
		stopMove: function (evnt) {
			if (this.resizing != true) return;
			if (!evnt) evnt = window.event;
			this.tmp_div_x = (evnt.screenX - this.tmp_x); 
			this.tmp_div_y = (evnt.screenY - this.tmp_y); 			
			$('#w2ui-popup').css({
				'-webkit-transition': 'none',
				'-webkit-transform': 'translate3d(0px, 0px, 0px)',
				'-moz-transition': 'none',
				'-moz-transform': 'translate(0px, 0px)',
				'-ms-transition': 'none',
				'-ms-transform': 'translate(0px, 0px)',
				'-o-transition': 'none',
				'-o-transform': 'translate(0px, 0px)',
				'left': (parseInt($('#w2ui-popup').css('left')) + parseInt(this.tmp_div_x)) + 'px',
				'top':	(parseInt($('#w2ui-popup').css('top'))  + parseInt(this.tmp_div_y)) + 'px'
			});
			$('#w2ui-panel').css({
				'-webkit-transition': 'none',
				'-webkit-transform': 'translate3d(0px, 0px, 0px)',
				'-moz-transition': 'none',
				'-moz-transform': 'translate(0px, 0px)',
				'-ms-transition': 'none',
				'-ms-transform': 'translate(0px, 0px)',
				'-o-transition': 'none',
				'-o-transform': 'translate(0px, 0px)',
				'left': (parseInt($('#w2ui-panel').css('left')) + parseInt(this.tmp_div_x)) + 'px',
				'top':	(parseInt($('#w2ui-panel').css('top'))  + parseInt(this.tmp_div_y)) + 'px'
			});
			delete this.resizing;
		}		
	}

	window.w2alert = function (msg, title) {
		if (typeof title == 'undefined') {
			title = 'Notification';
		}
		$().w2popup({
			width 	: 350,
			height 	: 160,
			title   : title,
			body    : '<div style="padding: 12px; padding-right: 24px; text-align: center">' + msg +'</div>',
			buttons : '<input type="button" value="Ok" style="width: 60px" onclick="$().w2popup(\'close\');">'
		});
		$('#w2ui-screenPopup #btnYes').on('click', function () {
			$().w2popup('close');
			if (typeof callBack == 'function') callBack();
		});
	};

	window.w2confirm = function (msg, title, callBack) {
		if (typeof callBack == 'undefined' || typeof title == 'function') {
			callBack = title; 
			title = 'Confirmation';
		}
		if (typeof title == 'undefined') {
			title = 'Confirmation';
		}
		$().w2popup({
			width 	: 350,
			height 	: 160,
			title   : title,
			body    : '<div style="padding: 12px; padding-right: 24px; text-align: center">' + msg +'</div>',
			buttons : '<input id="buttonNo" type="button" value="No" style="width: 60px; margin-right: 5px">&nbsp;'+
					  '<input id="buttonYes" type="button" value="Yes" style="width: 60px">'
		});
		$('#w2ui-screenPopup #buttonNo').on('click', function () {
			$().w2popup('close');
		});
		$('#w2ui-screenPopup #buttonYes').on('click', function () {
			$().w2popup('close');
			if (typeof callBack == 'function') callBack();
		});
	};
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2tabs 	- tabs widget
*		- $.w2tabs	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
************************************************************************/

(function () {
	var w2tabs = function (options) {
		this.box		= null;		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.active		= null;
		this.tabs		= [];
		this.right		= '';
		this.style		= '';
		this.onClick	= null;
		this.onClose	= null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null;

		$.extend(true, this, options);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2tabs = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2tabs().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			// extend tabs
			var tabs   = method.tabs;
			var object = new w2tabs(method);
			$.extend(object, { tabs: [], handlers: [] });
			for (var i in tabs) { object.tabs[i] = $.extend({}, w2tabs.prototype.tab, tabs[i]); }		
			if ($(this).length != 0) {
				object.box = $(this)[0];
				$(this).data('w2name', object.name);
				object.render();
			}
			// register new object
			w2ui[object.name] = object;
			return object;

		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2tabs' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2tabs.prototype = {
		tab : {
			id: 			null,		// commnad to be sent to all event handlers
			caption: 		'',
			hidden: 		false,
			disabled: 		false,
			closable:		false,
			hint: 			'',
			onClick: 		null,
			onRefresh: 		null,
			onClose: 		null
		},
		
		add: function (tab) {
			return this.insert(null, tab);
		},
		
		insert: function (id, tab) {
			if (!$.isArray(tab)) tab = [tab];
			// assume it is array
			for (var r in tab) {
				// checks
				if (String(tab[r].id) == 'undefined') {
					$.error('The parameter "id" is required but not supplied. (obj: '+ this.name +')');
					return;
				}
				var unique = true;
				for (var i in this.tabs) { if (this.tabs[i].id == tab[r].id) { unique = false; break; } }
				if (!unique) {
					$.error('The parameter "id='+ tab[r].id +'" is not unique within the current tabs. (obj: '+ this.name +')');
					return;
				}
				if (!w2utils.isAlphaNumeric(tab[r].id)) {
					$.error('The parameter "id='+ tab[r].id +'" must be alpha-numeric + "-_". (obj: '+ this.name +')');
					return;
				}
				// add tab
				var tab = $.extend({}, tab, tab[r]);
				if (id == null || typeof id == 'undefined') {
					this.tabs.push(tab);
				} else {
					var middle = this.getIndex(id);
					this.tabs = this.tabs.slice(0, middle).concat([tab], this.tabs.slice(middle));
				}		
				this.refresh(tab[r].id);		
			}
		},
		
		remove: function (id) {
			var removed = 0;
			for (var a in arguments) {
				var tab = this.get(arguments[a]);
				if (!tab) return false;
				removed++;
				// remove from array
				this.tabs.splice(this.getIndex(tab.id), 1);
				// remove from screen
				$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ tab.id).remove();
			}
			return removed;
		},
		
		set: function (id, tab) {
			var tab = this.getIndex(id);
			if (tab == null) return false;
			$.extend(this.tabs[tab], tab);
			this.refresh(id);
			return true;	
		},
		
		get: function (id) {
			var tab = null;
			for (var i in this.tabs) {
				if (this.tabs[i].id == id) { tab = this.tabs[i]; break; }
			}
			return tab;	
		},
		
		getIndex: function (id) {
			var index = null;
			for (var i in this.tabs) {
				if (this.tabs[i].id == id) { index = i; break; }
			}
			return index;
		},
		
		show: function () {
			var shown = 0;
			for (var a in arguments) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.hidden === false) continue;
				tab.hidden = false;
				this.refresh(tab.id);
				shown++;
			}
			return shown;
		},
		
		hide: function () {
			var hidden = 0;
			for (var a in arguments) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.hidden === true) continue;
				tab.hidden = true;
				this.refresh(tab.id);
				hidden++;
			}
			return hidden;
		},
		
		enable: function (id) {
			var enabled = 0;
			for (var a in arguments) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.disabled === false) continue;
				tab.disabled = false;
				this.refresh(tab.id);
				enabled++;
			}
			return enabled;
		},
		
		disable: function (id) {
			var disabled = 0;
			for (var a in arguments) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.disabled === true) continue;
				tab.disabled = true;
				this.refresh(tab.id);
				disabled++;
			}
			return disabled;
		},
			
		refresh: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (String(id) == 'undefined') {
				// refresh all
				for (var i in this.tabs) this.refresh(this.tabs[i].id);
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), tab: this.get(id) });	
			if (eventData.stop === true) return false;
			// create or refresh only one item
			var tab = this.get(id);
			if (tab == null) return;
			
			var jq_el   = $(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ tab.id);
			var tabHTML = (tab.closable ? '<div class="w2ui-tab-close" onclick="w2ui[\''+ this.name +'\'].doClose(\''+ tab.id +'\', event);"></div>' : '') +
						  '	<div class="w2ui-tab '+ (this.active == tab.id ? 'active' : '') +'" title="'+ (typeof tab.hint != 'undefined' ? tab.hint : '') +'"'+
						  '		onclick="w2ui[\''+ this.name +'\'].doClick(\''+ tab.id +'\', event);">' + tab.caption + '</div>';
			if (jq_el.length == 0) {
				// does not exist - create it
				var addStyle = '';
				if (tab.hidden) { addStyle += 'display: none;'; }
				if (tab.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; -o-opacity: 0.2; filter:alpha(opacity=20);'; }
				html = '<td id="tabs_'+ this.name + '_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML + '</td>';
				if (this.getIndex(id) != this.tabs.length-1 && $(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ this.tabs[parseInt(this.getIndex(id))+1].id).length > 0) {
					$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ this.tabs[parseInt(this.getIndex(id))+1].id).before(html);
				} else {
					$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_right').before(html);
				}
			} else {
				// refresh
				jq_el.html(tabHTML);
				if (tab.hidden) { jq_el.css('display', 'none'); }
							else { jq_el.css('display', ''); }
				if (tab.disabled) { jq_el.css({ 'opacity': '0.2', '-moz-opacity': '0.2', '-webkit-opacity': '0.2', '-o-opacity': '0.2', 'filter': 'alpha(opacity=20)' }); }
							else { jq_el.css({ 'opacity': '1', '-moz-opacity': '1', '-webkit-opacity': '1', '-o-opacity': '1', 'filter': 'alpha(opacity=100)' }); }
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
			// default action
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (String(box) != 'undefined' && box != null) { 
				$(this.box).html(''); 
				this.box = box;
			}
			if (!this.box) return;
			// render all buttons
			$(this.box).html('');
			var html = '<div id="tabs_'+ this.name +'" class="w2ui-reset w2ui-tabs" style="'+ this.style +'">'+
					   '	<table cellspacing="0" cellpadding="1" width="100%">'+
					   '		<tr><td width="100%" id="tabs_'+ this.name +'_right" align="right">'+ this.right +'</td></tr>'+
					   '	</table>'+
					   '</div>';
			$(this.box).append(html);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
		},
		
		resize: function (width, height) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });	
			if (eventData.stop === true) return false;
			// empty function
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		// ===================================================
		// -- Internal Event Handlers
	
		doClick: function (id, event) {
			var tab = this.get(id);
			if (tab == null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'click', target: id, tab: this.get(id), event: event });	
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('#tabs_'+ this.name +'_tab_'+ this.active +' .w2ui-tab').removeClass('active');
			this.active = tab.id;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh(id);
		},
		
		doClose: function(id, event) {
			var tab = this.get(id);
			if (tab == null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'close', target: id, tab: this.get(id), event: event });	
			if (eventData.stop === true) return false;
			// default action
			var obj = this;
			$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ tab.id).css({ 
				'-webkit-transition': '.2s', 
				'-moz-transition': '2s', 
				'-ms-transition': '.2s', 
				'-o-transition': '.2s', 
				opacity: '0' });
			setTimeout(function () {
				var width = $(obj.box).find('.w2ui-tabs #tabs_'+ obj.name +'_tab_'+ tab.id).width();
				$(obj.box).find('.w2ui-tabs #tabs_'+ obj.name +'_tab_'+ tab.id)
					.html('<div style="width: '+ width +'px; -webkit-transition: .2s; -moz-transition: .2s; -ms-transition: .2s; -o-transition: .2s"></div>')
				setTimeout(function () {
					$(obj.box).find('.w2ui-tabs #tabs_'+ obj.name +'_tab_'+ tab.id).find(':first-child').css({ 'width': '0px' });
				}, 50);
			}, 200);
			setTimeout(function () {
				obj.remove(id);		
			}, 450);
			// event before
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
		},

		doInsert: function(id, tab) {		
			if (this.get(id) == null) return;
			if (!$.isPlainObject(tab)) return;
			// check for unique
			var unique = true;
			for (var i in this.tabs) { if (this.tabs[i].id == tab.id) { unique = false; break; } }
			if (!unique) {
				$.error('The parameter "id='+ tab.id +'" is not unique within the current tabs. (obj: '+ this.name +')');
				return;
			}
			// insert simple div
			var jq_el   = $(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ tab.id);
			if (jq_el.length != 0) return; // already exists
			// measure width
			var tmp = '<div id="_tmp_tabs" class="w2ui-reset w2ui-tabs" style="position: absolute; top: -1000px;">'+
				'<table cellspacing="0" cellpadding="1" width="100%"><tr>'+
				'<td id="_tmp_simple_tab" style="" valign="middle">'+
					(tab.closable ? '<div class="w2ui-tab-close"></div>' : '') +
				'	<div class="w2ui-tab '+ (this.active == tab.id ? 'active' : '') +'">'+ tab.caption +'</div>'+
				'</td></tr></table>'+
				'</div>';
			$('body').append(tmp);
			// create dummy element
			tabHTML = '<div style="width: 1px; -webkit-transition: 0.2s; -moz-transition: 0.2s; -ms-transition: 0.2s; -o-transition: 0.2s;">&nbsp;</div>';
			var addStyle = '';
			if (tab.hidden) { addStyle += 'display: none;'; }
			if (tab.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; -o-opacity: 0.2; filter:alpha(opacity=20);'; }
			html = '<td id="tabs_'+ this.name +'_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML +'</td>';
			if (this.getIndex(id) != this.tabs.length && $(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ this.tabs[parseInt(this.getIndex(id))].id).length > 0) {
				$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ this.tabs[parseInt(this.getIndex(id))].id).before(html);
			} else {
				$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_right').before(html);
			}
			// -- move
			var obj = this;
			setTimeout(function () { 
				var width = $('#_tmp_simple_tab').width();
				$('#_tmp_tabs').remove();
				$('#tabs_'+ obj.name +'_tab_'+ tab.id + ' > div').css('width', width+'px'); 
			}, 1);
			setTimeout(function () {
				// insert for real
				obj.insert(id, tab);
			}, 200);
		}
	}
	
	$.extend(w2tabs.prototype, $.w2event);
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2toolbar 	- toolbar widget
*		- $.w2toolbar	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
************************************************************************/

(function () {
	var w2toolbar = function (options) {
		this.box		= null,		// DOM Element that holds the element
		this.name 		= null,		// unique name for w2ui
		this.items 		= [],
		this.right 		= '',		// HTML text on the right of toolbar
		this.onClick 	= null,
		this.onRender 	= null, 
		this.onRefresh	= null,
		this.onResize   = null,
		this.onDestroy  = null
	
		$.extend(true, this, options);
	}
	
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2toolbar = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2toolbar().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			var items = method.items;
			// extend items
			var object = new w2toolbar(method);
			$.extend(object, { items: [], handlers: [] });
			
			for (var i in items) { object.items[i] = $.extend({}, w2toolbar.prototype.item, items[i]); }		
			if ($(this).length != 0) {
				object.box = $(this)[0];
				$(this).data('w2name', object.name);
				object.render();
			}
			// register new object
			w2ui[object.name] = object;
			return object;
			
		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2toolbar' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2toolbar.prototype = {
		item: {
			id: 			null,		// commnad to be sent to all event handlers
			type: 			'button',	// button, check, radio, drop, menu, break, html, spacer
			caption: 		'',
			html: 			'', 
			img: 			'',	
			hidden: 		false,
			disabled: 		false,
			arrow: 			true,		// arrow down for drop/menu types
			hint: 			'',
			group: 			null, 		// used for radio buttons
			items: 			null, 		// for type menu it is an array of items in the menu
			checked: 		false, 		// used for radio buttons
			onClick: 		null
		},
	
		add: function (items) {
			this.insert(null, items);
		},
		
		insert: function (id, items) {
			if (!$.isArray(items)) items = [items];
			for (var o in items) {
				// checks
				if (typeof items[o].type == 'undefined') {
					$.error('The parameter "type" is required but not supplied in w2toolbar.add() method.');
					return;
				}
				if ($.inArray(String(items[o].type), ['button', 'check', 'radio', 'drop', 'menu', 'break', 'html', 'spacer']) == -1) {
					$.error('The parameter "type" should be one of the following [button, check, radio, drop, menu, break, html, spacer] '+
							'in w2toolbar.add() method.');
					return;
				}
				if (typeof items[o].id == 'undefined') {
					$.error('The parameter "id" is required but not supplied in w2toolbar.add() method.');
					return;
				}
				var unique = true;
				for (var i = 0; i < this.items.length; i++) { if (this.items[i].id == items[o].id) { unique = false; return; } }
				if (!unique) {
					$.error('The parameter "id" is not unique within the current toolbar.');
					return;
				}
				if (!w2utils.isAlphaNumeric(items[o].id)) {
					$.error('The parameter "id" must be alpha-numeric + "-_".');
					return;
				}
				// add item
				var it = $.extend({}, w2toolbar.prototype.item, items[o]);
				if (id == null || typeof id == 'undefined') {
					this.items.push(it);
				} else {
					var middle = this.getIndex(id);
					this.items = this.items.slice(0, middle).concat([it], this.items.slice(middle));
				}		
				this.refresh(items[o].id);
			}
		},
		
		remove: function (id) {
			var removed = 0;
			for (var a in arguments) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				removed++;
				// remove from screen
				$(this.box).find('.w2ui-toolbar #'+ this.name +'_item_'+ it.id).remove();
				// remove from array
				var ind = this.getIndex(it.id);
				if (ind) this.items.splice(ind, 1);
			}
			return removed;
		},
		
		set: function (id, options) {
			var item = this.getIndex(id);
			if (item == null) return false;
			$.extend(this.items[item], options);
			this.refresh(id);
			return true;	
		},
		
		get: function (id) {
			var item = null;
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].id == id) { item = this.items[i]; break; }
			}
			return item;	
		},
		
		getIndex: function (id) {
			var index = null;
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].id == id) { return i; }
			}
			return index;
		},
		
		show: function (id) {
			var items = 0;
			for (var a in arguments) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.hidden = false;
				this.refresh(it.id);
			}
			return items;
		},
		
		hide: function (id) {
			var items = 0;
			for (var a in arguments) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.hidden = true;
				this.refresh(it.id);
			}
			return items;
		},
		
		enable: function (id) {
			var items = 0;
			for (var a in arguments) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.disabled = false;
				this.refresh(it.id);
			}
			return items;
		},
		
		disable: function (id) {
			var items = 0;
			for (var a in arguments) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.disabled = true;
				this.refresh(it.id);
			}
			return items;
		},
		
		check: function (id) {
			var items = 0;
			for (var a in arguments) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.checked = true;
				this.refresh(it.id);
			}
			return items;
		},
		
		uncheck: function (id) {
			var items = 0;
			for (var a in arguments) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				items++;
				it.checked = false;
				this.refresh(it.id);
			}
			return items;
		},
		
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
	 
			if (typeof box != 'undefined' && box != null) { 
				$(this.box).html(''); 
				this.box = box;
			}
			if (!this.box) return;
			// render all buttons
			$(this.box).html('');
			var html = '<div id="'+ this.name +'_toolbar" class="w2ui-reset w2ui-toolbar">'+
					   '<table cellspacing="0" cellpadding="0" width="100%">'+
					   '<tr>';
			for (var i = 0; i < this.items.length; i++) {
				var it = this.items[i];
				if (it == null)  continue;
				var addStyle = '';
				if (it.hidden) { addStyle += 'display: none;'; }
				if (it.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; -o-opacity: 0.2; filter:alpha(opacity=20);'; }
				if (it.type == 'spacer') {
					html += '<td width="100%" id="'+ this.name +'_item_'+ it.id +'" align="right"></td>';
				} else {
					html += '<td id="'+ this.name + '_item_'+ it.id +'" style="'+ addStyle +'" valign="middle">'+ 
								this.getItemHTML(it) + 
							'</td>';
				}
			}
			html += '<td width="100%" id="'+ this.name +'_right" align="right">'+ this.right +'</td>';
			html += '</tr>'+
					'</table>'+
					'</div>';
			$(this.box).append(html);
			// append global drop-box that can be on top of everything
			if ($('#w2ui-global-drop').length == 0) $('body').append('<div id="w2ui-global-drop" class="w2ui-reset"></div>');
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		refresh: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), item: this.get(id) });	
			if (eventData.stop === true) return false;
			
			if (typeof id == 'undefined') {
				// refresh all
				for (var i = 0; i < this.items.length; i++) this.refresh(this.items[i].id);
			}
			// create or refresh only one item
			var it = this.get(id);
			if (it == null) return;
			
			var jq_el = $(this.box).find('.w2ui-toolbar #'+ this.name +'_item_'+ it.id);
			var html  = this.getItemHTML(it);
			if (jq_el.length == 0) {
				// does not exist - create it
				var addStyle = '';
				if (it.hidden) { addStyle += 'display: none;'; }
				if (it.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; -o-opacity: 0.2; filter:alpha(opacity=20);'; }
				html = '<td id="'+ this.name + '_item_'+ it.id +'" style="'+ addStyle +'" valign="middle">'+ html + '</td>';
				if (this.getIndex(id) == this.items.length-1) {
					$(this.box).find('.w2ui-toolbar #'+ this.name +'_right').before(html);
				} else {
					$(this.box).find('.w2ui-toolbar #'+ this.name +'_item_'+ this.items[parseInt(this.getIndex(id))+1].id).before(html);
				}
			} else {
				// refresh
				jq_el.html(html);
				if (it.hidden) { jq_el.css('display', 'none'); }
							else { jq_el.css('display', ''); }
				if (it.disabled) { jq_el.css({ 'opacity': '0.2', '-moz-opacity': '0.2', '-webkit-opacity': '0.2', '-o-opacity': '0.2', 'filter': 'alpha(opacity=20)' }); }
							else { jq_el.css({ 'opacity': '1', '-moz-opacity': '1', '-webkit-opacity': '1', '-o-opacity': '1', 'filter': 'alpha(opacity=100)' }); }
			}
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		resize: function (width, height, immediate) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });	
			if (eventData.stop === true) return false;

			// empty function

			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
	
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		// ========================================
		// --- Internal Functions
		
		getMenuHTML: function (item) { 
			var menu_html = "<table cellspacing=\"0\" style=\"padding: 5px 0px;\">";
			for (var f = 0; f < item.items.length; f++) { 
				if (typeof item.items[f] == 'string') {
					var tmp = item.items[f].split('|');
					if (typeof tmp[2] == 'undefined') tmp[2] = tmp[0];
				} else {
					var tmp = [];
					// text == caption
					if (typeof item.items[f].text  == 'undefined' && typeof item.items[f].caption != 'undefined') item.items[f].text = item.items[f].caption;
					// icon == img
					if (typeof item.items[f].icon  == 'undefined' && typeof item.items[f].img != 'undefined') item.items[f].icon = item.items[f].img;
					// value == id == cmd
					if (typeof item.items[f].value == 'undefined' && typeof item.items[f].id != 'undefined')  item.items[f].value = item.items[f].id;
					if (typeof item.items[f].value == 'undefined' && typeof item.items[f].cmd != 'undefined') item.items[f].value = item.items[f].cmd;
					tmp[0] = item.items[f].text;
					tmp[1] = item.items[f].icon;
					tmp[2] = typeof item.items[f].value != 'undefined' ? item.items[f].value : item.items[f].text;
				}
				menu_html += "<tr style=\"cursor: default;\" "+
					"	onmouseover=\"$(this).addClass('w2ui-selected');\" onmouseout=\"$(this).removeClass('w2ui-selected');\" "+
					"	onclick=\"var obj = w2ui['"+ this.name +"']; obj.doDropOut('"+ item.id +"', 0); "+
					"			  obj.doClick('"+ item.id +"', event, '"+ f +"');\">"+
					"<td style='padding: 3px 3px 3px 6px'><div class=\""+ (typeof tmp[1] != 'undefined' ? 'w2ui-icon ' : '') + tmp[1] +"\"></div></td>"+
					"<td style='padding: 3px 10px 3px 3px'>"+ tmp[0] +"</td>"+
					"</tr>";
			}
			menu_html += "</table>";
			return menu_html;
		},
		
		getItemHTML: function (item) {
			var html = '';
			
			if (item.caption == null) item.caption = '';
			if (item.img == null) item.img = '';
			var transparent = 'transparent';
			var addToText   = '';
			
			if (item.img != '') {
				if (w2utils.engine == 'IE5') {
					if (item.disabled) {
						addToText   = "FILTER: alpha(opacity=20);";
						butPicture  = 'src="'+ item.img +'" style="FILTER: alpha(opacity=20);"';
					} else {
						butPicture  = 'src="images/empty.gif" style="Filter:Progid:DXImageTransform.Microsoft.AlphaImageLoader(src='+ item.img + ', opacity=20)"';
					}
				} else {
					butPicture  = 'src="'+ item.img +'"';
				}
			}
			if (typeof item.hint == 'undefined') item.hint = '';
	
			switch (item.type) {
				case 'menu':
					item.html = this.getMenuHTML(item);
				case 'button':	
				case 'check':
				case 'radio':
				case 'drop':
					html +=  '<table cellpadding="0" cellspacing="0" title="'+ item.hint +'" class="w2ui-tab0 '+ (item.checked ? 'checked' : '') +'" '+
							 '       onmouseover = "var el=w2ui[\''+ this.name + '\']; if (el) el.doOver(\''+ item.id +'\', event);" '+
							 '       onmouseout  = "var el=w2ui[\''+ this.name + '\']; if (el) el.doOut(\''+ item.id +'\', event);" '+
							 '       onmousedown = "var el=w2ui[\''+ this.name + '\']; if (el) el.doDown(\''+ item.id +'\', event);" '+
							 '       onmouseup   = "var el=w2ui[\''+ this.name + '\']; if (el) el.doClick(\''+ item.id +'\', event);" '+
							 '>'+
							 '<tr><td>'+
							 '  <table cellpadding="1" cellspacing="0" class="w2ui-tab1 '+ (item.checked ? 'checked' : '') +'">'+
							 '  <tr>'+
									(item.img != '' ? '<td><div class="w2ui-tb-image w2ui-icon '+ item.img +'"></div></td>' : '<td>&nbsp;</td>') +
									(item.caption != '' ? '<td class="w2ui-tb-caption" style="'+ addToText +'" nowrap>'+ item.caption +'</td>' : '') +
									(((item.type == 'drop' || item.type == 'menu') && item.arrow !== false) ? 
										'<td class="w2ui-tb-down" nowrap>&nbsp;&nbsp;&nbsp;</td>' : '') +
							 '  </tr></table>'+
							 '</td></tr></table>';
					break;
								
				case 'break':
					html +=  '<table cellpadding="0" cellspacing="0" style="width 1px; height: 22px; margin-top: 2px;"><tr>'+
							 '    <td><div class="w2ui-break">&nbsp;</div></td>'+
							 '</tr></table>';
					break;
	
				case 'html':
					html +=  '<table cellpadding="0" cellspacing="0" style="height: 22px; margin-top: 2px;'+ addToText +';"><tr>'+
							 '    <td nowrap>' + item.html + '</td>'+
							 '</tr></table>';
					break;
			}
			// drop div
			html += '<div class="w2ui-drop-box"></div>';
			
			var newHTML = '';
			if (typeof item.onRender == 'function') newHTML = item.onRender.call(this, item.id, html);
			if (typeof this.onRender == 'function') newHTML = this.onRender(item.id, html);
			if (newHTML != '' && typeof newHTML != 'undefined') html = newHTML;
			return html;					
		},
		
		doOver: function (id) {
			var it = this.get(id);
			if (it && !it.disabled) {
				$('#'+ this.name +'_item_'+ it.id + ' table').addClass('over');
				
				if (it.type == 'drop' || it.type == 'menu') { clearTimeout(it.timer); }
			}
		},
		
		doOut: function (id, timeout) {
			var it = this.get(id);
			if (typeof timeout == 'undefined') timeout = 400;
			if (it && !it.disabled) {
				$('#'+ this.name +'_item_'+ it.id + ' table').removeClass('over');
	
				if (it.type == 'drop' || it.type == 'menu') { // hide drop
					var obj = this;
					it.timer = setTimeout( function () {
						var el  = w2ui[obj.name];
						var btn = it; 
						$('#'+ this.name +'_item_'+ btn.id + ' div.w2ui-drop-box').hide();
						if ($('#w2ui-global-drop').data('tb-id') == btn.id) $('#w2ui-global-drop').hide();
						btn.checked = false;
						obj.refresh(btn.id);
					}, timeout);
				}
			}
		},
		
		doDown: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var it = this.get(id);
			if (it && !it.disabled) {
				$('#'+ this.name +'_item_'+ it.id + ' table').addClass('down');
				// drop items
				if (it.type == 'drop' || it.type == 'menu') {
					if (!it.checked) {
						$('table.w2ui-toolbar div.w2ui-drop-box').hide();
						$('#'+ this.name +'_item_'+ it.id + ' div.w2ui-drop-box').show();
						if ($('#w2ui-global-drop').data('tb-id') == it.id) $('#w2ui-global-drop').hide();
						$('#w2ui-global-drop').css({
							left: $('#'+ this.name +'_item_'+ it.id + ' div.w2ui-drop-box').offset().left + 'px',
							top: $('#'+ this.name +'_item_'+ it.id + ' div.w2ui-drop-box').offset().top + 'px'
						}).html(it.html).show().data('tb-id', it.id);
						// events
						var obj = this;
						$('#w2ui-global-drop').unbind('mouseover').unbind('mouseout');
						$('#w2ui-global-drop').bind('mouseover', function (evt) {
							var el = w2ui[obj.name]; 
							if (el) el.doDropOver(it.id);
						});
						$('#w2ui-global-drop').bind('mouseout', function (evt) {
							var el = w2ui[obj.name]; 
							if (el) el.doDropOut(it.id);
						});
					} else {
						$('#'+ this.name +'_item_'+ it.id + ' div.w2ui-drop-box').hide();
						if ($('#w2ui-global-drop').data('tb-id') == it.id) $('#w2ui-global-drop').hide();
					}
				}
			}
		},
		
		doDropOver: function (id) {
			var it = this.get(id);
			clearTimeout(it.timer);
		},
		
		doDropOut: function (id, timeout) {
			var it  = this.get(id);
			var obj = this;
			if (typeof timeout == 'undefined') timeout = 400;
			if (typeof id === 'undefined') {
				for (var i = 0; i < this.items.length; i++) {
					var it = this.items[i];
					if (it.type == 'drop' || it.type == 'menu') { it.checked = false; this.refresh(it.id); }
					$('#'+ this.name +'_item_'+ this.items[i].id +' div.w2ui-drop-box').hide();
					if ($('#w2ui-global-drop').data('tb-id') == this.items[i].id) $('#w2ui-global-drop').hide();
				} 
			} else {	
				it.timer = setTimeout( function () {
					var el  = w2ui[obj.name];
					var btn = it; 
					$('#'+ this.name +'_item_'+ btn.id + ' div.w2ui-drop-box').hide();
					if ($('#w2ui-global-drop').data('tb-id') == btn.id) $('#w2ui-global-drop').hide();
					btn.checked = false;
					obj.refresh(btn.id);
				}, timeout);
			}
		},
		
		doClick: function (id, event, menu_index) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var it = this.get(id);
			if (it && !it.disabled) {
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'click', target: (typeof id != 'undefined' ? id : this.name), item: this.get(id),
					  subItem: (typeof menu_index != 'undefined' && this.get(id) ? this.get(id).items[menu_index] : null), event: event });	
				if (eventData.stop === true) return false;
			
				$('#'+ this.name +'_item_'+ it.id + ' table').removeClass('down');
				
				for (var i = 0; i < this.items.length; i++) {
					if (this.items[i].hideTimer) { clearTimeout(this.items[i].hideTimer); }
				}
				
				if (it.type == 'radio') {
					for (var i = 0; i < this.items.length; i++) {
						var itt = this.items[i];
						if (itt == null || itt.id == it.id || itt.type != 'radio') continue;
						if (itt.group == it.group && itt.checked) {
							itt.checked = false;
							this.refresh(itt.id);
						}
					}
					it.checked = true;
					$('#'+ this.name +'_item_'+ it.id + ' table').addClass('checked');					
				}
				if (it.type == 'check' || it.type == 'drop' || it.type == 'menu') {
					it.checked = !it.checked;
					if (it.checked) {
						$('#'+ this.name +'_item_'+ it.id + ' table').addClass('checked');
					} else {
						$('#'+ this.name +'_item_'+ it.id + ' table').removeClass('checked');					
					}
				}
				// event after
				this.trigger($.extend({ phase: 'after' }));	
			}
		}	
	}
	
	$.extend(w2toolbar.prototype, $.w2event);
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2sidebar	  - sidebar widget
*		- $.w2sidebar - jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
*   NICE TO HAVE
*     - group animate open
* 
************************************************************************/

(function () {
	var w2sidebar = function (options) {
		this.name			= null;
		this.box 			= null;
		this.sidebar		= null;
		this.parent 		= null;
		this.img 			= null;
		this.style	 		= '';
		this.selected 		= null;	// current selected node (readonly)
		this.nodes	 		= []; 	// Sidebar child nodes
		this.onClick		= null;	// Fire when user click on Node Text
		this.onDblClick		= null;	// Fire when user dbl clicks
		this.onContextMenu	= null;	
		this.onOpen			= null;	// Fire when node Expands
		this.onClose		= null;	// Fire when node Colapses
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy	 	= null;
	
		$.extend(true, this, options);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2sidebar = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2sidebar().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			// extend items
			var nodes  = method.nodes;
			var object = new w2sidebar(method); 
			$.extend(object, { handlers: [], nodes: [] });
			if (typeof nodes != 'undefined') {
				object.add(object, nodes); 
			}
			if ($(this).length != 0) {
				$(this).data('w2name', object.name);
				object.render($(this)[0]);
			}
			object.sidebar = object;
			// register new object
			w2ui[object.name] = object;
			return object;
			
		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2sidebar' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2sidebar.prototype = {
		node: {
			id	 			: null,
			text	   		: '',
			count			: '',
			img 			: null,
			parent	 		: null,		// node object
			sidebar			: null,
			nodes	  		: [],
			style 			: '',
			selected 		: false,
			expanded 		: false,
			hidden			: false,
			disabled		: false,
			group			: false, 	// if true, it will build as a group
			// events
			onClick			: null,
			onDblClick		: null,
			onContextMenu	: null,
			onOpen			: null,
			onClose			: null
		},
		
		add: function (parent, nodes) {
			if (arguments.length == 1) {
				// need to be in reverse order
				nodes  = arguments[0];
				parent = this;
			}
			if (typeof parent == 'string') parent = this.get(parent);
			return this.insert(parent, null, nodes);
		},
		
		insert: function (parent, before, nodes) {
			if (arguments.length == 2) {
				// need to be in reverse order
				nodes   = arguments[1];
				before	= arguments[0];
				var ind = this.get(before);
				if (ind == null) {
					$.error('Cannot insert node "'+ nodes[o].text +'" because cannot find node "'+ before +'" to insert before.'); 
					return null; 
				}
				parent 	= this.get(before).parent;
			}
			if (typeof parent == 'string') parent = this.get(parent);
			if (!$.isArray(nodes)) nodes = [nodes];
			for (var o in nodes) {
				if (typeof nodes[o].id == 'undefined') { 
					$.error('Cannot insert node "'+ nodes[o].text +'" because it has no id.'); 
					continue;
				}
				if (this.get(this, nodes[o].id) != null) { 
					$.error('Cannot insert node with id='+ nodes[o].id +' (text: '+ nodes[o].text + ') because another node with the same id already exists.'); 
					continue;
				}
				var tmp = $.extend({}, w2sidebar.prototype.node, nodes[o]);
				tmp.sidebar= this;
				tmp.parent = parent;
				var nd = tmp.nodes;
				tmp.nodes  = []; // very important to re-init empty nodes array
				if (before == null) { // append to the end
					parent.nodes.push(tmp);	
				} else {
					var ind = this.getIndex(parent, before);
					if (ind == null) {
						$.error('Cannot insert node "'+ nodes[o].text +'" because cannot find node "'+ before +'" to insert before.'); 
						return null; 
					}
					parent.nodes.splice(ind, 0, tmp);
				}
				if (typeof nd != 'undefined' && nd.length > 0) { this.insert(tmp, null, nd); }
			}
			this.refresh(parent.id);
			return tmp;
		},
		
		remove: function () { // multiple arguments
			var deleted = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				var ind  = this.getIndex(tmp.parent, arguments[a]);
				if (ind == null) continue;
				tmp.parent.nodes.splice(ind, 1);
				deleted++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return deleted;
		},
		
		set: function (parent, id, node) { 
			if (arguments.length == 2) {
				// need to be in reverse order
				node    = id;
				id 		= parent;
				parent 	= this;
			}
			// searches all nested nodes
			this._tmp = null;
			if (typeof parent == 'string') parent = this.get(parent);
			if (parent.nodes == null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].id == id) {
					// make sure nodes inserted correctly
					var nodes  = node.nodes;
					$.extend(parent.nodes[i], node, { nodes: [] });
					if (typeof nodes != 'undefined') {
						this.add(parent.nodes[i], nodes); 
					}					
					this.refresh(id);
					return true;
				} else {
					this._tmp = this.set(parent.nodes[i], id, node);
					if (this._tmp) return true;
				}
			}
			return false;
		},
		
		get: function (parent, id) { // can be just called get(id)
			if (arguments.length == 1) {
				// need to be in reverse order
				id 		= parent;
				parent 	= this;
			}
			// searches all nested nodes
			this._tmp = null;
			if (typeof parent == 'string') parent = this.get(parent);
			if (parent.nodes == null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].id == id) {
					return parent.nodes[i];
				} else {
					this._tmp = this.get(parent.nodes[i], id);
					if (this._tmp) return this._tmp;
				}
			}
			return this._tmp;
		},
		
		getIndex: function (parent, id) { 
			if (arguments.length == 1) {
				// need to be in reverse order
				id 		= parent;
				parent 	= this;
			}
			// only searches direct descendands
			if (typeof parent == 'string') parent = this.get(parent);
			if (parent.nodes == null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].id == id) {
					return i;
				}
			}
			return null;
		},		

		hide: function () { // multiple arguments
			var hidden = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				tmp.hidden = true;
				hidden++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return hidden;
		},
		
		show: function () {
			var shown = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				tmp.hidden = false;
				shown++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return shown;
		},
	
		disable: function () { // multiple arguments
			var disabled = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				tmp.disabled = true;
				if (tmp.selected) this.unselect(tmp.id);
				disabled++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return disabled;
		},
		
		enable: function () { // multiple arguments
			var enabled = 0;
			for (var a in arguments) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				tmp.disabled = false;
				enabled++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return enabled;
		},

		select: function (id) {
			if (this.selected == id) return false;
			this.unselect(this.selected);
			var new_node = this.get(id);
			if (!new_node) return false;
			$('#sidebar_'+ this.name +' #node_'+id.replace(/\./, '\\.'))
				.addClass('w2ui-selected')
				.find('.w2ui-icon').addClass('w2ui-icon-selected');
			new_node.selected = true;
			this.selected = id;
		},
		
		unselect: function (id) {
			var current = this.get(id);
			if (!current) return false;
			current.selected = false;
			$('#sidebar_'+ this.name +' #node_'+id.replace(/\./, '\\.'))
				.removeClass('w2ui-selected')
				.find('.w2ui-icon').removeClass('w2ui-icon-selected');
			if (this.selected == id) this.selected = null;
			return true;
		},
		
		doClick: function (id, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'click', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			var nd  = this.get(id);
			var obj = this;
			if (!nd.group && !nd.disabled) {
				$('#sidebar_'+ this.name +' .w2ui-node').each(function (index, field) {
					var nid = String(field.id).replace('node_', '');
					var nd  = obj.get(nid);
					if (nd && nd.selected) {
						nd.selected = false;
						$(field).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected');
					}
				});
				$('#sidebar_'+ this.name +' #node_'+id.replace(/\./, '\\.'))
					.addClass('w2ui-selected')
					.find('.w2ui-icon').addClass('w2ui-icon-selected');
				this.get(id).selected = true;
				this.selected = id;
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		doDblClick: function (id, event) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'dblClick', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			var nd = this.get(id);
			if (nd.nodes.length > 0) this.doToggle(id, event);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	
		doContextMenu: function (id, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'contextMenu', target: id, event: event });	
			if (eventData.stop === true) return false;
			
			// default action
			// -- no actions
			
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		doToggle: function(id, event) {
			if (this.get(id).expanded) this.doClose(id, event); else this.doOpen(id, event);
		},
	
		doOpen: function (id, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'open', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			var nd = this.get(id);
			if (nd.nodes.length == 0) return;
			// expand
			$('#sidebar_'+ this.name +' #node_'+ id.replace(/\./, '\\.') +'_sub').show();
			$('#sidebar_'+ this.name +' #node_'+ id.replace(/\./, '\\.') +' .w2ui-node-dots:first-child').html('<div style="width: 16px">-</div>');
			nd.expanded = true;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		doClose: function (id, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'close', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			$('#sidebar_'+ this.name +' #node_'+ id.replace(/\./, '\\.') +'_sub').hide();		
			$('#sidebar_'+ this.name +' #node_'+ id.replace(/\./, '\\.') +' .w2ui-node-dots:first-child').html('<div style="width: 16px">+</div>');
			this.get(id).expanded = false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
			// default action
			if (typeof box != 'undefined' && box != null) { 
				$(this.box).html(''); 
				this.box = box;
			}
			if (!this.box) return;
			$(this.box).html('<div id="sidebar_'+ this.name +'" class="w2ui-reset w2ui-sidebar" style="'+ this.style +'"></div>');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// ---
			this.refresh();
		},
		
		refresh: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name) });	
			if (eventData.stop === true) return false;
			// default action
			var obj = this;
			if (typeof id == 'undefined') {
				var node = this;
				var nm 	 = '#sidebar_'+ this.name;
			} else {
				var node = this.get(id);
				var nm 	 = '#sidebar_'+ this.name +' #node_'+ node.id.replace(/\./, '\\.') + '_sub';
			}
			if (node != this) {
				var tmp = '#sidebar_'+ this.name +' #node_'+ node.id.replace(/\./, '\\.');
				var nodeHTML = getNodeHTML(node);
				$(tmp).before('<div id="sidebar_'+ this.name + '_tmp"></div>');
				$(tmp).remove();
				$(nm).remove();
				$('#sidebar_'+ this.name + '_tmp').before(nodeHTML);
				$('#sidebar_'+ this.name + '_tmp').remove();
			}
			// refresh sub nodes
			$(nm).html('');
			for (var i=0; i < node.nodes.length; i++) {
				var nodeHTML = getNodeHTML(node.nodes[i]);
				$(nm).append(nodeHTML);
				if (node.nodes[i].nodes.length != 0) { this.refresh(node.nodes[i].id); }
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			
			function getNodeHTML(nd) {
				var html = '';
				var img  = nd.img;
				if (typeof img == 'undefined') img = this.img;
				// -- find out level
				var tmp   = nd.parent;
				var level = 0;
				while (tmp && tmp.parent != null) {
					if (tmp.group) level--;
					tmp = tmp.parent;
					level++;
				}	
				if (nd.group) {
					html = 
						'<div class="w2ui-node-group"  id="node_'+ nd.id +'"'+
						'		onclick="w2ui[\''+ obj.name +'\'].doClick(\''+ nd.id +'\', event); w2ui[\''+ obj.name +'\'].doToggle(\''+ nd.id +'\'); '+
						'				 var sp=$(this).find(\'span:nth-child(1)\'); if (sp.html() == \'Hide\') sp.html(\'Show\'); else sp.html(\'Hide\');"'+
						'		onmouseout="$(this).find(\'span:nth-child(1)\').css(\'color\', \'transparent\')" '+
						'		onmouseover="$(this).find(\'span:nth-child(1)\').css(\'color\', \'gray\')">'+
						'	<span style="float: right; color: transparent">Hide</span>'+
						'	<span>'+ nd.text +'</span>'+
						'</div>'+
						'<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>';
				} else {
					if (nd.selected && !nd.disabled) obj.selected = nd.id;
					html = 
					'<div class="w2ui-node '+ (nd.selected ? 'w2ui-selected' : '') +' '+ (nd.disabled ? 'w2ui-disabled' : '') +'" id="node_'+ nd.id +'" style="'+ (nd.hidden ? 'display: none;' : '') +'"'+
						'	ondblclick="w2ui[\''+ obj.name +'\'].doDblClick(\''+ nd.id +'\', event); /* event.stopPropagation(); */"'+
						'	oncontextmenu="w2ui[\''+ obj.name +'\'].doContextMenu(\''+ nd.id +'\', event); /* event.stopPropagation(); */ event.preventDefault();"'+
						'	onClick="w2ui[\''+ obj.name +'\'].doClick(\''+ nd.id +'\', event); /* event.stopPropagation(); */">'+
						'<table cellpadding="0" cellspacing="0" style="margin-left:'+ (level*18) +'px; padding-right:'+ (level*18) +'px"><tr>'+
						'<td class="w2ui-node-dots" nowrap onclick="w2ui[\''+ obj.name +'\'].doToggle(\''+ nd.id +'\', event);">'+ 
						'	<div style="width: 16px">'	+ (nd.nodes.length > 0 ? (nd.expanded ? '-' : '+') : '') + '</div>' +
						'</td>'+
						'<td class="w2ui-node-data" nowrap>'+ 
							(img ? '<div class="w2ui-node-image w2ui-icon '+ img +' '+ 
								(nd.selected && !nd.disabled ? "w2ui-icon-selected" : "") +'"></div>' : '') +
							(nd.count ? 
								'<div class="w2ui-node-count" style="width: auto; padding: 2px 5px; float: right">'+ nd.count +'</div>' : '') +
							'<div class="w2ui-node-caption">'+ nd.text +'</div>'+
						'</td>'+
						'</tr></table>'+
					'</div>'+
					'<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>';
				}
				return html;
			}
		},
	
		resize: function (width, height) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, width: width, height: height });
			if (eventData.stop === true) return false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));	
		}				
	}
	
	$.extend(w2sidebar.prototype, $.w2event);
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2field 	- various field controls
*		- $.w2field		- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
************************************************************************/

(function ($) {

	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2field = function(method) {
		// Method calling logic
		if (w2field[method]) {
			return w2field[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object') {
			return w2field.init.apply( this, arguments );
		} else if ( typeof method === 'string') {
			return w2field.init.apply( this, [{ type: method }] );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2field' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	var w2field = {
		// CONTEXT: this - is jQuery object
		init: function (options) { 		
			var obj = w2field;
			return $(this).each(function (field, index) {
				switch (options.type.toLowerCase()) {
					case 'clear': // removes any previous field type
						$(this).off('keypress').off('focus').off('blur');
						if ($(this).prev().hasClass('w2ui-list')) {	// if enum
							$(this).prev().remove();
							$(this).removeAttr('tabindex');
						}
						break;
					case 'int':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isInt(ch) && ch != '-') {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { // keyCode & charCode differ in FireFox
							if (!w2utils.isInt(this.value)) { this.value = ''; $(this).trigger('change'); } 
						});
						break;
						
					case 'float':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isInt(ch) && ch != '.' && ch != '-') {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { 
							if (!w2utils.isFloat(this.value)) { this.value = ''; $(this).trigger('change'); } 
						});
						break;
						
					case 'money':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox	
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isInt(ch) && ch != '.' && ch != '-' && ch != '$' && ch != '€' && ch != '£' && ch != '¥') {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { 
							if (!w2utils.isMoney(this.value)) { this.value = ''; $(this).trigger('change'); } 
						});
						break;
						
					case 'hex':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox	
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isHex(ch)) {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { 
							if (!w2utils.isHex(this.value)) { this.value = ''; $(this).trigger('change'); } 
						});
						break;
						 
					case 'alphanumeric':
						$(this).on('keypress', function (evnt) { // keyCode & charCode differ in FireFox
							if (evnt.metaKey || evnt.ctrlKey || evnt.altKey || (evnt.charCode != evnt.keyCode && evnt.keyCode > 0)) return;
							var ch = String.fromCharCode(evnt.charCode);
							if (!w2utils.isAlphaNumeric(ch)) {
								evnt.stopPropagation();
								return false;
							}
						});
						$(this).on('blur', function (evnt)  { 
							if (!w2utils.isAlphaNumeric(this.value)) { this.value = ''; } 
						});
						break;
						
					case 'date':
						var obj = this;
						// -- insert div for calendar
						if ($(this).length == 0 || $('#'+$(this)[0].id).length != 1) {
							console.error('The date field must have a unique id in w2field(\'date\').');
							return;
						}
						$(this) // remove transtion needed for functionality
							.css( { 'transition': 'none', '-webkit-transition': 'none', '-moz-transition': 'none', '-ms-transition': 'none', '-o-transition': 'none' })
							.data("options", options)
							.on('focus', function () {
								var top  = parseFloat($(obj).offset().top) + parseFloat(obj.offsetHeight);
								var left = parseFloat($(obj).offset().left);
								$('#global_calendar_div').remove();
								$('body').append('<div id="global_calendar_div" style="position: absolute; z-index: 1600; display: none;'+
									'		top: '+ (top + parseInt(obj.offsetHeight)) +'px; left: '+ left +'px;" '+
									' class="w2ui-reset w2ui-calendar" '+
									' onmousedown="event.stopPropagation(); event.preventDefault();"></div>');
								$('#global_calendar_div')
									.html($().w2field('calendar_get', obj.value, options))
									.css({
										left: left + 'px',
										top: top + 'px'
									})
									.data('el', obj)
									.show();
								// monitors
								var mtimer = setInterval(function () { 
									// monitor if moved
									if ($('#global_calendar_div').data('position') != ($(obj).offset().left) + 'x' + ($(obj).offset().top  + obj.offsetHeight)) {
										$('#global_calendar_div').css({
											'-webkit-transition': '.2s',
											left: ($(obj).offset().left) + 'px',
											top : ($(obj).offset().top + obj.offsetHeight) + 'px'
										}).data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));
									}
									// monitor if destroyed
									if ($(obj).length == 0 || ($(obj).offset().left == 0 && $(obj).offset().top == 0)) {
										clearInterval(mtimer);
										$('#global_calendar_div').remove();
										return;
									}
								}, 100);
								$(obj).data('mtimer', mtimer);
							})
							.on('blur', function (event) {
								if (!w2utils.isDate($(obj).val())) $(obj).val('');
								clearInterval($(obj).data('mtimer'));
								$('#global_calendar_div').remove();
							})
							.on('keypress', function (event) {
								var obj = this;
								setTimeout(function () {
									$('#global_calendar_div').html( $().w2field('calendar_get', obj.value, options) );
								}, 10);
							});
						break;
						
					case 'time':
						break;

					case 'datetime':
						break;
						
					case 'color':
						break;

					case 'list': // drop down with read only <input>
						break;

					case 'enum':
						var defaults = {
							url			: '',
							items		: [],
							selected 	: [],		// preselected items
							max 		: 0,		// maximum number of items that can be selected 0 for unlim
							maxHeight 	: 72, 		// max height for input control to grow
							showAll		: false,	// if true then show selected item in drop down
							maxCache 	: 500,		// number items to cache
							onRender 	: null,		// -- not implemented
							onSelect 	: null		// -- not implemented
						}
						var obj	= this;
						$(obj).css({ 'border-color': 'transparent' });

						var settings = $.extend({}, defaults, options);
						if ($.isArray(settings.selected)) { $(this).data('selected', settings.selected); } else { $(this).data('selected', []); }

						// if items is array convert to an object
						if ($.isArray(settings.items) && !$.isPlainObject(settings.items[0])) {
							var items = [];
							for (var i in settings.items) {
								items.push({
									'id' 	: settings.items[i],
									'text'	: settings.items[i]
								});
							}
							settings.items = items;
						}

						// add item to selected
						this.add = function (item) {
							var selected = $(this).data('selected');
							if (!$.isArray(selected)) selected = [];
							if (settings.max != 0 && settings.max <= selected.length) {
								// if max reached, replace last
								selected.splice(selected.length - 1, 1);
							}
							selected.push(item);
							$(this).data('selected', selected);
							$(this).data('last_del', null);
							$(this).trigger('change');
						}

						this.show = function () {
							// insert global div
							if ($('#w2ui-global-items').length == 0) {
								$('body').append('<div id="w2ui-global-items" class="w2ui-reset w2ui-items" '+
									'style="position: absolute; z-index: 1200; display: none; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;">'+
									'</div>');
							} else {
								// ignore second click
								return;	
							}
							var div = $('#w2ui-global-items');
							div.css({
									display : 'block',
									left 	: ($(obj).offset().left) + 'px',
									top 	: ($(obj).offset().top + obj.offsetHeight) + 'px'
								})
								.width(w2utils.getSize(obj, 'width'))
								.data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));

							// show drop content
							w2field.list_render.call(obj);

							// monitors
							var monitor = function () { 
								var div = $('#w2ui-global-items');
								// monitor if destroyed
								if ($(obj).length == 0 || ($(obj).offset().left == 0 && $(obj).offset().top == 0)) {
									clearInterval($(obj).data('mtimer'));
									hide(); 
									return;
								}
								// monitor if moved
								if (div.data('position') != ($(obj).offset().left) + 'x' + ($(obj).offset().top  + obj.offsetHeight)) {
									div.css({
										'-webkit-transition': '.2s',
										left: ($(obj).offset().left) + 'px',
										top : ($(obj).offset().top + obj.offsetHeight) + 'px'
									})
									.data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));
									// if moved then resize
									setTimeout(function () {
										w2field.list_render.call(obj, $(obj).data('last_search'));
									}, 200);
								}
								if (div.length > 0) $(obj).data('mtimer', setTimeout(monitor, 100));
							};
							$(obj).data('mtimer', setTimeout(monitor, 100));
						}						

						this.hide = function () {
							clearTimeout($(obj).data('mtimer'));
							$('#w2ui-global-items').remove();
						}

						// render controls with all items in it
						this.refresh = function () {
							var obj = this;
							// remove all items
							$($(this).data('selected-div')).remove();
							// rebuild it
							var margin = 'margin-top: ' + $(this).css('margin-top') + '; ' +
										 'margin-bottom: ' + $(this).css('margin-bottom') + '; ' +
										 'margin-left: ' + $(this).css('margin-left') + '; ' +
										 'margin-right: ' + $(this).css('margin-right') + '; '+
										 'width: ' + (w2utils.getSize(this, 'width') 
										 		   - parseInt($(this).css('margin-left')) 
										 		   - parseInt($(this).css('margin-right'))) + 'px; ';
							var html = '<div class="w2ui-list" style="'+ margin + ';">'+
									   '<ul>';
							var selected = $(this).data('selected');
							for (var s in selected) {
								html += '<li style="'+ ($(this).data('last_del') == s ? 'opacity: 0.5' : '') +'">'+
										'<div title="Remove" index="'+ s +'">&nbsp;&nbsp;</div>'+
										selected[s].text +
										'</li>';
							}
							html += '<li><input type="text" style="width: 10px; background-color: transparent"></li>';
							html += '</ul></div>';
							$(this).before(html);
							// adjust height
							var div = $(this).prev();
							$(this).data('selected-div', div);
							var cntHeight = w2utils.getSize(div, 'height')
								- parseInt($(div).css('margin-top')) 
								- parseInt($(div).css('margin-bottom'));
							if (cntHeight < 23) cntHeight = 23;
							if (cntHeight > settings.maxHeight) cntHeight = settings.maxHeight;
							$(div).height(cntHeight);
							if (div.length > 0) div[0].scrollTop = 1000;
							$(this).height(cntHeight);

							$(div).on('click', function (event) {
								var el = event.target;
								if (el.title == 'Remove') {
									$(obj).data('selected').splice($(el).attr('index'), 1);
									$(el.parentNode).remove();
									obj.refresh(); 
									w2field.list_render.call(obj);
									$(obj).trigger('change');
									event.stopPropagation();
								}
								$(this).find('input').focus();
							});
							$(div).find('input')
								.on('focus', function (event) {
									$(div).css({ 'outline': 'auto 5px -webkit-focus-ring-color', 'outline-offset': '-2px' });
									obj.show();
									event.stopPropagation();
								})
								.on('blur', function (event) {
									$(div).css('outline', 'none');
									obj.hide();
									event.stopPropagation();
								});
						}
						// init control
						$(this).data('settings', settings).attr('tabindex', -1);
						this.refresh();
						break;
				}
			});
		},
		
		// ******************************************************
		// -- Implementation

		list_render: function (search) {
			var obj 	 = this;
			var div 	 = $('#w2ui-global-items');
			var settings = $(this).data('settings');
			var selected = $(this).data('selected');
			if (div.length == 0) return; // if it is hidden
			if (typeof settings.items == 'undefined') settings.items = [];

			// build overall html
			if (typeof search == 'undefined') {
				var html 	 = '';
				html += '<div style="border-radius: 4px; background-color: white; padding: 3px;">'+
						'	<div class="list_items" style="padding-top: 3px;"></div>'+
						'</div>';
				div.html(html);
				search = '';
			}
			$(this).data('last_search', search);
			if (typeof $(obj).data('last_index') == 'undefined' || $(obj).data('last_index') == null) $(obj).data('last_index', 0);

			// pull items from url
			if (typeof settings.last_total == 'undefined') settings.last_total = -1;
			if (typeof settings.last_search_len == 'undefined') settings.last_search_len = 0;
			if (typeof settings.last_search_match == 'undefined') settings.last_search_match = -1;
			if (settings.url != '' && ( 
					   (settings.items.length == 0 && settings.last_total != 0) 
					|| (search.length > settings.last_search_len && settings.last_total > settings.maxCache)
					|| (search.length < settings.last_search_match && search.length != settings.last_search_len)
				)
			) {
				var match = false;
				if (settings.last_total < settings.maxCache) match = true;
				$.ajax({
					type 	: 'POST',
					dataType: 'text',
					url 	: settings.url,
					data 	: {
						search 	: search,
						max 	: settings.maxCache
					},
					complete: function (xhr, status) {
						settings.last_total = 0;
						if (status == 'success') {
							var data = $.parseJSON(xhr.responseText);
							if (match == false && data.total < settings.maxCache) { settings.last_search_match = search.length; }
							settings.last_search_len = search.length;
							settings.last_total = data.total
							settings.items      = data.options;
							w2field.list_render.call(obj, search);
						}
					}
				});
			}
			
			// build items
			var i = 0;
			var items = settings.items;
			var ihtml = '<ul>';
			// get ids of all selected items
			var ids	  = [];
			for (var a in selected) ids.push(w2utils.isInt(selected[a].id) ? parseInt(selected[a].id) : String(selected[a].id))
			// build list
			for (var a in items) {
				if (items[a] == '') continue;
				if (typeof items[a] == 'object') {
					var txt = String(items[a].text);
					if (txt == null && typeof items[a].caption != 'undefined') txt = items[a].caption;
					var id  = items[a].id;
					if (id == null && typeof items[a].value != 'undefined') id = items[a].value;
					if (id == null || String(id) == 'undefined' || id == '') id = txt;
				}
				if (typeof items[a] == 'string') {
					var id  = items[a];
					var txt = items[a];
				}
				// if already selected
				if ($.inArray(w2utils.isInt(id) ? parseInt(id) : String(id), ids) != -1 && settings.showAll !== true) continue;
				// check match with search
				var txt1 = String(search).toLowerCase();
				var txt2 = txt.toLowerCase();
				if (txt1.length <= txt2.length && txt2.substr(0, txt1.length) == txt1) {
					if (typeof settings['render'] == 'function') {
						txt = settings['render'](items[a]);
					}
					ihtml += '\n<li style="display: block; -webkit-transition: 0.2s" index="'+ a +'" value="'+ id +'" '+
							 '  onmouseover="$(this).parent().find(\'li\').removeClass(\'selected\'); $(this).addClass(\'selected\'); "'+
							 '	class="'+ (i % 2 ? 'w2ui-item-even' : 'w2ui-item-odd') + (i == $(obj).data('last_index') ? " selected" : "") +'">'+ 
							 txt +'</li>';
					if (i == $(obj).data('last_index')) $(obj).data('last_item', items[a]);
					i++;
				}
			}
			ihtml += '</ul>';
			if (i == 0) { 
				ihtml   = '<div style="padding: 2px; padding-bottom: 5px; text-align: center; color: gray">No items found</div>';
				var noItems = true;
			}
			div.find('.list_items').html(ihtml);
			$(this).data('last_max', i-1);	

			// scroll selected into view
			if (div.find('li.selected').length > 0) div.find('li.selected')[0].scrollIntoView(false);

			// if menu goes off screen - add scrollbar
			div.css({ '-webkit-transition': '0s', height : 'auto' }); 
			var max_height = parseInt($(document).height()) - parseInt(div.offset().top) - 8;
			if (parseInt(div.height()) > max_height) {
				div.css({ 
					height 	: (max_height - 5) + 'px', 
					overflow: 'show' 
				});
				$(div).find('.list_items').css({
					height 	: (max_height - 15) + 'px', 
					overflow: 'auto' 
				});
			}

			// add events
			$(div)
				.off('mousedown')
				.on('mousedown', function (event) {
					var id 	 = $(event.target).attr('index');
					var item = settings.items[id];
					obj.add(item);
					$(obj).data('last_index', 0);
					obj.refresh();
					w2field.list_render.call(obj, '');
				}
			);
			$(obj).prev().find('li > input')
				.val(search)
				.css('max-width', ($(div).width() - 25) + 'px')
				.width(((search.length + 2) * 6) + 'px')
				.focus()
				.on('click', function (event) {
					event.stopPropagation();
				})
				.off('keyup')
				.on('keyup', function (event) {
					var inp = this;
					setTimeout(function () { 
						var curr = $(obj).data('last_index');						
						switch (event.keyCode) {
							case 38: // up
								curr--;
								if (curr < 0) curr = 0;
								$(obj).data('last_index', curr);
								event.preventDefault();
								break;
							case 40: // down
								curr++;
								if (curr > $(obj).data('last_max')) curr = $(obj).data('last_max');
								$(obj).data('last_index', curr);
								event.preventDefault();
								break;
							case 13: // enter
								if (typeof $(obj).data('last_item') == 'undefined' || $(obj).data('last_item') == null || noItems === true) break;
								var selected = $(obj).data('selected'); 
								obj.add($(obj).data('last_item'));
								// select next
								if (curr > $(obj).data('last_max') - 1) curr = $(obj).data('last_max')-1;
								$(obj).data('last_index', curr);
								$(obj).data('last_item', null);
								// refrech
								$(inp).val('');
								obj.refresh();
								event.preventDefault();
								break;
							case 8: // backspace
								if (inp.value == '') {
									if (typeof $(obj).data('last_del') == 'undefined' || $(obj).data('last_del') == null) {
										// mark for deletion
										var selected = $(obj).data('selected'); 
										if (!$.isArray(selected)) selected = [];
										$(obj).data('last_del', selected.length-1);
										// refrech
										obj.refresh();
									} else {
										// delete marked one
										var selected = $(obj).data('selected'); 
										if (!$.isArray(selected)) selected = [];
										if (selected.length > 0) {
											selected.splice(selected.length-1, 1);
										}
										$(obj).data('selected', selected);
										$(obj).data('last_del', null);
										// refrech
										obj.refresh();
										$(obj).trigger('change');
									}
								}
								break;
							default: 
								$(obj).data('last_index', 0);
								$(obj).data('last_del', null);
								break;
						}
						// adjust height
						var div = $(obj).prev();
						div.css('height', 'auto');
						var cntHeight = w2utils.getSize(div, 'height')
							- parseInt($(div).css('margin-top')) 
							- parseInt($(div).css('margin-bottom'));
						if (cntHeight < 23) cntHeight = 23;
						if (cntHeight > settings.maxHeight) cntHeight = settings.maxHeight;
						$(div).height(cntHeight);
						if (div.length > 0) div[0].scrollTop = 1000;
						$(obj).height(cntHeight);
						// refresh menu
						if (!(event.keyCode == 8 && inp.value == '')) { 
							$(obj).prev().find('li').css('opacity', '1');
							$(obj).data('last_del', null);
						}
						if ($.inArray(event.keyCode, [16,91,37,39]) == -1) { // command and shift keys and arrows
							w2field.list_render.call(obj, inp.value); 
						}
					}, 10);
				})
		},
		
		// ******************************************************
		// -- Calendar
		
		calendar_get: function (date, options) {
			var td = new Date();
			var today = (Number(td.getMonth())+1) + '/' + td.getDate() + '/' + (String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900);
			if (date == '' || String(date) == 'undefined') date = today; 
			if (!w2utils.isDate(date)) date = today;
			
			var tmp  = date.split('/')
			var html =  '<table cellpadding="0" cellspacing="0" style=""><tr>' +
						'<td>'+ $().w2field('calendar_month', tmp[0], tmp[2], options) +'</td>'+
						'<!--td valign="top" style="background-color: #f4f4fe; padding: 8px; padding-bottom: 0px; padding-top: 22px; border: 1px solid silver; border-left: 0px;">'+
						'	Jan <br> Feb <br> Mar <br> Apr <br> May <br> Jun <br> Jul <br> Aug <br> Sep <br> Oct <br> Nov <br> Dec'+
						'</td>'+
						'<td valign="top" style="background-color: #f4f4fe; padding: 6px; padding-bottom: 0px; padding-top: 22px; border: 1px solid silver; border-left: 0px;">'+
						'	2001 <br> 2002 <br> 2003 <br> 2004'+
						'</td-->'+
						'</tr></table>';
			return html;
		},
		
		calendar_next: function(date) {
			var tmp = String(date).split('/');
			var month = tmp[0];
			var year  = tmp[1];
			if (parseInt(month) < 12) {
				month = parseInt(month) + 1;
			} else {
				month = 1;
				year  = parseInt(year) + 1;
			}
			var options = $($('#global_calendar_div.w2ui-calendar').data('el')).data('options');
			$('#global_calendar_div.w2ui-calendar').html( $().w2field('calendar_get', month+'/1/'+year, options) );
		},
		
		calendar_previous: function(date) {
			var tmp = String(date).split('/');
			var month = tmp[0];
			var year  = tmp[1];
			if (parseInt(month) > 1) {
				month = parseInt(month) - 1;
			} else {
				month = 12;
				year  = parseInt(year) - 1;
			}
			var options = $($('#global_calendar_div.w2ui-calendar').data('el')).data('options');
			$('#global_calendar_div.w2ui-calendar').html( $().w2field('calendar_get', month+'/1/'+year, options) );
		},
		
		calendar_month: function(month, year, options) {
			// options = { blocked: {'4/11/2011': 'yes'}, colored: {'4/11/2011': 'red:white'} }
			var td = new Date();
			var months 		= ['January', 'February', 'March', 'April', 'May', 'June', 'July',	'August', 'September', 'October', 'November', 'December'];
			var days  		= ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var daysCount   = ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
			var today		= (Number(td.getMonth())+1) + '/' + td.getDate() + '/' + (String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900);
			
			year  = Number(year);
			month = Number(month);
			if (year  === null || year  === '') year  = String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900;
			if (month === null || month === '') month = Number(td.getMonth())+1;
			if (month > 12) { month = month - 12; year++; }
			if (month < 1 || month == 0)  { month = month + 12; year--; }
			if (year/4 == Math.floor(year/4)) { daysCount[1] = '29'; } else { daysCount[1] = '28'; }
			if (year  == null) { year  = td.getYear(); }
			if (month == null) { month = td.getMonth()-1; }
			
			// start with the required date
			var td = new Date();
			td.setDate(1);
			td.setMonth(month-1);
			td.setYear(year);
			var weekDay = td.getDay();
			
			var html  = 
				'<div class="w2ui-calendar-title">'+
				'	<div style="float: left" class="w2ui-calendar-previous" onclick="$().w2field(\'calendar_previous\', \''+ month +'/'+ year +'\')"> <- </div>'+
				'	<div style="float: right" class="w2ui-calendar-next" onclick="$().w2field(\'calendar_next\', \''+ month +'/'+ year +'\')"> -> </div> '+ 
						months[month-1] +', '+ year + 
				'</div>'+
				'<table class="w2ui-calendar-days" onclick="" cellspacing="0">'+
				'	<tr class="w2ui-day-title"><td>M</td> <td>T</td> <td>W</td> <td>T</td> <td>F</td> <td>S</td> <td>S</td></tr>'+
				'	<tr>';
					
			var day = 1;
			for (var ci=1; ci<43; ci++) {
				if (weekDay == 0 && ci == 1) {
					for (var ti=0; ti<6; ti++) html += '<td class="w2ui-day-empty">&nbsp;</td>';
					ci += 6;
				} else {
					if (ci < weekDay || day > daysCount[month-1]) {
						html += '<td class="w2ui-day-empty">&nbsp;</td>';
						if ((ci)%7 == 0) html += '</tr><tr>';
						continue;
					}
				}
				var dt  = month + '/' + day + '/' + year;
				
				var className = ''; 
				if (dt == today) className = 'w2ui-today';
				if (ci % 7 == 6) className = 'w2ui-saturday';
				if (ci % 7 == 0) className = 'w2ui-sunday';
				
				var dspDay 	= day;			
				var col 	= '';
				var bgcol 	= '';
				var blocked = '';
				if (options.colored) if (options.colored[dt] != undefined) { // if there is predefined colors for dates
					tmp   = options.colored[dt].split(':');
					bgcol = 'background-color: ' + tmp[0] + ';';
					col   = 'color: ' + tmp[1] + ';';
				}
				var noSelect = false;
				// enable range 
				if (options.start || options.end) {
					var start 	= new Date(options.start);
					var end   	= new Date(options.end);
					var current = new Date(dt);
					if (current < start || current > end) {
						blocked  = ' w2ui-blocked-date';
						noSelect = true;
					} 
				}
				// block predefined dates
				if (options.blocked && $.inArray(dt, options.blocked) != -1) {
					blocked  = ' w2ui-blocked-date';
					noSelect = true;
				} 
				html += '<td class="'+ className + blocked +'" style="'+ col + bgcol + '" id="'+ this.name +'_date_'+ dt +'" date="'+ dt +'"';
				if (noSelect === false) {
					html += 'onclick="var el = $(\'#global_calendar_div.w2ui-calendar\').data(\'el\'); '+
							'	$(el).val(\''+ dt +'\').trigger(\'change\').trigger(\'blur\'); '+
							'	 event.stopPropagation(); return false;'+
							'"';
				}
				html +=	'>'+ dspDay + '</td>';
				if (ci % 7 == 0 || (weekDay == 0 && ci == 1)) html += '</tr><tr>';
				day++;
			}
			html += '</tr></table>';
			return html;
		}
	}

}) (jQuery);
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2form 	- form widget
*		- $.w2form		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2fields, w2tabs
* 
************************************************************************/


(function () {
	var w2form = function(options) {
		// public properties
		this.name  	  		= null;
		this.box			= null; 	// HTML element that hold this element
		this.url			= '';
		this.form_url   	= '';		// url where to get form HTML
		this.form_html  	= '';		// form HTML (might be loaded from the url)
		this.page 			= 0;		// current page
		this.recid			= 0;		// can be null or 0
		this.fields 		= [];
		this.actions 		= {};
		this.record			= {};
		this.original   	= {};
		this.postData		= {};
		this.tabs 			= {}; 		// if not empty, then it is tabs object
		this.isLoaded   	= false;
		this.style 			= '';

		// events
		this.onRequest  	= null,
		this.onLoad     	= null,
		this.onSubmit		= null,
		this.onSave			= null,
		this.onChange		= null,
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy		= null;
		this.onAction		= null; 

		// internal
		this.request_xhr	= null;		// jquery xhr requests		
		this.save_xhr		= null;		

		$.extend(true, this, options);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2form = function(method) {
		if (typeof method === 'object' || !method ) {
			var obj = this;
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2form().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			// remember items
			var record 		= method.record;
			var original	= method.original;
			var fields 		= method.fields;
			var tabs		= method.tabs;
			// extend items
			var object = new w2form(method);
			$.extend(object, { record: {}, original: {}, fields: [], tabs: {}, handlers: [] });
			if ($.isArray(tabs)) {
				$.extend(true, object.tabs, { tabs: tabs});
			} else {
				$.extend(true, object.tabs, tabs);
			}
			// reassign variables
			for (var p in fields)  	object.fields[p]   	= $.extend(true, {}, fields[p]); 
			for (var p in record) {
				if ($.isPlainObject(record[p])) {
					object.record[p] = $.extend(true, {}, record[p]);
				} else {
					object.record[p] = record[p];
				}
			}
			for (var p in original) {
				if ($.isPlainObject(original[p])) {
					object.original[p] = $.extend(true, {}, original[p]);
				} else {
					object.original[p] = original[p];
				}
			}
			object.initTabs();
			// render if necessary
			if ($(this).length != 0 && !object.form_url) {
				if (!object.form_html) object.form_html = $(this).html();
				object.init(this);
				object.render($(this)[0]);
			} else if (object.form_url) {
				$.get(object.form_url, function (data) {
					object.form_html = data;
					if ($(obj).length != 0) {
						$(obj).html(object.form_html);
						object.init(obj);
						object.render($(obj)[0]);
					}
				});
			}
			// register new object
			w2ui[object.name] = object;
			return object;
		
		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2form' );
		}    
	}		

	// ====================================================
	// -- Implementation of core functionality
	
	w2form.prototype = {

		init: function (el) {
			var obj = this;
			$(el).find('input, textarea, select').each(function (index, el) {
				var type  = 'text';
				var name  = (typeof $(el).attr('name') != 'undefined' ? $(el).attr('name') : $(el).attr('id'));
				if (el.type == 'checkbox')  	type = 'checkbox';
				if (el.type == 'radio')     	type = 'radio';
				if (el.type == 'password')     	type = 'password';
				if (el.type == 'button') 		type = 'button';
				if (el.tagName == 'select') 	type = 'list';
				if (el.tagName == 'textarea')	type = 'textarea';
				var value = (type == 'checkbox' || type == 'radio' ? ($(el).attr('checked') ? true : false) : $(el).val());

				var field = obj.get(name);
				if (field && type != 'button') {
					// find page
					var div = $(el).parents('.w2ui-page');
					if (div.length > 0) {
						for (var i = 0; i < 100; i++) {
							if (div.hasClass('page-'+i)) { field.page = i; break; }
						}
					}
				} else if (type != 'button') {
					console.log('WARNING: Field "'+ name + '" is present in HTML, but not defined in w2form.');
				}
			});
		},

		initTabs: function () {
			// -- if tabs defined
			if (!$.isEmptyObject(this.tabs) && typeof this.tabs['render'] == 'undefined') {
				var obj = this;
				this.tabs = $().w2tabs($.extend({}, this.tabs, { name: this.name +'_tabs' }));
				this.tabs.on('click', function (id, choice) {
					obj.goto(this.getIndex(id));
				});
			}
			return;
		},

		get: function (field) {
			for (var f in this.fields) {
				if (this.fields[f].name == field) return this.fields[f];
			}
			return null;
		},

		set: function (field, obj) {
			for (var f in this.fields) {
				if (this.fields[f].name == field) {
					$.extend(this.fields[f] , obj);
					return true;
				}
			}
			return false;
		},
	
		reload: function (callBack) {
			if (this.url != '') {
				//this.clear();
				this.isLoaded = false;
				this.request(null, callBack);
			} else {
				this.isLoaded = true;
				this.refresh();
			}
		},

		clear: function () {
			this.record = {};
			// clear all enum fields
			for (var f in this.fields) {
				var field = this.fields[f];
				if (field.selected) delete field.selected;
			}
			$().w2tag();
			this.refresh();
		},
		
		request: function (postData, url, callBack) {
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				url 		= null
				postData 	= null;
			}
			if (typeof url == 'function') {
				callBack 	= url;
				url 		= null
			}
			if (typeof postData == 'undefined') postData = {};
			if (typeof url == 'undefined' || url == '' || url == null) url = this.url;
			if (url == '' || url == null) return;
			if (this.recid == null || typeof this.recid == 'undefined') this.recid = 0;
			// build parameters list
			var params = {};
			// add list params
			params['cmd']  	 = 'get-record';
			params['name'] 	 = this.name;
			params['recid']  = this.recid;
			// append other params
			$.extend(params, this.postData);
			$.extend(params, postData);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, url: url, postData: params });
			if (eventData.stop === true) { if (typeof callBack == 'function') callBack(); return false; }
			// default action
			this.record	  = {};
			this.original = {};
			// call server to get data
			var obj = this;
			this.isLoaded = false;
			this.showStatus('Refreshing ');
			if (this.request_xhr) try { this.request_xhr.abort(); } catch (e) {};
			this.request_xhr = $.ajax({
				type		: 'POST',
				url			: url + (url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.hideStatus();
					obj.isLoaded = true;
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'load', data: xhr.responseText , xhr: xhr, status: status });	
					if (eventData.stop === true) {
						if (typeof callBack == 'function') callBack();
						return false;
					}
					// default action
					if (xhr['status'] == 403) {
						document.location = 'login.html'
						return;
					}
					if (typeof eventData.data != 'undefined' && eventData.data != '') {
						var data = 'data = '+ eventData.data; 	// $.parseJSON or $.getJSON did not work because it expect perfect JSON data
						var data = eval(data);					//  where everything is in double quotes
						if (data['status'] != 'success') {
							console.log('ERROR: '+ data['message']);
						} else {
							obj.record 	 = $.extend({}, data.record);
							obj.original = $.extend({}, data.record);
						}
					}
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.refresh();
					// call back
					if (typeof callBack == 'function') callBack();
				}
			});
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		validate: function (showErrors) {
			if (typeof showErrors == 'undefined') showErrors = true;
			// validate before saving
			var errors = [];
			for (var f in this.fields) {
				var field = this.fields[f];
				if (this.record[field.name] == null) this.record[field.name] = '';
				switch (field.type) {
					case 'int':
						if (this.record[field.name] && !w2utils.isInt(this.record[field.name])) {
							var error = { field: field, error: 'Not an integer' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} 
						break;
					case 'float':
						if (this.record[field.name] && !w2utils.isFloat(this.record[field.name])) {
							var error = { field: field, error: 'Not a float number' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} 
						break;
					case 'money':
						if (this.record[field.name] && !w2utils.isMoney(this.record[field.name])) {
							var error = { field: field, error: 'Not in money format' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} 
						break;
					case 'hex':
						if (this.record[field.name] && !w2utils.isHex(this.record[field.name])) {
							var error = { field: field, error: 'Not a hex number' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error, { class: 'w2ui-error' });
						} 
						break;
					case 'email':
						if (this.record[field.name] && !w2utils.isEmail(this.record[field.name])) {
							var error = { field: field, error: 'Not a valid email' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} 
						break;
					case 'checkbox':
						// convert true/false
						if (this.record[field.name] == true) this.record[field.name] = 1; else this.record[field.name] = 0; 
						break;
					case 'date':
						// format date before submit
						if (this.record[field.name] && !w2utils.isDate(this.record[field.name])) {
							var error = { field: field, error: 'Not a valid date (mm/dd/yyyy)' };
							errors.push(error);
							if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
						} else {
							// convert to universal timestamp with time zone
							//var d = new Date(this.record[field.name]);
							//var tz = (d.getTimezoneOffset() > 0 ? '+' : '-') + Math.floor(d.getTimezoneOffset()/60) + ':' + (d.getTimezoneOffset() % 60);
							//this.record[field.name] = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate() + ' '
							//	+ d.getHours() + ':' + d.getSeconds() + ':' + d.getMilliseconds() + tz;
							//this.record[field.name + '_unix'] = Math.round(d.getTime() / 1000);
							//this.record[field.name] = w2utils.formatDate(this.record[field.name], 'mm/dd/yyyy');
						}
						break;
					case 'list':
					case 'enum':
						var sel = $(field.el).data('selected');
						if (!$.isArray(sel)) sel = [];
						switch (sel.length) {
							case 0:
								this.record[field.name] = '';
								break;
							case 1: 
								this.record[field.name] = sel[0].id;
								break;
							default:
								this.record[field.name] = [];
								for (var s in sel) {
									this.record[field.name].push(sel[s].id);
								}
								break;
						}
						break;
				}
				// check required
				if (field.required && !this.record[field.name]) {
					var error = { field: field, error: 'Required field' };
					errors.push(error);
					if (showErrors) $(field.el).w2tag(error.error, { class: 'w2ui-error' });
				}					
			}
			return errors;
		},

		save: function (postData, url, callBack) {
			var obj = this;
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				url 		= null
				postData 	= null;
			}
			if (typeof url == 'function') {
				callBack 	= url;
				url 		= null
			}
			// validation
			var errors = this.validate(true);
			if (errors.length !== 0) {
				this.goto(errors[0].field.page);
				return;
			}
			// submit save
			if (typeof postData == 'undefined' || postData == null) postData = {};
			if (typeof url == 'undefined' || url == '' || url == null) url = this.url;
			if (url == '' || url == null) return;
			this.showStatus('Saving...');
			// build parameters list
			var params = {};
			// add list params
			params['cmd']  	 = 'save-record';
			params['name'] 	 = this.name;
			params['recid']  = this.recid;
			// append other params
			$.extend(params, this.postData);
			$.extend(params, postData);
			params.record = $.extend(true, {}, this.record);
			// convert  before submitting 
			for (var f in this.fields) {
				var field = this.fields[f];
				switch (String(field.type).toLowerCase()) {
					case 'date': // to yyyy-mm-dd format
						params.record[field.name] = w2utils.formatDate(params.record[field.name], 'yyyy-mm-dd');
						break;
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'submit', target: this.name, url: url, postData: params });
			if (eventData.stop === true) { if (typeof callBack == 'function') callBack(); return false; }
			// default action
			if (this.save_xhr) try { this.save_xhr.abort(); } catch (e) {};
			this.save_xhr = $.ajax({
				type		: 'POST',
				url			: url + (url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.hideStatus();
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'save', data: xhr.responseText , xhr: xhr, status: status });	
					if (eventData.stop === true) {
						if (typeof callBack == 'function') callBack();
						return false;
					}
					// default action
					if (xhr['status'] == 403) {
						document.location = 'login.html'
						return;
					}
					try {
						if (typeof eventData.data != 'undefined' && eventData.data != '' && $.parseJSON(eventData.data) !== false) {
							var data = 'data = '+ eventData.data; 	// $.parseJSON or $.getJSON did not work because it expect perfect JSON data
							var data = eval(data);					//  where everything is in double quotes
							if (data['status'] != 'success') {
								console.log('ERROR: '+ data['message']);
							} else {
								// reset original
								obj.original = $.extend({}, obj.record);
							}
						}
					} catch (e) {
						var data = {};
						data['status']  = 'error';
						data['message'] = 'Server did not return JSON structure.';
					}
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.refresh();
					// call back
					if (typeof callBack == 'function') callBack(data);
				}
			});
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		showStatus: function (status) {

		},

		hideStatus: function (status) {

		},

		doAction: function (action, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: action, type: 'action', event: event });	
			if (eventData.stop === true) return false;
			// default actions
			if (typeof (this.actions[action]) == 'function') {
				this.actions[action].call(this, event);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		resize: function (width, height) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'resize', width: width, height: height });	
			if (eventData.stop === true) return false;

			// does nothing, needed for compatibility

			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		goto: function (page) {
			if (typeof page != 'undefined') this.page = page;
			this.refresh();
		},

		refresh: function () {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page })
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('.w2ui-page').hide();
			$(this.box).find('.w2ui-page.page-' + this.page).show();
			// refresh tabs if needed
			if (typeof this.tabs == 'object' && typeof this.tabs.refresh == 'function') {
				$('#form_'+ this.name +'_tabs').show();
				this.tabs.active = this.tabs.tabs[this.page].id;
				this.tabs.refresh();
			} else {
				$('#form_'+ this.name +'_tabs').hide();
			}			
			// refresh values of all fields
			for (var f in this.fields) {
				var field = this.fields[f];
				field.el = $(this.box).find('[name="'+ field.name +'"]')[0];
				if (typeof field.el == 'undefined') {
					console.log('ERROR: Cannot associate field "'+ field.name + '" with html control. Make sure html control exists with the same name.');
					return;
				}
				field.el.id = field.name;
				$(field.el).off('change').on('change', function () {
					var value_new 		= this.value;
					var value_previous 	= obj.record[this.name] ? obj.record[this.name] : '';
					if ($(this).data('selected')) {
						var new_arr = $(this).data('selected');
						var cur_arr = obj.get(this.name).selected;
						var value_new = [];
						var value_previous = [];
						if ($.isArray(new_arr)) for (var i in new_arr) value_new[i] = $.extend(true, {}, new_arr[i]); // clone array
						if ($.isArray(cur_arr)) for (var i in cur_arr) value_previous[i] = $.extend(true, {}, cur_arr[i]); // clone array
						obj.get(this.name).selected = value_new;
					}
					// event before
					var eventData = obj.trigger({ phase: 'before', target: this.name, type: 'change', value_new: value_new, value_previous: value_previous });
					if (eventData.stop === true) { 
						$(this).val(obj.record[this.name]); // return previous value
						return false;
					}
					// default action 
					var val = this.value;
					if (this.type == 'checkbox') val = this.checked ? true : false;
					if (this.type == 'radio')    val = this.checked ? true : false;
					//if (this.type == 'password') val = this.checked ? true : false;							
					obj.record[this.name] = val;
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
				});
				if (field.required) {
					$(field.el).parent().addClass('w2ui-required');
				} else {
					$(field.el).parent().removeClass('w2ui-required');
				}
			}
			// attach actions on buttons
			$(this.box).find('button, input[type=button]').each(function (index, el) {
				$(el).off('click').on('click', function (event) {
					var action = this.value;
					if (this.name) 	action = this.name;
					if (this.id) 	action = this.id;
					obj.doAction(action, event);
				});
			});
			// init controls with record
			for (var f in this.fields) {
				var field = this.fields[f];
				var value = (typeof this.record[field.name] != 'undefined' ? this.record[field.name] : '');

				switch (String(field.type).toLowerCase()) {
					case 'email':
					case 'text':
						field.el.value = value;
						break;
					case 'date':
						field.el.value = w2utils.formatDate(value, 'mm/dd/yyyy');
						this.record[field.name] = field.el.value;
						$(field.el).w2field('date');
						break;
					case 'int':
						field.el.value = value;
						$(field.el).w2field('int');
						break;
					case 'float':
						field.el.value = value;
						$(field.el).w2field('float');
						break;
					case 'money':
						field.el.value = value;
						$(field.el).w2field('money');
						break;
					case 'hex':
						field.el.value = value;
						$(field.el).w2field('hex');
						break;
					case 'alphanumeric':
						field.el.value = value;
						$(field.el).w2field('alphaNumeric');
						break;
					case 'checkbox':
						if (this.record[field.name] == true || this.record[field.name] == 1 || this.record[field.name] == 't') {
							$(field.el).attr('checked', true);
						} else {
							$(field.el).removeAttr('checked');
						}
						break;
					case 'password':
						// hide passwords
						field.el.value = value;
						break;
					case 'list':
						field.options.max  	  = 1;
						field.options.showAll = true; // show selected items in drop down
					case 'enum':
						if (typeof field.options == 'undefined' || (typeof field.options.url == 'undefined' && typeof field.options.items == 'undefined')) {
							console.log("ERROR: (w2form."+ obj.name +") the field "+ field.name +" defined as enum but not field.options.url or field.options.items provided.");
							break;
						}
						var v = value;
						if (field.selected) v = field.selected;
						$(field.el).w2field( $.extend({}, field.options, { type: 'enum', selected: v }) );
						break;
					default:
						console.log('ERROR: field type "'+ field.type +'" is not recognized.');
						break;						
				}
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (typeof box != 'undefined' ? box : this.box) });	
			if (eventData.stop === true) return false;
			// default actions
			if (typeof box != 'undefined') this.box = box;
			var html = '<div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs"></div>' + this.form_html;
			$(this.box).html(html).addClass('w2ui-reset w2ui-form');
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// init tabs
			this.initTabs();
			if (typeof this.tabs == 'object' && typeof this.tabs.render == 'function') {
				this.tabs.render($('#form_'+ this.name +'_tabs')[0]);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// after render actions
			if (this.url != '' && this.recid != 0) this.request(); else this.refresh();
		},

		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });	
			if (eventData.stop === true) return false;
			// clean up
			if (typeof this.tabs == 'object' && this.tabs.destroy) this.tabs.destroy();
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	}
	
	$.extend(w2form.prototype, $.w2event);
})();
