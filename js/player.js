"use strict";

function createPlayer() {
	var player = Object.create(SqEntity);
	player.init(TYPE_PLAYER, new b2Vec2(0, 0), 0.12, {
		linearDamping: 1.5
	});
	
	player.invincibleTimer = 0;
	player.isInvincible = function(){return this.invincibleTimer > 0;};
	
	player.stepAction.push(function(keys, mouse, player, playerBullet, enemy) {
		this.invincibleTimer--;	
	});
	
	player.revive = function() {
		this.destroyed = false;
		this.invincibleTimer = FPS * 3;	
	};
	
	player.fireCooldown = 3;
	
	player.stepAction.push(moveByWASD);
	player.stepAction.push(fireByLeftMouse);
	
	player.draw = function() {
		var canvas = document.getElementById('scene').getContext('2d');
		var drawX, drawY, drawSize;
		
		drawX = this.body.GetPosition().x * 100 + 300;
		drawY = -this.body.GetPosition().y * 100 + 300;
		drawSize = this.size * 100;
		
		var opacity = this.color.a;
		if (this.isInvincible() && this.invincibleTimer % 30 < 15) {
			opacity = 0;
		}
	
		canvas.beginPath();
		canvas.fillStyle = "hsla(" + this.color.h + ", " + this.color.s * 100 + "%, " + this.color.l * 100 + "%, " + opacity + ")";
		canvas.arc(drawX, drawY, drawSize, 0, 2 * Math.PI, true);
		canvas.fill();
	};
	
	return player;
}