(function($) {
    $(document).ready(function() {
        //$('.region-content .block h2').click(function() {
        $('.region-content #block-bgmap-rtmulti h2').click(function() {
            console.log("Clicked Block title 2");
            //$(this).parent().children('.block-inner').animate({
            $(this).parent().children('#rt_map').animate({
                width: 'toggle'
            },1000, 'swing');
        });
        $('.region-content #block-bgmap-rtsingle h2').click(function() {
            console.log("Clicked Block title 3");
            //$(this).parent().children('.block-inner').animate({
            $(this).parent().children('#rt_map').animate({
                width: 'toggle'
            },1000, 'swing');
        });
    });
})(jQuery);
