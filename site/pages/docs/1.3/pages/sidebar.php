<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
	$dir = dirname(__FILE__);
?>

<div class="container">
	<div class="row">
		<div class="span2">
			<? require("sidebar-menu.php") ?>
		</div>
		<div class="span10">

			<? require($dir."/../overview/sidebar.html"); ?>

			<? global $feedback; print($feedback); ?>

		</div>
	</div>
</div>