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

