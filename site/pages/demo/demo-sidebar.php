<?
	global $site_root, $theme;
	$theme->append('site-head', "<script src=\"".$site_root."/pages/code-mirror.js\"></script>");
?>

<div class="container">
	<div class="row">
		<div class="span10">
			<h2>Sidebar</h2>
			The sidebar object provides a quick solution for a vertical menu. In a way, it is similar to a tree widget, but offers more user-friendly 
			interaction. The menu can be nested to any level, but often a better user experience is to limit how deep the menu goes.
		</div>
		<div class="span2">
			<br>
			<a href="<?=$site_root?>/demos#!sidebar" target="_blank" class="btn btn-success pull-right">
				More Demos
			</a>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<div id="layout" style="height: 400px;"></div>
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span4">
			<h3>Groups</h3>
			Group similar nodes for a better user experience and faster navigation.
		</div>
		<div class="span4">
			<h3>Nested</h3>
			Sidebar allows to create nested menues in case you need one.
		</div>
		<div class="span4">
			<h3>Integrated</h3>
			Easy integration with other w2ui controls such as a layout.
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
			If it is easy to define a widget, it is easier to avoid mistakes. The code is clean and easy to read, as you can see below.
		</div>
		<div class="span4">
			<h3>Customizable</h3>
			If you are not satisfied with a node, you can specidy any HTML text instead of it.
		</div>
	</div>

	<div class="row spacer"></div>

	<div class="row">
		<div class="span12">
			<h2>The Code</h2>
			<textarea class="javascript">
// first define a layout
$('#layout').w2layout({
    name: 'layout',
    panels: [
        { type: 'left', size: 200, resizable: true, style: 'background-color: #F5F6F7;', content: 'left' },
        { type: 'main', style: 'background-color: #F5F6F7; padding: 5px;' }
    ]
});

// then define the sidebar
w2ui['layout'].content('left', $().w2sidebar({
	name: 'sidebar',
	img: null,
	nodes: [ 
		{ id: 'level-1', text: 'Level 1', img: 'icon-folder', expanded: true, group: true,
		  nodes: [ { id: 'level-1-1', text: 'Level 1.1', icon: 'fa fa-home' },
				   { id: 'level-1-2', text: 'Level 1.2', icon: 'fa fa-star' },
				   { id: 'level-1-3', text: 'Level 1.3', icon: 'fa fa-check-square-o' }
				 ]
		},
		{ id: 'level-2', text: 'Level 2', img: 'icon-folder', expanded: true, group: true,
		  nodes: [ { id: 'level-2-1', text: 'Level 2.1', img: 'icon-folder', 
					 nodes: [
					   { id: 'level-2-1-1', text: 'Level 2.1.1', img: 'icon-page' },
					   { id: 'level-2-1-2', text: 'Level 2.1.2', img: 'icon-page' },
					   { id: 'level-2-1-3', text: 'Level 2.1.3', img: 'icon-page' }
				 ]},
				   { id: 'level-2-2', text: 'Level 2.2', img: 'icon-page' },
				   { id: 'level-2-3', text: 'Level 2.3', img: 'icon-page' }
				 ]
		},
		{ id: 'level-3', text: 'Level 3', img: 'icon-folder', expanded: true, group: true,
		  nodes: [ { id: 'level-3-1', text: 'Level 3.1', img: 'icon-page' },
				   { id: 'level-3-2', text: 'Level 3.2', img: 'icon-page' },
				   { id: 'level-3-3', text: 'Level 3.3', img: 'icon-page' }
				 ]
		}
	],
	onClick: function (event) {
		w2ui['layout'].content('main', 'id: ' + event.target);
	}
}));
    		</textarea>
		</div>
	</div>
	
	<? global $feedback; print($feedback); ?>
	
</div>

<script>
$(function () {
	// first define a layout
    $('#layout').w2layout({
        name: 'layout',
        panels: [
            { type: 'left', size: 200, resizable: true, style: 'background-color: #F5F6F7;', content: 'left' },
            { type: 'main', style: 'background-color: #F5F6F7; padding: 5px;' }
        ]
    });
    // then define the sidebar
    w2ui['layout'].content('left', $().w2sidebar({
		name: 'sidebar',
		img: null,
		nodes: [ 
			{ id: 'level-1', text: 'Level 1', img: 'icon-folder', expanded: true, group: true,
			  nodes: [ { id: 'level-1-1', text: 'Level 1.1', icon: 'fa fa-home' },
					   { id: 'level-1-2', text: 'Level 1.2', icon: 'fa fa-star' },
					   { id: 'level-1-3', text: 'Level 1.3', icon: 'fa fa-check-square-o' }
					 ]
			},
			{ id: 'level-2', text: 'Level 2', img: 'icon-folder', expanded: true, group: true,
			  nodes: [ { id: 'level-2-1', text: 'Level 2.1', img: 'icon-folder', 
						 nodes: [
						   { id: 'level-2-1-1', text: 'Level 2.1.1', img: 'icon-page' },
						   { id: 'level-2-1-2', text: 'Level 2.1.2', img: 'icon-page' },
						   { id: 'level-2-1-3', text: 'Level 2.1.3', img: 'icon-page' }
					 ]},
					   { id: 'level-2-2', text: 'Level 2.2', img: 'icon-page' },
					   { id: 'level-2-3', text: 'Level 2.3', img: 'icon-page' }
					 ]
			},
			{ id: 'level-3', text: 'Level 3', img: 'icon-folder', expanded: true, group: true,
			  nodes: [ { id: 'level-3-1', text: 'Level 3.1', img: 'icon-page' },
					   { id: 'level-3-2', text: 'Level 3.2', img: 'icon-page' },
					   { id: 'level-3-3', text: 'Level 3.3', img: 'icon-page' }
					 ]
			}
		],
		onClick: function (event) {
			w2ui['layout'].content('main', 'id: ' + event.target);
		}
    }));
});
</script>