/*
TSR - SUPPORT
*/

; (function (document, $) {


	window.tsrCompare = window.tsrCompare || {};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	////// TSR - Init
	/////////////////////////////////////////////////////////////////////////////////////////////////////////


	tsrCompare.tsrInit = function () {

		tsrCompare.tsrItemCount();
		tsrCompare.tsrEqualHeights();
		tsrCompare.tsrItemWidth();

	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	////// TSR - Equal heights
	/////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Thanks Paul Irish
	$.fn.setAllToMaxHeight = function () {
		return this.height(Math.max.apply(this, $.map(this, function (e) { return $(e).height() })));
	}


	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	////// TSR - Equal heights
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	//     tsrCompare.tsrEqualHeights = function () {

	//         $('#content-placeholder-compare-data .js-datawrapper .fixwidth').each(function () {

	//             var el = $(this).not('.sticky');
	//             var elHeight = $('.fixwidth > .js-scrollable').height();

	//             $('h6' , this).css('height', 'auto').setAllToMaxHeight()﻿;
	//             $('.compare-value' , this).css('height', elHeight).setAllToMaxHeight()﻿;

	// console.log(this);
	//         });

	//     };




	tsrCompare.tsrEqualHeights = function () {


		var bw = $('body').width();



		$('#content-placeholder-compare-data ').each(function () {

			/////// Variables

			var el = $(this).not('.sticky');
			var elHeight = el.find('.compare-value').height();



			/////////////////////////////////////////////
			////// Check widths

			if (bw <= 767) {

				$('.js-datawrapper', this).each(function () {

					var el = $(this);
					var elHeight = el.find('.compare-value').height();

					el.css('max-height', elHeight + 20);

				}); // Each END

			} else {

				$('.js-datawrapper', this).each(function () {

					var el = $(this);
					el.css('max-height', 'auto');

				}); // Each END

			}



		}); // Each END



	}; // Func END


	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	////// TSR - Item count
	/////////////////////////////////////////////////////////////////////////////////////////////////////////

	tsrCompare.tsrItemCount = function () {

		$('.ee-product-compare  .fixwidth').each(function () {

			var el = $(this);
			var elCount = el.children().length;

			el.children().addClass('ee-count-' + elCount);

		});

	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////  EE - width is half the window
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	tsrCompare.tsrItemWidth = function () {
		var half = $('#content-placeholder-compare-data .panel-group').width() / 2;
		if (Modernizr.mq('only screen and (max-width: 768px)')) {
			if (half > 0) {
				var productcount = $(".jsCompareProduct").length;
				$('.ee-count-' + productcount).width(half);
			}
			
		}


	}
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	////// Ready
	/////////////////////////////////////////////////////////////////////////////////////////////////////////

	$(document).on('ready', function () {

		tsrCompare.tsrInit();


	});

	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	////// Resize
	/////////////////////////////////////////////////////////////////////////////////////////////////////////

	// jquery.debouncing.js, thanks Paul Irish

	$(window).smartresize(function () {

		tsrCompare.tsrEqualHeights();

	});


	// compare-page-sticky header
	$(window).scroll(function () {
		if ($(this).scrollTop() > 300) {
			$('.comparision-header').addClass("sticky");
		}
		else {
			$('.comparision-header').removeClass("sticky");
		}
	});
	var productcount = $(".jsCompareProduct").length;
	// sticky header with and centered position
	var new_width = $('#content-placeholder-compare-data .panel-group').width();
	var hidden_width = $('.ee-count-' + productcount).width() * productcount;

	if (Modernizr.mq('only screen and (min-width: 768px)')) {
		$('.sticky').width(new_width);
	}
	else {
		$('.sticky').width(hidden_width);
	}


	//http://jsfiddle.net/UaGjs/10/
	var next;
	$('.js-compare-next').click(function () {
		if (next === undefined) {
			next = $('.ee-count-' + productcount).next();
		} else {
			if (prev === undefined) {
				next = next.next();
			} else {
				next = prev.next();
				prev = undefined;
			}
		}
		var nextNext = next.next().next();
		if (!nextNext.length) {
			$('.js-compare-next').hide();
		} else {
			$('.js-compare-next').show();
		}
		$('.js-compare-prev').show();

		$(".js-datawrapper").scrollTo(next, 800, {
			margin: true
		});
		event.preventDefault();
	});


	var prev;
	$('.js-compare-prev').click(function () {
		if (prev === undefined) {
			if (next === undefined) {
				prev = $('.ee-count-' + productcount).prev();
			} else {
				prev = next.prev();
			}

		} else {
			prev = prev.prev();
		}

		var prevPrev = prev.prev().prev();

		if (!prevPrev.length) {
			$(".js-compare-prev").hide();
		} else {
			$(".js-compare-prev").show();
		}
		$('.js-compare-next').show();
		$(".js-datawrapper").scrollTo(prev, 800, {
			margin: true,
			limit: false
		});
		event.preventDefault();
	});


	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document, jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////
