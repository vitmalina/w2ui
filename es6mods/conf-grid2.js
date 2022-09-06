export default {
    name : 'grid',
    show : {
        toolbar     : true,
        footer      : true,
        lineNumbers : true,
        toolbarDelete: true,
        selectColumn : true
    },
    selectType: 'cell',
    textSearch: 'contains',
    columns: [
        { field: 'a', text: '<div style="text-align: center">A</div>', size: '95px', searchable: true, editable: { type: 'div' }, frozen: true },
        { field: 'b', text: '<div style="text-align: center">B</div>', size: '95px', editable: { type: 'div' }, frozen: true},
        { field: 'c', text: '<div style="text-align: center">C</div>', size: '95px', editable: { type: 'div' }},
        { field: 'd', text: '<div style="text-align: center">D</div>', size: '95px', editable: { type: 'div' }},
        { field: 'e', text: '<div style="text-align: center">E</div>', size: '95px', editable: { type: 'text' }},
        { field: 'f', text: '<div style="text-align: center">F</div>', size: '95px', editable: { type: 'text' }},
        { field: 'g', text: '<div style="text-align: center">G</div>', size: '95px', editable: { type: 'text' }},
        { field: 'h', text: '<div style="text-align: center">H</div>', size: '95px', editable: { type: 'text' }},
        { field: 'j', text: '<div style="text-align: center">J</div>', size: '95px', editable: { type: 'text' }},
        { field: 'k', text: '<div style="text-align: center">K</div>', size: '95px', editable: { type: 'text' }},
        { field: 'l', text: '<div style="text-align: center">L</div>', size: '95px', editable: { type: 'text' }},
        { field: 'l', text: '<div style="text-align: center">L</div>', size: '95px', editable: { type: 'text' }},
        { field: 'l', text: '<div style="text-align: center">L</div>', size: '95px', editable: { type: 'text' }},
        { field: 'l', text: '<div style="text-align: center">L</div>', size: '95px', editable: { type: 'text' }},
        { field: 'l', text: '<div style="text-align: center">L</div>', size: '95px', editable: { type: 'text' }},
        { field: 'l', text: '<div style="text-align: center">L</div>', size: '95px', editable: { type: 'text' }},
        { field: 'l', text: '<div style="text-align: center">L</div>', size: '95px', editable: { type: 'text' }},
        { field: 'm', text: '<div style="text-align: center">M</div>', size: '95px', editable: { type: 'text' }}
    ],
    records: [
        { recid: 1, a: 1, b: 2, c: 'Some text', d: 'More' },
        { recid: 2, a: 1, b: 2, c: 'Some text', d: 'More' },
        { recid: 3, a: 1, b: 2, c: 'Some text', d: 'More' }
    ],
    total: -1,
    menu: ['some', 'other'],
    onContextMenu: function (event) {
        // console.log('context', event);
    },
    onSelectionExtend: function (event) {
        console.log('extend', event);
    },
    onColumnSelect: function (event) {
        console.log('column', event);
        // event.preventDefault();
    },
    onSelect: function (event) {
        // console.log('select', event);
    },
    onFocus(event) {
        console.log('focus');
    },
    onBlur(event) {
        console.log('blur');
    }
}