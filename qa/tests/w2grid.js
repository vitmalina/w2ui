// **********************************
// -- Unit Tests: w2grid

// === Columns

test( "w2grid().getColumn()", function() {

    $().w2grid({
        name: 'grid',
        columns: [{ field: 'recid', caption: 'ID' }, { field: 'recid2', caption: 'ID' }]
    });

    deepEqual(w2ui['grid'].getColumn('recid'), { field: 'recid', caption: 'ID' }, 'Get column #1');
    deepEqual(w2ui['grid'].getColumn('recid1'), null, 'Get column #2');
    equal(w2ui['grid'].getColumn('recid2', true), 1, 'Get column #3');

    $().w2destroy('grid');
});

test( "w2grid().addColumn(), w2grid.removeColumn()", function() {
    $().w2grid({ name: 'grid' });

    w2ui['grid'].addColumn({ field: 'recid', caption: 'ID' });
    deepEqual(w2ui['grid'].columns, [{ field: 'recid', caption: 'ID' }], 'Add column #1');

    w2ui['grid'].addColumn('recid', { field: 'recid2', caption: 'ID' });
    deepEqual(w2ui['grid'].columns, [{ field: 'recid2', caption: 'ID' }, { field: 'recid', caption: 'ID' }], 'Add column #2');

    w2ui['grid'].removeColumn('recid', 'recid2');
    deepEqual(w2ui['grid'].columns, [], 'Remove column #1');

    w2ui['grid'].addColumn([{ field: 'recid', caption: 'ID' }, { field: 'recid2', caption: 'ID' }]);
    deepEqual(w2ui['grid'].columns, [{ field: 'recid', caption: 'ID' }, { field: 'recid2', caption: 'ID' }], 'Add column #3');

    equal(w2ui['grid'].removeColumn('recid', 'recid2'), 2, 'Remove column #2');

    $().w2destroy('grid');
});

test( "w2grid().hideColumn(), w2grid.showColumn()", function() {

    $().w2grid({
        name: 'grid',
        columns: [{ field: 'recid', caption: 'ID' }, { field: 'recid2', caption: 'ID' }]
    });

    equal(w2ui['grid'].hideColumn('recid', 'recid2'), 2, 'Hide column #1');
    equal(w2ui['grid'].hideColumn('recid', 'recid2'), 0, 'Hide column #2');
    equal(w2ui['grid'].showColumn('recid', 'recid2'), 2, 'Show column #1');
    equal(w2ui['grid'].showColumn('recid', 'recid2'), 0, 'Show column #2');

    $().w2destroy('grid');
});

// === Searches

test( "w2grid().getSearch()", function() {

    $().w2grid({
        name: 'grid',
        searches: [{ field: 'recid', caption: 'ID' }, { field: 'recid2', caption: 'ID' }]
    });

    deepEqual(w2ui['grid'].getSearch('recid'), { field: 'recid', caption: 'ID' }, 'Get search #1');
    deepEqual(w2ui['grid'].getSearch('recid1'), null, 'Get search #2');
    equal(w2ui['grid'].getSearch('recid2', true), 1, 'Get search #3');

    $().w2destroy('grid');
});

test( "w2grid().addSearch(), w2grid.removeSearch()", function() {
    $().w2grid({ name: 'grid' });

    w2ui['grid'].addSearch({ field: 'recid', caption: 'ID' });
    deepEqual(w2ui['grid'].searches, [{ field: 'recid', caption: 'ID' }], 'Add search #1');

    w2ui['grid'].addSearch('recid', { field: 'recid2', caption: 'ID' });
    deepEqual(w2ui['grid'].searches, [{ field: 'recid2', caption: 'ID' }, { field: 'recid', caption: 'ID' }], 'Add search #2');

    w2ui['grid'].removeSearch('recid', 'recid2');
    deepEqual(w2ui['grid'].searches, [], 'Remove search #1');

    w2ui['grid'].addSearch([{ field: 'recid', caption: 'ID' }, { field: 'recid2', caption: 'ID' }]);
    deepEqual(w2ui['grid'].searches, [{ field: 'recid', caption: 'ID' }, { field: 'recid2', caption: 'ID' }], 'Add search #3');

    equal(w2ui['grid'].removeSearch('recid', 'recid2'), 2, 'Remove search #2');

    $().w2destroy('grid');
});

test( "w2grid().hideSearch(), w2grid.showSearch()", function() {

    $().w2grid({
        name: 'grid',
        searches: [{ field: 'recid', caption: 'ID' }, { field: 'recid2', caption: 'ID' }]
    });

    equal(w2ui['grid'].hideSearch('recid', 'recid2'), 2, 'Hide search #1');
    equal(w2ui['grid'].hideSearch('recid', 'recid2'), 0, 'Hide search #2');
    equal(w2ui['grid'].showSearch('recid', 'recid2'), 2, 'Show search #1');
    equal(w2ui['grid'].showSearch('recid', 'recid2'), 0, 'Show search #2');

    $().w2destroy('grid');
});

// === mergeChanges

test( "w2grid().mergeChanges()", function() {

    $().w2grid({
        name: 'grid',
        records: [
        ]
    });

    var values = [
        {
            changed: {
                recid: 1,
                "a-fname": "John",
                "a-lname": "Motzart",
                "b'day": "1/1/2001",
                basket: "5.19",
                email: "jdoe@gmail.com",
                sdate: "4/3/2012",
                w2ui: {
                    changes: {
                        "a-fname": "Mark",
                        "a-lname": { id: "2", text: "Gatos" },
                        "b'day": "2/2/2002",
                        basket: "1.51",
                        email: "mdoe@gmail.com",
                        sdate: "5/5/2015"
                    }
                }
            },
            merged: {
                recid: 1,
                "a-fname": "Mark",
                "a-lname": "Gatos",
                "b'day": "2/2/2002",
                basket: "1.51",
                email: "mdoe@gmail.com",
                sdate: "5/5/2015",
                w2ui: {}
            }
        },
        {
            changed: {
                recid: 1,
                name: {
                    "a-fname": "John",
                    "a-lname": "Motzart",
                    basket: "5.19",
                    email: "jdoe@gmail.com",
                    sdate: "4/3/2012"
                },
                w2ui: {
                    changes: {
                        "name.a-fname": "Mark",
                        "name.a-lname": { id: "2", text: "Gatos" },
                        "name.basket": "1.51",
                        "name.email": "mdoe@gmail.com",
                        "name.sdate": "5/5/2015"
                    }
                }
            },
            merged: {
                recid: 1,
                name: {
                    "a-fname": "Mark",
                    "a-lname": "Gatos",
                    basket: "1.51",
                    email: "mdoe@gmail.com",
                    sdate: "5/5/2015"
                },
                w2ui: {}
            }
        }
    ];

    for (var i = 0; i < values.length; i++) {
        w2ui.grid.records = [values[i].changed];
        w2ui.grid.mergeChanges();
        deepEqual(w2ui.grid.get(1), values[i].merged, 'Changes #'+i);
    }
    $().w2destroy('grid');
});