var w2ui  = w2ui  || {};
var w2obj = w2obj || {}; // expose object to be able to overwrite default functions

/************************************************
*   Library: Web 2.0 UI for jQuery
*   - Following objects are defines
*   	- w2ui 			- object that contains all created objects
*		- w2utils 		- basic utilities
*		- w2ui.w2evet	- generic event object
*   - Dependencies: jQuery
*
* == NICE TO HAVE ==
*	- date has problems in FF new Date('yyyy-mm-dd') breaks
*
* == 1.3 changes ==
*	- added locale(..., callBack), fixed bugs
*	- each widget has name in the box that is name of widget, $(name).w2grid('resize');
*	- added $().w2marker('string')
*	- added w2utils.keyboard module
*	- added w2utils.formatNumber()
*	- added w2menu() plugin
*
************************************************/

var w2utils = (function () {
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
			"shortdays"		: ["M", "T", "W", "T", "F", "S","S"],
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
		stripTags		: stripTags,
		encodeTags		: encodeTags,
		escapeId		: escapeId,
		base64encode	: base64encode,
		base64decode	: base64decode,
		transition		: transition,
		lang 			: lang,
		getSize			: getSize,
		scrollBarSize	: scrollBarSize,
		locale	 		: locale
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
		var email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
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
			amount = Math.floor(sec/24/60/60*10)/10;
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
		
	function size (sizeStr) {
		if (!w2utils.isFloat(sizeStr) || sizeStr == '') return '';
		sizeStr = parseFloat(sizeStr);
		if (sizeStr == 0) return 0;
		var sizes = ['Bt', 'KB', 'MB', 'GB', 'TB'];
		var i = parseInt( Math.floor( Math.log(sizeStr) / Math.log(1024) ) );
		return (Math.floor(sizeStr / Math.pow(1024, i) * 10) / 10).toFixed(i == 0 ? 0 : 1) + ' ' + sizes[i];
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

	function locale (locale, callBack) {
		var settings = w2utils.settings;
		if (typeof locale == 'string') locale = { lang: locale };
		locale = $.extend({ path : 'locale', lang : 'en-us' }, locale);
		// load from the file
		$.ajax({
			url		: locale.path + '/'+ locale.lang.toLowerCase() +'.json',
			type	: "GET",
			dataType: "JSON",
			cache 	: false,
			success : function (data, status, xhr) {
				w2utils.settings = $.extend(true, w2utils.settings, data);
				if (typeof callBack == 'function') callBack(data);
			},
			error	: function (xhr, status, msg) {
				console.log('ERROR: Cannot load locale '+ settings.lang +' in '+ settings.path);
			}
		});
	}

	function scrollBarSize () {
		if (w2utils._scrollBarSize) return w2utils._scrollBarSize; 
		var html = '<div id="_scrollbar_width" style="position: absolute; top: -300px; width: 100px; height: 100px; overflow-y: scroll;">'+
				   '	<div style="height: 120px">1</div>'+
				   '</div>';
		$('body').append(html);
		w2utils._scrollBarSize = 100 - $('#_scrollbar_width > div').width();
		$('#_scrollbar_width').remove();
		return w2utils._scrollBarSize;
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
		
		if (typeof eventData.type == 'undefined') { console.log('ERROR: You must specify event type when calling .on() method of '+ this.name); return; }
		if (typeof handler == 'undefined') { console.log('ERROR: You must specify event handler function when calling .on() method of '+ this.name); return; }
		this.handlers.push({ event: eventData, handler: handler });
	},
	
	off: function (eventData, handler) {
		if (!$.isPlainObject(eventData)) eventData = { type: eventData };
		eventData = $.extend({}, { type: null, execute: 'before', target: null, onComleted: null }, eventData);
	
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
		var eventData = $.extend({ type: null, phase: 'before', target: null, stop: false }, eventData,
			{ preventDefault: function () { this.stop = true; } });
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
*  Common Keyboard Handler. Supported in
*  - grid
*  - sidebar
*  - popup
*
*********************************************************/

w2utils.keyboard = (function (obj) {
	// private scope
	var w2ui_name = null;

	obj.register	= register;
	obj.active	 	= active;

	init();
	return obj;

	function init() {
		$(document).on('keydown', keydown);
		$(document).on('mousedown', mousedown);
	}

	function keydown (event) {
		var tag = event.target.tagName;
		if ($.inArray(tag, ['INPUT', 'SELECT', 'TEXTAREA']) != -1) return;
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

	function register () {

	}

	function active (new_w2ui_name) {
		if (typeof new_w2ui_name == 'undefined') return w2ui_name;
		w2ui_name = new_w2ui_name;
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
	}

	$.fn.w2destroy = function (name) {
		if (!name && this.length > 0) name = this.attr('name');
		if (typeof name == 'string' && w2ui[name]) w2ui[name].destroy();
		if (typeof name == 'object') name.destroy();
	}

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
					// escape regex special chars
					tmp = tmp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace(/&/g, '&amp;').replace(/</g, '&gt;').replace(/>/g, '&lt;');
					var regex = new RegExp(tmp + '(?!([^<]+)?>)', "gi"); // only outside tags
					el.innerHTML = el.innerHTML.replace(regex, function (matched) { // mark new
						return '<span class="w2ui-marker">' + matched + '</span>';
					});
				}
			});
		}
	}

	// -- w2tag - appears on the right side from element, there can be multiple on screen at a time

	$.fn.w2tag = function (text, options) {
		if (!$.isPlainObject(options)) options = {};
		if (!$.isPlainObject(options.css)) options.css = {};
		if (typeof options['class'] == 'undefined') options['class'] = '';
		// remove all tags
		if ($(this).length == 0) {
			$('.global-tag').each(function (index, elem) {
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
				$('body').append('<div id="global-tag-'+ tagOrigID +'" class="global-tag" '+
								 '	style="position: absolute; z-index: 1701; opacity: 0; -webkit-transition: opacity .3s; -moz-transition: opacity .3s; -ms-transition: opacity .3s; -o-transition: opacity .3s"></div>');	

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
	
	// w2overlay - appears under the element, there can be only one at a time

	$.fn.w2overlay = function (html, options) {
		var isOpened = false;
		if (!$.isPlainObject(options)) options = {};
		if (!$.isPlainObject(options.css)) options.css = {};

		if (this.length == 0 || html == '' || typeof html == 'undefined') {
			if (typeof options.onHide == 'function') options.onHide();
			$('#w2ui-overlay').remove();
			$(document).off('click', hide);
			return $(this);
		}
		// insert (or re-insert) overlay
		if ($('#w2ui-overlay').length > 0) { isOpened = true; $(document).off('click', hide); $('#w2ui-overlay').remove(); }
		$('body').append('<div id="w2ui-overlay" class="w2ui-reset w2ui-overlay"><div></div></div>');

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
		var div = $('#w2ui-overlay');
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
			if (typeof options.onHide == 'function') options.onHide();
			$('#w2ui-overlay').remove();
			$(document).off('click', hide);
		}

		// need time to display
		setTimeout(function () {
			$(document).on('click', hide);
			if (typeof options.onShow == 'function') options.onShow();
		}, 1);

		return $(this);
	}

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
		}
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
* 		- w2ui.w2grid 	- grid widget
*		- $.w2grid		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2toolbar, w2fields, w2popup
*
* == NICE TO HAVE ==
*	- global search apply types and drop downs
*	- editable fields (list) - better inline editing
*	- frozen columns
*	- column autosize based on largest content
*	- more events in editable fields (onkeypress)
*	- save grid state into localStorage and restore
*	- searh logic (AND or OR) if it is a list, it should be multiple list with or
*	- easy bubbles in the grid
*
* == 1.3 changes ==
*	- added onEdit, an event to catch the edit record event when you click the edit button
*	- added toolbarEdit, to send the OnEdit event
*	- Changed doEdit to edit one field in doEditField, to add the doEdit event to edit one record in a popup
*	- added getRecordHTML, refactored, updated set()
*	- added onKeyboard event
*	- added keyboard = true property
* 	- refresh() and resize() returns number of milliseconds it took
*	- optimized width distribution and resize
*	- 50 columns resize 2% - margin of error is huge
* 	- resize needs to be revisited without resizing each div
*	- grid.resize should not hide expanded columns
*	- navigation with keybaord wrong if there are summary records
*	- added w2grid.recordHeight = 25
*	- fixedRecord deprecated because of buffered scroll
*	- added getSummaryHTML(), summary
* 	- added record.changed, record.changes
*	- doExpand -> expand, collapse, toggle, onCollapse
*	- remove record.hidden
*	- grid.set([recid], record, [noRefresh]) - updates all records
*	- deprecated selectPage()
*	- added onReload (when toolbar button is clicked)
*	- column.title - can be a string or a function
*	- hints for records (columns?)
*	- select multiple recors (shift) in a searched list - selects more then needed
* 	- error when using left/right arrow keys (second click disconnects from the event listener)
*	- deprecated recordsPerPage, page, goto()
* 	- added onDeleted, onSaved - when it returns from the server
* 	- added buffered, limit, offset
* 	- need to clean up onRequest, onSave, onLoad commands
*	- added onToolbar event - click on any toolbar button
*	- route all toolbar events thru the grid
*	- infinite scroll (buffered scroll)
*	- added grid.autoLoad = true
*	- search 1-20 will range numbers
*	- moved some settings to prototype
* 	- added record.expanded = 'none' || 'spinner'
*	- added lock(.., showSpinner) - show spinner
*	- subgrid (easy way with keyboard navigation)
*	- on/off line number and select column
*	- added columnOnOff() internal method
* 	- added skip()
* 	- added onColumnOnOff
* 	- record.render(record, record_index, column_index)
*	- added grid.scrollIntoView()
*	- added render formatters (number, int, float, money, age, date)
*	- renames: doAdd -> toolbarAdd, doEdit -> toolbarEdit, doSave -> toolbarSave, doDelete -> toolbarDelete
*	- renames: doClick -> click, doDblClick -> dblClick, doEditField -> editField, doScroll -> scroll, doSort -> sort
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
			toolbarSave		: false
		}

		this.autoLoad		= true; 	// for infinite scroll
		this.fixedBody		= true;		// if false; then grid grows with data
		this.recordHeight	= 25;
		this.keyboard 		= true;
		this.multiSearch	= true;
		this.multiSelect	= true;
		this.multiSort		= true;

		this.total			= 0;		// server total
		this.buffered		= 0;		// number of records in the records array
		this.limit			= 100;
		this.offset			= 0;		// how many records to skip (for infinite scroll) when pulling from server
		this.style			= '';

		this.msgDelete		= w2utils.lang('Are you sure you want to delete selected records?');
		this.msgNotJSON 	= w2utils.lang('Returned data is not in valid JSON format.');
		this.msgRefresh		= w2utils.lang('Refreshing...');

		// events
		this.onAdd				= null;
		this.onEdit				= null;
		this.onRequest			= null;		// called on any server event
		this.onLoad				= null;
		this.onDelete			= null;
		this.onDeleted			= null
		this.onSave 			= null;
		this.onSaved			= null;
		this.onSelect			= null;
		this.onUnselect 		= null;
		this.onClick 			= null;
		this.onDblClick 		= null;
		this.onSort 			= null;
		this.onSearch 			= null;
		this.onChange 			= null;		// called when editable record is changed
		this.onExpand 			= null;
		this.onCollapse			= null;
		this.onError 			= null;
		this.onKeyboard			= null;
		this.onToolbar			= null; 	// all events from toolbar
		this.onColumnOnOff		= null;
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
			multi		: false,
			scrollTop	: 0,
			scrollLeft	: 0,
			selected	: [],
			sortData	: null,
			sortCount	: 0,
			xhr			: null,
			range_start : null,
			range_end   : null
		}

		this.isIOS = (navigator.userAgent.toLowerCase().indexOf('iphone') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipod') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipad') != -1) ? true : false;

		$.extend(true, this, options, w2obj.grid);
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
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
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
			if (this.url == '') {
				this.localSort();
				this.localSearch();
			}
			this.refresh(); // ??  should it be reload?
			return added;
		},

		find: function (obj, returnRecords) {
			if (typeof obj == 'undefined' || obj == null) obj = {};
			var recs = [];
			for (var i=0; i<this.records.length; i++) {
				var match = true;
				for (var o in obj) {
					var val = this.records[i][o];
					if (String(o).indexOf('.') != -1) val = this.parseObj(this.records[i],o);
					if (obj[o] != val) match = false;
				}
				if (match && returnRecords !== true) recs.push(this.records[i].recid);
				if (match && returnRecords === true) recs.push(this.records[i]);
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
				return true;
			} else { // find record to update
				var ind = this.get(recid, true);
				if (ind == null) return false;
				$.extend(true, this.records[ind], record);
				// refresh only that record
				if (noRefresh !== true) {
					var tr = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
					if (tr.length != 0) {
						var line = tr.attr('line');
						// if it is searched, find index in search array
						if (this.searchData.length > 0 && this.url == '') for (var s in this.last.searchIds) if (this.last.searchIds[s] == ind) ind = s;
						$(tr).replaceWith(this.getRecordHTML(ind, line));
					}
				}
				return true;
			}
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
			if (this.url == '') {
				this.buffered = this.records.length;
				this.localSort();
				this.localSearch();
			}
			this.refresh();
			return removed;
		},

		addColumn: function (before, column) {
			if (arguments.length == 1) {
				column = before;
				before = this.columns.length;
			} else {
				before = this.getColumn(before, true);
				if (before === null) before = this.columns.length;
			}
			if (!$.isArray(column)) column = [column];
			for (var o in column) {
				this.columns.splice(before, 0, column[o]);
				before++;
			}
			this.initColumnOnOff();
			this.refresh();
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
			if (arguments.length == 1) {
				search = before;
				before = this.searches.length;
			} else {
				before = this.getSearch(before, true);
				if (before === null) before = this.searches.length;
			}
			if (!$.isArray(search)) search = [search];
			for (var o in search) {
				this.searches.splice(before, 0, search[o]);
				before++;
			}
			this.searchClose();
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

		clear: function () {
			this.records	= [];
			this.buffered   = 0;
			this.refresh();
		},

		localSort: function (silent) {
			if (this.url != '') {
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
						aa = obj.parseObj(a, obj.sortData[s].field);
						bb = obj.parseObj(b, obj.sortData[s].field);
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
			if (silent !== true) setTimeout(function () { $('#grid_'+ obj.name +'_footer').find('.w2ui-footer-left').html('Sorting took ' + time/1000 + ' sec'); }, 10);
			return time;
		},

		localSearch: function (silent) {
			if (this.url != '') {
				console.log('ERROR: grid.localSearch can only be used on local data source, grid.url should be empty.');
				return;
			}
			var time = (new Date()).getTime();
			var obj = this;
			this.total = this.records.length;
			// mark all records as shown
			this.last.searchIds = [];
			// hide records that did not match
			if (this.searchData.length > 0 && this.url == '') {
				this.total = 0;
				for (var r in this.records) {
					var rec = this.records[r];
					var fl  = 0;
					for (var s in this.searchData) {
						var sdata  	= this.searchData[s];
						var search 	= this.getSearch(sdata.field);
						if (sdata == null) continue;
						var val1 = String(obj.parseObj(rec, search.field)).toLowerCase();
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
                                if ((search.type == 'text' || search.type == 'list') && val1 == val2) fl++;
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
			if (silent !== true) setTimeout(function () { $('#grid_'+ obj.name +'_footer').find('.w2ui-footer-left').html('Search took ' + time/1000 + ' sec'); }, 10);
			return time;
		},

		select: function (recid) {
			var selected = 0;
			for (var a = 0; a < arguments.length; a++) {
				var record = this.get(arguments[a]);
				if (record == null || record.selected === true) continue;
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: record.recid });
				if (eventData.stop === true) continue;
				// default action
				var i = this.get(record.recid, true);
				record.selected = true;
				$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(record.recid)).addClass('w2ui-selected').data('selected', 'yes');
				$('#grid_'+ this.name +'_cell_'+ i +'_select_check').prop('checked', true);
				selected++;
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			} 
			// all selected?
			$('#grid_'+ this.name +'_check_all').prop('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length != 0 &&
					$('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop("checked", false);
			}
			// show number of selected
			var msgLeft = '';
			var sel = this.getSelection();
			if (sel.length > 0) {
				msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' selected';
				if (sel.length == 1) msgLeft = 'Record ID: '+ sel[0] + ' ';
			}
			$('#grid_'+ this.name +'_footer .w2ui-footer-left').html(msgLeft);
			// toolbar
			if (sel.length == 1) this.toolbar.enable('edit'); else this.toolbar.disable('edit');
			if (sel.length >= 1) this.toolbar.enable('delete'); else this.toolbar.disable('delete');
			return selected;
		},

		unselect: function (recid) {
			var unselected = 0;
			for (var a = 0; a < arguments.length; a++) {
				var record = this.get(arguments[a]);
				if (record == null || record.selected !== true) continue;
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: record.recid });
				if (eventData.stop === true) continue;
				// default action
				var i = this.get(record.recid, true);
				record.selected = false
				$('#grid_'+this.name +'_rec_'+ w2utils.escapeId(record.recid)).removeClass('w2ui-selected').removeData('selected');
				if ($('#grid_'+this.name +'_rec_'+ w2utils.escapeId(record.recid)).length != 0) {
					$('#grid_'+this.name +'_rec_'+ w2utils.escapeId(record.recid))[0].style.cssText = 
						'height: '+ this.recordHeight +'px; ' + $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(record.recid)).attr('custom_style');
				}
				$('#grid_'+ this.name +'_cell_'+ i +'_select_check').prop("checked", false);
				unselected++;
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			} 
			// all selected?
			$('#grid_'+ this.name +'_check_all').prop('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length != 0 &&
					$('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop("checked", false);
			}
			// show number of selected
			var msgLeft = '';
			var sel = this.getSelection();
			if (sel.length > 0) {
				msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' selected';
				if (sel.length == 1) msgLeft = 'Record ID: '+ sel[0] + ' ';
			}
			$('#'+ this.name +'_grid_footer .w2ui-footer-left').html(msgLeft);
			// toolbar
			if (sel.length == 1) this.toolbar.enable('edit'); else this.toolbar.disable('edit');
			if (sel.length >= 1) this.toolbar.enable('delete'); else this.toolbar.disable('delete');
			return unselected;
		},

		selectAll: function () {
			if (this.multiSelect === false) return;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, all: true });
			if (eventData.stop === true) return;
			// default action
			if (this.url == '') {
				if (this.searchData.length == 0) { 
					// not searched
					this.set({ selected: true });
				} else { 
					// local search applied
					for (var i=0; i<this.last.searchIds.length; i++) {
						this.records[this.last.searchIds[i]].selected = true;
					}
					this.refresh();
				}
			} else { // remote data source
				this.set({ selected: true });
				this.refresh();
			}
			var sel = this.getSelection();
			if (sel.length == 1) this.toolbar.enable('edit'); else this.toolbar.disable('edit');
			if (sel.length >= 1) this.toolbar.enable('delete'); else this.toolbar.disable('delete');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		selectNone: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, all: true });
			if (eventData.stop === true) return;
			// default action
			this.last.selected = [];
			for (var i in this.records) {
				var rec = this.records[i];
				if (rec.selected === true) {
					rec.selected = false;
					$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(rec.recid)).removeClass('w2ui-selected').removeData('selected');
					$('#grid_'+ this.name +'_cell_'+ i +'_select_check').prop("checked", false);
				}
			}
			this.toolbar.disable('edit', 'delete');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getSelection: function () {
			return this.find({ selected: true });
		},

		search: function (field, value) {
			var obj 		= this;
			var searchData 	= [];
			var last_multi 	= this.last.multi;
			var last_logic 	= this.last.logic;
			var last_field 	= this.last.field;
			var last_search = this.last.search;
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
				if (searchData.length > 0 && this.url == '') {
					last_multi	= true;
					last_logic  = 'AND';
				}
			}
			// .search([ { filed, value }, { field, valu e} ]) - submit whole structure
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
					var data   = field[f];
					var search = this.getSearch(data.field);
					if (search == null) {
						console.log('ERROR: Cannot find field "'+ data.field + '" when submitting a search.');
						continue;
					}
					var tmp = $.extend(true, {}, data);					
					if (typeof tmp.type == 'undefined') tmp.type = search.type;
					if (typeof tmp.operator == 'undefined') {
						tmp.operator = 'is';
						if (tmp.type == 'text') tmp.operator = 'contains';
					}
					searchData.push(tmp);
				}
			}
			// .search(field, value) - regular search
			if (typeof field == 'string' && typeof value == 'string') {
				last_field 	= field;
				last_search = value;
				last_multi	= false;
				last_logic	= 'OR';
				// loop through all searches and see if it applies
				if (value != '') for (var s in this.searches) {
					var search 	 = this.searches[s];
					if (search.field == field) this.last.caption = search.caption;
					if (field != 'all' && search.field == field) {
						var tmp = {
							field	 : search.field,
							type	 : search.type,
							operator : (search.type == 'text' ? 'contains' : 'is'),
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
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: searchData, 
					searchField: (field ? field : 'multi'), searchValue: (value ? value : 'multi') });
			if (eventData.stop === true) return;
			// default action			
			this.searchData	 = eventData.searchData;
			this.last.field  = last_field;
			this.last.search = last_search;
			this.last.multi  = last_multi;
			this.last.logic  = last_logic;
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.selected		= [];
			// -- clear all search field
			this.searchClose();
			this.set({ expanded: false });
			// apply search
			if (this.url != '') {
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
						caption : 'All Fields'
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

		searchReset: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: [] });
			if (eventData.stop === true) return;
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
			this.last.multi	= false;
			// reset scrolling position
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.selected		= [];
			// -- clear all search field
			this.searchClose();
			// apply search
			if (this.url != '') {
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

		skip: function (offset) {
			if (this.url != '') {
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
			if (this.url != '') {
				//this.refresh(); // show grid before pulling data
				this.request('get-records', {}, null, callBack);
			} else {
				this.refresh();
				if (typeof callBack == 'function') callBack();
			}
		},

		reset: function (noRefresh) {
			// reset last remembered state
			this.offset				= 0;
			this.searchData			= [];
			this.last.search		= '';
			this.last.searchIds		= [];
			this.last.field			= 'all';
			this.last.caption 		= w2utils.lang('All Fields');
			this.last.logic			= 'OR';
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.selected		= [];
			this.last.range_start	= null;
			this.last.range_end		= null;
			this.last.xhr_offset	= 0;
			// initial search panel
			if (this.last.sortData != null ) this.sortData	 = this.last.sortData;
			// select none without refresh
			this.set({ selected: false, expanded: false }, true);
			// refresh
			if (!noRefresh) this.refresh();
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
			params['selected'] 		= this.getSelection();
			params['search']  		= this.searchData;
			params['search-logic'] 	= this.last.logic;
			params['sort'] 	  		= (this.sortData.length != 0 ? this.sortData : '');
			// append other params
			$.extend(params, this.postData);
			$.extend(params, add_params);
			// event before
			if (cmd == 'get-records') {
				var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, url: url, postData: params });
				if (eventData.stop === true) { if (typeof callBack == 'function') callBack(); return false; }
			} else {
				var eventData = { url: this.url, postData: this.postData };
			}
			// call server to get data
			var obj = this;
			this.lock(this.msgRefresh, true);
			if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {};
			var xhr_type = 'GET';
			if (params.cmd == 'save-records')   	xhr_type = 'PUT';  // so far it is always update
			if (params.cmd == 'delete-records') 	xhr_type = 'DELETE';
			if (!w2utils.settings.RESTfull) xhr_type = 'POST';
			this.last.xhr_cmd	 = params.cmd;
			this.last.xhr_start  = (new Date()).getTime();
			this.last.xhr = $.ajax({
				type		: xhr_type,
				url			: eventData.url, 
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
			setTimeout(function () { $('#grid_'+ obj.name +'_footer').find('.w2ui-footer-left').html('Server Response ' + 
					((new Date()).getTime() - obj.last.xhr_start)/1000 + ' sec'); }, 10);
			this.last.pull_more 	= false;
			this.last.pull_refresh 	= true;

			// event before
			var event_name = 'load';
			if (this.last.xhr_cmd == 'save-records') event_name   = 'saved';
			if (this.last.xhr_cmd == 'delete-records') event_name = 'deleted';
			var eventData = this.trigger({ phase: 'before', target: this.name, type: event_name, xhr: this.last.xhr, status: status });
			if (eventData.stop === true) {
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
								$.extend(true, this, data);
								this.buffered = this.records.length;
							} else {
								var records = data.records;
								delete data.records;
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
			if (this.url == '') {
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
			if (eventData.stop === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// need a time out because message might be already up)
			setTimeout(function () {
				if ($('#w2ui-popup').length > 0) {
					$().w2popup('message', {
						width 	: 370,
						height 	: 140,
						html 	: '<div class="w2ui-grid-error-msg" style="font-size: 11px;">ERROR: '+ msg +'</div>'+
								  '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center;">'+
								  '	<input type="button" value="Ok" onclick="$().w2popup(\'message\');" class="w2ui-grid-popup-btn">'+
								  '</div>'
					});
				} else {
					$().w2popup('open', {
						width 	: 420,
						height 	: 200,
						showMax : false,
						title 	: 'Error',
						body 	: '<div class="w2ui-grid-error-msg">'+ msg +'</div>',
						buttons : '<input type="button" value="Ok" onclick="$().w2popup(\'close\');" class="w2ui-grid-popup-btn">'
					});
				}
			}, 1);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getChanged: function () {
			var changes = [];
			var tmp  	= this.find({ changed: true }, true);
			for (var t in tmp) {
				changes.push($.extend(true, { recid: tmp[t]. recid }, tmp[t].changes));
			}
			return changes;
		},

		// ===================================================
		// --  Action Handlers

		toolbarAdd: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'add', recid: null });
			if (eventData.stop === true) return false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		toolbarEdit: function () {
			var sel 	= this.getSelection();
			var recid 	= null;
			if (sel.length == 1) recid = sel[0];
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'edit', recid: recid });
			if (eventData.stop === true) return false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		toolbarSave: function () {
			var obj = this;
			var changed = this.getChanged();
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'save', changed: changed });
			if (eventData.stop === true) return false;
			if (this.url != '') {
				this.request('save-records', { 'changed' : eventData.changed }, null, 
					function () { // event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
					}
				);
			} else {
				for (var c in changed) {
					var record = this.get(changed[c].recid);
					for (var s in changed[c]) {
						if (s == 'recid') continue;
						try { eval('record.' + s + ' = changed[c][s]'); } catch (e) {}
						delete record.changed;
						delete record.changes; 
					}
				}
				$(this.box).find('.w2ui-editable input').removeClass('changed');
				this.selectNone();
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		editField: function (type, el, event) {
			var recid  = $(el).attr('recid');
			var field  = $(el).attr('field');
			var record = this.get(recid);
			if (!record.selected) {
				this.selectNone();
				this.select(recid);
			}

			switch (type) {
				case 'click':
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					if (event.preventDefault) event.preventDefault();
					break;
				case 'focus':
					$(el).addClass('active');
					break;
				case 'blur':
					$(el).removeClass('active');
					var original = record[field];
					try { original = eval('record.'+ field); } catch (e) {}
					if (typeof original == 'undefined') original = '';
					if ($(el).val() != original) {
						var eventData = this.trigger({ phase: 'before', type: 'change', target: el.id, recid: recid, field: field, original: original  });
						if (eventData.stop === true) return false;
						// save into record
						record.changed = true;
						record.changes = record.changes || {};
						record.changes[field] = $(el).val();
						// mark changed
						$(el).addClass('changed');
						this.trigger($.extend(eventData, { phase: 'after' }));
					} else {
						if (record.changes) delete record.changes[field];
						if ($.isEmptyObject(record.changes)) delete record.changed;
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

		toolbarDelete: function (force) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'delete' });
			if (eventData.stop === true) return false;
			// default action
			var recs = this.getSelection();
			if (recs.length == 0) return;
			if (this.msgDelete != '' && !force) {
				$().w2popup({
					width 	: 400,
					height 	: 180,
					showMax : false,
					title 	: w2utils.lang('Delete Confirmation'),
					body 	: '<div class="w2ui-grid-delete-msg">'+ this.msgDelete +'</div>',
					buttons : '<input type="button" value="'+ w2utils.lang('No') + '" onclick="$().w2popup(\'close\');" class="w2ui-grid-popup-btn">'+
							  '<input type="button" value="'+ w2utils.lang('Yes') + '" onclick="w2ui[\''+ this.name +'\'].toolbarDelete(true); $().w2popup(\'close\');" class="w2ui-grid-popup-btn">'
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

		click: function (recid, event) {
			var time = (new Date()).getTime();
			if (w2utils.isInt(recid)) recid = parseInt(recid);
			if (typeof event == 'undefined') event = {};
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'click', recid: recid, event: event });
			if (eventData.stop === true) return false;
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
			var record = this.get(recid);
			// multi select with shif key
			if (event.shiftKey && sel.length > 0) {
				var start = this.get(sel[0], true);
				var end   = this.get(recid, true);
				var sel_add = []
				if (start <= end) {
					for (var i = start + 1; i <= end; i++) {
						if (this.searchData.length > 0 && this.url == '' && $.inArray(i, this.last.searchIds) == -1) continue;
						sel_add.push(this.records[i].recid);
						sel.push(this.records[i].recid);
					}
				} else {
					for (var i = start - 1; i >= end; i--) {
						if (this.searchData.length > 0 && this.url == '' && $.inArray(i, this.last.searchIds) == -1) continue;
						sel_add.push(this.records[i].recid);
						sel.push(this.records[i].recid);
					}
				}
				this.select.apply(this, sel_add);
			} else {
				// clear other if necessary
				if (((!event.ctrlKey && !event.shiftKey && !event.metaKey) || !this.multiSelect) && !this.showSelectColumn) {
					var flag = record.selected;
					if (sel.length > 300) this.selectNone(); else this.unselect.apply(this, sel);
					if (flag === true) {
						this.unselect(recid);
						sel = [];
					} else {
						this.select(recid);
						sel = [recid];
					}
				} else {
					if (record.selected === true) {
						this.unselect(record.recid);
						sel.splice($.inArray(record.recid, sel), 1);
					} else {
						this.select(record.recid);
						sel.push(record.recid);
					}
					setTimeout(function () { if (window.getSelection) window.getSelection().removeAllRanges(); }, 10);
				}
			}
			var sel = this.getSelection();
			if (sel.length == 1) this.toolbar.enable('edit'); else this.toolbar.disable('edit');
			if (sel.length >= 1) this.toolbar.enable('delete'); else this.toolbar.disable('delete');
			// remember last selected
			var msgLeft = '';
			if (sel.length > 0) {
				msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' selected';
				if (sel.length == 1) msgLeft = 'Record ID: '+ sel[0] + ' ';
			}
			$('#'+ obj.name +'_grid_footer .w2ui-footer-left').html(msgLeft);
			obj.last.selected = sel;
			obj.initResize();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		keydown: function (event) {
			// this method is called from w2utils
			var obj = this;
			if (obj.keyboard !== true) return;
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'keyboard', target: obj.name, event: event });	
			if (eventData.stop === true) return false;
			// default behavior
			var sel 	= obj.getSelection();
			if (sel.length == 0) return;
			var records = $('#grid_'+ obj.name +'_records');
			var recid	= sel[0];
			var ind		= obj.get(recid, true);
			var rec 	= obj.get(recid);
			var recEL	= $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid));
			var cancel  = false;
			switch (event.keyCode) {
				case 32: // spacebar
					cancel = true;
					break;
				case 8: // backspace
					obj.toolbarDelete();
					cancel = true;
					break;
				case 27: // escape
					obj.selectNone();
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
					if (recEL.length <= 0 || obj.show.expandColumn !== true) break;
					obj.toggle(sel[0], event);
					cancel = true;
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
					if (recEL.length <= 0 || rec.expanded !== true ) break;
					obj.set(sel[0], { expanded: false }, true);
					obj.collapse(sel[0], event);
					cancel = true;
					break;
				case 39: // right
					if (recEL.length <= 0 || rec.expanded === true || obj.show.expandColumn !== true) break;
					obj.expand(sel[0], event);
					cancel = true;
					break;
				case 38: // up
					if (recEL.length <= 0) break;
					// move to the previous record
					if ((ind > 0 && obj.last.searchIds.length == 0) || (obj.last.searchIds.length > 0 && ind > obj.last.searchIds[0])) {
						ind--;
						if (obj.last.searchIds.length > 0) {
							while (true) {
								if ($.inArray(ind, obj.last.searchIds) != -1 || ind < 0) break;
								ind--;
							}
						}
						// jump into subgrid
						if (obj.records[ind].expanded) {
							var subgrid = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid) +'_expanded_row').find('.w2ui-grid');
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
						obj.selectNone();
						obj.click(obj.records[ind].recid, event);
						obj.scrollIntoView(ind);
						if (event.preventDefault) event.preventDefault();
					} else {
						// jump out of subgird (if first record)
						var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid)).parents('tr');
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
					if (obj.records[ind].expanded) {
						var subgrid = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid) +'_expanded_row').find('.w2ui-grid');
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
					if ((ind + 1 < obj.records.length && obj.last.searchIds.length == 0) || (obj.last.searchIds.length > 0 && ind < obj.last.searchIds[obj.last.searchIds.length-1])) {
						ind++;
						if (obj.last.searchIds.length > 0) {
							while (true) {
								if ($.inArray(ind, obj.last.searchIds) != -1 || ind > obj.records.length) break;
								ind++;
							}
						}
						obj.selectNone();
						obj.click(obj.records[ind].recid, event);
						obj.scrollIntoView(ind);
						cancel = true;
					} else {
						// jump out of subgrid (if last record in subgrid)
						var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid)).parents('tr');
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
			}
			if (cancel) { // cancel default behaviour
				if (event.preventDefault) event.preventDefault();
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
		},

		scrollIntoView: function (ind) {
			if (typeof ind == 'undefined') {
				var sel = this.getSelection();
				if (sel.length == 0) return;
				ind	= this.get(sel[0], true);
			}
			var records	= $('#grid_'+ this.name +'_records');
			if (records.length == 0) return;
			var t1 = Math.floor(records[0].scrollTop / this.recordHeight);
			var t2 = t1 + Math.floor(records.height() / this.recordHeight);
			if (ind == t1) records.animate({ 'scrollTop': records.scrollTop() - records.height() / 1.3 });
			if (ind == t2) records.animate({ 'scrollTop': records.scrollTop() + records.height() / 1.3 });
			if (ind < t1 || ind > t2) records.animate({ 'scrollTop': (ind - 1) * this.recordHeight });
		},

		dblClick: function (recid, event) {
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
			this.last.selected	 = this.getSelection();
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
			if (eventData.stop === true) { 	
				$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove(); 
				return false; 
			}
			// default action
			$('#grid_'+ this.name +'_rec_'+ id).attr('expanded', 'yes').addClass('w2ui-expanded');
			$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').show();
			$('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('<div class="w2ui-spinner" style="width: 16px; margin: -2px 2px;"></div>');
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
			if (eventData.stop === true) return false; 
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

		sort: function (field, direction, event) {
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
						case 'desc'	: direction = 'asc';  break;
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
			if (this.url == '') {
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

		// ==================================================
		// --- Common functions

		resize: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// make sure the box is right
			if (!this.box || $(this.box).attr('name') != this.name) return;
			// determine new width and height
			$(this.box).find('> div')
				.css('width', $(this.box).width())
				.css('height', $(this.box).height());
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
			if (eventData.stop === true) return false;
			// resize
			obj.resizeBoxes(); 
			obj.resizeRecords();
			// init editable
			$('#grid_'+ obj.name + '_records .w2ui-editable input').each(function (index, el) {
				var column = obj.columns[$(el).attr('column')];
				if (column && column.editable) $(el).w2field(column.editable);
			});
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		refresh: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			// if over the max page, then go to page 1
			if (this.total < 0) this.total = this.records.length;
			if (this.buffered <= 0 && this.url == '') this.buffered = this.total; 

			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			this.toolbar.disable('edit', 'delete');
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh' });
			if (eventData.stop === true) return false;
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
						$('#grid_'+ this.name +'_search_all').val(this.last.search);
					}
				}
			} else {
				$('#grid_'+ this.name +'_toolbar').hide();
			}
			// -- make sure search is closed
			this.searchClose();
			// search placeholder
			if (this.searches.length == 0) this.last.field = 'No Search Fields';
			if (!this.multiSearch && this.last.field == 'all') {
				this.last.field 	= this.searches[0].field;
				this.last.caption 	= this.searches[0].caption;
			}
			for (var s in this.searches) {
				if (this.searches[s].field == this.last.field) this.last.caption = this.searches[s].caption;
			}
			if (this.last.multi) {
				$('#grid_'+ this.name +'_search_all').attr('placeholder', w2utils.lang('Multi Fields'));
			} else {
				$('#grid_'+ this.name +'_search_all').attr('placeholder', this.last.caption);
			}

			// focus search if last searched
			if (this._focus_when_refreshed === true) {
				setTimeout(function () {
					var s = $('#grid_'+ obj.name +'_search_all');
					if (s.length > 0) s[0].focus();
					setTimeout(function () { if (s.length > 0) s[0].focus(); delete obj._focus_when_refreshed; }, 500);
				}, 100); // need time to render
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
			// -- summary
			var tmp = this.find({ summary: true }, true);
			if (tmp.length > 0) {
				for (var t in tmp) this.summary.push(tmp[t]);
				this.remove.apply(this, this.find({ summary: true }));
			}
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
			// select last selected record
			if (this.last.selected.length > 0) for (var s in this.last.selected) {
				if (this.get(this.last.selected[s]) != null) {
					this.select(this.get(this.last.selected[s]).recid);
				}
			}
			// show/hide clear search link
 			if (this.searchData.length > 0) {
				$('#grid_'+ this.name +'_searchClear').show();
			} else {
				$('#grid_'+ this.name +'_searchClear').hide();
			}
			// all selected?
			$('#grid_'+ this.name +'_check_all').prop('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length != 0 &&
					$('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop("checked", false);
			}
			// show number of selected
			var msgLeft = '';
			var sel = this.getSelection();
			if (sel.length > 0) {
				msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' selected';
				if (sel.length == 1) msgLeft = 'Record ID: '+ sel[0] + ' ';
			}
			$('#'+ this.name +'_grid_footer .w2ui-footer-left').html(msgLeft);
			// send expand events
			var rows = obj.find({ expanded: true });
			for (var r in rows) {
				var eventData2 = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: rows[r], 
					box_id: 'grid_'+ this.name +'_rec_'+ w2utils.escapeId(rows[r]) +'_expanded' });
				if (eventData2.stop === true) return false; 
				// event after
				this.trigger($.extend(eventData2, { phase: 'after' }));
			}
			// mark selection
			setTimeout(function () {
				var str  = $.trim($('#grid_'+ obj.name +'_search_all').val());
				if (str != '') $(obj.box).find('.w2ui-grid-data > div').w2marker(str);
			}, 50);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			obj.resize(); 
			setTimeout(function () { obj.resize(); obj.scroll(); }, 1); // allow to render first
			return (new Date()).getTime() - time;
		},

		render: function (box) {
			var obj  = this;
			var time = (new Date()).getTime();
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
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
			if (eventData.stop === true) return false;
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
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// init toolbar
			this.initToolbar();
			if (this.toolbar != null) this.toolbar.render($('#grid_'+ this.name +'_toolbar')[0]);
			// init footer
			$('#grid_'+ this.name +'_footer').html(this.getFooterHTML());
			// refresh
			this.reload();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// attach to resize event
			if ($('.w2ui-layout').length == 0) { // if there is layout, it will send a resize event
				this.tmp_resize = function (event) { w2ui[obj.name].resize(); }
				$(window).off('resize', this.tmp_resize).on('resize', this.tmp_resize);
			}
			return (new Date()).getTime() - time;
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });
			if (eventData.stop === true) return false;
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
			if (this.url != '') {
				col_html +=
						'<tr><td colspan="2" style="padding: 0px">'+
						'	<div style="cursor: pointer; padding: 2px 8px; cursor: default">'+
						'		Skip <input type="text" style="width: 45px" value="'+ this.offset +'" '+
						'				onchange="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'skip\', this.value);"> Records'+
						'	</div>'+
						'</td></tr>';
			}
			col_html +=	'<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'line-numbers\');">'+
						'	<div style="cursor: pointer; padding: 4px 8px; cursor: default">Toggle Line Numbers</div>'+
						'</td></tr>'+
						'<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'resize\');">'+
						'	<div style="cursor: pointer; padding: 4px 8px; cursor: default">Reset Column Size</div>'+
						'</td></tr>';
			col_html += "</table></div>";
			this.toolbar.get('column-on-off').html = col_html;
		},

		columnOnOff: function (el, event, field, value) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'columnOnOff', checkbox: el, field: field, event: event });
			if (eventData.stop === true) return false;
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
					this.toolbar.items.push({ type: 'button', id: 'reload', img: 'icon-reload', hint: w2utils.lang('Reload data in the list') });
				}
				if (this.show.toolbarColumns) {			
					this.toolbar.items.push({ type: 'drop', id: 'column-on-off', img: 'icon-columns', hint: w2utils.lang('Show/hide columns'), arrow: false, html: '' });
					this.initColumnOnOff();
				}
				if (this.show.toolbarReload || this.show.toolbarColumn) {
					this.toolbar.items.push({ type: 'break', id: 'break0' });
				}
				if (this.show.toolbarSearch) {
					var html =
						'<table cellpadding="0" cellspacing="0"><tr>'+
						'	<td>'+
						'		<div class="w2ui-icon icon-search-down w2ui-search-down" title="'+ w2utils.lang('Select Search Field') +'" '+ 
									(this.isIOS ? 'onTouchStart' : 'onClick') +'="var obj = w2ui[\''+ this.name +'\']; obj.searchShowFields(this);"></div>'+
						'	</td>'+
						'	<td>'+
						'		<input id="grid_'+ this.name +'_search_all" class="w2ui-search-all" '+
						'			placeholder="'+ this.last.caption +'" value="'+ this.last.search +'"'+
						'			onkeyup="if (event.keyCode == 13) { '+
						'				w2ui[\''+ this.name +'\']._focus_when_refreshed = true; '+
						'				w2ui[\''+ this.name +'\'].search(w2ui[\''+ this.name +'\'].last.field, this.value); '+
						'			}">'+
						'	</td>'+
						'	<td>'+
						'		<div title="Clear Search" class="w2ui-search-clear" id="grid_'+ this.name +'_searchClear"  '+
						'			 onclick="var obj = w2ui[\''+ this.name +'\']; obj.searchReset();" '+
						'		>&nbsp;&nbsp;</div>'+
						'	</td>'+
						'</tr></table>';
					this.toolbar.items.push({ type: 'html', id: 'search', html: html });
					if (this.multiSearch && this.searches.length > 0) {
						this.toolbar.items.push({ type: 'check', id: 'search-advanced', caption: w2utils.lang('Search...'), hint: w2utils.lang('Open Search Fields') });
					}
				}
				if (this.show.toolbarAdd || this.show.toolbarEdit || this.show.toolbarDelete || this.show.toolbarSave) {
					this.toolbar.items.push({ type: 'break', id: 'break1' });
				}
				if (this.show.toolbarAdd) {
					this.toolbar.items.push({ type: 'button', id: 'add', caption: w2utils.lang('Add New'), hint: w2utils.lang('Add new record'), img: 'icon-add' });
				}
				if (this.show.toolbarEdit) {
					this.toolbar.items.push({ type: 'button', id: 'edit', caption: w2utils.lang('Edit'), hint: w2utils.lang('Edit selected record'), img: 'icon-edit', disabled: true });
				}
				if (this.show.toolbarDelete) {
					this.toolbar.items.push({ type: 'button', id: 'delete', caption: w2utils.lang('Delete'), hint: w2utils.lang('Delete selected records'), img: 'icon-delete', disabled: true });
				}
				if (this.show.toolbarSave) {
					if (this.show.toolbarAdd || this.show.toolbarDelete || this.show.toolbarEdit) {
						this.toolbar.items.push({ type: 'break', id: 'break2' });
					}
					this.toolbar.items.push({ type: 'button', id: 'save', caption: w2utils.lang('Save'), hint: w2utils.lang('Save changed records'), img: 'icon-save' });
				}
				// add original buttons
				for (var i in tmp_items) this.toolbar.items.push(tmp_items[i]);

				// =============================================
				// ------ Toolbar onClick processing

				var obj = this;
				this.toolbar.on('click', function (id, data) {
					var eventData = obj.trigger({ phase: 'before', type: 'toolbar', target: id, data: data });
					if (eventData.stop === true) return false;
					switch (id) {
						case 'reload':
							var eventData2 = obj.trigger({ phase: 'before', type: 'reload', target: obj.name });
							if (eventData2.stop === true) return false;
							// obj.reset(true); // do not reset to preserve search and sort
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
								data.event.stopPropagation();
								function tmp_close() { tb.uncheck(id); $(document).off('click', 'body', tmp_close); }
								$(document).on('click', 'body', tmp_close);
							}
							break;
						case 'add':
							obj.toolbarAdd();
							break;
						case 'edit':
							obj.toolbarEdit();
							break;
						case 'delete':
							obj.toolbarDelete();
							break;
						case 'save':
							obj.toolbarSave();
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
					obj.tmp_x = event.screenX;
					obj.tmp_y = event.screenY;
					obj.tmp_col = $(this).attr('name');
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					if (event.preventDefault) event.preventDefault();
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
						obj.resizeRecords();
						// reset
						obj.tmp_x = event.screenX;
						obj.tmp_y = event.screenY;
					}
					var mouseUp = function (event) {
						delete obj.resizing;
						$(document).off('mousemove', 'body');
						$(document).off('mouseup', 'body');
						obj.resizeRecords();
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
						html += '<tr class="'+ (di % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" style="height: '+ this.recordHeight +'">';
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
					var operator =  '<select id="grid_'+ this.name +'_operator_'+i+'">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						'	<option value="begins with">'+ w2utils.lang('begins with') +'</option>'+
						'	<option value="contains">'+ w2utils.lang('contains') +'</option>'+
						'	<option value="ends with">'+ w2utils.lang('ends with') +'</option>'+
						'</select>';
				}
				if (s.type == 'int' || s.type == 'float' || s.type == 'date') {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+i+'" onchange="var el = $(\'#grid_'+ this.name + '_range_'+ i +'\'); '+
						'					if ($(this).val() == \'is\') el.hide(); else el.show();">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						'	<option value="between">'+ w2utils.lang('between') +'</option>'+
						'</select>';
				}
				if (s.type == 'list') {
					var operator =  'is <input type="hidden" value="is" id="grid_'+ this.name +'_operator_'+i+'">';
				}
				html += '<tr>'+
						'	<td class="close-btn">'+ btn +'</td>' +
						'	<td class="caption">'+ s.caption +'</td>' +
						'	<td class="operator">'+ operator +'</td>'+
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
										(col.sortable ? 'onclick="w2ui[\''+ obj.name +'\'].sort(\''+ col.field +'\', null, event);"' : '') +'>'+
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
					html += '<td class="w2ui-head w2ui-col-number">'+
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
										(col.sortable ? 'onclick="w2ui[\''+ obj.name +'\'].sort(\''+ col.field +'\', null, event);"' : '') + '>'+
									resizer +
								'	<div class="'+ sortStyle +'">'+  
										(col.caption == '' ? '&nbsp;' : col.caption) +
								'	</div>'+ 
								'</td>';
					}
				}
				html += '<td class="w2ui-head w2ui-head-last"><div>&nbsp;</div></td>';
				html += '</tr>';
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
			if (this.records.length == 0) return;
			if (this.buffered > 300) this.show_extra = 30; else this.show_extra = 300; 
			// need this to enable scrolling when this.limit < then a screen can fit
			if (records.height() < this.buffered * this.recordHeight && records.css('overflow-y') == 'hidden') {
				this.refresh();
				return;
			}
			// update footer
			var t1 = Math.floor(records[0].scrollTop / this.recordHeight + 1);
			var t2 = Math.floor(records[0].scrollTop / this.recordHeight + 1) + Math.round(records.height() / this.recordHeight);
			if (t1 > this.buffered) t1 = this.buffered;
			if (t2 > this.buffered) t2 = this.buffered;
			$('#grid_'+ this.name + '_footer .w2ui-footer-right').html(w2utils.formatNumber(this.offset + t1) + '-' + w2utils.formatNumber(this.offset + t2) + ' of ' +	w2utils.formatNumber(this.total) + 
					(this.url != '' ? ' (buffered '+ w2utils.formatNumber(this.buffered) + (this.offset > 0 ? ', skip ' + w2utils.formatNumber(this.offset) : '') + ')' : '')
			);
			if (!this.fixedBody || this.total <= 300) return; 
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
								$(this).find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>');
								obj.last.pull_more = true;
								obj.last.xhr_offset += obj.limit;
								obj.request('get-records');
							});
					}
					if (more.find('td').text().indexOf('Load') == -1) {
						more.find('td').html('<div>Load '+ obj.limit + ' More...</div>');
					}
				}
			}
			// check for grid end
			if (this.buffered >= this.total - this.offset) $('#grid_'+ this.name +'_rec_more').hide();
			return;

			function markSearch() {
				// mark search
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
			// first record needs for resize purposes
			if (ind == -1) {
				rec_html += '<tr line="0">';
				if (this.show.lineNumbers) rec_html  += '<td class="w2ui-col-number" style="height: 0px;"></td>';
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
			if (summary !== true) {
				if (this.searchData.length > 0 && this.url == '') {
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
			if (record.selected) {
				rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" '+
						' class="w2ui-selected '+ (lineNum % 2 == 0 ? 'w2ui-even' : 'w2ui-odd') + (record.expanded === true ? ' w2ui-expanded' : '') + '" ' +
						(summary !== true ?
							(this.isIOS ?
								'	onclick  = "w2ui[\''+ this.name +'\'].dblClick(\''+ record.recid +'\', event);" '
								:
								'	onclick	 = "w2ui[\''+ this.name +'\'].click(\''+ record.recid +'\', event);"'+
								'	ondblclick  = "w2ui[\''+ this.name +'\'].dblClick(\''+ record.recid +'\', event);" '
							 ) 
							: ''
						) +
						' style="height: '+ this.recordHeight +'px" ' + (record['style'] ? 'custom_style="'+ record['style'] +'"' : '')+
						'>';
			} else {
				rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" '+
							'	class="'+ (lineNum % 2 == 0 ? 'w2ui-even' : 'w2ui-odd') + (record.expanded === true ? ' w2ui-expanded' : '') + '" ' +
						(summary !== true ?
							(this.isIOS ?
								'	onclick = "w2ui[\''+ this.name +'\'].dblClick(\''+ record.recid +'\', event);" '
								:
								'	onclick ="w2ui[\''+ this.name +'\'].click(\''+ record.recid +'\', event);"'+
								'	ondblclick = "w2ui[\''+ this.name +'\'].dblClick(\''+ record.recid +'\', event);" '
							 )
							: ''
						) +
						' style="height: '+ this.recordHeight +'px; '+ (record['style'] ? record['style'] + '" custom_style="'+ record['style'] : '') + '" '+
						'>';
			}
			if (this.show.lineNumbers) {
				rec_html += '<td id="grid_'+ this.name +'_cell_'+ ind +'_number" valign="top" class="w2ui-col-number">'+
							(summary !== true ? '<div>'+ lineNum +'</div>' : '') +
						'</td>';
			}
			if (this.show.selectColumn) {
				rec_html += 
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_select" valign="top" class="w2ui-grid-data w2ui-col-select" '+
						'		onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							(summary !== true ?
							'	<div>'+
							'		<input id="grid_'+ this.name +'_cell_'+ ind +'_select_check" class="grid_select_check" type="checkbox" tabIndex="-1"'+
							'			'+ (record.selected ? 'checked="checked"' : '') +
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
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_expand" valign="top" class="w2ui-grid-data w2ui-col-expand">'+
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
				var addStyle = '';
				if (col.hidden) { col_ind++; if (typeof this.columns[col_ind] == 'undefined') break; else continue; }
				var field = this.parseObj(record, col.field);
				if (typeof col.render != 'undefined') {
					if (typeof col.render == 'function') field = col.render.call(this, this.records[ind], ind, col_ind);
					if (typeof col.render == 'object')   field = col.render[field];
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
							addStyle = 'text-align: right';
							field 	 = prefix + w2utils.formatNumber(Number(field).toFixed(tmp[1])) + suffix;
						}
						if (tmp[0] == 'date') {
							if (typeof tmp[1] == 'undefined' || tmp[1] == '') tmp[1] = w2utils.settings.date_display;
							addStyle = 'text-align: center';
							field 	 = prefix + w2utils.formatDate(field, tmp[1]) + suffix;
						}
						if (tmp[0] == 'age') {
							addStyle = 'text-align: center';
							field 	 = prefix + w2utils.age(field) + suffix;
						}
					}
				}
				if (field == null || typeof field == 'undefined') field = '';

				var title = String(field).replace(/"/g, "''");
				if (typeof col.title != 'undefined') {
					if (typeof col.title == 'function') title = col.title.call(this, this.records[ind], ind, col_ind);
					if (typeof col.title == 'string')   title = col.title;
				}
				var rec_field = '<div title="'+ title +'">'+ field +'</div>';
				// this is for editable controls
				if ($.isPlainObject(col.editable)) {
					var edit = col.editable;
					if (edit.type == 'enum') console.log('ERROR: Grid\'s inline editing does not support enum field type.');
					if (edit.type == 'list' || edit.type == 'select') console.log('ERROR: Grid\'s inline editing does not support list/select field type.');
					if (typeof edit.inTag   == 'undefined') edit.inTag   = '';
					if (typeof edit.outTag  == 'undefined') edit.outTag  = '';
					if (typeof edit.style   == 'undefined') edit.style   = '';
					if (typeof edit.items   == 'undefined') edit.items   = [];
					// output the field
					if ((typeof record['editable'] == 'undefined' || record['editable'] === true) && edit.type != 'enum' && edit.type != 'list' && edit.type != 'select') {
						var newValue = '';
						if (record.changed && typeof record.changes[col.field] != 'undefined') {
							field = record.changes[col.field];
							var newValue = field;
						}
						rec_field =	
							'<div class="w2ui-editable">'+
								'<input id="grid_'+ this.name +'_edit_'+ ind +'_'+ col_ind +'" value="'+ w2utils.stripTags(field) +'" type="text"  '+
								'	style="'+ edit.style +'" '+ (record.changed && newValue != '' ? 'class="changed"' : '') + 
								'	field="'+ col.field +'" recid="'+ record.recid +'" line="'+ ind +'" column="'+ col_ind +'" '+
								'	onclick = "w2ui[\''+ this.name + '\'].editField(\'click\', this, event);" '+
								'	onkeyup = "w2ui[\''+ this.name + '\'].editField(\'keyup\', this, event);" '+
								'	onfocus = "w2ui[\''+ this.name + '\'].editField(\'focus\', this, event);" '+
								'	onblur  = "w2ui[\''+ this.name + '\'].editField(\'blur\', this, event);" '+
								'	ondblclick = "if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; '+
								'				  this.select();" '+ edit.inTag + ' >' +
								edit.outTag +
							'</div>';
					}
				}
				rec_html += '<td class="w2ui-grid-data" col="'+ col_ind +'" '+
							'	style="'+ addStyle + ';' + (typeof col.style != 'undefined' ? col.style : '') +'" '+
										  (typeof col.attr != 'undefined' ? col.attr : '') +'>'+
								rec_field +
							'</td>';
				col_ind++;
				if (typeof this.columns[col_ind] == 'undefined') break;
			}
			rec_html += '<td class="w2ui-grid-data-last"></td>';
			rec_html += '</tr>';
			// if row is expanded
			if (record.expanded === true) { // && $('#grid_'+ this.name +'_rec_'+ record.recid +'_expanded_row').length == 0
				var tmp = 1 + (this.show.selectColumn ? 1 : 0);
				rec_html += 
					'<tr id="grid_'+ this.name +'_rec_'+ record.recid +'_expanded_row">'+
						(this.show.lineNumbers ? '<td class="w2ui-col-number"></td>' : '') +
					'	<td class="w2ui-grid-data w2ui-expanded1" colspan="'+ tmp +'"><div></div></td>'+
					'	<td colspan="100" class="w2ui-expanded2">'+
					'		<div id="grid_'+ this.name +'_rec_'+ record.recid +'_expanded">&nbsp;</div>'+
					'	</td>'+
					'</tr>';
			}
			return rec_html;
		},

		getFooterHTML: function () {
			return '<div>'+
				'	<div class="w2ui-footer-left"></div>'+
				'	<div class="w2ui-footer-right">'+ this.buffered +'</div>'+
				'	<div class="w2ui-footer-center"></div>'+
				'</div>';
		},

		lock: function (msg, showSpinner) {
			var obj = this;
			if (typeof msg == 'undefined' || msg == '') {
				setTimeout(function () {
					$('#grid_'+ obj.name +'_lock').remove();
					$('#grid_'+ obj.name +'_status').remove();
				}, 25);
			} else {
				$('#grid_'+ obj.name +'_lock').remove();
				$('#grid_'+ obj.name +'_status').remove();
				$(this.box).find('> div :first-child').before(
					'<div id="grid_'+ this.name +'_lock" class="w2ui-lock"></div>'+
					'<div id="grid_'+ this.name +'_status" class="w2ui-lock-msg"></div>'
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
						if (showSpinner === true) msg = '<div class="w2ui-spinner"></div>' + msg;
						status.html(msg).css({
							opacity : status.data('old_opacity'),
							left	: left + 'px',
							top		: top + 'px'
						});
					}, 10);
				}, 10);
			}
		},

		unlock: function () { 
			this.lock(); 
		},

		parseObj: function (obj, field) {
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
	}

	$.extend(w2grid.prototype, $.w2event);
	w2obj.grid = w2grid;
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2layout - layout widget
*		- $.w2layout	- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2toolbar, w2tabs
*
* == NICE TO HAVE ==
*	- onResize for the panel
*	- problem with layout.html (see in 1.3)
*
* == 1.3 changes ==
*   - tabs can be array of string, array of tab objects or w2tabs object
*	- html() method is alias for content()
*	- el(panel) - returns DOM element for the panel
*	- resizer should be on top of the panel (for easy styling)
*	- content: $('content'); - it will return graceful error
*	- % base resizes
*	- better min/max calculation when window resizes
*	- moved some settings to prototype
*	- added layout.lock(panel, msg, [showSpinner]), unlock(panel)
*	- rename startResize -> resizeStart, stopResize -> resizeStop, doResize -> resizeMove
* 
************************************************************************/

(function () {
	var w2layout = function (options) {
		this.box		= null		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.panels		= [];

		this.padding	= 1;		// panel padding
		this.resizer	= 4;		// resizer width or height
		this.style		= '';
		this.css		= '';		// will display all inside <style> tag

		this.onShow		= null;
		this.onHide		= null;
		this.onResizing = null;
		this.onRender	= null;
		this.onRefresh	= null;
		this.onResize	= null;
		this.onDestroy	= null
		
		$.extend(true, this, options, w2obj.layout);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2layout = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2layout().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
				return;			
			}
			var panels = method.panels;
			var object = new w2layout(method);
			$.extend(object, { handlers: [], panels: [] });
			// add defined panels panels
			for (var p in panels) { 
				object.panels[p] = $.extend(true, {}, w2layout.prototype.panel, panels[p]); 
				if ($.isPlainObject(object.panels[p].tabs) || $.isArray(object.panels[p].tabs)) object.initTabs(panels[p].type);
				if ($.isPlainObject(object.panels[p].toolbar) || $.isArray(object.panels[p].toolbar)) object.initToolbar(panels[p].type);
			}
			// add all other panels
			for (var p in { 'top':'', 'left':'', 'main':'', 'preview':'', 'right':'', 'bottom':'' }) { 
				if (object.get(p) != null) continue;
				object.panels[p] = $.extend(true, {}, w2layout.prototype.panel, { type: p, hidden: true, size: 50 }); 
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
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2layout.prototype = {
		// default setting for a panel
		panel: {
			type 		: null,		// left, right, top, bottom
			size 		: 100, 		// width or height depending on panel name
			minSize 	: 20,
			hidden 		: false,
			resizable 	: false,
			overflow 	: 'auto',
			style 		: '',
			content 	: '',			// can be String or Object with .render(box) method
			tabs		: null,
			toolbar		: null,
			width		: null, 		// read only
			height 		: null, 		// read only
			onRefresh	: null,
			onShow 		: null,
			onHide 		: null
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
				if (data instanceof jQuery) {
					console.log('ERROR: You can not pass jQuery object to w2layout.content() method');
					return false;
				}
				if (p.content == '') {
					p.content = data;
					if (!p.hidden) this.refresh(panel);
				} else {
					p.content = data;
					if (!p.hidden) {
						if (transition != null && transition != '' && typeof transition != 'undefined') {
							// apply transition
							var nm   = 'layout_'+ this.name + '_panel_'+ p.type;
							var div1 = $('#'+ nm + ' > .w2ui-panel-content');
							div1.after('<div class="w2ui-panel-content new-panel" style="'+ div1[0].style.cssText +'"></div>');
							var div2 = $('#'+ nm + ' > .w2ui-panel-content.new-panel');
							if (typeof data == 'object') {
								data.box = div2[0]; // do not do .render(box);
								data.render();
							} else {
								div2.html(data);
							}
							w2utils.transition(div1[0], div2[0], transition, function () {
								div1.remove();
								div2.removeClass('new-panel');
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
		
		html: function (panel, data, transition) {
			this.content(panel, data, transition);
		},
			
		load: function (panel, url, transition, onLoad) {
			var obj = this;
			if (this.get(panel) == null) return false;
			$.get(url, function (data, status, object) {
				obj.content(panel, object.responseText, transition);
				if (onLoad) onLoad();
				// IE Hack
				if (window.navigator.userAgent.indexOf('MSIE')) setTimeout(function () { obj.resize(); }, 100);
			});
			return true;
		},
		
		show: function (panel, immediate) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'show', target: panel, panel: this.get(panel), immediate: immediate });	
			if (eventData.stop === true) return false;
	
			var p = obj.get(panel);
			if (p == null) return false;
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
			var eventData = this.trigger({ phase: 'before', type: 'hide', target: panel, panel: this.get(panel), immediate: immediate });	
			if (eventData.stop === true) return false;
	
			var p = obj.get(panel);
			if (p == null) return false;
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
			if (p == null) return false;
			if (p.hidden) return this.show(panel, immediate); else return this.hide(panel, immediate);
		},
		
		set: function (panel, options) {
			var obj = this.get(panel, true);
			if (obj == null) return false;
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

		initToolbar: function (panel, toolbar) {
			var pan = this.get(panel);
			if (pan != null && typeof toolbar == 'undefined') toolbar = pan.toolbar;
			if (pan == null || toolbar == null) return false;
			// instanciate toolbar
			if ($.isArray(toolbar)) toolbar = { items: toolbar };
			$().w2destroy(this.name + '_' + panel + '_toolbar'); // destroy if existed
			pan.toolbar = $().w2toolbar($.extend({}, toolbar, { owner: this, name: this.name + '_' + panel + '_toolbar' }));
			return true;
		},

		initTabs: function (panel, tabs) {
			var pan = this.get(panel);
			if (pan != null && typeof tabs == 'undefined') tabs = pan.tabs;
			if (pan == null || tabs == null) return false;
			// instanciate tabs
			var object = {};
			if ($.isArray(tabs)) {
				$.extend(true, object, { tabs: [] });
				for (var t in tabs) {
					var tmp = tabs[t];
					if (typeof tmp == 'object') object.tabs.push(tmp); else object.tabs.push({ id: tmp, caption: tmp });
				}
				object.active = object.tabs[0].id;
			} else {
				$.extend(true, object, tabs);
			}
			$().w2destroy(this.name + '_' + panel + '_tabs'); // destroy if existed
			pan.tabs = $().w2tabs($.extend({}, object, { owner: this, name: this.name + '_' + panel + '_tabs' }));
			return true;
		},
				
		render: function (box) {
			var obj = this;
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var time = (new Date()).getTime();
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'render', target: obj.name, box: box });	
			if (eventData.stop === true) return false;
	
			if (typeof box != 'undefined' && box != null) { 
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
							'	<div class="w2ui-panel-tabs"></div>'+
							'	<div class="w2ui-panel-toolbar"></div>'+
							'	<div class="w2ui-panel-content"></div>'+
							'</div>'+
							'<div id="layout_'+ obj.name + '_resizer_'+ tmp[t] +'" class="w2ui-resizer"></div>';
				$(obj.box).find(' > div').append(html);
				// tabs are rendered in refresh()
			}
			$(obj.box).find(' > div')
				.append('<style id="layout_'+ obj.name + '_panel_css" style="position: absolute; top: 10000px;">'+ obj.css +'</style>');		
			// process event
			obj.trigger($.extend(eventData, { phase: 'after' }));	
			// reinit events
			setTimeout(function () { // needed this timeout to allow browser to render first if there are tabs or toolbar
				obj.refresh();
				obj.resize();
				obj.initEvents();
			}, 0);
			return (new Date()).getTime() - time;
		},
		
		refresh: function (panel) {
			var obj = this;
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (typeof panel == 'undefined') panel = null;
			var time = (new Date()).getTime();
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'refresh', target: (typeof panel != 'undefined' ? panel : obj.name), panel: obj.get(panel) });	
			if (eventData.stop === true) return;
	
			obj.unlock(panel);
			if (panel != null && typeof panel != 'undefined') {
				var p = obj.get(panel);
				if (p == null) return;
				// apply properties to the panel
				var el = $('#layout_'+ obj.name +'_panel_'+ panel).css({ display: p.hidden ? 'none' : 'block' });
				el = el.find('.w2ui-panel-content');
				if (el.length > 0) el.css('overflow', p.overflow)[0].style.cssText += ';' + p.style;
				// insert content
				if (typeof p.content == 'object' && p.content.render) {
					p.content.box = $('#layout_'+ obj.name + '_panel_'+ p.type +' > .w2ui-panel-content')[0];
					p.content.render(); // do not do .render(box);
				} else {
					$('#layout_'+ obj.name + '_panel_'+ p.type +' > .w2ui-panel-content').html(p.content);
				}
				// if there are tabs and/or toolbar - render it
				var tmp = $(obj.box).find('#layout_'+ obj.name + '_panel_'+ p.type +' .w2ui-panel-tabs');
				if (p.tabs != null) { 
					if (tmp.find('[name='+ p.tabs.name +']').length == 0) tmp.w2render(p.tabs); else p.tabs.refresh(); 
				} else {
					tmp.html('').removeClass('w2ui-tabs').hide();
				}
				var tmp = $(obj.box).find('#layout_'+ obj.name + '_panel_'+ p.type +' .w2ui-panel-toolbar');
				if (p.toolbar != null) { 
					if (tmp.find('[name='+ p.toolbar.name +']').length == 0) tmp.w2render(p.toolbar); else p.toolbar.refresh(); 
				} else {
					tmp.html('').removeClass('w2ui-toolbar').hide();
				}
			} else {
				if ($('#layout_' +obj.name +'_panel_main').length <= 0) {
					obj.render();
					return;
				}
				obj.resize();
				// refresh all of them
				for (var p in this.panels) { obj.refresh(this.panels[p].type); }
			}
			obj.trigger($.extend(eventData, { phase: 'after' }));	
			return (new Date()).getTime() - time;
		},
		
		resize: function () {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (!this.box) return false;
			var time = (new Date()).getTime();
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name, panel: this.tmp_resizing });	
			if (eventData.stop === true) return false;
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
			var sprev   = (pprev != null && pprev.hidden != true ? true : false);
			var sleft   = (pleft != null && pleft.hidden != true ? true : false);
			var sright  = (pright != null && pright.hidden != true ? true : false);
			var stop    = (ptop != null && ptop.hidden != true ? true : false);
			var sbottom = (pbottom != null && pbottom.hidden != true ? true : false);
			// calculate %
			for (var p in { 'top':'', 'left':'', 'right':'', 'bottom':'', 'preview':'' }) { 
				var tmp = this.get(p);
				var str = String(tmp.size);
				if (tmp && str.substr(str.length-1) == '%') {
					var tmph = height;
					if (tmp.type == 'preview') {
						tmph = tmph 
							- (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) 
							- (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
					}
					tmp.sizeCalculated = (tmp.type == 'left' || tmp.type == 'right' ? width : tmph) * parseInt(tmp.size) / 100;
				} else {
					tmp.sizeCalculated = parseInt(tmp.size);
				}
				if (tmp.sizeCalculated < parseInt(tmp.minSize)) tmp.sizeCalculated = parseInt(tmp.minSize);
			}
			// top if any		
			if (ptop != null && ptop.hidden != true) {
				var l = 0;
				var t = 0;
				var w = width;
				var h = ptop.sizeCalculated;
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
					t = ptop.sizeCalculated - (this.padding == 0 ? this.resizer : 0);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_top').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].resizeStart('top', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_top').hide();
			}
			// left if any
			if (pleft != null && pleft.hidden != true) {
				var l = 0;
				var t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
				var w = pleft.sizeCalculated;
				var h = height - (stop ? ptop.sizeCalculated + this.padding : 0) - 
									  (sbottom ? pbottom.sizeCalculated + this.padding : 0);
				var e = $('#layout_'+ this.name +'_panel_left');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				$('#layout_'+ this.name +'_panel_left').css({
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
					l = pleft.sizeCalculated - (this.padding == 0 ? this.resizer : 0);
					w = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_left').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ew-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].resizeStart('left', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_left').hide();
				$('#layout_'+ this.name +'_resizer_left').hide();
			}
			// right if any
			if (pright != null && pright.hidden != true) {
				var l = width - pright.sizeCalculated;
				var t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
				var w = pright.sizeCalculated;
				var h = height - (stop ? ptop.sizeCalculated + this.padding : 0) - 
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
						w2ui[obj.name].resizeStart('right', event);
						return false;
					});
				}			
			} else {
				$('#layout_'+ this.name +'_panel_right').hide();
			}
			// bottom if any
			if (pbottom != null && pbottom.hidden != true) {
				var l = 0;
				var t = height - pbottom.sizeCalculated;
				var w = width;
				var h = pbottom.sizeCalculated;
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
					t = t - (this.padding == 0 ? 0 : this.padding);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_bottom').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].resizeStart('bottom', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_bottom').hide();
			}
			// main - always there
			var l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0);
			var t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
			var w = width  - (sleft ? pleft.sizeCalculated + this.padding : 0) - 
								  (sright ? pright.sizeCalculated + this.padding: 0);
			var h = height - (stop ? ptop.sizeCalculated + this.padding : 0) - 
								  (sbottom ? pbottom.sizeCalculated + this.padding : 0) -
								  (sprev ? pprev.sizeCalculated + this.padding : 0);
			var e = $('#layout_'+ this.name +'_panel_main');
			if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
			$('#layout_'+ this.name +'_panel_main').css({
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
				var l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0);
				var t = height - (sbottom ? pbottom.sizeCalculated + this.padding : 0) - pprev.sizeCalculated;
				var w = width  - (sleft ? pleft.sizeCalculated + this.padding : 0) - 
									  (sright ? pright.sizeCalculated + this.padding : 0);
				var h = pprev.sizeCalculated;
				var e = $('#layout_'+ this.name +'_panel_preview');
				if (window.navigator.userAgent.indexOf('MSIE') > 0 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
				$('#layout_'+ this.name +'_panel_preview').css({
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
					t = t - (this.padding == 0 ? 0 : this.padding);
					h = (this.resizer > this.padding ? this.resizer : this.padding);
					$('#layout_'+ this.name +'_resizer_preview').show().css({
						'display': 'block',
						'left': l + 'px',
						'top': t + 'px',
						'width': w + 'px',
						'height': h + 'px',
						'cursor': 'ns-resize'
					}).bind('mousedown', function (event) {
						w2ui[obj.name].resizeStart('preview', event);
						return false;
					});
				}
			} else {
				$('#layout_'+ this.name +'_panel_preview').hide();
			}

			// display tabs and toolbar if needed
			for (var p in { 'top':'', 'left':'', 'main':'', 'preview':'', 'right':'', 'bottom':'' }) { 
				var pan = this.get(p);
				var tmp = '#layout_'+ this.name +'_panel_'+ p +' > .w2ui-panel-';
				var height = 0;
				if (pan.tabs != null) {
					if (w2ui[this.name +'_'+ p +'_tabs']) w2ui[this.name +'_'+ p +'_tabs'].resize();
					height += w2utils.getSize($(tmp + 'tabs').css({ display: 'block' }), 'height');
				}
				if (pan.toolbar != null) {
					if (w2ui[this.name +'_'+ p +'_toolbar']) w2ui[this.name +'_'+ p +'_toolbar'].resize();
					height += w2utils.getSize($(tmp + 'toolbar').css({ top: height + 'px', display: 'block' }), 'height');
				}
				$(tmp + 'content').css({ display: 'block' }).css({ top: height + 'px' });
			}
			// send resize to all objects
			var obj = this;
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
			if (eventData.stop === true) return false;
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
			
			$(window).off('resize', this.events.resize);
			$(document).off('mousemove', this.events.mousemove);
			$(document).off('mouseup', this.events.mouseup);
			
			return true;
		},

		lock: function (panel, msg, showSpinner) {
			var obj = this;
			if (panel == null) return;
			if (!msg && msg != 0) msg = '';
			if ($.inArray(panel, ['left', 'right', 'top', 'bottom', 'preview', 'main']) == -1) {
				console.log('ERROR: First parameter needs to be the a valid panel name.');
				return;
			}
			var nm = '#layout_'+ obj.name + '_panel_' + panel;
			if (!msg) {
				setTimeout(function () {
					$(nm +'_lock').remove();
					$(nm +'_status').remove();
				}, 25);
			} else {
				if (obj.get(panel).hidden == true && msg != '') {
					console.log('ERROR: Cannot lock '+ panel +' panel because it is not visible.');
					return;
				}
				$(nm +'_lock').remove();
				$(nm +'_status').remove();
				$(nm).find('> :first-child').before(
					'<div id="'+ nm.substr(1) +'_lock" class="w2ui-lock"></div>'+
					'<div id="'+ nm.substr(1) +'_status" class="w2ui-lock-msg"></div>'
				);
				setTimeout(function () {
					var lock 	= $(nm +'_lock');
					var status 	= $(nm +'_status');
					status.data('old_opacity', status.css('opacity')).css('opacity', '0').show();
					lock.data('old_opacity', lock.css('opacity')).css('opacity', '0').show();
					setTimeout(function () {
						var left 	= ($(nm).width()  - w2utils.getSize(status, 'width')) / 2;
						var top 	= ($(nm).height() * 0.9 - w2utils.getSize(status, 'height')) / 2;
						lock.css({
							opacity : lock.data('old_opacity'),
							left 	: '0px',
							top 	: '0px',
							width 	: '100%',
							height 	: '100%'
						});
						if (showSpinner === true) msg = '<div class="w2ui-spinner"></div>' + msg;
						status.html(msg).css({
							opacity : status.data('old_opacity'),
							left	: left + 'px',
							top		: top + 'px'
						});
					}, 10);
				}, 10);
			}
		},

		unlock: function (panel) { 
			this.lock(panel); 
		},		
		
		// --- INTERNAL FUNCTIONS
		
		initEvents: function () {
			var obj = this;
			
			this.events = {
				resize : function (event) { 
					w2ui[obj.name].resize()	
				},
				mousemove : function (event) { 
					w2ui[obj.name].resizeMove(event)	
				},
				mouseup : function (event) { 
					w2ui[obj.name].resizeStop(event)	
				}
			};
			$(window).on('resize', this.events.resize);
			$(document).on('mousemove', this.events.mousemove);
			$(document).on('mouseup', this.events.mouseup);
		},
	
		resizeStart: function (type, evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			this.tmp_resizing = type;
			this.tmp_x = evnt.screenX;
			this.tmp_y = evnt.screenY;
			this.tmp_div_x = 0;
			this.tmp_div_y = 0;
			if (type == 'left' || type == 'right') {
				this.tmp_value = parseInt($('#layout_'+ this.name + '_resizer_'+ type)[0].style.left);
			}
			if (type == 'top' || type == 'preview' || type == 'bottom') {
				this.tmp_value = parseInt($('#layout_'+ this.name + '_resizer_'+ type)[0].style.top);
			}
		},
	
		resizeMove: function (evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (typeof this.tmp_resizing == 'undefined') return;
			var panel = this.get(this.tmp_resizing);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resizing', target: this.tmp_resizing, object: panel, event: evnt });	
			if (eventData.stop === true) return false;

			var p = $('#layout_'+ this.name + '_resizer_'+ this.tmp_resizing);
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
	
		resizeStop: function (evnt) {
			if (!this.box) return;
			if (!evnt) evnt = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			if (typeof this.tmp_resizing == 'undefined') return;
			// set new size
			var ptop 	= this.get('top');
			var pbottom	= this.get('bottom');
			var panel 	= this.get(this.tmp_resizing);
			var height 	= parseInt($(this.box).height());
			var width 	= parseInt($(this.box).width());
			var str 	= String(panel.size);
			switch (this.tmp_resizing) {
				case 'top':
					var ns = parseInt(panel.sizeCalculated) + this.tmp_div_y;
					var nd = 0;
					break;
				case 'bottom':
					var nd = 0;
				case 'preview':
					var nd = (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) 
						   + (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
					var ns = parseInt(panel.sizeCalculated) - this.tmp_div_y;
					break;
				case 'left':
					var ns = parseInt(panel.sizeCalculated) + this.tmp_div_x;
					var nd = 0;
					break;
				case 'right': 
					var ns = parseInt(panel.sizeCalculated) - this.tmp_div_x;
					var nd = 0;
					break;
			}	
			// set size
			if (str.substr(str.length-1) == '%') {
				panel.size = Math.floor(ns * 100 / 
					(panel.type == 'left' || panel.type == 'right' ? width : height - nd) * 100) / 100 + '%';
			} else {
				panel.size = ns;
			}
			this.resize();
			$('#layout_'+ this.name + '_resizer_'+ this.tmp_resizing).removeClass('active');
			delete this.tmp_resizing;
		}		
	}
	
	$.extend(w2layout.prototype, $.w2event);
	w2obj.layout = w2layout;
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2popup 	- popup widget
*		- $.w2popup	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
* == NICE TO HAVE ==
*	- when maximized, align the slide down message
*	- bug: after transfer to another content, message does not work
* 	- transition should include title, body and buttons, not just body
*
* == 1.3 changes ==
*	- keyboard esc - close
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
			if (parseInt($(this).css('width')) != 0)  dlgOptions['width']  = parseInt($(this).css('width'));
			if (parseInt($(this).css('height')) != 0) dlgOptions['height'] = parseInt($(this).css('height'));
		}
		// show popup
		return window.w2popup[method]($.extend({}, dlgOptions, options));
	};
	
	// ====================================================
	// -- Implementation of core functionality (SINGELTON)
	
	window.w2popup = {	
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
			transition		: null,
			onUnlock		: null,
			onOpen			: null,
			onChange		: null, 
			onBeforeClose	: null,
			onClose			: null,
			onMax			: null,
			onMin			: null
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
			var top  = ((parseInt(height) - parseInt(options.height)) / 2) * 0.6;
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
							'opacity': '0.6'
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
								'opacity': options.opacity
							});
						}, 100);
						if (window.getSelection) window.getSelection().removeAllRanges();
					} : function () { 
						$().w2popup('close'); 
					},
					onClick: function (event) {
						if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					}
				}));
			
				var msg = '<div id="w2ui-popup" class="w2ui-popup" style="'+
								'width: '+ parseInt(options.width) +'px; height: '+ parseInt(options.height) +'px; opacity: 0; '+
								'-webkit-transform: scale(0.8); -moz-transform: scale(0.8); -ms-transform: scale(0.8); -o-transform: scale(0.8); '+
								'left: '+ left +'px; top: '+ top +'px;">';
				if (options.title != '') { 
					msg +='<div class="w2ui-msg-title">'+
						  (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onclick="$().w2popup(\'close\'); '+
						  					   'if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">Close</div>' : '')+ 
						  (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onclick="$().w2popup(\'toggle\')">Max</div>' : '') + 
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
					if (typeof options.onOpen == 'function') { setTimeout(function () { options.onOpen(); }, 1); }
				}, options.speed * 1000);
			} else {
				// check if size changed
				if (typeof old_options == 'undefined' || old_options['width'] != options['width'] || old_options['height'] != options['height']) {
					$('#w2ui-panel').remove();
					window.w2popup.resize(options.width, options.height);
				}
				// show new items
				var body = $('#w2ui-popup .w2ui-box2 > .w2ui-msg-body').html(options.body);
				if (body.length > 0) body[0].style.cssText = options.style;
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
			// keyboard events 
			if (options.keyboard) $(document).on('keydown', this.doKeydown);
			// finalize
			this.initMove();			
			return this;		
		},

		doKeydown: function (event) {
			var options = $('#w2ui-popup').data('options');
			if (!options.keyboard) return;
			switch (event.keyCode) {
				case 27: 
					if (options.modal === true) {
						$('#w2ui-lock').css({ 'opacity': '0.6' });
						setTimeout(function () { $('#w2ui-lock').css({ 'opacity': options.opacity }); }, 400);
						return;					
					}
					$().w2popup('close');
					break;
			}
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
			// remove keyboard events
			if (options.keyboard) $(document).off('keydown', this.doKeydown);			
		},
		
		toggle: function () {
			var options = $('#w2ui-popup').data('options');
			if (options.maximized === true) $().w2popup('min'); else $().w2popup('max');
		},
		
		max: function () {
			var options = $('#w2ui-popup').data('options');
			if (options.maximized === true) return;
			window.w2popup.resize(10000, 10000, function () {
				if (typeof options.onMax == 'function') options.onMax();
			});
			// save options
			options.maximized = true;
			options.prevSize  = $('#w2ui-popup').css('width')+':'+$('#w2ui-popup').css('height');
			$('#w2ui-popup').data('options', options);
		},

		min: function () {
			var options = $('#w2ui-popup').data('options');
			if (options.maximized !== true) return;
			var size = options.prevSize.split(':');
			window.w2popup.resize(size[0], size[1], function () {
				if (typeof options.onMin == 'function') options.onMin();
			});
			// save options
			options.maximized = false;
			options.prevSize  = null;
			$('#w2ui-popup').data('options', options);
		},

		get: function () {
			return $('#w2ui-popup').data('options');
		},

		set: function (options) {
			$().w2popup('open', options);
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
			if (parseInt(options.width) < 10)  options.width  = 10;
			if (parseInt(options.height) < 10) options.height = 10;
			if (typeof options.hideOnClick == 'undefined') options.hideOnClick = true;

			var head = $('#w2ui-popup .w2ui-msg-title');
			if ($('#w2ui-popup .w2ui-popup-message').length == 0) {
				var pwidth = parseInt($('#w2ui-popup').width());
				$('#w2ui-popup .w2ui-box1')
					.before('<div class="w2ui-popup-message" style="display: none; ' +
								(head.length == 0 ? 'top: 0px;' : 'top: '+ w2utils.getSize(head, 'height') + 'px;') +
					        	(typeof options.width  != 'undefined' ? 'width: '+ options.width + 'px; left: '+ ((pwidth - options.width) / 2) +'px;' : 'left: 10px; right: 10px;') +
					        	(typeof options.height != 'undefined' ? 'height: '+ options.height + 'px;' : 'bottom: 6px;') +
					        	'-webkit-transition: .3s; -moz-transition: .3s; -ms-transition: .3s; -o-transition: .3s;"' +
								(options.hideOnClick === true ? 'onclick="$().w2popup(\'message\');"' : '') + '>'+
							'</div>');
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
		
		startMove: function (event) {
			if (!event) event = window.event;
			if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
			this.resizing = true;
			this.tmp_x = event.screenX;
			this.tmp_y = event.screenY;
			if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
			if (event.preventDefault) event.preventDefault(); else return false;
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
			title = w2utils.lang('Notification');
		}
		$().w2popup({
			width 	: 450,
			height 	: 200,
			title   : title,
			body    : '<div class="w2ui-alert-body">' + msg +'</div>',
			buttons : '<input type="button" value="'+ w2utils.lang('Ok') +'" class="w2ui-alert-button" onclick="$().w2popup(\'close\');">'
		});
	};

	window.w2confirm = function (msg, title, callBack) {
		if (typeof callBack == 'undefined' || typeof title == 'function') {
			callBack = title; 
			title = w2utils.lang('Confirmation');
		}
		if (typeof title == 'undefined') {
			title = w2utils.lang('Confirmation');
		}
		$().w2popup({
			width 		: 450,
			height 		: 200,
			title   	: title,
			modal		: true,
			showClose	: false,
			body    	: '<div class="w2ui-confirm-body">' + msg +'</div>',
			buttons 	: '<input id="buttonNo" type="button" value="'+ w2utils.lang('No') +'" class="w2ui-confirm-button">&nbsp;'+
					  	  '<input id="buttonYes" type="button" value="'+ w2utils.lang('Yes') +'" class="w2ui-confirm-button">'
		});
		$('#w2ui-popup #buttonNo').on('click', function () {
			$().w2popup('close');
			if (typeof callBack == 'function') callBack('No');
		});
		$('#w2ui-popup #buttonYes').on('click', function () {
			$().w2popup('close');
			if (typeof callBack == 'function') callBack('Yes');
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
* == NICE TO HAVE ==
*	- tabs might not work in chromium apps, need bind()
*   - on overflow display << >>
* 	- individual tab onClick (possibly other events) are not working
*
* == NICE TO HAVE ==
*	- doClick -> click, doClose -> animateClose, doInsert -> animateInsert
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

		$.extend(true, this, options, w2obj.tabs);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2tabs = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2tabs().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
				return;			
			}
			// extend tabs
			var tabs   = method.tabs;
			var object = new w2tabs(method);
			$.extend(object, { tabs: [], handlers: [] });
			for (var i in tabs) { object.tabs[i] = $.extend({}, w2tabs.prototype.tab, tabs[i]); }		
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
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2tabs' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2tabs.prototype = {
		tab : {
			id		  : null,		// commnad to be sent to all event handlers
			text	  : '',
			hidden	  : false,
			disabled  : false,
			closable  :	false,
			hint	  : '',
			onClick	  : null,
			onRefresh : null,
			onClose	  : null
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
				var tab = $.extend({}, tab, tab[r]);
				if (id == null || typeof id == 'undefined') {
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
			if (this.get(id) == null || this.active == id) return false;
			this.active = id;
			this.refresh();
			return true;
		},
		
		set: function (id, tab) {
			var index = this.get(id, true);
			if (index == null) return false;
			$.extend(this.tabs[index], tab);
			this.refresh(id);
			return true;	
		},
		
		get: function (id, returnIndex) {
			for (var i in this.tabs) {
				if (this.tabs[i].id == id) { 
					if (returnIndex === true) return i; else return this.tabs[i]; 
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
			if (typeof tab.caption != 'undefined') tab.text = tab.caption;
			
			var jq_el   = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id));
			var tabHTML = (tab.closable ? '<div class="w2ui-tab-close" onclick="w2ui[\''+ this.name +'\'].animateClose(\''+ tab.id +'\', event);"></div>' : '') +
						  '	<div class="w2ui-tab'+ (this.active == tab.id ? ' active' : '') + (tab.closable ? ' closable' : '') +'" '+
						  '		title="'+ (typeof tab.hint != 'undefined' ? tab.hint : '') +'"'+
						  '		onclick="w2ui[\''+ this.name +'\'].click(\''+ tab.id +'\', event);">' + tab.text + '</div>';
			if (jq_el.length == 0) {
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
		},
		
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
			// default action
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (String(box) != 'undefined' && box != null) { 
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
			var html = '<table cellspacing="0" cellpadding="1" width="100%">'+
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
		},
		
		resize: function () {
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
			if ($(this.box).find('> table #tabs_'+ this.name + '_right').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-tabs')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		// ===================================================
		// -- Internal Event Handlers
	
		click: function (id, event) {
			var tab = this.get(id);
			if (tab == null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'click', target: id, tab: this.get(id), event: event });	
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active) +' .w2ui-tab').removeClass('active');
			this.active = tab.id;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh(id);
		},
		
		animateClose: function(id, event) {
			var tab = this.get(id);
			if (tab == null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'close', target: id, tab: this.get(id), event: event });	
			if (eventData.stop === true) return false;
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
					.html('<div style="width: '+ width +'px; -webkit-transition: .2s; -moz-transition: .2s; -ms-transition: .2s; -o-transition: .2s"></div>')
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
			if (this.get(id) == null) return;
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
			if (jq_el.length != 0) return; // already exists
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
	}
	
	$.extend(w2tabs.prototype, $.w2event);
	w2obj.tabs = w2tabs;
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2toolbar 	- toolbar widget
*		- $.w2toolbar	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*   - on overflow display << >>
* 
* == 1.3 Changes ==
* 	- doClick -> click, doMenuClick -> menuClick
*	- deprecated getMenuHTML() due to its use in w2menu
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
	
		$.extend(true, this, options, w2obj.toolbar);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2toolbar = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2toolbar().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
				return;			
			}
			var items = method.items;
			// extend items
			var object = new w2toolbar(method);
			$.extend(object, { items: [], handlers: [] });
			
			for (var i in items) { object.items[i] = $.extend({}, w2toolbar.prototype.item, items[i]); }		
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
			icon 	: null,
			hidden	: false,
			disabled: false,
			checked	: false, 	// used for radio buttons
			arrow	: true,		// arrow down for drop/menu types
			hint	: '',
			group	: null, 	// used for radio buttons
			items	: null, 	// for type menu it is an array of items in the menu
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
				if (id == null || typeof id == 'undefined') {
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
		
		set: function (id, options) {
			var item = this.get(id, true);
			if (item == null) return false;
			$.extend(this.items[item], options);
			this.refresh(id);
			return true;	
		},
		
		get: function (id, returnIndex) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].id == id) { 
					if (returnIndex === true) return i; else return this.items[i]; 
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
			if (eventData.stop === true) return false;
	 
			if (typeof box != 'undefined' && box != null) { 
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
			var html = '<table cellspacing="0" cellpadding="0" width="100%">'+
					   '<tr>';
			for (var i = 0; i < this.items.length; i++) {
				var it = this.items[i];
				if (it == null)  continue;
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
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		refresh: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), item: this.get(id) });	
			if (eventData.stop === true) return false;
			
			if (typeof id == 'undefined') {
				// refresh all
				for (var i = 0; i < this.items.length; i++) {
					if (typeof this.items[i].id == 'undefined') {
						console.log('ERROR: Cannot refresh toolbar element with no id.');
						continue;
					}
					this.refresh(this.items[i].id);
				}
			}
			// create or refresh only one item
			var it = this.get(id);
			if (it == null) return;
			
			var el = $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id));
			var html  = this.getItemHTML(it);
			if (el.length == 0) {
				// does not exist - create it
				html =  '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
						'	class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ html + 
						'</td>';
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
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		resize: function () {
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
			if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-toolbar')
					.html('');
			}
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend({ phase: 'after' }));	
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
					html +=  '<table cellpadding="0" cellspacing="0" title="'+ item.hint +'" class="w2ui-button '+ (item.checked ? 'checked' : '') +'" '+
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
									(item.text != '' ? '<td class="w2ui-tb-caption" nowrap>'+ item.text +'</td>' : '') +
									(((item.type == 'drop' || item.type == 'menu') && item.arrow !== false) ? 
										'<td class="w2ui-tb-down" nowrap>&nbsp;&nbsp;&nbsp;</td>' : '') +
							 '  </tr></table>'+
							 '</td></tr></table>';
					break;
								
				case 'break':
					html +=  '<table cellpadding="0" cellspacing="0"><tr>'+
							 '    <td><div class="w2ui-break">&nbsp;</div></td>'+
							 '</tr></table>';
					break;
	
				case 'html':
					html +=  '<table cellpadding="0" cellspacing="0"><tr>'+
							 '    <td nowrap>' + item.html + '</td>'+
							 '</tr></table>';
					break;
			}
			
			var newHTML = '';
			if (typeof item.onRender == 'function') newHTML = item.onRender.call(this, item.id, html);
			if (typeof this.onRender == 'function') newHTML = this.onRender(item.id, html);
			if (newHTML != '' && typeof newHTML != 'undefined') html = newHTML;
			return html;					
		},

		menuClick: function (id, event, menu_index) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var obj = this;
			var it  = this.get(id);
			if (it && !it.disabled) {
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'click', target: (typeof id != 'undefined' ? id : this.name), item: this.get(id),
					  subItem: (typeof menu_index != 'undefined' && this.get(id) ? this.get(id).items[menu_index] : null), event: event });	
				if (eventData.stop === true) return false;

				// normal processing

				// event after
				this.trigger($.extend({ phase: 'after' }));	
			}
		},
				
		click: function (id, event) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			var obj = this;
			var it  = this.get(id);
			if (it && !it.disabled) {
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'click', target: (typeof id != 'undefined' ? id : this.name), 
					item: this.get(id), event: event });	
				if (eventData.stop === true) return false;
			
				$('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').removeClass('down');
								
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
					$('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').addClass('checked');					
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
									select: function (item, event, index) { obj.menuClick(it.id, event, index); }
								}));
							}
							// window.click to hide it
							$(document).on('click', hideDrop);
							function hideDrop() {
								it.checked = false;
								if (it.checked) {
									$('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').addClass('checked');
								} else {
									$('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').removeClass('checked');					
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
						$('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').addClass('checked');
					} else {
						$('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button').removeClass('checked');					
					}
				}
				// event after
				this.trigger($.extend({ phase: 'after' }));	
			}
		}		
	}
	
	$.extend(w2toolbar.prototype, $.w2event);
	w2obj.toolbar = w2toolbar;
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2sidebar	  - sidebar widget
*		- $.w2sidebar - jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*
* == 1.3 Changes ==
*	- animated open/close
*	- added onKeyboard event
*	- added .keyboard = true
*	- moved some settings to prototype
*	- doClick -> click, doDblClick -> dblClick, doContextMenu -> contextMenu
*	- when clicked, first it selects then sends event (for faster view if event handler is slow)
*   - better keyboard navigation (<- ->, space, enter)
*	- added context menu see menuClick(), onMenuClick event, menu property 
*	- added scrollIntoView()
*
************************************************************************/

(function () {
	var w2sidebar = function (options) {
		this.name			= null;
		this.box 			= null;
		this.sidebar		= null;
		this.parent 		= null;
		this.nodes	 		= []; 	// Sidebar child nodes
		this.menu 			= [];
		this.selected 		= null;	// current selected node (readonly)
		this.img 			= null;
		this.icon 			= null;
		this.style			= '';
		this.topHTML		= '';
		this.bottomHTML  	= '';
		this.keyboard		= true;
		this.onClick		= null;	// Fire when user click on Node Text
		this.onDblClick		= null;	// Fire when user dbl clicks
		this.onContextMenu	= null;	
		this.onMenuClick	= null; // when context menu item selected
		this.onExpand		= null;	// Fire when node Expands
		this.onCollapse		= null;	// Fire when node Colapses
		this.onKeyboard		= null;
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy	 	= null;
	
		$.extend(true, this, options, w2obj.sidebar);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2sidebar = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2sidebar().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
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
			id	 			: null,
			text	   		: '',
			count			: '',
			img 			: null,
			icon 			: null,
			nodes	  		: [],
			style 			: '',
			selected 		: false,
			expanded 		: false,
			hidden			: false,
			disabled		: false,
			group			: false, 	// if true, it will build as a group
			plus 			: false,	// if true, plus will be shown even if there is no sub nodes
			// events
			onClick			: null,
			onDblClick		: null,
			onContextMenu	: null,
			onExpand		: null,
			onCollapse		: null,
			// internal
			parent	 		: null,		// node object
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
			if (arguments.length == 2) {
				// need to be in reverse order
				nodes   = arguments[1];
				before	= arguments[0];
				var ind = this.get(before);
				if (ind == null) {
					var txt = (nodes[o].caption != 'undefined' ? nodes[o].caption : nodes[o].text);
					console.log('ERROR: Cannot insert node "'+ txt +'" because cannot find node "'+ before +'" to insert before.'); 
					return null; 
				}
				parent 	= this.get(before).parent;
			}
			if (typeof parent == 'string') parent = this.get(parent);
			if (!$.isArray(nodes)) nodes = [nodes];
			for (var o in nodes) {
				if (typeof nodes[o].id == 'undefined') { 
					var txt = (nodes[o].caption != 'undefined' ? nodes[o].caption : nodes[o].text);					
					console.log('ERROR: Cannot insert node "'+ txt +'" because it has no id.'); 
					continue;
				}
				if (this.get(this, nodes[o].id) != null) { 
					var txt = (nodes[o].caption != 'undefined' ? nodes[o].caption : nodes[o].text);
					console.log('ERROR: Cannot insert node with id='+ nodes[o].id +' (text: '+ txt + ') because another node with the same id already exists.'); 
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
					var ind = this.get(parent, before, true);
					if (ind == null) {
						var txt = (nodes[o].caption != 'undefined' ? nodes[o].caption : nodes[o].text);
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
			for (var a = 0; a < arguments.length; a++) {
				var tmp = this.get(arguments[a]);
				if (tmp == null) continue;
				var ind  = this.get(tmp.parent, arguments[a], true);
				if (ind == null) continue;
				tmp.parent.nodes.splice(ind, 1);
				deleted++;
			}
			if (deleted > 0 && arguments.length == 1) this.refresh(tmp.parent.id); else this.refresh();
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
		
		get: function (parent, id, returnIndex) { // can be just called get(id) or get(id, true)
			if (arguments.length == 1 || (arguments.length == 2 && id === true) ) {
				// need to be in reverse order
				returnIndex = id;
				id 		= parent;
				parent 	= this;
			}
			// searches all nested nodes
			this._tmp = null;
			if (typeof parent == 'string') parent = this.get(parent); 
			if (parent.nodes == null) return null;
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
				if (tmp == null) continue;
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
				if (tmp == null) continue;
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
			for (var a = 0; a < arguments.length; a++) {
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
			if (nd == null) return;
			if (nd.plus) {
				this.set(id, { plus: false });
				this.expand(id);
				this.refresh(id);
				return;
			}
			if (nd.nodes.length == 0) return;
			if (this.get(id).expanded) this.collapse(id); else this.expand(id);
		},
	
		expand: function (id) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'expand', target: id });	
			if (eventData.stop === true) return false;
			// default action
			var nd = this.get(id);
			$(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').slideDown('fast');
			$(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-node-dots:first-child').html('<div class="w2ui-expand">-</div>');
			nd.expanded = true;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize();
		},
		
		collapse: function (id) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'collapse', target: id });	
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').slideUp('fast');		
			$(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-node-dots:first-child').html('<div class="w2ui-expand">+</div>');
			this.get(id).expanded = false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize();
		},

		collapseAll: function (parent) {
			if (typeof parent == 'undefined') parent = this;
			if (typeof parent == 'string') parent = this.get(parent); 
			if (parent.nodes == null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].expanded === true) parent.nodes[i].expanded = false;
				if (parent.nodes[i].nodes && parent.nodes[i].nodes.length > 0) this.collapseAll(parent.nodes[i]);
			}
			this.refresh(parent.id);
		},		
		
		expandAll: function (parent) {
			if (typeof parent == 'undefined') parent = this;
			if (typeof parent == 'string') parent = this.get(parent); 
			if (parent.nodes == null) return null;
			for (var i=0; i < parent.nodes.length; i++) {
				if (parent.nodes[i].expanded === false) parent.nodes[i].expanded = true;
				if (parent.nodes[i].nodes && parent.nodes[i].nodes.length > 0) this.collapseAll(parent.nodes[i]);
			}
			this.refresh(parent.id);
		},		

		expandParents: function (id) {
			var node = this.get(id);
			if (node == null) return;
			if (node.parent) {
				node.parent.expanded = true;
				this.expandParents(node.parent.id);
			}
			this.refresh(id);
		}, 

		click: function (id, event) {
			var obj = this;
			var nd  = this.get(id);
			if (nd == null) return;
			var old = this.selected;
			if (nd.disabled || nd.group || id == old) return;
			// move selected first
			$(obj.box).find('#node_'+ w2utils.escapeId(id)).addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected');
			$(obj.box).find('#node_'+ w2utils.escapeId(old)).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected');
			// need timeout to allow rendering
			setTimeout(function () {
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'click', target: id, event: event });	
				if (eventData.stop === true) {
					// restore selection
					$(obj.box).find('#node_'+ w2utils.escapeId(id)).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected');
					$(obj.box).find('#node_'+ w2utils.escapeId(old)).addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected');
					return false;
				}
				// default action
				if (old != null) obj.get(old).selected = false;
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
			var eventData = obj.trigger({ phase: 'before', type: 'keyboard', target: obj.name, event: event });	
			if (eventData.stop === true) return false;
			// default behaviour
			if (event.keyCode == 13 || event.keyCode == 32) { // enter or space
				if (nd.nodes.length > 0) obj.toggle(obj.selected);
			}
			if (event.keyCode == 37) { // left
				if (nd.nodes.length > 0) {
					obj.collapse(obj.selected);
				} else {
					// collapse parent
					if (nd.parent && !nd.parent.disabled && !nd.parent.group) {
						obj.collapse(nd.parent.id);
						obj.click(nd.parent.id);
						setTimeout(function () { obj.scrollIntoView(); }, 50);
					}
				}
			}
			if (event.keyCode == 39) { // right
				if (nd.nodes.length > 0) obj.expand(obj.selected);
			}
			if (event.keyCode == 38) { // up
				var tmp = prev(nd);
				if (tmp != null) { obj.click(tmp.id, event); setTimeout(function () { obj.scrollIntoView(); }, 50); }
			}
			if (event.keyCode == 40) { // down
				var tmp = next(nd);
				if (tmp != null) { obj.click(tmp.id, event); setTimeout(function () { obj.scrollIntoView(); }, 50); }
			}
			// cancel event if needed
			if ($.inArray(event.keyCode, [13, 32, 37, 38, 39, 40]) != -1) {
				if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation();				
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
			return;

			function next (node, noSubs) {
				if (node == null) return null;
				var parent 	 = node.parent;
				var ind 	 = obj.get(node.id, true);
				var nextNode = null;
				// jump inside
				if (node.expanded && node.nodes.length > 0 && noSubs !== true) {
					var t = node.nodes[0];
					if (!t.disabled && !t.group) nextNode = t; else nextNode = next(t);
				} else {
					if (parent && ind + 1 < parent.nodes.length) {
						nextNode = parent.nodes[ind + 1];
					} else {					
						nextNode = next(parent, true); // jump to the parent
					}
				}
				if (nextNode != null && (nextNode.disabled || nextNode.group)) nextNode = next(nextNode);
				return nextNode;
			}

			function prev (node) {
				if (node == null) return null;
				var parent 	 = node.parent;
				var ind 	 = obj.get(node.id, true);
				var prevNode = null;
				var noSubs   = false;
				if (ind > 0) {
					prevNode = parent.nodes[ind - 1];
					// jump inside parents last node
					if (prevNode.expanded && prevNode.nodes.length > 0) {
						var t = prevNode.nodes[prevNode.nodes.length - 1];
						if (!t.disabled && !t.group) prevNode = t; else prevNode = prev(t);
					}
				} else {					
					prevNode = parent; // jump to the parent
					noSubs   = true;
				}
				if (prevNode != null && (prevNode.disabled || prevNode.group)) prevNode = prev(prevNode);
				return prevNode;
			}
		},

		scrollIntoView: function (id) {
			if (typeof id == 'undefined') id = this.selected;
			var nd = this.get(id);
			if (nd == null) return;
			var body	= $(this.box).find('.w2ui-sidebar-div');
			var item 	= $(this.box).find('#node_'+ w2utils.escapeId(id));
			var offset 	= item.offset().top - body.offset().top;
			if (offset + item.height() > body.height()) {
				body.animate({ 'scrollTop': body.scrollTop() + body.height() / 1.3 });
			}
			if (offset <= 0) {
				body.animate({ 'scrollTop': body.scrollTop() - body.height() / 1.3 });
			}
		},

		dblClick: function (id, event) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'dblClick', target: id, event: event });	
			if (eventData.stop === true) return false;
			// default action
			var nd = this.get(id);
			if (nd.nodes.length > 0) this.toggle(id);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	
		contextMenu: function (id, event) {
			var obj = this;
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'contextMenu', target: id, event: event });	
			if (eventData.stop === true) return false;		
			// default action
			var nd = obj.get(id);
			if (id != obj.selected) obj.click(id);
			if (nd.group || nd.disabled) return;
			if (obj.menu.length > 0) {
				$(obj.box).find('#node_'+ w2utils.escapeId(id))
					.w2menu(obj.menu, { 
						left: event.offsetX - 25,
						select: function (item, event, index) { obj.menuClick(id, event, index); }
					}
				);
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
			return;
		},

		menuClick: function (itemId, event, index) {
			var obj = this;
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'menuClick', target: itemId, event: event, menuIndex: index, menuItem: obj.menu[index] });	
			if (eventData.stop === true) return false;		
			// default action
			// -- empty
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
		},
				
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
			// default action
			if (typeof box != 'undefined' && box != null) { 
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
				width 	: $(this.box).width() + 'px',
				height 	: $(this.box).height() + 'px'
			});
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// adjust top and bottom
			if (this.topHTML != '') {
				$(this.box).find('.w2ui-sidebar-top').html(this.topHTML);
				$(this.box).find('.w2ui-sidebar-div')					
					.css('top', $(this.box).find('.w2ui-sidebar-top').height() + 'px');
			}
			if (this.bottomHTML != '') {
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
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name) });	
			if (eventData.stop === true) return false;
			// adjust top and bottom
			if (this.topHTML != '') {
				$(this.box).find('.w2ui-sidebar-top').html(this.topHTML);
				$(this.box).find('.w2ui-sidebar-div')					
					.css('top', $(this.box).find('.w2ui-sidebar-top').height() + 'px');
			}
			if (this.bottomHTML != '') {
				$(this.box).find('.w2ui-sidebar-bottom').html(this.bottomHTML);
				$(this.box).find('.w2ui-sidebar-div')
					.css('bottom', $(this.box).find('.w2ui-sidebar-bottom').height() + 'px');
			}
			// default action
			$(this.box).find('> div').css({
				width 	: $(this.box).width() + 'px',
				height 	: $(this.box).height() + 'px'
			});
			var obj = this;
			if (typeof id == 'undefined') {
				var node = this;
				var nm 	 = '.w2ui-sidebar-div';
			} else {
				var node = this.get(id);
				if (node == null) return;
				var nm 	 = '#node_'+ w2utils.escapeId(node.id) + '_sub';
			}
			if (node != this) {
				var tmp = '#node_'+ w2utils.escapeId(node.id);
				var nodeHTML = getNodeHTML(node);
				$(this.box).find(tmp).before('<div id="sidebar_'+ this.name + '_tmp"></div>');
				$(this.box).find(tmp).remove();
				$(this.box).find(nm).remove();
				$('#sidebar_'+ this.name + '_tmp').before(nodeHTML);
				$('#sidebar_'+ this.name + '_tmp').remove();
			}
			// refresh sub nodes
			$(this.box).find(nm).html('');
			for (var i=0; i < node.nodes.length; i++) {
				var nodeHTML = getNodeHTML(node.nodes[i]);
				$(this.box).find(nm).append(nodeHTML);
				if (node.nodes[i].nodes.length != 0) { this.refresh(node.nodes[i].id); }
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			
			function getNodeHTML(nd) {
				var html = '';
				var img  = nd.img;
				if (img == null) img = this.img;
				var icon  = nd.icon;
				if (icon == null) icon = this.icon;
				// -- find out level
				var tmp   = nd.parent;
				var level = 0;
				while (tmp && tmp.parent != null) {
					if (tmp.group) level--;
					tmp = tmp.parent;
					level++;
				}	
				if (typeof nd.caption != 'undefined') nd.text = nd.caption;
				if (nd.group) {
					html = 
						'<div class="w2ui-node-group"  id="node_'+ nd.id +'"'+
						'		onclick="w2ui[\''+ obj.name +'\'].toggle(\''+ nd.id +'\'); '+
						'				 var sp=$(this).find(\'span:nth-child(1)\'); if (sp.html() == \''+ w2utils.lang('Hide') +'\') sp.html(\''+ w2utils.lang('Show') +'\'); else sp.html(\''+ w2utils.lang('Hide') +'\');"'+
						'		onmouseout="$(this).find(\'span:nth-child(1)\').css(\'color\', \'transparent\')" '+
						'		onmouseover="$(this).find(\'span:nth-child(1)\').css(\'color\', \'inherit\')">'+
						'	<span>'+ (!nd.hidden && nd.expanded ? w2utils.lang('Hide') : w2utils.lang('Show')) +'</span>'+
						'	<span>'+ nd.text +'</span>'+
						'</div>'+
						'<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>';
				} else {
					if (nd.selected && !nd.disabled) obj.selected = nd.id;
					var tmp = '';
					if (img)  tmp = '<div class="w2ui-node-image w2ui-icon '+ img +	(nd.selected && !nd.disabled ? " w2ui-icon-selected" : "") +'"></div>';
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
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
			if (eventData.stop === true) return false;
			// default action
			$(this.box).css('overflow', 'hidden');	// container should have no overflow
			//$(this.box).find('.w2ui-sidebar-div').css('overflow', 'hidden');
			$(this.box).find('> div').css({
				width 	: $(this.box).width() + 'px',
				height 	: $(this.box).height() + 'px'
			});			
			//$(this.box).find('.w2ui-sidebar-div').css('overflow', 'auto');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
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
		}				
	}
	
	$.extend(w2sidebar.prototype, $.w2event);
	w2obj.sidebar = w2sidebar;
})();
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2field 	- various field controls
*		- $.w2field		- jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*  - select - for select, list - for drop down (needs this in grid)
*  - enum (onLoaded)
*  - enum (onCompare)
*  - enum - onclick for already selected elements
*  - enum needs events onItemClick, onItemOver, etc just like upload
*  - upload (regular files)
* 
* == 1.3 changes ==
*  - select type has options.url to pull from server
*
************************************************************************/

(function ($) {

	/* SINGELTON PATTERN */

	var w2field = new (function () {
		this.customTypes = [];
	});

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
				switch (options.type.toLowerCase()) {

					case 'clear': // removes any previous field type
						$(this).off('keypress').off('focus').off('blur');
						$(this).removeData(); // removes all attached data
						if ($(this).prev().hasClass('w2ui-list')) {	// if enum
							$(this).prev().remove();
							$(this).removeAttr('tabindex').css('border-color', '').show();
						}
						if ($(this).prev().hasClass('w2ui-upload')) { // if upload
							$(this).prev().remove();
							$(this).removeAttr('tabindex').css('border-color', '').show();
						}
						break;

					case 'text':
						break;

					case 'int':
						$(this).on('keypress', function (event) { // keyCode & charCode differ in FireFox
							if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
							var ch = String.fromCharCode(event.charCode);
							if (!w2utils.isInt(ch) && ch != '-') {
								if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
								return false;
							}
						});
						$(this).on('blur', function (event)  { // keyCode & charCode differ in FireFox
							if (this.value != '' && !w2utils.isInt(this.value)) { 
								$(this).w2tag(w2utils.lang('Not an integer'));
							}
						});
						break;
						
					case 'float':
						$(this).on('keypress', function (event) { // keyCode & charCode differ in FireFox
							if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
							var ch = String.fromCharCode(event.charCode);
							if (!w2utils.isInt(ch) && ch != '.' && ch != '-') {
								if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
								return false;
							}
						});
						$(this).on('blur', function (event)  { 
							if (this.value != '' && !w2utils.isFloat(this.value)) {
								$(this).w2tag(w2utils.lang('Not a float'));
							} 
						});
						break;
						
					case 'money':
						$(this).on('keypress', function (event) { // keyCode & charCode differ in FireFox	
							if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
							var ch = String.fromCharCode(event.charCode);
							if (!w2utils.isInt(ch) && ch != '.' && ch != '-' && ch != '$' && ch != '€' && ch != '£' && ch != '¥') {
								if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
								return false;
							}
						});
						$(this).on('blur', function (event)  { 
							if (this.value != '' && !w2utils.isMoney(this.value)) { 
								$(this).w2tag(w2utils.lang('Not in money format'));
							} 
						});
						break;
						
					case 'hex':
						$(this).on('keypress', function (event) { // keyCode & charCode differ in FireFox	
							if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
							var ch = String.fromCharCode(event.charCode);
							if (!w2utils.isHex(ch)) {
								if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
								return false;
							}
						});
						$(this).on('blur', function (event)  { 
							if (this.value != '' && !w2utils.isHex(this.value)) { 
								$(this).w2tag(w2utils.lang('Not a hex number'));
							}
						});
						break;
						 
					case 'alphanumeric':
						$(this).on('keypress', function (event) { // keyCode & charCode differ in FireFox
							if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return;
							var ch = String.fromCharCode(event.charCode);
							if (!w2utils.isAlphaNumeric(ch)) {
								if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
								return false;
							}
						});
						$(this).on('blur', function (event)  { 
							if (this.value != '' && !w2utils.isAlphaNumeric(this.value)) { 
								$(this).w2tag(w2utils.lang('Not alpha-numeric')) 
							} 
						});
						break;
						
					case 'date':
						var obj = this;
						var defaults = {
							format 		: w2utils.settings.date_format, // date format
							start   	: '',				// start of selectable range
							end 		: '',				// end of selectable range
							blocked     : {}, 				// {'4/11/2011': 'yes'}
							colored     : {}				// {'4/11/2011': 'red:white'} 
						}
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
								$('body').append('<div id="global_calendar_div" style="top: '+ (top + parseInt(obj.offsetHeight)) +'px; left: '+ left +'px;" '+
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
								// trim empty spaces
								$(obj).val($.trim($(obj).val()));
								// check if date is valid
								if ($.trim($(obj).val()) != '' && !w2utils.isDate($(obj).val(), options.format)) {
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
						break;

					case 'select':
					case 'list':
						if (this.tagName != 'SELECT') {
							console.log('ERROR: You can only apply $().w2field(\'list\') to a SELECT element');
							return;
						}
						var defaults = {
							url			: '',
							items 		: [],
							value 		: null,
							showNone    : true
						};
						var obj 	 = this;
						var settings = $.extend({}, defaults, options);
						$(obj).data('settings', settings);
						// define refresh method
						obj.refresh = function () {
							var settings = $(obj).data('settings');
							var html 	 =  '';
							var items 	 = w2field.cleanItems(settings.items);
							// build options
							if (settings.showNone) html = '<option value="">- '+ w2utils.lang('none') +' -</option>';
							for (var i in items) {
								if (!settings.showNone && settings.value == null) settings.value = items[i].id;
								html += '<option value="'+ items[i].id +'">'+ items[i].text + '</option>';
							}
							$(obj).html(html);
							$(obj).val(settings.value);
							if ($(obj).val() != settings.value) $(obj).change();
						}
						// pull from server
						if (settings.url != '' ) {
							$.ajax({
								type 	 : 'GET',
								dataType : 'text',
								url 	 : settings.url,
								complete: function (xhr, status) {
									if (status == 'success') {
										var data 	 = $.parseJSON(xhr.responseText);
										var settings = $(obj).data('settings');
										settings.items = w2field.cleanItems(data.items);
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
						var settings = $.extend({}, defaults, options);

						// normalize items and selected
						settings.items 	  = w2field.cleanItems(settings.items);
						settings.selected = w2field.cleanItems(settings.selected);

						$(this).data('selected', settings.selected); 
						$(this).css({ 'border-color': 'transparent' });

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
								$('body').append('<div id="w2ui-global-items" class="w2ui-reset w2ui-items"></div>');
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
							$($(this).data('div')).remove();
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
										'<div title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&nbsp;&nbsp;</div>'+
										selected[s].text +
										'</li>';
							}
							html += '<li><input type="text"></li>';
							html += '</ul></div>';
							$(this).before(html);
							// adjust height
							var div = $(this).prev()[0];
							$(this).data('div', div);
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
								if (el.title == w2utils.lang('Remove')) {
									$(obj).data('selected').splice($(el).attr('index'), 1);
									$(el.parentNode).remove();
									obj.refresh(); 
									w2field.list_render.call(obj);
									$(obj).trigger('change');
									if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
								}
								$(this).find('input').focus();
							});
							$(div).find('input')
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
						}
						// init control
						$(this).data('settings', settings).attr('tabindex', -1);
						this.refresh();
						break;

					case 'upload':
						if (this.tagName != 'INPUT') {
							console.log('ERROR: You can only apply $().w2field(\'upload\') to an INPUT element');
							return;							
						}
						// init defaults
						var defaults = {
							url				: '', 	// not yet implemented
							base64			: true,	// if true max file size is 20mb (only tru for now)
							hint			: w2utils.lang('Attach files by dragging and dropping or Click to Select'),
							max 			: 0,	// max number of files, 0 - unlim
							maxSize			: 0, 	// max size of all files, 0 - unlim
							maxFileSize 	: 0,	// max size of a single file, 0 -unlim
							onAdd 			: null,
							onRemove		: null,
							onItemClick		: null,
							onItemDblClick	: null,
							onItemOver		: null,
							onItemOut		: null,
							onProgress		: null,	// not yet implemented
							onComplete		: null	// not yet implemented
						}
						var obj	= this;
						var settings = $.extend({}, defaults, options);
						if (settings.base64 === true) {
							if (settings.maxSize == 0) settings.maxSize = 20 * 1024 * 1024; // 20mb
							if (settings.maxFileSize == 0) settings.maxFileSize = 20 * 1024 * 1024; // 20mb
						}
						var selected = settings.selected;
						delete settings.selected;
						if (!$.isArray(selected)) selected = [];
						$(this).data('selected', selected).data('settings', settings).attr('tabindex', -1);
						w2field.upload_init.call(this);

						this.refresh = function () {
							var obj = this;
							var div = $(this).data('div');
							var settings = $(this).data('settings');
							var selected = $(this).data('selected');
							$(div).find('li').remove();
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
										'	<img src="##FILE##" onload="var w = $(this).width(); var h = $(this).height(); '+
										'		if (w < 300 & h < 300) return; '+
										'		if (w >= h && w > 300) $(this).width(300);'+
										'		if (w < h && h > 300) $(this).height(300);'+
										'	" onerror="this.style.display = \'none\'">'+
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
									.on('click', function (event) {
										if (typeof settings.onItemClick == 'function') {
											var ret = settings.onItemClick.call(obj, $(this).data('file'));
											if (ret === false) return;
										}
										if (!$(event.target).hasClass('file-delete')) event.stopPropagation();
									})
									.on('dblclick', function (event) {
										if (typeof settings.onItemDblClick == 'function') {
											var ret = settings.onItemDblClick.call(obj, $(this).data('file'));
											if (ret === false) return;
										}
										event.stopPropagation();
										if (document.selection) document.selection.empty(); else document.defaultView.getSelection().removeAllRanges();
									})
									.on('mouseover', function (event) {
										if (typeof settings.onItemOver == 'function') {
											var ret = settings.onItemOver.call(obj, $(this).data('file'));
											if (ret === false) return;
										}
										var file = $(this).data('file');
										$(this).w2overlay(
											previewHTML.replace('##FILE##', (file.content ? 'data:'+ file.type +';base64,'+ file.content : '')),
											{ top: -4 }
										);
									})
									.on('mouseout', function () {
										if (typeof settings.onItemOut == 'function') {
											var ret = settings.onItemOut.call(obj, $(this).data('file'));
											if (ret === false) return;
										}
										$(this).w2overlay();
									});
							}
						}
						this.refresh();
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
				if (opt == null) continue;
				if ($.isPlainObject(items)) {
					id 	 = i;
					text = opt;
				} else {
					if (typeof opt == 'string') {
						if (String(opt) == '') continue;
						id   = opt;
						text = opt;
					}
					if (typeof opt == 'object') {
					 	if (typeof opt.id != 'undefined')    id = opt.id;
						if (typeof opt.value != 'undefined') id = opt.value;
						if (typeof opt.txt != 'undefined')   text = opt.txt;
						if (typeof opt.text != 'undefined')  text = opt.text;
					}
				}
				if (w2utils.isInt(id)) id = parseInt(id);
				if (w2utils.isFloat(id)) id = parseFloat(id);
				newItems.push({ id: id, text: text });
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
						 'width: ' + (w2utils.getSize(obj, 'width') 
						 		   - parseInt($(obj).css('margin-left')) 
						 		   - parseInt($(obj).css('margin-right'))) + 'px; '+
						 'height: ' + (w2utils.getSize(obj, 'height') 
						 		   - parseInt($(obj).css('margin-top')) 
						 		   - parseInt($(obj).css('margin-bottom'))) + 'px; ';
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
						$(div).find('.file-input').click();
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
				name 	 : file.name,
				type 	 : file.type,
				modified : file.lastModifiedDate,
				size 	 : file.size,
				content  : null
			};
			var size = 0;
			var cnt  = 0;
			for (var s in selected) { size += selected[s].size; cnt++; }
			// check params
			if (settings.maxFileSize != 0 && newItem.size > settings.maxFileSize) {
				var err = 'Maximum file size is '+ w2utils.size(settings.maxFileSize);
				$(div).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (settings.maxSize != 0 && size + newItem.size > settings.maxSize) {
				var err = 'Maximum total size is '+ w2utils.size(settings.maxFileSize);
				$(div).w2tag(err);
				console.log('ERROR: '+ err);
				return;
			}
			if (settings.max != 0 && cnt >= settings.max) {
				var err = 'Maximum number of files is '+ settings.max;
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
				if (selected.length == 0) {
					$(div).prepend('<span>'+ settings.hint +'</span>');
				}
				$(obj).trigger('change');
			}, 300);
		},

		// ******************************************************
		// -- Enum

		list_render: function (search) {
			var obj 	 = this;
			var div 	 = $('#w2ui-global-items');
			var settings = $(this).data('settings');
			var items 	 = settings.items;
			var selected = $(this).data('selected');
			if (div.length == 0) return; // if it is hidden

			// build overall html
			if (typeof search == 'undefined') {
				var html 	 = '';
				html += '<div class="w2ui-items-list"></div>';						
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
					   (items.length == 0 && settings.last_total != 0) 
					|| (search.length > settings.last_search_len && settings.last_total > settings.maxCache)
					|| (search.length < settings.last_search_match && search.length != settings.last_search_len)
				)
			) {
				var match = false;
				if (settings.last_total < settings.maxCache) match = true;
				$.ajax({
					type 		: 'GET',
					dataType	: 'text',
					url 		: settings.url,
					data : {
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
							settings.items      = data.items;
							w2field.list_render.call(obj, search);
						}
					}
				});
			}
			
			// build items
			var i = 0;
			var ihtml = '<ul>';
			// get ids of all selected items
			var ids	  = [];
			for (var a in selected) ids.push(w2utils.isInt(selected[a].id) ? parseInt(selected[a].id) : String(selected[a].id))
			// build list
			for (var a in items) {
				var id  = items[a].id;
				var txt = items[a].text;
				// if already selected
				if ($.inArray(w2utils.isInt(id) ? parseInt(id) : String(id), ids) != -1 && settings.showAll !== true) continue;
				// check match with search
				var txt1 = String(search).toLowerCase();
				var txt2 = txt.toLowerCase();
				if (txt1.length <= txt2.length && txt2.substr(0, txt1.length) == txt1) {
					if (typeof settings['render'] == 'function') {
						txt = settings['render'](items[a]);
					}
					ihtml += '\n<li index="'+ a +'" value="'+ id +'" '+
							 '  onmouseover="$(this).parent().find(\'li\').removeClass(\'selected\'); $(this).addClass(\'selected\'); "'+
							 '	class="'+ (i % 2 ? 'w2ui-item-even' : 'w2ui-item-odd') + (i == $(obj).data('last_index') ? " selected" : "") +'">'+ 
							 txt +'</li>';
					if (i == $(obj).data('last_index')) $(obj).data('last_item', items[a]);
					i++;
				}
			}
			ihtml += '</ul>';
			if (i == 0) { 
				ihtml   = '<div class="w2ui-empty-list">'+ w2utils.lang('No items found') +'</div>';
				var noItems = true;
			}
			div.find('.w2ui-items-list').html(ihtml);
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
				$(div).find('.w2ui-items-list').css({
					height 	: (max_height - 15) + 'px', 
					overflow: 'auto' 
				});
			}

			// add events
			$(div)
				.off('mousedown')
				.on('mousedown', function (event) {
					if (event.target && event.target.tagName != 'LI') return;
					var id 	 = $(event.target).attr('index');
					var item = settings.items[id];
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
								if (event.preventDefault) event.preventDefault();
								break;
							case 8: // backspace
								if (String(inp.value) == '') {
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
						if (!(event.keyCode == 8 && String(inp.value) == '')) { 
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
			if (String(date) == '' || String(date) == 'undefined') date = w2utils.formatDate(today, options.format); 
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
			if (parseInt(month) < 12) {
				month = parseInt(month) + 1;
			} else {
				month = 1;
				year  = parseInt(year) + 1;
			}
			var options = $($('#global_calendar_div.w2ui-calendar').data('el')).data('options');
			$('#global_calendar_div.w2ui-calendar').html( $().w2field('calendar_get', w2utils.formatDate(month+'/1/'+year, options.format), options) );
		},
		
		calendar_previous: function(month_year) {
			var tmp = String(month_year).split('/');
			var month = tmp[0];
			var year  = tmp[1];
			if (parseInt(month) > 1) {
				month = parseInt(month) - 1;
			} else {
				month = 12;
				year  = parseInt(year) - 1;
			}
			var options = $($('#global_calendar_div.w2ui-calendar').data('el')).data('options');
			$('#global_calendar_div.w2ui-calendar').html( $().w2field('calendar_get', w2utils.formatDate(month+'/1/'+year, options.format), options) );
		},
		
		calendar_month: function(month, year, options) {
			var td = new Date();
			var months 		= w2utils.settings.fullmonths;
			var days  		= w2utils.settings.fulldays;
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
				if (ci % 7 == 6) className = 'w2ui-saturday';
				if (ci % 7 == 0) className = 'w2ui-sunday';
				if (dt == today) className += ' w2ui-today';
				
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
							'	$(el).val(\''+ w2utils.formatDate(dt, options.format) +'\').trigger(\'change\').trigger(\'blur\'); '+
							'	 if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;'+
							'	 if (event.preventDefault) event.preventDefault(); else return false;'+
							'"';
				}

				html +=	'>'+ dspDay + '</td>';
				if (ci % 7 == 0 || (weekDay == 0 && ci == 1)) html += '</tr><tr>';
				day++;
			}
			html += '</tr></table>';
			return html;
		}
	});

	w2obj.field = w2field;

}) (jQuery);
/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2form 	- form widget
*		- $.w2form		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2fields, w2tabs, w2popup
*
* == NICE TO HAVE ==
*	- refresh(field) - would refresh only one field
* 	- include delta on save
*
* == 1.3 changes ==
*   - tabs can be array of string, array of tab objects or w2tabs object
* 	- generate should use fields, and not its own structure
*	- added submit() as alias of save()
*	- moved some settings to prototype
*	- added form.onValidate event
*	- added lock(.., showSpinner) - show spinner
*	- deprecated w2form.init()
*	- doAction -> action
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
		this.tabs 			= {}; 		// if not empty, then it is tabs object

		this.style 			= '';
		this.focusFirst		= true;
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
		this.onError		= null;

		// internal
		this.isGenerated	= false;
		this.last = {
			xhr	: null		// jquery xhr requests
		}

		$.extend(true, this, options, w2obj.form);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2form = function(method) {
		if (typeof method === 'object' || !method ) {
			var obj = this;
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2form().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
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
				$.extend(true, object.tabs, { tabs: [] });
				for (var t in tabs) {
					var tmp = tabs[t];
					if (typeof tmp == 'object') object.tabs.tabs.push(tmp); else object.tabs.tabs.push({ id: tmp, caption: tmp });
				}
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
			if (obj) object.box = obj;
			object.initTabs();
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

		initTabs: function () {
			// init tabs regardless it is defined or not
			if (typeof this.tabs['render'] == 'undefined') {
				var obj = this;
				this.tabs = $().w2tabs($.extend({}, this.tabs, { name: this.name +'_tabs', owner: this }));
				this.tabs.on('click', function (id, choice) {
					obj.goto(this.get(id, true));
				});
			}
			return;
		},

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
			if (this.url != '' && this.recid != 0) {
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
				if (field.options && field.options.selected) delete field.options.selected;
			}
			$().w2tag();
			this.refresh();
		},
		
		error: function (msg) {
			var obj = this;
			// let the management of the error outside of the grid
			var eventData = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
			if (eventData.stop === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// need a time out because message might be already up)
			setTimeout(function () {
				if ($('#w2ui-popup').length > 0) {
					$().w2popup('message', {
						width 	: 370,
						height 	: 140,
						html 	: '<div class="w2ui-grid-error-msg" style="font-size: 11px;">ERROR: '+ msg +'</div>'+
								  '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center;">'+
								  '	<input type="button" value="Ok" onclick="$().w2popup(\'message\');" class="w2ui-grid-popup-btn">'+
								  '</div>'
					});
				} else {
					$().w2popup('open', {
						width 	: 420,
						height 	: 200,
						showMax : false,
						title 	: 'Error',
						body 	: '<div class="w2ui-grid-error-msg">'+ msg +'</div>',
						buttons : '<input type="button" value="Ok" onclick="$().w2popup(\'close\');" class="w2ui-grid-popup-btn">'
					});
				}
				console.log('ERROR: ' + msg);
			}, 1);
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
			}
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'validate', errors: errors });
			if (eventData.stop === true) return errors;
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
			if (!this.url) return;
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
			if (eventData.stop === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return false; }
			// default action
			this.record	  = {};
			this.original = {};
			// call server to get data
			this.lock(this.msgRefresh);
			if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {};
			this.last.xhr = $.ajax({
				type		: 'GET',
				url			: eventData.url, // + (eventData.url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.unlock();
					// event before
					var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'load', xhr: xhr, status: status });	
					if (eventData.stop === true) {
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
			console.log('err', errors);
			if (errors.length !== 0) {
				obj.goto(errors[0].field.page);
				return;
			}
			// submit save
			if (typeof postData == 'undefined' || postData == null) postData = {};
			if (!obj.url) {
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
							var dt = params.record[field.name];
							if (field.options.format.toLowerCase() == 'dd/mm/yyyy' || field.options.format.toLowerCase() == 'dd-mm-yyyy'
									|| field.options.format.toLowerCase() == 'dd.mm.yyyy') {
								var tmp = dt.replace(/-/g, '/').replace(/\./g, '/').split('/');
								var dt  = new Date(tmp[2] + '-' + tmp[1] + '-' + tmp[0]);
							}
							params.record[field.name] = w2utils.formatDate(dt, 'yyyy-mm-dd');
							break;
					}
				}
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'submit', target: obj.name, url: obj.url, postData: params });
				if (eventData.stop === true) { 
					if (typeof callBack == 'function') callBack({ status: 'error', message: 'Saving aborted.' }); 
					return false; 
				}
				// default action
				if (obj.last.xhr) try { obj.last.xhr.abort(); } catch (e) {};
				obj.last.xhr = $.ajax({
					type		: (w2utils.settings.RESTfull ? (obj.recid == 0 ? 'POST' : 'PUT') : 'POST'),
					url			: eventData.url, // + (eventData.url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
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
						if (eventData.stop === true) {
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
			var obj = this;
			if (typeof msg == 'undefined' || msg == '') {
				setTimeout(function () {
					$('#form_'+ obj.name +'_lock').remove();
					$('#form_'+ obj.name +'_status').remove();
				}, 25);
			} else {
				$('#form_'+ obj.name +'_lock').remove();
				$('#form_'+ obj.name +'_status').remove();
				$(this.box).find('> div :first-child').before(
					'<div id="form_'+ obj.name +'_lock" class="w2ui-lock"></div>'+
					'<div id="form_'+ obj.name +'_status" class="w2ui-lock-msg"></div>'
				);
				setTimeout(function () {
					var lock 	= $('#form_'+ obj.name +'_lock');
					var status 	= $('#form_'+ obj.name +'_status');
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
						if (showSpinner === true) msg = '<div class="w2ui-spinner"></div>' + msg;
						status.html(msg).css({
							opacity : status.data('old_opacity'),
							left	: left + 'px',
							top		: top + 'px'
						});
					}, 10);
				}, 10);
			}
		},

		unlock: function() {
			this.lock();
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
			if (this.actions.length > 0) {
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
			var eventData = this.trigger({ phase: 'before', target: action, type: 'action', event: event });	
			if (eventData.stop === true) return false;
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
			if (eventData.stop === true) return false;
			// default behaviour
			var main 	= $(this.box).find('> div');
			var header	= $(this.box).find('> div .w2ui-form-header');
			var tabs	= $(this.box).find('> div .w2ui-form-tabs');
			var page	= $(this.box).find('> div .w2ui-page');
			var cpage	= $(this.box).find('> div .w2ui-page.page-'+ this.page);
			var dpage	= $(this.box).find('> div .w2ui-page.page-'+ this.page + ' > div');
			var buttons	= $(this.box).find('> div .w2ui-buttons');		
			// if no height, calculate it
			resizeElements();
			if ($(this.box).height() == 0 || $(this.box).data('auto-size') === true) {
				$(this.box).height(
					(header.length > 0 ? w2utils.getSize(header, 'height') : 0) + 
					(this.tabs.tabs.length > 0 ? w2utils.getSize(tabs, 'height') : 0) + 
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
				tabs.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0));
				page.css('top', (obj.header != '' ? w2utils.getSize(header, 'height') : 0) 
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
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('.w2ui-page').hide();
			$(this.box).find('.w2ui-page.page-' + this.page).show();
			// refresh tabs if needed
			if (typeof this.tabs == 'object' && this.tabs.tabs.length > 0) {
				$('#form_'+ this.name +'_tabs').show();
				this.tabs.active = this.tabs.tabs[this.page].id;
				this.tabs.refresh();
			} else {
				$('#form_'+ this.name +'_tabs').hide();
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
						if (!field.options.format) field.options.format = 'mm/dd/yyyy';
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
						var sel = value;
						// if (field.selected) sel = field.selected;
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
			if (eventData.stop === true) return false;
			// default actions
			var html =  '<div>' +
						(this.header != '' ? '<div class="w2ui-form-header">' + this.header + '</div>' : '') +
						'	<div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs"></div>' +
							this.formHTML +
						'</div>';
			$(this.box).attr('name', this.name)
				.addClass('w2ui-reset w2ui-form')
				.html(html);
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// init tabs
			this.initTabs();
			if (typeof this.tabs == 'object' && typeof this.tabs.render == 'function') {
				this.tabs.render($('#form_'+ this.name +'_tabs')[0]);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// after render actions
			this.resize();
			if (this.url != '' && this.recid != 0) {
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
			// focus first
			function focusFirst() {
				var inputs = $(obj.box).find('input, select');
				if (inputs.length > 0) inputs[0].focus();
			}
			if (this.focusFirst === true) setTimeout(focusFirst, 500); // need timeout to allow form to render
		},

		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });	
			if (eventData.stop === true) return false;
			// clean up
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
	}
	
	$.extend(w2form.prototype, $.w2event);
	w2obj.form = w2form;
})();
