$(function(){
    var $win = $(window);
    var $searchbox = $(".searchbox-responsive");// element
    var _elBtn = $searchbox.find('button');
    // check where user clicked outside / inside element
    $win.on("click.Bst", function(event){
        if ($searchbox.has(event.target).length == 0 && !$searchbox.is(event.target)){
            _elBtn.closest('form').removeClass('focus');
        } else {
            _elBtn.closest('form').addClass('focus');
        }
    });

    var availableTags = [
        "ActionScript",
        "AppleScript",
        "Asp",
        "BASIC",
        "C",
        "C++",
        "Clojure",
        "COBOL",
        "ColdFusion",
        "Erlang",
        "Fortran",
        "Groovy",
        "Haskell",
        "Java",
        "JavaScript",
        "Lisp",
        "Perl",
        "PHP",
        "Python",
        "Ruby",
        "Scala",
        "Scheme"
    ];
});
