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
readObject($client, $bucket, $key);


/**
 * Streams an object from Amazon S3 to the browser
 *
 * @param S3Client $client Client used to send requests
 * @param string   $bucket Bucket to access
 * @param string   $key    Object to stream
 */
function readObject(S3Client $client, $bucket, $key)
{
    // Begin building the options for the HeadObject request
    $options = array('Bucket' => $bucket, 'Key' => $key);

    // Check if the client sent the If-None-Match header
    if (isset($_SERVER['HTTP_IF_NONE_MATCH'])) {
        $options['IfNoneMatch'] = $_SERVER['HTTP_IF_NONE_MATCH'];
    }

    // Check if the client sent the If-Modified-Since header
    if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
        $options['IfModifiedSince'] = $_SERVER['HTTP_IF_MODIFIED_SINCE'];
    }

    // Create the HeadObject command
    $command = $client->getCommand('HeadObject', $options);
    
    $response = $command->getResponse();
/*
    try {
        $response = $command->getResponse();
    } catch (AwsS3ExceptionS3Exception $e) {
    } catch (Aws\S3\Exception\S3Exception $e) {
        // Handle 404 responses
        http_response_code(404);
        exit;
    }
*/
    // Set the appropriate status code for the response (e.g., 200, 304)
    $statusCode = $response->getStatusCode();
    http_response_code($statusCode);

    // Let's carry some headers from the Amazon S3 object over to the web server
    $headers = $response->getHeaders();
    $proxyHeaders = array(
        'Last-Modified',
        'ETag',
        'Content-Type',
        'Content-Disposition'
    );

    foreach ($proxyHeaders as $header) {
        if ($headers[$header]) {
            header("{$header}: {$headers[$header]}");
        }
    }

    // Stop output buffering
    if (ob_get_level()) {
        ob_end_flush();
    }

    flush();

    // Only send the body if the file was not modified
    if ($statusCode == 200) {
        readfile("s3://{$bucket}/{$key}");
    }
}


