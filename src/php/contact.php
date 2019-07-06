<?php

// define variables and set to empty values
$nameEntry = $subjectEntry = $emailEntry = $websiteEntry = $messageEntry = '';

/* Set e-mail recipient */
$myEmail  = "email@charmedsatyr.com";

/* PHP cleaning functions */
function check_input($data, $problem='')
{
    $data = trim($data); //Remove extra spaces
    $data = stripslashes($data); //Remove escape slashes
    $data = htmlspecialchars($data); //Remove special characters like brackets
    if ($problem && strlen($data) == 0)
    {
      show_error($problem);
    }
    return $data;
}

/* Check all form inputs using check_input function */
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$nameEntry = check_input($_POST['nameEntry'], "Enter your name."); //If name doesn't pass, return the show_error function saying "Enter your name"
$subjectEntry  = check_input($_POST['subjectEntry'], "Write a subject.");
$emailEntry    = check_input($_POST['emailEntry']);
$websiteEntry  = check_input($_POST['websiteEntry']);
$messageEntry = check_input($_POST['messageEntry'], "Write your comments.");
}

/* If e-mail is not valid show error message */
if (!preg_match("/([\w\-]+\@[\w\-]+\.[\w\-].+)/", $emailEntry))
{
    show_error("E-mail address not valid");
}

/* Let's prepare the message for the e-mail */
$messageSent = "Hello!

Your contact form has been submitted by:

Name: $nameEntry
E-mail: $emailEntry
URL: $websiteEntry

message: $messageEntry

End of message
";

/* Send the message using mail() function */
mail($myEmail, $subjectEntry, $messageSent);

/* Redirect visitor to the thank you page */
header('Location: thanks/');
exit();

/*
  redirect('thanks.html', false);
  function redirect($url, $permanent = false)
  {
    header('Location: ' . $url, true, $permanent ? 301 : 302);
  };
*/

function show_error($myError)
{
?>
    <html>
    <body>

    <b>Please correct the following error:</b><br />
    <?php echo $myError; ?>

    </body>
    </html>
<?php
  exit();
  }
?>
