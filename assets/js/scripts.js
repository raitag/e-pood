$(document).ready(function() {

BindSlideToggle();
cloneRightSideMainMenu();
 
// COLLAPSE TABS
// https://github.com/okendoken/bootstrap-tabcollapse
  $('#TabsResponsive').tabCollapse();

  // FILTER COLOR CHANGE
  $('#content-placeholder-filter > div > ul > li > a').click(function(e){
    if ($(this).attr('class') != 'disabled'){
      $(this).addClass('disabled');
      $('a').not(this).removeClass('disabled');
    }
    else {
      $(this).removeClass('disabled');
    }
    e.preventDefault();
  });

$('.dropdown-menu').find('form').click(function (e) {
        e.stopPropagation();
      });

$('#toggleParam').click(function() {
  $('.js-subpanel').collapse('toggle');
});

$(".jsShowMoreCategories").unbind("click").click(function () {
 if ($(this).hasClass("moretext")) {
  $(".jsShowMoreCategories span").html($(this).data("lesstext"));
   $(this).removeClass("moretext");
 } else {
   $(".jsShowMoreCategories span").html($(this).data("moretext"));
   $(this).addClass("moretext");
 }
});

}); // end document ready

function BindSlideToggle() {
 $('.js-slidetoggle').click(function (e) {
  $(this).parents().next('.js-togglable').slideToggle('slow');
  e.preventDefault();
 });
}


function cloneRightSideMainMenu(){
    $('#collapsibleMainMenu-Search').html( $('.collapsibleMainMenu-Search').clone() );
    $('#collapsibleMainMenu-Basket').html( $('.collapsibleMainMenu-Basket').clone() );
    $('#collapsibleMainMenu-Guide').html( $('.collapsibleMainMenu-Guide').clone() );
    
    var _el = $('#collapsibleMainMenu-Pages').find('.navbar-nav').eq(1).find('li').eq(3);
}

// Plus-minus buttons
//plugin bootstrap minus and plus
//http://jsfiddle.net/laelitenetwork/puJ6G/
$('.btn-number').click(function(e){
    e.preventDefault();
    
    fieldName = $(this).attr('data-field');
    type      = $(this).attr('data-type');
    var input = $("input[name='"+fieldName+"']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if(type == 'minus') {
            
            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            } 
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {

            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
});
$('.input-number').focusin(function(){
   $(this).data('oldValue', $(this).val());
});
$('.input-number').change(function() {
    
    minValue =  parseInt($(this).attr('min'));
    maxValue =  parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());
    
    name = $(this).attr('name');
    if(valueCurrent >= minValue) {
        $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    if(valueCurrent <= maxValue) {
        $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    
    
});
$(".input-number").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) || 
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });




// counting rules for IE 8-9 as the limit is 4095
// function countCSSRules() {
//     var results = '',
//         log = '';
//     if (!document.styleSheets) {
//         return;
//     }
//     for (var i = 0; i < document.styleSheets.length; i++) {
//         countSheet(document.styleSheets[i]);
//     }
//     function countSheet(sheet) {
//         var count = 0;
//         if (sheet && sheet.cssRules) {
//             for (var j = 0, l = sheet.cssRules.length; j < l; j++) {
//                 if( !sheet.cssRules[j].selectorText ) {
//                     continue;
//                 }
//                 count += sheet.cssRules[j].selectorText.split(',').length;
//             }

//             log += '\nFile: ' + (sheet.href ? sheet.href : 'inline <style> tag');
//             log += '\nRules: ' + sheet.cssRules.length;
//             log += '\nSelectors: ' + count;
//             log += '\n--------------------------';
//             if (count >= 4096) {
//                 results += '\n********************************\nWARNING:\n There are ' + count + ' CSS rules in the stylesheet ' + sheet.href + ' - IE will ignore the last ' + (count - 4096) + ' rules!\n';
//             }
//         }
//     }
//     console.log(log);
//     console.log(results);
// };
// countCSSRules();
