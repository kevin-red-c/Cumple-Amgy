const canvasBg = document.getElementById('background');
const ctxBg = canvasBg.getContext('2d');

let particles = [];

function createParticles() {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random()
    });
  }
}

function drawParticles() {
  ctxBg.clearRect(0, 0, canvasBg.width, canvasBg.height);

  particles.forEach(p => {
    ctxBg.beginPath();
    ctxBg.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctxBg.fillStyle = `rgba(255, 223, 150, ${p.opacity})`;
    ctxBg.fill();
  });

  moveParticles();
  requestAnimationFrame(drawParticles);
}

function moveParticles() {
  particles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < 0 || p.x > window.innerWidth) p.speedX *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.speedY *= -1;
  });
}

function resizeCanvas() {
  canvasBg.width = window.innerWidth;
  canvasBg.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
createParticles();
drawParticles();
