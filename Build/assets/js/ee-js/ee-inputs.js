// INPUT JS
$(function () {
  $('.ee-input input, .ee-input textarea').each(function() {
    if ($(this).val() != '') { 
      var input_id = $(this).attr('id');
      $('label[for="'+input_id+'"]').addClass('active');
    }
  });
  $('.ee-input:has(label)').not('.input-group .ee-input:has(label)').addClass('ee-input-has-label');
});
$('.ee-input input, .ee-input textarea').focus(function() {
  var input_id = $(this).attr('id');
  $('label[for="'+input_id+'"]').addClass('active');
});
$('.ee-input input, .ee-input textarea').blur(function() {
  if ($(this).val() == '') { 
    var input_id = $(this).attr('id');
    $('label[for="'+input_id+'"]').removeClass('active');
  }
});