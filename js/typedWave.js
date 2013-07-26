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
		e.bulletOptions = {};
		e.bulletSize = 0.06;
		e.bulletSpeed = 0.05;
		e.bulletLifetime = 60;
		e.bulletBehaviours = [alignRotationToMovement];
		return e;
	};
	
	var aimedFiring = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(0.15, randomAngle()),
			color: {h: 350, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement, aimedFire]);

		e.fireCooldown = 100;
		e.bulletOptions = {};
		e.bulletSize = 0.06;
		e.bulletSpeed = 0.05;
		e.bulletLifetime = 60;
		e.bulletBehaviours = [alignRotationToMovement];
		return e;
	};
	
	var hp5 = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(0.15, randomAngle()),
			color: {h: 0, s: 1, l: 0.55, a: 1}
		}, [alignRotationToMovement], [hp]);
		
		e.hp = 5;
		
		return e;
	};

	var waveData = [];
	waveData[1] = [simple, simple, simple];
	waveData[2] = [simple, chasing, simple, chasing];
	waveData[3] = [randomFiring, randomFiring, randomFiring];
	waveData[4] = [simple, simple, chasing, chasing, randomFiring, randomFiring];
	waveData[5] = [aimedFiring, aimedFiring, aimedFiring];
	waveData[6] = [chasing, chasing, randomFiring, randomFiring, aimedFiring, aimedFiring];
	waveData[7] = [hp5, hp5, hp5, chasing, chasing, chasing, chasing];
	
	var enemy = [];
	$.each(waveData[wave], function(){
		enemy.push(this());
	});

	return enemy;
}