$('#submitNote').on('click', function() {
  var note = $('textArea').val();

  if (!note) {
    alert('You cannot save empty notes')
  }
  else {
    $.ajax({
      type: 'POST',
      url: 'addnote',
      data: { note: nl2br(note) }
    });

    $('#no-notes').remove();

    var li = document.createElement('li');
    li.innerHTML = nl2br(note);

    $(li).on('click', function() {
      var note = $(this).text();
      $('textArea').val(note);
    });
    
    $('#allNotes').prepend(li);
  }
});


$('#allNotes li').on('click', function() {
  var note = $(this).text();
  $('textArea').val(note);
});
