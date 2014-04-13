/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2grid 		- grid widget
*		- $().w2grid	- jQuery wrapper
*	- Dependencies: jQuery, w2utils, w2toolbar, w2fields, w2alert, w2confirm
*
* == NICE TO HAVE ==
*	- frozen columns
*	- add colspans
*	- get rid of this.buffered
*	- allow this.total to be unknown (-1)
*	- column autosize based on largest content
*	- save grid state into localStorage and restore
*	- easy bubbles in the grid
*	- More than 2 layers of header groups
* 	- reorder columns/records
*	- hidden searches could not be clearned by the user
*	- problem with .set() and arrays, array get extended too, but should be replaced
*	- move events into prototype
*	- add grid.focus()
*	- add showExtra, KickIn Infinite scroll when so many records
*	- after edit stay on the same record option
*
* == 1.4 changes
*	- for search fields one should be able to pass w2field options
*	- add enum to advanced search fields
*	- editable fields -> LIST type is not working
*	- search-logic -> searchLogic
* 	- new: refreshRow(recid) - should it be part of refresh?
* 	- new: refreshCell(recid, field) - should it be part of refresh?
*	- removed: getSelection().removeAllRanges() - see https://github.com/vitmalina/w2ui/issues/323
*	- new: reorderColumns
*	- removed name from the POST
*	- rename: markSearchResults -> markSearch
*	- refactored inline editing
*	- new: getCellValue(ind, col_ind, [summary])
* 	- refactored selection
*	- removed: record.selected
*	- new: nextCell, prevCell, nextRow, prevRow
*	- new: editChange(el, index, column, event)
*	- new: method - overwrite default ajax method (see also w2utils.settings.RESTfull)
*	- rename: onSave -> onSubmit, onSaved -> onSave, just like in the form
* 	- new: recid - if id of the data is different from recid
*	- new: parser - to converd data received from the server
*	- change: rec.changes = {} and removed rec.changed
*	- record.style can be a string or an object (for cell formatting)
*	- col.resizable = true by default
*	- new: prepareData();
*	- context menu similar to sidebar's
*	- find will return array or recids not objects
*
************************************************************************/

(function () {
	var w2grid = function(options) {

		// public properties
		this.name				= null;
		this.box				= null; 	// HTML element that hold this element
		this.header				= '';
		this.url				= '';
		this.columns			= []; 		// { field, caption, size, attr, render, hidden, gridMinWidth, [editable: {type, inTag, outTag, style, items}] }
		this.columnGroups		= [];		// { span: int, caption: 'string', master: true/false }
		this.records			= [];		// { recid: int(requied), field1: 'value1', ... fieldN: 'valueN', style: 'string', editable: true/false, summary: true/false, changes: object }
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
		};

		this.autoLoad		= true; 	// for infinite scroll
		this.fixedBody		= true;		// if false; then grid grows with data
		this.recordHeight	= 24;
		this.keyboard 		= true;
		this.selectType		= 'row'; 	// can be row|cell
		this.multiSearch	= true;
		this.multiSelect	= true;
		this.multiSort		= true;
		this.reorderColumns	= false;
		this.reorderRows	= false;
		this.markSearch		= true;

		this.total			= 0;		// server total
		this.buffered		= 0;		// number of records in the records array
		this.limit			= 100;
		this.offset			= 0;		// how many records to skip (for infinite scroll) when pulling from server
		this.style			= '';
		this.ranges 		= [];
		this.menu			= [];
		this.method;					// if defined, then overwrited ajax method
		this.recid;
		this.parser;

		// events
		this.onAdd				= null;
		this.onEdit				= null;
		this.onRequest			= null;		// called on any server event
		this.onLoad				= null;
		this.onDelete			= null;
		this.onDeleted			= null;
		this.onSubmit 			= null;
		this.onSave				= null;
		this.onSelect			= null;
		this.onUnselect 		= null;
		this.onClick 			= null;
		this.onDblClick 		= null;
		this.onContextMenu		= null;
		this.onMenuClick		= null;		// when context menu item selected
		this.onColumnClick		= null;
		this.onColumnResize		= null;
		this.onSort 			= null;
		this.onSearch 			= null;
		this.onChange 			= null;		// called when editable record is changed
		this.onRestore			= null;		// called when editable record is restored
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
			selection 	: {
				indexes : [],
				columns	: {},
			},
			multi		: false,
			scrollTop	: 0,
			scrollLeft	: 0,
			sortData	: null,
			sortCount	: 0,
			xhr			: null,
			range_start : null,
			range_end   : null,
			sel_ind		: null,
			sel_col		: null,
			sel_type	: null,
			edit_col	: null
		};

		this.isIOS = (navigator.userAgent.toLowerCase().indexOf('iphone') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipod') != -1 ||
			navigator.userAgent.toLowerCase().indexOf('ipad') != -1) ? true : false;

		$.extend(true, this, w2obj.grid, options);
	};

	// ====================================================
	// -- Registers as a jQuery plugin

	$.fn.w2grid = function(method) {
		if (typeof method === 'object' || !method ) {
			// check name parameter
			if (!w2utils.checkName(method, 'w2grid')) return;
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
			if ($(this).length !== 0) {
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
		// ----
		// properties that need to be in prototype

		msgDelete	: 'Are you sure you want to delete selected records?',
		msgNotJSON 	: 'Returned data is not in valid JSON format.',
		msgAJAXerror: 'AJAX error. See console for more details.',
		msgRefresh	: 'Refreshing...',

		// for easy button overwrite
		buttons: {
			'reload'	: { type: 'button', id: 'w2ui-reload', img: 'icon-reload', hint: 'Reload data in the list' },
			'columns'	: { type: 'drop', id: 'w2ui-column-on-off', img: 'icon-columns', hint: 'Show/hide columns', arrow: false, html: '' },
			'search'	: { type: 'html',   id: 'w2ui-search',
							html: '<div class="w2ui-icon icon-search-down w2ui-search-down" title="'+ 'Select Search Field' +'" '+
								  'onclick="var obj = w2ui[$(this).parents(\'div.w2ui-grid\').attr(\'name\')]; obj.searchShowFields();"></div>'
						  },
			'search-go'	: { type: 'check',  id: 'w2ui-search-advanced', caption: 'Search...', hint: 'Open Search Fields' },
			'add'		: { type: 'button', id: 'w2ui-add', caption: 'Add New', hint: 'Add new record', img: 'icon-add' },
			'edit'		: { type: 'button', id: 'w2ui-edit', caption: 'Edit', hint: 'Edit selected record', img: 'icon-edit', disabled: true },
			'delete'	: { type: 'button', id: 'w2ui-delete', caption: 'Delete', hint: 'Delete selected records', img: 'icon-delete', disabled: true },
			'save'		: { type: 'button', id: 'w2ui-save', caption: 'Save', hint: 'Save changed records', img: 'icon-save' }
		},

		add: function (record) {
			if (!$.isArray(record)) record = [record];
			var added = 0;
			for (var o in record) {
				if (!this.recid && typeof record[o].recid == 'undefined') record[o].recid = record[o][this.recid];
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
				this.total = this.records.length;
				this.localSort();
				this.localSearch();
			}
			this.refresh(); // ??  should it be reload?
			return added;
		},

		find: function (obj, returnIndex) {
			if (typeof obj == 'undefined' || obj == null) obj = {};
			var recs	= [];
			var hasDots	= false;
			// check if property is nested - needed for speed
			for (var o in obj) if (String(o).indexOf('.') != -1) hasDots = true;
			// look for an item
			for (var i = 0; i < this.records.length; i++) {
				var match = true;
				for (var o in obj) {
					var val = this.records[i][o];
					if (hasDots && String(o).indexOf('.') != -1) val = this.parseField(this.records[i], o);
					if (obj[o] != val) match = false;
				}
				if (match && returnIndex !== true) recs.push(this.records[i].recid);
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
			} else { // find record to update
				var ind = this.get(recid, true);
				if (ind == null) return false;
				$.extend(true, this.records[ind], record);
				if (noRefresh !== true) this.refreshRow(recid); // refresh only that record
			}
			return true;
		},

		get: function (recid, returnIndex) {
			for (var i = 0; i < this.records.length; i++) {
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

		addColumn: function (before, columns) {
			var added = 0;
			if (arguments.length == 1) {
				columns = before;
				before  = this.columns.length;
			} else {
				if (typeof before == 'string') before = this.getColumn(before, true);
				if (before === null) before = this.columns.length;
			}
			if (!$.isArray(columns)) columns = [columns];
			for (var o in columns) {
				this.columns.splice(before, 0, columns[o]);
				before++;
				added++;
			}
			this.initColumnOnOff();
			this.refresh();
			return added;
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
			for (var i = 0; i < this.columns.length; i++) {
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
			var added = 0;
			if (arguments.length == 1) {
				search = before;
				before = this.searches.length;
			} else {
				if (typeof before == 'string') before = this.getSearch(before, true);
				if (before === null) before = this.searches.length;
			}
			if (!$.isArray(search)) search = [search];
			for (var o in search) {
				this.searches.splice(before, 0, search[o]);
				before++;
				added++;
			}
			this.searchClose();
			return added;
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
			for (var i = 0; i < this.searches.length; i++) {
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

		localSort: function (silent) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				console.log('ERROR: grid.localSort can only be used on local data source, grid.url should be empty.');
				return;
			}
			if ($.isEmptyObject(this.sortData)) return;
			var time = (new Date()).getTime();
			var obj = this;
			// process date fields
			obj.prepareData();
			// process sortData
			for (var s in this.sortData) {
				var column = this.getColumn(this.sortData[s].field); 
				if (!column) return;
				if (column.render && ['date', 'age'].indexOf(column.render) != -1) {
					this.sortData[s]['field_'] = column.field + '_';
				}
				if (column.render && ['time'].indexOf(column.render) != -1) {
					this.sortData[s]['field_'] = column.field + '_';
				}
			}
			// process sort
			this.records.sort(function (a, b) {
				var ret = 0;
				for (var s in obj.sortData) {
					var fld = obj.sortData[s].field;
					if (obj.sortData[s].field_) fld = obj.sortData[s].field_;
					var aa  = a[fld];
					var bb  = b[fld];
					if (String(fld).indexOf('.') != -1) {
						aa = obj.parseField(a, fld);
						bb = obj.parseField(b, fld);
					}
					if (typeof aa == 'string') aa = $.trim(aa.toLowerCase());
					if (typeof bb == 'string') bb = $.trim(bb.toLowerCase());
					if (aa > bb) ret = (obj.sortData[s].direction == 'asc' ? 1 : -1);
					if (aa < bb) ret = (obj.sortData[s].direction == 'asc' ? -1 : 1);
					if (typeof aa != 'object' && typeof bb == 'object') ret = -1;
					if (typeof bb != 'object' && typeof aa == 'object') ret = 1;
					if (aa == null && bb != null) ret = 1;	// all nuls and undefined on bottom
					if (aa != null && bb == null) ret = -1;
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
			// prepare date/time fields
			this.prepareData();
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
						var val1 = String(obj.parseField(rec, search.field)).toLowerCase();
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
									var val1 = w2utils.formatDate(rec[search.field + '_'], 'yyyy-mm-dd');
									var val2 = w2utils.formatDate(val2, 'yyyy-mm-dd');
									if (val1 == val2) fl++;
								}
								if (search.type == 'time') {
									var val1 = w2utils.formatTime(rec[search.field + '_'], 'h24:mi');
									var val2 = w2utils.formatTime(val2, 'h24:mi');
									if (val1 == val2) fl++;
								}
								break;
							case 'between':
								if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
									if (parseFloat(rec[search.field]) >= parseFloat(val2) && parseFloat(rec[search.field]) <= parseFloat(val3)) fl++;
								}
								if (search.type == 'date') {
									var val1 = rec[search.field + '_'];
									var val2 = w2utils.isDate(val2, w2utils.settings.date_format, true);
									var val3 = w2utils.isDate(val3, w2utils.settings.date_format, true);
									if (val3 != null) val3 = new Date(val3.getTime() + 86400000); // 1 day
									if (val1 >= val2 && val1 < val3) fl++;
								}
								if (search.type == 'time') {
									var val1 = rec[search.field + '_'];
									var val2 = w2utils.isTime(val2, true);
									var val3 = w2utils.isTime(val3, true);
									val2 = (new Date()).setHours(val2.hours, val2.minutes, val2.seconds ? val2.seconds : 0, 0);
									val3 = (new Date()).setHours(val3.hours, val3.minutes, val3.seconds ? val3.seconds : 0, 0);
									if (val1 >= val2 && val1 < val3) fl++;
								}
								break;
							case 'in':
								if (sdata.svalue) {
									if (sdata.svalue.indexOf(val1) !== -1) fl++;
								} else {
									if (sdata.value.indexOf(val1) !== -1) fl++;
								}
								break;
							case 'begins':
								if (val1.indexOf(val2) == 0) fl++; // do not hide record
								break;
							case 'contains':
								if (val1.indexOf(val2) >= 0) fl++; // do not hide record
								break;
							case 'ends':
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

		getRangeData: function (range, extra) {
			var rec1 = this.get(range[0].recid, true);
			var rec2 = this.get(range[1].recid, true);
			var col1 = range[0].column;
			var col2 = range[1].column;

			var res = [];
			if (col1 == col2) { // one row
				for (var r = rec1; r <= rec2; r++) {
					var record = this.records[r];
					var dt = record[this.columns[col1].field] || null;
					if (extra !== true) {
						res.push(dt);
					} else {
						res.push({ data: dt, column: col1, index: r, record: record });
					}
				}
			} else if (rec1 == rec2) { // one line
				var record = this.records[rec1];
				for (var i = col1; i <= col2; i++) {
					var dt = record[this.columns[i].field] || null;
					if (extra !== true) {
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
						if (extra !== true) {
							res[res.length-1].push(dt);
						} else {
							res[res.length-1].push({ data: dt, column: i, index: r, record: record });
						}
					}
				}
			}
			return res;
		},

		addRange: function (ranges) {
			var added = 0;
			if (this.selectType == 'row') return added;
			if (!$.isArray(ranges)) ranges = [ranges];
			// if it is selection
			for (var r in ranges) {
				if (typeof ranges[r] != 'object') ranges[r] = { name: 'selection' };
				if (ranges[r].name == 'selection') {
					if (this.show.selectionBorder === false) continue;
					var sel = this.getSelection();
					if (sel.length == 0) {
						this.removeRange(ranges[r].name);
						continue;
					} else {
						var first = sel[0];
						var last  = sel[sel.length-1];
						var td1   = $('#grid_'+ this.name +'_rec_'+ first.recid + ' td[col='+ first.column +']');
						var td2   = $('#grid_'+ this.name +'_rec_'+ last.recid + ' td[col='+ last.column +']');
					}
				} else { // other range
					var first = ranges[r].range[0];
					var last  = ranges[r].range[1];
					var td1   = $('#grid_'+ this.name +'_rec_'+ first.recid + ' td[col='+ first.column +']');
					var td2   = $('#grid_'+ this.name +'_rec_'+ last.recid + ' td[col='+ last.column +']');
				}
				if (first) {
					var rg = {
						name: ranges[r].name,
						range: [{ recid: first.recid, column: first.column }, { recid: last.recid, column: last.column }],
						style: ranges[r].style || ''
					};
					// add range
					var ind = false;
					for (var t in this.ranges) if (this.ranges[t].name == ranges[r].name) { ind = r; break; }
					if (ind !== false) {
						this.ranges[ind] = rg;
					} else {
						this.ranges.push(rg);
					}
					added++
				}
			}
			this.refreshRanges();
			return added;
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
				} else {
					$('#grid_'+ this.name +'_'+ rg.name).attr('style', rg.style);
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
					obj.addRange({
						name	: 'grid-selection-expand',
						range	: eventData.newRange,
						style	: 'background-color: rgba(100,100,100,0.1); border: 2px dotted rgba(100,100,100,0.5);'
					});
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
			var sel	= this.last.selection;
			if (!this.multiSelect) this.selectNone();
			for (var a = 0; a < arguments.length; a++) {
				var recid	= typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
				var record	= this.get(recid);
				if (record == null) continue;
				var index	= this.get(recid, true);
				var recEl 	= $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
				if (this.selectType == 'row') {
					if (sel.indexes.indexOf(index) >= 0) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: recid, index: index });
					if (eventData.isCancelled === true) continue;
					// default action
					sel.indexes.push(index);
					sel.indexes.sort(function(a, b) { return a-b });
					recEl.addClass('w2ui-selected').data('selected', 'yes');
					recEl.find('.w2ui-grid-select-check').prop("checked", true);
					selected++;
				} else {
					var col  = arguments[a].column;
					if (!w2utils.isInt(col)) { // select all columns
						var cols = [];
						for (var c in this.columns) { if (this.columns[c].hidden) continue; cols.push({ recid: recid, column: parseInt(c) }); }
						if (!this.multiSelect) cols = cols.splice(0, 1);
						return this.select.apply(this, cols);
					}
					var s = sel.columns[index] || [];
					if ($.isArray(s) && s.indexOf(col) != -1) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, recid: recid, index: index, column: col });
					if (eventData.isCancelled === true) continue;
					// default action
					if (sel.indexes.indexOf(index) == -1) {
						sel.indexes.push(index);
						sel.indexes.sort(function(a, b) { return a-b });
					}
					s.push(col);
					s.sort(function(a, b) { return a-b }); // sort function must be for numerical sort
					recEl.find(' > td[col='+ col +']').addClass('w2ui-selected');
					selected++;
					recEl.data('selected', 'yes');
					recEl.find('.w2ui-grid-select-check').prop("checked", true);
					// save back to selection object
					sel.columns[index] = s;
				}
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
			// all selected?
			if (sel.indexes.length == this.records.length || (this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop('checked', false);
			}
			this.status();
			this.addRange('selection');
			return selected;
		},

		unselect: function () {
			var unselected = 0;
			var sel = this.last.selection;
			for (var a = 0; a < arguments.length; a++) {
				var recid	= typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
				var record	= this.get(recid);
				if (record == null) continue;
				var index	= this.get(record.recid, true);
				var recEl 	= $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
				if (this.selectType == 'row') {
					if (sel.indexes.indexOf(index) == -1) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: recid, index: index });
					if (eventData.isCancelled === true) continue;
					// default action
					sel.indexes.splice(sel.indexes.indexOf(index), 1);
					recEl.removeClass('w2ui-selected').removeData('selected');
					if (recEl.length != 0) recEl[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + recEl.attr('custom_style');
					recEl.find('.w2ui-grid-select-check').prop("checked", false);
					unselected++;
				} else {
					var col  = arguments[a].column;
					if (!w2utils.isInt(col)) { // unselect all columns
						var cols = [];
						for (var c in this.columns) { if (this.columns[c].hidden) continue; cols.push({ recid: recid, column: parseInt(c) }); }
						return this.unselect.apply(this, cols);
					}
					var s = sel.columns[index];
					if (!$.isArray(s) || s.indexOf(col) == -1) continue;
					// event before
					var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: recid, column: col });
					if (eventData.isCancelled === true) continue;
					// default action
					s.splice(s.indexOf(col), 1);
					$('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid) + ' > td[col='+ col +']').removeClass('w2ui-selected');
					unselected++;
					if (s.length == 0) {
						delete sel.columns[index];
						sel.indexes.splice(sel.indexes.indexOf(index), 1);
						recEl.removeData('selected');
						recEl.find('.w2ui-grid-select-check').prop("checked", false);
					}
				}
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
			// all selected?
			if (sel.indexes.length == this.records.length || (this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop('checked', false);
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
			var url	 = (typeof this.url != 'object' ? this.url : this.url.get);
			var sel  = this.last.selection;
			var cols = [];
			for (var c in this.columns) cols.push(parseInt(c));
			// if local data source and searched
			sel.indexes = [];
			if (!url && this.searchData.length !== 0) {
				// local search applied
				for (var i = 0; i < this.last.searchIds.length; i++) {
					sel.indexes.push(this.last.searchIds[i]);
					if (this.selectType != 'row') sel.columns[this.last.searchIds[i]] = cols.slice(); // .slice makes copy of the array
				}
			} else {
				for (var i = 0; i < this.records.length; i++) {
					sel.indexes.push(i);
					if (this.selectType != 'row') sel.columns[i] = cols.slice(); // .slice makes copy of the array
				}
			}
			this.refresh();
			// enable/disable toolbar buttons
			var sel = this.getSelection();
			if (sel.length == 1) this.toolbar.enable('w2ui-edit'); else this.toolbar.disable('w2ui-edit');
			if (sel.length >= 1) this.toolbar.enable('w2ui-delete'); else this.toolbar.disable('w2ui-delete');
			this.addRange('selection');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		selectNone: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, all: true });
			if (eventData.isCancelled === true) return;
			// default action
			var sel = this.last.selection;
			for (var s in sel.indexes) {
				var index = sel.indexes[s];
				var rec   = this.records[index];
				var recid = rec ? rec.recid : null;
				var recEl = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
				recEl.removeClass('w2ui-selected').removeData('selected');
				recEl.find('.w2ui-grid-select-check').prop("checked", false);
				// for not rows
				if (this.selectType != 'row') {
					var cols = sel.columns[index];
					for (var c in cols) recEl.find(' > td[col='+ cols[c] +']').removeClass('w2ui-selected');
				}
			}
			sel.indexes = [];
			sel.columns = {};
			this.toolbar.disable('w2ui-edit', 'w2ui-delete');
			this.removeRange('selection');
			$('#grid_'+ this.name +'_check_all').prop('checked', false);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getSelection: function (returnIndex) {
			var ret = [];
			var sel = this.last.selection;
			if (this.selectType == 'row') {
				for (var s in sel.indexes) {
					if (!this.records[sel.indexes[s]]) continue;
					if (returnIndex === true) ret.push(sel.indexes[s]); else ret.push(this.records[sel.indexes[s]].recid);
				}
				return ret;
			} else {
				for (var s in sel.indexes) {
					var cols = sel.columns[sel.indexes[s]];
					if (!this.records[sel.indexes[s]]) continue;
					for (var c in cols) {
						ret.push({ recid: this.records[sel.indexes[s]].recid, index: parseInt(sel.indexes[s]), column: cols[c] });
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
					var field1	 = $('#grid_'+ this.name + '_field_'+s);
					var field2	 = $('#grid_'+ this.name + '_field2_'+s);
					var value1   = field1.val();
					var value2   = field2.val();
					var svalue   = null;
					if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
						var fld1 = field1.data('w2field');
						var fld2 = field2.data('w2field');
						if (fld1) value1 = fld1.clean(value1);
						if (fld2) value2 = fld2.clean(value2);
					}
					if (['list', 'enum'].indexOf(search.type) != -1) {
						value1 = field1.data('selected');
						if ($.isArray(value1)) {
							svalue = [];
							for (var v in value1) {
								svalue.push(w2utils.isFloat(value1[v].id) ? parseFloat(value1[v].id) : String(value1[v].id).toLowerCase());
								delete value1[v].hidden;
							}
						} else {
							value1 = value1.id;
						}
					}
					if ((value1 != '' && value1 != null) || (typeof value2 != 'undefined' && value2 != '')) {
						var tmp = {
							field	 : search.field,
							type	 : search.type,
							operator : operator
						}
						if (operator == 'between') {
							$.extend(tmp, { value: [value1, value2] });
						} else if (operator == 'in' && typeof value1 == 'string') {
							$.extend(tmp, { value: value1.split(',') });
						} else {
							$.extend(tmp, { value: value1 });
						}
						if (svalue) $.extend(tmp, { svalue: svalue });
						// conver date to unix time
						try {
							if (search.type == 'date' && operator == 'between') {
								tmp.value[0] = value1; // w2utils.isDate(value1, w2utils.settings.date_format, true).getTime();
								tmp.value[1] = value2; // w2utils.isDate(value2, w2utils.settings.date_format, true).getTime();
							}
							if (search.type == 'date' && operator == 'is') {
								tmp.value = value1; // w2utils.isDate(value1, w2utils.settings.date_format, true).getTime();
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
								if (search.type == 'text' || (search.type == 'alphanumeric' && w2utils.isAlphaNumeric(value))
										|| (search.type == 'int' && w2utils.isInt(value)) || (search.type == 'float' && w2utils.isFloat(value))
										|| (search.type == 'percent' && w2utils.isFloat(value)) || (search.type == 'hex' && w2utils.isHex(value))
										|| (search.type == 'currency' && w2utils.isMoney(value)) || (search.type == 'money' && w2utils.isMoney(value))
										|| (search.type == 'date' && w2utils.isDate(value)) ) {
									var tmp = {
										field	 : search.field,
										type	 : search.type,
										operator : (search.type == 'text' ? 'contains' : 'is'),
										value	 : value
									};
									searchData.push(tmp);
								}
								// range in global search box
								if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1 && String(value).indexOf('-') != -1) {
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
						var el = $('#grid_'+ this.name +'_search_all');
						var search = this.getSearch(field);
						if (search == null) search = { field: field, type: 'text' };
						if (search.field == field) this.last.caption = search.caption;
						if (search.type == 'list') {
							var tmp = el.data('selected');
							if (tmp && !$.isEmptyObject(tmp)) value = tmp.id;
						}
						if (value != '') {
							var op  = 'contains';
							var val = value;
							if (w2utils.isInt(value)) op = 'is';
							if (['date', 'time'].indexOf(search.type) != -1) op = 'is';
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
			this.last.scrollTop			= 0;
			this.last.scrollLeft		= 0;
			this.last.selection.indexes	= [];
			this.last.selection.columns	= {};
			// -- clear all search field
			this.searchClose();
			this.set({ expanded: false }, true);
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
			$('#tb_'+ this.name +'_toolbar_item_w2ui-search-advanced').w2overlay(
				this.getSearchesHTML(),	{
					name	: 'searches-'+ this.name,
					left	: -10,
					'class'	: 'w2ui-grid-searches',
					onShow	: function () {
						if (obj.last.logic == 'OR') obj.searchData = [];
						obj.initSearches();
						$('#w2ui-overlay-searches-'+ this.name +' .w2ui-grid-searches').data('grid-name', obj.name);
						var sfields = $('#w2ui-overlay-searches-'+ this.name +' .w2ui-grid-searches *[rel=search]');
						if (sfields.length > 0) sfields[0].focus();
					}
				}
			);
		},

		searchClose: function () {
			if (!this.box) return;
			if (this.searches.length == 0) return;
			if (this.toolbar) this.toolbar.uncheck('w2ui-search-advanced')
			// hide search
			if ($('#w2ui-overlay-searches-'+ this.name +' .w2ui-grid-searches').length > 0) {
				$().w2overlay('', { name: 'searches-'+ this.name });
			}
		},

		searchShowFields: function () {
			var el	 = $('#grid_'+ this.name +'_search_all');
			var html = '<div class="w2ui-select-field"><table>';
			for (var s = -1; s < this.searches.length; s++) {
				var search = this.searches[s];
				if (s == -1) {
					if (!this.multiSearch) continue;
					search = { field: 'all', caption: w2utils.lang('All Fields') };
				} else {
					if (this.searches[s].hidden === true) continue;
				}
				html += '<tr '+ (this.isIOS ? 'onTouchStart' : 'onClick') +'="w2ui[\''+ this.name +'\'].initAllField(\''+ search.field +'\')">'+
						'	<td><input type="checkbox" tabIndex="-1" '+ (search.field == this.last.field ? 'checked' : 'disabled') +'></td>'+
						'	<td>'+ search.caption +'</td>'+
						'</tr>';
			}
			html += "</table></div>";
			// need timer otherwise does nto show with list type
			setTimeout(function () {
				$(el).w2overlay(html, { left: -10 });
			}, 1);
		},

		initAllField: function (field) {
			var el 		= $('#grid_'+ this.name +'_search_all');
			var search	= this.getSearch(field);
			if (field == 'all') {
				search = { field: 'all', caption: w2utils.lang('All Fields') };
				el.w2field('clear');
				el.change().focus();
			} else {
				var st = search.type;
				if (['enum', 'select'].indexOf(st) != -1) st = 'list';
				el.w2field(st, $.extend({}, search.options, { suffix: '' })); // always hide suffix
				if (['list', 'enum'].indexOf(search.type) != -1) {
					this.last.search = '';
					this.last.item	 = '';
					el.val('');
				}
				// set focus
				setTimeout(function () { el.change().focus(); }, 1);
			}
			// update field
			if (this.last.search != '') {
				this.search(search.field, this.last.search);
			} else {
				this.last.field = search.field;
				this.last.caption = search.caption;
			}
			el.attr('placeholder', search.caption);
			$().w2overlay();
		},

		searchReset: function (noRefresh) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: [] });
			if (eventData.isCancelled === true) return;
			// default action
			this.searchData  	= [];
			this.last.search 	= '';
			this.last.logic		= 'OR';
			// --- do not reset to All Fields (I think)
			// if (this.last.multi) {
			// 	if (!this.multiSearch) {
			// 		this.last.field 	= this.searches[0].field;
			// 		this.last.caption 	= this.searches[0].caption;
			// 	} else {
			// 		this.last.field  	= 'all';
			// 		this.last.caption 	= w2utils.lang('All Fields');
			// 	}
			// }
			this.last.multi				= false;
			this.last.xhr_offset 		= 0;
			// reset scrolling position
			this.last.scrollTop			= 0;
			this.last.scrollLeft		= 0;
			this.last.selection.indexes	= [];
			this.last.selection.columns	= {};
			// -- clear all search field
			this.searchClose();
			$('#grid_'+ this.name +'_search_all').val('');
			// apply search
			if (!noRefresh) this.reload();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		clear: function (noRefresh) {
			this.offset 			= 0;
			this.total 				= 0;
			this.buffered			= 0;
			this.records			= [];
			this.summary			= [];
			this.last.scrollTop		= 0;
			this.last.scrollLeft	= 0;
			this.last.range_start	= null;
			this.last.range_end		= null;
			this.last.xhr_offset	= 0;
			if (!noRefresh) this.refresh();
		},

		reset: function (noRefresh) {
			// reset last remembered state
			this.offset					= 0;
			this.last.scrollTop			= 0;
			this.last.scrollLeft		= 0;
			this.last.selection.indexes	= [];
			this.last.selection.columns	= {};
			this.last.range_start		= null;
			this.last.range_end			= null;
			this.last.xhr_offset		= 0;
			this.searchReset(noRefresh);
			// initial sort
			if (this.last.sortData != null ) this.sortData	 = this.last.sortData;
			// select none without refresh
			this.set({ expanded: false }, true);
			// refresh
			if (!noRefresh) this.refresh();
		},

		skip: function (offset) {
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (url) {
				this.offset = parseInt(offset);
				if (this.offset < 0 || !w2utils.isInt(this.offset)) this.offset = 0;
				if (this.offset > this.total) this.offset = this.total - this.limit;
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
				this.clear(true);
				this.request('get-records', {}, null, callBack);
			} else {
				this.last.scrollTop		= 0;
				this.last.scrollLeft	= 0;
				this.last.range_start	= null;
				this.last.range_end		= null;
				this.localSearch();
				this.refresh();
				if (typeof callBack == 'function') callBack({ status: 'success' });
			}
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
			params['selected']		= this.getSelection();
			params['limit']  		= this.limit;
			params['offset'] 		= parseInt(this.offset) + this.last.xhr_offset;
			params['search']  		= this.searchData;
			params['searchLogic'] 	= this.last.logic;
			params['sort'] 	  		= (this.sortData.length != 0 ? this.sortData : '');
			// append other params
			$.extend(params, this.postData);
			$.extend(params, add_params);
			// event before
			if (cmd == 'get-records') {
				var eventData = this.trigger({ phase: 'before', type: 'request', target: this.name, url: url, postData: params });
				if (eventData.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return; }
			} else {
				var eventData = { url: url, postData: params };
			}
			// call server to get data
			var obj = this;
			if (this.last.xhr_offset == 0) {
				this.lock(this.msgRefresh, true);
			} else {
				var more = $('#grid_'+ this.name +'_rec_more');
				if (this.autoLoad === true) {
					more.show().find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>');
				} else {
					more.find('td').html('<div>'+ w2utils.lang('Load') + ' ' + obj.limit + ' ' + w2utils.lang('More') + '...</div>');
				}
			}
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
			if (this.method) xhr_type = this.method;
			this.last.xhr_cmd	 = params.cmd;
			this.last.xhr_start  = (new Date()).getTime();
			this.last.xhr = $.ajax({
				type		: xhr_type,
				url			: url,
				data		: (typeof eventData.postData == 'object' ? String($.param(eventData.postData, false)).replace(/%5B/g, '[').replace(/%5D/g, ']') : eventData.postData),
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
			if (this.last.xhr_cmd == 'save-records') event_name   = 'save';
			if (this.last.xhr_cmd == 'delete-records') event_name = 'deleted';
			var eventData = this.trigger({ phase: 'before', target: this.name, type: event_name, xhr: this.last.xhr, status: status });
			if (eventData.isCancelled === true) {
				if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' });
				return;
			}
			// parse server response
			var data;
			var responseText = this.last.xhr.responseText;
			if (status != 'error') {
				// default action
				if (typeof responseText != 'undefined' && responseText != '') {
					// check if the onLoad handler has not already parsed the data
					if (typeof responseText == "object") {
						data = responseText;
					} else {
						if (typeof obj.parser == 'function') {
							data = obj.parser(responseText);
							if (typeof data != 'object') {
								console.log('ERROR: Your parser did not return proper object');
							}
						} else {
							// $.parseJSON or $.getJSON did not work because those expect perfect JSON data - where everything is in double quotes
							//
							// TODO: avoid (potentially malicious) code injection from the response.
							try { eval('data = '+ responseText); } catch (e) { }
						}
					}
					// convert recids
					if (obj.recid) {
						for (var r in data.records) {
							data.records[r]['recid'] = data.records[r][obj.recid];
						}
					}
					if (typeof data == 'undefined') {
						data = {
							status		 : 'error',
							message		 : this.msgNotJSON,
							responseText : responseText
						};
					}
					if (data['status'] == 'error') {
						obj.error(data['message']);
					} else {
						if (cmd == 'get-records') {
							if (this.last.xhr_offset == 0) {
								this.records = [];
								this.summary = [];
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
							this.reset(); // unselect old selections
							this.reload();
							return;
						}
					}
				}
			} else {
				data = {
					status		 : 'error',
					message		 : this.msgAJAXerror,
					responseText : responseText
				};
				obj.error(this.msgAJAXerror);
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
			if (typeof callBack == 'function') callBack(data);
		},

		error: function (msg) {
			var obj = this;
			// let the management of the error outside of the grid
			var eventData = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr });
			if (eventData.isCancelled === true) {
				if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' });
				return;
			}
			w2alert(msg, 'Error');
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		getChanges: function () {
			var changes = [];
			for (var r in this.records) {
				var rec = this.records[r];
				if (typeof rec['changes'] != 'undefined') {
					changes.push($.extend(true, { recid: rec.recid }, rec.changes));
				}
			}
			return changes;
		},

		mergeChanges: function () {
			var changes = this.getChanges();
			for (var c in changes) {
				var record = this.get(changes[c].recid);
				for (var s in changes[c]) {
					if (s == 'recid') continue; // do not allow to change recid
					try { eval('record.' + s + ' = changes[c][s]'); } catch (e) {}
					delete record.changes;
				}
			}
			this.refresh();
		},

		// ===================================================
		// --  Action Handlers

		save: function () {
			var obj = this;
			var changes = this.getChanges();
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'submit', changes: changes });
			if (eventData.isCancelled === true) return;
			var url = (typeof this.url != 'object' ? this.url : this.url.save);
			if (url) {
				this.request('save-records', { 'changes' : eventData.changes }, null,
					function (data) {
						if (data.status !== 'error') {
							// only merge changes, if save was successful
							obj.mergeChanges();
						}
						// event after
						obj.trigger($.extend(eventData, { phase: 'after' }));
					}
				);
			} else {
				this.mergeChanges();
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
			}
		},

		editField: function (recid, column, value, event) {
			var obj   = this;
			var index = obj.get(recid, true);
			var rec   = obj.records[index];
			var col   = obj.columns[column];
			var edit  = col ? col.editable : null;
			if (!rec || !col || !edit || rec.editable === false) return;
			if (['enum', 'file'].indexOf(edit.type) != -1) {
				console.log('ERROR: input types "enum" and "file" are not supported in inline editing.');
				return;
			}
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'editField', target: obj.name, recid: recid, column: column, value: value,
				index: index, originalEvent: event });
			if (eventData.isCancelled === true) return;
			value = eventData.value;
			// default behaviour
			this.selectNone();
			this.select({ recid: recid, column: column });
			this.last.edit_col = column;
			if (['checkbox', 'check'].indexOf(edit.type) != -1) return;
			// create input element
			var tr = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(recid));
			var el = tr.find('[col='+ column +'] > div');
			if (typeof edit.inTag   == 'undefined') edit.inTag   = '';
			if (typeof edit.outTag  == 'undefined') edit.outTag  = '';
			if (typeof edit.style   == 'undefined') edit.style   = '';
			if (typeof edit.items   == 'undefined') edit.items   = [];
			var val = (rec.changes && typeof rec.changes[col.field] != 'undefined' ? w2utils.stripTags(rec.changes[col.field]) : w2utils.stripTags(rec[col.field]));
			if (val == null || typeof val == 'undefined') val = '';
			if (typeof value != 'undefined' && value != null) val = value;
			var addStyle = (typeof col.style != 'undefined' ? col.style + ';' : '');
			if (typeof col.render == 'string' && ['number', 'int', 'float', 'money', 'percent'].indexOf(col.render.split(':')[0]) != -1) {
				addStyle += 'text-align: right;';
			}
			if (edit.type == 'select') {
				var html = '';
				for (var i in edit.items) {
					html += '<option value="'+ edit.items[i].id +'" '+ (edit.items[i].id == val ? 'selected' : '') +'>'+ edit.items[i].text +'</option>';
				}
				el.addClass('w2ui-editable')
					.html('<select id="grid_'+ obj.name +'_edit_'+ recid +'_'+ column +'" column="'+ column +'" '+
						'	style="width: 100%; '+ addStyle + edit.style +'" field="'+ col.field +'" recid="'+ recid +'" '+
						'	'+ edit.inTag +
						'>'+ html +'</select>' + edit.outTag);
				el.find('select').focus()
					.on('change', function (event) {
						delete obj.last.move;
					})
					.on('blur', function (event) {
						obj.editChange.call(obj, this, index, column, event);
					});
			} else {
				el.addClass('w2ui-editable')
					.html('<input id="grid_'+ obj.name +'_edit_'+ recid +'_'+ column +'" '+
						'	type="text" style="outline: none; '+ addStyle + edit.style +'" field="'+ col.field +'" recid="'+ recid +'" '+
						'	column="'+ column +'" '+ edit.inTag +
						'>' + edit.outTag);
				if (value == null) el.find('input').val(val != 'object' ? val : '');
				// init w2field
				var input = el.find('input').get(0);
				$(input).w2field(edit.type, $.extend(edit, { selected: val }))
				// add blur listener
				setTimeout(function () {
					var tmp = input;
					if (edit.type == 'list') {
						tmp = $($(input).data('w2field').helpers.focus).find('input');
						if (val != 'object' && val != '') tmp.val(val).css({ opacity: 1 }).prev().css({ opacity: 1 });
					}
					$(tmp).on('blur', function (event) {
						obj.editChange.call(obj, input, index, column, event);
					});
				}, 10);
				if (value != null) $(input).val(val != 'object' ? val : '');
			}
			setTimeout(function () {
				el.find('input, select')
					.on('click', function (event) {
						event.stopPropagation();
					})
					.on('keydown', function (event) {
						var cancel = false;
						switch (event.keyCode) {
							case 9:  // tab
								cancel = true;
								var next_rec = recid;
								var next_col = event.shiftKey ? obj.prevCell(column, true) : obj.nextCell(column, true);
								// next or prev row
								if (next_col === false) {
									var tmp = event.shiftKey ? obj.prevRow(index) : obj.nextRow(index);
									if (tmp != null && tmp != index) {
										next_rec = obj.records[tmp].recid;
										// find first editable row
										for (var c in obj.columns) {
											var tmp = obj.columns[c].editable;
											if (typeof tmp != 'undefined' && ['checkbox', 'check'].indexOf(tmp.type) == -1) {
												next_col = parseInt(c);
												if (!event.shiftKey) break;
											}
										}
									}

								}
								if (next_rec === false) next_rec = recid;
								if (next_col === false) next_col = column;
								// init new or same record
								this.blur();
								setTimeout(function () {
									if (obj.selectType != 'row') {
										obj.selectNone();
										obj.select({ recid: next_rec, column: next_col });
									} else {
										obj.editField(next_rec, next_col, null, event);
									}
								}, 1);
								break;

							case 13: // enter
								this.blur();
								var next = event.shiftKey ? obj.prevRow(index) : obj.nextRow(index);
								if (next != null && next != index) {
									setTimeout(function () {
										if (obj.selectType != 'row') {
											obj.selectNone();
											obj.select({ recid: obj.records[next].recid, column: column });
										} else {
											obj.editField(obj.records[next].recid, column, null, event);
										}
									}, 100);
								}
								break;

							case 38: // up arrow
								if (!event.shiftKey) break;
								cancel = true;
								var next = obj.prevRow(index);
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
								if (!event.shiftKey) break;
								cancel = true;
								var next = obj.nextRow(index);
								if (next != null && next != index) {
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
								var old = obj.parseField(rec, col.field);
								if (rec.changes && typeof rec.changes[col.field] != 'undefined') old = rec.changes[col.field];
								this.value = typeof old != 'undefined' ? old : '';
								this.blur();
								setTimeout(function () { obj.select({ recid: recid, column: column }) }, 1);
								break;
						}
						if (cancel) if (event.preventDefault) event.preventDefault();
					});
				// focus and select
				var tmp = el.find('input').focus();
				if (value != null) {
					// set cursor to the end
					tmp[0].setSelectionRange(tmp.val().length, tmp.val().length);
				} else {
					tmp.select();
				}

			}, 1);
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
		},

		editChange: function (el, index, column, event) {
			// all other fields
			var summary = index < 0;
			index = index < 0 ? -index - 1 : index;
			var records = summary ? this.summary : this.records;
			var rec  	= records[index];
			var tr		= $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(rec.recid));
			var col		= this.columns[column];
			var new_val	= el.value;
			var old_val = this.parseField(rec, col.field);
			var tmp 	= $(el).data('w2field');
			if (tmp) {
				new_val = tmp.clean(new_val);
				if (tmp.type == 'list' && new_val != '') new_val = $(el).data('selected');
			}
			if (el.type == 'checkbox') new_val = el.checked;
			// change/restore event
			var eventData = {
				phase: 'before', type: 'change', target: this.name, input_id: el.id, recid: rec.recid, index: index, column: column,
				value_new: new_val, value_previous: (rec.changes && rec.changes.hasOwnProperty(col.field) ? rec.changes[col.field]: old_val), value_original: old_val
			};
			while (true) {
				new_val = eventData.value_new;
				if (( typeof old_val == 'undefined' || old_val === null ? '' : String(old_val)) !== String(new_val)) {
					// change event
					eventData = this.trigger($.extend(eventData, { type: 'change', phase: 'before' }));
					if (eventData.isCancelled !== true) {
						if (new_val !== eventData.value_new) {
							// re-evaluate the type of change to be made
							continue;
						}
						// default action
						rec.changes = rec.changes || {};
						rec.changes[col.field] = eventData.value_new;
						// event after
						this.trigger($.extend(eventData, { phase: 'after' }));
					}
				} else {
					// restore event
					eventData = this.trigger($.extend(eventData, { type: 'restore', phase: 'before' }));
					if (eventData.isCancelled !== true) {
						if (new_val !== eventData.value_new) {
							// re-evaluate the type of change to be made
							continue;
						}
						// default action
						if (rec.changes) delete rec.changes[col.field];
						if ($.isEmptyObject(rec.changes)) delete rec.changes;
						// event after
						this.trigger($.extend(eventData, { phase: 'after' }));
					}
				}
				break;
			}
			// refresh cell
			var cell = this.getCellHTML(index, column, summary);
			if (!summary) {
				if (rec.changes && typeof rec.changes[col.field] != 'undefined') {
					$(tr).find('[col='+ column +']').addClass('w2ui-changed').html(cell);
				} else {
					$(tr).find('[col='+ column +']').removeClass('w2ui-changed').html(cell);
				}
			}
		},

		delete: function (force) {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'delete', force: force });
			if (eventData.isCancelled === true) return;
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
				this.selectNone();
				if (typeof recs[0] != 'object') {
					this.remove.apply(this, recs);
				} else {
					// clear cells
					for (var r in recs) {
						var fld = this.columns[recs[r].column].field;
						var ind = this.get(recs[r].recid, true);
						if (ind != null && fld != 'recid') {
							this.records[ind][fld] = '';
							if (this.records[ind].changes) delete this.records[ind].changes[fld];
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
			if (this.last.cancelClick == true) return;
			if (typeof recid == 'object') {
				column = recid.column;
				recid  = recid.recid;
			}
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
			if (eventData.isCancelled === true) return;
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
			if (event.shiftKey && sel.length > 0 && obj.multiSelect) {
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
				var last = this.last.selection;
				var flag = (last.indexes.indexOf(ind) != -1 ? true : false);
				// clear other if necessary
				if (((!event.ctrlKey && !event.shiftKey && !event.metaKey) || !this.multiSelect) && !this.showSelectColumn) {
					if (this.selectType != 'row' && $.inArray(column, last.columns[ind]) == -1) flag = false;
					if (sel.length > 300) this.selectNone(); else this.unselect.apply(this, sel);
					if (flag === true) {
						this.unselect({ recid: recid, column: column });
					} else {
						this.select({ recid: recid, column: column });
					}
				} else {
					if (this.selectType != 'row' && $.inArray(column, last.columns[ind]) == -1) flag = false;
					if (flag === true) {
						this.unselect({ recid: recid, column: column });
					} else {
						this.select({ recid: recid, column: column });
					}
				}
			}
			this.status();
			obj.initResize();
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		columnClick: function (field, event) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'columnClick', target: this.name, field: field, originalEvent: event });
			if (eventData.isCancelled === true) return;
			// default behaviour
			var column = this.getColumn(field);
			if (column.sortable) this.sort(field, null, (event && (event.ctrlKey || event.metaKey) ? true : false) );
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		keydown: function (event) {
			// this method is called from w2utils
			var obj = this;
			if (obj.keyboard !== true) return;
			// trigger event
			var eventData = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event });
			if (eventData.isCancelled === true) return;
			// default behavior
			var empty	= false;
			var records = $('#grid_'+ obj.name +'_records');
			var sel 	= obj.getSelection();
			if (sel.length == 0) empty = true;
			var recid	= sel[0] || null;
			var columns = [];
			var recid2  = sel[sel.length-1];
			if (typeof recid == 'object' && recid != null) {
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
			var recEL	= $('#grid_'+ obj.name +'_rec_'+ (ind !== null ? w2utils.escapeId(obj.records[ind].recid) : 'none'));
			var cancel  = false;
			var key 	= event.keyCode;
			var shiftKey= event.shiftKey;
			if (key == 9) { // tab key
				if (event.shiftKey) key = 37; else key = 39; // replace with arrows
				shiftKey = false;
				cancel   = true;
			}
			switch (key) {
				case 8:  // backspace
				case 46: // delete
					obj.delete();
					cancel = true;
					event.stopPropagation();
					break;

				case 27: // escape
					obj.selectNone();
					if (sel.length > 0 && typeof sel[0] == 'object') {
						obj.select({ recid: sel[0].recid, column: sel[0].column });
					}
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
					// if expandable columns - expand it
					if (this.selectType == 'row' && obj.show.expandColumn === true) {
						if (recEL.length <= 0) break;
						obj.toggle(recid, event);
						cancel = true;
					} else { // or enter edit
						for (var c in this.columns) {
							if (this.columns[c].editable) {
								columns.push(parseInt(c));
								break;
							}
						}
						// edit last column that was edited
						if (this.selectType == 'row' && this.last.edit_col) columns = [this.last.edit_col];
						if (columns.length > 0) {
							obj.editField(recid, columns[0], null, event);
							cancel = true;
						}
					}
					break;

				case 37: // left
					if (empty) break;
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
						var prev = obj.prevCell(columns[0]);
						if (prev !== false) {
							if (shiftKey && obj.multiSelect) {
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
								event.shiftKey = false;
								obj.click({ recid: recid, column: prev }, event);
							}
						} else {
							// if selected more then one, then select first
							if (!shiftKey) {
								for (var s=1; s<sel.length; s++) obj.unselect(sel[s]);
							}
						}
					}
					cancel = true;
					break;

				case 39: // right
					if (empty) break;
					if (this.selectType == 'row') {
						if (recEL.length <= 0 || rec.expanded === true || obj.show.expandColumn !== true) break;
						obj.expand(recid, event);
					} else {
						var next = obj.nextCell(columns[columns.length-1]);
						if (next !== false) {
							if (shiftKey && key == 39 && obj.multiSelect) {
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
						} else {
							// if selected more then one, then select first
							if (!shiftKey) {
								for (var s=0; s<sel.length-1; s++) obj.unselect(sel[s]);
							}
						}
					}
					cancel = true;
					break;

				case 38: // up
					if (empty) selectTopRecord();
					if (recEL.length <= 0) break;
					// move to the previous record
					var prev = obj.prevRow(ind);
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
						if (shiftKey && obj.multiSelect) { // expand selection
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
						// if selected more then one, then select first
						if (!shiftKey) {
							for (var s=1; s<sel.length; s++) obj.unselect(sel[s]);
						}
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
					if (empty) selectTopRecord();
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
					var next = obj.nextRow(ind2);
					if (next != null) {
						if (shiftKey && obj.multiSelect) { // expand selection
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
						// if selected more then one, then select first
						if (!shiftKey) {
							for (var s=0; s<sel.length-1; s++) obj.unselect(sel[s]);
						}
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
					if (empty) break;
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
					if (empty) break;
					if (event.ctrlKey || event.metaKey) {
						setTimeout(function () { obj.delete(true); }, 100);
					}
				case 67: // c - copy
					if (empty) break;
					if (event.ctrlKey || event.metaKey) {
						var text = obj.copy();
						$('body').append('<textarea id="_tmp_copy_data" style="position: absolute; top: -100px; height: 1px;">'+ text +'</textarea>');
						$('#_tmp_copy_data').focus().select();
						setTimeout(function () { $('#_tmp_copy_data').remove(); }, 50);
					}
					break;
			}
			var tmp = [187, 189, 32]; // =-spacebar
			for (var i=48; i<=90; i++) tmp.push(i); // 0-9,a-z,A-Z
			if (tmp.indexOf(key) != -1 && !event.ctrlKey && !event.metaKey && !cancel) {
				if (columns.length == 0) columns.push(0);
				var tmp = String.fromCharCode(key);
				if (key == 187) tmp = '=';
				if (key == 189) tmp = '-';
				if (!shiftKey) tmp = tmp.toLowerCase();
				obj.editField(recid, columns[0], tmp, event);
				cancel = true;
			}
			if (cancel) { // cancel default behaviour
				if (event.preventDefault) event.preventDefault();
			}
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));

			function selectTopRecord() {
				var ind = Math.floor((records[0].scrollTop + (records.height() / 2.1)) / obj.recordHeight);
				if (!obj.records[ind]) ind = 0;
				obj.select({ recid: obj.records[ind].recid, column: 0});
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
			if (ind == t1) records.animate({ 'scrollTop': records.scrollTop() - records.height() / 1.3 }, 250, 'linear');
			if (ind == t2) records.animate({ 'scrollTop': records.scrollTop() + records.height() / 1.3 }, 250, 'linear');
			if (ind < t1 || ind > t2) records.animate({ 'scrollTop': (ind - 1) * this.recordHeight });
		},

		dblClick: function (recid, event) {
			//if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
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
			if (eventData.isCancelled === true) return;
			// default action
			this.selectNone();
			var col = this.columns[column];
			if (col && $.isPlainObject(col.editable)) {
				this.editField(recid, column, null, event);
			} else {
				this.select({ recid: recid, column: column });
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},

		contextMenu: function (recid, event) {
			var obj = this;
			if (typeof event.offsetX === 'undefined') {
				event.offsetX = event.layerX - event.target.offsetLeft;
				event.offsetY = event.layerY - event.target.offsetTop;
			}
			if (w2utils.isFloat(recid)) recid = parseFloat(recid);
			if (this.getSelection().indexOf(recid) == -1) obj.click(recid);
			// need timeout to allow click to finish first
			setTimeout(function () {
				// event before
				var eventData = obj.trigger({ phase: 'before', type: 'contextMenu', target: obj.name, originalEvent: event, recid: recid });
				if (eventData.isCancelled === true) return;
				// default action
				if (obj.menu.length > 0) {
					$(obj.box).find(event.target)
						.w2menu(obj.menu, {
							left	: event.offsetX,
							onSelect: function (event) { 
								obj.menuClick(recid, parseInt(event.index), event.originalEvent); 
							}
						}
					);
				}
				// event after
				obj.trigger($.extend(eventData, { phase: 'after' }));
			}, 150); // need timer 150 for FF
		},

		menuClick: function (recid, index, event) {
			var obj = this;
			// event before
			var eventData = obj.trigger({ phase: 'before', type: 'menuClick', target: obj.name, originalEvent: event, 
				recid: recid, menuIndex: index, menuItem: obj.menu[index] });
			if (eventData.isCancelled === true) return;
			// default action
			// -- empty
			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));
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
				return;
			}
			// default action
			$('#grid_'+ this.name +'_rec_'+ id).attr('expanded', 'yes').addClass('w2ui-expanded');
			$('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').show();
			$('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('<div class="w2ui-spinner" style="width: 16px; height: 16px; margin: -2px 2px;"></div>');
			rec.expanded = true;
			// check if height of expanded row > 5 then remove spinner
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
			if (eventData.isCancelled === true) return;
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

		sort: function (field, direction, multiField) { // if no params - clears sort
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'sort', target: this.name, field: field, direction: direction, multiField: multiField });
			if (eventData.isCancelled === true) return;
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
				if (multiField != true) { this.sortData = []; sortIndex = 0; }
				// set new sort
				if (typeof this.sortData[sortIndex] == 'undefined') this.sortData[sortIndex] = {};
				this.sortData[sortIndex].field 	   = field;
				this.sortData[sortIndex].direction = direction;
			} else {
				this.sortData = [];
			}
			this.selectNone();
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
				var recs   = [];
				for (var s in sel) {
					if (sel[s].column < minCol) minCol = sel[s].column;
					if (sel[s].column > maxCol) maxCol = sel[s].column;
					if (recs.indexOf(sel[s].index) == -1) recs.push(sel[s].index);
				}
				recs.sort();
				for (var r in recs) {
					var ind = recs[r];
					for (var c = minCol; c <= maxCol; c++) {
						var col = this.columns[c];
						if (col.hidden === true) continue;
						text += w2utils.stripTags(this.getCellHTML(ind, c)) + '\t';
					}
					text = text.substr(0, text.length-1); // remove last \t
					text += '\n';
				}
			} else { // row copy
				for (var s in sel) {
					var ind = this.get(sel[s], true);
					for (var c in this.columns) {
						var col = this.columns[c];
						if (col.hidden === true) continue;
						text += w2utils.stripTags(this.getCellHTML(ind, c)) + '\t';
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
			var ind = this.get(sel[0].recid, true);
			var col = sel[0].column;
			// before event
			var eventData = this.trigger({ phase: 'before', type: 'paste', target: this.name, text: text, index: ind, column: col });
			if (eventData.isCancelled === true) return;
			text = eventData.text;
			// default action
			if (this.selectType == 'row' || sel.length == 0) {
				console.log('ERROR: You can paste only if grid.selectType = \'cell\' and when at least one cell selected.');
				// event after
				this.trigger($.extend(eventData, { phase: 'after' }));
				return;
			}
			var newSel = [];
			var text   = text.split('\n');
			for (var t in text) {
				var tmp  = text[t].split('\t');
				var cnt  = 0;
				var rec  = this.records[ind];
				var cols = [];
				for (var dt in tmp) {
					if (!this.columns[col + cnt]) continue;
					var field = this.columns[col + cnt].field;
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
			//if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			// make sure the box is right
			if (!this.box || $(this.box).attr('name') != this.name) return;
			// determine new width and height
			$(this.box).find('> div')
				.css('width', $(this.box).width())
				.css('height', $(this.box).height());
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
			if (eventData.isCancelled === true) return;
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

		refreshCell: function (recid, field) {
			var index		= this.get(recid, true);
			var col_ind		= this.getColumn(field, true);
			var rec			= this.records[index];
			var col			= this.columns[col_ind];
			var cell		= $('#grid_'+ this.name + '_rec_'+ recid +' [col='+ col_ind +']');
			// set cell html and changed flag
			cell.html(this.getCellHTML(index, col_ind));
			if (rec.changes && typeof rec.changes[col.field] != 'undefined') {
				cell.addClass('w2ui-changed');
			} else {
				cell.removeClass('w2ui-changed');
			}
		},

		refreshRow: function (recid) {
			var tr = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
			if (tr.length != 0) {
				var ind  = this.get(recid, true);
				var line = tr.attr('line');
				// if it is searched, find index in search array
				var url = (typeof this.url != 'object' ? this.url : this.url.get);
				if (this.searchData.length > 0 && !url) for (var s in this.last.searchIds) if (this.last.searchIds[s] == ind) ind = s;
				$(tr).replaceWith(this.getRecordHTML(ind, line));
			}

		},

		refresh: function () {
			var obj  = this;
			var time = (new Date()).getTime();
			var url = (typeof this.url != 'object' ? this.url : this.url.get);
			if (this.total <= 0 && !url && this.searchData.length == 0) {
				this.total = this.records.length;
				this.buffered = this.total;
			}
			//if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
			this.toolbar.disable('w2ui-edit', 'w2ui-delete');
			if (!this.box) return;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh' });
			if (eventData.isCancelled === true) return;
			// -- header
			if (this.show.header) {
				$('#grid_'+ this.name +'_header').html(this.header +'&nbsp;').show();
			} else {
				$('#grid_'+ this.name +'_header').hide();
			}
			// -- toolbar
			if (this.show.toolbar) {
				// if select-collumn is checked - no toolbar refresh
				if (this.toolbar && this.toolbar.get('w2ui-column-on-off') && this.toolbar.get('w2ui-column-on-off').checked) {
					// no action
				} else {
					$('#grid_'+ this.name +'_toolbar').show();
					// refresh toolbar all but search field
					if (typeof this.toolbar == 'object') {
						var tmp = this.toolbar.items;
						for (var t in tmp) {
							if (tmp[t].id == 'w2ui-search' || tmp[t].type == 'break') continue;
							this.toolbar.refresh(tmp[t].id);
						}
					}
				}
			} else {
				$('#grid_'+ this.name +'_toolbar').hide();
			}
			// -- make sure search is closed
			this.searchClose();
			// search placeholder
			var el = $('#grid_'+ obj.name +'_search_all');
			if (!this.multiSearch && this.last.field == 'all' && this.searches.length > 0) {
				this.last.field 	= this.searches[0].field;
				this.last.caption 	= this.searches[0].caption;
			}
			for (var s in this.searches) {
				if (this.searches[s].field == this.last.field) this.last.caption = this.searches[s].caption;
			}
			if (this.last.multi) {
				el.attr('placeholder', '[' + w2utils.lang('Multiple Fields') + ']');
			} else {
				el.attr('placeholder', this.last.caption);
			}
			if (el.val() != this.last.search) {
				var val = this.last.search;
				var tmp = el.data('w2field');
				if (tmp) val = tmp.format(val);
				el.val(val);
			}

			// -- separate summary
			var tmp = this.find({ summary: true }, true);
			if (tmp.length > 0) {
				for (var t in tmp) this.summary.push(this.records[tmp[t]]);
				for (var t=tmp.length-1; t>=0; t--) this.records.splice(tmp[t], 1);
				this.total 	  = this.total - tmp.length;
				this.buffered = this.buffered - tmp.length;
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
			// show/hide clear search link
 			if (this.searchData.length > 0) {
				$('#grid_'+ this.name +'_searchClear').show();
			} else {
				$('#grid_'+ this.name +'_searchClear').hide();
			}
			// all selected?
			var sel = this.last.selection;
			if (sel.indexes.length == this.records.length || (this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)) {
				$('#grid_'+ this.name +'_check_all').prop('checked', true);
			} else {
				$('#grid_'+ this.name +'_check_all').prop('checked', false);
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

			if ( obj.reorderColumns && !obj.last.columnDrag ) {
				obj.last.columnDrag = obj.initColumnDrag();
			} else if ( !obj.reorderColumns && obj.last.columnDrag ) {
				obj.last.columnDrag.remove();
			}

			return (new Date()).getTime() - time;
		},

		render: function (box) {
			var obj  = this;
			var time = (new Date()).getTime();
			//if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
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
			if (eventData.isCancelled === true) return;
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
			if (this.url) this.refresh(); // show empty grid (need it) - should it be only for remote data source
			this.reload();

			// init mouse events for mouse selection
			$(this.box).on('mousedown', mouseStart);
			$(this.box).on('selectstart', function () { return false; }); // fixes chrome cursror bug

			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			// attach to resize event
			if ($('.w2ui-layout').length == 0) { // if there is layout, it will send a resize event
				this.tmp_resize = function (event) { w2ui[obj.name].resize(); }
				$(window).off('resize', this.tmp_resize).on('resize', this.tmp_resize);
			}
			return (new Date()).getTime() - time;

			function mouseStart (event) {
				if ($(event.target).parents().hasClass('w2ui-head') || $(event.target).hasClass('w2ui-head')) return;
				if (obj.last.move && obj.last.move.type == 'expand') return;
				if (!obj.multiSelect) return;
				obj.last.move = {
					x		: event.screenX,
					y		: event.screenY,
					divX	: 0,
					divY	: 0,
					recid	: $(event.target).parents('tr').attr('recid'),
					column	: (event.target.tagName == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col')),
					type	: 'select',
					ghost	: false,
					start	: true
				};
				$(document).on('mousemove', mouseMove);
				$(document).on('mouseup', mouseStop);
			}

			function mouseMove (event) {
				var mv = obj.last.move;
				if (!mv || mv.type != 'select') return;
				mv.divX = (event.screenX - mv.x);
				mv.divY = (event.screenY - mv.y);
				if (Math.abs(mv.divX) <= 1 && Math.abs(mv.divY) <= 1) return; // only if moved more then 1px
				obj.last.cancelClick = true;
				if (obj.reorderRows == true) {
					if (!mv.ghost) {
						var row	 = $('#grid_'+ obj.name + '_rec_'+ mv.recid);
						var tmp	 = row.parents('table').find('tr:first-child').clone();
						mv.offsetY = event.offsetY;
						mv.from  = mv.recid;
						mv.pos	 = row.position();
						mv.ghost = $(row).clone(true);
						mv.ghost.removeAttr('id');
						row.find('td:first-child').replaceWith('<td colspan="1000" style="height: '+ obj.recordHeight +'px; background-color: #ddd"></td>');
						var recs = $(obj.box).find('.w2ui-grid-records');
						recs.append('<table id="grid_'+ obj.name + '_ghost" style="position: absolute; z-index: 999999; opacity: 0.8; border-bottom: 2px dashed #aaa; border-top: 2px dashed #aaa; pointer-events: none;"></table>');
						$('#grid_'+ obj.name + '_ghost').append(tmp).append(mv.ghost);
					}
					var recid = $(event.target).parents('tr').attr('recid');
					if (recid != mv.from) {
						var row1 = $('#grid_'+ obj.name + '_rec_'+ mv.recid);
						var row2 = $('#grid_'+ obj.name + '_rec_'+ recid);
						if (event.screenY - mv.lastY < 0) row1.after(row2); else row2.after(row1);
						mv.lastY = event.screenY;
						mv.to 	 = recid;
					}
					var ghost = $('#grid_'+ obj.name + '_ghost');
					var recs  = $(obj.box).find('.w2ui-grid-records');
					ghost.css({
						top	 : mv.pos.top + mv.divY + recs.scrollTop(), // + mv.offsetY - obj.recordHeight / 2,
						left : mv.pos.left
					});
					return;
				}
				if (mv.start && mv.recid) {
					obj.selectNone();
					mv.start = false;
				}
				var newSel= [];
				var recid = (event.target.tagName == 'TR' ? $(event.target).attr('recid') : $(event.target).parents('tr').attr('recid'));
				if (typeof recid == 'undefined') return;
				var ind1  = obj.get(mv.recid, true);
				// |:wolfmanx:| this happens when selection is started on summary row
				if (ind1 === null) return;
				var ind2  = obj.get(recid, true);
				// this happens when selection is extended into summary row (a good place to implement scrolling)
				if (ind2 === null) return;
				var col1  = parseInt(mv.column);
				var col2  = parseInt(event.target.tagName == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col'));
				if (ind1 > ind2) { var tmp = ind1; ind1 = ind2; ind2 = tmp; }
				// check if need to refresh
				var tmp = 'ind1:'+ ind1 +',ind2;'+ ind2 +',col1:'+ col1 +',col2:'+ col2;
				if (mv.range == tmp) return;
				mv.range = tmp;
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
				var mv = obj.last.move;
				setTimeout(function () { delete obj.last.cancelClick; }, 1);
				if ($(event.target).parents().hasClass('.w2ui-head') || $(event.target).hasClass('.w2ui-head')) return;
				if (!mv || mv.type != 'select') return;
				if (obj.reorderRows == true) {
					var ind1 = obj.get(mv.from, true);
					var tmp  = obj.records[ind1];
					obj.records.splice(ind1, 1);
					var ind2 = obj.get(mv.to, true);
					if (ind1 > ind2) obj.records.splice(ind2, 0, tmp); else obj.records.splice(ind2+1, 0, tmp);
					$('#grid_'+ obj.name + '_ghost').remove();
					obj.refresh();
				}
				delete obj.last.move;
				$(document).off('mousemove', mouseMove);
				$(document).off('mouseup', mouseStop);
			}
		},

		destroy: function () {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });
			if (eventData.isCancelled === true) return;
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
				var tmp = this.columns[c].caption;
				if (!tmp && this.columns[c].hint) tmp = this.columns[c].hint;
				if (!tmp) tmp = '- column '+ (parseInt(c) + 1) +' -';
				col_html += '<tr>'+
					'<td style="width: 30px">'+
					'	<input id="grid_'+ this.name +'_column_'+ c +'_check" type="checkbox" tabIndex="-1" '+ (col.hidden ? '' : 'checked') +
					'		onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \''+ col.field +'\');">'+
					'</td>'+
					'<td>'+
					'	<label for="grid_'+ this.name +'_column_'+ c +'_check">'+ tmp +	'</label>'+
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
						'				onchange="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'skip\', this.value); $(\'#w2ui-overlay\')[0].hide();"> '+ w2utils.lang('Records')+
						'	</div>'+
						'</td></tr>';
			}
			col_html +=	'<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'line-numbers\'); $(\'#w2ui-overlay\')[0].hide();">'+
						'	<div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Toggle Line Numbers') +'</div>'+
						'</td></tr>'+
						'<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'resize\'); $(\'#w2ui-overlay\')[0].hide();">'+
						'	<div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Reset Column Size') + '</div>'+
						'</td></tr>';
			col_html += "</table></div>";
			this.toolbar.get('w2ui-column-on-off').html = col_html;
		},

		/**
		 *
		 * @param box, grid object
		 * @returns {{remove: Function}} contains a closure around all events to ensure they are removed from the dom
		 */
		initColumnDrag: function( box ){
			//throw error if using column groups
			if ( this.columnGroups && this.columnGroups.length ) throw 'Draggable columns are not currently supported with column groups.';

			var obj = this,
				_dragData = {};
				_dragData.lastInt = null;
				_dragData.pressed = false;
				_dragData.timeout = null;_dragData.columnHead = null;

			//attach orginal event listener
			$( obj.box).on( 'mousedown', dragColStart );
			$( obj.box ).on( 'mouseup', catchMouseup );

			function catchMouseup(){
				_dragData.pressed = false;
				clearTimeout( _dragData.timeout );
			}
			/**
			 *
			 * @param event, mousedown
			 * @returns {boolean} false, preventsDefault
			 */
			function dragColStart ( event ) {
				if ( _dragData.timeout ) clearTimeout( _dragData.timeout );
				var self = this;
				_dragData.pressed = true;

				_dragData.timeout = setTimeout(function(){
					if ( !_dragData.pressed ) return;

					var eventData,
						columns,
						selectedCol,
						origColumn,
						origColumnNumber,
						invalidPreColumns = [ 'w2ui-col-number', 'w2ui-col-expand', 'w2ui-col-select' ],
						invalidPostColumns = [ 'w2ui-head-last' ],
						invalidColumns = invalidPreColumns.concat( invalidPostColumns ),
						preColumnsSelector = '.w2ui-col-number, .w2ui-col-expand, .w2ui-col-select',
						preColHeadersSelector = '.w2ui-head.w2ui-col-number, .w2ui-head.w2ui-col-expand, .w2ui-head.w2ui-col-select';

					// do nothing if it is not a header
					if ( !$( event.originalEvent.target ).parents().hasClass( 'w2ui-head' ) ) return;

					// do nothing if it is an invalid column
					for ( var i = 0, l = invalidColumns.length; i < l; i++ ){
						if ( $( event.originalEvent.target ).parents().hasClass( invalidColumns[ i ] ) ) return;
					}

					_dragData.numberPreColumnsPresent = $( obj.box ).find( preColHeadersSelector ).length;

					//start event for drag start
					_dragData.columnHead = origColumn = $( event.originalEvent.target ).parents( '.w2ui-head' );
					origColumnNumber = parseInt( origColumn.attr( 'col' ), 10);
					eventData = obj.trigger({ type: 'columnDragStart', phase: 'before', originalEvent: event, origColumnNumber: origColumnNumber, target: origColumn[0] });
					if ( eventData.isCancelled === true ) return false;

					columns = _dragData.columns = $( obj.box ).find( '.w2ui-head:not(.w2ui-head-last)' );

					//add events
					$( document ).on( 'mouseup', dragColEnd );
					$( document ).on( 'mousemove', dragColOver );

					_dragData.originalPos = parseInt( $( event.originalEvent.target ).parent( '.w2ui-head' ).attr( 'col' ), 10 );
					//_dragData.columns.css({ overflow: 'visible' }).children( 'div' ).css({ overflow: 'visible' });

					//configure and style ghost image
					_dragData.ghost = $( self ).clone( true );

					//hide other elements on ghost except the grid body
					$( _dragData.ghost ).find( '[col]:not([col="' + _dragData.originalPos + '"]), .w2ui-toolbar, .w2ui-grid-header' ).remove();
					$( _dragData.ghost ).find( preColumnsSelector ).remove();
					$( _dragData.ghost ).find( '.w2ui-grid-body' ).css({ top: 0 });

					selectedCol = $( _dragData.ghost ).find( '[col="' + _dragData.originalPos + '"]' );
					$( document.body ).append( _dragData.ghost );

					$( _dragData.ghost ).css({
						width: 0,
						height: 0,
						margin: 0,
						position: 'fixed',
						zIndex: 999999,
						opacity: 0
					}).addClass( '.w2ui-grid-ghost' ).animate({
							width: selectedCol.width(),
							height: $(obj.box).find('.w2ui-grid-body:first').height(),
							left : event.pageX,
							top : event.pageY,
							opacity: .8
						}, 0 );

					//establish current offsets
					_dragData.offsets = [];
					for ( var i = 0, l = columns.length; i < l; i++ ) {
						_dragData.offsets.push( $( columns[ i ] ).offset().left );
					}

					//conclude event
					obj.trigger( $.extend( eventData, { phase: 'after' } ) );
				}, 150 );//end timeout wrapper
			}

			function dragColOver ( event ) {
				if ( !_dragData.pressed ) return;

				var cursorX = event.originalEvent.pageX,
					cursorY = event.originalEvent.pageY,
					offsets = _dragData.offsets,
					lastWidth = $( '.w2ui-head:not(.w2ui-head-last)' ).width();

				_dragData.targetInt = targetIntersection( cursorX, offsets, lastWidth );
				markIntersection( _dragData.targetInt );
				trackGhost( cursorX, cursorY );
			}

			function dragColEnd ( event ) {
				_dragData.pressed = false;

				var eventData,
					target,
					selected,
					columnConfig,
					columnNum,
					targetColumn,
					ghosts = $( '.w2ui-grid-ghost' );

				//start event for drag start
				eventData = obj.trigger({ type: 'columnDragEnd', phase: 'before', originalEvent: event, target: _dragData.columnHead[0] });
				if ( eventData.isCancelled === true ) return false;

				selected = obj.columns[ _dragData.originalPos ];
				columnConfig = obj.columns;
				columnNum = ( _dragData.targetInt >= obj.columns.length ) ? obj.columns.length - 1 :
						( _dragData.targetInt < _dragData.originalPos ) ? _dragData.targetInt : _dragData.targetInt - 1;
				target = ( _dragData.numberPreColumnsPresent ) ?
					( _dragData.targetInt - _dragData.numberPreColumnsPresent < 0 ) ? 0 : _dragData.targetInt - _dragData.numberPreColumnsPresent :
					_dragData.targetInt;
				targetColumn =  $( '.w2ui-head[col="' + columnNum + '"]' );

				if ( target !== _dragData.originalPos + 1 && target !== _dragData.originalPos && targetColumn && targetColumn.length ) {
					$( _dragData.ghost ).animate({
						top: $( obj.box ).offset().top,
						left: targetColumn.offset().left,
						width: 0,
						height: 0,
						opacity:.2
					}, 300, function(){
						$( this ).remove();
						ghosts.remove();
					});

					columnConfig.splice( target, 0, $.extend( {}, selected ) );
					columnConfig.splice( columnConfig.indexOf( selected ), 1);
				} else {
					$( _dragData.ghost ).remove();
					ghosts.remove();
				}

				//_dragData.columns.css({ overflow: '' }).children( 'div' ).css({ overflow: '' });

				$( document ).off( 'mouseup', dragColEnd );
				$( document ).off( 'mousemove', dragColOver );
				if ( _dragData.marker ) _dragData.marker.remove();
				_dragData = {};

				obj.refresh();

				//conclude event
				obj.trigger( $.extend( eventData, { phase: 'after', targetColumnNumber: target - 1 } ) );
			}

			function markIntersection( intersection ){
				if ( !_dragData.marker && !_dragData.markerLeft ) {
					_dragData.marker = $('<div class="col-intersection-marker">' +
						'<div class="top-marker"></div>' +
						'<div class="bottom-marker"></div>' +
						'</div>');
					_dragData.markerLeft = $('<div class="col-intersection-marker">' +
						'<div class="top-marker"></div>' +
						'<div class="bottom-marker"></div>' +
						'</div>');
				}

				if ( !_dragData.lastInt || _dragData.lastInt !== intersection ){
					_dragData.lastInt = intersection;
					_dragData.marker.remove();
					_dragData.markerLeft.remove();
					$('.w2ui-head').removeClass('w2ui-col-intersection');

					//if the current intersection is greater than the number of columns add the marker to the end of the last column only
					if ( intersection >= _dragData.columns.length ) {
						$( _dragData.columns[ _dragData.columns.length - 1 ] ).children( 'div:last' ).append( _dragData.marker.addClass( 'right' ).removeClass( 'left' ) );
						$( _dragData.columns[ _dragData.columns.length - 1 ] ).addClass('w2ui-col-intersection');
					} else if ( intersection <= _dragData.numberPreColumnsPresent ) {
						//if the current intersection is on the column numbers place marker on first available column only
						$( '.w2ui-head[col="0"]' ).prepend( _dragData.marker.addClass( 'left' ).removeClass( 'right' ) ).css({ position: 'relative' });
						$( '.w2ui-head[col="0"]').prev().addClass('w2ui-col-intersection');
					} else {
						//otherwise prepend the marker to the targeted column and append it to the previous column
						$( _dragData.columns[intersection] ).children( 'div:last' ).prepend( _dragData.marker.addClass( 'left' ).removeClass( 'right' ) );
						$( _dragData.columns[intersection] ).prev().children( 'div:last' ).append( _dragData.markerLeft.addClass( 'right' ).removeClass( 'left' ) ).css({ position: 'relative' });
						$( _dragData.columns[intersection - 1] ).addClass('w2ui-col-intersection');
					}
				}
			}

			function targetIntersection( cursorX, offsets, lastWidth ){
				if ( cursorX <= offsets[0] ) {
					return 0;
				} else if ( cursorX >= offsets[offsets.length - 1] + lastWidth ) {
					return offsets.length;
				} else {
					for ( var i = 0, l = offsets.length; i < l; i++ ) {
						var thisOffset = offsets[ i ];
						var nextOffset = offsets[ i + 1 ] || offsets[ i ] + lastWidth;
						var midpoint = ( nextOffset - offsets[ i ]) / 2 + offsets[ i ];

						if ( cursorX > thisOffset && cursorX <= midpoint ) {
							return i;
						} else if ( cursorX > midpoint && cursorX <= nextOffset ) {
							return i + 1;
						}
					}
					return intersection;
				}
			}

			function trackGhost( cursorX, cursorY ){
				$( _dragData.ghost ).css({
					left: cursorX - 10,
					top: cursorY - 10
				});
			}

			//return an object to remove drag if it has ever been enabled
			return {
				remove: function(){
					$( obj.box ).off( 'mousedown', dragColStart );
					$( obj.box ).off( 'mouseup', catchMouseup );
					$( obj.box ).find( '.w2ui-head' ).removeAttr( 'draggable' );
					obj.last.columnDrag = false;
				}
			}
		},

		columnOnOff: function (el, event, field, value) {
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'columnOnOff', checkbox: el, field: field, originalEvent: event });
			if (eventData.isCancelled === true) return;
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
					$().w2overlay('', { name: 'searches-'+ this.name });
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
					this.toolbar.items.push($.extend(true, {}, this.buttons['reload']));
				}
				if (this.show.toolbarColumns) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['columns']));
					this.initColumnOnOff();
				}
				if (this.show.toolbarReload || this.show.toolbarColumn) {
					this.toolbar.items.push({ type: 'break', id: 'w2ui-break0' });
				}
				if (this.show.toolbarSearch) {
					var html =
						'<div class="w2ui-toolbar-search">'+
						'<table cellpadding="0" cellspacing="0"><tr>'+
						'	<td>'+ this.buttons['search'].html +'</td>'+
						'	<td>'+
						'		<input id="grid_'+ this.name +'_search_all" class="w2ui-search-all" '+
						'			placeholder="'+ this.last.caption +'" value="'+ this.last.search +'"'+
						'			onchange="'+
						'				var val = this.value; '+
						'				var fld = $(this).data(\'w2field\'); '+
						'				if (fld) val = fld.clean(val); '+
						'				w2ui[\''+ this.name +'\'].search(w2ui[\''+ this.name +'\'].last.field, val); '+
						'			">'+
						'	</td>'+
						'	<td>'+
						'		<div title="'+ w2utils.lang('Clear Search') +'" class="w2ui-search-clear" id="grid_'+ this.name +'_searchClear"  '+
						'			 onclick="var obj = w2ui[\''+ this.name +'\']; obj.searchReset();" '+
						'		>&nbsp;&nbsp;</div>'+
						'	</td>'+
						'</tr></table>'+
						'</div>';
					this.toolbar.items.push({ type: 'html', id: 'w2ui-search', html: html });
					if (this.multiSearch && this.searches.length > 0) {
						this.toolbar.items.push($.extend(true, {}, this.buttons['search-go']));
					}
				}
				if (this.show.toolbarSearch && (this.show.toolbarAdd || this.show.toolbarEdit || this.show.toolbarDelete || this.show.toolbarSave)) {
					this.toolbar.items.push({ type: 'break', id: 'w2ui-break1' });
				}
				if (this.show.toolbarAdd) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['add']));
				}
				if (this.show.toolbarEdit) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['edit']));
				}
				if (this.show.toolbarDelete) {
					this.toolbar.items.push($.extend(true, {}, this.buttons['delete']));
				}
				if (this.show.toolbarSave) {
					if (this.show.toolbarAdd || this.show.toolbarDelete || this.show.toolbarEdit) {
						this.toolbar.items.push({ type: 'break', id: 'w2ui-break2' });
					}
					this.toolbar.items.push($.extend(true, {}, this.buttons['save']));
				}
				// add original buttons
				for (var i in tmp_items) this.toolbar.items.push(tmp_items[i]);

				// =============================================
				// ------ Toolbar onClick processing

				var obj = this;
				this.toolbar.on('click', function (event) {
					var eventData = obj.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event });
					if (eventData.isCancelled === true) return;
					var id = event.target;
					switch (id) {
						case 'w2ui-reload':
							var eventData2 = obj.trigger({ phase: 'before', type: 'reload', target: obj.name });
							if (eventData2.isCancelled === true) return false;
							obj.reload();
							obj.trigger($.extend(eventData2, { phase: 'after' }));
							break;
						case 'w2ui-column-on-off':
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
						case 'w2ui-search-advanced':
							var tb = this;
							var it = this.get(id);
							if (it.checked) {
								obj.searchClose();
								setTimeout(function () { tb.uncheck(id); }, 1);
							} else {
								obj.searchOpen();
								event.originalEvent.stopPropagation();
								function tmp_close() {
									if ($('#w2ui-overlay-searches-'+ obj.name).data('keepOpen') === true) return;
									tb.uncheck(id);
									$(document).off('click', 'body', tmp_close);
								}
								$(document).on('click', 'body', tmp_close);
							}
							break;
						case 'w2ui-add':
							// events
							var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'add', recid: null });
							obj.trigger($.extend(eventData, { phase: 'after' }));
							break;
						case 'w2ui-edit':
							var sel 	= obj.getSelection();
							var recid 	= null;
							if (sel.length == 1) recid = sel[0];
							// events
							var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'edit', recid: recid });
							obj.trigger($.extend(eventData, { phase: 'after' }));
							break;
						case 'w2ui-delete':
							obj.delete();
							break;
						case 'w2ui-save':
							obj.save();
							break;
					}
					// no default action
					obj.trigger($.extend(eventData, { phase: 'after' }));
				});
			}
			return;
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
				for (var i = 0; i < this.columns.length; i++) {
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
				for (var i = 0; i < this.columns.length; i++) {
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
					for (var i = 0; i < this.columns.length; i++) {
						var col = this.columns[i];
						if (col.hidden) continue;
						if (col.sizeType == '%') {
							col.sizeCorrected = Math.round(parseFloat(col.size) * 100 * 100 / percent) / 100 + '%';
						}
					}
				}
				// calculate % columns
				for (var i = 0; i < this.columns.length; i++) {
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
			for (var i = 0; i < this.columns.length; i++) {
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
				s.type = String(s.type).toLowerCase();
				if (s.hidden) continue;
				var btn = '';
				if (showBtn == false) {
					btn = '<button class="btn close-btn" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchClose(); }">X</button';
					showBtn = true;
				}
				if (typeof s.inTag   == 'undefined') s.inTag 	= '';
				if (typeof s.outTag  == 'undefined') s.outTag 	= '';
				if (typeof s.type	== 'undefined') s.type 	= 'text';
				if (['text', 'alphanumeric', 'combo'].indexOf(s.type) != -1) {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						'	<option value="begins">'+ w2utils.lang('begins') +'</option>'+
						'	<option value="contains">'+ w2utils.lang('contains') +'</option>'+
						'	<option value="ends">'+ w2utils.lang('ends') +'</option>'+
						'</select>';
				}
				if (['int', 'float', 'money', 'currency', 'percent', 'date', 'time'].indexOf(s.type) != -1) {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'" '+
						'		onchange="w2ui[\''+ this.name + '\'].initOperator(this, '+ i +');">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						(['int'].indexOf(s.type) != -1 ? '<option value="in">'+ w2utils.lang('in') +'</option>' : '') +
						'<option value="between">'+ w2utils.lang('between') +'</option>'+
						'</select>';
				}
				if (['select', 'list', 'hex'].indexOf(s.type) != -1) {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'">'+
						'	<option value="is">'+ w2utils.lang('is') +'</option>'+
						'</select>';
				}
				if (['enum'].indexOf(s.type) != -1) {
					var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'">'+
						'	<option value="in">'+ w2utils.lang('in') +'</option>'+
						'</select>';
				}
				html += '<tr>'+
						'	<td class="close-btn">'+ btn +'</td>' +
						'	<td class="caption">'+ s.caption +'</td>' +
						'	<td class="operator">'+ operator +
								'<div class="arrow-down" style="position: absolute; display: inline-block; margin: 9px 0px 0px -13px; pointer-events: none;"></div>'+
						'	</td>'+
						'	<td class="value">';

				switch (s.type) {
					case 'text':
					case 'alphanumeric':
					case 'hex':
					case 'list':
					case 'combo':
					case 'enum':
						html += '<input rel="search" type="text" style="width: 300px;" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'>';
						break;

					case 'int':
					case 'float':
					case 'money':
					case 'currency':
					case 'percent':
					case 'date':
					case 'time':
						html += '<input rel="search" type="text" size="12" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'>'+
								'<span id="grid_'+ this.name +'_range_'+ i +'" style="display: none">'+
								'&nbsp;-&nbsp;&nbsp;<input rel="search" type="text" style="width: 90px" id="grid_'+ this.name +'_field2_'+i+'" name="'+ s.field +'" '+ s.inTag +'>'+
								'</span>';
						break;

					case 'select':
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
					'		<button class="btn" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchReset(); }">'+ w2utils.lang('Reset') + '</button>'+
					'		<button class="btn btn-blue" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.search(); }">'+ w2utils.lang('Search') + '</button>'+
					'		</div>'+
					'	</td>'+
					'</tr></table>';
			return html;
		},

		initOperator: function (el, search_ind) {
			var obj		= this;
			var search	= obj.searches[search_ind];
 			var range	= $('#grid_'+ obj.name + '_range_'+ search_ind);
			var fld1	= $('#grid_'+ obj.name +'_field_'+ search_ind);
			var fld2	= fld1.parent().find('span input');
			if ($(el).val() == 'in') { fld1.w2field('clear'); } else { fld1.w2field(search.type); }
			if ($(el).val() == 'between') { range.show(); fld2.w2field(search.type); } else { range.hide(); }
		},

		initSearches: function () {
			var obj = this;
			// init searches
			for (var s in this.searches) {
				var search = this.searches[s];
				var sdata  = this.getSearchData(search.field);
				search.type = String(search.type).toLowerCase();
				if (typeof search.options != 'object') search.options = {};
				// init types
				switch (search.type) {
					case 'text':
					case 'alphanumeric':
						$('#grid_'+ this.name +'_operator_'+s).val('begins');
						if (['alphanumeric', 'hex'].indexOf(search.type) != -1) {
							$('#grid_'+ this.name +'_field_' + s).w2field(search.type, search.options);
						}
						break;

					case 'int':
					case 'float':
					case 'money':
					case 'currency':
					case 'percent':
					case 'date':
					case 'time':
						if (sdata && sdata.type == 'int' && sdata.operator == 'in') break;
						$('#grid_'+ this.name +'_field_'+s).w2field(search.type, search.options);
						$('#grid_'+ this.name +'_field2_'+s).w2field(search.type, search.options);
						setTimeout(function () { // convert to date if it is number
							$('#grid_'+ obj.name +'_field_'+s).keydown(); 
							$('#grid_'+ obj.name +'_field2_'+s).keydown(); 
						}, 1);
						break;

					case 'hex':
						break;

					case 'list':
					case 'combo':
					case 'enum':
						var options = search.options;
						if (search.type == 'list') options.selected = {};
						if (search.type == 'enum') options.selected = [];
						if (sdata) options.selected = sdata.value;
						$('#grid_'+ this.name +'_field_'+s).w2field(search.type, options);
						if (search.type == 'combo') {
							$('#grid_'+ this.name +'_operator_'+s).val('begins');
						}
						break;

					case 'select':
						// build options
						var options = '<option value="">--</option>';
						for (var i in search.options.items) {
							var si = search.options.items[i];
							if ($.isPlainObject(search.options.items[i])) {
								var val = si.id;
								var txt = si.text;
								if (typeof val == 'undefined' && typeof si.value != 'undefined')   val = si.value;
								if (typeof txt == 'undefined' && typeof si.caption != 'undefined') txt = si.caption;
								if (val == null) val = '';
								options += '<option value="'+ val +'">'+ txt +'</option>';
							} else {
								options += '<option value="'+ si +'">'+ si +'</option>';
							}
						}
						$('#grid_'+ this.name +'_field_'+s).html(options);
						break;
				}
				if (sdata != null) {
					if (sdata.type == 'int' && sdata.operator == 'in') {
						$('#grid_'+ this.name +'_field_'+ s).w2field('clear').val(sdata.value);
					}
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
			$('#w2ui-overlay-searches-'+ this.name +' .w2ui-grid-searches *[rel=search]').on('keypress', function (evnt) {
				if (evnt.keyCode == 13 && (evnt.ctrlKey || evnt.metaKey)) {
					obj.search();
					$().w2overlay();
				}
			});
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
								if (RegExp('asc', 'i').test(obj.sortData[si].direction))  sortStyle = 'w2ui-sort-up';
								if (RegExp('desc', 'i').test(obj.sortData[si].direction)) sortStyle = 'w2ui-sort-down';
							}
						}
						var resizer = "";
						if (col.resizable !== false) {
							resizer = '<div class="w2ui-resizer" name="'+ ii +'"></div>';
						}
						html += '<td class="w2ui-head '+ sortStyle +'" col="'+ ii + '" rowspan="2" colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'" '+
								'	onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);">'+
									resizer +
								'	<div class="w2ui-col-group w2ui-col-header '+ (sortStyle ? 'w2ui-col-sorted' : '') +'">'+
								'		<div class="'+ sortStyle +'"></div>'+
										(!col.caption ? '&nbsp;' : col.caption) +
								'	</div>'+
								'</td>';
					} else {
						html += '<td class="w2ui-head" col="'+ ii + '" '+
								'		colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'">'+
								'	<div class="w2ui-col-group">'+
									(!colg.caption ? '&nbsp;' : colg.caption) +
								'	</div>'+
								'</td>';
					}
					ii += colg.span;
				}
				html += '</tr>';
				return html;
			}

			function getColumns (master) {
				var html = '<tr>',
					reorderCols = (obj.reorderColumns && (!obj.columnGroups || !obj.columnGroups.length)) ? ' w2ui-reorder-cols-head ' : '';
				if (obj.show.lineNumbers) {
					html += '<td class="w2ui-head w2ui-col-number" onclick="w2ui[\''+ obj.name +'\'].columnClick(\'line-number\', event);">'+
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
							if (RegExp('asc', 'i').test(obj.sortData[si].direction))  sortStyle = 'w2ui-sort-up';
							if (RegExp('desc', 'i').test(obj.sortData[si].direction)) sortStyle = 'w2ui-sort-down';
						}
					}
					if (colg['master'] !== true || master) { // grouping of columns
						var resizer = "";
						if (col.resizable !== false) {
							resizer = '<div class="w2ui-resizer" name="'+ i +'"></div>';
						}
						html += '<td col="'+ i +'" class="w2ui-head '+ sortStyle + reorderCols + '" ' +
								'	onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);">'+
									resizer +
								'	<div class="w2ui-col-header '+ (sortStyle ? 'w2ui-col-sorted' : '') +'">'+
								'		<div class="'+ sortStyle +'"></div>'+
										(!col.caption ? '&nbsp;' : col.caption) +
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
			if (this.total > end && String(tr2.prev().prop('id')).indexOf('_expanded_row') != -1) tr2.prev().remove();
			var first = parseInt(tr1.next().attr('line'));
			var last  = parseInt(tr2.prev().attr('line'));
			//$('#log').html('buffer: '+ this.buffered +' start-end: ' + start + '-'+ end + ' ===> first-last: ' + first + '-' + last);
			if (first < start || first == 1 || this.last.pull_refresh) { // scroll down
				// console.log('end', end, 'last', last, 'show_extre', this.show_extra, this.last.pull_refresh);
				if (end <= last + this.show_extra - 2 && end != this.total) return;
				this.last.pull_refresh = false;
				// remove from top
				while (true) {
					var tmp = records.find('#grid_'+ this.name +'_rec_top').next();
					if (tmp.attr('line') == 'bottom') break;
					if (parseInt(tmp.attr('line')) < start) tmp.remove(); else break;
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
								obj.last.pull_more = true;
								obj.last.xhr_offset += obj.limit;
								obj.request('get-records');
								// show spinner the last
								$(this).find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>');
							});
					}
					if (more.find('td').text().indexOf('Load') == -1) {
						more.find('td').html('<div>'+ w2utils.lang('Load') + ' ' + obj.limit + ' ' + w2utils.lang('More') + '...</div>');
					}
				}
			}
			// check for grid end
			if (this.buffered >= this.total - this.offset) $('#grid_'+ this.name +'_rec_more').hide();
			return;

			function markSearch() {
				// mark search
				if(obj.markSearch === false) return;
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
			var sel = this.last.selection;
			var record;
			// first record needs for resize purposes
			if (ind == -1) {
				rec_html += '<tr line="0">';
				if (this.show.lineNumbers)  rec_html += '<td class="w2ui-col-number" style="height: 0px;"></td>';
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
			if (sel.indexes.indexOf(ind) != -1) isRowSelected = true;
			// render TR
			rec_html += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" '+
				' class="'+ (lineNum % 2 == 0 ? 'w2ui-even' : 'w2ui-odd') + (isRowSelected && this.selectType == 'row' ? ' w2ui-selected' : '') + (record.expanded === true ? ' w2ui-expanded' : '') + '" ' +
				(summary !== true ?
					(this.isIOS ?
						'	onclick  = "w2ui[\''+ this.name +'\'].dblClick(\''+ record.recid +'\', event);"'
						:
						'	onclick	 = "w2ui[\''+ this.name +'\'].click(\''+ record.recid +'\', event);"'+
						'	oncontextmenu = "w2ui[\''+ this.name +'\'].contextMenu(\''+ record.recid +'\', event); '+
						'		if (event.preventDefault) event.preventDefault();"'
					 )
					: ''
				) +
				' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && typeof record['style'] == 'string' ? record['style'] : '') +'" '+
					( typeof record['style'] == 'string' ? 'custom_style="'+ record['style'] +'"' : '') +
				'>';
			if (this.show.lineNumbers) {
				rec_html += '<td id="grid_'+ this.name +'_cell_'+ ind +'_number' + (summary ? '_s' : '') + '" class="w2ui-col-number">'+
								(summary !== true ? '<div>'+ lineNum +'</div>' : '') +
							'</td>';
			}
			if (this.show.selectColumn) {
				rec_html +=
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_select' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-select" '+
						'		onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
							(summary !== true ?
							'	<div>'+
							'		<input class="w2ui-grid-select-check" type="checkbox" tabIndex="-1"'+
							'			'+ (isRowSelected ? 'checked="checked"' : '') +
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
						'<td id="grid_'+ this.name +'_cell_'+ ind +'_expand' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-expand">'+
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
				var isChanged = !summary && record.changes && typeof record.changes[col.field] != 'undefined';
				var rec_cell  = this.getCellHTML(ind, col_ind, summary);
				var addStyle  = '';
				if (typeof col.render == 'string') {
					var tmp = col.render.toLowerCase().split(':');
					if (['number', 'int', 'float', 'money', 'currency', 'percent'].indexOf(tmp[0]) != -1) addStyle += 'text-align: right;';
				}
				if (typeof record.style == 'object' && typeof record.style[col_ind] == 'string') {
					addStyle += record.style[col_ind] + ';';
				}
				var isCellSelected = false;
				if (isRowSelected && $.inArray(col_ind, sel.columns[ind]) != -1) isCellSelected = true;
				rec_html += '<td class="w2ui-grid-data'+ (isCellSelected ? ' w2ui-selected' : '') + (isChanged ? ' w2ui-changed' : '') +'" col="'+ col_ind +'" '+
							'	style="'+ addStyle + (typeof col.style != 'undefined' ? col.style : '') +'" '+
										  (typeof col.attr != 'undefined' ? col.attr : '') +'>'+
								rec_cell +
							'</td>';
				col_ind++;
				if (typeof this.columns[col_ind] == 'undefined') break;
			}
			rec_html += '<td class="w2ui-grid-data-last"></td>';
			rec_html += '</tr>';
			return rec_html;
		},

		getCellHTML: function (ind, col_ind, summary) {
			var col  	= this.columns[col_ind];
			var record 	= (summary !== true ? this.records[ind] : this.summary[ind]);
			var data 	= this.getCellValue(ind, col_ind, summary);
			var edit 	= col.editable;
			// various renderers
			if (typeof col.render != 'undefined') {
				if (typeof col.render == 'function') {
					data = $.trim(col.render.call(this, record, ind, col_ind));
					if (data.length < 4 || data.substr(0, 4).toLowerCase() != '<div') data = '<div>' + data + '</div>';
				}
				if (typeof col.render == 'object')   data = '<div>' + col.render[data] + '</div>';
				if (typeof col.render == 'string') {
					var tmp = col.render.toLowerCase().split(':');
					var prefix = '';
					var suffix = '';
					if (['number', 'int', 'float', 'money', 'currency', 'percent'].indexOf(tmp[0]) != -1) {
						if (typeof tmp[1] == 'undefined' || !w2utils.isInt(tmp[1])) tmp[1] = 0;
						if (tmp[1] > 20) tmp[1] = 20;
						if (tmp[1] < 0)  tmp[1] = 0;
						if (['money', 'currency'].indexOf(tmp[0]) != -1) { tmp[1] = w2utils.settings.currencyPrecision; prefix = w2utils.settings.currencyPrefix; suffix = w2utils.settings.currencySuffix }
						if (tmp[0] == 'percent') { suffix = '%'; if (tmp[1] !== '0') tmp[1] = 1; }
						if (tmp[0] == 'int')	 { tmp[1] = 0; }
						// format
						data = '<div>' + (data !== '' ? prefix + w2utils.formatNumber(Number(data).toFixed(tmp[1])) + suffix : '') + '</div>';
					}
					if (tmp[0] == 'time') {
						if (typeof tmp[1] == 'undefined' || tmp[1] == '') tmp[1] = w2utils.settings.time_format;
						data = '<div>' + prefix + w2utils.formatTime(data, tmp[1] == 'h12' ? 'hh:mi pm': 'h24:min') + suffix + '</div>';
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
				// if editable checkbox
				var addStyle = '';
				if (edit && ['checkbox', 'check'].indexOf(edit.type) != -1) {
					var changeInd = summary ? -(ind + 1) : ind;
					addStyle = 'text-align: center';
					data = '<input type="checkbox" '+ (data ? 'checked' : '') +' onclick="' +
						   '	var obj = w2ui[\''+ this.name + '\']; '+
						   '	obj.editChange.call(obj, this, '+ changeInd +', '+ col_ind +', event); ' +
						   '">';
				}
				if (!this.show.recordTitles) {
					var data = '<div style="'+ addStyle +'">'+ data +'</div>';
				} else {
					// title overwrite
					var title = String(data).replace(/"/g, "''");
					if (typeof col.title != 'undefined') {
						if (typeof col.title == 'function') title = col.title.call(this, record, ind, col_ind);
						if (typeof col.title == 'string')   title = col.title;
					}
					var data = '<div title="'+ title +'" style="'+ addStyle +'">'+ data +'</div>';
				}
			}
			if (data == null || typeof data == 'undefined') data = '';
			return data;
		},

		getCellValue: function (ind, col_ind, summary) {
			var col  	= this.columns[col_ind];
			var record 	= (summary !== true ? this.records[ind] : this.summary[ind]);
			var data 	= this.parseField(record, col.field);
			if (record.changes && typeof record.changes[col.field] != 'undefined') data = record.changes[col.field];
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
				if (sel.length == 1) this.toolbar.enable('w2ui-edit'); else this.toolbar.disable('w2ui-edit');
				if (sel.length >= 1) this.toolbar.enable('w2ui-delete'); else this.toolbar.disable('w2ui-delete');
			}
		},

		lock: function (msg, showSpinner) {
			var box  = $(this.box).find('> div:first-child');
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(box);
			setTimeout(function () { w2utils.lock.apply(window, args); }, 10);
		},

		unlock: function () {
			var box = this.box;
			setTimeout(function () { w2utils.unlock(box); }, 25); // needed timer so if server fast, it will not flash
		},

		parseField: function (obj, field) {
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
		},

		prepareData: function () {
			// loops thru records and prepares date and time objects
			for (var r in this.records) {
				var rec = this.records[r];
				for (var c in this.columns) {
					var column = this.columns[c];
					if (rec[column.field] == null || typeof column.render != 'string') continue;
					// number
					if (['number', 'int', 'float', 'money', 'currency', 'percent'].indexOf(column.render.split(':')[0])  != -1) {
						if (typeof rec[column.field] != 'number') rec[column.field] = parseFloat(rec[column.field]);
					}
					// date
					if (['date', 'age'].indexOf(column.render) != -1) {
						if (!rec[column.field + '_']) {
							var dt = rec[column.field];
							if (w2utils.isInt(dt)) dt = parseInt(dt);
							rec[column.field + '_'] = new Date(dt);
						}
					}
					// time
					if (['time'].indexOf(column.render) != -1) {
						if (w2utils.isTime(rec[column.field])) { // if string
							var tmp = w2utils.isTime(rec[column.field], true);
							var dt = new Date();
							dt.setHours(tmp.hours, tmp.minutes, (tmp.seconds ? tmp.seconds : 0), 0); // sets hours, min, sec, mills
							if (!rec[column.field + '_']) rec[column.field + '_'] = dt;
						} else { // if date object
							var tmp = rec[column.field];
							if (w2utils.isInt(tmp)) tmp = parseInt(tmp);
							var tmp = (tmp != null ? new Date(tmp) : new Date());
							var dt  = new Date();
							dt.setHours(tmp.getHours(), tmp.getMinutes(), tmp.getSeconds(), 0); // sets hours, min, sec, mills
							if (!rec[column.field + '_']) rec[column.field + '_'] = dt;
						}
					}
				}
			}
		},

		nextCell: function (col_ind, editable) {
			var check = col_ind + 1;
			if (this.columns.length == check) return false;
			if (editable === true) {
				var edit = this.columns[check].editable;
				if (this.columns[check].hidden || typeof edit == 'undefined'
					|| (edit && ['checkbox', 'check'].indexOf(edit.type) != -1)) return this.nextCell(check, editable);
			}
			return check;
		},

		prevCell: function (col_ind, editable) {
			var check = col_ind - 1;
			if (check < 0) return false;
			if (editable === true) {
				var edit = this.columns[check].editable;
				if (this.columns[check].hidden || typeof edit == 'undefined'
					|| (edit && ['checkbox', 'check'].indexOf(edit.type) != -1)) return this.prevCell(check, editable);
			}
			return check;
		},

		nextRow: function (ind) {
			if ((ind + 1 < this.records.length && this.last.searchIds.length == 0) // if there are more records
					|| (this.last.searchIds.length > 0 && ind < this.last.searchIds[this.last.searchIds.length-1])) {
				ind++;
				if (this.last.searchIds.length > 0) {
					while (true) {
						if ($.inArray(ind, this.last.searchIds) != -1 || ind > this.records.length) break;
						ind++;
					}
				}
				return ind;
			} else {
				return null;
			}
		},

		prevRow: function (ind) {
			if ((ind > 0 && this.last.searchIds.length == 0)  // if there are more records
					|| (this.last.searchIds.length > 0 && ind > this.last.searchIds[0])) {
				ind--;
				if (this.last.searchIds.length > 0) {
					while (true) {
						if ($.inArray(ind, this.last.searchIds) != -1 || ind < 0) break;
						ind--;
					}
				}
				return ind;
			} else {
				return null;
			}
		}
	};

	$.extend(w2grid.prototype, w2utils.event);
	w2obj.grid = w2grid;
})();
