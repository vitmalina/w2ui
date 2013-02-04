!function () {
	var w2scroll = function (options) {
		this.box 		= null;
		//this.view 		= null;
		this.posY 		= 0;
		this.maxY 		= 0;
		this.barYSize	= 20;
		this.barYPos 	= 0;
		this.sdata		= {};
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
				obj.init(el);
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

			// insert scroll bars
			$(this.box)
				.css({ overflow: 'auto', '-webkit-overflow-scrolling': 'touch'})
				.prepend('<div class="w2scroll">'+
						 '	<div class="w2scroll-track"></div>'+
						 '	<div class="w2scroll-bar"></div>'+
						 '</div>'+
						 '<div class="w2scroll-view"></div>');

			// padding adjustment
			var bar   = $(this.box).find('div.w2scroll div.w2scroll-bar');
			var track = $(this.box).find('div.w2scroll div.w2scroll-track');
			bar.css('margin-top', (parseInt(bar.css('margin-top')) - parseInt($(this.box).css('padding-top'))) + 'px');
			bar.css('margin-left', (parseInt(bar.css('margin-left')) + parseInt($(this.box).css('padding-right'))) + 'px');
			track.css('margin-top', (parseInt(track.css('margin-top')) - parseInt($(this.box).css('padding-top'))) + 'px');
			track.css('margin-left', (parseInt(track.css('margin-left')) + parseInt($(this.box).css('padding-right'))) + 'px');
			track.height(($(this.box).height() + parseInt($(this.box).css('padding-top')) + parseInt($(this.box).css('padding-bottom')) ) + 'px');

			// insert all children - cannot have text nodes
			$(this.box).find('div.w2scroll-view').append(children);

			// init events (not through jquery because some event properties are not passed)
			this.box.addEventListener('mousewheel', wheel, false);
			this.box.addEventListener('DOMMouseScroll', wheel, false);

			// init swipe events
			var obj 	= this;
			this.sdata  = {
				currX   : null,
				currY   : null,
				posX 	: null,
				posY 	: null,
				divX 	: null,
				divY 	: null,
				timer 	: null,
				timer2  : null,
				lastX	: null,
				lastY	: null,
				status  : null,
				curr 	: $(this.box).find('.swipe.current'),
				prev 	: $(this.box).find('.swipe.current').prev('.swipe'),
				next 	: $(this.box).find('.swipe.current').next('.swipe')
			};
			$(this.box).find('.swipe').width(w2utils.getSize($(this.box), 'width')).css('overflow', 'hidden');
			this.sdata.curr.show();

			this.box.addEventListener('touchstart', touchStart, false);
			this.box.addEventListener('touchend',   touchEnd, false);
			this.box.addEventListener('touchmove',  touchMove, false);

			// disable global touch move
			document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false); // prevent default scroll 

			this.refresh();
			return;

			function wheel(event) {
				// vertical
				obj.posY -= Math.round(event.wheelDeltaY * 0.25); // slow down scroll to match mac osx
				obj.refresh();
				// horizontal

				event.stopPropagation();
				event.preventDefault();
			}

			function touchStart (e) {
				obj.sdata.timer = (new Date()).getTime();
				obj.sdata.posX = obj.posX;
				obj.sdata.posY = obj.posY;
				// calculate momentum
				spanTimer();
				obj.sdata.timer2 = setInterval(spanTimer, 50);
				function spanTimer () {
					obj.sdata.lastX = obj.posX; 
					obj.sdata.lastY = obj.posY; 
				}
			}

			function touchMove(e) {
			 	var touch = e.touches[0];
			 	if (obj.sdata.currX == null) { obj.sdata.currX = touch.pageX; }
			 	if (obj.sdata.currY == null) { obj.sdata.currY = touch.pageY; }
			 	obj.sdata.divX = touch.pageX - obj.sdata.currX;
			 	obj.sdata.divY = touch.pageY - obj.sdata.currY;

			 	if (obj.sdata.status == null) {
				 	if (obj.sdata.divY >  5) obj.sdata.status = 'swipe-scroll';
				 	if (obj.sdata.divY < -5) obj.sdata.status = 'swipe-scroll';
				 	if (obj.sdata.divX >  5) obj.sdata.status = 'swipe-right';
				 	if (obj.sdata.divX < -5) obj.sdata.status = 'swipe-left';
				 }

			 	if (obj.sdata.status == 'swipe-left' || obj.sdata.status == 'swipe-right') {
					var divX = obj.sdata.divX;
					//console.log('swipe: ' + divX);
					var factor = 1;
					if (divX > 0 && obj.sdata.prev.length == 0) factor = 3;
					if (divX < 0 && obj.sdata.next.length == 0) factor = 3;
					// current
					$(obj.sdata.curr).css({
						'left' 	: '0px',
						'top' 	: '0px',
						'-webkit-transition' 	: 'none',
						'-webkit-transform' 	: 'translate3d('+ (divX/factor) +'px, 0px, 0px)'
					});
					if (divX < 0 && $(obj.sdata.next).length > 0) { // move left
						$(obj.sdata.next).css({
							'left' 	: parseInt(w2utils.getSize($(obj.box), 'width')) + 'px',
							'top' 	: '0px',
							'-webkit-transition' 	: 'none',
							'-webkit-transform' 	: 'translate3d('+ divX +'px, 0px, 0px)'
						}).show();
					}
					if (divX > 0) { // move right
						$(obj.sdata.prev).css({
							'left' 	: '-' + parseInt(w2utils.getSize($(obj.box), 'width')) + 'px',
							'top' 	: '0px',
							'-webkit-transition' 	: 'none',
							'-webkit-transform' 	: 'translate3d('+ divX +'px, 0px, 0px)'
						}).show();
					}
				}
				if (obj.sdata.status == 'swipe-scroll') {
					obj.posY = obj.sdata.posY - obj.sdata.divY;
					obj.refresh();
				}
				if (obj.sdata.status != null) {
					e.stopPropagation();
					e.preventDefault();
				}
				// console.log(obj.sdata.status + ' divY:'+ obj.sdata.divY + ' divX:'+ obj.sdata.divX);
			}

			function touchEnd (e) {
				var span = (new Date()).getTime() - obj.sdata.timer;
				clearInterval(obj.sdata.timer2);
				obj.sdata.currX 	= null;
				obj.sdata.currY 	= null;
				var spanX = obj.posX - obj.sdata.lastX;
				var spanY = obj.posY - obj.sdata.lastY;
				//console.log(' span:'+ span + ' spanX:'+ spanX + ' spanY:'+ spanY);

				if (obj.sdata.status == 'swipe-scroll' && Math.abs(spanY) > 10) {
					//var direction = (spanY > 0 ? -1 : 1);
					obj.posY += spanY * 10;
					obj.refresh(0.5);
				}
				if (obj.sdata.status == 'swipe-left' && $(obj.sdata.next).length > 0 && ((obj.sdata.divX < -20 && span < 200) || (obj.sdata.divX < -60))) { // swipe left
					obj.sdata.divX 	 = null;
					obj.sdata.status = null;
					obj.moveNext();
					return;
				}
				if (obj.sdata.status == 'swipe-right' && $(obj.sdata.prev).length > 0 && ((obj.sdata.divX > 20 && span < 200) || (obj.sdata.divX > 60))) { // swipe right
					obj.sdata.divY 	 = null;
					obj.sdata.status = null;
					obj.movePrev();
					return;
				}
				if (obj.sdata.status == 'swipe-left' || obj.sdata.status == 'swipe-right') { // return to previous spots
					$(obj.sdata.curr).add(obj.sdata.next).add(obj.sdata.prev).css({
						'-webkit-transition' : 'all .2s ease-in-out',
						'-webkit-transform' : 'translate3d(0px, 0px, 0px)'
					});
				}
				obj.sdata.divX	 = null;
				obj.sdata.divY	 = null;
				obj.sdata.status = null;
			}
		},

		refresh: function(time) {
			if (!time) time = 0;			
			var view  		= $(this.box).find('div.w2scroll-view');
			// if (this.sdata.curr.length != 0) view = this.sdata.curr;

			var track 		= $(this.box).find('div.w2scroll div.w2scroll-track');
			var maxBarSize 	= parseInt($(this.box).height()) + parseInt($(this.box).css('padding-top')) + parseInt($(this.box).css('padding-bottom')) - 4; 

			this.maxY 		= view.height() - parseInt($(this.box).height()) + parseInt($(this.box).css('padding-top')) + parseInt($(this.box).css('padding-bottom'));
			this.barYSize	= Math.floor($(this.box).height() / (view.height() / $(this.box).height()));

			// if there are swipable pages
			if (this.sdata.curr.length != 0) {
				this.maxY = w2utils.getSize(this.sdata.curr, 'height') - w2utils.getSize(this.box, 'height');
			}

			if (this.maxY < 0) this.maxY = 0;
			if (this.posY < 0) this.posY = 0;
			if (this.posY > this.maxY) this.posY = this.maxY;
			if (this.barYSize < 10) this.barYSize = 10;
			if (this.barYSize > maxBarSize) this.barYSize = maxBarSize;
			console.log(this.maxY);

			// move view
			view.css({ 
				'-webkit-transition' 	: time + 's',
				'-webkit-transform' 	: 'translate3d(0px, -'+ this.posY +'px, 0px)'
			});
			// move bar
			this.barYPos = (track.height() - this.barYSize - 2) * this.posY / this.maxY;
			if (this.barYPos < 2) this.barYPos = 2;
			$(this.box).find('div.w2scroll div.w2scroll-bar').css({ 
				'-webkit-transition' 	: time + 's',
				top 					: this.barYPos + 'px', 
				height 					: this.barYSize + 'px' 
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
		},

		setY: function (y) {
			this.posY = y;
			this.refresh();
		},

		getY: function () {
			return this.posY;
		},

		destroy: function () {

		}
	}	
}();
