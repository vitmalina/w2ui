<?
global $site_root; global $page;
$ip = explode(".", $_SERVER['REMOTE_ADDR']);
// filter out some IPs
?>

<!-- Top Menu -->

<div class="navbar navbar-inverse navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container">
      <div class="nav-collapse collapse">
        <div class="pull-right">
          <a class="brand" href="<?=$site_root?>/home" style="margin-top: -6px">w2ui</a>
        </div>
        <ul class="nav">
          <li <?=$page == "home" ? 'class="active"' : ''?>>
            <a href="<?=$site_root?>/home">Home</a>
          </li>
          <li <?=$page == "get-started" ? 'class="active"' : ''?>>
            <a href="<?=$site_root?>/get-started">Get started</a>
          </li>
          <li <?=$page == "demo" ? 'class="active"' : ''?>>
            <a href="<?=$site_root?>/demo">Demos</a>
          </li>
          <li <?=$page == "docs" ? 'class="active"' : ''?>>
            <a href="<?=$site_root?>/docs">Docs</a>
          </li>
          <?/*
          <li <?=$page == "mobile" ? 'class="active"' : ''?>>
            <a href="<?=$site_root?>/mobile">Mobile</a>
          </li>
          */?>
          <? if ($ip[0] != '17') { ?>
				  <li <?=$page == "support" ? 'class="active"' : ''?>>
					<a href="<?=$site_root?>/support">Training</a>
				  </li>
		  <? } ?>
          <li <?=$page == "blog" ? 'class="active"' : ''?>>
            <a href="<?=$site_root?>/blog">Blog</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
<div style="height: 10px"></div>