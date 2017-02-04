<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span10">
			<h2>Toolbar</h2>
			The toolbar object provides a quick solution for a horizontal menu. The toolbar can hold different types of items such as buttons, drop down menus, 
			overlays, etc. The same toolbar object is used by the grid for its toolbar and can be completely controlled independently after the grid is created.
		</div>
		<div class="span2">
			<br>
			<a href="<?=$site_root?>/demos#!toolbar" target="_blank" class="btn btn-success pull-right">
				More Demos
			</a>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<div style="height: 30px;"></div>
			<div id="toolbar" style="padding: 4px; border: 1px solid #ccc"></div>
			<div style="height: 40px;"></div>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			By default, the toolbar is completely transparent. In the example above, I have defined a containter with a gradient fill. In the case of 
			the grid, the container with gradient fill is provided by the grid.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Buttons</h3>
			There are a number of buttons you can create: simple, radio, check buttons. All the buttons may have an image and a caption.
		</div>
		<div class="span4">
			<h3>Dropdowns</h3>
			Drop down menues and overlays are also supported. A menu will have selectable items. An overlay may contain any HTML text.
		</div>
		<div class="span4">
			<h3>Separators</h3>
			Groups fo buttons can be visually separated for better user presentation. You can split the toolbar and display items on the right.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>JavaScript APIs</h3>
			All functionality can be accessed from JavaScript in short, human-readble commands. 
		</div>
		<div class="span4">
			<h3>Clean Syntax</h3>
			If it is easy to define a widget, it is easy to avoid mistakes. The code is clean and easy to read as you can see below.
		</div>
		<div class="span4">
			<h3>Customizable</h3>
			If you require more then a button or menu, you can create an item that holds any HTML text. All toolbar methods can still be used.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<h2>The Code</h2>
			<textarea class="javascript">
$('#toolbar').w2toolbar({
	name: 'toolbar',
	items: [
		{ type: 'check',  id: 'item1', caption: 'Check', img: 'icon-page', checked: true },
		{ type: 'break',  id: 'break0' },
		{ type: 'menu',   id: 'item2', caption: 'Drop Down', img: 'icon-folder', items: [
			{ text: 'Item 1', icon: 'icon-page' }, 
			{ text: 'Item 2', icon: 'icon-page' }, 
			{ text: 'Item 3', value: 'Item Three', icon: 'icon-page' }
		]},
		{ type: 'break', id: 'break1' },
		{ type: 'radio',  id: 'item3',  group: '1', caption: 'Radio 1', icon: 'fa fa-star', checked: true },
		{ type: 'radio',  id: 'item4',  group: '1', caption: 'Radio 2', icon: 'fa fa-star-o' },
		{ type: 'spacer' },
		{ type: 'button',  id: 'item5',  caption: 'Item 5', icon: 'fa fa-home' }
	]
});
			</textarea>
			The gradient fill was defined as a CSS property of the containter, therefore, it is not in the code.
		</div>
	</div>
	
	<? global $feedback; print($feedback); ?>
	
</div>

<script>
$(function () {
	$('#toolbar').w2toolbar({
		name: 'toolbar',
		items: [
			{ type: 'check',  id: 'item1', caption: 'Check', img: 'icon-page', checked: true },
			{ type: 'break',  id: 'break0' },
			{ type: 'menu',   id: 'item2', caption: 'Drop Down', img: 'icon-folder', items: [
				{ text: 'Item 1', icon: 'icon-page' }, 
				{ text: 'Item 2', icon: 'icon-page' }, 
				{ text: 'Item 3', value: 'Item Three', icon: 'icon-page' }
			]},
			{ type: 'break', id: 'break1' },
			{ type: 'radio',  id: 'item3',  group: '1', caption: 'Radio 1', icon: 'fa fa-star', checked: true },
			{ type: 'radio',  id: 'item4',  group: '1', caption: 'Radio 2', icon: 'fa fa-star-o' },
			{ type: 'spacer' },
			{ type: 'button',  id: 'item5',  caption: 'Item 5', icon: 'fa fa-home' }
		]
	});
});
</script>