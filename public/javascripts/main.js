$('#toggle-nav').click(function(evt){
  var sideNav = $('#side-nav');

  if(sideNav.attr('class') == 'transition' || !sideNav.attr('class')) {
    sideNav.addClass('transition').addClass('hidden');
  } else {
    sideNav.addClass('transition').delay(200).queue(function(next){
      $(this).removeClass('hidden');
      next();
    });
  }

  $('#left-menu').addClass('transition').toggleClass('hidden');
  $('#header').addClass('transition').toggleClass('expand-right-content narrow-right-content');
  $('#committee-data').addClass('transition').toggleClass('expand-right-content narrow-right-content');
  $('#wrapper').addClass('transition').toggleClass('expand-right-content narrow-right-content');
});

/* Header menu */
$('#header').find('li').each(function(index, element) {
  $(element).on('click', function() {
    window.location.href = '/committee/' + this.getAttribute('data').toLowerCase() + '/' + this.id;
  })
});
