

/*
TSR - ATTENTION
*/ 


;(function(document,$) {


    window.tsrAttention = window.tsrAttention || {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrAttention.tsrInit = function() {
       
         tsrAttention.tsrClose();
         tsrAttention.tsrFireOnce(tsrAttention.tsrCheckWidth, 600); 

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Close
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrAttention.tsrClose = function () {


	    $('.tsr-section-attention .tsr-attention-close').each(function () {

	        var elem = $(this);
	    
	        elem.on('click',function () {

	            var el = $(this);
	            var elParent = el.closest('.tsr-section-attention');

				elParent.remove();

				// Cookie event

	            return false;
	        });


	    });

    };

  
/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Check width
/////////////////////////////////////////////////////////////////////////////////////////////////////////



    tsrAttention.tsrCheckWidth = function () {

 		$('.tsr-section-attention').each(function () {

 				var bw = $('body').width();
	            var el = $(this);
	            var elText = el.find('.tsr-attention-text');
	            var elLinkWidth = el.find('.tsr-attention-readMore').outerWidth();
	            var elCloseWidth = el.find('.tsr-attention-close').outerWidth();

		            if(bw >= 600){
		            		var elTextPaddinRight = elLinkWidth + elCloseWidth;
							elText.css('padding-right', elTextPaddinRight); 
		            } else {		            	

		            		if(el.hasClass('tsr-secondaryAlert')){
		            			elText.css('padding-right', 10); 			
		            		} else {
		            			var elTextPaddinRight = elCloseWidth;
		            			elText.css('padding-right', elTextPaddinRight); 
		            		}

		            }

	    });

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Fire function once
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	var tsrAlertOnce1 = false;
    var tsrAlertOnce2 = false;

    tsrAttention.tsrFireOnce = function (func, breakpoint) {
	         		
	         		var bw = $('body').width();
	            
		            if(bw >= breakpoint){
		            	tsrAlertOnce2 = false;
		            	if(!tsrAlertOnce1){
		            		tsrAlertOnce1 = true;
		            		func();
		            	}						 
		            } else {
		            	tsrAlertOnce1 = false;
		            	if(!tsrAlertOnce2){
		            		tsrAlertOnce2 = true;
		            		func();
		            	}
		            }

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Ready
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('ready', function(){

        tsrAttention.tsrInit();
      
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
  		tsrAttention.tsrFireOnce(tsrAttention.tsrCheckWidth, 600); 
	});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////

