function nextSpeaker(countryCode) {
  if (countryCode) {
    $.ajax({
      type: 'POST',
      url: 'removegsl/' + countryCode
    });

    $('.country-card')[0].remove();
    $('#speakers-list').children()[0].remove();
  }
}

/* Player functionality */
function togglePlay(el) {
  $(el).toggleClass('fa-pause');
  $(el).toggleClass('fa-play');
}


function timeSpeech() {
  var timeLeft = parseInt($('.time-left').text()) - 1;
  if (timeLeft == 0) {
    $('.time-left').removeClass('lowTime').text(timeLeft);
    $('.fa-pause').addClass('fa-times-circle-o');
    $('.fa-pause').removeClass('fa-pause');
    clearInterval(timer);
  } else if (timeLeft <= 10) {
    $('.time-left').addClass('lowTime');
  }

  $('.time-left').text(timeLeft);
}

$('#playButton').on('click', function() {
  togglePlay(this);
  if ($(this).hasClass('fa-pause')) {
    if (!timer) {
      timer = setInterval(function(){ timeSpeech() }, 1000);
    }
  } else {
    clearInterval(timer);
    timer = null;
  }
});

$('.fa-stop').on('click', function() {
  $('.time-left').removeClass('lowTime').text(parseInt($('.fa-stop').attr('data')));
  clearInterval(timer);
  timer = null;
  $('#playButton').removeClass('fa-pause').removeClass('fa-times-circle-o').addClass('fa-play');
});

$('.fa-check').on('click', function() {
  var countryCode = $('.country-card').attr('id');
  nextSpeaker(countryCode);
});

$(function() {
  updateAutocomplete();
});
