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
  const colorRival = colorFicha === "blanca" ? "negra" : "blanca";
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

// Listener de clics, ahora con turnos y capturas obligatorias
contenedorTablero.addEventListener("click", (evento) => {
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
        const eraDamaAntes = esDama(tablero[fichaSeleccionada.fila][fichaSeleccionada.columna]);
        ejecutarCaptura(fichaSeleccionada, capturaElegida);

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
        moverFicha(fichaSeleccionada, { fila: fila, columna: columna });
        fichaSeleccionada = null;
        cambiarTurno();
      }
    }
  }

  dibujarTablero();
});



//Inicializar juego
InicializarFichas();
dibujarTablero();