<?php


include "inc/init.php";

$name = $_POST['name'];
$password = $_POST['password'];

$response = new stdClass;

if(!($usr = $db->getRow("SELECT `userid`, `username`, `display_name`, `email`,`groupid` FROM `".MLS_PREFIX."users` WHERE `username` = ?s AND `password` = ?s", $name, sha1($password))))
    $response->error = "wrong user or password";
else {
    
    $usr->userid = encode_id($usr->userid);
    
    $user = new stdClass;
    
    $user->userid = encode_id(intval($usr->userid));
    $user->username = $usr->username;
    $user->display_name = $usr->display_name;
    $user->email = $usr->email;
    $user->groupid = intval($usr->groupid);
    
    $response->user = $user;
    $response->token = encode_token(json_encode($usr));
}

header('Content-Type: application/json');

echo json_encode($response);