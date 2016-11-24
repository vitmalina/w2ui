<? require("phpCache.php"); ?>
/*********************************** 
*
* -- This the jsToolBar class
*
***********************************/

function jsToolBarItem(id, owner, type, caption, picture) {
    this.id        = id;
    this.owner     = owner;
    this.group     = null; // used for radio buttons
    this.checked   = null; // used for radio buttons
    this.type      = type; // button, check, radio, drop, break, html
    this.caption   = caption;
    this.picture   = picture;
    this.visible   = true;
    this.disabled  = false;
    this.hint      = '';
    this.onClick   = null;
    this.refresh   = jsToolBarItem_refresh;
	// internal
	this.hideTimer = null;
    this.getHTML   = jsToolBarItem_getHTML;	

	// ==============-------------------------------
	// -------------- IMPLEMENTATION

	function jsToolBarItem_refresh() { 
		this.owner.refresh(this.id);
	}
	
	function jsToolBarItem_getHTML() {
		if (this.caption == null) this.caption = '';
		if (this.picture == null) this.picture = '';
		if (document.all) transparent = '#62a241; filter: chroma(color=#62a241)'; else transparent = 'transparent';
		addToText = '';
		if (this.picture != '') {
			if (document.all) {
				if (this.disabled) {
					addToText   = "FILTER: alpha(opacity=20);";
					butPicture  = 'src="'+ this.picture +'" style="FILTER: alpha(opacity=20);"';
				} else {
					butPicture  = 'src="'+ top.jsUtils.sys_path +'/images/empty.gif" style="Filter:Progid:DXImageTransform.Microsoft.AlphaImageLoader(src='+ this.picture + ', opacity=20)"';
				}
			} else {
				butPicture  = 'src="'+ this.picture +'"';
			}
		}

		html = '';
		switch (this.type) {
			case 'button':
				html +=  '<table cellpadding=0 cellspacing=0 title="'+ this.hint +'" id="tab0_'+ this.owner.name + '_' + this.id +'"'+
						 '       onmouseover = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOver(\''+ this.id +'\');" '+
						 '       onmouseout  = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOut(\''+ this.id +'\');" '+
						 '       onmousedown = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemDown(\''+ this.id +'\');" '+
						 '       onmouseup   = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemUp(\''+ this.id +'\');" '+
						 '       style="-moz-border-radius: 4px; border-radius: 4px; height: 22px; margin-top: 2px; border: 1px solid '+ transparent +';"><tr><td>'+
						 '  <table cellpadding=2 cellspacing=0 id="tab1_'+ this.owner.name + '_' + this.id +'"'+
						 '       style="-moz-border-radius: 4px; border-radius: 4px; height: 100%; border: 1px solid '+ transparent +'; '+
						 '              border-left: 0px solid '+ transparent +'; border-top: 0px solid '+ transparent +'; cursor: default;"><tr>'+
							(this.picture != '' ? '<td><img '+ butPicture +'></td>' : '') +
							(this.caption != '' ? '<td nowrap style="font-size: 11px; font-family: verdana; '+ addToText +'">'+ this.caption +'</td>' : '') +
						 '  </tr></table>'+
						 '</td></tr></table>';
				break;
							
			case 'check':
				if (this.checked) {
					addCheckStyle  = 'border: 1px solid #CECEC3; ';
					addCheckStyle2 = 'background-color: #ffffff; ';
				} else {
					addCheckStyle  = 'border: 1px solid '+ transparent +'; ';
					addCheckStyle2 = '';
				}	
				html +=  '<table cellpadding=0 cellspacing=0 title="'+ this.hint +'" id="tab0_'+ this.owner.name + '_' + this.id +'"'+
						 '       onmouseover = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOver(\''+ this.id +'\');" '+
						 '       onmouseout  = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOut(\''+ this.id +'\');" '+
						 '       onmousedown = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemDown(\''+ this.id +'\');" '+
						 '       onmouseup   = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemUp(\''+ this.id +'\');" '+
						 '       style="-moz-border-radius: 4px; border-radius: 4px; height: 22px; margin-top: 2px; '+ addCheckStyle +';"><tr><td>'+
						 '  <table cellpadding=2 cellspacing=0 id="tab1_'+ this.owner.name + '_' + this.id +'"'+
						 '       style="-moz-border-radius: 4px; border-radius: 4px; height: 100%; border: 1px solid '+ transparent +'; '+ addCheckStyle2 +
						 '              border-left: 0px solid '+ transparent +'; border-top: 0px solid '+ transparent +'; cursor: default;"><tr>'+
							(this.picture != '' ? '<td><img '+ butPicture +'></td>' : '') +
							(this.caption != '' ? '<td nowrap style="font-size: 11px; font-family: verdana; '+ addToText +'">'+ this.caption +'</td>' : '') +
						 '  </tr></table>'+
						 '</td></tr></table>';
				break;

			case 'radio':
				if (this.checked) {
					addCheckStyle  = 'border: 1px solid #CECEC3; ';
					addCheckStyle2 = 'background-color: #ffffff; ';
				} else {
					addCheckStyle  = 'border: 1px solid '+ transparent +'; ';
					addCheckStyle2 = '';
				}	
				html +=  '<table cellpadding=0 cellspacing=0 title="'+ this.hint +'" id="tab0_'+ this.owner.name + '_' + this.id +'"'+
						 '       onmouseover = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOver(\''+ this.id +'\');" '+
						 '       onmouseout  = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOut(\''+ this.id +'\');" '+
						 '       onmousedown = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemDown(\''+ this.id +'\');" '+
						 '       onmouseup   = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemUp(\''+ this.id +'\');" '+
						 '       style="-moz-border-radius: 4px; border-radius: 4px; height: 22px; margin-top: 2px; '+ addCheckStyle +';"><tr><td>'+
						 '  <table cellpadding=2 cellspacing=0 id="tab1_'+ this.owner.name + '_' + this.id +'"'+
						 '       style="-moz-border-radius: 4px; border-radius: 4px; height: 100%; border: 1px solid '+ transparent +'; '+ addCheckStyle2 +
						 '              border-left: 0px solid '+ transparent +'; border-top: 0px solid '+ transparent +'; cursor: default;"><tr>'+
							(this.picture != '' ? '<td><img '+ butPicture +'></td>' : '') +
							(this.caption != '' ? '<td nowrap style="font-size: 11px; font-family: verdana; '+ addToText +'">'+ this.caption +'</td>' : '') +
						 '  </tr></table>'+
						 '</td></tr></table>';
				break;
				
			case 'drop':
				if (this.checked) {
					addCheckStyle  = 'border: 1px solid #CECEC3; ';
					addCheckStyle2 = 'background-color: #ffffff; ';
				} else {
					addCheckStyle  = 'border: 1px solid '+ transparent +'; ';
					addCheckStyle2 = '';
				}	
				html +=  '<table cellpadding=0 cellspacing=0 title="'+ this.hint +'" id="tab0_'+ this.owner.name + '_' + this.id +'"'+
						 '       onmouseover = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOver(\''+ this.id +'\');" '+
						 '       onmouseout  = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOut(\''+ this.id +'\');" '+
						 '       onmousedown = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemDown(\''+ this.id +'\'); '+
						 '						var btn = el.getItem(\''+ this.id +'\'); '+
						 '						if (btn.disabled) return; '+
						 '						tmp = document.getElementById(\'tab0_'+ this.owner.name + '_' + this.id +'_drop\'); '+
						 '						if (tmp.style.display == \'none\') { '+
						 '							el.hideDrop(\''+ this.id +'\'); '+
						 '							tmp.style.display = \'\'; '+
						 '							top.dropGlobal = tmp; '+
						 '							top.dropButton = el.getItem(\''+ this.id +'\'); '+
						 '							top.dropShadow = top.jsUtils.dropShadow(tmp); '+
						 '						} else { '+
						 '							el.hideDrop(\''+ this.id +'\'); '+
						 '							tmp.style.display = \'none\'; '+
						 '						}" '+
						 '       onmouseup   = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemUp(\''+ this.id +'\');" '+
						 '       style="-moz-border-radius: 4px; border-radius: 4px; height: 22px; margin-top: 2px;'+ addCheckStyle +';"><tr><td>'+
						 '  <table cellpadding=2 cellspacing=0 id="tab1_'+ this.owner.name + '_' + this.id +'"'+
						 '       style="-moz-border-radius: 4px; border-radius: 4px; height: 100%; border: 1px solid '+ transparent +'; '+ addCheckStyle2 +
						 '              border-left: 0px solid '+ transparent +'; border-top: 0px solid '+ transparent +'; cursor: default;"><tr>'+
							(this.picture != '' ? '<td><img '+ butPicture +'></td>' : '') +
							(this.caption != '' ? '<td nowrap style="font-size: 11px; font-family: verdana; '+ addToText +'">'+ this.caption +'</td>' : '') +
						 '		<td style="padding: 0px; padding-left: 1px;"><img src="'+ top.jsUtils.sys_path +'/images/but_down.gif" style="padding: 0px; margin: 0px;"></td>'+
						 '  </tr></table>'+
						 '</td></tr></table>'+
						 '<div id="tab0_'+ this.owner.name + '_' + this.id +'_drop"'+
						 '       onmouseover = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOver(\''+ this.id +'\');" '+
						 '       onmouseout  = "var el=top.elements[\''+ this.owner.name + '\']; if (el) el.itemOut(\''+ this.id +'\');" '+
						 '		style="display: none; z-index: 100; position: absolute; cursor: default;" class="tabs_toolbar_drop">'+ 
							this.html +
						 '</div>';
				break;
							
			case 'break':
				html +=  '<table cellpadding=0 cellspacing=0 id="tab_'+ this.owner.name +'_'+ this.id +'" style="width; 10px; height: 22px; margin-top: 2px;"><tr>'+
						 '    <td style="border-right: 1px solid silver;" nowrap>&nbsp;</td>'+
						 '    <td nowrap>&nbsp;</td>'+
						 '</tr></table>';
				break;
				
			case 'html':
				html +=  '<table cellpadding=0 cellspacing=0 id="tab_'+ this.owner.name +'_'+ this.id +'" style="height: 22px; margin-top: 2px;'+ addToText +';'+ this.owner.style_html +'"><tr>'+
						 '    <td nowrap>' + this.caption + '</td>'+
						 '</tr></table>';
				break;
		}
		// drop div
		html += '<div style="position: absolute; display: none; z-Index: 100;" id="tab_'+ this.owner.name +'_'+ this.id + '_drop"></div>';
		return html;
	}
}

function jsToolBarLink(level, caption, url, target) {
	this.level    = level;
	this.caption  = caption;
	this.url	  = url;
	this.target   = target;
	this.active   = false;
}

function jsToolBar(name, box) {
    // required
    this.name		= name;
    this.box		= box;
    this.items 		= [];
    this.links 		= [];
    this.bgcolor	= '#f6f0fc';
    this.showLinks	= false;
	this.rightHTML	= '';
	this.style_html	= 'font-family: verdana; font-size: 11px;';

    // public methods
    this.addButton  	= jsToolBar_addButton;
    this.addBreak   	= jsToolBar_addBreak;
    this.addHTML        = jsToolBar_addHTML;
    this.addRadio		= jsToolBar_addRadio;
    this.addCheck		= jsToolBar_addCheck;
    this.addDrop		= jsToolBar_addDrop;
    this.addLink		= jsToolBar_addLink;
    this.getItem		= jsToolBar_getItem;
	this.findItem		= jsToolBar_findItem;
    this.deleteItem     = jsToolBar_deleteItem;
    this.show			= jsToolBar_show;
    this.hide			= jsToolBar_hide;
    this.disable		= jsToolBar_disable;
    this.enable			= jsToolBar_enable;
    this.hideDrop		= jsToolBar_hideDrop;
    this.flushLinks		= jsToolBar_flushLinks;
    this.refreshLinks   = jsToolBar_refreshLinks;

    // public events
    this.onClick	= null;
    this.onItemOver = null;
    this.onItemOut  = null;
    this.onItemDown = null;
    this.onItemUp	= null;

    // restricted properties
    this.output 		= jsToolBar_output;
    this.getLinks 		= jsToolBar_getLinks;
    this.refresh        = jsToolBar_refresh;
    this.itemOver       = jsToolBar_itemOver;
    this.itemOut        = jsToolBar_itemOut;
    this.itemDown       = jsToolBar_itemDown;
    this.itemUp	  	    = jsToolBar_itemUp;

    // register in top.elements
    if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;
	
	// ==============-------------------------------
	// -------------- IMPLEMENTATION
	
	function jsToolBar_addButton(caption, picture, onclick, hint) {
		var id  = this.name +'_but'+ this.items.length;
		var ind = this.items.length;
		for (var i=0; i<ind; i++) { if (this.items[i] == null) { ind = i; break; } } // reuse delete elements
		this.items[ind] = new top.jsToolBarItem(id, this, 'button', caption, picture);
		if (hint != null) 	 this.items[ind].hint = hint;
		if (onclick != null) this.items[ind].onClick = onclick;
		return this.items[ind];
	}

	function jsToolBar_addBreak() {
		var id  = this.name +'_but'+ this.items.length;
		var ind = this.items.length;
		for (var i=0; i<ind; i++) { if (this.items[i] == null) { ind = i; break; } } // reuse delete elements
		this.items[ind] = new top.jsToolBarItem(id, this, 'break', null, null);
		return this.items[ind];
	}

	function jsToolBar_addHTML(html) {
		var id  = this.name +'_but'+ this.items.length;
		var ind = this.items.length;
		for (var i=0; i<ind; i++) { if (this.items[i] == null) { ind = i; break; } } // reuse delete elements
		this.items[ind] = new top.jsToolBarItem(id, this, 'html', html, null);
		return this.items[ind];
	}

	function jsToolBar_addRadio(caption, picture, onclick, hint, group) {
		var id  = this.name +'_but'+ this.items.length;
		var ind = this.items.length;
		for (var i=0; i<ind; i++) { if (this.items[i] == null) { ind = i; break; } } // reuse delete elements
		this.items[ind] = new top.jsToolBarItem(id, this, 'radio', caption, picture);
		if (group != null) 	 this.items[ind].group 	 = group;
		if (hint != null) 	 this.items[ind].hint 	 = hint;
		if (onclick != null) this.items[ind].onClick = onclick;
		return this.items[ind];
	}

	function jsToolBar_addCheck(caption, picture, onclick, hint) {
		var id  = this.name +'_but'+ this.items.length;
		var ind = this.items.length;
		for (var i=0; i<ind; i++) { if (this.items[i] == null) { ind = i; break; } } // reuse delete elements
		this.items[ind] = new top.jsToolBarItem(id, this, 'check', caption, picture);
		if (hint != null) 	 this.items[ind].hint 	 = hint;
		if (onclick != null) this.items[ind].onClick = onclick;
		return this.items[ind];
	}

	function jsToolBar_addDrop(caption, picture, onclick, hint, html) {
		var id  = this.name +'_but'+ this.items.length;
		var ind = this.items.length;
		for (var i=0; i<ind; i++) { if (this.items[i] == null) { ind = i; break; } } // reuse delete elements
		this.items[ind] = new top.jsToolBarItem(id, this, 'drop', caption, picture);
		if (html != null) 	 this.items[ind].html 	 = html;
		if (hint != null) 	 this.items[ind].hint 	 = hint;
		if (onclick != null) this.items[ind].onClick = onclick;
		this.items[ind].checked = false;
		return this.items[ind];
	}

	function jsToolBar_getItem(id) {
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i] == null)  continue;
			if (this.items[i].id == id) return this.items[i];
		}
		return null;
	}

	function jsToolBar_findItem(caption) {
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i] == null)  continue;
			if (this.items[i].caption == caption) return this.items[i];
		}
		return null;
	}

	function jsToolBar_deleteItem(obj) {
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i] == null)  continue;
			if (this.items[i] == obj || this.items[i].id == obj) {
				if (this.box) el = this.box.ownerDocument.getElementById('item_' + this.items[i].id);
				if (el) el.innerHTML = '';
				this.items[i] = null;
			}
		}
	}

	function jsToolBar_addLink(level, caption, url, target) {
		var ind = this.links.length;
		for (var i=0; i<ind; i++) { if (this.items[i] == null) { ind = i; break; } } // reuse delete elements
		this.links[ind] = new top.jsToolBarLink(level, caption, url, target);
		return this.links[ind];
	}

	function jsToolBar_show(obj) {
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i] == null)  continue;
			if (this.items[i] == obj || this.items[i].id == obj) {
				this.items[i].visible = true;
				this.items[i].refresh();
			}
		}
	}

	function jsToolBar_hide(obj) {
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i] == null)  continue;
			if (this.items[i] == obj || this.items[i].id == obj) {
				this.items[i].visible = false;
				this.items[i].refresh();
			}
		}
	}

	function jsToolBar_hideDrop(dropid) {
		if (top.dropGlobal) { 
			if (top.dropButton && top.dropButton.id != dropid) {
				top.dropButton.checked = false;
				top.dropButton.owner.refresh(top.dropButton.id);
			}
			top.dropGlobal.style.display = 'none'; 
			top.dropShadow.style.display = 'none';
			// reset
			top.dropGlobal = null;
			top.dropShadow = null;
			top.dropButton = null;
		}
	}

	function jsToolBar_enable(obj) {
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i] == null)  continue;
			if (this.items[i] == obj || this.items[i].id == obj) {
				this.items[i].disabled = false;
				this.items[i].refresh();
			}
		}
	}

	function jsToolBar_disable(obj) {
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i] == null)  continue;
			if (this.items[i] == obj || this.items[i].id == obj) {
				this.items[i].disabled = true
				this.items[i].refresh();
			}
		}
	}

	function jsToolBar_getLinks() {
		links  = '';
		for (var i=0; i<this.links.length; i++) {
			if (this.links[i].active) {
				links += this.links[i].caption;
			} else {
				links += '<a href="'+ this.links[i].url + '" target="'+ this.links[i].target +'">'+ this.links[i].caption + '</a>';
			}
			if (i < this.links.length-1) {
				if (parseInt(this.links[i].level) == parseInt(this.links[i+1].level)) 
					{ links += '<span style="color: gray"> | </span>'; } else { links += '<span style="color: gray"> > </span>'; }
			}
		}
		if (links == '') links = '&nbsp;';
		return links;
	}

	function jsToolBar_output() {
		if (!this.box) return;
		html  = '<table cellspacing="0" cellpadding="1" width="100%" style="'+ this.style +'"'+
				'><tr>';
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i] == null)  continue;
			addStyle = '';
			if (!this.items[i].visible) { addStyle += 'display: none;'; }
			if (this.items[i].disabled) { addStyle += '-moz-opacity: 0.2; opacity: 0.2; filter:alpha(opacity=20);'; }
			html += '<td id="item_'+ this.items[i].id +'" style="'+ addStyle +'" valign=middle>'+ this.items[i].getHTML() + '</td>';
		}
		html += '<td width="100%" id="'+ this.name +'_right" align="right">'+ this.rightHTML +'</td></tr>';
		html += '<tr><td colspan=100 class="tabs_toolbar_links" id="'+ this.name +'_links" style="display: '+ (this.showLinks ? '' : 'none') + '">'+ 
				this.getLinks() +'</td></tr>';
		html += '</table>';
		this.box.innerHTML = html;
		// -- refresh disabled items
		for (var i=0; i<this.items.length; i++) { if (this.items[i].disabled) this.disable(this.items[i]); }
	}

	function jsToolBar_refresh(id) {
		if (!this.box) return;
		if (id == null || id == undefined) {
			for (var i=0; i<this.items.length; i++) {
				var itm = this.items[i];
				if (itm == null || itm.id == undefined)  continue;
				var el = this.box.ownerDocument.getElementById('item_' + itm.id);
				if (el) {
					if (!itm.visible) el.style.display = 'none'; else el.style.display = '';
					if (itm.disabled) { el.style.MozOpacity = 0.2; el.style.opacity = 0.2; }
								 else { el.style.MozOpacity = 1; el.style.opacity = 1; }
					if (itm.type != 'html') el.innerHTML = itm.getHTML();
				}
			}
		} else {
			var itm = this.getItem(id);
			if (!itm) return;
			var el = this.box.ownerDocument.getElementById('item_'+itm.id);
			if (el) {
				if (!itm.visible) el.style.display = 'none'; else el.style.display = '';
				if (itm.disabled) { el.style.MozOpacity = 0.2; el.style.opacity = 0.2; }
							 else { el.style.MozOpacity = 1; el.style.opacity = 1; }
				el.innerHTML = itm.getHTML();
			}
		}
		this.refreshLinks();
	}

	function jsToolBar_itemOver(id) { 
		if (!this.box) return;
		var transparent;
		if (document.all) { transparent = '#62a241;'; } else { transparent = 'transparent'; }
		var it = this.getItem(id);
		if (!it.disabled) {
			var el = this.box.ownerDocument.getElementById('tab0_' + this.name + '_' + id);
			el.style.border = '1px solid #CECEC3';
			var el = this.box.ownerDocument.getElementById('tab1_'+ this.name + '_' + id);
			try {
				el.style.borderLeft      = '0px solid '+transparent;
				el.style.borderTop       = '0px solid '+transparent;
				el.style.borderRight     = '1px solid #E4E1D6';
				el.style.borderBottom    = '1px solid #E4E1D6';
				el.style.cssText 		+= 'filter: chroma(color=#62a241);';
			} catch (e) {}
		}
		if (it.type == 'drop') { clearTimeout(it.hideTimer); }
		// send event
		if (this.onItemOver) this.onItemOver(id);
	}

	function jsToolBar_itemOut(id) {
		if (!this.box) return;
		if (document.all) { transparent = '#62a241'; } else { transparent = 'transparent'; }
		var it = this.getItem(id);
		if (!it.disabled) {
			var el1 = this.box.ownerDocument.getElementById('tab0_' + this.name + '_' + id);
			var el2 = this.box.ownerDocument.getElementById('tab1_' + this.name + '_' + id);
			try {
				if (it.checked && (it.type == 'radio' || it.type == 'check' || it.type == 'drop')) {
					el1.style.border = '1px solid #CECEC3';
				} else {
					el1.style.border   = '1px solid '+transparent;
					el1.style.cssText += 'filter: chroma(color=#62a241)';
				}
				el2.style.borderLeft      = '0px solid '+transparent;
				el2.style.borderTop       = '0px solid '+transparent;
				el2.style.borderRight     = '1px solid '+transparent;
				el2.style.borderBottom    = '1px solid '+transparent;
				el2.style.cssText 		 += 'filter: chroma(color=#62a241)';
			} catch (e) {}		
		}
		if (it.type == 'drop') { // hide drop
			var hideDrop = new Function('var el  = top.elements[\''+ this.name + '\'];'+
										'var btn = el.getItem(\''+ id +'\'); '+
										'var tmp = document.getElementById(\'tab0_'+ this.name + '_' + id +'_drop\'); '+
										'if (btn) {'+
										'	btn.checked = false;'+
										'	btn.refresh();'+
										'}'+
										'el.hideDrop(\''+ id +'\'); '+
										'if (tmp) tmp.style.display = \'none\'; ');
			it.hideTimer = setTimeout(hideDrop, 400);
		}
		// send event
		if (this.onItemOut) this.onItemOver(id);
	}

	function jsToolBar_itemDown(id) {
		if (!this.box) return;
		if (document.all) { transparent = '#62a241'; } else { transparent = 'transparent'; }
		var it = this.getItem(id);
		if (!it.disabled) {
			try {
				var el = this.box.ownerDocument.getElementById('tab0_' + this.name + '_' + id);
				el.style.border = '1px solid #CECEC3';
				var el = this.box.ownerDocument.getElementById('tab1_' + this.name + '_' + id);
				el.style.borderLeft      = '1px solid #E3E0D5';
				el.style.borderTop       = '1px solid #E3E0D5';
				el.style.borderRight     = '0px solid '+transparent;
				el.style.borderBottom    = '0px solid '+transparent;
				el.style.backgroundColor = '#E6E5DE';
				el.style.cssText 		 += 'filter: chroma(color=#62a241)';
			} catch (e) {}
			// clear all drop time outs
			for (var i=0; i<this.items.length; i++) {
				var it = this.items[i];
				if (it.hideTimer) { clearTimeout(it.hideTimer); }
			}
			// send event
			if (it.onItemDown)   it.onItemDown();
			if (this.onItemDown) this.onItemDown(id);
		}
	}

	function jsToolBar_itemUp(id) {
		if (!this.box) return;
		if (document.all) { transparent = '#62a241'; } else { transparent = 'transparent'; }
		var it = this.getItem(id);
		if (!it.disabled) {
			var el1 = this.box.ownerDocument.getElementById('tab0_' + this.name + '_' + id);
			var el2 = this.box.ownerDocument.getElementById('tab1_' + this.name + '_' + id);
			try {
				el1.style.border 		  = '1px solid #CECEC3';
				el2.style.borderLeft      = '0px solid '+transparent;
				el2.style.borderTop       = '0px solid '+transparent;
				el2.style.borderRight     = '1px solid #E4E1D6';
				el2.style.borderBottom    = '1px solid #E4E1D6';
				el2.style.backgroundColor = transparent;
				el2.style.cssText 		 += 'filter: chroma(color=#62a241)';
			} catch(e) {}
			if (it.type == 'radio') {
				for (var i=0; i<this.items.length; i++) {
					itt = this.items[i];
					if (itt == null) continue;
					if (itt.id == it.id) continue;
					if (itt.type != 'radio') continue;
					if (itt.group == it.group && itt.checked) {
						this.items[i].checked = false;
						this.items[i].refresh();
					}
				}
				it.checked = true;
				el1.style.border = '1px solid #CECEC3';
				el2.style.backgroundColor = '#ffffff';
			}
			if (it.type == 'check' || it.type == 'drop') {
				it.checked = !it.checked;
				try {
					if (it.checked) {
						el2.style.backgroundColor = '#ffffff';
					} else {
						el2.style.backgroundColor = transparent;
						el.style.cssText 		 += 'filter: chroma(color=#62a241)';
					}
				} catch(e) {}
			}
			// send event
			if (it.onItemUp)   it.onItemUp(id);
			if (this.onItemUp) this.onItemDown(id);
			if (it.onClick)    it.onClick(id);
			if (this.onClick)  this.onClick(id);
		}
	}

	function jsToolBar_flushLinks() {
		this.links = [];
		this.refreshLinks();
	}

	function jsToolBar_refreshLinks() {
		html = this.getLinks();
		el = document.getElementById(this.name + '_links');
		if (!el) return;
		if (el.style.display == 'none' && this.showLinks) el.style.display = ''; 
		if (el.style.display == '' && !this.showLinks) el.style.display = 'none'; 
		el.innerHTML = html;
	}
}
if (top != window) top.jsToolBarLink = jsToolBarLink;
if (top != window) top.jsToolBarItem = jsToolBarItem;
if (top != window) top.jsToolBar = jsToolBar;
