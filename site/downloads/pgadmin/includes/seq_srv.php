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
	case "seqData::edit_get_data":
		$seq = split("\.", $lstParams['seq']);
		$sql = "SELECT sequence_name, is_cycled, last_value, increment_by, min_value, max_value, cache_value 
				FROM ".$seq[1].".".$seq[2]; 
		edit_process($db, $lstParams, $sql);
		break;
		break;
		
	case "seqData::update":
		$seq = split("\.", $lstParams['seq']); 
		$sql = "SELECT * FROM ".$lstParams['seq'];
		$rs  = $db->execute($sql);
		$f   = $rs->fields;
		$sql = "ALTER SEQUENCE ".$seq[1].".".$seq[2]." INCREMENT ".$f[increment_by]." MINVALUE ".$f[min_value]. 
			   " MAXVALUE ".$f[max_value]." RESTART ".$f[last_value].";";
		// -- process edit
		print("top.execCommand(\"".$sql."\", 'top.elements.tablePriv.output();');");
		break;
	
	case "seqScript::edit_get_data":
		$seq = split("\.", $lstParams['seq']); 
		$sql = "SELECT * FROM ".$lstParams['seq'];
		$rs  = $db->execute($sql);
		$f   = $rs->fields;
		$sql = "CREATE SEQUENCE ".$seq[1].".".$seq[2]." INCREMENT ".$f[increment_by]." MINVALUE ".$f[min_value]. 
			   " MAXVALUE ".$f[max_value]." START ".$f[last_value].";";
		// -- process edit
		print("document.getElementById('sql').value = \"".$sql."\";");
		print("top.elements['seqScript'].dataReceived();");
		break;
	
	default:
		print("alert('List command is not recognized:  ".$lstParams['req_name']."::".$lstParams['req_cmd']."');");
		break;
}

?>