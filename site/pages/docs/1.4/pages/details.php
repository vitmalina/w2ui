<?
	global $site_root, $theme, $section, $version;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span2">
			<?
				$tmp = explode(".", $section);
				switch ($tmp[0]) {
					case 'w2layout':
						require("layout-menu.php");
						break;
					case 'w2grid':
						require("grid-menu.php");
						break;
					case 'w2toolbar':
						require("toolbar-menu.php");
						break;
					case 'w2sidebar':
						require("sidebar-menu.php");
						break;
					case 'w2tabs':
						require("tabs-menu.php");
						break;
					case 'w2form':
						require("forms-menu.php");
						break;
					case 'w2popup':
						require("popup-menu.php");
						break;
					case 'w2utils':
						require("utils-menu.php");
						break;
				}
				// common menus
				switch ($_REQUEST['s2']) {
					case 'layout':
						require("layout-menu.php");
						break;
					case 'grid':
						require("grid-menu.php");
						break;
					case 'toolbar':
						require("toolbar-menu.php");
						break;
					case 'sidebar':
						require("sidebar-menu.php");
						break;
					case 'tabs':
						require("tabs-menu.php");
						break;
					case 'form':
						require("forms-menu.php");
						break;
					case 'popup':
						require("popup-menu.php");
						break;
					case 'utils':
						require("utils-menu.php");
						break;
				}
			?>
		</div>
		<div class="span10">
			<h2><?=$section?></h2>
			
			<div class="obj-desc">			
			<?
				if ($tmp[1] == 'box' || $tmp[1] == 'name' || $tmp[1] == 'style' || $tmp[1] == 'handlers' ||
						$tmp[1] == 'onRender' || $tmp[1] == 'onResize' || $tmp[1] == 'onRefresh' || $tmp[1] == 'onDestroy' || 
						$tmp[1] == 'on' || $tmp[1] == 'off' || $tmp[1] == 'trigger' || $tmp[1] == 'render' || 
						$tmp[1] == 'refresh' || $tmp[1] == 'resize' || $tmp[1] == 'destroy') {
					$file = 'common.'.$tmp[1];
				} else {
					$file = $section;
				}
				if (file_exists("pages/docs/$version/details/".$file.".html")) {
					require("pages/docs/$version/details/".$file.".html");
				} else {
					print("Documentation is in progress... <br><br>But you can see/add community contributions.");
				}
			?>
			</div>
			
		    <? global $feedback; print($feedback); ?>
		    
		</div>
	</div>
</div>