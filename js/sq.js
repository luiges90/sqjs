"use strict";

var world;

var FPS = 60;

var DEBUG_WAVE = false;

(function() {

	var player;
	var playerBullet = [];
	var enemy = [];
	var oldEnemy = [];
	var powerup = [];

	var lives = 5;
	var score = 0;
	var wave = 1;
	
	var deadWaveCount = [];
	var DEAD_WAVE_COUNT_KEY = 'sq_dead_wave_count';

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
		generatePowerup();

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

		for (i = 0; i < powerup.length; ++i) {
			if (powerup[i].isDestroyed()) {
				world.DestroyBody(powerup[i].body);
				powerup.splice(i--, 1);
			} else {
				powerup[i].step(keys, mouse, player, playerBullet, enemy);
				powerup[i].draw();
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
			var e = a.type === TYPE_PLAYER ? b : a;

			if (!p.isInvincible() && !p.isDestroyed()) {
				lives--;
				if (lives <= 0) {
					setTimeout(gameover, 4000);
				} else {
					setTimeout(revive, 4000);
				}

				p.body.SetLinearVelocity(new b2Vec2(0, 0));
				p.destroy(true);
				deadWaveCount[wave]++;
				localStorage.setItem(DEAD_WAVE_COUNT_KEY, JSON.stringify(deadWaveCount));
				
				if (e.parent) {
					e.parent.kills++;
				} else {
					e.kills++;
				}
			}
		} else if ((a.type === TYPE_PLAYER_BULLET && b.type === TYPE_ENEMY) || (a.type === TYPE_ENEMY && b.type === TYPE_PLAYER_BULLET)) {
			score += a.scoreOnDestroy + b.scoreOnDestroy;
			a.justHit = true;
			b.justHit = true;
			
			if (a.lifetime < 0 || b.lifetime < 0){
				player.kills++;
			}

			var preventDestroy = false;
			for (var i = 0; i < a.onHitAction.length; ++i) {
				preventDestroy |= a.onHitAction[i].call(a, keys, mouse, player, playerBullet, enemy);
			}
			if (!preventDestroy) {
				a.destroy(true);
			}

			preventDestroy = false;
			for (var i = 0; i < b.onHitAction.length; ++i) {
				preventDestroy |= b.onHitAction[i].call(b, keys, mouse, player, playerBullet, enemy);
			}
			if (!preventDestroy) {
				b.destroy(true);
			}

		} else if ((a.type === TYPE_PLAYER && b.type === TYPE_POWERUP) || (a.type === TYPE_POWERUP && b.type === TYPE_PLAYER)) {
			var p = a.type === TYPE_PLAYER ? a : b;
			var pu = a.type === TYPE_POWERUP ? a : b;

			if (!p.destroyed) {
				var result = pu.powerup(keys, mouse, player, playerBullet, enemy);
				
				if (typeof result === 'string') {
					var matched = result.match(/(lives|score|wave)\+(\d+)/);
					if (matched) {
						switch (matched[1]) {
							case 'lives': lives += parseInt(matched[2]); break;
							case 'score': score += parseInt(matched[2]); break;
							case 'wave': wave += parseInt(matched[2]); break;
						}
					}
				}
				
				pu.destroy(true);
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
			
			if (!deadWaveCount[wave]) deadWaveCount[wave] = 0;
		}
	}
	
	var nextLifePowerup = 0;
	function generatePowerup() {
		if (Math.random() < 1 / 20 / FPS) {
			var color, powerupFunc;
			
			var type = randIntBetween(0, 1);
			if (type === 0 && score < nextLifePowerup) {
				type = 1;
			} 
			
			switch (type) {
				case 0: 
					color = {h: 0, s: 1, l: 1, a: 1}; 
					powerupFunc = function(keys, mouse, player, playerBullet, enemy) {
						return 'lives+1';
					};
					nextLifePowerup += 100;
					break;
				case 1: 
					color = {h: 180, s: 1, l: 0.5, a: 1}; 
					powerupFunc = function(keys, mouse, player, playerBullet, enemy) {
						player.invincibleTimer = FPS * 6;
						return true;
					};
					break;
			}
			powerup.push(createPowerup(randomLocation(-3, 3, -3, 3), randIntBetween(FPS * 5, FPS * 8), color, powerupFunc));
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
		
		deadWaveCount = JSON.parse(localStorage.getItem(DEAD_WAVE_COUNT_KEY)) || [0, 0];
	});
	
	window.onbeforeunload = function() {
		if (running && !DEBUG_WAVE) {
			return 'Are you sure to quit? Your progress will be lost.';
		}
	};

})();
