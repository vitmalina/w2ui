<?php

require("w2db.php");
require("w2lib.php");

$db = new dbConnection("mysql");
$db->connect("127.0.0.1", "root", "", "test", "3306");

$jsonTexto = $_POST['request'];       //takes the request as a string and transforms it into an array
$decodedTexto = html_entity_decode($jsonTexto);
$miArray = json_decode($decodedTexto, true);


switch ($miArray['cmd']) {

    case 'get':
        if (array_key_exists('recid', $miArray)){  // if true , then is a 'get-record' only one record with recid
            $sql = "SELECT userid, fname, lname, email, login, password
                    FROM users
                    WHERE userid = ".$miArray['recid'];
            $res = $w2grid->getRecord($sql);
        }
        else{        
            $sql  = "SELECT * FROM users       
                     WHERE ~search~ ORDER BY ~sort~";
            $res = $w2grid->getRecords($sql, null, $miArray);
        }  
         $w2grid->outputJSON($res);
        break;

    case 'delete':
        $res = $w2grid->deleteRecords("users", "userid", $miArray);
        $w2grid->outputJSON($res);
        break;

    //case 'get-record':
    //    break;

    case 'save':
        $res = $w2grid->saveRecord('users', 'userid', $miArray);
        $w2grid->outputJSON($res);
        break;

    default:
        $res = Array();
        $res['status']  = 'error';
        $res['message'] = 'Command "'.$miArray['cmd'].'" is not recognized.';
        $res['postData']= $miArray;
        $w2grid->outputJSON($res);
        break;
}
