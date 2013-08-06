"use strict";

var world;

var FPS = 60;

var DEBUG_WAVE = 61;

(function() {

	var player;
	var playerBullet = [];
	var enemy = [];
	var oldEnemy = [];

	var lives = 5;
	var score = 0;
	var wave = 1;

	var pausing = false;
	var running = false;

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

		var canvas = document.getElementById('game-scene').getContext('2d');
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
			if (playerBullet[i].justHit) {
				for (var j = 0; j < playerBullet[i].postHitAction.length; ++j) {
					playerBullet[i].postHitAction[j].call(playerBullet[i], keys, mouse, player, playerBullet, enemy);
				}
				playerBullet[i].justHit = false;
			}

			if (playerBullet[i].isDestroyed()) {
				world.DestroyBody(playerBullet[i].body);
				playerBullet.splice(i--, 1);
			} else {
				playerBullet[i].step(keys, mouse, player, playerBullet, enemy);
				playerBullet[i].draw();
			}
		}

		for (i = 0; i < enemy.length; ++i) {
			if (enemy[i].justHit){
				for (var j = 0; j < enemy[i].postHitAction.length; ++j) {
					enemy[i].postHitAction[j].call(enemy[i], keys, mouse, player, playerBullet, enemy);
				}
				enemy[i].justHit = false;
			}

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
		if (running) {
			requestAnimFrame( animate );
			step();
		}
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
			a.justHit = true;
			b.justHit = true;

			var preventDestroy = false;
			for (var i = 0; i < a.onHitAction.length; ++i) {
				preventDestroy |= a.onHitAction[i].call(a, keys, mouse, player, playerBullet, enemy);
			}
			if (!preventDestroy) {
				a.destroy();
			}

			preventDestroy = false;
			for (var i = 0; i < b.onHitAction.length; ++i) {
				preventDestroy |= b.onHitAction[i].call(b, keys, mouse, player, playerBullet, enemy);
			}
			if (!preventDestroy) {
				b.destroy();
			}
		}

	}

	function checkCompleted() {
		var completed = true;
		$.each(enemy, function(){
			if (this.preventNextWave) {
				completed = false;
			}
		});

		if (completed){
			wave++;
			if (wave % 5 === 0){
				lives++;
			}
			enemy = generateWave(enemy, wave, player, oldEnemy);
			oldEnemy = enemy.slice();
		}
	}

	function gameover() {
		running = false;
		world = null;
		player = null;
		playerBullet = [];
		enemy = [];
		oldEnemy = [];
		
		var pos = HiScore.saveHiScore(wave, score);
		
		lives = 5;
		score = 0;
		wave = 1;
		
		HiScore.showHiScore(pos);
	}

	function revive() {
		player.revive();
	}

	function initControl() {
		var $body = $(document);
		var $window = $(window);
		var $scene = $('#game-scene');

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

	function gameStart() {
		$('.scene').hide();
		$('#game-scene').show();
			
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

		running = true;
		enemy = generateWave(enemy, wave, player, oldEnemy);
		oldEnemy = enemy.slice();

		animate();
	}

	$(document).ready(function() {
		if (DEBUG_WAVE) {
			lives = 99999;
			wave = DEBUG_WAVE;
			gameStart();
		}
	
		$('#start').click(function() {
			gameStart();
		});
		
		$('#hiscore').click(HiScore.showHiScore);
	});
	
	window.onbeforeunload = function() {
		if (running && !DEBUG_WAVE) {
			return 'Are you sure to quit? Your progress will be lost.';
		}
	};

})();
