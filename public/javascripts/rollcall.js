$(document).keydown(function(e) {
  var elementId = $('.country-card')[0].id;
  switch(e.which) {
    case 37: // left
      logAttendance(elementId, false);
      e.preventDefault();
      break;
    case 39: // right
      logAttendance(elementId, true);
      e.preventDefault();
      break;
  }
});

$('.fa-thumbs-down').each(function(index, element) {
  $(element).on('click', function() {
    var countryCode = element.attributes.data.value;
    logAttendance(countryCode, false);
  })
});

$('.fa-thumbs-up').each(function(index, element) {
  $(element).on('click', function() {
    var countryCode = element.attributes.data.value;
    logAttendance(countryCode, true);
  })
});

function logAttendance(countryCode, attendance) {
  attendance = attendance ? 1 : 0;
  $.ajax({
    type: "POST",
    url: 'logcountry/' + countryCode + '/' + (attendance ? 'P' : 'A')
  });

  /* Roll Call math magic */
  var counting = $('#quorum').attr('count');
  var quorum = parseInt($('#quorum').text())
  quorum += attendance;

  var sm = quorum ? Math.floor(quorum / 2) + 1 : 0,
      qm = quorum ? Math.ceil(2 * quorum / 3) : 0;

  $('#quorum').text(quorum);
  $('#sm').text(sm);
  $('#qm').text(qm);

  // decide if it should continue in rollcall or move to motions
  if($('.country-card').length <= 1) {
    window.location.replace('motions');
  } else {
    $('#' + countryCode).remove();
  }

  if(quorum < parseInt($('#committee-data').attr('data')) / 3) {
    $('#quorum').addClass('belowQuorum');
  } else {
    $('#quorum').removeClass('belowQuorum');
  }
}

$(function() {
  updateAutocomplete();
});
