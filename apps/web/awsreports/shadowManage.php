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

$shadow = $result['payload'];

/*
*/

$arr = array('a' => 1, 'b' => 2);

$payload_json = [
                "state": [
                    "desired": [
                        "spike_threshold":98,
                        "location":"ArkTest"
                    ]
                ]
            ]


$payload = json_encode($payload_json);

$result_mod = $client->updateThingShadow([
    'payload' => $payload,
    'thingName' => $station_id,
]);

print_r($result_mod);

/*
 */


