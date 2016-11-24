<?
	global $theme;
	$theme->append('site-head', '
  <meta property="og:type" content="website" />
  <meta property="fb:admins" content="100005203482289" />
  <meta property="og:image" content="http://w2ui.com/web/img/w2ui.png" />
  <meta property="og:site_name" content="W2UI" />
  <meta itemprop="image" content="http://w2ui.com/web/img/w2ui.png">
	');
	$art_url = "http://w2ui.com".$_SERVER['REQUEST_URI'];
?>
<!-- Twitter/Google+/Facebook -->
<div style="float: left; width: 110px; height: 32px;">
	<a href="https://twitter.com/share" class="twitter-share-button" data-hashtags="JavaScript">Tweet</a>
	<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>
</div>

<div style="float: left; width: 100px; height: 32px;">
	<!-- Place this tag where you want the +1 button to render -->
	<div class="g-plusone" data-size="medium" data-width="40" data-href="<?=$art_url?>"></div>

	<!-- Place this render call where appropriate -->
	<script type="text/javascript">
	  (function() {
		var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
		po.src = 'https://apis.google.com/js/plusone.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
	  })();
	</script>
</div>

<div style="margin-left: 190px; margin-top: -4px; height: 32px;">
	<div class="fb-like" data-send="false" data-href="<?=$art_url?>" data-width="110" data-show-faces="false" data-layout="button_count"></div>
</div>
<div style="height: 10px" class="spacer"></div>
<!-- -->
