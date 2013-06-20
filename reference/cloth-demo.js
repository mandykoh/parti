(function () {
	var canvas = $('.cloth-demo .cloth-demo-canvas').get(0),
		canvasCtx = canvas.getContext('2d'),
		model,
		animTimer,
		distanceConstraints = [];


	function makeGrid(width, height, segmentLength) {
		var i, j, c, p;

		for (i = 0; i < height; ++i) {
			for (j = 0; j < width; ++j) {
				p = model.newParticle(180 + j * segmentLength, 150 + i * segmentLength);

				if (j > 0) {
					c = new Parti.DistanceConstraint(p, model.particles[i * height + j - 1], segmentLength, segmentLength);
					distanceConstraints.push(c);
					model.addConstraint(c);
				}

				if (i > 0) {
					c = new Parti.DistanceConstraint(p, model.particles[(i - 1) * height + j], segmentLength, segmentLength);
					distanceConstraints.push(c);
					model.addConstraint(c);
				}

				if (i === height - 1 && (j === 0 || j === width - 1)) {
					model.addConstraint(new Parti.PositionConstraint(p, p.posX, p.posY));
				}
			}
		}
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


	$('.cloth-demo .button').click(function () {
		if (animTimer) {
			window.clearInterval(animTimer);
			animTimer = null;
			$(this).text('Start');
		}
		else {
			$(this).text('Pause');

			animTimer = window.setInterval(function () {

				// Apply a downward force to simulate gravity
				for (var i = 0; i < model.particles.length; ++i)
					model.particles[i].applyImpulse(0, -0.05);

				model.update(2);
				render();

			}, 30);
		}
	});

	$('.cloth-demo .cloth-demo-canvas').mousemove(function (e) {
		var mouseX = e.pageX - $(this).offset().left,
			mouseY = $(this).height() - (e.pageY - $(this).offset().top),
			i,
			p,
			dx,
			dy;

		if (!animTimer)
			return;

		// Repel any particles that are close to the mouse cursor
		for (i = 0; i < model.particles.length; ++i) {
			p = model.particles[i];
			dx = p.posX - mouseX;
			dy = p.posY - mouseY;

			if (dx * dx + dy * dy < 1024) {
				p.applyImpulse(dx / 128, dy / 128);
			}
		}
	});

	model = new Parti.Model();

	makeGrid(16, 16, 16);
	render();

})();
