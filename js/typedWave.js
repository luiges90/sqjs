"use strict";

function enemyStoreStat(enemy, wave, player, oldEnemy) {
	var ENEMY_TYPE_KILL_COUNT = 'sq_enemy_type_kill_count';
	var typedKillCount = JSON.parse(localStorage.getItem(ENEMY_TYPE_KILL_COUNT)) || {};

	$.each(oldEnemy, function(){
		if (!typedKillCount[this.name]) typedKillCount[this.name] = 0;
		typedKillCount[this.name] += this.kills;
	});
	
	localStorage.setItem(ENEMY_TYPE_KILL_COUNT, JSON.stringify(typedKillCount));
}

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

	var simple = function(parent){
		var e = createEnemy(parent ? parent.body.GetPosition() : getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1,
			name: 'simple'
		}, [Behaviours.alignRotationToMovement]);

		return e;
	};

	var chasing = function(parent){
		var e = createEnemy(parent ? parent.body.GetPosition() : getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 10, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1,
			name: 'chasing'
		}, [Behaviours.alignRotationToMovement, Behaviours.chasePlayer]);

		e.chaseFactor = 0.02;
		return e;
	};

	var randomFiring = function(parent){
		var e = createEnemy(parent ? parent.body.GetPosition() : getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1,
			name: 'randomFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var aimedFiring = function(parent){
		var e = createEnemy(parent ? parent.body.GetPosition() : getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 30, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1,
			name: 'aimedFiring'
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
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var hp = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.55, a: 1},
			name: 'hp'
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp]);

		e.hp = 3;

		return e;
	};

	var hpAimedFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 30, s: 1, l: 0.55, a: 1},
			name: 'hpAimedFiring'
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
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};
		e.hp = 3;

		return e;
	};

	var large = function(){
		var e = createEnemy(getEnemyPosition(), 0.4, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.6, a: 1},
			name: 'large'
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp]);

		e.hp = 5;

		return e;
	};

	var small = function(){
		var e = createEnemy(getEnemyPosition(), 0.04, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.45, a: 1},
			name: 'small'
		}, [Behaviours.alignRotationToMovement]);

		return e;
	};

	var fast = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(6, randomAngle()),
			color: {h: 0, s: 0.9, l: 0.5, a: 1},
			name: 'fast'
		}, [Behaviours.alignRotationToMovement]);

		return e;
	};

	var counterAttack = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 40, s: 1, l: 0.5, a: 1},
			name: 'counterAttack'
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
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement], [Behaviours.indestructible]);
		};

		return e;
	};

	var chaseFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 50, s: 1, l: 0.5, a: 1},
			name: 'chaseFiring'
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
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var hpChasing = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 10, s: 1, l: 0.55, a: 1},
			name: 'hpChasing'
		}, [Behaviours.alignRotationToMovement, Behaviours.chasePlayer], [Behaviours.hp]);

		e.chaseFactor = 0.05;
		e.hp = 3;
		return e;
	};

	var teleporting = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 60, s: 1, l: 0.55, a: 1},
			name: 'teleporting'
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp], [Behaviours.teleport]);

		e.hp = 3;

		return e;
	};

	var hpCounterAttack = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 40, s: 1, l: 0.55, a: 1},
			name: 'hpCounterAttack'
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
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var blinking = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 70, s: 1, l: 0.5, a: 1},
			name: 'blinking'
		}, [Behaviours.alignRotationToMovement, Behaviours.blink], [Behaviours.hp]);

		e.hp = 3;
		e.blinkOn = 60;
		e.blinkOff = 60;

		return e;
	};

	var blinkingCounterAttack = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 70, s: 0.9, l: 0.5, a: 1},
			name: 'blinkingCounterAttack'
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
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var frequentRandomFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 0.9, l: 0.5, a: 1},
			name: 'frequentRandomFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 40;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var randomFiring3 = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 0.8, l: 0.5, a: 1},
			name: 'randomFiring3'
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
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var smallChasing = function(){
		var e = createEnemy(getEnemyPosition(), 0.04, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 10, s: 1, l: 0.45, a: 1},
			name: 'smallChasing'
		}, [Behaviours.alignRotationToMovement, Behaviours.chasePlayer]);

		e.chaseFactor = 0.06;
		return e;
	};

	var largeFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.4, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 30, s: 1, l: 0.7, a: 1},
			name: 'largeFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire], [Behaviours.hp]);

		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.hp = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.12, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var mineLayer = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 80, s: 1, l: 0.5, a: 1},
			name: 'mineLayer'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 50;
		e.bulletSpeed = 0;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: -1,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var indestructibleFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 30, s: 0.8, l: 0.5, a: 1},
			name: 'indestructibleFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire]);

		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.aimError = 0;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 100,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement], [Behaviours.indestructible]);
		};

		return e;
	};

	var bulletAttractor = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 90, s: 1, l: 0.5, a: 1},
			name: 'bulletAttractor'
		}, [Behaviours.alignRotationToMovement, Behaviours.attractBullet], [Behaviours.hp]);

		e.hp = 10;
		e.attractingForce = 0.001;

		return e;
	};

	var bulletRepulsor = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 100, s: 1, l: 0.5, a: 1},
			name: 'bulletRepulsor'
		}, [Behaviours.alignRotationToMovement, Behaviours.repelBullet]);

		e.repellingForce = 0.001;

		return e;
	};

	var generator = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 110, s: 1, l: 0.5, a: 1},
			name: 'generator'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire], [Behaviours.hp]);

		e.fireCooldown = 100;
		e.bulletSpeed = 3;
		e.hp = 5;
		e.createBullet = simple;

		return e;
	};

	var sneaky = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(2, randomAngle()),
			color: {h: 120, s: 1, l: 0.5, a: 1},
			name: 'sneaky'
		}, [Behaviours.alignRotationToMovement, Behaviours.sneaky, Behaviours.chasePlayer], [Behaviours.hpImmuneWhenBlink]);

		e.hp = 1;
		e.sneakyRange = 1.5;
		e.chaseFactor = 0.05;

		return e;
	};

	var sneakyMineLayer = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 80, s: 1, l: 0.6, a: 1},
			name: 'sneakyMineLayer'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 50;
		e.bulletSpeed = 0;
		e.playSound = null;
		e.createBullet = function(parent, velocity) {
			var e = createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: $.extend({}, parent.color),
				scoreOnDestroy: 0,
				lifetime: -1,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement, Behaviours.sneaky]);

			e.hp = 1;
			e.sneakyRange = 1;

			return e;
		};

		return e;
	};

	var fastRandomFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(6, randomAngle()),
			color: {h: 20, s: 0.7, l: 0.5, a: 1},
			name: 'fastRandomFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 40;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var hpAimedFiring3 = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 30, s: 0.8, l: 0.6, a: 1},
			name: 'hpAimedFiring3'
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire], [Behaviours.hp]);

		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.bulletSpread = 3;
		e.hp = 5;
		e.bulletSpreadAngle = deg2rad(10);
		e.aimError = 0;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var fireChasing = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 130, s: 1, l: 0.5, a: 1},
			name: 'fireChasing'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 50;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			var f = createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement, Behaviours.chasePlayer]);
			f.chaseFactor = 0.05;
			return f;
		};

		return e;
	};

	var darkFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 1, l: 0.1, a: 1},
			name: 'darkFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire]);

		e.fireCooldown = 40;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var autoTeleporting = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 60, s: 1, l: 0.7, a: 1},
			name: 'autoTeleporting'
		}, [Behaviours.alignRotationToMovement, Behaviours.autoTeleport], [Behaviours.hp, Behaviours.teleport]);

		e.teleportCooldown = 50;
		e.hp = 7;
		e.playSound = 'sound/teleport.ogg';

		return e;
	};
	
	var splitRandomFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 20, s: 0.9, l: 0.4, a: 1},
			name: 'splitRandomFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire], [], [Behaviours.split]);

		e.fireCooldown = 33;
		e.bulletSpeed = 5;
		e.splitCount = 9;
		e.splitTo = randomFiring;
		e.splitSpeed = 3;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var burstOnHit = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 40, s: 0.9, l: 0.5, a: 1},
			name: 'burstOnHit'
		}, [Behaviours.alignRotationToMovement], [], [Behaviours.counterAttack]);

		e.aimError = 0;
		e.bulletSpeed = 5;
		e.bulletSpread = 30;
		e.bulletSpreadAngle = deg2rad(360 / 30);
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};
	
	var hpIndestructibleCounterAttack = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 40, s: 0.9, l: 0.55, a: 1},
			name: 'hpIndestructibleCounterAttack'
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp], [Behaviours.counterAttack]);

		e.aimError = 0;
		e.bulletSpeed = 5;
		e.bulletSpread = 3;
		e.bulletSpreadAngle = deg2rad(10);
		e.hp = 3;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement], [Behaviours.indestructible]);
		};

		return e;
	};

	var hpFastAimedFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(6, randomAngle()),
			color: {h: 20, s: 0.6, l: 0.5, a: 1},
			name: 'hpFastAimedFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire], [Behaviours.hp]);

		e.aimError = deg2rad(10);
		e.hp = 5;
		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};

	var hpSmallChasing = function(){
		var e = createEnemy(getEnemyPosition(), 0.04, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 10, s: 0.9, l: 0.4, a: 1},
			name: 'hpSmallChasing'
		}, [Behaviours.alignRotationToMovement, Behaviours.chasePlayer], [Behaviours.hp]);

		e.hp = 5;
		e.chaseFactor = 0.06;
		return e;
	};

	var moveForceToPlayer = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 140, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1,
			name: 'moveForceToPlayer'
		}, [Behaviours.alignRotationToMovement, Behaviours.forceToPlayer], [Behaviours.hp]);

		e.hp = 3;
		e.toPlayerForce = 0.01;
		return e;
	};
	
	var chaserGenerator = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 110, s: 0.9, l: 0.5, a: 1},
			name: 'chaserGenerator'
		}, [Behaviours.alignRotationToMovement, Behaviours.randomFire], [Behaviours.hp]);

		e.fireCooldown = 100;
		e.bulletSpeed = 3;
		e.hp = 8;
		e.createBullet = chasing;

		return e;
	};
	
	var immuneTarget = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 150, s: 1, l: 0.7, a: 1},
			name: 'immuneTarget'
		}, [Behaviours.alignRotationToMovement], [Behaviours.hp]);

		e.hp = 8;
		
		return e;
	};
	
	var immuneUntilTargetBeaten = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 150, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1,
			name: 'immuneUntilTargetBeaten'
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire], [Behaviours.immuneUntilTargetBeaten]);

		e.targetName = 'immuneTarget';
		e.fireCooldown = 50;
		e.aimError = 0;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};
	
	var burstBullet = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 160, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1,
			name: 'burstBullet'
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire], [Behaviours.hp]);

		e.fireCooldown = 50;
		e.aimError = 0;
		e.bulletSpeed = 3;
		e.hp = 5;
		e.createBullet = function(parent, velocity) {
			var b = createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement], [], [Behaviours.counterAttack]);
			
			b.aimError = 0;
			b.bulletSpeed = 5;
			b.bulletSpread = 12;
			b.bulletSpreadAngle = deg2rad(360 / 12);
			
			b.createBullet = function(parent, velocity) {
				return createEnemy(parent.body.GetPosition(), 0.06, {
					linearVelocity: velocity,
					color: parent.color,
					scoreOnDestroy: 0,
					lifetime: 60,
					preventNextWave: false,
					generateParticles: false,
					destroySound: 'sound/bulletDestroy.ogg'
				}, [Behaviours.alignRotationToMovement]);
			}
			
			return b;
		};

		return e;
	};
	
	var attractCounterAttack = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 170, s: 1, l: 0.5, a: 1},
			name: 'attractCounterAttack'
		}, [Behaviours.alignRotationToMovement, Behaviours.attractBullet], [Behaviours.hp], [Behaviours.counterAttack]);

		e.hp = 30;
		e.attractingForce = 0.001;
		e.aimError = 0;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 100,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};
	
	var repelAimedFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 180, s: 1, l: 0.5, a: 1},
			name: 'repelAimedFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire, Behaviours.repelBullet], [Behaviours.hp]);

		e.repellingForce = 0.001;
		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.bulletSpread = 3;
		e.hp = 3;
		e.bulletSpreadAngle = deg2rad(10);
		e.aimError = 0;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};
	
	var frequentAimedFiring = function(){
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 190, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1,
			name: 'speedyEscape'
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire]);

		e.fireCooldown = 33;
		e.aimError = 0;
		e.bulletSpeed = 5;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: parent.color,
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
			}, [Behaviours.alignRotationToMovement]);
		};

		return e;
	};
	
	var transparentFiring = function() {
		var e = createEnemy(getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 200, s: 1, l: 0.5, a: 0},
			name: 'transparentFiring'
		}, [Behaviours.alignRotationToMovement, Behaviours.aimedFire], [Behaviours.hp]);

		e.transparentTime = 1000;
		e.fireCooldown = 100;
		e.bulletSpeed = 5;
		e.bulletSpread = 3;
		e.hp = 3;
		e.bulletSpreadAngle = deg2rad(10);
		e.aimError = 0;
		e.createBullet = function(parent, velocity) {
			return createEnemy(parent.body.GetPosition(), 0.06, {
				linearVelocity: velocity,
				color: {h: 200, s: 1, l: 0.5, a: 1},
				scoreOnDestroy: 0,
				lifetime: 60,
				preventNextWave: false,
				generateParticles: false,
				destroySound: 'sound/bulletDestroy.ogg'
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
	waveData[6] = [].pushMul(5, hp);
	waveData[7] = [].pushMul(3, hp).pushMul(3, chasing).pushMul(2, aimedFiring);
	waveData[8] = [].pushMul(5, hpAimedFiring);
	waveData[9] = [].pushMul(3, hpAimedFiring).pushMul(4, randomFiring);
	waveData[10] = [].pushMul(3, large).pushMul(3, small);
	waveData[11] = [].pushMul(3, fast).pushMul(2, large).pushMul(2, small);
	waveData[12] = [].pushMul(3, fast).pushMul(3, small).pushMul(3, chasing);
	waveData[13] = [].pushMul(3, large).pushMul(2, hp).pushMul(3, hpAimedFiring);
	waveData[14] = [].pushMul(5, counterAttack);
	waveData[15] = [].pushMul(3, counterAttack).pushMul(3, chasing).pushMul(2, hpAimedFiring);
	waveData[16] = [].pushMul(5, chaseFiring);
	waveData[17] = [].pushMul(5, hpChasing);
	waveData[18] = [].pushMul(4, chaseFiring).pushMul(4, hpChasing);
	waveData[19] = [].pushMul(3, hpChasing).pushMul(3, counterAttack).pushMul(3, chaseFiring).pushMul(3, small);
	waveData[20] = [].pushMul(6, teleporting);
	waveData[21] = [].pushMul(5, hpCounterAttack);
	waveData[22] = [].pushMul(5, teleporting).pushMul(3, hpCounterAttack);
	waveData[23] = [].pushMul(3, hpCounterAttack).pushMul(3, counterAttack).pushMul(3, small);
	waveData[24] = [].pushMul(5, large).pushMul(5, teleporting);
	waveData[25] = [].pushMul(8, blinking);
	waveData[26] = [].pushMul(5, blinkingCounterAttack).pushMul(3, blinking);
	waveData[27] = [].pushMul(5, hpCounterAttack).pushMul(5, blinkingCounterAttack);
	waveData[28] = [].pushMul(5, frequentRandomFiring).pushMul(3, chaseFiring);
	waveData[29] = [].pushMul(5, randomFiring3).pushMul(3, hpAimedFiring);
	waveData[30] = [].pushMul(5, randomFiring3).pushMul(5, frequentRandomFiring);
	waveData[31] = [].pushMul(10, smallChasing);
	waveData[32] = [].pushMul(5, largeFiring).pushMul(3, hpAimedFiring);
	waveData[33] = [].pushMul(6, mineLayer).pushMul(4, blinking);
	waveData[34] = [].pushMul(5, mineLayer).pushMul(5, smallChasing);
	waveData[35] = [].pushMul(5, indestructibleFiring).pushMul(5, hpCounterAttack);
	waveData[36] = [].pushMul(4, indestructibleFiring).pushMul(4, smallChasing).pushMul(4, frequentRandomFiring);
	waveData[37] = [].pushMul(6, smallChasing).pushMul(6, blinking);
	waveData[38] = [].pushMul(8, mineLayer).pushMul(4, frequentRandomFiring).pushMul(4, randomFiring3);
	waveData[39] = [].pushMul(3, smallChasing).pushMul(3, chaseFiring).pushMul(3, hpChasing)
						.pushMul(3, blinking).pushMul(3, blinkingCounterAttack).pushMul(3, hpCounterAttack);
	waveData[40] = [].pushMul(8, bulletAttractor);
	waveData[41] = [].pushMul(8, bulletRepulsor);
	waveData[42] = [].pushMul(4, bulletRepulsor).pushMul(6, hpChasing);
	waveData[43] = [].pushMul(2, bulletAttractor).pushMul(2, bulletRepulsor).pushMul(6, hpAimedFiring);
	waveData[44] = [].pushMul(4, bulletAttractor).pushMul(3, hpCounterAttack).pushMul(3, blinkingCounterAttack);
	waveData[45] = [].pushMul(5, generator);
	waveData[46] = [].pushMul(3, generator).pushMul(6, largeFiring);
	waveData[47] = [].pushMul(5, bulletAttractor).pushMul(5, generator);
	waveData[48] = [].pushMul(8, sneaky);
	waveData[49] = [].pushMul(4, sneaky).pushMul(4, randomFiring3).pushMul(4, frequentRandomFiring);
	waveData[50] = [].pushMul(5, sneaky).pushMul(5, hpCounterAttack);
	waveData[51] = [].pushMul(8, sneakyMineLayer);
	waveData[52] = [].pushMul(3, sneakyMineLayer).pushMul(2, generator).pushMul(5, smallChasing);
	waveData[53] = [].pushMul(5, sneaky).pushMul(5, bulletAttractor);
	waveData[54] = [].pushMul(3, sneaky).pushMul(3, sneakyMineLayer).pushMul(3, blinkingCounterAttack).pushMul(3, indestructibleFiring);
	waveData[55] = [].pushMul(4, fastRandomFiring).pushMul(4, hpAimedFiring3);
	waveData[56] = [].pushMul(5, fastRandomFiring).pushMul(5, hpCounterAttack).pushMul(2, bulletRepulsor);
	waveData[57] = [].pushMul(6, indestructibleFiring).pushMul(3, hpAimedFiring3).pushMul(3, largeFiring);
	waveData[58] = [].pushMul(5, hpChasing).pushMul(5, fastRandomFiring).pushMul(5, smallChasing);
	waveData[59] = [].pushMul(3, generator).pushMul(3, bulletAttractor).pushMul(3, bulletRepulsor).
						pushMul(3, fastRandomFiring).pushMul(3, hpAimedFiring3).pushMul(5, sneaky);
	waveData[60] = [].pushMul(10, darkFiring);
	waveData[61] = [].pushMul(7, darkFiring).pushMul(5, sneaky);
	waveData[62] = [].pushMul(7, fireChasing);
	waveData[63] = [].pushMul(5, fireChasing).pushMul(2, generator).pushMul(2, sneakyMineLayer);
	waveData[64] = [].pushMul(12, autoTeleporting);
	waveData[65] = [].pushMul(6, autoTeleporting).pushMul(3, indestructibleFiring).pushMul(3, smallChasing);
	waveData[66] = [].pushMul(8, hpIndestructibleCounterAttack);
	waveData[67] = [].pushMul(4, hpIndestructibleCounterAttack).pushMul(4, darkFiring).pushMul(4, fireChasing);
	waveData[68] = [].pushMul(6, autoTeleporting).pushMul(4, hpIndestructibleCounterAttack).pushMul(2, generator).pushMul(2, hpAimedFiring3);
	waveData[69] = [].pushMul(6, splitRandomFiring);
	waveData[70] = [].pushMul(3, splitRandomFiring).pushMul(3, autoTeleporting).pushMul(3, fireChasing);
	waveData[71] = [].pushMul(8, burstOnHit);
	waveData[72] = [].pushMul(8, hpFastAimedFiring);
	waveData[73] = [].pushMul(12, hpSmallChasing);
	waveData[74] = [].pushMul(5, hpFastAimedFiring).pushMul(5, hpSmallChasing);
	waveData[75] = [].pushMul(3, bulletAttractor).pushMul(3, burstOnHit).pushMul(3, hpAimedFiring3).pushMul(6, hpSmallChasing);
	waveData[76] = [].pushMul(3, bulletRepulsor).pushMul(6, burstOnHit).pushMul(6, hpFastAimedFiring);
	waveData[77] = [].pushMul(5, moveForceToPlayer);
	waveData[78] = [].pushMul(3, moveForceToPlayer).pushMul(6, hpSmallChasing).pushMul(3, hpFastAimedFiring).pushMul(3, darkFiring);
	waveData[79] = [].pushMul(6, fireChasing).pushMul(3, moveForceToPlayer).pushMul(6, burstOnHit).
					pushMul(3, hpIndestructibleCounterAttack).pushMul(3, splitRandomFiring);
	waveData[80] = [].pushMul(6, chaserGenerator);
	waveData[82] = [].pushMul(4, chaserGenerator).pushMul(4, splitRandomFiring);
	waveData[81] = [].pushMul(4, chaserGenerator).pushMul(6, hpSmallChasing).pushMul(2, sneakyMineLayer);
	waveData[83] = [].pushMul(12, immuneTarget).pushMul(3, immuneUntilTargetBeaten);
	waveData[84] = [].pushMul(5, immuneTarget).pushMul(2, immuneUntilTargetBeaten).pushMul(4, chaserGenerator).pushMul(2, autoTeleporting);
	waveData[85] = [].pushMul(8, burstBullet);
	waveData[86] = [].pushMul(3, burstBullet).pushMul(5, immuneTarget).pushMul(1, immuneUntilTargetBeaten).pushMul(3, hpIndestructibleCounterAttack);
	waveData[87] = [].pushMul(10, attractCounterAttack);
	waveData[88] = [].pushMul(10, repelAimedFiring);
	waveData[89] = [].pushMul(5, repelAimedFiring).pushMul(3, sneaky).pushMul(3, hpIndestructibleCounterAttack);
	waveData[90] = [].pushMul(5, attractCounterAttack).pushMul(5, autoTeleporting);
	waveData[91] = [].pushMul(3, attractCounterAttack).pushMul(3, repelAimedFiring).pushMul(3, chaserGenerator);
	waveData[92] = [].pushMul(12, frequentAimedFiring);
	waveData[93] = [].pushMul(6, frequentAimedFiring).pushMul(3, hpIndestructibleCounterAttack).pushMul(3, burstBullet);
	waveData[94] = [].pushMul(12, transparentFiring);
	waveData[95] = [].pushMul(4, transparentFiring).pushMul(6, darkFiring).pushMul(8, sneaky);
	waveData[96] = [].pushMul(4, frequentAimedFiring).pushMul(4, transparentFiring).pushMul(4, hpIndestructibleCounterAttack);
	waveData[97] = [].pushMul(5, chaserGenerator).pushMul(8, immuneTarget).pushMul(3, immuneUntilTargetBeaten).pushMul(4, largeFiring);
	waveData[98] = [].pushMul(5, attractCounterAttack).pushMul(5, frequentAimedFiring).pushMul(5, burstBullet).pushMul(3, hpFastAimedFiring);
	waveData[99] = [].pushMul(3, chaserGenerator).pushMul(3, burstBullet).pushMul(3, immuneTarget)
					.pushMul(3, immuneUntilTargetBeaten).pushMul(3, attractCounterAttack)
					.pushMul(3, repelAimedFiring).pushMul(3, transparentFiring).pushMul(3, frequentAimedFiring);

	$.each(waveData[(wave - 1) % waveData.length], function(){
		for (var i = 0; i < Math.ceil(wave / waveData.length); i++) {
			enemy.push(this());
		}
	});

	return enemy;
}
