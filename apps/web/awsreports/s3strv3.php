<?php
require 'vendor/autoload.php';

$client = new Aws\S3\S3Client([
    'region'  => 'ap-southeast-1',
    'version' => '2006-03-01',
]);

use Aws\S3\S3Client;

/*
$client = S3Client::factory([
    'region'  => 'ap-southeast-1',
    'version' => '2006-03-01',
]);
*/

// Register the Amazon S3 stream wrapper
$client->registerStreamWrapper();

$key = 'OBDTable_mmmYYYY/OBDTable_mmmYYYY-04282017-053030.xls.gz';
$bucket = 'abhcs-hello-ddb';

// Download the body of the "key" object in the "bucket" bucket
$file = 's3://'.$bucket.'/'.$key;
//$data = file_get_contents($file);

if (file_exists($file)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="'.basename($file).'"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

//readfile($file);

/*
// Open a stream in read-only mode
if ($stream = fopen($link, 'r')) {
    // While the stream is still open
    while (!feof($stream)) {
        // Read 1024 bytes from the stream
        echo fread($stream, 1024);
    }
    // Be sure to close the stream resource when you're done with it
    fclose($stream);
}
*/



