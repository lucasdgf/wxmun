var timer = null;

$(function() {
  $( "#sortable" ).sortable();
  $( "#sortable" ).disableSelection();
});

/* Player functionality */
function togglePlay(el) {
  $(el).toggleClass('fa-pause');
  $(el).toggleClass('fa-play');
}

function timeSpeech() {
  var secondsLeft = parseInt($('#seconds-left').text());
  if (!secondsLeft) {
    var minutesLeft = parseInt($('#minutes-left').text());
    if (minutesLeft) {
      if (minutesLeft == 1) {
        $('.time-left').addClass('lowTime');
      }
      $('#minutes-left').text(minutesLeft - 1);
      $('#seconds-left').text(59);
    }
    else {
      $('.time-left').removeClass('lowTime').text(0);
      $('.fa-pause').addClass('fa-times-circle-o');
      $('.fa-pause').removeClass('fa-pause');
      clearInterval(timer);
    }
  }
  else {
    $('#seconds-left').text(secondsLeft - 1);
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
  $('#minutes-left').text(parseInt($('.fa-stop').attr('data')));
  $('#seconds-left').text(0);
  clearInterval(timer);
  timer = null;
  $('#playButton').removeClass('fa-pause').removeClass('fa-times-circle-o').addClass('fa-play');
});

$('.fa-check').on('click', function() {
  window.location.href = '/committee/' + this.getAttribute('data').toLowerCase() + '/gsl';
});

/* Left menu */
var quorumDelegates = quorumDelegates.map(function(country){ return country.name; });

$('#add-country').autocomplete({ source: quorumDelegates })
.bind('keydown', function(){
  if ($(this).val() == '') {
    $('.ui-autocomplete').hide();
  }
  else if (window.event.keyCode == 13) {
    addToGSL($(this).val());
    $('.ui-autocomplete').hide();
    $(this).val('');
  }
  else {
    $(this).autocomplete('search');
    $('.ui-autocomplete').show();
  }
});
