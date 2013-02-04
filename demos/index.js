$(function () {
	// init layout
	var main_layout = $('#main_layout').w2layout({
		name: 'main_layout',
		panels: [
			{ type: 'left', size: 220, resizable: true, style: 'background-color: #F5F6F7; border-right: 1px solid silver;' },
			{ type: 'main', style: '' }
		]
	});
	// init sidebar
	w2ui['main_layout'].content('left', $().w2sidebar({
		name: 'demo-sidebar',
		img: null,
		style: 'padding: 2px;',
		nodes: [ {
			id: 'main', expanded: true,	img: 'icon-folder',	text: 'Web 2.0 UI Demos',
			nodes: [
				{ id: 'layout', text: 'Layout', img: 'icon-folder',
					nodes: [
						{ id: 'layout-1', text: 'Simple Layout', img: 'icon-page' },
						{ id: 'layout-2', text: 'Resizable Panels', img: 'icon-page' },
						{ id: 'layout-3', text: 'Show/Hide Panels', img: 'icon-page' },
						{ id: 'layout-4', text: 'Load Content', img: 'icon-page' },
						{ id: 'layout-5', text: 'Transitions', img: 'icon-page' },
						{ id: 'layout-6', text: 'Event Listeners', img: 'icon-page' },
						{ id: 'layout-7', text: 'Nested Layouts', img: 'icon-page' }
					]
				},
				{ id: 'grid', text: 'Grid', img: 'icon-folder', expanded: false,
					nodes: [
						{ id: 'grid-1', text: 'Simple Grid', img: 'icon-page' },
						{ id: 'grid-2', text: 'Record Row Formating', img: 'icon-page' },
						{ id: 'grid-3', text: 'Grid Elements', img: 'icon-page' },
						{ id: 'grid-4', text: 'Local Data', img: 'icon-page' },
						{ id: 'grid-5', text: 'Load Data Once', img: 'icon-page' },
						{ id: 'grid-6', text: 'Single or Multi Select', img: 'icon-page' },
						{ id: 'grid-7', text: 'Sub Grids', img: 'icon-page' },
						{ id: 'grid-8', text: 'Show/Hide Columns', img: 'icon-page' },
						{ id: 'grid-9', text: 'Add/Remove Records', img: 'icon-page' },
						{ id: 'grid-10', text: 'Select/Unselect Records', img: 'icon-page' },
						{ id: 'grid-11', text: 'Fixed/Resisable', img: 'icon-page' },
						{ id: 'grid-12', text: 'Column Sort', img: 'icon-page' },
						{ id: 'grid-13', text: 'Column Groups', img: 'icon-page' },
						{ id: 'grid-14', text: 'Summary Records', img: 'icon-page' },
						{ id: 'grid-15', text: 'Simple Search', img: 'icon-page' },
						{ id: 'grid-16', text: 'Advanced Search', img: 'icon-page' },
						{ id: 'grid-17', text: 'Grid Toolbar', img: 'icon-page' },
						{ id: 'grid-18', text: 'Master -> Detail', img: 'icon-page' },
						{ id: 'grid-19', text: 'Two Grids', img: 'icon-page' },
						{ id: 'grid-20', text: 'Render to a New Box', img: 'icon-page' },
						{ id: 'grid-21', text: 'Inline Editing', img: 'icon-page' },
						{ id: 'grid-22', text: 'Resizable Columns', img: 'icon-page' },
						//{ id: 'grid-23', text: 'Re-Order records', img: 'icon-page' },
						//{ id: 'grid-24', text: 'Locked Columns', img: 'icon-page' }
					]
				},
				{ id: 'toolbar', text: 'Toolbar', img: 'icon-folder',
					nodes: [
						{ id: 'toolbar-1', text: 'Simple Toolbar', img: 'icon-page' },
						{ id: 'toolbar-2', text: 'Advanced Toolbar', img: 'icon-page' },
						{ id: 'toolbar-3', text: 'Add/Remove Buttons', img: 'icon-page' },
						{ id: 'toolbar-4', text: 'Show/Hide Buttons', img: 'icon-page' },
						{ id: 'toolbar-5', text: 'Enable/Disable Buttons', img: 'icon-page' }
					]
				},
				{ id: 'sidebar', text: 'Sidebar', img: 'icon-folder', expanded: false,
					nodes: [
						{ id: 'sidebar-1', text: 'Simple Sidebar', img: 'icon-page' },
						{ id: 'sidebar-2', text: 'Add/Remove', img: 'icon-page' },
						{ id: 'sidebar-3', text: 'Show/Hide', img: 'icon-page' },
						{ id: 'sidebar-4', text: 'Enable/Disable', img: 'icon-page' },
						{ id: 'sidebar-5', text: 'Expand/Collapse', img: 'icon-page' },
						{ id: 'sidebar-6', text: 'Select/Unselect', img: 'icon-page' },
						{ id: 'sidebar-7', text: 'Events', img: 'icon-page' }
					]
				},
				{ id: 'tabs', text: 'Tabs', img: 'icon-folder',
					nodes: [
						{ id: 'tabs-1', text: 'Simple Tabs', img: 'icon-page' },
						{ id: 'tabs-2', text: 'Set a Tab Active', img: 'icon-page' },
						{ id: 'tabs-3', text: 'Closable Tabs', img: 'icon-page' },
						{ id: 'tabs-4', text: 'Add/Remove Tabs', img: 'icon-page' },
						{ id: 'tabs-5', text: 'Enable/Disabled Tabs', img: 'icon-page' },
						{ id: 'tabs-6', text: 'Show/Hide Tabs', img: 'icon-page' }
					]
				},
				{ id: 'forms', text: 'Forms', img: 'icon-folder', 
					nodes: [
						{ id: 'forms-1', text: 'Simple Form', img: 'icon-page' },
						{ id: 'forms-2', text: 'Field Types', img: 'icon-page' },
						{ id: 'forms-3', text: 'Large Form', img: 'icon-page' },
						{ id: 'forms-4', text: 'Multi Page Form', img: 'icon-page' },
						{ id: 'forms-5', text: 'Form with Tabs', img: 'icon-page' },
						{ id: 'forms-6', text: 'Events', img: 'icon-page' },
						{ id: 'forms-7', text: 'Input Controls', img: 'icon-page' }
					]
				},
				{ id: 'popup', text: 'Popup', img: 'icon-folder',
					nodes: [
						{ id: 'popup-1', text: 'Simple Popup', img: 'icon-page' },
						{ id: 'popup-2', text: 'More Options', img: 'icon-page' },
						{ id: 'popup-3', text: 'Based on Markup', img: 'icon-page' },
						{ id: 'popup-4', text: 'Popup Elements', img: 'icon-page' },
						{ id: 'popup-5', text: 'Load Content', img: 'icon-page' },
						{ id: 'popup-6', text: 'Transitions', img: 'icon-page' },
						{ id: 'popup-7', text: 'Slide a Message', img: 'icon-page' }
					]
				},
				{ id: 'utils', text: 'Utilities', img: 'icon-folder',
					nodes: [
						{ id: 'utils-1', text: 'Validation', img: 'icon-page' },
						{ id: 'utils-2', text: 'Encoding', img: 'icon-page' },
						{ id: 'utils-3', text: 'Transitions', img: 'icon-page' },
						{ id: 'utils-4', text: 'Overlays', img: 'icon-page' }
					]
				}
			]
		}],
		onClick: function (cmd) {
			if (parseInt(cmd.substr(cmd.length-1)) != cmd.substr(cmd.length-1)) return;
			var tmp = w2ui['demo-sidebar'].get(cmd);
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
			w2ui['demo-sidebar'].doOpen('layout');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'layout-1');
			break;

		case '#!grid':
			w2ui['demo-sidebar'].doOpen('grid');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'grid-1');
			break;

		case '#!toolbar':
			w2ui['demo-sidebar'].doOpen('toolbar');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'toolbar-1');
			break;

		case '#!sidebar':
			w2ui['demo-sidebar'].doOpen('sidebar');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'sidebar-1');
			break;

		case '#!tabs':
			w2ui['demo-sidebar'].doOpen('tabs');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'tabs-1');
			break;

		case '#!popup':
			w2ui['demo-sidebar'].doOpen('popup');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'popup-1');
			break;

		case '#!forms':
			w2ui['demo-sidebar'].doOpen('forms');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'forms-1');
			break;

		case '#!utils':
			w2ui['demo-sidebar'].doOpen('utils');
			w2ui['demo-sidebar'].doClick(tmp[1] || 'utils-1');
			break;
	};
});