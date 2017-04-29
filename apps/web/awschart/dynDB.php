<?php
// For AWS
require 'vendor/autoload.php';

//date_default_timezone_set('UTC');
use Aws\DynamoDb\Exception\DynamoDbException;
use Aws\DynamoDb\Marshaler;

function _getdata_dyndb($reqtype, $filter)
{
    $sdk = new Aws\Sdk([
        'region' => 'ap-southeast-1',
        'version' => 'latest',
    ]);

//global $sdk;
    try {
        $dynamodb = $sdk->createDynamoDb();
    } catch (DynamoDbException $e) {
        echo $e->getMessage() . "\n";
    }

    $marshaler = new Marshaler();
    //$tableName = 'OBDTable_mmmYYYY';
    $tableName = 'wlTest';
    //global $dynamodb, $marshaler, $tableName;
    // From admin page.
    //$max_num = variable_get('bgmap_max', 3);
    //$sid_list = $filter[sidList];
    //$sid_list = $filter->sidList;
    //$start_time = $filter->start;
    //$end_time = $filter->end;
  
    $result = array();
    
    if ($reqtype == 'rt') {
        $sid = $filter->sid;
        $params = [
            'TableName' => $tableName,
            'ProjectionExpression' => '#ts, wl',
            'KeyConditionExpression' =>
                'sid = :o_id',
            'ScanIndexForward' => false,
            'Limit' => 1,
            'ExpressionAttributeNames' => ['#ts' => 'ts'],
            'ExpressionAttributeValues' => [
                ':o_id' => ['S' => $sid]
            ],
            'ConsistentRead' => false
        ];

        try {
            $result_dyn = $dynamodb->query($params);
            foreach ($result_dyn['Items'] as $i) {
            //$i = $result_dyn['Items'];
            $result = $marshaler->unmarshalItem($i);
            //print_r($gps_data);
            }
            //$gps_data = $marshaler->unmarshalItem($result);
            //print_r($result);
            //dpm($result['Items']);
        } catch (DynamoDbException $e) {
            echo "Unable to query:\n";
            echo $e->getMessage() . "\n";
        }
    }
    if ($reqtype == 'trc') {
        $sid = $filter->sid;
        // Bug: https://forums.aws.amazon.com/thread.jspa?messageID=752661&#752661
        $start_time = (string)$filter->start;
        $end_time = (string)$filter->end;
/*
        $sid = '213EP2016000570';
        $start_time =  '1480565971000';
        $end_time = '1480567044000';
*/
        $params = [
            'TableName' => $tableName,
            'ProjectionExpression' => '#ts, wl',
            'KeyConditionExpression' =>
                'sid = :o_id and #ts between :begin and :end',
            'ScanIndexForward' => true,
            'ExpressionAttributeNames' => ['#ts' => 'ts'],
            'ExpressionAttributeValues' => [
                ':o_id' => ['S' => $sid],
                ':begin' => ['N' => $start_time],
                ':end' => ['N' => $end_time]
            ],
            'ConsistentRead' => false
        ];

        try {
            $result_dyn = $dynamodb->query($params);
            foreach ($result_dyn['Items'] as $i) {
            //$i = $result_dyn['Items'];
            $result[] = $marshaler->unmarshalItem($i);
            //print_r($gps_data);
            }
        } catch (DynamoDbException $e) {
            echo "Unable to query:\n";
            echo $e->getMessage() . "\n";
        }
    }
    //dpm($result);
    return $result;
}




