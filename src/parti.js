// Parti
//
// Particle-based physics simulator library for JavaScript.
//
// This project can be found at:
// https://github.com/naucera/parti
//
// Copyright (C) 2013 Amanda Koh
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

if (typeof(Parti) === 'undefined') {
	Parti = {};

	(function () {

		Parti.Model = function (options) {
			this.particles = [];
			this.constraints = [];
			this.particlesToRemove = [];

			if (typeof(options) !== 'object')
				options = {};

			this.defaultRadius = typeof(options.radius) === 'number' ? options.radius : 0;
			this.defaultFriction = typeof(options.friction) === 'number' ? options.friction : 0;
		};

		Parti.Model.prototype.addConstraint = function (c) {
			this.constraints.push(c);
		};

		Parti.Model.prototype.linkParticles = function (p1, p2, segments, minStretch, maxStretch) {
			var i,
				p,
				lastP = p2,
				segmentLength,
				chainParticles = [];

			segmentLength = Math.sqrt((p1.posX - p2.posX) * (p1.posX - p2.posX) + (p1.posY - p2.posY) * (p1.posY - p2.posY)) / segments;

			for (i = 0; i < segments - 1; ++i) {
				p = this.newParticle(
					(p1.posX - p2.posX) * (i / segments) + p2.posX,
					(p1.posY - p2.posY) * (i / segments) + p2.posY);

				chainParticles.push(p);
				this.addConstraint(new Parti.DistanceConstraint(p, lastP, segmentLength * minStretch, segmentLength * maxStretch));
				lastP = p;
			}

			this.addConstraint(new Parti.DistanceConstraint(lastP, p1, segmentLength * minStretch, segmentLength * maxStretch));

			return chainParticles;
		};

		Parti.Model.prototype.newParticle = function (x, y, options) {
			var p = new Particle(x, y, this, typeof(options) === 'object' ? options : {});
			this.particles.push(p);
			return p;
		};

		Parti.Model.prototype.removeParticle = function (index) {
			this.particlesToRemove.push(index);
		};

		Parti.Model.prototype.update = function (passes) {
			var i,
				j,
				k,
				p,
				newPosX,
				newPosY;

			// Mark removed particles for deletion
			for (i = 0; i < this.particlesToRemove.length; ++i)
				this.particles[this.particlesToRemove[i]] = null;
			this.particlesToRemove = [];

			// Delete marked particles
			for (i = 0; i < this.particles.length;) {
				if (this.particles[i] === null)
					this.particles.splice(i, 1);
				else
					++i;
			}

			// Relax particles by Verlet integration
			for (i = 0; i < this.particles.length; ++i) {
				p = this.particles[i];
				newPosX = p.posX * (2 - p.friction) - p.prevPosX * (1 - p.friction);
				newPosY = p.posY * (2 - p.friction) - p.prevPosY * (1 - p.friction);
				p.prevPosX = p.posX;
				p.prevPosY = p.posY;
				p.posX = newPosX;
				p.posY = newPosY;
			}

			if (!passes)
				passes = 1;

			for (k = 0; k < passes; ++k) {

				// Apply radius constraint
				for (i = 0; i < this.particles.length; ++i) {
					for (j = i + 1; j < this.particles.length; ++j) {
						Parti.enforceDistance(this.particles[i], this.particles[j], this.particles[i].radius + this.particles[j].radius, null);
					}
				}

				// Apply custom constraints
				for (i = 0; i < this.constraints.length; ++i)
					this.constraints[i].apply(this.particles);
			}
		};



		Parti.DistanceConstraint = function (p1, p2, min, max) {
			this.p1 = p1;
			this.p2 = p2;
			this.minDist = typeof(min) === 'number' ? min : null;
			this.maxDist = typeof(max) === 'number' ? max : null;
		};

		Parti.DistanceConstraint.prototype.apply = function (particles) {
			Parti.enforceDistance(this.p1, this.p2, this.minDist, this.maxDist);
		};



		Parti.PositionConstraint = function (p, x, y) {
			this.particle = p;
			this.x = x;
			this.y = y;
		};

		Parti.PositionConstraint.prototype.apply = function (particles) {
			this.particle.posX = this.x;
			this.particle.posY = this.y;
			this.particle.prevPosX = this.x;
			this.particle.prevPosY = this.y;
		};



		function Particle(x, y, model, options) {
			this.posX = x;
			this.posY = y;
			this.radius = typeof(options.radius) === 'number' ? options.radius : model.defaultRadius;
			this.friction = typeof(options.friction) === 'number' ? options.friction : model.defaultFriction;
			this.prevPosX = this.posX;
			this.prevPosY = this.posY;

			if (typeof(options.data) !== 'undefined')
				this.setData(options.data);
		};

		Particle.prototype.applyImpulse = function (x, y) {
			this.prevPosX -= x;
			this.prevPosY -= y;
		};

		Particle.prototype.getData = function () {
			return this.data;
		};

		Particle.prototype.setData = function (v) {
			this.data = v;
		};

		Particle.prototype.setPos = function (x, y) {
			this.posX = x;
			this.posY = y;
			this.prevPosX = x;
			this.prevPosY = y;
		};



		Parti.enforceDistance = function (p1, p2, min, max) {
			var deltaX = p2.posX - p1.posX,
				deltaY = p2.posY - p1.posY,
				sqrDist = deltaX * deltaX + deltaY * deltaY,
				dist,
				diff;

			// Move particles apart to meet the minimum distance
			if (min !== null && sqrDist < min * min) {
				dist = Math.sqrt(sqrDist);
				diff = (dist - min) / dist;
				deltaX *= 0.25 * diff;
				deltaY *= 0.25 * diff;
				p1.posX += deltaX;
				p1.posY += deltaY;
				p2.posX -= deltaX;
				p2.posY -= deltaY;
			}

			// Move particles closer to meet the maximum distance
			else if (max !== null && sqrDist > max * max) {
				dist = Math.sqrt(sqrDist);
				diff = (dist - max) / dist;
				deltaX *= 0.25 * diff;
				deltaY *= 0.25 * diff;
				p1.posX += deltaX;
				p1.posY += deltaY;
				p2.posX -= deltaX;
				p2.posY -= deltaY;
			}
		};

	})();

}
