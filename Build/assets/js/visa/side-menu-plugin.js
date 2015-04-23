/**
 * Created by Viljar Salu on 28.01.2015.
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
            $('.sidemenu-topborder').css({ width : $('#headernavigation > .container').width()+20, left:$('#headernavigation > .container').position().left });

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
        /* level 4 menu position calculation */
        var _submenuH  = obj.mouseY + obj.submenuH;
        var _area      = obj.viewportH - obj.sidemenuMenuTop;

        /* set IV level menu height */
        if( obj.submenuH < _area) {
            console.log('submenu:',obj.submenu,' height:auto');
            obj.submenu.css({ height:'auto'});
        } else {
            console.log('submenu:',obj.submenu,' height:',_area + 5);
            obj.submenu.css({ height:_area-5});
        }

        if( _area < _submenuH ) {
            var _posTop = obj.viewportH - obj.submenuH;
            var _p = obj.submenuH - _area;
            var _newTop = _posTop + _p + ( $('body').hasClass('nav-up') || $('body').hasClass('nav-down') ? 0 : 5 );
            obj.submenu.css({top:_newTop, overflow:'hidden', overflowY:'auto'});

        } else {
            var _newTop = (obj.sidemenuMenuTop + obj.currentEl.top);
            el.next().css({top: (_newTop) });
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
            console.log("click into input, do something");
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
            } else {
                $currentParentEl.toggleClass('open');
            }
            if( ( typeof prevParentElement != 'undefined' ) && $currentParentEl[0] != prevParentElement[0] ) {
                $currentParentEl.addClass('open');
            }
            prevParentElement = $currentParentEl;
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
            } else {
                $currentParentEl.toggleClass('open');
            }
            if( ( typeof prevParentsubElement != 'undefined' ) && $currentParentEl[0] != prevParentsubElement[0] ) {
                $currentParentEl.addClass('open');
            }
            prevParentsubElement = $currentParentEl;
            //console.log("test sidemenu submenu", $(e.currentTarget).parent(), "prev parent element ", prevParentElement );
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

    $rightSideSubMenu.css({ width:$col3Width, right: (mNr+0.4) + '%' });
    $sideMenuLeft.css('max-height',_maxHeight);
    $sideMenuLeftD.css({'max-height':'inherit'});
    //$sideMenuRight.css('max-height',_maxHeight);
    $sideMenuRightD.css({'max-height':'inherit'});
    $sideMenuLeftD.slimScroll({display:'none'}).css({ width:$col3Width, left:$sMleft, position:'relative', height:'inherit' });
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
            //$(e).parent().height(_maxHeight + _tp);
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
