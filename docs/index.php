<?
$outputCloseHead = false;
require("tree.php");
?>
<link href="main.css" type="text/css" rel="stylesheet">
<link href="../css/w20-main.css" type="text/css" rel="stylesheet">
<link href="../css/w20-ui-blue.css" type="text/css" rel="stylesheet">
<link href="../css/w20-buttons.css" type="text/css" rel="stylesheet">

<script src="../libs/jsUtils.php"></script>	
<script src="../libs/jsLayout.php"></script>	
<script src="../libs/jsTree.php"></script>	
<script>
window.onload    = pload;
window.onresize	 = resize;

function pload() {	
	resizeDiv();
	initTree();
	// --- Main Page Layout (name, title, object, psize, resizable) 
	var docMain = '<table cellpadding=0 cellspacing=0 style="width: 100%; height: 100%;"><tr>'+
		'<td valign="top" id="doc_main" style="padding: 10px; padding-top: 0px;" class=body>'+
		'</td>'+
		'</tr></table>';	
	var docLayout = new top.jsLayout('docLayout', {
		box: document.getElementById('page_body'),
		panels: [
			{ name: 'left', size: 180, object: top.elements.docTree, resizable: true, style: 'overflow: auto' },
			{ name: 'main', body: docMain, style: 'overflow: auto' }
		]
	});
	docLayout.output();	
	docLayout.initPanel('main', docMain);
	resize();
}

function load(file) {
	jsUtils.get('docs/'+file, {}, function (data) {
		document.getElementById('doc_main').innerHTML = data;
	});
}

function resize() {
	resizeDiv();
	if (top.elements.supLayout) top.elements.supLayout.resize();
}

function resizeDiv() {
	if (window.innerHeight == undefined) {
		width  = parseInt(document.body.clientWidth);
		height = parseInt(document.body.clientHeight);
	} else {
		width  = parseInt(window.innerWidth);
		height = parseInt(window.innerHeight);
	}
	width  = width -4;
	height = height -4;
	var el = document.getElementById('page_body');
	try { // -- for IE
		el.style.width  = width;
		el.style.height = height;	
	} catch (e) {}
	var el = document.getElementById('wiki_text');
	try { // -- for IE
		el.style.height = height - 95;	
	} catch (e) {}
	
}
</script>
</head>
<body style="overflow: hidden; background-color: white; margin: 0px; padding: 0px;">
	<div id="page_body" style="position: absolute; top: 2px; left: 2px; padding: 0px; margin: 0px;"></div>
	<iframe style='width: 1px; height: 1px; top: -10px;' id=lframe frameborder=0></iframe>
</body>
</html>
