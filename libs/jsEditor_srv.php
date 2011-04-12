<?
require("../../conf.php");
require("phpDBLib.php");

$lstParams = js_unescape($_GET[cmd]);
$bfolder   = $sys_imageFolder;

switch ($lstParams['req_cmd']) 
{
	case "getFolders":
		if (strlen($bfolder) < strlen($_SERVER["DOCUMENT_ROOT"])) {
			print("<script> alert('Your \$sys_imageFolder is not defined or incorrect.'); </script>");
			die();
		}
		// -- read dir
		$rfolder = $lstParams[folder];
		print("<script>");
		print("var subfld = top.elements['editor_folders'].getNode('".addslashes($rfolder)."');
			   subfld.nodes = [];\n");
		if ($rfolder == '_top') { $rfolder = ""; }

		$files = Array();
		if (!is_readable($bfolder.$rfolder)) { 
			print("alert('The directory \"$bfolder/$rfolder\" is not readble (possibly permissions issue).');"); 
			die(); 
		}
		if (file_exists($bfolder.$rfolder) && $dh = opendir($bfolder.$rfolder)) {
			while (($file = readdir($dh)) !== false) {
				if (substr($file, 0, 1) == '.') continue;
				$ftype  = @filetype($bfolder.$rfolder."/".$file);
				if ($ftype == 'dir') {
					// check on subfolder
					$sub = false;
					if (file_exists($bfolder.$rfolder."/".$file) && $dh2 = opendir($bfolder.$rfolder."/".$file)) {
						while (($file2 = readdir($dh2)) !== false) {
							if (substr($file2, 0, 1) == '.') continue;
							$ftype2  = @filetype($bfolder.$rfolder."/".$file."/".$file2);
							if ($ftype2 == 'dir') { $sub = true; break; }
						}
						closedir($dh2);
					}
					$files[] = $file."::".($sub ? 1 : 0);
				} 
			}
			closedir($dh);
		}
		sort($files);
		foreach ($files as $k => $v) {
			$tmp = split("::", $v);
			print("var fld = top.elements['editor_folders'].addNode(subfld, '".$rfolder."/".addslashes($tmp[0])."', '".addslashes($tmp[0])."');");
			if ($tmp[1] == '1') {
				print("top.elements['editor_folders'].addNode(fld, '".$rfolder."/".addslashes($tmp[0])."_tmp', '...');");
			}
		}
		print("subfld.refresh();");
		print("</script>");
		break;
	
	case "getImages":
		if (strlen($bfolder) < strlen($_SERVER["DOCUMENT_ROOT"])) {
			print("<script> alert('Your \$sys_imageFolder is not defined or incorrect.'); </script>");
			die();
		}
		$tsize	 = 70;
		if ($lstParams['thumb_size'] == 'small') $tsize = 70;
		if ($lstParams['thumb_size'] == 'large') $tsize = 140;
		// -- read dir
		$rfolder = $lstParams[folder];
		print("<script>top.elements['".$lstParams['req_name']."'].currentFolder = '$rfolder';</script>"); 
		if ($rfolder == '_top') { $rfolder = ""; }
		print("<script>parent.document.getElementById('editor_progress').innerHTML = '';</script>\n");
		
		$files = Array();
		if (!is_readable($bfolder.$rfolder)) { 
			print("<script>alert('The directory \"$bfolder$rfolder\" is not readble (possibly permissions issue).');</script>"); 
			die(); 
		}
		if (file_exists($bfolder.$rfolder) && $dh = opendir($bfolder.$rfolder)) {
			while (($file = readdir($dh)) !== false) {
				if ($file == '.') continue;
				if ($file == '..') continue;
				$ftype  = @filetype($bfolder.$rfolder."/".$file);
				if ($ftype != 'dir') { 
					// check if this is a resize
					$tmp  = split("\.", $file);
					if (strtolower($tmp[1]) != 'jpg' && strtolower($tmp[1]) != 'png' && strtolower($tmp[1]) != 'gif') continue;
					$pos1 = strrpos($file, "-");
					if ($pos1 > 0) {
						$str1 = substr($tmp[0], $pos1+1);
						$str2 = substr($tmp[0], 0, $pos1);
						if (intval(str_replace('x', '', $str1)) > 0 && file_exists($bfolder.$rfolder."/".$str2.".".$tmp[1])) {
							continue;
						}
					}
					
					$files[] = $file; 
				} 
			}
			closedir($dh);
		}		
		sort($files);
		$vfolder = substr($bfolder, strlen($_SERVER[DOCUMENT_ROOT]));
		print("<script>var imgs = '';</script>");
		foreach ($files as $k => $v) {		
			list($width, $height) = getimagesize($bfolder.$rfolder."/".$v);
			print("<script>imgs += '<div style=\"width: ".($tsize+20)."px; height: ".($tsize+20)."px; float: left; overflow: hidden; margin: 2px; padding: 5px; border: 1px solid #e1e1e1; -moz-border-radius: 2px; border-radius: 2px; background: #f5f5f5;\"".
				  "		onmouseover = \"this.style.border = \\'1px solid #b6b6b6\\'; this.style.backgroundColor = \\'e6f0fa\\';\"".
				  "		onmouseout  = \"this.style.border = \\'1px solid #e1e1e1\\'; this.style.backgroundColor = \\'f5f5f5\\';\"".
				  "		ondblclick  = \"top.elements[\\'".$lstParams['req_name']."\\'].imageSelect(\\'$rfolder\\', \\'$v\\', null);\"".
				  "><table cellpadding=0 cellspacing=0 style=\"height: ".($tsize+20)."; width: 100%; font-family: verdana; font-size: 11px;\">".
				  "		<tr><td><div style=\"height: ".($tsize-10)."px; overflow: hidden;\"><table style=\"width: 100%; height: 100%;\"><tr><td align=center><img title=\"$v - $width x $height\" style=\"clear: both; margin-bottom: 5px;\" src=\"".getThumb($bfolder.$rfolder, $vfolder.$rfolder, $v, $k, $tsize)."\"></td></tr></table></div></td></tr>".
				  "		<tr><td align=center><div style=\"padding-top: 4px; width: ".$tsize."px; height: 30px; overflow: hidden;\">$v <br>$width x $height</div></td></tr>".
				  "</table></div>';</script>\n");
		}
		print("<script>parent.document.getElementById('insertImage_pic').innerHTML = imgs;</script>");
		break;
		
	case "getImageBySize":
		if (strlen($bfolder) < strlen($_SERVER["DOCUMENT_ROOT"])) {	die(); }
		// -- get parameters
		$folder 	= $bfolder.$lstParams[folder];
		$file   	= $lstParams[file];
		$tmp		= split('x', $lstParams[size]);
		$newWidth	= $tmp[0];
		$newHeight	= $tmp[1];
		list($width, $height) = getimagesize($folder."/".$file);
		
		if ($newWidth == 'o') { // original size
			echo file_get_contents($folder."/".$file);
		} else {
			if ($newHeight == '') $newHeight = ($height / $width) * $newWidth;
			if ($newWidth  == '') $newWidth  = ($width / $height) * $newHeight;
			// -- create image
			$tmp = split("\.", $file);
			$dest = imagecreatetruecolor($newWidth, $newHeight);
			switch (strtolower($tmp[1])) {
				case 'jpg':
					$src = imagecreatefromjpeg($folder."/".$file);
					imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
					Header("Content-Type: image/jpeg");
					imagejpeg($dest, null, 85);	
					break;
				case 'png':
					$src = imagecreatefrompng($folder."/".$file);
					imagealphablending($dest, false);
					imagesavealpha($dest, true);
					imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
					Header("Content-Type: image/png");
					imagepng($dest, null);	
					break;
				case 'gif':
					$src = imagecreatefromgif($folder."/".$file);
					imagealphablending($dest, false);
					imagesavealpha($dest, true);
					imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
					Header("Content-Type: image/gif");
					imagegif($dest, null);	
					break;
			}
			imagedestroy($dest);
		}
		break;
		
	case "insertImageBySize":
		if (strlen($bfolder) < strlen($_SERVER["DOCUMENT_ROOT"])) {
			print("alert('Your \$sys_imageFolder is not defined or incorrect.');");
			die();
		}
		// -- get parameters
		$folder 	= $bfolder.$lstParams[folder];
		$file   	= $lstParams[file];
		$tmp		= split('x', $lstParams[size]);
		$newWidth	= $tmp[0];
		$newHeight	= $tmp[1];
		list($width, $height) = getimagesize($folder."/".$file);
		
		if ($newWidth == 'o') { // original size
			$destFile = $folder."/".$file;
		} else {
			if ($newHeight == '') $newHeight = ($height / $width) * $newWidth;
			if ($newWidth  == '') $newWidth  = ($width / $height) * $newHeight;
			// -- create image
			$tmp = split("\.", $file);
			$dest = imagecreatetruecolor($newWidth, $newHeight);
			$destFile = $folder."/".$tmp[0]."-".intval($newWidth)."x".intval($newHeight)."\.".$tmp[1];
			switch (strtolower($tmp[1])) {
				case 'jpg':
					$src = imagecreatefromjpeg($folder."/".$file);
					imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
					imagejpeg($dest, stripslashes($destFile), 85);	
					break;
				case 'png':
					$src = imagecreatefrompng($folder."/".$file);
					imagealphablending($dest, false);
					imagesavealpha($dest, true);
					imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
					imagepng($dest, stripslashes($destFile));
					break;
				case 'gif':
					$src = imagecreatefromgif($folder."/".$file);
					imagealphablending($dest, false);
					imagesavealpha($dest, true);
					imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
					imagegif($dest, stripslashes($destFile));
					break;
			}
			imagedestroy($dest);
		}
		// -- insert image
		print("
			var obj = top.elements[top.tmp_editor];
			var editor = obj.box.ownerDocument.getElementById(obj.name+'_editor').contentDocument;
			var img = '<img src=\"".substr($destFile, strlen($_SERVER['DOCUMENT_ROOT']))."\" style=\"float: left; margin: 5px; marging-left: 5px;\" />';
			editor.execCommand('insertHTML', null, img);
		");
		break;
		

	default:
		print("alert('List command is not recognized:  ".$lstParams['req_cmd']."');");
		break;
}

function getThumb($folder, $vfolder, $file, $cnt, $tsize) {
	global $files;
	// create folder
	if (!file_exists($folder."/.thumbs")) {
		@mkdir($folder."/.thumbs", 0777);
		if (!file_exists($folder."/.thumbs")) {
			print("<script>alert('Cannot create .thumbs directory in $folder');</script>");
			die();
		}
		chmod($folder."/.thumbs", 0777);
	}
	$tmp = split("\.", $file);
	if (!file_exists($folder."/.thumbs/".$tmp[0]."_$tsize.".$tmp[1])) {
		if (($cnt+1) < count($files)) {
			print("<script>parent.document.getElementById('editor_progress').innerHTML = '<span style=\"background-color: red; color: white; padding: 2px;\"> Creating Thumbs ... (".($cnt+1)."/".count($files).") </span>';</script>\n");
		} else {
			print("<script>parent.document.getElementById('editor_progress').innerHTML = '';</script>\n");
		}
		ob_flush(); flush();
		list($width, $height, $type, $attr) = getimagesize($folder."/".$file);
		//print("<script>alert('$file $type');</script>");
		$newWidth  = $width;
		$newHeight = $height;
		if ($width >= $height && $width > $tsize) {
			$newWidth  = $tsize;
			$newHeight = ($height / $width) * $newWidth;
		}
		if ($width < $height && $height > $tsize) {
			$newHeight = $tsize - $tsize * 0.3;
			$newWidth  = ($width / $height) * $newHeight;
		}
		$dest = imagecreatetruecolor($newWidth, $newHeight);
		switch (strtolower($tmp[1])) {
			case 'jpg':
				$src = imagecreatefromjpeg($folder."/".$file);
				imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
				imagejpeg($dest, $folder."/.thumbs/".$tmp[0]."_$tsize.".$tmp[1], 75);	
				break;
			case 'png':
				$src = imagecreatefrompng($folder."/".$file);
				imagealphablending($dest, false);
				imagesavealpha($dest, true);
				imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
				imagepng($dest, $folder."/.thumbs/".$tmp[0]."_$tsize.".$tmp[1]);	
				break;
			case 'gif':
				$src = imagecreatefromgif($folder."/".$file);
				imagealphablending($dest, false);
				imagesavealpha($dest, true);
				imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
				imagegif($dest, $folder."/.thumbs/".$tmp[0]."_$tsize.".$tmp[1]);	
				break;
		}
		imagedestroy($dest);
	}
	return $vfolder."/.thumbs/".$tmp[0]."_$tsize.".$tmp[1];
}
?>