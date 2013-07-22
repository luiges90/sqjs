"use strict";

function createBullet(parent, fireVector) {
	var bullet = Object.create(SqEntity);
	bullet.init(TYPE_PLAYER_BULLET, new b2Vec2(parent.body.GetPosition().x, parent.body.GetPosition().y), 0.06, {
		lifetime: 60,
		linearVelocity: fireVector
	});
	
	bullet.draw = function(){
		var canvas = document.getElementById('scene').getContext('2d');
		var drawX, drawY, drawSize;
		
		drawX = this.body.GetPosition().x * 100 + 300;
		drawY = -this.body.GetPosition().y * 100 + 300;
		drawSize = this.size * 100;
		
		var opacity = this.color.a;
	
		canvas.beginPath();
		canvas.fillStyle = "hsla(" + this.color.h + ", " + this.color.s * 100 + "%, " + this.color.l * 100 + "%, " + opacity + ")";
		canvas.arc(drawX, drawY, drawSize, 0, 2 * Math.PI, true);
		canvas.fill();
	};
	
	return bullet;
}

function createPlayer() {
	var player = Object.create(SqEntity);
	player.init(TYPE_PLAYER, new b2Vec2(0, 0), 0.12, {
		linearDamping: 1.5
	});
	
	player.invincibleTimer = 0;
	player.isInvincible = function(){return this.invincibleTimer > 0;};
	
	player.fireCooldown = 3;
	player.fireCooldownTimer = 0;
	
	player.stepAction.push(function(keys, mouse, player, playerBullet, enemy) {
		// move player action
		var body = this.body;
		var force = this.force;
		for (var i in keys){
			switch (i) {
				case '87': //'w'
					body.ApplyImpulse(new b2Vec2(0, force), body.GetWorldCenter());
					break;
				case '65': //'a'
					body.ApplyImpulse(new b2Vec2(-force, 0), body.GetWorldCenter());
					break;
				case '83': //'s'
					body.ApplyImpulse(new b2Vec2(0, -force), body.GetWorldCenter());
					break;
				case '68': //'d'
					body.ApplyImpulse(new b2Vec2(force, 0), body.GetWorldCenter());
					break;
			}
		}

		// fire action
		if (mouse[1] && this.fireCooldownTimer <= 0) {
			this.fireCooldownTimer = this.fireCooldown;
			
			var position = mouse.position;
			
			var fireVector = new b2Vec2(position.x - this.body.GetPosition().x, position.y - this.body.GetPosition().y);
			fireVector.Normalize();
			fireVector.Multiply(0.06);
	
			var bullet = createBullet(player, fireVector);
				
			playerBullet.push(bullet);
		}
		
		// maintain state
		this.fireCooldownTimer--;
	
		this.invincibleTimer--;	
	});
	
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
	
	player.revive = function() {
		this.destroyed = false;
		this.invincibleTimer = FPS * 3;	
	};
	
	return player;
}