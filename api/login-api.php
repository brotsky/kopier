<?php


include "inc/init.php";

$name = $_POST['name'];
$password = $_POST['password'];


$response = new stdClass;

if(!($usr = $db->getRow("SELECT `userid`, `username`, `email`,`groupid` FROM `".MLS_PREFIX."users` WHERE `username` = ?s AND `password` = ?s", $name, sha1($password))))
    $response->error = "wrong user or password";
else {
    $response->user = $usr;
    $response->token = encode_token(json_encode($usr));
}

header('Content-Type: application/json');

echo json_encode($response);