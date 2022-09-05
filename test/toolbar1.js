jQuery(function () {
    jQuery('#toolbar').w2toolbar({
        name: 'toolbar',
        right: [null, null, '<div style="padding: 9px 5px">RIGHT HTML</div>'],
        tooltip: 'top',
        items: [
            { type: 'button', id: 'item0.123', icon: 'fa fa-heart',  text: 'button1' },
            { type: 'button', id: 'item0.1231', icon: 'fa fa-heart', text: 'button2' },
            { type: 'button', id: 'item0.1232', icon: 'fa fa-heart', text: 'button3' },
            { type: 'button', id: 'item0.1233', icon: 'fa fa-heart', text: 'button4' },
            { type: 'button', id: 'item0.1234', icon: 'fa fa-heart', text: 'button5' },
            { type: 'break' },
            { type: 'button', id: 'item0.1235', icon: 'fa fa-heart', text: 'button6' },
            { type: 'spacer' },
            { type: 'button', id: 'item0.1236', icon: 'fa fa-heart', text: 'button7' },
            { type: 'new-line' },
            { type: 'button', id: 'item1', icon: 'w2ui-icon-search', text: 'button', count: 5, tooltip: 'Some' },
            { type: 'break' },
            { type: 'check', id: 'item11', icon: 'w2ui-icon-box', text: 'check' },
            { type: 'radio', id: 'item12', group: 1, icon: 'w2ui-icon-cross', text: 'radio', count: 5 },
            { type: 'radio', id: 'item13', group: 1,icon: 'w2ui-icon-plus', text: 'radio', count: 5 },
            { type: 'break' },

            { type: 'button', id: 'itemA1', icon: 'w2ui-icon-search', text: 'button 1',  arrow: true, tooltip: 'Some 1' },
            { type: 'button', id: 'itemA2', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'button', id: 'itemA3', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'button', id: 'itemA4', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'button', id: 'itemA5', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'new-line' },
            { type: 'button', id: 'itemA6', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'button', id: 'itemA7', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'button', id: 'itemA8', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'button', id: 'itemA9', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'button', id: 'itemA10', icon: 'w2ui-icon-search', text: 'button2',  tooltip: 'Some2' },
            { type: 'button', id: 'itemA11', icon: 'w2ui-icon-search', text: 'button',  tooltip: 'Some' },
            { type: 'html', id: 'html', html: 'some', style: 'color: red' },

            { type: 'spacer' },
            { type: 'menu', id: 'item2', icon: 'fa fa-heart', text: 'Radio Menu',
                items: [
                    { id: 'item2-1', text: 'First Item', count: 3, icon: 'fa fa-heart' },
                    { id: 'item2-2', text: 'Item 2', icon: 'fa fa-user', count: 12 },
                    { id: 'item2-3', text: 'Item 3', icon: 'fa fa-star-o' },
                    { id: 'item2-4', text: 'Item 4', icon: 'fa fa-link', hotkey: 'cmd+A' },
                    { id: 'item2-5', text: 'Just Text', hotkey: 'cmd+B' }
                ], overlay: { top1: 10 }
            },
            { type: 'menu-check', id: 'menucheck', icon: 'fa fa-user', text: 'Check Menu',
                items: () => [
                    { id: 'item1', text: 'Item 1.1', count: 3, icon: 'fa fa-heart' },
                    { id: 'item2', text: 'Item 1.2', icon: 'fa fa-user', count: 12, checked: true },
                    { id: 'item3', text: 'Item 1.3', icon: 'fa fa-star-o', hotkey: 'cmd+S' },
                    { text: '--Group Name' },
                    { id: 'item4', text: 'Item 2.1', group: '2', icon: 'fa fa-link' },
                    { id: 'item5', text: 'Item 2.2', group: '2', icon: 'fa fa-link' },
                    { id: 'item6', text: 'Item 2.3', group: '2', icon: 'fa fa-link' },
                    { text: '--' },
                    { id: 'item6', text: 'Link', group: false, icon: 'fa fa-link' }
                ],
            }
        ],
        onClick(event) {
            console.log(event, this.get(event.target))
        }
    });
});