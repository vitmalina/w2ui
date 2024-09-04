/**
 * Part of w2ui 2.0 library
 *  - Dependencies: jQuery, w2utils, w2base, w2toolbar, w2field
 *
 * == TODO ==
 *  - problem with .set() and arrays, array get extended too, but should be replaced
 *  - allow functions in routeData (also add routeData to list/enum)
 *  - send parsed URL to the event if there is routeData
 *  - add selectType: 'none' so that no selection can be make but with mouse
 *  - focus/blur for selectType = cell not display grayed out selection
 *  - allow enum in inline edit (see https://github.com/vitmalina/w2ui/issues/911#issuecomment-107341193)
 *  - remote source, but localSort/localSearch
 *  - promise for request, load, save, etc.
 *  - onloadmore event (so it will be easy to implement remote data source with local sort)
 *  - status() - clears on next select, etc. Should not if it is off
 *
 * == DEMOS To create ==
 *  - batch for disabled buttons
 *  - natural sort
 *
 * == 2.0 changes
 *  - toolbarInput - deprecated, toolbarSearch stays
 *  - searchSuggest
 *  - searchSave, searchSelected, savedSearches, defaultSearches, useLocalStorage, searchFieldTooltip
 *  - cache, cacheSave
 *  - onSearchSave, onSearchRemove, onSearchSelect
 *  - show.searchLogic
 *  - show.searchSave
 *  - refreshSearch
 *  - initAllFields -> searchInitInput
 *  - textSearch - deprecated in favor of defaultOperator
 *  - grid.confirm - refactored
 *  - grid.message - refactored
 *  - search.type == 'text' can have 'in' and 'not in' operators, then it will switch to enum
 *  - grid.find(..., displayedOnly)
 *  - column.render(..., this) - added
 *  - observeResize for the box
 *  - remove edit.type == 'select'
 *  - editDone(...)
 *  - liveSearch
 *  - deprecated onUnselect event
 *  - requestComplete(data, action, callBack, resolve, reject) - new argument list
 *  - msgAJAXError -> msgHTTPError
 *  - aded msgServerError
 *  - deleted grid.method
 *  - added mouseEnter/mouseLeave
 *  - grid.show.columnReorder -> grid.reorderRows
 *  - updagte docs search.label (not search.text)
 *  - added columnAutoSize - which resizes column based on text in it
 *  - added grid.replace()
 *  - grid.compareSelection
 */

import { w2base } from './w2base.js'
import { w2ui, w2utils } from './w2utils.js'
import { query } from './query.js'
import { w2toolbar } from './w2toolbar.js'
import { w2menu, w2tooltip } from './w2tooltip.js'
import { w2field } from './w2field.js'

class w2grid extends w2base {
    constructor(options) {
        super(options.name)
        this.name         = null
        this.box          = null // HTML element that hold this element
        this.columns      = [] // { field, text, size, attr, render, hidden, gridMinWidth, editable }
        this.columnGroups = [] // { span: int, text: 'string', main: true/false, style: 'string' }
        this.records      = [] // { recid: int(required), field1: 'value1', ... fieldN: 'valueN', style: 'string',  changes: object }
        this.summary      = [] // array of summary records, same structure as records array
        this.searches     = [] // { type, label, field, attr, text, hidden }
        this.toolbar      = {} // if not empty object; then it is toolbar object
        this.ranges       = []
        this.contextMenu  = []
        this.searchMap    = {} // re-map search fields
        this.searchData   = []
        this.sortMap      = {} // re-map sort fields
        this.sortData     = []
        this.savedSearches   = []
        this.defaultSearches = []
        this.total        = 0 // server total
        this.recid        = null // field from records to be used as recid

        // internal
        this.last = {
            field     : '',         // last search field, e.g. 'all'
            label     : '',         // last search field label, e.g. 'All Fields'
            logic     : 'AND',      // last search logic, e.g. 'AND' or 'OR'
            search    : '',         // last search text
            searchIds : [],         // last search IDs
            selection : {           // last selection details
                indexes : [],
                columns : {}
            },
            saved_sel     : null,     // last result of selectionSave()
            multi         : false,    // last multi flag, true when searching for multiple fields
            fetch: {
                action    : '',       // last fetch command, e.g. 'load'
                offset    : null,     // last fetch offset, integer
                start     : 0,        // timestamp of start of last fetch request
                response  : 0,        // time it took to complete the last fetch request in seconds
                options   : null,
                controller: null,
                loaded    : false,    // data is loaded from the server
                hasMore   : false     // flag to indicate if there are more items to pull from the server
            },
            vscroll: {
                scrollTop     : 0,    // last scrollTop position
                scrollLeft    : 0,    // last scrollLeft position
                recIndStart   : null, // record index for first record in DOM
                recIndEnd     : null, // record index for last record in DOM
                colIndStart   : 0,    // for column virtual scrolling
                colIndEnd     : 0,    // for column virtual scrolling
                pull_more     : false,
                pull_refresh  : true,
                show_extra    : 0,    // last show extra for virtual scrolling
            },
            sel_ind       : null,     // last selected cell index
            sel_col       : null,     // last selected column
            sel_type      : null,     // last selection type, e.g. 'click' or 'key'
            sel_recid     : null,     // last selected record id
            idCache       : {},       // object, id cache for get()
            move          : null,     // object, move details
            cancelClick   : null,     // boolean flag to indicate if the click event should be ignored, set during mouseMove()
            inEditMode    : false,    // flag to indicate if we're currently in edit mode during inline editing
            _edit         : null,     // object with details on the last edited cell, { value, index, column, recid }
            kbd_timer     : null,     // last id of blur() timer
            marker_timer  : null,     // last id of markSearch() timer
            click_time    : null,     // timestamp of last click
            click_recid   : null,     // last clicked record id
            bubbleEl      : null,     // last bubble element
            colResizing   : false,    // flag to indicate that a column is currently being resized
            tmp           : null,     // object with last column resizing details
            copy_event    : null,     // last copy event
            userSelect    : '',       // last user select type, e.g. 'text'
            columnDrag    : false,    // false or an object with a remove() method
            state         : null,     // last grid state
            toolbar_height: 0,        // height of grid's toolbar
        }
        this.header            = ''
        this.url               = ''
        this.limit             = 100
        this.offset            = 0 // how many records to skip (for infinite scroll) when pulling from server
        this.postData          = {}
        this.routeData         = {}
        this.httpHeaders       = {}
        this.show              = {
            header          : false,
            toolbar         : false,
            footer          : false,
            columnMenu      : true,
            columnHeaders   : true,
            lineNumbers     : false,
            expandColumn    : false,
            selectColumn    : false,
            emptyRecords    : true,
            toolbarReload   : true,
            toolbarColumns  : false,
            toolbarSearch   : true,
            toolbarAdd      : false,
            toolbarEdit     : false,
            toolbarDelete   : false,
            toolbarSave     : false,
            searchAll       : true,
            searchLogic     : true,
            searchHiddenMsg : false,
            searchSave      : true,
            statusRange     : true,
            statusBuffered  : false,
            statusRecordID  : true,
            statusSelection : true,
            statusResponse  : true,
            statusSort      : false,
            statusSearch    : false,
            recordTitles    : false,
            selectionBorder : true,
            selectionResizer: true,
            skipRecords     : true,
            saveRestoreState: true
        }
        this.stateId           = null // Custom state name for stateSave, stateRestore and stateReset
        this.hasFocus          = false
        this.autoLoad          = true // for infinite scroll
        this.fixedBody         = true // if false; then grid grows with data
        this.recordHeight      = 32
        this.lineNumberWidth   = 34
        this.keyboard          = true
        this.selectType        = 'row' // can be row|cell
        this.liveSearch        = false // if true, it will auto search if typed in search_all
        this.multiSearch       = true
        this.multiSelect       = true
        this.multiSort         = true
        this.reorderColumns    = false
        this.reorderRows       = false
        this.showExtraOnSearch = 0 // show extra records before and after on search
        this.markSearch        = true
        this.columnTooltip     = 'top|bottom' // can be top, bottom, left, right
        this.disableCVS        = false // disable Column Virtual Scroll
        this.nestedFields      = true // use field name containing dots as separator to look into object
        this.vs_start          = 150
        this.vs_extra          = 5
        this.style             = ''
        this.tabIndex          = null
        this.dataType          = null // if defined, then overwrites w2utils.settings.dataType
        this.parser            = null
        this.advanceOnEdit     = true // automatically begin editing the next cell after submitting an inline edit?
        this.useLocalStorage   = true

        // default values for the column
        this.colTemplate = {
            text           : '',    // column text (can be a function)
            field          : '',    // field name to map the column to a record
            size           : null,  // size of column in px or %
            min            : 20,    // minimum width of column in px
            max            : null,  // maximum width of column in px
            gridMinWidth   : null,  // minimum width of the grid when column is visible
            sizeCorrected  : null,  // read only, corrected size (see explanation below)
            sizeCalculated : null,  // read only, size in px (see explanation below)
            sizeOriginal   : null,  // size as defined
            sizeType       : null,  // px or %
            hidden         : false, // indicates if column is hidden
            sortable       : false, // indicates if column is sortable
            sortMode       : null,  // sort mode ('default'|'natural'|'i18n') or custom compare function
            searchable     : false, // bool/string: int,float,date,... or an object to create search field
            resizable      : true,  // indicates if column is resizable
            hideable       : true,  // indicates if column can be hidden
            autoResize     : null,  // indicates if column can be auto-resized by double clicking on the resizer
            attr           : '',    // string that will be inside the <td ... attr> tag
            style          : '',    // additional style for the td tag
            render         : null,  // string or render function
            title          : null,  // string or function for the title property for the column cells
            tooltip        : null,  // string for the title property for the column header
            editable       : {},    // editable object (see explanation below)
            frozen         : false, // indicates if the column is fixed to the left
            info           : null,  // info bubble, can be bool/object
            clipboardCopy  : false, // if true (or string or function), it will display clipboard copy icon
        }

        // these column properties will be saved in stateSave()
        this.stateColProps = {
            text            : false,
            field           : true,
            size            : true,
            min             : false,
            max             : false,
            gridMinWidth    : false,
            sizeCorrected   : false,
            sizeCalculated  : true,
            sizeOriginal    : true,
            sizeType        : true,
            hidden          : true,
            sortable        : false,
            sortMode        : true,
            searchable      : false,
            resizable       : false,
            hideable        : false,
            autoResize      : false,
            attr            : false,
            style           : false,
            render          : false,
            title           : false,
            tooltip         : false,
            editable        : false,
            frozen          : true,
            info            : false,
            clipboardCopy   : false
        }

        this.msgDelete     = 'Are you sure you want to delete ${count} ${records}?'
        this.msgNotJSON    = 'Returned data is not in valid JSON format.'
        this.msgHTTPError  = 'HTTP error. See console for more details.'
        this.msgServerError= 'Server error'
        this.msgRefresh    = 'Refreshing...'
        this.msgNeedReload = 'Your remote data source record count has changed, reloading from the first record.'
        this.msgEmpty      = '' // if not blank, then it is message when server returns no records

        this.buttons = {
            'reload'   : { type: 'button', id: 'w2ui-reload', icon: 'w2ui-icon-reload', tooltip: w2utils.lang('Reload data in the list') },
            'columns'  : { type: 'menu-check', id: 'w2ui-column-on-off', icon: 'w2ui-icon-columns', tooltip: w2utils.lang('Show/hide columns'),
                overlay: { align: 'none' }
            },
            'search'   : { type: 'html', id: 'w2ui-search',
                html: '<div class="w2ui-icon w2ui-icon-search w2ui-search-down w2ui-action" data-click="searchShowFields"></div>'
            },
            'add'      : { type: 'button', id: 'w2ui-add', text: 'Add New', tooltip: w2utils.lang('Add new record'), icon: 'w2ui-icon-plus' },
            'edit'     : { type: 'button', id: 'w2ui-edit', text: 'Edit', tooltip: w2utils.lang('Edit selected record'), icon: 'w2ui-icon-pencil', batch: 1, disabled: true },
            'delete'   : { type: 'button', id: 'w2ui-delete', text: 'Delete', tooltip: w2utils.lang('Delete selected records'), icon: 'w2ui-icon-cross', batch: true, disabled: true },
            'save'     : { type: 'button', id: 'w2ui-save', text: 'Save', tooltip: w2utils.lang('Save changed records'), icon: 'w2ui-icon-check' }
        }

        this.operators = { // for search fields
            'text'    : ['is', 'begins', 'contains', 'ends'], // could have "in" and "not in"
            'number'  : ['=', 'between', '>', '<', '>=', '<='],
            'date'    : ['is', { oper: 'less', text: 'before'}, { oper: 'more', text: 'since' }, 'between'],
            'list'    : ['is'],
            'hex'     : ['is', 'between'],
            'color'   : ['is', 'begins', 'contains', 'ends'],
            'enum'    : ['in', 'not in']
            // -- all possible
            // "text"    : ['is', 'begins', 'contains', 'ends'],
            // "number"  : ['is', 'between', 'less:less than', 'more:more than', 'null:is null', 'not null:is not null'],
            // "list"    : ['is', 'null:is null', 'not null:is not null'],
            // "enum"    : ['in', 'not in', 'null:is null', 'not null:is not null']
        }
        this.defaultOperator = {
            'text'    : 'begins',
            'number'  : '=',
            'date'    : 'is',
            'list'    : 'is',
            'enum'    : 'in',
            'hex'     : 'begins',
            'color'   : 'begins'
        }

        // map search field type to operator
        this.operatorsMap = {
            'text'         : 'text',
            'int'          : 'number',
            'float'        : 'number',
            'money'        : 'number',
            'currency'     : 'number',
            'percent'      : 'number',
            'hex'          : 'hex',
            'alphanumeric' : 'text',
            'color'        : 'color',
            'date'         : 'date',
            'time'         : 'date',
            'datetime'     : 'date',
            'list'         : 'list',
            'combo'        : 'text',
            'enum'         : 'enum',
            'file'         : 'enum',
            'select'       : 'list',
            'radio'        : 'list',
            'checkbox'     : 'list',
            'toggle'       : 'list'
        }

        // events
        this.onAdd               = null
        this.onEdit              = null
        this.onRequest           = null // called on any server event
        this.onLoad              = null
        this.onDelete            = null
        this.onSave              = null
        this.onSelect            = null
        this.onClick             = null
        this.onDblClick          = null
        this.onContextMenu       = null
        this.onContextMenuClick  = null // when context menu item selected
        this.onColumnClick       = null
        this.onColumnDblClick    = null
        this.onColumnContextMenu = null
        this.onColumnResize      = null
        this.onColumnAutoResize  = null
        this.onSort              = null
        this.onSearch            = null
        this.onSearchOpen        = null
        this.onChange            = null // called when editable record is changed
        this.onRestore           = null // called when editable record is restored
        this.onExpand            = null
        this.onCollapse          = null
        this.onError             = null
        this.onKeydown           = null
        this.onToolbar           = null // all events from toolbar
        this.onColumnOnOff       = null
        this.onCopy              = null
        this.onPaste             = null
        this.onSelectionExtend   = null
        this.onEditField         = null
        this.onRender            = null
        this.onRefresh           = null
        this.onReload            = null
        this.onResize            = null
        this.onDestroy           = null
        this.onStateSave         = null
        this.onStateRestore      = null
        this.onFocus             = null
        this.onBlur              = null
        this.onReorderRow        = null
        this.onSearchSave        = null
        this.onSearchRemove      = null
        this.onSearchSelect      = null
        this.onColumnSelect      = null
        this.onColumnDragStart   = null
        this.onColumnDragEnd     = null
        this.onResizerDblClick   = null
        this.onMouseEnter        = null // mouse enter over record event
        this.onMouseLeave        = null

        // need deep merge, should be extend, not objectAssign
        w2utils.extend(this, options)

        // check if there are records without recid
        if (Array.isArray(this.records)) {
            let remove = [] // remove from records as they are summary
            this.records.forEach((rec, ind) => {
                if (rec[this.recid] != null) {
                    rec.recid = rec[this.recid]
                }
                if (rec.recid == null) {
                    console.log('ERROR: Cannot add records without recid. (obj: '+ this.name +')')
                }
                if (rec.w2ui?.summary === true) {
                    this.summary.push(rec)
                    remove.push(ind) // cannot remove here as it will mess up array walk thru
                }
            })
            remove.sort()
            for (let t = remove.length-1; t >= 0; t--) {
                this.records.splice(remove[t], 1)
            }
        }
        // add searches
        if (Array.isArray(this.columns)) {
            this.columns.forEach((col, ind) => {
                col = w2utils.extend({}, this.colTemplate, col)
                this.columns[ind] = col
                let search = col.searchable
                if (search == null || search === false || this.getSearch(col.field) != null) return
                if (w2utils.isPlainObject(search)) {
                    this.addSearch(w2utils.extend({ field: col.field, label: col.text, type: 'text' }, search))
                } else {
                    let stype = col.searchable
                    let attr  = ''
                    if (col.searchable === true) {
                        stype = 'text'
                        attr  = 'size="20"'
                    }
                    this.addSearch({ field: col.field, label: col.text, type: stype, attr: attr })
                }
            })
        }
        // add icon to default searches if not defined
        if (Array.isArray(this.defaultSearches)) {
            this.defaultSearches.forEach((search, ind) => {
                search.id = 'default-'+ ind
                search.icon ??= 'w2ui-icon-search'
            })
        }
        // check if there are saved searches in localStorage
        let data = this.cache('searches')
        if (Array.isArray(data)) {
            data.forEach(search => {
                this.savedSearches.push({
                    id: search.id ?? 'none',
                    text: search.text ?? 'none',
                    icon: 'w2ui-icon-search',
                    remove: true,
                    logic: search.logic ?? 'AND',
                    data: search.data ?? []
                })
            })
        }
        // init toolbar
        this.initToolbar()
        // render if box specified
        if (typeof this.box == 'string') this.box = query(this.box).get(0)
        if (this.box) this.render(this.box)
    }

    add(record, first) {
        if (!Array.isArray(record)) record = [record]
        let added = 0
        for (let i = 0; i < record.length; i++) {
            let rec = record[i]
            if (rec[this.recid] != null) {
                rec.recid = rec[this.recid]
            }
            if (rec.recid == null) {
                console.log('ERROR: Cannot add record without recid. (obj: '+ this.name +')')
                continue
            }
            if (rec.w2ui?.summary === true) {
                if (first) this.summary.unshift(rec); else this.summary.push(rec)
            } else {
                if (first) this.records.unshift(rec); else this.records.push(rec)
            }
            added++
        }
        let url = this.url?.get ?? this.url
        if (!url) {
            this.total = this.records.length
            this.localSort(false, true)
            this.localSearch()
            // only refresh if it is in virtual view
            let indStart = this.records.length - record.length
            let indEnd  = indStart + record.length
            if (this.last.vscroll.recIndStart <= indEnd && this.last.vscroll.recIndEnd >= indStart) {
                this.refresh()
            } else {
                // just update total if it it there
                query(this.box)
                    .find('#grid_'+ this.name + '_footer .w2ui-footer-right .w2ui-total')
                    .html(w2utils.formatNumber(this.total))
            }
        } else {
            this.refresh()
        }
        return added
    }

    find(obj, returnIndex, displayedOnly) {
        if (obj == null) obj = {}
        let recs    = []
        let hasDots = false
        // check if property is nested - needed for speed
        for (let o in obj) if (String(o).indexOf('.') != -1) hasDots = true
        // look for an item
        let start = displayedOnly ? this.last.vscroll.recIndStart : 0
        let end   = displayedOnly ? this.last.vscroll.recIndEnd + 1: this.records.length
        if (end > this.records.length) end = this.records.length
        for (let i = start; i < end; i++) {
            let match = true
            for (let o in obj) {
                let val = this.records[i][o]
                if (hasDots && String(o).indexOf('.') != -1) val = this.parseField(this.records[i], o)
                if (obj[o] == 'not-null') {
                    if (val == null || val === '') match = false
                } else {
                    if (obj[o] != val) match = false
                }
            }
            if (match && returnIndex !== true) recs.push(this.records[i].recid)
            if (match && returnIndex === true) recs.push(i)
        }
        return recs
    }

    // does not delete existing, but overrides on top of it
    set(recid, record, noRefresh) {
        if ((typeof recid == 'object') && (recid !== null)) {
            noRefresh = record
            record    = recid
            recid     = null
        }
        // update all records
        if (recid == null) {
            for (let i = 0; i < this.records.length; i++) {
                w2utils.extend(this.records[i], record) // recid is the whole record
            }
            if (noRefresh !== true) this.refresh()
        } else { // find record to update
            let ind = this.get(recid, true)
            if (ind == null) return false
            let isSummary = (this.records[ind]?.recid == recid ? false : true)
            if (isSummary) {
                w2utils.extend(this.summary[ind], record)
            } else {
                w2utils.extend(this.records[ind], record)
            }
            if (noRefresh !== true) this.refreshRow(recid, ind) // refresh only that record
        }
        return true
    }

    // replaces existing record
    replace(recid, record, noRefresh) {
        let ind = this.get(recid, true)
        if (ind == null) return false
        let isSummary = (this.records[ind]?.recid == recid ? false : true)
        if (isSummary) {
            this.summary[ind] = record
        } else {
            this.records[ind] = record
        }
        if (noRefresh !== true) this.refreshRow(recid, ind) // refresh only that record
        return true
    }

    get(recid, returnIndex) {
        // search records
        if (Array.isArray(recid)) {
            let recs = []
            for (let i = 0; i < recid.length; i++) {
                let v = this.get(recid[i], returnIndex)
                if (v !== null)
                    recs.push(v)
            }
            return recs
        } else {
            // get() must be fast, implements a cache to bypass loop over all records
            // most of the time.
            let idCache = this.last.idCache
            if (!idCache) {
                this.last.idCache = idCache = {}
            }
            let i = idCache[recid]
            if (typeof(i) === 'number') {
                if (i >= 0 && i < this.records.length && this.records[i].recid == recid) {
                    if (returnIndex === true) return i; else return this.records[i]
                }
                // summary indexes are stored as negative numbers, try them now.
                i = ~i
                if (i >= 0 && i < this.summary.length && this.summary[i].recid == recid) {
                    if (returnIndex === true) return i; else return this.summary[i]
                }
                // wrong index returned, clear cache
                this.last.idCache = idCache = {}
            }
            for (let i = 0; i < this.records.length; i++) {
                if (this.records[i].recid == recid) {
                    idCache[recid] = i
                    if (returnIndex === true) return i; else return this.records[i]
                }
            }
            // search summary
            for (let i = 0; i < this.summary.length; i++) {
                if (this.summary[i].recid == recid) {
                    idCache[recid] = ~i
                    if (returnIndex === true) return i; else return this.summary[i]
                }
            }
            return null
        }
    }

    getFirst(offset) {
        if (this.records.length == 0) return null
        let rec = this.records[0]
        let tmp = this.last.searchIds
        if (this.searchData.length > 0) {
            if (Array.isArray(tmp) && tmp.length > 0) {
                rec = this.records[tmp[offset || 0]]
            } else {
                rec = null
            }
        }
        return rec
    }

    remove() {
        let removed = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.records.length-1; r >= 0; r--) {
                if (this.records[r].recid == arguments[a]) { this.records.splice(r, 1); removed++ }
            }
            for (let r = this.summary.length-1; r >= 0; r--) {
                if (this.summary[r].recid == arguments[a]) { this.summary.splice(r, 1); removed++ }
            }
        }
        let url = this.url?.get ?? this.url
        if (!url) {
            this.localSort(false, true)
            this.localSearch()
            this.total = this.records.length
        }
        this.refresh()
        return removed
    }

    addColumn(before, columns) {
        let added = 0
        if (arguments.length == 1) {
            columns = before
            before  = this.columns.length
        } else {
            if (typeof before == 'string') before = this.getColumn(before, true)
            if (before == null) before = this.columns.length
        }
        if (!Array.isArray(columns)) columns = [columns]
        for (let i = 0; i < columns.length; i++) {
            let col = w2utils.extend({}, this.colTemplate, columns[i])
            this.columns.splice(before, 0, col)
            // if column is searchable, add search field
            if (columns[i].searchable) {
                let stype = columns[i].searchable
                let attr  = ''
                if (columns[i].searchable === true) { stype = 'text'; attr = 'size="20"' }
                this.addSearch({ field: columns[i].field, label: columns[i].text, type: stype, attr: attr })
            }
            before++
            added++
        }
        this.refresh()
        return added
    }

    removeColumn() {
        let removed = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.columns.length-1; r >= 0; r--) {
                if (this.columns[r].field == arguments[a]) {
                    if (this.columns[r].searchable) this.removeSearch(arguments[a])
                    this.columns.splice(r, 1)
                    removed++
                }
            }
        }
        this.refresh()
        return removed
    }

    getColumn(field, returnIndex) {
        // no arguments - return fields of all columns
        if (arguments.length === 0) {
            let ret = []
            for (let i = 0; i < this.columns.length; i++) ret.push(this.columns[i].field)
            return ret
        }
        // find column
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].field == field) {
                if (returnIndex === true) return i; else return this.columns[i]
            }
        }
        return null
    }

    updateColumn(fields, updates) {
        let effected = 0
        fields = (Array.isArray(fields) ? fields : [fields])
        fields.forEach((colName) => {
            this.columns.forEach((col) => {
                if (col.field == colName) {
                    let _updates = w2utils.clone(updates)
                    Object.keys(_updates).forEach((key) => {
                        // if it is a function
                        if (typeof _updates[key] == 'function') {
                            _updates[key] = _updates[key](col)
                        }
                        if (col[key] != _updates[key]) effected++
                    })
                    w2utils.extend(col, _updates)
                }
            })
        })
        if (effected > 0) {
            this.refresh() // need full refresh due to colgroups not reassigning properly
        }
        return effected
    }

    toggleColumn() {
        return this.updateColumn(Array.from(arguments), { hidden(col) { return !col.hidden } })
    }

    showColumn() {
        return this.updateColumn(Array.from(arguments), { hidden: false })
    }

    hideColumn() {
        return this.updateColumn(Array.from(arguments), { hidden: true })
    }

    addSearch(before, search) {
        let added = 0
        if (arguments.length == 1) {
            search = before
            before = this.searches.length
        } else {
            if (typeof before == 'string') before = this.getSearch(before, true)
            if (before == null) before = this.searches.length
        }
        if (!Array.isArray(search)) search = [search]
        for (let i = 0; i < search.length; i++) {
            this.searches.splice(before, 0, search[i])
            before++
            added++
        }
        this.searchClose()
        return added
    }

    removeSearch() {
        let removed = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.searches.length-1; r >= 0; r--) {
                if (this.searches[r].field == arguments[a]) { this.searches.splice(r, 1); removed++ }
            }
        }
        this.searchClose()
        return removed
    }

    getSearch(field, returnIndex) {
        // no arguments - return fields of all searches
        if (arguments.length === 0) {
            let ret = []
            for (let i = 0; i < this.searches.length; i++) ret.push(this.searches[i].field)
            return ret
        }
        // find search
        for (let i = 0; i < this.searches.length; i++) {
            if (this.searches[i].field == field) {
                if (returnIndex === true) return i; else return this.searches[i]
            }
        }
        return null
    }

    toggleSearch() {
        let effected = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.searches.length-1; r >= 0; r--) {
                if (this.searches[r].field == arguments[a]) {
                    this.searches[r].hidden = !this.searches[r].hidden
                    effected++
                }
            }
        }
        this.searchClose()
        return effected
    }

    showSearch() {
        let shown = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.searches.length-1; r >= 0; r--) {
                if (this.searches[r].field == arguments[a] && this.searches[r].hidden !== false) {
                    this.searches[r].hidden = false
                    shown++
                }
            }
        }
        this.searchClose()
        return shown
    }

    hideSearch() {
        let hidden = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.searches.length-1; r >= 0; r--) {
                if (this.searches[r].field == arguments[a] && this.searches[r].hidden !== true) {
                    this.searches[r].hidden = true
                    hidden++
                }
            }
        }
        this.searchClose()
        return hidden
    }

    getSearchData(field) {
        for (let i = 0; i < this.searchData.length; i++) {
            if (this.searchData[i].field == field) return this.searchData[i]
        }
        return null
    }

    localSort(silent, noResetRefresh) {
        let obj = this
        let url = this.url?.get ?? this.url
        if (url) {
            console.log('ERROR: grid.localSort can only be used on local data source, grid.url should be empty.')
            return 0 // time it took
        }
        if (Object.keys(this.sortData).length === 0) {
            // restore original sorting
            let os = this.last.originalSort
            if (os) {
                this.records.sort((a, b) => {
                    let aInd = os.indexOf(a.recid)
                    let bInd = os.indexOf(b.recid)
                    // order cann be equal, so, no need to return 0
                    return aInd > bInd ? 1 : -1
                })
            }
            return 0 // time it took
        }
        let time = Date.now()
        // process date fields
        this.selectionSave()
        this.prepareData()
        if (!noResetRefresh) {
            this.reset()
        }
        // process sortData
        for (let i = 0; i < this.sortData.length; i++) {
            let column = this.getColumn(this.sortData[i].field)
            if (!column) return // TODO: ability to sort columns when they are not part of colums array
            if (typeof column.render == 'string') {
                if (['date', 'age'].indexOf(column.render.split(':')[0]) != -1) {
                    this.sortData[i].field_ = column.field + '_'
                }
                if (['time'].indexOf(column.render.split(':')[0]) != -1) {
                    this.sortData[i].field_ = column.field + '_'
                }
            }
        }

        // prepare paths and process sort
        preparePaths()
        this.records.sort((a, b) => {
            return compareRecordPaths(a, b)
        })
        cleanupPaths()

        this.selectionRestore(noResetRefresh)
        time = Date.now() - time
        if (silent !== true && this.show.statusSort) {
            setTimeout(() => {
                this.status(w2utils.lang('Sorting took ${count} seconds', { count: time/1000 }))
            }, 10)
        }
        return time

        // grab paths before sorting for efficiency and because calling obj.get()
        // while sorting 'obj.records' is unsafe, at least on webkit
        function preparePaths() {
            for (let i = 0; i < obj.records.length; i++) {
                let rec = obj.records[i]
                if (rec.w2ui?.parent_recid != null) {
                    rec.w2ui._path = getRecordPath(rec)
                }
            }
        }

        // cleanup and release memory allocated by preparePaths()
        function cleanupPaths() {
            for (let i = 0; i < obj.records.length; i++) {
                let rec = obj.records[i]
                if (rec.w2ui?.parent_recid != null) {
                    rec.w2ui._path = null
                }
            }
        }

        // compare two paths, from root of tree to given records
        function compareRecordPaths(a, b) {
            if ((!a.w2ui || a.w2ui.parent_recid == null) && (!b.w2ui || b.w2ui.parent_recid == null)) {
                return compareRecords(a, b) // no tree, fast path
            }
            let pa = getRecordPath(a)
            let pb = getRecordPath(b)
            for (let i = 0; i < Math.min(pa.length, pb.length); i++) {
                let diff = compareRecords(pa[i], pb[i])
                if (diff !== 0) return diff // different subpath
            }
            if (pa.length > pb.length) return 1
            if (pa.length < pb.length) return -1
            console.log('ERROR: two paths should not be equal.')
            return 0
        }

        // return an array of all records from root to and including 'rec'
        function getRecordPath(rec) {
            if (!rec.w2ui || rec.w2ui.parent_recid == null) return [rec]
            if (rec.w2ui._path)
                return rec.w2ui._path
            // during actual sort, we should never reach this point
            let subrec = obj.get(rec.w2ui.parent_recid)
            if (!subrec) {
                console.log('ERROR: no parent record: ' + rec.w2ui.parent_recid)
                return [rec]
            }
            return (getRecordPath(subrec).concat(rec))
        }

        // compare two records according to sortData and finally recid
        function compareRecords(a, b) {
            if (a === b) return 0 // optimize, same object
            for (let i = 0; i < obj.sortData.length; i++) {
                let fld     = obj.sortData[i].field
                let sortFld = (obj.sortData[i].field_) ? obj.sortData[i].field_ : fld
                let aa      = a[sortFld]
                let bb      = b[sortFld]
                if (String(fld).indexOf('.') != -1) {
                    aa = obj.parseField(a, sortFld)
                    bb = obj.parseField(b, sortFld)
                }
                let col = obj.getColumn(fld)
                if (col && Object.keys(col.editable).length > 0) { // for drop editable fields and drop downs
                    if (w2utils.isPlainObject(aa) && aa.text) aa = aa.text
                    if (w2utils.isPlainObject(bb) && bb.text) bb = bb.text
                }
                let ret = compareCells(aa, bb, i, obj.sortData[i].direction, col.sortMode || 'default')
                if (ret !== 0) return ret
            }
            // break tie for similar records,
            // required to have consistent ordering for tree paths
            let ret = compareCells(a.recid, b.recid, -1, 'asc')
            return ret
        }

        // compare two values, aa and bb, producing consistent ordering
        function compareCells(aa, bb, i, direction, sortMode) {
            // if both objects are strictly equal, we're done
            if (aa === bb)
                return 0
            // all nulls, empty and undefined on bottom
            if ((aa == null || aa === '') && (bb != null && bb !== ''))
                return 1
            if ((aa != null && aa !== '') && (bb == null || bb === ''))
                return -1
            let dir = (direction.toLowerCase() === 'asc') ? 1 : -1
            // for different kind of objects, sort by object type
            if (typeof aa != typeof bb)
                return (typeof aa > typeof bb) ? dir : -dir
            // for different kind of classes, sort by classes
            if (aa.constructor.name != bb.constructor.name)
                return (aa.constructor.name > bb.constructor.name) ? dir : -dir
            // if we're dealing with non-null objects, call valueOf().
            // this mean that Date() or custom objects will compare properly.
            if (aa && typeof aa == 'object')
                aa = aa.valueOf()
            if (bb && typeof bb == 'object')
                bb = bb.valueOf()
            // if we're still dealing with non-null objects that have
            // a useful Object => String conversion, convert to string.
            let defaultToString = {}.toString
            if (aa && typeof aa == 'object' && aa.toString != defaultToString)
                aa = String(aa)
            if (bb && typeof bb == 'object' && bb.toString != defaultToString)
                bb = String(bb)
            // do case-insensitive string comparison
            if (typeof aa == 'string')
                aa = aa.toLowerCase().trim()
            if (typeof bb == 'string')
                bb = bb.toLowerCase().trim()

            switch (sortMode) {
                case 'natural':
                    sortMode = w2utils.naturalCompare
                    break
                case 'i18n':
                    sortMode = w2utils.i18nCompare
                    break
            }

            if (typeof sortMode == 'function') {
                return sortMode(aa,bb) * dir
            }

            // compare both objects
            if (aa > bb)
                return dir
            if (aa < bb)
                return -dir
            return 0
        }
    }

    localSearch(silent) {
        let obj = this
        let url = this.url?.get ?? this.url
        if (url) {
            console.log('ERROR: grid.localSearch can only be used on local data source, grid.url should be empty.')
            return
        }
        let time            = Date.now()
        let defaultToString = {}.toString
        let duplicateMap    = {}
        this.total          = this.records.length
        // mark all records as shown
        this.last.searchIds = []
        // prepare date/time fields
        this.prepareData()
        // hide records that did not match
        if (this.searchData.length > 0 && !url) {
            this.total = 0
            for (let i = 0; i < this.records.length; i++) {
                let rec = this.records[i]
                let match = searchRecord(rec)
                if (match) {
                    if (rec?.w2ui) addParent(rec.w2ui.parent_recid)
                    if (this.showExtraOnSearch > 0) {
                        let before = this.showExtraOnSearch
                        let after  = this.showExtraOnSearch
                        if (i < before) before = i
                        if (i + after > this.records.length) after = this.records.length - i
                        if (before > 0) {
                            for (let j = i - before; j < i; j++) {
                                if (this.last.searchIds.indexOf(j) < 0)
                                    this.last.searchIds.push(j)
                            }
                        }
                        if (this.last.searchIds.indexOf(i) < 0) this.last.searchIds.push(i)
                        if (after > 0) {
                            for (let j = (i + 1) ; j <= (i + after) ; j++) {
                                if (this.last.searchIds.indexOf(j) < 0) this.last.searchIds.push(j)
                            }
                        }
                    } else {
                        this.last.searchIds.push(i)
                    }
                }
            }
            this.total = this.last.searchIds.length
        }
        time = Date.now() - time
        if (silent !== true && this.show.statusSearch) {
            setTimeout(() => {
                this.status(w2utils.lang('Search took ${count} seconds', { count: time/1000 }))
            }, 10)
        }
        return time

        // check if a record (or one of its closed children) matches the search data
        function searchRecord(rec) {
            let fl = 0, val1, val2, val3, tmp
            let orEqual = false
            for (let j = 0; j < obj.searchData.length; j++) {
                let sdata = obj.searchData[j]
                let search = obj.getSearch(sdata.field)
                if (sdata == null) continue
                if (search == null) search = { field: sdata.field, type: sdata.type }
                let val1b = obj.parseField(rec, search.field)
                val1 = (val1b != null && (typeof val1b != 'object' || val1b.toString != defaultToString))
                    ? String(val1b).toLowerCase()
                    : '' // do not match a bogus string
                if (sdata.value != null) {
                    if (!Array.isArray(sdata.value)) {
                        val2 = String(sdata.value).toLowerCase()
                    } else {
                        val2 = sdata.value[0]
                        val3 = sdata.value[1]
                    }
                }
                switch (sdata.operator) {
                    case '=':
                    case 'is':
                        if (obj.parseField(rec, search.field) == sdata.value) fl++ // do not hide record
                        else if (search.type == 'date') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatDate(tmp, 'yyyy-mm-dd')
                            val2 = w2utils.formatDate(w2utils.isDate(val2, w2utils.settings.dateFormat, true), 'yyyy-mm-dd')
                            if (val1 == val2) fl++
                        }
                        else if (search.type == 'time') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatTime(tmp, 'hh24:mi')
                            val2 = w2utils.formatTime(val2, 'hh24:mi')
                            if (val1 == val2) fl++
                        }
                        else if (search.type == 'datetime') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatDateTime(tmp, 'yyyy-mm-dd|hh24:mm:ss')
                            val2 = w2utils.formatDateTime(w2utils.isDateTime(val2, w2utils.settings.datetimeFormat, true), 'yyyy-mm-dd|hh24:mm:ss')
                            if (val1 == val2) fl++
                        }
                        break
                    case 'between':
                        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                            if (parseFloat(obj.parseField(rec, search.field)) >= parseFloat(val2) && parseFloat(obj.parseField(rec, search.field)) <= parseFloat(val3)) fl++
                        }
                        else if (search.type == 'date') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.isDate(tmp, w2utils.settings.dateFormat, true)
                            val2 = w2utils.isDate(val2, w2utils.settings.dateFormat, true)
                            val3 = w2utils.isDate(val3, w2utils.settings.dateFormat, true)
                            if (val3 != null) val3 = new Date(val3.getTime() + 86400000) // 1 day
                            if (val1 >= val2 && val1 < val3) fl++
                        }
                        else if (search.type == 'time') {
                            val1 = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val2 = w2utils.isTime(val2, true)
                            val3 = w2utils.isTime(val3, true)
                            val2 = (new Date()).setHours(val2.hours, val2.minutes, val2.seconds ? val2.seconds : 0, 0)
                            val3 = (new Date()).setHours(val3.hours, val3.minutes, val3.seconds ? val3.seconds : 0, 0)
                            if (val1 >= val2 && val1 < val3) fl++
                        }
                        else if (search.type == 'datetime') {
                            val1 = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val2 = w2utils.isDateTime(val2, w2utils.settings.datetimeFormat, true)
                            val3 = w2utils.isDateTime(val3, w2utils.settings.datetimeFormat, true)
                            if (val3) val3 = new Date(val3.getTime() + 86400000) // 1 day
                            if (val1 >= val2 && val1 < val3) fl++
                        }
                        break
                    case '<=':
                        orEqual = true
                    case '<':
                    case 'less':
                        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                            val1 = parseFloat(obj.parseField(rec, search.field))
                            val2 = parseFloat(sdata.value)
                            if (val1 < val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'date') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.isDate(tmp, w2utils.settings.dateFormat, true)
                            val2 = w2utils.isDate(val2, w2utils.settings.dateFormat, true)
                            if (val1 < val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'time') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatTime(tmp, 'hh24:mi')
                            val2 = w2utils.formatTime(val2, 'hh24:mi')
                            if (val1 < val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'datetime') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatDateTime(tmp, 'yyyy-mm-dd|hh24:mm:ss')
                            val2 = w2utils.formatDateTime(w2utils.isDateTime(val2, w2utils.settings.datetimeFormat, true), 'yyyy-mm-dd|hh24:mm:ss')
                            if (val1.length == val2.length && (val1 < val2 || (orEqual && val1 === val2))) fl++
                        }
                        break
                    case '>=':
                        orEqual = true
                    case '>':
                    case 'more':
                        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                            val1 = parseFloat(obj.parseField(rec, search.field))
                            val2 = parseFloat(sdata.value)
                            if (val1 > val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'date') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.isDate(tmp, w2utils.settings.dateFormat, true)
                            val2 = w2utils.isDate(val2, w2utils.settings.dateFormat, true)
                            if (val1 > val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'time') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatTime(tmp, 'hh24:mi')
                            val2 = w2utils.formatTime(val2, 'hh24:mi')
                            if (val1 > val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'datetime') {
                            tmp  = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatDateTime(tmp, 'yyyy-mm-dd|hh24:mm:ss')
                            val2 = w2utils.formatDateTime(w2utils.isDateTime(val2, w2utils.settings.datetimeFormat, true), 'yyyy-mm-dd|hh24:mm:ss')
                            if (val1.length == val2.length && (val1 > val2 || (orEqual && val1 === val2))) fl++
                        }
                        break
                    case 'in':
                        tmp = sdata.value
                        if (sdata.svalue) tmp = sdata.svalue
                        if ((tmp.indexOf(w2utils.isFloat(val1b) ? parseFloat(val1b) : val1b) !== -1) || (tmp.indexOf(val1) !== -1 && val1 !== '')) fl++
                        break
                    case 'not in':
                        tmp = sdata.value
                        if (sdata.svalue) tmp = sdata.svalue
                        if (!((tmp.indexOf(w2utils.isFloat(val1b) ? parseFloat(val1b) : val1b) !== -1) || (tmp.indexOf(val1) !== -1 && val1 !== ''))) fl++
                        break
                    case 'begins':
                    case 'begins with': // need for back compatibility
                        if (val1.indexOf(val2) === 0) fl++ // do not hide record
                        break
                    case 'contains':
                        if (val1.indexOf(val2) >= 0) fl++ // do not hide record
                        break
                    case 'null':
                        if (obj.parseField(rec, search.field) == null) fl++ // do not hide record
                        break
                    case 'not null':
                        if (obj.parseField(rec, search.field) != null) fl++ // do not hide record
                        break
                    case 'ends':
                    case 'ends with': // need for back compatibility
                        let lastIndex = val1.lastIndexOf(val2)
                        if (lastIndex !== -1 && lastIndex == val1.length - val2.length) fl++ // do not hide record
                        break
                }
            }
            if ((obj.last.logic == 'OR' && fl !== 0) || (obj.last.logic == 'AND' && fl == obj.searchData.length)) {
                return true
            }
            if (rec.w2ui?.children && rec.w2ui?.expanded !== true) {
                // there are closed children, search them too.
                for (let r = 0; r < rec.w2ui.children.length; r++) {
                    let subRec = rec.w2ui.children[r]
                    if (searchRecord(subRec)) {
                        return true
                    }
                }
            }
            return false
        }

        // add parents nodes recursively
        function addParent(recid) {
            let i = obj.get(recid, true)
            if (i == null || recid == null || duplicateMap[recid] || obj.last.searchIds.includes(i)) {
                return
            }
            duplicateMap[recid] = true
            let rec = obj.records[i]
            if (rec?.w2ui) {
                addParent(rec.w2ui.parent_recid)
            }
            obj.last.searchIds.push(i)
        }
    }

    getRangeData(range, extra) {
        let rec1 = this.get(range[0].recid, true)
        let rec2 = this.get(range[1].recid, true)
        let col1 = range[0].column
        let col2 = range[1].column

        let res = []
        if (col1 == col2) { // one row
            for (let r = rec1; r <= rec2; r++) {
                let record = this.records[r]
                let dt     = record[this.columns[col1].field] || null
                if (extra !== true) {
                    res.push(dt)
                } else {
                    res.push({ data: dt, column: col1, index: r, record: record })
                }
            }
        } else if (rec1 == rec2) { // one line
            let record = this.records[rec1]
            for (let i = col1; i <= col2; i++) {
                let dt = record[this.columns[i].field] || null
                if (extra !== true) {
                    res.push(dt)
                } else {
                    res.push({ data: dt, column: i, index: rec1, record: record })
                }
            }
        } else {
            for (let r = rec1; r <= rec2; r++) {
                let record = this.records[r]
                res.push([])
                for (let i = col1; i <= col2; i++) {
                    let dt = record[this.columns[i].field]
                    if (extra !== true) {
                        res[res.length-1].push(dt)
                    } else {
                        res[res.length-1].push({ data: dt, column: i, index: r, record: record })
                    }
                }
            }
        }
        return res
    }

    addRange(ranges) {
        let added = 0, first, last
        if (this.selectType == 'row') return added
        if (!Array.isArray(ranges)) ranges = [ranges]
        // if it is selection
        for (let i = 0; i < ranges.length; i++) {
            if (typeof ranges[i] != 'object') ranges[i] = { name: 'selection' }
            if (ranges[i].name == 'selection') {
                if (this.show.selectionBorder === false) continue
                let sel = this.getSelection()
                if (sel.length === 0) {
                    this.removeRange('selection')
                    continue
                } else {
                    first = sel[0]
                    last  = sel[sel.length-1]
                }
            } else { // other range
                first = ranges[i].range[0]
                last  = ranges[i].range[1]
            }
            if (first) {
                let rg = {
                    name: ranges[i].name,
                    range: [{ recid: first.recid, column: first.column }, { recid: last.recid, column: last.column }],
                    style: ranges[i].style || '',
                    class: ranges[i].class
                }
                // add range
                let ind = false
                for (let j = 0; j < this.ranges.length; j++) if (this.ranges[j].name == ranges[i].name) { ind = j; break }
                if (ind !== false) {
                    this.ranges[ind] = rg
                } else {
                    this.ranges.push(rg)
                }
                added++
            }
        }
        this.refreshRanges()
        return added
    }

    removeRange() {
        let removed = 0
        for (let a = 0; a < arguments.length; a++) {
            let name = arguments[a]
            query(this.box).find('#grid_'+ this.name +'_'+ name).remove()
            query(this.box).find('#grid_'+ this.name +'_f'+ name).remove()
            for (let r = this.ranges.length-1; r >= 0; r--) {
                if (this.ranges[r].name == name) {
                    this.ranges.splice(r, 1)
                    removed++
                }
            }
        }
        return removed
    }

    refreshRanges() {
        if (this.ranges.length === 0) return
        let self = this
        let range
        let time = Date.now()
        let rec1 = query(this.box).find(`#grid_${this.name}_frecords`)
        let rec2 = query(this.box).find(`#grid_${this.name}_records`)
        for (let i = 0; i < this.ranges.length; i++) {
            let rg    = this.ranges[i]
            let first = rg.range[0]
            let last  = rg.range[1]
            if (first.index == null) first.index = this.get(first.recid, true)
            if (last.index == null) last.index = this.get(last.recid, true)
            let td1  = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(first.recid) + ' td[col="'+ first.column +'"]')
            let td2  = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(last.recid) + ' td[col="'+ last.column +'"]')
            let td1f = query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(first.recid) + ' td[col="'+ first.column +'"]')
            let td2f = query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(last.recid) + ' td[col="'+ last.column +'"]')
            let _lastColumn = last.column
            // adjustment due to column virtual scroll
            if (first.column < this.last.vscroll.colIndStart && last.column > this.last.vscroll.colIndStart) {
                td1 = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(first.recid) + ' td[col="start"]')
            }
            if (first.column < this.last.vscroll.colIndEnd && last.column > this.last.vscroll.colIndEnd) {
                td2 = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(last.recid) + ' td[col="end"]')
                _lastColumn = '"end"'
            }
            // if virtual scrolling kicked in
            let index_top     = parseInt(query(this.box).find('#grid_'+ this.name +'_rec_top').next().attr('index'))
            let index_bottom  = parseInt(query(this.box).find('#grid_'+ this.name +'_rec_bottom').prev().attr('index'))
            let index_ftop    = parseInt(query(this.box).find('#grid_'+ this.name +'_frec_top').next().attr('index'))
            let index_fbottom = parseInt(query(this.box).find('#grid_'+ this.name +'_frec_bottom').prev().attr('index'))
            if (td1.length === 0 && first.index < index_top && last.index > index_top) {
                td1 = query(this.box).find('#grid_'+ this.name +'_rec_top').next().find('td[col="'+ first.column +'"]')
            }
            if (td2.length === 0 && last.index > index_bottom && first.index < index_bottom) {
                td2 = query(this.box).find('#grid_'+ this.name +'_rec_bottom').prev().find('td[col="'+ _lastColumn +'"]')
            }
            if (td1f.length === 0 && first.index < index_ftop && last.index > index_ftop) { // frozen
                td1f = query(this.box).find('#grid_'+ this.name +'_frec_top').next().find('td[col="'+ first.column +'"]')
            }
            if (td2f.length === 0 && last.index > index_fbottom && first.index < index_fbottom) { // frozen
                td2f = query(this.box).find('#grid_'+ this.name +'_frec_bottom').prev().find('td[col="'+ last.column +'"]')
            }

            // do not show selection cell if it is editable
            let edit = query(this.box).find('#grid_'+ this.name + '_editable')
            let tmp  = edit.find('.w2ui-input')
            let tmp_ind = tmp.attr('index')
            let tmp1 = this.records[tmp_ind]?.recid
            let tmp2 = tmp.attr('column')
            if (rg.name == 'selection' && rg.range[0].recid == tmp1 && rg.range[0].column == tmp2) continue

            // frozen regular columns range
            range = query(this.box).find('#grid_'+ this.name +'_f'+ rg.name)
            if (td1f.length > 0 || td2f.length > 0) {
                if (range.length === 0) {
                    rec1.append('<div id="grid_'+ this.name +'_f' + rg.name +'" class="w2ui-selection" style="'+ rg.style +'">'+
                                    (rg.name == 'selection' && this.show.selectionResizer ? '<div id="grid_'+ this.name +'_resizer" class="w2ui-selection-resizer"></div>' : '')+
                                '</div>')
                    range = query(this.box).find('#grid_'+ this.name +'_f'+ rg.name)
                } else {
                    range.attr('style', rg.style)
                    range.find('.w2ui-selection-resizer').show()
                }
                if (td2f.length === 0) {
                    td2f = query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(last.recid) +' td:last-child')
                    if (td2f.length === 0) td2f = query(this.box).find('#grid_'+ this.name +'_frec_bottom td:first-child')
                    range.css('border-right', '0px')
                    range.find('.w2ui-selection-resizer').hide()
                }
                if (first.recid != null && last.recid != null && td1f.length > 0 && td2f.length > 0) {
                    let style = getComputedStyle(td2f[0])
                    let top1  = (td1f.prop('offsetTop') - td1f.prop('scrollTop'))
                    let left1 = (td1f.prop('offsetLeft') + td1f.prop('scrollLeft'))
                    let top2  = (td2f.prop('offsetTop') - td2f.prop('scrollTop'))
                    let left2 = (td2f.prop('offsetLeft') + td2f.prop('scrollLeft'))
                    range.show().css({
                        top     : (top1 > 0 ? top1 : 0) + 'px',
                        left    : (left1 > 0 ? left1 : 0) + 'px',
                        width   : (left2 - left1 + parseFloat(style.width) - 1) + 'px',
                        height  : (top2 - top1 + parseFloat(style.height) - 1) + 'px'
                    })
                } else {
                    range.hide()
                }
            } else {
                range.hide()
            }
            // regular columns range
            range = query(this.box).find('#grid_'+ this.name +'_'+ rg.name)
            if (td1.length > 0 || td2.length > 0) {
                if (range.length === 0) {
                    rec2.append(`
                        <div id="grid_${this.name}_${rg.name}" class="w2ui-selection ${rg.class ?? ''}" style="${rg.style}">
                            ${rg.name == 'selection' && this.show.selectionResizer
                                ? `<div id="grid_${this.name}_resizer" class="w2ui-selection-resizer"></div>`
                                : ''
                            }
                        </div>
                    `)
                    range = query(this.box).find('#grid_'+ this.name +'_'+ rg.name)
                } else {
                    range.attr('style', rg.style)
                }
                if (td1.length === 0) {
                    td1 = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(first.recid) +' td:first-child')
                    if (td1.length === 0) td1 = query(this.box).find('#grid_'+ this.name +'_rec_top td:first-child')
                }
                if (td2f.length !== 0) {
                    range.css('border-left', '0px')
                }
                if (first.recid != null && last.recid != null && td1.length > 0 && td2.length > 0) {
                    let style = getComputedStyle(td2[0])
                    let top1  = (td1.prop('offsetTop') - td1.prop('scrollTop'))
                    let left1 = (td1.prop('offsetLeft') + td1.prop('scrollLeft'))
                    let top2  = (td2.prop('offsetTop') - td2.prop('scrollTop'))
                    let left2 = (td2.prop('offsetLeft') + td2.prop('scrollLeft'))
                    range.show().css({
                        top     : (top1 > 0 ? top1 : 0) + 'px',
                        left    : (left1 > 0 ? left1 : 0) + 'px',
                        width   : (left2 - left1 + parseFloat(style.width) - 1) + 'px',
                        height  : (top2 - top1 + parseFloat(style.height) - 1) + 'px'
                    })
                } else {
                    range.hide()
                }
            } else {
                range.hide()
            }
        }

        // add resizer events
        query(this.box).find('.w2ui-selection-resizer')
            .off('.resizer')
            .on('mousedown.resizer', mouseStart)
            .on('dblclick.resizer', (event) => {
                let edata = this.trigger('resizerDblClick', { target: this.name, originalEvent: event })
                if (edata.isCancelled === true) return
                edata.finish()
            })
        // this variables are needed for selection expantion
        let edata
        let detail = { target: this.name, originalRange: null, newRange: null }
        let letters = 'abcdefghijklmnopqrstuvwxyz'

        return Date.now() - time

        function mouseStart(event) {
            let sel = self.getSelection()
            let first = sel[0]
            let last = sel[sel.length-1]
            self.last.move = {
                type   : 'expand',
                x      : event.screenX,
                y      : event.screenY,
                divX   : 0,
                divY   : 0,
                index  : first.index,
                recid  : first.recid,
                column : first.column,
                name   : letters[first.column] + (first.index + 1) + ':' + letters[last.column] + (last.index + 1),
                originalRange : [w2utils.clone(first), w2utils.clone(last) ],
                newRange      : [w2utils.clone(first), w2utils.clone(last) ]
            }
            detail.originalName  = self.last.move.name
            detail.originalRange = self.last.move.originalRange
            query('body')
                .off('.w2ui-' + self.name)
                .on('mousemove.w2ui-' + self.name, mouseMove)
                .on('mouseup.w2ui-' + self.name, mouseStop)
            // do not blur grid
            event.preventDefault()
        }

        function mouseMove(event) {
            let mv = self.last.move
            if (!mv || mv.type != 'expand') return
            mv.divX = (event.screenX - mv.x)
            mv.divY = (event.screenY - mv.y)
            // find new cell
            let recid, index, column
            let tmp = event.target
            if (tmp.tagName.toUpperCase() != 'TD') tmp = query(tmp).closest('td')[0]
            if (query(tmp).attr('col') != null) column = parseInt(query(tmp).attr('col'))
            if (column == null) {
                return
            }
            tmp = query(tmp).closest('tr')[0]
            index = parseInt(query(tmp).attr('index'))
            recid = self.records[index]?.recid
            // new range
            if (mv.newRange[1].recid == recid && mv.newRange[1].column == column) {
                // if range did not change
                return
            }
            let prevNewRange = w2utils.clone(mv.newRange)
            mv.newRange = [{ recid: mv.recid, index: mv.index, column: mv.column }, { recid, index, column }]
            // remember update ranges
            detail.newName = letters[mv.column] + (mv.index + 1) + ':' + letters[column] + (index + 1)
            detail.newRange = w2utils.clone(mv.newRange)
            // event before
            edata = self.trigger('selectionExtend', detail)
            if (edata.isCancelled === true) {
                mv.newRange = prevNewRange
                detail.newRange = prevNewRange
                return
            } else {
                // default behavior
                self.addRange({
                    name: 'selection-expand',
                    range: mv.newRange,
                    class: 'w2ui-selection-expand'
                })
            }
        }

        function mouseStop(event) {
            // default behavior
            self.removeRange('selection-expand')
            query('body').off('.w2ui-' + self.name)
            // event after
            if (self.last.move?.type == 'expand' && edata.finish) {
                edata.finish()
            }
            delete self.last.move
        }
    }

    select() {
        if (arguments.length === 0) return 0
        let selected = 0
        let sel = this.last.selection
        if (!this.multiSelect) this.selectNone(true)
        // if too many arguments > 150k, then it errors off
        let args = Array.from(arguments)
        if (Array.isArray(args[0])) args = args[0]
        // event before
        let tmp = { target: this.name }
        if (args.length == 1) {
            tmp.multiple = false
            if (w2utils.isPlainObject(args[0])) {
                tmp.clicked = {
                    recid: args[0].recid,
                    column: args[0].column
                }
            } else {
                tmp.recid = args[0]
            }
        } else {
            tmp.multiple = true
            tmp.clicked = { recids:  args }
        }
        if (this.compareSelection(args).select.length == 0) {
            // if all needed records are already selected
            return
        }
        let edata = this.trigger('select', tmp)
        if (edata.isCancelled === true) return 0

        // default action
        if (this.selectType == 'row') {
            for (let a = 0; a < args.length; a++) {
                let recid = typeof args[a] == 'object' ? args[a].recid : args[a]
                let index = this.get(recid, true)
                if (index == null) continue
                let recEl1 = null
                let recEl2 = null
                if (this.searchData.length !== 0 || (index + 1 >= this.last.vscroll.recIndStart && index + 1 <= this.last.vscroll.recIndEnd)) {
                    recEl1 = query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
                    recEl2 = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
                }
                if (this.selectType == 'row') {
                    if (sel.indexes.indexOf(index) != -1) continue
                    sel.indexes.push(index)
                    if (recEl1 && recEl2) {
                        recEl1.addClass('w2ui-selected').find('.w2ui-col-number').addClass('w2ui-row-selected')
                        recEl2.addClass('w2ui-selected').find('.w2ui-col-number').addClass('w2ui-row-selected')
                        recEl1.find('.w2ui-grid-select-check').prop('checked', true)
                    }
                    selected++
                }
            }
        } else {
            // normalize for performance
            let new_sel = {}
            for (let a = 0; a < args.length; a++) {
                let recid      = typeof args[a] == 'object' ? args[a].recid : args[a]
                let column     = typeof args[a] == 'object' ? args[a].column : null
                new_sel[recid] = new_sel[recid] || []
                if (Array.isArray(column)) {
                    new_sel[recid] = column
                } else if (w2utils.isInt(column)) {
                    new_sel[recid].push(column)
                } else {
                    for (let i = 0; i < this.columns.length; i++) { if (this.columns[i].hidden) continue; new_sel[recid].push(parseInt(i)) }
                }
            }
            // add all
            let col_sel = []
            for (let recid in new_sel) {
                let index = this.get(recid, true)
                if (index == null) continue
                let recEl1 = null
                let recEl2 = null
                if (index + 1 >= this.last.vscroll.recIndStart && index + 1 <= this.last.vscroll.recIndEnd) {
                    recEl1 = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
                    recEl2 = query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
                }
                let s = sel.columns[index] || []
                // default action
                if (sel.indexes.indexOf(index) == -1) {
                    sel.indexes.push(index)
                }
                // only only those that are new
                for (let t = 0; t < new_sel[recid].length; t++) {
                    if (s.indexOf(new_sel[recid][t]) == -1) s.push(new_sel[recid][t])
                }
                s.sort((a, b) => { return a-b }) // sort function must be for numerical sort
                for (let t = 0; t < new_sel[recid].length; t++) {
                    let col = new_sel[recid][t]
                    if (col_sel.indexOf(col) == -1) col_sel.push(col)
                    if (recEl1) {
                        recEl1.find('#grid_'+ this.name +'_data_'+ index +'_'+ col).addClass('w2ui-selected')
                        recEl1.find('.w2ui-col-number').addClass('w2ui-row-selected')
                        recEl1.find('.w2ui-grid-select-check').prop('checked', true)
                    }
                    if (recEl2) {
                        recEl2.find('#grid_'+ this.name +'_data_'+ index +'_'+ col).addClass('w2ui-selected')
                        recEl2.find('.w2ui-col-number').addClass('w2ui-row-selected')
                        recEl2.find('.w2ui-grid-select-check').prop('checked', true)
                    }
                    selected++
                }
                // save back to selection object
                sel.columns[index] = s
            }
            // select columns (need here for speed)
            for (let c = 0; c < col_sel.length; c++) {
                query(this.box).find('#grid_'+ this.name +'_column_'+ col_sel[c] +' .w2ui-col-header').addClass('w2ui-col-selected')
            }
        }
        // need to sort new selection for speed
        sel.indexes.sort((a, b) => { return a-b })
        // all selected?
        let areAllSelected = (this.records.length > 0 && sel.indexes.length == this.records.length),
            areAllSearchedSelected = (sel.indexes.length > 0 && this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)
        if (areAllSelected || areAllSearchedSelected) {
            query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', true)
        } else {
            query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', false)
        }
        this.status()
        this.addRange('selection')
        this.updateToolbar(sel, areAllSelected)
        // event after
        edata.finish()
        return selected
    }

    unselect() {
        let unselected = 0
        let sel = this.last.selection
        // if too many arguments > 150k, then it errors off
        let args = Array.from(arguments)
        if (Array.isArray(args[0])) args = args[0]
        // event before
        let tmp = { target: this.name }
        if (args.length == 1) {
            tmp.multiple = false
            if (w2utils.isPlainObject(args[0])) {
                tmp.clicked = {
                    recid: args[0].recid,
                    column: args[0].column
                }
            } else {
                tmp.clicked = { recid: args[0] }
            }
        } else {
            tmp.multiple = true
            tmp.recids   = args
        }
        if (this.compareSelection(args).unselect.length == 0) {
            // if all needed records are already unselected
            return
        }
        let edata = this.trigger('select', tmp)
        if (edata.isCancelled === true) return 0

        for (let a = 0; a < args.length; a++) {
            let recid  = typeof args[a] == 'object' ? args[a].recid : args[a]
            let record = this.get(recid)
            if (record == null) continue
            let index  = this.get(record.recid, true)
            let recEl1 = query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
            let recEl2 = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
            if (this.selectType == 'row') {
                if (sel.indexes.indexOf(index) == -1) continue
                // default action
                sel.indexes.splice(sel.indexes.indexOf(index), 1)
                recEl1.removeClass('w2ui-selected w2ui-inactive').find('.w2ui-col-number').removeClass('w2ui-row-selected')
                recEl2.removeClass('w2ui-selected w2ui-inactive').find('.w2ui-col-number').removeClass('w2ui-row-selected')
                if (recEl1.length != 0) {
                    recEl1[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + recEl1.attr('custom_style')
                    recEl2[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + recEl2.attr('custom_style')
                }
                recEl1.find('.w2ui-grid-select-check').prop('checked', false)
                unselected++
            } else {
                let col = args[a].column
                if (!w2utils.isInt(col)) { // unselect all columns
                    let cols = []
                    for (let i = 0; i < this.columns.length; i++) { if (this.columns[i].hidden) continue; cols.push({ recid: recid, column: i }) }
                    return this.unselect(cols)
                }
                let s = sel.columns[index]
                if (!Array.isArray(s) || s.indexOf(col) == -1) continue
                // default action
                s.splice(s.indexOf(col), 1)
                query(this.box).find(`#grid_${this.name}_rec_${w2utils.escapeId(recid)} > td[col="${col}"]`).removeClass('w2ui-selected w2ui-inactive')
                query(this.box).find(`#grid_${this.name}_frec_${w2utils.escapeId(recid)} > td[col="${col}"]`).removeClass('w2ui-selected w2ui-inactive')
                // check if any row/column still selected
                let isColSelected = false
                let isRowSelected = false
                let tmp           = this.getSelection()
                for (let i = 0; i < tmp.length; i++) {
                    if (tmp[i].column == col) isColSelected = true
                    if (tmp[i].recid == recid) isRowSelected = true
                }
                if (!isColSelected) {
                    query(this.box).find(`.w2ui-grid-columns td[col="${col}"] .w2ui-col-header, .w2ui-grid-fcolumns td[col="${col}"] .w2ui-col-header`).removeClass('w2ui-col-selected')
                }
                if (!isRowSelected) {
                    query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid)).find('.w2ui-col-number').removeClass('w2ui-row-selected')
                }
                unselected++
                if (s.length === 0) {
                    delete sel.columns[index]
                    sel.indexes.splice(sel.indexes.indexOf(index), 1)
                    recEl1.find('.w2ui-grid-select-check').prop('checked', false)
                }
            }
        }
        // all selected?
        let areAllSelected = (this.records.length > 0 && sel.indexes.length == this.records.length),
            areAllSearchedSelected = (sel.indexes.length > 0 && this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)
        if (areAllSelected || areAllSearchedSelected) {
            query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', true)
        } else {
            query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', false)
        }
        // show number of selected
        this.status()
        this.addRange('selection')
        this.updateToolbar(sel, areAllSelected)
        // event after
        edata.finish()
        return unselected
    }

    compareSelection(newSel) {
        let sel = this.getSelection()
        let select = []
        let unselect = []
        if (this.selectType == 'row') {
            // normalize
            newSel.forEach((sel, ind) => {
                if (typeof sel == 'object') newSel[ind] = sel.recid
            })
            // add items
            for (let i = 0; i < newSel.length; i++) {
                if (!sel.includes(newSel[i])) {
                    select.push(newSel[i])
                }
            }
            // remove items
            for (let i = 0; i < newSel.length; i++) {
                if (sel.includes(newSel[i])) {
                    unselect.push(newSel[i])
                }
            }
        } else {
            // add more items
            for (let ns = 0; ns < newSel.length; ns++) {
                let flag = false
                for (let s = 0; s < sel.length; s++) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true
                if (!flag) select.push({ recid: newSel[ns].recid, column: newSel[ns].column })
            }
            // remove items
            for (let s = 0; s < sel.length; s++) {
                let flag = false
                for (let ns = 0; ns < newSel.length; ns++) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true
                if (!flag) unselect.push({ recid: sel[s].recid, column: sel[s].column })
            }
        }
        return { select, unselect }
    }

    selectAll() {
        let time = Date.now()
        if (this.multiSelect === false) return
        // default action
        let url = this.url?.get ?? this.url
        let sel  = w2utils.clone(this.last.selection)
        let cols = []
        for (let i = 0; i < this.columns.length; i++) cols.push(i)
        // if local data source and searched
        sel.indexes = []
        if (!url && this.searchData.length !== 0) {
            // local search applied
            for (let i = 0; i < this.last.searchIds.length; i++) {
                sel.indexes.push(this.last.searchIds[i])
                if (this.selectType != 'row') sel.columns[this.last.searchIds[i]] = cols.slice() // .slice makes copy of the array
            }
        } else {
            let buffered = this.records.length
            if (this.searchData.length != 0 && !url) buffered = this.last.searchIds.length
            for (let i = 0; i < buffered; i++) {
                sel.indexes.push(i)
                if (this.selectType != 'row') sel.columns[i] = cols.slice() // .slice makes copy of the array
            }
        }
        // event before
        let edata = this.trigger('select', { target: this.name, multiple: true, all: true, clicked: sel })
        if (edata.isCancelled === true) return

        this.last.selection = sel
        // add selected class
        if (this.selectType == 'row') {
            query(this.box).find('.w2ui-grid-records tr:not(.w2ui-empty-record)')
                .addClass('w2ui-selected').find('.w2ui-col-number').addClass('w2ui-row-selected')
            query(this.box).find('.w2ui-grid-frecords tr:not(.w2ui-empty-record)')
                .addClass('w2ui-selected').find('.w2ui-col-number').addClass('w2ui-row-selected')
            query(this.box).find('input.w2ui-grid-select-check').prop('checked', true)
        } else {
            query(this.box).find('.w2ui-grid-columns td .w2ui-col-header, .w2ui-grid-fcolumns td .w2ui-col-header').addClass('w2ui-col-selected')
            query(this.box).find('.w2ui-grid-records tr .w2ui-col-number').addClass('w2ui-row-selected')
            query(this.box).find('.w2ui-grid-records tr:not(.w2ui-empty-record)')
                .find('.w2ui-grid-data:not(.w2ui-col-select)').addClass('w2ui-selected')
            query(this.box).find('.w2ui-grid-frecords tr .w2ui-col-number').addClass('w2ui-row-selected')
            query(this.box).find('.w2ui-grid-frecords tr:not(.w2ui-empty-record)')
                .find('.w2ui-grid-data:not(.w2ui-col-select)').addClass('w2ui-selected')
            query(this.box).find('input.w2ui-grid-select-check').prop('checked', true)
        }
        // enable/disable toolbar buttons
        sel = this.getSelection(true)
        this.addRange('selection')
        query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', true)
        this.status()
        this.updateToolbar({ indexes: sel }, true)
        // event after
        edata.finish()
        return Date.now() - time
    }

    selectNone(skipEvent) {
        let time = Date.now()
        // event before
        let edata
        if (!skipEvent) {
            edata = this.trigger('select', { target: this.name, clicked: [] })
            if (edata.isCancelled === true) return
        }
        // default action
        let sel = this.last.selection
        // remove selected class
        if (this.selectType == 'row') {
            query(this.box).find('.w2ui-grid-records tr.w2ui-selected').removeClass('w2ui-selected w2ui-inactive')
                .find('.w2ui-col-number').removeClass('w2ui-row-selected')
            query(this.box).find('.w2ui-grid-frecords tr.w2ui-selected').removeClass('w2ui-selected w2ui-inactive')
                .find('.w2ui-col-number').removeClass('w2ui-row-selected')
            query(this.box).find('input.w2ui-grid-select-check').prop('checked', false)
        } else {
            query(this.box).find('.w2ui-grid-columns td .w2ui-col-header, .w2ui-grid-fcolumns td .w2ui-col-header').removeClass('w2ui-col-selected')
            query(this.box).find('.w2ui-grid-records tr .w2ui-col-number').removeClass('w2ui-row-selected')
            query(this.box).find('.w2ui-grid-frecords tr .w2ui-col-number').removeClass('w2ui-row-selected')
            query(this.box).find('.w2ui-grid-data.w2ui-selected').removeClass('w2ui-selected w2ui-inactive')
            query(this.box).find('input.w2ui-grid-select-check').prop('checked', false)
        }
        sel.indexes = []
        sel.columns = {}
        this.removeRange('selection')
        query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', false)
        this.status()
        this.updateToolbar(sel, false)
        // event after
        if (!skipEvent) {
            edata.finish()
        }
        return Date.now() - time
    }

    updateToolbar(sel) {
        let obj = this
        let cnt = sel && sel.indexes ? sel.indexes.length : 0
        // if there is no toolbar
        if (!this.toolbar.render) {
            return
        }
        this.toolbar.items.forEach((item) => {
            _checkItem(item, '')
            if (Array.isArray(item.items)) {
                item.items.forEach((it) => {
                    _checkItem(it, item.id + ':')
                })
            }
        })
        // enable/disable toolbar search button
        if (this.show.toolbarSave) {
            if (this.getChanges().length > 0) {
                this.toolbar.enable('w2ui-save')
            } else {
                this.toolbar.disable('w2ui-save')
            }
        }

        function _checkItem(item, prefix) {
            if (item.batch != null) {
                let enabled = false
                if (item.batch === true) {
                    if (cnt > 0) enabled = true
                } else if (typeof item.batch == 'number') {
                    if (cnt === item.batch) enabled = true
                } else if (typeof item.batch == 'function') {
                    enabled = item.batch({ cnt, sel })
                }
                if (enabled) {
                    obj.toolbar.enable(prefix + item.id)
                } else {
                    obj.toolbar.disable(prefix + item.id)
                }
            }
        }
    }

    getSelection(returnIndex) {
        let ret = []
        let sel = this.last.selection
        if (this.selectType == 'row') {
            for (let i = 0; i < sel.indexes.length; i++) {
                if (!this.records[sel.indexes[i]]) continue
                if (returnIndex === true) ret.push(sel.indexes[i]); else ret.push(this.records[sel.indexes[i]].recid)
            }
            return ret
        } else {
            for (let i = 0; i < sel.indexes.length; i++) {
                let cols = sel.columns[sel.indexes[i]]
                if (!this.records[sel.indexes[i]]) continue
                for (let j = 0; j < cols.length; j++) {
                    ret.push({ recid: this.records[sel.indexes[i]].recid, index: parseInt(sel.indexes[i]), column: cols[j] })
                }
            }
            return ret
        }
    }

    search(field, value) {
        let url = this.url?.get ?? this.url
        let searchData = []
        let last_multi = this.last.multi
        let last_logic = this.last.logic
        let last_field = this.last.field
        let last_search = this.last.search
        let hasHiddenSearches = false
        let overlay = query(`#w2overlay-${this.name}-search-overlay`)
        // if emty sting, same as no search
        if (value === '') value = null
        // add hidden searches
        for (let i = 0; i < this.searches.length; i++) {
            if (!this.searches[i].hidden || this.searches[i].value == null) continue
            searchData.push({
                field    : this.searches[i].field,
                operator : this.searches[i].operator || 'is',
                type     : this.searches[i].type,
                value    : this.searches[i].value || ''
            })
            hasHiddenSearches = true
        }
        if (arguments.length === 0 && overlay.length === 0) {
            if (this.multiSearch) {
                field = this.searchData
                value = this.last.logic
            } else {
                field = this.last.field
                value = this.last.search
            }
        }
        // 1: search() - advanced search (reads from popup)
        if (arguments.length === 0 && overlay.length !== 0) {
            this.focus() // otherwise search drop down covers searches
            last_logic = overlay.find(`#grid_${this.name}_logic`).val()
            last_search = ''
            // advanced search
            for (let i = 0; i < this.searches.length; i++) {
                let search   = this.searches[i]
                let operator = overlay.find('#grid_'+ this.name + '_operator_'+ i).val()
                let field1   = overlay.find('#grid_'+ this.name + '_field_'+ i)
                let field2   = overlay.find('#grid_'+ this.name + '_field2_'+ i)
                let value1   = field1.val()
                let value2   = field2.val()
                let svalue   = null
                let text     = null

                if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                    let fld1 = field1[0]._w2field
                    let fld2 = field2[0]._w2field
                    if (fld1) value1 = fld1.clean(value1)
                    if (fld2) value2 = fld2.clean(value2)
                }
                if (['list', 'enum'].indexOf(search.type) != -1 || ['in', 'not in'].indexOf(operator) != -1) {
                    value1 = field1[0]._w2field.selected || {}
                    if (Array.isArray(value1)) {
                        svalue = []
                        for (let j = 0; j < value1.length; j++) {
                            svalue.push(w2utils.isFloat(value1[j].id) ? parseFloat(value1[j].id) : String(value1[j].id).toLowerCase())
                            delete value1[j].hidden
                        }
                        if (Object.keys(value1).length === 0) value1 = ''
                    } else {
                        text   = value1.text || ''
                        value1 = value1.id || ''
                    }
                }
                if ((value1 !== '' && value1 != null) || (value2 != null && value2 !== '')) {
                    let tmp = {
                        field    : search.field,
                        type     : search.type,
                        operator : operator
                    }
                    if (operator == 'between') {
                        w2utils.extend(tmp, { value: [value1, value2] })
                    } else if (operator == 'in' && typeof value1 == 'string') {
                        w2utils.extend(tmp, { value: value1.split(',') })
                    } else if (operator == 'not in' && typeof value1 == 'string') {
                        w2utils.extend(tmp, { value: value1.split(',') })
                    } else {
                        w2utils.extend(tmp, { value: value1 })
                    }
                    if (svalue) w2utils.extend(tmp, { svalue: svalue })
                    if (text) w2utils.extend(tmp, { text: text })

                    // convert date to unix time
                    try {
                        if (search.type == 'date' && operator == 'between') {
                            tmp.value[0] = value1 // w2utils.isDate(value1, w2utils.settings.dateFormat, true).getTime();
                            tmp.value[1] = value2 // w2utils.isDate(value2, w2utils.settings.dateFormat, true).getTime();
                        }
                        if (search.type == 'date' && operator == 'is') {
                            tmp.value = value1 // w2utils.isDate(value1, w2utils.settings.dateFormat, true).getTime();
                        }
                    } catch (e) {

                    }
                    searchData.push(tmp)
                    last_multi = true // if only hidden searches, then do not set
                }
            }
        }
        // 2: search(field, value) - regular search
        if (typeof field == 'string') {
            // if only one argument - search all
            if (arguments.length == 1) {
                value = field
                field = 'all'
            }
            last_field  = field
            last_search = value
            last_multi  = false
            last_logic  = (hasHiddenSearches ? 'AND' : 'OR')
            // loop through all searches and see if it applies
            if (value != null) {
                if (field.toLowerCase() == 'all') {
                    // if there are search fields loop thru them
                    if (this.searches.length > 0) {
                        for (let i = 0; i < this.searches.length; i++) {
                            let search = this.searches[i]
                            if (search.type == 'text' || (search.type == 'alphanumeric' && w2utils.isAlphaNumeric(value))
                                    || (search.type == 'int' && w2utils.isInt(value)) || (search.type == 'float' && w2utils.isFloat(value))
                                    || (search.type == 'percent' && w2utils.isFloat(value)) || ((search.type == 'hex' || search.type == 'color') && w2utils.isHex(value))
                                    || (search.type == 'currency' && w2utils.isMoney(value)) || (search.type == 'money' && w2utils.isMoney(value))
                                    || (search.type == 'date' && w2utils.isDate(value)) || (search.type == 'time' && w2utils.isTime(value))
                                    || (search.type == 'datetime' && w2utils.isDateTime(value)) || (search.type == 'datetime' && w2utils.isDate(value))
                                    || (search.type == 'enum' && w2utils.isAlphaNumeric(value)) || (search.type == 'list' && w2utils.isAlphaNumeric(value))
                            ) {
                                let def = this.defaultOperator[this.operatorsMap[search.type]]
                                let tmp = {
                                    field    : search.field,
                                    type     : search.type,
                                    operator : (search.operator != null ? search.operator : def),
                                    value    : value
                                }
                                if (String(value).trim() != '') searchData.push(tmp)
                            }
                            // range in global search box
                            if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1 && String(value).trim().split('-').length == 2) {
                                let t   = String(value).trim().split('-')
                                let tmp = {
                                    field    : search.field,
                                    type     : search.type,
                                    operator : (search.operator != null ? search.operator : 'between'),
                                    value    : [t[0], t[1]]
                                }
                                searchData.push(tmp)
                            }
                            // lists fields
                            if (['list', 'enum'].indexOf(search.type) != -1) {
                                let new_values = []
                                if (search.options == null) search.options = {}
                                if (!Array.isArray(search.options.items)) search.options.items = []
                                for (let j = 0; j < search.options.items; j++) {
                                    let tmp = search.options.items[j]
                                    try {
                                        let re = new RegExp(value, 'i')
                                        if (re.test(tmp)) new_values.push(j)
                                        if (tmp.text && re.test(tmp.text)) new_values.push(tmp.id)
                                    } catch (e) {}
                                }
                                if (new_values.length > 0) {
                                    let tmp = {
                                        field    : search.field,
                                        type     : search.type,
                                        operator : (search.operator != null ? search.operator : 'in'),
                                        value    : new_values
                                    }
                                    searchData.push(tmp)
                                }
                            }
                        }
                    } else {
                        // no search fields, loop thru columns
                        for (let i = 0; i < this.columns.length; i++) {
                            let tmp = {
                                field    : this.columns[i].field,
                                type     : 'text',
                                operator : this.defaultOperator.text,
                                value    : value
                            }
                            searchData.push(tmp)
                        }
                    }
                    /**
                     * If user searched ALL field and there was no matching searches then add a bogus field, so that no result will be
                     * shown. Otherwise search string is not empty, but no fields is actually applied and all fields are shown
                     */
                    if (searchData.length == 0) {
                        let tmp = {
                            field: 'All',
                            type: 'text',
                            operator: this.defaultOperator.text,
                            value: value
                        }
                        searchData.push(tmp)
                    }
                } else {
                    let el = overlay.find('#grid_'+ this.name +'_search_all')
                    let search = this.getSearch(field)
                    if (search == null) search = { field: field, type: 'text' }
                    if (search.field == field) this.last.label = search.label
                    if (value !== '') {
                        let op  = this.defaultOperator[this.operatorsMap[search.type]]
                        let val = value
                        if (['date', 'time', 'datetime'].indexOf(search.type) != -1) op = 'is'
                        if (['list', 'enum'].indexOf(search.type) != -1) {
                            op = 'is'
                            let tmp = el._w2field?.get()
                            if (tmp && Object.keys(tmp).length > 0) val = tmp.id; else val = ''
                        }
                        if (search.type == 'int' && value !== '') {
                            op = 'is'
                            if (String(value).indexOf('-') != -1) {
                                let tmp = value.split('-')
                                if (tmp.length == 2) {
                                    op  = 'between'
                                    val = [parseInt(tmp[0]), parseInt(tmp[1])]
                                }
                            }
                            if (String(value).indexOf(',') != -1) {
                                let tmp = value.split(',')
                                op      = 'in'
                                val     = []
                                for (let i = 0; i < tmp.length; i++) val.push(tmp[i])
                            }
                        }
                        if (search.operator != null) op = search.operator
                        let tmp = {
                            field    : search.field,
                            type     : search.type,
                            operator : op,
                            value    : val
                        }
                        searchData.push(tmp)
                    }
                }
            }
        }
        // 3: search([{ field, value, [operator,] [type] }, { field, value, [operator,] [type] } ], logic) - submit whole structure
        if (Array.isArray(field)) {
            let logic = 'AND'
            if (typeof value == 'string') {
                logic = value.toUpperCase()
                if (logic != 'OR' && logic != 'AND') logic = 'AND'
            }
            last_search = ''
            last_multi  = true
            last_logic  = logic
            for (let i = 0; i < field.length; i++) {
                let data = field[i]
                if (typeof data.value == 'number' && data.operator == null) data.operator = this.defaultOperator.number
                if (typeof data.value == 'string' && data.operator == null) data.operator = this.defaultOperator.text
                if (Array.isArray(data.value) && data.operator == null) data.operator = this.defaultOperator.enum
                if (w2utils.isDate(data.value) && data.operator == null) data.operator = this.defaultOperator.date

                // merge current field and search if any
                searchData.push(data)
            }
        }
        // event before
        let edata = this.trigger('search', {
            target: this.name,
            multi: (arguments.length === 0 ? true : false),
            searchField: (field ? field : 'multi'),
            searchValue: (field ? value : 'multi'),
            searchData: searchData,
            searchLogic: last_logic
        })
        if (edata.isCancelled === true) return
        // default action
        this.searchData             = edata.detail.searchData
        this.last.field             = last_field
        this.last.search            = last_search
        this.last.multi             = last_multi
        this.last.logic             = edata.detail.searchLogic
        this.last.vscroll.scrollTop = 0
        this.last.vscroll.scrollLeft = 0
        this.last.selection.indexes = []
        this.last.selection.columns = {}
        // -- clear all search field
        this.searchClose()
        // apply search
        if (url) {
            this.last.fetch.offset = 0
            this.reload()
        } else {
            // local search
            this.localSearch()
            this.refresh()
        }
        // event after
        edata.finish()
    }

    // open advanced search popover
    searchOpen() {
        if (!this.box) return
        if (this.searches.length === 0) return
        // event before
        let edata = this.trigger('searchOpen', { target: this.name })
        if (edata.isCancelled === true) {
            return
        }
        let $btn = query(this.toolbar.box).find('.w2ui-grid-search-input .w2ui-search-drop')
        $btn.addClass('checked')
        // show search
        w2tooltip.show({
            name: this.name + '-search-overlay',
            anchor: query(this.box).find('#grid_'+ this.name +'_search_all').get(0),
            position: 'bottom|top',
            html: this.getSearchesHTML(),
            align: 'left',
            arrowSize: 12,
            class: 'w2ui-grid-search-advanced',
            hideOn: ['doc-click']
        })
            .then(event => {
                this.initSearches()
                this.last.search_opened = true
                let overlay = query(`#w2overlay-${this.name}-search-overlay`)
                overlay
                    .data('gridName', this.name)
                    .off('.grid-search')
                    .on('click.grid-search', () => {
                    // hide any tooltip opened by searches
                        overlay.find('input, select').each(el => {
                            let names = query(el).data('tooltipName')
                            if (names) names.forEach(name => {
                                w2tooltip.hide(name)
                            })
                        })
                    })
                w2utils.bindEvents(overlay.find('select, input, button'), this)
                // init first field
                let sfields = query(`#w2overlay-${this.name}-search-overlay *[rel=search]`)
                if (sfields.length > 0) sfields[0].focus()
                // event after
                edata.finish()
            })
            .hide(event => {
                $btn.removeClass('checked')
                this.last.search_opened = false
            })
    }

    searchClose() {
        w2tooltip.hide(this.name + '-search-overlay')
    }

    // if clicked on a field in the search strip
    searchFieldTooltip(ind, sd_ind, el) {
        let sf = this.searches[ind]
        let sd = this.searchData[sd_ind]
        let oper = sd.operator
        if (oper == 'more' && sd.type == 'date') oper = 'since'
        if (oper == 'less' && sd.type == 'date') oper = 'before'
        let options = ''
        let val = sd.value
        if (Array.isArray(sd.value)) { // && Array.isArray(sf.options.items)) {
            sd.value.forEach(opt => {
                options += `<span class="value">${opt.text || opt}</span>`
            })
            if (sd.type == 'date') {
                options = ''
                sd.value.forEach(opt => {
                    options += `<span class="value">${w2utils.formatDate(opt)}</span>`
                })
            }
        } else {
            if (sd.type == 'date') {
                val = w2utils.formatDateTime(val)
            }

        }
        w2tooltip.hide(this.name + '-search-props')
        w2tooltip.show({
            name: this.name + '-search-props',
            anchor: el,
            class: 'w2ui-white',
            hideOn: 'doc-click',
            html: `
                <div class="w2ui-grid-search-single">
                    <span class="field">${sf.label}</span>
                    <span class="operator">${w2utils.lang(oper)}</span>
                    ${Array.isArray(sd.value)
                        ? `${options}`
                        : `<span class="value">${val}</span>`
                    }
                    <div class="buttons">
                        <button id="remove" class="w2ui-btn">${w2utils.lang('Remove This Field')}</button>
                    </div>
                </div>`
        }).then(event => {
            query(event.detail.overlay.box).find('#remove').on('click', () => {
                this.searchData.splice(`${sd_ind}`, 1)
                this.reload()
                this.localSearch()
                w2tooltip.hide(this.name + '-search-props')
            })
        })
    }

    // drop down with save searches
    searchSuggest(imediate, forceHide, input) {
        clearTimeout(this.last.kbd_timer)
        clearTimeout(this.last.overlay_timer)
        this.searchShowFields(true)
        this.searchClose()
        if (forceHide === true) {
            w2tooltip.hide(this.name + '-search-suggest')
            return
        }
        if (query(`#w2overlay-${this.name}-search-suggest`).length > 0) {
            // already shown
            return
        }
        if (!imediate) {
            this.last.overlay_timer = setTimeout(() => { this.searchSuggest(true) }, 100)
            return
        }

        let el = query(this.box).find(`#grid_${this.name}_search_all`).get(0)
        let searches = [
            ...this.defaultSearches ?? [],
            ...this.defaultSearches?.length > 0 && this.savedSearches?.length > 0 ? ['--'] : [],
            ...this.savedSearches ?? []
        ]
        if (Array.isArray(searches) && searches.length > 0) {
            w2menu.show({
                name: this.name + '-search-suggest',
                anchor: el,
                align: 'both',
                items: searches,
                hideOn: ['doc-click', 'sleect', 'remove'],
                render(item) {
                    let ret = item.text
                    if (item.isDefault) ret = `<b>${ret}</b>`
                    return ret
                }
            })
            .select(event => {
                let edata = this.trigger('searchSelect', {
                    target: this.name,
                    index: event.detail.index,
                    item: event.detail.item
                })
                if (edata.isCancelled === true) {
                    event.preventDefault()
                    return
                }
                event.detail.overlay.hide()
                this.last.logic  = event.detail.item.logic || 'AND'
                this.last.search = ''
                this.last.label  = '[Multiple Fields]'
                this.searchData  = w2utils.clone(event.detail.item.data)
                this.searchSelected = w2utils.clone(event.detail.item, { exclude: ['icon', 'remove'] })
                this.reload()
                edata.finish()
            })
            .remove(event => {
                let item = event.detail.item
                let edata = this.trigger('searchRemove', { target: this.name, index: event.detail.index, item })
                if (edata.isCancelled === true) {
                    event.preventDefault()
                    return
                }
                event.detail.overlay.hide()
                this.confirm(w2utils.lang('Do you want to delete search "${item}"?', { item: item.text }))
                    .yes(evt => {
                    // remove from searches
                        let search = this.savedSearches.findIndex((s) => s.id == item.id ? true : false)
                        if (search !== -1) {
                            this.savedSearches.splice(search, 1)
                        }
                        this.cacheSave('searches', this.savedSearches.map(s => w2utils.clone(s, { exclude: ['remove', 'icon'] })))
                        evt.detail.self.close()
                        // evt after
                        edata.finish()
                    })
                    .no(evt => {
                        evt.detail.self.close()
                    })
            })
        }
    }

    searchSave() {
        let value = ''
        if (this.searchSelected) {
            value = this.searchSelected.text
        }
        let ind = this.savedSearches.findIndex(s => { return s.id == this.searchSelected?.id ? true : false })
        // event before
        let edata = this.trigger('searchSave', { target: this.name, saveLocalStorage: true })
        if (edata.isCancelled === true) return

        this.message({
            width: 350,
            height: 150,
            body: `<div class="w2ui-grid-save-search">
                        <span>${w2utils.lang(ind != -1 ? 'Update Search' : 'Save New Search')}</span>
                        <input class="search-name w2ui-input" placeholder="${w2utils.lang('Search name')}">
                   </div>`,
            buttons: `
                <button id="grid-search-cancel" class="w2ui-btn">${w2utils.lang('Cancel')}</button>
                <button id="grid-search-save" class="w2ui-btn w2ui-btn-blue" ${String(value).trim() == '' ? 'disabled': ''}>${w2utils.lang('Save')}</button>
            `
        }).open(async (event) => {
            query(event.detail.box).find('input, button').eq(0).val(value)
            await event.complete
            query(event.detail.box).find('#grid-search-cancel').on('click', () => {
                this.message()
            })
            query(event.detail.box).find('#grid-search-save').on('click', () => {
                let name = query(event.detail.box).find('.w2ui-message .search-name').val()
                // save in savedSearches
                if (this.searchSelected && ind != -1) {
                    Object.assign(this.savedSearches[ind], {
                        id: name,
                        text: name,
                        logic: this.last.logic,
                        data: w2utils.clone(this.searchData)
                    })
                } else {
                    this.savedSearches.push({
                        id: name,
                        text: name,
                        icon: 'w2ui-icon-search',
                        remove: true,
                        logic: this.last.logic,
                        data: this.searchData
                    })
                }
                // save local storage
                this.cacheSave('searches', this.savedSearches.map(s => w2utils.clone(s, { exclude: ['remove', 'icon'] })))
                this.message()
                // update on screen
                if (this.searchSelected) {
                    this.searchSelected.text = name
                    query(this.box).find(`#grid_${this.name}_search_name .name-text`).html(name)
                } else {
                    this.searchSelected = {
                        text: name,
                        logic: this.last.logic,
                        data: w2utils.clone(this.searchData)
                    }
                    query(event.detail.box).find(`#grid_${this.name}_search_all`).val(' ').prop('readOnly', true)
                    query(event.detail.box).find(`#grid_${this.name}_search_name`).show().find('.name-text').html(name)
                }
                edata.finish({ name })
            })
            query(event.detail.box).find('input, button')
                .off('.message')
                .on('keydown.message', evt => {
                    let val = String(query(event.detail.box).find('.w2ui-message-body input').val()).trim()
                    if (evt.keyCode == 13 && val != '') {
                        query(event.detail.box).find('#grid-search-save').trigger('click') // enter
                    }
                    if (evt.keyCode == 27) { // escape
                        this.message()
                    }
                })
                .eq(0)
                .on('input.message', evt => {
                    let $save = query(event.detail.box).closest('.w2ui-message').find('#grid-search-save')
                    if (String(query(event.detail.box).val()).trim() === '') {
                        $save.prop('disabled', true)
                    } else {
                        $save.prop('disabled', false)
                    }
                })
                .get(0)
                .focus()
        })
    }

    cache(type) {
        if (w2utils.hasLocalStorage && this.useLocalStorage) {
            try {
                let data = JSON.parse(localStorage.w2ui || '{}')
                data[(this.stateId || this.name)] ??= {}
                return data[(this.stateId || this.name)][type]
            } catch (e) {
            }
        }
        return null
    }

    cacheSave(type, value) {
        if (w2utils.hasLocalStorage && this.useLocalStorage) {
            try {
                let data = JSON.parse(localStorage.w2ui || '{}')
                data[(this.stateId || this.name)] ??= {}
                data[(this.stateId || this.name)][type] = value
                localStorage.w2ui = JSON.stringify(data)
                return true
            } catch (e) {
                delete localStorage.w2ui
            }
        }
        return false
    }

    searchReset(noReload) {
        let searchData = []
        let hasHiddenSearches = false
        // add hidden searches
        for (let i = 0; i < this.searches.length; i++) {
            if (!this.searches[i].hidden || this.searches[i].value == null) continue
            searchData.push({
                field    : this.searches[i].field,
                operator : this.searches[i].operator || 'is',
                type     : this.searches[i].type,
                value    : this.searches[i].value || ''
            })
            hasHiddenSearches = true
        }
        // event before
        let edata = this.trigger('search', { reset: true, target: this.name, searchData: searchData })
        if (edata.isCancelled === true) return
        // default action
        let input = query(this.box).find('#grid_'+ this.name +'_search_all')
        this.searchData = edata.detail.searchData
        this.searchSelected = null
        this.last.search = ''
        this.last.logic = (hasHiddenSearches ? 'AND' : 'OR')
        // --- do not reset to All Fields (I think)
        input.next().hide() // advanced search button
        if (this.searches.length > 0) {
            if (!this.multiSearch || !this.show.searchAll) {
                let tmp = 0
                while (tmp < this.searches.length && (this.searches[tmp].hidden || this.searches[tmp].simple === false)) tmp++
                if (tmp >= this.searches.length) {
                    // all searches are hidden
                    this.last.field = ''
                    this.last.label = ''
                } else {
                    this.last.field = this.searches[tmp].field
                    this.last.label = this.searches[tmp].label
                }
            } else {
                this.last.field = 'all'
                this.last.label = 'All Fields'
                input.next().show() // advanced search button
            }
        }
        this.last.multi      = false
        this.last.fetch.offset = 0
        // reset scrolling position
        this.last.vscroll.scrollTop = 0
        this.last.vscroll.scrollLeft = 0
        this.last.selection.indexes = []
        this.last.selection.columns = {}
        // -- clear all search field
        this.searchClose()
        let all = input.val('').get(0)
        if (all?._w2field) { all._w2field.reset() }
        // apply search
        if (!noReload) this.reload()
        // event after
        edata.finish()
    }

    searchShowFields(forceHide) {
        if (forceHide === true) {
            w2tooltip.hide(this.name + '-search-fields')
            return
        }
        let items = []
        for (let s = -1; s < this.searches.length; s++) {
            let search   = this.searches[s]
            let sField   = (search ? search.field : null)
            let column   = this.getColumn(sField)
            let disabled = false
            let tooltip  = null
            if (this.show.searchHiddenMsg == true && s != -1
                    && (column == null || (column.hidden === true && column.hideable !== false))) {
                disabled = true
                tooltip = w2utils.lang(`This column ${column == null ? 'does not exist' : 'is hidden'}`)
            }
            if (s == -1) { // -1 is All Fields search
                if (!this.multiSearch || !this.show.searchAll) continue
                search = { field: 'all', label: 'All Fields' }
            } else {
                if (column != null && column.hideable === false) continue
                if (search.hidden === true) {
                    tooltip = w2utils.lang('This column is hidden')
                    // don't show hidden (not simple) searches
                    if (search.simple === false) continue
                }
            }
            if (search.label == null && search.caption != null) {
                console.log('NOTICE: grid search.caption property is deprecated, please use search.label. Search ->', search)
                search.label = search.caption
            }
            items.push({
                id: search.field,
                text: w2utils.lang(search.label),
                search,
                tooltip,
                disabled,
                checked: (search.field == this.last.field)
            })
        }
        w2menu.show({
            type: 'radio',
            name: this.name + '-search-fields',
            anchor: query(this.box).find('#grid_'+ this.name +'_search_name').parent().find('.w2ui-search-down').get(0),
            items,
            align: 'none',
            hideOn: ['doc-click', 'select']
        })
            .select(event => {
                this.searchInitInput(event.detail.item.search.field)
            })
    }

    searchInitInput(field, value) {
        let search
        let el = query(this.box).find('#grid_'+ this.name +'_search_all')
        if (field == 'all') {
            search = { field: 'all', label: w2utils.lang('All Fields') }
        } else {
            search = this.getSearch(field)
            if (search == null) return
        }
        // update field
        if (this.last.search != '') {
            this.last.label = search.label
            this.search(search.field, this.last.search)
        } else {
            this.last.field = search.field
            this.last.label = search.label
        }
        el.attr('placeholder', w2utils.lang('Search') + ' ' + w2utils.lang(search.label || search.caption || search.field, true))

        // if there is pre-selected search
        if (this.searchSelected) {
            query(this.box).find(`#grid_${this.name}_search_all`).val(' ').prop('readOnly', true)
            query(this.box).find(`#grid_${this.name}_search_name`).show().find('.name-text').html(this.searchSelected.text)
        } else {
            query(this.box).find(`#grid_${this.name}_search_all`).prop('readOnly', false)
            query(this.box).find(`#grid_${this.name}_search_name`).hide().find('.name-text').html('')
        }
    }

    // clears records and related params
    clear(noRefresh) {
        this.total   = 0
        this.records = []
        this.summary = []
        this.last.fetch.offset = 0 // need this for reload button to work on remote data set
        this.last.idCache   = {} // optimization to free memory
        this.last.selection = { indexes: [], columns: {} }
        this.reset(true)
        // refresh
        if (!noRefresh) this.refresh()
    }

    // clears scroll position, selection, ranges
    reset(noRefresh) {
        // position
        this.last.vscroll.scrollTop = 0
        this.last.vscroll.scrollLeft = 0
        this.last.vscroll.recIndStart = null
        this.last.vscroll.recIndEnd = null
        // additional
        query(this.box).find(`#grid_${this.name}_records`).prop('scrollTop', 0)
        // refresh
        if (!noRefresh) this.refresh()
    }

    skip(offset, callBack) {
        let url = this.url?.get ?? this.url
        if (url) {
            this.offset = parseInt(offset)
            if (this.offset > this.total) this.offset = this.total - this.limit
            if (this.offset < 0 || !w2utils.isInt(this.offset)) this.offset = 0
            this.clear(true)
            this.reload(callBack)
        } else {
            console.log('ERROR: grid.skip() can only be called when you have remote data source.')
        }
    }

    load(url, callBack) {
        if (url == null) {
            console.log('ERROR: You need to provide url argument when calling .load() method of "'+ this.name +'" object.')
            return new Promise((resolve, reject) => { reject() })
        }
        // default action
        this.clear(true)
        return this.request('load', {}, url, callBack)
    }

    reload(callBack) {
        let grid = this
        let url = this.url?.get ?? this.url
        grid.selectionSave()
        if (url) {
            // need to remember selection (not just last.selection object)
            return this.load(url, () => {
                grid.selectionRestore()
                if (typeof callBack == 'function') callBack()
            })
        } else {
            this.reset(true)
            this.localSearch()
            this.selectionRestore()
            if (typeof callBack == 'function') callBack({ status: 'success' })
            return new Promise(resolve => { resolve() })
        }
    }

    request(action, postData, url, callBack) {
        let self = this
        let resolve, reject
        let requestProm = new Promise((res, rej) => { resolve = res; reject = rej })
        if (postData == null) postData = {}
        if (!url) url = this.url
        if (!url) return new Promise((resolve, reject) => { reject() })
        // build parameters list
        if (!w2utils.isInt(this.offset)) this.offset = 0
        if (!w2utils.isInt(this.last.fetch.offset)) this.last.fetch.offset = 0
        // add list params
        let edata
        let params = {
            limit: this.limit,
            offset: parseInt(this.offset) + parseInt(this.last.fetch.offset),
            searchLogic: this.last.logic,
            search: this.searchData.map((search) => {
                let _search = w2utils.clone(search)
                if (this.searchMap && this.searchMap[_search.field]) _search.field = this.searchMap[_search.field]
                return _search
            }),
            sort: this.sortData.map((sort) => {
                let _sort = w2utils.clone(sort)
                if (this.sortMap && this.sortMap[_sort.field]) _sort.field = this.sortMap[_sort.field]
                return _sort
            })
        }
        if (this.searchData.length === 0) {
            delete params.search
            delete params.searchLogic
        }
        if (this.sortData.length === 0) {
            delete params.sort
        }
        // append other params
        w2utils.extend(params, this.postData)
        w2utils.extend(params, postData)
        // other actions
        if (action == 'delete' || action == 'save') {
            delete params.limit
            delete params.offset
            params.action = action
            if (action == 'delete') {
                params[this.recid || 'recid'] = this.getSelection()
            }
        }
        // event before
        if (action == 'load') {
            edata = this.trigger('request', { target: this.name, url, postData: params, httpMethod: 'GET',
                httpHeaders: this.httpHeaders })
            if (edata.isCancelled === true) return new Promise((resolve, reject) => { reject() })
        } else {
            edata = { detail: {
                url,
                postData: params,
                httpMethod: action == 'save' ? 'PUT' : 'DELETE',
                httpHeaders: this.httpHeaders
            }}
        }
        // call server to get data
        if (this.last.fetch.offset === 0) {
            this.lock(w2utils.lang(this.msgRefresh), true)
        }
        if (this.last.fetch.controller) try { this.last.fetch.controller.abort() } catch (e) {}
        // URL
        url = edata.detail.url
        switch (action) {
            case 'save':
                if (url?.save) url = url.save
                break
            case 'delete':
                if (url?.remove) url = url.remove
                break
            default:
                url = url?.get ?? url
        }
        // process url with routeData
        if (Object.keys(this.routeData).length > 0) {
            let info = w2utils.parseRoute(url)
            if (info.keys.length > 0) {
                for (let k = 0; k < info.keys.length; k++) {
                    if (this.routeData[info.keys[k].name] == null) continue
                    url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                }
            }
        }
        url = new URL(url, location)
        // ajax options
        let fetchOptions = w2utils.prepareParams(url, {
            method: edata.detail.httpMethod,
            headers: edata.detail.httpHeaders,
            body: edata.detail.postData
        }, this.dataType)
        Object.assign(this.last.fetch, {
            action: action,
            options: fetchOptions,
            controller: new AbortController(),
            start: Date.now(),
            loaded: false
        })
        fetchOptions.signal = this.last.fetch.controller.signal
        fetch(url, fetchOptions)
            .catch(processError)
            .then(resp => {
                if (resp == null) return // request aborted
                if (resp?.status != 200) {
                    processError(resp ?? {})
                    return
                }
                resp.json()
                    .catch(processError)
                    .then(data => {
                        this.requestComplete(data, action, callBack, resolve, reject)
                    })
                    .finally(() => self.unlock())
            })
        if (action == 'load') {
            // event after
            edata.finish()
        }
        return requestProm

        function processError(response) {
            if (response?.name === 'AbortError') {
                // request was aborted by the grid
                return
            }
            self.unlock()
            // trigger event
            let edata2 = self.trigger('error', { response, lastFetch: self.last.fetch })
            if (edata2.isCancelled === true) return
            // default behavior
            if (response.status && response.status != 200) {
                response.json().then((data) => {
                    self.error(response.status + ': ' + data.message ?? response.statusText)
                }).catch(() => {
                    self.error(response.status + ': ' + response.statusText)
                })
            } else {
                console.log('ERROR: Server communication failed.',
                    '\n   EXPECTED:', { total: 5, records: [{ recid: 1, field: 'value' }] },
                    '\n         OR:', { error: true, message: 'error message' })
                self.requestComplete({ error: true, message: w2utils.lang(this.msgHTTPError), response }, action, callBack, resolve, reject)
            }
            // event after
            edata2.finish()
        }
    }

    requestComplete(data, action, callBack, resolve, reject) {
        let error = data.error ?? false
        if (data.error == null && data.status === 'error') error = true
        this.last.fetch.response = (Date.now() - this.last.fetch.start) / 1000
        setTimeout(() => {
            if (this.show.statusResponse) {
                this.status(w2utils.lang('Server Response ${count} seconds', { count: this.last.fetch.response }))
            }
        }, 10)
        this.last.vscroll.pull_more = false
        this.last.vscroll.pull_refresh = true

        // event before
        let event_name = 'load'
        if (this.last.fetch.action == 'save') event_name = 'save'
        if (this.last.fetch.action == 'delete') event_name = 'delete'
        let edata = this.trigger(event_name, { target: this.name, error, data, lastFetch: this.last.fetch })
        if (edata.isCancelled === true) {
            reject()
            return
        }
        // parse server response
        if (!error) {
            // default action
            if (typeof this.parser == 'function') {
                data = this.parser(data)
                if (typeof data != 'object') {
                    console.log('ERROR: Your parser did not return proper object')
                }
            } else {
                if (data == null) {
                    data = {
                        error: true,
                        message: w2utils.lang(this.msgNotJSON),
                    }
                } else if (Array.isArray(data)) {
                    // if it is plain array, assume these are records
                    data = {
                        error,
                        records: data,
                        total: data.length
                    }
                }
            }
            if (action == 'load') {
                if (data.total == null) data.total = -1
                if (data.records == null) {
                    data.records = []
                }
                if (data.records.length == this.limit) {
                    let loaded = this.records.length + data.records.length
                    this.last.fetch.hasMore = (loaded == this.total ? false : true)
                } else {
                    this.last.fetch.hasMore = false
                    this.total = this.offset + this.last.fetch.offset + data.records.length
                }
                if (!this.last.fetch.hasMore) {
                    // if no more records, then hide spinner
                    query(this.box).find('#grid_'+ this.name +'_rec_more, #grid_'+ this.name +'_frec_more').hide()
                }
                if (this.last.fetch.offset === 0) {
                    this.records = []
                    this.summary = []
                } else {
                    if (data.total != -1 && parseInt(data.total) != parseInt(this.total)) {
                        let grid = this
                        this.message(w2utils.lang(this.msgNeedReload))
                            .ok(() => {
                                delete grid.last.fetch.offset
                                grid.reload()
                            })
                        return new Promise(resolve => { resolve() })
                    }
                }
                if (w2utils.isInt(data.total)) this.total = parseInt(data.total)
                // records
                if (data.records) {
                    data.records.forEach(rec => {
                        if (this.recid) {
                            rec.recid = this.parseField(rec, this.recid)
                        }
                        if (rec.recid == null) {
                            rec.recid = 'recid-' + this.records.length
                        }
                        if (rec.w2ui?.summary === true) {
                            this.summary.push(rec)
                        } else {
                            this.records.push(rec)
                        }
                    })
                }
                // summary records (if any)
                if (data.summary) {
                    this.summary = [] // reset summary with each call
                    data.summary.forEach(rec => {
                        if (this.recid) {
                            rec.recid = this.parseField(rec, this.recid)
                        }
                        if (rec.recid == null) {
                            rec.recid = 'recid-' + this.summary.length
                        }
                        this.summary.push(rec)
                    })
                }
            } else if (action == 'delete') {
                this.reset() // unselect old selections
                return this.reload()
            }
        } else {
            this.error(w2utils.lang(data.message ?? this.msgServerError))
            reject(data)
        }
        // event after
        let url = this.url?.get ?? this.url
        if (!url) {
            this.localSort()
            this.localSearch()
        }
        this.total = parseInt(this.total)
        // do not refresh if loading on infinite scroll
        if (this.last.fetch.offset === 0) {
            this.refresh()
        } else {
            this.scroll()
            this.resize()
        }
        // call back
        if (typeof callBack == 'function') callBack(data) // need to be before event:after
        resolve(data)
        // after event
        edata.finish()
        this.last.fetch.loaded = true
    }

    error(msg) {
        // let the management of the error outside of the grid
        let edata = this.trigger('error', { target: this.name, message: msg })
        if (edata.isCancelled === true) {
            return
        }
        this.message(msg)
        // event after
        edata.finish()
    }

    getChanges(recordsBase) {
        let changes = []
        if (typeof recordsBase == 'undefined') {
            recordsBase = this.records
        }

        for (let r = 0; r < recordsBase.length; r++) {
            let rec = recordsBase[r]
            if (rec?.w2ui) {
                if (rec.w2ui.changes != null) {
                    let obj                    = {}
                    obj[this.recid || 'recid'] = rec.recid
                    changes.push(w2utils.extend(obj, rec.w2ui.changes))
                }

                // recursively look for changes in non-expanded children
                if (rec.w2ui.expanded !== true && rec.w2ui.children && rec.w2ui.children.length) {
                    changes.push(...this.getChanges(rec.w2ui.children))
                }
            }
        }
        return changes
    }

    mergeChanges() {
        let changes = this.getChanges()
        for (let c = 0; c < changes.length; c++) {
            let record = this.get(changes[c][this.recid || 'recid'])
            for (let s in changes[c]) {
                if (s == 'recid' || (this.recid && s == this.recid)) continue // do not allow to change recid
                if (typeof changes[c][s] === 'object') changes[c][s] = changes[c][s].text
                try {
                    _setValue(record, s, changes[c][s])
                } catch (e) {
                    console.log('ERROR: Cannot merge. ', e.message || '', e)
                }
                if (record.w2ui) delete record.w2ui.changes
            }
        }
        this.refresh()

        function _setValue(obj, field, value) {
            let fld = field.split('.')
            if (fld.length == 1) {
                obj[field] = value
            } else {
                obj = obj[fld[0]]
                fld.shift()
                _setValue(obj, fld.join('.'), value)
            }
        }
    }

    save(callBack) {
        let changes = this.getChanges()
        let url = this.url?.save ?? this.url
        // event before
        let edata = this.trigger('save', { target: this.name, changes: changes })
        if (edata.isCancelled === true) return
        if (url) {
            this.request('save', { 'changes' : edata.detail.changes }, null,
                (data) => {
                    if (!data.error) {
                        // only merge changes, if save was successful
                        this.mergeChanges()
                    }
                    // event after
                    edata.finish()
                    // call back
                    if (typeof callBack == 'function') callBack(data)
                }
            )
        } else {
            this.mergeChanges()
            // event after
            edata.finish()
        }
    }

    editField(recid, column, value, event) {
        let self = this
        if (this.last.inEditMode === true) {
            // This is triggerign when user types fast
            if (event && event.keyCode == 13) {
                let { index, column, value } = this.last._edit
                this.editChange({ type: 'custom', value }, index, column, event)
                this.editDone(index, column, event)
            } else {
                // when 2 chars entered fast (spreadsheet)
                let input = query(this.box).find('div.w2ui-edit-box .w2ui-input')
                if (input.length > 0) {
                    if (input.get(0).tagName == 'DIV') {
                        input.text(input.text() + value)
                        w2utils.setCursorPosition(input.get(0), input.text().length)
                    } else {
                        input.val(input.val() + value)
                        w2utils.setCursorPosition(input.get(0), input.val().length)
                    }
                }
            }
            return
        }
        let index = this.get(recid, true)
        let edit = this.getCellEditable(index, column)
        if (!edit || ['checkbox', 'check'].includes(edit.type)) return
        let rec = this.records[index]
        let col = this.columns[column]
        let prefix = (col.frozen === true ? '_f' : '_')
        if (['enum', 'file'].indexOf(edit.type) != -1) {
            console.log('ERROR: input types "enum" and "file" are not supported in inline editing.')
            return
        }
        // event before
        let edata = this.trigger('editField', { target: this.name, recid, column, value, index, originalEvent: event })
        if (edata.isCancelled === true) return
        value = edata.detail.value
        // default behaviour
        this.last.inEditMode = true
        this.last.editColumn = column
        this.last._edit = { value: value, index: index, column: column, recid: recid }
        this.selectNone(true) // no need to trigger select event
        this.select({ recid: recid, column: column })
        // create input element
        let tr = query(this.box).find('#grid_'+ this.name + prefix +'rec_' + w2utils.escapeId(recid))
        let div = tr.find('[col="'+ column +'"] > div') // TD -> DIV
        this.last._edit.tr = tr
        this.last._edit.div = div
        // clear previous if any (spreadsheet)
        query(this.box).find('div.w2ui-edit-box').remove()
        // for spreadsheet - insert into selection
        if (this.selectType != 'row') {
            query(this.box).find('#grid_'+ this.name + prefix + 'selection')
                .attr('id', 'grid_'+ this.name + '_editable')
                .removeClass('w2ui-selection')
                .addClass('w2ui-edit-box')
                .prepend('<div style="position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px;"></div>')
                .find('.w2ui-selection-resizer')
                .remove()
            div = query(this.box).find('#grid_'+ this.name + '_editable > div:first-child')
        }
        edit.attr  = edit.attr ?? ''
        edit.text  = edit.text ?? ''
        edit.style = edit.style ?? ''
        edit.items = edit.items ?? []
        let val = (rec.w2ui?.changes?.[col.field] != null
            ? w2utils.stripTags(rec.w2ui.changes[col.field])
            : w2utils.stripTags(self.parseField(rec, col.field)))
        if (val == null) val = ''
        let prevValue = (typeof val != 'object' ? val : '')
        if (edata.detail.prevValue != null) prevValue = edata.detail.prevValue
        if (value != null) val = value
        let addStyle = (col.style != null ? col.style + ';' : '')
        if (typeof col.render == 'string'
                && ['number', 'int', 'float', 'money', 'percent', 'size'].includes(col.render.split(':')[0])) {
            addStyle += 'text-align: right;'
        }
        // normalize items, if not yet normlized
        if (edit.items.length > 0 && !w2utils.isPlainObject(edit.items[0])) {
            edit.items = w2utils.normMenu(edit.items)
        }
        let input
        let dropTypes = ['date', 'time', 'datetime', 'color', 'list', 'combo']
        let styles = getComputedStyle(tr.find('[col="'+ column +'"] > div').get(0))
        let font = `font-family: ${styles['font-family']}; font-size: ${styles['font-size']};`
        switch (edit.type) {
            case 'div': {
                div.addClass('w2ui-editable')
                    .html(w2utils.stripSpaces(`<div id="grid_${this.name}_edit_${recid}_${column}" class="w2ui-input w2ui-focus"
                        contenteditable autocorrect="off" autocomplete="off" spellcheck="false"
                        style="${font + addStyle + edit.style}"
                        field="${col.field}" recid="${recid}" column="${column}" ${edit.attr}>
                    </div>${edit.text}`))
                input = div.find('div.w2ui-input').get(0)
                input.innerText = (typeof val != 'object' ? val : '')
                if (value != null) {
                    w2utils.setCursorPosition(input, input.innerText.length)
                } else {
                    w2utils.setCursorPosition(input, 0, input.innerText.length)
                }
                break
            }
            default: {
                div.addClass('w2ui-editable')
                    .html(w2utils.stripSpaces(`<input id="grid_${this.name}_edit_${recid}_${column}" class="w2ui-input"
                        autocorrect="off" autocomplete="off" spellcheck="false" type="text"
                        style="${font + addStyle + edit.style}"
                        field="${col.field}" recid="${recid}" column="${column}" ${edit.attr}>${edit.text}`))
                input = div.find('input').get(0)
                // issue #499
                if (edit.type == 'number') {
                    val = w2utils.formatNumber(val)
                }
                if (edit.type == 'date') {
                    val = w2utils.formatDate(w2utils.isDate(val, edit.format, true) || new Date(), edit.format)
                }
                input.value = (typeof val != 'object' ? val : '')

                // init w2field, attached to input._w2field
                let doHide = (event) => {
                    let escKey = this.last._edit?.escKey
                    // check if any element is selected in drop down
                    let selected = false
                    let name = query(input).data('tooltipName')
                    if (name && w2tooltip.get(name[0])?.selected != null) {
                        selected = true
                    }
                    // trigger change on new value if selected from overlay
                    if (this.last.inEditMode && !escKey && dropTypes.includes(edit.type) // drop down types
                            && (event.detail.overlay.anchor?.id == this.last._edit.input?.id || edit.type == 'list')) {
                        this.editChange()
                        this.editDone(undefined, undefined, { keyCode: selected ? 13 : 0 }) // advance on select
                    }
                }
                new w2field(w2utils.extend({}, edit, {
                    el: input,
                    selected: val,
                    onSelect: doHide,
                    onHide: doHide
                }))
                if (value == null && input) {
                    // if no new value, then select content
                    input.select()
                }
            }
        }
        Object.assign(this.last._edit, { input, edit })
        query(input)
            .off('.w2ui-editable')
            .on('blur.w2ui-editable', (event) => {
                if (this.last.inEditMode) {
                    let type = this.last._edit.edit.type
                    let name = query(input).data('tooltipName') // if popup is open
                    if ((name && dropTypes.includes(type)) || event.target._keepOpen === true) {
                        delete event.target._keepOpen
                        // drop downs finish edit when popover is closed
                        return
                    }
                    this.editChange(input, index, column, event)
                    this.editDone()
                }
            })
            .on('mousedown.w2ui-editable', (event) => {
                event.stopPropagation()
            })
            .on('click.w2ui-editable', (event) => {
                expand.call(input, event)
            })
            .on('paste.w2ui-editable', (event) => {
                // clean paste to be plain text
                event.preventDefault()
                let text = event.clipboardData.getData('text/plain')
                document.execCommand('insertHTML', false, text)
            })
            .on('keyup.w2ui-editable', (event) => {
                expand.call(input, event)
            })
            .on('keydown.w2ui-editable', (event) => {
                switch (event.keyCode) {
                    case 8: // backspace;
                        if (edit.type == 'list' && !input._w2field) { // cancel backspace when deleting element
                            event.preventDefault()
                        }
                        break
                    case 9:
                    case 13:
                        event.preventDefault()
                        break
                    case 27: // esc button exits edit mode, but if in a popup, it will also close the popup, hence
                        // if tooltip is open - hide it
                        let name = query(input).data('tooltipName')
                        if (name && name.length > 0) {
                            this.last._edit.escKey = true
                            w2tooltip.hide(name[0])
                            event.preventDefault()
                            return // keep input editable just close tooltip
                        }
                        event.stopPropagation()
                        break
                }
                // need timeout so, this handler is executed after key is processed by browser
                setTimeout(() => {
                    switch (event.keyCode) {
                        case 9: { // tab
                            let next = event.shiftKey
                                ? self.prevCell(index, column, true)
                                : self.nextCell(index, column, true)
                            if (next != null) {
                                let recid = self.records[next.index].recid
                                this.editChange(input, index, column, event)
                                this.editDone(index, column, event)
                                if (self.selectType != 'row') {
                                    self.selectNone(true) // no need to trigger select event
                                    self.select({ recid, column: next.colIndex })
                                } else {
                                    self.editField(recid, next.colIndex, null, event)
                                }
                                if (event.preventDefault) event.preventDefault()
                            }
                            break
                        }
                        case 13: { // enter
                            // check if any element is selected in drop down
                            let selected = false
                            let name = query(input).data('tooltipName')
                            if (name && w2tooltip.get(name[0]).selected != null) {
                                selected = true
                            }
                            // if tooltip is not open or no element is selected
                            if ((!name || !selected) && input._keepOpen !== true) {
                                this.editChange(input, index, column, event)
                                this.editDone(index, column, event)
                            } else {
                                delete input._keepOpen
                            }
                            break
                        }

                        case 27: { // escape
                            this.last._edit.escKey = false
                            let old = self.parseField(rec, col.field)
                            if (rec.w2ui?.changes?.[col.field] != null) old = rec.w2ui.changes[col.field]
                            if (input._prevValue != null) old = input._prevValue
                            if (input.tagName == 'DIV') {
                                input.innerText = old != null ? old : ''
                            } else {
                                input.value = old != null ? old : ''
                            }
                            this.editDone(index, column, event)
                            setTimeout(() => { self.select({ recid: recid, column: column }) }, 1)
                            break
                        }
                    }
                    // if input too small - expand
                    expand(input)
                }, 1)
            })
        // save previous value
        if (input) input._prevValue = prevValue
        // focus and select
        if (edit.type != 'list') {
            setTimeout(() => {
                if (!this.last.inEditMode) return
                if (input) {
                    input.focus()
                    clearTimeout(this.last.kbd_timer) // keep focus
                    input.resize = expand
                    expand(input)
                }
            }, 50)
        }
        // event after
        edata.finish({ input })
        return

        function expand(input) {
            try {
                let styles = getComputedStyle(input)
                let val = (input.tagName.toUpperCase() == 'DIV' ? input.innerText : input.value)
                let editBox = query(self.box).find('#grid_'+ self.name + '_editable').get(0)
                let style = `font-family: ${styles['font-family']}; font-size: ${styles['font-size']}; white-space: no-wrap;`
                let width = w2utils.getStrWidth(val, style)
                if (width + 20 > editBox.clientWidth) {
                    query(editBox).css('width', width + 20 + 'px')
                }
            } catch (e) {
            }
        }
    }

    editChange(input, index, column, event) {
        // if params are not specified
        input = input ?? this.last._edit.input
        index = index ?? this.last._edit.index
        column = column ?? this.last._edit.column
        event = event ?? {}
        // all other fields
        let summary = index < 0
        index       = index < 0 ? -index - 1 : index
        let records = summary ? this.summary : this.records
        let rec     = records[index]
        let col     = this.columns[column]
        let new_val = (input?.tagName == 'DIV' ? input.innerText : input.value)
        let fld     = input._w2field
        if (fld) {
            if (fld.type == 'list') {
                new_val = fld.selected
            }
            if (new_val == null || Object.keys(new_val).length === 0) new_val = ''
            if (!w2utils.isPlainObject(new_val)) new_val = fld.clean(new_val)
        }
        if (input.type == 'checkbox') {
            if (rec.w2ui?.editable === false) input.checked = !input.checked
            new_val = input.checked
        }
        let old_val = this.parseField(rec, col.field)
        let prev_val = (rec.w2ui?.changes && rec.w2ui.changes.hasOwnProperty(col.field) ? rec.w2ui.changes[col.field]: old_val)
        // change/restore event
        let edata = {
            target: this.name, input,
            recid: rec.recid, index, column,
            originalEvent: event,
            value: {
                new: new_val,
                previous: prev_val,
                original: old_val,
            }
        }
        if (event.target?._prevValue != null) edata.value.previous = event.target._prevValue
        let count = 0 // just in case to avoid infinite loop
        while (count < 20) {
            count++
            new_val = edata.value.new
            if ((typeof new_val != 'object' && String(old_val) != String(new_val)) ||
                (typeof new_val == 'object' && new_val && new_val.id != old_val
                    && (typeof old_val != 'object' || old_val == null || new_val.id != old_val.id))) {
                // change event
                edata = this.trigger('change', edata)
                if (edata.isCancelled !== true) {
                    if (new_val !== edata.detail.value.new) {
                        // re-evaluate the type of change to be made
                        continue
                    }
                    // default action
                    if ((edata.detail.value.new === '' || edata.detail.value.new == null) && (prev_val === '' || prev_val == null)) {
                        // value did not change, was empty is empty
                    } else {
                        rec.w2ui = rec.w2ui ?? {}
                        rec.w2ui.changes = rec.w2ui.changes ?? {}
                        rec.w2ui.changes[col.field] = edata.detail.value.new
                    }
                    // event after
                    edata.finish()
                }
            } else {
                // restore event
                edata = this.trigger('restore', edata)
                if (edata.isCancelled !== true) {
                    if (new_val !== edata.detail.value.new) {
                        // re-evaluate the type of change to be made
                        continue
                    }
                    // default action
                    if (rec.w2ui?.changes) {
                        delete rec.w2ui.changes[col.field]
                        if (Object.keys(rec.w2ui.changes).length === 0) {
                            delete rec.w2ui.changes
                        }
                    }
                    // event after
                    edata.finish()
                }
            }
            break
        }
    }

    editDone(index, column, event) {
        // if params are not specified
        index = index ?? this.last._edit.index
        column = column ?? this.last._edit.column
        event = event ?? {}
        // removal of input happens when TR is redrawn
        if (this.advanceOnEdit && event.keyCode == 13) {
            let next = event.shiftKey ? this.prevRow(index, column, 1) : this.nextRow(index, column, 1)
            if (next == null) next = index // keep the same
            setTimeout(() => {
                if (this.selectType != 'row') {
                    this.selectNone(true) // no need to trigger select event
                    this.select({ recid: this.records[next].recid, column: column })
                } else {
                    this.editField(this.records[next].recid, column, null, event)
                }
            }, 1)
        }
        let summary = index < 0
        let cell = query(this.last._edit?.tr).find('[col="'+ column +'"]')
        let rec  = this.records[index]
        let col  = this.columns[column]
        // need to set before remove, as remove will trigger blur
        this.last.inEditMode = false
        this.last._edit = null
        // remove - by updating cell data
        if (!summary) {
            if (rec.w2ui?.changes?.[col.field] != null) {
                cell.addClass('w2ui-changed')
            } else {
                cell.removeClass('w2ui-changed')
            }
            cell.replace(this.getCellHTML(index, column, summary))
        }
        // remove - spreadsheet
        query(this.box).find('div.w2ui-edit-box').remove()
        // update toolbar buttons
        this.updateToolbar()
        // keep grid in focus if needed
        setTimeout(() => {
            let input = query(this.box).find(`#grid_${this.name}_focus`).get(0)
            if (document.activeElement !== input && !this.last.inEditMode) {
                input.focus()
            }
        }, 10)
    }

    'delete'(force) {
        // event before
        let edata = this.trigger('delete', { target: this.name, force: force })
        if (force) this.message() // close message
        if (edata.isCancelled === true) return
        force = edata.detail.force
        // default action
        let recs = this.getSelection()
        if (recs.length === 0) return
        if (this.msgDelete != '' && !force) {
            this.confirm({
                text: w2utils.lang(this.msgDelete, {
                    count: recs.length,
                    records: w2utils.lang( recs.length == 1 ? 'record' : 'records')
                }),
                width: 380,
                height: 170,
                yes_text: w2utils.lang('Delete'),
                yes_class: 'w2ui-btn-red',
                no_text: w2utils.lang('Cancel'),
            })
                .yes(event => {
                    event.detail.self.close()
                    this.delete(true)
                })
                .no(event => {
                    event.detail.self.close()
                })
            return
        }
        // call delete script
        let url = (typeof this.url != 'object' ? this.url : this.url.remove)
        if (url) {
            this.request('delete')
        } else {
            if (typeof recs[0] != 'object') {
                this.selectNone()
                this.remove.apply(this, recs)
            } else {
                // clear cells
                for (let r = 0; r < recs.length; r++) {
                    let fld = this.columns[recs[r].column].field
                    let ind = this.get(recs[r].recid, true)
                    let rec = this.records[ind]
                    if (ind != null && fld != 'recid') {
                        this.records[ind][fld] = ''
                        if (rec.w2ui?.changes) delete rec.w2ui.changes[fld]
                        // -- style should not be deleted
                        // if (rec.style != null && w2utils.isPlainObject(rec.style) && rec.style[recs[r].column]) {
                        //     delete rec.style[recs[r].column];
                        // }
                    }
                }
                this.update()
            }
        }
        // event after
        edata.finish()
    }

    click(recid, event) {
        let time = Date.now()
        let column = null
        if (this.last.cancelClick == true || (event && event.altKey)) return
        if ((typeof recid == 'object') && (recid !== null)) {
            column = recid.column
            recid  = recid.recid
        }
        if (event == null) event = {}
        // check for double click
        if (time - parseInt(this.last.click_time) < 350 && this.last.click_recid == recid && event.type == 'click') {
            this.dblClick(recid, event)
            return
        }
        // hide bubble
        if (this.last.bubbleEl) {
            this.last.bubbleEl = null
        }
        this.last.click_time  = time
        let last_recid = this.last.click_recid
        this.last.click_recid = recid
        // column user clicked on
        if (column == null && event.target) {
            let trg = event.target
            if (trg.tagName != 'TD') trg = query(trg).closest('td')[0]
            if (query(trg).attr('col') != null) column = parseInt(query(trg).attr('col'))
        }
        // event before
        let edata = this.trigger('click', { target: this.name, recid, column, originalEvent: event })
        if (edata.isCancelled === true) return
        // default action
        let sel = this.getSelection()
        query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', false)
        let ind = this.get(recid, true)
        let selectColumns   = []
        this.last.sel_ind   = ind
        this.last.sel_col   = column
        this.last.sel_recid = recid
        this.last.sel_type  = 'click'
        // multi select with shift key
        let start, end, t1, t2
        if (event.shiftKey && sel.length > 0 && this.multiSelect) {
            if (sel[0].recid) {
                start = this.get(sel[0].recid, true)
                end   = this.get(recid, true)
                if (column > sel[0].column) {
                    t1 = sel[0].column
                    t2 = column
                } else {
                    t1 = column
                    t2 = sel[0].column
                }
                for (let c = t1; c <= t2; c++) selectColumns.push(c)
            } else {
                start = this.get(last_recid, true)
                end   = this.get(recid, true)
            }
            let sel_add = []
            if (start > end) { let tmp = start; start = end; end = tmp }
            let url = this.url?.get ? this.url.get : this.url
            for (let i = start; i <= end; i++) {
                if (this.searchData.length > 0 && !url && !this.last.searchIds.includes(i)) continue
                if (this.selectType == 'row') {
                    sel_add.push(this.records[i].recid)
                } else {
                    for (let sc = 0; sc < selectColumns.length; sc++) {
                        sel_add.push({ recid: this.records[i].recid, column: selectColumns[sc] })
                    }
                }
                //sel.push(this.records[i].recid);
            }
            this.select(sel_add)
        } else {
            let last = this.last.selection
            let flag = (last.indexes.indexOf(ind) != -1 ? true : false)
            let fselect = false
            // if clicked on the checkbox
            if (query(event.target).closest('td').hasClass('w2ui-col-select')) fselect = true
            // clear other if necessary
            if (((!event.ctrlKey && !event.shiftKey && !event.metaKey && !fselect) || !this.multiSelect) && !this.showSelectColumn) {
                if (this.selectType != 'row' && !last.columns[ind]?.includes(column)) {
                    flag = false
                }
                if (flag === true && sel.length == 1) {
                    this.unselect({ recid: recid, column: column })
                } else {
                    this.selectNone(true) // no need to trigger select event
                    this.select({ recid: recid, column: column })
                }
            } else {
                if (this.selectType != 'row') flag = false
                if (flag === true) {
                    this.unselect({ recid: recid, column: column })
                } else {
                    this.select({ recid: recid, column: column })
                }
            }
        }
        this.status()
        this.initResize()
        // event after
        edata.finish()
    }

    columnClick(field, event) {
        // ignore click if column was resized
        if (this.last.colResizing === true) {
            return
        }
        // event before
        let edata = this.trigger('columnClick', { target: this.name, field: field, originalEvent: event })
        if (edata.isCancelled === true) return
        // default behaviour
        if (this.selectType == 'row') {
            let column = this.getColumn(field)
            if (column && column.sortable) this.sort(field, null, (event && (event.ctrlKey || event.metaKey || event.shiftKey) ? true : false))
            if (edata.detail.field == 'line-number') {
                if (this.getSelection().length >= this.records.length) {
                    this.selectNone()
                } else {
                    this.selectAll()
                }
            }
        } else {
            if (event.altKey){
                let column = this.getColumn(field)
                if (column && column.sortable) this.sort(field, null, (event && (event.ctrlKey || event.metaKey || event.shiftKey) ? true : false))
            }
            // select entire column
            if (edata.detail.field == 'line-number') {
                if (this.getSelection().length >= this.records.length) {
                    this.selectNone()
                } else {
                    this.selectAll()
                }
            } else {
                if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
                    this.selectNone(true)
                }
                let tmp    = this.getSelection()
                let column = this.getColumn(edata.detail.field, true)
                let sel    = []
                let cols   = []
                // check if there was a selection before
                if (tmp.length != 0 && event.shiftKey) {
                    let start = column
                    let end   = tmp[0].column
                    if (start > end) {
                        start = tmp[0].column
                        end   = column
                    }
                    for (let i = start; i<=end; i++) cols.push(i)
                } else {
                    cols.push(column)
                }
                edata = this.trigger('columnSelect', { target: this.name, columns: cols })
                if (edata.isCancelled !== true) {
                    for (let i = 0; i < this.records.length; i++) {
                        sel.push({ recid: this.records[i].recid, column: cols })
                    }
                    this.select(sel)
                }
                edata.finish()
            }
        }
        // event after
        edata.finish()
    }

    columnDblClick(field, event) {
        // event before
        let edata = this.trigger('columnDblClick', { target: this.name, field: field, originalEvent: event })
        if (edata.isCancelled === true) return
        // event after
        edata.finish()
    }

    columnContextMenu(field, event) {
        let edata = this.trigger('columnContextMenu', {target: this.name, field: field, originalEvent: event })
        if (edata.isCancelled === true) return
        if (this.show.columnMenu) {
            w2menu.show({
                type: 'check',
                contextMenu: true,
                originalEvent: event,
                items: this.initColumnOnOff()
            })
            .then(() => {
                query('#w2overlay-context-menu .w2ui-grid-skip')
                    .off('.w2ui-grid')
                    .on('click.w2ui-grid', evt => {
                        evt.stopPropagation()
                    })
                    .on('keypress', evt => {
                        if (evt.keyCode == 13) {
                            this.skip(evt.target.value)
                            this.toolbar.click('w2ui-column-on-off') // close menu
                        }
                    })
            })
            .select((event) => {
                let id = event.detail.item.id
                if (['w2ui-stateSave', 'w2ui-stateReset'].includes(id)) {
                    this[id.substring(5)]()
                } else if (id == 'w2ui-skip') {
                    // empty
                } else {
                    this.columnOnOff(event, event.detail.item.id)
                }
                clearTimeout(this.last.kbd_timer) // keep grid in focus
            })
            clearTimeout(this.last.kbd_timer) // keep grid in focus
        }
        event.preventDefault()
        edata.finish()
    }

    // if called w/o arguments, then will resize all columns
    columnAutoSize(colIndex) {
        if (arguments.length == 0) {
            // autoSize all columns
            this.columns.forEach((col, i) => this.columnAutoSize(i))
            return
        }
        let col = this.columns[colIndex]
        let el = query(`#grid_${this.name}_column_${colIndex} .w2ui-col-header`)[0]
        if (col.autoResize === false || col.hidden === true || !el) {
            return true
        }
        let style = getComputedStyle(el)
        let maxWidth = w2utils.getStrWidth(el.innerHTML, `font-family: ${style.fontFamily}; font-size: ${style.fontSize}`, true)
            + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 4

        query(this.box).find(`.w2ui-grid-records td[col="${colIndex}"] > div`, this.box).each(el => {
            let style = getComputedStyle(el)
            let width = w2utils.getStrWidth(el.innerHTML, `font-family: ${style.fontFamily}; font-size: ${style.fontSize}`, true)
                + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + 4 // add some extra because of the border
            if (maxWidth < width) {
                maxWidth = width
            }
        })

        // event before
        let edata = this.trigger('columnAutoResize', { maxWidth, originalEvent: event, target: this.name, column: col })
        if (edata.isCancelled === true) { return }

        if (maxWidth > 0) {
            if (col.sizeOriginal == null) col.sizeOriginal = col.size
            col.size = Math.min(Math.abs(maxWidth), col.max || Infinity) + 'px'
            this.resizeRecords()
            this.resizeRecords() // Why do we have to call it twice in order to show the scrollbar?
            this.scroll()
        }
        // event after
        edata.finish()
    }

    columnAutoSizeAll() {
        this.columns.forEach((col, ind) => this.columnAutoSize(ind))
    }

    focus(event) {
        // event before
        let edata = this.trigger('focus', { target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = true
        query(this.box).removeClass('w2ui-inactive').find('.w2ui-inactive').removeClass('w2ui-inactive')
        setTimeout(() => {
            let txt = query(this.box).find(`#grid_${this.name}_focus`).get(0)
            if (txt && document.activeElement != txt) {
                txt.focus()
            }
        }, 10)
        // event after
        edata.finish()
    }

    blur(event) {
        // event before
        let edata = this.trigger('blur', { target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = false
        query(this.box).addClass('w2ui-inactive').find('.w2ui-selected').addClass('w2ui-inactive')
        query(this.box).find('.w2ui-selection').addClass('w2ui-inactive')
        // event after
        edata.finish()
    }

    keydown(event) {
        // this method is called from w2utils
        let obj = this
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (obj.keyboard !== true) return
        // trigger event
        let edata = obj.trigger('keydown', { target: obj.name, originalEvent: event })
        if (edata.isCancelled === true) return
        // default behavior
        if (query(this.box).find('.w2ui-message').length > 0) {
            // if there are messages
            if (event.keyCode == 27) this.message()
            return
        }
        let empty   = false
        let records = query(obj.box).find('#grid_'+ obj.name +'_records')
        let sel     = obj.getSelection()
        if (sel.length === 0) empty = true
        let recid   = sel[0] || null
        let columns = []
        let recid2  = sel[sel.length-1]
        if (typeof recid == 'object' && recid != null) {
            recid   = sel[0].recid
            columns = []
            let ii  = 0
            while (true) {
                if (!sel[ii] || sel[ii].recid != recid) break
                columns.push(sel[ii].column)
                ii++
            }
            recid2 = sel[sel.length-1].recid
        }
        let ind      = obj.get(recid, true)
        let ind2     = obj.get(recid2, true)
        let recEL    = query(obj.box).find(`#grid_${obj.name}_rec_${(ind != null ? w2utils.escapeId(obj.records[ind].recid) : 'none')}`)
        let pageSize = Math.floor(records[0].clientHeight / obj.recordHeight)
        let cancel   = false
        let key      = event.keyCode
        let shiftKey = event.shiftKey

        switch (key) {
            case 8: // backspace
            case 46: { // delete
                // delete if button is visible
                obj.delete()
                cancel = true
                event.stopPropagation()
                break
            }
            case 27: { // escape
                if (obj.last.move?.type) {
                    delete obj.last.move
                    obj.removeRange('selection-preview')
                    obj.removeRange('selection-expand')
                    cancel = true
                } else {
                    obj.selectNone()
                    cancel = true
                }
                break
            }
            case 65: { // cmd + A
                if (!event.metaKey && !event.ctrlKey) break
                obj.selectAll()
                cancel = true
                break
            }
            case 13: { // enter
                // if expandable columns - expand it
                if (this.selectType == 'row' && obj.show.expandColumn === true) {
                    if (recEL.length <= 0) break
                    obj.toggle(recid, event)
                    cancel = true
                } else { // or enter edit
                    for (let c = 0; c < this.columns.length; c++) {
                        let edit = this.getCellEditable(ind, c)
                        if (edit) {
                            columns.push(parseInt(c))
                            break
                        }
                    }
                    // edit last column that was edited
                    if (this.selectType == 'row' && this.last._edit && this.last._edit.column) {
                        columns = [this.last._edit.column]
                    }
                    if (columns.length > 0) {
                        obj.editField(recid, columns[0] ?? this.last.editColumn, null, event)
                        cancel = true
                    }
                }
                break
            }
            case 37: { // left
                moveLeft()
                break
            }
            case 39: { // right
                moveRight()
                break
            }
            case 33: { // <PgUp>
                moveUp(pageSize)
                break
            }
            case 34: { // <PgDn>
                moveDown(pageSize)
                break
            }
            case 35: { // <End>
                moveDown(-1)
                break
            }
            case 36: { // <Home>
                moveUp(-1)
                break
            }
            case 38: { // up
                // ctrl (or cmd) + up -> same as home
                moveUp(event.metaKey || event.ctrlKey ? -1 : 1)
                break
            }
            case 40: { // down
                // ctrl (or cmd) + up -> same as end
                moveDown(event.metaKey || event.ctrlKey ? -1 : 1)
                break
            }
            // copy & paste
            case 17: // ctrl key
            case 91: { // cmd key
                // SLOW: 10k records take 7.0
                if (empty) break
                // in Safari need to copy to buffer on cmd or ctrl key (otherwise does not work)
                if (w2utils.isSafari) {
                    obj.last.copy_event = obj.copy(false, event)
                    let focus = query(obj.box).find('#grid_'+ obj.name + '_focus')
                    focus.val(obj.last.copy_event.detail.text)
                    focus[0].select()
                }
                break
            }
            case 67: { // - c
                // this fill trigger event.onComplete
                if (event.metaKey || event.ctrlKey) {
                    if (w2utils.isSafari) {
                        obj.copy(obj.last.copy_event, event)
                    } else {
                        obj.last.copy_event = obj.copy(false, event)
                        let focus = query(obj.box).find('#grid_'+ obj.name + '_focus')
                        focus.val(obj.last.copy_event.detail.text)
                        focus[0].select()
                        obj.copy(obj.last.copy_event, event)
                    }
                }
                break
            }
            case 88: { // x - cut
                if (empty) break
                if (event.ctrlKey || event.metaKey) {
                    if (w2utils.isSafari) {
                        obj.copy(obj.last.copy_event, event)
                    } else {
                        obj.last.copy_event = obj.copy(false, event)
                        let focus = query(obj.box).find('#grid_'+ obj.name + '_focus')
                        focus.val(obj.last.copy_event.detail.text)
                        focus[0].select()
                        obj.copy(obj.last.copy_event, event)
                    }
                }
                break
            }
        }
        let tmp = [32, 187, 189, 192, 219, 220, 221, 186, 222, 188, 190, 191] // other typeable chars
        for (let i = 48; i <= 111; i++) tmp.push(i) // 0-9,a-z,A-Z,numpad
        if (tmp.indexOf(key) != -1 && !event.ctrlKey && !event.metaKey && !cancel) {
            if (columns.length === 0) columns.push(0)
            cancel = false
            // move typed key into edit
            setTimeout(() => {
                let focus = query(obj.box).find('#grid_'+ obj.name + '_focus')
                let key = focus.val()
                focus.val('')
                obj.editField(recid, columns[0], key, event)
            }, 1)
        }
        if (cancel) { // cancel default behaviour
            if (event.preventDefault) event.preventDefault()
        }
        // event after
        edata.finish()

        function moveLeft() {
            if (empty) { // no selection
                selectTopRecord()
                return
            }
            if (obj.selectType == 'row') {
                if (recEL.length <= 0) return
                let tmp = obj.records[ind].w2ui || {}
                if (tmp && tmp.parent_recid != null && (!Array.isArray(tmp.children) || tmp.children.length === 0 || !tmp.expanded)) {
                    obj.unselect(recid)
                    obj.collapse(tmp.parent_recid, event)
                    obj.select(tmp.parent_recid)
                } else {
                    obj.collapse(recid, event)
                }
            } else {
                let prev = obj.prevCell(ind, columns[0])
                if (prev?.index != ind) {
                    prev = null
                } else {
                    prev = prev?.colIndex
                }
                if (!shiftKey && prev == null) {
                    obj.selectNone(true)
                    prev = 0
                }
                if (prev != null) {
                    if (shiftKey && obj.multiSelect) {
                        if (tmpUnselect()) return
                        let tmp    = []
                        let newSel = []
                        let unSel  = []
                        if (columns.indexOf(obj.last.sel_col) === 0 && columns.length > 1) {
                            for (let i = 0; i < sel.length; i++) {
                                if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid)
                                unSel.push({ recid: sel[i].recid, column: columns[columns.length-1] })
                            }
                            obj.unselect(unSel)
                            obj.scrollIntoView(ind, columns[columns.length-1], true)
                        } else {
                            for (let i = 0; i < sel.length; i++) {
                                if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid)
                                newSel.push({ recid: sel[i].recid, column: prev })
                            }
                            obj.select(newSel)
                            obj.scrollIntoView(ind, prev, true)
                        }
                    } else {
                        obj.click({ recid: recid, column: prev }, event)
                        obj.scrollIntoView(ind, prev, true)
                    }
                } else {
                    // if selected more then one, then select first
                    if (!shiftKey) {
                        obj.selectNone(true)
                    }
                }
            }
            cancel = true
        }

        function moveRight() {
            if (empty) {
                selectTopRecord()
                return
            }
            if (obj.selectType == 'row') {
                if (recEL.length <= 0) return
                obj.expand(recid, event)
            } else {
                let next = obj.nextCell(ind, columns[columns.length-1]) // columns is an array of selected columns
                if (next.index != ind) {
                    next = null
                } else {
                    next = next.colIndex
                }
                if (!shiftKey && next == null) {
                    obj.selectNone(true)
                    next = obj.columns.length-1
                }
                if (next != null) {
                    if (shiftKey && key == 39 && obj.multiSelect) {
                        if (tmpUnselect()) return
                        let tmp    = []
                        let newSel = []
                        let unSel  = []
                        if (columns.indexOf(obj.last.sel_col) == columns.length-1 && columns.length > 1) {
                            for (let i = 0; i < sel.length; i++) {
                                if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid)
                                unSel.push({ recid: sel[i].recid, column: columns[0] })
                            }
                            obj.unselect(unSel)
                            obj.scrollIntoView(ind, columns[0], true)
                        } else {
                            for (let i = 0; i < sel.length; i++) {
                                if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid)
                                newSel.push({ recid: sel[i].recid, column: next })
                            }
                            obj.select(newSel)
                            obj.scrollIntoView(ind, next, true)
                        }
                    } else {
                        obj.click({ recid: recid, column: next }, event)
                        obj.scrollIntoView(ind, next, true)
                    }
                } else {
                    // if selected more then one, then select first
                    if (!shiftKey) {
                        obj.selectNone(true)
                    }
                }
            }
            cancel = true
        }

        function moveUp(numRows) {
            if (empty) selectTopRecord()
            if (recEL.length <= 0) return
            // move to the previous record
            let prev = obj.prevRow(ind, obj.selectType == 'row' ? 0 : sel[0].column, numRows)
            if (!shiftKey && prev == null) {
                if (obj.searchData.length != 0 && !url) {
                    prev = obj.last.searchIds[0]
                } else {
                    prev = 0
                }
            }
            if (prev != null) {
                if (shiftKey && obj.multiSelect) { // expand selection
                    if (tmpUnselect()) return
                    if (obj.selectType == 'row') {
                        if (obj.last.sel_ind > prev && obj.last.sel_ind != ind2) {
                            obj.unselect(obj.records[ind2].recid)
                        } else {
                            obj.select(obj.records[prev].recid)
                        }
                    } else {
                        if (obj.last.sel_ind > prev && obj.last.sel_ind != ind2) {
                            prev    = ind2
                            let tmp = []
                            for (let c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[prev].recid, column: columns[c] })
                            obj.unselect(tmp)
                        } else {
                            let tmp = []
                            for (let c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[prev].recid, column: columns[c] })
                            obj.select(tmp)
                        }
                    }
                } else { // move selected record
                    obj.selectNone(true) // no need to trigger select event
                    obj.click({ recid: obj.records[prev].recid, column: columns[0] }, event)
                }
                obj.scrollIntoView(prev, null, true, numRows != 1) // top align record
                if (event.preventDefault) event.preventDefault()
            } else {
                // if selected more then one, then select first
                if (!shiftKey) {
                    obj.selectNone(true)
                }
            }
        }

        function moveDown(numRows) {
            if (empty) selectTopRecord()
            if (recEL.length <= 0) return
            // move to the next record
            let next = obj.nextRow(ind2, obj.selectType == 'row' ? 0 : sel[0].column, numRows)
            if (!shiftKey && next == null) {
                if (obj.searchData.length != 0 && !url) {
                    next = obj.last.searchIds[obj.last.searchIds.length - 1]
                } else {
                    next = obj.records.length - 1
                }
            }
            if (next != null) {
                if (shiftKey && obj.multiSelect) { // expand selection
                    if (tmpUnselect()) return
                    if (obj.selectType == 'row') {
                        if (obj.last.sel_ind < next && obj.last.sel_ind != ind) {
                            obj.unselect(obj.records[ind].recid)
                        } else {
                            obj.select(obj.records[next].recid)
                        }
                    } else {
                        if (obj.last.sel_ind < next && obj.last.sel_ind != ind) {
                            next    = ind
                            let tmp = []
                            for (let c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[next].recid, column: columns[c] })
                            obj.unselect(tmp)
                        } else {
                            let tmp = []
                            for (let c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[next].recid, column: columns[c] })
                            obj.select(tmp)
                        }
                    }
                } else { // move selected record
                    obj.selectNone(true) // no need to trigger select event
                    obj.click({ recid: obj.records[next].recid, column: columns[0] }, event)
                }
                obj.scrollIntoView(next, null, true, numRows != 1) // top align record
                cancel = true
            } else {
                // if selected more then one, then select first
                if (!shiftKey) {
                    obj.selectNone(true) // no need to trigger select event
                }
            }
        }

        function selectTopRecord() {
            if (!obj.records || obj.records.length === 0) return
            let ind = Math.floor(records[0].scrollTop / obj.recordHeight) + 1
            if (!obj.records[ind] || ind < 2) ind = 0
            if (typeof obj.records[ind] === 'undefined') return
            obj.select({ recid: obj.records[ind].recid, column: 0})
        }

        function tmpUnselect () {
            if (obj.last.sel_type != 'click') return false
            if (obj.selectType != 'row') {
                obj.last.sel_type = 'key'
                if (sel.length > 1) {
                    for (let s = 0; s < sel.length; s++) {
                        if (sel[s].recid == obj.last.sel_recid && sel[s].column == obj.last.sel_col) {
                            sel.splice(s, 1)
                            break
                        }
                    }
                    obj.unselect(sel)
                    return true
                }
                return false
            } else {
                obj.last.sel_type = 'key'
                if (sel.length > 1) {
                    sel.splice(sel.indexOf(obj.records[obj.last.sel_ind].recid), 1)
                    obj.unselect(sel)
                    return true
                }
                return false
            }
        }
    }

    scrollIntoView(ind, column, instant, recTop) {
        let buffered = this.records.length
        if (this.searchData.length != 0 && !this.url) buffered = this.last.searchIds.length
        if (buffered === 0) return
        if (ind == null) {
            let sel = this.getSelection()
            if (sel.length === 0) return
            if (w2utils.isPlainObject(sel[0])) {
                ind    = sel[0].index
                column = sel[0].column
            } else {
                ind = this.get(sel[0], true)
            }
        }
        let records = query(this.box).find(`#grid_${this.name}_records`)
        let recWidth  = records[0].clientWidth
        let recHeight = records[0].clientHeight
        let recSTop   = records[0].scrollTop
        let recSLeft  = records[0].scrollLeft
        // if all records in view
        let len = this.last.searchIds.length
        if (len > 0) ind = this.last.searchIds.indexOf(ind) // if search is applied
        // smooth or instant
        records.css({ 'scroll-behavior': instant ? 'auto' : 'smooth' })

        // vertical
        if (recHeight < this.recordHeight * (len > 0 ? len : buffered) && records.length > 0) {
            // scroll to correct one
            let t1 = Math.floor(recSTop / this.recordHeight)
            let t2 = t1 + Math.floor(recHeight / this.recordHeight)
            if (ind == t1) {
                records.prop('scrollTop', recSTop - recHeight / 1.3)
            }
            if (ind == t2) {
                records.prop('scrollTop', recSTop + recHeight / 1.3)
            }
            if (ind < t1 || ind > t2) {
                records.prop('scrollTop', (ind - 1) * this.recordHeight)
            }
            if (recTop === true) {
                records.prop('scrollTop', ind * this.recordHeight)
            }
        }

        // horizontal
        if (column != null) {
            let x1 = 0
            let x2 = 0
            let sb = w2utils.scrollBarSize()
            for (let i = 0; i <= column; i++) {
                let col = this.columns[i]
                if (col.frozen || col.hidden) continue
                x1  = x2
                x2 += parseInt(col.sizeCalculated)
            }
            if (recWidth < x2 - recSLeft) { // right
                records.prop('scrollLeft', x1 - sb)
            } else if (x1 < recSLeft) { // left
                records.prop('scrollLeft', x2 - recWidth + sb * 2)
            }
        }
    }

    scrollToColumn(field) {
        if (field == null)
            return
        let sWidth = 0
        let found  = false
        for (let i = 0; i < this.columns.length; i++) {
            let col = this.columns[i]
            if (col.field == field) {
                found = true
                break
            }
            if (col.frozen || col.hidden)
                continue
            let cSize = parseInt(col.sizeCalculated ? col.sizeCalculated : col.size)
            sWidth   += cSize
        }
        if (!found)
            return
        this.last.vscroll.scrollLeft = sWidth + 1
        this.scroll()
    }


    dblClick(recid, event) {
        // find columns
        let column = null
        if ((typeof recid == 'object') && (recid !== null)) {
            column = recid.column
            recid  = recid.recid
        }
        if (event == null) event = {}
        // column user clicked on
        if (column == null && event.target) {
            let tmp = event.target
            if (tmp.tagName.toUpperCase() != 'TD') tmp = query(tmp).closest('td')[0]
            column = parseInt(query(tmp).attr('col'))
        }
        let index = this.get(recid, true)
        let rec   = this.records[index]
        // event before
        let edata = this.trigger('dblClick', { target: this.name, recid: recid, column: column, originalEvent: event })
        if (edata.isCancelled === true) return
        // default action
        this.selectNone(true) // no need to trigger select event
        let edit = this.getCellEditable(index, column)
        if (edit) {
            this.editField(recid, column, null, event)
        } else {
            this.select({ recid: recid, column: column })
            if (this.show.expandColumn || (rec && rec.w2ui && Array.isArray(rec.w2ui.children))) this.toggle(recid)
        }
        // event after
        edata.finish()
    }

    showContextMenu(recid, column, event) {
        if (this.last.userSelect == 'text') return
        if (event == null) {
            event = { offsetX: 0, offsetY: 0, target: query(this.box).find(`#grid_${this.name}_rec_${recid}`)[0] }
        }
        if (event.offsetX == null) {
            event.offsetX = event.layerX - event.target.offsetLeft
            event.offsetY = event.layerY - event.target.offsetTop
        }
        // if (w2utils.isFloat(recid)) recid = parseFloat(recid)
        let sel = this.getSelection()
        if (this.selectType == 'row') {
            if (sel.indexOf(recid) == -1) {
                this.click(recid)
            }
        } else {
            let selected = false
            // check if any selected sel in the right row/column
            for (let i = 0; i < sel.length; i++) {
                if (sel[i].recid == recid || sel[i].column == column) selected = true
            }
            if (!selected && recid != null) this.click({ recid: recid, column: column })
            if (!selected && column != null) this.columnClick(this.columns[column].field, event)
        }
        // event before
        let edata = this.trigger('contextMenu', { target: this.name, originalEvent: event, recid, column })
        if (edata.isCancelled === true) return
        // default action
        if (this.contextMenu?.length > 0) {
            w2menu.show({
                contextMenu: true,
                originalEvent: event,
                items: this.contextMenu
            })
            .select((event) => {
                clearTimeout(this.last.kbd_timer) // keep grid in focus
                this.contextMenuClick(recid, column, event)
            })
        }
        // cancel browser context menu
        event.preventDefault()
        clearTimeout(this.last.kbd_timer) // keep grid in focus
        // event after
        edata.finish()
    }

    contextMenuClick(recid, column, event) {
        // event before
        let edata = this.trigger('contextMenuClick', {
            target: this.name, recid, column, originalEvent: event.detail.originalEvent,
            menuEvent: event, menuIndex: event.detail.index, menuItem: event.detail.item
        })
        if (edata.isCancelled === true) return
        // no default action
        edata.finish()
    }

    toggle(recid) {
        let rec  = this.get(recid)
        if (rec == null) return
        rec.w2ui = rec.w2ui ?? {}
        if (rec.w2ui.expanded === true) return this.collapse(recid); else return this.expand(recid)
    }

    expand(recid, noRefresh) {
        let ind  = this.get(recid, true)
        let rec  = this.records[ind]
        rec.w2ui = rec.w2ui ?? {}
        let id   = w2utils.escapeId(recid)
        let children = rec.w2ui.children
        let edata
        if (Array.isArray(children)) {
            if (rec.w2ui.expanded === true || children.length === 0) return false // already shown
            edata = this.trigger('expand', { target: this.name, recid: recid })
            if (edata.isCancelled === true) return false
            rec.w2ui.expanded = true
            children.forEach((child) => {
                child.w2ui = child.w2ui ?? {}
                child.w2ui.parent_recid = rec.recid
                if (child.w2ui.children == null) child.w2ui.children = []
            })
            this.records.splice.apply(this.records, [ind + 1, 0].concat(children))
            if (this.total !== -1) {
                this.total += children.length
            }
            let url = (typeof this.url != 'object' ? this.url : this.url.get)
            if (!url) {
                this.localSort(true, true)
                if (this.searchData.length > 0) {
                    this.localSearch(true)
                }
            }
            if (noRefresh !== true) this.refresh()
            edata.finish()
        } else {
            if (query(this.box).find('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').length > 0 || this.show.expandColumn !== true) return false
            if (rec.w2ui.expanded == 'none') return false
            // insert expand row
            query(this.box).find('#grid_'+ this.name +'_rec_'+ id).after(
                `<tr id="grid_${this.name}_rec_${recid}_expanded_row" class="w2ui-expanded-row">
                    <td colspan="100" class="w2ui-expanded2">
                        <div id="grid_${this.name}_rec_${recid}_expanded"></div>
                    </td>
                    <td class="w2ui-grid-data-last"></td>
                </tr>`)

            query(this.box).find('#grid_'+ this.name +'_frec_'+ id).after(
                `<tr id="grid_${this.name}_frec_${recid}_expanded_row" class="w2ui-expanded-row">
                    ${this.show.lineNumbers ? '<td class="w2ui-col-number"></td>' : ''}
                    <td class="w2ui-grid-data w2ui-expanded1" colspan="100">
                       <div id="grid_${this.name}_frec_${recid}_expanded"></div>
                    </td>
                </tr>`)

            // event before
            edata = this.trigger('expand', { target: this.name, recid: recid,
                box_id: 'grid_'+ this.name +'_rec_'+ recid +'_expanded', fbox_id: 'grid_'+ this.name +'_frec_'+ recid +'_expanded' })
            if (edata.isCancelled === true) {
                query(this.box).find('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove()
                query(this.box).find('#grid_'+ this.name +'_frec_'+ id +'_expanded_row').remove()
                return false
            }
            // expand column
            let row1 = query(this.box).find('#grid_'+ this.name +'_rec_'+ recid +'_expanded')
            let row2 = query(this.box).find('#grid_'+ this.name +'_frec_'+ recid +'_expanded')
            let innerHeight = row1.find(':scope div:first-child')[0]?.clientHeight ?? 50
            if (row1[0].clientHeight < innerHeight) {
                row1.css({ height: innerHeight + 'px' })
            }
            if (row2[0].clientHeight < innerHeight) {
                row2.css({ height: innerHeight + 'px' })
            }
            // default action
            query(this.box).find('#grid_'+ this.name +'_rec_'+ id).attr('expanded', 'yes').addClass('w2ui-expanded')
            query(this.box).find('#grid_'+ this.name +'_frec_'+ id).attr('expanded', 'yes').addClass('w2ui-expanded')
            query(this.box).find('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('-')
            rec.w2ui.expanded = true
            // event after
            edata.finish()
            this.resizeRecords()
        }
        return true
    }

    collapse(recid, noRefresh) {
        let ind      = this.get(recid, true)
        let rec      = this.records[ind]
        rec.w2ui     = rec.w2ui || {}
        let id       = w2utils.escapeId(recid)
        let children = rec.w2ui.children
        let edata
        if (Array.isArray(children)) {
            if (rec.w2ui.expanded !== true) return false // already hidden
            edata = this.trigger('collapse', { target: this.name, recid: recid })
            if (edata.isCancelled === true) return false
            clearExpanded(rec)
            let stops = []
            for (let r = rec; r != null; r = this.get(r.w2ui.parent_recid))
                stops.push(r.w2ui.parent_recid)
            // stops contains 'undefined' plus the ID of all nodes in the path from 'rec' to the tree root
            let start = ind + 1
            let end   = start
            while (true) {
                if (this.records.length <= end + 1 || this.records[end+1].w2ui == null ||
                    stops.indexOf(this.records[end+1].w2ui.parent_recid) >= 0) {
                    break
                }
                end++
            }
            this.records.splice(start, end - start + 1)
            if (this.total !== -1) {
                this.total -= end - start + 1
            }
            let url     = (typeof this.url != 'object' ? this.url : this.url.get)
            if (!url) {
                if (this.searchData.length > 0) {
                    this.localSearch(true)
                }
            }
            if (noRefresh !== true) this.refresh()
            edata.finish()
        } else {
            if (query(this.box).find('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').length === 0 || this.show.expandColumn !== true) return false
            // event before
            edata = this.trigger('collapse', { target: this.name, recid: recid,
                box_id: 'grid_'+ this.name +'_rec_'+ recid +'_expanded', fbox_id: 'grid_'+ this.name +'_frec_'+ recid +'_expanded' })
            if (edata.isCancelled === true) return false
            // default action
            query(this.box).find('#grid_'+ this.name +'_rec_'+ id).removeAttr('expanded').removeClass('w2ui-expanded')
            query(this.box).find('#grid_'+ this.name +'_frec_'+ id).removeAttr('expanded').removeClass('w2ui-expanded')
            query(this.box).find('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('+')
            query(this.box).find('#grid_'+ this.name +'_rec_'+ id +'_expanded').css('height', '0px')
            query(this.box).find('#grid_'+ this.name +'_frec_'+ id +'_expanded').css('height', '0px')
            setTimeout(() => {
                query(this.box).find('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove()
                query(this.box).find('#grid_'+ this.name +'_frec_'+ id +'_expanded_row').remove()
                rec.w2ui.expanded = false
                // event after
                edata.finish()
                this.resizeRecords()
            }, 300)
        }
        return true

        function clearExpanded(rec) {
            rec.w2ui.expanded = false
            for (let i = 0; i < rec.w2ui.children.length; i++) {
                let subRec = rec.w2ui.children[i]
                if (subRec.w2ui.expanded) {
                    clearExpanded(subRec)
                }
            }
        }
    }

    sort(field, direction, multiField) { // if no params - clears sort
        // event before
        let edata = this.trigger('sort', { target: this.name, field, direction, multiField })
        if (edata.isCancelled === true) return
        // check if needed to quit
        if (field != null) {
            // default action
            let sortIndex = this.sortData.length
            for (let s = 0; s < this.sortData.length; s++) {
                if (this.sortData[s].field == field) {
                    sortIndex = s
                    break
                }
            }
            if (direction == null) {
                direction = this.sortData[sortIndex]?.direction
                if (direction == null) {
                    // save original sort, so it can be restored
                    if (this.last.originalSort == null) {
                        this.last.originalSort = this.records.map(rec => rec.recid)
                    }
                    direction = 'asc'
                } else {
                    switch (direction.toLowerCase()) {
                        case 'asc': {
                            direction = 'desc'
                            break
                        }
                        case 'desc': {
                            direction = ''
                            break
                        }
                        default: {
                            direction = 'asc'
                            break
                        }
                    }
                }
            }
            if (multiField != true) {
                this.sortData = []
                sortIndex = 0
            }
            if (direction === '') {
                this.sortData.splice(sortIndex, 1)
            } else {
                // set new sort
                this.sortData[sortIndex] ??= {}
                Object.assign(this.sortData[sortIndex], { field, direction })
            }
        } else {
            this.sortData = []
        }
        // if local
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (!url) {
            this.localSort(false, true)
            if (this.searchData.length > 0) this.localSearch(true)
            // reset vertical scroll
            this.last.vscroll.scrollTop = 0
            query(this.box).find(`#grid_${this.name}_records`).prop('scrollTop', 0)
            // event after
            edata.finish({ direction })
            this.refresh()
        } else {
            // event after
            edata.finish({ direction })
            this.last.fetch.offset = 0
            this.reload()
        }
    }

    copy(flag, oEvent) {
        if (w2utils.isPlainObject(flag)) {
            // event after
            flag.finish()
            return flag.text
        }
        // generate text to copy
        let sel = this.getSelection()
        if (sel.length === 0) return ''
        let text = ''
        if (typeof sel[0] == 'object') { // cell copy
            // find min/max column
            let minCol = sel[0].column
            let maxCol = sel[0].column
            let recs   = []
            for (let s = 0; s < sel.length; s++) {
                if (sel[s].column < minCol) minCol = sel[s].column
                if (sel[s].column > maxCol) maxCol = sel[s].column
                if (recs.indexOf(sel[s].index) == -1) recs.push(sel[s].index)
            }
            recs.sort((a, b) => { return a-b }) // sort function must be for numerical sort
            for (let r = 0 ; r < recs.length; r++) {
                let ind = recs[r]
                for (let c = minCol; c <= maxCol; c++) {
                    let col = this.columns[c]
                    if (col.hidden === true) continue
                    text += this.getCellCopy(ind, c) + '\t'
                }
                text  = text.substr(0, text.length-1) // remove last \t
                text += '\n'
            }
        } else { // row copy
            // copy headers
            for (let c = 0; c < this.columns.length; c++) {
                let col = this.columns[c]
                if (col.hidden === true) continue
                let colName = (col.text ? col.text : col.field)
                if (col.text && col.text.length < 3 && col.tooltip) colName = col.tooltip // if column name is less then 3 char and there is tooltip - use it
                text += '"' + w2utils.stripTags(colName) + '"\t'
            }
            text  = text.substr(0, text.length-1) // remove last \t
            text += '\n'
            // copy selected text
            for (let s = 0; s < sel.length; s++) {
                let ind = this.get(sel[s], true)
                for (let c = 0; c < this.columns.length; c++) {
                    let col = this.columns[c]
                    if (col.hidden === true) continue
                    text += '"' + this.getCellCopy(ind, c) + '"\t'
                }
                text  = text.substr(0, text.length-1) // remove last \t
                text += '\n'
            }
        }
        text = text.substr(0, text.length - 1)

        // if called without params
        let edata
        if (flag == null) {
            // before event
            edata = this.trigger('copy', { target: this.name, text: text,
                cut: (oEvent.keyCode == 88 ? true : false), originalEvent: oEvent })
            if (edata.isCancelled === true) return ''
            text = edata.detail.text
            // event after
            edata.finish()
            return text
        } else if (flag === false) { // only before event
            // before event
            edata = this.trigger('copy', { target: this.name, text: text,
                cut: (oEvent.keyCode == 88 ? true : false), originalEvent: oEvent })
            if (edata.isCancelled === true) return ''
            text = edata.detail.text
            return edata
        }
    }

    /**
     * Gets value to be copied to the clipboard
     * @param ind index of the record
     * @param col_ind index of the column
     * @returns the displayed value of the field's record associated with the cell
     */
    getCellCopy(ind, col_ind) {
        return w2utils.stripTags(this.getCellHTML(ind, col_ind))
    }

    paste(text, event) {
        let sel = this.getSelection()
        let ind = this.get(sel[0].recid, true)
        let col = sel[0].column
        // before event
        let edata = this.trigger('paste', { target: this.name, text: text, index: ind, column: col, originalEvent: event })
        if (edata.isCancelled === true) return
        text = edata.detail.text
        // default action
        if (this.selectType == 'row' || sel.length === 0) {
            console.log('ERROR: You can paste only if grid.selectType = \'cell\' and when at least one cell selected.')
            // event after
            edata.finish()
            return
        }
        if (typeof text !== 'object') {
            let newSel = []
            text = text.split('\n')
            for (let t = 0; t < text.length; t++) {
                let tmp  = text[t].split('\t')
                let cnt  = 0
                let rec  = this.records[ind]
                let cols = []
                if (rec == null) continue
                for (let dt = 0; dt < tmp.length; dt++) {
                    if (!this.columns[col + cnt]) continue
                    setCellPaste(rec, this.columns[col + cnt].field, tmp[dt])
                    cols.push(col + cnt)
                    cnt++
                }
                for (let c = 0; c < cols.length; c++) newSel.push({ recid: rec.recid, column: cols[c] })
                ind++
            }
            this.selectNone(true) // no need to trigger select event
            this.select(newSel)
        } else {
            this.selectNone(true) // no need to trigger select event
            this.select([{ recid: this.records[ind], column: col }])
        }
        this.refresh()
        // event after
        edata.finish()

        function setCellPaste(rec, field, paste) {
            rec.w2ui = rec.w2ui ?? {}
            rec.w2ui.changes = rec.w2ui.changes || {}
            rec.w2ui.changes[field] = paste
        }
    }

    // ==================================================
    // --- Common functions

    resize() {
        let time = Date.now()
        // make sure the box is right
        if (!this.box || query(this.box).attr('name') != this.name) return
        // event before
        let edata = this.trigger('resize', { target: this.name })
        if (edata.isCancelled === true) return
        // resize
        if (this.box != null) {
            this.resizeBoxes()
            this.resizeRecords()
        }
        // event after
        edata.finish()
        return Date.now() - time
    }

    update({ cells, fullCellRefresh, ignoreColumns } = {}) {
        let time = Date.now()
        let self = this
        if (this.box == null) return 0
        if (Array.isArray(cells)) {
            for (let i = 0; i < cells.length; i++) {
                let index  = cells[i].index
                let column = cells[i].column
                if (index < 0) continue
                if (index == null || column == null) {
                    console.log('ERROR: Wrong argument for grid.update({ cells }), cells should be [{ index: X, column: Y }, ...]')
                    continue
                }
                let rec  = this.records[index] ?? {}
                rec.w2ui = rec.w2ui ?? {}
                rec.w2ui._update = rec.w2ui._update ?? { cells: [] }
                let row1 = rec.w2ui._update.row1
                let row2 = rec.w2ui._update.row2
                if (row1 == null || !row1.isConnected || row2 == null || !row2.isColSelected) {
                    row1 = this.box.querySelector(`#grid_${this.name}_rec_${w2utils.escapeId(rec.recid)}`)
                    row2 = this.box.querySelector(`#grid_${this.name}_frec_${w2utils.escapeId(rec.recid)}`)
                    rec.w2ui._update.row1 = row1
                    rec.w2ui._update.row2 = row2
                }
                _update(rec, row1, row2, index, column)
            }
        } else {
            for (let i = this.last.vscroll.recIndStart - 1; i <= this.last.vscroll.recIndEnd; i++) {
                let index = i
                if (this.last.searchIds.length > 0) { // if search is applied
                    index = this.last.searchIds[i]
                } else {
                    index = i
                }
                let rec = this.records[index]
                if (index < 0 || rec == null) continue
                rec.w2ui = rec.w2ui ?? {}
                rec.w2ui._update = rec.w2ui._update ?? { cells: [] }
                let row1 = rec.w2ui._update.row1
                let row2 = rec.w2ui._update.row2
                if (row1 == null || !row1.isConnected || row2 == null || !row2.isColSelected) {
                    row1 = this.box.querySelector(`#grid_${this.name}_rec_${w2utils.escapeId(rec.recid)}`)
                    row2 = this.box.querySelector(`#grid_${this.name}_frec_${w2utils.escapeId(rec.recid)}`)
                    rec.w2ui._update.row1 = row1
                    rec.w2ui._update.row2 = row2
                }
                for (let column = 0; column < this.columns.length; column++) {
                    _update(rec, row1, row2, index, column)
                }
            }
        }
        return Date.now() - time

        function _update(rec, row1, row2, index, column) {
            let pcol = self.columns[column]
            if (Array.isArray(ignoreColumns) && (ignoreColumns.includes(column) || ignoreColumns.includes(pcol.field))) {
                return
            }
            let cell = rec.w2ui._update.cells[column]
            if (cell == null || !cell.isConnected) {
                cell = self.box.querySelector(`#grid_${self.name}_data_${index}_${column}`)
                rec.w2ui._update.cells[column] = cell
            }
            if (cell == null) return
            if (fullCellRefresh) {
                query(cell).replace(self.getCellHTML(index, column, false))
                // need to reselect as it was replaced
                cell = self.box.querySelector(`#grid_${self.name}_data_${index}_${column}`)
                rec.w2ui._update.cells[column] = cell
            } else {
                let div = cell.children[0] // there is always a div inside a cell
                // value, attr, style, className, divAttr -- all on TD level except divAttr
                let { value, style, className } = self.getCellValue(index, column, false, true)
                if (div.innerHTML != value) {
                    div.innerHTML = value
                }
                if (style != '' && cell.style.cssText != style) {
                    cell.style.cssText = style
                }
                if (className != '') {
                    let ignore = ['w2ui-grid-data']
                    let remove = []
                    let add = className.split(' ').filter(cl => !!cl) // remove empty
                    cell.classList.forEach(cl => { if (!ignore.includes(cl)) remove.push(cl)})
                    cell.classList.remove(...remove)
                    cell.classList.add(...add)
                }
            }
            // column styles if any (lower priority)
            if (self.columns[column].style && self.columns[column].style != cell.style.cssText) {
                cell.style.cssText = self.columns[column].style ?? ''
            }
            // record class if any
            if (rec.w2ui.class != null) {
                if (typeof rec.w2ui.class == 'string') {
                    let ignore = ['w2ui-odd', 'w2ui-even', 'w2ui-record']
                    let remove = []
                    let add = rec.w2ui.class.split(' ').filter(cl => !!cl) // remove empty
                    if (row1 && row2) {
                        row1.classList.forEach(cl => { if (!ignore.includes(cl)) remove.push(cl)})
                        row1.classList.remove(...remove)
                        row1.classList.add(...add)
                        row2.classList.remove(...remove)
                        row2.classList.add(...add)
                    }
                }
                if (w2utils.isPlainObject(rec.w2ui.class) && typeof rec.w2ui.class[pcol.field] == 'string') {
                    let ignore = ['w2ui-grid-data']
                    let remove = []
                    let add = rec.w2ui.class[pcol.field].split(' ').filter(cl => !!cl)
                    cell.classList.forEach(cl => { if (!ignore.includes(cl)) remove.push(cl)})
                    cell.classList.remove(...remove)
                    cell.classList.add(...add)
                }
            }
            // record styles if any
            if (rec.w2ui.style != null) {
                if (row1 && row2 && typeof rec.w2ui.style == 'string' && row1.style.cssText !== rec.w2ui.style) {
                    row1.style.cssText = 'height: '+ self.recordHeight + 'px;' + rec.w2ui.style
                    row1.setAttribute('custom_style', rec.w2ui.style)
                    row2.style.cssText = 'height: '+ self.recordHeight + 'px;' + rec.w2ui.style
                    row2.setAttribute('custom_style', rec.w2ui.style)
                }
                if (w2utils.isPlainObject(rec.w2ui.style) && typeof rec.w2ui.style[pcol.field] == 'string'
                        && cell.style.cssText !== rec.w2ui.style[pcol.field]) {
                    cell.style.cssText = rec.w2ui.style[pcol.field]
                }
            }
        }
    }

    refreshCell(recid, field) {
        let index = this.get(recid, true)
        let col_ind = this.getColumn(field, true)
        let isSummary = (this.records[index] && this.records[index].recid == recid ? false : true)
        let cell = query(this.box).find(`${isSummary ? '.w2ui-grid-summary ' : ''}#grid_${this.name}_data_${index}_${col_ind}`)
        if (cell.length == 0) return false
        // set cell html and changed flag
        cell.replace(this.getCellHTML(index, col_ind, isSummary))
        return true
    }

    refreshRow(recid, ind = null) {
        let tr1 = query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
        let tr2 = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
        if (tr1.length > 0) {
            if (ind == null) ind = this.get(recid, true)
            let line = tr1.attr('line')
            let isSummary = (this.records[ind] && this.records[ind].recid == recid ? false : true)
            // if it is searched, find index in search array
            let url = (typeof this.url != 'object' ? this.url : this.url.get)
            if (this.searchData.length > 0 && !url) for (let s = 0; s < this.last.searchIds.length; s++) if (this.last.searchIds[s] == ind) ind = s
            let rec_html = this.getRecordHTML(ind, line, isSummary)
            tr1.replace(rec_html[0])
            tr2.replace(rec_html[1])
            // apply style to row if it was changed in render functions
            let st = (this.records[ind].w2ui ? this.records[ind].w2ui.style : '')
            if (typeof st == 'string') {
                tr1 = query(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
                tr2 = query(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
                tr1.attr('custom_style', st)
                tr2.attr('custom_style', st)
                if (tr1.hasClass('w2ui-selected')) {
                    st = st.replace('background-color', 'none')
                }
                tr1[0].style.cssText = 'height: '+ this.recordHeight + 'px;' + st
                tr2[0].style.cssText = 'height: '+ this.recordHeight + 'px;' + st
            }
            if (isSummary) {
                this.resize()
            }
            return true
        }
        return false
    }

    refresh() {
        let time = Date.now()
        let url  = (typeof this.url != 'object' ? this.url : this.url.get)
        if (this.total <= 0 && !url && this.searchData.length === 0) {
            this.total = this.records.length
        }
        if (!this.box) return
        // event before
        let edata = this.trigger('refresh', { target: this.name })
        if (edata.isCancelled === true) return
        // -- header
        if (this.show.header) {
            query(this.box).find(`#grid_${this.name}_header`).html(w2utils.lang(this.header) +'&#160;').show()
        } else {
            query(this.box).find(`#grid_${this.name}_header`).hide()
        }
        // -- toolbar
        if (this.show.toolbar) {
            query(this.box).find('#grid_'+ this.name +'_toolbar').show()
        } else {
            query(this.box).find('#grid_'+ this.name +'_toolbar').hide()
        }
        // -- make sure search is closed
        this.searchClose()
        // search placeholder
        let sInput = query(this.box).find('#grid_'+ this.name +'_search_all')
        if (!this.multiSearch && this.last.field == 'all' && this.searches.length > 0) {
            this.last.field = this.searches[0].field
            this.last.label = this.searches[0].label
        }
        for (let s = 0; s < this.searches.length; s++) {
            if (this.searches[s].field == this.last.field) this.last.label = this.searches[s].label
        }
        if (this.last.multi) {
            sInput.attr('placeholder', '[' + w2utils.lang('Multiple Fields') + ']')
        } else {
            sInput.attr('placeholder', w2utils.lang('Search') + ' ' + w2utils.lang(this.last.label, true))
        }
        if (sInput.val() != this.last.search) {
            let val = this.last.search
            let tmp = sInput._w2field
            if (tmp) val = tmp.format(val)
            sInput.val(val)
        }

        this.refreshSearch()
        this.refreshBody()

        // -- footer
        if (this.show.footer) {
            query(this.box).find(`#grid_${this.name}_footer`).html(this.getFooterHTML()).show()
        } else {
            query(this.box).find(`#grid_${this.name}_footer`).hide()
        }
        // all selected?
        let sel = this.last.selection,
            areAllSelected = (this.records.length > 0 && sel.indexes.length == this.records.length),
            areAllSearchedSelected = (sel.indexes.length > 0 && this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)
        if (areAllSelected || areAllSearchedSelected) {
            query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', true)
        } else {
            query(this.box).find('#grid_'+ this.name +'_check_all').prop('checked', false)
        }
        // show number of selected
        this.status()
        // collapse all records
        let rows = this.find({ 'w2ui.expanded': true }, true, true)
        for (let r = 0; r < rows.length; r++) {
            let tmp = this.records[rows[r]].w2ui
            if (tmp && !Array.isArray(tmp.children)) {
                tmp.expanded = false
            }
        }
        // mark selection
        if (this.markSearch) {
            setTimeout(() => {
                // mark all search strings
                let search = []
                for (let s = 0; s < this.searchData.length; s++) {
                    let sdata = this.searchData[s]
                    let fld   = this.getSearch(sdata.field)
                    if (!fld || fld.hidden) continue
                    let ind = this.getColumn(sdata.field, true)
                    search.push({ field: sdata.field, search: sdata.value, col: ind })
                }
                if (search.length > 0) {
                    search.forEach((item) => {
                        let el = query(this.box).find('td[col="'+ item.col +'"]:not(.w2ui-head)')
                        w2utils.marker(el, item.search)
                    })
                }
            }, 50)
        }
        this.updateToolbar(this.last.selection)
        // event after
        edata.finish()
        this.resize()
        this.addRange('selection')
        setTimeout(() => { // allow to render first
            this.resize() // needed for horizontal scroll to show (do not remove)
            this.scroll()
        }, 1)

        if (this.reorderColumns && !this.last.columnDrag) {
            this.last.columnDrag = this.initColumnDrag()
        } else if (!this.reorderColumns && this.last.columnDrag) {
            this.last.columnDrag.remove()
        }
        return Date.now() - time
    }

    refreshSearch() {
        if (this.multiSearch && this.searchData.length > 0) {
            if (query(this.box).find('.w2ui-grid-searches').length == 0) {
                query(this.box).find('.w2ui-grid-toolbar')
                    .css('height', (this.last.toolbar_height + 35) + 'px')
                    .append(`<div id="grid_${this.name}_searches" class="w2ui-grid-searches"></div>`)

            }
            let searches = `
                <span id="grid_${this.name}_search_logic" class="w2ui-grid-search-logic"></span>
                <div class="grid-search-line"></div>`
            this.searchData.forEach((sd, sd_ind) => {
                let ind = this.getSearch(sd.field, true)
                let sf = this.searches[ind]
                let display
                if (sf?.type == 'enum' && Array.isArray(sd.value)) {
                    display = `<span class="grid-search-count">${sd.value.length}</span>`
                } else if (sf?.type == 'list') {
                    display = !!sd.text && sd.text !== sd.value ? `: ${sd.text}` : `: ${sd.value}`
                } else {
                    display = `: ${sd.value}`
                }
                if (sf && sf.type == 'date') {
                    if (sd.operator == 'between') {
                        let dsp1 = sd.value[0]
                        let dsp2 = sd.value[1]
                        if (Number(dsp1) === dsp1) {
                            dsp1 = w2utils.formatDate(dsp1)
                        }
                        if (Number(dsp2) === dsp2) {
                            dsp2 = w2utils.formatDate(dsp2)
                        }
                        display = `: ${dsp1} - ${dsp2}`
                    } else {
                        let dsp = sd.value
                        if (Number(dsp) == dsp) {
                            dsp = w2utils.formatDate(dsp)
                        }
                        let oper = sd.operator
                        if (oper == 'more') oper = 'since'
                        if (oper == 'less') oper = 'before'
                        if (oper.substr(0, 5) == 'more:') {
                            oper = 'since'
                        }
                        display = `: ${oper} ${dsp}`
                    }
                }
                searches += `<span class="w2ui-action" data-click="searchFieldTooltip|${ind}|${sd_ind}|this">
                    ${sf ? (sf.label ?? sf.field) : sd.field}
                    ${display}
                    <span class="icon-chevron-down"></span>
                </span>`
            })
            // clear and save
            searches += `
                ${this.show.searchSave
                    ? `<div class="grid-search-line"></div>
                       <button class="w2ui-btn grid-search-btn" data-click="searchSave">${w2utils.lang('Save')}</button>
                      `
                    : ''
                }
                <button class="w2ui-btn grid-search-btn btn-remove"
                    data-click="searchReset">X</button>
            `
            query(this.box).find(`#grid_${this.name}_searches`).html(searches)
            query(this.box).find(`#grid_${this.name}_search_logic`).html(w2utils.lang(this.last.logic == 'AND' ? 'All' : 'Any'))
        } else {
            query(this.box).find('.w2ui-grid-toolbar')
                .css('height', this.last.toolbar_height + 'px')
                .find('.w2ui-grid-searches')
                .remove()
        }
        if (this.searchSelected) {
            query(this.box).find(`#grid_${this.name}_search_all`).val(' ').prop('readOnly', true)
            query(this.box).find(`#grid_${this.name}_search_name`).show().find('.name-text').html(this.searchSelected.text)
        } else {
            query(this.box).find(`#grid_${this.name}_search_all`).prop('readOnly', false)
            query(this.box).find(`#grid_${this.name}_search_name`).hide().find('.name-text').html('')
        }
        w2utils.bindEvents(query(this.box).find(`#grid_${this.name}_searches .w2ui-action, #grid_${this.name}_searches button`), this)
    }

    refreshBody() {
        this.scroll() // need to calculate virtual scrolling for columns
        let recHTML  = this.getRecordsHTML()
        let colHTML  = this.getColumnsHTML()
        let bodyHTML =
            '<div id="grid_'+ this.name +'_frecords" class="w2ui-grid-frecords" style="margin-bottom: '+ (w2utils.scrollBarSize() - 1) +'px;">'+
                recHTML[0] +
            '</div>'+
            '<div id="grid_'+ this.name +'_records" class="w2ui-grid-records">' +
                recHTML[1] +
            '</div>'+
            '<div id="grid_'+ this.name +'_scroll1" class="w2ui-grid-scroll1" style="height: '+ w2utils.scrollBarSize() +'px"></div>'+
            // Columns need to be after to be able to overlap
            '<div id="grid_'+ this.name +'_fcolumns" class="w2ui-grid-fcolumns">'+
            '    <table><tbody>'+ colHTML[0] +'</tbody></table>'+
            '</div>'+
            '<div id="grid_'+ this.name +'_columns" class="w2ui-grid-columns">'+
            '    <table><tbody>'+ colHTML[1] +'</tbody></table>'+
            '</div>'+
            `<div class="w2ui-intersection-marker" style="display: none; height: ${this.recordHeight - 5}px">
               <div class="top-marker"></div>
               <div class="bottom-marker"></div>
            </div>`

        let gridBody = query(this.box).find(`#grid_${this.name}_body`, this.box).html(bodyHTML)
        let records  = query(this.box).find(`#grid_${this.name}_records`, this.box)
        let frecords = query(this.box).find(`#grid_${this.name}_frecords`, this.box)
        if (this.selectType == 'row') {
            records.on('mouseover mouseout', { delegate: 'tr' }, (event) => {
                let ind = query(event.delegate).attr('index') // don't read recid directly as it could be a number or a string
                let recid = this.records[ind]?.recid
                query(this.box).find(`#grid_${this.name}_frec_${w2utils.escapeId(recid)}`)
                    .toggleClass('w2ui-record-hover', event.type == 'mouseover')
            })
            frecords.on('mouseover mouseout', { delegate: 'tr' }, (event) => {
                let ind = query(event.delegate).attr('index') // don't read recid directly as it could be a number or a string
                let recid = this.records[ind]?.recid
                query(this.box).find(`#grid_${this.name}_rec_${w2utils.escapeId(recid)}`)
                    .toggleClass('w2ui-record-hover', event.type == 'mouseover')
            })
        }
        if (w2utils.isMobile) {
            records.append(frecords)
                .on('click', { delegate: 'tr' }, (event) => {
                    let index = query(event.delegate).attr('index') // don't read recid directly as it could be a number or a string
                    let recid = this.records[index]?.recid
                    this.dblClick(recid, event)
                })
        } else {
            records.add(frecords)
                .on('click', { delegate: 'tr' }, (event) => {
                    let index = query(event.delegate).attr('index') // don't read recid directly as it could be a number or a string
                    let recid = this.records[index]?.recid
                    // do not generate click if empty record is clicked
                    if (recid != '-none-') {
                        this.click(recid, event)
                    }
                })
                .on('contextmenu', { delegate: 'tr' }, (event) => {
                    let index = query(event.delegate).attr('index') // don't read recid directly as it could be a number or a string
                    let recid = this.records[index]?.recid
                    let td = query(event.target).closest('td')
                    let column = td.attr('col') ? parseInt(td.attr('col')) : null
                    this.showContextMenu(recid, column, event)
                })
                .on('mouseover', { delegate: 'tr' }, (event) => {
                    this.last.rec_out = false
                    let index = query(event.delegate).attr('index') // don't read recid directly as it could be a number or a string
                    let recid = this.records[index]?.recid
                    if (index !== this.last.rec_over) {
                        this.last.rec_over = index
                        // setTimeout is needed for correct event order enter/leave
                        setTimeout(() => {
                            delete this.last.rec_out
                            let edata = this.trigger('mouseEnter', { target: this.name, originalEvent: event, index, recid })
                            edata.finish()
                        })
                    }
                })
                .on('mouseout', { delegate: 'tr' }, (event) => {
                    let index = query(event.delegate).attr('index') // don't read recid directly as it could be a number or a string
                    let recid = this.records[index]?.recid
                    this.last.rec_out = true
                    // setTimeouts are needed for correct event order enter/leave
                    setTimeout(() => {
                        let recLeave = () => {
                            let edata = this.trigger('mouseLeave', { target: this.name, originalEvent: event, index, recid })
                            edata.finish()
                        }
                        if (index !== this.last.rec_over) {
                            recLeave()
                        }
                        setTimeout(() => {
                            if (this.last.rec_out) {
                                delete this.last.rec_out
                                delete this.last.rec_over
                                recLeave()
                            }
                        })
                    })
                })
        }

        // enable scrolling on frozen records,
        gridBody
            .data('scroll', { lastDelta: 0, lastTime: 0 })
            .find('.w2ui-grid-frecords')
            .on('mousewheel DOMMouseScroll ', (event) => {
                event.preventDefault()
                // TODO: improve, scroll is not smooth, if scrolled to the end, it takes a while to return
                let scroll = gridBody.data('scroll')
                let container = gridBody.find('.w2ui-grid-records')
                let amount = typeof event.wheelDelta != "undefined" ? -event.wheelDelta : (event.detail || event.deltaY)
                let newScrollTop = container.prop('scrollTop')

                scroll.lastDelta += amount
                amount = Math.round(scroll.lastDelta)
                gridBody.data('scroll', scroll)

                // make scroll amount dependent on visible rows
                // amount *= (Math.round(records.prop('clientHeight') / self.recordHeight) - 1) * self.recordHeight / 4
                container.get(0).scroll({ top: newScrollTop + amount, behavior: 'smooth' })
            })
        // scroll on records (and frozen records)
        records.off('.body-global')
            .on('scroll.body-global', { delegate: '.w2ui-grid-records' }, event => {
                this.scroll(event)
            })

        query(this.box).find('.w2ui-grid-body') // gridBody
            .off('.body-global')
            // header column click
            .on('click.body-global dblclick.body-global contextmenu.body-global', { delegate: 'td.w2ui-head' }, event => {
                let col_ind = query(event.delegate).attr('col')
                let col = this.columns[col_ind] ?? { field: col_ind } // it could be line number
                switch (event.type) {
                    case 'click':
                        this.columnClick(col.field, event)
                        break
                    case 'dblclick':
                        this.columnDblClick(col.field, event)
                        break
                    case 'contextmenu':
                        this.columnContextMenu(col.field, event)
                        break

                }
            })
            .on('mouseover.body-global', { delegate: '.w2ui-col-header' }, event => {
                let col = query(event.delegate).parent().attr('col')
                this.columnTooltipShow(col, event)
                query(event.delegate)
                    .off('.tooltip')
                    .on('mouseleave.tooltip', () => {
                        this.columnTooltipHide(col, event)
                    })
            })
            // select all
            .on('click.body-global', { delegate: 'input.w2ui-select-all' }, event => {
                if (event.delegate.checked) { this.selectAll() } else { this.selectNone() }
                event.stopPropagation()
                clearTimeout(this.last.kbd_timer) // keep grid in focus
            })
            // tree-like grid (or expandable column) expand/collapse
            .on('click.body-global', { delegate: '.w2ui-show-children, .w2ui-col-expand' }, event => {
                event.stopPropagation()
                let ind = query(event.target).parents('tr').attr('index')
                this.toggle(this.records[ind].recid)
            })
            // info bubbles
            .on('click.body-global mouseover.body-global', { delegate: '.w2ui-info' }, event => {
                let td = query(event.delegate).closest('td')
                let tr = td.parent()
                let col = this.columns[td.attr('col')]
                let isSummary = tr.parents('.w2ui-grid-body').hasClass('w2ui-grid-summary')
                if (['mouseenter', 'mouseover'].includes(col.info?.showOn?.toLowerCase()) && event.type == 'mouseover') {
                    this.showBubble(tr.attr('index'), td.attr('col'), isSummary)
                        .then(() => {
                            query(event.delegate)
                                .off('.tooltip')
                                .on('mouseleave.tooltip', () => { w2tooltip.hide(this.name + '-bubble') })
                        })
                } else if (event.type == 'click') {
                    w2tooltip.hide(this.name + '-bubble')
                    this.showBubble(tr.attr('index'), td.attr('col'), isSummary)
                }
            })
            // clipborad copy icon
            .on('mouseover.body-global', { delegate: '.w2ui-clipboard-copy' }, event => {
                if (event.delegate._tooltipShow) return
                let td = query(event.delegate).parent()
                let tr = td.parent()
                let col = this.columns[td.attr('col')]
                let isSummary = tr.parents('.w2ui-grid-body').hasClass('w2ui-grid-summary')

                w2tooltip.show({
                    name: this.name + '-bubble',
                    anchor: event.delegate,
                    html: w2utils.lang(typeof col.clipboardCopy == 'string' ? col.clipboardCopy : 'Copy to clipboard'),
                    position: 'top|bottom',
                    offsetY: -2
                })
                .hide(evt => {
                    event.delegate._tooltipShow = false
                    query(event.delegate).off('.tooltip')
                })

                query(event.delegate)
                    .off('.tooltip')
                    .on('mouseleave.tooltip', evt => {
                        w2tooltip.hide(this.name + '-bubble')
                    })
                    .on('click.tooltip', evt => {
                        evt.stopPropagation()
                        w2tooltip.update(this.name + '-bubble', w2utils.lang('Copied'))
                        this.clipboardCopy(tr.attr('index'), td.attr('col'), isSummary)
                    })
                event.delegate._tooltipShow = true
            })
            .on('click.body-global', { delegate: '.w2ui-editable-checkbox' }, event => {
                let dt = query(event.delegate).data()
                this.editChange.call(this, event.delegate, dt.changeind, dt.colind, event)
                this.updateToolbar()
            })

        // show empty message
        if (this.records.length === 0 && this.msgEmpty) {
            query(this.box).find(`#grid_${this.name}_body`)
                .append(`<div id="grid_${this.name}_empty_msg" class="w2ui-grid-empty-msg"><div>${w2utils.lang(this.msgEmpty)}</div></div>`)
        } else if (query(this.box).find(`#grid_${this.name}_empty_msg`).length > 0) {
            query(this.box).find(`#grid_${this.name}_empty_msg`).remove()
        }
        // show summary records
        if (this.summary.length > 0) {
            let sumHTML = this.getSummaryHTML()
            query(this.box).find(`#grid_${this.name}_fsummary`).html(sumHTML[0]).show()
            query(this.box).find(`#grid_${this.name}_summary`).html(sumHTML[1]).show()
        } else {
            query(this.box).find(`#grid_${this.name}_fsummary`).hide()
            query(this.box).find(`#grid_${this.name}_summary`).hide()
        }
    }

    render(box) {
        let time = Date.now()
        let obj  = this
        if (typeof box == 'string') box = query(box).get(0)
        // event before
        let edata = this.trigger('render', { target: this.name, box: box ?? this.box })
        if (edata.isCancelled === true) return
        // default action
        if (box != null) {
            this.unmount() // clean previous control
            this.box = box
        }
        if (!this.box) return
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        // reset needed if grid existed
        this.reset(true)
        // --- default search field
        if (!this.last.field) {
            if (!this.multiSearch || !this.show.searchAll) {
                let tmp = 0
                while (tmp < this.searches.length && (this.searches[tmp].hidden || this.searches[tmp].simple === false)) tmp++
                if (tmp >= this.searches.length) {
                    // all searches are hidden
                    this.last.field = ''
                    this.last.label = ''
                } else {
                    this.last.field = this.searches[tmp].field
                    this.last.label = this.searches[tmp].label
                }
            } else {
                this.last.field = 'all'
                this.last.label = 'All Fields'
            }
        }
        // insert elements
        query(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-grid w2ui-inactive')
            .html('<div class="w2ui-grid-box">'+
                  '    <div id="grid_'+ this.name +'_header" class="w2ui-grid-header"></div>'+
                  '    <div id="grid_'+ this.name +'_toolbar" class="w2ui-grid-toolbar"></div>'+
                  '    <div id="grid_'+ this.name +'_body" class="w2ui-grid-body"></div>'+
                  '    <div id="grid_'+ this.name +'_fsummary" class="w2ui-grid-body w2ui-grid-summary"></div>'+
                  '    <div id="grid_'+ this.name +'_summary" class="w2ui-grid-body w2ui-grid-summary"></div>'+
                  '    <div id="grid_'+ this.name +'_footer" class="w2ui-grid-footer"></div>'+
                  '    <textarea id="grid_'+ this.name +'_focus" class="w2ui-grid-focus-input" '+
                            (this.tabIndex ? 'tabindex="' + this.tabIndex + '"' : '')+
                            (w2utils.isMobile ? 'readonly' : '') +'></textarea>'+ // readonly needed on android not to open keyboard
                  '</div>')
        if (this.selectType != 'row') query(this.box).addClass('w2ui-ss')
        if (query(this.box).length > 0) query(this.box)[0].style.cssText += this.style
        // render toolbar
        let tb_box = query(this.box).find(`#grid_${this.name}_toolbar`)
        if (this.toolbar != null) this.toolbar.render(tb_box[0])
        this.last.toolbar_height = tb_box.prop('offsetHeight')
        // re-init search_all
        if (this.last.field && this.last.field != 'all') {
            let sd = this.searchData
            setTimeout(() => { this.searchInitInput(this.last.field, (sd.length == 1 ? sd[0].value : null)) }, 1)
        }
        // init footer
        query(this.box).find(`#grid_${this.name}_footer`).html(this.getFooterHTML())
        // refresh
        if (!this.last.state) this.last.state = this.stateSave(true) // initial default state
        this.stateRestore()
        if (url) { this.clear(); this.refresh() } // show empty grid (need it) - should it be only for remote data source
        // if hidden searches - apply it
        let hasHiddenSearches = false
        for (let i = 0; i < this.searches.length; i++) {
            if (this.searches[i].hidden) { hasHiddenSearches = true; break }
        }
        if (hasHiddenSearches) {
            this.searchReset(false) // will call reload
            if (!url) setTimeout(() => { this.searchReset() }, 1)
        } else {
            this.reload()
        }
        // focus
        query(this.box).find(`#grid_${this.name}_focus`)
            .on('focus', (event) => {
                clearTimeout(this.last.kbd_timer)
                if (!this.hasFocus) this.focus()
            })
            .on('blur', (event) => {
                clearTimeout(this.last.kbd_timer)
                this.last.kbd_timer = setTimeout(() => {
                    if (this.hasFocus) { this.blur() }
                }, 100) // need this timer to be 100 ms
            })
            .on('paste', (event) => {
                let cd = (event.clipboardData ? event.clipboardData : null)
                if (cd) {
                    let items = cd.items
                    if (items.length == 2) {
                        if (items.length == 2 && items[1].kind == 'file') {
                            items = [items[1]]
                        }
                        if (items.length == 2 && items[0].type == 'text/plain' && items[1].type == 'text/html') {
                            items = [items[1]]
                        }
                    }
                    let items2send = []
                    // might contain data in different formats, but it is a single paste
                    for (let index in items) {
                        let item = items[index]
                        if (item.kind === 'file') {
                            let file = item.getAsFile()
                            items2send.push({ kind: 'file', data: file })
                        } else if (item.kind === 'string' && (item.type === 'text/plain' || item.type === 'text/html')) {
                            event.preventDefault()
                            let text = cd.getData('text/plain')
                            if (text.indexOf('\r') != -1 && text.indexOf('\n') == -1) {
                                text = text.replace(/\r/g, '\n')
                            }
                            items2send.push({ kind: (item.type == 'text/html' ? 'html' : 'text'), data: text })
                        }
                    }
                    if (items2send.length === 1 && items2send[0].kind != 'file') {
                        items2send = items2send[0].data
                    }
                    w2ui[this.name].paste(items2send, event)
                    event.preventDefault()
                }
            })
            .on('keydown', function (event) {
                w2ui[obj.name].keydown.call(w2ui[obj.name], event)
            })
        // init mouse events for mouse selection
        let edataCol // event for column select
        query(this.box).off('mousedown.mouseStart').on('mousedown.mouseStart', mouseStart)
        this.updateToolbar()
        // event after
        edata.finish()
        // observe div resize
        this.last.observeResize = new ResizeObserver(() => {
            this.resize()
            this.scroll()
        })
        this.last.observeResize.observe(this.box)
        return Date.now() - time

        function mouseStart(event) {
            if (event.which != 1) return // if not left mouse button
            // restore css user-select
            if (obj.last.userSelect == 'text') {
                obj.last.userSelect = ''
                query(obj.box).find('.w2ui-grid-body').css('user-select', 'none')
            }
            // regular record select
            if (obj.selectType == 'row' && (query(event.target).parents().hasClass('w2ui-head') || query(event.target).hasClass('w2ui-head'))) return
            if (obj.last.move && obj.last.move.type == 'expand') return
            // if altKey - alow text selection
            if (event.altKey) {
                query(obj.box).find('.w2ui-grid-body').css('user-select', 'text')
                obj.selectNone()
                obj.last.move = { type: 'text-select' }
                obj.last.userSelect = 'text'
            } else {
                let tmp  = event.target
                let pos  = {
                    x: event.offsetX - 10,
                    y: event.offsetY - 10
                }
                let tmps = false
                while (tmp) {
                    if (tmp.classList && tmp.classList.contains('w2ui-grid')) break
                    if (tmp.tagName && tmp.tagName.toUpperCase() == 'TD') tmps = true
                    if (tmp.tagName && tmp.tagName.toUpperCase() != 'TR' && tmps == true) {
                        pos.x += tmp.offsetLeft
                        pos.y += tmp.offsetTop
                    }
                    tmp = tmp.parentNode
                }
                let index = query(event.target).parents('tr').attr('index')
                let recid = obj.records[index]?.recid

                // if cell selection, on initial click start selection
                if (obj.selectType == 'cell' && !event.shiftKey) {
                    let column1 = parseInt(query(event.target).closest('td').attr('col'))
                    let column2 = column1
                    if (isNaN(column1)) {
                        column1 = 0
                        column2 = obj.columns.length - 1
                    }
                    obj.addRange({
                        name: 'selection-preview',
                        range: [{ recid, column: column1 }, { recid, column: column2 }],
                        class: 'w2ui-selection-preview'
                    })
                }

                obj.last.move = {
                    x      : event.screenX,
                    y      : event.screenY,
                    divX   : 0,
                    divY   : 0,
                    focusX : pos.x,
                    focusY : pos.y,
                    recid  : recid,
                    column : parseInt(event.target.tagName.toUpperCase() == 'TD' ? query(event.target).attr('col') : query(event.target).parents('td').attr('col')),
                    type   : 'select',
                    ghost  : false,
                    start  : true
                }
                if (obj.last.move.recid == null && obj.records.length > 0) {
                    obj.last.move.type = 'select-column'
                    let column = parseInt(query(event.target).closest('td').attr('col'))
                    let start = obj.records[0].recid
                    let end = obj.records[obj.records.length - 1].recid
                    obj.addRange({
                        name: 'selection-preview',
                        range: [{ recid: start, column }, { recid: end, column }],
                        class: 'w2ui-selection-preview'
                    })
                }
                // set focus to grid
                let target = event.target
                let $input = query(obj.box).find('#grid_'+ obj.name + '_focus')
                // move input next to cursor so screen does not jump
                if (obj.last.move) {
                    let sLeft  = obj.last.move.focusX
                    let sTop   = obj.last.move.focusY
                    let $owner = query(target).parents('table').parent()
                    if ($owner.hasClass('w2ui-grid-records') || $owner.hasClass('w2ui-grid-frecords')
                            || $owner.hasClass('w2ui-grid-columns') || $owner.hasClass('w2ui-grid-fcolumns')
                            || $owner.hasClass('w2ui-grid-summary')) {
                        sLeft = obj.last.move.focusX - query(obj.box).find('#grid_'+ obj.name +'_records').prop('scrollLeft')
                        sTop  = obj.last.move.focusY - query(obj.box).find('#grid_'+ obj.name +'_records').prop('scrollTop')
                    }
                    if (query(target).hasClass('w2ui-grid-footer') || query(target).parents('div.w2ui-grid-footer').length > 0) {
                        sTop = query(obj.box).find('#grid_'+ obj.name +'_footer').get(0).offsetTop
                    }
                    // if clicked on toolbar
                    if ($owner.hasClass('w2ui-scroll-wrapper') && $owner.parent().hasClass('w2ui-toolbar')) {
                        sLeft = obj.last.move.focusX - $owner.prop('scrollLeft')
                    }
                    $input.css({
                        left: sLeft - 10,
                        top : sTop
                    })
                }
                // if toolbar input is clicked
                setTimeout(() => {
                    if (!obj.last.inEditMode) {
                        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                            target.focus()
                        } else {
                            if ($input.get(0) !== document.active) $input.get(0)?.focus({ preventScroll: true })
                        }
                    }
                }, 50)
                // disable click select for this condition
                if (!obj.multiSelect && !obj.reorderRows && obj.last.move.type == 'drag') {
                    delete obj.last.move
                }
            }
            if (obj.reorderRows == true) {
                let el = event.target
                if (el.tagName.toUpperCase() != 'TD') el = query(el).parents('td')[0]
                if (query(el).hasClass('w2ui-col-number') || query(el).hasClass('w2ui-col-order')) {
                    obj.selectNone()
                    obj.last.move.reorder = true
                    // suppress hover
                    let eColor = query(obj.box).find('.w2ui-even.w2ui-empty-record').css('background-color')
                    let oColor = query(obj.box).find('.w2ui-odd.w2ui-empty-record').css('background-color')
                    query(obj.box).find('.w2ui-even td').filter(':not(.w2ui-col-number)').css('background-color', eColor)
                    query(obj.box).find('.w2ui-odd td').filter(':not(.w2ui-col-number)').css('background-color', oColor)
                    // display empty record and ghost record
                    let mv = obj.last.move
                    let recs = query(obj.box).find('.w2ui-grid-records')
                    if (!mv.ghost) {
                        let row    = query(obj.box).find(`#grid_${obj.name}_rec_${mv.recid}`)
                        let tmp    = row.parents('table').find('tr:first-child').get(0).cloneNode(true)
                        mv.offsetY = event.offsetY
                        mv.from    = mv.recid
                        mv.pos     = { top: row.get(0).offsetTop-1, left: row.get(0).offsetLeft }
                        mv.ghost   = query(row.get(0).cloneNode(true))
                        mv.ghost.removeAttr('id')
                        mv.ghost.find('td').css({
                            'border-top': '1px solid silver',
                            'border-bottom': '1px solid silver'
                        })
                        row.find('td').remove()
                        row.append(`<td colspan="1000"><div class="w2ui-reorder-empty" style="height: ${(obj.recordHeight - 2)}px"></div></td>`)
                        recs.append('<div id="grid_'+ obj.name + '_ghost_line" style="position: absolute; z-index: 999999; pointer-events: none; width: 100%;"></div>')
                        recs.append('<table id="grid_'+ obj.name + '_ghost" style="position: absolute; z-index: 999998; opacity: 0.9; pointer-events: none;"></table>')
                        query(obj.box).find('#grid_'+ obj.name + '_ghost').append(tmp).append(mv.ghost)
                    }
                    let ghost = query(obj.box).find('#grid_'+ obj.name + '_ghost')
                    ghost.css({
                        top  : mv.pos.top + 'px',
                        left : mv.pos.left + 'px'
                    })
                } else {
                    obj.last.move.reorder = false
                }
            }
            query(document)
                .on('mousemove.w2ui-' + obj.name, mouseMove)
                .on('mouseup.w2ui-' + obj.name, mouseStop)
            // needed when grid grids are nested, see issue #1275
            event.stopPropagation()
        }

        function mouseMove(event) {
            if (!event.target.tagName) {
                // element has no tagName - most likely the target is the #document itself
                // this can happen is you click+drag and move the mouse out of the DOM area,
                // e.g. into the browser's toolbar area
                return
            }
            let mv = obj.last.move
            if (!mv || !['select', 'select-column'].includes(mv.type)) return
            mv.divX = (event.screenX - mv.x)
            mv.divY = (event.screenY - mv.y)
            if (Math.abs(mv.divX) <= 1 && Math.abs(mv.divY) <= 1) return // only if moved more then 1px
            obj.last.cancelClick = true
            if (obj.reorderRows == true && obj.last.move.reorder) {
                let tmp   = query(event.target).parents('tr')
                let ind  = tmp.attr('index')
                let recid = obj.records[ind]?.recid
                if (recid == '-none-' || recid == null) recid = 'bottom'
                if (recid != mv.from) {
                    // let row1 = query(obj.box).find('#grid_'+ obj.name + '_rec_'+ mv.recid)
                    let row2 = query(obj.box).find('#grid_'+ obj.name + '_rec_'+ recid)
                    query(obj.box).find('.insert-before')
                    row2.addClass('insert-before')
                    // MOVABLE GHOST
                    // if (event.screenY - mv.lastY < 0) row1.after(row2); else row2.after(row1);
                    mv.lastY = event.screenY
                    mv.to = recid
                    // line to insert before
                    let pos = { top: row2.get(0)?.offsetTop, left: row2.get(0)?.offsetLeft }
                    let ghost_line = query(obj.box).find('#grid_'+ obj.name + '_ghost_line')
                    if (pos) {
                        ghost_line.css({
                            top  : pos.top + 'px',
                            left : mv.pos.left + 'px',
                            'border-top': '2px solid #769EFC'
                        })
                    } else {
                        ghost_line.css({
                            'border-top': '2px solid transparent'
                        })
                    }
                }
                let ghost = query(obj.box).find('#grid_'+ obj.name + '_ghost')
                ghost.css({
                    top  : (mv.pos.top + mv.divY) + 'px',
                    left : mv.pos.left + 'px'
                })
                return
            }
            if (obj.selectType == 'row' && mv.start && mv.recid) {
                obj.selectNone()
                mv.start = false
            }
            let newSel = []
            let ind = (event.target.tagName.toUpperCase() == 'TR' ? query(event.target).attr('index') : query(event.target).parents('tr').attr('index'))
            let recid = obj.records[ind]?.recid
            if (recid == null) {
                // select by dragging columns
                if (obj.selectType == 'row') return
                if (obj.last.move && obj.last.move.type == 'select') return
                let col = parseInt(query(event.target).parents('td').attr('col'))
                if (isNaN(col)) {
                    obj.removeRange('column-selection')
                    query(obj.box).find('.w2ui-grid-columns .w2ui-col-header, .w2ui-grid-fcolumns .w2ui-col-header').removeClass('w2ui-col-selected')
                    query(obj.box).find('.w2ui-col-number').removeClass('w2ui-row-selected')
                    delete mv.colRange
                } else {
                    // add all columns in between
                    let newRange = col + '-' + col
                    if (mv.column < col) newRange = mv.column + '-' + col
                    if (mv.column > col) newRange = col + '-' + mv.column
                    // array of selected columns
                    let cols = []
                    let tmp  = newRange.split('-')
                    for (let ii = parseInt(tmp[0]); ii <= parseInt(tmp[1]); ii++) {
                        cols.push(ii)
                    }
                    if (mv.colRange != newRange && mv.type == 'select-column') {
                        edataCol = obj.trigger('columnSelect', { target: obj.name, columns: cols })
                        if (edataCol.isCancelled !== true) {
                            // show new range
                            mv.colRange = newRange
                            let start = obj.records[0].recid
                            let end = obj.records[obj.records.length - 1].recid
                            obj.addRange({
                                name: 'selection-preview',
                                range: [{ recid: start, column: tmp[0] }, { recid: end, column: tmp[1] }],
                                class: 'w2ui-selection-preview'
                            })
                        }
                    }
                }

            } else { // regular selection

                let ind1 = obj.get(mv.recid, true)
                // this happens when selection is started on summary row
                if (ind1 == null || (obj.records[ind1] && obj.records[ind1].recid != mv.recid)) return
                let ind2 = obj.get(recid, true)
                // this happens when selection is extended into summary row (a good place to implement scrolling)
                if (ind2 == null) return
                let col1 = parseInt(mv.column)
                let col2 = parseInt(event.target.tagName.toUpperCase() == 'TD' ? query(event.target).attr('col') : query(event.target).parents('td').attr('col'))
                if (isNaN(col1) && isNaN(col2)) { // line number select entire record
                    col1 = 0
                    col2 = obj.columns.length-1
                }
                if (ind1 > ind2) { let tmp = ind1; ind1 = ind2; ind2 = tmp }
                // check if need to refresh
                let tmp = 'ind1:'+ ind1 +',ind2;'+ ind2 +',col1:'+ col1 +',col2:'+ col2
                if (mv.range == tmp) return
                mv.range = tmp
                for (let i = ind1; i <= ind2; i++) {
                    if (obj.last.searchIds.length > 0 && obj.last.searchIds.indexOf(i) == -1) continue
                    if (obj.selectType != 'row') {
                        if (col1 > col2) { let tmp = col1; col1 = col2; col2 = tmp }
                        for (let c = col1; c <= col2; c++) {
                            if (obj.columns[c].hidden) continue
                            newSel.push({ recid: obj.records[i].recid, column: parseInt(c) })
                        }
                    } else {
                        newSel.push(obj.records[i].recid)
                    }
                }
                if (obj.selectType != 'row') {
                    let start = newSel[0]
                    let end = newSel[newSel.length - 1]
                    obj.addRange({
                        name: 'selection-preview',
                        range: [{ recid: start.recid, column: start.column }, { recid: end.recid, column: end.column }],
                        class: 'w2ui-selection-preview'
                    })
                    mv.newRange = newSel
                } else {
                    if (obj.multiSelect) {
                        let sel = obj.getSelection()
                        for (let ns = 0; ns < newSel.length; ns++) {
                            if (sel.indexOf(newSel[ns]) == -1) obj.select(newSel[ns]) // add more items
                        }
                        for (let s = 0; s < sel.length; s++) {
                            if (newSel.indexOf(sel[s]) == -1) obj.unselect(sel[s]) // remove items
                        }
                    }
                }
            }
        }

        function mouseStop(event) {
            let mv = obj.last.move
            setTimeout(() => {
                delete obj.last.cancelClick
            }, 1)
            if (query(event.target).parents().hasClass('.w2ui-head') || query(event.target).hasClass('.w2ui-head')) return
            obj.removeRange('selection-preview')
            if (mv && ['select', 'select-column'].includes(mv.type)) {
                if (mv.colRange != null && edataCol.isCancelled !== true) {
                    let tmp = mv.colRange.split('-')
                    let sel = []
                    for (let i = 0; i < obj.records.length; i++) {
                        let cols = []
                        for (let j = parseInt(tmp[0]); j <= parseInt(tmp[1]); j++) cols.push(j)
                        sel.push({ recid: obj.records[i].recid, column: cols })
                    }
                    edataCol.finish()
                    obj.selectNone(true)
                    obj.select(sel)
                } else if (mv.newRange != null) {
                    obj.selectNone(true)
                    obj.select(...mv.newRange)
                }
                if (obj.reorderRows == true && obj.last.move.reorder) {
                    if (mv.to != null) {
                        // event
                        let edata = obj.trigger('reorderRow', { target: obj.name, recid: mv.from, moveBefore: mv.to })
                        if (edata.isCancelled === true) {
                            resetRowReorder()
                            delete obj.last.move
                            return
                        }
                        // default behavior
                        let ind1 = obj.get(mv.from, true)
                        let ind2 = obj.get(mv.to, true)
                        if (mv.to == 'bottom') ind2 = obj.records.length // end of list
                        let tmp = obj.records[ind1]
                        // swap records
                        if (ind1 != null && ind2 != null) {
                            obj.records.splice(ind1, 1)
                            if (ind1 > ind2) {
                                obj.records.splice(ind2, 0, tmp)
                            } else {
                                obj.records.splice(ind2 - 1, 0, tmp)
                            }
                        }
                        // clear sortData
                        obj.sortData = []
                        query(obj.box)
                            .find(`#grid_${obj.name}_columns .w2ui-col-header`)
                            .removeClass('w2ui-col-sorted')
                        resetRowReorder()
                        // event after
                        edata.finish()
                    } else {
                        resetRowReorder()
                    }
                }
            }
            delete obj.last.move
            query(document).off('.w2ui-' + obj.name)
        }

        function resetRowReorder() {
            query(obj.box).find(`#grid_${obj.name}_ghost`).remove()
            query(obj.box).find(`#grid_${obj.name}_ghost_line`).remove()
            obj.refresh()
            delete obj.last.move
        }
    }

    unmount() {
        super.unmount()
        this.toolbar?.unmount()
        this.last.observeResize?.disconnect()
    }

    destroy() {
        // event before
        let edata = this.trigger('destroy', { target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        this.toolbar?.destroy?.()
        if (query(this.box).find(`#grid_${this.name}_body`).length > 0) {
            this.unmount()
        }
        delete w2ui[this.name]
        // event after
        edata.finish()
    }

    // ===========================================
    // --- Internal Functions

    initColumnOnOff() {
        let items = [
            { id: 'line-numbers', text: 'Line #', checked: this.show.lineNumbers }
        ]
        // columns
        for (let c = 0; c < this.columns.length; c++) {
            let col = this.columns[c]
            let text = this.columns[c].text
            if (col.hideable === false) continue
            if (!text && this.columns[c].tooltip) text = this.columns[c].tooltip
            if (!text) text = '- column '+ (parseInt(c) + 1) +' -'
            items.push({ id: col.field, text: w2utils.stripTags(text), checked: !col.hidden })
        }
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if ((url && this.show.skipRecords) || this.show.saveRestoreState) {
            items.push({ text: '--' })
        }
        // skip records
        if (this.show.skipRecords) {
            let skip = w2utils.lang('Skip') +
                `<input id="${this.name}_skip" type="text" class="w2ui-input w2ui-grid-skip" value="${this.offset}">` +
                w2utils.lang('records')
            items.push({ id: 'w2ui-skip', text: skip, group: false, icon: 'w2ui-icon-empty' })
        }
        // save/restore state
        if (this.show.saveRestoreState) {
            items.push(
                { id: 'w2ui-stateSave', text: w2utils.lang('Save Grid State'), icon: 'w2ui-icon-empty', group: false },
                { id: 'w2ui-stateReset', text: w2utils.lang('Restore Default State'), icon: 'w2ui-icon-empty', group: false }
            )
        }
        let selected = []
        items.forEach(item => {
            item.text = w2utils.lang(item.text) // translate
            if (item.checked) selected.push(item.id)
        })
        this.toolbar.set('w2ui-column-on-off', { selected, items })
        return items
    }

    initColumnDrag(box) {
        // throw error if using column groups
        if (this.columnGroups && this.columnGroups.length) {
            throw 'Draggable columns are not currently supported with column groups.'
        }
        let self = this
        let dragData = {
            pressed: false,
            targetPos: null,
            columnHead: null
        }
        let hasInvalidClass = (target, lastColumn) => {
            let iClass = ['w2ui-col-number', 'w2ui-col-expand', 'w2ui-col-select']
            if (lastColumn !== true) iClass.push('w2ui-head-last')
            for (let i = 0; i < iClass.length; i++) {
                if (query(target).closest('.w2ui-head').hasClass(iClass[i])) {
                    return true
                }
            }
            return false
        }

        // attach original event listener
        query(self.box)
            .off('.colDrag')
            .on('mousedown.colDrag', dragColStart)

        function dragColStart(event) {
            if (dragData.pressed || dragData.numberPreColumnsPresent === 0 || event.button !== 0) return

            let edata, columns, origColumn, origColumnNumber
            let preColHeadersSelector = '.w2ui-head.w2ui-col-number, .w2ui-head.w2ui-col-expand, .w2ui-head.w2ui-col-select'

            // do nothing if it is not a header
            if (!query(event.target).parents().hasClass('w2ui-head') || hasInvalidClass(event.target)) return

            dragData.pressed = true
            dragData.initialX = event.pageX
            dragData.initialY = event.pageY
            dragData.numberPreColumnsPresent = query(self.box).find(preColHeadersSelector).length

            // start event for drag start
            dragData.columnHead  = origColumn = query(event.target).closest('.w2ui-head')
            dragData.originalPos = origColumnNumber = parseInt(origColumn.attr('col'), 10)
            edata = self.trigger('columnDragStart', { originalEvent: event, origColumnNumber, target: origColumn[0] })
            if (edata.isCancelled === true) return false

            columns = dragData.columns = query(self.box).find('.w2ui-head:not(.w2ui-head-last)')

            // add events
            query(document).on('mouseup.colDrag', dragColEnd)
            query(document).on('mousemove.colDrag', dragColOver)

            let col = self.columns[dragData.originalPos]
            let colText = w2utils.lang(typeof col.text == 'function' ? col.text(col) : col.text)
            dragData.ghost = query.html(`<span col="${dragData.originalPos}">${colText}</span>`)[0]

            query(document.body).append(dragData.ghost)
            query(dragData.ghost)
                .css({
                    display: 'none',
                    left: event.pageX,
                    top: event.pageY,
                    opacity: 1,
                    margin: '3px 0 0 20px',
                    padding: '3px',
                    'background-color': 'white',
                    position: 'fixed',
                    'z-index': 999999,
                })
                .addClass('.w2ui-grid-ghost')


            // establish current offsets
            dragData.offsets = []
            for (let i = 0, l = columns.length; i < l; i++) {
                let rect = columns[i].getBoundingClientRect()
                dragData.offsets.push(rect.left)
            }
            // conclude event
            edata.finish()
        }

        function dragColOver(event) {
            if (!dragData.pressed || !dragData.columnHead) return
            let cursorX = event.pageX
            let cursorY = event.pageY
            if (!hasInvalidClass(event.target, true)) {
                markIntersection(event)
            }
            trackGhost(cursorX, cursorY)
        }

        function dragColEnd(event) {
            if (!dragData.pressed || !dragData.columnHead) return
            dragData.pressed = false

            let edata, target, selected, columnConfig
            let finish = () => {
                let ghosts = query(self.box).find('.w2ui-grid-ghost')
                query(self.box).find('.w2ui-intersection-marker').hide()
                query(dragData.ghost).remove()
                ghosts.remove()

                // dragData.columns.css({ overflow: '' }).children('div').css({ overflow: '' });
                query(document).off('.colDrag')
                dragData = {}
            }

            // if no move, then click event for sorting
            if (event.pageX == dragData.initialX && event.pageY == dragData.initialY) {
                self.columnClick(self.columns[dragData.originalPos].field, event)
                finish()
                return
            }

            // start event for drag start
            edata = self.trigger('columnDragEnd', { originalEvent: event, target: dragData.columnHead[0], dragData })
            if (edata.isCancelled === true) return false

            selected = self.columns[dragData.originalPos]
            columnConfig = self.columns

            if (dragData.originalPos != dragData.targetPos && dragData.targetPos != null) {
                columnConfig.splice(dragData.targetPos, 0, w2utils.clone(selected))
                columnConfig.splice(columnConfig.indexOf(selected), 1)
            }
            finish()

            self.refresh()
            edata.finish({ targetColumn: target - 1 })
        }

        function markIntersection(event) {
            // if mouse over is not over table
            if (query(event.target).closest('td').length == 0) {
                return
            }
            let td = query(event.target).closest('td')
            let newPos = td.hasClass('w2ui-head-last') ? self.columns.length : parseInt(td.attr('col'))
            if (dragData.targetPos != newPos) {
                // if mouse over invalid column
                let rect1 = query(self.box).find('.w2ui-grid-body').get(0).getBoundingClientRect()
                let rect2 = query(event.target).closest('td').get(0).getBoundingClientRect()
                query(self.box).find('.w2ui-intersection-marker')
                    .show()
                    .css({
                        left: (rect2.left - rect1.left) + 'px',
                        height:rect2.height + 'px'
                    })
                dragData.targetPos = newPos
            }
            return
        }

        function trackGhost(cursorX, cursorY){
            query(dragData.ghost)
                .css({
                    left : (cursorX - 10) + 'px',
                    top  : (cursorY - 10) + 'px'
                })
                .show()
        }

        // return an object to remove drag if it has ever been enabled
        return {
            remove() {
                query(self.box).off('.colDrag')
                self.last.columnDrag = false
            }
        }
    }

    columnOnOff(event, field) {
        // event before
        let edata = this.trigger('columnOnOff', { target: this.name, field: field, originalEvent: event })
        if (edata.isCancelled === true) return
        // collapse expanded rows
        let rows = this.find({ 'w2ui.expanded': true }, true)
        for (let r = 0; r < rows.length; r++) {
            let tmp = this.records[r].w2ui
            if (tmp && !Array.isArray(tmp.children)) {
                this.records[r].w2ui.expanded = false
            }
        }
        // show/hide
        if (field == 'line-numbers') {
            this.show.lineNumbers = !this.show.lineNumbers
            this.refresh()
        } else {
            let col = this.getColumn(field)
            if (col.hidden) {
                this.showColumn(col.field)
            } else {
                this.hideColumn(col.field)
            }
        }
        // event after
        edata.finish()
    }

    initToolbar() {
        // if it is already initiazlied
        if (this.toolbar.render != null) {
            return
        }
        let tb_items = this.toolbar.items || []
        this.toolbar.items = []
        this.toolbar = new w2toolbar(w2utils.extend({}, this.toolbar, { name: this.name +'_toolbar', owner: this }))
        if (this.show.toolbarReload) {
            this.toolbar.items.push(w2utils.extend({}, this.buttons.reload))
        }
        if (this.show.toolbarColumns) {
            this.toolbar.items.push(w2utils.extend({}, this.buttons.columns))
        }
        if (this.show.toolbarSearch) {
            let html =`
                <div class="w2ui-grid-search-input">
                    ${this.buttons.search.html}
                    <div id="grid_${this.name}_search_name" class="w2ui-grid-search-name">
                        <span class="name-icon w2ui-icon-search"></span>
                        <span class="name-text"></span>
                        <span class="name-cross w2ui-action" data-click="searchReset">x</span>
                    </div>
                    <input type="text" id="grid_${this.name}_search_all" class="w2ui-search-all" tabindex="-1"
                        autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
                        placeholder="${w2utils.lang(this.last.label, true)}" value="${this.last.search}"
                        data-focus="searchSuggest" data-click="stop"
                    >
                    <div class="w2ui-search-drop w2ui-action" data-click="searchOpen"
                            style="${this.multiSearch ? '' : 'display: none'}">
                        <span class="w2ui-icon-drop"></span>
                    </div>
                </div>`
            this.toolbar.items.push({
                id: 'w2ui-search',
                type: 'html',
                html,
                onRefresh: async (event) => {
                    await event.complete
                    let input = query(this.box).find(`#grid_${this.name}_search_all`)
                    w2utils.bindEvents(query(this.box).find(`#grid_${this.name}_search_all, .w2ui-action`), this)
                    // slow down live search calls
                    let slowSearch = w2utils.debounce((event) => {
                        let val = event.target.value
                        if (this.liveSearch && this.last.liveText != val) {
                            this.last.liveText = val
                            this.search(this.last.field, val)
                        }
                    }, 250)
                    input
                        .on('blur', () => { this.last.liveText = '' })
                        .on('keyup', (event) => {
                            switch (event.keyCode) {
                                case 40: {
                                    // show saved searches on arrow down
                                    this.searchSuggest(true)
                                    break
                                }
                                case 38: {
                                    // hide saved searches on arrow up
                                    this.searchSuggest(true, true)
                                    break
                                }
                                case 13: {
                                    // search on enter key
                                    this.search(this.last.field, event.target.value)
                                    break
                                }
                                default: {
                                    // live search (if enabled)
                                    slowSearch(event)
                                    break
                                }
                            }
                        })
                }
            })
        }
        if (Array.isArray(tb_items)) {
            let ids = tb_items.map(item => item.id)
            if (this.show.toolbarAdd && !ids.includes(this.buttons.add.id)) {
                this.toolbar.items.push(w2utils.extend({}, this.buttons.add))
            }
            if (this.show.toolbarEdit && !ids.includes(this.buttons.edit.id)) {
                this.toolbar.items.push(w2utils.extend({}, this.buttons.edit))
            }
            if (this.show.toolbarDelete && !ids.includes(this.buttons.delete.id)) {
                this.toolbar.items.push(w2utils.extend({}, this.buttons.delete))
            }
            if (this.show.toolbarSave && !ids.includes(this.buttons.save.id)) {
                if (this.show.toolbarAdd || this.show.toolbarDelete || this.show.toolbarEdit) {
                    this.toolbar.items.push({ type: 'break', id: 'w2ui-break2' })
                }
                this.toolbar.items.push(w2utils.extend({}, this.buttons.save))
            }
            // fill in overwritten items with default buttons
            // ids are w2ui-* but in this.buttons the map is just [add, edit, delete]
            // must specify at least {id, name} in this.toolbar.items if you want to keep order
            tb_items = tb_items.map(item => this.buttons[item.name]
                                            ? w2utils.extend({}, this.buttons[item.name], item) : item)
        }
        // add original buttons
        this.toolbar.items.push(...tb_items)

        // =============================================
        // ------ Toolbar onClick processing

        this.toolbar.on('click', (event) => {
            let edata = this.trigger('toolbar', { target: event.target, originalEvent: event })
            if (edata.isCancelled === true) return
            let edata2
            switch (event.detail.item.id) {
                case 'w2ui-reload':
                    edata2 = this.trigger('reload', { target: this.name })
                    if (edata2.isCancelled === true) return false
                    this.reload()
                    edata2.finish()
                    break
                case 'w2ui-column-on-off':
                    // TODO: tap on columns will hide menu before opening, only in grid not in toolbar
                    if (event.detail.subItem) {
                        let id = event.detail.subItem.id
                        if (['w2ui-stateSave', 'w2ui-stateReset'].includes(id)) {
                            this[id.substring(5)]()
                        } else if (id == 'w2ui-skip') {
                            // empty
                        } else {
                            this.columnOnOff(event, event.detail.subItem.id)
                        }
                    } else {
                        this.initColumnOnOff()
                        // init input control with records to skip
                        setTimeout(() => {
                            query(`#w2overlay-${this.name}_toolbar-drop .w2ui-grid-skip`)
                                .off('.w2ui-grid')
                                .on('click.w2ui-grid', evt => {
                                    evt.stopPropagation()
                                })
                                .on('keypress', evt => {
                                    if (evt.keyCode == 13) {
                                        this.skip(evt.target.value)
                                        this.toolbar.click('w2ui-column-on-off') // close menu
                                    }
                                })
                        }, 100)
                    }
                    break
                case 'w2ui-add':
                    // events
                    edata2 = this.trigger('add', { target: this.name, recid: null })
                    if (edata2.isCancelled === true) return false
                    edata2.finish()
                    break
                case 'w2ui-edit': {
                    let sel   = this.getSelection()
                    let recid = null
                    if (sel.length == 1) recid = sel[0]
                    // events
                    edata2 = this.trigger('edit', { target: this.name, recid: recid })
                    if (edata2.isCancelled === true) return false
                    edata2.finish()
                    break
                }
                case 'w2ui-delete':
                    this.delete()
                    break
                case 'w2ui-save':
                    this.save()
                    break
            }
            // no default action
            edata.finish()
        })
        this.toolbar.on('refresh', (event) => {
            if (event.target == 'w2ui-search') {
                let sd = this.searchData
                setTimeout(() => {
                    this.searchInitInput(this.last.field, (sd.length == 1 ? sd[0].value : null))
                }, 1)
            }
        })
    }

    initResize() {
        let obj = this
        query(this.box).find('.w2ui-resizer')
            .off('.grid-col-resize')
            .on('click.grid-col-resize', function(event) {
                event.stopPropagation()
                event.preventDefault()
            })
            .on('mousedown.grid-col-resize', function(event) {
                if (!event) event = window.event
                obj.last.colResizing = true
                obj.last.tmp         = {
                    x   : event.screenX,
                    y   : event.screenY,
                    gx  : event.screenX,
                    gy  : event.screenY,
                    col : parseInt(query(this).attr('name'))
                }
                // find tds that will be resized
                obj.last.tmp.tds = query(obj.box).find('#grid_'+ obj.name +'_body table tr:first-child td[col="'+ obj.last.tmp.col +'"]')

                event.stopPropagation()
                event.preventDefault()
                // fix sizes
                for (let c = 0; c < obj.columns.length; c++) {
                    if (obj.columns[c].hidden) continue
                    if (obj.columns[c].sizeOriginal == null) obj.columns[c].sizeOriginal = obj.columns[c].size
                    obj.columns[c].size = obj.columns[c].sizeCalculated
                }
                let edata = obj.trigger('columnResize', {
                    target: obj.name, resizeBy: 0, originalEvent: event,
                    column: obj.last.tmp.col, field: obj.columns[obj.last.tmp.col].field
                })
                // set move event
                let timer
                let mouseMove = function(event) {
                    if (obj.last.colResizing != true) return
                    if (!event) event = window.event
                    // event before
                    let edata2 = obj.trigger('columnResizeMove', w2utils.extend(edata.detail, { resizeBy: (event.screenX - obj.last.tmp.gx), originalEvent: event }))
                    if (edata2.isCancelled === true) { return }
                    // default action
                    obj.last.tmp.x = (event.screenX - obj.last.tmp.x)
                    obj.last.tmp.y = (event.screenY - obj.last.tmp.y)
                    let newWidth   = (parseInt(obj.columns[obj.last.tmp.col].size) + obj.last.tmp.x) + 'px'
                    obj.columns[obj.last.tmp.col].size = newWidth
                    if (timer) clearTimeout(timer)
                    timer = setTimeout(() => {
                        obj.resizeRecords()
                        obj.scroll()
                    }, 100)
                    // quick resize
                    obj.last.tmp.tds.css({ width: newWidth })
                    // reset
                    obj.last.tmp.x = event.screenX
                    obj.last.tmp.y = event.screenY
                    // event after
                    edata2.finish()
                }
                let mouseUp = function(event) {
                    query(document).off('.grid-col-resize')
                    obj.resizeRecords()
                    obj.scroll()
                    // event after
                    edata.finish({ originalEvent: event })
                    // need timeout to finish processing events
                    setTimeout(() => { obj.last.colResizing = false }, 1)
                }

                query(document)
                    .off('.grid-col-resize')
                    .on('mousemove.grid-col-resize', mouseMove)
                    .on('mouseup.grid-col-resize', mouseUp)
            })
            .on('dblclick.grid-col-resize', function(event) {
                let ind = parseInt(query(this).attr('name'))
                obj.columnAutoSize(ind)
                // prevent default
                event.stopPropagation()
                event.preventDefault()
            })
            .each(el => {
                let td = query(el).get(0).parentNode
                query(el).css({
                    'height'      : td.clientHeight + 'px',
                    'margin-left' : (td.clientWidth - 3) + 'px'
                })
            })
    }

    resizeBoxes() {
        // elements
        let header   = query(this.box).find(`#grid_${this.name}_header`)
        let toolbar  = query(this.box).find(`#grid_${this.name}_toolbar`)
        let fsummary = query(this.box).find(`#grid_${this.name}_fsummary`)
        let summary  = query(this.box).find(`#grid_${this.name}_summary`)
        let footer   = query(this.box).find(`#grid_${this.name}_footer`)
        let body     = query(this.box).find(`#grid_${this.name}_body`)

        if (this.show.header) {
            header.css({
                top:   '0px',
                left:  '0px',
                right: '0px'
            })
        }

        if (this.show.toolbar) {
            toolbar.css({
                top:   (0 + (this.show.header ? w2utils.getSize(header, 'height') : 0)) + 'px',
                left:  '0px',
                right: '0px'
            })
        }
        if (this.summary.length > 0) {
            fsummary.css({
                bottom: (0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0)) + 'px'
            })
            summary.css({
                bottom: (0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0)) + 'px',
                right: '0px'
            })
        }
        if (this.show.footer) {
            footer.css({
                bottom: '0px',
                left:  '0px',
                right: '0px'
            })
        }
        body.css({
            top: (0 + (this.show.header ? w2utils.getSize(header, 'height') : 0) + (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)) + 'px',
            bottom: (0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) + (this.summary.length > 0 ? w2utils.getSize(summary, 'height') : 0)) + 'px',
            left:   '0px',
            right:  '0px'
        })
    }

    resizeRecords() {
        let obj = this
        // remove empty records
        query(this.box).find('.w2ui-empty-record').remove()
        // -- Calculate Column size in PX
        let box             = query(this.box)
        let grid            = query(this.box).find(':scope > div.w2ui-grid-box')
        let header          = query(this.box).find(`#grid_${this.name}_header`)
        let toolbar         = query(this.box).find(`#grid_${this.name}_toolbar`)
        let summary         = query(this.box).find(`#grid_${this.name}_summary`)
        let fsummary        = query(this.box).find(`#grid_${this.name}_fsummary`)
        let footer          = query(this.box).find(`#grid_${this.name}_footer`)
        let body            = query(this.box).find(`#grid_${this.name}_body`)
        let columns         = query(this.box).find(`#grid_${this.name}_columns`)
        let fcolumns        = query(this.box).find(`#grid_${this.name}_fcolumns`)
        let records         = query(this.box).find(`#grid_${this.name}_records`)
        let frecords        = query(this.box).find(`#grid_${this.name}_frecords`)
        let scroll1         = query(this.box).find(`#grid_${this.name}_scroll1`)
        let lineNumberWidth = String(this.total).length * 8 + 10
        if (lineNumberWidth < 34) lineNumberWidth = 34 // 3 digit width
        if (this.lineNumberWidth != null) lineNumberWidth = this.lineNumberWidth

        let bodyOverflowX = false
        let bodyOverflowY = false
        let sWidth = 0
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].frozen || this.columns[i].hidden) continue
            let cSize = parseInt(this.columns[i].sizeCalculated ? this.columns[i].sizeCalculated : this.columns[i].size)
            sWidth += cSize
        }
        if (records[0]?.clientWidth < sWidth) bodyOverflowX = true
        if (body[0]?.clientHeight - (columns[0]?.clientHeight ?? 0)
                < (query(records).find(':scope > table')[0]?.clientHeight ?? 0) + (bodyOverflowX ? w2utils.scrollBarSize() : 0)) {
            bodyOverflowY = true
        }

        // body might be expanded by data
        if (!this.fixedBody) {
            // allow it to render records, then resize
            let bodyHeight = w2utils.getSize(columns, 'height')
                + w2utils.getSize(query(this.box).find('#grid_'+ this.name +'_records table'), 'height')
                + (bodyOverflowX ? w2utils.scrollBarSize() : 0)
            let calculatedHeight = bodyHeight
                + (this.show.header ? w2utils.getSize(header, 'height') : 0)
                + (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
                + (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
                + (this.show.footer ? w2utils.getSize(footer, 'height') : 0)
            grid.css('height', calculatedHeight + 'px')
            body.css('height', bodyHeight + 'px')
            box.css('height', w2utils.getSize(grid, 'height') + 'px')
        } else {
            // fixed body height
            let calculatedHeight = grid[0]?.clientHeight
                - (this.show.header ? w2utils.getSize(header, 'height') : 0)
                - (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
                - (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
                - (this.show.footer ? w2utils.getSize(footer, 'height') : 0)
            body.css('height', calculatedHeight + 'px')
        }

        let buffered = this.records.length
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (this.searchData.length != 0 && !url) buffered = this.last.searchIds.length
        // apply overflow
        if (!this.fixedBody) { bodyOverflowY = false }
        if (bodyOverflowX || bodyOverflowY) {
            columns.find(':scope > table > tbody > tr:nth-child(1) td.w2ui-head-last')
                .css('width', w2utils.scrollBarSize() + 'px')
                .show()
            records.css({
                top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
                '-webkit-overflow-scrolling': 'touch',
                'overflow-x': (bodyOverflowX ? 'auto' : 'hidden'),
                'overflow-y': (bodyOverflowY ? 'auto' : 'hidden')
            })
        } else {
            columns.find(':scope > table > tbody > tr:nth-child(1) td.w2ui-head-last').hide()
            records.css({
                top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
                overflow: 'hidden'
            })
            if (records.length > 0) { this.last.vscroll.scrollTop = 0; this.last.vscroll.scrollLeft = 0 } // if no scrollbars, always show top
        }
        if (bodyOverflowX) {
            frecords.css('margin-bottom', w2utils.scrollBarSize() + 'px')
            scroll1.show()
        } else {
            frecords.css('margin-bottom', 0)
            scroll1.hide()
        }
        frecords.css({ overflow: 'hidden', top: records.css('top') })
        if (this.show.emptyRecords && !bodyOverflowY) {
            let max = Math.floor((records[0]?.clientHeight ?? 0) / this.recordHeight) - 1
            let leftover = 0
            if (records[0]) leftover = records[0].scrollHeight - max * this.recordHeight
            if (leftover >= this.recordHeight) {
                leftover -= this.recordHeight
                max++
            }
            if (this.fixedBody) {
                for (let di = buffered; di < max; di++) {
                    addEmptyRow(di, this.recordHeight, this)
                }
                addEmptyRow(max, leftover, this)
            }
        }

        function addEmptyRow(row, height, grid) {
            let html1 = ''
            let html2 = ''
            let htmlp = ''
            html1    += '<tr class="'+ (row % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" recid="-none-" style="height: '+ height +'px">'
            html2    += '<tr class="'+ (row % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" recid="-none-" style="height: '+ height +'px">'
            if (grid.show.lineNumbers) html1 += '<td class="w2ui-col-number"></td>'
            if (grid.show.selectColumn) html1 += '<td class="w2ui-grid-data w2ui-col-select"></td>'
            if (grid.show.expandColumn) html1 += '<td class="w2ui-grid-data w2ui-col-expand"></td>'
            html2 += '<td class="w2ui-grid-data-spacer" col="start" style="border-right: 0"></td>'
            if (grid.reorderRows) html2 += '<td class="w2ui-grid-data w2ui-col-order" col="order"></td>'
            for (let j = 0; j < grid.columns.length; j++) {
                let col = grid.columns[j]
                if ((col.hidden || j < grid.last.vscroll.colIndStart || j > grid.last.vscroll.colIndEnd) && !col.frozen) continue
                htmlp = '<td class="w2ui-grid-data" '+ (col.attr != null ? col.attr : '') +' col="'+ j +'"></td>'
                if (col.frozen) html1 += htmlp; else html2 += htmlp
            }
            html1 += '<td class="w2ui-grid-data-last"></td> </tr>'
            html2 += '<td class="w2ui-grid-data-last" col="end"></td> </tr>'
            query(grid.box).find('#grid_'+ grid.name +'_frecords > table').append(html1)
            query(grid.box).find('#grid_'+ grid.name +'_records > table').append(html2)
        }
        let width_box, percent
        if (body.length > 0) {
            let width_max = parseInt(body[0].clientWidth)
                - (bodyOverflowY ? w2utils.scrollBarSize() : 0)
                - (this.show.lineNumbers ? lineNumberWidth : 0)
                - (this.reorderRows ? 26 : 0)
                - (this.show.selectColumn ? 26 : 0)
                - (this.show.expandColumn ? 26 : 0)
                - 1 // left is 1px due to border width
            width_box = width_max
            percent   = 0
            // gridMinWidth processing
            let restart = false
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                if (col.gridMinWidth > 0) {
                    if (col.gridMinWidth > width_box && col.hidden !== true) {
                        col.hidden = true
                        restart    = true
                    }
                    if (col.gridMinWidth < width_box && col.hidden === true) {
                        col.hidden = false
                        restart    = true
                    }
                }
            }
            if (restart === true) {
                this.refresh()
                return
            }
            // assign PX column s
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                if (col.hidden) continue
                if (String(col.size).substr(String(col.size).length-2).toLowerCase() == 'px') {
                    width_max -= parseFloat(col.size)
                    this.columns[i].sizeCalculated = col.size
                    this.columns[i].sizeType = 'px'
                } else {
                    percent += parseFloat(col.size)
                    this.columns[i].sizeType = '%'
                    delete col.sizeCorrected
                }
            }
            // if sum != 100% -- reassign proportionally
            if (percent != 100 && percent > 0) {
                for (let i = 0; i < this.columns.length; i++) {
                    let col = this.columns[i]
                    if (col.hidden) continue
                    if (col.sizeType == '%') {
                        col.sizeCorrected = Math.round(parseFloat(col.size) * 100 * 100 / percent) / 100 + '%'
                    }
                }
            }
            // calculate % columns
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                if (col.hidden) continue
                if (col.sizeType == '%') {
                    if (this.columns[i].sizeCorrected != null) {
                        // make it 1px smaller, so margin of error can be calculated correctly
                        this.columns[i].sizeCalculated = Math.floor(width_max * parseFloat(col.sizeCorrected) / 100) - 1 + 'px'
                    } else {
                        // make it 1px smaller, so margin of error can be calculated correctly
                        this.columns[i].sizeCalculated = Math.floor(width_max * parseFloat(col.size) / 100) - 1 + 'px'
                    }
                }
            }
        }
        // fix margin of error that is due percentage calculations
        let width_cols = 0
        for (let i = 0; i < this.columns.length; i++) {
            let col = this.columns[i]
            if (col.hidden) continue
            if (col.min == null) col.min = 20
            if (parseInt(col.sizeCalculated) < parseInt(col.min)) col.sizeCalculated = col.min + 'px'
            if (parseInt(col.sizeCalculated) > parseInt(col.max)) col.sizeCalculated = col.max + 'px'
            width_cols += parseInt(col.sizeCalculated)
        }
        let width_diff = parseInt(width_box) - parseInt(width_cols)
        if (width_diff > 0 && percent > 0) {
            let i = 0
            while (true) {
                let col = this.columns[i]
                if (col == null) { i = 0; continue }
                if (col.hidden || col.sizeType == 'px') { i++; continue }
                col.sizeCalculated = (parseInt(col.sizeCalculated) + 1) + 'px'
                width_diff--
                if (width_diff === 0) break
                i++
            }
        } else if (width_diff > 0) {
            columns.find(':scope > table > tbody > tr:nth-child(1) td.w2ui-head-last')
                .css('width', w2utils.scrollBarSize() + 'px')
                .show()
        }

        // find width of frozen columns
        let fwidth = 1
        if (this.show.lineNumbers) fwidth += lineNumberWidth
        if (this.show.selectColumn) fwidth += 26
        // if (this.reorderRows) fwidth += 26;
        if (this.show.expandColumn) fwidth += 26
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].hidden) continue
            if (this.columns[i].frozen) fwidth += parseInt(this.columns[i].sizeCalculated)
        }
        fcolumns.css('width', fwidth + 'px')
        frecords.css('width', fwidth + 'px')
        fsummary.css('width', fwidth + 'px')
        scroll1.css('width', fwidth + 'px')
        /**
         * 0.5 is needed due to imperfection of table layout. There was a very small shift between right border of the column headers
         * and records. I checked it had exact same offset, but still felt like 1px off. This adjustment fixes it.
         */
        columns.css('left', (fwidth + 0.5) + 'px')
        records.css('left', fwidth + 'px')
        summary.css('left', fwidth + 'px')

        // resize columns
        columns.find(':scope > table > tbody > tr:nth-child(1) td')
            .add(fcolumns.find(':scope > table > tbody > tr:nth-child(1) td'))
            .each(el => {
                // line numbers
                if (query(el).hasClass('w2ui-col-number')) {
                    query(el).css('width', lineNumberWidth + 'px')
                }
                // records
                let ind = query(el).attr('col')
                if (ind != null) {
                    if (ind == 'start') {
                        let width = 0
                        for (let i = 0; i < obj.last.vscroll.colIndStart; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        query(el).css('width', width + 'px')
                    }
                    if (obj.columns[ind]) query(el).css('width', obj.columns[ind].sizeCalculated) // already has px
                }
                // last column
                if (query(el).hasClass('w2ui-head-last')) {
                    if (obj.last.vscroll.colIndEnd + 1 < obj.columns.length) {
                        let width = 0
                        for (let i = obj.last.vscroll.colIndEnd + 1; i < obj.columns.length; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        query(el).css('width', width + 'px')
                    } else {
                        query(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent === 0 ? width_diff : 0) + 'px')
                    }
                }
            })
        // if there are column groups - hide first row (needed for sizing)
        if (columns.find(':scope > table > tbody > tr').length == 3) {
            columns.find(':scope > table > tbody > tr:nth-child(1) td')
                .add(fcolumns.find(':scope > table > tbody > tr:nth-child(1) td'))
                .html('').css({
                    'height' : '0',
                    'border' : '0',
                    'padding': '0',
                    'margin' : '0'
                })
        }
        // resize records
        records.find(':scope > table > tbody > tr:nth-child(1) td')
            .add(frecords.find(':scope > table > tbody > tr:nth-child(1) td'))
            .each(el => {
                // line numbers
                if (query(el).hasClass('w2ui-col-number')) {
                    query(el).css('width', lineNumberWidth + 'px')
                }
                // records
                let ind = query(el).attr('col')
                if (ind != null) {
                    if (ind == 'start') {
                        let width = 0
                        for (let i = 0; i < obj.last.vscroll.colIndStart; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        query(el).css('width', width + 'px')
                    }
                    if (obj.columns[ind]) query(el).css('width', obj.columns[ind].sizeCalculated)
                }
                // last column
                if (query(el).hasClass('w2ui-grid-data-last') && query(el).parents('.w2ui-grid-frecords').length === 0) { // not in frecords
                    if (obj.last.vscroll.colIndEnd + 1 < obj.columns.length) {
                        let width = 0
                        for (let i = obj.last.vscroll.colIndEnd + 1; i < obj.columns.length; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        query(el).css('width', width + 'px')
                    } else {
                        query(el).css('width', (width_diff > 0 && percent === 0 ? width_diff : 0) + 'px')
                    }
                }
            })
        // resize summary
        summary.find(':scope > table > tbody > tr:nth-child(1) td')
            .add(fsummary.find(':scope > table > tbody > tr:nth-child(1) td'))
            .each(el => {
                // line numbers
                if (query(el).hasClass('w2ui-col-number')) {
                    query(el).css('width', lineNumberWidth + 'px')
                }
                // records
                let ind = query(el).attr('col')
                if (ind != null) {
                    if (ind == 'start') {
                        let width = 0
                        for (let i = 0; i < obj.last.vscroll.colIndStart; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        query(el).css('width', width + 'px')
                    }
                    if (obj.columns[ind]) query(el).css('width', obj.columns[ind].sizeCalculated)
                }
                // last column
                if (query(el).hasClass('w2ui-grid-data-last') && query(el).parents('.w2ui-grid-frecords').length === 0) { // not in frecords
                    query(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent === 0 ? width_diff : 0) + 'px')
                }
            })
        this.initResize()
        this.refreshRanges()
        // apply last scroll if any
        if ((this.last.vscroll.scrollTop || this.last.vscroll.scrollLeft) && records.length > 0) {
            columns.prop('scrollLeft', this.last.vscroll.scrollLeft)
            records.prop('scrollTop', this.last.vscroll.scrollTop)
            records.prop('scrollLeft', this.last.vscroll.scrollLeft)
        }
        // Improved performance when scrolling through tables
        columns.css('will-change', 'scroll-position')
    }

    getSearchesHTML() {
        let html = `
            <div class="search-title">
                ${w2utils.lang('Advanced Search')}
                <span class="search-logic" style="${this.show.searchLogic ? '' : 'display: none'}">
                    <select id="grid_${this.name}_logic" class="w2ui-input">
                        <option value="AND" ${this.last.logic == 'AND' ? 'selected' : ''}>${w2utils.lang('All')}</option>
                        <option value="OR" ${this.last.logic == 'OR' ? 'selected' : ''}>${w2utils.lang('Any')}</option>
                    </select>
                </span>
            </div>
            <table cellspacing="0"><tbody>
        `
        for (let i = 0; i < this.searches.length; i++) {
            let s  = this.searches[i]
            s.type = String(s.type).toLowerCase()
            if (s.hidden) continue
            if (s.attr == null) s.attr = ''
            if (s.text == null) s.text = ''
            if (s.style == null) s.style = ''
            if (s.type == null) s.type = 'text'
            if (s.label == null && s.caption != null) {
                console.log('NOTICE: grid search.caption property is deprecated, please use search.label. Search ->', s)
                s.label = s.caption
            }
            let operator =`<select id="grid_${this.name}_operator_${i}" class="w2ui-input" data-change="initOperator|${i}">
                    ${this.getOperators(s.type, s.operators)}
                </select>`

            html += `<tr>
                        <td class="caption">${(w2utils.lang(s.label ?? s.field) || '')}</td>
                        <td class="operator">${operator}</td>
                        <td class="value">`

            let tmpStyle
            switch (s.type) {
                case 'text':
                case 'alphanumeric':
                case 'hex':
                case 'color':
                case 'list':
                case 'combo':
                case 'enum':
                    tmpStyle = 'width: 250px;'
                    if (['hex', 'color'].indexOf(s.type) != -1) tmpStyle = 'width: 90px;'
                    html += `<input rel="search" type="text" id="grid_${this.name}_field_${i}" name="${s.field}"
                               class="w2ui-input" style="${tmpStyle + s.style}" ${s.attr}>`
                    break

                case 'int':
                case 'float':
                case 'money':
                case 'currency':
                case 'percent':
                case 'date':
                case 'time':
                case 'datetime':
                    tmpStyle = 'width: 90px;'
                    if (s.type == 'datetime') tmpStyle = 'width: 140px;'
                    html += `<input id="grid_${this.name}_field_${i}" name="${s.field}" ${s.attr} rel="search" type="text"
                                class="w2ui-input" style="${tmpStyle + s.style}">
                            <span id="grid_${this.name}_range_${i}" style="display: none">&#160;-&#160;&#160;
                                <input rel="search" type="text" class="w2ui-input" style="${tmpStyle + s.style}" id="grid_${this.name}_field2_${i}" name="${s.field}" ${s.attr}>
                            </span>`
                    break

                case 'select':
                    html += `<select rel="search" class="w2ui-input" style="${s.style}" id="grid_${this.name}_field_${i}"
                                name="${s.field}" ${s.attr}></select>`
                    break

            }
            html += s.text +
                    '    </td>' +
                    '</tr>'
        }
        html += `<tr>
            <td colspan="2" class="actions">
                <button type="button" class="w2ui-btn close-btn" data-click="searchClose">${w2utils.lang('Close')}</button>
            </td>
            <td class="actions">
                <button type="button" class="w2ui-btn" data-click="searchReset">${w2utils.lang('Reset')}</button>
                <button type="button" class="w2ui-btn w2ui-btn-blue" data-click="search">${w2utils.lang('Search')}</button>
            </td>
        </tr></tbody></table>`
        return html
    }

    getOperators(type, opers) {
        let operators = this.operators[this.operatorsMap[type]] || []
        if (opers != null && Array.isArray(opers)) {
            operators = opers
        }
        let html = ''
        operators.forEach(oper => {
            let displayText = oper
            let operValue = oper
            if (Array.isArray(oper)) {
                displayText = oper[1]
                operValue = oper[0]
            } else if (w2utils.isPlainObject(oper)) {
                displayText = oper.text
                operValue = oper.oper
            }
            if (displayText == null) displayText = oper
            html += `<option name="11" value="${operValue}">${w2utils.lang(displayText)}</option>\n`
        })
        return html
    }

    initOperator(ind) {
        let options
        let search  = this.searches[ind]
        let sdata   = this.getSearchData(search.field)
        let overlay = query(`#w2overlay-${this.name}-search-overlay`)
        let $rng    = overlay.find(`#grid_${this.name}_range_${ind}`)
        let $fld1   = overlay.find(`#grid_${this.name}_field_${ind}`)
        let $fld2   = overlay.find(`#grid_${this.name}_field2_${ind}`)
        let $oper   = overlay.find(`#grid_${this.name}_operator_${ind}`)
        let oper    = $oper.val()
        $fld1.show()
        $rng.hide()
        // init based on operator value
        switch (oper) {
            case 'between':
                $rng.css('display', 'inline')
                break
            case 'null':
            case 'not null':
                $fld1.hide()
                $fld1.val(oper) // need to insert something for search to activate
                $fld1.trigger('change')
                break
        }

        // init based on search type
        switch (search.type) {
            case 'text':
            case 'alphanumeric':
                let fld = $fld1[0]._w2field
                if (fld) { fld.reset() }
                break

            case 'int':
            case 'float':
            case 'hex':
            case 'color':
            case 'money':
            case 'currency':
            case 'percent':
            case 'date':
            case 'time':
            case 'datetime':
                if (!$fld1[0]._w2field) {
                    // init fields
                    new w2field(search.type, { el: $fld1[0], ...search.options })
                    new w2field(search.type, { el: $fld2[0], ...search.options })
                    setTimeout(() => { // convert to date if it is number
                        $fld1.trigger('keydown')
                        $fld2.trigger('keydown')
                    }, 1)
                }
                break

            case 'list':
            case 'combo':
            case 'enum':
                options = search.options
                if (search.type == 'list') options.selected = {}
                if (search.type == 'enum') options.selected = []
                if (sdata) options.selected = sdata.value
                if (!$fld1[0]._w2field) {
                    let fld = new w2field(search.type, { el: $fld1[0], ...options })
                    if (sdata && sdata.text != null) {
                        fld.set({ id: sdata.value, text: sdata.text })
                    }
                }
                break

            case 'select':
                // build options
                options = '<option value="">--</option>'
                for (let i = 0; i < search.options.items.length; i++) {
                    let si = search.options.items[i]
                    if (w2utils.isPlainObject(search.options.items[i])) {
                        let val = si.id
                        let txt = si.text
                        if (val == null && si.value != null) val = si.value
                        if (txt == null && si.text != null) txt = si.text
                        if (val == null) val = ''
                        options += '<option value="'+ val +'">'+ txt +'</option>'
                    } else {
                        options += '<option value="'+ si +'">'+ si +'</option>'
                    }
                }
                $fld1.html(options)
                break
        }
    }

    initSearches() {
        let overlay = query(`#w2overlay-${this.name}-search-overlay`)
        // init searches
        for (let ind = 0; ind < this.searches.length; ind++) {
            let search  = this.searches[ind]
            let sdata   = this.getSearchData(search.field)
            search.type = String(search.type).toLowerCase()
            if (typeof search.options != 'object') search.options = {}
            // operators
            let operator  = search.operator
            let operators = [...this.operators[this.operatorsMap[search.type]]] || [] // need a copy
            if (search.operators) operators = search.operators
            // normalize
            if (w2utils.isPlainObject(operator)) operator = operator.oper
            operators.forEach((oper, ind) => {
                if (w2utils.isPlainObject(oper)) operators[ind] = oper.oper
            })
            if (sdata && sdata.operator) {
                operator = sdata.operator
            }
            // default operator
            let def = this.defaultOperator[this.operatorsMap[search.type]]
            if (operators.indexOf(operator) == -1) {
                operator = def
            }
            overlay.find(`#grid_${this.name}_operator_${ind}`).val(operator)
            this.initOperator(ind)
            // populate field value
            let $fld1 = overlay.find(`#grid_${this.name}_field_${ind}`)
            let $fld2 = overlay.find(`#grid_${this.name}_field2_${ind}`)
            if (sdata != null) {
                if (!Array.isArray(sdata.value)) {
                    if (sdata.value != null) $fld1.val(sdata.value).trigger('change')
                } else {
                    if (['in', 'not in'].includes(sdata.operator)) {
                        $fld1[0]._w2field.set(sdata.value)
                    } else {
                        $fld1.val(sdata.value[0]).trigger('change')
                        $fld2.val(sdata.value[1]).trigger('change')
                    }
                }
            }
        }
        // add on change event
        overlay.find('.w2ui-grid-search-advanced *[rel=search]')
            .on('keypress', evnt => {
                if (evnt.keyCode == 13) {
                    this.search()
                    w2tooltip.hide(this.name + '-search-overlay')
                }
            })
    }

    getColumnsHTML() {
        let self = this
        let html1 = ''
        let html2 = ''
        if (this.show.columnHeaders) {
            if (this.columnGroups.length > 0) {
                let tmp1 = getColumns(true)
                let tmp2 = getGroups()
                let tmp3 = getColumns(false)
                html1    = tmp1[0] + tmp2[0] + tmp3[0]
                html2    = tmp1[1] + tmp2[1] + tmp3[1]
            } else {
                let tmp = getColumns(true)
                html1   = tmp[0]
                html2   = tmp[1]
            }
        }
        return [html1, html2]

        function getGroups() {
            let html1 = '<tr>'
            let html2 = '<tr>'
            let tmpf  = ''
            // add empty group at the end
            let tmp = self.columnGroups.length - 1
            if (self.columnGroups[tmp].text == null && self.columnGroups[tmp].caption != null) {
                console.log('NOTICE: grid columnGroup.caption property is deprecated, please use columnGroup.text. Group -> ', self.columnGroups[tmp])
                self.columnGroups[tmp].text = self.columnGroups[tmp].caption
            }
            if (self.columnGroups[self.columnGroups.length-1].text != '') self.columnGroups.push({ text: '' })

            if (self.show.lineNumbers) {
                html1 += '<td class="w2ui-head w2ui-col-number" col="line-number">' +
                         '    <div>&#160;</div>' +
                         '</td>'
            }
            if (self.show.selectColumn) {
                html1 += '<td class="w2ui-head w2ui-col-select" col="select">' +
                         '    <div style="height: 25px">&#160;</div>' +
                         '</td>'
            }
            if (self.show.expandColumn) {
                html1 += '<td class="w2ui-head w2ui-col-expand" col="expand">' +
                         '    <div style="height: 25px">&#160;</div>' +
                         '</td>'
            }
            let ii = 0
            html2 += `<td id="grid_${self.name}_column_start" class="w2ui-head" col="start" style="border-right: 0"></td>`
            if (self.reorderRows) {
                html2 += '<td class="w2ui-head w2ui-col-order" col="order">' +
                         '    <div style="height: 25px">&#160;</div>' +
                         '</td>'
            }
            for (let i = 0; i < self.columnGroups.length; i++) {
                let colg = self.columnGroups[i]
                let col  = self.columns[ii] || {}
                if (colg.colspan != null) colg.span = colg.colspan
                if (colg.span == null || colg.span != parseInt(colg.span)) colg.span = 1
                if (col.text == null && col.caption != null) {
                    console.log('NOTICE: grid column.caption property is deprecated, please use column.text. Column ->', col)
                    col.text = col.caption
                }
                let colspan = 0
                for (let jj = ii; jj < ii + colg.span; jj++) {
                    if (self.columns[jj] && !self.columns[jj].hidden) {
                        colspan++
                    }
                }
                if (i == self.columnGroups.length-1) {
                    colspan = 100 // last column
                }
                if (colspan <= 0) {
                    // do nothing here, all columns in the group are hidden.
                } else if (colg.main === true) {
                    let sortStyle = ''
                    for (let si = 0; si < self.sortData.length; si++) {
                        if (self.sortData[si].field == col.field) {
                            if ((self.sortData[si].direction || '').toLowerCase() === 'asc') sortStyle = 'w2ui-sort-up'
                            if ((self.sortData[si].direction || '').toLowerCase() === 'desc') sortStyle = 'w2ui-sort-down'
                        }
                    }
                    let resizer = ''
                    if (col.resizable !== false) {
                        resizer = `<div class="w2ui-resizer" name="${ii}"></div>`
                    }
                    let text = w2utils.lang(typeof col.text == 'function' ? col.text(col) : col.text)
                    tmpf = `<td id="grid_${self.name}_column_${ii}" class="w2ui-head ${sortStyle}" col="${ii}" `+
                           `    rowspan="2" colspan="${colspan}">`+ resizer +
                           `    <div class="w2ui-col-group w2ui-col-header ${sortStyle ? 'w2ui-col-sorted' : ''}">` +
                           `        <div class="${sortStyle}"></div>` + (!text ? '&#160;' : text) +
                           '    </div>'+
                           '</td>'
                    if (col && col.frozen) html1 += tmpf; else html2 += tmpf
                } else {
                    let gText = w2utils.lang(typeof colg.text == 'function' ? colg.text(colg) : colg.text)
                    tmpf = `<td id="grid_${self.name}_column_${ii}" class="w2ui-head" col="${ii}" colspan="${colspan}">` +
                           `    <div class="w2ui-col-group" style="${colg.style ?? ''}">${!gText ? '&#160;' : gText}</div>` +
                           '</td>'
                    if (col && col.frozen) html1 += tmpf; else html2 += tmpf
                }
                ii += colg.span
            }
            html1 += '<td></td></tr>' // need empty column for border-right
            html2 += `<td id="grid_${self.name}_column_end" class="w2ui-head" col="end"></td></tr>`
            return [html1, html2]
        }

        function getColumns(main) {
            let html1 = '<tr>'
            let html2 = '<tr>'
            if (self.show.lineNumbers) {
                html1 += '<td class="w2ui-head w2ui-col-number" col="line-number">' +
                        '    <div>#</div>' +
                        '</td>'
            }
            if (self.show.selectColumn) {
                html1 += '<td class="w2ui-head w2ui-col-select" col="select">' +
                        '    <div>' +
                        `        <input type="checkbox" id="grid_${self.name}_check_all" class="w2ui-select-all" tabindex="-1"` +
                        `            style="${self.multiSelect == false ? 'display: none;' : ''}"` +
                        '        >' +
                        '    </div>' +
                        '</td>'
            }
            if (self.show.expandColumn) {
                html1 += '<td class="w2ui-head w2ui-col-expand" col="expand">' +
                        '    <div>&#160;</div>' +
                        '</td>'
            }
            let ii = 0
            let id = 0
            let colg
            html2 += `<td id="grid_${self.name}_column_start" class="w2ui-head" col="start" style="border-right: 0"></td>`
            if (self.reorderRows) {
                html2 += '<td class="w2ui-head w2ui-col-order" col="order">'+
                        '    <div>&#160;</div>'+
                        '</td>'
            }
            for (let i = 0; i < self.columns.length; i++) {
                let col = self.columns[i]
                if (col.text == null && col.caption != null) {
                    console.log('NOTICE: grid column.caption property is deprecated, please use column.text. Column -> ', col)
                    col.text = col.caption
                }
                if (col.size == null) col.size = '100%'
                if (i == id) { // always true on first iteration
                    colg = self.columnGroups[ii++] || {}
                    id   = id + colg.span
                }
                if ((i < self.last.vscroll.colIndStart || i > self.last.vscroll.colIndEnd) && !col.frozen)
                    continue
                if (col.hidden)
                    continue
                if (colg.main !== true || main) { // grouping of columns
                    let colCellHTML = self.getColumnCellHTML(i)
                    if (col && col.frozen) html1 += colCellHTML; else html2 += colCellHTML
                }
            }
            html1 += '<td class="w2ui-head w2ui-head-last"><div>&#160;</div></td>'
            html2 += '<td class="w2ui-head w2ui-head-last" col="end"><div>&#160;</div></td>'
            html1 += '</tr>'
            html2 += '</tr>'
            return [html1, html2]
        }
    }

    getColumnCellHTML(i) {
        let col = this.columns[i]
        if (col == null) return ''
        // reorder style
        let reorderCols = (this.reorderColumns && (!this.columnGroups || !this.columnGroups.length)) ? ' w2ui-col-reorderable ' : ''
        // sort style
        let sortStyle = ''
        for (let si = 0; si < this.sortData.length; si++) {
            if (this.sortData[si].field == col.field) {
                if ((this.sortData[si].direction || '').toLowerCase() === 'asc') sortStyle = 'w2ui-sort-up'
                if ((this.sortData[si].direction || '').toLowerCase() === 'desc') sortStyle = 'w2ui-sort-down'
            }
        }
        // col selected
        let tmp      = this.last.selection.columns
        let selected = false
        for (let t in tmp) {
            for (let si = 0; si < tmp[t].length; si++) {
                if (tmp[t][si] == i) selected = true
            }
        }
        let text = w2utils.lang(typeof col.text == 'function' ? col.text(col) : col.text)
        let html = '<td id="grid_'+ this.name + '_column_' + i +'" col="'+ i +'" class="w2ui-head '+ sortStyle + reorderCols + '">' +
                         (col.resizable !== false ? '<div class="w2ui-resizer" name="'+ i +'"></div>' : '') +
                    '    <div class="w2ui-col-header '+ (sortStyle ? 'w2ui-col-sorted' : '') +' '+ (selected ? 'w2ui-col-selected' : '') +'">'+
                    '        <div class="'+ sortStyle +'"></div>'+
                            (!text ? '&#160;' : text) +
                    '    </div>'+
                    '</td>'

        return html
    }

    columnTooltipShow(ind, event) {
        let $el  = query(this.box).find('#grid_'+ this.name + '_column_'+ ind)
        let item = this.columns[ind]
        let pos  = this.columnTooltip
        w2tooltip.show({
            name: this.name + '-column-tooltip',
            anchor: $el.get(0),
            html: item?.tooltip,
            position: pos,
        })
    }

    columnTooltipHide(ind, event) {
        w2tooltip.hide(this.name + '-column-tooltip')
    }

    getRecordsHTML() {
        let buffered = this.records.length
        let url      = (typeof this.url != 'object' ? this.url : this.url.get)
        if (this.searchData.length != 0 && !url) buffered = this.last.searchIds.length
        // larger number works better with chrome, smaller with FF.
        if (buffered > this.vs_start) this.last.vscroll.show_extra = this.vs_extra; else this.last.vscroll.show_extra = this.vs_start
        let records = query(this.box).find(`#grid_${this.name}_records`)
        let limit   = Math.floor((records.get(0)?.clientHeight || 0) / this.recordHeight) + this.last.vscroll.show_extra + 1
        if (limit < this.vs_start) {
            limit = this.vs_start
        }
        if (!this.fixedBody || limit > buffered) limit = buffered
        // always need first record for resizing purposes
        let rec_html = this.getRecordHTML(-1, 0)
        let html1    = '<table><tbody>' + rec_html[0]
        let html2    = '<table><tbody>' + rec_html[1]
        // first empty row with height
        html1 += '<tr id="grid_'+ this.name + '_frec_top" line="top" style="height: '+ 0 +'px">'+
                 '    <td colspan="2000"></td>'+
                 '</tr>'
        html2 += '<tr id="grid_'+ this.name + '_rec_top" line="top" style="height: '+ 0 +'px">'+
                 '    <td colspan="2000"></td>'+
                 '</tr>'
        for (let i = 0; i < limit; i++) {
            rec_html = this.getRecordHTML(i, i+1)
            html1   += rec_html[0]
            html2   += rec_html[1]
        }
        let h2 = (buffered - limit) * this.recordHeight
        html1 += '<tr id="grid_' + this.name + '_frec_bottom" rec="bottom" line="bottom" style="height: ' + h2 + 'px; vertical-align: top">' +
                '    <td colspan="2000" style="border: 0"></td>'+
                '</tr>'+
                '<tr id="grid_'+ this.name +'_frec_more" style="display: none; ">'+
                '    <td colspan="2000" class="w2ui-load-more"></td>'+
                '</tr>'+
                '</tbody></table>'
        html2 += '<tr id="grid_' + this.name + '_rec_bottom" rec="bottom" line="bottom" style="height: ' + h2 + 'px; vertical-align: top">' +
                '    <td colspan="2000" style="border: 0"></td>'+
                '</tr>'+
                '<tr id="grid_'+ this.name +'_rec_more" style="display: none">'+
                '    <td colspan="2000" class="w2ui-load-more"></td>'+
                '</tr>'+
                '</tbody></table>'
        this.last.vscroll.recIndStart = 0
        this.last.vscroll.recIndEnd   = limit
        return [html1, html2]
    }

    getSummaryHTML() {
        if (this.summary.length === 0) return
        let rec_html = this.getRecordHTML(-1, 0) // need this in summary too for colspan to work properly
        let html1    = '<table><tbody>' + rec_html[0]
        let html2    = '<table><tbody>' + rec_html[1]
        for (let i = 0; i < this.summary.length; i++) {
            rec_html = this.getRecordHTML(i, i+1, true)
            html1   += rec_html[0]
            html2   += rec_html[1]
        }
        html1 += '</tbody></table>'
        html2 += '</tbody></table>'
        return [html1, html2]
    }

    scroll(event) {
        let obj      = this
        let url      = (typeof this.url != 'object' ? this.url : this.url.get)
        let records  = query(this.box).find(`#grid_${this.name}_records`)
        let frecords = query(this.box).find(`#grid_${this.name}_frecords`)
        // sync scroll positions
        if (event) {
            let sTop  = event.target.scrollTop
            let sLeft = event.target.scrollLeft
            this.last.vscroll.scrollTop  = sTop
            this.last.vscroll.scrollLeft = sLeft
            let cols = query(this.box).find(`#grid_${this.name}_columns`)[0]
            let summary = query(this.box).find(`#grid_${this.name}_summary`)[0]
            if (cols) cols.scrollLeft = sLeft
            if (summary) summary.scrollLeft = sLeft
            if (frecords[0]) frecords[0].scrollTop = sTop
        }
        // hide bubble
        if (this.last.bubbleEl) {
            w2tooltip.hide(this.name + '-bubble')
            this.last.bubbleEl = null
        }
        // column virtual scroll
        let colStart = null
        let colEnd   = null
        if (this.disableCVS || this.columnGroups.length > 0) {
            // disable virtual scroll
            colStart = 0
            colEnd   = this.columns.length - 1
        } else {
            let sWidth = records.prop('clientWidth')
            let cLeft  = 0
            for (let i = 0; i < this.columns.length; i++) {
                if (this.columns[i].frozen || this.columns[i].hidden) continue
                let cSize = parseInt(this.columns[i].sizeCalculated ? this.columns[i].sizeCalculated : this.columns[i].size)
                if (cLeft + cSize + 30 > this.last.vscroll.scrollLeft && colStart == null) colStart = i
                if (cLeft + cSize - 30 > this.last.vscroll.scrollLeft + sWidth && colEnd == null) colEnd = i
                cLeft += cSize
            }
            if (colEnd == null) colEnd = this.columns.length - 1
        }
        if (colStart != null) {
            if (colStart < 0) colStart = 0
            if (colEnd < 0) colEnd = 0
            if (colStart == colEnd) {
                if (colStart > 0) colStart--; else colEnd++ // show at least one column
            }
            // ---------
            if (colStart != this.last.vscroll.colIndStart || colEnd != this.last.vscroll.colIndEnd) {
                let $box = query(this.box)
                let deltaStart = Math.abs(colStart - this.last.vscroll.colIndStart)
                let deltaEnd   = Math.abs(colEnd - this.last.vscroll.colIndEnd)
                // add/remove columns for small jumps
                if (deltaStart < 5 && deltaEnd < 5) {
                    let $cfirst = $box.find(`.w2ui-grid-columns #grid_${this.name}_column_start`)
                    let $clast  = $box.find('.w2ui-grid-columns .w2ui-head-last')
                    let $rfirst = $box.find(`#grid_${this.name}_records .w2ui-grid-data-spacer`)
                    let $rlast  = $box.find(`#grid_${this.name}_records .w2ui-grid-data-last`)
                    let $sfirst = $box.find(`#grid_${this.name}_summary .w2ui-grid-data-spacer`)
                    let $slast  = $box.find(`#grid_${this.name}_summary .w2ui-grid-data-last`)
                    // remove on left
                    if (colStart > this.last.vscroll.colIndStart) {
                        for (let i = this.last.vscroll.colIndStart; i < colStart; i++) {
                            $box.find('#grid_'+ this.name +'_columns #grid_'+ this.name +'_column_'+ i).remove() // column
                            $box.find('#grid_'+ this.name +'_records td[col="'+ i +'"]').remove() // record
                            $box.find('#grid_'+ this.name +'_summary td[col="'+ i +'"]').remove() // summary
                        }
                    }
                    // remove on right
                    if (colEnd < this.last.vscroll.colIndEnd) {
                        for (let i = this.last.vscroll.colIndEnd; i > colEnd; i--) {
                            $box.find('#grid_'+ this.name +'_columns #grid_'+ this.name +'_column_'+ i).remove() // column
                            $box.find('#grid_'+ this.name +'_records td[col="'+ i +'"]').remove() // record
                            $box.find('#grid_'+ this.name +'_summary td[col="'+ i +'"]').remove() // summary
                        }
                    }
                    // add on left
                    if (colStart < this.last.vscroll.colIndStart) {
                        for (let i = this.last.vscroll.colIndStart - 1; i >= colStart; i--) {
                            if (this.columns[i] && (this.columns[i].frozen || this.columns[i].hidden)) continue
                            $cfirst.after(this.getColumnCellHTML(i)) // column
                            // record
                            $rfirst.each(el => {
                                let index = query(el).parent().attr('index')
                                let td    = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px"></td>' // width column
                                if (index != null) td = this.getCellHTML(parseInt(index), i, false)
                                query(el).after(td)
                            })
                            // summary
                            $sfirst.each(el => {
                                let index = query(el).parent().attr('index')
                                let td    = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px"></td>' // width column
                                if (index != null) td = this.getCellHTML(parseInt(index), i, true)
                                query(el).after(td)
                            })
                        }
                    }
                    // add on right
                    if (colEnd > this.last.vscroll.colIndEnd) {
                        for (let i = this.last.vscroll.colIndEnd + 1; i <= colEnd; i++) {
                            if (this.columns[i] && (this.columns[i].frozen || this.columns[i].hidden)) continue
                            $clast.before(this.getColumnCellHTML(i)) // column
                            // record
                            $rlast.each(el => {
                                let index = query(el).parent().attr('index')
                                let td    = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px"></td>' // width column
                                if (index != null) td = this.getCellHTML(parseInt(index), i, false)
                                query(el).before(td)
                            })
                            // summary
                            $slast.each(el => {
                                let index = query(el).parent().attr('index') || -1
                                let td    = this.getCellHTML(parseInt(index), i, true)
                                query(el).before(td)
                            })
                        }
                    }
                    this.last.vscroll.colIndStart = colStart
                    this.last.vscroll.colIndEnd   = colEnd
                    this.resizeRecords()
                } else {
                    this.last.vscroll.colIndStart = colStart
                    this.last.vscroll.colIndEnd   = colEnd
                    // dot not just call this.refresh();
                    let colHTML   = this.getColumnsHTML()
                    let recHTML   = this.getRecordsHTML()
                    let sumHTML   = this.getSummaryHTML()
                    let $columns  = $box.find(`#grid_${this.name}_columns`)
                    let $records  = $box.find(`#grid_${this.name}_records`)
                    let $frecords = $box.find(`#grid_${this.name}_frecords`)
                    let $summary  = $box.find(`#grid_${this.name}_summary`)
                    $columns.find('tbody').html(colHTML[1])
                    $frecords.html(recHTML[0])
                    $records.prepend(recHTML[1])
                    if (sumHTML != null) $summary.html(sumHTML[1])
                    // need timeout to clean up (otherwise scroll problem)
                    setTimeout(() => {
                        $records.find(':scope > table').filter(':not(table:first-child)').remove()
                        if ($summary[0]) $summary[0].scrollLeft = this.last.vscroll.scrollLeft
                    }, 1)
                    this.resizeRecords()
                }
            }
        }
        // perform virtual scroll
        let buffered = this.records.length
        if (buffered > this.total && this.total !== -1) buffered = this.total
        if (this.searchData.length != 0 && !url) buffered = this.last.searchIds.length
        if (buffered === 0 || records.length === 0 || records.prop('clientHeight') === 0) return
        if (buffered > this.vs_start) this.last.vscroll.show_extra = this.vs_extra; else this.last.vscroll.show_extra = this.vs_start
        // update footer
        let t1 = Math.round(records.prop('scrollTop') / this.recordHeight + 1)
        let t2 = t1 + (Math.round(records.prop('clientHeight') / this.recordHeight) - 1)
        if (t1 > buffered) t1 = buffered
        if (t2 >= buffered - 1) t2 = buffered
        query(this.box).find('#grid_'+ this.name + '_footer .w2ui-footer-right').html(
            (this.show.statusRange
                ? w2utils.formatNumber(this.offset + t1) + '-' + w2utils.formatNumber(this.offset + t2) +
                    (this.total != -1 ? ' ' + w2utils.lang('of') + ' <span class="w2ui-total">' + w2utils.formatNumber(this.total) + '</span>' : '')
                    : '') +
            (url && this.show.statusBuffered ? ' ('+ w2utils.lang('buffered') + ' <span class="w2ui-buffered">'+ w2utils.formatNumber(buffered) + '</span>' +
                    (this.offset > 0 ? ', skip <span class="w2ui-skip">' + w2utils.formatNumber(this.offset) : '') + '</span>)' : '')
        )
        // only for local data source, else no extra records loaded
        if (!url && (!this.fixedBody || (this.total != -1 && this.total <= this.vs_start))) return
        // regular processing
        let start = Math.floor(records.prop('scrollTop') / this.recordHeight) - this.last.vscroll.show_extra
        let end   = start + Math.floor(records.prop('clientHeight') / this.recordHeight) + this.last.vscroll.show_extra * 2 + 1
        // let div  = start - this.last.vscroll.recIndStart;
        if (start < 1) start = 1
        if (end > this.total && this.total != -1) end = this.total
        let tr1  = records.find('#grid_'+ this.name +'_rec_top')
        let tr2  = records.find('#grid_'+ this.name +'_rec_bottom')
        let tr1f = frecords.find('#grid_'+ this.name +'_frec_top')
        let tr2f = frecords.find('#grid_'+ this.name +'_frec_bottom')
        // if row is expanded
        if (String(tr1.next().prop('id')).indexOf('_expanded_row') != -1) {
            tr1.next().remove()
            tr1f.next().remove()
        }
        if (this.total > end && String(tr2.prev().prop('id')).indexOf('_expanded_row') != -1) {
            tr2.prev().remove()
            tr2f.prev().remove()
        }
        let first = parseInt(tr1.next().attr('line'))
        let last  = parseInt(tr2.prev().attr('line'))
        let tmp, tmp1, tmp2, rec_start, rec_html
        if (first <= start || first == 1 || this.last.vscroll.pull_refresh) { // scroll down
            if (end <= last + this.last.vscroll.show_extra - 2 && end != this.total) return
            this.last.vscroll.pull_refresh = false
            // remove from top
            while (true) {
                tmp1 = frecords.find('#grid_'+ this.name +'_frec_top').next()
                tmp2 = records.find('#grid_'+ this.name +'_rec_top').next()
                if (tmp2.attr('line') == 'bottom') break
                if (parseInt(tmp2.attr('line')) < start) {
                    tmp1.remove()
                    tmp2.remove()
                } else {
                    break
                }
            }
            // add at bottom
            tmp = records.find('#grid_'+ this.name +'_rec_bottom').prev()
            rec_start = tmp.attr('line')
            if (rec_start == 'top') rec_start = start
            for (let i = parseInt(rec_start) + 1; i <= end; i++) {
                if (!this.records[i-1]) continue
                tmp2 = this.records[i-1].w2ui
                if (tmp2 && !Array.isArray(tmp2.children)) {
                    tmp2.expanded = false
                }
                rec_html = this.getRecordHTML(i-1, i)
                tr2.before(rec_html[1])
                tr2f.before(rec_html[0])
            }
            markSearch()
            setTimeout(() => { this.refreshRanges() }, 0)
        } else { // scroll up
            if (start >= first - this.last.vscroll.show_extra + 2 && start > 1) return
            // remove from bottom
            while (true) {
                tmp1 = frecords.find('#grid_'+ this.name +'_frec_bottom').prev()
                tmp2 = records.find('#grid_'+ this.name +'_rec_bottom').prev()
                if (tmp2.attr('line') == 'top') break
                if (parseInt(tmp2.attr('line')) > end) {
                    tmp1.remove()
                    tmp2.remove()
                } else {
                    break
                }
            }
            // add at top
            tmp       = records.find('#grid_'+ this.name +'_rec_top').next()
            rec_start = tmp.attr('line')
            if (rec_start == 'bottom') rec_start = end
            for (let i = parseInt(rec_start) - 1; i >= start; i--) {
                if (!this.records[i-1]) continue
                tmp2 = this.records[i-1].w2ui
                if (tmp2 && !Array.isArray(tmp2.children)) {
                    tmp2.expanded = false
                }
                rec_html = this.getRecordHTML(i-1, i)
                tr1.after(rec_html[1])
                tr1f.after(rec_html[0])
            }
            markSearch()
            setTimeout(() => { this.refreshRanges() }, 0)
        }
        // first/last row size
        let h1 = (start - 1) * this.recordHeight
        let h2 = (buffered - end) * this.recordHeight
        if (h2 < 0) h2 = 0
        tr1.css('height', h1 + 'px')
        tr1f.css('height', h1 + 'px')
        tr2.css('height', h2 + 'px')
        tr2f.css('height', h2 + 'px')
        this.last.vscroll.recIndStart = start
        this.last.vscroll.recIndEnd   = end
        // load more if needed
        let s = Math.floor(records.prop('scrollTop') / this.recordHeight)
        let e = s + Math.floor(records.prop('clientHeight') / this.recordHeight)
        if (e + 10 > buffered && this.last.vscroll.pull_more !== true && (buffered < this.total - this.offset || (this.total == -1 && this.last.fetch.hasMore))) {
            if (this.autoLoad === true) {
                this.last.vscroll.pull_more   = true
                this.last.fetch.offset += this.limit
                this.request('load')
            }
            // scroll function
            let more = query(this.box).find('#grid_'+ this.name +'_rec_more, #grid_'+ this.name +'_frec_more')
            more.show()
                .eq(1) // only main table
                .off('.load-more')
                .on('click.load-more', function() {
                    // show spinner
                    query(this).find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>')
                    // load more
                    obj.last.vscroll.pull_more   = true
                    obj.last.fetch.offset += obj.limit
                    obj.request('load')
                })
                .find('td')
                .html(obj.autoLoad
                    ? '<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>'
                    : '<div style="padding-top: 15px">'+ w2utils.lang('Load ${count} more...', { count: obj.limit }) + '</div>'
                )
        }

        function markSearch() {
            // mark search
            if (!obj.markSearch) return
            clearTimeout(obj.last.marker_timer)
            obj.last.marker_timer = setTimeout(() => {
                // mark all search strings
                let search = []
                for (let s = 0; s < obj.searchData.length; s++) {
                    let sdata = obj.searchData[s]
                    let fld   = obj.getSearch(sdata.field)
                    if (!fld || fld.hidden) continue
                    let ind = obj.getColumn(sdata.field, true)
                    search.push({ field: sdata.field, search: sdata.value, col: ind })
                }
                if (search.length > 0) {
                    search.forEach((item) => {
                        let el = query(obj.box).find('td[col="'+ item.col +'"]:not(.w2ui-head)')
                        w2utils.marker(el, item.search)
                    })
                }
            }, 50)
        }
    }

    getRecordHTML(ind, lineNum, summary) {
        let tmph      = ''
        let rec_html1 = ''
        let rec_html2 = ''
        let sel       = this.last.selection
        let record
        // first record needs for resize purposes
        if (ind == -1) {
            rec_html1 += '<tr line="0">'
            rec_html2 += '<tr line="0">'
            if (this.show.lineNumbers) rec_html1 += '<td class="w2ui-col-number" style="height: 0px"></td>'
            if (this.show.selectColumn) rec_html1 += '<td class="w2ui-col-select" style="height: 0px"></td>'
            if (this.show.expandColumn) rec_html1 += '<td class="w2ui-col-expand" style="height: 0px"></td>'
            rec_html2 += '<td class="w2ui-grid-data w2ui-grid-data-spacer" col="start" style="height: 0px; width: 0px"></td>'
            if (this.reorderRows) rec_html2 += '<td class="w2ui-col-order" style="height: 0px"></td>'
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                tmph    = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px;"></td>'
                if (col.frozen && !col.hidden) {
                    rec_html1 += tmph
                } else {
                    if (col.hidden || i < this.last.vscroll.colIndStart || i > this.last.vscroll.colIndEnd) continue
                    rec_html2 += tmph
                }
            }
            rec_html1 += '<td class="w2ui-grid-data-last" style="height: 0px"></td>'
            rec_html2 += '<td class="w2ui-grid-data-last" col="end" style="height: 0px"></td>'
            rec_html1 += '</tr>'
            rec_html2 += '</tr>'
            return [rec_html1, rec_html2]
        }
        // regular record
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (summary !== true) {
            if (this.searchData.length > 0 && !url) {
                if (ind >= this.last.searchIds.length) return ''
                ind    = this.last.searchIds[ind]
                record = this.records[ind]
            } else {
                if (ind >= this.records.length) return ''
                record = this.records[ind]
            }
        } else {
            if (ind >= this.summary.length) return ''
            record = this.summary[ind]
        }
        if (!record) return ''
        if (record.recid == null && this.recid != null) {
            let rid = this.parseField(record, this.recid)
            if (rid != null) record.recid = rid
        }
        let isRowSelected = false
        if (sel.indexes.indexOf(ind) != -1) isRowSelected = true
        let rec_style = (record.w2ui ? record.w2ui.style : '')
        if (rec_style == null || typeof rec_style != 'string') rec_style = ''
        let rec_class = (record.w2ui ? record.w2ui.class : '')
        if (rec_class == null || typeof rec_class != 'string') rec_class = ''
        // render TR
        rec_html1 += '<tr id="grid_'+ this.name +'_frec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" index="'+ ind +'" '+
            ' class="'+ (lineNum % 2 === 0 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-record ' + rec_class +
                (isRowSelected && this.selectType == 'row' ? ' w2ui-selected' : '') +
                (record.w2ui && record.w2ui.editable === false ? ' w2ui-no-edit' : '') +
                (record.w2ui && record.w2ui.expanded === true ? ' w2ui-expanded' : '') + '" ' +
            ' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && rec_style != '' ? rec_style : rec_style.replace('background-color', 'none')) +'" '+
                (rec_style != '' ? 'custom_style="'+ rec_style +'"' : '') +
            '>'
        rec_html2 += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" index="'+ ind +'" '+
            ' class="'+ (lineNum % 2 === 0 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-record ' + rec_class +
                (isRowSelected && this.selectType == 'row' ? ' w2ui-selected' : '') +
                (record.w2ui && record.w2ui.editable === false ? ' w2ui-no-edit' : '') +
                (record.w2ui && record.w2ui.expanded === true ? ' w2ui-expanded' : '') + '" ' +
            ' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && rec_style != '' ? rec_style : rec_style.replace('background-color', 'none')) +'" '+
                (rec_style != '' ? 'custom_style="'+ rec_style +'"' : '') +
            '>'
        if (this.show.lineNumbers) {
            rec_html1 += '<td id="grid_'+ this.name +'_cell_'+ ind +'_number' + (summary ? '_s' : '') + '" '+
                        '   class="w2ui-col-number '+ (isRowSelected ? ' w2ui-row-selected' : '') +'"'+
                            (this.reorderRows ? ' style="cursor: move"' : '') + '>'+
                            (summary !== true ? this.getLineHTML(lineNum, record) : '') +
                        '</td>'
        }
        if (this.show.selectColumn) {
            rec_html1 +=
                    '<td id="grid_'+ this.name +'_cell_'+ ind +'_select' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-select">'+
                        (summary !== true && !(record.w2ui && record.w2ui.hideCheckBox === true) ?
                        '    <div>'+
                        '        <input class="w2ui-grid-select-check" type="checkbox" tabindex="-1" '+
                                    (isRowSelected ? 'checked="checked"' : '') + ' style="pointer-events: none"/>'+
                        '    </div>'
                        :
                        '' ) +
                    '</td>'
        }
        if (this.show.expandColumn) {
            let tmp_img = ''
            if (record.w2ui?.expanded === true) tmp_img = '-'; else tmp_img = '+'
            if ((record.w2ui?.expanded == 'none' || !Array.isArray(record.w2ui?.children) || !record.w2ui?.children.length)) tmp_img = '+'
            if (record.w2ui?.expanded == 'spinner') tmp_img = '<div class="w2ui-spinner" style="width: 16px; margin: -2px 2px;"></div>'
            rec_html1 +=
                    '<td id="grid_'+ this.name +'_cell_'+ ind +'_expand' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-expand">'+
                        (summary !== true ? `<div>${tmp_img}</div>` : '' ) +
                    '</td>'
        }
        // insert empty first column
        rec_html2 += '<td class="w2ui-grid-data-spacer" col="start" style="border-right: 0"></td>'
        if (this.reorderRows) {
            rec_html2 +=
                    '<td id="grid_'+ this.name +'_cell_'+ ind +'_order' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-order" col="order">'+
                        (summary !== true ? '<div title="Drag to reorder">&nbsp;</div>' : '' ) +
                    '</td>'
        }
        let col_ind  = 0
        let col_skip = 0
        while (true) {
            let col_span = 1
            let col      = this.columns[col_ind]
            if (col == null) break
            if (col.hidden) {
                col_ind++
                if (col_skip > 0) col_skip--
                continue
            }
            if (col_skip > 0) {
                col_ind++
                if (this.columns[col_ind] == null) break
                record.w2ui.colspan[this.columns[col_ind-1].field] = 0 // need it for other methods
                col_skip--
                continue
            } else if (record.w2ui) {
                let tmp1 = record.w2ui.colspan
                let tmp2 = this.columns[col_ind].field
                if (tmp1 && tmp1[tmp2] === 0) {
                    delete tmp1[tmp2] // if no longer colspan then remove 0
                }
            }
            // column virtual scroll
            if ((col_ind < this.last.vscroll.colIndStart || col_ind > this.last.vscroll.colIndEnd) && !col.frozen) {
                col_ind++
                continue
            }
            if (record.w2ui) {
                if (typeof record.w2ui.colspan == 'object') {
                    let span = parseInt(record.w2ui.colspan[col.field]) || null
                    if (span > 1) {
                        // if there are hidden columns, then no colspan on them
                        let hcnt = 0
                        for (let i = col_ind; i < col_ind + span; i++) {
                            if (i >= this.columns.length) break
                            if (this.columns[i].hidden) hcnt++
                        }
                        col_span = span - hcnt
                        col_skip = span - 1
                    }
                }
            }
            let rec_cell = this.getCellHTML(ind, col_ind, summary, col_span)
            if (col.frozen) rec_html1 += rec_cell; else rec_html2 += rec_cell
            col_ind++
        }
        rec_html1 += '<td class="w2ui-grid-data-last"></td>'
        rec_html2 += '<td class="w2ui-grid-data-last" col="end"></td>'
        rec_html1 += '</tr>'
        rec_html2 += '</tr>'
        return [rec_html1, rec_html2]
    }

    getLineHTML(lineNum) {
        return '<div>' + lineNum + '</div>'
    }

    getCellHTML(ind, col_ind, summary, col_span) {
        let obj = this
        let col = this.columns[col_ind]
        if (col == null) return ''
        let record  = (summary !== true ? this.records[ind] : this.summary[ind])
        // value, attr, style, className, divAttr
        let { value, style, className, attr, divAttr } = this.getCellValue(ind, col_ind, summary, true)
        let edit = (ind !== -1 ? this.getCellEditable(ind, col_ind) : '')
        let divStyle = 'max-height: '+ parseInt(this.recordHeight) +'px;' + (col.clipboardCopy ? 'margin-right: 20px' : '')
        let isChanged = !summary && record?.w2ui?.changes && record.w2ui.changes[col.field] != null
        let sel = this.last.selection
        let isRowSelected = false
        let infoBubble    = ''
        if (sel.indexes.indexOf(ind) != -1) isRowSelected = true
        if (col_span == null) {
            if (record?.w2ui?.colspan && record.w2ui.colspan[col.field]) {
                col_span = record.w2ui.colspan[col.field]
            } else {
                col_span = 1
            }
        }
        // expand icon
        if (col_ind === 0 && Array.isArray(record?.w2ui?.children)) {
            let level  = 0
            let subrec = this.get(record.w2ui.parent_recid, true)
            while (true) {
                if (subrec != null) {
                    level++
                    let tmp = this.records[subrec].w2ui
                    if (tmp != null && tmp.parent_recid != null) {
                        subrec = this.get(tmp.parent_recid, true)
                    } else {
                        break
                    }
                } else {
                    break
                }
            }
            if (record.w2ui.parent_recid) {
                for (let i = 0; i < level; i++) {
                    infoBubble += '<span class="w2ui-show-children w2ui-icon-empty"></span>'
                }
            }
            let className = record.w2ui.children.length > 0
                ? (record.w2ui.expanded ? 'w2ui-icon-collapse' : 'w2ui-icon-expand')
                : 'w2ui-icon-empty'
            infoBubble += `<span class="w2ui-show-children ${className}"></span>`
        }
        // info bubble
        if (col.info === true) col.info = {}
        if (col.info != null) {
            let infoIcon = 'w2ui-icon-info'
            if (typeof col.info.icon == 'function') {
                infoIcon = col.info.icon(record, { self: this, index: ind, colIndex: col_ind, summary: !!summary })
            } else if (typeof col.info.icon == 'object') {
                infoIcon = col.info.icon[this.parseField(record, col.field)] || ''
            } else if (typeof col.info.icon == 'string') {
                infoIcon = col.info.icon
            }
            let infoStyle = col.info.style || ''
            if (typeof col.info.style == 'function') {
                infoStyle = col.info.style(record, { self: this, index: ind, colIndex: col_ind, summary: !!summary })
            } else if (typeof col.info.style == 'object') {
                infoStyle = col.info.style[this.parseField(record, col.field)] || ''
            } else if (typeof col.info.style == 'string') {
                infoStyle = col.info.style
            }
            infoBubble += `<span class="w2ui-info ${infoIcon}" style="${infoStyle}"></span>`
        }
        let data = value
        // if editable checkbox
        if (edit && ['checkbox', 'check'].indexOf(edit.type) != -1) {
            let changeInd = summary ? -(ind + 1) : ind
            divStyle += 'text-align: center;'
            data  = `<input tabindex="-1" type="checkbox" class="w2ui-editable-checkbox"
                            data-changeInd="${changeInd}" data-colInd="${col_ind}" ${data ? 'checked="checked"' : ''}>`
            infoBubble    = ''
        }
        data = `<div style="${divStyle}" ${getTitle(data)} ${divAttr}>${infoBubble}${String(data)}</div>`
        if (data == null) data = ''
        // --> cell TD
        if (typeof col.render == 'string') {
            let tmp = col.render.toLowerCase().split(':')
            if (['number', 'int', 'float', 'money', 'currency', 'percent', 'size'].indexOf(tmp[0]) != -1) {
                style += 'text-align: right;'
            }
        }
        if (record?.w2ui) {
            if (typeof record.w2ui.style == 'object') {
                if (typeof record.w2ui.style[col_ind] == 'string') style += record.w2ui.style[col_ind] + ';'
                if (typeof record.w2ui.style[col.field] == 'string') style += record.w2ui.style[col.field] + ';'
            }
            if (typeof record.w2ui.class == 'object') {
                if (typeof record.w2ui.class[col_ind] == 'string') className += record.w2ui.class[col_ind] + ' '
                if (typeof record.w2ui.class[col.field] == 'string') className += record.w2ui.class[col.field] + ' '
            }
        }
        let isCellSelected = false
        if (isRowSelected && sel.columns[ind]?.includes(col_ind)) isCellSelected = true
        // clipboardCopy
        let clipboardIcon
        if (col.clipboardCopy){
            clipboardIcon = '<span class="w2ui-clipboard-copy w2ui-icon-paste"></span>'
        }
        // data
        data = '<td class="w2ui-grid-data'+ (isCellSelected ? ' w2ui-selected' : '') + ' ' + className +
                    (isChanged ? ' w2ui-changed' : '') + '" '+
                '   id="grid_'+ this.name +'_data_'+ ind +'_'+ col_ind +'" col="'+ col_ind +'" '+
                '   style="'+ style + (col.style != null ? col.style : '') +'" '+
                    (col.attr != null ? col.attr : '') + attr +
                    (col_span > 1 ? 'colspan="'+ col_span + '"' : '') +
                '>' + data + (clipboardIcon && w2utils.stripTags(data) ? clipboardIcon : '') +'</td>'
        // summary top row
        if (ind === -1 && summary === true) {
            data = '<td class="w2ui-grid-data" col="'+ col_ind +'" style="height: 0px; '+ style + '" '+
                        (col_span > 1 ? 'colspan="'+ col_span + '"' : '') +
                    '></td>'
        }
        return data

        function getTitle(cellData){
            let title
            if (obj.show.recordTitles) {
                if (col.title != null) {
                    if (typeof col.title == 'function') {
                        title = col.title.call(obj, record, { self: this, index: ind, colIndex: col_ind, summary: !!summary })
                    }
                    if (typeof col.title == 'string') title = col.title
                } else {
                    title = w2utils.stripTags(String(cellData).replace(/"/g, '\'\''))
                }
            }
            return (title != null) ? 'title="' + String(title) + '"' : ''
        }
    }

    clipboardCopy(ind, col_ind, summary) {
        let rec = summary ? this.summary[ind] : this.records[ind]
        let col = this.columns[col_ind]
        let txt = (col ? this.parseField(rec, col.field) : '')
        if (typeof col.clipboardCopy == 'function') {
            txt = col.clipboardCopy(rec, { self: this, index: ind, colIndex: col_ind, summary: !!summary })
        }
        query(this.box).find('#grid_' + this.name + '_focus').text(txt).get(0).select()
        document.execCommand('copy')
    }

    showBubble(ind, col_ind, summary) {
        let info = this.columns[col_ind].info
        if (!info) return
        let html = ''
        let rec  = this.records[ind]
        let el   = query(this.box).find(`${summary ? '.w2ui-grid-summary' : ''} #grid_${this.name}_data_${ind}_${col_ind} .w2ui-info`)
        if (this.last.bubbleEl) {
            w2tooltip.hide(this.name + '-bubble')
        }
        this.last.bubbleEl = el
        // if no fields defined - show all
        if (info.fields == null) {
            info.fields = []
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                info.fields.push(col.field + (typeof col.render == 'string' ? ':' + col.render : ''))
            }
        }
        let fields = info.fields
        if (typeof fields == 'function') {
            fields = fields(rec, { self: this, index: ind, colIndex: col_ind, summary: !!summary }) // custom renderer
        }
        // generate html
        if (typeof info.render == 'function') {
            html = info.render(rec, { self: this, index: ind, colIndex: col_ind, summary: !!summary })

        } else if (Array.isArray(fields)) {
            // display mentioned fields
            html = '<table cellpadding="0" cellspacing="0">'
            for (let i = 0; i < fields.length; i++) {
                let tmp = String(fields[i]).split(':')
                if (tmp[0] == '' || tmp[0] == '-' || tmp[0] == '--' || tmp[0] == '---') {
                    html += '<tr><td colspan=2><div style="border-top: '+ (tmp[0] == '' ? '0' : '1') +'px solid #C1BEBE; margin: 6px 0px;"></div></td></tr>'
                    continue
                }
                let col = this.getColumn(tmp[0])
                if (col == null) col = { field: tmp[0], caption: tmp[0] } // if not found in columns
                let val = (col ? this.parseField(rec, col.field) : '')
                if (tmp.length > 1) {
                    if (w2utils.formatters[tmp[1]]) {
                        val = w2utils.formatters[tmp[1]](val, tmp[2] || null, rec)
                    } else {
                        console.log('ERROR: w2utils.formatters["'+ tmp[1] + '"] does not exists.')
                    }
                }
                if (info.showEmpty !== true && (val == null || val == '')) continue
                if (info.maxLength != null && typeof val == 'string' && val.length > info.maxLength) val = val.substr(0, info.maxLength) + '...'
                html += '<tr><td>' + col.text + '</td><td>' + ((val === 0 ? '0' : val) || '') + '</td></tr>'
            }
            html += '</table>'
        } else if (w2utils.isPlainObject(fields)) {
            // display some fields
            html = '<table cellpadding="0" cellspacing="0">'
            for (let caption in fields) {
                let fld = fields[caption]
                if (fld == '' || fld == '-' || fld == '--' || fld == '---') {
                    html += '<tr><td colspan=2><div style="border-top: '+ (fld == '' ? '0' : '1') +'px solid #C1BEBE; margin: 6px 0px;"></div></td></tr>'
                    continue
                }
                let tmp = String(fld).split(':')
                let col = this.getColumn(tmp[0])
                if (col == null) col = { field: tmp[0], caption: tmp[0] } // if not found in columns
                let val = (col ? this.parseField(rec, col.field) : '')
                if (tmp.length > 1) {
                    if (w2utils.formatters[tmp[1]]) {
                        val = w2utils.formatters[tmp[1]](val, tmp[2] || null, rec)
                    } else {
                        console.log('ERROR: w2utils.formatters["'+ tmp[1] + '"] does not exists.')
                    }
                }
                if (typeof fld == 'function') {
                    val = fld(rec, { self: this, index: ind, colIndex: col_ind, summary: !!summary })
                }
                if (info.showEmpty !== true && (val == null || val == '')) continue
                if (info.maxLength != null && typeof val == 'string' && val.length > info.maxLength) val = val.substr(0, info.maxLength) + '...'
                html += '<tr><td>' + caption + '</td><td>' + ((val === 0 ? '0' : val) || '') + '</td></tr>'
            }
            html += '</table>'
        }
        return w2tooltip.show(w2utils.extend({
            name: this.name + '-bubble',
            html,
            anchor: el.get(0),
            position: 'top|bottom',
            class: 'w2ui-info-bubble',
            style: '',
            hideOn: ['doc-click']
        }, info.options ?? {}))
            .hide(() => [
                this.last.bubbleEl = null
            ])
    }

    // return null or the editable object if the given cell is editable
    getCellEditable(ind, col_ind) {
        let col = this.columns[col_ind]
        let rec = this.records[ind]
        if (!rec || !col) return null
        let edit = (rec.w2ui ? rec.w2ui.editable : null)
        if (edit === false) return null
        if (edit == null || edit === true) {
            edit = (Object.keys(col.editable ?? {}).length > 0 ? col.editable : null)
            if (typeof edit === 'function') {
                let value = this.getCellValue(ind, col_ind, false)
                // same arguments as col.render()
                edit = edit.call(this, rec, { self: this, value, index: ind, colIndex: col_ind })
            }
        }
        return edit
    }

    getCellValue(ind, col_ind, summary, extra) {
        let col = this.columns[col_ind]
        let record = (summary !== true ? this.records[ind] : this.summary[ind])
        let value = this.parseField(record, col.field)
        let className = '', style = '', attr = '', divAttr = ''
        // if change by inline editing
        if (record?.w2ui?.changes?.[col.field] != null) {
            value = record.w2ui.changes[col.field]
        }
        // if there is a cell renderer
        if (col.render != null && ind !== -1) {
            if (typeof col.render == 'function' && record != null) {
                let html
                try {
                    html = col.render.call(this, record, { self: this, value, index: ind, colIndex: col_ind, summary: !!summary })
                } catch (e) {
                    throw new Error(`Render function for column "${col.field}" in grid "${this.name}": -- ` + e.message)
                }
                if (html != null && typeof html == 'object' && typeof html != 'function') {
                    if (html.id != null && html.text != null) {
                        // normalized menu kind of return
                        value = html.text
                    } else if (typeof html.html == 'string') {
                        value = (html.html || '').trim()
                    } else {
                        value = ''
                        console.log('ERROR: render function should return a primitive or an object of the following structure.',
                            { html: '', attr: '', style: '', class: '', divAttr: '' })
                    }
                    attr = html.attr ?? ''
                    style = html.style ?? ''
                    className = html.class ?? ''
                    divAttr = html.divAttr ?? ''
                } else {
                    value = String(html || '').trim()
                }
            }
            // if it is an object
            if (typeof col.render == 'object') {
                let tmp = col.render[value]
                if (tmp != null && tmp !== '') {
                    value = tmp
                }
            }
            // formatters
            if (typeof col.render == 'string') {
                let strInd = col.render.toLowerCase().indexOf(':')
                let tmp = []
                if (strInd == -1) {
                    tmp[0] = col.render.toLowerCase()
                    tmp[1] = ''
                } else {
                    tmp[0] = col.render.toLowerCase().substr(0, strInd)
                    tmp[1] = col.render.toLowerCase().substr(strInd + 1)
                }
                // formatters
                let func = w2utils.formatters[tmp[0]]
                if (col.options && col.options.autoFormat === false) {
                    func = null
                }
                value = (typeof func == 'function' ? func(value, tmp[1], record) : '')
            }
        }
        if (value == null) value = ''
        return !extra ? value : { value, attr, style, className, divAttr }
    }

    getFooterHTML() {
        return '<div>'+
            '    <div class="w2ui-footer-left"></div>'+
            '    <div class="w2ui-footer-right"></div>'+
            '    <div class="w2ui-footer-center"></div>'+
            '</div>'
    }

    status(msg) {
        if (msg != null) {
            query(this.box).find(`#grid_${this.name}_footer`).find('.w2ui-footer-left').html(msg)
        } else {
            // show number of selected
            let msgLeft = ''
            let sel     = this.getSelection()
            if (sel.length > 0) {
                if (this.show.statusSelection && sel.length > 1) {
                    msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + w2utils.settings.groupSymbol) + ' ' + w2utils.lang('selected')
                }
                if (this.show.statusRecordID && sel.length == 1) {
                    let tmp = sel[0]
                    if (typeof tmp == 'object') tmp = tmp.recid + ', '+ w2utils.lang('Column') +': '+ tmp.column
                    msgLeft = w2utils.lang('Record ID') + ': '+ tmp + ' '
                }
            }
            query(this.box).find('#grid_'+ this.name +'_footer .w2ui-footer-left').html(msgLeft)
        }
    }

    lock(msg, showSpinner) {
        let args = Array.from(arguments)
        args.unshift(this.box)
        setTimeout(() => {
            // hide empty msg if any
            query(this.box).find('#grid_'+ this.name +'_empty_msg').remove()
            w2utils.lock(...args)
        }, 10)
    }

    unlock(speed) {
        setTimeout(() => {
            // do not unlock if there is a message
            if (query(this.box).find('.w2ui-message').hasClass('w2ui-closing')) return
            w2utils.unlock(this.box, speed)
        }, 25) // needed timer so if server fast, it will not flash
    }

    stateSave(returnOnly) {
        let state = {
            columns: [],
            show: w2utils.clone(this.show),
            last: {
                search: this.last.search,
                multi : this.last.multi,
                logic : this.last.logic,
                label : this.last.label,
                field : this.last.field,
                scrollTop : this.last.vscroll.scrollTop,
                scrollLeft: this.last.vscroll.scrollLeft
            },
            sortData  : [],
            searchData: []
        }
        let prop_val
        for (let i = 0; i < this.columns.length; i++) {
            let col          = this.columns[i]
            let col_save_obj = {}
            // iterate properties to save
            Object.keys(this.stateColProps).forEach((prop, idx) => {
                if (this.stateColProps[prop]){
                    // check if the property is defined on the column
                    if (col[prop] !== undefined){
                        prop_val = col[prop]
                    } else {
                        // use fallback or null
                        prop_val = this.colTemplate[prop] || null
                    }
                    col_save_obj[prop] = prop_val
                }
            })
            state.columns.push(col_save_obj)
        }
        for (let i = 0; i < this.sortData.length; i++) state.sortData.push(w2utils.clone(this.sortData[i]))
        for (let i = 0; i < this.searchData.length; i++) state.searchData.push(w2utils.clone(this.searchData[i]))
        // event before
        let edata = this.trigger('stateSave', { target: this.name, state: state })
        if (edata.isCancelled === true) {
            return
        }
        // save into local storage
        if (returnOnly !== true) {
            this.cacheSave('state', state)
        }
        // event after
        edata.finish()
        return state
    }

    stateRestore(newState) {
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (!newState) {
            newState = this.cache('state')
        }
        // event before
        let edata = this.trigger('stateRestore', { target: this.name, state: newState })
        if (edata.isCancelled === true) {
            return
        }
        // default behavior
        if (w2utils.isPlainObject(newState)) {
            w2utils.extend(this.show, newState.show ?? {})
            w2utils.extend(this.last, newState.last ?? {})
            let sTop  = this.last.vscroll.scrollTop
            let sLeft = this.last.vscroll.scrollLeft
            for (let c = 0; c < newState.columns?.length; c++) {
                let tmp       = newState.columns[c]
                let col_index = this.getColumn(tmp.field, true)
                if (col_index !== null) {
                    w2utils.extend(this.columns[col_index], tmp)
                    // restore column order from saved state
                    if (c !== col_index) this.columns.splice(c, 0, this.columns.splice(col_index, 1)[0])
                }
            }
            this.sortData.splice(0, this.sortData.length)
            for (let c = 0; c < newState.sortData?.length; c++) {
                this.sortData.push(newState.sortData[c])
            }
            this.searchData.splice(0, this.searchData.length)
            for (let c = 0; c < newState.searchData?.length; c++) {
                this.searchData.push(newState.searchData[c])
            }
            // apply sort and search
            setTimeout(() => {
                // needs timeout as records need to be populated
                // ez 10.09.2014 this -->
                if (!url) {
                    if (this.sortData.length > 0) this.localSort()
                    if (this.searchData.length > 0) this.localSearch()
                }
                this.last.vscroll.scrollTop = sTop
                this.last.vscroll.scrollLeft = sLeft
                this.refresh()
            }, 1)
            console.log(`INFO (w2ui): state restored for "${this.name}"`)
        }
        // event after
        edata.finish()
        return true
    }

    stateReset() {
        this.stateRestore(this.last.state)
        this.cacheSave('state', null)
    }

    parseField(obj, field) {
        if (this.nestedFields) {
            let val = ''
            try { // need this to make sure no error in fields
                val     = obj
                let tmp = String(field).split('.')
                for (let i = 0; i < tmp.length; i++) {
                    val = val[tmp[i]]
                }
            } catch (event) {
                val = ''
            }
            return val
        } else {
            return obj ? obj[field] : ''
        }
    }

    prepareData() {
        let obj = this

        // loops thru records and prepares date and time objects
        for (let r = 0; r < this.records.length; r++) {
            let rec = this.records[r]
            prepareRecord(rec)
        }

        // prepare date and time objects for the 'rec' record and its closed children
        function prepareRecord(rec) {
            for (let c = 0; c < obj.columns.length; c++) {
                let column = obj.columns[c]
                if (rec[column.field] == null || typeof column.render != 'string') continue
                // number
                if (['number', 'int', 'float', 'money', 'currency', 'percent'].indexOf(column.render.split(':')[0]) != -1) {
                    if (typeof rec[column.field] != 'number') rec[column.field] = parseFloat(rec[column.field])
                }
                // date
                if (['date', 'age'].indexOf(column.render.split(':')[0]) != -1) {
                    if (!rec[column.field + '_']) {
                        let dt = rec[column.field]
                        if (w2utils.isInt(dt)) dt = parseInt(dt)
                        rec[column.field + '_'] = new Date(dt)
                    }
                }
                // time
                if (['time'].indexOf(column.render) != -1) {
                    if (w2utils.isTime(rec[column.field])) { // if string
                        let tmp = w2utils.isTime(rec[column.field], true)
                        let dt  = new Date()
                        dt.setHours(tmp.hours, tmp.minutes, (tmp.seconds ? tmp.seconds : 0), 0) // sets hours, min, sec, mills
                        if (!rec[column.field + '_']) rec[column.field + '_'] = dt
                    } else { // if date object
                        let tmp = rec[column.field]
                        if (w2utils.isInt(tmp)) tmp = parseInt(tmp)
                        tmp    = (tmp != null ? new Date(tmp) : new Date())
                        let dt = new Date()
                        dt.setHours(tmp.getHours(), tmp.getMinutes(), tmp.getSeconds(), 0) // sets hours, min, sec, mills
                        if (!rec[column.field + '_']) rec[column.field + '_'] = dt
                    }
                }
            }

            if (rec.w2ui?.children && rec.w2ui?.expanded !== true) {
                // there are closed children, prepare them too.
                for (let r = 0; r < rec.w2ui.children.length; r++) {
                    let subRec = rec.w2ui.children[r]
                    prepareRecord(subRec)
                }
            }
        }
    }

    nextCell(index, col_ind, editable) {
        let check = col_ind + 1
        if (check >= this.columns.length) {
            index = this.nextRow(index)
            return index == null ? index : this.nextCell(index, -1, editable)
        }
        let tmp = this.records[index].w2ui
        let col = this.columns[check]
        let span = (tmp && tmp.colspan && !isNaN(tmp.colspan[col.field]) ? parseInt(tmp.colspan[col.field]) : 1)
        if (col == null) return null
        if (col && col.hidden || span === 0) return this.nextCell(index, check, editable)
        if (editable) {
            let edit = this.getCellEditable(index, check)
            if (edit == null || ['checkbox', 'check'].indexOf(edit.type) != -1) {
                return this.nextCell(index, check, editable)
            }
        }
        return { index, colIndex: check }
    }

    prevCell(index, col_ind, editable) {
        let check = col_ind - 1
        if (check < 0) {
            index = this.prevRow(index)
            return index == null ? index : this.prevCell(index, this.columns.length, editable)
        }
        if (check < 0) return null
        let tmp = this.records[index].w2ui
        let col = this.columns[check]
        let span = (tmp && tmp.colspan && !isNaN(tmp.colspan[col.field]) ? parseInt(tmp.colspan[col.field]) : 1)
        if (col == null) return null
        if (col && col.hidden || span === 0) return this.prevCell(index, check, editable)
        if (editable) {
            let edit = this.getCellEditable(index, check)
            if (edit == null || ['checkbox', 'check'].indexOf(edit.type) != -1) {
                return this.prevCell(index, check, editable)
            }
        }
        return { index, colIndex: check }
    }

    nextRow(ind, col_ind, numRows) {
        let sids = this.last.searchIds
        let ret  = null
        if (numRows == null) numRows = 1
        if (numRows == -1) {
            return this.records.length-1
        }
        if ((ind + numRows < this.records.length && sids.length === 0) // if there are more records
                || (sids.length > 0 && ind < sids[sids.length-numRows])) {
            ind += numRows
            if (sids.length > 0) while (true) {
                if (sids.includes(ind) || ind > this.records.length) break
                ind += numRows
            }
            // colspan
            let tmp  = this.records[ind].w2ui
            let col  = this.columns[col_ind]
            let span = (tmp && tmp.colspan && col != null && !isNaN(tmp.colspan[col.field]) ? parseInt(tmp.colspan[col.field]) : 1)
            if (span === 0) {
                ret = this.nextRow(ind, col_ind, numRows)
            } else {
                ret = ind
            }
        }
        return ret
    }

    prevRow(ind, col_ind, numRows) {
        let sids = this.last.searchIds
        let ret  = null
        if (numRows == null) numRows = 1
        if (numRows == -1) {
            return 0
        }
        if ((ind - numRows >= 0 && sids.length === 0) // if there are more records
                || (sids.length > 0 && ind > sids[0])) {
            ind -= numRows
            if (sids.length > 0) while (true) {
                if (sids.includes(ind) || ind < 0) break
                ind -= numRows
            }
            // colspan
            let tmp  = this.records[ind].w2ui
            let col  = this.columns[col_ind]
            let span = (tmp && tmp.colspan && col != null && !isNaN(tmp.colspan[col.field]) ? parseInt(tmp.colspan[col.field]) : 1)
            if (span === 0) {
                ret = this.prevRow(ind, col_ind, numRows)
            } else {
                ret = ind
            }
        }
        return ret
    }

    selectionSave() {
        this.last.saved_sel = this.getSelection()
        return this.last.saved_sel
    }

    selectionRestore(noRefresh) {
        let time = Date.now()
        this.last.selection = { indexes: [], columns: {} }
        let sel = this.last.selection
        let lst = this.last.saved_sel
        if (lst) for (let i = 0; i < lst.length; i++) {
            if (w2utils.isPlainObject(lst[i])) {
                // selectType: cell
                let tmp = this.get(lst[i].recid, true)
                if (tmp != null) {
                    if (sel.indexes.indexOf(tmp) == -1) sel.indexes.push(tmp)
                    if (!sel.columns[tmp]) sel.columns[tmp] = []
                    sel.columns[tmp].push(lst[i].column)
                }
            } else {
                // selectType: row
                let tmp = this.get(lst[i], true)
                if (tmp != null) sel.indexes.push(tmp)
            }
        }
        delete this.last.saved_sel
        if (noRefresh !== true) this.refresh()
        return Date.now() - time
    }

    message(options) {
        return w2utils.message({
            owner: this,
            box  : this.box,
            after: '.w2ui-grid-header'
        }, options)
    }

    confirm(options) {
        return w2utils.confirm({
            owner: this,
            box  : this.box,
            after: '.w2ui-grid-header'
        }, options)
    }
}

export { w2grid }
