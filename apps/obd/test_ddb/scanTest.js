var Dyno = require('dyno');
var assert = require('assert');

  var dyno = Dyno({
    table: 'OBDTable_mmmYYYY',
    region: 'ap-southeast-1',
    //endpoint: 'http://localhost:4567'
  });

  var count = 0;

  var scan = dyno.scanStream();
  scan
    .on('error', function(err) { assert.ifError(err, 'should not error'); })
    .on('data', function(item) {
      count++;
      console.log ("==========================", count);
      console.log (item);
/*
      if (!item.id) assert.fail('stream record has no id');
      if (item.data.length !== 5 * 1024) assert.fail('streamed record has incorrect buffer length');
      if (count > 2345) {
        assert.fail('streamed too many records');
        scan.pause();
        assert.end();
      }
*/
    })
    .on('end', function() {
      assert.equal(count, 2345, 'scanned all records');
      assert.end();
  });
