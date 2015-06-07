/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2toolbar        - toolbar widget
*        - $().w2toolbar    - jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2field
*
* == NICE TO HAVE ==
*   - on overflow display << >>
*   - vertical toolbar
*   - declarative toolbar
*
* == 1.5 changes
*   - $('#toolbar').w2toolbar() - if called w/o argument then it returns toolbar object
*   - enable, disable, show, hide, get, set, click --> will look into menu items too
*   - item.render method
*   - tooltip property
*   - tooltipShow(), tooltipHide() methods
*   - added button types: color, text-color
*   - added button types: menu-check, menu-radio - will save into item.selected
*   - item.text and item.html - can be functions now (or string), where this keyword is the item
*
************************************************************************/

(function () {
    var w2toolbar = function (options) {
        this.box       = null;      // DOM Element that holds the element
        this.name      = null;      // unique name for w2ui
        this.routeData = {};        // data for dynamic routes
        this.items     = [];
        this.right     = '';        // HTML text on the right of toolbar
        this.tooltip   = 'normal';  // can be normal, top, bottom, left, right
        this.onClick   = null;
        this.onRender  = null;
        this.onRefresh = null;
        this.onResize  = null;
        this.onDestroy = null;

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
        item: {
            id       : null,        // command to be sent to all event handlers
            type     : 'button',    // button, check, radio, drop, menu, menu-radio, menu-check, break, html, spacer
            text     : null,
            route    : null,        // if not null, it is route to go
            html     : '',
            img      : null,
            icon     : null,
            count    : null,
            hidden   : false,
            disabled : false,
            checked  : false,       // used for radio buttons
            arrow    : true,        // arrow down for drop/menu types
            tooltip  : null,
            group    : null,        // used for radio buttons
            items    : null,        // for type menu it is an array of items in the menu
            overlay  : {},
            render   : null,        // item renderer if any
            onClick  : null
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
                if (items[o].id == null) {
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
            if (arguments.length == 0) {
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
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout 
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
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout 
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
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout 
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
                items++;
                it.checked = false;
                tmp.push(String(arguments[a]).split(':')[0]);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout 
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
                var eventData = this.trigger({ phase: 'before', type: 'click', target: (id != null ? id : this.name),
                    item: it, object: it, originalEvent: event });
                if (eventData.isCancelled === true) return;

                var btn = '#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button';
                $(btn).removeClass('down'); // need to requery at the moment -- as well as elsewhere in this function
                obj.tooltipHide(id);

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
                    if (it.checked) {
                        // if it was already checked, second click will hide it
                        it.checked = false;
                    } else {
                        // show overlay
                        setTimeout(function () {
                            var el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id));
                            if (!$.isPlainObject(it.overlay)) it.overlay = {};
                            var left = (el.width() - 50) / 2;
                            if (left > 19) left = 19;
                            if (it.type == 'drop') {
                                el.w2overlay(it.html, $.extend({ name: obj.name, left: left, top: 3 }, it.overlay, {
                                    onHide: function () { hideDrop(); }
                                }));
                            }
                            if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1) {
                                var menuType = 'normal';
                                if (it.type == 'menu-radio') {
                                    menuType = 'radio';
                                    it.items.forEach(function (item) {
                                        if (it.selected == item.id) item.checked = true; else delete item.checked;
                                    });
                                }
                                if (it.type == 'menu-check') {
                                    menuType = 'check';
                                    it.items.forEach(function (item) {
                                        if ($.isArray(it.selected) && it.selected.indexOf(item.id) != -1) item.checked = true; else delete item.checked;
                                    });
                                }
                                el.w2menu($.extend({ items: it.items, left: left, top: 3 }, it.overlay, {
                                    type: menuType,
                                    select: function (event) {
                                        obj.menuClick({ name: obj.name, item: it, subItem: event.item, originalEvent: event.originalEvent });
                                        hideDrop();
                                    },
                                    onHide: function () { hideDrop(); }
                                }));
                            }
                            if (['color', 'text-color'].indexOf(it.type) != -1) {
                                $(el).w2color(it.color, function (color, index) {
                                    if (color != null) {
                                        obj.colorClick({ name: obj.name, item: it, color: color, originalEvent: event.originalEvent });
                                    }
                                    hideDrop();
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
                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
            }
        },

        render: function (box) {
            var time = (new Date()).getTime();
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });
            if (eventData.isCancelled === true) return;

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
            var html = '<table cellspacing="0" cellpadding="0" width="100%">'+
                       '<tr>';
            for (var i = 0; i < this.items.length; i++) {
                var it = this.items[i];
                if (it == null)  continue;
                if (it.id == null) it.id = "item_" + i;
                if (it.type == 'spacer') {
                    html += '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>';
                } else {
                    html += '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
                            '    class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ this.getItemHTML(it) +
                            '</td>';
                }
            }
            html += '<td width="100%" id="tb_'+ this.name +'_right" align="right">'+ this.right +'</td>';
            html += '</tr>'+
                    '</table>';
            $(this.box)
                .attr('name', this.name)
                .addClass('w2ui-reset w2ui-toolbar')
                .html(html);
            if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        refresh: function (id) {
            var time = (new Date()).getTime();
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name), item: this.get(id) });
            if (eventData.isCancelled === true) return;

            if (id == null) {
                // refresh all
                for (var i = 0; i < this.items.length; i++) {
                    var it1 = this.items[i];
                    if (it1.id == null) it1.id = "item_" + i;
                    this.refresh(it1.id);
                }
            }
            // create or refresh only one item
            var it = this.get(id);
            if (it == null) return false;

            var el = $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id));
            var html  = this.getItemHTML(it);
            if (el.length == 0) {
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
                if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1 && it.checked == true) {
                    it.checked = false;
                    html = this.getItemHTML(it);
                    if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide();
                }
                // refresh
                el.html(html);
                if (it.hidden) { el.css('display', 'none'); } else { el.css('display', ''); }
                if (it.disabled) { el.addClass('disabled'); } else { el.removeClass('disabled'); }
            }
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        resize: function () {
            var time = (new Date()).getTime();
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'resize', target: this.name });
            if (eventData.isCancelled === true) return;

            // intentionally blank

            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        destroy: function () {
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
            if (eventData.isCancelled === true) return;
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
            this.trigger($.extend(eventData, { phase: 'after' }));
        },

        // ========================================
        // --- Internal Functions

        getItemHTML: function (item) {
            var html = '';
            if (item.caption != null && item.text == null) item.text = item.caption; // for backward compatibility
            if (item.tooltip == null && item.hint != null) item.tooltip = item.hint; // for backward compatibility
            if (item.text == null) item.text = '';
            if (item.tooltip == null) item.tooltip = '';
            var img  = '<td>&nbsp;</td>';
            var text = item.text;
            if (typeof text == 'function') text = text.call(item);
            if (item.img)  img = '<td><div class="w2ui-tb-image w2ui-icon '+ item.img +'"></div></td>';
            if (item.icon) img = '<td><div class="w2ui-tb-image"><span class="'+ item.icon +'"></span></div></td>';

            switch (item.type) {
                case 'color':
                case 'text-color':
                    if (typeof item.color == 'string' && item.color.substr(0,1) == '#') item.color = item.color.substr(1);
                    if (item.type == 'color') {
                        text = '<div style="height: 12px; width: 12px; margin-top: 1px; border: 1px solid #efefef; '+
                               '        background-color: #'+ (item.color != null ? item.color : 'fff') +'; float: left;"></div>'+
                               (item.text ? '<div style="margin-left: 17px;">' + w2utils.lang(item.text) + '</div>' : '');
                    }
                    if (item.type == 'text-color') {
                        text = '<div style="color: #'+ (item.color != null ? item.color : '444') +';">'+
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
                    html += '<table cellpadding="0" cellspacing="0" '+ (this.tooltip == 'normal' && item.tooltip != null ? 'title="'+ w2utils.lang(item.tooltip) +'"' : '') +
                            '       class="w2ui-button '+ (item.checked ? 'checked' : '') +'" '+
                            '       onclick     = "var el=w2ui[\''+ this.name + '\']; if (el) el.click(\''+ item.id +'\', event);" '+
                            '       onmouseover = "' + (!item.disabled ? "$(this).addClass('over'); w2ui['"+ this.name +"'].tooltipShow('"+ item.id +"', event);" : "") + '"'+
                            '       onmouseout  = "' + (!item.disabled ? "$(this).removeClass('over').removeClass('down'); w2ui['"+ this.name +"'].tooltipHide('"+ item.id +"', event);" : "") + '"'+
                            '       onmousedown = "' + (!item.disabled ? "$(this).addClass('down');" : "") + '"'+
                            '       onmouseup   = "' + (!item.disabled ? "$(this).removeClass('down');" : "") + '"'+
                            '>'+
                            '<tr><td>'+
                            '  <table cellpadding="1" cellspacing="0">'+
                            '  <tr>' +
                                    img +
                                    (text !== '' ? '<td class="w2ui-tb-caption" nowrap>'+ w2utils.lang(text) +'</td>' : '') +
                                    (item.count != null ? '<td class="w2ui-tb-count" nowrap><span>'+ item.count +'</span></td>' : '') +
                                    (((['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1) && item.arrow !== false) ?
                                        '<td class="w2ui-tb-down" nowrap><div></div></td>' : '') +
                            '  </tr></table>'+
                            '</td></tr></table>';
                    break;

                case 'break':
                    html += '<table cellpadding="0" cellspacing="0"><tr>'+
                            '    <td><div class="w2ui-break">&nbsp;</div></td>'+
                            '</tr></table>';
                    break;

                case 'html':
                    html += '<table cellpadding="0" cellspacing="0"><tr>'+
                            '    <td nowrap>' + (typeof item.html == 'function' ? item.html.call(item) : item.html) + '</td>'+
                            '</tr></table>';
                    break;
            }

            var newHTML = '';
            if (typeof item.render == 'function') newHTML = item.render.call(this, item.id, html);
            if (newHTML !== '' && newHTML != null) html = newHTML;
            
            return '<div>' + html + '</div>';
        },

        tooltipShow: function (id) {
            if (this.tooltip == 'normal') return;
            var $el  = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id));
            var item = this.get(id);
            var pos  = this.tooltip;
            $el.prop('_mouse_over', true);
            setTimeout(function () {
                if ($el.prop('_mouse_over') === true && $el.prop('_mouse_tooltip') !== true) {
                    $el.prop('_mouse_tooltip', true);
                    // show tooltip
                    if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1 && item.checked == true) return; // not for opened drop downs
                    $el.w2tag(w2utils.lang(item.tooltip), { position: pos });
                }
            }, 1);
        },

        tooltipHide: function (id) {
            if (this.tooltip == 'normal') return;
            var $el  = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id));
            var item = this.get(id);
            $el.removeProp('_mouse_over');
            setTimeout(function () {
                if ($el.prop('_mouse_over') !== true && $el.prop('_mouse_tooltip') === true) {
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
                var eventData = this.trigger({ phase: 'before', type: 'click', target: event.item.id + ':' + event.subItem.id, item: event.item,
                    subItem: event.subItem, originalEvent: event.originalEvent });
                if (eventData.isCancelled === true) return;

                // route processing
                var it   = event.subItem;
                var item = this.get(event.item.id);
                if (item.type == 'menu-radio') {
                    item.selected = it.id;
                }
                if (item.type == 'menu-check') {
                    if (!$.isArray(item.selected)) item.selected = [];
                    var ind = item.selected.indexOf(it.id);
                    if (ind == -1) {
                        item.selected.push(it.id);
                    } else {
                        item.selected.splice(ind, 1);
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

                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
            }
        },

        colorClick: function (event) {
            var obj = this;
            if (event.item && !event.item.disabled) {
                // event before
                var eventData = this.trigger({ phase: 'before', type: 'click', target: event.item.id, item: event.item, 
                    color: event.color, originalEvent: event.originalEvent });
                if (eventData.isCancelled === true) return;

                // default behavior
                event.item.color = event.color;
                obj.refresh(event.item.id);

                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
            }
        }
    };

    $.extend(w2toolbar.prototype, w2utils.event);
    w2obj.toolbar = w2toolbar;
})();

