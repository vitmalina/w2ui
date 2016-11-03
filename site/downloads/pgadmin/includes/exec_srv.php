<?
$output = false;
require_once("../system/security.php");
require_once($sys_folder."/libs/phpDB.php");
require_once($sys_folder."/libs/phpDBLib.php");

$lstParams = js_unescape($cmd);

$tmp = split(":", $_SESSION['ses_database']);
$sys_dbType 	= 'postgres';
$sys_dbIP		= $tmp[0];
$sys_dbPort		= $tmp[1]; 
$sys_dbLogin	= $tmp[2];
$sys_dbPass		= $tmp[3];
$sys_dbName		= ($_POST['db'] != '' ? $_POST['db'] : $lstParams['db']);

$db = new phpDBConnection($sys_dbType);
$db->connect($sys_dbIP, $sys_dbLogin, $sys_dbPass, $sys_dbName, $sys_dbPort);

require("features.php");

// -- special functions
if ($_POST['type'] != '') {
	$sql = stripslashes($_POST['sql']);
	switch ($_POST['type']) {
		case 'e':
			print("<textarea id=data>");
			// start timer
            list($usec, $sec) = explode(" ", microtime());
            $t1 = (float)$usec + (float)$sec;  // GET TIME
			// execute script
			$rs = $db->Execute($sql);
			// check timer
			list($usec, $sec) = explode(" ", microtime());
			$t2 = (float)$usec + (float)$sec; // GET TIME
			$db_time = round(((float)$t2 - (float)$t1) * 1000)/1000;

			if (!$rs) {
				$msg = "<span style='color: red'>".$db->res_errMsg."</span> ";
			} else {
				$msg = "Query Time: ".$db_time."<br>Affected Rows: ".$db->res_affectedRows."<br> Rows Returned: ".$db->res_rowCount."<br> Fields Returned: ".$db->res_fieldCount."";
			}
			print($msg);
			print("</textarea>");
			print("<script>
				window.onload = pload;
				function pload() {
					parent.document.getElementById('display').innerHTML = '<div style=\"padding: 10px; line-height: 135%;\">'+ document.getElementById('data').value +'</div>';
				}
			</script>");
			die();
			break;
			
		case 'p':
			// -- get fields
			$_SESSION['tmp_sql'] = $sql;
			$sql = "SELECT * FROM ($sql) list1 LIMIT 1";
			$rs  = $db->execute($sql);
			if (!is_array($db->res_fields)) {
				print("<script>
					window.onload = pload;
					function pload() {
						parent.document.getElementById('display').innerHTML = '<div style=\"padding: 10px; color: red;\">".$db->res_errMsg."</div>';
					}
				</script>");
				die();
			} else {
				print("<script>
							window.onload = pload;
							function pload() {");
			}
			// -- list
			$fields = $db->res_fields;
			print("top.elements.execData.columns = [];\n");
			foreach($fields as $k => $v) {
				print("top.elements.execData.addColumn('$v', '', 'Text', '');\n");
			}
			// -- edit
			print("top.elements.execDataAdd.fieldIndex = 0;\n".
				  "top.elements.execDataAdd.groups[0].fields = [];\n".
				  "var group = top.elements.execDataAdd.groups[0];\n");
			foreach($fields as $k => $v) print("group.addField('$v', 'Text', '$v', 'size=100', '', '', false, 0);\n");
			// output list
			print("top.elements.execData.output();");
			print("} </script>");
			die();
			break;
			
		case 'x':
			// -- get fields
			$_SESSION['tmp_sql'] = "EXPLAIN ".$sql;
			$rs  = $db->execute("EXPLAIN ".$sql);
			if (!is_array($db->res_fields)) {
				print("<script>
					window.onload = pload;
					function pload() {
						parent.document.getElementById('display').innerHTML = '<div style=\"padding: 10px; color: red;\">".$db->res_errMsg."</div>';
					}
				</script>");
				die();
			} else {
				print("<script>
							window.onload = pload;
							function pload() {");
			}
			// -- list
			$fields = $db->res_fields;
			print("top.elements.execData.columns = [];\n");
			foreach($fields as $k => $v) {
				print("top.elements.execData.addColumn('$v', '', 'Text', '');\n");
			}
			// output list
			print("top.elements.execData.output();");
			print("} </script>");
			die();
			break;
			
		case 'xa':
			// -- get fields
			$_SESSION['tmp_sql'] = "EXPLAIN ANALYZE ".$sql;
			$rs  = $db->execute("EXPLAIN ANALYZE ".$sql);
			if (!is_array($db->res_fields)) {
				print("<script>
					window.onload = pload;
					function pload() {
						parent.document.getElementById('display').innerHTML = '<div style=\"padding: 10px; color: red;\">".$db->res_errMsg."</div>';
					}
				</script>");
				die();
			} else {
				print("<script>
							window.onload = pload;
							function pload() {");
			}
			// -- list
			$fields = $db->res_fields;
			print("top.elements.execData.columns = [];\n");
			foreach($fields as $k => $v) {
				print("top.elements.execData.addColumn('$v', '', 'Text', '');\n");
			}
			// output list
			print("top.elements.execData.output();");
			print("} </script>");
			die();
			break;
	}
}

// -- list edit class functions
switch ($lstParams['req_name']."::".$lstParams['req_cmd']) 
{
	case "execData::lst_get_data":
		$sql = $_SESSION['tmp_sql'];
		list_process($db, $lstParams, $sql, "SELECT 50");
		break;

	default:
		print("alert('List command is not recognized:  ".$lstParams['req_name']."::".$lstParams['req_cmd']."');");
		break;
}

?>