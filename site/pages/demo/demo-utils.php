<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span10">
			<h2>Utilities</h2>
			Utilities contain most common functions that are used accross w2ui library. These functions can also be utilized in your applications for data 
			validation, data encoding, transitions, etc. Type anything in the field below to see example of data validation.
		</div>
		<div class="span2">
			<br>
			<a href="<?=$site_root?>/demos#!utils" target="_blank" class="btn btn-success pull-right">
				More Demos
			</a>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<div id="form" class="w2ui-reset" style="padding: 15px; border: 1px solid silver; background-color: #F5F6F7; border: 1px solid #EAEBEE; height: 200px;">
				<input id="str" type="text" size="20" onkeyup="update()" style="border: 1px solid silver; padding: 3px;">
				<br><br>
				<div style="float: left; width: 99px; padding-bottom: 10px">isInt</div><div id="isInt" style="margin-left: 99px; padding-bottom: 10px">...</div>
				<div style="float: left; width: 99px; padding-bottom: 10px">isFloat</div><div id="isFloat" style="margin-left: 99px; padding-bottom: 10px">...</div>
				<div style="float: left; width: 99px; padding-bottom: 10px">isHex</div><div id="isHex" style="margin-left: 99px; padding-bottom: 10px">...</div>
				<div style="float: left; width: 99px; padding-bottom: 10px">isMoney</div><div id="isMoney" style="margin-left: 99px; padding-bottom: 10px">...</div>
				<div style="float: left; width: 99px; padding-bottom: 10px">isAlphaNumeric</div><div id="isAlphaNumeric" style="margin-left: 99px; padding-bottom: 10px">...</div>
				<div style="float: left; width: 99px; padding-bottom: 10px">isEmail</div><div id="isEmail" style="margin-left: 99px; padding-bottom: 10px">...</div>
			</div>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Validation</h3>
			If you need to make sure that user enters required data type, you can use data validation.
		</div>
		<div class="span4">
			<h3>Transitions</h3>
			If you have two absolute divs you can apply visual transitions based on CSS3 transformations.
		</div>
		<div class="span4">
			<h3>Encoding</h3>
			JavaScript function for based64 encoding/decoding, special HTML charector encoding/decoding. 
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Overlays</h3>
			Attach additional information as an overlay attached to a UI element.
		</div>
		<div class="span4">
			<h3>Tags</h3>
			Show hints (or errors) for input fields, buttons, controls when you need them.
		</div>
		<div class="span4">
			<h3>Render, Destroy</h3>
			User convenient common functions to work with w2ui widgets and events.
		</div>
	</div>

	<? global $feedback; print($feedback); ?>

</div>

<script>
function update() {
	$('#isInt').html(w2utils.isInt($('#str')[0].value) ? 'Yes' : '-');
	$('#isFloat').html(w2utils.isFloat($('#str')[0].value) ? 'Yes' : '-');
	$('#isHex').html(w2utils.isHex($('#str')[0].value) ? 'Yes' : '-');
	$('#isMoney').html(w2utils.isMoney($('#str')[0].value) ? 'Yes' : '-');
	$('#isAlphaNumeric').html(w2utils.isAlphaNumeric($('#str')[0].value) ? 'Yes' : '-');
	$('#isEmail').html(w2utils.isEmail($('#str')[0].value) ? 'Yes' : '-');
}
</script>