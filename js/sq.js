"use strict";

var world;

var FPS = 60;

(function() {

	var player;
	var playerBullet = [];
	var enemy = [];
	var oldEnemy = [];
	
	var lives = 5;
	var score = 0;
	var wave = 1;
	
	var pausing = false;

	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function( callback ){
				  window.setTimeout(callback, 1000 / FPS);
				};
	})();

	var keys = {};
	var mouse = {};
	function step(timestamp) {
		if (pausing) return;
		
		checkCompleted();
	
		world.Step(1/FPS, 3, 2);

		var canvas = document.getElementById('scene').getContext('2d');
		canvas.clearRect(0, 0, 600, 600);
		
		canvas.font = '200px "Century Gothic", CenturyGothic, AppleGothic, sans-serif';
		canvas.textAlign = 'center';
		canvas.textBaseline = 'middle';
		canvas.fillStyle = 'hsl(0, 0%, 40%)';
		canvas.fillText(wave, 300, 300);

		if (!player.isDestroyed()) {
			player.step(keys, mouse, player, playerBullet, enemy);
			player.draw();
		}

		for (i = 0; i < playerBullet.length; ++i) {
			if (playerBullet[i].isDestroyed()) {
				world.DestroyBody(playerBullet[i].body);
				playerBullet.splice(i--, 1);
			} else {
				playerBullet[i].step(keys, mouse, player, playerBullet, enemy);
				playerBullet[i].draw();
			}
		}
		
		for (i = 0; i < enemy.length; ++i) {
			if (enemy[i].isDestroyed()) {
				world.DestroyBody(enemy[i].body);
				enemy.splice(i--, 1);
			} else {
				enemy[i].step(keys, mouse, player, playerBullet, enemy);
				enemy[i].draw();
			}
		}
		
		canvas.font = '24px "Century Gothic", CenturyGothic, AppleGothic, sans-serif';
		canvas.textAlign = 'left';
		canvas.textBaseline = 'top';
		canvas.fillStyle = 'hsl(0, 0%, 100%)';
		canvas.fillText('Lives: ' + lives, 0, 0);
		
		canvas.textAlign = 'right';
		canvas.fillText('Score: ' + score, 600, 0);
	}

	function animate() {
		requestAnimFrame( animate );
		step();
	}
	
	function onPreSolve(contact, oldManifold) {
		var a = contact.GetFixtureA().GetBody().GetUserData();
		var b = contact.GetFixtureB().GetBody().GetUserData();
		
		if (a === null || b === null) return;

		contact.SetEnabled(false);
	}
	
	function onContact(contact) {
		var a = contact.GetFixtureA().GetBody().GetUserData();
		var b = contact.GetFixtureB().GetBody().GetUserData();
		
		if (a === null || b === null) return;
		
		if ((a.type === TYPE_ENEMY && b.type === TYPE_PLAYER) || (a.type === TYPE_PLAYER && b.type === TYPE_ENEMY)) {
			var p = a.type === TYPE_PLAYER ? a : b;

			if (!p.isInvincible() && !p.isDestroyed()) {
				lives--;
				if (lives <= 0) {
					setTimeout(gameover, 4000);
				} else {
					setTimeout(revive, 4000);
				}
				
				p.body.SetLinearVelocity(new b2Vec2(0, 0));
				p.destroy();
			}
		} else if ((a.type === TYPE_PLAYER_BULLET && b.type === TYPE_ENEMY) || (a.type === TYPE_ENEMY && b.type === TYPE_PLAYER_BULLET)) {
			score += a.scoreOnDestroy + b.scoreOnDestroy;
			
			var preventDestroy = false;
			for (var i = 0; i < a.onDestroyAction.length; ++i) {
				preventDestroy |= a.onDestroyAction[i].call(a, keys, mouse, player, playerBullet, enemy);
			}
			if (!preventDestroy) {
				a.destroy();
			}
			
			preventDestroy = false;
			for (var i = 0; i < b.onDestroyAction.length; ++i) {
				preventDestroy |= b.onDestroyAction[i].call(b, keys, mouse, player, playerBullet, enemy);
			}
			if (!preventDestroy) {
				b.destroy();
			}
		}

	}
	
	function checkCompleted() {
		if (enemy.length <= 0){
			wave++;
			enemy = waveGenerator(wave, player, oldEnemy);
			oldEnemy = enemy.slice();
		}
	}
	
	function gameover() {
		//alert('Game over');
	}
	
	function revive() {
		player.revive();
	}

	function initControl() {
		var $body = $(document);
		var $window = $(window);
		var $scene = $('#scene');

		$body.keydown(function (e) {
			keys[e.which] = true;
			if (e.which === 80) {
				pausing = !pausing;
			}
			return false;
		});

		$body.keyup(function (e) {
			delete keys[e.which];
			return false;
		});
		
		$body.mousedown(function(e){
			mouse[e.which] = true;
			mouse.position = {
				x: (e.pageX - $scene.offset().left - 300) / 100,
				y: -(e.pageY - $scene.offset().top - 300) / 100
			};
			return false;
		});
		
		$window.mouseup(function(e){
			delete mouse[e.which];
			return false;
		});
		
		$window.mousemove(function(e){
			mouse.position = {
				x: (e.pageX - $scene.offset().left - 300) / 100,
				y: -(e.pageY - $scene.offset().top - 300) / 100
			};
			return false;
		});
	}

	$(document).ready(function() {

		world = new b2World(new b2Vec2(0, 0));
		
		var listener = new b2ContactListener;
		listener.PreSolve = onPreSolve;
		listener.BeginContact = onContact;

		world.SetContactListener(listener);
		
		// set field boundary
		addEdgeShape(world, new b2Vec2(-3, -3), new b2Vec2(3, -3), {restitution: 1});
		addEdgeShape(world, new b2Vec2(-3, 3), new b2Vec2(3, 3), {restitution: 1});
		addEdgeShape(world, new b2Vec2(-3, 3), new b2Vec2(-3, -3), {restitution: 1});
		addEdgeShape(world, new b2Vec2(3, 3), new b2Vec2(3, -3), {restitution: 1});

		// player entity
		player = createPlayer();
		
		initControl();
		
		enemy = waveGenerator(wave, player);
		oldEnemy = enemy.slice();

		animate();
	});
})();
