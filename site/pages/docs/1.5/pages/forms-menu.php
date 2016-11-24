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
	<li class="nav-header">Fields</li>
	<li <?=($_REQUEST['s3'] == 'fields-numeric' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/fields-numeric">Numeric</a></li>
	<li <?=($_REQUEST['s3'] == 'fields-date' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/fields-date">Date & Time</a></li>
	<li <?=($_REQUEST['s3'] == 'fields-list' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/fields-list">Drop Lists</a></li>
	<li <?=($_REQUEST['s3'] == 'fields-enum' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/fields-enum">Multi Selects</a></li>
	<li <?=($_REQUEST['s3'] == 'fields-upload' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/fields-upload">Upload</a></li>
	<li <?=($_REQUEST['s3'] == 'fields-custom' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/form/fields-custom">Custom</a></li>
</ul>
