// applay function screen onchanged
function OnResize() {
    this.init = function (c, t) {
        var previousWidth = window.innerWidth;
        window.onresize = function () {
            if (window.innerWidth != previousWidth) {
                clearTimeout(t);
                t = setTimeout(function () {
                    for (var i = reCallFuncs.length - 1; i >= 0; i--) {
                        reCallFuncs[i].call();
                    }
                }, 500);
            }
            previousWidth = window.innerWidth;
        };
        return c;
    };
}



//scroll page to top
function scrollPageTop(){
    $('[data-toggle="scroll-up"]').click(function(){
        $('html,body').animate({
             scrollTop: 0
        }, 1000);
    });
}

// create custom element
function createCustomElement(array){
    for(var _i=0; _i < array.length; _i++){
        document.createElement(array[_i]);
    }
}

// return client screen width
function getScreenWidth(){
	var w=Math.max(document.documentElement.clientWidth,window.innerWidth||0);
	return w;
}

// return client screen height
/*function getScreenHeight(){
    var h=Math.max(document.documentElement.clientHeight,window.innerHeight||0);
    return h;
}*/
 // get element height
function getElementH(el){
    var height = $(el).find('.dropdown-menu').height();
    return height;
}

// make a element full screen width
function fullSizeElement(){
    var _el = $('.full-size');
    if(_el.length < 1) return;
    _el.attr('style','');// reset left value
    var _pos = _el.offset(), _leftpx = _pos.left*(-1);
    _el.css({ width : document.body.clientWidth+'px', left:_leftpx, position:'relative' });    
}

// stop propagation utility for dropdown menu
function stopPropagation(){
    $(".dropdown-menu").on("click", "[data-stopPropagation]", function(e) {
        e.stopPropagation();
    });

    $('.stoppropagation').click(function(e){
        e.stopPropagation();
    });
}
