<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span10">
			<h2>Tabs</h2>
			Tabs are a less frequent but sill an important UI element of your application. Usually, you do not need more then one set of tabs, but it is often 
			required to be able to add/remove, enable/disable, show/hide tabs dynamically. The tabs objects provides this funcitonality.
		</div>
		<div class="span2">
			<br>
			<a href="<?=$site_root?>/demos#!tabs" target="_blank" class="btn btn-success pull-right">
				More Demos
			</a>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<div style="height: 10px;"></div>
			<div id="tabs"></div>
			<div id="tab-content" style="height: 200px; border: 1px solid #ddd; border-top: 0px; padding: 10px">Tab: tab1</div>
			<div style="height: 10px;"></div>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Dynamic</h3>
			Some tabs can be permanent, some tabs can be dynamic (closable). You can create new tabs dynamically.
		</div>
		<div class="span4">
			<h3>JavaScript APIs</h3>
			All functionality can be accessed from JavaScript in short, human-readable commands. 
		</div>
		<div class="span4">
			<h3>Clean Syntax</h3>
			If it is easy to define a widget, it is easier to avoid mistakes. The code is clean and easy to read, as you can see below.
		</div>
	</div>

	<div class="row spacer"></div>
	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<h2>The Code</h2>
			<textarea class="javascript">
$('#tabs').w2tabs({
	name: 'tabs',
	active: 'tab1',
	tabs: [
		{ id: 'tab1', caption: 'Tab 1' },
		{ id: 'tab2', caption: 'Tab 2', closable: true },
		{ id: 'tab3', caption: 'Tab 3', closable: true },
		{ id: 'tab4', caption: 'Tab 4', closable: true },
		{ id: 'tab5', caption: 'Tab 5', closable: true },
		{ id: 'tab6', caption: 'Tab 6', closable: true },
		{ id: 'tab7', caption: 'Tab 7', closable: true },
		{ id: 'tab8', caption: 'Tab 8', closable: true }
	],
	onClick: function (event) {
		$('#tab-content').html('Tab: ' + event.target);
	}
});
			</textarea>
			Since the tab object only provides tab strip, you need second div for tab content. Here are two divs that you need:
			<textarea class="html">
<div id="tabs"></div>
<div id="tab-content" style="height: 200px; border: 1px solid #ddd; border-top: 0px;">tab1</div>
			</textarea>
		</div>
	</div>
	
	<? global $feedback; print($feedback); ?>
	
</div>

<script>
$(function () {
	$('#tabs').w2tabs({
		name: 'tabs',
		active: 'tab1',
		tabs: [
			{ id: 'tab1', caption: 'Tab 1' },
			{ id: 'tab2', caption: 'Tab 2', closable: true },
			{ id: 'tab3', caption: 'Tab 3', closable: true },
			{ id: 'tab4', caption: 'Tab 4', closable: true },
			{ id: 'tab5', caption: 'Tab 5', closable: true },
			{ id: 'tab6', caption: 'Tab 6', closable: true },
			{ id: 'tab7', caption: 'Tab 7', closable: true },
			{ id: 'tab8', caption: 'Tab 8', closable: true }
		],
		onClick: function (event) {
			$('#tab-content').html('Tab: ' + event.target);
		}
	});
});
</script>
