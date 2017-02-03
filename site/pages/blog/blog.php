<?
	global $theme, $site_root;
	
	$artid = $_GET['s1'];
	
	// RSS
	if ($_REQUEST['page'] == 'blog' && $_REQUEST['s1'] == 'rss') {
		header('Content-Type: text/xml; charset=UTF-8');
		echo file_get_contents(getcwd().'/pages/blog/rss.xml');
		die();
	}
	
	if ($artid <= 10) {
		$theme->append('site-head',
			'<link rel="stylesheet" type="text/css" href="/src/w2ui-1.3.min.css" />'.
			'<script type="text/javascript" src="/src/w2ui-1.3.min.js"></script>'
		);
	}
	$theme->append('site-head', 
		"<script src=\"".$site_root."/js/CodeMirror/mode/less.js\"></script>".
		"<script src=\"".$site_root."/pages/code-mirror.js\"></script>"
		);

	if ($_REQUEST['a'] != '') $artid = $_REQUEST['a'];

	if ($artid == '' || intval($artid) == 0) {
		$url = $site_root."/blog/13/Info-Bubbles-in-the-Grid";
		die("<script> document.location = '$url'; </script>");
	}
	// needed for facebook comments
	$url = "http://w2ui.com/web/blog/?a=".$artid;
?>

<div class="container">
	<div class="row">
		<div class="spacer15"></div>

		<div class="span9">
			<? require("art-$artid.php") ?>
			
			<div class="spacer25"></div>

			<? require("blog-social.php"); ?>
			<? require("blog-comments.php"); ?>
		</div>

		<div class="span3">
			<? require("blog-right-side.php"); ?>
		</div>
	</div>
</div>