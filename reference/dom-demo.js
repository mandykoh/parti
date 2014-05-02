(function () {
	var model = new Parti.Model(),
		message = $('.dom-demo .message'),
		button = $('.dom-demo .button'),
		messageParticle = model.newParticle(300, 300, { data: message }),
		buttonParticle = model.newParticle(300, 295, { data: button }),
		chainParticles,
		animFrame,
		i;


	// This function "renders" the simulation by updating the positions of the
	// DOM elements to match the positions of the particles.

	function render() {
		var i,
			element;

		// Position the message and button elements using their respective particles
		message.css({
			left: (messageParticle.posX - message.width() / 2) + 'px',
			bottom: (messageParticle.posY - message.height() / 2) + 'px'
		});
		button.css({
			left: (buttonParticle.posX - button.width() / 2) + 'px',
			bottom: (buttonParticle.posY - button.height() / 2) + 'px'
		});

		// Position the chain link elements using their particles
		for (i = 0; i < chainParticles.length; ++i) {
			element = chainParticles[i].getData();
			element.css({
				left: (chainParticles[i].posX - element.width() / 2) + 'px',
				bottom: (chainParticles[i].posY - element.height() / 2) + 'px'
			});
		}
	}


	// Make a chain of particles linking the message and the button, with 7
	// segments, where each link can stretch to 40 times the original length.
	chainParticles = model.linkParticles(messageParticle, buttonParticle, 7, 0, 40.0).particles;

	// Create DOM elements to represent each link in the chain and attach them
	// to the particles so we can retrieve them later.
	for (i = 0; i < chainParticles.length; ++i) {
		chainParticles[i].setData($('<div class="box chain"></div>'));
		$('.dom-demo').prepend(chainParticles[i].getData());
	}

	// Add a constraint to pin the message particle to one position
	model.addConstraint(new Parti.PositionConstraint(messageParticle, messageParticle.posX, messageParticle.posY));


	// Set up a function to update the simulation
	function updateAndRender() {

		// Apply a downward force to simulate gravity
		for (var i = 0; i < model.particles.length; ++i)
			model.particles[i].applyImpulse(0, -1);

		// Update the model (using 2 passes to lend stiffness to the chain links)
		if (model.update(2)) {
			window.cancelAnimationFrame(animFrame);
			animFrame = null;
			render();
			return;
		}

		// Update the DOM element positions based on the particles
		render();

		animFrame = window.requestAnimationFrame(updateAndRender);
	}


	// And when the button is clicked...
	buttonParticle.getData().click(function () {

		// Reset if already started
		if (animFrame) {
			buttonParticle.setPos(300, 295);

			for (i = 0; i < chainParticles.length; ++i)
				chainParticles[i].setPos(300, 295 + (i / chainParticles.length) * 5);

			window.cancelAnimationFrame(animFrame);
			animFrame = null;

			$(this).text('Click me');

			render();
			return;
		}

		// Apply a slight force to cause the button particle to jump out of position
		buttonParticle.applyImpulse(20, 10);

		$(this).text('Reset');

		// Start animation to keep updating the simulation
		animFrame = window.requestAnimationFrame(updateAndRender);
	});

	render();
})();
