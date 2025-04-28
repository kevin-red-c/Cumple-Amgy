let opciones = [];
let colores = [];
let angulos = [];
let totalPorcentaje = 0;
let startAngle = 0;
let currentAngle = 0;
let spinning = false;
let ruletas = JSON.parse(localStorage.getItem('ruletas')) || {};
let historial = [];
let opcionesOriginal = [];

const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');

// CONFIGURACIÓN
const iconoConfiguracion = document.getElementById('iconoConfiguracion');
const panelConfiguracion = document.getElementById('panelConfiguracion');
const modoCondicionado = document.getElementById('modoCondicionado');

// Abrir/cerrar panel de configuración
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
    opcionesOriginal = [...opciones]; // guardar copia inicial
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

function dibujarRuleta() {
  ctx.clearRect(0, 0, wheel.width, wheel.height);
  totalPorcentaje = opciones.reduce((sum, op) => sum + op.porcentaje, 0);
  startAngle = 0;
  angulos = [];

  opciones.forEach((op, index) => {
    const sliceAngle = (op.porcentaje / totalPorcentaje) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(wheel.width/2, wheel.height/2);
    ctx.arc(wheel.width/2, wheel.height/2, wheel.width/2, startAngle, startAngle + sliceAngle);
    ctx.fillStyle = colores[index];
    ctx.fill();
    ctx.stroke();
    angulos.push({ nombre: op.nombre, start: startAngle, end: startAngle + sliceAngle });
    startAngle += sliceAngle;
  });

  // Flecha arriba
  ctx.fillStyle = "#5b3924";
  ctx.beginPath();
  ctx.moveTo(wheel.width/2 - 10, 0);
  ctx.lineTo(wheel.width/2 + 10, 0);
  ctx.lineTo(wheel.width/2, 20);
  ctx.fill();
}

function spinWheel() {
  if (spinning || opciones.length === 0) return;
  spinning = true;
  const randomAngle = Math.random() * 2 * Math.PI;
  const extraSpins = 10 * Math.PI;
  const targetAngle = extraSpins + randomAngle;
  let start = null;
  const duration = 4000;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    currentAngle = progress * targetAngle;
    ctx.save();
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    ctx.translate(wheel.width/2, wheel.height/2);
    ctx.rotate(currentAngle);
    ctx.translate(-wheel.width/2, -wheel.height/2);
    dibujarRuleta();
    ctx.restore();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      determinarResultado(randomAngle);
      spinning = false;
    }
  }
  requestAnimationFrame(animate);
}

function determinarResultado(angle) {
  const finalAngle = (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI);
  let ganador = '';

  for (let i = 0; i < angulos.length; i++) {
    if (finalAngle >= angulos[i].start && finalAngle <= angulos[i].end) {
      ganador = angulos[i].nombre;
      break;
    }
  }

  mostrarResultado(ganador);

  if (modoCondicionado.checked) {
    opciones = opciones.filter(op => op.nombre !== ganador);
    colores.splice(i, 1);
    dibujarRuleta();
    actualizarLista();
  }
}

function mostrarResultado(nombre) {
  const resultadoVentana = document.getElementById('resultadoVentana');
  const resultadoTexto = document.getElementById('resultadoTexto');
  resultadoTexto.innerText = `¡Salió: ${nombre}!`;
  resultadoVentana.style.display = 'block';

  const resplandor = document.getElementById('resplandor');
  resplandor.style.opacity = 1;
  resplandor.style.boxShadow = "0 0 60px 30px gold";
  setTimeout(() => {
    resplandor.style.opacity = 0;
    resplandor.style.boxShadow = "0 0 0px 0px gold";
  }, 1000);

  historial.unshift(nombre);
  if (historial.length > 10) historial.pop();
  actualizarHistorial();
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

dibujarRuleta();
