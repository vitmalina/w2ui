/* w2ui-fields 1.0 (part of w2ui 1.4+) (c) http://w2ui.com, vitmalina@gmail.com */
var w2ui  = w2ui  || {};
var w2obj = w2obj || {}; // expose object to be able to overwrite default functions

/************************************************
*   Library: Web 2.0 UI for jQuery
*   - Following objects are defines
*   	- w2ui 				- object that will contain all widgets
*		- w2obj				- object with widget prototypes
*		- w2utils 			- basic utilities
*		- $().w2render		- common render
*		- $().w2destroy		- common destroy
*		- $().w2marker		- marker plugin
*		- $().w2tag			- tag plugin
*		- $().w2overlay		- overlay plugin
*		- $().w2menu		- menu plugin
*		- w2utils.event		- generic event object
*		- w2utils.keyboard	- object for keyboard navigation
*   - Dependencies: jQuery
*
************************************************/

var w2utils = (function () {
	var tmp = {}; // for some temp variables
	var obj = {
		settings : {
			"locale"		: "en-us",
			"date_format"	: "m/d/yyyy",
			"date_display"	: "Mon d, yyyy",
			"time_format"	: "h12",
			"currency"		: "^[\$\€\£\¥]?[-]?[0-9]*[\.]?[0-9]+$",
			"currencyPrefix": "$",
			"currencySuffix": "",
			"groupSymbol"	: ",",
			"float"			: "^[-]?[0-9]*[\.]?[0-9]+$",
			"shortmonths"	: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			"fullmonths"	: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			"shortdays"		: ["M", "T", "W", "T", "F", "S", "S"],
			"fulldays" 		: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			"RESTfull"		: false,
			"phrases"		: {} // empty object for english phrases
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
		date 			: date,
		size 			: size,
		formatNumber	: formatNumber,
		formatDate		: formatDate,
		formatTime  	: formatTime,
		formatDateTime  : formatDateTime,
		stripTags		: stripTags,
		encodeTags		: encodeTags,
		escapeId		: escapeId,
		base64encode	: base64encode,
		base64decode	: base64decode,
		transition		: transition,
		lock			: lock,
		unlock			: unlock,
		lang 			: lang,
		locale	 		: locale,
		getSize			: getSize,
		scrollBarSize	: scrollBarSize
	}
	return obj;
	
	function isInt (val) {
		var re =  /^[-]?[0-9]+$/;
		return re.test(val);		
	}
		
	function isFloat (val) {
		var re =  new RegExp(w2utils.settings["float"]);
		return re.test(val);		
	}

	function isMoney (val) {
		var re =  new RegExp(w2utils.settings.currency);
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
		var email = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		return email.test(val); 
	}

	function isDate (val, format, retDate) {
		if (!val) return false;
		if (!format) format = w2utils.settings.date_format;
		// format date
		var tmp  = val.replace(/-/g, '/').replace(/\./g, '/').toLowerCase().split('/');
		var tmp2 = format.replace(/-/g, '/').replace(/\./g, '/').toLowerCase();
		var dt   = 'Invalid Date';
		var month, day, year;
		if (tmp2 == 'mm/dd/yyyy') { month = tmp[0]; day = tmp[1]; year = tmp[2]; }
		if (tmp2 == 'm/d/yyyy')   { month = tmp[0]; day = tmp[1]; year = tmp[2]; }
		if (tmp2 == 'dd/mm/yyyy') { month = tmp[1]; day = tmp[0]; year = tmp[2]; }
		if (tmp2 == 'd/m/yyyy')   { month = tmp[1]; day = tmp[0]; year = tmp[2]; }
		if (tmp2 == 'yyyy/dd/mm') { month = tmp[2]; day = tmp[1]; year = tmp[0]; } 
		if (tmp2 == 'yyyy/d/m')   { month = tmp[2]; day = tmp[1]; year = tmp[0]; } 
		if (tmp2 == 'yyyy/mm/dd') { month = tmp[1]; day = tmp[2]; year = tmp[0]; } 
		if (tmp2 == 'yyyy/m/d')   { month = tmp[1]; day = tmp[2]; year = tmp[0]; } 
		if (tmp2 == 'mm/dd/yy')   { month = tmp[0]; day = tmp[1]; year = tmp[2]; }
		if (tmp2 == 'm/d/yy')     { month = tmp[0]; day = tmp[1]; year = parseInt(tmp[2]) + 1900; }
		if (tmp2 == 'dd/mm/yy')   { month = tmp[1]; day = tmp[0]; year = parseInt(tmp[2]) + 1900; }
		if (tmp2 == 'd/m/yy')     { month = tmp[1]; day = tmp[0]; year = parseInt(tmp[2]) + 1900; }
		if (tmp2 == 'yy/dd/mm')   { month = tmp[2]; day = tmp[1]; year = parseInt(tmp[0]) + 1900; } 
		if (tmp2 == 'yy/d/m')     { month = tmp[2]; day = tmp[1]; year = parseInt(tmp[0]) + 1900; } 
		if (tmp2 == 'yy/mm/dd')   { month = tmp[1]; day = tmp[2]; year = parseInt(tmp[0]) + 1900; } 
		if (tmp2 == 'yy/m/d')     { month = tmp[1]; day = tmp[2]; year = parseInt(tmp[0]) + 1900; } 
		dt = new Date(month + '/' + day + '/' + year);
		// do checks
		if (typeof month == 'undefined') return false;
		if (dt == 'Invalid Date') return false;
		if ((dt.getMonth()+1 != month) || (dt.getDate() != day) || (dt.getFullYear() != year)) return false;
		if (retDate === true) return dt; else return true;
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

	function age (dateStr) {
		if (dateStr == '' || typeof dateStr == 'undefined' || dateStr == null) return '';
		var d1 = new Date(dateStr);
		if (w2utils.isInt(dateStr)) d1 = new Date(Number(dateStr)); // for unix timestamps
		if (d1 == 'Invalid Date') return '';

		var d2  = new Date();
		var sec = (d2.getTime() - d1.getTime()) / 1000;
		var amount = '';
		var type   = '';
		
		if (sec < 60) {
			amount = Math.floor(sec);
			type   = 'sec';
			if (sec < 0) { amount = 0; type = 'sec' }
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
			amount = Math.floor(sec/30/24/60/60*10)/10;
			type   = 'month';
		} else if (sec >= 12*30*24*60*60) {
			amount = Math.floor(sec/12/30/24/60/60*10)/10;
			type   = 'year';
		}		
		return amount + ' ' + type + (amount > 1 ? 's' : '');
	}	
		
	function date (dateStr) {
		if (dateStr == '' || typeof dateStr == 'undefined' || dateStr == null) return '';
		var d1 = new Date(dateStr);
		if (w2utils.isInt(dateStr)) d1 = new Date(Number(dateStr)); // for unix timestamps
		if (d1 == 'Invalid Date') return '';

		var months = w2utils.settings.shortmonths;
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
		if (dd1 == dd3) dsp = w2utils.lang('Yesterday');

		return '<span title="'+ dd1 +' ' + time2 +'">'+ dsp +'</span>';
	}

	function size (sizeStr) {
		if (!w2utils.isFloat(sizeStr) || sizeStr == '') return '';
		sizeStr = parseFloat(sizeStr);
		if (sizeStr == 0) return 0;
		var sizes = ['Bt', 'KB', 'MB', 'GB', 'TB'];
		var i = parseInt( Math.floor( Math.log(sizeStr) / Math.log(1024) ) );
		return (Math.floor(sizeStr / Math.pow(1024, i) * 10) / 10).toFixed(i == 0 ? 0 : 1) + ' ' + sizes[i];
	}

	function formatNumber (val, groupSymbol) {
		var ret = '';
		if (typeof groupSymbol == 'undefined') groupSymbol = w2utils.settings.groupSymbol || ',';
		// check if this is a number
		if (w2utils.isFloat(val) || w2utils.isInt(val) || w2utils.isMoney(val)) {
			tmp = String(val).split('.');
			ret = String(tmp[0]).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1"+ groupSymbol);
			if (typeof tmp[1] != 'undefined') ret += '.' + tmp[1];
		}
		return ret;
	}
	
	function formatDate (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
		var months = w2utils.settings.shortmonths;
		var fullMonths = w2utils.settings.fullmonths;
		if (typeof format == 'undefined') format = this.settings.date_format;
		if (typeof dateStr == 'undefined' || dateStr == '' || dateStr == null) return '';

		var dt = new Date(dateStr);
		if (w2utils.isInt(dateStr)) dt = new Date(Number(dateStr)); // for unix timestamps
		if (dt == 'Invalid Date') return '';

		var year 	= dt.getFullYear();
		var month 	= dt.getMonth();
		var date 	= dt.getDate();
		return format.toLowerCase()
			.replace('month', w2utils.settings.fullmonths[month])
			.replace('mon', w2utils.settings.shortmonths[month])
			.replace(/yyyy/g, year)
			.replace(/yyy/g, year)
			.replace(/yy/g, year > 2000 ? 100 + parseInt(String(year).substr(2)) : String(year).substr(2))
			.replace(/(^|[^a-z$])y/g, '$1'+year) 			// only y's that are not preceeded by a letter
			.replace(/mm/g, (month + 1 < 10 ? '0' : '') + (month + 1))
			.replace(/dd/g, (date < 10 ? '0' : '') + date)
			.replace(/(^|[^a-z$])m/g, '$1'+ (month + 1)) 	// only y's that are not preceeded by a letter
			.replace(/(^|[^a-z$])d/g, '$1' + date); 		// only y's that are not preceeded by a letter
	}

	function formatTime (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
		var months = w2utils.settings.shortmonths;
		var fullMonths = w2utils.settings.fullmonths;
		if (typeof format == 'undefined') format = (this.settings.time_format == 'h12' ? 'hh:mi pm' : 'h24:mi');
		if (typeof dateStr == 'undefined' || dateStr == '' || dateStr == null) return '';

		var dt = new Date(dateStr);
		if (w2utils.isInt(dateStr)) dt = new Date(Number(dateStr)); // for unix timestamps
		if (dt == 'Invalid Date') return '';

		var type = 'am';
		var hour = dt.getHours();
		var h24  = dt.getHours();
		var min  = dt.getMinutes();
		var sec  = dt.getSeconds();
		if (min < 10) min = '0' + min;
		if (sec < 10) sec = '0' + sec;
		if (format.indexOf('am') != -1 || format.indexOf('pm') != -1) {
			if (hour >= 12) type = 'pm'; 
			if (hour > 12)  hour = hour - 12;
		}
		return format.toLowerCase()
			.replace('am', type)
			.replace('pm', type)
			.replace('hh', hour)
			.replace('h24', h24)
			.replace('mm', min)
			.replace('mi', min)
			.replace('ss', sec)
			.replace(/(^|[^a-z$])h/g, '$1' + hour) 	// only y's that are not preceeded by a letter
			.replace(/(^|[^a-z$])m/g, '$1' + min) 	// only y's that are not preceeded by a letter
			.replace(/(^|[^a-z$])s/g, '$1' + sec); 	// only y's that are not preceeded by a letter
	}

	function formatDateTime(dateStr, format) {
		var fmt;
		if (typeof format != 'string') {
			fmt = [this.settings.date_format, this.settings.time_format];
		} else {
			fmt = format.split('|');
		}
		return this.formatDate(dateStr, fmt[0]) + ' ' + this.formatTime(dateStr, fmt[1]);
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

	function escapeId (id) {
		if (typeof id == 'undefined' || id == '' || id == null) return '';
		return String(id).replace(/([;&,\.\+\*\~'`:"\!\^#$%@\[\]\(\)=<>\|\/? {}\\])/g, '\\$1');
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
			var string = String(string).replace(/\r\n/g,"\n");
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
			var c = 0, c1 = 0, c2 = 0;

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
			console.log('ERROR: Cannot do transition when one of the divs is null');
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
			var isWebkit=!!window.webkitURL; // jQuery no longer supports $.browser - RR
			if (!isWebkit && typeof none_webkit_value != 'undefined') value = none_webkit_value;
			return ';'+ property +': '+ value +'; -webkit-'+ property +': '+ value +'; -moz-'+ property +': '+ value +'; '+
				   '-ms-'+ property +': '+ value +'; -o-'+ property +': '+ value +';';
		}
	}
	
	function lock (box, msg, spinner) {
		var options = {};
		if (typeof msg == 'object') {
			options = msg; 
		} else {
			options.msg 	= msg;
			options.spinner = spinner;
		}
		if (!options.msg && options.msg != 0) options.msg = '';
		w2utils.unlock(box);
		$(box).find('>:first-child').before(
			'<div class="w2ui-lock"></div>'+
			'<div class="w2ui-lock-msg"></div>'
		);
		setTimeout(function () {
			var lock = $(box).find('.w2ui-lock');
			var mess = $(box).find('.w2ui-lock-msg');
			lock.data('old_opacity', lock.css('opacity')).css('opacity', '0').show();
			mess.data('old_opacity', mess.css('opacity')).css('opacity', '0').show();
			setTimeout(function () {
				var lock = $(box).find('.w2ui-lock');
				var mess = $(box).find('.w2ui-lock-msg');
				var left = ($(box).width()  - w2utils.getSize(mess, 'width')) / 2;
				var top  = ($(box).height() * 0.9 - w2utils.getSize(mess, 'height')) / 2;
				lock.css({
					opacity : (options.opacity != undefined ? options.opacity : lock.data('old_opacity')),
					left 	: '0px',
					top 	: '0px',
					width 	: '100%',
					height 	: '100%'
				});
				if (!options.msg) mess.css({ 'background-color': 'transparent', 'border': '0px' }); 
				if (options.spinner === true) options.msg = '<div class="w2ui-spinner" '+ (!options.msg ? 'style="width: 30px; height: 30px"' : '') +'></div>' + options.msg;
				mess.html(options.msg).css({
					opacity : mess.data('old_opacity'),
					left	: left + 'px',
					top		: top + 'px'
				});
			}, 10);
		}, 10);
		// hide all tags (do not hide overlays as the form can be in overlay)
		$().w2tag();
	}

	function unlock (box) { 
		$(box).find('.w2ui-lock').remove();
		$(box).find('.w2ui-lock-msg').remove();
	}

	function getSize (el, type) {
		var bwidth = {
			left: 	parseInt($(el).css('border-left-width')) || 0,
			right:  parseInt($(el).css('border-right-width')) || 0,
			top:  	parseInt($(el).css('border-top-width')) || 0,
			bottom: parseInt($(el).css('border-bottom-width')) || 0
		};
		var mwidth = {
			left: 	parseInt($(el).css('margin-left')) || 0,
			right:  parseInt($(el).css('margin-right')) || 0,
			top:  	parseInt($(el).css('margin-top')) || 0,
			bottom: parseInt($(el).css('margin-bottom')) || 0
		};
		var pwidth = {
			left: 	parseInt($(el).css('padding-left')) || 0,
			right:  parseInt($(el).css('padding-right')) || 0,
			top:  	parseInt($(el).css('padding-top')) || 0,
			bottom: parseInt($(el).css('padding-bottom')) || 0
		};
		switch (type) {
			case 'top': 	return bwidth.top + mwidth.top + pwidth.top; 
			case 'bottom': 	return bwidth.bottom + mwidth.bottom + pwidth.bottom; 
			case 'left': 	return bwidth.left + mwidth.left + pwidth.left; 
			case 'right': 	return bwidth.right + mwidth.right + pwidth.right; 
			case 'width': 	return bwidth.left + bwidth.right + mwidth.left + mwidth.right + pwidth.left + pwidth.right + parseInt($(el).width()); 
			case 'height': 	return bwidth.top + bwidth.bottom + mwidth.top + mwidth.bottom + pwidth.top + pwidth.bottom + parseInt($(el).height());
			case '+width': 	return bwidth.left + bwidth.right + mwidth.left + mwidth.right + pwidth.left + pwidth.right; 
			case '+height': return bwidth.top + bwidth.bottom + mwidth.top + mwidth.bottom + pwidth.top + pwidth.bottom;
		}
		return 0;
	}

	function lang (phrase) {
		var translation = this.settings.phrases[phrase];
		if (typeof translation == 'undefined') return phrase; else return translation;
	}

	function locale (locale) {
		if (!locale) locale = 'en-us';
		if (locale.length == 5) locale = 'locale/'+ locale +'.json';
		// load from the file
		$.ajax({
			url		: locale,
			type	: "GET",
			dataType: "JSON",
			async	: false,
			cache 	: false,
			success : function (data, status, xhr) {
				w2utils.settings = $.extend(true, w2utils.settings, data);
				// apply translation to some prototype functions
				var p = w2obj.grid.prototype;
				for (var b in p.buttons) {
					p.buttons[b].caption = w2utils.lang(p.buttons[b].caption);
					p.buttons[b].hint 	 = w2utils.lang(p.buttons[b].hint);
				}
				p.msgDelete		= w2utils.lang(p.msgDelete);
				p.msgNotJSON	= w2utils.lang(p.msgNotJSON);
				p.msgRefresh	= w2utils.lang(p.msgRefresh);
			},
			error	: function (xhr, status, msg) {
				console.log('ERROR: Cannot load locale '+ locale);
			}
		});
	}

	function scrollBarSize () {
		if (tmp.scrollBarSize) return tmp.scrollBarSize; 
		var html = '<div id="_scrollbar_width" style="position: absolute; top: -300px; width: 100px; height: 100px; overflow-y: scroll;">'+
				   '	<div style="height: 120px">1</div>'+
				   '</div>';
		$('body').append(html);
		tmp.scrollBarSize = 100 - $('#_scrollbar_width > div').width();
		$('#_scrollbar_width').remove();
		if (String(navigator.userAgent).indexOf('MSIE') >= 0) tmp.scrollBarSize  = tmp.scrollBarSize / 2; // need this for IE9+
		return tmp.scrollBarSize;
	}

})();

/***********************************************************
*  Generic Event Object
*  --- This object is reused across all other 
*  --- widgets in w2ui.
*
*********************************************************/

w2utils.event = {

	on: function (eventData, handler) {
		if (!$.isPlainObject(eventData)) eventData = { type: eventData };
		eventData = $.extend({ type: null, execute: 'before', target: null, onComplete: null }, eventData);
		
		if (typeof eventData.type == 'undefined') { console.log('ERROR: You must specify event type when calling .on() method of '+ this.name); return; }
		if (typeof handler == 'undefined') { console.log('ERROR: You must specify event handler function when calling .on() method of '+ this.name); return; }
		this.handlers.push({ event: eventData, handler: handler });
	},
	
	off: function (eventData, handler) {
		if (!$.isPlainObject(eventData)) eventData = { type: eventData };
		eventData = $.extend({}, { type: null, execute: 'before', target: null, onComplete: null }, eventData);
	
		if (typeof eventData.type == 'undefined') { console.log('ERROR: You must specify event type when calling .off() method of '+ this.name); return; }
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
		var eventData = $.extend({ type: null, phase: 'before', target: null, isStopped: false, isCancelled: false }, eventData, {
				preventDefault 	: function () { this.isCancelled = true; },
				stopPropagation : function () { this.isStopped   = true; }
			});
		if (typeof eventData.target == 'undefined') eventData.target = null;		
		// process events in REVERSE order 
		for (var h = this.handlers.length-1; h >= 0; h--) {
			var item = this.handlers[h];
			if ( (item.event.type == eventData.type || item.event.type == '*') 
					&& (item.event.target == eventData.target || item.event.target == null)
					&& (item.event.execute == eventData.phase || item.event.execute == '*' || item.event.phase == '*') ) {
				eventData = $.extend({}, item.event, eventData);
				// check handler arguments
				var args = [];
				var tmp  = RegExp(/\((.*?)\)/).exec(item.handler);
				if (tmp) args = tmp[1].split(/\s*,\s*/);
				if (args.length == 2) {
					item.handler.call(this, eventData.target, eventData); // old way for back compatibility
				} else {
					item.handler.call(this, eventData); // new way
				}
				if (eventData.isStopped === true || eventData.stop === true) return eventData; // back compatibility eventData.stop === true
			}
		}		
		// main object events
		var funName = 'on' + eventData.type.substr(0,1).toUpperCase() + eventData.type.substr(1);
		if (eventData.phase == 'before' && typeof this[funName] == 'function') {
			var fun = this[funName];
			// check handler arguments
			var args = [];
			var tmp  = RegExp(/\((.*?)\)/).exec(fun);
			if (tmp) args = tmp[1].split(/\s*,\s*/);
			if (args.length == 2) {
				fun.call(this, eventData.target, eventData); // old way for back compatibility
			} else {
				fun.call(this, eventData); // new way
			}
			if (eventData.isStopped === true || eventData.stop === true) return eventData; // back compatibility eventData.stop === true
		}
		// item object events
		if (typeof eventData.object != 'undefined' && eventData.object != null && eventData.phase == 'before'
				&& typeof eventData.object[funName] == 'function') {
			var fun = eventData.object[funName];
			// check handler arguments
			var args = [];
			var tmp  = RegExp(/\((.*?)\)/).exec(fun);
			if (tmp) args = tmp[1].split(/\s*,\s*/);
			if (args.length == 2) {
				fun.call(this, eventData.target, eventData); // old way for back compatibility
			} else {
				fun.call(this, eventData); // new way
			}
			if (eventData.isStopped === true || eventData.stop === true) return eventData; 
		}
		// execute onComplete
		if (eventData.phase == 'after' && eventData.onComplete != null)	eventData.onComplete.call(this, eventData);
	
		return eventData;
	}
};

/***********************************************************
*  Common Keyboard Handler. Supported in
*  - grid
*  - sidebar
*  - popup
*
*********************************************************/

w2utils.keyboard = (function (obj) {
	// private scope
	var w2ui_name = null;

	obj.active	 	= active;
	obj.clear 		= clear;
	obj.register	= register;

	init();
	return obj;

	function init() {
		$(document).on('keydown', keydown);
		$(document).on('mousedown', mousedown);
	}

	function keydown (event) {
		var tag = event.target.tagName;
		if ($.inArray(tag, ['INPUT', 'SELECT', 'TEXTAREA']) != -1) return;
		if ($(event.target).prop('contenteditable') == 'true') return;
		if (!w2ui_name) return;
		// pass to appropriate widget
		if (w2ui[w2ui_name] && typeof w2ui[w2ui_name].keydown == 'function') {
			w2ui[w2ui_name].keydown.call(w2ui[w2ui_name], event);
		}
	}

	function mousedown (event) {
		var tag = event.target.tagName;
		var obj = $(event.target).parents('.w2ui-reset');
		if (obj.length > 0) {
			w2ui_name = obj.attr('name');
		}
	}

	function active (new_w2ui_name) {
		if (typeof new_w2ui_name == 'undefined') return w2ui_name;
		w2ui_name = new_w2ui_name;
	}

	function clear () {
		w2ui_name = null;
	}

	function register () {
	}

})({});

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
	};

	$.fn.w2destroy = function (name) {
		if (!name && this.length > 0) name = this.attr('name');
		if (typeof name == 'string' && w2ui[name]) w2ui[name].destroy();
		if (typeof name == 'object') name.destroy();
	};

    $.fn.w2checkNameParam = function (params, component) {
		if (!params || typeof params.name == 'undefined') {
			console.log('ERROR: The parameter "name" is required but not supplied in $().'+ component +'().');
			return false;
		}
		if (typeof w2ui[params.name] != 'undefined') {
			console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ params.name +').');
			return false;
		}
		if (!w2utils.isAlphaNumeric(params.name)) {
			console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
			return false;
		}
		return true;
	};

	$.fn.w2marker = function (str) {
		if (str == '' || typeof str == 'undefined') { // remove marker
			return $(this).each(function (index, el) {			
				el.innerHTML = el.innerHTML.replace(/\<span class=\"w2ui\-marker\"\>(.*)\<\/span\>/ig, '$1'); // unmark		
			});
		} else { // add marker
			return $(this).each(function (index, el) {
				if (typeof str == 'string') str = [str];
				el.innerHTML = el.innerHTML.replace(/\<span class=\"w2ui\-marker\"\>(.*)\<\/span\>/ig, '$1'); // unmark		
				for (var s in str) {
					var tmp = str[s];
					if (typeof tmp != 'string') tmp = String(tmp);
					// escape regex special chars
					tmp = tmp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace(/&/g, '&amp;').replace(/</g, '&gt;').replace(/>/g, '&lt;');
					var regex = new RegExp(tmp + '(?!([^<]+)?>)', "gi"); // only outside tags
					el.innerHTML = el.innerHTML.replace(regex, function (matched) { // mark new
						return '<span class="w2ui-marker">' + matched + '</span>';
					});
				}
			});
		}
	};

	// -- w2tag - appears on the right side from element, there can be multiple on screen at a time

	$.fn.w2tag = function (text, options) {
		if (!$.isPlainObject(options)) options = {};
		if (!$.isPlainObject(options.css)) options.css = {};
		if (typeof options['class'] == 'undefined') options['class'] = '';
		// remove all tags
		if ($(this).length == 0) {
			$('.w2ui-tag').each(function (index, elem) {
				var opt = $(elem).data('options');
				if (typeof opt == 'undefined') opt = {};
				$($(elem).data('taged-el')).removeClass( opt['class'] );
				clearInterval($(elem).data('timer'));
				$(elem).remove();
			});
			return;
		}
		return $(this).each(function (index, el) {
			// show or hide tag
			var tagOrigID = el.id;
			var tagID = w2utils.escapeId(el.id);
			if (text == '' || text == null || typeof text == 'undefined') {
				$('#w2ui-tag-'+tagID).css('opacity', 0);
				setTimeout(function () {
					// remmove element
					clearInterval($('#w2ui-tag-'+tagID).data('timer'));
					$('#w2ui-tag-'+tagID).remove();
				}, 300);
			} else {
				// remove elements
				clearInterval($('#w2ui-tag-'+tagID).data('timer'));
				$('#w2ui-tag-'+tagID).remove();
				// insert
				$('body').append('<div id="w2ui-tag-'+ tagOrigID +'" class="w2ui-tag '+ ($(el).parents('.w2ui-popup').length > 0 ? 'w2ui-tag-popup' : '') +'" '+
								 '	style=""></div>');	

				var timer = setInterval(function () { 
					// monitor if destroyed
					if ($(el).length == 0 || ($(el).offset().left == 0 && $(el).offset().top == 0)) {
						clearInterval($('#w2ui-tag-'+tagID).data('timer'));
						tmp_hide(); 
						return;
					}
					// monitor if moved
					if ($('#w2ui-tag-'+tagID).data('position') != ($(el).offset().left + el.offsetWidth) + 'x' + $(el).offset().top) {
						$('#w2ui-tag-'+tagID).css({
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
					$('#w2ui-tag-'+tagID).css({
						opacity: '1',
						left: ($(el).offset().left + el.offsetWidth) + 'px',
						top: $(el).offset().top + 'px'
					}).html('<div style="margin-top: -2px 0px 0px -2px; white-space: nowrap;"> <div class="w2ui-tag-body">'+ text +'</div> </div>')
					.data('text', text)
					.data('taged-el', el)
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
					if ($('#w2ui-tag-'+tagID).length <= 0) return;
					clearInterval($('#w2ui-tag-'+tagID).data('timer'));
					$('#w2ui-tag-'+tagID).remove(); 
					$(el).off('keypress', tmp_hide).removeClass(options['class']); 
					if ($(el).length > 0) $(el)[0].style.cssText = originalCSS;
					if (typeof options.onHide == 'function') options.onHide();
				}
			}
		});
	};
	
	// w2overlay - appears under the element, there can be only one at a time

	$.fn.w2overlay = function (html, options) {
		var obj  = this;
		var name = '';
		var defaults = {
			name		: null,		// it not null, then allows multiple concurent overlays
			align		: 'none',	// can be none, left, right, both
			left 		: 0,		// offset left
			top 		: 0,		// offset top
			tipLeft		: 30,		// tip offset left
			width		: 0,		// fixed width
			height		: 0,		// fixed height
			maxWidth	: null,		// max width if any
			maxHeight	: null,		// max height if any
			style		: '',		// additional style for main div
			'class'		: '',		// additional class name for main dvi
			onShow		: null, 	// event on show
			onHide		: null		// event on hide
		}
		if (!$.isPlainObject(options)) options = {};
		options = $.extend(true, {}, defaults, options);
		if (options.name) name = '-' + options.name;
		// if empty then hide
		if (this.length == 0 || html == '' || typeof html == 'undefined') { 
			$(document).click(); 
			return $(this); 
		}
		if ($('#w2ui-overlay').length > 0) $(document).click();
		$('body').append(
			'<div id="w2ui-overlay'+ name +'" style="display: none"'+
			'		class="w2ui-reset w2ui-overlay '+ ($(this).parents('.w2ui-popup').length > 0 ? 'w2ui-overlay-popup' : '') +'">'+
			'	<style></style>'+
			'	<div style="'+ options.style +'" class="'+ options['class'] +'"></div>'+
			'</div>'
		);
		// init
		var div1 = $('#w2ui-overlay'+ name);
		var div2 = div1.find(' > div');
		div2.html(html);
		// pick bg color of first div
		var bc  = div2.css('background-color'); 
		if (typeof bc != 'undefined' &&	bc != 'rgba(0, 0, 0, 0)' && bc != 'transparent') div1.css('background-color', bc);

		div1.data('obj', obj)
			.data('fixSize', fixSize)
			.fadeIn('fast').on('mousedown', function (event) { 
				$('#w2ui-overlay'+ name).data('keepOpen', true); 
				if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(event.target.tagName) === -1) event.preventDefault(); 
			});

		// need time to display
		fixSize();
		setTimeout(function () {
			fixSize();
			if (typeof options.onShow == 'function') options.onShow();
		}, 10);
		return $(this);

		// click anywhere else hides the drop down
		function hide () {
			var div1 = $('#w2ui-overlay'+ name);
			if (div1.data('keepOpen') === true) {
				div1.removeData('keepOpen');
				return;
			}
			var result;
			if (typeof options.onHide == 'function') result = options.onHide();
			if (result === false) return;
			div1.remove();
			$(document).off('click', hide);
			clearInterval(div1.data('timer'));
		}

		function fixSize () {
			$(document).off('click', hide).on('click', hide);
			var div1 = $('#w2ui-overlay'+ name);
			var div2 = div1.find(' > div');
			// if goes over the screen, limit height and width
			if (div1.length > 0) {
				div2.height('auto').width('auto');
				// width/height
				var overflowX = false;
				var overflowY = false;
				var h = div2.height();
				var w = div2.width();
				// alignment
				switch(options.align) {
					case 'both':
						options.left = 17;
						options.width = w2utils.getSize($(obj), 'width');
						break;
					case 'left':
						options.left = 17;
						break;
					case 'right':
						options.tipLeft = w - 45;
						options.left = w2utils.getSize($(obj), 'width') - w + 10;
						break;
				}
				// Y coord
				div1.css({
					top			: ($(obj).offset().top + w2utils.getSize($(obj), 'height') + options.top + 5) + 'px',
					left		: ($(obj).offset().left + options.left) + 'px',
					'min-width' : (options.width ? options.width : 'auto'),
					'min-height': (options.height ? options.height : 'auto')
				});
				// $(window).height() - has a problem in FF20
				var maxHeight = window.innerHeight + $(document).scrollTop() - div2.offset().top - 7;
				var maxWidth  = window.innerWidth + $(document).scrollLeft() - div2.offset().left - 7;
				if (maxHeight > -30 && maxHeight < 210) {
					// show on top
					maxHeight = div2.offset().top - $(document).scrollTop() - 7;
					if (options.maxHeight && maxHeight > options.maxHeight) maxHeight = options.maxHeight;
					if (h > maxHeight) { 
						overflowY = true;
						div2.height(maxHeight).width(w).css({ 'overflow-y': 'auto' });
						h = maxHeight;
					}
					div1.css('top', ($(obj).offset().top - h - 24 + options.top) + 'px');
					div1.find('>style').html(
						'#w2ui-overlay'+ name +':before { display: none; margin-left: '+ parseInt(options.tipLeft) +'px; }'+
						'#w2ui-overlay'+ name +':after { display: block; margin-left: '+ parseInt(options.tipLeft) +'px; }'
					);
				} else {
					// show under
					if (options.maxHeight && maxHeight > options.maxHeight) maxHeight = options.maxHeight;
					if (h > maxHeight) { 
						overflowY = true;
						div2.height(maxHeight).width(w).css({ 'overflow-y': 'auto' });
					}
					div1.find('>style').html(
						'#w2ui-overlay'+ name +':before { display: block; margin-left: '+ parseInt(options.tipLeft) +'px; }'+
						'#w2ui-overlay'+ name +':after { display: none; margin-left: '+ parseInt(options.tipLeft) +'px; }'
					);
				}
				// check width
				w = div2.width();
				maxWidth = window.innerWidth + $(document).scrollLeft() - div2.offset().left - 7;
				if (options.maxWidth && maxWidth > options.maxWidth) maxWidth = options.maxWidth;
				if (w > maxWidth && options.align != 'both') {
					options.align = 'right';
					setTimeout(function () { fixSize(); }, 1);
				}
				// check scroll bar
				if (overflowY && overflowX) div2.width(w + w2utils.scrollBarSize() + 2);
			}
		}
	};

	$.fn.w2menu = function (menu, options) {
		/* 
		ITEM STRUCTURE
			item : {
				id		: null,
				text 	: '',
				style	: '',
				hidden	: true
				...
			}
		*/		
		var defaults = {
			index		: null, 	// current selected
			items 		: [],
			render		: null,
			onSelect 	: null
		}
		if (menu == 'refresh') {
			var name = '';
			if (options.name) name = '-' + options.name;
			// if not show - call blur
			if ($('#w2ui-overlay'+ name).length > 0) {
				$('#w2ui-overlay'+ name +' > div').html(getMenuHTML(), options);
				var fun = $('#w2ui-overlay'+ name).data('fixSize');
				if (typeof fun == 'function') fun();
			} else {
				$(this).w2menu(options);
			}
		} else {
			if (arguments.length == 1) options = menu; else options.items = menu;
			if (typeof options != 'object') options = {};
			options = $.extend({}, defaults, options);
			if (typeof options.select == 'function' && typeof options.onSelect != 'function') options.onSelect = options.select;
			if (typeof options.onRender == 'function' && typeof options.render != 'function') options.render = options.onRender;
			// since only one overlay can exist at a time
			$.fn.w2menuHandler = function (event, index) {
				if (typeof options.onSelect == 'function') {
					options.onSelect({
						index	: index,
						item	: options.items[index],
						originalEvent: event
					}); 
				}
			};
			return $(this).w2overlay(getMenuHTML(), options);
		}

		function getMenuHTML () { 
			var count		= 0;
			var menu_html	= '<table cellspacing="0" cellpadding="0" class="w2ui-drop-menu">';
			for (var f = 0; f < options.items.length; f++) { 
				var mitem = options.items[f];
				if (typeof mitem == 'string') {
					mitem = { id: mitem, text: mitem };
				} else {
					if (typeof mitem.text != 'undefined' && typeof mitem.id == 'undefined') mitem.id = mitem.text;
					if (typeof mitem.text == 'undefined' && typeof mitem.id != 'undefined') mitem.text = mitem.id;
					if (typeof mitem.caption != 'undefined') mitem.text = mitem.caption;
					var img  = mitem.img;
					var icon = mitem.icon;
					if (typeof img  == 'undefined') img  = null;
					if (typeof icon == 'undefined') icon = null;
				}
				if (mitem.hidden !== true) {
					var imgd = '';
					var txt = mitem.text;
					if (typeof options.render == 'function') txt = options.render(mitem, options);
					if (img)  imgd = '<td><div class="w2ui-tb-image w2ui-icon '+ img +'"></div></td>';
					if (icon) imgd = '<td align="center"><span class="w2ui-icon '+ icon +'"></span></td>';
					// render only if non-empty
					if (txt || txt === 0) {
						var bg = (count % 2 == 0 ? 'w2ui-item-even' : 'w2ui-item-odd');
						if (options.altRows !== true) bg = '';
						menu_html += 
							'<tr index="'+ f + '" style="'+ (mitem.style ? mitem.style : '') +'" '+
							'		class="'+ bg +' '+ (options.index == count ? 'w2ui-selected' : '') +'"'+
							'		onclick="$(document).click(); $.fn.w2menuHandler(event, \''+ f +'\');" '+
							'		onmouseover="$(this).addClass(\'w2ui-selected\');" '+
							'		onmouseout="$(this).removeClass(\'w2ui-selected\');">'+
								imgd +
							'	<td>'+ txt +'</td>'+
							'</tr>';
						count++;
					}
				}
				options.items[f] = mitem;
			}
			if (count == 0) {
				menu_html += '<tr><td style="text-align: center; color: #999">No items</td></tr>';
			}
			menu_html += "</table>";
			return menu_html;
		}	
	}
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*		- w2field		- various field controls
*		- $().w2field	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
************************************************************************/

(function ($) {

	var w2field = function (options) {
		// public properties
		this.el			= null
		this.helpers	= {}; // object or helper elements
		this.type		= options.type || 'text';
		this.type 		= String(this.type).toLowerCase();
		this.options	= $.extend(true, {}, options);
		this.onSearch	= options.onSearch		|| null;
		this.onRequest	= options.onRequest		|| null;
		this.onLoad		= options.onLoad		|| null;
		this.onClick	= options.onClick		|| null;
		this.onAdd		= options.onAdd			|| null;
		this.onRemove	= options.onRemove		|| null;
		this.onMouseOver= options.onMouseOver	|| null;
		this.onMouseOut	= options.onMouseOut	|| null;
		this.tmp		= {}; // temp object
		// clean up some options
		delete this.options.type;
		delete this.options.onSearch;
		delete this.options.onRequest;
		delete this.options.onLoad;
		delete this.options.onClick;
		delete this.options.onMouseOver;
		delete this.options.onMouseOut;
		// extend with defaults
		$.extend(true, this, w2obj.field);
	};

	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2field = function (method, options) {
		// call direct
		if (this.length == 0) {
			var pr = w2field.prototype;
			if (pr[method]) {
				return pr[method].apply(pr, Array.prototype.slice.call(arguments, 1));
			}   
		} else {
			if (typeof method == 'string' && typeof options == 'object') {
				method = $.extend(true, {}, options, { type: method });
			}
			if (typeof method == 'string' && typeof options == 'undefined') {
				method = { type: method };
			}
			return this.each(function (index, el) {
				var obj = $(el).data('w2field');
				// if object is not defined, define it
				if (typeof obj == 'undefined') {
					var obj = new w2field(method);
					$.extend(obj, { handlers: [] });
					if (el) obj.el = $(el)[0];
					obj.init();
					$(el).data('w2field', obj);
					return obj;
				} else { // fully re-init
					obj.clear();
					var obj = new w2field(method);
					$.extend(obj, { handlers: [] });
					if (el) obj.el = $(el)[0];
					obj.init();
					$(el).data('w2field', obj);
					return obj;
				}
				return null;
			});
		}
	}	

	// ====================================================
	// -- Implementation of core functionality

	/* 	To add custom types
		$().w2field('addType', 'myType', function (options) {
			$(this.el).on('keypress', function (event) { 
				if (event.metaKey || event.ctrlKey || event.altKey 
					|| (event.charCode != event.keyCode && event.keyCode > 0)) return;
				var ch = String.fromCharCode(event.charCode);
				if (ch != 'a' && ch != 'b' && ch != 'c') {
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					return false;
				}
			});
			$(this.el).on('blur', function (event)  { // keyCode & charCode differ in FireFox
				var ch = this.value;
				if (ch != 'a' && ch != 'b' && ch != 'c') { 
					$(this).w2tag(w2utils.lang("Not a single charecter from the set of 'abc'"));
				}
			});
		});	
	*/

	w2field.prototype = {

		custom: {},  // map of custom types

		addType: function (type, handler) {
			this.custom[String(type).toLowerCase()] = handler;
			return true;
		},

		removeType: function (type) {
			if (!this.custom[String(type).toLowerCase()]) return false;
			delete this.custom[String(type).toLowerCase()];
			return true
		},
		
		init: function () {
			var obj 	= this;
			var options = this.options;
			var defaults;

			// Custom Types
			if (typeof this.custom[this.type.toLowerCase()] == 'function') {
				this.custom[this.type.toLowerCase()].call(this, options);
				return;
			} 
			// only for INPUT or TEXTAREA
			if (['INPUT', 'TEXTAREA'].indexOf(this.el.tagName) == -1) {
				console.log('ERROR: w2field could only be applied to INPUT or TEXTAREA.', this.el);
				return;
			}

			switch (this.type) {
				case 'text':
				case 'int':
				case 'float':
				case 'money':
				case 'currency':
				case 'percent':
				case 'alphanumeric':
				case 'hex':
					defaults = {
						min				: null,
						max				: null,
						placeholder		: '', 
						autoFormat	 	: true,
						currencyPrefix	: w2utils.settings.currencyPrefix,
						currencySuffix	: w2utils.settings.currencySuffix,
						groupSymbol		: w2utils.settings.groupSymbol,
						arrows			: false,
						keyboard		: true,
						precision		: null,
						silent			: true,
						prefix			: '',
						suffix			: ''
					};
					this.options = $.extend(true, {}, defaults, options);
					options = this.options; // since object is re-created, need to re-assign
					options.numberRE  = new RegExp('['+ options.groupSymbol + ']', 'g');
					options.moneyRE   = new RegExp('['+ options.currencyPrefix + options.currencySuffix + options.groupSymbol + ']', 'g');
					options.percentRE = new RegExp('['+ options.groupSymbol + '%]', 'g');
					// no keyboard support needed
					if (['text', 'alphanumeric', 'hex'].indexOf(this.type) != -1) {
						options.arrows   = false;
						options.keyboard = false;
					}
					this.addPrefix(); // only will add if needed
					this.addSuffix();
					$(this.el).attr('placeholder', options.placeholder);
					break;

				case 'color':
					defaults = {
						prefix		: '#',
						suffix		: '<div style="width: '+ (parseInt($(this.el).css('font-size')) || 12) +'px">&nbsp;</div>',
						placeholder	: '', 
						arrows		: false,
						keyboard	: false
					};
					$.extend(options, defaults);
					this.addPrefix(); 	// only will add if needed
					this.addSuffix();	// only will add if needed
					// additional checks
					$(this.el).attr('maxlength', 6);
					if ($(this.el).val() != '') setTimeout(function () { $(obj.el).change(); }, 1);
					$(this.el).attr('placeholder', options.placeholder);
					break;

				case 'date':
					defaults = {
						format		: w2utils.settings.date_format, // date format
						placeholder	: '', 
						keyboard	: true,
						silent		: true,
						start		: '',		// string or jquery object
						end			: '',		// string or jquery object
						blocked		: {},		// { '4/11/2011': 'yes' }
						colored		: {}		// { '4/11/2011': 'red:white' }
					};
					this.options = $.extend(true, {}, defaults, options);
					options = this.options; // since object is re-created, need to re-assign
					$(this.el).attr('placeholder', options.placeholder ? options.placeholder : options.format);
					break;

				case 'time':
					defaults = {
						format		: w2utils.settings.time_format,
						placeholder	: '', 
						keyboard	: true,
						silent		: true,
						start		: '',
						end			: ''
					};
					this.options = $.extend(true, {}, defaults, options);
					options = this.options; // since object is re-created, need to re-assign
					$(this.el).attr('placeholder', options.placeholder ? options.placeholder : (options.format == 'h12' ? 'hh:mi pm' : 'hh:mi'));
					break;

				case 'list':
				case 'combo':
					defaults = {
						items		: [],
						selected	: {},
						placeholder	: '',
						url 		: null, 		// url to pull data from
						cacheMax	: 500,
						maxWidth	: null,			// max width for input control to grow
						maxHeight	: 350,			// max height for input control to grow
						match		: 'contains',	// ['contains', 'is', 'begins with', 'ends with']
						silent		: true,
						onSearch	: null,			// when search needs to be performed
						onRequest	: null,			// when request is submitted
						onLoad		: null,			// when data is received
						render		: null, 		// render function for drop down item
						showAll		: false, 		// weather to apply filter or not when typing
						markSearch 	: true
					};
					options = $.extend({}, defaults, options, {
						align 		: 'both',		// same width as control
						suffix		: '<div class="arrow-down" style="margin-top: '+ ((parseInt($(this.el).height()) - 8) / 2) +'px;"></div>',
						altRows		: true			// alternate row color
					});
					this.options = options;
					if (!$.isPlainObject(options.selected)) options.selected = {};
					$(this.el).data('selected', options.selected);
					if (options.url) this.request(0);
					this.addSuffix();
					$(this.el).attr('placeholder', options.placeholder);
					if (typeof options.selected.text != 'undefined') $(this.el).val(options.selected.text);
					break;

				case 'enum':
					defaults = {
						items		: [],
						selected	: [],
						placeholder	: '',
						max 		: 0,		// max number of selected items, 0 - unlim
						url 		: null, 	// not implemented
						cacheMax	: 500,
						maxWidth	: null,		// max width for input control to grow
						maxHeight	: 350,		// max height for input control to grow
						match		: 'contains',	// ['contains', 'is', 'begins with', 'ends with']
						silent		: true,
						showAll		: false, 	// weather to apply filter or not when typing
						markSearch 	: true,
						render		: null, 	// render function for drop down item
						itemRender	: null,		// render selected item
						itemsHeight : 350,		// max height for the control to grow
						itemMaxWidth: 250,		// max width for a single item
						onSearch	: null,		// when search needs to be performed
						onRequest	: null,		// when request is submitted
						onLoad		: null,		// when data is received
						onClick		: null,		// when an item is clicked
						onAdd		: null,		// when an item is added
						onRemove	: null,		// when an item is removed
						onMouseOver : null,		// when an item is mouse over
						onMouseOut	: null		// when an item is mouse out
					};
					options = $.extend({}, defaults, options, {
						align 		: 'both',		// same width as control
						suffix		: '<div class="arrow-down" style="margin-top: '+ ((parseInt($(this.el).height()) - 8) / 2) +'px;"></div>',
						altRows		: true		// alternate row color
					});
					this.options = options;
					if (!$.isArray(options.selected)) options.selected = [];
					$(this.el).data('selected', options.selected);
					if (options.url) this.request(0);
					this.addSuffix();
					this.addMulti();
					break;

				case 'file':
					defaults = {
						selected	: [],
						placeholder	: w2utils.lang('Attach files by dragging and dropping or Click to Select'),
						max 		: 0,
						maxSize		: 0,		// max size of all files, 0 - unlim
						maxFileSize	: 0,		// max size of a single file, 0 -unlim
						maxWidth	: null,		// max width for input control to grow
						maxHeight	: 350,		// max height for input control to grow
						silent		: true,
						itemRender	: null,		// render selected item
						itemMaxWidth: 250,		// max width for a single item
						itemsHeight : 350,		// max height for the control to grow
						onClick		: null,		// when an item is clicked
						onAdd		: null,		// when an item is added
						onRemove	: null,		// when an item is removed
						onMouseOver : null,		// when an item is mouse over
						onMouseOut	: null,		// when an item is mouse out
					};
					options = $.extend({}, defaults, options, {
						align 		: 'both',	// same width as control
						altRows		: true		// alternate row color
					});
					this.options = options;
					if (!$.isArray(options.selected)) options.selected = [];
					$(this.el).data('selected', options.selected);
					if (options.url) this.request(0);
					this.addMulti();
					break;
			}
			// attach events
			this.tmp = {
				onChange	: function (event) { obj.change.call(obj, event) },
				onClick		: function (event) { event.stopPropagation() },
				onFocus		: function (event) { obj.focus.call(obj, event) },
				onBlur 		: function (event) { obj.blur.call(obj, event) },
				onKeydown	: function (event) { obj.keyDown.call(obj, event) },
				onKeyup		: function (event) { obj.keyUp.call(obj, event) },
				onKeypress	: function (event) { obj.keyPress.call(obj, event) }
			}
			$(this.el)
				.addClass('w2field')
				.data('w2field', this)
				.on('change', 	this.tmp.onChange)
				.on('click', 	this.tmp.onClick) 		// ignore click because it messes overlays
				.on('focus', 	this.tmp.onFocus)
				.on('blur', 	this.tmp.onBlur)
				.on('keydown', 	this.tmp.onKeydown)
				.on('keyup', 	this.tmp.onKeyup)
				.on('keypress', this.tmp.onKeypress)
				.css({
					'box-sizing'		: 'border-box',
					'-webkit-box-sizing': 'border-box',
					'-moz-box-sizing'	: 'border-box',
					'-ms-box-sizing'	: 'border-box',
					'-o-box-sizing'		: 'border-box'
				});
			// format initial value
			this.change($.Event('change'));
		},

		clear: function () {
			var obj		 = this;
			var options	 = this.options;
			// restore paddings
			var tmp = $(this.el).data('tmp');
			if (tmp && tmp['old-padding-left'])  $(this.el).css('padding-left',  tmp['old-padding-left']);
			if (tmp && tmp['old-padding-right']) $(this.el).css('padding-right', tmp['old-padding-right']);
			// if money then clear value
			if (['money', 'currency'].indexOf(this.type) != -1) {
				$(this.el).val($(this.el).val().replace(options.moneyRE, ''));
			}
			if (this.type == 'percent') {
				$(this.el).val($(this.el).val().replace(/%/g, ''));
			}
			if (this.type == 'color') {
				$(this.el).removeAttr('maxlength');
			}
			// remove events and data
			$(this.el)
				.removeClass('w2field')
				.removeData() // removes all attached data
				.off('change', 	this.tmp.onChange)
				.off('click', 	this.tmp.onClick)
				.off('focus', 	this.tmp.onFocus)
				.off('blur', 	this.tmp.onBlur)
				.off('keydown', this.tmp.onKeydown)
				.off('keyup', 	this.tmp.onKeyup)
				.off('keypress',this.tmp.onKeypress);
			// remove helpers
			for (var h in this.helpers) $(this.helpers[h]).remove();
			this.helpers = {};
		},

		refresh: function () {
			var obj		 = this;
			var options	 = this.options;
			var selected = $(this.el).data('selected');
			// enum
			if (['enum', 'file'].indexOf(this.type) != -1) {
				var html = '';
				for (var s in selected) {
					var item = '<li index="'+ s +'" style="max-width: '+ parseInt(options.itemMaxWidth) + 'px">'+
							   '	<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&nbsp;&nbsp;</div>'+	
							   		(obj.type == 'enum' ? selected[s].text : selected[s].name + '<span class="file-size"> - '+ w2utils.size(selected[s].size) +'</span>') +
							   '</li>';
					if (typeof options.itemRender == 'function') {
						item = options.itemRender(selected[s], s, '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&nbsp;&nbsp;</div>');
					}
					if (item.indexOf('<li') == -1) item = '<li index="'+ s +'">' + item + '</li>';
					html += item;
				}

				var div = obj.helpers['multi'];
				var ul  = div.find('ul');
				// celan
				div.find('.w2ui-enum-placeholder').remove();
				ul.find('li').not('li.nomouse').remove();
				// add new list
				if (html != '') {
					ul.prepend(html);
				} else if (typeof options.placeholder != 'undefined') {
					var style = 
						'padding-top: ' + $(this.el).css('padding-top') + ';'+
						'padding-left: ' + $(this.el).css('padding-left') + '; ' +
						'box-sizing: ' + $(this.el).css('box-sizing') + '; ' +
						'line-height: ' + $(this.el).css('line-height') + '; ' +
						'font-size: ' + $(this.el).css('font-size') + '; ' +
						'font-family: ' + $(this.el).css('font-family') + '; ';
					div.prepend('<div class="w2ui-enum-placeholder" style="'+ style +'">'+ options.placeholder + '</div>');
				}
				// ITEMS events
				div.find('li')
					.data('mouse', 'out')
					.on('click', function (event) {
						var item = selected[$(event.target).attr('index')];
						if ($(event.target).hasClass('nomouse')) return;
						event.stopPropagation();
						if ($(event.target).hasClass('w2ui-list-remove')) {
							// trigger event
							var eventData = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item });
							if (eventData.isCancelled === true) return;
							// default behavior
							$().w2overlay();
							selected.splice($(event.target).attr('index'), 1);
							$(obj.el).trigger('change');
							$(event.target).parent().fadeOut('fast');
							setTimeout(function () { 
								obj.refresh(); 
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							}, 300);
						}
						if (obj.type == 'file' && !$(event.target).hasClass('w2ui-list-remove')) {
							var preview = '';
							if ((/image/i).test(item.type)) { // image
								preview = '<div style="padding: 3px;">'+
									'	<img src="'+ (item.content ? 'data:'+ item.type +';base64,'+ item.content : '') +'" style="max-width: 300px;" '+
									'		onload="var w = $(this).width(); var h = $(this).height(); '+
									'			if (w < 300 & h < 300) return; '+
									'			if (w >= h && w > 300) $(this).width(300);'+
									'			if (w < h && h > 300) $(this).height(300);"'+
									'		onerror="this.style.display = \'none\'"'+
									'	>'+
									'</div>';
							}
							var td1 = 'style="padding: 3px; text-align: right; color: #777;"';
							var td2 = 'style="padding: 3px"';
							preview += '<div style="padding: 8px;">'+
								'	<table cellpadding="2">'+
								'	<tr><td '+ td1 +'>Name:</td><td '+ td2 +'>'+ item.name +'</td></tr>'+
								'	<tr><td '+ td1 +'>Size:</td><td '+ td2 +'>'+ w2utils.size(item.size) +'</td></tr>'+
								'	<tr><td '+ td1 +'>Type:</td><td '+ td2 +'>' +
								'		<span style="width: 200px; display: block-inline; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ item.type +'</span>'+
								'	</td></tr>'+
								'	<tr><td '+ td1 +'>Modified:</td><td '+ td2 +'>'+ w2utils.date(item.modified) +'</td></tr>'+
								'	</table>'+
								'</div>';
								$(event.target).w2overlay(preview);
						}
						// trigger event
						var eventData = obj.trigger({ phase: 'before', type: 'click', target: obj.el, originalEvent: event.originalEvent, item: item });
						if (eventData.isCancelled === true) return;
						// event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
					})
					.on('mouseover', function (event) {
						var tmp = event.target;
						if (tmp.tagName != 'LI') tmp = tmp.parentNode;
						if ($(tmp).hasClass('nomouse')) return;
						if ($(tmp).data('mouse') == 'out') {
							var item = selected[$(tmp).attr('index')];
							// trigger event
							var eventData = obj.trigger({ phase: 'before', type: 'mouseOver', target: obj.el, originalEvent: event.originalEvent, item: item });
							if (eventData.isCancelled === true) return;
							// event after
							obj.trigger($.extend(eventData, { phase: 'after' }));
						}
						$(tmp).data('mouse', 'over');
					})
					.on('mouseout', function (event) {
						var tmp = event.target;
						if (tmp.tagName != 'LI') tmp = tmp.parentNode;
						if ($(tmp).hasClass('nomouse')) return;
						$(tmp).data('mouse', 'leaving');
						setTimeout(function () {
							if ($(tmp).data('mouse') == 'leaving') {
								$(tmp).data('mouse', 'out');
								var item = selected[$(tmp).attr('index')];
								// trigger event
								var eventData = obj.trigger({ phase: 'before', type: 'f', target: obj.el, originalEvent: event.originalEvent, item: item });
								if (eventData.isCancelled === true) return;
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							}
						}, 0);
					});
				// adjust height
				$(this.el).height('auto');
				var cntHeight = $(div).find('> div').height() + w2utils.getSize(div, '+height') * 2;
				if (cntHeight < 23) cntHeight = 23;
				if (cntHeight > options.itemsHeight) cntHeight = options.itemsHeight;
				if (div.length > 0) div[0].scrollTop = 1000;
				var inpHeight = w2utils.getSize($(this.el), 'height') - 2;
				if (inpHeight > cntHeight) cntHeight = inpHeight
				$(div).css({ 'height': cntHeight + 'px', overflow: (cntHeight == options.itemsHeight ? 'auto' : 'hidden') });
				if (cntHeight < options.itemsHeight) $(div).prop('scrollTop', 0);
				$(this.el).css({ 'height' : (cntHeight + 2) + 'px' });
			}
		},

		reset: function () {
			this.clear();
			this.init();
		},

		clean: function (val) {
			var options = this.options;
			val = String(val).trim();
			// clean
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
				if (options.autoFormat && ['money', 'currency'].indexOf(this.type) != -1) val = String(val).replace(options.moneyRE, '');
				if (options.autoFormat && this.type == 'percent') val = String(val).replace(options.percentRE, '');
				if (options.autoFormat && ['int', 'float'].indexOf(this.type) != -1) val = String(val).replace(options.numberRE, '');
				if (parseFloat(val) == val) {
					if (options.min !== null && val < options.min) { val = options.min; $(this.el).val(options.min); }
					if (options.max !== null && val > options.max) { val = options.max; $(this.el).val(options.max); }
				}
				val = Number(val);
			}
			return val;
		},

		format: function (val) {
			var options = this.options;
			// autoformat numbers or money
			if (options.autoFormat && val != '') {
				switch (this.type) {
					case 'money':
					case 'currency':
						val = w2utils.formatNumber(Number(val).toFixed(2), options.groupSymbol);
						if (val != '') val = options.currencyPrefix + val + options.currencySuffix;
						break;
					case 'percent':
						val = w2utils.formatNumber(options.precision ? Number(val).toFixed(options.precision) : val, options.groupSymbol);
						if (val != '') val += '%';
						break;
					case 'float':
						val = w2utils.formatNumber(options.precision ? Number(val).toFixed(options.precision) : val, options.groupSymbol);
						break;
					case 'int':
						val = w2utils.formatNumber(val, options.groupSymbol);
						break;
				}
			}
			return val;
		},

		change: function (event) {
			var obj 	= this;
			var options = obj.options;
			// numeric 
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
				// check max/min
				var val 	=  $(this.el).val();
				var new_val = this.format(this.clean($(this.el).val()));
				// if was modified
				if (val != '' && val != new_val) {
					$(this.el).val(new_val).change();
					// cancel event
					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			}
			// color
			if (this.type == 'color') {
				var color = '#' + $(this.el).val();
				if ($(this.el).val().length != 6 && $(this.el).val().length != 3) color = '';
				$(this.el).next().find('div').css('background-color', color);				
			}
		},

		focus: function (event) {
			var obj 	= this;
			var options = this.options;
			// color
			if (this.type == 'color') {
				$("#w2ui-overlay").remove();
				$(obj.el).w2overlay(obj.getColorHTML());
				// bind events
				$('#w2ui-overlay .color')
					.on('mousedown', function (event) {
						var color = $(event.originalEvent.target).attr('name');
						$(obj.el).val(color).change().blur();
						$('#w2ui-overlay').remove();		
					});
			}
			// date
			if (this.type == 'date') {
				$("#w2ui-overlay").remove();
				setTimeout(function () { 
					$(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar"></div>', { css: { "background-color": "#f5f5f5" } });
					setTimeout(function () { obj.updateOverlay(); }, 1);
				}, 1);
			}
			// time
			if (this.type == 'time') {
				$("#w2ui-overlay").remove();				
				setTimeout(function () { 
					$(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { "background-color": "#fff" } });
					setTimeout(function () { obj.updateOverlay(); }, 1);
				}, 1);
			}
			// menu
			if (['list', 'combo', 'enum'].indexOf(this.type) != -1) {
				$("#w2ui-overlay").remove();				
				setTimeout(function () {
					if (options.showAll !== true) obj.search();
					$(obj.el).w2menu($.extend(true, {}, options, {
						onSelect: function (event) {
							if (obj.type == 'enum') {
								var selected = $(obj.el).data('selected');
								if (event.item) {
									// trigger event
									var eventData = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: event.item });
									if (eventData.isCancelled === true) return;
									// default behavior
									if (selected.length >= options.max && options.max > 0) selected.pop();
									delete event.item.hidden;
									selected.push(event.item);
									$(obj.el).data('selected', selected).change();
									$(obj.helpers['multi']).find('input').val('');
									obj.refresh();
									$('#w2ui-overlay').remove();
									// event after
									obj.trigger($.extend(eventData, { phase: 'after' }));
								}
							} else {					
								$(obj.el).data('selected', event.item).val(event.item.text).change().blur();
							}
						}
					}));
				}, 1);
			}
			// file
			if (this.type == 'file') {
				$(this.helpers['multi']).css({ 'outline': 'auto 5px -webkit-focus-ring-color', 'outline-offset': '-2px' });
			}
		},

		blur: function (event) {			
			var obj 	= this;
			var options = obj.options;
			var val 	= $(this.el).val().trim();
			// hide overlay
			if (['color', 'date', 'time', 'list', 'combo', 'enum'].indexOf(this.type) != -1) {
				$('#w2ui-overlay').remove();
			}
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
				if (val !== '' && !this.checkType(val)) { 
					$(this.el).val('').change();
					if (options.silent === false) {
						$(this.el).w2tag('Not a valid number');
						setTimeout(function () { $(this.el).w2tag(''); }, 3000);
					}
				}
			}
			// date or time
			if (['date', 'time'].indexOf(this.type) != -1) {
				// check if in range
				if (val !== '' && !this.inRange(this.el.value)) {
					$(this.el).val('').removeData('selected').change();
					if (options.silent === false) {
						$(this.el).w2tag('Not in range');
						setTimeout(function () { $(this.el).w2tag(''); }, 3000);
					}
				} else {
					if (this.type == 'date' && val !== '' && !w2utils.isDate(this.el.value, options.format)) {
						$(this.el).val('').removeData('selected').change();
						if (options.silent === false) {
							$(this.el).w2tag('Not a valid date');
							setTimeout(function () { $(this.el).w2tag(''); }, 3000);
						}
					}
					if (this.type == 'time' && val !== '' && !w2utils.isTime(this.el.value)) {
						$(this.el).val('').removeData('selected').change();
						if (options.silent === false) {
							$(this.el).w2tag('Not a valid time');
							setTimeout(function () { $(this.el).w2tag(''); }, 3000);
						}
					}
				}
			}
			// make sure element exists
			if (['list'].indexOf(this.type) != -1) {
				if (typeof val == 'undefined') return;
				// make sure element exists
				var flag = false;
				for (var i in options.items) {
					var it = options.items[i];
					if (typeof it == 'object' && it.text == val) flag = true;
					if (typeof it == 'string' && it == val) flag = true;
				}
				if (!flag && val !== '') {
					$(this.el).val('').removeData('selected').change();
					if (options.silent === false) {
						$(this.el).w2tag('Not in list');
						setTimeout(function () { $(this.el).w2tag(''); }, 3000);
					}
					for (var i in options.items) delete options.items.hidden;
				}
			}
			// clear search input
			if (['enum'].indexOf(this.type) != -1) {
				$(this.helpers['multi']).find('input').val('');
			}
			// file
			if (this.type == 'file') {
				$(this.helpers['multi']).css({ 'outline': 'none' });
			}
		},

		keyPress: function (event) {
			var obj 	= this;
			var options = obj.options;
			// ignore wrong pressed key
			if (['int', 'float', 'money', 'currency', 'percent', 'hex', 'color', 'alphanumeric'].indexOf(this.type) != -1) {
				// keyCode & charCode differ in FireFox
				if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
				var ch = String.fromCharCode(event.charCode);
				if (!this.checkType(ch, true) && event.keyCode != 13) {
					event.preventDefault();
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					return false;
				}
			}
			// update date popup
			if (['date', 'time'].indexOf(this.type) != -1) {
				setTimeout(function () { obj.updateOverlay(); }, 1);
			}
			// list/select
			if (['list'].indexOf(this.type) != -1) {
				if (event.keyCode == 13) {
					var val = $(this.el).val();
					if (typeof val == 'undefined') return;
					// make sure element exists
					var item = null;
					for (var i in options.items) {
						if (options.items[i].text == val) { item = options.items[i]; break; }
					}
					var current = $(this.el).data('selected');
					if (!item) {
						$(this.el).val('').removeData('selected');
					} else if (!current || current.id != item.id) {
						$(this.el).data('selected', item);
					}
				}
			}
		},

		keyDown: function (event, extra) {
			var obj 	= this;
			var options = obj.options;
			var key 	= event.keyCode || extra.keyCode;
			// numeric 
			if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) != -1) {
				if (!options.keyboard) return;
				var cancel = false;
				var val = parseFloat($(obj.el).val().replace(options.moneyRE, '')) || 0;
				var inc = 1;
				if (event.ctrlKey || event.metaKey) inc = 10;
				switch (key) {
					case 38: // up
						$(obj.el).val((val + inc <= options.max || options.max === null ? val + inc : options.max)).change();
						cancel = true;
						break;
					case 40: // down
						$(obj.el).val((val - inc >= options.min || options.min === null ? val - inc : options.min)).change();
						cancel = true;
						break;
				}
				if (cancel) {
					event.preventDefault();
					setTimeout(function () { 
						// set cursor to the end
						obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length); 
					}, 0);
				}
			}
			// date
			if (this.type == 'date') {
				if (!options.keyboard) return;
				var cancel  = false;
				var daymil  = 24*60*60*1000;
				var inc		= 1;
				if (event.ctrlKey || event.metaKey) inc = 10; 
				var dt = w2utils.isDate($(this.el).val(), options.format, true);
				if (!dt) { dt = new Date(); daymil = 0; }
				switch (key) {
					case 38: // up
						var newDT = w2utils.formatDate(dt.getTime() + daymil, options.format);
						if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format);
						$(obj.el).val(newDT).change();
						cancel = true;
						break;
					case 40: // down
						var newDT = w2utils.formatDate(dt.getTime() - daymil, options.format);
						if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()-1, dt.getDate()), options.format);
						$(obj.el).val(newDT).change();
						cancel = true;
						break;
				}
				if (cancel) {
					event.preventDefault();
					setTimeout(function () { 
						// set cursor to the end
						obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length); 
						obj.updateOverlay();
					}, 0);
				}
			}
			// time
			if (this.type == 'time') {
				if (!options.keyboard) return;
				var cancel  = false;
				var inc		= 1;
				if (event.ctrlKey || event.metaKey) inc = 60; 
				var val = $(this.el).val();
				var time = this.toMin(val) || this.toMin((new Date()).getHours() + ':' + ((new Date()).getMinutes() - 1));
				switch (key) {
					case 38: // up
						time += inc;
						cancel = true;
						break;
					case 40: // down
						time -= inc;
						cancel = true;
						break;
				}
				if (cancel) {
					$(obj.el).val(this.fromMin(time)).change();
					event.preventDefault();
					setTimeout(function () { 
						// set cursor to the end
						obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length); 
					}, 0);
				}
			}
			// color
			if (this.type == 'color') {
				if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) {
					var obj = this;
					$(this).prop('maxlength', 7);
					setTimeout(function () {
						var val = $(obj).val();
						if (val.substr(0, 1) == '#') val = val.substr(1);
						if (!w2utils.isHex(val)) val = '';
						$(obj).val(val).prop('maxlength', 6).change();
					}, 20);
				}
			}
			// list/select/combo
			if (['list', 'combo', 'enum'].indexOf(this.type) != -1) {
				var cancel		= false;
				var selected	= $(this.el).data('selected');
				// apply arrows
				switch (key) {
					case 13: // enter
						var item = options.items[options.index];
						if (['enum'].indexOf(this.type) != -1) {
							if (item) {
								// trigger event
								var eventData = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: item });
								if (eventData.isCancelled === true) return;
								// default behavior
								if (selected.length >= options.max && options.max > 0) selected.pop();
								delete item.hidden;
								selected.push(item);
								$(this.el).change();
								$(this.helpers['multi']).find('input').val('');
								this.refresh();
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							}
						} else {
							if (item) $(this.el).data('selected', item).val(item.text).change();
							if ($(this.el).val() == '' && $(this.el).data('selected')) $(this.el).removeData('selected').val('').change();
						}
						break;
					case 8: // delete
						if (['enum'].indexOf(this.type) != -1) {
							if ($(this.helpers['multi']).find('input').val() == '' && selected.length > 0) {
								var item = selected[selected.length - 1];
								// trigger event
								var eventData = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item });
								if (eventData.isCancelled === true) return;
								// default behavior
								selected.pop();
								$(this.el).trigger('change');
								this.refresh();
								// event after
								obj.trigger($.extend(eventData, { phase: 'after' }));
							}
						}
						break;
					case 38: // up
						options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0;
						options.index--;
						while (options.index > 0 && options.items[options.index].hidden) options.index--;
						if (options.index == 0 && options.items[options.index].hidden) {
							while (options.items[options.index] && options.items[options.index].hidden) options.index++;
						}
						cancel = true;
						break;
					case 40: // down
						options.index = w2utils.isInt(options.index) ? parseInt(options.index) : -1;
						options.index++;
						while (options.index < options.items.length-1 && options.items[options.index].hidden) options.index++;
						if (options.index == options.items.length-1 && options.items[options.index].hidden) {
							while (options.items[options.index] && options.items[options.index].hidden) options.index--;
						}
						cancel = true;
						break;
				}
				if (cancel) {
					if (options.index < 0) options.index = 0;
					if (options.index >= options.items.length) options.index = options.items.length -1;
					this.updateOverlay();
					// cancel event
					event.preventDefault();
					setTimeout(function () { 
						// set cursor to the end
						if (['enum'].indexOf(obj.type) != -1) {
							var tmp = obj.helpers['multi'].find('input').get(0);
							tmp.setSelectionRange(tmp.value.length, tmp.value.length); 
						} else {
							obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length); 
						}
					}, 0);
					return;
				}
				// expand input
				if (['enum'].indexOf(this.type) != -1) {
					var input  = this.helpers['multi'].find('input');
					var search = input.val();
					input.width(((search.length + 2) * 6) + 'px');
				}
				// run search
				setTimeout(function () {
					obj.request();
					// default behaviour
					if (options.showAll !== true) obj.search();
				}, 1);
			}
		},

		keyUp: function (event) {
			if (this.type == 'color') {
				if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) $(this).prop('maxlength', 6);
			}
		},

		request: function (interval) {
			var obj 	 = this;
			var options  = this.options;			
			var search 	 = $(obj.el).val() || '';
			if (typeof interval == 'undefined') interval = 350;
			if (typeof obj.tmp.xhr_total == 'undefined') obj.tmp.xhr_total = -1;
			if (typeof obj.tmp.xhr_len == 'undefined') obj.tmp.xhr_len = -1;
			if (typeof obj.tmp.xhr_match == 'undefined') obj.tmp.xhr_match = -1;
			// timeout
			clearTimeout(obj.tmp.timeout);
			obj.tmp.timeout = setTimeout(function () {
				if (options.url && (
						(options.items.length === 0 && obj.tmp.xhr_total !== 0) ||
						(search.length > obj.tmp.xhr_len && obj.tmp.xhr_total > options.cacheMax) ||
						(search.length < obj.tmp.xhr_match && search.length != obj.tmp.xhr_len)
					)
				) {
					// trigger event
					var eventData = obj.trigger({ phase: 'before', type: 'request', target: obj.el, search: search });
					if (eventData.isCancelled === true) return;
					// default behavior
					obj.tmp.xhr_loading = true;
					if (options.showAll !== true) obj.search();
					if (obj.tmp.xhr) obj.tmp.xhr.abort();
					obj.tmp.xhr = $.ajax({
							type : 'GET',
							url	 : options.url,
							data : { 
								search	: search, 
								max 	: options.cacheMax
							}
						})
						.done(function (data, status, xhr) {
							// trigger event
							var eventData2 = obj.trigger({ phase: 'before', type: 'load', target: obj.el, search: search, data: data, xhr: xhr });
							if (eventData2.isCancelled === true) return;
							// default behavior
							if (data.status != 'success') {
								console.log('ERROR: server did not return proper structure. It should return', { status: 'success', items: [{ id: 1, text: 'item' }] });
								return;
							}
							obj.tmp.xhr_total	= 0;
							obj.tmp.xhr_len 	= search.length;
							obj.tmp.xhr_loading = false;
							if (data.items.length < options.cacheMax) {
								obj.tmp.xhr_match = search.length;
								obj.tmp.xhr_search = $(obj.el).val();
							} else {
								data.items.push({ id: 'more', text: '...' });
							}
							obj.tmp.xhr_total = data.items.length;
							// items 
							options.items = data.items;
							if (options.showAll !== true) obj.search();
							// event after
							obj.trigger($.extend(eventData2, { phase: 'after' }));
						});
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
				}
			}, interval);
		},

		search: function () {
			var obj 	= this;
			var options = this.options;
			var search 	= $(obj.el).val();
			var target	= obj.el;
			var ids = [];
			if (['enum'].indexOf(obj.type) != -1) {
				target = $(obj.helpers['multi']).find('input');
				search = target.val();
				for (var s in options.selected) { ids.push(options.selected[s].id); }
			}
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'search', target: target, search: search });
			if (eventData.isCancelled === true) return;
			if (obj.tmp.xhr_loading !== true) {
				for (var i in options.items) {
					var item = options.items[i];
					var prefix = '';
					var suffix = '';
					if (['is', 'begins with'].indexOf(options.match) != -1) prefix = '^';
					if (['is', 'ends with'].indexOf(options.match) != -1) suffix = '$';
					try { 
						var re = new RegExp(prefix + search + suffix, 'i');
						if (re.test(item.text) || item.text == '...') item.hidden = false; else item.hidden = true; 
					} catch (e) {}
					// do not show selected items
					if (obj.type == 'enum' && $.inArray(item.id, ids) != -1) item.hidden = true;
				}
				options.index = 0;
				while (options.items[options.index] && options.items[options.index].hidden) options.index++;
				obj.updateOverlay();
				setTimeout(function () { if (options.markSearch) $('#w2ui-overlay').w2marker(search); }, 1);
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
		},

		updateOverlay: function () {
			var obj 	= this;
			var options = this.options;
			// date
			if (this.type == 'date') {
				var month, year;
				var dt = w2utils.isDate($(this.el).val(), this.options.format, true);
				if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear(); }
				(function refreshCalendar(month, year) {
					$('#w2ui-overlay > div > div').html(obj.getMonthHTML(month, year));
					$('#w2ui-overlay .w2ui-date').on('mousedown', function () {
						var day = $(this).attr('date');
						$(obj.el).val(day).change().blur();
						$('#w2ui-overlay').remove();
					});
					$('#w2ui-overlay .previous').on('mousedown', function () {
						var tmp = obj.options.current.split('/');
						tmp[0]  = parseInt(tmp[0]) - 1;
						refreshCalendar(tmp[0], tmp[1]);
					});
					$('#w2ui-overlay .next').on('mousedown', function () {
						var tmp = obj.options.current.split('/');
						tmp[0]  = parseInt(tmp[0]) + 1;
						refreshCalendar(tmp[0], tmp[1]);
					});
				})(month, year);
			}
			// date
			if (this.type == 'time') {
				var h24 = (this.options.format == 'h24' ? true : false);
				$('#w2ui-overlay > div').html(obj.getHourHTML());
				$('#w2ui-overlay .w2ui-time').on('mousedown', function () {
					var hour = $(this).attr('hour');
					$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change();
					$('#w2ui-overlay > div').html(obj.getMinHTML(hour));
					var fun = $('#w2ui-overlay'+ name).data('fixSize');
					if (typeof fun == 'function') fun();
					if (typeof fun == 'function') fun()
					$('#w2ui-overlay .w2ui-time').on('mousedown', function () {
						var min = $(this).attr('min');
						$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).change().blur();
						$('#w2ui-overlay').remove();
					});
				});
			}
			// list
			if (['list', 'combo', 'enum'].indexOf(this.type) != -1) {
				var el		= this.el;
				var input	= this.el;
				if (this.type == 'enum') {
					el		= $(this.helpers['multi']);
					input	= $(el).find('input'); 
				}
				if ($(input).is(':focus')) $(el).w2menu('refresh', options);
				// display new selected item
				var el  = $('#w2ui-overlay > div');
				var cur = el.find('tr[index='+ options.index +']');
				el.find('tr.w2ui-selected').removeClass('w2ui-selected');
				cur.addClass('w2ui-selected');
				if (cur.length > 0 ) {
					var top  	= cur[0].offsetTop - 5; // 5 is margin top
					var scrTop 	= el.scrollTop();
					var height 	= el.height();
					if (top < scrTop || top + cur.height() > scrTop + height) {
						$('#w2ui-overlay > div').animate({ 'scrollTop': top - (height - cur.height() * 2) / 2 }, 250, 'linear');
					}
				}
			}
		},

		inRange: function (str) {
			var inRange = false;
			if (this.type == 'date') {
				var dt = w2utils.isDate(str, this.options.format, true);
				if (dt) {
					// enable range 
					if (this.options.start || this.options.end) {
						var st = (typeof this.options.start == 'string' ? this.options.start : $(this.options.start).val());
						var en = (typeof this.options.end == 'string' ? this.options.end : $(this.options.end).val());
						var start	= w2utils.isDate(st, this.options.format, true);
						var end		= w2utils.isDate(en, this.options.format, true);
						var current	= new Date(dt);
						if (!start) start = current;
						if (!end) end = current;
						if (current >= start && current <= end) inRange = true;
					} else {
						inRange = true;
					}
					// block predefined dates
					if (this.options.blocked && $.inArray(str, this.options.blocked) != -1) inRange = false;
				} 
			}
			if (this.type == 'time') {
				if (this.options.start || this.options.end) {
					var tm  = this.toMin(str);
					var tm1 = this.toMin(this.options.start);
					var tm2 = this.toMin(this.options.end);
					if (!tm1) tm1 = tm;
					if (!tm2) tm2 = tm;
					if (tm >= tm1 && tm <= tm2) inRange = true;
				} else {
					inRange = true;
				}
			}
			return inRange;
		},

		/*
		*  INTERNAL FUNCTIONS
		*/

		checkType: function (ch, loose) {
			var obj = this;
			switch (obj.type) {
				case 'int':
					if (loose && ['-'].indexOf(ch) != -1) return true;
					return w2utils.isInt(ch.replace(obj.options.numberRE, ''));
				case 'percent':
					ch = ch.replace(/%/g, '');
				case 'float':
					if (loose && ['-','.'].indexOf(ch) != -1) return true;
					return w2utils.isFloat(ch.replace(obj.options.numberRE, ''));
				case 'money':
				case 'currency':
					if (loose && ['-', '.', obj.options.groupSymbol, obj.options.currencyPrefix, obj.options.currencySuffix].indexOf(ch) != -1) return true;
					return w2utils.isFloat(ch.replace(obj.options.moneyRE, ''));
				case 'hex':
				case 'color':
					return w2utils.isHex(ch);
				case 'alphanumeric': 
					return w2utils.isAlphaNumeric(ch);
			}
			return true;
		},

		addPrefix: function () {
			var obj = this;
			setTimeout(function () {
				var helper;
				var tmp = $(obj.el).data('tmp') || {};
				tmp['old-padding-left'] = $(obj.el).css('padding-left');
				$(obj.el).data('tmp', tmp);
				if (obj.options.prefix !== '') {
					$(obj.el).before(
						'<div class="w2ui-field-helper">'+ 
							obj.options.prefix +
						'</div>'
					);
					helper = $(obj.el).prev();
					helper.css({
							'color'				: $(obj.el).css('color'),
							'font-family'		: $(obj.el).css('font-family'),
							'font-size'			: $(obj.el).css('font-size'),
							'padding-top'		: $(obj.el).css('padding-top'),
							'padding-bottom'	: $(obj.el).css('padding-bottom'),
							'padding-left'		: $(obj.el).css('padding-left'),
							'padding-right'		: 0,
							'margin-top'		: (parseInt($(obj.el).css('margin-top'), 10) + 1) + 'px',
							'margin-bottom'		: (parseInt($(obj.el).css('margin-bottom'), 10) + 1) + 'px',
							'margin-left'		: $(obj.el).css('margin-left'),
							'margin-right'		: 0
						})
						.on('click', function () {
							$(obj).next().focus(); 
						});
					$(obj.el).css('padding-left', (helper.width() + parseInt($(obj.el).css('padding-left'), 10)) + 'px');
					// remember helper
					obj.helpers['prefix'] = helper;
				}
			}, 1);
		},

		addSuffix: function () {
			var obj = this;
			var helper, pr;
			setTimeout(function () {
				var tmp = $(obj.el).data('tmp') || {};
				tmp['old-padding-right'] = $(obj.el).css('padding-right');
				$(obj.el).data('tmp', tmp);
				pr = parseInt($(obj.el).css('padding-right'), 10);
				if (obj.options.arrows) {
					$(obj.el).after(
						'<div class="w2ui-field-helper" style="border: 1px solid transparent">&nbsp;'+ 
						'	<div class="w2ui-field-up" type="up">'+
						'		<div class="arrow-up" type="up"></div>'+
						'	</div>'+
						'	<div class="w2ui-field-down" type="down">'+
						'		<div class="arrow-down" type="down"></div>'+
						'	</div>'+
						'</div>');
					var height = w2utils.getSize(obj.el, 'height');
					helper = $(obj.el).next();
					helper.css({
							'color'			: $(obj.el).css('color'),
							'font-family'	: $(obj.el).css('font-family'),
							'font-size'		: $(obj.el).css('font-size'),
							'height'		: ($(obj.el).height() + parseInt($(obj.el).css('padding-top'), 10) + parseInt($(obj.el).css('padding-bottom'), 10) ) + 'px',
							'padding'		: 0,
							'margin-top'	: (parseInt($(obj.el).css('margin-top'), 10) + 1) + 'px',
							'margin-bottom'	: 0,
							'border-left'	: '1px solid silver'
						})
						.css('margin-left', '-'+ (helper.width() + parseInt($(obj.el).css('margin-right'), 10) + 12) + 'px')
						.on('mousedown', function (event) {
							$('body').on('mouseup', tmp);
							$('body').data('_field_update_timer', setTimeout(update, 700));
							update(false);
							// timer function
							function tmp() {
								clearTimeout($('body').data('_field_update_timer'));
								$('body').off('mouseup', tmp);
							}
							// update function
							function update(notimer) {
								$(obj.el).focus();
								obj.keyDown($.Event("keydown"), { 
									keyCode : ($(event.target).attr('type') == 'up' ? 38 : 40) 
								});
								if (notimer !== false) $('body').data('_field_update_timer', setTimeout(update, 60));
							}
						});
					pr += helper.width() + 12;
					$(obj.el).css('padding-right', pr + 'px');
					// remember helper
					obj.helpers['arrows'] = helper;
				}
				if (obj.options.suffix !== '') {
					$(obj.el).after(
						'<div class="w2ui-field-helper">'+ 
							obj.options.suffix + 
						'</div>');
					helper = $(obj.el).next();
					helper
						.css({
							'color'				: $(obj.el).css('color'),
							'font-family'		: $(obj.el).css('font-family'),
							'font-size'			: $(obj.el).css('font-size'),
							'padding-top'		: $(obj.el).css('padding-top'),
							'padding-bottom'	: $(obj.el).css('padding-bottom'),
							'padding-left'		: '3px',
							'padding-right'		: $(obj.el).css('padding-right'),
							'margin-top'		: (parseInt($(obj.el).css('margin-top'), 10) + 1) + 'px',
							'margin-bottom'		: (parseInt($(obj.el).css('margin-bottom'), 10) + 1) + 'px'
						})
						.on('click', function () { 
							$(obj).prev().focus(); 
						});
					helper.css('margin-left', '-'+ (w2utils.getSize(helper, 'width') + parseInt($(obj.el).css('margin-right'), 10) + 2) + 'px');
					pr += helper.width() + 3;
					$(obj.el).css('padding-right', pr + 'px');
					// remember helper
					obj.helpers['suffix'] = helper;
				}
			}, 1);	
		},

		addMulti: function () {
			var obj		 = this;
			var options	 = this.options;
			// clean up & init
			$(obj.helpers['multi']).remove();
			// build helper
			var html   = '';
			var margin = 
				'margin-top		: 0px; ' +
				'margin-bottom	: 0px; ' +
				'margin-left	: ' + $(obj.el).css('margin-left') + '; ' +
				'margin-right	: ' + $(obj.el).css('margin-right') + '; '+				
				'width			: ' + (w2utils.getSize(obj.el, 'width') 
									- parseInt($(obj.el).css('margin-left'), 10) 
									- parseInt($(obj.el).css('margin-right'), 10)) 
									+ 'px;';
			if (obj.type == 'enum') {
				html = 	'<div class="w2ui-field-helper w2ui-list" style="'+ margin + '; box-sizing: border-box;">'+
					   	'	<div style="padding: 0px; margin: 0px; margin-right: 20px; display: inline-block">'+
					   	'	<ul>'+
						'		<li style="padding-left: 0px; padding-right: 0px" class="nomouse">'+
						'			<input type="text" '+ ($(obj.el).attr('readonly') ? 'readonly': '') + '>'+
						'		</li>'
						'	</ul>'+
						'	</div>'+
						'</div>';
			} 
			if (obj.type == 'file') {
				html = 	'<div class="w2ui-field-helper w2ui-list" style="'+ margin + '; box-sizing: border-box;">'+
					   	'	<div style="padding: 0px; margin: 0px; margin-right: 20px; display: inline-block">'+
					   	'	<ul><li style="padding-left: 0px; padding-right: 0px" class="nomouse"></li></ul>'+
						'	<input class="file-input" type="file" name="attachment" multiple style="display: none">' 
						'	</div>'+
						'</div>';				
			}
			$(obj.el)
				.before(html)
				.css({
					'background-color'	: 'transparent',
					'border-color'		: 'transparent'
				});

			var div	= $(obj.el).prev();
			obj.helpers['multi'] = div;	
			if (obj.type == 'enum') {
				$(obj.el).attr('tabindex', -1);
				// INPUT events
				div.find('input')
					.on('click', function (event) {
						if ($('#w2ui-overlay').length == 0) obj.focus(event);
					})
					.on('focus', function (event) {
						$(div).css({ 'outline': 'auto 5px -webkit-focus-ring-color', 'outline-offset': '-2px' });
						obj.focus(event);
						if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					})
					.on('blur', function (event) {
						$(div).css('outline', 'none');
						obj.blur(event);
						if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					})
					.on('keyup', 	function (event) { obj.keyUp(event) })				
					.on('keydown', 	function (event) { obj.keyDown(event) })				
					.on('keypress', function (event) { div.find('.w2ui-enum-placeholder').remove(); obj.keyPress(event); });
				// MAIN div
				div.on('click', function (event) { $(this).find('input').focus(); });
			}
			if (obj.type == 'file') {
				$(obj.el).css('outline', 'none');
				div.on('click', function (event) {
						obj.blur(event);
						div.find('input').click();
					})
					.on('dragenter', function (event) {
						$(div).addClass('w2ui-file-dragover');
					})
					.on('dragleave', function (event) {
						var tmp = $(event.target).parents('.w2ui-field-helper');
						if (tmp.length == 0) $(div).removeClass('w2ui-file-dragover');
					})
					.on('drop', function (event) {
						$(div).removeClass('w2ui-file-dragover');
						var files = event.originalEvent.dataTransfer.files;
						for (var i=0, l=files.length; i<l; i++) obj.addFile.call(obj, files[i]);
						// cancel to stop browser behaviour
						event.preventDefault();
						event.stopPropagation();
					})
					.on('dragover', function (event) { 
						// cancel to stop browser behaviour
						event.preventDefault();
						event.stopPropagation();
					});
				div.find('input')
					.on('click', function (event) { event.stopPropagation(); })
					.on('change', function () {
						if (typeof this.files !== "undefined") {
							for (var i = 0, l = this.files.length; i < l; i++) {
								obj.addFile.call(obj, this.files[i]);
							}
						}
					});
			}
			obj.refresh();
		},

		addFile: function (file) {
			var obj		 = this;
			var options	 = this.options;
			var selected = $(obj.el).data('selected');
			var newItem  = {
				name		: file.name,
				type		: file.type,
				modified	: file.lastModifiedDate,
				size		: file.size,
				content		: null
			};
			var size = 0;
			var cnt  = 0;
			var err;
			for (var s in selected) { size += selected[s].size; cnt++; }
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'add', target: obj.el, file: newItem, total: cnt, totalSize: size });
			if (eventData.isCancelled === true) return;
			// check params
			if (options.maxFileSize !== 0 && newItem.size > options.maxFileSize) {
				err = 'Maximum file size is '+ w2utils.size(options.maxFileSize);
				if (options.silent === false) $(obj.el).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (options.maxSize !== 0 && size + newItem.size > options.maxSize) {
				err = 'Maximum total size is '+ w2utils.size(options.maxSize);
				if (options.silent === false) $(obj.el).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (options.max !== 0 && cnt >= options.max) {
				err = 'Maximum number of files is '+ options.max;
				if (options.silent === false) $(obj.el).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			selected.push(newItem);
			// read file as base64
			if (typeof FileReader !== "undefined") {
				var reader = new FileReader();
				// need a closure
				reader.onload = (function () {
					return function (event) {
						var fl  = event.target.result;
						var ind = fl.indexOf(',');
						newItem.content = fl.substr(ind+1);
						obj.refresh();
						$(obj.el).trigger('change');
						// event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
					};
				})();
				reader.readAsDataURL(file);
			} else {
				obj.refresh();
				$(obj.el).trigger('change');
			}
		},

		getColorHTML: function () {
			var html =  '<div class="w2ui-color">'+ 
						'<table cellspacing="5">';
			var colors	= [
				['000000', '444444', '666666', '999999', 'CCCCCC', 'EEEEEE', 'F3F3F3', 'FFFFFF'],
				['FF011B', 'FF9838', 'FFFD59', '01FD55', '00FFFE', '0424F3', '9B24F4', 'FF21F5'],
				['F4CCCC', 'FCE5CD', 'FFF2CC', 'D9EAD3', 'D0E0E3', 'CFE2F3', 'D9D1E9', 'EAD1DC'],
				['EA9899', 'F9CB9C', 'FEE599', 'B6D7A8', 'A2C4C9', '9FC5E8', 'B4A7D6', 'D5A6BD'],
				['E06666', 'F6B26B', 'FED966', '93C47D', '76A5AF', '6FA8DC', '8E7CC3', 'C27BA0'],
				['CC0814', 'E69138', 'F1C232', '6AA84F', '45818E', '3D85C6', '674EA7', 'A54D79'],
				['99050C', 'B45F17', 'BF901F', '37761D', '124F5C', '0A5394', '351C75', '741B47'],
				['660205', '783F0B', '7F6011', '274E12', '0C343D', '063762', '20124D', '4C1030']
			];
			for (var i=0; i<8; i++) {
				html += '<tr>';
				for (var j=0; j<8; j++) {
					html += '<td>'+
							'	<div class="color" style="background-color: #'+ colors[i][j] +';" name="'+ colors[i][j] +'">'+
							'		'+ ($(this.el).val() == colors[i][j] ? '&#149;' : '&nbsp;')+
							'	</div>'+
							'</td>';
				}
				html += '</tr>';
				if (i < 2) html += '<tr><td style="height: 8px" colspan="8"></td></tr>';
			}
			html += '</table></div>';
			return html;
		},

		getMonthHTML: function (month, year) {
			var td 			= new Date();
			var months		= w2utils.settings.fullmonths;
			var days		= w2utils.settings.fulldays;
			var daysCount	= ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
			var today		= td.getFullYear() + '/' + (Number(td.getMonth()) + 1) + '/' + td.getDate();
			// normalize date
			year  = w2utils.isInt(year)  ? parseInt(year)  : td.getFullYear();
			month = w2utils.isInt(month) ? parseInt(month) : td.getMonth() + 1;
			if (month > 12) { month -= 12; year++; }
			if (month < 1 || month === 0)  { month += 12; year--; }
			if (year/4 == Math.floor(year/4)) { daysCount[1] = '29'; } else { daysCount[1] = '28'; }
			this.options.current = month + '/' + year;
			
			// start with the required date
			td = new Date(year, month-1, 1);
			var weekDay = td.getDay();
			var tabDays = w2utils.settings.shortdays;
			var dayTitle = '';
			for ( var i = 0, len = tabDays.length; i < len; i++) {
				dayTitle += '<td>' + tabDays[i] + '</td>';
			}
			var html  = 
				'<div class="w2ui-calendar-title title">'+
				'	<div class="w2ui-calendar-previous previous"> <div></div> </div>'+
				'	<div class="w2ui-calendar-next next"> <div></div> </div> '+ 
						months[month-1] +', '+ year + 
				'</div>'+
				'<table class="w2ui-calendar-days" cellspacing="0">'+
				'	<tr class="w2ui-day-title">' + dayTitle + '</tr>'+
				'	<tr>';
					
			var day = 1;
			for (var ci=1; ci<43; ci++) {
				if (weekDay === 0 && ci == 1) {
					for (var ti=0; ti<6; ti++) html += '<td class="w2ui-day-empty">&nbsp;</td>';
					ci += 6;
				} else {
					if (ci < weekDay || day > daysCount[month-1]) {
						html += '<td class="w2ui-day-empty">&nbsp;</td>';
						if ((ci) % 7 === 0) html += '</tr><tr>';
						continue;
					}
				}
				var dt  = year + '/' + month + '/' + day;
				
				var className = ''; 
				if (ci % 7 == 6)  className = ' w2ui-saturday';
				if (ci % 7 === 0) className = ' w2ui-sunday';
				if (dt == today)  className += ' w2ui-today';
				
				var dspDay	 = day;
				var col		 = '';
				var bgcol	 = '';
				var tmp_dt	 = w2utils.formatDate(dt, this.options.format);
				if (this.options.colored && this.options.colored[tmp_dt] !== undefined) { // if there is predefined colors for dates
					tmp		= this.options.colored[tmp_dt].split(':');
					bgcol	= 'background-color: ' + tmp[0] + ';';
					col		= 'color: ' + tmp[1] + ';';
				}
				html += '<td class="'+ (this.inRange(tmp_dt) ? 'w2ui-date ' : 'w2ui-blocked') + className + '" style="'+ col + bgcol + '" date="'+ tmp_dt +'">'+
							dspDay + 
						'</td>';
				if (ci % 7 === 0 || (weekDay === 0 && ci == 1)) html += '</tr><tr>';
				day++;
			}
			html += '</tr></table>';
			return html;
		},

		getHourHTML: function () {
			var tmp = [];
			var h24 = (this.options.format == 'h24' ? true : false);
			for (var a=0; a<24; a++) {				
				var time = (a >= 12 && !h24 ? a - 12 : a) + ':00' + (!h24 ? (a < 12 ? ' am' : ' pm') : '');
				if (a == 12 && !h24) time = '12:00 pm';
				if (!tmp[Math.floor(a/8)]) tmp[Math.floor(a/8)] = '';
				var tm1 = this.fromMin(this.toMin(time));
				var tm2 = this.fromMin(this.toMin(time) + 59);
				tmp[Math.floor(a/8)] += '<div class="'+ (this.inRange(tm1) || this.inRange(tm2) ? 'w2ui-time ' : 'w2ui-blocked') + '" hour="'+ a +'">'+ time +'</div>';
			}
			var html = 
				'<div class="w2ui-calendar-time"><table><tr>'+
				'	<td>'+ tmp[0] +'</td>' +
				'	<td>'+ tmp[1] +'</td>' +
				'	<td>'+ tmp[2] +'</td>' +
				'</tr></table></div>';
			return html;
		},

		getMinHTML: function (hour) {
			if (typeof hour == 'undefined') hour = 0;
			var h24 = (this.options.format == 'h24' ? true : false);
			var tmp = [];
			for (var a=0; a<60; a+=5) {				
				var time = (hour > 12 && !h24 ? hour - 12 : hour) + ':' + (a < 10 ? 0 : '') + a + ' ' + (!h24 ? (hour < 12 ? 'am' : 'pm') : '');
				var ind = a < 20 ? 0 : (a < 40 ? 1 : 2);
				if (!tmp[ind]) tmp[ind] = '';
				tmp[ind] += '<div class="'+ (this.inRange(time) ? 'w2ui-time ' : 'w2ui-blocked') + '" min="'+ a +'">'+ time +'</div>';
			}
			var html = 
				'<div class="w2ui-calendar-time"><table><tr>'+
				'	<td>'+ tmp[0] +'</td>' +
				'	<td>'+ tmp[1] +'</td>' +
				'	<td>'+ tmp[2] +'</td>' +
				'</tr></table></div>';
			return html;
		},

		toMin: function (str) {
			if (typeof str != 'string') return null;
			var tmp = str.split(':');
			if (tmp.length == 2) {
				tmp[0] = parseInt(tmp[0]);
				tmp[1] = parseInt(tmp[1]);
				if (str.indexOf('pm') != -1 && tmp[0] != 12) tmp[0] += 12;
			} else {				
				return null;
			}
			return tmp[0] * 60 + tmp[1];
		},

		fromMin: function (time) {
			var ret = '';
			if (time >= 24 * 60) time = time % (24 * 60);
			if (time < 0) time = 24 * 60 + time;
			var hour = Math.floor(time/60);
			var min  = ((time % 60) < 10 ? '0' : '') + (time % 60);
			if (this.options.format.indexOf('h24') != -1) {
				ret = hour + ':' + min;
			} else {
				ret = (hour <= 12 ? hour : hour - 12) + ':' + min + ' ' + (hour >= 12 ? 'pm' : 'am');
			}
			return ret;
		}
	}

	$.extend(w2field.prototype, w2utils.event);
	w2obj.field = w2field;

}) (jQuery);