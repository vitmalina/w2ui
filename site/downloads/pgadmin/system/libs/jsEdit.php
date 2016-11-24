<? require("phpCache.php"); ?>
/***********************************
/***********************************
*
* -- This the jsEdit class
*
***********************************/

function jsEdit(name, box, recid) {
	// public properties
    this.name  	  		= name;
    this.box      		= box; // HTML element that hold this element
    this.tmpl			= '';
    this.items    		= []; // items received from getData
    this.controls   	= [];
    this.groups    		= [];
	this.tabs			= null;
	this.tabsToolbar	= null;
    this.srvFile  		= '';
    this.srvParams  	= [];
    this.header   		= 'Edit Page';
    this.showHeader 	= true;
	this.showFooter 	= true;
    this.recid      	= recid;
    this.msgEmpty   	= 'Some of the required fields are empty:';
    this.msgWrong   	= 'The type of the following fields is wrong:';
	this.getOneList 	= false; // indicates weather need to refresh one field only
	this.disableOnSave  = true; // weather to disable control buttons on save

	this.onOutput;
	this.onRefresh;
	this.onComplete;
    this.onSave;
    this.onSaveDone;
    this.onData;
    this.onDataRecieved;
	this.onResize;
	this.onScroll;

    // public methods
    this.addControl  	= jsEdit_addControl;
	this.addGroup 	 	= jsEdit_addGroup;
	this.addTab 	 	= jsEdit_addTab;
    this.getData     	= jsEdit_getData;
    this.dataReceived 	= jsEdit_dataReceived;
    this.findField   	= jsEdit_findField;
    this.saveData	 	= jsEdit_saveData;
    this.saveDone	 	= jsEdit_saveDone;
    this.output      	= jsEdit_output;
    this.refresh     	= jsEdit_refresh;
    this.resetFields 	= jsEdit_resetFields;
	this.refreshList	= jsEdit_refreshList;
	this.refreshChecks  = jsEdit_refreshChecks;
    this.serverCall  	= jsEdit_serverCall;
    this.showStatus 	= jsEdit_showStatus;
    this.hideStatus  	= jsEdit_hideStatus;
	this.changeTab		= jsEdit_changeTab;

    // internal
    this.fieldIndex  	= 0;
    this.fieldList   	= 0;
    this.validate	 	= jsEdit_validate;
    this.getControls 	= jsEdit_getControls;
    this.getList     	= jsEdit_getList;
    this.getListDone 	= jsEdit_getListDone;
	this.resize	 	 	= jsEdit_resize;
	this.scroll	 	 	= jsEdit_scroll;
	this.lookup_items 	= [];
	this.lookup_keyup  	= jsEdit_lookup_keyup;
	this.lookup_blur 	= jsEdit_lookup_blur;
	this.lookup_show 	= jsEdit_lookup_show

    if (!top.jsUtils) alert('The jsUtils class is not loaded. This class is a must for the jsEdit class.');
    if (!top.jsGroup) alert('The jsGroup class is not loaded. This class is a must for the jsEdit class.');
    if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;

	// ==============-------------------------------
	// -------------- IMPLEMENTATION
	
	function jsEdit_addControl(type, caption, param, inLabel) {
		ind = this.controls.length;
		switch (type) {
			case 'save':
				html = '<input id="'+ this.name +'_control'+ ind + '" class="rButton" type="button" onclick="var el = top.elements[\''+ this.name + '\']; el.stayHere = false; el.saveData();" value="'+ caption + '" '+ inLabel +'>';
				break;
			case 'update': // -- save & edit
				html = '<input id="'+ this.name +'_control'+ ind + '" class="rButton" type="button" onclick="var el = top.elements[\''+ this.name + '\']; el.stayHere = true; el.saveData();" value="'+ caption + '" '+ inLabel +'>';
				break;
			case 'back':
				html = '<input id="'+ this.name +'_control'+ ind + '" type="button" class="rButton" onclick="obj = top.elements[\''+ this.name +'\'].onComplete; if (obj) { if (obj.output) obj.output(); else obj(); }" value="'+ caption + '" '+ inLabel +'>';
				break;
			case 'button':
				html = '<input id="'+ this.name +'_control'+ ind + '" class="rButton" type="button" onclick="'+ param + '" value="'+ caption + '" '+ inLabel +'>';
				break;
			default:
				html = caption;
				break;
		}
		this.controls[this.controls.length] = html;
	}

	function jsEdit_addGroup(name, caption, tabName) {
		var ind = this.groups.length;
		this.groups[ind] = new top.jsGroup(name, caption);
		this.groups[ind].owner   = this;
		this.groups[ind].tabName = tabName;
		return this.groups[ind];
	}

	function jsEdit_addTab(name, caption) {
		// make sure libs are loaded
		if (String(top.jsTabs) == 'undefined') { alert('The jsTabs class is not loaded. This class is necessary if you want to use tabs.'); return; }
		if (String(top.jsToolBar) == 'undefined') { alert('The jsToolBar class is not loaded. This class is necessary if you want to use tabs.'); return; }
		// init objects if needed
		if (this.tabs == null) {
			this.tabs = new top.jsTabs(this.name + '_tabs', null);
			this.tabs.owner   = this;
			this.tabs.onClick = this.changeTab;
		}
		if (this.tabsToolBar == null) {	
			this.tabsToolBar = new top.jsToolBar(this.name + '_tabsToolbar', null);
		}	
		var tab = this.tabs.addTab(name, caption, this.tabsToolBar, null);
		return tab;
	}

	function jsEdit_changeTab(tab) {
		// -- here 'this' is jsTabs object
		var id = this.tabs[tab].id;
		for (var i=0; i<this.owner.groups.length; i++) {
			var el1 = this.owner.box.ownerDocument.getElementById('group_'+this.owner.groups[i].name);
			var el2 = this.owner.box.ownerDocument.getElementById('group_'+this.owner.groups[i].name+'_break');
			var el3 = this.owner.box.ownerDocument.getElementById('group_'+this.owner.groups[i].name+'_object');
			if (this.owner.groups[i].tabName == id) { 
				if (el1) el1.style.display = '';
				if (el2) el2.style.display = '';
				if (el3) { 
					// hide controls
					this.owner.box.ownerDocument.getElementById('footer_'+this.owner.name).style.display = 'none';
					this.owner.resize();
					el3.style.display = ''; 				
					el3.style.height  = this.owner.box.ownerDocument.getElementById('body_'+this.owner.name).clientHeight;
					this.owner.groups[i].object.box = el3;
					this.owner.groups[i].object.recid = this.owner.recid;				
					this.owner.groups[i].object.refresh(); 
				}
			} else {
				if (el1) el1.style.display = 'none';
				if (el2) el2.style.display = 'none';
				if (el3) el3.style.display = 'none';
				// show controls
				if (this.owner.showFooter) {
					this.owner.box.ownerDocument.getElementById('footer_'+this.owner.name).style.display = '';
					this.owner.resize();
				}
			}
		}
	}

	function jsEdit_output() {
		if (this.onOutput) { this.onOutput(); }
		// fill drop lists if any
		var flag = false;
		for (var i=0; i<this.groups.length; i++) {
			var grp = this.groups[i];
			for (j=0; j<grp.fields.length; j++) {
				var fld = grp.fields[j];
				if (String(fld.type).toUpperCase() == 'LIST' && !fld.items) {
					this.getList(fld);
					flag = true;
				}
				if (String(fld.type).toUpperCase() == 'RADIO' && !fld.items) {
					this.getList(fld);
					flag = true;
				}
				if (String(fld.type).toUpperCase() == 'CHECK' && !fld.items) {
					this.getList(fld);
					flag = true;
				}
			}
		}
		if (flag == true) return;
		// finalize
		this.refresh();
		this.getData();
	}

	function jsEdit_refresh() {
		var html =  '<div id="edit_'+ this.name +'" class="edit_div">';
		// first generate header
		if (this.showHeader) {
			html += '<div id="header_'+ this.name +'">\n'+
					'   <table style="width: 100%; height: 28px;" class="editHeader_tbl"><tr>\n'+
					'       <td id="title_td1_'+ this.name + '" style="width: 95%; padding-left: 5px;">'+
					'			<span id="title_'+ this.name + '">'+ this.header +'&nbsp;</span>'+
					'			<span style="font-variant: normal; font-size: 10px; font-family: verdana; padding: 1px; display: none; background-color: red; color: white;" id="status_'+ this.name + '"></span>'+
					'       </td>\n'+
					'       <td id="title_td2_'+ this.name + '" align="right" style="width: 5%" nowrap="nowrap"></td>\n'+
					'   </tr></table>\n'+
					'</div>\n';
		}
		if (this.tabs != null) { html += '<div style="margin-top: 3px;" class="editTabs" id="tabs_'+ this.name +'"></div>\n'; }
		// then groups and controls
		html += '<div id="body_'+ this.name +'" onscroll="top.elements[\''+ this.name +'\'].scroll();">';
		var frm   = '<form style="margin: 0px; font-size: 1px;" id="form_'+ this.name +'" name="form_'+ this.name +'" target="frame_'+ this.name +'" enctype="multipart/form-data" method="POST">';
		if (this.tmpl.indexOf('~form~') >= 0) {
			html += this.tmpl.replace('~form~', frm);
		} else {
			html += frm;
			html += this.tmpl;
		}	
		
		for (var ii=0; ii<this.groups.length; ii++) {
			var gr = this.groups[ii];
			if (gr.disabled == true) {
				html = html.replace('~'+gr.name+'~', '');
				continue;
			}
			if (gr.object != null) {
				if (gr.height != null) addH = 'style="border: 0px; margin: 0px; padding: 0px; height: '+ parseInt(gr.height)+ 'px;"'; 
								  else addH = 'style="border: 0px; margin: 0px; padding: 0px;"';
				html = html.replace('~'+gr.name+'~', "<div class=\"group\" id=\"group_"+ gr.name +"_object\" "+ addH +"></div>");
			} else {
				html = html.replace('~'+gr.name+'~', gr.build());
			}
		}
		if (this.tmpl.indexOf('~/form~') >= 0) {
			html = html.replace('~/form~', '</form>');
		} else {
			html += '</form>';
		}	
		html += '<iframe id="frame_'+ this.name +'" name="frame_'+ this.name +'" frameborder="0" style="position: absolute; left: -1000px; width: 1px; height: 1px;"></iframe>';
		html += '</div>';

		if (html.indexOf('~controls~') > 0) {
			html = html.replace('~controls~', this.getControls());
		}
		if (this.showFooter) {
			html += '<div id="footer_'+ this.name +'">\n'+
					'   <table style="width: 100%;" class="editFooter_tbl"><tr>\n'+
					'       <td align="center">'+ this.getControls() +'</td>\n'+
					'   </tr></table>\n'+
					'</div>\n';
		}
		html += '</div>';

		if (this.box) this.box.innerHTML = html; 

		// output group objects if any
		for (var ii=0; ii<this.groups.length; ii++) {
			var gr = this.groups[ii];
			if (this.box && gr.object != null) {
				var div = this.box.ownerDocument.getElementById("group_"+ gr.name +"_object");
				gr.object.box = div;
				gr.object.recid = gr.owner.recid;
				gr.object.output();
			}
		}	
		// output tabs if any
		if (this.tabs != null) {
			this.tabs.box = this.box.ownerDocument.getElementById('tabs_'+ this.name);
			this.tabs.tabsOnly = true;
			this.tabs.output();
			// init first tab
			var id = this.tabs.tabs[0].id;
			for (var i=0; i<this.groups.length; i++) {
				var el1 = this.box.ownerDocument.getElementById('group_'+this.groups[i].name);
				var el2 = this.box.ownerDocument.getElementById('group_'+this.groups[i].name+'_break');
				var el3 = this.box.ownerDocument.getElementById('group_'+this.groups[i].name+'_object');
				if (this.groups[i].tabName == id) { 
					if (el1) el1.style.display = '';
					if (el2) el2.style.display = '';
					if (el3) el3.style.display = '';
				} else {
					if (el1) el1.style.display = 'none';
					if (el2) el2.style.display = 'none';
					if (el3) el3.style.display = 'none';
				}
			}
			this.tabs.setActive(0);
		}
		this.resize();
		
		this.dataReceived(true);
		if (this.onRefresh) { this.onRefresh(); }
	}

	function jsEdit_resize() {
		if (!this.box) return;
		var width  = parseInt(this.box.style.width);
		var height = parseInt(this.box.style.height);
		if (height > 0) {
			var el  = this.box.ownerDocument.getElementById('body_'+ this.name);
			var elh = this.box.ownerDocument.getElementById('header_'+ this.name);
			var elf = this.box.ownerDocument.getElementById('footer_'+ this.name);
			var elt = this.box.ownerDocument.getElementById('tabs_'+ this.name);
			if (el) {
				var hheight = height 
					- (this.showHeader ? elh.clientHeight + 2 : 0)
					- (this.showFooter ? elf.clientHeight + 2: 0)
					- (this.tabs != null ? elt.clientHeight + 2 : 0)
					;
				el.style.overflow = 'auto';
				el.style.height   = hheight;
			}
		}
		// resize if there is tabs group object
		if (this.tabs != null) {
			for (var i=0; i<this.groups.length; i++) {
				var el = this.box.ownerDocument.getElementById('group_'+this.groups[i].name+'_object');
				if (el) { 
					el.style.height = this.box.ownerDocument.getElementById('body_'+this.name).clientHeight; 
					this.groups[i].object.refresh(); 
				}
			}
		}
		if (this.onResize) this.onResize(width, hheight);
	}

	function jsEdit_scroll() {
		if (this.onScroll) this.onScroll();
	}

	function jsEdit_lookup_show(name) {
		if (!this.box) return;
		var html;
		var div;
		var elid;
		div = this.box.ownerDocument.getElementById(name + '_div');
		html = '';
		var  k = 0;
		for (var item in this.lookup_items) {
			elid = name +'_item'+ k;
			if (this.currentField == k) { 
				addstyle = 'background-color: highlight; color: white;'; 
			} else { 
				addstyle = 'background-color: white; color: black;'; 
			}
			html += '<div id="'+ elid +'" style="padding: 2px; margin: 2px; cursor: default;'+ addstyle +'" '+
					'	onclick="this.style.backgroundColor = \'highlight\'; '+
					'			 this.style.color = \'white\'; '+
					'			 document.getElementById(\''+ name +'\').value = \''+ item +'\'; '+
					'			 document.getElementById(\''+ name +'_search\').value = \''+ this.lookup_items[item] +'\'; '+
					'			 document.getElementById(\''+ name +'_div\').style.display = \'none\'; '+
					'			 top.jsUtils.clearShadow(document.getElementById(\''+ name +'_div\')); '+
					'			 var el = document.getElementById(\''+ name +'\'); '+
					'	 		 if (el.onchange) el.onchange(el.value);\"'+
					'>'+
						this.lookup_items[item] +
					'</div>';
			k++;
		}
		if (div && div.innerHTML != html) {
			div.innerHTML = html;
			div.style.display = '';
			if (div.shadow) top.jsUtils.clearShadow(div);
			div.shadow = top.jsUtils.dropShadow(div);
		}
		if (html == '') {
			top.jsUtils.clearShadow(div);
			div.style.display = 'none';
		}
	}

	function jsEdit_lookup_keyup(el, name, evnt) {
		if (!this.box) return;
		// events
		if (evnt.keyCode == 9 || evnt.keyCode == 37 || evnt.keyCode == 39 ||
			evnt.keyCode == 16||evnt.keyCode == 17|| evnt.keyCode == 18 || evnt.keyCode == 20) return; 
		if (evnt.keyCode == 38) { // up
			this.currentField -= 1;
			if (this.currentField <= 0) this.currentField = 0;
			this.lookup_show(name);
			evnt.cancelBubble = true;
			evnt.stopPropagation();
			return false;
		}
		if (evnt.keyCode == 40) { // down
			this.currentField += 1;
			var cnt = 0;
			for (item in this.lookup_items) cnt++;
			if (this.currentField >= cnt) { this.currentField -= 1; }
			this.lookup_show(name);
			evnt.cancelBubble = true;
			evnt.stopPropagation();
			return false;
		}
		if (evnt.keyCode == 13) { // enter
			// see if there is exact match
			var contFlag = true;
			fld = String(this.box.ownerDocument.getElementById(name +'_search').value);
			k = 0;
			for (var item in this.lookup_items) {
				if (String(this.lookup_items[item]).toLowerCase() == fld.toLowerCase()) {
					this.box.ownerDocument.getElementById(name +'_search').value = this.lookup_items[item];
					this.box.ownerDocument.getElementById(name).value 			 = item;
					this.box.ownerDocument.getElementById(name +'_div').style.display = 'none';
					top.jsUtils.clearShadow(this.box.ownerDocument.getElementById(name +'_div'));
					contFlag = false;
					break;
				}
				k++;
			}
			if (contFlag) {
				k = 0;
				for (var item in this.lookup_items) {
					if (k == this.currentField) {
						this.box.ownerDocument.getElementById(name +'_search').value = this.lookup_items[item];
						this.box.ownerDocument.getElementById(name).value 			 = item;
						this.box.ownerDocument.getElementById(name +'_div').style.display = 'none';
						top.jsUtils.clearShadow(this.box.ownerDocument.getElementById(name +'_div'));
						break;
					}
					k++;
				}
			}
			var el = this.box.ownerDocument.getElementById(name);
			if (el.onchange) el.onchange(el.value);
			
			evnt.cancelBubble = true;
			if (!document.all) evnt.stopPropagation();
			return false;
		}
		el.style.color = 'black';
		this.box.ownerDocument.getElementById(name).value = '';
		if (el.value != '') {
			if (this.timer > 0) clearTimeout(this.timer);
			this.timer = setTimeout("top.elements['"+ this.name + "'].currentField  = -1; "+
									"top.elements['"+ this.name + "'].lookup_items  = []; "+
									"top.elements['"+ this.name + "'].serverCall('edit_lookup', 'lookup_name::"+ name +";;lookup_search::"+ el.value +"');", 300);
		} else {
			this.lookup_items = [];
			this.lookup_show(name);
		}
	}

	function jsEdit_lookup_blur(el, name, evnt) {
		setTimeout("if (top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"').value == '') {" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_search').value = 'start typing...';" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_search').style.color = '#666666';" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_div').style.display = 'none';"+
				   "	top.jsUtils.clearShadow(top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_div')); "+
				   "}", 400);
	}

	function jsEdit_getControls() {
		html = '';
		html = '<table cellspacing="0" cellpadding="0" class="rText"><tr>';
		for (i=0; i<this.controls.length; i++) {
			html += '<td nowrap="nowrap" style="padding-left: 2px; padding-right: 2px">'+ this.controls[i] + '</td>';
		}
		html += '<td>&nbsp;</td></tr></table>';
		return html;
	}

	function jsEdit_refreshList(name) {
		var fld = this.findField(name);
		this.getOneList = true;
		this.getList(fld);
	}

	function jsEdit_refreshChecks(checkName) {
		var i = 0;
		var newVal = ''; 
		while (true) { 
			var el = this.box.ownerDocument.getElementById(checkName +'_check'+ i);
			if (!el) break;		
			if (el.checked) {
				if (newVal != '') newVal += ','; 
				newVal += el.value;
			}
			i++;
		}
		this.box.ownerDocument.getElementById(checkName).value = newVal; 
	}

	function jsEdit_getList(fld) { 
		if (!this.box) return;
		if (!this.getOneList) this.fieldList++;
		req = this.box.ownerDocument.createElement('SCRIPT');
		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// add list params
		param['req_cmd']    	 = 'edit_field_list';
		param['req_name']   	 = this.name;
		param['req_recid']  	 = this.recid ? this.recid : 'null';
		param['req_index']  	 = fld.index;
		param['req_field']  	 = fld.fieldName;

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		req.src  = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param);
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsEdit_getListDone(nameOrIndex, param) {
		if (this.getOneList == true) {
			this.getOneList = false;
			var fld = this.findField(nameOrIndex);
			fld.param = param;
			// refresh that field only;
			var sel = this.box.ownerDocument.getElementById(fld.prefix + '_field' +  fld.index).parentNode;
			sel.innerHTML =  '<select id="'+ fld.prefix + '_field' +  fld.index +'" name="'+ fld.fieldName +'" '+
							 '		class="rText rInput" type="text" '+ fld.inTag +'>\n'+
								fld.param +
							 '</select>\n' + fld.outTag;
			var list = this.box.ownerDocument.getElementById(fld.prefix + '_field' +  fld.index);
			if (list) list.value = fld.value;
			return;		
		}
		this.fieldList--;
		fld = this.findField(nameOrIndex);
		fld.param = param;
		if (this.fieldList == 0) {
			this.refresh();
			this.getData();
		}
	}

	function jsEdit_findField(indOrName) {
		for (i=0; i<this.groups.length; i++) {
			grp = this.groups[i];
			for (j=0; j<grp.fields.length; j++) {
				fld = grp.fields[j];
				if (fld.fieldName == indOrName) return fld;
				if (fld.index == indOrName) return fld;
			}
		}
		return null;
	}

	function jsEdit_getData() {
		if (!this.box) return;
		if (this.fieldList != 0) return;
		this.resetFields();
		this.showStatus('Retrieving Data...');
		if (this.onData) {
			ret = this.onData();
			if (ret === false) return;
		}
		this.items = [];
		req = this.box.ownerDocument.createElement('SCRIPT');
		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// add list params
		param['req_cmd']     = 'edit_get_data';
		param['req_name']  	 = this.name;
		param['req_recid'] 	 = this.recid ? this.recid : 'null';

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		req.src    = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param);
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsEdit_resetFields() {
		if (!this.box) return;
		for (val in this.items) {
			var el = this.box.ownerDocument.getElementById(this.name+'_field'+val);
			if (el) {
				if (el.tagName == 'LABEL') el.innerHTML = '';
				el.value = '';
				// radio buttons
				var ir = 0;
				while (el = this.box.ownerDocument.getElementById(this.name+'_field'+val+'_radio'+ir)) {
					if (el.value == this.items[val]) el.checked = true;
					ir++;
				}
				// check buttons
				var ir = 0;
				while (ell = this.box.ownerDocument.getElementById(this.name+'_field'+val+'_check'+ir)) {
					var t = String(this.items[val]);
					if (t == ell.value || t.indexOf(','+ell.value+',') != -1 || t.substr(0, ell.value.length+1) == ell.value+','
						|| t.substr(t.length - ell.value.length-1) == ','+ell.value) ell.checked = true; else ell.checked = false;
					ir++;
				}
			}
		}

	}

	function jsEdit_dataReceived(initial) {
		if (!this.box) return;
		// the function needs to be called after the data retrieved.
		this.hideStatus();
		// it will go thru the items array and will set data to corresponding fields
		for (val in this.items) {
			var el = this.box.ownerDocument.getElementById(this.name+'_field'+val);
			if (el) {
				el.value = this.items[val];
				// label type
				if (el.tagName == 'LABEL') el.innerHTML = this.items[val];
				if (el.tagName == 'DIV')   el.innerHTML = this.items[val];
				// radio buttons
				ir = 0;
				while (el2 = this.box.ownerDocument.getElementById(this.name+'_field'+val+'_radio'+ir)) {
					if (el2.value == this.items[val]) el2.checked = true;
					ir++;
				}
				// check buttons
				var ir = 0;
				while (ell = this.box.ownerDocument.getElementById(this.name+'_field'+val+'_check'+ir)) {
					var t = String(this.items[val]);
					if (t == ell.value || t.indexOf(','+ell.value+',') != -1 || t.substr(0, ell.value.length+1) == ell.value+','
						|| t.substr(t.length - ell.value.length-1) == ','+ell.value) ell.checked = true; else ell.checked = false;
					ir++;
				}
				// lookup type
				el2 = this.box.ownerDocument.getElementById(this.name +'_field'+ val +'_search');
				if (el2) {
					var color = 'black';
					var tmp = String(this.items[val]).split('::');
					if (tmp[1] == undefined) {
						tmp[1] = 'start typing...';
						color  = '#666666';
					}
					el.value  = tmp[0];
					el2.value = tmp[1];
					el2.style.color = color;
				}
				// color type
				el2 = this.box.ownerDocument.getElementById(this.name +'_field'+ val +'_dspcolor');
				if (el2) {
					el2.style.backgroundColor = el.value;
				}
				
			}
		}
		// focust fist element
		var el = this.box.ownerDocument.getElementById(this.name +'_field0_search');
		if (!el) el = this.box.ownerDocument.getElementById(this.name+'_field0');
		try { if (el) { if (el.onclick) { el.onclick(); } el.focus(); } } catch(e) {}
		
		if (initial !== true && this.onDataReceived) { this.onDataReceived(); }
	}

	function jsEdit_saveData(debug) {
		if (!this.box) return;
		if (this.onSave) {
			ret = this.onSave();
			if (ret === false) return;
		}
		if (!this.validate()) return;
		if (this.disableOnSave) for (var i=0; i<10; i++) { el = this.box.ownerDocument.getElementById(this.name+'_control'+i); if (el) el.disabled = true; }

		frm = this.box.ownerDocument.getElementById('form_' + this.name);
		req = this.box.ownerDocument.getElementById('frame_' + this.name);
		req.style.width  = debug ? '100%' : 1;
		req.style.height = debug ? '400px' : 1;

		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// add list params
		param['req_cmd']  	 = 'edit_save_data';
		param['req_name']  	 = this.name;
		param['req_recid'] 	 = this.recid ? this.recid : 'null';
		param['req_frame']	 = req.id;

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		frm.action = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param);
		frm.submit();
	}

	function jsEdit_saveDone(recid) {
		this.recid = recid;
		if (!this.box) return;
		// enable buttons again
		for (var i=0; i<10; i++) { el = this.box.ownerDocument.getElementById(this.name+'_control'+i); if (el) el.disabled = false; }
		
		if (this.onSaveDone) {
			ret = this.onSaveDone(recid);
			if (ret === false) return;
		}
		// go to another page or output a message
		if (this.stayHere === true) {
			this.stayHere = false;
			this.output();
		} else {
			if (this.onComplete) if (this.onComplete.output) { this.onComplete.output(); } else { this.onComplete(); }
		}
	}

	function jsEdit_serverCall(cmd, params) {
		if (!this.box) return;
		// call sever script
		req = this.box.ownerDocument.createElement('SCRIPT');
		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// add list params
		param['req_cmd']   = cmd;
		param['req_name']  = this.name;
		param['req_recid'] = this.recid ? this.recid : 'null';
		// add passed params
		if (params != undefined && params != '') {
			var tmp = params.split(';;');
			for (var i=0; i<tmp.length; i++) {
				var t = tmp[i].split('::');
				param[t[0]] = t[1];
			}
		}

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		req.src    = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param) + '&' + Math.random();
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsEdit_validate() {
		if (!this.box) return;
		// make sure required fields are not empty
		reqFields = '';
		for (i=0; i<this.groups.length; i++) {
			grp = this.groups[i];
			for (j=0; j<grp.fields.length; j++) {
				fld = grp.fields[j];
				if (fld.required && this.box.ownerDocument.getElementById(this.name+'_field'+fld.index).value == '') {
					reqFields += ' - ' + fld.caption + ' \n';
				}
			}
		}
		if (reqFields != '') {
			reqFields = reqFields.substr(0, reqFields.length -2);
			alert(this.msgEmpty + '\n' + reqFields);
			return false;
		}
		// check ints and floats
		reqFields = '';
		for (i=0; i<this.groups.length; i++) {
			grp = this.groups[i];
			for (j=0; j<grp.fields.length; j++) {
				fld = grp.fields[j];
				if (String(fld.type).toUpperCase() == 'INT' && !top.jsUtils.isInt(this.box.ownerDocument.getElementById(this.name+'_field'+fld.index).value)) {
					reqFields += ' - ' + fld.caption + ' - should be integer \n';
				}
				if (String(fld.type).toUpperCase() == 'FLOAT' && !top.jsUtils.isFloat(this.box.ownerDocument.getElementById(this.name+'_field'+fld.index).value)) {
					reqFields += ' - ' + fld.caption + ' - should be float \n';
				}
			}
		}
		if (reqFields != '') {
			reqFields = reqFields.substr(0, reqFields.length -2);
			alert(this.msgWrong + '\n' + reqFields);
			return false;
		}
		return true;
	}

	function jsEdit_showStatus(msg) {
		if (!this.box) return;
		el = this.box.ownerDocument.getElementById('status_'+this.name);
		if (el) {
			el.innerHTML = msg;
			el.style.display = '';
		}
	}

	function jsEdit_hideStatus(msg) {
		if (!this.box) return;
		el = this.box.ownerDocument.getElementById('status_'+this.name);
		if (el) {
			el.style.display = 'none';
			el.innerHTML = '';
		}
	}	
}
if (top != window) top.jsEdit = jsEdit;