$(document).ready(function () {
  BindInputsLabels(); //nii saame epoe poolel seda välja kutsuda ajax puhul
});

function BindInputsLabels() {
  var inputs = $('.ee-input input, .ee-input textarea');
  initInput(inputs);

  inputs.focus(function () {
    var input_id = $(this).attr('id');
    $('label[for="' + input_id + '"]').addClass('active');
  });
  inputs.blur(function () {
    if ($(this).val() == '') {
      var input_id = $(this).attr('id');
      $('label[for="' + input_id + '"]').removeClass('active');
    }
  });
}

function initInput (inputs) {
  inputs.each(function() {
    if ($(this).val() != '') { 
      var input_id = $(this).attr('id');
      $('label[for="'+input_id+'"]').addClass('active');
    }
  });
  $('.ee-input:has(label)').addClass('ee-input-has-label');
}
