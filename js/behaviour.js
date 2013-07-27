"use strict";

/**
 * Behaviours for enemies. 
 * To add new behaviours: put inside the returned object. Behaviours have the following signature.
 *     function(keys, mouse, player, playerBullet, enemy)
 * @this is set to the enemy performing the action.
 * @param keys Keys being pressed by the player, as keyCodes
 * @param mouse Player's mouse status. Whether mouse[1] is defined says if left mouse is being held. mouse.position stores current mouse position as X,Y
 *              coordinates
 * @param player Player as SqEntity in the game world
 * @param playerBullet Array of player bullets as SqEntity in the game world
 * @param enemy Array of enemies as SqEntity in the game world
 * @return If truthy value is returned and the behaviour is used as onDestroy behaviour, it will stop the destruction.
 */

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

		teleport: function(keys, mouse, player, playerBullet, enemy) {
			this.body.SetPosition(randomLocationAvoidRadius(-3 + 0.4, 3 - 0.4, -3 + 0.4, 3 - 0.4, player.body.GetPosition(), 1));
		},
		
		blink: function(keys, mouse, player, playerBullet, enemy) {
			requiredFields.call(this, ['blinkOn', 'blinkOff']);
			
			this.blinkAction = this.blinkAction || [];
			
			if (typeof this.blinkTimer === 'undefined') {
				this.blinkTimer = randBetween(0, this.blinkOn);
			}
			if (typeof this.oldColor === 'undefined') {
				this.oldColor = $.extend({}, this.color);
			}
			if (typeof this.blinking === 'undefined') {
				this.blinking = false;
			}

			if (this.blinkTimer <= 0){
				this.blinking = !this.blinking;
				this.color.a = this.blinking ? 0 : this.oldColor.a;
				this.blinkTimer = this.blinking ? this.blinkOff : this.blinkOn;
			}
			
			for (var i = 0; i < this.blinkAction.length; ++i) {
				this.blinkAction[i].call(this, keys, mouse, player, playerBullet, enemy);
			}
			
			this.blinkTimer--;
		},
		
		counterAttackOnBlink: function(keys, mouse, player, playerBullet, enemy) {
			if (typeof this.blinking === 'undefined') return;
			
			if (this.blinking) {
				requiredFields.call(this, ['bulletSpeed', 'createBullet', 'aimError']);

				var velocity = rtToVector(this.bulletSpeed, vectorAngle(vectorFromTo(this.body.GetPosition(), player.body.GetPosition())) + randBetween(-this.aimError, this.aimError));

				var bullet = this.createBullet(this, velocity);

				enemy.push(bullet);
			}
		},
		
		hpImmuneWhenBlink: function(keys, mouse, player, playerBullet, enemy) {
			requiredFields.call(this, ['hp']);
			
			if (typeof this.blinking === 'undefined') return;
			
			if (typeof this.currentHp === 'undefined') {
				this.currentHp = this.hp;
			}
			
			if (!this.blinking) {
				this.currentHp--;
			}
			
			return this.currentHp > 0;
		},
		
	};

})();