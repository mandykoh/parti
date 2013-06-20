(function () {
	var model = new Parti.Model(),
		message = $('.dom-demo .message'),
		button = $('.dom-demo .button'),
		messageParticle = model.newParticle(300, 300, { data: message }),
		buttonParticle = model.newParticle(300, 295, { data: button }),
		chainParticles,
		animTimer,
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
	chainParticles = model.linkParticles(messageParticle, buttonParticle, 7, 0, 40.0);

	// Create DOM elements to represent each link in the chain and attach them
	// to the particles so we can retrieve them later.
	for (i = 0; i < chainParticles.length; ++i) {
		chainParticles[i].setData($('<div class="box chain"></div>'));
		$('.dom-demo').prepend(chainParticles[i].getData());
	}

	// Add a constraint to pin the message particle to one position
	model.addConstraint(new Parti.PositionConstraint(messageParticle, messageParticle.posX, messageParticle.posY));


	// And when the button is clicked...
	buttonParticle.getData().click(function () {
		if (animTimer)
			return;

		// Apply a slight force to cause the button particle to jump out of position
		buttonParticle.applyImpulse(30, 10);

		$(this).text('Clicked!');

		// Start a timer to keep updating the simulation
		animTimer = window.setInterval(function () {

			// Apply a downward force to simulate gravity
			for (var i = 0; i < model.particles.length; ++i)
				model.particles[i].applyImpulse(0, -2);

			// Update the model (using 4 passes to lend stiffness to the chain links)
			if (model.update(4)) {
				console.log('end!');
				window.clearInterval(animTimer);
			}

			// Update the DOM element positions based on the particles
			render();

		}, 30);
	});

	render();
})();
