<?php


include "inc/init.php";

$user = getToken();
$user_id = decode_id($user->userid);

if($_SERVER['REQUEST_METHOD'] == "POST") {
    
    
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
} else  {
    $perpage = 10;
    $start = 0;
    $sort_type = true;
    $order_by = "`snippetid` ". (!$sort_type ? "ASC" : "DESC");
    $order_by .= ", `order` ". (!$sort_type ? "ASC" : "DESC");
    $where = $db->parse("WHERE `userid` LIKE ?s", '%'.$user_id.'%');
    
    $data = $db->getAll("SELECT * FROM `".MLS_PREFIX."snippets` ?p ORDER BY ?p LIMIT ?i,?i", $where, $order_by, $start, $perpage);
        
    
    $snippets = array();
    foreach($data as $s) {
        $snippet = new stdClass;
        $snippet->snippetid = encode_id($s->snippetid);
        $snippet->userid = encode_id($s->userid);
        $snippet->html = $s->html;
        $snippet->text = $s->text;
        $snippet->images = $s->images;
        $snippet->copied_from = $s->copied_from;
        $snippet->date_created = $s->data_created;
        $snippet->order = $s->order;
        
        $snippets[] = $snippet;
    }
    
    header('Content-Type: application/json');
    echo json_encode($snippets);
    
}
