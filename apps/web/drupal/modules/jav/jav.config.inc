<?php
function getExtDBConfig() {
    $bg_db = array(
        'database' => 'mydb',
        'username' => 'user', 
        'password' => 'pass',  
        'host' => 'localhost',  
        'driver' => 'mysql',  
    );
    return $bg_db;
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
