<?
set_time_limit(7200);
$output = false;
require("../system/security.php");

$files = split('\^\^', $_GET['files']);
if (count($files) == 1 && !is_dir($_SESSION['fm_folder']."/".$files[0])) {
	$fname = $files[0];
	//if ($def_safeFiles != '' && substr($fname, strlen($fname)-2, 2) == '__') $fname = substr($fname, 0, strlen($fname)-2);
	header("Content-Type: application");
	header("Content-Disposition: attachment; filename=\"$fname\"");
	echo file_get_contents($_SESSION['fm_folder']."/".$files[0]);
} else {
	if ($def_archive == 'tar') {
		$temp = tempnam("/tmp", "fm_").".tar";
		$tar  = "tar -cf $temp ";
		foreach ($files as $key => $value) { $tar .= $value." "; };
		@chdir($_SESSION['fm_folder']);
		@exec($tar, $ret); 
		// download
		header("Content-Type: application");
		header("Content-Disposition: attachment; filename=\"files.tar\"");
		echo file_get_contents($temp);
	}
	if ($def_archive == 'tar.gz') {
		$temp = tempnam("/tmp", "fm_").".tar.gz";
		$tar  = "tar -czf $temp ";
		foreach ($files as $key => $value) { $tar .= $value." "; };
		@chdir($_SESSION['fm_folder']);
		@exec($tar, $ret); 
		// download
		header("Content-Type: application");
		header("Content-Disposition: attachment; filename=\"files.tar.gz\"");
		echo file_get_contents($temp);
	}
	if ($def_archive == 'tar.bz') {
		$temp = tempnam("/tmp", "fm_").".tar.bz";
		$tar  = "tar -cjf $temp ";
		foreach ($files as $key => $value) { $tar .= $value." "; };
		@chdir($_SESSION['fm_folder']);
		@exec($tar, $ret); 
		// download
		header("Content-Type: application");
		header("Content-Disposition: attachment; filename=\"files.tar.bz\"");
		echo file_get_contents($temp);
	}
	if ($def_archive == 'zip') {
		$temp = tempnam("/tmp", "fm_").".zip";
		$zip  = "zip -r $temp ";
		foreach ($files as $key => $value) { $zip .= $value." "; };
		@chdir($_SESSION['fm_folder']);
		@exec($zip, $ret); 
		// download
		header("Content-Type: application");
		header("Content-Disposition: attachment; filename=\"files.zip\"");
		echo file_get_contents($temp);
	}
}

?>