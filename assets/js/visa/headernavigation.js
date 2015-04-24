// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('header').outerHeight();
var interval;
var scrollToTop = 0;

(function() {

    'use strict';

    function headernavigation() {
        //console.log('headernavigation js loaded');
        // language dropdown menu
        $('.menu__top .select-language, .menu__top .select-environment').on('show.bs.dropdown', function(e){
            var _t = $(e.relatedTarget).find('span');
            _t.removeClass('icon-arrow-down');
            _t.addClass('icon-arrow-up');
        });
        $('.menu__top .select-language, .menu__top .select-environment').on('hide.bs.dropdown', function(e){
            var _t = $(e.relatedTarget).find('span');
            _t.removeClass('icon-arrow-up');
            _t.addClass('icon-arrow-down');
        });

    }
    loginBlockDropdown();
    testScreen();
    headernavigation();
}());

startCheck();

/* hide / show logic */
$(window).scroll(function(event){
    didScroll = true;
});

/* login block dropdown */
function loginBlockDropdown() {
    $('[data-toggle="login-dropdown"]').bind('click', function(e){
        var _curEl = $(e.currentTarget);
        _curEl.parent().toggleClass('active');
        e.preventDefault();
    });
    $('.login-block [data-toggle="close-dropdown"]').bind('click', function(e){
        var _curEl = $(e.currentTarget);
        _curEl.closest('li').removeClass('active');
    });
}

function startCheck(){
    interval = setInterval(function() {
        if (didScroll && !$('body').hasClass('noscroll') ) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);
}

function hasScrolled() {
    var st = $(this).scrollTop();

    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;

    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('body').removeClass('nav-down').removeClass('nav-top').addClass('nav-up');
    }
    else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
            $('body').removeClass('nav-up').addClass('nav-down');
        }
        if(st < 100){
            $('body').removeClass('nav-down nav-up').addClass('nav-top');
        }
        /*if(st == 0) {
            $('body').removeClass('nav-down nav-up').addClass('nav-top');
        }*/

    }

    lastScrollTop = st;
}
/*function calculateMainMenu(){
    var _brakePoint = $("#menu__main").width() + 20;
    var _elW = ( $('body').hasClass('nav-top') ? 0 : 5 );
    $("#menu__main > ul > li:not(:hidden)").each(function(index, el){
        _elW += $(el).width();
    });
    console.log(_brakePoint ,"<", _elW);
    if(_brakePoint < _elW) {
        addHorScroll(_elW);
    } else {
        removeHorScroll();
    }
}*/
/*function addHorScroll($width){
    var _el = $("#menu__main > ul:first-child");
    _el.addClass('hor-scrollable');
    console.log( $('.hor-scrollable').width(), "t" );
    _el.append('<li class="left-nav"><i class="icon-arrow-left"></i></li><li class="right-nav"><i class="icon-arrow-right"></i></li>');
    $('.hor-scrollable .left-nav').css({ left:10, position:'fixed'});
    $('.hor-scrollable .right-nav').css({ left:$('.hor-scrollable').width()-10, position:'fixed'});
}*/
/*function removeHorScroll(){
    var _el = $("#menu__main > ul:first-child");
    _el.removeClass('hor-scrollable');
    _el.find('.left-nav .right-nav').removeClass('.left-nav .right-nav');
}*/
/*$(window).load(function(){
    $(window).resize( $.throttle( 500, function(){
        calculateMainMenu();
    }));
    $(window).scroll( $.throttle( 500, function(){
        calculateMainMenu();
    }));

    calculateMainMenu();
});*/

function testScreen(){
    if( Modernizr.mq('only screen and (min-width:768px) and (max-width: 900px)') ) {
        $('body').addClass('burger');
        //$('body').append('<div style="background: none repeat scroll 0 0 white;border: 1px solid red;padding: 10px;position: absolute;top: 0;z-index: 999999;">TEST</div>');
    } else {
        $('body').removeClass('burger');
    }
    $(window).resize( function(){
        if( Modernizr.mq('only screen and (min-width:768px) and (max-width: 900px)') ) {
            $('body').addClass('burger');
            //$('body').append('<div style="background: none repeat scroll 0 0 white;border: 1px solid red;padding: 10px;position: absolute;top: 0;z-index: 999999;">TEST</div>');
        } else {
            $('body').removeClass('burger');
        }
        //console.log( 'test:', Modernizr.mq('only screen and (min-width: 901px)'), $(window).width() );
    });


}