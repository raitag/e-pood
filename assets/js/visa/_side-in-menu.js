/**
 * Created by viljsa on 28.01.2015.
 */
;(function($, window, document, undefined) {

    'use strict';

    function init() {
        $('ul.nav.navbar-nav').on('click.bs.dropdown', function(e){
            var $a = $(e.target), is_a = $a.is('.is_a');
            console.log("test", e, $a, is_a);
            if($a.hasClass('dropdown-toggle')) {
                $('ul.dropdown-menu', this).toggle(!is_a);
                $a.toggleClass('is_a', !is_a);
            }
        });
    }

    init();

})(jQuery, window, document);