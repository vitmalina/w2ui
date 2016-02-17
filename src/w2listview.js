/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
*        - w2listview        - listview widget
*        - $().w2listview    - jQuery wrapper
*   - Dependencies: jQuery, w2utils
*
* == NICE TO HAVE ==
*   - images support via 'src' attribute
*
************************************************************************/

(function ($) {
    var w2listview = function (options) {
        this.box           = null;        // DOM Element that holds the element
        this.name          = null;        // unique name for w2ui
        this.vType         = null;
        this.extraCols     = [];
        this.itemExtra     = {};
        this.items         = [];
        this.menu          = [];
        this.multiselect   = true;        // multiselect support
        this.keyboard      = true;        // keyboard support
        this.curFocused    = null;        // currently focused item
        this.selStart      = null;        // item to start selection from (used in selection with "shift" key)
        this.onClick       = null;
        this.onDblClick    = null;
        this.onKeydown     = null;
        this.onContextMenu = null;
        this.onMenuClick   = null;        // when context menu item selected
        this.onRender      = null;
        this.onRefresh     = null;
        this.onDestroy     = null;

        $.extend(this, { handlers: [] });
        $.extend(true, this, w2obj.listview, options);
        for (var i = 0; i < this.extraCols.length; i++) {
            this.itemExtra[this.extraCols[i].name] = '';
        }
    };

    // ====================================================
    // -- Registers as a jQuery plugin

    $.fn.w2listview = function(method) {
        var obj;
        if (typeof method === 'object' || !method ) {
            // check name parameter
            if (!w2utils.checkName(method, 'w2listview')) return undefined;
            if (typeof method.viewType !== 'undefined') {
                method.vType = method.viewType;
                delete method.viewType;
            }
            var itms = method.items;
            obj = new w2listview(method);
            if ($.isArray(itms)) {
                for (var i = 0; i < itms.length; i++) {
                    obj.items[i] = $.extend({}, w2listview.prototype.item, obj.itemExtra, itms[i]);
                }
            }
            if ($(this).length !== 0) {
                obj.render($(this)[0]);
            }
            // register new object
            w2ui[obj.name] = obj;
            return obj;
        } else if (w2ui[$(this).attr('name')]) {
            obj = w2ui[$(this).attr('name')];
            obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
            return this;
        } else {
            console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2listview' );
            return undefined;
        }
    };

    // ====================================================
    // -- Implementation of core functionality

    w2listview.prototype = {
        item : {
            id            : null,        // param to be sent to all event handlers
            caption       : '',
            description   : '',
            icon          : null,
            img           : null,
            selected      : false,
            onClick       : null,
            onDblClick    : null,
            onKeydown     : null,
            onContextMenu : null,
            onRefresh     : null
        },

        viewType: function (value) {
            if (arguments.length === 0) {
                switch (this.vType) {
                    case 'table':
                        return 'table';
                    case 'icon-tile':
                        return 'icon-tile';
                    case 'icon-large':
                        return 'icon-large';
                    case 'icon-medium':
                        return 'icon-medium';
                    default:
                        return 'icon-small';
                }
            } else {
                this.vType = value;
                var vt = 'w2ui-' + this.viewType();
                $(this.box)
                    .removeClass('w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile w2ui-table')
                    .addClass(vt);
                return vt;
            }
        },

        add: function (item) {
            return this.insert(null, item);
        },

        insert: function (id, item) {
            if (!$.isArray(item)) item = [item];
            // assume it is array
            for (var i = 0; i < item.length; i++) {
                // checks
                if (typeof item[i].id === 'undefined') {
                    console.log('ERROR: The parameter "id" is required but not supplied. (obj: '+ this.name +')');
                    return;
                }
                if (!w2utils.checkUniqueId(item[i].id, this.items, 'items', this.name)) return;
                // add item
                var newItm = $.extend({}, w2listview.prototype.item, this.itemExtra, item[i]);
                if (id === null || typeof id === 'undefined') {
                    this.items.push(newItm);
                } else {
                    var middle = this.get(id, true);
                    this.items = this.items.slice(0, middle).concat([newItm], this.items.slice(middle));
                }
                this.refresh(item[i].id);
            }
        },

        remove: function (id) {
            var removed = 0;
            for (var i = 0; i < arguments.length; i++) {
                var idx = this.get(arguments[i], true);
                if (idx === null) return false;
                removed++;
                // remove from array
                this.items.splice(idx, 1);
                // remove from screen
                $(this.itemNode(arguments[i])).remove();
            }
            return removed;
        },

        set: function (id, item) {
            var idx = this.get(id, true);
            if (idx === null) return false;
            $.extend(this.items[idx], item);
            this.refresh(id);
            return true;
        },

        get: function (id, returnIndex) {
            var i = 0;
            if (arguments.length === 0) {
                var all = [];
                for (; i < this.items.length; i++) {
                    if (this.items[i].id !== null) all.push(this.items[i].id);
                }
                return all;
            }
            for (; i < this.items.length; i++) {
                if (this.items[i].id === id) {
                    if (returnIndex === true) return i; else return this.items[i];
                }
            }
            return null;
        },

        select: function (id, addSelection) {
            var itm = this.get(id);
            if (itm === null) return false;
            if (arguments.length === 1 || !this.multiselect) addSelection = false;

            if (!addSelection) this.unselect();
            if (!itm.selected) {
                $(this.itemNode(itm.id)).addClass('w2ui-selected');
                itm.selected = true;
            }
            return itm.selected;
        },

        unselect: function (id) {
            var obj = this;
            var i = 0;
            if (arguments.length === 0) {
                for (; i < this.items.length; i++) doUnselect(this.items[i]);
            } else {
                for (; i < arguments.length; i++) doUnselect(this.get(arguments[i]));
            }
            return true;

            function doUnselect(itm) {
                if (itm !== null && itm.selected) {
                    $(obj.itemNode(itm.id)).removeClass('w2ui-selected');
                    itm.selected = false;
                }
            }
        },

        getFocused: function (returnIndex) {
            var rslt = this.get(this.curFocused, returnIndex);
            if (rslt === null) rslt = this.get(this.selStart, returnIndex);
            return rslt;
        },

        scrollIntoView: function (id) {
            if (typeof id !== 'undefined') {
                var node = this.itemNode(id);
                if (node === null) return;
                var nodeOffset = this.itemNodeOffsetInfo(node);
                if (nodeOffset.top < this.box.scrollTop) {
                    $(this.box).scrollTop(nodeOffset.top);
                } else if (nodeOffset.bottom > this.box.scrollTop + this.box.offsetHeight) {
                    $(this.box).scrollTop(nodeOffset.bottom - this.box.offsetHeight);
                }
            }
        },

        userSelect: function (id, event, isMouse) {
            var itm = null;

            // update selection
            if (event.shiftKey) {
                this.unselect();
                var fIdx = this.get(this.selStart, true);
                if (fIdx !== null) {
                    var idx = this.get(id, true);
                    var toIdx = Math.max(idx, fIdx);
                    for (var i = Math.min(idx, fIdx); i <= toIdx; i++) {
                        this.select(this.items[i].id, true);
                    }
                } else {
                    this.select(id, true);
                    this.selStart = id;
                }
            } else if (event.ctrlKey) {
                if (isMouse) {
                    itm = this.get(id);
                    if (itm.selected) this.unselect(id); else this.select(id, true);
                    this.selStart = id;
                }
            } else {
                this.select(id, false);
                this.selStart = id;
            }

            // update focus
            if (itm === null) itm = this.get(id);
            if (itm === null) return;
            var oldItm = this.getFocused();
            if (oldItm !== null) {
                $(this.itemNode(oldItm.id)).removeClass('w2ui-focused');
            }
            $(this.itemNode(id)).addClass('w2ui-focused');
            this.curFocused = id;

            // update view
            this.scrollIntoView(id);
        },

        // ===================================================
        // -- Internal Event Handlers

        click: function (id, event) {
            var idx = this.get(id, true);
            if (idx === null) return false;
            var eventData = this.trigger({ phase: 'before', type: 'click', target: id, originalEvent: event, object: this.items[idx] });
            var rslt = eventData.isCancelled !== true;
            if (rslt) {
                // default action
                this.userSelect(id, event, true);
                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
            }
            return rslt;
        },

        dblClick: function (id, event) {
            var itm = this.get(id);
            if (itm === null) return false;
            var eventData = this.trigger({ phase: 'before', type: 'dblClick', target: id, originalEvent: event, object: itm });
            var rslt = eventData.isCancelled !== true;
            if (rslt) {
                // default action
                // -- empty
                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
            }
            return rslt;
        },

        keydown: function (event) {
            var obj = this;
            var idx = this.getFocused(true);
            if (idx === null || obj.keyboard !== true) return false;
            var eventData = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event });
            var rslt = eventData.isCancelled !== true;
            if (rslt) {
                // default behaviour
                var cancelProcessing = true;
                switch (event.keyCode) {
                    case 13:
                        obj.dblClick(obj.items[idx].id, event);
                        break;
                    case 32:
                        obj.click(obj.items[idx].id, event);
                        break;
                    case 33:
                        processNeighbor('pgUp');
                        break;
                    case 34:
                        processNeighbor('pgDown');
                        break;
                    case 36:
                        processNeighbor('home');
                        break;
                    case 35:
                        processNeighbor('end');
                        break;
                    case 37:
                        processNeighbor('left');
                        break;
                    case 38:
                        processNeighbor('up');
                        break;
                    case 39:
                        processNeighbor('right');
                        break;
                    case 40:
                        processNeighbor('down');
                        break;
                    default:
                        cancelProcessing = false;
                }
                // cancel event if needed
                if (cancelProcessing) {
                    if (event.preventDefault) event.preventDefault();
                    if (event.stopPropagation) event.stopPropagation();
                }

                // event after
                obj.trigger($.extend(eventData, { phase: 'after' }));
            }
            return rslt;

            function processNeighbor(neighbor) {
                var newIdx = getNeighborIdx(neighbor);
                if (newIdx >= 0 && newIdx < obj.items.length && newIdx !== idx) {
                    obj.userSelect(obj.items[newIdx].id, event, false);
                }
            }

            function getNeighborIdx(neighbor) {
                var colsCnt = colsCount();
                var newIdx, itmOffset;
                switch (neighbor) {
                    case 'up':
                        return idx - colsCnt;
                    case 'down':
                        return idx + colsCnt;
                    case 'left':
                        return (colsCnt > 1) ? idx - 1 : idx;
                    case 'right':
                        return (colsCnt > 1) ? idx + 1 : idx;
                    case 'pgUp':
                        if (idx < colsCnt) return 0;
                        itmOffset = obj.itemNodeOffsetInfo(obj.itemNode(obj.items[idx].id));
                        var minTop = itmOffset.bottom - obj.box.offsetHeight - allowedOverflow(itmOffset);
                        newIdx = idx;
                        while (newIdx >= colsCnt) {
                            newIdx -= colsCnt;
                            if (obj.itemNodeOffsetInfo(obj.itemNode(obj.items[newIdx].id)).top < minTop) {
                                newIdx += colsCnt;
                                break;
                            }
                        }
                        return newIdx;
                    case 'pgDown':
                        if (idx >= obj.items.length - colsCnt) return obj.items.length - 1;
                        itmOffset = obj.itemNodeOffsetInfo(obj.itemNode(obj.items[idx].id));
                        var maxBottom = itmOffset.top + obj.box.offsetHeight + allowedOverflow(itmOffset);
                        newIdx = idx;
                        while (newIdx < obj.items.length - colsCnt) {
                            newIdx += colsCnt;
                            if (obj.itemNodeOffsetInfo(obj.itemNode(obj.items[newIdx].id)).bottom > maxBottom) {
                                newIdx -= colsCnt;
                                break;
                            }
                        }
                        return newIdx;
                    case 'home':
                        return 0;
                    case 'end':
                        return obj.items.length - 1;
                    default:
                        return idx;
                }

                function allowedOverflow(offset) {
                    return parseInt((offset.bottom - offset.top) / 2);
                }
            }

            function colsCount() {
                var vt = obj.viewType();
                if (vt === 'table') return 1;
                return parseInt($(obj.box).find('> ul').width() / itemWidth(vt), 10);
            }

            function itemWidth(viewType) {
                obj.itemWidths = obj.itemWidths || {};
                if (!(viewType in obj.itemWidths)) {
                    var itm = obj.itemNode(obj.items[idx].id);
                    obj.itemWidths[viewType] = w2utils.getSize(itm, 'width');
                }
                return obj.itemWidths[viewType];
            }
        },

        contextMenu: function (id, event) {
            var obj = this;
            var itm = this.get(id);
            if (itm === null) return false;
            if (!itm.selected) obj.select(id);
            var eventData = obj.trigger({ phase: 'before', type: 'contextMenu', target: id, originalEvent: event, object: itm });
            var rslt = eventData.isCancelled !== true;
            if (rslt) {
                // default action
                if (obj.menu.length > 0) {
                    $(obj.itemNode(id))
                        .w2menu(obj.menu, {
                            left: (event ? event.offsetX || event.pageX : 50) - 25,
                            select: function (item, event, index) { obj.menuClick(id, index, event); }
                        });
                }
                // event after
                obj.trigger($.extend(eventData, { phase: 'after' }));
            }
            return false;
        },

        menuClick: function (itemId, index, event) {
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'menuClick', target: itemId, originalEvent: event, menuIndex: index, menuItem: this.menu[index] });
            var rslt = eventData.isCancelled !== true;
            if (rslt) {
                // default action
                // -- empty
                // event after
                this.trigger($.extend(eventData, { phase: 'after' }));
            }
            return rslt;
        },

        itemNodeId: function (id) {
            return 'lv_' + this.name + '_itm_' + id;
        },

        itemNode: function (id) {
            return document.getElementById(this.itemNodeId(id));
        },

        itemNodeOffsetInfo: function (node) {
            var vt = this.viewType();
            this.itemSpacing = this.itemSpacing || {};
            if (!(vt in this.itemSpacing)) {
                var $node = $(node);
                this.itemSpacing[vt] = (parseInt($node.css('margin-top')) || 0) + (parseInt($node.css('margin-bottom')) || 0);
            }
            return {
                top: node.offsetTop - this.itemSpacing[vt],
                bottom: node.offsetTop + node.offsetHeight + this.itemSpacing[vt]
            };
        },

        refresh: function (id) {
            var obj = this;
            var time = (new Date()).getTime();

            var idx;
            if (typeof id !== 'undefined') {
                idx = this.get(id, true);
                if (idx === null) return false;
            }

            // event before
            var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id !== 'undefined' ? id : this.name), object: this.items[idx] });
            if (eventData.isCancelled === true) return;

            // default action
            if (typeof id === 'undefined') {
                // refresh all items
                var itms = document.createDocumentFragment();
                for (var i = 0; i < this.items.length; i++)
                    itms.appendChild(getItemElement(this.items[i]));
                var lst = this.lastItm.parentNode;
                while (lst.firstChild !== this.lastItm)
                    lst.removeChild(lst.firstChild);
                this.lastItm.parentNode.insertBefore(itms, this.lastItm);
            } else {
                // refresh single item
                var itm = this.itemNode(id);
                if (itm) {
                    // update existing
                    itm.parentNode.replaceChild(getItemElement(this.items[idx]), itm);
                } else {
                    // create new
                    var nextItm;
                    if (idx !== this.items.length-1) nextItm = this.itemNode(this.items[idx+1].id);
                    if (!nextItm) nextItm = this.lastItm;
                    nextItm.parentNode.insertBefore(getItemElement(this.items[idx]), nextItm);
                }
            }

            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));

            return (new Date()).getTime() - time;

            function getItemElement(item) {
                var imgClass = (item.icon !== null && typeof item.icon !== 'undefined') ? ' '+item.icon : ' icon-none';
                if (item.img !== null && typeof item.img !== 'undefined') imgClass = ' w2ui-icon '+item.img;

                var withDescription = (typeof item.description !== 'undefined' && item.description !== '');
                var withExtra = (obj.extraCols.length > 0);
                var rslt = getItemTemplate(withDescription, withExtra);
                rslt.id = obj.itemNodeId(item.id);
                rslt.setAttribute('item_id', item.id);
                var itmDiv = rslt.querySelector('div');
                itmDiv.querySelector('div.w2ui-listview-img').className = 'w2ui-listview-img'+imgClass;
                itmDiv.querySelector('div.caption').textContent = item.caption;
                if (withDescription) {
                    itmDiv.querySelector('div.description').textContent = item.description;
                }
                if (withExtra) {
                    var itmExtra = itmDiv.querySelector('div.extra div');
                    for (var i = 0; i < obj.extraCols.length; i++) {
                        var colName = obj.extraCols[i].name;
                        if (colName in item) {
                            itmExtra.querySelector('div.'+colName).textContent = item[colName];
                        }
                    }
                }
                return rslt;
            }

            function getItemTemplate(withDescription, withExtra) {
                var template, itmDiv;
                if (!withDescription && !withExtra) {
                    if ('captionOnlyTemplate' in obj) {
                        template = obj.captionOnlyTemplate;
                    } else {
                        template = document.createElement('li');
                        template.setAttribute('onmouseover', '$(this).addClass(\'hover\');');
                        template.setAttribute('onmouseout', '$(this).removeClass(\'hover\');');
                        template.setAttribute('onclick', 'w2ui[\''+obj.name+'\'].click(this.getAttribute(\'item_id\'), event);');
                        template.setAttribute('ondblclick', 'w2ui[\''+obj.name+'\'].dblClick(this.getAttribute(\'item_id\'), event);');
                        template.setAttribute('oncontextmenu', 'w2ui[\''+obj.name+'\'].contextMenu(this.getAttribute(\'item_id\'), event); if (event.preventDefault) event.preventDefault();');
                        itmDiv = appendDiv(template);
                        appendDiv(itmDiv, 'w2ui-listview-img');
                        appendDiv(itmDiv, 'caption');
                        obj.captionOnlyTemplate = template;
                    }
                } else if (withDescription && !withExtra) {
                    if ('captionWithDescription' in obj) {
                        template = obj.captionWithDescriptionTemplate;
                    } else {
                        template = getItemTemplate(false, false);
                        itmDiv = template.querySelector('div');
                        appendDiv(itmDiv, 'description');
                        obj.captionWithDescriptionTemplate = template;
                    }
                } else if (!withDescription && withExtra) {
                    if ('captionWithExtra' in obj) {
                        template = obj.captionWithExtra;
                    } else {
                        template = appendExtra(getItemTemplate(false, false));
                        obj.captionWithExtra = template;
                    }
                } else if (withDescription && withExtra) {
                    if ('captionWithDescriptionAndExtra' in obj) {
                        template = obj.captionWithDescriptionAndExtra;
                    } else {
                        template = appendExtra(getItemTemplate(true, false));
                        obj.captionWithDescriptionAndExtra = template;
                    }
                }
                return template.cloneNode(true);

                function appendExtra(node) {
                    var itmDiv = node.querySelector('div');
                    var extra = appendDiv(itmDiv, 'extra');
                    extra.style.width = extraColsWidth() + 'px';
                    extra = appendDiv(extra);
                    for (var i = 0; i < obj.extraCols.length; i++) {
                        var col = obj.extraCols[i];
                        var extraCol = appendDiv(extra, col.name);
                        extraCol.style.width = col.width + 'px';
                        if ('align' in col) extraCol.style.textAlign = col.align;
                        if ('paddingLeft' in col) extraCol.style.paddingLeft = col.paddingLeft + 'px';
                        if ('paddingRight' in col) extraCol.style.paddingRight = col.paddingRight + 'px';
                    }
                    return node;

                    function extraColsWidth() {
                        var rslt = 0;
                        for (var i = 0; i < obj.extraCols.length; i++) {
                            obj.extraCols[i].width = ('width' in obj.extraCols[i]) ? parseInt(obj.extraCols[i].width, 10) : 100;
                            rslt += obj.extraCols[i].width;
                        }
                        return rslt;
                    }
                }
            }

            function appendDiv(parentElement, cls, txt) {
                var div = document.createElement('div');
                if (typeof cls !== 'undefined') div.className = cls;
                if (typeof txt !== 'undefined') div.textContent = txt;
                parentElement.appendChild(div);
                return div;
            }

        },

        render: function (box) {
            var time = (new Date()).getTime();
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });
            if (eventData.isCancelled === true) return;
            // default action
            if (typeof box !== 'undefined' && box !== null && this.box !== box) {
                if (this.lastItm) {
                    while (this.box.hasChildNodes())
                        this.box.removeChild(this.box.lastChild);
                    $(this.box)
                        .removeAttr('name')
                        .removeClass('w2ui-reset w2ui-listview w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile w2ui-table');
                }
                this.box = box;
            }
            if (!this.box) return false;
            while (this.box.hasChildNodes())
                this.box.removeChild(this.box.lastChild);
            this.box.scrollTop = 0;

            // render all items
            var list = document.createElement('ul');
            var lastItm = document.createElement('li');
            lastItm.className = 'itmlast';
            lastItm.style.display = 'none';
            list.appendChild(lastItm);
            $(this.box)
                .attr('name', this.name)
                .addClass('w2ui-reset w2ui-listview w2ui-' + this.viewType())
                .append(list);
            this.lastItm = lastItm;
            this.refresh();
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return (new Date()).getTime() - time;
        },

        destroy: function () {
            // event before
            var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });
            if (eventData.isCancelled === true) return;
            // clean up
            if (this.box) {
                this.lastItm = null;
                $(this.box)
                    .empty()
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-listview w2ui-icon-small w2ui-icon-medium w2ui-icon-large w2ui-icon-tile w2ui-table');
            }
            delete w2ui[this.name];
            // event after
            this.trigger($.extend(eventData, { phase: 'after' }));
            return true;
        }
    };

    $.extend(w2listview.prototype, w2utils.event);
    w2obj.listview = w2listview;
})(jQuery);
