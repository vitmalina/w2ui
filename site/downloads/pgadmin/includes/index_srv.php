<?
$output = false;
require_once("../system/security.php");
require_once($sys_folder."/libs/phpDB.php");
require_once($sys_folder."/libs/phpDBLib.php");

$lstParams = js_unescape($cmd);
$userid  = $_SESSION["ses_userid"];

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
	case "runSQL::edit_get_data":
		$sql = "SELECT null";
		edit_process($db, $lstParams, $sql);
		break;
		
	case "runSQL::edit_save_data":
		$sql = $_POST['sql'];
		$rs  = $db->execute($sql);
		if (!$rs) {
			$err = $db->res_errMsg;
			print("<textarea id=err>$err</textarea>".
				  "<script> parent.document.getElementById('sql_error').innerHTML = document.getElementById('err').value; </script>");
		} else {
			print("<script> top.elements.runSQL.saveDone(); </script>");
		}
		break;
		
	default:
		print("alert('List command is not recognized:  ".$lstParams['req_name']."::".$lstParams['req_cmd']."');");
		break;
}

?>