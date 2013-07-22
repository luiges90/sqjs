"use strict";

function alignRotationToMovement(keys, mouse, player, playerBullet, enemy){
	this.body.SetAngle(vectorAngle(this.body.GetLinearVelocity()));	
}