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
	this.groups			= [];
    this.controls   	= [];
	this.tabs			= [];
    this.srvFile  		= '';
    this.srvParams  	= [];
    this.header   		= 'Edit Page';
	this.headerRight	= '';
    this.showHeader 	= true;
	this.showFooter 	= true;
	this.fixedSize		= true;
    this.recid      	= recid;
    this.msgEmpty   	= 'Some of the required fields are empty:';
    this.msgWrong   	= 'The type of the following fields is wrong:';
	this.disableOnSave  = true; // weather to disable control buttons on save

	this.onOutput;
	this.onRefresh;
	this.onComplete;
    this.onSave;
    this.onSaveDone;
    this.onData;
    this.onDataReceived;
	this.onServer;

    // public methods
    this.addControl  	= jsEdit_addControl;
	this.addGroup 	 	= jsEdit_addGroup;
	this.addTab 	 	= jsEdit_addTab;
	this.showTab		= jsEdit_showTab;
    this.getData     	= jsEdit_getData;
    this.dataReceived 	= jsEdit_dataReceived;
    this.findField   	= jsEdit_findField;
    this.saveData	 	= jsEdit_saveData;
    this.saveDone	 	= jsEdit_saveDone;
	this.complete		= jsEdit_complete;
    this.output      	= jsEdit_output;
    this.refresh     	= jsEdit_refresh;
    this.resetFields 	= jsEdit_resetFields;
	this.refreshList	= jsEdit_refreshList;
	this.refreshChecks  = jsEdit_refreshChecks;
    this.serverCall  	= jsEdit_serverCall;
    this.showStatus 	= jsEdit_showStatus;
    this.hideStatus  	= jsEdit_hideStatus;

    // internal
    this.fieldIndex  	= 0;
    this.fieldList   	= 0;
	this.getOneList 	= false; // indicates weather need to refresh one field only
    this.validate	 	= jsEdit_validate;
    this.getControls 	= jsEdit_getControls;
    this.getList     	= jsEdit_getList;
    this.getListDone 	= jsEdit_getListDone;
	this.resize	 	 	= jsEdit_resize;
    this.groupObjs    	= [];
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
	
	function jsEdit_addControl(type, caption, param, inTag) {
		var ind = this.controls.length;
		// initialize object if necessary
		if (caption != null && typeof(caption) == 'object' && String(caption) == '[object Object]') { // javascript object
			this.controls[ind] = { type: type, caption: caption.caption, param: caption.param, inTag: (caption.inTag ? caption.inTag : null) };
		} else {
			this.controls[ind] = { type: type, caption: caption, param: param, inTag: inTag };		
		}
	}

	function jsEdit_addGroup(name, caption, tabName) {
		var ind = this.groups.length;
		this.groups[ind] = { name: name, caption: caption, tabName: tabName, fields: [],
			addField: function (caption, type, fieldName, inTag, outTag, defValue, required, column, items) {
				var ind = this.fields.length;
				if (type != null && typeof(type) == 'object' && String(type) == '[object Object]') { // javascript object
					this.fields[ind] = { caption: caption, type: type.type, fieldName: type.fieldName, inTag: type.inTag, outTag: type.outTag, 
						defValue: type.defValue, required: type.required, column: type.column, items: type.items };
				} else {
					this.fields[ind] = { caption: caption, type: type, fieldName: fieldName, inTag: inTag, outTag: outTag, 
						defValue: defValue, required: required, column: column, items: items };
				}
			},
			addBreak: function (height, column) { this.fields[this.fields.length] = { type: 'break', height: height, column: column }}
		};
		if (caption != null && typeof(caption) == 'object' && String(caption) == '[object Object]') { // javascript object
			this.caption = null;
			for (var e in caption) { this.groups[ind][e] = caption[e]; }
		}
		return this.groups[ind];
	}

	function jsEdit_addTab(name, params) {
		var ind = this.tabs.length
		this.tabs[ind] = { 
			name: name, 
			caption: params.caption, 
			object: params.object,
			width: params.width, 
			active: (ind == 0 ? true : false) 
		};
	}

	function jsEdit_showTab(tab) {
		if (this.tabs.length <= 0) return;
		// -- remember right title
		this.headerRight = this.box.ownerDocument.getElementById('title_td2_'+ this.name).innerHTML;
		if (String(this.headerRight) == 'undefined') this.headerRight = '';
		// -- reset tabs
		for (var i=0; i<this.tabs.length; i++) this.tabs[i].active = false;
		this.tabs[tab].active = true;
		// -- refresh
		this.refresh();
	}

	function jsEdit_output() {
		if (this.box == null) return false;		
		// make first tab default
		if (this.tabs.length > 0) {
			for (var i=0; i<this.tabs.length; i++) this.tabs[i].active = false;
			this.tabs[0].active = true;
		}
		// init group objects		
		if (this.groupObjs.length <= 0) { // this method can be called many times by populating fields
			for (var i=0; i<this.groups.length; i++) {
				var grp = this.groups[i];
				var ind = this.groupObjs.length;
				top.elements[grp.name] = null;
				this.groupObjs[ind] = new top.jsGroup(grp.name, grp.caption);
				this.groupObjs[ind].owner   = this;
				this.groupObjs[ind].tabName = (String(grp.tab) != 'undefined' ? grp.tab : grp.tabName);
				this.groupObjs[ind].height  = grp.height;
				this.groupObjs[ind].inLabel = grp.inLabel;
				if (grp.inTag) this.groupObjs[ind].inLabel = grp.inTag;
				if (grp.object) this.groupObjs[ind].object = grp.object;
				if (grp.closeForm) this.groupObjs[ind].closeForm = grp.closeForm;
				// fields
				if (grp.fields) for (var j=0; j<grp.fields.length; j++) {
					var f = grp.fields[j];
					if (!f) continue;
					if (f.type == 'break') {
						if (String(f.height) == 'undefined') f.height = null;
						if (String(f.column) == 'undefined') f.column = false;
						this.groupObjs[ind].addBreak(f.height, f.column); 
					} else {
						if (String(f.fieldName) == 'undefined') f.fieldName = '';
						if (String(f.inTag) == 'undefined')  f.inTag = '';
						if (String(f.outTag) == 'undefined') f.outTag = '';
						if (String(f.defValue) == 'undefined') f.defValue = '';
						if (String(f.required) == 'undefined') f.required = false;
						if (String(f.column) == 'undefined') f.column = false;
						if (String(f.items) == 'undefined') f.items = null;
						this.groupObjs[ind].addField(f.caption, f.type, f.fieldName, f.inTag, f.outTag, f.defValue, f.required, f.column, f.items); 
					}
				}
			}
		}
		// fill drop lists if any (one at a time)
		var flag = false;
		for (var i=0; i<this.groupObjs.length; i++) {
			var grp = this.groupObjs[i];
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
		// onoutput event
		if (this.onOutput) { this.onOutput(); }		
	}

	function jsEdit_refresh() {
		if (this.box == null) return false;		
		// init tabs if any
		if (this.tabs.length > 0) {
			var tab = 0;
			for (var i=0; i<this.tabs.length; i++) if (this.tabs[i].active == true) { tab = i; break; } 
			this.tabs[tab].active = true;
		}
		// generate entire html
		var html 	  = '<div id="edit_'+ this.name +'" class="w20-edit">';
		var tabs_html = '';
		// first generate header
		if (this.showHeader) {
			if (this.tabs.length > 0) {
				tabs_html = '<td style="width: 1px" nowrap>&nbsp;</td>\n';
				for (var i=0; i<this.tabs.length; i++) {
					if (this.tabs[i].width == null) this.tabs[i].width = 100;
					tabs_html += '<td style="width: '+ (parseInt(this.tabs[i].width)+3) +'px; padding: 0px; margin: 0px; font-weight: normal;">'+
						'	<div style="position: relative; top: -'+ (top.jsUtils.engine == 'WebKit' ? '10' : '11') +'px; padding: 0px; margin: 0px;">'+
						'		<div id="'+ this.name + '_tab'+ i +'" class="tab '+ (this.tabs[i].active ? 'tab_selected' : '') +'" style="position: absolute; margin: 0px; height: 25px; '+
						'			width: '+ parseInt(this.tabs[i].width) +'px; cursor: default;" '+
						'			onclick="top.elements[\''+ this.name +'\'].showTab('+ i +');">'+ 
						this.tabs[i].caption+ '</div>'+
						'	</div>'+
						'</td>';
				}
			}
			html += '<div id="header_'+ this.name +'" class="edit_header">\n'+
					'   <table style="width: 100%; height: 28px;"><tr>\n'+
					'       <td id="title_td1_'+ this.name + '" style="width: 5%; padding-left: 5px;" nowrap>'+
					'			<span ondblclick="top.elements.'+ this.name +'.getData(); top.elements.'+ this.name +'.resize();" id="title_'+ this.name +'">'+ this.header +'&nbsp;</span>'+
					'       </td>\n'+ tabs_html +
					'       <td style="width: 1px" nowrap>&nbsp;</td>\n'+
					'       <td><span class="edit_status" style="display: none" id="status_'+ this.name + '"></span></td>\n'+
					'       <td id="title_td2_'+ this.name + '" align="right" style="width: 5%" nowrap="nowrap">'+ this.headerRight +'</td>\n'+
					'   </tr></table>\n'+
					'</div>\n'+
					'<div style="position: relative;"><div style="margin-top: -1px; position: absolute; overflow: hidden;">\n'+
					'	<div id="header_'+ this.name +'_drop" style="display: none; position: absolute; z-index: 100;"></div>\n'+
					'</div></div>\n';
		}
		// then groups and controls
		html += '<div id="body_'+ this.name +'">';
		var frm   = '<form style="margin: 0px; font-size: 1px;" id="form_'+ this.name +'" name="form_'+ this.name +'" target="frame_'+ this.name +'" enctype="multipart/form-data" method="POST">';
		if (this.tmpl.indexOf('~form~') >= 0) {
			html += this.tmpl.replace('~form~', frm);
		} else {
			html += frm;
			html += this.tmpl;
		}	
		
		for (var ii=0; ii<this.groupObjs.length; ii++) {
			var gr = this.groupObjs[ii];
			// save field values if controls were created before
			for (var k=0; k<gr.fields.length; k++) {
				var fld1 = this.box.ownerDocument.getElementById(this.name +'_field'+ gr.fields[k].index);				
				var fld2 = this.box.ownerDocument.getElementById(this.name +'_field'+ gr.fields[k].index + '_2');
				var fld3 = this.box.ownerDocument.getElementById(this.name +'_field'+ gr.fields[k].index + '_search');
				if (!fld1) continue;
				var val = fld1.value + (fld2 ? '::'+ fld2.value : '') + (fld3 ? '::'+ fld3.value : '');
				this.items[gr.fields[k].index] = val;
				//gr.fields[k].value = val;
			}
			// if there is no fields in the group - save html
			if (gr.fields.length == 0) {
				var el = this.box.ownerDocument.getElementById(gr.owner.name +'_group_content_'+ gr.name);
				if (el) gr.groupHTML = el.innerHTML;
			}
			// output group
			if (gr.disabled == true) {
				html = html.replace('~'+gr.name+'~', '');
				continue;
			}
			if (gr.object != null && gr.object != '') {
				if (gr.height != null) addH = 'style="border: 0px; margin: 0px; padding: 0px; height: '+ parseInt(gr.height)+ 'px;"'; 
								  else addH = 'style="border: 0px; margin: 0px; padding: 0px;"';
				html = html.replace('~'+gr.name+'~', "<div class=\"group\" id=\""+ this.name +"_group_"+ gr.name +"_object\" "+ addH +"></div>");
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
			html += '<div id="footer_'+ this.name +'" class="edit_footer">\n'+
					'   <table style="width: 100%;"><tr>\n'+
					'       <td align="center">'+ this.getControls() +'</td>\n'+
					'   </tr></table>\n'+
					'</div>\n';
		}
		html += '</div>';

		// -- regenerate entire HTML for edit
		if (this.box) this.box.innerHTML = html; 
		// -- populate values into fields from this.items
		this.resetFields();		
		// output group objects if any
		for (var ii=0; ii<this.groupObjs.length; ii++) {
			var gr = this.groupObjs[ii];
			if (this.box && (gr.object != null && gr.object != '')) {
				var div = this.box.ownerDocument.getElementById(this.name+ "_group_"+ gr.name +"_object");
				// only refresh if in current tab
				if (String(tab) == 'undefined' || gr.tabName == this.tabs[tab].name) {
					if (gr.object != null && typeof(gr.object) == 'object') {
						gr.object.box 	= div;
						gr.object.recid = this.recid;
						gr.object.output();
					} else {
						top.elements[gr.object].box   = div;
						top.elements[gr.object].recid = this.recid;
						top.elements[gr.object].output();
					}
				}
			}
		}	
		// init HTML Area fields
		for (var ii=0; ii<this.groupObjs.length; ii++) {
			var gr = this.groupObjs[ii];
			for (var ij = 0; ij < gr.fields.length; ij++) {
				if (!gr.fields[ij]) continue;
				if (gr.fields[ij].type.toUpperCase() == 'HTMLAREA') {
					var div = this.box.ownerDocument.getElementById(this.name+'_field_box'+ij);
					var txt = this.box.ownerDocument.getElementById(this.name+'_field'+ij);
					//
					top.elements[this.name+'field'+ij+'_editor'] = null;
					var editor = new top.jsEditor(this.name+'field'+ij+'_editor', div);
					editor.output();
					editor.setHTML(txt.value);
				}
			}
		}	
		// if there are tabs show hide what needed to be
		if (this.tabs.length > 0) {
			// -- show/hide groups
			var tmp_name = this.tabs[tab].name;		
			for (var i=0; i<this.groups.length; i++) {
				var el1 = this.box.ownerDocument.getElementById(this.name+'_group_'+this.groups[i].name);
				var el2 = this.box.ownerDocument.getElementById(this.name+'_group_'+this.groups[i].name+'_break');
				var el3 = this.box.ownerDocument.getElementById(this.name+'_group_'+this.groups[i].name+'_object');
				var gr 	= this.groups[i];
				if (gr.tabName == tmp_name || gr.tab == tmp_name) { 
					if (el1) el1.style.display = '';
					if (el2) el2.style.display = '';
					if (el1) if (el1.parentNode.tagName == 'TD') el1.parentNode.style.display = '';
					if (el3) { 
						el3.style.display = ''; 				
						if (gr.object != null && typeof(gr.object) == 'object') {
							gr.object.box 	= el3;
							gr.object.recid = this.recid;
							gr.object.output();
						} else {
							top.elements[gr.object].box   = el3;
							top.elements[gr.object].recid = this.recid;
							top.elements[gr.object].output();
						}
					}
				} else {
					if (el1) el1.style.display = 'none';
					if (el2) el2.style.display = 'none';
					if (el3) el3.style.display = 'none';
					if (el1) if (el1.parentNode.tagName == 'TD') el1.parentNode.style.display = 'none';
				}
			}
			// if tab is an object
			if (this.tabs[tab].object != null && this.tabs[tab].object != '') {
				// hide controls
				if (this.showFooter) {
					this.box.ownerDocument.getElementById('footer_'+this.name).style.display = 'none';
					this.resize();
				}
				var gr = this.tabs[tab];
				var el = this.box.ownerDocument.getElementById('body_'+this.name);
				el.innerHTML = 'loading...';
				if (gr.object != null && typeof(gr.object) == 'object') {
					gr.object.box 	= el;
					gr.object.recid = this.recid;
					gr.object.output();
				} else {
					top.elements[gr.object].box   = el;
					top.elements[gr.object].recid = this.recid;
					top.elements[gr.object].output();
				}
				el.firstChild.style.border = 0;
			} else {
				// show controls
				if (this.showFooter) {
					this.box.ownerDocument.getElementById('footer_'+this.name).style.display = '';
					this.resize();
				}
			}
		}
		// -- finalize
		this.resize();
		// -- refresh event
		if (this.onRefresh) { this.onRefresh(); }
	}

	function jsEdit_resize() {
		if (!this.box) return;
		if (!this.fixedSize) return;
		
		var el  = this.box.ownerDocument.getElementById('body_'+ this.name);
		var elh = this.box.ownerDocument.getElementById('header_'+ this.name);
		var elf = this.box.ownerDocument.getElementById('footer_'+ this.name);
		
		// reset height (otherwise this.box.clientHeight is wrong)
		if (el) {
			el.style.overflow = 'auto';
			el.style.height   = el.parentNode.clientHeight + 'px';
		}		
		
		var width  = parseInt(this.box.clientWidth);
		var height = parseInt(this.box.clientHeight);
		
		if (height > 0 && el) {
			var hheight = height 
				- (this.showHeader ? parseInt(elh.clientHeight)+2 : 0)
				- (this.showFooter ? parseInt(elf.clientHeight)+2 : 0);
			el.style.height   = hheight + 'px';
		}
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
					'			 if (document.getElementById(\''+ name +'_search\')) '+
					'					document.getElementById(\''+ name +'_search\').value = \''+ String(this.lookup_items[item]).replace("'", "\\'") +'\'; '+
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
		var field  = this.box.ownerDocument.getElementById(name);
		var search = this.box.ownerDocument.getElementById(name +'_search');
		var div    = this.box.ownerDocument.getElementById(name +'_div');
		// events
		if (evnt.keyCode == 9 || evnt.keyCode == 37 || evnt.keyCode == 39 || evnt.keyCode == 16 
				|| evnt.keyCode == 17|| evnt.keyCode == 18 || evnt.keyCode == 20) {
			return; 
		}
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
			fld = String(search.value);
			k = 0;
			for (var item in this.lookup_items) {
				if (String(this.lookup_items[item]).toLowerCase() == fld.toLowerCase()) {
					search.value = this.lookup_items[item];
					field.value  = item;
					div.style.display = 'none';
					top.jsUtils.clearShadow(div);
					contFlag = false;
					break;
				}
				k++;
			}
			if (contFlag) {
				k = 0;
				for (var item in this.lookup_items) {
					if (k == this.currentField) {
						search.value = this.lookup_items[item];
						field.value	 = item;
						div.style.display = 'none';
						top.jsUtils.clearShadow(div);
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
		if (search) field.value = '';
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
		setTimeout("var el  = top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"');"+
				   "var eld = top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_div');"+
				   "var els = top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_search');"+
				   "if (el) if (el.value == '') { if (els) {"+
				   "	els.value = 'start typing...';" +
				   "	els.style.color = '#666666';" +
				   "}}"+
				   "if (eld) {"+
				   "	eld.style.display = 'none';"+
				   "	top.jsUtils.clearShadow(eld); "+
				   "}", 400);
	}

	function jsEdit_getControls() {
		var html = '<table cellspacing="0" cellpadding="0" class="rText"><tr>';
		for (var i=0; i<this.controls.length; i++) {
			var cnt = this.controls[i];
			var cnt_html = '';
			switch (cnt.type) {
				case 'save':
					cnt_html = '<input id="'+ this.name +'_control'+ i +'" class="rButton" type="button" '+
							   '	onclick="var el = top.elements[\''+ this.name + '\']; el.stayHere = false; el.saveData();" '+
							   '	value="'+ cnt.caption + '" '+ cnt.inTag +' '+ (cnt.disabled ? 'disabled' : '') +'>';
					break;
				case 'update': // -- save & edit
					cnt_html = '<input id="'+ this.name +'_control'+ i +'" class="rButton" type="button" '+
							   '	onclick="var el = top.elements[\''+ this.name + '\']; el.stayHere = true; el.saveData();" '+
							   '	value="'+ cnt.caption + '" '+ cnt.inTag +' '+ (cnt.disabled ? 'disabled' : '') +'>';
					break;
				case 'back':
					cnt_html = '<input id="'+ this.name +'_control'+ i +'" type="button" class="rButton" '+
							   '	onclick="top.elements[\''+ this.name +'\'].complete();" value="'+ cnt.caption + '" '+ 
							   cnt.inTag +' '+ (cnt.disabled ? 'disabled' : '') +'>';
					break;
				case 'button':
					cnt_html = '<input id="'+ this.name +'_control'+ i +'" class="rButton" type="button" '+
							   '	onclick="'+ cnt.param + '" value="'+ cnt.caption + '" '+ cnt.inTag +' '+ 
							   (cnt.disabled ? 'disabled' : '') +'>';
					break;
				default:
					cnt_html = cnt.caption;
					break;
			}
			html += '<td nowrap="nowrap" style="padding-left: 2px; padding-right: 2px">'+ cnt_html + '</td>';
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
		
		this.serverCall('edit_field_list', { req_index: fld.index, req_field: fld.fieldName } );
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
			// if list box
			if (list.options) for (var j=0; j<list.options.length; j++) {
				if (list.options[j].value == this.items[fld.index]) {
					fld.value = this.items[fld.index];
					list.selectedIndex = j;
				}
			}
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
		for (i=0; i<this.groupObjs.length; i++) {
			grp = this.groupObjs[i];
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
		this.showStatus('Refreshing...');
		if (this.onData) {
			ret = this.onData();
			if (ret === false) return;
		}
		this.items = [];
		this.resetFields();
		this.serverCall('edit_get_data');
	}

	function jsEdit_resetFields() {
		if (!this.box) return;
		for (var val=0; val<200; val++) {
			var el  = this.box.ownerDocument.getElementById(this.name+'_field'+val);
			var fld = this.findField(val);
			if (!el) continue;
			var data = String(this.items[val]) != 'undefined' ? this.items[val] : (String(fld.defValue) != 'undefined' ? fld.defValue : '');
			el.value = data;
			// -- convert html entities if needed
			var str_tmp = String(el.value);
			if (str_tmp.indexOf('&#') >= 0) {
				var tmp = document.createElement("textarea");
				tmp.innerHTML = str_tmp.replace(/</g,"&lt;").replace(/>/g,"&gt;");
				el.value = tmp.value;
			}
			// label type
			if (el.tagName == 'LABEL') el.innerHTML = data;
			if (el.tagName == 'DIV')   el.innerHTML = data;
			// radio buttons
			var ir = 0;
			while (el2 = this.box.ownerDocument.getElementById(this.name+'_field'+val+'_radio'+ir)) {
				if (el2.value == data) el2.checked = true;
				ir++;
			}
			// check buttons
			var ir = 0;
			while (ell = this.box.ownerDocument.getElementById(this.name+'_field'+val+'_check'+ir)) {
				var t = String(data);
				if (t == ell.value || t.indexOf(','+ell.value+',') != -1 || t.substr(0, ell.value.length+1) == ell.value+','
					|| t.substr(t.length - ell.value.length-1) == ','+ell.value) ell.checked = true; else ell.checked = false;
				ir++;
			}
			// lookup type
			el2 = this.box.ownerDocument.getElementById(this.name +'_field'+ val +'_search');
			if (el2) {
				var color = 'black';
				var tmp = String(data).split('::');
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
		// if there are groups with no fields - output html
		for (var ii=0; ii<this.groupObjs.length; ii++) {
			var gr = this.groupObjs[ii];
			if (gr.fields.length == 0) {
				var el = this.box.ownerDocument.getElementById(gr.owner.name +'_group_content_'+ gr.name);
				if (el && String(gr.groupHTML) != 'undefined') el.innerHTML = gr.groupHTML;
			}
		}
	}

	function jsEdit_dataReceived(initial) {
		if (!this.box) return;
		// the function needs to be called after the data retrieved.
		this.hideStatus();
		// it will go thru the items array and will set data to corresponding fields
		this.resetFields();
		// focus first element
		var doc = this.box.ownerDocument;
		try {
			var el = doc.getElementById(this.name +'_field0_search');
			if (!el) el = doc.getElementById(this.name+'_field0');
			if (el) { if (el.onclick) { el.onclick(); } el.focus(); } 
		} catch(e) {}
		
		// init HTML Area fields
		for (var ii=0; ii<this.groupObjs.length; ii++) {
			var gr = this.groupObjs[ii];
			for (var ij = 0; ij < gr.fields.length; ij++) {
				if (!gr.fields[ij]) continue;
				if (gr.fields[ij].type.toUpperCase() == 'HTMLAREA') {
					var div = this.box.ownerDocument.getElementById(this.name+'_field_box'+ij);
					var txt = this.box.ownerDocument.getElementById(this.name+'_field'+ij);
					//
					top.elements[this.name+'field'+ij+'_editor'] = null;
					var editor = new top.jsEditor(this.name+'field'+ij+'_editor', div);
					editor.output();
					editor.setHTML(txt.value);
				}
			}
		}	
		
		if (initial !== true && this.onDataReceived) { this.onDataReceived(); }
	}

	function jsEdit_saveData(debug) {
		if (!this.box) return;
		if (this.onSave) {
			var ret = this.onSave();
			if (ret === false) return;
		}
		if (!this.validate()) return;
		if (this.disableOnSave) for (var i=0; i<10; i++) { el = this.box.ownerDocument.getElementById(this.name+'_control'+i); if (el) el.disabled = true; }
		
		// save data from HTML Area fields
		for (var ii=0; ii<this.groupObjs.length; ii++) {
			var gr = this.groupObjs[ii];
			for (var ij = 0; ij < gr.fields.length; ij++) {
				if (!gr.fields[ij]) continue;
				if (gr.fields[ij].type.toUpperCase() == 'HTMLAREA') {
					var txt = this.box.ownerDocument.getElementById(this.name+'_field'+ij);					
					txt.value = top.elements[this.name+'field'+ij+'_editor'].getHTML();
				}
			}
		}	

		var frm = this.box.ownerDocument.getElementById('form_' + this.name);
		var req = this.box.ownerDocument.getElementById('frame_' + this.name);
		req.style.width  = debug ? '100%' : 1;
		req.style.height = debug ? '400px' : 1;

		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// add list params
		param['req_cmd']  	 = 'edit_save_data';
		param['req_name']  	 = this.name;
		param['req_recid'] 	 = (String(this.recid) != 'undefined' && String(this.recid) != '' ? this.recid : 'null');
		param['req_frame']	 = req.id;

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		frm.action = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param);
		frm.submit();
	}

	function jsEdit_saveDone(recid) {
		this.recid = recid;
		if (!this.box) return;
		// enable buttons again
		for (var i=0; i<10; i++) { 
			var el = this.box.ownerDocument.getElementById(this.name+'_control'+i); 
			if (el) el.disabled = false; 
		}
		
		if (this.onSaveDone) {
			var ret = this.onSaveDone(recid);
			if (ret === false) return;
		}
		// go to another page or output a message
		if (this.stayHere === true) {
			this.stayHere = false;
			this.output();
		} else {
			this.complete();			
		}
	}
	
	function jsEdit_complete() {
		var obj = this.onComplete;
		if (typeof(obj) == 'function') { 
			obj(); 
		} else if (typeof(obj) == 'object') { 
			if (this.lpanel) this.lpanel.object = obj;
			obj.output(); 
		} else { 
			if (top.elements[obj]) {			
				if (this.lpanel) this.lpanel.object = top.elements[obj];
				top.elements[obj].output(); 
			}
		}
	}

	function jsEdit_serverCall(cmd, params) {
		if (!this.box) return;
		// call sever script
		var req = this.box.ownerDocument.createElement('SCRIPT');
		var param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// add list params
		param['req_cmd']   = cmd;
		param['req_name']  = this.name;
		param['req_recid'] = (String(this.recid) != 'undefined' && String(this.recid) != '' ? this.recid : 'null');
		// add passed params
		if (typeof(params) == 'object') {
			for (var p in params) {	param[p] = params[p]; }
		} else {
			if (params != undefined && params != '') {
				var tmp = params.split(';;');
				for (var i=0; i<tmp.length; i++) {
					var t = tmp[i].split('::');
					param[t[0]] = t[1];
				}
			}
		}
		// call server to get data
		var srvFile = this.srvFile;
		if (this.onServer) srvFile = this.onServer;
		if (typeof(srvFile) == 'function') {
			srvFile(cmd, param);
		} else {
			if (srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
			req.src = srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param) + '&' + Math.random();
			this.box.ownerDocument.body.appendChild(req);
		}
	}

	function jsEdit_validate() {
		if (!this.box) return;
		// make sure required fields are not empty
		var reqFields = '';
		for (var i=0; i<this.groupObjs.length; i++) {
			var grp = this.groupObjs[i];
			for (var j=0; j<grp.fields.length; j++) {
				var fld = grp.fields[j];
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
		var wrongFields = '';
		for (var i=0; i<this.groupObjs.length; i++) {
			var grp = this.groupObjs[i];
			for (var j=0; j<grp.fields.length; j++) {
				var fld = grp.fields[j];
				if (String(fld.type).toUpperCase() == 'INT' && !top.jsUtils.isInt(this.box.ownerDocument.getElementById(this.name+'_field'+fld.index).value)) {
					wrongFields += ' - ' + fld.caption + ' - should be integer \n';
				}
				if (String(fld.type).toUpperCase() == 'FLOAT' && !top.jsUtils.isFloat(this.box.ownerDocument.getElementById(this.name+'_field'+fld.index).value)) {
					wrongFields += ' - ' + fld.caption + ' - should be float \n';
				}
			}
		}
		if (wrongFields != '') {
			wrongFields = wrongFields.substr(0, wrongFields.length -2);
			alert(this.msgWrong + '\n' + wrongFields);
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
	
	// initialize object if necessary
	if (box != null && typeof(box) == 'object' && String(box) == '[object Object]') { // javascript object
		this.box = null;
		for (var e in box) { this[e] = box[e]; }
	}	
}
if (top != window) top.jsEdit = jsEdit;