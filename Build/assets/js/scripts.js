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
    $('#collapsibleMainMenu-Basket').html( $('.collapsibleMainMenu-Basket').clone(true,true) );
    $('#collapsibleMainMenu-Guide').html( $('.collapsibleMainMenu-Guide').clone() );
    
    var _el = $('#collapsibleMainMenu-Pages').find('.navbar-nav').eq(1).find('li').eq(3);
}

function collapseInOneForDetail(){
  $('.js-linkicon a').on('click',function(e){
    if($(this).parents('.panel').children('.panel-collapse').hasClass('in')){
        e.preventDefault();
        e.stopPropagation();
      }
  });
}

$('.btn-js-action').click(function(e) {
  e.preventDefault();
  var step = $(this).data('view');
  $('.'+step).show().siblings('div.step').hide();
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
