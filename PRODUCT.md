# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Una persona anota los puntos al cerrar cada mano. El resto del grupo mira el mismo móvil o tablet, en la mesa, para ver quién va ganando.

## Product Purpose

Marcador de partidas del juego de cartas Continental. Sustituye el papel para anotar, ronda a ronda, en un único dispositivo compartido. El éxito es terminar la partida con un ganador claro: quien acumula menos puntos.

## Positioning

Un solo dispositivo, una sola partida activa, sin cuentas y sin servidor. El estado vive en el navegador. Gana el menor total, no el mayor.

## Operating Context

La partida ocurre en una mesa física. El dispositivo habitual es un móvil compartido. La misma partida también se abre en tablet y en portátil, y tiene que leerse bien en los tres: no es una app solo de móvil. El flujo es fijo: jugadores, rondas, anotar la ronda en curso, podio. La secuencia de rondas por defecto es la estándar del juego (de «2 tríos» a «3 escaleras», con el número de cartas creciendo). Se puede editar antes de empezar. Al cerrar la última ronda se muestra el podio. «Nueva partida» conserva jugadores y rondas y borra solo las puntuaciones.

## Capabilities and Constraints

- Fases: `setup-players`, `setup-rounds`, `playing`, `podium`.
- Mínimo 2 jugadores para continuar. Mínimo 1 ronda para empezar. No hay máximo definido.
- En la partida se anota la puntuación de la ronda actual y se ve el total acumulado. No hay tabla de todas las rondas.
- Se puede añadir un jugador a mitad de partida. No se editan puntuaciones de rondas ya cerradas.
- Empates comparten posición.
- Persistencia de la partida activa en `localStorage`. No hay historial de partidas terminadas.
- Interfaz en español.
- La mejora de diseño puede cambiar aspecto y usabilidad de esas pantallas. No añade funciones.
- Hay tres anchos de verdad: móvil, tablet y portátil. La información es la misma. Cambia la composición.
- Sin decidir: paleta, tipografía y si el camino de construcción futuro es comp o código.

## Brand Commitments

El nombre es Continental. La interfaz habla en español, de tú, y nombra las rondas como en la mesa. No hay logo, paleta ni voz visual comprometidos.

## Evidence on Hand

- Reglas y flujo en `docs/superpowers/specs/2026-09-03-continental-scoreboard-design.md`.
- Rondas por defecto en `src/utils/defaultRounds.js`.
- Cálculo de totales, clasificación y podio en `src/utils/scoring.js`, con tests.
- No hay fotos, testimonios, ni métricas de uso. No inventarlas.

## Product Principles

- El móvil tiene dos lecturas a la vez: quien anota un número, y la mesa que mira quién va delante.
- Menos puntos es mejor, y la interfaz no puede sugerir lo contrario.
- Una partida activa. Sin cuentas, sin historial, sin servidor.
- Mismas cuatro pantallas. El diseño mejora cómo se usan, no qué saben hacer.
- Se usa en la mesa, con el pulgar y de un vistazo.
