$(function(){
    var $searchbox = $(".searchbox-responsive");
    $searchbox.find('#search').bind('click', function(){
        $searchbox.addClass('focus');
    });

    $(document).click(function(e){
        if ($(e.target).closest(".searchbox-responsive").length == 0) {
            $searchbox.removeClass('focus');
        }
    });
    /*var _nav = $('header .menu__top .container > .navbar-nav:eq(1) ');
    var _input = $('.searchbox-responsive');
    $(window).resize( $.throttle( 500, function(){
        if( _input.hasClass('focus') ){
            var _maxX = _nav.width() + _nav.position().left;
            console.log('keep calculating', _maxX, _input.position().left - 60, _input.find('input').width()+45 );
        }
    }));*/
});
