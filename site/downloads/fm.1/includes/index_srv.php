<?
set_time_limit(7200);
$output = false;
require("../system/security.php");
require($sys_folder."/libs/phpDBLib.php");

$lstParams = js_unescape($cmd);
$userid  = $_SESSION["ses_userid"];
// print("/*"); print_r($lstParams); print("*/");

if ($_SESSION['fm_folder'] == '' || $_SESSION['fm_name'] == '') { 
	$_SESSION['fm_name'] 	= key($def_folders); 
	$_SESSION['fm_folder'] 	= current($def_folders); 
}
$bkey	 = $_SESSION['fm_name'];
$bfolder = $_SESSION['fm_folder'];

// -- exclued .. folder
$lstParams['req_ids'] = str_replace('..,', '', $lstParams['req_ids']); 
if (trim($lstParams['req_ids']) == '..') $lstParams['req_ids'] = '';

switch ($lstParams['req_name']."::".$lstParams['req_cmd']) 
{
	case "files::lst_get_data" :
		// -- change folder if requsted 
		if ($lstParams['folder'] != '') {
			if ($lstParams['folder'] == '..') {
				$bfolder = substr($bfolder, 0, strrpos($bfolder, '/'));
				if ($bfolder == '') $bfolder = '/';
				if (strlen($def_folders[$bkey]) > strlen($bfolder)) $bfolder = $def_folders[$bkey]; 
				$_SESSION['fm_folder'] = $bfolder;
				print("top.elements.files.page_num = 0;");
				print("top.elements.files.output();");
			} else {
				if (is_dir($bfolder."/".$lstParams['folder'])) {
					// -- folder
					$bfolder .= '/'.$lstParams['folder'];
					$bfolder = str_replace('//', '/', $bfolder);
					$_SESSION['fm_folder'] = $bfolder;
				} else {
					// -- file
					$broot = $_SERVER['DOCUMENT_ROOT'];
					$bfile = $bfolder.'/'.$lstParams['folder'];
					$bfile = str_replace('//', '/', $bfile);
					if (strlen($bfile) >= strlen($broot) && substr($bfile, 0, strlen($broot)) == $broot) {	
						print("window.open('".addslashes(substr($bfile, strlen($broot)))."', '_blank');"); 
					} else {
						print("alert('Cannot open this file. You can still download it.');");
					}
					die("top.elements.files.dataReceived();");
				}
			}
		}
		$bfolder = str_replace('//', '/', $bfolder);
		print("top.elements['files'].items = [];\n");
		// -- read dir
		$folders = Array('..' => '');
		$files   = Array();
		if (!is_readable($bfolder)) { print("alert('The directory is not readble (possibly permissions issue).');"); die(); }
		if (file_exists($bfolder) && $dh = opendir($bfolder)) {
			while (($file = readdir($dh)) !== false) {
				if ($file == '.') continue;
				if ($file == '..') continue;
				$ftype  = @filetype($bfolder."/".$file);
				if ($ftype == 'dir') {
					$folders[$file] = $file; 
					$files_s[$file] = '';
				} else { 
					$files[$file] = $file;
					$files_s[$file] = @filesize($bfolder."/".$file);
				}
				$files_d[$file] = date("Y/m/d", @filectime($bfolder."/".$file));
				$files_t[$file] = date("H:i:s", @filectime($bfolder."/".$file));
				$files_dt[$file]= date("Y/m/d", @filectime($bfolder."/".$file))."-".date("H:i:s", @filectime($bfolder."/".$file));
				$files_r[$file] = substr(sprintf('%o', @fileperms($bfolder."/".$file)), -4);
				if (function_exists('posix_getpwuid')) {
					$fowner = posix_getpwuid(@fileowner($bfolder."/".$file)); 
					$fowner = $fowner['name'];
				} else {
					$fowner = @fileowner($bfolder."/".$file);
				}
				$files_o[$file] = $fowner;
			}
			closedir($dh);
		}
		if (is_array($lstParams['req_sort'])) {
			$csort  = trim(current($lstParams['req_sort']));
			$tmp_ar = null;
			if ($csort == '2 ASC')  { $corder = 'ASC'; } // -- name
			if ($csort == '2 DESC') { $corder = 'DESC'; }
			if ($csort == '3 ASC')  { $tmp_ar = $files_s;  $corder = 'ASC'; } // -- size
			if ($csort == '3 DESC') { $tmp_ar = $files_s;  $corder = 'DESC'; }
			if ($csort == '4 ASC')  { $tmp_ar = $files_dt; $corder = 'ASC'; } // -- date
			if ($csort == '4 DESC') { $tmp_ar = $files_dt; $corder = 'DESC'; }
			if ($csort == '5 ASC')  { $tmp_ar = $files_dt; $corder = 'ASC'; } // -- date
			if ($csort == '5 DESC') { $tmp_ar = $files_dt; $corder = 'DESC'; }
			if ($csort == '6 ASC')  { $tmp_ar = $files_p;  $corder = 'ASC'; } // -- date
			if ($csort == '6 DESC') { $tmp_ar = $files_p;  $corder = 'DESC'; }
			if ($csort == '7 ASC')  { $tmp_ar = $files_o;  $corder = 'ASC'; } // -- date
			if ($csort == '7 DESC') { $tmp_ar = $files_o;  $corder = 'DESC'; }
			// apply key and sort
			if ($tmp_ar != null) {
				$nfiles = Array(); 
				foreach($files as $k => $v) { $nfiles[$k] = $tmp_ar[$k]; } 
				$files = $nfiles;
			}
			// ---
			if ($corder == 'ASC')  { asort($folders); asort($files); }
			if ($corder == 'DESC') { arsort($folders); arsort($files); }
		} else {
			asort($folders);
			asort($files);
		}
		// -- output folders
		$c = 1;
		foreach ($folders as $key => $file) {
			if ($c == 1 || ($c > $lstParams['req_offset'] && $c <= $lstParams['req_offset'] + $lstParams['req_limit'])) {
				$img = '<img src="system/includes/silk/icons/folder.png">';
				print("top.elements['files'].addItem('".addslashes($key)."', ".
					"['<table cellpading=\"0\" cellspacing=\"0\"><tr><td>$img</td><td>".addslashes($key)."</td></tr></table>', ".
					"'', '".$files_d[$key]."', '".$files_t[$key]."', '".$files_r[$key]."', '".$files_o[$key]."']);\n");
			}
			$c++;
		}
		// -- output files
		foreach ($files as $key => $file) {
			if ($c > $lstParams['req_offset'] && $c <= $lstParams['req_offset'] + $lstParams['req_limit']) {
				$img = '<img src="system/includes/silk/icons/page.png?1=1">';
				$fname = $key;
				print("top.elements['files'].addItem('".addslashes($key)."', ".
					"['<table cellpading=\"0\" cellspacing=\"0\"><tr><td>$img</td><td>".addslashes($fname)."</td></tr></table>', ".
					"'".number_format($files_s[$key])."', '".$files_d[$key]."', '".$files_t[$key]."', '".$files_r[$key]."', '".$files_o[$key]."']);\n");
			}
			$c++;
		}
		$cnt = count($folders) + count($files) -1;
		print("
			top.elements['files'].count = $cnt;
			if ($cnt > 1000) top.elements.files.showFooter = true; else top.elements.files.showFooter = false;
			top.elements['files'].dataReceived();
			document.getElementById('path').innerHTML = '".addslashes($bkey).":".substr(addslashes($bfolder), strlen($def_folders[$bkey]))."';
		");
		break;
		
	case "files::create_folder":
		if (file_exists($bfolder."/".$lstParams['name'])) {
			print("alert('A file or a folder with this name already exists.');");
			break;
		}
		$fl = @mkdir($bfolder."/".$lstParams['name']);
		if ($fl === false) {
			print("alert('Cannot create folder. Possibly permissions problem.');");
		} else {
			print("top.elements.files.output();");
		}
		break;
		
	case "files::create_file":
		if (file_exists($bfolder."/".$lstParams['name'])) {
			print("alert('A file or a folder with this name already exists.');");
			break;
		}
		@chdir($_SESSION['fm_folder']);
		@exec("touch ".$lstParams['name']);
		print("top.elements.files.output();");
		break;
		
	case "files::edit":
		if (!file_exists($bfolder."/".$lstParams['req_ids']) || is_dir($bfolder."/".$lstParams['req_ids'])) {
			print("alert('You cannot edit selected file.');");
			die();
		}
		// --
		$ii = 0;
		while ($_SESSION["edit".$ii."_file"] != '') { $ii++; }
		$_SESSION['edit'.$ii.'_folder'] = $bfolder;
		$_SESSION['edit'.$ii.'_file']   = $lstParams['req_ids'];
		print('window.open("includes/edit.php?f='.$ii.'", "_blank");');
		break;
		
	case "files::rename":
		$old_name = $lstParams['old'];
		$new_name = $lstParams['new'];
		if ($def_safeFiles != '') {
			$safe = split(",", strtolower($def_safeFiles));
			// new
			$new_name = $lstParams['new'];
			$tmp  = split("\.", $new_name);
			$ext  = strtolower($tmp[count($tmp)-1]);
			$flag = false;
			foreach ($safe as $k => $v) { if ($ext == $v) { $flag = true; break; } }
			if ($flag == false) $new_name .= "__";
			// old
			$old_name = $lstParams['old'];
			$tmp  = split("\.", $old_name);
			$ext  = strtolower($tmp[count($tmp)-1]);
			$flag = false;
			foreach ($safe as $k => $v) { if ($ext == $v) { $flag = true; break; } }
			if ($flag == false) $old_name .= "__";
		}

		if (file_exists($bfolder."/".$new_name)) {
			print("alert('A file or a folder with this name already exists.');");
			break;
		}
		$fl = rename($bfolder."/".$old_name, $bfolder."/".$new_name);
		if ($fl === false) {
			print("alert('Cannot rename file or folder. Possibly permissions problem.');");
		} else {
			print("top.elements.files.output();");
		}
		break;
		
	case "files::copy":
		if ($lstParams['req_ids'] == '') break;
		$_SESSION['copy_folder'] = $bfolder;
		$_SESSION['copy_files']  = $lstParams['req_ids'];
		break;
		
	case "files::paste":
		if ($_SESSION['copy_folder'] == $bfolder) {
			print("alert('You cannot copy files into the same folder.');");
			die();
		}
		$tmp = split(',', $_SESSION['copy_files']);
		$bcopy = Array();
		foreach ($tmp as $key => $value) {
			copyFiles($_SESSION['copy_folder']."/".$value, $bfolder);
		}
		copyFiles2();
		print("top.elements.files.output();");
		break;
		
	case "files::delete":
		$files = split(',', $lstParams['req_ids']);
		foreach ($files as $key => $value) { delete($value); }
		print("top.elements.files.output();");
		break;
		
	case "files::open_folder":
		$fname = $lstParams['fname'];
		if ($fname != '') {
			$_SESSION['fm_name'] 	= $fname;
			$_SESSION['fm_folder']  = $def_folders[$fname];
			print("top.elements.files.page_num = 0;");
			print("top.elements.files.output();");
		}
		break;
		
	case "files::archive":
		$files = split(",", $lstParams['req_ids']);
		$i     = 1;
		$temp  = $_SESSION['fm_folder']."/archive_";
		switch (strtolower($def_archive)) {
			case 'tar':
				while (true) { if (file_exists($temp.$i.".".$def_archive)) { $i++; continue;} else { $temp = $temp.$i.".".$def_archive; break; } }
				$tar  = "tar -cf $temp ";
				foreach ($files as $key => $value) { $tar .= $value." "; };
				@chdir($_SESSION['fm_folder']);
				@exec($tar, $ret); 
				break;
				
			case 'tar.gz':
				while (true) { if (file_exists($temp.$i.".".$def_archive)) { $i++; continue;} else { $temp = $temp.$i.".".$def_archive; break; } }
				$tar  = "tar -czf $temp ";
				foreach ($files as $key => $value) { $tar .= $value." "; };
				@chdir($_SESSION['fm_folder']);
				@exec($tar, $ret); 
				break;
				
			case 'tar.bz':
				while (true) { if (file_exists($temp.$i.".".$def_archive)) { $i++; continue;} else { $temp = $temp.$i.".".$def_archive; break; } }
				$tar  = "tar -cjf $temp ";
				foreach ($files as $key => $value) { $tar .= $value." "; };
				@chdir($_SESSION['fm_folder']);
				@exec($tar, $ret); 
				break;
				
			case 'zip':
				while (true) { if (file_exists($temp.$i.".".$def_archive)) { $i++; continue;} else { $temp = $temp.$i.".".$def_archive; break; } }
				$zip  = "zip -r $temp ";
				foreach ($files as $key => $value) { $zip .= $value." "; };
				@chdir($_SESSION['fm_folder']);
				@exec($zip, $ret); 
				break;
		}
		print("alert('The archive \"".basename($temp)."\" is created');");
		print("top.elements.files.output();");
		break;
		
	case "files::unarchive":
		$file = $_SESSION['fm_folder']."/".$lstParams['req_ids'];
		$tmp  = split("\.", $file);
		$ext  = $tmp[count($tmp)-1];
		switch (strtolower($ext)) {
			case 'tar':
				$tar  = "tar -xf $file ";
				@chdir($_SESSION['fm_folder']);
				@exec($tar, $ret); 
				break;
				
			case 'gz':
				$tar  = "tar -xzf $file ";
				@chdir($_SESSION['fm_folder']);
				@exec($tar, $ret); 
				break;
				
			case 'bz':
				$tar  = "tar -xjf $file ";
				@chdir($_SESSION['fm_folder']);
				@exec($tar, $ret); 
				break;
				
			case 'zip':
				$zip  = "unzip -o $file ";
				@chdir($_SESSION['fm_folder']);
				@exec($zip, $ret); 
				break;				
				
			default : print("alert('The file is not an archive. Only .tar, .tar.gz, .tar.bz, .zip files.');");
		}
		print("top.elements.files.output();");
		break;
		
	default:
		print("alert('List command is not recognized:  ".$lstParams['req_name']."::".$lstParams['req_cmd']."');");
		break;
}

function delete($name) {
	global $bfolder;
	if (strlen($name) == '') return;
	$file = $bfolder."/".$name;
	@chmod($file,0777);
	if (is_dir($file)) {
		$handle = opendir($file);
		while($filename = readdir($handle)) {
			if ($filename != "." && $filename != "..") { delete($name."/".$filename); }
		}
		closedir($handle);
		@rmdir($file);
	} else {
		@unlink($file);
	}
	return $file;
}

function copyFiles($source, $dest) {
	global $bfolder;
	global $bcopy;
	if (strlen($source) == '') return;
	if (substr($source, strlen($source)-1) == '/') $source = substr($source, 0, strlen($source)-1);
	//print("Copy: $source = $dest \n");

	// -- build file names to copy
	if (is_dir($source)) {
		$handle = opendir($source);
		while($filename = readdir($handle)) {
			if ($filename != "." && $filename != "..") { 
				$tmp = split('/', $source);
				$bcopy[$dest."/".$tmp[count($tmp)-1]] = '^^create_dir~~';
				copyFiles($source."/".$filename, $dest."/".$tmp[count($tmp)-1]); 
			}
		}
		closedir($handle);
	} else {
		$bcopy[$source] = $dest."/".basename($source);
	}
}

function copyFiles2() {
	global $bcopy;
	foreach ($bcopy as $key => $value) {
		if ($value == '^^create_dir~~') { @mkdir($key); @chmod(0777, $key); continue;}
		@copy($key, $value);
	}
}

?>