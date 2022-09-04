import { query } from '../src/w2compat.js'

query(function () {
    query('head').append(
        '<!-- CODE MIRROR -->\n'+
        '<link href="../libs/CodeMirror/lib/codemirror.css" rel="stylesheet">\n'+
        '<script id="main_codemirror" type="text/javascript" src="../libs/CodeMirror/lib/codemirror.js"></script>\n'
    )
    query('#main_codemirror').on('load', () => {
        query('head').append(
            '<script type="text/javascript" src="../libs/CodeMirror/mode/javascript/javascript.js"></script>\n'+
            '<script type="text/javascript" src="../libs/CodeMirror/mode/htmlmixed/htmlmixed.js"></script>\n'+
            '<script type="text/javascript" src="../libs/CodeMirror/mode/css/css.js"></script>\n'+
            '<script type="text/javascript" src="../libs/CodeMirror/mode/xml/xml.js"></script>\n'
        )
    })
})