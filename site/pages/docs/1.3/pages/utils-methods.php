<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
	$dir = dirname(__FILE__);
?>

<div class="container">
	<div class="row">
		<div class="span2">
			<? require("utils-menu.php") ?>
		</div>
		<div class="span10">

			<h3>Methods</h3>
			<? require($dir."/../summary/w2utils-methods.php"); ?>

		</div>
	</div>
</div>