<?php
require 'vendor/autoload.php';

$client = new Aws\IotDataPlane\IotDataPlaneClient([
    'region'  => 'ap-southeast-1',
    'version' => 'latest',
]);

use Aws\IotDataPlane\IotDataPlaneClient;

/*
$client = S3Client::factory([
    'region'  => 'ap-southeast-1',
    'version' => '2006-03-01',
]);
*/


$station_id = "CWS001";

$params = [
    'thingName' => $station_id,
];

/*
 */

$result = $client->getThingShadow($params);
//print_r($result);

$shadow = $result['payload']->getContents();
//print_r($shadow);
//echo $shadow;
$shadow_j = json_decode($shadow);
//echo $shadow['state']['reported'];
print_r($shadow_j->state->reported);

/*
*/

$payload_json = array(
                  'state' => array(
                    'desired' => array(
                        'location' => "ArkTest2"
                    )
                )
            );


$payload = json_encode($payload_json);

/*
$result_mod = $client->updateThingShadow([
    'payload' => $payload,
    'thingName' => $station_id,
]);


print_r($result_mod);
*/

/*
 */


