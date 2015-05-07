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
        if( $('body').hasClass('noscroll') ) {
            enableScroll();
        } else {
            disableScroll();
        }
    });
    $('.login-block [data-toggle="close-dropdown"]').bind('click', function(e){
        e.preventDefault();
        var _curEl = $(e.currentTarget);
        _curEl.closest('li').removeClass('active');
        enableScroll();
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

    }

    lastScrollTop = st;
}

/* new sidemenu */
jQuery(document).ready(function($){
    // first level click
    $('.header-menu__main .nav > li.sidemenu > a').click(function(event){
        event.preventDefault();
        var li = $(this).parent();
        var ul = $(this).parent().parent().parent().find('ul');
        if( li.hasClass('sidemenu-open') ) {
            hideSideMenu();
        } else if( ul.find('.sidemenu-open').length > 0 ) {
            switchSideMenu(ul, li);
        } else {
            showSideMenu(li);
        }
    });
    $('.header-menu__main .mobile-icons > ul > li > a').click(function(event){
        event.preventDefault();
        var li = $(this).parent();
        var ul = $(this).parent().parent();
        if( $('.navbar-toggle').hasClass('active') ) {
            hideMobileMenu();
            showSideMenu(li);
        } else {
            if( li.hasClass('sidemenu-open') ) {
                hideSideMenu();
                enableScroll();
            } else if( ul.find('.sidemenu-open').length > 0 ) {
                switchSideMenu(ul, li);
            } else {
                showSideMenu(li);
            }
        }
    });
    $('.header-menu__main .mobile-icons > ul > li > .sidemenu-menu ul > li.sidemenu > a').click(function(event){
        event.preventDefault();
        var li = $(this).parent();
        var ul = $(this).parent().parent().parent().find('ul');
        if( li.hasClass('sidemenu-open') ) {
            hideOnlySideMenu(li);
        } else if( ul.find('.sidemenu-open').length > 0 ) {
            switchSideMenu(ul, li);
        } else {
            showSideMenu(li);
        }
    });
    // second level click
    $('.header-menu__main .nav > li.sidemenu > .sidemenu-menu ul > li.sidemenu > a').click(function(event){
        event.preventDefault();
        var li = $(this).parent();
        var ul = $(this).parent().parent().parent().find('ul');
        var submenu;
        var cloneId;
        if( $(window).width() > 767 ) {
            if( !$(this).attr('data-submenu')) {
                cloneId = 'submenu-clone-' + uniqId();
                submenu = $(this).next().clone().attr('id', cloneId);
                $(this).attr('data-submenu', cloneId);
            } else {
                submenu = $('#' + $(this).attr('data-submenu'));
                $(this).attr('data-submenu', '');
            }
            var overFlowContainer = $(this).parent().find('.sidemenu-menu > div');
            if( li.hasClass('sidemenu-open') ) {
                hideSubSideMenu(li, submenu);
            } else if( ul.find('.sidemenu-open').length > 0 ) {
                switchSubSideMenu(ul, li, submenu);
            } else {
                showSubSideMenu(li, submenu);
            }
        } else {
            if( li.hasClass('sidemenu-open') ) {
                hideOnlySideMenu(li);
            } else if( ul.find('.sidemenu-open').length > 0 ) {
                switchSideMenu(ul, li);
            } else {
                showSideMenu(li);
            }
        }
    });
    $('.navbar-toggle').click(function(event){
        event.preventDefault();
        if( !$(this).hasClass('active') ) {
            if( $('body').hasClass('noscroll') ) {
                hideSideMenu();
                showMobileMenu();
            } else {
                disableScroll();
                showMobileMenu();
            }
            $(this).addClass('active');
        } else {
            enableScroll();
            hideMobileMenu();
        }
    });
    // close menus on backdrop click
    $(document).on( 'click', '.sidemenu-backdrop', function(){
        if( $(window).width() > 767 ) {
            hideSideMenu();
        } else {
            enableScroll();
            hideMobileMenu();
            hideSideMenu();
        }
    });
});
function uniqId() {
    return Math.round(new Date().getTime() + (Math.random() * 100));
}
function disableScroll() {
    var curScroll = $(window).scrollTop();
    $('body').addClass('noscroll sidemenu-active');
    // show backdrop only if no backdrop exists
    if( $('.sidemenu-backdrop').length < 1 ) {
        showSideMenuBackDrop();
        $('body').css('top', -curScroll);
    }
}
function enableScroll() {
    $('body').removeClass('noscroll sidemenu-active');
    var bodyScroll = parseInt($('body').css('top'), 10);
    $(window).scrollTop(-bodyScroll);
    // hide backdrop
    hideSideMenuBackDrop();
}
function showMobileMenu() {
    $('#menu__main').addClass('navbar-mobile-open');
    setTimeout(function(){
        $('#menu__main').addClass('navbar-mobile-visible');
    }, 20);
}
function hideMobileMenu() {
    $('#menu__main').removeClass('navbar-mobile-visible');
    $('.navbar-toggle').removeClass('active');
    setTimeout(function(){
        $('#menu__main').removeClass('navbar-mobile-open');
    }, 200);
}
function showSideMenu(li) {
    // disable scrolling
    disableScroll();
    //show sidemenu
    li.addClass('sidemenu-open');
    var container = li.find('> .sidemenu-menu');
    setMenuOverflow(container);
    setTimeout(function(){
        li.addClass('sidemenu-visible');
    }, 10);
}
function showSubSideMenu(li, clone) {
    //show sidemenu
    // take this sidemenu and append it to container
    li.closest('.sidemenu-menu').append(clone);
    li.addClass('sidemenu-open');
    clone.addClass('sidemenu-menu-open sidemenu-clone');
    setTimeout(function(){
        clone.addClass('sidemenu-menu-visible');
        setSubSideMenuOverflow(li, clone);
    }, 20);
}
function switchSubSideMenu(ul, newLi, clone) {
    // hide active sidemenus
    var clones = newLi.closest('.sidemenu-menu').find('.sidemenu-clone');
    clones.removeClass('sidemenu-menu-visible');
    ul.find('.sidemenu-open a').attr('data-submenu', '');
    ul.find('.sidemenu-open').removeClass('sidemenu-open');
    setTimeout(function(){
        clones.removeClass('sidemenu-menu-open');
        clones.remove();
        showSubSideMenu(newLi, clone);
        setSubSideMenuOverflow(newLi, clone);
    }, 200);
}
function hideSubSideMenu(li, clone) {
    li.removeClass('sidemenu-open');
    clone.removeClass('sidemenu-menu-visible');
    setTimeout(function(){
        clone.removeClass('sidemenu-menu-open');
        clone.remove();
    }, 200);
}
function setSubSideMenuOverflow(li, clone) {
    var ofc = clone.find('> div');
    var ofcParent = clone;
    ofcParent.attr('style', false);
    ofc.attr('style', false);
    var headerHeight = $('header').outerHeight() + parseInt($('header').css('top'), 10);
    var maxHeight = $(window).height() - headerHeight;
    var minOffsetTop = $(window).height() - maxHeight;
    var ofcHeight = ofc.outerHeight();
    if(ofc.outerHeight() > maxHeight) {
        ofc.outerHeight(maxHeight);
    }
    var ofcParentOffsetTop = li.offset().top - headerHeight;
    // determine if pulling up is necessary
    if( ( ofcParent.outerHeight() + ofcParentOffsetTop ) > maxHeight ) {
        var negTop = maxHeight - ofcParent.outerHeight();
        ofcParent.css('top', negTop);
    } else {
        ofcParent.css('top', ofcParentOffsetTop);
    }
}
function setMenuOverflow(item) {
    var ofc = item.find('> div');
    ofc.attr('style', false);
    var headerHeight = $('header').outerHeight() + parseInt($('header').css('top'), 10);
    var maxHeight = $(window).height() - headerHeight;
    if(ofc.outerHeight() > maxHeight) {
        ofc.outerHeight(maxHeight);
    }
}
function hideSubSideMenus() {
    $('.sidemenu a').attr('data-submenu', '');
    var clones = $('.sidemenu-clone');
    clones.removeClass('sidemenu-menu-visible');
    setTimeout(function(){
        clones.removeClass('sidemenu-menu-open');
        clones.remove();
    }, 200);
}
function hideSideMenu() {
    // enable scrolling
    if( $(window).width() > 767 ) {
        enableScroll();
    }
    //hide sidemenu
    $('.sidemenu-open').removeClass('sidemenu-visible active');
    $('[data-toggle="login-dropdown"]').parent().removeClass('active');
    setTimeout(function(){
        $('.sidemenu-open').removeClass('sidemenu-open');
        hideSubSideMenus();
    }, 200);
}
function hideOnlySideMenu(li) {
    li.removeClass('sidemenu-visible');
    setTimeout(function(){
        li.removeClass('sidemenu-open');
    }, 200);
}
function switchSideMenu(ul, newLi) {
    // hide active sidemenus
    ul.find('.sidemenu-open').removeClass('sidemenu-visible active');
    setTimeout(function(){
        ul.find('.sidemenu-open').removeClass('sidemenu-open');
        // show new sidemenu
        showSideMenu(newLi);
        hideSubSideMenus();
    }, 200);
}
function showSideMenuBackDrop() {
    $('body').append('<div class="sidemenu-backdrop" />');
    setTimeout(function(){
        $('.sidemenu-backdrop').addClass('sidemenu-backdrop-visible');
    }, 10);
}
function hideSideMenuBackDrop() {
    $('.sidemenu-backdrop').removeClass('sidemenu-backdrop-visible');
    setTimeout(function(){
        $('.sidemenu-backdrop').remove();
    }, 200);
}
