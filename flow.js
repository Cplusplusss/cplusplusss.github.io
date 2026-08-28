const canvas = document.getElementById('flow');
const context = canvas.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let width = 0;
let height = 0;
let particles = [];
let time = 0;

function resize() {
	const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
	width = window.innerWidth;
	height = window.innerHeight;
	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
	context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	createParticles();
}

function createParticles() {
	const count = Math.min(1100, Math.max(380, Math.floor((width * height) / 1700)));
	particles = Array.from({ length: count }, () => ({
		x: Math.random() * width,
		y: Math.random() * height,
		life: Math.random() * 160,
		maxLife: 80 + Math.random() * 220,
		speed: 0.35 + Math.random() * 0.8,
		width: 0.25 + Math.random() * 1.1,
		alpha: 0.06 + Math.random() * 0.24,
		warm: Math.random() > 0.78
	}));
}

function fieldAngle(x, y, currentTime) {
	const scale = 0.0018;
	const waves = Math.sin(x * scale + currentTime * 0.00025) * 1.4
		+ Math.cos(y * scale * 1.35 - currentTime * 0.00018) * 1.1
		+ Math.sin((x + y) * scale * 0.65 + currentTime * 0.00016) * 0.8;
	return waves + Math.sin(y * 0.004 + currentTime * 0.00035) * 0.25;
}

function draw() {
	context.fillStyle = 'rgba(3, 3, 3, 0.075)';
	context.fillRect(0, 0, width, height);
	context.globalCompositeOperation = 'screen';

	for (const particle of particles) {
		const previousX = particle.x;
		const previousY = particle.y;
		const angle = fieldAngle(particle.x, particle.y, time);
		particle.x += Math.cos(angle) * particle.speed;
		particle.y += Math.sin(angle) * particle.speed;
		particle.life += 1;

		const fade = Math.min(1, particle.life / 24, (particle.maxLife - particle.life) / 38);
		if (particle.life > particle.maxLife || particle.x < -30 || particle.x > width + 30 || particle.y < -30 || particle.y > height + 30) {
			particle.x = Math.random() * width;
			particle.y = Math.random() * height;
			particle.life = 0;
		}

		context.beginPath();
		context.moveTo(previousX, previousY);
		context.lineTo(particle.x, particle.y);
		context.strokeStyle = particle.warm
			? `rgba(220, 203, 164, ${particle.alpha * fade})`
			: `rgba(221, 226, 220, ${particle.alpha * fade})`;
		context.lineWidth = particle.width;
		context.stroke();
	}

	context.globalCompositeOperation = 'source-over';
	time += reducedMotion.matches ? 0 : 16;
	requestAnimationFrame(draw);
}

window.addEventListener('resize', resize, { passive: true });
resize();
draw();
