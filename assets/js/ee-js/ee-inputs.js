// INPUT JS
$(function () {  
  initInput(inputs);  
});

var inputs = $('.ee-input input, .ee-input textarea'); 

function initInput (inputs) {
  inputs.each(function() {
    if ($(this).val() != '') { 
      var input_id = $(this).attr('id');
      $('label[for="'+input_id+'"]').addClass('active');
    }
  });
  $('.ee-input:has(label)').addClass('ee-input-has-label');
}

inputs.focus(function() {
  var input_id = $(this).attr('id');
  $('label[for="'+input_id+'"]').addClass('active');
});
inputs.blur(function() {
  if ($(this).val() == '') { 
    var input_id = $(this).attr('id');
    $('label[for="'+input_id+'"]').removeClass('active');
  }
});
