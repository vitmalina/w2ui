<?
	global $page, $section, $site_root, $version;
	if ($section != 'layout') $_REQUEST['s3'] = 'layout';
?>

<ul class="nav nav-list">
	<li class="nav-header">Layout</li>
	<li <?=($_REQUEST['s3'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/layout">Overview</a></li>
	<li <?=($_REQUEST['s3'] == 'events' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/layout/events">Events</a></li>
	<li <?=($_REQUEST['s3'] == 'properties' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/layout/properties">Properties</a></li>
	<li <?=($_REQUEST['s3'] == 'methods' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/layout/methods">Methods</a></li>
</ul>
