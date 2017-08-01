	@extends('admin.layout')
	
	@section('css')
		<style>
			.smlbox{
				display: inline-block;
				width: 10px;
				height: 10px;
				margin: 0 5px;
			}
			.green {				
				background-color: #1fe005;
			}
			.red {				
				background-color: #f00;
			}
			.yellow {				
				background-color: #ffe800;
			}
			.black {				
				background-color: #000;
			}
		</style>
	@endsection
	
	
	@section('content')
		<form method="POST" action=""> <?php /* */ ?>
			<div id="info" style="height:45px;padding:5px 0;">
				<div class="col-md-4">
						<select name="station_id" class="form-control station_id" required onchange="selectStation(this.value);" >
							<option value="">Select Station</option>
							@foreach($station as $key=>$val)
								<option value="{{$val->id}}"  @if($val && $val->id==$selectedId){{'selected'}} @endif >{{$val->station_id.' '.$val->station_name}}</option>
							@endforeach
						</select>
				</div>			
				<div class="col-md-8  no-padding">						
						<span class="green smlbox"></span>Total Stations: <a href="javascript:;"></a><span class="total"></span>
						<span class="green smlbox"></span>0-75% <a href="javascript:;">STN</a>:<span class="percentage50"></span>
						<span class="yellow smlbox"></span>76-90% <a href="javascript:;">STN</a>:<span class="percentage75"></span>
						<span class="red smlbox"></span>91-100% <a href="javascript:;">STN</a>:<span class="percentage90"></span>
						<span class="black smlbox"></span>Under Maintanance <a href="javascript:;">STN</a>:<span class="maintenance"></span>
				</div>
			</div> <?php /* */ ?>
			<div  id="map-canvas" style="height:800px;">
	  
			</div>
		</form>
	
	
		<script type="text/javascript" src="https://code.jquery.com/jquery-latest.min.js"></script>
		<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyDTbj6TU7S4_8j7Rppf387Fk9KTvA88E1g" type="text/javascript"></script>
		<script language="javascript" type="text/javascript">
		
		
		var map;
		var markersArray = [];
		var myLatlng = new google.maps.LatLng(1.365709, 103.826037);
		var mapOptions = {
				zoom: 12,
				center: myLatlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		var infoWindow = new google.maps.InfoWindow();
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		
		
		$(document).ready(function () {
			maprefresh();
			setInterval(function() {
				maprefresh();
			}, 60000); 
		});
		
		var maprefresh = function() 
		{
						
			var station_id = $('.station_id').val() || 0;
			var url = "{{url('get-station-all')}}/"+station_id;
			$.getJSON(url, function(data) { 
			
				$('.total').text(data.total);
				$('.percentage90').text(data.percentage90);
				$('.percentage75').text(data.percentage75);
				$('.percentage50').text(data.percentage50);
				$('.maintenance').text(data.maintenance);
				
				clearMarkers();
				var location;
				$.each(data.alldata, function (key, val) {
					addMarker(val.lat,val.lon,val.stationname,val.image);
					var html = "<b> "+val.stationID+" Station Name: " + val.stationname + "</b> <br/> Station Status: " + val.status + "<br/>" +"Date & Time: " + val.datetime + "<br/>" +"Water Level :"+ val.waterlevel_meter+"m ("+val.waterlever_mrl+"mRL)<br/>"+"Cope Level :"+val.copelevel+"mRL<br/>Invert Level :"+val.invertlevel+"mRL";
								
					(function(marker, val) 
					{
						// Attaching a click event to the current marker
						google.maps.event.addListener(marker, "mouseover", function(e) 
						{
							infoWindow.setContent(html);
							infoWindow.open(map, marker);
						});
						
						google.maps.event.addListener(marker, "click", function(e) 
						{
							window.location = "{{URL::to('display')}}/"+val.id;
						});
						
						
					})(marker, val);					
					
				}); 
				if(parseInt(station_id)>0){
					map.setCenter({lat: data.lat, lng: data.lon});
					map.setZoom(20);
				}
			});
			
			function addMarker(lat,lng,tit,image) 
			{
				
				if(image == 'red')
				{
					var icon_img = "../public/admin/image/red.png";
				}
				
				else if (image == 'green')
				{
					var icon_img = "../public/admin/image/green.png";
				}
				else if (image == 'yellow')
				{
					var icon_img = "../public/admin/image/yellow.png";
				}
				else if (image == 'black')
				{
					var icon_img = "../public/admin/image/black.png";
				}
				else
				{
					var icon_img = "../public/admin/image/green.png";
				}
				
				
				marker = new google.maps.Marker(
				{
					
					position: new google.maps.LatLng(lat,lng),
					map: map,
					title:tit,
					icon: icon_img
				});
				markersArray.push(marker);
			}
			
			// Sets the map on all markers in the array.
			function setMapOnAll(map) {
				for (var i = 0; i < markersArray.length; i++) {
				  markersArray[i].setMap(map);
				}
			}

			// Removes the markers from the map, but keeps them in the array.
			function clearMarkers() {
				setMapOnAll(null);
			}
		}
		
		function selectStation(id){
			if(parseInt(id)<=0 || id==''){
				id = 0;
			}
			window.location.href = "{{URL::to('map/')}}/"+id;
		}
		function zoomTo(level) {
			google.maps.event.addListener(map, 'zoom_changed', function () {
				zoomChangeBoundsListener = google.maps.event.addListener(map, 'bounds_changed', function (event) {
					if (this.getZoom() > level && this.initialZoom == true) {
						this.setZoom(level);
						this.initialZoom = false;
					}
					google.maps.event.removeListener(zoomChangeBoundsListener);
				});
			});
		}
		
		</script>
		
			
	@endsection
	
	
	@section('js')
	
	@endsection