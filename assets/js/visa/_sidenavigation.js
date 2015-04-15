$('#sidemenu').on('show.bs.collapse', function (e) {
  $(e.target).parent().find('a').addClass('collapse-show');
});
$('#sidemenu').on('hide.bs.collapse', function (e) {
  $(e.target).parent().find('a').removeClass('collapse-show');
});