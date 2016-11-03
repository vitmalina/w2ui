<?
	global $page, $section, $site_root, $version;
	if ($section != 'form') $_REQUEST['s3'] = 'none';
?>

<ul class="nav nav-list">
	<li class="nav-header">Form</li>
	<li <?=($_REQUEST['s3'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form">Overview</a></li>
	<li <?=($_REQUEST['s3'] == 'events' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/events">Events</a></li>
	<li <?=($_REQUEST['s3'] == 'properties' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/properties">Properties</a></li>
	<li <?=($_REQUEST['s3'] == 'methods' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/methods">Methods</a></li>
	<li class="nav-header">Related</li>
	<li <?=($_REQUEST['s3'] == 'fields' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/fields">Fields</a></li>
</ul>
