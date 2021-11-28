$(function () {
    $('#sidebar').w2sidebar({
        name: 'sidebar',
        // flat: true,
        icon: 'w2ui-icon-info',
        handle: {
            size: 10,
            style: 'color: red',
            content: '12'
        },
        nodes: [
            { id: 'level-0', text: 'Level 0', icon: 'w2ui-icon-colors' },
            {
                id: 'level-1',
                text: 'Level 1',
                icon: 'icon-folder',
                expanded: true,
                group: true,
                nodes: [
                      { id: 'level-1-1', text: 'Level 1.1', icon: 'w2ui-icon-colors' },
                      { id: 'level-1-2', text: 'Level 1.2', icon1: 'w2ui-icon-plus', plus: true },
                      { id: 'level-1-3', text: 'Level 1.3', icon: 'w2ui-icon-cross' }
                ]
            },
            {
                id: 'level-2',
                text: 'Level 2',
                icon: 'icon-folder',
                expanded: true,
                group: true,
                nodes: [
                    { id: 'level-2-1', text: 'Level 2.1', icon: 'w2ui-icon-settings', count: 3,
                        nodes: [
                            { id: 'level-2-1-1', text: 'Level 2.1.1' },
                            { id: 'level-2-1-2', text: 'Level 2.1.2', count: 67 },
                            { id: 'level-2-1-3', text: 'Level 2.1.3' }
                        ]
                    },
                    { id: 'level-2-2', text: 'Level 2.2' },
                    { id: 'level-2-3', text: 'Level 2.3' }

                ]

            }
        ]
    })
})