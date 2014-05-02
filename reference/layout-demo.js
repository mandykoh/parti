(function () {
	var model,
		i,
		p,
		mainNode,
		animFrame,
		stage = 'uncollide';


	// This function "renders" the simulation by updating the positions of the
	// DOM elements to match the positions of the particles.

	function render() {
		var i, p, div;

		for (i = 0; i < model.particles.length; ++i) {
			p = model.particles[i];
			div = p.getData().div;

			div.css({
				left: (p.posX - div.width() / 2) + 'px',
				bottom: (p.posY - div.height() / 2) + 'px'
			});
		}
	}


	function makeChildNodes(parentParticle, count, scale) {
		var i, p;

		if (scale < 16)
			return;

		for (i = 0; i < count; ++i) {
			p = makeNode(scale / 2);
			p.getData().parent = parentParticle;
		}
	}


	function makeNode(scale, x, y) {
		var p = model.newParticle(
			typeof(x) === 'number' ? x : Math.random() * 600,
			typeof(y) === 'number' ? y : Math.random() * 400,
			{ radius: scale, data: { parent: null, div: $('<div class="node"></div>') } });

		$('.layout-demo').prepend(p.getData().div);

		p.getData().div.css({
			width: Math.floor(scale * 2) + 'px',
			height: Math.floor(scale * 2) + 'px',
			'border-radius': Math.floor(scale) + 'px'
		});

		makeChildNodes(p, scale / 8, scale);

		return p;
	}


	function makeConstraints() {
		var i, p, parent;

		for (i = 0; i < model.particles.length; ++i) {
			p = model.particles[i];
			parent = p.getData().parent;

			if (parent)
				model.addConstraint(new Parti.DistanceConstraint(p, parent, p.radius + parent.radius, p.radius + parent.radius));
		}

	}


	function reset() {
		$('.layout-demo .node').remove();

		model = new Parti.Model({ friction: 0.25 });
		mainNode = makeNode(64, 300, 200);

		model.addConstraint(new Parti.PositionConstraint(mainNode, 300, 200));

		render();
	}


	function updateAndRender() {
		model.update(6);
		render();
		animFrame = window.requestAnimationFrame(updateAndRender);
	}


	$('.layout-demo .button').click(function () {
		if (stage === 'uncollide') {
			stage = 'organise';
			$(this).text('Organise');

			animFrame = window.requestAnimationFrame(updateAndRender);
		}
		else if (stage === 'organise') {
			stage = 'reset';
			$(this).text('Reset');
			makeConstraints();
		}
		else if (stage === 'reset') {
			stage = 'uncollide';
			$(this).text('Uncollide');

			window.cancelAnimationFrame(animFrame);
			animFrame = null;

			reset();
		}
	});

	reset();

})();
