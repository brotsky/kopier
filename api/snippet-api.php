<?php


include "inc/init.php";

$user = getToken();


if($_SERVER['REQUEST_METHOD'] == "POST") {
    
    $user_id = decode_id($user->userid);
    $html = $_POST['html'];
    $text = $_POST['text'];
    $images = $_POST['images'];
    $copied_from = $_POST['copied_from'];
    
    
    $snippet_data = array(
        "userid" => $user_id,
        "html" => $html,
        "text" => $text,
        "images" => json_encode($images),
        "copied_from" => $copied_from
    );
    
    
    $db->query("INSERT INTO `".MLS_PREFIX."snippets` SET ?u", $snippet_data);
    $snippet_id = $db->insertId();
    
    $id = encode_id($snippet_id);
    
    $response = new stdClass;
        
    header('Content-Type: application/json');
    
    if(!($s = $db->getRow("SELECT * FROM `".MLS_PREFIX."snippets` WHERE `snippetid`= ?i", $snippet_id))) {
        $response->error = "Error";
    } else {
        
        $snippet = new stdClass;
        $snippet->snippetid = encode_id($s->snippetid);
        $snippet->userid = encode_id($s->userid);
        $snippet->html = $s->html;
        $snippet->text = $s->text;
        $snippet->images = $s->images;
        $snippet->copied_from = $s->copied_from;
        $snippet->date_created = $s->data_created;
        $snippet->order = $s->order;
        
        $response->snippet = $snippet;
    }
    
    echo json_encode($response);
    
    
}
