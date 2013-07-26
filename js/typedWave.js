"use strict";

function typedWave(wave, player, oldEnemy) {

	var simple = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(0.15, randomAngle()),
			color: {h: 0, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement]);

		return e;
	};

	var chasing = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(0.15, randomAngle()),
			color: {h: 20, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement, chasePlayer]);

		e.chaseFactor = 0.02;
		return e;
	};

	var waveData = [];
	waveData[1] = [simple, simple, simple];
	waveData[2] = [simple, chasing, simple, chasing];
	
	var enemy = [];
	$.each(waveData[wave], function(){
		enemy.push(this());
	});

	return enemy;
}