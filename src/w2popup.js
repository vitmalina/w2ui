/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2popup      - popup widget
*        - $().w2popup  - jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*   - transition should include title, body and buttons, not just body
*
************************************************************************/

var w2popup = {};

(function () {

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2popup = function(method, options) {
        if (typeof method === 'undefined') {
            options = {};
            method  = 'open';
        }
        if ($.isPlainObject(method)) {
            options = method;
            method  = 'open';
        }
        method = method.toLowerCase();
        if (method === 'load' && typeof options === 'string') {
            options = $.extend({ url: options }, arguments.length > 2 ? arguments[2] : {});
        }
        if (method === 'open' && options.url != null) method = 'load';
        options = options || {};
        // load options from markup
        var dlgOptions = {};
        if ($(this).length > 0) {
            if ($(this).find('div[rel=title], div[rel=body], div[rel=buttons]').length > 0) {
                if ($(this).find('div[rel=title]').length > 0) {
                    dlgOptions['title'] = $(this).find('div[rel=title]').html();
                }
                if ($(this).find('div[rel=body]').length > 0) {
                    dlgOptions['body']  = $(this).find('div[rel=body]').html();
                    dlgOptions['style'] = $(this).find('div[rel=body]')[0].style.cssText;
                }
                if ($(this).find('div[rel=buttons]').length > 0) {
                    dlgOptions['buttons'] = $(this).find('div[rel=buttons]').html();
                }
            } else {
                dlgOptions['title'] = '&nbsp;';
                dlgOptions['body']  = $(this).html();
            }
            if (parseInt($(this).css('width')) != 0)  dlgOptions['width']  = parseInt($(this).css('width'));
            if (parseInt($(this).css('height')) != 0) dlgOptions['height'] = parseInt($(this).css('height'));
        }
        // show popup
        return w2popup[method]($.extend({}, dlgOptions, options));
    };

    // ====================================================
    // -- Implementation of core functionality (SINGELTON)

    w2popup = {
        defaults: {
            title     : '',
            body      : '',
            buttons   : '',
            style     : '',
            color     : '#000',
            opacity   : 0.4,
            speed     : 0.3,
            modal     : false,
            maximized : false,
            keyboard  : true,     // will close popup on esc if not modal
            width     : 500,
            height    : 300,
            showClose : true,
            showMax   : false,
            transition: null
        },
        status    : 'closed',     // string that describes current status
        handlers  : [],
        onOpen    : null,
        onClose   : null,
        onMax     : null,
        onMin     : null,
        onToggle  : null,
        onKeydown : null,

        open: function (options) {
            var obj = this;
            if (w2popup.status == 'closing') {
                setTimeout(function () { obj.open.call(obj, options); }, 100);
                return;
            }
            // get old options and merge them
            var old_options = $('#w2ui-popup').data('options');
            var options = $.extend({}, this.defaults, old_options, { title: '', body : '', buttons: '' }, options, { maximized: false });
            // need timer because popup might not be open
            setTimeout(function () { $('#w2ui-popup').data('options', options); }, 100);
            // if new - reset event handlers
            if ($('#w2ui-popup').length == 0) {
                w2popup.handlers  = [];
                w2popup.onMax     = null;
                w2popup.onMin     = null;
                w2popup.onToggle  = null;
                w2popup.onOpen    = null;
                w2popup.onClose   = null;
                w2popup.onKeydown = null;
            }
            if (options.onOpen)    w2popup.onOpen    = options.onOpen;
            if (options.onClose)   w2popup.onClose   = options.onClose;
            if (options.onMax)     w2popup.onMax     = options.onMax;
            if (options.onMin)     w2popup.onMin     = options.onMin;
            if (options.onToggle)  w2popup.onToggle  = options.onToggle;
            if (options.onKeydown) w2popup.onKeydown = options.onKeydown;

            if (window.innerHeight == undefined) {
                var width  = document.documentElement.offsetWidth;
                var height = document.documentElement.offsetHeight;
                if (w2utils.engine === 'IE7') { width += 21; height += 4; }
            } else {
                var width  = window.innerWidth;
                var height = window.innerHeight;
            }
            if (parseInt(width)  - 10 < parseInt(options.width))  options.width  = parseInt(width)  - 10;
            if (parseInt(height) - 10 < parseInt(options.height)) options.height = parseInt(height) - 10;
            var top  = parseInt(((parseInt(height) - parseInt(options.height)) / 2) * 0.6);
            var left = parseInt((parseInt(width) - parseInt(options.width)) / 2);
            // check if message is already displayed
            if ($('#w2ui-popup').length == 0) {
                // trigger event
                var eventData = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: false });
                if (eventData.isCancelled === true) return;
                w2popup.status = 'opening';
                // output message
                w2popup.lockScreen(options);
                var btn = '';
                if (options.showClose) {
                    btn += '<div class="w2ui-msg-button w2ui-msg-close" onmousedown="event.stopPropagation()" onclick="w2popup.close()">Close</div>';
                }
                if (options.showMax) {
                    btn += '<div class="w2ui-msg-button w2ui-msg-max" onmousedown="event.stopPropagation()" onclick="w2popup.toggle()">Max</div>';
                }
                var msg='<div id="w2ui-popup" class="w2ui-popup" style="opacity: 0; left: '+ left +'px; top: '+ top +'px;'+
                        '     width: ' + parseInt(options.width) + 'px; height: ' + parseInt(options.height) + 'px; '+
                        '    -webkit-transform: scale(0.8); -moz-transform: scale(0.8); -ms-transform: scale(0.8); -o-transform: scale(0.8); "'+
                        '>'+
                        '   <div class="w2ui-msg-title" style="'+ (options.title == '' ? 'display: none' : '') +'">' + btn + options.title + '</div>'+
                        '   <div class="w2ui-box1" style="'+ (options.title == '' ? 'top: 0px !important;' : '') + 
                                    (options.buttons == '' ? 'bottom: 0px !important;' : '') + '">'+
                        '       <div class="w2ui-msg-body' + (!options.title != '' ? ' w2ui-msg-no-title' : '') + 
                                    (!options.buttons != '' ? ' w2ui-msg-no-buttons' : '') + '" style="' + options.style + '">' + options.body + '</div>'+
                        '   </div>'+
                        '   <div class="w2ui-box2" style="' + (options.title == '' ? 'top: 0px !important;' : '') +
                                    (options.buttons == '' ? 'bottom: 0px !important;' : '') + '">'+
                        '       <div class="w2ui-msg-body' + (!options.title != '' ? ' w2ui-msg-no-title' : '') + 
                                    (!options.buttons != '' ? ' w2ui-msg-no-buttons' : '') + '" style="' + options.style + '"></div>'+
                        '       </div>'+
                        '   <div class="w2ui-msg-buttons" style="'+ (options.buttons == '' ? 'display: none' : '') +'">' + options.buttons + '</div>'+
                        '</div>';
                $('body').append(msg);
                // allow element to render
                setTimeout(function () {
                    $('#w2ui-popup .w2ui-box2').hide();
                    $('#w2ui-popup').css({
                        '-webkit-transition': options.speed + 's opacity, ' + options.speed + 's -webkit-transform',
                        '-webkit-transform': 'scale(1)',
                        '-moz-transition': options.speed + 's opacity, ' + options.speed + 's -moz-transform',
                        '-moz-transform': 'scale(1)',
                        '-ms-transition': options.speed + 's opacity, ' + options.speed + 's -ms-transform',
                        '-ms-transform': 'scale(1)',
                        '-o-transition': options.speed + 's opacity, ' + options.speed + 's -o-transform',
                        '-o-transform': 'scale(1)',
                        'opacity': '1'
                    });
                }, 1);
                // clean transform
                setTimeout(function () {
                    $('#w2ui-popup').css({
                        '-webkit-transform': '',
                        '-moz-transform': '',
                        '-ms-transform': '',
                        '-o-transform': ''
                    });
                    // event after
                    w2popup.status = 'open';
                    setTimeout(function () {
                        obj.trigger($.extend(eventData, { phase: 'after' }));
                    }, 100);
                }, options.speed * 1000);
            } else {
                // trigger event
                var eventData = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: true });
                if (eventData.isCancelled === true) return;
                // check if size changed
                w2popup.status = 'opening';
                if (typeof old_options == 'undefined' || old_options['width'] != options['width'] || old_options['height'] != options['height']) {
                    w2popup.resize(options.width, options.height);
                }
                if (typeof old_options != 'undefined') {
                    options.prevSize  = options.width + ':' + options.height;
                    options.maximized = old_options.maximized;
                }
                // show new items
                var body = $('#w2ui-popup .w2ui-box2 > .w2ui-msg-body').html(options.body);
                if (body.length > 0) body[0].style.cssText = options.style;
                if (options.buttons != '') {
                    $('#w2ui-popup .w2ui-msg-buttons').show().html(options.buttons);
                    $('#w2ui-popup .w2ui-msg-body').removeClass('w2ui-msg-no-buttons');
                    $('#w2ui-popup .w2ui-box1, #w2ui-popup .w2ui-box2').css('bottom', '');
                } else {
                    $('#w2ui-popup .w2ui-msg-buttons').hide().html('');
                    $('#w2ui-popup .w2ui-msg-body').addClass('w2ui-msg-no-buttons');
                    $('#w2ui-popup .w2ui-box1, #w2ui-popup .w2ui-box2').css('bottom', '0px');
                }
                if (options.title != '') {
                    $('#w2ui-popup .w2ui-msg-title').show().html(
                          (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onmousedown="event.stopPropagation()" onclick="w2popup.close()">Close</div>' : '') +
                          (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onmousedown="event.stopPropagation()" onclick="w2popup.toggle()">Max</div>' : '') +
                          options.title);
                    $('#w2ui-popup .w2ui-msg-body').removeClass('w2ui-msg-no-title');
                    $('#w2ui-popup .w2ui-box1, #w2ui-popup .w2ui-box2').css('top', '');
                } else {
                    $('#w2ui-popup .w2ui-msg-title').hide().html('');
                    $('#w2ui-popup .w2ui-msg-body').addClass('w2ui-msg-no-title');
                    $('#w2ui-popup .w2ui-box1, #w2ui-popup .w2ui-box2').css('top', '0px');
                }
                // transition
                var div_old = $('#w2ui-popup .w2ui-box1')[0];
                var div_new = $('#w2ui-popup .w2ui-box2')[0];
                w2utils.transition(div_old, div_new, options.transition);
                div_new.className = 'w2ui-box1';
                div_old.className = 'w2ui-box2';
                $(div_new).addClass('w2ui-current-box');
                // remove max state
                $('#w2ui-popup').data('prev-size', null);
                // call event onChange
                setTimeout(function () {
                    w2popup.status = 'open';
                    obj.trigger($.extend(eventData, { phase: 'after' }));
                }, 100);
            }
            // save new options
            options._last_w2ui_name = w2utils.keyboard.active();
            w2utils.keyboard.active(null);
            // keyboard events
            if (options.keyboard) $(document).on('keydown', this.keydown);

            // initialize move
            var tmp = {
                resizing : false,
                mvMove   : mvMove,
                mvStop   : mvStop
            };
            $('#w2ui-popup .w2ui-msg-title').on('mousedown', function (event) { mvStart(event); })

            // handlers
            function mvStart(evnt) {
                if (!evnt) evnt = window.event;
                if (!window.addEventListener) { window.document.attachEvent('onselectstart', function() { return false; } ); }
                w2popup.status = 'moving';
                tmp.resizing = true;
                tmp.x = evnt.screenX;
                tmp.y = evnt.screenY;
                tmp.pos_x = $('#w2ui-popup').position().left;
                tmp.pos_y = $('#w2ui-popup').position().top;
                w2popup.lock({ opacity: 0 });
                $(document).on('mousemove', tmp.mvMove);
                $(document).on('mouseup', tmp.mvStop);
                if (evnt.stopPropagation) evnt.stopPropagation(); else evnt.cancelBubble = true;
                if (evnt.preventDefault) evnt.preventDefault(); else return false;
            }

            function mvMove(evnt) {
                if (tmp.resizing != true) return;
                if (!evnt) evnt = window.event;
                tmp.div_x = evnt.screenX - tmp.x;
                tmp.div_y = evnt.screenY - tmp.y;
                $('#w2ui-popup').css({
                    '-webkit-transition': 'none',
                    '-webkit-transform': 'translate3d('+ tmp.div_x +'px, '+ tmp.div_y +'px, 0px)',
                    '-moz-transition': 'none',
                    '-moz-transform': 'translate('+ tmp.div_x +'px, '+ tmp.div_y +'px)',
                    '-ms-transition': 'none',
                    '-ms-transform': 'translate('+ tmp.div_x +'px, '+ tmp.div_y +'px)',
                    '-o-transition': 'none',
                    '-o-transform': 'translate('+ tmp.div_x +'px, '+ tmp.div_y +'px)'
                });
            }

            function mvStop(evnt) {
                if (tmp.resizing != true) return;
                if (!evnt) evnt = window.event;
                w2popup.status = 'open';
                tmp.div_x = (evnt.screenX - tmp.x);
                tmp.div_y = (evnt.screenY - tmp.y);
                $('#w2ui-popup').css({
                    'left': (tmp.pos_x + tmp.div_x) + 'px',
                    'top':    (tmp.pos_y  + tmp.div_y) + 'px',
                    '-webkit-transition': 'none',
                    '-webkit-transform': 'translate3d(0px, 0px, 0px)',
                    '-moz-transition': 'none',
                    '-moz-transform': 'translate(0px, 0px)',
                    '-ms-transition': 'none',
                    '-ms-transform': 'translate(0px, 0px)',
                    '-o-transition': 'none',
                    '-o-transform': 'translate(0px, 0px)'
                });
                tmp.resizing = false;
                $(document).off('mousemove', tmp.mvMove);
                $(document).off('mouseup', tmp.mvStop);
                w2popup.unlock();
            }
            return this;
        },

        keydown: function (event) {
            var options = $('#w2ui-popup').data('options');
            if (!options || !options.keyboard) return;
            // trigger event
            var eventData = w2popup.trigger({ phase: 'before', type: 'keydown', target: 'popup', options: options, originalEvent: event });
            if (eventData.isCancelled === true) return;
            // default behavior
            switch (event.keyCode) {
                case 27:
                    event.preventDefault();
                    if ($('#w2ui-popup .w2ui-popup-message').length > 0) w2popup.message(); else w2popup.close();
                    break;
            }
            // event after
            w2popup.trigger($.extend(eventData, { phase: 'after'}));
        },

        close: function (options) {
            var obj = this;
            var options = $.extend({}, $('#w2ui-popup').data('options'), options);
            if ($('#w2ui-popup').length == 0) return;
            // trigger event
            var eventData = this.trigger({ phase: 'before', type: 'close', target: 'popup', options: options });
            if (eventData.isCancelled === true) return;
            // default behavior
            w2popup.status = 'closing';
            $('#w2ui-popup').css({
                '-webkit-transition': options.speed + 's opacity, ' + options.speed + 's -webkit-transform',
                '-webkit-transform': 'scale(0.9)',
                '-moz-transition': options.speed + 's opacity, ' + options.speed + 's -moz-transform',
                '-moz-transform': 'scale(0.9)',
                '-ms-transition': options.speed + 's opacity, ' + options.speed + 's -ms-transform',
                '-ms-transform': 'scale(0.9)',
                '-o-transition': options.speed + 's opacity, ' + options.speed + 's -o-transform',
                '-o-transform': 'scale(0.9)',
                'opacity': '0'
            });
            w2popup.unlockScreen(options);
            setTimeout(function () {
                $('#w2ui-popup').remove();
                w2popup.status = 'closed';
                // event after
                obj.trigger($.extend(eventData, { phase: 'after'}));
            }, options.speed * 1000);
            // restore active
            w2utils.keyboard.active(options._last_w2ui_name);
            // remove keyboard events
            if (options.keyboard) $(document).off('keydown', this.keydown);
        },

        toggle: function () {
            var obj     = this;
            var options = $('#w2ui-popup').data('options');
            // trigger event
            var eventData = this.trigger({ phase: 'before', type: 'toggle', target: 'popup', options: options });
            if (eventData.isCancelled === true) return;
            // defatul action
            if (options.maximized === true) w2popup.min(); else w2popup.max();
            // event after
            setTimeout(function () {
                obj.trigger($.extend(eventData, { phase: 'after'}));
            }, (options.speed * 1000) + 50);
        },

        max: function () {
            var obj = this;
            var options = $('#w2ui-popup').data('options');
            if (options.maximized === true) return;
            // trigger event
            var eventData = this.trigger({ phase: 'before', type: 'max', target: 'popup', options: options });
            if (eventData.isCancelled === true) return;
            // default behavior
            w2popup.status   = 'resizing';
            options.prevSize = $('#w2ui-popup').css('width') + ':' + $('#w2ui-popup').css('height');
            // do resize
            w2popup.resize(10000, 10000, function () {
                w2popup.status    = 'open';
                options.maximized = true;
                obj.trigger($.extend(eventData, { phase: 'after'}));
            });
        },

        min: function () {
            var obj = this;
            var options = $('#w2ui-popup').data('options');
            if (options.maximized !== true) return;
            var size = options.prevSize.split(':');
            // trigger event
            var eventData = this.trigger({ phase: 'before', type: 'min', target: 'popup', options: options });
            if (eventData.isCancelled === true) return;
            // default behavior
            w2popup.status = 'resizing';
            // do resize
            w2popup.resize(size[0], size[1], function () {
                w2popup.status = 'open';
                options.maximized = false;
                options.prevSize  = null;
                obj.trigger($.extend(eventData, { phase: 'after'}));
            });
        },

        get: function () {
            return $('#w2ui-popup').data('options');
        },

        set: function (options) {
            w2popup.open(options);
        },

        clear: function() {
            $('#w2ui-popup .w2ui-msg-title').html('');
            $('#w2ui-popup .w2ui-msg-body').html('');
            $('#w2ui-popup .w2ui-msg-buttons').html('');
        },

        reset: function () {
            w2popup.open(w2popup.defaults);
        },

        load: function (options) {
            w2popup.status = 'loading';
            if (String(options.url) == 'undefined') {
                console.log('ERROR: The url parameter is empty.');
                return;
            }
            var tmp = String(options.url).split('#');
            var url = tmp[0];
            var selector = tmp[1];
            if (String(options) == 'undefined') options = {};
            // load url
            var html = $('#w2ui-popup').data(url);
            if (typeof html != 'undefined' && html != null) {
                popup(html, selector);
            } else {
                $.get(url, function (data, status, obj) { // should always be $.get as it is template
                    popup(obj.responseText, selector);
                    $('#w2ui-popup').data(url, obj.responseText); // remember for possible future purposes
                });
            }
            function popup(html, selector) {
                delete options.url;
                $('body').append('<div id="w2ui-tmp" style="display: none">' + html + '</div>');
                if (typeof selector != 'undefined' && $('#w2ui-tmp #'+selector).length > 0) {
                    $('#w2ui-tmp #' + selector).w2popup(options);
                } else {
                    $('#w2ui-tmp > div').w2popup(options);
                }
                // link styles
                if ($('#w2ui-tmp > style').length > 0) {
                    var style = $('<div>').append($('#w2ui-tmp > style').clone()).html();
                    if ($('#w2ui-popup #div-style').length == 0) {
                        $('#w2ui-popup').append('<div id="div-style" style="position: absolute; left: -100; width: 1px"></div>');
                    }
                    $('#w2ui-popup #div-style').html(style);
                }
                $('#w2ui-tmp').remove();
            }
        },

        message: function (options) {
            $().w2tag(); // hide all tags
            if (!options) options = { width: 200, height: 100 };
            if (parseInt(options.width) < 10)  options.width  = 10;
            if (parseInt(options.height) < 10) options.height = 10;
            if (typeof options.hideOnClick == 'undefined') options.hideOnClick = false;
            var poptions = $('#w2ui-popup').data('options') || {};
            if (typeof options.width == 'undefined' || options.width > poptions.width - 10) options.width = poptions.width - 10;
            if (typeof options.height == 'undefined' || options.height > poptions.height - 40) options.height = poptions.height - 40; // title is 30px or so

            var head     = $('#w2ui-popup .w2ui-msg-title');
            var pwidth   = parseInt($('#w2ui-popup').width());
            var msgCount = $('#w2ui-popup .w2ui-popup-message').length;
            // remove message
            if ($.trim(options.html) == '') {
                $('#w2ui-popup #w2ui-message'+ (msgCount-1)).css('z-Index', 250);
                var options = $('#w2ui-popup #w2ui-message'+ (msgCount-1)).data('options') || {};
                $('#w2ui-popup #w2ui-message'+ (msgCount-1)).remove();
                if (typeof options.onClose == 'function') options.onClose();
                if (msgCount == 1) {
                    w2popup.unlock();
                } else {
                    $('#w2ui-popup #w2ui-message'+ (msgCount-2)).show();
                }
            } else {
                // hide previous messages
                $('#w2ui-popup .w2ui-popup-message').hide();
                // add message
                $('#w2ui-popup .w2ui-box1')
                    .before('<div id="w2ui-message' + msgCount + '" class="w2ui-popup-message" style="display: none; ' +
                                (head.length == 0 ? 'top: 0px;' : 'top: ' + w2utils.getSize(head, 'height') + 'px;') +
                                (typeof options.width  != 'undefined' ? 'width: ' + options.width + 'px; left: ' + ((pwidth - options.width) / 2) + 'px;' : 'left: 10px; right: 10px;') +
                                (typeof options.height != 'undefined' ? 'height: ' + options.height + 'px;' : 'bottom: 6px;') +
                                '-webkit-transition: .3s; -moz-transition: .3s; -ms-transition: .3s; -o-transition: .3s;"' +
                                (options.hideOnClick === true ? 'onclick="w2popup.message();"' : '') + '>' +
                            '</div>');
                $('#w2ui-popup #w2ui-message'+ msgCount).data('options', options);
                var display = $('#w2ui-popup #w2ui-message'+ msgCount).css('display');
                $('#w2ui-popup #w2ui-message'+ msgCount).css({
                    '-webkit-transform': (display == 'none' ? 'translateY(-' + options.height + 'px)' : 'translateY(0px)'),
                    '-moz-transform': (display == 'none' ? 'translateY(-' + options.height + 'px)' : 'translateY(0px)'),
                    '-ms-transform': (display == 'none' ? 'translateY(-' + options.height + 'px)' : 'translateY(0px)'),
                    '-o-transform': (display == 'none' ? 'translateY(-' + options.height + 'px)' : 'translateY(0px)')
                });
                if (display == 'none') {
                    $('#w2ui-popup #w2ui-message'+ msgCount).show().html(options.html);
                    // timer needs to animation
                    setTimeout(function () {
                        $('#w2ui-popup #w2ui-message'+ msgCount).css({
                            '-webkit-transform': (display == 'none' ? 'translateY(0px)' : 'translateY(-' + options.height + 'px)'),
                            '-moz-transform': (display == 'none' ? 'translateY(0px)' : 'translateY(-' + options.height + 'px)'),
                            '-ms-transform': (display == 'none' ? 'translateY(0px)' : 'translateY(-' + options.height + 'px)'),
                            '-o-transform': (display == 'none' ? 'translateY(0px)' : 'translateY(-' + options.height + 'px)')
                        });
                    }, 1);
                    // timer for lock
                    setTimeout(function() {
                        $('#w2ui-popup #w2ui-message'+ msgCount).css({
                            '-webkit-transition': '0s',    '-moz-transition': '0s', '-ms-transition': '0s', '-o-transition': '0s',
                            'z-Index': 1500
                        }); // has to be on top of lock
                        if (msgCount == 0) w2popup.lock();
                        if (typeof options.onOpen == 'function') options.onOpen();
                    }, 300);
                }
            }
        },

        lock: function (msg, showSpinner) {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift($('#w2ui-popup'));
            w2utils.lock.apply(window, args);
        },

        unlock: function () {
            w2utils.unlock($('#w2ui-popup'));
        },

        // --- INTERNAL FUNCTIONS

        lockScreen: function (options) {
            if ($('#w2ui-lock').length > 0) return false;
            if (typeof options == 'undefined') options = $('#w2ui-popup').data('options');
            if (typeof options == 'undefined') options = {};
            options = $.extend({}, w2popup.defaults, options);
            // show element
            $('body').append('<div id="w2ui-lock" ' +
                '    onmousewheel="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; if (event.preventDefault) event.preventDefault(); else return false;"'+
                '    style="position: ' + (w2utils.engine == 'IE5' ? 'absolute' : 'fixed') + '; z-Index: 1199; left: 0px; top: 0px; ' +
                '           padding: 0px; margin: 0px; background-color: ' + options.color + '; width: 100%; height: 100%; opacity: 0;"></div>');
            // lock screen
            setTimeout(function () {
                $('#w2ui-lock').css({
                    '-webkit-transition': options.speed + 's opacity',
                    '-moz-transition': options.speed + 's opacity',
                    '-ms-transition': options.speed + 's opacity',
                    '-o-transition': options.speed + 's opacity',
                    'opacity': options.opacity
                });
            }, 1);
            // add events
            if (options.modal == true) {
                $('#w2ui-lock').on('mousedown', function () {
                    $('#w2ui-lock').css({
                        '-webkit-transition': '.1s',
                        '-moz-transition': '.1s',
                        '-ms-transition': '.1s',
                        '-o-transition': '.1s',
                        'opacity': '0.6'
                    });
                    // if (window.getSelection) window.getSelection().removeAllRanges();
                });
                $('#w2ui-lock').on('mouseup', function () {
                    setTimeout(function () {
                        $('#w2ui-lock').css({
                            '-webkit-transition': '.1s',
                            '-moz-transition': '.1s',
                            '-ms-transition': '.1s',
                            '-o-transition': '.1s',
                            'opacity': options.opacity
                        });
                    }, 100);
                    // if (window.getSelection) window.getSelection().removeAllRanges();
                });
            } else {
                $('#w2ui-lock').on('mouseup', function () { w2popup.close(); });
            }
            return true;
        },

        unlockScreen: function (options) {
            if ($('#w2ui-lock').length == 0) return false;
            if (typeof options == 'undefined') options = $('#w2ui-popup').data('options');
            if (typeof options == 'undefined') options = {};
            options = $.extend({}, w2popup.defaults, options);
            $('#w2ui-lock').css({
                '-webkit-transition': options.speed + 's opacity',
                '-moz-transition': options.speed + 's opacity',
                '-ms-transition': options.speed + 's opacity',
                '-o-transition': options.speed + 's opacity',
                'opacity': 0
            });
            setTimeout(function () {
                $('#w2ui-lock').remove();
            }, options.speed * 1000);
            return true;
        },

        resize: function (width, height, callBack) {
            var options = $('#w2ui-popup').data('options');
            // calculate new position
            if (parseInt($(window).width())  - 10 < parseInt(width))  width  = parseInt($(window).width())  - 10;
            if (parseInt($(window).height()) - 10 < parseInt(height)) height = parseInt($(window).height()) - 10;
            var top  = ((parseInt($(window).height()) - parseInt(height)) / 2) * 0.8;
            var left = (parseInt($(window).width()) - parseInt(width)) / 2;
            // resize there
            $('#w2ui-popup').css({
                '-webkit-transition': options.speed + 's width, ' + options.speed + 's height, ' + options.speed + 's left, ' + options.speed + 's top',
                '-moz-transition': options.speed + 's width, ' + options.speed + 's height, ' + options.speed + 's left, ' + options.speed + 's top',
                '-ms-transition': options.speed + 's width, ' + options.speed + 's height, ' + options.speed + 's left, ' + options.speed + 's top',
                '-o-transition': options.speed + 's width, ' + options.speed + 's height, ' + options.speed + 's left, ' + options.speed + 's top',
                'top': top,
                'left': left,
                'width': width,
                'height': height
            });
            setTimeout(function () {
                options.width  = width;
                options.height = height;
                if (typeof callBack == 'function') callBack();
            }, (options.speed * 1000) + 50); // give extra 50 ms
        }
    }

    // merge in event handling
    $.extend(w2popup, w2utils.event);

})();

// ============================================
// --- Common dialogs

var w2alert = function (msg, title, callBack) {
    if (title == null) title = w2utils.lang('Notification');
    if ($('#w2ui-popup').length > 0 && w2popup.status != 'closing') {
        w2popup.message({
            width   : 400,
            height  : 170,
            html    : '<div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 45px; overflow: auto">' +
                      '        <div class="w2ui-centered" style="font-size: 13px;">' + msg + '</div>' +
                      '</div>' +
                      '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center; padding: 5px">' +
                      '        <button onclick="w2popup.message();" class="w2ui-popup-btn btn">' + w2utils.lang('Ok') + '</button>' +
                      '</div>',
            onClose : function () {
                if (typeof callBack == 'function') callBack();
            }
        });
    } else {
        w2popup.open({
            width     : 450,
            height    : 220,
            showMax   : false,
            showClose : false,
            title     : title,
            body      : '<div class="w2ui-centered" style="font-size: 13px;">' + msg + '</div>',
            buttons   : '<button onclick="w2popup.close();" class="w2ui-popup-btn btn">' + w2utils.lang('Ok') + '</button>',
            onClose   : function () {
                if (typeof callBack == 'function') callBack();
            }
        });
    }
};

var w2confirm = function (msg, title, callBack) {
    var options  = {};
    var defaults = {
        msg         : '',
        title       : w2utils.lang('Confirmation'),
        width       : ($('#w2ui-popup').length > 0 ? 400 : 450),
        height      : ($('#w2ui-popup').length > 0 ? 170 : 220),
        yes_text    : 'Yes',
        yes_class   : '',
        yes_style   : '',
        yes_callBack: null,
        no_text     : 'No',
        no_class    : '',
        no_style    : '',
        no_callBack : null,
        callBack    : null
    };
    if (arguments.length == 1 && typeof msg == 'object') {
        $.extend(options, defaults, msg);
    } else {
        if (typeof title == 'function') {
            $.extend(options, defaults, {
                msg     : msg,
                callBack: title
            })            
        } else {
            $.extend(options, defaults, {
                msg     : msg,
                title   : title, 
                callBack: callBack
            })            
        }
    }
    if ($('#w2ui-popup').length > 0 && w2popup.status != 'closing') {
        if (options.width > w2popup.get().width) options.width = w2popup.get().width;
        if (options.height > (w2popup.get().height - 50)) options.height = w2popup.get().height - 50;
          w2popup.message({
            width   : options.width,
            height  : options.height,
            html    : '<div style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 40px; overflow: auto">' +
                      '        <div class="w2ui-centered" style="font-size: 13px;">' + options.msg + '</div>' +
                      '</div>' +
                      '<div style="position: absolute; bottom: 7px; left: 0px; right: 0px; text-align: center; padding: 5px">' +
                      '        <button id="Yes" class="w2ui-popup-btn btn '+ options.yes_class +'" style="'+ options.yes_style +'">' + w2utils.lang(options.yes_text) + '</button>' +
                      '        <button id="No" class="w2ui-popup-btn btn '+ options.no_class +'" style="'+ options.no_style +'">' + w2utils.lang(options.no_text) + '</button>' +
                      '</div>',
            onOpen: function () {
                $('#w2ui-popup .w2ui-popup-message .btn').on('click', function (event) {
                    w2popup.message();
                    if (typeof options.callBack == 'function') options.callBack(event.target.id);
                    if (event.target.id == 'Yes' && typeof options.yes_callBack == 'function') options.yes_callBack();
                    if (event.target.id == 'No'  && typeof options.no_callBack == 'function') options.no_callBack();
                });
            },
            onKeydown: function (event) {
                switch (event.originalEvent.keyCode) {
                    case 13: // enter
                        if (typeof options.callBack == 'function') options.callBack('Yes');
                        if (typeof options.yes_callBack == 'function') options.yes_callBack();
                        w2popup.message();
                        break
                    case 27: // esc
                        if (typeof options.callBack == 'function') options.callBack('No');
                        if (typeof options.no_callBack == 'function') options.no_callBack();
                        w2popup.message();
                        break
                }
            }
        });

    } else {

        if (!w2utils.isInt(options.height)) options.height = options.height + 50;
        w2popup.open({
            width      : options.width,
            height     : options.height,
            title      : options.title,
            modal      : true,
            showClose  : false,
            body       : '<div class="w2ui-centered" style="font-size: 13px;">' + options.msg + '</div>',
            buttons    : '<button id="Yes" class="w2ui-popup-btn btn '+ options.yes_class +'" style="'+ options.yes_style +'">'+ w2utils.lang(options.yes_text) +'</button>'+
                         '<button id="No" class="w2ui-popup-btn btn '+ options.no_class +'" style="'+ options.no_style +'">'+ w2utils.lang(options.no_text) +'</button>',
            onOpen: function (event) {
                event.onComplete = function () {
                    $('#w2ui-popup .w2ui-popup-btn').on('click', function (event) {
                        w2popup.close();
                        if (typeof options.callBack == 'function') options.callBack(event.target.id);
                        if (event.target.id == 'Yes' && typeof options.yes_callBack == 'function') options.yes_callBack();
                        if (event.target.id == 'No'  && typeof options.no_callBack == 'function') options.no_callBack();
                    });
                }
            },
            onKeydown: function (event) {
                switch (event.originalEvent.keyCode) {
                    case 13: // enter
                        if (typeof options.callBack == 'function') options.callBack('Yes');
                        if (typeof options.yes_callBack == 'function') options.yes_callBack();
                        w2popup.close();
                        break
                    case 27: // esc
                        if (typeof options.callBack == 'function') options.callBack('No');
                        if (typeof options.no_callBack == 'function') options.no_callBack();
                        w2popup.close();
                        break
                }
            }
        });
    }

    return {
        yes: function (fun) {
            options.yes_callBack = fun;
            return this;
        },
        no: function (fun) {
            options.no_callBack = fun;
            return this;
        }
    };
};