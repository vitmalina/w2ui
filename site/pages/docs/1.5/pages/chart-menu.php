
<?
	global $page, $section, $site_root, $version;
	if ($section != 'tabs') $_REQUEST['s3'] = 'none';
?>

<ul class="nav nav-list">
	<li class="nav-header">Tabs</li>
	<li <?=($_REQUEST['s3'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/chart">Overview</a></li>
	<li <?=($_REQUEST['s3'] == 'events' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/chart/events">Events</a></li>
	<li <?=($_REQUEST['s3'] == 'properties' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/chart/properties">Properties</a></li>
	<li <?=($_REQUEST['s3'] == 'methods' ? 'class="active"' : '')?>><a href="<?=$site_root?>/docs/<?=$version?>/tabs/chart">Methods</a></li>
</ul>
