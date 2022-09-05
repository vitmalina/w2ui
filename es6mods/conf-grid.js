export default {
    name      : 'grid',
    header    : 'List of Names',
    // url : '//w2ui.com/web/pages/demo/infinite/index2.php',
    // routeData : { id: 4 },
    // url       : '/1/:id/grid.json',
    // url     : {
    //     get    : 'data.php',
    //     remove : 'grid3.json',
    //     save   : 'save'
    // },
    // columnTooltip: 'top',
    reorderRows: true,
    // multiSearch: false,
    //reorderColumns: true,
    show: {
        toolbar: true,
        footer: true,
        header: true,
        emptyRecords: true,
        columnHeaders: true,
        searchAll: false,
        searchHiddenMsg: true,
        searchVisible: false,
        selectColumn: true,
        expandColumn: false,
        lineNumbers: true,
        toolbarAdd: true,
        toolbarEdit: false,
        toolbarDelete: true,
        toolbarSave: true,
        skipRecords: true,
        saveRestoreState: true,
    },
    menu: [
        { id: 1, text: 'Select Item', icon: 'fa fa-star',
            items: [
                { id: 'item1', text: 'Select Item', icon: 'fa fa-star' },
                { id: 'item2', text: 'Select Item', icon: 'fa fa-star' }
            ]
        },
        { id: 2, text: 'View Item', icon: 'fa fa-camera' },
        { id: 4, text: 'Delete Item', icon: 'fa fa-minus' }
    ],
    onSave: function (event) {
        console.log('save', event);
    },
    onReorderRow: function (event) {
        console.log('reorder -->', event);
    },
    onMenuClick: function (event) {
        console.log(event);
    },
    onFocus1: function (event) {
        console.log('focus: ', this.name, event);
        // event.preventDefault();
    },
    onBlur1: function (event) {
        console.log('blur: ', this.name, event);
        // event.preventDefault();
    },
    onEdit(event){},
    postData: {
        "admin": 'somename'
    },
    selectType1: 'cell',
    //autoLoad: false,
    //offset: 99700,
    //multiSelect: false,
    //multiSearch: false,
    //fixedBody: false,
    toolbar: {
        items: [
            { type: 'button', id: 'w2ui-edit', text: 'custom edit' },
            { type: 'break', id: 'br1' },
            { type: 'menu',   id: 'item2', text: 'Drop Down', img: 'icon-folder', items: [
                { text: 'Item 1', icon: 'icon-page' },
                { text: 'Item 2', icon: 'icon-page' },
                { text: 'Item 3', value: 'Item Three', icon: 'icon-page' }
            ]},
            { type: 'break', id: 'br2' },
            { type: 'html', id: 'html1', html: '<b>HTML Button</b>' },
            { type: 'break', id: 'br3' },
            { type: 'drop', id: 'drop1', text: 'Drop Button', html: '123' }
        ]
    },

    // possible values: text, alphanumeric, int, float, money, currency, percent, hex, list, combo, enum, select, date, time
    searches: [
        { field: 'personid', label: 'ID', type: 'text', simple: false },
        { field: 'color', label: 'Color', type: 'color', style: 'border: 1px solid red' },
        { field: 'email', label: 'Email', type: 'text', operator1: 'null', operators1: ['is', 'null', 'not null'] },
        { field: 'fname', label: 'First Name 1', type: 'text' },
        { field: 'fname-full', label: 'First Name 2', type: 'list', options: { items: ['Cuban', 'Rene'] } },
        { field: 'lname', label: 'Last Name', type: 'enum', options: { items: ['Cuban', 'Rene'] }}
    ],
    searchMap: {
        // color: 'personid',
        // 'fname-full': 'fname'
    },
    // sortData: [ { field: 'personid', direction: 'asc' } ],
    columnGroups: [
        { text: '11', text1: function(col) { return (new Date()).getTime() }, span: 3 },
        { text: 'General Information', span: 4 },
        // { text: 'Email', span: 1, master: false },
        // { text: 'Text', span: 1, master: false },
        // { text: 'Important Dates', span: 3 }
    ],
    columns: [
        { field: 'personid', text: 'ID', size: '160px', sortable: true, resizable: true, frozen1: true, tooltip: 'User ID', info: true },
        { field: 'icon', text: 'Icon', size: '60px', searchable: true, sortable: true, resizable: true, style: 'text-align: center',
            info: {
                icon      : 'fa fa-flag',
                style     : '',
                render    : function (record) {
                    return  '<table>'+
                            '   <tr><td>Field1</td><td>Value1</td></tr>'+
                            '   <tr><td>Field2</td><td>Some value</td></tr>'+
                            '</table>';
                }
            },
        },
        { field: 'personid', text: 'ID', size: '50px' },
        { field: 'personid2', text: 'ID2', size: '60px', sortable: true, resizable: true, tooltip: 'Person ID',
            render: function (record) {
                if (record.changes && record.changes['personid']) {
                    return record.changes['personid'].text;
                } else {
                    return record['personid'];
                }
            },
            editable: { type: 'list', items: ['1', '2', '3'], compare: function () { return true } },
            hidden: true
        },
        { field: 'text', text: 'Random Text', size: '100px', hidden: true, sortable: true, searchable: true, resizable: true },
        { field: 'fname', text: 'First Name', size: '100px', sortable: true,
            searchable1: true, resizable: true, editable: { type: 'text' },
            tooltip: 'Full Name', hidden1: true, info: true },
        { field: 'lname', text: 'Last Name', size: '100px', sortable: true, resizable: true,
            tooltip: 'some tooltip',
            clipboardCopy: true,
            info: {
                icon: 'fa fa-user',
                showEmpty: true,
                maxLength: 10,
                fields: {
                    'text 1' : 'field',
                    'Last Name' : 'lname',
                    'First Name': 'fname',
                    'se': '--',
                    'Custom'    : function (record, ind, col_ind) {
                        console.log('custom', record, ind, col_ind);
                        return record.fname + ' ' + record.lname;
                    }
                }
            }
        },
        { field: 'email', text: 'Email', size: '100%', resizable: true, sortable: true, frozen1: true },
        { field: 'snumber', text: 'Number', size: '100px', resizable: true, sortable: true, render: 'size', frozen1: true },
        { field: 'sdate', text: 'Date', size: '120px', render: 'date', searchable1: 'date', sortable: true,
            editable: { type: 'date' }, hidden: true },
        { field: 'sdate', text: 'Time', size: '120px', render: 'time', searchable1: 'time', sortable: true, hidden: true },
        { field: 'sdate', text: 'Age', size: '120px', render: 'age:ago', sortable: true, hidden: true }
    ],
    ranges1: [
        {
            name  : 'first',
            range : [{"recid":'recid-5',"column":1},{"recid":'recid-9',"column":2}],
             style : "border: 2px dotted green; background-color: rgba(100,400,100,0.2)"
        },
        {
            name  : 'second',
             range : [{"recid":'recid-6',"column":4},{"recid":'recid-8',"column":4}],
             style : "border: 2px dotted orange; background-color: rgba(200,200,200,0.2)"
         }
    ],
    onSelectionExtend: function (event) {
        //console.log(event.newRange[0].column, event.newRange[1].column);
        // restrict one column
        //if (event.newRange[0].column != event.newRange[1].column) event.isCancelled = true; else event.isCancelled = false;
        // restrict one column
        //if (event.newRange[0].recid != event.newRange[1].recid) event.isCancelled = true; else event.isCancelled = false;
        event.onComplete = function () {
            var range = this.getRange(event.newRange, true);
            //console.log('done', range);
        }
    },
    onClick(event) {
        var sel = this.getSelection();
        if (sel.length >= 1 && sel[0] == event.recid) {
            event.preventDefault();
        }
    },
    onSelect: function (event) {
        // console.log('select -->', event);
    },
    onUnselect1: function (event) {
        var sel = this.getSelection();
        if (sel.length > 1 && sel[0] == event.recid) {
            event.preventDefault();
        }
    },
    onDelete: function (event) {
        //event.force = true;
    },
    onPaste: function (event) {
        var grid = this;
        event.onComplete = function () { grid.save(); }
    },
    onColumnResize: function (event) {
        event.onComplete = function () {
            console.log('complete', event);
        }
    },
    onCollapse: function (event) {
        console.log('col', event);
    },
    onExpand: function (event) {
        console.log('expand', event);
        return;
        if (w2ui['grid-'+ event.recid]) jQuery().w2destroy('grid-'+ event.recid);
        jQuery('#'+ event.box_id).w2grid({
            name: 'grid-' + event.recid,
            fixedBody: false,
            style: 'width: 100%; height: 150px;',
            show: {
                toolbar: false,
                footer: false,
                header: false,
                columnHeaders: false
            },
            columnGroups1: [
                { text: '1', span: 1 },
                { text: '2', span: 1, master: true }
            ],
            columns: [
                { field: 'recid', text: 'ID', size: '49px', sortable: true, resizable: true, searchable: 'int' },
                { field: 'lname', text: 'Last Name', size: '30%', sortable: true, resizable: true, searchable: true },
                { field: 'fname', text: 'First Name', size: '30%', sortable: true, resizable: true, searchable: true },
            ],
            records: [
                { recid: 1, lname: 'Vitali Malinsouski' },
                { recid: 2, lname: 'John Cook' }
            ]
        });
    },
    onAdd: function (event) {
        this.add({ recid: 100 });
        this.editField(100, 1)
    },
    summary: [
        //{ recid: 1, lname: 'Vitali Malinsouski', fname: '<span style="float: right">Total:</span>', sdate: '444' }
    ]
    //getFooterHTML: function () { console.log(this); return 'My Own Footer'; }
}