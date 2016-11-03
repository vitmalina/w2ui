<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
	$dir = dirname(__FILE__);
?>

<div class="container">
	<div class="row">
		<div class="span2">
			<? require("forms-menu.php") ?>
		</div>
		<div class="span10">

			<h3>Properties</h3>
			<? require($dir."/../summary/w2form-props.php"); ?>

			<h4 style="margin-top: 20px; margin-bottom: 30px">Common Properties</h4>
			<? $common_type = 'w2form'; require($dir."/../summary/common-props.php"); ?>
		
		</div>
	</div>
</div>