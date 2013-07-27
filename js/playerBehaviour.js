"use strict";

/**
 * Behaviours for player. 
 * See behaviour.js for details.
 */

var PlayerBehaviours = (function(){

	function createPlayerBullet(parent, fireVector) {
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

	return {
	
		moveByWASD: function(keys, mouse, player, playerBullet, enemy) {
			if (typeof this.movingForce === 'undefined'){
				throw new 'movingForce is required';
			}

			var body = this.body;
			var force = this.movingForce;
			for (var i in keys){
				switch (i) {
					case '38': // up key
					case '87': //'w'
						body.ApplyImpulse(new b2Vec2(0, force), body.GetWorldCenter());
						break;
					case '37': // left key
					case '65': //'a'
						body.ApplyImpulse(new b2Vec2(-force, 0), body.GetWorldCenter());
						break;
					case '40': // down key
					case '83': //'s'
						body.ApplyImpulse(new b2Vec2(0, -force), body.GetWorldCenter());
						break;
					case '39': // right key
					case '68': //'d'
						body.ApplyImpulse(new b2Vec2(force, 0), body.GetWorldCenter());
						break;
				}
			}
		},

		fireByLeftMouse: function(keys, mouse, player, playerBullet, enemy) {
			if (typeof this.fireCooldown === 'undefined'){
				throw new 'fireCooldown is required';
			}

			if (typeof this.fireCooldownTimer === 'undefined') {
				this.fireCooldownTimer = 0;
			}

			if (mouse[1] && this.fireCooldownTimer <= 0) {
				this.fireCooldownTimer = this.fireCooldown;

				var position = mouse.position;

				var fireVector = vectorFromTo(player.body.GetPosition(), position, 5);

				var bullet = createPlayerBullet(player, fireVector);

				playerBullet.push(bullet);
			}

			this.fireCooldownTimer--;
		}
		
	};

})();