/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2toolbar        - toolbar widget
*        - $().w2toolbar    - jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2field
*
* == NICE TO HAVE ==
*   - vertical toolbar
*
* == 1.5 changes ==
*   - menu drop down can have groups now
*
************************************************************************/

(function ($) {
    var w2toolbar = function (options) {
        this.box       = null;      // DOM Element that holds the element
        this.name      = null;      // unique name for w2ui
        this.routeData = {};        // data for dynamic routes
        this.items     = [];
        this.right     = '';        // HTML text on the right of toolbar
        this.tooltip   = 'top|left';// can be top, bottom, left, right

        $.extend(true, this, w2obj.toolbar, options);
    };

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2toolbar = function(method) {
        if ($.isPlainObject(method)) {
            // check name parameter
            if (!w2utils.checkName(method, 'w2toolbar')) return;
            // extend items
            var items = method.items || [];
            var object = new w2toolbar(method);
            $.extend(object, { items: [], handlers: [] });
            for (var i = 0; i < items.length; i++) {
                object.items[i] = $.extend({}, w2toolbar.prototype.item, items[i]);
                // menus
                if (object.items[i].type == 'menu-check') {
                    var item = object.items[i];
                    if (!Array.isArray(item.selected)) item.selected = [];
                    if (Array.isArray(item.items)) {
                        for (var j = 0; j < item.items.length; j++) {
                            var it = item.items[j];
                            if (it.checked && item.selected.indexOf(it.id) == -1) item.selected.push(it.id);
                            if (!it.checked && item.selected.indexOf(it.id) != -1) it.checked = true;
                            if (it.checked == null) it.checked = false;
                        }
                    }
                }
                else if (object.items[i].type == 'menu-radio') {
                    var item = object.items[i];
                    if (Array.isArray(item.items)) {
                        for (var j = 0; j < item.items.length; j++) {
                            var it = item.items[j];
                            if (it.checked && item.selected == null) item.selected = it.id; else it.checked = false;
                            if (!it.checked && item.selected == it.id) it.checked = true;
                            if (it.checked == null) it.checked = false;
                        }
                    }
                }
            }
            if ($(this).length !== 0) {
                object.render($(this)[0]);
            }
            // register new object
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
    };

    // ====================================================
    // -- Implementation of core functionality

    w2toolbar.prototype = {
        onClick   : null,
        onRender  : null,
        onRefresh : null,
        onResize  : null,
        onDestroy : null,

        item: {
            id          : null,        // command to be sent to all event handlers
            type        : 'button',    // button, check, radio, drop, menu, menu-radio, menu-check, break, html, spacer
            text        : null,
            html        : '',
            tooltip     : null,        // w2toolbar.tooltip should be
            count       : null,
            hidden      : false,
            disabled    : false,
            checked     : false,       // used for radio buttons
            img         : null,
            icon        : null,
            route       : null,        // if not null, it is route to go
            arrow       : true,        // arrow down for drop/menu types
            style       : null,        // extre css style for caption
            color       : null,        // color value - used in color pickers
            transparent : null,        // transparent t/f - used in color picker
            advanced    : null,        // advanced picker t/f - user in color picker
            group       : null,        // used for radio buttons
            items       : null,        // for type menu* it is an array of items in the menu
            selected    : null,        // used for menu-check, menu-radio
            overlay     : {},
            onClick     : null,
            onRefresh   : null
        },

        add: function (items) {
            this.insert(null, items);
        },

        insert: function (id, items) {
            if (!$.isArray(items)) items = [items];
            for (var o = 0; o < items.length; o++) {
                // checks
                if (items[o].type == null) {
                    console.log('ERROR: The parameter "type" is required but not supplied in w2toolbar.add() method.');
                    return;
                }
                if ($.inArray(String(items[o].type), ['button', 'check', 'radio', 'drop', 'menu', 'menu-radio', 'menu-check', 'color', 'text-color', 'break', 'html', 'spacer']) == -1) {
                    console.log('ERROR: The parameter "type" should be one of the following [button, check, radio, drop, menu, break, html, spacer] '+
                            'in w2toolbar.add() method.');
                    return;
                }
                if (items[o].id == null && items[o].type != 'break' && items[o].type != 'spacer') {
                    console.log('ERROR: The parameter "id" is required but not supplied in w2toolbar.add() method.');
                    return;
                }
                if (!w2utils.checkUniqueId(items[o].id, this.items, 'toolbar items', this.name)) return;
                // add item
                var it = $.extend({}, w2toolbar.prototype.item, items[o]);
                if (id == null) {
                    this.items.push(it);
                } else {
                    var middle = this.get(id, true);
                    this.items = this.items.slice(0, middle).concat([it], this.items.slice(middle));
                }
                this.refresh(it.id);
                this.resize();
            }
        },

        remove: function () {
            var removed = 0;
            for (var a = 0; a < arguments.length; a++) {
                var it = this.get(arguments[a]);
                if (!it || String(arguments[a]).indexOf(':') != -1) continue;
                removed++;
                // remove from screen
                $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)).remove();
                // remove from array
                var ind = this.get(it.id, true);
                if (ind != null) this.items.splice(ind, 1);
            }
            this.resize();
            return removed;
        },

        set: function (id, newOptions) {
            var item = this.get(id);
            if (item == null) return false;
            $.extend(item, newOptions);
            this.refresh(String(id).split(':')[0]);
            return true;
        },

        get: function (id, returnIndex) {
            if (arguments.length === 0) {
                var all = [];
                for (var i1 = 0; i1 < this.items.length; i1++) if (this.items[i1].id != null) all.push(this.items[i1].id);
                return all;
            }
            var tmp = String(id).split(':');
            for (var i2 = 0; i2 < this.items.length; i2++) {
                var it = this.items[i2];
                // find a menu item
                if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1 && tmp.length == 2 && it.id == tmp[0]) {
                    for (var i = 0; i < it.items.length; i++) {
                        var item = it.items[i];
                        if (item.id == tmp[1] || (item.id == null && item.text == tmp[1])) {
                            if (returnIndex == true) return i; else return item;
                        }
                    }
                } else if (it.id == tmp[0]) {
                    if (returnIndex == true) return i2; else return it;
                }
            }
            return null;
        },

        show: function () {
            var obj   = this;
            var items = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var it = this.get(arguments[a]);
                if (!it) continue;
                items++;
                it.hidden = false;
                tmp.push(String(arguments[a]).split(':')[0]);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); obj.resize(); }, 15); // needs timeout
            return items;
        },

        hide: function () {
            var obj   = this;
            var items = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var it = this.get(arguments[a]);
                if (!it) continue;
                items++;
                it.hidden = true;
                tmp.push(String(arguments[a]).split(':')[0]);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) { obj.refresh(tmp[t]); obj.tooltipHide(tmp[t]); } obj.resize(); }, 15); // needs timeout
            return items;
        },

        enable: function () {
            var obj   = this;
            var items = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var it = this.get(arguments[a]);
                if (!it) continue;
                items++;
                it.disabled = false;
                tmp.push(String(arguments[a]).split(':')[0]);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout
            return items;
        },

        disable: function () {
            var obj   = this;
            var items = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var it = this.get(arguments[a]);
                if (!it) continue;
                items++;
                it.disabled = true;
                tmp.push(String(arguments[a]).split(':')[0]);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) { obj.refresh(tmp[t]); obj.tooltipHide(tmp[t]); } }, 15); // needs timeout
            return items;
        },

        check: function () {
            var obj   = this;
            var items = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var it = this.get(arguments[a]);
                if (!it || String(arguments[a]).indexOf(':') != -1) continue;
                items++;
                it.checked = true;
                tmp.push(String(arguments[a]).split(':')[0]);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout
            return items;
        },

        uncheck: function () {
            var obj   = this;
            var items = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var it = this.get(arguments[a]);
                if (!it || String(arguments[a]).indexOf(':') != -1) continue;
                // remove overlay
                if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1 && it.checked) {
                    // hide overlay
                    setTimeout(function () {
                        var el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id));
                        el.w2overlay({ name: obj.name });
                    }, 1);
                }
                items++;
                it.checked = false;
                tmp.push(String(arguments[a]).split(':')[0]);
            }
            setTimeout(function () {
                for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]);
            }, 15); // needs timeout
            return items;
        },

        click: function (id, event) {
            var obj = this;
            // click on menu items
            var tmp = String(id).split(':');
            var it  = this.get(tmp[0]);
            if (tmp.length > 1) {
                var subItem = this.get(id);
                if (subItem && !subItem.disabled) {
                    obj.menuClick({ name: obj.name, item: it, subItem: subItem, originalEvent: event });
                }
                return;
            }
            if (it && !it.disabled) {
                // event before
                var edata = this.trigger({ phase: 'before', type: 'click', target: (id != null ? id : this.name),
                    item: it, object: it, originalEvent: event });
                if (edata.isCancelled === true) return;

                var btn = '#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button';
                $(btn).removeClass('down'); // need to requery at the moment -- as well as elsewhere in this function

                if (it.type == 'radio') {
                    for (var i = 0; i < this.items.length; i++) {
                        var itt = this.items[i];
                        if (itt == null || itt.id == it.id || itt.type !== 'radio') continue;
                        if (itt.group == it.group && itt.checked) {
                            itt.checked = false;
                            this.refresh(itt.id);
                        }
                    }
                    it.checked = true;
                    $(btn).addClass('checked');
                }

                if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
                    obj.tooltipHide(id);

                    if (it.checked) {
                        // if it was already checked, second click will hide it
                        setTimeout(function () {
                            // hide overlay
                            var el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id));
                            el.w2overlay({ name: obj.name });
                            // uncheck
                            it.checked = false;
                            obj.refresh(it.id);
                        }, 1);

                    } else {

                        // show overlay
                        setTimeout(function () {
                            var el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id));
                            if (!$.isPlainObject(it.overlay)) it.overlay = {};
                            var left = (el.width() - 50) / 2;
                            if (left > 19) left = 19;
                            if (it.type == 'drop') {
                                el.w2overlay(it.html, $.extend({ name: obj.name, left: left, top: 3 }, it.overlay, {
                                    onHide: function (event) {
                                        hideDrop();
                                    }
                                }));
                            }
                            if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1) {
                                var menuType = 'normal';
                                if (it.type == 'menu-radio') {
                                    menuType = 'radio';
                                    it.items.forEach(function (item) {
                                        if (it.selected == item.id) item.checked = true; else item.checked = false;
                                    });
                                }
                                if (it.type == 'menu-check') {
                                    menuType = 'check';
                                    it.items.forEach(function (item) {
                                        if ($.isArray(it.selected) && it.selected.indexOf(item.id) != -1) item.checked = true; else item.checked = false;
                                    });
                                }
                                el.w2menu($.extend({ name: obj.name, items: it.items, left: left, top: 3 }, it.overlay, {
                                    type: menuType,
                                    select: function (event) {
                                        obj.menuClick({ name: obj.name, item: it, subItem: event.item, originalEvent: event.originalEvent, keepOpen: event.keepOpen });
                                    },
                                    onHide: function (event) {
                                        hideDrop();
                                    }
                                }));
                            }
                            if (['color', 'text-color'].indexOf(it.type) != -1) {
                                if (it.transparent == null) it.transparent = true;
                                $(el).w2color({
                                    color: it.color,
                                    transparent: it.transparent,
                                    advanced: it.advanced,
                                    onHide: function (event) {
                                        hideDrop();
                                        if (obj._tmpColor) {
                                            obj.colorClick({ name: obj.name, item: it, color: obj._tmpColor, final: true });
                                        }
                                        delete obj._tmpColor;
                                    },
                                    onSelect: function (color) {
                                        if (color != null) {
                                            obj.colorClick({ name: obj.name, item: it, color: color });
                                            obj._tmpColor = color;
                                        }
                                    }
                                });
                            }
                            function hideDrop(event) {
                                it.checked = false;
                                $(btn).removeClass('checked');
                            }
                        }, 1);
                    }
                }

                if (['check', 'menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
                    it.checked = !it.checked;
                    if (it.checked) {
                        $(btn).addClass('checked');
                    } else {
                        $(btn).removeClass('checked');
                    }
                }
                // route processing
                if (it.route) {
                    var route = String('/'+ it.route).replace(/\/{2,}/g, '/');
                    var info  = w2utils.parseRoute(route);
                    if (info.keys.length > 0) {
                        for (var k = 0; k < info.keys.length; k++) {
                            route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name]);
                        }
                    }
                    setTimeout(function () { window.location.hash = route; }, 1);
                }
                if (event && ['button', 'check', 'radio'].indexOf(it.type) != -1) {
                    // need to refresh toolbar as it might be dynamic
                    this.tooltipShow(id, event, true);
                }
                // event after
                this.trigger($.extend(edata, { phase: 'after' }));
            }
        },

        scroll: function (direction) {
            var box = $(this.box);
            var obj = this;
            var scrollBox  = box.find('.w2ui-scroll-wrapper');
            var scrollLeft = scrollBox.scrollLeft();
            var width1, width2, scroll;

            switch (direction) {
                case 'left':
                    width1 = scrollBox.outerWidth();
                    width2 = scrollBox.find(':first').outerWidth();
                    scroll = scrollLeft - width1 + 50; // 35 is width of both button
                    if (scroll <= 0) scroll = 0;
                    scrollBox.animate({ scrollLeft: scroll }, 300);
                    break;

                case 'right':
                    width1 = scrollBox.outerWidth();
                    width2 = scrollBox.find(':first').outerWidth();
                    scroll = scrollLeft + width1 - 50; // 35 is width of both button
                    if (scroll >= width2 - width1) scroll = width2 - width1;
                    scrollBox.animate({ scrollLeft: scroll }, 300);
                    break;
            }
            setTimeout(function () { obj.resize(); }, 350);
        },

        render: function (box) {
            var time = (new Date()).getTime();
            // event before
            var edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });
            if (edata.isCancelled === true) return;

            if (box != null) {
                if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
                    $(this.box)
                        .removeAttr('name')
                        .removeClass('w2ui-reset w2ui-toolbar')
                        .html('');
                }
                this.box = box;
            }
            if (!this.box) return;
            // render all buttons
            var html = '<div class="w2ui-scroll-wrapper" onmousedown="var el=w2ui[\''+ this.name +'\']; if (el) el.resize();">'+
                       '<table cellspacing="0" cellpadding="0" width="100%"><tbody>'+
                       '<tr>';
            for (var i = 0; i < this.items.length; i++) {
                var it = this.items[i];
                if (it == null)  continue;
                if (it.id == null) it.id = "item_" + i;
                if (it.type == 'spacer') {
                    html += '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>';
                } else {
                    html += '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
                            '    class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+
                            '</td>';
                }
            }
            html += '<td width="100%" id="tb_'+ this.name +'_right" align="right">'+ this.right +'</td>';
            html += '</tr>'+
                    '</tbody></table></div>'+
                    '<div class="w2ui-scroll-left" onclick="var el=w2ui[\''+ this.name +'\']; if (el) el.scroll(\'left\');"></div>'+
                    '<div class="w2ui-scroll-right" onclick="var el=w2ui[\''+ this.name +'\']; if (el) el.scroll(\'right\');"></div>';
            $(this.box)
                .attr('name', this.name)
                .addClass('w2ui-reset w2ui-toolbar')
                .html(html);
            if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
            // refresh all
            this.refresh();
            this.resize();
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        refresh: function (id) {
            var time = (new Date()).getTime();
            // event before
            var edata = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name), item: this.get(id) });
            if (edata.isCancelled === true) return;
            // refresh all
            if (id == null) {
                for (var i = 0; i < this.items.length; i++) {
                    var it1 = this.items[i];
                    if (it1.id == null) it1.id = "item_" + i;
                    this.refresh(it1.id);
                }
                return;
            }
            // create or refresh only one item
            var it = this.get(id);
            if (it == null) return false;
            if (typeof it.onRefresh == 'function') {
                var edata2 = this.trigger({ phase: 'before', type: 'refresh', target: id, item: it, object: it });
                if (edata2.isCancelled === true) return;
            }
            var el = $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id));
            var html  = this.getItemHTML(it);
            // hide tooltip
            this.tooltipHide(id, {});

            if (el.length === 0) {
                // does not exist - create it
                if (it.type == 'spacer') {
                    html = '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>';
                } else {
                    html = '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
                        '    class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ html +
                        '</td>';
                }
                if (this.get(id, true) == this.items.length-1) {
                    $(this.box).find('#tb_'+ this.name +'_right').before(html);
                } else {
                    $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(this.items[parseInt(this.get(id, true))+1].id)).before(html);
                }
            } else {
                if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1 && it.checked == false) {
                    if ($('#w2ui-overlay-'+ this.name).length > 0) $('#w2ui-overlay-'+ this.name)[0].hide();
                }
                // refresh
                el.html(html);
                if (it.hidden) { el.css('display', 'none'); } else { el.css('display', ''); }
                if (it.disabled) { el.addClass('disabled'); } else { el.removeClass('disabled'); }
            }
            // event after
            if (typeof it.onRefresh == 'function') {
                this.trigger($.extend(edata2, { phase: 'after' }));
            }
            this.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        resize: function () {
            var time = (new Date()).getTime();
            // event before
            var edata = this.trigger({ phase: 'before', type: 'resize', target: this.name });
            if (edata.isCancelled === true) return;

            // show hide overflow buttons
            var box = $(this.box);
            box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide();
            var scrollBox = box.find('.w2ui-scroll-wrapper');
            if (scrollBox.find(':first').outerWidth() > scrollBox.outerWidth()) {
                // we have overflowed content
                if (scrollBox.scrollLeft() > 0) {
                    box.find('.w2ui-scroll-left').show();
                }
                if (scrollBox.scrollLeft() < scrollBox.find(':first').outerWidth() - scrollBox.outerWidth()) {
                    box.find('.w2ui-scroll-right').show();
                }
            }

            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        destroy: function () {
            // event before
            var edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
            if (edata.isCancelled === true) return;
            // clean up
            if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-toolbar')
                    .html('');
            }
            $(this.box).html('');
            delete w2ui[this.name];
            // event after
            this.trigger($.extend(edata, { phase: 'after' }));
        },

        // ========================================
        // --- Internal Functions

        getItemHTML: function (item) {
            var html = '';
            if (item.caption != null && item.text == null) item.text = item.caption; // for backward compatibility
            if (item.text == null) item.text = '';
            if (item.tooltip == null && item.hint != null) item.tooltip = item.hint; // for backward compatibility
            if (item.tooltip == null) item.tooltip = '';
            var img  = '<td>&#160;</td>';
            var text = item.text;
            if (typeof text == 'function') text = text.call(this, item);
            if (item.img)  img = '<td><div class="w2ui-tb-image w2ui-icon '+ item.img +'"></div></td>';
            if (item.icon) img = '<td><div class="w2ui-tb-image"><span class="'+ item.icon +'"></span></div></td>';

            if (html === '') switch (item.type) {
                case 'color':
                case 'text-color':
                    if (typeof item.color == 'string') {
                        if (item.color.substr(0,1) == '#') item.color = item.color.substr(1);
                        if (item.color.length == 3 || item.color.length == 6) item.color = '#' + item.color;
                    }
                    if (item.type == 'color') {
                        text = '<div style="height: 12px; width: 12px; margin-top: 1px; border: 1px solid #8A8A8A; border-radius: 1px; box-shadow: 0px 0px 1px #fff; '+
                               '        background-color: '+ (item.color != null ? item.color : '#fff') +'; float: left;"></div>'+
                               (item.text ? '<div style="margin-left: 17px;">' + w2utils.lang(item.text) + '</div>' : '');
                    }
                    if (item.type == 'text-color') {
                        text = '<div style="color: '+ (item.color != null ? item.color : '#444') +';">'+
                                    (item.text ? w2utils.lang(item.text) : '<b>Aa</b>') +
                               '</div>';
                    }
                case 'menu':
                case 'menu-check':
                case 'menu-radio':
                case 'button':
                case 'check':
                case 'radio':
                case 'drop':
                    html += '<table cellpadding="0" cellspacing="0" '+
                            '       class="w2ui-button '+ (item.checked ? 'checked' : '') +'" '+
                            '       onclick     = "var el=w2ui[\''+ this.name + '\']; if (el) el.click(\''+ item.id +'\', event);" '+
                            '       onmouseenter = "' + (!item.disabled ? "jQuery(this).addClass('over'); w2ui['"+ this.name +"'].tooltipShow('"+ item.id +"', event);" : "") + '"'+
                            '       onmouseleave = "' + (!item.disabled ? "jQuery(this).removeClass('over').removeClass('down'); w2ui['"+ this.name +"'].tooltipHide('"+ item.id +"', event);" : "") + '"'+
                            '       onmousedown = "' + (!item.disabled ? "jQuery(this).addClass('down');" : "") + '"'+
                            '       onmouseup   = "' + (!item.disabled ? "jQuery(this).removeClass('down');" : "") + '"'+
                            '><tbody>'+
                            '<tr><td>'+
                            '  <table cellpadding="1" cellspacing="0"><tbody>'+
                            '  <tr>' +
                                    img +
                                    (text !== ''
                                        ? '<td class="w2ui-tb-caption" nowrap="nowrap" style="'+ (item.style ? item.style : '') +'">'+ w2utils.lang(text) +'</td>'
                                        : ''
                                    ) +
                                    (item.count != null
                                        ? '<td class="w2ui-tb-count" nowrap="nowrap"><span>'+ item.count +'</span></td>'
                                        : ''
                                    ) +
                                    (((['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1) && item.arrow !== false) ?
                                        '<td class="w2ui-tb-down" nowrap="nowrap"><div></div></td>' : '') +
                            '  </tr></tbody></table>'+
                            '</td></tr></tbody></table>';
                    break;

                case 'break':
                    html += '<table cellpadding="0" cellspacing="0"><tbody><tr>'+
                            '    <td><div class="w2ui-break">&#160;</div></td>'+
                            '</tr></tbody></table>';
                    break;

                case 'html':
                    html += '<table cellpadding="0" cellspacing="0"><tbody><tr>'+
                            '    <td nowrap="nowrap">' + (typeof item.html == 'function' ? item.html.call(this, item) : item.html) + '</td>'+
                            '</tr></tbody></table>';
                    break;
            }
            return '<div>' + html + '</div>';
        },

        tooltipShow: function (id, event, forceRefresh) {
            if (this.tooltip == null) return;
            var $el  = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id));
            var item = this.get(id);
            var pos  = this.tooltip;
            var txt  = item.tooltip;
            if (typeof txt == 'function') txt = txt.call(this, item);
            clearTimeout(this._tooltipTimer);
            this._tooltipTimer = setTimeout(function () {
                if ($el.prop('_mouse_tooltip') !== true) {
                    $el.prop('_mouse_tooltip', true);
                    // show tooltip
                    if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1 && item.checked == true) return; // not for opened drop downs
                    $el.w2tag(w2utils.lang(txt), { position: pos });
                }
            }, 0);
            // refresh only
            if ($el.prop('_mouse_tooltip') && forceRefresh == true) {
                $el.w2tag(w2utils.lang(txt), { position: pos });
            }
        },

        tooltipHide: function (id, event) {
            if (this.tooltip == null) return;
            var $el  = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id));
            var item = this.get(id);
            clearTimeout(this._tooltipTimer);
            setTimeout(function () {
                if ($el.prop('_mouse_tooltip') === true) {
                    $el.removeProp('_mouse_tooltip');
                    // hide tooltip
                    $el.w2tag();
                }
            }, 1);
        },

        menuClick: function (event) {
            var obj = this;
            if (event.item && !event.item.disabled) {
                // event before
                var edata = this.trigger({ phase: 'before', type: 'click', target: event.item.id + ':' + event.subItem.id, item: event.item,
                    subItem: event.subItem, originalEvent: event.originalEvent });
                if (edata.isCancelled === true) return;

                // route processing
                var it   = event.subItem;
                var item = this.get(event.item.id);
                if (item.type == 'menu-radio') {
                    item.selected = it.id;
                    event.item.items.forEach(function (item) { item.checked = false; });
                    it.checked = true;
                }
                if (item.type == 'menu-check') {
                    if (!$.isArray(item.selected)) item.selected = [];
                    if (it.group == null) {
                        var ind = item.selected.indexOf(it.id);
                        if (ind == -1) {
                            item.selected.push(it.id);
                            it.checked = true;
                        } else {
                            item.selected.splice(ind, 1);
                            it.checked = false;
                        }
                    } else {
                        // find all items in the same group
                        var unchecked = [];
                        item.items.forEach(function (sub) {
                            if (sub.group === it.group) {
                                var ind = item.selected.indexOf(sub.id);
                                if (ind != -1) {
                                    if (sub.id != it.id) unchecked.push(sub.id);
                                    item.selected.splice(ind, 1);
                                }
                            }
                        });
                        var ind = item.selected.indexOf(it.id);
                        if (ind == -1) {
                            item.selected.push(it.id);
                            it.checked = true;
                        }
                    }
                }
                if (typeof it.route == 'string') {
                    var route = it.route !== '' ? String('/'+ it.route).replace(/\/{2,}/g, '/') : '';
                    var info  = w2utils.parseRoute(route);
                    if (info.keys.length > 0) {
                        for (var k = 0; k < info.keys.length; k++) {
                            if (obj.routeData[info.keys[k].name] == null) continue;
                            route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name]);
                        }
                    }
                    setTimeout(function () { window.location.hash = route; }, 1);
                }
                this.refresh(event.item.id);
                // event after
                this.trigger($.extend(edata, { phase: 'after' }));
            }
        },

        colorClick: function (event) {
            var obj = this;
            if (event.item && !event.item.disabled) {
                // event before
                var edata = this.trigger({ phase: 'before', type: 'click', target: event.item.id, item: event.item,
                    color: event.color, final: event.final, originalEvent: event.originalEvent });
                if (edata.isCancelled === true) return;

                // default behavior
                event.item.color = event.color;
                obj.refresh(event.item.id);

                // event after
                this.trigger($.extend(edata, { phase: 'after' }));
            }
        }
    };

    $.extend(w2toolbar.prototype, w2utils.event);
    w2obj.toolbar = w2toolbar;
})(jQuery);
