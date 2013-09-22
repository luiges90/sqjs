"use strict";

var world;

var FPS = 60;

var DEBUG_WAVE = 1000;

(function() {

	var player;
	var playerBullet = [];
	var enemy = [];
	var oldEnemy = [];
	var powerup = [];
	var particles = [];
	var particleEmitters = [];

	var lives = 5;
	var score = 0;
	var wave = 1;
	
	var killedInWave;
	var powerupGenerated;
	var powerupTaken;
	
	var KILLED_IN_WAVE_COUNT_KEY = 'sq_killed_in_wave_count';
	var POWERUP_GENERATED_KEY = 'sq_powerup_generated';
	var POWERUP_TAKEN_KEY = 'sq_powerup_taken';
	var WAVE_REACHED_KEY = 'sq_wave_reached';

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
	var playerParticlesCreated = false;
	function step(timestamp) {
		if (pausing) return;
		if (!running) return;

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
			playerParticlesCreated = false;
		} else {
			if (!playerParticlesCreated) {
				createExplosionParticles(player, true);
				playerParticlesCreated = true;
			}
		}

		for (var i = 0; i < playerBullet.length; ++i) {
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

		for (var i = 0; i < enemy.length; ++i) {
			if (enemy[i].justHit){
				for (var j = 0; j < enemy[i].postHitAction.length; ++j) {
					enemy[i].postHitAction[j].call(enemy[i], keys, mouse, player, playerBullet, enemy);
				}
				enemy[i].justHit = false;
			}

			if (enemy[i].isDestroyed()) {
				if (enemy[i].generateParticles) {
					createExplosionParticles(enemy[i]);
				}
				world.DestroyBody(enemy[i].body);
				enemy.splice(i--, 1);
			} else {
				enemy[i].step(keys, mouse, player, playerBullet, enemy);
				enemy[i].draw();
			}
		}

		for (var i = 0; i < powerup.length; ++i) {
			if (powerup[i].isDestroyed()) {
				world.DestroyBody(powerup[i].body);
				powerup.splice(i--, 1);
			} else {
				powerup[i].step(keys, mouse, player, playerBullet, enemy);
				powerup[i].draw();
			}
		}
		
		for (var i = 0; i < particles.length; ++i) {
			particles[i].lifetime--;
			if (particles[i].lifetime <= 0){
				world.DestroyBody(particles[i]);
				particles.splice(i--, 1);
			} else {
				var angle = particles[i].GetAngle();
				var pCentre = particles[i].GetPosition();
				var p1 = new b2Vec2(pCentre.x, pCentre.y);
				p1.Add(rtToVector(particles[i].length / 2, angle));
				var p2 = new b2Vec2(pCentre.x, pCentre.y);
				p2.Add(rtToVector(particles[i].length / 2, angle + Math.PI));

				canvas.beginPath();
				canvas.strokeStyle = "hsla(" + particles[i].color.h + ", " + particles[i].color.s * 100 + "%, " + particles[i].color.l * 100 + "%, 1.0)";
				canvas.moveTo(p1.x * 100 + 300, -p1.y * 100 + 300);
				canvas.lineTo(p2.x * 100 + 300, -p2.y * 100 + 300);
				canvas.lineWidth = 2;
				canvas.stroke();
				canvas.lineWidth = 1;
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
			emitParticles();
		}
	}
	
	function emitParticles() {
		for (var i = 0; i < particleEmitters.length; ++i) {
			particleEmitters[i].lifetime--;
			if (particleEmitters[i].lifetime <= 0) {
				particleEmitters.splice(i--, 1);
			} else {
				var count = randBetween(4, 6);
				for (var j = 0; j < count; ++j) {
					var dir = randomAngle();
					var length = randBetween(0.05, 0.2);
					
					var start = particleEmitters[i].position;
					start.Add(new b2Vec2(randBetween(-0.02, 0.02), randBetween(-0.02, 0.02)));
					
					var end = new b2Vec2(start.x, start.y);
					end.Add(rtToVector(length, dir));
					
					var body = addEdgeShape(world, start, end,
								{
									type: b2Body.b2_kinematicBody,
									linearDamping: 0,
									filterCategory: 0,
									filterMask: 0,
									linearVelocity: rtToVector(5, dir),
									angle: dir,
									fixedRotation: true,
								});
					body.length = length;
					body.color = particleEmitters[i].isPlayer ? {h: randBetween(0, 360), s: 1, l: 0.5, a: 1} : particleEmitters[i].color;
					body.lifetime = randBetween(20, 30);
					particles.push(body);
				}
			}
		}
	}
	
	function createExplosionParticles(entity, isPlayer) {
		particleEmitters.push({
			position: entity.body.GetPosition(), 
			color: entity.color,
			isPlayer: isPlayer, 
			lifetime: isPlayer ? 90 : 5
		});
	}
	
	function initStats() {
		killedInWave = 0;
		powerupGenerated = [0, 0];
		powerupTaken = [0, 0];
	}
	
	function storeStats() {
		if (!DEBUG_WAVE){
			var oldKilledInWave = JSON.parse(localStorage.getItem(KILLED_IN_WAVE_COUNT_KEY)) || [];
			if (oldKilledInWave[wave]) {
				oldKilledInWave[wave] += killedInWave;
			} else {
				oldKilledInWave[wave] = killedInWave;
			}
			localStorage.setItem(KILLED_IN_WAVE_COUNT_KEY, JSON.stringify(oldKilledInWave));

			var oldPowerupGenerated = JSON.parse(localStorage.getItem(POWERUP_GENERATED_KEY)) || [0, 0];
			for (var i = 0; i < 2; ++i){
				oldPowerupGenerated[i] += powerupGenerated[i];
			};
			localStorage.setItem(POWERUP_GENERATED_KEY, JSON.stringify(oldPowerupGenerated));
			
			var oldPowerupTaken = JSON.parse(localStorage.getItem(POWERUP_TAKEN_KEY)) || [0, 0];
			for (var i = 0; i < 2; ++i){
				oldPowerupTaken[i] += powerupTaken[i];
			};
			localStorage.setItem(POWERUP_TAKEN_KEY, JSON.stringify(oldPowerupTaken));
			
			var oldWaveReached = JSON.parse(localStorage.getItem(WAVE_REACHED_KEY)) || [];
			if (oldWaveReached[wave]) {
				oldWaveReached[wave]++;
			} else {
				oldWaveReached[wave] = 1;
			}
			localStorage.setItem(WAVE_REACHED_KEY, JSON.stringify(oldWaveReached));
			
			if (typeof enemyStoreStat === 'function') {
				enemyStoreStat(enemy, wave, player, oldEnemy);
			}
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
				
				killedInWave++;
				
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
				powerupTaken[pu.puType]++;
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
			storeStats();
		
			initStats();
			wave++;
			if (wave % 5 === 0){
				lives++;
			}

			enemy = generateWave(enemy, wave, player, oldEnemy);
			oldEnemy = enemy.slice();
		}
	}
	
	var nextLifePowerup = 0;
	function generatePowerup() {
		if (DEBUG_WAVE) return;
		if (Math.random() < 1 / 20 / FPS) {
			var color, powerupFunc;
			
			var type = randIntBetween(0, 1);
			if (type === 0 && score < nextLifePowerup) {
				type = 1;
			} 
			
			powerupGenerated[type]++;
			switch (type) {
				case 0: 
					color = {h: 0, s: 1, l: 1, a: 1}; 
					powerupFunc = function(keys, mouse, player, playerBullet, enemy) {
						return 'lives+1';
					};
					nextLifePowerup += 200;
					break;
				case 1: 
					color = {h: 180, s: 1, l: 0.5, a: 1}; 
					powerupFunc = function(keys, mouse, player, playerBullet, enemy) {
						player.invincibleTimer = FPS * 6;
						return true;
					};
					break;
			}
			powerup.push(createPowerup(randomLocation(-3, 3, -3, 3), randIntBetween(FPS * 5, FPS * 8), color, type, powerupFunc));
		}
	}

	function gameover() {
		storeStats();
	
		running = false;
		nextLifePowerup = 0;
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
		initStats();

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
