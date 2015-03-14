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

$('.remove-gsl').on('click', function() {
  if (this.id) {
    $.ajax({
      type: 'POST',
      url: 'removegsl/' + this.id
    });
  }
  this.parentElement.remove();
});

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

/* Left Menu */
var quorumDelegates = quorumDelegates.map(function(country){ return country.name; });
var allDelegates = countries.map(function(country){ return country.name; });
var gslCountries = gsl.map(function(country){ return country.name; });
var notQuorumDelegates = allDelegates.filter(function(country){ return quorumDelegates.indexOf(country) < 0; });
var timer = null;

function updateAutocomplete() {
  $('#add-country').autocomplete({
    source: quorumDelegates.filter(function(country) {
      return gslCountries.indexOf(country) < 0;
    })
  }).bind('keydown', function(){
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

  $('#add-quorum').autocomplete({
    source: notQuorumDelegates
  }).bind('keydown', function(){
    if ($(this).val() == '') {
      $('.ui-autocomplete').hide();
    }
    else if (window.event.keyCode == 13) {
      addToQuorum($(this).val());
      $('.ui-autocomplete').hide();
      $(this).val('');
    }
    else {
      $(this).autocomplete('search');
      $('.ui-autocomplete').show();
    }
  });
}

function addToGSL(countryName) {
  var countryIndex = allDelegates.indexOf(countryName);
  var countryCode = countries[countryIndex].code;
  var countryName = countries[countryIndex].name;

  if (countryCode) {
    $.ajax({
      type: 'POST',
      url: 'addtogsl/' + countryCode + '/' + countryName
    });

    gsl.push({ code: countryCode, name: countryName });
    gslCountries.push(countryName);

    var source = quorumDelegates.filter(function(country) {
      return gslCountries.indexOf(country) < 0;
    });

    $('#add-country').autocomplete("option", { source: source });

    location.reload();
  }
}

function addToQuorum(countryName) {
  var countryIndex = allDelegates.indexOf(countryName);
  var countryCode = countries[countryIndex].code;
  var countryName = countries[countryIndex].name;

  if (countryCode) {
    $.ajax({
      type: 'POST',
      url: 'addtoquorum/' + countryCode + '/' + countryName
    });

    notQuorumDelegates.splice(notQuorumDelegates.indexOf(countryName), 1);
    location.reload();
  }
}
