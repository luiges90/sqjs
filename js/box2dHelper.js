"use strict";

var   b2Vec2 = Box2D.Common.Math.b2Vec2
         	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
         	,	b2Body = Box2D.Dynamics.b2Body
         	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
         	,	b2Fixture = Box2D.Dynamics.b2Fixture
         	,	b2World = Box2D.Dynamics.b2World
         	,	b2MassData = Box2D.Collision.Shapes.b2MassData
         	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
         	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
			,   b2ContactListener = Box2D.Dynamics.b2ContactListener
            ;

function randBetween(min, max) {
	return Math.random() * (max - min) + min;
}

function randIntBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addShape(world, positionVector, options, addShapeFunc){
	var options = options || {};

	var bd = new b2BodyDef();
	bd.position = positionVector;
	for (var i in options){
		if (typeof bd[i] !== 'undefined' && typeof options[i] !== 'undefined') {
			bd[i] = options[i];
		}
	}
	var body = world.CreateBody(bd);

	var shape = addShapeFunc();

	var fd = new b2FixtureDef();
	fd.shape = shape;
	for (var i in options){
		if (typeof fd[i] !== 'undefined' && typeof options[i] !== 'undefined') {
			fd[i] = options[i];
		}
	}
	fd.filter.categoryBits = options.filterCategory || 0xFFFF;
	fd.filter.maskBits = options.filterMask || 0xFFFF;
	fd.isSensor = options.sensor || false;

	body.CreateFixture(fd);
	body.ApplyImpulse(options.linearVelocity, body.GetWorldCenter());

	return body;
}

function addEdgeShape(world, v1, v2, options) {
	return addShape(world, new b2Vec2(0, 0), options, function(){
		var shape = new b2PolygonShape();
		shape.SetAsEdge(v1, v2);
		return shape;
	});
}

function addBoxShape(world, positionVector, width, height, options) {
	return addShape(world, positionVector, options, function(){
		var shape = new b2PolygonShape();
		shape.SetAsBox(width, height);
		return shape;
	});
}

function addCircleShape(world, positionVector, radius, options) {
	return addShape(world, positionVector, options, function(){
		var shape = new b2CircleShape();
		shape.m_radius = radius;
		return shape;
	});
}

function distanceSquared(d1, d2){
	var v1 = new b2Vec2(d1.x, d1.y);
	var v2 = new b2Vec2(d2.x, d2.y);
	v1.Subtract(v2);
	return v1.LengthSquared();
}

function randomLocation(x1, x2, y1, y2) {
	return new b2Vec2(randBetween(x1, x2), randBetween(y1, y2));
}

function randomLocationAvoidRadius(x1, x2, y1, y2, avoid, radius) {
	var result;
	do {
		result = randomLocation(x1, x2, y1, y2);

	} while (distanceSquared(result, avoid) <= radius * radius);
	return result;
}

function rtToVector(r, t){
	return new b2Vec2(r * Math.cos(t), r * Math.sin(t));
}

function vectorAngle(v){
	return Math.atan2(v.y, v.x);
}

function randomAngle(){
	return randBetween(-Math.PI, Math.PI);
}

function rad2deg(x) {
	return x / Math.PI * 180;
}

function deg2rad(x) {
	return x / 180 * Math.PI;
}

function vectorFromTo(from, to, magnitude) {
	var vector = new b2Vec2(to.x - from.x, to.y - from.y);
	if (magnitude) {
		vector.Normalize();
		vector.Multiply(0.06);
	}
	return vector;
}
