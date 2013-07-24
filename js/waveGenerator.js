"use strict";

function simpleWave(wave, player, oldEnemy) {
	var count = wave;

	var enemy = [];
	for (var i = 0; i < count; ++i){
		var e = createEnemy(randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
			linearVelocity: rtToVector(0.15, randomAngle()),
			color: {h: 0, s: 1, l: 0.5, a: 1}
		}, [alignRotationToMovement]);
		
		enemy.push(e);
	}
	
	return enemy;
}