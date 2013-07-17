"use strict";

var world;

(function() {

	var player;
	var playerBullet = [];
	var enemy = [];
	
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
				  window.setTimeout(callback, 1000 / 60);
				};
	})();

	var keys = {};
	var mouse = {};
	function step(timestamp) {
		if (pausing) return;
	
		world.Step(1/60, 3, 2);
		
		var canvas = document.getElementById('scene').getContext('2d');
		canvas.clearRect(0, 0, 600, 600);
		
		canvas.font = '200px "Century Gothic", CenturyGothic, AppleGothic, sans-serif';
		canvas.textAlign = 'center';
		canvas.textBaseline = 'middle';
		canvas.fillStyle = 'hsl(0, 0%, 40%)';
		canvas.fillText(wave, 300, 300);

		if (player.isDestroyed()) {
			world.DestroyBody(player.body);
		} else {
			player.move();
			player.step();
			player.draw();
		}

		for (i = 0; i < playerBullet.length; ++i) {
			if (playerBullet[i].isDestroyed()) {
				world.DestroyBody(playerBullet[i].body);
				playerBullet.splice(i--, 1);
			} else {
				playerBullet[i].draw();
				playerBullet[i].step();
			}
		}
		
		for (i = 0; i < enemy.length; ++i) {
			if (enemy[i].isDestroyed()) {
				world.DestroyBody(enemy[i].body);
				enemy.splice(i--, 1);
			} else {
				enemy[i].draw();
				enemy[i].step();
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
	
	function onContact(contact, oldManifold) {
		var a = contact.GetFixtureA().GetBody().GetUserData();
		var b = contact.GetFixtureB().GetBody().GetUserData();
		
		if (a === null || b === null) return;

		contact.SetEnabled(false);
		
		if ((a.type === 0 && b.type === 1) || (a.type == 1 && b.type == 0)) {
			lives--;
		} else if ((a.type === 2 && b.type === 1) || (a.type===1 && b.type === 2)) {
			score++;
		}
		
		a.destroy();
		b.destroy();
	}

	function newWave() {
		for (var i = 0; i < 1; ++i){
			var e = Object.create(SqEntity);
			e.init(TYPE_ENEMY, randomLocationAvoidRadius(-3, 3, -3, 3, player.body.GetPosition(), 1), 0.12, {
				linearVelocity: rtToVector(0.15, randomAngle())
			});
			
			enemy.push(e);
		}
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
		listener.BeginContact = onContact;

		world.SetContactListener(listener);
		
		// set field boundary
		addEdgeShape(world, new b2Vec2(-3, -3), new b2Vec2(3, -3), {restitution: 1});
		addEdgeShape(world, new b2Vec2(-3, 3), new b2Vec2(3, 3), {restitution: 1});
		addEdgeShape(world, new b2Vec2(-3, 3), new b2Vec2(-3, -3), {restitution: 1});
		addEdgeShape(world, new b2Vec2(3, 3), new b2Vec2(3, -3), {restitution: 1});

		// player entity
		player = Object.create(SqEntity);
		player.init(TYPE_PLAYER, new b2Vec2(0, 0), 0.12, {
			linearDamping: 1.5,
			fireCooldown: 3
		});
		
		player.move = function() {
			// move player
			var body = player.body;
			var force = player.force;
			for (var i in keys){
				switch (i) {
					case '87': //'w'
						body.ApplyImpulse(new b2Vec2(0, force), body.GetWorldCenter());
						break;
					case '65': //'a'
						body.ApplyImpulse(new b2Vec2(-force, 0), body.GetWorldCenter());
						break;
					case '83': //'s'
						body.ApplyImpulse(new b2Vec2(0, -force), body.GetWorldCenter());
						break;
					case '68': //'d'
						body.ApplyImpulse(new b2Vec2(force, 0), body.GetWorldCenter());
						break;
				}
			}
			
			// fire
			if (mouse[1]) {
				var bullet = player.fire(mouse.position);
				if (typeof bullet === 'object') {
					playerBullet.push(bullet);
				}
			}
		};
		
		initControl();
		
		newWave();

		animate();
	});
})();