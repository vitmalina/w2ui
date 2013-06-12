/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2grid 	- grid widget
*		- $.w2grid		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2toolbar, w2fields, w2popup
*
* == NICE TO HAVE ==
*	- global search apply types and drop downs
*	- editable fields (list) - better inline editing
*	- infinite scroll (buffered scroll)
*	- frozen columns
*	- column autosize based on largest content
*	- hints for records (columns?)
*	- more events in editable fields (onkeypress)
*	- on/off line number and select column
*	- subgrid (easy way with keyboard navigation)
* 	- error when using left/right arrow keys (second click disconnects from the event listener)
*	- select multiple recors (shift) in a searched list - selects more then needed
*	- search 1-20 will range numbers
*	- route all toolbar events thru the grid
*
* == 1.3 changes ==
*	- added getRecordHTML, refactored, updated set()
*	- added onKeyboard event
* 	- refresh() and resize() returns number of milliseconds it took
*	- optimized width distribution and resize
*	- 50 columns resize 2% - margin of error is huge
* 	- resize needs to be revisited without resizing each div
*	- grid.resize should not hide expanded columns
*	- navigation with keybaord wrong if there are summary records
*	- added w2grid.recordHeight = 25
*	- fixedRecord deprecated because of buffered scroll
*	- added getSummaryHTML(), summary
* 	- added record.changed, record.changes
*	- doExpand -> expand, collapse, toggle, onCollapse
*	- remove record.hidden
*	- grid.set(record) - updates all records
*	- deprecated selectPage()
*	- added onReload (when toolbar button is clicked)
*
************************************************************************/

(function () {
	var w2grid = function(options) {

		// public properties
		this.name  	  			= null;
		this.box				= null; 	// HTML element that hold this element
		this.header				= '';
		this.url				= '';
		this.columns			= []; 		// { field, caption, size, attr, render, hidden, gridMinWidth, [editable: {type, inTag, outTag, style, items}] }
		this.columnGroups		= [];		// { span: int, caption: 'string', master: true/false }
		this.records			= [];		// { recid: int(requied), field1: 'value1', ... fieldN: 'valueN', style: 'string', editable: true/false, summary: true/false, changed: true/false, changes: object }
		this.summary			= [];		// arry of summary records, same structure as records array
		this.searches			= [];		// { type, caption, field, inTag, outTag, default, items, hidden }
		this.searchData			= [];
		this.sortData			= [];
		this.postData			= {};
		this.toolbar			= {}; 		// if not empty object; then it is toolbar object

		this.show = {
			header			: false,
			toolbar			: false,
			footer			: false,
			columnHeaders	: true,
			lineNumbers		: false,
			expandColumn	: false,
			selectColumn	: false,
			emptyRecords	: true,
			toolbarReload	: true,
			toolbarColumns	: true,
			toolbarSearch	: true,
			toolbarAdd		: false,
			toolbarDelete 	: false,
			toolbarSave	 	: false
		},

		this.fixedBody			= true;		// if false; then grid grows with data
		this.recordHeight		= 25;
		this.multiSearch		= true;
		this.multiSelect		= true;
		this.multiSort			= true;
		this.keyboard			= true;		// if user clicks on the list; it will bind all events from the keyboard for that list

		this.total				= 0;		// total number of records
		this.page				= 0; 		// current page
		this.recordsPerPage		= 50;
		this.style				= '';

		this.msgDelete			= w2utils.lang('Are you sure you want to delete selected records?');
		this.msgNotJSON 		= w2utils.lang('Returned data is not in valid JSON format.');
		this.msgRefresh			= w2utils.lang('Refreshing...');

		// events
		this.onRequest			= null;		// called on any server event
		this.onLoad				= null;
		this.onAdd				= null;
		this.onDelete			= null;
		this.onSave 			= null;
		this.onSelect			= null;
		this.onUnselect 		= null;
		this.onClick 			= null;
		this.onDblClick 		= null;
		this.onSort 			= null;
		this.onSearch 			= null;
		this.onChange 			= null;		// called when editable record is changed
		this.onExpand 			= null;
		this.onCollapse			= null;
		this.onError 			= null;
		this.onKeyboard			= null;
		this.onRender 			= null;
		this.onRefresh 			= null;
		this.onReload			= null;
		this.onResize 			= null;
		this.onDestroy 			= null;

		// internal
		this.last = {
			field		: 'all',
			caption		: w2utils.lang('All Fields'),
			logic		: 'OR',
			search		: '',
			searchIds 	: [],
			multi		: false,
			scrollTop	: 0,
			scrollLeft	: 0,
			selected	: [],
			sortData	: null,
			sortCount	: 0,
			xhr			: null,
			range_start : null,
			range_end   : null
		}

		this.isIOS = (navigator.userAgent.toLowerCase().indexOf('iphone') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipod') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipad') != -1) ? true : false;

		$.extend(true, this, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2grid = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2grid().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;
			}
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
				return;			
			}
			// remember items
			var columns		= method.columns;
			var columnGroups= method.columnGroups;
			var records		= method.records;
			var searches	= method.searches;
			var searchData	= method.searchData;
			var sortData	= method.sortData;
			var postData 	= method.postData;
			var toolbar		= method.toolbar;
			// extend items
			var object = new w2grid(method);
			$.extend(object, { postData: {}, records: [], columns: [], searches: [], toolbar: {}, sortData: [], searchData: [], handlers: [] });
			if (object.onExpand != null) object.show.expandColumn = true;
			$.extend(true, object.toolbar, toolbar);
			// reassign variables
			for (var p in columns)		object.columns[p]		= $.extend(true, {}, columns[p]);
			for (var p in columnGroups) object.columnGroups[p] 	= $.extend(true, {}, columnGroups[p]);
			for (var p in searches)   	object.searches[p]   	= $.extend(true, {}, searches[p]);
			for (var p in searchData) 	object.searchData[p] 	= $.extend(true, {}, searchData[p]);
			for (var p in sortData)		object.sortData[p]  	= $.extend(true, {}, sortData[p]);
			for (var p in postData)   	object.postData[p]   	= $.extend(true, {}, postData[p]);
			// check if there are records without recid
			for (var r in records) {
				if (records[r].recid == null || typeof records[r].recid == 'undefined') {
					console.log('ERROR: Cannot add records without recid. (obj: '+ object.name +')');
					return;
				}
				object.records[r] = $.extend(true, {}, records[r]);
			}
			if (object.records.length > 0) object.total = object.records.length;
			// add searches
			for (var c in object.columns) {
				var col = object.columns[c];
				if (typeof col.searchable == 'undefined' || object.getSearch(col.field) != null) continue;
				var stype = col.searchable;
				var attr  = '';
				if (col.searchable === true) { stype = 'text'; attr = 'size="20"'; }
				object.addSearch({ field: col.field, caption: col.caption, type: stype, attr: attr });
			}
			// init toolbar
			object.initToolbar();
			// render if necessary
			if ($(this).length != 0) {
				object.render($(this)[0]);
			}
			// register new object
			w2ui[object.name] = object;
			return object;

		} else if (w2ui[$(this).attr('name')]) {
			var obj = w2ui[$(this).attr('name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2grid');
		}
	}

	// ====================================================
	// -- Implementation of core functionality

	w2grid.prototype = {

		add: function (record) {
			if (!$.isArray(record)) record = [record];
			var added = 0;
			for (var o in record) {
				if (record[o].recid == null || typeof record[o].recid == 'undefined') {
					console.log('ERROR: Cannot add record without recid. (obj: '+ this.name +')');
					continue;
				}
				this.records.push(record[o]);
				added++;
			}
			this.total = this.records.length;
			if (this.url == '') {
				this.localSort();
				this.localSearch();
			}
			this.refresh(); // ??  should it be reload?
			return added;
		},

		find: function (obj, returnRecords) {
			//console.log(obj);
			if (typeof obj == 'undefined' || obj == null) obj = {};
			var recs = [];
			for (var i=0; i<this.records.length; i++) {
				var match = true;
				for (var o in obj) {
					var val = this.records[i][o];
					if (String(o).indexOf('.') != -1) val = this.parseObj(this.records[i],o);
					if (obj[o] != val) match = false;
				}
				if (match && returnRecords !== true) recs.push(this.records[i].recid);
				if (match && returnRecords === true) recs.push(this.records[i]);
			}
			return recs;
		},

		set: function (recid, record) { // does not delete existing, but overrides on top of it
			// update all records
			if (arguments.length == 1) {
				for (var r in this.records) {
					$.extend(true, this.records[r], recid); // recid is the whole record
				}
				this.refresh();
				return true;
			}
			// find record to update
			if (arguments.length == 2) {
				var ind = this.get(recid, true);
				if (ind == null) return false;
				$.extend(true, this.records[ind], record);
				// refresh only that record
				var tr = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
				if (tr.length != 0) {
					var line = tr.attr('line');
					// if it is searched, find index in search array
					if (this.searchData.length > 0) for (var s in this.last.searchIds) if (this.last.searchIds[s] == ind) ind = s;
					$(tr).replaceWith(this.getRecordHTML(ind, line));
				}
				return true;
			}
		},

		get: function (recid, returnIndex) {
			for (var i=0; i<this.records.length; i++) {
				if (this.records[i].recid == recid) {
					if (returnIndex === true) return i; else return this.records[i];					
				}
			}
			return null;
		},

		remove: function () {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.records.length-1; r >= 0; r--) {
					if (this.records[r].recid == arguments[a]) { this.records.splice(r, 1); removed++; }
				}
			}
			if (this.url == '') {
				this.total = this.records.length;
				this.localSort();
				this.localSearch();
			}
			this.refresh();
			return removed;
		},

		addColumn: function (before, column) {
			if (arguments.length == 1) {
				column = before;
				before = this.columns.length;
			} else {
				before = this.getColumn(before, true);
				if (before === null) before = this.columns.length;
			}
			if (!$.isArray(column)) column = [column];
			for (var o in column) {
				this.columns.splice(before, 0, column[o]);
				before++;
			}
			this.initColumnOnOff();
			this.refresh();
		},

		removeColumn: function () {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.columns.length-1; r >= 0; r--) {
					if (this.columns[r].field == arguments[a]) { this.columns.splice(r, 1); removed++; }
				}
			}
			this.initColumnOnOff();
			this.refresh();
			return removed;
		},

		getColumn: function (field, returnIndex) {
			for (var i=0; i<this.columns.length; i++) {
				if (this.columns[i].field == field) {
					if (returnIndex === true) return i; else return this.columns[i];
				}
			}
			return null;
		},

		showColumn: function () {
			var shown = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.columns.length-1; r >= 0; r--) {
					if (this.columns[r].field == arguments[a] && this.columns[r].hidden !== false) { 
						this.columns[r].hidden = false; 
						shown++; 
					}
				}
			}
			this.refresh();
			return shown;
		},

		hideColumn: function () {
			var hidden = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.columns.length-1; r >= 0; r--) {
					if (this.columns[r].field == arguments[a] && this.columns[r].hidden !== true) { 
						this.columns[r].hidden = true; 
						hidden++; 
					}
				}
			}
			this.refresh();
			return hidden;
		},

		addSearch: function (before, search) {
			if (arguments.length == 1) {
				search = before;
				before = this.searches.length;
			} else {
				before = this.getSearch(before, true);
				if (before === null) before = this.searches.length;
			}
			if (!$.isArray(search)) search = [search];
			for (var o in search) {
				this.searches.splice(before, 0, search[o]);
				before++;
			}
			this.searchClose();
		},

		removeSearch: function () {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.searches.length-1; r >= 0; r--) {
					if (this.searches[r].field == arguments[a]) { this.searches.splice(r, 1); removed++; }
				}
			}
			this.searchClose();
			return removed;
		},

		getSearch: function (field, returnIndex) {
			for (var i=0; i<this.searches.length; i++) {
				if (this.searches[i].field == field) {
					if (returnIndex === true) return i; else return this.searches[i];
				}
			}
			return null;
		},

		showSearch: function () {
			var shown = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.searches.length-1; r >= 0; r--) {
					if (this.searches[r].field == arguments[a] && this.searches[r].hidden !== false) { 
						this.searches[r].hidden = false; 
						shown++; 
					}
				}
			}
			this.searchClose();
			return shown;
		},

		hideSearch: function () {
			var hidden = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.searches.length-1; r >= 0; r--) {
					if (this.searches[r].field == arguments[a] && this.searches[r].hidden !== true) { 
						this.searches[r].hidden = true; 
						hidden++; 
					}
				}
			}
			this.searchClose();
			return hidden;
		},

		getSearchData: function (field) {
			for (var s in this.searchData) {
				if (this.searchData[s].field == field) return this.searchData[s];
			}
			return null;
		},		

		clear: function () {
			this.records = [];
			this.total   = 0;
			this.refresh();
		},

		localSort: function (silent) {
			var time = (new Date()).getTime();
			var obj = this;
			this.records.sort(function (a, b) {
				var ret = 0;
				for (var s in obj.sortData) {
					var aa = a[obj.sortData[s].field];
					var bb = b[obj.sortData[s].field];
					if (String(obj.sortData[s].field).indexOf('.') != -1) {
						aa = obj.parseObj(a, obj.sortData[s].field);
						bb = obj.parseObj(b, obj.sortData[s].field);
					}
					if (typeof aa == 'string') aa = $.trim(aa.toLowerCase());
					if (typeof bb == 'string') bb = $.trim(bb.toLowerCase());
					if (aa > bb) ret = (obj.sortData[s].direction == 'asc' ? 1 : -1);
					if (aa < bb) ret = (obj.sortData[s].direction == 'asc' ? -1 : 1);
					if (typeof aa != 'object' && typeof bb == 'object') ret = -1;
					if (typeof bb != 'object' && typeof aa == 'object') ret = 1;
					if (ret != 0) break;
				}
				return ret;
			});
			time = (new Date()).getTime() - time;
			if (silent !== true) setTimeout(function () { $('#grid_'+ obj.name +'_footer').find('.w2ui-footer-left').html('Sorted in ' + time + ' ms'); }, 10);
			return time;
		},

		localSearch: function (silent) {
			var time = (new Date()).getTime();
			var obj = this;
			this.total = this.records.length;
			// mark all records as shown
			this.last.searchIds = [];
			// hide records that did not match
			if (this.searchData.length > 0) {
				this.total = 0;
				for (var r in this.records) {
					var rec = this.records[r];
					var fl  = 0;
					for (var s in this.searches) {
						var search 	= this.searches[s];
						var sdata  	= this.getSearchData(search.field);
						if (sdata == null) continue;
						var val1 = String(obj.parseObj(rec, search.field)).toLowerCase();
						if (typeof sdata.value != 'undefined') {
							if (!$.isArray(sdata.value)) {
								var val2 = String(sdata.value).toLowerCase();
							} else {
								var val2 = sdata.value[0];
								var val3 = sdata.value[1];
							}
						}
						switch (sdata.operator) {
							case 'is':
 								if (rec[search.field] == sdata.value) fl++; // do not hide record
                                if ((search.type == 'text' || search.type == 'list') && val1 == val2) fl++;
								if (search.type == 'date') {
									var da = new Date(val1);
									var db = new Date(val2);
									d0 = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
									d1 = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
									if (d0 == d1) fl++;
								}
								break;
							case 'between':
								if (search.type == 'int' && parseInt(rec[search.field]) >= parseInt(val2) && parseInt(rec[search.field]) <= parseInt(val3)) fl++;
								if (search.type == 'float' && parseFloat(rec[search.field]) >= parseFloat(val2) && parseFloat(rec[search.field]) <= parseFloat(val3)) fl++;
								if (search.type == 'date') {
									var da = new Date(val1);
									var db = new Date(val2);
									var dc = new Date(val3);
									d0 = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
									d1 = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
									d2 = Date.UTC(dc.getFullYear(), dc.getMonth(), dc.getDate());
									if (d0 >= d1 && d0 <= d2) fl++;
								}
								break;
							case 'begins with':
								if (val1.indexOf(val2) == 0) fl++; // do not hide record
								break;
							case 'contains':
								if (val1.indexOf(val2) >= 0) fl++; // do not hide record
								break;
							case 'ends with':
								if (val1.indexOf(val2) == val1.length - val2.length) fl++; // do not hide record
								break;
						}
					}
					if ((this.last.logic == 'OR' && fl != 0) || (this.last.logic == 'AND' && fl == this.searchData.length)) this.last.searchIds.push(parseInt(r));
				}
				this.total = this.last.searchIds.length;
			}
			time = (new Date()).getTime() - time;
			if (silent !== true) setTimeout(function () { $('#grid_'+ obj.name +'_footer').find('.w2ui-footer-left').html('Searched in ' + time + ' ms'); }, 10);
			return time;
		},

		select: function (recid) {
			var selected = 0;
			for (var a = 0; a < arguments.length; a++) {
				var record = this.get(arguments[a]);
				if (record == null || record.selected === true) continue;
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: record.recid });
				if (eventData.stop === true) continue;
				// default action
				var i = this.get(record.recid, true);
				record.selected = true;
				$('#grid_'+this.name +'_rec_'+ w2utils.escapeId(record.recid)).addClass('w2ui-selected').data('selected', 'yes');
				$('#grid_'+ this.name +'_cell_'+ i +'_select_check').prop('checked', true);
				selected++;
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			} 
			// all selected?
			$('#grid_'+ this.name +'_check_all').prop('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length != 0 &&
					$('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop("checked", false);
			}
			// show number of selected
			var msgLeft = '';
			var sel = this.getSelection();
			if (sel.length > 0) {
				msgLeft = sel.length + ' selected';
				if (sel.length == 1) msgLeft = 'Record ID: '+ sel[0]; 
			}
			$('#'+ this.name +'_grid_footer .w2ui-footer-left').html(msgLeft);
			return selected;
		},

		unselect: function (recid) {
			var unselected = 0;
			for (var a = 0; a < arguments.length; a++) {
				var record = this.get(arguments[a]);
				if (record == null || record.selected !== true) continue;
				// event before
				var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: record.recid });
				if (eventData.stop === true) continue;
				// default action
				var i = this.get(record.recid, true);
				record.selected = false
				$('#grid_'+this.name +'_rec_'+ w2utils.escapeId(record.recid)).removeClass('w2ui-selected').data('selected', '');
				if ($('#grid_'+this.name +'_rec_'+ w2utils.escapeId(record.recid)).length != 0) {
					$('#grid_'+this.name +'_rec_'+ w2utils.escapeId(record.recid))[0].style.cssText = 
						'height: '+ this.recordHeight +'px; ' + $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(record.recid)).attr('custom_style');
				}
				$('#grid_'+ this.name +'_cell_'+ i +'_select_check').prop("checked", false);
				unselected++;
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			} 
			// all selected?
			$('#grid_'+ this.name +'_check_all').prop('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length != 0 &&
					$('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop("checked", false);
			}
			// show number of selected
			var msgLeft = '';
			var sel = this.getSelection();
			if (sel.length > 0) {
				msgLeft = sel.length + ' selected';
				if (sel.length == 1) msgLeft = 'Record ID: '+ sel[0]; 
			}
			$('#'+ this.name +'_grid_footer .w2ui-footer-left').html(msgLeft);
			return unselected;
		},

		selectAll: function () {
			if (this.multiSelect === false) return;
			if (this.searchData.length == 0) { 
				// not searched
				for (var i=0; i<this.records.length; i++) this.select(this.records[i].recid);
			} else { 
				// local search applied
				for (var i=0; i<this.last.searchIds.length; i++) this.select(this.records[this.last.searchIds[i]].recid);
			}
			if (this.getSelection().length > 0) this.toolbar.enable('delete-selected'); else this.toolbar.disable('delete-selected');
		},

		selectNone: function () {
			this.unselect.apply(this, this.getSelection());
			this.last.selected = [];
		},

		getSelection: function () {
			return this.find({ selected: true });
		},

		search: function (field, value) {
			var obj 		= this;
			var searchData 	= [];
			var last_multi 	= this.last.multi;
			var last_logic 	= this.last.logic;
			var last_field 	= this.last.field;
			var last_search = this.last.search;
			// .search() - advanced search
			if (arguments.length == 0) {
				// advanced search
				for (var s in this.searches) {
					var search 	 = this.searches[s];
					var operator = $('#grid_'+ this.name + '_operator_'+s).val();
					var value1   = $('#grid_'+ this.name + '_field_'+s).val();
					var value2   = $('#grid_'+ this.name + '_field2_'+s).val();
					if ((value1 != '' && value1 != null) || (typeof value2 != 'undefined' && value2 != '')) {
						var tmp = {
							field	 : search.field,
							type	 : search.type,
							operator : operator
						}
						if (operator == 'between') {
							$.extend(tmp, { value: [value1, value2] });
						} else {
							$.extend(tmp, { value: value1 });
						}
						searchData.push(tmp);
					}
				}
				if (searchData.length > 0) {
					last_multi	= true;
					last_logic  = 'AND';
				}
			}
			// .search([ { filed, value }, { field, valu e} ]) - submit whole structure
			if ($.isArray(field)) {
				var logic = 'AND';
				if (typeof value == 'string') {
					logic = value.toUpperCase();
					if (logic != 'OR' && logic != 'AND') logic = 'AND';
				}
				last_search = '';
				last_multi	= true;
				last_logic	= logic;
				for (var f in field) {
					var data   = field[f];
					var search = this.getSearch(data.field);
					if (search == null) {
						console.log('ERROR: Cannot find field "'+ data.field + '" when submitting a search.');
						continue;
					}
					var tmp = $.extend(true, {}, data);					
					if (typeof tmp.type == 'undefined') tmp.type = search.type;
					if (typeof tmp.operator == 'undefined') {
						tmp.operator = 'is';
						if (tmp.type == 'text') tmp.operator = 'begins with';
					}
					searchData.push(tmp);
				}
			}
			// .search(field, value) - regular search
			if (typeof field == 'string' && typeof value == 'string') {
				last_field 	= field;
				last_search = value;
				last_multi	= false;
				last_logic	= 'OR';
				// loop through all searches and see if it applies
				if (value != '') for (var s in this.searches) {
					var search 	 = this.searches[s];
					if (search.field == field) this.last.caption = search.caption;
					if (field != 'all' && search.field == field) {
						var tmp = {
							field	 : search.field,
							type	 : search.type,
							operator : (search.type == 'text' ? 'begins with' : 'is'),
							value	 : value
						};
						searchData.push(tmp);
					}
					if (field == 'all') {
						if (search.type == 'text' || (search.type == 'int' && w2utils.isInt(value)) || (search.type == 'float' && w2utils.isFloat(value))
								|| (search.type == 'money' && w2utils.isMoney(value)) || (search.type == 'hex' && w2utils.isHex(value))
								|| (search.type == 'date' && w2utils.isDate(value)) || (search.type == 'alphaNumeric' && w2utils.isAlphaNumeric(value)) ) {
							var tmp = {
								field	 : search.field,
								type	 : search.type,
								operator : (search.type == 'text' ? 'begins with' : 'is'),
								value	 : value
							};
							searchData.push(tmp);
						}
					}
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: searchData });
			if (eventData.stop === true) return;
			// default action			
			this.searchData = eventData.searchData;
			// reset scrolling position
			this.last.field  = last_field;
			this.last.search = last_search;
			this.last.multi  = last_multi;
			this.last.logic  = last_logic;
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.selected		= [];
			// -- clear all search field
			this.searchClose();
			// apply search
			if (this.url != '') {
				this.page = 0;
				this.reload();
			} else {
				// local search
				this.localSearch();
				this.goto(0);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		searchOpen: function () {
			if (!this.box) return;
			if (this.searches.length == 0) return;
			var obj = this;
			// show search
			$('#tb_'+ this.name +'_toolbar_item_search-advanced').w2overlay(
				this.getSearchesHTML(), 
				{ 
					left: -10, 
					'class': 'w2ui-grid-searches',
					onShow: function () {
						if (obj.last.logic == 'OR') obj.searchData = [];
						obj.initSearches();
						$('#w2ui-overlay .w2ui-grid-searches').data('grid-name', obj.name);
						var sfields = $('#w2ui-overlay .w2ui-grid-searches *[rel=search]');
						if (sfields.length > 0) sfields[0].focus();
					}
				}
			);
		},

		searchClose: function () {
			if (!this.box) return;
			if (this.searches.length == 0) return;
			if (this.toolbar) this.toolbar.uncheck('search-advanced')
			// hide search
			if ($('#w2ui-overlay .w2ui-grid-searches').length > 0) $().w2overlay();
		},

		searchShowFields: function (el) {
			if (typeof el == 'undefined') el = $('#grid_'+ this.name +'_search_all');
			var html = '<div class="w2ui-select-field"><table>';
			for (var s = -1; s < this.searches.length; s++) {
				var search = this.searches[s];
				if (s == -1) {
					if (!this.multiSearch) continue;
					search = {
						type 	: 'text',
						field 	: 'all',
						caption : 'All Fields'
					}
				} else {
					if (this.searches[s].hidden === true) continue;
				}
				html += '<tr '+
					'	'+ (this.isIOS ? 'onTouchStart' : 'onClick') +'="var obj = w2ui[\''+ this.name +'\']; '+
					'		if (\''+ search.type +'\' == \'list\' || \''+ search.type +'\' == \'enum\') {'+
					'			obj.last.search = \'\';'+
					'			obj.last.item = \'\';'+
					'			$(\'#grid_'+ this.name +'_search_all\').val(\'\')'+
					'		}'+
					'		if (obj.last.search != \'\') { '+
					'			obj.search(\''+ search.field +'\', obj.last.search); '+
					'		} else { '+
					'			obj.last.field = \''+ search.field +'\'; '+
					'			obj.last.caption = \''+ search.caption +'\'; '+
					'		}'+
					'		$(\'#grid_'+ this.name +'_search_all\').attr(\'placeholder\', \''+ search.caption +'\');'+
					'		$().w2overlay();">'+
					'<td><input type="checkbox" tabIndex="-1" '+ (search.field == this.last.field ? 'checked' : 'disabled') +'></td>'+
					'<td>'+ search.caption +'</td>'+
					'</tr>';
			}
			html += "</table></div>";
			$(el).w2overlay(html, { left: -15, top: 7 });
		},

		searchReset: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: [] });
			if (eventData.stop === true) return;
			// default action
			this.searchData  	= [];
			this.last.search 	= '';
			this.last.logic		= 'OR';
			if (this.last.multi) {
				if (!this.multiSearch) {
					this.last.field 	= this.searches[0].field;
					this.last.caption 	= this.searches[0].caption;
				} else {
					this.last.field  	= 'all';
					this.last.caption 	= w2utils.lang('All Fields');
				}
			}
			this.last.multi	= false;
			// reset scrolling position
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.selected		= [];
			// -- clear all search field
			this.searchClose();
			// apply search
			if (this.url != '') {
				this.page = 0;
				this.reload();
			} else {
				// local search
				this.localSearch();
				this.goto(0);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		goto: function (newPage) {
			var totalPages = Math.floor(this.total / this.recordsPerPage);
			if (this.total % this.recordsPerPage != 0 || totalPages == 0) totalPages++;
			if (totalPages < 1) totalPages = 1;
			if (newPage < 0) newPage = 0;
			if (newPage >= totalPages) newPage = totalPages - 1;
			// reset scrolling position
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.selected		= [];
			// refresh items
			this.page = newPage;
			this.reload();
		},

		load: function (url, callBack) {
			if (typeof url == 'undefined') {
				console.log('ERROR: You need to provide url argument when calling .load() method of "'+ this.name +'" object.');
				return;
			}
			// default action
			this.request('get-records', {}, url, callBack);
		},

		reload: function (callBack) {
			if (this.url != '') {
				this.refresh(); // show grid before pulling data
				this.request('get-records', {}, null, callBack);
			} else {
				this.refresh();
				if (typeof callBack == 'function') callBack();
			}
		},

		reset: function() {
			// move to first page
			this.page 	= 0;
			// reset last remembered state
			this.searchData			= [];
			this.last.search		= '';
			this.last.searchIds		= [];
			this.last.field			= 'all';
			this.last.caption 		= w2utils.lang('All Fields');
			this.last.logic			= 'OR';
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.selected		= [];
			this.last.range_start	= null;
			this.last.range_end		= null;
			// initial search panel
			if (this.last.sortData != null ) this.sortData	 = this.last.sortData;
			// select none without refresh
			this.set({ selected: false });
			// refresh
			this.refresh();
		},

		request: function (cmd, add_params, url, callBack) {
			if (typeof add_params == 'undefined') add_params = {};
			if (typeof url == 'undefined' || url == '' || url == null) url = this.url;
			if (url == '' || url == null) return;
			// build parameters list
			var params = {};
			// add list params
			params['cmd']  	 		= cmd;
			params['name'] 	 		= this.name;
			params['limit']  		= this.recordsPerPage;
			params['offset'] 		= this.page * this.recordsPerPage;
			params['selected'] 		= this.getSelection();
			params['search']  		= this.searchData;
			params['search-logic'] 	= this.last.logic;
			params['sort'] 	  		= (this.sortData.length != 0 ? this.sortData : '');
			// append other params
			$.extend(params, this.postData);
			$.extend(params, add_params);
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, cmd: cmd, url: url, postData: params });
			if (eventData.stop === true) { if (typeof callBack == 'function') callBack(); return false; }
			// default action
			if (cmd == 'get-records') this.records = [];
			// call server to get data
			var obj = this;
			this.lock(this.msgRefresh);
			if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {};
			var xhr_type = 'GET';
			if (cmd == 'save-records')   	xhr_type = 'PUT';  // so far it is always update
			if (cmd == 'delete-records') 	xhr_type = 'DELETE';
			if (!w2utils.settings.RESTfull) xhr_type = 'POST';
			this.last.xhr = $.ajax({
				type		: xhr_type,
				url			: eventData.url, // + (eventData.url.indexOf('?') > -1 ? '&' : '?') +'t=' + (new Date()).getTime(),
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.requestComplete(status, cmd, callBack);
				}
			});
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
				
		requestComplete: function(status, cmd, callBack) {
			var obj = this;
			this.unlock();
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'load', xhr: this.last.xhr, status: status });
			if (eventData.stop === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// parse server response
			var responseText = this.last.xhr.responseText;
			if (status != 'error') {
				// default action
				if (typeof responseText != 'undefined' && responseText != '') {
					var data;
					// check if the onLoad handler has not already parsed the data
					if (typeof responseText == "object") {
						data = responseText;
					} else {
						// $.parseJSON or $.getJSON did not work because it expect perfect JSON data - where everything is in double quotes
						try { eval('data = '+ responseText); } catch (e) { }
					}
					if (typeof data == 'undefined') {
						data = {
							status		 : 'error',
							message		 : this.msgNotJSON,
							responseText : responseText
						}
					}
					if (data['status'] == 'error') {
						obj.error(data['message']);
					} else {
						if (cmd == 'get-records') $.extend(true, this, data);
						if (cmd == 'delete-records') { this.reload(); return; }
					}
				}
			} else {
				obj.error('AJAX Error. See console for more details.');
			}
			// event after
			if (this.url == '') {
				this.localSort();
				this.localSearch();
			}
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
			// call back
			if (typeof callBack == 'function') callBack();
		},

		error: function (msg) {
			var obj = this;
			// let the management of the error outside of the grid
			var eventData = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
			if (eventData.stop === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// need a time out because message might be already up)
			setTimeout(function () {
				if ($('#w2ui-popup').length > 0) {
					$().w2popup('message', {
						width 	: 370,
						height 	: 140,
						html 	: '<div class="w2ui-grid-error-msg" style="font-size: 11px;">ERROR: '+ msg +'</div>'+
								  '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center;">'+
								  '	<input type="button" value="Ok" onclick="$().w2popup(\'message\');" class="w2ui-grid-popup-btn">'+
								  '</div>'
					});
				} else {
					$().w2popup('open', {
						width 	: 420,
						height 	: 200,
						showMax : false,
						title 	: 'Error',
						body 	: '<div class="w2ui-grid-error-msg">'+ msg +'</div>',
						buttons : '<input type="button" value="Ok" onclick="$().w2popup(\'close\');" class="w2ui-grid-popup-btn">'
					});
				}
			}, 1);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getChanged: function () {
			var changes = [];
			var tmp  	= this.find({ changed: true }, true);
			for (var t in tmp) {
				changes.push($.extend(true, { recid: tmp[t]. recid }, tmp[t].changes));
			}
			return changes;
		},

		// ===================================================
		// --  Action Handlers

		doAdd: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'add', recid: null });
			if (eventData.stop === true) return false;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		doSave: function () {
			var changed = this.getChanged();
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'save', changed: changed });
			if (eventData.stop === true) return false;
			if (this.url != '') {
				this.request('save-records', { 'changed' : changed }, null, function () {
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
				});
			} else {
				for (var c in changed) {
					var record = this.get(changed[c].recid);
					for (var s in changed[c]) {
						if (s == 'recid') continue;
						try { eval('record.' + s + ' = changed[c][s]'); } catch (e) {}
						delete record.changed;
						delete record.changes; 
					}
				}
				$(this.box).find('.w2ui-editable input').removeClass('changed');
				this.selectNone();
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		doEdit: function (type, el, event) {
			var recid  = $(el).attr('recid');
			var field  = $(el).attr('field');
			var record = this.get(recid);
			if (!record.selected) {
				this.selectNone();
				this.select(recid);
			}

			switch (type) {
				case 'click':
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					if (event.preventDefault) event.preventDefault();
					break;
				case 'focus':
					$(el).addClass('active');
					break;
				case 'blur':
					$(el).removeClass('active');
					var original = record[field];
					try { original = eval('record.'+ field); } catch (e) {}
					if (typeof original == 'undefined') original = '';
					if ($(el).val() != original) {
						var eventData = this.trigger({ phase: 'before', type: 'change', target: el.id, recid: recid, field: field, original: original  });
						if (eventData.stop === true) return false;
						// save into record
						record.changed = true;
						record.changes = record.changes || {};
						record.changes[field] = $(el).val();
						// mark changed
						$(el).addClass('changed');
						this.trigger($.extend(eventData, { phase: 'after' }));
					} else {
						if (record.changes) delete record.changes[field];
						if ($.isEmptyObject(record.changes)) delete record.changed;
						$(el).removeClass('changed');
					}
					break;
				case 'keyup':
					if ($(el).data('stop') === true) {
						$(el).data('stop', false);
						break;
					}
					if (event.keyCode == 40 || event.keyCode == 13) {
						var newEl = $('#grid_'+ this.name + '_edit_'+ (parseInt($(el).attr('line')) + 1) +'_'+ $(el).attr('column'));
						if (newEl.length > 0) {
							newEl[0].select();
							newEl[0].focus();
						}
					}
					if (event.keyCode == 38) {
						var newEl = $('#grid_'+ this.name + '_edit_'+ (parseInt($(el).attr('line')) - 1) +'_'+ $(el).attr('column'));
						if (newEl.length > 0) {
							newEl[0].select();
							newEl[0].focus();
						}
					}
					break;
			}
		},

		doDelete: function (force) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'delete' });
			if (eventData.stop === true) return false;
			// default action
			var recs = this.getSelection();
			if (recs.length == 0) return;
			if (this.msgDelete != '' && !force) {
				$().w2popup({
					width 	: 400,
					height 	: 180,
					showMax : false,
					title 	: w2utils.lang('Delete Confirmation'),
					body 	: '<div class="w2ui-grid-delete-msg">'+ this.msgDelete +'</div>',
					buttons : '<input type="button" value="'+ w2utils.lang('No') + '" onclick="$().w2popup(\'close\');" class="w2ui-grid-popup-btn">'+
							  '<input type="button" value="'+ w2utils.lang('Yes') + '" onclick="w2ui[\''+ this.name +'\'].doDelete(true); $().w2popup(\'close\');" class="w2ui-grid-popup-btn">'
				});
				return;
			}
			// call delete script
			if (this.url != '') {
				this.request('delete-records');
			} else {
				this.remove.apply(this, recs);
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		doClick: function (recid, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'click', recid: recid, event: event });
			if (eventData.stop === true) return false;
			// default action
			var obj = this;
			$('#grid_'+ this.name +'_check_all').prop("checked", false);
			var record = this.get(recid);
			if (record) var tmp_previous = record.selected;
			// clear other if necessary
			if (((!event.ctrlKey && !event.shiftKey && !event.metaKey) || !this.multiSelect) && !this.showSelectColumn) {
				this.selectNone();
			} else {
				window.setTimeout("var doc = w2ui['"+ this.name +"'].box.ownerDocument; if (doc.selection) doc.selection.empty(); "+
					"else doc.defaultView.getSelection().removeAllRanges();", 10);
			}
			if (event.shiftKey) {
				var cnt = 0;
				var firsti = null;
				for (var i=0; i<this.records.length; i++) { if (this.records[i].selected) { cnt++; if (!firsti) firsti = i; } }
				if (cnt >  1) {
					this.selectNone();
				}
				if (cnt == 1) {
					var ind = this.get(recid, true);
					if (ind > firsti) {
						for (var i=firsti; i<=ind; i++) { this.select(this.records[i].recid); }
					} else {
						for (var i=ind; i<=firsti; i++) { this.select(this.records[i].recid); }
					}
					this.trigger($.extend(eventData, { phase: 'after' }));
					finalizeDoClick();
					return;
				}
			}
			// select or unselect
			if (this.showSelectColumn && record.selected) {
				this.unselect(record.recid);
			} else if ((record && !tmp_previous) || event.ctrlKey || event.metaKey) {
				if (record.selected === true) this.unselect(record.recid); else this.select(record.recid);
			}
			finalizeDoClick();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));

			function finalizeDoClick() {
				// bind up/down arrows
				if (obj.keyboard) window.w2active = obj.name;
				if (obj.getSelection().length > 0) obj.toolbar.enable('delete-selected'); else obj.toolbar.disable('delete-selected');
				// remember last selected
				var msgLeft = '';
				var sel = obj.getSelection();
				if (sel.length > 0) {
					msgLeft = sel.length + ' selected';
					if (sel.length == 1) msgLeft = 'Record ID: '+ sel[0]; 
				}
				$('#'+ obj.name +'_grid_footer .w2ui-footer-left').html(msgLeft);
				obj.last.selected = sel;
				// keyboard events are added there
				obj.initResize();
			}  
		},

		doKeydown: function (event) {
			if (event.target && event.target.tagName != 'BODY') return;
			var obj = w2ui[window.w2active];
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'keyboard', target: obj.name, event: event });	
			if (eventData.stop === true) return false;
			// default behavior
			if (event.keyCode == 65 && (event.metaKey || event.ctrlKey)) {
				obj.selectAll();
				if (event.preventDefault) event.preventDefault();
			}
			if (event.keyCode == 8) {
				obj.doDelete();
				if (event.preventDefault) event.preventDefault();
			}
			var sel 	= obj.getSelection();
			var records = $('#grid_'+ obj.name +'_records');
			if (sel.length == 1) {
				var recid	= sel[0];
				var ind		= obj.get(recid, true);
				var rec 	= obj.get(recid);
				var sTop	= parseInt(records.prop('scrollTop'));
				var sHeight = parseInt(records.height());
				var recEL	= $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid));
				var rTop 	= parseInt(recEL[0].offsetTop);
				var rHeight = parseInt(recEL.height());
				if (event.keyCode == 38 && recEL.length > 0) { // up
					if ((ind > 0 && obj.last.searchIds.length == 0) || (obj.last.searchIds.length > 0 && ind > obj.last.searchIds[0])) {
						ind--;
						if (obj.last.searchIds.length > 0) {
							while (true) {
								if ($.inArray(ind, obj.last.searchIds) != -1 || ind < 0) break;
								ind--;
							}
						}
						obj.selectNone();
						obj.doClick(obj.records[ind].recid, event);
						// scroll into view
						if (rTop - rHeight < sTop) {
							records.prop('scrollTop', rTop - rHeight);
							obj.last.scrollTop = records.prop('scrollTop');
						}
					}
					if (event.preventDefault) event.preventDefault();
				}
				if (event.keyCode == 40 && recEL.length > 0) { // down
					if ((ind + 1 < obj.records.length && obj.last.searchIds.length == 0) || (obj.last.searchIds.length > 0 && ind < obj.last.searchIds[obj.last.searchIds.length-1])) {
						ind++;
						if (obj.last.searchIds.length > 0) {
							while (true) {
								if ($.inArray(ind, obj.last.searchIds) != -1 || ind > obj.records.length) break;
								ind++;
							}
						}
						obj.selectNone();
						obj.doClick(obj.records[ind].recid, event);
						// scroll into view
						if (rTop + rHeight * 2 > sHeight + sTop) {
							records.prop('scrollTop', -(sHeight - rTop - rHeight) + rHeight);
							obj.last.scrollTop = records.prop('scrollTop');
						}
					}
					if (event.preventDefault) event.preventDefault();
				}
				if (event.keyCode == 37 && recEL.length > 0 && recEL.attr('expanded') == 'yes') { // left
					obj.toggle(sel[0], event);
					if (event.preventDefault) event.preventDefault();
				}
				if (event.keyCode == 39 && recEL.length > 0 && recEL.attr('expanded') !== 'yes') { // right
					obj.toggle(sel[0], event);
					if (event.preventDefault) event.preventDefault();
				}
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		doDblClick: function (recid, event) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'dblClick', recid: recid, event: event });
			if (eventData.stop === true) return false;
			// default action
			var record = this.get(recid);
			clearTimeout(this._click_timer);
			// make sure it is selected
			this.selectNone();
			this.select(recid);
			// remember last scroll if any
			this.last.selected	 = this.getSelection();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		toggle: function (recid) {
			var rec = this.get(recid);
			if (rec.expanded === true) return this.collapse(recid); else return this.expand(recid);
		},

		expand: function (recid) {
			var rec = this.get(recid);
			var id = w2utils.escapeId(recid);
			if ($('#grid_'+ this.name +'_rec_'+ recid +'_expanded_row').length > 0) return false;
			// insert expand row
			var tmp = 1 + (this.show.lineNumbers ? 1 : 0) + (this.show.selectColumn ? 1 : 0);
			var addClass = ''; // ($('#grid_'+this.name +'_rec_'+ w2utils.escapeId(recid)).hasClass('w2ui-odd') ? 'w2ui-odd' : 'w2ui-even');
			$('#grid_'+ this.name +'_rec_'+ id).after(
					'<tr id="grid_'+ this.name +'_rec_'+ recid +'_expanded_row" class="'+ addClass +'">'+
					'	<td class="w2ui-grid-data" colspan="'+ tmp +'"></td>'+
					'	<td colspan="100" class="w2ui-subgrid">'+
					'		<div id="grid_'+ this.name +'_rec_'+ recid +'_expaned">&nbsp;</div>'+
					'	</td>'+
					'</tr>');
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: recid, 
				box_id: 'grid_'+ this.name +'_rec_'+ id +'_expaned' });
			if (eventData.stop === true) { 	
				$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove(); 
				return false; 
			}
			// default action
			$('#grid_'+ this.name +'_rec_'+ id).attr('expanded', 'yes')
			$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').show();
			$('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('-');
			rec.expanded = true;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resizeRecords();
			return true;
		},

		collapse: function (recid) {
			var rec = this.get(recid);
			var id = w2utils.escapeId(recid);
			if ($('#grid_'+ this.name +'_rec_'+ recid +'_expanded_row').length == 0) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'collapse', target: this.name, recid: recid,
				box_id: 'grid_'+ this.name +'_rec_'+ id +'_expaned' });
			if (eventData.stop === true) return false; 
			// default action
			$('#grid_'+ this.name +'_rec_'+ id).removeAttr('expanded');
			$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove();
			$('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('+');
			delete rec.expanded;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resizeRecords();
			return true;
		},

		doSort: function (field, direction, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'sort', target: this.name, field: field, direction: direction, event: event });
			if (eventData.stop === true) return false;
			// check if needed to quit
			if (typeof field == 'undefined') {
				this.trigger($.extend(eventData, { phase: 'after' }));
				return;
			}
			// default action
			var sortIndex = this.sortData.length;
			for (var s in this.sortData) {
				if (this.sortData[s].field == field) { sortIndex = s; break; }
			}
			if (typeof direction == 'undefined' || direction == null) {
				if (typeof this.sortData[sortIndex] == 'undefined') {
					direction = 'asc';
				} else {
					switch (String(this.sortData[sortIndex].direction)) {
						case 'asc'	: direction = 'desc'; break;
						case 'desc'	: direction = 'asc';  break;
						default		: direction = 'asc';  break;
					}
				}
			}
			if (this.multiSort === false) { this.sortData = []; sortIndex = 0; }
			if (!event.ctrlKey && !event.metaKey) { this.sortData = []; sortIndex = 0; }
			// set new sort
			if (typeof this.sortData[sortIndex] == 'undefined') this.sortData[sortIndex] = {};
			this.sortData[sortIndex].field 	   = field;
			this.sortData[sortIndex].direction = direction;
			// if local
			if (this.url == '') {
				this.localSort();
				if (this.searchData.length > 0) this.localSearch(true);
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));				
				this.refresh();
			} else {
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));				
				this.reload();
			}
		},

		// ==================================================
		// --- Common functions

		resize: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// make sure the box is right
			if (!this.box || $(this.box).attr('name') != this.name) return;
			// determine new width and height
			$(this.box).find('> div')
				.css('width', $(this.box).width())
				.css('height', $(this.box).height());
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
			if (eventData.stop === true) return false;
			// resize
			obj.resizeBoxes(); 
			obj.resizeRecords();
			// init editable
			$('#grid_'+ obj.name + '_records .w2ui-editable input').each(function (index, el) {
				var column = obj.columns[$(el).attr('column')];
				if (column && column.editable) $(el).w2field(column.editable);
			});
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		refresh: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			// if over the max page, then go to page 1
			if (this.total <= 0) this.total = this.records.length;
			var totalPages = Math.floor(this.total / this.recordsPerPage);
			if (this.total % this.recordsPerPage != 0 || totalPages == 0) totalPages++;
			if (this.page > 0 && this.page > totalPages-1) this.goto(0);

			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh' });
			if (eventData.stop === true) return false;
			// -- header
			if (this.show.header) {
				$('#grid_'+ this.name +'_header').html(this.header +'&nbsp;').show();
			} else {
				$('#grid_'+ this.name +'_header').hide();
			}
			// -- toolbar
			if (this.show.toolbar) {
				// if select-collumn is checked - no toolbar refresh
				if (this.toolbar && this.toolbar.get('column-on-off') && this.toolbar.get('column-on-off').checked) {
					// no action
				} else {
					$('#grid_'+ this.name +'_toolbar').show();
					// refresh toolbar only once
					if (typeof this.toolbar == 'object') {
						this.toolbar.refresh();
						$('#grid_'+ this.name +'_search_all').val(this.last.search);
					}
				}
			} else {
				$('#grid_'+ this.name +'_toolbar').hide();
			}
			// -- make sure search is closed
			this.searchClose();
			// search placeholder
			if (this.searches.length == 0) this.last.field = 'No Search Fields';
			if (!this.multiSearch && this.last.field == 'all') {
				this.last.field 	= this.searches[0].field;
				this.last.caption 	= this.searches[0].caption;
			}
			for (var s in this.searches) {
				if (this.searches[s].field == this.last.field) this.last.caption = this.searches[s].caption;
			}
			if (this.last.multi) {
				$('#grid_'+ this.name +'_search_all').attr('placeholder', w2utils.lang('Multi Fields'));
			} else {
				$('#grid_'+ this.name +'_search_all').attr('placeholder', this.last.caption);
			}

			// focus search if last searched
			if (this._focus_when_refreshed === true) {
				setTimeout(function () {
					var s = $('#grid_'+ obj.name +'_search_all');
					if (s.length > 0) s[0].focus();
					setTimeout(function () { if (s.length > 0) s[0].focus(); delete obj._focus_when_refreshed; }, 500);
				}, 100); // need time to render
			}

			// -- body
			var bodyHTML = '';
			bodyHTML +=  '<div id="grid_'+ this.name +'_records" class="w2ui-grid-records"'+
						'	onscroll="var obj = w2ui[\''+ this.name + '\']; '+
						'		obj.last.scrollTop = this.scrollTop; '+
						'		obj.last.scrollLeft = this.scrollLeft; '+
						'		$(\'#grid_'+ this.name +'_columns\')[0].scrollLeft = this.scrollLeft;'+
						'		$(\'#grid_'+ this.name +'_summary\')[0].scrollLeft = this.scrollLeft;'+
						'		obj.doScroll(event);">'+
							this.getRecordsHTML() +
						'</div>'+
						'<div id="grid_'+ this.name +'_columns" class="w2ui-grid-columns">'+
						'	<table>'+ this.getColumnsHTML() +'</table>'+
						'</div>'; // Columns need to be after to be able to overlap
			$('#grid_'+ this.name +'_body').html(bodyHTML);
			// -- summary
			var tmp = this.find({ summary: true }, true);
			if (tmp.length > 0) {
				for (var t in tmp) this.summary.push(tmp[t]);
				this.remove.apply(this, this.find({ summary: true }));
			}
			if (this.summary.length > 0) {
				$('#grid_'+ this.name +'_summary').html(this.getSummaryHTML()).show();
			} else {
				$('#grid_'+ this.name +'_summary').hide();
			}
			// -- footer
			if (this.show.footer) {
				$('#grid_'+ this.name +'_footer').html(this.getFooterHTML()).show();
			} else {
				$('#grid_'+ this.name +'_footer').hide();
			}
			// select last selected record
			if (this.last.selected.length > 0) for (var s in this.last.selected) {
				if (this.get(this.last.selected[s]) != null) {
					this.select(this.get(this.last.selected[s]).recid);
				}
			}
			// show/hide clear search link
 			if (this.searchData.length > 0) {
				$('#grid_'+ this.name +'_searchClear').show();
			} else {
				$('#grid_'+ this.name +'_searchClear').hide();
			}
			// all selected?
			$('#grid_'+ this.name +'_check_all').prop('checked', true);
			if ($('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length != 0 &&
					$('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]').length == $('#grid_'+ this.name +'_records').find('.grid_select_check[type=checkbox]:checked').length) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop("checked", false);
			}
			// show number of selected
			var msgLeft = '';
			var sel = this.getSelection();
			if (sel.length > 0) {
				msgLeft = sel.length + ' selected';
				if (sel.length == 1) msgLeft = 'Record ID: '+ sel[0]; 
			}
			$('#'+ this.name +'_grid_footer .w2ui-footer-left').html(msgLeft);
			// send expand events
			var rows = obj.find({ expanded: true });
			for (var r in rows) {
				var eventData = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: rows[r], 
					box_id: 'grid_'+ this.name +'_rec_'+ w2utils.escapeId(rows[r]) +'_expaned' });
				if (eventData.stop === true) return false; 
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			obj.resize(); 
			setTimeout(function () { obj.resize(); obj.doScroll(); }, 1); // allow to render first
			return (new Date()).getTime() - time;
		},

		render: function (box) {
			var obj  = this;
			var time = (new Date()).getTime();
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			if (typeof box != 'undefined' && box != null) {
				if ($(this.box).find('#grid_'+ this.name +'_body').length > 0) {
					$(this.box)
						.removeAttr('name')
						.removeClass('w2ui-reset w2ui-grid')
						.html('');
				}
				this.box = box;
			}
			if (!this.box) return;
			if (this.last.sortData == null) this.last.sortData = this.sortData;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: box });
			if (eventData.stop === true) return false;
			// insert Elements
			$(this.box)
				.attr('name', this.name)
				.addClass('w2ui-reset w2ui-grid')
				.html('<div>'+
					  '	<div id="grid_'+ this.name +'_header" class="w2ui-grid-header"></div>'+
					  '	<div id="grid_'+ this.name +'_toolbar" class="w2ui-grid-toolbar"></div>'+
					  '	<div id="grid_'+ this.name +'_body" class="w2ui-grid-body"></div>'+
					  '	<div id="grid_'+ this.name +'_summary" class="w2ui-grid-body w2ui-grid-summary"></div>'+
					  '	<div id="grid_'+ this.name +'_footer" class="w2ui-grid-footer"></div>'+
					  '</div>');
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// init toolbar
			this.initToolbar();
			if (this.toolbar != null) this.toolbar.render($('#grid_'+ this.name +'_toolbar')[0]);
			// init footer
			$('#grid_'+ this.name +'_footer').html(this.getFooterHTML());
			// refresh
			this.reload();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// attach to resize event
			this.tmp_resize = function (event) { w2ui[obj.name].resize(); }
			$(window).off('resize', this.tmp_resize).on('resize', this.tmp_resize);
			return (new Date()).getTime() - time;
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });
			if (eventData.stop === true) return false;
			// remove events
			$(window).off('resize', this.tmp_resize);
			$(document).off('keydown', this.doKeydown);
			// clean up
			if (typeof this.toolbar == 'object' && this.toolbar.destroy) this.toolbar.destroy();
			if ($(this.box).find('#grid_'+ this.name +'_body').length > 0) {
				$(this.box)
					.removeAttr('name')
					.removeClass('w2ui-reset w2ui-grid')
					.html('');
			}
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		// ===========================================
		// --- Internal Functions

		initColumnOnOff: function () {
			if (!this.show.toolbarColumns) return;
			var obj = this;
			var col_html = '<div class="w2ui-col-on-off">'+
						   '<table>';
			for (var c in this.columns) {
				var col = this.columns[c];
				col_html += '<tr>'+
					'<td>'+
					'	<input id="grid_'+ this.name +'_column_'+ c +'_check" type="checkbox" tabIndex="-1" '+ (col.hidden ? '' : 'checked') +
					'		onclick="var obj = w2ui[\''+ obj.name +'\']; var col = obj.getColumn(\''+ col.field +'\'); '+
					'				 if (col.hidden) { $(this).prop(\'checked\', true); obj.showColumn(col.field); } '+
					'							else { $(this).prop(\'checked\', false); obj.hideColumn(col.field); } '+
					'				 obj.initColumnOnOff();'+
					'				 if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
					'</td>'+
					'<td>'+
					'	<label for="grid_'+ this.name +'_column_'+ c +'_check">'+
							(this.columns[c].caption == '' ? '- column '+ (c+1) +' -' : this.columns[c].caption) +
						'</label>'+
					'</td>'+
					'</tr>';
			}
			col_html += "</div></table>";
			this.toolbar.get('column-on-off').html = col_html;
		},

		initToolbar: function () {
			// -- if toolbar is true
			if (typeof this.toolbar['render'] == 'undefined') {
				var tmp_items = this.toolbar.items;
				this.toolbar.items = [];
				this.toolbar = $().w2toolbar($.extend(true, {}, this.toolbar, { name: this.name +'_toolbar', owner: this }));

				// =============================================
				// ------ Toolbar Generic buttons

				if (this.show.toolbarReload) {
					this.toolbar.items.push({ type: 'button', id: 'reload', img: 'icon-reload', hint: w2utils.lang('Reload data in the list') });
				}
				if (this.show.toolbarColumns) {			
					this.toolbar.items.push({ type: 'drop', id: 'column-on-off', img: 'icon-columns', hint: w2utils.lang('Show/hide columns'), arrow: false, html: '' });
					this.initColumnOnOff();
				}
				if (this.show.toolbarReload || this.show.toolbarColumn) {
					this.toolbar.items.push({ type: 'break', id: 'break0' });
				}
				if (this.show.toolbarSearch) {
					var html =
						'<table cellpadding="0" cellspacing="0"><tr>'+
						'	<td>'+
						'		<div class="w2ui-icon icon-search-down w2ui-search-down" title="'+ w2utils.lang('Select Search Field') +'" '+ 
									(this.isIOS ? 'onTouchStart' : 'onClick') +'="var obj = w2ui[\''+ this.name +'\']; obj.searchShowFields(this);"></div>'+
						'	</td>'+
						'	<td>'+
						'		<input id="grid_'+ this.name +'_search_all" class="w2ui-search-all" '+
						'			placeholder="'+ this.last.caption +'" value="'+ this.last.search +'"'+
						'			onkeyup="if (event.keyCode == 13) { '+
						'				w2ui[\''+ this.name +'\']._focus_when_refreshed = true; '+
						'				w2ui[\''+ this.name +'\'].search(w2ui[\''+ this.name +'\'].last.field, this.value); '+
						'			}">'+
						'	</td>'+
						'	<td>'+
						'		<div title="Clear Search" class="w2ui-search-clear" id="grid_'+ this.name +'_searchClear"  '+
						'			 onclick="var obj = w2ui[\''+ this.name +'\']; obj.searchReset();" '+
						'		>&nbsp;&nbsp;</div>'+
						'	</td>'+
						'</tr></table>';
					this.toolbar.items.push({ type: 'html', id: 'search', html: html });
					if (this.multiSearch && this.searches.length > 0) {
						this.toolbar.items.push({ type: 'check', id: 'search-advanced', caption: w2utils.lang('Search...'), hint: w2utils.lang('Open Search Fields') });
					}
				}
				if (this.show.toolbarAdd || this.show.toolbarDelete || this.show.toolbarSave) {
					this.toolbar.items.push({ type: 'break', id: 'break1' });
				}
				if (this.show.toolbarAdd) {
					this.toolbar.items.push({ type: 'button', id: 'add', caption: w2utils.lang('Add New'), hint: w2utils.lang('Add new record'), img: 'icon-add' });
				}
				if (this.show.toolbarDelete) {
					this.toolbar.items.push({ type: 'button', id: 'delete-selected', caption: w2utils.lang('Delete'), hint: w2utils.lang('Delete selected records'), img: 'icon-delete', disabled: true });
				}
				if (this.show.toolbarSave) {
					if (this.show.toolbarAdd || this.show.toolbarDelete ) {
						this.toolbar.items.push({ type: 'break', id: 'break2' });
					}
					this.toolbar.items.push({ type: 'button', id: 'save-changed', caption: w2utils.lang('Save'), hint: w2utils.lang('Save changed records'), img: 'icon-save' });
				}
				// add original buttons
				for (var i in tmp_items) this.toolbar.items.push(tmp_items[i]);

				// =============================================
				// ------ Toolbar onClick processing

				var obj = this;
				this.toolbar.on('click', function (id, data) {
					switch (id) {
						case 'reload':
							var eventData = obj.trigger({ phase: 'before', type: 'reload', target: obj.name });
							if (eventData.stop === true) return false;
							obj.reset();
							obj.reload();
							obj.trigger({ phase: 'after' });
							break;
						case 'column-on-off':
							for (var c in obj.columns) {
								if (obj.columns[c].hidden) {
									$("#grid_"+ obj.name +"_column_"+ c + "_check").prop("checked", false);
								} else {
									$("#grid_"+ obj.name +"_column_"+ c + "_check").prop('checked', true);
								}
							}
							// restore sizes
							for (var c in obj.columns) {
								if (typeof obj.columns[c].sizeOriginal != 'undefined') {
									obj.columns[c].size = obj.columns[c].sizeOriginal;
								}
							}
							obj.initResize();
							obj.resize();
							break;
						case 'add':
							obj.doAdd();
							break;
						case 'search-advanced':
							var tb = this;
							var it = this.get(id);
							if (it.checked) {
								obj.searchClose(); 
								setTimeout(function () { tb.uncheck(id); }, 1);
							} else {
								obj.searchOpen();
								data.event.stopPropagation();
								function tmp_close() { tb.uncheck(id); $(document).off('click', 'body', tmp_close); }
								$(document).on('click', 'body', tmp_close);
							}
							break;
						case 'add-new':
							obj.doAdd();
							break;
						case 'delete-selected':
							obj.doDelete();
							break;
						case 'save-changed':
							obj.doSave();
							break;
					}
				});
			}
			return;
		},

		initSearches: function () {
			var obj = this;
			// init searches
			for (var s in this.searches) {
				var search = this.searches[s];
				var sdata  = this.getSearchData(search.field);
				// init types
				switch (String(search.type).toLowerCase()) {
					case 'alphaNumeric':
					case 'text':
						$('#grid_'+ this.name +'_operator_'+s).val('begins with');
						break;

					case 'int':
					case 'float':
					case 'hex':
					case 'money':
					case 'date':
						$('#grid_'+ this.name +'_field_'+s).w2field(search.type);
						$('#grid_'+ this.name +'_field2_'+s).w2field(search.type);
						break;

					case 'list':
						// build options
						var options = '<option value="">--</option>';
						for (var i in search.items) {
							if ($.isPlainObject(search.items[i])) {
								var val = search.items[i].id;
								var txt = search.items[i].text;
								if (typeof val == 'undefined' && typeof search.items[i].value != 'undefined')   val = search.items[i].value;
								if (typeof txt == 'undefined' && typeof search.items[i].caption != 'undefined') txt = search.items[i].caption;
								if (val == null) val = '';
								options += '<option value="'+ val +'">'+ txt +'</option>';
							} else {
								options += '<option value="'+ search.items[i] +'">'+ search.items[i] +'</option>';
							}
						}
						$('#grid_'+ this.name +'_field_'+s).html(options);
						break;
				}
				if (sdata != null) {
					$('#grid_'+ this.name +'_operator_'+ s).val(sdata.operator).trigger('change');
					if (!$.isArray(sdata.value)) {
						if (typeof sdata.value != 'udefined') $('#grid_'+ this.name +'_field_'+ s).val(sdata.value).trigger('change');						
					} else {
						$('#grid_'+ this.name +'_field_'+ s).val(sdata.value[0]).trigger('change');
						$('#grid_'+ this.name +'_field2_'+ s).val(sdata.value[1]).trigger('change');
					}
				}
			}
			// add on change event
			$('#w2ui-overlay .w2ui-grid-searches *[rel=search]').on('keypress', function (evnt) {
				if (evnt.keyCode == 13) { obj.search(); }
			});
		},

		initResize: function () {
			var obj = this;
			// keyboard events
			if (obj.keyboard && window.w2active == obj.name) {
				$(document).off('keydown', w2ui[window.w2active].doKeydown)
				$(document).on('keydown', obj.doKeydown);
			} else {
				$(document).off('keydown', obj.doKeydown);
			}
			//if (obj.resizing === true) return;
			$(this.box).find('.w2ui-resizer')
				.off('click')
				.on('click', function (event) { 
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					if (event.preventDefault) event.preventDefault();
				})
				.off('mousedown')
				.on('mousedown', function (event) {
					if (!event) event = window.event;
					if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
					obj.resizing = true;
					obj.tmp_x = event.screenX;
					obj.tmp_y = event.screenY;
					obj.tmp_col = $(this).attr('name');
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					if (event.preventDefault) event.preventDefault();
					// fix sizes
					for (var c in obj.columns) {
						if (typeof obj.columns[c].sizeOriginal == 'undefined') obj.columns[c].sizeOriginal = obj.columns[c].size;
						obj.columns[c].size = obj.columns[c].sizeCalculated;
					}
					// set move event
					var mouseMove = function (event) {
						if (obj.resizing != true) return;
						if (!event) event = window.event;
						obj.tmp_div_x = (event.screenX - obj.tmp_x);
						obj.tmp_div_y = (event.screenY - obj.tmp_y);
						obj.columns[obj.tmp_col].size = (parseInt(obj.columns[obj.tmp_col].size) + obj.tmp_div_x) + 'px';
						obj.resizeRecords();
						// reset
						obj.tmp_x = event.screenX;
						obj.tmp_y = event.screenY;
					}
					var mouseUp = function (event) {
						delete obj.resizing;
						$(document).off('mousemove', 'body');
						$(document).off('mouseup', 'body');
						obj.resizeRecords();
					}
					$(document).on('mousemove', 'body', mouseMove);
					$(document).on('mouseup', 'body', mouseUp);
				})
				.each(function (index, el) {
					var td  = $(el).parent();
					$(el).css({
						"height" 		: '25px',
						"margin-left" 	: (td.width() - 3) + 'px'
					})
				});
		},

		resizeBoxes: function () {
			// elements
			var main 		= $(this.box).find('> div');
			var header 		= $('#grid_'+ this.name +'_header');
			var toolbar 	= $('#grid_'+ this.name +'_toolbar');
			var summary		= $('#grid_'+ this.name +'_summary');
			var footer		= $('#grid_'+ this.name +'_footer');
			var body		= $('#grid_'+ this.name +'_body');
			var columns 	= $('#grid_'+ this.name +'_columns');
			var records 	= $('#grid_'+ this.name +'_records');

			if (this.show.header) {
				header.css({
					top:   '0px',
					left:  '0px',
					right: '0px'
				});
			}

			if (this.show.toolbar) {
				toolbar.css({
					top:   ( 0 + (this.show.header ? w2utils.getSize(header, 'height') : 0) ) + 'px',
					left:  '0px',
					right: '0px'
				});
			}
			if (this.show.footer) {
				footer.css({
					bottom: '0px',
					left:  '0px',
					right: '0px'
				});
			}
			if (this.summary.length > 0) {
				summary.css({
					bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) ) + 'px',
					left:  '0px',
					right: '0px'
				});
			}
			body.css({
				top: ( 0 + (this.show.header ? w2utils.getSize(header, 'height') : 0) + (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0) ) + 'px',
				bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) + (this.summary.length > 0 ? w2utils.getSize(summary, 'height') : 0) ) + 'px',
				left:   '0px',
				right:  '0px'
			});
		},

		resizeRecords: function () {
			var obj = this;
			// remove empty records
			$(this.box).find('.w2ui-empty-record').remove();
			// -- Calculate Column size in PX
			var box			= $(this.box);
			var grid		= $(this.box).find('> div');
			var header 		= $('#grid_'+ this.name +'_header');
			var toolbar		= $('#grid_'+ this.name +'_toolbar');
			var summary 	= $('#grid_'+ this.name +'_summary');
			var footer 		= $('#grid_'+ this.name +'_footer');
			var body 		= $('#grid_'+ this.name +'_body');
			var columns 	= $('#grid_'+ this.name +'_columns');
			var records 	= $('#grid_'+ this.name +'_records');

			// body might be expanded by data
			if (!this.fixedBody) {
				// allow it to render records, then resize
				setTimeout(function () {
					var calculatedHeight = w2utils.getSize(columns, 'height')
						+ w2utils.getSize($('#grid_'+ obj.name +'_records table'), 'height');
					obj.height = calculatedHeight 
						+ w2utils.getSize(grid, '+height')
						+ (obj.show.header ? w2utils.getSize(header, 'height') : 0)
						+ (obj.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
						+ (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
						+ (obj.show.footer ? w2utils.getSize(footer, 'height') : 0);
					grid.css('height', obj.height);
					body.css('height', calculatedHeight);
					box.css('height', w2utils.getSize(grid, 'height') + w2utils.getSize(box, '+height'));
				}, 1);
			} else {
				// fixed body height
				var calculatedHeight =  grid.height()
					- (this.show.header ? w2utils.getSize(header, 'height') : 0)
					- (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
					- (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
					- (this.show.footer ? w2utils.getSize(footer, 'height') : 0);
				body.css('height', calculatedHeight);
			}

			// check overflow
			if (body.height() - columns.height() < $(records).find(':first-child').height()) var bodyOverflowY = true; else bodyOverflowY = false;
			if (body.width() < $(records).find(':first-child').width())   var bodyOverflowX = true; else bodyOverflowX = false;
			if (!this.fixedBody) { bodyOverflowY = false; bodyOverflowX = false; }
			if (bodyOverflowX || bodyOverflowY) {
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.sbSize()).show();
				records.css({ 
					top: ((this.columnGroups.length > 0 ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
					"-webkit-overflow-scrolling": "touch",
					"overflow-x": (bodyOverflowX ? 'auto' : 'hidden'), 
					"overflow-y": (bodyOverflowY ? 'auto' : 'hidden') });
			} else {
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').hide();
				records.css({ 
					top: ((this.columnGroups.length > 0 ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px', 
					overflow: 'hidden' 
				});
				if (records.length > 0) { this.last.scrollTop  = 0; this.last.scrollLeft = 0; } // if no scrollbars, always show top
			}
			if (this.show.emptyRecords && !bodyOverflowY) {
				var max = Math.floor(records.height() / this.recordHeight) + 1;
				if (this.fixedBody) {
					for (var di = this.total; di <= max; di++) {
						var html  = '';
						html += '<tr class="'+ (di % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" style="height: '+ this.recordHeight +'">';
						if (this.show.lineNumbers)  html += '<td class="w2ui-col-number"></td>';
						if (this.show.selectColumn) html += '<td class="w2ui-grid-data w2ui-col-select"></td>';
						if (this.show.expandColumn) html += '<td class="w2ui-grid-data w2ui-col-expand"></td>';
						var j = 0;
						while (true && this.columns.length > 0) {
							var col = this.columns[j];
							if (col.hidden) { j++; if (typeof this.columns[j] == 'undefined') break; else continue; }
							html += '<td class="w2ui-grid-data" '+ (typeof col.attr != 'undefined' ? col.attr : '') +' col="'+ j +'"></td>';
							j++;
							if (typeof this.columns[j] == 'undefined') break;
						}
						html += '<td class="w2ui-grid-data-last"></td>';
						html += '</tr>';
						$('#grid_'+ this.name +'_records > table').append(html);
					}
				}
			}
			if (body.length > 0) {
				var width_max = parseInt(body.width())
					- (bodyOverflowY ? w2utils.sbSize() : 0)
					- (this.show.lineNumbers ? 34 : 0)
					- (this.show.selectColumn ? 26 : 0)
					- (this.show.expandColumn ? 26 : 0);
				var width_box = width_max;
				var percent = 0;
				// gridMinWidth processiong
				var restart = false;
				for (var i=0; i<this.columns.length; i++) {
					var col = this.columns[i];
					if (typeof col.gridMinWidth != 'undefined') {
						if (col.gridMinWidth > width_box && col.hidden !== true) {
							col.hidden = true;
							restart = true;
						}
						if (col.gridMinWidth < width_box && col.hidden === true) {
							col.hidden = false;
							restart = true;
						}
					}
				}
				if (restart === true) {
					this.refresh();
					return;
				}
				// assign PX column s
				for (var i=0; i<this.columns.length; i++) {
					var col = this.columns[i];
					if (col.hidden) continue;
					if (String(col.size).substr(String(col.size).length-2).toLowerCase() == 'px') {
						width_max -= parseFloat(col.size);
						this.columns[i].sizeCalculated = col.size;
						this.columns[i].sizeType = 'px';
					} else {
						percent += parseFloat(col.size);
						this.columns[i].sizeType = '%';
						delete col.sizeCorrected;
					}
				}
				// if sum != 100% -- reassign proportionally
				if (percent != 100 && percent > 0) {
					for (var i=0; i<this.columns.length; i++) {
						var col = this.columns[i];
						if (col.hidden) continue;
						if (col.sizeType == '%') {
							col.sizeCorrected = Math.round(parseFloat(col.size) * 100 * 100 / percent) / 100 + '%';
						}
					}
				}
				// calculate % columns
				for (var i=0; i<this.columns.length; i++) {
					var col = this.columns[i];
					if (col.hidden) continue;
					if (col.sizeType == '%') {
						if (typeof this.columns[i].sizeCorrected != 'undefined') {
							// make it 1px smaller, so margin of error can be calculated correctly
							this.columns[i].sizeCalculated = Math.floor(width_max * parseFloat(col.sizeCorrected) / 100) - 1 + 'px';
						} else {
							// make it 1px smaller, so margin of error can be calculated correctly
							this.columns[i].sizeCalculated = Math.floor(width_max * parseFloat(col.size) / 100) - 1 + 'px';
						}
					}
				}
			}
			// fix margin of error that is due percentage calculations
			var width_cols = 0;
			for (var i=0; i<this.columns.length; i++) {
				var col = this.columns[i];
				if (col.hidden) continue;
				if (typeof col.min == 'undefined') col.min = 20;
				if (parseInt(col.sizeCalculated) < parseInt(col.min)) col.sizeCalculated = col.min + 'px';
				if (parseInt(col.sizeCalculated) > parseInt(col.max)) col.sizeCalculated = col.max + 'px';
				width_cols += parseInt(col.sizeCalculated); 
			}
			var width_diff = parseInt(width_box) - parseInt(width_cols);
			if (width_diff > 0 && percent > 0) {
				var i = 0;
				while (true) {
					var col = this.columns[i];
					if (typeof col == 'undefined') { i = 0; continue; }
					if (col.hidden || col.sizeType == 'px') { i++; continue; }
					col.sizeCalculated = (parseInt(col.sizeCalculated) + 1) + 'px';
					width_diff--;
					if (width_diff == 0) break;
					i++;
				}
			} else if (width_diff > 0) {
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.sbSize()).show();
			}
			// resize columns
			columns.find('> table > tbody > tr:nth-child(1) td').each(function (index, el) {
				var ind = $(el).attr('col');
				if (typeof ind != 'undefined' && obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated);
				// last column
				if ($(el).hasClass('w2ui-head-last')) {
					$(el).css('width', w2utils.sbSize() + (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
				}
			});
			// if there are column groups - hide first row (needed for sizing)
			if (columns.find('> table > tbody > tr').length == 3) {
				columns.find('> table > tbody > tr:nth-child(1) td').html('').css({
					'height'	: '0px',
					'border'	: '0px',
					'padding'	: '0px',
					'margin'	: '0px'
				});
			}
			// resize records
			records.find('> table > tbody > tr:nth-child(1) td').each(function (index, el) {
				var ind = $(el).attr('col');
				if (typeof ind != 'undefined' && obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated);
				// last column
				if ($(el).hasClass('w2ui-grid-data-last')) {
					$(el).css('width', (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
				}
			});
			// resize summary 
			summary.find('> table > tbody > tr:nth-child(1) td').each(function (index, el) {
				var ind = $(el).attr('col');
				if (typeof ind != 'undefined' && obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated);
				// last column
				if ($(el).hasClass('w2ui-grid-data-last')) {
					$(el).css('width', w2utils.sbSize() + (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
				}
			});
			this.initResize();
			// apply last scroll if any
			if (this.last.scrollTop != '' && records.length > 0) {
				columns.prop('scrollLeft', this.last.scrollLeft);
				records.prop('scrollTop',  this.last.scrollTop);
				records.prop('scrollLeft', this.last.scrollLeft);
			}
		},

		getSearchesHTML: function () {
			var html = '<table cellspacing="0">';
			var showBtn = false;
			for (var i = 0; i < this.searches.length; i++) {
				var s = this.searches[i];
				if (s.hidden) continue;
				var btn = '';
				if (showBtn == false) {
					btn = '<input type="button" value="X" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchClose(); }">';
					showBtn = true;
				}
				if (typeof s.inTag   == 'undefined') s.inTag 	= '';
				if (typeof s.outTag  == 'undefined') s.outTag 	= '';
				if (typeof s.type	== 'undefined') s.type 	= 'text';
				if (s.type == 'text') {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+i+'">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						'	<option value="begins with">'+ w2utils.lang('begins with') +'</option>'+
						'	<option value="contains">'+ w2utils.lang('contains') +'</option>'+
						'	<option value="ends with">'+ w2utils.lang('ends with') +'</option>'+
						'</select>';
				}
				if (s.type == 'int' || s.type == 'float' || s.type == 'date') {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+i+'" onchange="var el = $(\'#grid_'+ this.name + '_range_'+ i +'\'); '+
						'					if ($(this).val() == \'is\') el.hide(); else el.show();">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						'	<option value="between">'+ w2utils.lang('between') +'</option>'+
						'</select>';
				}
				if (s.type == 'list') {
					var operator =  'is <input type="hidden" value="is" id="grid_'+ this.name +'_operator_'+i+'">';
				}
				html += '<tr>'+
						'	<td class="close-btn">'+ btn +'</td>' +
						'	<td class="caption">'+ s.caption +'</td>' +
						'	<td class="operator">'+ operator +'</td>'+
						'	<td class="value">';

				switch (s.type) {
					case 'alphaNumeric':
					case 'text':
						html += '<input rel="search" type="text" size="40" id="grid_'+ this.name +'_field_'+i+'" name="'+ s.field +'" '+ s.inTag +'>';
						break;

					case 'int':
					case 'float':
					case 'hex':
					case 'money':
					case 'date':
						html += '<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field_'+i+'" name="'+ s.field +'" '+ s.inTag +'>'+
								'<span id="grid_'+ this.name +'_range_'+i+'" style="display: none">'+
								'&nbsp;-&nbsp;&nbsp;<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field2_'+i+'" name="'+ s.field +'" '+ s.inTag +'>'+
								'</span>';
						break;

					case 'list':
						html += '<select rel="search" id="grid_'+ this.name +'_field_'+i+'" name="'+ s.field +'" '+ s.inTag +'></select>';
						break;

				}
				html +=			s.outTag +
						'	</td>' +
						'</tr>';
			}
			html += '<tr>'+
					'	<td colspan="4" class="actions">'+
					'		<div>'+
					'		<input type="button" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchReset(); }" value="'+ w2utils.lang('Reset') + '">'+
					'		<input type="button" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.search(); }" value="'+ w2utils.lang('Search') + '">'+
					'		</div>'+
					'	</td>'+
					'</tr></table>';
			return html;
		},

		getColumnsHTML: function () {
			var obj  = this;
			var html = '';
			if (this.show.columnHeaders) {
				if (this.columnGroups.length > 0) {
					html = getColumns(true) + getGroups() + getColumns(false);
				} else {
					html = getColumns(true);
				}
			}
			return html;

			function getGroups () {
				var html = '<tr>';
				// add empty group at the end
				if (obj.columnGroups[obj.columnGroups.length-1].caption != '') obj.columnGroups.push({ caption: '' });

				if (obj.show.lineNumbers) {
					html += '<td class="w2ui-head w2ui-col-number">'+
							'	<div>&nbsp;</div>'+
							'</td>';
				}
				if (obj.show.selectColumn) {
					html += '<td class="w2ui-head w2ui-col-select">'+
							'	<div>&nbsp;</div>'+
							'</td>';
				}
				if (obj.show.expandColumn) {
					html += '<td class="w2ui-head w2ui-col-expand">'+
							'	<div>&nbsp;</div>'+
							'</td>';
				}
				var ii = 0;
				for (var i=0; i<obj.columnGroups.length; i++) {
					var colg = obj.columnGroups[i];
					var col  = obj.columns[ii];
					if (typeof colg.span == 'undefined' || colg.span != parseInt(colg.span)) colg.span = 1;
					if (typeof colg.colspan != 'undefined') colg.span = colg.colspan;
					if (colg.master === true) {
						var sortStyle = '';
						for (var si in obj.sortData) {
							if (obj.sortData[si].field == col.field) {
								if (obj.sortData[si].direction == 'asc')  sortStyle = 'w2ui-sort-down';
								if (obj.sortData[si].direction == 'desc') sortStyle = 'w2ui-sort-up';
							}
						}
						var resizer = "";
						if (col.resizable == true) {
							resizer = '<div class="w2ui-resizer" name="'+ ii +'"></div>';
						}
						html += '<td class="w2ui-head" col="'+ ii + '" rowspan="2" colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'" '+
										(col.sortable ? 'onclick="w2ui[\''+ obj.name +'\'].doSort(\''+ col.field +'\', null, event);"' : '') +'>'+
									resizer +
								'	<div class="w2ui-col-group '+ sortStyle +'">'+
										(col.caption == '' ? '&nbsp;' : col.caption) +
								'	</div>'+ 
								'</td>';
					} else {
						html += '<td class="w2ui-head" col="'+ ii + '" '+
								'		colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'">'+
								'	<div class="w2ui-col-group">'+
									(colg.caption == '' ? '&nbsp;' : colg.caption) +
								'	</div>'+
								'</td>';
					}
					ii += colg.span;
				}
				html += '</tr>';	
				return html;			
			}

			function getColumns (master) {
				var html = '<tr>';
				if (obj.show.lineNumbers) {
					html += '<td class="w2ui-head w2ui-col-number">'+
							'	<div>#</div>'+
							'</td>';
				}
				if (obj.show.selectColumn) {
					html += '<td class="w2ui-head w2ui-col-select" '+
							'		onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'	<div>'+
							'		<input type="checkbox" id="grid_'+ obj.name +'_check_all" tabIndex="-1"'+
							'			style="' + (obj.multiSelect == false ? 'display: none;' : '') + '"'+
							'			onclick="if (this.checked) w2ui[\''+ obj.name +'\'].selectAll(); '+
							'					 else w2ui[\''+ obj.name +'\'].selectNone(); '+
							'					 if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'	</div>'+
							'</td>';
				}
				if (obj.show.expandColumn) {
					html += '<td class="w2ui-head w2ui-col-expand">'+
							'	<div>&nbsp;</div>'+
							'</td>';
				}
				var ii = 0;
				var id = 0;
				for (var i=0; i<obj.columns.length; i++) {
					var col  = obj.columns[i];
					var colg = {};
					if (i == id) {
						id = id + (typeof obj.columnGroups[ii] != 'undefined' ? parseInt(obj.columnGroups[ii].span) : 0);
						ii++;
					}
					if (typeof obj.columnGroups[ii-1] != 'undefined') var colg = obj.columnGroups[ii-1];
					if (col.hidden) continue;
					var sortStyle = '';
					for (var si in obj.sortData) {
						if (obj.sortData[si].field == col.field) {
							if (obj.sortData[si].direction == 'asc')  sortStyle = 'w2ui-sort-down';
							if (obj.sortData[si].direction == 'desc') sortStyle = 'w2ui-sort-up';
						}
					}
					if (colg['master'] !== true || master) { // grouping of columns
						var resizer = "";
						if (col.resizable == true) {
							resizer = '<div class="w2ui-resizer" name="'+ i +'"></div>';
						}
						html += '<td col="'+ i +'" class="w2ui-head" '+
										(col.sortable ? 'onclick="w2ui[\''+ obj.name +'\'].doSort(\''+ col.field +'\', null, event);"' : '') + '>'+
									resizer +
								'	<div class="'+ sortStyle +'">'+  
										(col.caption == '' ? '&nbsp;' : col.caption) +
								'	</div>'+ 
								'</td>';
					}
				}
				html += '<td class="w2ui-head w2ui-head-last"><div>&nbsp;</div></td>';
				html += '</tr>';
				return html;
			}
		},

		getRecordsHTML: function () {
			this.show_extra = 30;	// larget number works better with chrome, smaller with FF.
			if (this.total <= 300) this.show_extra = 300;
			var records	= $('#grid_'+ this.name +'_records');
			var limit	= Math.floor(records.height() / this.recordHeight) + this.show_extra + 1;
			if (!this.fixedBody) limit = this.total;
			// always need first record for resizing purposes
			var html = '<table>' + this.getRecordHTML(-1, 0);
			// first empty row with height
			html += '<tr id="grid_'+ this.name + '_rec_top" line="top" style="height: '+ 0 +'px">'+
					'	<td colspan="200"></td>'+
					'</tr>';
			for (var i = 0; i < limit; i++) {
				html += this.getRecordHTML(i, i+1);
			}
			html += '<tr id="grid_'+ this.name + '_rec_bottom" line="bottom" style="height: '+ ((this.total - limit) * this.recordHeight) +'px">'+
					'	<td colspan="200"></td>'+
					'</tr>'+
					'</table>';
			this.last.range_start = 0;
			this.last.range_end	  = limit;
			return html;
		},

		getSummaryHTML: function () {
			if (this.summary.length == 0) return;
			var html = '<table>';
			for (var i = 0; i < this.summary.length; i++) {
				html += this.getRecordHTML(i, i+1, true);
			}
			html += '</table>';
			return html;
		},

		doScroll: function (event) {
			var time = (new Date()).getTime();
			var records	= $('#grid_'+ this.name +'_records');
			if (records.length == 0) return;
			// update footer
			var t1 = Math.floor(records[0].scrollTop / this.recordHeight + 1);
			var t2 = Math.floor(records[0].scrollTop / this.recordHeight + 1) + Math.floor(records.height() / this.recordHeight);
			if (t1 > this.total) t1 = this.total;
			if (t2 > this.total) t2 = this.total;
			$('#grid_'+ this.name + '_footer .w2ui-footer-right').html(
				String(t1).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + '-' + 
				String(t2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' of ' + 
				String(this.total).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
			);
			if (!this.fixedBody || this.total <= 300) return;
			// regular processing
			var start 	= Math.floor(records[0].scrollTop / this.recordHeight) - this.show_extra;
			var end		= start + Math.floor(records.height() / this.recordHeight) + this.show_extra * 2 + 1;
			// var div     = start - this.last.range_start;
			if (start < 1) start = 1;
			if (end > this.total) end = this.total;
			var tr1 = records.find('#grid_'+ this.name +'_rec_top');
			var tr2 = records.find('#grid_'+ this.name +'_rec_bottom');
			// if row is expanded
			if (String(tr1.next().prop('id')).indexOf('_expanded_row') != -1) tr1.next().remove();
			if (String(tr2.prev().prop('id')).indexOf('_expanded_row') != -1) tr2.prev().remove();
			var first = parseInt(tr1.next().attr('line'));
			var last  = parseInt(tr2.prev().attr('line'));
			//console.log('show: ' + start + '-'+ end + ' ===> current: ' + first + '-' + last);
			if (first < start || first == 1) { // scroll down
				if (end <= last + this.show_extra && end < this.total) return;
				// remove from top
				while (true) {
					var tmp = records.find('#grid_'+ this.name +'_rec_top').next();
					if (tmp.attr('line') == 'bottom') break;
					if (parseInt(tmp.attr('line')) < start) tmp.remove();  else break;
				}
				// add at bottom
				var tmp = records.find('#grid_'+ this.name +'_rec_bottom').prev();
				var rec_start = tmp.attr('line');
				if (rec_start == 'top') rec_start = start;
				for (var i = parseInt(rec_start) + 1; i <= end; i++) {
					tr2.before(this.getRecordHTML(i-1, i));
				}
			} else { // scroll up
				if (start >= first - this.show_extra && start > 1) return;
				// remove from bottom
				while (true) {
					var tmp = records.find('#grid_'+ this.name +'_rec_bottom').prev();
					if (tmp.attr('line') == 'top') break;
					if (parseInt(tmp.attr('line')) > end) tmp.remove(); else break;
				}
				// add at top
				var tmp = records.find('#grid_'+ this.name +'_rec_top').next();
				var rec_start = tmp.attr('line');
				if (rec_start == 'bottom') rec_start = end;
				for (var i = parseInt(rec_start) - 1; i >= start; i--) {
					tr1.after(this.getRecordHTML(i-1, i));
				}
			}
			// first/last row size
			var h1 = (start - 1) * this.recordHeight;
			var h2 = (this.total - end) * this.recordHeight;
			if (h2 < 0) h = 0;
			tr1.css('height', h1 + 'px');
			tr2.css('height', h2 + 'px');
			this.last.range_start = start;
			this.last.range_end   = end;
			return;
		},

		getRecordHTML: function (ind, lineNum, summary) {
			var rec_html = '';
			// first record needs for resize purposes
			if (ind == -1) {
				rec_html += '<tr line="0">';
				if (this.show.lineNumbers) rec_html  += '<td class="w2ui-col-number" style="height: 1px;"></td>';
				if (this.show.selectColumn) rec_html += '<td class="w2ui-col-select" style="height: 1px;"></td>';
				if (this.show.expandColumn) rec_html += '<td class="w2ui-col-expand" style="height: 1px;"></td>';
				for (var i in this.columns) {
					if (this.columns[i].hidden) continue;
					rec_html += '<td class="w2ui-grid-data" col="'+ i +'" style="height: 1px;"></td>';					
				}
				rec_html += '<td class="w2ui-grid-data-last" style="height: 1px;"></td>';
				rec_html += '</tr>';
				return rec_html;
			}
			// regular record
			if (summary !== true) {
				if (this.searchData.length > 0) {
					if (ind >= this.last.searchIds.length) return '';
					ind = this.last.searchIds[ind];
					record = this.records[ind]; 
				} else {
					if (ind >= this.records.length) return '';
					record = this.records[ind];
				}
			} else {
				if (ind >= this.summary.length) return '';
				record = this.summary[ind];
			}
			var id = w2utils.escapeId(record.recid);
			if (record.selected) {
				rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" class="w2ui-selected" ' +
						(summary !== true ?
							(this.isIOS ?
								'	onclick  = "w2ui[\''+ this.name +'\'].doDblClick(\''+ record.recid +'\', event);" '
								:
								'	onclick	 = "w2ui[\''+ this.name +'\'].doClick(\''+ record.recid +'\', event);"'+
								'	ondblclick  = "w2ui[\''+ this.name +'\'].doDblClick(\''+ record.recid +'\', event);" '
							 ) 
							: ''
						) +
						' style="height: '+ this.recordHeight +'px" ' + (record['style'] ? 'custom_style="'+ record['style'] +'"' : '')+
						'>';
			} else {
				rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" '+
							'	class="'+ (lineNum % 2 == 0 ? 'w2ui-even' : 'w2ui-odd') + '" ' +
						(summary !== true ?
							(this.isIOS ?
								'	onclick = "w2ui[\''+ this.name +'\'].doDblClick(\''+ record.recid +'\', event);" '
								:
								'	onclick ="w2ui[\''+ this.name +'\'].doClick(\''+ record.recid +'\', event);"'+
								'	ondblclick = "w2ui[\''+ this.name +'\'].doDblClick(\''+ record.recid +'\', event);" '
							 )
							: ''
						) +
						' style="height: '+ this.recordHeight +'px; '+ (record['style'] ? record['style'] + '" custom_style="'+ record['style'] : '') + '" '+
						'>';
			}
			if (this.show.lineNumbers) {
				rec_html += '<td id="grid_'+ this.name +'_cell_'+ ind +'_number" valign="top" class="w2ui-col-number">'+
							(summary !== true ? '<div title="Line #'+ lineNum +'">'+ lineNum +'</div>' : '') +
						'</td>';
			}
			if (this.show.selectColumn) {
				rec_html += 
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_select" valign="top" class="w2ui-grid-data w2ui-col-select" '+
						'		onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							(summary !== true ?
							'	<div>'+
							'		<input id="grid_'+ this.name +'_cell_'+ ind +'_select_check" class="grid_select_check" type="checkbox" tabIndex="-1"'+
							'			'+ (record.selected ? 'checked="checked"' : '') +
							'			onclick="var obj = w2ui[\''+ this.name +'\']; if (!obj.multiSelect) { obj.selectNone(); }'+
							'				if (this.checked) obj.select(\''+ record.recid + '\'); else obj.unselect(\''+ record.recid + '\'); '+
							'				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'	</div>'
							: 
							'' ) +
						'</td>';
			}
			if (this.show.expandColumn) {
				rec_html += 
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_expand" valign="top" class="w2ui-grid-data w2ui-col-expand">'+
							(summary !== true ?
							'	<div ondblclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;" '+
							'			onclick="w2ui[\''+ this.name +'\'].toggle(\''+ record.recid +'\', event); '+
							'				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'		'+ (record.expanded ? '-' : '+') +' </div>'
							: 
							'' ) +
						'</td>';
			}
			var col_ind = 0;
			while (true) {
				var col   = this.columns[col_ind];
				if (col.hidden) { col_ind++; if (typeof this.columns[col_ind] == 'undefined') break; else continue; }
				var field = this.parseObj(record, col.field);
				if (typeof col.render != 'undefined') {
					if (typeof col.render == 'function') field = col.render.call(this, this.records[ind], ind);
					if (typeof col.render == 'object')   field = col.render[field];
				}
				if (field == null || typeof field == 'undefined') field = '';

				var rec_field = '';
				if (this.recordHeight == 25) {
					rec_field = '<div title="'+ String(field).replace(/"/g, "''") +'">'+ field +'</div>';
				} else {
					rec_field = '<div title="'+ String(field).replace(/"/g, "''") +'" class="flexible-record">'+ field +'</div>';								
				}

				// this is for editable controls
				if ($.isPlainObject(col.editable)) {
					var edit = col.editable;
					if (edit.type == 'enum') console.log('ERROR: Grid\'s inline editing does not support enum field type.');
					if (edit.type == 'list' || edit.type == 'select') console.log('ERROR: Grid\'s inline editing does not support list/select field type.');
					if (typeof edit.inTag   == 'undefined') edit.inTag   = '';
					if (typeof edit.outTag  == 'undefined') edit.outTag  = '';
					if (typeof edit.style   == 'undefined') edit.style   = '';
					if (typeof edit.items   == 'undefined') edit.items   = [];
					// output the field
					if ((typeof record['editable'] == 'undefined' || record['editable'] === true) && edit.type != 'enum' && edit.type != 'list' && edit.type != 'select') {
						var newValue = '';
						if (record.changed && typeof record.changes[col.field] != 'undefined') {
							field = record.changes[col.field];
							var newValue = field;
						}
						rec_field =	
							'<div class="w2ui-editable">'+
								'<input id="grid_'+ this.name +'_edit_'+ ind +'_'+ col_ind +'" value="'+ field +'" type="text"  '+
								'	style="'+ edit.style +'" '+ (record.changed && newValue != '' ? 'class="changed"' : '') + 
								'	field="'+ col.field +'" recid="'+ record.recid +'" line="'+ ind +'" column="'+ col_ind +'" '+
								'	onclick = "w2ui[\''+ this.name + '\'].doEdit(\'click\', this, event);" '+
								'	onkeyup = "w2ui[\''+ this.name + '\'].doEdit(\'keyup\', this, event);" '+
								'	onfocus = "w2ui[\''+ this.name + '\'].doEdit(\'focus\', this, event);" '+
								'	onblur  = "w2ui[\''+ this.name + '\'].doEdit(\'blur\', this, event);" '+
								'	ondblclick = "if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; '+
								'				  this.select();" '+ edit.inTag + ' >' +
								edit.outTag +
							'</div>';
					}
				}
				rec_html += '<td class="w2ui-grid-data" col="'+ col_ind +'" '+
							'	style="'+ (typeof col.style != 'undefined' ? col.style : '') +'" '+
										  (typeof col.attr != 'undefined' ? col.attr : '') +'>'+
								rec_field +
							'</td>';
				col_ind++;
				if (typeof this.columns[col_ind] == 'undefined') break;
			}
			rec_html += '<td class="w2ui-grid-data-last"></td>';
			rec_html += '</tr>';
			// if row is expanded
			if (record.expanded) {
				var tmp = 1 + (this.show.lineNumbers ? 1 : 0) + (this.show.selectColumn ? 1 : 0);
				rec_html += 
					'<tr id="grid_'+ this.name +'_rec_'+ record.recid +'_expanded_row">'+
					'	<td class="w2ui-grid-data" colspan="'+ tmp +'"></td>'+
					'	<td colspan="100" class="w2ui-subgrid">'+
					'		<div id="grid_'+ this.name +'_rec_'+ record.recid +'_expaned">&nbsp;</div>'+
					'	</td>'+
					'</tr>';
			}
			return rec_html;
		},

		getFooterHTML: function () {
			// counts
			var last = (this.page * this.recordsPerPage + this.recordsPerPage);
			if (last > this.total) last = this.total;
			var pageCountDsp = (this.page * this.recordsPerPage + 1) +'-'+ String(last).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' ' + 
				w2utils.lang('of') +' '+ String(this.total).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
			if (this.page == 0 && this.total == 0) pageCountDsp = '0-0 '+ w2utils.lang('of') +' 0';
			// pages
			var totalPages = Math.floor(this.total / this.recordsPerPage);
			if (this.total % this.recordsPerPage != 0 || totalPages == 0) totalPages++;
			if (totalPages < 1) totalPages = 1;
			var pages = '<div class="w2ui-footer-nav">'+
				 '		<a class="w2ui-footer-btn" '+
				 '  		onclick="w2ui[\''+ this.name +'\'].goto(w2ui[\''+ this.name +'\'].page - 1)" '+ (this.page == 0 ? 'disabled' : '') +
				 '		> << </a>'+
				 '		<input type="text" value="'+ (this.page + 1) +'" '+
				 '			onclick="this.select();" '+
				 '			onkeyup="if (event.keyCode != 13) return; '+
				 '					 if (this.value < 1 || !w2utils.isInt(this.value)) this.value = 1; '+
				 '					 w2ui[\''+ this.name +'\'].goto(parseInt(this.value-1)); ">'+
				 '		<a class="w2ui-footer-btn" '+
				 '  		onclick="w2ui[\''+ this.name +'\'].goto(w2ui[\''+ this.name +'\'].page + 1)" '+ (this.page == totalPages-1 || totalPages == 0 ? 'disabled' : '') +
				 '		> >> </a>'+
				 '</div>';
			return '<div>'+
				'	<div class="w2ui-footer-left"></div>'+
				'	<div class="w2ui-footer-right">'+ pageCountDsp +'</div>'+
				'	<div class="w2ui-footer-center">'+ pages +'</div>'+
				'</div>';
		},

		lock: function (msg) {
			var obj = this;
			if (typeof msg == 'undefined' || msg == '') {
				setTimeout(function () {
					$('#grid_'+ obj.name +'_lock').remove();
					$('#grid_'+ obj.name +'_status').remove();
				}, 25);
			} else {
				$('#grid_'+ obj.name +'_lock').remove();
				$('#grid_'+ obj.name +'_status').remove();
				$(this.box).find('> div :first-child').before(
					'<div id="grid_'+ this.name +'_lock" class="w2ui-grid-lock"></div>'+
					'<div id="grid_'+ this.name +'_status" class="w2ui-grid-status"></div>'
				);
				setTimeout(function () {
					var lock 	= $('#grid_'+ obj.name +'_lock');
					var status 	= $('#grid_'+ obj.name +'_status');
					status.data('old_opacity', status.css('opacity')).css('opacity', '0').show();
					lock.data('old_opacity', lock.css('opacity')).css('opacity', '0').show();
					setTimeout(function () {
						var left 	= ($(obj.box).width()  - w2utils.getSize(status, 'width')) / 2;
						var top 	= ($(obj.box).height() * 0.9 - w2utils.getSize(status, 'height')) / 2;
						lock.css({
							opacity : lock.data('old_opacity'),
							left 	: '0px',
							top 	: '0px',
							width 	: '100%',
							height 	: '100%'
						});
						status.html(msg).css({
							opacity : status.data('old_opacity'),
							left	: left + 'px',
							top		: top + 'px'
						});
					}, 10);
				}, 10);
			}
		},

		unlock: function () { 
			this.lock(); 
		},

		parseObj: function (obj, field) {
			var tmp = String(field).split('.');
			var val = obj;
			for (var i in tmp) {
				val = val[tmp[i]];
			}
			return val;
		}
	}

	$.extend(w2grid.prototype, $.w2event);
	w2obj.grid = w2grid;
})();
