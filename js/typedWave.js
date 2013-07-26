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
	
	var randomFiring = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(0.15, randomAngle()),
			color: {h: 10, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement, randomFire]);

		e.fireCooldown = 100;
		return e;
	};

	var waveData = [];
	waveData[1] = [simple, simple, simple];
	waveData[2] = [simple, chasing, simple, chasing];
	waveData[3] = [randomFiring, randomFiring, randomFiring];
	waveData[4] = [simple, simple, chasing, chasing, randomFiring, randomFiring];
	
	var enemy = [];
	$.each(waveData[wave], function(){
		enemy.push(this());
	});

	return enemy;
}