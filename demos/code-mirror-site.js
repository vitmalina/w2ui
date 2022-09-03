import { query } from 'https://rawgit.com/vitmalina/w2ui/master/dist/w2ui.es6.min.js'

query(function () {
    query('head').append(
        '<!-- CODE MIRROR -->\n'+
        '<link href="../js/CodeMirror-5.63/lib/codemirror.css" rel="stylesheet">\n'+
        '<script id="main_codemirror" src="../js/CodeMirror-5.63/lib/codemirror.js"></script>\n'
    )
    query('#main_codemirror').on('load', () => {
        query('head').append(
            '<script src="../js/CodeMirror-5.63/mode/javascript/javascript.js"></script>\n'+
            '<script src="../js/CodeMirror-5.63/mode/htmlmixed/htmlmixed.js"></script>\n'+
            '<script src="../js/CodeMirror-5.63/mode/css/css.js"></script>\n'+
            '<script src="../js/CodeMirror-5.63/mode/xml/xml.js"></script>\n'
        )
    })
})