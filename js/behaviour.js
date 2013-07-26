"use strict";

function requiredFields(fields) {
	var that = this;
	$.each(fields, function(){
		if (typeof that[this] === 'undefined') {
			throw this + ' is required.';
		}
	});
}

function alignRotationToMovement(keys, mouse, player, playerBullet, enemy){
	this.body.SetAngle(vectorAngle(this.body.GetLinearVelocity()));
}

function chasePlayer(keys, mouse, player, playerBullet, enemy) {
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
}

function randomFire(keys, mouse, player, playerBullet, enemy) {
	requiredFields.call(this, ['fireCooldown', 'bulletOptions', 'bulletSize', 'bulletBehaviours', 'bulletSpeed', 'bulletLifetime']);
	
	if (typeof this.fireCooldownTimer === 'undefined') {
		this.fireCooldownTimer = randBetween(0, this.fireCooldown);
	}
	
	var options = $.extend({}, this.bulletOptions);
	
	options.color = options.color || this.color;
	options.scoreOnDestroy = options.scoreOnDestroy || 0;
	options.lifetime = this.bulletLifetime;
	
	if (this.fireCooldownTimer <= 0) {
		this.fireCooldownTimer = this.fireCooldown;

		var position = this.body.GetPosition();

		options.linearVelocity = rtToVector(this.bulletSpeed, randomAngle());

		var bullet = createEnemy(this.body.GetPosition(), this.bulletSize, options, this.bulletBehaviours);

		enemy.push(bullet);
	}

	this.fireCooldownTimer--;
}

function aimedFire(keys, mouse, player, playerBullet, enemy) {
	requiredFields.call(this, ['fireCooldown', 'bulletOptions', 'bulletSize', 'bulletBehaviours', 'bulletSpeed', 'bulletLifetime']);
	
	if (typeof this.fireCooldownTimer === 'undefined') {
		this.fireCooldownTimer = randBetween(0, this.fireCooldown);
	}
	
	var options = $.extend({}, this.bulletOptions);
	
	options.color = options.color || this.color;
	options.scoreOnDestroy = options.scoreOnDestroy || 0;
	options.lifetime = this.bulletLifetime;
	
	if (this.fireCooldownTimer <= 0) {
		this.fireCooldownTimer = this.fireCooldown;

		var position = this.body.GetPosition();

		options.linearVelocity = rtToVector(this.bulletSpeed, vectorAngle(vectorFromTo(this.body.GetPosition(), player.body.GetPosition())));

		var bullet = createEnemy(this.body.GetPosition(), this.bulletSize, options, this.bulletBehaviours);

		enemy.push(bullet);
	}

	this.fireCooldownTimer--;
}

function hp(keys, mouse, player, playerBullet, enemy) {
	requiredFields.call(this, ['hp']);
	
	this.hp--;
	
	return this.hp > 0;
}