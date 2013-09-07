"use strict"

var HiScore = (function(){

	var HISCORE_KEY = 'sq_hiscore';

	var getHiScoreDate = function() {
		var now = new Date();
		return now.getDate() + '-' + (now.getMonth()+1) + '-' + now.getFullYear() + ' ' + zeroPad(now.getHours(), 2) + ':' + zeroPad(now.getMinutes(), 2);
	};
	
	var getDefaultHiScore = function() {
		return [
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
			];
	};
	
	return {

		loadHiScore: function() {
			var hiScore = localStorage.getItem(HISCORE_KEY);
			hiScore = JSON.parse(hiScore);
			
			return hiScore;
		},
		
		saveHiScore: function(wave, score) {
			var hiScore = localStorage.getItem(HISCORE_KEY);
			hiScore = JSON.parse(hiScore);
			
			if (hiScore === null)
			{
				hiScore = getDefaultHiScore();
			}
			
			var pos;
			$(hiScore).each(function(i) {
				if (score >= this.score) {
					pos = i;
					hiScore.splice(i, 0, {time: getHiScoreDate(), wave: wave, score: score});
					hiScore.splice(10, 1);
					return false;
				}
			});
			
			localStorage.setItem(HISCORE_KEY, JSON.stringify(hiScore));
			
			return pos;
		},
		
		showHiScore: function(highlight) {
			var hiScore = HiScore.loadHiScore();
			
			if (hiScore === null){
				hiScore = getDefaultHiScore();
				HiScore.saveHiScore(-1, -1);
			}
			
			var table = $('#hiscore-table');
			table.empty().append('<tr><th>Rank</th><th>Date</th><th>Wave</th><th>Score</th></tr>');
			$.each(hiScore, function(i) {
				table.append('<tr class="' + (i === highlight ? 'this-hiscore' : '') + '"><td>' + (i+1) + '</td><td>' + this.time + '</td><td>' + this.wave + '</td><td>' + this.score + '</td></tr>');
			});
			
			$('.scene').hide();
			$('#hiscore-scene').show();
			$('#back').one('click', function() {
				$('#hiscore-scene').hide();
				$('#start-scene').show();
			});
		},
		
	};

})();