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

	var pure = function(parent){
		var e = createEnemy(parent ? parent.body.GetPosition() : getEnemyPosition(), 0.12, {
			linearVelocity: rtToVector(3, randomAngle()),
			color: {h: 0, s: 1, l: 0.5, a: 1},
			scoreOnDestroy: parent ? 0 : 1
		}, [Behaviours.alignRotationToMovement]);

		return e;
	};

	if (wave == 0) {
		enemy.pushMul(3, simple());
	} else {
		enemy = oldEnemy;
	}
}
