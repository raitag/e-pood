$(document).ready(function(){
  $('.ee-sidenav li  a').click(function(e){
    if ($(this).attr('class') != 'selected'){
      $(this).addClass('selected');
      $('a').not(this).removeClass('selected');
    }
    else {
      $(this).removeClass('selected');
    }
    e.preventDefault();
  });
});
