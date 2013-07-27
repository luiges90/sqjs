"use strict";

var Behaviours = (function() {

	function requiredFields(fields) {
		var that = this;
		$.each(fields, function(){
			if (typeof that[this] === 'undefined') {
				throw this + ' is required.';
			}
		});
	};

	return {

		alignRotationToMovement: function(keys, mouse, player, playerBullet, enemy){
			this.body.SetAngle(vectorAngle(this.body.GetLinearVelocity()));
		},

		chasePlayer: function(keys, mouse, player, playerBullet, enemy) {
			requiredFields.call(this, ['chaseFactor']);

			var current = this.body.GetAngle();
			var target = vectorAngle(vectorFromTo(this.body.GetPosition(), player.body.GetPosition()));

			var diff, direction;
			var diff = Math.abs(target - current);
			if (target > current) {
				direction = diff > Math.PI ? -1 : 1;
			} else if (target < current) {
				direction = diff > Math.PI ? 1 : -1;
			}
			
			var oldMag = this.body.GetLinearVelocity().Length();
			if (diff < this.chaseFactor) {
				this.body.SetLinearVelocity(rtToVector(oldMag, target));
			} else {
				this.body.SetLinearVelocity(rtToVector(oldMag, current + this.chaseFactor * direction));
			}
		},

		randomFire: function(keys, mouse, player, playerBullet, enemy) {
			requiredFields.call(this, ['fireCooldown', 'bulletSpeed', 'createBullet']);
			
			if (typeof this.fireCooldownTimer === 'undefined') {
				this.fireCooldownTimer = randBetween(0, this.fireCooldown);
			}
			
			if (this.fireCooldownTimer <= 0) {
				this.fireCooldownTimer = this.fireCooldown;

				var velocity = rtToVector(this.bulletSpeed, randomAngle());

				var bullet = this.createBullet(this, velocity);
				
				enemy.push(bullet);
			}

			this.fireCooldownTimer--;
		},

		aimedFire: function(keys, mouse, player, playerBullet, enemy) {
			requiredFields.call(this, ['fireCooldown', 'bulletSpeed', 'createBullet', 'aimError']);
			
			if (typeof this.fireCooldownTimer === 'undefined') {
				this.fireCooldownTimer = randBetween(0, this.fireCooldown);
			}

			if (this.fireCooldownTimer <= 0) {
				this.fireCooldownTimer = this.fireCooldown;

				var velocity = rtToVector(this.bulletSpeed, vectorAngle(vectorFromTo(this.body.GetPosition(), player.body.GetPosition())) + randBetween(-this.aimError, this.aimError));

				var bullet = this.createBullet(this, velocity);

				enemy.push(bullet);
			}

			this.fireCooldownTimer--;
		},

		hp: function(keys, mouse, player, playerBullet, enemy) {
			requiredFields.call(this, ['hp']);
			
			if (typeof this.currentHp === 'undefined') {
				this.currentHp = this.hp;
			}
			
			this.currentHp--;
			
			return this.currentHp > 0;
		},
		
		indestructible: function(keys, mouse, player, playerBullet, enemy) {
			return true;
		},
		
		counterAttack: function(keys, mouse, player, playerBullet, enemy) {
			requiredFields.call(this, ['bulletSpeed', 'createBullet', 'aimError']);

			var velocity = rtToVector(this.bulletSpeed, vectorAngle(vectorFromTo(this.body.GetPosition(), player.body.GetPosition())) + randBetween(-this.aimError, this.aimError));

			var bullet = this.createBullet(this, velocity);

			enemy.push(bullet);
		},
		
	};

})();