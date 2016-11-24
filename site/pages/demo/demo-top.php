<? global $page, $section, $site_root; ?>

<div class="container" style="margin-top: 10px;">
	<div class="row">
		<div class="span12 navbar">
			<div class="navbar-inner">
				<ul class="nav">
				  <li <?=($section == 'layout' ? 'class="active"' : '')?>><a href="<?=$site_root?>/demo/layout">Layout</a> </li>
				  <li <?=($section == 'grid' ? 'class="active"' : '')?>><a href="<?=$site_root?>/demo/grid">Grid</a></li>
				  <li <?=($section == 'toolbar' ? 'class="active"' : '')?>><a href="<?=$site_root?>/demo/toolbar">Toolbar</a></li>
				  <li <?=($section == 'sidebar' ? 'class="active"' : '')?>><a href="<?=$site_root?>/demo/sidebar">Sidebar</a></li>
				  <li <?=($section == 'tabs' ? 'class="active"' : '')?>><a href="<?=$site_root?>/demo/tabs">Tabs</a></li>
				  <li <?=($section == 'form' ? 'class="active"' : '')?>><a href="<?=$site_root?>/demo/form">Form</a></li>
				  <li <?=($section == 'popup' ? 'class="active"' : '')?>><a href="<?=$site_root?>/demo/popup">Popup</a></li>
				  <li <?=($section == 'utils' ? 'class="active"' : '')?>><a href="<?=$site_root?>/demo/utils">Utilities</a></li>
				</ul>
				<ul class="nav pull-right">
				  <li><a>ver 1.4</a></li>
				</ul>
			</div>	
		</div>
	</div>
</div>