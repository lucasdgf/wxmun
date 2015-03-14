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
    window.location.href = this.id;
  })
});

/* Left menu */
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
