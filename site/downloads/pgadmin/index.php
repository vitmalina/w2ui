<?
require_once("conf.php");
require_once("system/security.php");	
require_once("system/libs/phpDB.php");

// -- initiate first database from the list

if ($_SESSION['ses_database'] == '') {
	$_SESSION['ses_database'] = current($sys_dbs);
}
$tmp = split(":", $_SESSION['ses_database']);
$sys_dbType 	= 'postgres';
$sys_dbIP		= $tmp[0];
$sys_dbPort		= $tmp[1]; 
$sys_dbLogin	= $tmp[2];
$sys_dbPass		= $tmp[3];
$sys_dbName		= 'template1'; 

$db = new phpDBConnection($sys_dbType);
$db->connect($sys_dbIP, $sys_dbLogin, $sys_dbPass, $sys_dbName, $sys_dbPort);

require("includes/features.php");

// one per cluster pg_database, pg_tablespace, pg_user, pg_group

// -- databases
if ($features[super_user] == 1) {
	$sql = "SELECT datname, usename, pg_encoding_to_char(encoding), datistemplate, datallowconn, 
				".($features[conn_limit] == 0 ? "null" : "datconnlimit").",  datconfig, datacl
			FROM pg_database, pg_user
			WHERE pg_database.datdba = pg_user.usesysid
			ORDER BY datname";
} else {
	$sql = "SELECT datname, usename, pg_encoding_to_char(encoding), datistemplate, datallowconn, 
				".($features[conn_limit] == 0 ? "null" : "datconnlimit").",  datconfig, datacl
			FROM pg_database, pg_user
			WHERE pg_database.datdba = pg_user.usesysid
				AND usename = '$sys_dbLogin'
			ORDER BY datname";
}
$rs  = $db->execute($sql);
$dbs = '';
while ($rs && !$rs->EOF) {
	if ($rs->fields['datistemplate'] != 't') {
		$dbs .= "var node = dbTree.addNode(dbs, 'db_".$rs->fields[0]."', '".$rs->fields[0]."');
				 node.picture = 'system/includes/silk/icons/database.png'; 
				 dbTree.addNode(node, 'tmp_".$rs->fields[0]."', '...');";
	}
	$rs->moveNext();
}

// -- db templates
$sql = "SELECT datname, usename, pg_encoding_to_char(encoding), datistemplate, datallowconn, 
			".($features[conn_limit] == 0 ? "null" : "datconnlimit").",  datconfig, datacl
		FROM pg_database, pg_user
		WHERE pg_database.datdba = pg_user.usesysid AND datistemplate = true
		ORDER BY datname";
$rs  = $db->execute($sql);
$templates = '';
while ($rs && !$rs->EOF) {
	if ($rs->fields['datallowconn'] == 't') {
		$templates .= "var node = dbTree.addNode(templates, 'db_".$rs->fields[0]."', '".$rs->fields[0]."');
					   node.picture = 'system/includes/silk/icons/database.png'; 
					   dbTree.addNode(node, 'tmp_".$rs->fields[0]."', '...');";
	}
	$rs->moveNext();
}
?>

<body style="overflow: hidden;">
	<div style="position: absolute; margin-top: 28px; overflow: hidden; left: 200px; ">
		<div id="dropDown" style="display: none; position: absolute; top: 30px; z-index: 100;"></div>
	</div>
	<div style="width: 100%; height: 100%;" id="page_body"> <div style="padding: 10px;">Loading...</div> </div>
	<iframe id=file_down frameborder=0 style='height: 1px; width: 1px; position: absolute;'></iframe>
</body>
<script src="system/libs/jsUtils.php"></script>
<script src="system/libs/jsLayout.php"></script>
<script src="system/libs/jsList.php"></script>
<script src="system/libs/jsEdit.php"></script>
<script src="system/libs/jsCalendar.php"></script>
<script src="system/libs/jsControls.php"></script>
<script src="system/libs/jsToolBar.php"></script>
<script src="system/libs/jsTree.php"></script>
<script src="system/libs/jsTabs.php"></script>
<?
	require('includes/server.php');
	require('includes/database.php');
	require('includes/table.php');
	require('includes/view.php');
	require('includes/seq.php');
	require('includes/fun.php');
?>
<script>
window.onload 	= init;
window.onresize = resize;
document.title 	= 'Web 2.0 PgAdmin';

var mLayout;
var dbTree;

function init() {
	top.superuser = <?=($features[super_user] == 1 ? 'true' : 'false')?>;
	// -- Tree
	dbTree = new top.jsTree('dbTree', null);
	dbTree.onOpen  = db_open;
	dbTree.onClose = db_close;
	dbTree.onClick = db_click;
	
	dbTree.style = 'border: 1px solid silver; background-color: white; overflow: auto;';
	var dbs = dbTree.addNode(dbTree, 'databases', 'Databases');
	dbs.picture  = 'system/includes/silk/icons/database.png';
	dbs.expanded = true;
	<?=$dbs?>
	
	var system = dbTree.addNode(dbTree, 'system', 'Server');
	system.picture  = 'system/includes/silk/icons/database_gear.png';
	var runtime = dbTree.addNode(system, 'runtime', 'Run-Time');
	runtime.picture  = 'system/includes/silk/icons/database_lightning.png';
	var activity = dbTree.addNode(runtime, 'activity', 'Activity');
	activity.picture  = 'system/includes/silk/icons/database_lightning.png';
	var vars = dbTree.addNode(runtime, 'vars', 'Variables');
	vars.picture  = 'system/includes/silk/icons/database_table.png';
	if (top.superuser) {
		var templates = dbTree.addNode(system, 'templates', 'Templates');
		templates.picture  = 'system/includes/silk/icons/database_key.png';
		<?=$templates?>
	}
	<? if ($features[table_space] == 1) { ?>
		var spaces = dbTree.addNode(system, 'spaces', 'Table Spaces');
		spaces.picture  = 'system/includes/silk/icons/database_save.png';
	<? } ?>
	var users = dbTree.addNode(system, 'users', 'DB Users');
	users.picture = 'system/includes/silk/icons/user.png';
	var users = dbTree.addNode(system, 'groups', 'User Groups');
	users.picture = 'system/includes/silk/icons/group.png';
	
	// --- Main Page Layout
	var toolHTML =  '<div id=toolbar style="padding-bottom: 2px; padding-left: 2px; background-image: url(system/images/toolbar_bg.png);"></div>';
	mLayout = new top.jsLayout('mLayout', document.getElementById('page_body'));
	mLayout.style   = 'background-color: #d9d9d9;';
	mLayout.padding = 1;
	mLayout.border  = 2;
	var panel = mLayout.addPanel('top', toolHTML, '', 30, false);
	panel.style_title = 'border: 0px; padding: 1px; margin: 1px;'
	var panel = mLayout.addPanel('left', '', '', 220, true);
	panel.style_body = 'border: 1px solid silver;'	
	mLayout.output();
	mLayout.initPanel('left', dbTree);

	// --- Toolbar
	var filesToolbar = new top.jsToolBar('filesToolbar', document.getElementById('toolbar'));
	filesToolbar.addButton('Connect', 'system/includes/silk/icons/database_connect.png', tbAction, 'Refresh Database List');
	filesToolbar.addBreak();
	filesToolbar.addButton('', 'system/includes/silk/icons/database_add.png', tbAction, 'Create new database');
	filesToolbar.addBreak();
	filesToolbar.addButton('Execute SQL', 'system/includes/silk/icons/wand.png', tbAction, 'Execute SQL Command');
	filesToolbar.addBreak();
	filesToolbar.addButton('', 'system/includes/silk/icons/database_table.png', tbAction, 'Create new schema in the current database');
	filesToolbar.addButton('New Table', 'system/includes/silk/icons/table.png', tbAction, 'Create new table in the current database');
	filesToolbar.addButton('', 'system/includes/silk/icons/table_sort.png', tbAction, 'Create new view in the current database');
	filesToolbar.addButton('', 'system/includes/silk/icons/table_key.png', tbAction, 'Create new sequence in the current database');
	filesToolbar.addButton('', 'system/includes/silk/icons/chart_curve.png', tbAction, 'Create new function in the current database');
	filesToolbar.addBreak();
	filesToolbar.addButton('Logout', 'system/includes/silk/icons/building_go.png', tbAction, 'Logout');
	filesToolbar.output();	
	document.getElementById('filesToolbar_right').innerHTML = 
		'<table width=100% cellpadding=0 cellspacing=0><tr><td align=right id=fprogress style="padding-right: 5px;"><a target="_blank" href="http://web20boom.com/pgadmin">Web 2.0 PgAdmin v.1.0</a>&nbsp;&nbsp;</td></tr></table>';

	// -- init other libraries
	init_server();
	init_database();
	init_table();
	init_view();
	init_seq();
	init_fun();
		
	mLayout.initPanel('main', top.elements.databases);
	resize();
}

function db_open(node) {
	// alert(node.id);
	if (node.id.length > 3 && node.id.substr(0, 3) == 'db_') {
		var db = node.id.substr(3);
		top.currentDB 		= db;
		top.currentSchema 	= null;
		top.elements.databases.serverCall('get_schemas', 'db::'+ db +';;nodeid::'+ node.id);
	}
	if (node.id.length > 4 && node.id.substr(0, 4) == 'sys_') {
		var db = node.id.substr(4);
		top.currentDB 		= db;
		top.currentSchema 	= null;
		top.elements.databases.serverCall('get_schemas2', 'db::'+ db +';;nodeid::'+ node.id);
	}
	if (node.id.length > 5 && node.id.substr(0, 5) == 'tbls_') {
		var db = node.id.substr(5).split('.')[0];
		var sc = node.id.substr(5).split('.')[1];
		top.currentDB 		= db;
		top.currentSchema 	= sc;
		top.elements.databases.serverCall('get_tables', 'db::'+ db +';;schema::'+ sc +';;nodeid::'+ node.id);
	}
	if (node.id.length > 6 && node.id.substr(0, 6) == 'views_') {
		var db = node.id.substr(6).split('.')[0];
		var sc = node.id.substr(6).split('.')[1];
		top.currentDB 		= db;
		top.currentSchema 	= sc;
		top.elements.databases.serverCall('get_views', 'db::'+ db +';;schema::'+ sc +';;nodeid::'+ node.id);
	}
	if (node.id.length > 5 && node.id.substr(0, 5) == 'seqs_') {
		var db = node.id.substr(5).split('.')[0];
		var sc = node.id.substr(5).split('.')[1];
		top.currentDB 		= db;
		top.currentSchema 	= sc;
		top.elements.databases.serverCall('get_seqs', 'db::'+ db +';;schema::'+ sc +';;nodeid::'+ node.id);
	}
	if (node.id.length > 5 && node.id.substr(0, 5) == 'funs_') {
		var db = node.id.substr(5).split('.')[0];
		var sc = node.id.substr(5).split('.')[1];
		top.currentDB 		= db;
		top.currentSchema 	= sc;
		top.elements.databases.serverCall('get_funs', 'db::'+ db +';;schema::'+ sc +';;nodeid::'+ node.id);
	}
}

function closeRunSQL() {
	el = document.getElementById("dropDown"); 
	if (el.shadow) top.jsUtils.clearShadow(el);
	top.jsUtils.slideUp(el); 
}

function execCommand(sql, onSuccess) {
	// adjust drop control
	var el = document.getElementById('dropDown');
	if (top.innerWidth == undefined) {	width  = top.document.body.clientWidth; } else { width = top.innerWidth; }
	el.style.dispaly = 'none';
	el.style.width   = 700;
	el.parentNode.style.left   = (width - 700)/2;
	if (el.shadow) top.jsUtils.clearShadow(el);
	top.tmp_add_el = el;
	// create edit page
	top.elements['runSQL'] = null;	
	runSQL = new top.jsEdit('runSQL', el);
	runSQL.srvParams['db'] = (top.currentDB ? top.currentDB : 'template1');
	runSQL.header = "Execute Command (Database: "+(top.currentDB ? top.currentDB : 'template1')+')';
	runSQL.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%; padding: 5px; padding-top: 0px;\" class=\"rText\">"+
					"	<tr>"+
					"		<td valign=\"top\" style=\"width: 100%; padding-left: 5px; padding-right: 5px;\">"+
					"			<textarea name=\"sql\" style='border: 1px solid silver; width: 100%; height: 180px; padding: 2px;'>"+ sql +"</textarea>"+
					"			<div id=sql_error style='color: red; padding: 0px; padding-top: 10px; padding-bottom: 5px;'></div>"+
					"		</td>"+
					"	</tr>"+
					"</table>";

	runSQL.addControl('save', 'Execute', '', 'style="width: 100px"');
	runSQL.addControl('button', 'Cancel', 'javascript: closeRunSQL()', 'style="width: 100px;"');

	runSQL.onSaveDone 	= new Function("closeRunSQL();" + onSuccess + ";");
	runSQL.srvFile 		= "includes/index_srv.php";
	runSQL.output();

	top.elements['runSQL'].onDataReceived = 
		new Function("top.jsUtils.slideDown(top.tmp_add_el, new Function(\"var el = top.tmp_add_el; if (el.shadow) { el.shadow.style.display = ''; } else { el.shadow = top.jsUtils.dropShadow(el); }\"));");
}

function db_close(node) {
}

var actTimer;
function db_click(node) {
	clearInterval(actTimer);
	switch (node.id) {
		case 'system': break;
		case 'templates': 
			top.elements.mLayout.initPanel('main', top.elements.templates); 
			break;
		case 'databases': 
			top.elements.mLayout.initPanel('main', top.elements.databases); 
			break;
		case 'spaces': 
			top.elements.mLayout.initPanel('main', top.elements.spaces); 
			break;
		case 'users': 
			top.elements.mLayout.initPanel('main', top.elements.users); 
			break;
		case 'groups': 
			top.elements.mLayout.initPanel('main', top.elements.groups); 
			break;
		case 'vars':
			top.elements.mLayout.initPanel('main', top.elements.vars); 
			break;
		case 'runtime':
		case 'activity':
			top.elements.mLayout.initPanel('main', top.elements.activity); 
			actTimer = setInterval('top.elements.activity.getData();', 3000);
			break; 
		default:
			// databases
			if (node.id.length > 3 && node.id.substr(0, 3) == 'db_') {
				var db = node.id.substr(3);
				top.currentDB 		= db;
				top.currentSchema 	= null;
				top.elements.schemas.srvParams['db'] = db; 
				top.elements.mLayout.initPanel('main', top.elements.schemas); 
				break;
			}
			// tables
			if (node.id.length > 5 && node.id.substr(0, 5) == 'tbls_') {
				var db = node.id.substr(5).split('.')[0];
				var sc = node.id.substr(5).split('.')[1];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.tables.srvParams['db'] = db;
				top.elements.tables.srvParams['schema'] = sc;
				top.elements.mLayout.initPanel('main', top.elements.tables); 
				break;
			}
			// schemas
			if (node.id.length > 4 && node.id.substr(0, 4) == 'sch_') {
				var db = node.id.substr(4).split('.')[0];
				var sc = node.id.substr(4).split('.')[1];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.tables.srvParams['db'] = db;
				top.elements.tables.srvParams['schema'] = sc;
				top.elements.mLayout.initPanel('main', top.elements.tables); 
				break;
			}
			// views
			if (node.id.length > 6 && node.id.substr(0, 6) == 'views_') {
				var db = node.id.substr(6).split('.')[0];
				var sc = node.id.substr(6).split('.')[1];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.views.srvParams['db'] = db;
				top.elements.views.srvParams['schema'] = sc;
				top.elements.mLayout.initPanel('main', top.elements.views); 
				break;
			}
			// sequences
			if (node.id.length > 5 && node.id.substr(0, 5) == 'seqs_') {
				var db = node.id.substr(5).split('.')[0];
				var sc = node.id.substr(5).split('.')[1];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.seqs.srvParams['db'] = db;
				top.elements.seqs.srvParams['schema'] = sc;
				top.elements.mLayout.initPanel('main', top.elements.seqs); 
				break;
			}
			// functions
			if (node.id.length > 5 && node.id.substr(0, 5) == 'funs_') {
				var db = node.id.substr(5).split('.')[0];
				var sc = node.id.substr(5).split('.')[1];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.funs.srvParams['db'] = db;
				top.elements.funs.srvParams['schema'] = sc;
				top.elements.mLayout.initPanel('main', top.elements.funs); 
				break;
			}
			// edit table
			if (node.id.length > 4 && node.id.substr(0, 4) == 'tbl_') {
				var db = node.id.substr(4).split('.')[0];
				var sc = node.id.substr(4).split('.')[1];
				var tb = node.id.substr(4).split('.')[2];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.tableData.searches   = [];
				top.elements.tableData.addSearch('Search', 'TEXT', '', '', '');
				top.elements.tableTabs.db	  	  = node.id.substr(4).split('.')[0];
				top.elements.tableTabs.table	  = node.id.substr(4);
				top.elements.tableTabs.rightTitle = '<a title="Click here to rename the table" id="tab_tableTabs_renameLink" href="javascript: renameTable(\''+ node.id +'\');">'+ 
													node.id.substr(4).split('.')[2] + '</a>';
				top.elements.mLayout.initPanel('main', top.elements.tableTabs); 
				//top.elements.tableTabs.setActive(0);
				break;
			}
			// edit view
			if (node.id.length > 5 && node.id.substr(0, 5) == 'view_') {
				var db = node.id.substr(5).split('.')[0];
				var sc = node.id.substr(5).split('.')[1];
				var tb = node.id.substr(5).split('.')[2];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.viewTabs.db	  	  = node.id.substr(5).split('.')[0];
				top.elements.viewTabs.view		  = node.id.substr(5);
				top.elements.viewTabs.rightTitle  = node.id.substr(5).split('.')[2];
				top.elements.mLayout.initPanel('main', top.elements.viewTabs); 
				//top.elements.viewTabs.setActive(0);
				break;
			}
			// edit sequence
			if (node.id.length > 4 && node.id.substr(0, 4) == 'seq_') {
				var db = node.id.substr(4).split('.')[0];
				var sc = node.id.substr(4).split('.')[1];
				var tb = node.id.substr(4).split('.')[2];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.seqTabs.db	  	  	= node.id.substr(4).split('.')[0];
				top.elements.seqTabs.seq		= node.id.substr(4);
				top.elements.seqTabs.rightTitle = node.id.substr(4).split('.')[2];
				top.elements.mLayout.initPanel('main', top.elements.seqTabs); 
				//top.elements.seqTabs.setActive(0);
				break;
			}
			// edit sequence
			if (node.id.length > 4 && node.id.substr(0, 4) == 'fun_') {
				var db = node.id.substr(4).split('.')[0];
				var sc = node.id.substr(4).split('.')[1];
				var tb = node.id.substr(4).split('.')[2];
				top.currentDB 		= db;
				top.currentSchema 	= sc;
				top.elements.funTabs.db	  	  	= node.id.substr(4).split('.')[0];
				top.elements.funTabs.fun		= node.id.substr(4);
				top.elements.funTabs.rightTitle = node.id.substr(4).split('.')[2].split('::')[0];
				top.elements.mLayout.initPanel('main', top.elements.funTabs); 
				//top.elements.funTabs.setActive(0);
				break;
			}
	}
}

function resize() {
	if (document.all) {
		var div1 = document.getElementById('page_body');
		div1.style.width  = document.documentElement.offsetWidth;
		div1.style.height = document.documentElement.offsetHeight;
	} else {
		var div1 = document.getElementById('page_body');
		div1.style.width  = parseInt(window.innerWidth);
		div1.style.height = parseInt(window.innerHeight);
	}
	top.elements.mLayout.resize();
}

function tbAction(cmd) {
	switch(cmd) {
		case 'filesToolbar_but0': // connect to a  databases
			mLayout.initPanel('main', top.elements.dbConnect);
			break;
			
		case 'filesToolbar_but2': // create database
			mLayout.initPanel('main', top.elements.databaseAdd);
			break;
			
		case 'filesToolbar_but4': // execute sql
			if (String(top.currentDB) == 'undefined') { alert('First select a database'); break; }
			open('includes/exec.php?db='+top.currentDB, '_blank');
			break;
			
		case 'filesToolbar_but6': // create schema
			if (String(top.currentDB) == 'undefined') { alert('First select a database'); break; }
			mLayout.initPanel('main', top.elements.schemaAdd);
			break;
			
		case 'filesToolbar_but7': // create table
			if (String(top.currentDB) == 'undefined') { alert('First select a database'); break; }
			mLayout.initPanel('main', top.elements.tableAdd);
			break;
			
		case 'filesToolbar_but8': // create view
			if (String(top.currentDB) == 'undefined') { alert('First select a database'); break; }
			mLayout.initPanel('main', top.elements.viewAdd);
			break;
			
		case 'filesToolbar_but9': // create sequence
			if (String(top.currentDB) == 'undefined') { alert('First select a database'); break; }
			mLayout.initPanel('main', top.elements.seqAdd);
			break;
			
		case 'filesToolbar_but10': // create function
			if (String(top.currentDB) == 'undefined') { alert('First select a database'); break; }
			mLayout.initPanel('main', top.elements.funAdd);
			break;
			
		case 'filesToolbar_but12': // logout
			top.location = 'system/logout.php';
			break;
			
		default: alert(cmd);
	}
}

function renameTable(nodeid) {
	var currName = document.getElementById('tab_tableTabs_renameLink').innerHTML;
	var newName  = prompt('Please provide new table name:', currName); 
	if (!newName || newName == '') return; 
	top.elements.tableFields.serverCall('rename_table', 'newName::'+ newName +';;nodeId::'+ nodeid);
}

function renameTableDone(nodeid, newName) {
	top.elements.tableTabs.table = newName; 
	top.elements.tableTabs.refresh(); 
	var nd  = top.elements.dbTree.getNode(nodeid); 
	var tmp = String(nd.id).split('.');
	nd.id   = tmp[0] + '.' + tmp[1] + '.' + newName;
	nd.text = newName; 
	nd.parent.refresh(); 
	db_click(nd);
}
</script>
</html>