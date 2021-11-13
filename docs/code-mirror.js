// ------
// Init Code Mirror mixed HTML in one command

$(function () {
    $('head').append(
        '<!-- CODE MIRROR -->\n'+
        '<link href="../libs/CodeMirror/lib/codemirror.css" rel="stylesheet">\n'+
        '<script src="../libs/CodeMirror/lib/codemirror.js"></script>\n'+
        '<script src="../libs/CodeMirror/mode/javascript/javascript.js"></script>\n'+
        '<script src="../libs/CodeMirror/mode/htmlmixed/htmlmixed.js"></script>\n'+
        '<script src="../libs/CodeMirror/mode/css/css.js"></script>\n'+
        '<script src="../libs/CodeMirror/mode/xml/xml.js"></script>\n'
    );
});