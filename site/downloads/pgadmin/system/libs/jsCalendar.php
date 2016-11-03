<? require("phpCache.php"); ?>
/*************************************************************
*
* -- Calendar Class
*
*************************************************************/

function jsCalendar(name, box) {
	// variables
	this.name		 = (name ? name : 'noname');
	this.box		 = (box ? box : null);
	this.blocked     = [];
	this.colored     = [];
	
	// functions	
	this.getMonth  	 = jsCalendar_getMonth;
	this.get2Months  = jsCalendar_get2Months;
	this.get3Months  = jsCalendar_get3Months;
	this.getHours    = jsCalendar_getHours;
	this.getMinutes  = jsCalendar_getMinutes;
	this.output      = jsCalendar_output;
	this.refresh     = jsCalendar_output;
	
	// events
	this.onSelect;
	this.onCancel;
	
	// internal arrays
	this.months 	 = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July',	'August', 'September', 'October', 'November', 'December');
	this.days  		 = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
	this.daysCount   = new Array('31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31');
	this.ownerDocument;

	// current date
	var td = new Date();
	this.lastMonth;
	this.lastYear;
    this.curDay   = td.getDate();
    this.curMonth = Number(td.getMonth())+1;
    this.curYear  = String(td.getYear()).length > 3 ? td.getYear() : td.getYear()+1900;
    this.curDate = this.curMonth + '/' + this.curDay + '/'+(td.getYear()+1900);

    if (!top.elements) top.elements = [];
    //if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;

	// ==============-------------------------------
	// -------------- IMPLEMENTATION

	function jsCalendar_getMonth(year, month) {
		// initiate parameters
		year  = Number(year);
		month = Number(month);
		if (year  === null || year  === '') year  = this.curYear;
		if (month === null || month === '') month = this.curMonth;
		if (month > 12) { month = month - 12; year++; }
		if (month < 1 || month == 0)  { month = month + 12; year--; }
		if (year/4 == Math.floor(year/4)) { this.daysCount[1] = '29'; } else { this.daysCount[1] = '28'; }
		if (year  == null) { year  = d.getYear(); }
		if (month == null) { month = d.getMonth()-1; }
		this.lastMonth = month;
		this.lastYear  = year;
		// start with the required date
		var td = new Date();
		td.setDate(1);
		td.setMonth(month-1);
		td.setYear(year);
		var weekDay = td.getDay();
		
		cc 	  = 'align="center" style="background-color: #e8e8e8; color: gray;"';
		html  = '<table cellpadding="3" cellspacing="0" style="background-color: #e4ebed; border: 1px solid silver;" class="rText">'+
				'	<tr><td colspan="7" align="center" style="padding: 4px; border-bottom: 1px solid silver; '+
				'			background-image: url('+top.jsUtils.sys_path+'/images/bl_title_bg.png); color: black"> '+ 
				this.months[month-1] +', '+ year +' </td></tr>'+
				'	<tr><td '+cc+'>M</td> <td '+cc+'>T</td> <td '+cc+'>W</td>'+
				'	    <td '+cc+'>T</td> <td '+cc+'>F</td> <td '+cc+'>S</td> <td '+cc+'>S</td>'+
				'	</tr>'+
				'	<tr>';	
		var day = 1;
		for (ci=1; ci<43; ci++) {
			if (weekDay == 0 && ci == 1) {
				for (ti=0; ti<6; ti++) html += '<td style="cursor: default; background-color: #f4f4fe; border: 1px solid #e8e8e8;">&nbsp;</td>';
				ci += 6;
			} else {
				if (ci < weekDay || day > this.daysCount[month-1]) {
					html += '<td style="cursor: default; background-color: #f4f4fe; border: 1px solid #e8e8e8;">&nbsp;</td>';
					if ((ci)%7 == 0) html += '</tr><tr>';
					continue;
				}
			}
			dt = month + '/' + day + '/' + year;
			if (weekDay == 0 && ci == 1) console.log(dt + ' - ' + this.curDate);
			if (dt == this.curDate) bor = 'border: 1px solid #c8493b;'; else bor = 'border: 1px solid #e8e8e8;';
			if ((ci)%7 == 0)  col = 'color: #c8493b;'; else col = 'color: black;'; 
			dspDay = day;
			bgcol = 'background-color: #f4f4fe;';
			if (this.colored[dt] != undefined) {
				tmp   = this.colored[dt].split(':');
				bgcol = 'background-color: ' + tmp[0] + ';';
				col   = 'color: ' + tmp[1] + ';';
			}
			html += '<td align="right" style="cursor: default; '+ bor + col + bgcol +'"'+
					'	id="'+ this.name +'_date_'+ dt +'" date="'+ dt +'"';
			if (!this.blocked[dt]) {
				html += 
					'	onclick     = "obj = top.elements[\''+ this.name +'\']; if (obj.onSelect) obj.onSelect(this.getAttribute(\'date\'));"'+
					'	onmouseover = "this.oldBGColor = this.style.backgroundColor; this.style.backgroundColor =\'yellow\';"'+
					'	onmouseout  = "this.style.backgroundColor = this.oldBGColor;"';
			} else {
				dspDay = '<strike>'+ dspDay +'</strike>';
			}
			html +=	'>'+ dspDay + '</td>';
			if ((ci)%7 == 0 || (weekDay == 0 && ci == 1)) html += '</tr><tr>';
			day++;
		}
		html += '</tr></table>';
		return html;
	}

	function jsCalendar_get3Months(year, month) { 
		return this.get2Months(year, month); 
	}

	function jsCalendar_get2Months(year, month) {
		if (!year) year   = this.curYear;
		if (!month) month = this.curMonth;
		year  = parseInt(year);
		month = parseInt(month);
		html = '<table cellpadding="0" cellspacing="1" class="rText" style="background-color: white; border: 2px solid #5a8cdc;" id="'+ this.name + '_tbl" date="'+ this.curDate +'">'+
			   '<tr> <td colspan=5 style="border-bottom: 2px solid silver; background-color: #3b79c8; color: black; font-weight: 700"> '+
			   '	<div style="float: left; cursor: default;">'+
			   '		<input type="button" value="<<"  class="rText" style="width: 37px" tabindex="-1"'+
			   '		onclick     = "obj = top.elements[\''+ this.name +'\']; newYear = obj.lastYear; newMonth = obj.lastMonth -3;'+
			   '					   document.getElementById(\''+ this.name +'_month1\').innerHTML = obj.getMonth(newYear, newMonth); '+
			   '					   document.getElementById(\''+ this.name +'_month2\').innerHTML = obj.getMonth(newYear, newMonth+1); '+
			   '					  ">'+
			   '		<input type="button" value="Today" class="rText"'+
			   '		onclick     = "obj = top.elements[\''+ this.name +'\']; if (obj.onSelect) obj.onSelect(obj.curDate);">'+
			   '		<input type="button" value=">>" class="rText" style="width: 37px" tabindex="-1"'+
			   '		onclick     = "obj = top.elements[\''+ this.name +'\']; newYear = obj.lastYear; newMonth = obj.lastMonth+1; '+
			   '					   document.getElementById(\''+ this.name +'_month1\').innerHTML = obj.getMonth(newYear, newMonth); '+
			   '					   document.getElementById(\''+ this.name +'_month2\').innerHTML = obj.getMonth(newYear, newMonth+1); '+
			   '					  ">'+
			   '	</div>'+
			   '	<div style="float: right; color: white;"> '+
			   '		<input type="button" value="X" onclick="obj = top.elements[\''+ this.name +'\']; if (obj.onCancel) obj.onCancel(); document.getElementById(\''+ this.name + '_tbl\').parentNode.style.display = \'none\';" class="rText" style="width: 32px" tabindex="-1"> '+
			   '	</div> '+
			   '	</td> '+
			   '</tr>'+
			   '<tr>'+
			   '	<td id="'+ this.name +'_month1">'+ this.getMonth(year, month)   + '</td>'+
			   '	<td id="'+ this.name +'_month2">'+ this.getMonth(year, month+1) + '</td>'+
			   '</tr>'+
			   '</table>';
		return html;
	}

	function jsCalendar_getHours(id) {
		var doc = this.ownerDocument ? this.ownerDocument : document;
		var el  = doc.getElementById(this.name + '_tbl');
		var html = '<div style="background-color: #a5cbd5; padding: 3px;">AM</div>';
		for (var i=1; i<=12; i++) {
			html += '<div onmouseover="this.style.backgroundColor = \'yellow\';" onmouseout="this.style.backgroundColor = \'\';" '+
					'	onclick="tm = document.getElementById(\''+id+'\').value.split(\':\'); min = parseInt(tm[1] == undefined ? \'0\' : tm[1]); min = (min<10 ? \'0\' : \'\') + min; document.getElementById(\''+ id +'\').value = \''+ i +'\' + \':\' + min; top.elements[\''+ id +'_time' +'\'].getMinutes(\''+ id +'\');"'+
					'	style="padding: 3px; margin: 2px; width: 14px; height: 14px; text-align: center; float: left; cursor: default;">'+ i +'</div>';
			if (i==6)  html += '<div></div>';
			if (i==12) html += '<div></div>';
			if (i==18) html += '<div></div>';
		}
		html += '<div style="clear: both"></div>'+
				'<div style="clear: both; background-color: #a5cbd5; padding: 3px; margin-top: 3px;">PM</div>';
		for (var i=13; i<=24; i++) {
			html += '<div onmouseover="this.style.backgroundColor = \'yellow\';" onmouseout="this.style.backgroundColor = \'\';" '+
					'	onclick="tm = document.getElementById(\''+id+'\').value.split(\':\'); min = parseInt(tm[1] == undefined ? \'0\' : tm[1]); min = (min<10 ? \'0\' : \'\') + min; document.getElementById(\''+ id +'\').value = \''+ i +'\' + \':\' + min; top.elements[\''+ id +'_time' +'\'].getMinutes(\''+ id +'\');"'+
					'	style="padding: 3px; margin: 2px; width: 14px; height: 14px; text-align: center; float: left; cursor: default;">'+ parseInt(i-12) +'</div>';
			if (i==6)  html += '<div></div>';
			if (i==12) html += '<div></div>';
			if (i==18) html += '<div></div>';
		}
		if (el) el.innerHTML = html;
		return '<div style="background-color: #f4f4fe; text-align: center; font-family: verdana; font-size: 11px; padding: 2px; width: 145px; height: 138px; text-align: center; border: 2px solid #3b79c8; padding: 1px;" id="'+ this.name +'_tbl">' + html + '</div>';
	}

	function jsCalendar_getMinutes(id) {
		var doc = this.ownerDocument ? this.ownerDocument : document;
		var el  = doc.getElementById(this.name + '_tbl');
		var html = '<div style="background-color: #a5cbd5; padding: 3px;">Minute</div>'+
				   '<div style="padding-top: 5px; padding-left: 23px;">';	
		for (var i=0; i<=59; i+=15) {
			html += '<div onmouseover="this.style.backgroundColor = \'yellow\';" onmouseout="this.style.backgroundColor = \'\';" '+
					'	onclick="tm = document.getElementById(\''+id+'\').value.split(\':\'); hour = parseInt(tm[0] == undefined ? \'0\' : tm[0]); document.getElementById(\''+ id +'\').value = hour + \':\' + \''+ (i<10 ? '0' : '') + i +'\'; top.elements[\''+ id +'_time' +'\'].onSelect(document.getElementById(\''+ id +'\').value); top.elements[\''+ id +'_time' +'\'].getHours(\''+ id +'\');"'+
					'	style="padding: 3px; margin: 2px; width: 14px; height: 14px; text-align: center; float: left; cursor: default;">'+ (i<10 ? '0' : '') + i +'</div>';
		}
		html += '</div><div style="clear: both"></div>'+
				'<div style="border-bottom: 1px solid #a5cbd5; font-size: 1px; margin-bottom: 2px;">&nbsp;</div>';
		for (var i=0; i<=59; i+=5) {
			html += '<div onmouseover="this.style.backgroundColor = \'yellow\';" onmouseout="this.style.backgroundColor = \'\';" '+
					'	onclick="tm = document.getElementById(\''+id+'\').value.split(\':\'); hour = parseInt(tm[0] == undefined ? \'0\' : tm[0]); document.getElementById(\''+ id +'\').value = hour + \':\' + \''+ (i<10 ? '0' : '') + i +'\'; top.elements[\''+ id +'_time' +'\'].onSelect(document.getElementById(\''+ id +'\').value); top.elements[\''+ id +'_time' +'\'].getHours(\''+ id +'\');"'+
					'	style="padding: 3px; margin: 2px; width: 14px; height: 14px; text-align: center; float: left; cursor: default;">'+ (i<10 ? '0' : '') + i +'</div>';
			if (i==6) html += '<div></div>';
			if (i==12) html += '<div></div>';
			if (i==18) html += '<div></div>';
		}
		el.innerHTML = html;
	}


	function jsCalendar_output() {
		if (this.box) this.box.innerHTML = this.get3Months();
	}

	function jsCalendar_refresh() {
		this.output();
	}	
}

if (top != window) top.jsCalendar = jsCalendar;