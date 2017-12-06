var AWS = require("aws-sdk");
var fs = require('fs');

AWS.config.update({
    region: "ap-southeast-1",
    endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing movies into DynamoDB. Please wait.");

//var allMovies = JSON.parse(fs.readFileSync('moviedata.json', 'utf8'));
//allMovies.forEach(function(movie) {
    var params = {
        TableName: "OBDTable_mmmYYYY",
        Item: {
            "obd_dev_id":  "ABC11112222",
            "timestamp": 123456789,
            "info":  {
               "longitude": 123.456, 
               "latitude": 456.123
            }
        }
    };

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add movie", ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:");
       }
    });
//});
