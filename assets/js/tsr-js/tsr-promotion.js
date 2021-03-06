
/*
TSR - PROMOTION
*/ 


;(function(document,$) {


    window.tsrPromotion = window.tsrPromotion || {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrPromotion.tsrInit = function() {
       
        tsrPromotion.tsrItemCount();
        tsrPromotion.tsrEqualHeights();

    };

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Thanks Paul Irish
	$.fn.setAllToMaxHeight = function(){
		return this.height( Math.max.apply(this, $.map( this , function(e){ return $(e).height() }) ) );
	}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrPromotion.tsrEqualHeights = function () {


	    $('.tsr-section-promotion').each(function () {

            var bw = $('body').width();
	        var el = $(this);

            if(bw >= 480){

                $('p', this).css('height', 'auto').setAllToMaxHeight()﻿;
                $('h6', this).css('height', 'auto').setAllToMaxHeight()﻿;

            } else {

                $('p', this).css('height', 'auto');
                $('h6', this).css('height', 'auto')﻿;
 
            } 

	      	
	    });

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Item count
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrPromotion.tsrItemCount = function () {

        $('.tsr-section-promotion .tsr-container').each(function () {

            var el = $(this);
            var elCount =  el.children().size();

            el.parent().addClass('tsr-count-' + elCount);

        });

    };

  

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Ready
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('ready', function(){

        tsrPromotion.tsrInit();
      
    });

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Resize
/////////////////////////////////////////////////////////////////////////////////////////////////////////


	// jquery.debouncing.js, thanks Paul Irish

    $(window).smartresize(function(){
  		tsrPromotion.tsrEqualHeights();
	});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////

