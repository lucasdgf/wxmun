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
  // Unmoderated caucus or consultation of the whole
  if ($('country-card').length <= 1 && $('#speakers-left').length == 0) {
    window.location.href = '/committee/' + this.getAttribute('data').toLowerCase() + '/motions';
  }
  else if ($('country-card').length <= 2
           && parseInt($('#speakers-left').text()) == 0
           && $('ul#speakers-list').children().length == 1) {
    window.location.href = '/committee/' + this.getAttribute('data').toLowerCase() + '/motions';
  }
  else {
    $('.country-card').first().remove();
    $('#speakers-list li').first().remove();
    $('#seconds-left').text($('#seconds-left').attr('data'));
  }
});

// Motion controller
function addController(element) {
  var controller = document.createElement('div'),
      dismissMotion = document.createElement('i'),
      approveMotion = document.createElement('i');

  // Include icons
  controller.className = 'motionController';
  dismissMotion.className = 'fa fa-times';
  approveMotion.className = 'fa fa-check';

  controller.appendChild(dismissMotion);
  controller.appendChild(approveMotion);

  element.appendChild(controller);
}

// dismiss motion
function addActions() {
  $('.motionController .fa-times').on('click', function() {
    this.parentElement.parentElement.remove();
  });
}

// Find code by country name
function findCountryCode(countryName) {
  return quorumDelegates.filter(function(country) {
    return country.name == countryName;
  })[0].code;
}

// Motion selector
$('#inputToggle li').on('click', function() {
  $('input').val('');
  $('#inputToggle li').removeClass('active');
  $(this).addClass('active');
  $('.inputArea').removeClass('active');
  $('.' + $('li.active')[1].id).addClass('active');
  $('.ui-autocomplete').hide();
  $(this).val('');
});

// Add motion to list
$('.moderated_caucus #submit').on('click', function() {
  var proposer = $('#proposer').val(),
      totalTime = $('.moderated_caucus #totalTime').val(),
      speechTime = $('.moderated_caucus #speechTime').val(),
      topic = $('.moderated_caucus #topic').val();

  if(!proposer || !totalTime || !speechTime || !topic) {
    alert('Please complete all fields');
  }
  else if(!parseInt(totalTime) || !parseInt(speechTime)) {
    alert('Please ensure that the total and speech times are integers');
  }
  else if((parseInt(totalTime) * 60) % parseInt(speechTime) != 0) {
    alert('The total time should accomodate an exact number of speakers');
  }
  else {
    var li = document.createElement('li');
    li.innerHTML = '<text>Motion for <span>Moderated Caucus</span> proposed by <span id="proposer">'
                   + proposer + '</span> for <span id="totalTime">' + totalTime + '</span> minutes, <span id="speechTime">'
                   + speechTime + '</span> seconds per speech, to discuss the topic <span id="topic">'
                   + topic + '</span></text>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();
    $('input').val('');

    $('.motionController .fa-check').on('click', function() {
      var motion = $(this.parentElement.parentElement),
          countryCode = findCountryCode(motion.find('#proposer').text()),
          totalTime = motion.find('#totalTime').text(),
          speechTime = motion.find('#speechTime').text();

      window.location.href = '/committee/disec/moderated/' + countryCode + '/' + totalTime + '/' + speechTime;
    });
  }
});

$('.unmoderated_caucus #submit').on('click', function() {
  var proposer = $('#proposer').val(),
      totalTime = $('.unmoderated_caucus #totalTime').val(),
      topic = $('.unmoderated_caucus #topic').val();

  if(!proposer || !totalTime || !topic) {
    alert('Please complete all fields');
  }
  else if(!parseInt(totalTime)) {
    alert('Please ensure that the total and speech times are integers');
  }
  else {
    var li = document.createElement('li');
    li.innerHTML = '<text>Motion for <span>Unmoderated Caucus</span> proposed by <span id="proposer">'
                   + proposer + '</span> for <span id="totalTime">' + totalTime
                   + '</span> minutes, to discuss the topic <span id="topic">'
                   + topic + '</span></text>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();
    $('input').val('');

    $('.motionController .fa-check').on('click', function() {
      var motion = $(this.parentElement.parentElement),
          countryCode = findCountryCode(motion.find('#proposer').text()),
          totalTime = motion.find('#totalTime').text();

      window.location.href = '/committee/disec/unmoderated/' + countryCode + '/' + totalTime;
  });
  }
});

$('.consultation_of_the_whole #submit').on('click', function() {
  var proposer = $('#proposer').val(),
      totalTime = $('.consultation_of_the_whole #totalTime').val(),
      topic = $('.consultation_of_the_whole #topic').val();

  if(!proposer || !totalTime || !topic) {
    alert('Please complete all fields');
  }
  else if(!parseInt(totalTime)) {
    alert('Please ensure that the total and speech times are integers');
  }
  else {
    var li = document.createElement('li');
    li.innerHTML = '<text>Motion for <span>Consultation of the Whole</span> proposed by <span id="proposer">'
                   + proposer + '</span> for <span id="totalTime">' + totalTime
                   + '</span> minutes, to discuss the topic <span id="topic">'
                   + topic + '</span></text>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();
    $('input').val('');

    $('.motionController .fa-check').on('click', function() {
      var motion = $(this.parentElement.parentElement),
          countryCode = findCountryCode(motion.find('#proposer').text()),
          totalTime = motion.find('#totalTime').text();

      window.location.href = '/committee/disec/consultation/' + countryCode + '/' + totalTime;
    });
  }
});

$('.other #submit').on('click', function() {
  var proposer = $('#proposer').val(),
      topic = $('.other #topic').val();

  if(!proposer || !topic) {
    alert('Please complete all fields');
  }
  else {
    var li = document.createElement('li');
    li.innerHTML = '<text>Motion proposed by <span id="proposer">' + proposer
                   + '</span> to <span id="topic">' + topic + '</span></text>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();
    $('input').val('');
  }
});

/* Moderated Caucus Speakers List */
var quorumNames = quorumDelegates.map(function(country){ return country.name; });

$('#add-country').autocomplete({ source: quorumNames })
.bind('keydown', function(){
  if ($(this).val() == '') {
    $('.ui-autocomplete').hide();
  }
  else if (window.event.keyCode == 13) {
    addToSpeakersList($(this).val());
    $('.ui-autocomplete').hide();
    $(this).val('');
  }
  else {
    $(this).autocomplete('search');
    $('.ui-autocomplete').show();
  }
});

// Motions list autocomplete
$('form .proposerField').autocomplete({ source: quorumNames })
.bind('keydown', function(){
  if ($(this).val() == '') {
    $('.ui-autocomplete').hide();
  }
  else if (window.event.keyCode == 13) {
    $('.ui-autocomplete').hide();
  }
  else {
    $(this).autocomplete('search');
    $('.ui-autocomplete').show();
  }
});

function addToSpeakersList(countryName) {
  // Left menu logic
  var li = document.createElement('li');
  li.innerHTML = countryName;

  var speakersLeft = parseInt($('#speakers-left').text());
  if (speakersLeft <= 1) {
    $('#input-area').remove();
  }

  $('#speakers-left').text(speakersLeft - 1);
  $('#speakers-list').append(li);
  $('#add-country').autocomplete({ source: quorumNames });

  // Card logic
  var card = document.createElement('li');
  var image = document.createElement('img');
  var name = document.createElement('h1');

  card.className = 'country-card';
  image.className = 'country-flag';
  name.className = 'country-name';

  image.src = '/images/' + countryName + '.png';
  name.textContent = countryName;

  card.appendChild(image);
  card.appendChild(name);
  $('.country-card-placeholder').before(card);
}
