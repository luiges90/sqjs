"use strict";

function createEnemy(location, size, options, behaviours) {
	var e = Object.create(SqEntity);
	e.init(TYPE_ENEMY, location, size, options);
	
	for (var i = 0; i < behaviours; ++i) {
		e.stepAction.push(behaviours[i]);
	}
	
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
