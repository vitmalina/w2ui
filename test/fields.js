jQuery(function () {
    w2utils.settings.dataType = 'HTTP';
    var fname = ['Vitali', 'Katsia', 'John', 'Peter', 'Sue', 'Olivia', 'Thomas', 'Sergei', 'Snehal', 'Avinash', 'Divia'];
    var lname = ['Peterson', 'Rene', 'Johnson', 'Cuban', 'Twist', 'Sidorov', 'Vasiliev', 'Yadav', 'Vaishnav'];
    var items = [];
    // add 10k records
    for (var i = 0; i < 50; i++) {
        var item = {
            id         : (i + 1),
            fname    : fname[Math.floor(Math.random() * fname.length)],
            lname    : lname[Math.floor(Math.random() * lname.length)],
            email    : 'vm@gmail.com', manager: '--',
            snumber  : Math.floor(Math.random() * 10000000),
            sdate    : (new Date(Math.floor(Math.random() * 20000) * 100000000)).getTime()
        };
        item.text = item.fname + ' ' + item.lname;
        items.push(item);
    }
    jQuery('.date').w2field('date', { silent: false, format: 'dd/mm/yyyy' });
    jQuery('.date-with-blocked-weekends').w2field('date', { silent: false, format: 'yyyy-m-d', blockWeekDays: [0,6] })
    jQuery('.datetime').w2field('datetime', {});
    jQuery('.time').w2field('time', { start: '8:15am', end: '4:30pm' });
    jQuery('.time_without_minutes').w2field('time', { noMinutes: true });
    jQuery('.color').w2field('color');
    jQuery('.int').w2field({ type: 'int', min: -36, max: 1234, autoCorrect: true });
    jQuery('.float').w2field('float');
    jQuery('.percent').w2field('percent', { precision: 0, min: 0, max: 100 });
    jQuery('.money').w2field('currency');
    jQuery('.hex').w2field('hex');
    jQuery('.alphanumeric').w2field('alphanumeric');
    jQuery('.combo').w2field('combo', {
        openOnFocus: true,
        match: 'contains',
        filter: false,
        markSearch: true,
        // minLength: 1,
        // url: 'http://w2ui.com/web/pages/demo/infinite/index.php?request={"cmd":"get","selected":[],"limit":100,"offset":0}',
        recId: 'recid',
        recText(item) { return item.fname + ' ' + item.lname },
        items: function(el) {
            // console.log('Element', el)
            // console.log(this)
            return [
                { id: 'item1', icon: 'fa fa-link', text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item2', icon: 'fa fa-star', disabled: true, text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item3', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item4', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item5', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) }
            ]
        },
        items1: items,
        onRequest: function (event) {
            // console.log('request', event);
        },
        onLoad: function (event) {
            // console.log('load', event);
        }
    });
    jQuery('.list').w2field('list', {
        icon: 'fa fa-star',
        onIconClick(event) {
            jQuery(event.el).w2overlay('<div style="padding: 10px">Message for the icon</div>');
            // console.log(event.el);
        },
        // search: false,
        filter: true,
        match: 'contains',
        markSearch: true,
        minLength: 0,
        // url: 'http://w2ui.com/web/pages/demo/infinite/index.php?request={"cmd":"get","selected":[],"limit":100,"offset":0}',
        recId: 'recid',
        recText(item) { return item.fname + ' ' + item.lname },
        items: function(el) {
            // console.log('Element', el)
            // console.log(this)
            return [
                { id: 'item1', icon: 'fa fa-link', text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item2', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item3', icon: 'fa fa-star', disabled: true, text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item4', icon: 'fa fa-star', disabled: true, text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item5', icon: 'fa fa-link', disabled: true, text: 'item ' + Math.round(Math.random()*100) },
                { id: 3, text: 'Sub Items', icon: 'icon-empty', expanded: true,
                    items: [
                        { id: 'sub1', text: 'subitem 1' },
                        { id: 'sub2', text: 'subitem 2' },
                    ]
                },
                { id: 'item6', icon: 'fa fa-link', text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item7', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item8', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) },
                { id: 'item9', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*100) },
            ]
        },
        items1: items,
        onRequest: function (event) {
            // console.log('list request', event);
        },
        onLoad: function (event) {
            // console.log('list load', event);
        },
        onError: function (event) {
            // console.log('list error', event);
        }
    }).on('blur', function (event) {
        // console.log('BLUR: user', jQuery(this).data());

    }).on('focus', function (event) {
        // console.log('FOCUS: user', jQuery(this).data());

    });
    jQuery('.enum').w2field('enum', {
        // url: 'http://w2ui.com/web/pages/demo/infinite/index.php?request={"cmd":"get","selected":[],"search":"122",limit":100,"offset":0}',
        recId: 'recid',
        spinner: true,
        msgSearch: 'Type to search...',
        // msgNoItems: function (event) {
        //     console.log('event', event.remote, event.options.items)
        //     return `Cannot find "${event.search}"`
        // },
        // minLength: 3,
        recText(item) { return item.fname + ' ' + item.lname },
        openOnFocus: true,
        items: [
            { id: 'item1', keepOpen: true, icon: 'fa fa-link', text: 'item 1' },
            { id: 'item2', keepOpen: true, icon: 'fa fa-star', disabled: true, text: 'item 2'},
            { id: 'item3', keepOpen: true, icon: 'fa fa-star', text: 'item 3' },
            { id: 'item4', keepOpen: true, icon: 'fa fa-star', text: 'item 4' },
            { id: 'item5', keepOpen: true, icon: 'fa fa-star', text: 'item 5' },
            { id: 'item6', keepOpen: true, icon: 'fa fa-star', text: 'item 6' },
            { id: 'item7', keepOpen: true, icon: 'fa fa-star', text: 'item 7' },
            { id: 'item8', keepOpen: true, icon: 'fa fa-star', text: 'item 8' },
            { id: 'item9', keepOpen: true, icon: 'fa fa-star', text: 'item 9' },
        ],
        items1: function(el) {
            // console.log('Element', el)
            // console.log(this)
            return [
                { id: 'item1', icon: 'fa fa-link', text: 'item ' + Math.round(Math.random()*10) },
                { id: 'item2', icon: 'fa fa-star', disabled: true, text: 'item ' + Math.round(Math.random()*10) },
                { id: 'item3', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*10) },
                { id: 'item4', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*10) },
                { id: 'item5', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*10) },
                { id: 'item6', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*10) },
                { id: 'item7', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*10) },
                { id: 'item8', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*10) },
                { id: 'item9', icon: 'fa fa-star', text: 'item ' + Math.round(Math.random()*10) },
            ]
        },
        items1: items,
        selected: [],
        renderItem1: function (item, options, del) {
            return item.text + del;
        },
        renderDrop1: function (item) {
            return '<div style="border: 1px solid red; padding: 10px;" onclick="event.stopPropagation()">' +item.text + '</div>';
        },
        select: function (event) {
            // console.log(event);
            event.preventDefault();
        },
        // items: items
        onRequest: function (event) {
            // console.log('enum request', event);
        },
        onLoad: function (event) {
            // console.log('enum load', event);
        },
        onError: function (event) {
            // console.log('enum error', event);
        },
        onClick(event) {
            // console.log('enum click', event);
        },
        onMouseOver: function (event) {
            // console.log('enum over', event);
        },
        onMouseOut: function (event) {
            // console.log('enum out', event);
        },
        onRemove: function (event) {
            // console.log('enum remove', event.item);
        },
        onAdd: function (event) {
            // console.log('enum add', event);
        },
        onNew: function (event) {
            // console.log('enum new', event);
            jQuery().w2popup({'title':'test'})
        }
    });
    jQuery('.file').w2field('file', {
        onAdd: function (event) {
            // console.log('add', event);
        },
        onRemove: function (event) {
            // console.log('remove', event);
        }
    });

    // date range
    jQuery('#date1').w2field('date', { end: jQuery('#date2'), blocked: ['12/12/2013'] });
    jQuery('#date2').w2field('date', { start: jQuery('#date1'), blocked: ['12/12/2013'] });

    // resiabled elements
    jQuery('#resize_list').w2field('list', { icon: 'fa fa-star', items: items, selected: jQuery.parseJSON('{"id":4,"fname":"Thomas","lname":"Cuban","email":"vm@gmail.com","manager":"--","snumber":2651849,"sdate":1566800000000,"text":"Thomas Cuban","hidden":false}') });
    jQuery('#resize_enum').w2field('enum', { icon: 'fa fa-star', items: items });
    jQuery('#resize_file').w2field('file', { icon: 'fa fa-star', items: items });

    // off screen
    jQuery('.screen').w2field('date');
    jQuery('.screenc').w2field('color');

    function click(ind) {
        switch(ind) {
            case 1:
                jQuery('input, textarea, select').prop('readonly', true).change()
                break
            case 2:
                jQuery('input, textarea, select').prop('readonly', false).change()
                break
            case 3:
                jQuery('input, textarea, select').not('[type=button]').prop('disabled', true).change()
                break
            case 4:
                jQuery('input, textarea, select').not('[type=button]').prop('disabled', false).change()
                break
            case 5:
                jQuery('input').each(function () { if (jQuery(this).w2field()) jQuery(this).w2field().clear() }).length
                break
            case 6:
                jQuery('#extra').show()
                break
            case 7:
                jQuery('#extra').hide()
                break
            case 8:
                jQuery(this).w2tag({
                    html: 'Some tag with some html<br>11',
                    left: 10,
                    hideOnClick: true,
                    position: 'bottom'
                })
                break
            case 9:
                jQuery(this).w2menu({
                    type: 'normal',
                    html: '<div style="padding: 20px">Some tag</div>',
                    width: '300px',
                    index: [],
                    items: [
                        { id: 1, icon: 'icon-empty', text: 'item 1', count: 5 },
                        { id: 2, icon: 'icon-empty', text: 'item 2', hidden1: true },
                        { id: 3, icon: 'icon-empty', text: 'Sub Items', icon: 'icon-empty', disabled1: true, expanded: true,
                            items: [
                                { id: 'sub1', icon: 'icon-empty', text: 'subitem 1' },
                                { id: 'sub2', icon: 'icon-empty', text: 'subitem 2' },
                                { id: 'sub3', icon: 'icon-empty', text: 'subitem 3' },
                                { id: 'sub4', icon: 'icon-empty', text: 'subitem 4' },
                                { id: 'sub5', icon: 'icon-empty', text: 'Sub Items 2',
                                    items: [
                                        { id: 'sub51', icon: 'icon-empty', text: 'subitem 1' },
                                        { id: 'sub2', icon: 'icon-empty', text: 'subitem 2' },
                                    ]
                                },
                            ]
                        },
                        { id: 4, icon: 'icon-empty', text: 'item 4' },
                        { id: 5, icon: 'icon-empty', text: 'item 5', disabled: true },
                        { id: 6, icon: 'icon-empty', text: 'item 6' },
                    ],
                    // align: 'both',
                    altRows: true,
                    hideOnSelect: false,
                    hideOnRemove: true,
                    search: true,
                    onSelect(event) {
                        console.log('click', event)
                    },
                    onRemove(event) {
                        console.log('remove', event)
                    },
                    onShow(event) {
                        console.log('show', event)
                    },
                    onHide(event) {
                        console.log('hide', event)
                    },
                    render(item) {
                        return item.text
                    }
                })
                break
        }
    }

    // init buttons
    $('.buttons button')
        .on('click', function (event) {
            var ind = $(this).data('click')
            click.call(this, ind)
        })
})