"use strict";

function typedWave(wave, player, oldEnemy) {

	var simple = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement]);

		return e;
	};

	var chasing = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement, chasePlayer]);

		e.chaseFactor = 0.02;
		return e;
	};
	
	var randomFiring = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 10, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement, randomFire]);

		e.fireCooldown = 100;
		e.bulletOptions = {};
		e.bulletSize = 0.06;
		e.bulletSpeed = 5;
		e.bulletLifetime = 60;
		e.bulletBehaviours = [alignRotationToMovement];
		return e;
	};
	
	var aimedFiring = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 350, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement, aimedFire]);

		e.fireCooldown = 100;
		e.bulletOptions = {};
		e.bulletSize = 0.06;
		e.bulletSpeed = 5;
		e.bulletLifetime = 60;
		e.aimError = deg2rad(10);
		e.bulletBehaviours = [alignRotationToMovement];
		return e;
	};
	
	var hp5 = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.55, a: 1}
		}, [alignRotationToMovement], [hp]);
		
		e.hp = 5;
		
		return e;
	};
	
	var hp5AimedFiring = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 350, s: 1, l: 0.55, a: 1}
		}, [alignRotationToMovement, aimedFire], [hp]);

		e.fireCooldown = 100;
		e.bulletOptions = {};
		e.bulletSize = 0.06;
		e.bulletSpeed = 5;
		e.bulletLifetime = 60;
		e.aimError = deg2rad(10);
		e.bulletBehaviours = [alignRotationToMovement];
		e.hp = 5;
		return e;
	};
	
	var large = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.4, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 30, s: 1, l: 0.55, a: 1}
		}, [alignRotationToMovement], [hp]);
		
		e.hp = 5;
		
		return e;
	};
	
	var small = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.04, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 40, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement]);

		return e;
	};
	
	var fast = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(9, randomAngle()),
			color: {h: 50, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement]);

		return e;
	};

	var waveData = [];
	waveData[0] = [simple, simple, simple];
	waveData[1] = [simple, chasing, simple, chasing];
	waveData[2] = [randomFiring, randomFiring, randomFiring];
	waveData[3] = [simple, simple, chasing, chasing, randomFiring, randomFiring];
	waveData[4] = [aimedFiring, aimedFiring, aimedFiring];
	waveData[5] = [chasing, chasing, randomFiring, randomFiring, aimedFiring, aimedFiring];
	waveData[6] = [hp5, hp5, hp5, chasing, chasing, chasing, chasing];
	waveData[7] = [hp5, hp5, hp5, aimedFiring, randomFiring, aimedFiring, randomFiring];
	waveData[8] = [hp5AimedFiring, hp5AimedFiring, hp5AimedFiring, hp5AimedFiring];
	waveData[9] = [hp5AimedFiring, hp5AimedFiring, hp5AimedFiring, randomFiring, randomFiring, randomFiring, randomFiring];
	waveData[10] = [large, large, large, small, small, small];
	waveData[11] = [fast, fast, fast, large, large, small, small];
	waveData[12] = [large, large, large, hp5, hp5, hp5AimedFiring, hp5AimedFiring, hp5AimedFiring];
	waveData[13] = [fast, fast, fast, small, small, chasing, chasing, chasing];
	waveData[14] = [].pushMul(15, simple).pushMul(15, chasing);
	
	var enemy = [];
	$.each(waveData[(wave - 1) % waveData.length], function(){
		for (var i = 0; i < Math.ceil(wave / waveData.length); i++) { 
			enemy.push(this());
		}
	});

	return enemy;
}