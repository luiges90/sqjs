"use strict";

function createEnemy(player) {
	var e = Object.create(SqEntity);
	e.init(TYPE_ENEMY,  randomLocationAvoidRadius(-3 + 0.24, 3 - 0.24, -3 + 0.24, 3 - 0.24, player.body.GetPosition(), 1), 0.12, {
		linearVelocity: rtToVector(0.15, randomAngle())
	});
	
	e.stepAction.push(function(keys, mouse, player, playerBullet, enemy){
		this.body.SetAngle(vectorAngle(this.body.GetLinearVelocity()));	
	});
	
	e.draw = function(){
		var canvas = document.getElementById('scene').getContext('2d');
		var drawSize = this.size * 100;

		canvas.save();
		
		canvas.fillStyle = "hsla(" + this.color.h + ", " + this.color.s * 100 + "%, " + this.color.l * 100 + "%, " + this.color.a + ")";
		
		canvas.translate(this.body.GetPosition().x * 100 + 300, -this.body.GetPosition().y * 100 + 300);
		canvas.rotate(-this.body.GetAngle());
		canvas.fillRect(-drawSize, -drawSize, drawSize * 2, drawSize * 2);
		
		canvas.restore();
	};
	
	return e;
}