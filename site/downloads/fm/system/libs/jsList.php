<? require("phpCache.php"); ?>
/***********************************
*
* -- This the jsList class
*
***********************************/

function jsListItem(id, values) {
	this.id    		= id;
    this.values		= values;
    this.selected 	= false;
	this.select		= jsListItem_select;
	this.ind;
	this.owner;
	
	// ==============-------------------------------
	// -------------- IMPLEMENTATION

	function jsListItem_select(flag) {
		if (flag != undefined && flag != null) this.selected = !flag;
		// select new
		if (this.selected) {
			this.selected = false;
			el = this.owner.box.ownerDocument.getElementById(this.owner.name +'_line_'+ this.ind);
			if (el) {
				el.style.cssText = el.getAttribute('custom_style');
				el.className = (this.ind%2 == 0 ? 'lstBody_odd' : 'lstBody_even');
				el.setAttribute('selected', 'no');
			}
		} else {
			this.selected = true;
			el = this.owner.box.ownerDocument.getElementById(this.owner.name +'_line_'+ this.ind);
			if (el) {
				el.style.cssText = '';
				el.className = 'lstBody_selected';
				el.setAttribute('selected', 'yes');
			}
		}
	}
}

function jsList(name, box) {
	// public properties
    this.name  	  		= name;
    this.box      		= box; // HTML element that hold this element
    this.items    		= [];
	this.colors			= [];
	this.recid			= null; // might be used by edit class to set sublists ids
    this.searches   	= [];
	this.filters		= '';
    this.layout   		= 'table'; // can be 'table' or 'div'
    this.tmpl           = '';
    this.tmpl_start 	= '';
    this.tmpl_end		= '';
	this.tmpl_group		= '';
    this.tmpl_empty 	= '<div style="padding: 8px">~msg~</div>';
	this.style_list		= '';
	this.style_header	= '';
	this.style_body		= '';
	this.style_footer	= '';
    this.srvFile  		= '';
    this.srvParams      = [];
    this.header   		= 'List Title';
    this.controls 		= [];
    this.columns  		= [];
	this.toolbar		= null; // if not null, then it is toolbar object
    this.items_pp		= 50;
    this.page_num		= 0;
    this.page_count     = 0;
    this.showHeader 	= true;
    this.showFooter 	= true;
    this.showTabHeader 	= true;
    this.showTabNumber 	= true;
	this.showKey		= false;
    this.smallPageCount = false;
    this.smallPageNav   = false;
    this.fixed      	= true;
    this.tblPadding 	= 4;
	this.divStyle 		= 'height: 13px; margin: 2px;';
    this.editable       = [];
    this.sortBy			= [];
    this.count      	= 0;
    this.time           = [];
    this.msgDelete      = 'Are you sure you want to delete selected record(s)?';
    this.msgNodata      = 'There is no data.';

    // events
	this.onOutput;
	this.onRefresh;
	this.onAddOrEdit;
    this.onClick;
    this.onDblClick;
    this.onSort;
    this.onData;
    this.onDataReceived;
	this.onDelete;
	this.onDeleteDone;
	this.onEditableChange;

    // public methods
    this.addColumn   	= jsList_addColumn;
    this.addControl  	= jsList_addControl;
    this.addSearch   	= jsList_addSearch;
    this.addItem     	= jsList_addItem;
	this.applyFilter	= jsList_applyFilter;
    this.getData     	= jsList_getData;
	this.showPage		= jsList_showPage;
    this.dataReceived	= jsList_dataReceived;
    this.output      	= jsList_output;
    this.refresh     	= jsList_refresh;
	this.resize		 	= jsList_resize;
	this.selectAll		= jsList_selectAll;
	this.selectNone		= jsList_selectNone;
    this.getSelected 	= jsList_getSelected;
    this.getItem     	= jsList_getItem;
    this.serverCall  	= jsList_serverCall;
    this.saveData	 	= jsList_saveData;
    this.showStatus	 	= jsList_showStatus;
    this.hideStatus  	= jsList_hideStatus;
    this.openSearch  	= jsList_openSearch;
    this.clearSearch 	= jsList_clearSearch;
    this.submitSearch	= jsList_submitSearch;
    this.findSearch  	= jsList_findSearch;

    // internal
    this.tmpLastInd;
    this.fieldList	 	= 0;
    this.showSearch  	= false;
	this.searchData		= [];
    this.lstClick    	= jsList_lstClick;
    this.lstDblClick 	= jsList_lstDblClick;
    this.columnClick 	= jsList_columnClick;
    this.getHeaders  	= jsList_getHeaders;
    this.getControls 	= jsList_getControls;
    this.getFilters 	= jsList_getFilters;
    this.getRecords  	= jsList_getRecords;
    this.getFooter   	= jsList_getFooter;
    this.getSearches 	= jsList_getSearches;
    this.delRecords  	= jsList_delRecords;
    this.getList	 	= jsList_getList;
    this.getListDone 	= jsList_getListDone;
	
	this.lookup_items 	= [];
	this.lookup_keyup  	= jsList_lookup_keyup;
	this.lookup_blur 	= jsList_lookup_blur;
	this.lookup_show 	= jsList_lookup_show
	this.initEvents		= jsList_initEvents;

    if (!top.jsUtils) alert('The jsUtils class is not loaded. This class is a must for the jsList class.');
    if (!top.jsField) alert('The jsField class is not loaded. This class is a must for the jsList class.');
    if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;
	
	// initialization
	if (this.box) { this.initEvents(); }
	
	// ==============-------------------------------
	// -------------- IMPLEMENTATION
	
	function jsList_initEvents() {
		/*
		if (window.addEventListener) {
			top.addEventListener('resize', 	new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"), false);
			top.addEventListener('mousemove', 	new Function("event", "if (top.elements) top.elements['"+ this.name + "'].doResize(event)"), false);
			top.addEventListener('mouseup',   	new Function("event", "if (top.elements) top.elements['"+ this.name + "'].stopResize(event)"), false);
			if (this.box) this.box.addEventListener('resize', 	 new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"), false);
			if (this.box) this.box.addEventListener('mousemove', new Function("event", "if (top.elements) top.elements['"+ this.name + "'].doResize(event)"), false);
			if (this.box) this.box.addEventListener('mouseup',   new Function("event", "if (top.elements) top.elements['"+ this.name + "'].stopResize(event)"), false);
		} else {
			window.attachEvent('onresize', 	  new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"));
			window.document.attachEvent('onmousemove',  new Function("if (top.elements) top.elements['"+ this.name + "'].doResize()"));
			window.document.attachEvent('onmouseup',    new Function("if (top.elements) top.elements['"+ this.name + "'].stopResize()"));
		}
		*/
	}

	function jsList_addColumn(caption, size, type, attr) {
		this.columns[this.columns.length] = caption+'::'+size+'::'+type+'::'+attr;
	}

	function jsList_addControl(type, caption, param, img) {
		ind = this.controls.length;
		switch (String(type).toLowerCase()) {
			case 'add':
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
					   '<td style="padding-left:3px;"><img src="'+ top.jsUtils.sys_path +'/includes/silk/icons/add.png"></td>'+
					   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px">'+
					   '	<a style="padding-right: 5px; cursor: pointer; font-weight: bold" id="'+ this.name +'_control'+ ind + '" class="rText" '+
					   '		onclick="obj = top.elements[\''+ this.name +'\'].onAddOrEdit; if (typeof(obj) == \'function\') { obj(); } else if (typeof(obj) == \'object\') { obj.box = top.elements[\''+ this.name +'\'].box; obj.recid = null; obj.output(); } else { top.elements[\''+ this.name +'\'].serverCall(obj.onAddOrEdit); }" '+ param +'>'+ caption + '</a>'+
					   '</td>'+
					   '</tr></table></div>';
				break;
			case 'delete':
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
					   '<td style="padding-left:3px;"><img src="'+ top.jsUtils.sys_path +'/includes/silk/icons/delete.png"></td>'+
					   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px"><a style="padding-right: 5px; cursor: pointer; font-weight: bold" id="'+ this.name +'_control'+ ind + '" class="rText" onclick="top.elements[\''+ this.name +'\'].delRecords();" '+ param +'>'+ caption + '</a></td>'+
					   '</tr></table></div>';
				break;
			case 'save':
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
					   '<td style="padding-left:3px;"><img src="'+ top.jsUtils.sys_path +'/includes/silk/icons/accept.png"></td>'+
					   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px"><a style="padding-right: 5px; cursor: pointer; font-weight: bold" id="'+ this.name +'_control'+ ind + '" class="rText" onclick="top.elements[\''+ this.name +'\'].saveData();" '+ param +'>'+ caption + '</a></td>'+
					   '</tr></table></div>';
				break;
			case 'server':
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
					   (img != undefined ? '<td style="padding-left:3px;"><img src="'+ img +'"></td>' : '')+
					   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px"><a style="padding-right: 5px; cursor: pointer; font-weight: bold" id="'+ this.name +'_control'+ ind + '" class="rText" onclick="top.elements[\''+ this.name +'\'].serverCall(\''+ param +'\');">'+ caption + '</a></td>'+
					   '</tr></table></div>';
				break;
			case 'button':
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<input id="'+ this.name +'_control'+ ind + '" class="rButton" type="button" onclick="'+ param +'" value="'+ caption + '">'+
					   '</div>';
				break;
			case 'link':
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
					   (img != undefined ? '<td style="padding-left:3px;"><img src="'+ img +'"></td>' : '')+
					   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;"><a style="padding-right: 5px; cursor: pointer; font-weight: bold" id="'+ this.name +'_control'+ ind + '" href="'+ param + '">'+ caption + '</a></td>'+
					   '</tr></table></div>';
				break;
			case 'select':
				var tmp  = '<b>'+ caption +'</b> <a href="javascript: top.elements[\''+ this.name +'\'].selectAll()">All</a> '+
					   '<span style="color: gray">|</span> '+
					   '<a href="javascript: top.elements[\''+ this.name +'\'].selectNone()">None</a>&nbsp;';
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
					   (img != undefined ? '<td style="padding-left:3px;"><img src="'+ img +'"></td>' : '')+
					   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;">'+ tmp + '</td>'+
					   '</tr></table></div>';
				break;
			case 'choice':
				var choices = caption.split(';;');
				var tmp  = '<b>'+ choices[0] +'</b> ';
				for (var i=1; i<choices.length; i++) {
					if (i != 1) tmp += '<span style="color: gray">|</span> ';
					tmp += '<a href="javascript: '+ param +'(\''+ choices[i] +'\')">'+ choices[i] +'</a>&nbsp;';
				}
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
					   (img != undefined ? '<td style="padding-left:3px;"><img src="'+ img +'"></td>' : '')+
					   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;">'+ tmp + '</td>'+
					   '</tr></table></div>';
				break;
			case 'custom':
				html = '<div id="'+ this.name +'_control'+ ind + '_div">'+
					   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
					   (img != undefined ? '<td style="padding-left:3px;"><img src="'+ img +'"></td>' : '')+
					   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;">'+ caption + '</td>'+
					   '</tr></table></div>';
				break;
			default:
				html = caption;
				break;
		}
		this.controls[this.controls.length] = html;
	}

	function jsList_addFilter(caption, img) {
		ind  = this.filters.length;
		html = '<div id="'+ this.name +'_filter'+ ind + '_div">'+
			   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
			   (img != undefined ? '<td style="padding-left:3px;"><img src="'+ img +'"></td>' : '')+
			   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;">'+
			   '	<a style="padding-right: 5px; cursor: pointer; font-weight: bold" id="'+ this.name +'_filter'+ ind + '" '+
			   '		onclick="top.elements[\''+ this.name + '\'].applyFilter(\''+ caption +'\');">'+ caption +'</a>'+
			   '</td>'+
			   '</tr></table></div>';
		this.filters[this.filters.length] = html;
	}

	function jsList_applyFilter(param) {
		this.srvParams['filter'] = param;
		this.getData();
	}

	function jsList_addSearch(caption, type, fieldName, inTag, outTag, defValue, items) {
		if (inTag    == null) inTag    = '';
		if (outTag   == null) outTag   = '';
		if (defValue == null) defValue = '';
		ind = this.searches.length;
		this.searches[ind] = new top.jsField(caption, type, fieldName, inTag, outTag, defValue, false, 0);
		if (items) this.searches[ind].items = items;
		if (type.toUpperCase() != 'BREAK') {
			this.searches[ind].index    = ind;
			this.searches[ind].prefix   = this.name;
			this.searches[ind].owner    = this;
			this.searches[ind].td1Class = 'lstSearch_caption';
			this.searches[ind].td2Class = 'lstSearch_value';
			this.searches[ind].inTag   = ' onkeyup="if (event.keyCode == 13) { obj = top.elements[\''+ this.name +'\']; if (obj) { obj.submitSearch(); obj.openSearch(false);  } }" '+ this.searches[ind].inTag;
		}
		return this.searches[ind];
	}

	function jsList_lookup_show(name) {
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

	function jsList_lookup_keyup(el, name, evnt) {
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

	function jsList_lookup_blur(el, name, evnt) {
		setTimeout("if (top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"').value == '') {" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_search').value = 'start typing...';" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_search').style.color = '#666666';" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_div').style.display = 'none';"+
				   "	top.jsUtils.clearShadow(top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_div')); "+
				   "}", 400);
	}

	function jsList_addItem(id, values) {
		var ind = this.items.length;
		this.items[ind] = new top.jsListItem(id, (this.showKey ? Array(id).concat(values) : values));
		this.items[ind].ind   = ind;
		this.items[ind].owner = this;
	}

	function jsList_submitSearch() {
		var el = this.box.ownerDocument.getElementById('clearSearchLink_'+ this.name);
		if (el) if (this.searched) el.style.display = ''; else el.style.display = 'none';	
		this.items = [];
		this.page_num = 0;
		this.getData();
	}

	function jsList_clearSearch(flag) {
		if (!this.box) return;
		for (si=0; si<this.searches.length; si++) {
			this.searches[si].value = null;
			if (this.box) {
				var el  = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[si].index);
				var el2 = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[si].index + '_2');
				if (flag) {
					if (el)  el.value  = '';
					if (el2) el2.value = '';
				} else {
					tmp = this.searches[si].defValue.split('::');
					if (el)  el.value  = tmp[0];
					if (el2) el2.value = tmp[1] ? tmp[1] : '';
				}
			}
		}
		this.searched = false;
	}

	function jsList_openSearch(flag) {
		if (!this.box) return;
		if (flag != null) this.showSearch = !flag;
		// init searches (only if opening)
		if (!this.showSearch) {
			var i = 0;
			while(true) {
				sr1 = this.box.ownerDocument.getElementById(this.name+'_field'+i);
				sr2 = this.box.ownerDocument.getElementById(this.name+'_field'+i+'_2');
				if (!sr1 ) break;
				if (sr1.name != '' && String(this.searchData[sr1.name]) != 'undefined') {
					var tmp = String(this.searchData[sr1.name]).split('::');
					sr1.value = tmp[0];
					if (sr2) sr2.value = tmp[1];				
				}
				i++;
			}
		}
		// slide down
		var el = this.box.ownerDocument.getElementById('searches_'+ this.name);
		if (this.showSearch) {
			this.showSearch = false;
			if (el.shadow) el.shadow.style.display = 'none';
			top.jsUtils.slideUp(el); 
		} else {
			this.showSearch = true;
			fHeight = parseInt(el.style.clientHeight);
			el.style.display  = '';
			top.tmp_search_el = el;
			// slide down and drop shadow
			top.jsUtils.slideDown(el, new Function("var el = top.tmp_search_el; if (el.shadow) { el.shadow.style.display = ''; } else { el.shadow = top.jsUtils.dropShadow(el); }"));
			// focus first element
			top.tmp_sel = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[0].index);
			if (top.tmp_sel) { setTimeout("top.tmp_sel.focus();", 100); }
		}
	}

	function jsList_getList(fld) {
		if (!this.box) return;
		this.fieldList++;
		req = this.box.ownerDocument.createElement('SCRIPT');
		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// add list params
		param['req_cmd']    = 'search_field_list';
		param['req_name']   = this.name;
		param['req_recid']  = this.recid ? this.recid : 'null';
		param['req_index']  = fld.index;
		param['req_field']  = fld.fieldName;

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		req.src  = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param);
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsList_getListDone(nameOrIndex, param) {
		if (!this.box) return;
		this.fieldList--;
		fld = this.findSearch(nameOrIndex);
		fld.param = param;
		if (this.fieldList == 0) {
			var el = this.box.ownerDocument.getElementById('searches_'+ this.name);
			if (el) {
				el.innerHTML = this.getSearches();
				for (ssi=0; ssi<this.searches.length; ssi++) {
					ssel  = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[ssi].index);
					ssel2 = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[ssi].index + '_2');
					sstmp = this.searches[ssi].value != '' ? this.searches[ssi].value : this.searches[ssi].defValue;
					if (ssel.value == '' && sstmp != '' && sstmp != null) {
						sstmp = sstmp.split('::');
						ssel.value = sstmp[0];
						if (sstmp.length == 2) ssel2.sstmp[1];
					}
				}
			}
			this.getData();
		}
	}

	function jsList_findSearch(indOrName) {
		for (i=0; i<this.searches.length; i++) {
			fld = this.searches[i];
			if (fld.fieldName == indOrName) return fld;
			if (fld.index == indOrName) return fld;
		}
		return null;
	}

	function jsList_resize() {
		if (!this.box) return;
		// --
		var tmpHTML = this.box.innerHTML;
		this.box.innerHTML = '';
		var height = parseInt(this.box.clientHeight);
		var width= parseInt(this.box.clientWidth);
		if (parseInt(height) == 0) height = parseInt(this.box.style.height);
		if (parseInt(width)  == 0) width  = parseInt(this.box.style.width);
		this.box.innerHTML = tmpHTML;
		// --
		var el  = this.box.ownerDocument.getElementById('body_'+ this.name);
		var el2 = this.box.ownerDocument.getElementById('mtbody_'+ this.name);
		var els = this.box.ownerDocument.getElementById('mtcell_'+ this.name);
		if (height > 0 && el) {
			var newHeight = height 
				- (this.showHeader ? 27 : 0) 
				- (this.showFooter ? 25 : 0) 
				- (this.toolbar != null ? 30 : 0) 
				- (document.all ? 0 : 4);
			if (newHeight < 0 ) newHeight = 0;
			el.style.height = newHeight;
		}
		if (width > 0 && el) {
			var newWidth = width - (document.all ? 0 : 4);
			if (newWidth < 0) newWidth = 0;
			el.style.width = newWidth;
		}
		// -- mtbody
		if (el2) el2.style.overflow = '';
		if (el2 && parseInt(el2.clientHeight) > parseInt(el.clientHeight) && el.clientWidth > el2.clientWidth && 
					(navigator.userAgent.toLowerCase().indexOf('chrome') == -1) /* does not work in chrome */) {
			el2.style.overflow = 'auto';
			el2.style.height   = height - 22
				- (this.showHeader ? 27 : 0) 
				- (this.showFooter ? 25 : 0) 
				- (this.toolbar != null ? 30 : 0) 
				- (document.all ? 0 : 4);
			if (els) els.style.display = '';
		} else {
			if (els) els.style.display = 'none';
		}
	}

	function jsList_refresh() {
		if (!this.box) return;
		this.showSearch = false;
		var el = this.box.ownerDocument.getElementById('clearSearchLink_'+ this.name);
		if (el) if (this.searched) el.style.display = ''; else el.style.display = 'none';	
		// CHANGING PART: generate records
		var bodyHTML = '';
		if (this.layout == 'table') {
		   bodyHTML += '<table id="mtable_'+ this.name + '" cellpadding="0" cellspacing="0" style="width: 100%" class="lstBody_tbl">\n'+
							this.getHeaders() +
							this.getRecords() +
						'</table>\n';
		}
		if (this.layout == 'div') {
		   bodyHTML += '<table id="mtable_'+ this.name + '" style="width: 100%" class="lstBody_tbl"><tr><td>\n'+
							this.tmpl_start +
							this.getHeaders() +
							this.getRecords() +
							this.tmpl_end +
					   '</td></tr></table>\n';
		}
		pages = this.getFooter();
		if (!this.smallPageCount) {
			var last = (this.page_num * this.items_pp + this.items_pp);
			if (last > this.count) last = this.count;
			pageCountDsp = (this.page_num * this.items_pp + 1) +'-'+ last +' of '+ this.count;
		} else {
			pageCountDsp = this.page_num + 1;
		}

		// OTHER PART: output or regenerate
		if (this.box.ownerDocument.getElementById('body_'+ this.name)) {
			// refresh Header
			if (this.showHeader) {
				el = this.box.ownerDocument.getElementById('title_'+ this.name);
				if (el) el.innerHTML = this.header +'&nbsp;';
				// controls
				el = this.box.ownerDocument.getElementById('controls_'+ this.name);
				if (el) el.innerHTML = this.getControls();
			}
			// refresh Footer
			if (this.showFooter) {
				el = this.box.ownerDocument.getElementById('footerR_'+ this.name);
				if (el) el.innerHTML = '<table cellpadding=0 cellspacing=0><tr><td>'+ this.getFilters() +'</td><td>'+ pageCountDsp +'</td></tr></table>';
			}
			el = this.box.ownerDocument.getElementById('footerL_'+ this.name);
			if (el) el.innerHTML = pages;
			// refresh body
			var body = this.box.ownerDocument.getElementById('body_'+ this.name);
			body.innerHTML = bodyHTML;
			// refresh toolbar if any
			if (this.toolbar != null) {
				this.toolbar.box = this.box.ownerDocument.getElementById('toolbar_'+ this.name);
				this.toolbar.output();
			}
			// make sure search is hidden
			this.showSearch = false;
			el = this.box.ownerDocument.getElementById('searches_'+ this.name);
			if (el) el.style.display = 'none';
			if (el && el.shadow) el.shadow.style.display = 'none';
			if (el) el.innerHTML = this.getSearches();
		} else {
			// output entire thing
			html =  '<div id="list_'+ this.name +'" class="lst_div" style="'+ this.style_list +'">';
			// generate header
			if (this.showHeader) {
				html += '<div id="header_'+ this.name +'" class="lstHeader_div" style="height: 26px; overflow: hidden; '+ this.style_header +'">\n'+
						'   <table cellpadding=0 cellspacing=1 style="width: 100%; height: 26px;" class="lstHeader_tbl"><tr>\n'+
						'       <td id="title_td1_'+ this.name + '" style="padding-left: 5px; padding-top: 0px; width: 95%" class="lstHeader_td1">'+ 
						'		 <span ondblclick="top.elements.'+ this.name +'.getData()" id="title_'+ this.name +'">'+ this.header +'&nbsp;</span>'+
								 (this.searches.length != 0 ? '<span class="rText" id="searchLink_'+ this.name +'"> - <a href="javascript: top.elements[\''+ this.name +'\'].openSearch();">Search</a></span>'+
															  '<span style="display: none" id="clearSearchLink_'+ this.name +'"> - [<a href="javascript: var obj = top.elements[\''+ this.name +'\']; obj.clearSearch(); obj.submitSearch();">Clear Search</a>]' : '') +
						'		 <span style="font-variant: normal; font-size: 10px; font-family: verdana; padding: 1px; margin-left: 10px; display: none; position: absolute; background-color: red; color: white;" id="status_'+ this.name + '"></span>'+
						'       </td>\n'+
						'       <td align="right" style=" padding-top: 0px; width: 5%;" class="lstHeader_td2" id="controls_'+ this.name +'" nowrap="nowrap">'+ this.getControls() +'</td>\n'+
						'   </tr></table>\n'+
						'</div>\n'+
						'<div style="position: relative">'+
						'	<div style="margin-left: 10px; position: absolute; overflow: hidden; z-index: 100;">'+
						'	<div id="searches_'+ this.name +'" class="lstSearch_div" style="display: none; position: absolute; z-index: 100;">'+
								this.getSearches() +
						'	</div>'+
						'	</div>'+
						'</div>';
			}
			if (this.toolbar != null) {
				html += '<div id="toolbar_'+ this.name +'" class="tabs_toolbar" style="border-bottom: 1px solid silver;"></div>';
			}
			html += '<div id="body_'+ this.name +'" class="lstBody_div" style="height: 250px; overflow: auto; '+ this.style_body +'">\n';

			html += bodyHTML + '</div>\n';
			// generate footer
			if (this.showFooter) {
				html += '<div id="footer_'+ this.name +'" class="lstFooter_div" style="height: 24px; overflow: hidden; '+ this.style_footer +'">\n'+
						'   <table cellpadding=0 cellspacing=1 style="height: 24px; width: 100%" class="lstFooter_tbl"><tr>\n'+
						'       <td id="footerL_'+ this.name +'" style="width: 70%" nowrap="nowrap" class="lstFooter_td1">'+ pages +'</td>\n'+
						'       <td id="footerR_'+ this.name +'" style="width: 30%" nowrap="nowrap" align=right class="lstFooter_td2">'+
						'			<table cellpadding=0 cellspacing=0><tr><td>'+ this.getFilters() +'</td><td>'+ pageCountDsp +'</td></tr></table>'+
						'		</td>\n'+
						'   </tr></table>'+
						'</div>';
			}

			html += '</div>';
			this.box.innerHTML = html;
			// refresh toolbar if any
			if (this.toolbar != null) {
				this.toolbar.box = this.box.ownerDocument.getElementById('toolbar_'+ this.name);
				this.toolbar.output();
			}
			
		}
		if (this.onRefresh) this.onRefresh();
		this.resize();
	}

	function jsList_output() {
		// fill search lists if any
		for (i=0; i<this.searches.length; i++) {
			fld = this.searches[i];
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
		if (this.onOutput) { this.onOutput(); }
		// finalize
		this.refresh();
		this.getData(this.page_num);
	}

	function jsList_getControls() {
		html = '';
		html = '<table cellspacing="0" cellpadding="0" class="rText"><tr>';
		for (i=0; i<this.controls.length; i++) {
			html += '<td nowrap="nowrap" style="padding-left: 2px; padding-right: 2px;">'+ this.controls[i] + '</td>';
		}
		html += '</tr></table>';
		return html;
	}

	function jsList_getFilters() {
		var html = '<select onchange="top.elements[\''+ this.name + '\'].applyFilter(this.value);" class=rText style="margin-right: 10px; padding: 1px; background: white;">';
		var filters = this.filters.split(',');	
		for (i=0; i<filters.length; i++) {
			html += '<option value="'+ filters[i] +'" '+ (this.srvParams['filter'] == filters[i] ? 'selected' : '')+'>'+ filters[i] +'</option>';
		}
		html += '</select>';
		return (this.filters == '' ? '' : 'Filter: ' + html);
	}

	function jsList_getSearches() {
		html = '';
		html = '<table cellspacing="0" cellpadding="2" class="lstSearch_tbl">';
		for (i=0; i<this.searches.length; i++) {
			btn = '';
			if (i == 0) btn = '<input type="button" value="X" class="rButton" onclick="obj = top.elements[\''+ this.name +'\']; if (obj) { obj.openSearch(false); }" style="width: 22px; text-align: center;">';
			html += '<tr>'+
					'<td width="20px" style="padding-right: 20px">'+ btn +'</td>' +
						 this.searches[i].build('nowrap="nowrap"') +
					'</tr>';
		}
		html += '<tr>'+
				'	<td colspan="2" class="lstSearch_caption"></td>'+
				'	<td colspan="2" class="lstSearch_value" style="padding-top: 10px; padding-bottom: 6px;" nowrap>'+
				'		<input type="button" onclick="obj = top.elements[\''+ this.name +'\']; if (obj) { obj.searched = true; obj.submitSearch(); obj.openSearch(false); }" style="width: 70px" class="rButton" value="Search">'+
				'		<input type="button" onclick="obj = top.elements[\''+ this.name +'\']; if (obj) { obj.searched = false; obj.clearSearch(); obj.submitSearch(); obj.openSearch(false); }" style="width: 70px" class="rButton" value="Clear">'+
				'	</td>'+
				'</tr></table>';
		return html;
	}

	function jsList_showPage(newPage) {
		if (newPage < 0) newPage = 0;
		if (newPage > this.page_count) newPage = this.page_count-1;
		this.items = [];  
		this.refresh(); 
		this.page_num = newPage; 
		this.getData();
	}

	function jsList_getFooter() {
		// generate footer
		var pages  = "";
		var pagesa = "";
		var istart = Math.floor(this.count / this.items_pp + 0.999);
		
		this.page_count = istart;
		if (istart > 8) {
			istart = 8;
			if (this.smallPageNav) {
				pagesa = "<div style=\"float: left; padding-left: 15px;\">"+
						 "		<input type=\"button\" value=\"<<\" class=\"sText\" style=\"width: 30px\" "+
						 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num - 1)\" "+
						 "		>"+
						 "		<input type=\"button\" value=\">>\" class=\"sText\" style=\"width: 30px\" "+
						 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num + 1)\" "+
						 "		>"+
						 "</div>";
			} else {
				pagesa = "<div style=\"float: left; padding-left: 15px;\">"+
						 "		<input type=\"button\" value=\"<<\" class=\"sText\" style=\"width: 30px\" "+
						 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num - 1)\" "+
						 "		>"+
						 "		<input type=\"text\" size=\"4\" class=\"sText\" value=\""+ (this.page_num+1) +"\" "+
						 "			onclick=\"this.select();\" style=\"text-align: center;\" "+
						 "			onkeyup=\"if (event.keyCode != 13) return;  "+
						 "					  if (this.value < 1) this.value = 1; "+
						 "					  top.elements[\'"+ this.name +"\'].showPage(parseInt(this.value-1)); \"> "+
						 "		<input type=\"button\" value=\">>\" class=\"sText\" style=\"width: 30px\" "+
						 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num + 1)\" "+
						 "		>"+
						 "</div>";
			}
		}
		if (!this.smallPageNav) {
			for (i=1; i<=istart; i++) {
				if (i == this.page_num+1) { cName = 'lstFooter_current_page'; } else { cName = 'lstFooter_page'; }
				pages += '<div class="'+ cName +'" style="float: left; cursor: pointer;" '+
						 '  onmouseover = "this.className = \'lstFooter_selected_page\';" '+
						 '  onmouseout  = "this.className = \''+ cName +'\';" '+
						 '	onclick = "top.elements[\''+ this.name +'\'].showPage('+ (i-1) +')"'+
						 '>' + i + '</div>';
			}
		} else {
			pages  = "<div style=\"float: left; padding-left: 15px;\">"+
				 "		<input type=\"button\" value=\"<<\" class=\"sText\" style=\"width: 30px\" "+
				 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num - 1)\" "+
				 "		>"+
				 "		<input type=\"button\" value=\">>\" class=\"sText\" style=\"width: 30px\" "+
				 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num + 1)\" "+
				 "		>"+
				 "</div>";
		}
		return pages + pagesa;
	}

	function jsList_getHeaders() {
		html = '';
		switch (this.layout) {
			case 'table':
				if (this.showTabHeader) {
					html += '<thead id="mthead_'+ this.name +'"><tr>';
					if (this.showTabNumber) html += '<td id="'+ this.name +'_cell_header_number" class="lstBody_head" width="18px" style="cursor: default;">'+
													'	<div class="lstBody_number" style="width: 18px; overflow: hidden; text-align: left;">#</div>'+
													'</td>';
					for (i=0; i<this.columns.length; i++) {
						tmp = this.columns[i].split('::');
						if (this.sortBy[i] && this.sortBy[i] != '') {
							if (this.sortBy[i].indexOf('ASC') > 0) img = 'sort_down.png'; else img = 'sort_up.png';
							sortStyle = 'background-image: url('+ top.jsUtils.sys_path +'/images/'+ img +'); background-repeat: no-repeat; background-position: center right; ';
						} else {
							sortStyle = '';
						}
						html += '<td id="'+ this.name +'_cell_header_'+ i +'" onclick="top.elements[\''+ this.name +'\'].columnClick('+ i +', event);" class="lstBody_head" width="'+ tmp[1] +'" '+
								'		style="'+ sortStyle +'cursor: default;" nowrap="nowrap">'+
								'<div style="overflow: hidden; padding: 2px;">'+ tmp[0] +'</div>'+
								'</td>';
					}
					html += '<td id="mtcell_'+ this.name +'" class="lstBody_head" style="padding-left: 10px; border-left: 0px;">&nbsp;</td>';
					html += '</tr></thead>';
				} else {
				}
				break;
			case 'div':
				break;
		}
		return html;
	}

	function jsList_getRecords() {
		html = '';
		switch (this.layout) {
			case 'table':
				html += '<tbody id="mtbody_'+ this.name + '">';
				for (i=0; i<this.items_pp; i++) {
					// empty line
					if (!this.items[i]) { continue; }
					// set text and bg color if any
					var	tmp_color = '';
					var tmp_colors = this.colors[this.items[i].id];
					if (tmp_colors != undefined && tmp_colors != '') {
						tmp_colors = tmp_colors.split('::');
						if (tmp_colors[0] != '') tmp_color += 'color: '+ tmp_colors[0] +';';
						if (tmp_colors[1] != '') tmp_color += 'background-color: '+ tmp_colors[1] + ';';
					}
					if (this.items[i].selected) {
						html += '<tr id="'+ this.name +'_line_'+ i +'" class="lstBody_selected" ' +
								'    onclick     = "top.elements[\''+ this.name +'\'].lstClick('+ i +', event);" '+
								'    ondblclick  = "top.elements[\''+ this.name +'\'].lstDblClick('+ i +', event);" '+
								'    onmouseup = "if (document.all) document.selection.empty(); else window.getSelection().removeAllRanges();" '+
								//'    onmousemove = "if (document.all) document.selection.empty(); else window.getSelection().removeAllRanges();" '+
								'	 custom_style="'+ tmp_color +'"'+
								'>';
					} else {
						html += '<tr id="'+ this.name +'_line_'+ i +'" class="'+ (i%2 == 0 ? 'lstBody_odd' : 'lstBody_even') + '" ' + 
								'    onmouseover = "if (this.getAttribute(\'selected\') == \'yes\') { return; } this.className = \''+ (i%2 == 0 ? 'lstBody_odd_hover' : 'lstBody_even_hover') + '\'; this.style.cssText = \'\';" '+
								'    onmouseout  = "if (this.getAttribute(\'selected\') == \'yes\') { return; } this.className = \''+ (i%2 == 0 ? 'lstBody_odd' : 'lstBody_even') + '\'; this.style.cssText = \''+ tmp_color +'\';" '+
								'    onclick     = "top.elements[\''+ this.name +'\'].lstClick('+ i +', event);" '+
								'    ondblclick  = "top.elements[\''+ this.name +'\'].lstDblClick('+ i +', event);" '+
								'    onmouseup = "if (document.all) document.selection.empty(); else window.getSelection().removeAllRanges();" '+
								//'    onmousemove = "if (document.all) document.selection.empty(); else window.getSelection().removeAllRanges();" '+
								'	 custom_style="'+ tmp_color +'"'+
								'	 style="'+ tmp_color +'"'+
								'>';
					}
					num = (parseInt(this.page_num) * parseInt(this.items_pp)) + parseInt(i+1);
					if (this.showTabNumber) html += '<td id="'+ this.name +'_cell_'+ i +'_number" width="20px" class="lstBody_head" style="padding-left: 0px;">'+
													'	<div class="lstBody_number" style="width: 20px; overflow: hidden; text-align: left; padding-left: 0px;">'+ num +'</div>'+
													'</td>';
					j = 0;
					while (true) {
						tmp = this.columns[j].split('::');
						// prepare cell data
						printItem = this.items[i].values[j];
						switch (tmp[2].toUpperCase()) {
							case 'URL':
								pos = printItem.indexOf('/', 8);
								printItem = '<a href="' + printItem + '" target="_blank">'+
											printItem.substr(0, pos) + '</a>';
								break;

							case 'REPEAT':
								if (i > 0 && this.items[i].values[j] == this.items[i-1].values[j]
										  && this.items[i].values[j] != '')
									printItem = '-- // --';
								break;
						}
						// prepare cell
						if (this.editable[j] != undefined) { cellPadding = 0; }
													  else { cellPadding = this.tblPadding; }
						html += '<td valign=top id="'+ this.name +'_cell_'+ i +'_'+ j +'" class="lstBody_td" width="'+ tmp[1] +'" '+
								'style="cursor: default;" '+ tmp[3] +'>';
						if (this.fixed) {
							// this is for editable controls
							tmp = String(this.editable[j]).split('::');
							switch (tmp[0].toUpperCase()) {
								case 'INT':
									var ttmp = printItem.split('::');
									if (!ttmp[1]) ttmp[1] = '';
									if (ttmp[0] != tmp[2]) {
										html +=	'<input id="'+ this.name +'_edit_'+ i +'_'+ j +'" class="rText" type="text" '+
												'	style="border: 1px solid #d2cedf; width: 100%; margin: 0; padding: '+ (this.tblPadding-2) +'; '+ (tmp[1] != undefined ? tmp[1] : '') +'" '+
												'	oldvalue="'+ printItem +'" value="'+ printItem +'" '+
												'	onclick="this.select(); this.focus();"'+
												'	onkeyup="if (event.keyCode == 40 || event.keyCode == 13) { el = document.getElementById(\''+ this.name +'_edit_'+ (i+1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } '+
												'			 if (event.keyCode == 38) { el = document.getElementById(\''+ this.name +'_edit_'+ (i-1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } "'+
												'	onfocus="obj = top.elements[\''+ this.name +'\']; obj.lstClick('+ i +', event);"'+
												'	onblur="if (!top.jsUtils.isInt(this.value)) { this.value = this.getAttribute(\'oldvalue\'); } if (this.getAttribute(\'oldvalue\') != this.value) { this.style.backgroundColor = \'#ffffb2\'; '+ (this.onEditableChange ? 'top.elements.'+ this.name +'.onEditableChange(this);' : '') +' } else { this.style.backgroundColor = \'white\'; }"'+
												'>';
									} else {
										html +=	'<div style="overflow: hidden; '+ this.divStyle + '">'+ ttmp[1] +'</div>';
									}
									break;
								case 'FLOAT':
									var ttmp = printItem.split('::');
									if (!ttmp[1]) ttmp[1] = '';
									if (ttmp[0] != tmp[2]) {
										html +=	'<input id="'+ this.name +'_edit_'+ i +'_'+ j +'" class="rText" type="text" '+
												'	style="border: 1px solid #d2cedf; width: 100%; margin: 0; padding: '+ (this.tblPadding-2) +'; '+ (tmp[1] != undefined ? tmp[1] : '') +'" '+
												'	oldvalue="'+ printItem +'" value="'+ printItem +'" '+
												'	onclick="this.select(); this.focus();"'+
												'	onkeyup="if (event.keyCode == 40 || event.keyCode == 13) { el = document.getElementById(\''+ this.name +'_edit_'+ (i+1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } '+
												'			 if (event.keyCode == 38) { el = document.getElementById(\''+ this.name +'_edit_'+ (i-1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } "'+
												'	onfocus="obj = top.elements[\''+ this.name +'\']; obj.lstClick('+ i +', event);"'+
												'	onblur="if (!top.jsUtils.isFloat(this.value)) { this.value = this.getAttribute(\'oldvalue\'); } if (this.getAttribute(\'oldvalue\') != this.value) { this.style.backgroundColor = \'#ffffb2\'; '+ (this.onEditableChange ? 'top.elements.'+ this.name +'.onEditableChange(this);' : '') +'} else { this.style.backgroundColor = \'white\'; }"'+
												'';
									} else {
										html +=	'<div style="overflow: hidden; '+ this.divStyle + '">'+ ttmp[1] +'</div>';
									}
									break;
								default:
									html +=	'<div style="overflow: hidden; '+ this.divStyle + '" '+
											' onmouseover="if (this.title == \'\' ) { if (top.jsUtils.stripTags) this.title = top.jsUtils.stripTags(this.innerHTML);} ">'+ printItem +'</div>';
									break;
							}
						} else {
							html +=	'<div style="padding: '+ this.tblPadding +';">' + printItem + '</div>';
						}
						html += '</td>';
						j++;
						if (this.items[i].values[j] == undefined) break;
						if (this.columns[j] == undefined) break;
					}
					html += '</tr>';
				}
				html += '</tbody>';
				break;

			case 'div':
				if (this.items.length == 0) html += this.tmpl_empty.replace('~msg~', this.msgNodata);
				var tmp_last_grp = '';
				for (i=0; i<this.items.length; i++) {
					var item = this.items[i].values;
					// prepare group section
					var tmp  = this.tmpl_group;
					while (tmp.indexOf('~field0~') > 0) { tmp = tmp.replace('~field0~', this.items[i].id); }
					while (tmp.indexOf('~FIELD0~') > 0) { tmp = tmp.replace('~FIELD0~', this.items[i].id); }
					while (tmp.indexOf('~class~') > 0)  { tmp = tmp.replace('~class~', (i % 2 == 0 ? 'lstBody_odd' : 'lstBody_even')); }
					while (tmp.indexOf('~CLASS~') > 0)  { tmp = tmp.replace('~CLASS~', (i % 2 == 0 ? 'lstBody_odd' : 'lstBody_even')); }
					for (var k=0; k<item.length; k++) {
						while (tmp.indexOf('~field'+(k+1)+'~') > 0) { tmp = tmp.replace('~field'+(k+1)+'~', item[k]); }
						while (tmp.indexOf('~FIELD'+(k+1)+'~') > 0) { tmp = tmp.replace('~FIELD'+(k+1)+'~', item[k]); }
					}
					if (tmp != tmp_last_grp) { html += tmp; tmp_last_grp = tmp; }
					// prepare repeatable section
					var tmp  = this.tmpl;
					while (tmp.indexOf('~field0~') > 0) { tmp = tmp.replace('~field0~', this.items[i].id); }
					while (tmp.indexOf('~FIELD0~') > 0) { tmp = tmp.replace('~FIELD0~', this.items[i].id); }
					while (tmp.indexOf('~class~') > 0)  { tmp = tmp.replace('~class~', (i % 2 == 0 ? 'lstBody_odd' : 'lstBody_even')); }
					while (tmp.indexOf('~CLASS~') > 0)  { tmp = tmp.replace('~CLASS~', (i % 2 == 0 ? 'lstBody_odd' : 'lstBody_even')); }
					for (var k=0; k<item.length; k++) {
						while (tmp.indexOf('~field'+(k+1)+'~') > 0) { tmp = tmp.replace('~field'+(k+1)+'~', item[k]); }
						while (tmp.indexOf('~FIELD'+(k+1)+'~') > 0) { tmp = tmp.replace('~FIELD'+(k+1)+'~', item[k]); }
					}
					html += tmp;
				}
				break;
		}
		return html;
	}

	function jsList_lstClick(ind, evnt) {
		if (!this.box) return;
		if (this.showSearch) this.openSearch(false); // show search if it is open
		if (document.all) this.box.ownerDocument.selection.empty(); else window.getSelection().removeAllRanges();
		if (this.onClick) {
			fl = this.onClick(this.items[ind].id, evnt);
			if (fl === false) return;
		}
		// clear other if necessary
		if (!evnt.ctrlKey && !evnt.shiftKey) {
			for (i=0; i<this.items.length; i++) { this.items[i].select(false); }
		}
		if (evnt.shiftKey) {
			var cnt = 0; var firsti = null;
			for (i=0; i<this.items.length; i++) { if (this.items[i].selected) { cnt++; if (!firsti) firsti = i; } }
			if (cnt >  1) {
				for (i=0; i<this.items.length; i++) { this.items[i].select(false); }
				//this.refresh();
			}
			if (cnt == 1) {
				if (ind > firsti) {
					for (i=firsti; i<=ind; i++) { this.items[i].select(true); }
				} else {
					for (i=ind; i<=firsti; i++) { this.items[i].select(true); }
				}
				//this.refresh();
				return;
			}
		}
		// select new
		if (this.items[ind]) this.items[ind].select();
	}

	function jsList_lstDblClick(ind, evnt) {
		if (!this.box) return;
		// if it is a function or a command
		if (typeof(this.onDblClick) == 'function') {
			if (this.items[ind]) {
				fl = this.onDblClick(this.items[ind].id, evnt);
				if (fl === false) return;
			}
		} else if (this.onDblClick != undefined && this.onDblClick != '') {
			this.serverCall(this.onDblClick);
			return;
		}
		// if nothing is defined, then use Edit URL function or command
		if (this.onAddOrEdit) {
			if (typeof(this.onAddOrEdit) == 'function') {
				this.onAddOrEdit(this.items[ind].id);
			} else if (typeof(this.onAddOrEdit) == 'object') {
				this.onAddOrEdit.box = this.box;
				this.onAddOrEdit.recid = this.items[ind].id;
				this.onAddOrEdit.output(); 
			} else {
				this.serverCall(this.onAddOrEdit);
			}
		}
	}

	function jsList_columnClick(ind, evnt) {
		if (this.onSort) {
			fl = this.onSort(parseInt(ind) + 1, evnt);
			if (fl === false) return;
		}
		// if control key is not pressed
		tmp = this.sortBy[ind];
		if (!evnt.ctrlKey) this.sortBy = [];
		if (tmp) this.sortBy[ind] = tmp;
		indOrder = parseInt(ind) + 2;
		switch(this.sortBy[ind]) {
			case undefined: 
				this.sortBy[ind] = indOrder + ' ASC';
				break;
			case indOrder + ' ASC':
				this.sortBy[ind] = indOrder + ' DESC';
				break;
			case indOrder + ' DESC':
				this.sortBy.splice(ind);
				break;
		}
		this.getData();
	}

	function jsList_getData() {
		if (!this.box) return;
		if (this.fieldList > 0) return;
		if (this.onData) this.onData();
		this.showStatus('Retrieving Data...');
		this.items = [];
		req = this.box.ownerDocument.createElement('SCRIPT');
		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// get search data fields
		this.searchData = [];
		var tmpSearchData = '';
		var searchFlag = false;
		for (si=0; si<this.searches.length; si++) {
			sel  = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[si].index);
			sel2 = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[si].index + '_2');
			if ( (!sel || sel.value == '') &&
				 (this.searches[si].defValue == '' || this.searches[si].defValue == null) &&
				 (this.searches[si].value == '' || this.searches[si].value == null) ) continue;
			searchFlag = true;
			if (sel2) { if (sel2.value != '') el2dsp = '::' + sel2.value; else el2dsp = '::' + sel.value; } else el2dsp = '';
			if (sel) { this.searchData[this.searches[si].fieldName] = sel.value + el2dsp; }
				else { this.searchData[this.searches[si].fieldName] = (this.searches[si].value != null && this.searches[si].value != '') ? this.searches[si].value : this.searches[si].defValue; }
			this.searches[si].value = this.searchData[this.searches[si].fieldName];
		}
		if (!searchFlag) { tmpSearchData = ''; } else { tmpSearchData = this.searchData; }
		// add list params
		param['req_cmd'] 	 = 'lst_get_data';
		param['req_name']    = this.name;
		param['req_count']   = -1;
		param['req_limit']   = this.items_pp;
		param['req_offset']  = this.page_num * this.items_pp;
		param['req_search']  = tmpSearchData;
		param['req_sort']    = (this.sortBy.length != 0 ? this.sortBy : '');
		if (this.recid != null) param['req_recid'] = this.recid;
		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		req.src    = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param) + '&rnd=' + Math.random();
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsList_dataReceived() {
		this.refresh();
		this.hideStatus();
		if (this.onDataReceived) { this.onDataReceived(); }
	}

	function jsList_selectAll() {
		for (var i=0; i<this.items.length; i++) { this.items[i].select(true); }
	}

	function jsList_selectNone() {
		for (var i=0; i<this.items.length; i++) { this.items[i].select(false); }
	}

	function jsList_getSelected(sep) {
		if (!sep) sep = ',';
		recs = '';
		for (i=0; i<this.items.length; i++) {
			if (this.items[i].selected) recs += this.items[i].id + sep;
		}
		if (recs.length > 0 && recs.substr(recs.length-sep.length) == sep) recs = recs.substr(0, recs.length-sep.length);
		return recs;
	}

	function jsList_getItem(itemid) {
		for (i=0; i<this.items.length; i++) {
			if (this.items[i].id == itemid) return this.items[i];
		}
		return null;
	}

	function jsList_delRecords() {
		if (!this.box) return;
		recs = this.getSelected();
		if (recs == '') return;
		if (this.msgDelete != '') {
			ans = confirm(this.msgDelete);
			if (!ans) return;
		}
		if (this.onDelete) this.onDelete();
		// call delete script
		req = this.box.ownerDocument.createElement('SCRIPT');
		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// add list params
		param['req_cmd']  = 'lst_del_records';
		param['req_name'] = this.name;
		param['req_ids']  = recs;

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		req.src    = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param) + '&rnd=' + Math.random();
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsList_serverCall(cmd, params) {
		if (!this.box) return;
		recs = this.getSelected();
		// call sever script
		req = this.box.ownerDocument.createElement('SCRIPT');
		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// get search data fields
		this.searchData   = [];
		var tmpSearchData = '';
		var searchFlag = false;
		for (si=0; si<this.searches.length; si++) {
			sel  = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[si].index);
			sel2 = this.box.ownerDocument.getElementById(this.name + '_field' + this.searches[si].index + '_2');
			if ( (!sel || sel.value == '') &&
				 (this.searches[si].defValue == '' || this.searches[si].defValue == null) &&
				 (this.searches[si].value == '' || this.searches[si].value == null) ) continue;
			searchFlag = true;
			if (sel2) { if (sel2.value != '') el2dsp = '::' + sel2.value; else el2dsp = '::' + sel.value; } else el2dsp = '';
			if (sel) { this.searchData[this.searches[si].fieldName] = sel.value + el2dsp; }
				else { this.searchData[this.searches[si].fieldName] = (this.searches[si].value != null && this.searches[si].value != '') ? this.searches[si].value : this.searches[si].defValue; }
			this.searches[si].value = this.searchData[this.searches[si].fieldName];
		}
		if (!searchFlag) tmpSearchData = ''; else tmpSearchData = this.searchData;
		// add list params
		param['req_cmd']  	 = cmd;
		param['req_name'] 	 = this.name;
		param['req_count']   = -1;
		param['req_limit']   = this.items_pp;
		param['req_offset']  = this.page_num * this.items_pp;
		param['req_search']  = tmpSearchData;
		param['req_sort']    = (this.sortBy.length != 0 ? this.sortBy : '');
		param['req_ids']  	 = recs;
		// add passed params
		if (params != undefined && params != '') {
			var tmp = params.split(';;');
			for (var i=0; i<tmp.length; i++) {
				var t = tmp[i].split('::');
				param[t[0]] = t[1];
			}
		}

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		req.src    = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param) + '&rnd=' + Math.random();
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsList_saveData() {
		if (!this.box) return;
		// call sever script
		req = this.box.ownerDocument.createElement('SCRIPT');
		param = [];
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// build new edits
		var editData = [];
		flag = false;
		for (i=0; i<this.items.length; i++) {
			tmp = this.items[i].id;
			for (j=0; j<this.columns.length; j++) {
				if (this.editable[j] != undefined) {
					el = this.box.ownerDocument.getElementById(this.name +'_edit_'+ i +'_'+ j);
					if (el) {
						if (el.getAttribute('oldvalue') == el.value) continue;
						flag = true;
						if (editData[tmp] == undefined) editData[tmp] = '';
						if (editData[tmp] != '') editData[tmp] += ';;';
						editData[tmp] += j+'^^'+el.value;
					}
				}
			}
		}
		if (!flag) return;
		// add list params
		param['req_cmd']  	= 'lst_save_data';
		param['req_name'] 	= this.name;
		param['req_data'] 	= editData;

		if (this.srvFile.indexOf('?') > -1) { cchar = '&'; } else { cchar = '?'; }
		req.src    = this.srvFile + cchar + 'cmd=' + top.jsUtils.serialize(param) + '&rnd=' + Math.random();
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsList_showStatus(msg) {
		if (!this.box) return;
		el = this.box.ownerDocument.getElementById('status_'+this.name);
		if (el) {
			el.innerHTML = msg;
			el.style.display = '';
		}
	}

	function jsList_hideStatus(msg) {
		if (!this.box) return;
		el = this.box.ownerDocument.getElementById('status_'+this.name);
		if (el) {
			el.style.display = 'none';
			el.innerHTML = '';
		}
	}
}
if (top != window) top.jsListItem = jsListItem;
if (top != window) top.jsList = jsList;