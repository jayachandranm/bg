<?php 
	use \App\Helper;
?>
@extends('admin.layout')

@section('css')
<style>
	#frame{
		width: 100%;
	}
</style>

@endsection

@section('content')
		
		
       <div class=" main-cnt scnt">
				<?php 
					// Helper::p($daterange,false);
					// Helper::p($station_id);
					
				?>
		</div>
        

@endsection

@section('js')

	<script src="https://code.highcharts.com/stock/highstock.js"></script>
	<script src="https://code.highcharts.com/modules/exporting.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js" ></script>

	<script>
		$(document).ready(function () {
			
			/* var winheight = $( window ).height();
			var percentage10 = (winheight/100) * 15;
			
			frameHeight = parseFloat(winheight)-parseFloat(percentage10);
			$('#frame').css('height',(frameHeight)+'px'); */
			refreshcontent(); 
			$(document).ready(function () {
				setInterval(function () {
					refreshcontent(); 
				}, 60000);
			});
			
			
		});
		
		var refreshcontent = function(){
			console.log("{{$station_id}}");
			$.get("{{URL::to('display-content/')}}"+'/'+"{{$station_id}}"+'?daterange='+"{{$daterange}}",function(result){
				console.log(result);
				$('.scnt').html(result);
				console.log(result);
			});
			
		}
		
		function SubmitForm(station_id) { 
			var daterange = $('#daterange').val();
			$.get("{{URL::to('display-content/')}}/"+station_id+'?daterange='+daterange,function(result){
				
				$('.scnt').html(result);
				console.log(result);
			});
		}
	</script>
	
	<script>
	(function($)
	{
		$(document).ready(function()
		{
			$.ajaxSetup(
			{
				cache: false,
				success: function() {
				   
				  //location.reload();
					
				}
			});
			
			
			
			var refreshId = setInterval(function()
			{
				location.reload();
				
			}, 60000);
			
			
			
		});
	})(jQuery);
	</script>
	

@endsection