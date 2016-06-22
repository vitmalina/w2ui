/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2layout        - layout widget
*        - $().w2layout    - jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2toolbar, w2tabs
*
* == NICE TO HAVE ==
*   - onResize for the panel
*   - add more panel title positions (left=rotated, right=rotated, bottom)
*   - bug: when you assign content before previous transition completed.
* 1.5 changes
*   - message method
*
************************************************************************/

(function ($) {
    var w2layout = function (options) {
        this.box     = null;     // DOM Element that holds the element
        this.name    = null;     // unique name for w2ui
        this.panels  = [];
        this.tmp     = {};
        this.padding = 1;        // panel padding
        this.resizer = 4;        // resizer width or height
        this.style   = '';

        $.extend(true, this, w2obj.layout, options);
    };

    var w2panels = ['top', 'left', 'main', 'preview', 'right', 'bottom'];

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2layout = function(method) {
        if ($.isPlainObject(method)) {
            // check name parameter
            if (!w2utils.checkName(method, 'w2layout')) return;
            var panels = method.panels || [];
            var object = new w2layout(method);
            $.extend(object, { handlers: [], panels: [] });
            // add defined panels
            for (var p = 0, len = panels.length; p < len; p++) {
                object.panels[p] = $.extend(true, {}, w2layout.prototype.panel, panels[p]);
                if ($.isPlainObject(object.panels[p].tabs) || $.isArray(object.panels[p].tabs)) initTabs(object, panels[p].type);
                if ($.isPlainObject(object.panels[p].toolbar) || $.isArray(object.panels[p].toolbar)) initToolbar(object, panels[p].type);
            }
            // add all other panels
            for (var p1 = 0; p1 < w2panels.length; p1++) {
                if (object.get(w2panels[p1]) != null) continue;
                object.panels.push($.extend(true, {}, w2layout.prototype.panel, { type: w2panels[p1], hidden: (w2panels[p1] !== 'main'), size: 50 }));
            }
            if ($(this).length > 0) {
                object.render($(this)[0]);
            }
            w2ui[object.name] = object;
            return object;

        } else {
            var obj = w2ui[$(this).attr('name')];
            if (!obj) return null;
            if (arguments.length > 0) {
                if (obj[method]) obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
                return this;
            } else {
                return obj;
            }
        }

        function initTabs(object, panel, tabs) {
            var pan = object.get(panel);
            if (pan != null && tabs == null) tabs = pan.tabs;
            if (pan == null || tabs == null) return false;
            // instanciate tabs
            if ($.isArray(tabs)) tabs = { tabs: tabs };
            $().w2destroy(object.name + '_' + panel + '_tabs'); // destroy if existed
            pan.tabs = $().w2tabs($.extend({}, tabs, { owner: object, name: object.name + '_' + panel + '_tabs' }));
            pan.show.tabs = true;
            return true;
        }

        function initToolbar(object, panel, toolbar) {
            var pan = object.get(panel);
            if (pan != null && toolbar == null) toolbar = pan.toolbar;
            if (pan == null || toolbar == null) return false;
            // instanciate toolbar
            if ($.isArray(toolbar)) toolbar = { items: toolbar };
            $().w2destroy(object.name + '_' + panel + '_toolbar'); // destroy if existed
            pan.toolbar = $().w2toolbar($.extend({}, toolbar, { owner: object, name: object.name + '_' + panel + '_toolbar' }));
            pan.show.toolbar = true;
            return true;
        }
    };

    // ====================================================
    // -- Implementation of core functionality

    w2layout.prototype = {
        onShow        : null,
        onHide        : null,
        onResizing    : null,
        onResizerClick: null,
        onRender      : null,
        onRefresh     : null,
        onContent     : null,
        onResize      : null,
        onDestroy     : null,

        // default setting for a panel
        panel: {
            type      : null,       // left, right, top, bottom
            title     : '',
            size      : 100,        // width or height depending on panel name
            minSize   : 20,
            maxSize   : false,
            hidden    : false,
            resizable : false,
            overflow  : 'auto',
            style     : '',
            content   : '',         // can be String or Object with .render(box) method
            tabs      : null,
            toolbar   : null,
            width     : null,       // read only
            height    : null,       // read only
            show : {
                toolbar : false,
                tabs    : false
            },
            onRefresh : null,
            onShow    : null,
            onHide    : null
        },

        // alias for content
        html: function (panel, data, transition) {
            return this.content(panel, data, transition);
        },

        content: function (panel, data, transition) {
            var obj = this;
            var p = this.get(panel);
            // if it is CSS panel
            if (panel == 'css') {
                $('#layout_'+ obj.name +'_panel_css').html('<style>'+ data +'</style>');
                return true;
            }
            if (p == null) return false;
            if (data == null) {
                return p.content;
            }
            // event before
            var edata = this.trigger({ phase: 'before', type: 'content', target: panel, object: p, content: data, transition: transition });
            if (edata.isCancelled === true) return;

            if (data instanceof jQuery) {
                console.log('ERROR: You can not pass jQuery object to w2layout.content() method');
                return false;
            }
            var pname    = '#layout_'+ this.name + '_panel_'+ p.type;
            var current  = $(pname + '> .w2ui-panel-content');
            var panelTop = 0;
            if (current.length > 0) {
                $(pname).scrollTop(0);
                panelTop = $(current).position().top;
            }
            if (p.content === '') {
                p.content = data;
                this.refresh(panel);
            } else {
                p.content = data;
                if (!p.hidden) {
                    if (transition != null && transition !== '') {
                        // apply transition
                        var div1 = $(pname + '> .w2ui-panel-content');
                        div1.after('<div class="w2ui-panel-content new-panel" style="'+ div1[0].style.cssText +'"></div>');
                        var div2 = $(pname + '> .w2ui-panel-content.new-panel');
                        div1.css('top', panelTop);
                        div2.css('top', panelTop);
                        if (typeof data == 'object') {
                            data.box = div2[0]; // do not do .render(box);
                            data.render();
                        } else {
                            div2.html(data);
                        }
                        w2utils.transition(div1[0], div2[0], transition, function () {
                            div1.remove();
                            div2.removeClass('new-panel');
                            div2.css('overflow', p.overflow);
                            // IE Hack
                            obj.resize();
                            if (window.navigator.userAgent.indexOf('MSIE') != -1) setTimeout(function () { obj.resize(); }, 100);
                        });
                    }
                }
                this.refresh(panel);
            }
            // event after
            obj.trigger($.extend(edata, { phase: 'after' }));
            // IE Hack
            obj.resize();
            if (window.navigator.userAgent.indexOf('MSIE') != -1) setTimeout(function () { obj.resize(); }, 100);
            return true;
        },

        message: function(panel, options) {
            var obj = this;
            if (typeof options == 'string') {
                options = {
                    width   : (options.length < 300 ? 350 : 550),
                    height  : (options.length < 300 ? 170: 250),
                    body    : '<div class="w2ui-centered">' + options + '</div>',
                    buttons : '<button class="w2ui-btn" onclick="w2ui[\''+ this.name +'\'].message(\''+ panel +'\')">Ok</button>',
                    onOpen  : function (event) {
                        setTimeout(function () {
                            $(this.box).find('.w2ui-btn').focus();
                        }, 25);
                    }
                };
            }
            var p   = this.get(panel);
            var $el = $('#layout_'+ this.name + '_panel_'+ p.type);
            var oldOverflow = $el.css('overflow');
            var oldOnClose;
            if (options) {
                if (options.onClose) oldOnClose = options.onClose;
                options.onClose = function (event) {
                    if (typeof oldOnClose == 'function') oldOnClose(event);
                    event.done(function () {
                        $('#layout_'+ obj.name + '_panel_'+ p.type).css('overflow', oldOverflow);
                    });
                };
            }
            $('#layout_'+ this.name + '_panel_'+ p.type).css('overflow', 'hidden');
            w2utils.message.call(this, {
                box   : $('#layout_'+ this.name + '_panel_'+ p.type),
                param : panel,
                path  : 'w2ui.' + this.name,
                title : '.w2ui-panel-title:visible',
                body  : '.w2ui-panel-content'
            }, options);
        },

        load: function (panel, url, transition, onLoad) {
            var obj = this;
            if (panel == 'css') {
                $.get(url, function (data, status, xhr) { // should always be $.get as it is template
                    obj.content(panel, xhr.responseText);
                    if (onLoad) onLoad();
                });
                return true;
            }
            if (this.get(panel) != null) {
                $.get(url, function (data, status, xhr) { // should always be $.get as it is template
                    obj.content(panel, xhr.responseText, transition);
                    if (onLoad) onLoad();
                    // IE Hack
                    obj.resize();
                    if (window.navigator.userAgent.indexOf('MSIE') != -1) setTimeout(function () { obj.resize(); }, 100);
                });
                return true;
            }
            return false;
        },

        sizeTo: function (panel, size, instant) {
            var obj = this;
            var pan = obj.get(panel);
            if (pan == null) return false;
            // resize
            $(obj.box).find(' > div > .w2ui-panel')
                .css(w2utils.cssPrefix('transition', (instant !== true ? '.2s' : '0s')));
            setTimeout(function () {
                obj.set(panel, { size: size });
            }, 1);
            // clean
            setTimeout(function () {
                $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '0s'));
                obj.resize();
            }, 500);
            return true;
        },

        show: function (panel, immediate) {
            var obj = this;
            // event before
            var edata = this.trigger({ phase: 'before', type: 'show', target: panel, object: this.get(panel), immediate: immediate });
            if (edata.isCancelled === true) return;

            var p = obj.get(panel);
            if (p == null) return false;
            p.hidden = false;
            if (immediate === true) {
                $('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '1' });
                obj.trigger($.extend(edata, { phase: 'after' }));
                obj.resize();
            } else {
                // resize
                $('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0' });
                $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '.2s'));
                setTimeout(function () { obj.resize(); }, 1);
                // show
                setTimeout(function() {
                    $('#layout_'+ obj.name +'_panel_'+ panel).css({ 'opacity': '1' });
                }, 250);
                // clean
                setTimeout(function () {
                    $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '0s'));
                    obj.trigger($.extend(edata, { phase: 'after' }));
                    obj.resize();
                }, 500);
            }
            return true;
        },

        hide: function (panel, immediate) {
            var obj = this;
            // event before
            var edata = this.trigger({ phase: 'before', type: 'hide', target: panel, object: this.get(panel), immediate: immediate });
            if (edata.isCancelled === true) return;

            var p = obj.get(panel);
            if (p == null) return false;
            p.hidden = true;
            if (immediate === true) {
                $('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0'    });
                obj.trigger($.extend(edata, { phase: 'after' }));
                obj.resize();
            } else {
                // hide
                $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '.2s'));
                $('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0'    });
                setTimeout(function () { obj.resize(); }, 1);
                // clean
                setTimeout(function () {
                    $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '0s'));
                    obj.trigger($.extend(edata, { phase: 'after' }));
                    obj.resize();
                }, 500);
            }
            return true;
        },

        toggle: function (panel, immediate) {
            var p = this.get(panel);
            if (p == null) return false;
            if (p.hidden) return this.show(panel, immediate); else return this.hide(panel, immediate);
        },

        set: function (panel, options) {
            var ind = this.get(panel, true);
            if (ind == null) return false;
            $.extend(this.panels[ind], options);
            // refresh only when content changed
            if (options.content != null || options.resizable != null) {
                this.refresh(panel);
            }
            // show/hide resizer
            this.resize(); // resize is needed when panel size is changed
            return true;
        },

        get: function (panel, returnIndex) {
            for (var p = 0; p < this.panels.length; p++) {
                if (this.panels[p].type == panel) {
                    if (returnIndex === true) return p; else return this.panels[p];
                }
            }
            return null;
        },

        el: function (panel) {
            var el = $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-content');
            if (el.length != 1) return null;
            return el[0];
        },

        hideToolbar: function (panel) {
            var pan = this.get(panel);
            if (!pan) return;
            pan.show.toolbar = false;
            $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-toolbar').hide();
            this.resize();
        },

        showToolbar: function (panel) {
            var pan = this.get(panel);
            if (!pan) return;
            pan.show.toolbar = true;
            $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-toolbar').show();
            this.resize();
        },

        toggleToolbar: function (panel) {
            var pan = this.get(panel);
            if (!pan) return;
            if (pan.show.toolbar) this.hideToolbar(panel); else this.showToolbar(panel);
        },

        assignToolbar: function (panel, toolbar) {
            if (typeof toolbar == 'string' && w2ui[toolbar] != null) toolbar = w2ui[toolbar];
            var pan = this.get(panel);
            pan.toolbar = toolbar;
            var tmp = $(this.box).find(panel +'> .w2ui-panel-toolbar');
            if (pan.toolbar != null) {
                if (tmp.find('[name='+ pan.toolbar.name +']').length === 0) {
                    tmp.w2render(pan.toolbar);
                } else if (pan.toolbar != null) {
                    pan.toolbar.refresh();
                }
                this.showToolbar(panel);
                this.refresh('main');
            } else {
                tmp.html('');
                this.hideToolbar(panel);
            }
        },

        hideTabs: function (panel) {
            var pan = this.get(panel);
            if (!pan) return;
            pan.show.tabs = false;
            $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-tabs').hide();
            this.resize();
        },

        showTabs: function (panel) {
            var pan = this.get(panel);
            if (!pan) return;
            pan.show.tabs = true;
            $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-tabs').show();
            this.resize();
        },

        toggleTabs: function (panel) {
            var pan = this.get(panel);
            if (!pan) return;
            if (pan.show.tabs) this.hideTabs(panel); else this.showTabs(panel);
        },

        render: function (box) {
            var obj = this;
            // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
            var time = (new Date()).getTime();
            // event before
            var edata = obj.trigger({ phase: 'before', type: 'render', target: obj.name, box: box });
            if (edata.isCancelled === true) return;

            if (box != null) {
                if ($(obj.box).find('#layout_'+ obj.name +'_panel_main').length > 0) {
                    $(obj.box)
                        .removeAttr('name')
                        .removeClass('w2ui-layout')
                        .html('');
                }
                obj.box = box;
            }
            if (!obj.box) return false;
            $(obj.box)
                .attr('name', obj.name)
                .addClass('w2ui-layout')
                .html('<div></div>');
            if ($(obj.box).length > 0) $(obj.box)[0].style.cssText += obj.style;
            // create all panels
            for (var p1 = 0; p1 < w2panels.length; p1++) {
                var pan  = obj.get(w2panels[p1]);
                var html =  '<div id="layout_'+ obj.name + '_panel_'+ w2panels[p1] +'" class="w2ui-panel">'+
                            '    <div class="w2ui-panel-title"></div>'+
                            '    <div class="w2ui-panel-tabs"></div>'+
                            '    <div class="w2ui-panel-toolbar"></div>'+
                            '    <div class="w2ui-panel-content"></div>'+
                            '</div>'+
                            '<div id="layout_'+ obj.name + '_resizer_'+ w2panels[p1] +'" class="w2ui-resizer"></div>';
                $(obj.box).find(' > div').append(html);
                // tabs are rendered in refresh()
            }
            $(obj.box).find(' > div')
                .append('<div id="layout_'+ obj.name + '_panel_css" style="position: absolute; top: 10000px;"></div>');
            obj.refresh(); // if refresh is not called here, the layout will not be available right after initialization
            // process event
            obj.trigger($.extend(edata, { phase: 'after' }));
            // reinit events
            setTimeout(function () { // needed this timeout to allow browser to render first if there are tabs or toolbar
                initEvents();
                obj.resize();
            }, 0);
            return (new Date()).getTime() - time;

            function initEvents() {
                obj.tmp.events = {
                    resize : function (event) {
                        w2ui[obj.name].resize();
                    },
                    resizeStart : resizeStart,
                    mouseMove   : resizeMove,
                    mouseUp     : resizeStop
                };
                $(window).on('resize', obj.tmp.events.resize);
            }

            function resizeStart(type, evnt) {
                if (!obj.box) return;
                if (!evnt) evnt = window.event;
                $(document).off('mousemove', obj.tmp.events.mouseMove).on('mousemove', obj.tmp.events.mouseMove);
                $(document).off('mouseup', obj.tmp.events.mouseUp).on('mouseup', obj.tmp.events.mouseUp);
                obj.tmp.resize = {
                    type    : type,
                    x       : evnt.screenX,
                    y       : evnt.screenY,
                    diff_x  : 0,
                    diff_y  : 0,
                    value   : 0
                };
                // lock all panels
                for (var p1 = 0; p1 < w2panels.length; p1++) {
                    var $tmp = $(obj.el(w2panels[p1])).parent().find('.w2ui-lock');
                    if ($tmp.length > 0) {
                        $tmp.attr('locked', 'previous');
                    } else {
                        obj.lock(w2panels[p1], { opacity: 0 });
                    }
                }
                if (type == 'left' || type == 'right') {
                    obj.tmp.resize.value = parseInt($('#layout_'+ obj.name +'_resizer_'+ type)[0].style.left);
                }
                if (type == 'top' || type == 'preview' || type == 'bottom') {
                    obj.tmp.resize.value = parseInt($('#layout_'+ obj.name +'_resizer_'+ type)[0].style.top);
                }
            }

            function resizeStop(evnt) {
                if (!obj.box) return;
                if (!evnt) evnt = window.event;
                $(document).off('mousemove', obj.tmp.events.mouseMove);
                $(document).off('mouseup', obj.tmp.events.mouseUp);
                if (obj.tmp.resize == null) return;
                // unlock all panels
                for (var p1 = 0; p1 < w2panels.length; p1++) {
                    var $tmp = $(obj.el(w2panels[p1])).parent().find('.w2ui-lock');
                    if ($tmp.attr('locked') == 'previous') {
                        $tmp.removeAttr('locked');
                    } else {
                        obj.unlock(w2panels[p1]);
                    }
                }
                // set new size
                if (obj.tmp.diff_x !== 0 || obj.tmp.resize.diff_y !== 0) { // only recalculate if changed
                    var ptop    = obj.get('top');
                    var pbottom = obj.get('bottom');
                    var panel   = obj.get(obj.tmp.resize.type);
                    var height  = parseInt($(obj.box).height());
                    var width   = parseInt($(obj.box).width());
                    var str     = String(panel.size);
                    var ns, nd;
                    switch (obj.tmp.resize.type) {
                        case 'top':
                            ns = parseInt(panel.sizeCalculated) + obj.tmp.resize.diff_y;
                            nd = 0;
                            break;
                        case 'bottom':
                            ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.diff_y;
                            nd = 0;
                            break;
                        case 'preview':
                            ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.diff_y;
                            nd = (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) +
                                (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
                            break;
                        case 'left':
                            ns = parseInt(panel.sizeCalculated) + obj.tmp.resize.diff_x;
                            nd = 0;
                            break;
                        case 'right':
                            ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.diff_x;
                            nd = 0;
                            break;
                    }
                    // set size
                    if (str.substr(str.length-1) == '%') {
                        panel.size = Math.floor(ns * 100 / (panel.type == 'left' || panel.type == 'right' ? width : height - nd) * 100) / 100 + '%';
                    } else {
                        if (String(panel.size).substr(0, 1) == '-') {
                            panel.size = parseInt(panel.size) - panel.sizeCalculated + ns;
                        } else {
                            panel.size = ns;
                        }
                    }
                    obj.resize();
                }
                $('#layout_'+ obj.name + '_resizer_'+ obj.tmp.resize.type).removeClass('active');
                delete obj.tmp.resize;
            }

            function resizeMove(evnt) {
                if (!obj.box) return;
                if (!evnt) evnt = window.event;
                if (obj.tmp.resize == null) return;
                var panel = obj.get(obj.tmp.resize.type);
                // event before
                var tmp = obj.tmp.resize;
                var edata = obj.trigger({ phase: 'before', type: 'resizing', target: obj.name, object: panel, originalEvent: evnt,
                    panel: tmp ? tmp.type : 'all', diff_x: tmp ? tmp.diff_x : 0, diff_y: tmp ? tmp.diff_y : 0 });
                if (edata.isCancelled === true) return;

                var p         = $('#layout_'+ obj.name + '_resizer_'+ tmp.type);
                var resize_x  = (evnt.screenX - tmp.x);
                var resize_y  = (evnt.screenY - tmp.y);
                var mainPanel = obj.get('main');

                if (!p.hasClass('active')) p.addClass('active');

                switch (tmp.type) {
                    case 'left':
                        if (panel.minSize - resize_x > panel.width) {
                            resize_x = panel.minSize - panel.width;
                        }
                        if (panel.maxSize && (panel.width + resize_x > panel.maxSize)) {
                            resize_x = panel.maxSize - panel.width;
                        }
                        if (mainPanel.minSize + resize_x > mainPanel.width) {
                            resize_x = mainPanel.width - mainPanel.minSize;
                        }
                        break;

                    case 'right':
                        if (panel.minSize + resize_x > panel.width) {
                            resize_x = panel.width - panel.minSize;
                        }
                        if (panel.maxSize && (panel.width - resize_x > panel.maxSize)) {
                            resize_x = panel.width - panel.maxSize;
                        }
                        if (mainPanel.minSize - resize_x > mainPanel.width) {
                            resize_x = mainPanel.minSize - mainPanel.width;
                        }
                        break;

                    case 'top':
                        if (panel.minSize - resize_y > panel.height) {
                            resize_y = panel.minSize - panel.height;
                        }
                        if (panel.maxSize && (panel.height + resize_y > panel.maxSize)) {
                            resize_y = panel.maxSize - panel.height;
                        }
                        if (mainPanel.minSize + resize_y > mainPanel.height) {
                            resize_y = mainPanel.height - mainPanel.minSize;
                        }
                        break;

                    case 'preview':
                    case 'bottom':
                        if (panel.minSize + resize_y > panel.height) {
                            resize_y = panel.height - panel.minSize;
                        }
                        if (panel.maxSize && (panel.height - resize_y > panel.maxSize)) {
                            resize_y = panel.height - panel.maxSize;
                        }
                        if (mainPanel.minSize - resize_y > mainPanel.height) {
                            resize_y = mainPanel.minSize - mainPanel.height;
                        }
                        break;
                }
                tmp.diff_x = resize_x;
                tmp.diff_y = resize_y;

                switch (tmp.type) {
                    case 'top':
                    case 'preview':
                    case 'bottom':
                        tmp.diff_x = 0;
                        if (p.length > 0) p[0].style.top = (tmp.value + tmp.diff_y) + 'px';
                        break;

                    case 'left':
                    case 'right':
                        tmp.diff_y = 0;
                        if (p.length > 0) p[0].style.left = (tmp.value + tmp.diff_x) + 'px';
                        break;
                }
                // event after
                obj.trigger($.extend(edata, { phase: 'after' }));
            }
        },

        refresh: function (panel) {
            var obj = this;
            // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
            if (panel == null) panel = null;
            var time = (new Date()).getTime();
            // event before
            var edata = obj.trigger({ phase: 'before', type: 'refresh', target: (panel != null ? panel : obj.name), object: obj.get(panel) });
            if (edata.isCancelled === true) return;
            // obj.unlock(panel);
            if (typeof panel == 'string') {
                var p = obj.get(panel);
                if (p == null) return;
                var pname = '#layout_'+ obj.name + '_panel_'+ p.type;
                var rname = '#layout_'+ obj.name +'_resizer_'+ p.type;
                // apply properties to the panel
                $(pname).css({ display: p.hidden ? 'none' : 'block' });
                if (p.resizable) $(rname).show(); else $(rname).hide();
                // insert content
                if (typeof p.content == 'object' && typeof p.content.render === 'function') {
                    p.content.box = $(pname +'> .w2ui-panel-content')[0];
                    setTimeout(function () {
                        // need to remove unnecessary classes
                        if ($(pname +'> .w2ui-panel-content').length > 0) {
                            $(pname +'> .w2ui-panel-content')
                                .removeClass()
                                .removeAttr('name')
                                .addClass('w2ui-panel-content')
                                .css('overflow', p.overflow)[0].style.cssText += ';' + p.style;
                        }
                        if (p.content && typeof p.content.render == 'function') {
                           p.content.render(); // do not do .render(box);
                        }
                    }, 1);
                } else {
                    // need to remove unnecessary classes
                    if ($(pname +'> .w2ui-panel-content').length > 0) {
                        $(pname +'> .w2ui-panel-content')
                            .removeClass()
                            .removeAttr('name')
                            .addClass('w2ui-panel-content')
                            .html(p.content)
                            .css('overflow', p.overflow)[0].style.cssText += ';' + p.style;
                    }
                }
                // if there are tabs and/or toolbar - render it
                var tmp = $(obj.box).find(pname +'> .w2ui-panel-tabs');
                if (p.show.tabs) {
                    if (tmp.find('[name='+ p.tabs.name +']').length === 0 && p.tabs != null) tmp.w2render(p.tabs); else p.tabs.refresh();
                } else {
                    tmp.html('').removeClass('w2ui-tabs').hide();
                }
                tmp = $(obj.box).find(pname +'> .w2ui-panel-toolbar');
                if (p.show.toolbar) {
                    if (tmp.find('[name='+ p.toolbar.name +']').length === 0 && p.toolbar != null) tmp.w2render(p.toolbar); else p.toolbar.refresh();
                } else {
                    tmp.html('').removeClass('w2ui-toolbar').hide();
                }
                // show title
                tmp = $(obj.box).find(pname +'> .w2ui-panel-title');
                if (p.title) {
                    tmp.html(p.title).show();
                } else {
                    tmp.html('').hide();
                }
            } else {
                if ($('#layout_'+ obj.name +'_panel_main').length === 0) {
                    obj.render();
                    return;
                }
                obj.resize();
                // refresh all of them
                for (var p1 = 0; p1 < this.panels.length; p1++) { obj.refresh(this.panels[p1].type); }
            }
            obj.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        resize: function () {
            // if (window.getSelection) window.getSelection().removeAllRanges();    // clear selection
            if (!this.box) return false;
            var time = (new Date()).getTime();
            // event before
            var tmp = this.tmp.resize;
            var edata = this.trigger({ phase: 'before', type: 'resize', target: this.name,
                panel: tmp ? tmp.type : 'all', diff_x: tmp ? tmp.diff_x : 0, diff_y: tmp ? tmp.diff_y : 0  });
            if (edata.isCancelled === true) return;
            if (this.padding < 0) this.padding = 0;

            // layout itself
            var width  = parseInt($(this.box).width());
            var height = parseInt($(this.box).height());
            $(this.box).find(' > div').css({
                width    : width + 'px',
                height    : height + 'px'
            });
            var obj = this;
            // panels
            var pmain   = this.get('main');
            var pprev   = this.get('preview');
            var pleft   = this.get('left');
            var pright  = this.get('right');
            var ptop    = this.get('top');
            var pbottom = this.get('bottom');
            var smain   = true; // main always on
            var sprev   = (pprev != null && pprev.hidden !== true ? true : false);
            var sleft   = (pleft != null && pleft.hidden !== true ? true : false);
            var sright  = (pright != null && pright.hidden !== true ? true : false);
            var stop    = (ptop != null && ptop.hidden !== true ? true : false);
            var sbottom = (pbottom != null && pbottom.hidden !== true ? true : false);
            var l, t, w, h, e;
            // calculate %
            for (var p = 0; p < w2panels.length; p++) {
                if (w2panels[p] === 'main') continue;
                tmp = this.get(w2panels[p]);
                if (!tmp) continue;
                var str = String(tmp.size || 0);
                if (str.substr(str.length-1) == '%') {
                    var tmph = height;
                    if (tmp.type == 'preview') {
                        tmph = tmph -
                            (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) -
                            (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0);
                    }
                    tmp.sizeCalculated = parseInt((tmp.type == 'left' || tmp.type == 'right' ? width : tmph) * parseFloat(tmp.size) / 100);
                } else {
                    tmp.sizeCalculated = parseInt(tmp.size);
                }
                tmp.sizeCalculated = Math.max(tmp.sizeCalculated, parseInt(tmp.minSize));
            }
            // negative size
            if (String(pright.size).substr(0, 1) == '-') {
                if (sleft && pleft.size.substr(0, 1) == '-') {
                    console.log('ERROR: you cannot have both left panel.size and right panel.size be negative.');
                } else {
                    pright.sizeCalculated = width - (sleft ? pleft.sizeCalculated : 0) + parseInt(pright.size);
                }
            }
            if (String(pleft.size).substr(0, 1) == '-') {
                if (sright && pright.size.substr(0, 1) == '-') {
                    console.log('ERROR: you cannot have both left panel.size and right panel.size be negative.');
                } else {
                    pleft.sizeCalculated = width - (sright ? pright.sizeCalculated : 0) + parseInt(pleft.size);
                }
            }
            // top if any
            if (ptop != null && ptop.hidden !== true) {
                l = 0;
                t = 0;
                w = width;
                h = ptop.sizeCalculated;
                $('#layout_'+ this.name +'_panel_top').css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                }).show();
                ptop.width  = w;
                ptop.height = h;
                // resizer
                if (ptop.resizable) {
                    t = ptop.sizeCalculated - (this.padding === 0 ? this.resizer : 0);
                    h = (this.resizer > this.padding ? this.resizer : this.padding);
                    $('#layout_'+ this.name +'_resizer_top').show().css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ns-resize'
                    }).off('mousedown').on('mousedown', function (event) {
                        // event before
                        var edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'top', originalEvent: event });
                        if (edata.isCancelled === true) return;
                        // default action
                        w2ui[obj.name].tmp.events.resizeStart('top', event);
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }));
                        return false;
                    });
                }
            } else {
                $('#layout_'+ this.name +'_panel_top').hide();
                $('#layout_'+ this.name +'_resizer_top').hide();
            }
            // left if any
            if (pleft != null && pleft.hidden !== true) {
                l = 0;
                t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
                w = pleft.sizeCalculated;
                h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
                        (sbottom ? pbottom.sizeCalculated + this.padding : 0);
                e = $('#layout_'+ this.name +'_panel_left');
                if (window.navigator.userAgent.indexOf('MSIE') != -1 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
                e.css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                }).show();
                pleft.width  = w;
                pleft.height = h;
                // resizer
                if (pleft.resizable) {
                    l = pleft.sizeCalculated - (this.padding === 0 ? this.resizer : 0);
                    w = (this.resizer > this.padding ? this.resizer : this.padding);
                    $('#layout_'+ this.name +'_resizer_left').show().css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ew-resize'
                    }).off('mousedown').on('mousedown', function (event) {
                        // event before
                        var edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'left', originalEvent: event });
                        if (edata.isCancelled === true) return;
                        // default action
                        w2ui[obj.name].tmp.events.resizeStart('left', event);
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }));
                        return false;
                    });
                }
            } else {
                $('#layout_'+ this.name +'_panel_left').hide();
                $('#layout_'+ this.name +'_resizer_left').hide();
            }
            // right if any
            if (pright != null && pright.hidden !== true) {
                l = width - pright.sizeCalculated;
                t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
                w = pright.sizeCalculated;
                h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
                    (sbottom ? pbottom.sizeCalculated + this.padding : 0);
                $('#layout_'+ this.name +'_panel_right').css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                }).show();
                pright.width  = w;
                pright.height = h;
                // resizer
                if (pright.resizable) {
                    l = l - this.padding;
                    w = (this.resizer > this.padding ? this.resizer : this.padding);
                    $('#layout_'+ this.name +'_resizer_right').show().css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ew-resize'
                    }).off('mousedown').on('mousedown', function (event) {
                        // event before
                        var edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'right', originalEvent: event });
                        if (edata.isCancelled === true) return;
                        // default action
                        w2ui[obj.name].tmp.events.resizeStart('right', event);
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }));
                        return false;
                    });
                }
            } else {
                $('#layout_'+ this.name +'_panel_right').hide();
                $('#layout_'+ this.name +'_resizer_right').hide();
            }
            // bottom if any
            if (pbottom != null && pbottom.hidden !== true) {
                l = 0;
                t = height - pbottom.sizeCalculated;
                w = width;
                h = pbottom.sizeCalculated;
                $('#layout_'+ this.name +'_panel_bottom').css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                }).show();
                pbottom.width  = w;
                pbottom.height = h;
                // resizer
                if (pbottom.resizable) {
                    t = t - (this.padding === 0 ? 0 : this.padding);
                    h = (this.resizer > this.padding ? this.resizer : this.padding);
                    $('#layout_'+ this.name +'_resizer_bottom').show().css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ns-resize'
                    }).off('mousedown').on('mousedown', function (event) {
                        // event before
                        var edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'bottom', originalEvent: event });
                        if (edata.isCancelled === true) return;
                        // default action
                        w2ui[obj.name].tmp.events.resizeStart('bottom', event);
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }));
                        return false;
                    });
                }
            } else {
                $('#layout_'+ this.name +'_panel_bottom').hide();
                $('#layout_'+ this.name +'_resizer_bottom').hide();
            }
            // main - always there
            l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0);
            t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0);
            w = width  - (sleft ? pleft.sizeCalculated + this.padding : 0) -
                (sright ? pright.sizeCalculated + this.padding: 0);
            h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
                (sbottom ? pbottom.sizeCalculated + this.padding : 0) -
                (sprev ? pprev.sizeCalculated + this.padding : 0);
            e = $('#layout_'+ this.name +'_panel_main');
            if (window.navigator.userAgent.indexOf('MSIE') != -1 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
            e.css({
                'display': 'block',
                'left': l + 'px',
                'top': t + 'px',
                'width': w + 'px',
                'height': h + 'px'
            });
            pmain.width  = w;
            pmain.height = h;

            // preview if any
            if (pprev != null && pprev.hidden !== true) {
                l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0);
                t = height - (sbottom ? pbottom.sizeCalculated + this.padding : 0) - pprev.sizeCalculated;
                w = width  - (sleft ? pleft.sizeCalculated + this.padding : 0) -
                    (sright ? pright.sizeCalculated + this.padding : 0);
                h = pprev.sizeCalculated;
                e = $('#layout_'+ this.name +'_panel_preview');
                if (window.navigator.userAgent.indexOf('MSIE') != -1 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17; // IE hack
                e.css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px'
                }).show();
                pprev.width  = w;
                pprev.height = h;
                // resizer
                if (pprev.resizable) {
                    t = t - (this.padding === 0 ? 0 : this.padding);
                    h = (this.resizer > this.padding ? this.resizer : this.padding);
                    $('#layout_'+ this.name +'_resizer_preview').show().css({
                        'display': 'block',
                        'left': l + 'px',
                        'top': t + 'px',
                        'width': w + 'px',
                        'height': h + 'px',
                        'cursor': 'ns-resize'
                    }).off('mousedown').on('mousedown', function (event) {
                        // event before
                        var edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'preview', originalEvent: event });
                        if (edata.isCancelled === true) return;
                        // default action
                        w2ui[obj.name].tmp.events.resizeStart('preview', event);
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }));
                        return false;
                    });
                }
            } else {
                $('#layout_'+ this.name +'_panel_preview').hide();
                $('#layout_'+ this.name +'_resizer_preview').hide();
            }

            // display tabs and toolbar if needed
            for (var p1 = 0; p1 < w2panels.length; p1++) {
                var pan = this.get(w2panels[p1]);
                var tmp2 = '#layout_'+ this.name +'_panel_'+ w2panels[p1] +' > .w2ui-panel-';
                var tabHeight = 0;
                if (pan) {
                    if (pan.title) {
                        tabHeight += w2utils.getSize($(tmp2 + 'title').css({ top: tabHeight + 'px', display: 'block' }), 'height');
                    }
                    if (pan.show.tabs) {
                        if (pan.tabs != null && w2ui[this.name +'_'+ w2panels[p1] +'_tabs']) w2ui[this.name +'_'+ w2panels[p1] +'_tabs'].resize();
                        tabHeight += w2utils.getSize($(tmp2 + 'tabs').css({ top: tabHeight + 'px', display: 'block' }), 'height');
                    }
                    if (pan.show.toolbar) {
                        if (pan.toolbar != null && w2ui[this.name +'_'+ w2panels[p1] +'_toolbar']) w2ui[this.name +'_'+ w2panels[p1] +'_toolbar'].resize();
                        tabHeight += w2utils.getSize($(tmp2 + 'toolbar').css({ top: tabHeight + 'px', display: 'block' }), 'height');
                    }
                }
                $(tmp2 + 'content').css({ display: 'block' }).css({ top: tabHeight + 'px' });
            }
            // send resize to all objects
            clearTimeout(this._resize_timer);
            this._resize_timer = setTimeout(function () {
                for (var e in w2ui) {
                    if (typeof w2ui[e].resize == 'function') {
                        // sent to all none-layouts
                        if (w2ui[e].panels == null) w2ui[e].resize();
                        // only send to nested layouts
                        var parent = $(w2ui[e].box).parents('.w2ui-layout');
                        if (parent.length > 0 && parent.attr('name') == obj.name) w2ui[e].resize();
                    }
                }
            }, 100);
            this.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        destroy: function () {
            // event before
            var edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
            if (edata.isCancelled === true) return;
            if (w2ui[this.name] == null) return false;
            // clean up
            if ($(this.box).find('#layout_'+ this.name +'_panel_main').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-layout')
                    .html('');
            }
            delete w2ui[this.name];
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            if (this.tmp.events && this.tmp.events.resize) $(window).off('resize', this.tmp.events.resize);
            return true;
        },

        lock: function (panel, msg, showSpinner) {
            if (w2panels.indexOf(panel) == -1) {
                console.log('ERROR: First parameter needs to be the a valid panel name.');
                return;
            }
            var args = Array.prototype.slice.call(arguments, 0);
            args[0]  = '#layout_'+ this.name + '_panel_' + panel;
            w2utils.lock.apply(window, args);
        },

        unlock: function (panel, speed) {
            if (w2panels.indexOf(panel) == -1) {
                console.log('ERROR: First parameter needs to be the a valid panel name.');
                return;
            }
            var nm = '#layout_'+ this.name + '_panel_' + panel;
            w2utils.unlock(nm, speed);
        }
    };

    $.extend(w2layout.prototype, w2utils.event);
    w2obj.layout = w2layout;
})(jQuery);
