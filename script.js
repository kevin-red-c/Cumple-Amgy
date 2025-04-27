const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
let options = [];
let wheelAngle = 0;
let spinning = false;
let spinSpeed = 0;
let historial = [];
let ruletaActual = null;
const resplandor = document.getElementById("resplandor");

// --- Funciones básicas de ruleta ---
function randomColor() {
  const r = Math.floor(Math.random() * 200 + 55);
  const g = Math.floor(Math.random() * 200 + 55);
  const b = Math.floor(Math.random() * 200 + 55);
  return `rgb(${r},${g},${b})`;
}

function agregarOpcion() {
  const opcionInput = document.getElementById("opcion");
  const porcentajeInput = document.getElementById("porcentaje");

  const text = opcionInput.value.trim();
  const percent = parseFloat(porcentajeInput.value);

  if (text && !isNaN(percent) && percent > 0) {
    options.push({ text, percent, color: randomColor() });
    opcionInput.value = "";
    porcentajeInput.value = "";
    actualizarLista();
    drawWheel();
  }
}

function eliminarOpcion(index) {
  options.splice(index, 1);
  actualizarLista();
  drawWheel();
}

function actualizarLista() {
  const listaDiv = document.getElementById("lista");
  listaDiv.innerHTML = "";
  options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<input value="${opt.text}" onchange="editarTexto(${i}, this.value)">
                     <input type="number" value="${opt.percent}" onchange="editarPorcentaje(${i}, this.value)">
                     <input type="color" value="${rgbToHex(opt.color)}" onchange="editarColor(${i}, this.value)">
                     <button onclick="eliminarOpcion(${i})">❌</button>`;
    listaDiv.appendChild(div);
  });
}

function editarTexto(index, nuevoTexto) {
  options[index].text = nuevoTexto;
  drawWheel();
}

function editarPorcentaje(index, nuevoPorcentaje) {
  options[index].percent = parseFloat(nuevoPorcentaje);
  drawWheel();
}

function editarColor(index, nuevoColor) {
  options[index].color = nuevoColor;
  drawWheel();
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  return "#" + result.map(x => parseInt(x).toString(16).padStart(2, "0")).join("");
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(200, 200);
  ctx.rotate(wheelAngle * Math.PI / 180);

  let startAngle = 0;
  options.forEach(opt => {
    const sliceAngle = (opt.percent / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 180, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = opt.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#5b3924";
    ctx.stroke();

    ctx.save();
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Cinzel, serif";
    ctx.fillText(opt.text, 170, 10);
    ctx.restore();

    startAngle += sliceAngle;
  });
  ctx.restore();

  ctx.fillStyle = "#5b3924";
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(190, 30);
  ctx.lineTo(210, 30);
  ctx.closePath();
  ctx.fill();
}

function spinWheel() {
  if (options.length === 0 || spinning) return;
  spinning = true;
  spinSpeed = Math.random() * 10 + 20;

  let frames = 0;
  const maxFrames = 100;

  resplandor.style.opacity = 0; // Apagar el resplandor al empezar

  function animate() {
    if (frames < maxFrames) {
      wheelAngle += spinSpeed;
      drawWheel();
      frames++;
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      showResult();
    }
  }

  animate();
}

function showResult() {
  let normalizedAngle = (wheelAngle % 360 + 360) % 360;
  let angle = (270 - normalizedAngle + 360) % 360;
  let currentAngle = 0;

  for (let opt of options) {
    const sliceAngle = (opt.percent / 100) * 360;
    if (angle >= currentAngle && angle < currentAngle + sliceAngle) {
      document.getElementById("resultado").innerText = "Resultado: " + opt.text;
      agregarHistorial(opt.text);

      // Activar resplandor
      resplandor.style.opacity = 1;
      resplandor.style.boxShadow = `0 0 50px 15px ${opt.color}`;

      setTimeout(() => {
        resplandor.style.opacity = 0;
      }, 1500);

      return;
    }
    currentAngle += sliceAngle;
  }

  document.getElementById("resultado").innerText = "No hay resultado.";
}

// --- Funciones de ruletas ---
function guardarRuleta() {
  const nombreInput = document.getElementById("nombreRuleta").value.trim();
  if (!nombreInput) {
    alert("Ponle un nombre a la ruleta.");
    return;
  }
  if (options.length === 0) {
    alert("No puedes guardar una ruleta vacía.");
    return;
  }

  const savedRuletas = JSON.parse(localStorage.getItem("ruletas")) || {};

  savedRuletas[nombreInput] = JSON.parse(JSON.stringify(options));

  localStorage.setItem("ruletas", JSON.stringify(savedRuletas));

  actualizarSelectRuletas();
  alert("Ruleta guardada como: " + nombreInput);

  document.getElementById("nombreRuleta").value = "";
  options = [];
  ruletaActual = null;
  actualizarLista();
  drawWheel();
  limpiarHistorial();
}

function actualizarRuleta() {
  if (!ruletaActual) {
    alert("Primero carga una ruleta para actualizar.");
    return;
  }

  const savedRuletas = JSON.parse(localStorage.getItem("ruletas")) || {};
  savedRuletas[ruletaActual] = JSON.parse(JSON.stringify(options));
  localStorage.setItem("ruletas", JSON.stringify(savedRuletas));

  alert("Ruleta actualizada correctamente.");
  actualizarSelectRuletas();
}

function cargarRuleta() {
  const select = document.getElementById("ruletasGuardadas");
  const nombre = select.value;
  if (!nombre) return;

  const savedRuletas = JSON.parse(localStorage.getItem("ruletas")) || {};
  options = JSON.parse(JSON.stringify(savedRuletas[nombre])) || [];
  ruletaActual = nombre;

  document.getElementById("nombreRuleta").value = nombre;
  actualizarLista();
  drawWheel();
  limpiarHistorial();
}

function eliminarRuleta() {
  const select = document.getElementById("ruletasGuardadas");
  const nombre = select.value;
  if (!nombre) return;

  const savedRuletas = JSON.parse(localStorage.getItem("ruletas")) || {};
  delete savedRuletas[nombre];
  localStorage.setItem("ruletas", JSON.stringify(savedRuletas));

  actualizarSelectRuletas();
  alert("Ruleta eliminada.");
  options = [];
  ruletaActual = null;
  actualizarLista();
  drawWheel();
  limpiarHistorial();
}

function actualizarSelectRuletas() {
  const select = document.getElementById("ruletasGuardadas");
  select.innerHTML = "";

  const savedRuletas = JSON.parse(localStorage.getItem("ruletas")) || {};

  for (let nombre in savedRuletas) {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    select.appendChild(option);
  }
}

// --- Historial ---
function agregarHistorial(resultado) {
  historial.unshift(resultado);
  if (historial.length > 10) historial.pop();
  actualizarHistorial();
}

function actualizarHistorial() {
  const lista = document.getElementById("historialLista");
  lista.innerHTML = "";
  historial.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    lista.appendChild(li);
  });
}

function limpiarHistorial() {
  historial = [];
  actualizarHistorial();
}

// --- Agregar Enter para agregar opción ---
document.getElementById('porcentaje').addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    agregarOpcion();
  }
});

// --- Inicializar ruletas guardadas ---
actualizarSelectRuletas();
