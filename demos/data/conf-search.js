export default {
    layout: {
        name: 'layout',
        padding: 5,
        panels: [
            { type: 'left', size: 200, minSize: 120, resizable: true },
            { type: 'main', html: '<div class="w2ui-centered" style="color: gray;">Select an Application</div>' },
            {
                type: 'right', size: -300, minSize: 120, resizable: true,
                html: '<div class="w2ui-centered" style="color: gray;">Provide a Search Criteria</div>'
            }
        ]
    },

    sidebar: {
        name: 'sidebar',
        icon: {
            style: 'padding: 6px 0 0 6px',
            text(node) {
                let color = Math.random() > 0.7 ? '#54cb84' : '#cdcdcd'
                let text = `<div style="width: 11px; height: 11px; border-radius: 10px; background-color: ${color};"></div>`
                return text
            },
            tooltip(node) {
                return `Icon "${node.text}" tooltip`
            },
            onClick(node, event) {
                console.log('Icon clicked', node)
                event.stopPropagation()
            }
        },
        nodes: [
            { id: 'apps', text: 'Applications', group: true, expanded: true, childOffset: -12, nodes: [
                { id: 'fin', text: 'FinTrack Hub', expanded: true,
                    countTooltip: 'cound over',
                    nodes: [
                        { id: 'fin-metrics', text: 'Metrics Explorer', count: 5 },
                        { id: 'fin-stats', text: 'Statistic Profiler' },
                        { id: 'fin-ledger', text: 'Ledger Logs', count: 150 },
                        { id: 'fin-calc', text: 'Investement Calc' },
                        { id: 'fin-risk', text: 'Risk Analyzer' }
                    ]
                },
                { id: 'money', text: 'MoneyFlow Suite',
                    nodes: [
                        { id: 'money-metrics', text: 'Market Metrics' },
                        { id: 'money-stats', text: 'Portfolio Stats' },
                        { id: 'money-logs', text: 'Audit Logs' },
                        { id: 'money-planner', text: 'Budget Planner' },
                        { id: 'money-complience', text: 'Complience Checker' },
                    ]

                },
                { id: 'captial', text: 'CapitalOptima',
                    nodes: [
                        { id: 'cap-metrics', text: 'Business Metrics' },
                        { id: 'cap-stats', text: 'Economical Statistics' },
                        { id: 'cap-logs', text: 'Transaction Logs' },
                        { id: 'cap-roi', text: 'ROI Predictor' },
                        { id: 'cap-tax', text: 'Tax Management' },
                    ]
                }
            ]}
        ],
        onClick(event) {
            w2ui.layout.html('main', w2ui.form)
            w2ui.layout.html('right', '<div class="w2ui-centered" style="color: gray;">Provide a Search Criteria</div>')
        }
    },

    form: {
        name: 'form',
        header: 'Search Fields',
        focus: -1,
        fields: {
            'General': {
                type: 'group', span: -1,
                attr: 'style="width: 100%"',
                fields: [
                    { field: 'metricId', type: 'text', html: { label: 'Metric ID' }},
                    { field: 'date', type: 'datetime', html: { label: 'Date & Time' }},
                ]
            },
            'Asset': {
                type: 'group', span: -1,
                attr: 'style="width: 100%"',
                fields: [
                    { field: 'assetClass', type: 'list',
                        options: { items: ['Stocks', 'Bonds', 'Real Estate'] },
                        html: { span: -1, label: 'Asset Class' }},
                    { field: 'ticker', type: 'text', html: { label: 'Ticker Symbol' }},
                    { field: 'roi', type: 'money', html: { label: 'Return on Investment (ROI)' }},
                    { field: 'eps', type: 'money', html: { label: 'Earnings per Share (EPS)' }},
                ]
            }
        },
        actions: {
            'Run Search'() {
                w2ui.layout.html('right', w2ui.grid)
            }
        }
    },

    grid: {
        name: 'grid',
        columns: [
            { field: 'date', text: 'Date', size: '120px' },
            { field: 'class', text: 'Asset Class', size: '80px' },
            { field: 'ticker', text: 'Symbol', size: '60px' },
            { field: 'notes', text: 'Notes', size: '100%' },
            { field: 'roi', text: 'ROI', size: '80px', render: 'money' },
            { field: 'eps', text: 'EPS', size: '80px', render: 'percent' },
            { field: 'peRatio', text: 'PE Ratio', size: '80px', render: 'percent' },
            { field: 'curRatio', text: 'Curr. Ratio', size: '80px', render: 'percent' },
            { field: 'yield', text: 'Yield', size: '80px', render: 'money' }
        ],
        records: [
            { recid: 1, date: '4/3/2022', class: 'Stock', notes: 'Good deal', ticker: 'APL', roi: 31.5, eps: 1.2, peRatio: 30, curRatio: 10, yield: 40 },
            { recid: 2, date: '12/12/2023', class: 'Stock', notes: 'Good deal', ticker: 'APL', roi: 31.5, eps: 1.2, peRatio: 30, curRatio: 10, yield: 40 },
        ]

    }
}