<? require("phpCache.php"); ?>
/*************************************************************
*
* -- Different types of the Controls
* -- such as: Group, Text, Int, Float, Date
* --          Time, Date&Time, List
*
*************************************************************/

function jsField(caption, type, fieldName, inTag, outTag, defValue, required, column) {
	this.caption	= caption;
    this.type		= type;
    this.fieldName  = fieldName;
    this.inTag		= inTag;
    this.outTag		= outTag;
    this.defValue	= defValue;
    this.value		= null; // current value of the field, if needed to be saved. jsList searches.
    this.required 	= required ? required : false;
    this.column     = column ? column : 0;
    this.td1Class   = 'fieldTitle';
    this.td2Class   = 'fieldControl';
	this.onSelect   = ''; // used for LOOKUP field for now

    this.param;  	// parameter of the control, such as OPTIONS from the list page
    this.items;  	// if it is not null, it will be used to build the list
    this.owner;  	// group that ownes this field
	this.ownerName; // name of owner class, if null, owner field is used
    this.prefix; 	// prefix for the id attribute (in case 2 edits on the page)
    this.index;  	// index number of the field in the edit
    this.html;
    this.build		= jsField_build;
	
	// ==============-------------------------------
	// -------------- IMPLEMENTATION

	function jsField_build(inLabel, spanAdd) {
		this.html = '';
		td1_style = 'valign="top" style="padding-top: 4px" '+ inLabel;
		if (this.caption == '') ssign = ''; else ssign = ':';
		if (this.required) rsign = "<div style='padding-top: 3px; padding-left: 2px; color: red' class='rText'>*</div>"; else rsign = "<div style='padding: 2px;' class='rText'>&nbsp;</div>";
		tmpValue = ((this.value != null && this.value != '') ? this.value : this.defValue);

		switch (String(this.type).toUpperCase()) {

			case 'HIDDEN':
				this.html += '<td colspan="'+ parseInt(spanAdd+3) +'" style="display: none">'+
							 '	<input id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			class="rText" type="hidden" value="'+ tmpValue +'" '+ this.inTag +'>'+ 
							 '</td>';
				break;

			case 'TEXT':
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td></td>'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '		<input id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			class="rText rInput" type="text" value="'+ tmpValue +'" '+ this.inTag +'>'+
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;
				
			case 'LOOKUP':		
				var tmp = String(tmpValue).split('::');
				if (tmp[1] == undefined) tmp[1] = 'start typing...';
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '		<input size=2 id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			class="rText rInput" type="hidden" onchange="'+ this.onSelect +'" value="'+ tmp[0] +'">'+
							 '		<input type="text" autocomplete="off" class="rText rInput" style="background-color: ecf5e4; color: #666666;'+ this.inTag +'"'+
							 '			id="'+ this.prefix + '_field' +  this.index +'_search" value="'+ tmp[1] +'" '+ 
							 '			onclick="if (this.value == \'start typing...\') { this.value = \'\'; this.style.color = \'black\'; } this.select();" '+
							 '			onkeydown="if (this.value ==\'start typing...\') this.value = \'\'; "'+
							 '			onkeyup="top.elements[\''+ (this.ownerName != undefined ? this.ownerName : this.owner.owner.name) +'\'].lookup_keyup(this, \''+ this.prefix + '_field' +  this.index +'\', event)" '+
							 '			onblur ="top.elements[\''+ (this.ownerName != undefined ? this.ownerName : this.owner.owner.name) +'\'].lookup_blur(this, \''+ this.prefix + '_field' +  this.index +'\', event)">'+ 
							 '		<br>'+
							 '		<div id="'+ this.prefix + '_field'+  this.index +'_div" '+ 
							 '			style="position: absolute; z-index: 100; border: 1px solid #a7a6aa; border-top: 0px; background-color: white; display: none; '+
							 '			'+ this.inTag +'"> '+
							 '		</div>'+
							 '	</div>'+
							 (this.outTag != '' ? '<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>' : '')+
							 '</td>\n';
				break;

			case 'TEXTAREA':
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'" valign=top> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'" valign=top> ';
				}
				this.html += '	<div>'+
							 '	<textarea id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			class="rText rInput rTextArea" type="text" value="'+ tmpValue +'" '+ this.inTag +'></textarea>'+ 
							 '	</div>'+
							 '	'+ this.outTag +
							 '</td>\n';
				break;

			case 'HTMLAREA':
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'" valign=top> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'" valign=top> ';
				}
				this.html += '	<div id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			class="rText rInput rHTMLArea" type="text" value="'+ tmpValue +'" '+ this.inTag +'>'
							 '	</div>'+ this.outTag +
							 '</td>\n';
				break;
				
			case 'PASSWORD':
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '		<input id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			class="rText rInput" type="password" value="'+ tmpValue +'" '+ this.inTag +'>'+ 
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'INT':
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '	<input id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			style="float: left;"'+
							 '			onkeyup="if (!top.jsUtils.isInt(this.value)) this.select();"'+
							 '			onblur ="if (!top.jsUtils.isInt(this.value)) this.value = \'\';"'+
							 '			class="rText rInput" type="text" value="'+ tmpValue +'" '+ this.inTag +'>'+
							 '	</div>'+
							 '	<div style="margin: 3px; float: left; size: auto;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'INTRANGE':
				tmpValue = ((this.value != null && this.value != '') ? this.value : this.defValue);
				tmpValue = tmpValue.split('::');
				if (tmpValue[1] == undefined) tmpValue[1] = '';
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '	<input id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			onkeyup="if (!top.jsUtils.isInt(this.value)) this.select();"'+
							 '			onblur ="if (!top.jsUtils.isInt(this.value)) this.value = \'\';"'+
							 '			class="rText rInput" type="text" value="'+ tmpValue[0] +'" '+ this.inTag +'>'+
							 '  - '+
							 '	<input id="'+ this.prefix + '_field' +  this.index +'_2" name="'+ this.fieldName +'_2" '+
							 '			onkeyup="if (!top.jsUtils.isInt(this.value)) this.select();"'+
							 '			onblur ="if (!top.jsUtils.isInt(this.value)) this.value = \'\';"'+
							 '			class="rText rInput" type="text" value="'+ tmpValue[1] +'" '+ this.inTag +'>'+
							 '	</div>'+
							 '	<div style="margin: 3px; float: left; size: auto;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'FLOAT':
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '	<input id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			style="float: left;"'+
							 '			onkeyup="if (!top.jsUtils.isFloat(this.value)) this.select();"'+
							 '			onblur ="if (!top.jsUtils.isFloat(this.value)) this.value = \'\';"'+
							 '			class="rText rInput" type="text" value="'+ tmpValue +'" '+ this.inTag +'>'+
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'FLOATRANGE':
				tmpValue = ((this.value != null && this.value != '') ? this.value : this.defValue);
				tmpValue = tmpValue.split('::');
				if (tmpValue[1] == undefined) tmpValue[1] = '';
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<input id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			onkeyup="if (!top.jsUtils.isFloat(this.value)) this.select();"'+
							 '			onblur ="if (!top.jsUtils.isFloat(this.value)) this.value = \'\';"'+
							 '			class="rText rInput" type="text" value="'+ tmpValue[0] +'" '+ this.inTag +'>'+
							 '  - '+
							 '	<input id="'+ this.prefix + '_field' +  this.index +'_2" name="'+ this.fieldName +'_2" '+
							 '			onkeyup="if (!top.jsUtils.isFloat(this.value)) this.select();"'+
							 '			onblur ="if (!top.jsUtils.isFloat(this.value)) this.value = \'\';"'+
							 '			class="rText rInput" type="text" value="'+ tmpValue[1] +'" '+ this.inTag +'>'+
							 '		<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'LIST':
				if (this.items) {
					this.param = '';
					for (it=0; it<this.items.length; it++) {
						itt = this.items[it];
						tmp = itt.split('::');
						this.param += '<option value="'+ tmp[0] + '" '+ tmp[2] +'>' + tmp[1] + '</option>';
					}
				}
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '		<select id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" value="'+ tmpValue +'" '+
							 '				class="rText rInput" type="text" '+ this.inTag +'>\n'+
										this.param +
							 '	   </select>'+
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'RADIO_YESNO':
				if (tmpValue.toUpperCase() == 'Y' || tmpValue.toUpperCase() == 'T' || tmpValue.toUpperCase() == '1')
					checkYes = 'checked'; else checkYes = '';
				if (tmpValue.toUpperCase() == 'N' || tmpValue.toUpperCase() == 'F' || tmpValue.toUpperCase() == '0')
					checkNo = 'checked'; else checkNo = '';
				this.param = '<table cellpadding="2" cellspacing="0"><tr>'+
							 '<td class="rText" style="width: 10px;">'+
							 '	<input tabindex=-1 type="radio" style="position: relative; top: -2px;" id="'+ this.prefix + '_field' +  this.index +'_radio0" '+ checkYes +
							 '		name="'+ this.prefix + '_field' +  this.index +'_radio" value="t" '+
							 '		onclick="document.getElementById(\''+ this.prefix + '_field' +  this.index +'\').value = \'t\';">'+
							 '</td><td class="rText" style="padding: 1px;" valign=top>'+
							 '	<label for="'+ this.prefix + '_field' +  this.index +'_radio0" class="rText">Yes</label>'+
							 '</td><td style="paddin-left: 5px; padding-right: 5px"></td>'+
							 '<td class="rText" style="width: 10px;">'+
							 '	<input tabindex=-1 type="radio" style="position: relative; top: -2px;" id="'+ this.prefix + '_field' +  this.index +'_radio1" '+ checkNo +
							 '		name="'+ this.prefix + '_field' +  this.index +'_radio" value="f" '+
							 '		onclick="document.getElementById(\''+ this.prefix + '_field' +  this.index +'\').value = \'f\';">'+
							 '</td><td class="rText" style="padding: 1px;" valign=top>'+
							 '	<label for="'+ this.prefix + '_field' +  this.index +'_radio1" class="rText">No</label>'+
							 '</td>'+
							 '</tr></table>';

			case 'RADIO':
				if (this.items) {
					this.param = '<table class="rText" cellpadding="2" cellspacing="0" style="padding:0px;"><tr>';
					for (var it=0; it<this.items.length; it++) {
						itt = this.items[it];
						tmp = itt.split('::');
						dch = (tmpValue == tmp[0] ? 'checked' : '');
						this.param += '<td style="padding-top: 0px; padding-bottom: 2px;">'+
									  '	<input tabindex=-1 type=radio name="'+ this.prefix + '_field' +  this.index +'_radio" id="'+ this.prefix +'_field'+ this.index +'_radio'+ it +'" value="'+ tmp[0] + '" '+ dch +' '+ tmp[2] +
									  ' 	onclick="document.getElementById(\''+ this.prefix + '_field' +  this.index +'\').value = this.value;'+
									  '				 if (el.onchange) el.onchange();">'+
									  '</td>'+
									  '<td style="padding-top: 0px; padding-right: 15px;">'+
									  '	<label for="'+ this.prefix +'_field'+ this.index +'_radio'+ it +'">' + tmp[1] + '</label>'+
									  '</td>';
						if (tmp[2] == 'newline') this.param += '</tr><tr>';
					}
					this.param += '<td></td></tr></table>';
				}
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<input type="hidden" value="'+ tmpValue +'" id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+ this.inTag +'>'+
										this.param + 
										this.outTag +
							 '</td>\n';
				break;

			case 'CHECK':
				if (this.items) {
					this.param = '<table class="rText" cellpadding="2" cellspacing="0" style="padding:0px;"><tr>';
					for (var it=0; it<this.items.length; it++) {
						itt = this.items[it];
						tmp = itt.split('::');
						dch = (tmpValue.substr(0, tmp[0].length+1) == tmp[0]+',' || tmpValue.substr(tmpValue.length - tmp[0].length -1) == ','+tmp[0] 
							|| tmpValue == tmp[0] || tmpValue.indexOf(','+tmp[0]+',') != -1 ? 'checked' : '');
						this.param += '<td style="padding-top: 0px; padding-bottom: 2px;">'+
									  '	<input tabindex=-1 type=checkbox name="'+ this.prefix + '_field' +  this.index +'_check" id="'+ this.prefix +'_field'+ this.index +'_check'+ it +'" value="'+ tmp[0] + '" '+ dch +' '+ tmp[2] +
									  ' 	onclick="var el = document.getElementById(\''+ this.prefix + '_field' +  this.index +'\'); '+
									  '				 if (this.checked) {'+
									  '					if (el.value != \'\') el.value += \',\'; '+
									  '					el.value += this.value; '+
									  '				 } else { '+
									  '					el.value = el.value.replace(this.value+\',\', \'\'); '+
									  '					el.value = el.value.replace(\',\'+this.value, \'\'); '+
									  '					if (el.value == this.value) el.value = \'\'; '+
									  '				 }'+
									  '				 if (el.onchange) el.onchange();">'+
									  '</td>'+
									  '<td style="padding-top: 0px; padding-right: 15px;">'+
									  '	<label for="'+ this.prefix +'_field'+ this.index +'_check'+ it +'">' + tmp[1] + '</label>'+
									  '</td>';
						if (tmp[2] == 'newline') this.param += '</tr><tr>';
					}
					this.param += '<td></td></tr></table>';
				}
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<input type="hidden" value="'+ tmpValue +'" id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+ this.inTag +'>'+
										this.param + 
										this.outTag +
							 '</td>\n';
				break;

			case 'DATE':
				if (!top.jsCalendar) { alert('You need to load jsCalendar class in order to use a DATE field.'); break; }
				cal  = new top.jsCalendar(''+ this.prefix + '_field' +  this.index+ '_calendar');
				try { cal.ownerDocument = (this.owner.owner ? this.owner.owner.box.ownerDocument : this.owner.box.ownerDocument); } catch(e) {}
				cal.onSelect = new Function("param", "this.ownerDocument.getElementById('"+ this.prefix + "_field"+ this.index +"').value = param;"+
													 "this.ownerDocument.getElementById(this.name + '_tbl').parentNode.style.display = 'none';"+
													 "cal = this.ownerDocument.getElementById(this.name + '_tbl').parentNode; cal.shadow.style.display = 'none';");
				cal.onCancel = new Function("cal = this.ownerDocument.getElementById(this.name + '_tbl').parentNode; cal.shadow.style.display = 'none';");
				calhtml = '<div style="position: absolute; z-Index: 101; padding-top: 1px; display: none;" id="'+ this.prefix + '_field' +  this.index +'_caldiv">'+ cal.get3Months() + '</div>';
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'" nowrap> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'" nowrap> ';
				}
				this.html += '	<div style="float:left">'+
							 '	<input type="text" size="10" id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '		class="rText rInput" value="'+ tmpValue +'" '+ this.inTag +'>'+ calhtml +
							 '	<input type="button" class="rText" value="..." style="width: 32px" tabindex="-1"'+
							 '		onclick="cal = document.getElementById(\''+ this.prefix + '_field' +  this.index + '_caldiv\'); '+
							 '				 if (cal.style.display == \'none\')  { cal.style.display = \'\'; cal.shadow = top.jsUtils.dropShadow(cal); } '+
							 '												else { cal.style.display = \'none\'; cal.shadow.style.display = \'none\'; } '+
							 '				 this.blur();">'+ 
							 '	(mm/dd/yyyy)'+
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'DATERANGE':
				if (!top.jsCalendar) { alert('You need to load jsCalendar class in order to use a DATERANGE field.'); break; }
				// calendar 1
				cal  = new top.jsCalendar(''+ this.prefix + '_field' +  this.index+ '_calendar');
				try { cal.ownerDocument = (this.owner.owner ? this.owner.owner.box.ownerDocument : this.owner.box.ownerDocument); } catch(e) {}
				cal.onCancel = new Function("cal = this.ownerDocument.getElementById(this.name + '_tbl').parentNode; cal.shadow.style.display = 'none';");
				cal.onSelect = new Function("param", "this.ownerDocument.getElementById('"+ this.prefix + "_field"+ this.index +"').value = param;"+
													 "this.ownerDocument.getElementById(this.name + '_tbl').parentNode.style.display = 'none';"+
													 "cal = this.ownerDocument.getElementById(this.name + '_tbl').parentNode; cal.shadow.style.display = 'none';");
				calhtml1 = '<div style="position: absolute; z-Index: 100; padding-top: 1px; display: none;" id="'+ this.prefix + '_field' +  this.index +'_caldiv">'+ cal.get3Months() + '</div>';
				// calendar 2
				cal  = new top.jsCalendar(''+ this.prefix + '_field' +  this.index+ '_2_calendar');
				try { cal.ownerDocument = (this.owner.owner ? this.owner.owner.box.ownerDocument : this.owner.box.ownerDocument); } catch(e) {}
				cal.onCancel = new Function("cal = this.ownerDocument.getElementById(this.name + '_tbl').parentNode; cal.shadow.style.display = 'none';");
				cal.onSelect = new Function("param", "this.ownerDocument.getElementById('"+ this.prefix + "_field"+ this.index +"_2').value = param;"+
													 "this.ownerDocument.getElementById(this.name + '_tbl').parentNode.style.display = 'none';"+
													 "cal = this.ownerDocument.getElementById(this.name + '_tbl').parentNode; cal.shadow.style.display = 'none';");
				calhtml2 = '<div style="position: absolute; z-Index: 100; padding-top: 1px; display: none;" id="'+ this.prefix + '_field' +  this.index +'_2_caldiv">'+ cal.get3Months() + '</div>';

				tmpValue = ((this.value != null && this.value != '') ? this.value : this.defValue);
				tmpValue = tmpValue.split('::');
				if (tmpValue[1] == undefined) tmpValue[1] = '';
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '<table cellpadding=0 cellspacing=0 class=rText><tr><td nowrap>'+
							 '	<input type="text" size="10" id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '		class="rText rInput" value="'+ tmpValue[0] +'" '+ this.inTag +'>'+ calhtml1 + calhtml2 +
							 '	<input type="button" class="rText" value="..." style="width: 32px" tabindex="-1"'+
							 '		onclick="cal = document.getElementById(\''+ this.prefix + '_field' +  this.index + '_caldiv\'); '+
							 '				 if (cal.style.display == \'none\')  { cal.style.display = \'\'; cal.shadow = top.jsUtils.dropShadow(cal); } '+
							 '												else { cal.style.display = \'none\'; cal.shadow.style.display = \'none\'; } '+
							 '				 this.blur();">'+
							 '</td><td style="padding-left: 5px; padding-right: 5px;"> through </td><td nowrap>'+
							 '	<div style="float:left">'+
							 '	<input type="text" size="10" id="'+ this.prefix + '_field' +  this.index +'_2" name="'+ this.fieldName +'_2" '+
							 '		class="rText rInput" value="'+ tmpValue[1] +'" '+ this.inTag +'>'+
							 '	<input type="button" class="rText" value="..." style="width: 32px" tabindex="-1"'+
							 '		onclick="cal = document.getElementById(\''+ this.prefix + '_field' +  this.index + '_2_caldiv\'); '+
							 '				 if (cal.style.display == \'none\')  { cal.style.display = \'\'; cal.shadow = top.jsUtils.dropShadow(cal); } '+
							 '												else { cal.style.display = \'none\'; cal.shadow.style.display = \'none\'; } '+
							 '				 this.blur();">'+ 
							 '	(mm/dd/yyyy)'+
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>'+
							 '</tr></table>'+
							 '</td>\n';
				break;

			case 'TIME':
				if (!top.jsCalendar) { alert('You need to load jsCalendar class in order to use a TIME field.'); break; }
				cal  = new top.jsCalendar(''+ this.prefix + '_field' +  this.index+ '_time');
				try { cal.ownerDocument = (this.owner.owner ? this.owner.owner.box.ownerDocument : this.owner.box.ownerDocument); } catch(e) {}
				cal.onSelect = new Function("param", "this.ownerDocument.getElementById('"+ this.prefix + "_field"+ this.index +"').value = param;"+
													 "this.ownerDocument.getElementById(this.name + '_tbl').parentNode.style.display = 'none';"+
													 "cal = this.ownerDocument.getElementById(this.name + '_tbl').parentNode; cal.shadow.style.display = 'none';");
				cal.onCancel = new Function("cal = this.ownerDocument.getElementById(this.name + '_tbl').parentNode; cal.shadow.style.display = 'none';");
				calhtml = '<div style="position: absolute; z-Index: 100; padding-top: 1px; display: none;" id="'+ this.prefix + '_field' +  this.index +'_caldiv">'+ cal.getHours(this.prefix + '_field' +  this.index) + '</div>';
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="width: auto; float: left">'+
							 '	<input size="10" id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			onblur ="if (!top.jsUtils.isTime(this.value)) this.value = \'\';"'+
							 '			class="rText rInput" type="text" value="'+ tmpValue +'" '+ this.inTag +'>\n'+ calhtml +
							 '	<input type="button" class="rText" value="..." style="width: 32px" tabindex="-1"'+
							 '		onclick="cal = document.getElementById(\''+ this.prefix + '_field' +  this.index + '_caldiv\'); '+
							 '				 if (cal.style.display == \'none\')  { cal.style.display = \'\'; cal.shadow = top.jsUtils.dropShadow(cal); } '+
							 '												else { cal.style.display = \'none\'; cal.shadow.style.display = \'none\'; } '+
							 '				 this.blur();">'+
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'TIMERANGE':
				tmpValue = ((this.value != null && this.value != '') ? this.value : this.defValue);
				tmpValue = tmpValue.split('::');
				if (tmpValue[1] == undefined) tmpValue[1] = '';
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '	<input size="5" id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			onblur ="if (!top.jsUtils.isTime(this.value)) this.value = \'\';"'+
							 '			class="rText" type="text" value="'+ tmpValue[0] +'" '+ this.inTag +'>'+ 
							 '  through '+
							 '	<input size="5" id="'+ this.prefix + '_field' +  this.index +'_2" name="'+ this.fieldName +'_2" '+
							 '			onblur ="if (!top.jsUtils.isTime(this.value)) this.value = \'\';"'+
							 '			class="rText rInput" type="text" value="'+ tmpValue[1] +'" '+ this.inTag +'>'+
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'COLOR':
				colorDsp  = '<div id="'+ this.prefix + '_field' +  this.index +'_cpicker">'+
							'	<table cellpadding=5 cellspacing=0 style="border: 1px solid silver; background-color: #f5f4f2; font-size: 11px; font-family: verdana;">'+
							'	<tr><td colspan=2>'+
							'		<div id="'+ this.prefix + '_field' +  this.index +'_pcolor" style="float: left; position: relative; background-color: black; height: 18px; width: 35px;"></div>'+
							'		<div id="'+ this.prefix + '_field' +  this.index +'_pcolor2" style="float: right; padding-left: 10px;">'+
							'			<input type=button style="font-size: 10px; font-family: verdana;" value="Apply" '+
							'					onclick="document.getElementById(\''+ this.prefix + '_field' +  this.index +'\').value = top.color_RGB2HEX(document.getElementById(\''+ this.prefix + '_field' +  this.index +'_pcolor\').style.backgroundColor); '+
							'							 document.getElementById(\''+ this.prefix + '_field' +  this.index +'_dspcolor\').style.backgroundColor = document.getElementById(\''+ this.prefix + '_field' +  this.index +'_pcolor\').style.backgroundColor; '+
							'							 cal = document.getElementById(\''+ this.prefix + '_field' +  this.index + '_colordiv\'); cal.style.display = \'none\'; cal.shadow.style.display = \'none\';">&nbsp;'+
							'			<input type=button style="font-size: 10px; font-family: verdana;" value="Close" '+
							'					onclick="cal = document.getElementById(\''+ this.prefix + '_field' +  this.index + '_colordiv\'); cal.style.display = \'none\'; cal.shadow.style.display = \'none\';">'+
							'		</div>'+
							'	</td></tr>'+
							'	<tr><td style="width: 170px" align=center>'+
							'		<div id="'+ this.prefix + '_field' +  this.index +'_clarge" onmousedown="top.color_mdown(\'large\', event)" onmouseup="top.color_mup(\'large\', event)" '+
							'			onmousemove="top.color_mmove(\'large\', event)"'+
							'			style="position: relative; background: #FF0000 url(../system/images/color_palette.png); width: 170px; height: 170px;">'+
							'		</div>'+
							'	</td><td>'+
							'		<div id="'+ this.prefix + '_field' +  this.index +'_csmall" onmousedown="top.color_mdown(\'small\', event)" onmouseup="top.color_mup(\'small\', event)" '+
							'			onmousemove="top.color_mmove(\'small\', event)"	style="position: relative; width: 20px; height: 170px;">'+
							'		</div>'+
							'	</td></tr>'+
							'	</table>'+
							'</div>';
				colorhtml = '<div style="position: absolute; z-Index: 101; padding-top: 1px; display: none;" id="'+ this.prefix + '_field' +  this.index +'_colordiv">'+ colorDsp + '</div>';
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'" nowrap> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'" nowrap> ';
				}
				this.html += '	<div style="float:left">'+
							 '	<input type="text" size="6" id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '		onkeyup="if (!top.jsUtils.isHex(this.value)) this.select();"'+
							 '		onblur ="if (!top.jsUtils.isHex(this.value)) this.value = \'\'; document.getElementById(\''+ this.prefix + '_field' +  this.index +'_dspcolor\').style.backgroundColor = this.value;"'+
							 '		class="rText rInput" value="'+ tmpValue +'" '+ this.inTag +'>'+ 
							 '	<span id="'+ this.prefix + '_field' +  this.index +'_dspcolor" style="padding: 3px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'+ colorhtml +
							 '	<input type="button" class="rText" value="..." style="width: 32px" tabindex="-1"'+
							 '		onclick="cal = document.getElementById(\''+ this.prefix + '_field' +  this.index + '_colordiv\'); '+
							 '				 if (cal.style.display == \'none\')  { cal.style.display = \'\'; cal.shadow = top.jsUtils.dropShadow(cal); } '+
							 '												else { cal.style.display = \'none\'; cal.shadow.style.display = \'none\'; } '+
							 '				 this.blur();'+
							 '				 top.initColors(top.elements[\''+ this.owner.owner.name +'\'], \''+ this.prefix + '_field' +  this.index +'\');">'+ 
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;
				
			case 'BREAK':
				this.html += '	<td colspan="'+ parseInt(spanAdd+3) +'"  class="rText" '+ this.inTag +'>'+ this.outTag +'</td>';
				break;

			case 'UPLOAD':
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float:left">'+
							 '		<input size=20 type="text" id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" readonly class="rText rInput" value="'+ tmpValue +'" '+ this.inTag +'>'+
							 '		<input type="file" id="'+ this.prefix + '_field' +  this.index +'_file" name="'+ this.fieldName +'_file" class="rText" '+
							 '			onchange="document.getElementById(\''+ this.prefix + '_field' + this.index +'\').value=this.value">'+ 
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;

			case 'READONLY':
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ parseInt(spanAdd) +'" class="'+ this.td2Class +'"> ';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
								 '<td colspan="'+ (parseInt(spanAdd)+1) +'" class="'+ this.td2Class +'"> ';
				}
				this.html += '	<div style="float: left; size: auto;">'+
							 '		<input tabindex=-1 id="'+ this.prefix + '_field' +  this.index +'" name="'+ this.fieldName +'" '+
							 '			class="rText rInput" style="color: #333333; background-color: #efefef;" type="text" value="'+ tmpValue +'" readonly '+ this.inTag +'>'+ 
							 '	</div>'+
							 '	<div style="margin: 3px; size: auto; float: left;">'+ this.outTag +'</div>'+
							 '</td>\n';
				break;
				
			case 'TITLE':
				this.html += '<td colspan="'+ parseInt(spanAdd+3) +'"  class="rText" style="padding-top: 4px">'+
							 '	<div class="rText" style="clear: both; padding: 1px; padding-top: 0px;" ' +this.inTag + '>'+ tmpValue + this.outTag +'</div>'+
							 '</td>';
				break;

			case 'FIELD':
				this.html += '<td></td>'+
							 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>'+
							 '<td colspan="'+ parseInt(spanAdd) +'" class="rText" style="padding-top: 4px">'+
							 '	<div class="rText" style="clear: both; padding: 1px; padding-top: 0px;" '+ this.inTag +'>'+ tmpValue + this.outTag +'</div>'+
							 '</td>';
				break;
				
			default: 
				if (this.caption != '') {
					this.html += '<td nowrap class="'+ this.td1Class +'" '+ td1_style + '>'+ this.caption + ssign +'</td>\n'+
								 '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>';
				} else {
					this.html += '<td style="width: 1px; padding: 0px; padding-top: 2px;" valign=top>'+ rsign +'</td>';
				}
				this.html += '<td colspan="'+ parseInt(spanAdd) +'" class="rText" style="padding-top: 4px">'+
							 '	<div class="rText" style="clear: both; padding: 1px; padding-top: 0px;" '+ this.inTag +'>'+ tmpValue + this.outTag +'</div>'+
							 '</td>';
		}
		return this.html;
	}
}

function jsGroup(name, header) {
    // public properties
    this.name  		= name;
    this.header 	= header;
    this.fields 	= [];
    this.owner 		= null;
	this.object     = null;
	this.height     = null;
	this.disabled   = false;

    // private properties
    this.inLabel    = '';

    // public methods
    this.build 		= jsGroup_build;
    this.addField   = jsGroup_addField;
    this.addBreak   = jsGroup_addBreak;
	this.initGroup  = jsGroup_initGroup;
	
	// ==============-------------------------------
	// -------------- IMPLEMENTATION	

	function jsGroup_build(el) {
		if (this.height != null) addH = 'height: '+ parseInt(this.height) +'px; overflow: auto;'; else addH = '';
					 
		this.html = '<div id="group_'+ this.name +'_break" style="height: 5px; font-size: 1px;"></div>' +
					'<div class="group" id="group_'+ this.name +'">'+
					'<div class="groupTitle" id="group_title_'+ this.name + '" style="z-Index: 1;">'+ this.header + '</div>'+
					'<div style="clear: both; '+ addH +'" id="group_content_'+ this.name +'">';				

		// render column
		this.html += '<table style="padding-left: 6px; padding-right: 6px; clear: both" cellpadding="2" cellspacing="0" width="100%">';
		this.html += '<tr>';
		var spanFlag = true;
		for (i=0; i<this.fields.length; i++) {
			if (this.fields[i].column == 0 && spanFlag) spanAdd = 4; else spanAdd = 0;
			this.html += this.fields[i].build(this.inLabel, spanAdd);
			if (this.fields[i].column == 0) { this.html += '</tr><tr>'; spanFlag = true; } else { spanFlag = false; }
		}
		this.html += '</tr>';
		this.html += '</table>';

		this.html += '</div>'+
					 '</div>';
		return this.html;
	}

	function jsGroup_initGroup(obj) {
		this.object = obj;
		var div = this.owner.box.ownerDocument.getElementById("group_"+ this.name +"_object");
		this.object.box = div;
		this.object.recid = this.owner.recid;
		this.object.output();
	}

	function jsGroup_addField(caption, type, fieldName, inTag, outTag, defValue, required, column, items) {
		ind = this.fields.length;
		this.fields[ind] = new top.jsField(caption, type, fieldName, inTag, outTag, defValue, required, column);
		if (items) this.fields[ind].items = items;
		if (type.toUpperCase() != 'BREAK') {
			this.fields[ind].index  = this.owner.fieldIndex;
			this.fields[ind].prefix = this.owner.name;
			this.fields[ind].owner  = this;
			this.owner.fieldIndex++;
		}
		return this.fields[ind];
	}

	function jsGroup_addBreak(height, column) {
		ind = this.fields.length;
		this.fields[ind] = new top.jsField('', 'break', '', '', '<div style="height: '+ height +'"></div>', '', false, column);
		this.fields[ind].index = ind;
		return this.fields[ind];
	}

}
if (top != window) top.jsField = jsField;
if (top != window) top.jsGroup = jsGroup;

/************************************************************
*  --- COLOR FUNCTIONS
*************************************************************/

var mtype  = null;
var mobj   = null;
var mfld   = null;
var Hcolor = 0;
var Scolor = 0;
var Vcolor = 0;

function initColors(obj, fld) { 
	var html  = '';
	for (i=0; i<=170; i++) {
		var c = Math.floor(i * 255 / 170);
		var color = top.color_HSV2RGB(c, 255, 255);
		html += '<div id="'+c+'" style="height: 1px; overflow: hidden; font-size: 1px; background-color: rgb('+color+');"></div>';
	}
	obj.box.ownerDocument.getElementById(fld+'_csmall').innerHTML = html;
	mobj = obj;
	mfld = fld;
	// -- set initial color
	Hcolor = 0;
	Scolor = 0;
	Vcolor = 0;
	mobj.box.ownerDocument.getElementById(mfld + '_clarge').style.backgroundColor = 'rgb('+ top.color_HSV2RGB(Hcolor, 250, 255) +')'; 
	top.color_update();
	/*
	var color = obj.box.ownerDocument.getElementById(fld).value;
	color = top.color_RGB2HSV(parseInt(color.substr(0, 2), 16), parseInt(color.substr(2, 2), 16), parseInt(color.substr(4, 2), 16));
	Hcolor = color[0];
	Scolor = color[1];
	Vcolor = color[2];
	mobj.box.ownerDocument.getElementById(mfld + '_clarge').style.backgroundColor = 'rgb('+ top.color_HSV2RGB(Hcolor, 250, 255) +')'; 
	top.color_update();
	*/
}

function color_mdown(type, evnt) {
	mtype = type;
	top.color_mmove(type, evnt);
}

function color_mmove(type, evnt) {
	var x, y, tg;
	if (document.all) { x = evnt.x; y = evnt.y; tg = evnt.srcElement; } else { x = evnt.layerX; y = evnt.layerY; tg = evnt.target; }
	if (mtype == 'small') { 
		if (document.all) {
			Hcolor = parseInt(tg.id);
		} else{
			Hcolor = parseInt(tg.id) + Math.floor((parseInt(y)) * 255 / 170);
		}
		mobj.box.ownerDocument.getElementById(mfld + '_clarge').style.backgroundColor = 'rgb('+ top.color_HSV2RGB(Hcolor, 250, 255) +')'; 
		top.color_update();
	}
	if (mtype == 'large') {
		Scolor = (Math.floor((parseInt(x)) * 255 / 170));
		Vcolor = 255-(Math.floor((parseInt(y)) * 255 / 170));
		top.color_update();
	}
}

function color_mup(type, evnt) {
	mtype = null;
}

function color_update() {
	var color = top.color_HSV2RGB(Hcolor, Scolor, Vcolor);
	mobj.box.ownerDocument.getElementById(mfld + '_pcolor').style.backgroundColor = 'rgb('+color+')';
	//mobj.box.ownerDocument.getElementById(mfld + '_pcolor2').innerHTML= 'rgb('+color+')';
}

/**
 * Converts an HSV color value to RGB. All variables 
 * are normalized to the scale 0..255
 */
 
function color_RGB2HSV(r, g, b){
    var min = Math.min(r, g, b); 
	var max = Math.max(r, g, b);
	var delta = max - min;
	var	h, s, v = max;
	
    v = Math.floor(max / 255 * 100);
    if (max != 0) s = Math.floor(delta / max * 100);  else return [0, 0, 0];
	
    if (r == max) h = ( g - b ) / delta; else if (g == max) h = 2 + ( b - r ) / delta; else h = 4 + ( r - g ) / delta;
    h = Math.floor(h * 60);  
    if (h < 0) h += 360;
    return [h, s, v];
}

function color_HSV2RGB(h, s, v){
    var r, g, b;
	h /= 255; s /= 255; v /= 255;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

function color_RGB2HEX(str) {
   str = str.replace(/rgb\(|\)/g, "").split(",");
   str[0] = parseInt(str[0], 10).toString(16).toLowerCase();
   str[1] = parseInt(str[1], 10).toString(16).toLowerCase();
   str[2] = parseInt(str[2], 10).toString(16).toLowerCase();
   str[0] = (str[0].length == 1) ? '0' + str[0] : str[0];
   str[1] = (str[1].length == 1) ? '0' + str[1] : str[1];
   str[2] = (str[2].length == 1) ? '0' + str[2] : str[2];
   return (str.join(""));
}

top.initColors    = initColors;
top.color_mup     = color_mup;
top.color_mdown   = color_mdown;
top.color_mmove   = color_mmove;
top.color_update  = color_update;
top.color_RGB2HSV = color_RGB2HSV;
top.color_HSV2RGB = color_HSV2RGB;
top.color_RGB2HEX = color_RGB2HEX;