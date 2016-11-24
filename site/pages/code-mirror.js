// Code Mirror

$(function () {

	// javascript
	$("textarea.javascript").each(function (index, el) {
		var obj = this;
		// resize to context
		var ta = $(this);
		$(ta).height(ta.scrollHeight + 2);
		// init Code Mirror
		var codeMirror = CodeMirror(
			function (elt) {
		  		obj.parentNode.replaceChild(elt, obj);
			}, {
				value		: $.trim($(obj).val()),
				mode		: "javascript",
				readOnly	: true,
				gutter		: true,
				lineNumbers	: false
			}
		);
	});

	// html
	$("textarea.html").each(function (index, el) {
		var obj = this;
		// resize to context
		var ta = $(this);
		$(ta).height(ta.scrollHeight + 2);
		// init Code Mirror
		var codeMirror = CodeMirror(
			function (elt) {
		  		obj.parentNode.replaceChild(elt, obj);
			}, {
				value		: $.trim($(obj).val()),
				mode		: "text/html",
				readOnly	: true,
				gutter		: true,
				lineNumbers	: false
			}
		);
	});

	// css
	$("textarea.css").each(function (index, el) {
		var obj = this;
		// resize to context
		var ta = $(this);
		$(ta).height(ta.scrollHeight + 2);
		// init Code Mirror
		var codeMirror = CodeMirror(
			function (elt) {
		  		obj.parentNode.replaceChild(elt, obj);
			}, {
				value		: $.trim($(obj).val()),
				mode		: "text/css",
				readOnly	: true,
				gutter		: true,
				lineNumbers	: false
			}
		);
	});

	// less
	$("textarea.less").each(function (index, el) {
		var obj = this;
		// resize to context
		var ta = $(this);
		$(ta).height(ta.scrollHeight + 2);
		// init Code Mirror
		var codeMirror = CodeMirror(
			function (elt) {
		  		obj.parentNode.replaceChild(elt, obj);
			}, {
				value		: $.trim($(obj).val()),
				mode		: "text/less",
				readOnly	: true,
				gutter		: true,
				lineNumbers	: false
			}
		);
	});
});