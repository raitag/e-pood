// select
$(function () {
  $('select').material_select();
});

$.fn.material_select = function (callback) {
  $(this).each(function(){
    $select = $(this);
    if ( $select.hasClass('browser-default') || $select.hasClass('initialized')) {
      return;
    }

    var uniqueID = guid();
    var wrapper = $('<div class="select-wrapper"></div>');
    var options = $('<ul id="select-options-' + uniqueID+'" class="dropdown-content select-dropdown"></ul>');
    var selectOptions = $select.children('option');
    if ($select.find('option:selected') !== undefined) {
      var label = $select.find('option:selected');
    }
    else {
      var label = options.first();
    }

    selectOptions.each(function () {
      options.append($('<li class="' + (($(this).is(':disabled')) ? 'disabled' : '') + '"><span>' + $(this).html() + '</span></li>'));
    });


    options.find('li').each(function (i) {
      var $curr_select = $select;
      $(this).click(function () {
        if (!$(this).hasClass('disabled')) {
          $curr_select.find('option').eq(i).prop('selected', true);
          $curr_select.trigger('change');
          $curr_select.prev('span.select-dropdown').html($(this).text());
          if (typeof callback !== 'undefined') callback();
        }
      });

    });

    $select.wrap(wrapper);
    var $newSelect = $('<span class="select-dropdown ' + (($select.is(':disabled')) ? 'disabled' : '')
      + (($select.hasClass('has-error')) ? 'has-error' : '') + '" data-activates="select-options-' + uniqueID +'">' + label.html() + '</span>');
    $select.before($newSelect);
    $('body').append(options);
    if (!$select.is(':disabled')) {
      $newSelect.dropdown({"hover": false});
    }
    $select.addClass('initialized');

  });
}

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
  };
})();

$.fn.dropdown = function (options) {
  var defaults = {
    inDuration: 300,
    outDuration: 225,
    constrain_width: true,
    hover: true
  }

  options = $.extend(defaults, options);
  this.each(function(){
    var origin = $(this);

    var activates = $("#"+ origin.attr('data-activates'));

    if ( !(activates.parent().is($('body'))) ) {
      activates.detach();
      $('body').append(activates);
    }

    function placeDropdown() {
      var dropdownRealHeight = activates.height();
      if (options.constrain_width === true) {
        activates.css('width', origin.outerWidth());
      }
      if (elementOrParentIsFixed(origin[0])) {
        activates.css({
          display: 'block',
          position: 'fixed',
          height: 0,
          top: origin.offset().top - $(window).scrollTop(),
          left: origin.offset().left
        });
      }
      else {
        activates.css({
          display: 'block',
          top: origin.offset().top,
          left: origin.offset().left,
          height: 0
        });
      }
      activates.velocity({opacity: 1}, {duration: options.inDuration, queue: false, easing: 'easeOutQuad'})
      .velocity(
      {
        height: dropdownRealHeight
      },
      {duration: options.inDuration,
        queue: false,
        easing: 'easeOutCubic',
        complete: function(){
          activates.css('overflow-y', 'auto')
        }
      });
    }
    function elementOrParentIsFixed(element) {
      var $element = $(element);
      var $checkElements = $element.add($element.parents());
      var isFixed = false;
      $checkElements.each(function(){
        if ($(this).css("position") === "fixed") {
          isFixed = true;
          return false;
        }
      });
      return isFixed;
    }

    if (options.hover) {

      origin.on('mouseover', function(e){
        placeDropdown();
      });

      activates.on('mouseleave', function(e){
        activates.velocity(
        {
          opacity: 0
        },
        {
          duration: options.outDuration,
          easing: 'easeOutQuad',
          complete: function(){
            activates.css({
              display: 'none',
              'overflow-y': ''
            });
          }
        });
      });

    } else {
      var open = false;

      origin.click( function(e){
        e.preventDefault();
        e.stopPropagation();
        placeDropdown();
        $(document).bind('click.'+ activates.attr('id'), function (e) {
          if (!activates.is(e.target) && (!origin.is(e.target))) {
            activates.velocity({
              opacity: 0
            },
            {
              duration: options.outDuration,
              easing: 'easeOutQuad',
              complete: function(){
                activates.css({
                  display: 'none',
                  'overflow-y': ''
                });
              }
            });
            $(document).unbind('click.' + activates.attr('id'));
          }
        });
      });

    }

    $(document).on('resize', function(){

    });
  });
};
