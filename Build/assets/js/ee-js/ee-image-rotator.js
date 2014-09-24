// $( document ).ready(function() {
//   $('.js-imagerotator').flexslider({
//     animation: "slide",
//     controlNav: "thumbnails",
//     itemMargin: 40,
//     slideshow: false,
//     maxItems: 4
//   });

//     $("#js-largeimage")
//     .flexslider({
//       animation: "slide",
//       useCSS: false,
//       animationLoop: true,
//       slideshow: false,

//       itemWidth: 500,
//       itemMargin: 0,
//   });
// });
$(document).ready(function () {

  var slider, // Global slider value to force playing and pausing by direct access of the slider control
    canSlide = false; // Global switch to monitor video state

  // Load the YouTube API. For some reason it's required to load it like this
  var tag = document.createElement('script');
  tag.src = "//www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Setup a callback for the YouTube api to attach video event handlers
  window.onYouTubeIframeAPIReady = function () {
    // Iterate through all videos
    $('.flexslider iframe').each(function () {
      // Create a new player pointer; "this" is a DOMElement of the player's iframe
      var player = new YT.Player(this, {
        playerVars: {
          autoplay: 0
        }
      });

      // Watch for changes on the player
      player.addEventListener("onStateChange", function (state) {
        switch (state.data) {
          // If the user is playing a video, stop the slider
          case YT.PlayerState.PLAYING:
            slider.flexslider("stop");
            canSlide = false;
            break;
            // The video is no longer player, give the go-ahead to start the slider back up
          case YT.PlayerState.ENDED:
          case YT.PlayerState.PAUSED:
            slider.flexslider("play");
            canSlide = true;
            break;
        }
      });

      $(this).data('player', player);
    });
  };

  slider = $("#js-largeimage")
    .flexslider({
      animation: "slide",
      pauseOnHover: true,
      pauseOnAction: true,
      touch: true,
      video: true,
      useCSS: false,
      animationLoop: true,
      slideshow: false,
      prevText: "",
      nextText: "",
      directionNav: true,
      before: function () {
        if (!canSlide) {
          slider.flexslider("stop");
        }
      },

      itemWidth: 500
    });

  slider.find('.flex-control-nav > li > a').on("click", function () {
    canSlide = true;
    $('.flexslider iframe').each(function () {
      $(this).data('player').pauseVideo();
    });
  });


	$('#js-imagerotator-carousel').flexslider({
	    animation: "slide",
	    controlNav: false,
	    animationLoop: true,
	    slideshow: false,
	    itemWidth: 120,
	    asNavFor: '#js-imagerotator',
	    directionNav: true,
	    prevText: "",
	    nextText: "",
	    minItems: 3,
      maxItems: 4,
	});

    $('#js-imagerotator').flexslider({
        animation: "slide",
        controlNav: false,
        animationLoop: false,
        slideshow: false,
        sync: "#js-imagerotator-carousel",
        directionNav: false,
    });
});
