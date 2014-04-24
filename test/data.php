<?
require("../server/php/w2db.php");
require("../server/php/w2lib.php");

$dbType = 'postgres';

$db = new dbConnection("postgres");
$db->connect("127.0.0.1", "postgres", "", "postgres", "5432");

// $fname = Array('Vitali', 'Katie', 'John', 'Peter', 'Sue', 'Olivia', 'Thomas', 'Sergei', 'Sue', 'Frank', 'Divia',
//     'Amy', 'Bill', 'Thomas', 'Emma', 'Gloria', 'Jack', 'April', 'Rose');
// $lname = Array('Peterson', 'Rene', 'Johnson', 'Petrov', 'Sannikov', 'Ivanov', 'Smirnov', 'Cuban', 'Twist', 'Sidorov', 'Vasiliev', 'Homchan', 'Stalone', 
//     'Cruz', 'Mascovits', 'Welldo', 'Duck', 'Green', 'Silver', 'Behe', 'Gould');


// for ($i=1; $i<=0; $i++) {
//     $fname1 = $fname[rand(0, count($fname)-1)];
//     $lname1 = $lname[rand(0, count($lname)-1)];
//     $sql = "INSERT INTO people (fname, lname, email, manager) 
//             VALUES('".$fname1."',
//                    '".$lname1."',
//                    '".strtolower(substr($fname1, 0, 1).$lname1)."@mail.com', 
//                    '".$lname[rand(0, count($lname)-1)]."')";
//     $db->execute($sql);
//     if ($i % 100 == 0) { print("*"); ob_flush(); flush(); }
// }

switch ($_REQUEST['name']."::".$_REQUEST['cmd']) {

    case 'grid::get-records':
        $sql  = "SELECT * FROM (SELECT * FROM people ORDER BY OID LIMIT 224) as sub
                WHERE ~search~ ORDER BY ~sort~";
        $res = $w2grid->getRecords($sql, null, $_REQUEST);
        $w2grid->outputJSON($res);
        break;

    default:
        $res = Array();
        $res['status']  = 'error';
        $res['message'] = 'Command "'.$_REQUEST['cmd'].'" is not recognized.';
        $res['postData']= $_REQUEST;
        $w2grid->outputJSON($res);
        break;
}

?>