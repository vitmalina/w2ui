<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
	$dir = dirname(__FILE__);
?>

<div class="container">
	<div class="row">
		<div class="span2">
			<? require("grid-menu.php") ?>
		</div>
		<div class="span10">
			
			<h3>Events</h3>
			<? require($dir."/../summary/w2grid-events.php"); ?>

			<h4 style="margin-top: 20px; margin-bottom: 30px">Common Events</h4>
			<? $common_type = 'w2grid'; require($dir."/../summary/common-events.php"); ?>

		</div>
	</div>
</div>