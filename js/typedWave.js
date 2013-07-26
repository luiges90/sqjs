"use strict";

function typedWave(wave, player, oldEnemy) {

	var createSimpleEnemy = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(0.15, randomAngle()),
			color: {h: 0, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement]);

		return e;
	};

	var createChasingEnemy = function(){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(0.15, randomAngle()),
			color: {h: 0.05, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement, chasePlayer]);

		e.chaseFactor = 0.02;
		return e;
	};

	var count = wave;

	var enemy = [];
	for (var i = 0; i < count; ++i){
		var e = createChasingEnemy();

		enemy.push(e);
	}

	return enemy;
}