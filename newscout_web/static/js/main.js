window.odometerOptions = {
  auto: true, // Don't automatically initialize everything with class 'odometer'
  selector: '.number.animated_element', // Change the selector used to automatically find things to be animated
  format: '( ddd).dd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
  duration: 1500, // Change how long the javascript expects the CSS animation to take
  theme: 'default', // Specify the theme (if you have more than one theme css file on the page)
  animation: 'count' // Count is a simpler animation method which just increments the value,
                     // use it when you're looking for something more subtle.
};
if(!Date.prototype.toISOString) 
{
    Date.prototype.toISOString = function() 
	{
        function pad(n) {return n < 10 ? '0' + n : n}
        return this.getUTCFullYear() + '-'
            + pad(this.getUTCMonth() + 1) + '-'
                + pad(this.getUTCDate()) + 'T'
                    + pad(this.getUTCHours()) + ':'
                        + pad(this.getUTCMinutes()) + ':'
                            + pad(this.getUTCSeconds()) + 'Z';
    };
}
function getRandom(min,max)
{
	"use strict";
	return((Math.floor(Math.random()*(max-min)))+min);
}
function onBeforeScroll(obj)
{	
	"use strict";
	var currentTimeago = jQuery(this).parent().parent().next().children(".current");
	/*currentTimeago.fadeOut(500, function(){
		$(this).removeClass("current");
		if(obj.scroll.direction=="next")
		{
			if(currentTimeago.next().length)
				currentTimeago.next().addClass("current");
			else
				currentTimeago.parent().children().first().addClass("current");
		}
		else
		{
			if(currentTimeago.prev().length)
				currentTimeago.prev().addClass("current");
			else
				currentTimeago.parent().children().last().addClass("current");
		}
		var object = currentTimeago.next();
		var text = object.text();
		object.text("");

		var length = text.length;
		var timeOut;
		var character = 0;

		
		(function typeWriter() { 
			timeOut = setTimeout(function() {
				character++;
				var type = text.substring(0, character);
				object.text(type);
				typeWriter();
				
				if (character == length) {
					clearTimeout(timeOut);
				}
				
			}, 50);
		}());
	});*/
	currentTimeago.fadeOut(obj.scroll.duration, function(){
		jQuery(this).removeClass("current");
		if(obj.scroll.direction=="next")
		{
			if(jQuery(this).next().length)
				jQuery(this).next().fadeIn(obj.scroll.duration).addClass("current");
			else
				jQuery(this).parent().children().first().fadeIn(obj.scroll.duration).addClass("current");
		}
		else
		{
			if(jQuery(this).prev().length)
				jQuery(this).prev().fadeIn(obj.scroll.duration).addClass("current");
			else
				jQuery(this).parent().children().last().fadeIn(obj.scroll.duration).addClass("current");
		}
	});
}
var map = null;
var marker = null;
var menu_position = null;
jQuery(document).ready(function($){
	"use strict";
	//mobile menu
	$(".mobile-menu-switch").click(function(event){
		event.preventDefault();
		if(!$(".mobile-menu").is(":visible"))
			$(".mobile-menu-divider").css("display", "block");
		$(".mobile-menu").slideToggle(500, function(){
			if(!$(".mobile-menu").is(":visible"))
				$(".mobile-menu-divider").css("display", "none");
		});
	});
	
	//slider
	$(".slider").carouFredSel({
		responsive: false,
		//align: "left",
		width: "100%",
		items: {
			start: -1,
			visible: 3,
			minimum: 3
		},
		scroll: {
			items: 1,
			easing: "easeInOutQuint",
			duration: 750
		},
		/*prev: {
			onAfter: onAfterSlide,
			onBefore: onBeforeSlide,
			easing: "easeInOutQuint",
			duration: 750
		},
		next: {
			onAfter: onAfterSlide,
			onBefore: onBeforeSlide,
			easing: "easeInOutQuint",
			duration: 750
		},*/
		auto: {
			play: false,
			timeoutDuration: 500,
			duration: 5000/*,
			onAfter: onAfterSlide,
			onBefore: onBeforeSlide,
			easing: "easeInOutQuint",
			duration: 750*/
		}
	},
	{
		transition: true,
		wrapper: {
			classname: "caroufredsel_wrapper caroufredsel_wrapper_slider"
		}
	});	
	$(".slider").sliderControl({
		appendTo: $(".slider_content_box"),
		listContainer: $(".slider_posts_list_container"),
		listItems: ($(".page").width()>462 ? 4 : 2)
	});
	
	//small slider
	$(".small_slider").each(function(index){
		$(this).addClass("pr_preloader_ss_" + index);
		//$(".pr_preloader_ss_" + index + " img:first").attr('src',$(".pr_preloader_ss_" + index + " img:first").attr('src') + '?i='+getRandom(1,100000));
		//$(".pr_preloader_ss_" + index + " img:first").before("<span class='pr_preloader'></span>");
		$(".pr_preloader_ss_" + index).before("<span class='pr_preloader'></span>");
		$(".pr_preloader_ss_" + index + " img:first").one("load", function(){
			$(".pr_preloader_ss_" + index).prev(".pr_preloader").remove();
			$(".pr_preloader_ss_" + index).fadeTo("slow", 1, function(){
				$(this).css("opacity", "");
			});

			/*$(this).prev(".pr_preloader").remove();
			$(this).fadeTo("slow", 1, function(){
				$(this).css("opacity", "");
			});*/
			
			var id = "small_slider";
			var elementClasses = $(".pr_preloader_ss_" + index).attr('class').split(' ');
			for(var i=0; i<elementClasses.length; i++)
			{
				if(elementClasses[i].indexOf('id-')!=-1)
					id = elementClasses[i].replace('id-', '');
			}
			$(".pr_preloader_ss_" + index).carouFredSel({
				items: {
					visible: 1,
					minimum: 1
				},
				scroll: {
					items: 1,
					easing: "easeInOutQuint",
					duration: 750
				},
				auto: {
					play: false,
					timeoutDuration: 500,
					duration: 5000
				}/*,
				swipe: {
					items: 1,
					easing: "easeInOutQuint",
					onTouch: true,
					onMouse: false,
					options: {
						allowPageScroll: "vertical",
						excludedElements:"button, input, select, textarea, .noSwipe"
					},
					duration: 750
				}*/
			},
			{
				wrapper: {
					classname: "caroufredsel_wrapper caroufredsel_wrapper_small_slider"
				}
			});	
			$(".pr_preloader_ss_" + index + " li img").css("display", "block");
			$(".pr_preloader_ss_" + index + " li .icon").css("display", "block");
			$(".pr_preloader_ss_" + index).sliderControl({
				type: "small",
				appendTo: $(".slider_content_box"),
				listContainer: $("#" + id + ".slider_posts_list_container.small"),
				listItems: ($(".page").width()>462 ? 3 : 2)
			});
		}).each(function(){
			if(this.complete) 
				$(this).load();
		});
	});
	
	//blog grid
	$(".blog_grid .slider_content_box").click(function(event){
		if(event.target.nodeName.toUpperCase()!="A")
			window.location.href = $(this).find("h2 a, h5 a").attr("href");
	});
	
	//mega menu
	$(".mega_menu_parent").each(function(){
		var self = $(this).find("ul:first");
		self.css("left", "-" + (self.parent().offset().left - $(".sf-menu").offset().left) + "px");
	});
	$(".mega_menu_parent, .mega_menu_parent>a").hover(function(event){
		var mega_menu = (event.target.nodeName.toUpperCase()=="A" ? $(this).next().find(".mega_menu") : $(this).find(".mega_menu"));
		mega_menu.parent().parent().height(mega_menu.outerHeight());
		if(event.target.nodeName.toUpperCase()=="A")
			$(this).next().find(".submenu").first().addClass("sfHover");
		else
			$(this).find(".submenu").first().addClass("sfHover");
		mega_menu.first().css("display", "block")
	});
	$(".mega_menu_parent .submenu").hover(function(){
		$(this).addClass("sfHover");
		var index = $(".mega_menu_parent .submenu").index($(this));
		var mega_menu = $(this).find(".mega_menu");
		mega_menu.parent().parent().height(mega_menu.outerHeight());
		if(mega_menu.length)
		{
			mega_menu.css("display", "block");
			var top = -1;
			if(mega_menu.offset().top!=$(this).parent().offset().top)
				 top = mega_menu.offset().top - $(this).parent().offset().top + 1;
			mega_menu.css({"top": "-" + top + "px", "z-index" : "3"});
		}
	},
	function(){
		$(this).removeClass("sfHover");
		$(this).find(".mega_menu").css({"top" : "-1px", "z-index" : "1", "display" : "none"});
	});
	$(".mega_menu_parent li:not('.submenu')").hover(function(){
		$(this).parent().children(".submenu").children(".mega_menu").css("display", "none");
	});
			
	var controlBySlideLeft = function(param){
		var self = $(this);
		var index = (typeof(param.data)!="undefined" ? param.data.index : param);
		$("#" + self.parent().attr("id").replace("control-by-", "")).trigger("isScrolling", function(isScrolling){
			if(!isScrolling)
			{
				var controlFor = $(".control-for-" + self.parent().attr("id").replace("control-by-", ""));
				var currentIndex = controlFor.children().index(controlFor.children(".current"));
				if(currentIndex==0)
				{
					controlFor.trigger("prevPage");
					if(controlFor.children(".current").prev().length)
						controlFor.children(".current").removeClass("current").prev().addClass("current");
					else
					{
						controlFor.children(".current").removeClass("current");
						controlFor.children(":last").addClass("current");
					}
				}
				else if(currentIndex>controlFor.triggerHandler("currentVisible").length+1)
				{	
					var slideToIndex = parseInt($(this).children(":first").attr("id").replace("horizontal_slide_" + index + "_", ""));
					if(slideToIndex==0)
						slideToIndex = controlFor.children().length-1;
					else
						slideToIndex--;
					//controlFor.trigger("slideTo", slideToIndex);
					controlFor.trigger("slideTo", [slideToIndex, {
						onAfter: function(){
							controlFor.children(".current").removeClass("current");
							controlFor.children(":first").addClass("current");
						}
					}]);
					
				}
				else
					controlFor.children(".current").removeClass("current").prev().addClass("current");
			}
		});
	};
	var controlBySlideRight = function(param){
		var self = $(this);
		var index = (typeof(param.data)!="undefined" ? param.data.index : param);
		$("#" + self.parent().attr("id").replace("control-by-", "")).trigger("isScrolling", function(isScrolling){
			if(!isScrolling)
			{
				var controlFor = $(".control-for-" + self.parent().attr("id").replace("control-by-", ""));
				var currentIndex = controlFor.children().index(controlFor.children(".current"));
				if(currentIndex==controlFor.triggerHandler("currentVisible").length)
				{
					controlFor.trigger("nextPage");
					controlFor.children(".current").removeClass("current").next().addClass("current");
				}
				else if(currentIndex>controlFor.triggerHandler("currentVisible").length)
				{
					var slideToIndex = parseInt($(this).children(":first").attr("id").replace("horizontal_slide_" + index + "_", ""));
					if(slideToIndex==controlFor.children().length-1)
						slideToIndex = 0;
					else
						slideToIndex++;
					//controlFor.trigger("slideTo", [slideToIndex, "next"]);
					controlFor.trigger("slideTo", slideToIndex);
					controlFor.children(".current").removeClass("current");
					controlFor.children(":first").addClass("current");
				}
				else
				{
					if(controlFor.children(".current").next().length)
						controlFor.children(".current").removeClass("current").next().addClass("current");
					else
					{
						controlFor.children(".current").removeClass("current");
						controlFor.children(":first").addClass("current");
					}
				}
			}
		});
	};
	//horizontal carousel
	var horizontalCarousel = function()
	{
		$(".horizontal_carousel").each(function(index){
			$(this).addClass("pr_preloader_" + index);
			//$(".pr_preloader_" + index + " img:first").attr('src',$(".pr_preloader_" + index + " img:first").attr('src') + '?i='+getRandom(1,100000));
			$(".pr_preloader_" + index).before("<span class='pr_preloader'></span>");
			$(".pr_preloader_" + index + " img:first").one("load", function(){
				$(".pr_preloader_" + index).prev(".pr_preloader").remove();
				$(".pr_preloader_" + index).fadeTo("slow", 1, function(){
					$(this).css("opacity", "");
				});
				
				/*$(this).prev(".pr_preloader").remove();
				$(this).fadeTo("slow", 1, function(){
					$(this).css("opacity", "");
				});*/
				//caroufred
				var visible = 3;
				var autoplay = 0;
				var pause_on_hover = 0;
				var scroll = 1;
				var effect = "scroll";
				var easing = "easeInOutQuint";
				var duration = 750;
				var navigation = 1;
				var control_for = "";
				var elementClasses = $(".pr_preloader_" + index).attr('class').split(' ');
				for(var i=0; i<elementClasses.length; i++)
				{
					if(elementClasses[i].indexOf('visible-')!=-1)
						visible = elementClasses[i].replace('visible-', '');
					if(elementClasses[i].indexOf('autoplay-')!=-1)
						autoplay = elementClasses[i].replace('autoplay-', '');
					if(elementClasses[i].indexOf('pause_on_hover-')!=-1)
						pause_on_hover = elementClasses[i].replace('pause_on_hover-', '');
					if(elementClasses[i].indexOf('scroll-')!=-1)
						scroll = elementClasses[i].replace('scroll-', '');
					if(elementClasses[i].indexOf('effect-')!=-1)
						effect = elementClasses[i].replace('effect-', '');
					if(elementClasses[i].indexOf('easing-')!=-1)
						easing = elementClasses[i].replace('easing-', '');
					if(elementClasses[i].indexOf('duration-')!=-1)
						duration = elementClasses[i].replace('duration-', '');
					if(elementClasses[i].indexOf('navigation-')!=-1)
						navigation = elementClasses[i].replace('navigation-', '');
					/*if(elementClasses[i].indexOf('threshold-')!=-1)
						var threshold = elementClasses[i].replace('threshold-', '');*/
					if(elementClasses[i].indexOf('control-for-')!=-1)
						control_for = elementClasses[i].replace('control-for-', '');
				}
				var length = $(this).children().length;
				if(length<visible)
					visible = length;
				var carouselOptions = {
					items: {
						visible: parseInt(visible, 10)
					},
					scroll: {
						items: parseInt(scroll),
						fx: effect,
						easing: easing,
						duration: parseInt(duration),
						pauseOnHover: (parseInt(pause_on_hover) ? true : false),
						onAfter: function(){
							var popup = false;
							if(typeof($(this).attr("id"))!="undefined")
							{
								var split = $(this).attr("id").split("-");
								if(split[split.length-1]=="popup")
									popup = true;
							}
							if(popup)
								var scroll = $(".gallery_popup").scrollTop();
							$(this).trigger('configuration', [{scroll :{
								easing: "easeInOutQuint",
								duration: 750
							}}, true]);
							if($(".control-for-" + $(this).attr("id")).length)
							{
								$(".control-for-" + $(this).attr("id")).trigger("configuration", {scroll: {
									easing: "easeInOutQuint",
									duration: 750
								}});
							}
							if(popup)
								$(".gallery_popup").scrollTop(scroll);
						}
					},
					auto: {
						items: parseInt(scroll),
						play: (parseInt(autoplay) ? true : false),
						fx: effect,
						easing: easing,
						duration: parseInt(duration),
						pauseOnHover: (parseInt(pause_on_hover) ? true : false),
						onAfter: null
					}/*,
					swipe: {
						items: parseInt(scroll),
						easing: easing,
						duration: parseInt(duration),
						onTouch: true,
						onMouse: false,
						options: {
							allowPageScroll: "vertical",
							excludedElements:"button, input, select, textarea, .noSwipe"
						}
					}*/
				};
				$(".pr_preloader_" + index).carouFredSel(carouselOptions,{
					wrapper: {
						classname: "caroufredsel_wrapper caroufredsel_wrapper_hortizontal_carousel"
					}
				});
				
				if(parseInt(navigation))
				{
					$(".pr_preloader_" + index).parent().before("<a class='slider_control left slider_control_" + index + "' href='#' title='prev'></a>");
					$(".pr_preloader_" + index).parent().after("<a class='slider_control right slider_control_" + index + "' href='#' title='next'></a>");
					$(".pr_preloader_" + index).parent().parent().hover(function(){
						$(".horizontal_carousel_container .left.slider_control_" + index).removeClass("slideRightBack").addClass("slideRight");
						$(".horizontal_carousel_container .right.slider_control_" + index).removeClass("slideLeftBack").addClass("slideLeft");
						$(".horizontal_carousel_container .pr_preloader_" + index + " .fullscreen").removeClass("slideRightBack").addClass("slideRight");
					},
					function(){
						$(".horizontal_carousel_container .left.slider_control_" + index).removeClass("slideRight").addClass("slideRightBack");
						$(".horizontal_carousel_container .right.slider_control_" + index).removeClass("slideLeft").addClass("slideLeftBack");
						$(".horizontal_carousel_container .pr_preloader_" + index + " .fullscreen").removeClass("slideRight").addClass("slideRightBack");
					});
				}
				$(".pr_preloader_" + index).trigger('configuration', ['prev', {button: $(".horizontal_carousel_container .left.slider_control_" + index)}, false]);
				$(".pr_preloader_" + index).trigger('configuration', ['next', {button: $(".horizontal_carousel_container .right.slider_control_" + index)}, false]);
				$(".pr_preloader_" + index + " li img").css("display", "block");
				$(".pr_preloader_" + index + " li .icon").css("display", "block");
				//$(".mc_preloader_" + index).trigger('configuration', ['debug', false, true]); //for width
				$(".pr_preloader_" + index).trigger('configuration', ['debug', false, true]); //for width
				
				var self = $(".pr_preloader_" + index);
				var base = "x";
				var scrollOptions = {
					scroll: {
						easing: "linear",
						duration: 200
					}
				};
				self.swipe({
					fallbackToMouseEvents: false,
					allowPageScroll: "vertical",
					excludedElements:"button, input, select, textarea, .noSwipe",
					swipeStatus: function(event, phase, direction, distance, fingerCount, fingerData ) {
						//if(!self.is(":animated") && (!$(".control-for-" + self.attr("id")).length || ($(".control-for-" + self.attr("id")).length && !$(".control-for-" + self.attr("id")).is(":animated"))))
						if(!self.is(":animated"))
						{
							self.trigger("isScrolling", function(isScrolling){
								if(!isScrolling)
								{
									if (phase == "move" && (direction == "left" || direction == "right")) 
									{
										if(base=="x")
										{
											if($(".gallery_popup").is(":visible"))
												var scroll = $(".gallery_popup").scrollTop();
											self.trigger("configuration", scrollOptions);
											if($(".control-for-" + self.attr("id")).length)
												$(".control-for-" + self.attr("id")).trigger("configuration", scrollOptions);
											if($(".gallery_popup").is(":visible"))
												$(".gallery_popup").scrollTop(scroll);
											self.trigger("pause");
										}
										if (direction == "left") 
										{
											if(base=="x")
												base = 0;
											self.css("left", parseInt(base)-distance + "px");
										} 
										else if (direction == "right") 
										{	
											if(base=="x" || base==0)
											{
												self.children().last().prependTo(self);
												base = -self.children().first().width()-parseInt(self.children().first().css("margin-right"));
											}
											self.css("left", base+distance + "px");
										}

									} 
									else if (phase == "cancel") 
									{
										if(distance!=0)
										{
											self.trigger("play");
											self.animate({
												"left": base + "px"
											}, 750, "easeInOutQuint", function(){
												if($(".gallery_popup").is(":visible"))
													var scroll = $(".gallery_popup").scrollTop();
												if(base==-self.children().first().width()-parseInt(self.children().first().css("margin-right")))
												{
													self.children().first().appendTo(self);
													self.css("left", "0px");
													base = "x";
												}
												self.trigger("configuration", {scroll: {
													easing: "easeInOutQuint",
													duration: 750
												}});
												if($(".control-for-" + self.attr("id")).length)
													$(".control-for-" + self.attr("id")).trigger("configuration", {scroll: {
														easing: "easeInOutQuint",
														duration: 750
													}});
												if($(".gallery_popup").is(":visible"))
													$(".gallery_popup").scrollTop(scroll);
											});
										}
									} 
									else if (phase == "end") 
									{
										self.trigger("play");
										if (direction == "right") 
										{
											if(typeof(self.parent().parent().attr("id"))!="undefined" && self.parent().parent().attr("id").indexOf('control-by')==0)
											{
												if($(".horizontal_carousel_container .left.slider_control_" + index).length)
													controlBySlideLeft.call($(".horizontal_carousel_container .left.slider_control_" + index), index);
												else
													controlBySlideLeft.call($(".pr_preloader_" + index).parent(), index);
											}
											self.animate({
												"left": 0 + "px"
											}, 200, "linear", function(){
												if($(".gallery_popup").is(":visible"))
													var scroll = $(".gallery_popup").scrollTop();
												self.trigger("configuration", {scroll: {
													easing: "easeInOutQuint",
													duration: 750
												}});
												if($(".control-for-" + self.attr("id")).length)
													$(".control-for-" + self.attr("id")).trigger("configuration", {scroll: {
														easing: "easeInOutQuint",
														duration: 750
													}});
												if($(".gallery_popup").is(":visible"))
													$(".gallery_popup").scrollTop(scroll);
												base = "x";
											});
											
										} 
										else if (direction == "left") 
										{
											if(base==-self.children().first().width()-parseInt(self.children().first().css("margin-right")))
											{
												self.children().first().appendTo(self);
												self.css("left", (parseInt(self.css("left"))-base)+"px");
											}
											if($(".horizontal_carousel_container .right.slider_control_" + index).length)
												$(".horizontal_carousel_container .right.slider_control_" + index).trigger("click");
											else
												$(".horizontal_carousel_container .slider_control .right_" + index).trigger("click");
											base = "x";
										}
									}
								}
							});
						}
					}
				});
				$(window).trigger("resize");
				$(".pr_preloader_" + index).trigger('configuration', ['debug', false, true]); //for height
				if(control_for!="")
				{
					$(".pr_preloader_" + index).children().each(function(child_index){
						if(child_index==0)
							$(this).addClass("current");
						$(this).attr("id", "horizontal_slide_" + index + "_" + child_index);
					});
					$(".pr_preloader_" + index).children().click(function(event){
						event.preventDefault();
						var self = $(this);
						$("#" + control_for).trigger("isScrolling", function(isScrolling){
							if(!isScrolling)
							{
								var slideIndex = self.attr("id").replace("horizontal_slide_" + index + "_", "");
								self.parent().children().removeClass("current");
								self.addClass("current");
								var controlForIndex = parseInt($("#" + control_for).children(":first").attr("id").split("_")[2]);
								//$("#" + control_for).trigger("slideTo", parseInt(slideIndex));
								$("#" + control_for).trigger("slideTo", $("#horizontal_slide_" + controlForIndex + "_" + slideIndex));
							}
						});
					});
				}
				$("[id^='control-by-'] .pr_preloader_" + index).children().each(function(child_index){
					$(this).attr("id", "horizontal_slide_" + index + "_" + child_index);
				});
				$("[id^='control-by-'] .left.slider_control_" + index).click({index: index}, controlBySlideLeft);
				$("[id^='control-by-'] .right.slider_control_" + index).click({index: index}, controlBySlideRight);
			}).each(function(){
				if(this.complete) 
					$(this).load();
			});
		});
	};
	horizontalCarousel();
	
	//vertical carousel
	var verticalCarousel = function()
	{
		$(".vertical_carousel").each(function(index){
			$(this).addClass("pr_preloader_vl_" + index);
			//$(".pr_preloader_vl_" + index + " img:first").attr('src',$(".pr_preloader_vl_" + index + " img:first").attr('src') + '?i='+getRandom(1,100000));
			$(".pr_preloader_vl_" + index + " img:first").one("load", function(){
				//$(this).prev(".pr_preloader").remove();
				//$(this).fadeTo("slow", 1, function(){
				//	$(this).css("opacity", "");
				//});
				
				//caroufred
				var autoplay = 0;
				var pause_on_hover = 0;
				var scroll = 1;
				var effect = "scroll";
				var easing = "easeInOutQuint";
				var duration = 750;
				var navigation = 1;
				var elementClasses = $(".pr_preloader_vl_" + index).attr('class').split(' ');
				for(var i=0; i<elementClasses.length; i++)
				{
					if(elementClasses[i].indexOf('autoplay-')!=-1)
						autoplay = elementClasses[i].replace('autoplay-', '');
					if(elementClasses[i].indexOf('pause_on_hover-')!=-1)
						pause_on_hover = elementClasses[i].replace('pause_on_hover-', '');
					if(elementClasses[i].indexOf('scroll-')!=-1)
						scroll = elementClasses[i].replace('scroll-', '');
					if(elementClasses[i].indexOf('effect-')!=-1)
						effect = elementClasses[i].replace('effect-', '');
					if(elementClasses[i].indexOf('easing-')!=-1)
						easing = elementClasses[i].replace('easing-', '');
					if(elementClasses[i].indexOf('duration-')!=-1)
						duration = elementClasses[i].replace('duration-', '');
					if(elementClasses[i].indexOf('navigation-')!=-1)
						navigation = elementClasses[i].replace('navigation-', '');
					/*if(elementClasses[i].indexOf('threshold-')!=-1)
						var threshold = elementClasses[i].replace('threshold-', '');*/
				}
				var carouselOptions = {
					direction: "up",
					items: {
						visible: 3
					},
					scroll: {
						items: parseInt(scroll),
						fx: effect,
						easing: easing,
						duration: parseInt(duration),
						pauseOnHover: (parseInt(pause_on_hover) ? true : false)
					},
					auto: {
						items: parseInt(scroll),
						play: (parseInt(autoplay) ? true : false),
						fx: effect,
						easing: easing,
						duration: parseInt(duration),
						pauseOnHover: (parseInt(pause_on_hover) ? true : false)
					}
				};
				$(".pr_preloader_vl_" + index).carouFredSel(carouselOptions,{
					wrapper: {
						classname: "caroufredsel_wrapper caroufredsel_wrapper_vertical_carousel"
					}
				});
				if(navigation)
				{
					$(".pr_preloader_vl_" + index).parent().before("<a class='slider_control up slider_control_" + index + "' href='#' title='prev'></a>");
					$(".pr_preloader_vl_" + index).parent().after("<a class='slider_control down slider_control_" + index + "' href='#' title='next'></a>");
					$(".pr_preloader_vl_" + index).parent().parent().hover(function(){
						$(".vertical_carousel_container .up.slider_control_" + index).removeClass("slideDownBack").addClass("slideDown");
						$(".vertical_carousel_container .down.slider_control_" + index).removeClass("slideUpBack").addClass("slideUp");
					},
					function(){
						$(".vertical_carousel_container .up.slider_control_" + index).removeClass("slideDown").addClass("slideDownBack");
						$(".vertical_carousel_container .down.slider_control_" + index).removeClass("slideUp").addClass("slideUpBack");
					});
				}
				$(".pr_preloader_vl_" + index).trigger('configuration', ['prev', {button: $(".vertical_carousel_container .up.slider_control_" + index)}, false]);
				$(".pr_preloader_vl_" + index).trigger('configuration', ['next', {button: $(".vertical_carousel_container .down.slider_control_" + index)}, false]);
				$(".pr_preloader_vl_" + index + " li img").css("display", "block");
				$(".pr_preloader_vl_" + index + " li .icon").css("display", "block");
				//$(".mc_preloader_" + index).trigger('configuration', ['debug', false, true]); //for width
				$(".pr_preloader_vl_" + index).trigger('configuration', ['debug', false, true]); //for width
				$(window).trigger("resize");
				$(".pr_preloader_vl_" + index).trigger('configuration', ['debug', false, true]); //for height
			}).each(function(){
				if(this.complete) 
					$(this).load();
			});
		});
	};
	verticalCarousel();
	
	$(".tabs_navigation:not('.small')").each(function(){
		var count = $(this).children().length;
		$(this).children().width(100/count + '%');
	});
	
	var blogRating = function()
	{
		$(".blog.rating").each(function(){
			var topValue = 0, currentValue = 0;
			$(this).children(".post").each(function(index){
				var self = $(this);
				if(self.find("[data-value]").length)
				{
					currentValue = parseInt(self.find("[data-value]").data("value").toString().replace(" ",""));
					if(index==0)
						topValue = currentValue;
					self.append("<div class='value_bar_container' style='width: " + ((currentValue/topValue*100)<5 ? 5 : (currentValue/topValue*100)) + "%; height: " + (self.outerHeight()-self.find("img").height()) + "px;'><div class='value_bar animated_element duration-2000 animation-width'></div></div>");
				}
			});
		});
	}
	blogRating();
	
	var authorsRating = function()
	{
		$(".authors.rating").each(function(){
			var topValue = 0, currentValue = 0;
			$(this).children(".author").each(function(index){
				var self = $(this);
				var number = self.find("[data-value]");
				if(number.length)
				{
					currentValue = parseInt(number.data("value").toString().replace(" ",""))
					if(index==0)
						topValue = currentValue;
					number.after("<div class='value_bar_container' style='height: " + ((currentValue/topValue*100)<5 ? 5 : (currentValue/topValue*100)) + "px;'><div class='value_bar animated_element duration-2000 animation-height'></div></div>");
				}
			});
		});
	}
	authorsRating();
	
	var authorsListRating = function()
	{
		$(".authors_list.rating").each(function(){
			var topValue = 0, currentValue = 0;
			$(this).children(".author").each(function(index){
				var self = $(this);
				var number = self.find("[data-value]").first();
				if(number.length)
				{
					currentValue = parseInt(number.data("value").toString().replace(" ",""))
					if(index==0)
						topValue = currentValue;
					self.find(".details").append("<div class='value_bar_container' style='width: " + ((currentValue/topValue*100)<5 ? 5 : (currentValue/topValue*100)) + "%; height: " + (self.find(".details").outerHeight()) + "px;'><div class='value_bar animated_element duration-2000 animation-width'></div></div>");
				}
			});
		});
	}
	authorsListRating();
	
	var reviewRating = function()
	{
		$(".value_container .value_bar").each(function(){
			if($(this).children("[data-value]").first().length)
			{
				var value = parseFloat($(this).children("[data-value]").first().data("value").toString());
				$(this).parent().css("width", (parseInt(value*10)<13 ? 13 : parseInt(value*10)) + "%");
			}
		});
		$(".review_summary").each(function(){
			if($(this).children("[data-value]").first().length)
			{
				var value = parseFloat($(this).children("[data-value]").first().data("value").toString());
				$(this).append("<div class='value_bar_container' style='width: " + (parseInt(value*10)<5 ? 5 : parseInt(value*10)) + "%; height: " + $(this).outerHeight() + "px;'><div class='value_bar animated_element duration-2000 animation-width'></div></div>");
			}
		});
	}
	reviewRating();
	
	
	//vertical carousel
	$(".latest_news_scrolling_list").each(function(){
		var self = $(this);
		self.carouFredSel({
			width: "variable",
			items: {
				visible: 1,
				minimum: 1
			},
			prev: {button: self.parent().prev().prev()},
			next: {button: self.parent().prev()},
			scroll: {
				width: "variable",
				items: 1,
				easing: "easeInOutCirc",
			//	fx: "fade",
				pauseOnHover: true,
				onBefore: onBeforeScroll
			},
			auto: {
				play: true,
				items: 1
			}
		},{
		wrapper: {
			classname: "caroufredsel_wrapper_vertical_carousel"
			}
		});
	});
	
	//accordion
	$(".accordion").accordion({
		event: 'change',
		heightStyle: 'content',
		icons: true,
		/*active: false,
		collapsible: true*/
		create: function(event, ui){
			$(window).trigger('resize');
			$(".horizontal_carousel").trigger('configuration', ['debug', false, true]);
		}
	});
	$(".accordion.wide").bind("accordionchange", function(event, ui){
		$("html, body").animate({scrollTop: $("#"+$(ui.newHeader).attr("id")).offset().top-20}, 400);
	});
	$(".tabs:not('.no_scroll')").bind("tabsbeforeactivate", function(event, ui){
		$("html, body").animate({scrollTop: $("#"+$(ui.newTab).children("a").attr("id")).offset().top-20}, 400);
	});
	$(".tabs").tabs({
		event: 'change',
		show: true,
		create: function(){
			$("html, body").scrollTop(0);
		}
	});
	
	//browser history
	$(".tabs .ui-tabs-nav a").click(function(){
		if($(this).attr("href").substr(0,4)!="http")
			$.bbq.pushState($(this).attr("href"));
		else
			window.location.href = $(this).attr("href");
	});
	$(".ui-accordion .ui-accordion-header").click(function(){
		$.bbq.pushState("#" + $(this).attr("id").replace("accordion-", ""));
	});
	
	//preloader
	var preloader = function()
	{
		$(".blog:not('.small, .horizontal_carousel') .post>a>img, .grid_view .post>a>img, .post.single .post_image img, .slider .slide img, .pr_preload").each(function(){
			$(this).before("<span class='pr_preloader'></span>");
			//$(this).attr('src',$(this).attr('src') + '?i='+getRandom(1,100000));
			$(this).one("load", function(){
				$(this).prev(".pr_preloader").remove();
				$(this).fadeTo("slow", 1, function(){
					$(this).css("opacity", "");
				});
				$(this).css("display", "block");
				$(this).parent().children(".icon").css("display", "block");
				if($(this).parent().parent().parent().hasClass("blog rating"))
					$(".blog.rating .value_bar_container").each(function(){
						$(this).height($(this).parent().outerHeight()-$(this).parent().find("img").height());
					});
			}).each(function(){
				if(this.complete) 
					$(this).load();
			});
		});
		
	};
	preloader();
	
	$(".scroll_to_comments").click(function(event){
		event.preventDefault();
		var offset = $("#comments_list").offset();
		$("html, body").animate({scrollTop: offset.top-80}, 400);
	});
	//hashchange
	$(window).bind("hashchange", function(event){
		var hashSplit = $.param.fragment().split("-");
		var hashString = "";
		for(var i=0; i<hashSplit.length-1; i++)
			hashString = hashString + hashSplit[i] + (i+1<hashSplit.length-1 ? "-" : "");
		if(hashSplit[0].substr(0,7)!="filter=")
		{
			$('.ui-accordion .ui-accordion-header#accordion-' + decodeURIComponent($.param.fragment())).trigger("change");
			$(".tabs_box_navigation a[href='#" + decodeURIComponent($.param.fragment()) + "']").trigger("click");
			$('.ui-accordion .ui-accordion-header#accordion-' + decodeURIComponent(hashString)).trigger("change");
		}
		$('.tabs .ui-tabs-nav [href="#' + decodeURIComponent(hashString) + '"]').trigger("change");
		$('.tabs .ui-tabs-nav [href="#' + decodeURIComponent($.param.fragment()) + '"]').trigger("change");
		if(hashSplit[0].substr(0,7)!="filter=")
			$('.tabs .ui-accordion .ui-accordion-header#accordion-' + decodeURIComponent($.param.fragment())).trigger("change");
		$(".latest_news_scrolling_list, .slider_posts_list, .vertical_carousel, .horizontal_carousel").trigger('configuration', ['debug', false, true]);
		$(".blog.rating .value_bar_container").each(function(){
			$(this).height($(this).parent().outerHeight()-$(this).parent().find("img").height());
		});
		$(document).scroll();
		
		if(hashSplit[0].substr(0,7)=="comment")
		{
			if($(location.hash).length)
			{
				var offset = $(location.hash).offset();
				$("html, body").animate({scrollTop: offset.top-10}, 400);
			}
		}
	}).trigger("hashchange");
	
	//$(".gallery_popup").css("display", "none");
	$("a[data-rel]").click(function(event){
		event.preventDefault();
		var currentSlideIndex = parseInt($(this).parent().attr("id").split("_")[3]);
		var panelId = "#" + $(this).attr("data-rel") + "-popup";
		if(!$(panelId).hasClass("disabled"))
		{
			$("body").append("<div class='gallery_overlay'></div>");
			$(".gallery_overlay").css({"width":$(window).width()+"px", "height":$(document).height()+"px", "opacity":"1"});
			//var top = ($(window).height()-$(panelId).height())/2+$(window).scrollTop();
			var top = $(window).scrollTop();
			if(top<0)
				top = 0;
			top = 0;
			$(panelId).css("top", top + "px");
			//$(panelId).css("left", ($(window).width()-$(panelId).width())/2+$(window).scrollLeft() + "px");
			$(panelId).appendTo("body").css("display", "block");
			var carouselControl = $(panelId + " .horizontal_carousel_container.thin .horizontal_carousel");
			var carouselControlIndex = parseInt(carouselControl.children(":first").attr("id").split("_")[2]);
			if(carouselControl.children().length<7)
				$(panelId + " .horizontal_carousel_container.thin").css("width", "1050px");
				
			var carousel = $(panelId + " .horizontal_carousel_container.big .horizontal_carousel");
			var carouselIndex = parseInt(carousel.children(":first").attr("id").split("_")[2]);
			if(!carousel.find(".navigation_container").length)
			{
				carousel.children().each(function(index){
					$(this).find(".column_1_3").prepend("<div class='navigation_container clearfix'><ul id='slider_navigation_" + index + "' class='slider_navigation'><li class='slider_control'><a title='prev' href='#' class='left_" + index + "'></a></li><li class='slider_control'><a title='next' href='#' class='right_" + index + "'></a></li></ul><div class='slider_info'>" + (index+1) + " / " + carousel.children().length + "</div></div>");
					$(panelId + " .left_" + index).click(function(event){
						event.preventDefault();
						carousel.trigger("isScrolling", function(isScrolling){
							if(!isScrolling)
							{
								controlBySlideLeft.call(carousel.parent(), carouselIndex);
								carousel.trigger("prevPage");
								
								/*var controlFor = $(".control-for-" + carousel.attr("id").replace(, carouselIndex""));
								var currentIndex = controlFor.children().index(controlFor.children(".current"));
								if(currentIndex==0)
								{
									controlFor.trigger("prevPage");
									controlFor.children(".current").removeClass("current").prev().addClass("current");
								}
								else if(currentIndex>controlFor.triggerHandler("currentVisible").length+1)
								{	
									var slideToIndex = parseInt(carousel.children(":first").attr("id").replace("horizontal_slide_" + carouselIndex + "_", ""));
									controlFor.trigger("slideTo", slideToIndex);
									controlFor.children(".current").removeClass("current");
									controlFor.children(":first").addClass("current");
								}
								else
									controlFor.children(".current").removeClass("current").prev().addClass("current");*/
							}
						});
					});
					$(panelId + " .right_" + index).click(function(event){
						event.preventDefault();
						carousel.trigger("isScrolling", function(isScrolling){
							if(!isScrolling)
							{
								controlBySlideRight.call(carousel.parent(), carouselIndex);
								carousel.trigger("nextPage");
								/*var controlFor = $(".control-for-" + carousel.attr("id").replace("control-, carouselIndex					var currentIndex = controlFor.children().index(controlFor.children(".current"));
								if(currentIndex==controlFor.triggerHandler("currentVisible").length)
								{
									controlFor.trigger("nextPage");
									controlFor.children(".current").removeClass("current").next().addClass("current");
								}
								else if(currentIndex>controlFor.triggerHandler("currentVisible").length)
								{
									var slideToIndex = parseInt(carousel.children(":first").attr("id").replace("horizontal_slide_" + carouselIndex + "_", ""));
									if(slideToIndex==controlFor.children().length-1)
										slideToIndex = 0;
									else
										slideToIndex++;
									controlFor.trigger("slideTo", slideToIndex);
									controlFor.children(".current").removeClass("current");
									controlFor.children(":first").addClass("current");
								}
								else
									controlFor.children(".current").removeClass("current").next().addClass("current");*/
							}
						});
					});
				});
			}
			carouselControl.children(".current").removeClass("current");
			carousel.trigger('configuration', ['debug', false, true]);
			carouselControl.trigger('configuration', ['debug', false, true]);
			$("#horizontal_slide_" + carouselControlIndex + "_" + currentSlideIndex).addClass("current");
			carousel.trigger("slideTo", [$("#horizontal_slide_" + carouselIndex + "_" + currentSlideIndex), {
				duration    : 10
			}]);
			carouselControl.trigger("slideTo", [$("#horizontal_slide_" + carouselControlIndex + "_" + currentSlideIndex), {
				duration    : 10
			}]);
			$(panelId).css("opacity", "0");
			carousel.trigger('configuration', ['debug', false, true]);
			carouselControl.trigger('configuration', ['debug', false, true]);
			$(panelId).animate({opacity: 1}, 500, function(){if(jQuery.browser.msie)this.style.removeAttribute("filter");carousel.trigger('configuration', ['debug', false, true]);/*IE bug fix*/});
			$(panelId).css("height", $(window).height()+"px");
			//$("html,body").css("overflow", "hidden").addClass("dont_scroll");
			var scrollPosition = $(window).scrollTop();
			$("body").addClass("lock-position");
			$(".close_popup").one("click", function(event){
				event.preventDefault();
				$(".close_popup").unbind("click");
				//$("html,body").css("overflow", "auto").removeClass("dont_scroll");
				$("body").removeClass("lock-position");
				$(window).scrollTop(scrollPosition);
				$(panelId).css({"top": scrollPosition, "overflow": "hidden"});
				$(panelId).addClass("disabled").animate({opacity:0},500,function(){$(this).css("display", "none").removeClass("disabled");$(panelId).css({"top": 0, "overflow-y": "scroll"});});
				$(".gallery_overlay").animate({opacity:0},500,function(){$(this).remove()});
			});
		}
	});
	$('body.dont_scroll').bind("touchmove", {}, function(event){
	  event.preventDefault();
	});
	
	//timeago
	$("abbr.timeago").timeago();
	
	if($("#map").length)
	{
		//google map
		var coordinate = new google.maps.LatLng(45.358887,-75.702429);
		var mapOptions = {
			zoom: 15,
			center: coordinate,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: false,
			mapTypeControl: false
		};

		map = new google.maps.Map(document.getElementById("map"),mapOptions);
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(45.358887,-75.702429),
			map: map,
			icon: new google.maps.MarkerImage("images/icons/other/map_pointer.png", new google.maps.Size(38, 45), null, new google.maps.Point(18, 44))
		});
	}
	
	//window resize
	function windowResize()
	{
		if(map!=null)
			map.setCenter(coordinate);
		$(".slider, .small_slider, .latest_news_scrolling_list, .slider_posts_list, .vertical_carousel, .horizontal_carousel").trigger('configuration', ['debug', false, true]);
		$(".blog.rating .value_bar_container").each(function(){
			$(this).height($(this).parent().outerHeight()-$(this).parent().find("img").height());
		});
		$(".authors_list.rating .value_bar_container").each(function(){
			$(this).height($(this).parent().outerHeight());
		});
		$(".review_summary .value_bar_container").each(function(){
			$(this).height($(this).parent().outerHeight());
		});
		if($(".slider").length)
		{
			$(".slider").sliderControl("destroy");
			$(".slider").sliderControl({
				appendTo: $(".slider_content_box"),
				listContainer: $(".slider_posts_list_container"),
				listItems: ($(".page").width()>462 ? 4 : 2)
			});
		}
		if($(".small_slider").length)
		{
			$(".small_slider").each(function(){
				if($(this).hasClass("pr_initialized"))
				{
					$(this).sliderControl("destroy");
					var id = "small_slider";
					var elementClasses = $(this).attr('class').split(' ');
					for(var i=0; i<elementClasses.length; i++)
					{
						if(elementClasses[i].indexOf('id-')!=-1)
							id = elementClasses[i].replace('id-', '');
					}
					$(this).sliderControl({
						type: "small",
						appendTo: $(".slider_content_box"),
						listContainer: $("#" + id + ".slider_posts_list_container.small"),
						listItems: ($(".page").width()>462 ? 3 : 2)
						
					});
				}
			});
		}
		if($(".post.single .author_box").length)
		{
			var topOfWindow = $(window).scrollTop();
			if($(".post.single.small_image .author_box").length)
			{
				var elementPos = $(".post.single .post_content").offset().top+$(".post.single .post_image_box").outerHeight()+30;
				if(elementPos-20<topOfWindow && $(".post.single .post_content").offset().top-20+$(".post.single .post_content").outerHeight()-$(".post.single .author_box").outerHeight()>topOfWindow)
					$(".post.single .author_box").css({"position": "fixed", "top": "20px", "bottom": "auto"});
				else if($(".post.single .post_content").offset().top-20+$(".post.single .post_content").outerHeight()-$(".post.single .author_box").outerHeight()<topOfWindow)
					$(".post.single .author_box").css({"position": "absolute", "bottom": "0", "top": "auto"});
				else
					$(".post.single .author_box").css({"position": "absolute", "top": ($(".post.single .post_image_box").outerHeight()+30) + "px", "bottom": "auto"});
			}
			else
			{
				if($(".post.single .post_content").offset().top-20<topOfWindow && $(".post.single .post_content").offset().top-20+$(".post.single .post_content").outerHeight()-$(".post.single .author_box").outerHeight()>topOfWindow)
					$(".post.single .author_box").css({"position": "fixed", "top": "20px", "bottom": "auto"});
				else if($(".post.single .post_content").offset().top-20+$(".post.single .post_content").outerHeight()-$(".post.single .author_box").outerHeight()<topOfWindow)
					$(".post.single .author_box").css({"position": "absolute", "bottom": "0", "top": "auto"});
				else
					$(".post.single .author_box").css({"position": "absolute", "top": "0", "bottom": "auto"});
			}
		}
		if($(".gallery_overlay").length)
		{
			$(".gallery_overlay").css({"width":$(window).width()+"px", "height":$(document).height()+"px"});
			$(".gallery_popup").css("height", $(window).height()+"px");
		}
		//$(".slider_posts_list").trigger('configuration', ['items', {visible: 2}, true]);
		$(".mega_menu_parent").each(function(){
			var self = $(this).find("ul:first");
			self.css("left", "-" + (self.parent().offset().left - $(".sf-menu").offset().left) + "px");
		});	
	}
	$(window).resize(windowResize);
	window.addEventListener('orientationchange', windowResize);	
	
	//scroll top
	$("a[href='#top']").click(function() {
		if(navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/))     
			$("body").animate({scrollTop: 0}, "slow");
		else
			$("html, body").animate({scrollTop: 0}, "slow");
		return false;
	});
	
	//hint
	$(".comment_form input[type='text'], .contact_form input[type='text'], .comment_form textarea, .contact_form textarea, .search input[type='text'], .search_form input[type='text']").hint();
	
	//cancel comment button
	$("#cancel_comment").click(function(event){
		event.preventDefault();
		$(this).css('display', 'none');
	});
	
	//fancybox
	$(".prettyPhoto").prettyPhoto({
		show_title: false,
		slideshow: 3000,
		overlay_gallery: true,
		social_tools: ''
	});
	
	//contact form
	if($(".contact_form").length)
		$(".contact_form")[0].reset();
	$(".contact_form").submit(function(event){
		event.preventDefault();
		var data = $(this).serializeArray();
		$("#contact_form .block").block({
			message: false,
			overlayCSS: {
				opacity:'0.3',
				"backgroundColor": "#FFF"
			}
		});
		$.ajax({
			url: $(".contact_form").attr("action"),
			data: data,
			type: "post",
			dataType: "json",
			success: function(json){
				$("#contact_form [name='submit'], #contact_form [name='name'], #contact_form [name='email'], #contact_form [name='message']").qtip('destroy');
				if(typeof(json.isOk)!="undefined" && json.isOk)
				{
					if(typeof(json.submit_message)!="undefined" && json.submit_message!="")
					{
						$("#contact_form [name='submit']").qtip(
						{
							style: {
								classes: 'ui-tooltip-success'
							},
							content: { 
								text: json.submit_message 
							},
							position: { 
								my: "right center",
								at: "left center" 
							}
						}).qtip('show');
						$(".contact_form")[0].reset();
						$(".contact_form input[type='text'], .contact_form textarea").trigger("focus").trigger("blur");
					}
				}
				else
				{
					if(typeof(json.submit_message)!="undefined" && json.submit_message!="")
					{
						$("#contact_form [name='submit']").qtip(
						{
							style: {
								classes: 'ui-tooltip-error'
							},
							content: { 
								text: json.submit_message 
							},
							position: { 
								my: "right center",
								at: "left center" 
							}
						}).qtip('show');
					}
					if(typeof(json.error_name)!="undefined" && json.error_name!="")
					{
						$("#contact_form [name='name']").qtip(
						{
							style: {
								classes: 'ui-tooltip-error'
							},
							content: { 
								text: json.error_name 
							},
							position: { 
								my: "bottom center",
								at: "top center" 
							}
						}).qtip('show');
					}
					if(typeof(json.error_email)!="undefined" && json.error_email!="")
					{
						$("#contact_form [name='email']").qtip(
						{
							style: {
								classes: 'ui-tooltip-error'
							},
							content: { 
								text: json.error_email 
							},
							position: { 
								my: "bottom center",
								at: "top center" 
							}
						}).qtip('show');
					}
					if(typeof(json.error_message)!="undefined" && json.error_message!="")
					{
						$("#contact_form [name='message']").qtip(
						{
							style: {
								classes: 'ui-tooltip-error'
							},
							content: { 
								text: json.error_message 
							},
							position: { 
								my: "bottom center",
								at: "top center" 
							}
						}).qtip('show');
					}
				}
				$("#contact_form .block").unblock();
			}
		});
	});
	//set author box position in small image post layout
	$(".post.single.small_image .author_box").css({"position": "absolute", "top": ($(".post.single .post_image_box").outerHeight()+30) + "px", "bottom": "auto"});
	if($(".menu_container").hasClass("sticky"))
		menu_position = $(".menu_container").offset().top;
	function animateElements()
	{
		$('.animated_element, .tens, .sticky').each(function(){
			var elementPos = $(this).offset().top;
			var topOfWindow = $(window).scrollTop();
			if($(this).hasClass("author_box"))
			{
				if($(this).parent().parent().parent().hasClass("small_image"))
				{
					var elementPos = $(".post.single .post_content").offset().top+$(".post.single .post_image_box").outerHeight()+30;
					if(elementPos-20<topOfWindow && $(".post.single .post_content").offset().top-20+$(".post.single .post_content").outerHeight()-$(".post.single .author_box").outerHeight()>topOfWindow)
						$(".post.single .author_box").css({"position": "fixed", "top": "20px", "bottom": "auto"});
					else if($(".post.single .post_content").offset().top-20+$(".post.single .post_content").outerHeight()-$(".post.single .author_box").outerHeight()<topOfWindow)
						$(".post.single .author_box").css({"position": "absolute", "bottom": "0", "top": "auto"});
					else
						$(".post.single .author_box").css({"position": "absolute", "top": ($(".post.single .post_image_box").outerHeight()+30) + "px", "bottom": "auto"});
				}
				else
				{
					if($(".post.single .post_content").offset().top-20<topOfWindow && $(".post.single .post_content").offset().top-20+$(".post.single .post_content").outerHeight()-$(".post.single .author_box").outerHeight()>topOfWindow)
						$(".post.single .author_box").css({"position": "fixed", "top": "20px", "bottom": "auto"});
					else if($(".post.single .post_content").offset().top-20+$(".post.single .post_content").outerHeight()-$(".post.single .author_box").outerHeight()<topOfWindow)
						$(".post.single .author_box").css({"position": "absolute", "bottom": "0", "top": "auto"});
					else
						$(".post.single .author_box").css({"position": "absolute", "top": "0", "bottom": "auto"});
				}
			}
			else if($(this).hasClass("sticky"))
			{
				if(menu_position!=null)
				{
					if(menu_position<topOfWindow)
						$(this).addClass("move");
					else
						$(this).removeClass("move");
				}
			}
			else if(elementPos<topOfWindow+$(window).height()-20) 
			{
				if($(this).hasClass("number") && !$(this).hasClass("progress") && $(this).is(":visible"))
				{
					var self = $(this);
					$(".blog.rating .value_bar_container").each(function(){
						$(this).height($(this).parent().outerHeight()-$(this).parent().find("img").height());
					});
					$(".authors_list.rating .value_bar_container").each(function(){
						$(this).height($(this).parent().outerHeight());
					});
					self.addClass("progress");
					if(typeof(self.data("value"))!="undefined")
					{
						var value = parseFloat(self.data("value").toString().replace(" ",""));
						self.text(0);
						self.text(value);
					}
					if(self.hasClass("tens"))
					{
						var i = 0;
						var iterator = 0.08;
						var numberInterval = setInterval(function(){
							self.text(i.toFixed(1));
							i+=iterator;
							if(i>value)
							{
								self.text(value.toFixed(1));
								clearInterval(numberInterval);
							}
						}, 1);
					}
					/*var i = 0;
					var iterator = Math.pow(10, value.toString().length-2);
					if(iterator<1)
						iterator = 1;
					if(self.hasClass("tens"))
						iterator = 0.08;
					var numberInterval = setInterval(function(){
						self.text((self.hasClass("tens") ? i.toFixed(1) : i));
						i+=iterator;
						if(i>value)
						{
							self.text((self.hasClass("tens") ? value.toFixed(1) : value));
							clearInterval(numberInterval);
						}
					}, 1);*/
				}
				else if(!$(this).hasClass("progress"))
				{
					var elementClasses = $(this).attr('class').split(' ');
					var animation = "fadeIn";
					var duration = 600;
					var delay = 0;
					for(var i=0; i<elementClasses.length; i++)
					{
						if(elementClasses[i].indexOf('animation-')!=-1)
							animation = elementClasses[i].replace('animation-', '');
						if(elementClasses[i].indexOf('duration-')!=-1)
							duration = elementClasses[i].replace('duration-', '');
						if(elementClasses[i].indexOf('delay-')!=-1)
							delay = elementClasses[i].replace('delay-', '');
					}
					$(this).addClass(animation);
					$(this).css({"animation-duration": duration + "ms"});
					$(this).css({"animation-delay": delay + "ms"});
					$(this).css({"transition-delay": delay + "ms"});
				}
			}
		});
	}
	setTimeout(animateElements, 1);
	$(window).scroll(animateElements);
	//font selector
	var font_size = 0, size_to_set = 0;
	$(".font_selector a").click(function(event){
		event.preventDefault();
		if($(this).hasClass("increase"))
			font_size = 2;
		else
			font_size = -2;
		$("p").each(function(){
			size_to_set = (parseInt($(this).css("font-size"))+font_size);
			if(size_to_set>8 && size_to_set<40)
				$(this).css("font-size", size_to_set + "px");
		});
	});
});