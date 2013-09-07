"use strict";

/**
 * Audio player.
 */
 
var AudioPlayer = (function() {

	$(function(){
		$('audio').on('ended', function(){
			$(this).addClass('ended');
		});
	});
	
	return {
	
		play: function(file) {
			if (file){
				var className = file.replace(/[^a-zA-Z]/g, '');
			
				var existing = $('audio.ended.' + className);

				if (existing.length > 0) {
					$(existing[0]).removeClass('ended')[0].play();
				} else {
					$('<audio>').prop('src', file).prop('autoplay', 'true').prop('class', className).appendTo('body').on('ended', function(){
						$(this).addClass('ended');
					});
				}
			}
		},
		
	};
	
})();