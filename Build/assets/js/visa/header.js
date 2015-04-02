// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('header').outerHeight();
var interval;
var scrollToTop = 0;

$(document).ready(function() {

    'use strict';

    function headernavigation() {
        // console.log('headernavigation js loaded');
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
    testScreen();
    headernavigation();
});

startCheck();

/* hide / show logic */
$(window).scroll(function(event){
    didScroll = true;
});

function startCheck(){
    interval = setInterval(function() {
        if (didScroll) {
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
function calculateMainMenu(){
    var _brakePoint = $("#menu__main").width() + 20;
    var _elW = ( $('body').hasClass('nav-top') ? 0 : 5 );
    $("#menu__main > ul > li:not(:hidden)").each(function(index, el){
        _elW += $(el).width();
    });
    // console.log(_brakePoint ,"<", _elW);
    if(_brakePoint < _elW) {
        addHorScroll(_elW);
    } else {
        removeHorScroll();
    }
}
function addHorScroll($width){
    var _el = $("#menu__main > ul:first-child");
    _el.addClass('hor-scrollable');
    // console.log( $('.hor-scrollable').width(), "t" );
    _el.append('<li class="left-nav"><i class="icon-arrow-left"></i></li><li class="right-nav"><i class="icon-arrow-right"></i></li>');
    $('.hor-scrollable .left-nav').css({ left:10, position:'fixed'});
    $('.hor-scrollable .right-nav').css({ left:$('.hor-scrollable').width()-10, position:'fixed'});
}
function removeHorScroll(){
    var _el = $("#menu__main > ul:first-child");
    _el.removeClass('hor-scrollable');
    _el.find('.left-nav .right-nav').removeClass('.left-nav .right-nav');
}
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
    $(window).resize( function(){
        if( Modernizr.mq('only screen and (min-width:768px) and (max-width: 900px)') ) {
            $('body').addClass('burger');
        } else {
            $('body').removeClass('burger');
        }
        // console.log( 'test:', Modernizr.mq('only screen and (min-width: 901px)'), $(window).width() );
    });


}

/*
* sidemenu
*/

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

/*
* sidenavigation
*/

$('.sidemenu').on('show.bs.collapse', function (e) {
  $(e.target).parent().find('a').addClass('collapse-show');
});
$('.sidemenu').on('hide.bs.collapse', function (e) {
  $(e.target).parent().find('a').removeClass('collapse-show');
});

/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.0
 *
 */
(function(f){jQuery.fn.extend({slimScroll:function(h){var a=f.extend({width:"auto",height:"250px",size:"7px",color:"#000",position:"right",distance:"1px",start:"top",opacity:0.4,alwaysVisible:!1,disableFadeOut:!1,railVisible:!1,railColor:"#333",railOpacity:0.2,railDraggable:!0,railClass:"slimScrollRail",barClass:"slimScrollBar",wrapperClass:"slimScrollDiv",allowPageScroll:!1,wheelStep:20,touchScrollStep:200,borderRadius:"7px",railBorderRadius:"7px"},h);this.each(function(){function r(d){if(s){d=d||
window.event;var c=0;d.wheelDelta&&(c=-d.wheelDelta/120);d.detail&&(c=d.detail/3);f(d.target||d.srcTarget||d.srcElement).closest("."+a.wrapperClass).is(b.parent())&&m(c,!0);d.preventDefault&&!k&&d.preventDefault();k||(d.returnValue=!1)}}function m(d,f,h){k=!1;var e=d,g=b.outerHeight()-c.outerHeight();f&&(e=parseInt(c.css("top"))+d*parseInt(a.wheelStep)/100*c.outerHeight(),e=Math.min(Math.max(e,0),g),e=0<d?Math.ceil(e):Math.floor(e),c.css({top:e+"px"}));l=parseInt(c.css("top"))/(b.outerHeight()-c.outerHeight());
e=l*(b[0].scrollHeight-b.outerHeight());h&&(e=d,d=e/b[0].scrollHeight*b.outerHeight(),d=Math.min(Math.max(d,0),g),c.css({top:d+"px"}));b.scrollTop(e);b.trigger("slimscrolling",~~e);v();p()}function C(){window.addEventListener?(this.addEventListener("DOMMouseScroll",r,!1),this.addEventListener("mousewheel",r,!1),this.addEventListener("MozMousePixelScroll",r,!1)):document.attachEvent("onmousewheel",r)}function w(){u=Math.max(b.outerHeight()/b[0].scrollHeight*b.outerHeight(),D);c.css({height:u+"px"});
var a=u==b.outerHeight()?"none":"block";c.css({display:a})}function v(){w();clearTimeout(A);l==~~l?(k=a.allowPageScroll,B!=l&&b.trigger("slimscroll",0==~~l?"top":"bottom")):k=!1;B=l;u>=b.outerHeight()?k=!0:(c.stop(!0,!0).fadeIn("fast"),a.railVisible&&g.stop(!0,!0).fadeIn("fast"))}function p(){a.alwaysVisible||(A=setTimeout(function(){a.disableFadeOut&&s||(x||y)||(c.fadeOut("slow"),g.fadeOut("slow"))},1E3))}var s,x,y,A,z,u,l,B,D=30,k=!1,b=f(this);if(b.parent().hasClass(a.wrapperClass)){var n=b.scrollTop(),
c=b.parent().find("."+a.barClass),g=b.parent().find("."+a.railClass);w();if(f.isPlainObject(h)){if("height"in h&&"auto"==h.height){b.parent().css("height","auto");b.css("height","auto");var q=b.parent().parent().height();b.parent().css("height",q);b.css("height",q)}if("scrollTo"in h)n=parseInt(a.scrollTo);else if("scrollBy"in h)n+=parseInt(a.scrollBy);else if("destroy"in h){c.remove();g.remove();b.unwrap();return}m(n,!1,!0)}}else{a.height="auto"==a.height?b.parent().height():a.height;n=f("<div></div>").addClass(a.wrapperClass).css({position:"relative",
overflow:"hidden",width:a.width,height:a.height});b.css({overflow:"hidden",width:a.width,height:a.height});var g=f("<div></div>").addClass(a.railClass).css({width:a.size,height:"100%",position:"absolute",top:0,display:a.alwaysVisible&&a.railVisible?"block":"none","border-radius":a.railBorderRadius,background:a.railColor,opacity:a.railOpacity,zIndex:90}),c=f("<div></div>").addClass(a.barClass).css({background:a.color,width:a.size,position:"absolute",top:0,opacity:a.opacity,display:a.alwaysVisible?
"block":"none","border-radius":a.borderRadius,BorderRadius:a.borderRadius,MozBorderRadius:a.borderRadius,WebkitBorderRadius:a.borderRadius,zIndex:99}),q="right"==a.position?{right:a.distance}:{left:a.distance};g.css(q);c.css(q);b.wrap(n);b.parent().append(c);b.parent().append(g);a.railDraggable&&c.bind("mousedown",function(a){var b=f(document);y=!0;t=parseFloat(c.css("top"));pageY=a.pageY;b.bind("mousemove.slimscroll",function(a){currTop=t+a.pageY-pageY;c.css("top",currTop);m(0,c.position().top,!1)});
b.bind("mouseup.slimscroll",function(a){y=!1;p();b.unbind(".slimscroll")});return!1}).bind("selectstart.slimscroll",function(a){a.stopPropagation();a.preventDefault();return!1});g.hover(function(){v()},function(){p()});c.hover(function(){x=!0},function(){x=!1});b.hover(function(){s=!0;v();p()},function(){s=!1;p()});b.bind("touchstart",function(a,b){a.originalEvent.touches.length&&(z=a.originalEvent.touches[0].pageY)});b.bind("touchmove",function(b){k||b.originalEvent.preventDefault();b.originalEvent.touches.length&&
(m((z-b.originalEvent.touches[0].pageY)/a.touchScrollStep,!0),z=b.originalEvent.touches[0].pageY)});w();"bottom"===a.start?(c.css({top:b.outerHeight()-c.outerHeight()}),m(0,!0)):"top"!==a.start&&(m(f(a.start).position().top,null,!0),a.alwaysVisible||c.hide());C()}});return this}});jQuery.fn.extend({slimscroll:jQuery.fn.slimScroll})})(jQuery);

/*
* jQuery throttle / debounce - v1.1 - 3/7/2010
* http://benalman.com/projects/jquery-throttle-debounce-plugin/
*
* Copyright (c) 2010 "Cowboy" Ben Alman
* Dual licensed under the MIT and GPL licenses.
* http://benalman.com/about/license/
*/
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

/**
 * Created by Viljar Salu on 28.01.2015.
 * side-menu-plugin
 */
/* ========================================================================
 * Based on Bootstrap: dropdown.js v3.3.2
 * http://getbootstrap.com/javascript/#dropdowns
 * ======================================================================== */


+function ($) {
    'use strict';

    // SIDEMENU CLASS DEFINITION
    // =========================

    var backdrop = '.sidemenu-backdrop'
    var backdropBorder = '.sidemenu-topborder'
    var toggle   = '[data-toggle="sidemenu"]'
    var Sidemenu = function (element) {
        $(element).on('click.bs.sidemenu', this.toggle)
    }
    Sidemenu.VERSION = '0.1.0'

    Sidemenu.prototype.toggle = function (e) {
        var $this = $(this),
            $sidemenu = $this.next()
        if ($this.is('.disabled, :disabled')) return
        var $parent  = getParent($this)

        var isActive = $parent.hasClass('open')
        clearMenus()
        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="sidemenu-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
            }
            // horizontal line
            $('<div class="sidemenu-topborder"/>').insertAfter($(this))

            // drop background
            $('<div class="sidemenu-backdrop"/>').insertAfter($(this)).on('click', clearMenus)

            var relatedTarget = { relatedTarget: this }
            $parent.trigger(e = $.Event('show.bs.sidemenu', relatedTarget))
            if (e.isDefaultPrevented()) return

            $this
                .trigger('focus')
                .attr('aria-expanded', 'true')

            $parent
                .toggleClass('open')
                .trigger('shown.bs.sidemenu', relatedTarget)
        }
        return false
    }

    Sidemenu.prototype.keydown = function (e) {
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

        var $this = $(this)

        e.preventDefault()
        e.stopPropagation()

        if ($this.is('.disabled, :disabled')) return

        var $parent  = getParent($this)
        var isActive = $parent.hasClass('open')

        if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
            if (e.which == 27) $parent.find(toggle).trigger('focus')
            return $this.trigger('click')
        }

        var desc = ' li:not(.divider):visible a'
        var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

        if (!$items.length) return

        var index = $items.index(e.target)

        if (e.which == 38 && index > 0)                 index--                        // up
        if (e.which == 40 && index < $items.length - 1) index++                        // down
        if (!~index)                                    index = 0

        $items.eq(index).trigger('focus')
    }

    function clearMenus(e) {
        if( typeof e == "object" ) $("body").removeClass("noscroll")
        $('body').removeClass('open')
        $('#menu__main').removeClass('in')
        if (e && e.which === 3) return
        $(backdrop).remove()
        $(backdropBorder).remove()
        $(toggle).each(function () {
            var $this         = $(this)
            var $parent       = getParent($this)
            var relatedTarget = { relatedTarget: this }

            if (!$parent.hasClass('open')) return
            $parent.trigger(e = $.Event('hide.bs.sidemenu', relatedTarget))
            if (e.isDefaultPrevented()) return
            $this.attr('aria-expanded', 'false')
            if( getParent($parent).closest('.sidemenu').length == 0 ){
                $parent.removeClass('open').trigger('hidden.bs.sidemenu', relatedTarget);
                $parent.find('.sidemenu').removeClass('open'); //remove submenu open class
                $parent.find('.sidemenu-menu div.mute').removeClass('mute') // remove mute class from ul
            }
        })
    }

    function clearAllMenus(e) {
        //console.log('clearAllMenus');
        $(backdrop).remove()
        $(toggle).each(function (i,el) {
            var $this = $(el);
            var $parent = getParent($(el))

            if (!$parent.hasClass('open')) return
            $parent.trigger(el = $.Event('hide.bs.sidemenu'))
            if (el.isDefaultPrevented()) return

            $this.attr('aria-expanded', 'false')
            $parent.removeClass('open').trigger('hidden.bs.sidemenu')
        })
    }

    function getParent($this) {
        var selector = $this.attr('data-target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        var $parent = selector && $(selector)

        return $parent && $parent.length ? $parent : $this.parent()
    }


    // SIDEMENU PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data  = $this.data('bs.sidemenu')

            if (!data) $this.data('bs.sidemenu', (data = new Sidemenu(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.sidemenu

    $.fn.sidemenu             = Plugin
    $.fn.sidemenu.Constructor = Sidemenu


    // SIDEMENU NO CONFLICT
    // ====================

    $.fn.sidemenu.noConflict = function () {
        $.fn.sidemenu = old
        return this
    }


    // APPLY TO STANDARD SIDEMENU ELEMENTS
    // ===================================

    $(document)
        .on('click.bs.sidemenu.data-api', clearMenus)
        .on('click.bs.sidemenu.data-api', '.sidemenu form', function (e) { e.stopPropagation() })
        .on('click.bs.sidemenu.data-api', toggle, Sidemenu.prototype.toggle)
        .on('keydown.bs.sidemenu.data-api', toggle, Sidemenu.prototype.keydown)
        .on('keydown.bs.sidemenu.data-api', '[role="menu"]', Sidemenu.prototype.keydown)
        .on('keydown.bs.sidemenu.data-api', '[role="listbox"]', Sidemenu.prototype.keydown)
        .on('click', clearAllMenus)

}(jQuery);


/* set submenu y position */
function setSubmenuYPos(el, e) {
    if( el.next().hasClass('sidemenu-menu') ) {
        var obj = {
            viewportH       : $(window).height(),
            mouseY          : e.clientY,
            submenu         : el.next(),
            submenuH        : el.next().height(),
            submenuTop      : el.next().position(),
            headerH         : $('header').height(),
            currentEl       : el.position(),
            sidemenuMenu    : el.closest('.sidemenu-menu'),
            sidemenuMenuTop : el.closest('.sidemenu-menu').position().top,
            paddingTop      : $('.sidemenu-topborder').height()
        };
        // console.log('obj:', obj );
        /* level 4 menu position calculation */
        var _submenuH  = obj.mouseY + obj.submenuH;
        var _area      = obj.viewportH - obj.sidemenuMenuTop;
        // console.log('area:',_area, '_submenuH:',_submenuH);
        if( _area < _submenuH ) {
            var _posTop = obj.viewportH - obj.submenuH;
            var _p = obj.submenuH - _area;
            var _newTop = _posTop + _p + 5;
            //console.log('posTop:', _posTop,'area:', _area, 'mouseY:', obj.mouseY , 'submenuH:', obj.submenuH, ' newTop:', _newTop );
            //obj.submenu.css({top:_posTop}); // height:(_area-obj.paddingTop), overflow:'hidden'
            obj.submenu.css({top:_newTop, height:(_area-5), overflow:'hidden', overflowY:'auto'});
            obj.submenu.css({top:_newTop});

        } else {
            var _newTop = (obj.sidemenuMenuTop + obj.currentEl.top);
            //console.log(_newTop);
            el.next().css({top: (_newTop) });//e.clientY, el.offset().top
        }

    }
}

/* submmenu */
var breakPoint = 900;
$(window).load(function(){
    if( $(window).width() > breakPoint ) {
        initElement();

        // click event
        $('.sidemenu .sidemenu > a').click(function(e){
            var _curEl = $(e.target);
            //_curEl.closest('ul').find('.sidemenu').removeClass('open');
            _curEl.closest('div').find('.sidemenu').removeClass('open');
            _curEl.parent().addClass('open');
            addMute(_curEl.parent());
            setSubmenuYPos(_curEl, e);

            e.preventDefault();
            e.stopPropagation();
        });
       /* $('.sidemenu-menu .sidemenu-menu').on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
        });*/
        //.sidemenu-menu .sidemenu-menu,
        $('.sidemenu input, .sidemenu .sidemenu-menu h3').on('click', function(e){
            // console.log("click into input, do something");
            e.preventDefault();
            e.stopPropagation();
        });
    } else {
        $('button.navbar-toggle').on('click', function(e){
            var bgDrop = '.sidemenu-backdrop';

            $('#menu__main').toggleClass('in');
            $('<div class="sidemenu-backdrop"/>').insertAfter( $('#menu__main') );
            if( !$('#menu__main').hasClass('in') ){
                $(bgDrop).remove();
                $('body').removeClass('noscroll');
            } else {
                $('body').addClass('noscroll');
            }

            // close right side menu
            $('.mobile-icons > ul > .open').find('.sidemenu-backdrop').remove();
            $('.mobile-icons > ul > .open').find('.sidemenu-topborder').remove();
            $('.mobile-icons > ul > .open').removeClass('open');

            e.stopPropagation();
            e.preventDefault();
        });
        // toggle submenu
        var prevParentElement;
        var prevParentsubElement;
        //console.log('all sidemenu ' , $('#menu__main > ul > li.sidemenu > .sidemenu-toggle') );
        $('#menu__main > ul > li.sidemenu > .sidemenu-toggle').on('click', function(e){
            var $currentParentEl = $(e.currentTarget).parent();
            if( typeof prevParentElement != 'undefined' ) {
                if( $currentParentEl[0] == prevParentElement[0] ) {
                    $currentParentEl.toggleClass('open');
                } else {
                    prevParentElement.removeClass('open');
                }
            }
            if( ( typeof prevParentElement != 'undefined' ) && $currentParentEl[0] != prevParentElement[0] ) {
                $currentParentEl.addClass('open');
            }
            prevParentElement = $currentParentEl;
            // console.log("sidemenu", $(e.currentTarget).parent() );
            e.stopPropagation();
            e.preventDefault();
        });
        $('.sidemenu .sidemenu > .sidemenu-toggle').on('click', function(e){
            var $currentParentEl = $(e.currentTarget).parent();
            if( typeof prevParentsubElement != 'undefined' ) {
                if( $currentParentEl[0] == prevParentsubElement[0] ) {
                    $currentParentEl.toggleClass('open');
                } else {
                    prevParentsubElement.removeClass('open');
                }
            }
            if( ( typeof prevParentsubElement != 'undefined' ) && $currentParentEl[0] != prevParentsubElement[0] ) {
                $currentParentEl.addClass('open');
            }
            prevParentsubElement = $currentParentEl;
            // console.log("test sidemenu submenu", $(e.currentTarget).parent(), "prev parent element ", prevParentElement );
            e.stopPropagation();
            e.preventDefault();
        });


        /*if( $('body').hasClass('burger') ) {
            //$('#menu__main').slimScroll().css({  });
            console.log('set slimScroll');
        }*/

        // resize sidemneu height
        resizeMenu();
        $(window).scroll( $.throttle( 500, function(){
            resizeMenu();
        }));
        $(window).resize( $.throttle( 500, function(){
            resizeMenu();
        }));
    }
});
function resizeMenu(){
    var $offTop = 100;
    if( $("body").hasClass("nav-top") ) $offTop = 100;
    else $offTop = 55;
    var _h = ( $(window).height() - $offTop );
    //$("#menu__main").css( 'height', _h + 'px' );
    $("#menu__main").attr( 'style','height:' + _h + 'px!important;' );
    $(".mobile-icons > ul > .sidemenu > .sidemenu-menu").css( 'height', ( $(window).height() - $offTop ) );
}
function addMute(el){
//$(el).closest('ul').addClass('mute');
    $(el).closest('div').removeClass("mute");
    $(el).closest('div').addClass('mute');
    //console.log('Suur test:', $(el).closest('div'), $(el).closest('ul'));
}
function initElement(){
    var $container          = $('.container'),
        $gridCount          = ( $(window).width() > breakPoint ? 4 : 1 ),
        $col3Width          = $('.container').width() / $gridCount,
        $windowWidth        = $(window).width(),
        $sideMenuLeft       = $('.navbar-nav > .sidemenu > .sidemenu-menu.left'),
        $sideMenuLeftD      = $('.navbar-nav > .sidemenu > .sidemenu-menu.left > div'),
        $sideMenuRight      = $('.navbar-nav > .sidemenu > .sidemenu-menu.right'),
        $sideMenuRightD     = $('.navbar-nav > .sidemenu > .sidemenu-menu.right > div'),
        $leftSideSubMenu    = $sideMenuLeftD.find('.sidemenu .sidemenu-menu'),
        $rightSideSubMenu   = $sideMenuRightD.find('.sidemenu .sidemenu-menu'),
        $sideMenuW          = ( $container.position().left + $('.container').width() / $gridCount ),
        isWebkit = 'WebkitAppearance' in document.documentElement.style,
        $sMleft = ( $(window).width() - ( $container.width() + 20 ) ) / 2,
        $sMwidth = $sMleft + ( $('.container').width() / $gridCount );

    // left side menu
    $sideMenuLeft.css({ width:$sMwidth });
    $sideMenuLeftD.css({ width:$col3Width, left:$sMleft });
    $leftSideSubMenu.css({ width:$col3Width, left:$sMwidth });
    // right side menu
    $sideMenuRight.css({ width:$sMwidth + 5 });
    $sideMenuRightD.css({ width:$col3Width});

    var nr          = (( $sMwidth / $windowWidth ) * 100),
        mNr         = nr.toPrecision(3) - 0.1,
        _navtop     = ( $('body').hasClass('nav-top') ? 151 : 56 ),
        _maxHeight  = $(window).height() - _navtop;

    $rightSideSubMenu.css({ width:$col3Width, right: mNr + '%' });
    $sideMenuLeft.css('max-height',_maxHeight);
    $sideMenuLeftD.css({'max-height':'inherit'});
    $sideMenuRight.css('max-height',_maxHeight);
    $sideMenuRightD.css({'max-height':'inherit'});
    $sideMenuLeftD.slimScroll().css({ width:$col3Width, left:$sMleft, position:'relative', height:'inherit' });
    $sideMenuRightD.slimScroll({ position:'left'}).css({ width:$col3Width, position:'relative', height:'inherit' });

    $sideMenuLeftD.scroll( $.throttle( 500, function(){
        $('.slimScrollDiv .sidemenu').removeClass('open');
    }));
    $sideMenuRightD.scroll( $.throttle( 500, function(){
        $('.slimScrollDiv .sidemenu').removeClass('open');
    }));

}

function updateScrollingElement(){
    var $sideMenuLeftD  = $('.navbar-nav > .sidemenu > .sidemenu-menu.left > div'),
        $sideMenuRightD = $('.navbar-nav > .sidemenu > .sidemenu-menu.right > div'),
        _navtop         = ( $('body').hasClass('nav-top') ? 151 : 56 ),
        _maxHeight      = $(window).height() - _navtop;
    // left menu
    $($sideMenuLeftD).each(function(i,e){
        $(e).parent().height('auto');
        $(e).height('inherit');
        if( $(e).height() > _maxHeight ){
            $(e).parent().height(_maxHeight);
        }

    });
    // right menu
    $($sideMenuRightD).each(function(i,e){
        $(e).parent().height('auto');
        $(e).height('inherit');
        if( $(e).height() > _maxHeight ){
            var _tp = ( $(document).scrollTop() == 0 ? 101 : 0);
            $(e).parent().height(_maxHeight + _tp);
            $(e).parent().css({ height:(_maxHeight + _tp), oveflow:'hidden', overflowY:'auto'});
        }
    })
}

$('#menu__main, .sidemenuWrapper').on('show.bs.sidemenu', function () {
    $('body').addClass('noscroll');
    updateScrollingElement();
})
$('#menu__main, .sidemenuWrapper').on('hide.bs.sidemenu', function () {
    $('body').removeClass('noscroll');
})
