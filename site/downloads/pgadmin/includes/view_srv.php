<?
$output = false;
require_once("../system/security.php");
require_once($sys_folder."/libs/phpDB.php");
require_once($sys_folder."/libs/phpDBLib.php");

$lstParams = js_unescape($cmd);

if ($lstParams['db'] == '') $lstParams['db'] = 'template1';

$tmp = split(":", $_SESSION['ses_database']);
$sys_dbType 	= 'postgres';
$sys_dbIP		= $tmp[0];
$sys_dbPort		= $tmp[1]; 
$sys_dbLogin	= $tmp[2];
$sys_dbPass		= $tmp[3];
$sys_dbName		= $lstParams['db'];

$db = new phpDBConnection($sys_dbType);
$db->connect($sys_dbIP, $sys_dbLogin, $sys_dbPass, $sys_dbName, $sys_dbPort);

require("features.php");

switch ($lstParams['req_name']."::".$lstParams['req_cmd']) 
{
	case "viewScript::edit_get_data":
		$vw  = split("\.", $lstParams['view']); 
		$sql = "SELECT definition FROM pg_views
				WHERE viewname = '".$vw[2]."'
					AND schemaname = '".$vw[1]."'";
		$rs  = $db->execute($sql);
		$sql = $rs->fields[0];
		// -- process edit
		print("document.getElementById('sql').value = \"CREATE OR REPLACE VIEW ".$lstParams['view']." AS \\n".addslashes($sql)."\";");
		print("top.elements['viewScript'].dataReceived();");
		break;
		
	case "viewData::lst_get_data":
		$tbl = split("\.", $lstParams['view']); 
		// -- get fields
		$sql = "SELECT * FROM ".$lstParams['view']." LIMIT 1";
		$rs  = $db->execute($sql);
		$fields = $db->res_fields;
		print("top.elements.viewData.columns = [];\n");
		foreach($fields as $k => $v) print("top.elements.viewData.addColumn('$v', '', 'Text', '');\n");
		// -- table data
		$sql = "SELECT 0, * FROM ".$lstParams['view']." WHERE ~SEARCH~";
		list_process($db, $lstParams, $sql);
		break;
		
	case "viewPriv::lst_get_data":
		$tbl = split("\.", $lstParams['view']); 
		// -- table rules
		$sql = "SELECT relacl FROM pg_class
				WHERE relnamespace IN (SELECT oid FROM pg_namespace WHERE nspname = '".$tbl[1]."') AND relname = '".$tbl[2]."'";
		$rs  = $db->execute($sql);
		$sql = "";
		while ($rs && !$rs->EOF) {
			$tmp = split(',', trim(trim($rs->fields[0], '{'), '}'));
			foreach ($tmp as $k => $v) {
				$t    = split('=', $v);
				$tt   = split('/', $t[1]);
				if ($sql != '') $sql .= " UNION ALL ";
				$rights = "";
				if (strpos($tt[0], 'r') !== false) $rights .= " SELECT,";
				if (strpos($tt[0], 'w') !== false) $rights .= " UPDATE,";
				if (strpos($tt[0], 'a') !== false) $rights .= " INSERT,";
				if (strpos($tt[0], 'd') !== false) $rights .= " DELETE,";
				if (strpos($tt[0], 'x') !== false) $rights .= " REFERENCES,";
				if (strpos($tt[0], 't') !== false) $rights .= " TRIGGER,";
				if (strpos($tt[0], 'X') !== false) $rights .= " EXECUTE,";
				if (strpos($tt[0], 'U') !== false) $rights .= " USAGE,";
				if (strpos($tt[0], 'C') !== false) $rights .= " CREATE,";
				if (strpos($tt[0], 'c') !== false) $rights .= " CONNECT,";
				if (strpos($tt[0], 'T') !== false) $rights .= " TEMPORARY,";
				if (strpos($tt[0], 'R') !== false) $rights .= " RULE,";
				if (strpos($tt[0], '*') !== false) $rights .= "'Preceding privilege'";
				if ($rights == "") continue;
				$rights = substr($rights, 0, strlen($rights)-1);
				$sql .= "(SELECT '".($t[0] != '' ? $t[0] : 'PUBLIC')."', '".($t[0] != '' ? $t[0] : 'PUBLIC')."', '".$rights."', '".$tt[1]."')"; 
			}
			$rs->moveNext();
		}
		if ($sql == "") $sql = "SELECT 1 FROM ".$lstParams['view']." WHERE 1=2";
		list_process($db, $lstParams, $sql);
		break;
		
	case "viewPriv::lst_del_records":
		$sql = "";
		$ids = split(',', $lstParams['req_ids']);
		foreach($ids as $k => $v) {
			$sql .= "REVOKE ALL PRIVILEGES ON ".$lstParams['view']." FROM $v;\\n";
		}
		print("top.execCommand(\"".$sql."\", 'top.elements.viewPriv.output();');");
		break;
		
	case "viewPrivAdd::edit_get_data":
		$sql = "SELECT null"; 
		edit_process($db, $lstParams, $sql);
		break;
		
	case "viewPrivAdd::edit_field_list":
		$sql = "SELECT 'PUBLIC', 'PUBLIC'
				UNION ALL
				(SELECT usename, usename FROM  pg_user ORDER BY usename)
				UNION ALL
				(SELECT 'GROUP ' || groname, 'GROUP: ' || groname FROM  pg_group ORDER BY groname)";
		buildOptions($db, $lstParams, $sql);
		break;
		
	case "viewPrivAdd::edit_save_data":
		$p = $_POST;
		$sql = "REVOKE ALL ON ".$lstParams['view']." FROM ".$p['user'].";\\n";
		if ($p['select'] == 't') 	$sql .= "GRANT SELECT ON ".$lstParams['view']." TO ".$p['user'].";\\n";
		if ($p['insert'] == 't') 	$sql .= "GRANT INSERT ON ".$lstParams['view']." TO ".$p['user'].";\\n";
		if ($p['update'] == 't') 	$sql .= "GRANT UPDATE ON ".$lstParams['view']." TO ".$p['user'].";\\n";
		if ($p['delete'] == 't') 	$sql .= "GRANT DELETE ON ".$lstParams['view']." TO ".$p['user'].";\\n";
		if ($p['rule'] == 't') 		$sql .= "GRANT RULE ON ".$lstParams['view']." TO ".$p['user'].";\\n";
		if ($p['references'] == 't')$sql .= "GRANT REFERENCES ON ".$lstParams['view']." TO ".$p['user'].";\\n";
		if ($p['trigger'] == 't') 	$sql .= "GRANT TRIGGER ON ".$lstParams['view']." TO ".$p['user'].";\\n";
		if ($p['all'] == 't') 		$sql  = "GRANT ALL ON ".$lstParams['view']." TO ".$p['user'].";\\n";
		print("<script>top.execCommand(\"".$sql."\", 'top.elements.viewPriv.output();');</script>");
		break;
		
	default:
		print("alert('List command is not recognized:  ".$lstParams['req_name']."::".$lstParams['req_cmd']."');");
		break;
}

?>