import query from '../src/query.js'
import { w2sidebar } from '../src/w2sidebar.js'
import { w2ui } from '../src/w2utils.js'

// TODO: remove
window.w2ui = w2ui

let sidebar = new w2sidebar({
    name: 'sidebar',
    // flatButton: true,
    // flat: true,
    // topHTML: '<input>',
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
                { id: 'level-1-1', text: 'Level 1.1', icon: 'w2ui-icon-colors', disabled: true },
                { id: 'level-1-2', text: 'Level 1.2', icon1: 'w2ui-icon-plus' },
                { id: 'level-1-3', text: 'Level 1.3', icon: 'w2ui-icon-cross' },
                { id: 'level-1-4', text: 'Level 1.1', icon: 'w2ui-icon-colors' },
                { id: 'level-1-5', text: 'Level 1.2', icon1: 'w2ui-icon-plus' },
                { id: 'level-1-6', text: 'Level 1.3', icon: 'w2ui-icon-cross' },
                { id: 'level-1-7', text: 'Level 1.1', icon: 'w2ui-icon-colors' },
                { id: 'level-1-8', text: 'Level 1.2', icon1: 'w2ui-icon-plus' },
                { id: 'level-1-9', text: 'Level 1.3', icon: 'w2ui-icon-cross' },
                { id: 'level-1-10', text: 'Level 1.1', icon: 'w2ui-icon-colors' },
                { id: 'level-1-11', text: 'Level 1.2', icon1: 'w2ui-icon-plus' },
                { id: 'level-1-12', text: 'Level 1.1', icon: 'w2ui-icon-colors' },
                { id: 'level-1-13', text: 'Level 1.2', icon1: 'w2ui-icon-plus' },
                { id: 'level-1-14', text: 'Level 1.1', icon: 'w2ui-icon-colors' },
                { id: 'level-1-15', text: 'Level 1.2', icon1: 'w2ui-icon-plus' },
                { id: 'level-1-16', text: 'Level 1.1', icon: 'w2ui-icon-colors' },
                { id: 'level-1-17', text: 'Level 1.2', icon1: 'w2ui-icon-plus' },
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
                        { id: 'level-2-1-3', text: 'Level 2.1.3' },
                        { id: 'level-2-1-4', text: 'Level 2.1.1' },
                        { id: 'level-2-1-5', text: 'Level 2.1.2', count: 67 },
                        { id: 'level-2-1-6', text: 'Level 2.1.3' },
                        { id: 'level-2-1-7', text: 'Level 2.1.1' },
                        { id: 'level-2-1-8', text: 'Level 2.1.2', count: 67 },
                        { id: 'level-2-1-9', text: 'Level 2.1.3' },
                        { id: 'level-2-1-10', text: 'Level 2.1.1' },
                        { id: 'level-2-1-11', text: 'Level 2.1.2', count: 67 },
                        { id: 'level-2-1-12', text: 'Level 2.1.3' },
                    ]
                },
                { id: 'level-2-2', text: 'Level 2.2' },
                { id: 'level-2-3', text: 'Level 2.3' }

            ]

        }
    ],
    onClick(event) {
        console.log('click', event)
    },
    menu: [
        { id: 1, text: 'Menu 1', icon: 'w2ui-icon-cross' },
        { id: 2, text: 'Menu 2', icon: 'w2ui-icon-plus' },
        { id: 3, text: 'Menu 3', icon: 'w2ui-icon-colors' },
    ],
    onMenuClick(event) {
        console.log(event)
    }
})

sidebar.render(query('#sidebar')[0])