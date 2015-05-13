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

    /* TYPEAHEAD */
    // var searchResults = new Bloodhound({
    //     datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    //     queryTokenizer: Bloodhound.tokenizers.whitespace,
    //     prefetch: 'http://twitter.github.io/typeahead.js/data/films/post_1960.json',
    //     remote: {
    //         url: 'http://twitter.github.io/typeahead.js/data/films/queries/%QUERY.json',
    //         wildcard: '%QUERY'
    //     }
    // });
    // searchResults.initialize();

    // $('[role="search"] .form-control').typeahead(
    //     {
    //         hint: true,
    //         highlight: true,
    //         minLength: 1
    //     },
    //     {
    //         name:'search-results',
    //         display:'value',
    //         source:searchResults,
    //         limit:4,
    //         templates: {
    //             empty: [
    //                 '<div class="empty-message">',
    //                 'unable to find any results that match the current query',
    //                 '</div>'
    //             ].join('\n'),
    //             suggestion: function(data){
    //                 return '<div><img src="/assets/ico/favicon-32x32.png" alt=""/><span>' + data.value + '</span></div>'
    //             },
    //             footer:'<div class="tt-footer"><a href="#">Vaata koiki <span class="icon icon-arrow-right"></span></a></div>'
    //         }
    //     }
    // );

    $('[role="search"] .form-control').wrap('<div class="twitter-typeahead"></div>');

});