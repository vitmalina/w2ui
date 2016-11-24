<?
	global $page, $section, $site_root, $version;
	if ($section != 'utils') $_REQUEST['s3'] = 'none';
?>

<ul class="nav nav-list">
	<li class="nav-header">Utilities</li>
	<li <?=($_REQUEST['s3'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/utils">Overview</a></li>
	<li <?=($_REQUEST['s3'] == 'props' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/utils/props">Properties</a></li>
	<li <?=($_REQUEST['s3'] == 'methods' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/utils/methods">Methods</a></li>
	<li class="nav-header">Other</li>
	<li <?=($_REQUEST['s3'] == 'events' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/utils/events">Events</a></li>
	<li <?=($_REQUEST['s3'] == 'keyboard' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/utils/keyboard">Keyboard</a></li>
	<li <?=($_REQUEST['s3'] == 'plugins' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/utils/plugins">Plugins</a></li>
</ul>
