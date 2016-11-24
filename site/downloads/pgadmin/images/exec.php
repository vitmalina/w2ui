<?
$output = false;
require("../conf.php");
require("../system/security.php");
require($sys_folder."/libs/phpDBLib.php");
?>

<html>
<head>
	<title>Database: <?=$_GET['db']?></title>
	<link rel="stylesheet" href="<?=$sys_path."/css/".$def_defaultCSS?>" type="text/css" />
	<style>
		body {
			 font-family: verdana; 
			 font-size: 11px;
		}
		input {
			 font-family: verdana; 
			 font-size: 11px;
		}
		table {
			 font-family: verdana; 
			 font-size: 12px;
		}
	</style>
	<script>
		window.onload 	= pload;
		window.onresize = presize;
		
		function pload() {
			top.jsLoader.loadClass('jsUtils');
			top.jsLoader.loadClass('jsUtils');
			top.jsLoader.loadClass('jsList');
			top.jsLoader.loadClass('jsEdit');

			presize();
			document.getElementById('sql').focus();
			top.jsLoader.onLoad = init;
		} 
		
		function presize() {
			// -- resize 
			if (window.innerHeight == undefined) {
				width  = this.box.ownerDocument.body.clientWidth;
				height = this.box.ownerDocument.body.clientHeight;
			} else {
				width  = window.innerWidth;
				height = window.innerHeight;
			}
			var tbl = document.getElementById('maintbl');
			tbl.style.left	 = 0;
			tbl.style.top	 = 0;
			tbl.style.width  = width;
			tbl.style.height = height;			
			document.getElementById('display').style.width  = width - 2;
			document.getElementById('display').style.height = height - 190;
		}
		
		function init() {
			// TABLE Data
			var execData = new top.jsList('execData', document.getElementById('display'));
			execData.header  = "Table Data";
			execData.showKey = true;
			execData.addColumn('Data', '100%', 'TEXT', '');
			//execData.addControl('add', 'Add New');
			//execData.addControl('delete', 'Delete');
			execData.srvParams['db'] = '<?=$_GET['db']?>';
			execData.srvFile = "exec_srv.php";	
			
			// TABLE Data: ADD
			var execDataAdd = new top.jsEdit('execDataAdd', document.getElementById('display'));
			execDataAdd.header = "Add/Edit Data";
			execDataAdd.showFooter = false;
			execDataAdd.tmpl = "<table cellpadding=\"3\" cellspacing=\"0\" style=\"width: 100%\" class=\"rText\">"+
							"	<tr>"+
							"		<td valign=\"top\" style=\"width: 100%\">~group1~</td>"+
							"	</tr>"+
							"	<tr><td colspan=2 align=center style=\"padding: 5px; background-color: #e0e7f4; border-top: 1px solid #d5e1f1; border-bottom: 1px solid #d5e1f1;\"> ~controls~ </td></tr>"+
							"</table>";

			group1 = execDataAdd.addGroup('group1', 'All Fields');
			group1.inLabel = 'width="70px"';
			//execDataAdd.addControl('save', 'Save', null);
			//execDataAdd.addControl('back', 'Cancel', null);
			execDataAdd.srvFile = "exec_srv.php";
			execDataAdd.srvParams['db'] = '<?=$_GET['db']?>';
			//execDataAdd.onComplete = execData;			
			//execData.onAddOrEdit   = execDataAdd;
		}
	</script>
</head>
<body style="background-color: #efeffb; margin: 0px; padding: 0px;">
	<form method=post target=lframe action="exec_srv.php">
		<input type=hidden name=type id=type>
		<input type=hidden name=db value="<?=$_GET['db']?>">
	<table cellpadding=5 cellspacing=0 id=maintbl style="position: absolute; width: 100%;">
	<tr><td style='background-color: #dae6f4; height: 15px;'> 
		<b>Execute SQL on Database: <?=$_GET['db']?></b>
	</td></tr>
	<tr><td style='height: 120px;'> 
		<textarea id=sql name=sql style='font-family: courier new; font-size: 13px; padding: 2px; width: 100%; height: 120px; border: 1px solid silver;'><?=$_POST['sql']?></textarea>
	</td></tr>
	<tr><td style='background-color: #dae6f4; height: 15px;'> 
		<input type=submit value="Execute" onclick="document.getElementById('display').innerHTML = ''; document.getElementById('type').value = 'e';" style='width: 80px;'>
		<input type=submit value="Preview" onclick="document.getElementById('display').innerHTML = ''; document.getElementById('type').value = 'p';" style='width: 80px;'>
		|
		<input type=submit value="Explain" onclick="document.getElementById('display').innerHTML = ''; document.getElementById('type').value = 'x';" style='width: 80px;'>
		<input type=submit value="Analyze" onclick="document.getElementById('display').innerHTML = ''; document.getElementById('type').value = 'xa';" style='width: 80px;'>
		<!--input type=submit value="Export"  onclick="document.getElementById('type').value = 'o';" style='width: 80px;'-->
	</td></tr>
	<tr><td style='padding: 0px;' valign=top> 
		<div id=display style='overflow: hidden; height: 100%;'></div>
	</td></tr>
	</table>
	</form>
	<iframe frameborder=0 style='width: 100px; height: 1px; position: absolute;' name=lframe></iframe>
</body>
<script src="../system/libs/jsLoader.php"></script>
</html>