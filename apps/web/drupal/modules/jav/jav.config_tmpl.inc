<?php
function getExtDBConfig() {
    $jav_db = array(
        'database' => 'mydb',
        'username' => 'user', 
        'password' => 'pass',  
        'host' => 'localhost',  
        'driver' => 'mysql',  
    );
    return $jav_db;
}
/*
return [
    'database' => [
        'host' => 'localhost',
        'name' => 'somedb',
        'user' => 'someuser',
        'pass' => 'somepass'
    ],
    'other-stuff' => ...
];
*/
?>
