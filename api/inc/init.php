<?php

/**
 * MASTER LOGIN SYSTEM
 * @author Mihai Ionut Vilcu (ionutvmi@gmail.com)
 * June 2013
 *
 */


session_start();

$set = new stdClass(); // stores general settings
$page = new stdClass(); // stores page details(title,... etc.)
$page->navbar = array(); // stores the navbar items

define("MLS_ROOT", dirname(dirname(__FILE__))); // the root path


include "settings.php";

include MLS_ROOT."/lib/mysql.class.php";
include MLS_ROOT."/lib/users.class.php";
include MLS_ROOT."/lib/presets.class.php";
include MLS_ROOT."/lib/options.class.php";


$db = new SafeMySQL(array(
	'host' 	=> $set->db_host, 
	'user'	=> $set->db_user, 
	'pass'	=> $set->db_pass, 
	'db'=> $set->db_name));

if(!($db_set = $db->getRow("SELECT * FROM `".MLS_PREFIX."settings` LIMIT 1"))) { // if we have no data in db we need to run the install.php
	header("Location: install.php");
	exit;
}

// we grab the settings and we merge them into $set
$set = (object)array_merge((array)$set,(array)$db_set);

$presets = new presets;
$user = new User($db);
$options = new Options;





// we check for cookies to autologin
if(!$user->islg() && isset($_COOKIE['user']) && isset($_COOKIE['pass'])) {
	 if($usr = $db->getRow("SELECT `userid` FROM `".MLS_PREFIX."users` WHERE `username` = ?s AND `password` = ?s", $_COOKIE['user'], $_COOKIE['pass'])) {
	 	$_SESSION['user'] = $usr->userid;
	 	$user = new User($db);
	}

} else {
	
	$time = time();
	
	if(!isset($_SESSION['last_log']))
		$_SESSION['last_log'] = 0;
	

	if($_SESSION['last_log'] < $time - 60 * 2){ // we update the db if more then 2 minutes passed since the last update
		$db->query("UPDATE `".MLS_PREFIX."users` SET `lastactive` = '".$time."' WHERE `userid`='".$user->data->userid."'");
		$_SESSION['last_log'] = $time;
	}
}

function encode_token($str) {
    
    return base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5(KOPIER_SALT), $str, MCRYPT_MODE_CBC, md5(md5(KOPIER_SALT))));
}

function decode_token($str) {
    return rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5(KOPIER_SALT), base64_decode($str), MCRYPT_MODE_CBC, md5(md5(KOPIER_SALT))), "\0");
}

function encode_id($str) {
    return alphaID($str);
}

function decode_id($str) {    
    return alphaID($str, true);
}

function alphaID($in, $to_num = false, $pad_up = false, $pass_key = null)
{
  $out   =   '';
  $index = 'z89ghijklmnopCDEauvFG014567HIJwxy23KLMNABbcdefOPQRSTqrstUVWXYZ';
  $base  = strlen($index);

  if ($pass_key !== null) {
    // Although this function's purpose is to just make the
    // ID short - and not so much secure,
    // with this patch by Simon Franz (http://blog.snaky.org/)
    // you can optionally supply a password to make it harder
    // to calculate the corresponding numeric ID

    for ($n = 0; $n < strlen($index); $n++) {
      $i[] = substr($index, $n, 1);
    }

    $pass_hash = hash('sha256',$pass_key);
    $pass_hash = (strlen($pass_hash) < strlen($index) ? hash('sha512', $pass_key) : $pass_hash);

    for ($n = 0; $n < strlen($index); $n++) {
      $p[] =  substr($pass_hash, $n, 1);
    }

    array_multisort($p, SORT_DESC, $i);
    $index = implode($i);
  }

  if ($to_num) {
      
    
      
    // Digital number  <<--  alphabet letter code
    $len = strlen($in) - 1;

    for ($t = $len; $t >= 0; $t--) {
      $bcp = bcpow($base, $len - $t);
      $out = $out + strpos($index, substr($in, $t, 1)) * $bcp;
    }

    if (is_numeric($pad_up)) {
      $pad_up--;

      if ($pad_up > 0) {
        $out -= pow($base, $pad_up);
      }
    }
        
  } else {
            
    // Digital number  -->>  alphabet letter code
    if (is_numeric($pad_up)) {
      $pad_up--;

      if ($pad_up > 0) {
        $in += pow($base, $pad_up);
      }
    }

    for ($t = ($in != 0 ? floor(log($in, $base)) : 0); $t >= 0; $t--) {
      $bcp = bcpow($base, $t);
      $a   = floor($in / $bcp) % $base;
      $out = $out . substr($index, $a, 1);
      $in  = $in - ($a * $bcp);
    }
    
  }

  return $out;
}

/**
 * extract the token from the Authorization header
 */
function getToken() {
    //Authorization: Bearer TOKEN  is how the token will be transferred
    $auth_header = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : null;
                
    if (!$auth_header)
        return;
        
    //make sure it's the bearer type
    if (strtolower(substr($auth_header,0,7)) == 'bearer ')
        return json_decode( decode_token(substr($auth_header,7)) );

    return null;
}

