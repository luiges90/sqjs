"use strict";

var TYPE_PLAYER = 0;
var TYPE_ENEMY = 1;
var TYPE_PLAYER_BULLET = 2;

var entityId = 0;

var SqEntity = {

	init: function(type, position, size, options){
		var options = options || {};

		var objectClass = type == TYPE_PLAYER ? 'player' : type == TYPE_PLAYER_BULLET ? 'player-bullet' : 'enemy';
		
		var shapeOptions = {
			type: b2Body.b2_dynamicBody,
			linearDamping: options.linearDamping || 0,
			fixedRotation: true,
			density: 1,
			restitution: 0,
			friction: 0, 
			filterCategory: 1 << type, // player: 001, enemy: 010, bullet: 100
			filterMask: type == TYPE_ENEMY ? 5 : 2, // 5 = 101, 2 = 010
			linearVelocity: options.linearVelocity || new b2Vec2(0, 0)
		};

		this.body = type === TYPE_ENEMY ? addBoxShape(world, position, size, size, shapeOptions): 
										addCircleShape(world, position, size, shapeOptions);
		
		this.body.SetUserData(this);
		
		// parameters
		this.type = type;
		this.id = entityId;
		this.force = 0.015;
		this.fireCooldown = options.fireCooldown || -1;
		this.lifetime = options.lifetime || -1;
		this.size = size;
		this.color = options.color || (type === TYPE_ENEMY ? {h: 0, s: 1, l: 0.5, a: 1} : {h: 0, s: 0, l: 0.75, a: 1});
		
		// private state variables
		this.fireCooldownTimer = 0;
		this.lifetimeTimer = this.lifetime;
		
		this.destroyed = false;
		
		this.invincible = false
		this.invincibleTimer = -1;
		
		entityId++;
	},
	
	draw: function() {
		var canvas = document.getElementById('scene').getContext('2d');
		var drawX, drawY, drawSize;
		
		if (this.type != TYPE_ENEMY){ 
			drawX = this.body.GetPosition().x * 100 + 300;
			drawY = -this.body.GetPosition().y * 100 + 300;
			drawSize = this.size * 100;
			
			var opacity = this.color.a;
			if (this.invincible && this.invincibleTimer % 30 < 15) {
				opacity = 0;
			}
		
			canvas.beginPath();
			canvas.fillStyle = "hsla(" + this.color.h + ", " + this.color.s * 100 + "%, " + this.color.l * 100 + "%, " + opacity + ")";
			canvas.arc(drawX, drawY, drawSize, 0, 2 * Math.PI, true);
			canvas.fill();
		} else {
			drawSize = this.size * 100;
		
			canvas.save();
			
			canvas.fillStyle = "hsla(" + this.color.h + ", " + this.color.s * 100 + "%, " + this.color.l * 100 + "%, " + this.color.a + ")";
			
			canvas.translate(this.body.GetPosition().x * 100 + 300, -this.body.GetPosition().y * 100 + 300);
			canvas.rotate(-this.body.GetAngle());
			canvas.fillRect(-drawSize, -drawSize, drawSize * 2, drawSize * 2);
			
			canvas.restore();
		}
	},
	
	destroy: function() {
		this.destroyed = true;
	},
	
	isDestroyed: function() {
		return this.destroyed;
	},
	
	revive: function() {
		this.destroyed = false;
		this.invincible = true;
		this.invincibleTimer = FPS * 3;
	},
	
	step: function() {
		this.fireCooldownTimer--;
		
		this.lifetimeTimer--;
		if (this.lifetimeTimer <= 0 && this.lifetime > 0) 
		{
			this.destroy();
		}
		
		this.invincibleTimer--;
		if (this.invincibleTimer <= 0) {
			this.invincible = false;
		}
		
		if (this.type == TYPE_ENEMY) {
			this.body.SetAngle(vectorAngle(this.body.GetLinearVelocity()));
		}
	},
	
	fire: function(position){
		if (this.fireCooldownTimer > 0) return;
		this.fireCooldownTimer = this.fireCooldown;

		var fireVector = new b2Vec2(position.x - this.body.GetPosition().x, position.y - this.body.GetPosition().y);
		fireVector.Normalize();
		fireVector.Multiply(0.06);

		var bullet = Object.create(SqEntity);
		bullet.init(TYPE_PLAYER_BULLET, new b2Vec2(this.body.GetPosition().x, this.body.GetPosition().y), 0.06, {
			lifetime: 60,
			linearVelocity: fireVector
		});

		return bullet;
	},

};
