<? global $page, $section, $site_root; ?>

<ul class="nav nav-list">
	<li class="nav-header">Support</li>
	<? /* <li <?=($_REQUEST['s1'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/support">Prototyping</a></li> */ ?>
	<? /* <li <?=($_REQUEST['s1'] == 'consulting' ? 'class="active"' : '')?>><a href="<?=$site_root?>/support/consulting">Consulting</a></li> */ ?>
	<li <?=($_REQUEST['s1'] == '' ? 'class="active"' : '')?>><a href="<?=$site_root?>/support/training">Training</a></li>
	<li <?=($_REQUEST['s1'] == 'contribute' ? 'class="active"' : '')?>><a href="<?=$site_root?>/support/contribute">Contributions</a></li>
</ul>
