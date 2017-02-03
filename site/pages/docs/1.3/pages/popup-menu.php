<?
	global $page, $section, $site_root, $version;
	if ($section != 'popup') $_REQUEST['s3'] = 'none';
?>

<ul class="nav nav-list">
	<li class="nav-header">General</li>
	<li <?=($_REQUEST['s3'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/popup">Overview</a></li>
	<li <?=($_REQUEST['s3'] == 'events' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/popup/events">Events</a></li>
	<li <?=($_REQUEST['s3'] == 'props' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/popup/props">Properties</a></li>
	<li <?=($_REQUEST['s3'] == 'methods' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/popup/methods">Methods</a></li>
	<li class="nav-header">Related</li>
	<li <?=($_REQUEST['s3'] == 'dialogs' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/popup/dialogs">Dialogs</a></li>
	<li <?=($_REQUEST['s3'] == 'overlays' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/popup/overlays">Overlays</a></li>
</ul>