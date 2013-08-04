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
	
	var HISCORE_KEY = 'sq_hiscore';

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

	var stopAnimate = false;
	function animate() {
		if (!stopAnimate) {
			requestAnimFrame( animate );
			step();
		} else {
			stopAnimate = false;
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
		stopAnimate = true;
		world = null;
		player = null;
		playerBullet = [];
		enemy = [];
		oldEnemy = [];
		
		var pos = saveHiScore(wave, score);
		
		showHiScore(pos);
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

		enemy = generateWave(enemy, wave, player, oldEnemy);
		oldEnemy = enemy.slice();

		animate();
	}
	
	function getHiScoreDate() {
		var now = new Date();
		return now.getDate() + '-' + (now.getMonth()+1) + '-' + now.getFullYear() + ' ' + zeroPad(now.getHours(), 2) + ':' + zeroPad(now.getMinutes(), 2);
	}
	
	function getDefaultHiScore() {
		return [
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
				{time: getHiScoreDate(), wave: 0, score: 0},
			];
	}
	
	function loadHiScore() {
		var hiScore = localStorage.getItem(HISCORE_KEY);
		hiScore = JSON.parse(hiScore);
		
		return hiScore;
	}
	
	function saveHiScore(wave, score) {
		var hiScore = localStorage.getItem(HISCORE_KEY);
		hiScore = JSON.parse(hiScore);
		
		if (hiScore === null)
		{
			hiScore = getDefaultHiScore();
		}
		
		var pos;
		$(hiScore).each(function(i) {
			if (score >= this.score) {
				pos = i;
				hiScore.splice(i, 0, {time: getHiScoreDate(), wave: wave, score: score});
				hiScore.splice(10, 1);
				return false;
			}
		});
		
		localStorage.setItem(HISCORE_KEY, JSON.stringify(hiScore));
		
		return pos;
	}
	
	function showHiScore(highlight) {
		var hiScore = loadHiScore();
		
		if (hiScore === null){
			hiScore = getDefaultHiScore();
			saveHiScore(-1, -1);
		}
		
		var table = $('#hiscore-table');
		table.empty().append('<tr><th>Rank</th><th>Date</th><th>Wave</th><th>Score</th></tr>');
		$.each(hiScore, function(i) {
			table.append('<tr class="' + (i === highlight ? 'this-hiscore' : '') + '"><td>' + (i+1) + '</td><td>' + this.time + '</td><td>' + this.wave + '</td><td>' + this.score + '</td></tr>');
		});
		
		$('.scene').hide();
		$('#hiscore-scene').show();
		$('#back').one('click', function() {
			$('#hiscore-scene').hide();
			$('#start-scene').show();
		});
	}

	$(document).ready(function() {
		$('#start').click(function() {
			$('#start-scene').hide();
			$('#game-scene').show();
			gameStart();
		});
		
		$('#hiscore').click(showHiScore);
	});

})();
