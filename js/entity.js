"use strict";

var TYPE_PLAYER = 0;
var TYPE_ENEMY = 1;
var TYPE_PLAYER_BULLET = 2;

/** 
 * SqEntity Prototype.
 * use Object.create to create a new SqEntity, and then call init on the newly created object to initialize the entity.
 */
var SqEntity = (function(){

	var entityId = 0;

	return {
		/**
		 * Initializes an SqEntity
		 * @param type Type of enemy, either TYPE_PLAYER, TYPE_ENEMY or TYPE_PLAYER_BULLET
		 * @param position Set position of the entity
		 * @param size Set Size of the entity
		 * @param options Any options to create the entity. keys are defined as follows
		 *                lifetime       : Lifetime of the body. Infinite lifetime if set to -1, which is the default.
		 *                color          : Rendered color of the body, as an object containing h, s, l and a values. h ranges from 0 to 360 while other ranges 
		 *                                 from 0 to 1
		 *                linearDamping  : Box2D Linear Damping of the entity
		 *                linearVelocity : Initial velocity of the entity
		 *                scoreOnDestroy : player's score when it is destroyed
		 *                preventNextWave: If this entity is not destroyed, player is not allowed to go to next wave.           
		 */
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
			this.lifetime = options.lifetime || -1;
			this.size = size;
			this.color = options.color || (type === TYPE_ENEMY ? {h: 0, s: 1, l: 0.5, a: 1} : {h: 0, s: 0, l: 0.75, a: 1});
			this.scoreOnDestroy = typeof options.scoreOnDestroy === 'undefined' ? (this.lifetime <= 0 ? 1 : 0) : options.scoreOnDestroy;
			this.preventNextWave = typeof options.preventNextWave === 'undefined' ? (type === TYPE_ENEMY) : options.preventNextWave;

			this.stepAction = [];
			this.onDestroyAction = [];
			this.postDestroyAction = [];
			
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

})();

function createPlayer() {
	var player = Object.create(SqEntity);
	player.init(TYPE_PLAYER, new b2Vec2(0, 0), 0.12, {
		linearDamping: 1.5
	});
	
	player.invincibleTimer = 0;
	player.isInvincible = function(){return this.invincibleTimer > 0;};
	
	player.stepAction.push(function(keys, mouse, player, playerBullet, enemy) {
		this.invincibleTimer--;	
	});
	
	player.revive = function() {
		this.destroyed = false;
		this.invincibleTimer = FPS * 3;	
	};
	
	player.stepAction.push(PlayerBehaviours.moveByWASD);
	player.stepAction.push(PlayerBehaviours.fireByLeftMouse);
	
	player.fireCooldown = 3;
	player.movingForce = 0.015;
	
	player.draw = function() {
		var canvas = document.getElementById('scene').getContext('2d');
		var drawX, drawY, drawSize;
		
		drawX = this.body.GetPosition().x * 100 + 300;
		drawY = -this.body.GetPosition().y * 100 + 300;
		drawSize = this.size * 100;
		
		var opacity = this.color.a;
		if (this.isInvincible() && this.invincibleTimer % 30 < 15) {
			opacity = 0;
		}
	
		canvas.beginPath();
		canvas.fillStyle = "hsla(" + this.color.h + ", " + this.color.s * 100 + "%, " + this.color.l * 100 + "%, " + opacity + ")";
		canvas.arc(drawX, drawY, drawSize, 0, 2 * Math.PI, true);
		canvas.fill();
	};
	
	return player;
}

/**
 * Create an enemy
 * @param location where to place the enemy
 * @param size Size of enemy
 * @param options An additional option object for SqEntity.init
 * @param behaviours Behaviours (defined in behaviour.js) to be added and be run in every time step.
 * @param onDestroy Behaviours to be added and run when the enemy is hit. If the behaviour returns truthy value, the destruction of the enemy will be stopped.
 *                  Note: this is called inside Box2D collision BeginContact event, and hence you may *not* create new entites nor toy with Box2D world inside
 *                  this behaviour. Use postDestroy instead.
 * @param postDestroy Behaviours to be added and run after the enemy is destroyed and going to be removed from the world. You may create new entities here.
 *                    It is not possible to stop destruction here. Use onDestroy instead.
 */
function createEnemy(location, size, options, behaviours, onDestroy, postDestroy) {
	var e = Object.create(SqEntity);
	e.init(TYPE_ENEMY, location, size, options);

	$.each(behaviours || [], function(){
		e.stepAction.push(this);
	});
	
	$.each(onDestroy || [], function() {
		e.onDestroyAction.push(this);
	});
	
	$.each(postDestroy || [], function() {
		e.postDestroyAction.push(this);
	});

	e.draw = function(){
		var canvas = document.getElementById('scene').getContext('2d');
		var drawSize = this.size * 100;

		canvas.save();
		
		canvas.fillStyle = "hsla(" + this.color.h + ", " + this.color.s * 100 + "%, " + this.color.l * 100 + "%, " + this.color.a + ")";
		
		canvas.translate(this.body.GetPosition().x * 100 + 300, -this.body.GetPosition().y * 100 + 300);
		canvas.rotate(-this.body.GetAngle());
		canvas.fillRect(-drawSize, -drawSize, drawSize * 2, drawSize * 2);
		
		canvas.restore();
	};
	
	return e;
}
