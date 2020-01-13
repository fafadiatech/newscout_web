$('#menu li').each(function(){
	if(window.location.href.indexOf($(this).find('a:first').attr('href'))>-1){
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
	}
});

var path = window.location.pathname;
$(".sidebar ul a").each(function() {
    var href = $(this).attr('href');
    if (path.substring(0, href.length) === href) {
        $(this).addClass('active');
        // $(this).closest('.active_menuitem').addClass('active');
    }
});