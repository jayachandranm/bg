$(function() {

var attr = 'bl';

function updateTable(list, type) {
  attr = type;
  var divid = '#statustable';
  if(list === "list2") {
    divid = '#statustable2';
  }
  var data_url = 'status_alldev_json.php?list=' + list + '&attr=' + attr + '&tbl=y';
  console.log(data_url);
  $(divid).DataTable( {
    "ajax": data_url,
    "order": [[ 1, "asc" ]],
    "columns": [
            { "data": "sid" },
            { "data": "loc" },
            { "data": "value" },
            { "data": "value2" }
        ]
  });
}

updateTable("list1", attr);
updateTable("list2", attr);

/*
  $('.select-val').on('change', function(){
    var selected = $(this).find("option:selected").val();
    console.log(selected);
    updateTable("list1", selected); 
    updateTable("list2", selected);
    //getData2(selected);
  });
*/
});

