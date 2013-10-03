/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2grid 	- grid widget
*		- $.w2grid		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2toolbar, w2fields, w2alert, w2confirm
*
* == NICE TO HAVE ==
*	- global search apply types and drop downs
*	- editable fields (list) - better inline editing
*	- frozen columns
*	- column autosize based on largest content
*	- more events in editable fields (onkeypress)
*	- save grid state into localStorage and restore
*	- easy bubbles in the grid
*	- possibly add context menu similar to sidebar's
*	- Merged cells
*	- More than 2 layers of header groups
*	- for search fields one should be able to pass w2field options
*	- add enum to advanced search fields
*	- all function that take recid as argument, should check if object was given and use it instead.
*	- be able to attach events in advanced search dialog
* 	- reorder columns/records
*	- url should be either string or object, if object, then allow different urls for different actions, get-records, delete, save
*	- bug: paste at the end of the control
*	- bug: extend selection - bug
*
* == 1.3 changes ==
*	- added onEdit, an event to catch the edit record event when you click the edit button
*	- added toolbarEdit, to send the OnEdit event
*	- Changed doEdit to edit one field in doEditField, to add the doEdit event to edit one record in a popup
*	- added getRecordHTML, refactored, updated set()
*	- added onKeydown event
*	- added keyboard = true property
* 	- refresh() and resize() returns number of milliseconds it took
*	- optimized width distribution and resize
*	- 50 columns resize 2% - margin of error is huge
* 	- resize needs to be revisited without resizing each div
*	- grid.resize should not hide expanded columns
*	- navigation with keybaord wrong if there are summary records
*	- added w2grid.recordHeight = 24
*	- fixedRecord deprecated because of buffered scroll
*	- added getSummaryHTML(), summary
* 	- added record.changed, record.changes
*	- doExpand -> expand, collapse, toggle, onCollapse
*	- remove record.hidden
*	- grid.set([recid], record, [noRefresh]) - updates all records
*	- deprecated selectPage()
*	- added onReload (when toolbar button is clicked)
*	- column.title - can be a string or a function
*	- hints for records (columns?)
*	- select multiple recors (shift) in a searched list - selects more then needed
* 	- error when using left/right arrow keys (second click disconnects from the event listener)
*	- deprecated recordsPerPage, page, goto()
* 	- added onDeleted, onSaved - when it returns from the server
* 	- added buffered, limit, offset
* 	- need to clean up onRequest, onSave, onLoad commands
*	- added onToolbar event - click on any toolbar button
*	- route all toolbar events thru the grid
*	- infinite scroll (buffered scroll)
*	- added grid.autoLoad = true
*	- search 1-20 will range numbers
*	- moved some settings to prototype
* 	- added record.expanded = 'none' || 'spinner'
*	- added lock(.., showSpinner) - show spinner
*	- subgrid (easy way with keyboard navigation)
*	- on/off line number and select column
*	- added columnOnOff() internal method
* 	- added skip()
* 	- added onColumnOnOff
* 	- record.render(record, record_index, column_index)
*	- added grid.scrollIntoView()
*	- added render formatters (number, int, float, money, age, date)
*	- deprecated: doAdd, doEdit
*	- renames: doClick -> click, doDblClick -> dblClick, doEditField -> editField, doScroll -> scroll, doSort -> sort, doSave -> save, doDelete -> delete
* 	- added status()
*	- added copy(), paste()
*	- added onCopy, onPaste events
*	- added getCellData(record, ind, col_ind)
*	- added selectType = 'cell' then, it shows cell selection
* 	- added addRange(), removeRange(), ranges - that draws border arround selection and grid.show.selectionBorder
*	- added getRange();
*	- changed getSelection(returnIndex) - added returnIndex parameter
*	- added markSearchResults
*	- added columnClick() and onColumnClick and onColumnResize
* 	- added onColumnResize event
*	- added mergeChanged() 
*	- added onEditField event
*	- improoved search(), now it does not require search definitions
*	- grid.url can be string or object { get, save, remove }
*	- added grid.show.recordTitles 
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
			toolbarEdit 	: false,
			toolbarDelete 	: false,
			toolbarSave		: false,
			selectionBorder : true,
			recordTitles	: true
		}

		this.autoLoad		= true; 	// for infinite scroll
		this.fixedBody		= true;		// if false; then grid grows with data
		this.recordHeight	= 24;
		this.keyboard 		= true;
		this.selectType		= 'row'; 	// can be row|cell
		this.multiSearch	= true;
		this.multiSelect	= true;
		this.multiSort		= true;
		this.markSearchResults	= true;

		this.total			= 0;		// server total
		this.buffered		= 0;		// number of records in the records array
		this.limit			= 100;
		this.offset			= 0;		// how many records to skip (for infinite scroll) when pulling from server
		this.style			= '';
		this.ranges 		= [];

		this.msgDelete		= w2utils.lang('Are you sure you want to delete selected records?');
		this.msgNotJSON 	= w2utils.lang('Returned data is not in valid JSON format.');
		this.msgRefresh		= w2utils.lang('Refreshing...');

		// events
		this.onAdd				= null;
		this.onEdit				= null;
		this.onRequest			= null;		// called on any server event
		this.onLoad				= null;
		this.onDelete			= null;
		this.onDeleted			= null
		this.onSave 			= null;
		this.onSaved			= null;
		this.onSelect			= null;
		this.onUnselect 		= null;
		this.onClick 			= null;
		this.onDblClick 		= null;
		this.onColumnClick		= null;
		this.onColumnResize		= null;
		this.onSort 			= null;
		this.onSearch 			= null;
		this.onChange 			= null;		// called when editable record is changed
		this.onExpand 			= null;
		this.onCollapse			= null;
		this.onError 			= null;
		this.onKeydown			= null;
		this.onToolbar			= null; 	// all events from toolbar
		this.onColumnOnOff		= null;
		this.onCopy				= null;
		this.onPaste			= null;
		this.onSelectionExtend  = null;
		this.onEditField		= null;
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
			range_end   : null,
			sel_ind		: null,
			sel_col		: null,
			sel_type	: null
		}

		this.isIOS = (navigator.userAgent.toLowerCase().indexOf('iphone') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipod') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipad') != -1) ? true : false;

		$.extend(true, this, w2obj.grid, options);
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
			object.postData = $.extend(true, {}, postData);	

			// check if there are records without recid
			for (var r in records) {
				if (records[r].recid == null || typeof records[r].recid == 'undefined') {
					console.log('ERROR: Cannot add records without recid. (obj: '+ object.name +')');
					return;
				}
				object.records[r] = $.extend(true, {}, records[r]);
			}
			if (object.records.length > 0) object.buffered = object.records.length;
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
			this.buffered = this.records.length;
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				this.localSort();
				this.localSearch();
			}
			this.refresh(); // ??  should it be reload?
			return added;
		},

		find: function (obj, returnIndex) {
			if (typeof obj == 'undefined' || obj == null) obj = {};
			var recs = [];
			for (var i=0; i<this.records.length; i++) {
				var match = true;
				for (var o in obj) {
					var val = this.records[i][o];
					if (String(o).indexOf('.') != -1) val = this.parseObj(this.records[i],o);
					if (obj[o] != val) match = false;
				}
				if (match && returnIndex !== true) recs.push(this.records[i]);
				if (match && returnIndex === true) recs.push(i);
			}
			return recs;
		},

		set: function (recid, record, noRefresh) { // does not delete existing, but overrides on top of it
			if (typeof recid == 'object') {
				noRefresh 	= record;
				record 		= recid;
				recid  		= null;
			}
			// update all records
			if (recid == null) {
				for (var r in this.records) {
					$.extend(true, this.records[r], record); // recid is the whole record
				}
				if (noRefresh !== true) this.refresh();
				return true;
			} else { // find record to update
				var ind = this.get(recid, true);
				if (ind == null) return false;
				$.extend(true, this.records[ind], record);
				// refresh only that record
				if (noRefresh !== true) {
					var tr = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
					if (tr.length != 0) {
						var line = tr.attr('line');
						// if it is searched, find index in search array
						var url = (typeof this.url != 'object' ? this.url : this.url.get);
						if (this.searchData.length > 0 && !url) for (var s in this.last.searchIds) if (this.last.searchIds[s] == ind) ind = s;
						$(tr).replaceWith(this.getRecordHTML(ind, line));
					}
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
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				this.buffered = this.records.length;
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

		toggleColumn: function () {
			var effected = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.columns.length-1; r >= 0; r--) {
					if (this.columns[r].field == arguments[a]) {
						this.columns[r].hidden = !this.columns[r].hidden;
						effected++; 
					}
				}
			}
			this.refresh();
			return effected;
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

		toggleSearch: function () {
			var effected = 0;
			for (var a = 0; a < arguments.length; a++) {
				for (var r = this.searches.length-1; r >= 0; r--) {
					if (this.searches[r].field == arguments[a]) { 
						this.searches[r].hidden = !this.searches[r].hidden; 
						effected++; 
					}
				}
			}
			this.searchClose();
			return effected;
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
			this.records	= [];
			this.total 		= 0;
			this.buffered   = 0;
			this.refresh();
		},

		localSort: function (silent) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				console.log('ERROR: grid.localSort can only be used on local data source, grid.url should be empty.');
				return;
			}
			if ($.isEmptyObject(this.sortData)) return;
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
			if (silent !== true) setTimeout(function () { obj.status('Sorting took ' + time/1000 + ' sec'); }, 10);
			return time;
		},

		localSearch: function (silent) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				console.log('ERROR: grid.localSearch can only be used on local data source, grid.url should be empty.');
				return;
			}
			var time = (new Date()).getTime();
			var obj = this;
			this.total = this.records.length;
			// mark all records as shown
			this.last.searchIds = [];
			// hide records that did not match
			if (this.searchData.length > 0 && !url) {
				this.total = 0;
				for (var r in this.records) {
					var rec = this.records[r];
					var fl  = 0;
					for (var s in this.searchData) {
						var sdata  	= this.searchData[s];
						var search 	= this.getSearch(sdata.field);
						if (sdata  == null) continue;
						if (search == null) search = { field: sdata.field, type: sdata.type };
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
								if (search.type == 'date') {
									var tmp = new Date(Number(val1)); // create date
									val1 = (new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate())).getTime(); // drop time
									val2 = Number(val2);
									var val3 = Number(val1) + 86400000; // 1 day
									if (val2 >= val1 && val2 <= val3) fl++;
								}
								break;
							case 'between':
								if (search.type == 'int' && parseInt(rec[search.field]) >= parseInt(val2) && parseInt(rec[search.field]) <= parseInt(val3)) fl++;
								if (search.type == 'float' && parseFloat(rec[search.field]) >= parseFloat(val2) && parseFloat(rec[search.field]) <= parseFloat(val3)) fl++;
								if (search.type == 'date') {
									var tmp = new Date(Number(val3)); // create date
									val3 = (new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate())).getTime(); // drop time
									var val3 = Number(val3) + 86400000; // 1 day
									if (val1 >= val2 && val1 < val3) fl++;
								}
								break;
							case 'in':
								if (sdata.value.indexOf(val1) !== -1) fl++;
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
			this.buffered = this.total;
			time = (new Date()).getTime() - time;
			if (silent !== true) setTimeout(function () { obj.status('Search took ' + time/1000 + ' sec'); }, 10);
			return time;
		},

		getRange: function (range, returnData) {
			var rec1 = this.get(range[0].recid, true);
			var rec2 = this.get(range[1].recid, true);
			var col1 = range[0].column;
			var col2 = range[1].column;
			
			var res = [];
			if (col1 == col2) { // one row
				for (var r = rec1; r <= rec2; r++) {
					var record = this.records[r];
					var dt = record[this.columns[col1].field] || null;
					if (returnData === true) {
						res.push(dt);
					} else {
						res.push({ data: dt, column: col1, index: r, record: record });
					}
				}
			} else if (rec1 == rec2) { // one line
				var record = this.records[rec1];
				for (var i = col1; i <= col2; i++) {
					var dt = record[this.columns[i].field] || null;
					if (returnData === true) {
						res.push(dt);
					} else {
						res.push({ data: dt, column: i, index: rec1, record: record });
					}
				}
			} else {
				for (var r = rec1; r <= rec2; r++) {
					var record = this.records[r];
					res.push([]);
					for (var i = col1; i <= col2; i++) {
						var dt = record[this.columns[i].field];
						if (returnData === true) {
							res[res.length-1].push(dt);
						} else {
							res[res.length-1].push({ data: dt, column: i, index: r, record: record });
						}
					}
				}
			}
			return res;
		},

		addRange: function (name, range, style) {
			if (name == 'selection' || typeof name == 'undefined') {
				if (this.selectType == 'row' || this.show.selectionBorder === false) return;
				var name  = 'selection';
				var sel   = this.getSelection();
				if (sel.length == 0) { 
					this.removeRange(name); 
				} else {
					var first = sel[0];
					var last  = sel[sel.length-1];
					var td1   = $('#grid_'+ this.name +'_rec_'+ first.recid + ' td[col='+ first.column +']');
					var td2   = $('#grid_'+ this.name +'_rec_'+ last.recid + ' td[col='+ last.column +']');
				}
			} else {
				var first = range[0];
				var last  = range[1];
				var td1   = $('#grid_'+ this.name +'_rec_'+ first.recid + ' td[col='+ first.column +']');
				var td2   = $('#grid_'+ this.name +'_rec_'+ last.recid + ' td[col='+ last.column +']');
			}
			if (first) {
				var rg = { 
					name: name, 
					range: [{ recid: first.recid, column: first.column }, { recid: last.recid, column: last.column }], 
					style: style || '' 
				};
				// add range
				var ind = false;
				for (var r in this.ranges) if (this.ranges[r].name == name) { ind = r; break; }
				if (ind !== false) {
					this.ranges[ind] = rg;
				} else {
					this.ranges.push(rg);	
				}
				this.refreshRanges();
				return this.ranges[this.ranges - 1];
			}
			return null;
		},

		removeRange: function () {
			var removed = 0;
			for (var a = 0; a < arguments.length; a++) {
				var name = arguments[a];
				$('#grid_'+ this.name +'_'+ name).remove();
				for (var r = this.ranges.length-1; r >= 0; r--) {
					if (this.ranges[r].name == name) {
						this.ranges.splice(r, 1);
						removed++;
					}
				}
			}
			return removed;
		},

		refreshRanges: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			var rec  = $('#grid_'+ this.name +'_records');
			for (var r in this.ranges) {
				var rg    = this.ranges[r];
				var first = rg.range[0];
				var last  = rg.range[1];
				var td1   = $('#grid_'+ this.name +'_rec_'+ first.recid + ' td[col='+ first.column +']');
				var td2   = $('#grid_'+ this.name +'_rec_'+ last.recid + ' td[col='+ last.column +']');
				if ($('#grid_'+ this.name +'_'+ rg.name).length == 0) {
					rec.append('<div id="grid_'+ this.name +'_' + rg.name +'" class="w2ui-selection" style="'+ rg.style +'">'+
									(rg.name == 'selection' ?  '<div id="grid_'+ this.name +'_resizer" class="w2ui-selection-resizer"></div>' : '')+
								'</div>');
				}
				if (td1.length > 0 && td2.length > 0) {
					$('#grid_'+ this.name +'_'+ rg.name).css({
						left 	: (td1.position().left - 1 + rec.scrollLeft()) + 'px',
						top 	: (td1.position().top - 1 + rec.scrollTop()) + 'px',
						width 	: (td2.position().left - td1.position().left + td2.width() + 3) + 'px',
						height 	: (td2.position().top - td1.position().top + td2.height() + 3) + 'px'
					});
				}
			}

			// add resizer events
			$(this.box).find('#grid_'+ this.name +'_resizer').off('mousedown').on('mousedown', mouseStart);			
			//$(this.box).find('#grid_'+ this.name +'_resizer').off('selectstart').on('selectstart', function () { return false; }); // fixes chrome cursror bug

			var eventData = { phase: 'before', type: 'selectionExtend', target: obj.name, originalRange: null, newRange: null };

			function mouseStart (event) {
				var sel = obj.getSelection();
				obj.last.move = {
					type 	: 'expand',
					x		: event.screenX,
					y		: event.screenY,
					divX 	: 0,
					divY 	: 0,
					recid	: sel[0].recid,
					column	: sel[0].column,
					originalRange 	: [{ recid: sel[0].recid, column: sel[0].column }, { recid: sel[sel.length-1].recid, column: sel[sel.length-1].column }],
					newRange 		: [{ recid: sel[0].recid, column: sel[0].column }, { recid: sel[sel.length-1].recid, column: sel[sel.length-1].column }]
				};
				$(document).off('mousemove', mouseMove).on('mousemove', mouseMove);
				$(document).off('mouseup', mouseStop).on('mouseup', mouseStop);
			}

			function mouseMove (event) {
				var mv = obj.last.move;
				if (!mv || mv.type != 'expand') return;
				mv.divX = (event.screenX - mv.x);
				mv.divY = (event.screenY - mv.y);
				// find new cell
				var recid, column;
				var tmp = event.originalEvent.target;
				if (tmp.tagName != 'TD') tmp = $(tmp).parents('td')[0];
				if (typeof $(tmp).attr('col') != 'undefined') column = parseInt($(tmp).attr('col'));
				tmp = $(tmp).parents('tr')[0];
				recid = $(tmp).attr('recid');
				// new range
				if (mv.newRange[1].recid == recid && mv.newRange[1].column == column) return;
				var prevNewRange = $.extend({}, mv.newRange);
				mv.newRange = [{ recid: mv.recid, column: mv.column }, { recid: recid, column: column }];
				// event before
				eventData = obj.trigger($.extend(eventData, { originalRange: mv.originalRange, newRange : mv.newRange }));
				if (eventData.isCancelled === true) { 
					mv.newRange 		= prevNewRange;
					eventData.newRange 	= prevNewRange;
					return; 
				} else {
					// default behavior
					obj.removeRange('grid-selection-expand');
					obj.addRange('grid-selection-expand', eventData.newRange,
						'background-color: rgba(100,100,100,0.1); border: 2px dotted rgba(100,100,100,0.5);'
					);
				}
			}

			function mouseStop (event) {
				// default behavior
				obj.removeRange('grid-selection-expand');
				delete obj.last.move;
				$(document).off('mousemove', mouseMove);
				$(document).off('mouseup', mouseStop);
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}	

			return (new Date()).getTime() - time;
		},

		select: function () {
			var selected = 0;
			for (var a = 0; a < arguments.length; a++) {
				var recid  = typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
				var record = this.get(recid);
				var index  = this.get(recid, true);
				if (record == null) continue;
				if (this.selectType == 'row') {
					if (record.selected === true) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: recid });
					if (eventData.isCancelled === true) continue;
					// default action
					record.selected = true;
					$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid)).addClass('w2ui-selected').data('selected', 'yes');
					$('#grid_'+ this.name +'_cell_'+ index +'_select_check').prop('checked', true);
					selected++;
				} else {
					var col  = arguments[a].column;
					if (!w2utils.isInt(col)) { // select all columns
						var cols = [];
						for (var c in this.columns) { if (this.columns[c].hidden) continue; cols.push({ recid: recid, column: parseInt(c) }); }
						return this.select.apply(this, cols);
					}
					var s = record.selectedColumns;
					if ($.isArray(s) && s.indexOf(col) != -1) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: recid, column: col });
					if (eventData.isCancelled === true) continue;
					// default action
					if (!$.isArray(s)) record.selectedColumns = [];
					record.selected = true;
					record.selectedColumns.push(col); 
					record.selectedColumns.sort(function(a, b) { return a-b }); // sort function must be for numerical sort
					$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid) + ' > td[col='+ col +']').addClass('w2ui-selected');
					selected++;
					if (record.selected) {					
						$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid)).data('selected', 'yes');
						$('#grid_'+ this.name +'_cell_'+ index +'_select_check').prop('checked', true);
					}
				}
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
			this.status();
			this.addRange('selection');
			return selected;
		},

		unselect: function () {
			var unselected = 0;
			for (var a = 0; a < arguments.length; a++) {
				var recid  = typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
				var record = this.get(recid);
				var index  = this.get(record.recid, true);
				if (record == null) continue;
				if (this.selectType == 'row') {
					if (record.selected !== true) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: recid });
					if (eventData.isCancelled === true) continue;
					// default action
					record.selected = false
					var el = $('#grid_'+this.name +'_rec_'+ w2utils.escapeId(record.recid));
					el.removeClass('w2ui-selected').removeData('selected');
					if (el.length != 0) el[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + el.attr('custom_style');
					$('#grid_'+ this.name +'_cell_'+ index +'_select_check').prop("checked", false);
					unselected++;
				} else {
					var col  = arguments[a].column;
					if (!w2utils.isInt(col)) { // unselect all columns
						var cols = [];
						for (var c in this.columns) { if (this.columns[c].hidden) continue; cols.push({ recid: recid, column: parseInt(c) }); }
						return this.unselect.apply(this, cols);
					}
					var s = record.selectedColumns;
					if (!$.isArray(s) || s.indexOf(col) == -1) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: recid, column: col });
					if (eventData.isCancelled === true) continue;
					// default action
					s.splice(s.indexOf(col), 1);
					$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid) + ' > td[col='+ col +']').removeClass('w2ui-selected');
					unselected++;
					if (s.length == 0) {
						record.selected = false;
						$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid)).removeData('selected');
						$('#grid_'+ this.name +'_cell_'+ index +'_select_check').prop('checked', false);
					}
				}
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
			this.status();
			this.addRange('selection');
			return unselected;
		},

		selectAll: function () {
			if (this.multiSelect === false) return;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, all: true });
			if (eventData.isCancelled === true) return;
			// default action
			var cols = [];
			for (var c in this.columns) cols.push(parseInt(c));
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				if (this.searchData.length == 0) { 
					// not searched
					this.set({ selected: true });
					if (this.selectType == 'row') {
						this.set({ selected: true });
					} else {
						this.set({ selected: true, selectedColumns: cols.slice() }); // .slice makes copy of the array
					}
				} else { 
					// local search applied
					for (var i=0; i<this.last.searchIds.length; i++) {
						this.records[this.last.searchIds[i]].selected = true;
						if (this.selectType != 'row') this.records[this.last.searchIds[i]].selectedColumns = cols.slice();
					}
					this.refresh();
				}
			} else { // remote data source
				if (this.selectType == 'row') {
					this.set({ selected: true });
				} else {
					this.set({ selected: true, selectedColumns: cols.slice() });
				}
				this.refresh();
			}
			var sel = this.getSelection();
			if (sel.length == 1) this.toolbar.enable('edit'); else this.toolbar.disable('edit');
			if (sel.length >= 1) this.toolbar.enable('delete'); else this.toolbar.disable('delete');
			this.addRange('selection');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		selectNone: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, all: true });
			if (eventData.isCancelled === true) return;
			// default action
			this.last.selected = [];
			for (var i in this.records) {
				var rec = this.records[i];
				if (rec.selected === true) {
					rec.selected = false;
					var tmp = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(rec.recid));
					tmp.removeClass('w2ui-selected').removeData('selected');
					$('#grid_'+ this.name +'_cell_'+ i +'_select_check').prop("checked", false);
					if (this.selectType != 'row') {
						var cols = rec.selectedColumns;
						for (var c in cols) tmp.find(' > td[col='+ cols[c] +']').removeClass('w2ui-selected');
						rec.selectedColumns = [];
					}
				}
			}
			this.toolbar.disable('edit', 'delete');
			this.removeRange('selection');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getSelection: function (returnIndex) {
			if (this.selectType == 'row') {
				var sel = this.find({ selected: true }, true);
				var ret = [];
				for (var s in sel) {
					if (returnIndex === true) {
						ret.push(sel[s]);
					} else {
						ret.push(this.records[sel[s]].recid);
					}
				}
				return ret;
			} else {
				var sel = this.find({ selected: true }, true);
				var ret = [];
				for (var s in sel) {
					var rec = this.records[sel[s]];
					for (var c in rec.selectedColumns) { 
						ret.push({ recid: rec.recid, index: parseInt(sel[s]), column: rec.selectedColumns[c] });
					}
				}
				return ret;
			}
		},

		search: function (field, value) {
			var obj 		= this;
			var url 		= (typeof this.url != 'object' ? this.url : this.url.get);
			var searchData 	= [];
			var last_multi 	= this.last.multi;
			var last_logic 	= this.last.logic;
			var last_field 	= this.last.field;
			var last_search = this.last.search;
			// 1: search() - advanced search (reads from popup)
			if (arguments.length == 0) {
				last_search = '';
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
						} else if (operator == 'in') {
							$.extend(tmp, { value: value1.split(',') });
						} else {
							$.extend(tmp, { value: value1 });
						}
						// conver date to unix time
						try {
							if (search.type == 'date' && operator == 'between') {
								tmp.value[0] = w2utils.isDate(value1, w2utils.settings.date_format, true).getTime();
								tmp.value[1] = w2utils.isDate(value2, w2utils.settings.date_format, true).getTime();
							}
							if (search.type == 'date' && operator == 'is') {
								tmp.value = w2utils.isDate(value1, w2utils.settings.date_format, true).getTime();
							}
						} catch (e) {

						}
						searchData.push(tmp);
					}
				}
				if (searchData.length > 0 && !url) {
					last_multi	= true;
					last_logic  = 'AND';
				} else {
					last_multi = true;
					last_logic = 'AND';
				}
			}
			// 2: search(field, value) - regular search
			if (typeof field == 'string') {
				last_field 	= field;
				last_search = value;
				last_multi	= false;
				last_logic	= 'OR';
				// loop through all searches and see if it applies
				if (typeof value != 'undefined') {
					if (field.toLowerCase() == 'all') {
						// if there are search fields loop thru them
						if (this.searches.length > 0) {
							for (var s in this.searches) {
								var search = this.searches[s];
								if (search.type == 'text' || (search.type == 'int' && w2utils.isInt(value)) || (search.type == 'float' && w2utils.isFloat(value))
										|| (search.type == 'money' && w2utils.isMoney(value)) || (search.type == 'hex' && w2utils.isHex(value))
										|| (search.type == 'date' && w2utils.isDate(value)) || (search.type == 'alphaNumeric' && w2utils.isAlphaNumeric(value)) ) {
									var tmp = {
										field	 : search.field,
										type	 : search.type,
										operator : (search.type == 'text' ? 'contains' : 'is'),
										value	 : value
									};
									searchData.push(tmp);
								}
								// range in global search box 
								if (search.type == 'int' && String(value).indexOf('-') != -1) {
									var t = String(value).split('-');
									var tmp = {
										field	 : search.field,
										type	 : search.type,
										operator : 'between',
										value	 : [t[0], t[1]]
									};
									searchData.push(tmp);
								}
							}
						} else { 
							// no search fields, loop thru columns
							for (var c in this.columns) {
								var tmp = {
									field	 : this.columns[c].field,
									type	 : 'text',
									operator : 'contains',
									value	 : value
								};
								searchData.push(tmp);
							}
						}
					} else {
						var search = this.getSearch(field);
						if (search == null) search = { field: field, type: 'text' };
						if (search.field == field) this.last.caption = search.caption;
						if (value != '') {
							var op  = 'contains';
							var val = value;
							if (w2utils.isInt(value)) {
								op  = 'is';
								val = value;
							}
							if (search.type == 'int' && value != '') {
								if (String(value).indexOf('-') != -1) {
									var tmp = value.split('-');
									if (tmp.length == 2) {
										op = 'between';
										val = [parseInt(tmp[0]), parseInt(tmp[1])];
									}
								}
								if (String(value).indexOf(',') != -1) {
									var tmp = value.split(',');
									op = 'in';
									val = [];
									for (var t in tmp) val.push(tmp[t]);
								}
							}
							var tmp = {
								field	 : search.field,
								type	 : search.type,
								operator : op,
								value	 : val
							}
							searchData.push(tmp);
						}
					}
				}
			}
			// 3: search([ { field, value, [operator,] [type] }, { field, value, [operator,] [type] } ], logic) - submit whole structure
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
					var data   	= field[f];
					var search 	= this.getSearch(data.field);
					if (search == null) search = { type: 'text', operator: 'contains' };
					// merge current field and search if any
					searchData.push($.extend(true, {}, search, data));
				}
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: searchData, 
					searchField: (field ? field : 'multi'), searchValue: (value ? value : 'multi') });
			if (eventData.isCancelled === true) return;
			// default action			
			this.searchData	 = eventData.searchData;
			this.last.field  = last_field;
			this.last.search = last_search;
			this.last.multi  = last_multi;
			this.last.logic  = last_logic;
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.selected		= [];
			// -- clear all search field
			this.searchClose();
			this.set({ expanded: false });
			// apply search
			if (url) {
				this.last.xhr_offset = 0;
				this.reload();
			} else {
				// local search
				this.localSearch();
				this.refresh();
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
						caption : w2utils.lang('All Fields')
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
			if (eventData.isCancelled === true) return;
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
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				this.last.xhr_offset = 0;
				this.reload();
			} else {
				// local search
				this.localSearch();
				this.refresh();
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		skip: function (offset) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				this.offset = parseInt(offset);
				if (this.offset < 0 || !w2utils.isInt(this.offset)) this.offset = 0;
				if (this.offset > this.total) this.offset = this.total - this.limit;
				// console.log('last', this.last);
				this.records  = [];
				this.buffered = 0;
				this.last.xhr_offset = 0;
				this.last.pull_more	 = true;
				this.last.scrollTop	 = 0;
				this.last.scrollLeft = 0;
				$('#grid_'+ this.name +'_records').prop('scrollTop',  0);
				this.initColumnOnOff();
				this.reload();
			} else {
				console.log('ERROR: grid.skip() can only be called when you have remote data source.');
			}
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
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				//this.refresh(); // show grid before pulling data
				if (this.last.xhr_offset > 0 && this.last.xhr_offset < this.buffered) this.last.xhr_offset = this.buffered;
				this.request('get-records', {}, null, callBack);
			} else {
				this.refresh();
				if (typeof callBack == 'function') callBack();
			}
		},

		reset: function (noRefresh) {
			// reset last remembered state
			this.offset				= 0;
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
			this.last.xhr_offset	= 0;
			// initial search panel
			if (this.last.sortData != null ) this.sortData	 = this.last.sortData;
			// select none without refresh
			this.set({ selected: false, expanded: false }, true);
			// refresh
			if (!noRefresh) this.refresh();
		},

		request: function (cmd, add_params, url, callBack) {
			if (typeof add_params == 'undefined') add_params = {};
			if (typeof url == 'undefined' || url == '' || url == null) url = this.url;
			if (url == '' || url == null) return;
			// build parameters list
			var params = {};
			if (!w2utils.isInt(this.offset)) this.offset = 0;
			if (!w2utils.isInt(this.last.xhr_offset)) this.last.xhr_offset = 0;
			// add list params
			params['cmd']  	 		= cmd;
			params['name'] 	 		= this.name;
			params['limit']  		= this.limit;
			params['offset'] 		= parseInt(this.offset) + this.last.xhr_offset;
			params['selected'] 		= this.getSelection();
			params['search']  		= this.searchData;
			params['search-logic'] 	= this.last.logic;
			params['sort'] 	  		= (this.sortData.length != 0 ? this.sortData : '');
			// append other params
			$.extend(params, this.postData);
			$.extend(params, add_params);
			// event before
			if (cmd == 'get-records') {
				var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, url: url, postData: params });
				if (eventData.isCancelled === true) { if (typeof callBack == 'function') callBack(); return false; }
			} else {
				var eventData = { url: this.url, postData: params };
			}
			// call server to get data
			var obj = this;
			this.lock(this.msgRefresh, true);
			if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {};
			var xhr_type = 'GET';
			var url = (typeof eventData.url != 'object' ? eventData.url : eventData.url.get);
			if (params.cmd == 'save-records') {
				if (typeof eventData.url == 'object') url = eventData.url.save;
				xhr_type = 'PUT';  // so far it is always update
			}
			if (params.cmd == 'delete-records') {
				if (typeof eventData.url == 'object') url = eventData.url.remove;
				xhr_type = 'DELETE';
			}
			if (!w2utils.settings.RESTfull) xhr_type = 'POST';
			this.last.xhr_cmd	 = params.cmd;
			this.last.xhr_start  = (new Date()).getTime();
			this.last.xhr = $.ajax({
				type		: xhr_type,
				url			: url, 
				data		: String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']'),
				dataType	: 'text',
				complete	: function (xhr, status) {
					obj.requestComplete(status, cmd, callBack);
				}
			});
			if (cmd == 'get-records') {
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},
				
		requestComplete: function(status, cmd, callBack) {
			var obj = this;
			this.unlock();
			setTimeout(function () { obj.status(w2utils.lang('Server Response') + ' ' + ((new Date()).getTime() - obj.last.xhr_start)/1000 +' ' + w2utils.lang('sec')); }, 10);
			this.last.pull_more 	= false;
			this.last.pull_refresh 	= true;

			// event before
			var event_name = 'load';
			if (this.last.xhr_cmd == 'save-records') event_name   = 'saved';
			if (this.last.xhr_cmd == 'delete-records') event_name = 'deleted';
			var eventData = this.trigger({ phase: 'before', target: this.name, type: event_name, xhr: this.last.xhr, status: status });
			if (eventData.isCancelled === true) {
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
						if (cmd == 'get-records') {
							if (this.last.xhr_offset == 0) {
								this.records = [];
								//data.xhr_status=data.status;
								delete data.status;
								$.extend(true, this, data);
								this.buffered = this.records.length;
							} else {
								var records = data.records;
								delete data.records;
								//data.xhr_status=data.status;
								delete data.status;
								$.extend(true, this, data);
								for (var r in records) {
									this.records.push(records[r]);
								}
								this.buffered = this.records.length;
							}
						}
						if (cmd == 'delete-records') { 
							this.reload(); 
							return;
						}
					}
				}
			} else {
				obj.error('AJAX Error. See console for more details.');
			}
			// event after
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				this.localSort();
				this.localSearch();
			}
			this.total = parseInt(this.total);
			this.trigger($.extend(eventData, { phase: 'after' }));
			// do not refresh if loading on infinite scroll
			if (this.last.xhr_offset == 0) this.refresh(); else this.scroll();
			// call back
			if (typeof callBack == 'function') callBack();
		},

		error: function (msg) {
			var obj = this;
			// let the management of the error outside of the grid
			var eventData = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
			if (eventData.isCancelled === true) {
				if (typeof callBack == 'function') callBack();
				return false;
			}
			// need a time out because message might be already up)
			setTimeout(function () { w2alert(msg, 'Error');	}, 1);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getChanged: function () {
			var changes = [];
			var tmp  	= this.find({ changed: true });
			for (var t in tmp) {
				changes.push($.extend(true, { recid: tmp[t].recid }, tmp[t].changes));
			}
			return changes;
		},

		mergeChanged: function () {
			var changed = this.getChanged();
			for (var c in changed) {
				var record = this.get(changed[c].recid);
				for (var s in changed[c]) {
					if (s == 'recid') continue; // do not allow to change recid
					try { eval('record.' + s + ' = changed[c][s]'); } catch (e) {}
					delete record.changed;
					delete record.changes; 
				}
			}
			$(this.box).find('.w2ui-editable input').removeClass('changed');
			this.refresh();
		},		

		// ===================================================
		// --  Action Handlers

		save: function () {
			var obj = this;
			var changed = this.getChanged();
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'save', changed: changed });
			if (eventData.isCancelled === true) return false;
			var url = (typeof this.url != 'object' ? this.url : this.url.save);
			if (url) {
				this.request('save-records', { 'changed' : eventData.changed }, null, 
					function () { // event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
					}
				);
			} else {
				this.mergeChanged();
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		editField: function (recid, column, value, event) {
			//console.log('edit field', recid, column);
			var obj   = this;
			var index = obj.get(recid, true);
			var rec   = obj.records[index];
			var col   = obj.columns[column];
			var edit  = col.editable;
			if (!rec || !col || !edit) return;
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'editField', target: obj.name, recid: recid, column: column, value: value, 
				index: index, originalEvent: event });
			if (eventData.isCancelled === true) return;
			value = eventData.value;
			// default behaviour
			this.selectNone();
			this.select({ recid: recid, column: column });
			// create input element
			var tr = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(recid));
			var el = tr.find('[col='+ column +'] > div');
			if (edit.type == 'enum') console.log('ERROR: Grid\'s inline editing does not support enum field type.');
			if (edit.type == 'list' || edit.type == 'select') console.log('ERROR: Grid\'s inline editing does not support list/select field type.');
			if (typeof edit.inTag   == 'undefined') edit.inTag   = '';
			if (typeof edit.outTag  == 'undefined') edit.outTag  = '';
			if (typeof edit.style   == 'undefined') edit.style   = '';
			if (typeof edit.items   == 'undefined') edit.items   = [];
			var val = (rec.changed && rec.changes[col.field] ? w2utils.stripTags(rec.changes[col.field]) : w2utils.stripTags(rec[col.field]));
			if (val == null || typeof val == 'undefined') val = '';
			if (typeof value != 'undefined' && value != null) val = value;
			var addStyle = (typeof col.style != 'undefined' ? col.style + ';' : '');
			if ($.inArray(col.render, ['number', 'int', 'float', 'money', 'percent']) != -1) addStyle += 'text-align: right;';
			el.addClass('w2ui-editable')
				.html('<input id="grid_'+ obj.name +'_edit_'+ recid +'_'+ column +'" value="'+ val +'" type="text"  '+
					'	style="outline: none; '+ addStyle + edit.style +'" field="'+ col.field +'" recid="'+ recid +'" column="'+ column +'" '+ edit.inTag +
					'>' + edit.outTag);
			el.find('input')
				.w2field(edit.type)
				.on('blur', function (event) {
					if (obj.parseObj(rec, col.field) != this.value) {
						// change event
						var eventData2 = obj.trigger({ phase: 'before', type: 'change', target: obj.name, input_id: this.id, recid: recid, column: column, 
							value_new: this.value, value_previous: (rec.changes ? rec.changes[col.field] : obj.parseObj(rec, col.field)), 
							value_original: obj.parseObj(rec, col.field) });
						if (eventData2.isCancelled === true) {
							// dont save new value
						} else {
							// default action
							rec.changed = true;
							rec.changes = rec.changes || {};
							rec.changes[col.field] = eventData2.value_new;
							// event after
							obj.trigger($.extend(eventData2, { phase: 'after' }));
						}
					} else {
						if (rec.changes) delete rec.changes[col.field];
						if ($.isEmptyObject(rec.changes)) delete rec.changes;
					}
					// refresh record
					$(tr).replaceWith(obj.getRecordHTML(index, tr.attr('line')));
				})
				.on('keydown', function (event) {
					var cancel = false;
					switch (event.keyCode) {
						case 9:  // tab
							cancel = true;
							var next = event.shiftKey ? prevCell(column) : nextCell(column);
							if (next != column) {
								this.blur();						
								setTimeout(function () { 
									if (obj.selectType != 'row') {
										obj.selectNone(); 
										obj.select({ recid: recid, column: next });
									} else {
										obj.editField(recid, next, null, event); 
									}
								}, 1);
							}
							break;

						case 13: // enter
							cancel = true;
							var next = event.shiftKey ? prevRow(index) : nextRow(index);
							if (next != index) {
								this.blur();						
								setTimeout(function () { 
									if (obj.selectType != 'row') {
										obj.selectNone(); 
										obj.select({ recid: obj.records[next].recid, column: column }); 
									} else {
										obj.editField(obj.records[next].recid, column, null, event);
									}										
								}, 1);
							}
							break;

						case 38: // up arrow
							cancel = true;
							var next = prevRow(index);
							if (next != index) {
								this.blur();						
								setTimeout(function () { 
									if (obj.selectType != 'row') {
										obj.selectNone(); 
										obj.select({ recid: obj.records[next].recid, column: column }); 
									} else {
										obj.editField(obj.records[next].recid, column, null, event);
									}										
								}, 1);
							}
							break;

						case 40: // down arrow
							cancel = true;
							var next = nextRow(index);
							if (next != index) {
								this.blur();						
								setTimeout(function () { 
									if (obj.selectType != 'row') {
										obj.selectNone(); 
										obj.select({ recid: obj.records[next].recid, column: column }); 
									} else {
										obj.editField(obj.records[next].recid, column, null, event);
									}										
								}, 1);
							}
							break;

						case 27: // escape
							var old = (rec.changed && rec.changes[col.field]) ? rec.changes[col.field] : obj.parseObj(rec, col.field);
							this.value = typeof old != 'undefined' ? old : '';
							this.blur();
							setTimeout(function () { obj.select({ recid: recid, column: column }) }, 1);
							break;
					}
					if (cancel) if (event.preventDefault) event.preventDefault();
					// -- functions
					function nextCell (check) {
						var newCheck = check + 1;
						if (obj.columns.length == newCheck) return check;
						if (obj.columns[newCheck].hidden) return nextCell(newCheck);
						return newCheck;
					}
					function prevCell (check) {
						var newCheck = check - 1;
						if (newCheck < 0) return check;
						if (obj.columns[newCheck].hidden) return prevCell(newCheck);
						return newCheck;
					}
					function nextRow (check) {
						var newCheck = check + 1;
						if (obj.records.length == newCheck) return check;
						return newCheck;
					}
					function prevRow (check) {
						var newCheck = check - 1;
						if (newCheck < 0) return check;
						return newCheck;
					}
				});
			// unselect
			if (typeof value == 'undefined' || value == null) {
				el.find('input').focus(); 
			} else {
				el.find('input').val('').focus().val(value);
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
		},

		delete: function (force) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'delete', force: force });
			if (eventData.isCancelled === true) return false;
			force = eventData.force;
			// default action
			var recs = this.getSelection();
			if (recs.length == 0) return;
			if (this.msgDelete != '' && !force) {
				w2confirm(obj.msgDelete, w2utils.lang('Delete Confirmation'), function (result) {
					if (result == 'Yes') w2ui[obj.name].delete(true); 
				});
				return;
			}
			// call delete script
			var url = (typeof this.url != 'object' ? this.url : this.url.remove);
			if (url) {
				this.request('delete-records');
			} else {
				if (typeof recs[0] != 'object') {
					this.remove.apply(this, recs);
				} else {
					// clear cells
					for (var r in recs) {
						var fld = this.columns[recs[r].column].field;
						var ind = this.get(recs[r].recid, true);
						if (ind != null) {
							this.records[ind][fld] = '';
							if (this.records[ind].changed) this.records[ind].changes[fld] = '';
						}
					}
					this.refresh();
				}
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		click: function (recid, event) {
			var time = (new Date()).getTime();
			var column = null;
			if (typeof recid == 'object') {
				column = recid.column;
				recid  = recid.recid;
			}
			if (w2utils.isInt(recid)) recid = parseInt(recid);
			if (typeof event == 'undefined') event = {};
			// check for double click
			if (time - parseInt(this.last.click_time) < 250 && event.type == 'click') {
				this.dblClick(recid, event);
				return;
			}
			this.last.click_time = time;
			// column user clicked on
			if (column == null && event.target) {
				var tmp = event.target;
				if (tmp.tagName != 'TD') tmp = $(tmp).parents('td')[0];
				if (typeof $(tmp).attr('col') != 'undefined') column = parseInt($(tmp).attr('col'));
			}
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'click', recid: recid, column: column, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// if it is subgrid unselect top grid
			var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid)).parents('tr');
			if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
				var grid  = parent.parents('.w2ui-grid').attr('name');
				w2ui[grid].selectNone();
				// all subgrids
				parent.parents('.w2ui-grid').find('.w2ui-expanded-row .w2ui-grid').each(function (index, el) {
					var grid = $(el).attr('name');
					if (w2ui[grid]) w2ui[grid].selectNone();
				});
			}
			// unselect all subgrids
			$(this.box).find('.w2ui-expanded-row .w2ui-grid').each(function (index, el) {
				var grid = $(el).attr('name');
				if (w2ui[grid]) w2ui[grid].selectNone();
			});
			// default action
			var obj = this;
			var sel = this.getSelection();
			$('#grid_'+ this.name +'_check_all').prop("checked", false);
			var ind    = this.get(recid, true);
			var record = this.records[ind];
			var selectColumns  = [];
			obj.last.sel_ind   = ind;
			obj.last.sel_col   = column;
			obj.last.sel_recid = recid;
			obj.last.sel_type  = 'click';
			// multi select with shif key 
			if (event.shiftKey && sel.length > 0) {
				if (sel[0].recid) {
					var start = this.get(sel[0].recid, true);
					var end   = this.get(recid, true);
					if (column > sel[0].column) {
						var t1 = sel[0].column;
						var t2 = column;
					} else {
						var t1 = column;
						var t2 = sel[0].column;
					}
					for (var c = t1; c <= t2; c++) selectColumns.push(c);
				} else {
					var start = this.get(sel[0], true);
					var end   = this.get(recid, true);
				}
				var sel_add = []
				if (start > end) { var tmp = start; start = end; end = tmp; }
				var url = (typeof this.url != 'object' ? this.url : this.url.get);
				for (var i = start; i <= end; i++) {
					if (this.searchData.length > 0 && !url && $.inArray(i, this.last.searchIds) == -1) continue;
					if (this.selectType == 'row') {
						sel_add.push(this.records[i].recid);
					} else {
						for (var sc in selectColumns) sel_add.push({ recid: this.records[i].recid, column: selectColumns[sc] });
					}
					//sel.push(this.records[i].recid);
				}
				this.select.apply(this, sel_add);
			} else {
				// clear other if necessary
				if (((!event.ctrlKey && !event.shiftKey && !event.metaKey) || !this.multiSelect) && !this.showSelectColumn) {
					var flag = record.selected;
					if (this.selectType != 'row' && $.inArray(column, record.selectedColumns) == -1) flag = false;
					if (sel.length > 300) this.selectNone(); else this.unselect.apply(this, sel);
					if (flag === true) {
						this.unselect({ recid: recid, column: column });
						//sel = [];
					} else {
						this.select({ recid: recid, column: column });
						//sel = [{ recid: recid, column: [column] }];
					}
				} else {
					var flag = record.selected;
					if (this.selectType != 'row' && $.inArray(column, record.selectedColumns) == -1) flag = false;
					if (flag === true) {
						this.unselect({ recid: recid, column: column });
						//sel.splice($.inArray(record.recid, sel), 1);
					} else {
						this.select({ recid: record.recid, column: column });
						//sel.push(record.recid);
					}
					setTimeout(function () { if (window.getSelection) window.getSelection().removeAllRanges(); }, 10);
				}
			}
			this.status();
			obj.last.selected = this.getSelection();
			obj.initResize();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		columnClick: function (field, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'columnClick', target: this.name, field: field, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// default behaviour
			this.sort(field);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		keydown: function (event) {
			// this method is called from w2utils
			var obj = this;
			if (obj.keyboard !== true) return;
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event });	
			if (eventData.isCancelled === true) return false;
			// default behavior
			var sel 	= obj.getSelection();
			if (sel.length == 0) return;
			var records = $('#grid_'+ obj.name +'_records');
			var recid	= sel[0];
			var columns = [];
			var recid2  = sel[sel.length-1];
			if (typeof recid == 'object') {
				recid 	= sel[0].recid;
				columns	= [];
				var ii = 0;
				while (true) {
					if (!sel[ii] || sel[ii].recid != recid) break;
					columns.push(sel[ii].column);
					ii++;
				}
				recid2  = sel[sel.length-1].recid;
			}
			var ind		= obj.get(recid, true);
			var ind2	= obj.get(recid2, true);
			var rec 	= obj.get(recid);
			var recEL	= $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid));
			var cancel  = false;
			switch (event.keyCode) {
				case 8:  // backspace
				case 46: // delete
					obj.delete();
					cancel = true;
					event.stopPropagation();
					break;

				case 27: // escape
					var sel = obj.getSelection();
					obj.selectNone();
					if (sel.length > 0) {
						if (typeof sel[0] == 'object') {
							obj.select({ recid: sel[0].recid, column: sel[0].column });
						} else {
							obj.select(sel[0]);
						}
					}
					cancel = true;
					break;

				case 13: // enter
				case 32: // spacebar
					if (columns.length == 0) columns.push(0);
					obj.editField(recid, columns[0], null, event);
					cancel = true;
					break;

				case 65: // cmd + A
					if (!event.metaKey && !event.ctrlKey) break;
					obj.selectAll();
					cancel = true;
					break;

				case 70: // cmd + F
					if (!event.metaKey && !event.ctrlKey) break;
					$('#grid_'+ obj.name + '_search_all').focus();
					cancel = true;
					break;

				case 13: // enter
					if (this.selectType == 'row') {
						if (recEL.length <= 0 || obj.show.expandColumn !== true) break;
						obj.toggle(recid, event);
						cancel = true;
					} else { // same as spacebar
						if (columns.length == 0) columns.push(0);
						obj.editField(recid, columns[0], null, event);
						cancel = true;						
					}
					break;

				case 37: // left
					// check if this is subgrid
					var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid)).parents('tr');
					if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
						var recid = parent.prev().attr('recid');
						var grid  = parent.parents('.w2ui-grid').attr('name');
						obj.selectNone();
						w2utils.keyboard.active(grid);
						w2ui[grid].set(recid, { expanded: false });
						w2ui[grid].collapse(recid);
						w2ui[grid].click(recid);
						cancel = true;
						break;
					}
					if (this.selectType == 'row') {
						if (recEL.length <= 0 || rec.expanded !== true ) break;
						obj.set(recid, { expanded: false }, true);
						obj.collapse(recid, event);
					} else {
						var prev = prevCell(columns[0]);
						if (prev != columns[0]) {
							if (event.shiftKey) {
								if (tmpUnselect()) return;
								var tmp    = [];
								var newSel = [];
								var unSel  = [];
								if (columns.indexOf(this.last.sel_col) == 0 && columns.length > 1) {
									for (var i in sel) {
										if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
										unSel.push({ recid: sel[i].recid, column: columns[columns.length-1] });
									}
								} else {
									for (var i in sel) {
										if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
										newSel.push({ recid: sel[i].recid, column: prev });
									}
								}
								obj.unselect.apply(obj, unSel);
								obj.select.apply(obj, newSel);
							} else {
								obj.click({ recid: recid, column: prev }, event);
							}
						}
						function prevCell (check) {
							var newCheck = check - 1;
							if (newCheck < 0) return check;
							if (obj.columns[newCheck].hidden) return findPrev(newCheck);
							return newCheck;
						}
					}
					cancel = true;
					break;

				case 9:  // tab
				case 39: // right
					if (this.selectType == 'row') {
						if (recEL.length <= 0 || rec.expanded === true || obj.show.expandColumn !== true) break;
						obj.expand(recid, event);
					} else {
						var next = nextCell(columns[columns.length-1]);
						if (next != columns[columns.length-1]) {
							if (event.shiftKey && event.keyCode == 39) {
								if (tmpUnselect()) return;
								var tmp    = [];
								var newSel = [];
								var unSel  = [];
								if (columns.indexOf(this.last.sel_col) == columns.length-1 && columns.length > 1) {
									for (var i in sel) {
										if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
										unSel.push({ recid: sel[i].recid, column: columns[0] });
									}
								} else {
									for (var i in sel) {
										if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
										newSel.push({ recid: sel[i].recid, column: next });
									}
								}
								obj.unselect.apply(obj, unSel);
								obj.select.apply(obj, newSel);
							} else {
								obj.click({ recid: recid, column: next }, event);
							}
						}
						function nextCell (check) {
							var newCheck = check + 1;
							if (obj.columns.length == newCheck) return check;
							if (obj.columns[newCheck].hidden) return findNext(newCheck);
							return newCheck;
						}
					}
					cancel = true;
					break;

				case 38: // up
					if (recEL.length <= 0) break;
					// move to the previous record
					var prev = prevRow(ind);
					if (prev != null) {
						// jump into subgrid
						if (obj.records[prev].expanded) {
							var subgrid = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[prev].recid) +'_expanded_row').find('.w2ui-grid');
							if (subgrid.length > 0 && w2ui[subgrid.attr('name')]) {
								obj.selectNone();
								var grid = subgrid.attr('name');
								var recs = w2ui[grid].records;
								w2utils.keyboard.active(grid);
								w2ui[grid].click(recs[recs.length-1].recid);
								cancel = true;
								break;
							}
						}						
						if (event.shiftKey) { // expand selection
							if (tmpUnselect()) return;
							if (obj.selectType == 'row') {
								if (obj.last.sel_ind > prev && obj.last.sel_ind != ind2) {
									obj.unselect(obj.records[ind2].recid);
								} else {
									obj.select(obj.records[prev].recid);
								}
							} else {
								if (obj.last.sel_ind > prev && obj.last.sel_ind != ind2) {
									prev = ind2;
									var tmp = [];
									for (var c in columns) tmp.push({ recid: obj.records[prev].recid, column: columns[c] });
									obj.unselect.apply(obj, tmp);
								} else {
									var tmp = [];
									for (var c in columns) tmp.push({ recid: obj.records[prev].recid, column: columns[c] });
									obj.select.apply(obj, tmp);
								}
							}
						} else { // move selected record
							obj.selectNone();
							obj.click({ recid: obj.records[prev].recid, column: columns[0] }, event);
						}
						obj.scrollIntoView(prev);
						if (event.preventDefault) event.preventDefault();
					} else {
						// jump out of subgird (if first record)
						var parent = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid)).parents('tr');
						if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
							var recid = parent.prev().attr('recid');
							var grid  = parent.parents('.w2ui-grid').attr('name');
							obj.selectNone();
							w2utils.keyboard.active(grid);
							w2ui[grid].click(recid);
							cancel = true;
							break;
						}
					}
					break;

				case 40: // down
					if (recEL.length <= 0) break;
					// jump into subgrid
					if (obj.records[ind2].expanded) {
						var subgrid = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind2].recid) +'_expanded_row').find('.w2ui-grid');
						if (subgrid.length > 0 && w2ui[subgrid.attr('name')]) {
							obj.selectNone();
							var grid = subgrid.attr('name');
							var recs = w2ui[grid].records;
							w2utils.keyboard.active(grid);
							w2ui[grid].click(recs[0].recid);
							cancel = true;
							break;
						}
					}
					// move to the next record
					var next = nextRow(ind2);
					if (next != null) {
						if (event.shiftKey) { // expand selection
							if (tmpUnselect()) return;
							if (obj.selectType == 'row') {
								if (this.last.sel_ind < next && this.last.sel_ind != ind) {
									obj.unselect(obj.records[ind].recid);
								} else {
									obj.select(obj.records[next].recid);
								}
							} else {
								if (this.last.sel_ind < next && this.last.sel_ind != ind) {
									next = ind;
									var tmp = [];
									for (var c in columns) tmp.push({ recid: obj.records[next].recid, column: columns[c] });
									obj.unselect.apply(obj, tmp);
								} else {
									var tmp = [];
									for (var c in columns) tmp.push({ recid: obj.records[next].recid, column: columns[c] });
									obj.select.apply(obj, tmp);
								}
							}
						} else { // move selected record
							obj.selectNone();
							obj.click({ recid: obj.records[next].recid, column: columns[0] }, event);
						}
						obj.scrollIntoView(next);
						cancel = true;
					} else {
						// jump out of subgrid (if last record in subgrid)
						var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind2].recid)).parents('tr');
						if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
							var recid = parent.next().attr('recid');
							var grid  = parent.parents('.w2ui-grid').attr('name');
							obj.selectNone();
							w2utils.keyboard.active(grid);
							w2ui[grid].click(recid);
							cancel = true;
							break;
						}
					}
					break;

				case 86: // v - paste
					if (event.ctrlKey || event.metaKey) {
						$('body').append('<textarea id="_tmp_copy_data" style="position: absolute; top: -100px; height: 1px;"></textarea>');
						$('#_tmp_copy_data').focus();
						setTimeout(function () { 
							obj.paste($('#_tmp_copy_data').val());
							$('#_tmp_copy_data').remove(); 
						}, 50); // need timer to allow paste
					}
					break;

				case 88: // x - cut
					if (event.ctrlKey || event.metaKey) {
						setTimeout(function () { obj.delete(true); }, 100);
					}
				case 67: // c - copy
					if (event.ctrlKey || event.metaKey) {
						var text = obj.copy();
						$('body').append('<textarea id="_tmp_copy_data" style="position: absolute; top: -100px; height: 1px;">'+ text +'</textarea>');
						$('#_tmp_copy_data').focus().select();
						setTimeout(function () { $('#_tmp_copy_data').remove(); }, 50);
					}
					break;
			}
			var tmp = [187, 189]; // =-
			for (var i=48; i<=90; i++) tmp.push(i); // 0-9,a-z,A-Z
			if (tmp.indexOf(event.keyCode) != -1 && !event.ctrlKey && !event.metaKey && !cancel) {
				if (columns.length == 0) columns.push(0);
				var tmp = String.fromCharCode(event.keyCode);
				if (event.keyCode == 187) tmp = '=';
				if (event.keyCode == 189) tmp = '-';
				if (!event.shiftKey) tmp = tmp.toLowerCase();
				obj.editField(recid, columns[0], tmp, event);
				cancel = true;				
			}
			if (cancel) { // cancel default behaviour
				if (event.preventDefault) event.preventDefault();
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));

			function nextRow (ind) {
				if ((ind + 1 < obj.records.length && obj.last.searchIds.length == 0) // if there are more records
						|| (obj.last.searchIds.length > 0 && ind < obj.last.searchIds[obj.last.searchIds.length-1])) {
					ind++;
					if (obj.last.searchIds.length > 0) {
						while (true) {
							if ($.inArray(ind, obj.last.searchIds) != -1 || ind > obj.records.length) break;
							ind++;
						}
					}
					return ind;
				} else {
					return null;
				}
			}

			function prevRow (ind) {
				if ((ind > 0 && obj.last.searchIds.length == 0)  // if there are more records
						|| (obj.last.searchIds.length > 0 && ind > obj.last.searchIds[0])) {
					ind--;
					if (obj.last.searchIds.length > 0) {
						while (true) {
							if ($.inArray(ind, obj.last.searchIds) != -1 || ind < 0) break;
							ind--;
						}
					}
					return ind;
				} else {
					return null;
				}
			}

			function tmpUnselect () {
				if (obj.last.sel_type != 'click') return false;
				if (obj.selectType != 'row') {
					obj.last.sel_type = 'key';
					if (sel.length > 1) {
						for (var s in sel) {
							if (sel[s].recid == obj.last.sel_recid && sel[s].column == obj.last.sel_col) {
								sel.splice(s, 1);
								break;
							}
						}
						obj.unselect.apply(obj, sel);
						return true;
					}
					return false;
				} else {
					obj.last.sel_type = 'key';
					if (sel.length > 1) {
						sel.splice(sel.indexOf(obj.records[obj.last.sel_ind].recid), 1);
						obj.unselect.apply(obj, sel);
						return true;
					}
					return false;
				}
			}
		},

		scrollIntoView: function (ind) {
			if (typeof ind == 'undefined') {
				var sel = this.getSelection();
				if (sel.length == 0) return;
				ind	= this.get(sel[0], true);
			}
			var records	= $('#grid_'+ this.name +'_records');
			if (records.length == 0) return;
			// if all records in view
			var len = this.last.searchIds.length;
			if (records.height() > this.recordHeight * (len > 0 ? len : this.records.length)) return;			
			if (len > 0) ind = this.last.searchIds.indexOf(ind); // if seach is applied
			// scroll to correct one
			var t1 = Math.floor(records[0].scrollTop / this.recordHeight);
			var t2 = t1 + Math.floor(records.height() / this.recordHeight);
			if (ind == t1) records.animate({ 'scrollTop': records.scrollTop() - records.height() / 1.3 });
			if (ind == t2) records.animate({ 'scrollTop': records.scrollTop() + records.height() / 1.3 });
			if (ind < t1 || ind > t2) records.animate({ 'scrollTop': (ind - 1) * this.recordHeight });
		},

		dblClick: function (recid, event) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// find columns
			var column = null;
			if (typeof recid == 'object') {
				column = recid.column;
				recid  = recid.recid;
			}
			if (typeof event == 'undefined') event = {};
			// column user clicked on
			if (column == null && event.target) {
				var tmp = event.target;
				if (tmp.tagName != 'TD') tmp = $(tmp).parents('td')[0];
				column = parseInt($(tmp).attr('col'));
			}
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'dblClick', recid: recid, column: column, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// default action
			this.selectNone();
			var col = this.columns[column];
			if (col && $.isPlainObject(col.editable)) {
				this.editField(recid, column, null, event);
			} else {
				this.select({ recid: recid, column: column });
				this.last.selected	 = this.getSelection();
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		toggle: function (recid) {
			var rec = this.get(recid);
			if (rec.expanded === true) return this.collapse(recid); else return this.expand(recid);
		},

		expand: function (recid) {
			var rec = this.get(recid);
			var obj = this;
			var id  = w2utils.escapeId(recid);
			if ($('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').length > 0) return false;
			if (rec.expanded == 'none') return false;
			// insert expand row
			var tmp = 1 + (this.show.selectColumn ? 1 : 0);
			var addClass = ''; // ($('#grid_'+this.name +'_rec_'+ w2utils.escapeId(recid)).hasClass('w2ui-odd') ? 'w2ui-odd' : 'w2ui-even');
			$('#grid_'+ this.name +'_rec_'+ id).after(
					'<tr id="grid_'+ this.name +'_rec_'+ id +'_expanded_row" class="w2ui-expanded-row '+ addClass +'">'+
						(this.show.lineNumbers ? '<td class="w2ui-col-number"></td>' : '') +
					'	<td class="w2ui-grid-data w2ui-expanded1" colspan="'+ tmp +'"><div style="display: none"></div></td>'+
					'	<td colspan="100" class="w2ui-expanded2">'+
					'		<div id="grid_'+ this.name +'_rec_'+ id +'_expanded" style="opacity: 0"></div>'+
					'	</td>'+
					'</tr>');
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: recid, 
				box_id: 'grid_'+ this.name +'_rec_'+ id +'_expanded', ready: ready });
			if (eventData.isCancelled === true) { 	
				$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove(); 
				return false; 
			}
			// default action
			$('#grid_'+ this.name +'_rec_'+ id).attr('expanded', 'yes').addClass('w2ui-expanded');
			$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').show();
			$('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('<div class="w2ui-spinner" style="width: 16px; height: 16px; margin: -2px 2px;"></div>');
			rec.expanded = true;
			// check if height of expaned row > 5 then remove spinner
			setTimeout(ready, 300);
			function ready() {
				var div1 = $('#grid_'+ obj.name +'_rec_'+ id +'_expanded');
				var div2 = $('#grid_'+ obj.name +'_rec_'+ id +'_expanded_row .w2ui-expanded1 > div');
				if (div1.height() < 5) return;
				div1.css('opacity', 1);
				div2.show().css('opacity', 1);
				$('#grid_'+ obj.name +'_cell_'+ obj.get(recid, true) +'_expand div').html('-');
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resizeRecords();
			return true;
		},

		collapse: function (recid) {
			var rec = this.get(recid);
			var obj = this;
			var id  = w2utils.escapeId(recid);
			if ($('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').length == 0) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'collapse', target: this.name, recid: recid,
				box_id: 'grid_'+ this.name +'_rec_'+ id +'_expanded' });
			if (eventData.isCancelled === true) return false; 
			// default action
			$('#grid_'+ this.name +'_rec_'+ id).removeAttr('expanded').removeClass('w2ui-expanded');
			$('#grid_'+ this.name +'_rec_'+ id +'_expanded').css('opacity', 0);
			$('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('+');
			setTimeout(function () {
				$('#grid_'+ obj.name +'_rec_'+ id +'_expanded').height('0px');
				setTimeout(function () {
					$('#grid_'+ obj.name +'_rec_'+ id +'_expanded_row').remove();
					delete rec.expanded;
					// event after
					obj.trigger($.extend(eventData, { phase: 'after' }));
					obj.resizeRecords();
				}, 300);
			}, 200);
			return true;
		},

		sort: function (field, direction) { // if no params - clears sort
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'sort', target: this.name, field: field, direction: direction });
			if (eventData.isCancelled === true) return false;
			// check if needed to quit
			if (typeof field != 'undefined') {
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
				if (event && !event.ctrlKey && !event.metaKey) { this.sortData = []; sortIndex = 0; }
				// set new sort
				if (typeof this.sortData[sortIndex] == 'undefined') this.sortData[sortIndex] = {};
				this.sortData[sortIndex].field 	   = field;
				this.sortData[sortIndex].direction = direction;
			} else {
				this.sortData = [];
			}
			// if local
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (!url) {
				this.localSort();
				if (this.searchData.length > 0) this.localSearch(true);
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
				this.refresh();
			} else {
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
				this.last.xhr_offset = 0;
				this.reload();
			}
		},

		copy: function () {
			var sel = this.getSelection();
			if (sel.length == 0) return '';
			var text = '';
			if (typeof sel[0] == 'object') { // cell copy
				// find min/max column
				var minCol = sel[0].column;
				var maxCol = sel[0].column;
				for (var s in sel) {
					if (sel[s].column < minCol) minCol = sel[s].column;
					if (sel[s].column > maxCol) maxCol = sel[s].column;
				}
				for (var s = 0; s < sel.length; s++) {
					var ind = this.get(sel[s].recid, true);
					for (var c = minCol; c <= maxCol; c++) {
						var col = this.columns[c];
						if (col.hidden === true) continue;
						text += w2utils.stripTags(this.getCellData(this.records[ind], ind, c)) + '\t';
					}
					text = text.substr(0, text.length-1); // remove last \t
					text += '\n';
					var lastRecid = sel[s].recid;
					while (s < sel.length && sel[s].recid == lastRecid) s++;
				}
			} else { // row copy
				for (var s in sel) {
					var ind = this.get(sel[s], true);
					for (var c in this.columns) {
						var col = this.columns[c];
						if (col.hidden === true) continue;
						text += w2utils.stripTags(this.getCellData(this.records[ind], ind, c)) + '\t';
					}
					text = text.substr(0, text.length-1); // remove last \t
					text += '\n';
				}
			}
			text = text.substr(0, text.length - 1);
			// before event
			var eventData = this.trigger({ phase: 'before', type: 'copy', target: this.name, text: text });
			if (eventData.isCancelled === true) return '';
			text = eventData.text;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return text;
		},

		paste: function (text) {
			var sel = this.getSelection();
			if (this.selectType == 'row' || sel.length == 0) {
				console.log('ERROR: You can paste only if grid.selectType = \'cell\' and when at least one cell selected.');
				return false;
			}
			var ind = this.get(sel[0].recid, true);
			var col = sel[0].column;
			// before event
			var eventData = this.trigger({ phase: 'before', type: 'paste', target: this.name, text: text, index: ind, column: col });
			if (eventData.isCancelled === true) return;
			text = eventData.text;
			// default action
			var newSel = [];
			var text   = text.split('\n');
			for (var t in text) {
				var tmp  = text[t].split('\t');
				var cnt  = 0;
				var rec  = this.records[ind];
				var cols = [];
				for (var dt in tmp) {
					var field = this.columns[col + cnt].field;
					rec.changed = true;
					rec.changes = rec.changes || {};
					rec.changes[field] = tmp[dt];
					cols.push(col + cnt);
					cnt++;
				}
				for (var c in cols) newSel.push({ recid: rec.recid, column: cols[c] });
				ind++;
			}
			this.selectNone();
			this.select.apply(this, newSel);
			this.refresh();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));			
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
			if (eventData.isCancelled === true) return false;
			// resize
			obj.resizeBoxes(); 
			obj.resizeRecords();
			// init editable
			// $('#grid_'+ obj.name + '_records .w2ui-editable input').each(function (index, el) {
			// 	var column = obj.columns[$(el).attr('column')];
			// 	if (column && column.editable) $(el).w2field(column.editable);
			// });
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			return (new Date()).getTime() - time;
		},

		refresh: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (this.total <= 0 && !url && this.searchData.length == 0) {
				this.total = this.records.length;
				this.buffered = this.total;
			}
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			this.toolbar.disable('edit', 'delete');
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh' });
			if (eventData.isCancelled === true) return false;
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
						var tmp = $('#grid_'+ obj.name +'_search_all');
						tmp.val(this.last.search);
					}
				}
			} else {
				$('#grid_'+ this.name +'_toolbar').hide();
			}
			// -- make sure search is closed
			this.searchClose();
			// search placeholder
			var searchEl = $('#grid_'+ obj.name +'_search_all');
			if (this.searches.length == 0) {
				this.last.field = 'all';
			}
			if (!this.multiSearch && this.last.field == 'all' && this.searches.length > 0) {
				this.last.field 	= this.searches[0].field;
				this.last.caption 	= this.searches[0].caption;
			}
			for (var s in this.searches) {
				if (this.searches[s].field == this.last.field) this.last.caption = this.searches[s].caption;
			}
			if (this.last.multi) {
				searchEl.attr('placeholder', '[' + w2utils.lang('Multiple Fields') + ']');
			} else {
				searchEl.attr('placeholder', this.last.caption);				
			}

			// focus search if last searched
			if (this._focus_when_refreshed === true) {
				clearTimeout(obj._focus_timer);
				obj._focus_timer = setTimeout(function () {
					if (searchEl.length > 0) { searchEl[0].focus(); }
					delete obj._focus_when_refreshed;
					delete obj._focus_timer;
				}, 600); // need time to render
			}

			// -- separate summary
			var tmp = this.find({ summary: true }, true);
			if (tmp.length > 0) {
				for (var t in tmp) this.summary.push(this.records[tmp[t]]);
				for (var i=tmp.length-1; i>=0; i--) this.records.splice(tmp[i], 1); 
				this.total = this.records.length;
			}

			// -- body
			var bodyHTML = '';
			bodyHTML +=  '<div id="grid_'+ this.name +'_records" class="w2ui-grid-records"'+
						'	onscroll="var obj = w2ui[\''+ this.name + '\']; '+
						'		obj.last.scrollTop = this.scrollTop; '+
						'		obj.last.scrollLeft = this.scrollLeft; '+
						'		$(\'#grid_'+ this.name +'_columns\')[0].scrollLeft = this.scrollLeft;'+
						'		$(\'#grid_'+ this.name +'_summary\')[0].scrollLeft = this.scrollLeft;'+
						'		obj.scroll(event);">'+
							this.getRecordsHTML() +
						'</div>'+
						'<div id="grid_'+ this.name +'_columns" class="w2ui-grid-columns">'+
						'	<table>'+ this.getColumnsHTML() +'</table>'+
						'</div>'; // Columns need to be after to be able to overlap
			$('#grid_'+ this.name +'_body').html(bodyHTML);
			// show summary records
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
			this.status();
			// collapse all records
			var rows = obj.find({ expanded: true }, true);
			for (var r in rows) obj.records[rows[r]].expanded = false;
			// mark selection
			setTimeout(function () {
				var str  = $.trim($('#grid_'+ obj.name +'_search_all').val());
				if (str != '') $(obj.box).find('.w2ui-grid-data > div').w2marker(str);
			}, 50);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			obj.resize(); 
			obj.addRange('selection');
			setTimeout(function () { obj.resize(); obj.scroll(); }, 1); // allow to render first
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
			if (eventData.isCancelled === true) return false;
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
			if (this.selectType != 'row') $(this.box).addClass('w2ui-ss');
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
			// init toolbar
			this.initToolbar();
			if (this.toolbar != null) this.toolbar.render($('#grid_'+ this.name +'_toolbar')[0]);
			// init footer
			$('#grid_'+ this.name +'_footer').html(this.getFooterHTML());
			// refresh
			this.reload();

			// init mouse events for mouse selection
			$(this.box).on('mousedown', mouseStart);			
			$(this.box).on('selectstart', function () { return false; }); // fixes chrome cursror bug

			function mouseStart (event) {
				if (obj.last.move && obj.last.move.type == 'expand') return;
				obj.last.move = {
					x		: event.screenX,
					y		: event.screenY,
					divX	: 0,
					divY	: 0,
					recid	: $(event.target).parents('tr').attr('recid'),
					column	: (event.target.tagName == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col')),
					type	: 'select',
					start	: true
				};
				$(document).on('mousemove', mouseMove);
				$(document).on('mouseup', mouseStop);
			}

			function mouseMove (event) {
				if (!obj.last.move || obj.last.move.type != 'select') return;
				obj.last.move.divX = (event.screenX - obj.last.move.x);
				obj.last.move.divY = (event.screenY - obj.last.move.y);
				if (Math.abs(obj.last.move.divX) <= 1 && Math.abs(obj.last.move.divY) <= 1) return; // only if moved more then 1px
				if (obj.last.move.start) {
					obj.selectNone();
					obj.last.move.start = false;
				}
				var newSel= [];
				var recid = (event.target.tagName == 'TR' ? $(event.target).attr('recid') : $(event.target).parents('tr').attr('recid'));
				if (typeof recid == 'undefined') return;
				var ind1  = obj.get(obj.last.move.recid, true);
				var ind2  = obj.get(recid, true);
				var col1  = parseInt(obj.last.move.column);
				var col2  = parseInt(event.target.tagName == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col'));
				if (ind1 > ind2) { var tmp = ind1; ind1 = ind2; ind2 = tmp; }
				// check if need to refresh
				var tmp = 'ind1:'+ ind1 +',ind2;'+ ind2 +',col1:'+ col1 +',col2:'+ col2;
				if (obj.last.move.range == tmp) return; 
				obj.last.move.range = tmp;
				for (var i = ind1; i <= ind2; i++) {
					if (obj.last.searchIds.length > 0 && obj.last.searchIds.indexOf(i) == -1) continue;
					if (obj.selectType != 'row') {
						if (col1 > col2) { var tmp = col1; col1 = col2; col2 = tmp; }
						var tmp = [];
						for (var c = col1; c <= col2; c++) {
							if (obj.columns[c].hidden) continue;
							newSel.push({ recid: obj.records[i].recid, column: parseInt(c) });
						}
					} else {
						newSel.push(obj.records[i].recid);
					}					
				}
				if (obj.selectType != 'row') {
					var sel = obj.getSelection();
					// add more items
					var tmp = [];
					for (var ns in newSel) {
						var flag = false;
						for (var s in sel) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true;
						if (!flag) tmp.push({ recid: newSel[ns].recid, column: newSel[ns].column }); 
					}
					obj.select.apply(obj, tmp);
					// remove items
					var tmp = [];
					for (var s in sel) {
						var flag = false;
						for (var ns in newSel) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true;
						if (!flag) tmp.push({ recid: sel[s].recid, column: sel[s].column });
					}
					obj.unselect.apply(obj, tmp);
				} else {
					if (obj.multiSelect) {
						var sel = obj.getSelection();
						for (var ns in newSel) if (sel.indexOf(newSel[ns]) == -1) obj.select(newSel[ns]); // add more items					
						for (var s in sel) if (newSel.indexOf(sel[s]) == -1) obj.unselect(sel[s]); // remove items
					}
				}
			}

			function mouseStop (event) {
				if (!obj.last.move || obj.last.move.type != 'select') return;
				delete obj.last.move;
				$(document).off('mousemove', mouseMove);
				$(document).off('mouseup', mouseStop);
			}			
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// attach to resize event
			if ($('.w2ui-layout').length == 0) { // if there is layout, it will send a resize event
				this.tmp_resize = function (event) { w2ui[obj.name].resize(); }
				$(window).off('resize', this.tmp_resize).on('resize', this.tmp_resize);
			}
			return (new Date()).getTime() - time;
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });
			if (eventData.isCancelled === true) return false;
			// remove events
			$(window).off('resize', this.tmp_resize);
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
			var col_html =  '<div class="w2ui-col-on-off">'+
						    '<table>';
			for (var c in this.columns) {
				var col = this.columns[c];
				col_html += '<tr>'+
					'<td>'+
					'	<input id="grid_'+ this.name +'_column_'+ c +'_check" type="checkbox" tabIndex="-1" '+ (col.hidden ? '' : 'checked') +
					'		onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \''+ col.field +'\');">'+
					'</td>'+
					'<td>'+
					'	<label for="grid_'+ this.name +'_column_'+ c +'_check">'+
							(this.columns[c].caption == '' ? '- column '+ (c+1) +' -' : this.columns[c].caption) +
						'</label>'+
					'</td>'+
					'</tr>';
			}
			col_html += '<tr><td colspan="2"><div style="border-top: 1px solid #ddd;"></div></td></tr>';
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				col_html +=
						'<tr><td colspan="2" style="padding: 0px">'+
						'	<div style="cursor: pointer; padding: 2px 8px; cursor: default">'+
						'		'+ w2utils.lang('Skip') +' <input type="text" style="width: 45px" value="'+ this.offset +'" '+
						'				onchange="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'skip\', this.value);"> '+ w2utils.lang('Records')+
						'	</div>'+
						'</td></tr>';
			}
			col_html +=	'<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'line-numbers\');">'+
						'	<div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Toggle Line Numbers') +'</div>'+
						'</td></tr>'+
						'<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'resize\');">'+
						'	<div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Reset Column Size') + '</div>'+
						'</td></tr>';
			col_html += "</table></div>";
			this.toolbar.get('column-on-off').html = col_html;
		},

		columnOnOff: function (el, event, field, value) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'columnOnOff', checkbox: el, field: field, originalEvent: event });
			if (eventData.isCancelled === true) return false;
			// regular processing
			var obj = this;
			// collapse expanded rows
			for (var r in this.records) { 
				if (this.records[r].expanded === true) this.records[r].expanded = false 
			}
			// show/hide
			var hide = true;
			if (field == 'line-numbers') {
				this.show.lineNumbers = !this.show.lineNumbers;
				this.refresh();
			} else if (field == 'skip') {
				if (!w2utils.isInt(value)) value = 0;
				obj.skip(value);
			} else if (field == 'resize') {
				// restore sizes
				for (var c in this.columns) {
					if (typeof this.columns[c].sizeOriginal != 'undefined') {
						this.columns[c].size = this.columns[c].sizeOriginal;
					}
				}
				this.initResize();
				this.resize();
			} else {
				var col = this.getColumn(field);
				if (col.hidden) { 
					$(el).prop('checked', true); 
					this.showColumn(col.field); 
				} else { 
					$(el).prop('checked', false); 
					this.hideColumn(col.field); 
				}
				hide = false;
			}
			this.initColumnOnOff();
			if (hide) {
				setTimeout(function () { 
					$().w2overlay();
					obj.toolbar.uncheck('column-on-off'); 
				}, 100);				
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
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
						'<div class="w2ui-toolbar-search">'+
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
						'		<div title="'+ w2utils.lang('Clear Search') +'" class="w2ui-search-clear" id="grid_'+ this.name +'_searchClear"  '+
						'			 onclick="var obj = w2ui[\''+ this.name +'\']; obj.searchReset();" '+
						'		>&nbsp;&nbsp;</div>'+
						'	</td>'+
						'</tr></table>'+
						'</div>';
					this.toolbar.items.push({ type: 'html', id: 'search', html: html });
					if (this.multiSearch && this.searches.length > 0) {
						this.toolbar.items.push({ type: 'check', id: 'search-advanced', caption: w2utils.lang('Search...'), hint: w2utils.lang('Open Search Fields') });
					}
				}
				if (this.show.toolbarSearch && (this.show.toolbarAdd || this.show.toolbarEdit || this.show.toolbarDelete || this.show.toolbarSave)) {
					this.toolbar.items.push({ type: 'break', id: 'break1' });
				}
				if (this.show.toolbarAdd) {
					this.toolbar.items.push({ type: 'button', id: 'add', caption: w2utils.lang('Add New'), hint: w2utils.lang('Add new record'), img: 'icon-add' });
				}
				if (this.show.toolbarEdit) {
					this.toolbar.items.push({ type: 'button', id: 'edit', caption: w2utils.lang('Edit'), hint: w2utils.lang('Edit selected record'), img: 'icon-edit', disabled: true });
				}
				if (this.show.toolbarDelete) {
					this.toolbar.items.push({ type: 'button', id: 'delete', caption: w2utils.lang('Delete'), hint: w2utils.lang('Delete selected records'), img: 'icon-delete', disabled: true });
				}
				if (this.show.toolbarSave) {
					if (this.show.toolbarAdd || this.show.toolbarDelete || this.show.toolbarEdit) {
						this.toolbar.items.push({ type: 'break', id: 'break2' });
					}
					this.toolbar.items.push({ type: 'button', id: 'save', caption: w2utils.lang('Save'), hint: w2utils.lang('Save changed records'), img: 'icon-save' });
				}
				// add original buttons
				for (var i in tmp_items) this.toolbar.items.push(tmp_items[i]);

				// =============================================
				// ------ Toolbar onClick processing

				var obj = this;
				this.toolbar.on('click', function (event) {
					var eventData = obj.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event });
					if (eventData.isCancelled === true) return false;
					var id = event.target;
					switch (id) {
						case 'reload':
							var eventData2 = obj.trigger({ phase: 'before', type: 'reload', target: obj.name });
							if (eventData2.isCancelled === true) return false;
							// obj.reset(true); // do not reset to preserve search and sort
							obj.reload();
							obj.trigger($.extend(eventData2, { phase: 'after' }));
							break;
						case 'column-on-off':
							for (var c in obj.columns) {
								if (obj.columns[c].hidden) {
									$("#grid_"+ obj.name +"_column_"+ c + "_check").prop("checked", false);
								} else {
									$("#grid_"+ obj.name +"_column_"+ c + "_check").prop('checked', true);
								}
							}
							obj.initResize();
							obj.resize();
							break;
						case 'search-advanced':
							var tb = this;
							var it = this.get(id);
							if (it.checked) {
								obj.searchClose(); 
								setTimeout(function () { tb.uncheck(id); }, 1);
							} else {
								obj.searchOpen();
								event.originalEvent.stopPropagation();
								function tmp_close() { tb.uncheck(id); $(document).off('click', 'body', tmp_close); }
								$(document).on('click', 'body', tmp_close);
							}
							break;
						case 'add':
							// events
							var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'add', recid: null });
							obj.trigger($.extend(eventData, { phase: 'after' }));
							break;
						case 'edit':
							var sel 	= obj.getSelection();
							var recid 	= null;
							if (sel.length == 1) recid = sel[0];
							// events
							var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'edit', recid: recid });
							obj.trigger($.extend(eventData, { phase: 'after' }));
							break;
						case 'delete':
							obj.delete();
							break;
						case 'save':
							obj.save();
							break;
					}
					// no default action
					obj.trigger($.extend(eventData, { phase: 'after' }));
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
						$('#grid_'+ this.name +'_field_'+s).w2field('clear').w2field(search.type);
						$('#grid_'+ this.name +'_field2_'+s).w2field('clear').w2field(search.type);
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
						if (sdata.operator == 'in') {
							$('#grid_'+ this.name +'_field_'+ s).val(sdata.value).trigger('change');
						} else {
							$('#grid_'+ this.name +'_field_'+ s).val(sdata.value[0]).trigger('change');
							$('#grid_'+ this.name +'_field2_'+ s).val(sdata.value[1]).trigger('change');
						}
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
					obj.last.tmp = {
						x 	: event.screenX,
						y 	: event.screenY,
						gx 	: event.screenX,
						gy 	: event.screenY,
						col : parseInt($(this).attr('name'))
					};
					if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
					if (event.preventDefault) event.preventDefault();
					// fix sizes
					for (var c in obj.columns) {
						if (typeof obj.columns[c].sizeOriginal == 'undefined') obj.columns[c].sizeOriginal = obj.columns[c].size;
						obj.columns[c].size = obj.columns[c].sizeCalculated;
					}
					var eventData = { phase: 'before', type: 'columnResize', target: obj.name, column: obj.last.tmp.col, field: obj.columns[obj.last.tmp.col].field };
					eventData = obj.trigger($.extend(eventData, { resizeBy: 0, originalEvent: event }));
					// set move event
					var mouseMove = function (event) {
						if (obj.resizing != true) return;
						if (!event) event = window.event;
						// event before
						eventData = obj.trigger($.extend(eventData, { resizeBy: (event.screenX - obj.last.tmp.gx), originalEvent: event }));
						if (eventData.isCancelled === true) { eventData.isCancelled = false; return; }
						// default action
						obj.last.tmp.x = (event.screenX - obj.last.tmp.x);
						obj.last.tmp.y = (event.screenY - obj.last.tmp.y);
						obj.columns[obj.last.tmp.col].size = (parseInt(obj.columns[obj.last.tmp.col].size) + obj.last.tmp.x) + 'px';
						obj.resizeRecords();
						// reset
						obj.last.tmp.x = event.screenX;
						obj.last.tmp.y = event.screenY;
					}
					var mouseUp = function (event) {
						delete obj.resizing;
						$(document).off('mousemove', 'body');
						$(document).off('mouseup', 'body');
						obj.resizeRecords();
						// event before
						obj.trigger($.extend(eventData, { phase: 'after', originalEvent: event }));
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
			var bodyOverflowX = false;
			var bodyOverflowY = false;
			if (body.width() < $(records).find('>table').width()) bodyOverflowX = true;
			if (body.height() - columns.height() < $(records).find('>table').height() + (bodyOverflowX ? w2utils.scrollBarSize() : 0)) bodyOverflowY = true;
			if (!this.fixedBody) { bodyOverflowY = false; bodyOverflowX = false; }
			if (bodyOverflowX || bodyOverflowY) {
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.scrollBarSize()).show();
				records.css({ 
					top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
					"-webkit-overflow-scrolling": "touch",
					"overflow-x": (bodyOverflowX ? 'auto' : 'hidden'), 
					"overflow-y": (bodyOverflowY ? 'auto' : 'hidden') });
			} else {
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').hide();
				records.css({ 
					top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px', 
					overflow: 'hidden' 
				});
				if (records.length > 0) { this.last.scrollTop  = 0; this.last.scrollLeft = 0; } // if no scrollbars, always show top
			}
			if (this.show.emptyRecords && !bodyOverflowY) {
				var max = Math.floor(records.height() / this.recordHeight) + 1;
				if (this.fixedBody) {
					for (var di = this.buffered; di <= max; di++) {
						var html  = '';
						html += '<tr class="'+ (di % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" style="height: '+ this.recordHeight +'px">';
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
					- (bodyOverflowY ? w2utils.scrollBarSize() : 0)
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
				columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.scrollBarSize()).show();
			}
			// resize columns
			columns.find('> table > tbody > tr:nth-child(1) td').each(function (index, el) {
				var ind = $(el).attr('col');
				if (typeof ind != 'undefined' && obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated);
				// last column
				if ($(el).hasClass('w2ui-head-last')) {
					$(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
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
					$(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
				}
			});
			this.initResize();
			this.refreshRanges();
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
					var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						'	<option value="begins with">'+ w2utils.lang('begins with') +'</option>'+
						'	<option value="contains">'+ w2utils.lang('contains') +'</option>'+
						'	<option value="ends with">'+ w2utils.lang('ends with') +'</option>'+
						'</select>';
				}
				if (s.type == 'int' || s.type == 'float' || s.type == 'date') {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'" '+
						'	onchange="var range = $(\'#grid_'+ this.name + '_range_'+ i +'\'); range.hide(); '+
						'			  var fld  = $(\'#grid_'+ this.name +'_field_'+ i +'\'); '+
						'			  var fld2 = fld.parent().find(\'span input\'); '+
						'			  if ($(this).val() == \'in\') fld.w2field(\'clear\'); else fld.w2field(\'clear\').w2field(\''+ s.type +'\');'+
						'			  if ($(this).val() == \'between\') { range.show(); fld2.w2field(\'clear\').w2field(\''+ s.type +'\'); }'+
						'			  var obj = w2ui[\''+ this.name +'\'];'+
						'			  fld.on(\'keypress\', function (evnt) { if (evnt.keyCode == 13) obj.search(); }); '+
						'			  fld2.on(\'keypress\', function (evnt) { if (evnt.keyCode == 13) obj.search(); }); '+
						'			">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						(s.type == 'date' ? '' : '<option value="in">'+ w2utils.lang('in') +'</option>')+
						'	<option value="between">'+ w2utils.lang('between') +'</option>'+
						'</select>';
				}
				if (s.type == 'list') {
					var operator =  'is <input type="hidden" value="is" id="grid_'+ this.name +'_operator_'+ i +'">';
				}
				html += '<tr>'+
						'	<td class="close-btn">'+ btn +'</td>' +
						'	<td class="caption">'+ s.caption +'</td>' +
						'	<td class="operator">'+ operator +'</td>'+
						'	<td class="value">';

				switch (s.type) {
					case 'alphaNumeric':
					case 'text':
						html += '<input rel="search" type="text" size="40" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'>';
						break;

					case 'int':
					case 'float':
					case 'hex':
					case 'money':
					case 'date':
						html += '<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'>'+
								'<span id="grid_'+ this.name +'_range_'+ i +'" style="display: none">'+
								'&nbsp;-&nbsp;&nbsp;<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field2_'+i+'" name="'+ s.field +'" '+ s.inTag +'>'+
								'</span>';
						break;

					case 'list':
						html += '<select rel="search" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'></select>';
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
						html += '<td class="w2ui-head '+ sortStyle +'" col="'+ ii + '" rowspan="2" colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'" '+
										(col.sortable ? 'onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);"' : '') +'>'+
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
					html += '<td class="w2ui-head w2ui-col-number" onclick="w2ui[\''+ obj.name +'\'].sort();">'+
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
						html += '<td col="'+ i +'" class="w2ui-head '+ sortStyle +'" '+
										(col.sortable ? 'onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);"' : '') + '>'+
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
			// larget number works better with chrome, smaller with FF.
			if (this.buffered > 300) this.show_extra = 30; else this.show_extra = 300; 
			var records	= $('#grid_'+ this.name +'_records');
			var limit	= Math.floor(records.height() / this.recordHeight) + this.show_extra + 1;
			if (!this.fixedBody) limit = this.buffered;
			// always need first record for resizing purposes
			var html = '<table>' + this.getRecordHTML(-1, 0);
			// first empty row with height
			html += '<tr id="grid_'+ this.name + '_rec_top" line="top" style="height: '+ 0 +'px">'+
					'	<td colspan="200"></td>'+
					'</tr>';
			for (var i = 0; i < limit; i++) {
				html += this.getRecordHTML(i, i+1);
			}
			html += '<tr id="grid_'+ this.name + '_rec_bottom" line="bottom" style="height: '+ ((this.buffered - limit) * this.recordHeight) +'px">'+
					'	<td colspan="200"></td>'+
					'</tr>'+
					'<tr id="grid_'+ this.name +'_rec_more" style="display: none">'+
					'	<td colspan="200" class="w2ui-load-more"></td>'+
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

		scroll: function (event) {
			var time = (new Date()).getTime();
			var obj  = this;
			var records	= $('#grid_'+ this.name +'_records');
			if (this.records.length == 0 || records.length == 0 || records.height() == 0) return;
			if (this.buffered > 300) this.show_extra = 30; else this.show_extra = 300; 
			// need this to enable scrolling when this.limit < then a screen can fit
			if (records.height() < this.buffered * this.recordHeight && records.css('overflow-y') == 'hidden') {
				if (this.total > 0) this.refresh();
				return;
			}
			// update footer
			var t1 = Math.floor(records[0].scrollTop / this.recordHeight + 1);
			var t2 = Math.floor(records[0].scrollTop / this.recordHeight + 1) + Math.round(records.height() / this.recordHeight);
			if (t1 > this.buffered) t1 = this.buffered;
			if (t2 > this.buffered) t2 = this.buffered;
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			$('#grid_'+ this.name + '_footer .w2ui-footer-right').html(w2utils.formatNumber(this.offset + t1) + '-' + w2utils.formatNumber(this.offset + t2) + ' ' + w2utils.lang('of') + ' ' +	w2utils.formatNumber(this.total) + 
					(url ? ' ('+ w2utils.lang('buffered') + ' '+ w2utils.formatNumber(this.buffered) + (this.offset > 0 ? ', skip ' + w2utils.formatNumber(this.offset) : '') + ')' : '')
			);
			// only for local data source, else no extra records loaded
			if (!url && (!this.fixedBody || this.total <= 300)) return;
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
			//$('#log').html('buffer: '+ this.buffered +' start-end: ' + start + '-'+ end + ' ===> first-last: ' + first + '-' + last);
			if (first < start || first == 1 || this.last.pull_refresh) { // scroll down
				//console.log('end', end, 'last', last, 'show_extre', this.show_extra, this.last.pull_refresh);
				if (end <= last + this.show_extra - 2 && end != this.total) return;
				this.last.pull_refresh = false;
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
					if (!this.records[i-1]) continue;
					if (this.records[i-1].expanded === true) this.records[i-1].expanded = false;
					tr2.before(this.getRecordHTML(i-1, i));
				}
				markSearch();
				setTimeout(function() { obj.refreshRanges(); }, 0);
			} else { // scroll up
				if (start >= first - this.show_extra + 2 && start > 1) return;
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
					if (!this.records[i-1]) continue;
					if (this.records[i-1].expanded === true) this.records[i-1].expanded = false;
					tr1.after(this.getRecordHTML(i-1, i));
				}
				markSearch();
				setTimeout(function() { obj.refreshRanges(); }, 0);
			}
			// first/last row size
			var h1 = (start - 1) * obj.recordHeight;
			var h2 = (this.buffered - end) * obj.recordHeight;
			if (h2 < 0) h2 = 0;
			tr1.css('height', h1 + 'px');
			tr2.css('height', h2 + 'px');
			obj.last.range_start = start;
			obj.last.range_end   = end;
			// load more if needed
			var s = Math.floor(records[0].scrollTop / this.recordHeight);
			var e = s + Math.floor(records.height() / this.recordHeight);
			if (e + 10 > this.buffered && this.last.pull_more !== true && this.buffered < this.total - this.offset) {
				if (this.autoLoad === true) {
					this.last.pull_more = true;
					this.last.xhr_offset += this.limit;
					this.request('get-records');
				} else {
					var more = $('#grid_'+ this.name +'_rec_more');
					if (more.css('display') == 'none') {
						more.show()
							.on('click', function () {
								$(this).find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>');
								obj.last.pull_more = true;
								obj.last.xhr_offset += obj.limit;
								obj.request('get-records');
							});
					}
					if (more.find('td').text().indexOf('Load') == -1) {
						more.find('td').html('<div>Load '+ obj.limit + ' More...</div>');
					}
				}
			}
			// check for grid end
			if (this.buffered >= this.total - this.offset) $('#grid_'+ this.name +'_rec_more').hide();
			return;

			function markSearch() {
				// mark search
				if(obj.markSearchResults === false) return;
				clearTimeout(obj.last.marker_timer);
				obj.last.marker_timer = setTimeout(function () {
					// mark all search strings
					var str = [];
					for (var s in obj.searchData) {
						var tmp = obj.searchData[s];
						if ($.inArray(tmp.value, str) == -1) str.push(tmp.value);
					}
					if (str.length > 0) $(obj.box).find('.w2ui-grid-data > div').w2marker(str);
				}, 50);
			}
		},

		getRecordHTML: function (ind, lineNum, summary) {
			var rec_html = '';
			// first record needs for resize purposes
			if (ind == -1) {
				rec_html += '<tr line="0">';
				if (this.show.lineNumbers) rec_html  += '<td class="w2ui-col-number" style="height: 0px;"></td>';
				if (this.show.selectColumn) rec_html += '<td class="w2ui-col-select" style="height: 0px;"></td>';
				if (this.show.expandColumn) rec_html += '<td class="w2ui-col-expand" style="height: 0px;"></td>';
				for (var i in this.columns) {
					if (this.columns[i].hidden) continue;
					rec_html += '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px;"></td>';					
				}
				rec_html += '<td class="w2ui-grid-data-last" style="height: 0px;"></td>';
				rec_html += '</tr>';
				return rec_html;
			}
			// regular record
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (summary !== true) {
				if (this.searchData.length > 0 && !url) {
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
			if (!record) return '';
			var id = w2utils.escapeId(record.recid);
			var isRowSelected = false;
			if (record.selected && this.selectType == 'row') isRowSelected = true;
			// render TR
			rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" '+
				' class="'+ (lineNum % 2 == 0 ? 'w2ui-even' : 'w2ui-odd') + (isRowSelected ? ' w2ui-selected' : '') + (record.expanded === true ? ' w2ui-expanded' : '') + '" ' +
				(summary !== true ?
					(this.isIOS ?
						'	onclick  = "w2ui[\''+ this.name +'\'].dblClick(\''+ record.recid +'\', event);"'
						:
						'	onclick	 = "w2ui[\''+ this.name +'\'].click(\''+ record.recid +'\', event);"'
					 ) 
					: ''
				) +
				' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && record['style'] ? record['style'] : '') +'" '+
					(record['style'] ? 'custom_style="'+ record['style'] +'"' : '') +
				'>';
			if (this.show.lineNumbers) {
				rec_html += '<td id="grid_'+ this.name +'_cell_'+ ind +'_number" class="w2ui-col-number">'+
								(summary !== true ? '<div>'+ lineNum +'</div>' : '') +
							'</td>';
			}
			if (this.show.selectColumn) {
				rec_html += 
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_select" class="w2ui-grid-data w2ui-col-select" '+
						'		onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							(summary !== true ?
							'	<div>'+
							'		<input id="grid_'+ this.name +'_cell_'+ ind +'_select_check" class="grid_select_check" type="checkbox" tabIndex="-1"'+
							'			'+ (record.selected ? 'checked="checked"' : '') +
							'			onclick="var obj = w2ui[\''+ this.name +'\']; '+
							'				if (!obj.multiSelect) { obj.selectNone(); }'+
							'				if (this.checked) obj.select(\''+ record.recid + '\'); else obj.unselect(\''+ record.recid + '\'); '+
							'				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'	</div>'
							: 
							'' ) +
						'</td>';
			}
			if (this.show.expandColumn) {
				var tmp_img = '';
				if (record.expanded === true)  tmp_img = '-'; else tmp_img = '+';
				if (record.expanded == 'none') tmp_img = '';
				if (record.expanded == 'spinner') tmp_img = '<div class="w2ui-spinner" style="width: 16px; margin: -2px 2px;"></div>';
				rec_html += 
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_expand" class="w2ui-grid-data w2ui-col-expand">'+
							(summary !== true ?
							'	<div ondblclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;" '+
							'			onclick="w2ui[\''+ this.name +'\'].toggle(\''+ record.recid +'\', event); '+
							'				if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							'		'+ tmp_img +' </div>'
							: 
							'' ) +
						'</td>';
			}
			var col_ind = 0;
			while (true) {
				var col = this.columns[col_ind];
				if (col.hidden) { col_ind++; if (typeof this.columns[col_ind] == 'undefined') break; else continue; }
				var isChanged = record.changed && record.changes[col.field];
				var rec_cell  = this.getCellData(record, ind, col_ind);
				var addStyle  = '';
				if (typeof col.render == 'string') {
					var tmp = col.render.toLowerCase().split(':');
					if ($.inArray(tmp[0], ['number', 'int', 'float', 'money', 'percent']) != -1) addStyle = 'text-align: right';
					if ($.inArray(tmp[0], ['date']) != -1) addStyle = 'text-align: right';
				}
				var isCellSelected = false;
				if (record.selected && $.inArray(col_ind, record.selectedColumns) != -1) isCellSelected = true;
				rec_html += '<td class="w2ui-grid-data'+ (isCellSelected ? ' w2ui-selected' : '') + (isChanged ? ' w2ui-changed' : '') +'" col="'+ col_ind +'" '+
							'	style="'+ addStyle + ';' + (typeof col.style != 'undefined' ? col.style : '') +'" '+
										  (typeof col.attr != 'undefined' ? col.attr : '') +'>'+
								rec_cell +
							'</td>';
				col_ind++;
				if (typeof this.columns[col_ind] == 'undefined') break;
			}
			rec_html += '<td class="w2ui-grid-data-last"></td>';
			rec_html += '</tr>';
			// if row is expanded (buggy)
			// if (record.expanded === true && $('#grid_'+ this.name +'_rec_'+ record.recid +'_expanded_row').length == 0) {
			// 	var tmp = 1 + (this.show.selectColumn ? 1 : 0);
			// 	rec_html += 
			// 		'<tr id="grid_'+ this.name +'_rec_'+ id +'_expanded_row" class="w2ui-expanded-row">'+
			// 			(this.show.lineNumbers ? '<td class="w2ui-col-number"></td>' : '') +
			// 		'	<td class="w2ui-grid-data w2ui-expanded1" colspan="'+ tmp +'"><div style="display: none"></div></td>'+
			// 		'	<td colspan="100" class="w2ui-expanded2">'+
			// 		'		<div id="grid_'+ this.name +'_rec_'+ record.recid +'_expanded" style="opacity: 0"></div>'+
			// 		'	</td>'+
			// 		'</tr>';
			// }
			return rec_html;
		},

		getCellData: function (record, ind, col_ind) {
			var col  = this.columns[col_ind];
			var data = this.parseObj(record, col.field);
			var isChanged = record.changed && record.changes[col.field];
			if (isChanged) data = record.changes[col.field];
			// various renderers
			if (data == null || typeof data == 'undefined') data = '';
			if (typeof col.render != 'undefined') {
				if (typeof col.render == 'function') data = col.render.call(this, record, ind, col_ind);
				if (typeof col.render == 'object')   data = col.render[data];
				if (typeof col.render == 'string') {
					var tmp = col.render.toLowerCase().split(':');
					var prefix = '';
					var suffix = '';
					if ($.inArray(tmp[0], ['number', 'int', 'float', 'money', 'percent']) != -1) {
						if (typeof tmp[1] == 'undefined' || !w2utils.isInt(tmp[1])) tmp[1] = 0;
						if (tmp[1] > 20) tmp[1] = 20;
						if (tmp[1] < 0)  tmp[1] = 0;
						if (tmp[0] == 'money')   { tmp[1] = 2; prefix = w2utils.settings.currencySymbol; }
						if (tmp[0] == 'percent') { suffix = '%'; if (tmp[1] !== '0') tmp[1] = 1; }
						if (tmp[0] == 'int')	 { tmp[1] = 0; }
						// format
						data = '<div>' + prefix + w2utils.formatNumber(Number(data).toFixed(tmp[1])) + suffix + '</div>';
					}
					if (tmp[0] == 'date') {
						if (typeof tmp[1] == 'undefined' || tmp[1] == '') tmp[1] = w2utils.settings.date_display;
						data = '<div>' + prefix + w2utils.formatDate(data, tmp[1]) + suffix + '</div>';
					}
					if (tmp[0] == 'age') {
						data = '<div>' + prefix + w2utils.age(data) + suffix + '</div>';
					}
				}
			} else {
				if (!this.show.recordTitles) {
					var data = '<div>'+ data +'</div>';
				} else {
					// title overwrite
					var title = String(data).replace(/"/g, "''");
					if (typeof col.title != 'undefined') {
						if (typeof col.title == 'function') title = col.title.call(this, record, ind, col_ind);
						if (typeof col.title == 'string')   title = col.title;
					}
					var data = '<div title="'+ title +'">'+ data +'</div>';	
				}
			}
			if (data == null || typeof data == 'undefined') data = '';
			return data;
		},

		getFooterHTML: function () {
			return '<div>'+
				'	<div class="w2ui-footer-left"></div>'+
				'	<div class="w2ui-footer-right">'+ this.buffered +'</div>'+
				'	<div class="w2ui-footer-center"></div>'+
				'</div>';
		},

		status: function (msg) {
			if (typeof msg != 'undefined') {
				$('#grid_'+ this.name +'_footer').find('.w2ui-footer-left').html(msg);
			} else {
				// show number of selected
				var msgLeft = '';
				var sel = this.getSelection();
				if (sel.length > 0) {
					msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' ' + w2utils.lang('selected');
					var tmp = sel[0];
					if (typeof tmp == 'object') tmp = tmp.recid + ', '+ w2utils.lang('Column') +': '+ tmp.column;
					if (sel.length == 1) msgLeft = w2utils.lang('Record ID') + ': '+ tmp + ' ';
				}
				$('#grid_'+ this.name +'_footer .w2ui-footer-left').html(msgLeft);
				// toolbar
				if (sel.length == 1) this.toolbar.enable('edit'); else this.toolbar.disable('edit');
				if (sel.length >= 1) this.toolbar.enable('delete'); else this.toolbar.disable('delete');
			}
		},

		lock: function (msg, showSpinner) {
			var box = $(this.box).find('> div:first-child');
			setTimeout(function () { w2utils.lock(box, msg, showSpinner); }, 10);
		},

		unlock: function () { 
			var box = this.box;
			setTimeout(function () { w2utils.unlock(box); }, 25); // needed timer so if server fast, it will not flash
		},

		parseObj: function (obj, field) {
			var val = '';
			try { // need this to make sure no error in fields
				val = obj;
				var tmp = String(field).split('.');
				for (var i in tmp) {
					val = val[tmp[i]];
				}
			} catch (event) {
				val = '';
			}
			return val;
		}
	}

	$.extend(w2grid.prototype, $.w2event);
	w2obj.grid = w2grid;
})();
