<?
/*
<h3>Leave a Comment</h3>
<!-- Facebook Comments -->
<div class="fb-comments" data-href="<?=$url?>" data-num-posts="100" data-width="550"></div>
*/
?>

<? global $feedback; print($feedback); ?>

<!-- needed for facebook like button -->
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=252502608117650";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
</script>
<!-- -->
