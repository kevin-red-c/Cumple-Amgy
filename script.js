let opciones = [];
let ruletasGuardadas = JSON.parse(localStorage.getItem('ruletas')) || {};
let historial = JSON.parse(localStorage.getItem('historial')) || [];
let anguloActual = 0;
let girando = false;

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const popup = document.getElementById('resultadoPopup');
const resultadoTexto = document.getElementById('resultadoTexto');

function agregarOpcion() {
  const texto = document.getElementById('opcion').value.trim();
  const porcentaje = parseInt(document.getElementById('porcentaje').value.trim());

  if (!texto || isNaN(porcentaje) || porcentaje <= 0) {
    alert("Completa correctamente los campos.");
    return;
  }

  const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
  opciones.push({ texto, porcentaje, color });
  actualizarLista();
  dibujarRuleta();

  document.getElementById('opcion').value = '';
  document.getElementById('porcentaje').value = '';
}

function actualizarLista() {
  const lista = document.getElementById('lista');
  lista.innerHTML = '';
  opciones.forEach((opcion, index) => {
    const div = document.createElement('div');
    div.innerHTML = `${opcion.texto} - ${opcion.porcentaje}% <button onclick="eliminarOpcion(${index})">❌</button>`;
    lista.appendChild(div);
  });
}

function eliminarOpcion(index) {
  opciones.splice(index, 1);
  actualizarLista();
  dibujarRuleta();
}

function guardarRuleta() {
  const nombre = document.getElementById('nombreRuleta').value.trim();
  if (!nombre) {
    alert("Pon un nombre para la ruleta.");
    return;
  }
  if (opciones.length === 0) {
    alert("Agrega opciones a la ruleta.");
    return;
  }
  ruletasGuardadas[nombre] = JSON.parse(JSON.stringify(opciones));
  localStorage.setItem('ruletas', JSON.stringify(ruletasGuardadas));
  actualizarSelect();
  opciones = [];
  actualizarLista();
  dibujarRuleta();
  alert("Ruleta guardada.");
}

function actualizarRuleta() {
  const nombre = document.getElementById('nombreRuleta').value.trim();
  if (ruletasGuardadas[nombre]) {
    ruletasGuardadas[nombre] = JSON.parse(JSON.stringify(opciones));
    localStorage.setItem('ruletas', JSON.stringify(ruletasGuardadas));
    alert("Ruleta actualizada.");
  } else {
    alert("No hay ruleta para actualizar.");
  }
}

function cargarRuleta() {
  const select = document.getElementById('ruletasGuardadas');
  const nombre = select.value;
  if (nombre && ruletasGuardadas[nombre]) {
    opciones = JSON.parse(JSON.stringify(ruletasGuardadas[nombre]));
    actualizarLista();
    dibujarRuleta();
    document.getElementById('nombreRuleta').value = nombre;
  }
}

function eliminarRuleta() {
  const select = document.getElementById('ruletasGuardadas');
  const nombre = select.value;
  if (nombre && confirm("¿Seguro que quieres eliminar esta ruleta?")) {
    delete ruletasGuardadas[nombre];
    localStorage.setItem('ruletas', JSON.stringify(ruletasGuardadas));
    actualizarSelect();
    alert("Ruleta eliminada.");
  }
}

function actualizarSelect() {
  const select = document.getElementById('ruletasGuardadas');
  select.innerHTML = '';
  Object.keys(ruletasGuardadas).forEach(nombre => {
    const option = document.createElement('option');
    option.value = nombre;
    option.textContent = nombre;
    select.appendChild(option);
  });
}

function dibujarRuleta() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const total = opciones.reduce((sum, o) => sum + o.porcentaje, 0);
  let start = 0;
  opciones.forEach(opcion => {
    const angulo = (opcion.porcentaje / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, start, start + angulo);
    ctx.fillStyle = opcion.color;
    ctx.fill();
    start += angulo;
  });

  // Dibuja la flechita fija
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(245, 20);
  ctx.lineTo(255, 20);
  ctx.closePath();
  ctx.fillStyle = '#5b3924';
  ctx.fill();
}

function spinWheel() {
  if (girando || opciones.length === 0) return;

  girando = true;
  const total = opciones.reduce((sum, o) => sum + o.porcentaje, 0);
  const random = Math.random() * total;
  let acumulado = 0;
  let seleccionada = null;

  for (let opcion of opciones) {
    acumulado += opcion.porcentaje;
    if (random <= acumulado) {
      seleccionada = opcion;
      break;
    }
  }

  const index = opciones.indexOf(seleccionada);
  const anguloPorOpcion = 2 * Math.PI / opciones.length;
  const destino = ((index + 0.5) * anguloPorOpcion);

  let giros = 5;
  const destinoFinal = (2 * Math.PI * giros) - destino;
  const duracion = 5000;
  const inicio = performance.now();

  function animar(tiempo) {
    const progreso = Math.min((tiempo - inicio) / duracion, 1);
    anguloActual = destinoFinal * progreso;
    dibujarRuleta();
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(anguloActual);
    ctx.translate(-250, -250);
    const total = opciones.reduce((sum, o) => sum + o.porcentaje, 0);
    let start = 0;
    opciones.forEach(opcion => {
      const angulo = (opcion.porcentaje / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(250, 250);
      ctx.arc(250, 250, 250, start, start + angulo);
      ctx.fillStyle = opcion.color;
      ctx.fill();
      start += angulo;
    });
    ctx.restore();
    dibujarFlecha();

    if (progreso < 1) {
      requestAnimationFrame(animar);
    } else {
      mostrarResultado(seleccionada.texto);
      agregarHistorial(seleccionada.texto);
      girando = false;
    }
  }
  requestAnimationFrame(animar);
}

function dibujarFlecha() {
  ctx.beginPath();
  ctx.moveTo(250, 0);
  ctx.lineTo(245, 20);
  ctx.lineTo(255, 20);
  ctx.closePath();
  ctx.fillStyle = '#5b3924';
  ctx.fill();
}

function mostrarResultado(texto) {
  resultadoTexto.textContent = texto;
  popup.style.display = 'block';
  const resplandor = document.getElementById('resplandor');
  resplandor.style.opacity = 1;
  resplandor.style.boxShadow = "0 0 60px 30px gold";
  setTimeout(() => {
    resplandor.style.opacity = 0;
    resplandor.style.boxShadow = "0 0 0px 0px gold";
  }, 2000);
}

function cerrarPopup() {
  popup.style.display = 'none';
}

function agregarHistorial(resultado) {
  historial.unshift(resultado);
  if (historial.length > 10) historial.pop();
  localStorage.setItem('historial', JSON.stringify(historial));
  mostrarHistorial();
}

function mostrarHistorial() {
  const lista = document.getElementById('historialLista');
  lista.innerHTML = '';
  historial.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    lista.appendChild(li);
  });
}

function limpiarHistorial() {
  historial = [];
  localStorage.setItem('historial', JSON.stringify(historial));
  mostrarHistorial();
}

// Partículas mágicas
const particlesCanvas = document.getElementById('particles');
const particlesCtx = particlesCanvas.getContext('2d');
let particles = [];

function crearParticula() {
  return {
    x: Math.random() * 500,
    y: Math.random() * 500,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5,
    alpha: Math.random()
  };
}

function dibujarParticulas() {
  particlesCtx.clearRect(0, 0, 500, 500);
  particles.forEach(p => {
    particlesCtx.beginPath();
    particlesCtx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
    particlesCtx.fillStyle = `rgba(255, 223, 0, ${p.alpha})`;
    particlesCtx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > 500 || p.y < 0 || p.y > 500) {
      p.x = Math.random() * 500;
      p.y = Math.random() * 500;
    }
  });
  requestAnimationFrame(dibujarParticulas);
}

for (let i = 0; i < 100; i++) {
  particles.push(crearParticula());
}
dibujarParticulas();

// Actualizaciones iniciales
actualizarSelect();
mostrarHistorial();

// Agregar opción con Enter
document.getElementById('porcentaje').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') agregarOpcion();
});
