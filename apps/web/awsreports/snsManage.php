<?php
require 'vendor/autoload.php';

$client = new Aws\Sns\SnsClient([
    'region'  => 'ap-southeast-1',
    'version' => 'latest',
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

$topic_arn = "arn:aws:sns:ap-southeast-1:658774400218:MyIoTTestTopic";

$params = [
    TopicArn => $topic_arn,
    //NextToken: 'STRING_VALUE'
];

/*
$result = $client->listSubscriptionsByTopic([
   'NextToken' => '<string>',
   'TopicArn' => '<string>', // REQUIRED
]);
 */

$result = $client->listSubscriptionsByTopic($params);

$subsItem = $result[Subscriptions][0];
$subsarn = $subsItem[SubscriptionArn];

/*
$result_un = $client->unsubscribe([
    'SubscriptionArn' => $subsarn, // REQUIRED
]);
*/

$num = '+65'.<number>;
$proto = 'sms';

$result_sub = $client->subscribe([
    'Endpoint' => $num,
    'Protocol' => $proto, // REQUIRED
    'TopicArn' => $topic_arn, // REQUIRED
]);

//print_r($subsarn);
//print_r($result_un);
print_r($result_sub);

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


