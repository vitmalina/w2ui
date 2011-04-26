/**********************************************************************
*
* -- This the jsEditor class - inlne HTML Editor
*
***********************************************************************/

function jsEditor(name, box) {
	// -- public
	this.name 			= name;
	this.box			= box;
	this.buttons		= 'basic'; // basic or extanded
	this.showSource 	= false;
	this.currentFolder	= '';
	this.thumbSize		= 'small';
	this.charTab		= '&nbsp;&nbsp;&nbsp;&nbsp;';
	this.output			= jsEditor_output;
	this.resize			= jsEditor_resize;
	this.setHTML		= jsEditor_setHTML;
	this.addHTML		= jsEditor_addHTML;
	this.getHTML		= jsEditor_getHTML;
	this.toggleSource	= jsEditor_toggleSource;
	this.wordInsert 	= jsEditor_wordInsert;
	this.symbolInsert	= jsEditor_symbolInsert;
	this.imageInsert	= jsEditor_imageInsert;
	this.videoInsert	= jsEditor_videoInsert;
	
	// -- interval
	this.style_control	= "font-family: verdana; font-size: 11px; border: 1px solid silver; padding: 2px;";
	this.style_button	= "font-family: verdana; font-size: 11px; ";
	this.selFolder		= '';
	this.selFile		= '';
	this.selSize		= '120';
	this.source_editor  = null;
	this.source_height	= '150';
	this.init			= jsEditor_init;
	this.initCodeMirror = jsEditor_initCodeMirror;
	this.catchClick 	= jsEditor_catchClick;
	this.catchDblClick 	= jsEditor_catchDblClick;
	this.catchKeyDown   = jsEditor_catchKeyDown;
	this.tbAction		= jsEditor_tbAction;
	this.fontAction		= jsEditor_fontAction;
	this.syntaxAction	= jsEditor_syntaxAction;
	this.linkProps  	= jsEditor_linkProps;
	this.tableProps 	= jsEditor_tableProps;
	this.imageInsertIP	= jsEditor_imageInsertIP;
	this.imageProps 	= jsEditor_imageProps;
	this.imageTbAction	= jsEditor_imageTbAction;
	this.imageSelect	= jsEditor_imageSelect;
	this.videoProps 	= jsEditor_videoProps;
	this.closePopup		= jsEditor_closePopup;
	this.getDivs		= jsEditor_getDivs;
	this.setSource		= jsEditor_setSource;
	this.treeOpen		= jsEditor_treeOpen;
	this.treeClick		= jsEditor_treeClick;
	this.serverCall		= jsEditor_serverCall;

	// -- initialization
    if (!top.jsUtils) alert('The jsUtils class is not loaded. This class is a must for the jsEditor class.');
    if (!top.jsToolBar) alert('The jsToolBar class is not loaded. This class is a must for the jsEditor class.');
    if (!top.jsTree) alert('The jsTree class is not loaded. This class is a must for the jsEditor class.');
    if (!top.elements) top.elements = [];
	
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;
	
	/**********************************
	* --- IMPLEMENATION
	*/
	
	function jsEditor_getHTML() {
		if (!this.box) return;
		var editor = this.box.ownerDocument.getElementById(this.name+'_editor').contentDocument;
		if (!editor) return false;
		return editor.body.innerHTML;
	}

	function jsEditor_setHTML(html) {
		if (!this.box) return;
		var editor = this.box.ownerDocument.getElementById(this.name+'_editor').contentDocument;
		if (!editor) return false;
		editor.body.innerHTML = '';
		editor.write(html);
		return true;
	}

	function jsEditor_addHTML(html) {
		if (!this.box) return;
		var editor = this.box.ownerDocument.getElementById(this.name+'_editor').contentDocument;
		if (!editor) return false;
		editor.write(html);
		return true;
	}

	function jsEditor_output() {
		if (!this.box) return;
		// load scripts
		var script1 = this.box.ownerDocument.createElement('SCRIPT');
		script1.src = top.jsUtils.sys_path+'/includes/CodeMirror/js/codemirror.js';
		script1.onload = top.elements[this.name].initCodeMirror;
		var script2 = this.box.ownerDocument.createElement('SCRIPT');
		script2.src = top.jsUtils.sys_path+'/includes/CodeMirror/js/beautify.js';
		var link1   = this.box.ownerDocument.createElement('LINK');
		link1.href  = top.jsUtils.sys_path+'/images/editor.css';
		link1.rel	= 'stylesheet';
		this.box.ownerDocument.body.appendChild(script1);
		this.box.ownerDocument.body.appendChild(script2);
		this.box.ownerDocument.body.appendChild(link1);
		this.box.innerHTML = 
			'<div id="'+ this.name +'_tb" style="background-color: #d8e4f3; border-right: 2px solid #d8e4f3; width: 100%;"></div>'+
			'<iframe id="'+ this.name +'_editor" tabindex="-1" style="outline: none; background-color: white; width: 100%; height: 100%; border: 1px solid silver;"></iframe>'+
			'<div id="'+ this.name +'_tb_source" style="background-color: #f3f3f3; padding: 0px; height: 30px;"></div>'+
			'<div id="'+ this.name +'_source_txt"><textarea style="width: 100%; height: 10px; display: none;"></textarea></div>';
		this.init();
		this.resize();
	}

	function jsEditor_resize() {
		var width   	= parseInt(this.box.clientWidth);
		var height  	= parseInt(this.box.clientHeight);
		var main_tb 	= this.box.ownerDocument.getElementById(this.name+'_tb');
		var editor		= this.box.ownerDocument.getElementById(this.name+'_editor');
		var source_tb	= this.box.ownerDocument.getElementById(this.name+'_tb_source');
		var source		= this.box.ownerDocument.getElementById(this.name+'_source');
		if (!this.showSource) source_tb.style.display = 'none';
		// calc height
		editor.style.height = height - 30 - (this.showSource ? parseInt(this.source_height) + 30 : -2);
		if (this.showSource && source) {
			source_tb.nextSibling.nextSibling.style.height = this.source_height;
			CodeMirror.height 		= this.source_height; 
			source.style.height 	= this.source_height; 
		}
	}

	function jsEditor_initCodeMirror() {
		var obj = top.elements[top.tmp_editor];
		// -- code mirror
		obj.source_editor = CodeMirror.fromTextArea(obj.name+'_source_txt', {
			height: "1px",
			iframeId: obj.name+'_source',
			parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
			stylesheet: [top.jsUtils.sys_path+"/includes/CodeMirror/css/xmlcolors.css", 
						 top.jsUtils.sys_path+"/includes/CodeMirror/css/jscolors.css", 
						 top.jsUtils.sys_path+"/includes/CodeMirror/css/csscolors.css"],
			path: top.jsUtils.sys_path+"/includes/CodeMirror/js/"
		});
		// -- show/hide initially
		obj.toggleSource(obj.showSource);
		if (obj.showSource) {
			obj.toolbar.items[17].checked = obj.showSource;
			obj.toolbar.items[17].refresh();
		}
		obj.resize();
	}

	function jsEditor_init() {
		if (!this.box) return;
		var editor = this.box.ownerDocument.getElementById(this.name+'_editor').contentDocument;
		// -- turn editor on
		if (editor) { 
			editor.write('<br>');
			editor.body.contentEditable = true;
			editor.body.focus();
			top.tmp_editor = this.name;
			editor.body.addEventListener('mouseup', top.elements[this.name].catchClick, false);	
			editor.body.addEventListener('dblclick', top.elements[this.name].catchDblClick, false);	
			editor.body.addEventListener('keydown', top.elements[this.name].catchKeyDown, false);	
		}	
		// -- get toolbar
		top.elements[this.name+'_tb'] = null;
		if (!top.elements[this.name+'_tb']) {
			var img = top.jsUtils.sys_path+'/includes/silk/icons/';
			
			// -- paragraph
			var tmp1 = 'style="margin: 0px; padding: 0px; position: relative; top: -2px; margin-right: 2px; float: left;"';
			var tmp2 = "style=\"padding-left: 10px; padding-right: 10px;\" onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" "+
					   "	onmouseout=\"this.style.backgroundColor = '';\" onclick=\"top.elements['"+this.name+"'].fontAction(top.jsUtils.stripTags(this.innerHTML), 'head');\"";
			var paragraph_html = '<table cellpadding=4 cellspacing=0 style="padding-top: 5px; background-color: #f4f4fe; font-family: verdana; font-size: 11px;\">'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_smallcaps.png">Normal</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_heading_1.png">Header 1</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_heading_2.png">Header 2</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_heading_3.png">Header 3</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_heading_4.png">Header 4</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'comment.png">Quote</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_signature.png">Address</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'page_white_code.png">Pre</td></tr>'+
				'</table>';
				
			// -- fonts
			var fonts = ['Arial', 'Comic Sans MS', 'Courier New', 'Franklin Gothic Medium', 
						 'Garamond', 'Georgia', 'Impact', 'Kartika', 'Microsoft Sans Serif', 'Verdana', 'Tahoma', 'Times New Roman'];
			var fonts_html = "<table celpadding=3 cellspacing=0 style=\"padding-top: 5px; font-size: 13px; color: black; background-color: #f4f4fe;\">";
			for (f in fonts) { 
				fonts_html += "<tr><td style=\"padding-left: 10px; padding-right: 10px; font-family: "+ fonts[f] +";\" "+
							  " onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" onmouseout=\"this.style.backgroundColor = '';\" "+
							  " onclick=\"top.elements['"+ this.name +"'].fontAction(this.innerHTML, 'font')\">"+ fonts[f] +"</td></tr>"; 
			}	
			fonts_html += "<tr><td><input style=\"margin: 5px 9px 5px 9px; font-size: 11px; "+
						  "	 border: 1px solid #e9e9f5; background-color: #fbfbfc; padding: 2px; width: 140px;\" "+
						  "  type=text onchange=\"top.elements['"+ this.name +"'].fontAction(this.value, 'font')\"></td></tr>";
			fonts_html += "</table>";		
			
			// -- font size
			var sizes = ['8px', '9px', '10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '28px', '36px', '44px', '52px'];
			var fonts_size = "<table cellpadding=3 cellspacing=0 style=\"padding-top: 5px; font-size: 13px; font-family: verdana; color: black; background-color: #f4f4fe;\">";
			for (s in sizes) { 
				fonts_size += "<tr><td style=\"padding-left: 10px; padding-right: 10px; font-size: 11px;\" "+
							  " onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" onmouseout=\"this.style.backgroundColor = '';\" "+
							  " onclick=\"top.elements['"+ this.name +"'].fontAction('"+ sizes[s] +"', 'size')\">"+ sizes[s] +"</td></tr>";
							  " onclick=\"top.elements['"+ this.name +"'].fontAction('"+ sizes[s] +"', 'size')\">"+ sizes[s] +"</td></tr>";
			}
			fonts_size += "<tr><td><input style=\"margin: 1px 5px 3px 5px; font-size: 11px; "+
						  "	 border: 1px solid #e9e9f5; background-color: #fbfbfc; padding: 2px; width: 32px;\" "+
						  "  type=text onchange=\"top.elements['"+ this.name +"'].fontAction(this.value, 'size')\"></td></tr>";
			fonts_size += "</table>";
			
			// -- colors
			var colors = [['rgb(255, 255, 255)', 'rgb(204, 204, 204)', 'rgb(192, 192, 192)', 'rgb(153, 153, 153)', 'rgb(102, 102, 102)', 'rgb(51, 51, 51)', 'rgb(0, 0, 0)'],
				  ['rgb(255, 204, 204)', 'rgb(255, 102, 102)', 'rgb(255, 0, 0)', 'rgb(204, 0, 0)', 'rgb(153, 0, 0)', 'rgb(102, 0, 0)', 'rgb(51, 0, 0)'],
				  ['rgb(255, 204, 153)', 'rgb(255, 153, 102)', 'rgb(255, 153, 0)', 'rgb(255, 102, 0)', 'rgb(204, 102, 0)', 'rgb(153, 51, 0)', 'rgb(102, 51, 0)'],
				  ['rgb(255, 255, 153)', 'rgb(255, 255, 102)', 'rgb(255, 204, 102)', 'rgb(255, 204, 51)', 'rgb(204, 153, 51)', 'rgb(153, 102, 51)', 'rgb(102, 51, 51)'],
				  ['rgb(255, 255, 204)', 'rgb(255, 255, 51)', 'rgb(255, 255, 0)', 'rgb(255, 204, 0)', 'rgb(153, 153, 0)', 'rgb(102, 102, 0)', 'rgb(51, 51, 0)'],
				  ['rgb(153, 255, 153)', 'rgb(102, 255, 153)', 'rgb(51, 255, 51)', 'rgb(51, 204, 0)', 'rgb(0, 153, 0)', 'rgb(0, 102, 0)', 'rgb(0, 51, 0)'],
				  ['rgb(153, 255, 255)', 'rgb(51, 255, 255)', 'rgb(102, 204, 204)', 'rgb(0, 204, 204)', 'rgb(51, 153, 153)', 'rgb(51, 102, 102)', 'rgb(0, 51, 51)'],
				  ['rgb(204, 255, 255)', 'rgb(102, 255, 255)', 'rgb(51, 204, 255)', 'rgb(51, 102, 255)', 'rgb(51, 51, 255)', 'rgb(0, 0, 153)', 'rgb(0, 0, 102)'],
				  ['rgb(204, 204, 255)', 'rgb(153, 153, 255)', 'rgb(102, 102, 204)', 'rgb(102, 51, 255)', 'rgb(102, 0, 204)', 'rgb(51, 51, 153)', 'rgb(51, 0, 153)'],
				  ['rgb(255, 204, 255)', 'rgb(255, 153, 255)', 'rgb(204, 102, 204)', 'rgb(204, 51, 204)', 'rgb(153, 51, 153)', 'rgb(102, 51, 102)', 'rgb(51, 0, 51)']];
			var fcolor = '<table cellpadding=1 cellspacing=0 style="background-color: #f4f4fe;\">';
			for (var i=0; i<9; i++) {
				fcolor += '<tr>';
				for (var j=0; j<7; j++) {
					fcolor += '<td><div onclick="top.elements[\''+ this.name +'\'].fontAction(\''+ colors[i][j] +'\', \'color\')" '+
							  ' onmouseover="this.style.cssText += \'border: 1px solid black;\'" onmouseout="this.style.cssText += \'border: 1px solid silver;\'" '+
							  '	style="padding: 1px margin: 1px; border: 1px solid silver; width: 16px; height: 16px; background-color: '+ colors[i][j] +'">&nbsp;</div></td>';
				}
				fcolor += '</tr>';
			}
			fcolor += "<tr><td colspan=3><input onkeyup=\"document.getElementById('fcolor_preview').style.backgroundColor = this.value;\" "+
					  "style=\"margin: 3px 1px 3px 1px; font-size: 11px; border: 1px solid #e9e9f5; background-color: #fbfbfc; padding: 2px; width: 58px;\" "+
					  "  type=text onchange=\"top.elements['"+ this.name +"'].fontAction(this.value, 'color')\"></td>"+
					  "<td colspan=4><div id=\"fcolor_preview\" style=\"padding: 1px margin: 1px; margin-top: 0px; width: 75px; height: 16px;\">&nbsp;</div></td>"+
					  "</tr>";
			fcolor += '</table>';
			var bcolor = '<table cellpadding=1 cellspacing=0 style="background-color: #f4f4fe;\">';
			for (var i=0; i<9; i++) {
				bcolor += '<tr>';
				for (var j=0; j<7; j++) {
					bcolor += '<td><div onclick="top.elements[\''+ this.name +'\'].fontAction(\''+ colors[i][j] +'\', \'bgcolor\')" '+
							  ' onmouseover="this.style.cssText += \'border: 1px solid black;\'" onmouseout="this.style.cssText += \'border: 1px solid silver;\'" '+
							  '	style="padding: 1px margin: 1px; border: 1px solid silver; width: 16px; height: 16px; background-color: '+ colors[i][j] +'">&nbsp;</div></td>';
				}
				bcolor += '</tr>';
			}
			bcolor += "<tr><td colspan=3><input onkeyup=\"document.getElementById('bcolor_preview').style.backgroundColor = this.value;\" "+
					  "style=\"margin: 3px 1px 3px 1px; font-size: 11px; border: 1px solid #e9e9f5; background-color: #fbfbfc; padding: 2px; width: 58px;\" "+
					  "  type=text onchange=\"top.elements['"+ this.name +"'].fontAction(this.value, 'bgcolor')\"></td>"+
					  "<td colspan=4><div id=\"bcolor_preview\" style=\"padding: 1px margin: 1px; margin-top: 0px; width: 75px; height: 16px;\">&nbsp;</div></td>"+
					  "</tr>";
			bcolor += '</table>';
			
			// -- paragraph align
			var tmp1 = 'style="margin: 0px; padding: 0px; position: relative; top: -2px; margin-right: 2px; float: left;"';
			var tmp2 = "style=\"padding-left: 10px; padding-right: 10px;\" onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" "+
					   "	onmouseout=\"this.style.backgroundColor = '';\" onclick=\"top.elements['"+this.name+"'].fontAction(top.jsUtils.stripTags(this.innerHTML), 'para');\"";
			var paragraph2_html = '<table cellpadding=4 cellspacing=0 style="padding-top: 5px; background-color: #f4f4fe; font-family: verdana; font-size: 11px;\">'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_align_left.png">Left</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_align_center.png">Center</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_align_right.png">Right</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_align_justify.png">Justify</td></tr>'+
				'</table>';
				
			// -- lists
			var tmp1 = 'style="margin: 0px; padding: 0px; position: relative; top: -2px; margin-right: 2px; float: left;"';
			var tmp2 = "style=\"padding-left: 10px; padding-right: 10px;\" onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" "+
					   "	onmouseout=\"this.style.backgroundColor = '';\" onclick=\"top.elements['"+this.name+"'].fontAction(top.jsUtils.stripTags(this.innerHTML), 'list');\"";
			var list_html = '<table cellpadding=4 cellspacing=0 style="padding-top: 5px; background-color: #f4f4fe; font-family: verdana; font-size: 11px;\">'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_list_bullets.png">Bullets</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_list_numbers.png">Numbers</td></tr>'+
				'</table>';

			// -- paragraph
			var tmp1 = 'style="margin: 0px; padding: 0px; position: relative; top: -2px; margin-right: 2px; float: left;"';
			var tmp2 = "style=\"padding-left: 10px; padding-right: 10px;\" onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" "+
					   "	onmouseout=\"this.style.backgroundColor = '';\" onclick=\"top.elements['"+this.name+"'].fontAction(top.jsUtils.stripTags(this.innerHTML), 'linespacing');\"";
			var tmp3 = "style=\"padding-left: 10px; padding-right: 10px;\" onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" "+
					   "	onmouseout=\"this.style.backgroundColor = '';\" onclick=\"top.elements['"+this.name+"'].fontAction(top.jsUtils.stripTags(this.innerHTML), 'letterspacing');\"";
			var line_html = '<table cellpadding=4 cellspacing=0 style="padding-top: 5px; background-color: #f4f4fe; font-family: verdana; font-size: 11px;\">'+
				'<tr><td style=\"padding-left: 10px; padding-right: 10px;\"><b>Line Height</b></td></tr>'+
				'<tr><td '+tmp2+'>&nbsp;&nbsp;90%</td></tr>'+
				'<tr><td '+tmp2+'>&nbsp;&nbsp;100%</td></tr>'+
				'<tr><td '+tmp2+'>&nbsp;&nbsp;125%</td></tr>'+
				'<tr><td '+tmp2+'>&nbsp;&nbsp;150%</td></tr>'+
				'<tr><td '+tmp2+'>&nbsp;&nbsp;200%</td></tr>'+
				"<tr><td><input style=\"margin: 0px 5px 3px 12px; font-size: 11px; "+
						  "	 border: 1px solid #e9e9f5; background-color: #fbfbfc; padding: 2px; width: 40px;\" "+
						  "  type=text onchange=\"top.elements['"+this.name+"'].fontAction(this.value, 'linespacing');\"></td></tr>"+
				'<tr><td style=\"padding-left: 10px; padding-right: 10px;\"><b>Letter Spacing</b></td></tr>'+
				'<tr><td '+tmp3+'>&nbsp;&nbsp;0px</td></tr>'+
				'<tr><td '+tmp3+'>&nbsp;&nbsp;1px</td></tr>'+
				'<tr><td '+tmp3+'>&nbsp;&nbsp;2px</td></tr>'+
				'<tr><td '+tmp3+'>&nbsp;&nbsp;3px</td></tr>'+
				'<tr><td '+tmp3+'>&nbsp;&nbsp;4px</td></tr>'+
				"<tr><td><input style=\"margin: 0px 5px 3px 12px; font-size: 11px; "+
						  "	 border: 1px solid #e9e9f5; background-color: #fbfbfc; padding: 2px; width: 40px;\" "+
						  "  type=text onchange=\"top.elements['"+this.name+"'].fontAction(this.value, 'letterspacing');\"></td></tr>"+
				'</table>';
				
			// -- underline
			var tmp1 = 'style="margin: 0px; padding: 0px; position: relative; top: -2px; margin-right: 2px; float: left;"';
			var tmp2 = "style=\"padding-left: 10px; padding-right: 10px;\" onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" "+
					   "	onmouseout=\"this.style.backgroundColor = '';\" onclick=\"top.elements['"+this.name+"'].fontAction(top.jsUtils.stripTags(this.innerHTML), 'extra');\"";
			var extra_html = '<table cellpadding=4 cellspacing=0 style="padding-top: 5px; background-color: #f4f4fe; font-family: verdana; font-size: 11px;\">'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_underline.png">Underline</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_strikethrough.png">Strikethrough</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_subscript.png">Subscript</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_superscript.png">Superscript</td></tr>'+
				'</table>';
			
			// -- insert
			var tmp1 = 'style="margin: 0px; padding: 0px; position: relative; top: -2px; margin-right: 2px; float: left;"';
			var tmp2 = "style=\"padding-left: 10px; padding-right: 10px;\" onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" "+
					   "	onmouseout=\"this.style.backgroundColor = '';\" onclick=\"top.elements['"+this.name+"'].fontAction(top.jsUtils.stripTags(this.innerHTML), 'insert');\"";
			var insert_html = '<table cellpadding=4 cellspacing=0 style="padding-top: 5px; background-color: #f4f4fe; font-family: verdana; font-size: 11px;\">'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_letter_omega.png">Symbol</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'table.png">Table</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'picture.png">Image</td></tr>'+
				//'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'television.png">Video</td></tr>'+
				'</table>';
				
			var tb = new top.jsToolBar(this.name+'_tb', null);
			var drop = 
				"<div style='position: absolute;'>"+
				"	<div style='position: relative; margin-top: 14px; margin-left: 10px;'>"+
				"		<div id='"+this.name+"_drop' style='padding: 3px; display: none; position: absolute; z-Index: 100; "+
				"				background-color: #f4f4fe; border: 1px solid silver; border-top: 0px;'></div>"+
				"	</div>"+
				"</div>";
			
			tb.addHTML(drop);
			tb.addButton('', top.jsUtils.sys_path+'/images/undo.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Undo', 0);
			tb.addButton('', top.jsUtils.sys_path+'/images/redo.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Redo', 0);
			tb.addBreak();
			tb.addDrop('<img src="'+img+'text_smallcaps.png">', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Paragraph', paragraph_html);
			tb.addDrop('Times New Roman', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Text font', fonts_html);
			tb.addDrop('16px', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Text size', fonts_size);
			tb.addBreak();
			tb.addCheck('', img+'text_bold.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Bold');
			tb.addCheck('', img+'text_italic.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Italic');
			tb.addDrop('<img src="'+img+'text_strikethrough.png">', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Extra formating', extra_html);
			tb.addBreak();
			tb.addDrop('<div id=font_color style="color: black; width: 16px; height: 13px; font-weight: bold;">Aa</div>', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Text color', fcolor);
			tb.addDrop('<div id=bg_color style="border: 1px solid silver; margin-top: 1px; background-color: white; width: 12px; height: 12px;">&nbsp;</div>', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Background color', bcolor);
			tb.addBreak();
			tb.addButton('', img+'page_white_word.png', Function("top.elements['"+this.name+"'].wordInsert()"), 'Paste from Word');
			tb.addButton('', img+'pencil_delete.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Clear text formating');
			tb.addCheck('', img+'html.png', Function("top.elements['"+this.name+"'].toggleSource()"), 'Show HTML source');
			tb.addBreak();
			tb.addDrop('<img src="'+img+'text_align_left.png">', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Paragraph alignment', paragraph2_html);
			tb.addDrop('<img src="'+img+'text_linespacing.png">', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Text options', line_html);
			tb.addDrop('<img src="'+img+'text_list_bullets.png">', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'List', list_html);
			tb.addBreak();
			tb.addButton('', img+'text_indent.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Indent text');
			tb.addButton('', img+'text_indent_remove.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Remove text indent');
			tb.addBreak();
			tb.addButton('', img+'link.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Create a link');
			tb.addButton('', img+'link_break.png', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Remove links');
			tb.addBreak();
			tb.addDrop('<img src="'+img+'lightning.png">', '', Function("top.elements['"+this.name+"'].tbAction(this.id)"), 'Insert an object', insert_html);
			this.toolbar = tb;
		}
		// hide/show buttons
		if (this.buttons == 'basic') {
			this.toolbar.items[1].visible = false;
			this.toolbar.items[2].visible = false;
			this.toolbar.items[3].visible = false;
			this.toolbar.items[10].visible = false;
			this.toolbar.items[15].visible = false;
			this.toolbar.items[17].visible = false;
			this.toolbar.items[20].visible = false;
			this.toolbar.items[23].visible = false;
			this.toolbar.items[24].visible = false;
			this.toolbar.items[25].visible = false;
			this.toolbar.items[28].visible = false;
			this.toolbar.items[29].visible = false;
		}
		var el = this.box.ownerDocument.getElementById(this.name+'_tb');
		if (el) { top.elements[this.name+'_tb'].box = el; top.elements[this.name+'_tb'].output(); }
		
		// source toolbar
		if (!top.elements[this.name+'_tb_source']) {
			top.elements[this.name+'_tb_source'] = null;
			var tb = new top.jsToolBar(this.name+'_tb_source', null);
			
			// -- syntax highlight
			var tmp1 = 'style="margin: 0px; padding: 0px; position: relative; top: -2px; margin-right: 2px; float: left;"';
			var tmp2 = "style=\"padding-left: 10px; padding-right: 10px;\" onmouseover=\"this.style.backgroundColor = '#d8e4f3';\" "+
					   "	onmouseout=\"this.style.backgroundColor = '';\" onclick=\"top.elements['"+this.name+"'].syntaxAction(top.jsUtils.stripTags(this.innerHTML));\"";
			var syntax_html = '<table cellpadding=4 cellspacing=0 style="padding-top: 5px; background-color: #f4f4fe; font-family: verdana; font-size: 11px;\">'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'text_indent.png">Indent All</td></tr>'+
				'<tr><td '+tmp2+'><img '+tmp1+' src="'+img+'page_white_ruby.png">Beautify All</td></tr>'+
				'</table>';

			tb.addButton('', top.jsUtils.sys_path+'/images/undo.png', Function("top.elements['"+this.name+"'].syntaxAction('undo')"), 'Undo', 0);
			tb.addButton('', top.jsUtils.sys_path+'/images/redo.png', Function("top.elements['"+this.name+"'].syntaxAction('redo')"), 'Redo', 0);
			tb.addBreak();
			tb.addDrop('Syntax', img+'tag.png', null, 'Syntax highliting', syntax_html);
			tb.addButton('Apply', img+'tick.png', Function("top.elements['"+this.name+"'].syntaxAction('apply')"), 'Apply back to the document');
			tb.addBreak();
			tb.addHTML('<div id=source_tree></div>');
			
			this.tb_source = tb;
		}
		var el = this.box.ownerDocument.getElementById(this.name+'_tb_source');
		if (el) { top.elements[this.name+'_tb_source'].box = el; top.elements[this.name+'_tb_source'].output(); }
		this.resize();
	}

	function jsEditor_tbAction(cmd) {
		if (!this.box) return;
		var sel    = this.box.ownerDocument.getElementById(this.name+'_editor').contentWindow.getSelection();
		var editor = this.box.ownerDocument.getElementById(this.name+'_editor').contentDocument;
		var but = top.elements[this.name+'_tb'].getItem(cmd);
		switch (but.hint) {
			case 'Undo': // paragraph
				editor.execCommand('undo', false, null);
				break;
			case 'Redo': // quote
				editor.execCommand('redo', false, null);
				break;
			case 'Bold': // bold
				if (sel == '') { // no selection
					if (!top.editor_focusElem) return;
					if (top.editor_focusElem.style.fontWeight == 'bold') {
						top.editor_focusElem.style.fontWeight = '';
					} else {
						top.editor_focusElem.style.fontWeight = 'bold';
					}
				} else {
					editor.execCommand('bold', false, null);
				}
				break;
			case 'Italic': // italic
				if (sel == '') { // no selection
					if (!top.editor_focusElem) return;
					if (top.editor_focusElem.style.fontStyle == 'italic') {
						top.editor_focusElem.style.fontStyle = '';
					} else {
						top.editor_focusElem.style.fontStyle = 'italic';
					}
				} else {
					editor.execCommand('italic', false, null);
				}
				break;
			case 'Clear text formating': // clear formating
				if (sel == '') { // no selection
					if (!top.editor_focusElem) return;
					top.editor_focusElem.style.cssText = '';
				} else {
					editor.execCommand('removeFormat', false, null);
				}
				break;
			case 'Indent text': // indent
				editor.execCommand('indent', false, null);
				break;
			case 'Remove text indent': // outdent
				editor.execCommand('outdent', false, null);
				break;
			case 'Create a link': // link
				var link = prompt('Please type a link:', 'http://');
				editor.execCommand('createLink', false, link);
				break;
			case 'Remove links': // unlink
				editor.execCommand('unlink', false, null);
				break;
		}
		editor.body.focus();
	}

	function jsEditor_fontAction(el, cmd) {
		if (!this.box) return;
		top.elements[this.name+'_tb'].hideDrop();
		var img    = top.jsUtils.sys_path+'/includes/silk/icons/';
		var sel    = this.box.ownerDocument.getElementById(this.name+'_editor').contentWindow.getSelection();
		var editor = this.box.ownerDocument.getElementById(this.name+'_editor').contentDocument;
		switch (cmd) {
			case 'font': 
				if (sel == '') { // no selection
					if (!top.editor_focusElem) return;
					top.editor_focusElem.style.fontFamily = el;
				} else {
					editor.execCommand('fontName', false, el);
				}
				top.elements[this.name+'_tb'].items[5].caption = el;
				top.elements[this.name+'_tb'].items[5].refresh();
				break;
			case 'size': 
				if (sel == '') { // no selection
					if (!top.editor_focusElem) return;
					top.editor_focusElem.style.cssText += 'font-size: '+el;
				} else { // tricky to set px instead of pt
					//editor.execCommand('fontName', false, 'Arial');
					//top.editor_focusElem.firstChild.fontFamily = 'inherit';
					//top.editor_focusElem.firstChild.fontSize	= el;
				}
				top.elements[this.name+'_tb'].items[6].caption = el;
				top.elements[this.name+'_tb'].items[6].refresh();
				break;
			case 'color': 
				if (sel == '') { // no selection
					if (!top.editor_focusElem) return;
					top.editor_focusElem.style.color = el;
				} else {
					editor.execCommand('foreColor', false, el);
				}
				top.elements[this.name+'_tb'].items[12].caption = '<div id=font_color style="color: '+el+'; width: 16px; height: 13px; font-weight: bold;">Aa</div>';
				top.elements[this.name+'_tb'].items[12].refresh();		
				break;
			case 'bgcolor': 
				if (sel == '') { // no selection
					if (!top.editor_focusElem) return;
					top.editor_focusElem.style.backgroundColor = el;
				} else {
					editor.execCommand('hiliteColor', false, el);
				}
				top.elements[this.name+'_tb'].items[13].caption = '<div id=bg_color style="border: 1px solid silver; margin-top: 1px; background-color: '+el+'; width: 12px; height: 12px;">&nbsp;</div>';
				top.elements[this.name+'_tb'].items[13].refresh();		
				break;
			case 'head': // paragraph
				if (el == 'Normal')	  { editor.execCommand('insertParagraph', false, null); tmp = 'text_smallcaps.png'; }
				if (el == 'Quote')    { editor.execCommand('formatBlock', false, '<blockquote>'); tmp = 'comment.png'; }
				if (el == 'Address')  { editor.execCommand('formatBlock', false, '<address>'); tmp = 'text_signature.png'; }
				if (el == 'Pre')      { editor.execCommand('formatBlock', false, '<pre>'); tmp = 'page_white_code.png'; }
				if (el == 'Header 1') { editor.execCommand('formatBlock', false, '<h1>'); tmp = 'text_heading_1.png'; }
				if (el == 'Header 2') { editor.execCommand('formatBlock', false, '<h2>'); tmp = 'text_heading_2.png'; }
				if (el == 'Header 3') { editor.execCommand('formatBlock', false, '<h3>'); tmp = 'text_heading_3.png'; }
				if (el == 'Header 4') { editor.execCommand('formatBlock', false, '<h4>'); tmp = 'text_heading_4.png'; }
				top.elements[this.name+'_tb'].items[4].caption = '<img src="'+ img + tmp +'">';
				top.elements[this.name+'_tb'].items[4].refresh();		

				break;			
			case 'para': // alignment
				if (el == 'Left')	  editor.execCommand('justifyLeft', false, null);
				if (el == 'Right')	  editor.execCommand('justifyRight', false, null);
				if (el == 'Center')	  editor.execCommand('justifyCenter', false, null);
				if (el == 'Justify')  editor.execCommand('justifyFull', false, null);
				top.elements[this.name+'_tb'].items[19].caption = '<img src="'+ img +'text_align_'+ el.toLowerCase() +'.png">';
				top.elements[this.name+'_tb'].items[19].refresh();	
				break;
			case 'list': // lists
				if (el == 'Bullets')  editor.execCommand('insertUnorderedList', false, null);
				if (el == 'Numbers')  editor.execCommand('insertOrderedList', false, null);
				top.elements[this.name+'_tb'].items[21].caption = '<img src="'+ img +'text_list_'+ el.toLowerCase() +'.png">';
				top.elements[this.name+'_tb'].items[21].refresh();	
				break;
			case 'extra': // extra formating		
				if (el == 'Underline')  	editor.execCommand('underline', false, null);
				if (el == 'Strikethrough')  editor.execCommand('strikethrough', false, null);
				if (el == 'Superscript')  	editor.execCommand('superscript', false, null);
				if (el == 'Subscript')  	editor.execCommand('subscript', false, null);
				break;
			case 'linespacing':
				if (!top.editor_focusElem) return;
				el = el.replace('&nbsp;', '')
				el = el.replace('&nbsp;', '')
				top.editor_focusElem.style.lineHeight = el;
				break;
			case 'letterspacing':
				if (!top.editor_focusElem) return;
				el = el.replace('&nbsp;', '')
				el = el.replace('&nbsp;', '')
				top.editor_focusElem.style.letterSpacing = el;
				break;
			case 'insert':
				if (el == 'Symbol') this.symbolInsert();
				if (el == 'Table') {
					var i = 1;
					while (true) {
						if (!editor.getElementById('table'+i)) break;
						i++;
					}
					editor.execCommand('insertHTML', false, 
						'<style id="table'+i+'_style">td { border: 1px solid silver; }</style>'+
						'<table id="table'+i+'" style="border-collapse: collapse; empty-cells: show; width: 80px; height: 40px;">'+
						'<tr><td></td><td></td></tr>'+
						'<tr><td></td><td></td></tr>'+
						'</table>');
				}
				if (el == 'Image') this.imageInsert();
				break;			
		}
		editor.body.focus();
	}

	function jsEditor_syntaxAction(cmd) {
		var obj = top.elements[top.tmp_editor];
		obj.tb_source.hideDrop();
		//
		switch (cmd) {
			case 'undo':
				obj.source_editor.undo();
				obj.tb_source.items[0].disabled = false;
				obj.tb_source.items[1].disabled = false;
				if (obj.source_editor.historySize().undo == 0) obj.tb_source.items[0].disabled = true;
				if (obj.source_editor.historySize().redo == 0) obj.tb_source.items[1].disabled = true;
				obj.tb_source.items[0].refresh();
				obj.tb_source.items[1].refresh();
				break;
			case 'redo':
				obj.source_editor.redo();
				obj.tb_source.items[0].disabled = false;
				obj.tb_source.items[1].disabled = false;
				if (obj.source_editor.historySize().undo == 0) obj.tb_source.items[0].disabled = true;
				if (obj.source_editor.historySize().redo == 0) obj.tb_source.items[1].disabled = true;
				obj.tb_source.items[0].refresh();
				obj.tb_source.items[1].refresh();
				break;
			case 'Indent All': 
				obj.source_editor.reindent();
				break;			
			case 'Beautify All':
				obj.source_editor.setCode(beautify_mixed(obj.source_editor.getCode()));
				break;
			case 'apply':
				var source = top.jsUtils.trim(obj.source_editor.getCode());
				var pos1 = source.indexOf(' ');
				var pos2 = source.indexOf('>');
				if (pos2 < pos1) pos1 = pos2;
				var tag1 = '<'+source.substr(1, pos1-1)+">";
				var tag2 = '</'+source.substr(1, pos1-1)+">";
				alert(tag2);
				if (source.substr(source.length - tag2.length) != tag2) {
					alert('You are editing '+ tag1 +' element. Your code needs to end with '+ tag2 +'.'+source.substr(source.length - tag2.length));
					break;
				}
				var innerHTML = source.substr(pos2+1, source.length-tag2.length-pos2-1);
				// attributes
				var pos1 = source.indexOf(' ');
				var pos2 = source.indexOf('>');
				if (pos1 < pos2) {
					var attributes = top.jsUtils.trim(source.substr(pos1+1, pos2-pos1-1));
					var attr = [];
					var i = 0;
					while (true) {
						i++; if (i>10) break;
						var pos1 = attributes.indexOf('="');
						var pos2 = attributes.indexOf("='");
						var pos3 = attributes.indexOf("=");
						if (pos1 == -1 && pos2 == -1 && pos3 != -1) { alert('All attributes inside the tag '+ tag1 +' need to be enclosed into single or double quotes.'); break; }
						if (pos1 == -1 && pos2 == -1) break;
						// -- get it
						if (pos1 != -1 && (pos1 < pos2 || pos2 == -1)) {
							pos3 = attributes.indexOf('"', pos1+2);
							n = attributes.substr(0, pos1)
							a = attributes.substr(pos1+2, pos3-pos1-2);
							attributes = top.jsUtils.trim(attributes.replace(n+'="'+a+'"', ''));
						}
						if (pos2 != -1 && (pos2 < pos1 || pos1 == -1)) {
							pos3 = attributes.indexOf("'", pos2+2);
							n = attributes.substr(0, pos2)
							a = attributes.substr(pos2+2, pos3-pos2-2);
							attributes = top.jsUtils.trim(attributes.replace(n+"='"+a+"'", ''));
						}
						attr[n] = a;
					}
				}
				// -- delete old attribure
				var tmp = top.editor_focusElem;
				for (var i = 0; i < tmp.attributes.length; i++) {
					if (tmp.attributes[i].name == '_moz_dirty') continue;
					if (tmp.attributes[i].name == '_moz_resizing') continue;
					if (tmp.attributes[i].name == 'contenteditable') continue;					
					tmp.setAttribute(tmp.attributes[i].name, null);
					tmp.removeAttributeNode(tmp.getAttributeNode(tmp.attributes[i].name)); 
				}
				tmp.style.cssText = null;
				tmp.removeAttributeNode(tmp.getAttributeNode('style')); 
				
				// -- apply attributes
				for (n in attr) {
					if (String(n).toLowerCase() == 'style') {
						top.editor_focusElem.style.cssText = attr[n];
					} else {
						top.editor_focusElem.setAttribute(n, attr[n]);
					}
				}
				// -- apply innerHTML
				top.editor_focusElem.innerHTML = innerHTML;
				break;
		}
	}

	function jsEditor_catchDblClick(evt) {
		var img = top.jsUtils.sys_path+'/includes/silk/icons/';
		var focusElem = evt.target ? evt.target : evt.srcElement;
		var sel = focusElem.ownerDocument.defaultView.getSelection();
		top.editor_focusElem = focusElem;
		// --
		var obj = top.elements[top.tmp_editor];
	}

	function jsEditor_catchKeyDown(evt) {
		var obj = top.elements[top.tmp_editor];
		var editor = obj.box.ownerDocument.getElementById(obj.name+'_editor').contentDocument;
		// -- prevent tab
		if (evt.keyCode == 9) { 
			evt.preventDefault(); 
			evt.stopPropagation(); 
			editor.execCommand('insertHTML', false, obj.charTab);
			return false; 
		}
		// -- present ctrl+s
		if (evt.ctrlKey && evt.keyCode == 83) { 
			evt.preventDefault(); 
			evt.stopPropagation(); 
			return false; 
		}
	}

	function jsEditor_setSource(el) {
		if (!this.showSource) return;
		
		// undo redo buttons
		this.tb_source.items[0].disabled = false;
		this.tb_source.items[1].disabled = false;
		this.tb_source.items[0].refresh();
		this.tb_source.items[1].refresh();
		
		var img = top.jsUtils.sys_path+'/includes/silk/icons/';
		var focusElem = el;
		var sel = focusElem.ownerDocument.defaultView.getSelection();
		top.editor_focusElem = focusElem;	
		// -- outerHTML
		var outerHTML = '';
		if (focusElem.outerHTML) {
			outerHTML = focusElem.outerHTML;
		} else {  // Firefox
			var attributes = focusElem.attributes;
			var attrs = "";
			for (var i = 0; i < attributes.length; i++) {
				if (attributes[i].name == '_moz_dirty') continue;
				if (attributes[i].name == '_moz_resizing') continue;
				if (attributes[i].name == 'contenteditable') continue;
				attrs += " " + attributes[i].name + "=\"" + attributes[i].value + "\"";
			}
			if (focusElem.innerHTML == '') {
				outerHTML = "<" + focusElem.tagName.toLowerCase() + attrs + " />";
			} else {
				outerHTML = "<" + focusElem.tagName.toLowerCase() + attrs + ">" + focusElem.innerHTML + "</" + focusElem.tagName.toLowerCase() + ">";
			}
		}
		var obj = top.elements[top.tmp_editor];
		// source code
		outerHTML = beautify_mixed(outerHTML);
		obj.source_editor.setCode(outerHTML);
		// toolbar
		if (focusElem.tagName.toLowerCase() == 'tr' || focusElem.tagName.toLowerCase() == 'tbody') {
			obj.tb_source.items[4].disabled = true;
		} else {
			obj.tb_source.items[4].disabled = false;
		}
		obj.tb_source.items[4].refresh();	
	}

	function jsEditor_toggleSource(flag) {
		var obj = top.elements[top.tmp_editor];
		if (flag == null) flag = !this.showSource;
		if (flag) {
			obj.box.ownerDocument.getElementById(obj.name +'_source').parentNode.style.display 	= '';
			obj.box.ownerDocument.getElementById(obj.name +'_tb_source').style.display 	= '';
		} else {
			obj.box.ownerDocument.getElementById(obj.name +'_source').parentNode.style.display 	= 'none';
			obj.box.ownerDocument.getElementById(obj.name +'_tb_source').style.display 	= 'none';
		}
		this.showSource = flag;
		this.resize();
	}

	function jsEditor_catchClick(evt) {
		var img = top.jsUtils.sys_path+'/includes/silk/icons/';
		var focusElem = evt.target ? evt.target : evt.srcElement;
		var sel = focusElem.ownerDocument.defaultView.getSelection();
		top.editor_focusElem = focusElem;
		var obj = top.elements[top.tmp_editor];
		obj.setSource(focusElem);
		
		// build tag tree
		var tmp = focusElem;
		top.editor_tree = [];
		var tree = '';
		while (true) {
			if (tree != '') tree = ' <span style="font-size: 14px;">' + String.fromCharCode(8594) + '</span> ' + tree;
			var ind = top.editor_tree.length;
			top.editor_tree[ind] = tmp;
			tree = '<a href="javascript: top.elements[top.tmp_editor].setSource(top.editor_tree['+ ind +']);">'+ tmp.tagName + '</a>' + tree;
			if (tmp.tagName.toLowerCase() == 'body') { break; }
			tmp = tmp.parentNode; if (!tmp) break;
		}
		obj.box.ownerDocument.getElementById('source_tree').innerHTML = tree;
		
		// ------------------------------------------
		// -- Second toolbar

		isToolbar = false;
		// -- link properties
		if (focusElem.tagName.toLowerCase() == 'a') { 
			obj.linkProps(focusElem);	
			isToolbar = true;
		}
		// -- link properties
		if (focusElem.tagName.toLowerCase() == 'img') { 
			obj.imageProps(focusElem);	
			isToolbar = true;
		}
		// -- table properties
		var el  = focusElem;
		while(true) {
			if (el.tagName.toLowerCase() == 'td') { obj.tableProps(el); isToolbar = true; break; }
			if (el.tagName.toLowerCase() == 'body') { break; }
			el = el.parentNode; if (!el) break;
		}
		var el = obj.box.ownerDocument.getElementById(obj.name + '_drop');
		if (isToolbar === false && el) { obj.closePopup(); }
		
		// ------------------------------------------
		
		// disable
		if (sel == '') {
			obj.toolbar.items[10].disabled = true;
			obj.toolbar.items[26].disabled = true;
			obj.toolbar.items[27].disabled = true;
		} else {
			obj.toolbar.items[10].disabled = false;
			obj.toolbar.items[26].disabled = false;
			obj.toolbar.items[27].disabled = false;
		}
		obj.toolbar.refresh();
		// find header
		var el  = focusElem;
		var tmp = '';
		while(true) {
			if (el.tagName.toLowerCase() == 'h1') { tmp = 'text_heading_1.png'; break; }
			if (el.tagName.toLowerCase() == 'h2') { tmp = 'text_heading_2.png'; break; }
			if (el.tagName.toLowerCase() == 'h3') { tmp = 'text_heading_3.png'; break; }
			if (el.tagName.toLowerCase() == 'h4') { tmp = 'text_heading_4.png'; break; }
			if (el.tagName.toLowerCase() == 'blockquote') { tmp = 'comment.png'; break; }
			if (el.tagName.toLowerCase() == 'address') { tmp = 'text_signature.png'; break; }
			if (el.tagName.toLowerCase() == 'pre') { tmp = 'page_white_code.png'; break; }
			if (el.tagName.toLowerCase() == 'body') { tmp = 'text_smallcaps.png'; break; }
			el = el.parentNode; if (!el) break;
		}
		obj.toolbar.items[4].caption = '<img src="'+ img + tmp +'">';
		obj.toolbar.items[4].refresh();	
		// find font
		var el  = focusElem;
		while(true) {
			if (el.style.fontFamily != '') { tmp = el.style.fontFamily; break; }
			if (el.tagName.toLowerCase() == 'html') { tmp = 'Times New Roman'; break; }
			el = el.parentNode; if (!el) break;
		}
		obj.toolbar.items[5].caption = tmp;
		obj.toolbar.items[5].refresh();	
		// find font size
		var el  = focusElem;
		while(true) {
			if (el.style.fontSize != '') { tmp = el.style.fontSize; break; }
			if (el.tagName.toLowerCase() == 'html') { tmp = '16px'; break; }
			el = el.parentNode; if (!el) break;
		}
		obj.toolbar.items[6].caption = tmp;
		obj.toolbar.items[6].refresh();	
		// find if bold
		var el  = focusElem;
		while(true) {
			if (el.style.fontWeight.toLowerCase() == 'bold') { tmp = true; break; }
			if (el.tagName.toLowerCase() == 'html') { tmp = false; break; }
			el = el.parentNode; if (!el) break;
		}
		obj.toolbar.items[8].checked = tmp;
		obj.toolbar.items[8].refresh();	
		// find if italic
		var el  = focusElem;
		while(true) {
			if (el.style.fontStyle.toLowerCase() == 'italic') { tmp = true; break; }
			if (el.tagName.toLowerCase() == 'html') { tmp = false; break; }
			el = el.parentNode; if (!el) break;
		}
		obj.toolbar.items[9].checked = tmp;
		obj.toolbar.items[9].refresh();	
		// if selected then bold, italic off
		if (sel != '') {
			obj.toolbar.items[8].checked = false;
			obj.toolbar.items[9].checked = false;
			obj.toolbar.refresh();
		}
		// find text color
		var el  = focusElem;
		while(true) {
			if (el.style.color != '') { tmp = el.style.color; break; }
			if (el.tagName.toLowerCase() == 'html') { tmp = 'black'; break; }
			el = el.parentNode; if (!el) break;
		}
		obj.toolbar.items[12].caption = '<div id=font_color style="color: '+tmp+'; width: 16px; height: 13px; font-weight: bold;">Aa</div>';
		obj.toolbar.items[12].refresh();	
		// find background color
		var el  = focusElem;
		while(true) {
			if (el.style.backgroundColor != '') { tmp = el.style.backgroundColor; break; }
			if (el.tagName.toLowerCase() == 'html') { tmp = 'white'; break; }
			el = el.parentNode; if (!el) break;
		}
		obj.toolbar.items[13].caption = '<div id=bg_color style="border: 1px solid silver; margin-top: 1px; background-color: '+tmp+'; width: 12px; height: 12px;">&nbsp;</div>';
		obj.toolbar.items[13].refresh();	
		// text alignment
		var el  = focusElem;
		while(true) {
			if (el.style.textAlign != '') { tmp = el.style.textAlign; break; }
			if (el.tagName.toLowerCase() == 'html') { tmp = 'left'; break; }
			el = el.parentNode; if (!el) break;
		}
		obj.toolbar.items[19].caption = '<img src="'+ img +'text_align_'+ tmp.toLowerCase() +'.png">';
		obj.toolbar.items[19].refresh();	
		// lists
		var el  = focusElem;
		while(true) {
			if (el.tagName.toLowerCase() == 'li') { tmp = el.parentNode; break; }
			if (el.tagName.toLowerCase() == 'html') { tmp = null; break; }
			el = el.parentNode; if (!el) break;
		}
		if (tmp) {
			if (tmp.tagName.toLowerCase() == 'ul') { tmp2 = 'bullets'; }
			if (tmp.tagName.toLowerCase() == 'ol') { tmp2 = 'numbers'; }
			obj.toolbar.items[21].caption = '<img src="'+ img +'text_list_'+ tmp2 +'.png">';
			obj.toolbar.items[21].refresh();
		}
	}

	function jsEditor_linkProps(el_link) {
		var el = this.box.ownerDocument.getElementById(this.name + '_drop');
		if (!el) return false;
		top.jsUtils.clearShadow(el);
		top.el_link = el_link;
		top.elements[this.name+'_tb2'] = null;
		var tb = new top.jsToolBar(this.name+'_tb2', el);
		tb.addHTML('URL: <input style="'+ this.style_control +'" type=text size=30 value="'+ top.el_link.href +'"'+
				   '		onkeyup="top.el_link.href = this.value">');
		tb.addHTML('&nbsp;&nbsp;');
		tb.addHTML('Target: <input id="prop_target" style="'+ this.style_control +'" type=text size=10 '+
				   '		value="'+ top.el_link.target +'" onkeyup="top.el_link.target = this.value">');
		tb.addHTML('<input id="prop_check" type=checkbox style="position: relative; top: 0px" '+ (top.el_link.target == '_blank' ? 'checked' : '') +
				   '	onclick="el = document.getElementById(\'prop_target\'); el.value = this.checked ? \'_blank\' : \'\'; el.onkeyup();">'+
				   '<label for="prop_check" style="position: relative; top: -2px">New Window</label>');
		tb.output();
		// -- check if already out
		if (top.tmp_tbDown !== true) {
			top.jsUtils.clearShadow(el);
			top.jsUtils.slideDown(el, new Function("top.jsUtils.dropShadow(document.getElementById('"+ this.name +"_drop')); top.tmp_tbDown = true;"));
		} else {
			el.style.display = '';
			top.jsUtils.clearShadow(el);
			top.jsUtils.dropShadow(el);
		}
	}

	function jsEditor_getDivs(start, end) {
		html = '';
		for (var i=start; i<=end; i++) {
			html += '<div title="'+i+'" style="width: 24px; height: 24px; font-size: 16px; text-align: center; margin: 2px; float: left; '+
					'		padding: 3px; border: 1px solid silver; background: #fff; cursor: pointer;"'+
					'	onmouseover = "this.style.border = \'1px solid black\';"'+
					'	onmouseout  = "this.style.border = \'1px solid silver\';"'+
					'	onclick  	= "obj = top.elements[top.tmp_editor]; obj.box.ownerDocument.getElementById(obj.name+\'_editor\').contentDocument.execCommand(\'insertHTML\', false, \''+ String.fromCharCode(i) +'\');'+
					'				   top.jsUtils.clearShadow(top.tmp_editor_insert); top.tmp_editor_insert.parentNode.removeChild(top.tmp_editor_insert); top.jsUtils.unlock();"'+
					'>'+ String.fromCharCode(i) +'</div>';
		}
		return html;
	}

	function jsEditor_symbolInsert() {
		if (!this.box) return false;
		var el = this.box.ownerDocument.createElement(this.name + '_insert');
		var html = '<div style="background-color: #f4f4fe; border: 1px solid silver; width: 665px;">'+
			'	<table cellpadding=3 cellspacing=0 style="font-family: verdana; font-size: 11px; width: 100%;">'+
			'		<tr><td colspan=2 style="padding: 7px; border-bottom: 1px solid silver; background-color: #d5e3f2; background-image: url('+ top.jsUtils.sys_path +'/images/bl_title_bg.png); font-size: 12px; font-weight: bold;">Insert Symbol</td></tr>'+
			'	</table>'+
			'	<table cellpadding=3 cellspacing=0 style="padding: 5px; font-family: verdana; font-size: 11px; width: 100%;"><tr><td>';
		html += this.getDivs(161, 172);
		html += this.getDivs(174, 191);
		html += this.getDivs(913, 929);
		html += this.getDivs(931, 937);
		html += this.getDivs(945, 969);
		html += this.getDivs(1488, 1514);
		html += this.getDivs(8240, 8240);
		html += this.getDivs(8531, 8534);
		html += this.getDivs(8535, 8538);
		html += this.getDivs(8592, 8601);
		html += this.getDivs(8644, 8667);
		html += this.getDivs(3389, 3389);
		html +=
			'	</td></tr></table>'+
			'	<table cellpadding=3 cellspacing=0 style="font-family: verdana; font-size: 11px; width: 100%;">'+
			'		<tr><td colspan=2 style="background-color: #d5e3f2; padding: 4px; border-top: 1px solid silver" align=center>'+
			'			<input type=button value="Close" style="'+ this.style_button +'" '+
			'				onclick="top.jsUtils.clearShadow(top.tmp_editor_insert); top.tmp_editor_insert.parentNode.removeChild(top.tmp_editor_insert); top.jsUtils.unlock();">'+
			'		</td></tr>'+
			'	</table>'+
			'</div>';
		el.style.cssText = "position: absolute; z-index: 100; top: 50px; width: 650px; height: 280px; background-color: #f4f4fe; border: 1px solid silver;";
		el.innerHTML = html;
		this.box.ownerDocument.body.appendChild(el);
		top.tmp_editor_insert = el;
		top.jsUtils.lock(0.5);
		top.jsUtils.center(el, 'x');
		top.jsUtils.dropShadow(el, true);
	}

	function jsEditor_wordInsert() {
		if (!this.box) return false;
		var el = this.box.ownerDocument.createElement(this.name + '_insert');
		el.style.cssText = "position: absolute; z-index: 100; top: 50px; width: 650px; height: 280px; background-color: #f4f4fe; border: 1px solid silver;";
		el.innerHTML = 
			'	<table cellpadding=3 cellspacing=0 style="font-family: verdana; font-size: 11px; width: 100%;">'+
			'		<tr><td colspan=2 style="padding: 7px; border-bottom: 1px solid silver; background-color: #d5e3f2; background-image: url('+ top.jsUtils.sys_path +'/images/bl_title_bg.png); font-size: 12px; font-weight: bold;">Insert from Word</td></tr>'+
			'	</table>'+
			'	<table cellpadding=3 cellspacing=0 style="padding: 5px; font-family: verdana; font-size: 11px; width: 100%;">'+
			'		<tr><td style="padding: 5px">'+
			'			Cut and paste text from Word and click the Insert button:<div style="height: 5px; font-size: 1px;">&nbsp;</div>'+
			'			<textarea id="prop_word" style="'+ this.style_control +'; width: 100%; height: 180px;"></textarea>'+
					'</td></tr>'+
			'	</table>'+
			'	<table cellpadding=3 cellspacing=0 style="font-family: verdana; font-size: 11px; width: 100%;">'+
			'		<tr><td colspan=2 style="background-color: #d5e3f2; padding: 4px; border-top: 1px solid silver" align=center>'+
			'			<input type=button value="Insert" style="'+ this.style_button +'" '+
			'				onclick="obj = top.elements[top.tmp_editor]; obj.box.ownerDocument.getElementById(obj.name+\'_editor\').contentDocument.execCommand(\'insertHTML\', false, document.getElementById(\'prop_word\').value); '+
			'						 top.jsUtils.clearShadow(top.tmp_editor_insert); top.tmp_editor_insert.parentNode.removeChild(top.tmp_editor_insert); top.jsUtils.unlock();">'+
			'			<input type=button value="Close" style="'+ this.style_button +'" '+
			'				onclick="top.jsUtils.clearShadow(top.tmp_editor_insert); top.tmp_editor_insert.parentNode.removeChild(top.tmp_editor_insert); top.jsUtils.unlock();">'+
			'		</td></tr>'+
			'	</table>';
		this.box.ownerDocument.body.appendChild(el);
		top.tmp_editor_insert = el;
		top.jsUtils.lock(0.5);
		top.jsUtils.center(el, 'x');
		top.jsUtils.dropShadow(el, true);
	}

	function jsEditor_imageInsert() {
		if (!this.box) return false;
		var el = this.box.ownerDocument.createElement(this.name + '_insert');
		if (window.innerHeight == undefined) {
			width  = window.document.body.clientWidth;
			height = window.document.body.clientHeight;
		} else {
			width  = window.innerWidth;
			height = window.innerHeight;
		}
		width  = 965; 
		height = 520;
		el.style.cssText = "position: absolute; z-index: 100; top: 15px; left: 15px; width: "+(width-40)+"px; height: "+(height-40)+"px; background-color: #f4f4fe; border: 1px solid silver;";
		el.innerHTML = 
			'	<table cellpadding=0 cellspacing=0 style="background-color: #d5e3f2; font-family: verdana; font-size: 11px; width: 100%; height: 100%;">'+
			'		<tr><td colspan=2 style="padding: 7px; border-bottom: 1px solid silver; background-color: #d5e3f2; background-image: url('+ top.jsUtils.sys_path +'/images/bl_title_bg.png); font-size: 12px; font-weight: bold;">'+
			'			Insert Image <div style="width: 20px; float: right;">'+
			'				<img src="'+top.jsUtils.sys_path+'/images/btn_cross_b.png" style="margin: 3px; margin-bottom: 0px;" '+
			'						onclick="top.jsUtils.clearShadow(top.tmp_editor_insert); top.tmp_editor_insert.parentNode.removeChild(top.tmp_editor_insert); top.jsUtils.unlock();" '+
			'						onmouseover="this.src = \''+top.jsUtils.sys_path+'/images/btn_cross_c.png\'" '+
			'						onmouseout="this.src = \''+top.jsUtils.sys_path+'/images/btn_cross_b.png\'"></div>'+
			'		</td></tr>'+
			'		<tr>'+
			'			<td id="insertImage_tb" colspan=2 style="padding: 2px; border-bottom: 1px solid silver; background-color: #f3f3f3; height: 30px;">'+
			'			</td>'+
			'		</tr>'+
			'		<tr>'+
			'			<td style="padding: 0px; background-color: white; width: 160px;">'+
			'				<div id=insertImage_tree style="overflow: auto; padding: 0px; border-right: 1px solid silver; width: 160px; height: '+(height-105)+'px;"></div>'+
			'			</td>'+
			'			<td style="background: white; padding: 0px; height: 100%;">'+
			'				<div id=insertImage_pic style="overflow: auto; padding; 0px; width: '+(width-205)+'px; height: '+(height-105)+'px;"></div>'+
			'			</td>'+
			'		</tr>'+
			'	</table>';
		this.box.ownerDocument.body.appendChild(el);
		top.tmp_editor_insert = el;
		top.jsUtils.lock(0.5);
		top.jsUtils.center(el, 'x');
		top.jsUtils.dropShadow(el, true);
		
		// -- init tree
		top.elements['editor_folders'] = null;
		var img = top.jsUtils.sys_path+'/includes/silk/icons/';
		var editor_folders = new jsTree('editor_folders', document.getElementById('insertImage_tree'));
		editor_folders.picture = img+'folder.png';
		editor_folders.onOpen  = this.treeOpen;
		editor_folders.onClick = this.treeClick;
		var topfld = editor_folders.addNode(editor_folders, '_top', 'Media');
		editor_folders.addNode(topfld, '_top_temp', '...');
		topfld.expanded = true;
		topfld.selected = true;
		editor_folders.output();	
		
		// -- init toolbar
		top.elements[this.name+'_tb_pic'] = null
		var tb = new top.jsToolBar(this.name+'_tb_pic', document.getElementById('insertImage_tb'));
		tb.owner = this;
		tb.addHTML(' ');
		bt1 = tb.addRadio('Small', img+'pictures.png', this.imageTbAction, 'Small picrues', 1); 
		bt2 = tb.addRadio('Large', img+'picture.png', this.imageTbAction, 'Large picrues', 1);
		if (this.thumbSize == 'small') bt1.checked = true; else bt2.checked = true;
		tb.addBreak();
		tb.addButton('Refresh', img+'arrow_refresh.png', this.imageTbAction, 'Refresh current view');
		tb.addButton('Upload', img+'database_add.png', this.imageTbAction, 'Upload more images');
		tb.addBreak();
		tb.addHTML("<select id=editor_imageSize onchange=\"if (this.value != '') top.elements['"+ this.name +"'].imageSelect(null, null, this.value);\">"+
				   "	<option value='120'>Small"+
				   "	<option value='250'>Medium"+
				   "	<option value='450'>Large"+
				   "	<option value='o'>Original"+
				   "	<option value='c'>Custom "+
				   "</select> "+
				   "Width: <input id=editor_imageWidth size=4 disabled onchange=\"if (this.value != '') top.elements['"+ this.name +"'].imageSelect(null, null, null);\"> "+
				   "Height: <input id=editor_imageHeight size=4 disabled onchange=\"if (this.value != '') top.elements['"+ this.name +"'].imageSelect(null, null, null);\"> ");
		tb.addBreak();
		tb.addButton('Insert Image', img+'image_add.png', this.imageTbAction, 'Insert currently displayed image');
		tb.rightHTML = '<div style="width: auto; padding-right: 5px; font-family: verdana; font-size: 11px;" id="editor_progress"></div>';
		tb.items[6].visible = tb.items[7].visible = tb.items[8].visible = tb.items[9].visible = false;
		tb.output();
		
		// -- initial
		this.serverCall('getFolders', 'folder::_top');	
		this.serverCall('getImages', 'folder::_top');	
	}

	function jsEditor_imageTbAction(cmd) {
		var obj = this.owner.owner;
		switch(cmd) {
			case 'editor_tb_pic_but1':
				obj.thumbSize = 'small';
				obj.serverCall('getImages', 'folder::'+obj.currentFolder);
				break;
			case 'editor_tb_pic_but2':
				obj.thumbSize = 'large';
				obj.serverCall('getImages', 'folder::'+obj.currentFolder);
				break;
			case 'editor_tb_pic_but4':
				obj.serverCall('getImages', 'folder::'+obj.currentFolder);
				break;
			case 'editor_tb_pic_but9':
				obj.imageInsertIP();
				break;
		}
	}

	function jsEditor_imageSelect(folder, file, size) {
		if (folder !== null && file !== null) {	// initial file
			size = 120;
			document.getElementById('editor_imageSize').value = 120;
		}
		if (size == 'c') {	document.getElementById('editor_imageWidth').value = '200'; }
		// -- update/init variables
		if (folder !== null) this.selFolder = folder; else folder = this.selFolder;
		if (file !== null) 	 this.selFile   = file;   else file   = this.selFile;
		if (size !== null) 	 this.selSize   = size;   else size   = this.selSize;
		if (document.getElementById('editor_imageSize').value == 'c') {
			document.getElementById('editor_imageWidth').disabled  = false;
			document.getElementById('editor_imageHeight').disabled = false;
			document.getElementById('editor_imageWidth').focus();
			var w = document.getElementById('editor_imageWidth').value;
			var h = document.getElementById('editor_imageHeight').value;
			if (top.jsUtils.trim(w) == '') w = '';
			if (top.jsUtils.trim(h) == '') h = '';
			size = w + 'x' + h;
		} else {
			document.getElementById('editor_imageWidth').disabled  = true;
			document.getElementById('editor_imageHeight').disabled = true;
			document.getElementById('editor_imageWidth').value 	   = size;
			document.getElementById('editor_imageHeight').value    = '';
		}
		// -- update toolbar
		var tb = top.elements[this.name+'_tb_pic'];
		tb.items[6].visible = tb.items[7].visible = tb.items[8].visible = tb.items[9].visible = true;
		tb.refresh();
		// -- 
		var param = [];
		param['req_cmd'] = 'getImageBySize';
		param['folder']  = folder;
		param['file'] 	 = file;
		param['size']	 = size;
		document.getElementById('insertImage_pic').innerHTML = '<img src="'+top.jsUtils.sys_path+'/libs/jsEditor_srv.php?cmd='+ top.jsUtils.serialize(param) +'&rnd='+ Math.random() +'" style="margin: 5px;">';
	}

	function jsEditor_imageInsertIP() {
		// -- process image
		var param = [];
		param['req_name']= this.name;
		param['req_cmd'] = 'insertImageBySize';
		param['folder']  = this.selFolder;
		param['file'] 	 = this.selFile;
		param['size']	 = this.selSize;
		req = this.box.ownerDocument.createElement('SCRIPT');
		req.src = top.jsUtils.sys_path+'/libs/jsEditor_srv.php?cmd=' + top.jsUtils.serialize(param) + '&rnd=' + Math.random();
		this.box.ownerDocument.body.appendChild(req);
		// -- close dialog
		top.jsUtils.clearShadow(top.tmp_editor_insert); 
		top.tmp_editor_insert.parentNode.removeChild(top.tmp_editor_insert); 
		top.jsUtils.unlock();
	}

	function jsEditor_serverCall(cmd, params) {
		if (!this.box) return;
		// call sever script
		req = this.box.ownerDocument.createElement('IFRAME');
		req.frameBorder   = 0;
		req.style.cssText = 'width: 1px; height: 1px; position: absolute; left: -100px;';
		var param = [];
		param['req_cmd'] 	= cmd;
		param['req_name'] 	= this.name;
		param['thumb_size'] = this.thumbSize;
		if (params != undefined && params != '') {
			var tmp = params.split(';;');
			for (var i=0; i<tmp.length; i++) {
				var t = tmp[i].split('::');
				param[t[0]] = t[1];
			}
		}
		req.src= top.jsUtils.sys_path+'/libs/jsEditor_srv.php?cmd=' + top.jsUtils.serialize(param) + '&rnd=' + Math.random();
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsEditor_treeOpen(node) {
		var obj = top.elements[top.tmp_editor];
		obj.serverCall('getFolders', 'folder::'+node.id);
	}

	function jsEditor_treeClick(node) {
		var obj = top.elements[top.tmp_editor];
		obj.serverCall('getImages', 'folder::'+node.id);
		// -- disabled insert buttons
		var tb = top.elements[obj.name+'_tb_pic'];
		tb.items[6].visible = tb.items[7].visible =	tb.items[8].visible = tb.items[9].visible = false;
		tb.refresh();	
	}

	function jsEditor_imageProps(el_img) {
		var img = top.jsUtils.sys_path+'/includes/silk/icons/';
		var el = this.box.ownerDocument.getElementById(this.name + '_drop');
		if (!el) return false;
		top.jsUtils.clearShadow(el);
		top.el_img = el_img;
		top.elements[this.name+'_tb2'] = null;
		var tb = new top.jsToolBar(this.name+'_tb2', el);
		tb1 = tb.addRadio('', img+'text_padding_left.png', Function("top.el_img.style.cssFloat  = 'left';"), '', 1);
		tb2 = tb.addRadio('', img+'text_padding_top.png', Function("top.el_img.style.cssFloat   = 'none';"), '', 1);
		tb3 = tb.addRadio('', img+'text_padding_right.png', Function("top.el_img.style.cssFloat = 'right';"), '', 1);
		tb1.checked = tb2.checked = tb3.checked = false;
		if (el_img.style.cssFloat == 'left')  tb1.checked = true;
		if (el_img.style.cssFloat == 'none')  tb2.checked = true;
		if (el_img.style.cssFloat == 'right') tb3.checked = true;
		tb.addBreak();
		tb.addHTML('URL: <input style="'+ this.style_control +'" type=text size=45 value="'+ top.el_img.getAttribute('src') +'"'+
				   '		onchange="top.el_img.src = this.value">');
		tb.addHTML('&nbsp;&nbsp;');
		tb.addHTML('Margin: <input id="prop_target" style="'+ this.style_control +'" type=text size=10 '+
				   '		value="'+ top.el_img.style.margin +'" onkeyup="top.el_img.style.margin = this.value">');
		tb.addBreak();
		tb.addRadio('Replace', img+'image_edit.png', Function("var el = document.getElementById('"+ this.name +"_drop'); top.jsUtils.clearShadow(el); top.elements[top.tmp_editor].closePopup(); top.elements[top.tmp_editor].imageInsert();"), '');
		tb.output();
		// -- check if already out
		if (top.tmp_tbDown !== true) {
			top.jsUtils.clearShadow(el);
			top.jsUtils.slideDown(el, new Function("top.jsUtils.dropShadow(document.getElementById('"+ this.name +"_drop')); top.tmp_tbDown = true;"));
		} else {
			el.style.display = '';
			top.jsUtils.clearShadow(el);
			top.jsUtils.dropShadow(el);
		}
	}

	function jsEditor_videoInsert() {
	}

	function jsEditor_videoProps() {
	}

	function jsEditor_tableProps(el_td) {
		var el = this.box.ownerDocument.getElementById(this.name + '_drop');
		if (!el) return false;
		top.el_td 	 = el_td;
		top.el_table = el_td.parentNode.parentNode.parentNode;
		top.el_style = el_td.ownerDocument.getElementById(top.el_table.id+'_style');
		//console.log(top.el_style.innerHTML);
		
		top.elements[this.name+'_tb2'] = null;
		var tb = new top.jsToolBar(this.name+'_tb2', el);
		tb.addHTML('TABLE: &nbsp;');
		tb.addHTML('W:<input style="'+ this.style_control +'" type=text size=3 value="'+ top.el_table.style.width +'"'+
				   '		onkeyup="top.el_table.style.width = this.value">');
		tb.addHTML('&nbsp;');
		tb.addHTML('H: <input style="'+ this.style_control +'" type=text size=3 value="'+ top.el_table.style.height +'"'+
				   '		onkeyup="top.el_table.style.height = this.value">');
		tb.addBreak();
		tb.addHTML('CELL: &nbsp;');
		tb.addHTML('W:<input style="'+ this.style_control +'" type=text size=3 value="'+ top.el_td.style.width +'"'+
				   '		onkeyup="top.el_td.style.width = this.value">');
		tb.addHTML('&nbsp;');
		tb.addHTML('H: <input style="'+ this.style_control +'" type=text size=3 value="'+ top.el_td.style.height +'"'+
				   '		onkeyup="top.el_td.style.height = this.value">');
		tb.output();
		// -- check if already out
		if (top.tmp_tbDown !== true) {
			top.jsUtils.clearShadow(el);
			top.jsUtils.slideDown(el, new Function("top.jsUtils.dropShadow(document.getElementById('"+ this.name +"_drop')); top.tmp_tbDown = true;"));
		} else {
			el.style.display = '';
			top.jsUtils.clearShadow(el);
			top.jsUtils.dropShadow(el);
		}
	}

	function jsEditor_closePopup() {
		var el = this.box.ownerDocument.getElementById(this.name+'_drop');
		top.jsUtils.clearShadow(el);
		//top.jsUtils.slideUp(el);
		el.style.left 	 = 0;
		el.style.top	 = 0;
		el.style.display = 'none';
		el.innerHTML 	 = '';
		// hide parent element
		el.parentNode.style.width  = 0;
		el.parentNode.style.height = 0;
		// --
		top.tmp_tbDown = false;
	}
}

if (top != window) top.jsEditor = jsEditor;