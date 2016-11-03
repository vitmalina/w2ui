<? require("phpCache.php"); ?>
/************************************************************
*
* -- This the jsTabs class
*
************************************************************/

function jsTab(owner, id, text, toolbar, obj) {
    this.id     	= id;
    this.text   	= text;
    this.toolbar    = toolbar;
    this.obj    	= obj;
	this.owner      = owner;
	this.visible    = true;
    this.disabled 	= false;
	this.onClick;
	this.onDblClick;
    this.index; // defines tab index
	this.initTab	= jsTab_initTab;
	
	// +++++++++++++++++++++++++++++++++++++++++++
	// ----------- IMPLEMENTATION ----------------
	// +++++++++++++++++++++++++++++++++++++++++++

	function jsTab_initTab(obj) {
		this.obj = obj;
		var el = this.owner.box.ownerDocument.getElementById('tab_'+ this.owner.name +'_dsp');	
		this.obj.box = el;
		this.obj.output();
	}
}

function jsTabs(name, box) {
    // required
    this.name       = name;
    this.box        = box;

    // public properties
    this.active     = 0;
    this.tabWidth   = 70;
    this.tabHeight  = 26;
    this.frmShow    = false;
    this.frmRefresh = false;
    this.frmInit    = false;
    this.frmHeight  = 300;
	this.tabsOnly 	= false;
    this.leftTitle  = '&nbsp;';
    this.rightTitle = '&nbsp;';
	this.style 			= '';
	this.style_toolbar 	= 'border-bottom: 1px solid #cfcfcf;';

    // public methods
    this.addTab      = jsTabs_addTab;
    this.removeTab   = jsTabs_removeTab;
    this.getTab      = jsTabs_getTab;
	this.findTab	 = jsTabs_findTab;
    this.output	     = jsTabs_output;
    this.refresh     = jsTabs_refresh;
    this.setActive   = jsTabs_setActive;
    this.setObject   = jsTabs_setObject;
    this.enable		 = jsTabs_enable;
    this.disable	 = jsTabs_disable;
	this.resize		 = jsTabs_resize;

    // public events
    this.onClick 	= null;
    this.onDblClick = null;
    this.onBeforeChange = null;
    this.onAfterChange  = null;

    // internal
    this.getTabsHTML = jsTabs_getTabsHTML;
    this.tabs        = new Array();

    // register in top.elements
    if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;

	// ==============-------------------------------
	// -------------- IMPLEMENTATION

	function jsTabs_addTab(id, text, toolbar, obj){
		// check for dups
		for (var i=0; i<this.tabs.length; i++) { 
			if (this.tabs[i] == null)  continue; 
			if (this.tabs[i].id == id) { alert('The tab with this id already exists.'); return; }
		}
		// add tab
		ind = this.tabs.length;
		this.tabs[ind] = new top.jsTab(this, id, text, toolbar, obj);
		this.tabs[ind].index  = ind;
		if (this.box) {
			// add toolbar
			tbEl = this.box.ownerDocument.getElementById('tab_'+ this.name +'_toolbar');
			if (tbEl) {
				tb = this.box.ownerDocument.createElement('DIV');
				tb.id = 'tab_'+ this.name +'_toolbar_'+ ind;
				tb.className 	 = 'tabs_toolbar';
				tb.style.display = 'none';
				tbEl.appendChild(tb);
				toolbar.box = tb;
				toolbar.output();
			}
			// add frame
			if (this.frmShow) {
				tbEl = this.box.ownerDocument.getElementById('tab_'+ this.name +'_dsp');
				if (tbEl) {
					frm = this.box.ownerDocument.createElement('IFRAME');
					frm.id 	 = 'tab_'+ this.name +'_frm_'+ ind;
					frm.name = 'tab_'+ this.name +'_frm_'+ ind;
					frm.frameBorder   = 0;
					frm.style.width   = '100%';
					frm.style.height  = parseInt(this.frmHeight)+'px';
					frm.style.display = 'none';
					tbEl.appendChild(frm);
				}
			}
			this.refresh();
		}
		return this.tabs[ind];
	}

	function jsTabs_removeTab(tab) {
		for (var i=0; i<this.tabs.length; i++) {
			if (this.tabs[i] == null) continue;
			if (this.tabs[i] == tab || this.tabs[i].id == tab) {
				if (this.active == this.tabs[i].index && this.box) { 
					// hide toolbar
					var el = this.box.ownerDocument.getElementById('tab_'+ this.name +'_toolbar_'+ i);
					if (el && this.tabs[i].toolbar) el.style.display = 'none'; 
					// set other tab as active
					for (var ii=this.active-1; ii>0; ii--) {
						if (this.tabs[ii] != null && !this.tabs[ii].disabled) {
							this.active = this.tabs[ii].index;
							break; 
						}
					}
					if (this.active == this.tabs[i].index) { 
						for (var ii=0; ii < this.tabs.length; ii++) {
							if (this.tabs[ii] != null && !this.tabs[ii].disabled) {
								this.active = this.tabs[ii].index;
								break; 
							}
						}
					}
				}
				this.tabs[i] = null;
				this.refresh();
				return true;
			}
		}
		return false;
	}

	function jsTabs_getTab(id) {
		for (var i=0; i<this.tabs.length; i++) {
			if (this.tabs[i] == null) continue;
			if (this.tabs[i].id == id || this.tabs[i] == id) { 
				return this.tabs[i]; 
			}
		}
		return null;
	}

	function jsTabs_findTab(text) {
		for (var i=0; i<this.tabs.length; i++) {
			if (this.tabs[i] == null) continue;
			if (this.tabs[i].text == text) { 
				return this.tabs[i]; 
			}
		}
		return null;
	}

	function jsTabs_enable(id) {
		tb = this.getTab(id);
		if (tb != null) tb.disabled = false;
		this.refresh();
	}

	function jsTabs_disable(id) {
		tb = this.getTab(id);
		if (tb != null) tb.disabled = true;
		// make other enabled tab active
		if (this.active == tb.index) {
			// set other tab as active
			for (var ii=this.active-1; ii>0; ii--) {
				if (this.tabs[ii] != null && !this.tabs[ii].disabled) {
					this.active = this.tabs[ii].index;
					break; 
				}
			}
			if (this.active == tb.index) { 
				for (var ii=0; ii < this.tabs.length; ii++) {
					if (this.tabs[ii] != null && !this.tabs[ii].disabled) {
						this.active = this.tabs[ii].index;
						break; 
					}
				}
			}
		}
		this.refresh();
	}

	function jsTabs_getTabsHTML() {
		// generating tabs
		tabsHTML = '<table cellpadding="0" cellspacing="0" class="tabs_header_tbl" width="100%" height="'+ parseInt(this.tabHeight) +'px"><tr>';
		tabsHTML +='<td class="tabs_empty" style="empty-cells: show; width: 1px; padding: 1px"><span style="font-size: 11px">&nbsp;</span></td>';

		for (i=0; i<this.tabs.length; i++) {
			if (this.tabs[i] == null) continue;
			if (!this.tabs[i].visible) continue;
			this.tabs[i].index = i;
			if (this.active == i) {
				className  = 'tabs_active';
				classDName = 'tabs_td_active';
			} else {
				className  = 'tabs_inactive';
				classDName = 'tabs_td_inactive'; 
			}
			if (this.tabs[i].disabled) { 
				className  = 'tabs_disabled'; 
				classDName = 'tabs_td_inactive'; 
			}
			tabsHTML += '<td id="tab_'+ this.name +'_'+i+'" class="'+ className +'" nowrap' +
						'  	ondblclick = "if (top.elements[\''+ this.name +'\'].onDblClick) {top.elements[\''+ this.name +'\'].onDblClick('+i+');} if (top.elements[\''+ this.name +'\'].tabs['+i+'].onDblClick) { top.elements[\''+ this.name +'\'].tabs['+ i +'].onDblClick(); } "'+
						'  	onclick = "top.elements[\''+ this.name +'\'].setActive('+i+'); "'+
						'		style = "height: '+ parseInt(this.tabHeight) +'px; width: '+ parseInt(this.tabWidth) +'px">'+ 
						'   <table cellpadding=0 cellspacing=0 style="width: 100%;"><tr><td align=center class="'+ classDName +'" style="padding-left: 7px; padding-right: 7px" nowrap>'+ this.tabs[i].text +'</td></tr></table>'+
						'</td>'+
						'<td class="tabs_empty" style="empty-cells: show; width: 1px; padding-left: 1px"><span style="font-size: 2px">&nbsp;</span></td>';
		}
		tabsHTML +='    <td class="tabs_empty" style="empty-cells: show; width: 1px; padding-left: 1px"><span style="font-size: 2px">&nbsp;</span></td>';
		tabsHTML +='    <td class="tabs_empty" style="padding-left: 5px" id="tab_'+ this.name +'_leftTitle">'+ this.leftTitle +'</td>';
		tabsHTML +='    <td class="tabs_empty"><span style="font-size: 4px">&nbsp;</span></td>';
		tabsHTML +='  </tr> '+
				   '</table>';
		return tabsHTML;
	}

	function jsTabs_output() {
		if (!this.box) return;
		tabsHTML = this.getTabsHTML();
		// generating complete HTML
		tabsTitle = '<table cellpadding="0" cellspacing="0" class="tabs_header_tbl" width="100%">'+
					'   <tr style="height: '+ parseInt(this.tabHeight) +'px;">'+
					'		<td class="tabs_empty" style="width: 95%; empty-cells: show; width: 1px; padding: 1px"><span style="font-size: 2px">&nbsp;</span></td>'+
					'		<td class="tabs_empty" style="width: 5%; padding-right: 5px" id="tab_'+ this.name +'_rightTitle" style="empty-cells: show; width: 1px; padding: 1px" align=right>'+ this.rightTitle +'</td>'+
					'   </tr>'+
					'</table>';

		wholeHTML = '<table id="tab_'+ this.name +'" cellpadding="0" cellspacing="0" class="tabs_tbl" width="100%" style="'+ this.style +'">';
		wholeHTML += '  <tr style="height: '+ parseInt(this.tabHeight) +'px">'+
					 '      <td class="tabs_td" id="tab_'+ this.name +'_all" valign=bottom>'+ tabsHTML +'</td>'+
					 '		<td class="tabs_td" id="tab_'+ this.name +'_title" valign=bottom>'+ tabsTitle + '</td>'+
					 '  </tr>';

		// separate toolbar for each tab
		wholeHTML +='<tr><td colspan=2 class="tabs_body" id="tab_'+ this.name +'_toolbar" style="height: 0px;" valign="top">';
		for (var i=0; i<this.tabs.length; i++) {
			if (this.tabs[i] == null) continue;
			if (this.active == i && this.tabs[i].toolbar != null) { addStyle = ''; } else { addStyle = 'display: none;'; }
			wholeHTML += '<div class="tabs_toolbar" id="tab_'+this.name+'_toolbar_'+i+'" style="'+ addStyle + this.style_toolbar +'"></div>';
		}
		wholeHTML += '</td></tr>';
		// separate iframe for each tab
		wholeHTML +='<tr style="height: 100%; '+(this.tabsOnly === true ? 'display: none' : '')+'">'+
			'<td colspan=2 class="tabs_body"id="tab_'+ this.name +'_dsp" style="height: '+ parseInt(this.frmHeight) +'px;" valign="top">';
		if (this.frmShow) {
			for (var i=0; i<this.tabs.length; i++) {
				if (this.tabs[i] == null) continue;
				if (this.active == i) {
					addStyle = '';
					addURL   = 'src="'+this.tabs[this.active].obj+'"';
				} else {
					addStyle = 'display: none;';
					addURL   = '';
				}
				if (this.frmInit) { addURL = 'src="'+this.tabs[i].obj+'"'; }
				wholeHTML +='<iframe frameborder=0 id="tab_'+this.name+'_frm_'+i+'" name="tab_'+this.name+'_frm_'+i+'"'+ addURL +
							'     style="width: 100%; height: '+ parseInt(this.frmHeight) +'px; '+ addStyle +'">'+
							'</iframe>';
			}
		}
		wholeHTML += '</td></tr>';
		wholeHTML += '</table>';
		this.box.innerHTML = wholeHTML;
		// if the tab is an object
		if (this.tabs[this.active].obj && this.tabs[this.active].obj.output) {
			this.tabs[this.active].obj.box = this.box.ownerDocument.getElementById('tab_'+ this.name + '_dsp');		
			if (this.tabs[this.active].obj.height != undefined && this.tabs[this.active].obj.height != null) {
				this.box.ownerDocument.getElementById('tab_'+ this.name + '_dsp').style.height = this.tabs[this.active].obj.height;
			}
			if (this.recid != undefined) this.tabs[this.active].obj.recid = this.recid;
			this.tabs[this.active].obj.output();
		} else if (!this.frmShow) {
			this.box.ownerDocument.getElementById('tab_'+ this.name + '_dsp').innerHTML = this.tabs[this.active].obj;
		}
		// init all toolbars
		for (var i=0; i<this.tabs.length; i++) {
			if (this.tabs[i] == null) continue;
			if (this.tabs[i].toolbar && this.tabs[i].toolbar.output) {
				this.tabs[i].toolbar.box = this.box.ownerDocument.getElementById('tab_'+ this.name +'_toolbar_'+ i);
				this.tabs[i].toolbar.output();
			}
		}
		this.resize();
	}

	function jsTabs_resize() {
		var el = document.getElementById('tab_'+ this.name);
		if (el) el.style.height = this.box.clientHeight;
		var tr = document.getElementById('tab_'+ this.name +'_dsp');
		if (tr) tr.style.height = parseInt(this.box.clientHeight) - parseInt(this.tabHeight) -
			parseInt(document.getElementById('tab_'+ this.name +'_toolbar').clientHeight) -2;
		for (var i=0; i<this.tabs.length; i++) {
			if (this.tabs[i] == null) continue;
			if (this.tabs[i].obj && this.tabs[i].obj.resize && tr) { 
				this.tabs[i].obj.height = parseInt(tr.style.height); this.tabs[i].obj.resize(); 
			}
		}
	}

	function jsTabs_refresh() {
		if (!this.box) return;
		el = this.box.ownerDocument.getElementById('tab_'+ this.name +'_all');
		if (el == null || el == undefined) return;
		el.innerHTML = this.getTabsHTML();
		// refresh frames if any
		if (this.frmShow) {
			// call page in frame if needed.
			frm = this.box.ownerDocument.getElementById('tab_'+ this.name+'_frm_'+this.active);
			if (frm) if (frm.src == '' || this.frmRefresh) { frm.src = this.tabs[this.active].obj; }
			// hide all, show current
			for (var i=0; i<this.tabs.length; i++) {
				if (this.tabs[i] == null) continue;
				this.tabs[i].index = i;
				frm = this.box.ownerDocument.getElementById('tab_'+ this.name+'_frm_'+i);
				if (this.active == i) {
					frm.style.display = '';
				} else {
					frm.style.display = 'none';
				}
			}
		}
		// refresh toolbars
		var refreshToolbar = false;
		for (var i=0; i<this.tabs.length; i++) {
			if (this.tabs[i] == null) continue;
			var el = this.box.ownerDocument.getElementById('tab_'+ this.name +'_toolbar_'+ i);
			if (el && this.active == i && this.tabs[i].toolbar) el.style.display = ''; else el.style.display = 'none';
			if (this.tabs[i].toolbar != undefined && this.tabs[this.active].toolbar != undefined) {
				if (i != this.active && this.tabs[i].toolbar.name == this.tabs[this.active].toolbar.name) {	el.innerHTML = ''; refreshToolbar = true; }
			}
		}
		// if the same toolbar more then once, refresh it completely
		if (refreshToolbar == true) {
			this.tabs[this.active].toolbar.box = this.box.ownerDocument.getElementById('tab_'+ this.name +'_toolbar_'+ this.active);
			this.tabs[this.active].toolbar.output();
		}
		// refresh objects if any
		if (!this.frmShow) {
			if (this.tabs[this.active].obj && this.tabs[this.active].obj.output) {
				this.tabs[this.active].obj.box = this.box.ownerDocument.getElementById('tab_'+ this.name + '_dsp');		
				this.tabs[this.active].obj.output();
			} else {
				this.box.ownerDocument.getElementById('tab_'+ this.name + '_dsp').innerHTML = this.tabs[this.active].obj;
			}
		}
		// refresh titles
		if (this.leftTitle  == '') this.leftTitle  = '&nbsp;';
		if (this.rightTitle == '') this.rightTitle = '&nbsp;';
		this.box.ownerDocument.getElementById('tab_'+ this.name +'_leftTitle').innerHTML   = this.leftTitle;
		this.box.ownerDocument.getElementById('tab_'+ this.name +'_rightTitle').innerHTML  = this.rightTitle;
		
		this.resize();
	}

	function jsTabs_setActive(ind) {
		if (!this.box) return;
		if (this.onClick) { this.onClick(ind); }
		if (this.tabs[ind].onClick) { this.tabs[ind].onClick(ind); }
		if (this.active == ind) {
			// this tab is already active
		} else {
			if (this.tabs[ind].disabled) { return; } // disabled
			oldInd = this.active;
			if (this.onBeforeChange) {
				ret2 = this.onBeforeChange(oldInd, ind);
				if ((ret1 == false) || (ret2 == false)) return; // if event needs to be cancelled
			}
			this.active = ind;
			this.refresh();
			// is the tab is an object
			if (this.tabs[ind].obj && this.tabs[ind].obj.output && this.tabsOnly !== true) {
				this.tabs[ind].obj.box = this.box.ownerDocument.getElementById('tab_'+ this.name + '_dsp');
				this.tabs[ind].obj.output();
			}
			if (this.onAfterChange) {
				this.onAfterChange(oldInd, ind);
			}
			if (window.onresize) { window.onresize(); }
		}
	}

	function jsTabs_setObject(obj) {
		obj.box 	= this.box.ownerDocument.getElementById('tab_'+ this.name + '_dsp');
		obj.output();
	}
}
top.jsTab  = jsTab;
top.jsTabs = jsTabs;