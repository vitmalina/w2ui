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
*   - change enable, disable can disable menu items
*   - item.render method
*   - hint property
*   - hintShow(), hintHide() methods
*   - added button types: color, text-color
*
************************************************************************/

(function () {
    var w2toolbar = function (options) {
        this.box       = null;      // DOM Element that holds the element
        this.name      = null;      // unique name for w2ui
        this.routeData = {};        // data for dynamic routes
        this.items     = [];
        this.right     = '';        // HTML text on the right of toolbar
        this.hint      = 'normal';  // can be normal, top, bottom
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
            type     : 'button',    // button, check, radio, drop, menu, break, html, spacer
            text     : '',
            route    : null,        // if not null, it is route to go
            html     : '',
            img      : null,
            icon     : null,
            count    : null,
            hidden   : false,
            disabled : false,
            checked  : false,       // used for radio buttons
            arrow    : true,        // arrow down for drop/menu types
            hint     : '',
            group    : null,        // used for radio buttons
            items    : null,        // for type menu it is an array of items in the menu
            overlay  : {},
            rebder   : null,        // item renderer if any
            onClick  : null
        },

        add: function (items) {
            this.insert(null, items);
        },

        insert: function (id, items) {
            if (!$.isArray(items)) items = [items];
            for (var o = 0; o < items.length; o++) {
                // checks
                if (typeof items[o].type == 'undefined') {
                    console.log('ERROR: The parameter "type" is required but not supplied in w2toolbar.add() method.');
                    return;
                }
                if ($.inArray(String(items[o].type), ['button', 'check', 'radio', 'drop', 'menu', 'color', 'text-color', 'break', 'html', 'spacer']) == -1) {
                    console.log('ERROR: The parameter "type" should be one of the following [button, check, radio, drop, menu, break, html, spacer] '+
                            'in w2toolbar.add() method.');
                    return;
                }
                if (typeof items[o].id == 'undefined') {
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
                if (!it) continue;
                removed++;
                // remove from screen
                $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)).remove();
                // remove from array
                var ind = this.get(it.id, true);
                if (ind != null) this.items.splice(ind, 1);
            }
            return removed;
        },

        set: function (id, item) {
            var index = this.get(id, true);
            if (index == null) return false;
            $.extend(this.items[index], item);
            this.refresh(id);
            return true;
        },

        get: function (id, returnIndex) {
            if (arguments.length == 0) {
                var all = [];
                for (var i1 = 0; i1 < this.items.length; i1++) if (this.items[i1].id !== null) all.push(this.items[i1].id);
                return all;
            }
            for (var i2 = 0; i2 < this.items.length; i2++) {
                if (this.items[i2].id == id) {
                    if (returnIndex == true) return i2; else return this.items[i2];
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
                tmp.push(it.id);
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
                tmp.push(it.id);
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
                var id = arguments[a].split(':');
                var it = this.get(id[0]);
                if (!it) continue;
                items++;
                tmp.push(it.id);
                if (it.type == 'menu' && id.length == 2) {
                    // disable a menu item
                    for (var i = 0; i < it.items.length; i++) {
                        var item = it.items[i]
                        if (item.id == id[1] || (item.id == null && item.text == id[1])) {
                            item.disabled = false;
                        }
                    }
                } else {
                    it.disabled = false;
                }
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout 
            return items;
        },

        disable: function () {
            var obj   = this;
            var items = 0;
            var tmp   = [];
            for (var a = 0; a < arguments.length; a++) {
                var id = arguments[a].split(':');
                var it = this.get(id[0]);
                if (!it) continue;
                items++;
                tmp.push(it.id);
                if (it.type == 'menu' && id.length == 2) {
                    // disable a menu item
                    for (var i = 0; i < it.items.length; i++) {
                        var item = it.items[i]
                        if (item.id == id[1] || (item.id == null && item.text == id[1])) {
                            item.disabled = true;
                        }
                    }
                } else {
                    it.disabled = true;
                }
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
                if (!it) continue;
                items++;
                it.checked = true;
                tmp.push(it.id);
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
                if (!it) continue;
                items++;
                it.checked = false;
                tmp.push(it.id);
            }
            setTimeout(function () { for (var t=0; t<tmp.length; t++) obj.refresh(tmp[t]); }, 15); // needs timeout 
            return items;
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
            var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id !== 'undefined' ? id : this.name), item: this.get(id) });
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

            // intentionaly blank

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
            if (typeof item.caption !== 'undefined') item.text = item.caption;
            if (typeof item.hint == 'undefined') item.hint = '';
            if (typeof item.text == 'undefined') item.text = '';
            var img  = '<td>&nbsp;</td>';
            var text = item.text;
            if (item.img)  img = '<td><div class="w2ui-tb-image w2ui-icon '+ item.img +'"></div></td>';
            if (item.icon) img = '<td><div class="w2ui-tb-image"><span class="'+ item.icon +'"></span></div></td>';

            switch (item.type) {
                case 'color':
                case 'text-color':
                    if (typeof item.color == 'string' && item.color.substr(0,1) == '#') item.color = item.color.substr(1);
                    if (item.type == 'color') {
                        text = '<div style="height: 12px; width: 12px; margin-top: 1px; border: 1px solid #efefef; '+
                               '        background-color: #'+ (item.color != null ? item.color : 'fff') +'; float: left;"></div>'+
                               (item.text ? '<div style="margin-left: 17px;">' + item.text + '</div>' : '');
                    }
                    if (item.type == 'text-color') {
                        text = '<div style="color: #'+ (item.color != null ? item.color : '444') +';">'+
                                    (item.text ? item.text : '<b>Aa</b>') +
                               '</div>';
                    }
                case 'menu':
                case 'button':
                case 'check':
                case 'radio':
                case 'drop':
                    html += '<table cellpadding="0" cellspacing="0" '+ (this.hint == 'normal' ? 'title="'+ item.hint +'"' : '') +
                            '       class="w2ui-button '+ (item.checked ? 'checked' : '') +'" '+
                            '       onclick     = "var el=w2ui[\''+ this.name + '\']; if (el) el.click(\''+ item.id +'\', event);" '+
                            '       onmouseover = "' + (!item.disabled ? "$(this).addClass('over'); w2ui['"+ this.name +"'].hintShow('"+ item.id +"', event);" : "") + '"'+
                            '       onmouseout  = "' + (!item.disabled ? "$(this).removeClass('over').removeClass('down'); w2ui['"+ this.name +"'].hintHide('"+ item.id +"', event);" : "") + '"'+
                            '       onmousedown = "' + (!item.disabled ? "$(this).addClass('down');" : "") + '"'+
                            '       onmouseup   = "' + (!item.disabled ? "$(this).removeClass('down');" : "") + '"'+
                            '>'+
                            '<tr><td>'+
                            '  <table cellpadding="1" cellspacing="0">'+
                            '  <tr>' +
                                    img +
                                    (text !== '' ? '<td class="w2ui-tb-caption" nowrap>'+ text +'</td>' : '') +
                                    (item.count != null ? '<td class="w2ui-tb-count" nowrap><span>'+ item.count +'</span></td>' : '') +
                                    (((['menu', 'drop', 'color', 'text-color'].indexOf(item.type) != -1) && item.arrow !== false) ?
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
                            '    <td nowrap>' + item.html + '</td>'+
                            '</tr></table>';
                    break;
            }

            var newHTML = '';
            if (typeof item.render == 'function') newHTML = item.render.call(this, item.id, html);
            if (newHTML !== '' && newHTML != null) html = newHTML;
            
            return '<div>' + html + '</div>';
        },

        hintShow: function (id) {
            if (this.hint == 'normal') return;
            var $el  = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id));
            var item = this.get(id);
            var pos  = this.hint;
            $el.prop('_mouse_over', true);
            setTimeout(function () {
                if ($el.prop('_mouse_over') === true && $el.prop('_mouse_hint') !== true) {
                    $el.prop('_mouse_hint', true);
                    // show hint
                    if (['menu', 'drop', 'color', 'text-color'].indexOf(item.type) != -1 && item.checked == true) return; // not for opened drop downs
                    $el.w2tag(item.hint, { position: pos });
                }
            }, 1);
        },

        hintHide: function (id) {
            if (this.hint == 'normal') return;
            var $el  = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id));
            var item = this.get(id);
            $el.removeProp('_mouse_over');
            setTimeout(function () {
                if ($el.prop('_mouse_over') !== true && $el.prop('_mouse_hint') === true) {
                    $el.removeProp('_mouse_hint');
                    // hide hint
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
                var it = event.subItem;
                if (it.route) {
                    var route = String('/'+ it.route).replace(/\/{2,}/g, '/');
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
        },


        click: function (id, event) {
            var obj = this;
            var it  = this.get(id);
            if (it && !it.disabled) {
                // event before
                var eventData = this.trigger({ phase: 'before', type: 'click', target: (typeof id !== 'undefined' ? id : this.name),
                    item: it, object: it, originalEvent: event });
                if (eventData.isCancelled === true) return;

                var btn = '#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button';
                $(btn).removeClass('down'); // need to requery at the moment -- as well as elsewhere in this function
                obj.hintHide(id);

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

                if (['menu', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
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
                            if (it.type == 'menu') {
                                el.w2menu(it.items, $.extend({ left: left, top: 3 }, it.overlay, {
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

                if (['check', 'menu', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
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
        }
    };

    $.extend(w2toolbar.prototype, w2utils.event);
    w2obj.toolbar = w2toolbar;
})();

