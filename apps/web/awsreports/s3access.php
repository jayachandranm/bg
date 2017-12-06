<html>
<title>
A Simple HTML Document
</title>
<head>
<link rel="stylesheet" type="text/css" href="mystyles.css" media="screen" />
<script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="https://www.amcharts.com/lib/3/amcharts.js"></script>
<!-- <script type="text/javascript" src="switchDbForDaily.js" ></script>  -->
</head>
<body>
<!-- <div id="chartdiv"></div> -->
<p> Hello There! </p>
<?php
require 'vendor/autoload.php';

$s3Client = new Aws\S3\S3Client([
    'region'  => 'ap-southeast-1',
    'version' => '2006-03-01',
]);

$key = 'OBDTable_mmmYYYY/OBDTable_mmmYYYY-04282017-053030.xls.gz';

$bucket = 'abhcs-hello-ddb';

// Use the high-level iterators (returns ALL of your objects).
try {
    $objects = $s3Client->getIterator('ListObjects', array(
        'Bucket' => $bucket
    ));

    echo "Keys retrieved! </br>";
    foreach ($objects as $object) {
        echo $object['Key'] . "</br>";
    }
} catch (S3Exception $e) {
    echo $e->getMessage() . "\n";
}

$cmd = $s3Client->getCommand('GetObject', [
    'Bucket' => $bucket,
    'Key'    => $key
]);

$request = $s3Client->createPresignedRequest($cmd, '+5 minutes');
$presignedUrl = (string) $request->getUri();

//$signedUrl = $s3Client->getObjectUrl($bucket, 'OBDTable_mmmYYYY/OBDTable_mmmYYYY-04282017-053030.xls.gz', '+10 minutes');

//echo $signedUrl;
echo '<a href=' . $presignedUrl. '>Download</a>';
?>
<div class="note">^^^ Use the scrollbar above to zoom/pan and see how data granularity changes when zoomed-in ^^^</div>
</body>
</html>

