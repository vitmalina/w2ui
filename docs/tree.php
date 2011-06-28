<script>
function initTree() {
// ----------------------------
// --- Tree

	var docTree = new top.jsTree('docTree', null);
	docTree.onClick = doc_click;
	docTree.style = 'background-color: #fafafa; padding: 2px; border-right: 2px solid silver;';
	docTree.picture  = '../../system/includes/silk/icons/page.png';
	
	var basics = docTree.addNode(docTree, 'classes', 'Classes');
	basics.picture  = '../../system/includes/silk/icons/folder.png';
	basics.expanded = true;
	var node = docTree.addNode(basics, 'jsUtils.html', 'jsUtils');
	docTree.addNode(node, 'jsUtils.general.html', 'Genearal');
	docTree.addNode(node, 'jsUtils.string.html', 'String');
	docTree.addNode(node, 'jsUtils.screen.html', 'Screen');
	docTree.addNode(node, 'jsUtils.styling.html', 'Styling');
	
	var node = docTree.addNode(basics, 'jsControls.html', 'jsControls');
	docTree.addNode(node, 'jsControls.basic.html', 'General');
	docTree.addNode(node, 'jsControls.calendar.html', 'Calendar');
	docTree.addNode(node, 'jsControls.lookup.html', 'Lookup');
	docTree.addNode(node, 'jsControls.styling.html', 'Styling');
	
	var node = docTree.addNode(basics, 'jsList.html', 'jsList');
	docTree.addNode(node, 'jsList.basic.html', 'Basic');
	docTree.addNode(node, 'jsList.columns.html', 'Columns');
	docTree.addNode(node, 'jsList.searches.html', 'Searches');
	docTree.addNode(node, 'jsList.controls.html', 'Controls');
	docTree.addNode(node, 'jsList.eid.html', 'Edit Row');
	docTree.addNode(node, 'jsList.styling.html', 'Styling');
	
	var node = docTree.addNode(basics, 'jsEdit.html', 'jsEdit');
	docTree.addNode(node, 'jsEdit.basic.html', 'Basic');
	docTree.addNode(node, 'jsEdit.groups.html', 'Groups');
	docTree.addNode(node, 'jsEdit.controls.html', 'Controls');
	docTree.addNode(node, 'jsEdit.tabs.html', 'Tabs');
	docTree.addNode(node, 'jsEdit.styling.html', 'Styling');

	var node = docTree.addNode(basics, 'classes:jsLayout.js', 'jsLayout');
	docTree.addNode(node, 'jsLayout.overview.html', 'Overview');
	docTree.addNode(node, 'jsLayout.nested.html', 'Nested');
	docTree.addNode(node, 'jsLayout.styling.html', 'Styling');

	var node = docTree.addNode(basics, 'classes:jsToolbar.js', 'jsToolbar');
	docTree.addNode(node, 'jsToolbar.overview.html', 'Overview');
	docTree.addNode(node, 'jsToolbar.buttonTypes.html', 'Button Types');
	docTree.addNode(node, 'jsToolbar.styling.html', 'Styling');
	
	var node = docTree.addNode(basics, 'classes:jsTree.js', 'jsTree');
	docTree.addNode(node, 'jsTree.overview.html', 'Overview');
	docTree.addNode(node, 'jsTree.styling.html', 'Styling');

	var node = docTree.addNode(basics, 'classes:jsTabs.js', 'jsTabs');
	docTree.addNode(node, 'jsTabs.overview.html', 'Overview');
	docTree.addNode(node, 'jsTabs.styling.html', 'Styling');

	var ecamples = docTree.addNode(docTree, 'demos', 'Demos');
	ecamples.picture  = '../../system/includes/silk/icons/folder.png';
	var node = docTree.addNode(ecamples, 'demos:grid', 'Table Grid');
	var node = docTree.addNode(ecamples, 'demos:edit', 'Edit Controls');
	var node = docTree.addNode(ecamples, 'demos:layout', 'Layouts');
	
	doc_click({ id: 'classes' });
}

function doc_click(obj) {
	var el = document.getElementById('doc_main');
	if (el) el.scrollTop = 0;
	switch(obj.id) {
		case 'classes':
			jsUtils.get('docs/general.html', {}, function (data) {
				document.getElementById('doc_main').innerHTML = data;
			});
			break;
			
		default:
			load(obj.id);
	}
}
</script>