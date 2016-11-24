<?
$output = false;
require_once("../system/security.php");
if (!file_exists($_SESSION['edit'.$f.'_folder']."/".$_SESSION['edit'.$f.'_file'])) die();

if (isset($_POST['filecontent'])) {
	$ret = file_put_contents($_SESSION['edit'.$f.'_folder']."/".$_SESSION['edit'.$f.'_file'], $_POST['filecontent']);
	if ($ret) $msg = "- <span style='color: green'>Saved at ".date('h:i:s a')."</span>"; else $msg = "- <span style='color: red'>Error while saving</span>";
	print("<script> parent.document.getElementById('saved').innerHTML = \"$msg\"; </script>");
	die();
}

$file = file_get_contents($_SESSION['edit'.$f.'_folder']."/".$_SESSION['edit'.$f.'_file']);
?>
<html>
<head>
	<title> Edit: <?=$_SESSION['edit'.$f.'_file']?> </title>
</head>
<body style="margin: 0px; padding: 0px; overflow: hidden;">
<table cellpadding=2 cellspacing=0 style='font-family: verdana; font-size: 11px; width: 100%; height: 100%; background-color: f5effb'><tr style='height: 20px'>
	<td> <input type=button value='Save File' style='font-family: verdana; font-size: 11px;' onclick="document.getElementById('saved').innerHTML = '- saving...'; document.getElementById('lform').submit();" class=rText> <?=$_SESSION['edit'.$f.'_file']?> <span id=saved></span></td>
</tr></tr>
	<td><form id=lform method=post target=lframe style='margin: 0px; padding: 0px; width: 100%; height: 100%;'>
			<textarea name=filecontent style='padding: 3px; border: 1px solid silver; width: 100%; height: 100%; font-family: Courier New; font-size: 12px;'><?=$file?></textarea> 
		</form>
	</td>
</tr></table>
<iframe name=lframe style='position: absolute; width: 1px; height: 1px;' frameborder=0></iframe>
</body>
</html>
