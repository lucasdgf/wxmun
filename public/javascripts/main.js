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

/* Committee selector */
$('.committeeSelector').on('click', function() {
  window.location.href = '/committee/' + this.getAttribute('id').toLowerCase() + '/rollcall';
});

function nl2br (str, is_xhtml) {
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}
