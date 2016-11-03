<?php
ini_set('memory_limit', '80M');
set_time_limit(7200);
setcookie('PHPSESSID', $_POST['PHPSESSID']);

$output = false;
$sys_folder = str_replace("/includes/upload.php", "", str_replace("\\","/",__FILE__))."/system";
require_once($sys_folder."/security.php");

if ($_SESSION['fm_folder'] == '') die();

if (count($_FILES) > 0) {
	$arrfile = current($_FILES);
	$f_name  = $_SESSION['fm_folder']."/".$arrfile['name'];
	// check if file is safe
	if ($def_safeFiles != '') {
		$safe = split(",", strtolower($def_safeFiles));
		$tmp  = split("\.", $f_name);
		$ext  = strtolower($tmp[count($tmp)-1]);
		$flag = false;
		foreach ($safe as $k => $v) { if ($ext == $v) { $flag = true; break; } }
		if ($flag == false) $f_name .= "__";
	}
	move_uploaded_file($arrfile['tmp_name'], $f_name);
	chmod($f_name, 0777);
}
?>