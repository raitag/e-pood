/*
TSR - PRODUCT AND SERVICE LISTING
*/

;(function(document,$) {


  window.tsrProductAndServiceListing = window.tsrProductAndServiceListing || {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////


tsrProductAndServiceListing.tsrInit = function() {
 
  tsrProductAndServiceListing.tsrEqualHeights();

};


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Thanks Paul Irish
  $.fn.setAllToMaxHeight = function(){
    return this.height( Math.max.apply(this, $.map( this , function(e){ return $(e).height(); }) ) );
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

tsrProductAndServiceListing.tsrEqualHeights = $(window).load(function () {


 $('.tsr-section-productAndService-listing').each(function () {

  var bw = $('body').width();
  var el = $(this);

  if(bw >= 400){
   
        // Service 
        $('.tsr-service-desc' , this).css('height', 'auto').setAllToMaxHeight()﻿;
        $('.tsr-service-price' , this).css('height', 'auto').setAllToMaxHeight()﻿;
        $('.tsr-service-header', this).css('height', 'auto').setAllToMaxHeight()﻿;

        // Product 
        $('.tsr-product-image', this).css('height', 'auto').setAllToMaxHeight()﻿;
        $('.ee-category-header', this).css('height', 'auto').setAllToMaxHeight()﻿;
       $('.tsr-product-header', this).css('height', 'auto').setAllToMaxHeight()﻿;
       $('.tsr-product-colors', this).css('height', 'auto').setAllToMaxHeight()﻿;
       $('.tsr-product-desc' , this).css('height', 'auto').setAllToMaxHeight()﻿;
       $('.tsr-product-price' , this).css('height', 'auto').setAllToMaxHeight()﻿;
       $('.tsr-product-small-print' , this).css('height', 'auto').setAllToMaxHeight()﻿;
       $('.nav-stacked' , this).css('height', 'auto').setAllToMaxHeight()﻿;

     } else {

          // Service 
         $('.tsr-service-desc' , this).css('height', 'auto');
         $('.tsr-service-price' , this).css('height', 'auto');
         $('.tsr-service-header', this).css('height', 'auto');
         
        // Product 
        $('.tsr-product-image', this).css('height', 'auto');
        $('.ee-category-header', this).css('height', 'auto');
        $('.tsr-product-header', this).css('height', 'auto');
        $('.tsr-product-colors', this).css('height', 'auto');
        $('.tsr-product-desc' , this).css('height', 'auto');
        $('.tsr-product-price' , this).css('height', 'auto');
        $('.tsr-product-small-print' , this).css('height', 'auto');
        $('.nav-stacked' , this).css('height', 'auto');
        
      }

    });

});



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Ready
/////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('ready', function(){

  tsrProductAndServiceListing.tsrInit();
  
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Scroll
/////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('scroll', function(){
  
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Resize
/////////////////////////////////////////////////////////////////////////////////////////////////////////


  // jquery.debouncing.js, thanks Paul Irish

  $(window).smartresize(function(){
    tsrProductAndServiceListing.tsrEqualHeights();  
  });

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////

