import { w2form } from '../src/w2form.js'
import { w2menu } from '../src/w2tooltip.js'
import { w2ui } from '../src/w2utils.js'

// TOOD: remove
window.w2ui = w2ui
window.w2menu = w2menu

let form = new w2form({
    name      : 'form',
    routeData : { id: 4 },
    postData: { some: "data" },
    url: { get: 'form.json?id=:id', save: 'form.json?id=:id' },
    httpHeaders: { header1: "header-data" },
    // url: { get: 'http://w2ui.com', save: 'http://w2ui.com' },
    // page      : 2,
    // url       : 'form.php',
    // formURL   : 'form-template.html',
    recid    : 4,
    header   : 'Edit header',
    style1   : 'border: 1px solid red;',
    // pageStyle: 'height: 200px',
    page: 0,
    tabs: [
        { id: 'tab1', text: 'General' },
        { id: 'tab2', text: 'Inputs' },
        { id: 'tab3', text: 'HTML' }
    ],
    onProgress: function (event) {
        event.preventDefault();
    },
    toolbar: {
        items: [
            { type: 'button', id: 'button1', text: 'Button1', icon: 'w2ui-icon-search' },
            { type: 'break' },
            { type: 'check', id: 'button2', text: 'Button2', img: 'icon-page' },
            { type: 'check', id: 'button3', text: 'Button3', img: 'icon-page' },
            { type: 'spacer' },
            { type: 'button', id: 'save', text: 'Save', img: 'icon-folder' }
        ]
    },
    focus: 'field.sample',
    fields: [
        // first page
        { field: 'field.html', type: 'html', required: true,
            html: {
                html: 'dfdf',
                attr: 'style="padding: 5px"',
                group: 'General',
                groupCollapsible: true,
                groupExpanded: false
            }
        },
        { field: 'field.text', type: 'text', required: true, html: { attr: 'style="width: 300px"' }, hidden1: true },
        { field: 'field.textarea', type: 'textarea', required: true,
            html: {
                attr: 'style="width: 100%"',
                group: 'Other',
                groupCollapsible: true
            }
        },
        { field: 'field.date', type: 'date', required: false,
            html: { attr: 'style="width: 100px"' },
            options: { start1: '3/10/2022', end1: '3/25/2022', blockDates: ['3/28/2022'] }
        },
        { field: 'field.time', type: 'time', required: false,
            html: { attr: 'style="width: 100px"' },
            options: { start: '8:00am', end: '4:30pm' }
        },
        { field: 'field.datetime', type: 'datetime', required: false,
            // options: { start: '3/10/2022', end: '3/25/2022',
                // startTime: '8:00am', endTime: '4:30pm', blockDates: ['3/13/2022'] },
            html: { attr: 'style="width: 160px"' }
        },
        { field: 'field.color', type: 'color', required: true,
            html: { attr: 'style="width: 100px"' },
            options: { advanced1: true, transparent: false }
        },
        { field: 'field.sample', type: 'text' },
        { field: 'field.list', type: 'list', required: true, html: { group: 'Dropdowns', groupCollapsable: true },
            html: { attr: 'style="border: 1px solid red" placeholder="placeholder"' },
            options: {
                // match: 'contains',
                openOnFocus: true,
                // url : 'listdat.json'
                // compare(item) {
                //     if (item.id < 4) return false;
                // },
                items1(el) {
                    return [
                        { id: 'item1', icon: 'fa fa-link', text: 'item ' + Math.round(Math.random()*100) },
                        { id: 'item2', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) }
                    ]
                },
                items: [
                    { id: 0, text: 'Pickle, Susan' },
                    { id: 1, text: 'Adams, John' },
                    { id: 2, text: 'Openhimer, Peter' },
                    { id: 3, text: 'Woznyak, Steve' },
                    { id: 4, text: 'Rusevelt, Franklin' },
                    { id: 5, text: 'Stalone, Silvester' },
                    { id: 6, text: 'Mann, Fred' },
                    { id: 6, text: 'Ford, Mary' },
                    { id: 8, text: 'Purky, Mon' },
                    { id: 9, text: 'Min, Hla' }
                ]
            }
        },
        { field: 'field.sample2', type: 'text' },
        { field: 'field.combo', type: 'combo', required: false,
            html: { attr: 'placeholder="combot text"' },
            options: {
                // applyFilter: false,
                // openOnFocus: false,
                // url : 'listdat.json'
                items1(el) {
                    return [
                        { id: 'item1', icon: 'fa fa-link', text: 'item ' + Math.round(Math.random()*100) },
                        { id: 'item2', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) }
                    ]
                },
                items: [
                    { id: 0, text: 'Pickle, Susan' },
                    { id: 1, text: 'Adams, John' },
                    { id: 2, text: 'Openhimer, Peter' },
                    { id: 3, text: 'Woznyak, Steve' },
                    { id: 4, text: 'Rusevelt, Franklin' },
                    { id: 5, text: 'Stalone, Silvester' },
                    { id: 6, text: 'Mann, Fred' },
                    { id: 6, text: 'Ford, Mary' },
                    { id: 8, text: 'Purky, Mon' },
                    { id: 9, text: 'Min, Hla' }
                ]
            }
        },
        { field: 'field.sample3', type: 'text' },
        { field: 'field.enum', type: 'enum', required: false,
            html: { attr: 'style="width: 400px" placeholder="Enum filed"' },
            options: {
                items: function (el) {
                    let items = []
                    for (let i = 1; i <= 20; i++) {
                        items.push({ id: 'item'+i, icon: 'w2ui-icon-check', tooltip: 'Tooltip', text: 'ITEM ' + i})
                    }
                    return items;
                },
                maxHeight: 60,
                maxWidth: 80,
                items1: [{id: 1, text: 'Adams, John'}, 'Johnson, Peter', 'Lewis, Frank', 'Cruz, Steve', 'Donnun, Nick']
            }
        },
        { field: 'field.file', type: 'file', required: false, html: { attr: 'style="width: 400px"' } },
        // second page
        { field: 'field.email', type: 'email', required: true, html: { page: 1 } },
        { field: 'field.password', type: 'pass', required: false, html: { page: 1 } },
        { field: 'field.int', type: 'int',
            options: { arrows: true, max: 100, min: 5, autoCorrect: true, prefix: '$', suffix: '%' },
            required: false,
            html: { page: 1, attr: 'style="width: 140px"'}
        },
        { field: 'field.float', type: 'float', required: false, html: { page: 1 } },
        { field: 'field.money', type: 'money', required: false, html: { page: 1 } },
        { field: 'field.currency', type: 'currency', required: false, html: { page: 1 } },
        { field: 'field.percent', type: 'percent', required: false, html: { page: 1 } },
        { field: 'field.alpha', type: 'alphanumeric', required: false, html: { page: 1 } },
        // third page
        { field: 'field.select', type: 'select', required: false, options: {
            items: ['fist', 'second', 'third', 'another'] }, html: { page: 2 }
        },
        { field: 'field.toggle', type: 'toggle', required: false, html: { page: 2 } },
        { field: 'field.check', type: 'checkbox', required: false, html: { page: 2, text: 'Options' } },
        { field: 'field.check2', type: 'checkbox', required: false,
            html: { page: 2, text: 'field.check2', label: 'Some long text for checkbox' }
        },
        { field: 'field.check3', type: 'checks', required: false,
            html: {
                page: 2,
                label: 'List of Checks'
            },
            options: {
                items: [
                    { id: -2, text: 'Pickle, Susan' },
                    { id: -1, text: 'Adams, John' },
                    { id: 0, text: 'Openhimer, Peter' },
                    { id: 1, text: 'Woznyak, Steve' },
                    { id: 2, text: 'Rusevelt, Franklin' },
                    { id: '', text: 'Other, Franklin' }
                ]
            }
        },
        { field: 'field.radio', type: 'radio', required: false, html: { page: 2 }, options: {
                items: [
                    { id: 0, text: 'Pickle, Susan' },
                    { id: 1, text: 'Adams, John' },
                    { id: "2a", text: 'Openhimer, Peter' },
                    { id: 3, text: 'Woznyak, Steve' },
                    { id: 4, text: 'Rusevelt, Franklin' },
                    { id: 5, text: 'Stalone, Silvester' },
                    { id: 6, text: 'Mann, Fred' },
                    { id: 6, text: 'Ford, Mary' },
                    { id: 8, text: 'Purky, Mon' },
                    { id: '', text: 'Min, Hla' }
                ]
            }
        }
    ],
    onChange(event) {
        // event.preventDefault()
        // console.log(event.type, event.detail.value);
    },
    onInput(event) {
        // console.log(event.type, event.detail.value);
    },
    postData1: {
        a1: 1,
        a2: 2
    },
    actions: {
        reset: {
            text    : 'Some Action',
            style   : '',
            "class" : '',
            onClick : function () {
                this.clear();
            }
        },
        Save() {
            var obj = this;
            this.save({}, function (data) {
                if (data.status == 'error') {
                    console.log('ERROR: '+ data.message);
                    return;
                }
                //obj.clear();
            });
        }
    }
});
form.render(document.querySelector('#form'))
// w2ui.form.formHTML = w2ui.form.generateHTML()
// w2ui.form.render();
// all event listener
// w2ui.form.on('change', function (event) {
//     event.onComplete = function () {
//         console.log('--------');
//         console.log('change2:', event, 'record:', w2ui.form.record);
//     }
// });
