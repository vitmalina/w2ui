export default {
    name: 'layout',
    panels: [
        { type: 'top', size: '20%', resizable: true },
        { type: 'left', size: '-300px', resizable: true, title: 'Some Title' },
        { type: 'main',
            title: 'Main Panel Title',
            html: 'some',
            html1: '<iframe style="width: 100%; height: 100%; border: 1px solid red;" src="http://refdesk.com"></iframe>',
            style: 'border: 1px solid green',
            tabs: {
                active : 'tab1',
                tabs : [
                    { id: 'tab1', text: 'General' },
                    { id: 'tab2', text: 'Additional' },
                    { id: 'tab3', text: 'tab3', closable: true },
                    { id: 'tab4', text: 'tab4', closable: true }
                ],
                onClick(event) {
                    this.owner.html('main', '<div style="padding:10px">Tab: '+ event.target +'</div>', null);
                }
            },
            toolbar: {
                items: [
                    { type: 'check',  id: 'item1', text: 'Check', img: 'icon-page', checked: true },
                    { type: 'drop',   id: 'item2', img: 'icon-folder', html: '<div style="padding: 10px">Some HTML text</div>' },
                    { type: 'break',  id: 'break0' },
                    { type: 'radio',  id: 'item3', group: 1, text: 'Radio 1', img: 'icon-page' },
                    { type: 'radio',  id: 'item4', group: 1, text: 'Radio 2', img: 'icon-page' }
                ],
                onClick(event) {
                    this.owner.html('main', '<div style="padding:10px">Toolbar: '+ event.target +'</div>');
                }
            }
        },
        { type: 'right', size: '300px', resizable: true, onHide: function (event) { console.log('hide right'); } },
        { type: 'preview', size: '50%', resizable: true,
            tabs1: {
                active : 'tab3',
                tabs : [
                    { id: 'tab1', text: 'General' },
                    { id: 'tab2', text: 'Additional' },
                    { id: 'tab3', text: 'tab3', closable: true },
                    { id: 'tab4', text: 'tab4', closable: true }
                ],
                onClick(event) {
                    if (event.target == 'tab1') this.owner.html('main', '<div style="padding:10px">tab1</div>');
                    if (event.target == 'tab2') this.owner.html('main', '<div style="padding:10px">tab2</div>');
                }
            },
        },
        { type: 'bottom', size: 50, resizable: true }
    ]
}