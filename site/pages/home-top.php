<?
	global $site_root, $theme;
	$theme->append('site-head', '
  <meta name="description" content="W2UI is a small JavaScript UI library with a complete set of widgets: layout, grid, sidebar, toolbar, tabs, fields, popup, utilities." />
  <meta property="og:title" content="New JavaScript UI Library" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="http://w2ui.com/web" />
  <meta property="og:image" content="http://w2ui.com/web/img/w2ui.png" />
  <meta property="og:site_name" content="W2UI" />
  <meta property="fb:admins" content="100005203482289" />
  <meta itemprop="name" content="New JavaScript UI Library">
  <meta itemprop="image" content="http://w2ui.com/web/img/w2ui.png">
	');
?>

<div class="large-preview" style="margin-top: -6px">
  <div class="container main-unit">
    <h1>w2ui</h1>
    <p class="sub-title">New JavaScript UI Library</p>
    <p>
        <a href="<?=$site_root?>/downloads/w2ui-1.5.rc1.zip" class="btn btn-primary btn-large">Download W2UI 1.5.rc1</a>
    </p>
    <ul>
      <li>
        <a href="http://github.com/vitmalina/w2ui">GitHub project</a>
      </li>
      <li>Version 1.5.rc1</li>
    </ul>
  </div>
</div>

<div class="row" style="background-color: #f5f5f5; border-bottom: 1px solid #ddd; padding: 15px; text-align: center;">

	<!-- github star -->
	<iframe class="github-btn" src="http://ghbtns.com/github-btn.html?user=vitmalina&amp;repo=w2ui&amp;type=watch&amp;count=true"
	  allowtransparency="true" frameborder="0" scrolling="0" width="110px" height="20px"></iframe>

	<!-- github clone -->
	<iframe class="github-btn" src="http://ghbtns.com/github-btn.html?user=vitmalina&amp;repo=w2ui&amp;type=fork&amp;count=true"
	  allowtransparency="true" frameborder="0" scrolling="0" width="110px" height="20px"></iframe>

	<!-- tweet -->
	<div style="position: relative; display: inline-block; width: 110px;">
		<a href="https://twitter.com/share" class="twitter-share-button" data-url="http://w2ui.com/web" data-text="New JavaScript UI Library" data-via="vitmalina" data-hashtags="JavaScript">Tweet</a>
		<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
	</div>

	<!-- google + -->
	<div style="position: relative; display: inline-block; width: 110px;">
		<div class="g-plusone" data-size="medium" data-href="http://w2ui.com/web"></div>
		<script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script>
	</div>

	<!-- facebook -->
	<iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fw2ui.com%2Fweb&amp;send=false&amp;layout=button_count&amp;width=110&amp;show_faces=false&amp;font&amp;colorscheme=light&amp;action=like&amp;height=21"
		scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:110px; height:21px;" allowTransparency="true"></iframe>
</div>