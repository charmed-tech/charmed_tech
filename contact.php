<?php

// define variables and set to empty values
$nameEntry = $subjectEntry = $emailEntry = $websiteEntry = $messageEntry = '';

/* Set e-mail recipient */
$myEmail  = "email@charmedsatyr.com";

/* PHP cleaning functions */
function check_input($data)
{
    $data = trim($data); //Remove extra spaces
    $data = stripslashes($data); //Remove escape slashes
    $data = htmlspecialchars($data); //Remove special characters like brackets
    return $data;
}

/* Check all form inputs using check_input function */
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$nameEntry = check_input($_POST['nameEntry']);
$subjectEntry  = check_input($_POST['subjectEntry']);
$emailEntry    = check_input($_POST['emailEntry']);
$websiteEntry  = check_input($_POST['websiteEntry']);
$messageEntry = check_input($_POST['messageEntry']);
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
header('Location: thanks.html');

?>
