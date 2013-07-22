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
		this.lifetime = options.lifetime || -1;
		this.size = size;
		this.color = options.color || (type === TYPE_ENEMY ? {h: 0, s: 1, l: 0.5, a: 1} : {h: 0, s: 0, l: 0.75, a: 1});

		this.lifetimeTimer = this.lifetime;
		
		this.destroyed = false;

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
	
	step: function() {
		this.lifetimeTimer--;
		if (this.lifetimeTimer <= 0 && this.lifetime > 0) 
		{
			this.destroy();
		}
	}
	
	destroy: function() {
		this.destroyed = true;
	},
	
	isDestroyed: function() {
		return this.destroyed;
	},

};
