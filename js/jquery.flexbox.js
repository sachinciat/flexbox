;(function($){
	"use strict";
	$.fn.flexBox = function(options) {
		var defaults = {
				mode:'slide',
				useCSS : true,
				easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
				speed: 600,
				
				exThumbImage: false,
				thumbnail: false,
				
				escKey:true,
				mobileSrc: true,
				mobileSrcMaxWidth :640,
				
				vimeoColor : 'CCCCCC',
				videoAutoplay:true,
				
				controls:true,
				hideControlOnEnd:true,
				
				//callbacks
				onOpen: function() {},
				onSlideBefore: function() {},
				onSlideAfter: function() {},
				onSlideNext: function() {},
				onSlidePrev: function() {},
				onBeforeClose: function(){},
				onCloseAfter: function(){}
			},
			el = $(this),
			$children = el.children(),
			index,
			flexBoxOn = false,
			html = '<div id="flexBox-Gallery">\
						<div id="flexBox-slider"></div>\
						<div id="flexBox-close" class="close"><i aria-hidden="true" class="bUi-iCn-rMv-16"></i></div>\
					</div>',
			$gallery, $slider, $slide, cssPrefix, $prev, $next, flag, prevIndex, $thumb_cont, $thumb, windowWidth
		;
		var settings = $.extend( true, {}, defaults, options);
		var flexBox = {
			init: function(){
				$children.click(function(e){
					e.preventDefault();
					e.stopPropagation();
					flag = true;
					index = $children.index(this);
					prevIndex = index;
					setUp.init(index);
				});
			},	
		};
		var setUp = {
			init: function(index){
				this.start();	
				this.build();
			},
			start: function(){
				this.structure();	
				this.touch();
				this.getWidth();
				this.closeSlide();
			},
			build: function(){
				this.loadContent(index);
				this.slideTo();
				this.keyPress();
				this.buildThumbnail();	
				this.slide(index);
			},
			structure: function(){
				$('body').append(html).addClass('flexBox');
				$gallery = $('#flexBox-Gallery');
				$slider = $gallery.find('#flexBox-slider');
				var slideList = '';
				$children.each(function() {
					slideList += '<div class="flexBox-slide"></div>'
				});
				$slider.append(slideList);
				$slide = $gallery.find('.flexBox-slide');
			},		
			closeSlide: function(){
				var $this = this;
				$('#flexBox-close').bind('click', function(e){
					$this.destroy();
				});
			},	
			getWidth: function(){
				var resizeWindow = function(){
					windowWidth = $(window).width();
				};
				$(window).bind('resize',resizeWindow());
			},
			doCss : function() {
				var support = function(){
					var transition = ['transition', 'MozTransition', 'WebkitTransition', 'OTransition', 'msTransition', 'KhtmlTransition'];
					var root=document.documentElement
					for (var i=0; i<transition.length; i++){
						if (transition[i] in root.style){
							cssPrefix = transition[i].replace('Transition', '').toLowerCase();
							cssPrefix == 'transition' ? cssPrefix = 'transition' : cssPrefix = ('-'+cssPrefix+'-transition');
							return transition[i]
						}
					}
				};
				if(settings.useCSS && support() ){
					return true;
				}
				return false;
			},
			touch:function(){/**/
				var xStart,xEnd;
				var $this = this;
				$('.flexBox').mousedown(function(e){
					e.stopPropagation();
					e.preventDefault();
					xStart = e.pageX
					//$prev.html(xStart);
				})
				$('.flexBox').mouseup(function(e){
					e.stopPropagation();
					e.preventDefault();
					xEnd = e.pageX; 
					//$next.html(xEnd);
					if(xEnd-xStart>20)
						$this.nextSlide();
					else if(xStart-xEnd>20)
						$this.prevSlide();
				})
				/**/	
			},
			isVideo: function(src){
				var youtube = src.match(/youtube\.com\/watch\?v=([a-zA-Z0-9\-_]+)/);
				var vimeo = src.match(/vimeo\.com\/([0-9]*)/);
				if( youtube || vimeo)
					return true;
			},
			loadVideo: function(src,a,_id){
				var youtube = src.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
				var vimeo = src.match(/vimeo\.com\/([0-9]*)/);
				var video = '';
				if(youtube){
					if(settings.videoAutoplay == true && a == true)
						a = '?autoplay=1&rel=0&wmode=opaque';		
					else
						a = '?wmode=opaque';	
							
					video = '<iframe id="video'+_id+'" width="560" height="315" src="//www.youtube.com/embed/'+youtube[1]+a+'" frameborder="0" allowfullscreen></iframe>';	
									
				}else if(vimeo){
					if(settings.videoAutoplay == true && a == true)
						a = 'autoplay=1&amp;';		
					else
						a = '';	
					
					video = '<iframe id="video'+_id+'" width="560" height="315"  src="http://player.vimeo.com/video/'+vimeo[1]+'?'+a+'byline=0&amp;portrait=0&amp;color='+settings.vimeoColor+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
				
				}
				return '<div class="video_cont"><div class="video">'+video+'</div></div>';
			},	
			loadContent : function (index){
				var $this = this;
				var i,j,ob,l= $children.length - index;
				var src;
				if(settings.mobileSrc===true && windowWidth <= settings.mobileSrcMaxWidth){
					src = $children.eq(index).attr('data-responsive-src');	
				}
				else{
					src = $children.eq(index).attr('data-src');	
				};
				if(!$this.isVideo(src)){ 
					$slide.eq(index).html('<img src="'+src+'" />');
					ob = $('img');
				}
				else{
						$slide.eq(index).html($this.loadVideo(src,true,index));
						ob = $('iframe');
					}
				$slide.eq(index).find(ob).on('load',function(){
					for (i=0; i<=index-1; i++){ 
						var src;
						if(settings.mobileSrc===true && windowWidth <= settings.mobileSrcMaxWidth){
							src = $children.eq(index-i-1).attr('data-responsive-src');	
						}
						else{
							src = $children.eq(index-i-1).attr('data-src');	
						}
						if(!$this.isVideo(src)){ 
							$slide.eq(index-i-1).html('<img src="'+src+'" />');
						}
						else{
								$slide.eq(index-i-1).html($this.loadVideo(src,false,index-i-1));
							}
					}
					for (j=1; j<l; j++){
						var src;
						if(settings.mobileSrc===true && windowWidth <= settings.mobileSrcMaxWidth){
							src = $children.eq(index+j).attr('data-responsive-src');
						}
						else{
							src = $children.eq(index+j).attr('data-src');	
						}
						if(!$this.isVideo(src)){
							$slide.eq(index+j).html('<img src="'+src+'" />')
						}
						else{
								$slide.eq(index+j).html($this.loadVideo(src,false,index+j));
							}
					}
				})
			},
			buildThumbnail: function(){
				if(settings.thumbnail==true && $children.length > 1){
					var $this = this;
					$gallery.append('<div class="thumb_cont"><div class="thumb_info"><span class="close ib"><i class="bUi-iCn-rMv-16" aria-hidden="true"></i></span></div><div class="thumb_inner"></div></div>');
					$thumb_cont = $gallery.find('.thumb_cont');
					$prev.after('<a class="cLthumb"></a>');
					$gallery.find('.cLthumb').bind('click', function(e){
						$thumb_cont.addClass('open');		
					});
					$gallery.find('.close').bind('click', function(e){
						$thumb_cont.removeClass('open');		
					});
					var thumbInfo = $gallery.find('.thumb_info');
					var $thumb_inner = $gallery.find('.thumb_inner');
					var thumbList = '';
					var thumbImg;
					$children.each(function() {
						if(settings.exThumbImage == false){
								thumbImg = $(this).find('img').attr('src');	
							}
							else{
									thumbImg = $(this).attr(settings.exThumbImage);	
								}
                    	thumbList += '<div class="thumb"><img src="'+thumbImg+'" /></div>';
                    });	
					$thumb_inner.append(thumbList);
					$thumb = $thumb_inner.find('.thumb');
					$thumb.bind('click', function(e){
						var index = $(this).index();
						$thumb.removeClass('active');
						$(this).addClass('active');
						$this.slide(index);
					});	
					thumbInfo.prepend('<span class="ib count">All photos ('+$thumb.length+')</span>');
				}
				
			},
			slideTo : function(){
				var $this = this;
				if(settings.controls == true && $children.length > 1){
					$gallery.append('<div id="flexBox-action"><a id="flexBox-prev"></a><a id="flexBox-next"></a></div>');
					$prev = $gallery.find('#flexBox-prev');
					$next = $gallery.find('#flexBox-next');	
					$prev.bind('click', function(e){
						$this.prevSlide();
					});
					$next.bind('click', function(e){
						$this.nextSlide();
					});			
				}
			},
			keyPress : function(){
				var $this = this;
				$(window).bind('keyup', function(e){
					e.preventDefault();
					e.stopPropagation();
					if (e.keyCode == 37){
						$this.prevSlide();
					}
					else if (e.keyCode==39){
						$this.nextSlide();
					}
					else if (settings.escKey === true && e.keyCode == 27) {
						$this.destroy();
					}
				});
			},
			nextSlide : function (){
				var $this = this;
				index = $slide.index($slide.eq(prevIndex));
				if(index+1 < $children.length){
					index++;
					$this.slide(index);
				}
				else{
					if(settings.mode==='slide'){
						$slider.addClass('rightSpring');
						setTimeout(function(){
							$slider.removeClass('rightSpring');
						},500);
					}
					else if(settings.mode==='fade' && settings.thumbnail===true){ 
						$thumb_cont.addClass('open')
					};
				}
				settings.onSlideNext.call( this );
			},
			prevSlide : function (){
				var $this = this;
				index = $slide.index($slide.eq(prevIndex));
				if(index > 0){
					index--;
					$this.slide(index);
				}
				else{
					if(settings.mode=='slide'){					
						$slider.addClass('leftSpring');
						setTimeout(function(){
							$slider.removeClass('leftSpring');
						},500);
					}
					else if(settings.mode=='fade' && settings.thumbnail===true){ 
						$thumb_cont.addClass('open');
					};
				}
				settings.onSlidePrev.call( this );
			},
			slide : function (index){
				if(flexBoxOn){
					if(this.doCss() && settings.mode == 'slide'){
						$slider.css(cssPrefix ,'left '+settings.speed+'ms '+settings.easing+'')
					}
					settings.onSlideBefore.call( this );
				}
				if(settings.mode == 'slide'){
					if(this.doCss()){
						$slider.css({ left : (-index*100)+'%' });
					}else{
						$slider.animate({ left : (-index*100)+'%' });
					}
				}
				else if(settings.mode == 'fade'){
					if(flag){
						$slide.css({'position':'absolute','left':'0'});
						if(this.doCss()){
							$slide.css(cssPrefix ,'opacity '+settings.speed+'ms '+settings.easing+'');
							$slide.css('opacity','0');
							$slide.eq(index).css('opacity','1');
						}
						else{
								$slide.fadeOut(100);
								$slide.eq(index).fadeIn(100);
							}
					}
					else{
						if(this.doCss()){
							$slide.eq(prevIndex).css('opacity','0');
							$slide.eq(index).css('opacity','1');;
						}
						else{
								$slide.eq(prevIndex).fadeOut(settings.speed);
								$slide.eq(index).fadeIn(settings.speed);
							}
					}
					flag = false;		
				}
				$slide.eq(prevIndex).removeClass('current');
				$slide.eq(index).addClass('current');
				if(settings.thumbnail===true){
					$thumb.removeClass('active');
					$thumb.eq(index).addClass('active');
				}
				
				if(settings.control == true && settings.hideControlOnEnd == true){
					if(index == 0){
						$prev.addClass('disabled');
					}else if( index == $children.length - 1 ){
						$next.addClass('disabled');
					}
					else{
						$prev.add($next).removeClass('disabled');		
					}	
				}
				prevIndex = index;
				flexBoxOn == false ? settings.onOpen.call(this) : settings.onSlideAfter.call(this);
				flexBoxOn = true;
			},
			destroy : function(){
				settings.onBeforeClose.call( this );
				flexBoxOn = false;
				$('body').removeClass('flexBox');
				//$(window).bind('resize',resizeWindow());
				$(window).unbind('keyup');
				$gallery.remove();
				settings.onCloseAfter.call( this );
 			}
			
			
			
		};
		flexBox.init();
	};
}(jQuery));

