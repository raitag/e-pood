$(document).ready(function () {
    //Class definition
    var Progress = function(element, options){
        this.options =
        this.$element =
        this.tabs =
        this.$active = null;

        this.init(element, options);
    };

    Progress.DEFAULTS = {
        activeClass: "progress-active"
    };

    Progress.prototype.init = function(element, options){
        this.options = this.getOptions(options);
        this.$element = $(element);

        this.tabs = this.$element.find('.progress-tabs ol li');
        this.tabs.count = this.tabs.length;


    };

    Progress.prototype.update = function(){
        var that = this;
        var tabs = this.$element.find('.progress-tabs');
        var content = this.$element.find('.progress-content');
        this.$active = this.$element.find('.progress-active');
        this.tabs.activeIndex = this.$active.index();

        placeContent();
        //if one row
        function placeContent(){
            var last = tabs.find('ol li:last');
            var first = tabs.find('ol li:first');
            try {
                if(that.$active.offset().top == last.offset().top && that.$active.offset().top == first.offset().top ){
                    tabs.after(content);
                }else{
                    that.$active.after(content);
                }
            }catch(e){
                tabs.after(content);
            }
        }

        var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
        var isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
        if(!jQuery.browser.mobile && !isAndroid && !isiDevice){
            $(window).resize(function() {
                placeContent();
            });
        }
        
    };

    Progress.prototype.next = function(){
        // kas on järgmine?
        console.info('N',this.tabs.count,':',this.tabs.activeIndex );
        if(this.tabs.activeIndex == -1 || this.tabs.count -1  == this.tabs.activeIndex){
            console.log("No seps left: end");
            return;
        }
        activateStep(this.tabs[this.tabs.activeIndex + 1],this);
        this.update();
    };

    Progress.prototype.prev = function(){
        // kas on järgmine?
        console.info('N',this.tabs.count,':',this.tabs.activeIndex );
        if(this.tabs.activeIndex == -1 ||this.tabs.activeIndex   == 0 ){
            console.log("No seps left:Start");
            return;
        }
        activateStep(this.tabs[this.tabs.activeIndex -1 ],this);
        this.update();
    };

    var activateStep = function(e, that){
        clearActive(that);
        $(e).addClass(that.options.activeClass);
    };

    var clearActive = function(that){
        that.$active.removeClass(that.options.activeClass);
    };


    Progress.prototype.getDefaults = function () {
        return Progress.DEFAULTS;
    };

    Progress.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), options); //this.$element.data(), options);
        return options;
    };



    // PROGRESS DEFINITION
    // ===================
    var old = $.fn.progress;
    $.fn.progress =  function (option, value){
        return this.each(function() {
            var $this = $(this);
            var data = $this.data('ts.progress');

            if(!data) $this.data('ts.progress', (data = new Progress(this,option)));
            if(typeof option == 'string') data[option](value);
        });
    };
    $.fn.progress.Constructor = Progress;

    // NO CONFLICT
    // ===========
    $.fn.progress.noConflict = function(){
        $.fn.progress = old;
        return this;
    };

    // DATA API
    // ========

    $('.progress-steps').progress('update');

    $(document).on('click.ts.progress.data-api', '[data-action="next"]', function(e){
        e.preventDefault();
        $(this).parents('.progress-steps').progress('next');
    });

    $(document).on('click.ts.progress.data-api', '[data-action="prev"]', function(e){
        e.preventDefault();
        $(this).parents('.progress-steps').progress('prev');
    });


});
