<?php
require 'vendor/autoload.php';

$client = new Aws\Sns\SnsClient([
    'region'  => 'ap-southeast-1',
    'version' => '2006-03-01',
]);

use Aws\Sns\SnsClient;

/*
$client = S3Client::factory([
    'region'  => 'ap-southeast-1',
    'version' => '2006-03-01',
]);
*/


$station_id = "WL1001";

//$topic = "arn:aws:sns:ap-southeast-1:658774400218:" + $station_id;

$params = [
    TopicArn => "arn:aws:sns:ap-southeast-1:658774400218:MyIoTTestTopic",
    //NextToken: 'STRING_VALUE'
];

/*
$result = $client->listSubscriptionsByTopic([
   'NextToken' => '<string>',
   'TopicArn' => '<string>', // REQUIRED
]);
 */

$result = $client->listSubscriptionsByTopic($params);

print_r($result);

/*
	[
	       'NextToken' => '<string>',
	       'Subscriptions' => [
	            [
	                 'Endpoint' => '<string>',
                 'Owner' => '<string>',
            'Protocol' => '<string>',
            'SubscriptionArn' => '<string>',
            'TopicArn' => '<string>',
        ],
        // ...
	//     ],
	//     ]	
 
 */


