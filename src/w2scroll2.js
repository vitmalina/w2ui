/************************************************
*	Custom scroll for Desktop and Mobile
*
***/

!function () {

	var w2view = function (options) {
		this.box		= null;
		this.posY		= 0;
		this.maxY 		= 0;
		this.barYPos	= 0;
		this.barYSize	= 0;
		$.extend(true, this, options);
	}

	var w2scroll = function (options) {
		this.box 		= null;
		this.current	= 0;		// current view
		this.views		= []; 		// can be one or many, if many then they are swipable
		this.width		= 0;		// size of the viable area
		this.height 	= 0;
		$.extend(true, this, options);
	}

	$.fn.w2scroll = function (method) {
		var params = arguments;
		// execute method
		if (typeof method == 'string') {
			this.each(function (index, el) {
				var obj = $(el).data('w2scroll');
				if (!obj) {
					console.log("ERROR: The w2scroll was not initialized on this element.");
					return;
				}
				obj[method].apply(obj, Array.prototype.slice.call(params, 1));
			});
		} else { // init
			this.each(function (index, el) {
				var options = {};
				if (typeof method == 'object' && !method) options = method;
				var obj = new w2scroll(options);
				obj.box = el;
				obj.init();
				$(el).data('w2scroll', obj);
			});
		}
	}

	// ====================================================
	// -- Implementation of core functionality

	w2scroll.prototype = {

		init: function () {
			var obj      = this;
			var children = $(this.box).children();

			this.width	 = parseInt($(this.box).width()); // w2utils.getSize($(this.box), 'width');
			this.height	 = parseInt($(this.box).height()); // w2utils.getSize($(this.box), 'height');

			// make sure overlofw is hidden when scrolled
			$(this.box).css('overflow', 'hidden');
			if ($(this.box).css('position') == 'static') $(this.box).css('position', 'relative');

			// init swipable views
			if ($(this.box).find('div').length == $(this.box).children().length) {
				// if there are only div - assume they are swipable
				$(this.box).find('div').each(function (index, el) {
					var view = new w2view({ box: el })
					obj.views.push(view);
					if ($(el).hasClass('current')) obj.current = obj.views.length - 1;
					$(el).css({
						width 	: obj.width + 'px',
						height_	: obj.height + 'px'
					});
				});
				if (!obj.current) this.current = 0;
				$(obj.views[obj.current].box).addClass('current').show();
			} else {
				// if not, move to one swipable area
				$(this.box).prepend('<div class="w2scroll-view"></div>');
				$(this.box).find('div.w2scroll-view').append(children);
				this.views.push(new w2view({ box: $(this.box).find('div.w2scroll-view') }));
				this.current = 0;
			}

			// insert scroll bars
			$(this.box).css({ overflow: 'hidden' }).prepend(
				'<div class="w2scroll">'+
				'	<div class="w2scroll-track"></div>'+
				'	<div class="w2scroll-bar"></div>'+
				'</div>');

			// padding adjustment
			var bar   = $(this.box).find('div.w2scroll div.w2scroll-bar');
			var track = $(this.box).find('div.w2scroll div.w2scroll-track');
			bar.css('margin-top', (parseInt(bar.css('margin-top')) - parseInt($(this.box).css('padding-top'))) + 'px');
			bar.css('margin-left', (parseInt(bar.css('margin-left')) + parseInt($(this.box).css('padding-right'))) + 'px');
			track.css('margin-top', (parseInt(track.css('margin-top')) - parseInt($(this.box).css('padding-top'))) + 'px');
			track.css('margin-left', (parseInt(track.css('margin-left')) + parseInt($(this.box).css('padding-right'))) + 'px');
			track.height(($(this.box).height() + parseInt($(this.box).css('padding-top')) + parseInt($(this.box).css('padding-bottom')) ) + 'px');

			// init events (not through jquery because some event properties are not passed)
			this.box.addEventListener('mousewheel', wheel, false);
			this.box.addEventListener('DOMMouseScroll', wheel, false);

			// disable global touch move
			document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false); // prevent default scroll 

			this.refresh();
			console.log(this);
			return;

			function wheel(event) {
				var view = obj.views[obj.current];
				// vertical
				view.posY -= Math.round(event.wheelDeltaY * 0.25); // slow down scroll to match mac osx
				obj.refresh();
				// horizontal
				// ...
				event.stopPropagation();
				event.preventDefault();
			}			
		},

		refresh: function (time) {
			if (!time) time = 0;

			var view 		= this.views[this.current];
			var track 		= $(this.box).find('div.w2scroll div.w2scroll-track');
			var maxBarSize 	= this.height + parseInt($(this.box).css('padding-top')) + parseInt($(this.box).css('padding-bottom')) - 4; 

			view.maxY 	  = w2utils.getSize($(view.box), 'height') 
				- this.height + parseInt($(this.box).css('padding-top')) + parseInt($(this.box).css('padding-bottom'));
			view.barYSize = Math.floor( (this.height * this.height) /  w2utils.getSize($(view.box), 'height') );

			if (view.maxY < 0) view.maxY = 0;
			if (view.posY < 0) view.posY = 0;
			if (view.posY > view.maxY) view.posY = view.maxY;
			if (view.barYSize < 10) view.barYSize = 10;
			if (view.barYSize > maxBarSize) view.barYSize = maxBarSize;

			// move view
			$(view.box).css({ 
				'-webkit-transition' 	: time + 's',
				'-webkit-transform' 	: 'translate3d(0px, -'+ view.posY +'px, 0px)'
			});

			// move bar
			view.barYPos = Math.floor( (track.height() - view.barYSize - 2) * view.posY / view.maxY );
			if (view.barYPos < 2) view.barYPos = 2;
			$(this.box).find('div.w2scroll div.w2scroll-bar').css({ 
				'-webkit-transition' 	: time + 's',
				top 					: view.barYPos + 'px', 
				height 					: view.barYSize + 'px' 
			});
		},

		moveNext: function () {
			var obj   = this;
			var width = w2utils.getSize($(obj.box), 'width');
			if ($(obj.sdata.next).length == 0) return;

			$(obj.sdata.curr).show().css({ 'left' : '0px', 'top' : '0px'	});
			$(obj.sdata.next).show().css({ 'left' : parseInt(w2utils.getSize($(obj.box), 'width')) + 'px', 'top' : '0px' });
			setTimeout(function () {
				$(obj.sdata.curr).css({
					'-webkit-transition' 	: 'all .2s ease-in-out',
					'-webkit-transform' 	: 'translate3d(-'+ width +'px, 0px, 0px)'
				});
				$(obj.sdata.next).show().css({
					'-webkit-transition' 	: 'all .2s ease-in-out',
					'-webkit-transform' 	: 'translate3d(-'+ width +'px, 0px, 0px)'
				});
			}, 1);
			setTimeout(function () {
				$(obj.sdata.curr).hide();
				$(obj.sdata.curr).removeClass('current');
				$(obj.sdata.next).addClass('current');
				// -- 
				$.extend(obj.sdata, {
					curr 	: $(obj.box).find('.swipe.current'),
					prev 	: $(obj.box).find('.swipe.current').prev('.swipe'),
					next 	: $(obj.box).find('.swipe.current').next('.swipe')
				});
				obj.sdata.curr.show();
				obj.refresh();
			}, 250);
		},

		movePrev: function () {
			var obj   = this;
			var width = w2utils.getSize($(obj.box), 'width');
			if ($(obj.sdata.prev).length == 0) return;

			$(obj.sdata.curr).show().css({ 'left' : '0px', 'top' : '0px' });
			$(obj.sdata.prev).show().css({ 'left' : '-' + parseInt(w2utils.getSize($(obj.box), 'width')) + 'px', 'top' : '0px' });
			setTimeout(function () {
				$(obj.sdata.curr).css({
					'-webkit-transition' 	: 'all .2s ease-in-out',
					'-webkit-transform' 	: 'translate3d('+ width +'px, 0px, 0px)'
				});
				$(obj.sdata.prev).css({
					'-webkit-transition' 	: 'all .2s ease-in-out',
					'-webkit-transform' 	: 'translate3d('+ width +'px, 0px, 0px)'
				});
			}, 1);

			setTimeout(function () {
				$(obj.sdata.curr).hide();
				$(obj.sdata.curr).removeClass('current');
				$(obj.sdata.prev).addClass('current');
				// --
				$.extend(obj.sdata, {
					curr 	: $(obj.box).find('.swipe.current'),
					prev 	: $(obj.box).find('.swipe.current').prev('.swipe'),
					next 	: $(obj.box).find('.swipe.current').next('.swipe')
				});
				obj.sdata.curr.show();
				obj.refresh();
			}, 250);
		}		
	}	
}();
