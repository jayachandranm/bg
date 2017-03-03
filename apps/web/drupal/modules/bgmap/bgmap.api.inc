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
        'credentials' => [
            'key' => 'mykey',
            'secret' => 'mysecret',
        ],
    ]);

//global $sdk;
    try {
        $dynamodb = $sdk->createDynamoDb();
    } catch (DynamoDbException $e) {
        echo $e->getMessage() . "\n";
    }

    $marshaler = new Marshaler();
    $tableName = 'OBDTable_mmmYYYY';
    //global $dynamodb, $marshaler, $tableName;
    // From admin page.
    //$max_num = variable_get('bgmap_max', 3);
    //$sid_list = $filter[sidList];
    $sid_list = $filter->sidList;
    $start_time = $filter->start;
    $end_time = $filter->end;
    if ($reqtype == 'rt') {
        foreach ($sid_list as $sid) {
            $params = [
                'TableName' => $tableName,
                'ProjectionExpression' => '#ts, gps_data',
                'KeyConditionExpression' =>
                    'obd_dev_id = :o_id',
                'ScanIndexForward' => false,
                'Limit' => 1,
                'ExpressionAttributeNames' => ['#ts' => 'timestamp'],
                'ExpressionAttributeValues' => [
                    ':o_id' => ['S' => $sid]
                ],
                'ConsistentRead' => false
            ];
        }

        try {
            $result = $dynamodb->query($params);
            foreach ($result['Items'] as $i) {
                $gps_data = $marshaler->unmarshalItem($i)['gps_data'];
                dpm($gps_data);
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
    }
}

function _getdata_exdb($bg_db, $reqtype, $filter)
{
    // From admin page.
    //$max_num = variable_get('bgmap_max', 3);
    //$sid_list = $filter[sidList];
    $sid_list = $filter->sidList;
    $start_time = $filter->start;
    $end_time = $filter->end;

    /*
        $bg_db = array(
            'database' => 'db',
            'username' => 'user',
            'password' => 'pass',
            'host' => 'localhost',
            'driver' => 'mysql',
        );
    */

    Database::addConnectionInfo('BLUGRAPHTECH', 'default', $bg_db);
    db_set_active('BLUGRAPHTECH');

    // TODO: Sanitize sids array before using in the query statement.
    // TODO: iF multiple entry match the condition, handle as error?

    $query = array();
    if ($reqtype == 'rt') {
        $query_inner = db_select('obd_gps', 'a')
            ->fields('a', array('sid', 'timestamp', 'longitude', 'latitude'))
            ->condition('sid', $sid_list, 'IN')
            ->orderBy('timestamp', 'DESC');
        //$query->addExpression('MAX(id)');
        // TODO: Can be conditional, different for block and page.
        //$query->range(0, $max_num);
        // TODO: Use timestamp condition instead?
        $query_inner->range(0, 1000);
        //
        $query = db_select($query_inner, 'b')
            ->fields('b', array('sid', 'timestamp', 'longitude', 'latitude'))
            ->groupBy('sid');

    }
    if ($reqtype == 'trc') {
        $query = db_select('obd_gps', 'a')
            ->fields('a', array('sid', 'timestamp', 'longitude', 'latitude'))
            // TODO: Currently assumes single sid.
            ->condition('sid', $sid_list, 'IN')
            //->condition('sid', array(1,5,7),'IN')
            //->condition('status', 0,'>')
            ->condition('timestamp', array($start_time, $end_time), 'BETWEEN')
            //->orderBy('datetime', 'DESC');
            ->orderBy('datetime', 'ASC');
    }

    $result = $query->execute();
    db_set_active();
    return $result;
}


function _update_ext_db($bg_db, $nid, $sid, $vnum, $vgroup, $flag)
{
    Database::addConnectionInfo('BLUGRAPHTECH', 'default', $bg_db);
    db_set_active('BLUGRAPHTECH');

    // TODO: consider timezone.
    $millis = round(microtime(true) * 1000);
    $dt = date('Y-m-d H:i:s');

    //$query = array();
    if ($flag) {
        db_insert('obd_node_map')
            ->fields(array(
                'timestamp' => $millis,
                'datetime' => $dt,
                'sid' => $sid,
                'nid' => $nid,
                'veh_num' => $vnum,
                'veh_type' => $vgroup,
            ))->execute();
    } else {
        db_update('obd_node_map')
            ->fields(array(
                'timestamp' => $millis,
                'datetime' => $dt,
                'sid' => $sid,
                'nid' => $nid,
                'veh_num' => $vnum,
                'veh_type' => $vgroup,
            ))
            ->condition('nid', $nid)
            ->execute();
    }
    // without the paramater means set back to the default for the site
    db_set_active();
}

