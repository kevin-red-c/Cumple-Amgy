let opciones = [];
let colores = [];
let opcionesOriginal = [];

const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
let currentRotation = 0;

function agregarOpcion() {
  const opcion = document.getElementById('opcion').value.trim();
  const porcentaje = parseFloat(document.getElementById('porcentaje').value);

  if (opcion && porcentaje > 0) {
    opciones.push({ nombre: opcion, porcentaje: porcentaje });
    colores.push(getRandomColor());
    opcionesOriginal = [...opciones];
    dibujarRuleta();
    document.getElementById('opcion').value = '';
    document.getElementById('porcentaje').value = '';
  }
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function dibujarRuleta(rotation = 0) {
  ctx.clearRect(0, 0, wheel.width, wheel.height);
  const total = opciones.reduce((sum, op) => sum + op.porcentaje, 0);
  let startAngle = rotation;

  opciones.forEach((op, i) => {
    const slice = (op.porcentaje / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 190, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = colores[i];
    ctx.fill();
    ctx.strokeStyle = "#5b3924";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Texto centrado dentro de su sección
    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(startAngle + slice/2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#5b3924";
    ctx.font = "bold 18px Cinzel";
    ctx.fillText(op.nombre, 150, 0);
    ctx.restore();

    startAngle += slice;
  });
}

function spinWheel() {
  if (opciones.length === 0) return;

  const randomAngle = Math.random() * 2 * Math.PI;
  const extraSpins = 10 * Math.PI;
  const targetRotation = extraSpins + randomAngle;
  let start = null;
  const duration = 4000;
  const initialRotation = currentRotation;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);

    currentRotation = initialRotation + targetRotation * eased;
    dibujarRuleta(currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      determinarGanador(randomAngle);
    }
  }
  requestAnimationFrame(animate);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function determinarGanador(angle) {
  const total = opciones.reduce((sum, op) => sum + op.porcentaje, 0);
  let acumulado = 0;
  const final = (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI);

  for (let i = 0; i < opciones.length; i++) {
    acumulado += (opciones[i].porcentaje / total) * 2 * Math.PI;
    if (final < acumulado) {
      mostrarResultado(opciones[i].nombre);
      return;
    }
  }
}

function mostrarResultado(nombre) {
  const resultadoVentana = document.getElementById('resultadoVentana');
  const resultadoTexto = document.getElementById('resultadoTexto');
  resultadoTexto.innerText = `¡Salió: ${nombre}!`;
  resultadoVentana.style.display = 'block';

  const resplandor = document.getElementById('resplandor');
  resplandor.style.opacity = 1;
  resplandor.style.boxShadow = "0 0 100px 50px gold";

  setTimeout(() => {
    resplandor.style.opacity = 0;
    resplandor.style.boxShadow = "0 0 0px 0px gold";
  }, 1500);
}

function cerrarResultado() {
  document.getElementById('resultadoVentana').style.display = 'none';
}

dibujarRuleta();
