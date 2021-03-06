define([
  'app',
  'social',
  'slider',
  'rating',
  'carousel',
  'bstabs',
  'forms'
  ], function (app, social, slider, rating, carousel, bstabs, forms) {

    //upper rotator
    // *************
    $( document ).ready(function() {
      $('.js-imagerotator').flexslider({
        animation: "slide",
        controlNav: "thumbnails",
        itemMargin: 40,
        slideshow: false,
        maxItems: 4
      });

    // Large images
    //***************
      // Vimeo API nonsense
      var player = document.getElementById('player_1');
      $f(player).addEvent('ready', ready);
     
      function addEvent(element, eventName, callback) {
        if (element.addEventListener) {
          element.addEventListener(eventName, callback, false);
        } else {
          element.attachEvent(eventName, callback, false);
        }
      }
     
      function ready(player_id) {
        var froogaloop = $f(player_id);
        froogaloop.addEvent('play', function(data) {
          $('.flexslider').flexslider("pause");
        });
        froogaloop.addEvent('pause', function(data) {
          $('.flexslider').flexslider("play");
        });
      }
     
     
      // Call fitVid before FlexSlider initializes, so the proper initial height can be retrieved.
      $(".flexslider")
        .fitVids()
        .flexslider({
          animation: "slide",
          useCSS: false,
          animationLoop: true,
          slideshow: false,

          itemWidth: 500,
          itemMargin: 0,
          before: function(slider){
            $f(player).api('pause');
          }
      });
    });

  // Sliding commenting
  //*********************
  $('.js-slidetoggle').click(function(e) {
    $(this).parents().next('.js-togglable').slideToggle('slow');
    e.preventDefault();
  });


});