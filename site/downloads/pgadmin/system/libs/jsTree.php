<? require("phpCache.php"); ?>
/*********************************************************
*
* ------- This the jsTree class
*
*********************************************************/

function jsNode(tree, parent, id, text) {
    this.id     	= id;
	this.ind		= null; 
    this.text   	= text;
    this.tree   	= tree;
    this.parent 	= parent;
    this.nodes  	= new Array();
    this.picture	= null;
    this.selected 	= false;
    this.expanded 	= false;

    this.onClick;
    this.onDblClick;
    this.onContextMenu;
    this.onOpen;
    this.onClose;

    this.refresh = jsNode_refresh;

	// -- implementation
	function jsNode_refresh() {
		this.tree.refresh(this);
	}
}

function jsTree(name, box) {
    // required
    this.name   = name;
    this.box    = box;

    // public properties
    this.tree;
    this.nodes   = new Array();   // Tree Child Nodes
    this.picture = '';    		  // Image which will be near branch Node Text
	this.style   = '';

    // public events
    this.onClick;             // Fire when user click on Node Text
    this.onDblClick;          // Fire when user dbl clicks
    this.onContextMenu;
    this.onOpen;              // Fire when node Expands
    this.onClose;             // Fire when node Colapses

    // public methods
    this.addNode        = jsTree_addNode;
    this.removeNode     = jsTree_removeNode;
	this.removeSubNodes = jsTree_removeSubNodes;
    this.output     	= jsTree_output;       // Build tree and return TREE as HTML DOM Elements
    this.refresh        = jsTree_refresh;      // Rebuild Tree
    this.getNode        = jsTree_getNode;      // Return Reference on node with some ID

    // internal properties
    this.LplusDotsImg   = top.jsUtils.sys_path + "/images/Lplus.png";
    this.TplusDotsImg   = top.jsUtils.sys_path + "/images/Tplus.png";
    this.LminusDotsImg  = top.jsUtils.sys_path + "/images/Lminus.png";
    this.TminusDotsImg  = top.jsUtils.sys_path + "/images/Tminus.png";
    this.IclearDotsImg  = top.jsUtils.sys_path + "/images/I.png";
    this.LclearDotsImg  = top.jsUtils.sys_path + "/images/L.png";
    this.TclearDotsImg  = top.jsUtils.sys_path + "/images/T.png";
    this.plusNotDotsImg = top.jsUtils.sys_path + "/images/plus.png";
    this.minusNotDotsImg= top.jsUtils.sys_path + "/images/minus.png";

    // internal methods
    this.findSubNode     = jsTree_findSubNode;     // Tree method to get Reference to node with some ID tree.findSubNode(node)
    this.buildNode       = jsTree_buildNode;       // Build Node to DOM HTML ELement
    this.nodeClick       = jsTree_nodeClick;
    this.nodeDblClick    = jsTree_nodeDblClick;
    this.nodeContextMenu = jsTree_nodeContextMenu;
    this.nodeOpenClose   = jsTree_nodeOpenClose;
    this.checkDups       = jsTree_checkDups;

	// ==============-------------------------------
	// -------------- IMPLEMENTATION

	function jsTree_addNode(parent, id, text) {
		if (this.checkDups(id)) { alert('Cannot insert node \''+ text +'\' because of duplicate node id.'); return null; }
		var node = new top.jsNode(this, parent, id, text);
		node.ind = parent.nodes.length;
		parent.nodes[node.ind] = node;
		return node;
	}

	function jsTree_getNode(id) {
		var node = this.findSubNode(this, id);
		return node;
	}

	function jsTree_removeNode(nd) {
		var tmp = nd.parent.nodes;
		nd.parent.nodes = new Array();
		for(var i=0; i < tmp.length; i++) {
			if(i != nd.ind) {
				var ind = nd.parent.nodes.length;
				tmp[i].ind = ind
				nd.parent.nodes[ind] = tmp[i];
			}
		}
	}

	function jsTree_removeSubNodes(nd) {
		nd.nodes = new Array();
		this.refresh(nd);
	}

	function jsTree_checkDups(id) {
		res = this.findSubNode(this, id);
		if (res == '') res = false; else res = true;
		return res;
	}

	function jsTree_findSubNode(node, id) {
		nodeRes = "";
		for (var i=0; i<node.nodes.length; i++) {
			if(node.nodes[i].id == id) {
				return node.nodes[i];
			} else {
				nodeRes = this.findSubNode(node.nodes[i], id);
				if (nodeRes) return nodeRes;
			}
		}
		return nodeRes;
	}

	function jsTree_refresh(node) {
		if (!this.box) return;
		if (!node && this.box.ownerDocument != null) { // entire tree
				var treeOwner = this.box.ownerDocument.getElementById(this.name);
				treeOwner.innerHTML = "";
				this.output();
		} else { // partial tree
			if(node == null) {
				node = this;
				this.box.ownerDocument = this.box.ownerDocument;
			}
			// refresh text & image
			var cellImg = '';
			if (node.picture) {	cellImg = node.picture; } else { if (node.tree.picture) { cellImg = node.tree.picture; } }
			if (cellImg > '') {
				if (document.all) {
					cellImg = '<img src="'+ top.jsUtils.sys_path +'/images/empty.gif" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\''+ cellImg +'\'")>';
				} else {
					cellImg = '<img src="'+ cellImg +'">';
				}
			} else { cellImg = ''; }
			this.box.ownerDocument.getElementById('infoCell_txt_'+ node.id).innerHTML = node.text;
			this.box.ownerDocument.getElementById('infoCell_img_'+ node.id).innerHTML = cellImg;
			// --
			var parent   = (node.parent ? node.parent : this);
			var lastNode = (parent.nodes[parent.nodes.length-1] == node ? true : false);

			// build only subnodes
			var table = this.box.ownerDocument.createElement('TABLE');
			table.cellPadding = 0;
			table.cellSpacing = 0;
			for(var j=0; j<node.nodes.length; j++)
			{
				var childTr   = table.insertRow(table.rows.length);
				var childCell = childTr.insertCell(childTr.cells.length)
				if ((j+1) == node.nodes.length) lastNode = true; else lastNode = false;
				childCell.appendChild(this.buildNode(node.nodes[j], lastNode));
			}
			var el = this.box.ownerDocument.getElementById('nodeChildCell_' + node.id);
			if (el) {
				el.innerHTML = '';
				el.appendChild(table);
			}
		}
	}

	function jsTree_output() {
		if (!this.box) return;
		mTbl = this.box.ownerDocument.createElement('TABLE');
		mTbl.id    	     = this.name;
		mTbl.cellPadding = 0;
		mTbl.cellSpacing = 0;
		if (document.all) { mTbl.className = 'tree_table'; }
					 else {	mTbl.setAttribute('class', 'tree_table') }

		for (var i=0; i < this.nodes.length; i++) {
			mTr   = mTbl.insertRow(mTbl.rows.length);
			mCell = mTr.insertCell(mTr.cells.length)
			var lastNode = false;
			if ((i + 1) == this.nodes.length ) lastNode = true;
			mCell.appendChild(this.buildNode(this.nodes[i], lastNode));
		}
		this.tree = mTbl;
		this.box.innerHTML = '';
		this.box.innerHTML = '<table cellpadding=0 cellspacing=0 style="width: 100%; height: 100%; '+ this.style + '"><tr>'+
							 '<td valign="top" id="top_'+ this.name +'"></td>'+
							 '</tr></table>';
		this.box.ownerDocument.getElementById('top_'+ this.name).appendChild(mTbl);
	}

	function jsTree_buildNode(node, lastNode) {
		if (!this.box) return;
		var root  = node.tree;
		var pNode = (node.parent ? node.parent : node.tree);
		var nodeTbl = this.box.ownerDocument.createElement('TABLE');
		nodeTbl.id     		= 'nodeTable_'+node.id;
		nodeTbl.cellPadding = 0;
		nodeTbl.cellSpacing = 0;

		var infoTr   = nodeTbl.insertRow(nodeTbl.rows.length);
		var expCell  = infoTr.insertCell(infoTr.cells.length)
		expCell.id   = 'expCell_'+node.id;
		expCell.innerHTML          = '&nbsp;';
		expCell.style.fontFamily   = 'verdana';
		expCell.style.fontSize     = '7px';
		expCell.style.paddingLeft  = '5px';
		expCell.style.paddingRight = '7px';

		// ----- IMAGE TD --------

		var cellImg = '';
		if (node.picture) {
			cellImg = node.picture;
		} else {
			if (node.tree.picture) { cellImg = node.tree.picture; }
		}
		if (cellImg > '') {
			if (document.all) {
				cellImg = '<img src="'+ top.jsUtils.sys_path +'/images/empty.gif" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\''+ cellImg +'\'")>';
			} else {
				cellImg = '<img src="'+ cellImg +'">';
			}
		} else {
			cellImg = '';
		}

		// ----- CELL STYLES --------

		var infoCell = infoTr.insertCell(infoTr.cells.length)
		infoCell.id     = 'infoCell_'+node.id;
		infoCell.vAlign = 'middle';

		if (node.selected) {
			var tblClass = 'tree_nodeSelected';
		} else {
			var tblClass = 'tree_node';
		}

		infoCell.innerHTML = '<table cellpadding="0" cellspacing="0" style="padding: 0px; padding-bottom: 1px" class="'+ tblClass +'"><tr>' +
							 (cellImg != '' ? '<td id="infoCell_img_'+ node.id +'" class="tree_nodeImg">' + cellImg + '</td>' : '')+
							 '<td id="infoCell_txt_'+ node.id +'"  class="tree_nodeTxt" nowrap>' + node.text + '</td></tr>'+
							 '</table>';

		// ------ EVENTS ----------

		// == Double Click
		if (node.parent == this) { nowner = 'root'; } else { nowner = node.parent.id; }
		var funcText =  "if (typeof(top.elements) != 'undefined') { "+
						"	zel = top.elements['"+ this.name +"']; " +
						"}"+
						"zel.nodeDblClick('"+ nowner +"', '"+ node.id +"');" +
						"doc = zel.box.ownerDocument; "+
						"if (doc.all) doc.selection.empty(); else doc.defaultView.getSelection().removeAllRanges();";
		if (document.all) infoCell.attachEvent('ondblclick', new Function(funcText));
					 else infoCell.addEventListener('dblclick', new Function(funcText), false);

		// == Mouse Down
		var funcText =  "if (typeof(top.elements) != 'undefined') { "+
						"	zel = top.elements['"+ this.name +"']; " +
						"}"+
						"zel.nodeClick('"+ nowner +"', '"+ node.id +"');" +
						"doc = zel.box.ownerDocument; "+
						"if (doc.all) doc.selection.empty(); else doc.defaultView.getSelection().removeAllRanges();"
		if (document.all) infoCell.attachEvent('onmousedown', new Function(funcText));
					 else infoCell.addEventListener('mousedown', new Function(funcText), false);

		// == Mouse Move
		var funcText =  "if (typeof(top.elements) != 'undefined') { "+
						"	zel = top.elements['"+ this.name +"']; " +
						"}"+
						"doc = zel.box.ownerDocument; "+
						"if (doc.all) doc.selection.empty(); else doc.defaultView.getSelection().removeAllRanges();";
		if (document.all) infoCell.attachEvent('onmousemove', new Function(funcText));
					 else infoCell.addEventListener('mousemove', new Function(funcText), false);

		// == Context Menu
		var funcText =  "if (typeof(top.elements) != 'undefined') { "+
						"	zel = top.elements['"+ this.name +"']; " +
						"}"+
						"zel.nodeContextMenu('"+ nowner +"', '"+ node.id +"');" +
						"doc = zel.box.ownerDocument; "+
						"if (doc.all) doc.selection.empty(); else doc.defaultView.getSelection().removeAllRanges();";
		if (document.all) infoCell.attachEvent('oncontextmenu', new Function(funcText));
					else  infoCell.addEventListener('contextmenu', new Function(funcText), false);

		// ------ SUB NODES -----------

		if (node.nodes.length > 0) {
			var childNodeTr  = nodeTbl.insertRow(nodeTbl.rows.length);
			childNodeTr.id   = 'nodeChild_'+node.id;
			if (!node.expanded) childNodeTr.style.display = 'none';

			var emptyNodeCell = childNodeTr.insertCell(childNodeTr.cells.length)
			var childNodeCell = childNodeTr.insertCell(childNodeTr.cells.length)
			childNodeCell.id  = 'nodeChildCell_'+node.id;

			var imgsrc = '';
			if (node.expanded) {
				if (lastNode) { imgsrc = this.LminusDotsImg; } else { imgsrc = this.TminusDotsImg; }
			} else {
				if (lastNode) { imgsrc = this.LplusDotsImg; } else { imgsrc = this.TplusDotsImg; }
			}
			expCell.style.cursor           = 'default';
			expCell.style.backgroundImage  = 'url('+imgsrc+')';
			expCell.style.backgroundRepeat = 'no-repeat';

			// == Open Node
			var funcText =  "if (typeof(top.elements) != 'undefined') { "+
							"	zel = top.elements['"+ this.name +"']; " +
							"}"+
							"zel.nodeOpenClose('"+ nowner +"', '"+ node.id +"'); "+
							"doc = zel.box.ownerDocument; "+
							"if (doc.all) doc.selection.empty(); else doc.defaultView.getSelection().removeAllRanges();";
			if (document.all) expCell.attachEvent('onmousedown', new Function(funcText));
						else expCell.addEventListener('mousedown', new Function(funcText), false);

			// == Mouse Move
			var funcText =  "if (typeof(top.elements) != 'undefined') { "+
							"	zel = top.elements['"+ this.name +"']; " +
							"}"+
							"doc = zel.box.ownerDocument; "+
							"if (doc.all) doc.selection.empty(); else doc.defaultView.getSelection().removeAllRanges();";
			if (document.all) expCell.attachEvent('onmousemove', new Function(funcText));
						 else expCell.addEventListener('mousemove', new Function(funcText), false);

			if (!lastNode) {
				emptyNodeCell.style.backgroundImage  = 'url('+this.IclearDotsImg+')';
				emptyNodeCell.style.backgroundRepeat = 'repeat-y';
			}

			// --- CHILD NODES ---
			var childTbl = this.box.ownerDocument.createElement('TABLE');
			if(document.all)
				childTbl.className = 'tree_nodeTable';
			else
				childTbl.setAttribute('class','tree_nodeTable')
			childTbl.cellPadding = 0;
			childTbl.cellSpacing = 0;
			for(var j=0; j<node.nodes.length; j++)
			{
				var childTr   = childTbl.insertRow(childTbl.rows.length);
				var childCell = childTr.insertCell(childTr.cells.length)
				if ((j+1) == node.nodes.length) lastNode = true; else lastNode = false;
				childCell.appendChild(this.buildNode(node.nodes[j], lastNode));
			}
			childNodeCell.appendChild(childTbl)

		} else {

			// ----- NOT SUB NODES ----------------
			expCell.innerHTML   	   = '&nbsp;';
			expCell.style.fontFamily   = 'verdana';
			expCell.style.fontSize     = '11px';
			expCell.style.paddingLeft  = '5px';
			expCell.style.paddingRight = '5px';
			var img = this.box.ownerDocument.createElement('IMG');
			if (lastNode) img.src = this.LclearDotsImg; else img.src = this.TclearDotsImg;
			expCell.style.backgroundImage  = 'url('+img.src+')';
			expCell.style.backgroundRepeat = 'no-repeat';
		}
		return nodeTbl;
	}

	function jsTree_nodeClick(pid, id) {
		if (!this.box) return;
		if (pid == 'root') { node = this; } else { node = this.findSubNode(this, pid); }
		cNode = this.findSubNode(node, id);

		if (this.onClick)  { ret = this.onClick(cNode); if (ret === false) return; }
		if (cNode.onClick) { ret = cNode.onClick(cNode); if (ret === false) return; }

		function unselectNode(node) {	
			// uselect node
			for (var i=0; i<node.nodes.length; i++) {
				sNode = node.nodes[i];
				if (sNode.selected) {
					nd = sNode.tree.box.ownerDocument.getElementById('infoCell_'+sNode.id)
					if (nd) { // if node is not deleted
						el = nd.firstChild;
						if(document.all) {
							el.className = 'tree_node';
						} else {
							el.setAttribute('class','tree_node')
						}
						sNode.selected = false;
					}
				}
				if (sNode.nodes.length > 0) unselectNode(sNode);
			}
		}
		unselectNode(this);

		// select node
		el = this.box.ownerDocument.getElementById('infoCell_'+cNode.id).firstChild;
		if(document.all) {
			el.className = 'tree_nodeSelected';
		} else {
			el.setAttribute('class','tree_nodeSelected')
		}
		cNode.selected    = true;
	}

	function jsTree_nodeDblClick(pid, id) {
		if (pid == 'root')
			var node = this;
		else
			var node = this.findSubNode(this, pid);
		var cNode = this.findSubNode(node, id);
		if (this.onDblClick)  { var ret = this.onDblClick(cNode); if (ret === false) return; }
		if (cNode.onDblClick) { var ret = cNode.onDblClick(); if (ret === false) return; }
	}

	function jsTree_nodeContextMenu(pid, id) {
		if (pid == 'root') node = this; else node = this.findSubNode(this, pid);
			cNode = this.findSubNode(node, id);

		if (this.onContextMenu)  { ret = this.onContextMenu(cNode); if (ret === false) return; }
		if (cNode.onContextMenu) { ret = cNode.onContextMenu(); if (ret === false) return; }
	}

	function jsTree_nodeOpenClose(pid, id) {
		if (!this.box) return;
		if (pid == 'root') node = this; else node = this.findSubNode(this, pid);
			cNode = this.findSubNode(node, id);

		el = this.box.ownerDocument.getElementById('nodeChild_'+id);

		if (el.style.display == 'none') {
				if (this.onOpen)  { ret = this.onOpen(cNode); if (ret === false) return; }
				if (cNode.onOpen) { ret = cNode.onOpen(); if (ret === false) return; }

				cNode.expanded = true;
				el.style.display = '';
		} else {
				if (this.onClose)  { ret = this.onClose(cNode); if (ret === false) return; }
				if (cNode.onClose) { ret = cNode.onClose(); if (ret === false) return; }

			el.style.display = 'none';
					cNode.expanded = false;
		}
		// change image on open/close
		imgsrc   = '';
		lastNode = (node.nodes[node.nodes.length-1] == cNode);
		expCell  = this.box.ownerDocument.getElementById('expCell_'+cNode.id);
		if (cNode.expanded)
			if (lastNode) { imgsrc = this.LminusDotsImg; } else { imgsrc = this.TminusDotsImg; }
		else
			if (lastNode) { imgsrc = this.LplusDotsImg; } else { imgsrc = this.TplusDotsImg; }

		expCell.style.cursor           = 'default';
		expCell.style.backgroundImage  = 'url('+imgsrc+')';
		expCell.style.backgroundRepeat = 'no-repeat';
	}

    if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;
}
if (top != window) top.jsNode = jsNode;
if (top != window) top.jsTree = jsTree;
