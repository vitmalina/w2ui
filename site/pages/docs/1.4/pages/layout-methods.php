<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
	$dir = dirname(__FILE__);
?>

<div class="container">
	<div class="row">
		<div class="span2">
			<? require("layout-menu.php") ?>
		</div>
		<div class="span10">

			<h3>Methods</h3>
			<? require($dir."/../summary/w2layout-methods.php"); ?>

			<h4 style="margin-top: 20px; margin-bottom: 30px">Common Methods</h4>
			<? $common_type = 'w2layout'; require($dir."/../summary/common-methods.php"); ?>

		</div>
	</div>
</div>