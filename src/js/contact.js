$('#submit').click(function() {
  //Error handling for nameEntry
  var nameEntry = $('input[name=nameEntry]').val()
  var nameRegex = /^[a-zA-Z -]*$/

  if (!nameEntry.match(nameRegex)) {
    $('#nameError').html('Only letters, hyphens, and whitespaces are allowed.')
  } else if (nameEntry === '') {
    $('#nameError').html('Please enter your name.')
  } else {
    $('#nameError').html('')
  }

  //Error handling for emailEntry
  var emailEntry = $('input[name=emailEntry]').val()
  var emailRegex = /([\w\-]+\@[\w\-]+\.[\w\-].+)/

  if (!emailEntry.match(emailRegex)) {
    $('#emailError').html('Invalid email format.')
  } else if (emailEntry === '') {
    $('#emailError').html('Please include an email address.')
  } else {
    $('#emailError').html('')
  }

  //Error handling for websiteEntry
  var websiteEntry = $('input[name=websiteEntry]').val()
  var websiteRegex = /[<>{}!`'"$*;\\]/gi

  if (websiteEntry.match(websiteRegex)) {
    $('#websiteError').html('Invalid website format.')
  } else {
    $('#websiteError').html('')
  }

  //Error handling for subjectEntry
  var subjectEntry = $('input[name=subjectEntry]').val()
  var subjectRegex = /[<>{}]/

  if (subjectEntry.match(subjectRegex)) {
    $('#subjectError').html('Please include a subject.')
  } else if (subjectEntry === '') {
    $('#subjectError').html('Please include a subject.')
  } else {
    $('#subjectError').html('')
  }

  //Error handling for messageEntry
  var messageEntry = $('textarea[name=messageEntry]').val()

  if (messageEntry === '') {
    $('#messageError').html("Didn't you mean to write a message?")
  } else {
    $('#messageError').html('')
  }
})
