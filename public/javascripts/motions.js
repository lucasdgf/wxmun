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
  window.location.href = '/committee/' + this.getAttribute('data').toLowerCase() + '/motions';
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


$('.inputArea').hide();
$('.' + $('li.active')[1].id).show();

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

// Motion selector
$('#inputToggle li').on('click', function() {
  $('#inputToggle li').removeClass('active');
  $(this).addClass('active');
  $('.inputArea').hide();
  $('.' + $('li.active')[1].id).show();
});

// Add motion to listvar timer = null;

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
  window.location.href = '/committee/' + this.getAttribute('data').toLowerCase() + '/motions';
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


$('.inputArea').hide();
$('.' + $('li.active')[1].id).show();

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

// Motion selector
$('#inputToggle li').on('click', function() {
  $('#inputToggle li').removeClass('active');
  $(this).addClass('active');
  $('.inputArea').hide();
  $('.' + $('li.active')[1].id).show();
});

// Add motion to list
$('.moderated_caucus #submit').on('click', function() {
  var proposer = $('.moderated_caucus #proposer').val(),
      totalTime = $('.moderated_caucus #totalTime').val(),
      speechTime = $('.moderated_caucus #speechTime').val(),
      topic = $('.moderated_caucus #topic').val();

  if(!proposer || !totalTime || !speechTime || !topic) {
    alert('Please complete all fields');
  } else {
    var li = document.createElement('li');
    li.innerHTML = 'Motion for <b>Moderated Caucus</b> proposed by <b>'
                   + $('.moderated_caucus #proposer').val()
                   + '</b> for <b>' + $('.moderated_caucus #totalTime').val()
                   + '</b> minutes, <b>' + $('.moderated_caucus #speechTime').val()
                   + '</b> seconds per speech, to discuss the topic <b>'
                   + $('.moderated_caucus #topic').val() + '</b>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();

    $('.motionController .fa-check').on('click', function() {
      window.location.href = '/committee/disec/moderated/' + $('.moderated_caucus #totalTime').val() + '/' + $('.moderated_caucus #speechTime').val();
      $('input').val('');
  });
  }
});

$('.unmoderated_caucus #submit').on('click', function() {
  var proposer = $('.unmoderated_caucus #proposer').val(),
      totalTime = $('.unmoderated_caucus #totalTime').val(),
      topic = $('.unmoderated_caucus #topic').val();

  if(!proposer || !totalTime || !topic) {
    alert('Please complete all fields');
  } else {
    var li = document.createElement('li');
    li.innerHTML = 'Motion for <b>Unmoderated Caucus</b> proposed by <b>'
                   + $('.unmoderated_caucus #proposer').val()
                   + '</b> for <b>' + $('.unmoderated_caucus #totalTime').val()
                   + '</b> minutes, to discuss the topic <b>'
                   + $('.unmoderated_caucus #topic').val() + '</b>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();

    $('.motionController .fa-check').on('click', function() {
      window.location.href = '/committee/disec/unmoderated/ANDR/' + $('.unmoderated_caucus #totalTime').val();
      $('input').val('');
  });
  }
});

$('.consultation_of_the_whole #submit').on('click', function() {
  var proposer = $('.consultation_of_the_whole #proposer').val(),
      totalTime = $('.consultation_of_the_whole #totalTime').val(),
      topic = $('.consultation_of_the_whole #topic').val();

  if(!proposer || !totalTime || !topic) {
    alert('Please complete all fields');
  } else {
    var li = document.createElement('li');
    li.innerHTML = 'Motion for <b>Consultation of the Whole</b> proposed by <b>'
                   + $('.consultation_of_the_whole #proposer').val()
                   + '</b> for <b>' + $('.consultation_of_the_whole #totalTime').val()
                   + '</b> minutes, to discuss the topic <b>'
                   + $('.consultation_of_the_whole #topic').val() + '</b>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();

    $('.motionController .fa-check').on('click', function() {
      window.location.href = '/committee/disec/consultation/ANDR/' + $('.consultation_of_the_whole #totalTime').val();
      $('input').val('');
  });
  }
});

$('.other #submit').on('click', function() {
  var proposer = $('.other #proposer').val(),
      topic = $('.other #topic').val();

  if(!proposer || !topic) {
    alert('Please complete all fields');
  } else {
    var li = document.createElement('li');
    li.innerHTML = 'Motion for <b>' + $('.other #topic').val()
                   + '</b> to <b>'
                   + $('.other #topic').val() + '</b>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();
  }
});

$('.proposerField').autocomplete({ source: quorumDelegates })
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

$('.moderated_caucus #submit').on('click', function() {
  var proposer = $('.moderated_caucus #proposer').val(),
      totalTime = $('.moderated_caucus #totalTime').val(),
      speechTime = $('.moderated_caucus #speechTime').val(),
      topic = $('.moderated_caucus #topic').val();

  if(!proposer || !totalTime || !speechTime || !topic) {
    alert('Please complete all fields');
  } else {
    var li = document.createElement('li');
    li.innerHTML = 'Motion for <b>Moderated Caucus</b> proposed by <b>'
                   + $('.moderated_caucus #proposer').val()
                   + '</b> for <b>' + $('.moderated_caucus #totalTime').val()
                   + '</b> minutes, <b>' + $('.moderated_caucus #speechTime').val()
                   + '</b> seconds per speech, to discuss the topic <b>'
                   + $('.moderated_caucus #topic').val() + '</b>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();

    $('.motionController .fa-check').on('click', function() {
      window.location.href = '/committee/disec/moderated/' + $('.moderated_caucus #totalTime').val() + '/' + $('.moderated_caucus #speechTime').val();
      $('input').val('');
  });
  }
});

$('.unmoderated_caucus #submit').on('click', function() {
  var proposer = $('.unmoderated_caucus #proposer').val(),
      totalTime = $('.unmoderated_caucus #totalTime').val(),
      topic = $('.unmoderated_caucus #topic').val();

  if(!proposer || !totalTime || !topic) {
    alert('Please complete all fields');
  } else {
    var li = document.createElement('li');
    li.innerHTML = 'Motion for <b>Unmoderated Caucus</b> proposed by <b>'
                   + $('.unmoderated_caucus #proposer').val()
                   + '</b> for <b>' + $('.unmoderated_caucus #totalTime').val()
                   + '</b> minutes, to discuss the topic <b>'
                   + $('.unmoderated_caucus #topic').val() + '</b>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();

    $('.motionController .fa-check').on('click', function() {
      window.location.href = '/committee/disec/unmoderated/ANDR/' + $('.unmoderated_caucus #totalTime').val();
      $('input').val('');
  });
  }
});

$('.consultation_of_the_whole #submit').on('click', function() {
  var proposer = $('.consultation_of_the_whole #proposer').val(),
      totalTime = $('.consultation_of_the_whole #totalTime').val(),
      topic = $('.consultation_of_the_whole #topic').val();

  if(!proposer || !totalTime || !topic) {
    alert('Please complete all fields');
  } else {
    var li = document.createElement('li');
    li.innerHTML = 'Motion for <b>Consultation of the Whole</b> proposed by <b>'
                   + $('.consultation_of_the_whole #proposer').val()
                   + '</b> for <b>' + $('.consultation_of_the_whole #totalTime').val()
                   + '</b> minutes, to discuss the topic <b>'
                   + $('.consultation_of_the_whole #topic').val() + '</b>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();

    $('.motionController .fa-check').on('click', function() {
      window.location.href = '/committee/disec/consultation/ANDR/' + $('.consultation_of_the_whole #totalTime').val();
      $('input').val('');
  });
  }
});

$('.other #submit').on('click', function() {
  var proposer = $('.other #proposer').val(),
      topic = $('.other #topic').val();

  if(!proposer || !topic) {
    alert('Please complete all fields');
  } else {
    var li = document.createElement('li');
    li.innerHTML = 'Motion for <b>' + $('.other #topic').val()
                   + '</b> to <b>'
                   + $('.other #topic').val() + '</b>';
    addController(li);
    $('ul#sortable').append(li);
    addActions();
  }
});

$('.proposerField').autocomplete({ source: quorumDelegates })
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
