/* w2ui 1.4.x (nightly) (c) http://w2ui.com, vitmalina@gmail.com */
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
* == NICE TO HAVE ==
*	- date has problems in FF new Date('yyyy-mm-dd') breaks
*	- bug: w2utils.formatDate('2011-31-01', 'yyyy-dd-mm'); - wrong foratter
*	- overlay should be displayed where more space (on top or on bottom)
* 	- write and article how to replace certain framework functions
*	- format date and time is buggy
*	- onComplete should pass widget as context (this)
*
* == 1.4 changes
*	- lock(box, options) || lock(box, msg, spinner)
*
************************************************/

var w2utils = (function () {
	var tmp = {}; // for some temp variables
	var obj = {
		settings : {
			"locale"		: "en-us",
			"date_format"	: "m/d/yyyy",
			"date_display"	: "Mon d, yyyy",
			"time_format"	: "hh:mi pm",
			"currency"		: "^[\$\€\£\¥]?[-]?[0-9]*[\.]?[0-9]+$",
			"currencySymbol": "$",
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
		var months = w2utils.settings.shortmonths;
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

	function formatNumber (val) {
		var ret = '';
		// check if this is a number
		if (w2utils.isFloat(val) || w2utils.isInt(val) || w2utils.isMoney(val)) {
			ret = String(val).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
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
		var tmp = String(dateStr).split('-');
		if (tmp.length == 3) dt = new Date(tmp[0], Number(tmp[1])-1, tmp[2]); // yyyy-mm-dd
		var tmp = String(dateStr).split('/');
		if (tmp.length == 3) dt = new Date(tmp[2], Number(tmp[0])-1, tmp[1]); // mm/dd/yyyy
		if (dt == 'Invalid Date') return '';

		var year 	= dt.getFullYear();
		var month 	= dt.getMonth();
		var date 	= dt.getDate();
		return format.toLowerCase()
			.replace('month', w2utils.settings.fullmonths[month])
			.replace('mon', w2utils.settings.shortmonths[month])
			.replace(/yyyy/g, year)
			.replace(/yyy/g, year)
			.replace(/yy/g, String(year).substr(2))
			.replace(/(^|[^a-z$])y/g, '$1'+year) 			// only y's that are not preceeded by a letter
			.replace(/mm/g, (month + 1 < 10 ? '0' : '') + (month + 1))
			.replace(/dd/g, (date < 10 ? '0' : '') + date)
			.replace(/(^|[^a-z$])m/g, '$1'+ (month + 1)) 	// only y's that are not preceeded by a letter
			.replace(/(^|[^a-z$])d/g, '$1' + date); 		// only y's that are not preceeded by a letter
	}


	function formatTime (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
		var months = w2utils.settings.shortmonths;
		var fullMonths = w2utils.settings.fullmonths;
		if (typeof format == 'undefined') format = this.settings.time_format;
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
		if (!$.isPlainObject(options)) 		options = {};
		if (!$.isPlainObject(options.css)) 	options.css = {};
		if (this.length == 0 || html == '' || typeof html == 'undefined') { hide(); return $(this);	}
		if ($('#w2ui-overlay').length > 0) $(document).click();
		$('body').append('<div id="w2ui-overlay" class="w2ui-reset w2ui-overlay '+ 
							($(this).parents('.w2ui-popup').length > 0 ? 'w2ui-overlay-popup' : '') +'">'+
						'	<div></div>'+
						'</div>');

		// init
		var obj = this;
		var div = $('#w2ui-overlay div');
		div.css(options.css).html(html);
		if (typeof options['class'] != 'undefined') div.addClass(options['class']);
		if (typeof options.top == 'undefined') options.top = 0;
		if (typeof options.left == 'undefined') options.left = 0;
		if (typeof options.width == 'undefined') options.width = 100;
		if (typeof options.height == 'undefined') options.height = 0;

		// pickup bg color of first div
		var bc  = div.css('background-color'); 
		div = $('#w2ui-overlay');
		if (typeof bc != 'undefined' &&	bc != 'rgba(0, 0, 0, 0)' && bc != 'transparent') div.css('background-color', bc);

		div.css({
				display 	 : 'none',
				left 		 : ($(obj).offset().left + options.left) + 'px',
				top 		 : ($(obj).offset().top + w2utils.getSize($(obj), 'height') + 3 + options.top) + 'px',
				'min-width'  : (options.width ? options.width : 'auto'),
				'min-height' : (options.height ? options.height : 'auto')
			})
			.fadeIn('fast')
			.data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight))
			.on('click', function (event) { 
				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
			});

		// click anywhere else hides the drop down
		function hide () {
			var result;
			if (typeof options.onHide == 'function') result = options.onHide();
			if (result === false) return;
			$('#w2ui-overlay').remove();
			$(document).off('click', hide);
		}

		// need time to display
		setTimeout(fixSize, 0);
		return $(this);

		function fixSize () {
			$(document).on('click', hide);
			// if goes over the screen, limit height and width
			if ( $('#w2ui-overlay > div').length > 0) {
				var h = $('#w2ui-overlay > div').height();
				var w = $('#w2ui-overlay> div').width();
				// $(window).height() - has a problem in FF20
				var max = window.innerHeight - $('#w2ui-overlay > div').offset().top - 7;
				if (h > max) $('#w2ui-overlay> div').height(max).width(w + w2utils.scrollBarSize()).css({ 'overflow-y': 'auto' });
				// check width
				w = $('#w2ui-overlay> div').width();
				max = window.innerWidth - $('#w2ui-overlay > div').offset().left - 7;
				if (w > max) $('#w2ui-overlay> div').width(max).css({ 'overflow-x': 'auto' });
				// onShow event
				if (typeof options.onShow == 'function') options.onShow();
			}
		}
	};

	$.fn.w2menu = function (menu, options) {
		if (typeof options.select == 'undefined' && typeof options.onSelect == 'function') options.select = options.onSelect;
		if (typeof options.select != 'function') {
			console.log('ERROR: options.select is required to be a function, not '+ typeof options.select + ' in $().w2menu(menu, options)');
			return $(this);
		}
		if (!$.isArray(menu)) {
			console.log('ERROR: first parameter should be an array of objects or strings in $().w2menu(menu, options)');
			return $(this);
		}
		// since only one overlay can exist at a time
		$.fn.w2menuHandler = function (event, index) {
			options.select(menu[index], event, index); 
		};
		return $(this).w2overlay(getMenuHTML(), options);

		function getMenuHTML () { 
			var menu_html = '<table cellspacing="0" cellpadding="0" class="w2ui-drop-menu">';
			for (var f = 0; f < menu.length; f++) { 
				var mitem = menu[f];
				if (typeof mitem == 'string') {
					var tmp = mitem.split('|');
					// 1 - id, 2 - text, 3 - image, 4 - icon
					mitem = { id: tmp[0], text: tmp[0], img: null, icon: null };
					if (tmp[1]) mitem.text = tmp[1];
					if (tmp[2]) mitem.img  = tmp[2];
					if (tmp[3]) mitem.icon = tmp[3];
				} else {
					if (typeof mitem.text != 'undefined' && typeof mitem.id == 'undefined') mitem.id = mitem.text;
					if (typeof mitem.text == 'undefined' && typeof mitem.id != 'undefined') mitem.text = mitem.id;
					if (typeof mitem.caption != 'undefined') mitem.text = mitem.caption;
					if (typeof mitem.img == 'undefined') mitem.img = null;
					if (typeof mitem.icon == 'undefined') mitem.icon = null;
				}
				var img = '<td>&nbsp;</td>';
				if (mitem.img)  img = '<td><div class="w2ui-tb-image w2ui-icon '+ mitem.img +'"></div></td>';
				if (mitem.icon) img = '<td align="center"><div class="w2ui-tb-image"><span class="'+ mitem.icon +'"></span></div></td>';
				menu_html += 
					'<tr onmouseover="$(this).addClass(\'w2ui-selected\');" onmouseout="$(this).removeClass(\'w2ui-selected\');" '+
					'		onclick="$(document).click(); $.fn.w2menuHandler(event, \''+ f +'\');">'+
						img +
					'	<td>'+ mitem.text +'</td>'+
					'</tr>';
			}
			menu_html += "</table>";
			return menu_html;
		}	
	}
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2grid 		- grid widget
*		- $().w2grid	- jQuery wrapper
*	- Dependencies: jQuery, w2utils, w2toolbar, w2fields, w2alert, w2confirm
*
* == NICE TO HAVE ==
*	- global search apply types and drop downs
*	- editable fields (list) - better inline editing
*	- frozen columns
*	- column autosize based on largest content
*	- save grid state into localStorage and restore
*	- easy bubbles in the grid
*	- possibly add context menu similar to sidebar's
*	- Merged cells
*	- More than 2 layers of header groups
*	- for search fields one should be able to pass w2field options
*	- add enum to advanced search fields
*	- be able to attach events in advanced search dialog
* 	- reorder columns/records
*	- hidden searches could not be clearned by the user
*	- search-logic -> searchLogic
*	- allow to define different recid (possibly)
*
* == 1.4 changes
* 	- added refreshRow(recid) - should it be part of refresh?
* 	- added refreshCell(recid, field) - should it be part of refresh?
*	- deleted getSelection().removeAllRanges() - see https://github.com/vitmalina/w2ui/issues/323
*
************************************************************************/

(function () {
	var w2grid = function(options) {

		// public properties
		this.name				= null;
		this.box				= null; 	// HTML element that hold this element
		this.header				= '';
		this.url				= '';
		this.columns			= []; 		// { field, caption, size, attr, render, hidden, gridMinWidth, [editable: {type, inTag, outTag, style, items}] }
		this.columnGroups		= [];		// { span: int, caption: 'string', master: true/false }
		this.records			= [];		// { recid: int(requied), field1: 'value1', ... fieldN: 'valueN', style: 'string', editable: true/false, summary: true/false, changed: true/false, changes: object }
		this.summary			= [];		// arry of summary records, same structure as records array
		this.searches			= [];		// { type, caption, field, inTag, outTag, default, items, hidden }
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
			toolbarEdit 	: false,
			toolbarDelete 	: false,
			toolbarSave		: false,
			selectionBorder : true,
			recordTitles	: true
		};

		this.autoLoad		= true; 	// for infinite scroll
		this.fixedBody		= true;		// if false; then grid grows with data
		this.recordHeight	= 24;
		this.keyboard 		= true;
		this.selectType		= 'row'; 	// can be row|cell
		this.multiSearch	= true;
		this.multiSelect	= true;
		this.multiSort		= true;
		this.draggableCols	= false;
		this.markSearchResults	= true;

		this.total			= 0;		// server total
		this.buffered		= 0;		// number of records in the records array
		this.limit			= 100;
		this.offset			= 0;		// how many records to skip (for infinite scroll) when pulling from server
		this.style			= '';
		this.ranges 		= [];

		// events
		this.onAdd				= null;
		this.onEdit				= null;
		this.onRequest			= null;		// called on any server event
		this.onLoad				= null;
		this.onDelete			= null;
		this.onDeleted			= null;
		this.onSave 			= null;
		this.onSaved			= null;
		this.onSelect			= null;
		this.onUnselect 		= null;
		this.onClick 			= null;
		this.onDblClick 		= null;
		this.onColumnClick		= null;
		this.onColumnResize		= null;
		this.onSort 			= null;
		this.onSearch 			= null;
		this.onChange 			= null;		// called when editable record is changed
		this.onExpand 			= null;
		this.onCollapse			= null;
		this.onError 			= null;
		this.onKeydown			= null;
		this.onToolbar			= null; 	// all events from toolbar
		this.onColumnOnOff		= null;
		this.onCopy				= null;
		this.onPaste			= null;
		this.onSelectionExtend  = null;
		this.onEditField		= null;
		this.onRender 			= null;
		this.onRefresh 			= null;
		this.onReload			= null;
		this.onResize 			= null;
		this.onDestroy 			= null;

		// internal
		this.last = {
			field		: 'all',
			caption		: w2utils.lang('All Fields'),
			logic		: 'OR',
			search		: '',
			searchIds 	: [],
			selection 	: {
				recids 	: [],
				columns	: {},
				clean	: function () {
					console.log('selection clean')
				}
			},
			multi		: false,
			scrollTop	: 0,
			scrollLeft	: 0,
			sortData	: null,
			sortCount	: 0,
			xhr			: null,
			range_start : null,
			range_end   : null,
			sel_ind		: null,
			sel_col		: null,
			sel_type	: null
		};

		this.isIOS = (navigator.userAgent.toLowerCase().indexOf('iphone') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipod') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipad') != -1) ? true : false;

		$.extend(true, this, w2obj.grid, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2grid = function(method) {
		if (typeof method === 'object' || !method ) {
			// check name parameter
			if (!$.fn.w2checkNameParam(method, 'w2grid')) return;
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
			for (var p in columns)		object.columns[p]		= $.extend(true, {}, columns[p]);
			for (var p in columnGroups) object.columnGroups[p] 	= $.extend(true, {}, columnGroups[p]);
			for (var p in searches)   	object.searches[p]   	= $.extend(true, {}, searches[p]);
			for (var p in searchData) 	object.searchData[p] 	= $.extend(true, {}, searchData[p]);
			for (var p in sortData)		object.sortData[p]  	= $.extend(true, {}, sortData[p]);
			object.postData = $.extend(true, {}, postData);

			// check if there are records without recid
			for (var r in records) {
				if (records[r].recid == null || typeof records[r].recid == 'undefined') {
					console.log('ERROR: Cannot add records without recid. (obj: '+ object.name +')');
					return;
				}
				object.records[r] = $.extend(true, {}, records[r]);
			}
			if (object.records.length > 0) object.buffered = object.records.length;
			// add searches
			for (var c in object.columns) {
				var col = object.columns[c];
				if (typeof col.searchable == 'undefined' || object.getSearch(col.field) != null) continue;
				var stype = col.searchable;
				var attr  = '';
				if (col.searchable === true) { stype = 'text'; attr = 'size="20"'; }
				object.addSearch({ field: col.field, caption: col.caption, type: stype, attr: attr });
			}
			// init toolbar
			object.initToolbar();
			// render if necessary
			if ($(this).length != 0) {
				object.render($(this)[0]);
			}
			// register new object
			w2ui[object.name] = object;
			return object;

		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2grid');
		}
	}

	// ====================================================
	// -- Implementation of core functionality

	w2grid.prototype = {
		// ----
		// properties that need to be in prototype

		msgDelete	: w2utils.lang('Are you sure you want to delete selected records?'),
		msgNotJSON 	: w2utils.lang('Returned data is not in valid JSON format.'),
		msgRefresh	: w2utils.lang('Refreshing...'),

		// for easy button overwrite
		buttons: {
			'reload'	: { type: 'button', id: 'reload', img: 'icon-reload', hint: w2utils.lang('Reload data in the list') },
			'columns'	: { type: 'drop', id: 'column-on-off', img: 'icon-columns', hint: w2utils.lang('Show/hide columns'), arrow: false, html: '' },
			'search'	: { type: 'html',   id: 'search',
							html: '<div class="w2ui-icon icon-search-down w2ui-search-down" title="'+ w2utils.lang('Select Search Field') +'" '+
								  'onclick="var obj = w2ui[$(this).parents(\'div.w2ui-grid\').attr(\'name\')]; obj.searchShowFields(this);"></div>'
						  },
			'search-go'	: { type: 'check',  id: 'search-advanced', caption: w2utils.lang('Search...'), hint: w2utils.lang('Open Search Fields') },
			'add'		: { type: 'button', id: 'add', caption: w2utils.lang('Add New'), hint: w2utils.lang('Add new record'), img: 'icon-add' },
			'edit'		: { type: 'button', id: 'edit', caption: w2utils.lang('Edit'), hint: w2utils.lang('Edit selected record'), img: 'icon-edit', disabled: true },
			'delete'	: { type: 'button', id: 'delete', caption: w2utils.lang('Delete'), hint: w2utils.lang('Delete selected records'), img: 'icon-delete', disabled: true },
			'save'		: { type: 'button', id: 'save', caption: w2utils.lang('Save'), hint: w2utils.lang('Save changed records'), img: 'icon-save' }
		},

		add: function (record) {
			if (!$.isArray(record)) record = [record];
			var added = 0;
			for (var o in record) {
				if (record[o].recid == null || typeof record[o].recid == 'undefined') {
					console.log('ERROR: Cannot add record without recid. (obj: '+ this.name +')');
					continue;
				}
				this.records.push(record[o]);
				added++;
			}
			this.buffered = this.records.length;
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				this.localSort();
				this.localSearch();
			}
			this.refresh(); // ??  should it be reload?
			return added;
		},

		find: function (obj, returnIndex) {
			if (typeof obj == 'undefined' || obj == null) obj = {};
			var recs	= [];
			var hasDots	= false;
			// check if property is nested - needed for speed
			for (var o in obj) if (String(o).indexOf('.') != -1) hasDots = true;
			// look for an item
			for (var i=0; i<this.records.length; i++) {
				var match = true;
				for (var o in obj) {
					var val = this.records[i][o];
					if (hasDots && String(o).indexOf('.') != -1) val = this.parseField(this.records[i], o);
					if (obj[o] != val) match = false;
				}
				if (match && returnIndex !== true) recs.push(this.records[i]);
				if (match && returnIndex === true) recs.push(i);
			}
			return recs;
		},

		set: function (recid, record, noRefresh) { // does not delete existing, but overrides on top of it
			if (typeof recid == 'object') {
				noRefresh 	= record;
				record 		= recid;
				recid  		= null;
			}
			// update all records
			if (recid == null) {
				for (var r in this.records) {
					$.extend(true, this.records[r], record); // recid is the whole record
				}
				if (noRefresh !== true) this.refresh();
			} else { // find record to update
				var ind = this.get(recid, true);
				if (ind == null) return false;
				$.extend(true, this.records[ind], record);				
				if (noRefresh !== true) this.refreshRow(recid); // refresh only that record
			}
			return true;
		},

		get: function (recid, returnIndex) {
			for (var i=0; i<this.records.length; i++) {
				if (this.records[i].recid == recid) {
					if (returnIndex === true) return i; else return this.records[i];
				}
			}
			return null;
		},

		remove: function () {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.records.length-1; r >= 0; r--) {
					if (this.records[r].recid == arguments[a]) { this.records.splice(r, 1); removed++; }
				}
			}
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				this.buffered = this.records.length;
				this.localSort();
				this.localSearch();
			}
			this.refresh();
			return removed;
		},

		addColumn: function (before, columns) {
			var added = 0;
			if (arguments.length == 1) {
				columns = before;
				before  = this.columns.length;
			} else {
				if (typeof before == 'string') before = this.getColumn(before, true);
				if (before === null) before = this.columns.length;
			}
			if (!$.isArray(columns)) columns = [columns];
			for (var o in columns) {
				this.columns.splice(before, 0, columns[o]);
				before++;
				added++;
			}
			this.initColumnOnOff();
			this.refresh();
			return added;
		},

		removeColumn: function () {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.columns.length-1; r >= 0; r--) {
					if (this.columns[r].field == arguments[a]) { this.columns.splice(r, 1); removed++; }
				}
			}
			this.initColumnOnOff();
			this.refresh();
			return removed;
		},

		getColumn: function (field, returnIndex) {
			for (var i=0; i<this.columns.length; i++) {
				if (this.columns[i].field == field) {
					if (returnIndex === true) return i; else return this.columns[i];
				}
			}
			return null;
		},

		toggleColumn: function () {
			var effected = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.columns.length-1; r >= 0; r--) {
					if (this.columns[r].field == arguments[a]) {
						this.columns[r].hidden = !this.columns[r].hidden;
						effected++;
					}
				}
			}
			this.refresh();
			return effected;
		},

		showColumn: function () {
			var shown = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.columns.length-1; r >= 0; r--) {
					if (this.columns[r].field == arguments[a] && this.columns[r].hidden !== false) {
						this.columns[r].hidden = false;
						shown++;
					}
				}
			}
			this.refresh();
			return shown;
		},

		hideColumn: function () {
			var hidden = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.columns.length-1; r >= 0; r--) {
					if (this.columns[r].field == arguments[a] && this.columns[r].hidden !== true) {
						this.columns[r].hidden = true;
						hidden++;
					}
				}
			}
			this.refresh();
			return hidden;
		},

		addSearch: function (before, search) {
			var added = 0;
			if (arguments.length == 1) {
				search = before;
				before = this.searches.length;
			} else {
				if (typeof before == 'string') before = this.getSearch(before, true);
				if (before === null) before = this.searches.length;
			}
			if (!$.isArray(search)) search = [search];
			for (var o in search) {
				this.searches.splice(before, 0, search[o]);
				before++;
				added++;
			}
			this.searchClose();
			return added;
		},

		removeSearch: function () {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.searches.length-1; r >= 0; r--) {
					if (this.searches[r].field == arguments[a]) { this.searches.splice(r, 1); removed++; }
				}
			}
			this.searchClose();
			return removed;
		},

		getSearch: function (field, returnIndex) {
			for (var i=0; i<this.searches.length; i++) {
				if (this.searches[i].field == field) {
					if (returnIndex === true) return i; else return this.searches[i];
				}
			}
			return null;
		},

		toggleSearch: function () {
			var effected = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.searches.length-1; r >= 0; r--) {
					if (this.searches[r].field == arguments[a]) {
						this.searches[r].hidden = !this.searches[r].hidden;
						effected++;
					}
				}
			}
			this.searchClose();
			return effected;
		},

		showSearch: function () {
			var shown = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.searches.length-1; r >= 0; r--) {
					if (this.searches[r].field == arguments[a] && this.searches[r].hidden !== false) {
						this.searches[r].hidden = false;
						shown++;
					}
				}
			}
			this.searchClose();
			return shown;
		},

		hideSearch: function () {
			var hidden = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.searches.length-1; r >= 0; r--) {
					if (this.searches[r].field == arguments[a] && this.searches[r].hidden !== true) {
						this.searches[r].hidden = true;
						hidden++;
					}
				}
			}
			this.searchClose();
			return hidden;
		},

		getSearchData: function (field) {
			for (var s in this.searchData) {
				if (this.searchData[s].field == field) return this.searchData[s];
			}
			return null;
		},

		localSort: function (silent) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				console.log('ERROR: grid.localSort can only be used on local data source, grid.url should be empty.');
				return;
			}
			if ($.isEmptyObject(this.sortData)) return;
			var time = (new Date()).getTime();
			var obj = this;
			this.records.sort(function (a, b) {
				var ret = 0;
				for (var s in obj.sortData) {
					var aa = a[obj.sortData[s].field];
					var bb = b[obj.sortData[s].field];
					if (String(obj.sortData[s].field).indexOf('.') != -1) {
						aa = obj.parseField(a, obj.sortData[s].field);
						bb = obj.parseField(b, obj.sortData[s].field);
					}
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
			time = (new Date()).getTime() - time;
			if (silent !== true) setTimeout(function () { obj.status('Sorting took ' + time/1000 + ' sec'); }, 10);
			return time;
		},

		localSearch: function (silent) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				console.log('ERROR: grid.localSearch can only be used on local data source, grid.url should be empty.');
				return;
			}
			var time = (new Date()).getTime();
			var obj = this;
			this.total = this.records.length;
			// mark all records as shown
			this.last.searchIds = [];
			// hide records that did not match
			if (this.searchData.length > 0 && !url) {
				this.total = 0;
				for (var r in this.records) {
					var rec = this.records[r];
					var fl  = 0;
					for (var s in this.searchData) {
						var sdata  	= this.searchData[s];
						var search 	= this.getSearch(sdata.field);
						if (sdata  == null) continue;
						if (search == null) search = { field: sdata.field, type: sdata.type };
						var val1 = String(obj.parseField(rec, search.field)).toLowerCase();
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
								if (search.type == 'date') {
									var tmp = new Date(Number(val1)); // create date
									val1 = (new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate())).getTime(); // drop time
									val2 = Number(val2);
									var val3 = Number(val1) + 86400000; // 1 day
									if (val2 >= val1 && val2 <= val3) fl++;
								}
								break;
							case 'between':
								if (search.type == 'int' && parseInt(rec[search.field]) >= parseInt(val2) && parseInt(rec[search.field]) <= parseInt(val3)) fl++;
								if (search.type == 'float' && parseFloat(rec[search.field]) >= parseFloat(val2) && parseFloat(rec[search.field]) <= parseFloat(val3)) fl++;
								if (search.type == 'date') {
									var tmp = new Date(Number(val3)); // create date
									val3 = (new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate())).getTime(); // drop time
									var val3 = Number(val3) + 86400000; // 1 day
									if (val1 >= val2 && val1 < val3) fl++;
								}
								break;
							case 'in':
								if (sdata.value.indexOf(val1) !== -1) fl++;
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
					if ((this.last.logic == 'OR' && fl != 0) || (this.last.logic == 'AND' && fl == this.searchData.length)) this.last.searchIds.push(parseInt(r));
				}
				this.total = this.last.searchIds.length;
			}
			this.buffered = this.total;
			time = (new Date()).getTime() - time;
			if (silent !== true) setTimeout(function () { obj.status('Search took ' + time/1000 + ' sec'); }, 10);
			return time;
		},

		getRangeData: function (range, extra) {
			var rec1 = this.get(range[0].recid, true);
			var rec2 = this.get(range[1].recid, true);
			var col1 = range[0].column;
			var col2 = range[1].column;

			var res = [];
			if (col1 == col2) { // one row
				for (var r = rec1; r <= rec2; r++) {
					var record = this.records[r];
					var dt = record[this.columns[col1].field] || null;
					if (extra !== true) {
						res.push(dt);
					} else {
						res.push({ data: dt, column: col1, index: r, record: record });
					}
				}
			} else if (rec1 == rec2) { // one line
				var record = this.records[rec1];
				for (var i = col1; i <= col2; i++) {
					var dt = record[this.columns[i].field] || null;
					if (extra !== true) {
						res.push(dt);
					} else {
						res.push({ data: dt, column: i, index: rec1, record: record });
					}
				}
			} else {
				for (var r = rec1; r <= rec2; r++) {
					var record = this.records[r];
					res.push([]);
					for (var i = col1; i <= col2; i++) {
						var dt = record[this.columns[i].field];
						if (extra !== true) {
							res[res.length-1].push(dt);
						} else {
							res[res.length-1].push({ data: dt, column: i, index: r, record: record });
						}
					}
				}
			}
			return res;
		},

		addRange: function (ranges) {
			var added = 0;
			if (this.selectType == 'row') return added;
			if (!$.isArray(ranges)) ranges = [ranges];
			// if it is selection
			for (var r in ranges) {
				if (typeof ranges[r] != 'object') ranges[r] = { name: 'selection' };
				if (ranges[r].name == 'selection') {
					if (this.show.selectionBorder === false) continue;
					var sel = this.getSelection();
					if (sel.length == 0) {
						this.removeRange(ranges[r].name);
						continue;
					} else {
						var first = sel[0];
						var last  = sel[sel.length-1];
						var td1   = $('#grid_'+ this.name +'_rec_'+ first.recid + ' td[col='+ first.column +']');
						var td2   = $('#grid_'+ this.name +'_rec_'+ last.recid + ' td[col='+ last.column +']');
					}
				} else { // other range
					var first = ranges[r].range[0];
					var last  = ranges[r].range[1];
					var td1   = $('#grid_'+ this.name +'_rec_'+ first.recid + ' td[col='+ first.column +']');
					var td2   = $('#grid_'+ this.name +'_rec_'+ last.recid + ' td[col='+ last.column +']');
				}
				if (first) {
					var rg = {
						name: ranges[r].name,
						range: [{ recid: first.recid, column: first.column }, { recid: last.recid, column: last.column }],
						style: ranges[r].style || ''
					};
					// add range
					var ind = false;
					for (var t in this.ranges) if (this.ranges[t].name == ranges[r].name) { ind = r; break; }
					if (ind !== false) {
						this.ranges[ind] = rg;
					} else {
						this.ranges.push(rg);
					}
					added++
				}
			}
			this.refreshRanges();
			return added;
		},

		removeRange: function () {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				var name = arguments[a];
				$('#grid_'+ this.name +'_'+ name).remove();
				for (var r = this.ranges.length-1; r >= 0; r--) {
					if (this.ranges[r].name == name) {
						this.ranges.splice(r, 1);
						removed++;
					}
				}
			}
			return removed;
		},

		refreshRanges: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			var rec  = $('#grid_'+ this.name +'_records');
			for (var r in this.ranges) {
				var rg    = this.ranges[r];
				var first = rg.range[0];
				var last  = rg.range[1];
				var td1   = $('#grid_'+ this.name +'_rec_'+ first.recid + ' td[col='+ first.column +']');
				var td2   = $('#grid_'+ this.name +'_rec_'+ last.recid + ' td[col='+ last.column +']');
				if ($('#grid_'+ this.name +'_'+ rg.name).length == 0) {
					rec.append('<div id="grid_'+ this.name +'_' + rg.name +'" class="w2ui-selection" style="'+ rg.style +'">'+
									(rg.name == 'selection' ?  '<div id="grid_'+ this.name +'_resizer" class="w2ui-selection-resizer"></div>' : '')+
								'</div>');
				} else {
					$('#grid_'+ this.name +'_'+ rg.name).attr('style', rg.style);
				}
				if (td1.length > 0 && td2.length > 0) {
					$('#grid_'+ this.name +'_'+ rg.name).css({
						left 	: (td1.position().left - 1 + rec.scrollLeft()) + 'px',
						top 	: (td1.position().top - 1 + rec.scrollTop()) + 'px',
						width 	: (td2.position().left - td1.position().left + td2.width() + 3) + 'px',
						height 	: (td2.position().top - td1.position().top + td2.height() + 3) + 'px'
					});
				}
			}

			// add resizer events
			$(this.box).find('#grid_'+ this.name +'_resizer').off('mousedown').on('mousedown', mouseStart);
			//$(this.box).find('#grid_'+ this.name +'_resizer').off('selectstart').on('selectstart', function () { return false; }); // fixes chrome cursror bug

			var eventData = { phase: 'before', type: 'selectionExtend', target: obj.name, originalRange: null, newRange: null };

			function mouseStart (event) {
				var sel = obj.getSelection();
				obj.last.move = {
					type 	: 'expand',
					x		: event.screenX,
					y		: event.screenY,
					divX 	: 0,
					divY 	: 0,
					recid	: sel[0].recid,
					column	: sel[0].column,
					originalRange 	: [{ recid: sel[0].recid, column: sel[0].column }, { recid: sel[sel.length-1].recid, column: sel[sel.length-1].column }],
					newRange 		: [{ recid: sel[0].recid, column: sel[0].column }, { recid: sel[sel.length-1].recid, column: sel[sel.length-1].column }]
				};
				$(document).off('mousemove', mouseMove).on('mousemove', mouseMove);
				$(document).off('mouseup', mouseStop).on('mouseup', mouseStop);
			}

			function mouseMove (event) {
				var mv = obj.last.move;
				if (!mv || mv.type != 'expand') return;
				mv.divX = (event.screenX - mv.x);
				mv.divY = (event.screenY - mv.y);
				// find new cell
				var recid, column;
				var tmp = event.originalEvent.target;
				if (tmp.tagName != 'TD') tmp = $(tmp).parents('td')[0];
				if (typeof $(tmp).attr('col') != 'undefined') column = parseInt($(tmp).attr('col'));
				tmp = $(tmp).parents('tr')[0];
				recid = $(tmp).attr('recid');
				// new range
				if (mv.newRange[1].recid == recid && mv.newRange[1].column == column) return;
				var prevNewRange = $.extend({}, mv.newRange);
				mv.newRange = [{ recid: mv.recid, column: mv.column }, { recid: recid, column: column }];
				// event before
				eventData = obj.trigger($.extend(eventData, { originalRange: mv.originalRange, newRange : mv.newRange }));
				if (eventData.isCancelled === true) {
					mv.newRange 		= prevNewRange;
					eventData.newRange 	= prevNewRange;
					return;
				} else {
					// default behavior
					obj.removeRange('grid-selection-expand');
					obj.addRange({
						name	: 'grid-selection-expand',
						range	: eventData.newRange,
						style	: 'background-color: rgba(100,100,100,0.1); border: 2px dotted rgba(100,100,100,0.5);'
					});
				}
			}

			function mouseStop (event) {
				// default behavior
				obj.removeRange('grid-selection-expand');
				delete obj.last.move;
				$(document).off('mousemove', mouseMove);
				$(document).off('mouseup', mouseStop);
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}

			return (new Date()).getTime() - time;
		},

		select: function () {
			var selected = 0;
			var sel	= this.last.selection;
			for (var a = 0; a < arguments.length; a++) {
				var recid	= typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
				var record	= this.get(recid);
				if (record == null) continue;
				var index	= this.get(recid, true);
				var recEl 	= $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
				if (this.selectType == 'row') {
					if (sel.recids.indexOf(recid) >= 0) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: recid });
					if (eventData.isCancelled === true) continue;
					// default action
					sel.recids.push(recid);
					recEl.addClass('w2ui-selected').data('selected', 'yes');
					recEl.find('.w2ui-grid-select-check').prop("checked", true);
					selected++;
				} else {
					var col  = arguments[a].column;
					if (!w2utils.isInt(col)) { // select all columns
						var cols = [];
						for (var c in this.columns) { if (this.columns[c].hidden) continue; cols.push({ recid: recid, column: parseInt(c) }); }
						return this.select.apply(this, cols);
					}
					var s = sel.columns[recid] || [];
					if ($.isArray(s) && s.indexOf(col) != -1) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: recid, column: col });
					if (eventData.isCancelled === true) continue;
					// default action
					if (sel.recids.indexOf(recid) == -1) {
						sel.recids.push(recid);
						sel.recids.sort(function(a, b) { return a-b });
					}
					s.push(col);
					s.sort(function(a, b) { return a-b }); // sort function must be for numerical sort
					recEl.find(' > td[col='+ col +']').addClass('w2ui-selected');
					selected++;
					recEl.data('selected', 'yes');
					recEl.find('.w2ui-grid-select-check').prop("checked", true);
					// save back to selection object
					sel.columns[recid] = s;
				}
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
			// all selected?
			if (this.last.selection.recids.length == this.records.length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop('checked', false);
			}
			this.status();
			this.addRange('selection');
			return selected;
		},

		unselect: function () {
			var unselected = 0;
			var sel = this.last.selection;
			for (var a = 0; a < arguments.length; a++) {
				var recid	= typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
				var record	= this.get(recid);
				if (record == null) continue;
				var index	= this.get(record.recid, true);
				var recEl 	= $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
				if (this.selectType == 'row') {
					if (sel.recids.indexOf(recid) == -1) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: recid });
					if (eventData.isCancelled === true) continue;
					// default action
					sel.recids.splice(sel.recids.indexOf(recid), 1);
					recEl.removeClass('w2ui-selected').removeData('selected');
					if (recEl.length != 0) recEl[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + recEl.attr('custom_style');
					recEl.find('.w2ui-grid-select-check').prop("checked", false);
					unselected++;
				} else {
					var col  = arguments[a].column;
					if (!w2utils.isInt(col)) { // unselect all columns
						var cols = [];
						for (var c in this.columns) { if (this.columns[c].hidden) continue; cols.push({ recid: recid, column: parseInt(c) }); }
						return this.unselect.apply(this, cols);
					}
					var s = sel.columns[recid];
					if (!$.isArray(s) || s.indexOf(col) == -1) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: recid, column: col });
					if (eventData.isCancelled === true) continue;
					// default action
					s.splice(s.indexOf(col), 1);
					$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid) + ' > td[col='+ col +']').removeClass('w2ui-selected');
					unselected++;
					if (s.length == 0) {
						delete sel.columns[recid];
						sel.recids.splice(sel.recids.indexOf(recid), 1);
						recEl.removeData('selected');
						recEl.find('.w2ui-grid-select-check').prop("checked", false);
					}
				}
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
			// all selected?
			if (sel.recids.length == this.records.length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop('checked', false);
			}
			// show number of selected
			this.status();
			this.addRange('selection');
			return unselected;
		},

		selectAll: function () {
			if (this.multiSelect === false) return;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, all: true });
			if (eventData.isCancelled === true) return;
			// default action
			var url	 = (typeof this.url != 'object' ? this.url : this.url.get);
			var sel  = this.last.selection;
			var cols = [];
			for (var c in this.columns) cols.push(parseInt(c));
			// if local data source and searched	
			if (!url && this.searchData.length !== 0) {
				// local search applied
				for (var i=0; i<this.last.searchIds.length; i++) {
					sel.recids.push(this.records[r].recid);
					if (this.selectType != 'row') sel.columns[this.records[r].recid] = cols.slice(); // .slice makes copy of the array
				}
			} else {
				sel.recids = [];
				for (var r in this.records) {
					sel.recids.push(this.records[r].recid);
					if (this.selectType != 'row') sel.columns[this.records[r].recid] = cols.slice(); // .slice makes copy of the array
				}
			}
			this.refresh();
			// enable/disable toolbar buttons
			var sel = this.getSelection();
			if (sel.length == 1) this.toolbar.enable('edit'); else this.toolbar.disable('edit');
			if (sel.length >= 1) this.toolbar.enable('delete'); else this.toolbar.disable('delete');
			this.addRange('selection');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		selectNone: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, all: true });
			if (eventData.isCancelled === true) return;
			// default action
			var sel = this.last.selection;
			for (var s in sel.recids) {
				var recid = sel.recids[s];
				var recEl = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
				recEl.removeClass('w2ui-selected').removeData('selected');
				recEl.find('.w2ui-grid-select-check').prop("checked", false);
				// for not rows
				if (this.selectType != 'row') {
					var cols = sel.columns[recid];
					for (var c in cols) recEl.find(' > td[col='+ cols[c] +']').removeClass('w2ui-selected');
				}				
			}
			sel.recids 	= [];
			sel.columns = {};
			this.toolbar.disable('edit', 'delete');
			this.removeRange('selection');
			$('#grid_'+ this.name +'_check_all').prop('checked', false);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getSelection: function (returnIndex) {
			var ret = [];
			var sel = this.last.selection;
			//sel.clean();
			if (this.selectType == 'row') {
				for (var s in sel.recids) {
					if (returnIndex !== true) ret.push(sel.recids[s]); else ret.push(this.get(sel.recids[s], true));
				}
				return ret;
			} else {
				for (var s in sel.recids) {
					var cols = sel.columns[sel.recids[s]];
					for (var c in cols) {
						ret.push({ recid: sel.recids[s], index: this.get(sel.recids[s], true), column: cols[c] });
					}
				}
				return ret;
			}
		},

		search: function (field, value) {
			var obj 		= this;
			var url 		= (typeof this.url != 'object' ? this.url : this.url.get);
			var searchData 	= [];
			var last_multi 	= this.last.multi;
			var last_logic 	= this.last.logic;
			var last_field 	= this.last.field;
			var last_search = this.last.search;
			// 1: search() - advanced search (reads from popup)
			if (arguments.length == 0) {
				last_search = '';
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
						} else if (operator == 'in') {
							$.extend(tmp, { value: value1.split(',') });
						} else {
							$.extend(tmp, { value: value1 });
						}
						// conver date to unix time
						try {
							if (search.type == 'date' && operator == 'between') {
								tmp.value[0] = w2utils.isDate(value1, w2utils.settings.date_format, true).getTime();
								tmp.value[1] = w2utils.isDate(value2, w2utils.settings.date_format, true).getTime();
							}
							if (search.type == 'date' && operator == 'is') {
								tmp.value = w2utils.isDate(value1, w2utils.settings.date_format, true).getTime();
							}
						} catch (e) {

						}
						searchData.push(tmp);
					}
				}
				if (searchData.length > 0 && !url) {
					last_multi	= true;
					last_logic  = 'AND';
				} else {
					last_multi = true;
					last_logic = 'AND';
				}
			}
			// 2: search(field, value) - regular search
			if (typeof field == 'string') {
				last_field 	= field;
				last_search = value;
				last_multi	= false;
				last_logic	= 'OR';
				// loop through all searches and see if it applies
				if (typeof value != 'undefined') {
					if (field.toLowerCase() == 'all') {
						// if there are search fields loop thru them
						if (this.searches.length > 0) {
							for (var s in this.searches) {
								var search = this.searches[s];
								if (search.type == 'text' || (search.type == 'int' && w2utils.isInt(value)) || (search.type == 'float' && w2utils.isFloat(value))
										|| (search.type == 'money' && w2utils.isMoney(value)) || (search.type == 'hex' && w2utils.isHex(value))
										|| (search.type == 'date' && w2utils.isDate(value)) || (search.type == 'alphaNumeric' && w2utils.isAlphaNumeric(value)) ) {
									var tmp = {
										field	 : search.field,
										type	 : search.type,
										operator : (search.type == 'text' ? 'contains' : 'is'),
										value	 : value
									};
									searchData.push(tmp);
								}
								// range in global search box
								if (search.type == 'int' && String(value).indexOf('-') != -1) {
									var t = String(value).split('-');
									var tmp = {
										field	 : search.field,
										type	 : search.type,
										operator : 'between',
										value	 : [t[0], t[1]]
									};
									searchData.push(tmp);
								}
							}
						} else {
							// no search fields, loop thru columns
							for (var c in this.columns) {
								var tmp = {
									field	 : this.columns[c].field,
									type	 : 'text',
									operator : 'contains',
									value	 : value
								};
								searchData.push(tmp);
							}
						}
					} else {
						var search = this.getSearch(field);
						if (search == null) search = { field: field, type: 'text' };
						if (search.field == field) this.last.caption = search.caption;
						if (value != '') {
							var op  = 'contains';
							var val = value;
							if (w2utils.isInt(value)) {
								op  = 'is';
								val = value;
							}
							if (search.type == 'int' && value != '') {
								if (String(value).indexOf('-') != -1) {
									var tmp = value.split('-');
									if (tmp.length == 2) {
										op = 'between';
										val = [parseInt(tmp[0]), parseInt(tmp[1])];
									}
								}
								if (String(value).indexOf(',') != -1) {
									var tmp = value.split(',');
									op = 'in';
									val = [];
									for (var t in tmp) val.push(tmp[t]);
								}
							}
							var tmp = {
								field	 : search.field,
								type	 : search.type,
								operator : op,
								value	 : val
							}
							searchData.push(tmp);
						}
					}
				}
			}
			// 3: search([ { field, value, [operator,] [type] }, { field, value, [operator,] [type] } ], logic) - submit whole structure
			if ($.isArray(field)) {
				var logic = 'AND';
				if (typeof value == 'string') {
					logic = value.toUpperCase();
					if (logic != 'OR' && logic != 'AND') logic = 'AND';
				}
				last_search = '';
				last_multi	= true;
				last_logic	= logic;
				for (var f in field) {
					var data   	= field[f];
					var search 	= this.getSearch(data.field);
					if (search == null) search = { type: 'text', operator: 'contains' };
					// merge current field and search if any
					searchData.push($.extend(true, {}, search, data));
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: searchData,
					searchField: (field ? field : 'multi'), searchValue: (value ? value : 'multi') });
			if (eventData.isCancelled === true) return;
			// default action
			this.searchData	 = eventData.searchData;
			this.last.field  = last_field;
			this.last.search = last_search;
			this.last.multi  = last_multi;
			this.last.logic  = last_logic;
			this.last.scrollTop			= 0;
			this.last.scrollLeft		= 0;
			this.last.selection.recids	= [];
			// -- clear all search field
			this.searchClose();
			this.set({ expanded: false });
			// apply search
			if (url) {
				this.last.xhr_offset = 0;
				this.reload();
			} else {
				// local search
				this.localSearch();
				this.refresh();
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		searchOpen: function () {
			if (!this.box) return;
			if (this.searches.length == 0) return;
			var obj = this;
			// show search
			$('#tb_'+ this.name +'_toolbar_item_search-advanced').w2overlay(
				this.getSearchesHTML(),
				{
					left: -10,
					'class': 'w2ui-grid-searches',
					onShow: function () {
						if (obj.last.logic == 'OR') obj.searchData = [];
						obj.initSearches();
						$('#w2ui-overlay .w2ui-grid-searches').data('grid-name', obj.name);
						var sfields = $('#w2ui-overlay .w2ui-grid-searches *[rel=search]');
						if (sfields.length > 0) sfields[0].focus();
					}
				}
			);
		},

		searchClose: function () {
			if (!this.box) return;
			if (this.searches.length == 0) return;
			if (this.toolbar) this.toolbar.uncheck('search-advanced')
			// hide search
			if ($('#w2ui-overlay .w2ui-grid-searches').length > 0) $().w2overlay();
		},

		searchShowFields: function (el) {
			if (typeof el == 'undefined') el = $('#grid_'+ this.name +'_search_all');
			var html = '<div class="w2ui-select-field"><table>';
			for (var s = -1; s < this.searches.length; s++) {
				var search = this.searches[s];
				if (s == -1) {
					if (!this.multiSearch) continue;
					search = {
						type 	: 'text',
						field 	: 'all',
						caption : w2utils.lang('All Fields')
					}
				} else {
					if (this.searches[s].hidden === true) continue;
				}
				html += '<tr '+
					'	'+ (this.isIOS ? 'onTouchStart' : 'onClick') +'="var obj = w2ui[\''+ this.name +'\']; '+
					'		if (\''+ search.type +'\' == \'list\' || \''+ search.type +'\' == \'enum\') {'+
					'			obj.last.search = \'\';'+
					'			obj.last.item = \'\';'+
					'			$(\'#grid_'+ this.name +'_search_all\').val(\'\')'+
					'		}'+
					'		if (obj.last.search != \'\') { '+
					'			obj.search(\''+ search.field +'\', obj.last.search); '+
					'		} else { '+
					'			obj.last.field = \''+ search.field +'\'; '+
					'			obj.last.caption = \''+ search.caption +'\'; '+
					'		}'+
					'		$(\'#grid_'+ this.name +'_search_all\').attr(\'placeholder\', \''+ search.caption +'\');'+
					'		$().w2overlay();">'+
					'<td><input type="checkbox" tabIndex="-1" '+ (search.field == this.last.field ? 'checked' : 'disabled') +'></td>'+
					'<td>'+ search.caption +'</td>'+
					'</tr>';
			}
			html += "</table></div>";
			$(el).w2overlay(html, { left: -15, top: 7 });
		},

		searchReset: function (noRefresh) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: [] });
			if (eventData.isCancelled === true) return;
			// default action
			this.searchData  	= [];
			this.last.search 	= '';
			this.last.logic		= 'OR';
			if (this.last.multi) {
				if (!this.multiSearch) {
					this.last.field 	= this.searches[0].field;
					this.last.caption 	= this.searches[0].caption;
				} else {
					this.last.field  	= 'all';
					this.last.caption 	= w2utils.lang('All Fields');
				}
			}
			this.last.multi				= false;
			this.last.xhr_offset 		= 0;
			// reset scrolling position
			this.last.scrollTop			= 0;
			this.last.scrollLeft		= 0;
			this.last.selection.recids	= [];
			this.last.selection.columns	= {};
			// -- clear all search field
			this.searchClose();
			// apply search
			if (!noRefresh) this.reload();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		clear: function (noRefresh) {
			this.offset 			= 0;
			this.total 				= 0;
			this.buffered			= 0;
			this.records			= [];
			this.summary			= [];
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.range_start	= null;
			this.last.range_end		= null;
			this.last.xhr_offset	= 0;
			if (!noRefresh) this.refresh();
		},

		reset: function (noRefresh) {
			// reset last remembered state
			this.offset					= 0;
			this.last.scrollTop			= 0;
			this.last.scrollLeft		= 0;
			this.last.selection.recids	= [];
			this.last.selection.columns	= {};
			this.last.range_start		= null;
			this.last.range_end			= null;
			this.last.xhr_offset		= 0;
			this.searchReset(noRefresh);
			// initial sort
			if (this.last.sortData != null ) this.sortData	 = this.last.sortData;
			// select none without refresh
			this.set({ expanded: false }, true);
			// refresh
			if (!noRefresh) this.refresh();
		},

		skip: function (offset) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				this.offset = parseInt(offset);
				if (this.offset < 0 || !w2utils.isInt(this.offset)) this.offset = 0;
				if (this.offset > this.total) this.offset = this.total - this.limit;
				// console.log('last', this.last);
				this.records  = [];
				this.buffered = 0;
				this.last.xhr_offset = 0;
				this.last.pull_more	 = true;
				this.last.scrollTop	 = 0;
				this.last.scrollLeft = 0;
				$('#grid_'+ this.name +'_records').prop('scrollTop',  0);
				this.initColumnOnOff();
				this.reload();
			} else {
				console.log('ERROR: grid.skip() can only be called when you have remote data source.');
			}
		},

		load: function (url, callBack) {
			if (typeof url == 'undefined') {
				console.log('ERROR: You need to provide url argument when calling .load() method of "'+ this.name +'" object.');
				return;
			}
			// default action
			this.request('get-records', {}, url, callBack);
		},

		reload: function (callBack) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				if (this.last.xhr_offset > 0 && this.last.xhr_offset < this.buffered) this.last.xhr_offset = this.buffered;
				this.request('get-records', {}, null, callBack);
			} else {
				this.localSearch();
				this.refresh();
				if (typeof callBack == 'function') callBack();
			}
		},

		request: function (cmd, add_params, url, callBack) {
			if (typeof add_params == 'undefined') add_params = {};
			if (typeof url == 'undefined' || url == '' || url == null) url = this.url;
			if (url == '' || url == null) return;
			// build parameters list
			var params = {};
			if (!w2utils.isInt(this.offset)) this.offset = 0;
			if (!w2utils.isInt(this.last.xhr_offset)) this.last.xhr_offset = 0;
			// add list params
			params['cmd']  	 		= cmd;
			params['name'] 	 		= this.name;
			params['limit']  		= this.limit;
			params['offset'] 		= parseInt(this.offset) + this.last.xhr_offset;
			params['search']  		= this.searchData;
			params['search-logic'] 	= this.last.logic;
			params['sort'] 	  		= (this.sortData.length != 0 ? this.sortData : '');
			// append other params
			$.extend(params, this.postData);
			$.extend(params, add_params);
			// event before
			if (cmd == 'get-records') {
				var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, url: url, postData: params });
				if (eventData.isCancelled === true) { if (typeof callBack == 'function') callBack(); return false; }
			} else {
				var eventData = { url: this.url, postData: params };
			}
			// call server to get data
			var obj = this;
			if (this.last.xhr_offset == 0) {
				this.lock(this.msgRefresh, true);
			} else {
				var more = $('#grid_'+ this.name +'_rec_more');
				if (this.autoLoad === true) {
					more.show().find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>');
				} else {
					more.find('td').html('<div>'+ w2utils.lang('Load') + ' ' + obj.limit + ' ' + w2utils.lang('More') + '...</div>');
				}
			}
			if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {};
			var xhr_type = 'GET';
			var url = (typeof eventData.url != 'object' ? eventData.url : eventData.url.get);
			if (params.cmd == 'save-records') {
				if (typeof eventData.url == 'object') url = eventData.url.save;
				xhr_type = 'PUT';  // so far it is always update
			}
			if (params.cmd == 'delete-records') {
				if (typeof eventData.url == 'object') url = eventData.url.remove;
				xhr_type = 'DELETE';
			}
			if (!w2utils.settings.RESTfull) xhr_type = 'POST';
			this.last.xhr_cmd	 = params.cmd;
			this.last.xhr_start  = (new Date()).getTime();
			this.last.xhr = $.ajax({
				type		: xhr_type,
				url			: url,
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.requestComplete(status, cmd, callBack);
				}
			});
			if (cmd == 'get-records') {
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		requestComplete: function(status, cmd, callBack) {
			var obj = this;
			this.unlock();
			setTimeout(function () { obj.status(w2utils.lang('Server Response') + ' ' + ((new Date()).getTime() - obj.last.xhr_start)/1000 +' ' + w2utils.lang('sec')); }, 10);
			this.last.pull_more 	= false;
			this.last.pull_refresh 	= true;

			// event before
			var event_name = 'load';
			if (this.last.xhr_cmd == 'save-records') event_name   = 'saved';
			if (this.last.xhr_cmd == 'delete-records') event_name = 'deleted';
			var eventData = this.trigger({ phase: 'before', target: this.name, type: event_name, xhr: this.last.xhr, status: status });
			if (eventData.isCancelled === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// parse server response
			var responseText = this.last.xhr.responseText;
			if (status != 'error') {
				// default action
				if (typeof responseText != 'undefined' && responseText != '') {
					var data;
					// check if the onLoad handler has not already parsed the data
					if (typeof responseText == "object") {
						data = responseText;
					} else {
						// $.parseJSON or $.getJSON did not work because it expect perfect JSON data - where everything is in double quotes
						try { eval('data = '+ responseText); } catch (e) { }
					}
					if (typeof data == 'undefined') {
						data = {
							status		 : 'error',
							message		 : this.msgNotJSON,
							responseText : responseText
						}
					}
					if (data['status'] == 'error') {
						obj.error(data['message']);
					} else {
						if (cmd == 'get-records') {
							if (this.last.xhr_offset == 0) {
								this.records = [];
								this.summary = [];
								//data.xhr_status=data.status;
								delete data.status;
								$.extend(true, this, data);
								this.buffered = this.records.length;
							} else {
								var records = data.records;
								delete data.records;
								//data.xhr_status=data.status;
								delete data.status;
								$.extend(true, this, data);
								for (var r in records) {
									this.records.push(records[r]);
								}
								this.buffered = this.records.length;
							}
						}
						if (cmd == 'delete-records') {
							this.reload();
							return;
						}
					}
				}
			} else {
				obj.error('AJAX Error. See console for more details.');
			}
			// event after
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				this.localSort();
				this.localSearch();
			}
			this.total = parseInt(this.total);
			this.trigger($.extend(eventData, { phase: 'after' }));
			// do not refresh if loading on infinite scroll
			if (this.last.xhr_offset == 0) this.refresh(); else this.scroll();
			// call back
			if (typeof callBack == 'function') callBack();
		},

		error: function (msg) {
			var obj = this;
			// let the management of the error outside of the grid
			var eventData = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
			if (eventData.isCancelled === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// need a time out because message might be already up)
			setTimeout(function () { w2alert(msg, 'Error');	}, 1);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getChanges: function () {
			var changes = [];
			var tmp  	= this.find({ changed: true });
			for (var t in tmp) {
				changes.push($.extend(true, { recid: tmp[t].recid }, tmp[t].changes));
			}
			return changes;
		},

		mergeChanges: function () {
			var changed = this.getChanges();
			for (var c in changed) {
				var record = this.get(changed[c].recid);
				for (var s in changed[c]) {
					if (s == 'recid') continue; // do not allow to change recid
					try { eval('record.' + s + ' = changed[c][s]'); } catch (e) {}
					delete record.changed;
					delete record.changes;
				}
			}
			$(this.box).find('.w2ui-editable input').removeClass('changed');
			this.refresh();
		},

		// ===================================================
		// --  Action Handlers

		save: function () {
			var obj = this;
			var changed = this.getChanges();
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'save', changed: changed });
			if (eventData.isCancelled === true) return false;
			var url = (typeof this.url != 'object' ? this.url : this.url.save);
			if (url) {
				this.request('save-records', { 'changed' : eventData.changed }, null,
					function () { // event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
					}
				);
			} else {
				this.mergeChanges();
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		editField: function (recid, column, value, event) {
			//console.log('edit field', recid, column);
			var obj   = this;
			var index = obj.get(recid, true);
			var rec   = obj.records[index];
			var col   = obj.columns[column];
			var edit  = col.editable;
			if (!rec || !col || !edit) return;
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'editField', target: obj.name, recid: recid, column: column, value: value,
				index: index, originalEvent: event });
			if (eventData.isCancelled === true) return;
			value = eventData.value;
			// default behaviour
			this.selectNone();
			this.select({ recid: recid, column: column });
			// create input element
			var tr = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(recid));
			var el = tr.find('[col='+ column +'] > div');
			if (edit.type == 'enum') console.log('ERROR: Grid\'s inline editing does not support enum field type.');
			if (edit.type == 'list' || edit.type == 'select') console.log('ERROR: Grid\'s inline editing does not support list/select field type.');
			if (typeof edit.inTag   == 'undefined') edit.inTag   = '';
			if (typeof edit.outTag  == 'undefined') edit.outTag  = '';
			if (typeof edit.style   == 'undefined') edit.style   = '';
			if (typeof edit.items   == 'undefined') edit.items   = [];
			var val = (rec.changed && rec.changes[col.field] ? w2utils.stripTags(rec.changes[col.field]) : w2utils.stripTags(rec[col.field]));
			if (val == null || typeof val == 'undefined') val = '';
			if (typeof value != 'undefined' && value != null) val = value;
			var addStyle = (typeof col.style != 'undefined' ? col.style + ';' : '');
			if ($.inArray(col.render, ['number', 'int', 'float', 'money', 'percent']) != -1) addStyle += 'text-align: right;';
			el.addClass('w2ui-editable')
				.html('<input id="grid_'+ obj.name +'_edit_'+ recid +'_'+ column +'" value="'+ val +'" type="text"  '+
					'	style="outline: none; '+ addStyle + edit.style +'" field="'+ col.field +'" recid="'+ recid +'" column="'+ column +'" '+ edit.inTag +
					'>' + edit.outTag);
			el.find('input')
				.w2field(edit.type)
				.on('blur', function (event) {
					if (obj.parseField(rec, col.field) != this.value) {
						// change event
						var eventData2 = obj.trigger({ phase: 'before', type: 'change', target: obj.name, input_id: this.id, recid: recid, column: column,
							value_new: this.value, value_previous: (rec.changes ? rec.changes[col.field] : obj.parseField(rec, col.field)),
							value_original: obj.parseField(rec, col.field) });
						if (eventData2.isCancelled === true) {
							// dont save new value
						} else {
							// default action
							rec.changed = true;
							rec.changes = rec.changes || {};
							rec.changes[col.field] = eventData2.value_new;
							// event after
							obj.trigger($.extend(eventData2, { phase: 'after' }));
						}
					} else {
						if (rec.changes) delete rec.changes[col.field];
						if ($.isEmptyObject(rec.changes)) delete rec.changes;
					}
					// refresh record
					$(tr).replaceWith(obj.getRecordHTML(index, tr.attr('line')));
				})
				.on('keydown', function (event) {
					var cancel = false;
					switch (event.keyCode) {
						case 9:  // tab
							cancel = true;
							var next = event.shiftKey ? prevCell(column) : nextCell(column);
							if (next != column) {
								this.blur();
								setTimeout(function () {
									if (obj.selectType != 'row') {
										obj.selectNone();
										obj.select({ recid: recid, column: next });
									} else {
										obj.editField(recid, next, null, event);
									}
								}, 1);
							}
							break;

						case 13: // enter
							cancel = true;
							var next = event.shiftKey ? prevRow(index) : nextRow(index);
							if (next != index) {
								this.blur();
								setTimeout(function () {
									if (obj.selectType != 'row') {
										obj.selectNone();
										obj.select({ recid: obj.records[next].recid, column: column });
									} else {
										obj.editField(obj.records[next].recid, column, null, event);
									}
								}, 1);
							}
							break;

						case 38: // up arrow
							cancel = true;
							var next = prevRow(index);
							if (next != index) {
								this.blur();
								setTimeout(function () {
									if (obj.selectType != 'row') {
										obj.selectNone();
										obj.select({ recid: obj.records[next].recid, column: column });
									} else {
										obj.editField(obj.records[next].recid, column, null, event);
									}
								}, 1);
							}
							break;

						case 40: // down arrow
							cancel = true;
							var next = nextRow(index);
							if (next != index) {
								this.blur();
								setTimeout(function () {
									if (obj.selectType != 'row') {
										obj.selectNone();
										obj.select({ recid: obj.records[next].recid, column: column });
									} else {
										obj.editField(obj.records[next].recid, column, null, event);
									}
								}, 1);
							}
							break;

						case 27: // escape
							var old = (rec.changed && rec.changes[col.field]) ? rec.changes[col.field] : obj.parseField(rec, col.field);
							this.value = typeof old != 'undefined' ? old : '';
							this.blur();
							setTimeout(function () { obj.select({ recid: recid, column: column }) }, 1);
							break;
					}
					if (cancel) if (event.preventDefault) event.preventDefault();
					// -- functions
					function nextCell (check) {
						var newCheck = check + 1;
						if (obj.columns.length == newCheck) return check;
						if (obj.columns[newCheck].hidden) return nextCell(newCheck);
						return newCheck;
					}
					function prevCell (check) {
						var newCheck = check - 1;
						if (newCheck < 0) return check;
						if (obj.columns[newCheck].hidden) return prevCell(newCheck);
						return newCheck;
					}
					function nextRow (check) {
						var newCheck = check + 1;
						if (obj.records.length == newCheck) return check;
						return newCheck;
					}
					function prevRow (check) {
						var newCheck = check - 1;
						if (newCheck < 0) return check;
						return newCheck;
					}
				});
			// unselect
			if (typeof value == 'undefined' || value == null) {
				el.find('input').focus();
			} else {
				el.find('input').val('').focus().val(value);
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
		},

		delete: function (force) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'delete', force: force });
			if (eventData.isCancelled === true) return false;
			force = eventData.force;
			// default action
			var recs = this.getSelection();
			if (recs.length == 0) return;
			if (this.msgDelete != '' && !force) {
				w2confirm(obj.msgDelete, w2utils.lang('Delete Confirmation'), function (result) {
					if (result == 'Yes') w2ui[obj.name].delete(true);
				});
				return;
			}
			// call delete script
			var url = (typeof this.url != 'object' ? this.url : this.url.remove);
			if (url) {
				this.request('delete-records');
			} else {
				if (typeof recs[0] != 'object') {
					this.remove.apply(this, recs);
				} else {
					// clear cells
					for (var r in recs) {
						var fld = this.columns[recs[r].column].field;
						var ind = this.get(recs[r].recid, true);
						if (ind != null && fld != 'recid') {
							this.records[ind][fld] = '';
							if (this.records[ind].changed) this.records[ind].changes[fld] = '';
						}
					}
					this.refresh();
				}
				this.selectNone();
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		click: function (recid, event) {
			var time = (new Date()).getTime();
			var column = null;
			if (typeof recid == 'object') {
				column = recid.column;
				recid  = recid.recid;
			}
			if (w2utils.isInt(recid)) recid = parseInt(recid);
			if (typeof event == 'undefined') event = {};
			// check for double click
			if (time - parseInt(this.last.click_time) < 250 && event.type == 'click') {
				this.dblClick(recid, event);
				return;
			}
			this.last.click_time = time;
			// column user clicked on
			if (column == null && event.target) {
				var tmp = event.target;
				if (tmp.tagName != 'TD') tmp = $(tmp).parents('td')[0];
				if (typeof $(tmp).attr('col') != 'undefined') column = parseInt($(tmp).attr('col'));
			}
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'click', recid: recid, column: column, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// if it is subgrid unselect top grid
			var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid)).parents('tr');
			if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
				var grid  = parent.parents('.w2ui-grid').attr('name');
				w2ui[grid].selectNone();
				// all subgrids
				parent.parents('.w2ui-grid').find('.w2ui-expanded-row .w2ui-grid').each(function (index, el) {
					var grid = $(el).attr('name');
					if (w2ui[grid]) w2ui[grid].selectNone();
				});
			}
			// unselect all subgrids
			$(this.box).find('.w2ui-expanded-row .w2ui-grid').each(function (index, el) {
				var grid = $(el).attr('name');
				if (w2ui[grid]) w2ui[grid].selectNone();
			});
			// default action
			var obj = this;
			var sel = this.getSelection();
			$('#grid_'+ this.name +'_check_all').prop("checked", false);
			var ind    = this.get(recid, true);
			var record = this.records[ind];
			var selectColumns  = [];
			obj.last.sel_ind   = ind;
			obj.last.sel_col   = column;
			obj.last.sel_recid = recid;
			obj.last.sel_type  = 'click';
			// multi select with shif key
			if (event.shiftKey && sel.length > 0) {
				if (sel[0].recid) {
					var start = this.get(sel[0].recid, true);
					var end   = this.get(recid, true);
					if (column > sel[0].column) {
						var t1 = sel[0].column;
						var t2 = column;
					} else {
						var t1 = column;
						var t2 = sel[0].column;
					}
					for (var c = t1; c <= t2; c++) selectColumns.push(c);
				} else {
					var start = this.get(sel[0], true);
					var end   = this.get(recid, true);
				}
				var sel_add = []
				if (start > end) { var tmp = start; start = end; end = tmp; }
				var url = (typeof this.url != 'object' ? this.url : this.url.get);
				for (var i = start; i <= end; i++) {
					if (this.searchData.length > 0 && !url && $.inArray(i, this.last.searchIds) == -1) continue;
					if (this.selectType == 'row') {
						sel_add.push(this.records[i].recid);
					} else {
						for (var sc in selectColumns) sel_add.push({ recid: this.records[i].recid, column: selectColumns[sc] });
					}
					//sel.push(this.records[i].recid);
				}
				this.select.apply(this, sel_add);
			} else {
				var last = this.last.selection;
				var flag = (last.recids.indexOf(record.recid) != -1 ? true : false);
				// clear other if necessary
				if (((!event.ctrlKey && !event.shiftKey && !event.metaKey) || !this.multiSelect) && !this.showSelectColumn) {
					if (this.selectType != 'row' && $.inArray(column, last.columns[record.recid]) == -1) flag = false;
					if (sel.length > 300) this.selectNone(); else this.unselect.apply(this, sel);
					if (flag === true) {
						this.unselect({ recid: recid, column: column });
					} else {
						this.select({ recid: recid, column: column });
					}
				} else {
					if (this.selectType != 'row' && $.inArray(column, last.columns[recid]) == -1) flag = false;
					if (flag === true) {
						this.unselect({ recid: recid, column: column });
					} else {
						this.select({ recid: record.recid, column: column });
					}
				}
			}
			this.status();
			obj.initResize();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		columnClick: function (field, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'columnClick', target: this.name, field: field, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// default behaviour
			this.sort(field, null, (event && (event.ctrlKey || event.metaKey) ? true : false) );
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		keydown: function (event) {
			// this method is called from w2utils
			var obj = this;
			if (obj.keyboard !== true) return;
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// default behavior
			var records = $('#grid_'+ obj.name +'_records');
			var sel 	= obj.getSelection();
			if (sel.length == 0) {
				var ind = Math.floor((records[0].scrollTop + (records.height() / 2.1)) / obj.recordHeight);
				obj.select({ recid: obj.records[ind].recid, column: 0});
				sel = obj.getSelection();
			}
			var recid	= sel[0];
			var columns = [];
			var recid2  = sel[sel.length-1];
			if (typeof recid == 'object') {
				recid 	= sel[0].recid;
				columns	= [];
				var ii = 0;
				while (true) {
					if (!sel[ii] || sel[ii].recid != recid) break;
					columns.push(sel[ii].column);
					ii++;
				}
				recid2  = sel[sel.length-1].recid;
			}
			var ind		= obj.get(recid, true);
			var ind2	= obj.get(recid2, true);
			var rec 	= obj.get(recid);
			var recEL	= $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid));
			var cancel  = false;
			switch (event.keyCode) {
				case 8:  // backspace
				case 46: // delete
					obj.delete();
					cancel = true;
					event.stopPropagation();
					break;

				case 27: // escape
					var sel = obj.getSelection();
					obj.selectNone();
					if (sel.length > 0) {
						if (typeof sel[0] == 'object') {
							obj.select({ recid: sel[0].recid, column: sel[0].column });
						} else {
							obj.select(sel[0]);
						}
					}
					cancel = true;
					break;

				case 65: // cmd + A
					if (!event.metaKey && !event.ctrlKey) break;
					obj.selectAll();
					cancel = true;
					break;

				case 70: // cmd + F
					if (!event.metaKey && !event.ctrlKey) break;
					$('#grid_'+ obj.name + '_search_all').focus();
					cancel = true;
					break;

				case 13: // enter
					if (this.selectType == 'row') {
						if (recEL.length <= 0 || obj.show.expandColumn !== true) break;
						obj.toggle(recid, event);
						cancel = true;
					} else {
						if (columns.length == 0) columns.push(0);
						obj.editField(recid, columns[0], null, event);
						cancel = true;
					}
					break;

				case 37: // left
					// check if this is subgrid
					var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid)).parents('tr');
					if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
						var recid = parent.prev().attr('recid');
						var grid  = parent.parents('.w2ui-grid').attr('name');
						obj.selectNone();
						w2utils.keyboard.active(grid);
						w2ui[grid].set(recid, { expanded: false });
						w2ui[grid].collapse(recid);
						w2ui[grid].click(recid);
						cancel = true;
						break;
					}
					if (this.selectType == 'row') {
						if (recEL.length <= 0 || rec.expanded !== true ) break;
						obj.set(recid, { expanded: false }, true);
						obj.collapse(recid, event);
					} else {
						var prev = prevCell(columns[0]);
						if (prev != columns[0]) {
							if (event.shiftKey) {
								if (tmpUnselect()) return;
								var tmp    = [];
								var newSel = [];
								var unSel  = [];
								if (columns.indexOf(this.last.sel_col) == 0 && columns.length > 1) {
									for (var i in sel) {
										if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
										unSel.push({ recid: sel[i].recid, column: columns[columns.length-1] });
									}
								} else {
									for (var i in sel) {
										if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
										newSel.push({ recid: sel[i].recid, column: prev });
									}
								}
								obj.unselect.apply(obj, unSel);
								obj.select.apply(obj, newSel);
							} else {
								obj.click({ recid: recid, column: prev }, event);
							}
						} else {
							// if selected more then one, then select first
							if (!event.shiftKey) {
								for (var s=1; s<sel.length; s++) obj.unselect(sel[s]);
							}
						}
					}
					cancel = true;
					break;

				case 9:  // tab
				case 39: // right
					if (this.selectType == 'row') {
						if (recEL.length <= 0 || rec.expanded === true || obj.show.expandColumn !== true) break;
						obj.expand(recid, event);
					} else {
						var next = nextCell(columns[columns.length-1]);
						if (next != columns[columns.length-1]) {
							if (event.shiftKey && event.keyCode == 39) {
								if (tmpUnselect()) return;
								var tmp    = [];
								var newSel = [];
								var unSel  = [];
								if (columns.indexOf(this.last.sel_col) == columns.length-1 && columns.length > 1) {
									for (var i in sel) {
										if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
										unSel.push({ recid: sel[i].recid, column: columns[0] });
									}
								} else {
									for (var i in sel) {
										if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
										newSel.push({ recid: sel[i].recid, column: next });
									}
								}
								obj.unselect.apply(obj, unSel);
								obj.select.apply(obj, newSel);
							} else {
								obj.click({ recid: recid, column: next }, event);
							}
						} else {
							// if selected more then one, then select first
							if (!event.shiftKey) {
								for (var s=0; s<sel.length-1; s++) obj.unselect(sel[s]);
							}
						}
					}
					cancel = true;
					break;

				case 38: // up
					if (recEL.length <= 0) break;
					// move to the previous record
					var prev = prevRow(ind);
					if (prev != null) {
						// jump into subgrid
						if (obj.records[prev].expanded) {
							var subgrid = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[prev].recid) +'_expanded_row').find('.w2ui-grid');
							if (subgrid.length > 0 && w2ui[subgrid.attr('name')]) {
								obj.selectNone();
								var grid = subgrid.attr('name');
								var recs = w2ui[grid].records;
								w2utils.keyboard.active(grid);
								w2ui[grid].click(recs[recs.length-1].recid);
								cancel = true;
								break;
							}
						}
						if (event.shiftKey) { // expand selection
							if (tmpUnselect()) return;
							if (obj.selectType == 'row') {
								if (obj.last.sel_ind > prev && obj.last.sel_ind != ind2) {
									obj.unselect(obj.records[ind2].recid);
								} else {
									obj.select(obj.records[prev].recid);
								}
							} else {
								if (obj.last.sel_ind > prev && obj.last.sel_ind != ind2) {
									prev = ind2;
									var tmp = [];
									for (var c in columns) tmp.push({ recid: obj.records[prev].recid, column: columns[c] });
									obj.unselect.apply(obj, tmp);
								} else {
									var tmp = [];
									for (var c in columns) tmp.push({ recid: obj.records[prev].recid, column: columns[c] });
									obj.select.apply(obj, tmp);
								}
							}
						} else { // move selected record
							obj.selectNone();
							obj.click({ recid: obj.records[prev].recid, column: columns[0] }, event);
						}
						obj.scrollIntoView(prev);
						if (event.preventDefault) event.preventDefault();
					} else {
						// if selected more then one, then select first
						if (!event.shiftKey) {
							for (var s=1; s<sel.length; s++) obj.unselect(sel[s]);
						}
						// jump out of subgird (if first record)
						var parent = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid)).parents('tr');
						if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
							var recid = parent.prev().attr('recid');
							var grid  = parent.parents('.w2ui-grid').attr('name');
							obj.selectNone();
							w2utils.keyboard.active(grid);
							w2ui[grid].click(recid);
							cancel = true;
							break;
						}
					}
					break;

				case 40: // down
					if (recEL.length <= 0) break;
					// jump into subgrid
					if (obj.records[ind2].expanded) {
						var subgrid = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind2].recid) +'_expanded_row').find('.w2ui-grid');
						if (subgrid.length > 0 && w2ui[subgrid.attr('name')]) {
							obj.selectNone();
							var grid = subgrid.attr('name');
							var recs = w2ui[grid].records;
							w2utils.keyboard.active(grid);
							w2ui[grid].click(recs[0].recid);
							cancel = true;
							break;
						}
					}
					// move to the next record
					var next = nextRow(ind2);
					if (next != null) {
						if (event.shiftKey) { // expand selection
							if (tmpUnselect()) return;
							if (obj.selectType == 'row') {
								if (this.last.sel_ind < next && this.last.sel_ind != ind) {
									obj.unselect(obj.records[ind].recid);
								} else {
									obj.select(obj.records[next].recid);
								}
							} else {
								if (this.last.sel_ind < next && this.last.sel_ind != ind) {
									next = ind;
									var tmp = [];
									for (var c in columns) tmp.push({ recid: obj.records[next].recid, column: columns[c] });
									obj.unselect.apply(obj, tmp);
								} else {
									var tmp = [];
									for (var c in columns) tmp.push({ recid: obj.records[next].recid, column: columns[c] });
									obj.select.apply(obj, tmp);
								}
							}
						} else { // move selected record
							obj.selectNone();
							obj.click({ recid: obj.records[next].recid, column: columns[0] }, event);
						}
						obj.scrollIntoView(next);
						cancel = true;
					} else {
						// if selected more then one, then select first
						if (!event.shiftKey) {
							for (var s=0; s<sel.length-1; s++) obj.unselect(sel[s]);
						}
						// jump out of subgrid (if last record in subgrid)
						var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind2].recid)).parents('tr');
						if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
							var recid = parent.next().attr('recid');
							var grid  = parent.parents('.w2ui-grid').attr('name');
							obj.selectNone();
							w2utils.keyboard.active(grid);
							w2ui[grid].click(recid);
							cancel = true;
							break;
						}
					}
					break;

				case 86: // v - paste
					if (event.ctrlKey || event.metaKey) {
						$('body').append('<textarea id="_tmp_copy_data" style="position: absolute; top: -100px; height: 1px;"></textarea>');
						$('#_tmp_copy_data').focus();
						setTimeout(function () {
							obj.paste($('#_tmp_copy_data').val());
							$('#_tmp_copy_data').remove();
						}, 50); // need timer to allow paste
					}
					break;

				case 88: // x - cut
					if (event.ctrlKey || event.metaKey) {
						setTimeout(function () { obj.delete(true); }, 100);
					}
				case 67: // c - copy
					if (event.ctrlKey || event.metaKey) {
						var text = obj.copy();
						$('body').append('<textarea id="_tmp_copy_data" style="position: absolute; top: -100px; height: 1px;">'+ text +'</textarea>');
						$('#_tmp_copy_data').focus().select();
						setTimeout(function () { $('#_tmp_copy_data').remove(); }, 50);
					}
					break;
			}
			var tmp = [187, 189, 32]; // =-spacebar
			for (var i=48; i<=90; i++) tmp.push(i); // 0-9,a-z,A-Z
			if (tmp.indexOf(event.keyCode) != -1 && !event.ctrlKey && !event.metaKey && !cancel) {
				if (columns.length == 0) columns.push(0);
				var tmp = String.fromCharCode(event.keyCode);
				if (event.keyCode == 187) tmp = '=';
				if (event.keyCode == 189) tmp = '-';
				if (!event.shiftKey) tmp = tmp.toLowerCase();
				obj.editField(recid, columns[0], tmp, event);
				cancel = true;
			}
			if (cancel) { // cancel default behaviour
				if (event.preventDefault) event.preventDefault();
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));

			function nextRow (ind) {
				if ((ind + 1 < obj.records.length && obj.last.searchIds.length == 0) // if there are more records
						|| (obj.last.searchIds.length > 0 && ind < obj.last.searchIds[obj.last.searchIds.length-1])) {
					ind++;
					if (obj.last.searchIds.length > 0) {
						while (true) {
							if ($.inArray(ind, obj.last.searchIds) != -1 || ind > obj.records.length) break;
							ind++;
						}
					}
					return ind;
				} else {
					return null;
				}
			}

			function prevRow (ind) {
				if ((ind > 0 && obj.last.searchIds.length == 0)  // if there are more records
						|| (obj.last.searchIds.length > 0 && ind > obj.last.searchIds[0])) {
					ind--;
					if (obj.last.searchIds.length > 0) {
						while (true) {
							if ($.inArray(ind, obj.last.searchIds) != -1 || ind < 0) break;
							ind--;
						}
					}
					return ind;
				} else {
					return null;
				}
			}

			function nextCell (check) {
				var newCheck = check + 1;
				if (obj.columns.length == newCheck) return check;
				if (obj.columns[newCheck].hidden) return findNext(newCheck);
				return newCheck;
			}

			function prevCell (check) {
				var newCheck = check - 1;
				if (newCheck < 0) return check;
				if (obj.columns[newCheck].hidden) return findPrev(newCheck);
				return newCheck;
			}

			function tmpUnselect () {
				if (obj.last.sel_type != 'click') return false;
				if (obj.selectType != 'row') {
					obj.last.sel_type = 'key';
					if (sel.length > 1) {
						for (var s in sel) {
							if (sel[s].recid == obj.last.sel_recid && sel[s].column == obj.last.sel_col) {
								sel.splice(s, 1);
								break;
							}
						}
						obj.unselect.apply(obj, sel);
						return true;
					}
					return false;
				} else {
					obj.last.sel_type = 'key';
					if (sel.length > 1) {
						sel.splice(sel.indexOf(obj.records[obj.last.sel_ind].recid), 1);
						obj.unselect.apply(obj, sel);
						return true;
					}
					return false;
				}
			}
		},

		scrollIntoView: function (ind) {
			if (typeof ind == 'undefined') {
				var sel = this.getSelection();
				if (sel.length == 0) return;
				ind	= this.get(sel[0], true);
			}
			var records	= $('#grid_'+ this.name +'_records');
			if (records.length == 0) return;
			// if all records in view
			var len = this.last.searchIds.length;
			if (records.height() > this.recordHeight * (len > 0 ? len : this.records.length)) return;
			if (len > 0) ind = this.last.searchIds.indexOf(ind); // if seach is applied
			// scroll to correct one
			var t1 = Math.floor(records[0].scrollTop / this.recordHeight);
			var t2 = t1 + Math.floor(records.height() / this.recordHeight);
			if (ind == t1) records.animate({ 'scrollTop': records.scrollTop() - records.height() / 1.3 });
			if (ind == t2) records.animate({ 'scrollTop': records.scrollTop() + records.height() / 1.3 });
			if (ind < t1 || ind > t2) records.animate({ 'scrollTop': (ind - 1) * this.recordHeight });
		},

		dblClick: function (recid, event) {
			//if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// find columns
			var column = null;
			if (typeof recid == 'object') {
				column = recid.column;
				recid  = recid.recid;
			}
			if (typeof event == 'undefined') event = {};
			// column user clicked on
			if (column == null && event.target) {
				var tmp = event.target;
				if (tmp.tagName != 'TD') tmp = $(tmp).parents('td')[0];
				column = parseInt($(tmp).attr('col'));
			}
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'dblClick', recid: recid, column: column, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// default action
			this.selectNone();
			var col = this.columns[column];
			if (col && $.isPlainObject(col.editable)) {
				this.editField(recid, column, null, event);
			} else {
				this.select({ recid: recid, column: column });
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		toggle: function (recid) {
			var rec = this.get(recid);
			if (rec.expanded === true) return this.collapse(recid); else return this.expand(recid);
		},

		expand: function (recid) {
			var rec = this.get(recid);
			var obj = this;
			var id  = w2utils.escapeId(recid);
			if ($('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').length > 0) return false;
			if (rec.expanded == 'none') return false;
			// insert expand row
			var tmp = 1 + (this.show.selectColumn ? 1 : 0);
			var addClass = ''; // ($('#grid_'+this.name +'_rec_'+ w2utils.escapeId(recid)).hasClass('w2ui-odd') ? 'w2ui-odd' : 'w2ui-even');
			$('#grid_'+ this.name +'_rec_'+ id).after(
					'<tr id="grid_'+ this.name +'_rec_'+ id +'_expanded_row" class="w2ui-expanded-row '+ addClass +'">'+
						(this.show.lineNumbers ? '<td class="w2ui-col-number"></td>' : '') +
					'	<td class="w2ui-grid-data w2ui-expanded1" colspan="'+ tmp +'"><div style="display: none"></div></td>'+
					'	<td colspan="100" class="w2ui-expanded2">'+
					'		<div id="grid_'+ this.name +'_rec_'+ id +'_expanded" style="opacity: 0"></div>'+
					'	</td>'+
					'</tr>');
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: recid,
				box_id: 'grid_'+ this.name +'_rec_'+ id +'_expanded', ready: ready });
			if (eventData.isCancelled === true) {
				$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove();
				return false;
			}
			// default action
			$('#grid_'+ this.name +'_rec_'+ id).attr('expanded', 'yes').addClass('w2ui-expanded');
			$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').show();
			$('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('<div class="w2ui-spinner" style="width: 16px; height: 16px; margin: -2px 2px;"></div>');
			rec.expanded = true;
			// check if height of expaned row > 5 then remove spinner
			setTimeout(ready, 300);
			function ready() {
				var div1 = $('#grid_'+ obj.name +'_rec_'+ id +'_expanded');
				var div2 = $('#grid_'+ obj.name +'_rec_'+ id +'_expanded_row .w2ui-expanded1 > div');
				if (div1.height() < 5) return;
				div1.css('opacity', 1);
				div2.show().css('opacity', 1);
				$('#grid_'+ obj.name +'_cell_'+ obj.get(recid, true) +'_expand div').html('-');
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resizeRecords();
			return true;
		},

		collapse: function (recid) {
			var rec = this.get(recid);
			var obj = this;
			var id  = w2utils.escapeId(recid);
			if ($('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').length == 0) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'collapse', target: this.name, recid: recid,
				box_id: 'grid_'+ this.name +'_rec_'+ id +'_expanded' });
			if (eventData.isCancelled === true) return false;
			// default action
			$('#grid_'+ this.name +'_rec_'+ id).removeAttr('expanded').removeClass('w2ui-expanded');
			$('#grid_'+ this.name +'_rec_'+ id +'_expanded').css('opacity', 0);
			$('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('+');
			setTimeout(function () {
				$('#grid_'+ obj.name +'_rec_'+ id +'_expanded').height('0px');
				setTimeout(function () {
					$('#grid_'+ obj.name +'_rec_'+ id +'_expanded_row').remove();
					delete rec.expanded;
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.resizeRecords();
				}, 300);
			}, 200);
			return true;
		},

		sort: function (field, direction, multiField) { // if no params - clears sort
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'sort', target: this.name, field: field, direction: direction, multiField: multiField });
			if (eventData.isCancelled === true) return false;
			// check if needed to quit
			if (typeof field != 'undefined') {
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
							case 'desc'	: direction = 'asc';  break;
							default		: direction = 'asc';  break;
						}
					}
				}
				if (this.multiSort === false) { this.sortData = []; sortIndex = 0; }
				if (multiField != true) { this.sortData = []; sortIndex = 0; }
				// set new sort
				if (typeof this.sortData[sortIndex] == 'undefined') this.sortData[sortIndex] = {};
				this.sortData[sortIndex].field 	   = field;
				this.sortData[sortIndex].direction = direction;
			} else {
				this.sortData = [];
			}
			// if local
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				this.localSort();
				if (this.searchData.length > 0) this.localSearch(true);
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
				this.refresh();
			} else {
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
				this.last.xhr_offset = 0;
				this.reload();
			}
		},

		copy: function () {
			var sel = this.getSelection();
			if (sel.length == 0) return '';
			var text = '';
			if (typeof sel[0] == 'object') { // cell copy
				// find min/max column
				var minCol = sel[0].column;
				var maxCol = sel[0].column;
				var recs   = [];
				for (var s in sel) {
					if (sel[s].column < minCol) minCol = sel[s].column;
					if (sel[s].column > maxCol) maxCol = sel[s].column;
					if (recs.indexOf(sel[s].index) == -1) recs.push(sel[s].index);
				}
				recs.sort();
				for (var r in recs) {
					var ind = recs[r];
					for (var c = minCol; c <= maxCol; c++) {
						var col = this.columns[c];
						if (col.hidden === true) continue;
						text += w2utils.stripTags(this.getCellHTML(ind, c)) + '\t';
					}
					text = text.substr(0, text.length-1); // remove last \t
					text += '\n';
				}
			} else { // row copy
				for (var s in sel) {
					var ind = this.get(sel[s], true);
					for (var c in this.columns) {
						var col = this.columns[c];
						if (col.hidden === true) continue;
						text += w2utils.stripTags(this.getCellHTML(ind, c)) + '\t';
					}
					text = text.substr(0, text.length-1); // remove last \t
					text += '\n';
				}
			}
			text = text.substr(0, text.length - 1);
			// before event
			var eventData = this.trigger({ phase: 'before', type: 'copy', target: this.name, text: text });
			if (eventData.isCancelled === true) return '';
			text = eventData.text;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return text;
		},

		paste: function (text) {
			var sel = this.getSelection();
			var ind = this.get(sel[0].recid, true);
			var col = sel[0].column;
			// before event
			var eventData = this.trigger({ phase: 'before', type: 'paste', target: this.name, text: text, index: ind, column: col });
			if (eventData.isCancelled === true) return;
			text = eventData.text;
			// default action
			if (this.selectType == 'row' || sel.length == 0) {
				console.log('ERROR: You can paste only if grid.selectType = \'cell\' and when at least one cell selected.');
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
				return;
			}
			var newSel = [];
			var text   = text.split('\n');
			for (var t in text) {
				var tmp  = text[t].split('\t');
				var cnt  = 0;
				var rec  = this.records[ind];
				var cols = [];
				for (var dt in tmp) {
					if (!this.columns[col + cnt]) continue;
					var field = this.columns[col + cnt].field;
					rec.changed = true;
					rec.changes = rec.changes || {};
					rec.changes[field] = tmp[dt];
					cols.push(col + cnt);
					cnt++;
				}
				for (var c in cols) newSel.push({ recid: rec.recid, column: cols[c] });
				ind++;
			}
			this.selectNone();
			this.select.apply(this, newSel);
			this.refresh();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		// ==================================================
		// --- Common functions

		resize: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			//if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// make sure the box is right
			if (!this.box || $(this.box).attr('name') != this.name) return;
			// determine new width and height
			$(this.box).find('> div')
				.css('width', $(this.box).width())
				.css('height', $(this.box).height());
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
			if (eventData.isCancelled === true) return false;
			// resize
			obj.resizeBoxes();
			obj.resizeRecords();
			// init editable
			// $('#grid_'+ obj.name + '_records .w2ui-editable input').each(function (index, el) {
			// 	var column = obj.columns[$(el).attr('column')];
			// 	if (column && column.editable) $(el).w2field(column.editable);
			// });
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		refreshCell: function (recid, field) {
			var index	= this.get(recid, true);
			var cIndex	= this.getColumn(field, true);
			$('#grid_'+ this.name + '_rec_'+ recid +' [col='+ cIndex +']').html(this.getCellHTML(index, cIndex));
		},

		refreshRow: function (recid) {
			var tr = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
			if (tr.length != 0) {
				var ind  = this.get(recid, true);
				var line = tr.attr('line');
				// if it is searched, find index in search array
				var url = (typeof this.url != 'object' ? this.url : this.url.get);
				if (this.searchData.length > 0 && !url) for (var s in this.last.searchIds) if (this.last.searchIds[s] == ind) ind = s;
				$(tr).replaceWith(this.getRecordHTML(ind, line));
			}

		},

		refresh: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (this.total <= 0 && !url && this.searchData.length == 0) {
				this.total = this.records.length;
				this.buffered = this.total;
			}
			//if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			this.toolbar.disable('edit', 'delete');
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh' });
			if (eventData.isCancelled === true) return false;
			// -- header
			if (this.show.header) {
				$('#grid_'+ this.name +'_header').html(this.header +'&nbsp;').show();
			} else {
				$('#grid_'+ this.name +'_header').hide();
			}
			// -- toolbar
			if (this.show.toolbar) {
				// if select-collumn is checked - no toolbar refresh
				if (this.toolbar && this.toolbar.get('column-on-off') && this.toolbar.get('column-on-off').checked) {
					// no action
				} else {
					$('#grid_'+ this.name +'_toolbar').show();
					// refresh toolbar only once
					if (typeof this.toolbar == 'object') {
						this.toolbar.refresh();
						var tmp = $('#grid_'+ obj.name +'_search_all');
						tmp.val(this.last.search);
					}
				}
			} else {
				$('#grid_'+ this.name +'_toolbar').hide();
			}
			// -- make sure search is closed
			this.searchClose();
			// search placeholder
			var searchEl = $('#grid_'+ obj.name +'_search_all');
			if (this.searches.length == 0) {
				this.last.field = 'all';
			}
			if (!this.multiSearch && this.last.field == 'all' && this.searches.length > 0) {
				this.last.field 	= this.searches[0].field;
				this.last.caption 	= this.searches[0].caption;
			}
			for (var s in this.searches) {
				if (this.searches[s].field == this.last.field) this.last.caption = this.searches[s].caption;
			}
			if (this.last.multi) {
				searchEl.attr('placeholder', '[' + w2utils.lang('Multiple Fields') + ']');
			} else {
				searchEl.attr('placeholder', this.last.caption);
			}

			// focus search if last searched
			if (this._focus_when_refreshed === true) {
				clearTimeout(obj._focus_timer);
				obj._focus_timer = setTimeout(function () {
					if (searchEl.length > 0) { searchEl[0].focus(); }
					delete obj._focus_when_refreshed;
					delete obj._focus_timer;
				}, 600); // need time to render
			}

			// -- separate summary
			var tmp = this.find({ summary: true }, true);
			if (tmp.length > 0) {
				for (var t in tmp) this.summary.push(this.records[tmp[t]]);
				for (var t=tmp.length-1; t>=0; t--) this.records.splice(tmp[t], 1);
				this.total 	  = this.total - tmp.length;
				this.buffered = this.buffered - tmp.length;
			}

			// -- body
			var bodyHTML = '';
			bodyHTML +=  '<div id="grid_'+ this.name +'_records" class="w2ui-grid-records"'+
						'	onscroll="var obj = w2ui[\''+ this.name + '\']; '+
						'		obj.last.scrollTop = this.scrollTop; '+
						'		obj.last.scrollLeft = this.scrollLeft; '+
						'		$(\'#grid_'+ this.name +'_columns\')[0].scrollLeft = this.scrollLeft;'+
						'		$(\'#grid_'+ this.name +'_summary\')[0].scrollLeft = this.scrollLeft;'+
						'		obj.scroll(event);">'+
							this.getRecordsHTML() +
						'</div>'+
						'<div id="grid_'+ this.name +'_columns" class="w2ui-grid-columns">'+
						'	<table>'+ this.getColumnsHTML() +'</table>'+
						'</div>'; // Columns need to be after to be able to overlap
			$('#grid_'+ this.name +'_body').html(bodyHTML);
			// show summary records
			if (this.summary.length > 0) {
				$('#grid_'+ this.name +'_summary').html(this.getSummaryHTML()).show();
			} else {
				$('#grid_'+ this.name +'_summary').hide();
			}
			// -- footer
			if (this.show.footer) {
				$('#grid_'+ this.name +'_footer').html(this.getFooterHTML()).show();
			} else {
				$('#grid_'+ this.name +'_footer').hide();
			}
			// show/hide clear search link
 			if (this.searchData.length > 0) {
				$('#grid_'+ this.name +'_searchClear').show();
			} else {
				$('#grid_'+ this.name +'_searchClear').hide();
			}
			// all selected?
			if (this.last.selection.recids.length == this.records.length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop('checked', false);
			}
			// show number of selected
			this.status();
			// collapse all records
			var rows = obj.find({ expanded: true }, true);
			for (var r in rows) obj.records[rows[r]].expanded = false;
			// mark selection
			setTimeout(function () {
				var str  = $.trim($('#grid_'+ obj.name +'_search_all').val());
				if (str != '') $(obj.box).find('.w2ui-grid-data > div').w2marker(str);
			}, 50);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			obj.resize();
			obj.addRange('selection');
			setTimeout(function () { obj.resize(); obj.scroll(); }, 1); // allow to render first
			return (new Date()).getTime() - time;
		},

		render: function (box) {
			var obj  = this;
			var time = (new Date()).getTime();
			//if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (typeof box != 'undefined' && box != null) {
				if ($(this.box).find('#grid_'+ this.name +'_body').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-grid')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return;
			if (this.last.sortData == null) this.last.sortData = this.sortData;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: box });
			if (eventData.isCancelled === true) return false;
			// insert Elements
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-grid')
				.html('<div>'+
					  '	<div id="grid_'+ this.name +'_header" class="w2ui-grid-header"></div>'+
					  '	<div id="grid_'+ this.name +'_toolbar" class="w2ui-grid-toolbar"></div>'+
					  '	<div id="grid_'+ this.name +'_body" class="w2ui-grid-body"></div>'+
					  '	<div id="grid_'+ this.name +'_summary" class="w2ui-grid-body w2ui-grid-summary"></div>'+
					  '	<div id="grid_'+ this.name +'_footer" class="w2ui-grid-footer"></div>'+
					  '</div>');
			if (this.selectType != 'row') $(this.box).addClass('w2ui-ss');
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// init toolbar
			this.initToolbar();
			if (this.toolbar != null) this.toolbar.render($('#grid_'+ this.name +'_toolbar')[0]);
			// init footer
			$('#grid_'+ this.name +'_footer').html(this.getFooterHTML());
			// refresh
			if (this.url) this.refresh(); // show empty grid (need it) - should it be only for remote data source
			this.reload();

			// init mouse events for mouse selection
			$(this.box).on('mousedown', mouseStart);
			$(this.box).on('selectstart', function () { return false; }); // fixes chrome cursror bug

			//init drag events for coloumn relocation
			if (this.draggableCols) this.initColumnDrag();

			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// attach to resize event
			if ($('.w2ui-layout').length == 0) { // if there is layout, it will send a resize event
				this.tmp_resize = function (event) { w2ui[obj.name].resize(); }
				$(window).off('resize', this.tmp_resize).on('resize', this.tmp_resize);
			}
			return (new Date()).getTime() - time;

			function mouseStart (event) {
				if ($(event.target).parents().hasClass('w2ui-head') || $(event.target).hasClass('w2ui-head')) return;
				if (obj.last.move && obj.last.move.type == 'expand') return;
				obj.last.move = {
					x		: event.screenX,
					y		: event.screenY,
					divX	: 0,
					divY	: 0,
					recid	: $(event.target).parents('tr').attr('recid'),
					column	: (event.target.tagName == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col')),
					type	: 'select',
					start	: true
				};
				$(document).on('mousemove', mouseMove);
				$(document).on('mouseup', mouseStop);
			}

			function mouseMove (event) {
				if (!obj.last.move || obj.last.move.type != 'select') return;
				obj.last.move.divX = (event.screenX - obj.last.move.x);
				obj.last.move.divY = (event.screenY - obj.last.move.y);
				if (Math.abs(obj.last.move.divX) <= 1 && Math.abs(obj.last.move.divY) <= 1) return; // only if moved more then 1px
				if (obj.last.move.start && obj.last.move.recid) {
					obj.selectNone();
					obj.last.move.start = false;
				}
				var newSel= [];
				var recid = (event.target.tagName == 'TR' ? $(event.target).attr('recid') : $(event.target).parents('tr').attr('recid'));
				if (typeof recid == 'undefined') return;
				var ind1  = obj.get(obj.last.move.recid, true);
				var ind2  = obj.get(recid, true);
				var col1  = parseInt(obj.last.move.column);
				var col2  = parseInt(event.target.tagName == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col'));
				if (ind1 > ind2) { var tmp = ind1; ind1 = ind2; ind2 = tmp; }
				// check if need to refresh
				var tmp = 'ind1:'+ ind1 +',ind2;'+ ind2 +',col1:'+ col1 +',col2:'+ col2;
				if (obj.last.move.range == tmp) return;
				obj.last.move.range = tmp;
				for (var i = ind1; i <= ind2; i++) {
					if (obj.last.searchIds.length > 0 && obj.last.searchIds.indexOf(i) == -1) continue;
					if (obj.selectType != 'row') {
						if (col1 > col2) { var tmp = col1; col1 = col2; col2 = tmp; }
						var tmp = [];
						for (var c = col1; c <= col2; c++) {
							if (obj.columns[c].hidden) continue;
							newSel.push({ recid: obj.records[i].recid, column: parseInt(c) });
						}
					} else {
						newSel.push(obj.records[i].recid);
					}
				}
				if (obj.selectType != 'row') {
					var sel = obj.getSelection();
					// add more items
					var tmp = [];
					for (var ns in newSel) {
						var flag = false;
						for (var s in sel) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true;
						if (!flag) tmp.push({ recid: newSel[ns].recid, column: newSel[ns].column });
					}
					obj.select.apply(obj, tmp);
					// remove items
					var tmp = [];
					for (var s in sel) {
						var flag = false;
						for (var ns in newSel) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true;
						if (!flag) tmp.push({ recid: sel[s].recid, column: sel[s].column });
					}
					obj.unselect.apply(obj, tmp);
				} else {
					if (obj.multiSelect) {
						var sel = obj.getSelection();
						for (var ns in newSel) if (sel.indexOf(newSel[ns]) == -1) obj.select(newSel[ns]); // add more items
						for (var s in sel) if (newSel.indexOf(sel[s]) == -1) obj.unselect(sel[s]); // remove items
					}
				}
			}

			function mouseStop (event) {
				if ($(event.target).parents().hasClass('.w2ui-head') || $(event.target).hasClass('.w2ui-head')) return;
				if (!obj.last.move || obj.last.move.type != 'select') return;
				delete obj.last.move;
				$(document).off('mousemove', mouseMove);
				$(document).off('mouseup', mouseStop);
			}
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });
			if (eventData.isCancelled === true) return false;
			// remove events
			$(window).off('resize', this.tmp_resize);
			// clean up
			if (typeof this.toolbar == 'object' && this.toolbar.destroy) this.toolbar.destroy();
			if ($(this.box).find('#grid_'+ this.name +'_body').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-grid')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		// ===========================================
		// --- Internal Functions

		initColumnOnOff: function () {
			if (!this.show.toolbarColumns) return;
			var obj = this;
			var col_html =  '<div class="w2ui-col-on-off">'+
						    '<table>';
			for (var c in this.columns) {
				var col = this.columns[c];
				col_html += '<tr>'+
					'<td>'+
					'	<input id="grid_'+ this.name +'_column_'+ c +'_check" type="checkbox" tabIndex="-1" '+ (col.hidden ? '' : 'checked') +
					'		onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \''+ col.field +'\');">'+
					'</td>'+
					'<td>'+
					'	<label for="grid_'+ this.name +'_column_'+ c +'_check">'+
							(this.columns[c].caption == '' ? '- column '+ (c+1) +' -' : this.columns[c].caption) +
						'</label>'+
					'</td>'+
					'</tr>';
			}
			col_html += '<tr><td colspan="2"><div style="border-top: 1px solid #ddd;"></div></td></tr>';
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				col_html +=
						'<tr><td colspan="2" style="padding: 0px">'+
						'	<div style="cursor: pointer; padding: 2px 8px; cursor: default">'+
						'		'+ w2utils.lang('Skip') +' <input type="text" style="width: 45px" value="'+ this.offset +'" '+
						'				onchange="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'skip\', this.value);"> '+ w2utils.lang('Records')+
						'	</div>'+
						'</td></tr>';
			}
			col_html +=	'<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'line-numbers\');">'+
						'	<div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Toggle Line Numbers') +'</div>'+
						'</td></tr>'+
						'<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'resize\');">'+
						'	<div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Reset Column Size') + '</div>'+
						'</td></tr>';
			col_html += "</table></div>";
			this.toolbar.get('column-on-off').html = col_html;
		},

		initColumnDrag: function(box){
			if (this.columnGroups && this.columnGroups.length) throw 'Draggable columns are not currently supported with column groups.';

			var obj = this,
				//data object
				_dragData = {};
				_dragData.lastInt = null;

			$(this.box).on('mousedown', dragColStart);

			function dragColStart (event) {
				if (!$(event.originalEvent.target).parents().hasClass('w2ui-head')) return;

				var columns = _dragData.columns = $(obj.box).find('.w2ui-head:not(.w2ui-head-last)');
				var selectedCol;

				_dragData.originalPos = parseInt($(event.originalEvent.target).parent('.w2ui-head').attr('col'), 10);
				_dragData.columns.css({overflow: 'visible'}).children('div').css({overflow: 'visible'});

				//add events
				$(document).on('mouseup', dragColEnd);
				$(document).on('mousemove', dragColOver);

				//configure and style ghost image
				_dragData.ghost = $(this).clone(true);
				$(_dragData.ghost).find('[col]:not([col="' + _dragData.originalPos + '"])').css({width: 0, padding: 0, border: 'none', overflow: 'hidden'});
				selectedCol = $(_dragData.ghost).find('[col="' + _dragData.originalPos + '"]');
				$(document.body).append(_dragData.ghost);
				$(_dragData.ghost).css({
					width: 0,
					height: 0,
					position: 'fixed',
					zIndex: 100,
					opacity: 0
				}).animate({
						width: selectedCol.width(),
						height: $(obj.box).height(),
						opacity: .8
				}, 300);

				//establish current offsets
				_dragData.offsets = [];
				for (var i = 0, l = columns.length; i < l; i++) {
					_dragData.offsets.push($(columns[i]).offset().left);
				}

				event.preventDefault();
				return false;
			}

			function dragColOver (event) {
				var cursorX = event.originalEvent.pageX,
					cursorY = event.originalEvent.pageY,
					offsets = _dragData.offsets,
					lastWidth = $('.w2ui-head:not(.w2ui-head-last)').width();

				_dragData.targetInt = targetIntersection(cursorX, offsets, lastWidth);
				markIntersection(_dragData.targetInt);
				trackGhost(cursorX, cursorY);

				event.preventDefault();
				return false;
			}

			function dragColEnd (event) {
				var selected = obj.columns[_dragData.originalPos];
				var columnConfig = obj.columns;
				var columnNum = (_dragData.targetInt >= obj.columns.length) ? obj.columns.length - 1 :
						(_dragData.targetInt < _dragData.originalPos) ? _dragData.targetInt : _dragData.targetInt - 1;

				if (_dragData.targetInt !== _dragData.originalPos + 1 && _dragData.targetInt !== _dragData.originalPos) {
					$(_dragData.ghost).animate({
						top: $(obj.box).offset().top,
						left: $('.w2ui-head[col="' + columnNum + '"]').offset().left,
						width: 0,
						height: 0,
						opacity:.2
					}, 300, function(){
						$(this).remove();
					});
					columnConfig.splice(_dragData.targetInt, 0, $.extend({}, selected));
					columnConfig.splice(columnConfig.indexOf(selected), 1);
				} else {
					$(_dragData.ghost).remove();
				}

				_dragData.columns.css({overflow: ''}).children('div').css({overflow: ''});

				$(document).off('mouseup', dragColEnd);
				$(document).off('mousemove', dragColOver);
				_dragData.marker.remove();
				_dragData = {};

				obj.refresh();
			}

			function markIntersection(intersection){
				if (!_dragData.marker) {
					_dragData.marker = $('<div class="col-intersection-marker">' +
						'<div class="top-marker"></div>' +
						'<div class="bottom-marker"></div>' +
						'</div>');
				}

				if (!_dragData.lastInt || _dragData.lastInt !== intersection){
					_dragData.lastInt = intersection;
					_dragData.marker.remove();

					if (intersection >= _dragData.columns.length) {
						$(_dragData.columns[_dragData.columns.length - 1]).children('div:last').append(_dragData.marker.addClass('right').removeClass('left'));
					} else {
						$(_dragData.columns[intersection]).children('div:last').prepend(_dragData.marker.addClass('left').removeClass('right'));
					}
				}
			}

			function targetIntersection(cursorX, offsets, lastWidth){
				if (cursorX <= offsets[0]) {
					return 0;
				} else if (cursorX >= offsets[offsets.length - 1] + lastWidth) {
					return offsets.length;
				} else {
					for (var i = 0, l = offsets.length; i < l; i++) {
						var thisOffset = offsets[i];
						var nextOffset = offsets[i + 1] || offsets[i] + lastWidth;
						var midpoint = (nextOffset - offsets[i])/2 + offsets[i];

						if (cursorX > thisOffset && cursorX <= midpoint) {
							return i;
						} else if (cursorX > midpoint && cursorX <= nextOffset) {
							return i + 1;
						}
					}
					return intersection;
				}
			}

			function trackGhost(cursorX, cursorY){
				$(_dragData.ghost).css({
					left: cursorX - 10,
					top: cursorY - 10
				});
			}
		},

		columnOnOff: function (el, event, field, value) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'columnOnOff', checkbox: el, field: field, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// regular processing
			var obj = this;
			// collapse expanded rows
			for (var r in this.records) {
				if (this.records[r].expanded === true) this.records[r].expanded = false
			}
			// show/hide
			var hide = true;
			if (field == 'line-numbers') {
				this.show.lineNumbers = !this.show.lineNumbers;
				this.refresh();
			} else if (field == 'skip') {
				if (!w2utils.isInt(value)) value = 0;
				obj.skip(value);
			} else if (field == 'resize') {
				// restore sizes
				for (var c in this.columns) {
					if (typeof this.columns[c].sizeOriginal != 'undefined') {
						this.columns[c].size = this.columns[c].sizeOriginal;
					}
				}
				this.initResize();
				this.resize();
			} else {
				var col = this.getColumn(field);
				if (col.hidden) {
					$(el).prop('checked', true);
					this.showColumn(col.field);
				} else {
					$(el).prop('checked', false);
					this.hideColumn(col.field);
				}
				hide = false;
			}
			this.initColumnOnOff();
			if (hide) {
				setTimeout(function () {
					$().w2overlay();
					obj.toolbar.uncheck('column-on-off');
				}, 100);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		initToolbar: function () {
			// -- if toolbar is true
			if (typeof this.toolbar['render'] == 'undefined') {
				var tmp_items = this.toolbar.items;
				this.toolbar.items = [];
				this.toolbar = $().w2toolbar($.extend(true, {}, this.toolbar, { name: this.name +'_toolbar', owner: this }));

				// =============================================
				// ------ Toolbar Generic buttons

				if (this.show.toolbarReload) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['reload']));
				}
				if (this.show.toolbarColumns) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['columns']));
					this.initColumnOnOff();
				}
				if (this.show.toolbarReload || this.show.toolbarColumn) {
					this.toolbar.items.push({ type: 'break', id: 'break0' });
				}
				if (this.show.toolbarSearch) {
					var html =
						'<div class="w2ui-toolbar-search">'+
						'<table cellpadding="0" cellspacing="0"><tr>'+
						'	<td>'+ this.buttons['search'].html +'</td>'+
						'	<td>'+
						'		<input id="grid_'+ this.name +'_search_all" class="w2ui-search-all" '+
						'			placeholder="'+ this.last.caption +'" value="'+ this.last.search +'"'+
						'			onkeyup="if (event.keyCode == 13) { '+
						'				w2ui[\''+ this.name +'\']._focus_when_refreshed = true; '+
						'				w2ui[\''+ this.name +'\'].search(w2ui[\''+ this.name +'\'].last.field, this.value); '+
						'			}">'+
						'	</td>'+
						'	<td>'+
						'		<div title="'+ w2utils.lang('Clear Search') +'" class="w2ui-search-clear" id="grid_'+ this.name +'_searchClear"  '+
						'			 onclick="var obj = w2ui[\''+ this.name +'\']; obj.searchReset();" '+
						'		>&nbsp;&nbsp;</div>'+
						'	</td>'+
						'</tr></table>'+
						'</div>';
					this.toolbar.items.push({ type: 'html', id: 'search', html: html });
					if (this.multiSearch && this.searches.length > 0) {
						this.toolbar.items.push($.extend(true, {}, this.buttons['search-go']));
					}
				}
				if (this.show.toolbarSearch && (this.show.toolbarAdd || this.show.toolbarEdit || this.show.toolbarDelete || this.show.toolbarSave)) {
					this.toolbar.items.push({ type: 'break', id: 'break1' });
				}
				if (this.show.toolbarAdd) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['add']));
				}
				if (this.show.toolbarEdit) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['edit']));
				}
				if (this.show.toolbarDelete) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['delete']));
				}
				if (this.show.toolbarSave) {
					if (this.show.toolbarAdd || this.show.toolbarDelete || this.show.toolbarEdit) {
						this.toolbar.items.push({ type: 'break', id: 'break2' });
					}
					this.toolbar.items.push($.extend(true, {}, this.buttons['save']));
				}
				// add original buttons
				for (var i in tmp_items) this.toolbar.items.push(tmp_items[i]);

				// =============================================
				// ------ Toolbar onClick processing

				var obj = this;
				this.toolbar.on('click', function (event) {
					var eventData = obj.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event });
					if (eventData.isCancelled === true) return false;
					var id = event.target;
					switch (id) {
						case 'reload':
							var eventData2 = obj.trigger({ phase: 'before', type: 'reload', target: obj.name });
							if (eventData2.isCancelled === true) return false;
							var url = (typeof obj.url != 'object' ? obj.url : obj.url.get);
							if (url) {
								obj.clear(true);
							} else {
								obj.last.scrollTop	= 0;
								obj.last.scrollLeft	= 0;
								obj.last.range_start= null;
								obj.last.range_end	= null;
							}
							obj.reload();
							obj.trigger($.extend(eventData2, { phase: 'after' }));
							break;
						case 'column-on-off':
							for (var c in obj.columns) {
								if (obj.columns[c].hidden) {
									$("#grid_"+ obj.name +"_column_"+ c + "_check").prop("checked", false);
								} else {
									$("#grid_"+ obj.name +"_column_"+ c + "_check").prop('checked', true);
								}
							}
							obj.initResize();
							obj.resize();
							break;
						case 'search-advanced':
							var tb = this;
							var it = this.get(id);
							if (it.checked) {
								obj.searchClose();
								setTimeout(function () { tb.uncheck(id); }, 1);
							} else {
								obj.searchOpen();
								event.originalEvent.stopPropagation();
								function tmp_close() { tb.uncheck(id); $(document).off('click', 'body', tmp_close); }
								$(document).on('click', 'body', tmp_close);
							}
							break;
						case 'add':
							// events
							var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'add', recid: null });
							obj.trigger($.extend(eventData, { phase: 'after' }));
							break;
						case 'edit':
							var sel 	= obj.getSelection();
							var recid 	= null;
							if (sel.length == 1) recid = sel[0];
							// events
							var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'edit', recid: recid });
							obj.trigger($.extend(eventData, { phase: 'after' }));
							break;
						case 'delete':
							obj.delete();
							break;
						case 'save':
							obj.save();
							break;
					}
					// no default action
					obj.trigger($.extend(eventData, { phase: 'after' }));
				});
			}
			return;
		},

		initSearches: function () {
			var obj = this;
			// init searches
			for (var s in this.searches) {
				var search = this.searches[s];
				var sdata  = this.getSearchData(search.field);
				// init types
				switch (String(search.type).toLowerCase()) {
					case 'alphaNumeric':
					case 'text':
						$('#grid_'+ this.name +'_operator_'+s).val('begins with');
						break;

					case 'int':
					case 'float':
					case 'hex':
					case 'money':
					case 'date':
						$('#grid_'+ this.name +'_field_'+s).w2field('clear').w2field(search.type);
						$('#grid_'+ this.name +'_field2_'+s).w2field('clear').w2field(search.type);
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
						if (sdata.operator == 'in') {
							$('#grid_'+ this.name +'_field_'+ s).val(sdata.value).trigger('change');
						} else {
							$('#grid_'+ this.name +'_field_'+ s).val(sdata.value[0]).trigger('change');
							$('#grid_'+ this.name +'_field2_'+ s).val(sdata.value[1]).trigger('change');
						}
					}
				}
			}
			// add on change event
			$('#w2ui-overlay .w2ui-grid-searches *[rel=search]').on('keypress', function (evnt) {
				if (evnt.keyCode == 13) { obj.search(); }
			});
		},

		initResize: function () {
			var obj = this;
			//if (obj.resizing === true) return;
			$(this.box).find('.w2ui-resizer')
				.off('click')
				.on('click', function (event) {
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					if (event.preventDefault) event.preventDefault();
				})
				.off('mousedown')
				.on('mousedown', function (event) {
					if (!event) event = window.event;
					if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
					obj.resizing = true;
					obj.last.tmp = {
						x 	: event.screenX,
						y 	: event.screenY,
						gx 	: event.screenX,
						gy 	: event.screenY,
						col : parseInt($(this).attr('name'))
					};
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					if (event.preventDefault) event.preventDefault();
					// fix sizes
					for (var c in obj.columns) {
						if (typeof obj.columns[c].sizeOriginal == 'undefined') obj.columns[c].sizeOriginal = obj.columns[c].size;
						obj.columns[c].size = obj.columns[c].sizeCalculated;
					}
					var eventData = { phase: 'before', type: 'columnResize', target: obj.name, column: obj.last.tmp.col, field: obj.columns[obj.last.tmp.col].field };
					eventData = obj.trigger($.extend(eventData, { resizeBy: 0, originalEvent: event }));
					// set move event
					var mouseMove = function (event) {
						if (obj.resizing != true) return;
						if (!event) event = window.event;
						// event before
						eventData = obj.trigger($.extend(eventData, { resizeBy: (event.screenX - obj.last.tmp.gx), originalEvent: event }));
						if (eventData.isCancelled === true) { eventData.isCancelled = false; return; }
						// default action
						obj.last.tmp.x = (event.screenX - obj.last.tmp.x);
						obj.last.tmp.y = (event.screenY - obj.last.tmp.y);
						obj.columns[obj.last.tmp.col].size = (parseInt(obj.columns[obj.last.tmp.col].size) + obj.last.tmp.x) + 'px';
						obj.resizeRecords();
						// reset
						obj.last.tmp.x = event.screenX;
						obj.last.tmp.y = event.screenY;
					}
					var mouseUp = function (event) {
						delete obj.resizing;
						$(document).off('mousemove', 'body');
						$(document).off('mouseup', 'body');
						obj.resizeRecords();
						// event before
						obj.trigger($.extend(eventData, { phase: 'after', originalEvent: event }));
					}
					$(document).on('mousemove', 'body', mouseMove);
					$(document).on('mouseup', 'body', mouseUp);
				})
				.each(function (index, el) {
					var td  = $(el).parent();
					$(el).css({
						"height" 		: '25px',
						"margin-left" 	: (td.width() - 3) + 'px'
					})
				});
		},

		resizeBoxes: function () {
			// elements
			var main 		= $(this.box).find('> div');
			var header 		= $('#grid_'+ this.name +'_header');
			var toolbar 	= $('#grid_'+ this.name +'_toolbar');
			var summary		= $('#grid_'+ this.name +'_summary');
			var footer		= $('#grid_'+ this.name +'_footer');
			var body		= $('#grid_'+ this.name +'_body');
			var columns 	= $('#grid_'+ this.name +'_columns');
			var records 	= $('#grid_'+ this.name +'_records');

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
			if (this.summary.length > 0) {
				summary.css({
					bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) ) + 'px',
					left:  '0px',
					right: '0px'
				});
			}
			body.css({
				top: ( 0 + (this.show.header ? w2utils.getSize(header, 'height') : 0) + (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0) ) + 'px',
				bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) + (this.summary.length > 0 ? w2utils.getSize(summary, 'height') : 0) ) + 'px',
				left:   '0px',
				right:  '0px'
			});
		},

		resizeRecords: function () {
			var obj = this;
			// remove empty records
			$(this.box).find('.w2ui-empty-record').remove();
			// -- Calculate Column size in PX
			var box			= $(this.box);
			var grid		= $(this.box).find('> div');
			var header 		= $('#grid_'+ this.name +'_header');
			var toolbar		= $('#grid_'+ this.name +'_toolbar');
			var summary 	= $('#grid_'+ this.name +'_summary');
			var footer 		= $('#grid_'+ this.name +'_footer');
			var body 		= $('#grid_'+ this.name +'_body');
			var columns 	= $('#grid_'+ this.name +'_columns');
			var records 	= $('#grid_'+ this.name +'_records');

			// body might be expanded by data
			if (!this.fixedBody) {
				// allow it to render records, then resize
				setTimeout(function () {
					var calculatedHeight = w2utils.getSize(columns, 'height')
						+ w2utils.getSize($('#grid_'+ obj.name +'_records table'), 'height');
					obj.height = calculatedHeight
						+ w2utils.getSize(grid, '+height')
						+ (obj.show.header ? w2utils.getSize(header, 'height') : 0)
						+ (obj.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
						+ (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
						+ (obj.show.footer ? w2utils.getSize(footer, 'height') : 0);
					grid.css('height', obj.height);
					body.css('height', calculatedHeight);
					box.css('height', w2utils.getSize(grid, 'height') + w2utils.getSize(box, '+height'));
				}, 1);
			} else {
				// fixed body height
				var calculatedHeight =  grid.height()
					- (this.show.header ? w2utils.getSize(header, 'height') : 0)
					- (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
					- (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
					- (this.show.footer ? w2utils.getSize(footer, 'height') : 0);
				body.css('height', calculatedHeight);
			}

			// check overflow
			var bodyOverflowX = false;
			var bodyOverflowY = false;
			if (body.width() < $(records).find('>table').width()) bodyOverflowX = true;
			if (body.height() - columns.height() < $(records).find('>table').height() + (bodyOverflowX ? w2utils.scrollBarSize() : 0)) bodyOverflowY = true;
			if (!this.fixedBody) { bodyOverflowY = false; bodyOverflowX = false; }
			if (bodyOverflowX || bodyOverflowY) {
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.scrollBarSize()).show();
				records.css({
					top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
					"-webkit-overflow-scrolling": "touch",
					"overflow-x": (bodyOverflowX ? 'auto' : 'hidden'),
					"overflow-y": (bodyOverflowY ? 'auto' : 'hidden') });
			} else {
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').hide();
				records.css({
					top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
					overflow: 'hidden'
				});
				if (records.length > 0) { this.last.scrollTop  = 0; this.last.scrollLeft = 0; } // if no scrollbars, always show top
			}
			if (this.show.emptyRecords && !bodyOverflowY) {
				var max = Math.floor(records.height() / this.recordHeight) + 1;
				if (this.fixedBody) {
					for (var di = this.buffered; di <= max; di++) {
						var html  = '';
						html += '<tr class="'+ (di % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" style="height: '+ this.recordHeight +'px">';
						if (this.show.lineNumbers)  html += '<td class="w2ui-col-number"></td>';
						if (this.show.selectColumn) html += '<td class="w2ui-grid-data w2ui-col-select"></td>';
						if (this.show.expandColumn) html += '<td class="w2ui-grid-data w2ui-col-expand"></td>';
						var j = 0;
						while (true && this.columns.length > 0) {
							var col = this.columns[j];
							if (col.hidden) { j++; if (typeof this.columns[j] == 'undefined') break; else continue; }
							html += '<td class="w2ui-grid-data" '+ (typeof col.attr != 'undefined' ? col.attr : '') +' col="'+ j +'"></td>';
							j++;
							if (typeof this.columns[j] == 'undefined') break;
						}
						html += '<td class="w2ui-grid-data-last"></td>';
						html += '</tr>';
						$('#grid_'+ this.name +'_records > table').append(html);
					}
				}
			}
			if (body.length > 0) {
				var width_max = parseInt(body.width())
					- (bodyOverflowY ? w2utils.scrollBarSize() : 0)
					- (this.show.lineNumbers ? 34 : 0)
					- (this.show.selectColumn ? 26 : 0)
					- (this.show.expandColumn ? 26 : 0);
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
						width_max -= parseFloat(col.size);
						this.columns[i].sizeCalculated = col.size;
						this.columns[i].sizeType = 'px';
					} else {
						percent += parseFloat(col.size);
						this.columns[i].sizeType = '%';
						delete col.sizeCorrected;
					}
				}
				// if sum != 100% -- reassign proportionally
				if (percent != 100 && percent > 0) {
					for (var i=0; i<this.columns.length; i++) {
						var col = this.columns[i];
						if (col.hidden) continue;
						if (col.sizeType == '%') {
							col.sizeCorrected = Math.round(parseFloat(col.size) * 100 * 100 / percent) / 100 + '%';
						}
					}
				}
				// calculate % columns
				for (var i=0; i<this.columns.length; i++) {
					var col = this.columns[i];
					if (col.hidden) continue;
					if (col.sizeType == '%') {
						if (typeof this.columns[i].sizeCorrected != 'undefined') {
							// make it 1px smaller, so margin of error can be calculated correctly
							this.columns[i].sizeCalculated = Math.floor(width_max * parseFloat(col.sizeCorrected) / 100) - 1 + 'px';
						} else {
							// make it 1px smaller, so margin of error can be calculated correctly
							this.columns[i].sizeCalculated = Math.floor(width_max * parseFloat(col.size) / 100) - 1 + 'px';
						}
					}
				}
			}
			// fix margin of error that is due percentage calculations
			var width_cols = 0;
			for (var i=0; i<this.columns.length; i++) {
				var col = this.columns[i];
				if (col.hidden) continue;
				if (typeof col.min == 'undefined') col.min = 20;
				if (parseInt(col.sizeCalculated) < parseInt(col.min)) col.sizeCalculated = col.min + 'px';
				if (parseInt(col.sizeCalculated) > parseInt(col.max)) col.sizeCalculated = col.max + 'px';
				width_cols += parseInt(col.sizeCalculated);
			}
			var width_diff = parseInt(width_box) - parseInt(width_cols);
			if (width_diff > 0 && percent > 0) {
				var i = 0;
				while (true) {
					var col = this.columns[i];
					if (typeof col == 'undefined') { i = 0; continue; }
					if (col.hidden || col.sizeType == 'px') { i++; continue; }
					col.sizeCalculated = (parseInt(col.sizeCalculated) + 1) + 'px';
					width_diff--;
					if (width_diff == 0) break;
					i++;
				}
			} else if (width_diff > 0) {
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.scrollBarSize()).show();
			}
			// resize columns
			columns.find('> table > tbody > tr:nth-child(1) td').each(function (index, el) {
				var ind = $(el).attr('col');
				if (typeof ind != 'undefined' && obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated);
				// last column
				if ($(el).hasClass('w2ui-head-last')) {
					$(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
				}
			});
			// if there are column groups - hide first row (needed for sizing)
			if (columns.find('> table > tbody > tr').length == 3) {
				columns.find('> table > tbody > tr:nth-child(1) td').html('').css({
					'height'	: '0px',
					'border'	: '0px',
					'padding'	: '0px',
					'margin'	: '0px'
				});
			}
			// resize records
			records.find('> table > tbody > tr:nth-child(1) td').each(function (index, el) {
				var ind = $(el).attr('col');
				if (typeof ind != 'undefined' && obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated);
				// last column
				if ($(el).hasClass('w2ui-grid-data-last')) {
					$(el).css('width', (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
				}
			});
			// resize summary
			summary.find('> table > tbody > tr:nth-child(1) td').each(function (index, el) {
				var ind = $(el).attr('col');
				if (typeof ind != 'undefined' && obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated);
				// last column
				if ($(el).hasClass('w2ui-grid-data-last')) {
					$(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
				}
			});
			this.initResize();
			this.refreshRanges();
			// apply last scroll if any
			if (this.last.scrollTop != '' && records.length > 0) {
				columns.prop('scrollLeft', this.last.scrollLeft);
				records.prop('scrollTop',  this.last.scrollTop);
				records.prop('scrollLeft', this.last.scrollLeft);
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
				if (typeof s.type	== 'undefined') s.type 	= 'text';
				if (s.type == 'text') {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						'	<option value="begins with">'+ w2utils.lang('begins with') +'</option>'+
						'	<option value="contains">'+ w2utils.lang('contains') +'</option>'+
						'	<option value="ends with">'+ w2utils.lang('ends with') +'</option>'+
						'</select>';
				}
				if (s.type == 'int' || s.type == 'float' || s.type == 'date') {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'" '+
						'	onchange="var range = $(\'#grid_'+ this.name + '_range_'+ i +'\'); range.hide(); '+
						'			  var fld  = $(\'#grid_'+ this.name +'_field_'+ i +'\'); '+
						'			  var fld2 = fld.parent().find(\'span input\'); '+
						'			  if ($(this).val() == \'in\') fld.w2field(\'clear\'); else fld.w2field(\'clear\').w2field(\''+ s.type +'\');'+
						'			  if ($(this).val() == \'between\') { range.show(); fld2.w2field(\'clear\').w2field(\''+ s.type +'\'); }'+
						'			  var obj = w2ui[\''+ this.name +'\'];'+
						'			  fld.on(\'keypress\', function (evnt) { if (evnt.keyCode == 13) obj.search(); }); '+
						'			  fld2.on(\'keypress\', function (evnt) { if (evnt.keyCode == 13) obj.search(); }); '+
						'			">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						(s.type == 'date' ? '' : '<option value="in">'+ w2utils.lang('in') +'</option>')+
						'	<option value="between">'+ w2utils.lang('between') +'</option>'+
						'</select>';
				}
				if (s.type == 'list') {
					var operator =  'is <input type="hidden" value="is" id="grid_'+ this.name +'_operator_'+ i +'">';
				}
				html += '<tr>'+
						'	<td class="close-btn">'+ btn +'</td>' +
						'	<td class="caption">'+ s.caption +'</td>' +
						'	<td class="operator">'+ operator +'</td>'+
						'	<td class="value">';

				switch (s.type) {
					case 'alphaNumeric':
					case 'text':
						html += '<input rel="search" type="text" size="40" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'>';
						break;

					case 'int':
					case 'float':
					case 'hex':
					case 'money':
					case 'date':
						html += '<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'>'+
								'<span id="grid_'+ this.name +'_range_'+ i +'" style="display: none">'+
								'&nbsp;-&nbsp;&nbsp;<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field2_'+i+'" name="'+ s.field +'" '+ s.inTag +'>'+
								'</span>';
						break;

					case 'list':
						html += '<select rel="search" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'></select>';
						break;

				}
				html +=			s.outTag +
						'	</td>' +
						'</tr>';
			}
			html += '<tr>'+
					'	<td colspan="4" class="actions">'+
					'		<div>'+
					'		<input type="button" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchReset(); }" value="'+ w2utils.lang('Reset') + '">'+
					'		<input type="button" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.search(); }" value="'+ w2utils.lang('Search') + '">'+
					'		</div>'+
					'	</td>'+
					'</tr></table>';
			return html;
		},

		getColumnsHTML: function () {
			var obj  = this;
			var html = '';
			if (this.show.columnHeaders) {
				if (this.columnGroups.length > 0) {
					html = getColumns(true) + getGroups() + getColumns(false);
				} else {
					html = getColumns(true);
				}
			}
			return html;

			function getGroups () {
				var html = '<tr>';
				// add empty group at the end
				if (obj.columnGroups[obj.columnGroups.length-1].caption != '') obj.columnGroups.push({ caption: '' });

				if (obj.show.lineNumbers) {
					html += '<td class="w2ui-head w2ui-col-number">'+
							'	<div>&nbsp;</div>'+
							'</td>';
				}
				if (obj.show.selectColumn) {
					html += '<td class="w2ui-head w2ui-col-select">'+
							'	<div>&nbsp;</div>'+
							'</td>';
				}
				if (obj.show.expandColumn) {
					html += '<td class="w2ui-head w2ui-col-expand">'+
							'	<div>&nbsp;</div>'+
							'</td>';
				}
				var ii = 0;
				for (var i=0; i<obj.columnGroups.length; i++) {
					var colg = obj.columnGroups[i];
					var col  = obj.columns[ii];
					if (typeof colg.span == 'undefined' || colg.span != parseInt(colg.span)) colg.span = 1;
					if (typeof colg.colspan != 'undefined') colg.span = colg.colspan;
					if (colg.master === true) {
						var sortStyle = '';
						for (var si in obj.sortData) {
							if (obj.sortData[si].field == col.field) {
								if (obj.sortData[si].direction == 'asc')  sortStyle = 'w2ui-sort-down';
								if (obj.sortData[si].direction == 'desc') sortStyle = 'w2ui-sort-up';
							}
						}
						var resizer = "";
						if (col.resizable == true) {
							resizer = '<div class="w2ui-resizer" name="'+ ii +'"></div>';
						}
						html += '<td class="w2ui-head '+ sortStyle +'" col="'+ ii + '" rowspan="2" colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'" '+
										(col.sortable ? 'onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);"' : '') +'>'+
									resizer +
								'	<div class="w2ui-col-group '+ sortStyle +'">'+
										(col.caption == '' ? '&nbsp;' : col.caption) +
								'	</div>'+
								'</td>';
					} else {
						html += '<td class="w2ui-head" col="'+ ii + '" '+
								'		colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'">'+
								'	<div class="w2ui-col-group">'+
									(colg.caption == '' ? '&nbsp;' : colg.caption) +
								'	</div>'+
								'</td>';
					}
					ii += colg.span;
				}
				html += '</tr>';
				return html;
			}

			function getColumns (master) {
				var html = '<tr>';
				if (obj.show.lineNumbers) {
					html += '<td class="w2ui-head w2ui-col-number" onclick="w2ui[\''+ obj.name +'\'].columnClick(\'line-number\', event);">'+
							'	<div>#</div>'+
							'</td>';
				}
				if (obj.show.selectColumn) {
					html += '<td class="w2ui-head w2ui-col-select" '+
							'		onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'	<div>'+
							'		<input type="checkbox" id="grid_'+ obj.name +'_check_all" tabIndex="-1"'+
							'			style="' + (obj.multiSelect == false ? 'display: none;' : '') + '"'+
							'			onclick="if (this.checked) w2ui[\''+ obj.name +'\'].selectAll(); '+
							'					 else w2ui[\''+ obj.name +'\'].selectNone(); '+
							'					 if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'	</div>'+
							'</td>';
				}
				if (obj.show.expandColumn) {
					html += '<td class="w2ui-head w2ui-col-expand">'+
							'	<div>&nbsp;</div>'+
							'</td>';
				}
				var ii = 0;
				var id = 0;
				for (var i=0; i<obj.columns.length; i++) {
					var col  = obj.columns[i];
					var colg = {};
					if (i == id) {
						id = id + (typeof obj.columnGroups[ii] != 'undefined' ? parseInt(obj.columnGroups[ii].span) : 0);
						ii++;
					}
					if (typeof obj.columnGroups[ii-1] != 'undefined') var colg = obj.columnGroups[ii-1];
					if (col.hidden) continue;
					var sortStyle = '';
					for (var si in obj.sortData) {
						if (obj.sortData[si].field == col.field) {
							if (obj.sortData[si].direction == 'asc')  sortStyle = 'w2ui-sort-down';
							if (obj.sortData[si].direction == 'desc') sortStyle = 'w2ui-sort-up';
						}
					}
					if (colg['master'] !== true || master) { // grouping of columns
						var resizer = "";
						if (col.resizable == true) {
							resizer = '<div class="w2ui-resizer" name="'+ i +'"></div>';
						}
						html += '<td col="'+ i +'" class="w2ui-head '+ sortStyle +'" '+
										(col.sortable ? 'onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);"' : '') + '>'+
									resizer +
								'	<div class="'+ sortStyle +'">'+
										(col.caption == '' ? '&nbsp;' : col.caption) +
								'	</div>'+
								'</td>';
					}
				}
				html += '<td class="w2ui-head w2ui-head-last"><div>&nbsp;</div></td>';
				html += '</tr>';
				//add dragable attribute to headers if option is true
				if (obj.draggableCols && (!obj.columnGroups || !obj.columnGroups.length)) html = html.replace(/<td/g, '<td draggable="true"');
				return html;
			}
		},

		getRecordsHTML: function () {
			// larget number works better with chrome, smaller with FF.
			if (this.buffered > 300) this.show_extra = 30; else this.show_extra = 300;
			var records	= $('#grid_'+ this.name +'_records');
			var limit	= Math.floor(records.height() / this.recordHeight) + this.show_extra + 1;
			if (!this.fixedBody) limit = this.buffered;
			// always need first record for resizing purposes
			var html = '<table>' + this.getRecordHTML(-1, 0);
			// first empty row with height
			html += '<tr id="grid_'+ this.name + '_rec_top" line="top" style="height: '+ 0 +'px">'+
					'	<td colspan="200"></td>'+
					'</tr>';
			for (var i = 0; i < limit; i++) {
				html += this.getRecordHTML(i, i+1);
			}
			html += '<tr id="grid_'+ this.name + '_rec_bottom" line="bottom" style="height: '+ ((this.buffered - limit) * this.recordHeight) +'px">'+
					'	<td colspan="200"></td>'+
					'</tr>'+
					'<tr id="grid_'+ this.name +'_rec_more" style="display: none">'+
					'	<td colspan="200" class="w2ui-load-more"></td>'+
					'</tr>'+
					'</table>';
			this.last.range_start = 0;
			this.last.range_end	  = limit;
			return html;
		},

		getSummaryHTML: function () {
			if (this.summary.length == 0) return;
			var html = '<table>';
			for (var i = 0; i < this.summary.length; i++) {
				html += this.getRecordHTML(i, i+1, true);
			}
			html += '</table>';
			return html;
		},

		scroll: function (event) {
			var time = (new Date()).getTime();
			var obj  = this;
			var records	= $('#grid_'+ this.name +'_records');
			if (this.records.length == 0 || records.length == 0 || records.height() == 0) return;
			if (this.buffered > 300) this.show_extra = 30; else this.show_extra = 300;
			// need this to enable scrolling when this.limit < then a screen can fit
			if (records.height() < this.buffered * this.recordHeight && records.css('overflow-y') == 'hidden') {
				if (this.total > 0) this.refresh();
				return;
			}
			// update footer
			var t1 = Math.floor(records[0].scrollTop / this.recordHeight + 1);
			var t2 = Math.floor(records[0].scrollTop / this.recordHeight + 1) + Math.round(records.height() / this.recordHeight);
			if (t1 > this.buffered) t1 = this.buffered;
			if (t2 > this.buffered) t2 = this.buffered;
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			$('#grid_'+ this.name + '_footer .w2ui-footer-right').html(w2utils.formatNumber(this.offset + t1) + '-' + w2utils.formatNumber(this.offset + t2) + ' ' + w2utils.lang('of') + ' ' +	w2utils.formatNumber(this.total) +
					(url ? ' ('+ w2utils.lang('buffered') + ' '+ w2utils.formatNumber(this.buffered) + (this.offset > 0 ? ', skip ' + w2utils.formatNumber(this.offset) : '') + ')' : '')
			);
			// only for local data source, else no extra records loaded
			if (!url && (!this.fixedBody || this.total <= 300)) return;
			// regular processing
			var start 	= Math.floor(records[0].scrollTop / this.recordHeight) - this.show_extra;
			var end		= start + Math.floor(records.height() / this.recordHeight) + this.show_extra * 2 + 1;
			// var div     = start - this.last.range_start;
			if (start < 1) start = 1;
			if (end > this.total) end = this.total;
			var tr1 = records.find('#grid_'+ this.name +'_rec_top');
			var tr2 = records.find('#grid_'+ this.name +'_rec_bottom');
			// if row is expanded
			if (String(tr1.next().prop('id')).indexOf('_expanded_row') != -1) tr1.next().remove();
			if (String(tr2.prev().prop('id')).indexOf('_expanded_row') != -1) tr2.prev().remove();
			var first = parseInt(tr1.next().attr('line'));
			var last  = parseInt(tr2.prev().attr('line'));
			//$('#log').html('buffer: '+ this.buffered +' start-end: ' + start + '-'+ end + ' ===> first-last: ' + first + '-' + last);
			if (first < start || first == 1 || this.last.pull_refresh) { // scroll down
				//console.log('end', end, 'last', last, 'show_extre', this.show_extra, this.last.pull_refresh);
				if (end <= last + this.show_extra - 2 && end != this.total) return;
				this.last.pull_refresh = false;
				// remove from top
				while (true) {
					var tmp = records.find('#grid_'+ this.name +'_rec_top').next();
					if (tmp.attr('line') == 'bottom') break;
					if (parseInt(tmp.attr('line')) < start) tmp.remove();  else break;
				}
				// add at bottom
				var tmp = records.find('#grid_'+ this.name +'_rec_bottom').prev();
				var rec_start = tmp.attr('line');
				if (rec_start == 'top') rec_start = start;
				for (var i = parseInt(rec_start) + 1; i <= end; i++) {
					if (!this.records[i-1]) continue;
					if (this.records[i-1].expanded === true) this.records[i-1].expanded = false;
					tr2.before(this.getRecordHTML(i-1, i));
				}
				markSearch();
				setTimeout(function() { obj.refreshRanges(); }, 0);
			} else { // scroll up
				if (start >= first - this.show_extra + 2 && start > 1) return;
				// remove from bottom
				while (true) {
					var tmp = records.find('#grid_'+ this.name +'_rec_bottom').prev();
					if (tmp.attr('line') == 'top') break;
					if (parseInt(tmp.attr('line')) > end) tmp.remove(); else break;
				}
				// add at top
				var tmp = records.find('#grid_'+ this.name +'_rec_top').next();
				var rec_start = tmp.attr('line');
				if (rec_start == 'bottom') rec_start = end;
				for (var i = parseInt(rec_start) - 1; i >= start; i--) {
					if (!this.records[i-1]) continue;
					if (this.records[i-1].expanded === true) this.records[i-1].expanded = false;
					tr1.after(this.getRecordHTML(i-1, i));
				}
				markSearch();
				setTimeout(function() { obj.refreshRanges(); }, 0);
			}
			// first/last row size
			var h1 = (start - 1) * obj.recordHeight;
			var h2 = (this.buffered - end) * obj.recordHeight;
			if (h2 < 0) h2 = 0;
			tr1.css('height', h1 + 'px');
			tr2.css('height', h2 + 'px');
			obj.last.range_start = start;
			obj.last.range_end   = end;
			// load more if needed
			var s = Math.floor(records[0].scrollTop / this.recordHeight);
			var e = s + Math.floor(records.height() / this.recordHeight);
			if (e + 10 > this.buffered && this.last.pull_more !== true && this.buffered < this.total - this.offset) {
				if (this.autoLoad === true) {
					this.last.pull_more = true;
					this.last.xhr_offset += this.limit;
					this.request('get-records');
				} else {
					var more = $('#grid_'+ this.name +'_rec_more');
					if (more.css('display') == 'none') {
						more.show()
							.on('click', function () {
								obj.last.pull_more = true;
								obj.last.xhr_offset += obj.limit;
								obj.request('get-records');
								// show spinner the last
								$(this).find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>');
							});
					}
					if (more.find('td').text().indexOf('Load') == -1) {
						more.find('td').html('<div>'+ w2utils.lang('Load') + ' ' + obj.limit + ' ' + w2utils.lang('More') + '...</div>');
					}
				}
			}
			// check for grid end
			if (this.buffered >= this.total - this.offset) $('#grid_'+ this.name +'_rec_more').hide();
			return;

			function markSearch() {
				// mark search
				if(obj.markSearchResults === false) return;
				clearTimeout(obj.last.marker_timer);
				obj.last.marker_timer = setTimeout(function () {
					// mark all search strings
					var str = [];
					for (var s in obj.searchData) {
						var tmp = obj.searchData[s];
						if ($.inArray(tmp.value, str) == -1) str.push(tmp.value);
					}
					if (str.length > 0) $(obj.box).find('.w2ui-grid-data > div').w2marker(str);
				}, 50);
			}
		},

		getRecordHTML: function (ind, lineNum, summary) {
			var rec_html = '';
			var sel = this.last.selection;
			// first record needs for resize purposes
			if (ind == -1) {
				rec_html += '<tr line="0">';
				if (this.show.lineNumbers)  rec_html += '<td class="w2ui-col-number" style="height: 0px;"></td>';
				if (this.show.selectColumn) rec_html += '<td class="w2ui-col-select" style="height: 0px;"></td>';
				if (this.show.expandColumn) rec_html += '<td class="w2ui-col-expand" style="height: 0px;"></td>';
				for (var i in this.columns) {
					if (this.columns[i].hidden) continue;
					rec_html += '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px;"></td>';
				}
				rec_html += '<td class="w2ui-grid-data-last" style="height: 0px;"></td>';
				rec_html += '</tr>';
				return rec_html;
			}
			// regular record
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (summary !== true) {
				if (this.searchData.length > 0 && !url) {
					if (ind >= this.last.searchIds.length) return '';
					ind = this.last.searchIds[ind];
					record = this.records[ind];
				} else {
					if (ind >= this.records.length) return '';
					record = this.records[ind];
				}
			} else {
				if (ind >= this.summary.length) return '';
				record = this.summary[ind];
			}
			if (!record) return '';
			var id = w2utils.escapeId(record.recid);
			var isRowSelected = false;
			if (sel.recids.indexOf(record.recid) != -1) isRowSelected = true;
			// render TR
			rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" '+
				' class="'+ (lineNum % 2 == 0 ? 'w2ui-even' : 'w2ui-odd') + (isRowSelected && this.selectType == 'row' ? ' w2ui-selected' : '') + (record.expanded === true ? ' w2ui-expanded' : '') + '" ' +
				(summary !== true ?
					(this.isIOS ?
						'	onclick  = "w2ui[\''+ this.name +'\'].dblClick(\''+ record.recid +'\', event);"'
						:
						'	onclick	 = "w2ui[\''+ this.name +'\'].click(\''+ record.recid +'\', event);"'
					 )
					: ''
				) +
				' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && record['style'] ? record['style'] : '') +'" '+
					(record['style'] ? 'custom_style="'+ record['style'] +'"' : '') +
				'>';
			if (this.show.lineNumbers) {
				rec_html += '<td id="grid_'+ this.name +'_cell_'+ ind +'_number" class="w2ui-col-number">'+
								(summary !== true ? '<div>'+ lineNum +'</div>' : '') +
							'</td>';
			}
			if (this.show.selectColumn) {
				rec_html +=
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_select" class="w2ui-grid-data w2ui-col-select" '+
						'		onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							(summary !== true ?
							'	<div>'+
							'		<input class="w2ui-grid-select-check" type="checkbox" tabIndex="-1"'+
							'			'+ (isRowSelected ? 'checked="checked"' : '') +
							'			onclick="var obj = w2ui[\''+ this.name +'\']; '+
							'				if (!obj.multiSelect) { obj.selectNone(); }'+
							'				if (this.checked) obj.select(\''+ record.recid + '\'); else obj.unselect(\''+ record.recid + '\'); '+
							'				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'	</div>'
							:
							'' ) +
						'</td>';
			}
			if (this.show.expandColumn) {
				var tmp_img = '';
				if (record.expanded === true)  tmp_img = '-'; else tmp_img = '+';
				if (record.expanded == 'none') tmp_img = '';
				if (record.expanded == 'spinner') tmp_img = '<div class="w2ui-spinner" style="width: 16px; margin: -2px 2px;"></div>';
				rec_html +=
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_expand" class="w2ui-grid-data w2ui-col-expand">'+
							(summary !== true ?
							'	<div ondblclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;" '+
							'			onclick="w2ui[\''+ this.name +'\'].toggle(\''+ record.recid +'\', event); '+
							'				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'		'+ tmp_img +' </div>'
							:
							'' ) +
						'</td>';
			}
			var col_ind = 0;
			while (true) {
				var col = this.columns[col_ind];
				if (col.hidden) { col_ind++; if (typeof this.columns[col_ind] == 'undefined') break; else continue; }
				var isChanged = record.changed && record.changes[col.field];
				var rec_cell  = this.getCellHTML(ind, col_ind, summary);
				var addStyle  = '';
				if (typeof col.render == 'string') {
					var tmp = col.render.toLowerCase().split(':');
					if ($.inArray(tmp[0], ['number', 'int', 'float', 'money', 'percent']) != -1) addStyle = 'text-align: right';
					if ($.inArray(tmp[0], ['date']) != -1) addStyle = 'text-align: right';
				}
				var isCellSelected = false;
				if (isRowSelected && $.inArray(col_ind, sel.columns[record.recid]) != -1) isCellSelected = true;
				rec_html += '<td class="w2ui-grid-data'+ (isCellSelected ? ' w2ui-selected' : '') + (isChanged ? ' w2ui-changed' : '') +'" col="'+ col_ind +'" '+
							'	style="'+ addStyle + ';' + (typeof col.style != 'undefined' ? col.style : '') +'" '+
										  (typeof col.attr != 'undefined' ? col.attr : '') +'>'+
								rec_cell +
							'</td>';
				col_ind++;
				if (typeof this.columns[col_ind] == 'undefined') break;
			}
			rec_html += '<td class="w2ui-grid-data-last"></td>';
			rec_html += '</tr>';
			return rec_html;
		},

		getCellHTML: function (ind, col_ind, summary) {
			var col  	= this.columns[col_ind];
			var record 	= (summary !== true ? this.records[ind] : this.summary[ind]);
			var data 	= this.parseField(record, col.field);
			var isChanged = record.changed && typeof record.changes[col.field] != 'undefined';
			if (isChanged) data = record.changes[col.field];
			// various renderers
			if (data == null || typeof data == 'undefined') data = '';
			if (typeof col.render != 'undefined') {
				if (typeof col.render == 'function') {
					data = col.render.call(this, record, ind, col_ind);
					if (data.length >= 4 && data.substr(0, 4) != '<div') data = '<div>' + data + '</div>';
				}
				if (typeof col.render == 'object')   data = '<div>' + col.render[data] + '</div>';
				if (typeof col.render == 'string') {
					var tmp = col.render.toLowerCase().split(':');
					var prefix = '';
					var suffix = '';
					if ($.inArray(tmp[0], ['number', 'int', 'float', 'money', 'percent']) != -1) {
						if (typeof tmp[1] == 'undefined' || !w2utils.isInt(tmp[1])) tmp[1] = 0;
						if (tmp[1] > 20) tmp[1] = 20;
						if (tmp[1] < 0)  tmp[1] = 0;
						if (tmp[0] == 'money')   { tmp[1] = 2; prefix = w2utils.settings.currencySymbol; }
						if (tmp[0] == 'percent') { suffix = '%'; if (tmp[1] !== '0') tmp[1] = 1; }
						if (tmp[0] == 'int')	 { tmp[1] = 0; }
						// format
						data = '<div>' + prefix + w2utils.formatNumber(Number(data).toFixed(tmp[1])) + suffix + '</div>';
					}
					if (tmp[0] == 'date') {
						if (typeof tmp[1] == 'undefined' || tmp[1] == '') tmp[1] = w2utils.settings.date_display;
						data = '<div>' + prefix + w2utils.formatDate(data, tmp[1]) + suffix + '</div>';
					}
					if (tmp[0] == 'age') {
						data = '<div>' + prefix + w2utils.age(data) + suffix + '</div>';
					}
				}
			} else {
				if (!this.show.recordTitles) {
					var data = '<div>'+ data +'</div>';
				} else {
					// title overwrite
					var title = String(data).replace(/"/g, "''");
					if (typeof col.title != 'undefined') {
						if (typeof col.title == 'function') title = col.title.call(this, record, ind, col_ind);
						if (typeof col.title == 'string')   title = col.title;
					}
					var data = '<div title="'+ title +'">'+ data +'</div>';
				}
			}
			if (data == null || typeof data == 'undefined') data = '';
			return data;
		},

		getFooterHTML: function () {
			return '<div>'+
				'	<div class="w2ui-footer-left"></div>'+
				'	<div class="w2ui-footer-right">'+ this.buffered +'</div>'+
				'	<div class="w2ui-footer-center"></div>'+
				'</div>';
		},

		status: function (msg) {
			if (typeof msg != 'undefined') {
				$('#grid_'+ this.name +'_footer').find('.w2ui-footer-left').html(msg);
			} else {
				// show number of selected
				var msgLeft = '';
				var sel = this.getSelection();
				if (sel.length > 0) {
					msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' ' + w2utils.lang('selected');
					var tmp = sel[0];
					if (typeof tmp == 'object') tmp = tmp.recid + ', '+ w2utils.lang('Column') +': '+ tmp.column;
					if (sel.length == 1) msgLeft = w2utils.lang('Record ID') + ': '+ tmp + ' ';
				}
				$('#grid_'+ this.name +'_footer .w2ui-footer-left').html(msgLeft);
				// toolbar
				if (sel.length == 1) this.toolbar.enable('edit'); else this.toolbar.disable('edit');
				if (sel.length >= 1) this.toolbar.enable('delete'); else this.toolbar.disable('delete');
			}
		},

		lock: function (msg, showSpinner) {
			var box  = $(this.box).find('> div:first-child');
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(box);
			setTimeout(function () { w2utils.lock.apply(window, args); }, 10);
		},

		unlock: function () {
			var box = this.box;
			setTimeout(function () { w2utils.unlock(box); }, 25); // needed timer so if server fast, it will not flash
		},

		parseField: function (obj, field) {
			var val = '';
			try { // need this to make sure no error in fields
				val = obj;
				var tmp = String(field).split('.');
				for (var i in tmp) {
					val = val[tmp[i]];
				}
			} catch (event) {
				val = '';
			}
			return val;
		}
	};

	$.extend(w2grid.prototype, w2utils.event);
	w2obj.grid = w2grid;
})();
/************************************************************************
*	Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*	- Following objects defined
*		- w2layout		- layout widget
*		- $().w2layout	- jQuery wrapper
*	- Dependencies: jQuery, w2utils, w2toolbar, w2tabs
*
* == NICE TO HAVE ==
*	- onResize for the panel
*	- problem with layout.html (see in 1.3)
*	- add more panel title positions (left=rotated, right=rotated, bottom)
*	- add resizer click, dblclick events, add resizer style ...
*
* == 1.4 changes
*	- deleted getSelection().removeAllRanges() - see https://github.com/vitmalina/w2ui/issues/323
*	- added panel title
*	- added panel.maxSize property
*
************************************************************************/

(function () {
	var w2layout = function (options) {
		this.box		= null;		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.panels		= [];
		this.tmp		= {};

		this.padding	= 1;		// panel padding
		this.resizer	= 4;		// resizer width or height
		this.style		= '';

		this.onShow		= null;
		this.onHide		= null;
		this.onResizing = null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null;

		$.extend(true, this, w2obj.layout, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2layout = function(method) {
		if (typeof method === 'object' || !method ) {
			// check name parameter
			if (!$.fn.w2checkNameParam(method, 'w2layout')) return;
			var panels = method.panels;
			var object = new w2layout(method);
			$.extend(object, { handlers: [], panels: [] });
			// add defined panels panels
			for (var p in panels) {
				object.panels[p] = $.extend(true, {}, w2layout.prototype.panel, panels[p]);
				if ($.isPlainObject(object.panels[p].tabs) || $.isArray(object.panels[p].tabs)) initTabs(object, panels[p].type);
				if ($.isPlainObject(object.panels[p].toolbar) || $.isArray(object.panels[p].toolbar)) initToolbar(object, panels[p].type);
			}
			// add all other panels
			for (var p1 in { 'top':'', 'left':'', 'main':'', 'preview':'', 'right':'', 'bottom':'' }) {
				if (object.get(p1) !== null) continue;
				object.panels[p1] = $.extend(true, {}, w2layout.prototype.panel, { type: p1, hidden: true, size: 50 });
			}

			if ($(this).length > 0) {
				object.render($(this)[0]);
			}
			w2ui[object.name] = object;
			return object;

		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2layout' );
		}

		function initTabs(object, panel, tabs) {
			var pan = object.get(panel);
			if (pan !== null && typeof tabs == 'undefined') tabs = pan.tabs;
			if (pan === null || tabs === null) return false;
			// instanciate tabs
			if ($.isArray(tabs)) tabs = { tabs: tabs };
			$().w2destroy(object.name + '_' + panel + '_tabs'); // destroy if existed
			pan.tabs = $().w2tabs($.extend({}, tabs, { owner: object, name: object.name + '_' + panel + '_tabs' }));
			pan.show.tabs = true;
			return true;
		}

		function initToolbar(object, panel, toolbar) {
			var pan = object.get(panel);
			if (pan !== null && typeof toolbar == 'undefined') toolbar = pan.toolbar;
			if (pan === null || toolbar === null) return false;
			// instanciate toolbar
			if ($.isArray(toolbar)) toolbar = { items: toolbar };
			$().w2destroy(object.name + '_' + panel + '_toolbar'); // destroy if existed
			pan.toolbar = $().w2toolbar($.extend({}, toolbar, { owner: object, name: object.name + '_' + panel + '_toolbar' }));
			pan.show.toolbar = true;
			return true;
		}
	};

	// ====================================================
	// -- Implementation of core functionality

	w2layout.prototype = {
		// default setting for a panel
		panel: {
			title		: '',
			type		: null,		// left, right, top, bottom
			size		: 100,		// width or height depending on panel name
			minSize		: 20,
			maxSize		: false,
			hidden		: false,
			resizable	: false,
			overflow	: 'auto',
			style		: '',
			content		: '',		// can be String or Object with .render(box) method
			tabs		: null,
			toolbar		: null,
			width		: null,		// read only
			height		: null,		// read only
			show : {
				toolbar	: false,
				tabs	: false
			},
			onRefresh	: null,
			onShow		: null,
			onHide		: null
		},

		// alias for content
		html: function (panel, data, transition) {
			return this.content(panel, data, transition);
		},

		content: function (panel, data, transition) {
			var obj = this;
			var p = this.get(panel);
			if (panel == 'css') {
				$('#layout_'+ obj.name +'_panel_css').html('<style>'+ data +'</style>');
				return true;
			}
			if (p === null) return false;
			if ($('#layout_'+ this.name + '_panel2_'+ p.type).length > 0) return false;
			$('#layout_'+ this.name + '_panel_'+ p.type).scrollTop(0);
			if (data === null || typeof data == 'undefined') {
				return p.content;
			} else {
				if (data instanceof jQuery) {
					console.log('ERROR: You can not pass jQuery object to w2layout.content() method');
					return false;
				}
				// remove foreign classes and styles
				var tmp = $('#'+ 'layout_'+ this.name + '_panel_'+ panel + ' > .w2ui-panel-content');
				var panelTop = $(tmp).position().top;
				tmp.attr('class', 'w2ui-panel-content');
				if (tmp.length > 0 && typeof p.style != 'undefined') tmp[0].style.cssText = p.style;
				if (p.content === '') {
					p.content = data;
					if (!p.hidden) this.refresh(panel);
				} else {
					p.content = data;
					if (!p.hidden) {
						if (transition !== null && transition !== '' && typeof transition != 'undefined') {
							// apply transition
							var nm   = 'layout_'+ this.name + '_panel_'+ p.type;
							var div1 = $('#'+ nm + ' > .w2ui-panel-content');
							div1.after('<div class="w2ui-panel-content new-panel" style="'+ div1[0].style.cssText +'"></div>');
							var div2 = $('#'+ nm + ' > .w2ui-panel-content.new-panel');
							div1.css('top', panelTop);
							div2.css('top', panelTop);
							if (typeof data == 'object') {
								data.box = div2[0]; // do not do .render(box);
								data.render();
							} else {
								div2.html(data);
							}
							w2utils.transition(div1[0], div2[0], transition, function () {
								div1.remove();
								div2.removeClass('new-panel');
								div2.css('overflow', p.overflow);
								// IE Hack
								if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
							});
						} else {
							if (!p.hidden) this.refresh(panel);
						}
					}
				}
			}
			// IE Hack
			if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
			return true;
		},

		load: function (panel, url, transition, onLoad) {
			var obj = this;
			if (panel == 'css') {
				$.get(url, function (data, status, xhr) {
					obj.content(panel, xhr.responseText);
					if (onLoad) onLoad();
				});
				return true;
			}
			if (this.get(panel) !== null) {
				$.get(url, function (data, status, xhr) {
					obj.content(panel, xhr.responseText, transition);
					if (onLoad) onLoad();
					// IE Hack
					if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
				});
				return true;
			}
			return false;
		},

		sizeTo: function (panel, size) {
			var obj = this;
			var pan = obj.get(panel);
			if (pan === null) return false;
			// resize
			$(obj.box).find(' > div .w2ui-panel').css({
				'-webkit-transition': '.35s',
				'-moz-transition'	: '.35s',
				'-ms-transition'	: '.35s',
				'-o-transition'		: '.35s'
			});
			setTimeout(function () {
				obj.set(panel, { size: size });
			}, 1);
			// clean
			setTimeout(function () {
				$(obj.box).find(' > div .w2ui-panel').css({
					'-webkit-transition': '0s',
					'-moz-transition'	: '0s',
					'-ms-transition'	: '0s',
					'-o-transition'		: '0s'
				});
				obj.resize();
			}, 500);
			return true;
		},

		show: function (panel, immediate) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'show', target: panel, object: this.get(panel), immediate: immediate });
			if (eventData.isCancelled === true) return false;

			var p = obj.get(panel);
			if (p === null) return false;
			p.hidden = false;
			if (immediate === true) {
				$('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '1' });
				if (p.resizabled) $('#layout_'+ obj.name +'_resizer_'+panel).show();
				obj.trigger($.extend(eventData, { phase: 'after' }));
				obj.resize();
			} else {
				if (p.resizabled) $('#layout_'+ obj.name +'_resizer_'+panel).show();
				// resize
				$('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0' });
				$(obj.box).find(' > div .w2ui-panel').css({
					'-webkit-transition': '.2s',
					'-moz-transition'	: '.2s',
					'-ms-transition'	: '.2s',
					'-o-transition'		: '.2s'
				});
				setTimeout(function () { obj.resize(); }, 1);
				// show
				setTimeout(function() {
					$('#layout_'+ obj.name +'_panel_'+ panel).css({ 'opacity': '1' });
				}, 250);
				// clean
				setTimeout(function () {
					$(obj.box).find(' > div .w2ui-panel').css({
						'-webkit-transition': '0s',
						'-moz-transition'	: '0s',
						'-ms-transition'	: '0s',
						'-o-transition'		: '0s'
					});
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.resize();
				}, 500);
			}
			return true;
		},

		hide: function (panel, immediate) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'hide', target: panel, object: this.get(panel), immediate: immediate });
			if (eventData.isCancelled === true) return false;

			var p = obj.get(panel);
			if (p === null) return false;
			p.hidden = true;
			if (immediate === true) {
				$('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0'	});
				$('#layout_'+ obj.name +'_resizer_'+panel).hide();
				obj.trigger($.extend(eventData, { phase: 'after' }));
				obj.resize();
			} else {
				$('#layout_'+ obj.name +'_resizer_'+panel).hide();
				// hide
				$(obj.box).find(' > div .w2ui-panel').css({
					'-webkit-transition': '.2s',
					'-moz-transition'	: '.2s',
					'-ms-transition'	: '.2s',
					'-o-transition'		: '.2s'
				});
				$('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0'	});
				setTimeout(function () { obj.resize(); }, 1);
				// clean
				setTimeout(function () {
					$(obj.box).find(' > div .w2ui-panel').css({
						'-webkit-transition': '0s',
						'-moz-transition'	: '0s',
						'-ms-transition'	: '0s',
						'-o-transition'		: '0s'
					});
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.resize();
				}, 500);
			}
			return true;
		},

		toggle: function (panel, immediate) {
			var p = this.get(panel);
			if (p === null) return false;
			if (p.hidden) return this.show(panel, immediate); else return this.hide(panel, immediate);
		},

		set: function (panel, options) {
			var obj = this.get(panel, true);
			if (obj === null) return false;
			$.extend(this.panels[obj], options);
			this.refresh(panel);
			this.resize(); // resize is needed when panel size is changed
			return true;
		},

		get: function (panel, returnIndex) {
			var obj = null;
			for (var p in this.panels) {
				if (this.panels[p].type == panel) {
					if (returnIndex === true) return p; else return this.panels[p];
				}
			}
			return null;
		},

		el: function (panel) {
			var el = $('#layout_'+ this.name +'_panel_'+ panel +' .w2ui-panel-content');
			if (el.length != 1) return null;
			return el[0];
		},

		hideToolbar: function (panel) {
			var pan = this.get(panel);
			if (!pan) return;
			pan.show.toolbar = false;
			$('#layout_'+ this.name +'_panel_'+ panel +' > .w2ui-panel-toolbar').hide();
			this.resize();
		},

		showToolbar: function (panel) {
			var pan = this.get(panel);
			if (!pan) return;
			pan.show.toolbar = true;
			$('#layout_'+ this.name +'_panel_'+ panel +' > .w2ui-panel-toolbar').show();
			this.resize();
		},

		toggleToolbar: function (panel) {
			var pan = this.get(panel);
			if (!pan) return;
			if (pan.show.toolbar) this.hideToolbar(panel); else this.showToolbar(panel);
		},

		hideTabs: function (panel) {
			var pan = this.get(panel);
			if (!pan) return;
			pan.show.tabs = false;
			$('#layout_'+ this.name +'_panel_'+ panel +' > .w2ui-panel-tabs').hide();
			this.resize();
		},

		showTabs: function (panel) {
			var pan = this.get(panel);
			if (!pan) return;
			pan.show.tabs = true;
			$('#layout_'+ this.name +'_panel_'+ panel +' > .w2ui-panel-tabs').show();
			this.resize();
		},

		toggleTabs: function (panel) {
			var pan = this.get(panel);
			if (!pan) return;
			if (pan.show.tabs) this.hideTabs(panel); else this.showTabs(panel);
		},

		render: function (box) {
			var obj = this;
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			var time = (new Date()).getTime();
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'render', target: obj.name, box: box });
			if (eventData.isCancelled === true) return false;

			if (typeof box != 'undefined' && box !== null) {
				if ($(obj.box).find('#layout_'+ obj.name +'_panel_main').length > 0) {
					$(obj.box)
						.removeAttr('name')
						.removeClass('w2ui-layout')
						.html('');
				}
				obj.box = box;
			}
			if (!obj.box) return false;
			$(obj.box)
				.attr('name', obj.name)
				.addClass('w2ui-layout')
				.html('<div></div>');
			if ($(obj.box).length > 0) $(obj.box)[0].style.cssText += obj.style;
			// create all panels
			var tmp = ['top', 'left', 'main', 'preview', 'right', 'bottom'];
			for (var t in tmp) {
				var pan  = obj.get(tmp[t]);
				var html =  '<div id="layout_'+ obj.name + '_panel_'+ tmp[t] +'" class="w2ui-panel">'+
							'	<div class="w2ui-panel-title"></div>'+
							'	<div class="w2ui-panel-tabs"></div>'+
							'	<div class="w2ui-panel-toolbar"></div>'+
							'	<div class="w2ui-panel-content"></div>'+
							'</div>'+
							'<div id="layout_'+ obj.name + '_resizer_'+ tmp[t] +'" class="w2ui-resizer"></div>';
				$(obj.box).find(' > div').append(html);
				// tabs are rendered in refresh()
			}
			$(obj.box).find(' > div')
				.append('<div id="layout_'+ obj.name + '_panel_css" style="position: absolute; top: 10000px;"></div');
			obj.refresh(); // if refresh is not called here, the layout will not be available right after initialization
			// process event
			obj.trigger($.extend(eventData, { phase: 'after' }));
			// reinit events
			setTimeout(function () { // needed this timeout to allow browser to render first if there are tabs or toolbar
				obj.resize();
				initEvents();
			}, 0);
			return (new Date()).getTime() - time;

			function initEvents() {
				obj.tmp.events = {
					resize : function (event) {
						w2ui[obj.name].resize();
					},
					resizeStart : resizeStart,
					mousemove	: resizeMove,
					mouseup		: resizeStop
				};
				$(window).on('resize', obj.tmp.events.resize);
				$(document).on('mousemove', obj.tmp.events.mousemove);
				$(document).on('mouseup', obj.tmp.events.mouseup);
			}

			function resizeStart(type, evnt) {
				if (!obj.box) return;
				if (!evnt) evnt = window.event;
				if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
				obj.tmp.resize = {
					type	: type,
					x		: evnt.screenX,
					y		: evnt.screenY,
					div_x	: 0,
					div_y	: 0,
					value	: 0
				};				
				// lock all panels
				var panels = ['left', 'right', 'top', 'bottom', 'preview', 'main'];
				for (var p in panels) obj.lock(panels[p], { opacity: 0 }); 

				if (type == 'left' || type == 'right') {
					obj.tmp.resize.value = parseInt($('#layout_'+ obj.name + '_resizer_'+ type)[0].style.left);
				}
				if (type == 'top' || type == 'preview' || type == 'bottom') {
					obj.tmp.resize.value = parseInt($('#layout_'+ obj.name + '_resizer_'+ type)[0].style.top);
				}
			}

			function resizeStop(evnt) {
				if (!obj.box) return;
				if (!evnt) evnt = window.event;
				if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
				if (typeof obj.tmp.resize == 'undefined') return;
				// unlock all panels
				var panels = ['left', 'right', 'top', 'bottom', 'preview', 'main'];
				for (var p in panels) obj.unlock(panels[p]);
				// set new size
				if (obj.tmp.div_x !== 0 || obj.tmp.resize.div_y !== 0) { // only recalculate if changed
					var ptop	= obj.get('top');
					var pbottom	= obj.get('bottom');
					var panel	= obj.get(obj.tmp.resize.type);
					var height	= parseInt($(obj.box).height());
					var width	= parseInt($(obj.box).width());
					var str		= String(panel.size);
					var ns, nd;
					switch (obj.tmp.resize.type) {
						case 'top':
							ns = parseInt(panel.sizeCalculated) + obj.tmp.resize.div_y;
							nd = 0;
							break;
						case 'bottom':
							ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.div_y;
							nd = 0;
							break;
						case 'preview':
							ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.div_y;
							nd = (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) +
								(pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
							break;
						case 'left':
							ns = parseInt(panel.sizeCalculated) + obj.tmp.resize.div_x;
							nd = 0;
							break;
						case 'right':
							ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.div_x;
							nd = 0;
							break;
					}
					// set size
					if (str.substr(str.length-1) == '%') {
						panel.size = Math.floor(ns * 100 /
							(panel.type == 'left' || panel.type == 'right' ? width : height - nd) * 100) / 100 + '%';
					} else {
						panel.size = ns;
					}
					obj.resize();
				}
				$('#layout_'+ obj.name + '_resizer_'+ obj.tmp.resize.type).removeClass('active');
				delete obj.tmp.resize;
			}

			function resizeMove(evnt) {
				if (!obj.box) return;
				if (!evnt) evnt = window.event;
				if (typeof obj.tmp.resize == 'undefined') return;
				var panel = obj.get(obj.tmp.resize.type);
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'resizing', target: obj.tmp.resize.type, object: panel, originalEvent: evnt });
				if (eventData.isCancelled === true) return false;

				var p			= $('#layout_'+ obj.name + '_resizer_'+ obj.tmp.resize.type);
				var resize_x	= (evnt.screenX - obj.tmp.resize.x);
				var resize_y	= (evnt.screenY - obj.tmp.resize.y);
				var mainPanel	= obj.get('main');

				if (!p.hasClass('active')) p.addClass('active');

				switch(obj.tmp.resize.type) {
					case 'left':
						if (panel.minSize - resize_x > panel.width) {
							resize_x = panel.minSize - panel.width;
						}					
						if (panel.maxSize && (panel.width + resize_x > panel.maxSize)) {
							resize_x = panel.maxSize - panel.width;
						}						
						if (mainPanel.minSize + resize_x > mainPanel.width) {
							resize_x = mainPanel.width - mainPanel.minSize;
						}
						break;

					case 'right': 
						if (panel.minSize + resize_x > panel.width) {
							resize_x = panel.width - panel.minSize;
						}					
						if (panel.maxSize && (panel.width - resize_x > panel.maxSize)) {
							resize_x = panel.width - panel.maxSize;
						}					
						if (mainPanel.minSize - resize_x > mainPanel.width) {
							resize_x = mainPanel.minSize - mainPanel.width;
						}
						break;

					case 'top':
						if (panel.minSize - resize_y > panel.height) {
							resize_y = panel.minSize - panel.height;
						}						
						if (panel.maxSize && (panel.height + resize_y > panel.maxSize)) {
							resize_y = panel.maxSize - panel.height;
						}						
						if (mainPanel.minSize + resize_y > mainPanel.height) {
							resize_y = mainPanel.height - mainPanel.minSize;
						}
						break;

					case 'preview':
					case 'bottom':
						if (panel.minSize + resize_y > panel.height) {
							resize_y = panel.height - panel.minSize;
						}					
						if (panel.maxSize && (panel.height - resize_y > panel.maxSize)) {
							resize_y = panel.height - panel.maxSize;
						}					
						if (mainPanel.minSize - resize_y > mainPanel.height) {
							resize_y = mainPanel.minSize - mainPanel.height;
						}
						break;
				}
				
				obj.tmp.resize.div_x = resize_x;
				obj.tmp.resize.div_y = resize_y;

				switch(obj.tmp.resize.type) {
					case 'top':
					case 'preview':
					case 'bottom':
						obj.tmp.resize.div_x = 0;
						if (p.length > 0) p[0].style.top = (obj.tmp.resize.value + obj.tmp.resize.div_y) + 'px';
						break;

					case 'left':
					case 'right':
						obj.tmp.resize.div_y = 0;
						if (p.length > 0) p[0].style.left = (obj.tmp.resize.value + obj.tmp.resize.div_x) + 'px';
						break;
				}
				// event after				
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		refresh: function (panel) {
			var obj = this;
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (typeof panel == 'undefined') panel = null;
			var time = (new Date()).getTime();
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'refresh', target: (typeof panel != 'undefined' ? panel : obj.name), object: obj.get(panel) });
			if (eventData.isCancelled === true) return;

			// obj.unlock(panel);
			if (panel !== null && typeof panel != 'undefined') {
				var p = obj.get(panel);
				if (p === null) return;
				// apply properties to the panel
				var el = $('#layout_'+ obj.name +'_panel_'+ panel).css({ display: p.hidden ? 'none' : 'block' });
				el = el.find('.w2ui-panel-content');
				if (el.length > 0) el.css('overflow', p.overflow)[0].style.cssText += ';' + p.style;
				if (p.resizable === true) {
					$('#layout_'+ this.name +'_resizer_'+ panel).show();
				} else {
					$('#layout_'+ this.name +'_resizer_'+ panel).hide();
				}
				// insert content
				if (typeof p.content == 'object' && p.content.render) {
					p.content.box = $('#layout_'+ obj.name + '_panel_'+ p.type +' > .w2ui-panel-content')[0];
					p.content.render(); // do not do .render(box);
				} else {
					$('#layout_'+ obj.name + '_panel_'+ p.type +' > .w2ui-panel-content').html(p.content);
				}
				// if there are tabs and/or toolbar - render it
				var tmp;
				tmp = $(obj.box).find('#layout_'+ obj.name + '_panel_'+ p.type +' .w2ui-panel-tabs');
				if (p.show.tabs) {
					if (tmp.find('[name='+ p.tabs.name +']').length === 0 && p.tabs !== null) tmp.w2render(p.tabs); else p.tabs.refresh();
				} else {
					tmp.html('').removeClass('w2ui-tabs').hide();
				}
				tmp = $(obj.box).find('#layout_'+ obj.name + '_panel_'+ p.type +' .w2ui-panel-toolbar');
				if (p.show.toolbar) {
					if (tmp.find('[name='+ p.toolbar.name +']').length === 0 && p.toolbar !== null) tmp.w2render(p.toolbar); else p.toolbar.refresh();
				} else {
					tmp.html('').removeClass('w2ui-toolbar').hide();
				}
				// show title
				tmp = $(obj.box).find('#layout_'+ obj.name + '_panel_'+ p.type +' .w2ui-panel-title');
				if (p.title) {
					tmp.html(p.title);
				} else {
					tmp.html('').hide();
				}
			} else {
				if ($('#layout_' +obj.name +'_panel_main').length <= 0) {
					obj.render();
					return;
				}
				obj.resize();
				// refresh all of them
				for (var p1 in this.panels) { obj.refresh(this.panels[p1].type); }
			}
			obj.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		resize: function () {
			// if (window.getSelection) window.getSelection().removeAllRanges();	// clear selection
			if (!this.box) return false;
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, panel: this.tmp.resizing });
			if (eventData.isCancelled === true) return false;
			if (this.padding < 0) this.padding = 0;

			// layout itself
			var width  = parseInt($(this.box).width());
			var height = parseInt($(this.box).height());
			$(this.box).find(' > div').css({
				width	: width + 'px',
				height	: height + 'px'
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
			var sprev   = (pprev !== null && pprev.hidden !== true ? true : false);
			var sleft   = (pleft !== null && pleft.hidden !== true ? true : false);
			var sright  = (pright !== null && pright.hidden !== true ? true : false);
			var stop    = (ptop !== null && ptop.hidden !== true ? true : false);
			var sbottom = (pbottom !== null && pbottom.hidden !== true ? true : false);
			var l, t, w, h, e;
			// calculate %
			for (var p in { 'top':'', 'left':'', 'right':'', 'bottom':'', 'preview':'' }) {
				var tmp = this.get(p);
				var str = String(tmp.size);
				if (tmp && str.substr(str.length-1) == '%') {
					var tmph = height;
					if (tmp.type == 'preview') {
						tmph = tmph -
							(ptop && !ptop.hidden ? ptop.sizeCalculated : 0) -
							(pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
					}
					tmp.sizeCalculated = parseInt((tmp.type == 'left' || tmp.type == 'right' ? width : tmph) * parseFloat(tmp.size) / 100);
				} else {
					tmp.sizeCalculated = parseInt(tmp.size);
				}
				if (tmp.sizeCalculated < parseInt(tmp.minSize)) tmp.sizeCalculated = parseInt(tmp.minSize);
			}
			// top if any
			if (ptop !== null && ptop.hidden !== true) {
				l = 0;
				t = 0;
				w = width;
				h = ptop.sizeCalculated;
				$('#layout_'+ this.name +'_panel_top').css({
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
					t = ptop.sizeCalculated - (this.padding === 0 ? this.resizer : 0);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_top').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('top', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_top').hide();
			}
			// left if any
			if (pleft !== null && pleft.hidden !== true) {
				l = 0;
				t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
				w = pleft.sizeCalculated;
				h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
						(sbottom ? pbottom.sizeCalculated + this.padding : 0);
				e = $('#layout_'+ this.name +'_panel_left');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				e.css({
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
					l = pleft.sizeCalculated - (this.padding === 0 ? this.resizer : 0);
					w = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_left').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ew-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('left', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_left').hide();
				$('#layout_'+ this.name +'_resizer_left').hide();
			}
			// right if any
			if (pright !== null && pright.hidden !== true) {
				l = width - pright.sizeCalculated;
				t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
				w = pright.sizeCalculated;
				h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
					(sbottom ? pbottom.sizeCalculated + this.padding : 0);
				$('#layout_'+ this.name +'_panel_right').css({
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
					l = l - this.padding;
					w = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_right').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ew-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('right', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_right').hide();
			}
			// bottom if any
			if (pbottom !== null && pbottom.hidden !== true) {
				l = 0;
				t = height - pbottom.sizeCalculated;
				w = width;
				h = pbottom.sizeCalculated;
				$('#layout_'+ this.name +'_panel_bottom').css({
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
					t = t - (this.padding === 0 ? 0 : this.padding);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_bottom').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('bottom', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_bottom').hide();
			}
			// main - always there
			l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0);
			t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
			w = width  - (sleft ? pleft.sizeCalculated + this.padding : 0) -
				(sright ? pright.sizeCalculated + this.padding: 0);
			h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
				(sbottom ? pbottom.sizeCalculated + this.padding : 0) -
				(sprev ? pprev.sizeCalculated + this.padding : 0);
			e = $('#layout_'+ this.name +'_panel_main');
			if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
			e.css({
				'display': 'block',
				'left': l + 'px',
				'top': t + 'px',
				'width': w + 'px',
				'height': h + 'px'
			});
			pmain.width  = w;
			pmain.height = h;

			// preview if any
			if (pprev !== null && pprev.hidden !== true) {
				l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0);
				t = height - (sbottom ? pbottom.sizeCalculated + this.padding : 0) - pprev.sizeCalculated;
				w = width  - (sleft ? pleft.sizeCalculated + this.padding : 0) -
					(sright ? pright.sizeCalculated + this.padding : 0);
				h = pprev.sizeCalculated;
				e = $('#layout_'+ this.name +'_panel_preview');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				e.css({
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
					t = t - (this.padding === 0 ? 0 : this.padding);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_preview').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].tmp.events.resizeStart('preview', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_preview').hide();
			}

			// display tabs and toolbar if needed
			for (var p1 in { 'top':'', 'left':'', 'main':'', 'preview':'', 'right':'', 'bottom':'' }) {
				var pan = this.get(p1);
				var tmp2 = '#layout_'+ this.name +'_panel_'+ p1 +' > .w2ui-panel-';
				var tabHeight = 0;
				if (pan.show.tabs) {
					if (pan.tabs !== null && w2ui[this.name +'_'+ p1 +'_tabs']) w2ui[this.name +'_'+ p1 +'_tabs'].resize();
					tabHeight += w2utils.getSize($(tmp2 + 'tabs').css({ display: 'block' }), 'height');
				}
				if (pan.show.toolbar) {
					if (pan.toolbar !== null && w2ui[this.name +'_'+ p1 +'_toolbar']) w2ui[this.name +'_'+ p1 +'_toolbar'].resize();
					tabHeight += w2utils.getSize($(tmp2 + 'toolbar').css({ top: tabHeight + 'px', display: 'block' }), 'height');
				}
				if (pan.title){
					tabHeight += w2utils.getSize($(tmp2+'title').css({top: tabHeight+'px', display: 'block'}),'height');
				}
				$(tmp2 + 'content').css({ display: 'block' }).css({ top: tabHeight + 'px' });
			}
			// send resize to all objects
			clearTimeout(this._resize_timer);
			this._resize_timer = setTimeout(function () {
				for (var e in w2ui) {
					if (typeof w2ui[e].resize == 'function') {
						// sent to all none-layouts
						if (w2ui[e].panels == 'undefined') w2ui[e].resize();
						// only send to nested layouts
						var parent = $(w2ui[e].box).parents('.w2ui-layout');
						if (parent.length > 0 && parent.attr('name') == obj.name) w2ui[e].resize();
					}
				}
			}, 100);
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
			if (eventData.isCancelled === true) return false;
			if (typeof w2ui[this.name] == 'undefined') return false;
			// clean up
			if ($(this.box).find('#layout_'+ this.name +'_panel_main').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-layout')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));

			if (this.tmp.events && this.tmp.events.resize)		$(window).off('resize', this.tmp.events.resize);
			if (this.tmp.events && this.tmp.events.mousemove)	$(document).off('mousemove', this.tmp.events.mousemove);
			if (this.tmp.events && this.tmp.events.mouseup)		$(document).off('mouseup', this.tmp.events.mouseup);

			return true;
		},

		lock: function (panel, msg, showSpinner) {
			if ($.inArray(String(panel), ['left', 'right', 'top', 'bottom', 'preview', 'main']) == -1) {
				console.log('ERROR: First parameter needs to be the a valid panel name.');
				return;
			}
			var args = Array.prototype.slice.call(arguments, 0);
			args[0]  = '#layout_'+ this.name + '_panel_' + panel;
			w2utils.lock.apply(window, args);
		},

		unlock: function (panel) {
			if ($.inArray(String(panel), ['left', 'right', 'top', 'bottom', 'preview', 'main']) == -1) {
				console.log('ERROR: First parameter needs to be the a valid panel name.');
				return;
			}
			var nm = '#layout_'+ this.name + '_panel_' + panel;
			w2utils.unlock(nm);
		}
	};

	$.extend(w2layout.prototype, w2utils.event);
	w2obj.layout = w2layout;
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2popup	 	- popup widget
*		- $().w2popup	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
* == NICE TO HAVE ==
*	- when maximized, align the slide down message
*	- bug: after transfer to another content, message does not work
* 	- transition should include title, body and buttons, not just body
*	- add lock method() to lock popup content
*
* == 1.4 changes
*	- deleted getSelection().removeAllRanges() - see https://github.com/vitmalina/w2ui/issues/323
*
************************************************************************/

var w2popup = {};

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
		method = method.toLowerCase();
		if (method == 'load' && typeof options == 'string') options = { url: options };
		if (method == 'open' && typeof options.url != 'undefined') method = 'load';
		if (typeof options == 'undefined') options = {};
		// load options from markup
		var dlgOptions = {};
		if ($(this).length > 0 ) {
			if ($(this).find('div[rel=title], div[rel=body], div[rel=buttons]').length > 0) {
				if ($(this).find('div[rel=title]').length > 0) {
					dlgOptions['title'] = $(this).find('div[rel=title]').html();
				}
				if ($(this).find('div[rel=body]').length > 0) {
					dlgOptions['body']  = $(this).find('div[rel=body]').html();
					dlgOptions['style'] = $(this).find('div[rel=body]')[0].style.cssText;
				}
				if ($(this).find('div[rel=buttons]').length > 0) {
					dlgOptions['buttons'] 	= $(this).find('div[rel=buttons]').html();
				}
			} else {
				dlgOptions['title']  = '&nbsp;';
				dlgOptions['body']   = $(this).html();
			}
			if (parseInt($(this).css('width')) != 0)  dlgOptions['width']  = parseInt($(this).css('width'));
			if (parseInt($(this).css('height')) != 0) dlgOptions['height'] = parseInt($(this).css('height'));
		}
		// show popup
		return w2popup[method]($.extend({}, dlgOptions, options));
	};
	
	// ====================================================
	// -- Implementation of core functionality (SINGELTON)
	
	w2popup = {	
		defaults: {
			title			: '',
			body			: '',
			buttons			: '',
			style			: '',
			color			: '#000',
			opacity			: 0.4,
			speed			: 0.3,
			modal			: false,
			maximized		: false,
			keyboard		: true,		// will close popup on esc if not modal
			width			: 500,
			height			: 300,
			showClose		: true,
			showMax			: false,
			transition		: null
		},
		handlers	: [],
		onOpen		: null,
		onClose		: null,
		onMax		: null,
		onMin		: null,
		onKeydown   : null,

		open: function (options) {
			var obj = this;
			// get old options and merge them
			var old_options = $('#w2ui-popup').data('options');
			var options = $.extend({}, this.defaults, { body : '' }, old_options, options);
			// if new - reset event handlers
			if ($('#w2ui-popup').length == 0) {
				w2popup.handlers	 = [];
				w2popup.onMax 	 	= null;
				w2popup.onMin 	 	= null;
				w2popup.onOpen	 	= null;
				w2popup.onClose	 	= null;
				w2popup.onKeydown	= null;
			}
			if (options.onOpen)		w2popup.onOpen		= options.onOpen;
			if (options.onClose)	w2popup.onClose		= options.onClose;
			if (options.onMax)		w2popup.onMax		= options.onMax;
			if (options.onMin)		w2popup.onMin		= options.onMin;
			if (options.onKeydown)	w2popup.onKeydown	= options.onKeydown;

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
			var top  = ((parseInt(height) - parseInt(options.height)) / 2) * 0.6;
			var left = (parseInt(width) - parseInt(options.width)) / 2;
			// check if message is already displayed
			if ($('#w2ui-popup').length == 0) {
				// trigger event
				var eventData = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: false });
				if (eventData.isCancelled === true) return;			
				// output message
				w2popup.lockScreen(options);			
				var msg = '<div id="w2ui-popup" class="w2ui-popup" style="'+
								'width: '+ parseInt(options.width) +'px; height: '+ parseInt(options.height) +'px; opacity: 0; '+
								'-webkit-transform: scale(0.8); -moz-transform: scale(0.8); -ms-transform: scale(0.8); -o-transform: scale(0.8); '+
								'left: '+ left +'px; top: '+ top +'px;">';
				if (options.title != '') { 
					msg +='<div class="w2ui-msg-title">'+
						  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="w2popup.close(); '+
						  					   'if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">Close</div>' : '')+ 
						  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="w2popup.toggle()">Max</div>' : '') + 
							  options.title +
						  '</div>'; 
				}
				msg += '<div class="w2ui-box1" style="'+(options.title == '' ? 'top: 0px !important;' : '')+(options.buttons == '' ? 'bottom: 0px !important;' : '')+'">';
				msg += '<div class="w2ui-msg-body'+ (!options.title != '' ? ' w2ui-msg-no-title' : '') + (!options.buttons != '' ? ' w2ui-msg-no-buttons' : '') +'" style="'+ options.style +'">'+ options.body +'</div>';
				msg += '</div>';
				msg += '<div class="w2ui-box2" style="'+(options.title == '' ? 'top: 0px !important;' : '')+(options.buttons == '' ? 'bottom: 0px !important;' : '')+'">';
				msg += '<div class="w2ui-msg-body'+ (!options.title != '' ? ' w2ui-msg-no-title' : '') + (!options.buttons != '' ? ' w2ui-msg-no-buttons' : '') +'" style="'+ options.style +'"></div>';
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
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
				}, options.speed * 1000);
			} else {
				// trigger event
				var eventData = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: true });
				if (eventData.isCancelled === true) return;			
				// check if size changed
				if (typeof old_options == 'undefined' || old_options['width'] != options['width'] || old_options['height'] != options['height']) {
					$('#w2ui-panel').remove();
					w2popup.resize(options.width, options.height);
				}
				// show new items
				var body = $('#w2ui-popup .w2ui-box2 > .w2ui-msg-body').html(options.body);
				if (body.length > 0) body[0].style.cssText = options.style;
				$('#w2ui-popup .w2ui-msg-buttons').html(options.buttons);
				$('#w2ui-popup .w2ui-msg-title').html(
					  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="w2popup.close()">Close</div>' : '')+ 
					  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="w2popup.max()">Max</div>' : '') + 
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
					obj.trigger($.extend(eventData, { phase: 'after' }));
				}, 1);
			}		
			// save new options
			options._last_w2ui_name = w2utils.keyboard.active();
			w2utils.keyboard.active(null);
			$('#w2ui-popup').data('options', options);
			// keyboard events 
			if (options.keyboard) $(document).on('keydown', this.keydown);

			// initialize move
			var tmp = { resizing: false };
			$('#w2ui-popup .w2ui-msg-title')
				.on('mousedown', function (event) { mvStart(event); })
				.on('mousemove', function (event) { mvMove(event); })
				.on('mouseup',   function (event) { mvStop(event); });
			$('#w2ui-popup .w2ui-msg-body')
				.on('mousemove', function (event) { mvMove(event); })
				.on('mouseup',   function (event) { mvStop(event); });
			$('#w2ui-lock')
				.on('mousemove', function (event) { mvMove(event); })
				.on('mouseup',   function (event) { mvStop(event); });

			// handlers
			function mvStart(event) {
				if (!event) event = window.event;
				if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
				tmp.resizing = true;
				tmp.tmp_x = event.screenX;
				tmp.tmp_y = event.screenY;
				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
				if (event.preventDefault) event.preventDefault(); else return false;
			}
			
			function mvMove(evnt) {
				if (tmp.resizing != true) return;
				if (!evnt) evnt = window.event;
				tmp.tmp_div_x = (evnt.screenX - tmp.tmp_x); 
				tmp.tmp_div_y = (evnt.screenY - tmp.tmp_y); 
				$('#w2ui-popup').css({
					'-webkit-transition': 'none',
					'-webkit-transform': 'translate3d('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px, 0px)',
					'-moz-transition': 'none',
					'-moz-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)',
					'-ms-transition': 'none',
					'-ms-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)',
					'-o-transition': 'none',
					'-o-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)'
				});
				$('#w2ui-panel').css({
					'-webkit-transition': 'none',
					'-webkit-transform': 'translate3d('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px, 0px)',
					'-moz-transition': 'none',
					'-moz-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)',
					'-ms-transition': 'none',
					'-ms-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px',
					'-o-transition': 'none',
					'-o-transform': 'translate('+ tmp.tmp_div_x +'px, '+ tmp.tmp_div_y +'px)'
				});
			}
		
			function mvStop(evnt) {
				if (tmp.resizing != true) return;
				if (!evnt) evnt = window.event;
				tmp.tmp_div_x = (evnt.screenX - tmp.tmp_x); 
				tmp.tmp_div_y = (evnt.screenY - tmp.tmp_y); 			
				$('#w2ui-popup').css({
					'-webkit-transition': 'none',
					'-webkit-transform': 'translate3d(0px, 0px, 0px)',
					'-moz-transition': 'none',
					'-moz-transform': 'translate(0px, 0px)',
					'-ms-transition': 'none',
					'-ms-transform': 'translate(0px, 0px)',
					'-o-transition': 'none',
					'-o-transform': 'translate(0px, 0px)',
					'left': (parseInt($('#w2ui-popup').css('left')) + parseInt(tmp.tmp_div_x)) + 'px',
					'top':	(parseInt($('#w2ui-popup').css('top'))  + parseInt(tmp.tmp_div_y)) + 'px'
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
					'left': (parseInt($('#w2ui-panel').css('left')) + parseInt(tmp.tmp_div_x)) + 'px',
					'top':	(parseInt($('#w2ui-panel').css('top'))  + parseInt(tmp.tmp_div_y)) + 'px'
				});
				tmp.resizing = false;
			}		
			return this;		
		},

		keydown: function (event) {
			var options = $('#w2ui-popup').data('options');
			if (!options.keyboard) return;
			// trigger event
			var eventData = w2popup.trigger({ phase: 'before', type: 'keydown', target: 'popup', options: options, originalEvent: event });
			if (eventData.isCancelled === true) return;
			// default behavior
			switch (event.keyCode) {
				case 27: 
					event.preventDefault();
					if ($('#w2ui-popup .w2ui-popup-message').length > 0) w2popup.message(); else w2popup.close();
					break;
			}
			// event after
			w2popup.trigger($.extend(eventData, { phase: 'after'}));
		},
		
		close: function (options) {
			var obj = this;
			var options = $.extend({}, $('#w2ui-popup').data('options'), options);
			// trigger event
			var eventData = this.trigger({ phase: 'before', type: 'close', target: 'popup', options: options });
			if (eventData.isCancelled === true) return;
			// default behavior
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
			w2popup.unlockScreen();
			setTimeout(function () {
				$('#w2ui-popup').remove();
				$('#w2ui-panel').remove();
				// event after
				obj.trigger($.extend(eventData, { phase: 'after'}));
			}, options.speed * 1000);				
			// restore active
			w2utils.keyboard.active(options._last_w2ui_name);
			// remove keyboard events
			if (options.keyboard) $(document).off('keydown', this.keydown);			
		},
		
		toggle: function () {
			var options = $('#w2ui-popup').data('options');
			if (options.maximized === true) w2popup.min(); else w2popup.max();
		},
		
		max: function () {
			var obj = this;
			var options = $('#w2ui-popup').data('options');
			if (options.maximized === true) return;
			// trigger event
			var eventData = this.trigger({ phase: 'before', type: 'max', target: 'popup', options: options });
			if (eventData.isCancelled === true) return;
			// default behavior
			options.maximized = true;
			options.prevSize  = $('#w2ui-popup').css('width')+':'+$('#w2ui-popup').css('height');
			$('#w2ui-popup').data('options', options);
			// do resize
			w2popup.resize(10000, 10000, function () {
				obj.trigger($.extend(eventData, { phase: 'after'}));
			});
		},

		min: function () {
			var obj = this;
			var options = $('#w2ui-popup').data('options');
			if (options.maximized !== true) return;
			var size = options.prevSize.split(':');
			// trigger event
			var eventData = this.trigger({ phase: 'before', type: 'min', target: 'popup', options: options });
			if (eventData.isCancelled === true) return;
			// default behavior
			options.maximized = false;
			options.prevSize  = null;
			$('#w2ui-popup').data('options', options);
			// do resize
			w2popup.resize(size[0], size[1], function () {
				obj.trigger($.extend(eventData, { phase: 'after'}));
			});
		},

		get: function () {
			return $('#w2ui-popup').data('options');
		},

		set: function (options) {
			w2popup.open(options);
		},
		
		clear: function() {
			$('#w2ui-popup .w2ui-msg-title').html('');
			$('#w2ui-popup .w2ui-msg-body').html('');
			$('#w2ui-popup .w2ui-msg-buttons').html('');
		},

		reset: function () {
			w2popup.open(w2popup.defaults);
		},
		
		load: function (options) {
			if (String(options.url) == 'undefined') {
				console.log('ERROR: The url parameter is empty.');
				return;
			}
			var tmp = String(options.url).split('#');
			var url = tmp[0];
			var selector = tmp[1];
			if (String(options) == 'undefined') options = {};
			// load url
			var html = $('#w2ui-popup').data(url);
			if (typeof html != 'undefined' && html != null) {
				popup(html, selector);
			} else {
				$.get(url, function (data, status, obj) {
					popup(obj.responseText, selector);
					$('#w2ui-popup').data(url, obj.responseText); // remember for possible future purposes
				});
			}
			function popup(html, selector) {
				delete options.url;
				$('body').append('<div id="w2ui-tmp" style="display: none">'+ html +'</div>');
				if (typeof selector != 'undefined' && $('#w2ui-tmp #'+selector).length > 0) {
					$('#w2ui-tmp #'+ selector).w2popup(options);
				} else {
					$('#w2ui-tmp > div').w2popup(options);
				}
				// link styles
				if ($('#w2ui-tmp > style').length > 0) {
					var style = $('<div>').append($('#w2ui-tmp > style').clone()).html();
					if ($('#w2ui-popup #div-style').length == 0) {
						$('#w2ui-ppopup').append('<div id="div-style" style="position: absolute; left: -100; width: 1px"></div>');
					}
					$('#w2ui-popup #div-style').html(style);
				}
				$('#w2ui-tmp').remove();
			}
		},
		
		message: function (options) {
			$().w2tag(); // hide all tags
			if (!options) options = { width: 200, height: 100 };
			if (parseInt(options.width) < 10)  options.width  = 10;
			if (parseInt(options.height) < 10) options.height = 10;
			if (typeof options.hideOnClick == 'undefined') options.hideOnClick = false;

			var head = $('#w2ui-popup .w2ui-msg-title');
			if ($('#w2ui-popup .w2ui-popup-message').length == 0) {
				var pwidth = parseInt($('#w2ui-popup').width());
				$('#w2ui-popup .w2ui-box1')
					.before('<div class="w2ui-popup-message" style="display: none; ' +
								(head.length == 0 ? 'top: 0px;' : 'top: '+ w2utils.getSize(head, 'height') + 'px;') +
					        	(typeof options.width  != 'undefined' ? 'width: '+ options.width + 'px; left: '+ ((pwidth - options.width) / 2) +'px;' : 'left: 10px; right: 10px;') +
					        	(typeof options.height != 'undefined' ? 'height: '+ options.height + 'px;' : 'bottom: 6px;') +
					        	'-webkit-transition: .3s; -moz-transition: .3s; -ms-transition: .3s; -o-transition: .3s;"' +
								(options.hideOnClick === true ? 'onclick="w2popup.message();"' : '') + '>'+
							'</div>');
				$('#w2ui-popup .w2ui-popup-message').data('options', options);
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
				setTimeout(function() {
					$('#w2ui-popup .w2ui-popup-message').css({
						'-webkit-transition': '0s',	'-moz-transition': '0s', '-ms-transition': '0s', '-o-transition': '0s',
						'z-Index': 1500
					}); // has to be on top of lock 
					w2popup.lock();
					if (typeof options.onOpen == 'function') options.onOpen();
				}, 300);
			} else {
				$('#w2ui-popup .w2ui-popup-message').css('z-Index', 250);
				var options = $('#w2ui-popup .w2ui-popup-message').data('options');
				$('#w2ui-popup .w2ui-popup-message').remove();
				w2popup.unlock();				
				if (typeof options.onClose == 'function') options.onClose();
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
		},

		lock: function (msg, showSpinner) {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift($('#w2ui-popup'));
			w2utils.lock.apply(window, args);
		},

		unlock: function () { 
			w2utils.unlock($('#w2ui-popup'));
		},
		
		// --- INTERNAL FUNCTIONS
		
		lockScreen: function (options) {
			if ($('#w2ui-lock').length > 0) return false;
			if (typeof options == 'undefined') options = $('#w2ui-popup').data('options');
			if (typeof options == 'undefined') options = {};
			options = $.extend({}, w2popup.defaults, options);
			// show element
			$('body').append('<div id="w2ui-lock" '+
				'	onmousewheel="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; if (event.preventDefault) event.preventDefault(); else return false;"'+
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
			}, 1);
			// add events
			if (options.modal == true) { 
				$('#w2ui-lock').on('mousedown', function () {
					$('#w2ui-lock').css({ 
						'-webkit-transition': '.1s', 
						'-moz-transition': '.1s', 
						'-ms-transition': '.1s', 
						'-o-transition': '.1s', 
						'opacity': '0.6'
					});			
					// if (window.getSelection) window.getSelection().removeAllRanges();
				}); 
				$('#w2ui-lock').on('mouseup', function () {
					setTimeout(function () {
						$('#w2ui-lock').css({ 
							'-webkit-transition': '.1s', 
							'-moz-transition': '.1s', 
							'-ms-transition': '.1s', 
							'-o-transition': '.1s', 
							'opacity': options.opacity
						});
					}, 100);
					// if (window.getSelection) window.getSelection().removeAllRanges();
				});
			} else {
				$('#w2ui-lock').on('mouseup', function () { w2popup.close(); });
			}
			return true;
		},
		
		unlockScreen: function () {
			if ($('#w2ui-lock').length == 0) return false;	
			var options = $.extend({}, $('#w2ui-popup').data('options'), options);		
			$('#w2ui-lock').css({ 
				'-webkit-transition': options.speed +'s opacity', 
				'-moz-transition': options.speed +'s opacity', 
				'-ms-transition': options.speed +'s opacity', 
				'-o-transition': options.speed +'s opacity', 
				'opacity': 0
			});
			setTimeout(function () { 
				$('#w2ui-lock').remove(); 
			}, options.speed * 1000); 
			return true;
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
		}
	}

	// merge in event handling
	$.extend(w2popup, w2utils.event);

})();

// ============================================
// --- Common dialogs

var w2alert = function (msg, title, callBack) {
	if (typeof title == 'undefined') title = w2utils.lang('Notification');
	if ($('#w2ui-popup').length > 0) {
		w2popup.message({
			width 	: 400,
			height 	: 150,
			html 	: '<div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 40px; overflow: auto">'+
					  '		<div class="w2ui-centered"><div style="font-size: 13px;">'+ msg +'</div></div>'+
					  '</div>'+
					  '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center; padding: 5px">'+
					  '		<input type="button" value="Ok" onclick="w2popup.message();" class="w2ui-popup-button">'+
					  '</div>',
			onClose : function () { 
				if (typeof callBack == 'function') callBack(); 
			} 
		});
	} else {
		w2popup.open({
			width 	: 450,
			height 	: 200,
			showMax : false,
			title 	: title,
			body    : '<div class="w2ui-centered"><div style="font-size: 13px;">' + msg +'</div></div>',
			buttons : '<input type="button" value="'+ w2utils.lang('Ok') +'" class="w2ui-popup-button" onclick="w2popup.close();">',
			onClose : function () { 
				if (typeof callBack == 'function') callBack(); 
			} 
		});
	}
};

var w2confirm = function (msg, title, callBack) {
	if (typeof callBack == 'undefined' || typeof title == 'function') {
		callBack = title; 
		title = w2utils.lang('Confirmation');
	}
	if (typeof title == 'undefined') {
		title = w2utils.lang('Confirmation');
	}
	if ($('#w2ui-popup').length > 0) {
		w2popup.message({
			width 	: 400,
			height 	: 150,
			html 	: '<div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 40px; overflow: auto">'+
					  '		<div class="w2ui-centered"><div style="font-size: 13px;">'+ msg +'</div></div>'+
					  '</div>'+
					  '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center; padding: 5px">'+
					  '		<input id="No" type="button" value="'+ w2utils.lang('No') +'" class="w2ui-popup-button">'+
					  '		<input id="Yes" type="button" value="'+ w2utils.lang('Yes') +'" class="w2ui-popup-button">'+
					  '</div>',
			onOpen: function () {
				$('#w2ui-popup .w2ui-popup-message .w2ui-popup-button').on('click', function (event) {
					w2popup.message();
					if (typeof callBack == 'function') callBack(event.target.id);
				});
			},
			onKeydown: function (event) {
				switch (event.originalEvent.keyCode) {
					case 13: // enter
						if (typeof callBack == 'function') callBack('Yes');
						w2popup.message();
						break
					case 27: // esc
						if (typeof callBack == 'function') callBack('No');
						w2popup.message();
						break
				}
			} 
		});
	} else {
		w2popup.open({
			width 		: 450,
			height 		: 200,
			title   	: title,
			modal		: true,
			showClose	: false,
			body    	: '<div class="w2ui-centered"><div style="font-size: 13px;">' + msg +'</div></div>',
			buttons 	: '<input id="No" type="button" value="'+ w2utils.lang('No') +'" class="w2ui-popup-button">'+
					  	  '<input id="Yes" type="button" value="'+ w2utils.lang('Yes') +'" class="w2ui-popup-button">',
			onOpen: function (event) {
				event.onComplete = function () {
					$('#w2ui-popup .w2ui-popup-button').on('click', function (event) {
						w2popup.close();
						if (typeof callBack == 'function') callBack(event.target.id);
					});
				}
			},
			onKeydown: function (event) {
				switch (event.originalEvent.keyCode) {
					case 13: // enter
						if (typeof callBack == 'function') callBack('Yes');
						w2popup.close();
						break
					case 27: // esc
						if (typeof callBack == 'function') callBack('No');
						w2popup.close();
						break
				}
			} 
		});
	}
};/************************************************************************
*	Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*	- Following objects defined
*		- w2tabs		- tabs widget
*		- $().w2tabs	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- tabs might not work in chromium apps, need bind()
*   - on overflow display << >>
*	- individual tab onClick (possibly other events) are not working
*
* == 1.4 changes
*	- deleted getSelection().removeAllRanges() - see https://github.com/vitmalina/w2ui/issues/323
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

		$.extend(true, this, w2obj.tabs, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2tabs = function(method) {
		if (typeof method === 'object' || !method ) {
			// check name parameter
			if (!$.fn.w2checkNameParam(method, 'w2tabs')) return;
			// extend tabs
			var tabs   = method.tabs;
			var object = new w2tabs(method);
			$.extend(object, { tabs: [], handlers: [] });
			for (var i in tabs) { object.tabs[i] = $.extend({}, w2tabs.prototype.tab, tabs[i]); }
			if ($(this).length !== 0) {
				object.render($(this)[0]);
			}
			// register new object
			w2ui[object.name] = object;
			return object;

		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2tabs' );
		}
	};

	// ====================================================
	// -- Implementation of core functionality

	w2tabs.prototype = {
		tab : {
			id			: null,		// commnad to be sent to all event handlers
			text		: '',
			hidden		: false,
			disabled	: false,
			closable	: false,
			hint		: '',
			onClick		: null,
			onRefresh	: null,
			onClose		: null
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
					console.log('ERROR: The parameter "id" is required but not supplied. (obj: '+ this.name +')');
					return;
				}
				var unique = true;
				for (var i in this.tabs) { if (this.tabs[i].id == tab[r].id) { unique = false; break; } }
				if (!unique) {
					console.log('ERROR: The parameter "id='+ tab[r].id +'" is not unique within the current tabs. (obj: '+ this.name +')');
					return;
				}
				if (!w2utils.isAlphaNumeric(tab[r].id)) {
					console.log('ERROR: The parameter "id='+ tab[r].id +'" must be alpha-numeric + "-_". (obj: '+ this.name +')');
					return;
				}
				// add tab
				tab = $.extend({}, tab, tab[r]);
				if (id === null || typeof id == 'undefined') {
					this.tabs.push(tab);
				} else {
					var middle = this.get(id, true);
					this.tabs = this.tabs.slice(0, middle).concat([tab], this.tabs.slice(middle));
				}
				this.refresh(tab[r].id);
			}
		},

		remove: function (id) {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tab = this.get(arguments[a]);
				if (!tab) return false;
				removed++;
				// remove from array
				this.tabs.splice(this.get(tab.id, true), 1);
				// remove from screen
				$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id)).remove();
			}
			return removed;
		},

		select: function (id) {
			if (this.get(id) === null || this.active == id) return false;
			this.active = id;
			this.refresh();
			return true;
		},

		set: function (id, tab) {
			var index = this.get(id, true);
			if (index === null) return false;
			$.extend(this.tabs[index], tab);
			this.refresh(id);
			return true;
		},

		get: function (id, returnIndex) {
			if (arguments.length === 0) {
				var all = [];
				for (var i = 0; i < this.tabs.length; i++) if (this.tabs[i].id !== null) all.push(this.tabs[i].id);
				return all;
			}
			for (var i1 in this.tabs) {
				if (this.tabs[i1].id == id) {
					if (returnIndex === true) return i1; else return this.tabs[i1];
				}
			}
			return null;
		},

		show: function () {
			var shown = 0;
			for (var a = 0; a < arguments.length; a++) {
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
			for (var a = 0; a < arguments.length; a++) {
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
			for (var a = 0; a < arguments.length; a++) {
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
			for (var a = 0; a < arguments.length; a++) {
				var tab = this.get(arguments[a]);
				if (!tab || tab.disabled === true) continue;
				tab.disabled = true;
				this.refresh(tab.id);
				disabled++;
			}
			return disabled;
		},

		refresh: function (id) {
			var time = (new Date()).getTime();
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (String(id) == 'undefined') {
				// refresh all
				for (var i in this.tabs) this.refresh(this.tabs[i].id);
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), object: this.get(id) });
			if (eventData.isCancelled === true) return false;
			// create or refresh only one item
			var tab = this.get(id);
			if (tab === null) return;
			if (typeof tab.caption != 'undefined') tab.text = tab.caption;

			var jq_el   = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id));
			var tabHTML = (tab.closable ? '<div class="w2ui-tab-close" onclick="w2ui[\''+ this.name +'\'].animateClose(\''+ tab.id +'\', event);"></div>' : '') +
						'	<div class="w2ui-tab'+ (this.active == tab.id ? ' active' : '') + (tab.closable ? ' closable' : '') +'" '+
						'		title="'+ (typeof tab.hint != 'undefined' ? tab.hint : '') +'"'+
						'		onclick="w2ui[\''+ this.name +'\'].click(\''+ tab.id +'\', event);">' + tab.text + '</div>';
			if (jq_el.length === 0) {
				// does not exist - create it
				var addStyle = '';
				if (tab.hidden) { addStyle += 'display: none;'; }
				if (tab.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; -o-opacity: 0.2; filter:alpha(opacity=20);'; }
				html = '<td id="tabs_'+ this.name + '_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML + '</td>';
				if (this.get(id, true) != this.tabs.length-1 && $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))+1].id)).length > 0) {
					$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))+1].id)).before(html);
				} else {
					$(this.box).find('#tabs_'+ this.name +'_right').before(html);
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
			return (new Date()).getTime() - time;
		},

		render: function (box) {
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });
			if (eventData.isCancelled === true) return false;
			// default action
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (String(box) != 'undefined' && box !== null) {
				if ($(this.box).find('> table #tabs_'+ this.name + '_right').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-tabs')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return;
			// render all buttons
			var html =	'<table cellspacing="0" cellpadding="1" width="100%">'+
						'	<tr><td width="100%" id="tabs_'+ this.name +'_right" align="right">'+ this.right +'</td></tr>'+
						'</table>';
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-tabs')
				.html(html);
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
			return (new Date()).getTime() - time;
		},

		resize: function () {
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
			if (eventData.isCancelled === true) return false;
			// empty function
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
			if (eventData.isCancelled === true) return false;
			// clean up
			if ($(this.box).find('> table #tabs_'+ this.name + '_right').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-tabs')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		// ===================================================
		// -- Internal Event Handlers

		click: function (id, event) {
			var tab = this.get(id);
			if (tab === null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'click', target: id, object: this.get(id), originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// default action
			$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active) +' .w2ui-tab').removeClass('active');
			this.active = tab.id;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh(id);
		},

		animateClose: function(id, event) {
			var tab = this.get(id);
			if (tab === null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'close', target: id, object: this.get(id), originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// default action
			var obj = this;
			$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id)).css({
				'-webkit-transition': '.2s',
				'-moz-transition': '2s',
				'-ms-transition': '.2s',
				'-o-transition': '.2s',
				opacity: '0' });
			setTimeout(function () {
				var width = $(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id)).width();
				$(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id))
					.html('<div style="width: '+ width +'px; -webkit-transition: .2s; -moz-transition: .2s; -ms-transition: .2s; -o-transition: .2s"></div>');
				setTimeout(function () {
					$(obj.box).find('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id)).find(':first-child').css({ 'width': '0px' });
				}, 50);
			}, 200);
			setTimeout(function () {
				obj.remove(id);
			}, 450);
			// event before
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
		},

		animateInsert: function(id, tab) {
			if (this.get(id) === null) return;
			if (!$.isPlainObject(tab)) return;
			// check for unique
			var unique = true;
			for (var i in this.tabs) { if (this.tabs[i].id == tab.id) { unique = false; break; } }
			if (!unique) {
				console.log('ERROR: The parameter "id='+ tab.id +'" is not unique within the current tabs. (obj: '+ this.name +')');
				return;
			}
			// insert simple div
			var jq_el   = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id));
			if (jq_el.length !== 0) return; // already exists
			// measure width
			if (typeof tab.caption != 'undefined') tab.text = tab.caption;
			var tmp = '<div id="_tmp_tabs" class="w2ui-reset w2ui-tabs" style="position: absolute; top: -1000px;">'+
				'<table cellspacing="0" cellpadding="1" width="100%"><tr>'+
				'<td id="_tmp_simple_tab" style="" valign="middle">'+
					(tab.closable ? '<div class="w2ui-tab-close"></div>' : '') +
				'	<div class="w2ui-tab '+ (this.active == tab.id ? 'active' : '') +'">'+ tab.text +'</div>'+
				'</td></tr></table>'+
				'</div>';
			$('body').append(tmp);
			// create dummy element
			tabHTML = '<div style="width: 1px; -webkit-transition: 0.2s; -moz-transition: 0.2s; -ms-transition: 0.2s; -o-transition: 0.2s;">&nbsp;</div>';
			var addStyle = '';
			if (tab.hidden) { addStyle += 'display: none;'; }
			if (tab.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; -o-opacity: 0.2; filter:alpha(opacity=20);'; }
			html = '<td id="tabs_'+ this.name +'_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML +'</td>';
			if (this.get(id, true) != this.tabs.length && $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))].id)).length > 0) {
				$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.tabs[parseInt(this.get(id, true))].id)).before(html);
			} else {
				$(this.box).find('#tabs_'+ this.name +'_right').before(html);
			}
			// -- move
			var obj = this;
			setTimeout(function () {
				var width = $('#_tmp_simple_tab').width();
				$('#_tmp_tabs').remove();
				$('#tabs_'+ obj.name +'_tab_'+ w2utils.escapeId(tab.id) +' > div').css('width', width+'px');
			}, 1);
			setTimeout(function () {
				// insert for real
				obj.insert(id, tab);
			}, 200);
		}
	};

	$.extend(w2tabs.prototype, w2utils.event);
	w2obj.tabs = w2tabs;
})();
/************************************************************************
*	Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*	- Following objects defined
*		- w2toolbar		- toolbar widget
*		- $().w2toolbar	- jQuery wrapper
*	- Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- on overflow display << >>
*
* == 1.4 changes
*	- deleted getSelection().removeAllRanges() - see https://github.com/vitmalina/w2ui/issues/323
*
************************************************************************/

(function () {
	var w2toolbar = function (options) {
		this.box		= null;		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.items		= [];
		this.right		= '';		// HTML text on the right of toolbar
		this.onClick	= null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null;

		$.extend(true, this, w2obj.toolbar, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2toolbar = function(method) {
		if (typeof method === 'object' || !method ) {
			// check name parameter
			if (!$.fn.w2checkNameParam(method, 'w2toolbar')) return;
			// extend items
			var items = method.items;
			var object = new w2toolbar(method);
			$.extend(object, { items: [], handlers: [] });

			for (var i in items) { object.items[i] = $.extend({}, w2toolbar.prototype.item, items[i]); }
			if ($(this).length !== 0) {
				object.render($(this)[0]);
			}
			// register new object
			w2ui[object.name] = object;
			return object;

		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2toolbar' );
		}
	};

	// ====================================================
	// -- Implementation of core functionality

	w2toolbar.prototype = {
		item: {
			id		: null,		// commnad to be sent to all event handlers
			type	: 'button',	// button, check, radio, drop, menu, break, html, spacer
			text	: '',
			html	: '',
			img		: null,
			icon	: null,
			hidden	: false,
			disabled: false,
			checked	: false,	// used for radio buttons
			arrow	: true,		// arrow down for drop/menu types
			hint	: '',
			group	: null,		// used for radio buttons
			items	: null,		// for type menu it is an array of items in the menu
			onClick	: null
		},

		add: function (items) {
			this.insert(null, items);
		},

		insert: function (id, items) {
			if (!$.isArray(items)) items = [items];
			for (var o in items) {
				// checks
				if (typeof items[o].type == 'undefined') {
					console.log('ERROR: The parameter "type" is required but not supplied in w2toolbar.add() method.');
					return;
				}
				if ($.inArray(String(items[o].type), ['button', 'check', 'radio', 'drop', 'menu', 'break', 'html', 'spacer']) == -1) {
					console.log('ERROR: The parameter "type" should be one of the following [button, check, radio, drop, menu, break, html, spacer] '+
							'in w2toolbar.add() method.');
					return;
				}
				if (typeof items[o].id == 'undefined') {
					console.log('ERROR: The parameter "id" is required but not supplied in w2toolbar.add() method.');
					return;
				}
				var unique = true;
				for (var i = 0; i < this.items.length; i++) { if (this.items[i].id == items[o].id) { unique = false; return; } }
				if (!unique) {
					console.log('ERROR: The parameter "id" is not unique within the current toolbar.');
					return;
				}
				if (!w2utils.isAlphaNumeric(items[o].id)) {
					console.log('ERROR: The parameter "id" must be alpha-numeric + "-_".');
					return;
				}
				// add item
				var it = $.extend({}, w2toolbar.prototype.item, items[o]);
				if (id === null || typeof id == 'undefined') {
					this.items.push(it);
				} else {
					var middle = this.get(id, true);
					this.items = this.items.slice(0, middle).concat([it], this.items.slice(middle));
				}
				this.refresh(it.id);
			}
		},

		remove: function (id) {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				var it = this.get(arguments[a]);
				if (!it) continue;
				removed++;
				// remove from screen
				$(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)).remove();
				// remove from array
				var ind = this.get(it.id, true);
				if (ind) this.items.splice(ind, 1);
			}
			return removed;
		},

		set: function (id, item) {
			var index = this.get(id, true);
			if (index === null) return false;
			$.extend(this.items[index], item);
			this.refresh(id);
			return true;
		},

		get: function (id, returnIndex) {
			if (arguments.length === 0) {
				var all = [];
				for (var i = 0; i < this.items.length; i++) if (this.items[i].id !== null) all.push(this.items[i].id);
				return all;
			}
			for (var i1 = 0; i1 < this.items.length; i1++) {
				if (this.items[i1].id == id) {
					if (returnIndex === true) return i1; else return this.items[i1];
				}
			}
			return null;
		},

		show: function (id) {
			var items = 0;
			for (var a = 0; a < arguments.length; a++) {
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
			for (var a = 0; a < arguments.length; a++) {
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
			for (var a = 0; a < arguments.length; a++) {
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
			for (var a = 0; a < arguments.length; a++) {
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
			for (var a = 0; a < arguments.length; a++) {
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
			for (var a = 0; a < arguments.length; a++) {
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
			if (eventData.isCancelled === true) return false;

			if (typeof box != 'undefined' && box !== null) {
				if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-toolbar')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return;
			// render all buttons
			var html =	'<table cellspacing="0" cellpadding="0" width="100%">'+
						'<tr>';
			for (var i = 0; i < this.items.length; i++) {
				var it = this.items[i];
				if (typeof it.id == 'undefined' || it.id === null) it.id = "item_" + i;
				if (it === null)  continue;
				if (it.type == 'spacer') {
					html += '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>';
				} else {
					html += '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
							'	class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ this.getItemHTML(it) +
							'</td>';
				}
			}
			html += '<td width="100%" id="tb_'+ this.name +'_right" align="right">'+ this.right +'</td>';
			html += '</tr>'+
					'</table>';
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-toolbar')
				.html(html);
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		refresh: function (id) {
			var time = (new Date()).getTime();
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), item: this.get(id) });
			if (eventData.isCancelled === true) return false;

			if (typeof id == 'undefined') {
				// refresh all
				for (var i = 0; i < this.items.length; i++) {
					var it1 = this.items[i];
					if (typeof it1.id == 'undefined' || it1.id === null) it1.id = "item_" + i;
					this.refresh(it1.id);
				}
			}
			// create or refresh only one item
			var it = this.get(id);
			if (it === null) return;

			var el = $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id));
			var html  = this.getItemHTML(it);
			if (el.length === 0) {
				// does not exist - create it
				if (it.type == 'spacer') {
					html = '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>';
				} else {
					html =  '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
						'	class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ html +
						'</td>';
				}
				if (this.get(id, true) == this.items.length-1) {
					$(this.box).find('#tb_'+ this.name +'_right').before(html);
				} else {
					$(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(this.items[parseInt(this.get(id, true))+1].id)).before(html);
				}
			} else {
				// refresh
				el.html(html);
				if (it.hidden) { el.css('display', 'none'); } else { el.css('display', ''); }
				if (it.disabled) { el.addClass('disabled'); } else { el.removeClass('disabled'); }
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		resize: function () {
			var time = (new Date()).getTime();
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
			if (eventData.isCancelled === true) return false;

			// empty function

			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
			if (eventData.isCancelled === true) return false;
			// clean up
			if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-toolbar')
					.html('');
			}
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		// ========================================
		// --- Internal Functions

		getItemHTML: function (item) {
			var html = '';

			if (typeof item.caption != 'undefined') item.text = item.caption;
			if (typeof item.hint == 'undefined') item.hint = '';
			if (typeof item.text == 'undefined') item.text = '';

			switch (item.type) {
				case 'menu':
				case 'button':
				case 'check':
				case 'radio':
				case 'drop':
					var img = '<td>&nbsp;</td>';
					if (item.img)  img = '<td><div class="w2ui-tb-image w2ui-icon '+ item.img +'"></div></td>';
					if (item.icon) img = '<td><div class="w2ui-tb-image"><span class="'+ item.icon +'"></span></div></td>';
					html += '<table cellpadding="0" cellspacing="0" title="'+ item.hint +'" class="w2ui-button '+ (item.checked ? 'checked' : '') +'" '+
							'       onclick     = "var el=w2ui[\''+ this.name + '\']; if (el) el.click(\''+ item.id +'\', event);" '+
							'       onmouseover = "' + (!item.disabled ? "$(this).addClass('over');" : "") + '"'+
							'       onmouseout  = "' + (!item.disabled ? "$(this).removeClass('over');" : "") + '"'+
							'       onmousedown = "' + (!item.disabled ? "$(this).addClass('down');" : "") + '"'+
							'       onmouseup   = "' + (!item.disabled ? "$(this).removeClass('down');" : "") + '"'+
							'>'+
							'<tr><td>'+
							'  <table cellpadding="1" cellspacing="0">'+
							'  <tr>' +
									img +
									(item.text !== '' ? '<td class="w2ui-tb-caption" nowrap>'+ item.text +'</td>' : '') +
									(((item.type == 'drop' || item.type == 'menu') && item.arrow !== false) ?
										'<td class="w2ui-tb-down" nowrap>&nbsp;&nbsp;&nbsp;</td>' : '') +
							'  </tr></table>'+
							'</td></tr></table>';
					break;

				case 'break':
					html +=	'<table cellpadding="0" cellspacing="0"><tr>'+
							'    <td><div class="w2ui-break">&nbsp;</div></td>'+
							'</tr></table>';
					break;

				case 'html':
					html +=	'<table cellpadding="0" cellspacing="0"><tr>'+
							'    <td nowrap>' + item.html + '</td>'+
							'</tr></table>';
					break;
			}

			var newHTML = '';
			if (typeof item.onRender == 'function') newHTML = item.onRender.call(this, item.id, html);
			if (typeof this.onRender == 'function') newHTML = this.onRender(item.id, html);
			if (newHTML !== '' && typeof newHTML != 'undefined') html = newHTML;
			return html;
		},

		menuClick: function (id, menu_index, event) {
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			var obj = this;
			var it  = this.get(id);
			if (it && !it.disabled) {
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'click', target: (typeof id != 'undefined' ? id : this.name), item: this.get(id),
					subItem: (typeof menu_index != 'undefined' && this.get(id) ? this.get(id).items[menu_index] : null), originalEvent: event });
				if (eventData.isCancelled === true) return false;

				// normal processing

				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		click: function (id, event) {
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			var obj = this;
			var it  = this.get(id);
			if (it && !it.disabled) {
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'click', target: (typeof id != 'undefined' ? id : this.name),
					item: this.get(id), originalEvent: event });
				if (eventData.isCancelled === true) return false;

				var btn = $('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button');
				btn.removeClass('down');

				if (it.type == 'radio') {
					for (var i = 0; i < this.items.length; i++) {
						var itt = this.items[i];
						if (itt === null || itt.id == it.id || itt.type != 'radio') continue;
						if (itt.group == it.group && itt.checked) {
							itt.checked = false;
							this.refresh(itt.id);
						}
					}
					it.checked = true;
					btn.addClass('checked');
				}

				if (it.type == 'drop' || it.type == 'menu') {
					if (it.checked) {
						// if it was already checked, second click will hide it
						it.checked = false;
					} else {
						// show overlay
						setTimeout(function () {
							var el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id));
							if (!$.isPlainObject(it.overlay)) it.overlay = {};
							if (it.type == 'drop') {
								el.w2overlay(it.html, $.extend({ left: (el.width() - 50) / 2, top: 3 }, it.overlay));
							}
							if (it.type == 'menu') {
								el.w2menu(it.items, $.extend({ left: (el.width() - 50) / 2, top: 3 }, it.overlay, {
									select: function (item, event, index) { obj.menuClick(it.id, index, event); }
								}));
							}
							// window.click to hide it
							$(document).on('click', hideDrop);
							function hideDrop() {
								it.checked = false;
								if (it.checked) {
									btn.addClass('checked');
								} else {
									btn.removeClass('checked');
								}
								obj.refresh(it.id);
								$(document).off('click', hideDrop);
							}
						}, 1);
					}
				}

				if (it.type == 'check' || it.type == 'drop' || it.type == 'menu') {
					it.checked = !it.checked;
					if (it.checked) {
						btn.addClass('checked');
					} else {
						btn.removeClass('checked');
					}
				}
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		}
	};

	$.extend(w2toolbar.prototype, w2utils.event);
	w2obj.toolbar = w2toolbar;
})();
/************************************************************************
*	Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*	- Following objects defined
*		- w2sidebar		- sidebar widget
*		- $().w2sidebar	- jQuery wrapper
*	- Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- return ids of all subitems
*	- add find() method to find nodes by a specific criteria (I want all nodes for exampe)
*	- dbl click should be like it is in grid (with timer not HTML dbl click event)
*	- reorder with grag and drop
*
* == 1.4 changes
*	- deleted getSelection().removeAllRanges() - see https://github.com/vitmalina/w2ui/issues/323
*
************************************************************************/

(function () {
	var w2sidebar = function (options) {
		this.name			= null;
		this.box			= null;
		this.sidebar		= null;
		this.parent			= null;
		this.nodes			= [];		// Sidebar child nodes
		this.menu			= [];
		this.selected		= null;	// current selected node (readonly)
		this.img			= null;
		this.icon			= null;
		this.style			= '';
		this.topHTML		= '';
		this.bottomHTML		= '';
		this.keyboard		= true;
		this.onClick		= null;	// Fire when user click on Node Text
		this.onDblClick		= null;	// Fire when user dbl clicks
		this.onContextMenu	= null;
		this.onMenuClick	= null;	// when context menu item selected
		this.onExpand		= null;	// Fire when node Expands
		this.onCollapse		= null;	// Fire when node Colapses
		this.onKeydown		= null;
		this.onRender		= null;
		this.onRefresh		= null;
		this.onResize		= null;
		this.onDestroy		= null;

		$.extend(true, this, w2obj.sidebar, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2sidebar = function(method) {
		if (typeof method === 'object' || !method ) {
			// check name parameter
			if (!$.fn.w2checkNameParam(method, 'w2sidebar')) return;
			// extend items
			var nodes  = method.nodes;
			var object = new w2sidebar(method); 
			$.extend(object, { handlers: [], nodes: [] });
			if (typeof nodes != 'undefined') {
				object.add(object, nodes); 
			}
			if ($(this).length !== 0) {
				object.render($(this)[0]);
			}
			object.sidebar = object;
			// register new object
			w2ui[object.name] = object;
			return object;
			
		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2sidebar' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2sidebar.prototype = {

		node: {
			id				: null,
			text			: '',
			count			: '',
			img				: null,
			icon			: null,
			nodes			: [],
			style			: '',
			selected		: false,
			expanded		: false,
			hidden			: false,
			disabled		: false,
			group			: false,		// if true, it will build as a group
			plus			: false,		// if true, plus will be shown even if there is no sub nodes
			// events
			onClick			: null,
			onDblClick		: null,
			onContextMenu	: null,
			onExpand		: null,
			onCollapse		: null,
			// internal
			parent			: null,	// node object
			sidebar			: null
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
			var txt;
			var ind;
			var tmp;
			if (arguments.length == 2) {
				// need to be in reverse order
				nodes	= arguments[1];
				before	= arguments[0];
				ind		= this.get(before);
				if (ind === null) {
					txt = (nodes[o].caption != 'undefined' ? nodes[o].caption : nodes[o].text);
					console.log('ERROR: Cannot insert node "'+ txt +'" because cannot find node "'+ before +'" to insert before.'); 
					return null; 
				}
				parent	= this.get(before).parent;
			}
			if (typeof parent == 'string') parent = this.get(parent);
			if (!$.isArray(nodes)) nodes = [nodes];
			for (var o in nodes) {
				if (typeof nodes[o].id == 'undefined') { 
					txt = (nodes[o].caption != 'undefined' ? nodes[o].caption : nodes[o].text);					
					console.log('ERROR: Cannot insert node "'+ txt +'" because it has no id.'); 
					continue;
				}
				if (this.get(this, nodes[o].id) !== null) { 
					txt = (nodes[o].caption != 'undefined' ? nodes[o].caption : nodes[o].text);
					console.log('ERROR: Cannot insert node with id='+ nodes[o].id +' (text: '+ txt + ') because another node with the same id already exists.'); 
					continue;
				}
				tmp = $.extend({}, w2sidebar.prototype.node, nodes[o]);
				tmp.sidebar	= this;
				tmp.parent	= parent;
				var nd		= tmp.nodes;
				tmp.nodes	= []; // very important to re-init empty nodes array
				if (before === null) { // append to the end
					parent.nodes.push(tmp);	
				} else {
					ind = this.get(parent, before, true);
					if (ind === null) {
						txt = (nodes[o].caption != 'undefined' ? nodes[o].caption : nodes[o].text);
						console.log('ERROR: Cannot insert node "'+ txt +'" because cannot find node "'+ before +'" to insert before.'); 
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
			var tmp;
			for (var a = 0; a < arguments.length; a++) {
				tmp = this.get(arguments[a]);
				if (tmp === null) continue;
				var ind  = this.get(tmp.parent, arguments[a], true);
				if (ind === null) continue;
				tmp.parent.nodes.splice(ind, 1);
				deleted++;
			}
			if (deleted > 0 && arguments.length == 1) this.refresh(tmp.parent.id); else this.refresh();
			return deleted;
		},
		
		set: function (parent, id, node) { 
			if (arguments.length == 2) {
				// need to be in reverse order
				node	= id;
				id		= parent;
				parent	= this;
			}
			// searches all nested nodes
			this._tmp = null;
			if (typeof parent == 'string') parent = this.get(parent);
			if (parent.nodes === null) return null;
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

		get: function (parent, id, returnIndex) { // can be just called get(id) or get(id, true)
			if (arguments.length == 1 || (arguments.length == 2 && id === true) ) {
				// need to be in reverse order
				returnIndex	= id;
				id			= parent;
				parent		= this;
			}
			// searches all nested nodes
			this._tmp = null;
			if (typeof parent == 'string') parent = this.get(parent); 
			if (parent.nodes === null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].id == id) {
					if (returnIndex === true) return i; else return parent.nodes[i];
				} else {
					this._tmp = this.get(parent.nodes[i], id, returnIndex);
					if (this._tmp || this._tmp === 0) return this._tmp;
				}
			}
			return this._tmp;
		},

		hide: function () { // multiple arguments
			var hidden = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tmp = this.get(arguments[a]);
				if (tmp === null) continue;
				tmp.hidden = true;
				hidden++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return hidden;
		},
		
		show: function () {
			var shown = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tmp = this.get(arguments[a]);
				if (tmp === null) continue;
				tmp.hidden = false;
				shown++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return shown;
		},
	
		disable: function () { // multiple arguments
			var disabled = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tmp = this.get(arguments[a]);
				if (tmp === null) continue;
				tmp.disabled = true;
				if (tmp.selected) this.unselect(tmp.id);
				disabled++;
			}
			if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh();
			return disabled;
		},
		
		enable: function () { // multiple arguments
			var enabled = 0;
			for (var a = 0; a < arguments.length; a++) {
				var tmp = this.get(arguments[a]);
				if (tmp === null) continue;
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
			$(this.box).find('#node_'+ w2utils.escapeId(id))
				.addClass('w2ui-selected')
				.find('.w2ui-icon').addClass('w2ui-icon-selected');
			new_node.selected = true;
			this.selected = id;
		},
		
		unselect: function (id) {
			var current = this.get(id);
			if (!current) return false;
			current.selected = false;
			$(this.box).find('#node_'+ w2utils.escapeId(id))
				.removeClass('w2ui-selected')
				.find('.w2ui-icon').removeClass('w2ui-icon-selected');
			if (this.selected == id) this.selected = null;
			return true;
		},
		
		toggle: function(id) {
			var nd = this.get(id);
			if (nd === null) return;
			if (nd.plus) {
				this.set(id, { plus: false });
				this.expand(id);
				this.refresh(id);
				return;
			}
			if (nd.nodes.length === 0) return;
			if (this.get(id).expanded) this.collapse(id); else this.expand(id);
		},

		collapse: function (id) {
			var nd = this.get(id);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'collapse', target: id, object: nd });
			if (eventData.isCancelled === true) return false;
			// default action
			$(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').slideUp('fast');		
			$(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-node-dots:first-child').html('<div class="w2ui-expand">+</div>');
			nd.expanded = false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize();
		},

		collapseAll: function (parent) {
			if (typeof parent == 'undefined') parent = this;
			if (typeof parent == 'string') parent = this.get(parent); 
			if (parent.nodes === null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].expanded === true) parent.nodes[i].expanded = false;
				if (parent.nodes[i].nodes && parent.nodes[i].nodes.length > 0) this.collapseAll(parent.nodes[i]);
			}
			this.refresh(parent.id);
		},		
	
		expand: function (id) {
			var nd = this.get(id);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'expand', target: id, object: nd });	
			if (eventData.isCancelled === true) return false;
			// default action
			$(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').slideDown('fast');
			$(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-node-dots:first-child').html('<div class="w2ui-expand">-</div>');
			nd.expanded = true;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize();
		},
		
		expandAll: function (parent) {
			if (typeof parent == 'undefined') parent = this;
			if (typeof parent == 'string') parent = this.get(parent); 
			if (parent.nodes === null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].expanded === false) parent.nodes[i].expanded = true;
				if (parent.nodes[i].nodes && parent.nodes[i].nodes.length > 0) this.collapseAll(parent.nodes[i]);
			}
			this.refresh(parent.id);
		},		

		expandParents: function (id) {
			var node = this.get(id);
			if (node === null) return;
			if (node.parent) {
				node.parent.expanded = true;
				this.expandParents(node.parent.id);
			}
			this.refresh(id);
		}, 

		click: function (id, event) {
			var obj = this;
			var nd  = this.get(id);
			if (nd === null) return;
			var old = this.selected;
			if (nd.disabled || nd.group) return; // should click event if already selected
			// move selected first
			$(obj.box).find('#node_'+ w2utils.escapeId(old)).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected');
			$(obj.box).find('#node_'+ w2utils.escapeId(id)).addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected');
			// need timeout to allow rendering
			setTimeout(function () {
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'click', target: id, originalEvent: event, object: nd });	
				if (eventData.isCancelled === true) {
					// restore selection
					$(obj.box).find('#node_'+ w2utils.escapeId(id)).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected');
					$(obj.box).find('#node_'+ w2utils.escapeId(old)).addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected');
					return false;
				}
				// default action
				if (old !== null) obj.get(old).selected = false;
				obj.get(id).selected = true;
				obj.selected = id;
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}, 1);
		},

		keydown: function (event) {
			var obj = this;
			var nd  = obj.get(obj.selected);
			if (!nd || obj.keyboard !== true) return;
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event });	
			if (eventData.isCancelled === true) return false;
			// default behaviour
			if (event.keyCode == 13 || event.keyCode == 32) { // enter or space
				if (nd.nodes.length > 0) obj.toggle(obj.selected);
			}
			if (event.keyCode == 37) { // left
				if (nd.nodes.length > 0 && nd.expanded) {
					obj.collapse(obj.selected);
				} else {
					selectNode(nd.parent);
					if (!nd.parent.group) obj.collapse(nd.parent.id);
				}
			}
			if (event.keyCode == 39) { // right
				if ((nd.nodes.length > 0 || nd.plus) && !nd.expanded) obj.expand(obj.selected);
			}
			if (event.keyCode == 38) { // up
				selectNode(neighbor(nd, prev));
			}
			if (event.keyCode == 40) { // down
				selectNode(neighbor(nd, next));
			}
			// cancel event if needed
			if ($.inArray(event.keyCode, [13, 32, 37, 38, 39, 40]) != -1) {
				if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation();				
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));

			function selectNode (node, event) {
				if (node !== null && !node.hidden && !node.disabled && !node.group) {
					obj.click(node.id, event);
					setTimeout(function () { obj.scrollIntoView(); }, 50);
				}
			}

			function neighbor (node, neighborFunc) {
				node = neighborFunc(node);
				while (node !== null && (node.hidden || node.disabled)) {
					if (node.group) break; else node = neighborFunc(node);
				}
				return node;
			}

			function next (node, noSubs) {
				if (node === null) return null;
				var parent		= node.parent;
				var ind			= obj.get(node.id, true);
				var nextNode	= null;
				// jump inside
				if (node.expanded && node.nodes.length > 0 && noSubs !== true) {
					var t = node.nodes[0];
					if (t.hidden || t.disabled || t.group) nextNode = next(t); else nextNode = t;
				} else {
					if (parent && ind + 1 < parent.nodes.length) {
						nextNode = parent.nodes[ind + 1];
					} else {
						nextNode = next(parent, true); // jump to the parent
					}
				}
				if (nextNode !== null && (nextNode.hidden || nextNode.disabled || nextNode.group)) nextNode = next(nextNode);
				return nextNode;
			}

			function prev (node) {
				if (node === null) return null;
				var parent		= node.parent;
				var ind			= obj.get(node.id, true);
				var prevNode	= (ind > 0) ? lastChild(parent.nodes[ind - 1]) : parent;
				if (prevNode !== null && (prevNode.hidden || prevNode.disabled || prevNode.group)) prevNode = prev(prevNode);
				return prevNode;
			}

			function lastChild (node) {
				if (node.expanded && node.nodes.length > 0) {
					var t = node.nodes[node.nodes.length - 1];
					if (t.hidden || t.disabled || t.group) return prev(t); else return lastChild(t);
				}
				return node;
			}
		},

		scrollIntoView: function (id) {
			if (typeof id == 'undefined') id = this.selected;
			var nd = this.get(id);
			if (nd === null) return;
			var body	= $(this.box).find('.w2ui-sidebar-div');
			var item	= $(this.box).find('#node_'+ w2utils.escapeId(id));
			var offset	= item.offset().top - body.offset().top;
			if (offset + item.height() > body.height()) {
				body.animate({ 'scrollTop': body.scrollTop() + body.height() / 1.3 });
			}
			if (offset <= 0) {
				body.animate({ 'scrollTop': body.scrollTop() - body.height() / 1.3 });
			}
		},

		dblClick: function (id, event) {
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var nd = this.get(id);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'dblClick', target: id, originalEvent: event, object: nd });
			if (eventData.isCancelled === true) return false;
			// default action
			this.toggle(id);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	
		contextMenu: function (id, event) {
			var obj = this;
			var nd  = obj.get(id);
			if (id != obj.selected) obj.click(id);
			// need timeout to allow click to finish first
			setTimeout(function () {
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'contextMenu', target: id, originalEvent: event, object: nd });	
				if (eventData.isCancelled === true) return false;		
				// default action
				if (nd.group || nd.disabled) return;
				if (obj.menu.length > 0) {
					$(obj.box).find('#node_'+ w2utils.escapeId(id))
						.w2menu(obj.menu, { 
							left: (event ? event.offsetX || event.pageX : 50) - 25,
							select: function (item, event, index) { obj.menuClick(id, index, event); }
						}
					);
				}
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}, 1);	
		},

		menuClick: function (itemId, index, event) {
			var obj = this;
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'menuClick', target: itemId, originalEvent: event, menuIndex: index, menuItem: obj.menu[index] });	
			if (eventData.isCancelled === true) return false;		
			// default action
			// -- empty
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
		},
				
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.isCancelled === true) return false;
			// default action
			if (typeof box != 'undefined' && box !== null) { 
				if ($(this.box).find('> div > div.w2ui-sidebar-div').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-sidebar')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return;
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-sidebar')
				.html('<div>'+
						'<div class="w2ui-sidebar-top"></div>' +
						'<div class="w2ui-sidebar-div"></div>'+
						'<div class="w2ui-sidebar-bottom"></div>'+
					'</div>'
				);
			$(this.box).find('> div').css({
				width	: $(this.box).width() + 'px',
				height: $(this.box).height() + 'px'
			});
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// adjust top and bottom
			if (this.topHTML !== '') {
				$(this.box).find('.w2ui-sidebar-top').html(this.topHTML);
				$(this.box).find('.w2ui-sidebar-div')
					.css('top', $(this.box).find('.w2ui-sidebar-top').height() + 'px');
			}
			if (this.bottomHTML !== '') {
				$(this.box).find('.w2ui-sidebar-bottom').html(this.bottomHTML);
				$(this.box).find('.w2ui-sidebar-div')
					.css('bottom', $(this.box).find('.w2ui-sidebar-bottom').height() + 'px');
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// ---
			this.refresh();
		},
		
		refresh: function (id) {
			var time = (new Date()).getTime();
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name) });	
			if (eventData.isCancelled === true) return false;
			// adjust top and bottom
			if (this.topHTML !== '') {
				$(this.box).find('.w2ui-sidebar-top').html(this.topHTML);
				$(this.box).find('.w2ui-sidebar-div')					
					.css('top', $(this.box).find('.w2ui-sidebar-top').height() + 'px');
			}
			if (this.bottomHTML !== '') {
				$(this.box).find('.w2ui-sidebar-bottom').html(this.bottomHTML);
				$(this.box).find('.w2ui-sidebar-div')
					.css('bottom', $(this.box).find('.w2ui-sidebar-bottom').height() + 'px');
			}
			// default action
			$(this.box).find('> div').css({
				width : $(this.box).width() + 'px',
				height: $(this.box).height() + 'px'
			});
			var obj = this;
			var node;
			var nm;
			if (typeof id == 'undefined') {
				node	= this;
				nm		= '.w2ui-sidebar-div';
			} else {
				node	= this.get(id);
				if (node === null) return;
				nm		= '#node_'+ w2utils.escapeId(node.id) + '_sub';
			}
			var nodeHTML;
			if (node != this) {
				var tmp	= '#node_'+ w2utils.escapeId(node.id);
				nodeHTML	= getNodeHTML(node);
				$(this.box).find(tmp).before('<div id="sidebar_'+ this.name + '_tmp"></div>');
				$(this.box).find(tmp).remove();
				$(this.box).find(nm).remove();
				$('#sidebar_'+ this.name + '_tmp').before(nodeHTML);
				$('#sidebar_'+ this.name + '_tmp').remove();
			}
			// refresh sub nodes
			$(this.box).find(nm).html('');
			for (var i=0; i < node.nodes.length; i++) {
				nodeHTML = getNodeHTML(node.nodes[i]);
				$(this.box).find(nm).append(nodeHTML);
				if (node.nodes[i].nodes.length !== 0) { this.refresh(node.nodes[i].id); }
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
			
			function getNodeHTML(nd) {
				var html = '';
				var img  = nd.img;
				if (img === null) img = this.img;
				var icon  = nd.icon;
				if (icon === null) icon = this.icon;
				// -- find out level
				var tmp   = nd.parent;
				var level = 0;
				while (tmp && tmp.parent !== null) {
					if (tmp.group) level--;
					tmp = tmp.parent;
					level++;
				}	
				if (typeof nd.caption != 'undefined') nd.text = nd.caption;
				if (nd.group) {
					html = 
						'<div class="w2ui-node-group"  id="node_'+ nd.id +'"'+
						'		onclick="w2ui[\''+ obj.name +'\'].toggle(\''+ nd.id +'\'); '+
						'					var sp=$(this).find(\'span:nth-child(1)\'); if (sp.html() == \''+ w2utils.lang('Hide') +'\') sp.html(\''+ w2utils.lang('Show') +'\'); else sp.html(\''+ w2utils.lang('Hide') +'\');"'+
						'		onmouseout="$(this).find(\'span:nth-child(1)\').css(\'color\', \'transparent\')" '+
						'		onmouseover="$(this).find(\'span:nth-child(1)\').css(\'color\', \'inherit\')">'+
						'	<span>'+ (!nd.hidden && nd.expanded ? w2utils.lang('Hide') : w2utils.lang('Show')) +'</span>'+
						'	<span>'+ nd.text +'</span>'+
						'</div>'+
						'<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>';
				} else {
					if (nd.selected && !nd.disabled) obj.selected = nd.id;
					tmp = '';
					if (img) tmp = '<div class="w2ui-node-image w2ui-icon '+ img +	(nd.selected && !nd.disabled ? " w2ui-icon-selected" : "") +'"></div>';
					if (icon) tmp = '<div class="w2ui-node-image"><span class="'+ icon +'"></span></div>';
					html = 
					'<div class="w2ui-node '+ (nd.selected ? 'w2ui-selected' : '') +' '+ (nd.disabled ? 'w2ui-disabled' : '') +'" id="node_'+ nd.id +'" style="'+ (nd.hidden ? 'display: none;' : '') +'"'+
						'	ondblclick="w2ui[\''+ obj.name +'\'].dblClick(\''+ nd.id +'\', event);"'+
						'	oncontextmenu="w2ui[\''+ obj.name +'\'].contextMenu(\''+ nd.id +'\', event); '+
						'		if (event.preventDefault) event.preventDefault();"'+
						'	onClick="w2ui[\''+ obj.name +'\'].click(\''+ nd.id +'\', event); ">'+
						'<table cellpadding="0" cellspacing="0" style="margin-left:'+ (level*18) +'px; padding-right:'+ (level*18) +'px"><tr>'+
						'<td class="w2ui-node-dots" nowrap onclick="w2ui[\''+ obj.name +'\'].toggle(\''+ nd.id +'\'); '+
						'		if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+ 
						'	<div class="w2ui-expand">'	+ (nd.nodes.length > 0 ? (nd.expanded ? '-' : '+') : (nd.plus ? '+' : '')) + '</div>' +
						'</td>'+
						'<td class="w2ui-node-data" nowrap>'+ 
							tmp +
							(nd.count !== '' ? '<div class="w2ui-node-count">'+ nd.count +'</div>' : '') +
							'<div class="w2ui-node-caption">'+ nd.text +'</div>'+
						'</td>'+
						'</tr></table>'+
					'</div>'+
					'<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>';
				}
				return html;
			}
		},
	
		resize: function () {
			var time = (new Date()).getTime();
			// if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
			if (eventData.isCancelled === true) return false;
			// default action
			$(this.box).css('overflow', 'hidden');	// container should have no overflow
			//$(this.box).find('.w2ui-sidebar-div').css('overflow', 'hidden');
			$(this.box).find('> div').css({
				width		: $(this.box).width() + 'px',
				height	: $(this.box).height() + 'px'
			});
			//$(this.box).find('.w2ui-sidebar-div').css('overflow', 'auto');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},
		
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.isCancelled === true) return false;
			// clean up
			if ($(this.box).find('> div > div.w2ui-sidebar-div').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-sidebar')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));	
		},

		lock: function (msg, showSpinner) {
			var box = $(this.box).find('> div:first-child');
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(box);
			w2utils.lock.apply(window, args);
		},

		unlock: function () { 
			w2utils.unlock(this.box);
		}
	};
	
	$.extend(w2sidebar.prototype, w2utils.event);
	w2obj.sidebar = w2sidebar;
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*		- w2field		- various field controls
*		- $().w2field	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- select - for select, list - for drop down (needs this in grid)
*	- enum add events: onLoad, onRequest, onCompare, onSelect, onDelete, onClick for already selected elements
*	- upload (regular files)
*	- enum - refresh happens on each key press even if not needed (for speed)
*	- BUG with prefix/postfix and arrows (test in different contexts)
*	- multiple date selection
*	- rewrire everythin in objects (w2ftext, w2fenum, w2fdate)
*	- render calendar to the div
*
************************************************************************/

(function ($) {

	/* SINGELTON PATTERN */

	var w2field = { customTypes: [] };

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
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2field');
		}    
	};
	
	$.extend(w2field, {
		// CONTEXT: this - is jQuery object
		init: function (options) {
			var obj = w2field;
			return $(this).each(function (field, index) {
				// Check for Custom Types
				if (typeof w2field.customTypes[options.type.toLowerCase()] == 'function') {
					w2field.customTypes[options.type.toLowerCase()].call(this, options);
					return;
				}  
				// Common Types
				var tp	= options.type.toLowerCase();
				var obj	= this;
				var defaults;
				var helper;
				var pr;
				var settings;

				switch (tp) {

					case 'clear': // removes any previous field type
						$(this)
							.off('focus')
							.off('blur')
							.off('keypress')
							.off('keydown')
							.off('change')
							.removeData(); // removes all attached data
						if ($(this).prev().hasClass('w2ui-list')) {	// if enum
							$(this).prev().remove();
							$(this).removeAttr('tabindex').css('border-color', '').show();
						}
						if ($(this).prev().hasClass('w2ui-upload')) { // if upload
							$(this).prev().remove();
							$(this).removeAttr('tabindex').css('border-color', '').show();
						}
						if ($(this).prev().hasClass('w2ui-field-helper')) {	// helpers
							$(this).css('padding-left', $(this).css('padding-top'));
							$(this).prev().remove();
						}
						if ($(this).next().hasClass('w2ui-field-helper')) {	// helpers
							$(this).css('padding-right', $(this).css('padding-top'));
							$(this).next().remove();
						}
						if ($(this).next().hasClass('w2ui-field-helper')) {	// helpers
							$(this).next().remove();
						}
						break;

					case 'text':
					case 'int':
					case 'float':
					case 'money':
					case 'alphanumeric':
					case 'hex':
						defaults = {
							min		: null,
							max		: null,
							arrows	: false,
							keyboard	: true,
							suffix	: '',
							prefix	: ''
						};					
						options = $.extend({}, defaults, options);
						if (['text', 'alphanumeric', 'hex'].indexOf(tp) != -1) {
							options.arrows   = false;
							options.keyboard = false;
						}
						// init events
						$(this)
							.data('options', options)
							.on('keypress', function (event) { // keyCode & charCode differ in FireFox
								if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
								if (event.keyCode == 13) $(this).change();
								var ch = String.fromCharCode(event.charCode);
								if (!checkType(ch, true)) {
									if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
									return false;
								}
							})
							.on('keydown', function (event, extra) {
								if (!options.keyboard) return;
								var cancel = false;
								var v = $(obj).val();
								if (!checkType(v)) v = options.min || 0; else v = parseFloat(v);
								var key = event.keyCode || extra.keyCode;
								var inc = 1;
								if (event.ctrlKey || event.metaKey) inc = 10;
								switch (key) {
									case 38: // up
										$(obj).val((v + inc <= options.max || options.max === null ? v + inc : options.max)).change();
										if (tp == 'money') $(obj).val( Number($(obj).val()).toFixed(2) );
										cancel = true;
										break;
									case 40: // down
										$(obj).val((v - inc >= options.min || options.min === null ? v - inc : options.min)).change();
										if (tp == 'money') $(obj).val( Number($(obj).val()).toFixed(2) );
										cancel = true;
										break;
								}
								if (cancel) {
									event.preventDefault();
									// set cursor to the end
									setTimeout(function () { obj.setSelectionRange(obj.value.length, obj.value.length); }, 0);
								}
							})
							.on('change', function (event) {
								// check max/min
								var v  = $(obj).val();
								var cancel = false;
								if (options.min !== null && v !== '' && v < options.min) { $(obj).val(options.min).change(); cancel = true; }
								if (options.max !== null && v !== '' && v > options.max) { $(obj).val(options.max).change(); cancel = true; }
								if (cancel) {
									event.stopPropagation();
									event.preventDefault();
									return false;
								}
								// check validity
								if (this.value !== '' && !checkType(this.value)) $(this).val(options.min !== null ? options.min : '');
							});
						if ($(this).val() === '' && options.min !== null) $(this).val(options.min);
						if (options.prefix !== '') {
							$(this).before(
								'<div class="w2ui-field-helper">'+ 
									options.prefix + 
								'</div>');
							helper = $(this).prev();
							helper
								.css({
									'color'				: $(this).css('color'),
									'font-family'		: $(this).css('font-family'),
									'font-size'			: $(this).css('font-size'),
									'padding-top'		: $(this).css('padding-top'),
									'padding-bottom'	: $(this).css('padding-bottom'),
									'padding-left'		: $(this).css('padding-left'),
									'padding-right'	: 0,
									'margin-top'		: (parseInt($(this).css('margin-top'), 10) + 1) + 'px',
									'margin-bottom'	: (parseInt($(this).css('margin-bottom'), 10) + 1) + 'px',
									'margin-left'		: 0,
									'margin-right'		: 0
								})
								.on('click', function () { 
									$(this).next().focus(); 
								});
							$(this).css('padding-left', (helper.width() + parseInt($(this).css('padding-left'), 10) + 5) + 'px');
						}
						pr = parseInt($(this).css('padding-right'), 10);
						if (options.arrows !== '') {
							$(this).after(
								'<div class="w2ui-field-helper" style="border: 1px solid transparent">&nbsp;'+ 
								'	<div class="w2ui-field-up" type="up">'+
								'		<div class="arrow-up" type="up"></div>'+
								'	</div>'+
								'	<div class="w2ui-field-down" type="down">'+
								'		<div class="arrow-down" type="down"></div>'+
								'	</div>'+
								'	<div style="position: absolute; height: 1px; border-top: 1px solid red"></div>'+
								'</div>');
							var height = w2utils.getSize(this, 'height');
							helper = $(this).next();
							helper
								.css({
									'color'			: $(this).css('color'),
									'font-family'	: $(this).css('font-family'),
									'font-size'		: $(this).css('font-size'),
									'height'			: ($(this).height() + parseInt($(this).css('padding-top'), 10) + parseInt($(this).css('padding-bottom'), 10) ) + 'px',
									'padding'		: '0px',
									'margin-top'	: (parseInt($(this).css('margin-top'), 10) + 1) + 'px',
									'margin-bottom': '0px',
									'border-left'	: '1px solid silver'
								})
								.css('margin-left', '-'+ (helper.width() + parseInt($(this).css('margin-right'), 10) + 12) + 'px')
								.on('mousedown', function (event) {
									var btn = this;
									var evt = event;
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
										$(obj).focus().trigger($.Event("keydown"), { 
											keyCode : ($(evt.target).attr('type') == 'up' ? 38 : 40) 
										});
										if (notimer !== false) $('body').data('_field_update_timer', setTimeout(update, 60));
									}
								});
							pr += helper.width() + 12;
							$(this).css('padding-right', pr + 'px');
						}
						if (options.suffix !== '') {
							$(this).after(
								'<div class="w2ui-field-helper">'+ 
									options.suffix + 
								'</div>');
							helper = $(this).next();
							helper
								.css({
									'color'				: $(this).css('color'),
									'font-family'		: $(this).css('font-family'),
									'font-size'			: $(this).css('font-size'),
									'padding-top'		: $(this).css('padding-top'),
									'padding-bottom'	: $(this).css('padding-bottom'),
									'padding-left'		: '3px',
									'padding-right'	: $(this).css('padding-right'),
									'margin-top'		: (parseInt($(this).css('margin-top'), 10) + 1) + 'px',
									'margin-bottom'	: (parseInt($(this).css('margin-bottom'), 10) + 1) + 'px'
								})
								.on('click', function () { 
									$(this).prev().focus(); 
								});
							helper.css('margin-left', '-'+ (helper.width() + parseInt($(this).css('padding-right'), 10) + 5) + 'px');
							pr += helper.width() + 3;
							$(this).css('padding-right', pr + 'px');
						}

						function checkType(ch, loose) {
							switch (tp) {
								case 'int':
									if (loose && ['-'].indexOf(ch) != -1) return true;
									return w2utils.isInt(ch);
								case 'float':
									if (loose && ['-','.'].indexOf(ch) != -1) return true;
									return w2utils.isFloat(ch);
								case 'money':
									if (loose && ['-','.','$','€','£','¥'].indexOf(ch) != -1) return true;
									return w2utils.isMoney(ch);
								case 'hex':
									return w2utils.isHex(ch);
								case 'alphanumeric': 
									return w2utils.isAlphaNumeric(ch);
							}
							return true;
						}
						break;

					case 'date':
						obj = this;
						defaults = {
							format	: w2utils.settings.date_format, // date format
							start		: '',				// start of selectable range
							end		: '',				// end of selectable range
							blocked	: {},				// {'4/11/2011': 'yes'}
							colored	: {}				// {'4/11/2011': 'red:white'}
						};
						options = $.extend({}, defaults, options);
						// -- insert div for calendar
						$(this) // remove transtion needed for functionality
							.css( { 'transition': 'none', '-webkit-transition': 'none', '-moz-transition': 'none', '-ms-transition': 'none', '-o-transition': 'none' })
							.data("options", options)
							.on('focus', function () {
								var top  = parseFloat($(obj).offset().top) + parseFloat(obj.offsetHeight);
								var left = parseFloat($(obj).offset().left);
								clearInterval($(obj).data('mtimer'));
								$('#global_calendar_div').remove();
								$('body').append('<div id="global_calendar_div" style="top: '+ (top + parseInt(obj.offsetHeight, 10)) +'px; left: '+ left +'px;" '+
									' class="w2ui-reset w2ui-calendar" '+
									' onmousedown="'+
									'		if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; '+
									'		if (event.preventDefault) event.preventDefault(); else return false;">'+
									'</div>');
								$('#global_calendar_div')
									.html($().w2field('calendar_get', obj.value, options))
									.css({
										left: left + 'px',
										top: top + 'px'
									})
									.data('el', obj)
									.show();
								var max = $(window).width() + $(document).scrollLeft() - 1;
								if (left + $('#global_calendar_div').width() > max) {
									$('#global_calendar_div').css('left', (max - $('#global_calendar_div').width()) + 'px');
								}
								// monitors
								var mtimer = setInterval(function () { 
									var max = $(window).width() + $(document).scrollLeft() - 1;
									var left = $(obj).offset().left;
									if (left + $('#global_calendar_div').width() > max) left = max - $('#global_calendar_div').width();
									// monitor if moved
									if ($('#global_calendar_div').data('position') != ($(obj).offset().left) + 'x' + ($(obj).offset().top  + obj.offsetHeight)) {
										$('#global_calendar_div').css({
											'-webkit-transition': '.2s',
											left: left + 'px',
											top : ($(obj).offset().top + obj.offsetHeight) + 'px'
										}).data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));
									}
									// monitor if destroyed
									if ($(obj).length === 0 || ($(obj).offset().left === 0 && $(obj).offset().top === 0)) {
										clearInterval(mtimer);
										$('#global_calendar_div').remove();
										return;
									}
								}, 100);
								$(obj).data('mtimer', mtimer);
							})
							.on('blur', function (event) {
								// trim empty spaces
								$(obj).val($.trim($(obj).val()));
								// check if date is valid
								if ($.trim($(obj).val()) !== '' && !w2utils.isDate($(obj).val(), options.format)) {
									$(this).w2tag(w2utils.lang('Not a valid date') + ': '+ options.format);
								}
								clearInterval($(obj).data('mtimer'));
								$('#global_calendar_div').remove();
							})
							.on('keypress', function (event) {
								var obj = this;
								setTimeout(function () {
									$('#global_calendar_div').html( $().w2field('calendar_get', obj.value, options) );
								}, 10);
							});
							setTimeout(function () {
								// if it is unix time - convert to readable date
								if (w2utils.isInt(obj.value)) obj.value = w2utils.formatDate(obj.value, options.format);
							}, 1);
						break;
						
					case 'time':
						break;

					case 'datetime':
						break;
						
					case 'color':
						obj = this;
						defaults = {
							prefix: '#',
							suffix: '<div style="margin-top: 1px; height: 12px; width: 12px;"></div>'
						};
						options = $.extend({}, defaults, options);
						// -- insert div for color
						$(this)
							.attr('maxlength', 6)
							.on('focus', function () {
								var top  = parseFloat($(obj).offset().top) + parseFloat(obj.offsetHeight);
								var left = parseFloat($(obj).offset().left);
								clearInterval($(obj).data('mtimer'));
								$('#global_color_div').remove();
								$('body').append('<div id="global_color_div" style="top: '+ (top + parseInt(obj.offsetHeight, 10)) +'px; left: '+ left +'px;" '+
									' class="w2ui-reset w2ui-calendar" '+
									' onmousedown="'+
									'		if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; '+
									'		if (event.preventDefault) event.preventDefault(); else return false;">'+
									'</div>');
								$('#global_color_div')
									.html($().w2field('getColorHTML', obj.value))
									.css({
										left: left + 'px',
										top: top + 'px'
									})
									.data('el', obj)
									.show();
								var max = $(window).width() + $(document).scrollLeft() - 1;
								if (left + $('#global_color_div').width() > max) {
									$('#global_color_div').css('left', (max - $('#global_color_div').width()) + 'px');
								}
								// monitors
								var mtimer = setInterval(function () { 
									var max  = $(window).width() + $(document).scrollLeft() - 1;
									var left = $(obj).offset().left;
									if (left + $('#global_color_div').width() > max) left = max - $('#global_color_div').width();
									// monitor if moved
									if ($('#global_color_div').data('position') != ($(obj).offset().left) + 'x' + ($(obj).offset().top  + obj.offsetHeight)) {
										$('#global_color_div').css({
											'-webkit-transition': '.2s',
											left: left + 'px',
											top : ($(obj).offset().top + obj.offsetHeight) + 'px'
										}).data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));
									}
									// monitor if destroyed
									if ($(obj).length === 0 || ($(obj).offset().left === 0 && $(obj).offset().top === 0)) {
										clearInterval(mtimer);
										$('#global_color_div').remove();
										return;
									}
								}, 100);
								$(obj).data('mtimer', mtimer);
							})
							.on('click', function () {
								$(this).trigger('focus');
							})
							.on('blur', function (event) {
								// trim empty spaces
								$(obj).val($.trim($(obj).val()));
								clearInterval($(obj).data('mtimer'));
								$('#global_color_div').remove();
							})
							.on('keydown', function (event) { // need this for cut/paster
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
							})
							.on('keyup', function (event) {
								if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) $(this).prop('maxlength', 6);
							})
							.on('keypress', function (event) { // keyCode & charCode differ in FireFox
								if (event.keyCode == 13) $(this).change();
								//if (event.ct)
								var ch = String.fromCharCode(event.charCode);
								if (!w2utils.isHex(ch, true)) {
									if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
									return false;
								}
							})
							.on('change', function (event) {
								var color = '#' + $(this).val();
								if ($(this).val().length != 6 && $(this).val().length != 3) color = '';
								$(this).next().find('div').css('background-color', color);
							});
						if (options.prefix !== '') {
							$(this).before(
								'<div class="w2ui-field-helper">'+ 
									options.prefix + 
								'</div>');
							helper = $(this).prev();
							helper
								.css({
									'color'				: $(this).css('color'),
									'font-family'		: $(this).css('font-family'),
									'font-size'			: $(this).css('font-size'),
									'padding-top'		: $(this).css('padding-top'),
									'padding-bottom'	: $(this).css('padding-bottom'),
									'padding-left'		: $(this).css('padding-left'),
									'padding-right'	: 0,
									'margin-top'		: (parseInt($(this).css('margin-top'), 10) + 1) + 'px',
									'margin-bottom'	: (parseInt($(this).css('margin-bottom'), 10) + 1) + 'px',
									'margin-left'		: 0,
									'margin-right'		: 0
								})
								.on('click', function () { 
									$(this).next().focus(); 
								});
							$(this).css('padding-left', (helper.width() + parseInt($(this).css('padding-left'), 10) + 2) + 'px');
						}
						if (options.suffix !== '') {
							$(this).after(
								'<div class="w2ui-field-helper">'+ 
									options.suffix + 
								'</div>');
							helper = $(this).next();
							helper
								.css({
									'color'				: $(this).css('color'),
									'font-family'		: $(this).css('font-family'),
									'font-size'			: $(this).css('font-size'),
									'padding-top'		: $(this).css('padding-top'),
									'padding-bottom'	: $(this).css('padding-bottom'),
									'padding-left'		: '3px',
									'padding-right'	: $(this).css('padding-right'),
									'margin-top'		: (parseInt($(this).css('margin-top'), 10) + 1) + 'px',
									'margin-bottom'	: (parseInt($(this).css('margin-bottom'), 10) + 1) + 'px'
								})
								.on('click', function () { 
									$(this).prev().focus(); 
								});
							helper.css('margin-left', '-'+ (helper.width() + parseInt($(this).css('padding-right'), 10) + 4) + 'px');
							pr = helper.width() + parseInt($(this).css('padding-right'), 10) + 4;
							$(this).css('padding-right', pr + 'px');
							// set color to current
							helper.find('div').css('background-color', '#' + $(obj).val());
						}
						break;

					case 'select':
					case 'list':
						if (this.tagName != 'SELECT') {
							console.log('ERROR: You can only apply $().w2field(\'list\') to a SELECT element');
							return;
						}
						defaults ={
							url		: '',
							items		: [],
							value		: null,
							showNone	: true
						};
						settings = $.extend({}, defaults, options);
						$(obj).data('settings', settings);
						// define refresh method
						obj.refresh = function () {
							var settings	= $(obj).data('settings');
							var html			= '';
							var items		= w2field.cleanItems(settings.items);
							// build options
							if (settings.showNone) html = '<option value="">- '+ w2utils.lang('none') +' -</option>';
							for (var i in items) {
								if (!settings.showNone && settings.value === null) settings.value = items[i].id;
								html += '<option value="'+ items[i].id +'">'+ items[i].text + '</option>';
							}
							$(obj).html(html);
							$(obj).val(settings.value);
							if ($(obj).val() != settings.value) $(obj).change();
						};
						// pull from server
						if (settings.url !== '' ) {
							$.ajax({
								type		: 'GET',
								dataType	: 'text',
								url		: settings.url,
								complete	: function (xhr, status) {
									if (status == 'success') {
										var data			= $.parseJSON(xhr.responseText);
										var settings	= $(obj).data('settings');
										settings.items	= w2field.cleanItems(data.items);
										$(obj).data('settings', settings);
										obj.refresh();
									}
								}
							});
						} else { // refresh local
							obj.refresh();
						}
						break;

					case 'enum':
						if (this.tagName != 'INPUT') {
							console.log('ERROR: You can only apply $().w2field(\'enum\') to an INPUT element');
							return;
						}
						defaults = {
							url			: '',
							items			: [],
							selected		: [],					// preselected items
							max			: 0,					// maximum number of items that can be selected 0 for unlim
							maxHeight	: 172,				// max height for input control to grow
							showAll		: false,				// if true then show selected item in drop down
							match			: 'begins with',	// ['begins with', 'contains']
							render		: null,				// render(item, selected)
							maxCache		: 500,				// number items to cache
							onShow		: null,				// when overlay is shown onShow(settings)
							onHide		: null,				// when overlay is hidden onHide(settings)
							onAdd			: null,				// onAdd(item, settings)
							onRemove		: null,				// onRemove(index, settings)
							onItemOver	: null,
							onItemOut	: null,
							onItemClick	: null
						};
						settings = $.extend({}, defaults, options);

						// normalize items and selected
						settings.items		= w2field.cleanItems(settings.items);
						settings.selected	= w2field.cleanItems(settings.selected);

						$(this).data('selected', settings.selected); 
						$(this).css({ 
							'padding'				: '0px',
							'border-color'			: 'transparent',
							'background-color'	: 'transparent',
							'outline'				: 'none'
						});

						// add item to selected
						this.add = function (item) {
							if ($(this).attr('readonly')) return;
							var selected = $(this).data('selected');
							var settings = $(this).data('settings');
							if (typeof settings.onAdd == 'function') {
								var cancel = settings.onAdd(item, settings);
								if (cancel === false) return;
							}
							if (!$.isArray(selected)) selected = [];
							if (settings.max !== 0 && settings.max <= selected.length) {
								// if max reached, replace last
								selected.splice(selected.length - 1, 1);
							}
							selected.push(item);
							$(this).data('last_del', null);
							$(this).trigger('change');
						};

						this.remove = function (index) {
							var settings = $(this).data('settings');
							if (typeof settings.onRemove == 'function') {
								var cancel = settings.onRemove(index, settings);
								if (cancel === false) return;
							}
							if ($(this).attr('readonly')) return;
							$(this).data('selected').splice(index, 1);
							$(this).parent().find('[title=Remove][index='+ index +']').remove();
							this.refresh(); 
							w2field.list_render.call(this);
							$(this).trigger('change');
						};

						this.show = function () {
							if ($(this).attr('readonly')) return;
							var settings = $(this).data('settings');
							// insert global div
							if ($('#w2ui-global-items').length === 0) {
								$('body').append('<div id="w2ui-global-items" class="w2ui-reset w2ui-items"></div>');
							} else {
								// ignore second click
								return;
							}
							var div = $('#w2ui-global-items');
							div.css({
									display	: 'block',
									left		: ($(obj).offset().left) + 'px',
									top		: ($(obj).offset().top + obj.offsetHeight + 3) + 'px'
								})
								.width(w2utils.getSize(obj, 'width'))
								.data('position', ($(obj).offset().left) + 'x' + ($(obj).offset().top + obj.offsetHeight));

							// show drop content
							w2field.list_render.call(obj);

							// monitors
							var monitor = function () { 
								var div = $('#w2ui-global-items');
								// monitor if destroyed
								if ($(obj).length === 0 || ($(obj).offset().left === 0 && $(obj).offset().top === 0)) {
									clearInterval($(obj).data('mtimer'));
									hide(); 
									return;
								}
								// monitor if moved
								if (div.data('position') != ($(obj).offset().left) + 'x' + ($(obj).offset().top  + obj.offsetHeight)) {
									div.css({
										'-webkit-transition': '.2s',
										left: ($(obj).offset().left) + 'px',
										top : ($(obj).offset().top + obj.offsetHeight + 3) + 'px'
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
							// onShow
							if (typeof settings.onShow == 'function') settings.onShow.call(this, settings);
						};

						this.hide = function () {
							var settings = $(this).data('settings');
							clearTimeout($(obj).data('mtimer'));
							$('#w2ui-global-items').remove();
							// onShow
							if (typeof settings.onHide == 'function') settings.onHide.call(this, settings);
						};

						// render controls with all items in it
						this.refresh = function () {
							var obj = this;
							// remove all items
							$($(this).data('div')).remove();
							// rebuild it
							var margin = 'margin-top: ' + $(this).css('margin-top') + '; ' +
											'margin-bottom: ' + $(this).css('margin-bottom') + '; ' +
											'margin-left: ' + $(this).css('margin-left') + '; ' +
											'margin-right: ' + $(this).css('margin-right') + '; '+
											'width: ' + (w2utils.getSize(this, 'width') -
															parseInt($(this).css('margin-left'), 10) -
															parseInt($(this).css('margin-right'), 10)) + 'px; ';
							var html = '<div class="w2ui-list" style="'+ margin + ';">'+
										'<div style="padding: 0px; margin: 0px; display: inline-block"><ul>';
							var selected = $(this).data('selected');
							for (var s in selected) {
								html +=	'<li style="'+ ($(this).data('last_del') == s ? 'opacity: 0.5' : '') +'">'+
											'	<div title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&nbsp;&nbsp;</div>'+
												selected[s].text +
											'</li>';
							}
							html += '<li style="padding-left: 0px; padding-right: 0px" class="nomouse">'+
									'	<input type="text" '+ ($(this).attr('readonly') ? 'readonly': '') +' style="background-color: transparent">'+
									'</li>'+
									'</ul></div>'+
									'</div>';
							$(this).before(html);

							var div = $(this).prev()[0];
							$(this).data('div', div);
							// click on item
							$(div).find('li')
								.data('mouse', 'out')
								.on('click', function (event) {
									if ($(event.target).hasClass('nomouse')) return;
									if (event.target.title == w2utils.lang('Remove')) {
										obj.remove($(event.target).attr('index'));
										return;
									}
									event.stopPropagation();
									if (typeof settings.onItemClick == 'function') settings.onItemClick.call(this, settings);
								})
								.on('mouseover', function (event) {
									var tmp = event.target;
									if (tmp.tagName != 'LI') tmp = tmp.parentNode;
									if ($(tmp).hasClass('nomouse')) return;
									if ($(tmp).data('mouse') == 'out') {
										if (typeof settings.onItemOver == 'function') settings.onItemOver.call(this, settings);
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
											if (typeof settings.onItemOut == 'function') settings.onItemOut.call(this, settings);
										}
									}, 0);
								});
							$(div) // click on item
								.on('click', function (event) {
									$(this).find('input').focus();
								})
								.find('input')
								.on('focus', function (event) {
									$(div).css({ 'outline': 'auto 5px -webkit-focus-ring-color', 'outline-offset': '-2px' });
									obj.show();
									if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
								})
								.on('blur', function (event) {
									$(div).css('outline', 'none');
									obj.hide();
									if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
								});
							// adjust height
							obj.resize();
						};
						this.resize = function () {
							var settings = $(this).data('settings');
							var div = $(this).prev();
							var cntHeight = $(div).find('>div').height(); //w2utils.getSize(div, 'height');
							if (cntHeight < 23) cntHeight = 23;
							if (cntHeight > settings.maxHeight) cntHeight = settings.maxHeight;
							$(div).height(cntHeight + (cntHeight % 23 === 0 ? 0 : 23 - cntHeight % 23) );
							if (div.length > 0) div[0].scrollTop = 1000;
							$(this).height(cntHeight);
						};
						// init control
						$(this).data('settings', settings).attr('tabindex', -1);
						obj.refresh();
						break;

					case 'upload':
						if (this.tagName != 'INPUT') {
							console.log('ERROR: You can only apply $().w2field(\'upload\') to an INPUT element');
							return;							
						}
						// init defaults
						defaults = {
							url				: '',		// not yet implemented
							base64			: true,	// if true max file size is 20mb (only tru for now)
							hint				: w2utils.lang('Attach files by dragging and dropping or Click to Select'),
							max				: 0,		// max number of files, 0 - unlim
							maxSize			: 0,		// max size of all files, 0 - unlim
							maxFileSize		: 0,		// max size of a single file, 0 -unlim
							onAdd				: null,
							onRemove			: null,
							onItemClick		: null,
							onItemDblClick	: null,
							onItemOver		: null,
							onItemOut		: null,
							onProgress		: null,	// not yet implemented
							onComplete		: null	// not yet implemented
						};
						settings = $.extend({}, defaults, options);
						if (settings.base64 === true) {
							if (settings.maxSize === 0) settings.maxSize = 20 * 1024 * 1024; // 20mb
							if (settings.maxFileSize === 0) settings.maxFileSize = 20 * 1024 * 1024; // 20mb
						}
						var selected = settings.selected;
						delete settings.selected;
						if (!$.isArray(selected)) selected = [];
						$(this).data('selected', selected).data('settings', settings).attr('tabindex', -1);
						w2field.upload_init.call(this);

						this.refresh = function () {
							var obj			= this;
							var div			= $(this).data('div');
							var settings	= $(this).data('settings');
							var selected	= $(this).data('selected');
							var clickEvent	= function (event) {
								if (typeof settings.onItemClick == 'function') {
									var ret = settings.onItemClick.call(obj, $(this).data('file'));
									if (ret === false) return;
								}
								if (!$(event.target).hasClass('file-delete')) event.stopPropagation();
							};
							var dblClickEvent = function (event) {
								if (typeof settings.onItemDblClick == 'function') {
									var ret = settings.onItemDblClick.call(obj, $(this).data('file'));
									if (ret === false) return;
								}
								event.stopPropagation();
								if (document.selection) document.selection.empty(); else document.defaultView.getSelection().removeAllRanges();
							};
							var mouseOverEvent = function (event) {
								if (typeof settings.onItemOver == 'function') {
									var ret = settings.onItemOver.call(obj, $(this).data('file'));
									if (ret === false) return;
								}
								var file = $(this).data('file');
								$(this).w2overlay(
									previewHTML.replace('##FILE##', (file.content ? 'data:'+ file.type +';base64,'+ file.content : '')),
									{ top: -4 }
								);
							};
							var mouseOutEvent = function () {
								if (typeof settings.onItemOut == 'function') {
									var ret = settings.onItemOut.call(obj, $(this).data('file'));
									if (ret === false) return;
								}
								$(this).w2overlay();
							};
							$(div).find('li').remove();
							$(div).find('> span:first-child').css('line-height', ($(div).height() - w2utils.getSize(div, '+height') - 8) + 'px');
							for (var s in selected) {
								var file = selected[s];
								// add li element
								var cnt = $(div).find('.file-list li').length;
								$(div).find('> span:first-child').remove();
								$(div).find('.file-list').append('<li id="file-' + cnt + '">' + 
									'	<div class="file-delete" onmouseover="event.stopPropagation();">&nbsp;&nbsp;</div>' + 
									'	<span class="file-name">' + file.name + '</span>' +
									'	<span class="file-size"> - ' + w2utils.size(file.size) + '</span>'+
									'</li>');
								var li = $(div).find('.file-list #file-' + cnt);
								var previewHTML = "";
								if ((/image/i).test(file.type)) { // image
									previewHTML = '<div style="padding: 2px;">'+
										'	<img src="##FILE##" style="max-width: 300px;" '+
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
								previewHTML += '<div style="padding: 5px;">'+
									'	<table cellpadding="2">'+
									'	<tr><td '+ td1 +'>Name:</td><td '+ td2 +'>'+ file.name +'</td></tr>'+
									'	<tr><td '+ td1 +'>Size:</td><td '+ td2 +'>'+ w2utils.size(file.size) +'</td></tr>'+
									'	<tr><td '+ td1 +'>Type:</td><td '+ td2 +'>' +
									'		<span style="width: 200px; display: block-inline; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'+ file.type +'</span>'+
									'	</td></tr>'+
									'	<tr><td '+ td1 +'>Modified:</td><td '+ td2 +'>'+ w2utils.date(file.modified) +'</td></tr>'+
									'	</table>'+
									'</div>';
								li.data('file', file)
									.on('click', clickEvent)
									.on('dblclick', dblClickEvent)
									.on('mouseover', mouseOverEvent)
									.on('mouseout', mouseOutEvent);
							}
						};
						this.refresh();
						break;

					case 'slider':
						// for future reference
						break;

					default: 
						console.log('ERROR: w2field does not recognize "'+ options.type + '" field type.');
						break;
				}
			});
		},
		
		// ******************************************************
		// -- Implementation

		addType: function (type, handler) {
			w2field.customTypes[String(type).toLowerCase()] = handler;
		},

		cleanItems: function (items) {
			var newItems = [];
			for (var i in items) {
				var id   = '';
				var text = '';
				var opt  = items[i];
				if (opt === null) continue;
				if ($.isPlainObject(items)) {
					id		= i;
					text	= opt;
				} else {
					if (typeof opt == 'object') {
						if (typeof opt.id != 'undefined')	id		= opt.id;
						if (typeof opt.value != 'undefined')id		= opt.value;
						if (typeof opt.txt != 'undefined')	text	= opt.txt;
						if (typeof opt.text != 'undefined')	text	= opt.text;
					}
					if (typeof opt == 'string') {
						if (String(opt) === '') continue;
						id   = opt;
						text = opt;
						opt  = {};
					}
				}
				if (w2utils.isInt(id)) id = parseInt(id, 10);
				if (w2utils.isFloat(id)) id = parseFloat(id);
				newItems.push($.extend({}, opt, { id: id, text: text }));
			}
			return newItems;
		},

		// ******************************************************
		// -- Upload

		upload_init: function () {
			var obj = this;   // this -> input element
			var settings = $(this).data('settings');
			// create drop area if needed
			var el = $(obj).prev();
			if (el.length > 0 && el[0].tagName == 'DIV' && el.hasClass('w2ui-upload')) el.remove();
			// rebuild it
			var margin = 'margin-top: ' + $(obj).css('margin-top') + '; ' +
							'margin-bottom: ' + $(obj).css('margin-bottom') + '; ' +
							'margin-left: ' + $(obj).css('margin-left') + '; ' +
							'margin-right: ' + $(obj).css('margin-right') + '; '+
							'width: ' + (w2utils.getSize(obj, 'width') -
										parseInt($(obj).css('margin-left'), 10) -
										parseInt($(obj).css('margin-right'), 10)) + 'px; '+
							'height: ' + (w2utils.getSize(obj, 'height') -
										parseInt($(obj).css('margin-top'), 10) -
										parseInt($(obj).css('margin-bottom'), 10)) + 'px; ';
			var html = 
				'<div style="'+ margin +'" class="w2ui-upload">'+
				'	<span>'+ settings.hint +'</span>'+
				'	<ul class="file-list"></ul>'+
				'	<input class="file-input" type="file" name="attachment" multiple style="display: none">'+
				'</div>';
			$(obj)
				.css({
					'display1'		: 'none',
					'border-color'	: 'transparent'
				})
				.before(html);
			$(obj).data('div', $(obj).prev()[0]);
			var div = $(obj).data('div');
			// if user selects files through input control
			$(div).find('.file-input')
				.off('change')
				.on('change', function () {
					if (typeof this.files !== "undefined") {
						for (var i = 0, l = this.files.length; i < l; i++) {
							w2field.upload_add.call(obj, this.files[i]);
						}
					}
				});

			// if user clicks drop zone
			$(div)
				.off('click')
				.on('click', function (event) {
					$(div).w2tag();
					if (event.target.tagName == 'LI' || $(event.target).hasClass('file-size')) {
						return;
					}
					if ($(event.target).hasClass('file-delete')) {
						w2field.upload_remove.call(obj, event.target.parentNode);
						return;
					}
					if (event.target.tagName != 'INPUT') {
						var settings = $(obj).data('settings');
						var selected = $(obj).data('selected');
						var cnt  = 0;
						for (var s in selected) { cnt++; }
						if (cnt < settings.max || settings.max === 0) $(div).find('.file-input').click();
					}
				})
				.off('dragenter')
				.on('dragenter', function (event) {
					$(div).addClass('dragover');
				})
				.off('dragleave')
				.on('dragleave', function (event) {
					$(div).removeClass('dragover');
				})
				.off('drop')
				.on('drop', function (event) {
					$(div).removeClass('dragover');
					var files = event.originalEvent.dataTransfer.files;
					for (var i=0, l=files.length; i<l; i++) w2field.upload_add.call(obj, files[i]);
					// cancel to stop browser behaviour
					event.preventDefault();
					event.stopPropagation();
				})
				.off('dragover')
				.on('dragover', function (event) { 
					// cancel to stop browser behaviour
					event.preventDefault();
					event.stopPropagation();
				});
		},

		upload_add: function (file) {
			var obj = this;   // this -> input element
			var div = $(obj).data('div');
			var settings = $(obj).data('settings');
			var selected = $(obj).data('selected');
			var newItem = {
				name		: file.name,
				type		: file.type,
				modified	: file.lastModifiedDate,
				size		: file.size,
				content	: null
			};
			var size = 0;
			var cnt  = 0;
			var err;
			for (var s in selected) { size += selected[s].size; cnt++; }
			// check params
			if (settings.maxFileSize !== 0 && newItem.size > settings.maxFileSize) {
				err = 'Maximum file size is '+ w2utils.size(settings.maxFileSize);
				$(div).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (settings.maxSize !== 0 && size + newItem.size > settings.maxSize) {
				err = 'Maximum total size is '+ w2utils.size(settings.maxFileSize);
				$(div).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (settings.max !== 0 && cnt >= settings.max) {
				err = 'Maximum number of files is '+ settings.max;
				$(div).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (typeof settings.onAdd == 'function') {
				var ret = settings.onAdd.call(obj, newItem);
				if (ret === false) return;
			}
			selected.push(newItem);
			// read file as base64
			if (typeof FileReader !== "undefined" && settings.base64 === true) {
				var reader = new FileReader();
				// need a closure
				reader.onload = (function () {
					return function (event) {
						var fl  = event.target.result;
						var ind = fl.indexOf(',');
						newItem.content = fl.substr(ind+1);
						obj.refresh();
						$(obj).trigger('change');
					};
				})();
				reader.readAsDataURL(file);
			} else {
				obj.refresh();
				$(obj).trigger('change');
			}
		},

		upload_remove: function (li) {
			var obj = this;   // this -> input element
			var div = $(obj).data('div');
			var settings = $(obj).data('settings');
			var selected = $(obj).data('selected');
			var file = $(li).data('file');
			// run event
			if (typeof settings.onRemove == 'function') {
				var ret = settings.onRemove.call(obj, file);
				if (ret === false) return false;
			}			
			// remove from selected
			for (var i = selected.length - 1; i >= 0; i--) {
				if (selected[i].name == file.name && selected[i].size == file.size) {
					selected.splice(i, 1);
				}
			}
			$(li).fadeOut('fast');
			setTimeout(function () { 
				$(li).remove(); 
				// if all files remoted
				if (selected.length === 0) {
					$(div).prepend('<span>'+ settings.hint +'</span>');
				}
				obj.refresh();
				$(obj).trigger('change');
			}, 300);
		},

		// ******************************************************
		// -- Enum

		list_render: function (search) {
			var obj			= this;
			var div			= $('#w2ui-global-items');
			var settings	= $(this).data('settings');
			var items		= settings.items;
			var selected	= $(this).data('selected');
			var match;
			if (div.length === 0) return; // if it is hidden

			// build overall html
			if (typeof search == 'undefined') {
				var html		= '';
				html += '<div class="w2ui-items-list"></div>';						
				div.html(html);
				search = '';
			}
			$(this).data('last_search', search);
			if (typeof $(obj).data('last_index') == 'undefined' || $(obj).data('last_index') === null) $(obj).data('last_index', 0);

			// pull items from url
			if (typeof settings.last_total == 'undefined') settings.last_total = -1;
			if (typeof settings.last_search_len == 'undefined') settings.last_search_len = 0;
			if (typeof settings.last_search_match == 'undefined') settings.last_search_match = -1;
			if (settings.url !== '' && (
						(items.length === 0 && settings.last_total !== 0) ||
						(search.length > settings.last_search_len && settings.last_total > settings.maxCache) ||
						(search.length < settings.last_search_match && search.length != settings.last_search_len)
				)
			) {
				match = false;
				if (settings.last_total < settings.maxCache) match = true;
				$.ajax({
					type		: 'GET',
					dataType	: 'text',
					url		: settings.url,
					data : {
						search: search,
						max	: settings.maxCache
					},
					complete: function (xhr, status) {
						settings.last_total = 0;
						if (status == 'success') {
							var data = $.parseJSON(xhr.responseText);
							if (match === false && data.total < settings.maxCache) { settings.last_search_match = search.length; }
							settings.last_search_len = search.length;
							settings.last_total = data.total;
							settings.items      = data.items;
							w2field.list_render.call(obj, search);
						}
					}
				});
			}
			
			// build items
			var i			= 0;
			var ihtml	= '<ul>';
			// get ids of all selected items
			var ids		= [];
			var a;
			for (a in selected){
				ids.push(w2utils.isInt(selected[a].id) ? parseInt(selected[a].id, 10) : String(selected[a].id));
			}
			// build list
			var group	= '';
			for (a in items) {
				var id  = items[a].id;
				var txt = items[a].text;
				// if already selected
				if ($.inArray(w2utils.isInt(id) ? parseInt(id, 10) : String(id), ids) != -1 && settings.showAll !== true) continue;
				// check match with search
				var txt1  = String(search).toLowerCase();
				var txt2  = txt.toLowerCase();
				match = (txt1.length <= txt2.length && txt2.substr(0, txt1.length) == txt1);
				if (settings.match.toLowerCase() == 'contains' && txt2.indexOf(txt1) != -1) match = true;
				if (match) {
					if (typeof settings.render == 'function') {
						txt = settings.render(items[a], selected);
					}
					if (txt !== false) {
						// render group if needed
						if (typeof items[a].group != 'undefined' && items[a].group != group) {
							group = items[a].group;
							ihtml += '<li class="w2ui-item-group" onmousedown="event.preventDefault()">'+ group +'</li>';
						}
						// render item
						ihtml += '\n<li index="'+ a +'" value="'+ id +'" '+
									'  onmouseover="$(this).parent().find(\'li\').removeClass(\'selected\'); $(this).addClass(\'selected\'); "'+
									'	class="'+ (i % 2 ? 'w2ui-item-even' : 'w2ui-item-odd') + (i == $(obj).data('last_index') ? " selected" : "") +'">'+
									txt +'</li>';
						if (i == $(obj).data('last_index')) $(obj).data('last_item', items[a]);
						i++;
					}
				}
			}
			ihtml += '</ul>';
			if (i === 0) {
				ihtml   = '<div class="w2ui-empty-list">'+ w2utils.lang('No items found') +'</div>';
				var noItems = true;
			}
			div.find('.w2ui-items-list').html(ihtml);
			$(this).data('last_max', i-1);

			// scroll selected into view
			if (div.find('li.selected').length > 0) div.find('li.selected')[0].scrollIntoView(false);

			// if menu goes off screen - add scrollbar
			div.css({ '-webkit-transition': '0s', height : 'auto' }); 
			var max_height = parseInt($(document).height(), 10) - parseInt(div.offset().top, 10) - 8;
			if (parseInt(div.height(), 10) > max_height) {
				div.css({ 
					height	: (max_height - 5) + 'px',
					overflow	: 'show'
				});
				$(div).find('.w2ui-items-list').css({
					height	: (max_height - 15) + 'px',
					overflow	: 'auto'
				});
			}

			// add events
			$(div)
				.off('mousedown')
				.on('mousedown', function (event) {
					var target	= event.target;
					if (target.tagName != "LI") target = $(target).parents('li');
					var id		= $(target).attr('index');
					if (!id) return;
					var item		= settings.items[id];
					if (typeof id == 'undefined') { if (event.preventDefault) event.preventDefault(); else return false; }
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
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
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
								if (event.preventDefault) event.preventDefault();
								break;
							case 40: // down
								curr++;
								if (curr > $(obj).data('last_max')) curr = $(obj).data('last_max');
								$(obj).data('last_index', curr);
								if (event.preventDefault) event.preventDefault(); 
								break;
							case 13: // enter
								if (typeof $(obj).data('last_item') == 'undefined' || $(obj).data('last_item') === null || noItems === true) break;
								var selected = $(obj).data('selected'); 
								obj.add($(obj).data('last_item'));
								// select next
								if (curr > $(obj).data('last_max') - 1) curr = $(obj).data('last_max')-1;
								$(obj).data('last_index', curr);
								$(obj).data('last_item', null);
								// refrech
								$(inp).val('');
								obj.refresh();
								if (event.preventDefault) event.preventDefault();
								break;
							case 8: // backspace
								if (String(inp.value) === '') {
									selected = $(obj).data('selected');

									if (typeof $(obj).data('last_del') == 'undefined' || $(obj).data('last_del') === null) {
										// mark for deletion
										if (!$.isArray(selected)) selected = [];
										$(obj).data('last_del', selected.length-1);
										// refrech
										obj.refresh();
									} else {
										// delete marked one
										obj.remove(selected.length - 1);
									}
								}
								break;
							default: 
								$(obj).data('last_index', 0);
								$(obj).data('last_del', null);
								break;
						}
						// adjust height
						obj.resize();

						// refresh menu
						if (!(event.keyCode == 8 && String(inp.value) === '')) {
							$(obj).prev().find('li').css('opacity', '1');
							$(obj).data('last_del', null);
						}
						if ($.inArray(event.keyCode, [16,91,37,39]) == -1) { // command and shift keys and arrows
							w2field.list_render.call(obj, inp.value); 
						}
					}, 10);
				});
		},

		// ******************************************************
		// -- Calendar

		calendar_get: function (date, options) {
			var td = new Date();
			var today = (Number(td.getMonth())+1) + '/' + td.getDate() + '/' + (String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900);
			if (String(date) === '' || String(date) == 'undefined') date = w2utils.formatDate(today, options.format);
			if (!w2utils.isDate(date, options.format)) date = w2utils.formatDate(today, options.format);
			// format date
			var tmp  = date.replace(/-/g, '/').replace(/\./g, '/').toLowerCase().split('/');
			var tmp2 = options.format.replace(/-/g, '/').replace(/\./g, '/').toLowerCase();
			var dt   = new Date();
			if (tmp2 == 'mm/dd/yyyy') dt = new Date(tmp[0] + '/' + tmp[1] + '/' + tmp[2]);
			if (tmp2 == 'm/d/yyyy') dt = new Date(tmp[0] + '/' + tmp[1] + '/' + tmp[2]);
			if (tmp2 == 'dd/mm/yyyy') dt = new Date(tmp[1] + '/' + tmp[0] + '/' + tmp[2]);
			if (tmp2 == 'd/m/yyyy') dt = new Date(tmp[1] + '/' + tmp[0] + '/' + tmp[2]);
			if (tmp2 == 'yyyy/dd/mm') dt = new Date(tmp[2] + '/' + tmp[1] + '/' + tmp[0]);
			if (tmp2 == 'yyyy/d/m') dt = new Date(tmp[2] + '/' + tmp[1] + '/' + tmp[0]);
			if (tmp2 == 'yyyy/mm/dd') dt = new Date(tmp[1] + '/' + tmp[2] + '/' + tmp[0]);
			if (tmp2 == 'yyyy/m/d') dt = new Date(tmp[1] + '/' + tmp[2] + '/' + tmp[0]);
			var html =  '<table cellpadding="0" cellspacing="0"><tr>' +
						'<td>'+ $().w2field('calendar_month', (dt.getMonth() + 1), dt.getFullYear(), options) +'</td>'+
						// '<!--td valign="top" style="background-color: #f4f4fe; padding: 8px; padding-bottom: 0px; padding-top: 22px; border: 1px solid silver; border-left: 0px;">'+
						// '	Jan <br> Feb <br> Mar <br> Apr <br> May <br> Jun <br> Jul <br> Aug <br> Sep <br> Oct <br> Nov <br> Dec'+
						// '</td>'+
						// '<td valign="top" style="background-color: #f4f4fe; padding: 6px; padding-bottom: 0px; padding-top: 22px; border: 1px solid silver; border-left: 0px;">'+
						// '	2001 <br> 2002 <br> 2003 <br> 2004'+
						// '</td-->'+
						'</tr></table>';
			return html;
		},
		
		calendar_next: function(month_year) {
			var tmp = String(month_year).split('/');
			var month = tmp[0];
			var year  = tmp[1];
			if (parseInt(month, 10) < 12) {
				month = parseInt(month, 10) + 1;
			} else {
				month = 1;
				year  = parseInt(year, 10) + 1;
			}
			var options = $($('#global_calendar_div.w2ui-calendar').data('el')).data('options');
			$('#global_calendar_div.w2ui-calendar').html( $().w2field('calendar_get', w2utils.formatDate(month+'/1/'+year, options.format), options) );
		},
		
		calendar_previous: function(month_year) {
			var tmp = String(month_year).split('/');
			var month = tmp[0];
			var year  = tmp[1];
			if (parseInt(month, 10) > 1) {
				month = parseInt(month, 10) - 1;
			} else {
				month = 12;
				year  = parseInt(year, 10) - 1;
			}
			var options = $($('#global_calendar_div.w2ui-calendar').data('el')).data('options');
			$('#global_calendar_div.w2ui-calendar').html( $().w2field('calendar_get', w2utils.formatDate(month+'/1/'+year, options.format), options) );
		},
		
		calendar_month: function(month, year, options) {
			var td = new Date();
			var months		= w2utils.settings.fullmonths;
			var days			= w2utils.settings.fulldays;
			var daysCount	= ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31'];
			var today		= (Number(td.getMonth())+1) + '/' + td.getDate() + '/' + (String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900);
			
			year  = Number(year);
			month = Number(month);
			if (year  === null || year  === '') year  = String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900;
			if (month === null || month === '') month = Number(td.getMonth())+1;
			if (month > 12) { month = month - 12; year++; }
			if (month < 1 || month === 0)  { month = month + 12; year--; }
			if (year/4 == Math.floor(year/4)) { daysCount[1] = '29'; } else { daysCount[1] = '28'; }
			if (year  === null) { year  = td.getYear(); }
			if (month === null) { month = td.getMonth()-1; }
			
			// start with the required date
			td = new Date();
			td.setDate(1);
			td.setMonth(month-1);
			td.setYear(year);
			var weekDay = td.getDay();
			var tabDays = w2utils.settings.shortdays;
			var dayTitle = '';
			for ( var i = 0, len = tabDays.length; i < len; i++) {
				dayTitle += '<td>' + tabDays[i] + '</td>';
			}
			var html  = 
				'<div class="w2ui-calendar-title" onclick="event.stopPropagation()">'+
				'	<div class="w2ui-calendar-previous" onclick="$().w2field(\'calendar_previous\', \''+ month +'/'+ year +'\')"> <- </div>'+
				'	<div class="w2ui-calendar-next" onclick="$().w2field(\'calendar_next\', \''+ month +'/'+ year +'\')"> -> </div> '+ 
						months[month-1] +', '+ year + 
				'</div>'+
				'<table class="w2ui-calendar-days" onclick="event.stopPropagation()" cellspacing="0">'+
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
						if ((ci)%7 === 0) html += '</tr><tr>';
						continue;
					}
				}
				var dt  = month + '/' + day + '/' + year;
				
				var className = ''; 
				if (ci % 7 == 6) className = 'w2ui-saturday';
				if (ci % 7 === 0) className = 'w2ui-sunday';
				if (dt == today) className += ' w2ui-today';
				
				var dspDay	= day;
				var col		= '';
				var bgcol	= '';
				var blocked	= '';
				if (options.colored && options.colored[dt] !== undefined) { // if there is predefined colors for dates
					tmp		= options.colored[dt].split(':');
					bgcol		= 'background-color: ' + tmp[0] + ';';
					col		= 'color: ' + tmp[1] + ';';
				}
				var noSelect = false;
				// enable range 
				if (options.start || options.end) {
					var start	= new Date(options.start);
					var end		= new Date(options.end);
					var current	= new Date(dt);
					if (current < start || current > end) {
						blocked	= ' w2ui-blocked-date';
						noSelect	= true;
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
							'	$(el).val(\''+ w2utils.formatDate(dt, options.format) +'\').trigger(\'change\').trigger(\'blur\'); '+
							'	if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;'+
							'	if (event.preventDefault) event.preventDefault(); else return false;'+
							'"';
				}

				html +=	'>'+ dspDay + '</td>';
				if (ci % 7 === 0 || (weekDay === 0 && ci == 1)) html += '</tr><tr>';
				day++;
			}
			html += '</tr></table>';
			return html;
		},

		getColorHTML: function (color) {
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
							'	<div onclick="var el = $(\'#global_color_div\').data(\'el\');'+
							'			$(el).val($(this).attr(\'name\')).change(); '+
							'			$(\'#global_color_div\').hide()" '+
							'		style="background-color: #'+ colors[i][j] +';" name="'+ colors[i][j] +'">'+
							'		'+ (color == colors[i][j] ? '&#149;' : '&nbsp;')+
							'	</div>'+
							'</td>';
				}
				html += '</tr>';
				if (i < 2) html += '<tr><td style="height: 8px" colspan="8"></td></tr>';
			}
			html += '</table></div>';
			return html;
		}
	});

	w2obj.field = w2field;

}) (jQuery);
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2form 		- form widget
*		- $().w2form	- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2fields, w2tabs, w2toolbar, w2alert
*
* == NICE TO HAVE ==
*	- refresh(field) - would refresh only one field
* 	- include delta on save
*	- create an example how to do cascadic dropdown
*
************************************************************************/


(function () {
	var w2form = function(options) {
		// public properties
		this.name  	  		= null;
		this.header 		= '';
		this.box			= null; 	// HTML element that hold this element
		this.url			= '';
		this.formURL    	= '';		// url where to get form HTML
		this.formHTML   	= '';		// form HTML (might be loaded from the url)
		this.page 			= 0;		// current page
		this.recid			= 0;		// can be null or 0
		this.fields 		= [];
		this.actions 		= {};
		this.record			= {};
		this.original   	= {};
		this.postData		= {};
		this.toolbar		= {};		// if not empty, then it is toolbar
		this.tabs 			= {}; 		// if not empty, then it is tabs object

		this.style 			= '';
		this.focus			= 0;		// focus first or other element
		this.msgNotJSON 	= w2utils.lang('Return data is not in JSON format.');
		this.msgRefresh		= w2utils.lang('Refreshing...');
		this.msgSaving		= w2utils.lang('Saving...');

		// events
		this.onRequest  	= null;
		this.onLoad 		= null;
		this.onValidate		= null;
		this.onSubmit		= null;
		this.onSave			= null;
		this.onChange		= null;
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy		= null;
		this.onAction		= null; 
		this.onToolbar 		= null;
		this.onError		= null;

		// internal
		this.isGenerated	= false;
		this.last = {
			xhr	: null		// jquery xhr requests
		}

		$.extend(true, this, w2obj.form, options);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2form = function(method) {
		if (typeof method === 'object' || !method ) {
			var obj = this;
			// check name parameter
			if (!$.fn.w2checkNameParam(method, 'w2form')) return;
			// remember items
			var record 		= method.record;
			var original	= method.original;
			var fields 		= method.fields;
			var toolbar		= method.toolbar;
			var tabs		= method.tabs;
			// extend items
			var object = new w2form(method);
			$.extend(object, { record: {}, original: {}, fields: [], tabs: {}, toolbar: {}, handlers: [] });
			if ($.isArray(tabs)) {
				$.extend(true, object.tabs, { tabs: [] });
				for (var t in tabs) {
					var tmp = tabs[t];
					if (typeof tmp == 'object') object.tabs.tabs.push(tmp); else object.tabs.tabs.push({ id: tmp, caption: tmp });
				}
			} else {
				$.extend(true, object.tabs, tabs);
			}
			$.extend(true, object.toolbar, toolbar);
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
			if (obj.length > 0) object.box = obj[0];			
			// render if necessary
			if (object.formURL != '') {
				$.get(object.formURL, function (data) {
					object.formHTML = data;
					object.isGenerated = true;
					if ($(object.box).length != 0 || data.length != 0) {
						$(object.box).html(data);
						object.render(object.box);
					}
				});
			} else if (object.formHTML != '') {
				// it is already loaded into formHTML
			} else if ($(this).length != 0 && $.trim($(this).html()) != '') {
				object.formHTML = $(this).html();
			}  else { // try to generate it
				object.formHTML = object.generateHTML();
			}
			// register new object
			w2ui[object.name] = object;
			// render if not loaded from url
			if (object.formURL == '') {
				if (String(object.formHTML).indexOf('w2ui-page') == -1) {
					object.formHTML = '<div class="w2ui-page page-0">'+ object.formHTML +'</div>';
				}
				$(object.box).html(object.formHTML);
				object.isGenerated = true;
				object.render(object.box);
			}
			return object;
		
		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2form');
		}    
	}		

	// ====================================================
	// -- Implementation of core functionality
	
	w2form.prototype = {

		get: function (field, returnIndex) {
			for (var f in this.fields) {
				if (this.fields[f].name == field) {
					if (returnIndex === true) return f; else return this.fields[f];
				}
			}
			return null;
		},

		set: function (field, obj) {
			for (var f in this.fields) {
				if (this.fields[f].name == field) {
					$.extend(this.fields[f] , obj);
					this.refresh();
					return true;
				}
			}
			return false;
		},
	
		reload: function (callBack) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url && this.recid != 0) {
				//this.clear();
				this.request(callBack);
			} else {
				this.refresh();
				if (typeof callBack == 'function') callBack();
			}
		},

		clear: function () {
			this.recid  = 0;
			this.record = {};
			// clear all enum fields
			for (var f in this.fields) {
				var field = this.fields[f];
			}
			$().w2tag();
			this.refresh();
		},
		
		error: function (msg) {
			var obj = this;
			// let the management of the error outside of the grid
			var eventData = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
			if (eventData.isCancelled === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// need a time out because message might be already up)
			setTimeout(function () { w2alert(msg, 'Error');	}, 1);
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
							errors.push({ field: field, error: w2utils.lang('Not an integer') });
						} 
						break;
					case 'float':
						if (this.record[field.name] && !w2utils.isFloat(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not a float') });
						} 
						break;
					case 'money':
						if (this.record[field.name] && !w2utils.isMoney(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not in money format') });
						} 
						break;
					case 'hex':
						if (this.record[field.name] && !w2utils.isHex(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not a hex number') });
						} 
						break;
					case 'email':
						if (this.record[field.name] && !w2utils.isEmail(this.record[field.name])) {
							errors.push({ field: field, error: w2utils.lang('Not a valid email') });
						} 
						break;
					case 'checkbox':
						// convert true/false
						if (this.record[field.name] == true) this.record[field.name] = 1; else this.record[field.name] = 0; 
						break;
					case 'date':
						// format date before submit
						if (this.record[field.name] && !w2utils.isDate(this.record[field.name], field.options.format)) {
							errors.push({ field: field, error: w2utils.lang('Not a valid date') + ': ' + field.options.format });
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
					case 'select':
					case 'list':
						break;
					case 'enum':
						break;
				}
				// === check required - if field is '0' it should be considered not empty
				var val = this.record[field.name];
				if ( field.required && (val === '' || ($.isArray(val) && val.length == 0)) ) {
					errors.push({ field: field, error: w2utils.lang('Required field') });
				}
				if ( field.equalto && this.record[field.name]!=this.record[field.equalto] ) {
					errors.push({ field: field, error: w2utils.lang('Field should be equal to ')+field.equalto });
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'validate', errors: errors });
			if (eventData.isCancelled === true) return errors;
			// show error
			if (showErrors) for (var e in eventData.errors) {
				var err = eventData.errors[e];
				$(err.field.el).w2tag(err.error, { "class": 'w2ui-error' });
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return errors;
		},

		request: function (postData, callBack) { // if (1) param then it is call back if (2) then postData and callBack
			var obj = this;
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				postData 	= null;
			}
			if (typeof postData == 'undefined' || postData == null) postData = {};
			if (!this.url || (typeof this.url == 'object' && !this.url.get)) return;
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
			var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, url: this.url, postData: params });
			if (eventData.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return false; }
			// default action
			this.record	  = {};
			this.original = {};
			// call server to get data
			this.lock(this.msgRefresh);
			var url = eventData.url;
			if (typeof eventData.url == 'object' && eventData.url.get) url = eventData.url.get;
			if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {};
			this.last.xhr = $.ajax({
				type		: 'GET',
				url			: url,
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.unlock();
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'load', xhr: xhr, status: status });	
					if (eventData.isCancelled === true) {
						if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' });
						return false;
					}
					// parse server response
					var responseText = obj.last.xhr.responseText;
					if (status != 'error') {
						// default action
						if (typeof responseText != 'undefined' && responseText != '') {
							var data;
							// check if the onLoad handler has not already parsed the data
							if (typeof responseText == "object") {
								data = responseText;
							} else {
								// $.parseJSON or $.getJSON did not work because it expect perfect JSON data - where everything is in double quotes
								try { eval('data = '+ responseText); } catch (e) { }
							}
							if (typeof data == 'undefined') {
								data = {
									status		 : 'error',
									message		 : obj.msgNotJSON,
									responseText : responseText
								}
							}
							if (data['status'] == 'error') {
								obj.error(data['message']);
							} else {
								obj.record 	 = $.extend({}, data.record);
								obj.original = $.extend({}, data.record);
							}
						}
					} else {
						obj.error('AJAX Error ' + xhr.status + ': '+ xhr.statusText);
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

		submit: function (postData, callBack) {
			return this.save(postData, callBack);
		},

		save: function (postData, callBack) {
			var obj = this;
			// check for multiple params
			if (typeof postData == 'function') {
				callBack 	= postData;
				postData 	= null;
			}
			// validation
			var errors = obj.validate(true);
			if (errors.length !== 0) {
				obj.goto(errors[0].field.page);
				return;
			}
			// submit save
			if (typeof postData == 'undefined' || postData == null) postData = {};
			if (!obj.url || (typeof obj.url == 'object' && !obj.url.save)) {
				console.log("ERROR: Form cannot be saved because no url is defined.");
				return;
			}
			obj.lock(obj.msgSaving + ' <span id="'+ obj.name +'_progress"></span>');
			// need timer to allow to lock
			setTimeout(function () {
				// build parameters list
				var params = {};
				// add list params
				params['cmd']  	 = 'save-record';
				params['name'] 	 = obj.name;
				params['recid']  = obj.recid;
				// append other params
				$.extend(params, obj.postData);
				$.extend(params, postData);
				params.record = $.extend(true, {}, obj.record);
				// convert  before submitting 
				for (var f in obj.fields) {
					var field = obj.fields[f];
					switch (String(field.type).toLowerCase()) {
						case 'date': // to yyyy-mm-dd format
							var dt  = params.record[field.name];
							var tmp = field.options.format.toLowerCase().replace('-', '/').replace('\.', '/');
							if (['dd/mm/yyyy', 'd/m/yyyy', 'dd/mm/yy', 'd/m/yy'].indexOf(tmp) != -1) {
								var tmp = dt.replace(/-/g, '/').replace(/\./g, '/').split('/');
								var dt  = new Date(tmp[2], tmp[1]-1, tmp[0]);
							}
							params.record[field.name] = w2utils.formatDate(dt, 'yyyy-mm-dd');
							break;
					}
				}
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'submit', target: obj.name, url: obj.url, postData: params });
				if (eventData.isCancelled === true) { 
					if (typeof callBack == 'function') callBack({ status: 'error', message: 'Saving aborted.' }); 
					return false; 
				}
				// default action
				var url = eventData.url;
				if (typeof eventData.url == 'object' && eventData.url.save) url = eventData.url.save;
				if (obj.last.xhr) try { obj.last.xhr.abort(); } catch (e) {};
				obj.last.xhr = $.ajax({
					type		: (w2utils.settings.RESTfull ? (obj.recid == 0 ? 'POST' : 'PUT') : 'POST'),
					url			: url,
					data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
					dataType	: 'text',
					xhr	: function() {
						var xhr = new window.XMLHttpRequest();
						// upload
						xhr.upload.addEventListener("progress", function(evt) {
							if (evt.lengthComputable) {
								var percent = Math.round(evt.loaded / evt.total * 100);
								$('#'+ obj.name + '_progress').text(''+ percent + '%');
							}
						}, false);
						return xhr;
					},
					complete : function (xhr, status) {
						obj.unlock();

						// event before
						var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'save', xhr: xhr, status: status });	
						if (eventData.isCancelled === true) {
							if (typeof callBack == 'function') callBack({ status: 'error', message: 'Saving aborted.' });
							return false;
						}
						// parse server response
						var responseText = xhr.responseText;
						if (status != 'error') {
							// default action
							if (typeof responseText != 'undefined' && responseText != '') {
								var data;
								// check if the onLoad handler has not already parsed the data
								if (typeof responseText == "object") {
									data = responseText;
								} else {
									// $.parseJSON or $.getJSON did not work because it expect perfect JSON data - where everything is in double quotes
									try { eval('data = '+ responseText); } catch (e) { }
								}
								if (typeof data == 'undefined') {
									data = {
										status		 : 'error',
										message		 : obj.msgNotJSON,
										responseText : responseText
									}
								}
								if (data['status'] == 'error') {
									obj.error(data['message']);
								} else {
									obj.original = $.extend({}, obj.record);
								}
							}
						} else {
							obj.error('AJAX Error ' + xhr.status + ': '+ xhr.statusText);
						}
						// event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
						obj.refresh();
						// call back
						if (typeof callBack == 'function') callBack(data);
					}
				});
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}, 50);
		},

		lock: function (msg, showSpinner) {
			var box = $(this.box).find('> div:first-child');
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(box);
			w2utils.lock.apply(window, args);
		},

		unlock: function () { 
			var obj = this;
			setTimeout(function () { w2utils.unlock(obj.box); }, 25); // needed timer so if server fast, it will not flash
		},

		goto: function (page) {
			if (typeof page != 'undefined') this.page = page;
			// if it was auto size, resize it
			if ($(this.box).data('auto-size') === true) $(this.box).height(0);
			this.refresh();
		},

		generateHTML: function () {
			var pages = []; // array for each page
			for (var f in this.fields) {
				var html = '';
				var field = this.fields[f];
				if (typeof field.html == 'undefined') field.html = {};
				field.html = $.extend(true, { caption: '', span: 6, attr: '', text: '', page: 0 }, field.html);
				if (field.html.caption == '') field.html.caption = field.name;
				var input = '<input name="'+ field.name +'" type="text" '+ field.html.attr +'/>';
				if (field.type == 'list') input = '<select name="'+ field.name +'" '+ field.html.attr +'></select>';
				if (field.type == 'checkbox') input = '<input name="'+ field.name +'" type="checkbox" '+ field.html.attr +'/>';
				if (field.type == 'textarea') input = '<textarea name="'+ field.name +'" '+ field.html.attr +'></textarea>';
				html += '\n   <div class="w2ui-label '+ (typeof field.html.span != 'undefined' ? 'w2ui-span'+ field.html.span : '') +'">'+ field.html.caption +':</div>'+
						'\n   <div class="w2ui-field '+ (typeof field.html.span != 'undefined' ? 'w2ui-span'+ field.html.span : '') +'">'+
								input + field.html.text +
						'</div>';
				if (typeof pages[field.html.page] == 'undefined') pages[field.html.page] = '<div class="w2ui-page page-'+ field.html.page +'">';
				pages[field.html.page] += html;
			}
			for (var p in pages) pages[p] += '\n</div>';
			// buttons if any
			var buttons = '';
			if (!$.isEmptyObject(this.actions)) {
				buttons += '\n<div class="w2ui-buttons">';
				for (var a in this.actions) {
					buttons += '\n    <input type="button" value="'+ a +'" name="'+ a +'">';
				}
				buttons += '\n</div>';
			}
			return pages.join('') + buttons;
		},

		action: function (action, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: action, type: 'action', originalEvent: event });	
			if (eventData.isCancelled === true) return false;
			// default actions
			if (typeof (this.actions[action]) == 'function') {
				this.actions[action].call(this, event);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		resize: function () {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'resize' });
			if (eventData.isCancelled === true) return false;
			// default behaviour
			var main 	= $(this.box).find('> div');
			var header	= $(this.box).find('> div .w2ui-form-header');
			var toolbar	= $(this.box).find('> div .w2ui-form-toolbar');
			var tabs	= $(this.box).find('> div .w2ui-form-tabs');
			var page	= $(this.box).find('> div .w2ui-page');
			var cpage	= $(this.box).find('> div .w2ui-page.page-'+ this.page);
			var dpage	= $(this.box).find('> div .w2ui-page.page-'+ this.page + ' > div');
			var buttons	= $(this.box).find('> div .w2ui-buttons');		
			// if no height, calculate it
			resizeElements();
			if (parseInt($(this.box).height()) == 0 || $(this.box).data('auto-size') === true) {
				$(this.box).height(
					(header.length > 0 ? w2utils.getSize(header, 'height') : 0) + 
					(this.tabs.tabs.length > 0 ? w2utils.getSize(tabs, 'height') : 0) + 
					(this.toolbar.items.length > 0 ? w2utils.getSize(toolbar, 'height') : 0) + 
					(page.length > 0 ? w2utils.getSize(dpage, 'height') + w2utils.getSize(cpage, '+height') + 12 : 0) +  // why 12 ???
					(buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0)
				);
				$(this.box).data('auto-size', true);
			}
			resizeElements();
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));

			function resizeElements() {
				// resize elements
				main.width($(obj.box).width()).height($(obj.box).height());
				toolbar.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0));
				tabs.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0)
							  + (obj.toolbar.items.length > 0 ? w2utils.getSize(toolbar, 'height') : 0));
				page.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0) 
							  + (obj.toolbar.items.length > 0 ? w2utils.getSize(toolbar, 'height') + 5 : 0)
							  + (obj.tabs.tabs.length > 0 ? w2utils.getSize(tabs, 'height') + 5 : 0));
				page.css('bottom', (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0));
			}
		},

		refresh: function () {
			var obj = this;
			if (!this.box) return;
			if (!this.isGenerated || typeof $(this.box).html() == 'undefined') return;
			// update what page field belongs
			$(this.box).find('input, textarea, select').each(function (index, el) {
				var name  = (typeof $(el).attr('name') != 'undefined' ? $(el).attr('name') : $(el).attr('id'));
				var field = obj.get(name);
				if (field) {
					// find page
					var div = $(el).parents('.w2ui-page');
					if (div.length > 0) {
						for (var i = 0; i < 100; i++) {
							if (div.hasClass('page-'+i)) { field.page = i; break; }
						}
					}
				}
			});			
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page })
			if (eventData.isCancelled === true) return false;
			// default action
			$(this.box).find('.w2ui-page').hide();
			$(this.box).find('.w2ui-page.page-' + this.page).show();
			$(this.box).find('.w2ui-form-header').html(this.header);
			// refresh tabs if needed
			if (typeof this.tabs == 'object' && this.tabs.tabs.length > 0) {
				$('#form_'+ this.name +'_tabs').show();
				this.tabs.active = this.tabs.tabs[this.page].id;
				this.tabs.refresh();
			} else {
				$('#form_'+ this.name +'_tabs').hide();
			}
			// refresh tabs if needed
			if (typeof this.toolbar == 'object' && this.toolbar.items.length > 0) {
				$('#form_'+ this.name +'_toolbar').show();
				this.toolbar.refresh();
			} else {
				$('#form_'+ this.name +'_toolbar').hide();
			}
			// refresh values of all fields
			for (var f in this.fields) {
				var field = this.fields[f];
				field.el = $(this.box).find('[name="'+ String(field.name).replace(/\\/g, '\\\\') +'"]')[0];
				if (typeof field.el == 'undefined') {
					console.log('ERROR: Cannot associate field "'+ field.name + '" with html control. Make sure html control exists with the same name.');
					//return;
				}
				if (field.el) field.el.id = field.name;
				$(field.el).off('change').on('change', function () {
					var value_new 		= this.value;
					var value_previous 	= obj.record[this.name] ? obj.record[this.name] : '';
					var field 			= obj.get(this.name);
					if ((field.type == 'enum' || field.type == 'upload') && $(this).data('selected')) {
						var new_arr = $(this).data('selected');
						var cur_arr =  obj.record[this.name];
						var value_new = [];
						var value_previous = [];
						if ($.isArray(new_arr)) for (var i in new_arr) value_new[i] = $.extend(true, {}, new_arr[i]); // clone array
						if ($.isArray(cur_arr)) for (var i in cur_arr) value_previous[i] = $.extend(true, {}, cur_arr[i]); // clone array
					}
					// event before
					var eventData = obj.trigger({ phase: 'before', target: this.name, type: 'change', value_new: value_new, value_previous: value_previous });
					if (eventData.isCancelled === true) { 
						$(this).val(obj.record[this.name]); // return previous value
						return false;
					}
					// default action 
					var val = this.value;
					if (this.type == 'checkbox') val = this.checked ? true : false;
					if (this.type == 'radio')    val = this.checked ? true : false;
					if (field.type == 'enum') 	 val = value_new;
					if (field.type == 'upload')  val = value_new;
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
					obj.action(action, event);
				});
			});
			// init controls with record
			for (var f in this.fields) {
				var field = this.fields[f];
				var value = (typeof this.record[field.name] != 'undefined' ? this.record[field.name] : '');
				if (!field.el)  continue;
				switch (String(field.type).toLowerCase()) {
					case 'email':
					case 'text':
					case 'textarea':
						field.el.value = value;
						break;
					case 'date':
						if (!field.options) field.options = {};
						if (!field.options.format) field.options.format = w2utils.settings.date_format;
						field.el.value = value;
						this.record[field.name] = value;
						$(field.el).w2field($.extend({}, field.options, { type: 'date' }));
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
							$(field.el).prop('checked', true);
						} else {
							$(field.el).prop('checked', false);
						}
						break;
					case 'password':
						// hide passwords
						field.el.value = value;
						break;
					case 'select':
					case 'list':
						$(field.el).w2field($.extend({}, field.options, { type: 'list', value: value }));
						break;
					case 'enum':
						if (typeof field.options == 'undefined' || (typeof field.options.url == 'undefined' && typeof field.options.items == 'undefined')) {
							console.log("ERROR: (w2form."+ obj.name +") the field "+ field.name +" defined as enum but not field.options.url or field.options.items provided.");
							break;
						}
						// normalize value
						this.record[field.name] = w2obj.field.cleanItems(value);
						value = this.record[field.name];
						$(field.el).w2field( $.extend({}, field.options, { type: 'enum', selected: value }) );
						break;
					case 'upload':
						$(field.el).w2field($.extend({}, field.options, { type: 'upload', selected: value }));
						break;
					default:
						console.log('ERROR: field type "'+ field.type +'" is not recognized.');
						break;						
				}
			}
			// wrap pages in div
			var tmp = $(this.box).find('.w2ui-page');
			for (var i = 0; i < tmp.length; i++) {
				if ($(tmp[i]).find('> *').length > 1) $(tmp[i]).wrapInner('<div></div>');
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize();
		},

		render: function (box) {
			var obj = this;
			if (typeof box == 'object') {
				// remove from previous box
				if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
					$(this.box).removeAttr('name')
						.removeClass('w2ui-reset w2ui-form')
						.html('');
				}
				this.box = box;
			}
			if (!this.isGenerated) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (typeof box != 'undefined' ? box : this.box) });	
			if (eventData.isCancelled === true) return false;
			// default actions
			var html =  '<div>' +
						(this.header != '' ? '<div class="w2ui-form-header">' + this.header + '</div>' : '') +
						'	<div id="form_'+ this.name +'_toolbar" class="w2ui-form-toolbar"></div>' +
						'	<div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs"></div>' +
							this.formHTML +
						'</div>';
			$(this.box).attr('name', this.name)
				.addClass('w2ui-reset w2ui-form')
				.html(html);
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;

			// init toolbar regardless it is defined or not
			if (typeof this.toolbar['render'] == 'undefined') {
				this.toolbar = $().w2toolbar($.extend({}, this.toolbar, { name: this.name +'_toolbar', owner: this }));
				this.toolbar.on('click', function (event) {
					var eventData = obj.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event });
					if (eventData.isCancelled === true) return false;
					// no default action
					obj.trigger($.extend(eventData, { phase: 'after' }));
				});
			}
			if (typeof this.toolbar == 'object' && typeof this.toolbar.render == 'function') {
				this.toolbar.render($('#form_'+ this.name +'_toolbar')[0]);
			}
			// init tabs regardless it is defined or not
			if (typeof this.tabs['render'] == 'undefined') {
				this.tabs = $().w2tabs($.extend({}, this.tabs, { name: this.name +'_tabs', owner: this }));
				this.tabs.on('click', function (event) {
					obj.goto(this.get(event.target, true));
				});
			}
			if (typeof this.tabs == 'object' && typeof this.tabs.render == 'function') {
				this.tabs.render($('#form_'+ this.name +'_tabs')[0]);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// after render actions
			this.resize();
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url && this.recid != 0) {
				this.request(); 
			} else {
				this.refresh();
			}
			// attach to resize event
			if ($('.w2ui-layout').length == 0) { // if there is layout, it will send a resize event
				this.tmp_resize = function (event) { w2ui[obj.name].resize(); }
				$(window).off('resize', 'body').on('resize', 'body', this.tmp_resize);
			}
			setTimeout(function () { obj.resize(); obj.refresh(); }, 150); // need timer because resize is on timer
			// focus on load
			function focusEl() {
				var inputs = $(obj.box).find('input, select, textarea');
				if (inputs.length > obj.focus) inputs[obj.focus].focus();
			}
			if (this.focus >= 0) setTimeout(focusEl, 500); // need timeout to allow form to render
		},

		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });	
			if (eventData.isCancelled === true) return false;
			// clean up
			if (typeof this.toolbar == 'object' && this.toolbar.destroy) this.toolbar.destroy();
			if (typeof this.tabs == 'object' && this.tabs.destroy) this.tabs.destroy();
			if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-form')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			$(window).off('resize', 'body')
		}
	};
	
	$.extend(w2form.prototype, w2utils.event);
	w2obj.form = w2form;
})();
/************************************************************************
*	Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*	- Following objects defined
*		- w2listview		- listview widget
*		- $().w2listview	- jQuery wrapper
*	- Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*	- images support
*	- PgUp/PgDown keys support
*
************************************************************************/

(function () {
	var w2listview = function (options) {
		this.box			= null;		// DOM Element that holds the element
		this.name			= null;		// unique name for w2ui
		this.vType			= null;
		this.items			= [];
		this.menu			= [];
		this.multiselect	= true;		// multiselect support
		this.keyboard		= true;		// keyboard support
		this.curFocused		= null;		// currently focused item
		this.selStart		= null;		// item to start selection from (used in selection with "shift" key)
		this.onClick		= null;
		this.onDblClick		= null;
		this.onKeydown		= null;
		this.onContextMenu	= null;
		this.onMenuClick	= null;		// when context menu item selected
		this.onRender		= null;
		this.onRefresh		= null;
		this.onDestroy		= null;

		$.extend(true, this, w2obj.listview, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2listview = function(method) {
		var obj;
		if (typeof method === 'object' || !method ) {
			// check name parameter
			if (!$.fn.w2checkNameParam(method, 'w2listview')) return undefined;
			if (typeof method.viewType !== 'undefined') {
				method.vType = method.viewType;
				delete method.viewType;
			}
			var itms  = method.items;
			obj = new w2listview(method);
			$.extend(obj, { items: [], handlers: [] });
			if ($.isArray(itms)) {
				for (var i = 0; i < itms.length; i++) {
					obj.items[i] = $.extend({}, w2listview.prototype.item, itms[i]);
				}
			}
			if ($(this).length !== 0) {
				obj.render($(this)[0]);
			}
			// register new object
			w2ui[obj.name] = obj;
			return obj;
		} else if (w2ui[$(this).attr('name')]) {
			obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2listview' );
			return undefined;
		}
	};

	// ====================================================
	// -- Implementation of core functionality

	w2listview.prototype = {
		item : {
			id				: null,		// param to be sent to all event handlers
			caption			: '',
			description		: '',
			icon			: null,
			selected		: false,
			onClick			: null,
			onDblClick		: null,
			onKeydown		: null,
			onContextMenu	: null,
			onRefresh		: null
		},

		viewType: function (value) {
			if (arguments.length === 0) {
				switch (this.vType) {
					case 'icon-tile':
						return 'icon-tile';
					case 'icon-large':
						return 'icon-large';
					case 'icon-medium':
						return 'icon-medium';
					default:
						return 'icon-small';
				}
			} else {
				this.vType = value;
				var vt = 'w2ui-' + this.viewType();
				$(this.box)
					.removeClass('w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile')
					.addClass(vt);
				return vt;
			}
		},

		add: function (item) {
			return this.insert(null, item);
		},

		insert: function (id, item) {
			if (!$.isArray(item)) item = [item];
			// assume it is array
			for (var r = 0; r < item.length; r++) {
				// checks
				if (String(item[r].id) == 'undefined') {
					console.log('ERROR: The parameter "id" is required but not supplied. (obj: '+ this.name +')');
					return;
				}
				var unique = true;
				for (var i = 0; i < this.items.length; i++) {
					if (this.items[i].id == item[r].id) { unique = false; break; }
				}
				if (!unique) {
					console.log('ERROR: The parameter "id='+ item[r].id +'" is not unique within the current items. (obj: '+ this.name +')');
					return;
				}
				//if (!w2utils.isAlphaNumeric(item[r].id)) {
				//	console.log('ERROR: The parameter "id='+ item[r].id +'" must be alpha-numeric + "-_". (obj: '+ this.name +')');
				//	return;
				//}
				// add item
				var newItm = $.extend({}, w2listview.prototype.item, item[r]);
				if (id === null || typeof id == 'undefined') {
					this.items.push(newItm);
				} else {
					var middle = this.get(id, true);
					this.items = this.items.slice(0, middle).concat([newItm], this.items.slice(middle));
				}
				this.refresh(item[r].id);
			}
		},

		remove: function (id) {
			var removed = 0;
			for (var i = 0; i < arguments.length; i++) {
				var idx = this.get(arguments[i], true);
				if (idx === null) return false;
				removed++;
				// remove from array
				this.items.splice(idx, 1);
				// remove from screen
				$(this.box).find('#itm_'+ w2utils.escapeId(arguments[i])).remove();
			}
			return removed;
		},

		set: function (id, item) {
			var idx = this.get(id, true);
			if (idx === null) return false;
			$.extend(this.items[idx], item);
			this.refresh(id);
			return true;
		},

		get: function (id, returnIndex) {
			var i = 0;
			if (arguments.length === 0) {
				var all = [];
				for (; i < this.items.length; i++) if (this.items[i].id !== null) all.push(this.items[i].id);
				return all;
			}
			for (; i < this.items.length; i++) {
				if (this.items[i].id === id) {
					if (returnIndex === true) return i; else return this.items[i];
				}
			}
			return null;
		},

		select: function (id, addSelection) {
			var itm = this.get(id);
			if (itm === null) return false;
			if (arguments.length === 1 || !this.multiselect) addSelection = false;

			if (!addSelection) this.unselect();
			if (!itm.selected) {
				$(this.box)
					.find('#itm_'+ w2utils.escapeId(id))
					.addClass('w2ui-selected');
				itm.selected = true;
			}
			return itm.selected;
		},

		unselect: function (id) {
			var obj = this;
			var i = 0;
			if (arguments.length === 0) {
				for (; i < this.items.length; i++) doUnselect(this.items[i]);
			} else {
				for (; i < arguments.length; i++) doUnselect(this.get(arguments[i]));
			}
			return true;

			function doUnselect(itm) {
				if (itm !== null && itm.selected) {
					itm.selected = false;
					$(obj.box)
						.find('#itm_'+ w2utils.escapeId(itm.id))
						.removeClass('w2ui-selected');
				}
			}
		},

		getFocused: function (returnIndex) {
			var rslt = this.get(this.curFocused, returnIndex);
			if (rslt === null) rslt = this.get(this.selStart, returnIndex);
			return rslt;
		},

		scrollIntoView: function (id) {
			if (typeof id != 'undefined') {
				var itm = this.get(id);
				if (itm === null) return;
				var body	= $(this.box);
				var node	= $(this.box).find('#itm_'+ w2utils.escapeId(id));
				var offset	= node.offset().top - body.offset().top;
				var nodeHeight = w2utils.getSize(node, 'height');
				if (offset + nodeHeight > body.height()) {
					body.scrollTop( body.scrollTop() + offset + nodeHeight - body.height() );
				}
				if (offset <= 0) {
					body.scrollTop( body.scrollTop() + offset);
				}
			}
		},

		userSelect: function (id, event, isMouse) {
			var itm = null;

			// update selection
			if (event.shiftKey) {
				this.unselect();
				var fIdx = this.get(this.selStart, true);
				if (fIdx !== null) {
					var idx = this.get(id, true);
					var toIdx = Math.max(idx, fIdx);
					for (var i = Math.min(idx, fIdx); i <= toIdx; i++) {
						this.select(this.items[i].id, true);
					}
				} else {
					this.select(id, true);
					this.selStart = id;
				}
			} else if (event.ctrlKey) {
				if (isMouse) {
					itm = this.get(id);
					if (itm.selected) this.unselect(id); else this.select(id, true);
					this.selStart = id;
				}
			} else {
				this.select(id, false);
				this.selStart = id;
			}

			// update focus
			if (itm === null) itm = this.get(id);
			if (itm === null) return;
			var oldItm = this.getFocused();
			if (oldItm !== null) {
				$(this.box)
					.find('#itm_'+ w2utils.escapeId(oldItm.id))
					.removeClass('w2ui-focused');
			}
			$(this.box)
				.find('#itm_'+ w2utils.escapeId(id))
				.addClass('w2ui-focused');
			this.curFocused = id;

			// update view
			this.scrollIntoView(id);
		},

		// ===================================================
		// -- Internal Event Handlers

		click: function (id, event) {
			var idx = this.get(id, true);
			if (idx === null) return false;
			var eventData = this.trigger({ phase: 'before', type: 'click', target: id, originalEvent: event, object: this.items[idx] });
			var rslt = eventData.isCancelled !== true;
			if (rslt) {
				// default action
				this.userSelect(id, event, true);
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
			return rslt;
		},

		dblClick: function (id, event) {
			var itm = this.get(id);
			if (itm === null) return false;
			var eventData = this.trigger({ phase: 'before', type: 'dblClick', target: id, originalEvent: event, object: itm });
			var rslt = eventData.isCancelled !== true;
			if (rslt) {
				// default action
				// -- empty
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
			return rslt;
		},

		keydown: function (event) {
			var obj = this;
			var idx = this.getFocused(true);
			if (idx === null || obj.keyboard !== true) return false;
			var eventData = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event });
			var rslt = eventData.isCancelled !== true;
			if (rslt) {
				// default behaviour
				if (event.keyCode == 32) obj.click(obj.items[idx].id, event);
				if (event.keyCode == 37) processNeighbor('left');
				if (event.keyCode == 39) processNeighbor('right');
				if (event.keyCode == 38) processNeighbor('up');
				if (event.keyCode == 40) processNeighbor('down');
				// cancel event if needed
				if ($.inArray(event.keyCode, [32, 37, 38, 39, 40]) != -1) {
					if (event.preventDefault) event.preventDefault();
					if (event.stopPropagation) event.stopPropagation();
				}

				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
			return rslt;

			function processNeighbor(neighbor) {
				var newIdx;
				if (neighbor === 'up') newIdx = idx - itemsInLine();
				if (neighbor === 'down') newIdx = idx + itemsInLine();
				if (neighbor === 'left') newIdx = idx - 1;
				if (neighbor === 'right') newIdx = idx + 1;
				if (newIdx >= 0 && newIdx < obj.items.length && newIdx != idx) {
					obj.userSelect(obj.items[newIdx].id, event, false);
				}
			}

			function itemsInLine() {
				var lv = $(obj.box).find('> ul');
				return parseInt(lv.width() / w2utils.getSize(lv.find('> li').get(0), 'width'), 10);
			}
		},

		contextMenu: function (id, event) {
			var obj = this;
			var itm = this.get(id);
			if (itm === null) return false;
			if (!itm.selected) obj.select(id);
			var eventData = obj.trigger({ phase: 'before', type: 'contextMenu', target: id, originalEvent: event, object: itm });
			var rslt = eventData.isCancelled !== true;
			if (rslt) {
				// default action
				if (obj.menu.length > 0) {
					$(obj.box).find('#itm_'+ w2utils.escapeId(id))
						.w2menu(obj.menu, {
							left: (event ? event.offsetX || event.pageX : 50) - 25,
							select: function (item, event, index) { obj.menuClick(id, index, event); }
						}
					);
				}
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
			return false;
		},

		menuClick: function (itemId, index, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'menuClick', target: itemId, originalEvent: event, menuIndex: index, menuItem: this.menu[index] });
			var rslt = eventData.isCancelled !== true;
			if (rslt) {
				// default action
				// -- empty
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
			return rslt;
		},

		getItemHTML: function (item, onlyInner) {
			var iconClass = (item.icon !== null && typeof item.icon != 'undefined') ? ' '+item.icon : ' icon-none';
			var innerHTML =
					'<div class="icon-small' + iconClass + '"></div> ' +
					'<div class="icon-medium' + iconClass + '"></div> ' +
					'<div class="icon-large' + iconClass + '"></div> ' +
					'<div class="caption">' + item.caption + '</div> ' +
					'<div class="description">' + item.description + '</div>';
			if (onlyInner) {
				return innerHTML;
			} else {
				return '<li id="itm_'+ item.id +'" ' +
					'onclick="w2ui[\''+ this.name +'\'].click(\''+ item.id +'\', event);" '+'' +
					'ondblclick="w2ui[\''+ this.name +'\'].dblClick(\''+ item.id +'\', event);" '+
					'oncontextmenu="w2ui[\''+ this.name +'\'].contextMenu(\''+ item.id +'\', event); if (event.preventDefault) event.preventDefault();" '+
					'>'+ innerHTML + '</li>';
			}
		},

		refresh: function (id) {
			var time = (new Date()).getTime();
			if (String(id) == 'undefined') {
				// refresh all items
				this.render(this.box);
			} else {
				// create or refresh only one item

				// event before
				var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), object: this.get(id) });
				if (eventData.isCancelled === true) return false;

				var idx = this.get(id, true);
				if (idx === null) return false;
				var jq_el = $(this.box).find('#itm_'+ w2utils.escapeId(id));
				if (jq_el.length === 0) {
					// does not exist - create it
					var nextItm;
					if (idx != this.items.length-1) {
						nextItm = $(this.box).find('#itm_'+ w2utils.escapeId(this.items[idx+1].id));
						if (nextItm.length === 0) nextItm = undefined;
					}
					if (!nextItm) nextItm = $(this.box).find('#itmlast');
					nextItm.before(this.getItemHTML(this.items[idx], false));
				} else {
					// refresh
					jq_el.html(this.getItemHTML(this.items[idx], true));
				}
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}

			return (new Date()).getTime() - time;
		},

		render: function (box) {
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });
			if (eventData.isCancelled === true) return false;
			// default action
			if (String(box) != 'undefined' && box !== null && this.box !== box) {
				if ($(this.box).find('> ul #itmlast').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-listview w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return false;
			// render all items
			var html = '<ul>';
			for (var i = 0; i < this.items.length; i++) html += this.getItemHTML(this.items[i], false);
			html += '<li id="itmlast" style="display: none;"></li></ul>';
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-listview w2ui-' + this.viewType())
				.html(html);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
			if (eventData.isCancelled === true) return false;
			// clean up
			if ($(this.box).find('> ul #itmlast').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-listview w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return true;
		}
	};

	$.extend(w2listview.prototype, w2utils.event);
	w2obj.listview = w2listview;
})();
