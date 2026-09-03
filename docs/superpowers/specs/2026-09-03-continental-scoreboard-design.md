# Marcador de Continental — Design

## Contexto y propósito

Web para llevar la puntuación de partidas del juego de cartas **Continental**
en una mesa física, usando un único móvil/tablet compartido entre todos los
jugadores. Sustituye el papel y boli para anotar puntos ronda a ronda.

## Alcance

- Un solo dispositivo, un solo "grupo" jugando a la vez (sin cuentas, sin
  multiusuario en tiempo real).
- Sin backend: todo el estado vive en el navegador.
- Sin historial de partidas pasadas: solo importa la partida activa.

## Reglas del dominio

- Cada partida tiene una **secuencia de rondas**, cada una con un nombre
  (ej. "2 tríos", "Trío + escalera", "2 escaleras") y un número de cartas
  repartidas, creciente ronda a ronda.
- En cada ronda se anota la puntuación de cada jugador (puntos de las cartas
  que le quedan en mano; a más puntos, peor).
- Gana la partida quien acumule **menos** puntos tras la última ronda.

## Flujo de la aplicación

1. **Configurar jugadores** (`PlayerSetup`)
   - Añadir/eliminar/reordenar jugadores (mínimo 2).
2. **Configurar rondas** (`RoundSetup`)
   - Lista precargada con la secuencia estándar (2 tríos, trío+escalera,
     2 escaleras, con nº de cartas creciente).
   - Editable: añadir, quitar, renombrar rondas y su nº de cartas antes de
     empezar.
3. **Tablero de partida** (`ScoreBoard`)
   - Tabla: filas = jugadores, columnas = rondas.
   - Input de puntuación por jugador y ronda, ronda activa resaltada.
   - Fila de total acumulado siempre visible, jugadores ordenados de menor a
     mayor puntuación total.
4. **Podio** (`PodiumView`)
   - Al guardar la puntuación de la última ronda, navega automáticamente
     aquí.
   - Vista visual con 1º, 2º y 3º destacados (podio), y el resto de
     jugadores listados debajo por orden de puntuación.
   - Botón **"Nueva partida"**: mantiene la misma lista de jugadores y
     rondas, resetea solo las puntuaciones, y vuelve directo al tablero
     (`ScoreBoard`) vacío y listo para jugar.

## Persistencia

- El estado completo de la partida activa (jugadores, rondas, puntuaciones,
  pantalla actual) se guarda en `localStorage` en cada cambio, para
  sobrevivir a un refresco de página accidental.
- No hay persistencia de partidas ya finalizadas.

## Arquitectura técnica

- **Stack:** Vue 3 + Vite + Tailwind CSS.
- **Estado:** store único (Pinia) con la partida activa: `players`,
  `rounds`, `scores` (matriz jugador×ronda), `currentRoundIndex`, `phase`
  (`setup-players` | `setup-rounds` | `playing` | `podium`).
  - Sincronización con `localStorage` mediante un watcher sobre el store.
- **Componentes:**
  - `PlayerSetup.vue`
  - `RoundSetup.vue`
  - `ScoreBoard.vue` (+ `ScoreRow.vue` por jugador)
  - `PodiumView.vue`
  - `App.vue` renderiza el componente según `phase`.
- **Lógica pura testeable** (fuera de componentes, en el store o en
  `utils/`): cálculo de totales acumulados, orden de clasificación,
  determinación del podio (1º/2º/3º + resto).

## Testing

- Vitest sobre las funciones puras de cálculo (totales, clasificación,
  podio) — casos de empate incluidos.
- Verificación manual en navegador del flujo completo: configurar
  jugadores → configurar rondas → jugar todas las rondas → podio → nueva
  partida.

## Fuera de alcance (YAGNI)

- Cuentas de usuario, multi-dispositivo, sincronización en tiempo real.
- Historial de partidas anteriores.
- Edición de puntuaciones ya introducidas en rondas pasadas (se puede añadir
  después si hace falta).
- Reglas de validación de las combinaciones de cartas (la app solo registra
  puntos, no valida jugadas).
