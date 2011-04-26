// ==============================================================
// -- Userful controls 

var jsControls2 = {

	init: function (cnt, type, param) {
		// -- all possible control types
		switch (String(type).toUpperCase()) {
		
			case 'INT':
				// -- cross browser multiple events
				if (cnt.onkeyup) cnt._onkeyup = cnt.onkeyup;
				cnt.onkeyup = function (event) {
					if (!window.jsUtils.isInt(this.value)) { this.select(); }
					if (cnt._onkeyup) cnt._onkeyup();
				}
				if (cnt.onblur) cnt._onblur = cnt.onblur;
				cnt.onblur = function (event) {
					if (!window.jsUtils.isInt(this.value)) { this.value = ''; }
					if (cnt._onblur) cnt._onblur();
				}
				break;
				
			case 'FLOAT':
				// -- cross browser multiple events
				if (cnt.onkeyup) cnt._onkeyup = cnt.onkeyup;
				cnt.onkeyup = function (event) {
					if (!window.jsUtils.isFloat(this.value)) { this.select(); }
					if (cnt._onkeyup) cnt._onkeyup();
				}
				if (cnt.onblur) cnt._onblur = cnt.onblur;
				cnt.onblur = function (event) {
					if (!window.jsUtils.isFloat(this.value)) { this.value = ''; }
					if (cnt._onblur) cnt._onblur();
				}
				break;
				
			case 'MONEY':
				// -- cross browser multiple events
				if (cnt.onkeyup) cnt._onkeyup = cnt.onkeyup;
				cnt.onkeyup = function (event) {
					if (!window.jsUtils.isMoney(this.value)) { this.select(); }
					if (cnt._onkeyup) cnt._onkeyup();
				}
				if (cnt.onblur) cnt._onblur = cnt.onblur;
				cnt.onblur = function (event) {
					if (!window.jsUtils.isMoney(this.value)) { this.value = ''; }
					if (cnt._onblur) cnt._onblur();
				}
				break;
				
			case 'DATE':
				// -- insert div for calendar
				var div = document.createElement('DIV');
				div.id  = cnt.id + '_calendar';
				div.style.cssText += 'position: absolute; z-index: 1000; display: none; margin-top: 1px;';
				//div.innerHTML = this.getCalendar(cnt.value, (param ? param : {}));
				
				cnt.parentNode.appendChild(div, cnt);
				cnt._controls = this;
				cnt._param	  = param;
				cnt.calendar  = div;				
				window._calendar_el = cnt;
				
				// -- cross browser multiple events
				if (cnt.onfocus) cnt._onfocus = cnt.onfocus;
				cnt.onfocus = function (event) {
					if (this.calendar.style.display == '') return;
					this.calendar.innerHTML = this._controls.getCalendar(cnt.value, (this._param ? this._param : {}));
					this.calendar.style.display = '';
					window.jsUtils.dropShadow(this.calendar);
					if (cnt._onfocus) cnt._onfocus();
				}
				if (cnt.onkeyup) cnt._onkeyup = cnt.onkeyup;
				cnt.onkeyup = function (event) {
					this.calendar.innerHTML = this._controls.getCalendar(cnt.value, (this._param ? this._param : {}));
					if (cnt._onkeyup) cnt._onkeyup();
				}
				if (cnt.onblur) cnt._onblur = cnt.onblur;
				cnt.onblur = function (event) {
					window._tmp_el = this;
					window._tmp_timeout = setTimeout("window._tmp_el.calendar.style.display = 'none'; window.jsUtils.clearShadow(window._tmp_el.calendar);", 300);
					if (cnt._onblur) cnt._onblur();
				}
				break;
				
			case 'TIME':
				break;
				
			case 'COLOR':
				break;
				
			case 'LIST':
				break;
				
			case 'LOOKUP':
				break;
				
			case 'LOOKUP-SOFT':
				break;
				
			case 'HTMLAREA':
				break;
				
			case 'RADIO':
				break;
				
			case 'RADIO-YESNO':
				break;
				
			case 'UPLOAD':
				break;
		}
	},
	
	populate: function(cnt, param) {
	},
	
	getCalendar: function (date, param) {
		var td = new Date();
		var today = (Number(td.getMonth())+1) + '/' + td.getDate() + '/' + (String(td.getYear()).length > 3 ? td.getYear() : td.getYear() + 1900);
		if (date == '' || String(date) == 'undefined') date = today; 
		if (!window.jsUtils.isDate(date)) date = today;
		
		var tmp  = date.split('/')
		var html =  '<table cellpadding=0 cellspacing=0 style="font-family: verdana; font-size: 11px; line-height: 108%;"><tr>' +
					'<td>'+ this.getMonth(tmp[0], tmp[2], param) +'</td>'+
					'<!--td valign="top" style="background-color: #f4f4fe; padding: 8px; padding-bottom: 0px; padding-top: 22px; border: 1px solid silver; border-left: 0px;">'+
					'	Jan <br> Feb <br> Mar <br> Apr <br> May <br> Jun <br> Jul <br> Aug <br> Sep <br> Oct <br> Nov <br> Dec'+
					'</td>'+
					'<td valign="top" style="background-color: #f4f4fe; padding: 6px; padding-bottom: 0px; padding-top: 22px; border: 1px solid silver; border-left: 0px;">'+
					'	2001 <br> 2002 <br> 2003 <br> 2004'+
					'</td-->'+
					'</tr></table>';
		return html;
	},
	
	getMonth: function(month, year, param) {
		// param = { blocked: {'4/11/2011': 'yes'}, colored: {'4/11/2011': 'red:white'} }
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
		
		var cc 	  = 'align="center" style="background-color: #e8e8e8; color: gray;"';
		var html  = '<table cellpadding="3" onclick = "window.clearTimeout(window._tmp_timeout); window._calendar_el.focus();" '+
					'		cellspacing="0" style="background-color: #e4ebed; border: 1px solid silver; font-family: verdana; font-size: 11px;" class="rText">'+
					'	<tr><td colspan="7" align="center" style="padding: 5px; border-bottom: 1px solid silver; '+
					'			background-image: url('+top.jsUtils.sys_path+'/images/bl_title_bg.png); color: black"> '+ 
					'	<b>'+ months[month-1] +', '+ year +'</b> </td></tr>'+
					'	<tr><td '+cc+'>M</td> <td '+cc+'>T</td> <td '+cc+'>W</td>'+
					'	    <td '+cc+'>T</td> <td '+cc+'>F</td> <td '+cc+'>S</td> <td '+cc+'>S</td>'+
					'	</tr>'+
					'	<tr>';
				
		var day = 1;
		for (var ci=1; ci<43; ci++) {
			if (weekDay == 0 && ci == 1) {
				for (var ti=0; ti<6; ti++) html += '<td style="cursor: default; background-color: #f4f4fe; border: 1px solid #e8e8e8;">&nbsp;</td>';
				ci += 6;
			} else {
				if (ci < weekDay || day > daysCount[month-1]) {
					html += '<td style="cursor: default; background-color: #f4f4fe; border: 1px solid #e8e8e8;">&nbsp;</td>';
					if ((ci)%7 == 0) html += '</tr><tr>';
					continue;
				}
			}
			var dt  = month + '/' + day + '/' + year;
			var bor = '';
			var col = '';
			if (dt == today) bor = 'border: 1px solid #c8493b;'; else bor = 'border: 1px solid #e8e8e8;';
			if ((ci)%7 == 0) col = 'color: #c8493b;'; else col = 'color: black;'; 
			var dspDay = day;
			var bgcol = 'background-color: #f4f4fe;';
			if (param.colored) if (param.colored[dt] != undefined) {
				tmp   = param.colored[dt].split(':');
				bgcol = 'background-color: ' + tmp[0] + ';';
				col   = 'color: ' + tmp[1] + ';';
			}
			html += '<td align="right" style="padding-left: 5px; padding-right: 5px; cursor: default; '+ bor + col + bgcol +'"'+
					'	id="'+ this.name +'_date_'+ dt +'" date="'+ dt +'"';
			var noSelect = false;
			if (param.blocked) if (param.blocked[dt] != undefined) {
				dspDay = '<strike>'+ dspDay +'</strike>';
				noSelect = true;
			} 
			if (noSelect === false) {
				html += 'onclick     = "window._calendar_el.value = \''+ dt +'\'; if(window._calendar_el.onchange) window._calendar_el.onchange();'+
						'			    event.stopPropagation(); return false;"'+
						'onmouseover = "this._bgColor = this.style.backgroundColor; this.style.backgroundColor =\'yellow\';"'+
						'onmouseout  = "this.style.backgroundColor = this._bgColor;"';
			}
			html +=	'>'+ dspDay + '</td>';
			if ((ci)%7 == 0 || (weekDay == 0 && ci == 1)) html += '</tr><tr>';
			day++;
		}
		html += '</tr></table>';
		return html;
	},
	
	getTime: function(time) {
	}
}