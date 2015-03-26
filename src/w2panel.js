/************************************************************************
 *   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
 *   - Following objects defined
 *        - w2panel      - popup widget
 *        - $().w2panel  - jQuery wrapper
 *   - Dependencies: jQuery, w2utils
 *
 * == NICE TO HAVE ==
 *   - transition should include title, body and buttons, not just body
 *   - .message() should have same props (body, buttons, title?)
 *   - hide overlay on esc
 *   - make popup width/height in %
 *
 * == 1.5 changes
 *   - new: resizeMessages()
 *   - popup can be moved/resized/closed when locked or has messages
 *   - messages negative widht/height means margin
 *   - added btn_yes and btn_no
 *   - dismissed message will slide up - added parameter unlock(speed)
 *   - refactore -webkit-* -moz-* to a function
 *   - resize nested elements in popup for onMin, onMax
 *   - rename btn -> w2ui-btn and same for colored ones
 *   - added options.body and options.buttons for w2panel.message
 *
 ************************************************************************/

var w2panel = {};
//TODO: check name and assign one if not found
var w2panelManager = {
    panels: []
};
(function() {

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2panel = function(method, options) {
        //append taskbar for minimized windows 
        if ($('#w2taskbar-container').length === 0) {
            $('body').append('<div class="w2taskbar" id="w2taskbar-container"></div>');
        }
        if (typeof method === 'undefined') {
            options = {};
            method = 'open';
        }
        if ($.isPlainObject(method)) {
            options = method;
            method = 'open';
        }
        method = method.toLowerCase();
        if (method === 'load' && typeof options === 'string') {
            options = $.extend({
                url: options
            }, arguments.length > 2 ? arguments[2] : {});
        }
        if (method === 'open' && options.url) method = 'load';
        options = options || {};

        if (options.modal) {
            options.name = ''; //we don't want multiple modals
        }
        for (var i in w2ui.panels) {
            if (w2ui.panels[i].name === options.name) {
                console.log("ERROR: A panel with the same name is opened!");
                return;
            }
            if (w2ui.panels[i].get().modal) // not allow multiple panels in modal mode
                return;
        }
        // load options from markup
        var dlgOptions = {};
        if ($(this).length > 0) {
            var el;
            if (!$(this).parentElement) {
                $('body').append($(this));
            }

            if ($('#w2panel-' + options.name).length === 0) {
                $(this).wrap('<div id="w2panel-' + options.name + '"></div>');
            }
            el = $(this).parent();
            if (options.preserveContent && $('#parentTo' + options.name).length === 0) {
                el.wrap('<div id="parentTo' + options.name + '"></div>');
            }
            options.activePanel = '#w2panel-' + options.name;

            if (el.find('div[rel=title], div[rel=body], div[rel=buttons]').length > 0) {
                if (el.find('div[rel=title]').length > 0) {
                    dlgOptions.title = el.find('div[rel=title]').html();
                }
                if (el.find('div[rel=body]').length > 0) {
                    dlgOptions.body = el.find('div[rel=body]').html();
                    dlgOptions.style = el.find('div[rel=body]')[0].style.cssText;
                }
                if (el.find('div[rel=buttons]').length > 0) {
                    dlgOptions.buttons = el.find('div[rel=buttons]').html();
                }
            } else {
                dlgOptions.title = '&nbsp;';
                dlgOptions.body = el.html();
            }
            if (parseInt(el.css('width')) !== 0) dlgOptions.width = parseInt(el.css('width'));
            if (parseInt(el.css('height')) !== 0) dlgOptions.height = parseInt(el.css('height'));
        }

        //check if allready opened

        // show popup
        if (options.modal) {
            //close other panels - multiple in modal mode is not supported
            for (var x in w2ui.panels) {
                w2ui.panels[x].close();
            }
            return w2panel[method]($.extend({}, dlgOptions, options));
        } else {
            var panel = $.extend({}, {}, w2panel);
            return panel[method]($.extend({}, dlgOptions, options));
        }
    };

    // ====================================================
    // -- Implementation of core functionality

    w2panel = {
        defaults: {
            title: '',
            body: '',
            buttons: '',
            name: '',
            style: '',
            color: '#000',
            opacity: 0.4,
            speed: 0.3,
            modal: false,
            maximized: false,
            minimized: false,
            keyboard: true, // will close popup on esc if not modal
            width: 500,
            height: 300,
            showClose: true,
            showMax: false,
            showMin: false,
            transition: null
        },
        status: 'closed', // string that describes current status
        handlers: [],
        onOpen: null,
        onClose: null,
        onMax: null,
        onRestore: null,
        onMin: null,
        onToggle: null,
        onKeydown: null,

        init: function(options) {
            $.extend(this.defaults, options);
            return this;
        },

        open: function(options) {
            var obj = this;
            this.name = options.name; //handle here no name provided
            if (w2panel.status == 'closing') {
                setTimeout(function() {
                    obj.open.call(obj, options);
                }, 100);
                return;
            }
            // get old options and merge them
            var old_options = $('#' + this.name + 'w2ui-popup').data('options');
            var options = $.extend({}, this.defaults, old_options, {
                title: '',
                body: '',
                buttons: ''
            }, options, {
                maximized: false,
                minimized: false
            });
            // need timer because popup might not be open
            setTimeout(function() {
                $('#' + obj.name + 'w2ui-popup').data('options', options);
            }, 100);
            // if new - reset event handlers
            if ($('#' + obj.name + 'w2ui-popup').length === 0) {
                w2panel.handlers = [];
                w2panel.onMax = null;
                w2panel.onMin = null;
                w2panel.onToggle = null;
                w2panel.onOpen = null;
                w2panel.onClose = null;
                w2panel.onKeydown = null;
            }
            if (options.onOpen) w2panel.onOpen = options.onOpen;
            if (options.onClose) w2panel.onClose = options.onClose;
            if (options.onMax) w2panel.onMax = options.onMax;
            if (options.onMin) w2panel.onMin = options.onMin;
            if (options.onToggle) w2panel.onToggle = options.onToggle;
            if (options.onKeydown) w2panel.onKeydown = options.onKeydown;

            var width, height;
            if (window.innerHeight === undefined) {
                width = document.documentElement.offsetWidth;
                height = document.documentElement.offsetHeight;
                if (w2utils.engine === 'IE7') {
                    width += 21;
                    height += 4;
                }
            } else {
                width = window.innerWidth;
                height = window.innerHeight;
            }
            if (parseInt(width) - 10 < parseInt(options.width)) options.width = parseInt(width) - 10;
            if (parseInt(height) - 10 < parseInt(options.height)) options.height = parseInt(height) - 10;
            var top = parseInt(((parseInt(height) - parseInt(options.height)) / 2) * 0.6);
            var left = parseInt((parseInt(width) - parseInt(options.width)) / 2);
            // check if message is already displayed
            if ($('#' + obj.name + 'w2ui-popup').length === 0) {
                // trigger event
                var eventData = this.trigger({
                    phase: 'before',
                    type: 'open',
                    target: 'panel',
                    options: options,
                    present: false
                });
                if (eventData.isCancelled === true) return;
                w2panel.status = 'opening';
                // output message
                if (options.modal)
                    w2panel.lockScreen(options);
                var btn = '';
                if (options.showClose) {
                    btn += '<div class="w2ui-msg-button w2ui-msg-close" onmousedown="event.stopPropagation()" onclick="w2panel.close()">Close</div>';
                }
                if (options.showMax) {
                    btn += '<div class="w2ui-msg-button w2ui-msg-max" onmousedown="event.stopPropagation()" onclick="w2panel.toggle()">Max</div>';
                }
                if (options.showMin) {
                    btn += '<div class="w2ui-msg-button w2ui-msg-min" onmousedown="event.stopPropagation()" onclick="w2panel.minimize()">Min</div>';
                }
                var msg = '<div id="' + obj.name + 'w2ui-popup" class="w2ui-popup" style="opacity: 0; left: ' + left + 'px; top: ' + top + 'px;' +
                    '     width: ' + parseInt(options.width) + 'px; height: ' + parseInt(options.height) + 'px; ' +
                    w2utils.cssPrefix('transform', 'scale(0.8)', true) + '"' +
                    '>' +
                    '   <div class="w2ui-msg-title" style="' + (options.title === '' ? 'display: none' : '') + '">' + btn + options.title + '</div>' +
                    '   <div class="w2ui-box1" style="' + (options.title === '' ? 'top: 0px !important;' : '') +
                    (options.buttons === '' ? 'bottom: 0px !important;' : '') + '">' +
                    '       <div class="w2ui-msg-body' + (options.title === '' ? ' w2ui-msg-no-title' : '') +
                    (options.buttons === '' ? ' w2ui-msg-no-buttons' : '') + '" style="' + options.style + '">' /*+ options.body*/ + '</div>' +
                    '   </div>' +
                    '   <div class="w2ui-box2" style="' + (options.title === '' ? 'top: 0px !important;' : '') +
                    (options.buttons === '' ? 'bottom: 0px !important;' : '') + '">' +
                    '       <div class="w2ui-msg-body' + (options.title === '' ? ' w2ui-msg-no-title' : '') +
                    (options.buttons === '' ? ' w2ui-msg-no-buttons' : '') + '" style="' + options.style + '"></div>' +
                    '       </div>' +
                    '   <div class="w2ui-msg-buttons" style="' + (options.buttons === '' ? 'display: none' : '') + '">' + options.buttons + '</div>' +
                    '</div>';
                $('body').append(msg);
                //if (options.modal) {
                //   $(options.body).appendTo('.w2ui-msg-body');
                //} else {
                $(options.activePanel).appendTo('.w2ui-msg-body');
                //}

                // allow element to render
                setTimeout(function() {
                    $('#' + obj.name + 'w2ui-popup .w2ui-box2').hide();
                    $('#' + obj.name + 'w2ui-popup')
                        .css('opacity', '1')
                        .css(w2utils.cssPrefix({
                            'transition': options.speed + 's opacity, ' + options.speed + 's -webkit-transform',
                            'transform': 'scale(1)'
                        }));
                }, 1);
                // clean transform
                setTimeout(function() {
                    $('#' + obj.name + 'w2ui-popup').css(w2utils.cssPrefix('transform', ''));
                    // event after
                    w2panel.status = 'open';
                    setTimeout(function() {
                        obj.trigger($.extend(eventData, {
                            phase: 'after'
                        }));
                    }, 100);
                }, options.speed * 1000);
            } else {
                // trigger event
                var eventData = this.trigger({
                    phase: 'before',
                    type: 'open',
                    target: 'popup',
                    options: options,
                    present: true
                });
                if (eventData.isCancelled === true) return;
                // check if size changed
                w2panel.status = 'opening';
                if (typeof old_options != 'undefined') {
                    if (!old_options.maximized && (old_options['width'] !== options['width'] || old_options['height'] !== options['height'])) {
                        w2panel.resize({
                            width: options.width,
                            height: options.height
                        });
                    }
                    options.prevSize = options.width + 'px:' + options.height + 'px';
                    options.maximized = old_options.maximized;
                }
                // show new items
                var body = $('#' + obj.name + 'w2ui-popup .w2ui-box2 > .w2ui-msg-body').html(options.body);
                if (body.length > 0) body[0].style.cssText = options.style;
                if (options.buttons !== '') {
                    $('#' + obj.name + 'w2ui-popup .w2ui-msg-buttons').show().html(options.buttons);
                    $('#' + obj.name + 'w2ui-popup .w2ui-msg-body').removeClass('w2ui-msg-no-buttons');
                    $('#' + obj.name + 'w2ui-popup .w2ui-box1, #' + obj.name + 'w2ui-popup .w2ui-box2').css('bottom', '');
                } else {
                    $('#' + obj.name + 'w2ui-popup .w2ui-msg-buttons').hide().html('');
                    $('#' + obj.name + 'w2ui-popup .w2ui-msg-body').addClass('w2ui-msg-no-buttons');
                    $('#' + obj.name + 'w2ui-popup .w2ui-box1, #' + obj.name + 'w2ui-popup .w2ui-box2').css('bottom', '0px');
                }
                if (options.title !== '') {
                    $('#' + obj.name + 'w2ui-popup .w2ui-msg-title').show().html(
                        (options.showClose ? '<div class="w2ui-msg-button w2ui-msg-close" onmousedown="event.stopPropagation()" onclick="w2panel.close()">Close</div>' : '') +
                        (options.showMax ? '<div class="w2ui-msg-button w2ui-msg-max" onmousedown="event.stopPropagation()" onclick="w2panel.toggle()">Max</div>' : '') +
                        options.title);
                    $('#' + obj.name + 'w2ui-popup .w2ui-msg-body').removeClass('w2ui-msg-no-title');
                    $('#' + obj.name + 'w2ui-popup .w2ui-box1, #' + obj.name + 'w2ui-popup .w2ui-box2').css('top', '');
                } else {
                    $('#' + obj.name + 'w2ui-popup .w2ui-msg-title').hide().html('');
                    $('#' + obj.name + 'w2ui-popup .w2ui-msg-body').addClass('w2ui-msg-no-title');
                    $('#' + obj.name + 'w2ui-popup .w2ui-box1, #' + obj.name + 'w2ui-popup .w2ui-box2').css('top', '0px');
                }
                // transition
                var div_old = $('#' + obj.name + 'w2ui-popup .w2ui-box1')[0];
                var div_new = $('#' + obj.name + 'w2ui-popup .w2ui-box2')[0];
                w2utils.transition(div_old, div_new, options.transition);
                div_new.className = 'w2ui-box1';
                div_old.className = 'w2ui-box2';
                $(div_new).addClass('w2ui-current-box');
                // remove max state
                $('#' + obj.name + 'w2ui-popup').data('prev-size', null);
                // call event onChange
                setTimeout(function() {
                    w2panel.status = 'open';
                    obj.trigger($.extend(eventData, {
                        phase: 'after'
                    }));
                }, 100);

            }
            // save new options
            options._last_w2ui_name = w2utils.keyboard.active();
            w2utils.keyboard.clear();
            // keyboard events
            if (options.keyboard) $(document).on('keydown', this.keydown);

            // initialize move
            var tmp = {
                resizing: false,
                mvMove: mvMove,
                mvStop: mvStop
            };
            $('#' + obj.name + 'w2ui-popup').on('mousedown', function(event) {
                obj.focus();
            });
            $('#' + obj.name + 'w2ui-popup .w2ui-msg-title').on('mousedown', function(event) {
                obj.focus();
                if (!w2panel.get().maximized) mvStart(event);
            });

            // handlers
            function mvStart(evnt) {
                if (!evnt) evnt = window.event;
                if (!window.addEventListener) {
                    window.document.attachEvent('onselectstart', function() {
                        return false;
                    });
                }
                w2panel.status = 'moving';
                tmp.resizing = true;
                tmp.isLocked = $('#' + obj.name + 'w2ui-popup > .w2ui-lock').length == 1 ? true : false;
                tmp.x = evnt.screenX;
                tmp.y = evnt.screenY;
                tmp.pos_x = $('#' + obj.name + 'w2ui-popup').position().left;
                tmp.pos_y = $('#' + obj.name + 'w2ui-popup').position().top;
                if (!tmp.isLocked) w2panel.lock({
                    opacity: 0
                });
                $(document).on('mousemove', tmp.mvMove);
                $(document).on('mouseup', tmp.mvStop);
                if (evnt.stopPropagation) evnt.stopPropagation();
                else evnt.cancelBubble = true;
                if (evnt.preventDefault) evnt.preventDefault();
                else return false;
            }

            function mvMove(evnt) {
                if (tmp.resizing !== true) return;
                if (!evnt) evnt = window.event;
                tmp.div_x = evnt.screenX - tmp.x;
                tmp.div_y = evnt.screenY - tmp.y;
                $('#' + obj.name + 'w2ui-popup').css(w2utils.cssPrefix({
                    'transition': 'none',
                    'transform': 'translate3d(' + tmp.div_x + 'px, ' + tmp.div_y + 'px, 0px)'
                }));
            }

            function mvStop(evnt) {
                if (tmp.resizing !== true) return;
                if (!evnt) evnt = window.event;
                w2panel.status = 'open';
                tmp.div_x = (evnt.screenX - tmp.x);
                tmp.div_y = (evnt.screenY - tmp.y);
                $('#' + obj.name + 'w2ui-popup').css({
                    'left': (tmp.pos_x + tmp.div_x) + 'px',
                    'top': (tmp.pos_y + tmp.div_y) + 'px'
                }).css(w2utils.cssPrefix({
                    'transition': 'none',
                    'transform': 'translate3d(0px, 0px, 0px)'
                }));
                tmp.resizing = false;
                $(document).off('mousemove', tmp.mvMove);
                $(document).off('mouseup', tmp.mvStop);
                if (!tmp.isLocked) w2panel.unlock();
            }
            if (!w2ui.panels) w2ui.panels = [];
            w2ui.panels.push(this);
            this.isActive = true;
            this.focus();

            return this;
        },

        keydown: function(event) {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            var options = $('#' + obj.name + 'w2ui-popup').data('options');
            if (options && !options.keyboard) return;
            // trigger event
            var eventData = w2panel.trigger({
                phase: 'before',
                type: 'keydown',
                target: 'popup',
                options: options,
                originalEvent: event
            });
            if (eventData.isCancelled === true) return;
            // default behavior
            switch (event.keyCode) {
                case 27:
                    event.preventDefault();
                    if ($('#' + obj.name + 'w2ui-popup .w2ui-popup-message').length > 0) w2panel.message();
                    else w2panel.close();
                    break;
            }
            // event after
            w2panel.trigger($.extend(eventData, {
                phase: 'after'
            }));
        },
        focus: function() {
            var z = $('#' + this.name + 'w2ui-popup').css('z-index');
            for (var i in w2ui.panels) {
                if (w2ui.panels[i].name === this.name) {
                    w2ui.panels[i].isActive = true;
                    $('#' + w2ui.panels[i].name + 'w2ui-popup').removeClass('inactive');
                    $('#' + w2ui.panels[i].name + 'w2ui-popup').css('z-index', z + 1);
                } else {
                    w2ui.panels[i].isActive = false;
                    $('#' + w2ui.panels[i].name + 'w2ui-popup').addClass('inactive');
                    $('#' + w2ui.panels[i].name + 'w2ui-popup').css('z-index', z - 1);
                }
            }
        },
        close: function(opts) {

            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            var options = $.extend({}, $('#' + obj.name + 'w2ui-popup').data('options'), opts);
            if ($('#' + obj.name + 'w2ui-popup').length === 0) return;
            // trigger event
            var eventData = obj.trigger({
                phase: 'before',
                type: 'close',
                target: 'popup',
                options: options
            });
            if (eventData.isCancelled === true) return;
            // default behavior
            w2panel.status = 'closing';
            $('#' + obj.name + 'w2ui-popup')
                .css('opacity', '0')
                .css(w2utils.cssPrefix({
                    'transition': options.speed + 's opacity, ' + options.speed + 's -webkit-transform',
                    'transform': 'scale(0.9)'
                }));
            w2panel.unlockScreen(options);
            setTimeout(function() {
                //revert to initial state
                if (options.preserveContent) {
                    $(options.activePanel).appendTo('#parentTo' + obj.name);
                    $(options.activePanel).unwrap();
                    $(options.activePanel).contents().unwrap();
                }
                $('#' + obj.name + 'w2ui-popup').remove();
                w2ui.panels.splice(w2ui.panels.indexOf(obj), 1);
                w2panel.status = 'closed';
                // event after
                obj.trigger($.extend(eventData, {
                    phase: 'after'
                }));
            }, options.speed * 1000);
            // restore active
            w2utils.keyboard.active(options._last_w2ui_name, {});
            // remove keyboard events
            if (options.keyboard) $(document).off('keydown', obj.keydown);
        },

        toggle: function() {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            obj.focus();
            var options = $('#' + obj.name + 'w2ui-popup').data('options') || {
                speed: 0.2
            };
            // trigger event
            var eventData = this.trigger({
                phase: 'before',
                type: 'toggle',
                target: 'popup',
                options: options
            });
            if (eventData.isCancelled === true) return;
            // defatul action
            if (options.maximized === true) w2panel.restoreMax();
            else w2panel.max();
            // event after
            setTimeout(function() {
                obj.trigger($.extend(eventData, {
                    phase: 'after'
                }));
            }, (options.speed * 1000) + 50);
        },

        max: function() {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            obj.focus();
            var options = $('#' + obj.name + 'w2ui-popup').data('options');
            if (options.maximized === true) return;


            // trigger event
            var eventData = this.trigger({
                phase: 'before',
                type: 'max',
                target: 'popup',
                options: options
            });
            if (eventData.isCancelled === true) return;
            // default behavior
            w2panel.status = 'resizing';
            if (options.minimized) { //remove it from taskbar
                $('#' + obj.name + 'w2ui-popup').appendTo('body');
                options.minimized = false;
            } else {
                options.prevPosition = $('#' + obj.name + 'w2ui-popup').css('top') + ':' + $('#' + obj.name + 'w2ui-popup').css('left');
                options.prevSize = $('#' + obj.name + 'w2ui-popup').css('width') + ':' + $('#' + obj.name + 'w2ui-popup').css('height');
            }
            // do resize
            w2panel.resize({
                width: 10000,
                height: 10000
            }, function() {
                w2panel.status = 'open';
                options.maximized = true;
                obj.trigger($.extend(eventData, {
                    phase: 'after'
                }));
                // resize gird, form, layout inside popup
                $('#' + obj.name + 'w2ui-popup .w2ui-grid, #' + obj.name + 'w2ui-popup .w2ui-form, #' + obj.name + 'w2ui-popup .w2ui-layout').each(function() {
                    var name = $(this).attr('name');
                    if (w2ui[name] && w2ui[name].resize) w2ui[name].resize();
                });
            });
        },

        minimize: function() {
            console.log(this.get().name);
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            //obj.isActive = false;
            var options = $('#' + obj.name + 'w2ui-popup').data('options');
            // trigger event
            var eventData = this.trigger({
                phase: 'before',
                type: 'min',
                target: 'popup',
                options: options
            });
            if (eventData.isCancelled === true) return;
            if (options.minimized === true) {
                w2panel.restoreMin();
            } else {
                w2panel.status = 'minimizing';
                if (options.maximized) {
                    options.maximized = false;
                } else {
                    options.prevSize = $('#' + obj.name + 'w2ui-popup').css('width') + ':' + $('#' + obj.name + 'w2ui-popup').css('height');
                    options.prevPosition = $('#' + obj.name + 'w2ui-popup').css('top') + ':' + $('#' + obj.name + 'w2ui-popup').css('left');
                }
                $('#' + obj.name + 'w2ui-popup').appendTo($('#w2taskbar-container'));
                w2panel.resize({
                    width: 150,
                    height: 30
                }, function() {
                    w2panel.status = 'open';
                    options.minimized = true;
                    obj.trigger($.extend(eventData, {
                        phase: 'after'
                    }));

                });
            }

        },

        restoreMax: function() {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            obj.focus();
            var options = $('#' + obj.name + 'w2ui-popup').data('options');
            if (options.maximized !== true) return;
            //TODO Check if maximized from mimized and backwards - we have to restore to original size
            var size = options.prevSize.split(':');
            var pos = options.prevPosition.split(':');

            // trigger event
            var eventData = this.trigger({
                phase: 'before',
                type: 'restore',
                target: 'popup',
                options: options
            });
            if (eventData.isCancelled === true) return;
            // default behavior
            w2panel.status = 'resizing';
            // do resize
            w2panel.resize({
                width: parseInt(size[0]),
                height: parseInt(size[1]),
                top: parseInt(pos[0]),
                left: parseInt(pos[1])
            }, function() {
                w2panel.status = 'open';
                options.maximized = false;
                options.prevSize = null;
                obj.trigger($.extend(eventData, {
                    phase: 'after'
                }));

                // resize gird, form, layout inside popup
                $('#' + obj.name + 'w2ui-popup .w2ui-grid, #' + obj.name + 'w2ui-popup .w2ui-form, #' + obj.name + 'w2ui-popup .w2ui-layout').each(function() {
                    var name = $(this).attr('name');
                    if (w2ui[name] && w2ui[name].resize) w2ui[name].resize();
                });
            });
        },
        restoreMin: function() {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            obj.focus();
            var options = $('#' + obj.name + 'w2ui-popup').data('options');
            if (options.minimized !== true) return;
            //TODO Check if maximized from mimized and backwards - we have to restore to original size
            var size = options.prevSize.split(':');
            var pos = options.prevPosition.split(':');
            // trigger event
            var eventData = this.trigger({
                phase: 'before',
                type: 'restore',
                target: 'popup',
                options: options
            });
            if (eventData.isCancelled === true) return;
            // default behavior
            w2panel.status = 'resizing';
            // do resize
            if (options.minimized)
                $('#' + obj.name + 'w2ui-popup').appendTo('body');
            w2panel.resize({
                width: parseInt(size[0]),
                height: parseInt(size[1]),
                top: parseInt(pos[0]),
                left: parseInt(pos[1])
            }, function() {
                w2panel.status = 'open';
                options.minimized = false;
                options.prevSize = null;
                obj.trigger($.extend(eventData, {
                    phase: 'after'
                }));

                // resize gird, form, layout inside popup
                $('#' + obj.name + 'w2ui-popup .w2ui-grid, #' + obj.name + 'w2ui-popup .w2ui-form, #' + obj.name + 'w2ui-popup .w2ui-layout').each(function() {
                    var name = $(this).attr('name');
                    if (w2ui[name] && w2ui[name].resize) w2ui[name].resize();
                });
            });
        },
        get: function() {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            return $('#' + obj.name + 'w2ui-popup').data('options');
        },

        set: function(options) {
            w2panel.open(options);
        },

        clear: function() {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            $('#' + obj.name + 'w2ui-popup .w2ui-msg-title').html('');
            $('#' + obj.name + 'w2ui-popup .w2ui-msg-body').html('');
            $('#' + obj.name + 'w2ui-popup .w2ui-msg-buttons').html('');
        },

        reset: function() {
            w2panel.open(w2panel.defaults);
        },

        load: function(options) {
            w2panel.status = 'loading';
            if (String(options.url) == 'undefined') {
                console.log('ERROR: The url parameter is empty.');
                return;
            }
            var tmp = String(options.url).split('#');
            var url = tmp[0];
            var selector = tmp[1];
            if (String(options) == 'undefined') options = {};
            // load url
            var html = $('#' + options.name + 'w2ui-popup').data(url);
            if (typeof html !== 'undefined' && html !== null) {
                popup(html, selector);
            } else {
                $.get(url, function(data, status, obj) { // should always be $.get as it is template
                    popup(obj.responseText, selector);
                    $('#' + options.name + 'w2ui-popup').data(url, obj.responseText); // remember for possible future purposes
                });
            }

            function popup(html, selector) {
                delete options.url;
                $('body').append('<div id="w2ui-tmp" style="display: none">' + html + '</div>');
                if (typeof selector != 'undefined' && $('#w2ui-tmp #' + selector).length > 0) {
                    $('#w2ui-tmp #' + selector).w2panel(options);
                } else {
                    $('#w2ui-tmp > div').w2panel(options);
                }
                // link styles
                if ($('#w2ui-tmp > style').length > 0) {
                    var style = $('<div>').append($('#w2ui-tmp > style').clone()).html();
                    if ($('#' + options.name + 'w2ui-popup #div-style').length == 0) {
                        $('#' + options.name + 'w2ui-popup').append('<div id="div-style" style="position: absolute; left: -100; width: 1px"></div>');
                    }
                    $('#' + options.name + 'w2ui-popup #div-style').html(style);
                }
                $('#w2ui-tmp').remove();
            }
        },

        message: function(options) {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            $().w2tag(); // hide all tags
            if (!options) options = {
                width: 200,
                height: 100
            };
            var pWidth = parseInt($('#' + obj.name + 'w2ui-popup').width());
            var pHeight = parseInt($('#' + obj.name + 'w2ui-popup').height());
            options.originalWidth = options.width;
            options.originalHeight = options.height;
            if (parseInt(options.width) < 10) options.width = 10;
            if (parseInt(options.height) < 10) options.height = 10;
            if (typeof options.hideOnClick == 'undefined') options.hideOnClick = false;
            var poptions = $('#' + obj.name + 'w2ui-popup').data('options') || {};
            var titleHeight = parseInt($('#' + obj.name + 'w2ui-popup > .w2ui-msg-title').css('height'));
            if (typeof options.width == 'undefined' || options.width > poptions.width - 10) {
                options.width = poptions.width - 10;
            }
            if (typeof options.height == 'undefined' || options.height > poptions.height - titleHeight - 5) {
                options.height = poptions.height - titleHeight - 5; // need margin from bottom only
            }
            // negative value means margin
            if (options.originalHeight < 0) options.height = pHeight + options.originalHeight - titleHeight;
            if (options.originalWidth < 0) options.width = pWidth + options.originalWidth * 2; // x 2 because there is left and right margin

            var head = $('#' + obj.name + 'w2ui-popup .w2ui-msg-title');
            var msgCount = $('#' + obj.name + 'w2ui-popup .w2ui-popup-message').length;
            // remove message
            if ($.trim(options.html) == '' && $.trim(options.body) == '' && $.trim(options.buttons) == '') {
                var $msg = $('#' + obj.name + 'w2ui-popup #w2ui-message' + (msgCount - 1));
                var options = $msg.data('options') || {};
                $msg.css(w2utils.cssPrefix({
                    'transition': '0.15s',
                    'transform': 'translateY(-' + options.height + 'px)'
                }));
                if (msgCount == 1) {
                    w2panel.unlock(150);
                } else {
                    $('#' + obj.name + 'w2ui-popup #w2ui-message' + (msgCount - 2)).css('z-index', 1500);
                }
                setTimeout(function() {
                    $msg.remove();
                    if (typeof options.onClose == 'function') options.onClose();
                }, 150);
            } else {
                if ($.trim(options.body) != '' || $.trim(options.buttons) != '') {
                    options.html = '<div class="w2ui-popup-message-body">' + options.body + '</div>' +
                        '<div class="w2ui-popup-message-buttons">' + options.buttons + '</div>';
                }
                // hide previous messages
                $('#' + obj.name + 'w2ui-popup .w2ui-popup-message').css('z-index', 1390);
                head.css('z-index', 1501);
                // add message
                $('#' + obj.name + 'w2ui-popup .w2ui-box1')
                    .before('<div id="w2ui-message' + msgCount + '" class="w2ui-popup-message" style="display: none; z-index: 1500; ' +
                        (head.length == 0 ? 'top: 0px;' : 'top: ' + w2utils.getSize(head, 'height') + 'px;') +
                        (typeof options.width != 'undefined' ? 'width: ' + options.width + 'px; left: ' + ((pWidth - options.width) / 2) + 'px;' : 'left: 10px; right: 10px;') +
                        (typeof options.height != 'undefined' ? 'height: ' + options.height + 'px;' : 'bottom: 6px;') +
                        w2utils.cssPrefix('transition', '.3s', true) + '"' +
                        (options.hideOnClick === true ? 'onclick="w2panel.message();"' : '') + '>' +
                        '</div>');
                $('#' + obj.name + 'w2ui-popup #w2ui-message' + msgCount).data('options', options);
                var display = $('#' + obj.name + 'w2ui-popup #w2ui-message' + msgCount).css('display');
                $('#' + obj.name + 'w2ui-popup #w2ui-message' + msgCount).css(w2utils.cssPrefix({
                    'transform': (display == 'none' ? 'translateY(-' + options.height + 'px)' : 'translateY(0px)')
                }));
                if (display == 'none') {
                    $('#' + obj.name + 'w2ui-popup #w2ui-message' + msgCount).show().html(options.html);
                    // timer needs to animation
                    setTimeout(function() {
                        $('#' + obj.name + 'w2ui-popup #w2ui-message' + msgCount).css(w2utils.cssPrefix({
                            'transform': (display == 'none' ? 'translateY(0px)' : 'translateY(-' + options.height + 'px)')
                        }));
                    }, 1);
                    // timer for lock
                    if (msgCount == 0) w2panel.lock();
                    setTimeout(function() {
                        // has to be on top of lock
                        $('#' + obj.name + 'w2ui-popup #w2ui-message' + msgCount).css(w2utils.cssPrefix({
                            'transition': '0s'
                        }));
                        if (typeof options.onOpen == 'function') options.onOpen();
                    }, 350);
                }
            }
        },

        lock: function(msg, showSpinner) {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift($('#' + obj.name + 'w2ui-popup'));
            w2utils.lock.apply(window, args);
        },

        unlock: function(speed) {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            w2utils.unlock($('#' + obj.name + 'w2ui-popup'), speed);
        },

        // --- INTERNAL FUNCTIONS

        lockScreen: function(options) {
            if ($('#w2ui-lock').length > 0) return false;
            if (typeof options == 'undefined') options = $('#' + options.name + 'w2ui-popup').data('options');
            if (typeof options == 'undefined') options = {};
            options = $.extend({}, w2panel.defaults, options);
            // show element
            $('body').append('<div id="w2ui-lock" ' +
                '    onmousewheel="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true; if (event.preventDefault) event.preventDefault(); else return false;"' +
                '    style="position: ' + (w2utils.engine == 'IE5' ? 'absolute' : 'fixed') + '; z-Index: 1199; left: 0px; top: 0px; ' +
                '           padding: 0px; margin: 0px; background-color: ' + options.color + '; width: 100%; height: 100%; opacity: 0;"></div>');
            // lock screen
            setTimeout(function() {
                $('#w2ui-lock')
                    .css('opacity', options.opacity)
                    .css(w2utils.cssPrefix('transition', options.speed + 's opacity'));
            }, 1);
            // add events
            if (options.modal === true) {
                $('#w2ui-lock').on('mousedown', function() {
                    $('#w2ui-lock')
                        .css('opacity', '0.6')
                        .css(w2utils.cssPrefix('transition', '.1s'));
                });
                $('#w2ui-lock').on('mouseup', function() {
                    setTimeout(function() {
                        $('#w2ui-lock')
                            .css('opacity', options.opacity)
                            .css(w2utils.cssPrefix('transition', '.1s'));
                    }, 100);
                });
            } else {
                $('#w2ui-lock').on('mousedown', function() {
                    w2panel.close();
                });
            }
            return true;
        },

        unlockScreen: function(options) {
            if ($('#w2ui-lock').length == 0) return false;
            if (typeof options == 'undefined') options = $('#' + options.name + 'w2ui-popup').data('options');
            if (typeof options == 'undefined') options = {};
            options = $.extend({}, w2panel.defaults, options);
            $('#w2ui-lock')
                .css('opacity', '0')
                .css(w2utils.cssPrefix('transition', options.speed + 's opacity'));
            setTimeout(function() {
                $('#w2ui-lock').remove();
            }, options.speed * 1000);
            return true;
        },

        resizeMessages: function() {
            var obj = this;
            var options = $('#' + obj.name + 'w2ui-popup').data('options');
            // see if there are messages and resize them
            $('#' + obj.name + 'w2ui-popup .w2ui-popup-message').each(function() {
                var moptions = $(this).data('options');
                var $popup = $('#' + obj.name + 'w2ui-popup');
                if (parseInt(moptions.width) < 10) moptions.width = 10;
                if (parseInt(moptions.height) < 10) moptions.height = 10;
                var titleHeight = parseInt($popup.find('> .w2ui-msg-title').css('height'));
                var pWidth = parseInt($popup.width());
                var pHeight = parseInt($popup.height());
                // recalc width
                moptions.width = moptions.originalWidth;
                if (moptions.width > pWidth - 10) {
                    moptions.width = pWidth - 10;
                }
                // recalc height
                moptions.height = moptions.originalHeight;
                if (moptions.height > pHeight - titleHeight - 5) {
                    moptions.height = pHeight - titleHeight - 5;
                }
                if (moptions.originalHeight < 0) moptions.height = pHeight + moptions.originalHeight - titleHeight;
                if (moptions.originalWidth < 0) moptions.width = pWidth + moptions.originalWidth * 2; // x 2 because there is left and right margin
                $(this).css({
                    left: ((pWidth - moptions.width) / 2) + 'px',
                    width: moptions.width + 'px',
                    height: moptions.height + 'px'
                });
            });
        },

        resize: function(matrix, callBack) {
            var panels = $.grep(w2ui.panels, function(panel) {
                return panel.isActive;
            });
            var obj = panels[0];
            obj.focus();
            var options = $('#' + obj.name + 'w2ui-popup').data('options');
            width = parseInt(matrix.width);
            height = parseInt(matrix.height);
            // calculate new position
            var top, left;
            if (matrix.top && matrix.left) {
                top = parseInt(matrix.top);
                left = parseInt(matrix.left);
            } else {
                if ($(window).width() - 10 < width) width = $(window).width() - 10;
                if ($(window).height() - 10 < height) height = $(window).height() - 10;
                top = ($(window).height() - height) / 2 * 0.8;
                left = ($(window).width() - width) / 2;
            }
            // resize there
            $('#' + obj.name + 'w2ui-popup')
                .css(w2utils.cssPrefix({
                    'transition': options.speed + 's width, ' + options.speed + 's height, ' + options.speed + 's left, ' + options.speed + 's top'
                }))
                .css({
                    'top': top,
                    'left': left,
                    'width': width,
                    'height': height
                });
            var tmp_int = setInterval(function() {
                obj.resizeMessages();
            }, 10); // then messages resize nicely
            setTimeout(function() {
                clearInterval(tmp_int);
                options.width = width;
                options.height = height;
                obj.resizeMessages();
                if (typeof callBack == 'function') callBack();
            }, (options.speed * 1000) + 50); // give extra 50 ms
        }
    };

    // merge in event handling
    $.extend(w2panel, w2utils.event);

})();
