/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2grid        - grid widget
*        - $().w2grid    - jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2toolbar, w2fields, w2alert, w2confirm
*
* == NICE TO HAVE ==
*   - allow this.total to be unknown (-1)
*   - column autosize based on largest content
*   - easy bubbles in the grid
*   - More than 2 layers of header groups
*   - reorder columns/records
*   - hidden searches could not be clearned by the user
*   - problem with .set() and arrays, array get extended too, but should be replaced
*   - move events into prototype
*   - after edit stay on the same record option
*   - allow render: function to be filters
*   - if supplied array of ids, get should return array of records
*   - row drag and drop has bugs
*   - header filtration ?? not sure
*   - allow functions in routeData (also add routeData to list/enum)
*   - implement global routeData and all elements read from there
*   - send parsed URL to the event if there is routeData
*   - if you set searchData or sortData and call refresh() it should work
*   - bug: vs_start = 100 and more then 500 records, when scrolling empty sets
*   - use column field for style: { 1: 'color: red' }
*   - unselect fires too many times (if many is unselected, one event should fire)
*   - add selectType: 'none' so that no selection can be make but with mouse
*   - reorder records with frozen columns
*   - focus/blur for selectType = cell not display grayed out selection
*   - frozen columns 
        - load more only on the right side
        - scrolling on frozen columns is not working only on regular columns
*   - copy or large number of records is slow
*
* == 1.5 changes
*   - $('#grid').w2grid() - if called w/o argument then it returns grid object
*   - added statusRange     : true,
*           statusBuffered  : false,
*           statusRecordID  : true,
*           statusSelection : true,
*           statusResponse  : true,
*           statusSort      : true,
*           statusSearch    : true,
*   - change selectAll() and selectNone() - return time it took
*   - added vs_start and vs_extra
*   - added update() - updates only data in the grid
*   - add to docs onColumnDragStart, onColumnDragEnd
*   - onSelect and onSelect should fire 1 time for selects with shift or selectAll(), selectNone()
*   - record.style[field_name]
*   - added focus(), blur(), onFocus, onBlur
*   - added search.operator
*   - refactor reorderRow (not finished)
*   - return JSON can now have summary array
*   - frozen columns
*   - added selectionSave, selectionRestore - for internal use
*   - added additional search filter options for int, float, date, time
*   - added getLineHTML
*   - added lineNumberWidth
*   - add searches.style
*   - getColumn without params returns fields of all columns
*   - getSearch without params returns fields of all searches
*   - added column.tooltip
*   - added hasFocus, refactored w2utils.keyboard
*   - do not clear selection when clicked and it was not in focus
*   - added record.w2ui.colspan
*   - editable area extands with typing
*   - removed onSubmit and onDeleted - now it uses onSave and onDelete
*   - added record.w2ui.softspan
*   - added refreshSpans
*
************************************************************************/

(function () {
    var w2grid = function(options) {

        // public properties
        this.name         = null;
        this.box          = null;     // HTML element that hold this element
        this.header       = '';
        this.url          = '';
        this.routeData    = {};       // data for dynamic routes
        this.columns      = [];       // { field, caption, size, attr, render, hidden, gridMinWidth, editable }
        this.columnGroups = [];       // { span: int, caption: 'string', master: true/false }
        this.records      = [];       // { recid: int(requied), field1: 'value1', ... fieldN: 'valueN', style: 'string', editable: true/false, summary: true/false, changes: object }
        this.summary      = [];       // arry of summary records, same structure as records array
        this.searches     = [];       // { type, caption, field, inTag, outTag, hidden }
        this.searchData   = [];
        this.sortData     = [];
        this.postData     = {};
        this.toolbar      = {};       // if not empty object; then it is toolbar object

        this.show = {
            header          : false,
            toolbar         : false,
            footer          : false,
            columnHeaders   : true,
            lineNumbers     : false,
            expandColumn    : false,
            selectColumn    : false,
            emptyRecords    : true,
            toolbarReload   : true,
            toolbarColumns  : true,
            toolbarSearch   : true,
            toolbarAdd      : false,
            toolbarEdit     : false,
            toolbarDelete   : false,
            toolbarSave     : false,
            statusRange     : true,
            statusBuffered  : false,
            statusRecordID  : true,
            statusSelection : true,
            statusResponse  : true,
            statusSort      : true,
            statusSearch    : true,
            recordTitles    : true,
            selectionBorder : true,
            skipRecords     : true
        };

        this.hasFocus        = false;
        this.autoLoad        = true;     // for infinite scroll
        this.fixedBody       = true;     // if false; then grid grows with data
        this.recordHeight    = 24;
        this.lineNumberWidth = null;
        this.vs_start        = 300;
        this.vs_extra        = 15;
        this.keyboard        = true;
        this.selectType      = 'row';    // can be row|cell
        this.multiSearch     = true;
        this.multiSelect     = true;
        this.multiSort       = true;
        this.reorderColumns  = false;
        this.reorderRows     = false;
        this.markSearch      = true;
        this.columnTooltip   = 'normal'; // can be normal, top, bottom, left, right

        this.total   = 0;     // server total
        this.limit   = 100;
        this.offset  = 0;     // how many records to skip (for infinite scroll) when pulling from server
        this.style   = '';
        this.ranges  = [];
        this.menu    = [];
        this.method  = null;         // if defined, then overwrited ajax method
        this.recid   = null;
        this.parser  = null;

        // events
        this.onAdd              = null;
        this.onEdit             = null;
        this.onRequest          = null;        // called on any server event
        this.onLoad             = null;
        this.onDelete           = null;
        this.onSave             = null;
        this.onSelect           = null;
        this.onUnselect         = null;
        this.onClick            = null;
        this.onDblClick         = null;
        this.onContextMenu      = null;
        this.onMenuClick        = null;        // when context menu item selected
        this.onColumnClick      = null;
        this.onColumnResize     = null;
        this.onSort             = null;
        this.onSearch           = null;
        this.onChange           = null;        // called when editable record is changed
        this.onRestore          = null;        // called when editable record is restored
        this.onExpand           = null;
        this.onCollapse         = null;
        this.onError            = null;
        this.onKeydown          = null;
        this.onToolbar          = null;     // all events from toolbar
        this.onColumnOnOff      = null;
        this.onCopy             = null;
        this.onPaste            = null;
        this.onSelectionExtend  = null;
        this.onEditField        = null;
        this.onRender           = null;
        this.onRefresh          = null;
        this.onReload           = null;
        this.onResize           = null;
        this.onDestroy          = null;
        this.onStateSave        = null;
        this.onStateRestore     = null;
        this.onFocus            = null;
        this.onBlur             = null;
        this.onReorderRow       = null;

        // internal
        this.last = {
            field     : 'all',
            caption   : w2utils.lang('All Fields'),
            logic     : 'OR',
            search    : '',
            searchIds : [],
            selection : {
                indexes : [],
                columns : {}
            },
            multi       : false,
            scrollTop   : 0,
            scrollLeft  : 0,
            sortData    : null,
            sortCount   : 0,
            xhr         : null,
            range_start : null,
            range_end   : null,
            sel_ind     : null,
            sel_col     : null,
            sel_type    : null,
            edit_col    : null
        };

        $.extend(true, this, w2obj.grid, options);
    };

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2grid = function(method) {
        if ($.isPlainObject(method)) {
            // check name parameter
            if (!w2utils.checkName(method, 'w2grid')) return;
            // remember items
            var columns      = method.columns;
            var columnGroups = method.columnGroups;
            var records      = method.records;
            var searches     = method.searches;
            var searchData   = method.searchData;
            var sortData     = method.sortData;
            var postData     = method.postData;
            var toolbar      = method.toolbar;
            // extend items
            var object = new w2grid(method);
            $.extend(object, { postData: {}, records: [], columns: [], searches: [], toolbar: {}, sortData: [], searchData: [], handlers: [] });
            if (object.onExpand != null) object.show.expandColumn = true;
            $.extend(true, object.toolbar, toolbar);
            // reassign variables
            if (columns)      for (var p = 0; p < columns.length; p++)      object.columns[p]       = $.extend(true, {}, columns[p]);
            if (columnGroups) for (var p = 0; p < columnGroups.length; p++) object.columnGroups[p]  = $.extend(true, {}, columnGroups[p]);
            if (searches)     for (var p = 0; p < searches.length; p++)     object.searches[p]      = $.extend(true, {}, searches[p]);
            if (searchData)   for (var p = 0; p < searchData.length; p++)   object.searchData[p]    = $.extend(true, {}, searchData[p]);
            if (sortData)     for (var p = 0; p < sortData.length; p++)     object.sortData[p]      = $.extend(true, {}, sortData[p]);
            object.postData = $.extend(true, {}, postData);

            // check if there are records without recid
            if (records) for (var r = 0; r < records.length; r++) {
                if (records[r].recid == null && records[r][object.recid] == null) {
                    console.log('ERROR: Cannot add records without recid. (obj: '+ object.name +')');
                    return;
                }
                object.records[r] = $.extend(true, {}, records[r]);
            }
            // add searches
            for (var i = 0; i < object.columns.length; i++) {
                var col = object.columns[i];
                if (col.searchable == null || col.searchable === false || object.getSearch(col.field) != null) continue;
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

        } else {
            var obj = w2ui[$(this).attr('name')];
            if (!obj) return null;
            if (arguments.length > 0) {
                if (obj[method]) obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
                return this;
            } else {
                return obj;
            }
        }
    };

    // ====================================================
    // -- Implementation of core functionality

    w2grid.prototype = {
        msgDelete       : 'Are you sure you want to delete selected records?',
        msgNotJSON      : 'Returned data is not in valid JSON format.',
        msgAJAXerror    : 'AJAX error. See console for more details.',
        msgRefresh      : 'Refreshing...',
        msgNeedReload   : 'Your remove data source record count has changed, reloading from the first record.',

        buttons: {
            'reload'   : { type: 'button', id: 'w2ui-reload', icon: 'w2ui-icon-reload', tooltip: 'Reload data in the list' },
            'columns'  : { type: 'drop', id: 'w2ui-column-on-off', icon: 'w2ui-icon-columns', tooltip: 'Show/hide columns', arrow: false, html: '' },
            'search'   : { type: 'html',   id: 'w2ui-search',
                            html: '<div class="w2ui-icon icon-search-down w2ui-search-down" title="'+ w2utils.lang('Select Search Field') +'" '+
                                  'onclick="var obj = w2ui[$(this).parents(\'div.w2ui-grid\').attr(\'name\')]; obj.searchShowFields();"></div>'
                          },
            'search-go': { type: 'drop',  id: 'w2ui-search-advanced', icon: 'w2ui-icon-search', text: 'Search', tooltip: 'Open Search Fields' },
            'add'      : { type: 'button', id: 'w2ui-add', text: 'Add New', tooltip: 'Add new record', icon: 'w2ui-icon-plus' },
            'edit'     : { type: 'button', id: 'w2ui-edit', text: 'Edit', tooltip: 'Edit selected record', icon: 'w2ui-icon-pencil', disabled: true },
            'delete'   : { type: 'button', id: 'w2ui-delete', text: 'Delete', tooltip: 'Delete selected records', icon: 'w2ui-icon-cross', disabled: true },
            'save'     : { type: 'button', id: 'w2ui-save', text: 'Save', tooltip: 'Save changed records', icon: 'w2ui-icon-check' }
        },

        add: function (record, first) {
            if (!$.isArray(record)) record = [record];
            var added = 0;
            for (var i = 0; i < record.length; i++) {
                if (record[i].recid == null && record[i][this.recid] == null) {
                    console.log('ERROR: Cannot add record without recid. (obj: '+ this.name +')');
                    continue;
                }
                if (first) this.records.unshift(record[i]); else this.records.push(record[i]);
                added++;
            }
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
            if (obj == null) obj = {};
            var recs    = [];
            var hasDots = false;
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
                noRefresh = record;
                record    = recid;
                recid     = null;
            }
            // update all records
            if (recid == null) {
                for (var i = 0; i < this.records.length; i++) {
                    $.extend(true, this.records[i], record); // recid is the whole record
                }
                if (noRefresh !== true) this.refresh();
            } else { // find record to update
                var ind = this.get(recid, true);
                if (ind == null) return false;
                var isSummary = (this.records[ind] && this.records[ind].recid == recid ? false : true);
                if (isSummary) {
                    $.extend(true, this.summary[ind], record);
                } else {
                    $.extend(true, this.records[ind], record);
                }
                if (noRefresh !== true) this.refreshRow(recid, ind); // refresh only that record
            }
            return true;
        },

        get: function (recid, returnIndex) {
            // search records
            for (var i = 0; i < this.records.length; i++) {
                if (this.records[i].recid == recid) {
                    if (returnIndex === true) return i; else return this.records[i];
                }
            }
            // search summary
            for (var i = 0; i < this.summary.length; i++) {
                if (this.summary[i].recid == recid) {
                    if (returnIndex === true) return i; else return this.summary[i];
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
                for (var r = this.summary.length-1; r >= 0; r--) {
                    if (this.summary[r].recid == arguments[a]) { this.summary.splice(r, 1); removed++; }
                }
            }
            var url = (typeof this.url != 'object' ? this.url : this.url.get);
            if (!url) {
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
            for (var i = 0; i < columns.length; i++) {
                this.columns.splice(before, 0, columns[i]);
                // if column is searchable, add search field
                if (columns[i].searchable) {
                    var stype = columns[i].searchable;
                    var attr  = '';
                    if (columns[i].searchable === true) { stype = 'text'; attr = 'size="20"'; }
                    this.addSearch({ field: columns[i].field, caption: columns[i].caption, type: stype, attr: attr });
                }
                before++;
                added++;
            }
            this.refresh();
            return added;
        },

        removeColumn: function () {
            var removed = 0;
            for (var a = 0; a < arguments.length; a++) {
                for (var r = this.columns.length-1; r >= 0; r--) {
                    if (this.columns[r].field == arguments[a]) {
                        if (this.columns[r].searchable) this.removeSearch(arguments[a]);
                        this.columns.splice(r, 1);
                        removed++;
                    }
                }
            }
            this.refresh();
            return removed;
        },

        getColumn: function (field, returnIndex) {
            // no arguments - return fields of all columns
            if (arguments.length == 0) {
                var ret = [];
                for (var i = 0; i < this.columns.length; i++) ret.push(this.columns[i].field);
                return ret;
            }
            // find column
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
                    var col = this.columns[r];
                    if (col.field == arguments[a]) {
                        col.hidden = !col.hidden;
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
                    var col = this.columns[r];
                    if (col.gridMinWidth) delete col.gridMinWidth;
                    if (col.field == arguments[a] && col.hidden !== false) {
                        col.hidden = false;
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
                    var col = this.columns[r];
                    if (col.field == arguments[a] && col.hidden !== true) {
                        col.hidden = true;
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
            for (var i = 0; i < search.length; i++) {
                this.searches.splice(before, 0, search[i]);
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
            // no arguments - return fields of all searches
            if (arguments.length == 0) {
                var ret = [];
                for (var i = 0; i < this.searches.length; i++) ret.push(this.searches[i].field);
                return ret;
            }
            // find search
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
            for (var i = 0; i < this.searchData.length; i++) {
                if (this.searchData[i].field == field) return this.searchData[i];
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
            var obj  = this;
            // process date fields
            obj.selectionSave();
            obj.prepareData();
            obj.reset();
            // process sortData
            for (var i = 0; i < this.sortData.length; i++) {
                var column = this.getColumn(this.sortData[i].field);
                if (!column) return;
                if (typeof column.render == 'string') {
                    if (['date', 'age'].indexOf(column.render.split(':')[0]) != -1) {
                        this.sortData[i]['field_'] = column.field + '_';
                    }
                    if (['time'].indexOf(column.render.split(':')[0]) != -1) {
                        this.sortData[i]['field_'] = column.field + '_';
                    }
                }
            }
            // process sort
            this.records.sort(function (a, b) {
                var ret = 0;
                for (var i = 0; i < obj.sortData.length; i++) {
                    var fld = obj.sortData[i].field;
                    if (obj.sortData[i].field_) fld = obj.sortData[i].field_;
                    var aa = a[fld];
                    var bb = b[fld];
                    if (String(fld).indexOf('.') != -1) {
                        aa = obj.parseField(a, fld);
                        bb = obj.parseField(b, fld);
                    }
                    if (typeof aa == 'string') aa = $.trim(aa.toLowerCase());
                    if (typeof bb == 'string') bb = $.trim(bb.toLowerCase());
                    if (aa > bb) ret = (obj.sortData[i].direction == 'asc' ? 1 : -1);
                    if (aa < bb) ret = (obj.sortData[i].direction == 'asc' ? -1 : 1);
                    if (typeof aa != 'object' && typeof bb == 'object') ret = -1;
                    if (typeof bb != 'object' && typeof aa == 'object') ret = 1;
                    if (aa == null && bb != null) ret = 1;    // all nuls and undefined on bottom
                    if (aa != null && bb == null) ret = -1;
                    if (ret != 0) break;
                }
                return ret;
            });
            obj.selectionRestore();
            time = (new Date()).getTime() - time;
            if (silent !== true && obj.show.statusSort) {
                setTimeout(function () {
                    obj.status(w2utils.lang('Sorting took') + ' ' + time/1000 + ' ' + w2utils.lang('sec'));
                }, 10);
            }
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
                for (var i = 0; i < this.records.length; i++) {
                    var rec = this.records[i];
                    var fl  = 0;
                    for (var j = 0; j < this.searchData.length; j++) {
                        var sdata      = this.searchData[j];
                        var search     = this.getSearch(sdata.field);
                        if (sdata  == null) continue;
                        if (search == null) search = { field: sdata.field, type: sdata.type };
                        var val1b = obj.parseField(rec, search.field);
                        var val1  = String(val1b).toLowerCase();
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
                                if (obj.parseField(rec, search.field) == sdata.value) fl++; // do not hide record
                                // only increment "fl" once -> use "else if"
                                else if (search.type == 'date') {
                                    var tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field));
                                    var val1 = w2utils.formatDate(tmp, 'yyyy-mm-dd');
                                    var val2 = w2utils.formatDate(val2, 'yyyy-mm-dd');
                                    if (val1 == val2) fl++;
                                }
                                // only increment "fl" once -> use "else if"
                                else if (search.type == 'time') {
                                    var tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field));
                                    var val1 = w2utils.formatTime(tmp, 'h24:mi');
                                    var val2 = w2utils.formatTime(val2, 'h24:mi');
                                    if (val1 == val2) fl++;
                                }
                                break;
                            case 'between':
                                if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                                    if (parseFloat(obj.parseField(rec, search.field)) >= parseFloat(val2) && parseFloat(obj.parseField(rec, search.field)) <= parseFloat(val3)) fl++;
                                }
                                if (search.type == 'date') {
                                    var val1 = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field));
                                    var val2 = w2utils.isDate(val2, w2utils.settings.date_format, true);
                                    var val3 = w2utils.isDate(val3, w2utils.settings.date_format, true);
                                    if (val3 != null) val3 = new Date(val3.getTime() + 86400000); // 1 day
                                    if (val1 >= val2 && val1 < val3) fl++;
                                }
                                if (search.type == 'time') {
                                    var val1 = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field));
                                    var val2 = w2utils.isTime(val2, true);
                                    var val3 = w2utils.isTime(val3, true);
                                    val2 = (new Date()).setHours(val2.hours, val2.minutes, val2.seconds ? val2.seconds : 0, 0);
                                    val3 = (new Date()).setHours(val3.hours, val3.minutes, val3.seconds ? val3.seconds : 0, 0);
                                    if (val1 >= val2 && val1 < val3) fl++;
                                }
                                break;
                            case 'less':
                                if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                                    if (parseFloat(obj.parseField(rec, search.field)) <= parseFloat(sdata.value)) fl++;
                                }
                                else if (search.type == 'date') {
                                    var tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field));
                                    var val1 = w2utils.formatDate(tmp, 'yyyy-mm-dd');
                                    var val2 = w2utils.formatDate(val2, 'yyyy-mm-dd');
                                    if (val1 <= val2) fl++;
                                }
                                else if (search.type == 'time') {
                                    var tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field));
                                    var val1 = w2utils.formatTime(tmp, 'h24:mi');
                                    var val2 = w2utils.formatTime(val2, 'h24:mi');
                                    if (val1 <= val2) fl++;
                                }
                                break;
                            case 'more':
                                if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                                    if (parseFloat(obj.parseField(rec, search.field)) >= parseFloat(sdata.value)) fl++;
                                }
                                else if (search.type == 'date') {
                                    var tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field));
                                    var val1 = w2utils.formatDate(tmp, 'yyyy-mm-dd');
                                    var val2 = w2utils.formatDate(val2, 'yyyy-mm-dd');
                                    if (val1 >= val2) fl++;
                                }
                                else if (search.type == 'time') {
                                    var tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field));
                                    var val1 = w2utils.formatTime(tmp, 'h24:mi');
                                    var val2 = w2utils.formatTime(val2, 'h24:mi');
                                    if (val1 >= val2) fl++;
                                }
                                break;
                            case 'in':
                                var tmp = sdata.value;
                                if (sdata.svalue) tmp = sdata.svalue;
                                if (tmp.indexOf(w2utils.isFloat(val1) ? parseFloat(val1) : val1) !== -1) fl++;
                                if (tmp.indexOf(w2utils.isFloat(val1b) ? parseFloat(val1b) : val1b) !== -1) fl++;
                                break;
                            case 'not in':
                                var tmp = sdata.value;
                                if (sdata.svalue) tmp = sdata.svalue;
                                if (tmp.indexOf(w2utils.isFloat(val1) ? parseFloat(val1) : val1) == -1) fl++;
                                if (tmp.indexOf(w2utils.isFloat(val1b) ? parseFloat(val1b) : val1b) == -1) fl++;
                                break;
                            case 'begins':
                            case 'begins with': // need for back compatib.
                                if (val1.indexOf(val2) == 0) fl++; // do not hide record
                                break;
                            case 'contains':
                                if (val1.indexOf(val2) >= 0) fl++; // do not hide record
                                break;
                            case 'ends':
                            case 'ends with': // need for back compatib.
                                var lastIndex = val1.lastIndexOf(val2);
                                if (lastIndex !== -1 && lastIndex == val1.length - val2.length) fl++; // do not hide record
                                break;
                        }
                    }
                    if ((this.last.logic == 'OR' && fl != 0) || (this.last.logic == 'AND' && fl == this.searchData.length)) {
                        this.last.searchIds.push(parseInt(i));
                    }
                }
                this.total = this.last.searchIds.length;
            }
            time = (new Date()).getTime() - time;
            if (silent !== true && obj.show.statusSearch) {
                setTimeout(function () {
                    obj.status(w2utils.lang('Search took') + ' ' + time/1000 + ' ' + w2utils.lang('sec'));
                }, 10);
            }
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
            for (var i = 0; i < ranges.length; i++) {
                if (typeof ranges[i] != 'object') ranges[i] = { name: 'selection' };
                if (ranges[i].name == 'selection') {
                    if (this.show.selectionBorder === false) continue;
                    var sel = this.getSelection();
                    if (sel.length == 0) {
                        this.removeRange('selection');
                        continue;
                    } else {
                        var first = sel[0];
                        var last  = sel[sel.length-1];
                    }
                } else { // other range
                    var first = ranges[i].range[0];
                    var last  = ranges[i].range[1];
                }
                if (first) {
                    var rg = {
                        name: ranges[i].name,
                        range: [{ recid: first.recid, column: first.column }, { recid: last.recid, column: last.column }],
                        style: ranges[i].style || ''
                    };
                    // add range
                    var ind = false;
                    for (var j = 0; j < this.ranges.length; j++) if (this.ranges[j].name == ranges[i].name) { ind = j; break; }
                    if (ind !== false) {
                        this.ranges[ind] = rg;
                    } else {
                        this.ranges.push(rg);
                    }
                    added++;
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
                $('#grid_'+ this.name +'_f'+ name).remove();
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
            if (this.ranges.length == 0) return;
            var obj  = this;
            var time = (new Date()).getTime();
            var rec1 = $('#grid_'+ this.name +'_frecords');
            var rec2 = $('#grid_'+ this.name +'_records');
            for (var i = 0; i < this.ranges.length; i++) {
                var rg    = this.ranges[i];
                var first = rg.range[0];
                var last  = rg.range[1];
                if (first.index == null) first.index = this.get(first.recid, true);
                if (last.index == null) last.index = this.get(last.recid, true);
                var td1   = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(first.recid) + ' td[col="'+ first.column +'"]');
                var td2   = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(last.recid) + ' td[col="'+ last.column +'"]');
                var td1f  = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(first.recid) + ' td[col="'+ first.column +'"]');
                var td2f  = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(last.recid) + ' td[col="'+ last.column +'"]');

                // if virtual scrolling kicked in
                var index_top     = parseInt($('#grid_'+ this.name +'_rec_top').next().attr('index'));
                var index_bottom  = parseInt($('#grid_'+ this.name +'_rec_bottom').prev().attr('index'));
                var index_ftop    = parseInt($('#grid_'+ this.name +'_frec_top').next().attr('index'));
                var index_fbottom = parseInt($('#grid_'+ this.name +'_frec_bottom').prev().attr('index'));
                if (td1.length == 0 && first.index < index_top && last.index > index_top) {
                    td1 = $('#grid_'+ this.name +'_rec_top').next().find('td[col='+ first.column +']');
                }
                if (td2.length == 0 && last.index > index_bottom && first.index < index_bottom) {
                    td2 = $('#grid_'+ this.name +'_rec_bottom').prev().find('td[col='+ last.column +']');
                }
                if (td1f.length == 0 && first.index < index_ftop && last.index > index_ftop) { // frozen
                    td1f = $('#grid_'+ this.name +'_frec_top').next().find('td[col='+ first.column +']');
                }
                if (td2f.length == 0 && last.index > index_fbottom && first.index < index_fbottom) {  // frozen
                    td2f = $('#grid_'+ this.name +'_frec_bottom').prev().find('td[col='+ last.column +']');
                }

                // do not show selection cell if it is editable
                var edit  = $(this.box).find('#grid_'+ this.name + '_editable');
                var tmp   = edit.find('.w2ui-input')
                var tmp1  = tmp.attr('recid');
                var tmp2  = tmp.attr('column');
                if (rg.name == 'selection' && rg.range[0].recid == tmp1 && rg.range[0].column == tmp2) continue;

                // frozen regular columns range
                var $range = $('#grid_'+ this.name +'_f'+ rg.name);
                if (td1f.length > 0 || td2f.length > 0) {
                    if ($range.length == 0) {
                        rec1.append('<div id="grid_'+ this.name +'_f' + rg.name +'" class="w2ui-selection" style="'+ rg.style +'">'+
                                        (rg.name == 'selection' ?  '<div id="grid_'+ this.name +'_resizer" class="w2ui-selection-resizer"></div>' : '')+
                                    '</div>');
                        $range = $('#grid_'+ this.name +'_f'+ rg.name);
                    } else {
                        $range.attr('style', rg.style);
                        $range.find('.w2ui-selection-resizer').show();
                    }
                    if (td2f.length == 0) {
                        td2f  = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(last.recid) +' td:last-child');
                        if (td2f.length == 0) td2f = $('#grid_'+ this.name +'_frec_bottom td:first-child');
                        $range.css('border-right', '0px');
                        $range.find('.w2ui-selection-resizer').hide();
                    }
                    if (first.recid != null && last.recid != null && td1f.length > 0 && td2f.length > 0) {
                        $range.show().css({
                            left    : (td1f.position().left - 1 + rec1.scrollLeft()) + 'px',
                            top     : (td1f.position().top - 1 + rec1.scrollTop()) + 'px',
                            width   : (td2f.position().left - td1f.position().left + td2f.width() + 3) + 'px',
                            height  : (td2f.position().top - td1f.position().top + td2f.height() + 3) + 'px'
                        });
                    } else {
                        $range.hide();
                    }
                } else {
                    $range.hide();
                }
                // regular columns range
                var $range = $('#grid_'+ this.name +'_'+ rg.name);
                if (td1.length > 0 || td2.length > 0) {
                    if ($range.length == 0) {
                        rec2.append('<div id="grid_'+ this.name +'_' + rg.name +'" class="w2ui-selection" style="'+ rg.style +'">'+
                                        (rg.name == 'selection' ?  '<div id="grid_'+ this.name +'_resizer" class="w2ui-selection-resizer"></div>' : '')+
                                    '</div>');
                        $range = $('#grid_'+ this.name +'_'+ rg.name);
                    } else {
                        $range.attr('style', rg.style);
                    }
                    if (td1.length == 0) {
                        td1 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(first.recid) +' td:first-child');
                        if (td1.length == 0) td1 = $('#grid_'+ this.name +'_rec_top td:first-child');
                        $range.css('border-left', '0px');
                    }
                    if (first.recid != null && last.recid != null && td1.length > 0 && td2.length > 0) {
                        $range.show().css({
                            left    : (td1.position().left - 1 + rec2.scrollLeft()) + 'px',
                            top     : (td1.position().top - 1 + rec2.scrollTop()) + 'px',
                            width   : (td2.position().left - td1.position().left + td2.width() + 3) + 'px',
                            height  : (td2.position().top - td1.position().top + td2.height() + 3) + 'px'
                        });
                    } else {
                        $range.hide();
                    }
                } else {
                    $range.hide();
                }
            }

            // add resizer events
            $(this.box).find('.w2ui-selection-resizer').off('mousedown').on('mousedown', mouseStart);
            var eventData = { phase: 'before', type: 'selectionExtend', target: obj.name, originalRange: null, newRange: null };

            return (new Date()).getTime() - time;

            function mouseStart (event) {
                var sel = obj.getSelection();
                obj.last.move = {
                    type   : 'expand',
                    x      : event.screenX,
                    y      : event.screenY,
                    divX   : 0,
                    divY   : 0,
                    recid  : sel[0].recid,
                    column : sel[0].column,
                    originalRange : [{ recid: sel[0].recid, column: sel[0].column }, { recid: sel[sel.length-1].recid, column: sel[sel.length-1].column }],
                    newRange      : [{ recid: sel[0].recid, column: sel[0].column }, { recid: sel[sel.length-1].recid, column: sel[sel.length-1].column }]
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
                    mv.newRange        = prevNewRange;
                    eventData.newRange = prevNewRange;
                    return;
                } else {
                    // default behavior
                    obj.removeRange('grid-selection-expand');
                    obj.addRange({
                        name  : 'grid-selection-expand',
                        range : eventData.newRange,
                        style : 'background-color: rgba(100,100,100,0.1); border: 2px dotted rgba(100,100,100,0.5);'
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
        },

        refreshSpans: function (recid) {
            var obj  = this;
            var time = (new Date()).getTime();
            // refresh soft spans
            var ids  = [];
            var $box = $(this.box);
            if (recid != null) {
                // both frozen and regular columns
                $box = $(this.box).find('#grid_'+ this.name +'_frec_'+ recid +', #grid_'+ this.name +'_rec_'+ recid);                
            }
            $box.find('.w2ui-soft-span').each(function () {
                var offset = $(this).parents('table').offset();
                var tmp = {
                    html : $(this).find('>div').html(),
                    top  : $(this).offset().top - offset.top + 1,
                    left : $(this).offset().left - offset.left + 1,
                    span : $(this).attr('softspan'),
                    col  : $(this).attr('col'),
                    row  : $(this).parent().attr('index'),
                    style: $(this).attr('style'),
                    width: $(this).attr('softwidth')
                };
                var $div = $('#grid_'+ obj.name +'_records').find('td:first-child > div');
                var css = {
                    "height"      : $(this).height() + 'px',
                    "padding"     : '5px 3px',
                    "font-size"   : $div.css('font-size'),
                    "font-family" : $div.css('font-family')
                };
                var id  = 'grid_'+ obj.name +'_softspan_'+ tmp.row +'_'+ tmp.col;
                var $el = $(obj.box).find('#'+id);
                // insert if does not exits or different width
                if ($el.length == 0 
                        || tmp.width != w2utils.getSize($el[0], 'width') 
                        || tmp.html != $el.html() 
                        || tmp.html != $el.attr('data-style')) {
                    $el.remove();
                    $(this).parents('table').parent()
                        .append('<div id="'+ id +'" recid="'+ obj.records[tmp.row].recid +'" index="'+ tmp.row +'" index="'+ tmp.column +'" '+
                            '   class="w2ui-soft-range" data-style="' + tmp.style + '"' +
                            '   style="'+ tmp.style +'; left: '+ tmp.left +'px; top: '+ tmp.top +'px; width: '+ tmp.width +'px">'+ 
                                tmp.html +
                            '</div>')
                    $(obj.box).find('#'+id).css(css);
                }
                $(this).find('>div').css('opacity', 0);
                ids.push(id);
            });
            // remove unused soft ranges
            $(this.box).find('.w2ui-soft-range').each(function () {
                if (ids.indexOf($(this).attr('id')) == -1) {
                    if (recid == null || $(this).attr('recid') == recid) $(this).remove();
                }
            });
            return (new Date()).getTime() - time;
        },

        select: function () {
            if (arguments.length == 0) return 0;
            var time = (new Date).getTime();
            var selected = 0;
            var sel = this.last.selection;
            if (!this.multiSelect) this.selectNone();

            // event before
            var tmp = { phase: 'before', type: 'select', target: this.name };
            if (arguments.length == 1) {
                tmp.multiple = false;
                if ($.isPlainObject(arguments[0])) {
                    tmp.recid  = arguments[0].recid;
                    tmp.column = arguments[0].column;
                } else {
                    tmp.recid = arguments[0];
                }
            } else {
                tmp.multiple = true;
                tmp.recids   = Array.prototype.slice.call(arguments, 0);
            }
            var eventData = this.trigger(tmp);
            if (eventData.isCancelled === true) return 0;

            // default action
            if (this.selectType == 'row') {
                for (var a = 0; a < arguments.length; a++) {
                    var recid  = typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
                    var index = this.get(recid, true);
                    if (index == null) continue;
                    var recEl1 = null;
                    var recEl2 = null;
                    if (this.searchData.length !== 0 || (index + 1 >= this.last.range_start && index + 1 <= this.last.range_end)) {
                        recEl1 = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid));
                        recEl2 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
                    }
                    if (this.selectType == 'row') {
                        if (sel.indexes.indexOf(index) != -1) continue;
                        sel.indexes.push(index);
                        if (recEl1 && recEl2) {
                            recEl1.addClass('w2ui-selected').data('selected', 'yes').find('.w2ui-col-number').addClass('w2ui-row-selected');
                            recEl2.addClass('w2ui-selected').data('selected', 'yes').find('.w2ui-col-number').addClass('w2ui-row-selected');
                            recEl1.find('.w2ui-grid-select-check').prop("checked", true);
                        }
                        selected++;
                    }
                }
            } else {
                // normalize for perforamce
                var new_sel = {};
                for (var a = 0; a < arguments.length; a++) {
                    var recid  = typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
                    var column = typeof arguments[a] == 'object' ? arguments[a].column : null;
                    new_sel[recid] = new_sel[recid] || [];
                    if ($.isArray(column)) {
                        new_sel[recid] = column;
                    } else if (w2utils.isInt(column)) {
                        new_sel[recid].push(column);
                    } else {
                        for (var i = 0; i < this.columns.length; i++) { if (this.columns[i].hidden) continue; new_sel[recid].push(parseInt(i)); }
                    }
                }
                // add all
                var col_sel = [];
                for (var recid in new_sel) {
                    var index = this.get(recid, true);
                    if (index == null) continue;
                    var recEl1 = null;
                    var recEl2 = null;
                    if (index + 1 >= this.last.range_start && index + 1 <= this.last.range_end) {
                        recEl1 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
                        recEl2 = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid));
                    }
                    var s = sel.columns[index] || [];
                    // default action
                    if (sel.indexes.indexOf(index) == -1) {
                        sel.indexes.push(index);
                    }
                    // anly only those that are new
                    for (var t = 0; t < new_sel[recid].length; t++) {
                        if (s.indexOf(new_sel[recid][t]) == -1) s.push(new_sel[recid][t]);
                    }
                    s.sort(function(a, b) { return a-b; }); // sort function must be for numerical sort
                    for (var t = 0; t < new_sel[recid].length; t++) {
                        var col = new_sel[recid][t];
                        if (col_sel.indexOf(col) == -1) col_sel.push(col);
                        if (recEl1) {
                            recEl1.find('#grid_'+ this.name +'_data_'+ index +'_'+ col).addClass('w2ui-selected');
                            recEl1.find('.w2ui-col-number').addClass('w2ui-row-selected');
                            recEl1.data('selected', 'yes');
                            recEl1.find('.w2ui-grid-select-check').prop("checked", true);
                        }
                        if (recEl2) {
                            recEl2.find('#grid_'+ this.name +'_data_'+ index +'_'+ col).addClass('w2ui-selected');
                            recEl2.find('.w2ui-col-number').addClass('w2ui-row-selected');
                            recEl2.data('selected', 'yes');
                            recEl2.find('.w2ui-grid-select-check').prop("checked", true);
                        }
                        selected++;
                    }
                    // save back to selection object
                    sel.columns[index] = s;
                }
                // select columns (need here for speed)
                for (var c = 0; c < col_sel.length; c++) {
                    $(this.box).find('#grid_'+ this.name +'_column_'+ col_sel[c] +' .w2ui-col-header').addClass('w2ui-col-selected');
                }
            }
            // need to sort new selection for speed
            sel.indexes.sort(function(a, b) { return a-b; });
            // all selected?
            if (sel.indexes.length == this.records.length || (this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)) {
                $('#grid_'+ this.name +'_check_all').prop('checked', true);
            } else {
                $('#grid_'+ this.name +'_check_all').prop('checked', false);
            }
            this.status();
            this.addRange('selection');
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return selected;
        },

        unselect: function () {
            var unselected = 0;
            var sel = this.last.selection;
            for (var a = 0; a < arguments.length; a++) {
                var recid  = typeof arguments[a] == 'object' ? arguments[a].recid : arguments[a];
                var record = this.get(recid);
                if (record == null) continue;
                var index  = this.get(record.recid, true);
                var recEl1 = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid));
                var recEl2 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
                if (this.selectType == 'row') {
                    if (sel.indexes.indexOf(index) == -1) continue;
                    // event before
                    var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: recid, index: index });
                    if (eventData.isCancelled === true) continue;
                    // default action
                    sel.indexes.splice(sel.indexes.indexOf(index), 1);
                    recEl1.removeClass('w2ui-selected w2ui-inactive').removeData('selected').find('.w2ui-col-number').removeClass('w2ui-row-selected');
                    recEl2.removeClass('w2ui-selected w2ui-inactive').removeData('selected').find('.w2ui-col-number').removeClass('w2ui-row-selected');
                    if (recEl1.length != 0) {
                        recEl1[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + recEl1.attr('custom_style');
                        recEl2[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + recEl2.attr('custom_style');
                    }
                    recEl1.find('.w2ui-grid-select-check').prop("checked", false);
                    unselected++;
                } else {
                    var col  = arguments[a].column;
                    if (!w2utils.isInt(col)) { // unselect all columns
                        var cols = [];
                        for (var i = 0; i < this.columns.length; i++) { if (this.columns[i].hidden) continue; cols.push({ recid: recid, column: i }); }
                        return this.unselect.apply(this, cols);
                    }
                    var s = sel.columns[index];
                    if (!$.isArray(s) || s.indexOf(col) == -1) continue;
                    // event before
                    var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, recid: recid, column: col });
                    if (eventData.isCancelled === true) continue;
                    // default action
                    s.splice(s.indexOf(col), 1);
                    $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid)).find(' > td[col='+ col +']').removeClass('w2ui-selected w2ui-inactive');
                    $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid)).find(' > td[col='+ col +']').removeClass('w2ui-selected w2ui-inactive');
                    // check if any row/column still selected
                    var isColSelected = false;
                    var isRowSelected = false;
                    var tmp = this.getSelection();
                    for (var i = 0; i < tmp.length; i++) {
                        if (tmp[i].column == col) isColSelected = true;
                        if (tmp[i].recid == recid) isRowSelected = true;
                    }
                    if (!isColSelected) {
                       $(this.box).find('.w2ui-grid-columns td[col='+ col +'] .w2ui-col-header').removeClass('w2ui-col-selected');
                    }
                    if (!isRowSelected) {
                        $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid)).find('.w2ui-col-number').removeClass('w2ui-row-selected');
                    }
                    unselected++;
                    if (s.length == 0) {
                        delete sel.columns[index];
                        sel.indexes.splice(sel.indexes.indexOf(index), 1);
                        recEl1.removeData('selected');
                        recEl1.find('.w2ui-grid-select-check').prop("checked", false);
                        recEl2.removeData('selected');
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
            var time = (new Date()).getTime();
            if (this.multiSelect === false) return;
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'select', target: this.name, all: true });
            if (eventData.isCancelled === true) return;
            // default action
            var url  = (typeof this.url != 'object' ? this.url : this.url.get);
            var sel  = this.last.selection;
            var cols = [];
            for (var i = 0; i < this.columns.length; i++) cols.push(i);
            // if local data source and searched
            sel.indexes = [];
            if (!url && this.searchData.length !== 0) {
                // local search applied
                for (var i = 0; i < this.last.searchIds.length; i++) {
                    sel.indexes.push(this.last.searchIds[i]);
                    if (this.selectType != 'row') sel.columns[this.last.searchIds[i]] = cols.slice(); // .slice makes copy of the array
                }
            } else {
                var buffered = this.records.length;
                if (this.searchData.length != 0 && !this.url) buffered = this.last.searchIds.length;
                for (var i = 0; i < buffered; i++) {
                    sel.indexes.push(i);
                    if (this.selectType != 'row') sel.columns[i] = cols.slice(); // .slice makes copy of the array
                }
            }
            // add selected class
            if (this.selectType == 'row') {
                $(this.box).find('.w2ui-grid-records tr').not('.w2ui-empty-record')
                    .addClass('w2ui-selected').data('selected', 'yes').find('.w2ui-col-number').addClass('w2ui-row-selected');
                $(this.box).find('.w2ui-grid-frecords tr').not('.w2ui-empty-record')
                    .addClass('w2ui-selected').data('selected', 'yes').find('.w2ui-col-number').addClass('w2ui-row-selected');
                $(this.box).find('input.w2ui-grid-select-check').prop('checked', true);
            } else {
                $(this.box).find('.w2ui-grid-columns td .w2ui-col-header').addClass('w2ui-col-selected');
                $(this.box).find('.w2ui-grid-records tr .w2ui-col-number').addClass('w2ui-row-selected');
                $(this.box).find('.w2ui-grid-records tr').not('.w2ui-empty-record')
                    .find('.w2ui-grid-data').not('.w2ui-col-select').addClass('w2ui-selected').data('selected', 'yes');
                $(this.box).find('.w2ui-grid-frecords tr .w2ui-col-number').addClass('w2ui-row-selected');
                $(this.box).find('.w2ui-grid-frecords tr').not('.w2ui-empty-record')
                    .find('.w2ui-grid-data').not('.w2ui-col-select').addClass('w2ui-selected').data('selected', 'yes');
                $(this.box).find('input.w2ui-grid-select-check').prop('checked', true);
            }
            // enable/disable toolbar buttons
            var sel = this.getSelection();
            if (sel.length == 1) this.toolbar.enable('w2ui-edit'); else this.toolbar.disable('w2ui-edit');
            if (sel.length >= 1) this.toolbar.enable('w2ui-delete'); else this.toolbar.disable('w2ui-delete');
            this.addRange('selection');
            $('#grid_'+ this.name +'_check_all').prop('checked', true);
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        selectNone: function () {
            var time = (new Date()).getTime();
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'unselect', target: this.name, all: true });
            if (eventData.isCancelled === true) return;
            // default action
            var sel = this.last.selection;
            // remove selected class
            if (this.selectType == 'row') {
                $(this.box).find('.w2ui-grid-records tr.w2ui-selected').removeClass('w2ui-selected w2ui-inactive').removeData('selected')
                    .find('.w2ui-col-number').removeClass('w2ui-row-selected');
                $(this.box).find('.w2ui-grid-frecords tr.w2ui-selected').removeClass('w2ui-selected w2ui-inactive').removeData('selected')
                    .find('.w2ui-col-number').removeClass('w2ui-row-selected');
                $(this.box).find('input.w2ui-grid-select-check').prop('checked', false);
            } else {
                $(this.box).find('.w2ui-grid-columns td .w2ui-col-header').removeClass('w2ui-col-selected');
                $(this.box).find('.w2ui-grid-records tr .w2ui-col-number').removeClass('w2ui-row-selected');
                $(this.box).find('.w2ui-grid-frecords tr .w2ui-col-number').removeClass('w2ui-row-selected');
                $(this.box).find('.w2ui-grid-data.w2ui-selected').removeClass('w2ui-selected w2ui-inactive').removeData('selected');
                $(this.box).find('input.w2ui-grid-select-check').prop('checked', false);
            }
            sel.indexes = [];
            sel.columns = {};
            this.toolbar.disable('w2ui-edit', 'w2ui-delete');
            this.removeRange('selection');
            $('#grid_'+ this.name +'_check_all').prop('checked', false);
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        getSelection: function (returnIndex) {
            var ret = [];
            var sel = this.last.selection;
            if (this.selectType == 'row') {
                for (var i = 0; i < sel.indexes.length; i++) {
                    if (!this.records[sel.indexes[i]]) continue;
                    if (returnIndex === true) ret.push(sel.indexes[i]); else ret.push(this.records[sel.indexes[i]].recid);
                }
                return ret;
            } else {
                for (var i = 0; i < sel.indexes.length; i++) {
                    var cols = sel.columns[sel.indexes[i]];
                    if (!this.records[sel.indexes[i]]) continue;
                    for (var j = 0; j < cols.length; j++) {
                        ret.push({ recid: this.records[sel.indexes[i]].recid, index: parseInt(sel.indexes[i]), column: cols[j] });
                    }
                }
                return ret;
            }
        },

        search: function (field, value) {
            var obj         = this;
            var url         = (typeof this.url != 'object' ? this.url : this.url.get);
            var searchData  = [];
            var last_multi  = this.last.multi;
            var last_logic  = this.last.logic;
            var last_field  = this.last.field;
            var last_search = this.last.search;
            // 1: search() - advanced search (reads from popup)
            if (arguments.length == 0) {
                last_search = '';
                // advanced search
                for (var i = 0; i < this.searches.length; i++) {
                    var search   = this.searches[i];
                    var operator = $('#grid_'+ this.name + '_operator_'+ s).val();
                    var field1   = $('#grid_'+ this.name + '_field_'+ s);
                    var field2   = $('#grid_'+ this.name + '_field2_'+ s);
                    var value1   = field1.val();
                    var value2   = field2.val();
                    var svalue   = null;
                    var text     = null;

                    if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                        var fld1 = field1.data('w2field');
                        var fld2 = field2.data('w2field');
                        if (fld1) value1 = fld1.clean(value1);
                        if (fld2) value2 = fld2.clean(value2);
                    }
                    if (['list', 'enum'].indexOf(search.type) != -1) {
                        value1 = field1.data('selected') || {};
                        if ($.isArray(value1)) {
                            svalue = [];
                            for (var j = 0; j < value1.length; j++) {
                                svalue.push(w2utils.isFloat(value1[j].id) ? parseFloat(value1[j].id) : String(value1[j].id).toLowerCase());
                                delete value1[j].hidden;
                            }
                            if ($.isEmptyObject(value1)) value1 = '';
                        } else {
                            text = value1.text || '';
                            value1 = value1.id || '';
                        }
                    }
                    if ((value1 !== '' && value1 != null) || (typeof value2 != 'undefined' && value2 !== '')) {
                        var tmp = {
                            field    : search.field,
                            type     : search.type,
                            operator : operator
                        };
                        if (operator == 'between') {
                            $.extend(tmp, { value: [value1, value2] });
                        } else if (operator == 'in' && typeof value1 == 'string') {
                            $.extend(tmp, { value: value1.split(',') });
                        } else if (operator == 'not in' && typeof value1 == 'string') {
                            $.extend(tmp, { value: value1.split(',') });
                        } else {
                            $.extend(tmp, { value: value1 });
                        }
                        if (svalue) $.extend(tmp, { svalue: svalue });
                        if (text) $.extend(tmp, { text: text });

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
                    last_multi = true;
                    last_logic = 'AND';
                } else {
                    last_multi = true;
                    last_logic = 'AND';
                }
            }
            // 2: search(field, value) - regular search
            if (typeof field == 'string') {
                last_field  = field;
                last_search = value;
                last_multi  = false;
                last_logic  = 'OR';
                // loop through all searches and see if it applies
                if (typeof value != 'undefined') {
                    if (field.toLowerCase() == 'all') {
                        // if there are search fields loop thru them
                        if (this.searches.length > 0) {
                            for (var i = 0; i < this.searches.length; i++) {
                                var search = this.searches[i];
                                if (search.type == 'text' || (search.type == 'alphanumeric' && w2utils.isAlphaNumeric(value))
                                        || (search.type == 'int' && w2utils.isInt(value)) || (search.type == 'float' && w2utils.isFloat(value))
                                        || (search.type == 'percent' && w2utils.isFloat(value)) || (search.type == 'hex' && w2utils.isHex(value))
                                        || (search.type == 'currency' && w2utils.isMoney(value)) || (search.type == 'money' && w2utils.isMoney(value))
                                        || (search.type == 'date' && w2utils.isDate(value)) ) {
                                    var tmp = {
                                        field    : search.field,
                                        type     : search.type,
                                        operator : (search.type == 'text' ? 'contains' : 'is'),
                                        value    : value
                                    };
                                    if ($.trim(value) != '') searchData.push(tmp);
                                }
                                // range in global search box
                                if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1 && $.trim(String(value)).split('-').length == 2) {
                                    var t = $.trim(String(value)).split('-');
                                    var tmp = {
                                        field    : search.field,
                                        type     : search.type,
                                        operator : 'between',
                                        value    : [t[0], t[1]]
                                    };
                                    searchData.push(tmp);
                                }
                                // lists fiels
                                if (['list', 'enum'].indexOf(search.type) != -1) {
                                    var new_values = [];
                                    for (var j = 0; j < search.options.items; j++) {
                                        var tmp = search.options.items[j];
                                        try {
                                            var re = new RegExp(value, 'i');
                                            if (re.test(tmp)) new_values.push(j);
                                            if (tmp.text && re.test(tmp.text)) new_values.push(tmp.id);
                                        } catch (e) {}
                                    }
                                    if (new_values.length > 0) {
                                        var tmp = {
                                            field    : search.field,
                                            type     : search.type,
                                            operator : 'in',
                                            value    : new_values
                                        };
                                        searchData.push(tmp);
                                    }
                                }
                            }
                        } else {
                            // no search fields, loop thru columns
                            for (var i = 0; i < this.columns.length; i++) {
                                var tmp = {
                                    field    : this.columns[i].field,
                                    type     : 'text',
                                    operator : 'contains',
                                    value    : value
                                };
                                searchData.push(tmp);
                            }
                        }
                    } else {
                        var el = $('#grid_'+ this.name +'_search_all');
                        var search = this.getSearch(field);
                        if (search == null) search = { field: field, type: 'text' };
                        if (search.field == field) this.last.caption = search.caption;
                        if (value !== '') {
                            var op  = 'contains';
                            var val = value;
                            if (['date', 'time'].indexOf(search.type) != -1) op = 'is';
                            if (['list', 'enum'].indexOf(search.type) != -1) {
                                op = 'is';
                                var tmp = el.data('selected');
                                if (tmp && !$.isEmptyObject(tmp)) val = tmp.id; else val = '';
                            }
                            if (search.type == 'int' && value !== '') {
                                op = 'is';
                                if (String(value).indexOf('-') != -1) {
                                    var tmp = value.split('-');
                                    if (tmp.length == 2) {
                                        op = 'between';
                                        val = [parseInt(tmp[0]), parseInt(tmp[1])];
                                    }
                                }
                                if (String(value).indexOf(',') != -1) {
                                    var tmp = value.split(',');
                                    op  = 'in';
                                    val = [];
                                    for (var i = 0; i < tmp.length; i++) val.push(tmp[i]);
                                }
                            }
                            var tmp = {
                                field    : search.field,
                                type     : search.type,
                                operator : op,
                                value    : val
                            };
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
                last_multi  = true;
                last_logic  = logic;
                for (var i = 0; i < field.length; i++) {
                    var data   = field[i];
                    var search = this.getSearch(data.field);
                    if (search == null) search = { type: 'text', operator: 'contains' };
                    if ($.isArray(data.value)) {
                        for (var j = 0; j < data.value.length; j++) {
                            if (typeof data.value[j] == 'string') data.value[j] = data.value[j].toLowerCase();
                        }
                    }
                    // merge current field and search if any
                    searchData.push($.extend(true, {}, search, data));
                }
            }
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: searchData,
                    searchField: (field ? field : 'multi'), searchValue: (value ? value : 'multi') });
            if (eventData.isCancelled === true) return;
            // default action
            this.searchData  = eventData.searchData;
            this.last.field  = last_field;
            this.last.search = last_search;
            this.last.multi  = last_multi;
            this.last.logic  = last_logic;
            this.last.scrollTop         = 0;
            this.last.scrollLeft        = 0;
            this.last.selection.indexes = [];
            this.last.selection.columns = {};
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
                this.getSearchesHTML(),    {
                    name    : 'searches-'+ this.name,
                    left    : -10,
                    'class' : 'w2ui-grid-searches',
                    onShow  : function () {
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
            if (this.toolbar) this.toolbar.uncheck('w2ui-search-advanced');
            // hide search
            if ($('#w2ui-overlay-searches-'+ this.name +' .w2ui-grid-searches').length > 0) {
                $().w2overlay('', { name: 'searches-'+ this.name });
            }
        },

        searchReset: function (noRefresh) {
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'search', target: this.name, searchData: [] });
            if (eventData.isCancelled === true) return;
            // default action
            this.searchData  = [];
            this.last.search = '';
            this.last.logic  = 'OR';
            // --- do not reset to All Fields (I think)
            if (this.last.multi) {
                if (!this.multiSearch) {
                    this.last.field   = this.searches[0].field;
                    this.last.caption = this.searches[0].caption;
                } else {
                    this.last.field   = 'all';
                    this.last.caption = w2utils.lang('All Fields');
                }
            }
            this.last.multi      = false;
            this.last.xhr_offset = 0;
            // reset scrolling position
            this.last.scrollTop  = 0;
            this.last.scrollLeft = 0;
            this.last.selection.indexes = [];
            this.last.selection.columns = {};
            // -- clear all search field
            this.searchClose();
            $('#grid_'+ this.name +'_search_all').val('').removeData('selected');
            // apply search
            if (!noRefresh) this.reload();
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
        },

        searchShowFields: function () {
            var el   = $('#grid_'+ this.name +'_search_all');
            var html = '<div class="w2ui-select-field"><table>';
            for (var s = -1; s < this.searches.length; s++) {
                var search = this.searches[s];
                if (s == -1) {
                    if (!this.multiSearch) continue;
                    search = { field: 'all', caption: w2utils.lang('All Fields') };
                } else {
                    if (this.searches[s].hidden === true) continue;
                }
                html += '<tr '+ (w2utils.isIOS ? 'onTouchStart' : 'onClick') +'="w2ui[\''+ this.name +'\'].initAllField(\''+ search.field +'\')">'+
                        '    <td><input type="radio" tabIndex="-1" '+ (search.field == this.last.field ? 'checked' : '') +'></td>'+
                        '    <td>'+ search.caption +'</td>'+
                        '</tr>';
            }
            html += "</table></div>";
            // need timer otherwise does nto show with list type
            setTimeout(function () {
                $(el).w2overlay(html, { left: -10 });
            }, 1);
        },

        initAllField: function (field, value) {
            var el = $('#grid_'+ this.name +'_search_all');
            if (field == 'all') {
                var search = { field: 'all', caption: w2utils.lang('All Fields') };
                el.w2field('clear');
                el.change();
                if (value !== null) el.focus();
            } else {
                var search = this.getSearch(field);
                if (search == null) return;
                var st = search.type;
                if (['enum', 'select'].indexOf(st) != -1) st = 'list';
                el.w2field(st, $.extend({}, search.options, { suffix: '', autoFormat: false, selected: value }));
                if (['list', 'enum', 'date', 'time'].indexOf(search.type) != -1) {
                    this.last.search = '';
                    this.last.item   = '';
                    el.val('');
                }
                // set focus
                setTimeout(function () {
                    if (value !== null) el.focus(); /* do not do el.change() as it will refresh grid and pull from server */
                }, 1);
            }
            // update field
            if (this.last.search != '') {
                this.last.caption = search.caption;
                this.search(search.field, this.last.search);
            } else {
                this.last.field   = search.field;
                this.last.caption = search.caption;
            }
            el.attr('placeholder', search.caption);
            $().w2overlay();
        },

        // clears records and related params
        clear: function (noRefresh) {
            this.total            = 0;
            this.records          = [];
            this.summary          = [];
            this.last.xhr_offset  = 0;   // need this for reload button to work on remote data set
            this.reset(true);
            // refresh
            if (!noRefresh) this.refresh();
        },

        // clears scroll position, selection, ranges
        reset: function (noRefresh) {
            // position
            this.last.scrollTop   = 0;
            this.last.scrollLeft  = 0;
            this.last.selection   = { indexes: [], columns: {} };
            this.last.range_start = null;
            this.last.range_end   = null;
            // additional
            this.set({ expanded: false }, true);
            $('#grid_'+ this.name +'_records').prop('scrollTop',  0);
            // refresh
            if (!noRefresh) this.refresh();
        },

        skip: function (offset) {
            var url = (typeof this.url != 'object' ? this.url : this.url.get);
            if (url) {
                this.offset = parseInt(offset);
                if (this.offset > this.total) this.offset = this.total - this.limit;
                if (this.offset < 0 || !w2utils.isInt(this.offset)) this.offset = 0;
                this.clear(true);
                this.reload();
            } else {
                console.log('ERROR: grid.skip() can only be called when you have remote data source.');
            }
        },

        load: function (url, callBack) {
            if (url == null) {
                console.log('ERROR: You need to provide url argument when calling .load() method of "'+ this.name +'" object.');
                return;
            }
            // default action
            this.clear(true);
            this.request('get-records', {}, url, callBack);
        },

        reload: function (callBack) {
            var grid = this;
            var url  = (typeof this.url != 'object' ? this.url : this.url.get);
            grid.selectionSave();
            if (url) {
                // need to remember selection (not just last.selection object)
                this.load(url, function () {
                    grid.selectionRestore();
                    if (typeof callBack == 'function') callBack();
                });
            } else {
                this.reset(true);
                this.localSearch();
                this.selectionRestore();
                if (typeof callBack == 'function') callBack({ status: 'success' });
            }
        },

        request: function (cmd, add_params, url, callBack) {
            if (typeof add_params == 'undefined') add_params = {};
            if (url == '' || url == null) url = this.url;
            if (url == '' || url == null) return;
            // build parameters list
            var params = {};
            if (!w2utils.isInt(this.offset)) this.offset = 0;
            if (!w2utils.isInt(this.last.xhr_offset)) this.last.xhr_offset = 0;
            // add list params
            params['cmd']         = cmd;
            params['selected']    = this.getSelection();
            params['limit']       = this.limit;
            params['offset']      = parseInt(this.offset) + this.last.xhr_offset;
            params['search']      = this.searchData;
            params['searchLogic'] = this.last.logic;
            params['sort']        = this.sortData;
            if (this.searchData.length == 0) {
                delete params['search'];
                delete params['searchLogic'];
            }
            if (this.sortData.length == 0) {
                delete params['sort'];
            }
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
                obj.lock(w2utils.lang(obj.msgRefresh), true);
            } else {
                var more = $('#grid_'+ this.name +'_rec_more');
                if (this.autoLoad === true) {
                    more.show().find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>');
                } else {
                    more.find('td').html('<div>'+ w2utils.lang('Load') + ' ' + obj.limit + ' ' + w2utils.lang('More') + '...</div>');
                }
            }
            if (this.last.xhr) try { this.last.xhr.abort(); } catch (e) {}
            // URL
            var url = (typeof eventData.url != 'object' ? eventData.url : eventData.url.get);
            if (params.cmd == 'save-records' && typeof eventData.url == 'object')   url = eventData.url.save;
            if (params.cmd == 'delete-records' && typeof eventData.url == 'object') url = eventData.url.remove;
            // process url with routeData
            if (!$.isEmptyObject(obj.routeData)) {
                var info  = w2utils.parseRoute(url);
                if (info.keys.length > 0) {
                    for (var k = 0; k < info.keys.length; k++) {
                        if (obj.routeData[info.keys[k].name] == null) continue;
                        url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name]);
                    }
                }
            }
            // ajax ptions
            var ajaxOptions = {
                type     : 'POST',
                url      : url,
                data     : eventData.postData,
                dataType : 'text'  // expected data type from server
            };
            if (w2utils.settings.dataType == 'HTTP') {
                ajaxOptions.data = (typeof ajaxOptions.data == 'object' ? String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']') : ajaxOptions.data);
            }
            if (w2utils.settings.dataType == 'RESTFULL') {
                ajaxOptions.type = 'GET';
                if (params.cmd == 'save-records')   ajaxOptions.type = 'PUT';  // so far it is always update
                if (params.cmd == 'delete-records') ajaxOptions.type = 'DELETE';
                ajaxOptions.data = (typeof ajaxOptions.data == 'object' ? String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']') : ajaxOptions.data);
            }
            if (w2utils.settings.dataType == 'RESTFULLJSON') {
                ajaxOptions.type = 'GET';
                if (params.cmd == 'save-records')   ajaxOptions.type = 'PUT';  // so far it is always update
                if (params.cmd == 'delete-records') ajaxOptions.type = 'DELETE';
                ajaxOptions.data        = JSON.stringify(ajaxOptions.data);
                ajaxOptions.contentType = 'application/json';
            }
            if (w2utils.settings.dataType == 'JSON') {
                ajaxOptions.type        = 'POST';
                ajaxOptions.data        = JSON.stringify(ajaxOptions.data);
                ajaxOptions.contentType = 'application/json';
            }
            if (this.method) ajaxOptions.type = this.method;

            this.last.xhr_cmd   = params.cmd;
            this.last.xhr_start = (new Date()).getTime();
            this.last.xhr = $.ajax(ajaxOptions)
                .done(function (data, status, xhr) {
                    obj.requestComplete(status, cmd, callBack);
                })
                .fail(function (xhr, status, error) {
                    // trigger event
                    var errorObj = { status: status, error: error, rawResponseText: xhr.responseText };
                    var eventData2 = obj.trigger({ phase: 'before', type: 'error', error: errorObj, xhr: xhr });
                    if (eventData2.isCancelled === true) return;
                    // default behavior
                    if (status != 'abort') { // it can be aborted by the grid itself
                        var data;
                        try { data = $.parseJSON(xhr.responseText); } catch (e) {}
                        console.log('ERROR: Server communication failed.',
                            '\n   EXPECTED:', { status: 'success', total: 5, records: [{ recid: 1, field: 'value' }] },
                            '\n         OR:', { status: 'error', message: 'error message' },
                            '\n   RECEIVED:', typeof data == 'object' ? data : xhr.responseText);
                        obj.requestComplete('error', cmd, callBack);
                    }
                    // event after
                    obj.trigger($.extend(eventData2, { phase: 'after' }));
                });
            if (cmd == 'get-records') {
                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
            }
        },

        requestComplete: function(status, cmd, callBack) {
            var obj = this;
            this.unlock();
            setTimeout(function () {
                if (obj.show.statusResponse) obj.status(w2utils.lang('Server Response') + ' ' + ((new Date()).getTime() - obj.last.xhr_start)/1000 +' ' + w2utils.lang('sec'));
            }, 10);
            this.last.pull_more    = false;
            this.last.pull_refresh = true;

            // event before
            var event_name = 'load';
            if (this.last.xhr_cmd == 'save-records') event_name   = 'save';
            if (this.last.xhr_cmd == 'delete-records') event_name = 'delete';
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
                    if (data == null) {
                        data = {
                            status       : 'error',
                            message      : w2utils.lang(this.msgNotJSON),
                            responseText : responseText
                        };
                    } else if (obj.recid) {
                        // convert recids
                        for (var i = 0; i < data.records.length; i++) {
                            data.records[i]['recid'] = data.records[i][obj.recid];
                        }
                    }
                    if (data['status'] == 'error') {
                        obj.error(data['message']);
                    } else {
                        if (cmd == 'get-records') {
                            if (this.last.xhr_offset == 0) {
                                this.records = [];
                                this.summary = [];
                                if (w2utils.isInt(data.total)) this.total = parseInt(data.total);
                            } else {
                                if (parseInt(data.total) != parseInt(this.total)) {
                                    w2alert(w2utils.lang(this.msgNeedReload));
                                    delete this.last.xhr_offset;
                                    this.reload();
                                    return;
                                }
                            }
                            // records
                            if (data.records) {
                                for (var r = 0; r < data.records.length; r++) {
                                    this.records.push(data.records[r]);
                                }
                            }
                            // summary records (if any)
                            if (data.summary) {
                                this.summary = [];
                                for (var r = 0; r < data.summary.length; r++) {
                                    this.summary.push(data.summary[r]);
                                }
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
                    status       : 'error',
                    message      : this.msgAJAXerror,
                    responseText : responseText
                };
                obj.error(w2utils.lang(this.msgAJAXerror));
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
            w2alert(msg, w2utils.lang('Error'));
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
        },

        getChanges: function () {
            var changes = [];
            for (var r = 0; r < this.records.length; r++) {
                var rec = this.records[r];
                if (typeof rec['changes'] != 'undefined') {
                    changes.push($.extend(true, { recid: rec.recid }, rec.changes));
                }
            }
            return changes;
        },

        mergeChanges: function () {
            var changes = this.getChanges();
            for (var c = 0; c < changes.length; c++) {
                var record = this.get(changes[c].recid);
                for (var s in changes[c]) {
                    if (s == 'recid') continue; // do not allow to change recid
                    if (typeof changes[c][s] === "object") changes[c][s] = changes[c][s].text;
                    try { 
			if (s.indexOf('.') != -1) {
				eval("record['" + s.replace(/\./g, "']['") + "'] = changes[c][s]")
			} else {
				record[s] = changes[c][s];
			};
                    } catch (e) {
                        console.log('ERROR: Cannot merge. ', e.message || '', e);
                    }
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
            var eventData = this.trigger({ phase: 'before', target: this.name, type: 'save', changes: changes });
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
            var obj    = this;
            var index  = obj.get(recid, true);
            var rec    = obj.records[index];
            var col    = obj.columns[column];
            var prefix = (col.frozen === true ? '_f' : '_');
            var edit   = (rec ? rec.editable : null);
            if (edit == null || edit === true) edit = (col ? col.editable : null);
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
            var tr = $('#grid_'+ obj.name + prefix +'rec_' + w2utils.escapeId(recid));
            var el = tr.find('[col='+ column +'] > div');
            // clear previous if any
            $(this.box).find('div.w2ui-edit-box').remove();
            // for spreadsheet - insert into selection
            if (this.selectType != 'row') {
                $('#grid_'+ this.name + prefix + 'selection')
                    .attr('id', 'grid_'+ this.name + '_editable')
                    .removeClass('w2ui-selection')
                    .addClass('w2ui-edit-box')
                    .prepend('<div style="position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px;"></div>')
                    .find('.w2ui-selection-resizer')
                    .remove();
                el = $('#grid_'+ this.name + '_editable >div:first-child');
            }
            if (typeof edit.inTag   == 'undefined') edit.inTag   = '';
            if (typeof edit.outTag  == 'undefined') edit.outTag  = '';
            if (typeof edit.style   == 'undefined') edit.style   = '';
            if (typeof edit.items   == 'undefined') edit.items   = [];
            var val = (rec.changes && typeof rec.changes[col.field] != 'undefined' ? w2utils.stripTags(rec.changes[col.field]) : w2utils.stripTags(rec[col.field]));
            if (val == null) val = '';
            if (value != null) val = value;
            var addStyle = (typeof col.style != 'undefined' ? col.style + ';' : '');
            if (typeof col.render == 'string' && ['number', 'int', 'float', 'money', 'percent'].indexOf(col.render.split(':')[0]) != -1) {
                addStyle += 'text-align: right;';
            }
            // mormalize items
            if (edit.items.length > 0 && !$.isPlainObject(edit.items[0])) {
                edit.items = w2obj.field.prototype.normMenu(edit.items);
            }
            if (edit.type == 'select') {
                var html = '';
                for (var i = 0; i < edit.items.length; i++) {
                    html += '<option value="'+ edit.items[i].id +'" '+ (edit.items[i].id == val ? 'selected' : '') +'>'+ edit.items[i].text +'</option>';
                }
                el.addClass('w2ui-editable')
                    .html('<select id="grid_'+ obj.name +'_edit_'+ recid +'_'+ column +'" column="'+ column +'"'+
                        '    style="width: 100%; pointer-events: auto; padding: 0px; margin: 0px; '+
                        '       outline: none; border: 0px !important; '+ addStyle + edit.style +'" '+
                        '    field="'+ col.field +'" recid="'+ recid +'" '+
                        '    '+ edit.inTag +
                        '>'+ html +'</select>' + edit.outTag);
                setTimeout(function () {
                    el.find('select').focus()
                        .on('change', function (event) {
                            delete obj.last.move;
                        })
                        .on('blur', function (event) {
                            if ($(this).data('keep-open') == true) return;
                            obj.editChange.call(obj, this, index, column, event);
                        });
                }, 10);
            } else if (edit.type == 'div') {
                var $tmp = tr.find('[col='+ column +'] > div');
                var font = 'font-family: '+ $tmp.css('font-family') + '; font-size: '+ $tmp.css('font-size') + ';';
                el.addClass('w2ui-editable')
                    .html('<div id="grid_'+ obj.name +'_edit_'+ recid +'_'+ column +'" class="w2ui-input"'+
                        '    contenteditable style="'+ font + addStyle + edit.style +'" '+
                        '    field="'+ col.field +'" recid="'+ recid +'" column="'+ column +'" '+ edit.inTag +
                        '></div>' + edit.outTag);
                if (value == null) el.find('div.w2ui-input').text(typeof val != 'object' ? val : '');
                // add blur listener
                var input = el.find('div.w2ui-input').get(0);
                setTimeout(function () {
                    var tmp = input;
                    $(tmp).on('blur', function (event) {
                        if ($(this).data('keep-open') == true) return;
                        obj.editChange.call(obj, tmp, index, column, event);
                    });
                }, 10);
                if (value != null) $(input).text(typeof val != 'object' ? val : '');
            } else {
                var $tmp = tr.find('[col='+ column +'] > div');
                var font = 'font-family: '+ $tmp.css('font-family') + '; font-size: '+ $tmp.css('font-size');
                el.addClass('w2ui-editable')
                    .html('<input id="grid_'+ obj.name +'_edit_'+ recid +'_'+ column +'" '+
                        '    type="text" style="'+ font +'; width: 100%; height: 100%; padding: 3px; '+
                        '       border-color: transparent; outline: none; pointer-events: auto; '+ addStyle + edit.style +'" '+
                        '    field="'+ col.field +'" recid="'+ recid +'" '+
                        '    column="'+ column +'" '+ edit.inTag +
                        '>' + edit.outTag);
                // issue #499
                if (typeof val == 'number') {
                    val = w2utils.formatNumber(val);
                }
                if (value == null) el.find('input').val(typeof val != 'object' ? val : '');
                // init w2field
                var input = el.find('input').get(0);
                $(input).w2field(edit.type, $.extend(edit, { selected: val }));
                // add blur listener
                setTimeout(function () {
                    var tmp = input;
                    if (edit.type == 'list') {
                        tmp = $($(input).data('w2field').helpers.focus).find('input');
                        if (typeof val != 'object' && val != '') tmp.val(val).css({ opacity: 1 }).prev().css({ opacity: 1 });
                    }
                    $(tmp).on('blur', function (event) {
                        if ($(this).data('keep-open') == true) return;
                        obj.editChange.call(obj, input, index, column, event);
                    });
                }, 10);
                if (value != null) $(input).val(typeof val != 'object' ? val : '');
            }
            setTimeout(function () {
                el.find('input, select, div.w2ui-input')
                    .on('mousedown', function (event) {
                        event.stopPropagation();
                    })
                    .on('click', function (event) {
                        if (edit.type == 'div') {
                            expand.call(el.find('div.w2ui-input')[0], null);
                        } else {
                            expand.call(el.find('input, select')[0], null);
                        }
                    })
                    .on('paste', function (event) {
                        // clean paste to be plain text
                        var e = event.originalEvent;
                        event.preventDefault();
                        var text = e.clipboardData.getData("text/plain");
                        document.execCommand("insertHTML", false, text);
                    })
                    .on('keydown', function (event) {
                        switch (event.keyCode) {
                            case 9:  // tab
                                var next_rec = recid;
                                var next_col = event.shiftKey ? obj.prevCell(index, column, true) : obj.nextCell(index, column, true);
                                // next or prev row
                                if (next_col == null) {
                                    var tmp = event.shiftKey ? obj.prevRow(index, column) : obj.nextRow(index, column);
                                    if (tmp != null && tmp != index) {
                                        next_rec = obj.records[tmp].recid;
                                        // find first editable row
                                        for (var c = 0; c < obj.columns.length; c++) {
                                            var tmp = obj.columns[c].editable;
                                            if (typeof tmp != 'undefined' && ['checkbox', 'check'].indexOf(tmp.type) == -1) {
                                                next_col = parseInt(c);
                                                if (!event.shiftKey) break;
                                            }
                                        }
                                    }

                                }
                                if (next_rec === false) next_rec = recid;
                                if (next_col == null) next_col = column;
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
                                if (event.preventDefault) event.preventDefault();
                                break;

                            case 13: // enter
                                this.blur();
                                var next = event.shiftKey ? obj.prevRow(index, column) : obj.nextRow(index, column);
                                if (next != null && next != index) {
                                    setTimeout(function () {
                                        if (obj.selectType != 'row') {
                                            obj.selectNone();
                                            obj.select({ recid: obj.records[next].recid, column: column });
                                        } else {
                                            obj.editField(obj.records[next].recid, column, null, event);
                                        }
                                    }, 1);
                                }
                                if (this.tagName == 'DIV') {
                                    event.preventDefault();
                                }
                                break;

                            case 27: // escape
                                var old = obj.parseField(rec, col.field);
                                if (rec.changes && typeof rec.changes[col.field] != 'undefined') old = rec.changes[col.field];
                                if (this.tagName == 'DIV') {
                                    $(this).text(typeof old != 'undefined' ? old : '');
                                } else {
                                    this.value = typeof old != 'undefined' ? old : '';
                                }
                                this.blur();
                                setTimeout(function () { obj.select({ recid: recid, column: column }); }, 1);
                                break;
                        }
                        // if input too small - expand
                        expand.call(this, event);
                    })
                    .on('keyup', function (event) { 
                        expand.call(this, event); 
                    });
                // focus and select
                if (edit.type == 'div') {
                    var tmp = el.find('div.w2ui-input').focus();
                    clearTimeout(obj.last.kbd_timer); // keep focus
                    if (value != null) {
                        // set cursor to the end
                        setCursorPosition(tmp[0], $(tmp).text().length);
                    } else {
                        // select entire text
                        setCursorPosition(tmp[0], 0, $(tmp).text().length);
                    }
                    expand.call(el.find('div.w2ui-input')[0], null);
                } else {
                    var tmp = el.find('input, select').focus();
                    clearTimeout(obj.last.kbd_timer); // keep focus
                    if (value != null) {
                        // set cursor to the end
                        tmp[0].setSelectionRange(tmp.val().length, tmp.val().length);
                    } else {
                        tmp.select();
                    }
                    expand.call(el.find('input, select')[0], null);
                }
                tmp[0].resize = expand;
                // event after
                obj.trigger($.extend(eventData, { phase: 'after', input: el.find('input, select, div.w2ui-input') }));
            }, 1);
            return;

            function expand(event) {
                try {
                    var val   = (this.tagName == 'DIV' ? $(this).text() : this.value);
                    var $sel  = $('#grid_'+ obj.name + '_editable');
                    var style = 'font-family: '+ $(this).css('font-family') + '; font-size: '+ $(this).css('font-size') + ';';
                    var width = w2utils.getStrWidth(val, style);
                    if (width + 20 > $sel.width()) {
                        $sel.width(width + 20);
                    }
                } catch (e) {
                }
            }

            function setCursorPosition(element, start, end) {
                var rg  = document.createRange();
                var sel = window.getSelection();
                var el  = element.childNodes[0];
                if (el == null) return;
                if (start > el.length) start = el.length;
                rg.setStart(el, start);
                if (end) {
                    rg.setEnd(el, end);
                } else {
                    rg.collapse(true);
                }
                sel.removeAllRanges();
                sel.addRange(rg);
            }            
        },

        editChange: function (el, index, column, event) {
            var obj = this;
            // keep focus
            setTimeout(function () {
                var $input = $(obj.box).find('#grid_'+ obj.name + '_focus');
                if (!$input.is(':focus')) $input.focus();
            }, 10);
            // all other fields
            var summary = index < 0;
            index = index < 0 ? -index - 1 : index;
            var records = summary ? this.summary : this.records;
            var rec     = records[index];
            var col     = this.columns[column];
            var tr      = $('#grid_'+ this.name + (col.frozen === true ? '_frec_' : '_rec_') + w2utils.escapeId(rec.recid));
            var new_val = (el.tagName == 'DIV' ? $(el).text() : el.value);
            var old_val = this.parseField(rec, col.field);
            var tmp     = $(el).data('w2field');
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
            if (old_val == null) old_val = '';
            while (true) {
                new_val = eventData.value_new;
                if ((typeof new_val != 'object' && String(old_val) != String(new_val)) ||
                    (typeof new_val == 'object' && new_val.id != old_val && (typeof old_val != 'object' || old_val == null || new_val.id != old_val.id))) {
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
            var cell = $(tr).find('[col='+ column +']')
            if (!summary) {
                if (rec.changes && typeof rec.changes[col.field] != 'undefined') {
                    cell.addClass('w2ui-changed');
                } else {
                    cell.removeClass('w2ui-changed');
                }
                // update cell data
                if (!cell.hasClass('w2ui-soft-hidden')) {
                    cell.html(this.getCellHTML(index, column, summary));
                } else {
                    cell.html('<div class="cell-value"></div>');
                }
                this.refreshSpans(rec.recid);
            }
            // remove
            $(this.box).find('div.w2ui-edit-box').remove();
            // enable/disable toolbar search button
            if (this.show.toolbarSave) {
                if (this.getChanges().length > 0) this.toolbar.enable('w2ui-save'); else this.toolbar.disable('w2ui-save');
            }
        },

        "delete": function (force) {
            var time = (new Date()).getTime();
            var obj = this;
            // event before
            var eventData = this.trigger({ phase: 'before', target: this.name, type: 'delete', force: force });
            if (eventData.isCancelled === true) return;
            force = eventData.force;
            // default action
            var recs = this.getSelection();
            if (recs.length == 0) return;
            if (this.msgDelete != '' && !force) {
                w2confirm({
                    title : w2utils.lang('Delete Confirmation'),
                    msg   : w2utils.lang(obj.msgDelete),
                    yes_class : 'w2ui-btn-red',
                    callBack: function (result) {
                        if (result == 'Yes') w2ui[obj.name]['delete'](true);
                    }
                });
                return;
            }
            // call delete script
            var url = (typeof this.url != 'object' ? this.url : this.url.remove);
            if (url) {
                this.request('delete-records');
            } else {
                if (typeof recs[0] != 'object') {
                    this.selectNone();
                    this.remove.apply(this, recs);
                } else {
                    // clear cells
                    for (var r = 0; r < recs.length; r++) {
                        var fld = this.columns[recs[r].column].field;
                        var ind = this.get(recs[r].recid, true);
                        var rec = this.records[ind];
                        if (ind != null && fld != 'recid') {
                            this.records[ind][fld] = '';
                            if (rec.changes) delete rec.changes[fld];
                            // -- style should not be deleted
                            // if (rec.style != null && $.isPlainObject(rec.style) && rec.style[recs[r].column]) {
                            //     delete rec.style[recs[r].column];
                            // }
                        }
                    }
                    this.update();
                }
            }
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
        },

        click: function (recid, event) {
            if (this.last.skipClick) {
                delete this.last.skipClick;
                return;
            }
            var time   = (new Date()).getTime();
            var column = null;
            var obj    = this;
            if (this.last.cancelClick == true || (event && event.altKey)) return;
            if (typeof recid == 'object') {
                column = recid.column;
                recid  = recid.recid;
            }
            if (typeof event == 'undefined') event = {};
            // check for double click
            if (time - parseInt(this.last.click_time) < 350 && this.last.click_recid == recid && event.type == 'click') {
                this.dblClick(recid, event);
                return;
            }
            this.last.click_time  = time;
            this.last.click_recid = recid;
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
                var sel_add = [];
                if (start > end) { var tmp = start; start = end; end = tmp; }
                var url = (typeof this.url != 'object' ? this.url : this.url.get);
                for (var i = start; i <= end; i++) {
                    if (this.searchData.length > 0 && !url && $.inArray(i, this.last.searchIds) == -1) continue;
                    if (this.selectType == 'row') {
                        sel_add.push(this.records[i].recid);
                    } else {
                        for (var sc = 0; sc < selectColumns.length; sc++) {
                            sel_add.push({ recid: this.records[i].recid, column: selectColumns[sc] });
                        }
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
                    if (flag === true && sel.length == 1) {
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
            if (this.selectType == 'row') {
                var column = this.getColumn(field);
                if (column && column.sortable) this.sort(field, null, (event && (event.ctrlKey || event.metaKey) ? true : false) );
                if (eventData.field == 'line-number') {
                    if (this.getSelection().length >= this.records.length) {
                        this.selectNone(); 
                    } else {
                        this.selectAll();
                    }
                }
            } else {
                // select entire column
                if (eventData.field == 'line-number') {
                    if (this.getSelection().length >= this.records.length) {
                        this.selectNone(); 
                    } else {
                        this.selectAll();
                    }
                } else {
                    if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
                        this.selectNone();
                    }
                    var tmp     = this.getSelection();
                    var column  = this.getColumn(eventData.field, true);
                    var sel     = [];
                    var cols    = [];
                    // check if there was a selection before
                    if (tmp.length != 0 && event.shiftKey) {
                        var start = column;
                        var end = tmp[0].column;
                        if (start > end) {
                            start = tmp[0].column;
                            end = column;
                        }
                        for (var i=start; i<=end; i++) cols.push(i);
                    } else {
                        cols.push(column);
                    }
                    // --
                    for (var i = 0; i < this.records.length; i++) {
                        sel.push({ recid: this.records[i].recid, column: cols });
                    }
                    this.select.apply(this, sel);
                }
            }
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
        },

        focus: function (event) {
            var obj = this;
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'focus', target: this.name, originalEvent: event });
            if (eventData.isCancelled === true) return false;
            // default behaviour
            this.hasFocus = true;
            $(this.box).find('.w2ui-inactive').removeClass('w2ui-inactive');
            setTimeout(function () {
                var $input = $(obj.box).find('#grid_'+ obj.name + '_focus');
                if (!$input.is(':focus')) $input.focus();
            }, 10);
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
        },

        blur: function (event) {
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'blur', target: this.name, originalEvent: event });
            if (eventData.isCancelled === true) return false;
            // default behaviour
            this.hasFocus = false;
            $(this.box).find('.w2ui-selected').addClass('w2ui-inactive');
            $(this.box).find('.w2ui-selection').addClass('w2ui-inactive');
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
            var empty   = false;
            var records = $('#grid_'+ obj.name +'_records');
            var sel     = obj.getSelection();
            if (sel.length == 0) empty = true;
            var recid   = sel[0] || null;
            var columns = [];
            var recid2  = sel[sel.length-1];
            if (typeof recid == 'object' && recid != null) {
                recid   = sel[0].recid;
                columns = [];
                var ii  = 0;
                while (true) {
                    if (!sel[ii] || sel[ii].recid != recid) break;
                    columns.push(sel[ii].column);
                    ii++;
                }
                recid2 = sel[sel.length-1].recid;
            }
            var ind      = obj.get(recid, true);
            var ind2     = obj.get(recid2, true);
            var rec      = obj.get(recid);
            var recEL    = $('#grid_'+ obj.name +'_rec_'+ (ind !== null ? w2utils.escapeId(obj.records[ind].recid) : 'none'));
            var cancel   = false;
            var key      = event.keyCode;
            var shiftKey = event.shiftKey;

            switch (key) {
                case 8:  // backspace
                case 46: // delete
                    if (this.show.toolbarDelete || this.onDelete) obj["delete"]();
                    cancel = true;
                    event.stopPropagation();
                    break;

                case 27: // escape
                    obj.selectNone();
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
                        for (var c = 0; c < this.columns.length; c++) {
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
                    if (empty) {
                        selectTopRecord();
                        break;
                    }
                    // check if this is subgrid
                    var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid)).parents('tr');
                    if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
                        var recid = parent.prev().attr('recid');
                        var grid  = parent.parents('.w2ui-grid').attr('name');
                        obj.selectNone();
                        // w2utils.keyboard.active(grid, event);
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
                        var prev = obj.prevCell(ind, columns[0]);
                        if (!shiftKey && prev == null) {
                            this.selectNone();
                            prev = 0;
                        }
                        if (prev != null) {
                            if (shiftKey && obj.multiSelect) {
                                if (tmpUnselect()) return;
                                var tmp    = [];
                                var newSel = [];
                                var unSel  = [];
                                if (columns.indexOf(this.last.sel_col) == 0 && columns.length > 1) {
                                    for (var i = 0; i < sel.length; i++) {
                                        if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
                                        unSel.push({ recid: sel[i].recid, column: columns[columns.length-1] });
                                    }
                                } else {
                                    for (var i = 0; i < sel.length; i++) {
                                        if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
                                        newSel.push({ recid: sel[i].recid, column: prev });
                                    }
                                }
                                obj.unselect.apply(obj, unSel);
                                obj.select.apply(obj, newSel);
                            } else {
                                event.shiftKey = false;
                                obj.click({ recid: recid, column: prev }, event);
                                obj.scrollIntoView(ind, prev);
                            }
                        } else {
                            // if selected more then one, then select first
                            if (!shiftKey) {
                                if (sel.length > 1) {
                                    obj.selectNone();
                                } else {
                                    for (var s = 1; s < sel.length; s++) obj.unselect(sel[s]);
                                }
                            }
                        }
                    }
                    cancel = true;
                    break;

                case 39: // right
                    if (empty) {
                        selectTopRecord();
                        break;
                    }
                    if (this.selectType == 'row') {
                        if (recEL.length <= 0 || rec.expanded === true || obj.show.expandColumn !== true) break;
                        obj.expand(recid, event);
                    } else {
                        var next = obj.nextCell(ind, columns[columns.length-1]);
                        if (!shiftKey && next == null) {
                            this.selectNone();
                            next = this.columns.length-1;
                        }
                        if (next !== null) {
                            if (shiftKey && key == 39 && obj.multiSelect) {
                                if (tmpUnselect()) return;
                                var tmp    = [];
                                var newSel = [];
                                var unSel  = [];
                                if (columns.indexOf(this.last.sel_col) == columns.length-1 && columns.length > 1) {
                                    for (var i = 0; i < sel.length; i++) {
                                        if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
                                        unSel.push({ recid: sel[i].recid, column: columns[0] });
                                    }
                                } else {
                                    for (var i = 0; i < sel.length; i++) {
                                        if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid);
                                        newSel.push({ recid: sel[i].recid, column: next });
                                    }
                                }
                                obj.unselect.apply(obj, unSel);
                                obj.select.apply(obj, newSel);
                            } else {
                                event.shiftKey = false;
                                obj.click({ recid: recid, column: next }, event);
                                obj.scrollIntoView(ind, next);
                            }
                        } else {
                            // if selected more then one, then select first
                            if (!shiftKey) {
                                if (sel.length > 1) {
                                    obj.selectNone();
                                } else {
                                    for (var s = 0; s < sel.length-1; s++) obj.unselect(sel[s]);
                                }
                            }
                        }
                    }
                    cancel = true;
                    break;

                case 38: // up
                    if (empty) selectTopRecord();
                    if (recEL.length <= 0) break;
                    // move to the previous record
                    var prev = obj.prevRow(ind, columns[0]);
                    if (!shiftKey && prev == null) {
                        if (this.searchData.length != 0 && !this.url) {
                            prev = this.last.searchIds[0];
                        } else {
                            prev = 0;
                        }
                    }
                    if (prev != null) {
                        // jump into subgrid
                        if (obj.records[prev].expanded) {
                            var subgrid = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[prev].recid) +'_expanded_row').find('.w2ui-grid');
                            if (subgrid.length > 0 && w2ui[subgrid.attr('name')]) {
                                obj.selectNone();
                                var grid = subgrid.attr('name');
                                var recs = w2ui[grid].records;
                                // w2utils.keyboard.active(grid, event);
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
                                    for (var c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[prev].recid, column: columns[c] });
                                    obj.unselect.apply(obj, tmp);
                                } else {
                                    var tmp = [];
                                    for (var c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[prev].recid, column: columns[c] });
                                    obj.select.apply(obj, tmp);
                                }
                            }
                        } else { // move selected record
                            if (sel.length > 300) this.selectNone(); else this.unselect.apply(this, sel);
                            obj.click({ recid: obj.records[prev].recid, column: columns[0] }, event);
                        }
                        obj.scrollIntoView(prev);
                        if (event.preventDefault) event.preventDefault();
                    } else {
                        // if selected more then one, then select first
                        if (!shiftKey) {
                            if (sel.length > 1) {
                                obj.selectNone();
                            } else {
                                for (var s = 1; s < sel.length; s++) obj.unselect(sel[s]);
                            }
                        }
                        // jump out of subgird (if first record)
                        var parent = $('#grid_'+ obj.name +'_rec_'+ w2utils.escapeId(obj.records[ind].recid)).parents('tr');
                        if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
                            var recid = parent.prev().attr('recid');
                            var grid  = parent.parents('.w2ui-grid').attr('name');
                            obj.selectNone();
                            // w2utils.keyboard.active(grid, event);
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
                            // w2utils.keyboard.active(grid, event);
                            w2ui[grid].click(recs[0].recid);
                            cancel = true;
                            break;
                        }
                    }
                    // move to the next record
                    var next = obj.nextRow(ind2, columns[0]);
                    if (!shiftKey && next == null) {
                        if (this.searchData.length != 0 && !this.url) {
                            next = this.last.searchIds[this.last.searchIds.length - 1];
                        } else {
                            next = this.records.length - 1;
                        }
                    }
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
                                    for (var c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[next].recid, column: columns[c] });
                                    obj.unselect.apply(obj, tmp);
                                } else {
                                    var tmp = [];
                                    for (var c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[next].recid, column: columns[c] });
                                    obj.select.apply(obj, tmp);
                                }
                            }
                        } else { // move selected record
                            if (sel.length > 300) this.selectNone(); else this.unselect.apply(this, sel);
                            obj.click({ recid: obj.records[next].recid, column: columns[0] }, event);
                        }
                        obj.scrollIntoView(next);
                        cancel = true;
                    } else {
                        // if selected more then one, then select first
                        if (!shiftKey) {
                            if (sel.length > 1) {
                                obj.selectNone();
                            } else {
                                for (var s = 0; s < sel.length-1; s++) obj.unselect(sel[s]);
                            }
                        }
                        // jump out of subgrid (if last record in subgrid)
                        var parent = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(obj.records[ind2].recid)).parents('tr');
                        if (parent.length > 0 && String(parent.attr('id')).indexOf('expanded_row') != -1) {
                            var recid = parent.next().attr('recid');
                            var grid  = parent.parents('.w2ui-grid').attr('name');
                            obj.selectNone();
                            // w2utils.keyboard.active(grid, event);
                            w2ui[grid].click(recid);
                            cancel = true;
                            break;
                        }
                    }
                    break;

                // copy & paste

                case 17: // ctrl key
                case 91: // cmd key
                    // SLOW: 10k records take 7.0
                    if (empty) break;
                    obj.last.copy_event = obj.copy(false);
                    $('#grid_'+ obj.name + '_focus').val(obj.last.copy_event.text).select();
                    break;

                case 67: // - c
                    // this fill trigger event.onComplete
                    if (event.metaKey || event.ctrlKey) {
                        obj.copy(obj.last.copy_event);
                    }
                    break;

                case 88: // x - cut
                    if (empty) break;
                    if (event.ctrlKey || event.metaKey) {
                        setTimeout(function () { obj["delete"](true); }, 100);
                    }
                    break;
            }
            var tmp = [32, 187, 189, 192, 219, 220, 221, 186, 222, 188, 190, 191]; // other typable chars
            for (var i=48; i<=90; i++) tmp.push(i); // 0-9,a-z,A-Z
            if (tmp.indexOf(key) != -1 && !event.ctrlKey && !event.metaKey && !cancel) {
                if (columns.length == 0) columns.push(0);
                var tmp = String.fromCharCode(key);
                if (!shiftKey) tmp = tmp.toLowerCase();
                switch (key) {
                    case 49:  tmp = (!event.shiftKey ? '1' : '!'); break;
                    case 50:  tmp = (!event.shiftKey ? '2' : '@'); break;
                    case 51:  tmp = (!event.shiftKey ? '3' : '#'); break;
                    case 52:  tmp = (!event.shiftKey ? '4' : '$'); break;
                    case 53:  tmp = (!event.shiftKey ? '5' : '%'); break;
                    case 54:  tmp = (!event.shiftKey ? '6' : '^'); break;
                    case 55:  tmp = (!event.shiftKey ? '7' : '&'); break;
                    case 56:  tmp = (!event.shiftKey ? '8' : '*'); break;
                    case 57:  tmp = (!event.shiftKey ? '9' : '('); break;
                    case 48:  tmp = (!event.shiftKey ? '0' : ')'); break;
                    case 187: tmp = (!event.shiftKey ? '=' : '+'); break;
                    case 189: tmp = (!event.shiftKey ? '-' : '_'); break;
                    case 192: tmp = (!event.shiftKey ? '`' : '~'); break;
                    case 219: tmp = (!event.shiftKey ? '[' : '{'); break;
                    case 220: tmp = (!event.shiftKey ? '\\' : '|'); break;
                    case 221: tmp = (!event.shiftKey ? ']' : '}'); break;
                    case 186: tmp = (!event.shiftKey ? ';' : ':'); break;
                    case 222: tmp = (!event.shiftKey ? '\'' : '"'); break;
                    case 188: tmp = (!event.shiftKey ? ',' : '<'); break;
                    case 190: tmp = (!event.shiftKey ? '.' : '>'); break;
                    case 191: tmp = (!event.shiftKey ? '/' : '?'); break;
                }
                obj.editField(recid, columns[0], tmp, event);
                cancel = true;
            }
            if (cancel) { // cancel default behaviour
                if (event.preventDefault) event.preventDefault();
            }
            // event after
            obj.trigger($.extend(eventData, { phase: 'after' }));

            function selectTopRecord() {
                var ind = Math.floor(records[0].scrollTop / obj.recordHeight) + 1;
                if (!obj.records[ind] || ind < 2) ind = 0;
                obj.select({ recid: obj.records[ind].recid, column: 0});
            }

            function tmpUnselect () {
                if (obj.last.sel_type != 'click') return false;
                if (obj.selectType != 'row') {
                    obj.last.sel_type = 'key';
                    if (sel.length > 1) {
                        for (var s = 0; s < sel.length; s++) {
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

        scrollIntoView: function (ind, column) {
            var buffered = this.records.length;
            if (this.searchData.length != 0 && !this.url) buffered = this.last.searchIds.length;
            if (buffered == 0) return;
            if (typeof ind == 'undefined') {
                var sel = this.getSelection();
                if (sel.length == 0) return;
                if ($.isPlainObject(sel[0])) {
                    ind     = sel[0].index;
                    column  = sel[0].column;
                } else {
                    ind = this.get(sel[0], true);
                }
            }
            var records = $('#grid_'+ this.name +'_records');
            // if all records in view
            var len = this.last.searchIds.length;
            if (len > 0) ind = this.last.searchIds.indexOf(ind); // if seach is applied

            // vertical
            if (records.height() < this.recordHeight * (len > 0 ? len : buffered)) {
                // scroll to correct one
                var t1 = Math.floor(records[0].scrollTop / this.recordHeight);
                var t2 = t1 + Math.floor(records.height() / this.recordHeight);
                if (ind == t1) records.animate({ 'scrollTop': records.scrollTop() - records.height() / 1.3 }, 250, 'linear');
                if (ind == t2) records.animate({ 'scrollTop': records.scrollTop() + records.height() / 1.3 }, 250, 'linear');
                if (ind < t1 || ind > t2) records.animate({ 'scrollTop': (ind - 1) * this.recordHeight });
            }

            // horizontal
            if (column != null) {
                var x1 = 0;
                var x2 = 0;
                for (var i = 0; i <= column; i++) {
                    var col = this.columns[i];
                    if (col.frozen || col.hidden) continue;
                    x1 = x2;
                    x2 += parseInt(col.sizeCalculated);
                }
                if (records.width() < x2 - records.scrollLeft()) { // right
                    records.animate({ 'scrollLeft': x1 - 20 }, 250, 'linear');
                } else if (x1 < records.scrollLeft()) { // left
                    records.animate({ 'scrollLeft': x2 - records.width() + 40 }, 250, 'linear'); // 40 because scrollbar is 20
                }
            }
        },

        dblClick: function (recid, event) {
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

        contextMenu: function (recid, column, event) {
            var obj = this;
            if (obj.last.userSelect == 'text') return;
            if (typeof event == 'undefined') event = { offsetX: 0, offsetY: 0, target: $('#grid_'+ obj.name +'_rec_'+ recid)[0] };
            if (typeof event.offsetX === 'undefined') {
                event.offsetX = event.layerX - event.target.offsetLeft;
                event.offsetY = event.layerY - event.target.offsetTop;
            }
            if (w2utils.isFloat(recid)) recid = parseFloat(recid);
            var sel = this.getSelection();
            if (this.selectType == 'row') {
                if (sel.indexOf(recid) == -1) obj.click(recid);
            } else {
                var $tmp = $(event.target);
                if ($tmp[0].tagName != 'TD') $tmp = $(event.target).parents('td');
                var selected = false;
                column = $tmp.attr('col');
                // check if any selected sel in the right row/column
                for (var i=0; i<sel.length; i++) {
                    if (sel[i].recid == recid || sel[i].column == column) selected = true;
                }
                if (!selected && recid != null) obj.click({ recid: recid, column: column });
                if (!selected && column != null) obj.columnClick(this.columns[column].field, event);
            }
            // event before
            var eventData = obj.trigger({ phase: 'before', type: 'contextMenu', target: obj.name, originalEvent: event, recid: recid, column: column });
            if (eventData.isCancelled === true) return;
            // default action
            if (obj.menu.length > 0) {
                $(obj.box).find(event.target)
                    .w2menu(obj.menu, {
                        originalEvent: event,
                        contextMenu: true,
                        onSelect: function (event) {
                            obj.menuClick(recid, parseInt(event.index), event.originalEvent);
                        }
                    }
                );
            }
            // cancel event
            if (event.preventDefault) event.preventDefault();
            // event after
            obj.trigger($.extend(eventData, { phase: 'after' }));
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
                    '<tr id="grid_'+ this.name +'_rec_'+ recid +'_expanded_row" class="w2ui-expanded-row '+ addClass +'">'+
                        (this.show.lineNumbers ? '<td class="w2ui-col-number"></td>' : '') +
                    '    <td class="w2ui-grid-data w2ui-expanded1" colspan="'+ tmp +'"><div style="display: none"></div></td>'+
                    '    <td colspan="100" class="w2ui-expanded2">'+
                    '        <div id="grid_'+ this.name +'_rec_'+ recid +'_expanded" style="opacity: 0"></div>'+
                    '    </td>'+
                    '</tr>');
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: recid,
                box_id: 'grid_'+ this.name +'_rec_'+ recid +'_expanded', ready: ready });
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
                for (var s = 0; s < this.sortData.length; s++) {
                    if (this.sortData[s].field == field) { sortIndex = s; break; }
                }
                if (typeof direction == 'undefined' || direction == null) {
                    if (typeof this.sortData[sortIndex] == 'undefined') {
                        direction = 'asc';
                    } else {
                        switch (String(this.sortData[sortIndex].direction)) {
                            case 'asc'  : direction = 'desc'; break;
                            case 'desc' : direction = 'asc';  break;
                            default     : direction = 'asc';  break;
                        }
                    }
                }
                if (this.multiSort === false) { this.sortData = []; sortIndex = 0; }
                if (multiField != true) { this.sortData = []; sortIndex = 0; }
                // set new sort
                if (typeof this.sortData[sortIndex] == 'undefined') this.sortData[sortIndex] = {};
                this.sortData[sortIndex].field        = field;
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

        copy: function (flag) {
            if ($.isPlainObject(flag)) {
                // event after
                this.trigger($.extend(flag, { phase: 'after' }));
                return flag.text;
            }
            // generate text to copy
            var sel = this.getSelection();
            if (sel.length == 0) return '';
            var text = '';
            if (typeof sel[0] == 'object') { // cell copy
                // find min/max column
                var minCol = sel[0].column;
                var maxCol = sel[0].column;
                var recs   = [];
                for (var s = 0; s < sel.length; s++) {
                    if (sel[s].column < minCol) minCol = sel[s].column;
                    if (sel[s].column > maxCol) maxCol = sel[s].column;
                    if (recs.indexOf(sel[s].index) == -1) recs.push(sel[s].index);
                }
                recs.sort(function(a, b) { return a-b; }); // sort function must be for numerical sort
                for (var r = 0 ; r < recs.length; r++) {
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
                // copy headers
                for (var c = 0; c < this.columns.length; c++) {
                    var col = this.columns[c];
                    if (col.hidden === true) continue;
                    text += '"' + w2utils.stripTags(col.caption ? col.caption : col.field) + '"\t';
                }
                text = text.substr(0, text.length-1); // remove last \t
                text += '\n';
                // copy selected text
                for (var s = 0; s < sel.length; s++) {
                    var ind = this.get(sel[s], true);
                    for (var c = 0; c < this.columns.length; c++) {
                        var col = this.columns[c];
                        if (col.hidden === true) continue;
                        text += '"' + w2utils.stripTags(this.getCellHTML(ind, c)) + '"\t';
                    }
                    text = text.substr(0, text.length-1); // remove last \t
                    text += '\n';
                }
            }
            text = text.substr(0, text.length - 1);

            // if called without params
            if (flag == null) {
                // before event
                var eventData = this.trigger({ phase: 'before', type: 'copy', target: this.name, text: text });
                if (eventData.isCancelled === true) return '';
                text = eventData.text;
                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
                return text;
            } else if (flag === false) { // only before event
                // before event
                var eventData = this.trigger({ phase: 'before', type: 'copy', target: this.name, text: text });
                if (eventData.isCancelled === true) return '';
                text = eventData.text;
                return eventData;
            }
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
            for (var t = 0; t < text.length; t++) {
                var tmp  = text[t].split('\t');
                var cnt  = 0;
                var rec  = this.records[ind];
                var cols = [];
                if (rec == null) continue;
                for (var dt = 0; dt < tmp.length; dt++) {
                    if (!this.columns[col + cnt]) continue;
                    var field = this.columns[col + cnt].field;
                    rec.changes = rec.changes || {};
                    rec.changes[field] = tmp[dt];
                    cols.push(col + cnt);
                    cnt++;
                }
                for (var c = 0; c < cols.length; c++) newSel.push({ recid: rec.recid, column: cols[c] });
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
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        update: function () {
            var time = (new Date()).getTime();
            if (this.box == null) return 0;
            for (var index = this.last.range_start - 1; index <= this.last.range_end - 1; index++) {
                if (index < 0) continue;
                var rec = this.records[index];
                for (var col_ind = 0; col_ind < this.columns.length; col_ind++) {
                    var cell = $(this.box).find('#grid_'+ this.name + '_data_'+ index +'_'+ col_ind);
                    if (!cell.hasClass('w2ui-soft-hidden')) {
                        cell.html(this.getCellHTML(index, col_ind, false));
                    } else {
                        cell.html('<div class="cell-value"></div>');
                    }
                    // assign style
                    if (rec.style != null && !$.isEmptyObject(rec.style)) {
                        if (typeof rec.style == 'string') {
                            $(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(rec.recid)).attr('style', rec.style);
                        }
                        if ($.isPlainObject(rec.style) && typeof rec.style[col_ind] == 'string') {
                            cell.attr('style', rec.style[col_ind]);
                        }
                    } else {
                        cell.attr('style', '');
                    }
                }
            }
            this.refreshSpans();
            return (new Date()).getTime() - time;
        },

        refreshCell: function (recid, field) {
            var index     = this.get(recid, true);
            var isSummary = (this.records[index] && this.records[index].recid == recid ? false : true);
            var col_ind   = this.getColumn(field, true);
            var rec       = (isSummary ? this.summary[index] : this.records[index]);
            var col       = this.columns[col_ind];
            var cell      = $(this.box).find('#grid_'+ this.name + '_data_'+ index +'_'+ col_ind);
            // set cell html and changed flag
            if (!cell.hasClass('w2ui-soft-hidden')) {
                cell.html(this.getCellHTML(index, col_ind, isSummary));
            } else {
                cell.html('<div class="cell-value"></div>');
            }
            if (rec.changes && typeof rec.changes[col.field] != 'undefined') {
                cell.addClass('w2ui-changed');
            } else {
                cell.removeClass('w2ui-changed');
            }
            // assign style
            if (rec.style != null && !$.isEmptyObject(rec.style)) {
                if (typeof rec.style == 'string') {
                    $(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(rec.recid)).attr('style', rec.style);
                }
                if ($.isPlainObject(rec.style) && typeof rec.style[col_ind] == 'string') {
                    cell.attr('style', rec.style[col_ind]);
                }
            } else {
                cell.attr('style', '');
            }
        },

        refreshRow: function (recid, ind) {
            var tr1 = $(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid));
            var tr2 = $(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
            if (tr1.length > 0) {
                if (ind == null) ind = this.get(recid, true);
                var line = tr1.attr('line');
                var isSummary = (this.records[ind] && this.records[ind].recid == recid ? false : true);
                // if it is searched, find index in search array
                var url = (typeof this.url != 'object' ? this.url : this.url.get);
                if (this.searchData.length > 0 && !url) for (var s = 0; s < this.last.searchIds.length; s++) if (this.last.searchIds[s] == ind) ind = s;
                var rec_html = this.getRecordHTML(ind, line, isSummary);
                $(tr1).replaceWith(rec_html[0]);
                $(tr2).replaceWith(rec_html[1]);
                // apply style to row if it was changed in render functions
                var st = this.records[ind].style;
                if (typeof st == 'string') {
                    var tr1 = $(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid));
                    var tr2 = $(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid));
                    tr1.attr('custom_style', st);
                    tr2.attr('custom_style', st);
                    if (!tr1.hasClass('w2ui-selected')) {
                        tr1[0].style.cssText = 'height: '+ this.recordHeight + 'px;' + st;
                        tr2[0].style.cssText = 'height: '+ this.recordHeight + 'px;' +st;
                    }
                }
                if (isSummary) {
                    this.resize(); // resize will trigger refreshSpans
                } else {
                    this.refreshSpans(recid);
                }
            }
        },

        refresh: function () {
            var obj  = this;
            var time = (new Date()).getTime();
            var url = (typeof this.url != 'object' ? this.url : this.url.get);
            if (this.total <= 0 && !url && this.searchData.length == 0) {
                this.total = this.records.length;
            }
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
                        for (var t = 0; t < tmp.length; t++) {
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
                this.last.field   = this.searches[0].field;
                this.last.caption = this.searches[0].caption;
            }
            for (var s = 0; s < this.searches.length; s++) {
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
                this.summary = [];    
                for (var t = 0; t < tmp.length; t++) this.summary.push(this.records[tmp[t]]);
                for (var t = tmp.length-1; t >= 0; t--) this.records.splice(tmp[t], 1);
            }

            // -- body
            var recHTML  = this.getRecordsHTML();
            var colHTML  = this.getColumnsHTML();
            var bodyHTML =
                '<div id="grid_'+ this.name +'_frecords" class="w2ui-grid-frecords" style="margin-bottom: '+ (w2utils.scrollBarSize() - 1) +'px;">'+
                    recHTML[0] +
                '</div>'+
                '<div id="grid_'+ this.name +'_records" class="w2ui-grid-records" onscroll="w2ui[\''+ this.name +'\'].scroll(event);">' +
                    recHTML[1] +
                '</div>'+
                '<div id="grid_'+ this.name +'_scroll1" class="w2ui-grid-scroll1" style="height: '+ w2utils.scrollBarSize() +'px"></div>'+
                // Columns need to be after to be able to overlap
                '<div id="grid_'+ this.name +'_fcolumns" class="w2ui-grid-columns">'+
                '    <table>'+ colHTML[0] +'</table>'+
                '</div>'+
                '<div id="grid_'+ this.name +'_columns" class="w2ui-grid-columns">'+
                '    <table>'+ colHTML[1] +'</table>'+
                '</div>';
            $('#grid_'+ this.name +'_body').html(bodyHTML);
            // show summary records
            if (this.summary.length > 0) {
                var sumHTML = this.getSummaryHTML();
                $('#grid_'+ this.name +'_fsummary').html(sumHTML[0]).show();
                $('#grid_'+ this.name +'_summary').html(sumHTML[1]).show();
            } else {
                $('#grid_'+ this.name +'_fsummary').hide();
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
            for (var r = 0; r < rows.length; r++) obj.records[rows[r]].expanded = false;
            // mark selection
            setTimeout(function () {
                var str  = $.trim($('#grid_'+ obj.name +'_search_all').val());
                if (str != '' && obj.markSearch) $(obj.box).find('.w2ui-grid-data > div').w2marker(str);
            }, 50);
            // enable/disable toolbar search button
            if (this.show.toolbarSave) {
                if (this.getChanges().length > 0) this.toolbar.enable('w2ui-save'); else this.toolbar.disable('w2ui-save');
            }
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            obj.resize();
            obj.addRange('selection');
            setTimeout(function () { // allow to render first
                obj.resize(); // needed for horizontal scroll to show (do not remove)
                obj.scroll(); 
            }, 1);

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
            if (box != null) {
                if ($(this.box).find('#grid_'+ this.name +'_body').length > 0) {
                    $(this.box)
                        .removeAttr('name')
                        .removeClass('w2ui-reset w2ui-grid')
                        .html('');
                }
                this.box = box;
            }
            if (!this.box) return;
            // event before
            var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: box });
            if (eventData.isCancelled === true) return;
            // reset needed if grid existed
            this.reset(true);
            // insert elements
            $(this.box)
                .attr('name', this.name)
                .addClass('w2ui-reset w2ui-grid')
                .html('<div>'+
                      '    <div id="grid_'+ this.name +'_header" class="w2ui-grid-header"></div>'+
                      '    <div id="grid_'+ this.name +'_toolbar" class="w2ui-grid-toolbar"></div>'+
                      '    <div id="grid_'+ this.name +'_body" class="w2ui-grid-body"></div>'+
                      '    <div id="grid_'+ this.name +'_fsummary" class="w2ui-grid-body w2ui-grid-summary"></div>'+
                      '    <div id="grid_'+ this.name +'_summary" class="w2ui-grid-body w2ui-grid-summary"></div>'+
                      '    <div id="grid_'+ this.name +'_footer" class="w2ui-grid-footer"></div>'+
                      '    <textarea id="grid_'+ this.name +'_focus" style="position: absolute; top: -10px; right: 0px; z-index: 1; '+
                      '         width: 1px; height: 1px; border: 0px; padding: 0px; opacity: 0; resize: none"></textarea>'+
                      '</div>');
            if (this.selectType != 'row') $(this.box).addClass('w2ui-ss');
            if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
            // init toolbar
            this.initToolbar();
            if (this.toolbar != null) this.toolbar.render($('#grid_'+ this.name +'_toolbar')[0]);
            // reinit search_all
            if (this.last.field && this.last.field != 'all') {
                var sd = this.searchData;
                setTimeout(function () { obj.initAllField(obj.last.field, (sd.length == 1 ? sd[0].value : null)); }, 1);
            }
            // init footer
            $('#grid_'+ this.name +'_footer').html(this.getFooterHTML());
            // refresh
            if (!this.last.state) this.last.state = this.stateSave(true); // initial default state
            this.stateRestore();
            if (this.url) this.refresh(); // show empty grid (need it) - should it be only for remote data source
            this.reload();
            // focus
            $(this.box).find('#grid_'+ this.name + '_focus')
                .on('focus', function (event) { 
                    clearTimeout(obj.last.kbd_timer);
                    if (!obj.hasFocus) obj.focus();
                })
                .on('blur', function (event) { 
                    obj.last.kbd_timer = setTimeout(function () { 
                        if (obj.hasFocus) { obj.blur(); }
                    }, 100); // need this timer to be 100 ms
                })
                .on('paste', function (event) {
                    var el = this;
                    setTimeout(function () { w2ui[obj.name].paste(el.value); }, 1)
                })
                .on('keydown', function (event) {
                    w2ui[obj.name].keydown.call(w2ui[obj.name], event);
                });
            // init mouse events for mouse selection
            $(this.box).on('mousedown', mouseStart);
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            // attach to resize event
            if ($('.w2ui-layout').length == 0) { // if there is layout, it will send a resize event
                this.tmp_resize = function (event) { w2ui[obj.name].resize(); };
                $(window).off('resize', this.tmp_resize).on('resize', this.tmp_resize);
            }
            return (new Date()).getTime() - time;

            function mouseStart (event) {
                // skip record click if was not in focus
                if (!obj.hasFocus && $(event.target).parents('table').parent().hasClass('w2ui-grid-records') && obj.getSelection().length != 0) {
                    obj.last.skipClick = true;
                }
                // set focus to grid
                var target = event.target;
                setTimeout(function () {
                    var $input = $(obj.box).find('#grid_'+ obj.name + '_focus');
                    if (!$input.is(':focus')) $input.focus();
                    // if toolbar input is clicked
                    setTimeout(function () {
                        if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(target.tagName) != -1) $(target).focus();
                    }, 50);
                }, 1);

                if (event.which != 1) return; // if not left mouse button
                // restore css user-select
                if (obj.last.userSelect == 'text') {
                    delete obj.last.userSelect;
                    $(obj.box).find('.w2ui-grid-body').css(w2utils.cssPrefix('user-select', 'none'));
                }
                // regular record select
                if (obj.selectType == 'row' && ($(event.target).parents().hasClass('w2ui-head') || $(event.target).hasClass('w2ui-head'))) return;
                if (obj.last.move && obj.last.move.type == 'expand') return;
                // if altKey - alow text selection
                if (event.altKey) {
                    $(obj.box).find('.w2ui-grid-body').css(w2utils.cssPrefix('user-select', 'text'));
                    obj.selectNone();
                    obj.last.move = { type: 'text-select' };
                    obj.last.userSelect = 'text';
                } else {
                    if (!obj.multiSelect) return;
                    obj.last.move = {
                        x      : event.screenX,
                        y      : event.screenY,
                        divX   : 0,
                        divY   : 0,
                        recid  : $(event.target).parents('tr').attr('recid'),
                        column : parseInt(event.target.tagName == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col')),
                        type   : 'select',
                        ghost  : false,
                        start  : true
                    };
                }
                if (obj.reorderRows == true) {
                    var el = event.target;
                    if (el.tagName != 'TD') el = $(el).parents('td')[0];
                    if ($(el).hasClass('w2ui-col-number')) {
                        obj.selectNone();
                        obj.last.move.reorder = true;
                        // supress hover
                        var eColor = $(obj.box).find('.w2ui-even.w2ui-empty-record').css('background-color');
                        var oColor = $(obj.box).find('.w2ui-odd.w2ui-empty-record').css('background-color');
                        $(obj.box).find('.w2ui-even td').not('.w2ui-col-number').css('background-color', eColor);
                        $(obj.box).find('.w2ui-odd td').not('.w2ui-col-number').css('background-color', oColor);
                        // display empty record and ghost record
                        var mv = obj.last.move;
                        if (!mv.ghost) {
                            var row    = $('#grid_'+ obj.name + '_rec_'+ mv.recid);
                            var tmp    = row.parents('table').find('tr:first-child').clone();
                            mv.offsetY = event.offsetY;
                            mv.from    = mv.recid;
                            mv.pos     = row.position();
                            mv.ghost   = $(row).clone(true);
                            mv.ghost.removeAttr('id');
                            row.find('td').remove();
                            row.append('<td colspan="1000" style="height: '+ obj.recordHeight +'px; background-color: #eee; border-bottom: 1px dashed #aaa; border-top: 1px dashed #aaa;"></td>');
                            var recs = $(obj.box).find('.w2ui-grid-records');
                            recs.append('<table id="grid_'+ obj.name + '_ghost" style="position: absolute; z-index: 999999; opacity: 0.7; pointer-events: none;"></table>');
                            $('#grid_'+ obj.name + '_ghost').append(tmp).append(mv.ghost);
                        }
                        var ghost = $('#grid_'+ obj.name + '_ghost');
                        var recs  = $(obj.box).find('.w2ui-grid-records');
                        ghost.css({
                            top  : mv.pos.top + recs.scrollTop(),
                            left : mv.pos.left,
                            "border-top"    : '1px solid #aaa',
                            "border-bottom" : '1px solid #aaa'
                        });
                    } else {
                        obj.last.move.reorder = false;
                    }
                }
                $(document).on('mousemove', mouseMove);
                $(document).on('mouseup', mouseStop);
            }

            function mouseMove (event) {
                var mv = obj.last.move;
                // console.log('move');
                if (!mv || mv.type != 'select') return;
                mv.divX = (event.screenX - mv.x);
                mv.divY = (event.screenY - mv.y);
                if (Math.abs(mv.divX) <= 1 && Math.abs(mv.divY) <= 1) return; // only if moved more then 1px
                obj.last.cancelClick = true;
                if (obj.reorderRows == true && obj.last.move.reorder) {
                    var tmp   = $(event.target).parents('tr');
                    var recid = tmp.attr('recid');
                    if (recid != mv.from) {
                        var row1 = $('#grid_'+ obj.name + '_rec_'+ mv.recid);
                        var row2 = $('#grid_'+ obj.name + '_rec_'+ recid);
                        $(obj.box).find('.tmp-ghost').css('border-top', '0px');
                        row2.addClass('tmp-ghost').css('border-top', '2px solid #769EFC');
                        // MOVABLE GHOST
                        // if (event.screenY - mv.lastY < 0) row1.after(row2); else row2.after(row1);
                        mv.lastY = event.screenY;
                        mv.to      = recid;
                    }
                    var ghost = $('#grid_'+ obj.name + '_ghost');
                    var recs  = $(obj.box).find('.w2ui-grid-records');
                    ghost.css({
                        top  : mv.pos.top + mv.divY + recs.scrollTop(),
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
                if (recid == null) {
                    // select by dragging columns
                    if (obj.selectType == 'row') return;
                    var col = parseInt($(event.target).parents('td').attr('col'));
                    if (isNaN(col)) {
                        obj.removeRange('column-selection');
                        $(obj.box).find('.w2ui-grid-columns .w2ui-col-header').removeClass('w2ui-col-selected');
                        $(obj.box).find('.w2ui-col-number').removeClass('w2ui-row-selected');
                        delete mv.colRange;
                    } else {
                        // add all columns in between
                        var newRange = col + '-' + col;
                        if (mv.column < col) newRange = mv.column + '-' + col;
                        if (mv.column > col) newRange = col + '-' + mv.column;
                        if (mv.colRange == null) obj.selectNone();
                        // highlight columns
                        var tmp = newRange.split('-');
                        $(obj.box).find('.w2ui-grid-columns .w2ui-col-header').removeClass('w2ui-col-selected');
                        for (var j = parseInt(tmp[0]); j <= parseInt(tmp[1]); j++) {
                            $(obj.box).find('#grid_'+ obj.name +'_column_' + j + ' .w2ui-col-header').addClass('w2ui-col-selected');
                        }
                        $(obj.box).find('.w2ui-col-number').not('.w2ui-head').addClass('w2ui-row-selected');
                        // show new range
                        if (mv.colRange != newRange) {
                            mv.colRange = newRange;
                            obj.removeRange('column-selection');
                            obj.addRange({
                                name  : 'column-selection',
                                range : [{ recid: obj.records[0].recid, column: tmp[0] }, { recid: obj.records[obj.records.length-1].recid, column: tmp[1] }],
                                style : 'background-color: rgba(90, 145, 234, 0.1)'
                            });
                        }
                    }

                } else { // regular selection

                    var ind1  = obj.get(mv.recid, true);
                    // this happens when selection is started on summary row
                    if (ind1 === null || (obj.records[ind1] && obj.records[ind1].recid != mv.recid)) return;
                    var ind2  = obj.get(recid, true);
                    // this happens when selection is extended into summary row (a good place to implement scrolling)
                    if (ind2 === null) return;
                    var col1 = parseInt(mv.column);
                    var col2 = parseInt(event.target.tagName == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col'));
                    if (isNaN(col1) && isNaN(col2)) { // line number select entire record
                        col1 = 0;
                        col2 = obj.columns.length-1;
                    }
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
                        for (var ns = 0; ns < newSel.length; ns++) {
                            var flag = false;
                            for (var s = 0; s < sel.length; s++) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true;
                            if (!flag) tmp.push({ recid: newSel[ns].recid, column: newSel[ns].column });
                        }
                        obj.select.apply(obj, tmp);
                        // remove items
                        var tmp = [];
                        for (var s = 0; s < sel.length; s++) {
                            var flag = false;
                            for (var ns = 0; ns < newSel.length; ns++) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true;
                            if (!flag) tmp.push({ recid: sel[s].recid, column: sel[s].column });
                        }
                        obj.unselect.apply(obj, tmp);
                    } else {
                        if (obj.multiSelect) {
                            var sel = obj.getSelection();
                            for (var ns = 0; ns < newSel.length; ns++) if (sel.indexOf(newSel[ns]) == -1) obj.select(newSel[ns]); // add more items
                            for (var s = 0; s < sel.length; s++) if (newSel.indexOf(sel[s]) == -1) obj.unselect(sel[s]); // remove items
                        }
                    }
                }
            }

            function mouseStop (event) {
                var mv = obj.last.move;
                setTimeout(function () { delete obj.last.cancelClick; }, 1);
                if ($(event.target).parents().hasClass('.w2ui-head') || $(event.target).hasClass('.w2ui-head')) return;
                if (mv && mv.type == 'select') {
                    if (mv.colRange != null) {
                        var tmp = mv.colRange.split('-');
                        var sel = [];
                        for (var i = 0; i < obj.records.length; i++) {
                            var cols = []
                            for (var j = parseInt(tmp[0]); j <= parseInt(tmp[1]); j++) cols.push(j);
                            sel.push({ recid: obj.records[i].recid, column: cols });
                        }
                        obj.select.apply(obj, sel);
                        obj.removeRange('column-selection');
                    }
                    if (obj.reorderRows == true && obj.last.move.reorder) {
                        // event
                        var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'reorderRow', recid: mv.from, moveAfter: mv.to });
                        if (eventData.isCancelled === true) {
                            $('#grid_'+ obj.name + '_ghost').remove();
                            obj.refresh();
                            return;
                        }
                        // default behavior
                        var ind1 = obj.get(mv.from, true);
                        var ind2 = obj.get(mv.to, true);
                        var tmp  = obj.records[ind1];
                        // swap records
                        if (ind1 != null && ind2 != null) {
                            obj.records.splice(ind1, 1);
                            if (ind1 > ind2) {
                                obj.records.splice(ind2, 0, tmp);
                            } else {
                                obj.records.splice(ind2 - 1, 0, tmp);
                            }
                        }
                        $('#grid_'+ obj.name + '_ghost').remove();
                        obj.refresh();
                        // event after
                        obj.trigger($.extend(eventData, { phase: 'after' }));
                    }
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
            if (this.tmp_resize) $(window).off('resize', this.tmp_resize);
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
                            '<table><tr>'+
                            '<td style="width: 30px">'+
                            '    <input id="grid_'+ this.name +'_column_ln_check" type="checkbox" tabindex="-1" '+ (obj.show.lineNumbers ? 'checked' : '') +
                            '        onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'line-numbers\');">'+
                            '</td>'+
                            '<td onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \'line-numbers\'); $(document).click();">'+
                            '    <label for="grid_'+ this.name +'_column_ln_check">'+ w2utils.lang('Line #') +'</label>'+
                            '</td></tr>';
            for (var c = 0; c < this.columns.length; c++) {
                var col = this.columns[c];
                var tmp = this.columns[c].caption;
                if (col.hideable === false) continue;
                if (!tmp && this.columns[c].tooltip) tmp = this.columns[c].tooltip;
                if (!tmp) tmp = '- column '+ (parseInt(c) + 1) +' -';
                col_html += '<tr>'+
                    '<td style="width: 30px">'+
                    '    <input id="grid_'+ this.name +'_column_'+ c +'_check" type="checkbox" tabindex="-1" '+ (col.hidden ? '' : 'checked') +
                    '        onclick="w2ui[\''+ obj.name +'\'].columnOnOff(this, event, \''+ col.field +'\');">'+
                    '</td>'+
                    '<td>'+
                    '    <label for="grid_'+ this.name +'_column_'+ c +'_check">'+ tmp +    '</label>'+
                    '</td>'+
                    '</tr>';
            }
            col_html += '<tr><td colspan="2"><div style="border-top: 1px solid #ddd;"></div></td></tr>';
            var url = (typeof this.url != 'object' ? this.url : this.url.get);
            if (url && obj.show.skipRecords) {
                col_html +=
                        '<tr><td colspan="2" style="padding: 0px">'+
                        '    <div style="cursor: pointer; padding: 2px 8px; cursor: default">'+ w2utils.lang('Skip') +
                        '        <input type="text" style="width: 45px" value="'+ this.offset +'" '+
                        '            onkeypress="if (event.keyCode == 13) { '+
                        '               w2ui[\''+ obj.name +'\'].skip(this.value); '+
                        '               $(document).click(); '+
                        '            }"> '+ w2utils.lang('Records')+
                        '    </div>'+
                        '</td></tr>';
            }
            col_html += '<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].stateSave(); $(document).click();">'+
                        '    <div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Save Grid State') + '</div>'+
                        '</td></tr>'+
                        '<tr><td colspan="2" onclick="w2ui[\''+ obj.name +'\'].stateReset(); $(document).click();">'+
                        '    <div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Restore Default State') + '</div>'+
                        '</td></tr>';
            col_html += "</table></div>";
            this.toolbar.get('w2ui-column-on-off').html = col_html;
        },

        /**
         *
         * @param box, grid object
         * @returns {{remove: Function}} contains a closure around all events to ensure they are removed from the dom
         */
        initColumnDrag: function ( box ) {
            //throw error if using column groups
            if ( this.columnGroups && this.columnGroups.length ) throw 'Draggable columns are not currently supported with column groups.';

            var obj = this,
                _dragData = {};
                _dragData.lastInt = null;
                _dragData.pressed = false;
                _dragData.timeout = null;_dragData.columnHead = null;

            //attach orginal event listener
            $(obj.box).on('mousedown', dragColStart);
            $(obj.box).on('mouseup', catchMouseup);

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

                _dragData.targetInt = Math.max(_dragData.numberPreColumnsPresent,targetIntersection( cursorX, offsets, lastWidth ));

                markIntersection( _dragData.targetInt );
                trackGhost( cursorX, cursorY );
            }

            function dragColEnd ( event ) {
                _dragData.pressed = false;

                var eventData,
                    target,
                    selected,
                    columnConfig,
                    targetColumn,
                    ghosts = $( '.w2ui-grid-ghost' );

                //start event for drag start
                eventData = obj.trigger({ type: 'columnDragEnd', phase: 'before', originalEvent: event, target: _dragData.columnHead[0] });
                if ( eventData.isCancelled === true ) return false;

                selected = obj.columns[ _dragData.originalPos ];
                columnConfig = obj.columns;
                targetColumn =  $( _dragData.columns[ Math.min(_dragData.lastInt, _dragData.columns.length - 1) ] );
                target = (_dragData.lastInt < _dragData.columns.length) ? parseInt(targetColumn.attr('col')) : columnConfig.length;

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
                        $( _dragData.columns[ _dragData.numberPreColumnsPresent ] ).prepend( _dragData.marker.addClass( 'left' ).removeClass( 'right' ) ).css({ position: 'relative' });
                        $( _dragData.columns[ _dragData.numberPreColumnsPresent ] ).prev().addClass('w2ui-col-intersection');
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
            };
        },

        columnOnOff: function (el, event, field) {
            // event before
            var eventData = this.trigger({ phase: 'before', target: this.name, type: 'columnOnOff', checkbox: el, field: field, originalEvent: event });
            if (eventData.isCancelled === true) return;
            // regular processing
            var obj = this;
            // collapse expanded rows
            for (var r = 0; r < this.records.length; r++) {
                if (this.records[r].expanded === true) this.records[r].expanded = false;
            }
            // show/hide
            var hide = true;
            if (field == 'line-numbers') {
                this.show.lineNumbers = !this.show.lineNumbers;
                this.refresh();
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
            var obj = this;
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
                }
                if (this.show.toolbarReload || this.show.toolbarColumn) {
                    this.toolbar.items.push({ type: 'break', id: 'w2ui-break0' });
                }
                if (this.show.toolbarSearch) {
                    var html =
                        '<div class="w2ui-toolbar-search">'+
                        '<table cellpadding="0" cellspacing="0"><tr>'+
                        '    <td>'+ this.buttons['search'].html +'</td>'+
                        '    <td>'+
                        '        <input type="text" id="grid_'+ this.name +'_search_all" class="w2ui-search-all" tabindex="-1" '+
                        '            placeholder="'+ this.last.caption +'" value="'+ this.last.search +'"'+
                        '            onfocus="clearTimeout(w2ui[\''+ this.name +'\'].last.kbd_timer);"'+
                        '            onkeydown="if (event.keyCode == 13 && w2utils.isIE) this.onchange();"'+
                        '            onchange="'+
                        '                var grid = w2ui[\''+ this.name +'\']; '+
                        '                var val = this.value; '+
                        '                var sel = $(this).data(\'selected\');'+
                        '                var fld = $(this).data(\'w2field\'); '+
                        '                if (fld) val = fld.clean(val);'+
                        '                if (fld && fld.type == \'list\' && sel && typeof sel.id == \'undefined\') {'+
                        '                   grid.searchReset();'+
                        '                } else {'+
                        '                   grid.search(grid.last.field, val);'+
                        '                }'+
                        '            ">'+
                        '    </td>'+
                        '    <td>'+
                        '        <div title="'+ w2utils.lang('Clear Search') +'" class="w2ui-search-clear" id="grid_'+ this.name +'_searchClear"  '+
                        '             onclick="var obj = w2ui[\''+ this.name +'\']; obj.searchReset();" style="display: none"'+
                        '        >&nbsp;&nbsp;</div>'+
                        '    </td>'+
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
                if (tmp_items) for (var i = 0; i < tmp_items.length; i++) this.toolbar.items.push(tmp_items[i]);

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
                            obj.initColumnOnOff();
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
                            var sel     = obj.getSelection();
                            var recid     = null;
                            if (sel.length == 1) recid = sel[0];
                            // events
                            var eventData = obj.trigger({ phase: 'before', target: obj.name, type: 'edit', recid: recid });
                            obj.trigger($.extend(eventData, { phase: 'after' }));
                            break;
                        case 'w2ui-delete':
                            obj["delete"]();
                            break;
                        case 'w2ui-save':
                            obj.save();
                            break;
                    }
                    // no default action
                    obj.trigger($.extend(eventData, { phase: 'after' }));
                });
            } else {
                var pos1, pos2;
                var search = this.toolbar.get('w2ui-search');
                if (search != null) {
                    var tmp = search.html;
                    pos1 = tmp.indexOf('placeholder="');
                    pos2 = tmp.indexOf('"', pos1+13);
                    tmp  = tmp.substr(0, pos1+13) + w2utils.lang('All Fields') + tmp.substr(pos2);
                    pos1 = tmp.indexOf('title="');
                    pos2 = tmp.indexOf('"', pos1+7);
                    tmp  = tmp.substr(0, pos1+7) + w2utils.lang('Select Search Field') + tmp.substr(pos2);
                    pos1 = tmp.indexOf('title="', pos2);
                    pos2 = tmp.indexOf('"', pos1+7);
                    tmp  = tmp.substr(0, pos1+7) + w2utils.lang('Clear Search') + tmp.substr(pos2);
                    setTimeout(function () {
                        obj.toolbar.set('w2ui-search', { html: tmp });
                    }, 1);
                }
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
                    obj.resizing = true;
                    obj.last.tmp = {
                        x   : event.screenX,
                        y   : event.screenY,
                        gx  : event.screenX,
                        gy  : event.screenY,
                        col : parseInt($(this).attr('name'))
                    };
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
                    if (event.preventDefault) event.preventDefault();
                    // fix sizes
                    for (var c = 0; c < obj.columns.length; c++) {
                        if (obj.columns[c].hidden) continue;
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
                    };
                    var mouseUp = function (event) {
                        delete obj.resizing;
                        $(document).off('mousemove', 'body');
                        $(document).off('mouseup', 'body');
                        obj.resizeRecords();
                        // event before
                        obj.trigger($.extend(eventData, { phase: 'after', originalEvent: event }));
                    };
                    $(document).on('mousemove', 'body', mouseMove);
                    $(document).on('mouseup', 'body', mouseUp);
                })
                .each(function (index, el) {
                    var td  = $(el).parent();
                    $(el).css({
                        "height"         : '25px',
                        "margin-left"     : (td.width() - 3) + 'px'
                    });
                });
        },

        resizeBoxes: function () {
            // elements
            var header   = $('#grid_'+ this.name +'_header');
            var toolbar  = $('#grid_'+ this.name +'_toolbar');
            var fsummary = $('#grid_'+ this.name +'_fsummary');
            var summary  = $('#grid_'+ this.name +'_summary');
            var footer   = $('#grid_'+ this.name +'_footer');
            var body     = $('#grid_'+ this.name +'_body');

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
            if (this.summary.length > 0) {
                fsummary.css({
                    bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) ) + 'px'
                });
                summary.css({
                    bottom: ( 0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) ) + 'px',
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
            var box      = $(this.box);
            var grid     = $(this.box).find('> div');
            var header   = $('#grid_'+ this.name +'_header');
            var toolbar  = $('#grid_'+ this.name +'_toolbar');
            var summary  = $('#grid_'+ this.name +'_summary');
            var fsummary = $('#grid_'+ this.name +'_fsummary');
            var footer   = $('#grid_'+ this.name +'_footer');
            var body     = $('#grid_'+ this.name +'_body');
            var columns  = $('#grid_'+ this.name +'_columns');
            var fcolumns = $('#grid_'+ this.name +'_fcolumns');
            var records  = $('#grid_'+ this.name +'_records');
            var frecords = $('#grid_'+ this.name +'_frecords');
            var scroll1  = $('#grid_'+ this.name +'_scroll1');
            var lineNumberWidth = String(this.total).length * 8 + 10;
            if (lineNumberWidth < 34) lineNumberWidth = 34; // 3 digit width
            if (this.lineNumberWidth != null) lineNumberWidth = this.lineNumberWidth;

            var bodyOverflowX = false;
            var bodyOverflowY = false;
            if (body.width() < $(records).find('>table').width() + $(frecords).find('>table').width()) bodyOverflowX = true;
            if (body.height() - columns.height() < $(records).find('>table').height() + (bodyOverflowX ? w2utils.scrollBarSize() : 0)) bodyOverflowY = true;

            // body might be expanded by data
            if (!this.fixedBody) {
                // allow it to render records, then resize
                var calculatedHeight = w2utils.getSize(columns, 'height')
                    + w2utils.getSize($('#grid_'+ obj.name +'_records table'), 'height')
                    + (bodyOverflowX ? w2utils.scrollBarSize() : 0);
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

            var buffered = this.records.length;
            if (this.searchData.length != 0 && !this.url) buffered = this.last.searchIds.length;
            // apply overflow
            if (!this.fixedBody) { bodyOverflowY = false; }
            if (bodyOverflowX || bodyOverflowY) {
                columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.scrollBarSize()).show();
                records.css({
                    top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
                    "-webkit-overflow-scrolling": "touch",
                    "overflow-x": (bodyOverflowX ? 'auto' : 'hidden'),
                    "overflow-y": (bodyOverflowY ? 'auto' : 'hidden')
                });
            } else {
                columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').hide();
                records.css({
                    top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
                    overflow: 'hidden'
                });
                if (records.length > 0) { this.last.scrollTop  = 0; this.last.scrollLeft = 0; } // if no scrollbars, always show top
            }
            if (bodyOverflowX) {
                frecords.css('margin-bottom', w2utils.scrollBarSize());
                scroll1.show();
            } else {
                frecords.css('margin-bottom', 0);
                scroll1.hide();
            }
            frecords.css({ overflow: 'hidden', top: records.css('top') });
            if (this.show.emptyRecords && !bodyOverflowY) {
                var max = Math.floor(records.height() / this.recordHeight) + 1;
                if (this.fixedBody) {
                    for (var di = buffered; di <= max; di++) {
                        var html1 = '';
                        var html2 = '';
                        var htmlp = '';
                        html1 += '<tr class="'+ (di % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" style="height: '+ this.recordHeight +'px">';
                        html2 += '<tr class="'+ (di % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" style="height: '+ this.recordHeight +'px">';
                        if (this.show.lineNumbers)  html1 += '<td class="w2ui-col-number"></td>';
                        if (this.show.selectColumn) html1 += '<td class="w2ui-grid-data w2ui-col-select"></td>';
                        if (this.show.expandColumn) html1 += '<td class="w2ui-grid-data w2ui-col-expand"></td>';
                        var j = 0;
                        while (this.columns.length > 0) {
                            var col = this.columns[j];
                            if (col.hidden) { j++; if (typeof this.columns[j] == 'undefined') break; else continue; }
                            htmlp += '<td class="w2ui-grid-data" '+ (typeof col.attr != 'undefined' ? col.attr : '') +' col="'+ j +'"></td>';
                            if (col.frozen) html1 += htmlp; else html2 += htmlp;
                            j++;
                            if (typeof this.columns[j] == 'undefined') break;
                        }
                        html1 += '<td class="w2ui-grid-data-last"></td>';
                        html2 += '<td class="w2ui-grid-data-last"></td>';
                        html1 += '</tr>';
                        html2 += '</tr>';
                        $('#grid_'+ this.name +'_frecords > table').append(html1);
                        $('#grid_'+ this.name +'_records > table').append(html2);
                    }
                }
            }
            if (body.length > 0) {
                var width_max = parseInt(body.width())
                    - (bodyOverflowY ? w2utils.scrollBarSize() : 0)
                    - (this.show.lineNumbers ? lineNumberWidth : 0)
                    - (this.show.selectColumn ? 26 : 0)
                    - (this.show.expandColumn ? 26 : 0)
                    - 1; // left is 1xp due to border width
                var width_box = width_max;
                var percent = 0;
                // gridMinWidth processiong
                var restart = false;
                for (var i = 0; i < this.columns.length; i++) {
                    var col = this.columns[i];
                    if (col.gridMinWidth > 0) {
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

            // find width of frozen columns
            var fwidth = 1;
            if (this.show.lineNumbers)  fwidth += lineNumberWidth;
            if (this.show.selectColumn) fwidth += 26;
            if (this.show.expandColumn) fwidth += 26;
            for (var i = 0; i < this.columns.length; i++) {
                if (this.columns[i].hidden) continue;
                if (this.columns[i].frozen) fwidth += parseInt(this.columns[i].sizeCalculated);
            }
            fcolumns.css('width', fwidth);
            frecords.css('width', fwidth);
            fsummary.css('width', fwidth);
            scroll1.css('width', fwidth);
            columns.css('left', fwidth);
            records.css('left', fwidth);
            summary.css('left', fwidth);

            // resize columns
            columns.find('> table > tbody > tr:nth-child(1) td')
                .add(fcolumns.find('> table > tbody > tr:nth-child(1) td'))
                .each(function (index, el) {
                    // line numbers
                    if ($(el).hasClass('w2ui-col-number')) {
                        $(el).css('width', lineNumberWidth);
                    }
                    // records
                    var ind = $(el).attr('col');
                    if (typeof ind != 'undefined' && obj.columns[ind]) {
                        $(el).css('width', obj.columns[ind].sizeCalculated);
                    }
                    // last column
                    if ($(el).hasClass('w2ui-head-last')) {
                        $(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
                    }
                });
            // if there are column groups - hide first row (needed for sizing)
            if (columns.find('> table > tbody > tr').length == 3) {
                columns.find('> table > tbody > tr:nth-child(1) td')
                    .add(fcolumns.find('> table > tbody > tr:nth-child(1) td'))
                    .html('').css({
                        'height' : '0px',
                        'border' : '0px',
                        'padding': '0px',
                        'margin' : '0px'
                    });
            }
            // resize records
            records.find('> table > tbody > tr:nth-child(1) td')
                .add(frecords.find('> table > tbody > tr:nth-child(1) td'))
                .each(function (index, el) {
                    // line numbers
                    if ($(el).hasClass('w2ui-col-number')) {
                        $(el).css('width', lineNumberWidth);
                    }
                    // records
                    var ind = $(el).attr('col');
                    if (typeof ind != 'undefined' && obj.columns[ind]) {
                        $(el).css('width', obj.columns[ind].sizeCalculated);
                    }
                    // last column
                    if ($(el).hasClass('w2ui-grid-data-last') && $(el).parents('.w2ui-grid-frecords').length == 0) { // not in frecords
                        $(el).css('width', (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
                    }
                });
            // resize summary
            summary.find('> table > tbody > tr:nth-child(1) td')
                .add(fsummary.find('> table > tbody > tr:nth-child(1) td'))
                .each(function (index, el) {
                    // line numbers
                    if ($(el).hasClass('w2ui-col-number')) {
                        $(el).css('width', lineNumberWidth);
                    }
                    // records
                    var ind = $(el).attr('col');
                    if (typeof ind != 'undefined' && obj.columns[ind]) {
                        $(el).css('width', obj.columns[ind].sizeCalculated);
                    }
                    // last column
                    if ($(el).hasClass('w2ui-grid-data-last') && $(el).parents('.w2ui-grid-frecords').length == 0) { // not in frecords
                        $(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent == 0 ? width_diff : 0) + 'px');
                    }
                });
            this.initResize();
            this.refreshRanges();
            this.refreshSpans();
            // apply last scroll if any
            if ((this.last.scrollTop || this.last.scrollLeft) && records.length > 0) {
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
                    btn = '<button class="w2ui-btn close-btn" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchClose(); }">X</button';
                    showBtn = true;
                }
                if (typeof s.inTag   == 'undefined') s.inTag  = '';
                if (typeof s.outTag  == 'undefined') s.outTag = '';
                if (typeof s.style   == 'undefined') s.style = '';
                if (typeof s.type    == 'undefined') s.type   = 'text';
                if (['text', 'alphanumeric', 'combo'].indexOf(s.type) != -1) {
                    var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'" onclick="event.stopPropagation();" class="w2ui-input">'+
                        '    <option value="is">'+ w2utils.lang('is') +'</option>'+
                        '    <option value="begins">'+ w2utils.lang('begins') +'</option>'+
                        '    <option value="contains">'+ w2utils.lang('contains') +'</option>'+
                        '    <option value="ends">'+ w2utils.lang('ends') +'</option>'+
                        '</select>';
                }
                if (['int', 'float', 'money', 'currency', 'percent', 'date', 'time'].indexOf(s.type) != -1) {
                    var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'" class="w2ui-input" '+
                        '        onchange="w2ui[\''+ this.name + '\'].initOperator(this, '+ i +');" onclick="event.stopPropagation();">'+
                        '   <option value="is">'+ w2utils.lang('is') +'</option>'+
                        '   <option value="between">'+ w2utils.lang('between') +'</option>'+
                        '   <option value="less">'+ w2utils.lang(['date', 'time'].indexOf(s.type) != -1 ? 'before' : 'less') +'</option>'+
                        '   <option value="more">'+ w2utils.lang(['date', 'time'].indexOf(s.type) != -1 ? 'after' : 'more') +'</option>'+
                        '</select>';
                }
                if (['select', 'list', 'hex'].indexOf(s.type) != -1) {
                    var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'" onclick="event.stopPropagation();" class="w2ui-input">'+
                        '    <option value="is">'+ w2utils.lang('is') +'</option>'+
                        '</select>';
                }
                if (['enum'].indexOf(s.type) != -1) {
                    var operator =  '<select id="grid_'+ this.name +'_operator_'+ i +'" onclick="event.stopPropagation();" class="w2ui-input">'+
                        '    <option value="in">'+ w2utils.lang('in') +'</option>'+
                        '    <option value="not in">'+ w2utils.lang('not in') +'</option>'+
                        '</select>';
                }
                html += '<tr>'+
                        '    <td class="close-btn">'+ btn +'</td>' +
                        '    <td class="caption">'+ s.caption +'</td>' +
                        '    <td class="operator">'+ operator +'</td>'+
                        '    <td class="value">';

                switch (s.type) {
                    case 'text':
                    case 'alphanumeric':
                    case 'hex':
                    case 'list':
                    case 'combo':
                    case 'enum':
                        html += '<input rel="search" type="text" size="40" class="w2ui-input" style="'+ s.style +'" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'>';
                        break;

                    case 'int':
                    case 'float':
                    case 'money':
                    case 'currency':
                    case 'percent':
                    case 'date':
                    case 'time':
                        html += '<input rel="search" type="text" size="12" class="w2ui-input" style="'+ s.style +'" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'>'+
                                '<span id="grid_'+ this.name +'_range_'+ i +'" style="display: none">'+
                                '&nbsp;-&nbsp;&nbsp;<input rel="search" type="text" class="w2ui-input" style="width: 90px" id="grid_'+ this.name +'_field2_'+i+'" name="'+ s.field +'" '+ s.inTag +'>'+
                                '</span>';
                        break;

                    case 'select':
                        html += '<select rel="search" class="w2ui-input" style="'+ s.style +'" id="grid_'+ this.name +'_field_'+ i +'" '+
                                ' name="'+ s.field +'" '+ s.inTag +'  onclick="event.stopPropagation();"></select>';
                        break;

                }
                html += s.outTag +
                        '    </td>' +
                        '</tr>';
            }
            html += '<tr>'+
                    '    <td colspan="4" class="actions">'+
                    '        <div>'+
                    '        <button class="w2ui-btn" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchReset(); }">'+ w2utils.lang('Reset') + '</button>'+
                    '        <button class="w2ui-btn w2ui-btn-blue" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.search(); }">'+ w2utils.lang('Search') + '</button>'+
                    '        </div>'+
                    '    </td>'+
                    '</tr></table>';
            return html;
        },

        initOperator: function (el, search_ind) {
            var obj     = this;
            var search  = obj.searches[search_ind];
            var range   = $('#grid_'+ obj.name + '_range_'+ search_ind);
            var fld1    = $('#grid_'+ obj.name +'_field_'+ search_ind);
            var fld2    = fld1.parent().find('span input');
            if ($(el).val() == 'in' || $(el).val() == 'not in') { fld1.w2field('clear'); } else { fld1.w2field(search.type); }
            if ($(el).val() == 'between') { range.show(); fld2.w2field(search.type); } else { range.hide(); }
        },

        initSearches: function () {
            var obj = this;
            // init searches
            for (var s = 0; s < this.searches.length; s++) {
                var search   = this.searches[s];
                var sdata    = this.getSearchData(search.field);
                var operator = null;
                search.type = String(search.type).toLowerCase();
                if (typeof search.options != 'object') search.options = {};
                // init types
                switch (search.type) {
                    case 'text':
                    case 'alphanumeric':
                        operator = 'begins';
                        if (search.operator && ['is', 'begins', 'contains', 'ends'].indexOf(search.operator) != -1) operator = search.operator;
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
                        if (sdata && sdata.type == 'int' && ['in', 'not in'].indexOf(sdata.operator) != -1) break;
                        operator = 'is';
                        if (search.operator && ['is', 'between', 'less', 'more'].indexOf(search.operator) != -1) operator = search.operator;
                        $('#grid_'+ this.name +'_field_'+s).w2field(search.type, search.options);
                        $('#grid_'+ this.name +'_field2_'+s).w2field(search.type, search.options);
                        setTimeout(function () { // convert to date if it is number
                            $('#grid_'+ obj.name +'_field_'+s).keydown();
                            $('#grid_'+ obj.name +'_field2_'+s).keydown();
                        }, 1);
                        break;

                    case 'hex':
                        operator = 'is';
                        if (search.operator && ['is', 'between'].indexOf(search.operator) != -1) operator = search.operator;
                        break;

                    case 'list':
                    case 'combo':
                    case 'enum':
                        if (search.type == 'list') operator = 'is';
                        if (search.type == 'combo') {
                            operator = 'begins';
                            if (search.operator && ['is', 'begins', 'contains', 'ends'].indexOf(search.operator) != -1) operator = search.operator;
                        }
                        if (search.type == 'enum') {
                            operator = 'in';
                            if (search.operator && ['in', 'not in'].indexOf(search.operator) != -1) operator = search.operator;
                        }
                        var options = search.options;
                        if (search.type == 'list') options.selected = {};
                        if (search.type == 'enum') options.selected = [];
                        if (sdata) options.selected = sdata.value;
                        $('#grid_'+ this.name +'_field_'+s).w2field(search.type, $.extend({ openOnFocus: true }, options));
                        if (sdata && sdata.text != null) $('#grid_'+ this.name +'_field_'+s).data('selected', {id: sdata.value, text: sdata.text});
                        break;

                    case 'select':
                        operator = 'is';
                        // build options
                        var options = '<option value="">--</option>';
                        for (var i = 0; i < search.options.items; i++) {
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
                    if (sdata.type == 'int' && ['in', 'not in'].indexOf(sdata.operator) != -1) {
                        $('#grid_'+ this.name +'_field_'+ s).w2field('clear').val(sdata.value);
                    }
                    $('#grid_'+ this.name +'_operator_'+ s).val(sdata.operator).trigger('change');
                    if (!$.isArray(sdata.value)) {
                        if (typeof sdata.value != 'udefined') $('#grid_'+ this.name +'_field_'+ s).val(sdata.value).trigger('change');
                    } else {
                        if (['in', 'not in'].indexOf(sdata.operator) != -1) {
                            $('#grid_'+ this.name +'_field_'+ s).val(sdata.value).trigger('change');
                        } else {
                            $('#grid_'+ this.name +'_field_'+ s).val(sdata.value[0]).trigger('change');
                            $('#grid_'+ this.name +'_field2_'+ s).val(sdata.value[1]).trigger('change');
                        }
                    }
                } else {
                    $('#grid_'+ this.name +'_operator_'+s).val(operator).trigger('change');
                }
            }
            // add on change event
            $('#w2ui-overlay-searches-'+ this.name +' .w2ui-grid-searches *[rel=search]').on('keypress', function (evnt) {
                if (evnt.keyCode == 13) {
                    obj.search();
                    $().w2overlay();
                }
            });
        },

        getColumnsHTML: function () {
            var obj  = this;
            var html1 = '';
            var html2 = '';
            if (this.show.columnHeaders) {
                if (this.columnGroups.length > 0) {
                    var tmp1 = getColumns(true);
                    var tmp2 = getGroups();
                    var tmp3 = getColumns(false);
                    html1 = tmp1[0] + tmp2[0] + tmp3[0];
                    html2 = tmp1[1] + tmp2[1] + tmp3[1];
                } else {
                    var tmp = getColumns(true);
                    html1 = tmp[0];
                    html2 = tmp[1];
                }
            }
            return [html1, html2];

            function getGroups () {
                var html1 = '<tr>';
                var html2 = '<tr>';
                var tmpf  = '';
                // add empty group at the end
                if (obj.columnGroups[obj.columnGroups.length-1].caption != '') obj.columnGroups.push({ caption: '' });

                if (obj.show.lineNumbers) {
                    html1 += '<td class="w2ui-head w2ui-col-number">'+
                            '    <div style="height: '+ (obj.recordHeight+1) +'px">&nbsp;</div>'+
                            '</td>';
                }
                if (obj.show.selectColumn) {
                    html1 += '<td class="w2ui-head w2ui-col-select">'+
                            '    <div style="height: 25px">&nbsp;</div>'+
                            '</td>';
                }
                if (obj.show.expandColumn) {
                    html1 += '<td class="w2ui-head w2ui-col-expand">'+
                            '    <div style="height: 25px">&nbsp;</div>'+
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
                        for (var si = 0; si < obj.sortData.length; si++) {
                            if (obj.sortData[si].field == col.field) {
                                if (new RegExp('asc', 'i').test(obj.sortData[si].direction))  sortStyle = 'w2ui-sort-up';
                                if (new RegExp('desc', 'i').test(obj.sortData[si].direction)) sortStyle = 'w2ui-sort-down';
                            }
                        }
                        var resizer = "";
                        if (col.resizable !== false) {
                            resizer = '<div class="w2ui-resizer" name="'+ ii +'"></div>';
                        }
                        tmpf = '<td id="grid_'+ obj.name + '_column_' + ii +'" class="w2ui-head '+ sortStyle +'" col="'+ ii + '" '+
                               '    rowspan="2" colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'" '+
                               '    oncontextmenu = "w2ui[\''+ obj.name +'\'].contextMenu(null, '+ ii +', event);"'+
                               '    onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);">'+
                                   resizer +
                               '    <div class="w2ui-col-group w2ui-col-header '+ (sortStyle ? 'w2ui-col-sorted' : '') +'">'+
                               '        <div class="'+ sortStyle +'"></div>'+
                                       (!col.caption ? '&nbsp;' : col.caption) +
                               '    </div>'+
                               '</td>';
                        if (col && col.frozen) html1 += tmpf; else html2 += tmpf;
                    } else {
                        tmpf = '<td id="grid_'+ obj.name + '_column_' + ii +'" class="w2ui-head" col="'+ ii + '" '+
                               '        colspan="'+ (colg.span + (i == obj.columnGroups.length-1 ? 1 : 0) ) +'">'+
                               '    <div class="w2ui-col-group">'+
                                   (!colg.caption ? '&nbsp;' : colg.caption) +
                               '    </div>'+
                               '</td>';
                        if (col && col.frozen) html1 += tmpf; else html2 += tmpf;
                    }
                    ii += colg.span;
                }
                html1 += '<td></td></tr>'; // need empty column for border-right
                html2 += '</tr>';
                return [html1, html2];
            }

            function getColumns (master) {
                var html1 = '<tr>';
                var html2 = '<tr>';
                var tmpf  = '';
                var reorderCols = (obj.reorderColumns && (!obj.columnGroups || !obj.columnGroups.length)) ? ' w2ui-reorder-cols-head ' : '';
                if (obj.show.lineNumbers) {
                    html1 += '<td class="w2ui-head w2ui-col-number" onclick="w2ui[\''+ obj.name +'\'].columnClick(\'line-number\', event);">'+
                            '    <div>#</div>'+
                            '</td>';
                }
                if (obj.show.selectColumn) {
                    html1 += '<td class="w2ui-head w2ui-col-select" '+
                            '        onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
                            '    <div>'+
                            '        <input type="checkbox" id="grid_'+ obj.name +'_check_all" tabindex="-1"'+
                            '            style="' + (obj.multiSelect == false ? 'display: none;' : '') + '"'+
                            '            onclick="if (this.checked) w2ui[\''+ obj.name +'\'].selectAll(); '+
                            '                     else w2ui[\''+ obj.name +'\'].selectNone(); '+
                            '                     if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
                            '    </div>'+
                            '</td>';
                }
                if (obj.show.expandColumn) {
                    html1 += '<td class="w2ui-head w2ui-col-expand">'+
                            '    <div>&nbsp;</div>'+
                            '</td>';
                }
                var ii = 0;
                var id = 0;
                for (var i = 0; i < obj.columns.length; i++) {
                    var col  = obj.columns[i];
                    var colg = {};
                    if (i == id) {
                        id = id + (typeof obj.columnGroups[ii] != 'undefined' ? parseInt(obj.columnGroups[ii].span) : 0);
                        ii++;
                    }
                    if (typeof obj.columnGroups[ii-1] != 'undefined') var colg = obj.columnGroups[ii-1];
                    if (col.hidden) continue;
                    var sortStyle = '';
                    for (var si = 0; si < obj.sortData.length; si++) {
                        if (obj.sortData[si].field == col.field) {
                            if (new RegExp('asc', 'i').test(obj.sortData[si].direction))  sortStyle = 'w2ui-sort-up';
                            if (new RegExp('desc', 'i').test(obj.sortData[si].direction)) sortStyle = 'w2ui-sort-down';
                        }
                    }
                    if (colg['master'] !== true || master) { // grouping of columns
                        var resizer = "";
                        if (col.resizable !== false) {
                            resizer = '<div class="w2ui-resizer" name="'+ i +'"></div>';
                        }
                        tmpf  = '<td id="grid_'+ obj.name + '_column_' + i +'" col="'+ i +'" class="w2ui-head '+ sortStyle + reorderCols + '" ' +
                                     (obj.columnTooltip == 'normal' && col.tooltip ? 'title="'+ col.tooltip +'" ' : '') +
                                '    onmouseover = "w2ui[\''+ obj.name +'\'].columnTooltipShow(\''+ i +'\', event);"'+
                                '    onmouseout  = "w2ui[\''+ obj.name +'\'].columnTooltipHide(\''+ i +'\', event);"'+
                                '    oncontextmenu = "w2ui[\''+ obj.name +'\'].contextMenu(null, '+ i +', event);"'+
                                '    onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);">'+
                                    resizer +
                                '    <div class="w2ui-col-header '+ (sortStyle ? 'w2ui-col-sorted' : '') +'">'+
                                '        <div class="'+ sortStyle +'"></div>'+
                                        (!col.caption ? '&nbsp;' : col.caption) +
                                '    </div>'+
                                '</td>';
                        if (col && col.frozen) html1 += tmpf; else html2 += tmpf;
                    }
                }
                html1 += '<td class="w2ui-head w2ui-head-last"><div>&nbsp;</div></td>';
                html2 += '<td class="w2ui-head w2ui-head-last"><div>&nbsp;</div></td>';
                html1 += '</tr>';
                html2 += '</tr>';
                return [html1, html2];
            }
        },

        columnTooltipShow: function (ind) {
            if (this.columnTooltip == 'normal') return;
            var $el  = $(this.box).find('#grid_'+ this.name + '_column_'+ ind);
            var item = this.columns[ind];
            var pos  = this.columnTooltip;
            $el.prop('_mouse_over', true);
            setTimeout(function () {
                if ($el.prop('_mouse_over') === true && $el.prop('_mouse_tooltip') !== true) {
                    $el.prop('_mouse_tooltip', true);
                    // show tooltip
                    $el.w2tag(item.tooltip, { position: pos });
                }
            }, 1);
        },

        columnTooltipHide: function (ind) {
            if (this.columnTooltip == 'normal') return;
            var $el  = $(this.box).find('#grid_'+ this.name + '_column_'+ ind);
            var item = this.columns[ind];
            $el.removeProp('_mouse_over');
            setTimeout(function () {
                if ($el.prop('_mouse_over') !== true && $el.prop('_mouse_tooltip') === true) {
                    $el.removeProp('_mouse_tooltip');
                    // hide tooltip
                    $el.w2tag();
                }
            }, 1);
        },

        getRecordsHTML: function () {
            var buffered = this.records.length;
            if (this.searchData.length != 0 && !this.url) buffered = this.last.searchIds.length;
            // larget number works better with chrome, smaller with FF.
            if (buffered > this.vs_start) this.last.show_extra = this.vs_extra; else this.last.show_extra = this.vs_start;
            var records  = $('#grid_'+ this.name +'_records');
            var limit    = Math.floor(records.height() / this.recordHeight) + this.last.show_extra + 1;
            if (!this.fixedBody || limit > buffered) limit = buffered;
            // always need first record for resizing purposes
            var rec_html = this.getRecordHTML(-1, 0);
            var html1 = '<table>' + rec_html[0];
            var html2 = '<table>' + rec_html[1];
            // first empty row with height
            html1 += '<tr id="grid_'+ this.name + '_frec_top" line="top" style="height: '+ 0 +'px">'+
                     '    <td colspan="200"></td>'+
                     '</tr>';
            html2 += '<tr id="grid_'+ this.name + '_rec_top" line="top" style="height: '+ 0 +'px">'+
                     '    <td colspan="200"></td>'+
                     '</tr>';
            for (var i = 0; i < limit; i++) {
                rec_html = this.getRecordHTML(i, i+1);
                html1 += rec_html[0];
                html2 += rec_html[1];
            }
            html1 += '<tr id="grid_'+ this.name + '_frec_bottom" line="bottom" style="height: '+ ((buffered - limit) * this.recordHeight) +'px">'+
                    '    <td colspan="200"></td>'+
                    '</tr>'+
                    '<tr id="grid_'+ this.name +'_frec_more" style="display: none">'+
                    '    <td colspan="200" class="w2ui-load-more"></td>'+
                    '</tr>'+
                    '</table>';
            html2 += '<tr id="grid_'+ this.name + '_rec_bottom" line="bottom" style="height: '+ ((buffered - limit) * this.recordHeight) +'px">'+
                    '    <td colspan="200"></td>'+
                    '</tr>'+
                    '<tr id="grid_'+ this.name +'_rec_more" style="display: none">'+
                    '    <td colspan="200" class="w2ui-load-more"></td>'+
                    '</tr>'+
                    '</table>';
            this.last.range_start = 0;
            this.last.range_end   = limit;
            return [html1, html2];
        },

        getSummaryHTML: function () {
            if (this.summary.length == 0) return;
            var rec_html = '';
            var html1 = '<table>';
            var html2 = '<table>';
            for (var i = 0; i < this.summary.length; i++) {
                rec_html = this.getRecordHTML(i, i+1, true);
                html1 += rec_html[0];
                html2 += rec_html[1];
            }
            html1 += '</table>';
            html2 += '</table>';
            return [html1, html2];
        },

        scroll: function (event) {
            var time = (new Date()).getTime();
            var obj  = this;
            var records  = $('#grid_'+ this.name +'_records');
            var frecords = $('#grid_'+ this.name +'_frecords');
            // sync scroll positions
            if (event) {
                var sTop  = event.target.scrollTop;
                var sLeft = event.target.scrollLeft;
                obj.last.scrollTop  = sTop;
                obj.last.scrollLeft = sLeft;
                $('#grid_'+ obj.name +'_columns')[0].scrollLeft = sLeft;
                $('#grid_'+ obj.name +'_summary')[0].scrollLeft = sLeft;
                frecords[0].scrollTop = sTop;
            }
            // perform virtual scroll
            var buffered = this.records.length;
            if (this.searchData.length != 0 && !this.url) buffered = this.last.searchIds.length;
            if (buffered == 0 || records.length == 0 || records.height() == 0) return;
            if (buffered > this.vs_start) this.last.show_extra = this.vs_extra; else this.last.show_extra = this.vs_start;
            // need this to enable scrolling when this.limit < then a screen can fit
            if (records.height() < buffered * this.recordHeight && records.css('overflow-y') == 'hidden') {
                if (this.total > 0) this.refresh();
                return;
            }
            // update footer
            var t1 = Math.round(records[0].scrollTop / this.recordHeight + 1);
            var t2 = t1 + (Math.round(records.height() / this.recordHeight) - 1);
            if (t1 > buffered) t1 = buffered;
            if (t2 >= buffered - 1) t2 = buffered;
            var url = (typeof this.url != 'object' ? this.url : this.url.get);
            $('#grid_'+ this.name + '_footer .w2ui-footer-right').html(
                (obj.show.statusRange ? w2utils.formatNumber(this.offset + t1) + '-' + w2utils.formatNumber(this.offset + t2) + ' ' + w2utils.lang('of') + ' ' +    w2utils.formatNumber(this.total) : '') +
                (url && obj.show.statusBuffered ? ' ('+ w2utils.lang('buffered') + ' '+ w2utils.formatNumber(buffered) + (this.offset > 0 ? ', skip ' + w2utils.formatNumber(this.offset) : '') + ')' : '')
            );
            // only for local data source, else no extra records loaded
            if (!url && (!this.fixedBody || this.total <= 300)) return;
            // regular processing
            var start   = Math.floor(records[0].scrollTop / this.recordHeight) - this.last.show_extra;
            var end     = start + Math.floor(records.height() / this.recordHeight) + this.last.show_extra * 2 + 1;
            // var div  = start - this.last.range_start;
            if (start < 1) start = 1;
            if (end > this.total) end = this.total;
            var tr1  = records.find('#grid_'+ this.name +'_rec_top');
            var tr2  = records.find('#grid_'+ this.name +'_rec_bottom');
            var tr1f = frecords.find('#grid_'+ this.name +'_frec_top');
            var tr2f = frecords.find('#grid_'+ this.name +'_frec_bottom');
            // if row is expanded
            if (String(tr1.next().prop('id')).indexOf('_expanded_row') != -1) {
                tr1.next().remove();
                tr1f.next().remove();
            }
            if (this.total > end && String(tr2.prev().prop('id')).indexOf('_expanded_row') != -1) {
                tr2.prev().remove();
                tr2f.prev().remove();
            }
            var first = parseInt(tr1.next().attr('line'));
            var last  = parseInt(tr2.prev().attr('line'));
            //$('#log').html('buffer: '+ this.buffered +' start-end: ' + start + '-'+ end + ' ===> first-last: ' + first + '-' + last);
            if (first < start || first == 1 || this.last.pull_refresh) { // scroll down
                // console.log('end', end, 'last', last, 'show_extre', this.last.show_extra, this.last.pull_refresh);
                if (end <= last + this.last.show_extra - 2 && end != this.total) return;
                this.last.pull_refresh = false;
                // remove from top
                while (true) {
                    var tmp1 = frecords.find('#grid_'+ this.name +'_frec_top').next();
                    var tmp2 = records.find('#grid_'+ this.name +'_rec_top').next();
                    if (tmp2.attr('line') == 'bottom') break;
                    if (parseInt(tmp2.attr('line')) < start) { tmp1.remove(); tmp2.remove(); } else break;
                }
                // add at bottom
                var tmp = records.find('#grid_'+ this.name +'_rec_bottom').prev();
                var rec_start = tmp.attr('line');
                if (rec_start == 'top') rec_start = start;
                for (var i = parseInt(rec_start) + 1; i <= end; i++) {
                    if (!this.records[i-1]) continue;
                    if (this.records[i-1].expanded === true) this.records[i-1].expanded = false;
                    var rec_html = this.getRecordHTML(i-1, i);
                    tr2.before(rec_html[1]);
                    tr2f.before(rec_html[0]);
                }
                markSearch();
                setTimeout(function() { obj.refreshRanges(); obj.refreshSpans(); }, 0);
            } else { // scroll up
                if (start >= first - this.last.show_extra + 2 && start > 1) return;
                // remove from bottom
                while (true) {
                    var tmp1 = frecords.find('#grid_'+ this.name +'_frec_bottom').prev();
                    var tmp2 = records.find('#grid_'+ this.name +'_rec_bottom').prev();
                    if (tmp2.attr('line') == 'top') break;
                    if (parseInt(tmp2.attr('line')) > end) { tmp1.remove(); tmp2.remove(); } else break;
                }
                // add at top
                var tmp = records.find('#grid_'+ this.name +'_rec_top').next();
                var rec_start = tmp.attr('line');
                if (rec_start == 'bottom') rec_start = end;
                for (var i = parseInt(rec_start) - 1; i >= start; i--) {
                    if (!this.records[i-1]) continue;
                    if (this.records[i-1].expanded === true) this.records[i-1].expanded = false;
                    var rec_html = this.getRecordHTML(i-1, i);
                    tr1.after(rec_html[1]);
                    tr1f.after(rec_html[0]);
                }
                markSearch();
                setTimeout(function() { obj.refreshRanges(); obj.refreshSpans(); }, 0);
            }
            // first/last row size
            var h1 = (start - 1) * obj.recordHeight;
            var h2 = (buffered - end) * obj.recordHeight;
            if (h2 < 0) h2 = 0;
            tr1.css('height', h1 + 'px');
            tr1f.css('height', h1 + 'px');
            tr2.css('height', h2 + 'px');
            tr2f.css('height', h2 + 'px');
            obj.last.range_start = start;
            obj.last.range_end   = end;
            // load more if needed
            var s = Math.floor(records[0].scrollTop / this.recordHeight);
            var e = s + Math.floor(records.height() / this.recordHeight);
            if (e + 10 > buffered && this.last.pull_more !== true && buffered < this.total - this.offset) {
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
            if (buffered >= this.total - this.offset) $('#grid_'+ this.name +'_rec_more').hide();
            return;

            function markSearch() {
                // mark search
                if (!obj.markSearch) return;
                clearTimeout(obj.last.marker_timer);
                obj.last.marker_timer = setTimeout(function () {
                    // mark all search strings
                    var str = [];
                    for (var s = 0; s < obj.searchData.length; s++) {
                        var tmp = obj.searchData[s];
                        if ($.inArray(tmp.value, str) == -1) str.push(tmp.value);
                    }
                    if (str.length > 0) $(obj.box).find('.w2ui-grid-data > div').w2marker(str);
                }, 50);
            }
        },

        getRecordHTML: function (ind, lineNum, summary) {
            var tmph = '';
            var rec_html1 = '';
            var rec_html2 = '';
            var sel = this.last.selection;
            var record;
            // first record needs for resize purposes
            if (ind == -1) {
                rec_html1 += '<tr line="0">';
                rec_html2 += '<tr line="0">';
                if (this.show.lineNumbers)  rec_html1 += '<td class="w2ui-col-number" style="height: 0px;"></td>';
                if (this.show.selectColumn) rec_html1 += '<td class="w2ui-col-select" style="height: 0px;"></td>';
                if (this.show.expandColumn) rec_html1 += '<td class="w2ui-col-expand" style="height: 0px;"></td>';
                for (var i = 0; i < this.columns.length; i++) {
                    var col = this.columns[i];
                    if (col.hidden) continue;
                    tmph = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px;"></td>';
                    if (col.frozen) rec_html1 += tmph; else rec_html2 += tmph;
                }
                rec_html1 += '<td class="w2ui-grid-data-last" style="height: 0px"></td>';
                rec_html2 += '<td class="w2ui-grid-data-last" style="height: 0px"></td>';
                rec_html1 += '</tr>';
                rec_html2 += '</tr>';
                return [rec_html1, rec_html2];
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
            if (record.recid == null && this.recid != null && record[this.recid] != null) record.recid = record[this.recid];
            var id = w2utils.escapeId(record.recid);
            var isRowSelected = false;
            if (sel.indexes.indexOf(ind) != -1) isRowSelected = true;
            // render TR
            rec_html1 += '<tr id="grid_'+ this.name +'_frec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" index="'+ ind +'" '+
                ' class="'+ (lineNum % 2 == 0 ? 'w2ui-even' : 'w2ui-odd') + (isRowSelected && this.selectType == 'row' ? ' w2ui-selected' : '') + (record.expanded === true ? ' w2ui-expanded' : '') + '" ' +
                (summary !== true ?
                    (w2utils.isIOS ?
                        '    onclick  = "w2ui[\''+ this.name +'\'].dblClick($(this).attr(\'recid\'), event);"'
                        :
                        '    onclick  = "w2ui[\''+ this.name +'\'].click($(this).attr(\'recid\'), event);"'+
                        '    oncontextmenu = "w2ui[\''+ this.name +'\'].contextMenu($(this).attr(\'recid\'), null, event);"'
                     )
                    : ''
                ) +
                (this.selectType == 'row' ?
                    ' onmouseover="$(\'#grid_'+ this.name +'_rec_\'+ w2utils.escapeId($(this).attr(\'recid\'))).addClass(\'w2ui-record-hover\')"'+
                    ' onmouseout ="$(\'#grid_'+ this.name +'_rec_\'+ w2utils.escapeId($(this).attr(\'recid\'))).removeClass(\'w2ui-record-hover\')"'
                    :
                    '') +
                ' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && typeof record['style'] == 'string' ? record['style'] : '') +'" '+
                    ( typeof record['style'] == 'string' ? 'custom_style="'+ record['style'] +'"' : '') +
                '>';
            rec_html2 += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" index="'+ ind +'" '+
                ' class="'+ (lineNum % 2 == 0 ? 'w2ui-even' : 'w2ui-odd') + (isRowSelected && this.selectType == 'row' ? ' w2ui-selected' : '') + (record.expanded === true ? ' w2ui-expanded' : '') + '" ' +
                (summary !== true ?
                    (w2utils.isIOS ?
                        '    onclick  = "var obj = w2ui[\''+ this.name +'\']; obj.dblClick($(this).attr(\'recid\'), event);"'
                        :
                        '    onclick  = "var obj = w2ui[\''+ this.name +'\']; obj.click($(this).attr(\'recid\'), event);"'+
                        '    oncontextmenu = "var obj = w2ui[\''+ this.name +'\']; obj.contextMenu($(this).attr(\'recid\'), null, event);"'
                     )
                    : ''
                ) +
                (this.selectType == 'row' ?
                    ' onmouseover="$(\'#grid_'+ this.name +'_frec_\' + w2utils.escapeId($(this).attr(\'recid\'))).addClass(\'w2ui-record-hover\')"'+
                    ' onmouseout ="$(\'#grid_'+ this.name +'_frec_\' + w2utils.escapeId($(this).attr(\'recid\'))).removeClass(\'w2ui-record-hover\')"'
                    :
                    '') +
                ' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && typeof record['style'] == 'string' ? record['style'] : '') +'" '+
                    ( typeof record['style'] == 'string' ? 'custom_style="'+ record['style'] +'"' : '') +
                '>';
            if (this.show.lineNumbers) {
                rec_html1 += '<td id="grid_'+ this.name +'_cell_'+ ind +'_number' + (summary ? '_s' : '') + '" '+
                            '   class="w2ui-col-number '+ (isRowSelected  ? ' w2ui-row-selected' : '') +'"'+
                                (this.reorderRows ? 'style="cursor: move"' : '') + '>'+
                                (summary !== true ? this.getLineHTML(lineNum, record) : '') +
                            '</td>';
            }
            if (this.show.selectColumn) {
                rec_html1 +=
                        '<td id="grid_'+ this.name +'_cell_'+ ind +'_select' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-select" '+
                        '        onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
                            (summary !== true ?
                            '    <div>'+
                            '        <input class="w2ui-grid-select-check" type="checkbox" tabindex="-1"'+
                            '            '+ (isRowSelected ? 'checked="checked"' : '') +
                            '            onclick="var obj = w2ui[\''+ this.name +'\']; var recid = $(this).parents(\'tr\').attr(\'recid\'); '+
                            '                clearTimeout(obj.last.kbd_timer); $(obj.box).find(\'#grid_'+ this.name + '_focus\').focus(); /* keep focus */' + 
                            '                if (!obj.multiSelect) { obj.selectNone(); }'+
                            '                if (this.checked) obj.select(recid); else obj.unselect(recid); '+
                            '                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
                            '    </div>'
                            :
                            '' ) +
                        '</td>';
            }
            if (this.show.expandColumn) {
                var tmp_img = '';
                if (record.expanded === true)  tmp_img = '-'; else tmp_img = '+';
                if (record.expanded == 'none') tmp_img = '';
                if (record.expanded == 'spinner') tmp_img = '<div class="w2ui-spinner" style="width: 16px; margin: -2px 2px;"></div>';
                rec_html1 +=
                        '<td id="grid_'+ this.name +'_cell_'+ ind +'_expand' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-expand">'+
                            (summary !== true ?
                            '    <div ondblclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;" '+
                            '            onclick="w2ui[\''+ this.name +'\'].toggle($(this).parents(\'tr\').attr(\'recid\');, event); '+
                            '                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
                            '        '+ tmp_img +' </div>'
                            :
                            '' ) +
                        '</td>';
            }
            var col_ind   = 0;
            var col_skip  = 0;
            var col_span  = 1;
            var soft_span = 1;
            var soft_width;
            while (true) {
                var col = this.columns[col_ind];
                var soft_set = false;
                if (col_skip > 0) {
                    col_ind++;
                    if (this.columns[col_ind] == null) break;
                    record.w2ui.colspan[col.field] = 0; // need it for other methods
                    col_span = 1;
                    col_skip--;
                    continue;
                }
                if (soft_span > 1) {
                    soft_span--;
                }
                if (col.hidden) { 
                    col_ind++; 
                    if (this.columns[col_ind] == null) break; else continue; 
                }
                var isChanged = !summary && record.changes && typeof record.changes[col.field] != 'undefined';
                var rec_cell  = this.getCellHTML(ind, col_ind, summary);
                var addStyle  = '';
                if (typeof col.render == 'string') {
                    var tmp = col.render.toLowerCase().split(':');
                    if (['number', 'int', 'float', 'money', 'currency', 'percent'].indexOf(tmp[0]) != -1) addStyle += 'text-align: right;';
                }
                if (typeof record.style == 'object') {
                    if (typeof record.style[col_ind] == 'string') addStyle += record.style[col_ind] + ';';
                    if (typeof record.style[col.field] == 'string') addStyle += record.style[col.field] + ';';
                }
                if (record.w2ui) {
                    if (typeof record.w2ui.colspan == 'object') {
                        var tmp = parseInt(record.w2ui.colspan[col.field]) || null;
                        if (tmp > 1) {
                            col_span = tmp;
                            col_skip = tmp - 1;
                        }
                    }
                    if (typeof record.w2ui.softspan == 'object' && rec_cell != null && rec_cell != '') {
                        var tmp = parseInt(record.w2ui.softspan[col.field]) || 1;
                        if (tmp > 1) {
                            soft_span  = tmp;
                            soft_set   = true;
                            soft_width = 0;
                            // calculate width
                            for (var k = col_ind; k < this.columns.length; k++) {
                                if (this.columns[k].hidden) continue;
                                if (k >= col_ind + tmp) break;
                                soft_width += parseInt(this.columns[k].sizeCalculated);
                            }
                        }
                    }
                }
                var isCellSelected = false;
                if (isRowSelected && $.inArray(col_ind, sel.columns[ind]) != -1) isCellSelected = true;
                tmph = '<td class="w2ui-grid-data'+ (isCellSelected ? ' w2ui-selected' : '') + 
                            (isChanged ? ' w2ui-changed' : '') +
                            (soft_set === true ? ' w2ui-soft-span' : '') +
                            (soft_set === false && soft_span > 1 ? ' w2ui-soft-hidden' : '') +
                            '" '+
                        '   id="grid_'+ this.name +'_data_'+ ind +'_'+ col_ind +'" col="'+ col_ind +'" '+
                        '   style="'+ addStyle + (typeof col.style != 'undefined' ? col.style : '') +'" '+
                            (col.attr != null ? col.attr : '') +
                            (col_span > 1 ? 'colspan="'+ col_span + '"' : '') +
                            (soft_set === true ? 'softspan="'+ soft_span + '"' : '') +
                            (soft_set === true ? 'softwidth="'+ soft_width + '"' : '') +
                        '>'+
                            (soft_set === false && soft_span > 1 ? '<div class="cell-value"></div>' : rec_cell) +
                        '</td>';
                if (col.frozen) rec_html1 += tmph; else rec_html2 += tmph;
                col_ind++;
                if (this.columns[col_ind] == null) break;
            }
            rec_html1 += '<td class="w2ui-grid-data-last"></td>';
            rec_html2 += '<td class="w2ui-grid-data-last"></td>';
            rec_html1 += '</tr>';
            rec_html2 += '</tr>';
            return [rec_html1, rec_html2];
        },

        getLineHTML: function(lineNum) {
            return '<div>' + lineNum + '</div>';
        },

        getCellHTML: function (ind, col_ind, summary) {
            var col    = this.columns[col_ind];
            var record = (summary !== true ? this.records[ind] : this.summary[ind]);
            var data   = this.getCellValue(ind, col_ind, summary);
            var edit   = col.editable;
            var style  = 'max-height: '+ parseInt(this.recordHeight) +'px;';
            // various renderers
            if (typeof col.render != 'undefined') {
                if (typeof col.render == 'function') {
                    data = $.trim(col.render.call(this, record, ind, col_ind));
                    if (data.length < 4 || data.substr(0, 4).toLowerCase() != '<div') data = '<div style="'+ style +'">' + data + '</div>';
                }
                if (typeof col.render == 'object')   data = '<div style="'+ style +'">' + (col.render[data] || '') + '</div>';
                if (typeof col.render == 'string') {
                    var t   = col.render.toLowerCase().indexOf(':');
                    var tmp = [];
                    if (t == -1) {
                        tmp[0] = col.render.toLowerCase();
                        tmp[1] = '';
                    } else {
                        tmp[0] = col.render.toLowerCase().substr(0, t);
                        tmp[1] = col.render.toLowerCase().substr(t+1);
                    }
                    var prefix = '';
                    var suffix = '';
                    if (['number', 'int', 'float', 'money', 'currency', 'percent'].indexOf(tmp[0]) != -1) {
                        if (typeof tmp[1] == 'undefined' || !w2utils.isInt(tmp[1])) tmp[1] = 0;
                        if (tmp[1] > 20) tmp[1] = 20;
                        if (tmp[1] < 0)  tmp[1] = 0;
                        if (['money', 'currency'].indexOf(tmp[0]) != -1) { tmp[1] = w2utils.settings.currencyPrecision; prefix = w2utils.settings.currencyPrefix; suffix = w2utils.settings.currencySuffix; }
                        if (tmp[0] == 'percent') { suffix = '%'; if (tmp[1] !== '0') tmp[1] = 1; }
                        if (tmp[0] == 'int')     { tmp[1] = 0; }
                        // format
                        data = '<div style="'+ style +'">' + (data !== '' ? prefix + w2utils.formatNumber(Number(data).toFixed(tmp[1])) + suffix : '') + '</div>';
                    }
                    if (tmp[0] == 'time') {
                        if (typeof tmp[1] == 'undefined' || tmp[1] == '') tmp[1] = w2utils.settings.time_format;
                        if (tmp[1] == 'h12') tmp[1] = 'hh:mi pm';
                        if (tmp[1] == 'h24') tmp[1] = 'h24:mi';
                        data = '<div style="'+ style +'">' + prefix + w2utils.formatTime(data, tmp[1]) + suffix + '</div>';
                    }
                    if (tmp[0] == 'date') {
                        if (typeof tmp[1] == 'undefined' || tmp[1] == '') tmp[1] = w2utils.settings.date_display;
                        data = '<div style="'+ style +'">' + prefix + w2utils.formatDate(data, tmp[1]) + suffix + '</div>';
                    }
                    if (tmp[0] == 'datetime') {
                        if (typeof tmp[1] == 'undefined' || tmp[1] == '') tmp[1] = w2utils.settings.date_display + '|' + w2utils.settings.time_format;
                        data = '<div style="'+ style +'">' + prefix + w2utils.formatDateTime(data, tmp[1]) + suffix + '</div>';
                    }
                    if (tmp[0] == 'age') {
                        data = '<div style="'+ style +'">' + prefix + w2utils.age(data) + suffix + '</div>';
                    }
                    if (tmp[0] == 'toggle') {
                        data = '<div style="'+ style +'">' + prefix + (data ? 'Yes' : '') + suffix + '</div>';
                    }
                }
            } else {
                // if editable checkbox
                if (edit && ['checkbox', 'check'].indexOf(edit.type) != -1) {
                    var changeInd = summary ? -(ind + 1) : ind;
                    style += 'text-align: center;';
                    data = '<input tabindex="-1" type="checkbox" '+ (data ? 'checked' : '') +' onclick="' +
                           '    var obj = w2ui[\''+ this.name + '\']; '+
                           '    obj.editChange.call(obj, this, '+ changeInd +', '+ col_ind +', event); ' +
                           '">';
                }
                if (!this.show.recordTitles) {
                    // title overwrite
                    var title = w2utils.stripTags(String(data).replace(/"/g, "''"));
                    if (typeof col.title != 'undefined') {
                        if (typeof col.title == 'function') title = col.title.call(this, record, ind, col_ind);
                        if (typeof col.title == 'string')   title = col.title;
                    }
                }
                data = '<div style="'+ style +'" title="'+ title +'">'+ data +'</div>';
            }
            if (data == null) data = '';
            return data;
        },

        getCellValue: function (ind, col_ind, summary) {
            var col    = this.columns[col_ind];
            var record = (summary !== true ? this.records[ind] : this.summary[ind]);
            var data   = this.parseField(record, col.field);
            if (record.changes && typeof record.changes[col.field] != 'undefined') {
                data = record.changes[col.field];
            }
            if ($.isPlainObject(data)) {
                if (data.text != null) data = data.text;
                if (data.id != null) data = data.id;
            }
            if (data == null) data = '';
            return data;
        },

        getFooterHTML: function () {
            return '<div>'+
                '    <div class="w2ui-footer-left"></div>'+
                '    <div class="w2ui-footer-right"></div>'+
                '    <div class="w2ui-footer-center"></div>'+
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
                    if (this.show.statusSelection && sel.length > 1) {
                        msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' ' + w2utils.lang('selected');
                    }
                    if (this.show.statusRecordID && sel.length == 1) {
                        var tmp = sel[0];
                        if (typeof tmp == 'object') tmp = tmp.recid + ', '+ w2utils.lang('Column') +': '+ tmp.column;
                        msgLeft = w2utils.lang('Record ID') + ': '+ tmp + ' ';
                    }
                }
                $('#grid_'+ this.name +'_footer .w2ui-footer-left').html(msgLeft);
                // toolbar
                if (sel.length == 1) this.toolbar.enable('w2ui-edit'); else this.toolbar.disable('w2ui-edit');
                if (sel.length >= 1) this.toolbar.enable('w2ui-delete'); else this.toolbar.disable('w2ui-delete');
            }
        },

        lock: function (msg, showSpinner) {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(this.box);
            setTimeout(function () { w2utils.lock.apply(window, args); }, 10);
        },

        unlock: function (speed) {
            var box = this.box;
            setTimeout(function () { w2utils.unlock(box, speed); }, 25); // needed timer so if server fast, it will not flash
        },

        stateSave: function (returnOnly) {
            if (!localStorage) return null;
            var state = {
                columns     : [],
                show        : $.extend({}, this.show),
                last        : {
                    search      : this.last.search,
                    multi       : this.last.multi,
                    logic       : this.last.logic,
                    caption     : this.last.caption,
                    field       : this.last.field,
                    scrollTop   : this.last.scrollTop,
                    scrollLeft  : this.last.scrollLeft
                },
                sortData    : [],
                searchData  : []
            };
            for (var i = 0; i < this.columns.length; i++) {
                var col = this.columns[i];
                state.columns.push({
                    field           : col.field,
                    hidden          : col.hidden ? true : false,
                    size            : col.size ? col.size : null,
                    sizeCalculated  : col.sizeCalculated ? col.sizeCalculated : null,
                    sizeOriginal    : col.sizeOriginal ? col.sizeOriginal : null,
                    sizeType        : col.sizeType ? col.sizeType : null
                });
            }
            for (var i = 0; i < this.sortData.length; i++) state.sortData.push($.extend({}, this.sortData[i]));
            for (var i = 0; i < this.searchData.length; i++) state.searchData.push($.extend({}, this.searchData[i]));
            // save into local storage
            if (returnOnly !== true) {
                // event before
                var eventData = this.trigger({ phase: 'before', type: 'stateSave', target: this.name, state: state });
                if (eventData.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return; }
                try {
                    var savedState = $.parseJSON(localStorage.w2ui || '{}');
                    if (!savedState) savedState = {};
                    if (!savedState.states) savedState.states = {};
                    savedState.states[this.name] = state;
                    localStorage.w2ui = JSON.stringify(savedState);
                } catch (e) {
                    delete localStorage.w2ui;
                    return null;
                }
                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
            }
            return state;
        },

        stateRestore: function (newState) {
            var obj = this;
            if (!newState) {
                // read it from local storage
                try {
                    if (!localStorage) return false;
                    var tmp = $.parseJSON(localStorage.w2ui || '{}');
                    if (!tmp) tmp = {};
                    if (!tmp.states) tmp.states = {};
                    newState = tmp.states[this.name];
                } catch (e) {
                    delete localStorage.w2ui;
                    return null;
                }
            }
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'stateRestore', target: this.name, state: newState });
            if (eventData.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return; }
            // default behavior
            if ($.isPlainObject(newState)) {
                $.extend(this.show, newState.show);
                $.extend(this.last, newState.last);
                var sTop  = this.last.scrollTop;
                var sLeft = this.last.scrollLeft;
                for (var c = 0; c < newState.columns.length; c++) {
                    var tmp = newState.columns[c];
                    var col = this.getColumn(tmp.field);
                    if (col) $.extend(col, tmp);
                }
                this.sortData.splice(0, this.sortData.length);
                for (var c = 0; c < newState.sortData.length; c++) this.sortData.push(newState.sortData[c]);
                this.searchData.splice(0, this.searchData.length);
                for (var c = 0; c < newState.searchData.length; c++) this.searchData.push(newState.searchData[c]);
                // apply sort and search
                setTimeout(function () {
                    // needs timeout as records need to be populated
                    // ez 10.09.2014 this -->
                    if (!(typeof obj.url != 'object' ? obj.url : obj.url.get)) {
                        if (obj.sortData.length > 0) obj.localSort();
                        if (obj.searchData.length > 0) obj.localSearch();
                    }
                    obj.last.scrollTop  = sTop;
                    obj.last.scrollLeft = sLeft;
                    obj.refresh();
                }, 1);
            }
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return true;
        },

        stateReset: function () {
            this.stateRestore(this.last.state);
            // remove from local storage
            if (localStorage) {
                try {
                    var tmp = $.parseJSON(localStorage.w2ui || '{}');
                    if (tmp.states && tmp.states[this.name]) {
                        delete tmp.states[this.name];
                    }
                    localStorage.w2ui = JSON.stringify(tmp);
                } catch (e) {
                    delete localStorage.w2ui;
                    return null;
                }
            }
        },

        parseField: function (obj, field) {
            var val = '';
            try { // need this to make sure no error in fields
                val = obj;
                var tmp = String(field).split('.');
                for (var i = 0; i < tmp.length; i++) {
                    val = val[tmp[i]];
                }
            } catch (event) {
                val = '';
            }
            return val;
        },

        prepareData: function () {
            // loops thru records and prepares date and time objects
            for (var r = 0; r < this.records.length; r++) {
                var rec = this.records[r];
                for (var c = 0; c < this.columns.length; c++) {
                    var column = this.columns[c];
                    if (rec[column.field] == null || typeof column.render != 'string') continue;
                    // number
                    if (['number', 'int', 'float', 'money', 'currency', 'percent'].indexOf(column.render.split(':')[0])  != -1) {
                        if (typeof rec[column.field] != 'number') rec[column.field] = parseFloat(rec[column.field]);
                    }
                    // date
                    if (['date', 'age'].indexOf(column.render.split(':')[0]) != -1) {
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

        nextCell: function (index, col_ind, editable) {
            var check = col_ind + 1;
            if (this.columns.length == check) return null;

            var tmp  = this.records[index].w2ui;
            var span = (tmp && tmp.colspan ? tmp.colspan[this.columns[check].field] : 1);
            var edit = this.columns[check].editable;
            if (this.columns[check].hidden || span == 0 
                    || (editable == true && (edit == null ||  ['checkbox', 'check'].indexOf(edit.type) != -1))) {
                return this.nextCell(index, check, editable);
            }
            return check;
        },

        prevCell: function (index, col_ind, editable) {
            var check = col_ind - 1;
            if (check < 0) return null;
            var tmp  = this.records[index].w2ui;
            var span = (tmp && tmp.colspan ? tmp.colspan[this.columns[check].field] : 1);
            var edit = this.columns[check].editable;
            if (this.columns[check].hidden || span == 0 
                    || (editable == true && (edit == null ||  ['checkbox', 'check'].indexOf(edit.type) != -1))) {
                return this.prevCell(index, check, editable);
            }
            return check;
        },

        nextRow: function (ind, col_ind) {
            var sids = this.last.searchIds;
            if ((ind + 1 < this.records.length && sids.length == 0) // if there are more records
                    || (sids.length > 0 && ind < sids[sids.length-1])) {
                ind++;
                if (sids.length > 0) while (true) {
                    if ($.inArray(ind, sids) != -1 || ind > this.records.length) break;
                    ind++;
                }
                //  check for colspan
                var tmp = this.records[ind].w2ui;
                if (tmp && tmp.colspan && tmp.colspan[this.columns[col_ind].field] == 0) {
                    return this.nextRow(ind, col_ind);
                }
                return ind;
            } else {
                return null;
            }
        },

        prevRow: function (ind, col_ind) {
            var sids = this.last.searchIds;
            if ((ind > 0 && sids.length == 0)  // if there are more records
                    || (sids.length > 0 && ind > sids[0])) {
                ind--;
                if (sids.length > 0) while (true) {
                    if ($.inArray(ind, sids) != -1 || ind < 0) break;
                    ind--;
                }
                //  check for colspan
                var tmp = this.records[ind].w2ui;
                if (tmp && tmp.colspan && tmp.colspan[this.columns[col_ind].field] == 0) {
                    return this.prevRow(ind, col_ind);
                }
                return ind;
            } else {
                return null;
            }
        },

        selectionSave: function () {
            this.last._selection = this.getSelection();
            return this.last._selection;
        },

        selectionRestore: function () {
            var time = (new Date()).getTime();
            this.last.selection = { indexes: [], columns: {} };
            var sel = this.last.selection;
            var lst = this.last._selection;
            for (var i = 0; i < lst.length; i++) {
                if ($.isPlainObject(lst[i])) {
                    // selectType: cell
                    var tmp = this.get(lst[i].recid, true);
                    if (tmp != null) {
                        if (sel.indexes.indexOf(tmp) == -1) sel.indexes.push(tmp);
                        if (!sel.columns[tmp]) sel.columns[tmp] = [];
                        sel.columns[tmp].push(lst[i].column);
                    }
                } else {
                    // selectType: row
                    var tmp = this.get(lst[i], true);
                    if (tmp != null) sel.indexes.push(tmp);
                }
            }
            delete this.last._selection;
            this.refresh();
            return (new Date()).getTime() - time;
        }
    };

    $.extend(w2grid.prototype, w2utils.event);
    w2obj.grid = w2grid;
})();
