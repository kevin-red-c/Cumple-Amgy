let opciones = [];
let colores = [];
let totalPorcentaje = 0;
let startAngle = 0;
let ruletas = JSON.parse(localStorage.getItem('ruletas')) || {};
let historial = [];
let opcionesOriginal = [];

const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');

const iconoConfiguracion = document.getElementById('iconoConfiguracion');
const panelConfiguracion = document.getElementById('panelConfiguracion');
const modoCondicionado = document.getElementById('modoCondicionado');

// Configuración (abrir/cerrar panel)
iconoConfiguracion.onclick = () => {
  panelConfiguracion.style.display = panelConfiguracion.style.display === 'block' ? 'none' : 'block';
};

function agregarOpcion() {
  const opcionInput = document.getElementById('opcion');
  const porcentajeInput = document.getElementById('porcentaje');
  const opcion = opcionInput.value.trim();
  const porcentaje = parseFloat(porcentajeInput.value);

  if (opcion && porcentaje > 0) {
    opciones.push({ nombre: opcion, porcentaje: porcentaje });
    colores.push(getRandomColor());
    opcionesOriginal = [...opciones];
    actualizarLista();
    dibujarRuleta();
    opcionInput.value = '';
    porcentajeInput.value = '';
  }
}

function actualizarLista() {
  const lista = document.getElementById('lista');
  lista.innerHTML = '';
  opciones.forEach((op, index) => {
    lista.innerHTML += `${index + 1}. ${op.nombre} (${op.porcentaje}%)<br>`;
  });
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
  let angleStart = rotation;
  
  opciones.forEach((op, i) => {
    const slice = (op.porcentaje / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 190, angleStart, angleStart + slice);
    ctx.closePath();
    ctx.fillStyle = colores[i];
    ctx.fill();
    ctx.strokeStyle = "#5b3924";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Texto dentro de cada sección
    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(angleStart + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#5b3924";
    ctx.font = "bold 18px Cinzel";
    ctx.fillText(op.nombre, 170, 0);
    ctx.restore();

    angleStart += slice;
  });

  // Flecha estática arriba
  ctx.fillStyle = "#5b3924";
  ctx.beginPath();
  ctx.moveTo(195, 10);
  ctx.lineTo(205, 10);
  ctx.lineTo(200, 30);
  ctx.closePath();
  ctx.fill();
}

function spinWheel() {
  if (opciones.length === 0) return;

  const randomAngle = Math.random() * 2 * Math.PI;
  const spins = 10 * Math.PI;
  const finalRotation = spins + randomAngle;
  let start = null;
  const duration = 4000;
  const initialRotation = 0;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    const currentRotation = initialRotation + finalRotation * easedProgress;
    dibujarRuleta(currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      determinarResultado(randomAngle);
    }
  }
  requestAnimationFrame(animate);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function determinarResultado(angle) {
  const total = opciones.reduce((sum, op) => sum + op.porcentaje, 0);
  let current = 0;
  const final = (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI);

  for (let i = 0; i < opciones.length; i++) {
    current += (opciones[i].porcentaje / total) * 2 * Math.PI;
    if (final < current) {
      mostrarResultado(opciones[i].nombre, i);
      return;
    }
  }
}

function mostrarResultado(nombre, indexGanador) {
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

  historial.unshift(nombre);
  if (historial.length > 10) historial.pop();
  actualizarHistorial();

  if (modoCondicionado.checked) {
    opciones.splice(indexGanador, 1);
    colores.splice(indexGanador, 1);
    dibujarRuleta();
    actualizarLista();
  }
}

function cerrarResultado() {
  document.getElementById('resultadoVentana').style.display = 'none';
}

function actualizarHistorial() {
  const lista = document.getElementById('historialLista');
  lista.innerHTML = '';
  historial.forEach(nombre => {
    const li = document.createElement('li');
    li.textContent = nombre;
    lista.appendChild(li);
  });
}

function limpiarHistorial() {
  historial = [];
  actualizarHistorial();
}

// Restablecer ruleta
function restablecerOpciones() {
  opciones = [...opcionesOriginal];
  colores = opciones.map(() => getRandomColor());
  actualizarLista();
  dibujarRuleta();
}

// Agregar con Enter
document.getElementById('porcentaje').addEventListener('keydown', (e) => {
  if (e.key === "Enter") agregarOpcion();
});

// Iniciar
dibujarRuleta();
