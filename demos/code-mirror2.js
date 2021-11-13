// ------
// Init Code Mirror mixed HTML in one command

$(function () {
    $('head').append(
        '<!-- CODE MIRROR -->\n'+
        '<link rel="stylesheet" href="code-mirror.css">\n'+
        '<link href="../js/CodeMirror-5.63/lib/codemirror.css" rel="stylesheet">\n'+
        '<script src="../js/CodeMirror-5.63/lib/codemirror.js"></script>\n'+
        '<script src="../js/CodeMirror-5.63/mode/javascript/javascript.js"></script>\n'+
        '<script src="../js/CodeMirror-5.63/mode/htmlmixed/htmlmixed.js"></script>\n'+
        '<script src="../js/CodeMirror-5.63/mode/css/css.js"></script>\n'+
        '<script src="../js/CodeMirror-5.63/mode/xml/xml.js"></script>\n'
    );
});