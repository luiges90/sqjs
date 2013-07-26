"use strict";

var TYPE_PLAYER = 0;
var TYPE_ENEMY = 1;
var TYPE_PLAYER_BULLET = 2;

var entityId = 0;

var SqEntity = {

	init: function(type, position, size, options){
		options = options || {};
		
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
		this.scoreOnDestroy = options.scoreOnDestroy || (type === TYPE_ENEMY ? 1 : 0);

		this.stepAction = [];
		
		this.lifetimeTimer = this.lifetime;
		
		this.destroyed = false;

		entityId++;

	},
	
	step: function(keys, mouse, player, playerBullet, enemy) {
		for (var i = 0; i < this.stepAction.length; ++i) {
			this.stepAction[i].call(this, keys, mouse, player, playerBullet, enemy);
		}
	
		this.lifetimeTimer--;
		if (this.lifetimeTimer <= 0 && this.lifetime > 0) 
		{
			this.destroy();
		}
	},
	
	destroy: function() {
		this.destroyed = true;
	},
	
	isDestroyed: function() {
		return this.destroyed;
	},

};
