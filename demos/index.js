$(function () {
	// init layout
	var main_layout = $('#main_layout').w2layout({
		name: 'main_layout',
		panels: [
			{ type: 'top', size: 35, style: 'background-color: #323947; color: #C0C8D5;', hidden: true  },
			{ type: 'left', size: 240, resizable: true, style: 'border-right: 1px solid silver;' },
			{ type: 'main', style: 'background-color: white;' }
		]
	});
	w2ui['main_layout'].content('top', '<div style="padding: 9px;">'+
		'Theme: '+
		'<select onchange="$(\'#mainCSS\').attr(\'href\', this.value);">'+
		'	<option value="../css/w2ui.min.css">Default Theme</option>'+
		'	<option value="../css/w2ui-dark.min.css">Dark Theme</option>'+
		'</select>&nbsp;&nbsp;&nbsp;'+
		'Locale: '+
		'<select onchange="w2utils.locale({ path: \'../\', lang: this.value }); alert(\'Localization is only internal functions. You need to refresh to see it.\')">'+
		'	<option value="en-us">en-US</option>'+
		'	<option value="fr-fr">fr-FR</option>'+
		'	<option value="ru-ru">ru-RU</option>'+
		'</select>'+
		'</div>');
	// init sidebar
	w2ui['main_layout'].content('left', $().w2sidebar({
		name: 'demo-sidebar',
		img: null,
		nodes: [ 
			{ id: 'layout', text: 'Layout', img: 'icon-folder', group1: true,
				nodes: [
					{ id: 'layout-1', text: 'Simple Layout', icon: 'fa-columns' },
					{ id: 'layout-2', text: 'Resizable Panels', icon: 'fa-columns' },
					{ id: 'layout-3', text: 'Show/Hide Panels', icon: 'fa-columns' },
					{ id: 'layout-4', text: 'Load Content', icon: 'fa-columns' },
					{ id: 'layout-5', text: 'Transitions', icon: 'fa-columns' },
					{ id: 'layout-6', text: 'Event Listeners', icon: 'fa-columns' },
					{ id: 'layout-7', text: 'Nested Layouts', icon: 'fa-columns' },
					{ id: 'layout-8', text: 'Panel With Tabs', icon: 'fa-columns' },
					{ id: 'layout-9', text: 'Panel With Toolbar', icon: 'fa-columns' }
				]
			},
			{ id: 'grid', text: 'Grid', img: 'icon-folder', group1: true,
				nodes: [
					{ id: 'grid-1', text: 'Simple Grid', icon: 'fa-table' },
					{ id: 'grid-2', text: 'Record Row Formating', icon: 'fa-table' },
					{ id: 'grid-3', text: 'Grid Elements', icon: 'fa-table' },
					{ id: 'grid-4', text: 'Local Data', icon: 'fa-table' },
					{ id: 'grid-5', text: 'Load Data Once', icon: 'fa-table' },
					{ id: 'grid-6', text: 'Single or Multi Select', icon: 'fa-table' },
					{ id: 'grid-7', text: 'Sub Grids', icon: 'fa-table' },
					{ id: 'grid-8', text: 'Show/Hide Columns', icon: 'fa-table' },
					{ id: 'grid-9', text: 'Add/Remove Records', icon: 'fa-table' },
					{ id: 'grid-10', text: 'Select/Unselect Records', icon: 'fa-table' },
					{ id: 'grid-11', text: 'Fixed/Resisable', icon: 'fa-table' },
					{ id: 'grid-12', text: 'Column Sort', icon: 'fa-table' },
					{ id: 'grid-13', text: 'Column Groups', icon: 'fa-table' },
					{ id: 'grid-14', text: 'Summary Records', icon: 'fa-table' },
					{ id: 'grid-15', text: 'Simple Search', icon: 'fa-table' },
					{ id: 'grid-16', text: 'Advanced Search', icon: 'fa-table' },
					{ id: 'grid-17', text: 'Grid Toolbar', icon: 'fa-table' },
					{ id: 'grid-18', text: 'Master -> Detail', icon: 'fa-table' },
					{ id: 'grid-19', text: 'Two Grids', icon: 'fa-table' },
					{ id: 'grid-20', text: 'Render to a New Box', icon: 'fa-table' },
					{ id: 'grid-21', text: 'Inline Editing', icon: 'fa-table' },
					{ id: 'grid-22', text: 'Resizable Columns', icon: 'fa-table' },
					//{ id: 'grid-23', text: 'Re-Order records', icon: 'fa-table' },
					//{ id: 'grid-24', text: 'Locked Columns', icon: 'fa-table' }
				]
			},
			{ id: 'toolbar', text: 'Toolbar', img: 'icon-folder', group1: true,
				nodes: [
					{ id: 'toolbar-1', text: 'Simple Toolbar', icon: 'fa-hand-up' },
					{ id: 'toolbar-2', text: 'Advanced Toolbar', icon: 'fa-hand-up' },
					{ id: 'toolbar-3', text: 'Add/Remove Buttons', icon: 'fa-hand-up' },
					{ id: 'toolbar-4', text: 'Show/Hide Buttons', icon: 'fa-hand-up' },
					{ id: 'toolbar-5', text: 'Enable/Disable Buttons', icon: 'fa-hand-up' }
				]
			},
			{ id: 'sidebar', text: 'Sidebar', img: 'icon-folder', group1: true,
				nodes: [
					{ id: 'sidebar-1', text: 'Simple Sidebar', icon: 'fa-hand-left' },
					{ id: 'sidebar-2', text: 'Add/Remove', icon: 'fa-hand-left' },
					{ id: 'sidebar-3', text: 'Show/Hide', icon: 'fa-hand-left' },
					{ id: 'sidebar-4', text: 'Enable/Disable', icon: 'fa-hand-left' },
					{ id: 'sidebar-5', text: 'Expand/Collapse', icon: 'fa-hand-left' },
					{ id: 'sidebar-6', text: 'Select/Unselect', icon: 'fa-hand-left' },
					{ id: 'sidebar-8', text: 'Top & Bottom HTML', icon: 'fa-hand-left' },
					{ id: 'sidebar-7', text: 'Events', icon: 'fa-hand-left' }
				]
			},
			{ id: 'tabs', text: 'Tabs', img: 'icon-folder', group1: true,
				nodes: [
					{ id: 'tabs-1', text: 'Simple Tabs', icon: 'fa-folder-close-alt' },
					{ id: 'tabs-2', text: 'Set a Tab Active', icon: 'fa-folder-close-alt' },
					{ id: 'tabs-3', text: 'Closable Tabs', icon: 'fa-folder-close-alt' },
					{ id: 'tabs-4', text: 'Add/Remove Tabs', icon: 'fa-folder-close-alt' },
					{ id: 'tabs-5', text: 'Enable/Disabled Tabs', icon: 'fa-folder-close-alt' },
					{ id: 'tabs-6', text: 'Show/Hide Tabs', icon: 'fa-folder-close-alt' }
				]
			},
			{ id: 'forms', text: 'Forms', img: 'icon-folder', group1: true,
				nodes: [
					{ id: 'forms-1', text: 'Simple Form', icon: 'fa-edit' },
					{ id: 'forms-2', text: 'Field Types', icon: 'fa-edit' },
					{ id: 'forms-3', text: 'Large Form', icon: 'fa-edit' },
					{ id: 'forms-4', text: 'Multi Page Form', icon: 'fa-edit' },
					{ id: 'forms-5', text: 'Form with Tabs', icon: 'fa-edit' },
					{ id: 'forms-8', text: 'Form in a Popup', icon: 'fa-edit' },
					{ id: 'forms-6', text: 'Events', icon: 'fa-edit' },
					{ id: 'forms-7', text: 'Input Controls', icon: 'fa-edit' }
				]
			},
			{ id: 'popup', text: 'Popup', img: 'icon-folder', group1: true,
				nodes: [
					{ id: 'popup-1', text: 'Simple Popup', icon: 'fa-list-alt' },
					{ id: 'popup-2', text: 'More Options', icon: 'fa-list-alt' },
					{ id: 'popup-3', text: 'Popup Panels', icon: 'fa-list-alt' },
					{ id: 'popup-4', text: 'Based on Markup', icon: 'fa-list-alt' },
					{ id: 'popup-5', text: 'Load Content', icon: 'fa-list-alt' },
					{ id: 'popup-6', text: 'Transitions', icon: 'fa-list-alt' },
					{ id: 'popup-7', text: 'Slide a Message', icon: 'fa-list-alt' }
				]
			},
			{ id: 'utils', text: 'Utilities', img: 'icon-folder', group1: true,
				nodes: [
					{ id: 'utils-1', text: 'Validation', icon: 'fa-star-empty' },
					{ id: 'utils-2', text: 'Encoding', icon: 'fa-star-empty' },
					{ id: 'utils-3', text: 'Transitions', icon: 'fa-star-empty' },
					{ id: 'utils-4', text: 'Overlays', icon: 'fa-star-empty' }
				]
			}
		],
		onClick: function (cmd) {
			if (parseInt(cmd.substr(cmd.length-1)) != cmd.substr(cmd.length-1)) return;
			var tmp = w2ui['demo-sidebar'].get(cmd);
			document.title = tmp.parent.text + ': ' + tmp.text + ' | w2ui';
			if (tmp.parent && tmp.parent.id != '') {
				var pid = w2ui['demo-sidebar'].get(cmd).parent.id;
				document.location.hash = '!'+ pid + '/' + cmd;
			}
			$.get('examples/'+ cmd +'.html', function (data) {
				w2ui['main_layout'].content('main', data);
				// html preview
				if ($('#example_html .preview').length > 0) {
					var ta = $('#example_html .preview')[0];
					$(ta).height(ta.scrollHeight + 2);
					var codeMissor1 = CodeMirror(
						function(elt) {
							$('#example_html .preview')[0].parentNode.replaceChild(elt, $('#example_html .preview')[0]);
						}, {
							value: $.trim($('#example_html .preview')[0].value),
							mode: "text/html",
							readOnly: true,
							gutter: true,
							lineNumbers: true
						}
					);
				}
				if ($('#example_js .preview').length > 0) {
					var ta = $('#example_js .preview')[0];
					$(ta).height(ta.scrollHeight + 2);
					var codeMissor2 = CodeMirror(
						function(elt) {
					  		$('#example_js .preview')[0].parentNode.replaceChild(elt, $('#example_js .preview')[0]);
						}, {
							value: $.trim($('#example_js .preview')[0].value),
							mode: "javascript",
							readOnly: true,
							gutter: true,
							lineNumbers: true
						}
					);
				}
				if ($('#example_json .preview').length > 0) {
					var ta = $('#example_json .preview')[0];
					$(ta).height(ta.scrollHeight + 2);
					var codeMissor3 = CodeMirror(
						function(elt) {
					  		$('#example_json .preview')[0].parentNode.replaceChild(elt, $('#example_json .preview')[0]);
						}, {
							value: $.trim($('#example_json .preview')[0].value),
							mode: "javascript",
							readOnly: true,
							gutter: true,
							lineNumbers: true
						}
					);
				}
				if ($('#example_html1 .preview').length > 0) {
					var ta = $('#example_html1 .preview')[0];
					$(ta).height(ta.scrollHeight + 2);
					var codeMissor4 = CodeMirror(
						function(elt) {
							$('#example_html1 .preview')[0].parentNode.replaceChild(elt, $('#example_html1 .preview')[0]);
						}, {
							value: $.trim($('#example_html1 .preview')[0].value),
							mode: "text/html",
							readOnly: true,
							gutter: true,
							lineNumbers: true
						}
					);
				}
				if ($('#example_html2 .preview').length > 0) {
					var ta = $('#example_html2 .preview')[0];
					$(ta).height(ta.scrollHeight + 2);
					var codeMissor5 = CodeMirror(
						function(elt) {
							$('#example_html2 .preview')[0].parentNode.replaceChild(elt, $('#example_html2 .preview')[0]);
						}, {
							value: $.trim($('#example_html2 .preview')[0].value),
							mode: "text/html",
							readOnly: true,
							gutter: true,
							lineNumbers: true
						}
					);
				}
			});
		}
	}));

	// check hash
	var tmp = String(document.location.hash).split('/');
	switch(tmp[0]) {

		default:
		case '#!layout':
			w2ui['demo-sidebar'].expand('layout');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'layout-1');
			break;

		case '#!grid':
			w2ui['demo-sidebar'].expand('grid');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'grid-1');
			break;

		case '#!toolbar':
			w2ui['demo-sidebar'].expand('toolbar');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'toolbar-1');
			break;

		case '#!sidebar':
			w2ui['demo-sidebar'].expand('sidebar');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'sidebar-1');
			break;

		case '#!tabs':
			w2ui['demo-sidebar'].expand('tabs');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'tabs-1');
			break;

		case '#!popup':
			w2ui['demo-sidebar'].expand('popup');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'popup-1');
			break;

		case '#!forms':
			w2ui['demo-sidebar'].expand('forms');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'forms-1');
			break;

		case '#!utils':
			w2ui['demo-sidebar'].expand('utils');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'utils-1');
			break;
	};
});