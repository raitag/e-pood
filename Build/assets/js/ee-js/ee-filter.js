$(document).ready(function() {
    filters();
});

$(window).resize(function () {
    filters();
});

$('.collapse-trigger').on('click', function(e) {
    e.preventDefault();
    var $this = $(this);
    var $popover = $this.find('[data-toggle="popover"]');

    $popover.on('click', function () {
        $(this).data('clicked', true);
    });

    if (!$popover.data('clicked')) {
        var $collapse = $this.parent().find('.collapse').first();
        $this.toggleClass('collapsed');
        $collapse.collapse('toggle');
        $this.text($this.hasClass('collapsed') ? $this.data('moretext') : $this.data('lesstext'));
    } else {
        $popover.data('clicked', false);
    }
});

function filters() {
    $('.collapse-trigger').each(function () {
        var $this = $(this);
        $this.text($this.hasClass('collapsed') ? $this.data('moretext') : $this.data('lesstext'));
    });

    var $filters = $('.ee-filters');
    if(Modernizr.mq('only screen and (max-width: 767px)')) {
        $filters.find('.filter > li > .collapse').removeClass('in');
        $filters.find('.ee-filters-list').removeClass('in');
        $filters.find('.filter > .collapse-trigger').removeClass('collapsed');
        $filters.find('.filters-collapse-trigger').addClass('collapsed');
    } else {
        $filters.find('.ee-filters-list').addClass('in');
        $filters.find('.filters-collapse-trigger').addClass('collapsed');
        $filters.find('.main-filter > li > .collapse').addClass('in').css({ 'height': 'auto' });
        $filters.find('.main-filter > .collapse-trigger').addClass('collapsed');
    }
}

$('.filters-collapse-trigger').on('click', function(e){
  if(Modernizr.mq('only screen and (min-width: 768px)')) {
    e.stopPropagation();
  }    
});
