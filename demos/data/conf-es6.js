/* global query */
export default {
    layout: {
        name: 'layout',
        padding: 0,
        panels: [
            { type: 'left', size: 200, resizable: true, minSize: 120 },
            { type: 'main', minSize: 550, overflow: 'hidden' }
        ]
    },

    sidebar: {
        name: 'sidebar',
        nodes: [
            { id: 'general', text: 'General', group: true, expanded: true, nodes: [
                { id: 'grid1', text: 'Grid 1', icon: 'fa fa-pencil-square-o', selected: true },
                { id: 'grid2', text: 'Grid 2', icon: 'fa fa-pencil-square-o' },
                { id: 'html', text: 'Some HTML', icon: 'fa fa-list-alt' }
            ]}
        ],
        onClick(event) {
            switch (event.target) {
                case 'grid1':
                    app.w2ui.layout.html('main', app.w2ui.grid1)
                    break
                case 'grid2':
                    app.w2ui.layout.html('main', app.w2ui.grid2)
                    break
                case 'html':
                    app.w2ui.layout.html('main', '<div style="padding: 10px">Some HTML</div>')
                    query(app.w2ui.layout.el('main'))
                        .removeClass('w2ui-grid')
                        .css({
                            'border-left': '1px solid #efefef'
                        })
                    break
            }
        }
    },

    grid1: {
        name: 'grid1',
        columns: [
            { field: 'fname', text: 'First Name', size: '180px' },
            { field: 'lname', text: 'Last Name', size: '180px' },
            { field: 'email', text: 'Email', size: '40%' },
            { field: 'sdate', text: 'Start Date', size: '120px' }
        ],
        records: [
            { recid: 1, fname: 'John', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 2, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 3, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 4, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 5, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 6, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 7, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 8, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 9, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' }
        ]

    },

    grid2: {
        name: 'grid2',
        columns: [
            { field: 'state', text: 'State', size: '80px' },
            { field: 'title', text: 'Title', size: '100%' },
            { field: 'priority', text: 'Priority', size: '80px', attr: 'align="center"' }
        ],
        records: [
            { recid: 1, state: 'Open', title: 'Short title for the record', priority: 2 },
            { recid: 2, state: 'Open', title: 'Short title for the record', priority: 3 },
            { recid: 3, state: 'Closed', title: 'Short title for the record', priority: 1 }
        ]
    }
}