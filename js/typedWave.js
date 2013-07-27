"use strict";

/**
 * Wave generator
 * @param enemy Enemy array left in the field. Add new enemies to this array.
 * @param wave Wave number
 * @param player The player object
 * @param oldEnemy All generated enemies of last wave.
 */
function generateWave(enemy, wave, player, oldEnemy) {

	var getEnemyPosition = function() {
		return randomLocationAvoidRadius(-3 + 0.4, 3 - 0.4, -3 + 0.4, 3 - 0.4, player.body.GetPosition(), 1);
	};

	var simple = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement]);

		return e;
	};

	var chasing = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 10, s: 1, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.chasePlayer]);

		e.chaseFactor = 0.02;
		return e;
	};
	
	var randomFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 1, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false
			}, [Behaviours.alignRotationToMovement]);
		};
		
		return e;
	};
	
	var aimedFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 30, s: 1, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire]);

		e.fireCooldown = 100;
		e.aimError = deg2rad(10);
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false
			}, [Behaviours.alignRotationToMovement]);
		};
		
		return e;
	};
	
	var hp5 = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.55, a: 1}
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp]);
		
		e.hp = 5;
		
		return e;
	};
	
	var hp3AimedFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 30, s: 1, l: 0.55, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire], [Behaviours.hp]);

		e.fireCooldown = 100;
		e.aimError = 0;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false
			}, [Behaviours.alignRotationToMovement]);
		};
		e.hp = 3;
		
		return e;
	};
	
	var large = function(){
		var e = createEnemy(getEnemyPosition(), 0.4, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.6, a: 1}
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp]);
		
		e.hp = 5;
		
		return e;
	};
	
	var small = function(){
		var e = createEnemy(getEnemyPosition(), 0.04, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.45, a: 1}
		}, [Behaviours.alignRotationToMovement]);

		return e;
	};
	
	var fast = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(9, randomAngle()),
			color: {h: 0, s: 0.9, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement]);

		return e;
	};
	
	var counterAttack = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 40, s: 1, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement], [], [Behaviours.counterAttack]);

		e.aimError = 0;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 100,
				preventNextWave: false,
			}, [Behaviours.alignRotationToMovement], [Behaviours.indestructible]);
		};
		
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
	waveData[8] = [hp3AimedFiring, hp3AimedFiring, hp3AimedFiring, hp3AimedFiring];
	waveData[9] = [hp3AimedFiring, hp3AimedFiring, hp3AimedFiring, randomFiring, randomFiring, randomFiring, randomFiring];
	waveData[10] = [large, large, large, small, small, small];
	waveData[11] = [fast, fast, fast, large, large, small, small];
	waveData[12] = [large, large, large, hp5, hp5, hp3AimedFiring, hp3AimedFiring, hp3AimedFiring];
	waveData[13] = [fast, fast, fast, small, small, chasing, chasing, chasing];
	waveData[14] = [].pushMul(20, chasing);
	waveData[15] = [].pushMul(5, counterAttack);
	
	$.each(waveData[(wave - 1) % waveData.length], function(){
		for (var i = 0; i < Math.ceil(wave / waveData.length); i++) { 
			enemy.push(this());
		}
	});

	return enemy;
}