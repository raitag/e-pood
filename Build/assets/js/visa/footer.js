(function() {
    footer();
}());

$(window).resize(function () {
    footer();
});

function footer() {
    $footer = $('footer');
    if(Modernizr.mq('only screen and (max-width: 719px)')) {
        $footer.find('.collapse').removeClass('in');
        $footer.find('[data-toggle="collapse"]').addClass('collapsed');
    } else {
        $footer.find('.collapse').addClass('in');
        $footer.find('[data-toggle="collapse"]').removeClass('collapsed');
    }
}
