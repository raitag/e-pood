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
    tsrCompare.tsrEqualHeightsHeaders();
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
  ////// TSR - Equal heights for header h6
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
 tsrCompare.tsrEqualHeightsHeaders = function () {

   $('.js-datawrapper').each(function () {

    var headerEl   = $('.compare-value h6').not('.sticky');


    if(Modernizr.mq('only screen and (min-width: 768px)')) {
      $(headerEl , this).css('height', 'auto').setAllToMaxHeight()﻿;
    }
    else {
      $(headerEl , this).css('height', 'auto');
    }
    
  });

 };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// TSR - row height - 
  ///// Counts row height in case one value is significally longer
  ///////////////////////////////////////////////////
  tsrCompare.tsrEqualHeights = function () {

    $('.js-datawrapper', this).each(function () {

      var el          = $(this).not('.sticky');
      var elHeight  = el.find('.compare-value').height();

      if(Modernizr.mq('only screen and (min-width: 768px)')) {
        el.css('max-height',  'auto');
      }
      else {
        el.css('max-height', elHeight + 20 );
      }
    });

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
        $('.ee-count-' + productcount).css('width', half);
      }
      
    }

  }; // end functions
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// Ready
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  $(document).on('ready', function () {

    tsrCompare.tsrInit(); // call previous functions

    // navbar toggle
    $('#toggleParam').click(function() {
      $('.js-subpanel').collapse('toggle');
    });


  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// Resize
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  // jquery.debouncing.js, thanks Paul Irish

  $(window).smartresize(function () {

    tsrCompare.tsrEqualHeights();
    tsrCompare.tsrEqualHeightsHeaders();

  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// actiom events
  ///////////////////////////////////////////////////////////////////////////////

  // sticky header if scrolled
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $('.comparision-header').addClass("sticky container xs-not-padded");
    }
    else {
      $('.comparision-header').removeClass("sticky container xs-not-padded");
    }
  });



// next-and-prev-buttons on mobile, depends on scrollto plugin
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
