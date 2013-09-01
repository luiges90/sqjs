"use strict";

/**
 * Audio player.
 */
 
var AudioPlayer = (function() {
	
	return {
	
		play: function(file) {
			$('body').append('<audio src="' + file + '" autoplay>');
			$('audio').on('ended', function(){
				$(this).remove();
			});
		},
		
	};
	
})();