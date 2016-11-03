<?
	global $page, $section, $site_root, $version;
	if ($section != 'toolbar') $_REQUEST['s3'] = 'none';
?>

<ul class="nav nav-list">
	<li class="nav-header">Toolbar</li>
	<li <?=($_REQUEST['s3'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/toolbar">Overview</a></li>
	<li <?=($_REQUEST['s3'] == 'events' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/toolbar/events">Events</a></li>
	<li <?=($_REQUEST['s3'] == 'properties' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/toolbar/properties">Properties</a></li>
	<li <?=($_REQUEST['s3'] == 'methods' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/toolbar/methods">Methods</a></li>
</ul>
