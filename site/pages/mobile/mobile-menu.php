<? global $page, $section, $site_root; ?>

<ul class="nav nav-list">
	<li class="nav-header">Touch</li>
	<li <?=($_REQUEST['s1'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/mobile">Overview</a></li>
	<li <?=($_REQUEST['s1'] == 'tutorial' ? 'class="active"' : '')?>><a href="<?=$site_root?>/mobile/tutorial">Tutorial</a></li>
	<!--li class="nav-header">Docs</li>
	<li <?=($_REQUEST['s1'] == 'properties' ? 'class="active"' : '')?>><a href="<?=$site_root?>/mobile/properties">Properties</a></li>
	<li <?=($_REQUEST['s1'] == 'methods' ? 'class="active"' : '')?>><a href="<?=$site_root?>/mobile/methods">Methods</a></li>
	<li <?=($_REQUEST['s1'] == 'events' ? 'class="active"' : '')?>><a href="<?=$site_root?>/mobile/events">Events</a></li-->
</ul>
