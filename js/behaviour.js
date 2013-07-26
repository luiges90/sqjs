"use strict";

function alignRotationToMovement(keys, mouse, player, playerBullet, enemy){
	this.body.SetAngle(vectorAngle(this.body.GetLinearVelocity()));
}

function chasePlayer(keys, mouse, player, playerBullet, enemy) {
	if (typeof this.chaseFactor === 'undefined') {
		throw 'chaseFactor must be defined for chasePlayer behaviour.';
	}

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
}

function randomFire(keys, mouse, player, playerBullet, enemy) {
	if (typeof this.fireCooldown === 'undefined' || typeof this.bulletOptions === 'undefined' || typeof this.bulletSize === 'undefined'
		|| typeof this.bulletBehaviours === 'undefined') {
		throw 'fireCooldown and bulletOptions must be defined for randomFire behaviour.';
	}
	
	if (typeof this.fireCooldownTimer === 'undefined') {
		this.fireCooldownTimer = 0;
	}
	
	var options = $.extend({}, this.bulletOptions);
	
	options.color = options.color || this.color;
	options.scoreOnDestroy = 0;
	
	if (this.fireCooldownTimer <= 0) {
		this.fireCooldownTimer = this.fireCooldown;

		var position = this.body.GetPosition();

		options.linearVelocity = rtToVector(options.speed, randomAngle());

		var bullet = createEnemy(this.body.GetPosition(), this.bulletSize, options, this.bulletBehaviours);

		enemy.push(bullet);
	}

	this.fireCooldownTimer--;
}
