var timer = null;

/* Player functionality */
function togglePlay(el) {
  $(el).toggleClass('fa-pause');
  $(el).toggleClass('fa-play');
}

function timeSpeech() {
  var secondsLeft = parseInt($('#seconds-left').val());
  var minutesLeft = parseInt($('#minutes-left').val());
  if (!minutesLeft) {
    $('.time-left').addClass('lowTime');
  }

  if (!secondsLeft) {
    if (minutesLeft) {
      if (minutesLeft == 1) {
        $('.time-left').addClass('lowTime');
      }
      $('#minutes-left').val(minutesLeft - 1);
      $('#seconds-left').val(59);
    }
    else {
      $('.time-left').removeClass('lowTime').val(0);
      $('.fa-pause').toggleClass('fa-pause fa-play');
      clearInterval(timer);
    }
  }
  else {
    $('#seconds-left').val(secondsLeft - 1);
  }
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
  $('.time-left').removeClass('lowTime');
  $('#minutes-left').val(0);
  $('#seconds-left').val(0);
  clearInterval(timer);
  timer = null;
  $('#playButton').removeClass('fa-pause').removeClass('fa-times-circle-o').addClass('fa-play');
});

$('.fa-check').on('click', function() {
  window.location.href = '/committee/' + this.getAttribute('data').toLowerCase() + '/motions';
});
