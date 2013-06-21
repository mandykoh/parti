(function () {
	var canvas = $('.rigid-body-demo .rigid-body-demo-canvas').get(0),
		canvasCtx = canvas.getContext('2d'),
		model,
		animTimer,
		distanceConstraints,
		boxParticles;


	function makeBox(x, y, size) {
		var bl, tl, br, tr;

		bl = model.newParticle(x - size / 2, y - size / 2);
		tl = model.newParticle(x - size / 2, y + size / 2);
		br = model.newParticle(x + size / 2, y - size / 2);
		tr = model.newParticle(x + size / 2, y + size / 2);

		distanceConstraints.push(model.linkParticles(bl, tl).constraints[0]);
		distanceConstraints.push(model.linkParticles(bl, br).constraints[0]);
		distanceConstraints.push(model.linkParticles(bl, tr).constraints[0]);
		distanceConstraints.push(model.linkParticles(br, tr).constraints[0]);
		distanceConstraints.push(model.linkParticles(tl, br).constraints[0]);
		distanceConstraints.push(model.linkParticles(tl, tr).constraints[0]);

		return [ bl, tl, br, tr ];
	}


	function render() {
		var i, c;

		canvasCtx.lineWidth = 1;
		canvasCtx.strokeStyle = '#666';
		canvasCtx.clearRect(0, 0, 600, 400);

		for (i = 0; i < distanceConstraints.length; ++i) {
			c = distanceConstraints[i];

			canvasCtx.beginPath();
			canvasCtx.moveTo(c.p1.posX, 400 - c.p1.posY);
			canvasCtx.lineTo(c.p2.posX, 400 - c.p2.posY);
			canvasCtx.stroke();
		}
	}


	function reset() {
		var i,
			boxSize;

		distanceConstraints = [];

		model = new Parti.Model({ friction: 0.02 });

		boxSize = Math.random() * 128 + 64;
		boxParticles = makeBox(boxSize / 2 + 32, boxSize / 2 + 32, boxSize);

		// Throw the box with some spin
		boxParticles[0].applyImpulse(Math.min(boxSize, Math.random(100) + 80), Math.min(boxSize, Math.random() * 60 + 30));
		boxParticles[1].applyImpulse(Math.min(boxSize, Math.random(100) + 80), Math.min(boxSize, Math.random() * 60 + 30));

		// Keep particles inside the pane, and add a little drag if they touch the walls
		model.addConstraint({
			apply: function (particles) {
				for (var i = 0; i < particles.length; ++i) {
					if (particles[i].posX < 0) {
						particles[i].posX = 0;
						particles[i].applyDrag(0.03);
					}
					else if (particles[i].posX > canvas.width) {
						particles[i].posX = canvas.width;
						particles[i].applyDrag(0.03);
					}
					if (particles[i].posY < 0) {
						particles[i].posY = 0;
						particles[i].applyDrag(0.03);
					}
					else if (particles[i].posY > canvas.height) {
						particles[i].posY = canvas.height;
						particles[i].applyDrag(0.03);
					}
				}
			}
		});
	}


	$('.rigid-body-demo .button').click(function (e) {
		if (animTimer) {
			window.clearInterval(animTimer);
			animTimer = null;
			reset();
			render();
			$(this).text('Start');
		}
		else {
			$(this).text('Reset');

			animTimer = window.setInterval(function () {

				// Apply a downward force to simulate gravity
				for (var i = 0; i < model.particles.length; ++i)
					model.particles[i].applyImpulse(0, -1);

				model.update(8);
				render();

			}, 30);
		}
	});

	reset();
	render();

})();
