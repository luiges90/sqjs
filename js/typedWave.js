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
	
	var chaseFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 50, s: 1, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire, Behaviours.chasePlayer]);

		e.chaseFactor = 0.03;
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
		
		return e;
	};
	
	var hpChasing = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 10, s: 1, l: 0.55, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.chasePlayer], [Behaviours.hp]);

		e.chaseFactor = 0.05;
		e.hp = 3;
		return e;
	};
	
	var teleporting = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 60, s: 1, l: 0.55, a: 1}
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp], [Behaviours.teleport]);
		
		e.hp = 3;
		
		return e;
	};
	
	var hp10CounterAttack = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 40, s: 1, l: 0.55, a: 1}
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp], [Behaviours.counterAttack]);

		e.hp = 5;
		e.aimError = 0;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 100,
				preventNextWave: false,
			}, [Behaviours.alignRotationToMovement]);
		};
		
		return e;
	};
	
	var blinking = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 70, s: 1, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.blink], [Behaviours.hp]);
		
		e.hp = 3;
		e.blinkOn = 60;
		e.blinkOff = 60;
		
		return e;
	};
	
	var blinkingCounterAttack = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 70, s: 0.9, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.blink], [Behaviours.hpImmuneWhenBlink], [Behaviours.counterAttackOnBlink]);
		
		e.hp = 1;
		e.blinkOn = 60;
		e.blinkOff = 60;
		e.aimError = 0;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.oldColor,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
			}, [Behaviours.alignRotationToMovement]);
		};
		
		return e;
	};
	
	var frequentRandomFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 0.9, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 40;
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
	
	var randomFiring3 = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 0.8, l: 0.5, a: 1}
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.bulletSpread = 3;
		e.bulletSpreadAngle = deg2rad(10);
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

	var waveData = [];
	waveData[0] = [].pushMul(3, simple);
	waveData[1] = [].pushMul(2, simple).pushMul(2, chasing);
	waveData[2] = [].pushMul(3, randomFiring);
	waveData[3] = [].pushMul(2, simple).pushMul(2, chasing).pushMul(2, randomFiring);
	waveData[4] = [].pushMul(4, aimedFiring);
	waveData[5] = [].pushMul(2, chasing).pushMul(2, randomFiring).pushMul(2, aimedFiring);
	waveData[6] = [].pushMul(5, hp5);
	waveData[7] = [].pushMul(3, hp5).pushMul(3, chasing).pushMul(2, aimedFiring);
	waveData[8] = [].pushMul(5, hp3AimedFiring);
	waveData[9] = [].pushMul(3, hp3AimedFiring).pushMul(4, randomFiring);
	waveData[10] = [].pushMul(3, large).pushMul(3, small);
	waveData[11] = [].pushMul(3, fast).pushMul(2, large).pushMul(2, small);
	waveData[12] = [].pushMul(3, large).pushMul(2, hp5).pushMul(3, hp3AimedFiring);
	waveData[13] = [].pushMul(3, fast).pushMul(3, small).pushMul(3, chasing);
	waveData[14] = [].pushMul(5, counterAttack);
	waveData[15] = [].pushMul(3, counterAttack).pushMul(3, chasing).pushMul(2, hp3AimedFiring);
	waveData[16] = [].pushMul(5, chaseFiring);
	waveData[17] = [].pushMul(5, hpChasing);
	waveData[18] = [].pushMul(4, chaseFiring).pushMul(4, hpChasing);
	waveData[19] = [].pushMul(3, hpChasing).pushMul(3, counterAttack).pushMul(3, chaseFiring).pushMul(3, small);
	waveData[20] = [].pushMul(5, teleporting).pushMul(2, fast);
	waveData[21] = [].pushMul(5, hp10CounterAttack);
	waveData[22] = [].pushMul(5, teleporting).pushMul(3, hp10CounterAttack);
	waveData[23] = [].pushMul(3, hp10CounterAttack).pushMul(3, counterAttack).pushMul(3, small);
	waveData[24] = [].pushMul(5, large).pushMul(5, teleporting);
	waveData[25] = [].pushMul(8, blinking);
	waveData[26] = [].pushMul(5, blinkingCounterAttack).pushMul(3, blinking);
	waveData[27] = [].pushMul(5, hp10CounterAttack).pushMul(5, blinkingCounterAttack);
	waveData[28] = [].pushMul(5, frequentRandomFiring).pushMul(3, chaseFiring);
	waveData[29] = [].pushMul(5, randomFiring3).pushMul(3, hp3AimedFiring);
	waveData[30] = [].pushMul(5, randomFiring3).pushMul(5, frequentRandomFiring);
	
	$.each(waveData[(wave - 1) % waveData.length], function(){
		for (var i = 0; i < Math.ceil(wave / waveData.length); i++) { 
			enemy.push(this());
		}
	});

	return enemy;
}