//Tablero: matriz 8x8
const tablero = []; // Se inicializa como un array vacío, solo se puede modificar su contenido interno
for (let fila = 0; fila < 8; fila++) {
  const nuevaFila = []; //En cada vuelta creamos una nueva fila
  for (let columna = 0; columna < 8; columna++) {
    nuevaFila.push(null); // Se inicializa cada casilla como null (vacía)
  }
  tablero.push(nuevaFila); //Cada que se termina de crear una fila, la agregamos al tablero
}

function InicializarFichas() { // Esta función solo toca la matriz (tablero), no dibuja nada
  for (let fila = 0; fila < 8; fila++) { //visita cada fila
    for (let columna = 0; columna < 8; columna++) { //visita cada columna
      const Jugable = (fila + columna) % 2 !== 0; //calcula si la casilla es jugable (oscura) dependiendo de si es par o impar la suma de fila y columna
      if (!Jugable) continue; //si la casilla no es jugable, salta a la siguiente iteración del bucle //continue// (evita poner fichas en casillas claras)
      if (fila < 3) {
        tablero[fila][columna] = "negra"; // jugador de fichas oscuras arriba
      } else if (fila > 4) {
        tablero[fila][columna] = "blanca"; // jugador de fichas claras abajo
      }
      // filas 3 y 4 quedan vacías (null), son el campo neutral
    }
  }
}

//Referencia al contenedor en el HTML
const contenedorTablero = document.getElementById("tablero");

//Función que dibuja el tablero completo (solo lee la matriz y genera el HTML)
function dibujarTablero() {
  contenedorTablero.innerHTML = ""; // limpia antes de redibujar

   let movimientosValidos = []; // obtiene los movimientos validos y los guarda en un arreglo
    if (fichaSeleccionada !== null) {
    movimientosValidos = obtenerMovimientosValidos(
      fichaSeleccionada.fila,
      fichaSeleccionada.columna
    );
    }

  for (let fila = 0; fila < 8; fila++) { //recorre filas
    for (let columna = 0; columna < 8; columna++) { //recorre columnas
      const casilla = document.createElement("div"); //crea un div para cada casilla
      casilla.classList.add("casilla"); //le asigna la clase "casilla" al div creado

      const esOscura = (fila + columna) % 2 !== 0; //calcula si la casilla es oscura igual que antes
      casilla.classList.add(esOscura ? "oscura" : "clara"); //le asingna la clase "oscura" o "clara" dependiendo del resultado

      casilla.dataset.fila = fila; //le asigna un atributo data-fila con el número de fila
      casilla.dataset.columna = columna; //le asigna un atributo data-columna con el número de columna
      
      if(
        fichaSeleccionada !== null &&
        fichaSeleccionada.fila === fila &&     //revisa si seleccionamos una casilla y
        fichaSeleccionada.columna === columna  //verifica cual es
      )
      {
          casilla.classList.add("seleccionada"); //añade una clase nueva al css de la casilla seleccionada
      }
        //pregunta si la casilla es un mov valido para la ficha seleccionada
      const esMovimientoValido = movimientosValidos.some(
        (mov) => mov.fila === fila && mov.columna === columna
      );
      if (esMovimientoValido) {
        casilla.classList.add("movimiento-valido");
      }

      // Si la matriz tiene una ficha en esta posición, la dibujamos
      const contenidoCasilla = tablero[fila][columna];
      if (contenidoCasilla) { //si existe algo en la casilla (no es null), dibuja la ficha
        const ficha = document.createElement("div");
        const colorBase = obtenerColorBase(contenidoCasilla);
        ficha.classList.add("ficha", `ficha-${colorBase}`); //asigna la clase ficha-blanca/negra dependiendo del valor(funcion InicializarFichas) de la casilla
            if (esDama(contenidoCasilla)) {
              ficha.classList.add("ficha-dama");
            }                                  

        casilla.appendChild(ficha); // mete el div de la ficha en el div de la casilla como su elemento hije
      }

      contenedorTablero.appendChild(casilla); // mete el div de la casilla (con ficha incluida o no) en el div del tablero como su elemento hije
    }
  }
}

// Variable que recuerda qué ficha está seleccionada actualmente
let fichaSeleccionada = null;

// Revisa si una posición está dentro del tablero (0 a 7)
function posicionValida(fila, columna) {
  return fila >= 0 && fila <= 7 && columna >= 0 && columna <= 7;
}

// Calcula los movimientos válidos (sin capturas todavía) de una ficha normal
function obtenerMovimientosValidos(fila, columna) {
  const colorFicha = tablero[fila][columna]; //Recibe la posición de una ficha y lee que color de ficha hay
  const movimientos = []; //y lo guarda en colorFicha.movimientos que empieza como un array vacío

  let posiblesDirecciones;

  if (esDama(colorFicha)) {
    posiblesDirecciones = [
      { df: -1, dc: -1 },
      { df: -1, dc: 1 },
      { df: 1, dc: -1 },
      { df: 1, dc: 1 },
    ];
  } else {
    const direccion = colorFicha === "blanca" ? -1 : 1;
    posiblesDirecciones = [
      { df: direccion, dc: -1 },
      { df: direccion, dc: 1 },
    ];
  }

  for (const dir of posiblesDirecciones) {
    const filaDestino = fila + dir.df;
    const columnaDestino = columna + dir.dc;

    if (posicionValida(filaDestino, columnaDestino)) {
      if (tablero[filaDestino][columnaDestino] === null) {
        movimientos.push({ fila: filaDestino, columna: columnaDestino });
      }
    }
  }

  return movimientos; //entrega el array con 0,1 o 2 posiciones validas
}

// Ejecuta el movimiento de una ficha en la matriz
function moverFicha(origen, destino) { //recibe dos objetos como parámetros cada uno con forma {fila,columna}
  const colorFicha = tablero[origen.fila][origen.columna]; //lee que color de ficha hay en la posición de origen
  tablero[destino.fila][destino.columna] = colorFicha; //escribe el color en la posición destino
  tablero[origen.fila][origen.columna] = null; // limpia la posición de origen pq la ficha ya se movio
  coronarFicha(destino.fila, destino.columna);
}

// Calcula las capturas posibles de una ficha específica
function obtenerCapturasPosibles(fila, columna) {
  const colorFicha = tablero[fila][columna];
  const colorRival = obtenerColorBase(colorFicha) === "blanca" ? "negra" : "blanca";
  const capturas = [];

  let posiblesDirecciones;

  if (esDama(colorFicha)) {
    posiblesDirecciones = [
      { df: -1, dc: -1 },
      { df: -1, dc: 1 },
      { df: 1, dc: -1 },
      { df: 1, dc: 1 },
    ];
  } else {
    const direccion = colorFicha === "blanca" ? -1 : 1;
    posiblesDirecciones = [
      { df: direccion, dc: -1 },
      { df: direccion, dc: 1 },
    ];
  }

  for (const dir of posiblesDirecciones) {
    const filaRival = fila + dir.df;
    const columnaRival = columna + dir.dc;
    const filaDestino = fila + dir.df * 2;
    const columnaDestino = columna + dir.dc * 2;

    if (!posicionValida(filaDestino, columnaDestino)) continue;

    const contenidoRival = tablero[filaRival][columnaRival];
    const destinoVacio = tablero[filaDestino][columnaDestino] === null;

    if (obtenerColorBase(contenidoRival) === colorRival && destinoVacio) {
      capturas.push({
        fila: filaDestino,
        columna: columnaDestino,
        filaCapturada: filaRival,
        columnaCapturada: columnaRival,
      });
    }
  }

  return capturas;
}

// Revisa si UN jugador (color) tiene alguna captura disponible en todo el tablero
function jugadorTieneCapturas(color) {
  for (let fila = 0; fila < 8; fila++) {
    for (let columna = 0; columna < 8; columna++) {
      if (obtenerColorBase(tablero[fila][columna]) === color) {
        const capturas = obtenerCapturasPosibles(fila, columna);
        if (capturas.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

// Devuelve el color base de una ficha, sin importar si es dama o no
function obtenerColorBase(colorFicha) {
  if (colorFicha === "blanca" || colorFicha === "blanca_dama") return "blanca";
  if (colorFicha === "negra" || colorFicha === "negra_dama") return "negra";
  return null;
}

// Revisa si una ficha es dama
function esDama(colorFicha) {
  return colorFicha === "blanca_dama" || colorFicha === "negra_dama";
}

// Revisa si una ficha, en su posición actual, debe coronarse, y la convierte
function coronarFicha(fila, columna) {
  const colorFicha = tablero[fila][columna];

  if (colorFicha === "blanca" && fila === 0) {
    tablero[fila][columna] = "blanca_dama";
  } else if (colorFicha === "negra" && fila === 7) {
    tablero[fila][columna] = "negra_dama";
  }
}

// Ejecuta una captura: mueve la ficha Y elimina la ficha comida
function ejecutarCaptura(origen, captura) {
  const colorFicha = tablero[origen.fila][origen.columna];
  tablero[captura.fila][captura.columna] = colorFicha;
  tablero[origen.fila][origen.columna] = null;
  tablero[captura.filaCapturada][captura.columnaCapturada] = null;
  coronarFicha(captura.fila, captura.columna);
}
// Variable que indica de quién es el turno actual
let turnoActual = "blanca"; // el juego inicia con las fichas claras


// Variable que "bloquea" la selección a una sola ficha durante una captura en cadena
let fichaEnCadena = null;

// Cambia el turno al jugador contrario
function cambiarTurno() {
  turnoActual = turnoActual === "blanca" ? "negra" : "blanca";
}


let juegoTerminado = false;
let historialMovimientos = [];

const turnoIndicador = document.getElementById("turno-indicador");
const mensajeJuego = document.getElementById("mensaje-juego");
const listaHistorial = document.getElementById("lista-historial");
const btnReiniciar = document.getElementById("btn-reiniciar");

// Cuenta cuántas fichas le quedan a un color (normales + damas)
function contarFichas(color) {
  let contador = 0;
  for (let fila = 0; fila < 8; fila++) {
    for (let columna = 0; columna < 8; columna++) {
      if (obtenerColorBase(tablero[fila][columna]) === color) {
        contador++;
      }
    }
  }
  return contador;
}

// Revisa si un jugador tiene AL MENOS un movimiento o captura posible
function jugadorTieneMovimientos(color) {
  for (let fila = 0; fila < 8; fila++) {
    for (let columna = 0; columna < 8; columna++) {
      if (obtenerColorBase(tablero[fila][columna]) === color) {
        const movimientos = obtenerMovimientosValidos(fila, columna);
        const capturas = obtenerCapturasPosibles(fila, columna);
        if (movimientos.length > 0 || capturas.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

function actualizarIndicadorTurno() {
  const nombreTurno = turnoActual === "blanca" ? "Blancas" : "Negras";
  turnoIndicador.textContent = `Turno: ${nombreTurno}`;
}

function mostrarMensaje(texto) {
  mensajeJuego.textContent = texto;
}

// Revisa las dos condiciones de fin de juego y actualiza el mensaje
function verificarFinDeJuego() {
  const fichasBlancas = contarFichas("blanca");
  const fichasNegras = contarFichas("negra");

  if (fichasBlancas === 0) {
    juegoTerminado = true;
    detenerTemporizador();
    mostrarMensaje("¡Ganaron las Negras! Las Blancas se quedaron sin fichas.");
    return;
  }

  if (fichasNegras === 0) {
    juegoTerminado = true;
    detenerTemporizador();
    mostrarMensaje("¡Ganaron las Blancas! Las Negras se quedaron sin fichas.");
    return;
  }

  const puedeJugar = jugadorTieneMovimientos(turnoActual);
  if (!puedeJugar) {
    juegoTerminado = true;
    const ganador = turnoActual === "blanca" ? "Negras" : "Blancas";
    detenerTemporizador();
    mostrarMensaje(`¡Ganaron las ${ganador}! El otro jugador quedó acorralado.`);
    return;
  }

  mostrarMensaje("");
}

// Convierte una posición (fila, columna) a notación tipo "c4"
function convertirANotacion(fila, columna) {
  const letras = "abcdefgh";
  return `${letras[columna]}${8 - fila}`;
}

function registrarMovimiento(origen, destino, fueCaptura) {
  const numero = historialMovimientos.length + 1;
  const notacionOrigen = convertirANotacion(origen.fila, origen.columna);
  const notacionDestino = convertirANotacion(destino.fila, destino.columna);
  const simbolo = fueCaptura ? "x" : "-";
  const texto = `${numero}. ${notacionOrigen}${simbolo}${notacionDestino}`;

  historialMovimientos.push(texto);

  const item = document.createElement("li");
  item.textContent = texto;
  listaHistorial.appendChild(item);
}

function reiniciarJuego() {
  detenerTemporizador();
  for (let fila = 0; fila < 8; fila++) {
    for (let columna = 0; columna < 8; columna++) {
      tablero[fila][columna] = null;
    }
  }
  InicializarFichas();

  turnoActual = "blanca";
  fichaSeleccionada = null;
  fichaEnCadena = null;
  juegoTerminado = false;
  historialMovimientos = [];
  listaHistorial.innerHTML = "";
  tiempoBlancas = 120;
  tiempoNegras = 120;

  mostrarMensaje("");
  actualizarDisplayTemporizador();
  actualizarIndicadorTurno();
  dibujarTablero(); 
}

let tiempoBlancas = 120; // 2 minutos, en segundos
let tiempoNegras = 120;
let intervaloTemporizador = null;

const tiempoBlancasEl = document.getElementById("tiempo-blancas");
const tiempoNegrasEl = document.getElementById("tiempo-negras");

function formatearTiempo(segundosTotales) {
  const minutos = Math.floor(segundosTotales / 60);
  const segundos = segundosTotales % 60;
  const segundosTexto = segundos < 10 ? `0${segundos}` : `${segundos}`;
  return `${minutos}:${segundosTexto}`;
}

function actualizarDisplayTemporizador() {
  tiempoBlancasEl.textContent = `Blancas: ${formatearTiempo(tiempoBlancas)}`;
  tiempoNegrasEl.textContent = `Negras: ${formatearTiempo(tiempoNegras)}`;
}

function detenerTemporizador() {
  if (intervaloTemporizador !== null) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }
}

function iniciarTemporizador() {
  detenerTemporizador(); // por si ya había uno corriendo, lo cortamos primero

  intervaloTemporizador = setInterval(() => {
    if (turnoActual === "blanca") {
      tiempoBlancas--;
    } else {
      tiempoNegras--;
    }

    actualizarDisplayTemporizador();

    if (tiempoBlancas <= 0 || tiempoNegras <= 0) {
      detenerTemporizador();
      juegoTerminado = true;
      const ganador = tiempoBlancas <= 0 ? "Negras" : "Blancas";
      mostrarMensaje(`¡Ganaron las ${ganador}! Se acabó el tiempo del rival.`);
    }
  }, 1000);
}

btnReiniciar.addEventListener("click", reiniciarJuego);



const btnGuardar = document.getElementById("btn-guardar");
const btnVerGuardadas = document.getElementById("btn-ver-guardadas");
const modalGuardadas = document.getElementById("modal-guardadas");
const listaGuardadas = document.getElementById("lista-guardadas");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");

function obtenerPartidasGuardadas() {
  const datos = localStorage.getItem("partidasDamas");
  return datos ? JSON.parse(datos) : [];
}

function guardarPartida() {
  const nombre = prompt("Nombre para esta partida guardada:");
  if (!nombre) return;

  const estado = {
    nombre: nombre,
    fecha: new Date().toLocaleString(),
    tablero: tablero,
    turnoActual: turnoActual,
    historialMovimientos: historialMovimientos,
    tiempoBlancas: tiempoBlancas,
    tiempoNegras: tiempoNegras,
    juegoTerminado: juegoTerminado,
    mensaje: mensajeJuego.textContent,
  };

  const partidasGuardadas = obtenerPartidasGuardadas();
  partidasGuardadas.push(estado);
  localStorage.setItem("partidasDamas", JSON.stringify(partidasGuardadas));

  alert("Partida guardada correctamente.");
}

function mostrarListaGuardadas() {
  const partidasGuardadas = obtenerPartidasGuardadas();
  listaGuardadas.innerHTML = "";

  partidasGuardadas.forEach((partida, indice) => {
    const item = document.createElement("li");

    const texto = document.createElement("span");
    texto.textContent = `${partida.nombre} — ${partida.fecha}`;

    const btnCargar = document.createElement("button");
    btnCargar.textContent = "Cargar";
    btnCargar.addEventListener("click", () => cargarPartida(indice));

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", () => eliminarPartida(indice));

    item.appendChild(texto);
    item.appendChild(btnCargar);
    item.appendChild(btnEliminar);
    listaGuardadas.appendChild(item);
  });

  modalGuardadas.classList.remove("oculto");
}

function cargarPartida(indice) {
  const partidasGuardadas = obtenerPartidasGuardadas();
  const partida = partidasGuardadas[indice];

  if (!partida) return;

  detenerTemporizador();

  for (let fila = 0; fila < 8; fila++) {
    for (let columna = 0; columna < 8; columna++) {
      tablero[fila][columna] = partida.tablero[fila][columna];
    }
  }

  turnoActual = partida.turnoActual;
  historialMovimientos = partida.historialMovimientos;
  tiempoBlancas = partida.tiempoBlancas;
  tiempoNegras = partida.tiempoNegras;
  fichaSeleccionada = null;
  fichaEnCadena = null;
  juegoTerminado = partida.juegoTerminado === true;

  listaHistorial.innerHTML = "";
  historialMovimientos.forEach((texto) => {
    const item = document.createElement("li");
    item.textContent = texto;
    listaHistorial.appendChild(item);
  });

  mostrarMensaje(partida.mensaje || "");
  actualizarIndicadorTurno();
  actualizarDisplayTemporizador();
  dibujarTablero();

  modalGuardadas.classList.add("oculto");
}

function eliminarPartida(indice) {
  const partidasGuardadas = obtenerPartidasGuardadas();
  partidasGuardadas.splice(indice, 1);
  localStorage.setItem("partidasDamas", JSON.stringify(partidasGuardadas));
  mostrarListaGuardadas();
}

btnGuardar.addEventListener("click", guardarPartida);
btnVerGuardadas.addEventListener("click", mostrarListaGuardadas);
btnCerrarModal.addEventListener("click", () => modalGuardadas.classList.add("oculto"));



//listener clics
contenedorTablero.addEventListener("click", (evento) => {
  if (juegoTerminado) return;
  const casilla = evento.target.closest(".casilla");
  if (!casilla) return;

  const fila = Number(casilla.dataset.fila);
  const columna = Number(casilla.dataset.columna);
  const contenidoCasilla = tablero[fila][columna];

  const hayCapturasObligatorias = jugadorTieneCapturas(turnoActual);

  if (fichaSeleccionada === null) {
    // Caso A: no hay nada seleccionado todavía

    if (obtenerColorBase(contenidoCasilla) !== turnoActual) return; // no es una ficha del jugador en turno

    if (hayCapturasObligatorias) {
      const capturasDeEstaFicha = obtenerCapturasPosibles(fila, columna);
      if (capturasDeEstaFicha.length === 0) return; // esta ficha no puede comer, no se deja seleccionar
    }

    fichaSeleccionada = { fila: fila, columna: columna };
  } else {
    // Caso B: ya había una ficha seleccionada

    const mismaCasilla =
      fichaSeleccionada.fila === fila && fichaSeleccionada.columna === columna;

    if (mismaCasilla) {
      if (fichaEnCadena === null) {
        fichaSeleccionada = null; // deseleccionar (solo si no está en medio de una cadena)
      }
      dibujarTablero();
      return;
    }

    const capturas = obtenerCapturasPosibles(
      fichaSeleccionada.fila,
      fichaSeleccionada.columna
    );

    const capturaElegida = capturas.find(
      (cap) => cap.fila === fila && cap.columna === columna
    );

    if (hayCapturasObligatorias) {
      // Solo se permite mover si es una captura válida
      if (capturaElegida) {
        const origenCaptura = { fila: fichaSeleccionada.fila, columna: fichaSeleccionada.columna };
        const eraDamaAntes = esDama(tablero[fichaSeleccionada.fila][fichaSeleccionada.columna]);
        ejecutarCaptura(fichaSeleccionada, capturaElegida);
        registrarMovimiento(origenCaptura, { fila: fila, columna: columna }, true);

        const yaEsDama = esDama(tablero[fila][columna]);
        const seAcabaDeCoronar = !eraDamaAntes && yaEsDama;

        const nuevasCapturas = seAcabaDeCoronar ? [] : obtenerCapturasPosibles(fila, columna);

        if (nuevasCapturas.length > 0) {
          fichaSeleccionada = { fila: fila, columna: columna };
          fichaEnCadena = { fila: fila, columna: columna };
        } else {
          fichaSeleccionada = null;
          fichaEnCadena = null;
          cambiarTurno();
          actualizarIndicadorTurno();
          verificarFinDeJuego();
          if (!juegoTerminado) {
            iniciarTemporizador();
          } 
        }
      }
      // Si no era una captura válida, no hacemos nada (el clic se ignora)
    } else {
      // No hay capturas obligatorias: se permite movimiento simple
      const movimientos = obtenerMovimientosValidos(
        fichaSeleccionada.fila,
        fichaSeleccionada.columna
      );

      const esMovimientoValido = movimientos.some(
        (mov) => mov.fila === fila && mov.columna === columna
      );

      if (esMovimientoValido) {
        const origenMovimiento = { fila: fichaSeleccionada.fila, columna: fichaSeleccionada.columna };
        moverFicha(fichaSeleccionada, { fila: fila, columna: columna });
        registrarMovimiento(origenMovimiento, { fila: fila, columna: columna }, false);
        fichaSeleccionada = null;
        cambiarTurno();
        actualizarIndicadorTurno();
        verificarFinDeJuego();
        if (!juegoTerminado) {
            iniciarTemporizador();
          } 
      }
    }
  }

  dibujarTablero();
});



//Inicializar juego
InicializarFichas();
actualizarIndicadorTurno(); 
actualizarDisplayTemporizador();
dibujarTablero();
